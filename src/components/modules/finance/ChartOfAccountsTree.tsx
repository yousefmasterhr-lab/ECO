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

  // Level visual styles
  const getLevelBadge = () => {
    if (isLeaf) {
      return {
        bg: 'bg-[#1F2E23] text-[#F3EFE6] dark:text-[#EBB34D] border-[#243628]',
        label: 'L5',
        title: t('تحليلي ختامي', 'Leaf')
      };
    }
    switch (level) {
      case 1:
        return {
          bg: 'bg-[#EBB34D]/15 text-[#D99B26] dark:text-[#EBB34D] border-[#EBB34D]/30',
          label: 'L1',
          title: t('أصل رئيسي', 'Root')
        };
      case 2:
        return {
          bg: 'bg-[#8FA392]/15 text-[#5C665E] dark:text-[#8FA392] border-[#8FA392]/30',
          label: 'L2',
          title: t('فرع رئيسي', 'Branch')
        };
      case 3:
        return {
          bg: 'bg-[#D99B26]/10 text-[#C58F38] dark:text-[#F5C76D] border-[#D99B26]/25',
          label: 'L3',
          title: t('مساعد', 'Aux')
        };
      case 4:
        return {
          bg: 'bg-[#8FA392]/10 text-[#5C665E] dark:text-[#A3B8A6] border-[#8FA392]/25',
          label: 'L4',
          title: t('فرعي', 'Sub')
        };
      default:
        return {
          bg: 'bg-[#F3EFE6] dark:bg-[#17231A] text-[#5C665E] dark:text-[#8FA392] border-[#E0D9CB] dark:border-[#243628]',
          label: `L${level}`,
          title: ''
        };
    }
  };

  const badge = getLevelBadge();

  // Indentation padding per visual hierarchy depth
  const indentPx = (level - 1) * 24;

  return (
    <div className="flex flex-col select-none">
      <div
        onClick={() => {
          if (hasChildren) {
            onToggle(node.id);
          } else {
            onSelect(node);
          }
        }}
        style={{
          paddingInlineStart: `${indentPx + 12}px`,
        }}
        className={`group flex items-center justify-between gap-3 py-2.5 px-3 rounded-xl border transition-all cursor-pointer ${
          isSelected
            ? 'bg-[#D99B26]/15 dark:bg-[#EBB34D]/15 border-[#D99B26]/50 dark:border-[#EBB34D]/50 shadow-xs'
            : level === 1
            ? 'bg-[#F3EFE6] dark:bg-[#17231A] border-[#E0D9CB] dark:border-[#243628] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23]'
            : level === 2
            ? 'bg-[#FBF9F5] dark:bg-[#141E16] border-[#E0D9CB]/80 dark:border-[#243628]/80 hover:bg-[#F3EFE6] dark:hover:bg-[#1F2E23]'
            : 'bg-transparent border-transparent hover:bg-[#F3EFE6]/60 dark:hover:bg-[#17231A]/60'
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
              className="w-6 h-6 rounded-lg flex items-center justify-center text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6] hover:bg-[#EAE4D7] dark:hover:bg-[#243628] transition-colors shrink-0"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-[#D99B26] dark:text-[#EBB34D]" />
              ) : isRtl ? (
                <ChevronLeft className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          ) : (
            <div className="w-6 h-6 flex items-center justify-center shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8FA392] opacity-80" />
            </div>
          )}

          {/* Icon */}
          <div className="shrink-0 text-[#5C665E] dark:text-[#8FA392]">
            {isLeaf ? (
              <FileText className="w-4 h-4 text-[#8FA392]" />
            ) : isExpanded ? (
              <FolderOpen className="w-4 h-4 text-[#D99B26] dark:text-[#EBB34D]" />
            ) : (
              <Folder className="w-4 h-4 text-[#D99B26] dark:text-[#EBB34D]" />
            )}
          </div>

          {/* Level Pill */}
          <span
            className={`text-[10px] font-black px-1.5 py-0.5 rounded-md border shrink-0 font-mono ${badge.bg}`}
          >
            {badge.label}
          </span>

          {/* Account Code */}
          <span className="font-mono text-xs font-bold text-[#D99B26] dark:text-[#EBB34D] tracking-wider shrink-0 bg-[#D99B26]/10 dark:bg-[#EBB34D]/10 px-2 py-0.5 rounded-md border border-[#D99B26]/20 dark:border-[#EBB34D]/20">
            {node.code}
          </span>

          {/* Account Title */}
          <span
            className={`truncate text-xs sm:text-sm font-bold ${
              level === 1
                ? 'text-[#1A241C] dark:text-[#F3EFE6] font-extrabold'
                : level === 2
                ? 'text-[#1A241C] dark:text-[#F3EFE6]'
                : 'text-[#2C382F] dark:text-[#E0EBE2]'
            }`}
          >
            {node.nameAr}
          </span>
        </div>

        {/* Right Side: Badges & Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Live Balance Badge */}
          {node.balance !== undefined && Math.abs(node.balance) > 0.001 && (
            <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded-md bg-[#1F2E23] text-[#EBB34D] border border-[#243628] tabular-nums">
              {Math.abs(node.balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {t('ج.م', 'EGP')}
            </span>
          )}

          {/* Nature Badge */}
          <span
            className={`text-[10.5px] font-bold px-2 py-0.5 rounded-md border ${
              node.nature === 0
                ? 'bg-[#2A3F30] text-[#A3CFAC] border-[#37533E]'
                : 'bg-[#3F2A2A] text-[#EFA3A3] border-[#533737]'
            }`}
          >
            {node.natureLabelAr}
          </span>

          {/* Statement Type Badge on Higher Levels */}
          {node.level <= 3 && (
            <span className="hidden md:inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#F3EFE6] dark:bg-[#17231A] text-[#5C665E] dark:text-[#8FA392] border border-[#E0D9CB] dark:border-[#243628]">
              {node.statementType === 'BALANCE_SHEET' ? t('ميزانية', 'Balance') : t('دخل', 'Income')}
            </span>
          )}

          {/* Leaf Count Badge for non-leaf accounts */}
          {hasChildren && (
            <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-md bg-[#EAE4D7] dark:bg-[#1F2E23] text-[#5C665E] dark:text-[#8FA392] border border-[#E0D9CB] dark:border-[#243628] font-mono">
              {node.leafCount} {t('حساب', 'accts')}
            </span>
          )}

          {/* Quick Details Trigger */}
          <button
            onClick={e => {
              e.stopPropagation();
              onSelect(node);
            }}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#5C665E] dark:text-[#8FA392] hover:text-[#D99B26] dark:hover:text-[#EBB34D] hover:bg-[#D99B26]/10 transition-colors"
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
              insetInlineStart: `${indentPx + 23}px`,
            }}
            className="absolute top-0 bottom-2 w-px bg-[#E0D9CB]/80 dark:bg-[#243628]/80"
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
      {/* Search, Filters & Action Toolbar */}
      <div className="p-4 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] space-y-3.5 shadow-2xs">
        {/* Top Row: Search Input + Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute inset-y-0 my-auto start-3.5 text-[#5C665E] dark:text-[#8FA392]" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t(
                'بحث برمز الحساب أو الاسم بالعربية/الإنجليزية (مثال: 1201001، الخزينة، بنك مصر)...',
                'Search by code or account name...'
              )}
              className="w-full ps-10 pe-4 py-2 text-xs sm:text-sm rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#121B14] text-[#1A241C] dark:text-[#F3EFE6] placeholder-[#5C665E]/70 dark:placeholder-[#8FA392]/60 focus:outline-hidden focus:border-[#D99B26] dark:focus:border-[#EBB34D] transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 my-auto end-3 text-xs text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6] cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Expand/Collapse Action Buttons */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handleExpandAll}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#121B14] text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23] transition-all cursor-pointer"
              title={t('توسيع كافة المستويات', 'Expand All')}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>{t('توسيع الكل', 'Expand All')}</span>
            </button>

            <button
              onClick={handleCollapseAll}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#121B14] text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23] transition-all cursor-pointer"
              title={t('طي إلى الحسابات الرئيسية فقط', 'Collapse All')}
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span>{t('طي الكل', 'Collapse All')}</span>
            </button>
          </div>
        </div>

        {/* Filter Chips Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#E0D9CB]/60 dark:border-[#243628]/60 text-xs">
          <span className="text-[#5C665E] dark:text-[#8FA392] font-semibold text-[11px] flex items-center gap-1">
            <Filter className="w-3 h-3 text-[#D99B26] dark:text-[#EBB34D]" />
            {t('تصفية حسب الطبيعة:', 'Nature:')}
          </span>

          <button
            onClick={() => setFilterNature('ALL')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterNature === 'ALL'
                ? 'bg-[#D99B26] dark:bg-[#EBB34D] text-white dark:text-[#121B14] shadow-2xs'
                : 'bg-[#FBF9F5] dark:bg-[#121B14] text-[#5C665E] dark:text-[#8FA392] border border-[#E0D9CB] dark:border-[#243628]'
            }`}
          >
            {t('جميع الحسابات', 'All')}
          </button>

          <button
            onClick={() => setFilterNature(0)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterNature === 0
                ? 'bg-[#2A3F30] text-[#A3CFAC] border border-[#37533E] shadow-2xs'
                : 'bg-[#FBF9F5] dark:bg-[#121B14] text-[#5C665E] dark:text-[#8FA392] border border-[#E0D9CB] dark:border-[#243628]'
            }`}
          >
            {t('مدين فقط (Debit)', 'Debit Only')}
          </button>

          <button
            onClick={() => setFilterNature(1)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterNature === 1
                ? 'bg-[#3F2A2A] text-[#EFA3A3] border border-[#533737] shadow-2xs'
                : 'bg-[#FBF9F5] dark:bg-[#121B14] text-[#5C665E] dark:text-[#8FA392] border border-[#E0D9CB] dark:border-[#243628]'
            }`}
          >
            {t('دائن فقط (Credit)', 'Credit Only')}
          </button>

          <span className="ms-2 text-[#5C665E] dark:text-[#8FA392] font-semibold text-[11px]">
            {t('القائمة:', 'Statement:')}
          </span>

          <button
            onClick={() => setFilterStatement('ALL')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterStatement === 'ALL'
                ? 'bg-[#D99B26] dark:bg-[#EBB34D] text-white dark:text-[#121B14] shadow-2xs'
                : 'bg-[#FBF9F5] dark:bg-[#121B14] text-[#5C665E] dark:text-[#8FA392] border border-[#E0D9CB] dark:border-[#243628]'
            }`}
          >
            {t('الكل', 'All')}
          </button>

          <button
            onClick={() => setFilterStatement('BALANCE_SHEET')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterStatement === 'BALANCE_SHEET'
                ? 'bg-[#D99B26] dark:bg-[#EBB34D] text-white dark:text-[#121B14] shadow-2xs'
                : 'bg-[#FBF9F5] dark:bg-[#121B14] text-[#5C665E] dark:text-[#8FA392] border border-[#E0D9CB] dark:border-[#243628]'
            }`}
          >
            {t('ميزانية عمومية (أصول / خصوم)', 'Balance Sheet')}
          </button>

          <button
            onClick={() => setFilterStatement('INCOME_STATEMENT')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterStatement === 'INCOME_STATEMENT'
                ? 'bg-[#D99B26] dark:bg-[#EBB34D] text-white dark:text-[#121B14] shadow-2xs'
                : 'bg-[#FBF9F5] dark:bg-[#121B14] text-[#5C665E] dark:text-[#8FA392] border border-[#E0D9CB] dark:border-[#243628]'
            }`}
          >
            {t('قائمة الدخل (مصروفات / تكاليف)', 'Income Statement')}
          </button>
        </div>
      </div>

      {/* Tree Content Container */}
      <div className="rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] p-4 sm:p-5 shadow-xs">
        {isLoading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 border-3 border-[#D99B26] dark:border-[#EBB34D] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6]">
              {t('جارِ تحميل شجرة الحسابات المحاسبية...', 'Loading Chart of Accounts...')}
            </span>
          </div>
        ) : filteredAccounts.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#D99B26]/10 text-[#D99B26] dark:text-[#EBB34D] flex items-center justify-center">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-[#1A241C] dark:text-[#F3EFE6]">
              {t('لم يتم العثور على حسابات مطابقة', 'No matching accounts found')}
            </h3>
            <p className="text-xs text-[#5C665E] dark:text-[#8FA392] max-w-sm">
              {t(
                'جرّب تعديل كلمة البحث أو إعادة تعيين فلاتر طبيعة الحساب أو القائمة المالية.',
                'Try adjusting search keywords or clearing active filters.'
              )}
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
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
