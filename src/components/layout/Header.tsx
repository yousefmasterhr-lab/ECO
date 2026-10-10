import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTenant } from '../../context/TenantContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNavigation } from '../../context/NavigationContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

import {
  Building2,
  ChevronDown,
  Search,
  Bell,
  Check,
  Menu,
  Shield,
  X,
  Sun,
  Moon,
  LogOut,
  KeyRound
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    companies,
    selectedCompanyIds,
    toggleCompany,
    isAllSelected,
    toggleSelectAll,
    selectionSummaryAr,
    selectionSummaryEn
  } = useTenant();

  const { isRtl, t } = useLanguage();
  const { currentUser, toggleMobileDrawer, setSearchModalOpen } = useNavigation();
  const { isDark, toggleTheme } = useTheme();
  const { user, logout, switchUserRole, seedUsers } = useAuth();

  const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setCompanyDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
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

          {/* Platform Identity with Official Favicon SVG */}
          <div className="hidden sm:flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-[#1C291E] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] flex items-center justify-center shadow-xs">
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
            <div className="hidden lg:block">
              <span className="font-extrabold text-sm tracking-tight text-[#1A241C] dark:text-[#F3EFE6]">
                ECO <span className="text-[#D99B26] dark:text-[#EBB34D] font-black">ERP</span>
              </span>
            </div>
          </div>

          <div className="hidden sm:block h-6 w-px bg-[#E0D9CB] dark:bg-[#243628]" />

          {/* Multi-Select Company Selector Dropdown */}
          <div className="relative min-w-0" ref={dropdownRef}>
            <button
              onClick={() => setCompanyDropdownOpen(prev => !prev)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23] text-start transition-colors max-w-[240px] sm:max-w-[340px] md:max-w-[420px]"
            >
              <div className="w-6 h-6 rounded-lg bg-[#D99B26]/15 dark:bg-[#EBB34D]/15 text-[#D99B26] dark:text-[#EBB34D] flex items-center justify-center shrink-0">
                <Building2 className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1 truncate">
                <div className="text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] truncate flex items-center gap-1.5">
                  <span className="truncate">{isRtl ? selectionSummaryAr : selectionSummaryEn}</span>
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

        {/* Center / Search Trigger Button */}
        <div className="hidden md:flex flex-1 max-w-md mx-2">
          <button
            onClick={() => setSearchModalOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] hover:border-[#D99B26]/50 hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23] text-[#5C665E] dark:text-[#8FA392] text-xs transition-all shadow-inner"
          >
            <div className="flex items-center gap-2.5">
              <Search className="w-4 h-4 text-[#5C665E] dark:text-[#8FA392]" />
              <span>{t('البحث السريع في الأقسام والمستندات...', 'Quick search modules & records...')}</span>
            </div>
            <kbd className="hidden lg:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono font-semibold text-[#5C665E] dark:text-[#8FA392] bg-[#EAE4D7] dark:bg-[#1F2E23] border border-[#E0D9CB] dark:border-[#243628] rounded-md shadow-xs">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>
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
              title={t('ملف المستخدم والصلاحيات', 'User Profile & Permissions')}
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#1C291E] to-[#D99B26] flex items-center justify-center text-[#FBF9F5] text-xs font-black shadow-xs shrink-0">
                {currentUser.nameAr.charAt(0)}
              </div>
              <div className="hidden sm:block text-start leading-tight">
                <div className="text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] truncate max-w-[130px]">
                  {isRtl ? currentUser.nameAr : currentUser.nameEn}
                </div>
                <div className="flex items-center gap-1 text-[10px] font-semibold text-[#D99B26] dark:text-[#EBB34D]">
                  <Shield className="w-3 h-3 shrink-0" />
                  <span className="truncate max-w-[110px]">{isRtl ? currentUser.clearanceNameAr : currentUser.clearanceNameEn}</span>
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
                className="absolute top-full mt-2.5 w-80 sm:w-88 max-w-[calc(100vw-16px)] left-2 sm:left-4 origin-top-left rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-3.5 z-50 animate-in fade-in-50 zoom-in-95 duration-150 text-start"
              >
                {/* User Header Summary */}
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#1C291E] to-[#D99B26] text-white flex items-center justify-center font-black text-base shadow-sm shrink-0">
                    {currentUser.nameAr.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-black text-slate-100 truncate">
                      {isRtl ? currentUser.nameAr : currentUser.nameEn}
                    </h4>
                    <p className="text-[11px] text-slate-400 truncate">
                      {currentUser.email || 'admin@hrsup.com'}
                    </p>
                    <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400 text-[10px] font-bold border border-amber-500/30">
                        {isRtl ? currentUser.roleAr : currentUser.roleEn}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Role Switcher Grid */}
                <div className="mt-3 pt-2.5 border-t border-slate-800">
                  <div className="px-1 pb-2 flex items-center justify-between text-[11px] font-bold text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                      <span>{t('الأدوار والصلاحيات', 'Roles & Permissions')}</span>
                    </span>
                    <span className="text-[10px] text-amber-400 font-mono">
                      {seedUsers.length} {t('حسابات', 'Accounts')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto p-0.5">
                    {seedUsers.map(acc => {
                      const isActive = user?.role === acc.user.role;
                      return (
                        <button
                          key={acc.user.id}
                          onClick={() => {
                            switchUserRole(acc.user.role);
                            setUserDropdownOpen(false);
                          }}
                          className={`p-2.5 rounded-xl text-start text-xs transition-all flex flex-col justify-between border cursor-pointer ${
                            isActive
                              ? 'bg-amber-500/15 border-amber-500/80 text-amber-300 font-bold shadow-xs'
                              : 'bg-slate-800/50 border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full mb-1">
                            <span className="truncate font-bold">
                              {isRtl ? acc.user.roleLabelAr.split(' ')[0] : acc.user.role}
                            </span>
                            {isActive && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                          </div>
                          <span className="text-[10px] opacity-75 truncate">
                            {isRtl ? acc.user.nameAr.split(' ')[1] || acc.user.nameAr : acc.user.nameEn}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sign Out Trigger */}
                <div className="mt-3 pt-2.5 border-t border-slate-800">
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-rose-400 hover:bg-rose-500/10 active:scale-98 transition-colors text-xs font-bold cursor-pointer"
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
    </header>
  );
};
