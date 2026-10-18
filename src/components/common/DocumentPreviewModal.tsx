import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Image as ImageIcon,
  Download,
  ExternalLink,
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Pencil,
  Loader2
} from 'lucide-react';

/**
 * Converts a Base64 data URL to an Object URL (blob:...)
 * Chrome and Chromium-based browsers block raw data:application/pdf strings inside <iframe> / <embed>.
 * Converting to a binary Blob and creating an Object URL bypasses these restrictions completely.
 */
export function base64ToBlobUrl(base64DataUrl: string, defaultMime = 'application/pdf'): string | null {
  if (!base64DataUrl || typeof base64DataUrl !== 'string') return null;
  const trimmed = base64DataUrl.trim();

  // If already a blob: or http(s): URL, return directly
  if (trimmed.startsWith('blob:') || trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  try {
    let mimeType = defaultMime;
    let base64String = trimmed;

    if (trimmed.startsWith('data:')) {
      const commaIdx = trimmed.indexOf(',');
      if (commaIdx !== -1) {
        const header = trimmed.slice(0, commaIdx);
        base64String = trimmed.slice(commaIdx + 1);
        const match = header.match(/data:([^;]+)/);
        if (match && match[1]) {
          mimeType = match[1];
        }
      }
    }

    // Remove any whitespace or line breaks from base64 string
    base64String = base64String.replace(/\s/g, '');

    const byteCharacters = atob(base64String);
    const byteNumbers = new Uint8Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const blob = new Blob([byteNumbers], { type: mimeType });
    return URL.createObjectURL(blob);
  } catch (err) {
    console.error('[DocumentPreview] Failed to convert base64 to Blob URL:', err);
    return trimmed;
  }
}

/**
 * Custom hook to safely generate and manage a Blob URL with automatic memory cleanup (URL.revokeObjectURL)
 */
export function useBlobUrl(dataUrl?: string, mimeType?: string): string | null {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!dataUrl) {
      setBlobUrl(null);
      return;
    }

    // Direct HTTP/HTTPS link
    if (dataUrl.startsWith('http://') || dataUrl.startsWith('https://')) {
      setBlobUrl(dataUrl);
      return;
    }

    // Already a Blob URL
    if (dataUrl.startsWith('blob:')) {
      setBlobUrl(dataUrl);
      return;
    }

    // Extract or infer MIME type
    let effectiveMime = mimeType;
    if (!effectiveMime) {
      if (dataUrl.startsWith('data:')) {
        const commaIdx = dataUrl.indexOf(',');
        const header = commaIdx !== -1 ? dataUrl.slice(0, commaIdx) : dataUrl;
        const match = header.match(/data:([^;]+)/);
        if (match && match[1]) {
          effectiveMime = match[1];
        }
      }
    }
    if (!effectiveMime) {
      effectiveMime = 'application/pdf';
    }

    const createdUrl = base64ToBlobUrl(dataUrl, effectiveMime);
    setBlobUrl(createdUrl);

    return () => {
      if (createdUrl && createdUrl.startsWith('blob:')) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [dataUrl, mimeType]);

  return blobUrl;
}

