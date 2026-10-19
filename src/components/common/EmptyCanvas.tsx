import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigation } from '../../context/NavigationContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTenant } from '../../context/TenantContext';
import { CompaniesModule } from '../modules/companies/CompaniesModule';
import { EngineeringModule } from '../modules/engineering/EngineeringModule';
import { LegalModule } from '../modules/legal/LegalModule';
import { ReceptionModule } from '../modules/reception/ReceptionModule';
import { FinancialAffairsModule } from '../modules/finance/FinancialAffairsModule';
import { HRModule } from '../modules/hr/HRModule';
import { SettingsModule } from '../modules/settings/SettingsModule';
import { UnauthorizedView } from './UnauthorizedView';
import { useFinancial } from '../../context/FinancialContext';
import { useHR } from '../../context/HRContext';
import { useAuth } from '../../context/AuthContext';
import { branchStorage } from '../modules/companies/branchStorage';
import { licenseStorage } from '../modules/companies/licenseStorage';
import { signatoryStorage } from '../modules/companies/signatoryStorage';
import { SUBMODULE_VIEW_PERMISSION_MAP, cleanArabicTitle } from '../../types/rbac';
import {
  HardHat,
  Scale,
  ShieldCheck,
  Users,
  UserCheck,
  Mail,
  BarChart3,
  ScrollText,
  Settings,
  CircleDot,
  Building2,
  ConciergeBell,
  Landmark,
  FolderOpen,
  ChevronLeft,
  Sparkles,
  Clock
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  HardHat,
  Scale,
  ShieldCheck,
  Users,
  UserCheck,
  Mail,
  BarChart3,
  ScrollText,
  Settings,
  Building2,
  ConciergeBell,
  Landmark,
};

const MODULE_DESCRIPTIONS: Record<string, { ar: string; en: string }> = {
  executive: {
    ar: 'المؤشرات الموحدة ومصفوفة المخاطر والتقارير الاستراتيجية',
    en: 'Unified executive KPIs, risk matrix & strategic oversight',
  },
  companies: {
    ar: 'دليل الشركات التابعة، السجلات التجارية، الفروع ومراكز التكلفة',
    en: 'Company registry, commercial records, branches & cost centers',
  },
  finance: {
    ar: 'دليل الحسابات، الخزينة، الفوترة الإلكترونية، ومحاسبة المستخلصات',
    en: 'General ledger, treasury, e-invoicing & project accounting',
  },
  hr: {
    ar: 'ملفات الموظفين، مسير الرواتب، الحضور والانصراف وسجل الإجازات',
    en: 'Master employee dossier, payroll ledger, attendance & leaves',
  },
  engineering: {
    ar: 'إدارة المشاريع، الجداول الزمنية، المستخلصات وحصر الكميات',
    en: 'Project management, timelines, payment certs & BOQ ledger',
  },
  cts: {
    ar: 'إدارة وتوثيق المراسلات الرسمية والخطابات الصادرة والواردة',
    en: 'Official administrative correspondence, incoming & outgoing logs',
  },
  legal: {
    ar: 'صياغة وتوثيق العقود، متابعة القضايا، والتوكيلات الرسمية',
    en: 'Contract management, litigation tracking & powers of attorney',
  },
  insurance: {
    ar: 'استمارات س1 وس2 والتغطية التأمينية والامتثال القانوني',
    en: 'Social insurance compliance, employee coverage & dues ledger',
  },
  ats: {
    ar: 'إعلانات التوظيف، تتبع مسار المرشحين، وجدولة المقابلات',
    en: 'Talent acquisition pipeline, job requisitions & interviews',
  },
  decrees: {
    ar: 'الأوامر الإدارية، القرارات التنفيذية، واللوائح المعتمدة',
    en: 'Administrative decrees, circular directives & corporate policies',
  },
  reception: {
    ar: 'إدارة بوابات الدخول، تسجيل الزوار، وحجز قاعات الاجتماعات',
    en: 'Front desk operations, visitor logs, room bookings & parcels',
  },
  settings: {
    ar: 'إدارة الصلاحيات RBAC، حسابات المستخدمين، ومركز تكامل SQL',
    en: 'Access control (RBAC), user accounts & SQL federation hub',
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.05,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.32,
      ease: [0.25, 0.1, 0.25, 1.0],
    },
  },
};

