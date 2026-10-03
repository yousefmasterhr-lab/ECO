import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePWA } from '../../context/PWAContext';
import { useLanguage } from '../../context/LanguageContext';
import { Download, X, Sparkles } from 'lucide-react';

export const PWAInstallBanner: React.FC = () => {
  const { canInstall, showBanner, promptInstall, dismissBanner } = usePWA();
  const { t } = useLanguage();

  if (!canInstall || !showBanner) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-4 sm:bottom-6 inset-x-3 sm:inset-x-auto sm:end-6 z-50 max-w-md mx-auto sm:mx-0"
      >
        <div className="p-3.5 sm:p-4 rounded-2xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#D99B26]/30 dark:border-[#EBB34D]/30 shadow-2xl backdrop-blur-lg flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#1C291E] dark:bg-[#0E1610] border border-[#D99B26]/40 flex items-center justify-center shrink-0 shadow-xs">
              <svg
                className="w-5 h-5 text-[#D99B26] dark:text-[#EBB34D]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
                <path d="M2 7h20" />
              </svg>
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] flex items-center gap-1.5">
                <span>{t('تثبيت تطبيق ECO ERP', 'Install ECO ERP App')}</span>
                <Sparkles className="w-3 h-3 text-[#D99B26] dark:text-[#EBB34D]" />
              </h4>
              <p className="text-[11px] text-[#5C665E] dark:text-[#8FA392] truncate mt-0.5">
                {t('تجربة سريعة كالتطبيق الأصلي ومتاح بدون اتصال', 'Native-like app experience with offline capability')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={promptInstall}
              className="px-3 py-1.5 rounded-xl bg-[#D99B26] hover:bg-[#C28519] dark:bg-[#EBB34D] dark:hover:bg-[#D99B26] text-[#1C291E] dark:text-[#0E1610] text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 active:scale-95 touch-target"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t('تثبيت', 'Install')}</span>
            </button>
            <button
              onClick={dismissBanner}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-[#5C665E] dark:text-[#8FA392] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23] transition-colors"
              aria-label={t('إغلاق', 'Dismiss')}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
