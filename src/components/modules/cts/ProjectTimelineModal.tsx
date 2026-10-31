// ====================================================================
// ECO ERP - Project Correspondence Management System (CTS / PCMS)
// Project Correspondence Timeline History & Cycle Modal
// ====================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { Project, Correspondence } from './types';
import { ctsStorage } from '../../../services/ctsStorage';
import { getDocTypeLabel, getStatusBadge } from './formatters';
import { 
  ArrowDown, 
  ArrowUp,
  Inbox, 
  Send, 
  Calendar, 
  Paperclip, 
  Eye, 
  X,
  Layers
} from 'lucide-react';

interface ProjectTimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onOpenDocDossier: (doc: Correspondence) => void;
}

export const ProjectTimelineModal: React.FC<ProjectTimelineModalProps> = ({
  isOpen,
  onClose,
  project,
  onOpenDocDossier
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'Incoming' | 'Outgoing'>('ALL');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [correspondences, setCorrespondences] = useState<Correspondence[]>([]);

  useEffect(() => {
    if (isOpen && project) {
      ctsStorage.getCorrespondences().then(all => {
        const matching = all.filter(
          c => c.project_ref === project.project_id || c.project_ref === project.project_code
        );
        setCorrespondences(matching);
      });
    }
  }, [isOpen, project]);

  const filteredItems = useMemo(() => {
    let list = [...correspondences];
    if (filterType !== 'ALL') {
      list = list.filter(c => c.doc_type === filterType);
    }
    list.sort((a, b) => {
      const dateA = new Date(a.issue_date || a.created_at || '').getTime();
      const dateB = new Date(b.issue_date || b.created_at || '').getTime();
      return sortOrder === 'DESC' ? dateB - dateA : dateA - dateB;
    });
    return list;
  }, [correspondences, filterType, sortOrder]);

  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl my-auto rounded-3xl bg-white dark:bg-[#0E1A11] border border-stone-200 dark:border-amber-500/20 shadow-2xl p-6 text-stone-900 dark:text-stone-100 overflow-hidden"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  {project.project_code}
                </span>
                <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                  المخطط الزمني الشامل لمراسلات: {project.project_name}
                </h3>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                تتبع زمني تفاعلي لكافة المكاتبات الواردة والصادرة والردود المتبادلة
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 py-3 px-4 my-4 rounded-2xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-stone-400 ml-1">تصفية:</span>
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1.5 rounded-xl font-bold transition ${
                filterType === 'ALL'
                  ? 'bg-amber-500 text-stone-900'
                  : 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
              }`}
            >
              الكل ({correspondences.length})
            </button>
            <button
              onClick={() => setFilterType('Incoming')}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                filterType === 'Incoming'
                  ? 'bg-sky-500 text-white'
                  : 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
              }`}
            >
              <Inbox className="w-3.5 h-3.5" />
              <span>الوارد ({correspondences.filter(c => c.doc_type === 'Incoming').length})</span>
            </button>
            <button
              onClick={() => setFilterType('Outgoing')}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                filterType === 'Outgoing'
                  ? 'bg-amber-500 text-stone-900'
                  : 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>الصادر ({correspondences.filter(c => c.doc_type === 'Outgoing').length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSortOrder(prev => prev === 'DESC' ? 'ASC' : 'DESC')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:text-amber-500 transition font-medium"
            >
              {sortOrder === 'DESC' ? <ArrowDown className="w-3.5 h-3.5" /> : <ArrowUp className="w-3.5 h-3.5" />}
              <span>{sortOrder === 'DESC' ? 'الأحدث أولاً' : 'الأقدم أولاً'}</span>
            </button>
          </div>
        </div>

        {/* Timeline Stream */}
        <div className="max-h-[55vh] overflow-y-auto pr-2 pl-1 space-y-4 relative">
          <div className="absolute right-5 top-2 bottom-2 w-0.5 bg-stone-200 dark:bg-stone-800 pointer-events-none" />

          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-xs text-stone-400">
              لا توجد مكاتبات مسجلة في هذا المشروع وفق معايير التصفية المحددة.
            </div>
          ) : (
            filteredItems.map((doc) => {
              const isInbound = doc.doc_type === 'Incoming';
              const statusCfg = getStatusBadge(doc.status);

              return (
                <div key={doc.doc_id} className="relative flex items-start gap-4 pr-10 group">
                  {/* Node icon */}
                  <div className={`absolute right-3.5 top-3.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-[#0E1A11] z-10 ${
                    isInbound ? 'bg-sky-500' : 'bg-amber-500'
                  }`} />

                  {/* Card */}
                  <div className="flex-1 p-4 rounded-2xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 hover:border-amber-500/50 transition shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                          isInbound ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        }`}>
                          {isInbound ? 'وارد' : 'صادر'}
                        </span>
                        <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                          {doc.serial_number}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-stone-200 dark:bg-stone-800 font-semibold">
                          {getDocTypeLabel(doc.classification)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${statusCfg.classes}`}>
                          {statusCfg.label}
                        </span>
                        <button
                          onClick={() => onOpenDocDossier(doc)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500 text-amber-600 dark:text-amber-400 hover:text-stone-900 text-[11px] font-bold transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>فتح الإضبارة</span>
                        </button>
                      </div>
                    </div>

                    <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 mb-1.5 line-clamp-2">
                      {doc.subject}
                    </h4>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-stone-500 dark:text-stone-400">
                      <span>من: <strong className="text-stone-700 dark:text-stone-300">{doc.sender_entity}</strong></span>
                      <span>إلى: <strong className="text-stone-700 dark:text-stone-300">{doc.receiver_entity}</strong></span>
                      {doc.issue_date && (
                        <span className="flex items-center gap-1 font-mono">
                          <Calendar className="w-3 h-3 text-amber-500" />
                          <span>{doc.issue_date}</span>
                        </span>
                      )}
                      {doc.attachments && doc.attachments.length > 0 && (
                        <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
                          <Paperclip className="w-3 h-3" />
                          <span>{doc.attachments.length} مرفقات</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end pt-4 border-t border-stone-200 dark:border-stone-800 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-900 transition"
          >
            إغلاق المخطط الزمني
          </button>
        </div>
      </div>
    </div>
  );
};
