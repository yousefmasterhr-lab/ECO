import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../../context/LanguageContext';
import { useFinancial } from '../../../context/FinancialContext';
import { AccountNode } from '../../../services/database/types';
import { flattenAccountTree } from '../../../services/database/treeBuilder';
import { AccountDetailDrawer } from './AccountDetailDrawer';
import { toast } from '@erp/ui-system';
import {
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Search,
  Folder,
  FolderOpen,
  FileText,
  Filter,
  Maximize2,
  Minimize2,
  Eye,
} from 'lucide-react';

interface AccountTreeNodeRowProps {
  node: AccountNode;
  level: number;
  expandedNodes: Set<string>;
  onToggle: (id: string) => void;
  onSelect: (node: AccountNode) => void;
  selectedId: string | null;
  searchQuery: string;
}

const AccountTreeNodeRow: React.FC<AccountTreeNodeRowProps> = ({
  node,
  level,
  expandedNodes,
  onToggle,
  onSelect,
  selectedId,
  searchQuery
}) => {
  const { isRtl, t } = useLanguage();
  const hasChildren = Boolean(node.children && node.children.length > 0);
  const isSelected = selectedId === node.id;
  const isLeaf = node.level === 5 || !hasChildren;
  const isExpanded = Boolean(hasChildren && (expandedNodes.has(node.id) || Boolean(searchQuery.trim())));

  // Level visual styles (Harmonized with Reception & Visitors Module hierarchy)
  const getLevelBadge = () => {
    if (isLeaf || node.level === 5) {
      return {
        bg: 'bg-amber-50/80 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40 font-bold text-[10px] px-1.5 py-0.5 rounded',
        label: 'L5',
        title: t('حساب أستاذ نهائي', 'General Ledger Leaf')
      };
    }
    switch (level) {
      case 1:
        return {
          bg: 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300/70 font-bold text-[10px] px-1.5 py-0.5 rounded',
          label: 'L1',
          title: t('رئيسي', 'Root')
        };
      case 2:
        return {
          bg: 'bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-700 text-[10px] px-1.5 py-0.5 rounded font-semibold',
          label: 'L2',
          title: t('مساعد', 'Branch')
        };
      case 3:
        return {
          bg: 'bg-stone-100 dark:bg-stone-800/80 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 text-[10px] px-1.5 py-0.5 rounded',
          label: 'L3',
          title: t('فرعي', 'Aux')
        };
      case 4:
        return {
          bg: 'bg-stone-100/60 dark:bg-stone-800/60 text-stone-600 dark:text-stone-400 border border-stone-200/60 dark:border-stone-700/70 text-[10px] px-1.5 py-0.5 rounded',
          label: 'L4',
          title: t('تحليلي', 'Sub')
        };
      default:
        return {
          bg: 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300 border border-stone-300/60 text-[10px] px-1.5 py-0.5 rounded',
          label: `L${level}`,
          title: ''
        };
    }
  };

  const badge = getLevelBadge();

  // Indentation padding per visual hierarchy depth
  const indentPx = (level - 1) * 20;

  // Subtle right-hand guide lines for child accounts (L2 to L5)
  const guideLineClass = level > 1
    ? (isRtl ? 'border-r border-stone-200 dark:border-stone-800 pr-3 mr-1' : 'border-l border-stone-200 dark:border-stone-800 pl-3 ml-1')
    : '';

  return (
    <div className={`flex flex-col select-none ${guideLineClass}`}>
      <div
        onClick={() => {
          if (hasChildren) {
            onToggle(node.id);
          } else {
            onSelect(node);
          }
        }}
        style={{
          paddingInlineStart: `${indentPx + 10}px`,
        }}
        className={`group flex items-center justify-between gap-3 py-2 px-3 rounded-xl border transition-all cursor-pointer ${
          isSelected
            ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-300/70 dark:border-amber-700/50 shadow-xs'
            : level === 1
            ? 'bg-stone-50/90 dark:bg-stone-800/80 border-stone-200/90 dark:border-stone-700/80 hover:bg-[#F2ECE4]/60 dark:hover:bg-stone-800'
            : level === 2
            ? 'bg-white/80 dark:bg-stone-900 border-stone-200/70 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800'
            : 'bg-transparent border-transparent hover:bg-stone-100/60 dark:hover:bg-stone-800/50'
        }`}
      >
        {/* Left Side: Expand Chevron + Icon + Code + Name */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {/* Chevron expander or leaf bullet */}
          {hasChildren ? (
            <button
              onClick={e => {
                e.stopPropagation();
                onToggle(node.id);
              }}
              className="w-6 h-6 rounded-lg flex items-center justify-center text-stone-400 dark:text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors shrink-0"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              ) : isRtl ? (
                <ChevronLeft className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          ) : (
            <div className="w-6 h-6 flex items-center justify-center shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-stone-300 dark:bg-stone-600" />
            </div>
          )}

          {/* Icon */}
          <div className="shrink-0 text-stone-400 dark:text-stone-500">
            {isLeaf ? (
              <FileText className="w-4 h-4 text-stone-400 dark:text-stone-500" />
            ) : isExpanded ? (
              <FolderOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            ) : (
              <Folder className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            )}
          </div>

          {/* Level Pill */}
          <span
            className={`font-mono shrink-0 ${badge.bg}`}
            title={badge.title}
          >
            {badge.label}
          </span>

          {/* Account Code */}
          <span className="font-mono text-xs font-semibold text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded border border-stone-200 dark:border-stone-700 tracking-wider shrink-0">
            {node.code}
          </span>

          {/* Account Title */}
          <span
            className={`truncate text-xs sm:text-sm ${
              level === 1
                ? 'text-stone-950 dark:text-white font-bold'
                : level === 2
                ? 'text-stone-900 dark:text-stone-100 font-semibold'
                : 'text-stone-800 dark:text-stone-200 font-medium'
            }`}
          >
            {node.nameAr}
          </span>
        </div>

        {/* Right Side: Badges & Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Live Balance Badge (Clean, Legible Financial Badge) */}
          {node.balance !== undefined && Math.abs(node.balance) > 0.001 && (
            <span className="font-mono font-semibold text-stone-800 dark:text-stone-200 px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 border border-stone-200/70 dark:border-stone-700/50 text-xs tabular-nums flex items-center shrink-0">
              <span>{Math.abs(node.balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span className="text-xs font-normal text-stone-500 mr-1 ms-1">{t('ج.م', 'EGP')}</span>
            </span>
          )}

          {/* Nature Badge (Warm Amber for Debit / Soft Slate for Credit) */}
          <span
            className={`text-[11px] px-2 py-0.5 rounded-full font-medium border ${
              node.nature === 0
                ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/50'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
            }`}
          >
            {node.natureLabelAr}
          </span>

          {/* Statement Type Badge on Higher Levels */}
          {node.level <= 3 && (
            <span className="hidden md:inline-flex text-[10px] font-medium px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200/80 dark:border-stone-700/80">
              {node.statementType === 'BALANCE_SHEET' ? t('ميزانية', 'Balance') : t('دخل', 'Income')}
            </span>
          )}

          {/* Leaf Count Badge for non-leaf accounts */}
          {hasChildren && (
            <span className="text-[10.5px] font-medium px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200/80 dark:border-stone-700/80 font-mono">
              {node.leafCount} {t('حساب', 'accts')}
            </span>
          )}

          {/* Quick Details Trigger */}
          <button
            onClick={e => {
              e.stopPropagation();
              onSelect(node);
            }}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            title={t('عرض التفاصيل المحاسبية', 'View Account Details')}
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Children Container with Smooth Animation */}
      {hasChildren && isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.15 }}
          className="relative"
        >
          {/* Tree guide line */}
          <div
            style={{
              insetInlineStart: `${indentPx + 20}px`,
            }}
            className="absolute top-0 bottom-2 w-px bg-stone-200 dark:bg-stone-800"
          />

          <div className="space-y-1 pt-1">
            {node.children.map(child => (
              <AccountTreeNodeRow
                key={child.id}
                node={child}
                level={level + 1}
                expandedNodes={expandedNodes}
                onToggle={onToggle}
                onSelect={onSelect}
                selectedId={selectedId}
                searchQuery={searchQuery}
              />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export const ChartOfAccountsTree: React.FC = () => {
  const { t } = useLanguage();
  const {
    accounts,
    isLoading,
    searchQuery,
    setSearchQuery,
    filterNature,
    setFilterNature,
    filterStatement,
    setFilterStatement,
    selectedAccount,
    setSelectedAccount
  } = useFinancial();

  // Smart Tree Hierarchy Flattening:
  // Automatically bypass redundant duplicate levels (e.g. L1 'الأصول' -> L2 'الأصول')
  // and promote functional branches directly under root categories.
  const treeAccounts = useMemo(() => {
    return flattenAccountTree(accounts);
  }, [accounts]);

  // Centralized Controlled State for Expanded Nodes
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Automatically initialize with Level 1 accounts when data loads
  useEffect(() => {
    if (treeAccounts.length > 0) {
      setExpandedNodes(prev => {
        if (prev.size === 0) {
          return new Set(treeAccounts.map(a => a.id));
        }
        return prev;
      });
    }
  }, [treeAccounts]);

  // Toggle single node expansion
  const handleToggleNode = useCallback((nodeId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  // Search & Filter Logic
  const filteredAccounts = useMemo(() => {
    if (!searchQuery.trim() && filterNature === 'ALL' && filterStatement === 'ALL') {
      return treeAccounts;
    }

    const query = searchQuery.trim().toLowerCase();

    // Filter tree recursively while keeping ancestors of matching nodes
    const filterNode = (node: AccountNode): AccountNode | null => {
      const matchesSearch =
        !query ||
        node.code.toLowerCase().includes(query) ||
        node.nameAr.toLowerCase().includes(query) ||
        node.nameEn.toLowerCase().includes(query);

      const matchesNature =
        filterNature === 'ALL' ||
        (node.level === 5 ? node.nature === filterNature : true);

      const matchesStatement =
        filterStatement === 'ALL' ||
        node.statementType === filterStatement;

      // Filter children
      const matchingChildren = node.children
        .map(child => filterNode(child))
        .filter((child): child is AccountNode => child !== null);

      if (matchingChildren.length > 0) {
        return {
          ...node,
          children: matchingChildren,
          leafCount: matchingChildren.reduce((acc, c) => acc + c.leafCount, 0),
        };
      }

      if (matchesSearch && matchesNature && matchesStatement) {
        return { ...node };
      }

      return null;
    };

    return treeAccounts
      .map(root => filterNode(root))
      .filter((root): root is AccountNode => root !== null);
  }, [treeAccounts, searchQuery, filterNature, filterStatement]);

  // Expand all branches recursively
  const handleExpandAll = useCallback(() => {
    const allIds = new Set<string>();
    const collect = (nodes: AccountNode[]) => {
      for (const n of nodes) {
        if (n.children && n.children.length > 0) {
          allIds.add(n.id);
          collect(n.children);
        }
      }
    };
    collect(filteredAccounts);
    setExpandedNodes(allIds);
    toast.info(
      t('تم توسيع الدليل بالكامل', 'All branches expanded'),
      `${allIds.size} ${t('مستوى محاسبي مفتوح', 'branch levels open')}`
    );
  }, [filteredAccounts, t]);

  // Collapse all branches
  const handleCollapseAll = useCallback(() => {
    setExpandedNodes(new Set());
    toast.info(
      t('تم طي الدليل المحاسبي', 'All branches collapsed'),
      t('عرض الحسابات الرئيسية فقط', 'Showing root accounts only')
    );
  }, [t]);

  return (
    <div className="w-full space-y-4">
      {/* Search, Filters & Action Toolbar (Warm Amber & Sand Palette) */}
      <div className="p-4 rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 space-y-3.5 shadow-xs">
        {/* Top Row: Search Input + Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box with Inset Rings & Smooth RTL Padding */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute inset-y-0 my-auto start-3.5 text-stone-400 dark:text-stone-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t(
                'بحث برمز الحساب أو الاسم بالعربية/الإنجليزية (مثال: 1201001، الخزينة، بنك مصر)...',
                'Search by code or account name...'
              )}
              className="w-full ps-10 pe-10 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-200/80 dark:border-stone-700 bg-stone-50/70 dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 my-auto end-3 text-xs text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Expand/Collapse Action Buttons */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handleExpandAll}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium border border-stone-200/80 dark:border-stone-700 bg-[#FAF8F5] dark:bg-stone-800 hover:bg-[#F2ECE4] dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 transition-colors cursor-pointer"
              title={t('توسيع كافة المستويات', 'Expand All')}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>{t('توسيع الكل', 'Expand All')}</span>
            </button>

            <button
              onClick={handleCollapseAll}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium border border-stone-200/80 dark:border-stone-700 bg-[#FAF8F5] dark:bg-stone-800 hover:bg-[#F2ECE4] dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 transition-colors cursor-pointer"
              title={t('طي إلى الحسابات الرئيسية فقط', 'Collapse All')}
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span>{t('طي الكل', 'Collapse All')}</span>
            </button>
          </div>
        </div>

        {/* Filter Chips Bar (Warm Amber Surface for Active / Warm Neutral for Inactive) */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-200/60 dark:border-stone-800 text-xs">
          <span className="text-stone-500 dark:text-stone-400 font-medium text-[11px] flex items-center gap-1">
            <Filter className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            {t('تصفية حسب الطبيعة:', 'Nature:')}
          </span>

          <button
            onClick={() => setFilterNature('ALL')}
            className={`cursor-pointer transition-all ${
              filterNature === 'ALL'
                ? 'bg-amber-600 hover:bg-amber-700 text-white font-medium shadow-xs border border-amber-700/30 px-3.5 py-1.5 rounded-lg text-xs'
                : 'bg-[#FAF8F5] dark:bg-stone-800 hover:bg-[#F2ECE4] dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 border border-stone-200/80 dark:border-stone-700 px-3.5 py-1.5 rounded-lg text-xs font-normal'
            }`}
          >
            {t('جميع الحسابات', 'All')}
          </button>

          <button
            onClick={() => setFilterNature(0)}
            className={`cursor-pointer transition-all ${
              filterNature === 0
                ? 'bg-amber-600 hover:bg-amber-700 text-white font-medium shadow-xs border border-amber-700/30 px-3.5 py-1.5 rounded-lg text-xs'
                : 'bg-[#FAF8F5] dark:bg-stone-800 hover:bg-[#F2ECE4] dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 border border-stone-200/80 dark:border-stone-700 px-3.5 py-1.5 rounded-lg text-xs font-normal'
            }`}
          >
            {t('مدين فقط (Debit)', 'Debit Only')}
          </button>

          <button
            onClick={() => setFilterNature(1)}
            className={`cursor-pointer transition-all ${
              filterNature === 1
                ? 'bg-amber-600 hover:bg-amber-700 text-white font-medium shadow-xs border border-amber-700/30 px-3.5 py-1.5 rounded-lg text-xs'
                : 'bg-[#FAF8F5] dark:bg-stone-800 hover:bg-[#F2ECE4] dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 border border-stone-200/80 dark:border-stone-700 px-3.5 py-1.5 rounded-lg text-xs font-normal'
            }`}
          >
            {t('دائن فقط (Credit)', 'Credit Only')}
          </button>

          <span className="ms-2 text-stone-500 dark:text-stone-400 font-medium text-[11px]">
            {t('القائمة:', 'Statement:')}
          </span>

          <button
            onClick={() => setFilterStatement('ALL')}
            className={`cursor-pointer transition-all ${
              filterStatement === 'ALL'
                ? 'bg-amber-600 hover:bg-amber-700 text-white font-medium shadow-xs border border-amber-700/30 px-3.5 py-1.5 rounded-lg text-xs'
                : 'bg-[#FAF8F5] dark:bg-stone-800 hover:bg-[#F2ECE4] dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 border border-stone-200/80 dark:border-stone-700 px-3.5 py-1.5 rounded-lg text-xs font-normal'
            }`}
          >
            {t('الكل', 'All')}
          </button>

          <button
            onClick={() => setFilterStatement('BALANCE_SHEET')}
            className={`cursor-pointer transition-all ${
              filterStatement === 'BALANCE_SHEET'
                ? 'bg-amber-600 hover:bg-amber-700 text-white font-medium shadow-xs border border-amber-700/30 px-3.5 py-1.5 rounded-lg text-xs'
                : 'bg-[#FAF8F5] dark:bg-stone-800 hover:bg-[#F2ECE4] dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 border border-stone-200/80 dark:border-stone-700 px-3.5 py-1.5 rounded-lg text-xs font-normal'
            }`}
          >
            {t('ميزانية عمومية (أصول / خصوم)', 'Balance Sheet')}
          </button>

          <button
            onClick={() => setFilterStatement('INCOME_STATEMENT')}
            className={`cursor-pointer transition-all ${
              filterStatement === 'INCOME_STATEMENT'
                ? 'bg-amber-600 hover:bg-amber-700 text-white font-medium shadow-xs border border-amber-700/30 px-3.5 py-1.5 rounded-lg text-xs'
                : 'bg-[#FAF8F5] dark:bg-stone-800 hover:bg-[#F2ECE4] dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 border border-stone-200/80 dark:border-stone-700 px-3.5 py-1.5 rounded-lg text-xs font-normal'
            }`}
          >
            {t('قائمة الدخل (مصروفات / تكاليف)', 'Income Statement')}
          </button>
        </div>
      </div>

      {/* Tree Content Container (Elevated Modern Canvas) */}
      <div className="rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 p-4 sm:p-5 shadow-xs">
        {isLoading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 border-3 border-amber-600 dark:border-amber-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">
              {t('جارِ تحميل شجرة الحسابات المحاسبية...', 'Loading Chart of Accounts...')}
            </span>
          </div>
        ) : filteredAccounts.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
              {t('لم يتم العثور على حسابات مطابقة', 'No matching accounts found')}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm">
              {t(
                'جرّب تعديل كلمة البحث أو إعادة تعيين فلاتر طبيعة الحساب أو القائمة المالية.',
                'Try adjusting search keywords or clearing active filters.'
              )}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredAccounts.map(rootNode => (
              <AccountTreeNodeRow
                key={rootNode.id}
                node={rootNode}
                level={1}
                expandedNodes={expandedNodes}
                onToggle={handleToggleNode}
                onSelect={setSelectedAccount}
                selectedId={selectedAccount?.id || null}
                searchQuery={searchQuery}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail Drawer Modal */}
      <AccountDetailDrawer
        account={selectedAccount}
        onClose={() => setSelectedAccount(null)}
      />
    </div>
  );
};
