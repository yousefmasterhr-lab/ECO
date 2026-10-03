import React from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { Modal, formatDate } from '@erp/ui-system';
import { X, Printer } from 'lucide-react';

interface ReportPrintLayoutProps {
  isOpen: boolean;
  onClose: () => void;
  titleAr: string;
  titleEn: string;
  subtitleAr?: string;
  periodText?: string;
  filterText?: string;
  children: React.ReactNode;
}

export const ReportPrintLayout: React.FC<ReportPrintLayoutProps> = ({
  isOpen,
  onClose,
  titleAr,
  titleEn,
  subtitleAr,
  periodText,
  filterText,
  children,
}) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-6xl"
      className="print:border-none print:shadow-none print:bg-white print:text-black print:max-w-none print:w-full print:h-auto"
      customHeader={
        <div className="flex items-center justify-between p-4 border-b border-[#243628] bg-[#121B14] print:hidden shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#2A3F30] text-[#A3CFAC] border border-[#3E5C46] flex items-center justify-center">
              <Printer className="w-4 h-4" />
            </div>
            <span className="text-xs font-black text-[#F3EFE6]">
              {t('معاينة طباعة التقرير المالي المعتمد', 'Official Financial Report Print Preview')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D99B26] hover:bg-[#C58F38] text-[#0E1610] text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{t('طباعة المستند (Print)', 'Print Report')}</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-[#8FA392] hover:text-[#F3EFE6] hover:bg-[#1F2E23] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      }
    >
      {/* Printable Document Sheet */}
      <div className="p-8 sm:p-10 space-y-6 text-[#1A241C] dark:text-[#F3EFE6] print:text-black print:p-4 print:overflow-visible font-sans bg-white dark:bg-[#17231A]">
        {/* Corporate Header */}
        <div className="flex items-center justify-between border-b-2 border-[#1A241C] dark:border-[#243628] print:border-black pb-4">
          <div className="space-y-1">
            <h1 className="text-xl font-black tracking-tight text-[#1A241C] dark:text-[#F3EFE6] print:text-black flex items-center gap-2">
              <span className="text-[#D99B26] dark:text-[#EBB34D] print:text-black">شركة ترابط للمقاولات والتجارة</span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-[#243628] text-[#A3CFAC] print:hidden">ش.م.م</span>
            </h1>
            <p className="text-xs font-bold text-[#5C665E] dark:text-[#8FA392] print:text-gray-700">
              TARABOT CONTRACTING & TRADING CO.
            </p>
            <p className="text-[10px] text-[#5C665E] dark:text-[#8FA392] print:text-gray-600">
              سجل تجاري: 48921 | بطاقة ضريبية: 312-894-102 | القاهرة، جمهورية مصر العربية
            </p>
          </div>

          <div className="text-center p-3 rounded-2xl border border-[#D99B26]/40 bg-[#3D2D14]/20 print:border-black print:bg-transparent">
            <div className="text-base font-black text-[#D99B26] dark:text-[#EBB34D] print:text-black">
              {titleAr}
            </div>
            <div className="text-[11px] font-bold text-[#5C665E] dark:text-[#8FA392] print:text-black">
              {titleEn}
            </div>
            {periodText && (
              <div className="text-[10px] font-mono text-[#5C665E] dark:text-[#8FA392] mt-1">
                الفترة: {periodText}
              </div>
            )}
          </div>
        </div>

        {/* Subtitle / Filter notes */}
        {(subtitleAr || filterText) && (
          <div className="flex items-center justify-between text-xs text-[#5C665E] dark:text-[#8FA392] print:text-gray-700 pb-2 border-b border-gray-200 dark:border-[#243628] print:border-gray-400">
            {subtitleAr && <span>{subtitleAr}</span>}
            {filterText && <span className="font-mono">{filterText}</span>}
            <span className="font-mono text-[10px]">
              تاريخ الإصدار: {formatDate(new Date())}
            </span>
          </div>
        )}

        {/* Report Main Content */}
        <div className="report-content-body space-y-4">
          {children}
        </div>

        {/* Formal Audit Signatures Block */}
        <div className="pt-8 border-t-2 border-gray-300 dark:border-[#243628] print:border-black page-break-inside-avoid">
          <div className="grid grid-cols-3 gap-6 text-center text-xs">
            <div className="space-y-8 p-3 rounded-xl border border-gray-200 dark:border-[#243628] print:border-black">
              <span className="font-bold block text-[#1A241C] dark:text-[#F3EFE6] print:text-black">المحاسب المالي</span>
              <span className="text-gray-400 dark:text-[#8FA392] print:text-gray-500 block text-[11px]">التوقيع: ............................</span>
            </div>
            <div className="space-y-8 p-3 rounded-xl border border-gray-200 dark:border-[#243628] print:border-black">
              <span className="font-bold block text-[#1A241C] dark:text-[#F3EFE6] print:text-black">رئيس الحسابات</span>
              <span className="text-gray-400 dark:text-[#8FA392] print:text-gray-500 block text-[11px]">التوقيع: ............................</span>
            </div>
            <div className="space-y-8 p-3 rounded-xl border border-gray-200 dark:border-[#243628] print:border-black">
              <span className="font-bold block text-[#1A241C] dark:text-[#F3EFE6] print:text-black">المدير المالي (CFO)</span>
              <span className="text-gray-400 dark:text-[#8FA392] print:text-gray-500 block text-[11px]">الاعتماد والختم: ............................</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
