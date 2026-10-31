// ====================================================================
// ECO ERP - Project Correspondence Management System (CTS / PCMS)
// Projects & Stakeholder Entities Directory Hub (Tab 2)
// ====================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { Project, Entity, Correspondence } from './types';
import { ctsStorage } from '../../../services/ctsStorage';
import { ProjectFormModal } from './ProjectFormModal';
import { EntityFormModal } from './EntityFormModal';
import { ProjectDetailsModal } from './ProjectDetailsModal';
import { ProjectTimelineModal } from './ProjectTimelineModal';
import { 
  Building2, 
  ShieldCheck, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Eye, 
  History
} from 'lucide-react';

interface CTSProjectsTabProps {
  onOpenDocDossier?: (doc: Correspondence) => void;
}

export const CTSProjectsTab: React.FC<CTSProjectsTabProps> = ({ onOpenDocDossier }) => {
  const [activeSubTab, setActiveSubTab] = useState<'projects' | 'entities'>('projects');
  const [projects, setProjects] = useState<Project[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Modals state
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [selectedProjectForEdit, setSelectedProjectForEdit] = useState<Project | null>(null);

  const [isEntityModalOpen, setIsEntityModalOpen] = useState(false);
  const [selectedEntityForEdit, setSelectedEntityForEdit] = useState<Entity | null>(null);

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedProjectForDetails, setSelectedProjectForDetails] = useState<Project | null>(null);

  const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false);
  const [selectedProjectForTimeline, setSelectedProjectForTimeline] = useState<Project | null>(null);

  const loadData = async () => {
    const p = await ctsStorage.getProjects();
    setProjects(p);
    const e = await ctsStorage.getEntities();
    setEntities(e);
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('eco-cts-updated', handleUpdate);
    return () => window.removeEventListener('eco-cts-updated', handleUpdate);
  }, []);

  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;
    const q = searchQuery.toLowerCase();
    return projects.filter(p => 
      p.project_name.toLowerCase().includes(q) ||
      p.project_code.toLowerCase().includes(q) ||
      p.client_name?.toLowerCase().includes(q) ||
      p.consultant_name?.toLowerCase().includes(q) ||
      p.contractor_name?.toLowerCase().includes(q)
    );
  }, [projects, searchQuery]);

  const filteredEntities = useMemo(() => {
    return entities.filter(e => {
      const matchRole = roleFilter === 'ALL' || e.role === roleFilter;
      const q = searchQuery.toLowerCase();
      const matchSearch = !searchQuery.trim() ||
        e.name.toLowerCase().includes(q) ||
        e.code.toLowerCase().includes(q) ||
        e.contact_person?.toLowerCase().includes(q);
      return matchRole && matchSearch;
    });
  }, [entities, searchQuery, roleFilter]);

  const handleDeleteProject = async (projectId: string, name: string) => {
    if (window.confirm(`هل أنت متأكد من حذف المشروع الهندسي [${name}]؟`)) {
      await ctsStorage.deleteProject(projectId);
      loadData();
    }
  };

  const handleDeleteEntity = async (entityId: string, name: string) => {
    if (window.confirm(`هل أنت متأكد من حذف الجهة [${name}]؟`)) {
      await ctsStorage.deleteEntity(entityId);
      loadData();
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Modals */}
      <ProjectFormModal
        isOpen={isProjectModalOpen}
        onClose={() => {
          setIsProjectModalOpen(false);
          setSelectedProjectForEdit(null);
        }}
        onSaved={loadData}
        existingProject={selectedProjectForEdit}
      />

      <EntityFormModal
        isOpen={isEntityModalOpen}
        onClose={() => {
          setIsEntityModalOpen(false);
          setSelectedEntityForEdit(null);
        }}
        onSaved={loadData}
        existingEntity={selectedEntityForEdit}
      />

      <ProjectDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedProjectForDetails(null);
        }}
        project={selectedProjectForDetails}
        onOpenTimeline={(p) => {
          setIsDetailsModalOpen(false);
          setSelectedProjectForTimeline(p);
          setIsTimelineModalOpen(true);
        }}
        onEditProject={(p) => {
          setIsDetailsModalOpen(false);
          setSelectedProjectForEdit(p);
          setIsProjectModalOpen(true);
        }}
      />

      <ProjectTimelineModal
        isOpen={isTimelineModalOpen}
        onClose={() => {
          setIsTimelineModalOpen(false);
          setSelectedProjectForTimeline(null);
        }}
        project={selectedProjectForTimeline}
        onOpenDocDossier={onOpenDocDossier || (() => {})}
      />

      {/* Header & Sub-Tab Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-3xl bg-[#FFFDF9] dark:bg-[#0D1F17] border border-amber-200/60 dark:border-amber-500/30 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveSubTab('projects');
              setSearchQuery('');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition ${
              activeSubTab === 'projects'
                ? 'bg-amber-500 text-stone-900 shadow-md shadow-amber-500/20'
                : 'bg-amber-100/40 dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>المشاريع الهندسية ({projects.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveSubTab('entities');
              setSearchQuery('');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition ${
              activeSubTab === 'entities'
                ? 'bg-amber-500 text-stone-900 shadow-md shadow-amber-500/20'
                : 'bg-amber-100/40 dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>سجل الجهات والشركاء ({entities.length})</span>
          </button>
        </div>

        {/* Action Button */}
        {activeSubTab === 'projects' ? (
          <button
            onClick={() => {
              setSelectedProjectForEdit(null);
              setIsProjectModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-2xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white shadow-md shadow-amber-500/25 transition"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة مشروع هندسي</span>
          </button>
        ) : (
          <button
            onClick={() => {
              setSelectedEntityForEdit(null);
              setIsEntityModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-2xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white shadow-md shadow-amber-500/25 transition"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل جهة جديدة</span>
          </button>
        )}
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-3xl bg-[#FFFDF9] dark:bg-[#0D1F17] border border-amber-200/60 dark:border-amber-500/30 shadow-sm text-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute right-3.5 top-2.5 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeSubTab === 'projects'
                ? 'ابحث باسم المشروع، الكود، الاستشاري، المقاول، أو المالك...'
                : 'ابحث باسم الجهة، الرمز المختصر، أو مسؤول التواصل...'
            }
            className="w-full pr-10 pl-4 py-2 text-xs bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 outline-none"
          />
        </div>

        {activeSubTab === 'entities' && (
          <div className="flex items-center gap-2">
            <span className="text-stone-400">التصنيف:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-1.5 text-xs bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-800 dark:text-stone-200 outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="ALL">كافة الأدوار والجهات</option>
              <option value="Consultant">استشاري (Consultant)</option>
              <option value="Owner">المالك (Owner)</option>
              <option value="Main_Contractor">مقاول رئيسي (Contractor)</option>
              <option value="Subcontractor">مقاول باطن</option>
              <option value="Supplier">مورد معتمد</option>
              <option value="Authority">جهة حكومية / رقابية</option>
            </select>
          </div>
        )}
      </div>

      {/* Content Section: Projects Cards */}
      {activeSubTab === 'projects' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((p) => (
            <div
              key={p.project_id}
              className="p-5 rounded-3xl bg-[#FFFDF9] dark:bg-[#0D1F17] border border-amber-200/60 dark:border-amber-500/30 shadow-sm hover:border-amber-500/50 transition flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    {p.project_code}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    {p.project_status === 'Active' ? 'قيد التنفيذ' : p.project_status}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 line-clamp-2 leading-snug">
                  {p.project_name}
                </h4>

                <div className="mt-3 space-y-1.5 text-xs text-stone-600 dark:text-stone-400">
                  <div className="flex items-center justify-between">
                    <span className="text-stone-400 text-[11px]">المالك:</span>
                    <span className="font-semibold text-stone-800 dark:text-stone-200 truncate max-w-[170px]">{p.client_name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-400 text-[11px]">الاستشاري:</span>
                    <span className="font-semibold text-stone-800 dark:text-stone-200 truncate max-w-[170px]">{p.consultant_name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-400 text-[11px]">المقاول:</span>
                    <span className="font-semibold text-stone-800 dark:text-stone-200 truncate max-w-[170px]">{p.contractor_name}</span>
                  </div>
                  {p.total_budget && (
                    <div className="flex items-center justify-between pt-1.5 border-t border-stone-100 dark:border-stone-800">
                      <span className="text-stone-400 text-[11px]">الميزانية:</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {p.total_budget.toLocaleString()} {p.currency || 'EGP'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                <button
                  onClick={() => {
                    setSelectedProjectForDetails(p);
                    setIsDetailsModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-stone-900 text-xs font-bold transition"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>تفاصيل</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setSelectedProjectForTimeline(p);
                      setIsTimelineModalOpen(true);
                    }}
                    title="الخط الزمني للمراسلات"
                    className="p-2 rounded-xl text-stone-400 hover:text-amber-500 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
                  >
                    <History className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedProjectForEdit(p);
                      setIsProjectModalOpen(true);
                    }}
                    title="تعديل"
                    className="p-2 rounded-xl text-stone-400 hover:text-amber-500 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteProject(p.project_id, p.project_name)}
                    title="حذف"
                    className="p-2 rounded-xl text-stone-400 hover:text-rose-500 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Content Section: Entities Directory Table */}
      {activeSubTab === 'entities' && (
        <div className="p-5 rounded-3xl bg-[#FFFDF9] dark:bg-[#0D1F17] border border-amber-200/60 dark:border-amber-500/30 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400 text-[11px]">
                  <th className="py-2.5 px-3">الكود</th>
                  <th className="py-2.5 px-3">اسم الجهة</th>
                  <th className="py-2.5 px-3">الصفة الهندسية</th>
                  <th className="py-2.5 px-3">مسؤول التواصل</th>
                  <th className="py-2.5 px-3">الهاتف</th>
                  <th className="py-2.5 px-3">البريد</th>
                  <th className="py-2.5 px-3 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {filteredEntities.map((ent) => (
                  <tr key={ent.id} className="hover:bg-stone-50 dark:hover:bg-stone-900/50 transition">
                    <td className="py-3 px-3 font-mono font-bold text-amber-600 dark:text-amber-400">
                      {ent.code}
                    </td>
                    <td className="py-3 px-3 font-semibold text-stone-900 dark:text-stone-100">
                      {ent.name}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        {ent.role === 'Consultant' ? 'استشاري' : ent.role === 'Owner' ? 'المالك' : ent.role === 'Main_Contractor' ? 'مقاول رئيسي' : ent.role}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-stone-700 dark:text-stone-300">
                      {ent.contact_person || '—'}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-stone-500">
                      {ent.phone || '—'}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-stone-500">
                      {ent.email || '—'}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedEntityForEdit(ent);
                            setIsEntityModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-amber-500 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteEntity(ent.id, ent.name)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-rose-500 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