export const EmptyCanvas: React.FC = () => {
  const { isRtl, t } = useLanguage();
  const { selectionSummaryAr, selectionSummaryEn, companies, selectedCompanyIds, toggleCompany, isAllSelected, selectAllCompanies } = useTenant();
  const { categories, activeCategoryId, activeSubItemId, selectItem, currentUser } = useNavigation();
  const { summary: finSummary, costCenters: finCostCenters } = useFinancial();
  const { stats: hrStats, employees } = useHR();
  const { user, managedUsers, checkModuleAccess, hasPermission } = useAuth();

  const displayCategories = useMemo(() => {
    if (!categories) return [];
    return categories
      .map(cat => {
        const authorizedSubItems = cat.subItems.filter(sub => {
          const permKey = SUBMODULE_VIEW_PERMISSION_MAP[sub.id];
          if (!permKey) return hasPermission(`${cat.id}.*`) || hasPermission(`${cat.id}.view`);
          return hasPermission(permKey);
        });
        return {
          ...cat,
          authorizedSubItems,
        };
      })
      .filter(cat => cat.authorizedSubItems.length > 0);
  }, [categories, hasPermission]);

  const [branchesCount, setBranchesCount] = useState<number>(() => {
    try {
      return branchStorage.getBranchesSync().length;
    } catch {
      return 0;
    }
  });

  const [licensesCount, setLicensesCount] = useState<number>(() => {
    try {
      return licenseStorage.getLicensesSync().length;
    } catch {
      return 0;
    }
  });

  const [signatoriesCount, setSignatoriesCount] = useState<number>(() => {
    try {
      return signatoryStorage.getSignatoriesSync().length;
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    const refreshCounts = () => {
      branchStorage.getBranches().then(list => {
        if (list && Array.isArray(list)) setBranchesCount(list.length);
      }).catch(() => {});

      licenseStorage.getLicenses().then(list => {
        if (list && Array.isArray(list)) setLicensesCount(list.length);
      }).catch(() => {});

      signatoryStorage.getSignatories().then(list => {
        if (list && Array.isArray(list)) setSignatoriesCount(list.length);
      }).catch(() => {});
    };

    refreshCounts();

    window.addEventListener('eco-data-updated', refreshCounts);
    window.addEventListener('eco-configurations-updated', refreshCounts);
    window.addEventListener('eco-users-updated', refreshCounts);

    return () => {
      window.removeEventListener('eco-data-updated', refreshCounts);
      window.removeEventListener('eco-configurations-updated', refreshCounts);
      window.removeEventListener('eco-users-updated', refreshCounts);
    };
  }, []);

  const totalEmployeesCount = employees?.length ?? (hrStats?.totalEmployees ?? 0);
  const usersCount = (managedUsers && managedUsers.length > 0) ? managedUsers.length : (user ? 1 : 0);
  const rolesCount = new Set(managedUsers?.map(u => u.role) || (user?.role ? [user.role] : ['admin'])).size || 1;

  const [currentDateTime, setCurrentDateTime] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = useMemo(() => {
    const daysAr = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const monthsAr = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    if (isRtl) {
      const dayName = daysAr[currentDateTime.getDay()];
      const day = currentDateTime.getDate();
      const monthName = monthsAr[currentDateTime.getMonth()];
      const year = currentDateTime.getFullYear();
      return `${dayName}، ${day} ${monthName} ${year}`;
    }
    return currentDateTime.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [currentDateTime, isRtl]);

  const formattedTime = useMemo(() => {
    const hours = currentDateTime.getHours();
    const minutes = String(currentDateTime.getMinutes()).padStart(2, '0');
    const period = isRtl ? (hours >= 12 ? 'م' : 'ص') : (hours >= 12 ? 'PM' : 'AM');
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes} ${period}`;
  }, [currentDateTime, isRtl]);

  // 3D Cinematic Background Canvas & Interactive Parallax State
  const bannerCanvasRef = useRef<HTMLCanvasElement>(null);
  const [bannerParallax, setBannerParallax] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = bannerCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 220);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    const particleCount = 28;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 2 + 1,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -Math.random() * 0.35 - 0.1,
      alpha: Math.random() * 0.5 + 0.2,
      dAlpha: (Math.random() * 0.008 + 0.003) * (Math.random() > 0.5 ? 1 : -1),
    }));

    let angle = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const isDarkMode = document.documentElement.classList.contains('dark');
      angle += 0.008;

      // 1. Moving architectural perspective grid floor
      ctx.save();
      ctx.strokeStyle = isDarkMode ? 'rgba(217, 155, 38, 0.07)' : 'rgba(217, 155, 38, 0.12)';
      ctx.lineWidth = 1;
      const horizonY = height * 0.65;
      const vpX = width * 0.5 + bannerParallax.x * 40;

      for (let x = -width * 0.5; x <= width * 1.5; x += 60) {
        ctx.beginPath();
        ctx.moveTo(vpX, horizonY);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = horizonY; y <= height; y += (height - horizonY) / 5) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      ctx.restore();

      // 2. 3D Perspective Geometric Orbital Rings
      ctx.save();
      const ringCenterX = isRtl ? width * 0.18 : width * 0.82;
      const ringCenterY = height * 0.5 + bannerParallax.y * 12;
      const ringRadiusX = 65;
      const ringRadiusY = 22;

      ctx.translate(ringCenterX + bannerParallax.x * 15, ringCenterY);
      ctx.rotate(angle);

      // Outer Ring
      ctx.beginPath();
      ctx.ellipse(0, 0, ringRadiusX, ringRadiusY, angle * 0.5, 0, Math.PI * 2);
      ctx.strokeStyle = isDarkMode ? 'rgba(245, 158, 11, 0.22)' : 'rgba(217, 155, 38, 0.28)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Inner Dashed Ring
      ctx.beginPath();
      ctx.setLineDash([4, 6]);
      ctx.ellipse(0, 0, ringRadiusX * 0.7, ringRadiusY * 0.7, -angle * 0.7, 0, Math.PI * 2);
      ctx.strokeStyle = isDarkMode ? 'rgba(251, 191, 36, 0.3)' : 'rgba(180, 83, 9, 0.25)';
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // 3. Floating Gold Particles
      particles.forEach(p => {
        p.x += p.vx + bannerParallax.x * 0.15;
        p.y += p.vy;
        p.alpha += p.dAlpha;

        if (p.alpha > 0.75 || p.alpha < 0.15) {
          p.dAlpha = -p.dAlpha;
        }

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = isDarkMode
          ? `rgba(245, 158, 11, ${p.alpha})`
          : `rgba(217, 155, 38, ${p.alpha * 0.8})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [bannerParallax, isRtl]);

  if (activeCategoryId === 'unauthorized') {
    return <UnauthorizedView />;
  }

  // If a category ID was requested (e.g. via direct URL) but is not in authorized categories
  if (activeCategoryId && !categories.some(c => c.id === activeCategoryId)) {
    return <UnauthorizedView />;
  }

  const activeCategory = categories.find(c => c.id === activeCategoryId);
  const activeSubItem = activeCategory?.subItems.find(s => s.id === activeSubItemId);

  // When a category / sub-item has been selected
  if (activeCategory) {
    if (!checkModuleAccess(activeCategory.id)) {
      return <UnauthorizedView />;
    }
    const Icon = ICON_MAP[activeCategory.iconName] || CircleDot;
    const catTitle = isRtl ? activeCategory.titleAr : activeCategory.titleEn;
    const subTitle = activeSubItem
      ? (isRtl ? activeSubItem.titleAr : activeSubItem.titleEn)
      : catTitle;

    return (
      <div className="w-full max-w-none space-y-5 animate-in fade-in duration-200">
        {/* Clean Page Breadcrumb & Header Bar (Eliminating Tab Duplication) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E0D9CB]/60 dark:border-[#243628]">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-xs shrink-0"
              style={{
                backgroundColor: activeCategory.colorVar || '#1C291E',
              }}
            >
              <Icon className="w-4 h-4" />
            </div>

            {/* Breadcrumb Navigation Trail */}
            <nav aria-label="Breadcrumbs" className="flex items-center gap-2 text-xs sm:text-sm min-w-0 flex-wrap">
              <button
                onClick={() => selectItem(activeCategory.id, activeCategory.subItems[0]?.id || '')}
                className="font-bold text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6] transition-colors cursor-pointer"
              >
                {catTitle}
              </button>

              <ChevronLeft className={`w-3.5 h-3.5 text-[#5C665E] dark:text-[#8FA392] shrink-0 ${isRtl ? '' : 'rotate-180'}`} />

              <span className="font-extrabold text-[#1A241C] dark:text-[#F3EFE6] tracking-tight">
                {subTitle}
              </span>
            </nav>
          </div>

          {/* Action Trigger */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => selectItem('')}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-[#F3EFE6] dark:bg-[#17231A] text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23] border border-[#E0D9CB] dark:border-[#243628] transition-colors cursor-pointer"
            >
              {isRtl ? 'الرئيسية' : 'Overview'}
            </button>
          </div>
        </div>

        {/* Dynamic Workspace Container */}
        {activeCategory.id === 'companies' ? (
          <CompaniesModule activeSubItemId={activeSubItemId} />
        ) : activeCategory.id === 'finance' ? (
          <FinancialAffairsModule activeSubItemId={activeSubItemId} />
        ) : activeCategory.id === 'hr' ? (
          <HRModule activeSubItemId={activeSubItemId} />
        ) : activeCategory.id === 'engineering' ? (
          <EngineeringModule activeSubItemId={activeSubItemId} />
        ) : activeCategory.id === 'legal' ? (
          <LegalModule activeSubItemId={activeSubItemId} />
        ) : activeCategory.id === 'reception' ? (
          <ReceptionModule activeSubItemId={activeSubItemId} />
        ) : activeCategory.id === 'settings' ? (
          <SettingsModule activeSubItemId={activeSubItemId} />
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-[#E0D9CB] dark:border-[#243628] p-8 sm:p-12 flex flex-col items-center justify-center text-center bg-[#F3EFE6]/40 dark:bg-[#17231A]/30">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-transform hover:scale-105"
              style={{
                backgroundColor: `${activeCategory.colorVar}15`,
                color: activeCategory.colorVar,
              }}
            >
              <FolderOpen className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-[#1A241C] dark:text-[#F3EFE6]">
              {subTitle}
            </h2>
            <p className="text-xs text-[#5C665E] dark:text-[#8FA392] max-w-sm mt-1.5 leading-relaxed">
              {isRtl
                ? 'مساحة العمل جاهزة ومربوطة بحساب الشركات المحددة.'
                : 'Workspace is ready and linked to the active company scope.'}
            </p>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-[#5C665E] dark:text-[#8FA392]">
              <span className="px-2.5 py-1 rounded-lg bg-[#EAE4D7] dark:bg-[#1F2E23] border border-[#E0D9CB] dark:border-[#243628]">
                {isRtl ? `النطاق: ${selectionSummaryAr}` : `Scope: ${selectionSummaryEn}`}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[#EAE4D7] dark:bg-[#1F2E23] border border-[#E0D9CB] dark:border-[#243628]">
                {activeCategory.subItems.length} {isRtl ? 'خدمات فرعية' : 'Sub-sections'}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Helper to construct smart live micro-KPIs for each module card
  const getModuleKpis = (catId: string) => {
    switch (catId) {
      case 'executive':
        return [
          { label: isRtl ? 'المخاطر' : 'Risks', value: isRtl ? '0 مخاطر' : '0 Risks', color: 'text-emerald-600 dark:text-emerald-400 font-bold' },
          { label: isRtl ? 'المؤشرات' : 'KPIs', value: isRtl ? '0 مؤشرات' : '0 KPIs', color: 'text-amber-600 dark:text-[#EBB34D] font-bold' },
          { label: isRtl ? 'الحالة' : 'Status', value: isRtl ? 'نشط' : 'Active', color: 'text-emerald-600 dark:text-emerald-400 font-bold' },
        ];
      case 'companies':
        return [
          { label: isRtl ? 'الشركات' : 'Entities', value: `${companies.length} ${isRtl ? 'مسجلة' : 'Total'}`, color: 'text-amber-600 dark:text-[#EBB34D] font-bold' },
          { label: isRtl ? 'الفروع' : 'Branches', value: `${branchesCount} ${isRtl ? 'فرع' : 'Sites'}`, color: 'text-slate-900 dark:text-white font-bold' },
          { label: isRtl ? 'التراخيص' : 'Licenses', value: `${licensesCount} ${isRtl ? 'وثيقة' : 'Docs'}`, color: 'text-emerald-600 dark:text-emerald-400 font-bold' },
        ];
      case 'finance':
        return [
          { label: isRtl ? 'الحسابات' : 'Accounts', value: `${finSummary?.totalAccounts || 0}`, color: 'text-amber-600 dark:text-[#EBB34D] font-bold' },
          { label: isRtl ? 'مراكز التكلفة' : 'Cost Centers', value: `${finCostCenters.length || 0}`, color: 'text-slate-900 dark:text-white font-bold' },
          { label: isRtl ? 'حالة الدليل' : 'GL State', value: isRtl ? 'متزن' : 'Balanced', color: 'text-emerald-600 dark:text-emerald-400 font-bold' },
        ];
      case 'hr':
        return [
          { label: isRtl ? 'قوة العمل' : 'Staff', value: `${totalEmployeesCount}`, color: 'text-amber-600 dark:text-[#EBB34D] font-bold' },
          { label: isRtl ? 'الحضور' : 'Attendance', value: `${totalEmployeesCount > 0 ? (hrStats?.attendanceTodayRate ?? 0) : 0}%`, color: 'text-emerald-600 dark:text-emerald-400 font-bold' },
          { label: isRtl ? 'الإجازات' : 'Leaves', value: `${hrStats?.onLeaveCount || 0} ${isRtl ? 'طلبات' : 'Req'}`, color: 'text-slate-700 dark:text-[#8FA392] font-bold' },
        ];
      case 'engineering':
        return [
          { label: isRtl ? 'المشاريع' : 'Projects', value: isRtl ? '0 مشاريع' : '0 Projects', color: 'text-slate-900 dark:text-white font-bold' },
          { label: isRtl ? 'العقود' : 'Contracts', value: isRtl ? '0 عقد' : '0 Contracts', color: 'text-amber-600 dark:text-[#EBB34D] font-bold' },
          { label: isRtl ? 'المستخلص' : 'IPCs', value: isRtl ? '0 معتمد' : '0 Approved', color: 'text-slate-900 dark:text-white font-bold' },
        ];
      case 'cts':
        return [
          { label: isRtl ? 'معاملات اليوم' : 'Today', value: '0', color: 'text-amber-600 dark:text-[#EBB34D] font-bold' },
          { label: isRtl ? 'الصادر' : 'Outgoing', value: '0', color: 'text-slate-900 dark:text-white font-bold' },
          { label: isRtl ? 'الوارد' : 'Incoming', value: '0', color: 'text-slate-900 dark:text-white font-bold' },
        ];
      case 'legal':
        return [
          { label: isRtl ? 'العقود' : 'Contracts', value: isRtl ? '0 عقد' : '0 Contracts', color: 'text-slate-900 dark:text-white font-bold' },
          { label: isRtl ? 'النزاعات' : 'Disputes', value: isRtl ? '0' : '0 Cases', color: 'text-emerald-600 dark:text-emerald-400 font-bold' },
          { label: isRtl ? 'التوكيلات' : 'POAs', value: `${signatoriesCount} ${isRtl ? 'توكيل' : 'POAs'}`, color: 'text-amber-600 dark:text-[#EBB34D] font-bold' },
        ];
      case 'insurance':
        return [
          { label: isRtl ? 'المؤمن عليهم' : 'Insured', value: `${totalEmployeesCount}`, color: 'text-amber-600 dark:text-[#EBB34D] font-bold' },
          { label: isRtl ? 'النماذج' : 'Forms', value: isRtl ? '0 استمارات' : '0 Forms', color: 'text-slate-900 dark:text-white font-bold' },
          { label: isRtl ? 'الامتثال' : 'Audit', value: isRtl ? 'جاهز' : 'Compliant', color: 'text-emerald-600 dark:text-emerald-400 font-bold' },
        ];
      case 'ats':
        return [
          { label: isRtl ? 'الشواغر' : 'Openings', value: isRtl ? '0 وظائف' : '0 Roles', color: 'text-amber-600 dark:text-[#EBB34D] font-bold' },
          { label: isRtl ? 'المرشحون' : 'Applicants', value: '0', color: 'text-slate-900 dark:text-white font-bold' },
          { label: isRtl ? 'المقابلات' : 'Interviews', value: isRtl ? '0 مقابلات' : '0 Interviews', color: 'text-slate-900 dark:text-white font-bold' },
        ];
      case 'decrees':
        return [
          { label: isRtl ? 'القرارات' : 'Decrees', value: isRtl ? '0 قرارات' : '0 Decrees', color: 'text-amber-600 dark:text-[#EBB34D] font-bold' },
          { label: isRtl ? 'التعميمات' : 'Circulars', value: isRtl ? '0 تعميمات' : '0 Circulars', color: 'text-slate-900 dark:text-white font-bold' },
          { label: isRtl ? 'اللوائح' : 'Policies', value: isRtl ? '0 لوائح' : '0 Policies', color: 'text-slate-900 dark:text-white font-bold' },
        ];
      case 'reception':
        return [
          { label: isRtl ? 'بالمنشأة' : 'Guests', value: isRtl ? '0 زوار' : '0 Guests', color: 'text-slate-900 dark:text-white font-bold' },
          { label: isRtl ? 'المواعيد' : 'Visits', value: isRtl ? '0 مواعيد' : '0 Visits', color: 'text-amber-600 dark:text-[#EBB34D] font-bold' },
          { label: isRtl ? 'القاعات' : 'Rooms', value: isRtl ? '0 قاعات' : '0 Rooms', color: 'text-slate-700 dark:text-[#8FA392] font-bold' },
        ];
      case 'settings':
        return [
          { label: isRtl ? 'المستخدمون' : 'Users', value: `${usersCount} ${isRtl ? 'مستخدم' : 'Users'}`, color: 'text-amber-600 dark:text-[#EBB34D] font-bold' },
          { label: isRtl ? 'الأدوار' : 'Roles', value: `${rolesCount} ${isRtl ? 'أدوار' : 'Roles'}`, color: 'text-slate-900 dark:text-white font-bold' },
          { label: isRtl ? 'قواعد SQL' : 'SQL Fleet', value: isRtl ? 'متصلة' : 'Online', color: 'text-emerald-600 dark:text-emerald-400 font-bold' },
        ];
      default:
        return [
          { label: isRtl ? 'الحالة' : 'Status', value: isRtl ? 'نشط' : 'Active', color: 'text-emerald-600 dark:text-emerald-400 font-bold' },
          { label: isRtl ? 'الخدمات' : 'Services', value: 'جاهز', color: 'text-amber-600 dark:text-[#EBB34D] font-bold' },
          { label: isRtl ? 'الربط' : 'Link', value: isRtl ? 'مباشر' : 'Live', color: 'text-slate-900 dark:text-white font-bold' },
        ];
    }
  };

  // Executive Command Launchpad
  return (
    <div className="w-full max-w-none space-y-7 animate-in fade-in duration-200">
      {/* 1. 3D Cinematic Hero Welcome Banner */}
      <div
        onMouseMove={e => {
          const rect = e.currentTarget.getBoundingClientRect();
          setBannerParallax({
            x: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
            y: ((e.clientY - rect.top) / rect.height - 0.5) * 2,
          });
        }}
        onMouseLeave={() => setBannerParallax({ x: 0, y: 0 })}
        className="relative overflow-hidden rounded-3xl border border-[#D99B26]/30 dark:border-amber-500/35 bg-gradient-to-br from-[#FFFDF9] via-[#FEF9EE] to-[#FDF3DC] dark:from-[#07130E] dark:via-[#0D1F17] dark:to-[#132A1F] p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.06),0_0_20px_rgba(217,155,38,0.12)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_25px_rgba(245,158,11,0.15)] transition-all duration-300 select-none"
      >
        {/* Live 3D Interactive Canvas */}
        <canvas ref={bannerCanvasRef} className="absolute inset-0 pointer-events-none w-full h-full z-0 opacity-80" />

        {/* Ambient Luminescence Light Beams */}
        <div className="absolute -top-20 -end-20 w-80 h-80 bg-gradient-to-bl from-amber-400/20 via-amber-500/10 to-transparent rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-20 -start-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          {/* Top Row: User Welcome Presentation & Status Badges */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5 shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                <span className="text-xs font-mono font-black tracking-widest uppercase text-amber-600 dark:text-amber-400">
                  ECO • ERP Company Operations
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 dark:text-[#F3EFE6] tracking-tight drop-shadow-xs whitespace-nowrap leading-normal">
                {isRtl ? `مرحباً بك، ${currentUser.nameAr}` : `Welcome, ${currentUser.nameEn}`}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:self-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-[#0E1610]/80 border border-[#D99B26]/30 dark:border-amber-500/30 text-xs font-semibold text-slate-700 dark:text-stone-300 shadow-2xs backdrop-blur-md">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>{formattedDate} • {formattedTime}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs font-bold text-amber-700 dark:text-amber-300 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{cleanArabicTitle(currentUser.jobTitleAr || currentUser.roleAr)}</span>
              </span>
            </div>
          </div>

          {/* Bottom Row: Dedicated Horizontal Strip for Authorized Company Cards */}
          <div className="border-t border-amber-500/15 pt-4 mt-4">
            <div className="flex flex-wrap items-center gap-2.5">
              {companies.length > 1 && (
                <button
                  type="button"
                  onClick={selectAllCompanies}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all border backdrop-blur-md cursor-pointer shrink-0 ${
                    isAllSelected
                      ? 'bg-gradient-to-l from-amber-600 to-amber-500 text-white border-amber-500 shadow-sm font-black'
                      : 'bg-white/70 dark:bg-[#121B14]/70 text-slate-700 dark:text-[#8FA392] border-slate-200/80 dark:border-[#243628] hover:border-amber-500/40 hover:text-amber-700 dark:hover:text-amber-300'
                  }`}
                >
                  {t('جميع الشركات', 'All Entities')} ({companies.length})
                </button>
              )}

              {companies.map(c => {
                const isSelected = selectedCompanyIds.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      if (companies.length > 1) {
                        toggleCompany(c.id);
                      }
                    }}
                    className={`group/comp flex items-center gap-2.5 px-3.5 py-2 rounded-2xl text-start transition-all duration-200 border backdrop-blur-md cursor-pointer shrink-0 ${
                      isSelected
                        ? 'bg-white/95 dark:bg-[#0E1610]/95 border-amber-500 dark:border-amber-400 shadow-[0_6px_20px_rgba(217,155,38,0.2)] scale-[1.02] ring-1 ring-amber-400/50'
                        : 'bg-white/60 dark:bg-[#121B14]/60 border-slate-200/80 dark:border-[#243628] text-slate-600 dark:text-stone-400 hover:border-amber-500/40 hover:bg-white/90 dark:hover:bg-[#17231A]'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold shadow-xs transition-transform group-hover/comp:scale-105 ${
                        isSelected
                          ? 'bg-gradient-to-l from-amber-600 to-amber-500 text-white'
                          : 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      <Building2 className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-extrabold text-slate-900 dark:text-[#F3EFE6] block truncate max-w-[200px]">
                        {isRtl ? c.nameAr : c.nameEn}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-[#8FA392] block truncate font-medium">
                        {c.code} {c.badgeAr ? `• ${isRtl ? c.badgeAr : c.badgeEn}` : ''}
                      </span>
                    </div>
                    {isSelected && (
                      <span className="relative flex h-2 w-2 ms-1 shrink-0" title={t('نطاق نشط', 'Active Scope')}>
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Department Cards Grid Header & Counter */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#D99B26]/15 dark:bg-[#EBB34D]/15 text-[#D99B26] dark:text-[#EBB34D] flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#1A241C] dark:text-[#F3EFE6] tracking-tight">
              {t('منظومات وأقسام المنشأة', 'Enterprise Core Modules')}
            </h2>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] text-xs font-bold font-mono text-[#D99B26] dark:text-[#EBB34D] shadow-2xs">
          {displayCategories.length} {t('منظومات متصلة', 'Connected Suites')}
        </span>
      </div>

      {/* 3. Animated Department Cards Grid (12 Primary Modules) */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 w-full max-w-none"
      >
        {displayCategories.map(cat => {
          const Icon = ICON_MAP[cat.iconName] || CircleDot;
          const title = isRtl ? cat.titleAr : cat.titleEn;
          const badge = isRtl ? cat.badgeAr : cat.badgeEn;
          const descObj = MODULE_DESCRIPTIONS[cat.id];
          const description = descObj ? (isRtl ? descObj.ar : descObj.en) : (isRtl ? 'المنظومة التشغيلية المتكاملة' : 'Integrated operational suite');
          const kpis = getModuleKpis(cat.id);

          return (
            <motion.div
              key={cat.id}
              variants={cardVariants}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              onClick={() => selectItem(cat.id, cat.authorizedSubItems[0]?.id || cat.subItems[0]?.id)}
              className="group flex flex-col justify-between rounded-2xl bg-[#F3EFE6]/90 dark:bg-[#17231A]/90 backdrop-blur-md border border-[#E0D9CB] dark:border-[#243628] hover:border-[#D99B26]/60 dark:hover:border-amber-400/60 hover:shadow-[0_20px_45px_-12px_rgba(217,155,38,0.22),0_0_20px_rgba(217,155,38,0.12)] dark:hover:shadow-[0_20px_45px_-12px_rgba(235,179,77,0.25),0_0_25px_rgba(235,179,77,0.15)] p-5 relative overflow-hidden transition-all duration-300 cursor-pointer text-start transform-gpu hover:-translate-y-1.5"
            >
              {/* Golden spotlight radial aura on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(217,155,38,0.14),transparent_70%)]" />

              <div>
                {/* Top Bar of Card: Brand Amber Frosted Glass Icon + Amber Badge */}
                <div className="flex items-center justify-between gap-2 mb-3.5">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400 transition-transform duration-300 group-hover:scale-108 shadow-xs"
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    {badge && (
                      <span
                        className="text-[11px] font-bold px-2.5 py-1 rounded-full border border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300 shadow-2xs"
                      >
                        {badge}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Body: Title & Multi-Line Clear Description (line-clamp-2) */}
                <h3 className="text-base font-black text-[#1A241C] dark:text-[#F3EFE6] group-hover:text-[#D99B26] dark:group-hover:text-[#EBB34D] transition-colors tracking-tight leading-snug">
                  {title}
                </h3>
                <p className="text-xs text-[#5C665E] dark:text-[#8FA392] line-clamp-2 leading-relaxed mt-1.5 h-[36px]">
                  {description}
                </p>

                {/* Live Micro-KPIs Matrix (3-Column Embedded Panel) */}
                <div className="mt-3.5 p-2 rounded-xl bg-[#FBF9F5]/90 dark:bg-[#0E1610]/80 border border-[#E0D9CB]/80 dark:border-[#243628]/80 grid grid-cols-3 divide-x divide-x-reverse divide-[#E0D9CB]/60 dark:divide-[#243628]/60 text-center">
                  {kpis.map((kpi, idx) => (
                    <div key={idx} className="px-0.5 flex flex-col justify-center min-w-0">
                      <span className="text-[9.5px] sm:text-[10px] text-[#5C665E] dark:text-[#8FA392] font-semibold truncate block">
                        {kpi.label}
                      </span>
                      <span className={`text-[11px] sm:text-[11.5px] font-bold font-mono truncate mt-0.5 ${kpi.color}`}>
                        {kpi.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card Footer: Total Services & Direct Action Trigger */}
              <div className="mt-4 pt-3 border-t border-[#E0D9CB]/80 dark:border-[#243628]/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-[#5C665E] dark:text-[#8FA392]">
                  <Sparkles className="w-3.5 h-3.5 text-[#D99B26] dark:text-[#EBB34D]" />
                  <span className="font-semibold">{cat.authorizedSubItems.length} {isRtl ? 'خدمات' : 'Services'}</span>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-[#D99B26] dark:text-[#EBB34D] group-hover:text-[#C58F38] dark:group-hover:text-[#F5C76D] transition-colors">
                  <span>{isRtl ? 'دخول القسم' : 'Access Suite'}</span>
                  <ChevronLeft
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      isRtl ? 'group-hover:-translate-x-1' : 'rotate-180 group-hover:translate-x-1'
                    }`}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};
