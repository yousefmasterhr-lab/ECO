import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useFinancial } from '../../../context/FinancialContext';
import { ChequeType, ChequePayload } from '../../../services/database/types';
import { tafqeet } from '../../../utils/tafqeet';
import { Modal, formatNumber } from '@erp/ui-system';
import {
  Receipt,
  Building,
  Calendar,
  DollarSign,
  User,
  FileText,
  AlertCircle,
  CheckCircle2,
  Briefcase
} from 'lucide-react';

interface ChequeModalProps {
  initialType?: ChequeType;
  onClose: () => void;
  onSuccess?: () => void;
}

const COMMON_BANKS = [
  'البنك التجاري الدولي (CIB)',
  'البنك الأهلي المصري (NBE)',
  'بنك مصر (Banque Misr)',
  'بنك قطر الوطني الأهلي (QNB)',
  'بنك الإسكندرية (AlexBank)',
  'مصرف أبو ظبي الإسلامي (ADIB)',
  'بنك القاهرة (Banque du Caire)',
  'بنك فيصل الإسلامي المصري',
];

export const ChequeModal: React.FC<ChequeModalProps> = ({
  initialType = 'RECEIVABLE',
  onClose,
  onSuccess
}) => {
  const { t } = useLanguage();
  const { costCenters, addCheque } = useFinancial();

  const [type, setType] = useState<ChequeType>(initialType);
  const [chequeNo, setChequeNo] = useState('');
  const [drawerName, setDrawerName] = useState('');
  const [bankName, setBankName] = useState(COMMON_BANKS[0]);
  const [customBank, setCustomBank] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  );
  const [costcenterId, setCostcenterId] = useState(
    costCenters[0]?.id || costCenters[0]?.Costcenter_ID || ''
  );
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const numAmount = parseFloat(amount) || 0;
  const tafqeetText = numAmount > 0 ? tafqeet(numAmount) : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!chequeNo.trim()) {
      setErrorMessage(t('يرجى إدخال رقم الشيك.', 'Please enter cheque number.'));
      return;
    }

    if (numAmount <= 0) {
      setErrorMessage(t('يرجى إدخال مبلغ صحيح أكبر من الصفر.', 'Amount must be greater than zero.'));
      return;
    }

    if (!drawerName.trim()) {
      setErrorMessage(
        type === 'RECEIVABLE'
          ? t('يرجى تحديد اسم الساحب (المصدر).', 'Please enter drawer name.')
          : t('يرجى تحديد اسم المستفيد.', 'Please enter beneficiary name.')
      );
      return;
    }

    const finalBank = bankName === 'أخرى' ? customBank.trim() : bankName;
    if (!finalBank) {
      setErrorMessage(t('يرجى تحديد البنك المسحوب عليه.', 'Please specify the bank.'));
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedCc = costCenters.find(c => (c.id || c.Costcenter_ID) === costcenterId);

      const targetAccount = type === 'RECEIVABLE' ? '1205001' : '2203001';
      const targetAccountName = type === 'RECEIVABLE' ? 'أوراق قبض برسم التحصيل' : 'أوراق دفع مستحقة';

      const payload: ChequePayload = {
        chequeNo: chequeNo.trim(),
        type,
        drawerName: drawerName.trim(),
        bankName: finalBank,
        targetAccount,
        targetAccountName,
        amount: numAmount,
        issueDate,
        dueDate,
        status: 'UNDER_COLLECTION',
        costcenterId: selectedCc ? (selectedCc.id || selectedCc.Costcenter_ID) : undefined,
        costcenterName: selectedCc ? (selectedCc.nameAr || selectedCc.Costcenter_Name_A) : undefined,
        notes: notes.trim() || undefined,
      };

      const result = await addCheque(payload);
      if (result.success) {
        onSuccess?.();
        onClose();
      } else {
        setErrorMessage(result.error || t('فشل في حفظ الشيك.', 'Failed to save cheque.'));
      }
    } catch (err: any) {
      setErrorMessage(err.message || t('حدث خطأ أثناء الاتصال بالنظام.', 'An unexpected error occurred.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      maxWidth="max-w-2xl"
      title={
        type === 'RECEIVABLE'
          ? t('تسجيل شيك وارد جديد (ورقة قبض)', 'Register Received Cheque (Promissory Note)')
          : t('تحرير شيك صادر جديد (ورقة دفع)', 'Issue Payable Cheque (Commercial Paper)')
      }
      subtitle={t(
        'إدراج شيك جديد في المحفظة المالية وتتبع دورة حياته البنكية',
        'Add cheque to portfolio and track clearing lifecycle'
      )}
      icon={Receipt}
      badge={
        <span
          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
            type === 'RECEIVABLE'
              ? 'bg-[#2A3F30] text-[#A3CFAC] border border-[#3E5C46]'
              : 'bg-[#3D2D14] text-[#EBB34D] border border-[#5C431D]'
          }`}
        >
          {type === 'RECEIVABLE' ? t('ورقة قبض (وارد)', 'Receivable') : t('ورقة دفع (صادر)', 'Payable')}
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
            disabled={isSubmitting || numAmount <= 0 || !chequeNo.trim()}
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl bg-[#D99B26] hover:bg-[#C58F38] text-[#0E1610] shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? (
              <span>{t('جاري الحفظ...', 'Saving...')}</span>
            ) : (
              <span>{t('حفظ وتسجيل الشيك', 'Save & Register Cheque')}</span>
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

        {/* Cheque Type Toggle */}
        <div className="flex p-1 bg-[#121B14] rounded-xl border border-[#243628]">
          <button
            type="button"
            onClick={() => setType('RECEIVABLE')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              type === 'RECEIVABLE'
                ? 'bg-[#2A3F30] text-[#A3CFAC] border border-[#3E5C46] shadow-xs'
                : 'text-[#8FA392] hover:text-[#F3EFE6]'
            }`}
          >
            {t('شيك وارد - ورقة قبض (+)', 'Receivable Cheque (+)')}
          </button>
          <button
            type="button"
            onClick={() => setType('PAYABLE')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              type === 'PAYABLE'
                ? 'bg-[#3D2D14] text-[#EBB34D] border border-[#5C431D] shadow-xs'
                : 'text-[#8FA392] hover:text-[#F3EFE6]'
            }`}
          >
            {t('شيك صادر - ورقة دفع (-)', 'Payable Cheque (-)')}
          </button>
        </div>

        {/* Cheque Core Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#F3EFE6] mb-1.5">
              {t('رقم الشيك الدفتري', 'Cheque Number')} *
            </label>
            <input
              type="text"
              required
              placeholder="مثال: 0048921"
              value={chequeNo}
              onChange={e => setChequeNo(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-[#243628] bg-[#121B14] text-[#F3EFE6] focus:outline-hidden focus:border-[#EBB34D] tabular-nums"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#F3EFE6] mb-1.5">
              {type === 'RECEIVABLE'
                ? t('اسم الساحب (المحرر للشيك)', 'Drawer / Issuer')
                : t('اسم المستفيد (يُصرف لأمر)', 'Beneficiary / Payee')}{' '}
              *
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-[#8FA392]" />
              <input
                type="text"
                required
                placeholder={type === 'RECEIVABLE' ? 'اسم العميل / الشركة المودعة' : 'اسم المورد / الجهة المستحقة'}
                value={drawerName}
                onChange={e => setDrawerName(e.target.value)}
                className="w-full ps-9 pe-3 py-2 text-xs font-semibold rounded-xl border border-[#243628] bg-[#121B14] text-[#F3EFE6] focus:outline-hidden focus:border-[#EBB34D]"
              />
            </div>
          </div>
        </div>

        {/* Bank Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#F3EFE6] mb-1.5">
              {t('البنك المسحوب عليه', 'Drawee Bank')} *
            </label>
            <div className="relative">
              <Building className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-[#8FA392]" />
              <select
                value={bankName}
                onChange={e => setBankName(e.target.value)}
                className="w-full ps-9 pe-3 py-2 text-xs font-semibold rounded-xl border border-[#243628] bg-[#121B14] text-[#F3EFE6] focus:outline-hidden focus:border-[#EBB34D]"
              >
                {COMMON_BANKS.map(b => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
                <option value="أخرى">{t('بنك آخر...', 'Other bank...')}</option>
              </select>
            </div>
          </div>

          {bankName === 'أخرى' && (
            <div>
              <label className="block text-xs font-bold text-[#F3EFE6] mb-1.5">
                {t('اسم البنك المخصص', 'Custom Bank Name')} *
              </label>
              <input
                type="text"
                required
                placeholder="اكتب اسم البنك..."
                value={customBank}
                onChange={e => setCustomBank(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#243628] bg-[#121B14] text-[#F3EFE6] focus:outline-hidden focus:border-[#EBB34D]"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#F3EFE6] mb-1.5">
              {t('مركز التكلفة / المشروع', 'Cost Center')}
            </label>
            <div className="relative">
              <Briefcase className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-[#8FA392]" />
              <select
                value={costcenterId}
                onChange={e => setCostcenterId(e.target.value)}
                className="w-full ps-9 pe-3 py-2 text-xs font-semibold rounded-xl border border-[#243628] bg-[#121B14] text-[#F3EFE6] focus:outline-hidden focus:border-[#EBB34D]"
              >
                {costCenters.map(cc => (
                  <option key={cc.id || cc.Costcenter_ID} value={cc.id || cc.Costcenter_ID}>
                    {cc.nameAr || cc.Costcenter_Name_A}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Amount & Tafqeet */}
        <div className="p-4 rounded-xl border border-[#243628] bg-[#121B14] space-y-3">
          <div>
            <label className="block text-xs font-bold text-[#F3EFE6] mb-1.5">
              {t('مبلغ الشيك (ج.م)', 'Amount (EGP)')} *
            </label>
            <div className="relative">
              <DollarSign className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-[#EBB34D]" />
              <input
                type="number"
                min="1"
                step="any"
                required
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full ps-9 pe-3 py-2 text-base font-bold rounded-xl border border-[#243628] bg-[#17231A] text-[#EBB34D] focus:outline-hidden focus:border-[#EBB34D] tabular-nums"
              />
            </div>
            {numAmount > 0 && (
              <div className="text-[11px] text-[#8FA392] mt-1 tabular-nums">
                = {formatNumber(numAmount)} ج.م
              </div>
            )}
          </div>

          {tafqeetText && (
            <div className="p-2.5 rounded-lg bg-[#17231A] border border-[#243628] text-xs text-[#F3EFE6] flex items-start gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#A3CFAC] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#EBB34D]">فقط وقدره: </span>
                <span className="font-semibold">{tafqeetText}</span>
              </div>
            </div>
          )}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#F3EFE6] mb-1.5">
              {t('تاريخ التحرير (الإصدار)', 'Issue Date')} *
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-[#8FA392]" />
              <input
                type="date"
                required
                value={issueDate}
                onChange={e => setIssueDate(e.target.value)}
                className="w-full ps-9 pe-3 py-2 text-xs font-mono rounded-xl border border-[#243628] bg-[#121B14] text-[#F3EFE6] focus:outline-hidden focus:border-[#EBB34D] tabular-nums"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#F3EFE6] mb-1.5">
              {t('تاريخ الاستحقاق (الصرف)', 'Due Date')} *
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-[#EBB34D]" />
              <input
                type="date"
                required
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full ps-9 pe-3 py-2 text-xs font-mono font-bold rounded-xl border border-[#243628] bg-[#121B14] text-[#EBB34D] focus:outline-hidden focus:border-[#EBB34D] tabular-nums"
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-bold text-[#F3EFE6] mb-1.5">
            {t('ملاحظات وبيان الشيك', 'Remarks')}
          </label>
          <div className="relative">
            <FileText className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-[#8FA392]" />
            <input
              type="text"
              placeholder="دفعة تحت الحساب / ضمان أعمال..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full ps-9 pe-3 py-2 text-xs rounded-xl border border-[#243628] bg-[#121B14] text-[#F3EFE6] focus:outline-hidden focus:border-[#EBB34D]"
            />
          </div>
        </div>
      </form>
    </Modal>
  );
};
