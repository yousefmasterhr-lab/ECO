// ====================================================================
// ECO ERP - Project Correspondence Management System (CTS / PCMS)
// Engineering Project Detailed Overview Modal
// ====================================================================

import React, { useState, useEffect } from 'react';
import { Project, Correspondence } from './types';
import { ctsStorage } from '../../../services/ctsStorage';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  DollarSign, 
  ShieldCheck, 
  Inbox, 
  Send, 
  CheckCircle2, 
  Clock, 
  History,
  Edit3,
  X
} from 'lucide-react';

interface ProjectDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onOpenTimeline: (project: Project) => void;
  onEditProject: (project: Project) => void;
}

export const ProjectDetailsModal: React.FC<ProjectDetailsModalProps> = ({
  isOpen,
  onClose,
  project,
  onOpenTimeline,
  onEditProject
}) => {
  const [projectDocs, setProjectDocs] = useState<Correspondence[]>([]);

  useEffect(() => {
    if (isOpen && project) {
      ctsStorage.getCorrespondences().then(all => {
        const matching = all.filter(
          c => c.project_ref === project.project_id || c.project_ref === project.project_code
        );
        setProjectDocs(matching);
      });
    }
  }, [isOpen, project]);

  if (!isOpen || !project) return null;

  const inboundsCount = projectDocs.filter(c => c.doc_type === 'Incoming').length;
  const outboundsCount = projectDocs.filter(c => c.doc_type === 'Outgoing').length;
  const approvedCount = projectDocs.filter(c => c.status === 'Approved' || c.status === 'Replied').length;
  const pendingCount = projectDocs.filter(c => c.status === 'Pending' || c.status === 'Draft').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl my-auto rounded-3xl bg-white dark:bg-[#0E1A11] border border-stone-200 dark:border-amber-500/20 shadow-2xl p-6 text-stone-900 dark:text-stone-100 overflow-hidden"
        dir="rtl"
      >
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  {project.project_code}
                </span>
                <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                  {project.project_name}
                </h3>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                بطاقة المشروع الهندسية وإحصائيات دورة المراسلات
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

        {/* Telemetry Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
          <div className="p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/40">
            <div className="flex items-center justify-between text-sky-600 dark:text-sky-400 text-xs mb-1">
              <span className="font-medium">المكاتبات الواردة</span>
              <Inbox className="w-4 h-4" />
            </div>
            <p className="text-xl font-black text-sky-900 dark:text-sky-200 font-mono">{inboundsCount}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40">
            <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 text-xs mb-1">
              <span className="font-medium">الخطابات الصادرة</span>
              <Send className="w-4 h-4" />
            </div>
            <p className="text-xl font-black text-amber-900 dark:text-amber-200 font-mono">{outboundsCount}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40">
            <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 text-xs mb-1">
              <span className="font-medium">معتمدة ومغلقة</span>
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <p className="text-xl font-black text-emerald-900 dark:text-emerald-200 font-mono">{approvedCount}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-stone-100 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700">
            <div className="flex items-center justify-between text-stone-600 dark:text-stone-400 text-xs mb-1">
              <span className="font-medium">قيد المراجعة</span>
              <Clock className="w-4 h-4" />
            </div>
            <p className="text-xl font-black text-stone-900 dark:text-stone-200 font-mono">{pendingCount}</p>
          </div>
        </div>

        {/* Stakeholders Card */}
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 space-y-3">
            <h4 className="text-xs font-bold text-amber-600 dark:text-amber-400">الأطراف الرئيسية للمشروع</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-stone-400 block text-[11px]">المالك:</span>
                <span className="font-semibold text-stone-800 dark:text-stone-200">{project.client_name}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[11px]">الاستشاري:</span>
                <span className="font-semibold text-stone-800 dark:text-stone-200">{project.consultant_name}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[11px]">المقاول العام:</span>
                <span className="font-semibold text-stone-800 dark:text-stone-200">{project.contractor_name}</span>
              </div>
            </div>
          </div>

          {/* Details & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 space-y-2">
              <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400">
                <MapPin className="w-4 h-4 text-amber-500" />
                <span>الموقع:</span>
                <span className="font-semibold text-stone-800 dark:text-stone-200">{project.location || 'غير محدد'}</span>
              </div>
              <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400">
                <Calendar className="w-4 h-4 text-amber-500" />
                <span>تاريخ البدء:</span>
                <span className="font-mono text-stone-800 dark:text-stone-200">{project.start_date || '—'}</span>
              </div>
              <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400">
                <Calendar className="w-4 h-4 text-amber-500" />
                <span>التسليم المتوقع:</span>
                <span className="font-mono text-stone-800 dark:text-stone-200">{project.end_date || '—'}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 space-y-2">
              <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                <span>الميزانية المقدرة:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {project.total_budget ? `${project.total_budget.toLocaleString()} ${project.currency || 'EGP'}` : 'غير محددة'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400">
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                <span>حالة المشروع:</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  {project.project_status === 'Active' ? 'قيد التنفيذ' : project.project_status}
                </span>
              </div>
            </div>
          </div>

          {project.scope_of_work && (
            <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 text-xs">
              <span className="font-bold text-stone-700 dark:text-stone-300 block mb-1">نطاق الأعمال:</span>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed">{project.scope_of_work}</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 pt-5 border-t border-stone-200 dark:border-stone-800 mt-5">
          <button
            type="button"
            onClick={() => onOpenTimeline(project)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-amber-500 hover:text-stone-900 text-stone-800 dark:text-stone-200 transition"
          >
            <History className="w-4 h-4 text-amber-500" />
            <span>عرض الخط الزمني للمراسلات ({projectDocs.length})</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => onEditProject(project)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-500" />
              <span>تعديل</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-900 transition font-bold"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
