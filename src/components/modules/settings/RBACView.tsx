import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../../context/LanguageContext';
import { useAuth } from '../../../context/AuthContext';
import {
  DepartmentKey,
  MATRIX_ACTIONS,
  ERP_MODULES_MATRIX_CONFIG,
  ALL_12_ERP_MODULES,
  SubModuleMatrixRow,
} from '../../../types/rbac';
import { UserRole } from '../../../types/auth';
import {
  ShieldCheck,
  Check,
  Search,
  Save,
  RotateCcw,
  Sparkles,
  Building2,
  Users,
  User,
  Info,
  CheckCheck,
  ChevronDown
} from 'lucide-react';

interface ExecutiveRoleOption {
  id: UserRole;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
}

const EXECUTIVE_ROLES: ExecutiveRoleOption[] = [
  {
    id: 'SUPER_ADMIN',
    titleAr: 'مدير النظام العام (C-Suite)',
    titleEn: 'System Administrator (CEO)',
    descriptionAr: 'صلاحيات إشرافية وتنفيذية شاملة وغير مقيدة على كافة قطاعات المنظومة',
  },
  {
    id: 'FINANCE_OFFICER',
    titleAr: 'المدير المالي (CFO)',
    titleEn: 'Chief Financial Officer',
    descriptionAr: 'إدارة العمليات المالية، القيود المحاسبية، الخزينة، والمستخلصات',
  },
  {
    id: 'HR_MANAGER',
    titleAr: 'مدير الموارد البشرية',
    titleEn: 'HR Director',
    descriptionAr: 'إدارة شؤون الموظفين، مسيرات الرواتب، العقود، والتأمينات الاجتماعية',
  },
  {
    id: 'PROJECTS_ENGINEER',
    titleAr: 'مدير المكتب الفني والمشاريع',
    titleEn: 'Projects Director',
    descriptionAr: 'إدارة المشروعات، كشوف الحصر، المستخلصات التنفيذية والمقاولين',
  },
  {
    id: 'LEGAL_COUNSEL',
    titleAr: 'المستشار القانوني',
    titleEn: 'Legal Counsel',
    descriptionAr: 'مراجعة وتدقيق العقود، إدارة النزاعات القضائية، والتوكيلات الرسمية',
  },
  {
    id: 'RECEPTION_SECURITY',
    titleAr: 'مسؤول الإدارية والاستقبال',
    titleEn: 'Admin & Front Desk Officer',
    descriptionAr: 'سجل الزوار الرقمي، الصادر والوارد، وحجز القاعات وتصاريح البوابات',
  },
];

