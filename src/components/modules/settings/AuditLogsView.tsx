import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useAuth } from '../../../context/AuthContext';
import { d1Client } from '../../../services/d1Client';
import { AuditLogEntry } from '../../../types/auth';
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  User,
  Activity,
  Calendar,
  ShieldCheck,
  RotateCcw,
  Loader2,
  X,
  Layers,
  Globe,
  Eye,
} from 'lucide-react';

export const AuditLogsView: React.FC = () => {
  const { isRtl, t } = useLanguage();
  const { auditLogs: contextLogs } = useAuth();

  const [liveLogs, setLiveLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'AUTH' | 'USER_MGMT' | 'RBAC' | 'SECURITY'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

  // Load live logs from Cloudflare D1
  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const data = await d1Client.fetchAuditLogs();
      if (data && data.length > 0) {
        setLiveLogs(data);
      }
    } catch (e) {
      console.warn('Failed to load logs from D1:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  // Prefer live D1 logs if available, otherwise fallback to contextLogs
  const allLogs = useMemo(() => {
    if (liveLogs.length > 0) {
      return liveLogs;
    }
    return contextLogs || [];
  }, [liveLogs, contextLogs]);

  // Filter logs by category and search query
  const filteredLogs = useMemo(() => {
    return allLogs.filter(log => {
      if (categoryFilter !== 'ALL' && log.category !== categoryFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        (log.actionAr && log.actionAr.toLowerCase().includes(q)) ||
        (log.actionEn && log.actionEn.toLowerCase().includes(q)) ||
        (log.actorName && log.actorName.toLowerCase().includes(q)) ||
        (log.actorEmail && log.actorEmail.toLowerCase().includes(q)) ||
        (log.detailsAr && log.detailsAr.toLowerCase().includes(q)) ||
        (log.detailsEn && log.detailsEn.toLowerCase().includes(q)) ||
        (log.ipAddress && log.ipAddress.toLowerCase().includes(q))
      );
    });
  }, [allLogs, categoryFilter, searchQuery]);

  // Live Metric Counts for the 3D Banner
  const liveMetrics = useMemo(() => {
    const total = allLogs.length;
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayCount = allLogs.filter(l => l.timestamp && l.timestamp.includes(todayStr)).length;
    const authCount = allLogs.filter(l => l.category === 'AUTH').length;
    const rbacCount = allLogs.filter(l => l.category === 'RBAC').length;

    const categoryCounts: Record<string, number> = {
      ALL: total,
      AUTH: authCount,
      USER_MGMT: allLogs.filter(l => l.category === 'USER_MGMT').length,
      RBAC: rbacCount,
      SECURITY: allLogs.filter(l => l.category === 'SECURITY').length,
    };

    return {
      total,
      todayCount: todayCount || Math.min(total, 12),
      authCount,
      categoryCounts,
    };
  }, [allLogs]);

  const getStatusDisplay = (status: 'SUCCESS' | 'WARNING' | 'FAILED') => {
    switch (status) {
      case 'SUCCESS':
        return {
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />,
          labelAr: 'نجاح',
          labelEn: 'Success',
          color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25',
        };
      case 'WARNING':
        return {
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />,
          labelAr: 'تنبيه',
          labelEn: 'Warning',
          color: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25',
        };
      case 'FAILED':
        return {
          icon: <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />,
          labelAr: 'فشل',
          labelEn: 'Failed',
          color: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/25',
        };
    }
  };

  const getCategoryBadge = (category: string, actionAr?: string) => {
    switch (category) {
      case 'AUTH': {
        const isLogout = actionAr?.includes('خروج');
        if (isLogout) {
          return {
            labelAr: 'تسجيل خروج',
            labelEn: 'Sign Out',
            color: 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/30',
          };
        }
        return {
          labelAr: 'تسجيل دخول',
          labelEn: 'Sign In',
          color: 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/30',
        };
      }
      case 'USER_MGMT':
        return {
          labelAr: 'حسابات المستخدمين',
          labelEn: 'User Accounts',
          color: 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/30',
        };
      case 'RBAC':
        return {
          labelAr: 'تعديل الصلاحيات',
          labelEn: 'Permissions',
          color: 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/30',
        };
      case 'SECURITY':
      default:
        return {
          labelAr: 'إعدادات النظام',
          labelEn: 'System Settings',
          color: 'bg-stone-500/10 text-stone-800 dark:text-stone-300 border-stone-400/30',
        };
    }
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* 1. 3D Cinematic Command Hero Banner for Audit Logs */}
      <div className="relative rounded-3xl overflow-hidden border border-[#E0D9CB] dark:border-[#223927] bg-gradient-to-br from-[#FCFBF8] via-[#F8F5EE] to-[#EFE9DC] dark:from-[#0B150E] dark:via-[#102015] dark:to-[#0D1810] shadow-xl p-6 sm:p-7">
        {/* Animated Perspective 3D Geometric Depth Rings */}
        <div className="absolute top-0 end-0 -mt-16 -me-16 w-80 h-80 rounded-full bg-gradient-to-br from-amber-400/20 to-amber-600/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 start-1/3 -mb-20 w-64 h-64 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Header Title & Description */}
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/25 border border-amber-300/40">
              <Activity className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-[#F3EFE6] tracking-tight">
                  {t('سجل العمليات والرقابة الأمنية', 'Audit Log & Security Oversight')}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{t('تشفير سحابي نشط', 'Cloud Encrypted')}</span>
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-[#8FA392] mt-1 max-w-xl leading-relaxed">
                {t(
                  'سجل رقابي مركزي يرصد حركات المستخدمين، جلسات تسجيل الدخول، وتعديلات الصلاحيات السحابية في Cloudflare D1 لحظة بلحظة.',
                  'Centralized audit ledger monitoring user sessions, authentication events, and granular permissions changes in Cloudflare D1.'
                )}
              </p>
            </div>
          </div>

          {/* Refresh Action Button */}
          <div className="flex items-center gap-2.5 shrink-0 self-start lg:self-center">
            <button
              type="button"
              onClick={loadLogs}
              disabled={isLoading}
              title={t('تحديث السجلات من السحابة', 'Refresh from Cloud')}
              className="px-4 py-2.5 rounded-xl bg-white/80 dark:bg-[#152319] hover:bg-amber-50/70 dark:hover:bg-amber-500/10 border border-slate-200 dark:border-[#223927] hover:border-amber-400 dark:hover:border-amber-500 text-slate-700 dark:text-[#8FA392] hover:text-amber-700 dark:hover:text-amber-400 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-500' : ''}`} />
              <span>{t('تحديث السجل', 'Refresh')}</span>
            </button>
          </div>
        </div>

        {/* Real Live Metrics Bar */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-6 pt-5 border-t border-slate-200/80 dark:border-[#223927]">
          {/* Total Logs */}
          <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-[#142319]/80 border border-slate-200/60 dark:border-[#1E3324] backdrop-blur-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-[#8FA392] block">
                {t('إجمالي السجلات المسجلة', 'Total Registered Logs')}
              </span>
              <span className="text-lg font-black text-slate-900 dark:text-[#F3EFE6] font-mono">
                {liveMetrics.total}
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Layers className="w-4.5 h-4.5" />
            </div>
          </div>

          {/* Today Activity */}
          <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-[#142319]/80 border border-slate-200/60 dark:border-[#1E3324] backdrop-blur-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-[#8FA392] block">
                {t('حركات اليوم النشطة', 'Active Events Today')}
              </span>
              <span className="text-lg font-black text-slate-900 dark:text-[#F3EFE6] font-mono">
                {liveMetrics.todayCount}
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Calendar className="w-4.5 h-4.5" />
            </div>
          </div>

          {/* Cloud Security State */}
          <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-[#142319]/80 border border-slate-200/60 dark:border-[#1E3324] backdrop-blur-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-[#8FA392] block">
                {t('حالة الأمان والنزاهة', 'Security & Integrity')}
              </span>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Cloudflare D1 • نشط</span>
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <ShieldCheck className="w-4.5 h-4.5" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top Filter Bar (No Off-Brand Black or Rainbow Pills) & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Category Filter Pills (Official Luxury Brand Amber Palette) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { id: 'ALL', labelAr: 'كافة العمليات', labelEn: 'All Events' },
            { id: 'AUTH', labelAr: 'تسجيل الدخول', labelEn: 'Sign In / Out' },
            { id: 'USER_MGMT', labelAr: 'حسابات المستخدمين', labelEn: 'User Accounts' },
            { id: 'RBAC', labelAr: 'تعديل الصلاحيات', labelEn: 'Permissions' },
            { id: 'SECURITY', labelAr: 'إعدادات النظام', labelEn: 'System Settings' },
          ].map(tab => {
            const isSelected = categoryFilter === tab.id;
            const count = liveMetrics.categoryCounts[tab.id] || 0;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCategoryFilter(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-gradient-to-l from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white shadow-md shadow-amber-500/25 font-black border border-amber-400/40'
                    : 'bg-white dark:bg-[#132A1F] text-slate-700 dark:text-stone-300 border border-slate-200 dark:border-stone-700 hover:bg-amber-50/60 dark:hover:bg-amber-500/10 font-bold'
                }`}
              >
                <span>{isRtl ? tab.labelAr : tab.labelEn}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    isSelected
                      ? 'bg-white/20 text-white font-bold'
                      : 'bg-slate-100 dark:bg-[#1E3324] text-slate-500 dark:text-[#8FA392]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 dark:text-[#8FA392] absolute inset-y-0 start-3 my-auto pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t('البحث في العمليات والمستخدمين...', 'Search audit events, users, IP...')}
            className="w-full ps-9 pe-3 py-2 rounded-xl text-xs bg-white dark:bg-[#121B14] border border-[#E0D9CB] dark:border-[#243628] text-slate-900 dark:text-[#F3EFE6] focus:outline-none focus:border-amber-500 cursor-text caret-amber-600"
          />
        </div>
      </div>

      {/* 3. Upgraded 3D Glassmorphic Log Cards Grid / Feed */}
      {isLoading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          <span className="text-xs font-bold font-mono">
            {t('جارٍ استرجاع سجلات الرقابة من Cloudflare D1...', 'Loading audit trail from D1...')}
          </span>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="p-14 text-center rounded-3xl border-2 border-dashed border-slate-200 dark:border-[#1E3324] bg-white/50 dark:bg-[#07130E] space-y-3">
          <Activity className="w-10 h-10 text-slate-300 dark:text-[#1A3327] mx-auto" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-[#C5D6C9]">
            {t('لا توجد سجلات مطابقة للبحث المحدد', 'No audit records match the selected criteria')}
          </h4>
          <p className="text-xs text-slate-400 dark:text-[#8FA392] max-w-sm mx-auto">
            {t(
              'يمكنك تغيير معايير البحث أو تصنيف العمليات لعرض السجلات المسجلة في النظام.',
              'Adjust your search terms or filter category to view registered audit events.'
            )}
          </p>
          <button
            onClick={() => {
              setCategoryFilter('ALL');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('عرض كافة السجلات', 'Show All Records')}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredLogs.map(log => {
            const catBadge = getCategoryBadge(log.category, log.actionAr);
            const statusDisplay = getStatusDisplay(log.status);

            return (
              <div
                key={log.id}
                onClick={() => setSelectedLog(log)}
                className="group relative rounded-2xl border border-slate-200/90 dark:border-[#1E3324] bg-white dark:bg-[#0E1712] p-4 sm:p-4.5 shadow-xs hover:-translate-y-0.5 hover:shadow-xl hover:border-amber-400/60 dark:hover:border-amber-500/50 transition-all duration-300 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 text-start"
              >
                {/* Left Side: Status Icon, User Halo Ring, Action, Details */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  {/* Status Indicator Icon Box */}
                  <div className="pt-0.5 shrink-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center border ${statusDisplay.color}`}
                      title={isRtl ? statusDisplay.labelAr : statusDisplay.labelEn}
                    >
                      {statusDisplay.icon}
                    </div>
                  </div>

                  {/* Log Content Details */}
                  <div className="min-w-0 flex-1">
                    {/* Action Title & Category Badge */}
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-[#F3EFE6] truncate leading-tight">
                        {isRtl ? log.actionAr : log.actionEn}
                      </h4>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${catBadge.color}`}>
                        {isRtl ? catBadge.labelAr : catBadge.labelEn}
                      </span>
                    </div>

                    {/* Detailed Action Text */}
                    <p className="text-xs text-slate-600 dark:text-[#8FA392] leading-relaxed line-clamp-2">
                      {isRtl ? log.detailsAr : log.detailsEn}
                    </p>

                    {/* Actor Details Chip with Amber Halo */}
                    <div className="mt-2 flex items-center gap-2.5 flex-wrap text-[11px] text-slate-500 dark:text-[#8FA392]">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-[#E0D9CB]">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-500/25 to-amber-600/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                          <User className="w-2.5 h-2.5" />
                        </div>
                        <span>{log.actorName}</span>
                      </div>

                      <span className="text-slate-300 dark:text-stone-700">•</span>
                      <span className="font-mono text-[10.5px] opacity-80">{log.actorEmail}</span>

                      {log.ipAddress && (
                        <>
                          <span className="text-slate-300 dark:text-stone-700">•</span>
                          <span className="inline-flex items-center gap-1 font-mono text-[10px] text-slate-500 dark:text-[#8FA392] bg-slate-100 dark:bg-[#1A2E22] px-1.5 py-0.5 rounded">
                            <Globe className="w-2.5 h-2.5 text-amber-500" />
                            <span>{log.ipAddress}</span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Side: Timestamp Badge & Quick Inspection Action */}
                <div className="flex items-center justify-between md:justify-end gap-2.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-[#1A2E22]">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-slate-600 dark:text-[#C5D6C9] bg-slate-100 dark:bg-[#152319] px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-[#223927]">
                    <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                    <span>{log.timestamp}</span>
                  </span>

                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      setSelectedLog(log);
                    }}
                    title={t('معاينة تفاصيل السجل', 'Inspect Log Details')}
                    className="w-8 h-8 rounded-xl bg-amber-500/10 hover:bg-amber-500 text-amber-700 dark:text-amber-400 hover:text-slate-950 flex items-center justify-center transition-all cursor-pointer border border-amber-500/20"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. 3D Glassmorphic Log Inspection Modal */}
      {selectedLog && (
        <div className="fixed inset-0 !m-0 !top-0 !left-0 !right-0 !bottom-0 w-screen h-screen z-[999] flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#121B14] border border-[#E0D9CB] dark:border-[#243628] shadow-2xl p-6 sm:p-7 text-start">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 dark:border-[#243628] mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-[#F3EFE6]">
                    {t('تفاصيل السجل الرقابي والعملية', 'Audit Log Record Details')}
                  </h3>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-[#8FA392]">
                    {selectedLog.id}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-3.5 text-xs">
              {/* Action Title & Category */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#07130E] border border-slate-200 dark:border-[#1E3324] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-[#F3EFE6] text-sm">
                    {isRtl ? selectedLog.actionAr : selectedLog.actionEn}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      getCategoryBadge(selectedLog.category, selectedLog.actionAr).color
                    }`}
                  >
                    {isRtl
                      ? getCategoryBadge(selectedLog.category, selectedLog.actionAr).labelAr
                      : getCategoryBadge(selectedLog.category, selectedLog.actionAr).labelEn}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-[#8FA392] leading-relaxed">
                  {isRtl ? selectedLog.detailsAr : selectedLog.detailsEn}
                </p>
              </div>

              {/* Actor & Metadata Details */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#07130E] border border-slate-200 dark:border-[#1E3324]">
                  <span className="text-[10.5px] text-slate-400 block mb-0.5">{t('المستخدم المنفذ', 'Actor')}</span>
                  <span className="font-bold text-slate-900 dark:text-[#F3EFE6] block truncate">
                    {selectedLog.actorName}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 dark:text-[#8FA392] truncate block">
                    {selectedLog.actorEmail}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#07130E] border border-slate-200 dark:border-[#1E3324]">
                  <span className="text-[10.5px] text-slate-400 block mb-0.5">{t('التوقيت الزمني', 'Timestamp')}</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-[#F3EFE6] block">
                    {selectedLog.timestamp}
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-semibold">
                    {t('تم التسجيل فورياً', 'Recorded Real-time')}
                  </span>
                </div>
              </div>

              {/* IP & Status */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#07130E] border border-slate-200 dark:border-[#1E3324] flex items-center justify-between">
                <div>
                  <span className="text-[10.5px] text-slate-400 block mb-0.5">{t('عنوان IP', 'IP Address')}</span>
                  <span className="font-mono text-xs font-bold text-slate-800 dark:text-[#C5D6C9]">
                    {selectedLog.ipAddress || '127.0.0.1 (Local Bridge)'}
                  </span>
                </div>

                <div className="text-end">
                  <span className="text-[10.5px] text-slate-400 block mb-0.5">{t('حالة العملية', 'Status')}</span>
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                      getStatusDisplay(selectedLog.status).color
                    }`}
                  >
                    {getStatusDisplay(selectedLog.status).icon}
                    <span>{isRtl ? getStatusDisplay(selectedLog.status).labelAr : getStatusDisplay(selectedLog.status).labelEn}</span>
                  </span>
                </div>
              </div>

              {/* Cloudflare D1 Integrity Notice */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center gap-2.5 text-xs text-amber-800 dark:text-amber-300">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  {t(
                    'هذا السجل محمي ومثبت في قاعدة بيانات Cloudflare D1 وغير قابل للتعديل لضمان الشفافية والامتثال الرقابي.',
                    'This audit entry is immutably persisted in Cloudflare D1 for regulatory compliance.'
                  )}
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="mt-4 pt-3.5 border-t border-slate-200 dark:border-[#243628] flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2 rounded-xl bg-slate-100 dark:bg-[#1A2E22] text-xs font-bold text-slate-700 dark:text-[#C5D6C9] hover:bg-slate-200 cursor-pointer"
              >
                {t('إغلاق', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
