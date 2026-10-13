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
  printedByName?: string;
  singlePage?: boolean;
  currentPage?: number | string;
  totalPages?: number | string;
  defaultOrientation?: 'landscape' | 'portrait';
  orientation?: 'landscape' | 'portrait';
  onOrientationChange?: (orientation: 'landscape' | 'portrait') => void;
  badgeText?: string;
  hideFooter?: boolean;
  programmaticPagination?: boolean;
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
  printedByName: propPrintedByName,
  singlePage = false,
  currentPage,
  totalPages,
  defaultOrientation,
  orientation: orientationProp,
  onOrientationChange,
  badgeText,
  hideFooter = false,
  programmaticPagination = false,
  children,
}) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [internalOrientation, setInternalOrientation] = React.useState<'landscape' | 'portrait'>(
    defaultOrientation || (singlePage ? 'portrait' : 'landscape')
  );

  const currentOrientation = orientationProp || internalOrientation;

  React.useEffect(() => {
    if (defaultOrientation) {
      setInternalOrientation(defaultOrientation);
    }
  }, [defaultOrientation]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleOrientationChange = (newOrientation: 'landscape' | 'portrait') => {
    setInternalOrientation(newOrientation);
    if (onOrientationChange) {
      onOrientationChange(newOrientation);
    }
  };

  const printedByName = propPrintedByName || userName || (user as any)?.displayName || user?.nameAr || user?.nameEn || (user as any)?.name || 'يوسف حجازي';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth={currentOrientation === 'landscape' ? 'max-w-[96vw]' : 'max-w-6xl'}
      overlayClassName="bg-[#07130E]/95 backdrop-blur-md"
      className="bg-[#091812] border border-[#1A3327] text-slate-900 print:border-none print:shadow-none print:bg-white print:text-slate-900 print:max-w-none print:w-full print:h-auto"
      contentClassName="bg-[#091812] print:bg-white print:p-0"
      customHeader={
        <div className="flex items-center justify-between p-4 border-b border-[#1A3327] bg-[#0D1F17] print:hidden shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#1A3327] text-[#A3CFAC] border border-[#244737] flex items-center justify-center">
              <Printer className="w-4 h-4" />
            </div>
            <span className="text-xs font-black text-[#F3EFE6]">
              {t('معاينة طباعة التقرير المالي المعتمد', 'Official Financial Report Print Preview')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Landscape / Portrait Orientation Toggle */}
            <div className="flex items-center gap-1 bg-[#091812] p-1 rounded-lg border border-[#1A3327] text-xs text-white">
              <button
                type="button"
                onClick={() => handleOrientationChange('landscape')}
                className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                  currentOrientation === 'landscape'
                    ? 'bg-amber-500 font-bold text-slate-950'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                أفقي (Landscape)
              </button>
              <button
                type="button"
                onClick={() => handleOrientationChange('portrait')}
                className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                  currentOrientation === 'portrait'
                    ? 'bg-amber-500 font-bold text-slate-950'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                رأسي (Portrait)
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D99B26] hover:bg-[#C58F38] text-[#0E1610] text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{t('طباعة المستند (Print)', 'Print Report')}</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-[#8FA392] hover:text-[#F3EFE6] hover:bg-[#1A3327] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      }
    >
      {/* Dynamic Print Page Settings */}
      {programmaticPagination ? (
        <style>{`
          @page {
            size: A4 ${currentOrientation};
            margin: 5mm 6mm;
          }
          @media print {
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body {
              background: #ffffff !important;
              color: #0f172a !important;
            }
            html, body, #root, #erp-modal-container, .modal-container, .print-wrapper, [role="dialog"], [role="dialog"] > div {
              overflow: visible !important;
              height: auto !important;
              max-height: none !important;
              position: static !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            .print-document {
              width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
              display: block !important;
            }
            .print-sheet {
              page-break-after: always !important;
              break-after: page !important;
              height: ${currentOrientation === 'landscape' ? '200mm' : '287mm'} !important;
              max-height: ${currentOrientation === 'landscape' ? '200mm' : '287mm'} !important;
              width: 100% !important;
              box-sizing: border-box !important;
              margin: 0 !important;
              padding: 0 !important;
              overflow: hidden !important;
            }
            .print-sheet:last-child {
              page-break-after: auto !important;
              break-after: auto !important;
            }
            table {
              border-collapse: separate !important;
              border-spacing: 0 !important;
            }
          }
        `}</style>
      ) : singlePage ? (
        <style>{`
          @page {
            size: A4 ${currentOrientation};
            margin: 5mm 6mm;
          }
          @media print {
            html, body {
              height: ${currentOrientation === 'landscape' ? '210mm' : '297mm'};
              max-height: ${currentOrientation === 'landscape' ? '210mm' : '297mm'};
              overflow: hidden !important;
            }
            .report-print-sheet {
              height: ${currentOrientation === 'landscape' ? '200mm' : '285mm'} !important;
              max-height: ${currentOrientation === 'landscape' ? '200mm' : '285mm'} !important;
              overflow: hidden !important;
            }
            table {
              border-collapse: separate !important;
              border-spacing: 0 !important;
            }
            tfoot {
              display: table-row-group !important;
            }
          }
        `}</style>
      ) : (
        <style>{`
          @page {
            size: A4 ${currentOrientation};
            margin: 5mm 6mm;
          }
          @media print {
            /* Reset all overflow and fixed height constraints */
            html, body, #root, #erp-modal-container, .modal-container, .print-wrapper, .report-print-sheet, [role="dialog"], [role="dialog"] > div {
              overflow: visible !important;
              height: auto !important;
              max-height: none !important;
              position: static !important;
            }

            /* Enable natural table pagination with separated spacing for curved borders */
            table {
              page-break-inside: auto;
              border-collapse: separate !important;
              border-spacing: 0 !important;
            }

            tr {
              page-break-inside: avoid;
              page-break-after: auto;
            }

            /* Repeat headers across all printed sheets */
            thead {
              display: table-header-group !important;
            }

            /* Enforce Grand Total / tfoot to render ONLY ONCE at the end of the table */
            tfoot {
              display: table-row-group !important;
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

      {/* Programmatic Chunking Container or Standard Sheet */}
      {programmaticPagination ? (
        <div className="print-document print-wrapper w-full p-4 sm:p-6 bg-[#091812] print:bg-white print:p-0">
          {children}
        </div>
      ) : (
        /* Printable Document Sheet */
        <div className="w-full p-4 sm:p-6 bg-[#091812] flex justify-center print:bg-white print:p-0">
          <div className={`report-print-sheet print-wrapper print-container print-ledger-container p-6 sm:p-8 space-y-3 text-slate-900 bg-white print:bg-white print:text-slate-900 print:p-0 font-sans w-full max-w-[1240px] border border-slate-200 shadow-xl rounded-2xl print:border-none print:shadow-none print:rounded-none flex flex-col ${
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
              <div className={`border border-slate-300 print:border-slate-400 rounded-xl p-2.5 print:p-2 text-center bg-slate-50/50 print:bg-white flex flex-col justify-between ${
                singlePage ? 'min-h-[85px] print:min-h-[75px]' : 'min-h-[110px] print:min-h-[100px]'
              }`}>
                <span className="font-bold text-xs text-slate-800 print:text-black block">المحاسب</span>
                
                {/* Generous blank signing zone */}
                <div className={`flex-1 ${singlePage ? 'min-h-[30px] print:min-h-[25px]' : 'min-h-[45px] print:min-h-[40px]'}`}></div>

                <span className="text-[10px] text-slate-600 print:text-black block" dir="rtl">
                  التاريخ: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; / &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; / &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                </span>
              </div>

              {/* 2. Internal Auditor */}
              <div className={`border border-slate-300 print:border-slate-400 rounded-xl p-2.5 print:p-2 text-center bg-slate-50/50 print:bg-white flex flex-col justify-between ${
                singlePage ? 'min-h-[85px] print:min-h-[75px]' : 'min-h-[110px] print:min-h-[100px]'
              }`}>
                <span className="font-bold text-xs text-slate-800 print:text-black block">المراجع</span>
                
                {/* Generous blank signing zone */}
                <div className={`flex-1 ${singlePage ? 'min-h-[30px] print:min-h-[25px]' : 'min-h-[45px] print:min-h-[40px]'}`}></div>

                <span className="text-[10px] text-slate-600 print:text-black block" dir="rtl">
                  التاريخ: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; / &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; / &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                </span>
              </div>

              {/* 3. Executive Approval & Stamp */}
              <div className={`border border-slate-300 print:border-slate-400 rounded-xl p-2.5 print:p-2 text-center bg-slate-50/50 print:bg-white flex flex-col justify-between ${
                singlePage ? 'min-h-[85px] print:min-h-[75px]' : 'min-h-[110px] print:min-h-[100px]'
              }`}>
                <span className="font-bold text-xs text-slate-800 print:text-black block">يعتمد</span>
                
                {/* Generous blank signing zone */}
                <div className={`flex-1 ${singlePage ? 'min-h-[30px] print:min-h-[25px]' : 'min-h-[45px] print:min-h-[40px]'}`}></div>

                <span className="text-[10px] text-slate-600 print:text-black block" dir="rtl">
                  التاريخ: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; / &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; / &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                </span>
              </div>
            </div>

            {/* Pagination & Audit Metadata Footer */}
            {!hideFooter && !programmaticPagination && (
              <div className="flex justify-between items-center text-[10px] text-slate-600 pt-1.5 px-3 print:pt-1 border-t border-slate-200 print:border-slate-300 shrink-0 print:break-inside-avoid">
                <span>طُبع بواسطة: <strong className="text-slate-800 print:text-black">{printedByName}</strong></span>
                <span className="font-mono font-bold bg-slate-100 print:bg-slate-200 px-3 py-0.5 rounded-full border border-slate-300 text-slate-700 print:text-black print:border-slate-400">
                  {badgeText || (singlePage ? 'صفحة 1 من 1' : `صفحة ${currentPage || 1} من ${totalPages || 1}`)}
                </span>
                <span>تاريخ الطباعة: {new Date().toLocaleDateString('ar-EG')}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};
