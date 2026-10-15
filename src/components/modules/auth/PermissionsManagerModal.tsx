import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import {
  ManagedUser,
  ALL_COMPANY_PERMISSIONS
} from '../../../types/auth';
import {
  X,
  ShieldCheck,
  Check,
  Save,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Users,
  Building2,
  Eye,
  PlusCircle,
  Pencil,
  FileText,
  Clock,
  Trash2,
  ShieldAlert,
  UserPlus
} from 'lucide-react';

interface PermissionsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MatrixRowConfig {
  id: string;
  titleAr: string;
  descriptionAr: string;
  viewKey: string;
  createKey: string;
  editKey: string;
  specialKeys: { key: string; labelAr: string }[];
  auditKey: string;
  deleteKey: string;
}

const SUBMODULE_ROWS: MatrixRowConfig[] = [
  {
    id: 'directory',
    titleAr: 'دليل الشركات والمساهمين',
    descriptionAr: 'بيانات الشركات القانونية والمالية ونسب المساهمين وحالة النشاط',
    viewKey: 'companies.directory.view',
    createKey: 'companies.directory.create',
    editKey: 'companies.directory.edit',
    specialKeys: [
      { key: 'companies.directory.toggle_status', labelAr: 'تفعيل/إيقاف' },
      { key: 'companies.directory.view_docs', labelAr: 'المستندات' },
    ],
    auditKey: 'companies.directory.view_audit',
    deleteKey: 'companies.directory.delete',
  },
  {
    id: 'licenses',
    titleAr: 'السجلات والتراخيص والوثائق',
    descriptionAr: 'السجل التجاري، البطاقة الضريبية، رخص التشغيل وتنبيهات الانتهاء',
    viewKey: 'companies.licenses.view',
    createKey: 'companies.licenses.create',
    editKey: 'companies.licenses.edit',
    specialKeys: [
      { key: 'companies.licenses.download', labelAr: 'معاينة وتحميل' },
    ],
    auditKey: 'companies.licenses.view_audit',
    deleteKey: 'companies.licenses.delete',
  },
  {
    id: 'branches',
    titleAr: 'الفروع والمواقع والمشاريع',
    descriptionAr: 'المقرات الإدارية، الفروع الإقليمية، المستودعات ومواقع العمليات',
    viewKey: 'companies.branches.view',
    createKey: 'companies.branches.create',
    editKey: 'companies.branches.edit',
    specialKeys: [],
    auditKey: 'companies.branches.view_audit',
    deleteKey: 'companies.branches.delete',
  },
  {
    id: 'org_structure',
    titleAr: 'الهيكل التنظيمي ومراكز التكلفة',
    descriptionAr: 'الشجرة الهرمية للإدارات والأقسام وربط مراكز التكلفة والمسؤوليات',
    viewKey: 'companies.org.view',
    createKey: 'companies.org.create',
    editKey: 'companies.org.edit',
    specialKeys: [],
    auditKey: 'companies.org.view_audit',
    deleteKey: 'companies.org.delete',
  },
  {
    id: 'signatories',
    titleAr: 'المفوضون والصلاحيات البنكية',
    descriptionAr: 'التوكيلات بالشهر العقاري وأسقف التوقيع البنكية والتعاقدية',
    viewKey: 'companies.signatories.view',
    createKey: 'companies.signatories.create',
    editKey: 'companies.signatories.edit',
    specialKeys: [
      { key: 'companies.signatories.download_poa', labelAr: 'تحميل التوكيل' },
    ],
    auditKey: 'companies.signatories.view_audit',
    deleteKey: 'companies.signatories.delete',
  },
];

