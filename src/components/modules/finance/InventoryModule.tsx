/**
 * ECO ERP - Inventory, Warehouses & Stock Movements Module (Phase 06)
 * High-Density Keyboard Data Entry Grid (Telerik Desktop UX)
 * Arbitrary-precision calculations via Decimal.js (Quantities, WAC, Stock Valuation)
 * Automated double-entry GL posting with multi-database routing and instant Arabic Tafqeet.
 * Source of Truth: tarabot_erp_complete_schema.json & Phase_06_InventoryItems_Spec.md
 */

import React, { useState, useEffect, useRef } from 'react';
import { Decimal } from 'decimal.js';
import {
  Package,
  Boxes,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  Scale,
  Plus,
  Trash2,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Database,
  Sparkles,
  ShieldCheck,
  Search,
  Warehouse,
  Coins,
} from 'lucide-react';
import {
  inventoryClient,
  WarehouseClientItem,
  InventoryItemClient,
  StockBalanceClientItem,
  StockMovementItem,
  CreateStockIssueClientDTO,
  CreateStockDeliveryClientDTO,
  CreateStockTransferClientDTO,
  CreateStockAdjustmentClientDTO,
  CreateWarehouseClientDTO,
  CreateItemClientDTO,
} from '../../../services/inventoryClient';
import { tafqeet } from '../../../utils/tafqeet';

Decimal.set({ precision: 28, rounding: Decimal.ROUND_HALF_UP });

