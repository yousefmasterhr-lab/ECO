import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { ManagedUser } from '../../../types/auth';
import {
  DepartmentKey,
  ERP_MODULES_MATRIX_CONFIG,
  cleanArabicTitle,
} from '../../../types/rbac';
import {
  X,
  ShieldCheck,
  Check,
  Save,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Users,
  Eye,
  PlusCircle,
  Pencil,
  FileText,
  Clock,
  Trash2,
  ShieldAlert,
  UserPlus,
  Sparkles,
  CheckSquare,
  Square,
} from 'lucide-react';

export interface PermissionsManagerModalProps {
  isOpen: boolean;
  initialUserId?: string;
  onClose: () => void;
}

// Ordered list of all 12 modules for the matrix navigation rail
const MODULE_KEYS_ORDER: DepartmentKey[] = [
  'companies',
  'hr',
  'finance',
  'engineering',
  'cts',
  'legal',
  'insurance',
  'ats',
  'decrees',
  'reception',
  'executive',
  'settings',
];

export const PermissionsManagerModal: React.FC<PermissionsManagerModalProps> = ({
  isOpen,
  initialUserId,
  onClose,
}) => {
  const { managedUsers, updateUserPermissions, addManagedUser } = useAuth();
  const { t } = useLanguage();

  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [activeModuleKey, setActiveModuleKey] = useState<DepartmentKey>('companies');
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

  // Collect all permission keys across all 12 modules
  const allSystemPermissions = useMemo(() => {
    const keys: string[] = [];
    Object.values(ERP_MODULES_MATRIX_CONFIG).forEach(mod => {
      mod.subModules.forEach(sub => {
        Object.values(sub.actions).forEach(action => {
          if (action && action.key && !keys.includes(action.key)) {
            keys.push(action.key);
          }
        });
      });
    });
    return keys;
  }, []);

  // Collect view-only keys across all 12 modules
  const viewOnlyPermissions = useMemo(() => {
    const keys: string[] = [];
    Object.values(ERP_MODULES_MATRIX_CONFIG).forEach(mod => {
      mod.subModules.forEach(sub => {
        if (sub.actions.view?.key && !keys.includes(sub.actions.view.key)) {
          keys.push(sub.actions.view.key);
        }
      });
    });
    return keys;
  }, []);

  // Sync initial user when opened
  useEffect(() => {
    if (isOpen && managedUsers.length > 0) {
      const targetId = initialUserId && managedUsers.some(u => u.id === initialUserId)
        ? initialUserId
        : (selectedUserId && managedUsers.some(u => u.id === selectedUserId) ? selectedUserId : managedUsers[0].id);

      setSelectedUserId(targetId);
      const target = managedUsers.find(u => u.id === targetId);
      if (target) {
        if (target.role === 'SUPER_ADMIN' || target.id === 'usr_root_csuite_01') {
          setUserPermissions([...allSystemPermissions]);
        } else {
          setUserPermissions(target.permissions || target.customPermissions || []);
        }
      }
    }
  }, [isOpen, initialUserId, managedUsers, allSystemPermissions]);

  // When switching selected user from dropdown, load their permissions
  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId);
    setErrorMessage(null);
    setSuccessMessage(null);
    const target = managedUsers.find(u => u.id === userId);
    if (target) {
      if (target.role === 'SUPER_ADMIN' || target.id === 'usr_root_csuite_01') {
        setUserPermissions([...allSystemPermissions]);
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
    setUserPermissions(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  // Toggle entire submodule row
  const toggleRow = (subModuleId: string) => {
    const currentModule = ERP_MODULES_MATRIX_CONFIG[activeModuleKey];
    const sub = currentModule.subModules.find(s => s.id === subModuleId);
    if (!sub) return;

    const rowKeys = Object.values(sub.actions)
      .filter((a): a is { key: string; labelAr?: string } => Boolean(a && a.key))
      .map(a => a.key);

    const allSelected = rowKeys.every(k => userPermissions.includes(k));

    if (allSelected) {
      setUserPermissions(prev => prev.filter(k => !rowKeys.includes(k)));
    } else {
      setUserPermissions(prev => Array.from(new Set([...prev, ...rowKeys])));
    }
  };

  // Toggle entire active module
  const grantActiveModule = () => {
    const currentModule = ERP_MODULES_MATRIX_CONFIG[activeModuleKey];
    const moduleKeys: string[] = [];
    currentModule.subModules.forEach(sub => {
      Object.values(sub.actions).forEach(a => {
        if (a && a.key) moduleKeys.push(a.key);
      });
    });
    setUserPermissions(prev => Array.from(new Set([...prev, ...moduleKeys])));
  };

  const revokeActiveModule = () => {
    const currentModule = ERP_MODULES_MATRIX_CONFIG[activeModuleKey];
    const moduleKeys: string[] = [];
    currentModule.subModules.forEach(sub => {
      Object.values(sub.actions).forEach(a => {
        if (a && a.key) moduleKeys.push(a.key);
      });
    });
    setUserPermissions(prev => prev.filter(k => !moduleKeys.includes(k)));
  };

  // Global Presets
  const grantAll = () => {
    setUserPermissions([...allSystemPermissions]);
  };

  const revokeAll = () => {
    setUserPermissions([]);
  };

  const grantReadOnly = () => {
    setUserPermissions([...viewOnlyPermissions]);
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
        setSuccessMessage(t('تم حفظ وتحديث مصفوفة الصلاحيات بنجاح لجميع الأقسام الـ 12', 'Permissions matrix saved successfully across all 12 modules'));
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('eco-data-updated'));
          window.dispatchEvent(new CustomEvent('eco-permissions-updated'));
        }
        setTimeout(() => {
          setSuccessMessage(null);
        }, 2200);
      } else {
        setErrorMessage(res.error || t('فشل حفظ الصلاحيات', 'Failed to save permissions'));
      }
    } catch (err: any) {
      setErrorMessage(err?.message || t('حدث خطأ غير متوقع', 'Unexpected error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Quick User Creation
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserNameAr.trim() || !newUserEmail.trim() || !newUserPassword.trim()) {
      return;
    }

    const cleanTitle = cleanArabicTitle(newUserJobTitle.trim() || 'موظف بالنظام');
    const created = addManagedUser({
      nameAr: newUserNameAr.trim(),
      nameEn: newUserNameAr.trim(),
      nationalId: '',
      email: newUserEmail.trim(),
      username: newUserEmail.split('@')[0],
      jobTitleAr: cleanTitle,
      jobTitleEn: 'Staff',
      phone: '+20 100 000 0000',
      departmentAr: 'الشؤون الإدارية',
      departmentEn: 'Administration',
      departmentId: 'admin',
      role: 'HR_SPECIALIST',
      roleLabelAr: cleanTitle,
      roleLabelEn: 'Staff',
      clearanceLevel: 2,
      clearanceNameAr: 'المستوى 2 - موظف',
      clearanceNameEn: 'Level 2 - Staff',
      status: 'ACTIVE',
      passwordHash: newUserPassword,
      customPermissions: [...viewOnlyPermissions],
      permissions: [...viewOnlyPermissions],
    });

    setShowAddUser(false);
    setNewUserNameAr('');
    setNewUserJobTitle('');
    setNewUserEmail('');
    setNewUserPassword('');
    handleSelectUser(created.id);
  };

  const currentModuleConfig = ERP_MODULES_MATRIX_CONFIG[activeModuleKey];
  const CurrentModuleIcon = currentModuleConfig.icon;

  // Calculate permissions counts per module for the navigation rail
  const modulePermissionStats = useMemo(() => {
    const stats: Record<DepartmentKey, { active: number; total: number }> = {} as any;
    MODULE_KEYS_ORDER.forEach(modKey => {
      const mod = ERP_MODULES_MATRIX_CONFIG[modKey];
      let total = 0;
      let active = 0;
      mod.subModules.forEach(sub => {
        Object.values(sub.actions).forEach(a => {
          if (a && a.key) {
            total += 1;
            if (userPermissions.includes(a.key)) {
              active += 1;
            }
          }
        });
      });
      stats[modKey] = { active, total };
    });
    return stats;
  }, [userPermissions]);

  return (
    <div
      className="fixed inset-0 !m-0 !top-0 !left-0 !right-0 !bottom-0 w-screen h-screen z-[999] bg-black/65 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-6xl rounded-3xl bg-[#FBF9F5] dark:bg-[#121B14] border border-[#E0D9CB] dark:border-[#243628] shadow-2xl overflow-hidden flex flex-col h-[94vh] max-h-[94vh] animate-in fade-in-50 zoom-in-95 duration-150 my-auto text-start"
        style={{ colorScheme: 'light' }}
      >
        {/* =========================================================================
            1. 3D LUXURY HEADER BANNER
           ========================================================================= */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E0D9CB] dark:border-[#243628] bg-gradient-to-r from-[#F3EFE6] via-[#FAF6EE] to-[#F3EFE6] dark:from-[#17231A] dark:via-[#1A281E] dark:to-[#17231A] shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-500 text-white flex items-center justify-center font-bold shadow-md shadow-amber-500/20 shrink-0">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-base font-black text-slate-900 dark:text-[#F3EFE6] tracking-tight">
                  {t('إدارة المستخدمين ومصفوفة الصلاحيات الشاملة', 'Enterprise 12-Module RBAC Permissions Matrix')}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                  {t('12 موديول تنفيذي', '12 Core Modules')}
                </span>
              </div>
              <p className="text-xs text-[#5C665E] dark:text-[#8FA392] mt-0.5">
                {t('التحكم اللحظي الدقيق في كافة أزرار وإجراءات وتبويبات المنظومة الـ 12 وحفظها في قاعدة البيانات السحابية.', 'Real-time action-level access control across all 12 modules persisted per user.')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-[#5C665E] dark:text-[#8FA392] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23] hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* =========================================================================
            2. TOP COMMAND BAR: USER SELECTOR & QUICK PRESETS
           ========================================================================= */}
        <div className="px-6 py-3.5 border-b border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#121B14] flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Target User Selector */}
          <div className="flex items-center gap-2.5 flex-1 min-w-[320px]">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-[#F3EFE6] shrink-0">
              {t('المستخدم المستهدف:', 'Target User:')}
            </span>
            <select
              value={selectedUserId}
              onChange={e => handleSelectUser(e.target.value)}
              className="flex-1 px-3.5 py-2 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#17231A] text-xs font-bold text-slate-900 dark:text-[#F3EFE6] focus:outline-none focus:border-amber-500 dark:focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 shadow-xs"
            >
              {managedUsers.map(u => (
                <option key={u.id} value={u.id}>
                  {u.nameAr} ({cleanArabicTitle(u.jobTitleAr || u.roleLabelAr)}) — {u.email}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setShowAddUser(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 border border-amber-500/30 text-xs font-bold transition-all shrink-0 cursor-pointer"
              title="إضافة مستخدم جديد"
            >
              <UserPlus className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className="hidden sm:inline">{t('+ مستخدم جديد', '+ Add User')}</span>
            </button>
          </div>

          {/* Quick Preset Buttons (12 Modules) */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={grantAll}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>{t('منح الكل (12 موديول)', 'Grant All')}</span>
            </button>
            <button
              type="button"
              onClick={grantReadOnly}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/30 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{t('عرض فقط', 'Read Only')}</span>
            </button>
            <button
              type="button"
              onClick={revokeAll}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-500/15 hover:bg-rose-500/25 text-rose-700 dark:text-rose-400 border border-rose-500/30 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Square className="w-3.5 h-3.5" />
              <span>{t('سحب الكل', 'Revoke All')}</span>
            </button>
          </div>
        </div>

        {/* Super Admin Notice */}
        {isSuperAdminTarget && (
          <div className="mx-6 mt-3 p-3 rounded-2xl bg-amber-500/15 border border-amber-500/35 flex items-center gap-3 text-xs font-bold text-amber-900 dark:text-amber-300 shrink-0">
            <ShieldAlert className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>
              {t(
                'حساب إدارة عليا (مدير النظام) — الصلاحيات مفعلة بالكامل مع إمكانية التخصيص أو الاستثناء المباشر لكل موديول.',
                'Super Administrator Account: Unrestricted access active with per-module customization capability.'
              )}
            </span>
          </div>
        )}

        {/* Feedback Messages */}
        {errorMessage && (
          <div className="mx-6 mt-3 p-3 rounded-2xl bg-rose-500/15 border border-rose-500/35 flex items-center gap-2.5 text-rose-700 dark:text-rose-400 text-xs font-bold shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mx-6 mt-3 p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/35 flex items-center gap-2.5 text-emerald-700 dark:text-emerald-400 text-xs font-bold shrink-0">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* =========================================================================
            3. TWO-COLUMN 12-MODULE WORKSPACE
           ========================================================================= */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Module Navigation Rail (Right Sidebar: 12 Modules) */}
          <div className="w-72 sm:w-80 border-e border-[#E0D9CB] dark:border-[#243628] bg-[#F7F4EC] dark:bg-[#0E1610] overflow-y-auto p-3 space-y-1.5 shrink-0">
            <div className="px-3 py-2 text-[11px] font-black uppercase tracking-wider text-[#5C665E] dark:text-[#8FA392] flex items-center justify-between">
              <span>{t('أقسام المنظومة (12)', 'Modules (12)')}</span>
              <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400">
                {userPermissions.length} {t('صلاحية مفعلة', 'active')}
              </span>
            </div>

            {MODULE_KEYS_ORDER.map(modKey => {
              const mod = ERP_MODULES_MATRIX_CONFIG[modKey];
              const ModIcon = mod.icon;
              const isActive = activeModuleKey === modKey;
              const stat = modulePermissionStats[modKey] || { active: 0, total: 0 };
              const isFull = stat.total > 0 && stat.active === stat.total;
              const hasSome = stat.active > 0 && !isFull;

              return (
                <button
                  key={modKey}
                  type="button"
                  onClick={() => setActiveModuleKey(modKey)}
                  className={`w-full flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all text-start cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-l from-amber-600 to-amber-500 text-white shadow-md shadow-amber-500/25 scale-[1.01]'
                      : 'text-slate-800 dark:text-[#F3EFE6] hover:bg-[#EAE4D7] dark:hover:bg-[#17231A]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-transform ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                      }`}
                    >
                      <ModIcon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="block truncate tracking-tight">{mod.titleAr}</span>
                      <span
                        className={`text-[10px] block truncate ${
                          isActive ? 'text-amber-100' : 'text-slate-500 dark:text-[#8FA392]'
                        }`}
                      >
                        {mod.badge}
                      </span>
                    </div>
                  </div>

                  {/* Active Keys Badge */}
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold shrink-0 ${
                      isActive
                        ? 'bg-white/25 text-white'
                        : isFull
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                        : hasSome
                        ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                        : 'bg-slate-200 dark:bg-[#1E2E22] text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {stat.active} / {stat.total}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Module Submodules Matrix Table (Left Content Area) */}
          <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-[#121B14]">
            {/* Selected Module Action Bar */}
            <div className="px-6 py-3.5 border-b border-[#E0D9CB] dark:border-[#243628] bg-[#FAF8F3] dark:bg-[#152017] flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <CurrentModuleIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-[#F3EFE6] flex items-center gap-2">
                    <span>{currentModuleConfig.titleAr}</span>
                    <span className="text-xs font-normal text-slate-500 dark:text-[#8FA392]">
                      ({currentModuleConfig.subModules.length} {t('تبويبات فرعية', 'sub-modules')})
                    </span>
                  </h4>
                  <p className="text-xs text-[#5C665E] dark:text-[#8FA392]">
                    {currentModuleConfig.descriptionAr}
                  </p>
                </div>
              </div>

              {/* Module-level quick actions */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={grantActiveModule}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 border border-amber-500/30 transition-all cursor-pointer"
                >
                  {t('تحديد الكل لهذا القسم', 'Grant All in Module')}
                </button>
                <button
                  type="button"
                  onClick={revokeActiveModule}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-200 dark:bg-[#1E2E22] hover:bg-slate-300 text-slate-700 dark:text-[#8FA392] transition-all cursor-pointer"
                >
                  {t('إلغاء الكل لهذا القسم', 'Revoke Module')}
                </button>
              </div>
            </div>

            {/* Matrix Table */}
            <div className="flex-1 overflow-auto p-4 sm:p-6">
              <div className="min-w-[820px] border border-[#E0D9CB] dark:border-[#243628] rounded-2xl overflow-hidden bg-white dark:bg-[#17231A] shadow-xs">
                <table className="w-full text-xs text-start border-collapse">
                  <thead>
                    <tr className="bg-[#EAE4D7] dark:bg-[#1A261D] border-b border-[#E0D9CB] dark:border-[#243628] text-slate-900 dark:text-[#F3EFE6] font-bold">
                      <th className="p-3.5 text-start w-72">{t('القسم / التبويب الفرعي', 'Module / Tab')}</th>
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
                          <span>{t('مرفقات/حالة', 'Docs/Status')}</span>
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
                    {currentModuleConfig.subModules.map(sub => {
                      const rowKeys = Object.values(sub.actions)
                        .filter((a): a is { key: string; labelAr?: string } => Boolean(a && a.key))
                        .map(a => a.key);
                      const isAllRowSelected = rowKeys.length > 0 && rowKeys.every(k => userPermissions.includes(k));

                      return (
                        <tr
                          key={sub.id}
                          className="hover:bg-[#FBF9F5] dark:hover:bg-[#121B14] transition-colors"
                        >
                          {/* Submodule Info */}
                          <td className="p-3.5">
                            <div className="font-extrabold text-slate-900 dark:text-[#F3EFE6] flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-amber-500" />
                              <span>{sub.titleAr}</span>
                            </div>
                            <p className="text-[11px] text-[#5C665E] dark:text-[#8FA392] mt-0.5 ps-4">
                              {sub.descriptionAr}
                            </p>
                          </td>

                          {/* View Action */}
                          <td className="p-2.5 text-center">
                            {sub.actions.view ? (
                              <CustomMatrixCheckbox
                                checked={userPermissions.includes(sub.actions.view.key)}
                                onChange={() => togglePermission(sub.actions.view!.key)}
                                title={sub.actions.view.labelAr}
                              />
                            ) : (
                              <span className="text-slate-300 dark:text-stone-700 font-mono">—</span>
                            )}
                          </td>

                          {/* Create Action */}
                          <td className="p-2.5 text-center">
                            {sub.actions.create ? (
                              <CustomMatrixCheckbox
                                checked={userPermissions.includes(sub.actions.create.key)}
                                onChange={() => togglePermission(sub.actions.create!.key)}
                                title={sub.actions.create.labelAr}
                              />
                            ) : (
                              <span className="text-slate-300 dark:text-stone-700 font-mono">—</span>
                            )}
                          </td>

                          {/* Edit Action */}
                          <td className="p-2.5 text-center">
                            {sub.actions.edit ? (
                              <CustomMatrixCheckbox
                                checked={userPermissions.includes(sub.actions.edit.key)}
                                onChange={() => togglePermission(sub.actions.edit!.key)}
                                title={sub.actions.edit.labelAr}
                              />
                            ) : (
                              <span className="text-slate-300 dark:text-stone-700 font-mono">—</span>
                            )}
                          </td>

                          {/* Docs or Status Action */}
                          <td className="p-2.5 text-center">
                            <div className="flex flex-col gap-1 items-center justify-center">
                              {sub.actions.docs && (
                                <label
                                  className="flex items-center gap-1.5 cursor-pointer text-[10.5px] text-slate-600 dark:text-[#8FA392]"
                                  title={sub.actions.docs.labelAr}
                                >
                                  <CustomMatrixCheckbox
                                    checked={userPermissions.includes(sub.actions.docs.key)}
                                    onChange={() => togglePermission(sub.actions.docs!.key)}
                                  />
                                  <span className="truncate max-w-[90px]">{sub.actions.docs.labelAr || 'مستندات'}</span>
                                </label>
                              )}
                              {sub.actions.status && (
                                <label
                                  className="flex items-center gap-1.5 cursor-pointer text-[10.5px] text-slate-600 dark:text-[#8FA392]"
                                  title={sub.actions.status.labelAr}
                                >
                                  <CustomMatrixCheckbox
                                    checked={userPermissions.includes(sub.actions.status.key)}
                                    onChange={() => togglePermission(sub.actions.status!.key)}
                                  />
                                  <span className="truncate max-w-[90px]">{sub.actions.status.labelAr || 'الحالة'}</span>
                                </label>
                              )}
                              {!sub.actions.docs && !sub.actions.status && (
                                <span className="text-slate-300 dark:text-stone-700 font-mono">—</span>
                              )}
                            </div>
                          </td>

                          {/* Audit Action */}
                          <td className="p-2.5 text-center">
                            {sub.actions.audit ? (
                              <CustomMatrixCheckbox
                                checked={userPermissions.includes(sub.actions.audit.key)}
                                onChange={() => togglePermission(sub.actions.audit!.key)}
                                title={sub.actions.audit.labelAr}
                              />
                            ) : (
                              <span className="text-slate-300 dark:text-stone-700 font-mono">—</span>
                            )}
                          </td>

                          {/* Delete Action */}
                          <td className="p-2.5 text-center">
                            {sub.actions.delete ? (
                              <CustomMatrixCheckbox
                                checked={userPermissions.includes(sub.actions.delete.key)}
                                onChange={() => togglePermission(sub.actions.delete!.key)}
                                title={sub.actions.delete.labelAr}
                              />
                            ) : (
                              <span className="text-slate-300 dark:text-stone-700 font-mono">—</span>
                            )}
                          </td>

                          {/* Toggle Entire Row */}
                          <td className="p-2.5 text-center">
                            <button
                              type="button"
                              onClick={() => toggleRow(sub.id)}
                              className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold border transition-all cursor-pointer ${
                                isAllRowSelected
                                  ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs'
                                  : 'bg-[#EAE4D7] dark:bg-[#1A261D] text-[#5C665E] dark:text-[#8FA392] border-[#E0D9CB] dark:border-[#243628] hover:text-slate-900 dark:hover:text-white'
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
          </div>
        </div>

        {/* =========================================================================
            4. FOOTER CONTROLS
           ========================================================================= */}
        <div className="px-6 py-4 border-t border-[#E0D9CB] dark:border-[#243628] bg-gradient-to-r from-[#F3EFE6] via-[#FAF6EE] to-[#F3EFE6] dark:from-[#17231A] dark:via-[#1A281E] dark:to-[#17231A] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 text-xs text-[#5C665E] dark:text-[#8FA392]">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>
              {t('إجمالي الصلاحيات المفعلة:', 'Total Active Permissions:')}{' '}
              <strong className="font-mono text-slate-900 dark:text-[#F3EFE6] text-sm">
                {userPermissions.length}
              </strong>{' '}
              / <span className="font-mono">{allSystemPermissions.length}</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#5C665E] dark:text-[#8FA392] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23] hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              {t('إغلاق', 'Close')}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSubmitting || isSuperAdminTarget}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-l from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white text-xs font-bold shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>{t('جاري الحفظ في D1...', 'Saving...')}</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-white" />
                  <span>{t('حفظ مصفوفة الصلاحيات', 'Save Matrix')}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 !m-0 !top-0 !left-0 !right-0 !bottom-0 z-[1000] bg-black/75 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="w-full max-w-sm rounded-3xl bg-[#FBF9F5] dark:bg-[#121B14] border border-amber-500/35 shadow-2xl p-5 space-y-4 text-start">
            <div className="flex items-center justify-between pb-2 border-b border-[#E0D9CB] dark:border-[#243628]">
              <h4 className="text-sm font-black text-slate-900 dark:text-[#F3EFE6] flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-amber-500" />
                <span>{t('إضافة مستخدم جديد للنظام', 'Add New User')}</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowAddUser(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1 text-slate-800 dark:text-[#E0D9CB]">
                  الاسم الرباعي الكامل *
                </label>
                <input
                  type="text"
                  required
                  value={newUserNameAr}
                  onChange={e => setNewUserNameAr(e.target.value)}
                  placeholder="مثال: سارة أحمد محمود"
                  className="w-full p-2.5 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#17231A] text-slate-900 dark:text-[#F3EFE6] focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="font-bold block mb-1 text-slate-800 dark:text-[#E0D9CB]">
                  المسمى الوظيفي والتخصص *
                </label>
                <input
                  type="text"
                  required
                  value={newUserJobTitle}
                  onChange={e => setNewUserJobTitle(e.target.value)}
                  placeholder="مثال: مسؤول السجلات والتراخيص"
                  className="w-full p-2.5 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#17231A] text-slate-900 dark:text-[#F3EFE6] focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="font-bold block mb-1 text-slate-800 dark:text-[#E0D9CB]">
                  البريد الإلكتروني الرسمي *
                </label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={e => setNewUserEmail(e.target.value)}
                  placeholder="sara@hrsup.com"
                  dir="ltr"
                  className="w-full p-2.5 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#17231A] text-slate-900 dark:text-[#F3EFE6] focus:border-amber-500 focus:outline-none text-left"
                />
              </div>
              <div>
                <label className="font-bold block mb-1 text-slate-800 dark:text-[#E0D9CB]">
                  كلمة المرور المؤقتة *
                </label>
                <input
                  type="password"
                  required
                  value={newUserPassword}
                  onChange={e => setNewUserPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-2.5 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#17231A] text-slate-900 dark:text-[#F3EFE6] focus:border-amber-500 focus:outline-none font-mono"
                />
              </div>
              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddUser(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1A281E] cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-l from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white shadow-xs cursor-pointer"
                >
                  حفظ وتخصيص الصلاحيات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Luxury 3D Custom Checkbox
const CustomMatrixCheckbox: React.FC<{
  checked: boolean;
  disabled?: boolean;
  title?: string;
  onChange: () => void;
}> = ({ checked, disabled, title, onChange }) => {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      title={title}
      onClick={onChange}
      className={`w-4 h-4 mx-auto rounded-md border flex items-center justify-center transition-all ${
        checked
          ? 'bg-amber-500 border-amber-500 text-slate-950 shadow-xs scale-105'
          : 'bg-white dark:bg-[#17231A] border-[#E0D9CB] dark:border-[#243628] hover:border-amber-500'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {checked && <Check className="w-3 h-3 stroke-[3]" />}
    </button>
  );
};
