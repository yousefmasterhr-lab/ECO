import React, { useState, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../../context/LanguageContext';
import { useFinancial } from '../../../context/FinancialContext';
import { useTenant } from '../../../context/TenantContext';
import { useDatabase } from '../../../services/federation/DatabaseContext';
import { SalesInvoiceHeader } from '../../../services/database/types';
import { SalesInvoiceModal } from './SalesInvoiceModal';
import { TaxInvoicePrintModal } from './TaxInvoicePrintModal';
import { formatCurrency, formatNumber, formatDate, toWesternDigits } from '../../../utils/formatters';
import {
  ShoppingCart,
  Plus,
  Search,
  RefreshCw,
  Printer,
  QrCode,
  CheckCircle2,
  TrendingUp,
  Building,
  Percent,
  Calendar,
  RotateCcw,
  Sparkles
} from 'lucide-react';

export const SalesModule: React.FC = () => {
  const { t } = useLanguage();
  const { activeDatabase } = useDatabase();
  const { salesInvoices, clients, refreshPhase3Data } = useFinancial();
  const { activeJurisdiction, setActiveJurisdiction, taxConfig } = useTenant();

  const [activeTab, setActiveTab] = useState<'INVOICES' | 'RETURNS' | 'CLIENTS'>('INVOICES');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'CASH' | 'CREDIT'>('ALL');
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<SalesInvoiceHeader | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    return salesInvoices.filter(inv => {
      const matchesSearch =
        inv.noteNo.toString().includes(searchTerm) ||
        inv.clientNameAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.vatNo.includes(searchTerm);
      const matchesType = typeFilter === 'ALL' || inv.noteType === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [salesInvoices, searchTerm, typeFilter]);

  // Aggregate metrics
  const totalSalesVolume = useMemo(() => {
    return salesInvoices.reduce((acc, inv) => acc + (inv.grandTotal || 0), 0);
  }, [salesInvoices]);

  const totalVatCollected = useMemo(() => {
    return salesInvoices.reduce((acc, inv) => acc + (inv.vatAmount || 0), 0);
  }, [salesInvoices]);

  const cashSalesTotal = useMemo(() => {
    return salesInvoices.filter(i => i.noteType === 'CASH').reduce((acc, inv) => acc + (inv.grandTotal || 0), 0);
  }, [salesInvoices]);

  const creditSalesTotal = useMemo(() => {
    return salesInvoices.filter(i => i.noteType === 'CREDIT').reduce((acc, inv) => acc + (inv.grandTotal || 0), 0);
  }, [salesInvoices]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshPhase3Data();
    setIsRefreshing(false);
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Top Banner: Sales & Invoicing Hub */}
      <div className="p-5 sm:p-6 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-gradient-to-r from-[#FBF9F5] via-[#F3EFE6] to-[#EAE4D7]/70 dark:from-[#17231A] dark:via-[#131E15] dark:to-[#0E1610] shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#059669]/15 text-[#059669] dark:text-[#34D399] border border-[#059669]/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {taxConfig.authorityBadgeAr}
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                {t('تجريبي (بيئة محاكاة الفوترة)', 'Preview (Sandbox Invoicing)')}
              </span>
              <span className="text-xs text-[#5C665E] dark:text-[#8FA392] font-mono">
                {activeDatabase} / Sales_Head & Details
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-[#1A241C] dark:text-[#F3EFE6] tracking-tight">
              {t('المبيعات والتجارة والفوترة الضريبية الذكية', 'Commercial Sales, Trade & Smart Tax Invoicing')}
            </h1>

            <p className="text-xs sm:text-sm text-[#5C665E] dark:text-[#8FA392] max-w-2xl leading-relaxed">
              {t(
                'إصدار فواتير المبيعات النقدية والآجلة، الخصم الآلي من أرصدة المستودعات، إنشاء رمز الاستجابة السريعة TLV، وتوليد القيود المحاسبية التلقائية للأستاذ العام.',
                'Issue cash and credit invoices with automatic warehouse stock decrements, ZATCA TLV QR code generation, and automated double-entry GL journal vouchers.'
              )}
            </p>
          </div>

          {/* Quick Actions & Jurisdiction Switcher */}
          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
            {/* Country/Tax Profile Selector */}
            <div className="inline-flex rounded-xl p-1 bg-white/80 dark:bg-[#1A241C]/80 border border-[#E0D9CB] dark:border-[#243628] shadow-2xs">
              <button
                type="button"
                onClick={() => setActiveJurisdiction('KSA')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeJurisdiction === 'KSA'
                    ? 'bg-[#3B7A57] text-white shadow-xs'
                    : 'text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C]'
                }`}
              >
                <span>🇸🇦</span>
                <span>ZATCA 15%</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveJurisdiction('EGYPT')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeJurisdiction === 'EGYPT'
                    ? 'bg-[#0D9488] text-white shadow-xs'
                    : 'text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C]'
                }`}
              >
                <span>🇪🇬</span>
                <span>ETA 14%</span>
              </button>
            </div>

            <button
              onClick={() => setIsInvoiceModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#059669] text-white hover:bg-[#047857] shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-emerald-100" />
              <span>{t('فاتورة مبيعات جديدة (+)', 'New Sales Invoice (+)')}</span>
            </button>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="w-9 h-9 rounded-xl flex items-center justify-center border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#1A241C] text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6] hover:bg-[#EAE4D7] dark:hover:bg-[#243628] transition-all cursor-pointer"
              title={t('تحديث البيانات', 'Refresh')}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#059669]' : ''}`} />
            </button>
          </div>
        </div>

        {/* 4 Sales KPI Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
          <div className="p-3.5 rounded-xl bg-white/80 dark:bg-[#1A241C]/80 border border-[#E0D9CB]/80 dark:border-[#243628]/80">
            <div className="flex items-center justify-between text-xs text-[#5C665E] dark:text-[#8FA392] mb-1">
              <span className="flex items-center gap-1">
                <span>{t('إجمالي المبيعات الشاملة', 'Total Sales Volume')}</span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">({t('تجريبي', 'Preview')})</span>
              </span>
              <ShoppingCart className="w-3.5 h-3.5 text-[#059669]" />
            </div>
            <div className="font-mono font-black text-lg text-[#1A241C] dark:text-[#F3EFE6] flex items-baseline gap-1.5">
              <span>{formatCurrency(totalSalesVolume, false)}</span>
              <span className="text-xs font-normal text-[#5C665E] dark:text-[#8FA392]">{taxConfig.currencySymbolAr}</span>
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-1">
              {formatNumber(salesInvoices.length)} {t('فواتير معتمدة (تجريبي)', 'Invoices (Preview)')}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/80 dark:bg-[#1A241C]/80 border border-[#E0D9CB]/80 dark:border-[#243628]/80">
            <div className="flex items-center justify-between text-xs text-[#5C665E] dark:text-[#8FA392] mb-1">
              <span className="flex items-center gap-1">
                <span>{t(`ضريبة القيمة المضافة (${taxConfig.vatLabel})`, `Output VAT (${taxConfig.vatLabel})`)}</span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">({t('تجريبي', 'Preview')})</span>
              </span>
              <Percent className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="font-mono font-black text-lg text-emerald-600 dark:text-emerald-400 flex items-baseline gap-1.5">
              <span>{formatCurrency(totalVatCollected, false)}</span>
              <span className="text-xs font-normal text-[#5C665E] dark:text-[#8FA392]">{taxConfig.currencySymbolAr}</span>
            </div>
            <div className="text-[11px] text-[#5C665E] dark:text-[#8FA392] mt-1">
              {t('مستحقة للإقرار الضريبي', 'Due on Tax Return')}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/80 dark:bg-[#1A241C]/80 border border-[#E0D9CB]/80 dark:border-[#243628]/80">
            <div className="flex items-center justify-between text-xs text-[#5C665E] dark:text-[#8FA392] mb-1">
              <span className="flex items-center gap-1">
                <span>{t('المبيعات الآجلة (عملاء)', 'Credit Sales (Clients)')}</span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">({t('تجريبي', 'Preview')})</span>
              </span>
              <Building className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="font-mono font-black text-lg text-blue-600 dark:text-blue-400 flex items-baseline gap-1.5">
              <span>{formatCurrency(creditSalesTotal, false)}</span>
              <span className="text-xs font-normal text-[#5C665E] dark:text-[#8FA392]">{taxConfig.currencySymbolAr}</span>
            </div>
            <div className="text-[11px] text-[#5C665E] dark:text-[#8FA392] mt-1 font-mono">
              {formatNumber(Math.round((creditSalesTotal / (totalSalesVolume || 1)) * 100))}% {t('من إجمالي المبيعات', 'of total')}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/80 dark:bg-[#1A241C]/80 border border-[#E0D9CB]/80 dark:border-[#243628]/80">
            <div className="flex items-center justify-between text-xs text-[#5C665E] dark:text-[#8FA392] mb-1">
              <span className="flex items-center gap-1">
                <span>{t('المبيعات النقدية (الصندوق)', 'Cash Sales')}</span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">({t('تجريبي', 'Preview')})</span>
              </span>
              <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <div className="font-mono font-black text-lg text-amber-600 dark:text-amber-400 flex items-baseline gap-1.5">
              <span>{formatCurrency(cashSalesTotal, false)}</span>
              <span className="text-xs font-normal text-[#5C665E] dark:text-[#8FA392]">{taxConfig.currencySymbolAr}</span>
            </div>
            <div className="text-[11px] text-[#5C665E] dark:text-[#8FA392] mt-1 font-mono">
              {formatNumber(Math.round((cashSalesTotal / (totalSalesVolume || 1)) * 100))}% {t('سيولة نقدية مباشرة', 'instant cash')}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Module Sub-tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#F0ECE1] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] self-start">
          <button
            onClick={() => setActiveTab('INVOICES')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'INVOICES'
                ? 'bg-[#059669] text-white shadow-xs'
                : 'text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6]'
            }`}
          >
            {t('فواتير المبيعات الضريبية (تجريبي)', 'Sales Invoices (Preview)')} ({salesInvoices.length})
          </button>

          <button
            onClick={() => setActiveTab('RETURNS')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'RETURNS'
                ? 'bg-[#059669] text-white shadow-xs'
                : 'text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6]'
            }`}
          >
            {t('مردودات وإشعارات دائنة', 'Sales Returns')} (0)
          </button>

          <button
            onClick={() => setActiveTab('CLIENTS')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'CLIENTS'
                ? 'bg-[#059669] text-white shadow-xs'
                : 'text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6]'
            }`}
          >
            {t('سجل العملاء المعتمدين', 'Clients Registry')} ({clients.length})
          </button>
        </div>

        {/* Search & Type Filter (Only in Invoices Tab) */}
        {activeTab === 'INVOICES' && (
          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative min-w-[220px] max-w-xs">
              <Search className="w-3.5 h-3.5 absolute start-3 top-1/2 -translate-y-1/2 text-[#5C665E] dark:text-[#8FA392]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('بحث برقم الفاتورة أو العميل...', 'Search invoices...')}
                className="w-full text-xs font-medium ps-8 pe-3 py-2 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#1A241C] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-hidden focus:border-[#059669]"
              />
            </div>

            {/* Type Filter */}
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

      {/* Main Tab Content */}
      {activeTab === 'INVOICES' && (
        <div className="border border-[#E0D9CB] dark:border-[#243628] rounded-2xl overflow-hidden bg-white dark:bg-[#17261B] shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead className="bg-[#F4EFE6] dark:bg-[#152319] text-[#5C665E] dark:text-[#8FA392] font-bold border-b border-[#E0D9CB] dark:border-[#243628]">
                <tr>
                  <th className="py-3 px-4 text-start">{t('رقم الفاتورة والباركود', 'Invoice No & QR')}</th>
                  <th className="py-3 px-4 text-start">{t('تاريخ الإصدار', 'Date')}</th>
                  <th className="py-3 px-4 text-start">{t('العميل المستلم', 'Customer')}</th>
                  <th className="py-3 px-4 text-center">{t('طريقة الدفع', 'Payment Method')}</th>
                  <th className="py-3 px-4 text-end">{t('الصافي الخاضع', 'Net Taxable')}</th>
                  <th className="py-3 px-4 text-end text-emerald-600">{t('ضريبة 15%', 'VAT 15%')}</th>
                  <th className="py-3 px-4 text-end font-black">{t('الإجمالي الشامل', 'Grand Total')}</th>
                  <th className="py-3 px-4 text-center">{t('حالة الترحيل والقيد', 'GL Journal')}</th>
                  <th className="py-3 px-4 text-center">{t('إجراءات الطباعة والـ QR', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0D9CB]/60 dark:divide-[#243628]/60">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-[#5C665E] dark:text-[#8FA392]">
                      <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p>{t('لا توجد فواتير مبيعات مطابقة لمعايير البحث', 'No sales invoices found')}</p>
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => (
                    <tr
                      key={inv.id}
                      className="hover:bg-[#FDFBF7] dark:hover:bg-[#121B14]/40 transition-colors cursor-pointer group"
                      onClick={() => setSelectedInvoiceForPrint(inv)}
                    >
                      {/* Invoice No */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-[#059669]/10 text-[#059669] flex items-center justify-center">
                            <QrCode className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-mono font-bold text-xs text-[#1A241C] dark:text-[#F3EFE6] block">
                              #{toWesternDigits(inv.noteNo)}
                            </span>
                            <span className="text-[10px] text-[#5C665E] dark:text-[#8FA392] font-mono">
                              {formatNumber(inv.lines?.length || 1)} {t('بنود أصناف', 'items')}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 font-mono text-[11px] text-[#5C665E] dark:text-[#8FA392]">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#5C665E]" />
                          <span>{formatDate(inv.noteDate)}</span>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                          {inv.clientNameAr}
                        </div>
                        {inv.vatNo && (
                          <div className="text-[10px] font-mono text-[#5C665E] dark:text-[#8FA392]">
                            ض: {toWesternDigits(inv.vatNo)}
                          </div>
                        )}
                      </td>

                      {/* Payment Terms */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            inv.noteType === 'CREDIT'
                              ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20'
                              : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {inv.noteType === 'CREDIT' ? t('آجل (عميل)', 'Credit') : t('نقدي (صندوق)', 'Cash')}
                        </span>
                      </td>

                      {/* Net */}
                      <td className="py-3 px-4 text-end font-mono font-bold text-xs">
                        {formatCurrency(inv.netAmount, false)} <span className="text-[10px] font-normal text-[#5C665E] dark:text-[#8FA392]">{taxConfig.currencySymbolAr}</span>
                      </td>

                      {/* VAT */}
                      <td className="py-3 px-4 text-end font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(inv.vatAmount, false)} <span className="text-[10px] font-normal text-[#5C665E] dark:text-[#8FA392]">{taxConfig.currencySymbolAr}</span>
                      </td>

                      {/* Grand Total */}
                      <td className="py-3 px-4 text-end font-mono font-black text-xs text-[#059669] dark:text-[#34D399]">
                        {formatCurrency(inv.grandTotal, false)} <span className="text-[10px] font-normal text-[#5C665E] dark:text-[#8FA392]">{taxConfig.currencySymbolAr}</span>
                      </td>

                      {/* GL Journal Status */}
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-mono font-bold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>قيد آلي #{toWesternDigits(inv.journalNo || '9001')}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setSelectedInvoiceForPrint(inv)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#121B14] hover:border-[#059669] text-[#1A241C] dark:text-[#F3EFE6] text-xs font-bold transition-all shadow-2xs cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5 text-[#059669]" />
                          <span>{t('طباعة ضريبية', 'Print Tax')}</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Sales Returns (Credit Notes) */}
      {activeTab === 'RETURNS' && (
        <div className="p-8 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#17261B] text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-600 mx-auto flex items-center justify-center">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="font-bold text-sm text-[#1A241C] dark:text-[#F3EFE6]">
              {t('إدارة مردودات المبيعات والإشعارات الدائنة', 'Sales Returns & Credit Notes')}
            </h3>
            <p className="text-xs text-[#5C665E] dark:text-[#8FA392]">
              {t(
                'إصدار إشعارات دائنة ضريبية معتمدة وفق متطلبات هيئة الزكاة والضريبة، مع الإرجاع الفوري للكميات إلى رصيد المستودع وعكس القيود المحاسبية.',
                'Issue certified tax credit notes with automated stock re-crediting and reverse GL postings.'
              )}
            </p>
          </div>
          <button
            onClick={() => setIsInvoiceModalOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#E0D9CB]/50 dark:bg-[#243628] text-[#1A241C] dark:text-[#F3EFE6] hover:bg-[#E0D9CB] cursor-pointer"
          >
            {t('تحرير إشعار دائن جديد (-)', 'Issue Credit Note')}
          </button>
        </div>
      )}

      {/* Tab 3: Clients Registry */}
      {activeTab === 'CLIENTS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client) => (
            <div
              key={client.clientId}
              className="p-4 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#17261B] space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-sm text-[#1A241C] dark:text-[#F3EFE6]">
                    {client.nameAr}
                  </h4>
                  <span className="text-[11px] font-mono text-[#5C665E] dark:text-[#8FA392]">
                    كود الحساب: {toWesternDigits(client.clientId)}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
                  <Building className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-1.5 text-xs font-mono pt-2 border-t border-[#E0D9CB]/60 dark:border-[#243628]/60">
                <div className="flex justify-between">
                  <span className="text-[#5C665E]">الرقم الضريبي:</span>
                  <span className="font-bold">{client.vatNo ? toWesternDigits(client.vatNo) : 'غير مسجل'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5C665E]">الحد الائتماني:</span>
                  <span className="font-bold text-amber-600">{formatCurrency(client.limitAmount || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5C665E]">الرصيد المدين الحالي:</span>
                  <span className="font-bold text-emerald-600">{formatCurrency(client.currentBalance || 0)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Sales Invoice Modal */}
      <AnimatePresence>
        {isInvoiceModalOpen && (
          <SalesInvoiceModal
            onClose={() => setIsInvoiceModalOpen(false)}
            onSuccess={() => setIsInvoiceModalOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Official Tax Invoice Print Modal */}
      <AnimatePresence>
        {selectedInvoiceForPrint && (
          <TaxInvoicePrintModal
            invoice={selectedInvoiceForPrint}
            onClose={() => setSelectedInvoiceForPrint(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
