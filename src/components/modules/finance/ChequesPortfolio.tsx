import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../../context/LanguageContext';
import { useFinancial } from '../../../context/FinancialContext';
import { useDatabase } from '../../../services/federation/DatabaseContext';
import { ChequeType, ChequeStatus } from '../../../services/database/types';
import { ChequeModal } from './ChequeModal';
import { formatCurrency, formatNumber, formatDate } from '@erp/ui-system';
import {
  Receipt,
  Search,
  Filter,
  Plus,
  RefreshCw,
  Building,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  ChevronDown
} from 'lucide-react';

export const ChequesPortfolio: React.FC = () => {
  const { t } = useLanguage();
  const { activeDatabase } = useDatabase();
  const { cheques, updateChequeStatus, refreshPhase2Data } = useFinancial();

  const [activeTab, setActiveTab] = useState<ChequeType>('RECEIVABLE');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [bankFilter, setBankFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeActionMenuId, setActiveActionMenuId] = useState<string | null>(null);

  // Partitioned cheques by active tab
  const tabCheques = cheques.filter(c => c.type === activeTab);

  // Available banks for filter
  const distinctBanks = Array.from(new Set(tabCheques.map(c => c.bankName).filter(Boolean)));

  // Filtered cheques
  const filteredCheques = tabCheques.filter(c => {
    if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
    if (bankFilter !== 'ALL' && c.bankName !== bankFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNo = c.chequeNo.toLowerCase().includes(q);
      const matchDrawer = c.drawerName.toLowerCase().includes(q);
      const matchBank = c.bankName.toLowerCase().includes(q);
      if (!matchNo && !matchDrawer && !matchBank) return false;
    }
    return true;
  });

  // Aggregate stats for active tab
  const totalAmount = tabCheques.reduce((sum, c) => sum + (c.amount || 0), 0);
  const underCollectionCheques = tabCheques.filter(c => c.status === 'UNDER_COLLECTION');
  const clearedCheques = tabCheques.filter(c => c.status === 'CLEARED');
  const bouncedCheques = tabCheques.filter(c => c.status === 'BOUNCED');

  const underCollectionAmount = underCollectionCheques.reduce((s, c) => s + (c.amount || 0), 0);
  const clearedAmount = clearedCheques.reduce((s, c) => s + (c.amount || 0), 0);
  const bouncedAmount = bouncedCheques.reduce((s, c) => s + (c.amount || 0), 0);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshPhase2Data();
    setIsRefreshing(false);
  };

  const handleStatusChange = async (chequeId: string, nextStatus: ChequeStatus) => {
    setActiveActionMenuId(null);
    await updateChequeStatus(chequeId, nextStatus);
  };

  const getStatusBadge = (status: ChequeStatus) => {
    switch (status) {
      case 'UNDER_COLLECTION':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
            <Clock className="w-3 h-3" />
            <span>{t('برسم التحصيل', 'Under Collection')}</span>
          </span>
        );
      case 'CLEARED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            <span>{t('تم التحصيل', 'Cleared')}</span>
          </span>
        );
      case 'BOUNCED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30">
            <AlertTriangle className="w-3 h-3" />
            <span>{t('مرتد / مرفوض', 'Bounced')}</span>
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-500/15 text-gray-700 dark:text-gray-400 border border-gray-500/30">
            <XCircle className="w-3 h-3" />
            <span>{t('ملغي', 'Cancelled')}</span>
          </span>
        );
      default:
        return null;
    }
  };

  const getMaturityWarning = (dueDateStr: string, status: ChequeStatus) => {
    if (status !== 'UNDER_COLLECTION') return null;
    const today = new Date().toISOString().split('T')[0];
    if (dueDateStr < today) {
      return (
        <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded">
          {t('متأخر الاستحقاق', 'Overdue')}
        </span>
      );
    }
    if (dueDateStr === today) {
      return (
        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
          {t('مستحق اليوم', 'Due Today')}
        </span>
      );
    }
    return null;
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Overview Banner */}
      <div className="p-5 sm:p-6 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-gradient-to-r from-[#FBF9F5] via-[#F3EFE6] to-[#EAE4D7]/70 dark:from-[#17231A] dark:via-[#131E15] dark:to-[#0E1610] shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#0D9488]/15 text-[#0D9488] dark:text-[#2DD4BF] border border-[#0D9488]/30">
                {t('محفظة الأوراق المالية والشيكات', 'Commercial Paper & Cheques Engine')}
              </span>
              <span className="text-xs text-[#5C665E] dark:text-[#8FA392] font-mono">
                {activeDatabase} / dbo.Cheques (1203001 & 2102001)
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-[#1A241C] dark:text-[#F3EFE6] tracking-tight">
              {t(
                'أوراق القبض والدفع ودورة حياة الشيكات',
                'Cheques Portfolio & Commercial Paper Lifecycle'
              )}
            </h1>

            <p className="text-xs sm:text-sm text-[#5C665E] dark:text-[#8FA392] max-w-2xl leading-relaxed">
              {t(
                'متابعة دورية للشيكات الواردة والصادرة، تواريخ الاستحقاق، البنوك المسحوب عليها، مع توليد القيود الوسيطة آلياً عند الإيداع أو التحصيل أو الارتداد.',
                'Track received & issued cheques, maturities, clearing cycles, and automated intermediate ledger entries.'
              )}
            </p>
          </div>

          {/* Top Actions */}
          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#0D9488] text-white hover:bg-[#0F766E] shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>
                {activeTab === 'RECEIVABLE'
                  ? t('تسجيل شيك وارد (+)', 'Register Received Cheque (+)')
                  : t('تحرير شيك صادر (-)', 'Issue Payable Cheque (-)')}
              </span>
            </button>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#141E16] text-[#1A241C] dark:text-[#F3EFE6] hover:bg-[#F3EFE6] dark:hover:bg-[#1C2A1E] transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#0D9488] ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{t('تحديث المحفظة', 'Sync')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Tab Toggle: Received vs Issued */}
      <div className="flex items-center justify-between border-b border-[#E0D9CB] dark:border-[#243628]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveTab('RECEIVABLE');
              setStatusFilter('ALL');
            }}
            className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'RECEIVABLE'
                ? 'border-[#0D9488] text-[#0D9488] dark:text-[#2DD4BF]'
                : 'border-transparent text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C]'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
            <span>{t('شيكات تحت التحصيل (الواردة / أوراق قبض)', 'Received Cheques (Portfolio)')}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
              {cheques.filter(c => c.type === 'RECEIVABLE').length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('PAYABLE');
              setStatusFilter('ALL');
            }}
            className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'PAYABLE'
                ? 'border-[#0D9488] text-[#0D9488] dark:text-[#2DD4BF]'
                : 'border-transparent text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C]'
            }`}
          >
            <ArrowUpRight className="w-4 h-4 text-amber-600" />
            <span>{t('شيكات صادرة للموردين (أوراق دفع)', 'Issued Cheques (Payable)')}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/10 text-amber-700 dark:text-amber-300">
              {cheques.filter(c => c.type === 'PAYABLE').length}
            </span>
          </button>
        </div>
      </div>

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Value */}
        <div className="p-4 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#141E16] space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#5C665E] dark:text-[#8FA392]">
              {t('إجمالي قيمة المحفظة', 'Total Portfolio Value')}
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#EBB34D]/15 text-[#D99B26] dark:text-[#EBB34D] flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-inter font-black text-[#1A241C] dark:text-[#F3EFE6] tabular-nums">
            {formatCurrency(totalAmount, false)} <span className="text-xs font-normal">ج.م</span>
          </div>
          <div className="text-[11px] text-[#5C665E] dark:text-[#8FA392]">
            <span className="font-inter font-bold tabular-nums">{formatNumber(tabCheques.length)}</span> {t('شيك إجمالي', 'total cheques')}
          </div>
        </div>

        {/* Under Collection */}
        <div className="p-4 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#141E16] space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#5C665E] dark:text-[#8FA392]">
              {t('برسم التحصيل / سارية', 'Under Collection')}
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#EBB34D]/15 text-[#D99B26] dark:text-[#EBB34D] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-inter font-black text-[#D99B26] dark:text-[#EBB34D] tabular-nums">
            {formatCurrency(underCollectionAmount, false)} <span className="text-xs font-normal">ج.م</span>
          </div>
          <div className="text-[11px] text-[#5C665E] dark:text-[#8FA392]">
            <span className="font-inter font-bold tabular-nums">{formatNumber(underCollectionCheques.length)}</span> {t('شيك لم يتم صرفه', 'pending cheques')}
          </div>
        </div>

        {/* Cleared */}
        <div className="p-4 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#141E16] space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#5C665E] dark:text-[#8FA392]">
              {t('تم تحصيلها بالبنك', 'Cleared in Bank')}
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#2A3F30] text-[#A3CFAC] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-inter font-black text-[#A3CFAC] tabular-nums">
            {formatCurrency(clearedAmount, false)} <span className="text-xs font-normal">ج.م</span>
          </div>
          <div className="text-[11px] text-[#5C665E] dark:text-[#8FA392]">
            <span className="font-inter font-bold tabular-nums">{formatNumber(clearedCheques.length)}</span> {t('شيك مقبوض ومودع', 'cleared')}
          </div>
        </div>

        {/* Bounced */}
        <div className="p-4 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#141E16] space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#5C665E] dark:text-[#8FA392]">
              {t('شيكات مرتدة / مرفوضة', 'Bounced Cheques')}
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#3F2A2A] text-[#EFA3A3] flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-inter font-black text-[#EFA3A3] tabular-nums">
            {formatCurrency(bouncedAmount, false)} <span className="text-xs font-normal">ج.م</span>
          </div>
          <div className="text-[11px] text-[#5C665E] dark:text-[#8FA392]">
            <span className="font-inter font-bold tabular-nums">{formatNumber(bouncedCheques.length)}</span> {t('شيك بدون رصيد', 'bounced')}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#141E16] flex flex-col sm:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-[#5C665E] dark:text-[#8FA392]" />
          <input
            type="text"
            placeholder={t(
              'بحث برقم الشيك، اسم العميل / الساحب، أو البنك المسحوب عليه...',
              'Search by cheque no, drawer, bank...'
            )}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full ps-9 pe-3 py-2 text-xs rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none focus:border-[#0D9488]"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-[#5C665E] dark:text-[#8FA392] shrink-0" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none focus:border-[#0D9488] w-full sm:w-auto"
          >
            <option value="ALL">{t('جميع الحالات', 'All Statuses')}</option>
            <option value="UNDER_COLLECTION">{t('برسم التحصيل', 'Under Collection')}</option>
            <option value="CLEARED">{t('تم التحصيل', 'Cleared')}</option>
            <option value="BOUNCED">{t('مرتد / مرفوض', 'Bounced')}</option>
            <option value="CANCELLED">{t('ملغي', 'Cancelled')}</option>
          </select>
        </div>

        {/* Bank Filter */}
        {distinctBanks.length > 0 && (
          <div className="w-full sm:w-auto">
            <select
              value={bankFilter}
              onChange={e => setBankFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none focus:border-[#0D9488] w-full sm:w-auto"
            >
              <option value="ALL">{t('كافة البنوك', 'All Banks')}</option>
              {distinctBanks.map(b => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Cheques DataGrid */}
      <div className="rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#121B14] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead>
              <tr className="border-b border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6]/70 dark:bg-[#1A241C]/70 text-[#5C665E] dark:text-[#8FA392]">
                <th className="py-3 px-3.5 text-start font-bold">{t('رقم الشيك', 'Cheque No.')}</th>
                <th className="py-3 px-3.5 text-start font-bold">
                  {activeTab === 'RECEIVABLE' ? t('الساحب / العميل', 'Drawer / Client') : t('المستفيد / المورد', 'Payee / Vendor')}
                </th>
                <th className="py-3 px-3.5 text-start font-bold">{t('البنك المسحوب عليه', 'Issuing Bank')}</th>
                <th className="py-3 px-3.5 text-start font-bold">{t('تاريخ التحرير', 'Issue Date')}</th>
                <th className="py-3 px-3.5 text-start font-bold">{t('تاريخ الاستحقاق', 'Due Date')}</th>
                <th className="py-3 px-3.5 text-end font-bold">{t('مبلغ الشيك', 'Amount')}</th>
                <th className="py-3 px-3.5 text-center font-bold">{t('حالة الشيك', 'Status')}</th>
                <th className="py-3 px-3.5 text-center font-bold">{t('الإجراءات', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0D9CB]/50 dark:divide-[#243628]/50">
              {filteredCheques.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#5C665E] dark:text-[#8FA392]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Receipt className="w-8 h-8 opacity-30 text-[#0D9488]" />
                      <p>{t('لا توجد شيكات مسجلة تطابق محددات البحث الحالية.', 'No cheques match the current filter.')}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCheques.map(cheque => (
                  <tr
                    key={cheque.id}
                    className="hover:bg-[#F3EFE6]/50 dark:hover:bg-[#17231A]/40 transition-colors"
                  >
                    <td className="py-3 px-3.5 font-mono font-bold text-[#0D9488] whitespace-nowrap">
                      {cheque.chequeNo}
                    </td>

                    <td className="py-3 px-3.5 font-semibold text-[#1A241C] dark:text-[#F3EFE6] max-w-[200px] truncate">
                      {cheque.drawerName}
                    </td>

                    <td className="py-3 px-3.5 text-[#5C665E] dark:text-[#8FA392] whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-[#0D9488] shrink-0" />
                        <span>{cheque.bankName}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3.5 font-inter text-[#5C665E] dark:text-[#8FA392] whitespace-nowrap tabular-nums">
                      {formatDate(cheque.issueDate)}
                    </td>

                    <td className="py-3 px-3.5 font-inter text-[#1A241C] dark:text-[#F3EFE6] whitespace-nowrap tabular-nums">
                      <div className="flex items-center gap-1.5">
                        <span>{formatDate(cheque.dueDate)}</span>
                        {getMaturityWarning(cheque.dueDate, cheque.status)}
                      </div>
                    </td>

                    <td className="py-3 px-3.5 text-end font-inter font-black text-[#1A241C] dark:text-[#F3EFE6] whitespace-nowrap tabular-nums">
                      {formatCurrency(cheque.amount, false)} <span className="text-[10px] font-normal text-[#8FA392]">ج.م</span>
                    </td>

                    <td className="py-3 px-3.5 text-center whitespace-nowrap">
                      {getStatusBadge(cheque.status)}
                    </td>

                    <td className="py-3 px-3.5 text-center whitespace-nowrap relative">
                      {/* State Machine Action Menu */}
                      <div className="inline-block text-start">
                        <button
                          onClick={() =>
                            setActiveActionMenuId(activeActionMenuId === cheque.id ? null : cheque.id)
                          }
                          className="p-1.5 rounded-lg border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#1A241C] text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] hover:border-[#0D9488] transition-colors cursor-pointer"
                          title={t('تعديل دورة حياة الشيك', 'Lifecycle Actions')}
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>

                        <AnimatePresence>
                          {activeActionMenuId === cheque.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: -4 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -4 }}
                              className="absolute end-3 top-10 z-30 w-44 rounded-xl bg-white dark:bg-[#141E16] border border-[#E0D9CB] dark:border-[#243628] shadow-xl py-1 text-xs"
                            >
                              <div className="px-3 py-1.5 text-[10px] font-bold text-[#5C665E] dark:text-[#8FA392] border-b border-[#E0D9CB]/50 dark:border-[#243628]/50">
                                {t('تغيير حالة الشيك:', 'Lifecycle Action:')}
                              </div>

                              {cheque.status !== 'UNDER_COLLECTION' && (
                                <button
                                  onClick={() => handleStatusChange(cheque.id, 'UNDER_COLLECTION')}
                                  className="w-full text-start px-3 py-1.5 text-amber-600 hover:bg-[#F3EFE6] dark:hover:bg-[#1A241C] flex items-center gap-2 cursor-pointer"
                                >
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>{t('برسم التحصيل', 'Set Pending')}</span>
                                </button>
                              )}

                              {cheque.status !== 'CLEARED' && (
                                <button
                                  onClick={() => handleStatusChange(cheque.id, 'CLEARED')}
                                  className="w-full text-start px-3 py-1.5 text-emerald-600 hover:bg-[#F3EFE6] dark:hover:bg-[#1A241C] flex items-center gap-2 cursor-pointer"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>{t('تم التحصيل بالبنك', 'Clear Cheque')}</span>
                                </button>
                              )}

                              {cheque.status !== 'BOUNCED' && (
                                <button
                                  onClick={() => handleStatusChange(cheque.id, 'BOUNCED')}
                                  className="w-full text-start px-3 py-1.5 text-rose-600 hover:bg-[#F3EFE6] dark:hover:bg-[#1A241C] flex items-center gap-2 cursor-pointer"
                                >
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  <span>{t('ارتداد الشيك (مرفوض)', 'Bounce Cheque')}</span>
                                </button>
                              )}

                              {cheque.status !== 'CANCELLED' && (
                                <button
                                  onClick={() => handleStatusChange(cheque.id, 'CANCELLED')}
                                  className="w-full text-start px-3 py-1.5 text-gray-500 hover:bg-[#F3EFE6] dark:hover:bg-[#1A241C] flex items-center gap-2 cursor-pointer"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>{t('إلغاء الشيك', 'Cancel Cheque')}</span>
                                </button>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cheque Modal */}
      {isModalOpen && (
        <ChequeModal
          initialType={activeTab}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};
