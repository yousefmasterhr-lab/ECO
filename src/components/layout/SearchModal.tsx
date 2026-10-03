import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigation } from '../../context/NavigationContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Search,
  X,
  ArrowRight,
  ArrowLeft,
  CircleDot,
  HardHat,
  Scale,
  ShieldCheck,
  Users,
  UserCheck,
  Mail,
  BarChart3,
  ScrollText,
  Settings
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
};

export const SearchModal: React.FC = () => {
  const { isRtl, t } = useLanguage();
  const {
    categories,
    searchModalOpen,
    setSearchModalOpen,
    selectItem
  } = useNavigation();

  const [query, setQuery] = useState('');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSearchModalOpen(false);
      }
    };
    if (searchModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchModalOpen, setSearchModalOpen]);

  // Flattened items for search
  const allSearchItems = categories.flatMap(cat =>
    cat.subItems.map(sub => ({
      categoryId: cat.id,
      categoryTitleAr: cat.titleAr,
      categoryTitleEn: cat.titleEn,
      categoryColor: cat.colorVar,
      iconName: cat.iconName,
      subId: sub.id,
      titleAr: sub.titleAr,
      titleEn: sub.titleEn,
    }))
  );

  const filteredItems = query.trim() === ''
    ? allSearchItems.slice(0, 7)
    : allSearchItems.filter(item => {
        const q = query.toLowerCase();
        return (
          item.titleAr.toLowerCase().includes(q) ||
          item.titleEn.toLowerCase().includes(q) ||
          item.categoryTitleAr.toLowerCase().includes(q) ||
          item.categoryTitleEn.toLowerCase().includes(q)
        );
      });

  return (
    <AnimatePresence>
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSearchModalOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="relative z-10 w-full max-w-xl rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] shadow-2xl overflow-hidden"
          >
            {/* Search Input Field */}
            <div className="flex items-center gap-3 p-4 border-b border-[#E0D9CB] dark:border-[#243628]">
              <Search className="w-5 h-5 text-[#5C665E] dark:text-[#8FA392] shrink-0" />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={t('ابحث عن قسم، استمارة، مستخلص، معاملة أو تعميم...', 'Search department, form, submittal or decree...')}
                className="w-full bg-transparent border-none outline-hidden text-sm text-[#1A241C] dark:text-[#F3EFE6] placeholder:text-[#5C665E] dark:placeholder:text-[#8FA392]"
              />
              <button
                onClick={() => setSearchModalOpen(false)}
                className="p-1 rounded-lg text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Results List */}
            <div className="p-2 max-h-80 overflow-y-auto space-y-1">
              <div className="px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-wider text-[#5C665E] dark:text-[#8FA392]">
                {query.trim() === '' ? t('الأقسام والموديولات المقترحة', 'Suggested Modules & Workflows') : t('نتائج البحث المباشرة', 'Search Results')}
              </div>

              {filteredItems.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#5C665E] dark:text-[#8FA392]">
                  {t('لم يتم العثور على أي نتائج مطابقة للبحث.', 'No matching results found.')}
                </div>
              ) : (
                filteredItems.map(item => {
                  const Icon = ICON_MAP[item.iconName] || CircleDot;
                  return (
                    <button
                      key={`${item.categoryId}-${item.subId}`}
                      onClick={() => {
                        selectItem(item.categoryId, item.subId);
                        setSearchModalOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-xl text-start hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23] transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{
                            backgroundColor: `${item.categoryColor}15`,
                            color: item.categoryColor,
                          }}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] truncate">
                            {isRtl ? item.titleAr : item.titleEn}
                          </p>
                          <span className="text-[10.5px] text-[#5C665E] dark:text-[#8FA392]">
                            {isRtl ? item.categoryTitleAr : item.categoryTitleEn}
                          </span>
                        </div>
                      </div>
                      {isRtl ? (
                        <ArrowLeft className="w-4 h-4 text-[#5C665E] dark:text-[#8FA392] opacity-0 group-hover:opacity-100 transition-opacity" />
                      ) : (
                        <ArrowRight className="w-4 h-4 text-[#5C665E] dark:text-[#8FA392] opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Modal Footer Key Hints */}
            <div className="px-4 py-2.5 bg-[#EAE4D7]/50 dark:bg-[#131E15] border-t border-[#E0D9CB] dark:border-[#243628] flex items-center justify-between text-[11px] text-[#5C665E] dark:text-[#8FA392]">
              <span>{t('اضغط ESC للإغلاق', 'Press ESC to close')}</span>
              <span>{t('منصة الـ ERP الموحدة — Royal Olive & Ivory', 'Enterprise ERP Portal')}</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
