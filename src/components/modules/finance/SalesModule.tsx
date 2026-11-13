/**
 * ECO ERP - Sales, Customer Receivables & Invoicing Module (Phase 05)
 * High-Density Keyboard Data Entry Grid (Telerik Desktop UX)
 * Arbitrary-precision calculations via Decimal.js (Subtotal, VAT 14%, WHT 1%, Net Receivable)
 * Automated double-entry GL posting with multi-database routing and instant Arabic Tafqeet.
 * Source of Truth: tarabot_erp_complete_schema.json & Phase_05_SalesReceivables_Spec.md
 */

import React, { useState, useEffect, useRef } from 'react';
import { Decimal } from 'decimal.js';
import {
  TrendingUp,
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
  CreditCard,
  Building,
  ShieldCheck,
  Search,
} from 'lucide-react';
import {
  SalesClient,
  ClientListItem,
  SalesItemCatalog,
  SalesInvoiceItem,
  SalesReturnItem,
  CreateSalesInvoiceClientDTO,
  CreateClientDTO,
} from '../../../services/salesClient';
import { tafqeet } from '../../../utils/tafqeet';

Decimal.set({ precision: 28, rounding: Decimal.ROUND_HALF_UP });

export const SalesModule: React.FC = () => {
  type ActiveTab = 'SALES_INVOICES' | 'SALES_RETURNS' | 'CLIENTS' | 'QUOTATIONS';
  const [activeTab, setActiveTab] = useState<ActiveTab>('SALES_INVOICES');

  const salesClient = SalesClient.getInstance();

  // Master Data State
  const [clients, setClients] = useState<ClientListItem[]>([]);
  const [itemsCatalog, setItemsCatalog] = useState<SalesItemCatalog[]>([]);
  const [invoices, setInvoices] = useState<SalesInvoiceItem[]>([]);
  const [returns, setReturns] = useState<SalesReturnItem[]>([]);
  const [activeDb, setActiveDb] = useState<string>('MK_Khalil_Db_2026');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Alerts
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modal State for New Client
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState<boolean>(false);
  const [newClientNameA, setNewClientNameA] = useState<string>('');
  const [newClientTel, setNewClientTel] = useState<string>('');
  const [newClientVatNo, setNewClientVatNo] = useState<string>('');
  const [newClientCardNo, setNewClientCardNo] = useState<string>('');
  const [newClientLimit, setNewClientLimit] = useState<string>('10000000');
  const [newClientAddress, setNewClientAddress] = useState<string>('');

  // ----------------------------------------------------
  // INVOICE WORKBENCH STATE
  // ----------------------------------------------------
  const [invoiceDate, setInvoiceDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [invoiceType, setInvoiceType] = useState<number>(0); // 0 = Credit, 1 = Cash
  const [selectedClientId, setSelectedClientId] = useState<number>(1204001);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number>(1);
  const [issueNo, setIssueNo] = useState<string>('SO-2026-0104');
  const [salesOrderNo, setSalesOrderNo] = useState<string>('PO-TMG-8821');
  const [invoiceNotice, setInvoiceNotice] = useState<string>('توريد حديد تسليح ومواد بناء لمشروع مدينتي B12');

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
      qty: '20',
      price: '42500.00',
      discount: '0.00',
    },
    {
      sr: 2,
      itemId: 1002,
      itemName: 'أسمنت بورتلاندي عادي رتبة 42.5N مكيس',
      unit: 'طن',
      qty: '50',
      price: '2850.00',
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
      salesClient.setActiveDatabaseKey(activeDb);
      const [cls, items, invs, rets] = await Promise.all([
        salesClient.getClients(),
        salesClient.getItems(),
        salesClient.getSalesInvoices(),
        salesClient.getSalesReturns(),
      ]);

      setClients(cls);
      setItemsCatalog(items);
      setInvoices(invs);
      setReturns(rets);

      if (cls.length > 0 && !cls.some((c) => c.Client_ID === selectedClientId)) {
        setSelectedClientId(cls[0].Client_ID);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'فشل في تحميل بيانات موديول المبيعات والعملاء');
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
        const nextEl = document.getElementById(`sales-row-${rowIndex}-${nextField}`);
        nextEl?.focus();
      } else {
        // Last field of row -> jump to next row or create one
        if (rowIndex < invoiceRows.length - 1) {
          const nextRowEl = document.getElementById(`sales-row-${rowIndex + 1}-item`);
          nextRowEl?.focus();
        } else {
          handleAddRow();
          setTimeout(() => {
            const newRowEl = document.getElementById(`sales-row-${rowIndex + 1}-item`);
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
      Item_Name_A: 'صنف مبيعات عام',
      Unit_Name_A: 'عدد',
      Sales_Price: 100,
    };

    setInvoiceRows((prev) => [
      ...prev,
      {
        sr: prev.length + 1,
        itemId: defaultItem.Item_ID,
        itemName: defaultItem.Item_Name_A,
        unit: defaultItem.Unit_Name_A,
        qty: '1',
        price: defaultItem.Sales_Price.toFixed(2),
        discount: '0.00',
      },
    ]);
  };

  const handleDeleteRow = (index: number) => {
    if (invoiceRows.length <= 1) {
      setErrorMsg('لا يمكن حذف السطر الوحيد في الفاتورة');
      return;
    }
    setInvoiceRows((prev) => {
      const filtered = prev.filter((_, i) => i !== index);
      return filtered.map((r, i) => ({ ...r, sr: i + 1 }));
    });
  };

  const handleItemSelect = (index: number, itemId: number) => {
    const matched = itemsCatalog.find((it) => it.Item_ID === itemId);
    if (!matched) return;

    setInvoiceRows((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        itemId: matched.Item_ID,
        itemName: matched.Item_Name_A,
        unit: matched.Unit_Name_A,
        price: matched.Sales_Price.toFixed(2),
      };
      return updated;
    });
  };

  const handleRowChange = (index: number, field: 'qty' | 'price' | 'discount', value: string) => {
    setInvoiceRows((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // ----------------------------------------------------
  // SUBMIT SALES INVOICE WITH ATOMIC GL POSTING
  // ----------------------------------------------------
  const handleSaveInvoice = async () => {
    if (invoiceRows.length === 0) {
      setErrorMsg('يرجى إضافة سطر واحد على الأقل في فاتورة المبيعات');
      return;
    }

    const currentClient = clients.find((c) => c.Client_ID === selectedClientId);
    if (!currentClient) {
      setErrorMsg('يرجى تحديد العميل المستلم');
      return;
    }

    // Check Credit Limit Invariant
    if (invoiceType === 0 && currentClient.Limit_Amount > 0) {
      const currentBalance = currentClient.Balance || 0;
      const expectedBalance = currentBalance + financials.netDue;
      if (expectedBalance > currentClient.Limit_Amount) {
        const proceed = window.confirm(
          `تحذير حد الائتمان: إجمالي رصيد العميل (${expectedBalance.toLocaleString()} ج.م) سيتجاوز الحد المعتمد (${currentClient.Limit_Amount.toLocaleString()} ج.م).\nهل ترغب بالاستمرار وتمرير الفاتورة بإذن استثنائي؟`
        );
        if (!proceed) return;
      }
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const payload: CreateSalesInvoiceClientDTO = {
        Note_Date: invoiceDate,
        Note_Type: invoiceType,
        Inventory_ID: selectedWarehouseId,
        Client_ID: selectedClientId,
        Client_Name: currentClient.Client_Name_A,
        Issue_No: issueNo,
        Sales_Order: salesOrderNo,
        Debit_Level5_ID: currentClient.Client_ID, // Sync customer level 5 account
        Credit_Level5_ID: 4101001, // Sales Revenue
        Costcenter_ID: 101,
        Analysis_ID: 1,
        Discount_Amount: financials.discount,
        Vat_Tax_Per: parseFloat(vatRate) || 14.0,
        D_Tax_Per: parseFloat(whtRate) || 1.0,
        Notice: invoiceNotice,
        details: invoiceRows.map((r) => ({
          Item_ID: r.itemId,
          Item_Name_A: r.itemName,
          Unit_Name_A: r.unit,
          Qty: parseFloat(r.qty) || 0,
          Price: parseFloat(r.price) || 0,
          Discount: parseFloat(r.discount) || 0,
        })),
      };

      const result = await salesClient.createSalesInvoice(payload);

      setSuccessMsg(
        `تم حفظ فاتورة المبيعات بنجاح رقم #${result.noteNo} وترحيل القيد المحاسبي رقم #${result.journalNo || 'الآلي'} إلى الأستاذ العام!`
      );

      // Refresh data
      await loadModuleData();

      // Reset lines to default
      setInvoiceRows([
        {
          sr: 1,
          itemId: 1001,
          itemName: 'حديد تسليح عالي المقاومة 16 مم مشرشر',
          unit: 'طن',
          qty: '10',
          price: '42500.00',
          discount: '0.00',
        },
      ]);
      setCommercialDiscount('0.00');
    } catch (err: any) {
      setErrorMsg(err.message || 'خطأ أثناء حفظ وترحيل فاتورة المبيعات');
    } finally {
      setIsLoading(false);
    }
  };

  // ----------------------------------------------------
  // CREATE NEW CLIENT MODAL ACTION
  // ----------------------------------------------------
  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientNameA.trim()) {
      setErrorMsg('اسم العميل بالعربية مطلوب');
      return;
    }

    setIsLoading(true);
    try {
      const dto: CreateClientDTO = {
        Client_Name_A: newClientNameA,
        Tel: newClientTel,
        Vat_No: newClientVatNo,
        Card_No: newClientCardNo,
        Limit_Amount: parseFloat(newClientLimit) || 10000000,
        Address: newClientAddress,
      };

      const created = await salesClient.createClient(dto);
      setSuccessMsg(`تم إنشاء العميل [${created.Client_Name_A}] وإضافته لدليل الحسابات بنجاح`);
      setIsAddClientModalOpen(false);

      // Clear inputs
      setNewClientNameA('');
      setNewClientTel('');
      setNewClientVatNo('');
      setNewClientCardNo('');
      setNewClientAddress('');

      await loadModuleData();
      setSelectedClientId(created.Client_ID);
    } catch (err: any) {
      setErrorMsg(err.message || 'فشل في إنشاء العميل');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedClient = clients.find((c) => c.Client_ID === selectedClientId);

  // Filtered lists for view tables
  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.Client_Name_A.includes(searchTerm) ||
      inv.Note_No.toString().includes(searchTerm) ||
      (inv.Issue_No && inv.Issue_No.includes(searchTerm))
  );

  const filteredClients = clients.filter(
    (c) =>
      c.Client_Name_A.includes(searchTerm) ||
      c.Client_ID.toString().includes(searchTerm) ||
      (c.Vat_No && c.Vat_No.includes(searchTerm))
  );

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-200" dir="rtl">
      {/* ---------------------------------------------------- */}
      {/* TOP COMMAND BAR & METRICS HUD                        */}
      {/* ---------------------------------------------------- */}
      <div className="p-4 sm:p-5 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#141E16] shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                المبيعات والعملاء والفوترة (Phase 05)
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                Telerik Desktop UX
              </span>
              <div className="flex items-center gap-1.5 text-xs text-[#5C665E] dark:text-[#8FA392] font-mono">
                <Database className="w-3.5 h-3.5 text-emerald-500" />
                <select
                  value={activeDb}
                  onChange={(e) => setActiveDb(e.target.value)}
                  className="bg-transparent border-b border-dotted border-[#E0D9CB] dark:border-[#243628] text-xs font-mono font-semibold text-[#1A241C] dark:text-[#F3EFE6] outline-none cursor-pointer"
                >
                  <option value="MK_Khalil_Db_2026" className="bg-white dark:bg-[#141E16] text-[#1A241C] dark:text-[#F3EFE6]">MK_Khalil_Db_2026 (الرئيسية)</option>
                  <option value="Tarabot_Data_2026" className="bg-white dark:bg-[#141E16] text-[#1A241C] dark:text-[#F3EFE6]">Tarabot_Data_2026</option>
                  <option value="acc" className="bg-white dark:bg-[#141E16] text-[#1A241C] dark:text-[#F3EFE6]">acc</option>
                  <option value="newhope" className="bg-white dark:bg-[#141E16] text-[#1A241C] dark:text-[#F3EFE6]">newhope</option>
                </select>
              </div>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#1A241C] dark:text-[#F3EFE6] tracking-tight flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              منظومة المبيعات، مستحقات العملاء والفوترة الضريبية
            </h1>
            <p className="text-xs sm:text-sm text-[#5C665E] dark:text-[#8FA392]">
              إدخال جدولى عالي السرعة (Keyboard-Driven)، احتساب ضريبة القيمة المضافة 14% وخصم المنبع 1%، وترحيل آلي لقيود اليومية المزدوجة المتوازنة.
            </p>
          </div>

          {/* Quick HUD Metrics */}
          <div className="flex items-center gap-2">
            <button
              onClick={loadModuleData}
              disabled={isLoading}
              className="p-2.5 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#121B14] text-[#1A241C] dark:text-[#F3EFE6] hover:bg-[#F3EFE6] dark:hover:bg-[#1F2E23] transition-colors flex items-center gap-2 text-xs font-bold cursor-pointer shadow-2xs"
              title="تحديث البيانات"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-500' : ''}`} />
              تحديث
            </button>
            <button
              onClick={() => setIsAddClientModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              عميل جديد
            </button>
          </div>
        </div>

        {/* Global Alert Messages */}
        {errorMsg && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 dark:bg-[#3F2A2A] dark:border-[#5C3E3E] dark:text-[#EFA3A3] text-xs font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg(null)} className="font-bold text-xs px-2 hover:opacity-75 cursor-pointer">
              ✕
            </button>
          </div>
        )}

        {successMsg && (
          <div className="mt-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-[#2A3F30] dark:border-[#3E5C46] dark:text-[#A3CFAC] text-xs font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg(null)} className="font-bold text-xs px-2 hover:opacity-75 cursor-pointer">
              ✕
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mt-5 flex items-center gap-1 border-b border-[#E0D9CB] dark:border-[#243628] overflow-x-auto">
          <button
            onClick={() => setActiveTab('SALES_INVOICES')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'SALES_INVOICES'
                ? 'border-[#059669] text-[#059669] dark:text-[#34D399]'
                : 'border-transparent text-[#5C665E] hover:text-[#1A241C] dark:text-[#8FA392] dark:hover:text-[#F3EFE6]'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            فواتير المبيعات (Sales Invoices)
            <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-[#F3EFE6] dark:bg-[#1A241C] text-[#5C665E] dark:text-[#8FA392]">
              {invoices.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('SALES_RETURNS')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'SALES_RETURNS'
                ? 'border-[#059669] text-[#059669] dark:text-[#34D399]'
                : 'border-transparent text-[#5C665E] hover:text-[#1A241C] dark:text-[#8FA392] dark:hover:text-[#F3EFE6]'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            مردودات المبيعات (Sales Returns)
            <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-[#F3EFE6] dark:bg-[#1A241C] text-[#5C665E] dark:text-[#8FA392]">
              {returns.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('CLIENTS')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'CLIENTS'
                ? 'border-[#059669] text-[#059669] dark:text-[#34D399]'
                : 'border-transparent text-[#5C665E] hover:text-[#1A241C] dark:text-[#8FA392] dark:hover:text-[#F3EFE6]'
            }`}
          >
            <Users className="w-4 h-4" />
            سجل العملاء والمستحقات (Clients)
            <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-[#F3EFE6] dark:bg-[#1A241C] text-[#5C665E] dark:text-[#8FA392]">
              {clients.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('QUOTATIONS')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'QUOTATIONS'
                ? 'border-[#059669] text-[#059669] dark:text-[#34D399]'
                : 'border-transparent text-[#5C665E] hover:text-[#1A241C] dark:text-[#8FA392] dark:hover:text-[#F3EFE6]'
            }`}
          >
            <FileText className="w-4 h-4" />
            عروض الأسعار وأوامر البيع
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* TAB 1: SALES INVOICE WORKBENCH                       */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'SALES_INVOICES' && (
        <div className="space-y-4">
          {/* Header Controls Card */}
          <div className="p-4 sm:p-5 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#121B14] shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
              {/* Customer Selector */}
              <div>
                <label className="block font-bold text-xs text-[#5C665E] dark:text-[#8FA392] mb-1.5">
                  العميل المستلم (Debit Account) *
                </label>
                <div className="flex items-center gap-1.5">
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#17231A] font-bold text-[#1A241C] dark:text-[#F3EFE6] outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669]/20 transition-all shadow-2xs cursor-pointer"
                  >
                    {clients.map((c) => (
                      <option key={c.Client_ID} value={c.Client_ID} className="bg-white dark:bg-[#141E16] text-[#1A241C] dark:text-[#F3EFE6]">
                        {c.Client_Name_A} ({c.Client_ID})
                      </option>
                    ))}
                  </select>
                </div>
                {selectedClient && (
                  <div className="mt-1.5 flex items-center justify-between text-[11px] text-[#5C665E] dark:text-[#8FA392]">
                    <span>الرصيد المدين:</span>
                    <span className="font-mono font-bold text-[#059669] dark:text-[#34D399]">
                      {selectedClient.Balance?.toLocaleString()} ج.م
                    </span>
                  </div>
                )}
              </div>

              {/* Invoice Date */}
              <div>
                <label className="block font-bold text-xs text-[#5C665E] dark:text-[#8FA392] mb-1.5">تاريخ الفاتورة *</label>
                <input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#17231A] font-mono font-bold text-[#1A241C] dark:text-[#F3EFE6] outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669]/20 transition-all shadow-2xs"
                />
              </div>

              {/* Payment Type */}
              <div>
                <label className="block font-bold text-xs text-[#5C665E] dark:text-[#8FA392] mb-1.5">نوع المعاملة *</label>
                <select
                  value={invoiceType}
                  onChange={(e) => setInvoiceType(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#17231A] font-bold text-[#1A241C] dark:text-[#F3EFE6] outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669]/20 transition-all shadow-2xs cursor-pointer"
                >
                  <option value={0} className="bg-white dark:bg-[#141E16] text-[#1A241C] dark:text-[#F3EFE6]">آجل (حساب العميل الجاري)</option>
                  <option value={1} className="bg-white dark:bg-[#141E16] text-[#1A241C] dark:text-[#F3EFE6]">نقدي (الصندوق / الخزينة)</option>
                </select>
              </div>

              {/* Warehouse / Inventory */}
              <div>
                <label className="block font-bold text-xs text-[#5C665E] dark:text-[#8FA392] mb-1.5">المستودع المصدر *</label>
                <select
                  value={selectedWarehouseId}
                  onChange={(e) => setSelectedWarehouseId(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#17231A] font-bold text-[#1A241C] dark:text-[#F3EFE6] outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669]/20 transition-all shadow-2xs cursor-pointer"
                >
                  <option value={1} className="bg-white dark:bg-[#141E16] text-[#1A241C] dark:text-[#F3EFE6]">المستودع الرئيسي - مواد البناء والحديد</option>
                  <option value={2} className="bg-white dark:bg-[#141E16] text-[#1A241C] dark:text-[#F3EFE6]">مستودع العاصمة الإدارية R5</option>
                  <option value={3} className="bg-white dark:bg-[#141E16] text-[#1A241C] dark:text-[#F3EFE6]">مستودع مشروع مدينتي B12</option>
                </select>
              </div>

              {/* Issue No / Delivery Note */}
              <div>
                <label className="block font-bold text-xs text-[#5C665E] dark:text-[#8FA392] mb-1.5">إذن الصرف / الشحن</label>
                <input
                  type="text"
                  value={issueNo}
                  onChange={(e) => setIssueNo(e.target.value)}
                  placeholder="SO-2026-..."
                  className="w-full px-3 py-2 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#17231A] font-mono font-bold text-[#1A241C] dark:text-[#F3EFE6] outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669]/20 transition-all shadow-2xs placeholder-[#5C665E]/50 dark:placeholder-[#8FA392]/50"
                />
              </div>

              {/* Sales Order / PO No */}
              <div>
                <label className="block font-bold text-xs text-[#5C665E] dark:text-[#8FA392] mb-1.5">أمر شراء العميل (PO)</label>
                <input
                  type="text"
                  value={salesOrderNo}
                  onChange={(e) => setSalesOrderNo(e.target.value)}
                  placeholder="PO-..."
                  className="w-full px-3 py-2 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#17231A] font-mono font-bold text-[#1A241C] dark:text-[#F3EFE6] outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669]/20 transition-all shadow-2xs placeholder-[#5C665E]/50 dark:placeholder-[#8FA392]/50"
                />
              </div>

              {/* Tax Configuration */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-xs text-[#5C665E] dark:text-[#8FA392] mb-1.5">ض.ق.م (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={vatRate}
                    onChange={(e) => setVatRate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#17231A] font-mono font-bold text-[#1A241C] dark:text-[#F3EFE6] outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669]/20 transition-all shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-xs text-[#5C665E] dark:text-[#8FA392] mb-1.5">خصم أرباح (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={whtRate}
                    onChange={(e) => setWhtRate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#17231A] font-mono font-bold text-[#1A241C] dark:text-[#F3EFE6] outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669]/20 transition-all shadow-2xs"
                  />
                </div>
              </div>

              {/* Notice / Remarks */}
              <div>
                <label className="block font-bold text-xs text-[#5C665E] dark:text-[#8FA392] mb-1.5">البيان / ملاحظات الفاتورة</label>
                <input
                  type="text"
                  value={invoiceNotice}
                  onChange={(e) => setInvoiceNotice(e.target.value)}
                  placeholder="ملاحظات التسليم وشروط التعاقد..."
                  className="w-full px-3 py-2 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#17231A] font-bold text-[#1A241C] dark:text-[#F3EFE6] outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669]/20 transition-all shadow-2xs placeholder-[#5C665E]/50 dark:placeholder-[#8FA392]/50"
                />
              </div>
            </div>
          </div>

          {/* High-Density Keyboard Data Entry Grid (Telerik Desktop UX) */}
          <div className="rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#121B14] shadow-xs overflow-hidden">
            <div className="p-3.5 bg-[#F3EFE6]/70 dark:bg-[#16231D] border-b border-[#E0D9CB] dark:border-[#243628] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-[#1A241C] dark:text-[#F3EFE6]">
                  بنود وأصناف فاتورة المبيعات
                </span>
                <span className="text-[11px] text-[#5C665E] dark:text-[#8FA392]">
                  (التنقل السريع بـ <kbd className="px-1.5 py-0.5 bg-white dark:bg-[#121B14] border border-[#E0D9CB] dark:border-[#243628] rounded font-bold text-[#D99B26] dark:text-[#EBB34D] text-[10px]">Enter</kbd> للإدخال والسطر التالي | <kbd className="px-1.5 py-0.5 bg-white dark:bg-[#121B14] border border-[#E0D9CB] dark:border-[#243628] rounded font-bold text-[#D99B26] dark:text-[#EBB34D] text-[10px]">Insert</kbd> لإضافة سطر)
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddRow}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                إضافة بند (Insert)
              </button>
            </div>

            <div ref={gridContainerRef} className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F3EFE6] dark:bg-[#131E18] text-[#5C665E] dark:text-[#8FA392] border-b border-[#E0D9CB] dark:border-[#243628] font-black">
                    <th className="py-2.5 px-3 w-12 text-center">م</th>
                    <th className="py-2.5 px-3 w-72">كود واسم الصنف (Item)</th>
                    <th className="py-2.5 px-3 w-24 text-center">الوحدة</th>
                    <th className="py-2.5 px-3 w-28 text-center">الكمية المباعة</th>
                    <th className="py-2.5 px-3 w-32 text-center">سعر البيع (ج.م)</th>
                    <th className="py-2.5 px-3 w-28 text-center">خصم السطر</th>
                    <th className="py-2.5 px-3 w-36 text-center">صافي السطر</th>
                    <th className="py-2.5 px-3 w-14 text-center">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E0D9CB]/60 dark:divide-[#243628]/60 font-mono">
                  {invoiceRows.map((row, idx) => {
                    const q = parseFloat(row.qty) || 0;
                    const p = parseFloat(row.price) || 0;
                    const d = parseFloat(row.discount) || 0;
                    const lineNet = Math.max(0, q * p - d);

                    return (
                      <tr
                        key={idx}
                        className="hover:bg-[#F3EFE6]/50 dark:hover:bg-[#17231A]/40 transition-colors"
                      >
                        <td className="py-2 px-3 text-center font-mono font-bold text-[#5C665E] dark:text-[#8FA392]">
                          {row.sr}
                        </td>
                        <td className="py-2 px-3">
                          <select
                            id={`sales-row-${idx}-item`}
                            value={row.itemId}
                            onChange={(e) => handleItemSelect(idx, parseInt(e.target.value, 10))}
                            onKeyDown={(e) => handleKeyDown(e, idx, 'item')}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#17231A] font-sans font-bold text-[#1A241C] dark:text-[#F3EFE6] outline-none focus:border-[#059669] shadow-2xs cursor-pointer"
                          >
                            {itemsCatalog.map((it) => (
                              <option key={it.Item_ID} value={it.Item_ID} className="bg-white dark:bg-[#141E16] text-[#1A241C] dark:text-[#F3EFE6]">
                                [{it.Item_ID}] {it.Item_Name_A}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span className="px-2 py-1 rounded-md bg-[#F3EFE6] dark:bg-[#1A241C] text-[11px] font-sans font-bold text-[#5C665E] dark:text-[#8FA392] border border-[#E0D9CB] dark:border-[#243628]">
                            {row.unit}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center">
                          <input
                            id={`sales-row-${idx}-qty`}
                            type="number"
                            step="0.01"
                            value={row.qty}
                            onChange={(e) => handleRowChange(idx, 'qty', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, idx, 'qty')}
                            className="w-full px-2.5 py-1.5 text-center font-mono font-bold rounded-lg border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6] outline-none focus:border-[#059669] shadow-2xs"
                          />
                        </td>
                        <td className="py-2 px-3 text-center">
                          <input
                            id={`sales-row-${idx}-price`}
                            type="number"
                            step="0.01"
                            value={row.price}
                            onChange={(e) => handleRowChange(idx, 'price', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, idx, 'price')}
                            className="w-full px-2.5 py-1.5 text-center font-mono font-bold rounded-lg border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6] outline-none focus:border-[#059669] shadow-2xs"
                          />
                        </td>
                        <td className="py-2 px-3 text-center">
                          <input
                            id={`sales-row-${idx}-discount`}
                            type="number"
                            step="0.01"
                            value={row.discount}
                            onChange={(e) => handleRowChange(idx, 'discount', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, idx, 'discount')}
                            className="w-full px-2.5 py-1.5 text-center font-mono font-bold rounded-lg border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6] outline-none focus:border-[#059669] shadow-2xs"
                          />
                        </td>
                        <td className="py-2 px-3 text-center font-mono font-black text-[#245E33] dark:text-[#A3CFAC]">
                          {lineNet.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteRow(idx)}
                            className="p-1 rounded-lg text-[#5C665E] hover:text-rose-600 dark:text-[#8FA392] dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                            title="حذف السطر (Ctrl+Del)"
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

          {/* Sticky Calculation HUD & Journal Entry Bridge */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* HUD Summary Card */}
            <div className="lg:col-span-2 p-5 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#121B14] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#E0D9CB] dark:border-[#243628] pb-3">
                <span className="font-bold text-xs text-[#1A241C] dark:text-[#F3EFE6] flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-[#059669]" />
                  ملخص العمليات الحسابية والضرائب (Tax & Net Calculation HUD)
                </span>
                <span className="text-[11px] font-mono text-[#5C665E] dark:text-[#8FA392]">
                  إجمالي الكمية: {financials.totalQty.toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#FBF9F5] dark:bg-[#16231D] border border-[#E0D9CB] dark:border-[#243628]">
                  <span className="text-[11px] text-[#5C665E] dark:text-[#8FA392] block mb-1">
                    إجمالي الأصناف (Gross)
                  </span>
                  <span className="font-mono font-black text-[#1A241C] dark:text-[#F3EFE6] text-sm tabular-nums">
                    {financials.grossSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#FBF9F5] dark:bg-[#16231D] border border-[#E0D9CB] dark:border-[#243628]">
                  <span className="text-[11px] text-[#5C665E] dark:text-[#8FA392] block mb-1">
                    خصم تجاري إضافي
                  </span>
                  <input
                    type="number"
                    step="100"
                    value={commercialDiscount}
                    onChange={(e) => setCommercialDiscount(e.target.value)}
                    className="w-full px-2.5 py-1 rounded-lg font-mono font-bold text-xs border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6] outline-none focus:border-[#059669] shadow-2xs"
                  />
                </div>

                <div className="p-3 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/20 border border-emerald-500/20">
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold block mb-1">
                    ضريبة القيمة المضافة ({vatRate}%)
                  </span>
                  <span className="font-mono font-black text-[#245E33] dark:text-[#A3CFAC] text-sm tabular-nums">
                    +{financials.vatAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 dark:bg-amber-950/20 border border-amber-500/20">
                  <span className="text-[11px] text-amber-700 dark:text-amber-400 font-bold block mb-1">
                    خصم أرباح تجارية ({whtRate}%)
                  </span>
                  <span className="font-mono font-black text-[#92400E] dark:text-[#EBB34D] text-sm tabular-nums">
                    -{financials.whtAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Net Receivable Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md shadow-emerald-900/20">
                <div>
                  <span className="text-xs text-emerald-100 font-bold block">
                    صافي الفاتورة المستحق على العميل (Net Receivable)
                  </span>
                  <span className="text-xl sm:text-2xl font-black font-mono tracking-tight tabular-nums">
                    {financials.netDue.toLocaleString(undefined, { minimumFractionDigits: 2 })} ج.م
                  </span>
                </div>
                <div className="text-left max-w-sm sm:max-w-md">
                  <span className="text-[11px] text-emerald-100 block font-medium">فقط وقدره:</span>
                  <span className="text-xs font-bold leading-tight line-clamp-2">
                    {financials.netText}
                  </span>
                </div>
              </div>
            </div>

            {/* Automated GL Double-Entry Preview Card */}
            <div className="p-5 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#121B14] shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between border-b border-[#E0D9CB] dark:border-[#243628] pb-3">
                  <span className="font-bold text-xs text-[#1A241C] dark:text-[#F3EFE6] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#059669]" />
                    القيد المحاسبي المزدوج التلقائي
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                    متزن 100%
                  </span>
                </div>

                <div className="mt-3 space-y-2 text-xs font-mono">
                  <div className="flex justify-between items-center text-[#245E33] dark:text-[#A3CFAC]">
                    <span>من حـ/ العملاء ({selectedClient?.Client_Name_A.slice(0, 15)}...):</span>
                    <span className="font-bold tabular-nums">
                      {financials.netDue.toLocaleString(undefined, { minimumFractionDigits: 2 })} مدين
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[#92400E] dark:text-[#EBB34D]">
                    <span>من حـ/ مصلحة الضرائب (خصم وتحصيل):</span>
                    <span className="font-bold tabular-nums">
                      {financials.whtAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} مدين
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[#5C665E] dark:text-[#8FA392]">
                    <span>إلى حـ/ إيرادات المبيعات (4101001):</span>
                    <span className="font-bold text-[#1A241C] dark:text-[#F3EFE6] tabular-nums">
                      {financials.taxableSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })} دائن
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[#5C665E] dark:text-[#8FA392]">
                    <span>إلى حـ/ ضريبة القيمة المضافة (2105002):</span>
                    <span className="font-bold text-[#1A241C] dark:text-[#F3EFE6] tabular-nums">
                      {financials.vatAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} دائن
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E0D9CB] dark:border-[#243628] flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveInvoice}
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  {isLoading ? 'جاري الترحيل...' : 'حفظ الفاتورة وترحيل القيد آلياً'}
                </button>
              </div>
            </div>
          </div>

          {/* Invoices History Table */}
          <div className="p-4 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#141E16] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#059669] dark:text-[#34D399]" />
                سجل فواتير المبيعات الصادرة ({invoices.length})
              </h2>
              <div className="relative w-64">
                <Search className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-[#5C665E] dark:text-[#8FA392]" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="بحث برقم الفاتورة أو العميل..."
                  className="w-full pr-8 pl-3 py-1.5 rounded-lg border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6]/50 dark:bg-[#17231A] text-xs text-[#1A241C] dark:text-[#F3EFE6] outline-none focus:border-[#059669]"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F3EFE6] dark:bg-[#131E18] text-[#3D4A3E] dark:text-[#C5D2C7] border-b border-[#E0D9CB] dark:border-[#243628] font-bold">
                    <th className="py-2 px-3">رقم الفاتورة</th>
                    <th className="py-2 px-3">التاريخ</th>
                    <th className="py-2 px-3">اسم العميل</th>
                    <th className="py-2 px-3">نوع الدفع</th>
                    <th className="py-2 px-3 text-center">الوعاء الضريبي</th>
                    <th className="py-2 px-3 text-center">ضريبة القيمة المضافة</th>
                    <th className="py-2 px-3 text-center">الصافي المستحق</th>
                    <th className="py-2 px-3 text-center">رقم القيد</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E0D9CB]/60 dark:divide-[#243628]/80">
                  {filteredInvoices.map((inv) => (
                    <tr key={inv.Note_No} className="hover:bg-[#F3EFE6]/50 dark:hover:bg-[#17231A]/40 transition-colors">
                      <td className="py-2 px-3 font-mono font-bold text-[#059669] dark:text-[#34D399]">
                        #{inv.Note_No}
                      </td>
                      <td className="py-2 px-3 font-mono">{inv.Note_Date?.slice(0, 10)}</td>
                      <td className="py-2 px-3 font-semibold text-[#1A241C] dark:text-[#F3EFE6]">{inv.Client_Name_A}</td>
                      <td className="py-2 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EAE6DC] dark:bg-[#202E24] text-[#3D4A3E] dark:text-[#C5D2C7]">
                          {inv.Note_Type === 0 ? 'آجل' : 'نقدي'}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center font-mono">
                        {inv.Note_Net?.toLocaleString()} ج.م
                      </td>
                      <td className="py-2 px-3 text-center font-mono text-[#059669] dark:text-[#34D399]">
                        {inv.Vat_Tax_Amount?.toLocaleString()} ج.م
                      </td>
                      <td className="py-2 px-3 text-center font-mono font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                        {inv.Note_Net_With_Tax?.toLocaleString()} ج.م
                      </td>
                      <td className="py-2 px-3 text-center font-mono text-[#5C665E] dark:text-[#8FA392]">
                        {inv.Journal_No ? `#${inv.Journal_No}` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 2: SALES RETURNS                                 */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'SALES_RETURNS' && (
        <div className="p-4 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#141E16] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E0D9CB] dark:border-[#243628] pb-3">
            <div>
              <h2 className="text-sm font-bold text-[#1A241C] dark:text-[#F3EFE6] flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-rose-500" />
                سجل مردودات وإشعارات دائنة للمبيعات (Sales Returns)
              </h2>
              <p className="text-xs text-[#5C665E] dark:text-[#8FA392]">
                تسجيل البضائع المرتجعة من العملاء وعكس القيود المحاسبية وضريبة المخرجات تلقائياً.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="bg-[#F3EFE6] dark:bg-[#131E18] text-[#3D4A3E] dark:text-[#C5D2C7] border-b border-[#E0D9CB] dark:border-[#243628] font-bold">
                  <th className="py-2.5 px-3">رقم المردود</th>
                  <th className="py-2.5 px-3">التاريخ</th>
                  <th className="py-2.5 px-3">العميل</th>
                  <th className="py-2.5 px-3">رقم الإشعار</th>
                  <th className="py-2.5 px-3 text-center">إجمالي المردودات</th>
                  <th className="py-2.5 px-3 text-center">ضريبة المردود (14%)</th>
                  <th className="py-2.5 px-3 text-center">صافي الخصم على العميل</th>
                  <th className="py-2.5 px-3 text-center">القيد العكسي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0D9CB]/60 dark:divide-[#243628]/80">
                {returns.map((ret) => (
                  <tr key={ret.Note_No} className="hover:bg-[#F3EFE6]/50 dark:hover:bg-[#17231A]/40 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-rose-600 dark:text-rose-400">
                      #{ret.Note_No}
                    </td>
                    <td className="py-2.5 px-3 font-mono">{ret.Note_Date?.slice(0, 10)}</td>
                    <td className="py-2.5 px-3 font-semibold text-[#1A241C] dark:text-[#F3EFE6]">{ret.Client_Name_A}</td>
                    <td className="py-2.5 px-3 font-mono">{ret.Issue_No || '-'}</td>
                    <td className="py-2.5 px-3 text-center font-mono">
                      {ret.Note_Net?.toLocaleString()} ج.م
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-rose-600 dark:text-rose-400">
                      {ret.Vat_Tax_Amount?.toLocaleString()} ج.م
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                      {ret.Note_Net_With_Tax?.toLocaleString()} ج.م
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-[#5C665E] dark:text-[#8FA392]">
                      {ret.Journal_No ? `#${ret.Journal_No}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 3: CLIENTS DIRECTORY & BALANCES                  */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'CLIENTS' && (
        <div className="p-4 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#141E16] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E0D9CB] dark:border-[#243628] pb-3">
            <div>
              <h2 className="text-sm font-bold text-[#1A241C] dark:text-[#F3EFE6] flex items-center gap-2">
                <Users className="w-5 h-5 text-[#059669] dark:text-[#34D399]" />
                دليل العملاء والأرصدة المدينة الحية (Clients Master)
              </h2>
              <p className="text-xs text-[#5C665E] dark:text-[#8FA392]">
                ربط حسابات العملاء بشجرة الحسابات (Level 4: 1204 / Level 5) مع مراقبة حدود الائتمان وسجل التعاملات.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAddClientModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              إضافة عميل جديد
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="bg-[#F3EFE6] dark:bg-[#131E18] text-[#3D4A3E] dark:text-[#C5D2C7] border-b border-[#E0D9CB] dark:border-[#243628] font-bold">
                  <th className="py-2.5 px-3">كود العميل</th>
                  <th className="py-2.5 px-3">اسم العميل</th>
                  <th className="py-2.5 px-3">مسؤول التواصل / الهاتف</th>
                  <th className="py-2.5 px-3">البطاقة الضريبية</th>
                  <th className="py-2.5 px-3 text-center">الحد الائتماني</th>
                  <th className="py-2.5 px-3 text-center">الرصيد المدين القائم</th>
                  <th className="py-2.5 px-3 text-center">حالة الحساب</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0D9CB]/60 dark:divide-[#243628]/80">
                {filteredClients.map((c) => (
                  <tr key={c.Client_ID} className="hover:bg-[#F3EFE6]/50 dark:hover:bg-[#17231A]/40 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-[#5C665E] dark:text-[#8FA392]">
                      {c.Client_ID}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-[#1A241C] dark:text-[#F3EFE6]">
                      {c.Client_Name_A}
                      {c.Notice && (
                        <span className="block text-[10px] text-[#5C665E] dark:text-[#8FA392] font-normal">
                          {c.Notice}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="text-[#1A241C] dark:text-[#F3EFE6]">{c.Manger_Name || '-'}</div>
                      <div className="font-mono text-[#5C665E] dark:text-[#8FA392] text-[11px]">{c.Mobile || c.Tel}</div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[#5C665E] dark:text-[#8FA392]">{c.Vat_No || '-'}</td>
                    <td className="py-2.5 px-3 text-center font-mono">
                      {c.Limit_Amount?.toLocaleString()} ج.م
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-[#059669] dark:text-[#34D399]">
                      {c.Balance?.toLocaleString()} ج.م
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EAF3EB] text-[#245E33] dark:bg-[#203325] dark:text-[#A3CFAC]">
                        نشط
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 4: QUOTATIONS & SALES ORDERS                     */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'QUOTATIONS' && (
        <div className="p-4 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#141E16] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E0D9CB] dark:border-[#243628] pb-3">
            <div>
              <h2 className="text-sm font-bold text-[#1A241C] dark:text-[#F3EFE6] flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                عروض الأسعار المعتمدة وأوامر التوريد (Offer Prices & SO)
              </h2>
              <p className="text-xs text-[#5C665E] dark:text-[#8FA392]">
                تسجيل عروض الأسعار المقدمة للمشاريع والمناقصات وتحويلها بنقرة واحدة إلى فواتير مبيعات معتمدة.
              </p>
            </div>
          </div>

          <div className="p-8 text-center text-[#5C665E] dark:text-[#8FA392] text-xs space-y-2">
            <Building className="w-10 h-10 mx-auto text-[#8FA392]/60 dark:text-[#5C665E]" />
            <p className="font-semibold text-[#1A241C] dark:text-[#F3EFE6]">
              جميع عروض الأسعار المسجلة في قاعدة البيانات مفعلة وجاهزة للربط الفوري بأوامر التوريد.
            </p>
            <p className="text-[#5C665E] dark:text-[#8FA392]">
              يمكنك تحويل أي عرض سعر مباشر إلى فاتورة مبيعات معتمدة عبر إدخال رقم أمر البيع (Sales Order) في شاشة الفاتورة.
            </p>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: ADD NEW CLIENT                                */}
      {/* ---------------------------------------------------- */}
      {isAddClientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#141E16] shadow-2xl p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#E0D9CB] dark:border-[#243628] pb-3">
              <h3 className="font-bold text-sm text-[#1A241C] dark:text-[#F3EFE6] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#059669] dark:text-[#34D399]" />
                إضافة عميل جديد وتكويده في دليل الحسابات
              </h3>
              <button
                onClick={() => setIsAddClientModalOpen(false)}
                className="text-[#5C665E] hover:text-[#1A241C] dark:hover:text-[#F3EFE6] text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#3D4A3E] dark:text-[#C5D2C7] mb-1">اسم العميل بالعربية *</label>
                <input
                  type="text"
                  required
                  value={newClientNameA}
                  onChange={(e) => setNewClientNameA(e.target.value)}
                  placeholder="مثال: شركة إعمار مصر للتنمية"
                  className="w-full px-3 py-2 rounded-lg border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6] outline-none focus:border-[#059669]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-[#3D4A3E] dark:text-[#C5D2C7] mb-1">رقم الهاتف / الموبايل</label>
                  <input
                    type="text"
                    value={newClientTel}
                    onChange={(e) => setNewClientTel(e.target.value)}
                    placeholder="010..."
                    className="w-full px-3 py-2 rounded-lg border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6] font-mono outline-none focus:border-[#059669]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#3D4A3E] dark:text-[#C5D2C7] mb-1">البطاقة الضريبية</label>
                  <input
                    type="text"
                    value={newClientVatNo}
                    onChange={(e) => setNewClientVatNo(e.target.value)}
                    placeholder="100-234-..."
                    className="w-full px-3 py-2 rounded-lg border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6] font-mono outline-none focus:border-[#059669]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-[#3D4A3E] dark:text-[#C5D2C7] mb-1">رقم السجل التجاري</label>
                  <input
                    type="text"
                    value={newClientCardNo}
                    onChange={(e) => setNewClientCardNo(e.target.value)}
                    placeholder="893741"
                    className="w-full px-3 py-2 rounded-lg border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6] font-mono outline-none focus:border-[#059669]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#3D4A3E] dark:text-[#C5D2C7] mb-1">الحد الائتماني (ج.م)</label>
                  <input
                    type="number"
                    value={newClientLimit}
                    onChange={(e) => setNewClientLimit(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6] font-mono outline-none focus:border-[#059669]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#3D4A3E] dark:text-[#C5D2C7] mb-1">العنوان والموقع</label>
                <input
                  type="text"
                  value={newClientAddress}
                  onChange={(e) => setNewClientAddress(e.target.value)}
                  placeholder="القاهرة الجديدة - التجمع الخامس..."
                  className="w-full px-3 py-2 rounded-lg border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6] outline-none focus:border-[#059669]"
                />
              </div>

              <div className="pt-3 border-t border-[#E0D9CB] dark:border-[#243628] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddClientModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-[#E0D9CB] dark:border-[#243628] text-[#5C665E] dark:text-[#C5D2C7] hover:bg-[#F3EFE6] dark:hover:bg-[#1D2B20] transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2 rounded-lg bg-[#059669] hover:bg-[#047857] text-white font-bold shadow-xs transition-colors"
                >
                  حفظ العميل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
