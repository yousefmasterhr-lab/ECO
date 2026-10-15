import { AuthorizedSignatory, SignatoryAuditLogEntry, SignatoryAuditChange } from './types';

const STORAGE_KEY = 'eco_authorized_signatories_v2';

/**
 * Field Labels mapping in Arabic for audit diff presentation
 */
export const SIGNATORY_FIELD_LABELS: Record<string, string> = {
  nameAr: 'اسم المفوض رسمياً',
  roleAr: 'الصفة / المسمى الوظيفي',
  nationalId: 'رقم بطاقة الرقم القومي',
  companyNameAr: 'الشركة الموكلة',
  poaNumber: 'رقم التوكيل الرسمي وسنته',
  notaryOfficeAr: 'مكتب الشهر العقاري الموثق',
  issueDate: 'تاريخ إصدار التوكيل',
  expiryDate: 'تاريخ انتهاء التوكيل',
  isOpenEnded: 'صلاحية التوكيل (مفتوح / محدد)',
  status: 'حالة سريان التفويض',
  bankingSingleLimit: 'حد التوقيع المصرفي المنفرد',
  bankingJointLimit: 'حد التوقيع المصرفي المشترك',
  bankingLG: 'صلاحية خطابات الضمان (LG)',
  bankingLC: 'صلاحية الاعتمادات المستندية (LC)',
  bankingOpenAcc: 'صلاحية فتح وإدارة الحسابات البنكية',
  contractContracts: 'صلاحية توقيع عقود المقاولات والاتفاقيات',
  contractTenders: 'صلاحية دخول المناقصات والمزايدات',
  contractAssetTrade: 'صلاحية بيع وشراء الأصول والمعدات',
  judicialCourt: 'صلاحية التمثيل أمام المحاكم',
  judicialGov: 'صلاحية التمثيل أمام الهيئات والدوائر الحكومية',
  judicialDispute: 'صلاحية فض المنازعات والتحكيم'
};

/**
 * Returns formatted local timestamp with exact seconds (YYYY-MM-DD HH:mm:ss)
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
 * Computes field-level difference between old and updated signatory entities
 */
