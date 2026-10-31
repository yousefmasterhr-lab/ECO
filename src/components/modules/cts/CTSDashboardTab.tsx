// ====================================================================
// ECO ERP - Project Correspondence Management System (CTS / PCMS)
// Executive Dashboard & Telemetry Analytics Hub (Tab 1)
// ====================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { Correspondence, Project, CTSSummaryStats } from './types';
import { ctsStorage } from '../../../services/ctsStorage';
import { getDocTypeLabel, getStatusBadge } from './formatters';
import { 
  Inbox, 
  Send, 
  Clock, 
  Building2,
  TrendingUp,
  BarChart3,
  Activity,
  Layers,
  ChevronRight,
  Eye
} from 'lucide-react';

interface CTSDashboardTabProps {
  onNavigateTab: (tabId: string) => void;
  onOpenInbound: () => void;
  onOpenOutbound: () => void;
  onSelectDoc: (doc: Correspondence) => void;
}

export const CTSDashboardTab: React.FC<CTSDashboardTabProps> = ({
  onNavigateTab,
  onOpenInbound,
  onOpenOutbound,
  onSelectDoc
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('ALL');
  const [correspondences, setCorrespondences] = useState<Correspondence[]>([]);
  const [stats, setStats] = useState<CTSSummaryStats>({
    totalLetters: 0,
    inboundCount: 0,
    outboundCount: 0,
    draftsCount: 0,
    replyRate: 100,
    activeProjectsCount: 0,
    total_correspondences: 0,
    total_inbound: 0,
    total_outbound: 0,
    total_drafts: 0,
    total_pending_approval: 0,
    total_approved: 0,
    total_replied: 0,
    total_overdue: 0,
    average_reply_time_days: 2.8,
  });

  const loadData = async () => {
    const p = await ctsStorage.getProjects();
    setProjects(p);
    const docs = await ctsStorage.getCorrespondences();
    setCorrespondences(docs);
    const s = await ctsStorage.getStats();
    setStats(s);
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('eco-cts-updated', handleUpdate);
    return () => window.removeEventListener('eco-cts-updated', handleUpdate);
  }, []);

  const filteredDocs = useMemo(() => {
    if (selectedProjectId === 'ALL') return correspondences;
    return correspondences.filter(
      c => c.project_ref === selectedProjectId || c.project_ref === `PRJ-${selectedProjectId}`
    );
  }, [correspondences, selectedProjectId]);

  const activeProject = useMemo(() => {
    if (selectedProjectId === 'ALL') {
      return projects[0] || null;
    }
    return projects.find(p => p.project_id === selectedProjectId || p.project_code === selectedProjectId) || null;
  }, [projects, selectedProjectId]);

  // Compute breakdown for classifications
  const classificationCounts = useMemo(() => {
    const map: Record<string, number> = {
      LTR: 0,
      SUB: 0,
      IPC: 0,
      MOM: 0,
      RFI: 0,
      TRANS: 0,
    };
    filteredDocs.forEach(d => {
      const cls = d.classification || 'LTR';
      if (map[cls] !== undefined) map[cls]++;
      else map.LTR++;
    });
    return map;
  }, [filteredDocs]);

  const recentDocs = useMemo(() => {
    return [...filteredDocs]
      .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())
      .slice(0, 6);
  }, [filteredDocs]);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Top Filter Bar with Project Context */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-3xl bg-[#FFFDF9] dark:bg-[#0D1F17] border border-amber-200/60 dark:border-amber-500/30 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-stone-500 dark:text-stone-400 block">نطاق عرض التحليلات والمشروع النشط:</span>
            <div className="flex items-center gap-2 mt-0.5">
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="text-xs font-bold bg-stone-100 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl px-3 py-1.5 text-stone-800 dark:text-stone-100 outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="ALL">كافة المشاريع الهندسية المسجلة (عرض مجمّع)</option>
                {projects.map(p => (
                  <option key={p.project_id} value={p.project_id}>
                    [{p.project_code}] {p.project_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenInbound}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 hover:bg-sky-100 transition shadow-sm"
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>تسجيل وارد جديد</span>
          </button>
          <button
            onClick={onOpenOutbound}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white shadow-md shadow-amber-500/25 transition"
          >
            <Send className="w-3.5 h-3.5" />
            <span>تحرير صادر جديد</span>
          </button>
        </div>
      </div>

      {/* KPI 4-Card Luxury Telemetry */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Letters */}
        <div className="relative p-5 rounded-3xl bg-[#FFFDF9] dark:bg-[#0D1F17] border border-amber-200/60 dark:border-amber-500/30 shadow-sm overflow-hidden group hover:border-amber-500/50 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-stone-500 dark:text-stone-400">إجمالي المكاتبات</span>
            <div className="p-2 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-stone-900 dark:text-stone-100 font-mono">
              {stats.total_correspondences}
            </span>
            <span className="text-xs text-stone-400">مكاتبة موثقة</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] pt-2 border-t border-amber-200/40 dark:border-stone-800 text-stone-500">
            <span>معدل النشاط الشهري</span>
            <span className="text-emerald-500 font-bold flex items-center gap-1 font-mono">
              <TrendingUp className="w-3 h-3" /> +18.4%
            </span>
          </div>
        </div>

        {/* Card 2: Inbounds Intake */}
        <div className="relative p-5 rounded-3xl bg-[#FFFDF9] dark:bg-[#0D1F17] border border-amber-200/60 dark:border-amber-500/30 shadow-sm overflow-hidden group hover:border-sky-500/50 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-sky-600 dark:text-sky-400">المكاتبات الواردة</span>
            <div className="p-2 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <Inbox className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-sky-700 dark:text-sky-300 font-mono">
              {stats.total_inbound}
            </span>
            <span className="text-xs text-stone-400">وارد معتمد</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] pt-2 border-t border-amber-200/40 dark:border-stone-800 text-stone-500">
            <span>تم الرد عليها</span>
            <span className="text-sky-600 dark:text-sky-400 font-bold font-mono">
              {stats.total_replied} ({stats.total_inbound ? Math.round((stats.total_replied / stats.total_inbound) * 100) : 100}%)
            </span>
          </div>
        </div>

        {/* Card 3: Outbounds Issued */}
        <div className="relative p-5 rounded-3xl bg-[#FFFDF9] dark:bg-[#0D1F17] border border-amber-200/60 dark:border-amber-500/30 shadow-sm overflow-hidden group hover:border-amber-500/50 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">الخطابات الصادرة</span>
            <div className="p-2 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Send className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-600 dark:text-amber-400 font-mono">
              {stats.total_outbound}
            </span>
            <span className="text-xs text-stone-400">صادر موثق</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] pt-2 border-t border-amber-200/40 dark:border-stone-800 text-stone-500">
            <span>مسودات قيد الاعتماد</span>
            <span className="text-amber-600 dark:text-amber-400 font-bold font-mono">
              {stats.total_drafts} مسودة
            </span>
          </div>
        </div>

        {/* Card 4: Quality & SLA */}
        <div className="relative p-5 rounded-3xl bg-[#FFFDF9] dark:bg-[#0D1F17] border border-amber-200/60 dark:border-amber-500/30 shadow-sm overflow-hidden group hover:border-emerald-500/50 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">سرعة الرد ودقة الإغلاق</span>
            <div className="p-2 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {stats.average_reply_time_days || 2.8}
            </span>
            <span className="text-xs text-stone-400">أيام كمتوسط للرد</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] pt-2 border-t border-amber-200/40 dark:border-stone-800 text-stone-500">
            <span>متأخرة عن المدة المحددة</span>
            <span className={`font-bold font-mono ${stats.total_overdue > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
              {stats.total_overdue} معاملات
            </span>
          </div>
        </div>
      </div>

      {/* Middle Row: Active Project Showcase & Classification Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Card */}
        {activeProject && (
          <div className="lg:col-span-1 p-6 rounded-3xl bg-[#FFFDF9] dark:bg-[#0D1F17] border border-amber-200/60 dark:border-amber-500/30 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold text-stone-500 dark:text-stone-400">المشروع الهندسي الرئيسي</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                {activeProject.project_code}
              </span>
            </div>

            <div>
              <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 leading-snug">
                {activeProject.project_name}
              </h4>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                {activeProject.location || 'جمهورية مصر العربية'}
              </p>
            </div>

            <div className="space-y-2 text-xs pt-3 border-t border-stone-100 dark:border-stone-800">
              <div className="flex items-center justify-between">
                <span className="text-stone-400">المالك:</span>
                <span className="font-semibold text-stone-800 dark:text-stone-200">{activeProject.client_name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-400">الاستشاري:</span>
                <span className="font-semibold text-stone-800 dark:text-stone-200">{activeProject.consultant_name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-400">المقاول:</span>
                <span className="font-semibold text-stone-800 dark:text-stone-200">{activeProject.contractor_name}</span>
              </div>
              {activeProject.total_budget && (
                <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800">
                  <span className="text-stone-400">الميزانية:</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {activeProject.total_budget.toLocaleString()} {activeProject.currency || 'EGP'}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={() => onNavigateTab('cts_projects')}
              className="w-full mt-3 py-2 text-xs font-bold rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-amber-500 hover:text-stone-900 text-stone-800 dark:text-stone-200 transition flex items-center justify-center gap-1.5"
            >
              <span>دليل المشاريع والجهات</span>
              <ChevronRight className="w-4 h-4 rotate-180" />
            </button>
          </div>
        )}

        {/* Classification Breakdown */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-[#FFFDF9] dark:bg-[#0D1F17] border border-amber-200/60 dark:border-amber-500/30 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-amber-500" />
              <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                توزيع المراسلات حسب التصنيف الهندسي (Doc Type)
              </h4>
            </div>
            <span className="text-xs text-stone-400">إجمالي {filteredDocs.length} معاملة</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            {[
              { code: 'LTR', label: 'خطابات رسمية', count: classificationCounts.LTR, color: 'border-amber-500 text-amber-600 dark:text-amber-400' },
              { code: 'SUB', label: 'تقديم واعتماد فني', count: classificationCounts.SUB, color: 'border-sky-500 text-sky-600 dark:text-sky-400' },
              { code: 'IPC', label: 'مستخلصات مالية', count: classificationCounts.IPC, color: 'border-emerald-500 text-emerald-600 dark:text-emerald-400' },
              { code: 'MOM', label: 'محاضر اجتماعات', count: classificationCounts.MOM, color: 'border-indigo-500 text-indigo-600 dark:text-indigo-400' },
              { code: 'RFI', label: 'استفسارات وملاحظات', count: classificationCounts.RFI, color: 'border-rose-500 text-rose-600 dark:text-rose-400' },
              { code: 'TRANS', label: 'مذكرات إرسال وتسليم', count: classificationCounts.TRANS, color: 'border-purple-500 text-purple-600 dark:text-purple-400' },
            ].map((cls) => (
              <div
                key={cls.code}
                className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 space-y-1"
              >
                <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400">
                  <span className="font-mono font-bold">{cls.code}</span>
                  <span className={`text-base font-black font-mono ${cls.color}`}>{cls.count}</span>
                </div>
                <p className="text-xs font-semibold text-stone-800 dark:text-stone-200 truncate">{cls.label}</p>
              </div>
            ))}
          </div>

          {/* Quick Nav Shortcut */}
          <div className="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-stone-800 text-xs text-stone-500">
            <span>تتبع دورات الرد والمستندات المرتبطة بنظام الشجرة الهندسية</span>
            <button
              onClick={() => onNavigateTab('cts_correspondences')}
              className="text-amber-600 dark:text-amber-400 font-bold hover:underline flex items-center gap-1"
            >
              <span>فتح السجل العام الموحد</span>
              <ChevronRight className="w-3.5 h-3.5 rotate-180" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Correspondences Table */}
      <div className="p-6 rounded-3xl bg-[#FFFDF9] dark:bg-[#0D1F17] border border-amber-200/60 dark:border-amber-500/30 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-amber-500" />
            <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
              آخر المعاملات والمكاتبات المسجلة في النظام
            </h4>
          </div>
          <button
            onClick={() => onNavigateTab('cts_correspondences')}
            className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
          >
            <span>عرض كافة المعاملات ({filteredDocs.length})</span>
            <ChevronRight className="w-3.5 h-3.5 rotate-180" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400 text-[11px]">
                <th className="py-2.5 px-3">الرقم المرجعي</th>
                <th className="py-2.5 px-3">الاتجاه</th>
                <th className="py-2.5 px-3">التصنيف</th>
                <th className="py-2.5 px-3">الموضوع والبيان</th>
                <th className="py-2.5 px-3">الجهة الراسلة</th>
                <th className="py-2.5 px-3">التاريخ</th>
                <th className="py-2.5 px-3">الحالة</th>
                <th className="py-2.5 px-3 text-center">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {recentDocs.map((doc) => {
                const isInbound = doc.doc_type === 'Incoming';
                const statusCfg = getStatusBadge(doc.status);

                return (
                  <tr key={doc.doc_id} className="hover:bg-stone-50 dark:hover:bg-stone-900/50 transition">
                    <td className="py-3 px-3 font-mono font-bold text-amber-600 dark:text-amber-400">
                      {doc.serial_number}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                        isInbound ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      }`}>
                        {isInbound ? 'وارد' : 'صادر'}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-stone-700 dark:text-stone-300">
                      {getDocTypeLabel(doc.classification)}
                    </td>
                    <td className="py-3 px-3 font-medium text-stone-900 dark:text-stone-100 max-w-xs truncate">
                      {doc.subject}
                    </td>
                    <td className="py-3 px-3 text-stone-600 dark:text-stone-400 truncate max-w-[150px]">
                      {doc.sender_entity}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-stone-500">
                      {doc.issue_date || '—'}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${statusCfg.classes}`}>
                        {statusCfg.label}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => onSelectDoc(doc)}
                        className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-stone-900 transition flex items-center gap-1 mx-auto"
                      >
                        <Eye className="w-3 h-3" />
                        <span>فتح</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
