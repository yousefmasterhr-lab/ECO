import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigation } from '../../context/NavigationContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { SidebarItem } from './SidebarItem';
import {
  ChevronLeft,
  ChevronRight,
  X,
  Compass,
  Sparkles,
  LayoutGrid,
  Shield
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { isRtl, t } = useLanguage();
  const { user } = useAuth();
  const {
    categories,
    isCollapsed,
    toggleSidebar,
    isMobileOpen,
    closeMobileDrawer,
    activeCategoryId,
    selectItem
  } = useNavigation();

  const sidebarWidth = isCollapsed ? 'w-[72px] min-w-[72px] max-w-[72px]' : 'w-72 min-w-72 max-w-72';

  // Close mobile drawer on Escape key press
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileOpen) {
        closeMobileDrawer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileOpen, closeMobileDrawer]);

  // Desktop Sidebar Content
  const sidebarContent = (
    <div className="h-full flex flex-col justify-between overflow-x-hidden">
      {/* Top Header / Quick Action */}
      <div className="p-3 border-b border-[#E0D9CB] dark:border-[#243628] shrink-0">
        <button
          onClick={() => selectItem('')}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all ${
            activeCategoryId === null
              ? 'bg-[#D99B26]/15 text-[#D99B26] dark:text-[#EBB34D] font-bold border border-[#D99B26]/30'
              : 'text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23]'
          } ${isCollapsed ? 'justify-center px-0' : ''}`}
          title={t('الرئيسية العامة', 'Main Overview')}
        >
          <LayoutGrid className="w-5 h-5 text-[#D99B26] dark:text-[#EBB34D] shrink-0" />
          {!isCollapsed && (
            <div className="flex-1 text-start min-w-0">
              <span className="text-xs tracking-tight block truncate font-bold">
                {t('لوحة التحكم المركزية', 'Central Overview')}
              </span>
            </div>
          )}
        </button>
      </div>

      {/* Navigation Department Categories List */}
      <div
        id="sidebar-nav-container"
        className={`flex-1 min-h-0 overflow-y-auto overflow-x-hidden sidebar-scrollbar py-3 space-y-1 ${
          isCollapsed ? 'px-1.5 flex flex-col items-center' : 'px-2.5'
        }`}
      >
        {!isCollapsed && (
          <div className="px-3 pb-2 text-[10.5px] font-bold uppercase tracking-wider text-[#5C665E] dark:text-[#8FA392]">
            {t('أقسام المنظومة الإدارية', 'Enterprise Departments')}
          </div>
        )}
        {categories.map(category => (
          <SidebarItem key={category.id} category={category} />
        ))}
      </div>

      {/* Bottom Footer & Collapse Mini-Rail Toggle */}
      <div className="p-2.5 border-t border-[#E0D9CB] dark:border-[#243628] shrink-0 space-y-2">
        {/* Collapse Mini-Rail Toggle Button */}
        <button
          onClick={toggleSidebar}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23] transition-colors text-xs font-semibold ${
            isCollapsed ? 'justify-center px-0' : 'justify-between'
          }`}
          title={t(
            isCollapsed ? 'توسيع القائمة الجانبية' : 'طي القائمة (Mini-Rail)',
            isCollapsed ? 'Expand Sidebar' : 'Collapse to Mini-Rail'
          )}
        >
          {!isCollapsed && (
            <div className="flex items-center gap-2 min-w-0">
              <Compass className="w-4 h-4 text-[#D99B26] dark:text-[#EBB34D] shrink-0" />
              <span className="truncate">{t('تصغير القائمة (Mini-Rail)', 'Collapse Sidebar')}</span>
            </div>
          )}
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#EAE4D7] dark:bg-[#17231A] shrink-0 text-[#1A241C] dark:text-[#F3EFE6]">
            {isRtl ? (
              isCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
            ) : (
              isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />
            )}
          </div>
        </button>

        {/* Enterprise System Version & Active Role indicators (When expanded) */}
        {!isCollapsed && (
          <div className="space-y-1.5">
            {user && (
              <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-[10.5px] text-amber-700 dark:text-amber-400 font-bold">
                <span className="flex items-center gap-1.5 truncate">
                  <Shield className="w-3 h-3 shrink-0" />
                  <span className="truncate">{isRtl ? user.roleLabelAr : user.roleLabelEn}</span>
                </span>
                <span className="px-1.5 py-0.5 bg-amber-500/20 rounded font-mono text-[9.5px] shrink-0">
                  L{user.clearanceLevel}
                </span>
              </div>
            )}
            <div className="px-3 py-1.5 rounded-xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] flex items-center justify-between text-[10px] text-[#5C665E] dark:text-[#8FA392] font-medium">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-[#D99B26] dark:text-[#EBB34D]" />
                <span>ECO Enterprise Shell</span>
              </span>
              <span className="px-1.5 py-0.5 bg-[#D99B26]/15 text-[#D99B26] dark:text-[#EBB34D] rounded-sm font-semibold text-[9px]">
                {t('متصل', 'ACTIVE')}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Height Sidebar (Visible on screens >= 1024px) */}
      <aside
        className={`hidden lg:flex flex-col h-full flex-shrink-0 overflow-hidden border-inline-end border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#121B14] text-[#1A241C] dark:text-[#F3EFE6] transition-all duration-300 ease-in-out z-20 ${sidebarWidth}`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile & Tablet Slide-Out Drawer with Backdrop (Visible on screens < 1024px) */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobileDrawer}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Slide-out Drawer Panel with Swipe-to-Dismiss */}
            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.25}
              onDragEnd={(_e, info) => {
                if (isRtl && (info.offset.x > 80 || info.velocity.x > 300)) {
                  closeMobileDrawer();
                } else if (!isRtl && (info.offset.x < -80 || info.velocity.x < -300)) {
                  closeMobileDrawer();
                }
              }}
              initial={{ x: isRtl ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: isRtl ? '100%' : '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className={`relative z-10 w-80 max-w-[85vw] h-full bg-[#F3EFE6] dark:bg-[#121B14] text-[#1A241C] dark:text-[#F3EFE6] shadow-2xl flex flex-col border-inline-end border-[#E0D9CB] dark:border-[#243628] touch-pan-y pt-safe pb-safe`}
            >
              {/* Drawer Top Header with Close Button */}
              <div className="p-4 border-b border-[#E0D9CB] dark:border-[#243628] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#D99B26] dark:bg-[#EBB34D] flex items-center justify-center text-[#1C291E] dark:text-[#0E1610]">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                      {t('أقسام المنظومة الموحدة', 'ERP Portal Modules')}
                    </h3>
                    <span className="text-[10px] text-[#5C665E] dark:text-[#8FA392]">{t('القائمة الرئيسية', 'Main Navigation')}</span>
                  </div>
                </div>
                <button
                  onClick={closeMobileDrawer}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23] active:scale-95"
                  aria-label={t('إغلاق', 'Close')}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Content */}
              <div id="mobile-sidebar-nav-container" className="flex-1 min-h-0 overflow-y-auto sidebar-scrollbar p-3 space-y-1">
                {categories.map(category => (
                  <SidebarItem key={category.id} category={category} />
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
