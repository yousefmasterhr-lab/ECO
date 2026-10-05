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
  userName?: string;
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
  userName,
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
      className="bg-slate-100 text-slate-900 print:border-none print:shadow-none print:bg-white print:text-slate-900 print:max-w-none print:w-full print:h-auto"
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
      <div className="report-print-sheet print-container p-8 sm:p-10 space-y-6 text-slate-900 bg-white print:bg-white print:text-slate-900 print:p-0 print:overflow-visible font-sans w-full border border-slate-200 shadow-xl rounded-2xl print:border-none print:shadow-none print:rounded-none">
        {/* Corporate Header */}
        <div className="flex items-center justify-between border-b-2 border-slate-800 print:border-black pb-4">
          <div className="space-y-1">
            <h1 className="text-xl font-black tracking-tight text-slate-900 print:text-black flex items-center gap-2">
              <span className="text-[#D99B26] print:text-black">شركة ترابط للمقاولات والتجارة</span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-300 print:hidden font-bold">ش.م.م</span>
            </h1>
            <p className="text-xs font-bold text-slate-600 print:text-gray-700">
              TARABOT CONTRACTING & TRADING CO.
            </p>
            <p className="text-[10px] text-slate-500 print:text-gray-600">
              سجل تجاري: 48921 | بطاقة ضريبية: 312-894-102 | القاهرة، جمهورية مصر العربية
            </p>
          </div>

          <div className="text-center p-3 rounded-2xl border border-amber-300 bg-amber-50/70 print:border-black print:bg-transparent">
            <div className="text-base font-black text-slate-900 print:text-black">
              {titleAr}
            </div>
            <div className="text-[11px] font-bold text-slate-600 print:text-black">
              {titleEn}
            </div>
            {periodText && (
              <div className="text-[10px] font-mono text-slate-600 mt-1 print:text-black">
                الفترة: {periodText}
              </div>
            )}
          </div>
        </div>

        {/* Subtitle / Filter notes / Metadata 3-Way Realignment */}
        <div className="grid grid-cols-3 items-center text-xs text-slate-600 print:text-gray-700 pb-2 border-b border-slate-200 print:border-gray-400">
          {/* Right Side (text-right): حساب الأستاذ العام */}
          <div className="text-right font-bold text-slate-800 print:text-black text-xs print:text-[11px]">
            {subtitleAr || 'حساب الأستاذ العام'}
            {filterText && <span className="font-mono font-normal mr-2 text-[10px]">({filterText})</span>}
          </div>

          {/* Center (text-center): تاريخ الإصدار: {issueDate} */}
          <div className="text-center font-mono text-[11px] print:text-[10px] text-slate-700 print:text-black font-semibold">
            تاريخ الإصدار: {formatDate(new Date())}
          </div>

          {/* Far Left (text-left): Current user's display name */}
          <div className="text-left font-bold text-slate-800 print:text-black text-xs print:text-[11px]">
            {userName || ''}
          </div>
        </div>

        {/* Report Main Content */}
        <div className="report-content-body space-y-4 print:overflow-visible print:h-auto print:max-h-none">
          {children}
        </div>

        {/* Formal Audit Signatures Block */}
        <div className="pt-3 mt-4 print:pt-2 print:mt-2 border-t border-slate-300 print:border-black page-break-inside-avoid break-inside-avoid">
          <div className="grid grid-cols-3 gap-4 print:gap-3 text-center text-xs print:text-[10px]">
            {/* Box 1: المحاسب */}
            <div className="p-3 print:p-2 rounded-xl border border-slate-300 print:border-black bg-slate-50 print:bg-white flex flex-col justify-between min-h-[90px] print:min-h-[75px]">
              <div>
                <span className="font-black block text-sm print:text-xs text-slate-900 print:text-black">
                  المحاسب
                </span>
              </div>
              <div className="flex items-center justify-between text-xs print:text-[10px] text-slate-700 print:text-black mt-4 print:mt-2 px-2" dir="rtl">
                <span>التوقيع: .....................</span>
                <span>التاريخ: &nbsp;&nbsp;&nbsp;&nbsp; / &nbsp;&nbsp;&nbsp;&nbsp; / &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; م</span>
              </div>
            </div>

            {/* Box 2: المراجع */}
            <div className="p-3 print:p-2 rounded-xl border border-slate-300 print:border-black bg-slate-50 print:bg-white flex flex-col justify-between min-h-[90px] print:min-h-[75px]">
              <div>
                <span className="font-black block text-sm print:text-xs text-slate-900 print:text-black">
                  المراجع
                </span>
              </div>
              <div className="flex items-center justify-between text-xs print:text-[10px] text-slate-700 print:text-black mt-4 print:mt-2 px-2" dir="rtl">
                <span>التوقيع: .....................</span>
                <span>التاريخ: &nbsp;&nbsp;&nbsp;&nbsp; / &nbsp;&nbsp;&nbsp;&nbsp; / &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; م</span>
              </div>
            </div>

            {/* Box 3: يعتمد */}
            <div className="p-3 print:p-2 rounded-xl border border-slate-300 print:border-black bg-slate-50 print:bg-white flex flex-col justify-between min-h-[90px] print:min-h-[75px]">
              <div>
                <span className="font-black block text-sm print:text-xs text-slate-900 print:text-black">
                  يعتمد
                </span>
              </div>
              <div className="flex items-center justify-between text-xs print:text-[10px] text-slate-700 print:text-black mt-4 print:mt-2 px-2" dir="rtl">
                <span>الاعتماد: .....................</span>
                <span>التاريخ: &nbsp;&nbsp;&nbsp;&nbsp; / &nbsp;&nbsp;&nbsp;&nbsp; / &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; م</span>
              </div>
            </div>
          </div>
        </div>

        {/* Printable Fixed Page Number Footer Fallback */}
        <div className="print-page-number hidden print:block pointer-events-none select-none" />
      </div>
    </Modal>
  );
};