function formatBytes(bytes?: number): string {
  if (!bytes || bytes <= 0) return '';
  const k = 1024;
  const sizes = ['بايت', 'ك.ب', 'م.ب', 'ج.ب'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export interface DocumentPreviewViewerProps {
  fileData?: string;
  mimeType?: string;
  fileName?: string;
  title?: string;
  driveUrl?: string;
  onEditAndAttach?: () => void;
}

/**
 * Universal Embedded Document & Image Viewer Content Component
 */
export const DocumentPreviewViewer: React.FC<DocumentPreviewViewerProps> = ({
  fileData,
  mimeType,
  fileName,
  title,
  driveUrl,
  onEditAndAttach
}) => {
  const blobUrl = useBlobUrl(fileData, mimeType);
  const [imageZoom, setImageZoom] = useState<number>(1);

  // Reset zoom whenever file changes
  useEffect(() => {
    setImageZoom(1);
  }, [fileData]);

  // Determine if document is PDF
  const isPdf = Boolean(
    (mimeType && mimeType.toLowerCase().includes('pdf')) ||
    (fileData && (fileData.startsWith('data:application/pdf') || fileData.includes('application/pdf'))) ||
    (fileName && fileName.toLowerCase().endsWith('.pdf'))
  );

  // Determine if document is an Image
  const isImage = Boolean(
    (mimeType && mimeType.toLowerCase().startsWith('image/')) ||
    (fileData && fileData.startsWith('data:image/')) ||
    (fileName && /\.(png|jpe?g|webp|svg|gif)$/i.test(fileName))
  );

  // 1. PDF Embedded Viewer
  if (isPdf && fileData) {
    return (
      <div className="relative w-full h-[65vh] rounded-xl overflow-hidden bg-slate-100 dark:bg-[#070B08] border border-slate-200 dark:border-[#243628]">
        {blobUrl ? (
          <iframe
            src={blobUrl}
            className="w-full h-full rounded-xl border-0 bg-slate-100 dark:bg-[#070B08]"
            title={title || fileName || 'معاينة المستند'}
          >
            <object
              data={blobUrl}
              type="application/pdf"
              className="w-full h-full rounded-xl"
            >
              <div className="p-8 text-center text-xs text-slate-500 dark:text-[#8FA392]">
                <p className="mb-3">لم يتمكن المتصفح من عرض ملف PDF داخل الإطار المدمج.</p>
                <a
                  href={blobUrl}
                  download={fileName || 'document.pdf'}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>تحميل الملف مباشرة</span>
                </a>
              </div>
            </object>
          </iframe>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-500">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
            <span className="text-xs font-bold">جاري تحضير المعاينة الحية...</span>
          </div>
        )}
      </div>
    );
  }

  // 2. High-Resolution Zoomable Image Viewer
  if (isImage && fileData) {
    return (
      <div className="relative w-full h-[65vh] rounded-xl overflow-hidden bg-slate-900/90 dark:bg-[#050806] border border-slate-200 dark:border-[#243628] flex flex-col">
        {/* Floating Zoom Controls Bar */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-1.5 rounded-xl border border-white/10 text-white shadow-lg">
          <button
            type="button"
            onClick={() => setImageZoom(prev => Math.min(prev + 0.25, 3))}
            className="p-1.5 rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
            title="تكبير (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <span className="text-[11px] font-mono px-1.5 font-bold">
            {Math.round(imageZoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setImageZoom(prev => Math.max(prev - 0.25, 0.5))}
            className="p-1.5 rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
            title="تصغير (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          {imageZoom !== 1 && (
            <button
              type="button"
              onClick={() => setImageZoom(1)}
              className="p-1.5 rounded-lg hover:bg-white/20 transition-colors text-amber-400 cursor-pointer"
              title="إعادة ضبط الحجم"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Image Display Area with Pan/Scroll */}
        <div className="flex-1 overflow-auto flex items-center justify-center p-4">
          <img
            src={blobUrl || fileData}
            alt={fileName || title || 'معاينة الصورة'}
            style={{
              transform: `scale(${imageZoom})`,
              transformOrigin: 'center center',
              transition: 'transform 0.15s ease-out'
            }}
            className="max-h-[60vh] max-w-full object-contain rounded-lg shadow-2xl select-none"
          />
        </div>
      </div>
    );
  }

  // 3. Google Drive / Cloud Link
  if (driveUrl) {
    return (
      <div className="p-8 text-center space-y-4 rounded-xl bg-slate-50 dark:bg-[#17231A] border border-slate-200 dark:border-[#243628]">
        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto border border-blue-500/20">
          <ExternalLink className="w-7 h-7" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-[#F3EFE6] mb-1">
            المستند مؤرشف عبر التخزين السحابي الخارجي (Google Drive)
          </h4>
          <p className="text-xs text-slate-500 font-mono break-all max-w-md mx-auto">
            {driveUrl}
          </p>
        </div>
        <a
          href={driveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-md"
        >
          <span>الانتقال للملف في Google Drive</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    );
  }

  // 4. Empty / No Document Attached
  return (
    <div className="py-14 text-center rounded-xl bg-slate-50 dark:bg-[#17231A] border border-slate-200 dark:border-[#243628]">
      <div className="w-14 h-14 rounded-2xl bg-slate-200/70 dark:bg-stone-800 text-slate-400 mx-auto mb-3 flex items-center justify-center">
        <FileText className="w-7 h-7" />
      </div>
      <h4 className="text-sm font-bold text-slate-800 dark:text-[#F3EFE6] mb-1">
        لم يتم إرفاق ملف مستند بعد
      </h4>
      <p className="text-xs text-slate-500 dark:text-[#8FA392] max-w-sm mx-auto mb-4">
        يمكنك تعديل البيانات وإرفاق نسخة PDF رقمية أو صورة ضوئية واضحة للمستند الموثق.
      </p>
      {onEditAndAttach && (
        <button
          type="button"
          onClick={onEditAndAttach}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-l from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/20 cursor-pointer transition-all active:scale-95"
        >
          <Pencil className="w-3.5 h-3.5" />
          <span>تعديل وإرفاق المستند الآن</span>
        </button>
      )}
    </div>
  );
};

export interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  fileName?: string;
  fileData?: string;
  mimeType?: string;
  sizeBytes?: number;
  driveUrl?: string;
  onEditAndAttach?: () => void;
}

/**
 * Universal Modal for Live Embedded PDF & Image Preview (via Blob URL)
 * Strict Architectural Boundary & Governance:
 * - Wide container: max-w-4xl w-full
 * - No top white gap (fixed inset-0 !m-0 !top-0 !left-0 !right-0 !bottom-0 w-screen h-screen z-[999])
 * - Live Blob URL iframe for PDFs with "فتح في علامة تبويب جديدة" and "تحميل الملف"
 */
export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  fileName,
  fileData,
  mimeType,
  sizeBytes,
  driveUrl,
  onEditAndAttach
}) => {
  const blobUrl = useBlobUrl(fileData, mimeType);

  const isPdf = Boolean(
    (mimeType && mimeType.toLowerCase().includes('pdf')) ||
    (fileData && (fileData.startsWith('data:application/pdf') || fileData.includes('application/pdf'))) ||
    (fileName && fileName.toLowerCase().endsWith('.pdf'))
  );

  const formattedSize = formatBytes(sizeBytes);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 !m-0 !top-0 !left-0 !right-0 !bottom-0 w-screen h-screen z-[999] flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-xs overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-4xl max-h-[90vh] flex flex-col bg-white dark:bg-[#0E1610] rounded-2xl border border-slate-200 dark:border-[#243628] shadow-2xl overflow-hidden text-start"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-[#243628] bg-slate-50/70 dark:bg-[#111A13] shrink-0 gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shrink-0 border border-amber-500/25">
                  {isPdf ? (
                    <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-[#F3EFE6] truncate">
                    {title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-[#8FA392] truncate">
                    {subtitle || (fileName ? `${fileName}${formattedSize ? ` • ${formattedSize}` : ''}` : '')}
                  </p>
                </div>
              </div>

              {/* Action Buttons in Header */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Open in new tab (PDF or generic file) */}
                {(blobUrl || fileData) && (
                  <button
                    type="button"
                    onClick={() => {
                      const targetUrl = blobUrl || fileData;
                      if (targetUrl) {
                        window.open(targetUrl, '_blank', 'noopener,noreferrer');
                      }
                    }}
                    className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="فتح في علامة تبويب جديدة"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    <span className="hidden sm:inline">فتح في علامة تبويب جديدة</span>
                  </button>
                )}

                {/* Direct Download Button */}
                {(blobUrl || fileData) && (
                  <a
                    href={blobUrl || fileData}
                    download={fileName || 'document'}
                    className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-gradient-to-l from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer active:scale-95"
                    title="تحميل الملف"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تحميل الملف</span>
                  </a>
                )}

                {/* Close Button */}
                <button
                  type="button"
                  onClick={onClose}
                  className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                  title="إغلاق النافذة"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 overflow-y-auto flex-1">
              <DocumentPreviewViewer
                fileData={fileData}
                mimeType={mimeType}
                fileName={fileName}
                title={title}
                driveUrl={driveUrl}
                onEditAndAttach={onEditAndAttach}
              />
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 sm:p-4 border-t border-slate-200 dark:border-[#243628] bg-slate-50/50 dark:bg-[#111A13] flex items-center justify-between shrink-0">
              <div className="text-[11px] text-slate-500 dark:text-[#8FA392] truncate">
                {fileName && (
                  <span>
                    اسم الملف: <strong className="font-mono text-slate-700 dark:text-slate-300">{fileName}</strong>
                    {formattedSize ? ` (${formattedSize})` : ''}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="min-h-[36px] px-5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
