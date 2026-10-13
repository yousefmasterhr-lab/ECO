import React from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useAuth } from '../../../context/AuthContext';
import { Modal } from '@erp/ui-system';
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
  singlePage?: boolean;
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
  singlePage = false,
  children,
}) => {
  const { t } = useLanguage();
  const { user } = useAuth();

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const printedByName = userName || user?.nameAr || user?.nameEn || (user as any)?.name || 'يوسف أيمن';

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
      {/* Dynamic Print Page Settings */}
      {singlePage ? (
        <style>{`
          @page {
            size: A4 portrait;
            margin: 6mm 8mm;
          }
          @media print {
            html, body {
              height: 297mm;
              max-height: 297mm;
              overflow: hidden !important;
            }
            .report-print-sheet {
              height: 285mm !important;
              max-height: 285mm !important;
              overflow: hidden !important;
            }
          }
        `}</style>
      ) : (
        <style>{`
          @page {
            size: A4 portrait;
            margin: 8mm 8mm;
          }
          @media print {
            /* Reset all overflow and fixed height constraints */
            html, body, #root, #erp-modal-container, .modal-container, .print-wrapper, .report-print-sheet, [role="dialog"], [role="dialog"] > div {
              overflow: visible !important;
              height: auto !important;
              max-height: none !important;
              position: static !important;
            }

            /* Enable natural table pagination */
            table {
              page-break-inside: auto;
              border-collapse: separate;
            }

            tr {
              page-break-inside: avoid;
              page-break-after: auto;
            }

            /* Repeat headers across all printed sheets */
            thead {
              display: table-header-group !important;
            }

            /* Keep signature cards on the final page without tearing */
            .signatures-block {
              page-break-inside: avoid;
              break-inside: avoid;
              margin-top: 16px;
            }
          }
        `}</style>
      )}

      {/* Printable Document Sheet */}
      <div className={`report-print-sheet print-wrapper print-container print-ledger-container p-6 sm:p-8 space-y-3 text-slate-900 bg-white print:bg-white print:text-slate-900 print:p-0 font-sans w-full border border-slate-200 shadow-xl rounded-2xl print:border-none print:shadow-none print:rounded-none flex flex-col ${
        singlePage
          ? 'print:h-[285mm] print:max-h-[285mm] print:overflow-hidden print:space-y-1.5 justify-between'
          : 'print:h-auto print:max-h-none print:overflow-visible print:space-y-3'
      }`}>
        {/* Corporate Header */}
        <div className="flex items-center justify-between border-b-2 border-slate-800 print:border-slate-800 pb-3 print:pb-1 shrink-0">
          <div className="space-y-0.5">
            <h1 className="text-xl print:text-lg font-black tracking-tight text-slate-900 print:text-black flex items-center gap-2">
              <span className="text-[#D99B26] print:text-black">شركة ترابط للمقاولات والتجارة</span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-300 print:hidden font-bold">ش.م.م</span>
            </h1>
            <p className="text-xs print:text-[10px] font-bold text-slate-600 print:text-gray-700">
              TARABOT CONTRACTING & TRADING CO.
            </p>
            <p className="text-[10px] print:text-[9px] text-slate-500 print:text-gray-600">
              سجل تجاري: 48921 | بطاقة ضريبية: 312-894-102 | القاهرة، جمهورية مصر العربية
            </p>
          </div>

          <div className="text-center p-2.5 print:p-1.5 rounded-2xl border border-slate-300 bg-slate-50/80 print:border-slate-800 print:bg-transparent min-w-[220px]">
            <div className="text-sm print:text-xs font-black text-slate-900 print:text-black">
              {titleAr}
            </div>
            <div className="text-[10px] print:text-[9px] font-bold text-slate-600 print:text-black">
              {titleEn}
            </div>
            <div className="text-[9px] print:text-[8px] text-slate-500 print:text-gray-600 mt-0.5">
              معايير المحاسبة المصرية (EAS) والدولية (IFRS)
            </div>
            {periodText && (
              <div className="text-[9px] print:text-[8px] font-mono text-slate-600 mt-0.5 print:text-black">
                {periodText}
              </div>
            )}
            <div className="text-[9px] print:text-[8px] font-mono text-slate-500 mt-0.5">
              تاريخ الإصدار: 2026-10-13
            </div>
          </div>
        </div>

        {/* Subtitle / Filter notes / Metadata 3-Way Realignment */}
        <div className="grid grid-cols-3 items-center text-xs print:text-[10px] text-slate-600 print:text-gray-700 pb-1.5 print:pb-1 border-b border-slate-200 print:border-slate-300 shrink-0">
          {/* Right Side (text-right): حساب الأستاذ العام */}
          <div className="text-right font-bold text-slate-800 print:text-black text-xs print:text-[10px]">
            {subtitleAr || 'حساب الأستاذ العام'}
            {filterText && <span className="font-mono font-normal mr-2 text-[10px] print:text-[9px]">({filterText})</span>}
          </div>

          {/* Center (text-center): تاريخ الإصدار: 2026-10-13 */}
          <div className="text-center font-mono text-[11px] print:text-[9px] text-slate-700 print:text-black font-semibold">
            تاريخ الإصدار: 2026-10-13
          </div>

          {/* Far Left (text-left): Current user's display name */}
          <div className="text-left font-bold text-slate-800 print:text-black text-xs print:text-[10px]">
            {printedByName}
          </div>
        </div>

        {/* Report Main Content */}
        <div className="report-content-body flex-1 space-y-3 print:space-y-1.5 overflow-visible">
          {children}
        </div>

        {/* Standardized Signature Footer */}
        <div className="signatures-block grid grid-cols-3 gap-3 pt-2 mt-auto print:pt-1 print:mt-auto print:break-inside-avoid shrink-0">
          {/* 1. Accountant */}
          <div className="border border-slate-300 print:border-slate-400 rounded-xl p-2.5 print:p-2 text-center bg-slate-50/50 print:bg-white flex flex-col justify-between">
            <span className="font-bold text-xs print:text-[11px] text-slate-800 print:text-black block">المحاسب</span>
            <span className="text-[10px] print:text-[9px] text-slate-600 print:text-black block mt-4 print:mt-3" dir="rtl">
              التاريخ: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; / &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; / &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </span>
          </div>

          {/* 2. Internal Auditor */}
          <div className="border border-slate-300 print:border-slate-400 rounded-xl p-2.5 print:p-2 text-center bg-slate-50/50 print:bg-white flex flex-col justify-between">
            <span className="font-bold text-xs print:text-[11px] text-slate-800 print:text-black block">المراجع</span>
            <span className="text-[10px] print:text-[9px] text-slate-600 print:text-black block mt-4 print:mt-3" dir="rtl">
              التاريخ: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; / &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; / &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </span>
          </div>

          {/* 3. Executive Approval & Stamp */}
          <div className="border border-slate-300 print:border-slate-400 rounded-xl p-2.5 print:p-2 text-center bg-slate-50/50 print:bg-white flex flex-col justify-between">
            <span className="font-bold text-xs print:text-[11px] text-slate-800 print:text-black block">يعتمد</span>
            <span className="text-[10px] print:text-[9px] text-slate-600 print:text-black block mt-4 print:mt-3" dir="rtl">
              التاريخ: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; / &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; / &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </span>
          </div>
        </div>

        {/* Printed By Attribution */}
        <div className="flex justify-between items-center text-[9px] print:text-[8px] text-slate-500 pt-1 mt-1 border-t border-slate-200 print:border-slate-300 shrink-0 print:break-inside-avoid">
          <span>طُبع بواسطة: <strong className="text-slate-800 print:text-black">{printedByName}</strong></span>
          <span>تاريخ ووقت الطباعة: {new Date().toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' })}</span>
          <span>{singlePage ? 'صفحة 1 من 1' : 'تقرير مالي معتمد'}</span>
        </div>

        {/* Printable Fixed Page Number Footer Fallback */}
        <div className="print-page-number hidden print:block pointer-events-none select-none" />
      </div>
    </Modal>
  );
};
