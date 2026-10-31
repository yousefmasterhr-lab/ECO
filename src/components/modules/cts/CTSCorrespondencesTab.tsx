// ====================================================================
// ECO ERP - Project Correspondence Management System (CTS / PCMS)
// Central Omni-Search Grid & General Registry Hub (Tab 3)
// ====================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { Correspondence, Project } from './types';
import { ctsStorage } from '../../../services/ctsStorage';
import { exportCorrespondencesToExcel } from './excelExport';
import { getDocTypeLabel, getStatusBadge, getPriorityBadge } from './formatters';
import { 
  Search, 
  FileSpreadsheet, 
  Inbox, 
  Send, 
  Eye, 
  Reply, 
  Layers,
  Paperclip
} from 'lucide-react';

interface CTSCorrespondencesTabProps {
  onOpenDossier: (doc: Correspondence) => void;
  onReplyToInbound: (inboundDoc: Correspondence) => void;
  onOpenInboundModal: () => void;
  onOpenOutboundModal: () => void;
}

export const CTSCorrespondencesTab: React.FC<CTSCorrespondencesTabProps> = ({
  onOpenDossier,
  onReplyToInbound,
  onOpenInboundModal,
  onOpenOutboundModal
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState('ALL');
  const [correspondences, setCorrespondences] = useState<Correspondence[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDirection, setSelectedDirection] = useState<'ALL' | 'Incoming' | 'Outgoing'>('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [isExporting, setIsExporting] = useState(false);

  const loadData = async () => {
    const p = await ctsStorage.getProjects();
    setProjects(p);
    const docs = await ctsStorage.getCorrespondences();
    setCorrespondences(docs);
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('eco-cts-updated', handleUpdate);
    return () => window.removeEventListener('eco-cts-updated', handleUpdate);
  }, []);

  const filteredList = useMemo(() => {
    return correspondences.filter(item => {
      // Project filter
      if (selectedProject !== 'ALL') {
        const matchesProj = item.project_ref === selectedProject || item.project_ref === `PRJ-${selectedProject}`;
        if (!matchesProj) return false;
      }

      // Direction
      if (selectedDirection !== 'ALL' && item.doc_type !== selectedDirection) {
        return false;
      }

      // Type / Classification
      if (selectedType !== 'ALL' && item.classification !== selectedType) {
        return false;
      }

      // Status
      if (selectedStatus !== 'ALL' && item.status !== selectedStatus) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesSerial = item.serial_number?.toLowerCase().includes(q);
        const matchesSubject = item.subject?.toLowerCase().includes(q);
        const matchesExt = item.external_ref_no?.toLowerCase().includes(q);
        const matchesSender = item.sender_entity?.toLowerCase().includes(q);
        const matchesReceiver = item.receiver_entity?.toLowerCase().includes(q);
        return matchesSerial || matchesSubject || matchesExt || matchesSender || matchesReceiver;
      }

      return true;
    });
  }, [correspondences, selectedProject, selectedDirection, selectedType, selectedStatus, searchQuery]);

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      await exportCorrespondencesToExcel(filteredList);
    } catch (e) {
      console.error('Export failed', e);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Top Filter Bar & Command Actions */}
      <div className="p-5 rounded-3xl bg-[#FFFDF9] dark:bg-[#0D1F17] border border-amber-200/60 dark:border-amber-500/30 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                سجل المراسلات والمكاتبات العام (Omni-Search Registry)
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                محرك بحث وفلترة موحد لكافة المراسلات الهندسية (وارد وصادر) مع تصدير Excel فوري
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportExcel}
              disabled={isExporting || filteredList.length === 0}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition shadow-sm disabled:opacity-50"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{isExporting ? 'جارٍ التصدير...' : `تصدير إكسيل (${filteredList.length})`}</span>
            </button>

            <button
              onClick={onOpenInboundModal}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-300 dark:border-sky-800 text-sky-700 dark:text-sky-300 hover:bg-sky-100 transition shadow-sm"
            >
              <Inbox className="w-4 h-4 text-sky-600" />
              <span>وارد جديد</span>
            </button>

            <button
              onClick={onOpenOutboundModal}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white shadow-md shadow-amber-500/25 transition"
            >
              <Send className="w-4 h-4" />
              <span>صادر جديد</span>
            </button>
          </div>
        </div>

        {/* Filters Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-3 border-t border-stone-100 dark:border-stone-800 text-xs">
          {/* Omni Search */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 absolute right-3.5 top-2.5 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالرقم المرجعي، الموضوع، الجهة، أو المرجع الخارجي..."
              className="w-full pr-10 pl-3 py-2 text-xs bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          {/* Project */}
          <div>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 outline-none font-medium"
            >
              <option value="ALL">كافة المشاريع الهندسية</option>
              {projects.map(p => (
                <option key={p.project_id} value={p.project_id}>
                  [{p.project_code}] {p.project_name}
                </option>
              ))}
            </select>
          </div>

          {/* Direction */}
          <div>
            <select
              value={selectedDirection}
              onChange={(e) => setSelectedDirection(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 outline-none font-medium"
            >
              <option value="ALL">الاتجاه: الكل (وارد وصادر)</option>
              <option value="Incoming">وارد فقط (Inbound)</option>
              <option value="Outgoing">صادر فقط (Outbound)</option>
            </select>
          </div>

          {/* Classification */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 outline-none font-medium"
            >
              <option value="ALL">التصنيف: كافة الأنواع</option>
              <option value="LTR">LTR - خطاب رسمي</option>
              <option value="SUB">SUB - تقديم فني</option>
              <option value="IPC">IPC - مستخلص مالي</option>
              <option value="MOM">MOM - محضر اجتماع</option>
              <option value="RFI">RFI - استفسار فني</option>
              <option value="NCR">NCR - عدم مطابقة</option>
              <option value="TRANS">TRANS - مذكرة تسليم</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 outline-none font-medium"
            >
              <option value="ALL">الحالة: كافة الحالات</option>
              <option value="Approved">معتمد رسمياً</option>
              <option value="Replied">تم الرد</option>
              <option value="Pending">قيد المتابعة</option>
              <option value="Draft">مسودة</option>
              <option value="Rejected">مُعاد للمراجعة</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="p-5 rounded-3xl bg-[#FFFDF9] dark:bg-[#0D1F17] border border-amber-200/60 dark:border-amber-500/30 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400 text-[11px]">
                <th className="py-2.5 px-3">الرقم المرجعي</th>
                <th className="py-2.5 px-3">الاتجاه</th>
                <th className="py-2.5 px-3">التصنيف</th>
                <th className="py-2.5 px-3">الموضوع والبيان</th>
                <th className="py-2.5 px-3">الطرف الآخر</th>
                <th className="py-2.5 px-3">الأولوية</th>
                <th className="py-2.5 px-3">التاريخ</th>
                <th className="py-2.5 px-3">الحالة</th>
                <th className="py-2.5 px-3 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-xs text-stone-400">
                    لا توجد مراسلات تطابق معايير البحث والفلترة.
                  </td>
                </tr>
              ) : (
                filteredList.map((doc) => {
                  const isInbound = doc.doc_type === 'Incoming';
                  const statusCfg = getStatusBadge(doc.status);
                  const priorityCfg = getPriorityBadge(doc.priority);

                  return (
                    <tr key={doc.doc_id} className="hover:bg-stone-50 dark:hover:bg-stone-900/50 transition group">
                      <td className="py-3 px-3 font-mono font-bold text-amber-600 dark:text-amber-400 whitespace-nowrap">
                        {doc.serial_number}
                        {doc.is_draft && (
                          <span className="mr-1.5 px-1.5 py-0.5 rounded text-[9px] bg-amber-500/10 text-amber-500 font-sans">
                            مسودة
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                          isInbound ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        }`}>
                          {isInbound ? 'وارد' : 'صادر'}
                        </span>
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
                        {isInbound ? doc.sender_entity : doc.receiver_entity}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${priorityCfg.classes}`}>
                          {priorityCfg.label}
                        </span>
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

                          {isInbound && doc.status !== 'Replied' && (
                            <button
                              onClick={() => onReplyToInbound(doc)}
                              className="px-2 py-1 text-[11px] font-bold rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 hover:bg-sky-500 hover:text-white transition flex items-center gap-1"
                              title="إعداد رد على الخطاب"
                            >
                              <Reply className="w-3 h-3" />
                              <span>رد</span>
                            </button>
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
