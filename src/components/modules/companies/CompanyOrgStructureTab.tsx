import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Network,
  LayoutGrid,
  Plus,
  Pencil,
  AlertCircle,
  Trash2,
  ChevronDown,
  ChevronUp,
  User,
  Building2,
  MapPin,
  X,
  Search,
  Filter,
  AlertTriangle,
  Layers,
  FolderTree,
  Check,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { DepartmentOrg, CompanyEntity, BranchLocation, DepartmentAuditLogEntry } from './types';
import { useAuth } from '../../../context/AuthContext';

interface CompanyOrgStructureTabProps {
  departments: DepartmentOrg[];
  companies: CompanyEntity[];
  branches: BranchLocation[];
  onAddDepartment: (dept: Partial<DepartmentOrg> & { nameAr: string; code: string }) => Promise<void> | void;
  onUpdateDepartment: (dept: Partial<DepartmentOrg> & { nameAr: string; code: string }) => Promise<void> | void;
  onDeleteDepartment: (id: string) => Promise<{ success: boolean; error?: string } | void> | void;
}

/**
 * Returns all descendant department IDs for circular reference prevention
 */
function getDescendantIds(deptId: string, departments: DepartmentOrg[]): Set<string> {
  const descendants = new Set<string>();
  function collect(id: string) {
    const children = departments.filter(d => d.parentId === id);
    for (const child of children) {
      descendants.add(child.id);
      collect(child.id);
    }
  }
  collect(deptId);
  return descendants;
}

