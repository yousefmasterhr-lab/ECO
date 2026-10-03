import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useFinancial } from '../../../context/FinancialContext';
import {
  PurchaseBillPayload,
  PurchaseBillLine,
  ItemSKU
} from '../../../services/database/types';
import { tafqeetArabic } from '../../../utils/tafqeet';
import { Modal, formatCurrency, formatNumber, toWesternDigits } from '@erp/ui-system';
import {
  Truck,
  Plus,
  Trash2,
  Calendar,
  AlertCircle,
  Package,
  Building,
  CheckCircle2,
  TrendingUp,
  Receipt,
  Layers,
  ArrowRightLeft
} from 'lucide-react';

interface PurchaseBillModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export const PurchaseBillModal: React.FC<PurchaseBillModalProps> = ({ onClose, onSuccess }) => {
  const { t } = useLanguage();
  const { suppliers, items, savePurchaseBill, purchaseBills } = useFinancial();

  // Next bill number
  const nextNoteNo = useMemo(() => {
    if (purchaseBills.length === 0) return 8001;
    const maxNo = Math.max(...purchaseBills.map(b => b.noteNo || 0));
    return maxNo + 1;
  }, [purchaseBills]);

  const [noteNo] = useState(nextNoteNo);
  const [noteDate, setNoteDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [noteType, setNoteType] = useState<'CASH' | 'CREDIT'>('CREDIT');
  const [supplierId, setSupplierId] = useState<number>(suppliers[0]?.supplierId || 2101001);
  const [inventoryNameAr, setInventoryNameAr] = useState('المستودع الرئيسي - القاهرة');
  const [supplierInvoiceRef, setSupplierInvoiceRef] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Selected supplier
  const selectedSupplier = suppliers.find(s => s.supplierId === supplierId) || suppliers[0];

  // Bill Lines State
  const [lines, setLines] = useState<PurchaseBillLine[]>(() => {
    const defaultItem = items[0];
    const defaultUnit = defaultItem?.units[0] || { unitId: 1, unitNameAr: 'وحدة', multiplier: 1 };
    const price = defaultItem?.wholesalePrice || 80;
    const qty = 10;
    const total = qty * price;
    const vatAmount = Math.round(total * 0.15 * 100) / 100;
    const netWithTax = total + vatAmount;

    // Moving average calculation preview
    const currentStock = defaultItem?.stockBalance || 0;
    const oldCost = defaultItem?.averageCost || price;
    const baseQty = qty * defaultUnit.multiplier;
    const newCost = (currentStock + baseQty) > 0
      ? Math.round((((currentStock * oldCost) + (baseQty * (price / defaultUnit.multiplier))) / (currentStock + baseQty)) * 100) / 100
      : price;

    return [
      {
        sr: 1,
        itemId: defaultItem?.itemId || 1001,
        itemNameAr: defaultItem?.nameAr || 'صنف افتراضي',
        unitId: defaultUnit.unitId,
        unitNameAr: defaultUnit.unitNameAr,
        unitExchange: defaultUnit.multiplier,
        qty,
        price,
        total,
        vatRate: 0.15,
        vatAmount,
        netWithTax,
        oldCost,
        newCost,
      },
    ];
  });

  // Calculate Moving Average Cost for a given line
  const calculateNewCost = (item: ItemSKU, qty: number, unitMultiplier: number, unitPrice: number): { oldCost: number; newCost: number } => {
    const currentStock = item.stockBalance || 0;
    const oldCost = item.averageCost || item.wholesalePrice || unitPrice;
    const baseQty = qty * (unitMultiplier || 1);
    const basePrice = unitMultiplier > 0 ? unitPrice / unitMultiplier : unitPrice;

    if (currentStock + baseQty <= 0) {
      return { oldCost, newCost: oldCost };
    }

    const calculatedNewCost = ((currentStock * oldCost) + (baseQty * basePrice)) / (currentStock + baseQty);
    return {
      oldCost,
      newCost: Math.round(calculatedNewCost * 100) / 100,
    };
  };

  // Aggregates
  const totalAmount = useMemo(() => lines.reduce((s, l) => s + (l.total || 0), 0), [lines]);
  const vatAmount = useMemo(() => lines.reduce((s, l) => s + (l.vatAmount || 0), 0), [lines]);
  const grandTotal = useMemo(() => totalAmount + vatAmount, [totalAmount, vatAmount]);

  const tafqeetText = useMemo(() => {
    return grandTotal > 0 ? tafqeetArabic(grandTotal, 'EGP') : '';
  }, [grandTotal]);

  // Handle line change
  const handleItemChange = (index: number, itemIdStr: string) => {
    const itId = Number(itemIdStr);
    const item = items.find(i => i.itemId === itId);
    if (!item) return;

    const unit = item.units[0] || { unitId: 1, unitNameAr: 'وحدة', multiplier: 1 };
    const price = item.wholesalePrice || 0;
    const currentQty = lines[index].qty || 1;
    const total = currentQty * price;
    const vAmount = Math.round(total * 0.15 * 100) / 100;
    const { oldCost, newCost } = calculateNewCost(item, currentQty, unit.multiplier, price);

    const updated = [...lines];
    updated[index] = {
      ...updated[index],
      itemId: item.itemId,
      itemNameAr: item.nameAr,
      unitId: unit.unitId,
      unitNameAr: unit.unitNameAr,
      unitExchange: unit.multiplier,
      price,
      total,
      vatRate: 0.15,
      vatAmount: vAmount,
      netWithTax: total + vAmount,
      oldCost,
      newCost,
    };
    setLines(updated);
  };

  const handleUnitChange = (index: number, unitIdStr: string) => {
    const uId = Number(unitIdStr);
    const line = lines[index];
    const item = items.find(i => i.itemId === line.itemId);
    if (!item) return;

    const unit = item.units.find(u => u.unitId === uId) || item.units[0];
    const unitPrice = item.wholesalePrice * (unit?.multiplier || 1);
    const total = (line.qty || 1) * unitPrice;
    const vAmount = Math.round(total * 0.15 * 100) / 100;
    const { oldCost, newCost } = calculateNewCost(item, line.qty || 1, unit.multiplier, unitPrice);

    const updated = [...lines];
    updated[index] = {
      ...updated[index],
      unitId: unit.unitId,
      unitNameAr: unit.unitNameAr,
      unitExchange: unit.multiplier,
      price: unitPrice,
      total,
      vatAmount: vAmount,
      netWithTax: total + vAmount,
      oldCost,
      newCost,
    };
    setLines(updated);
  };

  const handleQtyPriceChange = (index: number, field: 'qty' | 'price', val: number) => {
    const updated = [...lines];
    const line = { ...updated[index] };
    const item = items.find(i => i.itemId === line.itemId);

    if (field === 'qty') line.qty = Math.max(0.001, val);
    if (field === 'price') line.price = Math.max(0, val);

    line.total = Math.round(line.qty * line.price * 100) / 100;
    line.vatAmount = Math.round(line.total * 0.15 * 100) / 100;
    line.netWithTax = line.total + line.vatAmount;

    if (item) {
      const { oldCost, newCost } = calculateNewCost(item, line.qty, line.unitExchange, line.price);
      line.oldCost = oldCost;
      line.newCost = newCost;
    }

    updated[index] = line;
    setLines(updated);
  };

  const handleAddLine = () => {
    const defaultItem = items[0];
    const defaultUnit = defaultItem?.units[0] || { unitId: 1, unitNameAr: 'وحدة', multiplier: 1 };
    const price = defaultItem?.wholesalePrice || 50;
    const qty = 1;
    const total = qty * price;
    const vAmount = Math.round(total * 0.15 * 100) / 100;

    let oldCost = defaultItem?.averageCost || price;
    let newCost = price;
    if (defaultItem) {
      const costs = calculateNewCost(defaultItem, qty, defaultUnit.multiplier, price);
      oldCost = costs.oldCost;
      newCost = costs.newCost;
    }

    setLines(prev => [
      ...prev,
      {
        sr: prev.length + 1,
        itemId: defaultItem?.itemId || 1001,
        itemNameAr: defaultItem?.nameAr || 'صنف جديد',
        unitId: defaultUnit.unitId,
        unitNameAr: defaultUnit.unitNameAr,
        unitExchange: defaultUnit.multiplier,
        qty,
        price,
        total,
        vatRate: 0.15,
        vatAmount: vAmount,
        netWithTax: total + vAmount,
        oldCost,
        newCost,
      },
    ]);
  };

  const handleRemoveLine = (index: number) => {
    if (lines.length <= 1) return;
    setLines(prev => prev.filter((_, i) => i !== index).map((l, i) => ({ ...l, sr: i + 1 })));
  };

  // Submit
  const handleSubmit = async () => {
    if (lines.length === 0 || grandTotal <= 0) {
      setErrorMessage('يجب إضافة صنف واحد على الأقل بمبلغ صحيح');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const payload: PurchaseBillPayload = {
      noteNo,
      noteDate,
      noteType,
      supplierId: selectedSupplier.supplierId,
      supplierNameAr: selectedSupplier.nameAr,
      vatNo: selectedSupplier.vatNo || '',
      inventoryId: 1,
      inventoryNameAr,
      totalAmount,
      discountAmount: 0,
      netAmount: totalAmount,
      vatAmount,
      grandTotal,
      netText: tafqeetText,
      lines: lines.map(l => ({
        ...l,
        total: Math.round(l.total * 100) / 100,
        vatAmount: Math.round(l.vatAmount * 100) / 100,
        netWithTax: Math.round(l.netWithTax * 100) / 100,
      })),
    };

    try {
      const res = await savePurchaseBill(payload);
      if (res.success) {
        if (onSuccess) onSuccess();
        onClose();
      } else {
        setErrorMessage(res.error || 'حدث خطأ أثناء حفظ فاتورة المشتريات');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'فشل الاتصال بمحرك قواعد البيانات');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      maxWidth="max-w-6xl"
      title={t('فاتورة مشتريات وتوريد مخزني جديدة', 'New Procurement Bill & Stock Receipt')}
      subtitle={t(
        'تسجيل فواتير الموردين، احتساب ضريبة المدخلات، وتحديث متوسط التكلفة المرجح آلياً',
        'Vendor bill entry, input VAT calculation, and automated moving average cost update'
      )}
      icon={Truck}
      badge={
        <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#3D2D14] text-[#EBB34D] border border-[#5C431D]">
          #{toWesternDigits(noteNo)}
        </span>
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
            disabled={isSubmitting || grandTotal <= 0}
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl bg-[#D99B26] hover:bg-[#C58F38] text-[#0E1610] shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-[#0E1610]" />
            {isSubmitting ? (
              <span>{t('جاري الحفظ والتسعير...', 'Processing & Costing...')}</span>
            ) : (
              <span>{t('حفظ واعتماد الفاتورة (تحديث متوسط التكلفة والترحيل)', 'Commit Bill & Update Costs')}</span>
            )}
          </button>
        </>
      }
    >
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="p-6 space-y-6">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Top Metadata Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-xl bg-white dark:bg-[#17261B] border border-[#E0D9CB] dark:border-[#243628]">
            {/* Supplier Selection */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-[#5C665E] dark:text-[#8FA392] flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-amber-500" />
                {t('المورد التجاري المعتمد', 'Authorized Vendor / Supplier')}
              </label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(Number(e.target.value))}
                className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-[#E0D9CB] dark:border-[#243628] bg-[#FDFBF7] dark:bg-[#121B14] text-[#1F2421] dark:text-[#EAEFEA] focus:outline-hidden focus:border-amber-500"
              >
                {suppliers.map(s => (
                  <option key={s.supplierId} value={s.supplierId}>
                    {s.nameAr} {s.vatNo ? `(ض: ${toWesternDigits(s.vatNo)})` : ''} - رصيد: {formatCurrency(s.currentBalance || 0)}
                  </option>
                ))}
              </select>
              {selectedSupplier && (
                <div className="flex items-center gap-3 text-[11px] text-[#5C665E] dark:text-[#8FA392] font-mono">
                  <span>الرقم الضريبي: {selectedSupplier.vatNo ? toWesternDigits(selectedSupplier.vatNo) : 'غير مسجل'}</span>
                  <span>|</span>
                  <span>الرصيد الحالي: {formatCurrency(selectedSupplier.currentBalance || 0)}</span>
                </div>
              )}
            </div>

            {/* Note Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#5C665E] dark:text-[#8FA392] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {t('تاريخ الفاتورة والتوريد', 'Bill Date')}
              </label>
              <input
                type="date"
                value={noteDate}
                onChange={(e) => setNoteDate(e.target.value)}
                className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-[#E0D9CB] dark:border-[#243628] bg-[#FDFBF7] dark:bg-[#121B14] text-[#1F2421] dark:text-[#EAEFEA] focus:outline-hidden focus:border-amber-500"
              />
            </div>

            {/* Payment Terms */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#5C665E] dark:text-[#8FA392]">
                {t('طريقة الدفع وشروط السداد', 'Payment Method')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setNoteType('CREDIT')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                    noteType === 'CREDIT'
                      ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                      : 'border-[#E0D9CB] dark:border-[#243628] text-[#5C665E] dark:text-[#8FA392]'
                  }`}
                >
                  {t('آجل (على الحساب)', 'On Credit')}
                </button>
                <button
                  type="button"
                  onClick={() => setNoteType('CASH')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                    noteType === 'CASH'
                      ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                      : 'border-[#E0D9CB] dark:border-[#243628] text-[#5C665E] dark:text-[#8FA392]'
                  }`}
                >
                  {t('نقدي (صندوق)', 'Cash')}
                </button>
              </div>
            </div>
          </div>

          {/* Receiving Inventory & Supplier Ref */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 rounded-xl bg-white dark:bg-[#17261B] border border-[#E0D9CB] dark:border-[#243628] space-y-1.5">
              <label className="text-xs font-bold text-[#5C665E] dark:text-[#8FA392] flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-amber-500" />
                {t('مستودع الاستلام المخزني', 'Receiving Warehouse')}
              </label>
              <input
                type="text"
                value={inventoryNameAr}
                onChange={(e) => setInventoryNameAr(e.target.value)}
                placeholder="المستودع الرئيسي - القاهرة"
                className="w-full text-xs font-medium px-3 py-1.5 rounded-lg border border-[#E0D9CB] dark:border-[#243628] bg-[#FDFBF7] dark:bg-[#121B14] text-[#1F2421] dark:text-[#EAEFEA]"
              />
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-[#17261B] border border-[#E0D9CB] dark:border-[#243628] space-y-1.5">
              <label className="text-xs font-bold text-[#5C665E] dark:text-[#8FA392] flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-amber-500" />
                {t('رقم فاتورة المورد المرجعية', 'Supplier Invoice Ref / Serial')}
              </label>
              <input
                type="text"
                value={supplierInvoiceRef}
                onChange={(e) => setSupplierInvoiceRef(e.target.value)}
                placeholder="مثال: INV-SUP-2026-948"
                className="w-full text-xs font-mono px-3 py-1.5 rounded-lg border border-[#E0D9CB] dark:border-[#243628] bg-[#FDFBF7] dark:bg-[#121B14] text-[#1F2421] dark:text-[#EAEFEA]"
              />
            </div>
          </div>

          {/* Dynamic Lines Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-[#1F2421] dark:text-[#EAEFEA] uppercase tracking-wider">
                  {t('بنود وأصناف التوريد والمشتريات', 'Procurement Items & Lines')}
                </h4>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#E0D9CB]/50 dark:bg-[#243628]/50 text-[#5C665E] dark:text-[#8FA392]">
                  {lines.length} {t('بند', 'Items')}
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddLine}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-bold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                {t('إضافة صنف توريد (+)', 'Add Item')}
              </button>
            </div>

            <div className="border border-[#E0D9CB] dark:border-[#243628] rounded-xl overflow-hidden bg-white dark:bg-[#17261B]">
              <div className="overflow-x-auto">
                <table className="w-full text-start text-xs">
                  <thead className="bg-[#F4EFE6] dark:bg-[#152319] text-[#5C665E] dark:text-[#8FA392] font-bold border-b border-[#E0D9CB] dark:border-[#243628]">
                    <tr>
                      <th className="py-2.5 px-3 text-center w-10">#</th>
                      <th className="py-2.5 px-3 text-start min-w-[200px]">{t('الصنف / خامة البناء', 'Item')}</th>
                      <th className="py-2.5 px-3 text-start min-w-[120px]">{t('الوحدة والمضاعف', 'Packaging Unit')}</th>
                      <th className="py-2.5 px-3 text-center w-24">{t('الكمية الموردة', 'Qty')}</th>
                      <th className="py-2.5 px-3 text-end w-28">{t('سعر التوريد', 'Unit Cost')}</th>
                      <th className="py-2.5 px-3 text-end w-28">{t('الإجمالي الخاضع', 'Taxable Total')}</th>
                      <th className="py-2.5 px-3 text-start min-w-[190px] bg-amber-500/5">
                        <div className="flex items-center gap-1 text-amber-700 dark:text-amber-400">
                          <TrendingUp className="w-3 h-3" />
                          <span>{t('متوسط التكلفة المرجح المتحرك', 'Moving Avg Cost')}</span>
                        </div>
                      </th>
                      <th className="py-2.5 px-3 text-end w-24 text-emerald-600">{t('ضريبة 15%', 'VAT')}</th>
                      <th className="py-2.5 px-3 text-end w-32 font-black">{t('الإجمالي الشامل', 'Net Total')}</th>
                      <th className="py-2.5 px-2 text-center w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E0D9CB]/60 dark:divide-[#243628]/60">
                    {lines.map((line, index) => {
                      const itemObj = items.find(i => i.itemId === line.itemId);
                      const costDiff = (line.newCost || 0) - (line.oldCost || 0);

                      return (
                        <tr key={index} className="hover:bg-[#FDFBF7] dark:hover:bg-[#121B14]/40 transition-colors">
                          <td className="py-2 px-3 text-center font-mono text-[11px] text-[#5C665E]">
                            {line.sr}
                          </td>

                          {/* Item Select */}
                          <td className="py-2 px-3">
                            <select
                              value={line.itemId}
                              onChange={(e) => handleItemChange(index, e.target.value)}
                              className="w-full text-xs font-semibold px-2 py-1.5 rounded border border-[#E0D9CB] dark:border-[#243628] bg-transparent text-[#1F2421] dark:text-[#EAEFEA] focus:outline-hidden focus:border-amber-500"
                            >
                              {items.map(it => (
                                <option key={it.itemId} value={it.itemId}>
                                  {it.skuCode} - {it.nameAr} (رصيد: {it.stockBalance} {it.units[0]?.unitNameAr || 'وحدة'})
                                </option>
                              ))}
                            </select>
                            {itemObj && (
                              <div className="text-[10px] text-[#5C665E] dark:text-[#8FA392] font-mono mt-0.5">
                                الرصيد الحالي بالمستودع: {formatNumber(itemObj.stockBalance)} {itemObj.units[0]?.unitNameAr || 'وحدة'}
                              </div>
                            )}
                          </td>

                          {/* Packaging Unit */}
                          <td className="py-2 px-3">
                            <select
                              value={line.unitId}
                              onChange={(e) => handleUnitChange(index, e.target.value)}
                              className="w-full text-xs px-2 py-1.5 rounded border border-[#E0D9CB] dark:border-[#243628] bg-transparent text-[#1F2421] dark:text-[#EAEFEA] focus:outline-hidden"
                            >
                              {(itemObj?.units || []).map(u => (
                                <option key={u.unitId} value={u.unitId}>
                                  {u.unitNameAr} (x{u.multiplier})
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* Qty */}
                          <td className="py-2 px-2 text-center">
                            <input
                              type="number"
                              min="0.001"
                              step="any"
                              value={line.qty}
                              onChange={(e) => handleQtyPriceChange(index, 'qty', parseFloat(e.target.value) || 0)}
                              className="w-20 text-xs font-mono font-bold text-center px-1.5 py-1 rounded border border-[#E0D9CB] dark:border-[#243628] bg-transparent focus:outline-hidden focus:border-amber-500"
                            />
                          </td>

                          {/* Price */}
                          <td className="py-2 px-2 text-end">
                            <input
                              type="number"
                              min="0"
                              step="any"
                              value={line.price}
                              onChange={(e) => handleQtyPriceChange(index, 'price', parseFloat(e.target.value) || 0)}
                              className="w-24 text-xs font-mono font-bold text-end px-1.5 py-1 rounded border border-[#E0D9CB] dark:border-[#243628] bg-transparent focus:outline-hidden focus:border-amber-500"
                            />
                          </td>

                          {/* Taxable Total */}
                          <td className="py-2 px-3 text-end font-mono font-bold text-xs">
                            {formatCurrency(line.total, false)}
                          </td>

                          {/* Moving Average Cost Preview */}
                          <td className="py-2 px-3 bg-amber-500/5">
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-1.5 text-[11px] font-mono">
                                <span className="text-[#5C665E]">{formatCurrency(line.oldCost || 0, false)}</span>
                                <ArrowRightLeft className="w-3 h-3 text-amber-600" />
                                <span className="font-bold text-amber-700 dark:text-amber-400">
                                  {formatCurrency(line.newCost || 0)}
                                </span>
                              </div>
                              <span className={`text-[10px] font-mono ${costDiff > 0 ? 'text-amber-600' : costDiff < 0 ? 'text-emerald-600' : 'text-[#5C665E]'}`}>
                                {costDiff > 0 ? `+${costDiff.toFixed(2)} (+${((costDiff / (line.oldCost || 1)) * 100).toFixed(1)}%)` : costDiff < 0 ? `${costDiff.toFixed(2)}` : 'بدون تغيير'}
                              </span>
                            </div>
                          </td>

                          {/* VAT */}
                          <td className="py-2 px-3 text-end font-mono font-semibold text-xs text-emerald-600">
                            {formatCurrency(line.vatAmount, false)}
                          </td>

                          {/* Net With Tax */}
                          <td className="py-2 px-3 text-end font-mono font-black text-xs text-amber-600 dark:text-amber-400">
                            {formatCurrency(line.netWithTax, false)}
                          </td>

                          {/* Remove */}
                          <td className="py-2 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveLine(index)}
                              disabled={lines.length <= 1}
                              className="p-1 rounded text-[#5C665E] hover:text-rose-600 hover:bg-rose-500/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Automated Accounting Entry Preview Strip */}
          <div className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400">
              <Layers className="w-3.5 h-3.5" />
              <span>{t('معاينة القيد المحاسبي الآلي المزدوج (قيد مشتريات وتوريد)', 'Automated Double-Entry GL Journal Voucher')}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono text-[#5C665E] dark:text-[#8FA392]">
              <div className="p-2 rounded bg-white/60 dark:bg-[#121B14]/60 border border-[#E0D9CB]/60 dark:border-[#243628]/60">
                <span className="font-bold text-emerald-600">من حـ/ المخزون السلعي (1206001):</span>
                <span className="block font-bold mt-0.5">{formatCurrency(totalAmount)} (مدين)</span>
              </div>
              <div className="p-2 rounded bg-white/60 dark:bg-[#121B14]/60 border border-[#E0D9CB]/60 dark:border-[#243628]/60">
                <span className="font-bold text-emerald-600">من حـ/ ضريبة القيمة المضافة مدخلات (1208001):</span>
                <span className="block font-bold mt-0.5">{formatCurrency(vatAmount)} (مدين)</span>
              </div>
              <div className="p-2 rounded bg-white/60 dark:bg-[#121B14]/60 border border-[#E0D9CB]/60 dark:border-[#243628]/60">
                <span className="font-bold text-amber-600">إلى حـ/ {noteType === 'CREDIT' ? selectedSupplier.nameAr : 'الصندوق الرئيسي'} ({noteType === 'CREDIT' ? selectedSupplier.supplierId : '1201001'}):</span>
                <span className="block font-bold mt-0.5">{formatCurrency(grandTotal)} (دائن)</span>
              </div>
            </div>
          </div>

          {/* Tafqeet & Calculation Footer */}
          <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[#5C665E] dark:text-[#8FA392] uppercase">
                {t('التفقيط المالي باللغة العربية (Tafqeet)', 'Arabic Tafqeet')}
              </span>
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                {tafqeetText}
              </p>
            </div>

            <div className="flex items-center gap-5 text-xs font-mono self-end sm:self-auto">
              <div className="text-end">
                <span className="text-[10px] text-[#5C665E] block">صافي المشتريات:</span>
                <span className="font-bold">{formatCurrency(totalAmount)}</span>
              </div>
              <div className="text-end">
                <span className="text-[10px] text-[#5C665E] block">ضريبة مدخلات 15%:</span>
                <span className="font-bold text-emerald-600">{formatCurrency(vatAmount)}</span>
              </div>
              <div className="text-end border-s border-[#E0D9CB] dark:border-[#243628] ps-4">
                <span className="text-[10px] text-[#5C665E] block">إجمالي المستحق:</span>
                <span className="font-black text-sm text-amber-600 dark:text-amber-400">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            </div>
          </div>
        </form>

    </Modal>
  );
};
