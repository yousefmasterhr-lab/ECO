import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useFinancial } from '../../../context/FinancialContext';
import { ContractPayload } from '../../../services/database/types';
import { Modal, formatCurrency, formatNumber } from '@erp/ui-system';
import {
  FileCheck,
  Building,
  HardHat,
  Percent,
  Calendar,
  AlertCircle,
  FileText
} from 'lucide-react';

interface ContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: 'CLIENT' | 'SUBCONTRACTOR';
}

export const ContractModal: React.FC<ContractModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'CLIENT',
}) => {
  const { t } = useLanguage();
  const { costCentersTree, clients, suppliers, dimensions, saveContract } = useFinancial();

  const [contractType, setContractType] = useState<'CLIENT' | 'SUBCONTRACTOR'>(defaultType);
  const [contractNo, setContractNo] = useState<number>(() => Math.floor(100 + Math.random() * 900));
  const [costCenterId, setCostCenterId] = useState<number>(52013); // Default to El-Agouza Hospital
  const [partyId, setPartyId] = useState<number>(0);
  const [partyNameAr, setPartyNameAr] = useState('');
  const [consultantNameAr, setConsultantNameAr] = useState('دار الاستشارات الهندسية (شاكر ومشاركوه)');
  const [totalValue, setTotalValue] = useState<number>(5000000);
  const [advancePercent, setAdvancePercent] = useState<number>(10);
  const [retentionPercent, setRetentionPercent] = useState<number>(5);
  const [startDate, setStartDate] = useState<string>('2026-01-01');
  const [endDate, setEndDate] = useState<string>('2026-12-31');
  const [notice, setNotice] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Project cost centers
  const projectCostCenters = useMemo(() => {
    return costCentersTree.filter(c => c.mainCenterId === 52 || c.nameAr.includes('مشروع') || c.nameAr.includes('مستشفى'));
  }, [costCentersTree]);

  // Selected project name
  const selectedProject = useMemo(() => {
    return costCentersTree.find(c => c.id === costCenterId);
  }, [costCentersTree, costCenterId]);

  // Handle party selection
  const handlePartySelect = (id: number, name: string) => {
    setPartyId(id);
    setPartyNameAr(name);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (totalValue <= 0) {
      setErrorMsg(t('يرجى تحديد قيمة تعاقدية صالحة أكبر من صفر', 'Please enter a valid contract value > 0'));
      return;
    }
    if (!partyNameAr && !partyId) {
      setErrorMsg(t('يرجى تحديد الطرف المتعاقد (العميل أو مقاول الباطن)', 'Please select the contracting party'));
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: ContractPayload = {
        contractNo,
        contractType,
        projectNameAr: selectedProject ? selectedProject.nameAr : 'مشروع مقاولات عام',
        costCenterId,
        partyId: partyId || (contractType === 'CLIENT' ? 1204001 : 2202001),
        partyNameAr: partyNameAr || (contractType === 'CLIENT' ? 'جهة التعاقد الرئيسية' : 'مقاول الباطن التخصصي'),
        consultantNameAr,
        totalValue,
        advancePaymentPercent: advancePercent,
        retentionPercent,
        startDate,
        endDate,
        notice,
      };

      const res = await saveContract(payload);
      if (res.success) {
        onClose();
      } else {
        setErrorMsg(res.error || 'فشل في حفظ العقد');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'خطأ غير متوقع أثناء تسجيل العقد');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-4xl"
      title={t('تسجيل عقد مشروعات وارتباط هندسي جديد', 'Register Engineering & Project Contract')}
      subtitle={t(
        'إنشاء وثيقة تعاقدية مع تحديد نسب الدفعة المقدمة وضمان الأعمال ومركز التكلفة',
        'Register contractual terms, advance payment, retention guarantee & cost center'
      )}
      icon={FileCheck}
      badge={
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] dark:bg-[#3D2D14] dark:text-[#EBB34D] dark:border-[#5C431D]">
          {contractType === 'CLIENT' ? 'عقد عميل / مالك' : 'عقد مقاول باطن'}
        </span>
      }
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#1F2E23] text-xs font-bold text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6] transition-colors cursor-pointer"
          >
            {t('إلغاء', 'Cancel')}
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-l from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
          >
            <FileCheck className="w-4 h-4" />
            <span>{isSubmitting ? t('جاري الحفظ...', 'Saving...') : t('اعتماد وتسجيل العقد', 'Save & Register Contract')}</span>
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {errorMsg && (
          <div className="flex items-center gap-2 p-4 rounded-xl bg-[#F8EBEB] text-[#7A2828] border border-[#E3B8B8] dark:bg-[#3F2A2A] dark:border-[#5C3E3E] dark:text-[#EFA3A3] text-xs font-bold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Contract Type Tabs */}
        <div>
          <label className="block text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-2">
            {t('نوع التعاقد والارتباط المالي', 'Contract Type')}
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setContractType('CLIENT');
                setPartyNameAr('');
                setPartyId(0);
              }}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                contractType === 'CLIENT'
                  ? 'border-[#D99B26] bg-[#FEF3C7] text-[#92400E] dark:border-[#EBB34D] dark:bg-[#3D2D14] dark:text-[#EBB34D] shadow-xs'
                  : 'border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#121B14] text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6]'
              }`}
            >
              <Building className="w-4 h-4" />
              <span>{t('عقد مالك / عميل رئيسي (Owner Contract)', 'Owner / Client Contract')}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setContractType('SUBCONTRACTOR');
                setPartyNameAr('');
                setPartyId(0);
              }}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                contractType === 'SUBCONTRACTOR'
                  ? 'border-[#D99B26] bg-[#FEF3C7] text-[#92400E] dark:border-[#EBB34D] dark:bg-[#3D2D14] dark:text-[#EBB34D] shadow-xs'
                  : 'border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#121B14] text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6]'
              }`}
            >
              <HardHat className="w-4 h-4" />
              <span>{t('عقد مقاول باطن وتخصصي (Subcontractor Package)', 'Subcontractor Contract')}</span>
            </button>
          </div>
        </div>

        {/* Project & Contract No Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1.5">
              {t('مركز تكلفة المشروع المرتبط', 'Linked Project Cost Center')}
            </label>
            <select
              value={costCenterId}
              onChange={e => setCostCenterId(Number(e.target.value))}
              className="w-full h-11 px-3.5 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#121B14] text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] focus:outline-hidden focus:border-[#EBB34D] focus:ring-1 focus:ring-[#EBB34D] shadow-2xs cursor-pointer"
            >
              {projectCostCenters.map(cc => (
                <option key={cc.id} value={cc.id} className="bg-white dark:bg-[#17231A]">
                  [{cc.id}] {cc.nameAr}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1.5">
              {t('رقم العقد الهندسي (Contract No)', 'Contract Reference No')}
            </label>
            <input
              type="number"
              value={contractNo}
              onChange={e => setContractNo(Number(e.target.value))}
              className="w-full h-11 px-3.5 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#121B14] text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] focus:outline-hidden focus:border-[#EBB34D] focus:ring-1 focus:ring-[#EBB34D] tabular-nums shadow-2xs"
              placeholder="101"
            />
          </div>
        </div>

        {/* Party Selection & Consultant */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1.5">
              {contractType === 'CLIENT'
                ? t('جهة الإسناد والعميل (المالك)', 'Client / Owner Party')
                : t('مقاول الباطن / البعد التحليلي', 'Subcontractor / Trade Dimension')}
            </label>

            {contractType === 'CLIENT' ? (
              <select
                value={partyId || ''}
                onChange={e => {
                  const c = clients.find(cl => cl.clientId === Number(e.target.value));
                  if (c) handlePartySelect(c.clientId, c.nameAr);
                }}
                className="w-full h-11 px-3.5 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#121B14] text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] focus:outline-hidden focus:border-[#EBB34D] focus:ring-1 focus:ring-[#EBB34D] shadow-2xs cursor-pointer"
              >
                <option value="" className="bg-white dark:bg-[#17231A]">{t('اختر العميل المطور...', 'Select Client...')}</option>
                {clients.map(c => (
                  <option key={c.clientId} value={c.clientId} className="bg-white dark:bg-[#17231A]">
                    {c.nameAr}
                  </option>
                ))}
                <option value="1204001" className="bg-white dark:bg-[#17231A]">شركة إعمار مصر للتنمية (المطور العام)</option>
                <option value="1204002" className="bg-white dark:bg-[#17231A]">شركة المقاولون العرب (عثمان أحمد عثمان)</option>
                <option value="1204003" className="bg-white dark:bg-[#17231A]">مجموعة طلعت مصطفى القابضة (TMG)</option>
                <option value="1204004" className="bg-white dark:bg-[#17231A]">شركة حسن علام للمقاولات الإنشائية</option>
              </select>
            ) : (
              <select
                value={partyId || ''}
                onChange={e => {
                  const dim = dimensions.find(d => d.id === Number(e.target.value));
                  if (dim) {
                    handlePartySelect(dim.id, dim.nameAr);
                  } else {
                    const sup = suppliers.find(s => s.supplierId === Number(e.target.value));
                    if (sup) handlePartySelect(sup.supplierId, sup.nameAr);
                  }
                }}
                className="w-full h-11 px-3.5 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#121B14] text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] focus:outline-hidden focus:border-[#EBB34D] focus:ring-1 focus:ring-[#EBB34D] shadow-2xs cursor-pointer"
              >
                <option value="" className="bg-white dark:bg-[#17231A]">{t('اختر مقاول الباطن من الأبعاد التحليلية...', 'Select Subcontractor...')}</option>
                {dimensions
                  .filter(d => d.category === 'SUBCONTRACTORS' || d.nameAr.includes('مقاول') || d.nameAr.includes('أبو') || d.nameAr.includes('عزوز'))
                  .map(d => (
                    <option key={d.id} value={d.id} className="bg-white dark:bg-[#17231A]">
                      {d.nameAr}
                    </option>
                  ))}
                {suppliers.map(s => (
                  <option key={s.supplierId} value={s.supplierId} className="bg-white dark:bg-[#17231A]">
                    {s.nameAr}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1.5">
              {t('جهة الإشراف والاستشاري الهندسي', 'Engineering Consultant')}
            </label>
            <input
              type="text"
              value={consultantNameAr}
              onChange={e => setConsultantNameAr(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#121B14] text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] focus:outline-hidden focus:border-[#EBB34D] focus:ring-1 focus:ring-[#EBB34D] shadow-2xs"
              placeholder="مكتب الاستشارات الهندسية"
            />
          </div>
        </div>

        {/* Financial Values & Deductions */}
        <div className="p-4 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#121B14] space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-[#1A241C] dark:text-[#F3EFE6] flex items-center gap-2">
              <Percent className="w-4 h-4 text-[#D99B26] dark:text-[#EBB34D]" />
              <span>{t('القيمة التعاقدية ونسب الاستقطاعات النظامية', 'Contract Value & Deductions Terms')}</span>
            </h4>
            <span className="text-xs font-bold font-inter text-[#D99B26] dark:text-[#EBB34D] tabular-nums">
              {formatCurrency(totalValue)}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-[#5C665E] dark:text-[#8FA392] mb-1">
                {t('إجمالي قيمة العقد (ج.م)', 'Total Contract Value (EGP)')}
              </label>
              <input
                type="number"
                value={totalValue}
                onChange={e => setTotalValue(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#17231A] text-xs font-bold text-[#D99B26] dark:text-[#EBB34D] focus:outline-hidden focus:border-[#EBB34D] focus:ring-1 focus:ring-[#EBB34D] tabular-nums shadow-2xs"
              />
              <div className="text-[10px] text-[#5C665E] dark:text-[#8FA392] mt-1 tabular-nums">
                = {formatNumber(totalValue)} ج.م
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#5C665E] dark:text-[#8FA392] mb-1">
                {t('نسبة استرداد الدفعة المقدمة (%)', 'Advance Payment Rec. %')}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={advancePercent}
                  onChange={e => setAdvancePercent(Number(e.target.value))}
                  className="w-full h-10 px-3 pr-8 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#17231A] text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] focus:outline-hidden focus:border-[#EBB34D] focus:ring-1 focus:ring-[#EBB34D] tabular-nums shadow-2xs"
                />
                <span className="absolute left-3 top-2.5 text-xs text-[#5C665E] dark:text-[#8FA392] font-bold">%</span>
              </div>
              <div className="text-[10px] text-[#5C665E] dark:text-[#8FA392] mt-1 tabular-nums">
                = {formatCurrency(Math.round(totalValue * (advancePercent / 100)))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#5C665E] dark:text-[#8FA392] mb-1">
                {t('نسبة استقطاع ضمان الأعمال (%)', 'Retention Guarantee %')}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={retentionPercent}
                  onChange={e => setRetentionPercent(Number(e.target.value))}
                  className="w-full h-10 px-3 pr-8 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#17231A] text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] focus:outline-hidden focus:border-[#EBB34D] focus:ring-1 focus:ring-[#EBB34D] tabular-nums shadow-2xs"
                />
                <span className="absolute left-3 top-2.5 text-xs text-[#5C665E] dark:text-[#8FA392] font-bold">%</span>
              </div>
              <div className="text-[10px] text-[#5C665E] dark:text-[#8FA392] mt-1 tabular-nums">
                = {formatCurrency(Math.round(totalValue * (retentionPercent / 100)))}
              </div>
            </div>
          </div>
        </div>

        {/* Dates & Timeline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#D99B26] dark:text-[#EBB34D]" />
              <span>{t('تاريخ بدء التعاقد', 'Contract Start Date')}</span>
            </label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#121B14] text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] focus:outline-hidden focus:border-[#EBB34D] focus:ring-1 focus:ring-[#EBB34D] tabular-nums shadow-2xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#D99B26] dark:text-[#EBB34D]" />
              <span>{t('تاريخ الانتهاء والتسليم الابتدائي', 'Completion Date')}</span>
            </label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#121B14] text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] focus:outline-hidden focus:border-[#EBB34D] focus:ring-1 focus:ring-[#EBB34D] tabular-nums shadow-2xs"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1.5 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-[#D99B26] dark:text-[#EBB34D]" />
            <span>{t('بيان الأعمال والملاحظات التعاقدية', 'Scope of Work / Remarks')}</span>
          </label>
          <textarea
            value={notice}
            onChange={e => setNotice(e.target.value)}
            rows={2}
            className="w-full p-3 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#121B14] text-xs text-[#1A241C] dark:text-[#F3EFE6] focus:outline-hidden focus:border-[#EBB34D] focus:ring-1 focus:ring-[#EBB34D] shadow-2xs"
            placeholder="وصف تفصيلي لحزمة الأعمال الهندسية وشروط التسليم..."
          />
        </div>
      </form>
    </Modal>
  );
};