export function computeSignatoryDiff(
  oldSig: AuthorizedSignatory,
  newSig: AuthorizedSignatory
): SignatoryAuditChange[] {
  const changes: SignatoryAuditChange[] = [];

  // Scalar Fields
  const scalarFields: (keyof AuthorizedSignatory)[] = [
    'nameAr',
    'roleAr',
    'nationalId',
    'companyNameAr',
    'poaNumber',
    'notaryOfficeAr',
    'issueDate',
    'expiryDate'
  ];

  for (const field of scalarFields) {
    const oldVal = oldSig[field];
    const newVal = newSig[field];
    if (String(oldVal ?? '').trim() !== String(newVal ?? '').trim()) {
      changes.push({
        field: String(field),
        fieldLabel: SIGNATORY_FIELD_LABELS[field] || String(field),
        oldValue: String(oldVal ?? '—'),
        newValue: String(newVal ?? '—')
      });
    }
  }

  // Open-ended toggle
  if (Boolean(oldSig.isOpenEnded) !== Boolean(newSig.isOpenEnded)) {
    changes.push({
      field: 'isOpenEnded',
      fieldLabel: SIGNATORY_FIELD_LABELS.isOpenEnded,
      oldValue: oldSig.isOpenEnded ? 'ساري حتى الإلغاء (غير محدد)' : 'محدد بتاريخ انتهاء',
      newValue: newSig.isOpenEnded ? 'ساري حتى الإلغاء (غير محدد)' : 'محدد بتاريخ انتهاء'
    });
  }

  // Status
  if (oldSig.status !== newSig.status) {
    const statusMap = { active: 'ساري ومعتمد', revoked: 'ملغى رسمياً', expired: 'منتهي الصلاحية' };
    changes.push({
      field: 'status',
      fieldLabel: SIGNATORY_FIELD_LABELS.status,
      oldValue: statusMap[oldSig.status] || oldSig.status,
      newValue: statusMap[newSig.status] || newSig.status
    });
  }

  // Banking limits
  if (oldSig.bankingLimits.singleLimit !== newSig.bankingLimits.singleLimit) {
    changes.push({
      field: 'bankingSingleLimit',
      fieldLabel: SIGNATORY_FIELD_LABELS.bankingSingleLimit,
      oldValue: `${Number(oldSig.bankingLimits.singleLimit).toLocaleString('ar-EG')} ج.م`,
      newValue: `${Number(newSig.bankingLimits.singleLimit).toLocaleString('ar-EG')} ج.م`
    });
  }

  if (oldSig.bankingLimits.jointLimit !== newSig.bankingLimits.jointLimit) {
    changes.push({
      field: 'bankingJointLimit',
      fieldLabel: SIGNATORY_FIELD_LABELS.bankingJointLimit,
      oldValue: `${Number(oldSig.bankingLimits.jointLimit).toLocaleString('ar-EG')} ج.م`,
      newValue: `${Number(newSig.bankingLimits.jointLimit).toLocaleString('ar-EG')} ج.م`
    });
  }

  if (oldSig.bankingLimits.allowLettersOfGuarantee !== newSig.bankingLimits.allowLettersOfGuarantee) {
    changes.push({
      field: 'bankingLG',
      fieldLabel: SIGNATORY_FIELD_LABELS.bankingLG,
      oldValue: oldSig.bankingLimits.allowLettersOfGuarantee ? 'مفعل' : 'معطل',
      newValue: newSig.bankingLimits.allowLettersOfGuarantee ? 'مفعل' : 'معطل'
    });
  }

  if (oldSig.bankingLimits.allowLettersOfCredit !== newSig.bankingLimits.allowLettersOfCredit) {
    changes.push({
      field: 'bankingLC',
      fieldLabel: SIGNATORY_FIELD_LABELS.bankingLC,
      oldValue: oldSig.bankingLimits.allowLettersOfCredit ? 'مفعل' : 'معطل',
      newValue: newSig.bankingLimits.allowLettersOfCredit ? 'مفعل' : 'معطل'
    });
  }

  if (oldSig.bankingLimits.allowOpenAccounts !== newSig.bankingLimits.allowOpenAccounts) {
    changes.push({
      field: 'bankingOpenAcc',
      fieldLabel: SIGNATORY_FIELD_LABELS.bankingOpenAcc,
      oldValue: oldSig.bankingLimits.allowOpenAccounts ? 'مفعل' : 'معطل',
      newValue: newSig.bankingLimits.allowOpenAccounts ? 'مفعل' : 'معطل'
    });
  }

  // Contractual limits
  if (oldSig.contractualLimits.allowContracts !== newSig.contractualLimits.allowContracts) {
    changes.push({
      field: 'contractContracts',
      fieldLabel: SIGNATORY_FIELD_LABELS.contractContracts,
      oldValue: oldSig.contractualLimits.allowContracts ? 'مفعل' : 'معطل',
      newValue: newSig.contractualLimits.allowContracts ? 'مفعل' : 'معطل'
    });
  }

  if (oldSig.contractualLimits.allowTenders !== newSig.contractualLimits.allowTenders) {
    changes.push({
      field: 'contractTenders',
      fieldLabel: SIGNATORY_FIELD_LABELS.contractTenders,
      oldValue: oldSig.contractualLimits.allowTenders ? 'مفعل' : 'معطل',
      newValue: newSig.contractualLimits.allowTenders ? 'مفعل' : 'معطل'
    });
  }

  if (oldSig.contractualLimits.allowAssetTrade !== newSig.contractualLimits.allowAssetTrade) {
    changes.push({
      field: 'contractAssetTrade',
      fieldLabel: SIGNATORY_FIELD_LABELS.contractAssetTrade,
      oldValue: oldSig.contractualLimits.allowAssetTrade ? 'مفعل' : 'معطل',
      newValue: newSig.contractualLimits.allowAssetTrade ? 'مفعل' : 'معطل'
    });
  }

  // Judicial limits
  if (oldSig.judicialLimits.allowCourtRepresentation !== newSig.judicialLimits.allowCourtRepresentation) {
    changes.push({
      field: 'judicialCourt',
      fieldLabel: SIGNATORY_FIELD_LABELS.judicialCourt,
      oldValue: oldSig.judicialLimits.allowCourtRepresentation ? 'مفعل' : 'معطل',
      newValue: newSig.judicialLimits.allowCourtRepresentation ? 'مفعل' : 'معطل'
    });
  }

  if (oldSig.judicialLimits.allowGovRepresentation !== newSig.judicialLimits.allowGovRepresentation) {
    changes.push({
      field: 'judicialGov',
      fieldLabel: SIGNATORY_FIELD_LABELS.judicialGov,
      oldValue: oldSig.judicialLimits.allowGovRepresentation ? 'مفعل' : 'معطل',
      newValue: newSig.judicialLimits.allowGovRepresentation ? 'مفعل' : 'معطل'
    });
  }

  if (oldSig.judicialLimits.allowDisputeResolution !== newSig.judicialLimits.allowDisputeResolution) {
    changes.push({
      field: 'judicialDispute',
      fieldLabel: SIGNATORY_FIELD_LABELS.judicialDispute,
      oldValue: oldSig.judicialLimits.allowDisputeResolution ? 'مفعل' : 'معطل',
      newValue: newSig.judicialLimits.allowDisputeResolution ? 'مفعل' : 'معطل'
    });
  }

  // File Attachment
  const oldDocName = oldSig.poaAttachment?.name || '';
  const newDocName = newSig.poaAttachment?.name || '';
  if (oldDocName !== newDocName) {
    changes.push({
      field: 'poaAttachment',
      fieldLabel: 'صورة التوكيل الموثق المرفقة',
      oldValue: oldDocName || 'لا يوجد ملف مرفق',
      newValue: newDocName || 'تم حذف المرفق'
    });
  }

  return changes;
}

