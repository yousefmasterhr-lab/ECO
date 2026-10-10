import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import {
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  ShieldCheck,
  Building2,
  Lock
} from 'lucide-react';

export const UnauthorizedView: React.FC = () => {
  const { isRtl, t } = useLanguage();
  const { user, switchUserRole } = useAuth();
  const { selectItem } = useNavigation();

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4 flex flex-col items-center justify-center animate-in fade-in duration-300">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full relative overflow-hidden rounded-3xl border border-amber-500/30 dark:border-amber-500/20 bg-[#F3EFE6] dark:bg-[#121B14] p-8 sm:p-12 shadow-2xl text-center"
      >
        {/* Ambient Glow */}
        <div className="absolute -top-24 -start-24 w-72 h-72 bg-amber-500/10 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -end-24 w-72 h-72 bg-emerald-600/10 dark:bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Shield Icon with Floating Emblem */}
        <div className="relative inline-flex mb-6">
          <div className="w-20 h-20 rounded-3xl bg-amber-500/15 dark:bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[#D99B26] dark:text-[#EBB34D] shadow-lg shadow-amber-500/10">
            <ShieldAlert className="w-10 h-10 animate-pulse" />
          </div>
          <div className="absolute -bottom-1 -end-1 w-7 h-7 rounded-full bg-red-500/20 border border-red-500/40 text-red-500 dark:text-red-400 flex items-center justify-center">
            <Lock className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Title & Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">
          <span>{t('بروتوكول الأمان المؤسسي RBAC', 'Enterprise RBAC Guard')}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-[#1A241C] dark:text-[#F3EFE6] tracking-tight mb-3">
          {t('تم تقييد الوصول • تصريح غير كافٍ', 'Access Restricted • Insufficient Clearance')}
        </h2>

        <p className="text-sm text-[#5C665E] dark:text-[#8FA392] max-w-xl mx-auto leading-relaxed mb-8">
          {isRtl
            ? 'حسابك الحالي لا يمتلك الصلاحيات الإدارية المطلوبة للوصول إلى هذا القسم. وفقاً لمصفوفة الصلاحيات المعتمدة، تم عزل هذه البيانات لمنع أي تعارض تشغيلي.'
            : 'Your active corporate account lacks the necessary clearance level to access this domain. Under strict RBAC enforcement, access to this module has been isolated.'}
        </p>

        {/* Active Identity Card */}
        {user && (
          <div className="max-w-md mx-auto mb-8 p-4 rounded-2xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-start flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1C291E] to-[#D99B26] text-white flex items-center justify-center font-black text-sm shrink-0 shadow-sm">
                {user.nameAr.charAt(0)}
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] truncate">
                  {isRtl ? user.nameAr : user.nameEn}
                </h4>
                <p className="text-[11px] text-[#5C665E] dark:text-[#8FA392] truncate">
                  {isRtl ? user.roleLabelAr : user.roleLabelEn}
                </p>
              </div>
            </div>

            <div className="text-end shrink-0">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-400 font-bold text-[10.5px] border border-amber-500/25">
                <ShieldCheck className="w-3 h-3" />
                <span>{isRtl ? user.clearanceNameAr : user.clearanceNameEn}</span>
              </span>
            </div>
          </div>
        )}

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
          <button
            onClick={() => selectItem('')}
            className="px-6 py-2.5 rounded-xl bg-[#1C291E] dark:bg-[#EBB34D] text-[#F3EFE6] dark:text-[#0E1610] font-bold text-xs hover:opacity-90 active:scale-95 transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            {isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
            <span>{t('العودة إلى لوحة القيادة المصرح بها', 'Return to Authorized Dashboard')}</span>
          </button>

          {/* Quick Demo Switcher Button to C-Suite Admin for Immediate Verification */}
          {user && user.role !== 'SUPER_ADMIN' && (
            <button
              onClick={() => {
                switchUserRole('SUPER_ADMIN');
                selectItem('');
              }}
              className="px-5 py-2.5 rounded-xl border border-amber-500/40 text-amber-700 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 active:scale-95 transition-all text-xs font-bold flex items-center gap-2 cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>{t('ترقية تجريبية للإدارة العليا (C-Suite)', 'Simulate C-Suite Clearance')}</span>
            </button>
          )}
        </div>

        {/* Security Note Footer */}
        <div className="pt-6 border-t border-[#E0D9CB]/60 dark:border-[#243628] flex items-center justify-center gap-2 text-[11px] text-[#5C665E] dark:text-[#8FA392]">
          <Building2 className="w-3.5 h-3.5 text-amber-500" />
          <span>
            {t(
              'شركة ترابط للمقاولات والتجارة • منظومة ECO لإدارة الموارد المؤسسية',
              'Tarabot Contracting & Trading • ECO Enterprise Resource Planning'
            )}
          </span>
        </div>
      </motion.div>
    </div>
  );
};
