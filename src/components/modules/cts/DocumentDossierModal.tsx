import React, { useState, useEffect } from 'react';
import { Correspondence } from './types';
import { ctsStorage } from '../../../services/ctsStorage';
import { DocumentQRCode } from './DocumentQRCode';
import { CorrespondenceCycleVisualizer } from './CorrespondenceCycleVisualizer';
import { buildCorrespondenceThread } from './correspondenceGraph';
import { getDocTypeLabel, formatDate, formatDateTime, getStatusBadge, getPriorityBadge } from './formatters';
import {
  X,
  Printer,
  Download,
  FileText,
  Building2,
  Calendar,
  Clock,
  Send,
  Reply,
  Edit3,
  RotateCcw,
  Paperclip
} from 'lucide-react';

interface DocumentDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Correspondence | null;
  onReply?: (doc: Correspondence) => void;
  onEdit?: (doc: Correspondence) => void;
  onReturnForRevision?: (doc: Correspondence) => void;
}

export const DocumentDossierModal: React.FC<DocumentDossierModalProps> = ({
  isOpen,
  onClose,
  document,
  onReply,
  onEdit,
  onReturnForRevision
}) => {
  const [activeDoc, setActiveDoc] = useState<Correspondence | null>(document);
  const [allDocs, setAllDocs] = useState<Correspondence[]>([]);

  useEffect(() => {
    setActiveDoc(document);
  }, [document]);

  useEffect(() => {
    if (isOpen) {
      ctsStorage.getCorrespondences().then(setAllDocs);
    }
  }, [isOpen]);

  if (!isOpen || !activeDoc) return null;

  const thread = buildCorrespondenceThread(activeDoc.doc_id, allDocs);
  const typeInfo = getDocTypeLabel(activeDoc.classification);
  const statusBadge = getStatusBadge(activeDoc.status, activeDoc.is_draft);
  const priorityBadge = getPriorityBadge(activeDoc.priority);
  const isIncoming = activeDoc.doc_type === 'Incoming';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-3xl bg-[#FFFDF9] dark:bg-[#0B1120] border border-amber-200/70 dark:border-stone-800 shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-6 py-4.5 border-b border-amber-200/50 dark:border-stone-800 flex items-center justify-between gap-4 bg-gradient-to-r from-amber-500/10 via-transparent to-amber-500/5">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white shadow-sm shrink-0 ${
              isIncoming ? 'bg-sky-500' : 'bg-amber-500'
            }`}>
              {isIncoming ? <FileText className="w-5 h-5" /> : <Send className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900 dark:text-white truncate">
                  ملف المعاملة الهندسية • {activeDoc.serial_number}
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}>
                  {statusBadge.label}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-stone-400 truncate">
                {activeDoc.project_name || `مشروع [${activeDoc.project_ref}]`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl border border-amber-200/60 dark:border-stone-800 hover:bg-amber-100/40 dark:hover:bg-stone-800 text-slate-700 dark:text-stone-300 transition-colors"
              title="طباعة المعاملة"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Metadata & QR Card */}
          <div className="p-6 rounded-3xl bg-[#FFFDF9] dark:bg-[#0D1F17] border border-amber-200/60 dark:border-amber-500/30 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-4 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                  {typeInfo}
                </span>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-xl border ${priorityBadge.color}`}>
                  أولوية: {priorityBadge.label}
                </span>
                {activeDoc.external_ref_no && (
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-xl bg-stone-100 dark:bg-stone-800 text-slate-700 dark:text-stone-300">
                    الرقم الإشاري الخارجي: {activeDoc.external_ref_no}
                  </span>
                )}
              </div>

              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                  {activeDoc.subject}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-amber-500/5 border border-amber-500/10 space-y-1">
                  <span className="text-[11px] text-slate-500 dark:text-stone-400 block font-medium">
                    الجهة الراسلة (Originator):
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-amber-500" />
                    <span>{activeDoc.sender_entity}</span>
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-amber-500/5 border border-amber-500/10 space-y-1">
                  <span className="text-[11px] text-slate-500 dark:text-stone-400 block font-medium">
                    الجهة المستلمة (Recipient):
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-amber-500" />
                    <span>{activeDoc.receiver_entity}</span>
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-stone-400 pt-1 font-mono">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-500" />
                  <span>تاريخ الخطاب: {formatDate(activeDoc.issue_date)}</span>
                </span>
                {activeDoc.due_date && (
                  <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>المهلة التعاقدية (SLA): {formatDate(activeDoc.due_date)}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Scannable Document QR Code */}
            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-amber-500/5 border border-amber-500/15 shrink-0 text-center">
              <DocumentQRCode
                documentSerial={activeDoc.serial_number}
                projectName={activeDoc.project_name || activeDoc.project_ref}
                date={activeDoc.issue_date}
                approvedBy={activeDoc.approved_by_name}
                size={84}
              />
              <span className="text-[10px] font-bold text-slate-600 dark:text-stone-400 mt-2">
                التحقق الرقمي المعتمد
              </span>
            </div>
          </div>

          {/* Body Text / Letter Content */}
          {activeDoc.body_text && (
            <div className="p-6 rounded-3xl bg-[#FFFDF9] dark:bg-[#0D1F17] border border-amber-200/60 dark:border-amber-500/30 shadow-sm space-y-2">
              <h4 className="text-xs font-bold text-slate-700 dark:text-stone-300">
                نص الخطاب / ملخص المعاملة:
              </h4>
              <p className="text-xs sm:text-sm text-slate-800 dark:text-stone-200 leading-relaxed whitespace-pre-wrap">
                {activeDoc.body_text}
              </p>
            </div>
          )}

          {/* Attachments Section */}
          <div className="p-6 rounded-3xl bg-[#FFFDF9] dark:bg-[#0D1F17] border border-amber-200/60 dark:border-amber-500/30 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Paperclip className="w-4 h-4 text-amber-500" />
              <span>المرفقات والمستندات الممسوحة ضوئياً ({activeDoc.attachments?.length || 0})</span>
            </h4>

            {(!activeDoc.attachments || activeDoc.attachments.length === 0) ? (
              <p className="text-xs text-slate-400 dark:text-stone-500">
                لا توجد مرفقات مرفوعة مع هذا الخطاب
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeDoc.attachments.map((att, idx) => (
                  <div
                    key={att.file_id || idx}
                    className="p-3.5 rounded-2xl border border-amber-200/50 dark:border-stone-700 bg-amber-50/20 dark:bg-stone-900 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-stone-200 truncate">
                          {att.file_name}
                        </p>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {att.file_size_mb} MB • {att.file_category || 'Document'}
                        </span>
                      </div>
                    </div>

                    {att.storage_direct_url ? (
                      <a
                        href={att.storage_direct_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={att.file_name}
                        className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500 hover:text-white text-amber-600 dark:text-amber-400 transition-colors shrink-0"
                        title="تحميل المرفق"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    ) : (
                      <span className="text-[10px] text-stone-400 font-medium">محفوظ محلياً</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Multi-turn Thread Cycle Visualizer */}
          {thread && thread.nodes.length > 1 && (
            <CorrespondenceCycleVisualizer
              thread={thread}
              activeDocId={activeDoc.doc_id}
              onSelectDoc={doc => setActiveDoc(doc)}
            />
          )}
        </div>

        {/* Modal Bottom Actions */}
        <div className="px-6 py-4 border-t border-amber-200/50 dark:border-stone-800 bg-amber-50/30 dark:bg-black/20 flex flex-wrap items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500 dark:text-stone-400">
            تم الإنشاء بواسطة: <strong className="text-slate-700 dark:text-stone-200">{activeDoc.created_by_name}</strong> في {formatDateTime(activeDoc.created_at)}
          </div>

          <div className="flex items-center gap-2.5">
            {onReply && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onReply(activeDoc);
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Reply className="w-3.5 h-3.5" />
                <span>الرد على المعاملة</span>
              </button>
            )}

            {onEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(activeDoc);
                }}
                className="px-3.5 py-2 rounded-xl border border-amber-200/70 dark:border-stone-700 hover:bg-amber-100/50 dark:hover:bg-stone-800 text-slate-700 dark:text-stone-300 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>تعديل</span>
              </button>
            )}

            {onReturnForRevision && !isIncoming && activeDoc.status !== 'Approved' && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onReturnForRevision(activeDoc);
                }}
                className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-600 dark:text-rose-400 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>إرجاع للمراجعة</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-slate-800 dark:text-stone-200 font-bold text-xs transition-colors cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
