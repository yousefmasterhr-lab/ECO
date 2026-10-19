import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../../context/LanguageContext';
import {
  QrCode,
  Printer,
  X,
  ShieldCheck,
  User,
  HardHat
} from 'lucide-react';

export interface PassData {
  type: 'visitor' | 'contractor';
  code: string;
  name: string;
  organization?: string;
  nationalId?: string;
  category?: string;
  companyName: string;
  branchName?: string;
  hostName?: string;
  departmentName?: string;
  purpose?: string;
  checkInTime?: string;
  date?: string;
  validUntil?: string;
  workersCount?: number;
}

interface DigitalPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: PassData | null;
}

export const DigitalPassModal: React.FC<DigitalPassModalProps> = ({ isOpen, onClose, data }) => {
  const { t } = useLanguage();
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!data) return;

    const payload = JSON.stringify({
      code: data.code,
      name: data.name,
      org: data.organization,
      natId: data.nationalId,
      company: data.companyName,
      branch: data.branchName,
      host: data.hostName,
      type: data.type,
      date: data.date,
      time: data.checkInTime,
    });

    QRCode.toDataURL(payload, {
      width: 240,
      margin: 1.5,
      color: {
        dark: '#16221A',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    })
      .then(url => setQrDataUrl(url))
      .catch(err => console.warn('[QR Generator] Error:', err));
  }, [data]);

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen || !data) return null;

  const isVisitor = data.type === 'visitor';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#0E1610] border border-amber-500/30 shadow-[0_25px_60px_rgba(0,0,0,0.3),0_0_35px_rgba(217,155,38,0.2)] overflow-hidden"
        >
          {/* Header Action Bar */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200/80 dark:border-[#243628] bg-slate-50/80 dark:bg-[#121B14] print:hidden">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400">
              <QrCode className="w-4 h-4" />
              <span>{t('تصريح الدخول الرقمي المعتمد', 'Verified Digital Access Pass')}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-l from-amber-600 to-amber-500 text-white text-xs font-bold shadow-xs hover:from-amber-700 hover:to-amber-600 transition-all cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{t('طباعة التصريح', 'Print Pass')}</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-stone-200 hover:bg-slate-200/60 dark:hover:bg-[#17231A] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Printable Physical Badge Surface */}
          <div ref={printRef} className="p-6 space-y-5 text-center bg-gradient-to-b from-white via-amber-50/25 to-white dark:from-[#0E1610] dark:via-[#132218] dark:to-[#0E1610]">
            {/* Top Security Header */}
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-4">
              <div className="flex items-center gap-2.5 text-start">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-l from-amber-600 to-amber-500 text-white flex items-center justify-center font-black shadow-xs">
                  {isVisitor ? <User className="w-5 h-5" /> : <HardHat className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-xs font-black tracking-wider uppercase text-amber-600 dark:text-amber-400 font-mono">
                    ECO ERP OPERATIONS
                  </h3>
                  <span className="text-[11px] font-bold text-slate-700 dark:text-stone-300 block">
                    {data.companyName}
                  </span>
                </div>
              </div>

              <div className="text-end">
                <span className="px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-xs font-mono font-black text-amber-800 dark:text-amber-300 block">
                  {data.code}
                </span>
                <span className="text-[9px] text-slate-500 dark:text-[#8FA392] font-semibold mt-0.5 block">
                  {isVisitor ? t('تصريح زائر', 'Visitor Pass') : t('تصريح مقاول', 'Contractor Pass')}
                </span>
              </div>
            </div>

            {/* Beneficiary Details */}
            <div className="space-y-1 pt-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                <ShieldCheck className="w-3 h-3" />
                <span>{t('مصرح بالدخول والتحرك', 'Authorized Access')}</span>
              </span>
              <h2 className="text-xl font-black text-slate-900 dark:text-[#F3EFE6] pt-1">
                {data.name}
              </h2>
              {data.organization && (
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                  {data.organization}
                </p>
              )}
              {data.nationalId && (
                <p className="text-[11px] font-mono text-slate-500 dark:text-[#8FA392]">
                  ID: {data.nationalId}
                </p>
              )}
            </div>

            {/* Generated QR Code Card */}
            <div className="inline-block p-3 rounded-2xl bg-white border border-amber-500/30 shadow-md">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="Security QR Code" className="w-44 h-44 mx-auto rounded-lg" />
              ) : (
                <div className="w-44 h-44 flex items-center justify-center bg-slate-100 text-slate-400">
                  <QrCode className="w-12 h-12 animate-pulse" />
                </div>
              )}
              <span className="block text-[9px] font-mono text-slate-400 mt-1">
                SCAN AT SECURITY GATE
              </span>
            </div>

            {/* Pass Metadata Grid */}
            <div className="grid grid-cols-2 gap-2.5 text-xs text-start pt-1">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#17231A] border border-slate-200/80 dark:border-[#243628]">
                <span className="text-[10px] text-slate-500 dark:text-[#8FA392] block font-medium">
                  {isVisitor ? t('المستضيف / الإدارة:', 'Host / Department:') : t('طبيعة الأعمال:', 'Scope of Work:')}
                </span>
                <span className="font-bold text-slate-800 dark:text-stone-200 truncate block mt-0.5">
                  {isVisitor ? (data.hostName || data.departmentName || 'الاستقبال العام') : (data.purpose || 'أعمال صيانة وتشطيبات')}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#17231A] border border-slate-200/80 dark:border-[#243628]">
                <span className="text-[10px] text-slate-500 dark:text-[#8FA392] block font-medium">
                  {t('وقت الدخول / التاريخ:', 'Entry Time / Date:')}
                </span>
                <span className="font-bold font-mono text-amber-700 dark:text-amber-400 block mt-0.5">
                  {data.checkInTime || '09:00 ص'} • {data.date || new Date().toISOString().split('T')[0]}
                </span>
              </div>
            </div>

            {/* Notice Footer */}
            <p className="text-[10px] text-slate-400 dark:text-[#8FA392] leading-relaxed pt-2 border-t border-slate-200/60 dark:border-[#243628]">
              {t(
                'يجب إبراز هذا التصريح لمسؤول الأمن عند بوابات الدخول والخروج، وإعادته لمكتب الاستقبال فور انتهاء الزيارة.',
                'Present this pass at security gates upon entry and exit. Return to front desk upon conclusion.'
              )}
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