/**
 * Persistent Storage Repository for Authorized Signatories & Powers of Attorney
 */
export const signatoryStorage = {
  /**
   * Synchronously load signatories from localStorage
   */
  getSignatoriesSync(): AuthorizedSignatory[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.warn('[signatoryStorage] Failed to read from localStorage:', err);
      return [];
    }
  },

  /**
   * Save signatories to localStorage
   */
  saveSignatoriesSync(signatories: AuthorizedSignatory[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(signatories));
    } catch (err) {
      console.error('[signatoryStorage] Failed to save to localStorage:', err);
    }
  },

  /**
   * Asynchronous load with optional backend sync
  /**
   * Deterministic Remote Fetching from Cloudflare D1 Database
   */
  async getSignatories(): Promise<AuthorizedSignatory[]> {
    try {
      const res = await fetch('/api/authorized-persons', {
        headers: { Accept: 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        const list: AuthorizedSignatory[] = Array.isArray(data) ? data : (data.signatories || []);
        signatoryStorage.saveSignatoriesSync(list);
        return list;
      }
    } catch (err) {
      console.warn('[signatoryStorage] Remote fetch error from Cloudflare D1, falling back to cache:', err);
    }

    return signatoryStorage.getSignatoriesSync();
  },

  /**
   * Create or update an authorized signatory with remote Cloudflare D1 mutation
   */
  async saveSignatory(
    sigData: Partial<AuthorizedSignatory> & {
      nameAr: string;
      roleAr: string;
      companyId: string;
      companyNameAr: string;
      poaNumber: string;
    },
    userName = 'يوسف حجازي'
  ): Promise<{ signatory: AuthorizedSignatory; auditEntry?: SignatoryAuditLogEntry }> {
    const list = signatoryStorage.getSignatoriesSync();
    const existingIndex = list.findIndex(s => s.id === sigData.id);
    const timestamp = getFormattedAuditTimestamp();
    const isUpdate = existingIndex >= 0;

    let targetSig: AuthorizedSignatory;
    let auditEntry: SignatoryAuditLogEntry | undefined;
    let changes: SignatoryAuditChange[] = [];

    if (isUpdate) {
      const oldSig = list[existingIndex];
      targetSig = {
        ...oldSig,
        ...sigData,
        id: oldSig.id,
        bankingLimits: sigData.bankingLimits || oldSig.bankingLimits,
        contractualLimits: sigData.contractualLimits || oldSig.contractualLimits,
        judicialLimits: sigData.judicialLimits || oldSig.judicialLimits,
        updatedAt: timestamp
      };

      changes = computeSignatoryDiff(oldSig, targetSig);
      if (changes.length > 0) {
        auditEntry = {
          id: `audit_sig_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          signatoryId: oldSig.id,
          timestamp,
          userName,
          action: 'update',
          actionLabelAr: 'تحديث بيانات وصلاحيات المفوض',
          changes
        };
        targetSig.auditLogs = [auditEntry, ...(oldSig.auditLogs || [])];
      }
    } else {
      const newId = sigData.id || `sig_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      auditEntry = {
        id: `audit_sig_${Date.now()}_init`,
        signatoryId: newId,
        timestamp,
        userName,
        action: 'create',
        actionLabelAr: 'إصدار واعتماد التفويض رسمياً لأول مرة',
        changes: [
          {
            field: 'nameAr',
            fieldLabel: SIGNATORY_FIELD_LABELS.nameAr,
            oldValue: '—',
            newValue: sigData.nameAr
          },
          {
            field: 'roleAr',
            fieldLabel: SIGNATORY_FIELD_LABELS.roleAr,
            oldValue: '—',
            newValue: sigData.roleAr
          },
          {
            field: 'companyNameAr',
            fieldLabel: SIGNATORY_FIELD_LABELS.companyNameAr,
            oldValue: '—',
            newValue: sigData.companyNameAr
          },
          {
            field: 'poaNumber',
            fieldLabel: SIGNATORY_FIELD_LABELS.poaNumber,
            oldValue: '—',
            newValue: sigData.poaNumber
          }
        ]
      };

      targetSig = {
        id: newId,
        nameAr: sigData.nameAr,
        roleAr: sigData.roleAr,
        nationalId: sigData.nationalId || '',
        companyId: sigData.companyId,
        companyNameAr: sigData.companyNameAr,
        poaNumber: sigData.poaNumber,
        notaryOfficeAr: sigData.notaryOfficeAr || 'مكتب الشهر العقاري المختص',
        issueDate: sigData.issueDate || new Date().toISOString().slice(0, 10),
        expiryDate: sigData.expiryDate || '',
        isOpenEnded: Boolean(sigData.isOpenEnded),
        driveDocUrl: sigData.driveDocUrl || '',
        status: (sigData.status as any) || 'active',
        bankingLimits: sigData.bankingLimits || {
          singleLimit: 0,
          jointLimit: 0,
          allowLettersOfGuarantee: false,
          allowLettersOfCredit: false,
          allowOpenAccounts: false,
          notesAr: ''
        },
        contractualLimits: sigData.contractualLimits || {
          allowContracts: false,
          allowTenders: false,
          allowAssetTrade: false,
          notesAr: ''
        },
        judicialLimits: sigData.judicialLimits || {
          allowCourtRepresentation: false,
          allowGovRepresentation: false,
          allowDisputeResolution: false,
          notesAr: ''
        },
        poaAttachment: sigData.poaAttachment,
        auditLogs: [auditEntry],
        createdAt: timestamp,
        updatedAt: timestamp
      };
    }

    // Awaited Network Mutation to Cloudflare D1
    try {
      const endpoint = isUpdate ? `/api/authorized-persons/${targetSig.id}` : '/api/authorized-persons';
      const method = isUpdate ? 'PUT' : 'POST';
      const payload = isUpdate
        ? { ...targetSig, changes, userName }
        : { ...targetSig, userName };

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
        if (json.signatory) {
          targetSig = json.signatory;
        }
      } else {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `فشل حفظ بيانات المفوض في Cloudflare D1 (${res.status})`);
      }
    } catch (err: any) {
      console.warn('[signatoryStorage] Cloudflare mutation error:', err);
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        console.warn('[signatoryStorage] Operating in offline mode. Saved to cache.');
      } else {
        throw err;
      }
    }

    // Update local cache
    const currentList = signatoryStorage.getSignatoriesSync();
    const idx = currentList.findIndex(s => s.id === targetSig.id);
    if (idx >= 0) {
      currentList[idx] = targetSig;
    } else {
      currentList.unshift(targetSig);
    }
    signatoryStorage.saveSignatoriesSync(currentList);

    return { signatory: targetSig, auditEntry };
  },

  /**
   * Toggle revoke/activate status with audit entry via Cloudflare D1
   */
  async toggleRevoke(id: string, userName = 'يوسف حجازي'): Promise<AuthorizedSignatory> {
    const list = signatoryStorage.getSignatoriesSync();
    const index = list.findIndex(s => s.id === id);
    if (index === -1) throw new Error('المفوض غير موجود');

    const target = list[index];
    const newStatus: AuthorizedSignatory['status'] = target.status === 'active' ? 'revoked' : 'active';
    return (await signatoryStorage.saveSignatory({ ...target, status: newStatus }, userName)).signatory;
  },

  /**
   * Delete signatory permanently via Cloudflare D1
   */
  async deleteSignatory(id: string, userName = 'يوسف حجازي'): Promise<boolean> {
    try {
      const res = await fetch(`/api/authorized-persons/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ deletedBy: userName })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `فشل حذف المفوض من Cloudflare D1 (${res.status})`);
      }
    } catch (err: any) {
      console.warn('[signatoryStorage] Delete mutation error:', err);
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        console.warn('[signatoryStorage] Operating offline, deleted from cache only.');
      } else {
        throw err;
      }
    }

    const list = signatoryStorage.getSignatoriesSync();
    const filtered = list.filter(s => s.id !== id);
    signatoryStorage.saveSignatoriesSync(filtered);
    return true;
  }
};
