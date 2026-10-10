import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useAuth } from '../../../context/AuthContext';
import {
  DepartmentKey,
  MULTI_DEPARTMENT_RBAC_DATA
} from '../../../types/rbac';
import { UserRole, ROLE_CONFIGURATIONS } from '../../../types/auth';
import {
  ShieldCheck,
  Check,
  Search,
  Save,
  RotateCcw,
  Sparkles,
  Lock,
  Layers,
  CircleDot
} from 'lucide-react';

const ROLES: { id: UserRole; titleAr: string; titleEn: string; badge: string }[] = [
  { id: 'SUPER_ADMIN', titleAr: 'الإدارة العليا (C-Suite)', titleEn: 'C-Suite Governance', badge: 'L4' },
  { id: 'FINANCE_OFFICER', titleAr: 'المدير المالي (CFO)', titleEn: 'Finance Officer', badge: 'L3' },
  { id: 'HR_MANAGER', titleAr: 'مدير الموارد البشرية', titleEn: 'HR Director', badge: 'L3' },
  { id: 'PROJECTS_ENGINEER', titleAr: 'المكتب الفني والمشاريع', titleEn: 'Projects Director', badge: 'L3' },
  { id: 'LEGAL_COUNSEL', titleAr: 'المستشار القانوني', titleEn: 'Legal Counsel', badge: 'L3' },
  { id: 'RECEPTION_SECURITY', titleAr: 'الاستقبال والأمن', titleEn: 'Front Desk & Security', badge: 'L2' },
];