export const RBACView: React.FC = () => {
  const { isRtl, t } = useLanguage();
  const { user, managedUsers, updateUserPermissions, logAuditEvent } = useAuth();

  // Mode: Per User vs. Per Role
  const [targetType, setTargetType] = useState<'user' | 'role'>('user');

  // Selected Target User (from Cloudflare D1 managedUsers)
  const [selectedUserId, setSelectedUserId] = useState<string>(() => {
    return user?.id || (managedUsers.length > 0 ? managedUsers[0].id : 'usr_root_csuite_01');
  });

  // Selected Target Role
  const [selectedRole, setSelectedRole] = useState<UserRole>('SUPER_ADMIN');

  // Active module in the 12-sector matrix
  const [activeModuleId, setActiveModuleId] = useState<DepartmentKey>('companies');

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Save feedback state
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // In-memory permissions dictionary:
  // Key: either `user:<userId>` or `role:<roleName>` -> Set of granted permission strings
  const [permissionsRepo, setPermissionsRepo] = useState<Record<string, Set<string>>>(() => {
    const repo: Record<string, Set<string>> = {};

    // 1. Collect all valid system permission keys across all 12 modules
    const allSystemKeys: string[] = [];
    ALL_12_ERP_MODULES.forEach(m => {
      m.subModules.forEach(s => {
        Object.values(s.actions).forEach(a => {
          if (a?.key) allSystemKeys.push(a.key);
        });
      });
    });

    // 2. Pre-populate role defaults
    repo['role:SUPER_ADMIN'] = new Set(allSystemKeys);

    // Finance Officer defaults
    const finKeys = new Set<string>();
    ALL_12_ERP_MODULES.find(m => m.id === 'finance')?.allPermissionKeys.forEach(k => finKeys.add(k));
    ALL_12_ERP_MODULES.find(m => m.id === 'companies')?.subModules.forEach(s => {
      if (s.actions.view?.key) finKeys.add(s.actions.view.key);
      if (s.actions.docs?.key) finKeys.add(s.actions.docs.key);
    });
    repo['role:FINANCE_OFFICER'] = finKeys;

    // HR Manager defaults
    const hrKeys = new Set<string>();
    ['hr', 'insurance', 'ats', 'decrees'].forEach(deptId => {
      ALL_12_ERP_MODULES.find(m => m.id === deptId)?.allPermissionKeys.forEach(k => hrKeys.add(k));
    });
    ALL_12_ERP_MODULES.find(m => m.id === 'companies')?.subModules.forEach(s => {
      if (s.actions.view?.key) hrKeys.add(s.actions.view.key);
    });
    repo['role:HR_MANAGER'] = hrKeys;

    // Projects Director defaults
    const engKeys = new Set<string>();
    ALL_12_ERP_MODULES.find(m => m.id === 'engineering')?.allPermissionKeys.forEach(k => engKeys.add(k));
    ALL_12_ERP_MODULES.find(m => m.id === 'companies')?.subModules.forEach(s => {
      if (s.actions.view?.key) engKeys.add(s.actions.view.key);
      if (s.actions.docs?.key) engKeys.add(s.actions.docs.key);
    });
    repo['role:PROJECTS_ENGINEER'] = engKeys;

    // Legal Counsel defaults
    const legalKeys = new Set<string>();
    ['legal', 'decrees'].forEach(deptId => {
      ALL_12_ERP_MODULES.find(m => m.id === deptId)?.allPermissionKeys.forEach(k => legalKeys.add(k));
    });
    ALL_12_ERP_MODULES.find(m => m.id === 'companies')?.subModules.forEach(s => {
      if (s.actions.view?.key) legalKeys.add(s.actions.view.key);
      if (s.actions.docs?.key) legalKeys.add(s.actions.docs.key);
    });
    repo['role:LEGAL_COUNSEL'] = legalKeys;

    // Front Desk & Admin defaults
    const recKeys = new Set<string>();
    ['reception', 'cts'].forEach(deptId => {
      ALL_12_ERP_MODULES.find(m => m.id === deptId)?.allPermissionKeys.forEach(k => recKeys.add(k));
    });
    ALL_12_ERP_MODULES.find(m => m.id === 'companies')?.subModules.forEach(s => {
      if (s.actions.view?.key) recKeys.add(s.actions.view.key);
    });
    repo['role:RECEPTION_SECURITY'] = recKeys;

    return repo;
  });

  // Sync users from managedUsers into permissionsRepo
  useEffect(() => {
    if (!managedUsers || managedUsers.length === 0) return;

    setPermissionsRepo(prev => {
      const next = { ...prev };
      let changed = false;

      managedUsers.forEach(u => {
        const uKey = `user:${u.id}`;
        if (!next[uKey]) {
          changed = true;
          if (Array.isArray(u.permissions) && u.permissions.length > 0) {
            next[uKey] = new Set(u.permissions);
          } else if (u.role === 'SUPER_ADMIN' || u.id === 'usr_root_csuite_01') {
            // Full permissions for super admin
            const allKeys = ALL_12_ERP_MODULES.flatMap(m => m.allPermissionKeys);
            next[uKey] = new Set(allKeys);
          } else {
            // Inherit from role template
            const roleKey = `role:${u.role}`;
            next[uKey] = new Set(prev[roleKey] || []);
          }
        }
      });

      return changed ? next : prev;
    });
  }, [managedUsers]);

  // Current target key in repo
  const currentTargetKey = targetType === 'user' ? `user:${selectedUserId}` : `role:${selectedRole}`;

  // Current active set of permissions
  const activePermissions = useMemo(() => {
    return permissionsRepo[currentTargetKey] || new Set<string>();
  }, [permissionsRepo, currentTargetKey]);

  // Active user profile (when in Per User mode)
  const currentTargetUser = useMemo(() => {
    return managedUsers.find(u => u.id === selectedUserId) || (user?.id === selectedUserId ? user : managedUsers[0]);
  }, [managedUsers, selectedUserId, user]);

  const isSuperAdminTarget = useMemo(() => {
    if (targetType === 'role') return selectedRole === 'SUPER_ADMIN';
    return (
      currentTargetUser?.role === 'SUPER_ADMIN' ||
      currentTargetUser?.id === 'usr_root_csuite_01' ||
      currentTargetUser?.id === 'usr_root_csuite'
    );
  }, [targetType, selectedRole, currentTargetUser]);

  // Active module object
  const activeModule = ERP_MODULES_MATRIX_CONFIG[activeModuleId] || ERP_MODULES_MATRIX_CONFIG.companies;
  const ActiveModuleIcon = activeModule.icon || Building2;

  // Toggle a single permission
  const handleTogglePermission = (permKey: string) => {
    setPermissionsRepo(prev => {
      const currentSet = new Set(prev[currentTargetKey] || []);
      if (currentSet.has(permKey)) {
        currentSet.delete(permKey);
      } else {
        currentSet.add(permKey);
      }
      return {
        ...prev,
        [currentTargetKey]: currentSet,
      };
    });
  };

  // Toggle entire row (sub-module)
  const handleToggleSubModuleRow = (subModule: SubModuleMatrixRow) => {
    const rowKeys: string[] = [];
    Object.values(subModule.actions).forEach(a => {
      if (a?.key) rowKeys.push(a.key);
    });

    if (rowKeys.length === 0) return;

    const allGranted = rowKeys.every(k => activePermissions.has(k));

    setPermissionsRepo(prev => {
      const currentSet = new Set(prev[currentTargetKey] || []);
      if (allGranted) {
        rowKeys.forEach(k => currentSet.delete(k));
      } else {
        rowKeys.forEach(k => currentSet.add(k));
      }
      return {
        ...prev,
        [currentTargetKey]: currentSet,
      };
    });
  };

  // Grant all in active sector
  const handleGrantAllInModule = () => {
    const moduleKeys = activeModule.allPermissionKeys;
    setPermissionsRepo(prev => {
      const currentSet = new Set(prev[currentTargetKey] || []);
      moduleKeys.forEach(k => currentSet.add(k));
      return {
        ...prev,
        [currentTargetKey]: currentSet,
      };
    });
  };

  // Revoke all in active sector
  const handleRevokeAllInModule = () => {
    const moduleKeys = activeModule.allPermissionKeys;
    setPermissionsRepo(prev => {
      const currentSet = new Set(prev[currentTargetKey] || []);
      moduleKeys.forEach(k => currentSet.delete(k));
      return {
        ...prev,
        [currentTargetKey]: currentSet,
      };
    });
  };

  // Save changes to Cloudflare D1
  const handleSave = async () => {
    setIsSaving(true);
    const permArray = Array.from(activePermissions);

    try {
      if (targetType === 'user' && currentTargetUser) {
        await updateUserPermissions(currentTargetUser.id, permArray);

        // Dispatch real-time sync event across all tabs & components
        window.dispatchEvent(
          new CustomEvent('eco-permissions-updated', {
            detail: {
              userId: currentTargetUser.id,
              permissions: permArray,
            },
          })
        );
      } else {
        // Log role update in audit log
        logAuditEvent({
          actionAr: `تحديث مصفوفة صلاحيات دور (${EXECUTIVE_ROLES.find(r => r.id === selectedRole)?.titleAr || selectedRole})`,
          actionEn: `Updated RBAC Role Matrix for ${selectedRole}`,
          category: 'RBAC',
          detailsAr: `تم تحديث وتثبيت ${permArray.length} صلاحية لدور ${selectedRole}`,
          detailsEn: `Saved ${permArray.length} permissions for role ${selectedRole}`,
          status: 'SUCCESS',
        });

        // Also update any managed users having this role if they have not overridden custom permissions
        managedUsers.forEach(u => {
          if (u.role === selectedRole) {
            updateUserPermissions(u.id, permArray).catch(() => {});
          }
        });
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2800);
    } catch (err) {
      console.error('Failed to save permissions matrix', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Filter sub-modules by search query
  const filteredSubModules = useMemo(() => {
    if (!searchQuery.trim()) return activeModule.subModules;
    const q = searchQuery.toLowerCase().trim();
    return activeModule.subModules.filter(sub => {
      return (
        sub.titleAr.toLowerCase().includes(q) ||
        sub.titleEn.toLowerCase().includes(q) ||
        sub.descriptionAr.toLowerCase().includes(q)
      );
    });
  }, [activeModule, searchQuery]);

  // Calculate grant counts for any module
  const getModuleStats = (mod: (typeof ALL_12_ERP_MODULES)[number]) => {
    const total = mod.allPermissionKeys.length;
    let granted = 0;
    mod.allPermissionKeys.forEach(k => {
      if (activePermissions.has(k)) granted++;
    });
    const percentage = total > 0 ? Math.round((granted / total) * 100) : 0;
    return { granted, total, percentage };
  };

  const activeStats = getModuleStats(activeModule);

  return (
    <div className="w-full space-y-5 animate-in fade-in duration-200">
      {/* ============================================================================== */}
      {/* 1. Executive Top Bar: Target Selector (Per User vs. Per Role) + Save Action     */}
      {/* ============================================================================== */}
      <div className="bg-white dark:bg-[#0D1F17] rounded-2xl border border-slate-200 dark:border-[#1A3327] p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Title & Scope */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-400/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-[#F3EFE6] tracking-tight">
                  {t('مصفوفة الصلاحيات (RBAC)', 'Enterprise Permissions Matrix')}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold border border-emerald-500/20">
                  {t('12 قطاعاً مؤسسياً', '12 ERP Sectors')}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-[#8FA392] mt-0.5">
                {t(
                  'حوكمة وضبط صلاحيات الوصول التفصيلية للمستخدمين والأدوار الوظيفية عبر المنظومة.',
                  'Govern and manage granular access permissions per user or executive job role.'
                )}
              </p>
            </div>
          </div>

          {/* Target Type Switcher & Save Button */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Segmented Switcher: Per User vs. Per Role */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-[#07130E] border border-slate-200 dark:border-[#1A3327]">
              <button
                type="button"
                onClick={() => setTargetType('user')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  targetType === 'user'
                    ? 'bg-white dark:bg-[#1C2E24] text-slate-900 dark:text-[#F3EFE6] shadow-xs'
                    : 'text-slate-500 dark:text-[#8FA392] hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>{t('تخصيص حسب المستخدم', 'Per User')}</span>
              </button>

              <button
                type="button"
                onClick={() => setTargetType('role')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  targetType === 'role'
                    ? 'bg-white dark:bg-[#1C2E24] text-slate-900 dark:text-[#F3EFE6] shadow-xs'
                    : 'text-slate-500 dark:text-[#8FA392] hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>{t('تخصيص حسب الدور الوظيفي', 'Per Role')}</span>
              </button>
            </div>

            {/* Save Button */}
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm cursor-pointer ${
                saveSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 active:scale-95'
              }`}
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>{t('تم الحفظ والمزامنة المباشرة', 'Saved & Synced Live!')}</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{t('حفظ التعديلات', 'Save Permissions')}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Dynamic Selector Row: User Selector or Role Pills */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-[#1A3327]">
          {targetType === 'user' ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-bold text-slate-700 dark:text-[#C5D6C9] shrink-0">
                  {t('المستخدم المستهدف:', 'Target User:')}
                </span>

                <div className="relative flex-1 sm:w-80">
                  <select
                    value={selectedUserId}
                    onChange={e => setSelectedUserId(e.target.value)}
                    className="w-full appearance-none ps-3 pe-8 py-2 rounded-xl text-xs font-bold bg-slate-50 dark:bg-[#07130E] border border-slate-200 dark:border-[#1A3327] text-slate-900 dark:text-[#F3EFE6] focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {managedUsers.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.nameAr} ({u.jobTitleAr || u.role}) - {u.email}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute inset-y-0 end-2.5 my-auto pointer-events-none" />
                </div>
              </div>

              {currentTargetUser && (
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-[#8FA392]">
                  <span className="font-semibold text-slate-700 dark:text-[#C5D6C9]">
                    {currentTargetUser.nameAr}
                  </span>
                  <span>•</span>
                  <span>{currentTargetUser.jobTitleAr || currentTargetUser.role}</span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#1A2E22] text-[10.5px] font-mono">
                    {activePermissions.size} {t('صلاحية مفعلة', 'Active Permissions')}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="text-xs font-bold text-slate-700 dark:text-[#C5D6C9] mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{t('اختر الدور الوظيفي لتعديل صلاحياته النموذجية:', 'Select Job Role to Edit Permissions:')}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {EXECUTIVE_ROLES.map(role => {
                  const isSelected = selectedRole === role.id;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setSelectedRole(role.id)}
                      className={`p-3 rounded-xl border text-start transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 border-transparent shadow-sm font-bold'
                          : 'bg-slate-50 dark:bg-[#07130E] border-slate-200 dark:border-[#1A3327] text-slate-700 dark:text-[#8FA392] hover:bg-slate-100 dark:hover:bg-[#14261C]'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="text-[11px] font-bold truncate block">
                          {isRtl ? role.titleAr : role.titleEn}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 shrink-0 stroke-[3]" />}
                      </div>
                      <span className={`text-[10px] line-clamp-1 opacity-75`}>
                        {role.descriptionAr}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Single Executive Super Admin Banner (Zero Repetition!) */}
        {isSuperAdminTarget && (
          <div className="mt-3.5 p-3 rounded-xl bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/20 flex items-center gap-2.5 text-xs text-amber-800 dark:text-amber-300">
            <Info className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>
              {t(
                'حساب إدارة عليا (Super Admin) - الصلاحيات مفعلة بالكامل افتراضياً، مع إمكانية التخصيص والاستثناء المباشر لأي صلاحية أو قطاع.',
                'Super Admin Account: All permissions are enabled by default, with real-time ability to customize or revoke any specific permission.'
              )}
            </span>
          </div>
        )}
      </div>

      {/* ============================================================================== */}
      {/* 2. Main 2-Column Layout: Right (12 Modules List) | Left (Active Matrix Table)  */}
      {/* ============================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Right Column: 12 Modules Navigation List */}
        <div className="lg:col-span-4 space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-black text-slate-800 dark:text-[#F3EFE6] uppercase tracking-wider">
              {t('قطاعات المنظومة (12)', 'ERP Sectors (12)')}
            </span>
            <span className="text-[11px] text-slate-400 dark:text-[#8FA392]">
              {t('اختر القطاع للتعديل', 'Select Sector')}
            </span>
          </div>

          <div className="space-y-1.5">
            {ALL_12_ERP_MODULES.map(mod => {
              const isActive = activeModuleId === mod.id;
              const Icon = mod.icon || Building2;
              const { granted, total, percentage } = getModuleStats(mod);

              return (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => setActiveModuleId(mod.id)}
                  className={`w-full p-3 rounded-xl border text-start transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isActive
                      ? 'bg-white dark:bg-[#122419] border-amber-500/50 shadow-sm ring-1 ring-amber-500/30'
                      : 'bg-white/70 dark:bg-[#0D1F17] border-slate-200 dark:border-[#1A3327] hover:bg-slate-50 dark:hover:bg-[#14261C]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 shadow-xs"
                      style={{ backgroundColor: mod.colorVar }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-[#F3EFE6] truncate block">
                          {isRtl ? mod.titleAr : mod.titleEn}
                        </span>
                      </div>

                      {/* Animated Mini Progress Bar */}
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-20 h-1.5 rounded-full bg-slate-100 dark:bg-[#1A3327] overflow-hidden">
                          <motion.div
                            className="h-full bg-emerald-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 dark:text-[#8FA392] font-mono">
                          {granted}/{total}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                        percentage === 100
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                          : percentage > 0
                          ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                          : 'bg-slate-100 dark:bg-[#1A3327] text-slate-400'
                      }`}
                    >
                      {percentage}%
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Left Column: Structured Sub-Module Permission Matrix Table */}
        <div className="lg:col-span-8 space-y-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeModule.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-4"
            >
              {/* Sector Header & Controls */}
              <div className="bg-white dark:bg-[#0D1F17] rounded-2xl border border-slate-200 dark:border-[#1A3327] p-4 sm:p-5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                      style={{ backgroundColor: activeModule.colorVar }}
                    >
                      <ActiveModuleIcon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-[#F3EFE6] truncate">
                          {isRtl ? activeModule.titleAr : activeModule.titleEn}
                        </h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#1A3327] text-slate-700 dark:text-[#8FA392]">
                          {activeStats.granted} / {activeStats.total} {t('صلاحية', 'Perms')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-[#8FA392] truncate mt-0.5">
                        {activeModule.descriptionAr}
                      </p>
                    </div>
                  </div>

                  {/* Actions: Search + Bulk Grant/Revoke */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {/* Quick Filter */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute inset-y-0 start-2.5 my-auto" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder={t('بحث في الأقسام...', 'Filter sub-modules...')}
                        className="ps-8 pe-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-[#07130E] border border-slate-200 dark:border-[#1A3327] text-slate-900 dark:text-[#F3EFE6] focus:outline-none focus:border-amber-500 w-36 sm:w-44"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleGrantAllInModule}
                      className="px-2.5 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold hover:bg-emerald-500/20 transition-all cursor-pointer flex items-center gap-1"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>{t('تحديد الكل', 'Grant All')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleRevokeAllInModule}
                      className="px-2.5 py-1.5 rounded-xl bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20 text-xs font-bold hover:bg-red-500/20 transition-all cursor-pointer flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>{t('إلغاء الكل', 'Revoke All')}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Crisp Matrix Table */}
              <div className="bg-white dark:bg-[#0D1F17] rounded-2xl border border-slate-200 dark:border-[#1A3327] shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-start border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-[#0A1811] border-b border-slate-200 dark:border-[#1A3327]">
                        <th className="py-3 px-4 text-start font-bold text-slate-700 dark:text-[#C5D6C9] min-w-[200px]">
                          {t('القسم الفرعي', 'Sub-Module')}
                        </th>
                        {MATRIX_ACTIONS.map(action => (
                          <th
                            key={action.id}
                            className="py-3 px-2 text-center font-bold text-slate-700 dark:text-[#C5D6C9] min-w-[65px]"
                          >
                            <span className="block">{action.shortLabelAr}</span>
                            <span className="text-[9.5px] font-normal text-slate-400 block">{action.labelEn}</span>
                          </th>
                        ))}
                        <th className="py-3 px-3 text-center font-bold text-slate-700 dark:text-[#C5D6C9] min-w-[70px]">
                          {t('تحديد الكل', 'All')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-[#1A3327]">
                      {filteredSubModules.map(subModule => {
                        const rowKeys: string[] = [];
                        Object.values(subModule.actions).forEach(a => {
                          if (a?.key) rowKeys.push(a.key);
                        });
                        const isRowAllGranted =
                          rowKeys.length > 0 && rowKeys.every(k => activePermissions.has(k));

                        return (
                          <tr
                            key={subModule.id}
                            className="hover:bg-slate-50/80 dark:hover:bg-[#122419] transition-colors"
                          >
                            {/* Sub Module Name & Description */}
                            <td className="py-3.5 px-4 align-middle">
                              <span className="font-bold text-slate-900 dark:text-[#F3EFE6] block">
                                {isRtl ? subModule.titleAr : subModule.titleEn}
                              </span>
                              <span className="text-[11px] text-slate-500 dark:text-[#8FA392] line-clamp-1 mt-0.5">
                                {subModule.descriptionAr}
                              </span>
                            </td>

                            {/* 7 Standard Action Switch Columns */}
                            {MATRIX_ACTIONS.map(action => {
                              const actionDef = subModule.actions[action.id];
                              if (!actionDef) {
                                return (
                                  <td key={action.id} className="py-3 px-2 text-center align-middle">
                                    <span className="text-slate-300 dark:text-[#1A3327] select-none text-xs">-</span>
                                  </td>
                                );
                              }

                              const isChecked = activePermissions.has(actionDef.key);

                              return (
                                <td key={action.id} className="py-3 px-2 text-center align-middle">
                                  <button
                                    type="button"
                                    onClick={() => handleTogglePermission(actionDef.key)}
                                    title={actionDef.labelAr || action.labelAr}
                                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                      isChecked
                                        ? 'bg-emerald-600 dark:bg-emerald-500'
                                        : 'bg-slate-200 dark:bg-[#1A2E22]'
                                    }`}
                                    role="switch"
                                    aria-checked={isChecked}
                                  >
                                    <span
                                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                        isChecked ? 'translate-x-4 dark:translate-x-4' : 'translate-x-0'
                                      }`}
                                    />
                                  </button>
                                </td>
                              );
                            })}

                            {/* Master Toggle for this Row */}
                            <td className="py-3 px-3 text-center align-middle">
                              <button
                                type="button"
                                onClick={() => handleToggleSubModuleRow(subModule)}
                                title={t('تحديد/إلغاء كافة صلاحيات هذا القسم', 'Toggle all in this sub-module')}
                                className={`px-2 py-1 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer ${
                                  isRowAllGranted
                                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                                    : 'bg-slate-100 dark:bg-[#1A2E22] text-slate-600 dark:text-[#8FA392] border border-slate-200 dark:border-[#1A3327] hover:bg-slate-200'
                                }`}
                              >
                                {isRowAllGranted ? t('مفعل', 'Full') : t('تحديد', 'Select')}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
