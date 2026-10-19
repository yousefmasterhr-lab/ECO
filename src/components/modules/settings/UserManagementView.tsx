import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useAuth } from '../../../context/AuthContext';
import { useTenant } from '../../../context/TenantContext';
import { ManagedUser, UserRole, ROLE_CONFIGURATIONS } from '../../../types/auth';
import { CreatableSelect } from '../../common/CreatableSelect';
import { hrStorage } from '../../../services/hrStorage';
import { PermissionsManagerModal } from '../auth/PermissionsManagerModal';
import { cleanArabicTitle } from '../../../types/rbac';
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
  Briefcase,
  Key,
  ShieldCheck,
  Check,
  UserCheck,
  ChevronDown,
  Globe,
  BadgeCheck
} from 'lucide-react';

// Password strength evaluator
function calculatePasswordStrength(pass: string): { score: number; labelAr: string; color: string; width: string } {
  if (!pass) return { score: 0, labelAr: 'فارغة', color: 'bg-slate-300 dark:bg-slate-700', width: 'w-0' };
  let score = 0;
  if (pass.length >= 8) score += 25;
  if (pass.length >= 12) score += 15;
  if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score += 20;
  if (/\d/.test(pass)) score += 20;
  if (/[^a-zA-Z0-9]/.test(pass)) score += 20;

  if (score <= 30) {
    return { score, labelAr: 'ضعيفة', color: 'bg-rose-500', width: 'w-1/4' };
  } else if (score <= 60) {
    return { score, labelAr: 'متوسطة', color: 'bg-amber-500', width: 'w-2/4' };
  } else if (score <= 85) {
    return { score, labelAr: 'قوية', color: 'bg-blue-500', width: 'w-3/4' };
  } else {
    return { score: 100, labelAr: 'ممتازة ومحصنة سحابياً', color: 'bg-emerald-500', width: 'w-full' };
  }
}

// Generate strong cryptographic random password
function generateStrongPassword(): string {
  const charsUpper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const charsLower = 'abcdefghijkmnpqrstuvwxyz';
  const charsNumbers = '23456789';
  const charsSymbols = '!@#$%^&*()_+~';

  let pass = '';
  pass += charsUpper.charAt(Math.floor(Math.random() * charsUpper.length));
  pass += charsLower.charAt(Math.floor(Math.random() * charsLower.length));
  pass += charsNumbers.charAt(Math.floor(Math.random() * charsNumbers.length));
  pass += charsSymbols.charAt(Math.floor(Math.random() * charsSymbols.length));

  const allChars = charsUpper + charsLower + charsNumbers + charsSymbols;
  for (let i = 4; i < 16; i++) {
    pass += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }

  // Shuffle
  return pass.split('').sort(() => 0.5 - Math.random()).join('');
}

