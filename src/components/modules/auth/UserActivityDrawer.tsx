import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import {
  X,
  History,
  ShieldAlert,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Filter
} from 'lucide-react';

interface UserActivityDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserActivityDrawer: React.FC<UserActivityDrawerProps> = ({ isOpen, onClose }) => {
  const { user, auditLogs } = useAuth();
  const { isRtl, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  if (!isOpen || !user) return null;

  // Filter logs for this user (or all system logs if super admin)
  const userLogs = auditLogs.filter(log => {
    // If not super admin, show only matching actor name or email
    const isOwner =
      log.actorEmail?.toLowerCase() === user.email?.toLowerCase() ||
      log.actorName === user.nameAr ||
      user.role === 'SUPER_ADMIN';

    if (!isOwner) return false;

    if (categoryFilter !== 'ALL' && log.category !== categoryFilter) {
      return false;
    }

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchAction = log.actionAr?.toLowerCase().includes(q) || log.actionEn?.toLowerCase().includes(q);
      const matchDetails = log.detailsAr?.toLowerCase().includes(q) || log.detailsEn?.toLowerCase().includes(q);
      const matchCategory = log.category?.toLowerCase().includes(q);
      if (!matchAction && !matchDetails && !matchCategory) return false;
    }

    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" />
            <span>{t('ناجح', 'Success')}</span>
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-3 h-3" />
            <span>{t('تحذير', 'Warning')}</span>
          </span>
        );
      case 'FAILED':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <XCircle className="w-3 h-3" />
            <span>{t('مرفوض', 'Failed')}</span>
          </span>
        );
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'SECURITY':
        return <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded">أمان ونظام</span>;
      case 'USER_MGMT':
        return <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">إدارة المستخدمين</span>;
      case 'RBAC':
        return <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">الصلاحيات</span>;
      case 'AUTH':
      default:
        return <span className="text-[10px] font-semibold text-[#D99B26] dark:text-[#EBB34D] bg-amber-500/10 px-1.5 py-0.5 rounded">تسجيل دخول</span>;
    }
  };

  return (
    <div
      className="fixed inset-0 !m-0 !top-0 !left-0 !right-0 !bottom-0 w-screen h-screen z-[999] bg-black/60 backdrop-blur-xs flex justify-end"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-lg h-full bg-[#FBF9F5] dark:bg-[#121B14] border-s border-[#E0D9CB] dark:border-[#243628] shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 text-start"
        style={{ colorScheme: 'light' }}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1C291E] dark:bg-[#1A261D] text-[#D99B26] dark:text-[#EBB34D] flex items-center justify-center font-bold shadow-xs">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#1A241C] dark:text-[#F3EFE6]">
                {t('سجل نشاطي وحركاتي', 'My Activity & Audit Log')}
              </h3>
              <p className="text-xs text-[#5C665E] dark:text-[#8FA392]">
                {t('توثيق كافة الإجراءات والعمليات المنفذة بالتاريخ والوقت', 'Chronological log of verified user operations')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#5C665E] dark:text-[#8FA392] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="p-3.5 border-b border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#121B14] space-y-2.5 shrink-0">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute start-3 top-1/2 -translate-y-1/2 text-[#5C665E] dark:text-[#8FA392]" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder={t('البحث في الحركات والإجراءات...', 'Search activity logs...')}
              className="w-full ps-9 pe-3 py-2 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#17231A] text-xs text-[#1A241C] dark:text-[#F3EFE6] placeholder-[#8FA392] focus:outline-none focus:border-[#D99B26] dark:focus:border-[#EBB34D]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-[#5C665E] dark:text-[#8FA392] shrink-0 me-1" />
            {['ALL', 'SECURITY', 'USER_MGMT', 'RBAC', 'AUTH'].map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors shrink-0 ${
                  categoryFilter === cat
                    ? 'bg-[#1C291E] text-white shadow-xs'
                    : 'bg-[#EAE4D7] dark:bg-[#1A261D] text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6]'
                }`}
              >
                {cat === 'ALL' && t('الكل', 'All')}
                {cat === 'SECURITY' && t('الأمان', 'Security')}
                {cat === 'USER_MGMT' && t('المستخدمين', 'Users')}
                {cat === 'RBAC' && t('الصلاحيات', 'RBAC')}
                {cat === 'AUTH' && t('الدخول', 'Auth')}
              </button>
            ))}
          </div>
        </div>

        {/* Log Entries List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {userLogs.length === 0 ? (
            <div className="py-16 text-center text-[#5C665E] dark:text-[#8FA392]">
              <ShieldAlert className="w-10 h-10 mx-auto mb-2 opacity-40 text-[#D99B26]" />
              <p className="text-xs font-bold">{t('لا توجد حركات مسجلة تطابق البحث', 'No matching activity logs found')}</p>
            </div>
          ) : (
            userLogs.map(log => (
              <div
                key={log.id}
                className="p-3.5 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#17231A] shadow-xs space-y-2 hover:border-[#D99B26]/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                        {isRtl ? log.actionAr : log.actionEn}
                      </span>
                      {getCategoryBadge(log.category)}
                    </div>
                    <span className="text-[11px] text-[#5C665E] dark:text-[#8FA392] mt-0.5 block">
                      {isRtl ? log.detailsAr : log.detailsEn}
                    </span>
                  </div>
                  <div className="shrink-0">{getStatusBadge(log.status)}</div>
                </div>

                <div className="pt-2 border-t border-[#E0D9CB]/50 dark:border-[#243628]/50 flex items-center justify-between text-[10px] text-[#5C665E] dark:text-[#8FA392]">
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    <span>{log.timestamp}</span>
                  </span>
                  <span className="font-medium truncate max-w-[150px]">{log.actorName}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
