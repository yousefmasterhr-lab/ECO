import React, { useState, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../../context/LanguageContext';
import { useFinancial } from '../../../context/FinancialContext';
import { useDatabase } from '../../../services/federation/DatabaseContext';
import { PurchaseBillModal } from './PurchaseBillModal';
import {
  Truck,
  Plus,
  Search,
  RefreshCw,
  TrendingUp,
  Package,
  Building,
  Percent,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { formatCurrency, formatNumber, toWesternDigits } from '@erp/ui-system';

export const ProcurementModule: React.FC = () => {
  const { t } = useLanguage();
  const { activeDatabase } = useDatabase();
  const { purchaseBills, suppliers, items, refreshPhase3Data } = useFinancial();

  const [activeTab, setActiveTab] = useState<'BILLS' | 'SUPPLIERS' | 'COSTING'>('BILLS');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'CASH' | 'CREDIT'>('ALL');
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filtered bills
  const filteredBills = useMemo(() => {
    return purchaseBills.filter(bill => {
      const matchesSearch =
        bill.noteNo.toString().includes(searchTerm) ||
        bill.supplierNameAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.vatNo.includes(searchTerm);
      const matchesType = typeFilter === 'ALL' || bill.noteType === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [purchaseBills, searchTerm, typeFilter]);

  // Aggregate metrics
  const totalProcurementSpend = useMemo(() => {
    return purchaseBills.reduce((acc, bill) => acc + (bill.grandTotal || 0), 0);
  }, [purchaseBills]);

  const totalInputVat = useMemo(() => {
    return purchaseBills.reduce((acc, bill) => acc + (bill.vatAmount || 0), 0);
  }, [purchaseBills]);

  const creditBillsTotal = useMemo(() => {
    return purchaseBills.filter(b => b.noteType === 'CREDIT').reduce((acc, bill) => acc + (bill.grandTotal || 0), 0);
  }, [purchaseBills]);

  const cashBillsTotal = useMemo(() => {
    return purchaseBills.filter(b => b.noteType === 'CASH').reduce((acc, bill) => acc + (bill.grandTotal || 0), 0);
  }, [purchaseBills]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshPhase3Data();
    setIsRefreshing(false);
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Top Banner: Procurement & Inventory Costing */}
      <div className="p-5 sm:p-6 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-gradient-to-r from-[#FBF9F5] via-[#F3EFE6] to-[#EAE4D7]/70 dark:from-[#17231A] dark:via-[#131E15] dark:to-[#0E1610] shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {t('محرك تسعير المخزون بمتوسط التكلفة المرجح المتحرك', 'Moving Average Inventory Costing Engine')}
              </span>
              <span className="text-xs text-[#5C665E] dark:text-[#8FA392] font-mono">
                {activeDatabase} / Purchase_Head & dbo.Suppliers
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-[#1A241C] dark:text-[#F3EFE6] tracking-tight">
              {t('المشتريات وسجل الموردين وتسعير المخزون', 'Procurement, Supplier Payables & Inventory Costing')}
            </h1>

            <p className="text-xs sm:text-sm text-[#5C665E] dark:text-[#8FA392] max-w-2xl leading-relaxed">
              {t(
                'إدارة فواتير التوريد، تتبع ضريبة المدخلات القابلة للخصم، إعادة احتساب متوسط تكلفة الأصناف فور الاستلام المخزني، والتوليد الآلي لقيود اليومية العامة.',
                'Manage vendor bills, track deductible input VAT, recalculate weighted moving average item cost upon receipt, and post balancing double-entry GL journal vouchers.'
              )}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
            <button
              onClick={() => setIsBillModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-amber-100" />
              <span>{t('فاتورة مشتريات وتوريد جديدة (+)', 'New Procurement Bill (+)')}</span>
            </button>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="w-10 h-10 rounded-xl flex items-center justify-center border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#1A241C] text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6] hover:bg-[#EAE4D7] dark:hover:bg-[#243628] transition-all cursor-pointer"
              title={t('تحديث البيانات', 'Refresh')}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* 4 Procurement KPI Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
          <div className="p-3.5 rounded-xl bg-white/80 dark:bg-[#1A241C]/80 border border-[#E0D9CB]/80 dark:border-[#243628]/80">
            <div className="flex items-center justify-between text-xs text-[#5C665E] dark:text-[#8FA392] mb-1">
              <span>{t('إجمالي تكلفة المشتريات', 'Total Spend')}</span>
              <Truck className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <div className="font-inter font-black text-lg text-[#1A241C] dark:text-[#F3EFE6] tabular-nums">
              {formatCurrency(totalProcurementSpend)}
            </div>
            <div className="text-[11px] text-[#5C665E] dark:text-[#8FA392] font-inter tabular-nums mt-1 flex items-center justify-between">
              <span>{formatNumber(purchaseBills.length)} {t('فواتير', 'bills')}</span>
              <span>آجل: {formatCurrency(creditBillsTotal)} | نقدي: {formatCurrency(cashBillsTotal)}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/80 dark:bg-[#1A241C]/80 border border-[#E0D9CB]/80 dark:border-[#243628]/80">
            <div className="flex items-center justify-between text-xs text-[#5C665E] dark:text-[#8FA392] mb-1">
              <span>{t('ضريبة المدخلات (15%)', 'Input VAT (15%)')}</span>
              <Percent className="w-3.5 h-3.5 text-[#A3CFAC]" />
            </div>
            <div className="font-inter font-black text-lg text-[#A3CFAC] tabular-nums">
              {formatCurrency(totalInputVat)}
            </div>
            <div className="text-[11px] text-[#5C665E] dark:text-[#8FA392] mt-1">
              {t('قابلة للخصم الضريبي', 'Deductible on return')}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/80 dark:bg-[#1A241C]/80 border border-[#E0D9CB]/80 dark:border-[#243628]/80">
            <div className="flex items-center justify-between text-xs text-[#5C665E] dark:text-[#8FA392] mb-1">
              <span>{t('الموردون المسجلون', 'Registered Suppliers')}</span>
              <Building className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="font-mono font-black text-lg text-blue-600 dark:text-blue-400">
              {suppliers.length} <span className="text-xs font-normal">{t('مورد معتمد', 'Vendors')}</span>
            </div>
            <div className="text-[11px] text-[#5C665E] dark:text-[#8FA392] mt-1">
              {t('من قاعدة بيانات Tarabot', 'From Tarabot SQL')}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/80 dark:bg-[#1A241C]/80 border border-[#E0D9CB]/80 dark:border-[#243628]/80">
            <div className="flex items-center justify-between text-xs text-[#5C665E] dark:text-[#8FA392] mb-1">
              <span>{t('أصناف الخامات والمخزون', 'Inventory SKUs')}</span>
              <Package className="w-3.5 h-3.5 text-purple-600" />
            </div>
            <div className="font-mono font-black text-lg text-purple-600 dark:text-purple-400">
              {items.length} <span className="text-xs font-normal">{t('صنف خامات', 'SKUs')}</span>
            </div>
            <div className="text-[11px] text-[#5C665E] dark:text-[#8FA392] mt-1">
              {t('محدثة بالتكلفة المرجحة', 'Live weighted average')}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Module Sub-tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#F0ECE1] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] self-start">
          <button
            onClick={() => setActiveTab('BILLS')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'BILLS'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6]'
            }`}
          >
            {t('فواتير التوريد والمشتريات', 'Procurement Bills')} ({purchaseBills.length})
          </button>

          <button
            onClick={() => setActiveTab('SUPPLIERS')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'SUPPLIERS'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6]'
            }`}
          >
            {t('سجل الموردين المعتمدين', 'Suppliers Registry')} ({suppliers.length})
          </button>

          <button
            onClick={() => setActiveTab('COSTING')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'COSTING'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6]'
            }`}
          >
            {t('تسعير المخزون ومتوسط التكلفة', 'Inventory Costing Matrix')} ({items.length})
          </button>
        </div>

        {/* Search & Type Filter (Only in Bills Tab) */}
        {activeTab === 'BILLS' && (
          <div className="flex items-center gap-2">
            <div className="relative min-w-[220px] max-w-xs">
              <Search className="w-3.5 h-3.5 absolute start-3 top-1/2 -translate-y-1/2 text-[#5C665E] dark:text-[#8FA392]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('بحث برقم الفاتورة أو المورد...', 'Search bills...')}
                className="w-full text-xs font-medium ps-8 pe-3 py-2 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#1A241C] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-hidden focus:border-amber-600"
              />
            </div>

            <div className="flex items-center rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#1A241C] p-0.5">
              <button
                onClick={() => setTypeFilter('ALL')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                  typeFilter === 'ALL'
                    ? 'bg-[#E0D9CB]/50 dark:bg-[#243628] text-[#1A241C] dark:text-[#F3EFE6]'
                    : 'text-[#5C665E] dark:text-[#8FA392]'
                }`}
              >
                {t('الكل', 'All')}
              </button>
              <button
                onClick={() => setTypeFilter('CREDIT')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                  typeFilter === 'CREDIT'
                    ? 'bg-[#E0D9CB]/50 dark:bg-[#243628] text-blue-600'
                    : 'text-[#5C665E] dark:text-[#8FA392]'
                }`}
              >
                {t('آجل', 'Credit')}
              </button>
              <button
                onClick={() => setTypeFilter('CASH')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                  typeFilter === 'CASH'
                    ? 'bg-[#E0D9CB]/50 dark:bg-[#243628] text-amber-600'
                    : 'text-[#5C665E] dark:text-[#8FA392]'
                }`}
              >
                {t('نقدي', 'Cash')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tab 1: Procurement Bills */}
      {activeTab === 'BILLS' && (
        <div className="border border-[#E0D9CB] dark:border-[#243628] rounded-2xl overflow-hidden bg-white dark:bg-[#17261B] shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead className="bg-[#F4EFE6] dark:bg-[#152319] text-[#5C665E] dark:text-[#8FA392] font-bold border-b border-[#E0D9CB] dark:border-[#243628]">
                <tr>
                  <th className="py-3 px-4 text-start">{t('رقم الفاتورة والتوريد', 'Bill No')}</th>
                  <th className="py-3 px-4 text-start">{t('تاريخ الفاتورة', 'Date')}</th>
                  <th className="py-3 px-4 text-start">{t('المورد التجاري', 'Supplier')}</th>
                  <th className="py-3 px-4 text-center">{t('طريقة الدفع', 'Payment Method')}</th>
                  <th className="py-3 px-4 text-end">{t('صافي المشتريات', 'Net Taxable')}</th>
                  <th className="py-3 px-4 text-end text-emerald-600">{t('ضريبة مدخلات 15%', 'Input VAT 15%')}</th>
                  <th className="py-3 px-4 text-end font-black">{t('الإجمالي المستحق', 'Grand Total')}</th>
                  <th className="py-3 px-4 text-center">{t('حالة القيد المخزني والـ GL', 'GL Journal')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0D9CB]/60 dark:divide-[#243628]/60">
                {filteredBills.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-[#5C665E] dark:text-[#8FA392]">
                      <Truck className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p>{t('لا توجد فواتير مشتريات مطابقة لمعايير البحث', 'No procurement bills found')}</p>
                    </td>
                  </tr>
                ) : (
                  filteredBills.map((bill) => (
                    <tr
                      key={bill.id}
                      className="hover:bg-[#FDFBF7] dark:hover:bg-[#121B14]/40 transition-colors"
                    >
                      {/* Bill No */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                            <Truck className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-mono font-bold text-xs text-[#1A241C] dark:text-[#F3EFE6] block">
                              #{bill.noteNo}
                            </span>
                            <span className="text-[10px] text-[#5C665E] dark:text-[#8FA392] font-mono">
                              {bill.lines?.length || 1} {t('أصناف توريد', 'items')}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 font-mono text-[11px] text-[#5C665E] dark:text-[#8FA392]">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#5C665E]" />
                          <span>{bill.noteDate}</span>
                        </div>
                      </td>

                      {/* Supplier */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                          {bill.supplierNameAr}
                        </div>
                        {bill.vatNo && (
                          <div className="text-[10px] font-mono text-[#5C665E] dark:text-[#8FA392]">
                            ض: {bill.vatNo}
                          </div>
                        )}
                      </td>

                      {/* Payment Terms */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            bill.noteType === 'CREDIT'
                              ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20'
                              : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {bill.noteType === 'CREDIT' ? t('آجل (مورد)', 'Credit') : t('نقدي (صندوق)', 'Cash')}
                        </span>
                      </td>

                      {/* Net */}
                      <td className="py-3 px-4 text-end font-inter font-bold text-xs tabular-nums">
                        {formatCurrency(bill.netAmount)}
                      </td>

                      {/* VAT */}
                      <td className="py-3 px-4 text-end font-inter font-bold text-xs text-[#A3CFAC] tabular-nums">
                        {formatCurrency(bill.vatAmount)}
                      </td>

                      {/* Grand Total */}
                      <td className="py-3 px-4 text-end font-inter font-black text-xs text-[#D99B26] dark:text-[#EBB34D] tabular-nums">
                        {formatCurrency(bill.grandTotal)}
                      </td>

                      {/* GL Journal Status */}
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#2A3F30] text-[#A3CFAC] text-[10px] font-inter font-bold border border-[#243628] tabular-nums">
                          <CheckCircle2 className="w-3 h-3 text-[#A3CFAC]" />
                          <span>قيد مشتريات #{toWesternDigits(bill.journalNo || '9002')}</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Authentic Suppliers Registry */}
      {activeTab === 'SUPPLIERS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map((supplier) => (
            <div
              key={supplier.supplierId}
              className="p-4 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#17261B] space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-sm text-[#1A241C] dark:text-[#F3EFE6]">
                    {supplier.nameAr}
                  </h4>
                  <span className="text-[11px] font-inter text-[#5C665E] dark:text-[#8FA392] tabular-nums">
                    كود المورد: {toWesternDigits(supplier.supplierId)}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <Building className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-1.5 text-xs font-inter pt-2 border-t border-[#E0D9CB]/60 dark:border-[#243628]/60">
                <div className="flex justify-between">
                  <span className="text-[#5C665E]">الرقم الضريبي:</span>
                  <span className="font-bold tabular-nums">{toWesternDigits(supplier.vatNo || 'غير مسجل')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5C665E]">الهاتف / التواصل:</span>
                  <span className="tabular-nums">{toWesternDigits(supplier.tel || 'غير مسجل')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5C665E]">الرصيد الدائن المستحق:</span>
                  <span className="font-bold text-[#D99B26] dark:text-[#EBB34D] tabular-nums">{formatCurrency(supplier.currentBalance || 0)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Inventory Costing & Moving Average Matrix */}
      {activeTab === 'COSTING' && (
        <div className="border border-[#E0D9CB] dark:border-[#243628] rounded-2xl overflow-hidden bg-white dark:bg-[#17261B] shadow-xs">
          <div className="p-4 bg-[#F4EFE6] dark:bg-[#152319] border-b border-[#E0D9CB] dark:border-[#243628] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-600" />
              <span className="font-bold text-xs text-[#1A241C] dark:text-[#F3EFE6]">
                {t('مصفوفة تسعير المخزون بمتوسط التكلفة المرجح التراكمي', 'Weighted Moving Average Inventory Costing Matrix')}
              </span>
            </div>
            <span className="text-[11px] font-inter text-[#5C665E] dark:text-[#8FA392]">
              صيغة الحساب: New_Cost = ((Old_Stock * Old_Cost) + (In_Qty * In_Price)) / (Old_Stock + In_Qty)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead className="bg-[#FAF7F2] dark:bg-[#131E15] text-[#5C665E] dark:text-[#8FA392] font-bold border-b border-[#E0D9CB] dark:border-[#243628]">
                <tr>
                  <th className="py-3 px-4 text-start">{t('كود الصنف', 'SKU Code')}</th>
                  <th className="py-3 px-4 text-start">{t('اسم خامة البناء والمواصفة', 'Item Name')}</th>
                  <th className="py-3 px-4 text-start">{t('الوحدة الأساسية', 'Base Unit')}</th>
                  <th className="py-3 px-4 text-center">{t('الرصيد المخزني المتاح', 'Current Stock')}</th>
                  <th className="py-3 px-4 text-end">{t('آخر سعر شراء', 'Last Purchase Price')}</th>
                  <th className="py-3 px-4 text-end bg-amber-500/10 font-black text-amber-700 dark:text-amber-400">
                    {t('متوسط التكلفة المرجح (Average Cost)', 'Weighted Average Cost')}
                  </th>
                  <th className="py-3 px-4 text-end">{t('سعر البيع المعتمد (قطاعي)', 'Retail Selling Price')}</th>
                  <th className="py-3 px-4 text-center">{t('هامش الربح التقديري', 'Margin')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0D9CB]/60 dark:divide-[#243628]/60">
                {items.map((item) => {
                  const margin = item.retailPrice - item.averageCost;
                  const marginPercent = Math.round((margin / (item.averageCost || 1)) * 100);

                  return (
                    <tr key={item.itemId} className="hover:bg-[#FDFBF7] dark:hover:bg-[#121B14]/40 transition-colors">
                      <td className="py-3 px-4 font-inter font-bold text-xs text-[#5C665E] tabular-nums">
                        {toWesternDigits(item.skuCode)}
                      </td>
                      <td className="py-3 px-4 font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                        {item.nameAr}
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#5C665E]">
                        {item.units[0]?.unitNameAr || 'وحدة'}
                      </td>
                      <td className="py-3 px-4 text-center font-inter font-bold text-xs tabular-nums">
                        <span className={`px-2 py-0.5 rounded-full ${item.stockBalance < 100 ? 'bg-[#3F2A2A] text-[#EFA3A3] border border-[#243628]' : 'bg-[#2A3F30] text-[#A3CFAC] border border-[#243628]'}`}>
                          {formatNumber(item.stockBalance)} {item.units[0]?.unitNameAr || 'وحدة'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-end font-inter text-xs tabular-nums">
                        {formatCurrency(item.wholesalePrice)}
                      </td>
                      <td className="py-3 px-4 text-end font-inter font-black text-xs bg-amber-500/5 text-amber-700 dark:text-amber-400 tabular-nums">
                        {formatCurrency(item.averageCost)}
                      </td>
                      <td className="py-3 px-4 text-end font-inter font-bold text-xs text-[#D99B26] dark:text-[#EBB34D] tabular-nums">
                        {formatCurrency(item.retailPrice)}
                      </td>
                      <td className="py-3 px-4 text-center font-inter text-xs tabular-nums">
                        <span className="font-bold text-[#A3CFAC]">
                          +{formatCurrency(margin)} (+{formatNumber(marginPercent)}%)
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Procurement Bill Modal */}
      <AnimatePresence>
        {isBillModalOpen && (
          <PurchaseBillModal
            onClose={() => setIsBillModalOpen(false)}
            onSuccess={() => setIsBillModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
