import React, { useState, useEffect, useMemo } from 'react';
import { useDatabase } from '../../../services/federation/DatabaseContext';
import { useLanguage } from '../../../context/LanguageContext';
import { federationService } from '../../../services/federation/federationService';
import { getApiBaseUrl, setApiBaseUrl } from '../../../services/apiClient';
import { FederatedQueryResult } from '../../../services/federation/types';
import {
  Database,
  RefreshCw,
  Search,
  CheckCircle2,
  ArrowRightLeft,
  Play,
  AlertTriangle,
  Radio,
  FileCode2,
  Globe,
  Link,
  Info
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

  // Active Hub Tab: Only databases and sql_console as requested
  const [hubTab, setHubTab] = useState<'databases' | 'sql_console'>('databases');

  // Filter for databases
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [dbSearch, setDbSearch] = useState<string>('');

  // Gateway URL Configuration state
  const [bridgeUrlInput, setBridgeUrlInput] = useState<string>(() => getApiBaseUrl());
  const [isSavingUrl, setIsSavingUrl] = useState<boolean>(false);
  const [showTunnelHelp, setShowTunnelHelp] = useState<boolean>(false);

  // Ping test state
  const [isPinging, setIsPinging] = useState(false);
  const [lastPingTime, setLastPingTime] = useState<number | null>(null);

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

  // Save Bridge URL & Refresh
  const handleSaveBridgeUrl = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingUrl(true);
    try {
      setApiBaseUrl(bridgeUrlInput.trim());
      await refresh();
    } finally {
      setIsSavingUrl(false);
    }
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

  // Sync consoleDb with activeDatabase
  useEffect(() => {
    if (activeDatabase) {
      setConsoleDb(activeDatabase);
    }
  }, [activeDatabase]);

  // Filtered databases (Dynamically discovered only)
  const filteredDatabases = useMemo(() => {
    let list = databases;
    if (selectedCategory !== 'ALL') {
      list = list.filter(d => d.category === selectedCategory);
    }
    if (dbSearch.trim()) {
      const term = dbSearch.toLowerCase();
      list = list.filter(
        d =>
          d.name.toLowerCase().includes(term) ||
          d.displayNameAr.toLowerCase().includes(term) ||
          d.displayNameEn.toLowerCase().includes(term) ||
          d.descriptionAr.toLowerCase().includes(term)
      );
    }
    return list;
  }, [databases, selectedCategory, dbSearch]);

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
      <div className="relative overflow-hidden rounded-2xl border border-[#243628] bg-[#121B14] p-5 sm:p-6 shadow-xl space-y-4">
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
                    'الربط المباشر مع خادم Microsoft SQL Server عبر نفق Tailscale وبوابة الربط API Bridge',
                    'Direct Multi-Database Connection across Tailscale and API Bridge'
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
              <span>{t('تحديث ومزامنة القواعد', 'Sync & Refresh Databases')}</span>
            </button>
          </div>
        </div>

        {/* Real-time Health Metrics Strip */}
        <div className="pt-4 border-t border-[#243628] grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
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
              {health?.latencyMs || 0} ms
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#17231A] border border-[#243628]">
            <span className="text-[10px] text-[#8FA392] block">{t('القواعد المكتشفة فعلياً', 'Discovered Databases')}</span>
            <span className="font-mono font-bold text-[#EBB34D] mt-1 block tabular-nums">
              {databases.length} {t('قاعدة نشطة', 'active')}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#17231A] border border-[#243628]">
            <span className="text-[10px] text-[#8FA392] block">{t('السياق النشط حالياً', 'Active DB Context')}</span>
            <span className="font-mono font-bold text-[#F3EFE6] mt-1 block truncate">
              {activeDatabase}
            </span>
          </div>
        </div>

        {/* Cloudflare & Remote Tailscale Bridge Configuration Bar */}
        <div className="pt-3 border-t border-[#243628]">
          <form onSubmit={handleSaveBridgeUrl} className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#17231A] p-3 rounded-xl border border-[#243628]">
            <div className="flex items-center gap-2 flex-1">
              <Globe className="w-4 h-4 text-[#EBB34D] shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-[#F3EFE6]">
                    {t('بوابة خادم الربط (API Bridge / Tunnel Gateway URL):', 'API Bridge Gateway URL:')}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowTunnelHelp(prev => !prev)}
                    className="text-[10px] text-[#8FA392] hover:text-[#EBB34D] flex items-center gap-1 underline cursor-pointer"
                  >
                    <Info className="w-3 h-3" />
                    <span>{t('طريقة ربط Cloudflare بـ Tailscale', 'How to connect Cloudflare to Tailscale')}</span>
                  </button>
                </div>
                <input
                  type="text"
                  dir="ltr"
                  value={bridgeUrlInput}
                  onChange={e => setBridgeUrlInput(e.target.value)}
                  placeholder="https://api.hrsup.com أو https://my-tunnel.trycloudflare.com أو http://localhost:5000"
                  className="w-full bg-[#121B14] border border-[#243628] rounded-lg px-3 py-1.5 text-xs text-[#F3EFE6] placeholder-[#8FA392] focus:outline-hidden focus:border-[#EBB34D] font-mono"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="submit"
                disabled={isSavingUrl || isContextLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#EBB34D] hover:bg-[#D99B26] text-[#0E1610] text-xs font-black transition-all cursor-pointer shadow-xs disabled:opacity-50"
              >
                <Link className={`w-3.5 h-3.5 ${isSavingUrl ? 'animate-spin' : ''}`} />
                <span>{isSavingUrl ? t('جاري الحفظ والمزامنة...', 'Saving & Syncing...') : t('حفظ واختبار المزامنة', 'Save & Sync')}</span>
              </button>
            </div>
          </form>

          {/* Help instructions for Cloudflare Deployment */}
          {showTunnelHelp && (
            <div className="mt-3 p-4 rounded-xl border border-[#243628] bg-[#0E1610] text-xs text-[#8FA392] space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-[#EBB34D] font-bold">
                <Info className="w-4 h-4 shrink-0" />
                <span>{t('خطوات ربط الموقع المنشور على Cloudflare (eco.hrsup.com) بقاعدة بيانات Tailscale:', 'Connecting Cloudflare-hosted eco.hrsup.com to Tailscale SQL:')}</span>
              </div>
              <ol className="list-decimal list-inside space-y-1.5 leading-relaxed text-[#F3EFE6]/90 ps-2">
                <li>
                  {t('المتصفحات لا تستطيع الاتصال بمنفذ SQL (1433) مباشرة عبر الإنترنت، بل تحتاج لخادم ربط وسيط (Bridge API).', 'Browsers cannot directly connect to raw TCP SQL Port 1433; an HTTP Bridge API is required.')}
                </li>
                <li>
                  {t('شغّل خادم الربط على جهازك المتصل بنفق Tailscale:', 'Run the local SQL bridge on your Tailscale-connected machine:')}
                  <code className="block mt-1 p-2 rounded-lg bg-[#17231A] font-mono text-[#A3CFAC] text-[11px]" dir="ltr">
                    node server/sqlBridge.cjs
                  </code>
                </li>
                <li>
                  {t('استخدم Cloudflare Tunnel المجاني لإنشاء رابط HTTPS آمن لخادم الربط:', 'Expose port 5000 securely via a free Cloudflare Tunnel:')}
                  <code className="block mt-1 p-2 rounded-lg bg-[#17231A] font-mono text-[#A3CFAC] text-[11px]" dir="ltr">
                    cloudflared tunnel --url http://localhost:5000
                  </code>
                </li>
                <li>
                  {t('أو اربط نطاقك الفرعي (مثل https://api.hrsup.com) بالبورت 5000 من لوحة تحكم Cloudflare Zero Trust.', 'Or route a custom subdomain (e.g. https://api.hrsup.com) to port 5000.')}
                </li>
                <li>
                  {t('ضع الرابط في خانة البوابة أعلاه واضغط "حفظ واختبار المزامنة". سيكتشف النظام القواعد الحقيقية فقط ويعرض كروتها تلقائياً.', 'Paste the HTTPS tunnel URL in the field above and click "Save & Sync". Only verified databases will be discovered and carded.')}
                </li>
              </ol>
            </div>
          )}
        </div>
      </div>

      {/* Segmented Control: Only Databases & SQL Console */}
      <div className="p-1 rounded-2xl bg-[#121B14] border border-[#243628] flex items-center gap-1 overflow-x-auto shadow-inner">
        <button
          onClick={() => setHubTab('databases')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            hubTab === 'databases'
              ? 'bg-[#EBB34D] text-[#0E1610] shadow-sm'
              : 'text-[#8FA392] hover:text-[#F3EFE6] hover:bg-[#17231A]'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>{t(`قواعد البيانات المتصلة (${databases.length})`, `Connected Databases (${databases.length})`)}</span>
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
      {/* TAB 1: Dynamic Databases Grid (Only verified discovered DBs) */}
      {/* =================================================================== */}
      {hubTab === 'databases' && (
        <div className="space-y-4">
          {/* Filter Bar: Search + Category Dropdown */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#121B14] p-3 rounded-xl border border-[#243628]">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-[#8FA392] absolute top-1/2 -translate-y-1/2 start-3" />
              <input
                type="text"
                value={dbSearch}
                onChange={e => setDbSearch(e.target.value)}
                placeholder={t(
                  'البحث باسم قاعدة البيانات أو الكيان أو الوصف...',
                  'Search database name, entity, or description...'
                )}
                className="w-full bg-[#17231A] border border-[#243628] rounded-lg ps-9 pe-3 py-2 text-xs text-[#F3EFE6] placeholder-[#8FA392] focus:outline-hidden focus:border-[#EBB34D]"
              />
            </div>
            <div className="w-full sm:w-auto flex items-center gap-2 shrink-0">
              <span className="text-xs text-[#8FA392] shrink-0 font-medium">
                {t('التصنيف:', 'Category:')}
              </span>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="bg-[#17231A] border border-[#243628] rounded-lg px-3 py-2 text-xs text-[#F3EFE6] focus:outline-hidden focus:border-[#EBB34D] cursor-pointer"
              >
                {categoryFilters.map(filter => (
                  <option key={filter.id} value={filter.id} className="bg-[#17231A] text-[#F3EFE6]">
                    {isRtl ? filter.labelAr : filter.labelEn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* If No Databases Discovered: Clean honest empty state (No fake cards) */}
          {filteredDatabases.length === 0 ? (
            <div className="p-12 rounded-2xl border border-dashed border-[#243628] bg-[#121B14] text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#17231A] text-[#EBB34D] border border-[#243628] flex items-center justify-center mx-auto shadow-md">
                <Database className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-[#F3EFE6]">
                  {t('لا توجد قواعد بيانات مكتشفة حالياً', 'No Discovered Databases Found')}
                </h3>
                <p className="text-xs text-[#8FA392] max-w-lg mx-auto leading-relaxed">
                  {t(
                    'لم يتم العثور على قواعد بيانات عبر الاتصال الحالي. لن يتم توليد أي كروت وهمية؛ تظهر الكروت ديناميكياً فقط لقواعد البيانات التي يتم اكتشافها فعلياً ومزامنتها بنجاح عبر السيرفر.',
                    'No databases discovered through the current connection. Synthetic dummy cards have been eliminated; cards are dynamically generated only for verified discovered databases on the server.'
                  )}
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => refresh()}
                  disabled={isContextLoading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#EBB34D] text-[#0E1610] text-xs font-black shadow-md hover:bg-[#D99B26] transition-all cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 ${isContextLoading ? 'animate-spin' : ''}`} />
                  <span>{t('فحص ومزامنة القواعد الحية', 'Scan & Sync Live Databases')}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Databases Cards Grid: Render ONLY discovered DBs */
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
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 2: Interactive Safe SQL Console */}
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
                      'استعلام مباشر وسريع على أي من القواعد المكتشفة مع حماية تامة لمنع أي تعديل أو مساس بالبيانات',
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
                  {databases.length === 0 ? (
                    <option value={activeDatabase}>{activeDatabase}</option>
                  ) : (
                    databases.map(db => (
                      <option key={db.name} value={db.name}>
                        {db.name} ({db.categoryNameAr})
                      </option>
                    ))
                  )}
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
