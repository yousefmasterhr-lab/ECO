// ====================================================================
// ECO ERP - Project Correspondence Management System (CTS / PCMS)
// Dedicated Inbound Intake & Registry Workspace (Tab 4)
// ====================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { Correspondence, Project } from './types';
import { ctsStorage } from '../../../services/ctsStorage';
import { getDocTypeLabel, getStatusBadge, getPriorityBadge } from './formatters';
import { 
  Inbox, 
  Plus, 
  Search, 
  Reply, 
  Eye, 
  Clock, 
  AlertTriangle, 
  CheckCircle2,
  Paperclip
} from 'lucide-react';

interface CTSInboundTabProps {
  onOpenIntakeModal: () => void;
  onOpenDossier: (doc: Correspondence) => void;
  onReplyToInbound: (inboundDoc: Correspondence) => void;
  onEditInbound?: (doc: Correspondence) => void;
}

export const CTSInboundTab: React.FC<CTSInboundTabProps> = ({
  onOpenIntakeModal,
  onOpenDossier,
  onReplyToInbound,
  onEditInbound: _onEditInbound
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState('ALL');
  const [inbounds, setInbounds] = useState<Correspondence[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Pending' | 'Replied'>('ALL');
  const [selectedClassification, setSelectedClassification] = useState('ALL');

  const loadData = async () => {
    const p = await ctsStorage.getProjects();
    setProjects(p);
    const docs = await ctsStorage.getCorrespondences({ docType: 'Incoming' });
    setInbounds(docs);
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('eco-cts-updated', handleUpdate);
    return () => window.removeEventListener('eco-cts-updated', handleUpdate);
  }, []);

  const filteredInbounds = useMemo(() => {
    return inbounds.filter(item => {
      if (selectedProject !== 'ALL') {
        const matchesProj = item.project_ref === selectedProject || item.project_ref === `PRJ-${selectedProject}`;
        if (!matchesProj) return false;
      }
      if (statusFilter !== 'ALL' && item.status !== statusFilter) {
        return false;
      }
      if (selectedClassification !== 'ALL' && item.classification !== selectedClassification) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesSerial = item.serial_number?.toLowerCase().includes(q);
        const matchesSubject = item.subject?.toLowerCase().includes(q);
        const matchesExt = item.external_ref_no?.toLowerCase().includes(q);
        const matchesSender = item.sender_entity?.toLowerCase().includes(q);
        return matchesSerial || matchesSubject || matchesExt || matchesSender;
      }
      return true;
    });
  }, [inbounds, selectedProject, statusFilter, selectedClassification, searchQuery]);

  const pendingCount = inbounds.filter(c => c.status === 'Pending').length;
  const repliedCount = inbounds.filter(c => c.status === 'Replied').length;
  const urgentCount = inbounds.filter(c => c.priority === 'Urgent' || c.priority === 'Critical').length;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Top Banner & Telemetry Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-3xl bg-[#FFFDF9] dark:bg-[#0D1F17] border border-amber-200/60 dark:border-amber-500/30 shadow-sm">
          <div className="flex items-center justify-between text-sky-600 dark:text-sky-400 text-xs mb-1">
            <span className="font-bold">إجمالي الوارد</span>
            <Inbox className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-stone-900 dark:text-stone-100 font-mono">{inbounds.length}</p>
        </div>

        <div className="p-4 rounded-3xl bg-[#FFFDF9] dark:bg-[#0D1F17] border border-amber-200/60 dark:border-amber-500/30 shadow-sm">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 text-xs mb-1">
            <span className="font-bold">بانتظار الرد (قيد المتابعة)</span>
            <Clock className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">{pendingCount}</p>
        </div>

        <div className="p-4 rounded-3xl bg-[#FFFDF9] dark:bg-[#0D1F17] border border-amber-200/60 dark:border-amber-500/30 shadow-sm">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 text-xs mb-1">
            <span className="font-bold">تم الرد وإغلاق الدورة</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">{repliedCount}</p>
        </div>

        <div className="p-4 rounded-3xl bg-[#FFFDF9] dark:bg-[#0D1F17] border border-amber-200/60 dark:border-amber-500/30 shadow-sm">
          <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 text-xs mb-1">
            <span className="font-bold">عاجل / حرج جداً</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">{urgentCount}</p>
        </div>
      </div>

      {/* Action & Filter Toolbar */}
      <div className="p-5 rounded-3xl bg-[#FFFDF9] dark:bg-[#0D1F17] border border-amber-200/60 dark:border-amber-500/30 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <Inbox className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                منصة قيد واستلام المكاتبات الواردة (Inbound Intake)
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                فحص تطابق أرقام المراجع الخارجية، منع التكرار، وربط الوارد بالردود المعتمدة
              </p>
            </div>
          </div>

          <button
            onClick={onOpenIntakeModal}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-2xl bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 text-white shadow-md shadow-sky-600/25 transition"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل وارد جديد (Intake)</span>
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-stone-100 dark:border-stone-800 text-xs">
          <div className="relative">
            <Search className="w-4 h-4 absolute right-3.5 top-2.5 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالرقم، الموضوع، أو الجهة الراسلة..."
              className="w-full pr-10 pl-3 py-2 text-xs bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-sky-500 outline-none"
            />
          </div>

          <div>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-sky-500 outline-none font-medium"
            >
              <option value="ALL">كافة المشاريع الهندسية</option>
              {projects.map(p => (
                <option key={p.project_id} value={p.project_id}>
                  [{p.project_code}] {p.project_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-sky-500 outline-none font-medium"
            >
              <option value="ALL">كافة الحالات</option>
              <option value="Pending">بانتظار الرد (Pending)</option>
              <option value="Replied">تم الرد (Replied)</option>
            </select>
          </div>

          <div>
            <select
              value={selectedClassification}
              onChange={(e) => setSelectedClassification(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-sky-500 outline-none font-medium"
            >
              <option value="ALL">كافة التصنيفات الهندسية</option>
              <option value="LTR">LTR - خطاب رسمي</option>
              <option value="SUB">SUB - تقديم فني</option>
              <option value="IPC">IPC - مستخلص مالي</option>
              <option value="MOM">MOM - محضر اجتماع</option>
              <option value="RFI">RFI - استفسار فني</option>
              <option value="NCR">NCR - عدم مطابقة</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inbounds Table */}
      <div className="p-5 rounded-3xl bg-[#FFFDF9] dark:bg-[#0D1F17] border border-amber-200/60 dark:border-amber-500/30 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400 text-[11px]">
                <th className="py-2.5 px-3">رقم القيد الوارد</th>
                <th className="py-2.5 px-3">التصنيف</th>
                <th className="py-2.5 px-3">المرجع الخارجي</th>
                <th className="py-2.5 px-3">الموضوع والبيان</th>
                <th className="py-2.5 px-3">الجهة الراسلة</th>
                <th className="py-2.5 px-3">الأولوية</th>
                <th className="py-2.5 px-3">تاريخ الاستلام</th>
                <th className="py-2.5 px-3">الحالة</th>
                <th className="py-2.5 px-3 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {filteredInbounds.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-xs text-stone-400">
                    لا توجد مكاتبات واردة تطابق خيارات التصفية الحالية.
                  </td>
                </tr>
              ) : (
                filteredInbounds.map((doc) => {
                  const statusCfg = getStatusBadge(doc.status);
                  const priorityCfg = getPriorityBadge(doc.priority);

                  return (
                    <tr key={doc.doc_id} className="hover:bg-stone-50 dark:hover:bg-stone-900/50 transition">
                      <td className="py-3 px-3 font-mono font-bold text-sky-600 dark:text-sky-400 whitespace-nowrap">
                        {doc.serial_number}
                      </td>
                      <td className="py-3 px-3 font-semibold text-stone-700 dark:text-stone-300 whitespace-nowrap">
                        {getDocTypeLabel(doc.classification)}
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-stone-500 whitespace-nowrap">
                        {doc.external_ref_no || '—'}
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
                        {doc.sender_entity}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${priorityCfg.classes}`}>
                          {priorityCfg.label}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-stone-500 whitespace-nowrap">
                        {doc.received_date || doc.issue_date || '—'}
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

                          {doc.status !== 'Replied' && (
                            <button
                              onClick={() => onReplyToInbound(doc)}
                              className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-sky-500 hover:bg-sky-600 text-white transition flex items-center gap-1 shadow-sm"
                            >
                              <Reply className="w-3 h-3" />
                              <span>إعداد الرد</span>
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
