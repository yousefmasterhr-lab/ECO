import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  ExternalLink,
  FileText,
  Printer,
  UploadCloud,
  CheckCircle2,
  Eye,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { atsStorage } from '../../../services/atsStorage';
import { JobOffer, Candidate } from './types';
import { tafqeet } from '../../../utils/tafqeet';

interface PreviewEventDetail {
  url: string;
  fileName: string;
}

function inferPreviewMime(fileName: string, rawMime?: string): string {
  const clean = (rawMime || '').trim().toLowerCase();
  if (clean && clean !== 'application/octet-stream') return clean;
  const lower = (fileName || '').toLowerCase();
  if (lower.endsWith('.pdf')) return 'application/pdf';
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.gif')) return 'image/gif';
  if (lower.endsWith('.doc')) return 'application/msword';
  if (lower.endsWith('.docx')) {
    return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  }
  return 'application/pdf';
}

function dataUrlToTypedBlobUrl(dataUrl: string, fileName: string, fallbackMime?: string): { blobUrl: string; mime: string } {
  const commaIdx = dataUrl.indexOf(',');
  const meta = commaIdx >= 0 ? dataUrl.slice(0, commaIdx) : '';
  const base64 = commaIdx >= 0 ? dataUrl.slice(commaIdx + 1) : dataUrl;
  const mimeMatch = meta.match(/^data:([^;]+)/i);
  const mime = inferPreviewMime(fileName, mimeMatch?.[1] || fallbackMime);

  const binaryStr = atob(base64);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: mime });
  return { blobUrl: URL.createObjectURL(blob), mime };
}

