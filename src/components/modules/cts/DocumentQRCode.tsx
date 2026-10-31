import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { QrCode, Maximize2, X, CheckCircle2 } from 'lucide-react';

interface DocumentQRCodeProps {
  documentSerial: string;
  projectName: string;
  date: string;
  approvedBy?: string;
  className?: string;
  size?: number;
}

export const DocumentQRCode: React.FC<DocumentQRCodeProps> = ({
  documentSerial,
  projectName,
  date,
  approvedBy,
  className = '',
  size = 72
}) => {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [isZoomed, setIsZoomed] = useState<boolean>(false);

  const verificationUrl = `https://hrsup.com/pcms/verify?doc=${encodeURIComponent(documentSerial)}&dt=${encodeURIComponent(date)}`;

  useEffect(() => {
    QRCode.toDataURL(verificationUrl, {
      width: Math.max(size * 3, 240),
      margin: 2,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
      .then(url => setDataUrl(url))
      .catch(err => console.error('QR generation error:', err));
  }, [verificationUrl, size]);

  if (!dataUrl) {
    return (
      <div 
        style={{ width: size, height: size }} 
        className="bg-stone-200 dark:bg-stone-800 animate-pulse rounded-lg border border-amber-200/50 dark:border-stone-700 flex items-center justify-center text-stone-500"
      >
        <QrCode className="w-5 h-5 opacity-40" />
      </div>
    );
  }

  return (
    <>
      <div 
        className={`group relative inline-block cursor-pointer select-none rounded-xl bg-white p-1.5 shadow-sm border border-amber-200/60 dark:border-stone-700 transition-all hover:scale-105 hover:shadow-md ${className}`}
        onClick={() => setIsZoomed(true)}
        title="انقر لتكبير رمز التحقق الرقمي المعتمد"
      >
        <img 
          src={dataUrl} 
          alt={`رمز التحقق الرقمي: ${documentSerial}`}
          style={{ width: size, height: size }}
          className="block rounded-lg"
        />
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/40 opacity-0 backdrop-blur-2xs transition-opacity group-hover:opacity-100">
          <Maximize2 className="h-4 w-4 text-white drop-shadow-sm" />
        </div>
      </div>

      {/* High-Resolution Zoom Modal for Phone Scanning */}
      {isZoomed && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150"
          onClick={() => setIsZoomed(false)}
        >
          <div 
            className="relative max-w-sm w-full rounded-3xl bg-[#FFFDF9] dark:bg-[#0B1120] border border-amber-300 dark:border-stone-700 p-6 text-center shadow-2xl space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setIsZoomed(false)}
              className="absolute top-4 end-4 p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>وثيقة هندسية معتمدة رقمياً ومسجلة بالسجل الرسمي</span>
            </div>

            <div className="inline-block p-4 rounded-2xl bg-white border border-stone-200 shadow-inner">
              <img 
                src={dataUrl} 
                alt={documentSerial} 
                className="w-56 h-56 mx-auto block rounded-xl"
              />
            </div>

            <div className="space-y-1 text-center">
              <div className="text-sm font-black font-mono text-slate-900 dark:text-white">
                {documentSerial}
              </div>
              <p className="text-xs text-slate-600 dark:text-stone-400 line-clamp-2">
                {projectName}
              </p>
              {approvedBy && (
                <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                  المعتمد: {approvedBy}
                </p>
              )}
            </div>

            <div className="text-[10px] text-slate-400 dark:text-stone-500 font-mono">
              امسح الرمز بكاميرا الهاتف الذكي للتحقق الفوري من صحة السجل
            </div>
          </div>
        </div>
      )}
    </>
  );
};
