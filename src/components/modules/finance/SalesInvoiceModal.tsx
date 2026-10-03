import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useFinancial } from '../../../context/FinancialContext';
import {
  SalesInvoicePayload,
  SalesInvoiceLine
} from '../../../services/database/types';
import { tafqeetArabic } from '../../../utils/tafqeet';
import { Modal, formatCurrency, toWesternDigits } from '@erp/ui-system';
import { TaxJurisdiction, TAX_JURISDICTIONS } from '../../../utils/taxEngine';
import {
  ShoppingCart,
  Plus,
  Trash2,
  Calendar,
  AlertCircle,
  Package,
  User,
  Building,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface FormSalesInvoiceLine extends SalesInvoiceLine {
  skuCode?: string;
  currentStock?: number;
}

interface SalesInvoiceModalProps {
  onClose: () => void;
  onSuccess?: () => void;
  initialJurisdiction?: TaxJurisdiction;
}

export const SalesInvoiceModal: React.FC<SalesInvoiceModalProps> = ({
  onClose,
  onSuccess,
  initialJurisdiction = 'EGYPT'
}) => {
  const { t } = useLanguage();
  const { clients, items, saveSalesInvoice, salesInvoices } = useFinancial();

  const [jurisdiction, setJurisdiction] = useState<TaxJurisdiction>(initialJurisdiction);
  const currentTax = TAX_JURISDICTIONS[jurisdiction];

  // Auto-generate invoice note number
  const nextNoteNo = useMemo(() => {
    if (salesInvoices.length === 0) return 3001;
    const maxNo = Math.max(...salesInvoices.map(s => s.noteNo || 0));
    return maxNo + 1;
  }, [salesInvoices]);

  const [noteNo] = useState(nextNoteNo);
  const [noteDate, setNoteDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [noteType, setNoteType] = useState<'CREDIT' | 'CASH'>('CREDIT');
  const [clientId, setClientId] = useState<number>(() => clients[0]?.clientId || 1);
  const [inventoryNameAr, setInventoryNameAr] = useState('المستودع الرئيسي - القاهرة');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initial cart items
  const [lines, setLines] = useState<FormSalesInvoiceLine[]>(() => {
    const defaultItem = items[0];
    const defaultUnit = defaultItem?.units[0] || { unitId: 1, unitNameAr: 'طن', multiplier: 1 };
    const price = defaultItem?.retailPrice || 42000;
    const qty = 2;
    const total = qty * price;
    const vatRate = currentTax.standardVatRate;
    const vatAmount = Math.round(total * vatRate * 100) / 100;
    const netWithTax = total + vatAmount;

    return [
      {
        sr: 1,
        itemId: defaultItem?.itemId || 1001,
        skuCode: defaultItem?.skuCode || 'ITM-001',
        itemNameAr: defaultItem?.nameAr || 'حديد تسليح 16 مم عز الدخيلة',
        unitId: defaultUnit.unitId,
        unitNameAr: defaultUnit.unitNameAr,
        unitExchange: defaultUnit.multiplier,
        qty,
        price,
        total,
        discountAmount: 0,
        net: total,
        vatRate,
        vatAmount,
        netWithTax,
        currentStock: defaultItem?.stockBalance || 10
      }
    ];
  });

  // Handle Jurisdiction Switch
  const handleJurisdictionChange = (newJur: TaxJurisdiction) => {
    setJurisdiction(newJur);
  };

  // Add line item
  const handleAddLine = () => {
    const defaultItem = items[lines.length % items.length] || items[0];
    const defaultUnit = defaultItem?.units[0] || { unitId: 1, unitNameAr: 'عدد', multiplier: 1 };
    const price = defaultItem?.retailPrice || 1000;
    const qty = 1;
    const total = qty * price;
    const vatRate = currentTax.standardVatRate;
    const vatAmount = Math.round(total * vatRate * 100) / 100;
    const netWithTax = total + vatAmount;

    setLines(prev => [
      ...prev,
      {
        sr: prev.length + 1,
        itemId: defaultItem?.itemId || 1000 + prev.length + 1,
        skuCode: defaultItem?.skuCode || `ITM-00${prev.length + 1}`,
        itemNameAr: defaultItem?.nameAr || 'صنف جديد',
        unitId: defaultUnit.unitId,
        unitNameAr: defaultUnit.unitNameAr,
        unitExchange: defaultUnit.multiplier,
        qty,
        price,
        total,
        discountAmount: 0,
        net: total,
        vatRate,
        vatAmount,
        netWithTax,
        currentStock: defaultItem?.stockBalance || 0
      }
    ]);
  };

  // Remove line item
  const handleRemoveLine = (index: number) => {
    if (lines.length <= 1) return;
    setLines(prev => prev.filter((_, i) => i !== index));
  };

  // Update line field
  const handleLineChange = (index: number, field: keyof FormSalesInvoiceLine, value: any) => {
    setLines(prev =>
      prev.map((l, i) => {
        if (i !== index) return l;
        const updated = { ...l, [field]: value };

        if (field === 'itemId') {
          const matched = items.find(it => it.itemId === Number(value));
          if (matched) {
            const unit = matched.units[0] || { unitId: 1, unitNameAr: 'وحدة', multiplier: 1 };
            updated.itemId = matched.itemId;
            updated.skuCode = matched.skuCode;
            updated.itemNameAr = matched.nameAr;
            updated.unitId = unit.unitId;
            updated.unitNameAr = unit.unitNameAr;
            updated.unitExchange = unit.multiplier;
            updated.price = matched.retailPrice || 0;
            updated.currentStock = matched.stockBalance || 0;
          }
        }

        const qty = Number(updated.qty) || 0;
        const price = Number(updated.price) || 0;
        const discount = Number(updated.discountAmount) || 0;
        updated.total = Math.round(qty * price * 100) / 100;
        updated.net = Math.max(0, updated.total - discount);
        updated.vatRate = currentTax.standardVatRate;
        updated.vatAmount = Math.round(updated.net * updated.vatRate * 100) / 100;
        updated.netWithTax = updated.net + updated.vatAmount;
        return updated;
      })
    );
  };

  // Totals calculations
  const netAmount = useMemo(() => {
    return lines.reduce((sum, line) => sum + (line.net || line.total || 0), 0);
  }, [lines]);

  const vatAmount = useMemo(() => {
    return Math.round(netAmount * currentTax.standardVatRate * 100) / 100;
  }, [netAmount, currentTax]);

  const grandTotal = useMemo(() => {
    return Math.round((netAmount + vatAmount) * 100) / 100;
  }, [netAmount, vatAmount]);

  const tafqeetText = useMemo(() => {
    return tafqeetArabic(grandTotal, currentTax.currencyCode);
  }, [grandTotal, currentTax]);

  // Inventory validation checks
  const stockErrors = useMemo(() => {
    const errors: string[] = [];
    lines.forEach((line, idx) => {
      if (line.currentStock !== undefined && line.qty > line.currentStock) {
        errors.push(
          `السطر #${idx + 1} (${line.itemNameAr}): الكمية المطلوبة (${line.qty}) تتجاوز الرصيد المتاح (${line.currentStock} ${line.unitNameAr})!`
        );
      }
    });
    return errors;
  }, [lines]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (lines.length === 0 || grandTotal <= 0) {
      setErrorMessage(t('يجب أن تحتوي الفاتورة على صنف واحد على الأقل بمبلغ صحيح.', 'Invoice must have items.'));
      return;
    }

    if (stockErrors.length > 0) {
      setErrorMessage(t('لا يمكن اعتماد الفاتورة بسبب عجز في رصيد المستودع لبعض الأصناف.', 'Insufficient stock for items.'));
      return;
    }

    const selectedClient = clients.find(c => c.clientId === clientId);

    setIsSubmitting(true);
    try {
      const payloadLines: SalesInvoiceLine[] = lines.map(({ skuCode, currentStock, ...rest }, idx) => ({
        ...rest,
        sr: idx + 1
      }));

      const payload: SalesInvoicePayload = {
        noteNo,
        noteDate,
        noteType,
        clientId,
        clientNameAr: selectedClient?.nameAr || 'عميل نقدي',
        vatNo: selectedClient?.vatNo || currentTax.defaultCustomerTaxId,
        inventoryId: 1,
        inventoryNameAr,
        totalAmount: netAmount,
        discountAmount: 0,
        netAmount,
        vatAmount,
        grandTotal,
        netText: tafqeetText,
        lines: payloadLines
      };

      const result = await saveSalesInvoice(payload);
      if (result.success) {
        onSuccess?.();
        onClose();
      } else {
        setErrorMessage(result.error || t('فشل في حفظ الفاتورة.', 'Failed to save invoice.'));
      }
    } catch (err: any) {
      setErrorMessage(err.message || t('حدث خطأ أثناء الاتصال بالنظام.', 'Unexpected error.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      maxWidth="max-w-5xl"
      title={t('تحرير فاتورة مبيعات ضريبية إلكترونية جديدة', 'New Tax Sales Invoice')}
      subtitle={
        jurisdiction === 'KSA'
          ? t('فاتورة ضريبية متوافقة مع متطلبات هيئة الزكاة والضريبة (ZATCA 15%)', 'ZATCA Phase 1 Compliant (15% VAT)')
          : t('فاتورة ضريبية موثقة بمنظومة الفاتورة الإلكترونية المصرية (ETA 14%)', 'ETA E-Invoicing Compliant (14% VAT)')
      }
      icon={ShoppingCart}
      badge={
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#3D2D14] text-[#EBB34D] border border-[#5C431D]">
            #{toWesternDigits(noteNo)}
          </span>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#2A3F30] text-[#A3CFAC] border border-[#3E5C46]">
            {currentTax.countryNameAr} ({currentTax.vatLabel})
          </span>
        </div>
      }
      headerActions={
        <div className="inline-flex rounded-xl p-1 bg-[#121B14] border border-[#243628]">
          <button
            type="button"
            onClick={() => handleJurisdictionChange('KSA')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              jurisdiction === 'KSA'
                ? 'bg-[#3D2D14] text-[#EBB34D] border border-[#5C431D] shadow-xs'
                : 'text-[#8FA392] hover:text-[#F3EFE6]'
            }`}
          >
            <span>🇸🇦</span>
            <span>ZATCA 15%</span>
          </button>

          <button
            type="button"
            onClick={() => handleJurisdictionChange('EGYPT')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              jurisdiction === 'EGYPT'
                ? 'bg-[#2A3F30] text-[#A3CFAC] border border-[#3E5C46] shadow-xs'
                : 'text-[#8FA392] hover:text-[#F3EFE6]'
            }`}
          >
            <span>🇪🇬</span>
            <span>ETA 14%</span>
          </button>
        </div>
      }
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-bold rounded-xl border border-[#243628] bg-[#1F2E23] text-[#8FA392] hover:text-[#F3EFE6] transition-colors cursor-pointer"
          >
            {t('إلغاء', 'Cancel')}
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || grandTotal <= 0 || stockErrors.length > 0}
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl bg-[#D99B26] hover:bg-[#C58F38] text-[#0E1610] shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-[#0E1610]" />
            {isSubmitting ? (
              <span>{t('جاري الحفظ والترحيل...', 'Committing...')}</span>
            ) : (
              <span>{t('حفظ واعتماد الفاتورة (ترحيل المخزون والأستاذ)', 'Commit & Post Invoice')}</span>
            )}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-[#3F2A2A] border border-[#5C3E3E] text-[#EFA3A3] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {stockErrors.length > 0 && (
          <div className="p-3.5 rounded-xl bg-[#3D2D14] border border-[#5C431D] text-[#EBB34D] text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertTriangle className="w-4 h-4" />
              <span>تنبيه أرصدة المخزون:</span>
            </div>
            {stockErrors.map((err, i) => (
              <p key={i} className="text-[11px] list-disc list-inside">
                • {err}
              </p>
            ))}
          </div>
        )}

        {/* Invoice Parameters Form Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl border border-[#243628] bg-[#121B14]">
          {/* Note Type */}
          <div>
            <label className="block text-xs font-bold text-[#F3EFE6] mb-1.5">
              {t('نوع المعاملة', 'Payment Terms')}
            </label>
            <div className="flex p-0.5 bg-[#17231A] rounded-xl border border-[#243628]">
              <button
                type="button"
                onClick={() => setNoteType('CREDIT')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  noteType === 'CREDIT'
                    ? 'bg-[#1F2E23] text-[#A3CFAC] border border-[#3E5C46] shadow-xs'
                    : 'text-[#8FA392] hover:text-[#F3EFE6]'
                }`}
              >
                {t('آجل (Credit)', 'Credit')}
              </button>
              <button
                type="button"
                onClick={() => setNoteType('CASH')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  noteType === 'CASH'
                    ? 'bg-[#3D2D14] text-[#EBB34D] border border-[#5C431D] shadow-xs'
                    : 'text-[#8FA392] hover:text-[#F3EFE6]'
                }`}
              >
                {t('نقدي (Cash)', 'Cash')}
              </button>
            </div>
          </div>

          {/* Client Lookup */}
          <div>
            <label className="block text-xs font-bold text-[#F3EFE6] mb-1.5">
              {t('العميل / المستلم', 'Customer')} *
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-[#8FA392]" />
              <select
                value={clientId}
                onChange={e => setClientId(Number(e.target.value))}
                className="w-full ps-9 pe-3 py-2 text-xs font-semibold rounded-xl border border-[#243628] bg-[#17231A] text-[#F3EFE6] focus:outline-hidden focus:border-[#EBB34D] focus:ring-1 focus:ring-[#EBB34D]"
              >
                {clients.map(c => (
                  <option key={c.clientId} value={c.clientId}>
                    {c.nameAr}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Inventory Warehouse */}
          <div>
            <label className="block text-xs font-bold text-[#F3EFE6] mb-1.5">
              {t('مستودع الصرف', 'Warehouse')} *
            </label>
            <div className="relative">
              <Building className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-[#8FA392]" />
              <select
                value={inventoryNameAr}
                onChange={e => setInventoryNameAr(e.target.value)}
                className="w-full ps-9 pe-3 py-2 text-xs font-semibold rounded-xl border border-[#243628] bg-[#17231A] text-[#F3EFE6] focus:outline-hidden focus:border-[#EBB34D] focus:ring-1 focus:ring-[#EBB34D]"
              >
                <option value="المستودع الرئيسي - القاهرة">المستودع الرئيسي - القاهرة</option>
                <option value="مستودع الموقع - مراسي الساحل">مستودع الموقع - مراسي الساحل</option>
                <option value="المستودع المركزي - العاشر من رمضان">المستودع المركزي - العاشر من رمضان</option>
              </select>
            </div>
          </div>

          {/* Invoice Date */}
          <div>
            <label className="block text-xs font-bold text-[#F3EFE6] mb-1.5">
              {t('تاريخ الفاتورة', 'Invoice Date')} *
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-[#8FA392]" />
              <input
                type="date"
                required
                value={noteDate}
                onChange={e => setNoteDate(e.target.value)}
                className="w-full ps-9 pe-3 py-2 text-xs rounded-xl border border-[#243628] bg-[#17231A] text-[#F3EFE6] focus:outline-hidden focus:border-[#EBB34D] focus:ring-1 focus:ring-[#EBB34D] tabular-nums"
              />
            </div>
          </div>
        </div>

        {/* Items Cart Grid */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-[#EBB34D]" />
              <h3 className="text-xs font-bold text-[#F3EFE6]">
                {t('جدول بنود وأصناف الفاتورة (Sales Cart)', 'Invoice Items & Stock')}
              </h3>
            </div>

            <button
              type="button"
              onClick={handleAddLine}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-[#1F2E23] hover:bg-[#3D2D14] text-[#EBB34D] border border-[#243628] transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('إضافة بند جديد', 'Add Item')}</span>
            </button>
          </div>

          <div className="border border-[#243628] rounded-xl overflow-hidden bg-[#121B14]">
            <table className="w-full text-start text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#243628] bg-[#17231A] text-[#8FA392] font-bold">
                  <th className="py-2.5 px-3 text-start w-12">#</th>
                  <th className="py-2.5 px-3 text-start min-w-[200px]">{t('الصنف / المادة', 'Item')}</th>
                  <th className="py-2.5 px-3 text-center w-20">{t('الوحدة', 'Unit')}</th>
                  <th className="py-2.5 px-3 text-center w-24">{t('الرصيد المتاح', 'Stock')}</th>
                  <th className="py-2.5 px-3 text-center w-24">{t('الكمية', 'Qty')}</th>
                  <th className="py-2.5 px-3 text-end w-32">{t('سعر الوحدة', 'Price')}</th>
                  <th className="py-2.5 px-3 text-end w-32">{t('الإجمالي', 'Total')}</th>
                  <th className="py-2.5 px-3 text-center w-12">✕</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#243628]">
                {lines.map((line, idx) => {
                  const isOutOfStock = line.currentStock !== undefined && line.qty > line.currentStock;
                  return (
                    <tr
                      key={idx}
                      className={`hover:bg-[#1F2E23]/30 transition-colors ${
                        isOutOfStock ? 'bg-[#3F2A2A]/20' : ''
                      }`}
                    >
                      <td className="py-2 px-3 text-center font-bold text-[#8FA392] tabular-nums">
                        {idx + 1}
                      </td>

                      <td className="py-2 px-3">
                        <select
                          value={line.itemId}
                          onChange={e => handleLineChange(idx, 'itemId', Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-[#243628] bg-[#17231A] text-[#F3EFE6] focus:outline-hidden focus:border-[#EBB34D]"
                        >
                          {items.map(item => (
                            <option key={item.itemId} value={item.itemId}>
                              {item.skuCode} - {item.nameAr}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="py-2 px-3 text-center font-bold text-[#8FA392]">
                        {line.unitNameAr}
                      </td>

                      <td className="py-2 px-3 text-center font-bold tabular-nums">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                            isOutOfStock
                              ? 'bg-[#3F2A2A] text-[#EFA3A3] border border-[#5C3E3E]'
                              : 'bg-[#2A3F30] text-[#A3CFAC] border border-[#3E5C46]'
                          }`}
                        >
                          {line.currentStock ?? 0} {line.unitNameAr}
                        </span>
                      </td>

                      <td className="py-2 px-3">
                        <input
                          type="number"
                          min="1"
                          value={line.qty}
                          onChange={e => handleLineChange(idx, 'qty', Math.max(1, Number(e.target.value)))}
                          className={`w-full px-2 py-1.5 text-xs text-center font-bold rounded-lg border tabular-nums ${
                            isOutOfStock
                              ? 'border-rose-500 bg-[#3F2A2A] text-rose-300'
                              : 'border-[#243628] bg-[#17231A] text-[#F3EFE6] focus:border-[#EBB34D]'
                          }`}
                        />
                      </td>

                      <td className="py-2 px-3">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={line.price}
                          onChange={e => handleLineChange(idx, 'price', Math.max(0, Number(e.target.value)))}
                          className="w-full px-2 py-1.5 text-xs text-end font-bold rounded-lg border border-[#243628] bg-[#17231A] text-[#F3EFE6] focus:border-[#EBB34D] tabular-nums"
                        />
                      </td>

                      <td className="py-2 px-3 text-end font-bold text-xs text-[#EBB34D] tabular-nums">
                        {formatCurrency(line.total, false)}
                      </td>

                      <td className="py-2 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveLine(idx)}
                          disabled={lines.length <= 1}
                          className="text-rose-400 hover:text-rose-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Calculation Summary Footer Strip */}
        <div className="p-4 rounded-xl border border-[#243628] bg-[#121B14] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#8FA392] uppercase">
              {t('التفقيط المالي باللغة العربية (Tafqeet)', 'Arabic Tafqeet')}
            </span>
            <p className="text-xs font-semibold text-[#EBB34D]">
              {tafqeetText}
            </p>
          </div>

          <div className="flex items-center gap-5 text-xs self-end sm:self-auto tabular-nums">
            <div className="text-end">
              <span className="text-[10px] text-[#8FA392] block">الصافي الخاضع:</span>
              <span className="font-bold text-[#F3EFE6]">{formatCurrency(netAmount, true, currentTax.currencySymbolAr)}</span>
            </div>
            <div className="text-end">
              <span className="text-[10px] text-[#8FA392] block">ضريبة {currentTax.vatLabel}:</span>
              <span className="font-bold text-[#A3CFAC]">{formatCurrency(vatAmount, true, currentTax.currencySymbolAr)}</span>
            </div>
            <div className="text-end border-s border-[#243628] ps-4">
              <span className="text-[10px] text-[#8FA392] block">الإجمالي الشامل:</span>
              <span className="font-black text-sm text-[#EBB34D]">
                {formatCurrency(grandTotal, true, currentTax.currencySymbolAr)}
              </span>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
};
