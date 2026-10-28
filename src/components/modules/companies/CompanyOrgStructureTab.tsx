import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GitFork,
  LayoutGrid,
  Network,
  Plus,
  Pencil,
  AlertCircle,
  Trash2,
  User,
  Building2,
  MapPin,
  X,
  AlertTriangle,
  Layers,
  FolderTree,
  Check,
  Sparkles,
  Zap,
  Info,
  ChevronDown,
  ChevronUp
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

interface LevelFilterDropdownProps {
  selectedLevel: number | 'all';
  onSelectLevel: (level: number | 'all') => void;
}

const LEVEL_OPTIONS: {
  value: number | 'all';
  label: string;
  subtitle: string;
  icon: string;
  dotClass: string;
}[] = [
  {
    value: 'all',
    label: 'كل المستويات الهيكلية',
    subtitle: 'عرض الشجرة بالكامل دون فلترة',
    icon: '🌐',
    dotClass: 'bg-amber-500'
  },
  {
    value: 0,
    label: 'المستوى 1: القيادة والإدارة العليا',
    subtitle: 'مجلس الإدارة والرئيس التنفيذي',
    icon: '👑',
    dotClass: 'bg-amber-500'
  },
  {
    value: 1,
    label: 'المستوى 2: الإدارات العامة والتنفيذية',
    subtitle: 'مديرو المشروعات والمكاتب الفنية والمالية',
    icon: '🏢',
    dotClass: 'bg-teal-500'
  },
  {
    value: 2,
    label: 'المستوى 3: الأقسام الفرعية والفرق',
    subtitle: 'رؤساء الأقسام وفرق العمل المتخصصة',
    icon: '📂',
    dotClass: 'bg-emerald-500'
  },
  {
    value: 3,
    label: 'المستوى 4: المهام التخصصية والوحدات',
    subtitle: 'مهندسو التنفيذ، المحاسبون، والفنيون',
    icon: '⚡',
    dotClass: 'bg-stone-500'
  }
];

