import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useFinancial } from '../../../context/FinancialContext';
import { ExtractPayload, ExtractItemLine } from '../../../services/database/types';
import { tafqeetArabic } from '../../../utils/tafqeet';
import { Modal, formatCurrency, formatNumber } from '@erp/ui-system';
import {
  FileSpreadsheet,
  Plus,
  Trash2,
  Building,
  HardHat,
  Percent,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Calculator
} from 'lucide-react';

interface ExtractModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: 'OWNER' | 'SUBCONTRACTOR';
}

const DEFAULT_LINE: ExtractItemLine = {
  sr: 1,
  descriptionAr: '',
  unitNameAr: 'م3',
  contractQty: 100,
  unitRate: 1000,
  previousQty: 0,
  currentQty: 10,
  totalQty: 10,
  completionPercent: 10,
  currentValue: 10000,
  cumulativeValue: 10000,
};

export const ExtractModal: React.FC<ExtractModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'OWNER',
}) => {
  const { t } = useLanguage();
  const { contracts, saveExtract } = useFinancial();

  const [extractType, setExtractType] = useState<'OWNER' | 'SUBCONTRACTOR'>(defaultType);
  const [selectedContractId, setSelectedContractId] = useState<number>(101);
  const [extractNo, setExtractNo] = useState<number>(4);
  const [extractDate, setExtractDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [periodFrom, setPeriodFrom] = useState<string>('2026-09-01');
  const [periodTo, setPeriodTo] = useState<string>('2026-09-30');
  const [advancePercent, setAdvancePercent] = useState<number>(10);
  const [retentionPercent, setRetentionPercent] = useState<number>(5);
  const [otherDeductions, setOtherDeductions] = useState<number>(0);

  // Dynamic lines of executed quantities
  const [lines, setLines] = useState<ExtractItemLine[]>([
    {
      sr: 1,
      descriptionAr: 'أعمال خرسانة مسلحة للأعمدة والحوائط الساندة إجهاد 350 كجم/سم2',
      unitNameAr: 'م3',
      contractQty: 1200,
      unitRate: 4500,
      previousQty: 600,
      currentQty: 150,
      totalQty: 750,
      completionPercent: 62.5,
      currentValue: 675000,
      cumulativeValue: 3375000,
    },
    {
      sr: 2,
      descriptionAr: 'أعمال خرسانة مسلحة للأسقف والكمرات نظام Post-Tension',
      unitNameAr: 'م3',
      contractQty: 1800,
      unitRate: 5500,
      previousQty: 530,
      currentQty: 120,
      totalQty: 650,
      completionPercent: 36.1,
      currentValue: 660000,
      cumulativeValue: 3575000,
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Available contracts matching the selected type
  const availableContracts = useMemo(() => {
    const targetType = extractType === 'OWNER' ? 'CLIENT' : 'SUBCONTRACTOR';
    return contracts.filter(c => c.contractType === targetType);
  }, [contracts, extractType]);

  // Selected contract details
  const selectedContract = useMemo(() => {
    return contracts.find(c => c.contractNo === selectedContractId) || availableContracts[0];
  }, [contracts, selectedContractId, availableContracts]);

  // Update terms from selected contract
  useEffect(() => {
    if (selectedContract) {
      setAdvancePercent(selectedContract.advancePaymentPercent || 10);
      setRetentionPercent(selectedContract.retentionPercent || 5);
      setSelectedContractId(selectedContract.contractNo);
    }
  }, [selectedContract]);

  // Calculations for lines
  const updateLine = (index: number, field: keyof ExtractItemLine, value: any) => {
    setLines(prev => {
      const next = [...prev];
      const target = { ...next[index], [field]: value };

      const prevQty = Number(target.previousQty) || 0;
      const currQty = Number(target.currentQty) || 0;
      const contractQty = Number(target.contractQty) || 1;
      const unitRate = Number(target.unitRate) || 0;

      // Cumulative calculation rule: Total = Previous + Current
      const totalQty = prevQty + currQty;
      const completionPercent = contractQty > 0 ? (totalQty / contractQty) * 100 : 0;
      const currentValue = currQty * unitRate;
      const cumulativeValue = totalQty * unitRate;

      target.totalQty = totalQty;
      target.completionPercent = Number(completionPercent.toFixed(1));
      target.currentValue = currentValue;
      target.cumulativeValue = cumulativeValue;

      next[index] = target;
      return next;
    });
  };

  const addLine = () => {
    setLines(prev => [
      ...prev,
      {
        ...DEFAULT_LINE,
        sr: prev.length + 1,
      },
    ]);
  };

  const removeLine = (index: number) => {
    if (lines.length <= 1) return;
    setLines(prev => prev.filter((_, i) => i !== index).map((l, i) => ({ ...l, sr: i + 1 })));
  };

  // Aggregates
  const currentWorkTotal = useMemo(() => {
    return lines.reduce((acc, l) => acc + (l.currentValue || 0), 0);
  }, [lines]);

  const advanceDeductionAmount = useMemo(() => {
    return Math.round(currentWorkTotal * (advancePercent / 100));
  }, [currentWorkTotal, advancePercent]);

  const retentionDeductionAmount = useMemo(() => {
    return Math.round(currentWorkTotal * (retentionPercent / 100));
  }, [currentWorkTotal, retentionPercent]);

  const netPayable = useMemo(() => {
    return Math.max(0, currentWorkTotal - advanceDeductionAmount - retentionDeductionAmount - (otherDeductions || 0));
  }, [currentWorkTotal, advanceDeductionAmount, retentionDeductionAmount, otherDeductions]);

  const tafqeetText = useMemo(() => {
    return netPayable > 0 ? tafqeetArabic(netPayable, 'EGP') : '';
  }, [netPayable]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (currentWorkTotal <= 0) {
      setErrorMsg(t('يرجى إدخال كميات وقيم أعمال حالية صالحة في المستخلص', 'Please enter valid work items and current quantities'));
      return;
    }
    if (!selectedContract) {
      setErrorMsg(t('يرجى تحديد العقد الهندسي المرتبط بالمستخلص', 'Please select the linked engineering contract'));
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: ExtractPayload = {
        extractNo,
        extractDate,
        extractType,
        contractNo: selectedContract.contractNo,
        projectNameAr: selectedContract.projectNameAr,
        costCenterId: selectedContract.costCenterId,
        partyId: selectedContract.partyId,
        partyNameAr: selectedContract.partyNameAr,
        consultantNameAr: selectedContract.consultantNameAr,
        periodFrom,
        periodTo,
        currentWorkTotal,
        advanceDeductionPercent: advancePercent,
        advanceDeductionAmount,
        retentionDeductionPercent: retentionPercent,
        retentionDeductionAmount,
        otherDeductions: otherDeductions || 0,
        netPayable,
        netPayableText: tafqeetText,
        lines,
      };

      const res = await saveExtract(payload);
      if (res.success) {
        onClose();
      } else {
        setErrorMsg(res.error || 'فشل في حفظ المستخلص واعتماد القيود');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'خطأ أثناء تسجيل المستخلص');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-6xl"
      title={t('إعداد وتوليد مستخلص أعمال هندسي معتمد', 'Generate Progressive Engineering Extract')}
      subtitle={t('المستخلصات الجارية والختامية وحصر الكميات (FIDIC / Egyptian Standard)', 'Progressive Billing & Cumulative Progress')}
      icon={FileSpreadsheet}
      badge={
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#3D2D14] text-[#EBB34D] border border-[#5C431D]">
          {extractType === 'OWNER' ? t('مستخلص مالك / عميل', 'Owner Extract') : t('مستخلص مقاول باطن', 'Subcontractor Extract')}
        </span>
      }
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-[#243628] bg-[#1F2E23] text-xs font-bold text-[#8FA392] hover:text-[#F3EFE6] transition-colors cursor-pointer"
          >
            {t('إلغاء', 'Cancel')}
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#D99B26] hover:bg-[#C58F38] text-[#0E1610] text-xs font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
          >
            <FileCheck className="w-4 h-4" />
            <span>
              {isSubmitting
                ? t('جاري الحفظ والتسجيل المحاسبي...', 'Saving & Posting...')
                : t('اعتماد المستخلص وتوليد القيود', 'Approve Extract & Generate Vouchers')}
            </span>
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="p-5 space-y-5">
        {errorMsg && (
          <div className="flex items-center gap-2 p-3.5 rounded-xl bg-[#3F2A2A] border border-[#5C3E3E] text-[#EFA3A3] text-xs font-bold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Extract Type Switcher */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setExtractType('OWNER')}
            className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
              extractType === 'OWNER'
                ? 'border-[#EBB34D] bg-[#3D2D14] text-[#EBB34D] shadow-xs'
                : 'border-[#243628] bg-[#121B14] text-[#8FA392] hover:text-[#F3EFE6]'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>{t('مستخلص مالك (إيراد مقاولات ومستحقات على العميل)', 'Owner Extract (Revenue / Receivable)')}</span>
          </button>

          <button
            type="button"
            onClick={() => setExtractType('SUBCONTRACTOR')}
            className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
              extractType === 'SUBCONTRACTOR'
                ? 'border-[#EBB34D] bg-[#3D2D14] text-[#EBB34D] shadow-xs'
                : 'border-[#243628] bg-[#121B14] text-[#8FA392] hover:text-[#F3EFE6]'
            }`}
          >
            <HardHat className="w-4 h-4" />
            <span>{t('مستخلص مقاول باطن (تكلفة مباشرة ومستحقات للمقاول)', 'Subcontractor Extract (Direct Cost / Payable)')}</span>
          </button>
        </div>

        {/* Header Metadata Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 rounded-2xl border border-[#243628] bg-[#121B14]">
          {/* Linked Contract */}
          <div className="md:col-span-2">
            <label className="block text-[11px] font-bold text-[#F3EFE6] mb-1">
              {t('العقد الهندسي المرتبط والمشروع', 'Linked Contract & Project')}
            </label>
            <select
              value={selectedContractId}
              onChange={e => setSelectedContractId(Number(e.target.value))}
              className="w-full h-10 px-3 rounded-xl border border-[#243628] bg-[#17231A] text-xs font-bold text-[#F3EFE6] focus:outline-hidden focus:border-[#EBB34D] focus:ring-1 focus:ring-[#EBB34D]"
            >
              {availableContracts.map(c => (
                <option key={c.id} value={c.contractNo}>
                  [CTR-{c.contractNo}] {c.projectNameAr} - {c.partyNameAr}
                </option>
              ))}
            </select>
          </div>

          {/* Extract Seq */}
          <div>
            <label className="block text-[11px] font-bold text-[#F3EFE6] mb-1">
              {t('رقم المستخلص التسلسلي', 'Extract Sequence No')}
            </label>
            <input
              type="number"
              value={extractNo}
              onChange={e => setExtractNo(Number(e.target.value))}
              className="w-full h-10 px-3 rounded-xl border border-[#243628] bg-[#17231A] text-xs font-bold text-[#F3EFE6] focus:outline-hidden focus:border-[#EBB34D] focus:ring-1 focus:ring-[#EBB34D] tabular-nums"
            />
          </div>

          {/* Extract Date */}
          <div>
            <label className="block text-[11px] font-bold text-[#F3EFE6] mb-1">
              {t('تاريخ اعتماد المستخلص', 'Extract Date')}
            </label>
            <input
              type="date"
              value={extractDate}
              onChange={e => setExtractDate(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-[#243628] bg-[#17231A] text-xs font-bold text-[#F3EFE6] focus:outline-hidden focus:border-[#EBB34D] focus:ring-1 focus:ring-[#EBB34D] tabular-nums"
            />
          </div>
        </div>

        {/* Execution Period & Deductions Terms */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 rounded-2xl border border-[#243628] bg-[#121B14]">
          <div>
            <label className="block text-[11px] font-bold text-[#8FA392] mb-1">
              {t('الفترة المحاسبية: من', 'Period From')}
            </label>
            <input
              type="date"
              value={periodFrom}
              onChange={e => setPeriodFrom(e.target.value)}
              className="w-full h-9 px-3 rounded-xl border border-[#243628] bg-[#17231A] text-xs text-[#F3EFE6] tabular-nums"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#8FA392] mb-1">
              {t('الفترة المحاسبية: إلى', 'Period To')}
            </label>
            <input
              type="date"
              value={periodTo}
              onChange={e => setPeriodTo(e.target.value)}
              className="w-full h-9 px-3 rounded-xl border border-[#243628] bg-[#17231A] text-xs text-[#F3EFE6] tabular-nums"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#8FA392] mb-1">
              {t('استرداد دفعة مقدمة (%)', 'Advance Rec. %')}
            </label>
            <input
              type="number"
              value={advancePercent}
              onChange={e => setAdvancePercent(Number(e.target.value))}
              className="w-full h-9 px-3 rounded-xl border border-[#243628] bg-[#17231A] text-xs font-bold text-[#EBB34D] tabular-nums"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#8FA392] mb-1">
              {t('استقطاع ضمان أعمال (%)', 'Retention %')}
            </label>
            <input
              type="number"
              value={retentionPercent}
              onChange={e => setRetentionPercent(Number(e.target.value))}
              className="w-full h-9 px-3 rounded-xl border border-[#243628] bg-[#17231A] text-xs font-bold text-[#A3CFAC] tabular-nums"
            />
          </div>
        </div>

        {/* Dynamic Itemized Quantity & Value Grid */}
        <div className="rounded-2xl border border-[#243628] bg-[#121B14] overflow-hidden">
          <div className="p-3.5 border-b border-[#243628] flex items-center justify-between bg-[#17231A]">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-[#EBB34D]" />
              <span className="text-xs font-black text-[#F3EFE6]">
                {t('جدول حصر الكميات والأعمال التراكمية (Total = Previous + Current)', 'Cumulative Work Quantities Table')}
              </span>
            </div>
            <button
              type="button"
              onClick={addLine}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1F2E23] border border-[#243628] text-[#EBB34D] hover:bg-[#3D2D14] text-[11px] font-bold transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('إضافة بند مقايسة', 'Add BOQ Item')}</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-[#243628] bg-[#17231A] text-[#8FA392] font-black">
                  <th className="py-2.5 px-3 w-10">#</th>
                  <th className="py-2.5 px-3 min-w-[200px]">{t('بيان بند الأعمال / المقايسة', 'Item Description')}</th>
                  <th className="py-2.5 px-3 w-16">{t('الوحدة', 'Unit')}</th>
                  <th className="py-2.5 px-3 w-24">{t('كمية العقد', 'Contract Qty')}</th>
                  <th className="py-2.5 px-3 w-24">{t('سعر الفئة', 'Unit Rate')}</th>
                  <th className="py-2.5 px-3 w-24 text-[#8FA392]">{t('كمية سابقة', 'Prev Qty')}</th>
                  <th className="py-2.5 px-3 w-28 text-[#EBB34D]">{t('كمية حالية', 'Curr Qty')}</th>
                  <th className="py-2.5 px-3 w-24">{t('كمية إجمالية', 'Total Qty')}</th>
                  <th className="py-2.5 px-3 w-20">{t('الإنجاز %', '% Done')}</th>
                  <th className="py-2.5 px-3 w-28">{t('قيمة الأعمال الحالية', 'Current Value')}</th>
                  <th className="py-2.5 px-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#243628]">
                {lines.map((line, idx) => (
                  <tr key={idx} className="hover:bg-[#1F2E23]/30 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-[#8FA392] tabular-nums">{line.sr}</td>
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        value={line.descriptionAr}
                        onChange={e => updateLine(idx, 'descriptionAr', e.target.value)}
                        placeholder="وصف البند الهندسي..."
                        className="w-full h-8 px-2.5 rounded-lg border border-[#243628] bg-[#17231A] text-xs font-bold text-[#F3EFE6] focus:border-[#EBB34D]"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <select
                        value={line.unitNameAr}
                        onChange={e => updateLine(idx, 'unitNameAr', e.target.value)}
                        className="w-full h-8 px-1.5 rounded-lg border border-[#243628] bg-[#17231A] text-[11px] font-bold text-[#F3EFE6]"
                      >
                        <option value="م3">م3</option>
                        <option value="م2">م2</option>
                        <option value="طن">طن</option>
                        <option value="م.ط">م.ط</option>
                        <option value="عدد">عدد</option>
                        <option value="مقطوعية">مقطوعية</option>
                      </select>
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        value={line.contractQty}
                        onChange={e => updateLine(idx, 'contractQty', Number(e.target.value))}
                        className="w-full h-8 px-2 rounded-lg border border-[#243628] bg-[#17231A] text-xs font-bold text-[#F3EFE6] tabular-nums"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        value={line.unitRate}
                        onChange={e => updateLine(idx, 'unitRate', Number(e.target.value))}
                        className="w-full h-8 px-2 rounded-lg border border-[#243628] bg-[#17231A] text-xs font-bold text-[#F3EFE6] tabular-nums"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        value={line.previousQty}
                        onChange={e => updateLine(idx, 'previousQty', Number(e.target.value))}
                        className="w-full h-8 px-2 rounded-lg border border-[#243628] bg-[#17231A] text-xs font-bold text-[#8FA392] tabular-nums"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        value={line.currentQty}
                        onChange={e => updateLine(idx, 'currentQty', Number(e.target.value))}
                        className="w-full h-8 px-2 rounded-lg border border-[#EBB34D]/40 bg-[#3D2D14]/20 text-xs font-bold text-[#EBB34D] tabular-nums"
                      />
                    </td>
                    <td className="py-2.5 px-3 font-bold text-[#F3EFE6] tabular-nums">
                      {formatNumber(line.totalQty)}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-[#EBB34D] tabular-nums">
                      {line.completionPercent}%
                    </td>
                    <td className="py-2.5 px-3 font-bold text-[#F3EFE6] tabular-nums">
                      {formatCurrency(line.currentValue)}
                    </td>
                    <td className="py-2.5 px-3">
                      <button
                        type="button"
                        onClick={() => removeLine(idx)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-rose-400 hover:bg-[#3F2A2A] transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Deductions & Settlement Calculation Panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Deductions Breakdown */}
          <div className="p-4 rounded-2xl border border-[#243628] bg-[#121B14] space-y-3">
            <h4 className="text-xs font-black text-[#F3EFE6] flex items-center gap-2">
              <Percent className="w-4 h-4 text-[#EBB34D]" />
              <span>{t('تسوية الاستقطاعات والضمانات التعاقدية', 'Contractual Deductions & Retentions')}</span>
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-[#243628]">
                <span className="text-[#8FA392]">
                  {t('إجمالي قيمة الأعمال الحالية المنجزة:', 'Total Current Work:')}
                </span>
                <span className="font-bold text-[#F3EFE6] tabular-nums">
                  {formatCurrency(currentWorkTotal)}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-[#243628] text-rose-400">
                <span>(-) استرداد الدفعة المقدمة ({advancePercent}%):</span>
                <span className="font-bold tabular-nums">
                  -{formatCurrency(advanceDeductionAmount)}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-[#243628] text-blue-400">
                <span>(-) استقطاع ضمان أعمال محتجز ({retentionPercent}%):</span>
                <span className="font-bold tabular-nums">
                  -{formatCurrency(retentionDeductionAmount)}
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-[#8FA392]">
                  (-) جزاءات واستقطاعات فنية أخرى:
                </span>
                <div className="w-32">
                  <input
                    type="number"
                    value={otherDeductions}
                    onChange={e => setOtherDeductions(Number(e.target.value))}
                    className="w-full h-7 px-2 text-left rounded-lg border border-[#243628] bg-[#17231A] text-xs font-bold text-[#F3EFE6] tabular-nums"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Net Due & Automated Double-Entry GL Preview */}
          <div className="p-4 rounded-2xl border border-[#EBB34D]/30 bg-[#3D2D14]/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#F3EFE6]">
                {t('صافي المبلغ المستحق للصرف', 'Net Payable Amount')}
              </span>
              <span className="text-xl font-mono font-black text-[#D99B26] dark:text-[#EBB34D] tabular-nums">
                {formatCurrency(netPayable)}
              </span>
            </div>

            {/* Arabic Tafqeet Box */}
            <div className="p-2.5 rounded-xl bg-[#121B14] border border-[#243628] text-[11px] text-[#F3EFE6] leading-relaxed">
              <span className="font-bold text-[#EBB34D] ml-1">{t('فقط وقدره:', 'Tafqeet:')}</span>
              <span className="font-serif font-bold">{tafqeetText || 'صفر جنيه مصري'}</span>
            </div>

            {/* Automated Journal Voucher Preview */}
            <div className="p-2.5 rounded-xl bg-[#121B14] border border-[#243628] text-[10px] space-y-1">
              <div className="font-bold text-[#A3CFAC] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>{t('توليد القيد المحاسبي المزدوج آلياً في اليومية العامة (GL Voucher):', 'Automated GL Voucher Posting:')}</span>
              </div>
              {extractType === 'OWNER' ? (
                <div className="text-[#8FA392] space-y-0.5 tabular-nums">
                  <div>من حـ/ العميل المدين (صافي المستحق): {formatCurrency(netPayable)}</div>
                  <div>من حـ/ أمانات ضمان أعمال محتجزة (5%): {formatCurrency(retentionDeductionAmount)}</div>
                  <div>من حـ/ إطفاء دفعات مقدمة واستقطاعات: {formatCurrency(advanceDeductionAmount + (otherDeductions || 0))}</div>
                  <div className="text-[#EBB34D] font-bold">إلى حـ/ إيرادات عقود ومقاولات: {formatCurrency(currentWorkTotal)}</div>
                </div>
              ) : (
                <div className="text-[#8FA392] space-y-0.5 tabular-nums">
                  <div className="text-[#EBB34D] font-bold">من حـ/ تكاليف مشروعات ومقاولي باطن (WIP): {formatCurrency(currentWorkTotal)}</div>
                  <div>إلى حـ/ مقاول الباطن الدائن (صافي المستحق): {formatCurrency(netPayable)}</div>
                  <div>إلى حـ/ أمانات محتجزة لمقاول الباطن (5%): {formatCurrency(retentionDeductionAmount)}</div>
                  <div>إلى حـ/ استرداد دفعات مقدمة مقاولي باطن: {formatCurrency(advanceDeductionAmount + (otherDeductions || 0))}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
};
