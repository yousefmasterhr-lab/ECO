// ====================================================================
// ECO ERP - Project Correspondence Management System (CTS / PCMS)
// Dedicated Outbound Drafting & Atomic Approval Suite (Tab 5)
// ====================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { Correspondence, Project } from './types';
import { ctsStorage } from '../../../services/ctsStorage';
import { getDocTypeLabel, getStatusBadge, getPriorityBadge } from './formatters';
import { 
  Send, 
  Plus, 
  Search, 
  Stamp, 
  Eye, 
  CheckCircle2, 
  Clock, 
  RotateCcw, 
  Edit3, 
  Paperclip
} from 'lucide-react';

interface CTSOutboundTabProps {
  onOpenDraftModal: () => void;
  onOpenDossier: (doc: Correspondence) => void;
  onQuickApprove: (doc: Correspondence) => void;
  onEditOutbound?: (doc: Correspondence) => void;
  onReturnOutbound?: (doc: Correspondence) => void;
}

export const CTSOutboundTab: React.FC<CTSOutboundTabProps> = ({
  onOpenDraftModal,
  onOpenDossier,
  onQuickApprove,
  onEditOutbound,
  onReturnOutbound
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState('ALL');
  const [outbounds, setOutbounds] = useState<Correspondence[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'ALL' | 'DRAFTS' | 'APPROVED'>('ALL');

  const loadData = async () => {
    const p = await ctsStorage.getProjects();
    setProjects(p);
    const docs = await ctsStorage.getCorrespondences({ docType: 'Outgoing' });
    setOutbounds(docs);
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('eco-cts-updated', handleUpdate);
    return () => window.removeEventListener('eco-cts-updated', handleUpdate);
  }, []);

  const filteredOutbounds = useMemo(() => {
    return outbounds.filter(item => {
      if (selectedProject !== 'ALL') {
        const matchesProj = item.project_ref === selectedProject || item.project_ref === `PRJ-${selectedProject}`;
        if (!matchesProj) return false;
      }
      if (filterTab === 'DRAFTS' && !item.is_draft && item.status === 'Approved') {
        return false;
      }
      if (filterTab === 'APPROVED' && item.status !== 'Approved') {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesSerial = item.serial_number?.toLowerCase().includes(q);
        const matchesSubject = item.subject?.toLowerCase().includes(q);
        const matchesReceiver = item.receiver_entity?.toLowerCase().includes(q);
        const matchesCreator = item.created_by_name?.toLowerCase().includes(q);
        return matchesSerial || matchesSubject || matchesReceiver || matchesCreator;
      }
      return true;
    });
  }, [outbounds, selectedProject, filterTab, searchQuery]);

  const draftsCount = outbounds.filter(c => c.is_draft || c.status === 'Draft' || c.status === 'Pending').length;
  const approvedCount = outbounds.filter(c => c.status === 'Approved').length;
  const rejectedCount = outbounds.filter(c => c.status === 'Rejected').length;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Top Banner Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-3xl bg-[#FFFDF9] dark:bg-[#0D1F17] border border-amber-200/60 dark:border-amber-500/30 shadow-sm">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 text-xs mb-1">
            <span className="font-bold">إجمالي الصادر</span>
            <Send className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-stone-900 dark:text-stone-100 font-mono">{outbounds.length}</p>
        </div>

        <div className="p-4 rounded-3xl bg-[#FFFDF9] dark:bg-[#0D1F17] border border-amber-200/60 dark:border-amber-500/30 shadow-sm">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 text-xs mb-1">
            <span className="font-bold">مسودات قيد المراجعة</span>
            <Clock className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">{draftsCount}</p>
        </div>

        <div className="p-4 rounded-3xl bg-[#FFFDF9] dark:bg-[#0D1F17] border border-amber-200/60 dark:border-amber-500/30 shadow-sm">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 text-xs mb-1">
            <span className="font-bold">معتمدة ومصدرة رسمياً</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">{approvedCount}</p>
        </div>

        <div className="p-4 rounded-3xl bg-[#FFFDF9] dark:bg-[#0D1F17] border border-amber-200/60 dark:border-amber-500/30 shadow-sm">
          <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 text-xs mb-1">
            <span className="font-bold">معادة للملاحظات والتعديل</span>
            <RotateCcw className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">{rejectedCount}</p>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="p-5 rounded-3xl bg-[#FFFDF9] dark:bg-[#0D1F17] border border-amber-200/60 dark:border-amber-500/30 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Send className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                منظومة إعداد واعتماد الخطابات الصادرة (Outbound Drafting & Approval)
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                توليد المسودات المؤقتة، المراجعة والتدقيق، ومراسم الاعتماد التسلسلي الذري
              </p>
            </div>
          </div>

          <button
            onClick={onOpenDraftModal}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-2xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white shadow-md shadow-amber-500/25 transition"
          >
            <Plus className="w-4 h-4" />
            <span>تحرير مسودة صادرة جديدة</span>
          </button>
        </div>

        {/* Filters and Sub Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100 dark:border-stone-800 text-xs">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFilterTab('ALL')}
              className={`px-3 py-1.5 rounded-xl font-bold transition ${
                filterTab === 'ALL'
                  ? 'bg-amber-500 text-stone-900 shadow-sm'
                  : 'bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-400'
              }`}
            >
              كافة الصادر ({outbounds.length})
            </button>
            <button
              onClick={() => setFilterTab('DRAFTS')}
              className={`px-3 py-1.5 rounded-xl font-bold transition ${
                filterTab === 'DRAFTS'
                  ? 'bg-amber-500 text-stone-900 shadow-sm'
                  : 'bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-400'
              }`}
            >
              مسودات قيد التدقيق ({draftsCount})
            </button>
            <button
              onClick={() => setFilterTab('APPROVED')}
              className={`px-3 py-1.5 rounded-xl font-bold transition ${
                filterTab === 'APPROVED'
                  ? 'bg-amber-500 text-stone-900 shadow-sm'
                  : 'bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-400'
              }`}
            >
              صادر معتمد ({approvedCount})
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 absolute right-3.5 top-2.5 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث بالرقم، الموضوع، أو المستلم..."
                className="w-full pr-10 pl-3 py-1.5 text-xs bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="px-3 py-1.5 text-xs bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 outline-none font-medium"
            >
              <option value="ALL">كافة المشاريع</option>
              {projects.map(p => (
                <option key={p.project_id} value={p.project_id}>
                  [{p.project_code}] {p.project_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Outbound Table */}
      <div className="p-5 rounded-3xl bg-[#FFFDF9] dark:bg-[#0D1F17] border border-amber-200/60 dark:border-amber-500/30 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400 text-[11px]">
                <th className="py-2.5 px-3">رقم الصادر / المسودة</th>
                <th className="py-2.5 px-3">التصنيف</th>
                <th className="py-2.5 px-3">الموضوع والبيان</th>
                <th className="py-2.5 px-3">الجهة الموجه إليها</th>
                <th className="py-2.5 px-3">الأولوية</th>
                <th className="py-2.5 px-3">المحرر</th>
                <th className="py-2.5 px-3">التاريخ</th>
                <th className="py-2.5 px-3">الحالة</th>
                <th className="py-2.5 px-3 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {filteredOutbounds.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-xs text-stone-400">
                    لا توجد خطابات صادرة تطابق خيارات التصفية المحددة.
                  </td>
                </tr>
              ) : (
                filteredOutbounds.map((doc) => {
                  const statusCfg = getStatusBadge(doc.status);
                  const priorityCfg = getPriorityBadge(doc.priority);
                  const isDraft = doc.is_draft || doc.status === 'Draft' || doc.status === 'Pending' || doc.status === 'Rejected';

                  return (
                    <tr key={doc.doc_id} className="hover:bg-stone-50 dark:hover:bg-stone-900/50 transition">
                      <td className="py-3 px-3 font-mono font-bold text-amber-600 dark:text-amber-400 whitespace-nowrap">
                        {doc.serial_number}
                      </td>
                      <td className="py-3 px-3 font-semibold text-stone-700 dark:text-stone-300 whitespace-nowrap">
                        {getDocTypeLabel(doc.classification)}
                      </td>
                      <td className="py-3 px-3 font-medium text-stone-900 dark:text-stone-100 max-w-sm truncate">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="truncate">{doc.subject}</span>
                          {doc.attachments && doc.attachments.length > 0 && (
                            <span className="text-amber-500 text-[10px] shrink-0 flex items-center font-bold">
                              <Paperclip className="w-3 h-3" />
                              {doc.attachments.length}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-stone-600 dark:text-stone-400 truncate max-w-[150px]">
                        {doc.receiver_entity}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${priorityCfg.classes}`}>
                          {priorityCfg.label}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-stone-600 dark:text-stone-400 whitespace-nowrap">
                        {doc.created_by_name || '—'}
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-stone-500 whitespace-nowrap">
                        {doc.issue_date || '—'}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${statusCfg.classes}`}>
                          {statusCfg.label}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onOpenDossier(doc)}
                            className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-stone-900 transition flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            <span>الإضبارة</span>
                          </button>

                          {isDraft && (
                            <>
                              <button
                                onClick={() => onQuickApprove(doc)}
                                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-1 shadow-sm"
                                title="اعتماد ذري فوري وتوليد الرقم الرسمي"
                              >
                                <Stamp className="w-3 h-3" />
                                <span>اعتماد</span>
                              </button>

                              {onEditOutbound && (
                                <button
                                  onClick={() => onEditOutbound(doc)}
                                  className="p-1.5 rounded-lg text-stone-400 hover:text-amber-500 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
                                  title="تعديل المسودة"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {onReturnOutbound && (
                                <button
                                  onClick={() => onReturnOutbound(doc)}
                                  className="p-1.5 rounded-lg text-stone-400 hover:text-rose-500 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
                                  title="إرجاع للمراجعة والتعديل"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
