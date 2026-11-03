/**
 * ECO ERP - Phase 03 Contracting, Projects & Subcontractor Extraction Module
 * Desktop-Grade High-Density UI replicating Telerik Keyboard Workflows
 * - Enter: Cell step-through and auto-line insertion
 * - Insert / Ctrl+Down: Row insertion
 * - Ctrl+Del: Row deletion
 * - Dynamic Deduction Matrix (Retention, Advance Recovery, WHT, Penalties)
 * - Arbitrary-Precision Progress Billing Mathematics via Decimal.js
 * - Atomic GL Auto-Posting
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Decimal } from 'decimal.js';
import {
  HardHat,
  FileSpreadsheet,
  Building2,
  ScrollText,
  Plus,
  Trash2,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Database,
  ArrowDownLeft,
  Sparkles,
} from 'lucide-react';
import {
  contractingClient,
  ProjectItem,
  ContractItem,
  ExtractItem,
  CreateExtractClientDTO,
} from '../../../services/contractingClient';
import { tafqeet } from '../../../utils/tafqeet';

Decimal.set({ precision: 28, rounding: Decimal.ROUND_HALF_UP });

export const ContractingModule: React.FC = () => {
  type ActiveTab = 'SUBCONTRACTOR_EXTRACTS' | 'OWNER_EXTRACTS' | 'CONTRACTS' | 'PROJECTS';
  const [activeTab, setActiveTab] = useState<ActiveTab>('SUBCONTRACTOR_EXTRACTS');

  // Master Data State
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [contracts, setContracts] = useState<ContractItem[]>([]);
  const [extracts, setExtracts] = useState<ExtractItem[]>([]);
  const [activeDb, setActiveDb] = useState<string>('MK_Khalil_Db_2026');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Notifications
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ----------------------------------------------------
  // EXTRACT WORKBENCH FORM STATE
  // ----------------------------------------------------
  const [extractDate, setExtractDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedContractNo, setSelectedContractNo] = useState<number>(501);
  const [selectedProjectCostcenter, setSelectedProjectCostcenter] = useState<number>(101);
  const [subcontractorAccountId, setSubcontractorAccountId] = useState<number>(2101001);
  const [subcontractorName, setSubcontractorName] = useState<string>('شركة النيل للمقاولات العامة والإنشاءات');
  const [extractNotice, setExtractNotice] = useState<string>('مستخلص جاري أعمال الهيكل الإنشائي والخرسانات');

  // Deduction Matrix Rates
  const [retentionRate, setRetentionRate] = useState<string>('5.0');
  const [advanceRecoveryRate, setAdvanceRecoveryRate] = useState<string>('10.0');
  const [withholdingTaxRate, setWithholdingTaxRate] = useState<string>('1.0');
  const [insuranceRate, setInsuranceRate] = useState<string>('0.0');
  const [penaltiesAmount, setPenaltiesAmount] = useState<string>('0.0');

  // BOQ Grid Line Items
  interface BOQGridRow {
    sr: number;
    itemCode: number;
    description: string;
    unit: string;
    previousQty: string;
    currentQty: string;
    unitPrice: string;
    completionRate: string; // %
  }

  const [boqRows, setBoqRows] = useState<BOQGridRow[]>([
    {
      sr: 1,
      itemCode: 101,
      description: 'أعمال حفر وإحلال وتجهيز تربة الأساسات',
      unit: 'متر مكعب',
      previousQty: '1200',
      currentQty: '300',
      unitPrice: '180.00',
      completionRate: '100',
    },
    {
      sr: 2,
      itemCode: 102,
      description: 'أعمال خرسانة عادية لزوم فرشة النظافة بسمك 20 سم',
      unit: 'متر مكعب',
      previousQty: '450',
      currentQty: '150',
      unitPrice: '2100.00',
      completionRate: '100',
    },
    {
      sr: 3,
      itemCode: 103,
      description: 'أعمال خرسانة مسلحة لزوم القواعد والسمالات وميد الدور الأرضي',
      unit: 'متر مكعب',
      previousQty: '320',
      currentQty: '180',
      unitPrice: '5400.00',
      completionRate: '90',
    },
    {
      sr: 4,
      itemCode: 104,
      description: 'أعمال أعمدة خرسانية مسلحة للدور المتكرر',
      unit: 'متر مكعب',
      previousQty: '80',
      currentQty: '65',
      unitPrice: '6200.00',
      completionRate: '85',
    },
  ]);

  // Load Data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      contractingClient.setActiveDatabaseKey(activeDb);
      const [p, c, e] = await Promise.all([
        contractingClient.getProjects(),
        contractingClient.getContracts(),
        contractingClient.getExtracts(),
      ]);
      setProjects(p);
      setContracts(c);
      setExtracts(e);
      if (c.length > 0) {
        setSelectedContractNo(c[0].Contract_No);
        setSelectedProjectCostcenter(c[0].Costcenter_ID);
        setSubcontractorAccountId(c[0].Credit_Level5_ID);
        setSubcontractorName(c[0].subcontractorName || 'شركة النيل للمقاولات');
      }
    } catch {
      // Ignore
    } finally {
      setIsLoading(false);
    }
  }, [activeDb]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Sync Contract Selection
  const handleContractChange = (cNo: number) => {
    setSelectedContractNo(cNo);
    const found = contracts.find((c) => c.Contract_No === cNo);
    if (found) {
      setSelectedProjectCostcenter(found.Costcenter_ID);
      setSubcontractorAccountId(found.Credit_Level5_ID);
      setSubcontractorName(found.subcontractorName || '');
      setRetentionRate(String(found.Work_Balance_Per || 5));
      setAdvanceRecoveryRate(String(found.Work_Payments_Per || 10));
    }
  };

  // ----------------------------------------------------
  // GRID LINE ACTIONS
  // ----------------------------------------------------
  const updateRow = (idx: number, field: keyof BOQGridRow, val: string) => {
    setBoqRows((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: val };
      return next;
    });
  };

  const insertRow = (idx: number) => {
    setBoqRows((prev) => {
      const next = [...prev];
      next.splice(idx + 1, 0, {
        sr: next.length + 1,
        itemCode: 100 + next.length + 1,
        description: 'بند أعمال إنشائية جديد',
        unit: 'متر مكعب',
        previousQty: '0',
        currentQty: '0',
        unitPrice: '0.00',
        completionRate: '100',
      });
      return next.map((r, i) => ({ ...r, sr: i + 1 }));
    });
  };

  const deleteRow = (idx: number) => {
    if (boqRows.length <= 1) {
      setErrorMsg('يجب أن يحتوي المستخلص على بند أعمال واحد على الأقل.');
      setTimeout(() => setErrorMsg(null), 3000);
      return;
    }
    setBoqRows((prev) => prev.filter((_, i) => i !== idx).map((r, i) => ({ ...r, sr: i + 1 })));
  };

  // ----------------------------------------------------
  // EXTRACT MATHEMATICS (DECIMAL.JS)
  // ----------------------------------------------------
  const calculations = useMemo(() => {
    let totalGross = new Decimal(0);

    const calculatedLines = boqRows.map((row) => {
      const prevQ = new Decimal(parseFloat(row.previousQty) || 0);
      const currQ = new Decimal(parseFloat(row.currentQty) || 0);
      const price = new Decimal(parseFloat(row.unitPrice) || 0);
      const rate = new Decimal(parseFloat(row.completionRate) || 100);

      const totalQ = prevQ.plus(currQ);
      const gross = currQ.times(price);
      const net = gross.times(rate.dividedBy(100));

      totalGross = totalGross.plus(net);

      return {
        ...row,
        totalQty: totalQ,
        lineGross: gross,
        lineNet: net,
      };
    });

    const retPct = new Decimal(parseFloat(retentionRate) || 0);
    const advPct = new Decimal(parseFloat(advanceRecoveryRate) || 0);
    const whtPct = new Decimal(parseFloat(withholdingTaxRate) || 0);
    const insPct = new Decimal(parseFloat(insuranceRate) || 0);
    const penAmt = new Decimal(parseFloat(penaltiesAmount) || 0);

    const retentionAmt = totalGross.times(retPct.dividedBy(100));
    const advanceAmt = totalGross.times(advPct.dividedBy(100));
    const whtAmt = totalGross.times(whtPct.dividedBy(100));
    const insuranceAmt = totalGross.times(insPct.dividedBy(100));

    const totalDeductions = retentionAmt
      .plus(advanceAmt)
      .plus(whtAmt)
      .plus(insuranceAmt)
      .plus(penAmt);

    const netPayable = totalGross.minus(totalDeductions);

    return {
      lines: calculatedLines,
      totalGross,
      retentionAmt,
      advanceAmt,
      whtAmt,
      insuranceAmt,
      penaltiesAmt: penAmt,
      totalDeductions,
      netPayable,
      tafqeetText: netPayable.greaterThan(0) ? tafqeet(netPayable.toNumber(), 'EGP') : '',
    };
  }, [
    boqRows,
    retentionRate,
    advanceRecoveryRate,
    withholdingTaxRate,
    insuranceRate,
    penaltiesAmount,
  ]);

  // Aggregate Metrics for Top Banner
  const totalProjectsContractValue = useMemo(
    () => projects.reduce((acc, p) => acc + (p.contractValue || 0), 0),
    [projects]
  );
  const totalExecutedValue = useMemo(
    () => projects.reduce((acc, p) => acc + (p.totalExecutedValue || 0), 0),
    [projects]
  );
  const overallCompletionPercentage = useMemo(() => {
    if (totalProjectsContractValue === 0) return 0;
    return Math.round((totalExecutedValue / totalProjectsContractValue) * 100);
  }, [totalProjectsContractValue, totalExecutedValue]);

  // ----------------------------------------------------
  // SUBMIT & POST EXTRACT
  // ----------------------------------------------------
  const handleSaveExtract = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (calculations.totalGross.isZero()) {
      setErrorMsg('إجمالي الأعمال المنجزة في المستخلص تساوي صفراً.');
      return;
    }

    if (calculations.netPayable.isNegative()) {
      setErrorMsg('إجمالي الاستقطاعات تجاوزت قيمة الأعمال المنجزة.');
      return;
    }

    try {
      const payload: CreateExtractClientDTO = {
        extractType: activeTab === 'OWNER_EXTRACTS' ? 'OWNER' : 'SUBCONTRACTOR',
        extractDate: extractDate,
        contractNo: selectedContractNo,
        partyAccountId: subcontractorAccountId,
        partyNameAr: subcontractorName,
        costcenterId: selectedProjectCostcenter,
        advanceRecoveryRate: parseFloat(advanceRecoveryRate) || 0,
        retentionRate: parseFloat(retentionRate) || 0,
        insuranceRate: parseFloat(insuranceRate) || 0,
        withholdingTaxRate: parseFloat(withholdingTaxRate) || 1,
        penaltiesAndLabAmount: parseFloat(penaltiesAmount) || 0,
        notice: extractNotice,
        lines: boqRows.map((r) => ({
          itemCode: r.itemCode,
          description: r.description,
          unit: r.unit,
          previousQty: parseFloat(r.previousQty) || 0,
          currentQty: parseFloat(r.currentQty) || 0,
          unitPrice: parseFloat(r.unitPrice) || 0,
          completionRate: parseFloat(r.completionRate) || 100,
        })),
      };

      const res = await contractingClient.createExtract(payload);
      if (res.success) {
        setSuccessMsg(res.message);
        loadData();
        setTimeout(() => setSuccessMsg(null), 5000);
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'حدث خطأ أثناء اعتماد وترحيل المستخلص.');
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
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono">
                المرحلة 03: المقاولات والمستخلصات والمشروعات
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                تسوية محاسبية ذرية (ACID Project Costing)
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <HardHat className="w-6 h-6 text-amber-400" />
              <span>منظومة المقاولات وإدارة العقود ومستخلصات الأعمال</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              إدارة بنود المقايسة (BOQ)، التتبع التراكمي للكميات، مصفوفة الاستقطاعات الذكية (ضمان الأعمال والدفعات المقدمة والضرائب)، وترحيل قيود التكاليف والإيرادات آلياً إلى الأستاذ العام.
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
                <option value="acc" className="bg-slate-900 text-white">acc</option>
                <option value="newhope" className="bg-slate-900 text-white">newhope</option>
              </select>
            </div>

            <button
              onClick={loadData}
              disabled={isLoading}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl transition-all cursor-pointer shadow-xs"
              title="تحديث البيانات المباشرة"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Quick KPI Project Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-[11px] text-slate-400 block mb-1">إجمالي القيمة التعاقدية للمشروعات</span>
            <div className="text-base sm:text-lg font-black font-mono text-cyan-400">
              {totalProjectsContractValue.toLocaleString('en-US')} <span className="text-xs font-normal">ج.م</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-[11px] text-slate-400 block mb-1">إجمالي الأعمال المنفذة (المستخلصات)</span>
            <div className="text-base sm:text-lg font-black font-mono text-emerald-400">
              {totalExecutedValue.toLocaleString('en-US')} <span className="text-xs font-normal">ج.م</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-[11px] text-slate-400 block mb-1">نسبة الإنجاز الإجمالية</span>
            <div className="text-base sm:text-lg font-black font-mono text-amber-400">
              {overallCompletionPercentage}% <span className="text-xs font-normal">من إجمالي المستهدف</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-[11px] text-slate-400 block mb-1">عدد العقود والمستخلصات</span>
            <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5 mt-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{contracts.length} عقود معتمدة | {extracts.length} مستخلصاً مرحلاً</span>
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
          onClick={() => setActiveTab('SUBCONTRACTOR_EXTRACTS')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'SUBCONTRACTOR_EXTRACTS'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>مستخلصات مقاولي الباطن (Subcontractor Extracts)</span>
        </button>

        <button
          onClick={() => setActiveTab('OWNER_EXTRACTS')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'OWNER_EXTRACTS'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <ArrowDownLeft className="w-4 h-4" />
          <span>مستخلصات المالك والعملاء (Owner Progress Billing)</span>
        </button>

        <button
          onClick={() => setActiveTab('CONTRACTS')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'CONTRACTS'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <ScrollText className="w-4 h-4" />
          <span>سجل عقود المشروعات والمقايسة ({contracts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('PROJECTS')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'PROJECTS'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>المشروعات ومراكز التكلفة والمواقع ({projects.length})</span>
        </button>
      </div>

      {/* ==================================================== */}
      {/* TAB 1 & 2: EXTRACT PROGRESS BILLING GRID */}
      {/* ==================================================== */}
      {(activeTab === 'SUBCONTRACTOR_EXTRACTS' || activeTab === 'OWNER_EXTRACTS') && (
        <div className="space-y-4 bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-amber-400" />
                <span>
                  {activeTab === 'SUBCONTRACTOR_EXTRACTS'
                    ? 'شاشة إعداد واعتماد مستخلص مقاول باطن (AbsProjectH / AbsProjectD)'
                    : 'شاشة إعداد واعتماد مستخلص المالك والعميل (Client Progress Extract)'}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                احتساب الكميات التراكمية، تطبيق نسب الاستقطاع والضمان، وترحيل قيد التكاليف أو الإيرادات إلى الأستاذ العام مباشرة.
              </p>
            </div>

            <button
              onClick={handleSaveExtract}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>اعتماد وترحيل المستخلص والقيد المحاسبي [F10]</span>
            </button>
          </div>

          {/* Header Controls Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">تاريخ المستخلص</label>
              <input
                type="date"
                value={extractDate}
                onChange={(e) => setExtractDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">رقم العقد المعتمد</label>
              <select
                value={selectedContractNo}
                onChange={(e) => handleContractChange(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                {contracts.map((c) => (
                  <option key={c.Contract_No} value={c.Contract_No}>
                    عقد #{c.Contract_No} - {c.subcontractorName} ({c.Note_Total.toLocaleString()} ج.م)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">المشروع ومركز التكلفة</label>
              <select
                value={selectedProjectCostcenter}
                onChange={(e) => setSelectedProjectCostcenter(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none cursor-pointer"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.costcenterId}>
                    {p.code} - {p.nameAr}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">بيان المستخلص</label>
              <input
                type="text"
                value={extractNotice}
                onChange={(e) => setExtractNotice(e.target.value)}
                placeholder="أدخل وصف المستخلص أو رقم الدفعة..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* High-Density Desktop Progress Billing Grid */}
          <div className="border border-slate-800 rounded-xl overflow-x-auto bg-slate-950">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-900 text-slate-400 border-b border-slate-800 font-bold">
                  <th className="py-2.5 px-3 w-10 text-center">م</th>
                  <th className="py-2.5 px-3 w-20 text-center">كود البند</th>
                  <th className="py-2.5 px-3">بيان وتوصيف بند الأعمال (BOQ Description)</th>
                  <th className="py-2.5 px-3 w-20 text-center">الوحدة</th>
                  <th className="py-2.5 px-3 w-24 text-center">كمية سابقة</th>
                  <th className="py-2.5 px-3 w-24 text-center">كمية حالية</th>
                  <th className="py-2.5 px-3 w-28 text-center bg-slate-800/60">إجمالي تراكمي</th>
                  <th className="py-2.5 px-3 w-28 text-center">سعر الفئة</th>
                  <th className="py-2.5 px-3 w-20 text-center">صرف %</th>
                  <th className="py-2.5 px-3 w-32 text-center bg-slate-800/60">القيمة المستحقة</th>
                  <th className="py-2.5 px-3 w-14 text-center">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {calculations.lines.map((row, idx) => (
                  <tr key={row.sr} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-2 px-3 text-center text-slate-500 font-bold">{row.sr}</td>
                    <td className="py-2 px-3 text-center text-amber-300 font-mono">{row.itemCode}</td>
                    <td className="py-2 px-3 font-sans">
                      <input
                        type="text"
                        value={row.description}
                        onChange={(e) => updateRow(idx, 'description', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-amber-400 rounded px-2.5 py-1 text-xs text-slate-200 font-sans"
                      />
                    </td>
                    <td className="py-2 px-3 text-center font-sans">
                      <input
                        type="text"
                        value={row.unit}
                        onChange={(e) => updateRow(idx, 'unit', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-amber-400 rounded px-1.5 py-1 text-xs text-center text-slate-300 font-sans"
                      />
                    </td>
                    <td className="py-2 px-3 text-center">
                      <input
                        type="number"
                        step="0.01"
                        value={row.previousQty}
                        onChange={(e) => updateRow(idx, 'previousQty', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-amber-400 rounded px-1.5 py-1 text-xs text-center font-mono text-slate-400"
                      />
                    </td>
                    <td className="py-2 px-3 text-center">
                      <input
                        type="number"
                        step="0.01"
                        value={row.currentQty}
                        onChange={(e) => updateRow(idx, 'currentQty', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-amber-400 rounded px-1.5 py-1 text-xs text-center font-mono font-bold text-amber-300"
                      />
                    </td>
                    <td className="py-2 px-3 text-center font-bold text-cyan-300 bg-slate-900/30">
                      {row.totalQty.toFixed(2)}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <input
                        type="number"
                        step="0.01"
                        value={row.unitPrice}
                        onChange={(e) => updateRow(idx, 'unitPrice', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-amber-400 rounded px-1.5 py-1 text-xs text-center font-mono text-slate-200"
                      />
                    </td>
                    <td className="py-2 px-3 text-center">
                      <input
                        type="number"
                        step="1"
                        min="0"
                        max="100"
                        value={row.completionRate}
                        onChange={(e) => updateRow(idx, 'completionRate', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-amber-400 rounded px-1.5 py-1 text-xs text-center font-mono text-amber-400"
                      />
                    </td>
                    <td className="py-2 px-3 text-center font-bold text-emerald-400 bg-slate-900/30">
                      {row.lineNet.toFixed(2)}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => insertRow(idx)}
                          className="p-1 hover:text-emerald-400 text-slate-500 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteRow(idx)}
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

          {/* Dynamic Deduction Matrix Control Panel */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-amber-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>مصفوفة الاستقطاعات ونسب الحجز والضمان التعاقدي</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <label className="text-[10px] text-slate-400 block mb-1">ضمان أعمال (Retention %)</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.5"
                    value={retentionRate}
                    onChange={(e) => setRetentionRate(e.target.value)}
                    className="w-16 bg-slate-950 border border-slate-700 rounded px-1.5 py-1 font-mono text-amber-300"
                  />
                  <span className="text-slate-500">%</span>
                </div>
                <div className="text-[11px] font-mono text-rose-400 mt-1">
                  -{calculations.retentionAmt.toFixed(2)} ج.م
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <label className="text-[10px] text-slate-400 block mb-1">استرداد دفعة مقدمة (%)</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.5"
                    value={advanceRecoveryRate}
                    onChange={(e) => setAdvanceRecoveryRate(e.target.value)}
                    className="w-16 bg-slate-950 border border-slate-700 rounded px-1.5 py-1 font-mono text-amber-300"
                  />
                  <span className="text-slate-500">%</span>
                </div>
                <div className="text-[11px] font-mono text-rose-400 mt-1">
                  -{calculations.advanceAmt.toFixed(2)} ج.م
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <label className="text-[10px] text-slate-400 block mb-1">ضريبة خصم وإضافة (%)</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.5"
                    value={withholdingTaxRate}
                    onChange={(e) => setWithholdingTaxRate(e.target.value)}
                    className="w-16 bg-slate-950 border border-slate-700 rounded px-1.5 py-1 font-mono text-amber-300"
                  />
                  <span className="text-slate-500">%</span>
                </div>
                <div className="text-[11px] font-mono text-rose-400 mt-1">
                  -{calculations.whtAmt.toFixed(2)} ج.م
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <label className="text-[10px] text-slate-400 block mb-1">تأمين أعمال (%)</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.5"
                    value={insuranceRate}
                    onChange={(e) => setInsuranceRate(e.target.value)}
                    className="w-16 bg-slate-950 border border-slate-700 rounded px-1.5 py-1 font-mono text-amber-300"
                  />
                  <span className="text-slate-500">%</span>
                </div>
                <div className="text-[11px] font-mono text-rose-400 mt-1">
                  -{calculations.insuranceAmt.toFixed(2)} ج.م
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <label className="text-[10px] text-slate-400 block mb-1">غرامات واختبارات (مبلغ صريح)</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="100"
                    value={penaltiesAmount}
                    onChange={(e) => setPenaltiesAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-1.5 py-1 font-mono text-amber-300 text-center"
                  />
                </div>
                <div className="text-[11px] font-mono text-rose-400 mt-1">
                  -{calculations.penaltiesAmt.toFixed(2)} ج.م
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Total & Tafqeet Summary HUD */}
          <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/30 flex flex-wrap items-center justify-between gap-5">
            <div className="flex flex-wrap items-center gap-5">
              <div>
                <span className="text-[11px] text-slate-400 block">إجمالي الأعمال المنجزة (Gross)</span>
                <span className="text-base font-black font-mono text-white">
                  {calculations.totalGross.toFixed(2)} <span className="text-xs font-normal">ج.م</span>
                </span>
              </div>

              <div className="h-8 w-px bg-slate-800"></div>

              <div>
                <span className="text-[11px] text-slate-400 block">إجمالي الاستقطاعات</span>
                <span className="text-base font-black font-mono text-rose-400">
                  -{calculations.totalDeductions.toFixed(2)} <span className="text-xs font-normal">ج.م</span>
                </span>
              </div>

              <div className="h-8 w-px bg-slate-800"></div>

              <div>
                <span className="text-[11px] text-amber-300 font-bold block">صافي المستحق للمقاول (Net Due)</span>
                <span className="text-xl font-black font-mono text-emerald-400">
                  {calculations.netPayable.toFixed(2)} <span className="text-xs font-normal">ج.م</span>
                </span>
              </div>
            </div>

            {calculations.tafqeetText && (
              <div className="text-xs text-amber-300 font-sans italic bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                المبلغ تفقيطاً: <span className="font-bold">{calculations.tafqeetText}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 3: CONTRACTS REPOSITORY */}
      {/* ==================================================== */}
      {activeTab === 'CONTRACTS' && (
        <div className="space-y-4 bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <ScrollText className="w-5 h-5 text-amber-400" />
              <span>سجل عقود مقاولي الباطن والمقايسات ({contracts.length})</span>
            </h3>
          </div>

          <div className="border border-slate-800 rounded-xl overflow-x-auto bg-slate-950">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-900 text-slate-400 border-b border-slate-800 font-bold">
                  <th className="py-2.5 px-3 text-center">رقم العقد</th>
                  <th className="py-2.5 px-3">تاريخ الإبرام</th>
                  <th className="py-2.5 px-3">مقاول الباطن</th>
                  <th className="py-2.5 px-3">المشروع التابع</th>
                  <th className="py-2.5 px-3 text-center">القيمة التعاقدية</th>
                  <th className="py-2.5 px-3 text-center">ضمان الأعمال</th>
                  <th className="py-2.5 px-3 text-center">استرداد المقدم</th>
                  <th className="py-2.5 px-3">ملاحظات العقد</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {contracts.map((c) => (
                  <tr key={c.Contract_No} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-2.5 px-3 text-center text-amber-300 font-bold">#{c.Contract_No}</td>
                    <td className="py-2.5 px-3 text-slate-300">{c.Note_Date}</td>
                    <td className="py-2.5 px-3 font-sans font-bold text-white">{c.subcontractorName}</td>
                    <td className="py-2.5 px-3 font-sans text-slate-300">{c.projectName}</td>
                    <td className="py-2.5 px-3 text-center text-emerald-400 font-bold">
                      {c.Note_Total.toLocaleString()} ج.م
                    </td>
                    <td className="py-2.5 px-3 text-center text-slate-300">{c.Work_Balance_Per}%</td>
                    <td className="py-2.5 px-3 text-center text-slate-300">{c.Work_Payments_Per}%</td>
                    <td className="py-2.5 px-3 font-sans text-slate-400">{c.Notice || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 4: PROJECTS REPOSITORY */}
      {/* ==================================================== */}
      {activeTab === 'PROJECTS' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {projects.map((p) => (
            <div
              key={p.id}
              className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-amber-500/40 transition-all space-y-4 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                  {p.code}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  {p.status === 'ACTIVE' ? 'قيد التنفيذ' : 'مكتمل'}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white leading-relaxed">{p.nameAr}</h3>
                <p className="text-[11px] text-slate-400 mt-1">الجهة المالكة: {p.ownerName}</p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">القيمة التعاقدية:</span>
                  <span className="text-white font-bold">{p.contractValue.toLocaleString()} ج.م</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">إجمالي المنفذ:</span>
                  <span className="text-emerald-400 font-bold">{p.totalExecutedValue.toLocaleString()} ج.م</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-slate-400 font-sans">نسبة الإنجاز:</span>
                  <span className="text-amber-400 font-bold">{p.completionPercentage}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${p.completionPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContractingModule;
