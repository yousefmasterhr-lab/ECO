import React, { useState, useEffect, useMemo } from 'react';
import { useDatabase } from '../../../services/federation/DatabaseContext';
import { useLanguage } from '../../../context/LanguageContext';
import { federationService } from '../../../services/federation/federationService';
import {
  PayrollGlBridgeData,
  UniversalProjectsBridgeData,
  MultiYearBalanceData,
  FederatedQueryResult
} from '../../../services/federation/types';
import { formatCurrency } from '@erp/ui-system';
import {
  Database,
  Users,
  HardHat,
  RefreshCw,
  Search,
  CheckCircle2,
  Layers,
  ArrowRightLeft,
  Play,
  AlertTriangle,
  Radio,
  FileCode2,
  TrendingUp
} from 'lucide-react';

export const DatabaseFederationHub: React.FC = () => {
  const { isRtl, t } = useLanguage();
  const {
    activeDatabase,
    setActiveDatabase,
    databases,
    health,
    isLoading: isContextLoading,
    isFailSafe,
    refresh,
    pingConnection
  } = useDatabase();

  // Active Hub Tab
  const [hubTab, setHubTab] = useState<'fleet' | 'payroll_gl' | 'universal_projects' | 'multi_year' | 'sql_console'>('fleet');

  // Filter for fleet
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [fleetSearch, setFleetSearch] = useState<string>('');

  // Ping test state
  const [isPinging, setIsPinging] = useState(false);
  const [lastPingTime, setLastPingTime] = useState<number | null>(null);

  // Pre-built bridge data states
  const [payrollData, setPayrollData] = useState<PayrollGlBridgeData | null>(null);
  const [payrollLoading, setPayrollLoading] = useState(false);

  const [projectsData, setProjectsData] = useState<UniversalProjectsBridgeData | null>(null);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectSearch, setProjectSearch] = useState('');

  const [multiYearData, setMultiYearData] = useState<MultiYearBalanceData | null>(null);
  const [multiYearLoading, setMultiYearLoading] = useState(false);

  // Safe Query Console state
  const [consoleDb, setConsoleDb] = useState<string>(activeDatabase || 'Tarabot_Data_2026');
  const [sqlQuery, setSqlQuery] = useState<string>(
    'SELECT TOP 15 Level5_ID, Level5_Name_A, Level4_ID FROM Level5_View ORDER BY Level5_ID ASC;'
  );
  const [queryResult, setQueryResult] = useState<FederatedQueryResult | null>(null);
  const [isExecutingQuery, setIsExecutingQuery] = useState(false);
  const [queryError, setQueryError] = useState<string | null>(null);

  // Ping Handler
  const handlePing = async () => {
    setIsPinging(true);
    const latency = await pingConnection();
    setLastPingTime(latency);
    setIsPinging(false);
  };

  // Load Bridge 1: Payroll-GL
  const loadPayrollGl = async () => {
    setPayrollLoading(true);
    const res = await federationService.fetchPayrollGlBridge();
    setPayrollData(res);
    setPayrollLoading(false);
  };

  // Load Bridge 2: Universal Projects
  const loadUniversalProjects = async () => {
    setProjectsLoading(true);
    const res = await federationService.fetchUniversalProjectsBridge();
    setProjectsData(res);
    setProjectsLoading(false);
  };

  // Load Bridge 3: Multi-Year
  const loadMultiYear = async () => {
    setMultiYearLoading(true);
    const res = await federationService.fetchMultiYearBalanceBridge();
    setMultiYearData(res);
    setMultiYearLoading(false);
  };

  // Safe Query Execution
  const handleExecuteQuery = async () => {
    setQueryError(null);
    setIsExecutingQuery(true);
    const res = await federationService.executeReadOnlyQuery(sqlQuery, consoleDb);
    if (!res.success) {
      setQueryError(res.error || 'تعذر تنفيذ الاستعلام.');
    }
    setQueryResult(res);
    setIsExecutingQuery(false);
  };

  // Load active tab data on demand
  useEffect(() => {
    if (hubTab === 'payroll_gl' && !payrollData) {
      loadPayrollGl();
    } else if (hubTab === 'universal_projects' && !projectsData) {
      loadUniversalProjects();
    } else if (hubTab === 'multi_year' && !multiYearData) {
      loadMultiYear();
    }
  }, [hubTab]);

  // Sync consoleDb with activeDatabase
  useEffect(() => {
    if (activeDatabase) {
      setConsoleDb(activeDatabase);
    }
  }, [activeDatabase]);

  // Filtered databases for fleet tab
  const filteredDatabases = useMemo(() => {
    let list = databases;
    if (selectedCategory !== 'ALL') {
      list = list.filter(d => d.category === selectedCategory);
    }
    if (fleetSearch.trim()) {
      const term = fleetSearch.toLowerCase();
      list = list.filter(
        d =>
          d.name.toLowerCase().includes(term) ||
          d.displayNameAr.toLowerCase().includes(term) ||
          d.displayNameEn.toLowerCase().includes(term) ||
          d.descriptionAr.toLowerCase().includes(term)
      );
    }
    return list;
  }, [databases, selectedCategory, fleetSearch]);

  // Filtered universal projects
  const filteredProjects = useMemo(() => {
    if (!projectsData?.projects) return [];
    if (!projectSearch.trim()) return projectsData.projects;
    const term = projectSearch.toLowerCase();
    return projectsData.projects.filter(
      p =>
        p.projectNameAr.toLowerCase().includes(term) ||
        p.sourceDb.toLowerCase().includes(term) ||
        String(p.projectId).includes(term)
    );
  }, [projectsData, projectSearch]);

  const categoryFilters = [
    { id: 'ALL', labelAr: 'كافة القواعد (الكل)', labelEn: 'All Databases' },
    { id: 'primary', labelAr: 'المنظومة النشطة (Active)', labelEn: 'Active' },
    { id: 'archives', labelAr: 'السنوات السابقة (Archives)', labelEn: 'Archives' },
    { id: 'specialized_payroll', labelAr: 'الرواتب والأجور (Payroll)', labelEn: 'Payroll' },
    { id: 'partners', labelAr: 'شركات الشركاء (Partners)', labelEn: 'Partners' },
    { id: 'engineering_archive', labelAr: 'الأرشيف الهندسي', labelEn: 'Projects' },
    { id: 'sandbox', labelAr: 'بيئات الاختبار', labelEn: 'Sandbox' },
  ];

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Top Cockpit Header & Connection Health Bar */}
      <div className="relative overflow-hidden rounded-2xl border border-[#243628] bg-[#121B14] p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#3D2D14] text-[#EBB34D] border border-[#5C431D] flex items-center justify-center font-bold shadow-xs">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-black text-[#F3EFE6] tracking-tight">
                  {t('مركز إدارة وتكامل قواعد البيانات (SQL Federation Hub)', 'Database & SQL Federation Hub')}
                </h1>
                <p className="text-xs text-[#8FA392]">
                  {t(
                    'إدارة الربط الشبكي عبر نفق Tailscale لـ 10 قواعد بيانات Microsoft SQL Server 2008 R2 Express',
                    'Multi-Database Federation across Tailscale PortProxy bridge to Microsoft SQL Server 2008'
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions & Ping */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handlePing}
              disabled={isPinging}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl border border-[#243628] bg-[#17231A] hover:bg-[#1F2E23] text-[#EBB34D] transition-all cursor-pointer shadow-xs"
            >
              <Radio className={`w-3.5 h-3.5 ${isPinging ? 'animate-pulse text-amber-400' : ''}`} />
              <span>{isPinging ? t('جاري القياس...', 'Pinging...') : t('فحص النفق (Ping)', 'Ping Tunnel')}</span>
              {lastPingTime !== null && (
                <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-md bg-[#2A3F30] text-[#A3CFAC] border border-[#3E5C46]">
                  {lastPingTime}ms
                </span>
              )}
            </button>

            <button
              onClick={() => refresh()}
              disabled={isContextLoading}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl border border-[#243628] bg-[#17231A] hover:bg-[#1F2E23] text-[#F3EFE6] transition-all cursor-pointer shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isContextLoading ? 'animate-spin text-[#EBB34D]' : ''}`} />
              <span>{t('تحديث الأسطول', 'Refresh Fleet')}</span>
            </button>
          </div>
        </div>

        {/* Real-time Health Metrics Strip */}
        <div className="mt-5 pt-4 border-t border-[#243628] grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
          <div className="p-2.5 rounded-xl bg-[#17231A] border border-[#243628]">
            <span className="text-[10px] text-[#8FA392] block">{t('حالة النفق / الاتصال', 'Tunnel Status')}</span>
            <div className="flex items-center gap-1.5 mt-1 font-bold">
              <span className={`w-2 h-2 rounded-full ${isFailSafe ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'}`} />
              <span className={isFailSafe ? 'text-amber-400' : 'text-[#A3CFAC]'}>
                {isFailSafe ? t('محاكاة آمنة (Fail-Safe)', 'Safe Mode') : t('متصل (Tailscale)', 'Online Bridge')}
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-[#17231A] border border-[#243628]">
            <span className="text-[10px] text-[#8FA392] block">{t('خادم SQL Server', 'SQL Server Host')}</span>
            <span className="font-mono font-bold text-[#EBB34D] mt-1 block truncate">
              {health?.host || '100.76.198.119'}:{health?.port || 1433}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#17231A] border border-[#243628]">
            <span className="text-[10px] text-[#8FA392] block">{t('الهدف المحلي (PortProxy)', 'Local PortProxy')}</span>
            <span className="font-mono font-bold text-[#F3EFE6] mt-1 block truncate">
              192.168.1.50:49748
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#17231A] border border-[#243628]">
            <span className="text-[10px] text-[#8FA392] block">{t('سرعة الاستجابة (Latency)', 'Round-Trip Ping')}</span>
            <span className="font-mono font-bold text-[#A3CFAC] mt-1 block tabular-nums">
              {health?.latencyMs || 24} ms
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#17231A] border border-[#243628]">
            <span className="text-[10px] text-[#8FA392] block">{t('مسابح الاتصال (Pools)', 'Active Pools')}</span>
            <span className="font-mono font-bold text-[#EBB34D] mt-1 block tabular-nums">
              {health?.activePoolsCount || 1} / 10 Active
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#17231A] border border-[#243628]">
            <span className="text-[10px] text-[#8FA392] block">{t('السياق النشط حالياً', 'Active DB Context')}</span>
            <span className="font-mono font-bold text-[#F3EFE6] mt-1 block truncate">
              {activeDatabase}
            </span>
          </div>
        </div>
      </div>

      {/* Segmented Control (Single tier only) */}
      <div className="p-1 rounded-2xl bg-[#121B14] border border-[#243628] flex items-center gap-1 overflow-x-auto shadow-inner">
        <button
          onClick={() => setHubTab('fleet')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            hubTab === 'fleet'
              ? 'bg-[#EBB34D] text-[#0E1610] shadow-sm'
              : 'text-[#8FA392] hover:text-[#F3EFE6] hover:bg-[#17231A]'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>{t(`أسطول القواعد (${databases.length})`, `Database Fleet (${databases.length})`)}</span>
        </button>

        <button
          onClick={() => setHubTab('payroll_gl')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            hubTab === 'payroll_gl'
              ? 'bg-[#EBB34D] text-[#0E1610] shadow-sm'
              : 'text-[#8FA392] hover:text-[#F3EFE6] hover:bg-[#17231A]'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>{t('فحص الرواتب', 'Payroll Check')}</span>
        </button>

        <button
          onClick={() => setHubTab('universal_projects')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            hubTab === 'universal_projects'
              ? 'bg-[#EBB34D] text-[#0E1610] shadow-sm'
              : 'text-[#8FA392] hover:text-[#F3EFE6] hover:bg-[#17231A]'
          }`}
        >
          <HardHat className="w-3.5 h-3.5" />
          <span>{t('البحث الشامل', 'Universal Search')}</span>
        </button>

        <button
          onClick={() => setHubTab('multi_year')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            hubTab === 'multi_year'
              ? 'bg-[#EBB34D] text-[#0E1610] shadow-sm'
              : 'text-[#8FA392] hover:text-[#F3EFE6] hover:bg-[#17231A]'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>{t('مقارنة الميزانيات', 'Compare Budgets')}</span>
        </button>

        <button
          onClick={() => setHubTab('sql_console')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            hubTab === 'sql_console'
              ? 'bg-[#EBB34D] text-[#0E1610] shadow-sm'
              : 'text-[#8FA392] hover:text-[#F3EFE6] hover:bg-[#17231A]'
          }`}
        >
          <FileCode2 className="w-3.5 h-3.5" />
          <span>{t('SQL Console', 'SQL Console')}</span>
        </button>
      </div>

      {/* =================================================================== */}
      {/* TAB 1: Database Fleet Grid */}
      {/* =================================================================== */}
      {hubTab === 'fleet' && (
        <div className="space-y-4">
          {/* Single Filter Bar: Search + Category Dropdown */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#121B14] p-3 rounded-xl border border-[#243628]">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-[#8FA392] absolute top-1/2 -translate-y-1/2 start-3" />
              <input
                type="text"
                value={fleetSearch}
                onChange={e => setFleetSearch(e.target.value)}
                placeholder={t(
                  'البحث باسم قاعدة البيانات أو الكيان أو الوصف...',
                  'Search database name, entity, or description...'
                )}
                className="w-full bg-[#17231A] border border-[#243628] rounded-lg ps-9 pe-3 py-2 text-xs text-[#F3EFE6] placeholder-[#8FA392] focus:outline-none focus:border-[#EBB34D]"
              />
            </div>
            <div className="w-full sm:w-auto flex items-center gap-2 shrink-0">
              <span className="text-xs text-[#8FA392] shrink-0 font-medium">
                {t('التصنيف:', 'Category:')}
              </span>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="bg-[#17231A] border border-[#243628] rounded-lg px-3 py-2 text-xs text-[#F3EFE6] focus:outline-none focus:border-[#EBB34D] cursor-pointer"
              >
                {categoryFilters.map(filter => (
                  <option key={filter.id} value={filter.id} className="bg-[#17231A] text-[#F3EFE6]">
                    {isRtl ? filter.labelAr : filter.labelEn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Compact Databases Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDatabases.map(db => {
              const isCurrent = db.name === activeDatabase;
              const isOnline = db.status.toUpperCase().includes('ONLINE') || !db.status.toUpperCase().includes('OFFLINE');

              return (
                <div
                  key={db.name}
                  className={`rounded-2xl border p-4 transition-all duration-200 flex flex-col justify-between gap-4 min-h-[220px] ${
                    isCurrent
                      ? 'border-[#EBB34D] bg-[#1F2E23] shadow-lg ring-1 ring-[#EBB34D]/50'
                      : 'border-[#243628] bg-[#121B14] hover:bg-[#17231A]'
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                            isCurrent
                              ? 'bg-[#3D2D14] text-[#EBB34D] border-[#5C431D]'
                              : 'bg-[#17231A] text-[#8FA392] border-[#243628]'
                          }`}
                        >
                          <Database className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-mono text-xs sm:text-sm font-bold text-[#F3EFE6] truncate" title={db.name}>
                            {db.name}
                          </h3>
                          <span className="text-[11px] font-bold text-[#8FA392] block truncate">
                            {isRtl ? db.displayNameAr : db.displayNameEn}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold ${
                            isOnline
                              ? 'bg-[#193220] text-[#A3CFAC] border border-[#2E5A36]'
                              : 'bg-[#3A1818] text-[#F5A3A3] border border-[#5A2E2E]'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-[#52C41A]' : 'bg-[#F5222D]'}`} />
                          {isOnline ? 'ONLINE' : 'OFFLINE'}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-[#8FA392] line-clamp-2 leading-relaxed">
                      {db.descriptionAr}
                    </p>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-[#243628]">
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                      <div className="p-1.5 rounded-lg bg-[#17231A] border border-[#243628] text-center">
                        <span className="text-[9px] text-[#8FA392] block">الحجم التخزيني:</span>
                        <span className="font-bold text-[#EBB34D]">{db.sizeMb} MB</span>
                      </div>

                      <div className="p-1.5 rounded-lg bg-[#17231A] border border-[#243628] text-center">
                        <span className="text-[9px] text-[#8FA392] block">تصنيف المنظومة:</span>
                        <span className="font-bold text-[#A3CFAC] truncate block">
                          {isRtl ? db.categoryNameAr : db.categoryNameEn}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveDatabase(db.name)}
                      className={`w-full min-h-[36px] flex items-center justify-center gap-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-[#EBB34D] text-[#0E1610] cursor-default font-extrabold shadow-sm'
                          : 'bg-[#17231A] hover:bg-[#3D2D14] text-[#EBB34D] border border-[#243628] hover:border-[#EBB34D]/60'
                      }`}
                    >
                      {isCurrent ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#0E1610]" />
                          <span>{t('السياق النشط حالياً', 'Active Database Context')}</span>
                        </>
                      ) : (
                        <>
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                          <span>{t('تبديل السياق النشط إلى هذه القاعدة', 'Switch Active Context')}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 2: Payroll-to-GL Inspection */}
      {/* =================================================================== */}
      {hubTab === 'payroll_gl' && (
        <div className="space-y-5">
          <div className="p-4 rounded-xl border border-[#243628] bg-[#17231A] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Users className="w-5 h-5 text-[#EBB34D]" />
              <div>
                <h3 className="text-sm font-bold text-[#F3EFE6]">
                  {t('فحص الرواتب والأجور الشهرية ومطابقتها مع الأستاذ العام', 'Payroll-to-GL Inspection')}
                </h3>
                <p className="text-xs text-[#8FA392]">
                  {t(
                    'قراءة فورية لصافي مستحقات العاملين من قاعدة [SL_Salary_Db_2026] دون إجراء أي تعديل على الحسابات الحية',
                    'Direct inspection of employee compensation from [SL_Salary_Db_2026] without altering live accounts'
                  )}
                </p>
              </div>
            </div>

            <button
              onClick={loadPayrollGl}
              disabled={payrollLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-[#243628] bg-[#121B14] hover:bg-[#1F2E23] text-[#EBB34D] transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${payrollLoading ? 'animate-spin' : ''}`} />
              <span>{t('تحديث البيانات', 'Refresh')}</span>
            </button>
          </div>

          {/* Payroll KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-[#243628] bg-[#17231A]">
              <span className="text-xs text-[#8FA392] block">{t('إجمالي الأجور المستحقة (Gross)', 'Total Gross Wages')}</span>
              <span className="text-lg font-black text-[#F3EFE6] mt-1 block tabular-nums">
                {formatCurrency(payrollData?.totalGross || 0, false)} {t('ج.م', 'EGP')}
              </span>
            </div>

            <div className="p-4 rounded-xl border border-[#243628] bg-[#17231A]">
              <span className="text-xs text-[#8FA392] block">{t('استقطاعات التأمينات الاجتماعية', 'Social Insurance Withholding')}</span>
              <span className="text-lg font-black text-[#EBB34D] mt-1 block tabular-nums">
                {formatCurrency(payrollData?.totalInsurance || 0, false)} {t('ج.م', 'EGP')}
              </span>
            </div>

            <div className="p-4 rounded-xl border border-[#243628] bg-[#17231A]">
              <span className="text-xs text-[#8FA392] block">{t('ضريبة كسب العمل المستحقة', 'Payroll Tax Withholding')}</span>
              <span className="text-lg font-black text-[#EBB34D] mt-1 block tabular-nums">
                {formatCurrency(payrollData?.totalTax || 0, false)} {t('ج.م', 'EGP')}
              </span>
            </div>

            <div className="p-4 rounded-xl border border-[#243628] bg-[#17231A]">
              <span className="text-xs text-[#8FA392] block">{t('صافي الأجور المنصرفة (Net Payable)', 'Net Wages Disbursed')}</span>
              <span className="text-lg font-black text-[#A3CFAC] mt-1 block tabular-nums">
                {formatCurrency(payrollData?.totalNet || 0, false)} {t('ج.م', 'EGP')}
              </span>
            </div>
          </div>

          {/* GL Accounting Link Mapping */}
          <div className="rounded-xl border border-[#243628] bg-[#17231A] p-4 space-y-3">
            <h4 className="text-xs font-bold text-[#F3EFE6] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#EBB34D]" />
              <span>{t('مطابقة أرصدة الرواتب مع حسابات الأستاذ العام (GL Alignment)', 'GL Account Alignment')}</span>
            </h4>

            <div className="border border-[#243628] rounded-xl overflow-hidden bg-[#121B14]">
              <table className="w-full text-start text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#243628] bg-[#17231A] text-[#8FA392] font-bold">
                    <th className="py-2.5 px-3 text-start w-28">{t('رقم الحساب', 'Account Code')}</th>
                    <th className="py-2.5 px-3 text-start">{t('اسم الحساب بدليل الحسابات', 'GL Account Name')}</th>
                    <th className="py-2.5 px-3 text-center w-24">{t('طبيعة الحساب', 'Nature')}</th>
                    <th className="py-2.5 px-3 text-end w-36">{t('المبلغ الفعلي المنصرف', 'Actual Amount')}</th>
                    <th className="py-2.5 px-3 text-end w-36">{t('الميزانية المقدرة', 'Budgeted')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#243628]">
                  {payrollData?.glAccounts?.map(acc => (
                    <tr key={acc.code} className="hover:bg-[#1F2E23]/30 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-[#EBB34D]">
                        {acc.code}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-[#F3EFE6]">
                        {acc.nameAr}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            acc.nature === 'DEBIT'
                              ? 'bg-[#2A3F30] text-[#A3CFAC] border border-[#3E5C46]'
                              : 'bg-[#3F2A2A] text-[#EFA3A3] border border-[#5C3E3E]'
                          }`}
                        >
                          {acc.nature === 'DEBIT' ? 'مدين' : 'دائن'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-end font-bold text-[#F3EFE6] tabular-nums">
                        {formatCurrency(acc.actualDisbursed, false)} {t('ج.م', 'EGP')}
                      </td>
                      <td className="py-2.5 px-3 text-end text-[#8FA392] tabular-nums">
                        {formatCurrency(acc.budgeted, false)} {t('ج.م', 'EGP')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Employees List */}
          <div className="rounded-xl border border-[#243628] bg-[#17231A] p-4 space-y-3">
            <h4 className="text-xs font-bold text-[#F3EFE6]">
              {t('عينة كشف الأجور التفصيلي للعاملين (SL_Salary_Db_2026)', 'Sample Employee Records')}
            </h4>

            <div className="border border-[#243628] rounded-xl overflow-hidden bg-[#121B14]">
              <table className="w-full text-start text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#243628] bg-[#17231A] text-[#8FA392] font-bold">
                    <th className="py-2.5 px-3 text-start w-16">#</th>
                    <th className="py-2.5 px-3 text-start">{t('اسم الموظف / المهندس', 'Employee Name')}</th>
                    <th className="py-2.5 px-3 text-start">{t('الإدارة / التخصص', 'Department')}</th>
                    <th className="py-2.5 px-3 text-end w-32">{t('الراتب الإجمالي', 'Gross')}</th>
                    <th className="py-2.5 px-3 text-end w-28">{t('التأمينات', 'Insurance')}</th>
                    <th className="py-2.5 px-3 text-end w-28">{t('الضريبة', 'Tax')}</th>
                    <th className="py-2.5 px-3 text-end w-32">{t('الصافي المستحق', 'Net')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#243628]">
                  {payrollData?.employees?.map(emp => (
                    <tr key={emp.employeeId} className="hover:bg-[#1F2E23]/30 transition-colors">
                      <td className="py-2 px-3 font-mono text-[#8FA392]">
                        {emp.employeeId}
                      </td>
                      <td className="py-2 px-3 font-bold text-[#F3EFE6]">
                        {emp.nameAr}
                      </td>
                      <td className="py-2 px-3 text-[#8FA392]">
                        {emp.departmentAr}
                      </td>
                      <td className="py-2 px-3 text-end font-bold tabular-nums text-[#F3EFE6]">
                        {formatCurrency(emp.totalSalary, false)}
                      </td>
                      <td className="py-2 px-3 text-end tabular-nums text-rose-300">
                        -{formatCurrency(emp.insuranceAmount, false)}
                      </td>
                      <td className="py-2 px-3 text-end tabular-nums text-rose-300">
                        -{formatCurrency(emp.taxAmount, false)}
                      </td>
                      <td className="py-2 px-3 text-end font-black text-[#A3CFAC] tabular-nums">
                        {formatCurrency(emp.netSalary, false)} {t('ج.م', 'EGP')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 3: Universal Project Search */}
      {/* =================================================================== */}
      {hubTab === 'universal_projects' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-[#243628] bg-[#17231A] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-[#F3EFE6]">
                {t('محرك البحث الموحد في مشروعات وعقود المؤسسة (Universal Project Search)', 'Universal Project Search')}
              </h3>
              <p className="text-xs text-[#8FA392]">
                {t(
                  'استعلام عبر UNION ALL يربط مشروعات Tarabot_Data_2026 و Old_Projects_Data و MKH_Tarabot_Data_2026',
                  'Cross-database UNION ALL query searching contracts and project cost centers across databases'
                )}
              </p>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-[#8FA392] absolute top-1/2 -translate-y-1/2 start-3" />
              <input
                type="text"
                value={projectSearch}
                onChange={e => setProjectSearch(e.target.value)}
                placeholder={t('بحث باسم المشروع أو الكود...', 'Search project or code...')}
                className="w-full ps-9 pe-3 py-2 text-xs rounded-xl border border-[#243628] bg-[#121B14] text-[#F3EFE6] focus:border-[#EBB34D] focus:outline-hidden"
              />
            </div>
          </div>

          {/* Results Table */}
          {projectsLoading ? (
            <div className="p-12 text-center text-[#8FA392] flex flex-col items-center justify-center gap-3 border border-[#243628] rounded-xl bg-[#121B14]">
              <RefreshCw className="w-6 h-6 animate-spin text-[#EBB34D]" />
              <span className="text-xs">{t('جاري جلب المشروعات عبر القواعد الثلاث المترابطة...', 'Fetching projects across federated databases...')}</span>
            </div>
          ) : (
            <div className="border border-[#243628] rounded-xl overflow-hidden bg-[#121B14]">
              <table className="w-full text-start text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#243628] bg-[#17231A] text-[#8FA392] font-bold">
                    <th className="py-2.5 px-3 text-start w-32">{t('قاعدة البيانات المصدر', 'Source DB')}</th>
                    <th className="py-2.5 px-3 text-start w-36">{t('الشركة / الكيان', 'Company Entity')}</th>
                    <th className="py-2.5 px-3 text-center w-28">{t('كود مركز التكلفة', 'Cost Center')}</th>
                    <th className="py-2.5 px-3 text-start">{t('اسم المشروع والعملية الهندسية', 'Project Name')}</th>
                    <th className="py-2.5 px-3 text-center w-36">{t('حالة المشروع', 'Status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#243628]">
                  {filteredProjects.map((p, idx) => (
                    <tr key={idx} className="hover:bg-[#1F2E23]/30 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-[11px] font-bold text-[#EBB34D]">
                        {p.sourceDb}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-[#F3EFE6]">
                        {p.companyAr}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-[#8FA392]">
                        {p.projectId}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-[#F3EFE6]">
                        {p.projectNameAr}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            p.sourceDb === 'Tarabot_Data_2026'
                              ? 'bg-[#2A3F30] text-[#A3CFAC] border border-[#3E5C46]'
                              : p.sourceDb === 'Old_Projects_Data'
                              ? 'bg-[#1F2E23] text-[#8FA392] border border-[#243628]'
                              : 'bg-[#3D2D14] text-[#EBB34D] border border-[#5C431D]'
                          }`}
                        >
                          {p.statusAr}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 4: Multi-Year Comparative Balances */}
      {/* =================================================================== */}
      {hubTab === 'multi_year' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-[#243628] bg-[#17231A] flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-[#F3EFE6]">
                {t('الميزانية المقارنة متعددة السنوات (2022 / 2023 / 2026)', 'Multi-Year Comparative Balances')}
              </h3>
              <p className="text-xs text-[#8FA392]">
                {t(
                  'مقارنة مباشرة بين القوائم المالية المقفلة وتطور حجم الأعمال عبر القواعد الثلاث',
                  'Direct balance comparison across historical and active databases'
                )}
              </p>
            </div>

            <button
              onClick={loadMultiYear}
              disabled={multiYearLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-[#243628] bg-[#121B14] hover:bg-[#1F2E23] text-[#EBB34D] transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${multiYearLoading ? 'animate-spin' : ''}`} />
              <span>{t('تحديث المقارنة', 'Refresh')}</span>
            </button>
          </div>

          <div className="border border-[#243628] rounded-xl overflow-hidden bg-[#121B14]">
            <table className="w-full text-start text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#243628] bg-[#17231A] text-[#8FA392] font-bold">
                  <th className="py-2.5 px-3 text-start">{t('البند المالي / المؤشر', 'Financial Metric')}</th>
                  <th className="py-2.5 px-3 text-end w-40 font-mono">Tarabot_Data_2022</th>
                  <th className="py-2.5 px-3 text-end w-40 font-mono">Tarabot_Data_2023</th>
                  <th className="py-2.5 px-3 text-end w-44 font-mono text-[#EBB34D]">Tarabot_Data_2026 (النشطة)</th>
                  <th className="py-2.5 px-3 text-center w-28">{t('معدل النمو', 'Growth')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#243628]">
                {multiYearData?.comparativeMetrics?.map((m, idx) => (
                  <tr key={idx} className="hover:bg-[#1F2E23]/30 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-[#F3EFE6]">
                      {m.metricAr}
                    </td>
                    <td className="py-2.5 px-3 text-end text-[#8FA392] font-mono tabular-nums">
                      {formatCurrency(m.y2022, false)}
                    </td>
                    <td className="py-2.5 px-3 text-end text-[#8FA392] font-mono tabular-nums">
                      {formatCurrency(m.y2023, false)}
                    </td>
                    <td className="py-2.5 px-3 text-end font-bold text-[#EBB34D] font-mono tabular-nums">
                      {formatCurrency(m.y2026, false)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold tabular-nums ${
                          m.growthPercent >= 0
                            ? 'bg-[#2A3F30] text-[#A3CFAC] border border-[#3E5C46]'
                            : 'bg-[#3F2A2A] text-[#EFA3A3] border border-[#5C3E3E]'
                        }`}
                      >
                        {m.growthPercent >= 0 ? `+${m.growthPercent}%` : `${m.growthPercent}%`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 5: Interactive Safe SQL Console */}
      {/* =================================================================== */}
      {hubTab === 'sql_console' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-[#243628] bg-[#17231A] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FileCode2 className="w-5 h-5 text-[#EBB34D]" />
                <div>
                  <h3 className="text-sm font-bold text-[#F3EFE6]">
                    {t('وحدة استعلامات SQL المباشرة الآمنة (Read-Only Query Console)', 'Safe SQL Console')}
                  </h3>
                  <p className="text-xs text-[#8FA392]">
                    {t(
                      'استعلام مباشر وسريع على أي من القواعد العشر مع حماية تامة لمنع أي تعديل أو مساس بالبيانات',
                      'Direct read-only query execution with strict mutation protection'
                    )}
                  </p>
                </div>
              </div>

              {/* Target DB Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#8FA392] font-bold">{t('القاعدة المستهدفة:', 'Target DB:')}</span>
                <select
                  value={consoleDb}
                  onChange={e => setConsoleDb(e.target.value)}
                  className="px-3 py-1.5 text-xs font-mono font-bold rounded-xl border border-[#243628] bg-[#121B14] text-[#EBB34D] focus:border-[#EBB34D]"
                >
                  {databases.map(db => (
                    <option key={db.name} value={db.name}>
                      {db.name} ({db.categoryNameAr})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Sample Queries Buttons */}
            <div className="flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-[11px] text-[#8FA392]">{t('نماذج استعلام سريعة:', 'Quick Templates:')}</span>
              <button
                type="button"
                onClick={() => setSqlQuery('SELECT TOP 15 Level5_ID, Level5_Name_A, Level4_ID FROM Level5_View ORDER BY Level5_ID ASC;')}
                className="px-2.5 py-1 rounded-lg bg-[#121B14] hover:bg-[#1F2E23] text-[#8FA392] hover:text-[#F3EFE6] border border-[#243628] text-[11px] font-mono cursor-pointer"
              >
                Level5_View
              </button>

              <button
                type="button"
                onClick={() => setSqlQuery('SELECT TOP 15 Costcenter_ID, Costcenter_Name_A FROM Costcenters ORDER BY Costcenter_ID ASC;')}
                className="px-2.5 py-1 rounded-lg bg-[#121B14] hover:bg-[#1F2E23] text-[#8FA392] hover:text-[#F3EFE6] border border-[#243628] text-[11px] font-mono cursor-pointer"
              >
                Costcenters
              </button>

              <button
                type="button"
                onClick={() => setSqlQuery('SELECT @@VERSION AS ServerVersion, DB_NAME() AS CurrentDatabase, GETDATE() AS ServerTime;')}
                className="px-2.5 py-1 rounded-lg bg-[#121B14] hover:bg-[#1F2E23] text-[#8FA392] hover:text-[#F3EFE6] border border-[#243628] text-[11px] font-mono cursor-pointer"
              >
                @@VERSION
              </button>

              <button
                type="button"
                onClick={() => setSqlQuery('SELECT TABLE_NAME, TABLE_TYPE FROM INFORMATION_SCHEMA.TABLES ORDER BY TABLE_NAME;')}
                className="px-2.5 py-1 rounded-lg bg-[#121B14] hover:bg-[#1F2E23] text-[#8FA392] hover:text-[#F3EFE6] border border-[#243628] text-[11px] font-mono cursor-pointer"
              >
                Tables List
              </button>
            </div>

            {/* SQL Textarea */}
            <div className="space-y-2">
              <textarea
                dir="ltr"
                rows={4}
                value={sqlQuery}
                onChange={e => setSqlQuery(e.target.value)}
                className="w-full p-3 text-xs font-mono rounded-xl border border-[#243628] bg-[#0E1610] text-[#EBB34D] focus:border-[#EBB34D] focus:outline-hidden leading-relaxed"
                placeholder="SELECT ... FROM ...;"
              />

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#8FA392] flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t('أوامر ALTER و DROP و DELETE و UPDATE محظورة برمجياً.', 'Read-Only enforcement active.')}</span>
                </span>

                <button
                  type="button"
                  onClick={handleExecuteQuery}
                  disabled={isExecutingQuery}
                  className="flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl bg-[#D99B26] hover:bg-[#EBB34D] text-[#0E1610] transition-all cursor-pointer shadow-xs"
                >
                  <Play className={`w-3.5 h-3.5 fill-current ${isExecutingQuery ? 'animate-spin' : ''}`} />
                  <span>{isExecutingQuery ? t('جاري التنفيذ...', 'Executing...') : t('تنفيذ الاستعلام (Execute)', 'Run Query')}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Query Error Alert */}
          {queryError && (
            <div className="p-3.5 rounded-xl border border-rose-900/60 bg-rose-950/20 text-rose-300 text-xs font-mono">
              {queryError}
            </div>
          )}

          {/* Query Results Table */}
          {queryResult && queryResult.success && (
            <div className="rounded-xl border border-[#243628] bg-[#17231A] p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-[#F3EFE6]">
                    {t('نتائج الاستعلام:', 'Query Results:')}
                  </span>
                  <span className="font-mono text-[#EBB34D]">
                    {queryResult.rowCount} {t('سجلات', 'rows')}
                  </span>
                  <span className="font-mono text-[#8FA392]">
                    ({queryResult.durationMs} ms)
                  </span>
                </div>
              </div>

              <div className="border border-[#243628] rounded-xl overflow-x-auto bg-[#121B14] max-h-[360px]">
                <table className="w-full text-start text-xs border-collapse font-mono" dir="ltr">
                  <thead>
                    <tr className="border-b border-[#243628] bg-[#17231A] text-[#8FA392] font-bold sticky top-0">
                      {queryResult.columns.map(col => (
                        <th key={col} className="py-2 px-3 text-start whitespace-nowrap">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#243628]">
                    {queryResult.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-[#1F2E23]/40 transition-colors">
                        {queryResult.columns.map(col => (
                          <td key={col} className="py-1.5 px-3 whitespace-nowrap text-[#F3EFE6]">
                            {row[col] !== null && row[col] !== undefined ? String(row[col]) : <span className="text-[#8FA392] italic">NULL</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
