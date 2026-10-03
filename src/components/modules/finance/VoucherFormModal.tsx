import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useFinancial } from '../../../context/FinancialContext';
import { VoucherType, VoucherDetailLine } from '../../../services/database/types';
import { tafqeetArabic } from '../../../utils/tafqeet';
import { Modal, formatCurrency, formatNumber, toWesternDigits } from '@erp/ui-system';
import {
  Plus,
  Trash2,
  Save,
  AlertTriangle,
  Banknote
} from 'lucide-react';

interface VoucherFormModalProps {
  type: VoucherType;
  onClose: () => void;
}

export const VoucherFormModal: React.FC<VoucherFormModalProps> = ({ type, onClose }) => {
  const { t } = useLanguage();
  const { treasuryAccounts, accounts, costCenters, saveVoucher } = useFinancial();

  const isReceipt = type === 'RECEIPT';

  // Flat Level 5 leaf accounts for lookup
  const leafAccounts = useMemo(() => {
    const leaves: { id: string; code: string; nameAr: string }[] = [];
    const extractLeaves = (nodes: any[]) => {
      nodes.forEach(n => {
        if (n.level === 5) {
          leaves.push({ id: n.code, code: n.code, nameAr: n.nameAr });
        }
        if (n.children && n.children.length > 0) {
          extractLeaves(n.children);
        }
      });
    };
    extractLeaves(accounts);
    return leaves;
  }, [accounts]);

  // Form State
  const [noteNo] = useState(() => Math.floor(2000 + Math.random() * 8000));
  const [noteDate, setNoteDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [treasuryAccountId, setTreasuryAccountId] = useState(() => treasuryAccounts[0]?.id || '1201001');
  const [depositorOrPayee, setDepositorOrPayee] = useState('');
  const [generalMemo, setGeneralMemo] = useState('');
  const [defaultCostcenterId, setDefaultCostcenterId] = useState('0');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Multi-line entries
  const [lines, setLines] = useState<VoucherDetailLine[]>([
    {
      sr: 1,
      level5Id: leafAccounts[0]?.code || '2201001',
      level5NameAr: leafAccounts[0]?.nameAr || 'الموردين',
      debit: isReceipt ? 0 : 5000,
      credit: isReceipt ? 5000 : 0,
      costcenterId: '0',
      costcenterNameAr: 'مركز تكلفة عام',
      description: '',
    },
  ]);

  // Selected treasury account
  const selectedTreasury = treasuryAccounts.find(a => a.id === treasuryAccountId);

  // Total amount
  const totalAmount = useMemo(() => {
    return lines.reduce((acc, line) => {
      const val = isReceipt ? Number(line.credit) || 0 : Number(line.debit) || 0;
      return acc + val;
    }, 0);
  }, [lines, isReceipt]);

  // Dynamic Arabic Tafqeet text
  const tafqeetText = useMemo(() => {
    return tafqeetArabic(totalAmount, 'EGP');
  }, [totalAmount]);

  // Balance safety guard for payment vouchers
  const hasInsufficientFunds = useMemo(() => {
    if (isReceipt || !selectedTreasury) return false;
    return totalAmount > (selectedTreasury.balance || 0);
  }, [isReceipt, selectedTreasury, totalAmount]);

  const handleAddLine = () => {
    const nextSr = lines.length + 1;
    const defaultAcc = leafAccounts[nextSr % leafAccounts.length] || leafAccounts[0];
    setLines(prev => [
      ...prev,
      {
        sr: nextSr,
        level5Id: defaultAcc?.code || '1203001',
        level5NameAr: defaultAcc?.nameAr || 'العملاء',
        debit: isReceipt ? 0 : 0,
        credit: isReceipt ? 0 : 0,
        costcenterId: defaultCostcenterId,
        costcenterNameAr: costCenters.find(c => c.Costcenter_ID === defaultCostcenterId)?.Costcenter_Name_A || 'مركز تكلفة عام',
        description: generalMemo,
      },
    ]);
  };

  const handleRemoveLine = (index: number) => {
    if (lines.length <= 1) return;
    setLines(prev => prev.filter((_, i) => i !== index).map((l, i) => ({ ...l, sr: i + 1 })));
  };

  const handleLineChange = (index: number, field: keyof VoucherDetailLine, value: any) => {
    setLines(prev =>
      prev.map((l, i) => {
        if (i !== index) return l;
        const updated = { ...l, [field]: value };
        if (field === 'level5Id') {
          const matched = leafAccounts.find(a => a.code === value);
          if (matched) {
            updated.level5NameAr = matched.nameAr;
          }
        }
        if (field === 'costcenterId') {
          const matched = costCenters.find(c => c.Costcenter_ID === value);
          if (matched) {
            updated.costcenterNameAr = matched.Costcenter_Name_A;
          }
        }
        return updated;
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (totalAmount <= 0) {
      setErrorMessage(t('يرجى إدخال مبلغ صحيح أكبر من الصفر', 'Amount must be greater than zero'));
      return;
    }

    if (hasInsufficientFunds) {
      setErrorMessage(
        t(
          `رصيد الصندوق المحدد (${formatCurrency(selectedTreasury?.balance || 0)}) غير كافٍ لتنفيذ هذا الصرف!`,
          'Insufficient funds in selected treasury!'
        )
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        noteNo,
        noteDate,
        voucherType: type,
        description: depositorOrPayee ? `${depositorOrPayee} - ${generalMemo}` : generalMemo || (isReceipt ? 'سند تحصيل نقدية' : 'سند صرف نقدية'),
        amount: totalAmount,
        netText: tafqeetText,
        treasuryAccountId,
        treasuryAccountName: selectedTreasury?.nameAr || 'الخزينة',
        costcenterName: costCenters.find(c => c.Costcenter_ID === defaultCostcenterId)?.Costcenter_Name_A || 'مركز تكلفة عام',
        lines,
      };

      const result = await saveVoucher(payload);
      if (result.success) {
        onClose();
      } else {
        setErrorMessage(result.error || 'فشل حفظ السند');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'حدث خطأ أثناء حفظ السند');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      maxWidth="max-w-4xl"
      title={isReceipt ? t('تحرير سند قبض جديد (+)', 'New Receipt Voucher (+)') : t('تحرير سند صرف جديد (-)', 'New Payment Voucher (-)')}
      subtitle={isReceipt ? t('سندات القبض النقدية والبنكية', 'Receipt Voucher Entry') : t('سندات الصرف النقدية والبنكية', 'Payment Voucher Entry')}
      icon={Banknote}
      badge={
        <span
          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
            isReceipt
              ? 'bg-[#2A3F30] text-[#A3CFAC] border border-[#3E5C46]'
              : 'bg-[#3F2A2A] text-[#EFA3A3] border border-[#5C3E3E]'
          }`}
        >
          {isReceipt ? t('سند قبض نقدية / بنك', 'Cash / Bank Receipt') : t('سند صرف نقدية / بنك', 'Cash / Bank Payment')}
        </span>
      }
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-bold border border-[#243628] bg-[#1F2E23] text-[#8FA392] hover:text-[#F3EFE6] transition-colors cursor-pointer"
          >
            {t('إلغاء التحرير', 'Cancel')}
          </button>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || hasInsufficientFunds || totalAmount <= 0}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all bg-[#D99B26] hover:bg-[#C58F38] text-[#0E1610] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>
              {isSubmitting
                ? t('جارِ الحفظ والترحيل...', 'Saving & Posting...')
                : isReceipt
                ? t('حفظ وترحيل سند القبض', 'Save & Post Receipt')
                : t('حفظ وترحيل سند الصرف', 'Save & Post Payment')}
            </span>
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="p-5 space-y-5">
        {/* Error Notification */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-[#3F2A2A] border border-[#5C3E3E] text-[#EFA3A3] text-xs font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Insufficient Funds Warning */}
        {hasInsufficientFunds && (
          <div className="p-3.5 rounded-xl bg-[#3D2D14] border border-[#5C431D] text-[#EBB34D] text-xs font-bold flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 shrink-0 text-[#EBB34D]" />
            <div>
              <span className="block font-black">
                {t('تحذير رقابي: رصيد الخزينة غير كافٍ!', 'Warning: Insufficient Cash Balance!')}
              </span>
              <span className="block text-[11px] mt-0.5 font-normal">
                {t(
                  `رصيد ${selectedTreasury?.nameAr} الحالي هو (${formatCurrency(selectedTreasury?.balance)}) بينما إجمالي السند المطلوب صرفه هو (${formatCurrency(totalAmount)}).`,
                  'Available balance is less than required payout.'
                )}
              </span>
            </div>
          </div>
        )}

        {/* Header Fields Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 p-4 rounded-xl border border-[#243628] bg-[#121B14]">
          {/* Note Number */}
          <div>
            <label className="block text-xs font-bold text-[#8FA392] mb-1">
              {t('رقم السند الدفتري', 'Voucher No.')}
            </label>
            <input
              type="text"
              readOnly
              value={toWesternDigits(noteNo)}
              className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-[#17231A] border border-[#243628] text-[#EBB34D] cursor-not-allowed tabular-nums"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-bold text-[#8FA392] mb-1">
              {t('تاريخ التحرير', 'Date')}
            </label>
            <input
              type="date"
              value={noteDate}
              onChange={e => setNoteDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-[#17231A] border border-[#243628] text-[#F3EFE6] focus:border-[#EBB34D] tabular-nums"
            />
          </div>

          {/* Treasury Account Selector */}
          <div>
            <label className="block text-xs font-bold text-[#8FA392] mb-1">
              {isReceipt ? t('حساب القبض (خزينة / بنك)', 'Receiving Account') : t('حساب الصرف (خزينة / بنك)', 'Disbursement Account')}
            </label>
            <select
              value={treasuryAccountId}
              onChange={e => setTreasuryAccountId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-[#17231A] border border-[#243628] text-[#F3EFE6] focus:border-[#EBB34D]"
            >
              {treasuryAccounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.nameAr} ({formatCurrency(acc.balance)})
                </option>
              ))}
            </select>
          </div>

          {/* Default Cost Center */}
          <div>
            <label className="block text-xs font-bold text-[#8FA392] mb-1">
              {t('مركز التكلفة / المشروع', 'Cost Center')}
            </label>
            <select
              value={defaultCostcenterId}
              onChange={e => setDefaultCostcenterId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-[#17231A] border border-[#243628] text-[#F3EFE6] focus:border-[#EBB34D]"
            >
              {costCenters.map(cc => (
                <option key={cc.Costcenter_ID} value={cc.Costcenter_ID}>
                  {cc.Costcenter_Name_A}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Depositor / Payee & Memo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-bold text-[#8FA392] mb-1">
              {isReceipt ? t('استلمنا من السيد / السادة (المودع)', 'Received From') : t('يُصرف للسيد / السادة (المستفيد)', 'Pay To')}
            </label>
            <input
              type="text"
              value={depositorOrPayee}
              onChange={e => setDepositorOrPayee(e.target.value)}
              placeholder={isReceipt ? 'مثال: شركة المستقبل للتعمير...' : 'مثال: شركة السويس للصلب...'}
              className="w-full px-3 py-2 rounded-xl text-xs bg-[#121B14] border border-[#243628] text-[#F3EFE6] focus:border-[#EBB34D]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#8FA392] mb-1">
              {t('البيان العام للسند (Memo)', 'Description')}
            </label>
            <input
              type="text"
              value={generalMemo}
              onChange={e => setGeneralMemo(e.target.value)}
              placeholder="مثال: دفعة تحت الحساب لمشروع كفر ابراش الشرقية..."
              className="w-full px-3 py-2 rounded-xl text-xs bg-[#121B14] border border-[#243628] text-[#F3EFE6] focus:border-[#EBB34D]"
            />
          </div>
        </div>

        {/* Multi-line Entry DataGrid */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#F3EFE6]">
              {isReceipt ? t('الحسابات الدائنة المقابلة (إيرادات / عملاء)', 'Offset Credit Accounts') : t('الحسابات المدينة المقابلة (مصروفات / موردين)', 'Offset Debit Accounts')}
            </span>

            <button
              type="button"
              onClick={handleAddLine}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#1F2E23] text-[#EBB34D] border border-[#243628] hover:bg-[#3D2D14] transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('إضافة بند آخر', 'Add Line')}</span>
            </button>
          </div>

          <div className="rounded-xl border border-[#243628] overflow-hidden bg-[#121B14]">
            <table className="w-full text-start text-xs">
              <thead>
                <tr className="bg-[#17231A] text-[#8FA392] font-bold border-b border-[#243628]">
                  <th className="py-2.5 px-3 text-start w-12">#</th>
                  <th className="py-2.5 px-3 text-start">{t('الحساب المحاسبي (Level 5)', 'Account')}</th>
                  <th className="py-2.5 px-3 text-start w-36">{t('المبلغ (ج.م)', 'Amount')}</th>
                  <th className="py-2.5 px-3 text-start w-48">{t('مركز التكلفة', 'Cost Center')}</th>
                  <th className="py-2.5 px-3 text-start">{t('البيان التفصيلي', 'Line Memo')}</th>
                  <th className="py-2.5 px-3 text-center w-12">✕</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#243628]">
                {lines.map((line, index) => (
                  <tr key={index} className="hover:bg-[#1F2E23]/30">
                    <td className="py-2 px-3 font-bold text-center text-[#8FA392] tabular-nums">
                      {line.sr}
                    </td>

                    <td className="py-2 px-3">
                      <select
                        value={line.level5Id}
                        onChange={e => handleLineChange(index, 'level5Id', e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg text-xs bg-[#17231A] border border-[#243628] text-[#F3EFE6] focus:border-[#EBB34D]"
                      >
                        {leafAccounts.slice(0, 100).map(acc => (
                          <option key={acc.code} value={acc.code}>
                            {acc.code} - {acc.nameAr}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="py-2 px-3">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={isReceipt ? line.credit : line.debit}
                        onChange={e => handleLineChange(index, isReceipt ? 'credit' : 'debit', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1.5 rounded-lg text-xs font-bold bg-[#17231A] border border-[#243628] text-[#F3EFE6] focus:border-[#EBB34D] tabular-nums"
                      />
                    </td>

                    <td className="py-2 px-3">
                      <select
                        value={line.costcenterId}
                        onChange={e => handleLineChange(index, 'costcenterId', e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg text-xs bg-[#17231A] border border-[#243628] text-[#F3EFE6] focus:border-[#EBB34D]"
                      >
                        {costCenters.map(cc => (
                          <option key={cc.Costcenter_ID} value={cc.Costcenter_ID}>
                            {cc.Costcenter_Name_A}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={line.description}
                        onChange={e => handleLineChange(index, 'description', e.target.value)}
                        placeholder="بيان اختياري لهذا السطر..."
                        className="w-full px-2 py-1.5 rounded-lg text-xs bg-[#17231A] border border-[#243628] text-[#F3EFE6] focus:border-[#EBB34D]"
                      />
                    </td>

                    <td className="py-2 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveLine(index)}
                        disabled={lines.length <= 1}
                        className="text-rose-400 hover:text-rose-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
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

        {/* Dynamic Arabic Tafqeet Box */}
        <div className="p-4 rounded-xl border border-[#243628] bg-[#121B14] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#8FA392]">
              {t('إجمالي قيمة السند:', 'Total Voucher Amount:')}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#8FA392] tabular-nums">
                ({formatNumber(totalAmount)})
              </span>
              <span className="text-lg font-black text-[#EBB34D] tabular-nums">
                {formatCurrency(totalAmount)}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-[#243628] flex items-start gap-2">
            <span className="text-xs font-bold text-[#8FA392] shrink-0">
              {t('التفقيط المالي (بالحروف):', 'Tafqeet (Words):')}
            </span>
            <span className="text-xs font-bold text-[#F3EFE6] leading-relaxed">
              {tafqeetText}
            </span>
          </div>
        </div>
      </form>
    </Modal>
  );
};
