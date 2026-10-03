import React from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { ExtractRecord } from '../../../services/database/types';
import { tafqeetArabic } from '../../../utils/tafqeet';
import { Modal, formatCurrency, formatNumber, formatDate, toWesternDigits } from '@erp/ui-system';
import { X, Printer } from 'lucide-react';

interface ExtractPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  extract: ExtractRecord | null;
}

export const ExtractPrintModal: React.FC<ExtractPrintModalProps> = ({
  isOpen,
  onClose,
  extract,
}) => {
  const { t } = useLanguage();

  if (!extract) return null;

  const handlePrint = () => {
    window.print();
  };

  const tafqeetText = extract.netPayableText || tafqeetArabic(extract.netPayable, 'EGP');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-6xl"
      customHeader={
        <div className="flex items-center justify-between p-4 border-b border-[#243628] bg-[#121B14] shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2A3F30] text-[#A3CFAC] border border-[#3E5C46] flex items-center justify-center shadow-xs">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#8FA392]">
                {t('وثيقة صرف هندسية معتمدة', 'Official Certified Extract Document')}
              </span>
              <h3 className="text-sm sm:text-base font-black text-[#F3EFE6]">
                {t('معاينة طباعة المستخلص الهندسي المعتمد (FIDIC / Egyptian Standard)', 'Progress Extract Print Preview')}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D99B26] hover:bg-[#C58F38] text-[#0E1610] text-xs font-bold shadow-md transition-all cursor-pointer whitespace-nowrap"
            >
              <Printer className="w-4 h-4" />
              <span>{t('طباعة المستخلص (Print)', 'Print Document')}</span>
            </button>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-[#8FA392] hover:text-[#F3EFE6] hover:bg-[#1F2E23] transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      }
      className="print:border-none print:shadow-none print:bg-white print:text-black print:max-w-none print:w-full print:h-auto"
    >
      {/* Printable Document Body */}
      <div className="p-6 sm:p-10 space-y-6 text-[#1A241C] dark:text-[#F3EFE6] print:text-black print:p-4 print:overflow-visible font-sans bg-white dark:bg-[#17231A]">
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
            <div className="text-sm font-black text-[#D99B26] dark:text-[#EBB34D] print:text-black">
              {extract.extractType === 'OWNER' ? 'مستخلص جاري للمالك' : 'مستخلص جاري لمقاول الباطن'}
            </div>
            <div className="text-xs font-mono font-bold text-[#1A241C] dark:text-[#F3EFE6] print:text-black">
              رقم المستخلص: <span className="text-base font-black">EXT-{toWesternDigits(extract.contractNo)}-{toWesternDigits(String(extract.extractNo).padStart(2, '0'))}</span>
            </div>
            <div className="text-[10px] font-mono text-[#5C665E] dark:text-[#8FA392]">
              تاريخ الإصدار: {formatDate(extract.extractDate)}
            </div>
          </div>
        </div>

        {/* Project & Contract Information Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 rounded-xl border border-gray-300 dark:border-[#243628] print:border-black text-xs bg-gray-50/50 dark:bg-[#121B14] print:bg-transparent">
          <div>
            <span className="font-bold text-[#5C665E] dark:text-[#8FA392] ml-1">اسم المشروع:</span>
            <span className="font-bold text-[#1A241C] dark:text-[#F3EFE6] print:text-black">{extract.projectNameAr}</span>
          </div>
          <div>
            <span className="font-bold text-[#5C665E] dark:text-[#8FA392] ml-1">مركز التكلفة:</span>
            <span className="font-mono font-bold">{toWesternDigits(extract.costCenterId)}</span>
          </div>
          <div>
            <span className="font-bold text-[#5C665E] dark:text-[#8FA392] ml-1">رقم العقد الهندسي:</span>
            <span className="font-mono font-bold">CTR-{toWesternDigits(extract.contractNo)}</span>
          </div>
          <div>
            <span className="font-bold text-[#5C665E] dark:text-[#8FA392] ml-1">
              {extract.extractType === 'OWNER' ? 'جهة الإسناد (المالك):' : 'مقاول الباطن:'}
            </span>
            <span className="font-bold">{extract.partyNameAr}</span>
          </div>
          <div>
            <span className="font-bold text-[#5C665E] dark:text-[#8FA392] ml-1">الاستشاري الهندسي:</span>
            <span>{extract.consultantNameAr || 'دار الاستشارات الهندسية'}</span>
          </div>
          <div>
            <span className="font-bold text-[#5C665E] dark:text-[#8FA392] ml-1">فترة المستخلص:</span>
            <span className="font-mono">{formatDate(extract.periodFrom || '2026-08-01')} إلى {formatDate(extract.periodTo || '2026-08-31')}</span>
          </div>
        </div>

        {/* Executed Quantities and Cumulative Totals Table */}
        <div className="space-y-2">
          <h3 className="text-xs font-black border-r-4 border-[#D99B26] pr-2 text-[#1A241C] dark:text-[#F3EFE6] print:text-black">
            جدول بيان وحصر كميات الأعمال المنفذة والقيم التراكمية
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-[11px] border-collapse border border-gray-300 dark:border-[#243628] print:border-black">
              <thead>
                <tr className="bg-gray-100 dark:bg-[#121B14] print:bg-gray-200 border-b border-gray-300 dark:border-[#243628] print:border-black font-black text-center text-[#5C665E] dark:text-[#8FA392]">
                  <th className="py-2 px-1 border border-gray-300 dark:border-[#243628] print:border-black w-8">م</th>
                  <th className="py-2 px-3 border border-gray-300 dark:border-[#243628] print:border-black text-right min-w-[200px]">بيان الأعمال</th>
                  <th className="py-2 px-2 border border-gray-300 dark:border-[#243628] print:border-black w-14">الوحدة</th>
                  <th className="py-2 px-2 border border-gray-300 dark:border-[#243628] print:border-black w-20">كمية العقد</th>
                  <th className="py-2 px-2 border border-gray-300 dark:border-[#243628] print:border-black w-20">سعر الفئة</th>
                  <th className="py-2 px-2 border border-gray-300 dark:border-[#243628] print:border-black w-20">كمية سابقة</th>
                  <th className="py-2 px-2 border border-gray-300 dark:border-[#243628] print:border-black w-20">كمية حالية</th>
                  <th className="py-2 px-2 border border-gray-300 dark:border-[#243628] print:border-black w-20">إجمالي الكمية</th>
                  <th className="py-2 px-2 border border-gray-300 dark:border-[#243628] print:border-black w-16">الإنجاز %</th>
                  <th className="py-2 px-3 border border-gray-300 dark:border-[#243628] print:border-black w-28 text-left">قيمة الأعمال الحالية</th>
                </tr>
              </thead>
              <tbody>
                {extract.lines.map((line, idx) => (
                  <tr key={idx} className="border-b border-gray-300 dark:border-[#243628] print:border-black text-center">
                    <td className="py-2 px-1 border border-gray-300 dark:border-[#243628] print:border-black font-mono">{formatNumber(idx + 1)}</td>
                    <td className="py-2 px-3 border border-gray-300 dark:border-[#243628] print:border-black text-right font-medium">{line.descriptionAr}</td>
                    <td className="py-2 px-2 border border-gray-300 dark:border-[#243628] print:border-black">{line.unitNameAr}</td>
                    <td className="py-2 px-2 border border-gray-300 dark:border-[#243628] print:border-black font-mono">{formatNumber(line.contractQty)}</td>
                    <td className="py-2 px-2 border border-gray-300 dark:border-[#243628] print:border-black font-mono">{formatCurrency(line.unitRate, false)}</td>
                    <td className="py-2 px-2 border border-gray-300 dark:border-[#243628] print:border-black font-mono">{formatNumber(line.previousQty)}</td>
                    <td className="py-2 px-2 border border-gray-300 dark:border-[#243628] print:border-black font-mono font-bold text-[#D99B26] dark:text-[#EBB34D] print:text-black">
                      {formatNumber(line.currentQty)}
                    </td>
                    <td className="py-2 px-2 border border-gray-300 dark:border-[#243628] print:border-black font-mono font-bold">{formatNumber(line.totalQty)}</td>
                    <td className="py-2 px-2 border border-gray-300 dark:border-[#243628] print:border-black font-mono">{line.completionPercent}%</td>
                    <td className="py-2 px-3 border border-gray-300 dark:border-[#243628] print:border-black font-mono font-bold text-left">
                      {formatCurrency(line.currentValue)}
                    </td>
                  </tr>
                ))}
                {/* Total Row */}
                <tr className="bg-gray-50 dark:bg-[#121B14] print:bg-gray-100 font-black border-t-2 border-gray-400 dark:border-[#243628] print:border-black">
                  <td colSpan={9} className="py-2 px-4 border border-gray-300 dark:border-[#243628] print:border-black text-left">
                    إجمالي قيمة الأعمال الحالية المنجزة:
                  </td>
                  <td className="py-2 px-3 border border-gray-300 dark:border-[#243628] print:border-black font-mono text-base text-left text-[#D99B26] dark:text-[#EBB34D] print:text-black">
                    {formatCurrency(extract.currentWorkTotal)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Deductions, Retentions & Net Calculation Ledger */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-gray-300 dark:border-[#243628] bg-white dark:bg-[#121B14] print:border-black space-y-2 text-xs">
            <h4 className="font-black border-b border-gray-300 dark:border-[#243628] pb-1.5 text-[#1A241C] dark:text-[#F3EFE6] print:text-black">
              كشف الاستقطاعات والتحفظات النظامية
            </h4>
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span>إجمالي الأعمال الحالية:</span>
                <span className="font-mono font-bold">{formatCurrency(extract.currentWorkTotal)}</span>
              </div>
              <div className="flex justify-between text-red-600 dark:text-red-400 print:text-black">
                <span>(-) استرداد الدفعة المقدمة ({extract.advanceDeductionPercent}%):</span>
                <span className="font-mono font-bold">-{formatCurrency(extract.advanceDeductionAmount)}</span>
              </div>
              <div className="flex justify-between text-blue-600 dark:text-blue-400 print:text-black">
                <span>(-) استقطاع ضمان أعمال محتجز ({extract.retentionDeductionPercent}%):</span>
                <span className="font-mono font-bold">-{formatCurrency(extract.retentionDeductionAmount)}</span>
              </div>
              {extract.otherDeductions > 0 && (
                <div className="flex justify-between text-red-600 dark:text-red-400 print:text-black">
                  <span>(-) استقطاعات وجزاءات فنية أخرى:</span>
                  <span className="font-mono font-bold">-{formatCurrency(extract.otherDeductions)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 rounded-xl border-2 border-[#D99B26] dark:border-[#EBB34D] print:border-black bg-[#3D2D14]/20 print:bg-transparent space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="font-black text-sm text-[#1A241C] dark:text-[#F3EFE6]">صافي المبلغ المستحق للصرف:</span>
              <span className="text-xl font-mono font-black text-[#D99B26] dark:text-[#EBB34D] print:text-black">
                {formatCurrency(extract.netPayable)}
              </span>
            </div>
            <div className="pt-2 border-t border-gray-300 dark:border-[#243628] print:border-black">
              <span className="font-bold text-[#8FA392]">فقط وقدره بالحروف: </span>
              <span className="font-serif font-bold text-sm text-[#1A241C] dark:text-[#F3EFE6] print:text-black">
                {tafqeetText}
              </span>
            </div>
            {extract.journalNo && (
              <div className="text-[10px] font-mono text-[#5C665E] dark:text-[#8FA392] print:text-gray-700">
                تم الترحيل لليومية العامة برقم قيد: #{extract.journalNo}
              </div>
            )}
          </div>
        </div>

        {/* Multi-Party Signature Blocks */}
        <div className="pt-6 border-t-2 border-gray-300 dark:border-[#243628] print:border-black">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-[10px]">
            <div className="space-y-8 p-2 rounded-lg border border-gray-200 dark:border-[#243628] print:border-black">
              <span className="font-bold block text-[#1A241C] dark:text-[#F3EFE6]">مهندس الموقع</span>
              <span className="text-gray-400 dark:text-[#8FA392] print:text-gray-500">التوقيع والختم</span>
            </div>
            <div className="space-y-8 p-2 rounded-lg border border-gray-200 dark:border-[#243628] print:border-black">
              <span className="font-bold block text-[#1A241C] dark:text-[#F3EFE6]">مهندس المكتب الفني</span>
              <span className="text-gray-400 dark:text-[#8FA392] print:text-gray-500">التوقيع والختم</span>
            </div>
            <div className="space-y-8 p-2 rounded-lg border border-gray-200 dark:border-[#243628] print:border-black">
              <span className="font-bold block text-[#1A241C] dark:text-[#F3EFE6]">مدير المشروع</span>
              <span className="text-gray-400 dark:text-[#8FA392] print:text-gray-500">التوقيع والختم</span>
            </div>
            <div className="space-y-8 p-2 rounded-lg border border-gray-200 dark:border-[#243628] print:border-black">
              <span className="font-bold block text-[#1A241C] dark:text-[#F3EFE6]">المحاسب المالي</span>
              <span className="text-gray-400 dark:text-[#8FA392] print:text-gray-500">التوقيع والختم</span>
            </div>
            <div className="space-y-8 p-2 rounded-lg border border-gray-200 dark:border-[#243628] print:border-black">
              <span className="font-bold block text-[#1A241C] dark:text-[#F3EFE6]">المدير المالي (CFO)</span>
              <span className="text-gray-400 dark:text-[#8FA392] print:text-gray-500">التوقيع والختم</span>
            </div>
            <div className="space-y-8 p-2 rounded-lg border border-gray-200 dark:border-[#243628] print:border-black">
              <span className="font-bold block text-[#1A241C] dark:text-[#F3EFE6]">اعتماد الاستشاري</span>
              <span className="text-gray-400 dark:text-[#8FA392] print:text-gray-500">التوقيع والختم</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
