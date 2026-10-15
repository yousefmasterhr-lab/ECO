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
 * Persistent Storage Repository for Licenses & Documents (Cloudflare D1 Remote Persistence)
 */
export const licenseStorage = {
  /**
   * Synchronously load licenses from localStorage cache
   */
  getLicensesSync(): SmartDocument[] {
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
   * Save licenses to localStorage cache
   */
  saveLicensesSync(licenses: SmartDocument[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(licenses));
    } catch (err) {
      console.warn('[licenseStorage] Failed to cache licenses locally:', err);
    }
  },

  /**
   * Deterministic Remote Fetching from Cloudflare D1 Database
   */
  async getLicenses(): Promise<SmartDocument[]> {
    try {
      const res = await fetch('/api/licenses', {
        headers: { Accept: 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        const list: SmartDocument[] = Array.isArray(data) ? data : (data.licenses || []);
        licenseStorage.saveLicensesSync(list);
        return list;
      }
    } catch (err) {
      console.warn('[licenseStorage] Remote fetch error from Cloudflare D1, falling back to cache:', err);
    }

    return licenseStorage.getLicensesSync();
  },

  /**
   * Create or update a document/license with remote Cloudflare D1 mutation
   */
  async saveLicense(
    docData: Partial<SmartDocument> & { titleAr: string; companyId: string; companyNameAr: string },
    userName = 'يوسف حجازي'
  ): Promise<{ license: SmartDocument; auditEntry?: DocumentAuditLogEntry }> {
    const list = licenseStorage.getLicensesSync();
    const existingIndex = list.findIndex(d => d.id === docData.id);
    const timestamp = getFormattedAuditTimestamp();
    const isUpdate = existingIndex >= 0;

    let targetDoc: SmartDocument;
    let auditEntry: DocumentAuditLogEntry | undefined;
    let changes: DocumentAuditChange[] = [];

    if (isUpdate) {
      const oldDoc = list[existingIndex];
      targetDoc = {
        ...oldDoc,
        ...docData,
        id: oldDoc.id,
        updatedAt: timestamp
      };

      changes = computeLicenseDiff(oldDoc, targetDoc);
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
        targetDoc.auditLogs = [auditEntry, ...(oldDoc.auditLogs || [])];
      }
    } else {
      const newId = docData.id || `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      auditEntry = {
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

      targetDoc = {
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
        auditLogs: [auditEntry],
        createdAt: timestamp,
        updatedAt: timestamp
      };
    }

    // Awaited Network Mutation to Cloudflare D1
    try {
      const endpoint = isUpdate ? `/api/licenses/${targetDoc.id}` : '/api/licenses';
      const method = isUpdate ? 'PUT' : 'POST';
      const payload = isUpdate
        ? { ...targetDoc, changes, userName }
        : { ...targetDoc, userName };

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
        if (json.license) {
          targetDoc = json.license;
        }
      } else {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `فشل حفظ الترخيص في Cloudflare D1 (${res.status})`);
      }
    } catch (err: any) {
      console.warn('[licenseStorage] Cloudflare mutation error:', err);
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        console.warn('[licenseStorage] Operating in offline mode. Saved to cache.');
      } else {
        throw err;
      }
    }

    // Update local cache
    const currentList = licenseStorage.getLicensesSync();
    const idx = currentList.findIndex(d => d.id === targetDoc.id);
    if (idx >= 0) {
      currentList[idx] = targetDoc;
    } else {
      currentList.unshift(targetDoc);
    }
    licenseStorage.saveLicensesSync(currentList);

    return { license: targetDoc, auditEntry };
  },

  /**
   * Delete a license permanently via Cloudflare D1
   */
  async deleteLicense(id: string, userName = 'يوسف حجازي'): Promise<boolean> {
    try {
      const res = await fetch(`/api/licenses/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ deletedBy: userName })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `فشل حذف الترخيص من Cloudflare D1 (${res.status})`);
      }
    } catch (err: any) {
      console.warn('[licenseStorage] Delete mutation error:', err);
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        console.warn('[licenseStorage] Operating offline, deleted from cache only.');
      } else {
        throw err;
      }
    }

    const list = licenseStorage.getLicensesSync();
    const filtered = list.filter(d => d.id !== id);
    licenseStorage.saveLicensesSync(filtered);
    return true;
  }
};
