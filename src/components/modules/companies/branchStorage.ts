import { BranchLocation, BranchAuditLogEntry, BranchAuditChange } from './types';

const STORAGE_KEY = 'eco_company_branches_v2';

/**
 * Field Labels mapping in Arabic for branch audit diff presentation
 */
export const BRANCH_FIELD_LABELS: Record<string, string> = {
  nameAr: 'اسم المقر / الموقع',
  typeAr: 'نوع الموقع',
  companyNameAr: 'الشركة المالكة',
  cityAr: 'المدينة / المحافظة',
  addressAr: 'العنوان التفصيلي',
  managerAr: 'مدير الموقع',
  phone: 'رقم الهاتف',
  staffCount: 'عدد العاملين بالموقع',
  activeProjects: 'المشاريع الجارية',
  costCenterCode: 'مركز التكلفة المرتبط',
  status: 'حالة الموقع'
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
    'typeAr',
    'companyNameAr',
    'cityAr',
    'addressAr',
    'managerAr',
    'phone',
    'staffCount',
    'activeProjects',
    'costCenterCode',
    'status'
  ];

  for (const field of scalarFields) {
    const oldVal = oldBranch[field];
    const newVal = newBranch[field];

    if (String(oldVal ?? '').trim() !== String(newVal ?? '').trim()) {
      let displayOld = String(oldVal ?? '—');
      let displayNew = String(newVal ?? '—');

      if (field === 'status') {
        displayOld = String(oldVal) === 'نشط' ? 'نشط' : String(oldVal || 'معطل');
        displayNew = String(newVal) === 'نشط' ? 'نشط' : String(newVal || 'معطل');
      }

      changes.push({
        field: String(field),
        fieldLabel: BRANCH_FIELD_LABELS[field] || String(field),
        oldValue: displayOld,
        newValue: displayNew
      });
    }
  }

  return changes;
}

/**
 * Persistent Storage Repository for Branches & Sites (Cloudflare D1 Remote Persistence)
 */
export const branchStorage = {
  /**
   * Synchronously load branches from localStorage cache
   */
  getBranchesSync(): BranchLocation[] {
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
   * Save branches to localStorage cache
   */
  saveBranchesSync(branches: BranchLocation[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(branches));
    } catch (err) {
      console.warn('[branchStorage] Failed to cache branches locally:', err);
    }
  },

  /**
   * Deterministic Remote Fetching from Cloudflare D1 Database
   */
  async getBranches(): Promise<BranchLocation[]> {
    try {
      const res = await fetch('/api/branches', {
        headers: { Accept: 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        const list: BranchLocation[] = Array.isArray(data) ? data : (data.branches || []);
        branchStorage.saveBranchesSync(list);
        return list;
      }
    } catch (err) {
      console.warn('[branchStorage] Remote fetch error from Cloudflare D1, falling back to cache:', err);
    }

    return branchStorage.getBranchesSync();
  },

  /**
   * Create or update a branch/site with remote Cloudflare D1 mutation
   */
  async saveBranch(
    branchData: Partial<BranchLocation> & { nameAr: string; companyId: string; companyNameAr: string },
    userName = 'يوسف حجازي'
  ): Promise<{ branch: BranchLocation; auditEntry?: BranchAuditLogEntry }> {
    const list = branchStorage.getBranchesSync();
    const existingIndex = list.findIndex(b => b.id === branchData.id);
    const timestamp = getFormattedAuditTimestamp();
    const isUpdate = existingIndex >= 0;

    let targetBranch: BranchLocation;
    let auditEntry: BranchAuditLogEntry | undefined;
    let changes: BranchAuditChange[] = [];

    if (isUpdate) {
      const oldBranch = list[existingIndex];
      targetBranch = {
        ...oldBranch,
        ...branchData,
        id: oldBranch.id,
        updatedAt: timestamp
      };

      changes = computeBranchDiff(oldBranch, targetBranch);
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
        targetBranch.auditLogs = [auditEntry, ...(oldBranch.auditLogs || [])];
      }
    } else {
      const newId = branchData.id || `loc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      auditEntry = {
        id: `audit_br_${Date.now()}_init`,
        branchId: newId,
        timestamp,
        userName,
        action: 'create',
        actionLabelAr: 'إضافة وتسجيل المقر لأول مرة',
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
          }
        ]
      };

      targetBranch = {
        id: newId,
        nameAr: branchData.nameAr,
        typeAr: branchData.typeAr || 'فرع رئيسي',
        companyId: branchData.companyId,
        companyNameAr: branchData.companyNameAr,
        addressAr: branchData.addressAr || '',
        cityAr: branchData.cityAr || 'القاهرة',
        managerAr: branchData.managerAr || '',
        phone: branchData.phone || '',
        staffCount: Number(branchData.staffCount ?? 0),
        activeProjects: Number(branchData.activeProjects ?? 0),
        costCenterCode: branchData.costCenterCode,
        status: branchData.status || 'نشط',
        notesAr: branchData.notesAr,
        auditLogs: [auditEntry],
        createdAt: timestamp,
        updatedAt: timestamp
      };
    }

    // Awaited Network Mutation to Cloudflare D1
    try {
      const endpoint = isUpdate ? `/api/branches/${targetBranch.id}` : '/api/branches';
      const method = isUpdate ? 'PUT' : 'POST';
      const payload = isUpdate
        ? { ...targetBranch, changes, userName }
        : { ...targetBranch, userName };

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
        if (json.branch) {
          targetBranch = json.branch;
        }
      } else {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `فشل حفظ المقر في Cloudflare D1 (${res.status})`);
      }
    } catch (err: any) {
      console.warn('[branchStorage] Cloudflare mutation error:', err);
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        console.warn('[branchStorage] Operating in offline mode. Saved to cache.');
      } else {
        throw err;
      }
    }

    // Update local cache
    const currentList = branchStorage.getBranchesSync();
    const idx = currentList.findIndex(b => b.id === targetBranch.id);
    if (idx >= 0) {
      currentList[idx] = targetBranch;
    } else {
      currentList.unshift(targetBranch);
    }
    branchStorage.saveBranchesSync(currentList);

    return { branch: targetBranch, auditEntry };
  },

  /**
   * Delete a branch permanently via Cloudflare D1
   */
  async deleteBranch(id: string, userName = 'يوسف حجازي'): Promise<boolean> {
    try {
      const res = await fetch(`/api/branches/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ deletedBy: userName })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `فشل حذف المقر من Cloudflare D1 (${res.status})`);
      }
    } catch (err: any) {
      console.warn('[branchStorage] Delete mutation error:', err);
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        console.warn('[branchStorage] Operating offline, deleted from cache only.');
      } else {
        throw err;
      }
    }

    const list = branchStorage.getBranchesSync();
    const filtered = list.filter(b => b.id !== id);
    branchStorage.saveBranchesSync(filtered);
    return true;
  }
};
