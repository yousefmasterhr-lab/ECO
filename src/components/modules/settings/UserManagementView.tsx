import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useAuth } from '../../../context/AuthContext';
import { ManagedUser, UserRole, ROLE_CONFIGURATIONS } from '../../../types/auth';
import {
  Users,
  UserPlus,
  Shield,
  Search,
  X,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';

const DEPARTMENTS = [
  { id: 'executive', nameAr: 'الإدارة العليا والاستراتيجية', nameEn: 'Executive Management & Strategy' },
  { id: 'companies', nameAr: 'إدارة الشركات والفروع', nameEn: 'Companies Management' },
  { id: 'finance', nameAr: 'الشؤون المالية والخزينة', nameEn: 'Financial Affairs & Treasury' },
  { id: 'hr', nameAr: 'إدارة الموارد البشرية (HRMS)', nameEn: 'Human Resources (HRMS)' },
  { id: 'engineering', nameAr: 'المكتب الفني والمشاريع', nameEn: 'Technical Office & Projects' },
  { id: 'cts', nameAr: 'الصادر والوارد (CTS)', nameEn: 'Correspondence (CTS)' },
  { id: 'legal', nameAr: 'الشؤون القانونية والتوثيق', nameEn: 'Legal Affairs & Compliance' },
  { id: 'insurance', nameAr: 'التأمينات الاجتماعية والامتثال', nameEn: 'Social Insurance' },
  { id: 'ats', nameAr: 'استقطاب الكفاءات والتوظيف (ATS)', nameEn: 'Talent Acquisition (ATS)' },
  { id: 'reception', nameAr: 'الاستقبال وضبط البوابات', nameEn: 'Front Desk & Reception' },
];

export const UserManagementView: React.FC = () => {
  const { isRtl, t } = useLanguage();
  const {
    managedUsers,
    addManagedUser,
    updateManagedUser,
    deleteManagedUser
  } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [modalMode, setModalMode] = useState<'NONE' | 'ADD' | 'EDIT'>('NONE');
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);

  // Form Fields
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [departmentId, setDepartmentId] = useState('finance');
  const [role, setRole] = useState<UserRole>('FINANCE_OFFICER');
  const [clearanceLevel, setClearanceLevel] = useState<1 | 2 | 3 | 4>(3);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const resetForm = () => {
    setNameAr('');
    setNameEn('');
    setNationalId('');
    setEmail('');
    setUsername('');
    setDepartmentId('finance');
    setRole('FINANCE_OFFICER');
    setClearanceLevel(3);
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
    setRole(user.role);
    setClearanceLevel(user.clearanceLevel);
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
      setFormError(t('يرجى إدخال بريد إلكتروني صحيح.', 'Please enter a valid corporate email.'));
      return;
    }

    if (!username.trim() || username.length < 3) {
      setFormError(t('اسم المستخدم يجب ألا يقل عن 3 أحرف.', 'Username must be at least 3 characters.'));
      return;
    }

    if (!password || password.length < 6) {
      setFormError(t('كلمة المرور يجب ألا تقل عن 6 أحرف أو أرقام.', 'Password must be at least 6 characters.'));
      return;
    }

    const deptObj = DEPARTMENTS.find(d => d.id === departmentId) || DEPARTMENTS[0];
    const roleCfg = ROLE_CONFIGURATIONS[role];

    if (modalMode === 'ADD') {
      // Check for email collision
      if (managedUsers.some(u => u.email.toLowerCase() === email.trim().toLowerCase())) {
        setFormError(t('هذا البريد الإلكتروني مسجل بالفعل لمستخدم آخر.', 'This email is already registered.'));
        return;
      }

      addManagedUser({
        nameAr: nameAr.trim(),
        nameEn: nameEn.trim(),
        nationalId: nationalId.trim(),
        email: email.trim().toLowerCase(),
        username: username.trim().toLowerCase(),
        departmentId: deptObj.id,
        departmentAr: deptObj.nameAr,
        departmentEn: deptObj.nameEn,
        role: role,
        roleLabelAr: roleCfg.titleAr,
        roleLabelEn: roleCfg.titleEn,
        clearanceLevel: clearanceLevel,
        clearanceNameAr: roleCfg.clearanceNameAr,
        clearanceNameEn: roleCfg.clearanceNameEn,
        status: 'ACTIVE',
        passwordHash: password,
      });

      setFormSuccess(t('تم حفظ المستخدم بنجاح.', 'User saved successfully!'));
      setTimeout(() => {
        setModalMode('NONE');
        resetForm();
      }, 1200);
    } else if (modalMode === 'EDIT' && selectedUser) {
      updateManagedUser(selectedUser.id, {
        nameAr: nameAr.trim(),
        nameEn: nameEn.trim(),
        nationalId: nationalId.trim(),
        email: email.trim().toLowerCase(),
        username: username.trim().toLowerCase(),
        departmentId: deptObj.id,
        departmentAr: deptObj.nameAr,
        departmentEn: deptObj.nameEn,
        role: role,
        roleLabelAr: roleCfg.titleAr,
        roleLabelEn: roleCfg.titleEn,
        clearanceLevel: clearanceLevel,
        clearanceNameAr: roleCfg.clearanceNameAr,
        clearanceNameEn: roleCfg.clearanceNameEn,
        passwordHash: password,
      });

      setFormSuccess(t('تم تحديث بيانات وصلاحيات المستخدم بنجاح.', 'User updated successfully!'));
      setTimeout(() => {
        setModalMode('NONE');
        resetForm();
      }, 1200);
    }
  };

  const handleToggleStatus = (u: ManagedUser) => {
    if (u.id === 'usr_root_csuite' || u.id === 'usr_root_csuite_01' || u.role === 'SUPER_ADMIN') return;
    const nextStatus = u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    updateManagedUser(u.id, { status: nextStatus });
  };

  const handleDelete = (id: string) => {
    if (id === 'usr_root_csuite' || id === 'usr_root_csuite_01') {
      alert(t('لا يمكن حذف الحساب الإداري الجذري للنظام (Root Administrator).', 'Cannot delete root administrator.'));
      return;
    }
    if (confirm(t('هل أنت متأكد من حذف هذا الحساب نهائياً من المنظومة؟', 'Are you sure you want to permanently delete this user?'))) {
      deleteManagedUser(id);
    }
  };

  // Filtered users
  const filteredUsers = managedUsers.filter(u => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.nameAr.toLowerCase().includes(q) ||
      u.nameEn.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.departmentAr.toLowerCase().includes(q)
    );
  });

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
                {t('حسابات نشطة', 'Active Accounts')}
              </span>
            </div>
            <p className="text-xs text-[#5C665E] dark:text-[#8FA392] mt-0.5">
              {t(
                'إدارة حسابات وصلاحيات المستخدمين والربط بالأدوار الوظيفية.',
                'Manage user accounts, roles, and permissions.'
              )}
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-[#1C291E] dark:bg-[#EBB34D] text-[#F3EFE6] dark:text-[#0E1610] font-bold text-xs flex items-center gap-2 transition-all shadow-sm hover:opacity-90 active:scale-95 cursor-pointer self-start sm:self-center shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>{t('إضافة مستخدم جديد', 'Add Real User')}</span>
        </button>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#5C665E] dark:text-[#8FA392] absolute inset-y-0 start-3 my-auto" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t('البحث بالاسم، البريد المؤسسي، أو القسم...', 'Search by name, email, or department...')}
            className="w-full ps-9 pe-4 py-2 rounded-xl text-xs bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="text-xs text-[#5C665E] dark:text-[#8FA392] font-semibold font-mono">
          {filteredUsers.length} {t('مستخدمين مسجلين', 'Users')}
        </div>
      </div>

      {/* 3. User Cards / Table Directory */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredUsers.map(u => {
          const isRoot = u.id === 'usr_root_csuite';
          const isActive = u.status === 'ACTIVE';

          return (
            <div
              key={u.id}
              className={`rounded-2xl border p-4 sm:p-5 transition-all text-start relative flex flex-col justify-between ${
                isRoot
                  ? 'bg-gradient-to-br from-[#FBF9F5] to-[#F3EFE6] dark:from-[#17231A] dark:to-[#121B14] border-amber-500/40 shadow-sm'
                  : 'bg-[#FBF9F5] dark:bg-[#141F16] border-[#E0D9CB] dark:border-[#243628]'
              }`}
            >
              <div>
                {/* Header row with Avatar and Status */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#1C291E] to-[#D99B26] text-white flex items-center justify-center font-black text-sm shadow-xs shrink-0">
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
                      <p className="text-[11px] text-[#5C665E] dark:text-[#8FA392] truncate">
                        {u.email}
                      </p>
                    </div>
                  </div>

                  <span
                    onClick={() => handleToggleStatus(u)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 cursor-pointer border ${
                      isActive
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                        : 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30'
                    }`}
                    title={t('انقر لتبديل حالة الحساب', 'Click to toggle status')}
                  >
                    {isActive ? t('نشط', 'Active') : t('معطل', 'Suspended')}
                  </span>
                </div>

                {/* Details Meta */}
                <div className="space-y-1.5 py-2.5 my-2 border-y border-[#E0D9CB]/60 dark:border-[#243628]/60 text-xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#5C665E] dark:text-[#8FA392]">{t('القسم / الإدارة:', 'Department:')}</span>
                    <span className="font-semibold text-[#1A241C] dark:text-[#F3EFE6] truncate max-w-[170px]">
                      {isRtl ? u.departmentAr : u.departmentEn}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#5C665E] dark:text-[#8FA392]">{t('الدور الوظيفي:', 'Role:')}</span>
                    <span className="font-bold text-[#D99B26] dark:text-[#EBB34D]">
                      {isRtl ? u.roleLabelAr : u.roleLabelEn}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#5C665E] dark:text-[#8FA392]">{t('مستوى الصلاحية:', 'Clearance:')}</span>
                    <span className="inline-flex items-center gap-1 font-mono font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                      <Shield className="w-3 h-3 text-[#D99B26] dark:text-[#EBB34D]" />
                      <span>Level {u.clearanceLevel}</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#5C665E] dark:text-[#8FA392]">{t('الرقم القومي:', 'National ID:')}</span>
                    <span className="font-mono text-[#5C665E] dark:text-[#8FA392]">
                      {u.nationalId || '28501010102345'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEdit(u)}
                  className="px-2.5 py-1.5 rounded-lg bg-[#EAE4D7] dark:bg-[#1F2E23] text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6] text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>{t('تعديل الصلاحيات', 'Edit')}</span>
                </button>

                {!isRoot && (
                  <button
                    onClick={() => handleDelete(u.id)}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title={t('حذف المستخدم', 'Delete User')}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Functional Add / Edit User Modal */}
      {modalMode !== 'NONE' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#FBF9F5] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] shadow-2xl p-6 sm:p-7 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E0D9CB] dark:border-[#243628] mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-[#D99B26] dark:text-[#EBB34D] flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#1A241C] dark:text-[#F3EFE6]">
                    {modalMode === 'ADD' ? t('إضافة مستخدم جديد', 'Add User') : t('تعديل بيانات المستخدم', 'Edit User')}
                  </h3>
                  <span className="text-[11px] text-[#5C665E] dark:text-[#8FA392]">
                    {t('إدارة حساب وصلاحيات المستخدم.', 'Manage user account and permissions.')}
                  </span>
                </div>
              </div>
              <button
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
                    placeholder="م. إبراهيم خليل"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#F3EFE6] dark:bg-[#121B14] border border-[#E0D9CB] dark:border-[#243628] focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none transition-colors"
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
                    placeholder="Eng. Ibrahim Khalil"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#F3EFE6] dark:bg-[#121B14] border border-[#E0D9CB] dark:border-[#243628] focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none transition-colors"
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
                  placeholder="28501010102345"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#F3EFE6] dark:bg-[#121B14] border border-[#E0D9CB] dark:border-[#243628] focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none transition-colors font-mono"
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
                    placeholder="khalil@hrsup.com"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#F3EFE6] dark:bg-[#121B14] border border-[#E0D9CB] dark:border-[#243628] focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none transition-colors"
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
                    placeholder="khalil"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#F3EFE6] dark:bg-[#121B14] border border-[#E0D9CB] dark:border-[#243628] focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-bold text-[#1A241C] dark:text-[#E0D9CB] block mb-1">
                    {t('القسم / الإدارة *', 'Department *')}
                  </label>
                  <select
                    value={departmentId}
                    onChange={e => setDepartmentId(e.target.value)}
                    dir="rtl"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#F3EFE6] dark:bg-[#121B14] border border-[#E0D9CB] dark:border-[#243628] focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none transition-colors"
                  >
                    {DEPARTMENTS.map(d => (
                      <option key={d.id} value={d.id} className="bg-[#F3EFE6] dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6]">
                        {isRtl ? d.nameAr : d.nameEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#1A241C] dark:text-[#E0D9CB] block mb-1">
                    {t('الدور الوظيفي *', 'Job Role *')}
                  </label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value as UserRole)}
                    dir="rtl"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#F3EFE6] dark:bg-[#121B14] border border-[#E0D9CB] dark:border-[#243628] focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none transition-colors"
                  >
                    <option value="SUPER_ADMIN" className="bg-[#F3EFE6] dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6]">{t('الرئيس التنفيذي (C-Suite)', 'Chief Executive (C-Suite)')}</option>
                    <option value="FINANCE_OFFICER" className="bg-[#F3EFE6] dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6]">{t('المدير المالي (CFO)', 'Chief Financial Officer (Finance)')}</option>
                    <option value="HR_MANAGER" className="bg-[#F3EFE6] dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6]">{t('مدير الموارد البشرية (HR)', 'HR Director')}</option>
                    <option value="PROJECTS_ENGINEER" className="bg-[#F3EFE6] dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6]">{t('مدير المكتب الفني والمشاريع', 'Technical Office Director')}</option>
                    <option value="LEGAL_COUNSEL" className="bg-[#F3EFE6] dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6]">{t('المستشار القانوني العام', 'General Legal Counsel')}</option>
                    <option value="RECEPTION_SECURITY" className="bg-[#F3EFE6] dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6]">{t('مسؤول الاستقبال والأمن', 'Front Desk & Security')}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-bold text-[#1A241C] dark:text-[#E0D9CB] block mb-1">
                    {t('مستوى الصلاحية *', 'Permission Level *')}
                  </label>
                  <select
                    value={clearanceLevel}
                    onChange={e => setClearanceLevel(Number(e.target.value) as 1 | 2 | 3 | 4)}
                    dir="rtl"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#F3EFE6] dark:bg-[#121B14] border border-[#E0D9CB] dark:border-[#243628] focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none transition-colors"
                  >
                    <option value={4} className="bg-[#F3EFE6] dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6]">{t('المستوى 4 - إدارة عليا (Governance)', 'Level 4 - C-Suite Governance')}</option>
                    <option value={3} className="bg-[#F3EFE6] dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6]">{t('المستوى 3 - إدارة تنفيذية (Executive)', 'Level 3 - Executive')}</option>
                    <option value={2} className="bg-[#F3EFE6] dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6]">{t('المستوى 2 - إشرافي (Supervisory)', 'Level 2 - Supervisory')}</option>
                    <option value={1} className="bg-[#F3EFE6] dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6]">{t('المستوى 1 - تشغيلي (Operational)', 'Level 1 - Operational')}</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#1A241C] dark:text-[#E0D9CB] block mb-1">
                    {t('كلمة المرور *', 'Password *')}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      dir="ltr"
                      placeholder="••••••••••••"
                      className="w-full ps-3.5 pe-10 py-2.5 rounded-xl text-xs bg-[#F3EFE6] dark:bg-[#121B14] border border-[#E0D9CB] dark:border-[#243628] focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none transition-colors"
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
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="pt-4 border-t border-[#E0D9CB] dark:border-[#243628] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalMode('NONE')}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold border border-[#E0D9CB] dark:border-[#243628] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23] text-[#5C665E] dark:text-[#8FA392] transition-colors cursor-pointer"
                >
                  {t('إلغاء', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  {modalMode === 'ADD' ? t('حفظ المستخدم', 'Save User') : t('حفظ التعديلات', 'Save Changes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
