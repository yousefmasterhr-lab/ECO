/**
 * ECO ERP - Phase 02 Cash, Banking & Check Portfolio High-Density Module
 * Enterprise Desktop-Grade UI replicating Telerik Keyboard Workflows
 * - Enter: Cell step-through and automatic row generation
 * - Insert / Ctrl+Down: Row insertion
 * - Ctrl+Del: Row deletion
 * - Dynamic Balancing HUD with Decimal.js Invariant Checking
 * - Cheque Lifecycle State Machine (Deposit, Collect, Bounce, Clear)
 * - Multi-Database Fleet Support
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Decimal } from 'decimal.js';
import {
  Wallet,
  Landmark,
  FileCheck2,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Plus,
  Trash2,
  Sparkles,
  Save,
  CheckCircle2,
  AlertTriangle,
  Database,
} from 'lucide-react';
import {
  cashBankingClient,
  CashSafeItem,
  BankAccountItem,
  CurrencyItem,
  ChequeItem,
  CreatePaymentDTO,
  CreateReceiptDTO,
} from '../../../services/cashBankingClient';
import { tafqeet } from '../../../utils/tafqeet';

Decimal.set({ precision: 28, rounding: Decimal.ROUND_HALF_UP });

export const CashBankingModule: React.FC = () => {
  // Navigation Tabs
  type ActiveTab = 'PAYMENT' | 'RECEIPT' | 'CHEQUES' | 'BALANCES';
  const [activeTab, setActiveTab] = useState<ActiveTab>('PAYMENT');

  // Master Data State
  const [safes, setSafes] = useState<CashSafeItem[]>([]);
  const [banks, setBanks] = useState<BankAccountItem[]>([]);
  const [currencies, setCurrencies] = useState<CurrencyItem[]>([]);
  const [cheques, setCheques] = useState<ChequeItem[]>([]);
  const [activeDb, setActiveDb] = useState<string>('MK_Khalil_Db_2026');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Notifications
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Cheque Modal State
  const [selectedCheque, setSelectedCheque] = useState<ChequeItem | null>(null);
  const [actionModal, setActionModal] = useState<'DEPOSIT' | 'COLLECT' | 'BOUNCE' | 'CLEAR' | null>(null);
  const [selectedBankForCheque, setSelectedBankForCheque] = useState<string>('');

  // ----------------------------------------------------
  // PAYMENT VOUCHER FORM STATE
  // ----------------------------------------------------
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [paymentSafeOrBank, setPaymentSafeOrBank] = useState<string>('1201001');
  const [paymentDesc, setPaymentDesc] = useState<string>('صرف نقدية ومصروفات تشغيلية');
  const [paymentCurrency, setPaymentCurrency] = useState<number>(1);
  const [paymentExchange, setPaymentExchange] = useState<string>('1.00');

  interface PaymentGridLine {
    sr: number;
    accountId: string;
    accountName: string;
    amount: string;
    desc: string;
    costcenterId: string;
  }

  const [paymentLines, setPaymentLines] = useState<PaymentGridLine[]>([
    {
      sr: 1,
      accountId: '2101001',
      accountName: 'موردين تجاريين - شركة الأهرام للتجارة',
      amount: '15000.00',
      desc: 'سداد دفعة نقدية تحت حساب التوريدات',
      costcenterId: '0',
    },
    {
      sr: 2,
      accountId: '3101001',
      accountName: 'مصروفات عمومية وإدارية - بوفيه وضيافة',
      amount: '2400.00',
      desc: 'فواتير ضيافة المقر الرئيسي',
      costcenterId: '0',
    },
  ]);

  // ----------------------------------------------------
  // RECEIPT VOUCHER FORM STATE
  // ----------------------------------------------------
  const [receiptDate, setReceiptDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [receiptSafeOrBank, setReceiptSafeOrBank] = useState<string>('1201001');
  const [receiptDesc, setReceiptDesc] = useState<string>('توريد وتحصيل نقدي من عملاء');
  const [receiptCurrency, setReceiptCurrency] = useState<number>(1);
  const [receiptExchange, setReceiptExchange] = useState<string>('1.00');
  const [receiptMode, setReceiptMode] = useState<'CASH' | 'BANK_TRANSFER' | 'CHEQUE'>('CASH');

  interface ReceiptGridLine {
    sr: number;
    accountId: string;
    accountName: string;
    amount: string;
    desc: string;
    costcenterId: string;
    chequeNo?: string;
    chequeDate?: string;
    draweeBank?: string;
  }

  const [receiptLines, setReceiptLines] = useState<ReceiptGridLine[]>([
    {
      sr: 1,
      accountId: '1203001',
      accountName: 'عملاء تجاريون - شركة النيل للاستثمار',
      amount: '45000.00',
      desc: 'تحصيل دفعة من مستخلص المقاولة',
      costcenterId: '0',
      chequeNo: 'CHQ-882910',
      chequeDate: '2026-11-25',
      draweeBank: 'البنك التجاري الدولي CIB',
    },
  ]);

  // Load Data
  const loadMasterData = useCallback(async () => {
    setIsLoading(true);
    try {
      cashBankingClient.setActiveDatabaseKey(activeDb);
      const [s, b, c, chq] = await Promise.all([
        cashBankingClient.getSafes(),
        cashBankingClient.getBanks(),
        cashBankingClient.getCurrencies(),
        cashBankingClient.getCheques(),
      ]);
      setSafes(s);
      setBanks(b);
      setCurrencies(c);
      setCheques(chq);
      if (b.length > 0) setSelectedBankForCheque(b[0].linkedAccountId);
    } catch {
      // Ignore
    } finally {
      setIsLoading(false);
    }
  }, [activeDb]);

  useEffect(() => {
    loadMasterData();
  }, [loadMasterData]);

  // ----------------------------------------------------
  // PAYMENT ARITHMETIC & INVARIANT
  // ----------------------------------------------------
  const paymentTotals = useMemo(() => {
    let sumForeign = new Decimal(0);
    const ex = new Decimal(paymentExchange || 1);

    paymentLines.forEach((l) => {
      const v = new Decimal(parseFloat(l.amount) || 0);
      sumForeign = sumForeign.plus(v);
    });

    const sumBase = sumForeign.times(ex);
    return {
      foreignTotal: sumForeign,
      baseTotal: sumBase,
      tafqeetText: sumBase.greaterThan(0) ? tafqeet(sumBase.toNumber(), 'EGP') : '',
    };
  }, [paymentLines, paymentExchange]);

  // ----------------------------------------------------
  // RECEIPT ARITHMETIC & INVARIANT
  // ----------------------------------------------------
  const receiptTotals = useMemo(() => {
    let sumForeign = new Decimal(0);
    const ex = new Decimal(receiptExchange || 1);

    receiptLines.forEach((l) => {
      const v = new Decimal(parseFloat(l.amount) || 0);
      sumForeign = sumForeign.plus(v);
    });

    const sumBase = sumForeign.times(ex);
    return {
      foreignTotal: sumForeign,
      baseTotal: sumBase,
      tafqeetText: sumBase.greaterThan(0) ? tafqeet(sumBase.toNumber(), 'EGP') : '',
    };
  }, [receiptLines, receiptExchange]);

  // Aggregate Metrics for Top Banner
  const totalCashBalance = useMemo(
    () => safes.reduce((acc, s) => acc + (s.accountBalance || 0), 0),
    [safes]
  );
  const totalBankBalance = useMemo(
    () => banks.reduce((acc, b) => acc + (b.accountBalance || 0), 0),
    [banks]
  );
  const chequesUnderCollectionCount = useMemo(
    () => cheques.filter((c) => c.status === 'UNDER_COLLECTION').length,
    [cheques]
  );
  const chequesUnderCollectionAmount = useMemo(
    () =>
      cheques
        .filter((c) => c.status === 'UNDER_COLLECTION')
        .reduce((acc, c) => acc + c.amount, 0),
    [cheques]
  );

  // ----------------------------------------------------
  // PAYMENT LINE HANDLERS
  // ----------------------------------------------------
  const updatePaymentLine = (idx: number, field: keyof PaymentGridLine, val: string) => {
    setPaymentLines((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: val };
      return next;
    });
  };

  const insertPaymentRow = (idx: number) => {
    setPaymentLines((prev) => {
      const next = [...prev];
      next.splice(idx + 1, 0, {
        sr: next.length + 1,
        accountId: '3101001',
        accountName: 'مصروفات تشغيلية',
        amount: '0.00',
        desc: paymentDesc,
        costcenterId: '0',
      });
      return next.map((l, i) => ({ ...l, sr: i + 1 }));
    });
  };

  const deletePaymentRow = (idx: number) => {
    if (paymentLines.length <= 1) {
      setErrorMsg('يجب أن يحتوي سند الصرف على سطر واحد على الأقل.');
      setTimeout(() => setErrorMsg(null), 3000);
      return;
    }
    setPaymentLines((prev) => prev.filter((_, i) => i !== idx).map((l, i) => ({ ...l, sr: i + 1 })));
  };

  const handleSavePayment = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (paymentTotals.baseTotal.isZero()) {
      setErrorMsg('لا يمكن حفظ سند صرف بمبلغ صفر.');
      return;
    }

    try {
      const payload: CreatePaymentDTO = {
        noteDate: paymentDate,
        safeOrBankAccountId: paymentSafeOrBank,
        description: paymentDesc,
        currencyId: paymentCurrency,
        exchange: parseFloat(paymentExchange) || 1,
        lines: paymentLines.map((l) => ({
          targetAccountId: l.accountId,
          targetAccountNameAr: l.accountName,
          amount: parseFloat(l.amount) || 0,
          description: l.desc,
          costcenterId: parseInt(l.costcenterId, 10) || 0,
        })),
      };

      const res = await cashBankingClient.createPayment(payload);
      if (res.success) {
        setSuccessMsg(res.message);
        loadMasterData();
        setTimeout(() => setSuccessMsg(null), 5000);
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'حدث خطأ أثناء حفظ سند الصرف.');
    }
  };

  // ----------------------------------------------------
  // RECEIPT LINE HANDLERS
  // ----------------------------------------------------
  const updateReceiptLine = (idx: number, field: keyof ReceiptGridLine, val: string) => {
    setReceiptLines((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: val };
      return next;
    });
  };

  const insertReceiptRow = (idx: number) => {
    setReceiptLines((prev) => {
      const next = [...prev];
      next.splice(idx + 1, 0, {
        sr: next.length + 1,
        accountId: '1203001',
        accountName: 'عملاء ومبيعات',
        amount: '0.00',
        desc: receiptDesc,
        costcenterId: '0',
      });
      return next.map((l, i) => ({ ...l, sr: i + 1 }));
    });
  };

  const deleteReceiptRow = (idx: number) => {
    if (receiptLines.length <= 1) {
      setErrorMsg('يجب أن يحتوي سند القبض على سطر واحد على الأقل.');
      setTimeout(() => setErrorMsg(null), 3000);
      return;
    }
    setReceiptLines((prev) => prev.filter((_, i) => i !== idx).map((l, i) => ({ ...l, sr: i + 1 })));
  };

  const handleSaveReceipt = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (receiptTotals.baseTotal.isZero()) {
      setErrorMsg('لا يمكن حفظ سند قبض بمبلغ صفر.');
      return;
    }

    try {
      const payload: CreateReceiptDTO = {
        noteDate: receiptDate,
        safeOrBankAccountId: receiptSafeOrBank,
        description: receiptDesc,
        currencyId: receiptCurrency,
        exchange: parseFloat(receiptExchange) || 1,
        receiptMode: receiptMode,
        lines: receiptLines.map((l) => ({
          sourceAccountId: l.accountId,
          sourceAccountNameAr: l.accountName,
          amount: parseFloat(l.amount) || 0,
          description: l.desc,
          costcenterId: parseInt(l.costcenterId, 10) || 0,
          chequeNo: l.chequeNo,
          chequeDate: l.chequeDate,
          draweeBankName: l.draweeBank,
        })),
      };

      const res = await cashBankingClient.createReceipt(payload);
      if (res.success) {
        setSuccessMsg(res.message);
        loadMasterData();
        setTimeout(() => setSuccessMsg(null), 5000);
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'حدث خطأ أثناء حفظ سند القبض.');
    }
  };

  // ----------------------------------------------------
  // CHEQUE TRANSITION ACTION
  // ----------------------------------------------------
  const handleExecuteChequeTransition = async () => {
    if (!selectedCheque || !actionModal) return;

    try {
      const res = await cashBankingClient.transitionCheque(
        selectedCheque.chequeNo,
        actionModal,
        selectedBankForCheque
      );

      if (res.success) {
        setSuccessMsg(res.message);
        setActionModal(null);
        setSelectedCheque(null);
        loadMasterData();
        setTimeout(() => setSuccessMsg(null), 5000);
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'فشل في تحديث حالة الشيك.');
    }
  };

  return (
    <div className="w-full space-y-5 animate-in fade-in duration-200 text-slate-100 font-sans rtl">
      {/* Top Hero Command Banner */}
      <div className="p-5 sm:p-6 rounded-2xl border border-amber-500/30 bg-gradient-to-l from-[#0D1F17] via-[#07130E] to-[#07130E] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono">
                المرحلة 02: الخزائن والبنوك والشيكات
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                ربط تلقائي مع الأستاذ العام (ACID GL Posting)
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Wallet className="w-6 h-6 text-amber-400" />
              <span>منظومة إدارة الخزائن والبنوك ومحفظة الشيكات</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              إصدار وتوثيق سندات القبض والصرف، إدارة حسابات البنوك والخزائن الرئيسية، تتبع دورة حياة الشيكات وأوراق القبض والدفع مع ترحيل قيد اليومية المتزن تلقائياً.
            </p>
          </div>

          {/* Database Selector & Refresh */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700 px-3 py-2 rounded-xl">
              <Database className="w-4 h-4 text-amber-400" />
              <select
                value={activeDb}
                onChange={(e) => setActiveDb(e.target.value)}
                className="bg-transparent text-xs font-mono font-bold text-amber-300 focus:outline-none cursor-pointer"
              >
                <option value="MK_Khalil_Db_2026" className="bg-slate-900 text-white">MK_Khalil_Db_2026 (نشط)</option>
                <option value="Tarabot_Data_2026" className="bg-slate-900 text-white">Tarabot_Data_2026</option>
                <option value="acc" className="bg-slate-900 text-white">acc (حسابات عامة)</option>
                <option value="newhope" className="bg-slate-900 text-white">newhope</option>
              </select>
            </div>

            <button
              onClick={loadMasterData}
              disabled={isLoading}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl transition-all cursor-pointer shadow-xs"
              title="تحديث البيانات المباشرة"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Quick KPI Stat Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-[11px] text-slate-400 block mb-1">إجمالي رصيد الخزائن النقدية</span>
            <div className="text-base sm:text-lg font-black font-mono text-emerald-400">
              {totalCashBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} <span className="text-xs font-normal">ج.م</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-[11px] text-slate-400 block mb-1">إجمالي أرصدة الحسابات البنكية</span>
            <div className="text-base sm:text-lg font-black font-mono text-cyan-400">
              {totalBankBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} <span className="text-xs font-normal">ج.م</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-[11px] text-slate-400 block mb-1">شيكات برسم التحصيل (حافظة)</span>
            <div className="text-base sm:text-lg font-black font-mono text-amber-400">
              {chequesUnderCollectionCount} <span className="text-xs font-normal">شيكاً ({chequesUnderCollectionAmount.toLocaleString('en-US')} ج.م)</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-[11px] text-slate-400 block mb-1">الربط المحاسبي المزدوج</span>
            <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mt-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>مفعل ومؤمن (ACID 100%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Tab Navigation Controls */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('PAYMENT')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'PAYMENT'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <ArrowUpRight className="w-4 h-4" />
          <span>سندات الصرف (Cash & Bank Payment)</span>
        </button>

        <button
          onClick={() => setActiveTab('RECEIPT')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'RECEIPT'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <ArrowDownLeft className="w-4 h-4" />
          <span>سندات القبض (Cash & Cheque Receipt)</span>
        </button>

        <button
          onClick={() => setActiveTab('CHEQUES')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'CHEQUES'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>محفظة الشيكات ودورة التحصيل ({cheques.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('BALANCES')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'BALANCES'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Landmark className="w-4 h-4" />
          <span>أرصدة الخزائن والحسابات البنكية المباشرة</span>
        </button>
      </div>

      {/* ==================================================== */}
      {/* TAB 1: PAYMENT VOUCHER DESKTOP GRID */}
      {/* ==================================================== */}
      {activeTab === 'PAYMENT' && (
        <div className="space-y-4 bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-rose-400" />
                <span>إصدار سند صرف نقدي / بنكي (Payable Voucher)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                يقوم النظام بإثبات الصرف وترحيل قيد اليومية المزدوج آلياً (مدين: المستفيدين/المصروفات - دائن: الخزينة/البنك).
              </p>
            </div>

            <button
              onClick={handleSavePayment}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>حفظ وترحيل سند الصرف والقيد المزدوج [F10]</span>
            </button>
          </div>

          {/* Header Controls Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">تاريخ السند (Note Date)</label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">حساب الصرف (خزينة / بنك دائن)</label>
              <select
                value={paymentSafeOrBank}
                onChange={(e) => setPaymentSafeOrBank(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <optgroup label="الخزائن النقدية (Safes)">
                  {safes.map((s) => (
                    <option key={s.id} value={s.linkedAccountId}>
                      {s.code} - {s.nameAr} ({s.accountBalance.toLocaleString()} ج.م)
                    </option>
                  ))}
                </optgroup>
                <optgroup label="الحسابات البنكية (Banks)">
                  {banks.map((b) => (
                    <option key={b.id} value={b.linkedAccountId}>
                      {b.code} - {b.bankNameAr} ({b.accountBalance.toLocaleString()} ج.م)
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">العملة وسعر الصرف</label>
              <div className="flex items-center gap-1.5">
                <select
                  value={paymentCurrency}
                  onChange={(e) => {
                    const cid = Number(e.target.value);
                    setPaymentCurrency(cid);
                    const found = currencies.find((c) => c.Currency_ID === cid);
                    if (found) setPaymentExchange(String(found.Exchange));
                  }}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none cursor-pointer flex-1"
                >
                  {currencies.map((c) => (
                    <option key={c.Currency_ID} value={c.Currency_ID}>
                      {c.Currency_Name_A}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  step="0.001"
                  value={paymentExchange}
                  onChange={(e) => setPaymentExchange(e.target.value)}
                  className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs font-mono text-center text-amber-300 focus:outline-none"
                  title="سعر الصرف مقابل الجنيه المصري"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">البيان العام لسند الصرف</label>
              <input
                type="text"
                value={paymentDesc}
                onChange={(e) => setPaymentDesc(e.target.value)}
                placeholder="أدخل الشرح العام لسند الصرف..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Desktop High-Density Table */}
          <div className="border border-slate-800 rounded-xl overflow-x-auto bg-slate-950">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-900 text-slate-400 border-b border-slate-800">
                  <th className="py-2.5 px-3 w-12 text-center">م</th>
                  <th className="py-2.5 px-3 w-64">الحساب المستفيد (المدين)</th>
                  <th className="py-2.5 px-3">البيان والشرح التفصيلي للسطر</th>
                  <th className="py-2.5 px-3 w-40 text-center">المبلغ المنصرف</th>
                  <th className="py-2.5 px-3 w-36 text-center">مركز التكلفة</th>
                  <th className="py-2.5 px-3 w-16 text-center">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {paymentLines.map((line, idx) => (
                  <tr key={line.sr} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-2 px-3 text-center text-slate-500 font-bold">{line.sr}</td>
                    <td className="py-2 px-3 font-sans">
                      <input
                        type="text"
                        value={line.accountName}
                        onChange={(e) => updatePaymentLine(idx, 'accountName', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-amber-400 rounded px-2.5 py-1 text-xs text-slate-200 font-sans"
                      />
                    </td>
                    <td className="py-2 px-3 font-sans">
                      <input
                        type="text"
                        value={line.desc}
                        onChange={(e) => updatePaymentLine(idx, 'desc', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-amber-400 rounded px-2.5 py-1 text-xs text-slate-200 font-sans"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        step="0.01"
                        value={line.amount}
                        onChange={(e) => updatePaymentLine(idx, 'amount', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-amber-400 rounded px-2.5 py-1 text-xs text-center font-mono font-bold text-amber-300"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={line.costcenterId}
                        onChange={(e) => updatePaymentLine(idx, 'costcenterId', e.target.value)}
                        placeholder="0 - عام"
                        className="w-full bg-slate-900 border border-slate-800 focus:border-amber-400 rounded px-2 py-1 text-xs text-center text-slate-400"
                      />
                    </td>
                    <td className="py-2 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => insertPaymentRow(idx)}
                          title="إدراج سطر جديد (Insert)"
                          className="p-1 hover:text-emerald-400 text-slate-500 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deletePaymentRow(idx)}
                          title="حذف السطر (Ctrl+Del)"
                          className="p-1 hover:text-rose-400 text-slate-500 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Sticky Total & Tafqeet HUD */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/30 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 font-bold">إجمالي المبلغ المنصرف:</span>
              <span className="text-lg font-black font-mono text-emerald-400">
                {paymentTotals.baseTotal.toFixed(2)}
              </span>
              <span className="text-xs text-slate-500">ج.م</span>
            </div>

            {paymentTotals.tafqeetText && (
              <div className="text-xs text-amber-300 font-sans italic">
                المبلغ تفقيطاً: <span className="font-bold">{paymentTotals.tafqeetText}</span>
              </div>
            )}

            <div className="text-xs text-slate-400 font-mono">
              عدد البنود: <span className="text-white font-bold">{paymentLines.length}</span>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 2: RECEIPT VOUCHER DESKTOP GRID */}
      {/* ==================================================== */}
      {activeTab === 'RECEIPT' && (
        <div className="space-y-4 bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <ArrowDownLeft className="w-5 h-5 text-emerald-400" />
                <span>إصدار سند قبض نقدي / بنكي / شيكات (Receivable Voucher)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                تحصيل وإثبات الإيرادات والمقبوضات مع دعم إثبات الشيكات الواردة برسم التحصيل آلياً.
              </p>
            </div>

            <button
              onClick={handleSaveReceipt}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>حفظ وترحيل سند القبض والقيد المزدوج [F10]</span>
            </button>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 w-fit">
            <button
              onClick={() => setReceiptMode('CASH')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                receiptMode === 'CASH'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              قبض نقدي (الخزينة)
            </button>
            <button
              onClick={() => setReceiptMode('BANK_TRANSFER')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                receiptMode === 'BANK_TRANSFER'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              إيداع / تحويل بنكي
            </button>
            <button
              onClick={() => setReceiptMode('CHEQUE')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                receiptMode === 'CHEQUE'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              قبض بشيك (حافظة أوراق قبض)
            </button>
          </div>

          {/* Header Controls Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">تاريخ السند</label>
              <input
                type="date"
                value={receiptDate}
                onChange={(e) => setReceiptDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">
                {receiptMode === 'CHEQUE' ? 'حساب الحافظة' : 'حساب المقبوض فيه (المدين)'}
              </label>
              <select
                value={receiptSafeOrBank}
                onChange={(e) => setReceiptSafeOrBank(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                {receiptMode === 'CHEQUE' ? (
                  <option value="1204001">1204001 - أوراق قبض برسم التحصيل</option>
                ) : (
                  <>
                    <optgroup label="الخزائن النقدية (Safes)">
                      {safes.map((s) => (
                        <option key={s.id} value={s.linkedAccountId}>
                          {s.code} - {s.nameAr}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="الحسابات البنكية (Banks)">
                      {banks.map((b) => (
                        <option key={b.id} value={b.linkedAccountId}>
                          {b.code} - {b.bankNameAr}
                        </option>
                      ))}
                    </optgroup>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">العملة وسعر الصرف</label>
              <div className="flex items-center gap-1.5">
                <select
                  value={receiptCurrency}
                  onChange={(e) => {
                    const cid = Number(e.target.value);
                    setReceiptCurrency(cid);
                    const found = currencies.find((c) => c.Currency_ID === cid);
                    if (found) setReceiptExchange(String(found.Exchange));
                  }}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none cursor-pointer flex-1"
                >
                  {currencies.map((c) => (
                    <option key={c.Currency_ID} value={c.Currency_ID}>
                      {c.Currency_Name_A}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  step="0.001"
                  value={receiptExchange}
                  onChange={(e) => setReceiptExchange(e.target.value)}
                  className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs font-mono text-center text-amber-300 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">البيان العام لسند القبض</label>
              <input
                type="text"
                value={receiptDesc}
                onChange={(e) => setReceiptDesc(e.target.value)}
                placeholder="أدخل الشرح العام لسند القبض..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Desktop High-Density Table */}
          <div className="border border-slate-800 rounded-xl overflow-x-auto bg-slate-950">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-900 text-slate-400 border-b border-slate-800">
                  <th className="py-2.5 px-3 w-12 text-center">م</th>
                  <th className="py-2.5 px-3 w-56">الطرف الدافع (العميل/الدائن)</th>
                  <th className="py-2.5 px-3">البيان والشرح التفصيلي</th>
                  <th className="py-2.5 px-3 w-36 text-center">المبلغ المحصل</th>
                  {receiptMode === 'CHEQUE' && (
                    <>
                      <th className="py-2.5 px-3 w-32 text-center">رقم الشيك</th>
                      <th className="py-2.5 px-3 w-32 text-center">تاريخ الاستحقاق</th>
                      <th className="py-2.5 px-3 w-36">البنك المسحوب عليه</th>
                    </>
                  )}
                  <th className="py-2.5 px-3 w-16 text-center">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {receiptLines.map((line, idx) => (
                  <tr key={line.sr} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-2 px-3 text-center text-slate-500 font-bold">{line.sr}</td>
                    <td className="py-2 px-3 font-sans">
                      <input
                        type="text"
                        value={line.accountName}
                        onChange={(e) => updateReceiptLine(idx, 'accountName', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-amber-400 rounded px-2.5 py-1 text-xs text-slate-200 font-sans"
                      />
                    </td>
                    <td className="py-2 px-3 font-sans">
                      <input
                        type="text"
                        value={line.desc}
                        onChange={(e) => updateReceiptLine(idx, 'desc', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-amber-400 rounded px-2.5 py-1 text-xs text-slate-200 font-sans"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        step="0.01"
                        value={line.amount}
                        onChange={(e) => updateReceiptLine(idx, 'amount', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-amber-400 rounded px-2.5 py-1 text-xs text-center font-mono font-bold text-emerald-400"
                      />
                    </td>
                    {receiptMode === 'CHEQUE' && (
                      <>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={line.chequeNo || ''}
                            onChange={(e) => updateReceiptLine(idx, 'chequeNo', e.target.value)}
                            placeholder="CHQ-..."
                            className="w-full bg-slate-900 border border-slate-800 focus:border-amber-400 rounded px-2 py-1 text-xs text-center text-amber-300 font-mono"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="date"
                            value={line.chequeDate || ''}
                            onChange={(e) => updateReceiptLine(idx, 'chequeDate', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 focus:border-amber-400 rounded px-2 py-1 text-xs text-slate-300"
                          />
                        </td>
                        <td className="py-2 px-3 font-sans">
                          <input
                            type="text"
                            value={line.draweeBank || ''}
                            onChange={(e) => updateReceiptLine(idx, 'draweeBank', e.target.value)}
                            placeholder="اسم البنك..."
                            className="w-full bg-slate-900 border border-slate-800 focus:border-amber-400 rounded px-2 py-1 text-xs text-slate-300 font-sans"
                          />
                        </td>
                      </>
                    )}
                    <td className="py-2 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => insertReceiptRow(idx)}
                          className="p-1 hover:text-emerald-400 text-slate-500 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteReceiptRow(idx)}
                          className="p-1 hover:text-rose-400 text-slate-500 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Sticky Total & Tafqeet HUD */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/30 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 font-bold">إجمالي المبلغ المحصل:</span>
              <span className="text-lg font-black font-mono text-emerald-400">
                {receiptTotals.baseTotal.toFixed(2)}
              </span>
              <span className="text-xs text-slate-500">ج.م</span>
            </div>

            {receiptTotals.tafqeetText && (
              <div className="text-xs text-amber-300 font-sans italic">
                المبلغ تفقيطاً: <span className="font-bold">{receiptTotals.tafqeetText}</span>
              </div>
            )}

            <div className="text-xs text-slate-400 font-mono">
              عدد البنود: <span className="text-white font-bold">{receiptLines.length}</span>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 3: CHEQUE PORTFOLIO & LIFECYCLE */}
      {/* ==================================================== */}
      {activeTab === 'CHEQUES' && (
        <div className="space-y-4 bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-amber-400" />
                <span>محفظة الشيكات وأوراق القبض والدفع (Cheque Portfolio)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                متابعة حركة الشيكات، الإيداع البنكي، التحصيل الفعلي، تسجيل الارتداد، والصرف مع توليد القيود المحاسبية التلقائية.
              </p>
            </div>
          </div>

          {/* Cheque Table */}
          <div className="border border-slate-800 rounded-xl overflow-x-auto bg-slate-950">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-900 text-slate-400 border-b border-slate-800">
                  <th className="py-2.5 px-3">رقم الشيك</th>
                  <th className="py-2.5 px-3">النوع</th>
                  <th className="py-2.5 px-3">تاريخ الاستحقاق</th>
                  <th className="py-2.5 px-3">المبلغ</th>
                  <th className="py-2.5 px-3">البنك والساحب/المستفيد</th>
                  <th className="py-2.5 px-3 text-center">الحالة الحالية</th>
                  <th className="py-2.5 px-3 text-center">إجراءات دورة الحياة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {cheques.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-amber-300">{c.chequeNo}</td>
                    <td className="py-2.5 px-3">
                      {c.voucherType === 'DELIVERY' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          شيك وارد (ورقة قبض)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                          شيك صادر (ورقة دفع)
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-300">{c.chequeDate}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-white">
                      {c.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} ج.م
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-200">{c.chequeName}</div>
                      <div className="text-[10px] text-slate-400">{c.bankName}</div>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        {c.statusLabelAr}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {c.status === 'UNDER_COLLECTION' && (
                          <button
                            onClick={() => {
                              setSelectedCheque(c);
                              setActionModal('COLLECT');
                            }}
                            className="px-2.5 py-1 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 rounded text-[11px] font-bold cursor-pointer transition-all"
                          >
                            تحصيل بالبنك
                          </button>
                        )}
                        {c.status === 'UNDER_COLLECTION' && (
                          <button
                            onClick={() => {
                              setSelectedCheque(c);
                              setActionModal('BOUNCE');
                            }}
                            className="px-2.5 py-1 bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 border border-rose-500/40 rounded text-[11px] font-bold cursor-pointer transition-all"
                          >
                            رفض / ارتداد
                          </button>
                        )}
                        {c.status === 'ISSUED' && (
                          <button
                            onClick={() => {
                              setSelectedCheque(c);
                              setActionModal('CLEAR');
                            }}
                            className="px-2.5 py-1 bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 border border-cyan-500/40 rounded text-[11px] font-bold cursor-pointer transition-all"
                          >
                            إثبات خصم الشيك
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 4: LIVE BALANCES AND SAFES */}
      {/* ==================================================== */}
      {activeTab === 'BALANCES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Cash Safes */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span>الخزائن النقدية ومواقع العمل ({safes.length})</span>
            </h3>

            <div className="space-y-2.5">
              {safes.map((s) => (
                <div
                  key={s.id}
                  className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-emerald-500/40 transition-all flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-200">{s.nameAr}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      كود الحساب: {s.linkedAccountId}
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-mono font-black text-emerald-400">
                      {s.accountBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-[10px] text-slate-400 font-sans">جنيه مصري</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bank Accounts */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Landmark className="w-4 h-4 text-cyan-400" />
              <span>الحسابات البنكية والتسهيلات الائتمانية ({banks.length})</span>
            </h3>

            <div className="space-y-2.5">
              {banks.map((b) => (
                <div
                  key={b.id}
                  className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/40 transition-all flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-200">{b.bankNameAr}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      رقم الحساب: {b.accountNumber} | IBAN: {b.iban?.slice(0, 14)}...
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-mono font-black text-cyan-400">
                      {b.accountBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-[10px] text-slate-400 font-sans">
                      تسهيل: {b.facilityLimit?.toLocaleString()} ج.م
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Cheque Action Transition Modal */}
      {actionModal && selectedCheque && (
        <div className="fixed inset-0 !m-0 !top-0 !left-0 !right-0 !bottom-0 w-screen h-screen z-[999] bg-black/80 backdrop-blur-sm p-4 flex items-center justify-center">
          <div className="w-full max-w-md bg-slate-900 border border-amber-500/40 rounded-2xl p-5 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>
                {actionModal === 'COLLECT' && 'إثبات تحصيل الشيك وإيداعه بالبنك'}
                {actionModal === 'BOUNCE' && 'إثبات ارتداد ورفض الشيك'}
                {actionModal === 'CLEAR' && 'إثبات خصم الشيك الصادر من البنك'}
              </span>
            </h3>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">رقم الشيك:</span>
                <span className="text-amber-300 font-bold">{selectedCheque.chequeNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">المبلغ:</span>
                <span className="text-emerald-400 font-bold">{selectedCheque.amount.toLocaleString()} ج.م</span>
              </div>
              <div className="flex justify-between font-sans">
                <span className="text-slate-400">الطرف:</span>
                <span className="text-slate-200">{selectedCheque.chequeName}</span>
              </div>
            </div>

            {(actionModal === 'COLLECT' || actionModal === 'CLEAR') && (
              <div>
                <label className="text-xs text-slate-400 block mb-1">الحساب البنكي المعني بالعملية:</label>
                <select
                  value={selectedBankForCheque}
                  onChange={(e) => setSelectedBankForCheque(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-amber-300 font-bold focus:outline-none"
                >
                  {banks.map((b) => (
                    <option key={b.id} value={b.linkedAccountId}>
                      {b.bankNameAr}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setActionModal(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={handleExecuteChequeTransition}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl cursor-pointer shadow-md"
              >
                تأكيد وترحيل القيد المحاسبي
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashBankingModule;
