import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../../context/LanguageContext';
import { AuditDiff } from '../../../services/receptionStorage';
import {
  AlertCircle,
  X,
  Clock,
  User,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface AuditLogDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  auditLogs?: AuditDiff[] | string;
}

export const AuditLogDrawer: React.FC<AuditLogDrawerProps> = ({
  isOpen,
  onClose,
  title,
  auditLogs,
}) => {
  const { isRtl, t } = useLanguage();

  if (!isOpen) return null;

  const logs: AuditDiff[] = typeof auditLogs === 'string'
    ? (() => {
        try {
          return JSON.parse(auditLogs);
        } catch {
          return [];
        }
      })()
    : Array.isArray(auditLogs)
    ? auditLogs
    : [];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
        <motion.div
          initial={{ x: isRtl ? -450 : 450, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: isRtl ? -450 : 450, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-md bg-white dark:bg-[#0E1610] border-s border-amber-500/30 shadow-2xl flex flex-col h-full"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-[#243628] bg-slate-50 dark:bg-[#121B14]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-[#F3EFE6]">
                  {t('سجل التدقيق والتعديلات (!)', 'Audit Trail & Change Log (!)')}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-[#8FA392] truncate max-w-[260px]">
                  {title}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-stone-200 hover:bg-slate-200/60 dark:hover:bg-[#17231A] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Timeline Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {logs.length === 0 ? (
              <div className="p-8 text-center space-y-2 border border-dashed border-slate-200 dark:border-[#243628] rounded-2xl bg-slate-50/50 dark:bg-[#121B14]/50">
                <ShieldCheck className="w-8 h-8 text-amber-500 mx-auto" />
                <p className="text-xs font-bold text-slate-700 dark:text-stone-300">
                  {t('لا توجد تعديلات مسجلة بعد', 'No change entries recorded yet')}
                </p>
                <p className="text-[11px] text-slate-400">
                  {t('يتم توثيق كافة التعديلات والتغييرات آلياً مع هوية المستخدم والوقت.', 'All state modifications and updates are securely logged.')}
                </p>
              </div>
            ) : (
              <div className="relative border-s-2 border-amber-500/30 ms-3 space-y-4">
                {logs.map((log, idx) => (
                  <div key={idx} className="relative ps-5">
                    {/* Timeline bullet dot */}
                    <div className="absolute -start-[7px] top-1.5 w-3 h-3 rounded-full bg-amber-500 ring-4 ring-white dark:ring-[#0E1610]" />

                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#17231A] border border-slate-200/80 dark:border-[#243628] space-y-2 shadow-2xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-[#F3EFE6]">
                          {log.action}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1" dir="ltr">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(log.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                        <User className="w-3 h-3" />
                        <span>{log.userName}</span>
                      </div>

                      {log.field && (
                        <div className="p-2 rounded-xl bg-white dark:bg-[#121B14] border border-slate-200/70 dark:border-[#243628] text-xs space-y-1">
                          <span className="text-[10px] text-slate-400 block font-medium">
                            {t('الحقل المعدل:', 'Changed Field:')} <strong className="text-slate-700 dark:text-stone-300">{log.field}</strong>
                          </span>
                          <div className="flex items-center gap-2 text-[11px]">
                            <span className="text-rose-600 dark:text-rose-400 line-through font-mono">
                              {log.oldValue || '—'}
                            </span>
                            <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="text-emerald-700 dark:text-emerald-400 font-bold font-mono">
                              {log.newValue || '—'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