const LevelFilterDropdown: React.FC<LevelFilterDropdownProps> = ({
  selectedLevel,
  onSelectLevel
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeOption = useMemo(() => {
    return LEVEL_OPTIONS.find(opt => opt.value === selectedLevel) || LEVEL_OPTIONS[0];
  }, [selectedLevel]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative inline-block text-start">
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className="h-9 min-h-[36px] flex items-center justify-between gap-2.5 px-3.5 rounded-xl border border-amber-500/30 bg-white/90 dark:bg-[#0D1F17]/90 text-xs font-bold text-slate-800 dark:text-stone-200 hover:border-amber-400 transition-all shadow-xs cursor-pointer"
        title="تصفية حسب المستوى الهيكلي"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm shrink-0">{activeOption.icon}</span>
          <span className={`w-2 h-2 rounded-full ${activeOption.dotClass}`} />
          <span className="truncate max-w-[170px] sm:max-w-[210px]">{activeOption.label}</span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-amber-500 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-1.5 start-0 w-72 rounded-2xl bg-white/95 dark:bg-[#0D1F17]/95 backdrop-blur-xl border border-amber-500/30 shadow-2xl p-1.5 space-y-0.5 text-xs font-sans"
          >
            {LEVEL_OPTIONS.map(option => {
              const isActive = selectedLevel === option.value;
              return (
                <button
                  key={String(option.value)}
                  type="button"
                  onClick={() => {
                    onSelectLevel(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl transition-all text-start cursor-pointer ${
                    isActive
                      ? 'bg-amber-500/15 text-amber-900 dark:text-amber-200 font-bold border border-amber-500/30'
                      : 'text-slate-700 dark:text-stone-300 hover:bg-slate-100 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="text-sm shrink-0">{option.icon}</span>
                    <div className="truncate">
                      <div className="font-bold truncate text-[11.5px]">{option.label}</div>
                      <div className="text-[10px] text-slate-500 dark:text-stone-400 truncate">
                        {option.subtitle}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`w-2 h-2 rounded-full ${option.dotClass}`} />
                    {isActive && <Check className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />}
                  </div>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

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

  // 3-Way Segmented View Switcher: 'cards' | 'hierarchy' | 'mindmap'
  const [activeView, setActiveView] = useState<'cards' | 'hierarchy' | 'mindmap'>('mindmap');

  // Draft Hierarchy State for In-Memory Preview before permanent commit
  const [draftDepartments, setDraftDepartments] = useState<DepartmentOrg[] | null>(null);
  const [isCommitting, setIsCommitting] = useState(false);

  // Active departments set (draft overrides saved records for preview)
  const currentDepartments = useMemo(() => {
    return draftDepartments || departments;
  }, [draftDepartments, departments]);

  // Level & Company filters
  const [selectedLevel, setSelectedLevel] = useState<number | 'all'>('all');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('all');

  // Collapsed nodes state (for hierarchy view & tree views)
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());

  // Modal State: Add/Edit Department
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<DepartmentOrg | null>(null);
  const [prefilledParentId, setPrefilledParentId] = useState<string | null>(null);

  // Modal State: Audit Log Drawer
  const [auditModalDept, setAuditModalDept] = useState<DepartmentOrg | null>(null);

  // Modal State: Delete Confirmation
  const [deleteTargetDept, setDeleteTargetDept] = useState<DepartmentOrg | null>(null);

  // Modal State: Seed Enterprise Template Modal
  const [seedModalOpen, setSeedModalOpen] = useState(false);

  // Normalized departments with computed depth levels
  const normalizedDepartments = useMemo(() => {
    return computeHierarchyLevels(currentDepartments);
  }, [currentDepartments]);

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
      currentDepartments.filter(d => currentDepartments.some(c => c.parentId === d.id)).map(d => d.id)
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

  // Filtered departments based on company and depth level (Search input removed)
  const filteredDepartments = useMemo(() => {
    return normalizedDepartments.filter(dept => {
      const matchCompany = selectedCompanyId === 'all' || dept.companyId === selectedCompanyId;
      const matchLevel = selectedLevel === 'all' || dept.level === selectedLevel;
      return matchCompany && matchLevel;
    });
  }, [normalizedDepartments, selectedCompanyId, selectedLevel]);

  // Root departments for Hierarchical Pyramid View
  const rootDepartments = useMemo(() => {
    const list = selectedCompanyId === 'all'
      ? normalizedDepartments
      : normalizedDepartments.filter(d => d.companyId === selectedCompanyId);

    const allIds = new Set(list.map(d => d.id));
    return list.filter(d => !d.parentId || !allIds.has(d.parentId));
  }, [normalizedDepartments, selectedCompanyId]);

  // Handle Generating Draft Hierarchy (Loads 34 Standard Units in-memory)
  const handleGenerateDraft = (companyIdToSeed: string) => {
    const targetCompany = companies.find(c => c.id === companyIdToSeed) || companies[0];
    const compId = targetCompany ? targetCompany.id : 'comp_default';
    const compName = targetCompany ? targetCompany.nameAr : 'شركة المقاولات العامة';

    const draft = departmentStorage.generateDraftHierarchy(compId, compName);
    setDraftDepartments(draft);
    setSeedModalOpen(false);
  };

  // Commit Draft Hierarchy to Cloudflare D1
  const handleCommitDraft = async () => {
    if (!draftDepartments || draftDepartments.length === 0) return;
    setIsCommitting(true);
    try {
      const compId = draftDepartments[0]?.companyId || 'comp_default';
      await departmentStorage.commitHierarchy(
        draftDepartments,
        compId,
        user?.nameAr || user?.username || 'يوسف حجازي'
      );
      setDraftDepartments(null);
      if (onReloadDepartments) {
        await onReloadDepartments();
      }
    } catch (err: any) {
      console.error('[CompanyOrgStructureTab] Commit failed:', err);
      alert(err.message || 'حدث خطأ أثناء اعتماد وحفظ الهيكل القياسي');
    } finally {
      setIsCommitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* ========================================================================= */}
      {/* 2-TIER EXECUTIVE COMMAND BAR (Search Bar Completely Removed)             */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white/95 dark:bg-[#112017]/95 border border-slate-200/90 dark:border-[#1F3526] shadow-sm backdrop-blur-md space-y-4">
        {/* Tier 1: Title, 3-Way Segmented View Switcher & Primary Actions */}
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
                  التسلسل الهرمي للمؤسسة، بطاقات الأقسام، والشجرة الذهنية
                </p>
              </div>
            </div>

            {/* Live Counter Badges */}
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30 text-xs font-bold font-mono">
                {currentDepartments.length} وحدة إدارية
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30 text-xs font-bold">
                {currentDepartments.length > 0 ? `${maxDepthLevel + 1} مستويات هيكلية` : '0 مستويات'}
              </span>
            </div>
          </div>

          {/* Center: 3-Way Segmented View Switcher Pill */}
          <div className="p-1.5 rounded-xl bg-slate-100/90 dark:bg-[#07130E] border border-slate-200/80 dark:border-amber-500/20 flex items-center gap-1.5 shadow-inner">
            {/* 1. Smart Cards */}
            <button
              type="button"
              onClick={() => setActiveView('cards')}
              className={`min-h-[38px] flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeView === 'cards'
                  ? 'bg-gradient-to-l from-amber-600 to-amber-500 text-white shadow-md shadow-amber-500/20 font-bold'
                  : 'text-slate-600 dark:text-[#8FA392] hover:text-slate-900 dark:hover:text-[#F3EFE6]'
              }`}
              title="عرض البطاقات الذكية التفصيلية"
            >
              <LayoutGrid className="w-4 h-4" />
              <span>البطاقات الذكية</span>
            </button>

            {/* 2. Hierarchical Pyramid Tree */}
            <button
              type="button"
              onClick={() => setActiveView('hierarchy')}
              className={`min-h-[38px] flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeView === 'hierarchy'
                  ? 'bg-gradient-to-l from-amber-600 to-amber-500 text-white shadow-md shadow-amber-500/20 font-bold'
                  : 'text-slate-600 dark:text-[#8FA392] hover:text-slate-900 dark:hover:text-[#F3EFE6]'
              }`}
              title="عرض الهيكل الهرمي الرأسي التقليدي"
            >
              <Network className="w-4 h-4" />
              <span>الشكل الهرمي</span>
            </button>

            {/* 3. Interactive NotebookLM Mind Map */}
            <button
              type="button"
              onClick={() => setActiveView('mindmap')}
              className={`min-h-[38px] flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeView === 'mindmap'
                  ? 'bg-gradient-to-l from-amber-600 to-amber-500 text-white shadow-md shadow-amber-500/20 font-bold'
                  : 'text-slate-600 dark:text-[#8FA392] hover:text-slate-900 dark:hover:text-[#F3EFE6]'
              }`}
              title="عرض الشجرة الذهنية التفاعلية بتصميم NotebookLM"
            >
              <GitFork className="w-4 h-4" />
              <span>الشجرة الذهنية</span>
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
                <span>+ إضافة إدارة جديدة</span>
              </button>
            )}

            {hasPermission('companies.org.create') && (
              <button
                type="button"
                onClick={() => setSeedModalOpen(true)}
                className="min-h-[40px] flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                title="تحميل مسودة الهيكل القياسي المعتمد (34 وحدة إدارية)"
              >
                <Zap className="w-4 h-4 text-amber-300" />
                <span>⚡ تحميل الهيكل القياسي</span>
              </button>
            )}
          </div>
        </div>

        {/* Tier 2: Level Filter Animated Dropdown & Company Selector */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {/* Level Filter Animated Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-[#8FA392]">
              تصفية المستوى:
            </span>
            <LevelFilterDropdown
              selectedLevel={selectedLevel}
              onSelectLevel={setSelectedLevel}
            />
          </div>

          {/* Company Selector (if multiple) */}
          {companies.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 dark:text-[#8FA392]">
                الشركة:
              </span>
              <select
                value={selectedCompanyId}
                onChange={e => setSelectedCompanyId(e.target.value)}
                className="min-h-[36px] max-w-[170px] px-3 py-1 rounded-xl border border-amber-500/30 bg-white/90 dark:bg-[#0D1F17]/90 text-slate-800 dark:text-[#F3EFE6] text-xs font-bold focus:outline-none focus:border-amber-500 truncate shadow-xs"
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
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PROMINENT DRAFT / PREVIEW CONFIRMATION BANNER                             */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {draftDepartments && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-950/40 border-2 border-amber-500/50 flex flex-wrap items-center justify-between gap-3 shadow-md backdrop-blur-md"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold shadow-md shrink-0">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-black text-amber-950 dark:text-amber-200 flex items-center gap-2">
                  <span>تم تحميل مسودة الهيكل القياسي ({draftDepartments.length} وحدة إدارية) للمعاينة</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white animate-pulse">
                    مسودة غير محفوظة
                  </span>
                </h4>
                <p className="text-[11px] text-amber-800 dark:text-amber-300/90 mt-0.5">
                  يمكنك استعراض الهيكل كاملاً عبر البطاقات، الشكل الهرمي، أو الشجرة الذهنية قبل الاعتماد النهائي في المنظومة.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCommitDraft}
                disabled={isCommitting}
                className="min-h-[38px] px-4 py-2 rounded-xl bg-gradient-to-l from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white text-xs font-bold transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{isCommitting ? 'جارٍ الاعتماد والحفظ...' : 'اعتماد وحفظ الهيكل في المنظومة'}</span>
              </button>

              <button
                type="button"
                onClick={() => setDraftDepartments(null)}
                disabled={isCommitting}
                className="min-h-[38px] px-3.5 py-2 rounded-xl border border-amber-400 dark:border-amber-700 text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/30 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>إلغاء المسودة</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* EMPTY STATE VIEW                                                          */}
      {/* ========================================================================= */}
      {currentDepartments.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border-2 border-dashed border-slate-300 dark:border-[#243628] bg-white dark:bg-[#17231A]">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center mb-4">
            <FolderTree className="w-8 h-8" />
          </div>
          <h3 className="text-base font-black text-slate-900 dark:text-[#F3EFE6] mb-2">
            لم يتم تأسيس الهيكل التنظيمي للشركة بعد
          </h3>
          <p className="text-xs text-slate-500 dark:text-[#8FA392] max-w-lg mx-auto mb-6 leading-relaxed">
            يمكنك تأسيس إدارة أولى يدوياً، أو استخدام زر التحميل الفوري لمعاينة الهيكل القياسي المتكامل لشركات المقاولات (34 وحدة إدارية معتمدة).
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {hasPermission('companies.org.create') && (
              <button
                type="button"
                onClick={() => setSeedModalOpen(true)}
                className="min-h-[44px] inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white text-xs font-bold transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                <Zap className="w-4 h-4 text-white" />
                <span>⚡ تحميل الهيكل القياسي للمعاينة</span>
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
              departments={currentDepartments}
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
          {/* VIEW 2: VERTICAL HIERARCHICAL PYRAMID TREE                                 */}
          {/* ========================================================================= */}
          {activeView === 'hierarchy' && (
            <div className="w-full overflow-x-auto p-6 sm:p-8 rounded-2xl bg-[#FAF7F0] dark:bg-[#07130E] border border-amber-500/20 dark:border-amber-500/25 shadow-xl min-h-[500px]">
              {rootDepartments.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs">
                  لا توجد إدارات تطابق شروط الفلترة المحددة
                </div>
              ) : (
                <div className="flex items-start justify-center gap-10 min-w-max">
                  {rootDepartments.map(rootDept => (
                    <OrgTreeNode
                      key={rootDept.id}
                      department={rootDept}
                      allDepartments={currentDepartments}
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
          )}

          {/* ========================================================================= */}
          {/* VIEW 3: SMART CARDS GRID VIEW                                            */}
          {/* ========================================================================= */}
          {activeView === 'cards' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-[#8FA392]">
                <span className="font-bold">
                  إجمالي الوحدات المعروضة: {filteredDepartments.length} من أصل {currentDepartments.length}
                </span>
                {selectedLevel !== 'all' && (
                  <span className="text-amber-600 dark:text-amber-400 font-semibold">
                    مفلتر حسب المستوى: {selectedLevel === 0 ? 'الإدارة العليا' : `المستوى ${selectedLevel + 1}`}
                  </span>
                )}
              </div>

              {filteredDepartments.length === 0 ? (
                <div className="p-12 text-center rounded-2xl border border-slate-200 dark:border-[#243628] bg-white dark:bg-[#17231A] text-slate-400 text-xs">
                  لا توجد وحدات إدارية مطابقة لخيارات الفلترة
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredDepartments.map(dept => {
                    const parent = currentDepartments.find(d => d.id === dept.parentId);
                    const subDeptsCount = currentDepartments.filter(d => d.parentId === dept.id).length;
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
                        className={`p-5 rounded-2xl border-2 bg-white dark:bg-[#17231A] shadow-xs hover:shadow-md transition-all flex flex-col justify-between text-start ${
                          dept.isDraft
                            ? 'border-dashed border-amber-500 bg-amber-50/50 dark:bg-[#1E1908]/50'
                            : 'border-slate-200 dark:border-[#243628]'
                        }`}
                      >
                        <div>
                          {/* Card Top: Code, Cost Center & Level Badge */}
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
                              {dept.isDraft && (
                                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-500 text-white animate-pulse">
                                  مسودة
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

                        {/* Card Footer: Child count + Action Group */}
                        <div className="pt-3 border-t border-slate-200 dark:border-[#243628] flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-500 dark:text-[#8FA392]">
                            {subDeptsCount > 0 ? `${subDeptsCount} إدارات فرعية` : 'لا توجد فروع'}
                          </span>

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
            currentDepartmentsCount={currentDepartments.length}
            onClose={() => setSeedModalOpen(false)}
            onConfirm={handleGenerateDraft}
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
            departments={currentDepartments}
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
            departments={currentDepartments}
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
/* RECURSIVE HIERARCHICAL PYRAMID TREE NODE (OrgTreeNode)                    */
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
      ? 'border-t-4 border-t-teal-600'
      : level === 2
      ? 'border-t-4 border-t-emerald-600'
      : 'border-t-4 border-t-stone-500';

  return (
    <div className="flex flex-col items-center">
      {/* 1. Node Card Container */}
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className={`w-64 sm:w-72 p-3.5 rounded-2xl border-2 bg-white dark:bg-[#10241A] text-slate-900 dark:text-[#F3EFE6] shadow-sm hover:shadow-lg transition-all duration-200 relative text-start ${levelAccentBorder} ${
          department.isDraft
            ? 'border-dashed border-amber-500 bg-amber-50/60 dark:bg-[#1E1908]/60'
            : 'border-slate-200 dark:border-[#243628]'
        }`}
      >
        {/* Card Header: Code, Cost Center & Staff Count */}
        <div className="flex items-center justify-between gap-1.5 mb-2">
          <div className="flex items-center gap-1.5 flex-wrap truncate">
            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#1F2E23] text-slate-800 dark:text-[#EBB34D] border border-slate-200 dark:border-[#243628]">
              {department.code}
            </span>

            {department.costCenterCode && (
              <span
                className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50 truncate"
                title="كود مركز التكلفة الهيكلي"
              >
                {department.costCenterCode}
              </span>
            )}

            {department.isDraft && (
              <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-amber-500 text-white animate-pulse">
                مسودة
              </span>
            )}
          </div>

          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-[#1F2E23] text-slate-700 dark:text-[#8FA392] shrink-0">
            {department.staffCount} موظف
          </span>
        </div>

        {/* Department Name */}
        <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-[#F3EFE6] mb-1 leading-tight line-clamp-1">
          {department.nameAr}
        </h4>

        {/* Head / Manager */}
        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-[#8FA392] mb-2.5">
          <User className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span className="font-bold text-slate-800 dark:text-[#E2DCCE] truncate">
            {department.headAr || 'غير محدد'}
          </span>
        </div>

        {/* Action micro-buttons group */}
        <div className="pt-2 border-t border-slate-200 dark:border-[#243628] flex items-center justify-between">
          <div className="flex items-center gap-1">
            {hasPermission('companies.org.create') && (
              <button
                onClick={() => onAddSubDept(department.id)}
                className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer"
                title="إضافة قسم تابع"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              </button>
            )}

            {hasPermission('companies.org.edit') && (
              <button
                onClick={() => onEditDept(department)}
                className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors cursor-pointer"
                title="تعديل الإدارة"
              >
                <Pencil className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              </button>
            )}

            <button
              onClick={() => onViewAudit(department)}
              className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors cursor-pointer"
              title="سجل التعديلات"
            >
              <AlertCircle className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            </button>

            {hasPermission('companies.org.delete') && (
              <button
                onClick={() => onDeleteDept(department)}
                className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors cursor-pointer"
                title="حذف الإدارة"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              </button>
            )}
          </div>

          {/* Expand/Collapse Button for Branches */}
          {hasChildren && (
            <button
              onClick={() => onToggleCollapse(department.id)}
              className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-[#1F2E23] text-slate-800 dark:text-[#F3EFE6] hover:bg-slate-200 dark:hover:bg-[#243628] text-[10px] font-bold transition-colors cursor-pointer"
              title={isCollapsed ? 'توسيع الفروع' : 'طي الفروع'}
            >
              <span>{children.length}</span>
              {isCollapsed ? (
                <ChevronDown className="w-3 h-3 text-amber-500" />
              ) : (
                <ChevronUp className="w-3 h-3 text-amber-500" />
              )}
            </button>
          )}
        </div>
      </motion.div>

      {/* 2. Hierarchical Lines & Children Rendering */}
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
/* SEED HIERARCHY MODAL                                                       */
/* -------------------------------------------------------------------------- */
interface SeedHierarchyModalProps {
  isOpen: boolean;
  companies: CompanyEntity[];
  currentDepartmentsCount: number;
  onClose: () => void;
  onConfirm: (companyId: string) => void;
}

const SeedHierarchyModal: React.FC<SeedHierarchyModalProps> = ({
  companies,
  currentDepartmentsCount,
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
                مسودة معتمدة تضم 34 وحدة إدارية مقسمة على 4 مستويات تنظيمية
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-500/30 text-amber-900 dark:text-amber-200 leading-relaxed">
            <div className="flex items-center gap-2 font-bold mb-1">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>محتويات الهيكل القياسي المعتمد (34 وحدة تشغيلية):</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-[11.5px] ps-1">
              <li><strong>الرئيس التنفيذي (L0):</strong> المالك ورئيس مجلس الإدارة (1)</li>
              <li><strong>مكتب إدارة المشروعات (PMO - L1):</strong> البرامج الزمنية، الموازنات، ومراقبة الانحرافات (4)</li>
              <li><strong>المراجعة الداخلية (L1):</strong> مراجعة المستخلصات، المشتريات، وجرد المخازن (4)</li>
              <li><strong>الشؤون القانونية (L1):</strong> العقود الحكومية، عقود مقاولي الباطن، وقضايا التحكيم (4)</li>
              <li><strong>السلامة والجودة (QHSE - L1):</strong> فحص استلام الأعمال WIR/MIR وتأمين المواقع (3)</li>
              <li><strong>المشروعات والإدارة الهندسية (L1):</strong> المكتب الفني (3 أقسام) ومديرو المواقع (6)</li>
              <li><strong>الموارد البشرية (L1):</strong> التوظيف، شؤون العاملين، الخدمات الحكومية، وتكنولوجيا المعلومات (5)</li>
              <li><strong>الإدارة المالية (CFO - L1):</strong> حسابات العملاء، حسابات الموردين والخزينة (3)</li>
              <li><strong>سلاسل الإمداد والمشتريات (L1):</strong> عقود الباطن، توريد الخامات، والمخازن والورش (4)</li>
            </ul>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
            <Info className="w-4 h-4 shrink-0" />
            <span>
              {currentDepartmentsCount > 0 ? `يوجد حالياً (${currentDepartmentsCount}) وحدة مسجلة. ` : ''}
              سيتم تحميل الهيكل أولاً كمسودة للمعاينة، ولن يتم الكتابة في قاعدة البيانات الدائمة إلا بعد الضغط على &quot;اعتماد وحفظ الهيكل&quot;.
            </span>
          </div>

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
              className="min-h-[42px] px-4 py-2 rounded-xl border border-slate-300 dark:border-[#243628] text-slate-600 dark:text-[#8FA392] hover:bg-slate-100 dark:hover:bg-white/5 font-semibold text-xs cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={() => onConfirm(targetCompanyId)}
              className="min-h-[42px] px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4 text-white" />
              <span>تحميل المسودة للمعاينة فوراً</span>
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

    if (costCenterCode.trim()) {
      const codeRegex = /^[A-Za-z0-9_-]{2,20}$/;
      if (!codeRegex.test(costCenterCode.trim())) {
        setValidationError(
          'كود مركز التكلفة يجب أن يحتوي على حروف إنجليزية، أرقام، أو شرطات (-) دون مسافات (مثال: CC-101)'
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
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {validationError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
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
                className="min-h-[38px] px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-[#1F2E23] text-slate-800 dark:text-[#F3EFE6] font-bold hover:bg-slate-300 dark:hover:bg-[#243628] text-xs transition-colors shrink-0 cursor-pointer"
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
                    className="text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

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

          <div className="pt-3 border-t border-slate-200 dark:border-[#243628] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="min-h-[42px] px-4 py-2 rounded-xl border border-slate-300 dark:border-[#243628] text-slate-600 dark:text-[#8FA392] hover:bg-slate-100 dark:hover:bg-white/5 font-semibold cursor-pointer"
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
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

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

        <div className="pt-3 border-t border-slate-200 dark:border-[#243628] flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="min-h-[40px] px-5 py-2 rounded-xl bg-slate-100 dark:bg-[#1F2E23] text-slate-800 dark:text-[#F3EFE6] font-bold text-xs hover:bg-slate-200 dark:hover:bg-[#243628] transition-colors cursor-pointer"
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
                className="min-h-[42px] px-5 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-900 transition-colors cursor-pointer"
              >
                فهمت ذلك - إغلاق
              </button>
            </div>
          </div>
        ) : (
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
                className="min-h-[42px] px-4 py-2 rounded-xl border border-slate-300 dark:border-[#243628] text-slate-600 dark:text-[#8FA392] hover:bg-slate-100 dark:hover:bg-white/5 font-semibold text-xs cursor-pointer"
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
