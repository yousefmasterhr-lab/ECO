import { CompanyEntity, CompanyAuditLogEntry, CompanyAuditChange } from './types';

const STORAGE_KEY = 'eco_companies_directory_v2';

/**
 * Field Labels mapping in Arabic for audit diff presentation
 */
export const FIELD_LABELS: Record<string, string> = {
  nameAr: 'اسم الشركة',
  legalType: 'الشكل القانوني',
  ceoAr: 'المدير المسؤول',
  crNumber: 'رقم السجل التجاري',
  crOffice: 'مكتب السجل التجاري',
  taxNumber: 'البطاقة الضريبية',
  establishedYear: 'سنة التأسيس',
  totalShares: 'إجمالي عدد الأسهم',
  nominalShareValue: 'القيمة الاسمية للسهم',
  issuedCapital: 'رأس المال المصدر',
  status: 'حالة الشركة',
  shareholders: 'هيكل المساهمين',
  documents: 'المستندات والمرفقات'
};

/**
 * Returns formatted local timestamp with exact seconds in Arabic locale
 */
export function getFormattedAuditTimestamp(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * Computes field-level difference between old and updated company entities
 */
export function computeCompanyDiff(
  oldComp: CompanyEntity,
  newComp: CompanyEntity
): CompanyAuditChange[] {
  const changes: CompanyAuditChange[] = [];

  const scalarFields: (keyof CompanyEntity)[] = [
    'nameAr',
    'legalType',
    'ceoAr',
    'crNumber',
    'crOffice',
    'taxNumber',
    'establishedYear',
    'totalShares',
    'nominalShareValue',
    'issuedCapital',
    'status'
  ];

  for (const field of scalarFields) {
    const oldVal = oldComp[field];
    const newVal = newComp[field];

    if (String(oldVal ?? '').trim() !== String(newVal ?? '').trim()) {
      let displayOld = String(oldVal ?? '—');
      let displayNew = String(newVal ?? '—');

      if (field === 'status') {
        displayOld = oldVal === 'active' ? 'نشطة' : 'معطلة';
        displayNew = newVal === 'active' ? 'نشطة' : 'معطلة';
      } else if (field === 'issuedCapital') {
        displayOld = `${Number(oldVal || 0).toLocaleString('ar-EG')} ج.م`;
        displayNew = `${Number(newVal || 0).toLocaleString('ar-EG')} ج.م`;
      }

      changes.push({
        field: String(field),
        fieldLabel: FIELD_LABELS[field] || String(field),
        oldValue: displayOld,
        newValue: displayNew
      });
    }
  }

  // Shareholders changes detection
  const oldShCount = oldComp.shareholders?.length || 0;
  const newShCount = newComp.shareholders?.length || 0;
  const oldShSummary = oldComp.shareholders?.map(s => `${s.name} (${s.ownershipPercent}%)`).join('، ') || 'لا يوجد';
  const newShSummary = newComp.shareholders?.map(s => `${s.name} (${s.ownershipPercent}%)`).join('، ') || 'لا يوجد';

  if (oldShCount !== newShCount || oldShSummary !== newShSummary) {
    changes.push({
      field: 'shareholders',
      fieldLabel: FIELD_LABELS.shareholders,
      oldValue: oldShSummary,
      newValue: newShSummary
    });
  }

  // Document attachment changes detection
  const oldDocCount = oldComp.documents?.length || 0;
  const newDocCount = newComp.documents?.length || 0;
  if (oldDocCount !== newDocCount) {
    changes.push({
      field: 'documents',
      fieldLabel: FIELD_LABELS.documents,
      oldValue: `${oldDocCount} مستندات`,
      newValue: `${newDocCount} مستندات`
    });
  }

  return changes;
}

/**
 * Company Persistent Storage Repository
 */
export const companyStorage = {
  /**
   * Synchronously load companies from localStorage
   */
  getCompaniesSync(): CompanyEntity[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.warn('[companyStorage] Failed to read from localStorage:', err);
      return [];
    }
  },

  /**
   * Save companies to localStorage
   */
  saveCompaniesSync(companies: CompanyEntity[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(companies));
    } catch (err) {
      console.error('[companyStorage] Failed to save to localStorage:', err);
    }
  },

  /**
   * Asynchronous load with API sync fallback
   */
  async getCompanies(): Promise<CompanyEntity[]> {
    // 1. Try local storage first for instant response
    const local = companyStorage.getCompaniesSync();

    // 2. Optionally attempt to fetch from backend API if available
    try {
      const res = await fetch('/api/companies', {
        headers: { Accept: 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          companyStorage.saveCompaniesSync(data);
          return data;
        }
      }
    } catch {
      // Fallback cleanly to local storage without throwing
    }

    return local;
  },

  /**
   * Create or update a company entity with audit trail diff
   */
  async saveCompany(
    companyData: Partial<CompanyEntity> & { nameAr: string },
    userName = 'يوسف حجازي'
  ): Promise<{ company: CompanyEntity; auditEntry?: CompanyAuditLogEntry }> {
    const list = companyStorage.getCompaniesSync();
    const existingIndex = list.findIndex(c => c.id === companyData.id);
    const timestamp = getFormattedAuditTimestamp();

    if (existingIndex >= 0) {
      // UPDATE EXISTING
      const oldComp = list[existingIndex];
      const updatedComp: CompanyEntity = {
        ...oldComp,
        ...companyData,
        id: oldComp.id,
        updatedAt: timestamp,
        shareholders: companyData.shareholders || oldComp.shareholders || [],
        documents: companyData.documents || oldComp.documents || []
      };

      // Compute field diff
      const changes = computeCompanyDiff(oldComp, updatedComp);
      let auditEntry: CompanyAuditLogEntry | undefined;

      if (changes.length > 0) {
        auditEntry = {
          id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          companyId: updatedComp.id,
          timestamp,
          userName,
          action: 'update',
          actionLabelAr: 'تحديث بيانات الكيان',
          changes
        };

        updatedComp.auditLogs = [auditEntry, ...(oldComp.auditLogs || [])];
      } else {
        updatedComp.auditLogs = oldComp.auditLogs || [];
      }

      list[existingIndex] = updatedComp;
      companyStorage.saveCompaniesSync(list);

      // Attempt background backend sync
      try {
        await fetch(`/api/companies/${updatedComp.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedComp)
        }).catch(() => {});
      } catch {}

      return { company: updatedComp, auditEntry };
    } else {
      // CREATE NEW
      const newId = companyData.id || `comp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const creationAuditEntry: CompanyAuditLogEntry = {
        id: `audit_${Date.now()}_init`,
        companyId: newId,
        timestamp,
        userName,
        action: 'create',
        actionLabelAr: 'تسجيل وإنشاء الكيان',
        changes: [
          {
            field: 'nameAr',
            fieldLabel: FIELD_LABELS.nameAr,
            oldValue: '—',
            newValue: companyData.nameAr
          },
          {
            field: 'legalType',
            fieldLabel: FIELD_LABELS.legalType,
            oldValue: '—',
            newValue: companyData.legalType || 'ش.م.م'
          }
        ]
      };

      const newComp: CompanyEntity = {
        id: newId,
        nameAr: companyData.nameAr,
        legalType: companyData.legalType || 'ش.م.م',
        issuedCapital: companyData.issuedCapital || 0,
        paidCapital: companyData.paidCapital || companyData.issuedCapital || 0,
        totalShares: companyData.totalShares || 1000000,
        nominalShareValue: companyData.nominalShareValue || 100,
        crNumber: companyData.crNumber || '',
        crOffice: companyData.crOffice || '',
        taxNumber: companyData.taxNumber || '',
        establishedYear: companyData.establishedYear || String(new Date().getFullYear()),
        ceoAr: companyData.ceoAr || '',
        branchesCount: companyData.branchesCount || 0,
        projectsCount: companyData.projectsCount || 0,
        status: companyData.status || 'active',
        shareholders: companyData.shareholders || [],
        documents: companyData.documents || [],
        auditLogs: [creationAuditEntry],
        createdAt: timestamp,
        updatedAt: timestamp
      };

      list.unshift(newComp);
      companyStorage.saveCompaniesSync(list);

      // Attempt background backend sync
      try {
        await fetch('/api/companies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newComp)
        }).catch(() => {});
      } catch {}

      return { company: newComp, auditEntry: creationAuditEntry };
    }
  },

  /**
   * Delete a company permanently
   */
  async deleteCompany(id: string, userName = 'يوسف حجازي'): Promise<void> {
    const list = companyStorage.getCompaniesSync();
    const filtered = list.filter(c => c.id !== id);
    companyStorage.saveCompaniesSync(filtered);

    // Attempt background backend delete
    try {
      await fetch(`/api/companies/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deletedBy: userName })
      }).catch(() => {});
    } catch {}
  },

  /**
   * Toggle company active/inactive status with audit log entry
   */
  async toggleCompanyStatus(id: string, userName = 'يوسف حجازي'): Promise<CompanyEntity | null> {
    const list = companyStorage.getCompaniesSync();
    const index = list.findIndex(c => c.id === id);
    if (index < 0) return null;

    const oldComp = list[index];
    const newStatus: 'active' | 'inactive' = oldComp.status === 'active' ? 'inactive' : 'active';
    const timestamp = getFormattedAuditTimestamp();

    const auditEntry: CompanyAuditLogEntry = {
      id: `audit_${Date.now()}_status`,
      companyId: id,
      timestamp,
      userName,
      action: 'status_change',
      actionLabelAr: 'تعديل حالة تفعيل الشركة',
      changes: [
        {
          field: 'status',
          fieldLabel: FIELD_LABELS.status,
          oldValue: oldComp.status === 'active' ? 'نشطة' : 'معطلة',
          newValue: newStatus === 'active' ? 'نشطة' : 'معطلة'
        }
      ]
    };

    const updatedComp: CompanyEntity = {
      ...oldComp,
      status: newStatus,
      updatedAt: timestamp,
      auditLogs: [auditEntry, ...(oldComp.auditLogs || [])]
    };

    list[index] = updatedComp;
    companyStorage.saveCompaniesSync(list);

    try {
      await fetch(`/api/companies/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, updatedBy: userName })
      }).catch(() => {});
    } catch {}

    return updatedComp;
  }
};
