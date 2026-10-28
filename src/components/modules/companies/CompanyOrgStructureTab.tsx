import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GitFork,
  LayoutGrid,
  Plus,
  Pencil,
  AlertCircle,
  Trash2,
  User,
  Building2,
  MapPin,
  X,
  Search,
  AlertTriangle,
  Layers,
  FolderTree,
  Check,
  Maximize2,
  Minimize2,
  Sparkles,
  Zap,
  Info
} from 'lucide-react';
import { DepartmentOrg, CompanyEntity, BranchLocation, DepartmentAuditLogEntry } from './types';
import { useAuth } from '../../../context/AuthContext';
import { OrgMindMapTree } from './OrgMindMapTree';
import { departmentStorage, computeHierarchyLevels } from './departmentStorage';

interface CompanyOrgStructureTabProps {
  departments: DepartmentOrg[];
  companies: CompanyEntity[];
  branches: BranchLocation[];
  onAddDepartment: (dept: Partial<DepartmentOrg> & { nameAr: string; code: string }) => Promise<void> | void;
  onUpdateDepartment: (dept: Partial<DepartmentOrg> & { nameAr: string; code: string }) => Promise<void> | void;
  onDeleteDepartment: (id: string) => Promise<{ success: boolean; error?: string } | void> | void;
  onReloadDepartments?: () => Promise<void> | void;
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
  onDeleteDepartment,
  onReloadDepartments
}) => {
  const { hasPermission, user } = useAuth();

  // Segmented View Switcher: 'cards' (البطاقات الذكية) vs 'mindmap' (الشجرة الذهنية التفاعلية)
  const [activeView, setActiveView] = useState<'cards' | 'mindmap'>('mindmap');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<number | 'all'>('all');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('all');

  // Collapsed nodes state (default empty = all expanded)
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());

  // Modal State: Add/Edit Department
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<DepartmentOrg | null>(null);
  const [prefilledParentId, setPrefilledParentId] = useState<string | null>(null);

  // Modal State: Audit Log Drawer
  const [auditModalDept, setAuditModalDept] = useState<DepartmentOrg | null>(null);

  // Modal State: Delete Confirmation / Safety Check
  const [deleteTargetDept, setDeleteTargetDept] = useState<DepartmentOrg | null>(null);

  // Modal State: Seed Enterprise Template Modal
  const [seedModalOpen, setSeedModalOpen] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  // Normalized departments with computed depth levels
  const normalizedDepartments = useMemo(() => {
    return computeHierarchyLevels(departments);
  }, [departments]);

  // Max depth level across departments
  const maxDepthLevel = useMemo(() => {
    if (normalizedDepartments.length === 0) return 0;
    const lvls = normalizedDepartments.map(d => d.level ?? 0);
    return Math.max(...lvls);
  }, [normalizedDepartments]);

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
    const allParentIds = new Set(
      departments.filter(d => departments.some(c => c.parentId === d.id)).map(d => d.id)
    );
    setCollapsedNodes(allParentIds);
  };

  // Open Add Modal
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

  // Filtered departments based on company, search, and depth level
  const filteredDepartments = useMemo(() => {
    return normalizedDepartments.filter(dept => {
      const matchCompany = selectedCompanyId === 'all' || dept.companyId === selectedCompanyId;
      const matchLevel = selectedLevel === 'all' || dept.level === selectedLevel;

      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        dept.nameAr.toLowerCase().includes(q) ||
        (dept.titleEn && dept.titleEn.toLowerCase().includes(q)) ||
        dept.code.toLowerCase().includes(q) ||
        (dept.headAr && dept.headAr.toLowerCase().includes(q)) ||
        (dept.costCenterCode && dept.costCenterCode.toLowerCase().includes(q)) ||
        (dept.responsibilities && dept.responsibilities.toLowerCase().includes(q)) ||
        (dept.companyNameAr && dept.companyNameAr.toLowerCase().includes(q)) ||
        (dept.branchNameAr && dept.branchNameAr.toLowerCase().includes(q));

      return matchCompany && matchLevel && matchSearch;
    });
  }, [normalizedDepartments, selectedCompanyId, selectedLevel, searchQuery]);

  // Handle Seeding Template
  const handleConfirmSeed = async (companyIdToSeed: string) => {
    setIsSeeding(true);
    try {
      const targetCompany = companies.find(c => c.id === companyIdToSeed) || companies[0];
      const compId = targetCompany ? targetCompany.id : 'comp_default';
      const compName = targetCompany ? targetCompany.nameAr : 'شركة المقاولات العامة';

      await departmentStorage.seedEnterpriseHierarchy(
        compId,
        compName,
        user?.nameAr || user?.username || 'يوسف حجازي'
      );

      if (onReloadDepartments) {
        await onReloadDepartments();
      }
      setSeedModalOpen(false);
    } catch (err: any) {
      console.error('[CompanyOrgStructureTab] Seeding failed:', err);
      alert(err.message || 'حدث خطأ أثناء تحميل الهيكل القياسي');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* ========================================================================= */}
      {/* 2-TIER EXECUTIVE GLASSMORPHIIC COMMAND BAR                                */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white/95 dark:bg-[#112017]/95 border border-slate-200/90 dark:border-[#1F3526] shadow-sm backdrop-blur-md space-y-4">
        {/* Tier 1: Header, Live Metrics, Segmented Switcher & Primary Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-[#1A3327]">
          {/* Right Side: Section Title & Live Metrics */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/30">
                <FolderTree className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-[#F3EFE6] tracking-tight">
                  الهيكل التنظيمي والإدارات
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-[#8FA392]">
                  التسلسل الهرمي للمؤسسة، بطاقات الأقسام، ومراكز التكلفة
                </p>
              </div>
            </div>

            {/* Live Counter Badges */}
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30 text-xs font-bold font-mono">
                {departments.length} وحدة إدارية
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30 text-xs font-bold">
                {departments.length > 0 ? `${maxDepthLevel + 1} مستويات هيكلية` : '0 مستويات'}
              </span>
            </div>
          </div>

          {/* Center: Segmented View Switcher Pill (Side-by-Side) */}
          <div className="p-1.5 rounded-xl bg-slate-100/90 dark:bg-[#07130E] border border-slate-200/80 dark:border-amber-500/20 flex items-center gap-1.5 shadow-inner">
            <button
              type="button"
              onClick={() => setActiveView('cards')}
              className={`min-h-[38px] flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeView === 'cards'
                  ? 'bg-gradient-to-l from-amber-600 to-amber-500 text-white shadow-md shadow-amber-500/20 font-bold'
                  : 'text-slate-600 dark:text-[#8FA392] hover:text-slate-900 dark:hover:text-[#F3EFE6]'
              }`}
              title="عرض البطاقات الذكية التفصيلية"
            >
              <LayoutGrid className="w-4 h-4" />
              <span>البطاقات الذكية</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('mindmap')}
              className={`min-h-[38px] flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeView === 'mindmap'
                  ? 'bg-gradient-to-l from-amber-600 to-amber-500 text-white shadow-md shadow-amber-500/20 font-bold'
                  : 'text-slate-600 dark:text-[#8FA392] hover:text-slate-900 dark:hover:text-[#F3EFE6]'
              }`}
              title="عرض الشجرة الذهنية التفاعلية بتصميم NotebookLM"
            >
              <GitFork className="w-4 h-4" />
              <span>الشجرة الذهنية التفاعلية</span>
            </button>
          </div>

          {/* Left Side: Primary Action Buttons */}
          <div className="flex items-center gap-2.5">
            {hasPermission('companies.org.create') && (
              <button
                type="button"
                onClick={() => handleOpenAdd(null)}
                className="min-h-[40px] flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-md shadow-amber-600/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ إضافة إدارة / عقدة جديدة</span>
              </button>
            )}

            {hasPermission('companies.org.create') && (
              <button
                type="button"
                onClick={() => setSeedModalOpen(true)}
                className="min-h-[40px] flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                title="تحميل الهيكل التنظيمي القياسي المتكامل لشركات المقاولات (4 مستويات - 30+ إدارة ووحدة)"
              >
                <Zap className="w-4 h-4 text-amber-300" />
                <span>⚡ تحميل الهيكل القياسي المتكامل</span>
              </button>
            )}
          </div>
        </div>

        {/* Tier 2: Spacious Search & Filter Strip */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Input (md:col-span-5) */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-stone-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم الإدارة، القسم الفرعي، المسمى، أو الاختصاص..."
              className="w-full min-h-[40px] ps-9 pe-8 py-2 rounded-xl border border-slate-200 dark:border-[#243628] bg-slate-50 dark:bg-[#0E1610] text-slate-900 dark:text-[#F3EFE6] text-xs font-medium focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all placeholder:text-slate-400 dark:placeholder:text-stone-600"
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

          {/* Level / Depth Filter Pills (md:col-span-5) */}
          <div className="md:col-span-5 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <button
              type="button"
              onClick={() => setSelectedLevel('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedLevel === 'all'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-[#1A2C21] text-slate-600 dark:text-[#8FA392] hover:bg-slate-200 dark:hover:bg-[#233B2C]'
              }`}
            >
              كل المستويات
            </button>

            <button
              type="button"
              onClick={() => setSelectedLevel(0)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedLevel === 0
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-[#1A2C21] text-slate-600 dark:text-[#8FA392] hover:bg-slate-200 dark:hover:bg-[#233B2C]'
              }`}
            >
              الإدارة العليا (المستوى 1)
            </button>

            <button
              type="button"
              onClick={() => setSelectedLevel(1)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedLevel === 1
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-[#1A2C21] text-slate-600 dark:text-[#8FA392] hover:bg-slate-200 dark:hover:bg-[#233B2C]'
              }`}
            >
              الإدارات التنفيذية (المستوى 2)
            </button>

            <button
              type="button"
              onClick={() => setSelectedLevel(2)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedLevel === 2
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-[#1A2C21] text-slate-600 dark:text-[#8FA392] hover:bg-slate-200 dark:hover:bg-[#233B2C]'
              }`}
            >
              الأقسام الفرعية (المستوى 3)
            </button>

            <button
              type="button"
              onClick={() => setSelectedLevel(3)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedLevel === 3
                  ? 'bg-stone-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-[#1A2C21] text-slate-600 dark:text-[#8FA392] hover:bg-slate-200 dark:hover:bg-[#233B2C]'
              }`}
            >
              المهام والاختصاصات (المستوى 4)
            </button>
          </div>

          {/* Controls: Expand / Collapse All & Company Selector (md:col-span-2) */}
          <div className="md:col-span-2 flex items-center justify-end gap-1.5">
            {companies.length > 1 && (
              <div className="relative shrink-0">
                <select
                  value={selectedCompanyId}
                  onChange={e => setSelectedCompanyId(e.target.value)}
                  className="min-h-[36px] max-w-[130px] px-2 py-1 rounded-xl border border-slate-200 dark:border-[#243628] bg-slate-50 dark:bg-[#0E1610] text-slate-800 dark:text-[#F3EFE6] text-xs font-semibold focus:outline-none focus:border-amber-500 truncate"
                >
                  <option value="all">جميع الشركات</option>
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.nameAr}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="button"
              onClick={handleExpandAll}
              className="min-h-[36px] px-2.5 py-1 rounded-xl border border-slate-200 dark:border-[#243628] bg-slate-50 dark:bg-[#1F2E23] text-slate-600 dark:text-[#8FA392] hover:text-slate-900 dark:hover:text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
              title="فتح كافة الفروع الشجرية"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">فتح الكل</span>
            </button>

            <button
              type="button"
              onClick={handleCollapseAll}
              className="min-h-[36px] px-2.5 py-1 rounded-xl border border-slate-200 dark:border-[#243628] bg-slate-50 dark:bg-[#1F2E23] text-slate-600 dark:text-[#8FA392] hover:text-slate-900 dark:hover:text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
              title="طي كافة الفروع الشجرية"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">طي الكل</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* EMPTY STATE VIEW                                                          */}
      {/* ========================================================================= */}
      {departments.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border-2 border-dashed border-slate-300 dark:border-[#243628] bg-white dark:bg-[#17231A]">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center mb-4">
            <FolderTree className="w-8 h-8" />
          </div>
          <h3 className="text-base font-black text-slate-900 dark:text-[#F3EFE6] mb-2">
            لم يتم تأسيس الهيكل التنظيمي للشركة بعد
          </h3>
          <p className="text-xs text-slate-500 dark:text-[#8FA392] max-w-lg mx-auto mb-6 leading-relaxed">
            يمكنك تأسيس عقدة أولى يدوياً، أو استخدام زر التحميل الفوري لتأسيس الهيكل القياسي المتكامل لشركات المقاولات المصرية المعتمد بـ 4 مستويات تنفيذية و 30+ إدارة تخصصية مرتبطة بـ Cloudflare D1.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {hasPermission('companies.org.create') && (
              <button
                type="button"
                onClick={() => setSeedModalOpen(true)}
                className="min-h-[44px] inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white text-xs font-bold transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                <Zap className="w-4 h-4 text-white" />
                <span>⚡ تحميل الهيكل القياسي المتكامل فوراً</span>
              </button>
            )}

            {hasPermission('companies.org.create') && (
              <button
                type="button"
                onClick={() => handleOpenAdd(null)}
                className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 dark:border-[#243628] bg-white dark:bg-[#1F2E23] text-slate-800 dark:text-stone-200 text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 text-amber-500" />
                <span>+ تأسيس إدارة أولى يدوياً</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* ========================================================================= */}
          {/* VIEW 1: NOTEBOOKLM-STYLE INTERACTIVE HORIZONTAL MIND-MAP TREE              */}
          {/* ========================================================================= */}
          {activeView === 'mindmap' && (
            <OrgMindMapTree
              departments={departments}
              searchQuery={searchQuery}
              selectedLevel={selectedLevel}
              selectedCompanyId={selectedCompanyId}
              collapsedNodes={collapsedNodes}
              onToggleCollapse={handleToggleCollapse}
              onAddSubDept={handleOpenAdd}
              onEditDept={handleOpenEdit}
              onViewAudit={handleOpenAudit}
              onDeleteDept={handleOpenDelete}
              onExpandAll={handleExpandAll}
              onCollapseAll={handleCollapseAll}
            />
          )}

          {/* ========================================================================= */}
          {/* VIEW 2: SMART CARDS GRID VIEW                                            */}
          {/* ========================================================================= */}
          {activeView === 'cards' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-[#8FA392]">
                <span className="font-bold">
                  إجمالي الوحدات المعروضة: {filteredDepartments.length} من أصل {departments.length}
                </span>
                {selectedLevel !== 'all' && (
                  <span className="text-amber-600 dark:text-amber-400 font-semibold">
                    مفلتر حسب المستوى: {selectedLevel === 0 ? 'الإدارة العليا' : `المستوى ${selectedLevel + 1}`}
                  </span>
                )}
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
                    const level = dept.level ?? 0;

                    const levelBadgeColor =
                      level === 0
                        ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                        : level === 1
                        ? 'bg-teal-100 text-teal-900 dark:bg-teal-950/60 dark:text-teal-300 border-teal-300 dark:border-teal-800'
                        : level === 2
                        ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                        : 'bg-stone-100 text-stone-900 dark:bg-stone-800 dark:text-stone-300 border-stone-300 dark:border-stone-700';

                    const levelBadgeText =
                      level === 0
                        ? 'القيادة التنفيذية (L0)'
                        : level === 1
                        ? 'إدارة تنفيذية (L1)'
                        : level === 2
                        ? 'قسم فرعي (L2)'
                        : 'مهام واختصاصات (L3)';

                    return (
                      <div
                        key={dept.id}
                        className="p-5 rounded-2xl border-2 border-slate-200 dark:border-[#243628] bg-white dark:bg-[#17231A] shadow-xs hover:shadow-md transition-all flex flex-col justify-between text-start"
                      >
                        <div>
                          {/* Card Top: Code, Parent & Headcount */}
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#1F2E23] text-slate-800 dark:text-[#EBB34D] border border-slate-200 dark:border-[#243628]">
                                {dept.code}
                              </span>
                              {dept.costCenterCode && (
                                <span
                                  className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50"
                                  title="كود مركز التكلفة المرتبط"
                                >
                                  {dept.costCenterCode}
                                </span>
                              )}
                            </div>

                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${levelBadgeColor}`}
                            >
                              {levelBadgeText}
                            </span>
                          </div>

                          {/* Department Name */}
                          <h4 className="text-base font-black text-slate-900 dark:text-[#F3EFE6] mb-1 leading-snug">
                            {dept.nameAr}
                          </h4>
                          {(dept.titleEn || dept.nameEn) && (
                            <p className="text-[11px] font-mono text-amber-600 dark:text-amber-300/80 mb-2">
                              {dept.titleEn || dept.nameEn}
                            </p>
                          )}

                          {/* Parent Hierarchy Badge */}
                          <div className="mb-3 text-[11px] text-slate-500 dark:text-[#8FA392] flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span className="truncate">
                              {parent ? (
                                <>
                                  تابعة لـ:{' '}
                                  <strong className="text-slate-800 dark:text-[#F3EFE6] font-bold">
                                    {parent.nameAr}
                                  </strong>
                                </>
                              ) : (
                                <span className="font-bold text-amber-600 dark:text-amber-400">
                                  إدارة عليا مستقلة (جذر الهيكل التنظيمي)
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
                                className="min-h-[36px] min-w-[36px] p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors flex items-center justify-center cursor-pointer"
                                title="إضافة قسم أو إدارة تابعة"
                              >
                                <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400 hover:text-emerald-500" />
                              </button>
                            )}

                            {hasPermission('companies.org.edit') && (
                              <button
                                onClick={() => handleOpenEdit(dept)}
                                className="min-h-[36px] min-w-[36px] p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors flex items-center justify-center cursor-pointer"
                                title="تعديل بيانات الإدارة"
                              >
                                <Pencil className="w-4 h-4 text-amber-600 dark:text-amber-400 hover:text-amber-500" />
                              </button>
                            )}

                            <button
                              onClick={() => handleOpenAudit(dept)}
                              className="min-h-[36px] min-w-[36px] p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors flex items-center justify-center cursor-pointer"
                              title="سجل تعديلات الإدارة"
                            >
                              <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 hover:text-blue-500" />
                            </button>

                            {hasPermission('companies.org.delete') && (
                              <button
                                onClick={() => handleOpenDelete(dept)}
                                className="min-h-[36px] min-w-[36px] p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-800/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors flex items-center justify-center cursor-pointer"
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

      {/* ========================================================================= */}
      {/* SEED ENTERPRISE TEMPLATE CONFIRMATION MODAL                                */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {seedModalOpen && (
          <SeedHierarchyModal
            isOpen={seedModalOpen}
            companies={companies}
            currentDepartmentsCount={departments.length}
            isSeeding={isSeeding}
            onClose={() => setSeedModalOpen(false)}
            onConfirm={handleConfirmSeed}
          />
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* ADD / EDIT DEPARTMENT MODAL                                               */}
      {/* ========================================================================= */}
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

      {/* ========================================================================= */}
      {/* CHANGE AUDIT LOG DRAWER / MODAL                                           */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {auditModalDept && (
          <DepartmentAuditLogModal
            department={auditModalDept}
            onClose={() => setAuditModalDept(null)}
          />
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* DELETE SAFETY CHECK / CONFIRMATION MODAL                                  */}
      {/* ========================================================================= */}
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
/* SEED HIERARCHY MODAL                                                       */
/* -------------------------------------------------------------------------- */
interface SeedHierarchyModalProps {
  isOpen: boolean;
  companies: CompanyEntity[];
  currentDepartmentsCount: number;
  isSeeding: boolean;
  onClose: () => void;
  onConfirm: (companyId: string) => Promise<void>;
}

const SeedHierarchyModal: React.FC<SeedHierarchyModalProps> = ({
  companies,
  currentDepartmentsCount,
  isSeeding,
  onClose,
  onConfirm
}) => {
  const [targetCompanyId, setTargetCompanyId] = useState<string>(companies[0]?.id || '');

  return (
    <div className="fixed inset-0 !m-0 !top-0 !left-0 !right-0 !bottom-0 w-screen h-screen z-[999] flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-xl bg-white dark:bg-[#0E1610] rounded-2xl border-2 border-amber-500/40 shadow-2xl overflow-hidden p-5 sm:p-6 text-start my-8"
      >
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 dark:border-[#243628] mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-[#F3EFE6]">
                تحميل الهيكل التنظيمي القياسي المتكامل
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#8FA392]">
                4 مستويات تنظيمية متكاملة لشركات المقاولات والإنشاءات الكبرى
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-500/30 text-amber-900 dark:text-amber-200 leading-relaxed">
            <div className="flex items-center gap-2 font-bold mb-1">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>ماذا يتضمن الهيكل القياسي المعتمد؟</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-[11.5px] ps-1">
              <li><strong>المستوى 0:</strong> المالك والرئيس التنفيذي (Owner & CEO)</li>
              <li><strong>المستوى 1:</strong> 8 إدارات تنفيذية عليا (PMO، المراجعة الداخلية، المستشار القانوني، الجودة والسلامة QHSE، المشروعات الهندسية، الموارد البشرية، المدير المالي CFO، وسلاسل الإمداد والمشتريات).</li>
              <li><strong>المستوى 2 و 3:</strong> 25+ قسماً تخصصياً ووحدة عمل (التسعير، الشوب دروينج، حسابات المستخلصات، العقود، والتأمينات الاجتماعية).</li>
            </ul>
          </div>

          {currentDepartmentsCount > 0 && (
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-300 text-xs flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0" />
              <span>
                يوجد حالياً ({currentDepartmentsCount}) وحدة إدارية مسجلة. سيتم إدراج الهيكل القياسي وربطه بالشركة المحددة وحفظه مباشرة في Cloudflare D1.
              </span>
            </div>
          )}

          {companies.length > 0 && (
            <div>
              <label className="block font-bold text-slate-900 dark:text-[#F3EFE6] mb-1">
                اختر الشركة المستهدفة لإسناد الهيكل إليها:
              </label>
              <select
                value={targetCompanyId}
                onChange={e => setTargetCompanyId(e.target.value)}
                className="w-full min-h-[42px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-[#243628] bg-slate-50 dark:bg-[#17231A] text-slate-900 dark:text-[#F3EFE6] font-bold focus:outline-none focus:border-amber-500"
              >
                {companies.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nameAr}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="pt-3 border-t border-slate-200 dark:border-[#243628] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSeeding}
              className="min-h-[42px] px-4 py-2 rounded-xl border border-slate-300 dark:border-[#243628] text-slate-600 dark:text-[#8FA392] hover:bg-slate-100 dark:hover:bg-white/5 font-semibold text-xs"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={() => onConfirm(targetCompanyId)}
              disabled={isSeeding}
              className="min-h-[42px] px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              {isSeeding ? (
                <span>جارٍ التأسيس والمزامنة مع Cloudflare D1...</span>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-white" />
                  <span>تأكيد التحميل والتأسيس الفوري</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
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
    titleEn?: string;
    nameEn?: string;
    level?: number;
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
  const [titleEn, setTitleEn] = useState(editingDept?.titleEn || editingDept?.nameEn || '');
  const [code, setCode] = useState(
    editingDept?.code || `DEP-${Date.now().toString().slice(-4)}`
  );
  const [level, setLevel] = useState<number>(
    editingDept?.level !== undefined ? editingDept.level : 1
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

  // Filter branches by selected company
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
        titleEn: titleEn.trim(),
        nameEn: titleEn.trim(),
        level: Number(level),
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
                {editingDept ? 'تعديل بيانات الإدارة بالهيكل التنظيمي' : 'تأسيس إدارة / عقدة جديدة'}
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
          {/* 1. NameAr & TitleEn */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
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
                المسمى بالإنجليزية (Title / English)
              </label>
              <input
                type="text"
                value={titleEn}
                onChange={e => setTitleEn(e.target.value)}
                placeholder="e.g. Engineering & Projects Directorate"
                className="w-full min-h-[42px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-[#243628] bg-slate-50 dark:bg-[#17231A] text-slate-900 dark:text-[#F3EFE6] font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* 2. Code & Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

            <div>
              <label className="block font-bold text-slate-900 dark:text-[#F3EFE6] mb-1">
                المستوى الهيكلي
              </label>
              <select
                value={level}
                onChange={e => setLevel(Number(e.target.value))}
                className="w-full min-h-[42px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-[#243628] bg-slate-50 dark:bg-[#17231A] text-slate-900 dark:text-[#F3EFE6] font-semibold focus:outline-none focus:border-amber-500"
              >
                <option value={0}>المستوى 0: الإدارة العليا والقيادة التنفيذية (Root)</option>
                <option value={1}>المستوى 1: إدارات تنفيذية رئيسية</option>
                <option value={2}>المستوى 2: أقسام فرعية</option>
                <option value={3}>المستوى 3: مهام ووحدات تخصصية</option>
              </select>
            </div>
          </div>

          {/* 3. Parent Hierarchy & Structural Cost Center Code */}
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
            </div>

            <div>
              <label className="block font-bold text-slate-900 dark:text-[#F3EFE6] mb-1">
                كود مركز التكلفة المرتبط (Cost Center)
              </label>
              <input
                type="text"
                value={costCenterCode}
                onChange={e => setCostCenterCode(e.target.value)}
                placeholder="CC-101 أو CC-OPS"
                className="w-full min-h-[42px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-[#243628] bg-slate-50 dark:bg-[#17231A] text-slate-900 dark:text-[#F3EFE6] font-mono font-medium focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* 4. Manager & Staff Count */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-900 dark:text-[#F3EFE6] mb-1">
                المدير المسؤول
              </label>
              <input
                type="text"
                value={headAr}
                onChange={e => setHeadAr(e.target.value)}
                placeholder="اسم مدير الإدارة أو القسم"
                className="w-full min-h-[42px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-[#243628] bg-slate-50 dark:bg-[#17231A] text-slate-900 dark:text-[#F3EFE6] font-medium focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-900 dark:text-[#F3EFE6] mb-1">
                عدد الموظفين الحاليين
              </label>
              <input
                type="number"
                min="0"
                value={staffCount}
                onChange={e => setStaffCount(e.target.value)}
                placeholder="0"
                className="w-full min-h-[42px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-[#243628] bg-slate-50 dark:bg-[#17231A] text-slate-900 dark:text-[#F3EFE6] font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* 5. Company & Branch Linkage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-900 dark:text-[#F3EFE6] mb-1">
                الشركة التابعة لها
              </label>
              <select
                value={companyId}
                onChange={e => setCompanyId(e.target.value)}
                className="w-full min-h-[42px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-[#243628] bg-slate-50 dark:bg-[#17231A] text-slate-900 dark:text-[#F3EFE6] font-medium focus:outline-none focus:border-amber-500"
              >
                {companies.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nameAr}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-900 dark:text-[#F3EFE6] mb-1">
                المقر / الفرع / الموقع المرتبط
              </label>
              <select
                value={branchId}
                onChange={e => setBranchId(e.target.value)}
                className="w-full min-h-[42px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-[#243628] bg-slate-50 dark:bg-[#17231A] text-slate-900 dark:text-[#F3EFE6] font-medium focus:outline-none focus:border-amber-500"
              >
                <option value="">المقر الرئيسي</option>
                {availableBranches.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.nameAr} ({b.cityAr})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 6. Sub-units tags */}
          <div>
            <label className="block font-bold text-slate-900 dark:text-[#F3EFE6] mb-1">
              الأقسام والوحدات التابعة (Tags)
            </label>
            <div className="flex gap-2 mb-2">
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

          {/* 7. Responsibilities */}
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
              className="min-h-[42px] px-6 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
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
                className="min-h-[42px] px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
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
