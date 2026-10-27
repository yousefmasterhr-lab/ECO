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
  isSuperAdminUser,
  sanitizeUserPermissions,
  dispatchPermissionsUpdate,
} from '../../../types/rbac';
import { UserRole } from '../../../types/auth';
import { d1Client } from '../../../services/d1Client';
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
  const {
    user,
    managedUsers,
    updateUserPermissions,
    refreshCurrentUserPermissions,
    logAuditEvent,
  } = useAuth();

  // Mode: Per User vs. Per Role
  const [targetType, setTargetType] = useState<'user' | 'role'>('user');

  // Selected Target User (from Cloudflare D1 managedUsers)
  const [selectedUserId, setSelectedUserId] = useState<string>(() => {
    return user?.id || (managedUsers.length > 0 ? managedUsers[0].id : 'usr_root_csuite_01');
  });

  // Selected Target Role
  const [selectedRole, setSelectedRole] = useState<UserRole>('SUPER_ADMIN');

  // Active module in the 12-sector matrix (Defaults to 1st sector at top: Companies Management)
  const [activeModuleId, setActiveModuleId] = useState<DepartmentKey>('companies');

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Save feedback state
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // All valid system permission keys across all 12 modules (used ONLY for Super Admin)
  const allSystemKeys = useMemo(() => {
    const keys: string[] = [];
    ALL_12_ERP_MODULES.forEach(m => {
      m.subModules.forEach(s => {
        Object.values(s.actions).forEach(a => {
          if (a?.key) keys.push(a.key);
        });
      });
    });
    return keys;
  }, []);

  // In-memory permissions dictionary (Strict Deny-By-Default: ZERO non-admin role/department templates)
  const [permissionsRepo, setPermissionsRepo] = useState<Record<string, Set<string>>>(() => {
    const repo: Record<string, Set<string>> = {};

    // Super Admin gets all keys; all non-admin roles start with ZERO permissions (Deny-By-Default)
    repo['role:SUPER_ADMIN'] = new Set(allSystemKeys);
    repo['role:FINANCE_OFFICER'] = new Set();
    repo['role:HR_MANAGER'] = new Set();
    repo['role:PROJECTS_ENGINEER'] = new Set();
    repo['role:LEGAL_COUNSEL'] = new Set();
    repo['role:RECEPTION_SECURITY'] = new Set();

    // Hydrate from localStorage cache if available
    try {
      const saved = localStorage.getItem('eco_rbac_matrix_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          Object.entries(parsed).forEach(([k, val]) => {
            if (Array.isArray(val)) {
              const isRootKey =
                k === 'role:SUPER_ADMIN' ||
                k.includes('usr_root') ||
                k === 'user:admin';
              repo[k] = new Set(
                isRootKey ? allSystemKeys : sanitizeUserPermissions(val as string[], false)
              );
            }
          });
        }
      }
    } catch {}

    // Hydrate initial managedUsers without role fallback
    managedUsers.forEach(u => {
      const uKey = `user:${u.id}`;
      const isRoot = isSuperAdminUser(u);
      repo[uKey] = new Set(
        isRoot ? allSystemKeys : sanitizeUserPermissions(u.permissions || [], false)
      );
    });

    return repo;
  });

  // Helper to persist repo snapshot to localStorage
  const persistRepoToLocalStorage = (repoObj: Record<string, Set<string>>) => {
    try {
      const serialized: Record<string, string[]> = {};
      Object.entries(repoObj).forEach(([k, setVal]) => {
        serialized[k] = Array.from(setVal);
      });
      localStorage.setItem('eco_rbac_matrix_v3', JSON.stringify(serialized));
    } catch {}
  };

  // Hydrate permissionsRepo from Cloudflare D1 on mount (User-specific matrices only, never role fallbacks)
  useEffect(() => {
    d1Client
      .fetchRbacMatrices()
      .then(matrices => {
        if (Array.isArray(matrices) && matrices.length > 0) {
          setPermissionsRepo(prev => {
            const next = { ...prev };
            matrices.forEach(m => {
              if (m.targetType === 'user' && m.targetId && Array.isArray(m.permissions)) {
                const isRoot =
                  m.targetId === 'admin' ||
                  m.targetId === 'usr_root_csuite_01' ||
                  m.targetId === 'usr_root_csuite';
                next[`user:${m.targetId}`] = new Set(
                  isRoot ? allSystemKeys : sanitizeUserPermissions(m.permissions, false)
                );
              }
            });
            persistRepoToLocalStorage(next);
            return next;
          });
        }
      })
      .catch(err => {
        console.warn('Failed to load RBAC matrices from D1:', err);
      });
  }, [allSystemKeys]);

  // Sync users from managedUsers into permissionsRepo (NEVER fall back to role templates!)
  useEffect(() => {
    if (!managedUsers || managedUsers.length === 0) return;

    setPermissionsRepo(prev => {
      const next = { ...prev };
      let changed = false;

      managedUsers.forEach(u => {
        const uKey = `user:${u.id}`;
        const isRoot = isSuperAdminUser(u);
        const sanitized = isRoot
          ? allSystemKeys
          : sanitizeUserPermissions(u.permissions || [], false);

        if (!next[uKey]) {
          changed = true;
          next[uKey] = new Set(sanitized);
        }
      });

      if (changed) {
        persistRepoToLocalStorage(next);
      }
      return changed ? next : prev;
    });
  }, [managedUsers, allSystemKeys]);

  // Listen to external request to open RBAC for a specific user
  useEffect(() => {
    const handleOpenRbac = (e: any) => {
      if (e?.detail?.userId) {
        setTargetType('user');
        setSelectedUserId(e.detail.userId);
      }
    };
    window.addEventListener('eco-open-rbac', handleOpenRbac as any);
    return () => window.removeEventListener('eco-open-rbac', handleOpenRbac as any);
  }, []);

  // Current target key in repo
  const currentTargetKey = targetType === 'user' ? `user:${selectedUserId}` : `role:${selectedRole}`;

  // Active user profile (when in Per User mode)
  const currentTargetUser = useMemo(() => {
    return (
      managedUsers.find(u => u.id === selectedUserId) ||
      (user?.id === selectedUserId ? user : managedUsers[0])
    );
  }, [managedUsers, selectedUserId, user]);

  const isSuperAdminTarget = useMemo(() => {
    if (targetType === 'role') return selectedRole === 'SUPER_ADMIN';
    return isSuperAdminUser(currentTargetUser);
  }, [targetType, selectedRole, currentTargetUser]);

  // Current active set of permissions
  const activePermissions = useMemo(() => {
    if (isSuperAdminTarget) {
      return new Set<string>(allSystemKeys);
    }
    return permissionsRepo[currentTargetKey] || new Set<string>();
  }, [permissionsRepo, currentTargetKey, isSuperAdminTarget, allSystemKeys]);

  // Active module object
  const activeModule =
    ERP_MODULES_MATRIX_CONFIG[activeModuleId] || ERP_MODULES_MATRIX_CONFIG.companies;
  const ActiveModuleIcon = activeModule.icon || Building2;

  // Instant Zero-Refresh Sync & D1 Persistence Helper called on every toggle and save
  const syncAndPersistImmediately = (nextSet: Set<string>) => {
    const targetId =
      targetType === 'user' ? currentTargetUser?.id || selectedUserId : selectedRole;
    const cleanArray = isSuperAdminTarget
      ? ['*']
      : sanitizeUserPermissions(Array.from(nextSet), false);

    if (targetType === 'user' && targetId) {
      // 1. Immediately update AuthContext state & localStorage synchronously (Zero-Refresh)
      refreshCurrentUserPermissions(cleanArray, targetId);

      // 2. Immediately broadcast custom events across window & tabs
      const detailPayload = {
        userId: targetId,
        permissions: cleanArray,
      };
      window.dispatchEvent(new CustomEvent('eco-rbac-updated', { detail: detailPayload }));
      dispatchPermissionsUpdate(detailPayload);

      // 3. Persist to Cloudflare D1 (/api/rbac and /api/users)
      updateUserPermissions(targetId, cleanArray).catch(err => {
        console.warn('Immediate D1 RBAC sync warning:', err);
      });
    } else if (targetType === 'role') {
      d1Client
        .saveRbacMatrix('role', targetId, cleanArray, user?.nameAr || 'مدير النظام')
        .catch(() => {});
    }
  };

  // Toggle a single permission (Immediate Zero-Refresh Sync + D1 Persistence)
  const handleTogglePermission = (permKey: string) => {
    if (isSuperAdminTarget) return;
    const currentSet = new Set(
      sanitizeUserPermissions(Array.from(permissionsRepo[currentTargetKey] || []), false)
    );
    if (currentSet.has(permKey)) {
      currentSet.delete(permKey);
    } else {
      currentSet.add(permKey);
    }

    setPermissionsRepo(prev => {
      const next = {
        ...prev,
        [currentTargetKey]: currentSet,
      };
      persistRepoToLocalStorage(next);
      return next;
    });

    syncAndPersistImmediately(currentSet);
  };

  // Toggle entire row (sub-module) (Immediate Zero-Refresh Sync + D1 Persistence)
  const handleToggleSubModuleRow = (subModule: SubModuleMatrixRow) => {
    if (isSuperAdminTarget) return;
    const rowKeys: string[] = [];
    Object.values(subModule.actions).forEach(a => {
      if (a?.key) rowKeys.push(a.key);
    });

    if (rowKeys.length === 0) return;

    const allGranted = rowKeys.every(k => activePermissions.has(k));
    const currentSet = new Set(
      sanitizeUserPermissions(Array.from(permissionsRepo[currentTargetKey] || []), false)
    );
    if (allGranted) {
      rowKeys.forEach(k => currentSet.delete(k));
    } else {
      rowKeys.forEach(k => currentSet.add(k));
    }

    setPermissionsRepo(prev => {
      const next = {
        ...prev,
        [currentTargetKey]: currentSet,
      };
      persistRepoToLocalStorage(next);
      return next;
    });

    syncAndPersistImmediately(currentSet);
  };

  // Grant all in active sector (Immediate Zero-Refresh Sync + D1 Persistence)
  const handleGrantAllInModule = () => {
    if (isSuperAdminTarget) return;
    const moduleKeys = activeModule.allPermissionKeys;
    const currentSet = new Set(
      sanitizeUserPermissions(Array.from(permissionsRepo[currentTargetKey] || []), false)
    );
    moduleKeys.forEach(k => currentSet.add(k));

    setPermissionsRepo(prev => {
      const next = {
        ...prev,
        [currentTargetKey]: currentSet,
      };
      persistRepoToLocalStorage(next);
      return next;
    });

    syncAndPersistImmediately(currentSet);
  };

  // Revoke all in active sector (Immediate Zero-Refresh Sync + D1 Persistence)
  const handleRevokeAllInModule = () => {
    if (isSuperAdminTarget) return;
    const moduleKeys = activeModule.allPermissionKeys;
    const currentSet = new Set(
      sanitizeUserPermissions(Array.from(permissionsRepo[currentTargetKey] || []), false)
    );
    moduleKeys.forEach(k => currentSet.delete(k));

    setPermissionsRepo(prev => {
      const next = {
        ...prev,
        [currentTargetKey]: currentSet,
      };
      persistRepoToLocalStorage(next);
      return next;
    });

    syncAndPersistImmediately(currentSet);
  };

  // Save changes to Cloudflare D1
  const handleSave = async () => {
    setIsSaving(true);
    const permArray = isSuperAdminTarget
      ? ['*']
      : sanitizeUserPermissions(Array.from(activePermissions), false);
    const targetId =
      targetType === 'user' ? currentTargetUser?.id || selectedUserId : selectedRole;

    try {
      // 1. Persist directly to Cloudflare D1 rbac_matrices table
      const d1Res = await d1Client.saveRbacMatrix(
        targetType,
        targetId,
        permArray,
        user?.nameAr || 'مدير النظام'
      );

      if (!d1Res.success) {
        throw new Error(d1Res.error || 'فشل حفظ الصلاحيات في قاعدة البيانات السحابية');
      }

      // 2. Update user state if target is user
      if (targetType === 'user' && currentTargetUser) {
        await refreshCurrentUserPermissions(permArray, currentTargetUser.id);
        await updateUserPermissions(currentTargetUser.id, permArray);

        const detailPayload = {
          userId: currentTargetUser.id,
          permissions: permArray,
        };
        window.dispatchEvent(new CustomEvent('eco-rbac-updated', { detail: detailPayload }));
        dispatchPermissionsUpdate(detailPayload);
      } else {
        logAuditEvent({
          actionAr: `تحديث مصفوفة صلاحيات دور (${EXECUTIVE_ROLES.find(r => r.id === selectedRole)?.titleAr || selectedRole})`,
          actionEn: `Updated RBAC Role Matrix for ${selectedRole}`,
          category: 'RBAC',
          detailsAr: `تم تحديث وتثبيت ${permArray.length} صلاحية لدور ${selectedRole} في Cloudflare D1`,
          detailsEn: `Saved ${permArray.length} permissions for role ${selectedRole} in Cloudflare D1`,
          status: 'SUCCESS',
        });
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
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

  // Calculate grant counts for any module strictly based on applicable permissions
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
                    ? 'bg-amber-500 text-white shadow-sm font-bold dark:bg-amber-500 dark:text-slate-950'
                    : 'text-slate-600 dark:text-[#8FA392] hover:text-amber-800 dark:hover:text-white'
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
                    ? 'bg-amber-500 text-white shadow-sm font-bold dark:bg-amber-500 dark:text-slate-950'
                    : 'text-slate-600 dark:text-[#8FA392] hover:text-amber-800 dark:hover:text-white'
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
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-amber-500/20 cursor-pointer ${
                saveSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gradient-to-l from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white dark:from-amber-500 dark:to-amber-600 dark:text-slate-950 active:scale-95'
              }`}
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>{t('تم حفظ مصفوفة الصلاحيات في قاعدة البيانات السحابية بنجاح', 'Saved & Synced to Cloudflare D1!')}</span>
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
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-xs font-bold text-slate-700 dark:text-[#C5D6C9] shrink-0">
                  {t('المستخدم المستهدف:', 'Target User:')}
                </span>

                {/* Generous Padding to Prevent Email Truncation in RTL */}
                <div className="relative flex-1 min-w-[320px] max-w-md">
                  <select
                    value={selectedUserId}
                    onChange={e => setSelectedUserId(e.target.value)}
                    className="w-full appearance-none pl-10 pr-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-[#07130E] border border-slate-200 dark:border-[#1A3327] text-slate-900 dark:text-[#F3EFE6] focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 cursor-pointer"
                  >
                    {managedUsers.map(u => (
                      <option key={u.id} value={u.id} className="bg-white dark:bg-[#0E1610] text-slate-900 dark:text-[#F3EFE6]">
                        {u.nameAr} — {u.jobTitleAr || u.role} ({u.email})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute inset-y-0 left-3 my-auto pointer-events-none" />
                </div>
              </div>

              {/* Compact User Info & Super Admin Badge */}
              {currentTargetUser && (
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-[#8FA392]">
                  <span className="font-semibold text-slate-700 dark:text-[#C5D6C9]">
                    {currentTargetUser.nameAr}
                  </span>
                  <span>•</span>
                  <span>{currentTargetUser.jobTitleAr || currentTargetUser.role}</span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#1A2E22] text-[10.5px] font-mono">
                    {activePermissions.size} {t('صلاحية مفعلة', 'Active Permissions')}
                  </span>
                  {isSuperAdminTarget && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-[10.5px] font-bold">
                      <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                      <span>{t('إدارة عليا (C-Suite) — صلاحيات شاملة قابلة للتخصيص', 'C-Suite — Full Access (Customizable)')}</span>
                    </span>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="text-xs font-bold text-slate-700 dark:text-[#C5D6C9] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>{t('اختر الدور الوظيفي لتعديل صلاحياته النموذجية:', 'Select Job Role to Edit Permissions:')}</span>
                </div>
                {isSuperAdminTarget && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-[10.5px] font-bold">
                    <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                    <span>{t('دور إدارة عليا — صلاحيات شاملة قابلة للتخصيص', 'C-Suite Role — Full Access (Customizable)')}</span>
                  </span>
                )}
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
                          ? 'bg-amber-50/90 border-2 border-amber-500 text-amber-950 shadow-sm ring-2 ring-amber-500/15 font-bold dark:bg-[#132A1F] dark:border-amber-500/80 dark:text-amber-300'
                          : 'bg-white border border-slate-200/80 text-slate-700 hover:bg-amber-50/40 hover:border-amber-300 dark:bg-[#07130E] dark:border-[#1A3327] dark:text-[#8FA392]'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="text-[11px] font-bold truncate block">
                          {isRtl ? role.titleAr : role.titleEn}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 shrink-0 stroke-[3] text-amber-600 dark:text-amber-400" />}
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
      </div>

      {/* ============================================================================== */}
      {/* 2. Main Rebalanced Layout: Right (Compact 12 Modules) | Left (Wider Matrix)   */}
      {/* ============================================================================== */}
      <div className="flex flex-col lg:flex-row gap-5 items-start w-full">
        {/* Right Column: Compact 12 Modules Navigation List (All visible without scrolling) */}
        <div className="w-full lg:w-[260px] shrink-0 space-y-1">
          <div className="flex items-center justify-between px-1 mb-1">
            <span className="text-xs font-black text-slate-800 dark:text-[#F3EFE6] uppercase tracking-wider">
              {t('قطاعات المنظومة (12)', 'ERP Sectors (12)')}
            </span>
            <span className="text-[10.5px] text-slate-400 dark:text-[#8FA392]">
              {t('اختر القطاع', 'Select Sector')}
            </span>
          </div>

          <div className="space-y-1">
            {ALL_12_ERP_MODULES.map(mod => {
              const isActive = activeModuleId === mod.id;
              const Icon = mod.icon || Building2;
              const { granted, total, percentage } = getModuleStats(mod);

              return (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => setActiveModuleId(mod.id)}
                  className={`w-full py-2 px-2.5 rounded-xl border text-start transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                    isActive
                      ? 'bg-amber-50/90 border-2 border-amber-500 text-amber-950 shadow-sm ring-2 ring-amber-500/15 font-bold dark:bg-[#132A1F] dark:border-amber-500/80 dark:text-amber-300'
                      : 'bg-white border border-slate-200/80 text-slate-700 hover:bg-amber-50/40 hover:border-amber-300 dark:bg-[#0D1F17] dark:border-[#1A3327] dark:text-[#C5D6C9]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-xs ${
                        isActive ? 'bg-amber-500 text-white' : 'text-white'
                      }`}
                      style={!isActive ? { backgroundColor: mod.colorVar } : undefined}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>

                    <div className="min-w-0">
                      <span className="text-xs font-bold truncate block">
                        {isRtl ? mod.titleAr : mod.titleEn}
                      </span>

                      {/* Animated Mini Progress Bar */}
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="w-16 h-1 rounded-full bg-slate-200/60 dark:bg-black/30 overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${isActive ? 'bg-amber-500 dark:bg-amber-400' : 'bg-emerald-500'}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                        <span className={`text-[9.5px] font-mono ${isActive ? 'text-amber-800 dark:text-amber-300 font-bold' : 'text-slate-400 dark:text-[#8FA392]'}`}>
                          {granted}/{total}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <span
                      className={`text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        isActive
                          ? 'bg-amber-500/15 text-amber-900 font-bold dark:bg-amber-500/20 dark:text-amber-300'
                          : percentage === 100
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
        <div className="flex-1 min-w-0 space-y-4">
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
                      <p className="text-xs text-slate-500 dark:text-[#8FA392] mt-0.5 leading-relaxed whitespace-normal">
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

              {/* Crisp Matrix Table with Natural Text Wrapping & Bulletproof RTL Switches */}
              <div className="bg-white dark:bg-[#0D1F17] rounded-2xl border border-slate-200 dark:border-[#1A3327] shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-start border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-[#0A1811] border-b border-slate-200 dark:border-[#1A3327]">
                        <th className="py-3 px-4 text-start font-bold text-slate-700 dark:text-[#C5D6C9] w-[32%] min-w-[240px]">
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
                            {/* Sub Module Name & Description (Wraps naturally across 2 lines without truncation) */}
                            <td className="py-3 px-4 align-middle">
                              <span className="font-bold text-slate-900 dark:text-[#F3EFE6] block">
                                {isRtl ? subModule.titleAr : subModule.titleEn}
                              </span>
                              <span className="text-[11px] text-slate-500 dark:text-[#8FA392] line-clamp-2 whitespace-normal leading-relaxed mt-0.5 block">
                                {subModule.descriptionAr}
                              </span>
                            </td>

                            {/* 7 Standard Action Switch Columns */}
                            {MATRIX_ACTIONS.map(action => {
                              const actionDef = subModule.actions[action.id];
                              if (!actionDef) {
                                return (
                                  <td key={action.id} className="py-3 px-2 text-center align-middle">
                                    <span className="inline-flex items-center justify-center w-7 h-5 rounded text-xs font-semibold text-slate-300 dark:text-[#243628] select-none bg-slate-50 dark:bg-[#07130E] border border-dashed border-slate-200 dark:border-[#1A3327]">
                                      —
                                    </span>
                                  </td>
                                );
                              }

                              const isChecked = activePermissions.has(actionDef.key);

                              return (
                                <td key={action.id} className="py-3 px-2 text-center align-middle">
                                  <div className="flex items-center justify-center">
                                    <button
                                      type="button"
                                      role="switch"
                                      aria-checked={isChecked}
                                      onClick={() => handleTogglePermission(actionDef.key)}
                                      title={actionDef.labelAr || action.labelAr}
                                      className={`w-11 h-6 rounded-full p-0.5 flex items-center transition-colors duration-200 cursor-pointer ${
                                        isChecked
                                          ? 'bg-emerald-600 dark:bg-emerald-500 justify-end'
                                          : 'bg-slate-200 dark:bg-stone-700 justify-start'
                                      }`}
                                    >
                                      <motion.span
                                        layout
                                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                                        className="w-5 h-5 rounded-full bg-white shadow-md block pointer-events-none"
                                      />
                                    </button>
                                  </div>
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
