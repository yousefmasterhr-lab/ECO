import { BranchLocation, BranchAuditLogEntry, BranchAuditChange } from './types';

const STORAGE_KEY = 'eco_branches_sites_v2';

/**
 * Field Labels mapping in Arabic for branch audit diff presentation
 */
export const BRANCH_FIELD_LABELS: Record<string, string> = {
  nameAr: 'اسم المقر / الموقع',
  companyId: 'معرف الشركة',
  companyNameAr: 'الشركة التابعة',
  typeAr: 'نوع المقر / الموقع',
  cityAr: 'المدينة',
  addressAr: 'العنوان التفصيلي',
  googleMapsUrl: 'رابط الموقع الجغرافي (Google Maps)',
  managerAr: 'المدير المسؤول عن الموقع',
  phone: 'رقم الهاتف',
  staffCount: 'عدد الكادر الوظيفي',
  activeProjects: 'عدد المشاريع الجارية',
  costCenterCode: 'كود مركز التكلفة المرتبط',
  startDate: 'تاريخ بدء الأعمال',
  expectedDeliveryDate: 'تاريخ التسليم المتوقع',
  status: 'حالة الموقع / المقر',
  notesAr: 'ملاحظات'
};

/**
 * Returns formatted local timestamp with exact seconds
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
 * Computes field-level difference between old and updated branch entities
 */
export function computeBranchDiff(
  oldBranch: BranchLocation,
  newBranch: BranchLocation
): BranchAuditChange[] {
  const changes: BranchAuditChange[] = [];

  const scalarFields: (keyof BranchLocation)[] = [
    'nameAr',
    'companyNameAr',
    'typeAr',
    'cityAr',
    'addressAr',
    'googleMapsUrl',
    'managerAr',
    'phone',
    'staffCount',
    'activeProjects',
    'costCenterCode',
    'startDate',
    'expectedDeliveryDate',
    'status',
    'notesAr'
  ];

  for (const field of scalarFields) {
    const oldVal = oldBranch[field];
    const newVal = newBranch[field];

    if (String(oldVal ?? '').trim() !== String(newVal ?? '').trim()) {
      changes.push({
        field: String(field),
        fieldLabel: BRANCH_FIELD_LABELS[field] || String(field),
        oldValue: String(oldVal ?? '—'),
        newValue: String(newVal ?? '—')
      });
    }
  }

  return changes;
}

/**
 * Persistent Storage Repository for Branches & Sites
 */
export const branchStorage = {
  /**
   * Synchronously load branches from localStorage
   */
  getBranchesSync(): BranchLocation[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.warn('[branchStorage] Failed to read from localStorage:', err);
      return [];
    }
  },

  /**
   * Save branches to localStorage
   */
  saveBranchesSync(branches: BranchLocation[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(branches));
    } catch (err) {
      console.error('[branchStorage] Failed to save to localStorage:', err);
    }
  },

  /**
   * Asynchronous load with optional backend sync
   */
  async getBranches(): Promise<BranchLocation[]> {
    const local = branchStorage.getBranchesSync();

    try {
      const res = await fetch('/api/branches', {
        headers: { Accept: 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          branchStorage.saveBranchesSync(data);
          return data;
        }
      }
    } catch {
      // Fallback cleanly to local storage without throwing
    }

    return local;
  },

  /**
   * Create or update a branch/site with audit trail
   */
  async saveBranch(
    branchData: Partial<BranchLocation> & { nameAr: string; companyId: string; companyNameAr: string },
    userName = 'يوسف حجازي'
  ): Promise<{ branch: BranchLocation; auditEntry?: BranchAuditLogEntry }> {
    const list = branchStorage.getBranchesSync();
    const existingIndex = list.findIndex(b => b.id === branchData.id);
    const timestamp = getFormattedAuditTimestamp();

    if (existingIndex >= 0) {
      // UPDATE EXISTING
      const oldBranch = list[existingIndex];
      const updatedBranch: BranchLocation = {
        ...oldBranch,
        ...branchData,
        id: oldBranch.id,
        updatedAt: timestamp
      };

      // Compute field diff
      const changes = computeBranchDiff(oldBranch, updatedBranch);
      let auditEntry: BranchAuditLogEntry | undefined;

      if (changes.length > 0) {
        auditEntry = {
          id: `audit_br_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          branchId: oldBranch.id,
          timestamp,
          userName,
          action: 'update',
          actionLabelAr: 'تحديث بيانات المقر / الموقع',
          changes
        };

        updatedBranch.auditLogs = [auditEntry, ...(oldBranch.auditLogs || [])];
      } else {
        updatedBranch.auditLogs = oldBranch.auditLogs || [];
      }

      list[existingIndex] = updatedBranch;
      branchStorage.saveBranchesSync(list);

      // Async backend sync if available
      try {
        await fetch(`/api/branches/${oldBranch.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedBranch)
        });
      } catch {
        // Non-blocking
      }

      return { branch: updatedBranch, auditEntry };
    } else {
      // CREATE NEW
      const newId = branchData.id || `branch_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const initialAudit: BranchAuditLogEntry = {
        id: `audit_br_${Date.now()}_init`,
        branchId: newId,
        timestamp,
        userName,
        action: 'create',
        actionLabelAr: 'تسجيل المقر / الموقع لأول مرة',
        changes: [
          {
            field: 'nameAr',
            fieldLabel: BRANCH_FIELD_LABELS.nameAr,
            oldValue: '—',
            newValue: branchData.nameAr
          },
          {
            field: 'companyNameAr',
            fieldLabel: BRANCH_FIELD_LABELS.companyNameAr,
            oldValue: '—',
            newValue: branchData.companyNameAr
          },
          {
            field: 'typeAr',
            fieldLabel: BRANCH_FIELD_LABELS.typeAr,
            oldValue: '—',
            newValue: branchData.typeAr || 'فرع إداري'
          }
        ]
      };

      const newBranch: BranchLocation = {
        id: newId,
        companyId: branchData.companyId,
        companyNameAr: branchData.companyNameAr,
        nameAr: branchData.nameAr,
        typeAr: branchData.typeAr || 'فرع إداري',
        cityAr: branchData.cityAr || 'القاهرة',
        addressAr: branchData.addressAr || '',
        googleMapsUrl: branchData.googleMapsUrl || '',
        managerAr: branchData.managerAr || 'غير محدد',
        phone: branchData.phone || '',
        staffCount: Number(branchData.staffCount) || 0,
        activeProjects: Number(branchData.activeProjects) || 0,
        costCenterCode: branchData.costCenterCode || '',
        startDate: branchData.startDate || '',
        expectedDeliveryDate: branchData.expectedDeliveryDate || '',
        status: branchData.status || 'نشط',
        notesAr: branchData.notesAr || '',
        auditLogs: [initialAudit],
        createdAt: timestamp,
        updatedAt: timestamp
      };

      const updatedList = [newBranch, ...list];
      branchStorage.saveBranchesSync(updatedList);

      // Async backend sync if available
      try {
        await fetch('/api/branches', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newBranch)
        });
      } catch {
        // Non-blocking
      }

      return { branch: newBranch, auditEntry: initialAudit };
    }
  },

  /**
   * Delete a branch permanently
   */
  async deleteBranch(id: string, _userName = 'يوسف حجازي'): Promise<boolean> {
    const list = branchStorage.getBranchesSync();
    const filtered = list.filter(b => b.id !== id);
    branchStorage.saveBranchesSync(filtered);

    try {
      await fetch(`/api/branches/${id}`, {
        method: 'DELETE'
      });
    } catch {
      // Non-blocking
    }

    return true;
  }
};
