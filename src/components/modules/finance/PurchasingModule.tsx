/**
 * ECO ERP - Purchasing, Supplier Payables & Vendor Invoicing Module (Phase 04)
 * High-Density Keyboard Data Entry Grid (Telerik Desktop UX)
 * Arbitrary-precision calculations via Decimal.js (Subtotal, VAT 14%, WHT 1%, Net Payable)
 * Automated double-entry GL posting with multi-database routing and instant Arabic Tafqeet.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Decimal } from 'decimal.js';
import {
  ShoppingCart,
  RotateCcw,
  Users,
  FileText,
  Plus,
  Trash2,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Database,
  Sparkles,
} from 'lucide-react';
import {
  purchasingClient,
  SupplierClientItem,
  PurchasingItem,
  PurchaseInvoiceItem,
  PurchaseReturnItem,
  CreatePurchaseInvoiceClientDTO,
  CreateSupplierClientDTO,
} from '../../../services/purchasingClient';
import { tafqeet } from '../../../utils/tafqeet';

Decimal.set({ precision: 28, rounding: Decimal.ROUND_HALF_UP });

export const PurchasingModule: React.FC = () => {
  type ActiveTab = 'PURCHASE_INVOICES' | 'PURCHASE_RETURNS' | 'SUPPLIERS' | 'PURCHASE_ORDERS';
  const [activeTab, setActiveTab] = useState<ActiveTab>('PURCHASE_INVOICES');

  // Master Data State
  const [suppliers, setSuppliers] = useState<SupplierClientItem[]>([]);
  const [itemsCatalog, setItemsCatalog] = useState<PurchasingItem[]>([]);
  const [invoices, setInvoices] = useState<PurchaseInvoiceItem[]>([]);
  const [returns, setReturns] = useState<PurchaseReturnItem[]>([]);
  const [activeDb, setActiveDb] = useState<string>('MK_Khalil_Db_2026');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Alerts
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modal State for New Supplier
  const [isAddSupplierModalOpen, setIsAddSupplierModalOpen] = useState<boolean>(false);
  const [newSupplierNameA, setNewSupplierNameA] = useState<string>('');
  const [newSupplierTel, setNewSupplierTel] = useState<string>('');
  const [newSupplierVatNo, setNewSupplierVatNo] = useState<string>('');
  const [newSupplierCardNo, setNewSupplierCardNo] = useState<string>('');
  const [newSupplierLimit, setNewSupplierLimit] = useState<string>('500000');

  // ----------------------------------------------------
  // INVOICE WORKBENCH STATE
  // ----------------------------------------------------
  const [invoiceDate, setInvoiceDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [invoiceType, setInvoiceType] = useState<number>(0); // 0 = Credit, 1 = Cash
  const [selectedSupplierId, setSelectedSupplierId] = useState<number>(2201002);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number>(1);
  const [supplierInvoiceNo, setSupplierInvoiceNo] = useState<string>('INV-2026-904');
  const [purchaseOrderNo, setPurchaseOrderNo] = useState<string>('PO-2026-081');
  const [invoiceNotice, setInvoiceNotice] = useState<string>('توريد مواد خام إنشائية لزوم مشاريع العاصمة');

  // Rates & Taxes
  const [vatRate, setVatRate] = useState<string>('14.0');
  const [whtRate, setWhtRate] = useState<string>('1.0');
  const [commercialDiscount, setCommercialDiscount] = useState<string>('0.00');

  // Grid Lines
  interface InvoiceGridRow {
    sr: number;
    itemId: number;
    itemName: string;
    unit: string;
    qty: string;
    price: string;
    discount: string;
  }

  const [invoiceRows, setInvoiceRows] = useState<InvoiceGridRow[]>([
    {
      sr: 1,
      itemId: 1001,
      itemName: 'حديد تسليح عالي المقاومة 16 مم مشرشر',
      unit: 'طن',
      qty: '10',
      price: '39500.00',
      discount: '0.00',
    },
    {
      sr: 2,
      itemId: 1002,
      itemName: 'أسمنت بورتلاندي عادي رتبة 42.5N مكيس',
      unit: 'طن',
      qty: '25',
      price: '2450.00',
      discount: '0.00',
    },
  ]);

  const gridContainerRef = useRef<HTMLDivElement>(null);

  // ----------------------------------------------------
  // INITIAL DATA LOAD
  // ----------------------------------------------------
  useEffect(() => {
    loadModuleData();
  }, [activeDb]);

  const loadModuleData = async () => {
    setIsLoading(true);
    try {
      purchasingClient.setActiveDatabaseKey(activeDb);
      const [sups, items, invs, rets] = await Promise.all([
        purchasingClient.getSuppliers(),
        purchasingClient.getItems(),
        purchasingClient.getPurchaseInvoices(),
        purchasingClient.getPurchaseReturns(),
      ]);

      setSuppliers(sups);
      setItemsCatalog(items);
      setInvoices(invs);
      setReturns(rets);

      if (sups.length > 0 && !sups.some((s) => s.Supplier_ID === selectedSupplierId)) {
        setSelectedSupplierId(sups[0].Supplier_ID);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'فشل في تحميل بيانات موديول المشتريات والموردين');
    } finally {
      setIsLoading(false);
    }
  };

  // ----------------------------------------------------
  // ARITHMETIC COMPUTATIONS VIA DECIMAL.JS
  // ----------------------------------------------------
  const computeInvoiceFinancials = () => {
    let grossSubtotal = new Decimal(0);
    let totalQty = new Decimal(0);

    invoiceRows.forEach((row) => {
      const q = new Decimal(parseFloat(row.qty) || 0);
      const p = new Decimal(parseFloat(row.price) || 0);
      const d = new Decimal(parseFloat(row.discount) || 0);

      totalQty = totalQty.plus(q);
      const lineNet = q.times(p).minus(d);
      grossSubtotal = grossSubtotal.plus(lineNet);
    });

    const discount = new Decimal(parseFloat(commercialDiscount) || 0);
    const taxableSubtotal = Decimal.max(0, grossSubtotal.minus(discount));

    const vRate = new Decimal(parseFloat(vatRate) || 0);
    const vatAmount = taxableSubtotal.times(vRate.dividedBy(100));

    const wRate = new Decimal(parseFloat(whtRate) || 0);
    const whtAmount = taxableSubtotal.times(wRate.dividedBy(100));

    const totalWithVat = taxableSubtotal.plus(vatAmount);
    const netDue = totalWithVat.minus(whtAmount);

    return {
      totalQty: totalQty.toNumber(),
      grossSubtotal: grossSubtotal.toNumber(),
      discount: discount.toNumber(),
      taxableSubtotal: taxableSubtotal.toNumber(),
      vatAmount: vatAmount.toNumber(),
      whtAmount: whtAmount.toNumber(),
      totalWithVat: totalWithVat.toNumber(),
      netDue: netDue.toNumber(),
      netText: tafqeet(netDue.toNumber()),
    };
  };

  const financials = computeInvoiceFinancials();

  // ----------------------------------------------------
  // KEYBOARD GRID NAVIGATION (TELERIK DESKTOP UX)
  // ----------------------------------------------------
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement>,
    rowIndex: number,
    field: string
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const fieldsOrder = ['item', 'qty', 'price', 'discount'];
      const currentIdx = fieldsOrder.indexOf(field);

      if (currentIdx !== -1 && currentIdx < fieldsOrder.length - 1) {
        const nextField = fieldsOrder[currentIdx + 1];
        const nextEl = document.getElementById(`row-${rowIndex}-${nextField}`);
        nextEl?.focus();
      } else {
        // Last field of row -> jump to next row or create one
        if (rowIndex < invoiceRows.length - 1) {
          const nextRowEl = document.getElementById(`row-${rowIndex + 1}-item`);
          nextRowEl?.focus();
        } else {
          handleAddRow();
          setTimeout(() => {
            const newRowEl = document.getElementById(`row-${rowIndex + 1}-item`);
            newRowEl?.focus();
          }, 50);
        }
      }
    } else if (e.key === 'Insert' || (e.ctrlKey && e.key === 'ArrowDown')) {
      e.preventDefault();
      handleAddRow();
    } else if (e.ctrlKey && (e.key === 'Delete' || e.key === 'Del')) {
      e.preventDefault();
      handleDeleteRow(rowIndex);
    }
  };

  const handleAddRow = () => {
    const defaultItem = itemsCatalog[0] || {
      Item_ID: 1001,
      Item_Name_A: 'صنف عام',
      Unit_Name_A: 'عدد',
      Last_Cost: 100,
    };

    setInvoiceRows((prev) => [
      ...prev,
      {
        sr: prev.length + 1,
        itemId: defaultItem.Item_ID,
        itemName: defaultItem.Item_Name_A,
        unit: defaultItem.Unit_Name_A,
        qty: '1',
        price: defaultItem.Last_Cost.toFixed(2),
        discount: '0.00',
      },
    ]);
  };

  const handleDeleteRow = (index: number) => {
    if (invoiceRows.length <= 1) {
      setErrorMsg('يجب أن تحتوي الفاتورة على سطر واحد على الأقل');
      return;
    }
    setInvoiceRows((prev) => prev.filter((_, i) => i !== index).map((r, i) => ({ ...r, sr: i + 1 })));
  };

  const handleItemChange = (rowIndex: number, itemId: number) => {
    const selectedItem = itemsCatalog.find((it) => it.Item_ID === itemId);
    if (!selectedItem) return;

    setInvoiceRows((prev) => {
      const updated = [...prev];
      updated[rowIndex] = {
        ...updated[rowIndex],
        itemId: selectedItem.Item_ID,
        itemName: selectedItem.Item_Name_A,
        unit: selectedItem.Unit_Name_A,
        price: selectedItem.Last_Cost.toFixed(2),
      };
      return updated;
    });
  };

  const handleRowValueChange = (rowIndex: number, field: 'qty' | 'price' | 'discount', value: string) => {
    setInvoiceRows((prev) => {
      const updated = [...prev];
      updated[rowIndex] = {
        ...updated[rowIndex],
        [field]: value,
      };
      return updated;
    });
  };

  // ----------------------------------------------------
  // SUBMIT PURCHASE INVOICE (ATOMIC COMMIT + GL)
  // ----------------------------------------------------
  const handleSaveInvoice = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      const activeSupplier = suppliers.find((s) => s.Supplier_ID === selectedSupplierId);

      const payload: CreatePurchaseInvoiceClientDTO = {
        Note_Date: invoiceDate,
        Note_Type: invoiceType,
        Inventory_ID: selectedWarehouseId,
        Supplier_ID: selectedSupplierId,
        Supplier_Name: activeSupplier?.Supplier_Name_A,
        Supplier_Invoices: supplierInvoiceNo,
        Purchase_Order: purchaseOrderNo,
        Credit_Level5_ID: selectedSupplierId,
        Debit_Level5_ID: 1203001,
        Costcenter_ID: 0,
        Discount_Amount: financials.discount,
        Vat_Tax_Per: parseFloat(vatRate) || 14.0,
        D_Tax_Per: parseFloat(whtRate) || 1.0,
        Notice: invoiceNotice,
        details: invoiceRows.map((r) => ({
          Item_ID: r.itemId,
          Item_Name_A: r.itemName,
          Unit_Name_A: r.unit,
          Qty: parseFloat(r.qty) || 1,
          Price: parseFloat(r.price) || 0,
          Discount: parseFloat(r.discount) || 0,
        })),
      };

      const res = await purchasingClient.createPurchaseInvoice(payload);
      setSuccessMsg(
        `✅ تم حفظ فاتورة المشتريات رقم #${res.noteNo} بنجاح، وتم ترحيل القيد المحاسبي المتزن #${res.glNoteNo} إلى الأستاذ العام وتدقيقها سحابياً.`
      );

      // Refresh invoices
      const updatedInvs = await purchasingClient.getPurchaseInvoices();
      setInvoices(updatedInvs);
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ أثناء حفظ فاتورة المشتريات');
    } finally {
      setIsLoading(false);
    }
  };

  // ----------------------------------------------------
  // ADD NEW SUPPLIER HANDLER
  // ----------------------------------------------------
  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplierNameA.trim()) {
      setErrorMsg('يرجى إدخال اسم المورد باللغة العربية');
      return;
    }

    setIsLoading(true);
    try {
      const payload: CreateSupplierClientDTO = {
        Supplier_Name_A: newSupplierNameA,
        Tel: newSupplierTel,
        Vat_No: newSupplierVatNo,
        Card_No: newSupplierCardNo,
        Limit_Amount: parseFloat(newSupplierLimit) || 0,
      };

      const created = await purchasingClient.createSupplier(payload);
      setSuccessMsg(`✅ تم إضافة المورد "${created.Supplier_Name_A}" بكود #${created.Supplier_ID} بنجاح`);
      setIsAddSupplierModalOpen(false);
      setNewSupplierNameA('');
      setNewSupplierTel('');
      setNewSupplierVatNo('');
      setNewSupplierCardNo('');

      // Reload suppliers
      const updatedSups = await purchasingClient.getSuppliers();
      setSuppliers(updatedSups);
      setSelectedSupplierId(created.Supplier_ID);
    } catch (err: any) {
      setErrorMsg(err.message || 'فشل في حفظ بيانات المورد');
    } finally {
      setIsLoading(false);
    }
  };

  // Active supplier metadata
  const currentSupplier = suppliers.find((s) => s.Supplier_ID === selectedSupplierId);

  return (
    <div className="w-full space-y-4 text-right" dir="rtl">
      {/* 1. Header Toolbar & Database Switcher */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-amber-500/20 bg-white/70 dark:bg-[#07130E]/70 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-stone-100 flex items-center gap-2">
              منظومة المشتريات والموردين وفواتير البضاعة
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold border border-amber-500/30">
                Phase 04 Purchasing & Payables
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-stone-400 mt-0.5">
              ترحيل ذري مزدوج للأستاذ العام (Inventory / Input VAT / Payables / WHT) مع دقة حسابية لا نهائية عبر Decimal.js
            </p>
          </div>
        </div>

        {/* Database Key Selector & Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-stone-800 bg-white dark:bg-[#0D1F17] text-xs">
            <Database className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-semibold text-slate-600 dark:text-stone-400">قاعدة البيانات:</span>
            <select
              value={activeDb}
              onChange={(e) => setActiveDb(e.target.value)}
              className="bg-transparent font-mono font-bold text-amber-600 dark:text-amber-400 outline-none cursor-pointer"
            >
              <option value="MK_Khalil_Db_2026">MK_Khalil_Db_2026</option>
              <option value="Tarabot_Data_2026">Tarabot_Data_2026</option>
              <option value="acc">acc (Main Financials)</option>
              <option value="newhope">newhope</option>
            </select>
          </div>

          <button
            onClick={loadModuleData}
            disabled={isLoading}
            className="p-2 rounded-lg border border-slate-200 dark:border-stone-800 bg-white dark:bg-[#0D1F17] text-slate-700 dark:text-stone-300 hover:border-amber-500/50 hover:text-amber-500 transition-colors cursor-pointer"
            title="تحديث البيانات"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="flex items-center gap-2 p-3.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2 p-3.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 text-xs font-semibold animate-in fade-in">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 2. Primary Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-stone-800 pb-2">
        <button
          onClick={() => setActiveTab('PURCHASE_INVOICES')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'PURCHASE_INVOICES'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-600 dark:text-stone-400 hover:bg-slate-100 dark:hover:bg-stone-900'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>فاتورة المشتريات المحلية والمخزنية</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/15 font-mono">{invoices.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('PURCHASE_RETURNS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'PURCHASE_RETURNS'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-600 dark:text-stone-400 hover:bg-slate-100 dark:hover:bg-stone-900'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>مردودات المشتريات (إشعار دائن)</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/15 font-mono">{returns.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('SUPPLIERS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'SUPPLIERS'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-600 dark:text-stone-400 hover:bg-slate-100 dark:hover:bg-stone-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>دليل وبطاقات الموردين</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/15 font-mono">{suppliers.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('PURCHASE_ORDERS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'PURCHASE_ORDERS'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-600 dark:text-stone-400 hover:bg-slate-100 dark:hover:bg-stone-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>أوامر الشراء والتوريد (PO)</span>
        </button>
      </div>

      {/* 3. TAB 1: PURCHASE INVOICES WORKBENCH */}
      {activeTab === 'PURCHASE_INVOICES' && (
        <div className="space-y-4">
          {/* Header Input Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-3 p-4 rounded-xl border border-slate-200 dark:border-stone-800 bg-white/50 dark:bg-[#07130E]/50">
            {/* Invoice Date */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-stone-400 mb-1">تاريخ الفاتورة</label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-stone-700 bg-white dark:bg-[#0D1F17] text-slate-900 dark:text-stone-100 text-xs font-mono outline-none focus:border-amber-500"
              />
            </div>

            {/* Invoice Type */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-stone-400 mb-1">طبيعة السداد</label>
              <select
                value={invoiceType}
                onChange={(e) => setInvoiceType(parseInt(e.target.value, 10))}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-stone-700 bg-white dark:bg-[#0D1F17] text-slate-900 dark:text-stone-100 text-xs font-bold outline-none focus:border-amber-500"
              >
                <option value={0}>آجل (على الحساب - Credit)</option>
                <option value={1}>نقدي (من الخزينة - Cash)</option>
              </select>
            </div>

            {/* Supplier Select with Quick Add Button */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-slate-600 dark:text-stone-400">المورد المعتمد</label>
                <button
                  onClick={() => setIsAddSupplierModalOpen(true)}
                  className="text-[10px] text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-0.5"
                >
                  <Plus className="w-3 h-3" />
                  مورد جديد
                </button>
              </div>
              <select
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(parseInt(e.target.value, 10))}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-stone-700 bg-white dark:bg-[#0D1F17] text-slate-900 dark:text-stone-100 text-xs font-bold outline-none focus:border-amber-500"
              >
                {suppliers.map((s) => (
                  <option key={s.Supplier_ID} value={s.Supplier_ID}>
                    {s.Supplier_ID} — {s.Supplier_Name_A}
                  </option>
                ))}
              </select>
            </div>

            {/* Warehouse / Inventory */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-stone-400 mb-1">المستودع / المخزن</label>
              <select
                value={selectedWarehouseId}
                onChange={(e) => setSelectedWarehouseId(parseInt(e.target.value, 10))}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-stone-700 bg-white dark:bg-[#0D1F17] text-slate-900 dark:text-stone-100 text-xs font-bold outline-none focus:border-amber-500"
              >
                <option value={1}>01 — مخزن الخامات الرئيسي (روض الفرج)</option>
                <option value={2}>02 — مخزن موقع أبراج العاصمة الإدارية</option>
                <option value={3}>03 — مستودع المواد والتشطيبات المركزية</option>
              </select>
            </div>

            {/* Vendor Invoice Reference */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-stone-400 mb-1">رقم فاتورة المورد</label>
              <input
                type="text"
                value={supplierInvoiceNo}
                onChange={(e) => setSupplierInvoiceNo(e.target.value)}
                placeholder="رقم الفاتورة الورقية..."
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-stone-700 bg-white dark:bg-[#0D1F17] text-slate-900 dark:text-stone-100 text-xs font-mono outline-none focus:border-amber-500"
              />
            </div>

            {/* Purchase Order Reference */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-stone-400 mb-1">رقم أمر الشراء (PO)</label>
              <input
                type="text"
                value={purchaseOrderNo}
                onChange={(e) => setPurchaseOrderNo(e.target.value)}
                placeholder="PO-2026-..."
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-stone-700 bg-white dark:bg-[#0D1F17] text-slate-900 dark:text-stone-100 text-xs font-mono outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Supplier Live Metadata Strip */}
          {currentSupplier && (
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs">
              <div className="flex items-center gap-3">
                <span className="font-bold text-amber-900 dark:text-amber-300">الرقم الضريبي:</span>
                <span className="font-mono">{currentSupplier.Vat_No || 'غير مسجل'}</span>
                <span className="text-slate-300 dark:text-stone-700">|</span>
                <span className="font-bold text-amber-900 dark:text-amber-300">السجل التجاري:</span>
                <span className="font-mono">{currentSupplier.Card_No || 'غير مسجل'}</span>
                <span className="text-slate-300 dark:text-stone-700">|</span>
                <span className="font-bold text-amber-900 dark:text-amber-300">حد الائتمان:</span>
                <span className="font-mono">{currentSupplier.Limit_Amount.toLocaleString('ar-EG')} ج.م</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-700 dark:text-stone-300">الرصيد الدفتري الحالي:</span>
                <span
                  className={`font-mono font-bold px-2 py-0.5 rounded ${
                    currentSupplier.Balance >= 0
                      ? 'bg-amber-500/20 text-amber-900 dark:text-amber-300'
                      : 'bg-emerald-500/20 text-emerald-900 dark:text-emerald-300'
                  }`}
                >
                  {Math.abs(currentSupplier.Balance).toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م{' '}
                  {currentSupplier.Balance >= 0 ? '(دائن / مستحق له)' : '(مدين / مسدد مقدماً)'}
                </span>
              </div>
            </div>
          )}

          {/* High-Density Keyboard Data Entry Grid (Telerik UX) */}
          <div
            ref={gridContainerRef}
            className="rounded-xl border border-slate-200 dark:border-stone-800 bg-white dark:bg-[#07130E] shadow-sm overflow-hidden"
          >
            <div className="p-3 border-b border-slate-200 dark:border-stone-800 flex items-center justify-between bg-slate-50 dark:bg-stone-900/50">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800 dark:text-stone-200">جدول بنود الفاتورة والمواد</span>
                <span className="text-[10px] text-slate-500 dark:text-stone-400">
                  (تنقل بزر <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-stone-800 rounded font-mono">Enter</kbd>،
                  إضافة سطر بـ <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-stone-800 rounded font-mono">Insert</kbd>
                  ، حذف بـ <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-stone-800 rounded font-mono">Ctrl+Del</kbd>)
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddRow}
                className="flex items-center gap-1 px-3 py-1 rounded bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                إضافة صنف
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-stone-900/80 text-slate-700 dark:text-stone-300 font-bold border-b border-slate-200 dark:border-stone-800">
                    <th className="p-2.5 w-12 text-center">#</th>
                    <th className="p-2.5 min-w-[260px]">الصنف والوصف المعتمد</th>
                    <th className="p-2.5 w-24 text-center">الوحدة</th>
                    <th className="p-2.5 w-28 text-center">الكمية</th>
                    <th className="p-2.5 w-32 text-center">السعر الفردي</th>
                    <th className="p-2.5 w-28 text-center">الخصم</th>
                    <th className="p-2.5 w-36 text-center">الإجمالي الصافي</th>
                    <th className="p-2.5 w-12 text-center">حذف</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-stone-800/60 font-mono">
                  {invoiceRows.map((row, idx) => {
                    const lineNet = (
                      (parseFloat(row.qty) || 0) * (parseFloat(row.price) || 0) -
                      (parseFloat(row.discount) || 0)
                    ).toFixed(2);

                    return (
                      <tr
                        key={row.sr}
                        className="hover:bg-amber-500/5 transition-colors focus-within:bg-amber-500/10"
                      >
                        <td className="p-2 text-center text-slate-400 font-bold">{row.sr}</td>
                        <td className="p-1.5">
                          <select
                            id={`row-${idx}-item`}
                            value={row.itemId}
                            onChange={(e) => handleItemChange(idx, parseInt(e.target.value, 10))}
                            onKeyDown={(e) => handleKeyDown(e, idx, 'item')}
                            className="w-full px-2.5 py-1.5 rounded border border-slate-200 dark:border-stone-700 bg-white dark:bg-[#0D1F17] text-slate-900 dark:text-stone-100 font-sans font-medium text-xs outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                          >
                            {itemsCatalog.map((it) => (
                              <option key={it.Item_ID} value={it.Item_ID}>
                                {it.Item_ID} — {it.Item_Name_A}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-2 text-center text-slate-600 dark:text-stone-400 font-sans">{row.unit}</td>
                        <td className="p-1.5">
                          <input
                            id={`row-${idx}-qty`}
                            type="number"
                            step="any"
                            value={row.qty}
                            onChange={(e) => handleRowValueChange(idx, 'qty', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, idx, 'qty')}
                            className="w-full px-2 py-1.5 rounded border border-slate-200 dark:border-stone-700 bg-white dark:bg-[#0D1F17] text-slate-900 dark:text-stone-100 text-center font-mono font-bold text-xs outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                          />
                        </td>
                        <td className="p-1.5">
                          <input
                            id={`row-${idx}-price`}
                            type="number"
                            step="any"
                            value={row.price}
                            onChange={(e) => handleRowValueChange(idx, 'price', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, idx, 'price')}
                            className="w-full px-2 py-1.5 rounded border border-slate-200 dark:border-stone-700 bg-white dark:bg-[#0D1F17] text-slate-900 dark:text-stone-100 text-center font-mono font-bold text-xs outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                          />
                        </td>
                        <td className="p-1.5">
                          <input
                            id={`row-${idx}-discount`}
                            type="number"
                            step="any"
                            value={row.discount}
                            onChange={(e) => handleRowValueChange(idx, 'discount', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, idx, 'discount')}
                            className="w-full px-2 py-1.5 rounded border border-slate-200 dark:border-stone-700 bg-white dark:bg-[#0D1F17] text-slate-900 dark:text-stone-100 text-center font-mono text-xs outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                          />
                        </td>
                        <td className="p-2 text-center font-bold text-amber-600 dark:text-amber-400">
                          {parseFloat(lineNet).toLocaleString('ar-EG', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-1.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteRow(idx)}
                            className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="حذف السطر"
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

          {/* Dynamic Deduction & Tax HUD Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 rounded-xl border border-slate-200 dark:border-stone-800 bg-slate-50 dark:bg-stone-900/30 text-xs">
            <div>
              <label className="block font-semibold text-slate-600 dark:text-stone-400 mb-1">الخصم التجاري العام</label>
              <input
                type="number"
                step="any"
                value={commercialDiscount}
                onChange={(e) => setCommercialDiscount(e.target.value)}
                className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-stone-700 bg-white dark:bg-[#0D1F17] font-mono font-bold text-xs outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-600 dark:text-stone-400 mb-1">ضريبة القيمة المضافة (VAT %)</label>
              <input
                type="number"
                step="any"
                value={vatRate}
                onChange={(e) => setVatRate(e.target.value)}
                className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-stone-700 bg-white dark:bg-[#0D1F17] font-mono font-bold text-xs outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-600 dark:text-stone-400 mb-1">
                ضريبة أرباح تجارية وصناعية (WHT %)
              </label>
              <input
                type="number"
                step="any"
                value={whtRate}
                onChange={(e) => setWhtRate(e.target.value)}
                className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-stone-700 bg-white dark:bg-[#0D1F17] font-mono font-bold text-xs outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-600 dark:text-stone-400 mb-1">بيان وملاحظات الفاتورة</label>
              <input
                type="text"
                value={invoiceNotice}
                onChange={(e) => setInvoiceNotice(e.target.value)}
                className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-stone-700 bg-white dark:bg-[#0D1F17] text-xs outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Sticky Footer HUD & Tafqeet Bar */}
          <div className="p-4 rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent dark:bg-[#07130E] shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
                <div>
                  <span className="text-slate-500 dark:text-stone-400">الإجمالي قبل الضريبة: </span>
                  <span className="font-bold text-slate-900 dark:text-stone-100">
                    {financials.grossSubtotal.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-stone-400">القيمة المضافة (14%): </span>
                  <span className="font-bold text-sky-600 dark:text-sky-400">
                    +{financials.vatAmount.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-stone-400">الخصم والإضافة (1%): </span>
                  <span className="font-bold text-rose-600 dark:text-rose-400">
                    -{financials.whtAmount.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م
                  </span>
                </div>
                <div className="text-sm font-black text-amber-600 dark:text-amber-400 bg-amber-500/15 px-3 py-1 rounded-lg border border-amber-500/30">
                  <span>الصافي المستحق للمورد: </span>
                  <span>{financials.netDue.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م</span>
                </div>
              </div>

              {/* Arabic Tafqeet String */}
              <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-stone-300 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="font-bold">المبلغ تفقيطاً:</span>
                <span className="italic">{financials.netText}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveInvoice}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition-all shadow-md shadow-amber-500/25 hover:-translate-y-0.5 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>حفظ واعتماد الفاتورة وترحيل القيد الذري</span>
              </button>
            </div>
          </div>

          {/* Saved Invoices Explorer */}
          <div className="space-y-2 pt-4">
            <h3 className="text-xs font-bold text-slate-700 dark:text-stone-300 flex items-center gap-2">
              <span>سجل فواتير المشتريات المرحلة مؤخراً</span>
              <span className="text-[10px] text-slate-400">({invoices.length} فاتورة مسجلة)</span>
            </h3>

            <div className="rounded-xl border border-slate-200 dark:border-stone-800 bg-white dark:bg-[#07130E] overflow-hidden">
              <table className="w-full text-xs text-right border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-stone-900/50 text-slate-600 dark:text-stone-400 font-bold border-b border-slate-200 dark:border-stone-800">
                    <th className="p-3">رقم الفاتورة</th>
                    <th className="p-3">تاريخ الحركة</th>
                    <th className="p-3">المورد</th>
                    <th className="p-3">فاتورة المورد</th>
                    <th className="p-3">الإجمالي</th>
                    <th className="p-3">القيمة المضافة</th>
                    <th className="p-3">الخصم والإضافة</th>
                    <th className="p-3">الصافي المعتمد</th>
                    <th className="p-3">قيد اليومية</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-stone-800/60 font-mono">
                  {invoices.map((inv) => (
                    <tr key={inv.Note_No} className="hover:bg-amber-500/5 transition-colors">
                      <td className="p-3 font-bold text-slate-900 dark:text-stone-100">#{inv.Note_No}</td>
                      <td className="p-3 text-slate-600 dark:text-stone-400">{inv.Note_Date}</td>
                      <td className="p-3 font-sans font-bold text-slate-800 dark:text-stone-200">
                        {inv.Supplier_Name_A}
                      </td>
                      <td className="p-3 text-slate-500">{inv.Supplier_Invoices || '—'}</td>
                      <td className="p-3">{inv.Note_Total.toLocaleString('ar-EG', { minimumFractionDigits: 2 })}</td>
                      <td className="p-3 text-sky-600">
                        {inv.Vat_Tax_Amount.toLocaleString('ar-EG', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-rose-600">
                        {inv.D_Tax_Amount.toLocaleString('ar-EG', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 font-bold text-amber-600">
                        {inv.Note_Net_With_Tax.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م
                      </td>
                      <td className="p-3">
                        {inv.Journal_No ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/30">
                            قيد #{inv.Journal_No}
                          </span>
                        ) : (
                          <span className="text-slate-400">قيد معلق</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {invoices.length === 0 && (
                    <tr>
                      <td colSpan={9} className="p-6 text-center text-slate-400 font-sans">
                        لا توجد فواتير مشتريات مسجلة بعد. قم بإنشاء أول فاتورة بالأعلى.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB 2: PURCHASE RETURNS (CREDIT NOTES) */}
      {activeTab === 'PURCHASE_RETURNS' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-stone-100 flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-rose-600" />
                مردودات المشتريات والإشعارات الدائنة
              </h2>
              <p className="text-xs text-slate-500 dark:text-stone-400 mt-0.5">
                تخفيض المخزون وتسوية حساب المورد وضريبة القيمة المضافة مع قيد يومية عكسي متزن آلياً.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-stone-800 bg-white dark:bg-[#07130E] overflow-hidden">
            <table className="w-full text-xs text-right border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-stone-900/50 text-slate-600 dark:text-stone-400 font-bold border-b border-slate-200 dark:border-stone-800">
                  <th className="p-3">رقم الإشعار</th>
                  <th className="p-3">التاريخ</th>
                  <th className="p-3">المورد</th>
                  <th className="p-3">رقم فاتورة المورد</th>
                  <th className="p-3">الإجمالي المرتجع</th>
                  <th className="p-3">ضريبة القيمة المضافة</th>
                  <th className="p-3">صافي المبلغ المسترد</th>
                  <th className="p-3">قيد التسوية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-stone-800/60 font-mono">
                {returns.map((ret) => (
                  <tr key={ret.Note_No} className="hover:bg-rose-500/5 transition-colors">
                    <td className="p-3 font-bold text-slate-900 dark:text-stone-100">#{ret.Note_No}</td>
                    <td className="p-3 text-slate-600 dark:text-stone-400">{ret.Note_Date}</td>
                    <td className="p-3 font-sans font-bold text-slate-800 dark:text-stone-200">{ret.Supplier_Name_A}</td>
                    <td className="p-3 text-slate-500">{ret.Supplier_Invoices || '—'}</td>
                    <td className="p-3">{ret.Note_Total.toLocaleString('ar-EG', { minimumFractionDigits: 2 })}</td>
                    <td className="p-3 text-sky-600">
                      {ret.Vat_Tax_Amount.toLocaleString('ar-EG', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 font-bold text-rose-600">
                      {ret.Note_Net_With_Tax.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م
                    </td>
                    <td className="p-3">
                      {ret.Journal_No ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/30">
                          قيد #{ret.Journal_No}
                        </span>
                      ) : (
                        <span className="text-slate-400">قيد معلق</span>
                      )}
                    </td>
                  </tr>
                ))}
                {returns.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-slate-400 font-sans">
                      لا توجد أذون مردودات مشتريات مسجلة.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. TAB 3: SUPPLIERS DIRECTORY */}
      {activeTab === 'SUPPLIERS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-900 dark:text-stone-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-500" />
              دليل الموردين المعتمدين وأرصدة الحسابات
            </h2>
            <button
              onClick={() => setIsAddSupplierModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              إضافة مورد جديد
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {suppliers.map((sup) => (
              <div
                key={sup.Supplier_ID}
                className="p-4 rounded-xl border border-slate-200 dark:border-stone-800 bg-white dark:bg-[#07130E] shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-stone-100">{sup.Supplier_Name_A}</h3>
                    <p className="text-[11px] text-slate-500 dark:text-stone-400 font-mono mt-0.5">
                      كود الحساب: #{sup.Supplier_ID}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                    مورد خامات
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-stone-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">الرقم الضريبي:</span>
                    <span className="font-mono">{sup.Vat_No || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">السجل التجاري:</span>
                    <span className="font-mono">{sup.Card_No || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">الهاتف:</span>
                    <span className="font-mono">{sup.Tel || sup.Mobile || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">الحد الائتماني:</span>
                    <span className="font-mono font-bold">{sup.Limit_Amount.toLocaleString('ar-EG')} ج.م</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-stone-800 flex items-center justify-between">
                  <span className="text-xs text-slate-500">الرصيد الدفتري:</span>
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                      sup.Balance >= 0
                        ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300'
                        : 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300'
                    }`}
                  >
                    {Math.abs(sup.Balance).toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. TAB 4: PURCHASE ORDERS (PO) */}
      {activeTab === 'PURCHASE_ORDERS' && (
        <div className="p-8 rounded-xl border border-dashed border-slate-300 dark:border-stone-800 text-center space-y-3">
          <FileText className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-stone-300">مركز أوامر الشراء والتوريدات (PO)</h3>
          <p className="text-xs text-slate-500 dark:text-stone-400 max-w-md mx-auto">
            إدارة عروض أسعار الموردين، أوامر التوريد المعتمدة، وتتبع مراحل الاستلام الجزئي أو الكلي وربطها التلقائي بفواتير
            المشتريات المحلية.
          </p>
        </div>
      )}

      {/* MODAL: ADD SUPPLIER */}
      {isAddSupplierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-amber-500/30 bg-white dark:bg-[#07130E] p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-stone-800 pb-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-stone-100 flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-500" />
                إضافة مورد جديد لمنظومة ترابط
              </h3>
              <button
                onClick={() => setIsAddSupplierModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-stone-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSupplier} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-stone-300 mb-1">
                  اسم المورد (باللغة العربية) *
                </label>
                <input
                  type="text"
                  required
                  value={newSupplierNameA}
                  onChange={(e) => setNewSupplierNameA(e.target.value)}
                  placeholder="مثال: شركة النيل لمواد البناء"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-stone-700 bg-white dark:bg-[#0D1F17] outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-stone-300 mb-1">رقم الهاتف / الموبايل</label>
                  <input
                    type="text"
                    value={newSupplierTel}
                    onChange={(e) => setNewSupplierTel(e.target.value)}
                    placeholder="010..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-stone-700 bg-white dark:bg-[#0D1F17] font-mono outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-stone-300 mb-1">الرقم الضريبي</label>
                  <input
                    type="text"
                    value={newSupplierVatNo}
                    onChange={(e) => setNewSupplierVatNo(e.target.value)}
                    placeholder="200-111-..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-stone-700 bg-white dark:bg-[#0D1F17] font-mono outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-stone-300 mb-1">رقم السجل التجاري</label>
                  <input
                    type="text"
                    value={newSupplierCardNo}
                    onChange={(e) => setNewSupplierCardNo(e.target.value)}
                    placeholder="109845"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-stone-700 bg-white dark:bg-[#0D1F17] font-mono outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-stone-300 mb-1">الحد الائتماني (ج.م)</label>
                  <input
                    type="number"
                    value={newSupplierLimit}
                    onChange={(e) => setNewSupplierLimit(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-stone-700 bg-white dark:bg-[#0D1F17] font-mono outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-stone-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddSupplierModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-stone-700 text-slate-600 dark:text-stone-400 hover:bg-slate-100 dark:hover:bg-stone-900"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/25"
                >
                  حفظ المورد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
