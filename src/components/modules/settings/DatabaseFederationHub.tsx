import React, { useState, useEffect, useMemo } from 'react';
import { useDatabase } from '../../../services/federation/DatabaseContext';
import { useLanguage } from '../../../context/LanguageContext';
import { federationService } from '../../../services/federation/federationService';
import { getApiBaseUrl, setApiBaseUrl } from '../../../services/apiClient';
import { FederatedQueryResult, DatabaseFleetItem, DatabaseCategory } from '../../../services/federation/types';
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
  Info,
  Server,
  Save,
  SlidersHorizontal
} from 'lucide-react';
import { toast } from '../../common/Toast';
import {
  getNetworkConfigSync,
  fetchNetworkConfig,
  saveNetworkConfig,
} from '../../../services/settings/networkConfigService';

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

  // Dynamic SQL Server & Network configuration state
  const [sqlHost, setSqlHost] = useState<string>(() => {
    return localStorage.getItem('eco_sql_host') || '100.68.121.85';
  });
  const [sqlPort, setSqlPort] = useState<string>(() => String(getNetworkConfigSync().sql_server_port));
  const [portProxyTarget, setPortProxyTarget] = useState<string>(() => getNetworkConfigSync().local_portproxy_target);
  const [isConfigEditing, setIsConfigEditing] = useState<boolean>(true);
  const [isSavingConfig, setIsSavingConfig] = useState<boolean>(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Ping test state
  const [isPinging, setIsPinging] = useState(false);
  const [lastPingTime, setLastPingTime] = useState<number | null>(null);

  // Dynamic SQL Discovery & Database Synchronization state
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [discoveredDatabases, setDiscoveredDatabases] = useState<any[]>([]);
  const [syncDiagnosticError, setSyncDiagnosticError] = useState<{
    message: string;
    targetUrl: string;
    isTunnelOffline: boolean;
    localBridgeAvailable: boolean;
  } | null>(null);

  // Safe Query Console state
  const [consoleDb, setConsoleDb] = useState<string>(activeDatabase || 'Tarabot_Data_2026');
  const [sqlQuery, setSqlQuery] = useState<string>(
    'SELECT TOP 15 Level5_ID, Level5_Name_A, Level4_ID FROM Level5_View ORDER BY Level5_ID ASC;'
  );
  const [queryResult, setQueryResult] = useState<FederatedQueryResult | null>(null);
  const [isExecutingQuery, setIsExecutingQuery] = useState(false);
  const [queryError, setQueryError] = useState<string | null>(null);

  // Unified Live SQL Database Synchronization Function with Diagnostic Resilience
  const handleSyncDatabases = async (forceLocal = false) => {
    setIsSyncing(true);
    setSyncDiagnosticError(null);
    try {
      const activeGateway = forceLocal ? 'http://localhost:5000' : (bridgeUrlInput || getApiBaseUrl() || '').trim();
      const targetUrl = activeGateway.replace(/\/+$/, '');
      const queryParam = `host=${encodeURIComponent(sqlHost.trim())}&port=${encodeURIComponent(sqlPort.trim())}`;
      const url = targetUrl ? `${targetUrl}/api/system/databases?${queryParam}` : `/api/system/databases?${queryParam}`;

      let res: Response | null = null;
      try {
        res = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'X-Sql-Server-Host': sqlHost.trim(),
            'X-Sql-Server-Port': sqlPort.trim()
          }
        });
      } catch (fetchErr: any) {
        console.warn('[SQL Hub] Primary gateway fetch failed:', fetchErr.message);

        // Probe local bridge on localhost:5000
        let isLocalAlive = false;
        try {
          const localCheck = await fetch('http://localhost:5000/api/system/health', { method: 'GET' });
          isLocalAlive = localCheck.ok;
        } catch (_) {}

        setSyncDiagnosticError({
          message: fetchErr.message || 'Failed to fetch',
          targetUrl: targetUrl || window.location.origin,
          isTunnelOffline: targetUrl.includes('hrsup.com') || targetUrl.includes('cloudflare'),
          localBridgeAvailable: isLocalAlive
        });

        toast.error(
          isLocalAlive
            ? t('تعذر الاتصال بالبوابة الخارجية (النفق متوقف). السيرفر المحلي متاح على localhost:5000!', 'Gateway unreachable. Local bridge is active on localhost:5000!')
            : t(`تعذر فحص القواعد: سيرفر الربط المحلي غير متصل أو النفق متوقف`, `Failed to scan databases: Local bridge is offline or tunnel stopped`)
        );
        return;
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${res.status}: فشل في استرجاع القواعد`);
      }

      const data = await res.json();
      if (data.success && Array.isArray(data.databases)) {
        setDiscoveredDatabases(data.databases);
        setSyncDiagnosticError(null);
        toast.success(`تم اكتشاف ومزامنة ${data.databases.length} قاعدة بيانات حقيقية بنجاح`);
      } else {
        throw new Error(data.error || 'فشل في استرجاع القواعد');
      }
    } catch (err: any) {
      console.error('Sync failed:', err);
      toast.error(`تعذر فحص القواعد: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // Sync settings from Cloudflare D1 or local backend on load
  useEffect(() => {
    fetchNetworkConfig().then(cfg => {
      if (cfg) {
        const storedHost = localStorage.getItem('eco_sql_host');
        if (!storedHost) {
          setSqlHost(cfg.sql_server_host || '100.68.121.85');
        }
        setSqlPort(String(cfg.sql_server_port || 1433));
        setPortProxyTarget(cfg.local_portproxy_target || '192.168.1.50:49748');
        if (cfg.gateway_url) {
          setBridgeUrlInput(cfg.gateway_url);
        }
      }
    });
  }, []);

  // Save Network Settings to Cloudflare D1, localStorage, and SQL Bridge
  const handleSaveNetworkSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingConfig(true);
    setSaveSuccessMessage(null);
    try {
      localStorage.setItem('eco_sql_host', sqlHost.trim());
      const portNumber = parseInt(sqlPort, 10) || 1433;
      await saveNetworkConfig({
        sql_server_host: sqlHost.trim(),
        sql_server_port: portNumber,
        local_portproxy_target: portProxyTarget.trim(),
        gateway_url: bridgeUrlInput.trim(),
      });
      setApiBaseUrl(bridgeUrlInput.trim());
      setSaveSuccessMessage(t('تم حفظ إعدادات الاتصال وتطبيقها فورياً بنجاح!', 'Connection settings saved & applied dynamically!'));
      setTimeout(() => setSaveSuccessMessage(null), 4000);
      await refresh();
      await handleSyncDatabases();
      await handlePing();
    } catch (err: any) {
      console.error('Failed to save network configuration:', err);
    } finally {
      setIsSavingConfig(false);
    }
  };

  // Ping Handler
  const handlePing = async () => {
    setIsPinging(true);
    try {
      await saveNetworkConfig({
        sql_server_host: sqlHost.trim(),
        sql_server_port: parseInt(sqlPort, 10) || 1433,
        local_portproxy_target: portProxyTarget.trim(),
        gateway_url: bridgeUrlInput.trim(),
      });
      const latency = await pingConnection();
      setLastPingTime(latency);
    } finally {
      setIsPinging(false);
    }
  };

  // Save Bridge URL & Refresh
  const handleSaveBridgeUrl = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingUrl(true);
    try {
      await handleSaveNetworkSettings();
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

  // Auto-sync databases on mount
  useEffect(() => {
    handleSyncDatabases();
  }, []);

  // Map discovered SQL Server databases or fallback to context fleet
  const effectiveDatabases = useMemo<DatabaseFleetItem[]>(() => {
    if (discoveredDatabases.length > 0) {
      return discoveredDatabases.map(d => {
        const name = String(d.databaseName || d.name || d.id || '');
        const rawCat = String(d.category || '').toLowerCase();
        let category: DatabaseCategory = 'primary';
        if (rawCat.includes('payroll') || rawCat.includes('hr') || rawCat.includes('salary')) {
          category = 'specialized_payroll';
        } else if (rawCat.includes('archive')) {
          category = 'archives';
        } else if (rawCat.includes('project') || rawCat.includes('engineer')) {
          category = 'engineering_archive';
        } else if (rawCat.includes('partner')) {
          category = 'partners';
        } else if (rawCat.includes('sandbox') || rawCat.includes('test')) {
          category = 'sandbox';
        } else {
          category = 'primary';
        }

        const isOnline = d.state === 0 || d.state === 'ONLINE' || d.status === 'ONLINE' || !String(d.state || d.status || '').toUpperCase().includes('OFFLINE');
        const isPrimary = Boolean(d.isPrimary || category === 'primary' || name.includes('2026') || name.includes('MK_Khalil'));

        const realSize = Number(d.sizeMB ?? d.sizeMb ?? 0);
        return {
          name: name,
          displayNameAr: d.displayNameAr || name,
          displayNameEn: d.displayNameEn || name,
          category: category,
          categoryNameAr: d.categoryNameAr || (category === 'specialized_payroll' ? 'الرواتب والأجور' : category === 'archives' ? 'أرشيف محاسبي' : 'المنظومة النشطة'),
          categoryNameEn: d.categoryNameEn || (category === 'specialized_payroll' ? 'Payroll' : category === 'archives' ? 'Archives' : 'Active'),
          categoryIcon: 'Database',
          isPrimary: isPrimary,
          createDate: String(d.createdDate || d.createDate || d.create_date || new Date().toISOString().split('T')[0]),
          status: isOnline ? 'ONLINE' : 'OFFLINE',
          sizeMb: realSize,
          sizeMB: realSize,
          descriptionAr: d.descriptionAr || `قاعدة بيانات مسجلة في SQL Server (${d.category || 'Active'}) - الحالة: ${d.dbStatus || d.state || 'ONLINE'}`,
        };
      });
    }
    return databases;
  }, [discoveredDatabases, databases]);

  // Filtered databases (Dynamically discovered only)
  const filteredDatabases = useMemo(() => {
    let list = effectiveDatabases;
    if (selectedCategory !== 'ALL') {
      list = list.filter(d => {
        const cat = (d.category || '').toLowerCase();
        const sel = selectedCategory.toLowerCase();
        if (sel === 'primary' || sel === 'active') return cat === 'active' || cat === 'primary';
        if (sel === 'archives' || sel === 'archive') return cat === 'archive' || cat === 'archives';
        if (sel === 'specialized_payroll' || sel === 'payroll') return cat === 'payroll' || cat === 'specialized_payroll';
        return cat === sel;
      });
    }
    if (dbSearch.trim()) {
      const term = dbSearch.toLowerCase();
      list = list.filter(
        d =>
          (d.name && d.name.toLowerCase().includes(term)) ||
          (d.displayNameAr && d.displayNameAr.toLowerCase().includes(term)) ||
          (d.displayNameEn && d.displayNameEn.toLowerCase().includes(term)) ||
          (d.descriptionAr && d.descriptionAr.toLowerCase().includes(term))
      );
    }
    return list;
  }, [effectiveDatabases, selectedCategory, dbSearch]);

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

          {/* Quick Actions & Dynamic Configuration Bar */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Save Configuration Action Button */}
            <button
              type="button"
              onClick={handleSaveNetworkSettings}
              disabled={isSavingConfig || isContextLoading}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl border border-[#5C431D] bg-[#2A1F0E] hover:bg-[#3D2D14] text-[#EBB34D] transition-all cursor-pointer shadow-xs disabled:opacity-50"
              title={t('حفظ إعدادات الاتصال إلى D1 والتطبيق فورياً', 'Save Network Config to D1 & Apply Immediately')}
            >
              <Save className={`w-3.5 h-3.5 ${isSavingConfig ? 'animate-spin' : ''}`} />
              <span>{isSavingConfig ? t('جاري الحفظ...', 'Saving...') : t('حفظ إعدادات الاتصال', 'Save Configuration')}</span>
            </button>

            {/* Toggle Inline Edit / Display Mode */}
            <button
              type="button"
              onClick={() => setIsConfigEditing(prev => !prev)}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer shadow-xs ${
                isConfigEditing
                  ? 'border-[#3E5C46] bg-[#17231A] text-[#A3CFAC] hover:bg-[#1F2E23]'
                  : 'border-[#243628] bg-[#121B14] text-[#8FA392] hover:text-[#F3EFE6]'
              }`}
              title={t('التبديل بين التعديل المباشر ونمط العرض', 'Toggle between inline editing and display view')}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{isConfigEditing ? t('نمط التعديل النشط', 'Editing Mode') : t('تعديل الإعدادات', 'Edit Settings')}</span>
            </button>

            {/* Ping Tunnel Button */}
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

            {/* Refresh and Sync Databases */}
            <button
              onClick={() => handleSyncDatabases(false)}
              disabled={isSyncing}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl border border-[#243628] bg-[#17231A] hover:bg-[#1F2E23] text-[#F3EFE6] transition-all cursor-pointer shadow-xs disabled:opacity-50"
              title={t('تحديث ومزامنة القواعد الحية من خادم SQL Server', 'Sync & Refresh Databases from SQL Server')}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#EBB34D]' : ''}`} />
              <span>{isSyncing ? t('جاري المزامنة...', 'Syncing...') : t('تحديث ومزامنة القواعد', 'Sync & Refresh Databases')}</span>
            </button>
          </div>
        </div>

        {/* Dynamic Save Notification Banner */}
        {saveSuccessMessage && (
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#0E1610] border border-[#3E5C46] text-[#A3CFAC] text-xs font-bold shadow-md animate-in fade-in duration-150">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{saveSuccessMessage}</span>
          </div>
        )}

        {/* =================================================================== */}
        {/* Dynamic Editable Network Configuration Cards (High-Contrast Luxury Dark) */}
        {/* =================================================================== */}
        <div className="pt-4 border-t border-[#243628] grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* 1. خادم SQL Server (Tailscale Node) */}
          <div className="p-3.5 rounded-xl bg-[#0E1610] border border-[#243628] hover:border-[#5C431D] focus-within:border-[#EBB34D] transition-all shadow-sm space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#2A1F0E] text-[#EBB34D] border border-[#5C431D] flex items-center justify-center">
                  <Server className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#F3EFE6] block">
                    {t('خادم SQL Server (Tailscale Node)', 'SQL Server (Tailscale Node)')}
                  </span>
                  <span className="text-[10px] text-[#8FA392]">
                    {t('عنوان IP أو الدومين عبر نفق Tailscale', 'IP address or domain across Tailscale mesh')}
                  </span>
                </div>
              </div>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-[#17231A] text-[#EBB34D] border border-[#5C431D]">
                MS SQL: {health?.port || sqlPort}
              </span>
            </div>

            {isConfigEditing ? (
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-medium text-[#8FA392] block">
                    {t('العنوان / Host (Tailscale IP)', 'Host / Tailscale IP')}
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={sqlHost}
                    onChange={e => {
                      const val = e.target.value;
                      setSqlHost(val);
                      localStorage.setItem('eco_sql_host', val.trim());
                    }}
                    placeholder="100.68.121.85"
                    className="w-full bg-[#17231A] border border-[#243628] rounded-lg px-2.5 py-1.5 text-xs text-[#EBB34D] placeholder-[#5C431D] focus:outline-hidden focus:border-[#EBB34D] font-mono font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-[#8FA392] block">
                    {t('المنفذ / Port', 'Port')}
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={sqlPort}
                    onChange={e => setSqlPort(e.target.value)}
                    placeholder="1433"
                    className="w-full bg-[#17231A] border border-[#243628] rounded-lg px-2.5 py-1.5 text-xs text-[#EBB34D] placeholder-[#5C431D] focus:outline-hidden focus:border-[#EBB34D] font-mono font-bold text-center"
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#17231A] border border-[#243628] mt-1">
                <span className="font-mono text-xs font-bold text-[#EBB34D]" dir="ltr">
                  {sqlHost}:{sqlPort}
                </span>
                <button
                  type="button"
                  onClick={() => setIsConfigEditing(true)}
                  className="text-[10px] text-[#8FA392] hover:text-[#EBB34D] underline cursor-pointer"
                >
                  {t('تعديل الإعدادات', 'Edit')}
                </button>
              </div>
            )}
          </div>

          {/* 2. الهدف المحلي (PortProxy Target) */}
          <div className="p-3.5 rounded-xl bg-[#0E1610] border border-[#243628] hover:border-[#3E5C46] focus-within:border-[#A3CFAC] transition-all shadow-sm space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#17231A] text-[#A3CFAC] border border-[#3E5C46] flex items-center justify-center">
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#F3EFE6] block">
                    {t('الهدف المحلي (PortProxy Target)', 'Local PortProxy Target')}
                  </span>
                  <span className="text-[10px] text-[#8FA392]">
                    {t('عنوان الخادم المحلي مع البورت الموجه', 'Internal host & portproxy forwarded destination')}
                  </span>
                </div>
              </div>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-[#17231A] text-[#A3CFAC] border border-[#3E5C46]">
                PortProxy Forward
              </span>
            </div>

            {isConfigEditing ? (
              <div className="space-y-1 pt-1">
                <label className="text-[10px] font-medium text-[#8FA392] block">
                  {t('عنوان وبورت الهدف المحلي (Host:Port)', 'Local Host:Port Destination')}
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={portProxyTarget}
                  onChange={e => setPortProxyTarget(e.target.value)}
                  placeholder="192.168.1.50:49748"
                  className="w-full bg-[#17231A] border border-[#243628] rounded-lg px-2.5 py-1.5 text-xs text-[#F3EFE6] placeholder-[#3E5C46] focus:outline-hidden focus:border-[#A3CFAC] font-mono font-bold"
                />
              </div>
            ) : (
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#17231A] border border-[#243628] mt-1">
                <span className="font-mono text-xs font-bold text-[#F3EFE6]" dir="ltr">
                  {portProxyTarget}
                </span>
                <button
                  type="button"
                  onClick={() => setIsConfigEditing(true)}
                  className="text-[10px] text-[#8FA392] hover:text-[#A3CFAC] underline cursor-pointer"
                >
                  {t('تعديل الإعدادات', 'Edit')}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Real-time Health Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
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
                  placeholder="https://datatest.hrsup.com (الافتراضي للإنتاج) أو http://localhost:5000"
                  className="w-full bg-[#121B14] border border-[#243628] rounded-lg px-3 py-1.5 text-xs text-[#F3EFE6] placeholder-[#8FA392] focus:outline-hidden focus:border-[#EBB34D] font-mono"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="submit"
                disabled={isSavingUrl || isSavingConfig || isContextLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#EBB34D] hover:bg-[#D99B26] text-[#0E1610] text-xs font-black transition-all cursor-pointer shadow-xs disabled:opacity-50"
              >
                <Link className={`w-3.5 h-3.5 ${isSavingUrl || isSavingConfig ? 'animate-spin' : ''}`} />
                <span>{isSavingUrl || isSavingConfig ? t('جاري الحفظ والمزامنة...', 'Saving & Syncing...') : t('حفظ واختبار المزامنة', 'Save & Sync')}</span>
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
                  {t('النفق الدائم المعتمد للمنظومة هو https://datatest.hrsup.com مربوط بنفق eco-data-bridge ويوجه للبورت 5000 تلقائياً بشهادة SSL كاملة.', 'The permanent enterprise tunnel is https://datatest.hrsup.com bound to eco-data-bridge routing to port 5000 with full SSL.')}
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
          <span>{t(`قواعد البيانات المتصلة (${effectiveDatabases.length})`, `Connected Databases (${effectiveDatabases.length})`)}</span>
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
          {/* Detailed Diagnostic Guidance Alert on Fetch Failure */}
          {syncDiagnosticError && (
            <div className="p-4 rounded-2xl border border-[#5A2E2E] bg-[#221010] text-[#F3EFE6] space-y-3 animate-in fade-in duration-200 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#3A1818] text-[#F5A3A3] border border-[#5A2E2E] flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#3A1818] text-[#F5A3A3] border border-[#5A2E2E]">
                        {t('سيرفر الربط المحلي غير متصل أو النفق متوقف', 'Local Bridge Disconnected or Tunnel Stopped')}
                      </span>
                      <span className="text-xs font-bold text-[#F3EFE6]">
                        {syncDiagnosticError.isTunnelOffline ? t('بوابة Cloudflare Tunnel غير مستجيبة', 'Cloudflare Tunnel Gateway Unreachable') : t('فشل الاتصال بالبوابة', 'Gateway Connection Failure')}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#A3928F] mt-0.5">
                      {t(
                        `تعذر الوصول إلى البوابة (${syncDiagnosticError.targetUrl}). سبب الخطأ: ${syncDiagnosticError.message}`,
                        `Could not reach gateway (${syncDiagnosticError.targetUrl}). Error: ${syncDiagnosticError.message}`
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {syncDiagnosticError.localBridgeAvailable ? (
                    <button
                      type="button"
                      onClick={() => {
                        setBridgeUrlInput('http://localhost:5000');
                        setApiBaseUrl('http://localhost:5000');
                        handleSyncDatabases(true);
                      }}
                      className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#EBB34D] text-[#0E1610] text-xs font-black shadow hover:bg-[#D99B26] transition-all cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>{t('فحص مباشر عبر localhost:5000', 'Direct Sync via localhost:5000')}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSyncDatabases(false)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#5C431D] bg-[#2A1F0E] text-[#EBB34D] text-xs font-bold hover:bg-[#3D2D14] transition-all cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>{t('إعادة المحاولة', 'Retry')}</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="text-[11px] text-[#8FA392] bg-[#121B14] p-2.5 rounded-xl border border-[#243628] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Info className="w-3.5 h-3.5 text-[#EBB34D] shrink-0" />
                  <span>
                    {syncDiagnosticError.localBridgeAvailable
                      ? t('تم التحقق: خادم الربط المحلي شغال ومستجيب على http://localhost:5000. اضغط الزر أعلاه للتحويل المباشر دون الحاجة لنفق Cloudflare.', 'Verified: Local bridge is active on http://localhost:5000. Click above to switch directly without Cloudflare tunnel.')
                      : t('لتشغيل الربط: شغل node server/sqlBridge.cjs، وللربط الخارجي شغل نفق cloudflared tunnel run eco-data-bridge.', 'To activate bridge: run `node server/sqlBridge.cjs`, or run `cloudflared tunnel run eco-data-bridge` for remote tunnel.')}
                  </span>
                </div>
              </div>
            </div>
          )}

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
                  onClick={() => handleSyncDatabases(false)}
                  disabled={isSyncing}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#EBB34D] text-[#0E1610] text-xs font-black shadow-md hover:bg-[#D99B26] transition-all cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? t('جاري الفحص المباشر...', 'Scanning...') : t('فحص ومزامنة القواعد الحية', 'Scan & Sync Live Databases')}</span>
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
                          <span className="font-bold text-[#EBB34D]">
                            {db.sizeMB ? `${db.sizeMB} MB` : (db.sizeMb ? `${db.sizeMb} MB` : 'غير محدد')}
                          </span>
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
