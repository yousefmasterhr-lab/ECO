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
 * Connected directly to Cloudflare D1 Remote Database with Offline Read-Only Cache
 */
export const companyStorage = {
  /**
   * Synchronously load cached companies from localStorage (fallback / instant display)
   */
  getCompaniesSync(): CompanyEntity[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  /**
   * Save companies to localStorage cache
   */
  saveCompaniesSync(companies: CompanyEntity[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(companies));
    } catch (err) {
      console.warn('[companyStorage] Failed to cache companies locally:', err);
    }
  },

  /**
   * Deterministic Remote Fetching from Cloudflare D1 Database
   */
  async getCompanies(): Promise<CompanyEntity[]> {
    try {
      const res = await fetch('/api/companies', {
        headers: { Accept: 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        const list: CompanyEntity[] = Array.isArray(data) ? data : (data.companies || []);
        companyStorage.saveCompaniesSync(list);
        return list;
      }
    } catch (err) {
      console.warn('[companyStorage] Remote fetch error from Cloudflare D1, falling back to cache:', err);
    }

    return companyStorage.getCompaniesSync();
  },

  /**
   * Create or update a company entity with remote Cloudflare D1 mutation
   */
  async saveCompany(
    companyData: Partial<CompanyEntity> & { nameAr: string },
    userName = 'يوسف حجازي'
  ): Promise<{ company: CompanyEntity; auditEntry?: CompanyAuditLogEntry }> {
    const list = companyStorage.getCompaniesSync();
    const existingIndex = list.findIndex(c => c.id === companyData.id);
    const timestamp = getFormattedAuditTimestamp();
    const isUpdate = existingIndex >= 0;

    let targetComp: CompanyEntity;
    let auditEntry: CompanyAuditLogEntry | undefined;
    let changes: CompanyAuditChange[] = [];

    if (isUpdate) {
      const oldComp = list[existingIndex];
      targetComp = {
        ...oldComp,
        ...companyData,
        id: oldComp.id,
        updatedAt: timestamp,
        shareholders: companyData.shareholders || oldComp.shareholders || [],
        documents: companyData.documents || oldComp.documents || []
      };

      changes = computeCompanyDiff(oldComp, targetComp);
      if (changes.length > 0) {
        auditEntry = {
          id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          companyId: targetComp.id,
          timestamp,
          userName,
          action: 'update',
          actionLabelAr: 'تحديث بيانات الكيان',
          changes
        };
        targetComp.auditLogs = [auditEntry, ...(oldComp.auditLogs || [])];
      }
    } else {
      const newId = companyData.id || `comp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      auditEntry = {
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
          }
        ]
      };

      targetComp = {
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
        auditLogs: [auditEntry],
        createdAt: timestamp,
        updatedAt: timestamp
      };
    }

    // Awaited Network Mutation to Cloudflare D1
    try {
      const endpoint = isUpdate ? `/api/companies/${targetComp.id}` : '/api/companies';
      const method = isUpdate ? 'PUT' : 'POST';
      const payload = isUpdate
        ? { ...targetComp, changes, userName }
        : { ...targetComp, userName };

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const json = await res.json();
        if (json.company) {
          targetComp = json.company;
        }
      } else {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `فشل الحفظ في قاعدة بيانات D1 (${res.status})`);
      }
    } catch (err: any) {
      console.warn('[companyStorage] Cloudflare mutation error:', err);
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        console.warn('[companyStorage] Operating in offline mode. Saved to cache.');
      } else {
        // In online mode, throw error so UI alerts user and doesn't silently trap in local storage
        throw err;
      }
    }

    // Update local cache
    const currentList = companyStorage.getCompaniesSync();
    const idx = currentList.findIndex(c => c.id === targetComp.id);
    if (idx >= 0) {
      currentList[idx] = targetComp;
    } else {
      currentList.unshift(targetComp);
    }
    companyStorage.saveCompaniesSync(currentList);

    return { company: targetComp, auditEntry };
  },

  /**
   * Delete a company permanently via Cloudflare D1
   */
  async deleteCompany(id: string, userName = 'يوسف حجازي'): Promise<void> {
    try {
      const res = await fetch(`/api/companies/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ deletedBy: userName })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `فشل حذف الشركة من قاعدة بيانات D1 (${res.status})`);
      }
    } catch (err: any) {
      console.warn('[companyStorage] Delete mutation error:', err);
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        console.warn('[companyStorage] Operating offline, deleted from cache only.');
      } else {
        throw err;
      }
    }

    const list = companyStorage.getCompaniesSync();
    const filtered = list.filter(c => c.id !== id);
    companyStorage.saveCompaniesSync(filtered);
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
    return (await companyStorage.saveCompany({ ...oldComp, status: newStatus }, userName)).company;
  }
};
