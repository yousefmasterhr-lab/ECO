// ====================================================================
// ECO ERP - Project Correspondence Management System (CTS / PCMS)
// Manager Review & Return for Revision Modal
// ====================================================================

import React, { useState } from 'react';
import { Correspondence } from './types';
import { ctsStorage } from '../../../services/ctsStorage';
import { RotateCcw, AlertTriangle, User, MessageSquare, X } from 'lucide-react';

interface ReturnForRevisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Correspondence | null;
  onReturned: () => void;
}

export const ReturnForRevisionModal: React.FC<ReturnForRevisionModalProps> = ({
  isOpen,
  onClose,
  document,
  onReturned
}) => {
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !document) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!remarks.trim()) {
      setErrorMsg('يرجى كتابة ملاحظات التدقيق والتصحيح المطلوبة للموظف');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await ctsStorage.returnForRevision(
        document.doc_id,
        remarks.trim(),
        { id: 'usr_pm', name: 'مدير المشروع الهندسي' }
      );
      setIsSubmitting(false);
      setRemarks('');
      onReturned();
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err?.message || 'حدث خطأ أثناء إرجاع الخطاب');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-[#FFFDF9] dark:bg-[#0D1F17] border border-amber-200/60 dark:border-amber-500/30 shadow-2xl p-6 text-slate-900 dark:text-stone-100"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800">
          <div>
            <h3 className="text-base font-bold text-stone-900 dark:text-amber-300 flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-rose-500" />
              <span>إرجاع الخطاب للمراجعة والتصحيح</span>
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              معاملة رقم: <span className="font-mono text-amber-600 dark:text-amber-400">{document.serial_number}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Warning Banner */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">تنبيه تدقيق ومراجعة البيانات</p>
              <p className="leading-relaxed opacity-90">
                سيتم تغيير حالة الخطاب إلى <strong className="text-rose-500 dark:text-rose-400">(مُعاد للتعديل)</strong> وإشعار الموظف المسؤول بالملاحظات لتصحيح الأخطاء وإعادة رفع الخطاب للاعتماد.
              </p>
            </div>
          </div>

          {/* Document Details Card */}
          <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 text-xs space-y-2">
            <div className="flex items-center justify-between text-stone-500 dark:text-stone-400">
              <span>موضوع الخطاب:</span>
              <span className="font-mono">{document.issue_date}</span>
            </div>
            <p className="font-semibold text-stone-800 dark:text-stone-200 truncate">{document.subject}</p>
            <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400 text-[11px] pt-1.5 border-t border-stone-200 dark:border-stone-800">
              <User className="w-3.5 h-3.5 text-amber-500" />
              <span>المحرر المسؤول: <strong className="text-stone-700 dark:text-stone-300">{document.created_by_name || 'موظف السجلات'}</strong></span>
            </div>
          </div>

          {/* Remarks Input */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-amber-500" />
              <span>ملاحظات التدقيق والأخطاء المطلوب تصحيحها من الموظف: *</span>
            </label>
            <textarea
              required
              rows={4}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="مثال: يرجى تعديل اسم الجهة الموجه إليها إلى شركة المقاول العام، وتحديث تاريخ المكاتبة وإرفاق جدول المواصفات..."
              className="w-full px-3.5 py-2.5 text-xs bg-stone-50 dark:bg-stone-900 border border-amber-500/40 rounded-xl text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 outline-none resize-none leading-relaxed transition"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-200 dark:border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20 transition disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'جارٍ الإرجاع...' : 'إرجاع للموظف مع الملاحظات'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

