import React from 'react';
import { VoucherHeaderItem } from '../../../services/database/types';
import { useLanguage } from '../../../context/LanguageContext';
import { tafqeetArabic } from '../../../utils/tafqeet';
import { Modal, formatCurrency, formatDate, toWesternDigits } from '@erp/ui-system';
import {
  X,
  Printer,
  FileText
} from 'lucide-react';

interface VoucherPrintModalProps {
  voucher: VoucherHeaderItem | null;
  onClose: () => void;
}

export const VoucherPrintModal: React.FC<VoucherPrintModalProps> = ({ voucher, onClose }) => {
  const { t } = useLanguage();

  if (!voucher) return null;

  const handlePrint = () => {
    window.print();
  };

  const isReceipt = voucher.voucherType === 'RECEIPT';
  const tafqeetText = voucher.netText || tafqeetArabic(voucher.amount, 'EGP');

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      maxWidth="max-w-3xl"
      className="print:border-none print:shadow-none print:bg-white print:text-black print:max-w-none print:w-full print:h-auto"
      customHeader={
        <div className="p-4 border-b border-[#243628] bg-[#121B14] flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#2A3F30] text-[#A3CFAC] border border-[#3E5C46] flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-[#F3EFE6]">
              {isReceipt ? t('معاينة وطباعة سند القبض', 'Print Receipt Voucher') : t('معاينة وطباعة سند الصرف', 'Print Payment Voucher')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#D99B26] hover:bg-[#C58F38] text-[#0E1610] shadow-sm cursor-pointer transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>{t('طباعة السند', 'Print')}</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8FA392] hover:text-[#F3EFE6] hover:bg-[#1F2E23] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      }
    >
      {/* Printable Document Canvas */}
      <div className="p-6 sm:p-8 space-y-6 text-[#1A241C] dark:text-[#F3EFE6] font-sans bg-white dark:bg-[#17231A]">
        {/* Header: Company Details & Voucher Title */}
        <div className="flex items-start justify-between border-b-2 border-[#1A241C] dark:border-[#243628] pb-4">
          <div>
            <h2 className="text-base sm:text-lg font-black tracking-tight text-[#1A241C] dark:text-[#F3EFE6]">
              شركة ترابط للمقاولات والتوريدات العمومية
            </h2>
            <p className="text-xs text-[#5C665E] dark:text-[#8FA392]">
              سجل تجاري: 4880199 | بطاقة ضريبية: 226-000-100
            </p>
            <p className="text-xs text-[#5C665E] dark:text-[#8FA392]">
              الإدارة المالية والمحاسبية العامة
            </p>
          </div>

          <div className="text-end">
            <span
              className={`inline-block px-3 py-1 rounded-lg text-sm font-black border ${
                isReceipt
                  ? 'bg-[#2A3F30] text-[#A3CFAC] border-[#3E5C46]'
                  : 'bg-[#3F2A2A] text-[#EFA3A3] border-[#5C3E3E]'
              }`}
            >
              {isReceipt ? 'سند قبض نقدية / بنك' : 'سند صرف نقدية / بنك'}
            </span>
            <span className="block font-inter text-xs font-bold mt-1 text-[#D99B26] dark:text-[#EBB34D] tabular-nums">
              رقم السند: {toWesternDigits(voucher.noteNo)}
            </span>
            <span className="block font-inter text-[11px] text-[#5C665E] dark:text-[#8FA392] tabular-nums">
              التاريخ: {formatDate(voucher.noteDate)}
            </span>
          </div>
        </div>

        {/* Voucher Meta Fields */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-[#F3EFE6] dark:bg-[#121B14] border border-[#E0D9CB] dark:border-[#243628]">
            <span className="text-[#5C665E] dark:text-[#8FA392] block mb-0.5">
              {isReceipt ? 'استلمنا من السيد / السادة:' : 'يُصرف إلى السيد / السادة:'}
            </span>
            <strong className="text-sm font-bold block text-[#1A241C] dark:text-[#F3EFE6]">{voucher.description}</strong>
          </div>

          <div className="p-3 rounded-xl bg-[#F3EFE6] dark:bg-[#121B14] border border-[#E0D9CB] dark:border-[#243628]">
            <span className="text-[#5C665E] dark:text-[#8FA392] block mb-0.5">
              {isReceipt ? 'قيد لحساب (الخزينة / البنك):' : 'خُصماً من حساب (الخزينة / البنك):'}
            </span>
            <strong className="text-sm font-bold block text-[#D99B26] dark:text-[#EBB34D]">
              {voucher.treasuryAccountName} ({toWesternDigits(voucher.treasuryAccountId)})
            </strong>
          </div>
        </div>

        {/* Amount Box & Arabic Tafqeet */}
        <div className="p-4 rounded-xl border border-[#243628] bg-[#121B14] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#8FA392]">
              المبلغ بالأرقام:
            </span>
            <span className="text-xl font-black font-inter text-[#D99B26] dark:text-[#EBB34D] tabular-nums">
              {formatCurrency(voucher.amount)}
            </span>
          </div>

          <div className="pt-2 border-t border-[#243628] flex items-start gap-2">
            <span className="text-xs font-bold text-[#8FA392] shrink-0">
              المبلغ بالحروف:
            </span>
            <span className="text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] leading-relaxed">
              {tafqeetText}
            </span>
          </div>
        </div>

        {/* Cost Center & Notes */}
        <div className="p-3 rounded-xl bg-[#F3EFE6]/60 dark:bg-[#121B14] border border-[#E0D9CB] dark:border-[#243628] text-xs flex items-center justify-between">
          <div>
            <span className="text-[#5C665E] dark:text-[#8FA392]">مركز التكلفة / المشروع: </span>
            <strong className="text-[#1A241C] dark:text-[#F3EFE6] ms-1">{voucher.costcenterName}</strong>
          </div>
          <div>
            <span className="text-[#5C665E] dark:text-[#8FA392]">مدخل السند: </span>
            <strong className="text-[#1A241C] dark:text-[#F3EFE6] ms-1">{voucher.entryName}</strong>
          </div>
        </div>

        {/* Signatures Block */}
        <div className="pt-8 border-t border-[#E0D9CB] dark:border-[#243628] grid grid-cols-4 gap-4 text-center text-xs">
          <div className="space-y-8">
            <span className="font-bold text-[#5C665E] dark:text-[#8FA392]">أمين الصندوق / الخازن</span>
            <div className="border-b border-dashed border-[#5C665E]/40" />
          </div>

          <div className="space-y-8">
            <span className="font-bold text-[#5C665E] dark:text-[#8FA392]">المحاسب المالي</span>
            <div className="border-b border-dashed border-[#5C665E]/40" />
          </div>

          <div className="space-y-8">
            <span className="font-bold text-[#5C665E] dark:text-[#8FA392]">رئيس الحسابات</span>
            <div className="border-b border-dashed border-[#5C665E]/40" />
          </div>

          <div className="space-y-8">
            <span className="font-bold text-[#5C665E] dark:text-[#8FA392]">المستلم / المفوض</span>
            <div className="border-b border-dashed border-[#5C665E]/40" />
          </div>
        </div>
      </div>
    </Modal>
  );
};
