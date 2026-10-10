import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useAuth } from '../../../context/AuthContext';
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  User,
  Activity
} from 'lucide-react';

export const AuditLogsView: React.FC = () => {
  const { isRtl, t } = useLanguage();
  const { auditLogs } = useAuth();

  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'AUTH' | 'USER_MGMT' | 'RBAC' | 'SECURITY'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = auditLogs.filter(log => {
    if (categoryFilter !== 'ALL' && log.category !== categoryFilter) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      log.actionAr.toLowerCase().includes(q) ||
      log.actionEn.toLowerCase().includes(q) ||
      log.actorName.toLowerCase().includes(q) ||
      log.actorEmail.toLowerCase().includes(q) ||
      log.detailsAr.toLowerCase().includes(q) ||
      log.detailsEn.toLowerCase().includes(q)
    );
  });

  const getStatusIcon = (status: 'SUCCESS' | 'WARNING' | 'FAILED') => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
      case 'WARNING':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />;
      case 'FAILED':
        return <XCircle className="w-3.5 h-3.5 text-rose-500" />;
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'AUTH':
        return { labelAr: 'تسجيل دخول/خروج', labelEn: 'Auth', color: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/25' };
      case 'USER_MGMT':
        return { labelAr: 'إدارة المستخدمين', labelEn: 'User Mgmt', color: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/25' };
      case 'RBAC':
        return { labelAr: 'حوكمة الصلاحيات', labelEn: 'RBAC', color: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25' };
      case 'SECURITY':
      default:
        return { labelAr: 'الأمان المركزي', labelEn: 'Security', color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25' };
    }
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* 1. Header with Live Event Counter */}
      <div className="rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#121B14] p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-[#D99B26] dark:text-[#EBB34D] border border-amber-500/30 flex items-center justify-center shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-[#1A241C] dark:text-[#F3EFE6] tracking-tight">
                {t('سجل العمليات والأمان المؤسسي الحي (Live Audit Trail)', 'Enterprise Live Audit Trail')}
              </h2>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <p className="text-xs text-[#5C665E] dark:text-[#8FA392] mt-0.5">
              {t(
                'توثيق ديناميكي مشفر لكافة عمليات الدخول وتعديل الصلاحيات وإنشاء الحسابات في الزمن الحقيقي.',
                'Real-time cryptographic audit trail tracking logins, permission modifications, and user creation.'
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#5C665E] dark:text-[#8FA392]">
          <span className="px-3 py-1.5 rounded-xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628]">
            {filteredLogs.length} {t('سجلات موثقة', 'Audit Records')}
          </span>
        </div>
      </div>

      {/* 2. Category Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { id: 'ALL', labelAr: 'كافة العمليات', labelEn: 'All Events' },
            { id: 'AUTH', labelAr: 'الدخول والجلسات', labelEn: 'Auth & Sessions' },
            { id: 'USER_MGMT', labelAr: 'حسابات المستخدمين', labelEn: 'User Accounts' },
            { id: 'RBAC', labelAr: 'مصفوفة الصلاحيات', labelEn: 'RBAC Matrix' },
            { id: 'SECURITY', labelAr: 'أمان النظام', labelEn: 'Security Core' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setCategoryFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                categoryFilter === tab.id
                  ? 'bg-[#1C291E] dark:bg-[#EBB34D] text-[#F3EFE6] dark:text-[#0E1610] shadow-xs'
                  : 'bg-[#F3EFE6] dark:bg-[#17231A] text-[#5C665E] dark:text-[#8FA392] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23] border border-[#E0D9CB] dark:border-[#243628]'
              }`}
            >
              {isRtl ? tab.labelAr : tab.labelEn}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-[#5C665E] dark:text-[#8FA392] absolute inset-y-0 start-3 my-auto" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t('البحث في السجل...', 'Search audit log...')}
            className="w-full ps-9 pe-3 py-1.5 rounded-xl text-xs bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* 3. Audit Trail Records List */}
      <div className="rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#121B14] overflow-hidden shadow-sm">
        <div className="divide-y divide-[#E0D9CB]/60 dark:divide-[#243628]/60">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#5C665E] dark:text-[#8FA392]">
              {t('لا توجد سجلات مطابقة للبحث المحدد.', 'No audit records match the selected criteria.')}
            </div>
          ) : (
            filteredLogs.map(log => {
              const catBadge = getCategoryBadge(log.category);

              return (
                <div
                  key={log.id}
                  className="p-3.5 sm:p-4 hover:bg-[#F3EFE6]/70 dark:hover:bg-[#17231A]/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-start"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="pt-0.5 shrink-0">
                      {getStatusIcon(log.status)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-xs font-black text-[#1A241C] dark:text-[#F3EFE6]">
                          {isRtl ? log.actionAr : log.actionEn}
                        </span>
                        <span className={`px-2 py-0.2 rounded-md text-[10px] font-bold border ${catBadge.color}`}>
                          {isRtl ? catBadge.labelAr : catBadge.labelEn}
                        </span>
                      </div>
                      <p className="text-xs text-[#5C665E] dark:text-[#8FA392] leading-relaxed">
                        {isRtl ? log.detailsAr : log.detailsEn}
                      </p>
                      <div className="mt-1.5 flex items-center gap-3 text-[10.5px] text-[#5C665E] dark:text-[#8FA392]">
                        <span className="flex items-center gap-1 font-semibold">
                          <User className="w-3 h-3" />
                          <span>{log.actorName}</span>
                        </span>
                        <span>•</span>
                        <span className="font-mono">{log.actorEmail}</span>
                        <span>•</span>
                        <span className="font-mono text-[10px] opacity-75">{log.ipAddress}</span>
                      </div>
                    </div>
                  </div>

                  <div className="sm:text-end shrink-0 ps-6 sm:ps-0">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#5C665E] dark:text-[#8FA392] bg-[#EAE4D7]/60 dark:bg-[#1F2E23]/60 px-2.5 py-1 rounded-lg border border-[#E0D9CB]/60 dark:border-[#243628]/60">
                      <Clock className="w-3 h-3 text-[#D99B26] dark:text-[#EBB34D]" />
                      <span>{log.timestamp}</span>
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
