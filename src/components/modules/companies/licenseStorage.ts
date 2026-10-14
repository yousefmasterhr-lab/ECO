import { SmartDocument, DocumentAuditLogEntry, DocumentAuditChange } from './types';

const STORAGE_KEY = 'eco_company_licenses_v2';

/**
 * Field Labels mapping in Arabic for license audit diff presentation
 */
export const LICENSE_FIELD_LABELS: Record<string, string> = {
  titleAr: 'اسم المستند / الترخيص',
  companyId: 'معرف الشركة',
  companyNameAr: 'الشركة التابعة',
  docType: 'نوع المستند',
  docNumber: 'رقم القيد / الوثيقة',
  issuerAr: 'جهة الإصدار',
  issueDate: 'تاريخ الإصدار',
  expiryDate: 'تاريخ الانتهاء',
  driveUrl: 'رابط الأرشيف السحابي',
  notesAr: 'ملاحظات التجديد والمتابعة',
  fileAttachment: 'الملف المرفق'
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
 * Computes field-level difference between old and updated license entities
 */
export function computeLicenseDiff(
  oldDoc: SmartDocument,
  newDoc: SmartDocument
): DocumentAuditChange[] {
  const changes: DocumentAuditChange[] = [];

  const scalarFields: (keyof SmartDocument)[] = [
    'titleAr',
    'companyNameAr',
    'docType',
    'docNumber',
    'issuerAr',
    'issueDate',
    'expiryDate',
    'driveUrl',
    'notesAr'
  ];

  for (const field of scalarFields) {
    const oldVal = oldDoc[field];
    const newVal = newDoc[field];

    if (String(oldVal ?? '').trim() !== String(newVal ?? '').trim()) {
      changes.push({
        field: String(field),
        fieldLabel: LICENSE_FIELD_LABELS[field] || String(field),
        oldValue: String(oldVal ?? '—'),
        newValue: String(newVal ?? '—')
      });
    }
  }

  // Check file attachment change
  const oldFile = oldDoc.fileAttachment?.name;
  const newFile = newDoc.fileAttachment?.name;
  if (oldFile !== newFile) {
    changes.push({
      field: 'fileAttachment',
      fieldLabel: LICENSE_FIELD_LABELS.fileAttachment,
      oldValue: oldFile ? `ملف: ${oldFile}` : 'لا يوجد ملف مرفق',
      newValue: newFile ? `ملف: ${newFile}` : 'تمت إزالة الملف'
    });
  }

  return changes;
}

/**
 * Persistent Storage Repository for Licenses & Documents
 */
export const licenseStorage = {
  /**
   * Synchronously load licenses from localStorage
   */
  getLicensesSync(): SmartDocument[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.warn('[licenseStorage] Failed to read from localStorage:', err);
      return [];
    }
  },

  /**
   * Save licenses to localStorage
   */
  saveLicensesSync(licenses: SmartDocument[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(licenses));
    } catch (err) {
      console.error('[licenseStorage] Failed to save to localStorage:', err);
    }
  },

  /**
   * Asynchronous load with optional backend sync
   */
  async getLicenses(): Promise<SmartDocument[]> {
    const local = licenseStorage.getLicensesSync();

    try {
      const res = await fetch('/api/licenses', {
        headers: { Accept: 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          licenseStorage.saveLicensesSync(data);
          return data;
        }
      }
    } catch {
      // Fallback cleanly to local storage without throwing
    }

    return local;
  },

  /**
   * Create or update a document/license with audit trail
   */
  async saveLicense(
    docData: Partial<SmartDocument> & { titleAr: string; companyId: string; companyNameAr: string },
    userName = 'يوسف حجازي'
  ): Promise<{ license: SmartDocument; auditEntry?: DocumentAuditLogEntry }> {
    const list = licenseStorage.getLicensesSync();
    const existingIndex = list.findIndex(d => d.id === docData.id);
    const timestamp = getFormattedAuditTimestamp();

    if (existingIndex >= 0) {
      // UPDATE EXISTING
      const oldDoc = list[existingIndex];
      const updatedDoc: SmartDocument = {
        ...oldDoc,
        ...docData,
        id: oldDoc.id,
        updatedAt: timestamp
      };

      // Compute field diff
      const changes = computeLicenseDiff(oldDoc, updatedDoc);
      let auditEntry: DocumentAuditLogEntry | undefined;

      if (changes.length > 0) {
        auditEntry = {
          id: `audit_lic_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          documentId: oldDoc.id,
          timestamp,
          userName,
          action: 'update',
          actionLabelAr: 'تحديث بيانات المستند / الترخيص',
          changes
        };

        updatedDoc.auditLogs = [auditEntry, ...(oldDoc.auditLogs || [])];
      } else {
        updatedDoc.auditLogs = oldDoc.auditLogs || [];
      }

      list[existingIndex] = updatedDoc;
      licenseStorage.saveLicensesSync(list);

      // Async backend sync if available
      try {
        await fetch(`/api/licenses/${oldDoc.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedDoc)
        });
      } catch {
        // Non-blocking
      }

      return { license: updatedDoc, auditEntry };
    } else {
      // CREATE NEW
      const newId = docData.id || `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const initialAudit: DocumentAuditLogEntry = {
        id: `audit_lic_${Date.now()}_init`,
        documentId: newId,
        timestamp,
        userName,
        action: 'create',
        actionLabelAr: 'تسجيل وإيداع المستند / الترخيص لأول مرة',
        changes: [
          {
            field: 'titleAr',
            fieldLabel: LICENSE_FIELD_LABELS.titleAr,
            oldValue: '—',
            newValue: docData.titleAr
          },
          {
            field: 'companyNameAr',
            fieldLabel: LICENSE_FIELD_LABELS.companyNameAr,
            oldValue: '—',
            newValue: docData.companyNameAr
          },
          {
            field: 'docNumber',
            fieldLabel: LICENSE_FIELD_LABELS.docNumber,
            oldValue: '—',
            newValue: docData.docNumber || '—'
          }
        ]
      };

      const newDoc: SmartDocument = {
        id: newId,
        companyId: docData.companyId,
        companyNameAr: docData.companyNameAr,
        docType: docData.docType || 'سجل تجاري',
        titleAr: docData.titleAr,
        docNumber: docData.docNumber || `DOC-${Date.now().toString().slice(-5)}`,
        issuerAr: docData.issuerAr || 'الجهة الحكومية المختصة',
        issueDate: docData.issueDate || new Date().toISOString().slice(0, 10),
        expiryDate: docData.expiryDate || new Date().toISOString().slice(0, 10),
        driveUrl: docData.driveUrl || '',
        notesAr: docData.notesAr || '',
        fileAttachment: docData.fileAttachment,
        auditLogs: [initialAudit],
        createdAt: timestamp,
        updatedAt: timestamp
      };

      const updatedList = [newDoc, ...list];
      licenseStorage.saveLicensesSync(updatedList);

      // Async backend sync if available
      try {
        await fetch('/api/licenses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newDoc)
        });
      } catch {
        // Non-blocking
      }

      return { license: newDoc, auditEntry: initialAudit };
    }
  },

  /**
   * Delete a license permanently
   */
  async deleteLicense(id: string, _userName = 'يوسف حجازي'): Promise<boolean> {
    const list = licenseStorage.getLicensesSync();
    const filtered = list.filter(d => d.id !== id);
    licenseStorage.saveLicensesSync(filtered);

    try {
      await fetch(`/api/licenses/${id}`, {
        method: 'DELETE'
      });
    } catch {
      // Non-blocking
    }

    return true;
  }
};
