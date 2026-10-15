import { DepartmentOrg, DepartmentAuditLogEntry, DepartmentAuditChange } from './types';

const STORAGE_KEY = 'eco_company_departments_v2';

/**
 * Field Labels mapping in Arabic for department audit diff presentation
 */
export const DEPARTMENT_FIELD_LABELS: Record<string, string> = {
  nameAr: 'اسم الإدارة / القسم',
  code: 'كود الإدارة',
  headAr: 'المدير المسؤول',
  staffCount: 'عدد الموظفين',
  responsibilities: 'المهام والاختصاصات',
  costCenterCode: 'مركز التكلفة المرتبط',
  parentId: 'الإدارة الرئيسية التابعة لها',
  branchNameAr: 'الفرع / الموقع التابع له'
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
 * Computes field-level difference between old and updated department entities
 */
export function computeDepartmentDiff(
  oldDept: DepartmentOrg,
  newDept: DepartmentOrg
): DepartmentAuditChange[] {
  const changes: DepartmentAuditChange[] = [];

  const scalarFields: (keyof DepartmentOrg)[] = [
    'nameAr',
    'code',
    'headAr',
    'staffCount',
    'responsibilities',
    'costCenterCode',
    'parentId',
    'branchNameAr'
  ];

  for (const field of scalarFields) {
    const oldVal = oldDept[field];
    const newVal = newDept[field];

    if (String(oldVal ?? '').trim() !== String(newVal ?? '').trim()) {
      changes.push({
        field: String(field),
        fieldLabel: DEPARTMENT_FIELD_LABELS[field] || String(field),
        oldValue: String(oldVal ?? '—'),
        newValue: String(newVal ?? '—')
      });
    }
  }

  return changes;
}

/**
 * Persistent Storage Repository for Departments & Org Structure (Cloudflare D1 Remote Persistence)
 */
export const departmentStorage = {
  /**
   * Synchronously load departments from localStorage cache
   */
  getDepartmentsSync(): DepartmentOrg[] {
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
   * Save departments to localStorage cache
   */
  saveDepartmentsSync(departments: DepartmentOrg[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(departments));
    } catch (err) {
      console.warn('[departmentStorage] Failed to cache departments locally:', err);
    }
  },

  /**
   * Deterministic Remote Fetching from Cloudflare D1 Database
   */
  async getDepartments(): Promise<DepartmentOrg[]> {
    try {
      const res = await fetch('/api/departments', {
        headers: { Accept: 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        const list: DepartmentOrg[] = Array.isArray(data) ? data : (data.departments || []);
        departmentStorage.saveDepartmentsSync(list);
        return list;
      }
    } catch (err) {
      console.warn('[departmentStorage] Remote fetch error from Cloudflare D1, falling back to cache:', err);
    }

    return departmentStorage.getDepartmentsSync();
  },

  /**
   * Create or update a department with remote Cloudflare D1 mutation
   */
  async saveDepartment(
    deptData: Partial<DepartmentOrg> & { nameAr: string; code: string },
    userName = 'يوسف حجازي'
  ): Promise<{ department: DepartmentOrg; auditEntry?: DepartmentAuditLogEntry }> {
    const list = departmentStorage.getDepartmentsSync();
    const existingIndex = list.findIndex(d => d.id === deptData.id);
    const timestamp = getFormattedAuditTimestamp();
    const isUpdate = existingIndex >= 0;

    let targetDept: DepartmentOrg;
    let auditEntry: DepartmentAuditLogEntry | undefined;
    let changes: DepartmentAuditChange[] = [];

    if (isUpdate) {
      const oldDept = list[existingIndex];
      targetDept = {
        ...oldDept,
        ...deptData,
        id: oldDept.id,
        updatedAt: timestamp
      };

      changes = computeDepartmentDiff(oldDept, targetDept);
      if (changes.length > 0) {
        auditEntry = {
          id: `audit_dept_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          departmentId: oldDept.id,
          timestamp,
          userName,
          action: 'update',
          actionLabelAr: 'تعديل بيانات وتعيينات الإدارة',
          changes
        };
        targetDept.auditLogs = [auditEntry, ...(oldDept.auditLogs || [])];
      }
    } else {
      const newId = deptData.id || `dept_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      auditEntry = {
        id: `audit_dept_${Date.now()}_init`,
        departmentId: newId,
        timestamp,
        userName,
        action: 'create',
        actionLabelAr: 'إنشاء واستحداث إدارة في الهيكل',
        changes: [
          {
            field: 'nameAr',
            fieldLabel: DEPARTMENT_FIELD_LABELS.nameAr,
            oldValue: '—',
            newValue: deptData.nameAr
          },
          {
            field: 'code',
            fieldLabel: DEPARTMENT_FIELD_LABELS.code,
            oldValue: '—',
            newValue: deptData.code
          }
        ]
      };

      targetDept = {
        id: newId,
        code: deptData.code,
        nameAr: deptData.nameAr,
        headAr: deptData.headAr || '',
        staffCount: deptData.staffCount || 0,
        subUnits: deptData.subUnits || [],
        responsibilities: deptData.responsibilities || '',
        parentId: deptData.parentId !== undefined ? deptData.parentId : null,
        companyId: deptData.companyId,
        companyNameAr: deptData.companyNameAr,
        branchId: deptData.branchId,
        branchNameAr: deptData.branchNameAr,
        costCenterCode: deptData.costCenterCode,
        auditLogs: [auditEntry],
        createdAt: timestamp,
        updatedAt: timestamp
      };
    }

    // Awaited Network Mutation to Cloudflare D1
    try {
      const endpoint = isUpdate ? `/api/departments/${targetDept.id}` : '/api/departments';
      const method = isUpdate ? 'PUT' : 'POST';
      const payload = isUpdate
        ? { ...targetDept, changes, userName }
        : { ...targetDept, userName };

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
        if (json.department) {
          targetDept = json.department;
        }
      } else {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `فشل حفظ الإدارة في Cloudflare D1 (${res.status})`);
      }
    } catch (err: any) {
      console.warn('[departmentStorage] Cloudflare mutation error:', err);
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        console.warn('[departmentStorage] Operating in offline mode. Saved to cache.');
      } else {
        throw err;
      }
    }

    // Update local cache
    const currentList = departmentStorage.getDepartmentsSync();
    const idx = currentList.findIndex(d => d.id === targetDept.id);
    if (idx >= 0) {
      currentList[idx] = targetDept;
    } else {
      currentList.push(targetDept);
    }
    departmentStorage.saveDepartmentsSync(currentList);

    return { department: targetDept, auditEntry };
  },

  /**
   * Delete a department permanently via Cloudflare D1
   */
  async deleteDepartment(id: string, userName = 'يوسف حجازي'): Promise<boolean> {
    try {
      const res = await fetch(`/api/departments/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ deletedBy: userName })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `فشل حذف الإدارة من Cloudflare D1 (${res.status})`);
      }
    } catch (err: any) {
      console.warn('[departmentStorage] Delete mutation error:', err);
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        console.warn('[departmentStorage] Operating offline, deleted from cache only.');
      } else {
        throw err;
      }
    }

    const list = departmentStorage.getDepartmentsSync();
    // Re-parent children to null (root)
    const updated = list
      .filter(d => d.id !== id)
      .map(d => (d.parentId === id ? { ...d, parentId: null } : d));
    departmentStorage.saveDepartmentsSync(updated);
    return true;
  }
};