export const UserManagementView: React.FC = () => {
  const { isRtl, t } = useLanguage();
  const {
    managedUsers,
    addManagedUser,
    updateManagedUser,
    deleteManagedUser,
    auditLogs
  } = useAuth();

  const { companies } = useTenant();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED'>('ALL');
  const [companyFilter, setCompanyFilter] = useState<string>('ALL');

  // Modals
  const [modalMode, setModalMode] = useState<'NONE' | 'ADD' | 'EDIT'>('NONE');
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);
  const [auditUser, setAuditUser] = useState<ManagedUser | null>(null);
  const [resetPasswordUser, setResetPasswordUser] = useState<ManagedUser | null>(null);
  const [permissionsModalOpen, setPermissionsModalOpen] = useState(false);
  const [selectedPermissionUserId, setSelectedPermissionUserId] = useState<string>('');

  // Form Fields - strictly initialized to empty strings (NO pre-filled defaults)
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [departmentNameAr, setDepartmentNameAr] = useState('');
  const [role, setRole] = useState<UserRole | ''>('');
  const [roleLabelAr, setRoleLabelAr] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [allowedCompanyIds, setAllowedCompanyIds] = useState<string[]>(['all']);

  // Dedicated Reset Password State
  const [newPasswordVal, setNewPasswordVal] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Focus lock states to defeat Chromium credential autofill heuristics
  const [unlockedInputs, setUnlockedInputs] = useState<Record<string, boolean>>({});
  const unlockField = (name: string) => {
    setUnlockedInputs(prev => ({ ...prev, [name]: true }));
  };

  // Form Feedback
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // HR Employees for Quick Import
  const [hrEmployees, setHrEmployees] = useState<any[]>([]);
  useEffect(() => {
    try {
      const emps = hrStorage.getEmployees();
      setHrEmployees(emps || []);
    } catch {
      setHrEmployees([]);
    }
  }, [modalMode]);

  const resetForm = () => {
    setNameAr('');
    setNameEn('');
    setNationalId('');
    setPhone('');
    setEmail('');
    setUsername('');
    setDepartmentId('');
    setDepartmentNameAr('');
    setRole('');
    setRoleLabelAr('');
    setPassword('');
    setShowPassword(false);
    setAllowedCompanyIds(['all']);
    setUnlockedInputs({});
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
    setNameAr(user.nameAr || '');
    setNameEn(user.nameEn || '');
    // Clean out fake national ID 29001010100000 or internal fallback tokens
    const rawNid = user.nationalId || '';
    setNationalId((rawNid === '29001010100000' || rawNid.startsWith('NID_UNSET_')) ? '' : rawNid);
    setPhone(user.phone || '');
    setEmail(user.email || '');
    setUsername(user.username || '');
    setDepartmentId(user.departmentId || user.departmentAr || '');
    setDepartmentNameAr(user.departmentAr || '');
    setRole(user.role || '');
    setRoleLabelAr(cleanArabicTitle(user.jobTitleAr || user.roleLabelAr || user.role || ''));
    setPassword('');
    setAllowedCompanyIds(user.allowedCompanyIds && user.allowedCompanyIds.length > 0 ? user.allowedCompanyIds : ['all']);
    setModalMode('EDIT');
  };

  // Quick Import from HR employee dossier
  const handleImportHREmployee = (empId: string) => {
    if (!empId) return;
    const emp = hrEmployees.find(e => e.id === empId || e.uid === empId);
    if (!emp) return;

    if (emp.nameAr || emp.name) setNameAr(emp.nameAr || emp.name);
    if (emp.nameEn) setNameEn(emp.nameEn);
    if (emp.nationalId && emp.nationalId !== '29001010100000') setNationalId(emp.nationalId);
    if (emp.phone) setPhone(emp.phone);
    if (emp.email) {
      setEmail(emp.email);
      const autoUser = emp.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');
      if (autoUser && !username) setUsername(autoUser);
    }
    if (emp.department) {
      setDepartmentId(emp.department);
      setDepartmentNameAr(emp.department);
    }
    if (emp.jobTitle || emp.role) {
      setRoleLabelAr(emp.jobTitle || emp.role);
    }
    // Auto-generate strong password for quick onboarding
    setPassword(generateStrongPassword());
  };

  // Toggle company in multi-company access selection
  const handleToggleAllowedCompany = (companyId: string) => {
    if (companyId === 'all') {
      setAllowedCompanyIds(['all']);
      return;
    }

    setAllowedCompanyIds(prev => {
      const withoutAll = prev.filter(id => id !== 'all');
      if (withoutAll.includes(companyId)) {
        const remaining = withoutAll.filter(id => id !== companyId);
        return remaining.length === 0 ? ['all'] : remaining;
      } else {
        return [...withoutAll, companyId];
      }
    });
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validations
    if (!nameAr.trim()) {
      setFormError(t('يرجى إدخال الاسم بالكامل باللغة العربية.', 'Please enter full name in Arabic.'));
      return;
    }

    if (nationalId.trim() && (nationalId.trim().length !== 14 || !/^\d{14}$/.test(nationalId.trim()))) {
      setFormError(t('الرقم القومي يجب أن يتكون من 14 رقماً بصورة صحيحة (أو اتركه فارغاً إذا كان غير متوفر حالياً).', 'National ID must be 14 digits (or leave empty).'));
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

    if (modalMode === 'ADD' && (!password || password.length < 6)) {
      setFormError(t('كلمة المرور يجب ألا تقل عن 6 أحرف.', 'Password must be at least 6 characters.'));
      return;
    }

    const effectiveRole: UserRole = (role as UserRole) || 'HR_MANAGER';
    const roleCfg = ROLE_CONFIGURATIONS[effectiveRole] || {
      titleAr: roleLabelAr || effectiveRole,
      titleEn: effectiveRole,
      clearanceNameAr: 'صلاحيات مخصصة',
      clearanceNameEn: 'Custom Role',
      clearanceLevel: 2,
    };

    const cleanNationalId = nationalId.trim() === '29001010100000' ? '' : nationalId.trim();

    if (modalMode === 'ADD') {
      // Check duplicate email or username
      if (managedUsers.some(u => u.email.toLowerCase() === email.trim().toLowerCase())) {
        setFormError(t('هذا البريد الإلكتروني مسجل بالفعل لمستخدم آخر.', 'This email is already registered.'));
        return;
      }
      if (managedUsers.some(u => u.username.toLowerCase() === username.trim().toLowerCase())) {
        setFormError(t('اسم المستخدم هذا مستخدم بالفعل، يرجى اختيار اسم آخر.', 'This username is already taken.'));
        return;
      }

      addManagedUser({
        nameAr: nameAr.trim(),
        nameEn: nameEn.trim() || username.trim(),
        nationalId: cleanNationalId,
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        username: username.trim().toLowerCase(),
        departmentId: departmentId || departmentNameAr || 'الإدارة العامة',
        departmentAr: departmentNameAr || departmentId || 'الإدارة العامة',
        departmentEn: departmentId || 'General Management',
        role: effectiveRole,
        jobTitleAr: cleanArabicTitle(roleLabelAr || roleCfg.titleAr),
        jobTitleEn: roleCfg.titleEn,
        roleLabelAr: cleanArabicTitle(roleLabelAr || roleCfg.titleAr),
        roleLabelEn: roleCfg.titleEn,
        clearanceLevel: (roleCfg.clearanceLevel as 1 | 2 | 3 | 4) || 2,
        clearanceNameAr: roleCfg.clearanceNameAr,
        clearanceNameEn: roleCfg.clearanceNameEn,
        status: 'ACTIVE',
        passwordHash: password,
        allowedCompanyIds: allowedCompanyIds.length > 0 ? allowedCompanyIds : ['all'],
      });

      setFormSuccess(t('تم إنشاء وحفظ حساب المستخدم بنجاح.', 'User created successfully!'));
      setTimeout(() => {
        setModalMode('NONE');
        resetForm();
      }, 700);
    } else if (modalMode === 'EDIT' && selectedUser) {
      updateManagedUser(selectedUser.id, {
        nameAr: nameAr.trim(),
        nameEn: nameEn.trim() || selectedUser.nameEn,
        nationalId: cleanNationalId,
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        username: username.trim().toLowerCase(),
        departmentId: departmentId || departmentNameAr || selectedUser.departmentId,
        departmentAr: departmentNameAr || selectedUser.departmentAr,
        departmentEn: departmentId || selectedUser.departmentEn,
        role: effectiveRole,
        jobTitleAr: cleanArabicTitle(roleLabelAr || selectedUser.jobTitleAr || selectedUser.roleLabelAr),
        jobTitleEn: roleCfg.titleEn,
        roleLabelAr: cleanArabicTitle(roleLabelAr || selectedUser.jobTitleAr || selectedUser.roleLabelAr),
        roleLabelEn: roleCfg.titleEn,
        passwordHash: password || selectedUser.passwordHash,
        allowedCompanyIds: allowedCompanyIds.length > 0 ? allowedCompanyIds : ['all'],
      });

      setFormSuccess(t('تم تحديث بيانات وصلاحيات المستخدم بنجاح.', 'User updated successfully!'));
      setTimeout(() => {
        setModalMode('NONE');
        resetForm();
      }, 700);
    }
  };

  const handleToggleStatus = (u: ManagedUser) => {
    if (u.id === 'usr_root_csuite' || u.id === 'usr_root_csuite_01' || u.role === 'SUPER_ADMIN') {
      alert(t('لا يمكن تعطيل حساب الإدارة العليا وحوكمة النظام المؤسسي.', 'Cannot deactivate root administrator account.'));
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

  // Quick reset password execution
  const handleExecuteResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPasswordUser || !newPasswordVal || newPasswordVal.length < 6) return;
    updateManagedUser(resetPasswordUser.id, { passwordHash: newPasswordVal });
    setResetSuccess(true);
    setTimeout(() => {
      setResetPasswordUser(null);
      setNewPasswordVal('');
      setResetSuccess(false);
    }, 900);
  };

  // Filtered Users calculation
  const filteredUsers = useMemo(() => {
    return managedUsers.filter(u => {
      // Status filter
      if (statusFilter === 'ACTIVE' && u.status !== 'ACTIVE') return false;
      if (statusFilter === 'SUSPENDED' && u.status !== 'SUSPENDED') return false;

      // Company filter
      if (companyFilter !== 'ALL') {
        const uCompanies = u.allowedCompanyIds || ['all'];
        if (!uCompanies.includes('all') && !uCompanies.includes(companyFilter)) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesNameAr = (u.nameAr || '').toLowerCase().includes(q);
        const matchesNameEn = (u.nameEn || '').toLowerCase().includes(q);
        const matchesEmail = (u.email || '').toLowerCase().includes(q);
        const matchesUser = (u.username || '').toLowerCase().includes(q);
        const matchesDept = (u.departmentAr || '').toLowerCase().includes(q);
        const matchesRole = (u.roleLabelAr || '').toLowerCase().includes(q);
        if (!matchesNameAr && !matchesNameEn && !matchesEmail && !matchesUser && !matchesDept && !matchesRole) {
          return false;
        }
      }

      return true;
    });
  }, [managedUsers, statusFilter, companyFilter, searchQuery]);

  // Live KPI Counters
  const kpiStats = useMemo(() => {
    const totalUsers = managedUsers.length;
    const activeUsers = managedUsers.filter(u => u.status === 'ACTIVE').length;
    const distinctRoles = new Set(managedUsers.map(u => u.roleLabelAr || u.role)).size;
    const connectedCompanies = companies.length;
    return { totalUsers, activeUsers, distinctRoles, connectedCompanies };
  }, [managedUsers, companies]);

  // Filtered audit logs for the selected audit user
  const userAuditEntries = useMemo(() => {
    if (!auditUser) return [];
    return auditLogs.filter(
      log =>
        log.detailsAr?.includes(auditUser.nameAr) ||
        log.detailsAr?.includes(auditUser.email) ||
        log.actorEmail === auditUser.email ||
        (log as any).details?.includes(auditUser.nameAr) ||
        (log as any).details?.includes(auditUser.email)
    );
  }, [auditLogs, auditUser]);

  const passwordStrength = useMemo(() => {
    return calculatePasswordStrength(password);
  }, [password]);

  const resetPasswordStrength = useMemo(() => {
    return calculatePasswordStrength(newPasswordVal);
  }, [newPasswordVal]);

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* =========================================================================
          1. 3D CINEMATIC IDENTITY COMMAND HEADER & LIVE KPIS
         ========================================================================= */}
      <div className="relative rounded-3xl border border-amber-500/25 dark:border-amber-500/30 bg-gradient-to-br from-[#FFFDF9] via-[#F8F5EE] to-[#EFE8DC] dark:from-[#17231A] dark:via-[#111A13] dark:to-[#0A100B] p-6 sm:p-8 shadow-xl overflow-hidden">
        {/* Ambient 3D Glow Orbs */}
        <div className="absolute top-0 end-0 w-80 h-80 rounded-full bg-amber-500/10 dark:bg-amber-400/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 start-0 w-60 h-60 rounded-full bg-emerald-500/10 dark:bg-emerald-400/5 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#E0D9CB]/70 dark:border-[#243628]">
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-300 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/25 shrink-0 transform hover:scale-105 transition-transform duration-300">
              <Users className="w-7 h-7 stroke-[2.3]" />
              <span className="absolute -top-1 -end-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white dark:border-[#111A13]"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-[#1A241C] dark:text-[#F3EFE6] tracking-tight">
                  {t('إدارة المستخدمين والهوية المؤسسية', 'User Identity & Access Management')}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 dark:bg-amber-400/15 text-amber-900 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>{t('منظومة الحوكمة السحابية', 'Cloud IAM')}</span>
                </span>
              </div>
              <p className="text-xs text-[#5C665E] dark:text-[#8FA392] mt-1 max-w-2xl leading-relaxed">
                {t(
                  'التحكم المركزي في حسابات المستخدمين، التسكين الوظيفي، وتعيين نطاقات الوصول للشركات الشقيقة ومصفوفة الصلاحيات.',
                  'Centralized identity governance, role assignment, multi-company access boundaries, and granular RBAC matrices.'
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start lg:self-center shrink-0">
            <button
              type="button"
              onClick={() => setPermissionsModalOpen(true)}
              className="px-4 py-2.5 rounded-xl border border-amber-500/40 hover:border-amber-500 bg-white/70 dark:bg-[#1A2E22]/80 hover:bg-amber-500/10 text-amber-900 dark:text-amber-300 font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>{t('مصفوفة الصلاحيات (RBAC)', 'RBAC Matrix')}</span>
            </button>

            <button
              type="button"
              onClick={handleOpenAdd}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-l from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/25 active:scale-95 transition-all cursor-pointer dark:from-amber-500 dark:to-amber-600 dark:text-slate-950"
            >
              <UserPlus className="w-4 h-4 stroke-[2.5]" />
              <span>{t('إضافة مستخدم جديد', 'Add New User')}</span>
            </button>
          </div>
        </div>

        {/* Live Counters 3D Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6">
          {/* Card 1: Total Users */}
          <div className="p-4 rounded-2xl bg-white/80 dark:bg-[#131D15]/80 border border-[#E0D9CB] dark:border-[#243628] shadow-xs backdrop-blur-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#5C665E] dark:text-[#8FA392] block">
                {t('إجمالي المستخدمين', 'Total Users')}
              </span>
              <span className="text-lg sm:text-xl font-black text-[#1A241C] dark:text-[#F3EFE6] font-mono">
                {kpiStats.totalUsers}
              </span>
            </div>
          </div>

          {/* Card 2: Active Accounts */}
          <div className="p-4 rounded-2xl bg-white/80 dark:bg-[#131D15]/80 border border-[#E0D9CB] dark:border-[#243628] shadow-xs backdrop-blur-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#5C665E] dark:text-[#8FA392] block">
                {t('الحسابات النشطة', 'Active Accounts')}
              </span>
              <span className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                {kpiStats.activeUsers}
              </span>
            </div>
          </div>

          {/* Card 3: Active Roles */}
          <div className="p-4 rounded-2xl bg-white/80 dark:bg-[#131D15]/80 border border-[#E0D9CB] dark:border-[#243628] shadow-xs backdrop-blur-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#5C665E] dark:text-[#8FA392] block">
                {t('الأدوار الوظيفية المفعلة', 'Active Roles')}
              </span>
              <span className="text-lg sm:text-xl font-black text-[#1A241C] dark:text-[#F3EFE6] font-mono">
                {kpiStats.distinctRoles}
              </span>
            </div>
          </div>

          {/* Card 4: Connected Companies */}
          <div className="p-4 rounded-2xl bg-white/80 dark:bg-[#131D15]/80 border border-[#E0D9CB] dark:border-[#243628] shadow-xs backdrop-blur-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#5C665E] dark:text-[#8FA392] block">
                {t('الشركات المسجلة', 'Registered Companies')}
              </span>
              <span className="text-lg sm:text-xl font-black text-[#1A241C] dark:text-[#F3EFE6] font-mono">
                {kpiStats.connectedCompanies}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Filters Pill Bar */}
        <div className="mt-6 pt-5 border-t border-[#E0D9CB]/60 dark:border-[#243628] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Status Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <span className="text-[11px] font-bold text-[#5C665E] dark:text-[#8FA392] me-1 shrink-0">
              {t('الحالة:', 'Status:')}
            </span>
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                statusFilter === 'ALL'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'bg-white/60 dark:bg-[#131D15] text-[#5C665E] dark:text-[#8FA392] hover:bg-white dark:hover:bg-[#1A2E22]'
              }`}
            >
              {t('الكل', 'All')} ({managedUsers.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('ACTIVE')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                statusFilter === 'ACTIVE'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white/60 dark:bg-[#131D15] text-[#5C665E] dark:text-[#8FA392] hover:bg-white dark:hover:bg-[#1A2E22]'
              }`}
            >
              {t('نشط', 'Active')} ({kpiStats.activeUsers})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('SUSPENDED')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                statusFilter === 'SUSPENDED'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-white/60 dark:bg-[#131D15] text-[#5C665E] dark:text-[#8FA392] hover:bg-white dark:hover:bg-[#1A2E22]'
              }`}
            >
              {t('موقوف', 'Suspended')} ({managedUsers.length - kpiStats.activeUsers})
            </button>
          </div>

          {/* Company Filter Dropdown & Search Bar */}
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <select
                value={companyFilter}
                onChange={e => setCompanyFilter(e.target.value)}
                className="appearance-none ps-3 pe-8 py-2 rounded-xl text-xs font-bold bg-white dark:bg-[#121B14] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="ALL">{t('جميع الشركات', 'All Companies')}</option>
                {companies.map(c => (
                  <option key={c.id} value={c.id}>
                    {isRtl ? c.nameAr : c.nameEn}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#5C665E] dark:text-[#8FA392] absolute inset-y-0 end-2.5 my-auto pointer-events-none" />
            </div>

            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-[#5C665E] dark:text-[#8FA392] absolute inset-y-0 start-3 my-auto pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t('بحث بالاسم، البريد أو الوظيفة...', 'Search users...')}
                className="w-full ps-8 pe-3 py-2 rounded-xl text-xs bg-white dark:bg-[#121B14] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. 3D INTERACTIVE USER IDENTITY CARDS (ID BADGE LUXURY STYLE)
         ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredUsers.map(u => {
          const isRoot =
            u.id === 'usr_root_csuite' ||
            u.id === 'usr_root_csuite_01' ||
            u.role === 'SUPER_ADMIN';
          const isActive = u.status === 'ACTIVE';

          // Authorized companies display
          const hasAllAccess = !u.allowedCompanyIds || u.allowedCompanyIds.includes('all') || u.allowedCompanyIds.length === 0;
          const assignedCompanies = hasAllAccess
            ? []
            : companies.filter(c => u.allowedCompanyIds?.includes(c.id));

          // Clean National ID (Display "غير مسجل" if empty or unset)
          const rawNid = String(u.nationalId || '').trim();
          const cleanNid = (rawNid && rawNid !== '29001010100000' && !rawNid.startsWith('NID_UNSET_'))
            ? rawNid
            : null;

          return (
            <div
              key={u.id}
              className={`group relative rounded-3xl p-5 border text-start transition-all duration-300 flex flex-col justify-between gap-4 overflow-hidden ${
                isRoot
                  ? 'bg-gradient-to-br from-white via-amber-50/20 to-[#FAF5E8] dark:from-[#17231A] dark:via-[#131D15] dark:to-[#0D1610] border-amber-500/50 shadow-md hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-1'
                  : 'bg-white dark:bg-[#131D15] border-[#E0D9CB] dark:border-[#243628] hover:border-amber-500/40 hover:shadow-lg hover:-translate-y-1'
              }`}
            >
              {/* Top Golden Light Strip on Hover */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div>
                {/* ID Card Top Bar: Avatar Halo + Identity + Live Status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Glowing Avatar Badge */}
                    <div className="relative">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1C291E] via-[#2F4532] to-[#D99B26] text-white flex items-center justify-center font-black text-base shadow-md shadow-amber-900/10 shrink-0">
                        {u.nameAr ? u.nameAr.charAt(0) : 'م'}
                      </div>
                      {/* Active Status Pulse Dot */}
                      <span
                        className={`absolute -bottom-1 -end-1 w-4 h-4 rounded-full border-2 border-white dark:border-[#131D15] flex items-center justify-center ${
                          isActive ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                        title={isActive ? t('حساب نشط', 'Active') : t('حساب موقوف', 'Suspended')}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full bg-white ${isActive ? 'animate-pulse' : ''}`} />
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="text-sm font-black text-[#1A241C] dark:text-[#F3EFE6] truncate">
                          {isRtl ? u.nameAr : (u.nameEn || u.nameAr)}
                        </h3>
                        {isRoot && (
                          <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-[#D99B26] dark:text-[#EBB34D] text-[9px] font-black border border-amber-500/40 tracking-wider">
                            ROOT
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#5C665E] dark:text-[#8FA392] truncate font-mono mt-0.5">
                        {u.email}
                      </p>
                    </div>
                  </div>

                  {/* Status Toggle Pill */}
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(u)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer shrink-0 ${
                      isActive
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                        : 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/25'
                    }`}
                    title={t('انقر لتغيير حالة الحساب', 'Click to toggle status')}
                  >
                    {isActive ? t('نشط', 'Active') : t('موقوف', 'Suspended')}
                  </button>
                </div>

                {/* Identity & Role Chips */}
                <div className="flex items-center gap-2 flex-wrap mt-3.5">
                  {/* Department Chip */}
                  <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-[#1A2E22] text-[#1A241C] dark:text-[#C5D6C9] text-[11px] font-semibold flex items-center gap-1 border border-slate-200/60 dark:border-[#243628]">
                    <Building2 className="w-3 h-3 text-amber-500" />
                    <span className="truncate max-w-[130px]">
                      {isRtl ? (u.departmentAr || u.departmentId || 'الإدارة') : (u.departmentEn || u.departmentAr)}
                    </span>
                  </span>

                  {/* Job Title Chip */}
                  <span className="px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-900 dark:text-amber-300 text-[11px] font-bold flex items-center gap-1 border border-amber-500/30">
                    <Briefcase className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                    <span className="truncate max-w-[140px]">
                      {isRtl ? cleanArabicTitle(u.jobTitleAr || u.roleLabelAr || u.role) : (u.jobTitleEn || u.roleLabelEn || u.role)}
                    </span>
                  </span>
                </div>

                {/* Multi-Company Access Chips (PART 3) */}
                <div className="mt-3 pt-3 border-t border-[#E0D9CB]/50 dark:border-[#243628]/50">
                  <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-[#5C665E] dark:text-[#8FA392] mb-1.5">
                    <Globe className="w-3 h-3 text-amber-500" />
                    <span>{t('نطاق الشركات المصرح بها:', 'Authorized Companies:')}</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {hasAllAccess ? (
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                        <BadgeCheck className="w-3 h-3 text-emerald-500" />
                        <span>{t('جميع الشركات (وصول شامل)', 'All Companies')}</span>
                      </span>
                    ) : assignedCompanies.length > 0 ? (
                      assignedCompanies.map(comp => (
                        <span
                          key={comp.id}
                          className="px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-800 dark:text-blue-300 text-[10px] font-bold border border-blue-500/25 truncate max-w-[150px]"
                        >
                          {isRtl ? comp.nameAr : comp.nameEn}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-slate-400">
                        {t('غير محدد (وصول عام)', 'Unrestricted')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Metadata Grid: Username, National ID, Created At */}
                <div className="grid grid-cols-2 gap-2 mt-3 p-2.5 rounded-2xl bg-slate-50 dark:bg-[#0E1610] border border-slate-200/70 dark:border-[#1F2E23] text-[11px]">
                  <div>
                    <span className="text-slate-400 dark:text-[#8FA392] block text-[10px]">
                      {t('اسم المستخدم', 'Username')}
                    </span>
                    <span className="font-mono font-semibold text-slate-800 dark:text-[#E0D9CB] truncate block">
                      @{u.username}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 dark:text-[#8FA392] block text-[10px]">
                      {t('الرقم القومي', 'National ID')}
                    </span>
                    {cleanNid ? (
                      <span className="font-mono font-semibold text-slate-800 dark:text-[#E0D9CB]">
                        {cleanNid}
                      </span>
                    ) : (
                      <span className="text-amber-700 dark:text-amber-400 font-bold text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 inline-block">
                        {t('غير مسجل', 'Unregistered')}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Golden Icon-Only Action Bar */}
              <div className="pt-2.5 border-t border-[#E0D9CB]/60 dark:border-[#243628]/60 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 dark:text-[#8FA392] font-mono">
                  {u.createdAt ? u.createdAt.substring(0, 10) : '—'}
                </span>

                <div className="flex items-center gap-1">
                  {/* 1. تخصيص مصفوفة الصلاحيات (RBAC) */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPermissionUserId(u.id);
                      setPermissionsModalOpen(true);
                    }}
                    title={t('تخصيص مصفوفة الصلاحيات (RBAC)', 'RBAC Permissions Matrix')}
                    className="w-7 h-7 rounded-xl flex items-center justify-center text-emerald-600 hover:bg-emerald-500/15 transition-colors cursor-pointer"
                  >
                    <Shield className="w-4 h-4 text-emerald-500" />
                  </button>

                  {/* 2. إعادة تعيين كلمة المرور السريعة 🔑 */}
                  <button
                    type="button"
                    onClick={() => {
                      setResetPasswordUser(u);
                      setNewPasswordVal('');
                      setResetSuccess(false);
                    }}
                    title={t('إعادة تعيين كلمة المرور السريعة', 'Quick Password Reset')}
                    className="w-7 h-7 rounded-xl flex items-center justify-center text-amber-500 hover:bg-amber-500/15 transition-colors cursor-pointer"
                  >
                    <Key className="w-4 h-4 text-amber-500" />
                  </button>

                  {/* 3. سجل تعديلات الحساب (! Audit Log) */}
                  <button
                    type="button"
                    onClick={() => setAuditUser(u)}
                    title={t('سجل تعديلات الحساب والنشاط (!)', 'Account Audit Trail')}
                    className="w-7 h-7 rounded-xl flex items-center justify-center text-blue-500 hover:bg-blue-500/15 transition-colors cursor-pointer"
                  >
                    <AlertCircle className="w-4 h-4 text-blue-500" />
                  </button>

                  {/* 4. تفعيل / إيقاف الحساب ⚡ */}
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(u)}
                    title={isActive ? t('تعطيل الحساب', 'Suspend Account') : t('تفعيل الحساب', 'Activate Account')}
                    className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                      isActive
                        ? 'text-slate-600 hover:text-amber-600 hover:bg-amber-500/15'
                        : 'text-emerald-600 hover:bg-emerald-500/15'
                    }`}
                  >
                    <Power className="w-4 h-4" />
                  </button>

                  {/* 5. تعديل بيانات المستخدم ✏️ */}
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(u)}
                    title={t('تعديل بيانات المستخدم', 'Edit User')}
                    className="w-7 h-7 rounded-xl flex items-center justify-center text-amber-500 hover:bg-amber-500/15 transition-colors cursor-pointer"
                  >
                    <Pencil className="w-4 h-4 text-amber-500" />
                  </button>

                  {/* 6. حذف الحساب 🗑️ */}
                  {!isRoot && (
                    <button
                      type="button"
                      onClick={() => handleDelete(u)}
                      title={t('حذف المستخدم نهائياً', 'Delete User')}
                      className="w-7 h-7 rounded-xl flex items-center justify-center text-rose-500 hover:bg-rose-500/15 transition-colors cursor-pointer"
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

      {filteredUsers.length === 0 && (
        <div className="py-12 text-center rounded-3xl border border-dashed border-[#E0D9CB] dark:border-[#243628] bg-white/50 dark:bg-[#121B14]/50">
          <Users className="w-12 h-12 text-slate-300 dark:text-[#8FA392]/40 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-[#1A241C] dark:text-[#F3EFE6]">
            {t('لا توجد حسابات مستخدمين مطابقة', 'No matching users found')}
          </h3>
          <p className="text-xs text-[#5C665E] dark:text-[#8FA392] mt-1">
            {t('جرب البحث بكلمات أخرى أو تغيير خيارات التصفية.', 'Try adjusting your filters or search keywords.')}
          </p>
        </div>
      )}

      {/* =========================================================================
          3. UPGRADED 3-STEP / SECTIONED GLASS MODAL: إضافة / تعديل مستخدم
         ========================================================================= */}
      {modalMode !== 'NONE' && (
        <div className="fixed inset-0 !m-0 !top-0 !left-0 !right-0 !bottom-0 w-screen h-screen z-[999] flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-[#111A13] border border-amber-500/30 dark:border-amber-500/30 shadow-2xl p-6 sm:p-8 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-[#243628] mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
                  <UserPlus className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-[#F3EFE6]">
                    {modalMode === 'ADD' ? t('إضافة مستخدم جديد للنظام', 'Add New User Account') : t('تعديل بيانات المستخدم', 'Edit User Account')}
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-[#8FA392]">
                    {t('التعريف المؤسسي، التسكين الوظيفي، وتحديد نطاق الشركات والاعتمادات.', 'Identity details, job role, and multi-company access scope.')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalMode('NONE')}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1A2E22] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Import from HR Employees (Optional 1-Click Bar) */}
            {modalMode === 'ADD' && hrEmployees.length > 0 && (
              <div className="mb-5 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="text-xs font-bold text-amber-950 dark:text-amber-200">
                    {t('استيراد بيانات الموظف من سجل الموارد البشرية (HRMS):', 'Quick Import from HR Employees:')}
                  </span>
                </div>
                <select
                  defaultValue=""
                  onChange={e => handleImportHREmployee(e.target.value)}
                  className="px-3 py-1.5 rounded-xl text-xs bg-white dark:bg-[#17231A] border border-amber-500/30 text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none focus:border-amber-500 cursor-pointer font-medium"
                >
                  <option value="" disabled>
                    {t('اختر موظفاً للاستيراد التلقائي...', 'Select an employee to auto-fill...')}
                  </option>
                  {hrEmployees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.nameAr || emp.name} {emp.jobTitle ? `(${emp.jobTitle})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Feedback Notifications */}
            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}
            {formSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            {/* Main Form */}
            <form onSubmit={handleSubmit} className="space-y-6 text-start">
              {/* SECTION 1: الهوية والبيانات الشخصية */}
              <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-[#141F16]/80 border border-slate-200/80 dark:border-[#1F2E23] space-y-3.5">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60 dark:border-[#1F2E23]">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
                    1
                  </span>
                  <h3 className="text-xs font-black text-slate-900 dark:text-[#F3EFE6]">
                    {t('الهوية والبيانات الشخصية', 'Personal Identity Details')}
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-xs font-bold text-[#1A241C] dark:text-[#E0D9CB] block mb-1">
                      {t('الاسم بالكامل (عربي) *', 'Full Name (Arabic) *')}
                    </label>
                    <input
                      type="text"
                      name="eco_new_user_fullname_ar"
                      value={nameAr}
                      onChange={e => setNameAr(e.target.value)}
                      required
                      placeholder={t('أدخل الاسم الرباعي باللغة العربية', 'Full name in Arabic')}
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-white dark:bg-[#07130E] border border-[#E0D9CB] dark:border-[#243628] focus:border-amber-500 text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#1A241C] dark:text-[#E0D9CB] block mb-1">
                      {t('الاسم بالكامل (إنجليزي)', 'Full Name (English)')}
                    </label>
                    <input
                      type="text"
                      name="eco_new_user_fullname_en"
                      value={nameEn}
                      onChange={e => setNameEn(e.target.value)}
                      dir="ltr"
                      placeholder={t('Full name in English as in official documents', 'Full name in English')}
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-white dark:bg-[#07130E] border border-[#E0D9CB] dark:border-[#243628] focus:border-amber-500 text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none transition-colors font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-xs font-bold text-[#1A241C] dark:text-[#E0D9CB] block mb-1">
                      {t('الرقم القومي (14 رقماً)', 'National ID (14 digits)')}
                    </label>
                    <input
                      type="text"
                      name="eco_new_user_national_id"
                      value={nationalId}
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 14);
                        setNationalId(val);
                      }}
                      dir="ltr"
                      maxLength={14}
                      placeholder={t('الرقم القومي المكون من 14 رقماً (اختياري)', '14-digit National ID')}
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-white dark:bg-[#07130E] border border-[#E0D9CB] dark:border-[#243628] focus:border-amber-500 text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none transition-colors font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#1A241C] dark:text-[#E0D9CB] block mb-1">
                      {t('رقم الهاتف', 'Phone Number')}
                    </label>
                    <input
                      type="tel"
                      name="eco_new_user_phone"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      dir="ltr"
                      placeholder="+20 100 000 0000"
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-white dark:bg-[#07130E] border border-[#E0D9CB] dark:border-[#243628] focus:border-amber-500 text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none transition-colors font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: التسكين الوظيفي والشركات المصرح بها */}
              <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-[#141F16]/80 border border-slate-200/80 dark:border-[#1F2E23] space-y-3.5">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60 dark:border-[#1F2E23]">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
                    2
                  </span>
                  <h3 className="text-xs font-black text-slate-900 dark:text-[#F3EFE6]">
                    {t('التسكين الوظيفي والشركات المصرح بالوصول إليها', 'Role & Multi-Company Access Boundaries')}
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <CreatableSelect
                      category="departments"
                      label={t('القسم / الإدارة', 'Department')}
                      value={departmentNameAr || departmentId}
                      onChange={(val, opt) => {
                        setDepartmentId(val);
                        setDepartmentNameAr(opt?.labelAr || val);
                      }}
                      placeholder={t('اختر القسم أو الإدارة أو اكتب لإضافة قسم جديد...', 'Select or create department...')}
                    />
                  </div>

                  <div>
                    <CreatableSelect
                      category="roles"
                      label={t('الدور / المسمى الوظيفي', 'Job Role')}
                      value={roleLabelAr || role}
                      onChange={(val, opt) => {
                        setRole(val as UserRole);
                        setRoleLabelAr(opt?.labelAr || val);
                      }}
                      placeholder={t('اختر المسمى الوظيفي أو اكتب لإضافة تخصص جديد...', 'Select or create job title...')}
                    />
                  </div>
                </div>

                {/* Multi-Company Access Assignment Chips */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-[#1A241C] dark:text-[#E0D9CB] flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-amber-500" />
                      <span>{t('نطاق الشركات المصرح بالوصول إليها (Multi-Company Access) *', 'Authorized Companies Scope *')}</span>
                    </label>
                    <span className="text-[10px] text-slate-400">
                      {allowedCompanyIds.includes('all') ? t('وصول كامل لكافة المنشآت', 'Global Access') : `${allowedCompanyIds.length} ${t('شركات محددة', 'selected')}`}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-[#07130E] border border-slate-200 dark:border-[#243628] space-y-2.5">
                    {/* All Companies Toggle Chip */}
                    <button
                      type="button"
                      onClick={() => handleToggleAllowedCompany('all')}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer border ${
                        allowedCompanyIds.includes('all')
                          ? 'bg-emerald-500/15 border-emerald-500 text-emerald-800 dark:text-emerald-300 shadow-xs'
                          : 'bg-slate-50 dark:bg-[#121B14] border-slate-200 dark:border-[#243628] text-slate-700 dark:text-[#C5D6C9] hover:border-amber-500/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>{t('جميع الشركات والمنشآت التابعة للمجموعة (وصول شامل وغير مقيد)', 'All Group Companies & Subsidiaries (Full Access)')}</span>
                      </div>
                      {allowedCompanyIds.includes('all') && (
                        <Check className="w-4 h-4 text-emerald-500 stroke-[2.5]" />
                      )}
                    </button>

                    {/* Specific Company Chips */}
                    <div className="pt-2 border-t border-slate-100 dark:border-[#1F2E23]">
                      <span className="text-[10.5px] text-slate-400 dark:text-[#8FA392] block mb-1.5">
                        {t('أو حدد شركات معينة فقط لتقييد هذا الحساب بها:', 'Or select specific companies to restrict access:')}
                      </span>
                      <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1">
                        {companies.map(comp => {
                          const isSelected = !allowedCompanyIds.includes('all') && allowedCompanyIds.includes(comp.id);
                          return (
                            <button
                              key={comp.id}
                              type="button"
                              onClick={() => handleToggleAllowedCompany(comp.id)}
                              className={`py-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                                isSelected
                                  ? 'bg-amber-500/20 border-amber-500 text-amber-950 dark:text-amber-200 shadow-xs font-bold'
                                  : 'bg-slate-50 dark:bg-[#131E15] border-slate-200 dark:border-[#243628] text-slate-700 dark:text-[#C5D6C9] hover:border-amber-500/40'
                              }`}
                            >
                              <Building2 className={`w-3 h-3 ${isSelected ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'}`} />
                              <span className="truncate max-w-[160px]">{isRtl ? comp.nameAr : comp.nameEn}</span>
                              {isSelected && <Check className="w-3 h-3 text-amber-600 dark:text-amber-400" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: بيانات الدخول والأمان السحابي */}
              <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-[#141F16]/80 border border-slate-200/80 dark:border-[#1F2E23] space-y-3.5">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60 dark:border-[#1F2E23]">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
                    3
                  </span>
                  <h3 className="text-xs font-black text-slate-900 dark:text-[#F3EFE6]">
                    {t('بيانات الدخول والأمان السحابي', 'Login Credentials & Cloud Security')}
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-xs font-bold text-[#1A241C] dark:text-[#E0D9CB] block mb-1">
                      {t('البريد الإلكتروني الرسمي *', 'Official Email *')}
                    </label>
                    <input
                      type="email"
                      name="eco_new_user_email_address"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onFocus={() => unlockField('email')}
                      readOnly={modalMode === 'ADD' && !unlockedInputs.email}
                      autoComplete="new-password"
                      required
                      dir="ltr"
                      placeholder="user@hrsup.com"
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-white dark:bg-[#07130E] border border-[#E0D9CB] dark:border-[#243628] focus:border-amber-500 text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none transition-colors font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#1A241C] dark:text-[#E0D9CB] block mb-1">
                      {t('اسم المستخدم الفريد *', 'Unique Username *')}
                    </label>
                    <input
                      type="text"
                      name="eco_new_user_login_identity"
                      value={username}
                      onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      onFocus={() => unlockField('username')}
                      readOnly={modalMode === 'ADD' && !unlockedInputs.username}
                      autoComplete="new-password"
                      required
                      dir="ltr"
                      placeholder="e.g. y.hegazy"
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-white dark:bg-[#07130E] border border-[#E0D9CB] dark:border-[#243628] focus:border-amber-500 text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none transition-colors font-mono"
                    />
                  </div>
                </div>

                {/* Password with Strength Meter & Auto-Generator */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-[#1A241C] dark:text-[#E0D9CB]">
                      {modalMode === 'ADD'
                        ? t('كلمة المرور *', 'Password *')
                        : t('كلمة المرور الجديدة', 'New Password')}
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        const newPass = generateStrongPassword();
                        setPassword(newPass);
                        setShowPassword(true);
                      }}
                      className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>{t('توليد كلمة مرور قوية', 'Generate Password')}</span>
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="eco_new_user_secret_code"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      onFocus={() => unlockField('password')}
                      readOnly={modalMode === 'ADD' && !unlockedInputs.password}
                      autoComplete="new-password"
                      required={modalMode === 'ADD'}
                      dir="ltr"
                      placeholder={modalMode === 'EDIT' ? t('اترك الحقل فارغاً للإبقاء على كلمة المرور الحالية دون تغيير', 'Leave blank to keep current password unchanged') : t('أدخل كلمة مرور قوية (أو انقر على توليد تلقائي)', 'Enter password or auto-generate')}
                      className="w-full ps-3.5 pe-10 py-2.5 rounded-xl text-xs bg-white dark:bg-[#07130E] border border-[#E0D9CB] dark:border-[#243628] focus:border-amber-500 text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none transition-colors font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 end-0 pe-3 flex items-center text-[#5C665E] dark:text-[#8FA392] hover:text-[#D99B26] dark:hover:text-[#EBB34D] transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {modalMode === 'EDIT' && (
                    <p className="text-[11px] text-slate-500 dark:text-[#8FA392] mt-1.5 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>{t('اترك هذا الحقل فارغاً إذا كنت لا ترغب في تغيير كلمة مرور المستخدم الحالية.', 'Leave blank if you do not want to change the user\'s current password.')}</span>
                    </p>
                  )}

                  {/* Password Strength Meter */}
                  {password && (
                    <div className="mt-2 space-y-1">
                      <div className="h-1.5 w-full bg-slate-200 dark:bg-[#1E2E22] rounded-full overflow-hidden">
                        <div
                          className={`h-full ${passwordStrength.color} transition-all duration-300 ${passwordStrength.width}`}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-400">
                          {t('قوة كلمة المرور:', 'Strength:')} <strong className="text-slate-700 dark:text-[#E0D9CB]">{passwordStrength.labelAr}</strong>
                        </span>
                        <span className="font-mono text-slate-400">{password.length} {t('رمز', 'chars')}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="pt-4 border-t border-[#E0D9CB] dark:border-[#243628] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalMode('NONE')}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#EAE4D7] dark:bg-[#1F2E23] text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6] transition-colors cursor-pointer"
                >
                  {t('إلغاء', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-l from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer flex items-center gap-2 dark:from-amber-500 dark:to-amber-600 dark:text-slate-950"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{modalMode === 'ADD' ? t('حفظ واعتماد المستخدم', 'Save & Deploy User') : t('تحديث البيانات', 'Update User')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          4. DEDICATED QUICK RESET PASSWORD MODAL (🔑 Quick Action)
         ========================================================================= */}
      {resetPasswordUser && (
        <div className="fixed inset-0 !m-0 !top-0 !left-0 !right-0 !bottom-0 w-screen h-screen z-[999] flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#121B14] border border-amber-500/40 shadow-2xl p-6 sm:p-7">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#243628] mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
                  <Key className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-[#F3EFE6]">
                    {t('إعادة تعيين كلمة المرور', 'Quick Password Reset')}
                  </h3>
                  <span className="text-[11px] text-slate-500 dark:text-[#8FA392]">
                    {resetPasswordUser.nameAr} (@{resetPasswordUser.username})
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setResetPasswordUser(null)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {resetSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{t('تم تعيين كلمة المرور بنجاح!', 'Password reset successfully!')}</span>
              </div>
            )}

            <form onSubmit={handleExecuteResetPassword} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-800 dark:text-[#E0D9CB]">
                    {t('كلمة المرور الجديدة *', 'New Password *')}
                  </label>
                  <button
                    type="button"
                    onClick={() => setNewPasswordVal(generateStrongPassword())}
                    className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>{t('⚡ توليد تلقائي', 'Auto-Generate')}</span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPasswordVal}
                    onChange={e => setNewPasswordVal(e.target.value)}
                    required
                    dir="ltr"
                    placeholder={t('أدخل كلمة مرور جديدة أو ولد تلقائياً', 'Enter new password')}
                    className="w-full ps-3.5 pe-10 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-[#07130E] border border-slate-200 dark:border-[#243628] focus:border-amber-500 text-slate-900 dark:text-[#F3EFE6] focus:outline-none transition-colors font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 end-0 pe-3 flex items-center text-slate-400 hover:text-amber-500 cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {newPasswordVal && (
                  <div className="mt-2 space-y-1">
                    <div className="h-1.5 w-full bg-slate-200 dark:bg-[#1E2E22] rounded-full overflow-hidden">
                      <div
                        className={`h-full ${resetPasswordStrength.color} transition-all duration-300 ${resetPasswordStrength.width}`}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">
                        {t('مستوى الحماية:', 'Strength:')} <strong className="text-slate-700 dark:text-[#E0D9CB]">{resetPasswordStrength.labelAr}</strong>
                      </span>
                      <span className="font-mono text-slate-400">{newPasswordVal.length} {t('رمز', 'chars')}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-[#243628] flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setResetPasswordUser(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-[#1F2E23] text-slate-700 dark:text-[#8FA392] cursor-pointer"
                >
                  {t('إلغاء', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={!newPasswordVal || newPasswordVal.length < 6}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 cursor-pointer shadow-md disabled:opacity-50"
                >
                  {t('حفظ كلمة المرور', 'Save Password')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          5. USER ACCOUNT AUDIT LOG MODAL (! Audit Trail)
         ========================================================================= */}
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
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#07130E] border border-slate-200 dark:border-[#1A3327] mb-4 text-xs space-y-1.5">
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
                  {auditUser.status === 'ACTIVE' ? t('نشط', 'Active') : t('موقوف', 'Suspended')}
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

      {/* =========================================================================
          6. RBAC PERMISSIONS MATRIX MODAL
         ========================================================================= */}
      <PermissionsManagerModal
        isOpen={permissionsModalOpen}
        initialUserId={selectedPermissionUserId}
        onClose={() => {
          setPermissionsModalOpen(false);
          setSelectedPermissionUserId('');
        }}
      />
    </div>
  );
};