export const PermissionsManagerModal: React.FC<PermissionsManagerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { managedUsers, updateUserPermissions, addManagedUser } = useAuth();
  const { t } = useLanguage();

  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // New User Quick Create Modal State
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUserNameAr, setNewUserNameAr] = useState('');
  const [newUserJobTitle, setNewUserJobTitle] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');

  // Default selection to first user on open
  useEffect(() => {
    if (isOpen && managedUsers.length > 0) {
      if (!selectedUserId || !managedUsers.some(u => u.id === selectedUserId)) {
        const first = managedUsers[0];
        setSelectedUserId(first.id);
        setUserPermissions(first.permissions || first.customPermissions || []);
      }
    }
  }, [isOpen, managedUsers, selectedUserId]);

  // When switching selected user, load their permissions
  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId);
    setErrorMessage(null);
    setSuccessMessage(null);
    const target = managedUsers.find(u => u.id === userId);
    if (target) {
      if (target.role === 'SUPER_ADMIN' || target.id === 'usr_root_csuite_01') {
        setUserPermissions([...ALL_COMPANY_PERMISSIONS]);
      } else {
        setUserPermissions(target.permissions || target.customPermissions || []);
      }
    }
  };

  if (!isOpen) return null;

  const targetUser: ManagedUser | undefined = managedUsers.find(u => u.id === selectedUserId);
  const isSuperAdminTarget =
    targetUser?.role === 'SUPER_ADMIN' || targetUser?.id === 'usr_root_csuite_01';

  // Toggle single permission key
  const togglePermission = (key: string) => {
    if (isSuperAdminTarget) return; // Super admin permissions cannot be partially revoked
    setUserPermissions(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  // Toggle entire row (submodule)
  const toggleRow = (row: MatrixRowConfig) => {
    if (isSuperAdminTarget) return;
    const rowKeys = [
      row.viewKey,
      row.createKey,
      row.editKey,
      ...row.specialKeys.map(s => s.key),
      row.auditKey,
      row.deleteKey,
    ];
    const allSelected = rowKeys.every(k => userPermissions.includes(k));

    if (allSelected) {
      setUserPermissions(prev => prev.filter(k => !rowKeys.includes(k)));
    } else {
      setUserPermissions(prev => Array.from(new Set([...prev, ...rowKeys])));
    }
  };

  // Bulk actions
  const grantAll = () => {
    if (isSuperAdminTarget) return;
    setUserPermissions([...ALL_COMPANY_PERMISSIONS]);
  };

  const revokeAll = () => {
    if (isSuperAdminTarget) return;
    setUserPermissions([]);
  };

  const grantReadOnly = () => {
    if (isSuperAdminTarget) return;
    const viewOnlyKeys = SUBMODULE_ROWS.map(r => r.viewKey);
    setUserPermissions(viewOnlyKeys);
  };

  // Save changes
  const handleSave = async () => {
    if (!selectedUserId) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await updateUserPermissions(selectedUserId, userPermissions);
      if (res.success) {
        setSuccessMessage(t('تم حفظ وتحديث مصفوفة الصلاحيات بنجاح في قاعدة البيانات', 'Permissions matrix saved successfully'));
        setTimeout(() => {
          setSuccessMessage(null);
        }, 2000);
      } else {
        setErrorMessage(res.error || t('فشل حفظ الصلاحيات', 'Failed to save permissions'));
      }
    } catch (err: any) {
      setErrorMessage(err?.message || t('حدث خطأ غير متوقع', 'Unexpected error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Create User
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserNameAr.trim() || !newUserEmail.trim() || !newUserPassword.trim()) {
      return;
    }

    const created = addManagedUser({
      nameAr: newUserNameAr.trim(),
      nameEn: newUserNameAr.trim(),
      nationalId: `29${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      email: newUserEmail.trim(),
      username: newUserEmail.split('@')[0],
      jobTitleAr: newUserJobTitle.trim() || 'موظف بالنظام',
      jobTitleEn: newUserJobTitle.trim() || 'System Staff',
      phone: '+20 100 000 0000',
      departmentAr: 'الشؤون الإدارية',
      departmentEn: 'Administration',
      departmentId: 'admin',
      role: 'HR_SPECIALIST',
      roleLabelAr: newUserJobTitle.trim() || 'موظف بالنظام',
      roleLabelEn: 'Staff',
      clearanceLevel: 2,
      clearanceNameAr: 'المستوى 2 - موظف',
      clearanceNameEn: 'Level 2 - Staff',
      status: 'ACTIVE',
      passwordHash: newUserPassword,
      customPermissions: [
        'companies.directory.view',
        'companies.licenses.view',
        'companies.branches.view',
        'companies.org.view',
        'companies.signatories.view',
      ],
      permissions: [
        'companies.directory.view',
        'companies.licenses.view',
        'companies.branches.view',
        'companies.org.view',
        'companies.signatories.view',
      ],
    });

    setShowAddUser(false);
    setNewUserNameAr('');
    setNewUserJobTitle('');
    setNewUserEmail('');
    setNewUserPassword('');
    handleSelectUser(created.id);
  };

  return (
    <div
      className="fixed inset-0 !m-0 !top-0 !left-0 !right-0 !bottom-0 w-screen h-screen z-[999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-5xl rounded-2xl bg-[#FBF9F5] dark:bg-[#121B14] border border-[#E0D9CB] dark:border-[#243628] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in-50 zoom-in-95 duration-150 my-auto text-start"
        style={{ colorScheme: 'light' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1C291E] to-[#D99B26] text-white flex items-center justify-center font-bold shadow-xs">
              <ShieldCheck className="w-5 h-5 text-[#FBF9F5]" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#1A241C] dark:text-[#F3EFE6] flex items-center gap-2">
                <span>{t('إدارة المستخدمين ومصفوفة الصلاحيات التفصيلية', 'Granular Action-Level Permissions Matrix')}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D99B26]/15 text-[#D99B26] dark:text-[#EBB34D] border border-[#D99B26]/30">
                  {t('إدارة الشركات', 'Company Suite')}
                </span>
              </h3>
              <p className="text-xs text-[#5C665E] dark:text-[#8FA392]">
                {t('التحكم في أزرار وإجراءات وتبويبات النظام لكل مستخدم وحفظها في Cloudflare D1', 'Control action buttons, tabs and view access persisted per user')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#5C665E] dark:text-[#8FA392] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Top Control Bar: User Selector & Quick Actions */}
        <div className="p-4 border-b border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#121B14] flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* User Selector Dropdown */}
          <div className="flex items-center gap-2 flex-1 min-w-[280px]">
            <Users className="w-4 h-4 text-[#D99B26] dark:text-[#EBB34D] shrink-0" />
            <span className="text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] shrink-0">
              {t('اختر المستخدم:', 'Target User:')}
            </span>
            <select
              value={selectedUserId}
              onChange={e => handleSelectUser(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#17231A] text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none focus:border-[#D99B26] dark:focus:border-[#EBB34D]"
            >
              {managedUsers.map(u => (
                <option key={u.id} value={u.id}>
                  {u.nameAr} ({u.jobTitleAr || u.roleLabelAr}) - {u.email}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setShowAddUser(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#EAE4D7] dark:bg-[#1A261D] hover:bg-[#E0D9CB] text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] transition-colors shrink-0"
              title="إضافة مستخدم جديد"
            >
              <UserPlus className="w-3.5 h-3.5 text-[#D99B26]" />
              <span className="hidden sm:inline">{t('+ مستخدم جديد', '+ Add User')}</span>
            </button>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={grantAll}
              disabled={isSuperAdminTarget}
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 transition-colors disabled:opacity-50"
            >
              {t('منح الكل', 'Grant All')}
            </button>
            <button
              type="button"
              onClick={grantReadOnly}
              disabled={isSuperAdminTarget}
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-400 border border-blue-500/30 transition-colors disabled:opacity-50"
            >
              {t('عرض فقط', 'Read Only')}
            </button>
            <button
              type="button"
              onClick={revokeAll}
              disabled={isSuperAdminTarget}
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-500/30 transition-colors disabled:opacity-50"
            >
              {t('سحب الكل', 'Revoke All')}
            </button>
          </div>
        </div>

        {/* Super Admin Notice */}
        {isSuperAdminTarget && (
          <div className="mx-4 mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2.5 text-xs font-bold text-amber-800 dark:text-amber-400 shrink-0">
            <ShieldAlert className="w-5 h-5 shrink-0 text-[#D99B26]" />
            <span>
              {t(
                'حساب مدير النظام العام / رئيس مجلس الإدارة يتمتع بصلاحيات كاملة غير مقيدة لكافة شاشات وأزرار النظام كجهة سيادية عليا.',
                'Super Administrator holds permanent unrestricted access across all actions and views by sovereign mandate.'
              )}
            </span>
          </div>
        )}

        {/* Feedback Messages */}
        {errorMessage && (
          <div className="mx-4 mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs font-bold shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mx-4 mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold shrink-0">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Matrix Grid Table */}
        <div className="flex-1 overflow-auto p-4">
          <div className="min-w-[760px] border border-[#E0D9CB] dark:border-[#243628] rounded-xl overflow-hidden bg-white dark:bg-[#17231A]">
            <table className="w-full text-xs text-start border-collapse">
              <thead>
                <tr className="bg-[#EAE4D7] dark:bg-[#1A261D] border-b border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] font-bold">
                  <th className="p-3 text-start w-72">{t('القسم / التبويب الفرعي', 'Module / Tab')}</th>
                  <th className="p-2.5 text-center w-20">
                    <span className="flex items-center justify-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>{t('عرض', 'View')}</span>
                    </span>
                  </th>
                  <th className="p-2.5 text-center w-20">
                    <span className="flex items-center justify-center gap-1">
                      <PlusCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>{t('إضافة', 'Add')}</span>
                    </span>
                  </th>
                  <th className="p-2.5 text-center w-20">
                    <span className="flex items-center justify-center gap-1">
                      <Pencil className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>{t('تعديل', 'Edit')}</span>
                    </span>
                  </th>
                  <th className="p-2.5 text-center w-36">
                    <span className="flex items-center justify-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>{t('مرفقات/حالة', 'Special')}</span>
                    </span>
                  </th>
                  <th className="p-2.5 text-center w-24">
                    <span className="flex items-center justify-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                      <span>{t('السجل (!)', 'Audit')}</span>
                    </span>
                  </th>
                  <th className="p-2.5 text-center w-20">
                    <span className="flex items-center justify-center gap-1">
                      <Trash2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                      <span>{t('حذف', 'Delete')}</span>
                    </span>
                  </th>
                  <th className="p-2.5 text-center w-24">{t('تحديد الكل', 'All')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0D9CB]/60 dark:divide-[#243628]/60">
                {SUBMODULE_ROWS.map(row => {
                  const rowKeys = [
                    row.viewKey,
                    row.createKey,
                    row.editKey,
                    ...row.specialKeys.map(s => s.key),
                    row.auditKey,
                    row.deleteKey,
                  ];
                  const isAllRowSelected = rowKeys.every(k => userPermissions.includes(k));

                  return (
                    <tr
                      key={row.id}
                      className="hover:bg-[#FBF9F5] dark:hover:bg-[#121B14] transition-colors"
                    >
                      {/* Submodule Info */}
                      <td className="p-3">
                        <div className="font-extrabold text-[#1A241C] dark:text-[#F3EFE6] flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-[#D99B26] shrink-0" />
                          <span>{row.titleAr}</span>
                        </div>
                        <p className="text-[11px] text-[#5C665E] dark:text-[#8FA392] mt-0.5 ps-6">
                          {row.descriptionAr}
                        </p>
                      </td>

                      {/* View Permission */}
                      <td className="p-2.5 text-center">
                        <CustomMatrixCheckbox
                          checked={userPermissions.includes(row.viewKey)}
                          disabled={isSuperAdminTarget}
                          onChange={() => togglePermission(row.viewKey)}
                        />
                      </td>

                      {/* Create Permission */}
                      <td className="p-2.5 text-center">
                        <CustomMatrixCheckbox
                          checked={userPermissions.includes(row.createKey)}
                          disabled={isSuperAdminTarget}
                          onChange={() => togglePermission(row.createKey)}
                        />
                      </td>

                      {/* Edit Permission */}
                      <td className="p-2.5 text-center">
                        <CustomMatrixCheckbox
                          checked={userPermissions.includes(row.editKey)}
                          disabled={isSuperAdminTarget}
                          onChange={() => togglePermission(row.editKey)}
                        />
                      </td>

                      {/* Special Actions (Documents / Toggle / POA download) */}
                      <td className="p-2.5 text-center">
                        {row.specialKeys.length > 0 ? (
                          <div className="flex flex-col gap-1 items-center justify-center">
                            {row.specialKeys.map(special => (
                              <label
                                key={special.key}
                                className="flex items-center gap-1.5 cursor-pointer text-[10px] text-[#5C665E] dark:text-[#8FA392]"
                              >
                                <CustomMatrixCheckbox
                                  checked={userPermissions.includes(special.key)}
                                  disabled={isSuperAdminTarget}
                                  onChange={() => togglePermission(special.key)}
                                />
                                <span>{special.labelAr}</span>
                              </label>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[#8FA392] text-[11px]">—</span>
                        )}
                      </td>

                      {/* Audit Log Permission */}
                      <td className="p-2.5 text-center">
                        <CustomMatrixCheckbox
                          checked={userPermissions.includes(row.auditKey)}
                          disabled={isSuperAdminTarget}
                          onChange={() => togglePermission(row.auditKey)}
                        />
                      </td>

                      {/* Delete Permission */}
                      <td className="p-2.5 text-center">
                        <CustomMatrixCheckbox
                          checked={userPermissions.includes(row.deleteKey)}
                          disabled={isSuperAdminTarget}
                          onChange={() => togglePermission(row.deleteKey)}
                        />
                      </td>

                      {/* Toggle Entire Row */}
                      <td className="p-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => toggleRow(row)}
                          disabled={isSuperAdminTarget}
                          className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors ${
                            isAllRowSelected
                              ? 'bg-[#1C291E] text-white border-[#1C291E]'
                              : 'bg-[#EAE4D7] dark:bg-[#1A261D] text-[#5C665E] dark:text-[#8FA392] border-[#E0D9CB] dark:border-[#243628] hover:text-[#1A241C]'
                          }`}
                        >
                          {isAllRowSelected ? t('مفعل بالكامل', 'All') : t('تحديد', 'Select')}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] flex items-center justify-between shrink-0">
          <div className="text-xs text-[#5C665E] dark:text-[#8FA392] font-medium">
            <span>{t('إجمالي الصلاحيات المفعلة:', 'Active Permissions:')} </span>
            <span className="font-bold text-[#1A241C] dark:text-[#F3EFE6]">
              {userPermissions.length} / {ALL_COMPANY_PERMISSIONS.length}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#5C665E] dark:text-[#8FA392] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23] transition-colors"
            >
              {t('إغلاق', 'Close')}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSubmitting || isSuperAdminTarget}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#1C291E] hover:bg-[#283B2B] text-[#FBF9F5] text-xs font-extrabold shadow-sm transition-all active:scale-98 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#D99B26]" />
                  <span>{t('جاري الحفظ...', 'Saving to D1...')}</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-[#D99B26]" />
                  <span>{t('حفظ مصفوفة الصلاحيات', 'Save Matrix')}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Add User Mini Modal */}
      {showAddUser && (
        <div className="fixed inset-0 !m-0 !top-0 !left-0 !right-0 !bottom-0 z-[1000] bg-black/70 flex items-center justify-center p-3">
          <div className="w-full max-w-sm rounded-2xl bg-[#FBF9F5] dark:bg-[#121B14] border border-[#E0D9CB] dark:border-[#243628] shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E0D9CB] dark:border-[#243628]">
              <h4 className="text-sm font-extrabold text-[#1A241C] dark:text-[#F3EFE6]">
                {t('إضافة مستخدم جديد للنظام', 'Add New User')}
              </h4>
              <button onClick={() => setShowAddUser(false)}>
                <X className="w-4 h-4 text-[#5C665E]" />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">الاسم الكامل</label>
                <input
                  type="text"
                  required
                  value={newUserNameAr}
                  onChange={e => setNewUserNameAr(e.target.value)}
                  placeholder="مثال: م. سارة أحمد"
                  className="w-full p-2 rounded-xl border border-[#E0D9CB] bg-white dark:bg-[#17231A]"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">المسمى الوظيفي</label>
                <input
                  type="text"
                  required
                  value={newUserJobTitle}
                  onChange={e => setNewUserJobTitle(e.target.value)}
                  placeholder="مثال: مسؤول السجلات والتراخيص"
                  className="w-full p-2 rounded-xl border border-[#E0D9CB] bg-white dark:bg-[#17231A]"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">البريد الإلكتروني</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={e => setNewUserEmail(e.target.value)}
                  placeholder="sara@hrsup.com"
                  dir="ltr"
                  className="w-full p-2 rounded-xl border border-[#E0D9CB] bg-white dark:bg-[#17231A] text-left"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">كلمة المرور المؤقتة</label>
                <input
                  type="password"
                  required
                  value={newUserPassword}
                  onChange={e => setNewUserPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-2 rounded-xl border border-[#E0D9CB] bg-white dark:bg-[#17231A]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddUser(false)}
                  className="px-3 py-1.5 rounded-lg text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#1C291E] text-white"
                >
                  إنشاء وتخصيص
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Custom Matrix Checkbox that bypasses OS native dark-mode inversion
const CustomMatrixCheckbox: React.FC<{
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
}> = ({ checked, disabled, onChange }) => {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={onChange}
      className={`w-4 h-4 mx-auto rounded-md border flex items-center justify-center transition-all ${
        checked
          ? 'bg-[#D99B26] border-[#D99B26] text-[#1C291E] shadow-2xs'
          : 'bg-white dark:bg-[#17231A] border-[#E0D9CB] dark:border-[#243628] hover:border-[#D99B26]'
      } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {checked && <Check className="w-3 h-3 stroke-[3]" />}
    </button>
  );
};
