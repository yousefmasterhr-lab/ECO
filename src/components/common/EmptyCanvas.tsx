import React, { useState, useEffect, useMemo } from 'react';
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
import { useReception } from '../../context/ReceptionContext';
import { useFinancial } from '../../context/FinancialContext';
import { useHR } from '../../context/HRContext';
import {
  ArrowUpRight,
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
  const { selectionSummaryAr, selectionSummaryEn, companies } = useTenant();
  const { categories, activeCategoryId, activeSubItemId, selectItem, currentUser } = useNavigation();
  const { activeVisitorsCount, todayScheduledCount, occupiedRoomsCount } = useReception();
  const { summary: finSummary, costCenters: finCostCenters } = useFinancial();
  const { stats: hrStats } = useHR();

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

  const activeCategory = categories.find(c => c.id === activeCategoryId);
  const activeSubItem = activeCategory?.subItems.find(s => s.id === activeSubItemId);

  // When a category / sub-item has been selected
  if (activeCategory) {
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
          { label: isRtl ? 'المخاطر' : 'Risks', value: isRtl ? 'صفر حرجة' : '0 Critical', color: 'text-emerald-400' },
          { label: isRtl ? 'السيولة' : 'Liquidity', value: isRtl ? 'مستقرة' : 'Stable', color: 'text-[#EBB34D]' },
          { label: isRtl ? 'الإنجاز' : 'Completion', value: '94%', color: 'text-emerald-400' },
        ];
      case 'companies':
        return [
          { label: isRtl ? 'الشركات' : 'Entities', value: `${companies.length || 4} ${isRtl ? 'مسجلة' : 'Total'}`, color: 'text-[#EBB34D]' },
          { label: isRtl ? 'الفروع' : 'Branches', value: `12 ${isRtl ? 'فرع' : 'Sites'}`, color: 'text-[#F3EFE6]' },
          { label: isRtl ? 'التراخيص' : 'Licenses', value: isRtl ? 'سارية' : 'Valid', color: 'text-emerald-400' },
        ];
      case 'finance':
        return [
          { label: isRtl ? 'الحسابات' : 'Accounts', value: `${finSummary?.totalAccounts || 497}`, color: 'text-[#EBB34D]' },
          { label: isRtl ? 'مراكز التكلفة' : 'Cost Centers', value: `${finCostCenters.length || 45}`, color: 'text-[#F3EFE6]' },
          { label: isRtl ? 'حالة الدليل' : 'GL State', value: isRtl ? 'متزن' : 'Balanced', color: 'text-emerald-400' },
        ];
      case 'hr':
        return [
          { label: isRtl ? 'قوة العمل' : 'Staff', value: `${hrStats?.totalEmployees || 1343}`, color: 'text-[#EBB34D]' },
          { label: isRtl ? 'الحضور' : 'Attendance', value: `${hrStats?.attendanceTodayRate || 100}%`, color: 'text-emerald-400' },
          { label: isRtl ? 'الإجازات' : 'Leaves', value: `${hrStats?.onLeaveCount || 5} ${isRtl ? 'طلبات' : 'Req'}`, color: 'text-[#8FA392]' },
        ];
      case 'engineering':
        return [
          { label: isRtl ? 'المشاريع' : 'Projects', value: `8 ${isRtl ? 'نشطة' : 'Active'}`, color: 'text-emerald-400' },
          { label: isRtl ? 'العقود' : 'Contracts', value: `14 ${isRtl ? 'عقد' : 'Total'}`, color: 'text-[#EBB34D]' },
          { label: isRtl ? 'المستخلصات' : 'IPCs', value: `9 ${isRtl ? 'معتمدة' : 'IPCs'}`, color: 'text-[#F3EFE6]' },
        ];
      case 'cts':
        return [
          { label: isRtl ? 'معاملات اليوم' : 'Today', value: `28`, color: 'text-[#EBB34D]' },
          { label: isRtl ? 'الصادر' : 'Outgoing', value: `12`, color: 'text-[#F3EFE6]' },
          { label: isRtl ? 'الوارد' : 'Incoming', value: `16`, color: 'text-emerald-400' },
        ];
      case 'legal':
        return [
          { label: isRtl ? 'العقود' : 'Contracts', value: `42 ${isRtl ? 'سارٍ' : 'Active'}`, color: 'text-emerald-400' },
          { label: isRtl ? 'النزاعات' : 'Disputes', value: isRtl ? 'صفر' : '0 Cases', color: 'text-emerald-400' },
          { label: isRtl ? 'التوكيلات' : 'POAs', value: `8`, color: 'text-[#EBB34D]' },
        ];
      case 'insurance':
        return [
          { label: isRtl ? 'المؤمن عليهم' : 'Insured', value: `${hrStats?.totalEmployees || 1343}`, color: 'text-[#EBB34D]' },
          { label: isRtl ? 'النماذج' : 'Forms', value: 'س1 / س2', color: 'text-emerald-400' },
          { label: isRtl ? 'الامتثال' : 'Audit', value: '100%', color: 'text-emerald-400' },
        ];
      case 'ats':
        return [
          { label: isRtl ? 'الشواغر' : 'Openings', value: `6 ${isRtl ? 'وظائف' : 'Roles'}`, color: 'text-[#EBB34D]' },
          { label: isRtl ? 'المرشحون' : 'Applicants', value: `84`, color: 'text-[#F3EFE6]' },
          { label: isRtl ? 'المقابلات' : 'Interviews', value: `4 ${isRtl ? 'اليوم' : 'Today'}`, color: 'text-emerald-400' },
        ];
      case 'decrees':
        return [
          { label: isRtl ? 'القرارات' : 'Decrees', value: `18`, color: 'text-[#EBB34D]' },
          { label: isRtl ? 'التعميمات' : 'Circulars', value: `7`, color: 'text-[#F3EFE6]' },
          { label: isRtl ? 'اللوائح' : 'Policies', value: isRtl ? 'معتمدة' : 'Valid', color: 'text-emerald-400' },
        ];
      case 'reception':
        return [
          { label: isRtl ? 'بالمنشأة' : 'Guests', value: `${activeVisitorsCount}`, color: 'text-emerald-400' },
          { label: isRtl ? 'المواعيد' : 'Visits', value: `${todayScheduledCount}`, color: 'text-[#EBB34D]' },
          { label: isRtl ? 'القاعات' : 'Rooms', value: `${occupiedRoomsCount} ${isRtl ? 'مشغولة' : 'In Use'}`, color: 'text-[#8FA392]' },
        ];
      case 'settings':
        return [
          { label: isRtl ? 'المستخدمون' : 'Users', value: `24`, color: 'text-[#EBB34D]' },
          { label: isRtl ? 'الأدوار' : 'Roles', value: `6`, color: 'text-[#F3EFE6]' },
          { label: isRtl ? 'قواعد SQL' : 'SQL Fleet', value: isRtl ? 'متصلة' : 'Online', color: 'text-emerald-400' },
        ];
      default:
        return [
          { label: isRtl ? 'الحالة' : 'Status', value: isRtl ? 'نشط' : 'Active', color: 'text-emerald-400' },
          { label: isRtl ? 'الخدمات' : 'Services', value: '5+', color: 'text-[#EBB34D]' },
          { label: isRtl ? 'الربط' : 'Link', value: isRtl ? 'مباشر' : 'Live', color: 'text-[#F3EFE6]' },
        ];
    }
  };

  // Executive Command Launchpad (بوابة الاستقبال والقيادة المركزية)
  return (
    <div className="w-full max-w-none space-y-7 animate-in fade-in duration-200">
      {/* 1. Welcome & Time Header (مرحباً، م. أحمد مصطفى) */}
      <div className="relative overflow-hidden rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-gradient-to-r from-[#F3EFE6] via-[#F3EFE6]/95 to-[#EAE4D7] dark:from-[#17231A] dark:via-[#17231A]/95 dark:to-[#131E15] p-5 sm:p-7 shadow-lg">
        {/* Subtle Ambient Luminescence Aura */}
        <div className="absolute -top-16 -end-16 w-64 h-64 bg-[#D99B26]/10 dark:bg-[#EBB34D]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 start-1/4 w-48 h-48 bg-[#EAE4D7]/40 dark:bg-[#1F2E23]/40 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#D99B26] dark:bg-[#EBB34D] animate-pulse" />
              <span className="text-[11px] font-bold tracking-wider uppercase text-[#D99B26] dark:text-[#EBB34D]">
                {t('بوابة الاستقبال والقيادة المركزية', 'Executive Command Launchpad')}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-[#1A241C] dark:text-[#F3EFE6] tracking-tight">
              {isRtl ? `مرحباً، ${currentUser.nameAr}` : `Welcome, ${currentUser.nameEn}`}
            </h1>

            <div className="text-xs sm:text-sm text-[#5C665E] dark:text-[#8FA392] leading-relaxed flex items-center gap-2 flex-wrap pt-0.5">
              <span>{t('لوحة القيادة المركزية • اختر القسم أو المنظومة لبدء العمل الميداني والمالي', 'Central Command Launchpad • Select a department to begin operations')}</span>
              <span className="text-[#E0D9CB] dark:text-[#243628] hidden sm:inline">•</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FBF9F5]/90 dark:bg-[#0E1610]/80 border border-[#E0D9CB] dark:border-[#243628] text-[11px] font-medium text-[#5C665E] dark:text-[#8FA392]">
                <Clock className="w-3 h-3 text-[#D99B26] dark:text-[#EBB34D]" />
                <span>{formattedDate} • {formattedTime}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start lg:self-center shrink-0">
            {/* Active Company Tag Capsule */}
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-[#FBF9F5]/90 dark:bg-[#0E1610]/90 border border-[#E0D9CB] dark:border-[#243628] text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] shadow-xs">
              <div className="w-7 h-7 rounded-lg bg-[#D99B26]/15 dark:bg-[#EBB34D]/15 text-[#D99B26] dark:text-[#EBB34D] flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="text-start leading-tight">
                <span className="text-[10px] text-[#5C665E] dark:text-[#8FA392] block font-semibold">
                  {t('نطاق العمل النشط', 'Active Entity Scope')}
                </span>
                <span className="text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] truncate max-w-[220px] block">
                  {isRtl ? selectionSummaryAr : selectionSummaryEn}
                </span>
              </div>
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
            <p className="text-[11px] text-[#5C665E] dark:text-[#8FA392]">
              {t('منصات العمل المتكاملة والمربوطة بالدليل المحاسبي ومراكز التكلفة', 'Integrated operational suites linked to the central GL & cost centers')}
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] text-xs font-bold font-mono text-[#D99B26] dark:text-[#EBB34D] shadow-2xs">
          {categories.length} {t('منظومات متصلة', 'Connected Suites')}
        </span>
      </div>

      {/* 3. Animated Department Cards Grid (12 Primary Modules) */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 w-full max-w-none"
      >
        {categories.map(cat => {
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
              onClick={() => selectItem(cat.id, cat.subItems[0]?.id)}
              className="group flex flex-col justify-between rounded-2xl bg-[#F3EFE6]/90 dark:bg-[#17231A]/90 backdrop-blur-md border border-[#E0D9CB] dark:border-[#243628] hover:border-[#D99B26]/50 dark:hover:border-[#EBB34D]/50 hover:shadow-[0_12px_32px_-8px_rgba(217,155,38,0.14)] dark:hover:shadow-[0_12px_32px_-8px_rgba(235,179,77,0.14)] p-5 relative overflow-hidden transition-all duration-300 cursor-pointer text-start"
            >
              {/* Subtle dynamic ambient glow on hover */}
              <div className="absolute -top-12 -end-12 w-28 h-28 rounded-full bg-[#D99B26]/0 dark:bg-[#EBB34D]/0 group-hover:bg-[#D99B26]/10 dark:group-hover:bg-[#EBB34D]/10 blur-xl transition-all duration-500 pointer-events-none" />

              <div>
                {/* Top Bar of Card: Frosted Glass Icon + Badge + Interactive Arrow */}
                <div className="flex items-center justify-between gap-2 mb-3.5">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border transition-transform duration-200 group-hover:scale-105 shadow-xs"
                      style={{
                        backgroundColor: `${cat.colorVar}15`,
                        borderColor: `${cat.colorVar}30`,
                        color: cat.colorVar,
                      }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    {badge && (
                      <span
                        className="text-[11px] font-bold px-2.5 py-1 rounded-full border shadow-2xs"
                        style={{
                          backgroundColor: `${cat.colorVar}12`,
                          borderColor: `${cat.colorVar}30`,
                          color: cat.colorVar,
                        }}
                      >
                        {badge}
                      </span>
                    )}
                  </div>

                  {/* Corner Navigation Arrow */}
                  <div className="w-8 h-8 rounded-xl bg-[#EAE4D7]/60 dark:bg-[#243628]/40 border border-[#E0D9CB] dark:border-[#243628] flex items-center justify-center text-[#5C665E] dark:text-[#8FA392] group-hover:text-[#D99B26] dark:group-hover:text-[#EBB34D] group-hover:border-[#D99B26]/40 dark:group-hover:border-[#EBB34D]/40 group-hover:bg-[#D99B26]/10 dark:group-hover:bg-[#EBB34D]/10 group-hover:scale-110 transition-all shrink-0">
                    <ArrowUpRight
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isRtl
                          ? 'rotate-[-90deg] group-hover:-translate-x-0.5 group-hover:-translate-y-0.5'
                          : 'group-hover:translate-x-0.5 group-hover:-translate-y-0.5'
                      }`}
                    />
                  </div>
                </div>

                {/* Card Body: Title & Concise Description */}
                <h3 className="text-base font-black text-[#1A241C] dark:text-[#F3EFE6] group-hover:text-[#D99B26] dark:group-hover:text-[#EBB34D] transition-colors tracking-tight leading-snug">
                  {title}
                </h3>
                <p className="text-xs text-[#5C665E] dark:text-[#8FA392] line-clamp-1 leading-relaxed mt-1">
                  {description}
                </p>

                {/* Live Micro-KPIs Matrix (3-Column Embedded Panel) */}
                <div className="mt-3.5 p-2.5 rounded-xl bg-[#FBF9F5]/90 dark:bg-[#0E1610]/80 border border-[#E0D9CB]/80 dark:border-[#243628]/80 grid grid-cols-3 divide-x divide-x-reverse divide-[#E0D9CB]/60 dark:divide-[#243628]/60 text-center">
                  {kpis.map((kpi, idx) => (
                    <div key={idx} className="px-1 flex flex-col justify-center">
                      <span className="text-[10px] text-[#5C665E] dark:text-[#8FA392] font-semibold truncate block">
                        {kpi.label}
                      </span>
                      <span className={`text-[12px] font-bold font-mono truncate mt-0.5 ${kpi.color}`}>
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
                  <span className="font-semibold">{cat.subItems.length} {isRtl ? 'خدمات' : 'Services'}</span>
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
