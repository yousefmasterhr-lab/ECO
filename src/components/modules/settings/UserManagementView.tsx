import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useAuth } from '../../../context/AuthContext';
import { ManagedUser, UserRole, ROLE_CONFIGURATIONS } from '../../../types/auth';
import { CreatableSelect } from '../../common/CreatableSelect';
import {
  Users,
  UserPlus,
  Shield,
  Search,
  X,
  Pencil,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Power,
  Sparkles,
  Building2,
  Briefcase
} from 'lucide-react';

export const UserManagementView: React.FC = () => {
  const { isRtl, t } = useLanguage();
  const {
    managedUsers,
    addManagedUser,
    updateManagedUser,
    deleteManagedUser,
    auditLogs
  } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [modalMode, setModalMode] = useState<'NONE' | 'ADD' | 'EDIT'>('NONE');
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);

  // Form Fields (Zero hardcoded names or mock clutter)
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [departmentId, setDepartmentId] = useState('finance');
  const [departmentNameAr, setDepartmentNameAr] = useState('الشؤون المالية والخزينة');
  const [role, setRole] = useState<UserRole>('FINANCE_OFFICER');
  const [roleLabelAr, setRoleLabelAr] = useState('المدير المالي (CFO)');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // User Audit Log Modal State
  const [auditUser, setAuditUser] = useState<ManagedUser | null>(null);

  const resetForm = () => {
    setNameAr('');
    setNameEn('');
    setNationalId('');
    setEmail('');
    setUsername('');
    setDepartmentId('finance');
    setDepartmentNameAr('الشؤون المالية والخزينة');
    setRole('FINANCE_OFFICER');
    setRoleLabelAr('المدير المالي (CFO)');
    setPassword('');
    setFormError(null);
    setFormSuccess(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setSelectedUser(null);
    setModalMode('ADD');
  };

  const handleOpenEdit = (user: ManagedUser) => {
    resetForm();
    setSelectedUser(user);
    setNameAr(user.nameAr);
    setNameEn(user.nameEn);
    setNationalId(user.nationalId || '');
    setEmail(user.email);
    setUsername(user.username);
    setDepartmentId(user.departmentId || 'finance');
    setDepartmentNameAr(user.departmentAr || 'الشؤون المالية والخزينة');
    setRole(user.role);
    setRoleLabelAr(user.roleLabelAr || 'المدير المالي (CFO)');
    setPassword(user.passwordHash || '');
    setModalMode('EDIT');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Strict Validations
    if (!nameAr.trim() || !nameEn.trim()) {
      setFormError(t('يرجى إدخال الاسم بالكامل باللغتين العربية والإنجليزية.', 'Please enter full name in Arabic & English.'));
      return;
    }

    if (!nationalId.trim() || nationalId.length < 10 || !/^\d+$/.test(nationalId.trim())) {
      setFormError(t('الرقم القومي يجب أن يتكون من 10 إلى 14 رقماً.', 'National ID must be between 10 to 14 digits.'));
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setFormError(t('يرجى إدخال بريد إلكتروني رسمي صحيح.', 'Please enter a valid corporate email.'));
      return;
    }

    if (!username.trim() || username.length < 3) {
      setFormError(t('اسم المستخدم يجب ألا يقل عن 3 أحرف.', 'Username must be at least 3 characters.'));
      return;
    }

    if (modalMode === 'ADD' && (!password || password.length < 8)) {
      setFormError(t('كلمة المرور يجب ألا تقل عن 8 رموز أو أحرف قوية.', 'Password must be at least 8 characters.'));
      return;
    }

    const roleCfg = ROLE_CONFIGURATIONS[role] || {
      titleAr: roleLabelAr || role,
      titleEn: role,
      clearanceNameAr: 'صلاحيات مخصصة',
      clearanceNameEn: 'Custom Role',
      clearanceLevel: 2,
    };

    if (modalMode === 'ADD') {
      // Check for email or username collision
      if (managedUsers.some(u => u.email.toLowerCase() === email.trim().toLowerCase())) {
        setFormError(t('هذا البريد الإلكتروني مسجل بالفعل لمستخدم آخر.', 'This email is already registered.'));
        return;
      }
      if (managedUsers.some(u => u.username.toLowerCase() === username.trim().toLowerCase())) {
        setFormError(t('اسم المستخدم هذا مستخدم بالفعل.', 'This username is already taken.'));
        return;
      }

      addManagedUser({
        nameAr: nameAr.trim(),
        nameEn: nameEn.trim(),
        nationalId: nationalId.trim(),
        email: email.trim().toLowerCase(),
        username: username.trim().toLowerCase(),
        departmentId: departmentId,
        departmentAr: departmentNameAr,
        departmentEn: departmentId,
        role: role,
        roleLabelAr: roleLabelAr || roleCfg.titleAr,
        roleLabelEn: roleCfg.titleEn,
        clearanceLevel: (roleCfg.clearanceLevel as 1 | 2 | 3 | 4) || 2,
        clearanceNameAr: roleCfg.clearanceNameAr,
        clearanceNameEn: roleCfg.clearanceNameEn,
        status: 'ACTIVE',
        passwordHash: password,
      });

      setFormSuccess(t('تم إنشاء وحفظ حساب المستخدم بنجاح.', 'User created successfully!'));
      setTimeout(() => {
        setModalMode('NONE');
        resetForm();
      }, 1000);
    } else if (modalMode === 'EDIT' && selectedUser) {
      updateManagedUser(selectedUser.id, {
        nameAr: nameAr.trim(),
        nameEn: nameEn.trim(),
        nationalId: nationalId.trim(),
        email: email.trim().toLowerCase(),
        username: username.trim().toLowerCase(),
        departmentId: departmentId,
        departmentAr: departmentNameAr,
        departmentEn: departmentId,
        role: role,
        roleLabelAr: roleLabelAr || roleCfg.titleAr,
        roleLabelEn: roleCfg.titleEn,
        passwordHash: password || selectedUser.passwordHash,
      });

      setFormSuccess(t('تم تحديث بيانات وصلاحيات المستخدم بنجاح.', 'User updated successfully!'));
      setTimeout(() => {
        setModalMode('NONE');
        resetForm();
      }, 1000);
    }
  };

  const handleToggleStatus = (u: ManagedUser) => {
    if (u.id === 'usr_root_csuite' || u.id === 'usr_root_csuite_01' || u.role === 'SUPER_ADMIN') {
      alert(t('لا يمكن تعطيل حساب الإدارة العليا وحوكمة النظام.', 'Cannot deactivate root administrator account.'));
      return;
    }
    const nextStatus = u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    updateManagedUser(u.id, { status: nextStatus });
  };

  const handleDelete = (u: ManagedUser) => {
    if (u.id === 'usr_root_csuite' || u.id === 'usr_root_csuite_01' || u.role === 'SUPER_ADMIN') {
      alert(t('لا يمكن حذف الحساب الإداري الجذري للنظام (Root Administrator).', 'Cannot delete root administrator.'));
      return;
    }
    if (confirm(t(`هل أنت متأكد من حذف حساب "${u.nameAr}" نهائياً من المنظومة؟`, `Permanently delete account for "${u.nameAr}"?`))) {
      deleteManagedUser(u.id);
    }
  };

  // Open RBAC matrix pre-selected for this user
  const handleOpenRbac = (u: ManagedUser) => {
    window.dispatchEvent(
      new CustomEvent('eco-open-rbac', {
        detail: { userId: u.id },
      })
    );
  };

  // Filtered users
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return managedUsers;
    const q = searchQuery.toLowerCase().trim();
    return managedUsers.filter(
      u =>
        u.nameAr.toLowerCase().includes(q) ||
        u.nameEn.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        (u.departmentAr && u.departmentAr.toLowerCase().includes(q)) ||
        (u.roleLabelAr && u.roleLabelAr.toLowerCase().includes(q))
    );
  }, [managedUsers, searchQuery]);

  // Filtered audit logs for the selected audit user
  const userAuditEntries = useMemo(() => {
    if (!auditUser) return [];
    return auditLogs.filter(
      log =>
        log.detailsAr.includes(auditUser.nameAr) ||
        log.detailsAr.includes(auditUser.email) ||
        log.actorEmail === auditUser.email
    );
  }, [auditLogs, auditUser]);

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* 1. Header with Production State Summary */}
      <div className="rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#121B14] p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-[#D99B26] dark:text-[#EBB34D] border border-amber-500/30 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-[#1A241C] dark:text-[#F3EFE6] tracking-tight">
                {t('إدارة المستخدمين', 'User Management')}
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                {t('حسابات نشطة', 'Active Directory')}
              </span>
            </div>
            <p className="text-xs text-[#5C665E] dark:text-[#8FA392] mt-0.5">
              {t(
                'إدارة حسابات المستخدمين والربط بالأدوار الوظيفية ومصفوفة الصلاحيات (RBAC).',
                'Manage user accounts, roles, and granular RBAC permissions matrix.'
              )}
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-[#1C291E] dark:bg-[#EBB34D] text-[#F3EFE6] dark:text-[#0E1610] font-bold text-xs flex items-center gap-2 transition-all shadow-sm hover:opacity-90 active:scale-95 cursor-pointer self-start sm:self-center shrink-0"
        >
          <UserPlus className="w-4 h-4 stroke-[2.5]" />
          <span>{t('إضافة مستخدم جديد', 'Add User Account')}</span>
        </button>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#5C665E] dark:text-[#8FA392] absolute inset-y-0 start-3 my-auto pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t('البحث بالاسم، البريد المؤسسي، أو القسم...', 'Search by name, email, or department...')}
            className="w-full ps-9 pe-4 py-2 rounded-xl text-xs bg-white dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="text-xs text-[#5C665E] dark:text-[#8FA392] font-semibold font-mono">
          {filteredUsers.length} {t('مستخدمين مسجلين', 'Users Registered')}
        </div>
      </div>

      {/* 3. User Cards Grid (Standardized with Golden Standard Icon-Only Actions) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredUsers.map(u => {
          const isRoot =
            u.id === 'usr_root_csuite' ||
            u.id === 'usr_root_csuite_01' ||
            u.role === 'SUPER_ADMIN';
          const isActive = u.status === 'ACTIVE';

          return (
            <div
              key={u.id}
              className={`rounded-2xl border p-4 sm:p-5 transition-all text-start relative flex flex-col justify-between gap-3 ${
                isRoot
                  ? 'bg-gradient-to-br from-white to-amber-50/20 dark:from-[#17231A] dark:to-[#121B14] border-amber-500/40 shadow-sm'
                  : 'bg-white dark:bg-[#141F16] border-[#E0D9CB] dark:border-[#243628] hover:shadow-md'
              }`}
            >
              <div>
                {/* Header row with Avatar, Name, Email, and Status Badge */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#1C291E] to-[#D99B26] text-white flex items-center justify-center font-black text-sm shadow-xs shrink-0">
                      {u.nameAr.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-xs sm:text-sm font-black text-[#1A241C] dark:text-[#F3EFE6] truncate">
                          {isRtl ? u.nameAr : u.nameEn}
                        </h4>
                        {isRoot && (
                          <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-[#D99B26] dark:text-[#EBB34D] text-[9px] font-bold border border-amber-500/30">
                            ROOT ADMIN
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#5C665E] dark:text-[#8FA392] truncate font-mono">
                        {u.email}
                      </p>
                    </div>
                  </div>

                  <span
                    onClick={() => handleToggleStatus(u)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 cursor-pointer border transition-colors ${
                      isActive
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                        : 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30'
                    }`}
                    title={t('انقر لتبديل حالة الحساب', 'Click to toggle status')}
                  >
                    {isActive ? t('نشط', 'Active') : t('معطل', 'Suspended')}
                  </span>
                </div>

                {/* Details Meta (Cleaned: Zero Fake ID, Zero Level 1-4) */}
                <div className="space-y-1.5 py-2.5 my-1 border-y border-[#E0D9CB]/60 dark:border-[#243628]/60 text-xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#5C665E] dark:text-[#8FA392] flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      <span>{t('القسم / الإدارة:', 'Department:')}</span>
                    </span>
                    <span className="font-semibold text-[#1A241C] dark:text-[#F3EFE6] truncate max-w-[170px]">
                      {isRtl ? u.departmentAr : (u.departmentEn || u.departmentAr)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#5C665E] dark:text-[#8FA392] flex items-center gap-1">
                      <Briefcase className="w-3 h-3" />
                      <span>{t('الدور الوظيفي:', 'Job Role:')}</span>
                    </span>
                    <span className="font-bold text-[#D99B26] dark:text-[#EBB34D] truncate max-w-[170px]">
                      {isRtl ? u.roleLabelAr : (u.roleLabelEn || u.roleLabelAr)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#5C665E] dark:text-[#8FA392]">{t('الرقم القومي:', 'National ID:')}</span>
                    <span className="font-mono text-slate-700 dark:text-[#C5D6C9]">
                      {u.nationalId ? u.nationalId : '—'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#5C665E] dark:text-[#8FA392]">{t('اسم المستخدم:', 'Username:')}</span>
                    <span className="font-mono text-slate-500 dark:text-[#8FA392]">
                      @{u.username}
                    </span>
                  </div>
                </div>
              </div>

              {/* Golden Standard Icon-Only Action Bar */}
              <div className="pt-2 flex items-center justify-between border-t border-[#E0D9CB]/50 dark:border-[#243628]/50">
                <span className="text-[10px] text-slate-400 dark:text-[#8FA392] font-mono">
                  {u.createdAt ? u.createdAt.substring(0, 10) : '—'}
                </span>

                <div className="flex items-center gap-1">
                  {/* 1. تخصيص الصلاحيات (RBAC) */}
                  <button
                    type="button"
                    onClick={() => handleOpenRbac(u)}
                    title={t('تخصيص مصفوفة الصلاحيات (RBAC)', 'Open Permissions Matrix')}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-emerald-600 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                  >
                    <Shield className="w-4 h-4 text-emerald-500" />
                  </button>

                  {/* 2. سجل تعديلات الحساب (! Audit Log) */}
                  <button
                    type="button"
                    onClick={() => setAuditUser(u)}
                    title={t('سجل تعديلات الحساب والنشاط (!)', 'Account Audit Log')}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-blue-500 hover:bg-blue-500/10 transition-colors cursor-pointer"
                  >
                    <AlertCircle className="w-4 h-4 text-blue-500" />
                  </button>

                  {/* 3. تفعيل / إيقاف الحساب */}
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(u)}
                    title={isActive ? t('تعطيل الحساب', 'Suspend Account') : t('تفعيل الحساب', 'Activate Account')}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                      isActive
                        ? 'text-slate-600 hover:text-amber-600 hover:bg-amber-500/10'
                        : 'text-emerald-600 hover:bg-emerald-500/10'
                    }`}
                  >
                    <Power className="w-4 h-4" />
                  </button>

                  {/* 4. تعديل بيانات المستخدم */}
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(u)}
                    title={t('تعديل بيانات المستخدم', 'Edit User')}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-amber-500 hover:bg-amber-500/10 transition-colors cursor-pointer"
                  >
                    <Pencil className="w-4 h-4 text-amber-500" />
                  </button>

                  {/* 5. حذف المستخدم */}
                  {!isRoot && (
                    <button
                      type="button"
                      onClick={() => handleDelete(u)}
                      title={t('حذف المستخدم نهائياً', 'Delete User')}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4 text-rose-500" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Functional Add / Edit User Modal (With Zero-Gap Backdrop & Pure Instructional Placeholders) */}
      {modalMode !== 'NONE' && (
        <div className="fixed inset-0 !m-0 !top-0 !left-0 !right-0 !bottom-0 w-screen h-screen z-[999] flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#121B14] border border-[#E0D9CB] dark:border-[#243628] shadow-2xl p-6 sm:p-7 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E0D9CB] dark:border-[#243628] mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-[#D99B26] dark:text-[#EBB34D] flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#1A241C] dark:text-[#F3EFE6]">
                    {modalMode === 'ADD' ? t('إضافة مستخدم جديد', 'Add User Account') : t('تعديل بيانات المستخدم', 'Edit User Account')}
                  </h3>
                  <span className="text-[11px] text-[#5C665E] dark:text-[#8FA392]">
                    {t('إدارة حساب المستخدم ومزامنته السحابية.', 'Cloudflare D1 synced user profile.')}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalMode('NONE')}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error / Success Banners */}
            {formError && (
              <div className="mb-4 p-3 rounded-xl text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}
            {formSuccess && (
              <div className="mb-4 p-3 rounded-xl text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-start">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-bold text-[#1A241C] dark:text-[#E0D9CB] block mb-1">
                    {t('الاسم بالكامل (عربي) *', 'Full Name (Arabic) *')}
                  </label>
                  <input
                    type="text"
                    value={nameAr}
                    onChange={e => setNameAr(e.target.value)}
                    required
                    placeholder={t('أدخل الاسم الرباعي للمستخدم باللغة العربية', 'Enter full name in Arabic')}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-[#07130E] border border-[#E0D9CB] dark:border-[#243628] focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#1A241C] dark:text-[#E0D9CB] block mb-1">
                    {t('الاسم بالكامل (إنجليزي) *', 'Full Name (English) *')}
                  </label>
                  <input
                    type="text"
                    value={nameEn}
                    onChange={e => setNameEn(e.target.value)}
                    required
                    dir="ltr"
                    placeholder={t('أدخل الاسم الكامل باللغة الإنجليزية كما في المستندات الرسمية', 'Enter full name in English as in official documents')}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-[#07130E] border border-[#E0D9CB] dark:border-[#243628] focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none transition-colors font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#1A241C] dark:text-[#E0D9CB] block mb-1">
                  {t('الرقم القومي *', 'National ID *')}
                </label>
                <input
                  type="text"
                  value={nationalId}
                  onChange={e => setNationalId(e.target.value)}
                  required
                  dir="ltr"
                  maxLength={14}
                  placeholder={t('أدخل الرقم القومي المكون من 14 رقماً', 'Enter 14-digit National ID')}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-[#07130E] border border-[#E0D9CB] dark:border-[#243628] focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none transition-colors font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-bold text-[#1A241C] dark:text-[#E0D9CB] block mb-1">
                    {t('البريد الإلكتروني *', 'Email *')}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    dir="ltr"
                    placeholder={t('أدخل البريد الإلكتروني الرسمي للمستخدم', 'Enter official corporate email')}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-[#07130E] border border-[#E0D9CB] dark:border-[#243628] focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none transition-colors font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#1A241C] dark:text-[#E0D9CB] block mb-1">
                    {t('اسم المستخدم *', 'Username *')}
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                    dir="ltr"
                    placeholder={t('أدخل اسم الدخول الفريد للنظام', 'Enter unique username')}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-[#07130E] border border-[#E0D9CB] dark:border-[#243628] focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none transition-colors font-mono"
                  />
                </div>
              </div>

              {/* Dynamic Creatable Dropdowns for Department & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <CreatableSelect
                    category="departments"
                    label={t('القسم / الإدارة *', 'Department *')}
                    value={departmentId}
                    onChange={(val, opt) => {
                      setDepartmentId(val);
                      if (opt) setDepartmentNameAr(opt.labelAr);
                    }}
                    placeholder={t('اختر أو أضف قسماً جديداً...', 'Select or add department...')}
                    required
                  />
                </div>

                <div>
                  <CreatableSelect
                    category="roles"
                    label={t('الدور الوظيفي *', 'Job Role *')}
                    value={role}
                    onChange={(val, opt) => {
                      setRole(val as UserRole);
                      if (opt) setRoleLabelAr(opt.labelAr);
                    }}
                    placeholder={t('اختر أو أضف دوراً وظيفياً...', 'Select or add job role...')}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="text-xs font-bold text-[#1A241C] dark:text-[#E0D9CB] block mb-1">
                  {modalMode === 'ADD' ? t('كلمة المرور *', 'Password *') : t('كلمة المرور (اتركها فارغة إذا لم ترغب في التعديل)', 'Password (Leave blank to keep unchanged)')}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required={modalMode === 'ADD'}
                    dir="ltr"
                    placeholder={t('أدخل كلمة مرور قوية لا تقل عن 8 رموز', 'Enter a strong password (min 8 chars)')}
                    className="w-full ps-3.5 pe-10 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-[#07130E] border border-[#E0D9CB] dark:border-[#243628] focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none transition-colors font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 end-0 pe-3 flex items-center text-[#5C665E] dark:text-[#8FA392] hover:text-[#D99B26] dark:hover:text-[#EBB34D] transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="pt-4 border-t border-[#E0D9CB] dark:border-[#243628] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalMode('NONE')}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#EAE4D7] dark:bg-[#1F2E23] text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6] transition-colors cursor-pointer"
                >
                  {t('إلغاء', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#1C291E] dark:bg-[#EBB34D] text-[#F3EFE6] dark:text-[#0E1610] hover:opacity-90 transition-all shadow-sm active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{modalMode === 'ADD' ? t('حفظ المستخدم', 'Save User') : t('تحديث البيانات', 'Update User')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. User Account Audit Log Modal (! Audit Trail) */}
      {auditUser && (
        <div className="fixed inset-0 !m-0 !top-0 !left-0 !right-0 !bottom-0 w-screen h-screen z-[999] flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#121B14] border border-[#E0D9CB] dark:border-[#243628] shadow-2xl p-6 sm:p-7 max-h-[85vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#243628] mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-500 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-[#F3EFE6]">
                    {t('سجل تدقيق وتعديلات الحساب', 'User Account Audit Trail')}
                  </h3>
                  <span className="text-[11px] text-slate-500 dark:text-[#8FA392]">
                    {auditUser.nameAr} ({auditUser.email})
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAuditUser(null)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Account Summary Card */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#07130E] border border-slate-200 dark:border-[#1A3327] mb-4 text-xs space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500 dark:text-[#8FA392]">{t('معرف الحساب:', 'Account ID:')}</span>
                <span className="font-mono text-slate-700 dark:text-[#C5D6C9]">{auditUser.id}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500 dark:text-[#8FA392]">{t('تاريخ الإنشاء:', 'Created At:')}</span>
                <span className="font-mono text-slate-700 dark:text-[#C5D6C9]">{auditUser.createdAt || '—'}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500 dark:text-[#8FA392]">{t('حالة النشاط:', 'Status:')}</span>
                <span className={`font-bold ${auditUser.status === 'ACTIVE' ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {auditUser.status === 'ACTIVE' ? t('نشط', 'Active') : t('معطل', 'Suspended')}
                </span>
              </div>
            </div>

            {/* Change History Timeline */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-slate-700 dark:text-[#C5D6C9]">
                {t('الحركات والعمليات المسجلة:', 'Recorded Audit Events:')}
              </h4>

              {userAuditEntries.length > 0 ? (
                <div className="space-y-2">
                  {userAuditEntries.map(log => (
                    <div
                      key={log.id}
                      className="p-3 rounded-xl border border-slate-200 dark:border-[#1A3327] bg-white dark:bg-[#0D1F17] text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-[#F3EFE6]">
                          {isRtl ? log.actionAr : log.actionEn}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400 dark:text-[#8FA392]">
                          {log.timestamp}
                        </span>
                      </div>
                      <p className="text-[11.5px] text-slate-600 dark:text-[#8FA392] leading-relaxed">
                        {isRtl ? log.detailsAr : log.detailsEn}
                      </p>
                      <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                        <span>{t('القائم بالإجراء:', 'Actor:')} {log.actorName}</span>
                        <span className="font-mono">{log.ipAddress || '127.0.0.1'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-[#1A3327] text-center text-xs text-slate-400 dark:text-[#8FA392]">
                  {t('لا توجد سجلات تعديل إضافية مسجلة لهذا الحساب', 'No additional audit events recorded for this account')}
                </div>
              )}
            </div>

            {/* Close Button */}
            <div className="mt-5 pt-3 border-t border-slate-200 dark:border-[#243628] flex justify-end">
              <button
                type="button"
                onClick={() => setAuditUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#1A2E22] text-xs font-bold text-slate-700 dark:text-[#C5D6C9] hover:bg-slate-200 cursor-pointer"
              >
                {t('إغلاق النافذة', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