export const ATSAttachmentPreviewHost: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [fileName, setFileName] = useState('attachment.pdf');
  const [sourceUrl, setSourceUrl] = useState('');
  const [blobUrl, setBlobUrl] = useState('');
  const [mimeType, setMimeType] = useState('application/pdf');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activeBlob = '';

    const handlePreview = async (e: Event) => {
      const custom = e as CustomEvent<PreviewEventDetail>;
      const url = custom.detail?.url || '';
      const name = custom.detail?.fileName || 'attachment.pdf';
      if (!url) return;

      if (activeBlob) {
        URL.revokeObjectURL(activeBlob);
        activeBlob = '';
      }

      setSourceUrl(url);
      setFileName(name);
      setBlobUrl('');
      setError(null);
      setIsOpen(true);
      setLoading(true);

      try {
        if (url.startsWith('data:')) {
          const { blobUrl: bUrl, mime } = dataUrlToTypedBlobUrl(url, name);
          activeBlob = bUrl;
          setMimeType(mime);
          setBlobUrl(bUrl);
        } else if (url.startsWith('/api/ats/attachments')) {
          const sep = url.includes('?') ? '&' : '?';
          const jsonRes = await fetch(`${url}${sep}format=json`);
          if (jsonRes.ok) {
            const payload = (await jsonRes.json()) as {
              fileName?: string;
              mimeType?: string;
              dataUrl?: string;
            };
            const finalName = payload.fileName || name;
            setFileName(finalName);
            if (payload.dataUrl) {
              const { blobUrl: bUrl, mime } = dataUrlToTypedBlobUrl(
                payload.dataUrl,
                finalName,
                payload.mimeType
              );
              activeBlob = bUrl;
              setMimeType(mime);
              setBlobUrl(bUrl);
              return;
            }
          }
          const rawRes = await fetch(url);
          if (!rawRes.ok) throw new Error('تعذر جلب الملف المرفق من الخادم');
          const rawBlob = await rawRes.blob();
          const mime = inferPreviewMime(name, rawBlob.type);
          const typedBlob = new Blob([rawBlob], { type: mime });
          const bUrl = URL.createObjectURL(typedBlob);
          activeBlob = bUrl;
          setMimeType(mime);
          setBlobUrl(bUrl);
        } else {
          setMimeType(inferPreviewMime(name));
          setBlobUrl(url);
        }
      } catch (err: any) {
        setError(err?.message || 'حدث خطأ أثناء فتح الملف للمعاينة');
      } finally {
        setLoading(false);
      }
    };

    window.addEventListener('eco-ats-preview-attachment', handlePreview);
    return () => {
      window.removeEventListener('eco-ats-preview-attachment', handlePreview);
      if (activeBlob) URL.revokeObjectURL(activeBlob);
    };
  }, []);

  if (!isOpen) return null;

  const isImage = mimeType.startsWith('image/');
  const isPdf = mimeType.includes('pdf') || fileName.toLowerCase().endsWith('.pdf');

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs animate-in fade-in"
    >
      <div className="w-full max-w-5xl h-[88vh] rounded-3xl bg-[#FFFFFF] dark:bg-[#141E16] border border-[#E0D9CB] dark:border-[#243628] shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-[#F3EFE6] dark:bg-[#121B14] border-b border-[#E0D9CB] dark:border-[#243628] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#D99B26]/15 text-[#D99B26] flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-black text-[#1A241C] dark:text-[#F3EFE6] truncate">
                {fileName}
              </h3>
              <p className="text-[10.5px] text-[#5C665E] dark:text-[#8FA392]">
                معاينة مباشرة للمستند المرفق داخل النظام
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {blobUrl && (
              <a
                href={blobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFFFFF] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] hover:border-[#D99B26] text-[#1A241C] dark:text-[#F3EFE6] text-xs font-bold transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#D99B26]" />
                <span>تبويب مستقل</span>
              </a>
            )}
            <button
              type="button"
              onClick={() => atsStorage.openOrDownloadAttachment(sourceUrl, fileName, 'download')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تحميل الملف</span>
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-xl border border-[#E0D9CB] dark:border-[#243628] text-[#5C665E] dark:text-[#8FA392] hover:bg-[#FFFFFF] dark:hover:bg-[#17231A] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Viewer Body */}
        <div className="flex-1 min-h-0 bg-[#FBF9F5] dark:bg-[#0E1610] p-3 sm:p-4 flex items-center justify-center overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center gap-3 text-xs font-bold text-[#5C665E] dark:text-[#8FA392]">
              <Loader2 className="w-8 h-8 animate-spin text-[#D99B26]" />
              <span>جاري تجهيز المعاينة المباشرة للمستند...</span>
            </div>
          ) : error ? (
            <div className="max-w-md text-center space-y-3 p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#141E16] border border-rose-500/30">
              <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
              <p className="text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6]">{error}</p>
              <button
                type="button"
                onClick={() => atsStorage.openOrDownloadAttachment(sourceUrl, fileName, 'download')}
                className="px-4 py-2 rounded-xl bg-[#059669] text-white text-xs font-bold cursor-pointer"
              >
                تحميل الملف على جهازك
              </button>
            </div>
          ) : isImage ? (
            <div className="w-full h-full flex items-center justify-center overflow-auto">
              <img
                src={blobUrl}
                alt={fileName}
                className="max-w-full max-h-full object-contain rounded-2xl shadow-lg border border-[#E0D9CB] dark:border-[#243628]"
              />
            </div>
          ) : isPdf ? (
            <iframe
              src={`${blobUrl}#toolbar=1&navpanes=0`}
              title={fileName}
              className="w-full h-full rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-white"
            />
          ) : (
            <div className="max-w-md text-center space-y-4 p-8 rounded-3xl bg-[#FFFFFF] dark:bg-[#141E16] border border-[#E0D9CB] dark:border-[#243628]">
              <FileText className="w-12 h-12 text-[#D99B26] mx-auto" />
              <div className="space-y-1">
                <h4 className="text-sm font-black text-[#1A241C] dark:text-[#F3EFE6]">
                  معاينة مستندات Word غير مدعومة مباشرة في المتصفح
                </h4>
                <p className="text-xs text-[#5C665E] dark:text-[#8FA392]">
                  يمكنك تنزيل الملف ({fileName}) وفتحه فوراً عبر Microsoft Word أو تحويل السير الذاتية إلى PDF للعرض الفوري.
                </p>
              </div>
              <button
                type="button"
                onClick={() => atsStorage.openOrDownloadAttachment(sourceUrl, fileName, 'download')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>تحميل وفتح الملف الآن</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface PrintableJobOfferModalProps {
  offer: JobOffer;
  candidate?: Candidate | null;
  canUploadSigned?: boolean;
  actorName?: string;
  onClose: () => void;
  onUpdated?: (updatedOffer: JobOffer) => void;
}

export const PrintableJobOfferModal: React.FC<PrintableJobOfferModalProps> = ({
  offer,
  candidate,
  canUploadSigned = true,
  actorName = 'المرشح',
  onClose,
  onUpdated,
}) => {
  const [currentOffer, setCurrentOffer] = useState<JobOffer>(offer);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    setCurrentOffer(offer);
  }, [offer]);

  const totalMonthly = currentOffer.compensation?.totalMonthly || 0;
  const salaryTafqeet =
    currentOffer.agreedSalaryText ||
    (totalMonthly > 0 ? tafqeet(totalMonthly, currentOffer.compensation?.currency || 'EGP') : '');

  const handleSignedFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('حجم الملف يتجاوز 10 ميجابايت. يرجى اختيار ملف أصغر.');
      e.target.value = '';
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const dataUrl = typeof reader.result === 'string' ? reader.result : '';
        if (!dataUrl) throw new Error('تعذر قراءة الملف');
        const updated = await atsStorage.uploadSignedOffer(
          currentOffer.id,
          file.name,
          dataUrl,
          actorName
        );
        setCurrentOffer(updated);
        setUploadSuccess(true);
        if (onUpdated) onUpdated(updated);
        setTimeout(() => setUploadSuccess(false), 4000);
      } catch (err: any) {
        setUploadError(err?.message || 'حدث خطأ أثناء رفع العرض الموقع');
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs overflow-y-auto print:static print:p-0 print:bg-white"
    >
      <div className="w-full max-w-4xl rounded-3xl bg-[#FFFFFF] dark:bg-[#141E16] border border-[#E0D9CB] dark:border-[#243628] shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col print:max-h-none print:shadow-none print:border-none">
        {/* Toolbar (hidden on print) */}
        <div className="px-5 sm:px-6 py-4 bg-[#F3EFE6] dark:bg-[#121B14] border-b border-[#E0D9CB] dark:border-[#243628] flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-[#D99B26]" />
            <div>
              <h3 className="text-sm font-black text-[#1A241C] dark:text-[#F3EFE6]">
                نموذج العرض الوظيفي القابل للطباعة والتوقيع اليدوي
              </h3>
              <p className="text-[11px] text-[#5C665E] dark:text-[#8FA392]">
                مرجع العرض: {currentOffer.id} • اطبع العرض ليتم التوقيع عليه يدوياً ثم ارفع النسخة الموقعة هنا
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {currentOffer.signedOfferDataUrl && (
              <button
                type="button"
                onClick={() =>
                  atsStorage.openOrDownloadAttachment(
                    currentOffer.signedOfferDataUrl,
                    currentOffer.signedOfferFileName || 'signed_job_offer.pdf',
                    'view'
                  )
                }
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#D99B26] hover:bg-[#C2881D] text-white text-xs font-bold cursor-pointer transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>عرض النسخة الموقّعة</span>
              </button>
            )}

            {canUploadSigned && !currentOffer.isSyncedToCoreHR && (
              <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#D99B26] hover:bg-[#C2881D] text-white text-xs font-bold cursor-pointer transition-colors">
                {isUploading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <UploadCloud className="w-3.5 h-3.5" />
                )}
                <span>
                  {isUploading
                    ? 'جاري الرفع...'
                    : currentOffer.signedOfferDataUrl
                      ? 'استبدال النسخة الموقّعة'
                      : 'رفع العرض الموقّع يدوياً'}
                </span>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={handleSignedFileUpload}
                  className="hidden"
                />
              </label>
            )}

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة العرض (A4 PDF)</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl border border-[#E0D9CB] dark:border-[#243628] text-[#5C665E] dark:text-[#8FA392] hover:bg-[#FFFFFF] dark:hover:bg-[#17231A] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Upload feedback banners */}
        {(uploadError || uploadSuccess) && (
          <div className="px-6 pt-3 print:hidden">
            {uploadError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}
            {uploadSuccess && (
              <div className="p-3 rounded-xl bg-[#059669]/10 border border-[#059669]/30 text-[#059669] text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>تم رفع وحفظ النسخة الموقعة من العرض الوظيفي بنجاح واعتماد قبول المرشح!</span>
              </div>
            )}
          </div>
        )}

        {/* A4 Formal Job Offer Body */}
        <div className="p-6 sm:p-8 flex-1 min-h-0 overflow-y-auto bg-[#FFFFFF] text-[#111827] print:overflow-visible print:p-4">
          <div className="border-2 border-[#1A241C] rounded-xl p-6 sm:p-8 space-y-6">
            {/* Formal Company Letterhead */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#1A241C] pb-4">
              <div>
                <div className="text-lg font-black text-[#1A241C]">
                  {currentOffer.companyName || 'الشركة المسجلة'}
                </div>
                <div className="text-xs font-bold text-[#5C665E]">
                  إدارة الموارد البشرية واستقطاب الكفاءات
                </div>
              </div>
              <div className="text-left text-xs space-y-0.5 font-mono">
                <div>
                  <strong>رقم العرض:</strong> {currentOffer.id}
                </div>
                <div>
                  <strong>تاريخ الإصدار:</strong> {currentOffer.createdAt?.slice(0, 10) || '-'}
                </div>
                <div>
                  <strong>ساري حتى:</strong> {currentOffer.expiryDate || '-'}
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="text-center space-y-1">
              <h1 className="text-xl sm:text-2xl font-black underline underline-offset-4 text-[#1A241C]">
                عرض عمل رسمي (Job Offer)
              </h1>
              <p className="text-xs font-semibold text-[#5C665E]">
                وفقاً لأحكام قانون العمل المصري رقم ١٤ لسنة ٢٠٢٥ واللوائح الداخلية المعتمدة للشركة
              </p>
            </div>

            {/* Recipient Details */}
            <div className="p-4 rounded-lg bg-[#FBF9F5] border border-[#1A241C]/25 space-y-2 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                <div>
                  <strong>السيد / السيدة:</strong> {currentOffer.candidateName}
                </div>
                <div>
                  <strong>الرقم القومي:</strong>{' '}
                  <span className="font-mono">
                    {currentOffer.candidateNationalId || candidate?.nationalId || '....................'}
                  </span>
                </div>
                <div>
                  <strong>رقم الهاتف:</strong>{' '}
                  <span className="font-mono" dir="ltr">
                    {currentOffer.candidatePhone || candidate?.phone || '-'}
                  </span>
                </div>
                <div>
                  <strong>البريد الإلكتروني:</strong>{' '}
                  {currentOffer.candidateEmail || candidate?.email || '-'}
                </div>
              </div>
            </div>

            {/* Greeting & Position */}
            <div className="text-xs leading-relaxed space-y-2">
              <p>تحية طيبة وبعد،،،</p>
              <p>
                يسعد إدارة <strong>{currentOffer.companyName || 'الشركة'}</strong> أن تتقدم لسيادتكم بعرض العمل
                الرسمي للانضمام إلى فريق العمل بالشروط والبنود التالية:
              </p>
            </div>

            {/* Job Details Table */}
            <table className="w-full border border-[#1A241C]/40 border-collapse text-xs">
              <tbody>
                <tr>
                  <td className="border border-[#1A241C]/40 bg-[#F3EFE6] p-2.5 font-bold w-1/3">
                    المسمى الوظيفي المعتمد
                  </td>
                  <td className="border border-[#1A241C]/40 p-2.5 font-black">
                    {currentOffer.jobTitle}
                  </td>
                </tr>
                <tr>
                  <td className="border border-[#1A241C]/40 bg-[#F3EFE6] p-2.5 font-bold">
                    الإدارة / القطاع المختص
                  </td>
                  <td className="border border-[#1A241C]/40 p-2.5">{currentOffer.department}</td>
                </tr>
                <tr>
                  <td className="border border-[#1A241C]/40 bg-[#F3EFE6] p-2.5 font-bold">
                    التبعية الإدارية
                  </td>
                  <td className="border border-[#1A241C]/40 p-2.5">
                    {currentOffer.reportingTo || 'مدير الإدارة المختص'}
                  </td>
                </tr>
                <tr>
                  <td className="border border-[#1A241C]/40 bg-[#F3EFE6] p-2.5 font-bold">
                    تاريخ بدء استلام العمل المتوقع
                  </td>
                  <td className="border border-[#1A241C]/40 p-2.5 font-mono font-bold">
                    {currentOffer.joiningDate || '.... / .... / 2026'}
                  </td>
                </tr>
                <tr>
                  <td className="border border-[#1A241C]/40 bg-[#F3EFE6] p-2.5 font-bold">
                    فترة الاختبار القانونية
                  </td>
                  <td className="border border-[#1A241C]/40 p-2.5">
                    {currentOffer.compensation?.probationMonths || 3} أشهر من تاريخ المباشرة
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Compensation Package Table */}
            <div className="space-y-2 text-xs">
              <h2 className="font-black bg-[#F3EFE6] px-3 py-1.5 border border-[#1A241C]/30">
                ثانياً: الحزمة المالية والبدلات الشهرية:
              </h2>
              <table className="w-full border border-[#1A241C]/40 border-collapse text-center">
                <thead>
                  <tr className="bg-[#FBF9F5]">
                    <th className="border border-[#1A241C]/40 p-2">الراتب الأساسي</th>
                    <th className="border border-[#1A241C]/40 p-2">بدل سكن</th>
                    <th className="border border-[#1A241C]/40 p-2">بدل انتقال</th>
                    <th className="border border-[#1A241C]/40 p-2">إجمالي الراتب الشهري</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-[#1A241C]/40 p-2 font-mono font-bold">
                      {(currentOffer.compensation?.basicSalary || 0).toLocaleString()} ج.م
                    </td>
                    <td className="border border-[#1A241C]/40 p-2 font-mono">
                      {(currentOffer.compensation?.housingAllowance || 0).toLocaleString()} ج.م
                    </td>
                    <td className="border border-[#1A241C]/40 p-2 font-mono">
                      {(currentOffer.compensation?.transportAllowance || 0).toLocaleString()} ج.م
                    </td>
                    <td className="border border-[#1A241C]/40 p-2 font-mono font-black text-[#059669]">
                      {totalMonthly.toLocaleString()} ج.م
                    </td>
                  </tr>
                  {salaryTafqeet && (
                    <tr>
                      <td className="border border-[#1A241C]/40 bg-[#FBF9F5] p-2 font-bold">
                        الإجمالي بالحروف
                      </td>
                      <td colSpan={3} className="border border-[#1A241C]/40 p-2 font-bold">
                        {salaryTafqeet}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Legal Clauses & Preboarding */}
            <div className="text-xs space-y-2 leading-relaxed">
              <h2 className="font-black bg-[#F3EFE6] px-3 py-1.5 border border-[#1A241C]/30">
                ثالثاً: الشروط العامة ومسوغات التعيين:
              </h2>
              <ul className="list-disc ps-5 space-y-1">
                <li>{currentOffer.termsAndConditions}</li>
                <li>
                  يشترط لتفعيل عقد العمل النهائي تسليم كافة مسوغات التعيين الرسمية (بطاقة الرقم القومي،
                  شهادة المؤهل، الموقف من التجنيد، كعب العمل، برنت التأمينات، الفيش الجنائي، وشهادة الميلاد).
                </li>
                {currentOffer.notes && <li>ملاحظات خاصة بالعرض: {currentOffer.notes}</li>}
              </ul>
            </div>

            {/* Company Signatures */}
            <div className="grid grid-cols-3 gap-4 pt-4 text-center text-xs font-bold border-t border-[#1A241C]/30">
              <div className="space-y-6">
                <div>مدير الموارد البشرية</div>
                <div className="text-[#5C665E]">
                  {currentOffer.hrApprovalName || currentOffer.hrSignerName || '.........................'}
                </div>
              </div>
              <div className="space-y-6">
                <div>مدير الإدارة المختص</div>
                <div className="text-[#5C665E]">
                  {currentOffer.deptManagerApprovalName || '.........................'}
                </div>
              </div>
              <div className="space-y-6">
                <div>الرئيس التنفيذي / العضو المنتدب</div>
                <div className="text-[#5C665E]">
                  {currentOffer.ceoApprovalName || '.........................'}
                </div>
              </div>
            </div>

            {/* Applicant Handwritten Signature Box */}
            <div className="border-2 border-dashed border-[#1A241C] rounded-xl p-5 bg-[#FBF9F5] space-y-4 text-xs">
              <div className="font-black text-sm text-[#1A241C]">
                إقرار قبول العرض الوظيفي والتوقيع اليدوي للمرشح :
              </div>
              <p className="leading-relaxed font-semibold">
                أقر أنا الموقّع أدناه بأني اطلعت على كافة بنود وشروط هذا العرض الوظيفي وأوافق عليها موافقة كاملة
                ونهائية، وأتعهد بتقديم أصول مسوغات التعيين في الموعد المحدد لبدء العمل.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-3 font-bold">
                <div className="space-y-2">
                  <div>الاسم بالكامل :</div>
                  <div className="border-b border-[#1A241C] pb-2 min-h-[28px]">
                    {currentOffer.candidateName}
                  </div>
                </div>
                <div className="space-y-2">
                  <div>تاريخ التوقيع :</div>
                  <div className="border-b border-[#1A241C] pb-2 min-h-[28px]">
                    {currentOffer.signedOfferUploadedAt
                      ? currentOffer.signedOfferUploadedAt.slice(0, 10)
                      : '       /       / 202'}
                  </div>
                </div>
                <div className="space-y-2">
                  <div>التوقيع اليدوي للمرشح :</div>
                  <div className="border-b border-[#1A241C] pb-2 min-h-[42px]" />
                </div>
              </div>

              {currentOffer.signedOfferFileName && (
                <div className="pt-2 flex items-center gap-2 text-[#059669] font-bold print:hidden">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>
                    النسخة الموقّعة مرفقة بالملف: {currentOffer.signedOfferFileName}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