export const InventoryModule: React.FC = () => {
  type ActiveTab =
    | 'STOCK_ISSUES'
    | 'STOCK_DELIVERIES'
    | 'TRANSFERS'
    | 'ADJUSTMENTS'
    | 'ITEMS_CATALOG'
    | 'WAREHOUSES';

  const [activeTab, setActiveTab] = useState<ActiveTab>('STOCK_ISSUES');

  // Master Data State
  const [warehouses, setWarehouses] = useState<WarehouseClientItem[]>([]);
  const [itemsCatalog, setItemsCatalog] = useState<InventoryItemClient[]>([]);
  const [stockBalances, setStockBalances] = useState<StockBalanceClientItem[]>([]);
  const [issues, setIssues] = useState<StockMovementItem[]>([]);
  const [deliveries, setDeliveries] = useState<StockMovementItem[]>([]);
  const [transfers, setTransfers] = useState<StockMovementItem[]>([]);
  const [adjustments, setAdjustments] = useState<StockMovementItem[]>([]);
  const [activeDb, setActiveDb] = useState<string>('MK_Khalil_Db_2026');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Alerts
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modal State for New Warehouse
  const [isAddWhModalOpen, setIsAddWhModalOpen] = useState<boolean>(false);
  const [newWhNameA, setNewWhNameA] = useState<string>('');
  const [newWhNameE, setNewWhNameE] = useState<string>('');
  const [newWhAddress, setNewWhAddress] = useState<string>('');
  const [newWhMgr, setNewWhMgr] = useState<string>('');
  const [newWhMobile, setNewWhMobile] = useState<string>('');

  // Modal State for New Item
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState<boolean>(false);
  const [newItemNameA, setNewItemNameA] = useState<string>('');
  const [newItemSort, setNewItemSort] = useState<string>('');
  const [newItemUnit, setNewItemUnit] = useState<number>(1);
  const [newItemLastCost, setNewItemLastCost] = useState<string>('100');
  const [newItemVat, setNewItemVat] = useState<string>('14.0');

  // ----------------------------------------------------
  // VOUCHER WORKBENCH STATE
  // ----------------------------------------------------
  const [voucherDate, setVoucherDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedSourceWarehouseId, setSelectedSourceWarehouseId] = useState<number>(1);
  const [selectedTargetWarehouseId, setSelectedTargetWarehouseId] = useState<number>(2);
  const [selectedCostCenterId, setSelectedCostCenterId] = useState<number>(101);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<number>(1);
  const [voucherNotice, setVoucherNotice] = useState<string>('صرف خامات ومواد بناء لزوم أعمال الموقع');

  // Grid Lines
  interface GridRow {
    sr: number;
    itemId: number;
    itemName: string;
    unit: string;
    qty: string;
    price: string;
    onHand: number;
    progBalance?: string;
    actualBalance?: string;
  }

  const [gridRows, setGridRows] = useState<GridRow[]>([
    {
      sr: 1,
      itemId: 1001,
      itemName: 'حديد تسليح عالي المقاومة 16 مم مشرشر',
      unit: 'طن',
      qty: '10',
      price: '39200.00',
      onHand: 140,
    },
    {
      sr: 2,
      itemId: 1002,
      itemName: 'أسمنت بورتلاندي عادي رتبة 42.5N مكيس',
      unit: 'طن',
      qty: '25',
      price: '2410.00',
      onHand: 320,
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
      inventoryClient.setActiveDatabaseKey(activeDb);
      const [whs, items, balances, iss, dels, trs, adjs] = await Promise.all([
        inventoryClient.getWarehouses(),
        inventoryClient.getItems(),
        inventoryClient.getStockBalances(),
        inventoryClient.getStockIssues(),
        inventoryClient.getStockDeliveries(),
        inventoryClient.getStockTransfers(),
        inventoryClient.getStockAdjustments(),
      ]);

      setWarehouses(whs);
      setItemsCatalog(items);
      setStockBalances(balances);
      setIssues(iss);
      setDeliveries(dels);
      setTransfers(trs);
      setAdjustments(adjs);

      if (whs.length > 0 && !whs.some((w) => w.Inventory_ID === selectedSourceWarehouseId)) {
        setSelectedSourceWarehouseId(whs[0].Inventory_ID);
      }
      if (whs.length > 1 && !whs.some((w) => w.Inventory_ID === selectedTargetWarehouseId)) {
        setSelectedTargetWarehouseId(whs[1].Inventory_ID);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'فشل في تحميل بيانات موديول المخازن والأصناف');
    } finally {
      setIsLoading(false);
    }
  };

  // ----------------------------------------------------
  // ARITHMETIC COMPUTATIONS VIA DECIMAL.JS
  // ----------------------------------------------------
  const computeFinancials = () => {
    let totalQty = new Decimal(0);
    let totalValuation = new Decimal(0);

    gridRows.forEach((row) => {
      const q = new Decimal(parseFloat(row.qty) || 0);
      const p = new Decimal(parseFloat(row.price) || 0);
      totalQty = totalQty.plus(q);
      totalValuation = totalValuation.plus(q.times(p));
    });

    return {
      totalQty: totalQty.toNumber(),
      totalValuation: totalValuation.toNumber(),
      netText: tafqeet(totalValuation.toNumber()),
    };
  };

  const financials = computeFinancials();

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
      const fieldsOrder = ['item', 'qty', 'price'];
      const currentIdx = fieldsOrder.indexOf(field);

      if (currentIdx !== -1 && currentIdx < fieldsOrder.length - 1) {
        const nextField = fieldsOrder[currentIdx + 1];
        const nextEl = document.getElementById(`inv-row-${rowIndex}-${nextField}`);
        nextEl?.focus();
      } else {
        // Last field of row -> jump to next row or create one
        if (rowIndex < gridRows.length - 1) {
          const nextRowEl = document.getElementById(`inv-row-${rowIndex + 1}-item`);
          nextRowEl?.focus();
        } else {
          handleAddRow();
          setTimeout(() => {
            const newRowEl = document.getElementById(`inv-row-${rowIndex + 1}-item`);
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
      Item_Name_A: 'صنف مخزني عام',
      Unit_Name_A: 'عدد',
      Average_Cost: 100,
      Current_Balance: 100,
    };

    setGridRows((prev) => [
      ...prev,
      {
        sr: prev.length + 1,
        itemId: defaultItem.Item_ID,
        itemName: defaultItem.Item_Name_A,
        unit: defaultItem.Unit_Name_A,
        qty: '1',
        price: defaultItem.Average_Cost.toFixed(2),
        onHand: defaultItem.Current_Balance || 100,
        progBalance: (defaultItem.Current_Balance || 100).toString(),
        actualBalance: (defaultItem.Current_Balance || 100).toString(),
      },
    ]);
  };

  const handleDeleteRow = (index: number) => {
    if (gridRows.length <= 1) {
      setErrorMsg('لا يمكن حذف السطر الوحيد في السند');
      return;
    }
    setGridRows((prev) => {
      const filtered = prev.filter((_, i) => i !== index);
      return filtered.map((r, i) => ({ ...r, sr: i + 1 }));
    });
  };

  const handleItemSelect = (index: number, itemId: number) => {
    const matched = itemsCatalog.find((it) => it.Item_ID === itemId);
    if (!matched) return;

    setGridRows((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        itemId: matched.Item_ID,
        itemName: matched.Item_Name_A,
        unit: matched.Unit_Name_A,
        price: matched.Average_Cost.toFixed(2),
        onHand: matched.Current_Balance || 100,
        progBalance: (matched.Current_Balance || 100).toString(),
        actualBalance: (matched.Current_Balance || 100).toString(),
      };
      return updated;
    });
  };

  const handleRowChange = (index: number, field: 'qty' | 'price' | 'actualBalance', value: string) => {
    setGridRows((prev) => {
      const updated = [...prev];
      if (field === 'actualBalance') {
        const prog = parseFloat(updated[index].progBalance || '0') || 0;
        const act = parseFloat(value) || 0;
        const diff = act - prog;
        updated[index] = { ...updated[index], actualBalance: value, qty: diff.toString() };
      } else {
        updated[index] = { ...updated[index], [field]: value };
      }
      return updated;
    });
  };

  // ----------------------------------------------------
  // SUBMIT STOCK VOUCHER WORKBENCH ACTION
  // ----------------------------------------------------
  const handleSaveVoucher = async () => {
    if (gridRows.length === 0) {
      setErrorMsg('يرجى إضافة سطر واحد على الأقل في السند المخزني');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (activeTab === 'STOCK_ISSUES') {
        // Stock Issue
        const payload: CreateStockIssueClientDTO = {
          Note_Date: voucherDate,
          Inventory_ID: selectedSourceWarehouseId,
          Costcenter_ID: selectedCostCenterId,
          Analysis_ID: selectedAnalysisId,
          Notice: voucherNotice,
          details: gridRows.map((r) => ({
            Item_ID: r.itemId,
            Item_Name_A: r.itemName,
            Unit_Name_A: r.unit,
            Qty: parseFloat(r.qty) || 0,
            Price: parseFloat(r.price) || 0,
          })),
        };

        const result = await inventoryClient.createStockIssue(payload);
        setSuccessMsg(
          `تم حفظ إذن الصرف المخزني رقم #${result.noteNo} وترحيل القيد المحاسبي رقم #${result.glNoteNo} بنجاح!`
        );
      } else if (activeTab === 'STOCK_DELIVERIES') {
        // Stock Delivery
        const payload: CreateStockDeliveryClientDTO = {
          Note_Date: voucherDate,
          Inventory_ID: selectedSourceWarehouseId,
          Costcenter_ID: selectedCostCenterId,
          Analysis_ID: selectedAnalysisId,
          Notice: voucherNotice,
          details: gridRows.map((r) => ({
            Item_ID: r.itemId,
            Item_Name_A: r.itemName,
            Unit_Name_A: r.unit,
            Qty: parseFloat(r.qty) || 0,
            Price: parseFloat(r.price) || 0,
          })),
        };

        const result = await inventoryClient.createStockDelivery(payload);
        setSuccessMsg(
          `تم حفظ إذن الإضافة المخزنية رقم #${result.noteNo} وترحيل القيد المحاسبي رقم #${result.glNoteNo} بنجاح!`
        );
      } else if (activeTab === 'TRANSFERS') {
        // Warehouse Transfer
        const payload: CreateStockTransferClientDTO = {
          Note_Date: voucherDate,
          Inventory_ID: selectedSourceWarehouseId,
          Inventory_ID1: selectedTargetWarehouseId,
          Notice: voucherNotice,
          details: gridRows.map((r) => ({
            Item_ID: r.itemId,
            Item_Name_A: r.itemName,
            Unit_Name_A: r.unit,
            Qty: parseFloat(r.qty) || 0,
            Price: parseFloat(r.price) || 0,
          })),
        };

        const result = await inventoryClient.createStockTransfer(payload);
        setSuccessMsg(
          `تم حفظ سند التحويل المخزني رقم #${result.noteNo} وترحيل القيد المحاسبي رقم #${result.glNoteNo} بنجاح!`
        );
      } else if (activeTab === 'ADJUSTMENTS') {
        // Stock Adjustment
        const payload: CreateStockAdjustmentClientDTO = {
          Note_Date: voucherDate,
          Inventory_ID: selectedSourceWarehouseId,
          Notice: voucherNotice,
          details: gridRows.map((r) => ({
            Item_ID: r.itemId,
            Item_Name_A: r.itemName,
            Unit_Name_A: r.unit,
            Qty: parseFloat(r.qty) || 0,
            Price: parseFloat(r.price) || 0,
            Prog_Balance: parseFloat(r.progBalance || '0') || 0,
            Actual_Balance: parseFloat(r.actualBalance || '0') || 0,
          })),
        };

        const result = await inventoryClient.createStockAdjustment(payload);
        setSuccessMsg(
          `تم اعتماد التسوية الجردية رقم #${result.noteNo} وترحيل القيد المحاسبي رقم #${result.glNoteNo} بنجاح!`
        );
      }

      await loadModuleData();
    } catch (err: any) {
      setErrorMsg(err.message || 'خطأ أثناء تنفيذ المعاملة المخزنية');
    } finally {
      setIsLoading(false);
    }
  };

  // ----------------------------------------------------
  // CREATE WAREHOUSE ACTION
  // ----------------------------------------------------
  const handleCreateWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWhNameA.trim()) {
      setErrorMsg('اسم المستودع بالعربية مطلوب');
      return;
    }

    setIsLoading(true);
    try {
      const dto: CreateWarehouseClientDTO = {
        Inventory_Name_A: newWhNameA,
        Inventory_Name_E: newWhNameE || newWhNameA,
        Address: newWhAddress,
        Manger_Name: newWhMgr,
        Mobile: newWhMobile,
      };

      const created = await inventoryClient.createWarehouse(dto);
      setSuccessMsg(`تم إنشاء المستودع [${created.Inventory_Name_A}] بنجاح`);
      setIsAddWhModalOpen(false);
      setNewWhNameA('');
      setNewWhNameE('');
      setNewWhAddress('');
      setNewWhMgr('');
      setNewWhMobile('');
      await loadModuleData();
    } catch (err: any) {
      setErrorMsg(err.message || 'فشل في إنشاء المستودع');
    } finally {
      setIsLoading(false);
    }
  };

  // ----------------------------------------------------
  // CREATE ITEM ACTION
  // ----------------------------------------------------
  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemNameA.trim()) {
      setErrorMsg('اسم الصنف بالعربية مطلوب');
      return;
    }

    setIsLoading(true);
    try {
      const dto: CreateItemClientDTO = {
        Item_Name_A: newItemNameA,
        Item_Sort: newItemSort,
        Default_Unit_ID: newItemUnit,
        Last_Cost: parseFloat(newItemLastCost) || 100,
        Average_Cost: parseFloat(newItemLastCost) || 100,
        Vat_Per: parseFloat(newItemVat) || 14.0,
      };

      const created = await inventoryClient.createItem(dto);
      setSuccessMsg(`تمت إضافة الصنف [${created.Item_Name_A}] إلى الدليل بنجاح`);
      setIsAddItemModalOpen(false);
      setNewItemNameA('');
      setNewItemSort('');
      await loadModuleData();
    } catch (err: any) {
      setErrorMsg(err.message || 'فشل في إضافة الصنف');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedWarehouse = warehouses.find((w) => w.Inventory_ID === selectedSourceWarehouseId);

  // Filtered Lists
  const filteredItems = itemsCatalog.filter(
    (it) =>
      it.Item_Name_A.includes(searchTerm) ||
      it.Item_ID.toString().includes(searchTerm) ||
      (it.Item_Sort && it.Item_Sort.includes(searchTerm))
  );

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-200" dir="rtl">
      {/* ---------------------------------------------------- */}
      {/* TOP COMMAND BAR & METRICS HUD                        */}
      {/* ---------------------------------------------------- */}
      <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-stone-800 bg-white dark:bg-[#111A15] shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                المخازن والأصناف والحركات (Phase 06)
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                Telerik Desktop UX
              </span>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-stone-400 font-mono">
                <Database className="w-3.5 h-3.5 text-emerald-500" />
                <select
                  value={activeDb}
                  onChange={(e) => setActiveDb(e.target.value)}
                  className="bg-transparent border-b border-dotted border-slate-300 dark:border-stone-700 text-xs font-mono font-semibold text-slate-700 dark:text-stone-300 outline-none cursor-pointer"
                >
                  <option value="MK_Khalil_Db_2026">MK_Khalil_Db_2026 (الرئيسية)</option>
                  <option value="Tarabot_Data_2026">Tarabot_Data_2026</option>
                  <option value="acc">acc</option>
                  <option value="newhope">newhope</option>
                </select>
              </div>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-stone-100 tracking-tight flex items-center gap-2">
              <Package className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              منظومة إدارة المستودعات، الأرصدة، وحركات الصرف والإضافة
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-stone-400">
              إدخال جدولى فائق السرعة، تقييم المخزون بمتوسط التكلفة المرجح (WAC)، وتحويلات بين المستودعات مع الترحيل الآلي لقيود اليومية المزدوجة المتزنة.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadModuleData}
              disabled={isLoading}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-stone-800 text-slate-700 dark:text-stone-300 hover:bg-slate-100 dark:hover:bg-stone-900 transition-colors flex items-center gap-2 text-xs font-bold"
              title="تحديث البيانات"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-500' : ''}`} />
              تحديث
            </button>
            <button
              onClick={() => setIsAddWhModalOpen(true)}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-stone-800 text-slate-700 dark:text-stone-300 hover:bg-slate-100 dark:hover:bg-stone-900 transition-colors flex items-center gap-1.5 text-xs font-bold"
            >
              <Warehouse className="w-4 h-4 text-emerald-500" />
              مستودع جديد
            </button>
            <button
              onClick={() => setIsAddItemModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-emerald-600/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              صنف جديد
            </button>
          </div>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-400 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg(null)} className="font-bold text-xs px-2 hover:opacity-75">
              ✕
            </button>
          </div>
        )}

        {successMsg && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg(null)} className="font-bold text-xs px-2 hover:opacity-75">
              ✕
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mt-5 flex items-center gap-1 border-b border-slate-200 dark:border-stone-800 overflow-x-auto">
          <button
            onClick={() => {
              setActiveTab('STOCK_ISSUES');
              setVoucherNotice('صرف خامات ومواد بناء لزوم أعمال الموقع');
            }}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'STOCK_ISSUES'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-stone-400'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            أذون الصرف المخزني (Issues)
            <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-slate-100 dark:bg-stone-800">
              {issues.length}
            </span>
          </button>
          <button
            onClick={() => {
              setActiveTab('STOCK_DELIVERIES');
              setVoucherNotice('استلام وتخزين دفعة توريد جديدة');
            }}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'STOCK_DELIVERIES'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-stone-400'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4" />
            أذون الإضافة والاستلام (Receipts)
            <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-slate-100 dark:bg-stone-800">
              {deliveries.length}
            </span>
          </button>
          <button
            onClick={() => {
              setActiveTab('TRANSFERS');
              setVoucherNotice('تحويل بضاعة بين المستودعات لتعزيز الرصيد');
            }}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'TRANSFERS'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-stone-400'
            }`}
          >
            <ArrowLeftRight className="w-4 h-4" />
            التحويلات بين المخازن (Transfers)
            <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-slate-100 dark:bg-stone-800">
              {transfers.length}
            </span>
          </button>
          <button
            onClick={() => {
              setActiveTab('ADJUSTMENTS');
              setVoucherNotice('تسوية جردية دورية للمخزون');
            }}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'ADJUSTMENTS'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-stone-400'
            }`}
          >
            <Scale className="w-4 h-4" />
            التسويات الجردية (Adjustments)
            <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-slate-100 dark:bg-stone-800">
              {adjustments.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('ITEMS_CATALOG')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'ITEMS_CATALOG'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-stone-400'
            }`}
          >
            <Boxes className="w-4 h-4" />
            دليل الأصناف والأرصدة (Items)
            <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-slate-100 dark:bg-stone-800">
              {itemsCatalog.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('WAREHOUSES')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'WAREHOUSES'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-stone-400'
            }`}
          >
            <Warehouse className="w-4 h-4" />
            دليل المستودعات (Warehouses)
            <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-slate-100 dark:bg-stone-800">
              {warehouses.length}
            </span>
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* VOUCHER ENTRY WORKBENCH (FOR ISSUES / RECEIPTS / ...) */}
      {/* ---------------------------------------------------- */}
      {(activeTab === 'STOCK_ISSUES' ||
        activeTab === 'STOCK_DELIVERIES' ||
        activeTab === 'TRANSFERS' ||
        activeTab === 'ADJUSTMENTS') && (
        <div className="space-y-4">
          {/* Header Controls Card */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-stone-800 bg-white dark:bg-[#111A15] shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {/* Source Warehouse */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-stone-300 mb-1">
                  {activeTab === 'TRANSFERS'
                    ? 'المستودع المحول منه (Source) *'
                    : 'المستودع المعني بالعملية *'}
                </label>
                <select
                  value={selectedSourceWarehouseId}
                  onChange={(e) => setSelectedSourceWarehouseId(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-stone-700 bg-slate-50 dark:bg-[#0D1F17] font-semibold text-slate-800 dark:text-stone-200 outline-none focus:border-emerald-500"
                >
                  {warehouses.map((w) => (
                    <option key={w.Inventory_ID} value={w.Inventory_ID}>
                      {w.Inventory_Name_A} ({w.Inventory_ID})
                    </option>
                  ))}
                </select>
                {selectedWarehouse && (
                  <span className="text-[11px] text-slate-400 block mt-1">
                    أمين العهدة: {selectedWarehouse.Manger_Name || 'المسؤول المعتمد'}
                  </span>
                )}
              </div>

              {/* Target Warehouse (Only for Transfers) */}
              {activeTab === 'TRANSFERS' && (
                <div>
                  <label className="block font-bold text-slate-700 dark:text-stone-300 mb-1">
                    المستودع المستلم (Target Warehouse) *
                  </label>
                  <select
                    value={selectedTargetWarehouseId}
                    onChange={(e) => setSelectedTargetWarehouseId(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-stone-700 bg-slate-50 dark:bg-[#0D1F17] font-semibold text-slate-800 dark:text-stone-200 outline-none focus:border-emerald-500"
                  >
                    {warehouses.map((w) => (
                      <option key={w.Inventory_ID} value={w.Inventory_ID}>
                        {w.Inventory_Name_A} ({w.Inventory_ID})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Voucher Date */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-stone-300 mb-1">
                  تاريخ الحركة المخزنية *
                </label>
                <input
                  type="date"
                  value={voucherDate}
                  onChange={(e) => setVoucherDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-stone-700 bg-slate-50 dark:bg-[#0D1F17] font-mono font-semibold text-slate-800 dark:text-stone-200 outline-none focus:border-emerald-500"
                />
              </div>

              {/* Cost Center / Department */}
              {(activeTab === 'STOCK_ISSUES' || activeTab === 'STOCK_DELIVERIES') && (
                <div>
                  <label className="block font-bold text-slate-700 dark:text-stone-300 mb-1">
                    مركز التكلفة / المشروع المستفيد *
                  </label>
                  <select
                    value={selectedCostCenterId}
                    onChange={(e) => setSelectedCostCenterId(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-stone-700 bg-slate-50 dark:bg-[#0D1F17] font-semibold text-slate-800 dark:text-stone-200 outline-none focus:border-emerald-500"
                  >
                    <option value={101}>مشروع المونوريل - شرق النيل (101)</option>
                    <option value={102}>مشروع العاصمة الإدارية R5 (102)</option>
                    <option value={103}>مشروع مدينتي مجموعة B12 (103)</option>
                    <option value={104}>قسم التشغيل والصيانة المركزية (104)</option>
                  </select>
                </div>
              )}

              {/* Analysis / Activity */}
              {(activeTab === 'STOCK_ISSUES' || activeTab === 'STOCK_DELIVERIES') && (
                <div>
                  <label className="block font-bold text-slate-700 dark:text-stone-300 mb-1">
                    الحساب التحليلي / البند (Analysis)
                  </label>
                  <select
                    value={selectedAnalysisId}
                    onChange={(e) => setSelectedAnalysisId(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-stone-700 bg-slate-50 dark:bg-[#0D1F17] font-semibold text-slate-800 dark:text-stone-200 outline-none focus:border-emerald-500"
                  >
                    <option value={1}>بند خرسانات وأعمال مدنية (1)</option>
                    <option value={2}>بند تشطيبات ومباني (2)</option>
                    <option value={3}>بند شبكات وكهروميكانيك (3)</option>
                    <option value={4}>مصاريف موقع وتشغيل (4)</option>
                  </select>
                </div>
              )}

              {/* Notice / Remarks */}
              <div className={activeTab === 'TRANSFERS' ? 'lg:col-span-2' : ''}>
                <label className="block font-bold text-slate-700 dark:text-stone-300 mb-1">
                  البيان والملاحظات العامة
                </label>
                <input
                  type="text"
                  value={voucherNotice}
                  onChange={(e) => setVoucherNotice(e.target.value)}
                  placeholder="ملاحظات وتفاصيل السند المخزني..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-stone-700 bg-slate-50 dark:bg-[#0D1F17] text-slate-800 dark:text-stone-200 outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* High-Density Keyboard Data Entry Grid (Telerik Desktop UX) */}
          <div className="rounded-xl border border-slate-200 dark:border-stone-800 bg-white dark:bg-[#111A15] shadow-xs overflow-hidden">
            <div className="p-3 bg-slate-50 dark:bg-[#16231D] border-b border-slate-200 dark:border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-slate-800 dark:text-stone-200">
                  بنود الأصناف والكميات
                </span>
                <span className="text-[11px] text-slate-500 dark:text-stone-400">
                  (التنقل السريع بـ <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-stone-700 rounded text-[10px]">Enter</kbd> | <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-stone-700 rounded text-[10px]">Insert</kbd> لإضافة سطر)
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
                  <tr className="bg-slate-100 dark:bg-[#131E18] text-slate-700 dark:text-stone-300 border-b border-slate-200 dark:border-stone-800 font-bold">
                    <th className="py-2.5 px-3 w-12 text-center">م</th>
                    <th className="py-2.5 px-3 w-72">كود واسم الصنف (Item)</th>
                    <th className="py-2.5 px-3 w-20 text-center">الوحدة</th>
                    <th className="py-2.5 px-3 w-24 text-center">الرصيد المتاح</th>
                    {activeTab === 'ADJUSTMENTS' && (
                      <th className="py-2.5 px-3 w-28 text-center">الرصيد الفعلي</th>
                    )}
                    <th className="py-2.5 px-3 w-28 text-center">
                      {activeTab === 'ADJUSTMENTS' ? 'فرق الجرد' : 'الكمية المطلوبة'}
                    </th>
                    <th className="py-2.5 px-3 w-32 text-center">تكلفة الوحدة (ج.م)</th>
                    <th className="py-2.5 px-3 w-36 text-center">إجمالي القيمة</th>
                    <th className="py-2.5 px-3 w-14 text-center">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-stone-800">
                  {gridRows.map((row, idx) => {
                    const q = parseFloat(row.qty) || 0;
                    const p = parseFloat(row.price) || 0;
                    const lineVal = q * p;

                    return (
                      <tr
                        key={idx}
                        className="hover:bg-slate-50/75 dark:hover:bg-stone-900/50 transition-colors"
                      >
                        <td className="py-2 px-3 text-center font-mono font-bold text-slate-400">
                          {row.sr}
                        </td>
                        <td className="py-2 px-3">
                          <select
                            id={`inv-row-${idx}-item`}
                            value={row.itemId}
                            onChange={(e) => handleItemSelect(idx, parseInt(e.target.value, 10))}
                            onKeyDown={(e) => handleKeyDown(e, idx, 'item')}
                            className="w-full px-2.5 py-1.5 rounded border border-slate-200 dark:border-stone-700 bg-white dark:bg-[#0D1F17] font-semibold text-slate-800 dark:text-stone-200 outline-none focus:border-emerald-500"
                          >
                            {itemsCatalog.map((it) => (
                              <option key={it.Item_ID} value={it.Item_ID}>
                                [{it.Item_ID}] {it.Item_Name_A}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span className="px-2 py-1 rounded bg-slate-100 dark:bg-stone-800 text-[11px] font-bold text-slate-600 dark:text-stone-300">
                            {row.unit}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center font-mono font-bold text-slate-600 dark:text-stone-400">
                          {row.onHand.toLocaleString()}
                        </td>
                        {activeTab === 'ADJUSTMENTS' && (
                          <td className="py-2 px-3 text-center">
                            <input
                              type="number"
                              step="0.01"
                              value={row.actualBalance || ''}
                              onChange={(e) => handleRowChange(idx, 'actualBalance', e.target.value)}
                              className="w-full px-2.5 py-1.5 text-center font-mono font-bold rounded border border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/20 text-slate-900 dark:text-stone-100 outline-none focus:border-amber-500"
                            />
                          </td>
                        )}
                        <td className="py-2 px-3 text-center">
                          <input
                            id={`inv-row-${idx}-qty`}
                            type="number"
                            step="0.01"
                            value={row.qty}
                            onChange={(e) => handleRowChange(idx, 'qty', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, idx, 'qty')}
                            className="w-full px-2.5 py-1.5 text-center font-mono font-bold rounded border border-slate-200 dark:border-stone-700 bg-white dark:bg-[#0D1F17] text-slate-900 dark:text-stone-100 outline-none focus:border-emerald-500"
                          />
                        </td>
                        <td className="py-2 px-3 text-center">
                          <input
                            id={`inv-row-${idx}-price`}
                            type="number"
                            step="0.01"
                            value={row.price}
                            onChange={(e) => handleRowChange(idx, 'price', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, idx, 'price')}
                            className="w-full px-2.5 py-1.5 text-center font-mono font-bold rounded border border-slate-200 dark:border-stone-700 bg-white dark:bg-[#0D1F17] text-slate-900 dark:text-stone-100 outline-none focus:border-emerald-500"
                          />
                        </td>
                        <td className="py-2 px-3 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {lineVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteRow(idx)}
                            className="p-1 rounded text-rose-500 hover:bg-rose-500/10 transition-colors"
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
            <div className="lg:col-span-2 p-4 rounded-xl border border-slate-200 dark:border-stone-800 bg-white dark:bg-[#111A15] shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-stone-800 pb-2">
                <span className="font-bold text-xs text-slate-800 dark:text-stone-200 flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-emerald-500" />
                  ملخص الكميات وتقييم المخزون (Stock Valuation HUD)
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  عدد البنود: {gridRows.length} صنف
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#16231D]">
                  <span className="text-[11px] text-slate-500 dark:text-stone-400 block mb-1">
                    إجمالي الكميات المنفذة
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-stone-100 text-base">
                    {financials.totalQty.toLocaleString()} وحدة
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/20">
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-400 block mb-1">
                    إجمالي التقييم المالي للسند
                  </span>
                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 text-base">
                    {financials.totalValuation.toLocaleString(undefined, { minimumFractionDigits: 2 })} ج.م
                  </span>
                </div>
              </div>

              {/* Tafqeet Banner */}
              <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-md shadow-emerald-600/20">
                <div>
                  <span className="text-xs text-emerald-100 font-semibold block">
                    إجمالي القيمة المخزنية تفقيطاً
                  </span>
                  <span className="text-base sm:text-lg font-bold leading-tight">
                    {financials.netText}
                  </span>
                </div>
              </div>
            </div>

            {/* Automated GL Double-Entry Preview Card */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-stone-800 bg-white dark:bg-[#111A15] shadow-xs flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-stone-800 pb-2">
                  <span className="font-bold text-xs text-slate-800 dark:text-stone-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    القيد المحاسبي المزدوج التلقائي
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    متزن 100%
                  </span>
                </div>

                <div className="mt-2 space-y-2 text-xs font-mono">
                  {activeTab === 'STOCK_ISSUES' && (
                    <>
                      <div className="flex justify-between items-center text-emerald-700 dark:text-emerald-400">
                        <span>من حـ/ مشروعات تحت التنفيذ (3102001):</span>
                        <span className="font-bold">{financials.totalValuation.toLocaleString()} مدين</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-600 dark:text-stone-300">
                        <span>إلى حـ/ مخزون الخامات (1203001):</span>
                        <span className="font-bold">{financials.totalValuation.toLocaleString()} دائن</span>
                      </div>
                    </>
                  )}
                  {activeTab === 'STOCK_DELIVERIES' && (
                    <>
                      <div className="flex justify-between items-center text-emerald-700 dark:text-emerald-400">
                        <span>من حـ/ مخزون الخامات (1203001):</span>
                        <span className="font-bold">{financials.totalValuation.toLocaleString()} مدين</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-600 dark:text-stone-300">
                        <span>إلى حـ/ الإنتاج والتسويات (3101001):</span>
                        <span className="font-bold">{financials.totalValuation.toLocaleString()} دائن</span>
                      </div>
                    </>
                  )}
                  {activeTab === 'TRANSFERS' && (
                    <>
                      <div className="flex justify-between items-center text-emerald-700 dark:text-emerald-400">
                        <span>من حـ/ مخزون مستودع مستلم:</span>
                        <span className="font-bold">{financials.totalValuation.toLocaleString()} مدين</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-600 dark:text-stone-300">
                        <span>إلى حـ/ مخزون مستودع محول منه:</span>
                        <span className="font-bold">{financials.totalValuation.toLocaleString()} دائن</span>
                      </div>
                    </>
                  )}
                  {activeTab === 'ADJUSTMENTS' && (
                    <>
                      <div className="flex justify-between items-center text-amber-700 dark:text-amber-400">
                        <span>تسوية فروق وعجز / زيادة الجرد:</span>
                        <span className="font-bold">{financials.totalValuation.toLocaleString()} ج.م</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={handleSaveVoucher}
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/30 transition-all disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isLoading ? 'جاري الترحيل...' : 'حفظ السند وترحيل القيد آلياً'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 5: ITEMS CATALOG & STOCK BALANCES                */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'ITEMS_CATALOG' && (
        <div className="p-4 rounded-xl border border-slate-200 dark:border-stone-800 bg-white dark:bg-[#111A15] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-stone-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-stone-100 flex items-center gap-2">
                <Boxes className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                دليل الأصناف وبطاقات التكلفة والأرصدة الحية (Items Master)
              </h2>
              <p className="text-xs text-slate-500 dark:text-stone-400">
                كود الصنف، الباركود، متوسط التكلفة المرجح (WAC)، سعر البيع، والأرصدة المتاحة في المستودعات (إجمالي سجلات الأرصدة المتصلة: {stockBalances.length} رصيد مستودعي).
              </p>
            </div>
            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="بحث باسم الصنف أو الكود..."
                className="w-full pr-8 pl-3 py-1.5 rounded-lg border border-slate-200 dark:border-stone-800 bg-slate-50 dark:bg-[#0D1F17] text-xs outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#16231D] text-slate-700 dark:text-stone-300 border-b border-slate-200 dark:border-stone-800 font-bold">
                  <th className="py-2.5 px-3">كود الصنف</th>
                  <th className="py-2.5 px-3">اسم الصنف والمواصفة</th>
                  <th className="py-2.5 px-3 text-center">الوحدة</th>
                  <th className="py-2.5 px-3 text-center">متوسط التكلفة (WAC)</th>
                  <th className="py-2.5 px-3 text-center">آخر سعر شراء</th>
                  <th className="py-2.5 px-3 text-center">سعر البيع</th>
                  <th className="py-2.5 px-3 text-center">الرصيد القائم</th>
                  <th className="py-2.5 px-3 text-center">إجمالي التقييم</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-stone-800">
                {filteredItems.map((it) => (
                  <tr key={it.Item_ID} className="hover:bg-slate-50 dark:hover:bg-stone-900/40">
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      #{it.Item_ID}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-stone-100">
                      {it.Item_Name_A}
                      {it.Item_Sort && (
                        <span className="block text-[10px] text-slate-400 font-mono">
                          رمز: {it.Item_Sort}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-stone-800">
                        {it.Unit_Name_A}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-800 dark:text-stone-200">
                      {it.Average_Cost?.toLocaleString()} ج.م
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-500">
                      {it.Last_Cost?.toLocaleString()} ج.م
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {it.Retail_Price ? `${it.Retail_Price.toLocaleString()} ج.م` : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-900 dark:text-stone-100">
                      {it.Current_Balance?.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-teal-600 dark:text-teal-400">
                      {it.Total_Valuation?.toLocaleString()} ج.م
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 6: WAREHOUSES MASTER DIRECTORY                   */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'WAREHOUSES' && (
        <div className="p-4 rounded-xl border border-slate-200 dark:border-stone-800 bg-white dark:bg-[#111A15] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-stone-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-stone-100 flex items-center gap-2">
                <Warehouse className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                دليل المستودعات وأمناء العهدة (Warehouses Directory)
              </h2>
              <p className="text-xs text-slate-500 dark:text-stone-400">
                قائمة المستودعات المركزية ومخازن المواقع المرتبطة بحسابات مراقبة المخزون.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAddWhModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              إضافة مستودع جديد
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {warehouses.map((wh) => (
              <div
                key={wh.Inventory_ID}
                className="p-4 rounded-xl border border-slate-200 dark:border-stone-800 bg-slate-50/50 dark:bg-[#131E18] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900 dark:text-stone-100">
                    {wh.Inventory_Name_A}
                  </span>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold">
                    كود: {wh.Inventory_ID}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-stone-400">
                  {wh.Notice || 'مستودع تشغيل معتمد'}
                </p>
                <div className="pt-2 border-t border-slate-200 dark:border-stone-800 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">أمين المخزن:</span>
                    <span className="font-semibold text-slate-800 dark:text-stone-200">
                      {wh.Manger_Name || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">الهاتف / الموبايل:</span>
                    <span className="font-mono text-slate-800 dark:text-stone-200">
                      {wh.Mobile || wh.Tel || '-'}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[11px]">الموقع والعنوان:</span>
                    <span className="text-slate-700 dark:text-stone-300">
                      {wh.Address || 'المنطقة الصناعية'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: ADD NEW WAREHOUSE                             */}
      {/* ---------------------------------------------------- */}
      {isAddWhModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-stone-800 bg-white dark:bg-[#111A15] shadow-2xl p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-stone-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-stone-100 flex items-center gap-2">
                <Warehouse className="w-4 h-4 text-emerald-500" />
                إضافة مستودع / مخزن موقع جديد
              </h3>
              <button
                onClick={() => setIsAddWhModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-stone-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateWarehouse} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-stone-300 mb-1">اسم المستودع بالعربية *</label>
                <input
                  type="text"
                  required
                  value={newWhNameA}
                  onChange={(e) => setNewWhNameA(e.target.value)}
                  placeholder="مثال: مستودع مشروع رأس الحكمة R2"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-stone-700 bg-white dark:bg-[#0D1F17] outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-stone-300 mb-1">اسم المستودع بالإنجليزية</label>
                <input
                  type="text"
                  value={newWhNameE}
                  onChange={(e) => setNewWhNameE(e.target.value)}
                  placeholder="Ras El Hekma Project Store R2"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-stone-700 bg-white dark:bg-[#0D1F17] outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-stone-300 mb-1">أمين العهدة / المدير</label>
                  <input
                    type="text"
                    value={newWhMgr}
                    onChange={(e) => setNewWhMgr(e.target.value)}
                    placeholder="م. أسامة خليل"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-stone-700 bg-white dark:bg-[#0D1F17] outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-stone-300 mb-1">رقم الهاتف</label>
                  <input
                    type="text"
                    value={newWhMobile}
                    onChange={(e) => setNewWhMobile(e.target.value)}
                    placeholder="010..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-stone-700 bg-white dark:bg-[#0D1F17] font-mono outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-stone-300 mb-1">الموقع والعنوان</label>
                <input
                  type="text"
                  value={newWhAddress}
                  onChange={(e) => setNewWhAddress(e.target.value)}
                  placeholder="الساحل الشمالي - مطروح..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-stone-700 bg-white dark:bg-[#0D1F17] outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-stone-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddWhModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-stone-700 text-slate-600 dark:text-stone-400 hover:bg-slate-100 dark:hover:bg-stone-900"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/25"
                >
                  حفظ المستودع
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: ADD NEW ITEM                                  */}
      {/* ---------------------------------------------------- */}
      {isAddItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-stone-800 bg-white dark:bg-[#111A15] shadow-2xl p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-stone-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-stone-100 flex items-center gap-2">
                <Boxes className="w-4 h-4 text-emerald-500" />
                إضافة بطاقة صنف جديدة لدليل المخازن
              </h3>
              <button
                onClick={() => setIsAddItemModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-stone-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-stone-300 mb-1">اسم الصنف والمواصفة *</label>
                <input
                  type="text"
                  required
                  value={newItemNameA}
                  onChange={(e) => setNewItemNameA(e.target.value)}
                  placeholder="مثال: طوب أسمنتي مصمت 25×12×6 سم"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-stone-700 bg-white dark:bg-[#0D1F17] outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-stone-300 mb-1">الرمز / كود الباركود</label>
                  <input
                    type="text"
                    value={newItemSort}
                    onChange={(e) => setNewItemSort(e.target.value)}
                    placeholder="BRK-25"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-stone-700 bg-white dark:bg-[#0D1F17] font-mono outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-stone-300 mb-1">وحدة القياس</label>
                  <select
                    value={newItemUnit}
                    onChange={(e) => setNewItemUnit(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-stone-700 bg-white dark:bg-[#0D1F17] outline-none focus:border-emerald-500"
                  >
                    <option value={1}>طن</option>
                    <option value={2}>متر مكعب</option>
                    <option value={3}>ألف طوبة</option>
                    <option value={4}>عدد</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-stone-300 mb-1">سعر التكلفة الافتراضي (ج.م)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newItemLastCost}
                    onChange={(e) => setNewItemLastCost(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-stone-700 bg-white dark:bg-[#0D1F17] font-mono outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-stone-300 mb-1">نسبة ضريبة القيمة المضافة (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newItemVat}
                    onChange={(e) => setNewItemVat(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-stone-700 bg-white dark:bg-[#0D1F17] font-mono outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-stone-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddItemModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-stone-700 text-slate-600 dark:text-stone-400 hover:bg-slate-100 dark:hover:bg-stone-900"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/25"
                >
                  حفظ الصنف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