export const CompanyOrgStructureTab: React.FC<CompanyOrgStructureTabProps> = ({
  departments,
  companies,
  branches,
  onAddDepartment,
  onUpdateDepartment,
  onDeleteDepartment
}) => {
  const { hasPermission } = useAuth();

  // Dual View Mode: 'tree' (الهيكل الشجري) vs 'cards' (البطاقات الذكية)
  const [activeView, setActiveView] = useState<'tree' | 'cards'>('tree');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('all');

  // Collapsed nodes state for Tree View (default empty = all expanded)
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());

  // Modal State: Add/Edit Department
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<DepartmentOrg | null>(null);
  const [prefilledParentId, setPrefilledParentId] = useState<string | null>(null);

  // Modal State: Audit Log Drawer
  const [auditModalDept, setAuditModalDept] = useState<DepartmentOrg | null>(null);

  // Modal State: Delete Confirmation / Safety Check
  const [deleteTargetDept, setDeleteTargetDept] = useState<DepartmentOrg | null>(null);

  // Toggle Collapse on a Node
  const handleToggleCollapse = (nodeId: string) => {
    setCollapsedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const handleExpandAll = () => setCollapsedNodes(new Set());
  const handleCollapseAll = () => {
    const allParentIds = new Set(departments.filter(d => departments.some(c => c.parentId === d.id)).map(d => d.id));
    setCollapsedNodes(allParentIds);
  };

  // Open Add Modal (Root or prefilled parent)
  const handleOpenAdd = (parentId: string | null = null) => {
    setEditingDept(null);
    setPrefilledParentId(parentId);
    setModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (dept: DepartmentOrg) => {
    setEditingDept(dept);
    setPrefilledParentId(null);
    setModalOpen(true);
  };

  // Open Audit Log
  const handleOpenAudit = (dept: DepartmentOrg) => {
    setAuditModalDept(dept);
  };

  // Open Delete Check Modal
  const handleOpenDelete = (dept: DepartmentOrg) => {
    setDeleteTargetDept(dept);
  };

  // Filtered departments based on company & search
  const filteredDepartments = useMemo(() => {
    return departments.filter(dept => {
      const matchCompany = selectedCompanyId === 'all' || dept.companyId === selectedCompanyId;
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        dept.nameAr.toLowerCase().includes(q) ||
        dept.code.toLowerCase().includes(q) ||
        (dept.headAr && dept.headAr.toLowerCase().includes(q)) ||
        (dept.costCenterCode && dept.costCenterCode.toLowerCase().includes(q)) ||
        (dept.companyNameAr && dept.companyNameAr.toLowerCase().includes(q)) ||
        (dept.branchNameAr && dept.branchNameAr.toLowerCase().includes(q));

      return matchCompany && matchSearch;
    });
  }, [departments, selectedCompanyId, searchQuery]);

  // Root departments for Tree View
  const rootDepartments = useMemo(() => {
    if (selectedCompanyId !== 'all') {
      // Find roots within the selected company or nodes without parent in this company
      const companyDepts = departments.filter(d => d.companyId === selectedCompanyId);
      return companyDepts.filter(d => !d.parentId || !companyDepts.some(p => p.id === d.parentId));
    }
    // All roots: no parentId or parentId not in existing departments
    return departments.filter(d => !d.parentId || !departments.some(p => p.id === d.parentId));
  }, [departments, selectedCompanyId]);

  return (
    <div className="space-y-4">
      {/* 1. Header Toolbar: Dual View Switcher, Search, Filter & Add Button */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#17231A] border border-slate-200 dark:border-[#243628] shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Dual View Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-[#1F2E23] border border-slate-200 dark:border-[#243628] shrink-0">
          <button
            onClick={() => setActiveView('tree')}
            className={`min-h-[40px] flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeView === 'tree'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-[#8FA392] hover:text-slate-900 dark:hover:text-[#F3EFE6]'
            }`}
            title="عرض الشجرة الهرمية التفاعلية"
          >
            <Network className="w-4 h-4" />
            <span>عرض الشجرة الهرمية</span>
          </button>

          <button
            onClick={() => setActiveView('cards')}
            className={`min-h-[40px] flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeView === 'cards'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-[#8FA392] hover:text-slate-900 dark:hover:text-[#F3EFE6]'
            }`}
            title="عرض البطاقات الذكية"
          >
            <LayoutGrid className="w-4 h-4" />
            <span>عرض البطاقات الذكية</span>
          </button>
        </div>

        {/* Search & Company Filter */}
        <div className="flex flex-1 flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#5C665E]" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="بحث بالاسم، الكود، المدير، أو كود مركز التكلفة..."
              className="w-full min-h-[40px] ps-9 pe-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#243628] bg-slate-50 dark:bg-[#0E1610] text-slate-900 dark:text-[#F3EFE6] text-xs focus:outline-none focus:border-amber-500 font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute end-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Company Filter Dropdown */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Filter className="w-3.5 h-3.5 text-slate-400 dark:text-[#5C665E]" />
            <select
              value={selectedCompanyId}
              onChange={e => setSelectedCompanyId(e.target.value)}
              className="min-h-[40px] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#243628] bg-slate-50 dark:bg-[#0E1610] text-slate-800 dark:text-[#F3EFE6] text-xs font-semibold focus:outline-none focus:border-amber-500"
            >
              <option value="all">جميع الشركات والمؤسسات</option>
              {companies.map(c => (
                <option key={c.id} value={c.id}>
                  {c.nameAr}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tree Expand/Collapse Controls & Add Department Button */}
        <div className="flex items-center gap-2 shrink-0">
          {activeView === 'tree' && departments.length > 0 && (
            <div className="flex items-center gap-1">
              <button
                onClick={handleExpandAll}
                className="min-h-[40px] px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-[#243628] bg-slate-50 dark:bg-[#1F2E23] text-slate-600 dark:text-[#8FA392] hover:text-slate-900 dark:hover:text-white text-xs font-semibold flex items-center gap-1"
                title="توسيع كافة الفروع"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">توسيع الكل</span>
              </button>
              <button
                onClick={handleCollapseAll}
                className="min-h-[40px] px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-[#243628] bg-slate-50 dark:bg-[#1F2E23] text-slate-600 dark:text-[#8FA392] hover:text-slate-900 dark:hover:text-white text-xs font-semibold flex items-center gap-1"
                title="طي كافة الفروع"
              >
                <Minimize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">طي الكل</span>
              </button>
            </div>
          )}

          {hasPermission('companies.org.create') && (
            <button
              onClick={() => handleOpenAdd(null)}
              className="min-h-[40px] flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>+ إضافة إدارة جديدة</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Empty State View */}
      {departments.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border-2 border-dashed border-slate-300 dark:border-[#243628] bg-white dark:bg-[#17231A]">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center mb-4">
            <FolderTree className="w-8 h-8" />
          </div>
          <h3 className="text-base font-black text-slate-900 dark:text-[#F3EFE6] mb-2">
            لم يتم إنشاء الهيكل التنظيمي بعد
          </h3>
          <p className="text-xs text-slate-500 dark:text-[#8FA392] max-w-md mx-auto mb-5 leading-relaxed">
            ابدأ بتأسيس الإدارة العليا أو الإدارة الأولى لربط الفروع، الكوادر الإدارية، ومراكز التكلفة الهيكلية بسهولة.
          </p>
          {hasPermission('companies.org.create') && (
            <button
              onClick={() => handleOpenAdd(null)}
              className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>تأسيس الإدارة الأولى بالهيكل التنظيمي</span>
            </button>
          )}
        </div>
      ) : (
        <>
          {/* 3. Tree View Display */}
          {activeView === 'tree' && (
            <div className="p-4 sm:p-6 rounded-2xl bg-slate-50/80 dark:bg-[#0E1610] border border-slate-200 dark:border-[#243628] overflow-x-auto min-h-[550px] shadow-inner">
              <div className="mb-4 flex items-center justify-between text-xs text-slate-500 dark:text-[#8FA392]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-semibold">
                    شجرة الهيكل التنظيمي التفاعلية ({departments.length} إدارة وقسم مسجل)
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 dark:text-[#5C665E]">
                  يمكنك التمرير أفقياً واستخدام أزرار التوسيع والطي (+) لاستكشاف الفروع
                </span>
              </div>

              {/* Render Root Nodes with Org Connectors */}
              <div className="flex flex-col items-center gap-10 min-w-max pb-12 pt-2">
                {rootDepartments.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    لا توجد إدارات تطابق شروط الفلترة أو البحث المحددة
                  </div>
                ) : (
                  <div className="flex items-start justify-center gap-12">
                    {rootDepartments.map(rootDept => (
                      <OrgTreeNode
                        key={rootDept.id}
                        department={rootDept}
                        allDepartments={departments}
                        collapsedNodes={collapsedNodes}
                        onToggleCollapse={handleToggleCollapse}
                        onAddSubDept={handleOpenAdd}
                        onEditDept={handleOpenEdit}
                        onViewAudit={handleOpenAudit}
                        onDeleteDept={handleOpenDelete}
                        level={0}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 4. Grid Cards View Display */}
          {activeView === 'cards' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-[#8FA392]">
                <span className="font-bold">
                  إجمالي الإدارات المعروضة: {filteredDepartments.length} من أصل {departments.length}
                </span>
              </div>

              {filteredDepartments.length === 0 ? (
                <div className="p-12 text-center rounded-2xl border border-slate-200 dark:border-[#243628] bg-white dark:bg-[#17231A] text-slate-400 text-xs">
                  لا توجد نتائج مطابقة لبحثك في بطاقات الإدارات
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredDepartments.map(dept => {
                    const parent = departments.find(d => d.id === dept.parentId);
                    const subDeptsCount = departments.filter(d => d.parentId === dept.id).length;

                    return (
                      <div
                        key={dept.id}
                        className="p-5 rounded-2xl border-2 border-slate-200 dark:border-[#243628] bg-white dark:bg-[#17231A] shadow-xs hover:shadow-md transition-all flex flex-col justify-between text-start"
                      >
                        <div>
                          {/* Card Top: Code, Parent & Headcount */}
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#1F2E23] text-slate-800 dark:text-[#EBB34D] border border-slate-200 dark:border-[#243628]">
                                {dept.code}
                              </span>
                              {dept.costCenterCode && (
                                <span
                                  className="font-mono text-[10.5px] font-bold px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50"
                                  title="كود مركز التكلفة المرتبط"
                                >
                                  {dept.costCenterCode}
                                </span>
                              )}
                            </div>

                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-[#1F2E23] text-slate-700 dark:text-[#8FA392]">
                              {dept.staffCount} موظف
                            </span>
                          </div>

                          {/* Department Name */}
                          <h4 className="text-base font-black text-slate-900 dark:text-[#F3EFE6] mb-1.5 leading-snug">
                            {dept.nameAr}
                          </h4>

                          {/* Parent Hierarchy Badge */}
                          <div className="mb-3 text-[11px] text-slate-500 dark:text-[#8FA392] flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-amber-500" />
                            <span>
                              {parent ? (
                                <>
                                  تابعة لـ:{' '}
                                  <strong className="text-slate-800 dark:text-[#F3EFE6] font-bold">
                                    {parent.nameAr}
                                  </strong>
                                </>
                              ) : (
                                <span className="font-bold text-amber-600 dark:text-amber-400">
                                  إدارة عليا مستقلة (جذر الهيكل)
                                </span>
                              )}
                            </span>
                          </div>

                          {/* Manager & Org Details Box */}
                          <div className="mb-3 p-3 rounded-xl bg-slate-50 dark:bg-[#0E1610] border border-slate-200/80 dark:border-[#243628] space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500 dark:text-[#8FA392] flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5 text-amber-500" />
                                <span>المدير المسؤول:</span>
                              </span>
                              <strong className="text-slate-900 dark:text-[#F3EFE6] font-bold">
                                {dept.headAr || 'غير محدد'}
                              </strong>
                            </div>

                            {dept.companyNameAr && (
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="text-slate-500 dark:text-[#8FA392] flex items-center gap-1.5">
                                  <Building2 className="w-3 h-3 text-slate-400" />
                                  <span>الشركة:</span>
                                </span>
                                <span className="text-slate-800 dark:text-[#E2DCCE] font-medium truncate max-w-[160px]">
                                  {dept.companyNameAr}
                                </span>
                              </div>
                            )}

                            {dept.branchNameAr && (
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="text-slate-500 dark:text-[#8FA392] flex items-center gap-1.5">
                                  <MapPin className="w-3 h-3 text-slate-400" />
                                  <span>المقر / الموقع:</span>
                                </span>
                                <span className="text-slate-800 dark:text-[#E2DCCE] font-medium truncate max-w-[160px]">
                                  {dept.branchNameAr}
                                </span>
                              </div>
                            )}

                            {dept.responsibilities && (
                              <p className="text-[11px] text-slate-600 dark:text-[#8FA392] border-t border-slate-200 dark:border-[#243628] pt-1.5 leading-relaxed line-clamp-2">
                                {dept.responsibilities}
                              </p>
                            )}
                          </div>

                          {/* Sub-units tags preview */}
                          {dept.subUnits && dept.subUnits.length > 0 && (
                            <div className="mb-3">
                              <span className="text-[10.5px] font-bold text-slate-500 dark:text-[#8FA392] block mb-1">
                                الأقسام والوحدات التابعة ({dept.subUnits.length}):
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {dept.subUnits.slice(0, 3).map((sub, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#1F2E23] text-[10.5px] font-medium text-slate-800 dark:text-[#F3EFE6] border border-slate-200 dark:border-[#243628]"
                                  >
                                    {sub}
                                  </span>
                                ))}
                                {dept.subUnits.length > 3 && (
                                  <span className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-[#1F2E23] text-[10.5px] font-bold text-amber-600 dark:text-amber-400">
                                    +{dept.subUnits.length - 3} أخرى
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Card Footer: Child count + Icon-Only Action Group */}
                        <div className="pt-3 border-t border-slate-200 dark:border-[#243628] flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-500 dark:text-[#8FA392]">
                            {subDeptsCount > 0 ? `${subDeptsCount} إدارات فرعية` : 'لا توجد فروع'}
                          </span>

                          {/* Icon-Only Action Group */}
                          <div className="flex items-center gap-1.5">
                            {hasPermission('companies.org.create') && (
                              <button
                                onClick={() => handleOpenAdd(dept.id)}
                                className="min-h-[36px] min-w-[36px] p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors flex items-center justify-center"
                                title="إضافة قسم تابع"
                              >
                                <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400 hover:text-emerald-500" />
                              </button>
                            )}

                            {hasPermission('companies.org.edit') && (
                              <button
                                onClick={() => handleOpenEdit(dept)}
                                className="min-h-[36px] min-w-[36px] p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors flex items-center justify-center"
                                title="تعديل بيانات الإدارة"
                              >
                                <Pencil className="w-4 h-4 text-amber-600 dark:text-amber-400 hover:text-amber-500" />
                              </button>
                            )}

                            {hasPermission('companies.org.view_audit') && (
                              <button
                                onClick={() => handleOpenAudit(dept)}
                                className="min-h-[36px] min-w-[36px] p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors flex items-center justify-center"
                                title="سجل تعديلات الإدارة"
                              >
                                <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 hover:text-blue-500" />
                              </button>
                            )}

                            {hasPermission('companies.org.delete') && (
                              <button
                                onClick={() => handleOpenDelete(dept)}
                                className="min-h-[36px] min-w-[36px] p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-800/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors flex items-center justify-center"
                                title="حذف الإدارة"
                              >
                                <Trash2 className="w-4 h-4 text-rose-600 dark:text-rose-400 hover:text-rose-500" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* 5. Add / Edit Department Modal */}
      <AnimatePresence>
        {modalOpen && (
          <DepartmentModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            editingDept={editingDept}
            prefilledParentId={prefilledParentId}
            departments={departments}
            companies={companies}
            branches={branches}
            onSave={async deptData => {
              if (editingDept) {
                await onUpdateDepartment({ ...deptData, id: editingDept.id });
              } else {
                await onAddDepartment(deptData);
              }
              setModalOpen(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* 6. Change Audit Log Drawer / Modal */}
      <AnimatePresence>
        {auditModalDept && (
          <DepartmentAuditLogModal
            department={auditModalDept}
            onClose={() => setAuditModalDept(null)}
          />
        )}
      </AnimatePresence>

      {/* 7. Delete Safety Check / Confirmation Modal */}
      <AnimatePresence>
        {deleteTargetDept && (
          <DepartmentDeleteModal
            department={deleteTargetDept}
            departments={departments}
            onClose={() => setDeleteTargetDept(null)}
            onConfirmDelete={async () => {
              if (deleteTargetDept) {
                await onDeleteDepartment(deleteTargetDept.id);
                setDeleteTargetDept(null);
              }
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* RECURSIVE ORG TREE NODE COMPONENT WITH EXACT CONNECTOR LINES               */
/* -------------------------------------------------------------------------- */
interface OrgTreeNodeProps {
  department: DepartmentOrg;
  allDepartments: DepartmentOrg[];
  collapsedNodes: Set<string>;
  onToggleCollapse: (id: string) => void;
  onAddSubDept: (parentId: string) => void;
  onEditDept: (dept: DepartmentOrg) => void;
  onViewAudit: (dept: DepartmentOrg) => void;
  onDeleteDept: (dept: DepartmentOrg) => void;
  level: number;
}

const OrgTreeNode: React.FC<OrgTreeNodeProps> = ({
  department,
  allDepartments,
  collapsedNodes,
  onToggleCollapse,
  onAddSubDept,
  onEditDept,
  onViewAudit,
  onDeleteDept,
  level
}) => {
  const { hasPermission } = useAuth();

  const children = useMemo(() => {
    return allDepartments.filter(d => d.parentId === department.id);
  }, [allDepartments, department.id]);

  const hasChildren = children.length > 0;
  const isCollapsed = collapsedNodes.has(department.id);

  // Level Accent styling
  const levelAccentBorder =
    level === 0
      ? 'border-t-4 border-t-amber-500'
      : level === 1
      ? 'border-t-4 border-t-emerald-600'
      : 'border-t-4 border-t-blue-500';

  return (
    <div className="flex flex-col items-center">
      {/* 1. Node Card Container */}
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className={`w-72 sm:w-80 p-4 rounded-2xl border-2 border-slate-200 dark:border-[#243628] bg-white dark:bg-[#17231A] text-slate-900 dark:text-[#F3EFE6] shadow-sm hover:shadow-lg transition-all duration-200 relative text-start ${levelAccentBorder}`}
      >
        {/* Card Header: Code, Cost Center & Staff Count */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#1F2E23] text-slate-800 dark:text-[#EBB34D] border border-slate-200 dark:border-[#243628]">
              {department.code}
            </span>

            {department.costCenterCode && (
              <span
                className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50"
                title="كود مركز التكلفة الهيكلي"
              >
                {department.costCenterCode}
              </span>
            )}
          </div>

          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-[#1F2E23] text-slate-700 dark:text-[#8FA392]">
            {department.staffCount} موظف
          </span>
        </div>

        {/* Department Name */}
        <h4 className="text-sm font-black text-slate-900 dark:text-[#F3EFE6] mb-1 leading-tight line-clamp-1">
          {department.nameAr}
        </h4>

        {/* Head / Manager */}
        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-[#8FA392] mb-2.5">
          <User className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span className="font-bold text-slate-800 dark:text-[#E2DCCE] truncate">
            {department.headAr || 'غير محدد'}
          </span>
        </div>

        {/* Company & Branch Badges */}
        {(department.companyNameAr || department.branchNameAr) && (
          <div className="mb-2.5 p-2 rounded-xl bg-slate-50 dark:bg-[#0E1610] border border-slate-200/70 dark:border-[#243628] space-y-1 text-[11px]">
            {department.companyNameAr && (
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-[#8FA392] truncate">
                <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="truncate">{department.companyNameAr}</span>
              </div>
            )}
            {department.branchNameAr && (
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-[#8FA392] truncate">
                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="truncate">{department.branchNameAr}</span>
              </div>
            )}
          </div>
        )}

        {/* Sub-units tags preview (up to 2 tags) */}
        {department.subUnits && department.subUnits.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2.5">
            {department.subUnits.slice(0, 2).map((sub, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#1F2E23] text-[10px] font-semibold text-slate-700 dark:text-[#8FA392] border border-slate-200 dark:border-[#243628]"
              >
                {sub}
              </span>
            ))}
            {department.subUnits.length > 2 && (
              <span className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-[#1F2E23] text-[10px] font-bold text-amber-600 dark:text-amber-400">
                +{department.subUnits.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Action micro-buttons group */}
        <div className="pt-2 border-t border-slate-200 dark:border-[#243628] flex items-center justify-between">
          {/* Quick Action Micro-buttons */}
          <div className="flex items-center gap-1">
            {hasPermission('companies.org.create') && (
              <button
                onClick={() => onAddSubDept(department.id)}
                className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors"
                title="إضافة قسم تابع"
              >
                <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400 hover:text-emerald-500" />
              </button>
            )}

            {hasPermission('companies.org.edit') && (
              <button
                onClick={() => onEditDept(department)}
                className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors"
                title="تعديل الإدارة"
              >
                <Pencil className="w-4 h-4 text-amber-600 dark:text-amber-400 hover:text-amber-500" />
              </button>
            )}

            {hasPermission('companies.org.view_audit') && (
              <button
                onClick={() => onViewAudit(department)}
                className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors"
                title="سجل التعديلات"
              >
                <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 hover:text-blue-500" />
              </button>
            )}

            {hasPermission('companies.org.delete') && (
              <button
                onClick={() => onDeleteDept(department)}
                className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors"
                title="حذف الإدارة"
              >
                <Trash2 className="w-4 h-4 text-rose-600 dark:text-rose-400 hover:text-rose-500" />
              </button>
            )}
          </div>

          {/* Expand/Collapse Button for Branches */}
          {hasChildren && (
            <button
              onClick={() => onToggleCollapse(department.id)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#1F2E23] text-slate-800 dark:text-[#F3EFE6] hover:bg-slate-200 dark:hover:bg-[#243628] text-[11px] font-bold transition-colors"
              title={isCollapsed ? 'توسيع الفروع' : 'طي الفروع'}
            >
              <span>{children.length}</span>
              {isCollapsed ? (
                <ChevronDown className="w-3.5 h-3.5 text-amber-500" />
              ) : (
                <ChevronUp className="w-3.5 h-3.5 text-amber-500" />
              )}
            </button>
          )}
        </div>
      </motion.div>

      {/* 2. Hierarchical SVG Connectors & Children Rendering */}
      {hasChildren && !isCollapsed && (
        <div className="flex flex-col items-center w-full">
          {/* Vertical Stem down from parent */}
          <div className="w-0.5 h-6 bg-slate-400 dark:bg-[#345540]" />

          {/* Children container with connecting lines */}
          <div className="flex items-start justify-center gap-6 relative">
            {children.map((child, idx) => {
              const isFirst = idx === 0;
              const isLast = idx === children.length - 1;
              const isSingle = children.length === 1;

              return (
                <div key={child.id} className="relative flex flex-col items-center">
                  {/* Top horizontal connection bridge */}
                  {!isSingle && (
                    <div
                      className={`absolute top-0 h-0.5 bg-slate-400 dark:bg-[#345540] ${
                        isFirst
                          ? 'start-1/2 end-0'
                          : isLast
                          ? 'start-0 end-1/2'
                          : 'start-0 end-0'
                      }`}
                    />
                  )}

                  {/* Vertical drop line down into child card */}
                  <div className="w-0.5 h-6 bg-slate-400 dark:bg-[#345540]" />

                  {/* Child Recursive Node */}
                  <OrgTreeNode
                    department={child}
                    allDepartments={allDepartments}
                    collapsedNodes={collapsedNodes}
                    onToggleCollapse={onToggleCollapse}
                    onAddSubDept={onAddSubDept}
                    onEditDept={onEditDept}
                    onViewAudit={onViewAudit}
                    onDeleteDept={onDeleteDept}
                    level={level + 1}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* ADD / EDIT DEPARTMENT MODAL                                                */
/* -------------------------------------------------------------------------- */
interface DepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingDept: DepartmentOrg | null;
  prefilledParentId: string | null;
  departments: DepartmentOrg[];
  companies: CompanyEntity[];
  branches: BranchLocation[];
  onSave: (deptData: {
    nameAr: string;
    code: string;
    headAr: string;
    staffCount: number;
    parentId: string | null;
    companyId: string;
    companyNameAr: string;
    branchId: string;
    branchNameAr: string;
    costCenterCode: string;
    subUnits: string[];
    responsibilities: string;
  }) => Promise<void>;
}

const DepartmentModal: React.FC<DepartmentModalProps> = ({
  onClose,
  editingDept,
  prefilledParentId,
  departments,
  companies,
  branches,
  onSave
}) => {
  // Form State
  const [nameAr, setNameAr] = useState(editingDept?.nameAr || '');
  const [code, setCode] = useState(
    editingDept?.code || `DEPT-${Date.now().toString().slice(-4)}`
  );
  const [headAr, setHeadAr] = useState(editingDept?.headAr || '');
  const [staffCount, setStaffCount] = useState<string | number>(
    editingDept?.staffCount !== undefined ? editingDept.staffCount : ''
  );
  const [companyId, setCompanyId] = useState(
    editingDept?.companyId || companies[0]?.id || ''
  );
  const [branchId, setBranchId] = useState(
    editingDept?.branchId || branches[0]?.id || ''
  );
  const [parentId, setParentId] = useState<string | null>(
    editingDept ? editingDept.parentId || null : prefilledParentId || null
  );
  const [costCenterCode, setCostCenterCode] = useState(
    editingDept?.costCenterCode || ''
  );
  const [subUnits, setSubUnits] = useState<string[]>(
    editingDept?.subUnits || []
  );
  const [subUnitInput, setSubUnitInput] = useState('');
  const [responsibilities, setResponsibilities] = useState(
    editingDept?.responsibilities || ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Available parent departments (prevent circular hierarchy if editing)
  const availableParents = useMemo(() => {
    if (!editingDept) return departments;
    const descendantIds = getDescendantIds(editingDept.id, departments);
    return departments.filter(d => d.id !== editingDept.id && !descendantIds.has(d.id));
  }, [departments, editingDept]);

  // Filter branches by selected company (if any match)
  const availableBranches = useMemo(() => {
    if (!companyId) return branches;
    const companyBranches = branches.filter(b => b.companyId === companyId);
    return companyBranches.length > 0 ? companyBranches : branches;
  }, [branches, companyId]);

  const handleAddSubUnit = () => {
    if (subUnitInput.trim() && !subUnits.includes(subUnitInput.trim())) {
      setSubUnits([...subUnits, subUnitInput.trim()]);
      setSubUnitInput('');
    }
  };

  const handleRemoveSubUnit = (index: number) => {
    setSubUnits(subUnits.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!nameAr.trim()) {
      setValidationError('يرجى إدخال اسم الإدارة أو القسم باللغة العربية');
      return;
    }
    if (!code.trim()) {
      setValidationError('يرجى تحديد كود تنظيمي فريد للإدارة');
      return;
    }

    // Cost Center Code Regex Validation (if provided)
    if (costCenterCode.trim()) {
      const codeRegex = /^[A-Za-z0-9_-]{2,20}$/;
      if (!codeRegex.test(costCenterCode.trim())) {
        setValidationError(
          'كود مركز التكلفة يجب أن يحتوي على حروف إنجليزية، أرقام، أو شرطات (-) دون مسافات (مثال: CC-101 أو CC_PROJECT)'
        );
        return;
      }
    }

    const selectedComp = companies.find(c => c.id === companyId);
    const selectedBranch = branches.find(b => b.id === branchId);

    setIsSubmitting(true);
    try {
      await onSave({
        nameAr: nameAr.trim(),
        code: code.trim().toUpperCase(),
        headAr: headAr.trim(),
        staffCount: Number(staffCount) || 0,
        parentId: parentId || null,
        companyId,
        companyNameAr: selectedComp?.nameAr || 'الشركة الرئيسية',
        branchId,
        branchNameAr: selectedBranch?.nameAr || 'المقر الرئيسي',
        costCenterCode: costCenterCode.trim().toUpperCase(),
        subUnits,
        responsibilities: responsibilities.trim()
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 !m-0 !top-0 !left-0 !right-0 !bottom-0 w-screen h-screen z-[999] flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-white dark:bg-[#0E1610] rounded-2xl border-2 border-slate-300 dark:border-[#243628] shadow-2xl overflow-hidden p-5 sm:p-6 text-start my-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 dark:border-[#243628] mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <FolderTree className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-[#F3EFE6]">
                {editingDept ? 'تعديل بيانات الإدارة بالهيكل التنظيمي' : 'تأسيس إدارة / قسم جديد'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#8FA392]">
                تحديد التبعية الهرمية، ربط مركز التكلفة، وإسناد المسؤوليات المعتمدة
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Validation Alert */}
        {validationError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* 1. Name & Code */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-900 dark:text-[#F3EFE6] mb-1">
                اسم الإدارة / القسم باللغة العربية *
              </label>
              <input
                type="text"
                required
                value={nameAr}
                onChange={e => setNameAr(e.target.value)}
                placeholder="مثال: الإدارة العامة للمشروعات الهندسية"
                className="w-full min-h-[42px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-[#243628] bg-slate-50 dark:bg-[#17231A] text-slate-900 dark:text-[#F3EFE6] font-medium focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-900 dark:text-[#F3EFE6] mb-1">
                الكود التنظيمي *
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="ENG-01"
                className="w-full min-h-[42px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-[#243628] bg-slate-50 dark:bg-[#17231A] text-slate-900 dark:text-[#F3EFE6] font-mono font-bold focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* 2. Parent Hierarchy & Structural Cost Center Code */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-900 dark:text-[#F3EFE6] mb-1">
                الإدارة الأعلى (التبعية الإدارية الهرمية)
              </label>
              <select
                value={parentId || ''}
                onChange={e => setParentId(e.target.value || null)}
                className="w-full min-h-[42px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-[#243628] bg-slate-50 dark:bg-[#17231A] text-slate-900 dark:text-[#F3EFE6] font-medium focus:outline-none focus:border-amber-500"
              >
                <option value="">إدارة عليا مستقلة (جذر الهيكل التنظيمي / Root)</option>
                {availableParents.map(parentDept => (
                  <option key={parentDept.id} value={parentDept.id}>
                    {parentDept.code} - {parentDept.nameAr}
                  </option>
                ))}
              </select>
              <span className="text-[10px] text-slate-500 dark:text-[#8FA392] mt-0.5 block">
                تحديد التبعية يحدد مكان الإدارة داخل الشجرة الهرمية
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-900 dark:text-[#F3EFE6] mb-1">
                كود مركز التكلفة المرتبط (Cost Center Code)
              </label>
              <input
                type="text"
                value={costCenterCode}
                onChange={e => setCostCenterCode(e.target.value)}
                placeholder="CC-101"
                className="w-full min-h-[42px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-[#243628] bg-slate-50 dark:bg-[#17231A] text-slate-900 dark:text-[#F3EFE6] font-mono font-bold focus:outline-none focus:border-amber-500"
              />
              <span className="text-[10px] text-slate-500 dark:text-[#8FA392] mt-0.5 block">
                ربط هيكلي ذكي مع المشاريع والفروع دون تداخل مالي
              </span>
            </div>
          </div>

          {/* 3. Company & Site Linking */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-900 dark:text-[#F3EFE6] mb-1">
                الشركة التابعة *
              </label>
              <select
                required
                value={companyId}
                onChange={e => setCompanyId(e.target.value)}
                className="w-full min-h-[42px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-[#243628] bg-slate-50 dark:bg-[#17231A] text-slate-900 dark:text-[#F3EFE6] font-medium focus:outline-none focus:border-amber-500"
              >
                {companies.map(comp => (
                  <option key={comp.id} value={comp.id}>
                    {comp.nameAr}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-900 dark:text-[#F3EFE6] mb-1">
                المقر / الموقع التابع *
              </label>
              <select
                value={branchId}
                onChange={e => setBranchId(e.target.value)}
                className="w-full min-h-[42px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-[#243628] bg-slate-50 dark:bg-[#17231A] text-slate-900 dark:text-[#F3EFE6] font-medium focus:outline-none focus:border-amber-500"
              >
                {availableBranches.map(branch => (
                  <option key={branch.id} value={branch.id}>
                    {branch.nameAr} ({branch.cityAr})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 4. Manager & Staff Count */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-900 dark:text-[#F3EFE6] mb-1">
                المدير المسؤول / رئيس الإدارة
              </label>
              <input
                type="text"
                value={headAr}
                onChange={e => setHeadAr(e.target.value)}
                placeholder="مثال: م. أحمد مصطفى الجوهري أو اتركه فارغاً"
                className="w-full min-h-[42px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-[#243628] bg-slate-50 dark:bg-[#17231A] text-slate-900 dark:text-[#F3EFE6] font-medium focus:outline-none focus:border-amber-500 cursor-text caret-slate-900 dark:caret-amber-400"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-900 dark:text-[#F3EFE6] mb-1">
                الكادر الوظيفي (موظف)
              </label>
              <input
                type="number"
                min="0"
                value={staffCount}
                onChange={e => setStaffCount(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="مثال: 15 موظف أو اتركه فارغاً"
                className="w-full min-h-[42px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-[#243628] bg-slate-50 dark:bg-[#17231A] text-slate-900 dark:text-[#F3EFE6] font-mono font-bold focus:outline-none focus:border-amber-500 cursor-text caret-slate-900 dark:caret-amber-400"
              />
            </div>
          </div>

          {/* 5. Sub-Units Chips */}
          <div>
            <label className="block font-bold text-slate-900 dark:text-[#F3EFE6] mb-1">
              الأقسام والوحدات التابعة
            </label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={subUnitInput}
                onChange={e => setSubUnitInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubUnit();
                  }
                }}
                placeholder="أدخل مسمى وحدة أو قسم فرعي واضغط إضافة..."
                className="flex-1 min-h-[38px] px-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-[#243628] bg-slate-50 dark:bg-[#17231A] text-slate-900 dark:text-[#F3EFE6] text-xs focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={handleAddSubUnit}
                className="min-h-[38px] px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-[#1F2E23] text-slate-800 dark:text-[#F3EFE6] font-bold hover:bg-slate-300 dark:hover:bg-[#243628] text-xs transition-colors shrink-0"
              >
                + إضافة وحدة
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 min-h-[32px]">
              {subUnits.map((sub, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#1F2E23] text-slate-800 dark:text-[#F3EFE6] border border-slate-300 dark:border-[#243628] text-xs font-medium"
                >
                  <span>{sub}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubUnit(idx)}
                    className="text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* 6. Responsibilities */}
          <div>
            <label className="block font-bold text-slate-900 dark:text-[#F3EFE6] mb-1">
              المسؤوليات والمهام الإدارية
            </label>
            <textarea
              rows={2}
              value={responsibilities}
              onChange={e => setResponsibilities(e.target.value)}
              placeholder="وصف مختصر للمسؤوليات المعتمدة ونطاق الصلاحيات الإدارية..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-[#243628] bg-slate-50 dark:bg-[#17231A] text-slate-900 dark:text-[#F3EFE6] font-medium focus:outline-none focus:border-amber-500 text-xs resize-none"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-200 dark:border-[#243628] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="min-h-[42px] px-4 py-2 rounded-xl border border-slate-300 dark:border-[#243628] text-slate-600 dark:text-[#8FA392] hover:bg-slate-100 dark:hover:bg-white/5 font-semibold"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="min-h-[42px] px-6 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition-colors shadow-xs flex items-center gap-2"
            >
              {isSubmitting ? (
                <span>جارٍ الحفظ...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{editingDept ? 'تحديث بيانات الإدارة' : 'إدراج الإدارة بالهيكل'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* CHANGE AUDIT LOG DRAWER / MODAL                                            */
/* -------------------------------------------------------------------------- */
interface DepartmentAuditLogModalProps {
  department: DepartmentOrg;
  onClose: () => void;
}

const DepartmentAuditLogModal: React.FC<DepartmentAuditLogModalProps> = ({
  department,
  onClose
}) => {
  const auditLogs = department.auditLogs || [];

  return (
    <div className="fixed inset-0 !m-0 !top-0 !left-0 !right-0 !bottom-0 w-screen h-screen z-[999] flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-xl bg-white dark:bg-[#0E1610] rounded-2xl border-2 border-slate-300 dark:border-[#243628] shadow-2xl overflow-hidden p-5 sm:p-6 text-start max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 dark:border-[#243628] mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-[#F3EFE6]">
                سجل تعديلات الإدارة / الهيكل التنظيمي
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#8FA392]">
                {department.nameAr} ({department.code})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Audit Log Timeline */}
        <div className="flex-1 overflow-y-auto space-y-3.5 pe-1">
          {auditLogs.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              لا توجد تعديلات مسجلة بعد لهذه الإدارة
            </div>
          ) : (
            auditLogs.map((log: DepartmentAuditLogEntry) => {
              const isReparent = log.action === 'reparent';
              const isCreate = log.action === 'create';

              return (
                <div
                  key={log.id}
                  className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                    isReparent
                      ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-300 dark:border-amber-900/60'
                      : isCreate
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-900/60'
                      : 'bg-slate-50 dark:bg-[#17231A] border-slate-200 dark:border-[#243628]'
                  }`}
                >
                  {/* Entry Header: User, Action & Timestamp */}
                  <div className="flex items-center justify-between gap-2 border-b border-slate-200/60 dark:border-white/5 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-[#243628] text-slate-700 dark:text-[#F3EFE6] flex items-center justify-center font-bold text-[10px]">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-slate-900 dark:text-[#F3EFE6]">
                        {log.userName}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          isReparent
                            ? 'bg-amber-200/70 text-amber-900 dark:bg-amber-900/60 dark:text-amber-300'
                            : isCreate
                            ? 'bg-emerald-200/70 text-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-300'
                            : 'bg-slate-200 text-slate-800 dark:bg-[#243628] dark:text-[#8FA392]'
                        }`}
                      >
                        {log.actionLabelAr}
                      </span>
                    </div>

                    <span className="font-mono text-[10.5px] text-slate-500 dark:text-[#8FA392]">
                      {log.timestamp}
                    </span>
                  </div>

                  {/* Changes List */}
                  <div className="space-y-1.5 pt-1">
                    {log.changes.map((change, cIdx) => (
                      <div
                        key={cIdx}
                        className="text-[11.5px] text-slate-700 dark:text-[#E2DCCE] leading-relaxed flex items-start gap-1.5"
                      >
                        <span className="text-amber-500 font-bold">•</span>
                        <div>
                          {change.field === 'parentId' ? (
                            <span className="font-bold text-amber-700 dark:text-amber-400">
                              تم نقل تبعية الإدارة من &quot;{change.oldValue}&quot; إلى &quot;{change.newValue}&quot;
                            </span>
                          ) : (
                            <span>
                              <strong className="text-slate-900 dark:text-white font-bold">
                                [{change.fieldLabel}]:
                              </strong>{' '}
                              تم التغيير من &quot;{change.oldValue}&quot; إلى &quot;{change.newValue}&quot;
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-200 dark:border-[#243628] flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="min-h-[40px] px-5 py-2 rounded-xl bg-slate-100 dark:bg-[#1F2E23] text-slate-800 dark:text-[#F3EFE6] font-bold text-xs hover:bg-slate-200 dark:hover:bg-[#243628] transition-colors"
          >
            إغلاق
          </button>
        </div>
      </motion.div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* DELETE SAFETY CHECK & CONFIRMATION MODAL                                   */
/* -------------------------------------------------------------------------- */
interface DepartmentDeleteModalProps {
  department: DepartmentOrg;
  departments: DepartmentOrg[];
  onClose: () => void;
  onConfirmDelete: () => Promise<void>;
}

const DepartmentDeleteModal: React.FC<DepartmentDeleteModalProps> = ({
  department,
  departments,
  onClose,
  onConfirmDelete
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  // Check if department has active sub-departments
  const childDepartments = useMemo(() => {
    return departments.filter(d => d.parentId === department.id);
  }, [departments, department.id]);

  const hasChildren = childDepartments.length > 0;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onConfirmDelete();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 !m-0 !top-0 !left-0 !right-0 !bottom-0 w-screen h-screen z-[999] flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-white dark:bg-[#0E1610] rounded-2xl border-2 border-slate-300 dark:border-[#243628] shadow-2xl p-5 sm:p-6 text-start"
      >
        {hasChildren ? (
          /* BLOCKED: Safety Warning */
          <div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-black text-slate-900 dark:text-[#F3EFE6] mb-2">
              لا يمكن حذف هذه الإدارة حالياً
            </h3>

            <p className="text-xs text-slate-600 dark:text-[#8FA392] mb-3 leading-relaxed">
              الإدارة <strong className="text-slate-900 dark:text-[#F3EFE6] font-bold">&quot;{department.nameAr}&quot;</strong> تحتوي على ({childDepartments.length}) إدارات أو أقسام تابعة لها بالهيكل التنظيمي:
            </p>

            <div className="mb-4 p-2.5 rounded-xl bg-slate-50 dark:bg-[#17231A] border border-slate-200 dark:border-[#243628] max-h-36 overflow-y-auto space-y-1">
              {childDepartments.map(child => (
                <div key={child.id} className="text-xs font-semibold text-slate-700 dark:text-[#E2DCCE] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                  <span>{child.code} - {child.nameAr}</span>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-amber-700 dark:text-amber-400 mb-5 leading-relaxed font-semibold">
              يرجى إعادة نقل تبعية الإدارات الفرعية أولاً إلى إدارة أخرى عبر زر التعديل (القلم) قبل الحذف، لتفادي انقطاع الهيكل الهرمي.
            </p>

            <div className="flex items-center justify-end">
              <button
                onClick={onClose}
                className="min-h-[42px] px-5 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-900 transition-colors"
              >
                فهمت ذلك - إغلاق
              </button>
            </div>
          </div>
        ) : (
          /* ALLOWED: Confirmation */
          <div>
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-base font-black text-slate-900 dark:text-[#F3EFE6] mb-2">
              تأكيد حذف الإدارة نهائياً
            </h3>

            <p className="text-xs text-slate-600 dark:text-[#8FA392] mb-4 leading-relaxed">
              هل أنت متأكد من رغبتك في حذف الإدارة <strong className="text-slate-900 dark:text-[#F3EFE6] font-bold">&quot;{department.nameAr}&quot;</strong> (كود: {department.code}) نهائياً من الهيكل التنظيمي؟ هذا الإجراء لا يمكن التراجع عنه.
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={onClose}
                disabled={isDeleting}
                className="min-h-[42px] px-4 py-2 rounded-xl border border-slate-300 dark:border-[#243628] text-slate-600 dark:text-[#8FA392] hover:bg-slate-100 dark:hover:bg-white/5 font-semibold text-xs"
              >
                إلغاء
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="min-h-[42px] px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5"
              >
                {isDeleting ? 'جارٍ الحذف...' : 'تأكيد الحذف نهائياً'}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
