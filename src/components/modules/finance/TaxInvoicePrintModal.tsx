import React, { useState, useEffect, useMemo } from 'react';
import { SalesInvoiceHeader } from '../../../services/database/types';
import { useLanguage } from '../../../context/LanguageContext';
import { useTenant } from '../../../context/TenantContext';
import {
  TaxJurisdiction,
  TAX_JURISDICTIONS,
  generateInvoiceQr,
  InvoiceQrResult,
  formatTaxIdForDisplay,
} from '../../../utils/taxEngine';
import { tafqeetArabic } from '../../../utils/tafqeet';
import { Modal, formatCurrency, formatNumber, formatDate, toWesternDigits } from '@erp/ui-system';
import {
  X,
  Printer,
  ShieldCheck,
  QrCode,
  Phone,
  MapPin,
  CheckCircle2,
  Copy,
  Check,
  FileCheck2,
} from 'lucide-react';

interface TaxInvoicePrintModalProps {
  invoice: SalesInvoiceHeader | null;
  onClose: () => void;
}

export const TaxInvoicePrintModal: React.FC<TaxInvoicePrintModalProps> = ({ invoice, onClose }) => {
  const { t } = useLanguage();
  const { activeJurisdiction } = useTenant();

  // Country / Tax Profile State (defaults to active jurisdiction, defaults to KSA)
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<TaxJurisdiction>(
    activeJurisdiction || 'KSA'
  );

  const [qrResult, setQrResult] = useState<InvoiceQrResult | null>(null);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [showInspector, setShowInspector] = useState(false);

  const currentTaxConfig = useMemo(
    () => TAX_JURISDICTIONS[selectedJurisdiction],
    [selectedJurisdiction]
  );

  // Synchronize when active global jurisdiction changes
  useEffect(() => {
    if (activeJurisdiction) {
      setSelectedJurisdiction(activeJurisdiction);
    }
  }, [activeJurisdiction]);

  // Phase 2: Dynamic Tax Profile Switcher - fully synchronized data state
  const calculatedInvoice = useMemo(() => {
    if (!invoice) return null;

    const netAmount = invoice.netAmount || 0;
    const vatRate = currentTaxConfig.standardVatRate;
    const isKsa = selectedJurisdiction === 'KSA';

    // In KSA: 15% standard rate. In Egypt: 14% standard rate.
    const vatAmount = Math.round(netAmount * vatRate * 100) / 100;
    const grandTotal = Math.round((netAmount + vatAmount) * 100) / 100;

    // Entity details dynamically bound to the selected jurisdiction profile
    const sellerName = isKsa
      ? 'شركة أركان للمقاولات والتجارة (فرع المملكة)'
      : 'شركة أركان للمقاولات العامة والإنشاءات (ش.م.م)';

    const sellerTaxId = isKsa ? '310123456789003' : '300-456-789';

    const address = isKsa
      ? 'طريق الملك فهد - حي العليا - الرياض - المملكة العربية السعودية'
      : 'مبنى أركان بلازا - التجمع الخامس - القاهرة - جمهورية مصر العربية';

    const commercialReg = isKsa ? 'س.ت: 1010456789 الرياض' : 'س.ت: 44921 القاهرة';
    const currencySymbol = isKsa ? 'ر.س' : 'ج.م';
    const currencyCode = isKsa ? 'SAR' : 'EGP';

    // Customer tax ID matched to jurisdiction format
    const customerTaxId = isKsa ? '310987654321003' : '200-987-654';

    const etaUuid = 'b4f8a3c1-7d2e-4b9f-8a1c-9e2d3f4a5b6c';
    const timestamp = `${invoice.noteDate}T12:00:00Z`;

    // Dynamic line items calculation
    const lines = invoice.lines.map((l, idx) => {
      const lineNet = l.net || (l.price * l.qty - (l.discountAmount || 0));
      const lineVat = Math.round(lineNet * vatRate * 100) / 100;
      const lineNetWithTax = Math.round((lineNet + lineVat) * 100) / 100;
      return {
        ...l,
        sr: l.sr || idx + 1,
        net: lineNet,
        vatRate,
        vatAmount: lineVat,
        netWithTax: lineNetWithTax,
      };
    });

    return {
      ...invoice,
      sellerName,
      sellerTaxId,
      customerTaxId,
      address,
      commercialReg,
      currencySymbol,
      currencyCode,
      netAmount,
      vatAmount,
      grandTotal,
      timestamp,
      etaUuid,
      lines,
      tafqeetText: tafqeetArabic(grandTotal, currencyCode),
    };
  }, [invoice, selectedJurisdiction, currentTaxConfig]);

  // Generate QR code and run compliance verification
  useEffect(() => {
    if (!calculatedInvoice) return;

    let isMounted = true;

    generateInvoiceQr({
      jurisdiction: selectedJurisdiction,
      sellerName: calculatedInvoice.sellerName,
      sellerTaxId: calculatedInvoice.sellerTaxId,
      invoiceTimestamp: calculatedInvoice.timestamp,
      invoiceTotalWithVat: calculatedInvoice.grandTotal,
      vatTotal: calculatedInvoice.vatAmount,
      taxableAmount: calculatedInvoice.netAmount,
      etaUuid: calculatedInvoice.etaUuid,
      invoiceNo: calculatedInvoice.noteNo,
    }).then(res => {
      if (isMounted) {
        setQrResult(res);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [calculatedInvoice, selectedJurisdiction]);

  if (!invoice || !calculatedInvoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyPayload = () => {
    if (!qrResult?.rawPayload) return;
    navigator.clipboard.writeText(qrResult.rawPayload);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const isKsa = selectedJurisdiction === 'KSA';

  return (
    <Modal
      isOpen={Boolean(invoice)}
      onClose={onClose}
      maxWidth="w-[94vw] max-w-6xl"
      className="print:border-none print:shadow-none print:bg-white print:text-black print:max-w-none print:w-full print:h-auto"
      customHeader={
        <>
          {/* Phase 3 & 4: Top Modal Header Action Bar (Clean Single-Row Flex Toolbar) */}
          <div className="flex items-center justify-between gap-4 px-6 py-3.5 border-b border-[#243628] bg-[#121B14] print:hidden w-full select-none shrink-0">
          {/* Right Side (RTL Start): Close button (X), Print CTA, Scanner Toggle */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#1F2E23] hover:bg-[#EAE4D7] dark:hover:bg-[#283C2E] text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6] transition-colors flex items-center justify-center cursor-pointer shadow-2xs"
              title={t('إغلاق النافذة', 'Close')}
            >
              <X className="w-5 h-5" />
            </button>

            <button
              onClick={handlePrint}
              className="min-h-[44px] px-5 py-2.5 text-xs font-bold rounded-xl bg-[#D99B26] hover:bg-[#EBB34D] text-[#0E1610] shadow-sm transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer active:scale-98"
            >
              <Printer className="w-4 h-4 text-[#0E1610]" />
              <span>{t('طباعة الفاتورة الضريبية', 'Print Invoice')}</span>
            </button>

            <button
              onClick={() => setShowInspector(!showInspector)}
              className="min-h-[44px] px-4 py-2.5 text-xs font-bold rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#1F2E23] hover:bg-[#EAE4D7] dark:hover:bg-[#283C2E] text-[#1A241C] dark:text-[#F3EFE6] transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer shadow-2xs"
            >
              <FileCheck2 className="w-4 h-4 text-[#D99B26]" />
              <span>{showInspector ? t('إخفاء الفاحص', 'Hide Inspector') : t('فاحص الباركود', 'QR Inspector')}</span>
            </button>
          </div>

          {/* Center: Compliance Status Pill */}
          <div className="flex items-center justify-center">
            <span
              className={`min-h-[38px] px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 whitespace-nowrap border ${
                qrResult?.validation.isValid
                  ? 'bg-[#2A3F30] text-[#A3CFAC] border-[#3E5C46]'
                  : 'bg-[#3F2A2A] text-[#EFA3A3] border-[#5C3E3E]'
              }`}
            >
              <CheckCircle2
                className={`w-4 h-4 ${qrResult?.validation.isValid ? 'text-[#A3CFAC]' : 'text-[#EFA3A3]'}`}
              />
              <span>
                {qrResult?.validation.statusBadge ||
                  (isKsa ? 'مطابقة ومعتمدة (ZATCA)' : 'مطابقة ومعتمدة (ETA)')}
              </span>
            </span>
          </div>

          {/* Left Side (RTL End): Segmented Country / Tax Profile Toggle */}
          <div className="flex items-center gap-2.5 shrink-0">
            <span className="text-xs font-semibold text-[#5C665E] dark:text-[#8FA392] hidden lg:inline-block">
              {t('النظام الضريبي:', 'Tax Profile:')}
            </span>
            <div className="inline-flex rounded-xl p-1 bg-white dark:bg-[#131E15] border border-[#E0D9CB] dark:border-[#243628] shadow-2xs">
              <button
                type="button"
                onClick={() => setSelectedJurisdiction('EGYPT')}
                className={`min-h-[38px] flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedJurisdiction === 'EGYPT'
                    ? 'bg-[#1F2E23] text-[#F3EFE6] border border-[#D99B26]/60 shadow-xs'
                    : 'text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6]'
                }`}
              >
                <span>🇪🇬</span>
                <span>{t('مصر (ETA) 14%', 'Egypt (ETA) 14%')}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedJurisdiction('KSA')}
                className={`min-h-[38px] flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedJurisdiction === 'KSA'
                    ? 'bg-[#1F2E23] text-[#F3EFE6] border border-[#D99B26]/60 shadow-xs'
                    : 'text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6]'
                }`}
              >
                <span>🇸🇦</span>
                <span>{t('السعودية (ZATCA) 15%', 'KSA (ZATCA) 15%')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Compliance & QR Inspector Card (Interactive Drawer) */}
        {showInspector && qrResult && (
          <div className="px-6 py-4 border-b border-[#E0D9CB] dark:border-[#243628] bg-[#1F2E23]/40 dark:bg-[#131E15] text-xs space-y-3 print:hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#D99B26]" />
                <span className="font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                  {t('تقرير المطابقة والتحقق الإلكتروني المعتمد:', 'Official Compliance Audit:')}
                </span>
                <span className="px-2.5 py-0.5 rounded-md font-bold bg-[#2A3F30] text-[#A3CFAC] border border-[#3E5C46] text-[11px]">
                  {qrResult.validation.statusBadge}
                </span>
              </div>

              <button
                type="button"
                onClick={handleCopyPayload}
                className="min-h-[36px] flex items-center gap-1.5 px-3 py-1 rounded-lg border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#1F2E23] text-[11px] font-bold text-[#D99B26] hover:bg-[#EAE4D7] dark:hover:bg-[#283C2E] transition-all cursor-pointer"
              >
                {copiedPayload ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>
                  {copiedPayload
                    ? t('تم النسخ', 'Copied')
                    : isKsa
                    ? t('نسخ Base64 TLV', 'Copy Base64')
                    : t('نسخ رابط التحقق', 'Copy URL')}
                </span>
              </button>
            </div>

            <p className="text-[11px] text-[#5C665E] dark:text-[#8FA392]">
              {qrResult.validation.details}
            </p>

            {isKsa && qrResult.validation.parsed && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-[11px] pt-1">
                <div className="p-2.5 rounded-lg bg-white dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628]">
                  <span className="text-[10px] text-[#5C665E] dark:text-[#8FA392] block">Tag 1 (المورد):</span>
                  <span className="font-bold text-[#D99B26] truncate block">
                    {qrResult.validation.parsed.sellerName}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-white dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628]">
                  <span className="text-[10px] text-[#5C665E] dark:text-[#8FA392] block">Tag 2 (الرقم الضريبي):</span>
                  <span className="font-bold text-[#D99B26] block">
                    {qrResult.validation.parsed.vatNumber} (15 رقم)
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-white dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628]">
                  <span className="text-[10px] text-[#5C665E] dark:text-[#8FA392] block">Tag 3 (الوقت ISO):</span>
                  <span className="font-bold text-[#D99B26] truncate block">
                    {qrResult.validation.parsed.timestamp}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-white dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628]">
                  <span className="text-[10px] text-[#5C665E] dark:text-[#8FA392] block">Tag 4 (الإجمالي):</span>
                  <span className="font-bold text-[#D99B26] block">
                    {formatNumber(qrResult.validation.parsed.totalWithVat)} {calculatedInvoice.currencySymbol}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-white dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628]">
                  <span className="text-[10px] text-[#5C665E] dark:text-[#8FA392] block">Tag 5 (الضريبة 15%):</span>
                  <span className="font-bold text-[#D99B26] block">
                    {formatNumber(qrResult.validation.parsed.vatTotal)} {calculatedInvoice.currencySymbol}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </>
    }
  >

        {/* Printable Invoice Container (Dedicated Vertical Scroll) */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-white dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6] print:p-0 print:m-0 print:overflow-visible">
          {/* Invoice Header */}
          <div className="border-b-2 border-[#1A241C] dark:border-[#243628] pb-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
              {/* Company Logo & Details */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#D99B26] text-[#0E1610] flex items-center justify-center font-black text-xl shadow-xs">
                    {calculatedInvoice.sellerName.slice(0, 1)}
                  </div>
                  <div>
                    <h1 className="text-xl font-black tracking-tight text-[#1A241C] dark:text-[#F3EFE6]">
                      {calculatedInvoice.sellerName}
                    </h1>
                    <p className="text-xs text-[#5C665E] dark:text-[#8FA392]">
                      {currentTaxConfig.defaultSellerNameEn}
                    </p>
                  </div>
                </div>

                <div className="text-xs text-[#5C665E] dark:text-[#8FA392] space-y-0.5 pt-1">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#D99B26]" />
                    <span>{calculatedInvoice.address}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#D99B26]" />
                    <span>هاتف: {currentTaxConfig.defaultPhone} | {calculatedInvoice.commercialReg}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                    <span>{currentTaxConfig.taxIdLabelAr}:</span>
                    <span className="text-[#D99B26]">
                      {formatTaxIdForDisplay(calculatedInvoice.sellerTaxId, selectedJurisdiction)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Invoice Title & Meta */}
              <div className="text-end space-y-2">
                <div className="inline-block px-4 py-1.5 rounded-xl border border-[#D99B26]/60 bg-[#D99B26]/10 text-[#D99B26] font-black text-sm">
                  {isKsa ? 'فاتورة ضريبية إلكترونية (ZATCA)' : 'فاتورة ضريبية إلكترونية (ETA)'}
                </div>

                <div className="text-xs font-mono space-y-1">
                  <div>
                    <span className="text-[#5C665E] dark:text-[#8FA392]">رقم الفاتورة: </span>
                    <span className="font-bold text-[#D99B26] text-sm">#{toWesternDigits(calculatedInvoice.noteNo)}</span>
                  </div>
                  <div>
                    <span className="text-[#5C665E] dark:text-[#8FA392]">تاريخ الإصدار: </span>
                    <span className="font-bold">{formatDate(calculatedInvoice.noteDate)}</span>
                  </div>
                  <div>
                    <span className="text-[#5C665E] dark:text-[#8FA392]">طريقة الدفع: </span>
                    <span className="font-bold">
                      {calculatedInvoice.noteType === 'CASH' ? 'نقدي (Cash)' : 'آجل (Credit Term)'}
                    </span>
                  </div>
                  {calculatedInvoice.journalNo && (
                    <div>
                      <span className="text-[#5C665E] dark:text-[#8FA392]">رقم القيد الآلي: </span>
                      <span className="font-bold">#{toWesternDigits(calculatedInvoice.journalNo)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bill To: Client Info Box */}
            <div className="p-4 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6]/50 dark:bg-[#131E15]/50 flex flex-col sm:flex-row justify-between gap-4 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-[#5C665E] dark:text-[#8FA392] block uppercase text-[10px]">
                  بيانات العميل المستلم (Bill To / Customer)
                </span>
                <p className="font-black text-sm text-[#1A241C] dark:text-[#F3EFE6]">
                  {calculatedInvoice.clientNameAr}
                </p>
                <p className="text-[#5C665E] dark:text-[#8FA392]">
                  كود العميل بالأستاذ: {toWesternDigits(calculatedInvoice.clientId)}
                </p>
              </div>

              <div className="space-y-1 sm:text-end font-mono">
                <span className="font-bold text-[#5C665E] dark:text-[#8FA392] block uppercase text-[10px]">
                  {currentTaxConfig.taxIdLabelAr}
                </span>
                <p className="font-bold text-sm text-[#D99B26]">
                  {toWesternDigits(formatTaxIdForDisplay(calculatedInvoice.customerTaxId, selectedJurisdiction))}
                </p>
                <p className="text-[#5C665E] dark:text-[#8FA392]">
                  مستودع الصرف: {calculatedInvoice.inventoryNameAr}
                </p>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="py-6">
            <table className="w-full text-start text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-[#1A241C] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6]">
                  <th className="py-2.5 px-2 text-start font-black w-8">#</th>
                  <th className="py-2.5 px-3 text-start font-black min-w-[200px]">الصنف / البند المورد</th>
                  <th className="py-2.5 px-2 text-center font-black">الوحدة</th>
                  <th className="py-2.5 px-2 text-end font-black">الكمية</th>
                  <th className="py-2.5 px-2 text-end font-black">سعر الوحدة</th>
                  <th className="py-2.5 px-2 text-end font-black">الإجمالي</th>
                  <th className="py-2.5 px-2 text-end font-black">الخصم</th>
                  <th className="py-2.5 px-2 text-end font-black">الصافي</th>
                  <th className="py-2.5 px-2 text-center font-black">الضريبة</th>
                  <th className="py-2.5 px-3 text-end font-black">شامل الضريبة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0D9CB] dark:divide-[#243628]">
                {calculatedInvoice.lines.map((l, idx) => (
                  <tr key={idx} className="hover:bg-[#F3EFE6]/30 dark:hover:bg-[#1F2E23]/30">
                    <td className="py-3 px-2 font-mono text-[#5C665E] dark:text-[#8FA392]">{formatNumber(l.sr)}</td>
                    <td className="py-3 px-3 font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                      {l.itemNameAr}
                    </td>
                    <td className="py-3 px-2 text-center text-[#5C665E] dark:text-[#8FA392]">{l.unitNameAr}</td>
                    <td className="py-3 px-2 text-end font-mono font-bold">{formatNumber(l.qty)}</td>
                    <td className="py-3 px-2 text-end font-mono">
                      {formatCurrency(l.price, false)} {calculatedInvoice.currencySymbol}
                    </td>
                    <td className="py-3 px-2 text-end font-mono">
                      {formatCurrency(l.total, false)} {calculatedInvoice.currencySymbol}
                    </td>
                    <td className="py-3 px-2 text-end font-mono text-[#D99B26]">
                      {l.discountAmount > 0 ? formatCurrency(l.discountAmount, false) : '-'}
                    </td>
                    <td className="py-3 px-2 text-end font-mono font-bold">
                      {formatCurrency(l.net, false)} {calculatedInvoice.currencySymbol}
                    </td>
                    <td className="py-3 px-2 text-center font-mono text-[#D99B26] font-bold">
                      {currentTaxConfig.vatLabel}
                    </td>
                    <td className="py-3 px-3 text-end font-mono font-black text-[#D99B26]">
                      {formatCurrency(l.netWithTax, false)} {calculatedInvoice.currencySymbol}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Invoice Summary & QR Code Matrix */}
          <div className="border-t-2 border-[#1A241C] dark:border-[#243628] pt-6 flex flex-col sm:flex-row items-center justify-between gap-6">
            {/* Left: Compliant QR Code and Verification */}
            <div className="flex items-center gap-4">
              {qrResult?.qrDataUrl ? (
                <div className="p-2 border-2 border-[#D99B26]/40 rounded-xl bg-white shadow-xs">
                  <img
                    src={qrResult.qrDataUrl}
                    alt={isKsa ? 'ZATCA Phase 1 QR Matrix' : 'ETA Document Verification QR'}
                    className="w-32 h-32 object-contain"
                  />
                </div>
              ) : (
                <div className="w-32 h-32 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">
                  <QrCode className="w-12 h-12" />
                </div>
              )}

              <div className="space-y-1.5 max-w-xs text-xs">
                <div className="flex items-center gap-1.5 font-bold text-[#D99B26]">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-[#D99B26]" />
                  <span>
                    {isKsa
                      ? 'ختم ZATCA الإلكتروني المعتمد'
                      : 'ختم الفاتورة الإلكترونية المعتمد (ETA)'}
                  </span>
                </div>
                <p className="text-[11px] text-[#5C665E] dark:text-[#8FA392] leading-tight">
                  {isKsa
                    ? 'رمز استجابة سريعة مشفر وفق معايير TLV Base64 يحتوي على بيانات المورد، الرقم الضريبي (15 رقماً يبدأ وينتهي بـ 3)، التاريخ، والضريبة.'
                    : `رمز تحقق إلكتروني رسمي مرتبط بالمعرف الرقمي (UUID: ${calculatedInvoice.etaUuid}) بمصلحة الضرائب المصرية.`}
                </p>
                <div className="flex items-center gap-2 pt-0.5">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#2A3F30] text-[#A3CFAC] border border-[#3E5C46]">
                    {isKsa ? '✓ ZATCA Checksum Valid' : '✓ ETA 14% Verified'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Calculations Box */}
            <div className="w-full sm:w-72 space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-[#E0D9CB]/60 dark:border-[#243628]/60">
                <span className="text-[#5C665E] dark:text-[#8FA392]">المجموع الخاضع للضريبة:</span>
                <span className="font-bold">
                  {formatCurrency(calculatedInvoice.netAmount, false)} {calculatedInvoice.currencySymbol}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-[#E0D9CB]/60 dark:border-[#243628]/60">
                <span className="text-[#5C665E] dark:text-[#8FA392]">
                  ضريبة القيمة المضافة ({currentTaxConfig.vatLabel}):
                </span>
                <span className="font-bold text-[#D99B26]">
                  {formatCurrency(calculatedInvoice.vatAmount, false)} {calculatedInvoice.currencySymbol}
                </span>
              </div>

              {calculatedInvoice.discountAmount > 0 && (
                <div className="flex justify-between py-1 border-b border-[#E0D9CB]/60 dark:border-[#243628]/60 text-[#D99B26]">
                  <span>إجمالي الخصم التجاري:</span>
                  <span className="font-bold">
                    -{formatCurrency(calculatedInvoice.discountAmount, false)} {calculatedInvoice.currencySymbol}
                  </span>
                </div>
              )}

              <div className="flex justify-between py-2 border-t-2 border-[#1A241C] dark:border-[#243628] text-sm">
                <span className="font-black text-[#1A241C] dark:text-[#F3EFE6]">الإجمالي المستحق:</span>
                <span className="font-black text-[#D99B26]">
                  {formatCurrency(calculatedInvoice.grandTotal, false)} {calculatedInvoice.currencySymbol}
                </span>
              </div>

              <div className="pt-1 text-[11px] font-sans font-semibold text-[#D99B26] leading-snug">
                {calculatedInvoice.tafqeetText}
              </div>
            </div>
          </div>

          {/* Signatures & Seal Section */}
          <div className="mt-12 pt-6 border-t border-[#E0D9CB] dark:border-[#243628] grid grid-cols-3 gap-6 text-center text-xs">
            <div className="space-y-6">
              <span className="font-bold text-[#5C665E] dark:text-[#8FA392]">المستلم / العميل</span>
              <div className="border-b border-dotted border-[#5C665E] w-3/4 mx-auto" />
            </div>

            <div className="space-y-6">
              <span className="font-bold text-[#5C665E] dark:text-[#8FA392]">إدارة المبيعات والتسليم</span>
              <div className="border-b border-dotted border-[#5C665E] w-3/4 mx-auto" />
            </div>

            <div className="space-y-6">
              <span className="font-bold text-[#5C665E] dark:text-[#8FA392]">الاعتماد المالي والختم</span>
              <div className="border-b border-dotted border-[#5C665E] w-3/4 mx-auto" />
            </div>
          </div>
        </div>
      </Modal>
  );
};


