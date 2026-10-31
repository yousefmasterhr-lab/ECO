import React from 'react';
import { Correspondence } from './types';
import { CorrespondenceThread, ThreadNode } from './correspondenceGraph';
import { getDocTypeLabel, formatDate } from './formatters';
import {
  Eye,
  Building2,
  GitFork,
  ArrowLeftRight,
  Send,
  Inbox
} from 'lucide-react';

interface CorrespondenceCycleVisualizerProps {
  thread: CorrespondenceThread;
  activeDocId: string;
  onSelectDoc: (doc: Correspondence) => void;
  onReplyToDoc?: (doc: Correspondence) => void;
}

export const CorrespondenceCycleVisualizer: React.FC<CorrespondenceCycleVisualizerProps> = ({
  thread,
  activeDocId,
  onSelectDoc,
  onReplyToDoc: _onReplyToDoc
}) => {
  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFDF9] dark:bg-[#0F172A]/90 border border-amber-200/60 dark:border-[#334155] shadow-lg space-y-5">
      {/* 1. Header Bar: Cycle Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-amber-200/40 dark:border-[#334155]/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
              <ArrowLeftRight className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-slate-900 dark:text-white tracking-wide">
              سلسلة المراسلات والردود المرتبطة
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 font-mono font-bold border border-amber-500/30">
              ({thread.total_turns}) خطابات ومراسلات
            </span>
            {thread.has_branches && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30 flex items-center gap-1">
                <GitFork className="w-3 h-3" />
                <span>تفرع ردود</span>
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            تتبع زمني متسلسل لكافة الخطابات والردود والتعقيبات الصادرة والواردة لنفس المعاملة
          </p>
        </div>
      </div>

      {/* 2. Chronological Turn-by-Turn Flow Cards */}
      <div className="space-y-4 relative">
        {thread.nodes.map((node: ThreadNode, idx: number) => {
          const isActive = node.doc.doc_id === activeDocId;
          const typeInfo = getDocTypeLabel(node.doc.classification);
          const isDraft = node.doc.is_draft || node.doc.status === 'Draft';
          const isIncoming = node.doc.doc_type === 'Incoming';

          return (
            <div key={node.doc.doc_id} className="relative">
              {/* Connector line between steps */}
              {idx < thread.nodes.length - 1 && (
                <div className="absolute start-5.5 top-12 bottom-0 w-0.5 bg-gradient-to-b from-amber-400 to-amber-200 dark:from-amber-500/40 dark:to-transparent z-0" />
              )}

              <div
                className={`relative z-10 p-4 rounded-2xl border transition-all duration-200 ${
                  isActive
                    ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/30 shadow-md'
                    : 'bg-white dark:bg-[#1E293B]/80 border-amber-200/50 dark:border-[#334155] hover:border-amber-400 dark:hover:border-amber-500/50'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    {/* Turn Badge / Icon */}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-xs ${
                        isIncoming
                          ? 'bg-sky-500 text-white'
                          : 'bg-amber-500 text-white'
                      }`}
                    >
                      {isIncoming ? <Inbox className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                          {node.doc.serial_number}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                          {typeInfo}
                        </span>
                        {isDraft && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-amber-500/20 text-amber-800 dark:text-amber-200 border border-amber-500/40">
                            مسودة
                          </span>
                        )}
                        {node.is_branch && node.branch_label && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            {node.branch_label}
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs font-bold text-slate-800 dark:text-stone-200 line-clamp-2">
                        {node.doc.subject}
                      </h4>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-stone-400 pt-1">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-amber-500" />
                          <span>الراسل: {node.doc.sender_entity}</span>
                        </span>
                        <span>›</span>
                        <span>المستلم: {node.doc.receiver_entity}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Timestamp */}
                  <div className="flex sm:flex-col items-end justify-between sm:justify-start gap-2 shrink-0">
                    <span className="text-[10.5px] font-mono text-slate-500 dark:text-stone-400">
                      {formatDate(node.doc.issue_date)}
                    </span>

                    {!isActive && (
                      <button
                        type="button"
                        onClick={() => onSelectDoc(node.doc)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/10 hover:bg-amber-500 hover:text-white text-amber-600 dark:text-amber-400 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>عرض الملف</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