export const RBACView: React.FC = () => {
  const { isRtl, t } = useLanguage();
  const { logAuditEvent } = useAuth();

  const [activeDept, setActiveDept] = useState<DepartmentKey>('finance');
  const [selectedRole, setSelectedRole] = useState<UserRole>('SUPER_ADMIN');
  const [searchQuery, setSearchQuery] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Initialize permissions state for each role across all departments
  const [permissionsState, setPermissionsState] = useState<Record<UserRole, Set<string>>>(() => {
    // Generate default permissions based on ROLE_CONFIGURATIONS and domain logic
    const state: Record<UserRole, Set<string>> = {
      SUPER_ADMIN: new Set(),
      FINANCE_OFFICER: new Set(),
      HR_MANAGER: new Set(),
      HR_SPECIALIST: new Set(),
      PROJECTS_ENGINEER: new Set(),
      LEGAL_COUNSEL: new Set(),
      RECEPTION_SECURITY: new Set(),
    };

    // Populate all permissions for SUPER_ADMIN
    Object.values(MULTI_DEPARTMENT_RBAC_DATA).forEach(dept => {
      dept.permissions.forEach(p => {
        state.SUPER_ADMIN.add(p.id);

        // Assign domain permissions according to role
        if (dept.id === 'finance') {
          state.FINANCE_OFFICER.add(p.id);
        }
        if (dept.id === 'hr' || dept.id === 'ats' || dept.id === 'insurance') {
          state.HR_MANAGER.add(p.id);
        }
        if (dept.id === 'engineering') {
          state.PROJECTS_ENGINEER.add(p.id);
        }
        if (dept.id === 'legal') {
          state.LEGAL_COUNSEL.add(p.id);
        }
        if (dept.id === 'reception' || dept.id === 'cts') {
          state.RECEPTION_SECURITY.add(p.id);
        }
      });
    });

    return state;
  });

  const departmentKeys = Object.keys(MULTI_DEPARTMENT_RBAC_DATA) as DepartmentKey[];
  const currentDept = MULTI_DEPARTMENT_RBAC_DATA[activeDept];
  const DeptIcon = currentDept.icon || Layers;

  const togglePermission = (permId: string) => {
    // If SUPER_ADMIN, warn that full clearance is inherent
    if (selectedRole === 'SUPER_ADMIN') {
      return;
    }

    setPermissionsState(prev => {
      const currentRoleSet = new Set(prev[selectedRole]);
      if (currentRoleSet.has(permId)) {
        currentRoleSet.delete(permId);
      } else {
        currentRoleSet.add(permId);
      }
      return {
        ...prev,
        [selectedRole]: currentRoleSet,
      };
    });
  };

  const selectAllInDept = () => {
    if (selectedRole === 'SUPER_ADMIN') return;
    setPermissionsState(prev => {
      const currentRoleSet = new Set(prev[selectedRole]);
      currentDept.permissions.forEach(p => currentRoleSet.add(p.id));
      return {
        ...prev,
        [selectedRole]: currentRoleSet,
      };
    });
  };

  const clearAllInDept = () => {
    if (selectedRole === 'SUPER_ADMIN') return;
    setPermissionsState(prev => {
      const currentRoleSet = new Set(prev[selectedRole]);
      currentDept.permissions.forEach(p => currentRoleSet.delete(p.id));
      return {
        ...prev,
        [selectedRole]: currentRoleSet,
      };
    });
  };

  const handleSave = () => {
    setSaveSuccess(true);
    logAuditEvent({
      actionAr: `تحديث مصفوفة صلاحيات ${currentDept.nameAr}`,
      actionEn: `Updated RBAC Matrix for ${currentDept.nameEn}`,
      category: 'RBAC',
      detailsAr: `تم تعديل وتثبيت الصلاحيات لدور ${ROLE_CONFIGURATIONS[selectedRole].titleAr}`,
      detailsEn: `Saved permissions state for role ${selectedRole} in ${currentDept.id}`,
      status: 'SUCCESS',
    });
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Filter permissions by search query
  const filteredPermissions = currentDept.permissions.filter(p => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.nameAr.toLowerCase().includes(q) ||
      p.nameEn.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q) ||
      p.categoryAr.toLowerCase().includes(q) ||
      p.descriptionAr.toLowerCase().includes(q)
    );
  });

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* 1. Header & Overview Card */}
      <div className="rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#121B14] p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-[#D99B26] dark:text-[#EBB34D] border border-amber-500/30 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-[#1A241C] dark:text-[#F3EFE6] tracking-tight">
                {t('مصفوفة الصلاحيات والحوكمة الشاملة (Enterprise RBAC)', 'Multi-Department RBAC Matrix')}
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-[#D99B26] dark:text-[#EBB34D] text-[10px] font-bold border border-amber-500/30">
                {t('9 قطاعات مؤسسية', '9 Corporate Suites')}
              </span>
            </div>
            <p className="text-xs text-[#5C665E] dark:text-[#8FA392] mt-0.5">
              {t(
                'ضبط وتدقيق صلاحيات الوصول الدقيقة عبر كافة قطاعات المنظومة وعزل الربط المالي المحلي.',
                'Granular permission governance across all enterprise suites with strict financial isolation.'
              )}
            </p>
          </div>
        </div>

        {/* Global Save Actions */}
        <div className="flex items-center gap-2.5 self-start md:self-center">
          <button
            onClick={handleSave}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-sm cursor-pointer ${
              saveSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-[#1C291E] dark:bg-[#EBB34D] text-[#F3EFE6] dark:text-[#0E1610] hover:opacity-90 active:scale-95'
            }`}
          >
            {saveSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{saveSuccess ? t('تم حفظ الصلاحيات وتوثيق السجل', 'Permissions Saved!') : t('حفظ التعديلات', 'Save Matrix')}</span>
          </button>
        </div>
      </div>

      {/* 2. Corporate Roles Selector Bar */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-[#5C665E] dark:text-[#8FA392] ps-1 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#D99B26] dark:text-[#EBB34D]" />
          <span>{t('الدور المؤسسي المستهدف للتعديل:', 'Target Corporate Role:')}</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {ROLES.map(role => {
            const isSelected = selectedRole === role.id;
            return (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`p-3 rounded-xl border text-start transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#1C291E] dark:bg-[#EBB34D] border-transparent text-[#F3EFE6] dark:text-[#0E1610] shadow-md font-bold'
                    : 'bg-[#F3EFE6] dark:bg-[#17231A] border-[#E0D9CB] dark:border-[#243628] text-[#5C665E] dark:text-[#8FA392] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23]'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md font-mono font-bold bg-black/15 dark:bg-white/15">
                    {role.badge}
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                </div>
                <span className="text-xs font-bold truncate block">
                  {isRtl ? role.titleAr : role.titleEn}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Multi-Department 9-Tab Segmented Switcher */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 border-b border-[#E0D9CB]/80 dark:border-[#243628]/80">
          {departmentKeys.map(dKey => {
            const dept = MULTI_DEPARTMENT_RBAC_DATA[dKey];
            const Icon = dept.icon || CircleDot;
            const isActive = activeDept === dKey;
            return (
              <button
                key={dKey}
                onClick={() => setActiveDept(dKey)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-amber-500/15 border border-amber-500/50 text-[#D99B26] dark:text-[#EBB34D] shadow-xs'
                    : 'bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] text-[#5C665E] dark:text-[#8FA392] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{isRtl ? dept.nameAr : dept.nameEn}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/10">
                  {dept.permissions.length}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Department Sub-Bar with Search and Batch Toggles */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#F3EFE6]/70 dark:bg-[#17231A]/70 border border-[#E0D9CB] dark:border-[#243628]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 shadow-xs"
              style={{ backgroundColor: currentDept.colorVar }}
            >
              <DeptIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] truncate">
                {isRtl ? currentDept.nameAr : currentDept.nameEn}
              </h3>
              <p className="text-[10.5px] text-[#5C665E] dark:text-[#8FA392] truncate">
                {currentDept.descriptionAr}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Quick Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#5C665E] dark:text-[#8FA392] absolute inset-y-0 start-2.5 my-auto" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t('بحث في الصلاحيات...', 'Filter permissions...')}
                className="ps-8 pe-3 py-1.5 rounded-lg text-xs bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none focus:border-amber-500 w-40 sm:w-48"
              />
            </div>

            {selectedRole !== 'SUPER_ADMIN' && (
              <>
                <button
                  onClick={selectAllInDept}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-bold hover:bg-emerald-500/20 transition-colors cursor-pointer"
                >
                  {t('تحديد الكل', 'Grant All')}
                </button>
                <button
                  onClick={clearAllInDept}
                  className="px-2.5 py-1.5 rounded-lg bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20 text-[11px] font-bold hover:bg-red-500/20 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3 inline me-1" />
                  {t('إلغاء الكل', 'Revoke All')}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 4. Permissions List Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {filteredPermissions.map(perm => {
          const isGranted =
            selectedRole === 'SUPER_ADMIN' ||
            permissionsState[selectedRole]?.has(perm.id);
          const Icon = perm.categoryIcon || CircleDot;

          return (
            <div
              key={perm.id}
              onClick={() => togglePermission(perm.id)}
              className={`p-3.5 rounded-xl border transition-all text-start select-none cursor-pointer flex flex-col justify-between ${
                isGranted
                  ? 'bg-[#FBF9F5] dark:bg-[#141F16] border-emerald-500/40 shadow-xs'
                  : 'bg-[#F3EFE6]/50 dark:bg-[#17231A]/40 border-[#E0D9CB] dark:border-[#243628] opacity-75 hover:opacity-100'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-[#EAE4D7] dark:bg-[#1F2E23] flex items-center justify-center text-[#5C665E] dark:text-[#8FA392] shrink-0">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[10px] font-semibold text-[#5C665E] dark:text-[#8FA392] truncate">
                      {perm.categoryAr}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[9.5px] font-mono text-[#5C665E] dark:text-[#8FA392] bg-[#EAE4D7]/60 dark:bg-[#1F2E23]/60 px-1.5 py-0.5 rounded">
                      {perm.code}
                    </span>
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                        isGranted
                          ? 'bg-emerald-600 text-white'
                          : 'border border-[#E0D9CB] dark:border-[#243628] bg-transparent'
                      }`}
                    >
                      {isGranted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                </div>

                <h4 className="text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                  {isRtl ? perm.nameAr : perm.nameEn}
                </h4>
                <p className="text-[11px] text-[#5C665E] dark:text-[#8FA392] line-clamp-2 leading-relaxed">
                  {perm.descriptionAr}
                </p>
              </div>

              {selectedRole === 'SUPER_ADMIN' && (
                <div className="mt-2.5 pt-2 border-t border-[#E0D9CB]/50 dark:border-[#243628]/50 flex items-center gap-1 text-[9.5px] text-amber-600 dark:text-amber-400 font-semibold">
                  <Lock className="w-2.5 h-2.5" />
                  <span>{t('مفعلة تلقائياً بحكم الإدارة العليا C-Suite', 'Inherent C-Suite Permission')}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
