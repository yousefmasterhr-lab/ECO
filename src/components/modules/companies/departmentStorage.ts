import { DepartmentOrg, DepartmentAuditLogEntry, DepartmentAuditChange } from './types';

const STORAGE_KEY = 'eco_departments_org_v2';

/**
 * Field Labels mapping in Arabic for department audit diff presentation
 */
export const DEPARTMENT_FIELD_LABELS: Record<string, string> = {
  nameAr: 'اسم الإدارة / القسم',
  code: 'كود الإدارة التنظيمي',
  headAr: 'المدير المسؤول / رئيس الإدارة',
  staffCount: 'عدد الكادر الوظيفي',
  parentId: 'التبعية الإدارية الهرمية',
  companyId: 'معرف الشركة',
  companyNameAr: 'الشركة التابعة',
  branchId: 'معرف المقر / الموقع',
  branchNameAr: 'المقر / الموقع التابع',
  costCenterCode: 'كود مركز التكلفة المرتبط',
  responsibilities: 'المسؤوليات والمهام الإدارية'
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
  newDept: DepartmentOrg,
  allDepts: DepartmentOrg[] = []
): DepartmentAuditChange[] {
  const changes: DepartmentAuditChange[] = [];

  const scalarFields: (keyof DepartmentOrg)[] = [
    'nameAr',
    'code',
    'headAr',
    'staffCount',
    'companyNameAr',
    'branchNameAr',
    'costCenterCode',
    'responsibilities'
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

  // Re-parenting Event Detection
  const oldParentId = oldDept.parentId || null;
  const newParentId = newDept.parentId || null;
  if (oldParentId !== newParentId) {
    const oldParent = allDepts.find(d => d.id === oldParentId)?.nameAr || 'إدارة عليا مستقلة (جذر الهيكل)';
    const newParent = allDepts.find(d => d.id === newParentId)?.nameAr || 'إدارة عليا مستقلة (جذر الهيكل)';
    changes.push({
      field: 'parentId',
      fieldLabel: 'التبعية الإدارية الهرمية',
      oldValue: oldParent,
      newValue: newParent
    });
  }

  return changes;
}

/**
 * Persistent Storage Repository for Departments & Organizational Hierarchy
 */
export const departmentStorage = {
  /**
   * Synchronously load departments from localStorage
   */
  getDepartmentsSync(): DepartmentOrg[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.warn('[departmentStorage] Failed to read from localStorage:', err);
      return [];
    }
  },

  /**
   * Save departments to localStorage
   */
  saveDepartmentsSync(departments: DepartmentOrg[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(departments));
    } catch (err) {
      console.error('[departmentStorage] Failed to save to localStorage:', err);
    }
  },

  /**
   * Asynchronous load with optional backend sync
   */
  async getDepartments(): Promise<DepartmentOrg[]> {
    const local = departmentStorage.getDepartmentsSync();

    try {
      const res = await fetch('/api/departments', {
        headers: { Accept: 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          departmentStorage.saveDepartmentsSync(data);
          return data;
        }
      }
    } catch {
      // Fallback cleanly to local storage without throwing
    }

    return local;
  },

  /**
   * Create or update a department with audit trail diff
   */
  async saveDepartment(
    deptData: Partial<DepartmentOrg> & { nameAr: string; code: string },
    userName = 'يوسف حجازي'
  ): Promise<{ department: DepartmentOrg; auditEntry?: DepartmentAuditLogEntry }> {
    const list = departmentStorage.getDepartmentsSync();
    const existingIndex = list.findIndex(d => d.id === deptData.id);
    const timestamp = getFormattedAuditTimestamp();

    if (existingIndex >= 0) {
      // UPDATE EXISTING
      const oldDept = list[existingIndex];
      const updatedDept: DepartmentOrg = {
        ...oldDept,
        ...deptData,
        id: oldDept.id,
        updatedAt: timestamp
      };

      // Compute field diff including re-parenting
      const changes = computeDepartmentDiff(oldDept, updatedDept, list);
      let auditEntry: DepartmentAuditLogEntry | undefined;

      const isReparent = (oldDept.parentId || null) !== (updatedDept.parentId || null);

      if (changes.length > 0) {
        auditEntry = {
          id: `audit_dept_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          departmentId: oldDept.id,
          timestamp,
          userName,
          action: isReparent ? 'reparent' : 'update',
          actionLabelAr: isReparent ? 'إعادة هيكلة ونقل تبعية الإدارة' : 'تحديث بيانات الإدارة',
          changes
        };

        updatedDept.auditLogs = [auditEntry, ...(oldDept.auditLogs || [])];
      } else {
        updatedDept.auditLogs = oldDept.auditLogs || [];
      }

      list[existingIndex] = updatedDept;
      departmentStorage.saveDepartmentsSync(list);

      // Async backend sync if available
      try {
        await fetch(`/api/departments/${oldDept.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedDept)
        });
      } catch {
        // Non-blocking
      }

      return { department: updatedDept, auditEntry };
    } else {
      // CREATE NEW
      const newId = deptData.id || `dept_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const parentName = deptData.parentId ? list.find(d => d.id === deptData.parentId)?.nameAr || 'إدارة أعلى' : 'إدارة عليا مستقلة (جذر الهيكل)';

      const initialAudit: DepartmentAuditLogEntry = {
        id: `audit_dept_${Date.now()}_init`,
        departmentId: newId,
        timestamp,
        userName,
        action: 'create',
        actionLabelAr: 'تأسيس الإدارة وإدراجها بالهيكل التنظيمي لأول مرة',
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
          },
          {
            field: 'parentId',
            fieldLabel: 'التبعية الإدارية',
            oldValue: '—',
            newValue: parentName
          }
        ]
      };

      const newDept: DepartmentOrg = {
        id: newId,
        nameAr: deptData.nameAr,
        code: deptData.code,
        headAr: deptData.headAr || 'غير محدد',
        staffCount: Number(deptData.staffCount) || 0,
        subUnits: deptData.subUnits || [],
        responsibilities: deptData.responsibilities || '',
        parentId: deptData.parentId || null,
        companyId: deptData.companyId,
        companyNameAr: deptData.companyNameAr,
        branchId: deptData.branchId,
        branchNameAr: deptData.branchNameAr,
        costCenterCode: deptData.costCenterCode || '',
        auditLogs: [initialAudit],
        createdAt: timestamp,
        updatedAt: timestamp
      };

      const updatedList = [newDept, ...list];
      departmentStorage.saveDepartmentsSync(updatedList);

      // Async backend sync if available
      try {
        await fetch('/api/departments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newDept)
        });
      } catch {
        // Non-blocking
      }

      return { department: newDept, auditEntry: initialAudit };
    }
  },

  /**
   * Delete a department safely (checks if children exist)
   */
  async deleteDepartment(id: string, _userName = 'يوسف حجازي'): Promise<boolean> {
    const list = departmentStorage.getDepartmentsSync();
    
    // Check if this department has active child sub-departments
    const hasChildren = list.some(d => d.parentId === id);
    if (hasChildren) {
      throw new Error('لا يمكن حذف هذه الإدارة لوجود إدارات أو أقسام تابعة لها. يرجى نقل تبعيتها أولاً.');
    }

    const filtered = list.filter(d => d.id !== id);
    departmentStorage.saveDepartmentsSync(filtered);

    try {
      await fetch(`/api/departments/${id}`, {
        method: 'DELETE'
      });
    } catch {
      // Non-blocking
    }

    return true;
  }
};
