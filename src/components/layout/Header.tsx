import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTenant } from '../../context/TenantContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNavigation } from '../../context/NavigationContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { usePWA } from '../../context/PWAContext';

import {
  Building2,
  ChevronDown,
  Search,
  Bell,
  Check,
  Menu,
  X,
  Sun,
  Moon,
  LogOut,
  User,
  Lock,
  History,
  SlidersHorizontal,
  Sparkles,
  ArrowUpRight,
  Download
} from 'lucide-react';
import { UserProfileModal } from '../modules/auth/UserProfileModal';
import { ChangePasswordModal } from '../modules/auth/ChangePasswordModal';
import { UserActivityDrawer } from '../modules/auth/UserActivityDrawer';
import { PermissionsManagerModal } from '../modules/auth/PermissionsManagerModal';
import { EcoOfficialLogo } from '../common/EcoOfficialLogo';
import { TypewriterText } from '../auth/TypewriterText';
import { cleanArabicTitle } from '../../types/rbac';

interface SearchModuleItem {
  id: string;
  title: string;
  badge?: string;
  colorVar?: string;
  subItem?: { id: string; title: string };
}

interface SearchCompanyItem {
  id: string;
  name: string;
  code: string;
  logoColor?: string;
}

export const Header: React.FC = () => {
  const {
    companies,
    selectedCompanyIds,
    toggleCompany,
    isAllSelected,
    toggleSelectAll,
    selectionSummaryAr,
    selectionSummaryEn,
    setActiveCompany
  } = useTenant();

  const { isRtl, t } = useLanguage();
  const { currentUser, toggleMobileDrawer, setSearchModalOpen, categories, selectItem } = useNavigation();
  const { isDark, toggleTheme } = useTheme();
  const { user, logout, hasPermission } = useAuth();
  const { canInstall, isStandalone, promptInstall } = usePWA();

  const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Executive Account Modals
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [activityDrawerOpen, setActivityDrawerOpen] = useState(false);
  const [permissionsModalOpen, setPermissionsModalOpen] = useState(false);

  // Supercharged Search Bar State & Typewriter Cycling Prompts
  const SEARCH_PROMPTS = [
    'ابحث في الأقسام والخدمات والمستندات...',
    'انتقل سريعاً إلى دليل الشركات أو الفروع...',
    'ابحث في الموارد البشرية أو مصفوفة الصلاحيات...',
  ];

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [currentPromptIdx, setCurrentPromptIdx] = useState(0);

  useEffect(() => {
    if (isSearchFocused || searchQuery) return;
    const interval = setInterval(() => {
      setCurrentPromptIdx(prev => (prev + 1) % SEARCH_PROMPTS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [isSearchFocused, searchQuery]);

  // Global Ctrl + K listener & Escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchFocused(true);
      }
      if (e.key === 'Escape') {
        setIsSearchFocused(false);
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filtered live search results
  const searchResults: {
    modules: SearchModuleItem[];
    companies: SearchCompanyItem[];
    isQueryEmpty: boolean;
  } = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return {
        modules: (categories || []).slice(0, 6).map(c => ({
          id: c.id,
          title: isRtl ? c.titleAr : c.titleEn,
          badge: isRtl ? c.badgeAr : c.badgeEn,
          colorVar: c.colorVar,
          subItem: undefined as { id: string; title: string } | undefined,
        })),
        companies: (companies || []).slice(0, 3).map(c => ({
          id: c.id,
          name: isRtl ? c.nameAr : c.nameEn,
          code: c.code,
          logoColor: c.logoColor,
        })),
        isQueryEmpty: true,
      };
    }

    const matchedModules: Array<{
      id: string;
      title: string;
      badge?: string;
      colorVar?: string;
      subItem?: { id: string; title: string };
    }> = [];

    (categories || []).forEach(cat => {
      const catTitle = (isRtl ? cat.titleAr : cat.titleEn).toLowerCase();
      if (catTitle.includes(q)) {
        matchedModules.push({
          id: cat.id,
          title: isRtl ? cat.titleAr : cat.titleEn,
          badge: isRtl ? cat.badgeAr : cat.badgeEn,
          colorVar: cat.colorVar,
        });
      }
      (cat.subItems || []).forEach(sub => {
        const subTitle = (isRtl ? sub.titleAr : sub.titleEn).toLowerCase();
        if (subTitle.includes(q)) {
          matchedModules.push({
            id: cat.id,
            title: isRtl ? cat.titleAr : cat.titleEn,
            badge: isRtl ? cat.badgeAr : cat.badgeEn,
            colorVar: cat.colorVar,
            subItem: {
              id: sub.id,
              title: isRtl ? sub.titleAr : sub.titleEn,
            },
          });
        }
      });
    });

    const matchedCompanies = (companies || []).filter(c => {
      const name = (isRtl ? c.nameAr : c.nameEn).toLowerCase();
      const code = (c.code || '').toLowerCase();
      return name.includes(q) || code.includes(q);
    }).map(c => ({
      id: c.id,
      name: isRtl ? c.nameAr : c.nameEn,
      code: c.code,
      logoColor: c.logoColor,
    }));

    return {
      modules: matchedModules.slice(0, 8),
      companies: matchedCompanies.slice(0, 4),
      isQueryEmpty: false,
    };
  }, [searchQuery, categories, companies, isRtl]);

  const displayCompanySummary = companies.length === 1
    ? (isRtl ? companies[0].nameAr : companies[0].nameEn)
    : (isRtl ? selectionSummaryAr : selectionSummaryEn);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setCompanyDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 flex-shrink-0 z-40 w-full border-b border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#0E1610] transition-colors duration-200 pt-safe">
      <div className="h-full px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-3">
        {/* Start / Left Section: Mobile Menu + Official Favicon Logo & Multi-Select Company */}
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 min-w-0">
          {/* Mobile Hamburger Button (< 1024px) */}
          <button
            onClick={toggleMobileDrawer}
            aria-label={t('فتح القائمة الجانبية', 'Open navigation menu')}
            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl text-[#5C665E] dark:text-[#8FA392] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23] active:scale-95 transition-transform touch-target shrink-0"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Platform Identity with 3D Official Logo & Centered Typewriter Typography */}
          <div className="hidden sm:flex items-center gap-3 shrink-0 select-none group">
            {/* 3D Floating Official Logo Badge with Hover Tilt & Golden Glow */}
            <div
              className="relative transition-transform duration-300 ease-out hover:scale-105 hover:-rotate-2 cursor-pointer filter drop-shadow-[0_2px_12px_rgba(217,155,38,0.25)] dark:drop-shadow-[0_0_18px_rgba(245,158,11,0.4)]"
              style={{ perspective: 600 }}
            >
              <EcoOfficialLogo size="md" className="shrink-0 transition-all duration-300 group-hover:border-amber-400" />
            </div>
            
            {/* Centered 2-Line Brand Typography Lockup (ECO centered on top, ERP Company Operations full typewriter below) */}
            <div className="hidden lg:flex flex-col items-center justify-center text-center shrink-0 min-w-[190px] whitespace-nowrap">
              {/* Top Line: ECO Centered, text-xl, bold high contrast */}
              <span className="text-xl font-black tracking-wider bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 dark:from-amber-400 dark:via-amber-300 dark:to-amber-500 bg-clip-text text-transparent drop-shadow-xs leading-none">
                ECO
              </span>

              {/* Bottom Line: Full ERP Company Operations with Typewriter Motion & Blinking Amber Cursor */}
              <div
                dir="ltr"
                className="min-w-[190px] text-center inline-flex items-center justify-center min-h-[16px] mt-1 leading-none whitespace-nowrap overflow-visible"
              >
                <TypewriterText
                  text="ERP Company Operations"
                  typingSpeed={75}
                  deletingSpeed={38}
                  pauseMs={2800}
                  className="text-[10px] sm:text-[11px] font-bold text-[#5C665E] dark:text-[#A1B3A4] font-mono tracking-tight whitespace-nowrap"
                  cursorClassName="w-1 h-3 bg-amber-500 dark:bg-amber-400 ms-0.5"
                />
              </div>
            </div>
          </div>

          <div className="hidden sm:block h-6 w-px bg-[#E0D9CB] dark:bg-[#243628]" />

          {/* Multi-Select Company Selector Dropdown (Fixed Width to Avoid Single Letter Clipping) */}
          <div className="relative shrink-0 min-w-[180px] max-w-[260px]" ref={dropdownRef}>
            <button
              onClick={() => setCompanyDropdownOpen(prev => !prev)}
              className="w-full flex items-center justify-between gap-2.5 px-3.5 py-2 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23] text-start transition-colors min-w-[180px] max-w-[260px] shrink-0"
            >
              <div className="w-6 h-6 rounded-lg bg-[#D99B26]/15 dark:bg-[#EBB34D]/15 text-[#D99B26] dark:text-[#EBB34D] flex items-center justify-center shrink-0">
                <Building2 className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1 truncate">
                <div className="text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] truncate flex items-center gap-1.5">
                  <span className="truncate">{displayCompanySummary}</span>
                </div>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-[#5C665E] dark:text-[#8FA392] shrink-0 transition-transform duration-200 ${
                  companyDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Desktop Dropdown Menu (>= 768px) */}
            {companyDropdownOpen && (
              <div
                className={`hidden md:block absolute top-full mt-2 w-72 sm:w-80 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] shadow-xl p-2 z-50 animate-in fade-in-50 zoom-in-95 duration-150 ${
                  isRtl ? 'right-0 origin-top-right' : 'left-0 origin-top-left'
                }`}
              >
                {/* Header with Select All */}
                <div className="p-2 border-b border-[#E0D9CB]/60 dark:border-[#243628]">
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23] transition-colors touch-target"
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                          isAllSelected
                            ? 'bg-[#D99B26] dark:bg-[#EBB34D] border-[#D99B26] dark:border-[#EBB34D] text-[#1C291E] dark:text-[#0E1610]'
                            : 'border-[#E0D9CB] dark:border-[#243628] bg-transparent'
                        }`}
                      >
                        {isAllSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </span>
                      <span>{t('تحديد كافة الشركات والمنشآت', 'Select All Companies')}</span>
                    </span>
                    <span className="text-[10px] text-[#5C665E] dark:text-[#8FA392]">
                      ({companies.length})
                    </span>
                  </button>
                </div>

                {/* Company Options List */}
                <div className="mt-1 space-y-1 max-h-64 overflow-y-auto">
                  {companies.map(comp => {
                    const isChecked = selectedCompanyIds.includes(comp.id);
                    return (
                      <button
                        key={comp.id}
                        type="button"
                        onClick={() => toggleCompany(comp.id)}
                        className={`w-full flex items-center justify-between gap-2.5 px-2.5 py-2 rounded-xl text-start text-xs transition-colors touch-target ${
                          isChecked
                            ? 'bg-[#D99B26]/10 text-[#1A241C] dark:text-[#F3EFE6]'
                            : 'text-[#5C665E] dark:text-[#8FA392] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                              isChecked
                                ? 'bg-[#D99B26] dark:bg-[#EBB34D] border-[#D99B26] dark:border-[#EBB34D] text-[#1C291E] dark:text-[#0E1610]'
                                : 'border-[#E0D9CB] dark:border-[#243628] bg-transparent'
                            }`}
                          >
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </span>

                          <div
                            className="w-5 h-5 rounded-md flex items-center justify-center text-white shrink-0 text-[10px] font-bold"
                            style={{ backgroundColor: comp.logoColor }}
                          >
                            <Building2 className="w-3 h-3" />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate font-semibold leading-tight">
                              {isRtl ? comp.nameAr : comp.nameEn}
                            </p>
                            <span className="text-[10px] text-[#5C665E] dark:text-[#8FA392]">
                              {comp.code} • {isRtl ? comp.badgeAr : comp.badgeEn}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Mobile Bottom Sheet (< 768px) */}
            <AnimatePresence>
              {companyDropdownOpen && (
                <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
                  {/* Backdrop */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setCompanyDropdownOpen(false)}
                    className="fixed inset-0 bg-black/60 backdrop-blur-xs"
                  />

                  {/* Sheet Drawer */}
                  <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                    className="relative z-10 w-full max-h-[85vh] bg-[#F3EFE6] dark:bg-[#17231A] border-t border-[#E0D9CB] dark:border-[#243628] rounded-t-3xl shadow-2xl flex flex-col pb-safe"
                  >
                    {/* Drag Handle & Header */}
                    <div className="pt-3 pb-2.5 px-4 flex flex-col items-center border-b border-[#E0D9CB]/60 dark:border-[#243628]">
                      <div className="w-12 h-1.5 rounded-full bg-[#5C665E]/30 dark:bg-[#8FA392]/30 mb-3" />
                      <div className="w-full flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-[#D99B26] dark:text-[#EBB34D]" />
                          <h3 className="font-extrabold text-sm text-[#1A241C] dark:text-[#F3EFE6]">
                            {t('اختيار الشركات والمنشآت', 'Select Companies')}
                          </h3>
                        </div>
                        <button
                          onClick={() => setCompanyDropdownOpen(false)}
                          aria-label={t('إغلاق', 'Close')}
                          className="p-1.5 rounded-xl text-[#5C665E] dark:text-[#8FA392] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23] touch-target"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Header with Select All */}
                    <div className="p-3 border-b border-[#E0D9CB]/60 dark:border-[#243628]">
                      <button
                        type="button"
                        onClick={toggleSelectAll}
                        className="w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] bg-[#EAE4D7]/60 dark:bg-[#1F2E23]/60 hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23] transition-colors touch-target"
                      >
                        <span className="flex items-center gap-2.5">
                          <span
                            className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                              isAllSelected
                                ? 'bg-[#D99B26] dark:bg-[#EBB34D] border-[#D99B26] dark:border-[#EBB34D] text-[#1C291E] dark:text-[#0E1610]'
                                : 'border-[#E0D9CB] dark:border-[#243628] bg-transparent'
                            }`}
                          >
                            {isAllSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </span>
                          <span>{t('تحديد كافة الشركات والمنشآت', 'Select All Companies')}</span>
                        </span>
                        <span className="text-xs text-[#5C665E] dark:text-[#8FA392] font-mono">
                          ({selectedCompanyIds.length}/{companies.length})
                        </span>
                      </button>
                    </div>

                    {/* Company Options List */}
                    <div className="p-3 space-y-1.5 max-h-[48vh] overflow-y-auto overscroll-contain">
                      {companies.map(comp => {
                        const isChecked = selectedCompanyIds.includes(comp.id);
                        return (
                          <button
                            key={comp.id}
                            type="button"
                            onClick={() => toggleCompany(comp.id)}
                            className={`w-full flex items-center justify-between gap-3 p-3 rounded-xl text-start text-xs transition-colors touch-target ${
                              isChecked
                                ? 'bg-[#D99B26]/12 border border-[#D99B26]/30 text-[#1A241C] dark:text-[#F3EFE6]'
                                : 'border border-transparent text-[#5C665E] dark:text-[#8FA392] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23]'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span
                                className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                                  isChecked
                                    ? 'bg-[#D99B26] dark:bg-[#EBB34D] border-[#D99B26] dark:border-[#EBB34D] text-[#1C291E] dark:text-[#0E1610]'
                                    : 'border-[#E0D9CB] dark:border-[#243628] bg-transparent'
                                }`}
                              >
                                {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </span>

                              <div
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 text-xs font-bold shadow-2xs"
                                style={{ backgroundColor: comp.logoColor }}
                              >
                                <Building2 className="w-4 h-4" />
                              </div>

                              <div className="min-w-0">
                                <p className="truncate font-bold text-xs text-[#1A241C] dark:text-[#F3EFE6] leading-tight">
                                  {isRtl ? comp.nameAr : comp.nameEn}
                                </p>
                                <span className="text-[10.5px] text-[#5C665E] dark:text-[#8FA392]">
                                  {comp.code} • {isRtl ? comp.badgeAr : comp.badgeEn}
                                </span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Apply / Close Bottom Action */}
                    <div className="p-3 border-t border-[#E0D9CB]/60 dark:border-[#243628]">
                      <button
                        type="button"
                        onClick={() => setCompanyDropdownOpen(false)}
                        className="w-full py-2.5 rounded-xl bg-[#1C291E] dark:bg-[#EBB34D] text-[#F3EFE6] dark:text-[#0E1610] font-bold text-xs shadow-md active:scale-98 transition-transform touch-target flex items-center justify-center"
                      >
                        {t('تم الاختيار وتطبيق التصفية', 'Done & Apply')}
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Center / Supercharged Animated Search Bar & Instant Dropdown */}
        <div className="hidden md:flex flex-1 max-w-lg mx-3 relative" ref={searchContainerRef}>
          {/* Animated Golden Shimmer Border Wrapper */}
          <div
            className={`w-full rounded-2xl p-[1px] transition-all duration-300 ${
              isSearchFocused
                ? 'bg-gradient-to-r from-amber-500 via-amber-300 to-amber-600 shadow-[0_0_25px_rgba(245,158,11,0.35)]'
                : 'bg-gradient-to-r from-[#E0D9CB] via-[#D99B26]/30 to-[#E0D9CB] dark:from-[#243628] dark:via-[#D99B26]/40 dark:to-[#243628] hover:from-amber-500/50 hover:to-amber-500/50 hover:shadow-[0_0_15px_rgba(217,155,38,0.2)]'
            }`}
          >
            <div className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-[15px] bg-[#FBF9F5] dark:bg-[#121B14] text-xs transition-colors">
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <Search
                  className={`w-4 h-4 shrink-0 transition-transform duration-300 ${
                    isSearchFocused
                      ? 'text-amber-500 scale-110 rotate-12'
                      : 'text-[#5C665E] dark:text-[#8FA392]'
                  }`}
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  placeholder={SEARCH_PROMPTS[currentPromptIdx] || t('البحث السريع في الأقسام والمستندات...', 'Quick search modules & records...')}
                  className="w-full bg-transparent border-none outline-hidden text-[#1A241C] dark:text-[#F3EFE6] placeholder:text-[#5C665E]/70 dark:placeholder:text-[#8FA392]/70 text-xs font-medium cursor-text caret-amber-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="p-1 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                    aria-label={t('مسح البحث', 'Clear')}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Realistic 3D Pressed Keycap */}
              <kbd
                onClick={() => {
                  searchInputRef.current?.focus();
                  setIsSearchFocused(true);
                }}
                className="hidden lg:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-700 dark:text-amber-300 bg-gradient-to-b from-[#FFFDF9] to-[#EAE4D7] dark:from-[#243628] dark:to-[#17231A] border border-[#D99B26]/40 dark:border-amber-500/40 rounded-md shadow-[0_2px_0_rgba(180,83,9,0.35),inset_0_1px_0_rgba(255,255,255,0.5)] dark:shadow-[0_2px_0_rgba(0,0,0,0.6)] active:translate-y-0.5 active:shadow-none select-none cursor-pointer transition-all shrink-0 ms-2"
                title="Ctrl + K / ⌘ + K"
              >
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>
          </div>

          {/* Interactive Instant Search Dropdown */}
          <AnimatePresence>
            {isSearchFocused && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.98 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="absolute top-full mt-2 inset-x-0 rounded-2xl bg-[#FBF9F5]/95 dark:bg-[#0E1610]/95 backdrop-blur-2xl border border-[#D99B26]/35 dark:border-amber-500/40 shadow-[0_20px_50px_rgba(0,0,0,0.3),0_0_25px_rgba(217,155,38,0.15)] p-3 z-50 max-h-[420px] overflow-y-auto sidebar-scrollbar"
              >
                {/* Modules Results */}
                {searchResults.modules.length > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between px-2 py-1 mb-1 text-[11px] font-bold text-[#5C665E] dark:text-[#8FA392]">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>{searchResults.isQueryEmpty ? t('المنظومات والأقسام الرئيسية', 'Core ERP Modules') : t('النتائج المطابقة في الأقسام', 'Matching Modules & Services')}</span>
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {searchResults.modules.length} {t('عنصر', 'items')}
                      </span>
                    </div>

                    <div className="space-y-1">
                      {searchResults.modules.map((item: SearchModuleItem, idx: number) => (
                        <button
                          key={`${item.id}-${idx}`}
                          type="button"
                          onClick={() => {
                            selectItem(item.id, item.subItem?.id);
                            setIsSearchFocused(false);
                            setSearchQuery('');
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-start hover:bg-amber-500/10 dark:hover:bg-amber-400/10 hover:border-amber-500/30 border border-transparent transition-all group cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-xs"
                              style={{
                                backgroundColor: `${item.colorVar || '#D99B26'}18`,
                                color: item.colorVar || '#D99B26',
                              }}
                            >
                              <span className="text-xs font-bold">#</span>
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] group-hover:text-amber-600 dark:group-hover:text-amber-400 truncate">
                                {item.subItem ? `${item.title} › ${item.subItem.title}` : item.title}
                              </p>
                              {item.badge && (
                                <span className="text-[10px] text-[#5C665E] dark:text-[#8FA392]">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                          </div>
                          <ArrowUpRight className="w-4 h-4 text-stone-400 group-hover:text-amber-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Companies Results */}
                {searchResults.companies.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between px-2 py-1 mb-1 text-[11px] font-bold text-[#5C665E] dark:text-[#8FA392]">
                      <span className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-amber-500" />
                        <span>{t('الشركات والكيانات المسجلة', 'Registered Entities')}</span>
                      </span>
                    </div>

                    <div className="space-y-1">
                      {searchResults.companies.map((comp: SearchCompanyItem) => (
                        <button
                          key={comp.id}
                          type="button"
                          onClick={() => {
                            const found = companies.find(c => c.id === comp.id);
                            if (found) setActiveCompany(found);
                            setIsSearchFocused(false);
                            setSearchQuery('');
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-start hover:bg-emerald-500/10 dark:hover:bg-emerald-400/10 hover:border-emerald-500/30 border border-transparent transition-all group cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 text-[10px] font-bold shadow-xs"
                              style={{ backgroundColor: comp.logoColor }}
                            >
                              <Building2 className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 truncate">
                                {comp.name}
                              </p>
                              <span className="text-[10px] text-[#5C665E] dark:text-[#8FA392]">
                                {comp.code} • {t('تفعيل النطاق', 'Activate Scope')}
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
                            {t('تبديل', 'Switch')}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {searchResults.modules.length === 0 && searchResults.companies.length === 0 && (
                  <div className="p-6 text-center text-xs text-[#5C665E] dark:text-[#8FA392]">
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-40 text-amber-500" />
                    <p className="font-bold">{t('لا توجد نتائج مطابقة لبحثك', 'No matching results found')}</p>
                    <p className="text-[10px] mt-1">{t('جرّب البحث باسم القسم مثل "الشركات" أو "المالية"', 'Try searching by module name like "Companies" or "Finance"')}</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* End / Action Controls: Mobile Search, Notifications, User Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Mobile Search Button */}
          <button
            onClick={() => setSearchModalOpen(true)}
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl text-[#5C665E] dark:text-[#8FA392] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23] touch-target"
            aria-label={t('بحث', 'Search')}
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Theme Mode Toggle (Icon Only) */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={t(
              isDark ? 'التحويل إلى الوضع النهاري' : 'التحويل إلى الوضع الليلي',
              isDark ? 'Switch to light mode' : 'Switch to dark mode'
            )}
            title={t(
              isDark ? 'التحويل إلى الوضع النهاري' : 'التحويل إلى الوضع الليلي',
              isDark ? 'Switch to light mode' : 'Switch to dark mode'
            )}
            className="flex items-center justify-center w-9 h-9 rounded-xl text-[#1A241C] dark:text-[#F3EFE6] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23] border border-transparent hover:border-[#E0D9CB] dark:border-[#243628] transition-colors touch-target cursor-pointer print:hidden"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-[#EBB34D] transition-transform duration-200 hover:rotate-45" />
            ) : (
              <Moon className="w-4 h-4 text-[#1C291E] transition-transform duration-200 hover:-rotate-12" />
            )}
          </button>

          {/* PWA Install Button (Relocated from floating card) */}
          {!isStandalone && (
            <button
              type="button"
              onClick={promptInstall}
              aria-label={t('تثبيت تطبيق ECO', 'Install ECO App')}
              title={t('تثبيت تطبيق ECO', 'Install ECO App')}
              className="flex items-center justify-center w-9 h-9 rounded-xl text-[#1A241C] dark:text-[#F3EFE6] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23] border border-transparent hover:border-[#E0D9CB] dark:border-[#243628] transition-colors touch-target cursor-pointer print:hidden relative group"
            >
              <Download className="w-4 h-4 text-[#D99B26] dark:text-[#EBB34D] transition-transform duration-200 group-hover:scale-110" />
              {canInstall && (
                <span className="absolute top-2 end-2 w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              )}
            </button>
          )}

          {/* Notification Bell */}
          <button
            className="relative flex items-center justify-center w-9 h-9 rounded-xl text-[#1A241C] dark:text-[#F3EFE6] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23] border border-transparent hover:border-[#E0D9CB] dark:border-[#243628] transition-colors"
            aria-label={t('الإشعارات والتنبيهات', 'Notifications')}
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2.5 end-2.5 w-2 h-2 rounded-full bg-[#D99B26] dark:bg-[#EBB34D] ring-2 ring-[#FBF9F5] dark:ring-[#0E1610] animate-pulse" />
          </button>

          <div className="h-6 w-px bg-[#E0D9CB] dark:bg-[#243628] mx-0.5" />

          {/* Interactive User Profile Pill & Dropdown */}
          <div className="relative" ref={userDropdownRef}>
            <button
              onClick={() => setUserDropdownOpen(prev => !prev)}
              className="flex items-center gap-2 ps-1 pe-2.5 py-1 rounded-xl bg-[#F3EFE6] dark:bg-[#17231A] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23] border border-[#E0D9CB] dark:border-[#243628] transition-all cursor-pointer shadow-xs touch-target"
              title={t('ملف المستخدم وإعدادات الحساب', 'User Profile & Account Settings')}
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#1C291E] to-[#D99B26] flex items-center justify-center text-[#FBF9F5] text-xs font-black shadow-xs shrink-0">
                {(user?.nameAr || currentUser.nameAr).charAt(0)}
              </div>
              <div className="hidden sm:block text-start leading-tight">
                <div className="text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] truncate max-w-[200px]">
                  {isRtl ? (user?.nameAr || 'مستخدم المنظومة') : (user?.nameEn || 'System User')}
                </div>
                <div className="flex items-center gap-1 text-[10px] font-semibold text-[#D99B26] dark:text-[#EBB34D]">
                  <span className="truncate max-w-[240px]">
                    {cleanArabicTitle(
                      user?.jobTitleAr?.includes('/')
                        ? user.jobTitleAr.split('/')[0].trim()
                        : (user?.jobTitleAr || user?.roleLabelAr || (user?.role === 'SUPER_ADMIN' ? 'مدير النظام العام' : 'إدارة الموارد البشرية'))
                    )}
                  </span>
                </div>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-[#5C665E] dark:text-[#8FA392] shrink-0 transition-transform duration-200 ${
                  userDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* User Profile Popover Dropdown */}
            {userDropdownOpen && (
              <div
                className="absolute top-full mt-2.5 w-80 sm:w-88 max-w-[calc(100vw-16px)] left-2 sm:left-4 origin-top-left rounded-2xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] shadow-2xl p-3 z-50 animate-in fade-in-50 zoom-in-95 duration-150 text-start"
              >
                {/* 1. Executive User Header Card */}
                <div className="p-3 rounded-xl bg-[#EAE4D7] dark:bg-[#121B14] border border-[#E0D9CB] dark:border-[#243628] flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#1C291E] to-[#D99B26] text-white flex items-center justify-center font-black text-base shadow-sm shrink-0">
                    {(user?.nameAr || currentUser.nameAr).charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-black text-[#1A241C] dark:text-[#F3EFE6] truncate">
                        {isRtl ? (user?.nameAr || currentUser.nameAr) : (user?.nameEn || currentUser.nameEn)}
                      </h4>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>{t('متصل', 'Online')}</span>
                      </div>
                    </div>
                    <p className="text-[11px] font-medium text-[#D99B26] dark:text-[#EBB34D] truncate mt-0.5">
                      {user?.jobTitleAr || user?.roleLabelAr || (user?.role === 'SUPER_ADMIN' ? 'مدير النظام العام / رئيس مجلس الإدارة' : 'إدارة الموارد البشرية')}
                    </p>
                    <p className="text-[10px] text-[#5C665E] dark:text-[#8FA392] truncate mt-0.5 font-mono">
                      {user?.email || 'user@hrsup.com'}
                    </p>
                  </div>
                </div>

                {/* 2. Functional Action Menu Items */}
                <div className="mt-2.5 pt-1 space-y-1">
                  {/* My Profile */}
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      setProfileModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23] transition-colors"
                  >
                    <User className="w-4 h-4 text-[#D99B26] dark:text-[#EBB34D]" />
                    <span className="flex-1 text-start">{t('الملف الشخصي وإعدادات الحساب', 'My Profile & Account')}</span>
                  </button>

                  {/* Security & Password */}
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      setPasswordModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23] transition-colors"
                  >
                    <Lock className="w-4 h-4 text-[#D99B26] dark:text-[#EBB34D]" />
                    <span className="flex-1 text-start">{t('الأمان وتغيير كلمة المرور', 'Security & Password')}</span>
                  </button>

                  {/* My Activity Log */}
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      setActivityDrawerOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23] transition-colors"
                  >
                    <History className="w-4 h-4 text-[#D99B26] dark:text-[#EBB34D]" />
                    <span className="flex-1 text-start">{t('سجل نشاطي وحركاتي', 'My Activity Log')}</span>
                  </button>

                  {/* Users & Permissions Matrix (Quick Manager - Strictly Gated by RBAC) */}
                  {(user?.id === 'usr_root_csuite_01' || user?.username === 'admin' || user?.email === 'admin@hrsup.com' || (hasPermission && (hasPermission('set.rbac.view') || hasPermission('set.rbac.edit') || hasPermission('settings.rbac.edit') || hasPermission('settings.view')))) && (
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        setPermissionsModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23] transition-colors"
                    >
                      <SlidersHorizontal className="w-4 h-4 text-[#D99B26] dark:text-[#EBB34D]" />
                      <span className="flex-1 text-start">{t('إدارة المستخدمين ومصفوفة الصلاحيات', 'Users & Permissions Matrix')}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 font-bold">
                        {t('إدارة', 'Admin')}
                      </span>
                    </button>
                  )}
                </div>

                {/* 3. Sign Out Trigger */}
                <div className="mt-2.5 pt-2 border-t border-[#E0D9CB] dark:border-[#243628]">
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 active:scale-98 transition-colors text-xs font-bold cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{t('تسجيل الخروج', 'Sign Out')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Render the 4 Executive Modals */}
      <UserProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
      <ChangePasswordModal
        isOpen={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
      />
      <UserActivityDrawer
        isOpen={activityDrawerOpen}
        onClose={() => setActivityDrawerOpen(false)}
      />
      <PermissionsManagerModal
        isOpen={permissionsModalOpen}
        onClose={() => setPermissionsModalOpen(false)}
      />
    </header>
  );
};
