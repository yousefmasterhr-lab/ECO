import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../../context/LanguageContext';
import { useFinancial } from '../../../context/FinancialContext';
import { AccountNode } from '../../../services/database/types';
import { flattenAccountTree } from '../../../services/database/treeBuilder';
import { AccountDetailDrawer } from './AccountDetailDrawer';
import { toast } from '@erp/ui-system';
import {
  ChevronDown,
  Search,
  Folder,
  FolderOpen,
  FileText,
  Filter,
  Maximize2,
  Minimize2,
  Eye
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
  const { t } = useLanguage();
  const hasChildren = Boolean(node.children && node.children.length > 0);
  const isSelected = selectedId === node.id;
  const isLeaf = node.level === 5 || !hasChildren;
  const isExpanded = Boolean(hasChildren && (expandedNodes.has(node.id) || Boolean(searchQuery.trim())));

  // Level visual styles (Harmonized with General Journal & Eco ERP Brand Tokens)
  const getLevelBadge = () => {
    if (isLeaf || node.level === 5) {
      return {
        bg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-bold text-[10px] px-1.5 py-0.5 rounded-md',
        label: 'L5',
        title: t('حساب أستاذ نهائي', 'General Ledger Leaf')
      };
    }
    switch (level) {
      case 1:
        return {
          bg: 'bg-[#059669]/15 text-[#059669] dark:text-[#34D399] border border-[#059669]/30 font-bold text-[10px] px-1.5 py-0.5 rounded-md',
          label: 'L1',
          title: t('رئيسي', 'Root')
        };
      case 2:
        return {
          bg: 'bg-[#F3EFE6] dark:bg-[#1A241C] text-[#1A241C] dark:text-[#F3EFE6] border border-[#E0D9CB] dark:border-[#243628] text-[10px] px-1.5 py-0.5 rounded-md font-bold',
          label: 'L2',
          title: t('مساعد', 'Branch')
        };
      case 3:
        return {
          bg: 'bg-[#F3EFE6]/70 dark:bg-[#17231A] text-[#5C665E] dark:text-[#8FA392] border border-[#E0D9CB]/70 dark:border-[#243628] text-[10px] px-1.5 py-0.5 rounded-md',
          label: 'L3',
          title: t('فرعي', 'Aux')
        };
      case 4:
        return {
          bg: 'bg-[#F3EFE6]/40 dark:bg-[#141E16] text-[#5C665E] dark:text-[#8FA392] border border-[#E0D9CB]/50 dark:border-[#243628]/70 text-[10px] px-1.5 py-0.5 rounded-md',
          label: 'L4',
          title: t('تحليلي', 'Sub')
        };
      default:
        return {
          bg: 'bg-[#F3EFE6]/60 dark:bg-[#17231A] text-[#5C665E] dark:text-[#8FA392] border border-[#E0D9CB] dark:border-[#243628] text-[10px] px-1.5 py-0.5 rounded-md',
          label: `L${level}`,
          title: ''
        };
    }
  };

  const badge = getLevelBadge();
  const indentPx = (level - 1) * 20;

  return (
    <div className="flex flex-col select-none">
      <motion.div
        whileHover={{ scale: 1.002 }}
        whileTap={{ scale: 0.995 }}
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
        className={`group flex items-center justify-between gap-3 py-2.5 px-3 rounded-xl border transition-all duration-200 cursor-pointer ${
          isSelected
            ? 'bg-[#059669]/10 dark:bg-[#059669]/20 border-[#059669]/50 shadow-xs'
            : level === 1
            ? 'bg-[#F3EFE6]/80 dark:bg-[#17231A] border-[#E0D9CB] dark:border-[#243628] hover:bg-[#EAE4D7]/70 dark:hover:bg-[#1C2A1E] shadow-2xs'
            : level === 2
            ? 'bg-white/90 dark:bg-[#141E16] border-[#E0D9CB]/70 dark:border-[#243628]/80 hover:bg-[#F3EFE6]/60 dark:hover:bg-[#17231A]/60'
            : 'bg-transparent border-transparent hover:bg-[#F3EFE6]/40 dark:hover:bg-[#17231A]/40'
        }`}
      >
        {/* Left Side: Expand Chevron + Folder Icon + Code + Name */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {/* Chevron expander or leaf bullet */}
          {hasChildren ? (
            <button
              onClick={e => {
                e.stopPropagation();
                onToggle(node.id);
              }}
              className="w-6 h-6 rounded-lg flex items-center justify-center text-[#5C665E] dark:text-[#8FA392] hover:text-[#059669] hover:bg-[#F3EFE6] dark:hover:bg-[#17231A] transition-colors shrink-0"
            >
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-4 h-4 text-[#059669] dark:text-[#34D399]" />
              </motion.div>
            </button>
          ) : (
            <div className="w-6 h-6 flex items-center justify-center shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#059669]/50 dark:bg-[#34D399]/50" />
            </div>
          )}

          {/* Folder / File Icon */}
          <div className="shrink-0 text-[#059669] dark:text-[#34D399]">
            {isLeaf ? (
              <FileText className="w-4 h-4 text-[#5C665E] dark:text-[#8FA392]" />
            ) : isExpanded ? (
              <FolderOpen className="w-4 h-4 text-[#059669] dark:text-[#34D399]" />
            ) : (
              <Folder className="w-4 h-4 text-[#059669] dark:text-[#34D399]" />
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
          <span className="font-mono text-xs font-bold text-[#059669] dark:text-[#34D399] bg-[#059669]/10 dark:bg-[#059669]/15 px-2 py-0.5 rounded-md border border-[#059669]/20 tracking-wider shrink-0">
            {node.code}
          </span>

          {/* Account Title */}
          <span
            className={`truncate text-xs sm:text-sm ${
              level === 1
                ? 'text-[#1A241C] dark:text-[#F3EFE6] font-bold text-sm'
                : level === 2
                ? 'text-[#1A241C] dark:text-[#F3EFE6] font-semibold'
                : 'text-[#1A241C] dark:text-[#F3EFE6] font-medium'
            }`}
          >
            {node.nameAr}
          </span>
        </div>

        {/* Right Side: Badges & Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Live Balance Badge */}
          {node.balance !== undefined && Math.abs(node.balance) > 0.001 && (
            <span className="font-mono font-bold text-xs text-[#1A241C] dark:text-[#F3EFE6] px-2.5 py-1 rounded-lg bg-white dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] tabular-nums flex items-center shrink-0 shadow-2xs">
              <span>{Math.abs(node.balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span className="text-xs font-normal text-[#5C665E] dark:text-[#8FA392] mr-1 ms-1">{t('ج.م', 'EGP')}</span>
            </span>
          )}

          {/* Nature Badge (Soft Green for Debit / Soft Rose for Credit - matching General Journal) */}
          <span
            className={`text-[11px] px-2 py-0.5 rounded-full font-bold border ${
              node.nature === 0
                ? 'bg-[#EAF3EB] dark:bg-[#2A3F30] text-[#245E33] dark:text-[#A3CFAC] border-[#B8D8BC] dark:border-[#3D5A45]'
                : 'bg-[#F8EBEB] dark:bg-[#3F2A2A] text-[#7A2828] dark:text-[#EFA3A3] border-[#E3B8B8] dark:border-[#5A3D3D]'
            }`}
          >
            {node.natureLabelAr}
          </span>

          {/* Statement Type Badge */}
          {node.level <= 3 && (
            <span className="hidden md:inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#F3EFE6] dark:bg-[#17231A] text-[#5C665E] dark:text-[#8FA392] border border-[#E0D9CB] dark:border-[#243628]">
              {node.statementType === 'BALANCE_SHEET' ? t('ميزانية', 'Balance') : t('دخل', 'Income')}
            </span>
          )}

          {/* Leaf Count Badge */}
          {hasChildren && (
            <span className="text-[10.5px] font-mono px-2 py-0.5 rounded-md bg-[#F3EFE6] dark:bg-[#17231A] text-[#5C665E] dark:text-[#8FA392] border border-[#E0D9CB] dark:border-[#243628]">
              {node.leafCount} {t('حساب', 'accts')}
            </span>
          )}

          {/* Quick Details Trigger */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={e => {
              e.stopPropagation();
              onSelect(node);
            }}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#5C665E] dark:text-[#8FA392] hover:text-[#059669] hover:bg-[#F3EFE6] dark:hover:bg-[#17231A] transition-colors cursor-pointer"
            title={t('عرض التفاصيل المحاسبية', 'View Account Details')}
          >
            <Eye className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </motion.div>

      {/* Children Container with Spring Animation */}
      <AnimatePresence>
        {hasChildren && isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="space-y-1 pt-1 overflow-hidden"
          >
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
          </motion.div>
        )}
      </AnimatePresence>
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

  // Smart Tree Hierarchy Flattening
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
      {/* Search, Filters & Action Toolbar (General Journal Master Theme) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="p-4 sm:p-5 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#141E16] space-y-4 shadow-xs"
      >
        {/* Top Row: Search Input + Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-[#5C665E] dark:text-[#8FA392]" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t(
                'بحث برمز الحساب أو الاسم بالعربية/الإنجليزية (مثال: 1201001، الخزينة، بنك مصر)...',
                'Search by code or account name...'
              )}
              className="w-full ps-10 pe-10 py-2.5 text-xs sm:text-sm rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6] placeholder-[#5C665E]/60 dark:placeholder-[#8FA392]/60 focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669]/30 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-xs text-[#5C665E] dark:text-[#8FA392] hover:text-[#059669] cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Expand/Collapse Action Buttons */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleExpandAll}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#1A241C] text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6] hover:bg-[#F3EFE6] dark:hover:bg-[#1F2E23] transition-all cursor-pointer shadow-2xs"
              title={t('توسيع كافة المستويات', 'Expand All')}
            >
              <Maximize2 className="w-3.5 h-3.5 text-[#059669]" />
              <span>{t('توسيع الكل', 'Expand All')}</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleCollapseAll}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#1A241C] text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6] hover:bg-[#F3EFE6] dark:hover:bg-[#1F2E23] transition-all cursor-pointer shadow-2xs"
              title={t('طي إلى الحسابات الرئيسية فقط', 'Collapse All')}
            >
              <Minimize2 className="w-3.5 h-3.5 text-[#059669]" />
              <span>{t('طي الكل', 'Collapse All')}</span>
            </motion.button>
          </div>
        </div>

        {/* Filter Chips Bar (Emerald Active Pill / Clean Neutral Inactive Pill) */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#E0D9CB]/60 dark:border-[#243628] text-xs">
          <span className="text-[#5C665E] dark:text-[#8FA392] font-bold text-[11px] flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-[#059669]" />
            {t('تصفية حسب الطبيعة:', 'Nature:')}
          </span>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setFilterNature('ALL')}
            className={`cursor-pointer transition-all px-3.5 py-1.5 rounded-xl text-xs font-bold ${
              filterNature === 'ALL'
                ? 'bg-[#059669] text-white shadow-xs border border-[#059669]'
                : 'bg-white dark:bg-[#1A241C] hover:bg-[#F3EFE6] dark:hover:bg-[#1F2E23] text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6] border border-[#E0D9CB] dark:border-[#243628]'
            }`}
          >
            {t('جميع الحسابات', 'All')}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setFilterNature(0)}
            className={`cursor-pointer transition-all px-3.5 py-1.5 rounded-xl text-xs font-bold ${
              filterNature === 0
                ? 'bg-[#059669] text-white shadow-xs border border-[#059669]'
                : 'bg-white dark:bg-[#1A241C] hover:bg-[#F3EFE6] dark:hover:bg-[#1F2E23] text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6] border border-[#E0D9CB] dark:border-[#243628]'
            }`}
          >
            {t('مدين فقط (Debit)', 'Debit Only')}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setFilterNature(1)}
            className={`cursor-pointer transition-all px-3.5 py-1.5 rounded-xl text-xs font-bold ${
              filterNature === 1
                ? 'bg-[#059669] text-white shadow-xs border border-[#059669]'
                : 'bg-white dark:bg-[#1A241C] hover:bg-[#F3EFE6] dark:hover:bg-[#1F2E23] text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6] border border-[#E0D9CB] dark:border-[#243628]'
            }`}
          >
            {t('دائن فقط (Credit)', 'Credit Only')}
          </motion.button>

          <span className="ms-2 text-[#5C665E] dark:text-[#8FA392] font-bold text-[11px]">
            {t('القائمة:', 'Statement:')}
          </span>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setFilterStatement('ALL')}
            className={`cursor-pointer transition-all px-3.5 py-1.5 rounded-xl text-xs font-bold ${
              filterStatement === 'ALL'
                ? 'bg-[#059669] text-white shadow-xs border border-[#059669]'
                : 'bg-white dark:bg-[#1A241C] hover:bg-[#F3EFE6] dark:hover:bg-[#1F2E23] text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6] border border-[#E0D9CB] dark:border-[#243628]'
            }`}
          >
            {t('الكل', 'All')}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setFilterStatement('BALANCE_SHEET')}
            className={`cursor-pointer transition-all px-3.5 py-1.5 rounded-xl text-xs font-bold ${
              filterStatement === 'BALANCE_SHEET'
                ? 'bg-[#059669] text-white shadow-xs border border-[#059669]'
                : 'bg-white dark:bg-[#1A241C] hover:bg-[#F3EFE6] dark:hover:bg-[#1F2E23] text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6] border border-[#E0D9CB] dark:border-[#243628]'
            }`}
          >
            {t('ميزانية عمومية (أصول / خصوم)', 'Balance Sheet')}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setFilterStatement('INCOME_STATEMENT')}
            className={`cursor-pointer transition-all px-3.5 py-1.5 rounded-xl text-xs font-bold ${
              filterStatement === 'INCOME_STATEMENT'
                ? 'bg-[#059669] text-white shadow-xs border border-[#059669]'
                : 'bg-white dark:bg-[#1A241C] hover:bg-[#F3EFE6] dark:hover:bg-[#1F2E23] text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6] border border-[#E0D9CB] dark:border-[#243628]'
            }`}
          >
            {t('قائمة الدخل (مصروفات / تكاليف)', 'Income Statement')}
          </motion.button>
        </div>
      </motion.div>

      {/* Tree Content Container (Matching General Journal Table Container) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.05 }}
        className="rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#121B14] p-4 sm:p-5 shadow-xs overflow-hidden"
      >
        {isLoading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 border-3 border-[#059669] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6]">
              {t('جارِ تحميل شجرة الحسابات المحاسبية...', 'Loading Chart of Accounts...')}
            </span>
          </div>
        ) : filteredAccounts.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#059669]/15 text-[#059669] dark:text-[#34D399] flex items-center justify-center">
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
      </motion.div>

      {/* Detail Drawer Modal */}
      <AccountDetailDrawer
        account={selectedAccount}
        onClose={() => setSelectedAccount(null)}
      />
    </div>
  );
};
