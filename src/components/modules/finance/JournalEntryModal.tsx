import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useFinancial } from '../../../context/FinancialContext';
import { JournalLineItem, JournalPayload } from '../../../services/database/types';
import { tafqeet } from '../../../utils/tafqeet';
import { Modal, formatCurrency, toWesternDigits } from '@erp/ui-system';
import {
  FileSpreadsheet,
  Plus,
  Trash2,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Scale,
  Sparkles
} from 'lucide-react';

interface JournalEntryModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export const JournalEntryModal: React.FC<JournalEntryModalProps> = ({ onClose, onSuccess }) => {
  const { t } = useLanguage();
  const { accounts, costCenters, saveJournal, journals } = useFinancial();

  // Extract flat Level 5 leaf accounts
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

  // Generate next note number
  const nextNoteNo = useMemo(() => {
    if (journals.length === 0) return 1001;
    const maxNo = Math.max(...journals.map(j => j.noteNo || 0));
    return maxNo + 1;
  }, [journals]);

  const [noteNo] = useState(nextNoteNo);
  const [noteDate, setNoteDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [generalMemo, setGeneralMemo] = useState('');
  const [entryType, setEntryType] = useState('قيد يومية عام');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initial balanced 2-line template
  const [lines, setLines] = useState<JournalLineItem[]>([
    {
      sr: 1,
      level5Id: leafAccounts[0]?.code || '1201001',
      level5NameAr: leafAccounts[0]?.nameAr || 'الخزينة الرئيسية',
      debit: 0,
      credit: 0,
      costcenterId: costCenters[0]?.id || costCenters[0]?.Costcenter_ID || '',
      costcenterNameAr: costCenters[0]?.nameAr || costCenters[0]?.Costcenter_Name_A || '',
      description: '',
    },
    {
      sr: 2,
      level5Id: leafAccounts[1]?.code || '1202001',
      level5NameAr: leafAccounts[1]?.nameAr || 'البنك التجاري الدولي CIB',
      debit: 0,
      credit: 0,
      costcenterId: costCenters[0]?.id || costCenters[0]?.Costcenter_ID || '',
      costcenterNameAr: costCenters[0]?.nameAr || costCenters[0]?.Costcenter_Name_A || '',
      description: '',
    },
  ]);

  // Handle line change
  const handleLineChange = (index: number, field: keyof JournalLineItem, value: any) => {
    setLines(prev =>
      prev.map((line, idx) => {
        if (idx !== index) return line;
        const updated = { ...line, [field]: value };

        // If account changed, sync Arabic name
        if (field === 'level5Id') {
          const matched = leafAccounts.find(a => a.code === value);
          if (matched) {
            updated.level5NameAr = matched.nameAr;
          }
        }

        // If cost center changed, sync Arabic name
        if (field === 'costcenterId') {
          const matched = costCenters.find(c => (c.id || c.Costcenter_ID) === value);
          if (matched) {
            updated.costcenterNameAr = matched.nameAr || matched.Costcenter_Name_A;
          }
        }

        // Mutually exclusive debit and credit per line
        if (field === 'debit' && Number(value) > 0) {
          updated.credit = 0;
        } else if (field === 'credit' && Number(value) > 0) {
          updated.debit = 0;
        }

        return updated;
      })
    );
  };

  // Add line item
  const handleAddLine = () => {
    const nextSr = lines.length + 1;
    const defaultAcc = leafAccounts[nextSr % leafAccounts.length] || leafAccounts[0];
    setLines(prev => [
      ...prev,
      {
        sr: nextSr,
        level5Id: defaultAcc?.code || '',
        level5NameAr: defaultAcc?.nameAr || '',
        debit: 0,
        credit: 0,
        costcenterId: costCenters[0]?.id || costCenters[0]?.Costcenter_ID || '',
        costcenterNameAr: costCenters[0]?.nameAr || costCenters[0]?.Costcenter_Name_A || '',
        description: generalMemo,
      },
    ]);
  };

  // Remove line item
  const handleRemoveLine = (index: number) => {
    if (lines.length <= 2) return;
    setLines(prev => prev.filter((_, i) => i !== index).map((l, i) => ({ ...l, sr: i + 1 })));
  };

  // Compute Debit, Credit, and Balance Difference
  const debitTotal = useMemo(() => {
    return lines.reduce((sum, line) => sum + (Number(line.debit) || 0), 0);
  }, [lines]);

  const creditTotal = useMemo(() => {
    return lines.reduce((sum, line) => sum + (Number(line.credit) || 0), 0);
  }, [lines]);

  const difference = useMemo(() => {
    return Math.abs(Math.round((debitTotal - creditTotal) * 100) / 100);
  }, [debitTotal, creditTotal]);

  const isBalanced = useMemo(() => {
    return debitTotal > 0 && creditTotal > 0 && difference === 0;
  }, [debitTotal, creditTotal, difference]);

  // Auto-balance shortcut: balances current line to match opposite side
  const handleAutoBalance = () => {
    if (debitTotal === creditTotal) return;
    const diff = debitTotal - creditTotal;
    setLines(prev => {
      const lastIdx = prev.length - 1;
      const next = [...prev];
      if (diff > 0) {
        // Need more credit
        next[lastIdx] = {
          ...next[lastIdx],
          credit: Math.round(((next[lastIdx].credit || 0) + diff) * 100) / 100,
          debit: 0,
        };
      } else {
        // Need more debit
        next[lastIdx] = {
          ...next[lastIdx],
          debit: Math.round(((next[lastIdx].debit || 0) + Math.abs(diff)) * 100) / 100,
          credit: 0,
        };
      }
      return next;
    });
  };

  const tafqeetText = useMemo(() => {
    return isBalanced ? tafqeet(debitTotal) : '';
  }, [isBalanced, debitTotal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!isBalanced) {
      setErrorMessage(
        t(
          'لا يمكن ترحيل القيد! يجب أن تتساوى قيمة المدين مع الدائن بدقة متناهية (الفرق = 0).',
          'Voucher is unbalanced. Total Debit must strictly equal Total Credit.'
        )
      );
      return;
    }

    if (!generalMemo.trim()) {
      setErrorMessage(t('يرجى إدخال البيان العام للقيد.', 'Please provide a general memo.'));
      return;
    }

    // Verify each line has account and valid amount
    for (const line of lines) {
      if (!line.level5Id) {
        setErrorMessage(t(`السطر رقم ${line.sr} ينقصه تحديد الحساب المحاسبي.`, `Line ${line.sr} missing account.`));
        return;
      }
      if (line.debit <= 0 && line.credit <= 0) {
        setErrorMessage(
          t(`السطر رقم ${line.sr} يجب أن يحتوي على قيمة مدين أو دائن أكبر من الصفر.`, `Line ${line.sr} must have an amount.`)
        );
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const payload: JournalPayload = {
        noteNo,
        noteDate,
        description: `${entryType}: ${generalMemo.trim()}`,
        debitTotal: Math.round(debitTotal * 100) / 100,
        creditTotal: Math.round(creditTotal * 100) / 100,
        netText: tafqeetText,
        lines: lines.map(l => ({
          ...l,
          description: l.description.trim() || generalMemo.trim(),
        })),
      };

      const result = await saveJournal(payload);
      if (result.success) {
        onSuccess?.();
        onClose();
      } else {
        setErrorMessage(result.error || t('فشل في حفظ وترحيل القيد.', 'Failed to post entry.'));
      }
    } catch (err: any) {
      setErrorMessage(err.message || t('حدث خطأ أثناء حفظ القيد.', 'An unexpected error occurred.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      maxWidth="max-w-5xl"
      title={t('إنشاء قيد يومية عام متزن', 'New General Ledger Journal Entry')}
      subtitle={t(
        'ترحيل مباشر إلى الأستاذ العام مع التحقق الصارم من توازن المدين والدائن (Σ Debit = Σ Credit)',
        'Double-entry balanced posting with strict equality validation'
      )}
      icon={Scale}
      badge={
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-[#3D2D14] text-[#EBB34D] border border-[#5C431D]">
            #{toWesternDigits(noteNo)}
          </span>
          <span
            className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
              isBalanced
                ? 'bg-[#2A3F30] text-[#A3CFAC] border border-[#3E5C46]'
                : 'bg-[#3F2A2A] text-[#EFA3A3] border border-[#5C3E3E]'
            }`}
          >
            {isBalanced ? t('القيد متزن تماماً', 'Balanced') : t('القيد غير متزن', 'Unbalanced')}
          </span>
        </div>
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
            disabled={!isBalanced || isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl bg-[#D99B26] hover:bg-[#C58F38] text-[#0E1610] shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Scale className="w-4 h-4" />
            {isSubmitting ? (
              <span>{t('جاري الترحيل...', 'Posting...')}</span>
            ) : (
              <span>{t('ترحيل وحفظ القيد في الأستاذ العام', 'Post to General Ledger')}</span>
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

        {/* Form Header Parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl border border-[#243628] bg-[#121B14]">
          <div>
            <label className="block text-xs font-bold text-[#F3EFE6] mb-1.5">
              {t('نوع القيد المحاسبي', 'Voucher Type')}
            </label>
            <select
              value={entryType}
              onChange={e => setEntryType(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-[#243628] bg-[#17231A] text-[#F3EFE6] focus:outline-hidden focus:border-[#EBB34D]"
            >
              <option value="قيد يومية عام">قيد يومية عام (General Journal)</option>
              <option value="قيد تسوية وإقفال">قيد تسوية وإقفال (Adjustment)</option>
              <option value="قيد إثبات استحقاق">قيد إثبات استحقاق (Accrual)</option>
              <option value="قيد افتتاح دورة مالية">قيد افتتاح دورة مالية (Opening)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#F3EFE6] mb-1.5">
              {t('تاريخ القيد الدفتري', 'Journal Date')} *
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-[#8FA392]" />
              <input
                type="date"
                required
                value={noteDate}
                onChange={e => setNoteDate(e.target.value)}
                className="w-full ps-9 pe-3 py-2 text-xs font-mono rounded-xl border border-[#243628] bg-[#17231A] text-[#F3EFE6] focus:outline-hidden focus:border-[#EBB34D] tabular-nums"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#F3EFE6] mb-1.5">
              {t('البيان العام / شرح القيد', 'General Memo')} *
            </label>
            <input
              type="text"
              required
              placeholder={t('مثال: إثبات استحقاق مصاريف إدارية أو إيرادات مشاريع...', 'e.g. Accrual of expenses...')}
              value={generalMemo}
              onChange={e => setGeneralMemo(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#243628] bg-[#17231A] text-[#F3EFE6] focus:outline-hidden focus:border-[#EBB34D]"
            />
          </div>
        </div>

        {/* Multi-Line Journal Grid */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-[#EBB34D]" />
              <h3 className="text-xs font-bold text-[#F3EFE6]">
                {t('جدول الأطراف المحاسبية المتزنة (Debit & Credit Lines)', 'Journal Lines')}
              </h3>
            </div>

            <button
              type="button"
              onClick={handleAddLine}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-[#1F2E23] hover:bg-[#3D2D14] text-[#EBB34D] border border-[#243628] transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('إضافة طرف / سطر محاسبي', 'Add Line')}</span>
            </button>
          </div>

          <div className="rounded-xl border border-[#243628] bg-[#121B14] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs">
                <thead>
                  <tr className="border-b border-[#243628] bg-[#17231A] text-[#8FA392]">
                    <th className="py-2.5 px-3 text-start w-10">#</th>
                    <th className="py-2.5 px-3 text-start min-w-[220px]">
                      {t('الحساب المحاسبي (المستوى 5)', 'Level 5 Account')} *
                    </th>
                    <th className="py-2.5 px-3 text-end w-32">{t('مدين (Debit)', 'Debit')}</th>
                    <th className="py-2.5 px-3 text-end w-32">{t('دائن (Credit)', 'Credit')}</th>
                    <th className="py-2.5 px-3 text-start min-w-[170px]">{t('مركز التكلفة', 'Cost Center')}</th>
                    <th className="py-2.5 px-3 text-start min-w-[180px]">{t('البيان السطري', 'Line Memo')}</th>
                    <th className="py-2.5 px-2 text-center w-20">{t('إجراء', 'Action')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#243628]">
                  {lines.map((line, index) => (
                    <tr
                      key={line.sr}
                      className="hover:bg-[#1F2E23]/30 transition-colors"
                    >
                      <td className="py-2.5 px-3 font-bold text-[#8FA392] tabular-nums">
                        {line.sr}
                      </td>

                      {/* Account Selector */}
                      <td className="py-2 px-2">
                        <select
                          value={line.level5Id}
                          onChange={e => handleLineChange(index, 'level5Id', e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-[#243628] bg-[#17231A] text-[#F3EFE6] focus:outline-hidden focus:border-[#EBB34D]"
                        >
                          {leafAccounts.map(acc => (
                            <option key={acc.code} value={acc.code}>
                              {acc.code} - {acc.nameAr}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Debit */}
                      <td className="py-2 px-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={line.debit || ''}
                          onChange={e =>
                            handleLineChange(index, 'debit', parseFloat(e.target.value) || 0)
                          }
                          placeholder="0.00"
                          className="w-full px-2.5 py-1.5 text-xs text-end font-bold rounded-lg border border-[#243628] bg-[#17231A] text-[#A3CFAC] focus:outline-hidden focus:border-[#A3CFAC] tabular-nums"
                        />
                      </td>

                      {/* Credit */}
                      <td className="py-2 px-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={line.credit || ''}
                          onChange={e =>
                            handleLineChange(index, 'credit', parseFloat(e.target.value) || 0)
                          }
                          placeholder="0.00"
                          className="w-full px-2.5 py-1.5 text-xs text-end font-bold rounded-lg border border-[#243628] bg-[#17231A] text-[#EBB34D] focus:outline-hidden focus:border-[#EBB34D] tabular-nums"
                        />
                      </td>

                      {/* Cost Center */}
                      <td className="py-2 px-2">
                        <select
                          value={line.costcenterId}
                          onChange={e => handleLineChange(index, 'costcenterId', e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#243628] bg-[#17231A] text-[#F3EFE6] focus:outline-hidden focus:border-[#EBB34D]"
                        >
                          {costCenters.map(cc => (
                            <option key={cc.id || cc.Costcenter_ID} value={cc.id || cc.Costcenter_ID}>
                              {cc.nameAr || cc.Costcenter_Name_A}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Line Memo */}
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={line.description}
                          placeholder={generalMemo || t('بيان تفصيلي لهذا السطر...', 'Line memo...')}
                          onChange={e => handleLineChange(index, 'description', e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#243628] bg-[#17231A] text-[#F3EFE6] focus:outline-hidden focus:border-[#EBB34D]"
                        />
                      </td>

                      {/* Action */}
                      <td className="py-2 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveLine(index)}
                          disabled={lines.length <= 2}
                          className="p-1 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-[#3F2A2A] transition-colors disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
                          title={t('حذف السطر', 'Delete line')}
                        >
                          <Trash2 className="w-4 h-4 mx-auto" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Real-Time Balance Verification Strip */}
        <div className="p-4 rounded-xl border border-[#243628] bg-[#121B14] flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Status Indicator */}
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                isBalanced
                  ? 'bg-[#2A3F30] text-[#A3CFAC] border border-[#3E5C46]'
                  : 'bg-[#3F2A2A] text-[#EFA3A3] border border-[#5C3E3E]'
              }`}
            >
              {isBalanced ? <CheckCircle2 className="w-5 h-5" /> : <Scale className="w-5 h-5" />}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-black ${
                    isBalanced ? 'text-[#A3CFAC]' : 'text-[#EFA3A3]'
                  }`}
                >
                  {isBalanced
                    ? t('القيد متزن محاسبياً وجاهز للترحيل', 'Voucher is perfectly balanced')
                    : t('القيد غير متزن - يوجد فارق بين المدين والدائن', 'Voucher is unbalanced')}
                </span>

                {!isBalanced && difference > 0 && (
                  <button
                    type="button"
                    onClick={handleAutoBalance}
                    className="flex items-center gap-1 text-[11px] font-bold text-[#EBB34D] hover:underline cursor-pointer bg-[#3D2D14] px-2 py-0.5 rounded-md border border-[#5C431D]"
                    title={t('موازنة القيد آلياً في السطر الأخير', 'Auto-balance on last line')}
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>{t('موازنة آلية', 'Auto-balance')}</span>
                  </button>
                )}
              </div>

              {isBalanced ? (
                <p className="text-[11px] text-[#8FA392]">
                  {tafqeetText}
                </p>
              ) : (
                <p className="text-[11px] text-[#EFA3A3] font-mono">
                  {t('قيمة الفارق غير المتزن:', 'Difference:')}{' '}
                  <strong>{formatCurrency(difference)}</strong>
                </p>
              )}
            </div>
          </div>

          {/* Sum Balances Box */}
          <div className="flex items-center gap-4 text-xs font-mono self-end sm:self-auto tabular-nums">
            <div className="text-end">
              <span className="text-[10px] text-[#8FA392] block">
                {t('إجمالي المدين', 'Total Debit')}
              </span>
              <span className="font-bold text-[#A3CFAC] text-sm">
                {formatCurrency(debitTotal)}
              </span>
            </div>
            <div className="h-8 w-px bg-[#243628]" />
            <div className="text-end">
              <span className="text-[10px] text-[#8FA392] block">
                {t('إجمالي الدائن', 'Total Credit')}
              </span>
              <span className="font-bold text-[#EBB34D] text-sm">
                {formatCurrency(creditTotal)}
              </span>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
};
