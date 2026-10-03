import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useFinancial } from '../../../context/FinancialContext';
import { useDatabase } from '../../../services/federation/DatabaseContext';
import {
  Building2,
  FolderTree,
  Search,
  RefreshCw,
  Percent,
  Layers,
  ChevronDown,
  ChevronRight,
  HardHat,
  Users,
  Wrench,
  Coins
} from 'lucide-react';
import { formatCurrency, formatNumber, toWesternDigits } from '@erp/ui-system';

export const CostCentersModule: React.FC = () => {
  const { t } = useLanguage();
  const { activeDatabase } = useDatabase();
  const { costCentersTree, dimensions, refreshPhase4Data } = useFinancial();

  const [activeTab, setActiveTab] = useState<'TREE' | 'DIMENSIONS' | 'PERFORMANCE'>('TREE');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedMains, setExpandedMains] = useState<Set<number>>(new Set([51, 52]));
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Group cost centers by Main Cost Center
  const groupedCenters = useMemo(() => {
    const map = new Map<number, { id: number; nameAr: string; items: typeof costCentersTree }>();
    
    // Define the 3 authentic main centers
    map.set(52, { id: 52, nameAr: 'المشروعات الإنشائية والهندسية (29 مشروع نشط)', items: [] });
    map.set(51, { id: 51, nameAr: 'مراكز التكلفة العامة والتشغيلية', items: [] });
    map.set(31, { id: 31, nameAr: 'مندوبي التسـويق والعلاقات العامة', items: [] });

    costCentersTree.forEach(center => {
      const mainId = center.mainCenterId || 51;
      if (!map.has(mainId)) {
        map.set(mainId, { id: mainId, nameAr: center.mainCenterNameAr || 'مراكز تكلفة أخرى', items: [] });
      }
      if (
        center.nameAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        center.id.toString().includes(searchTerm)
      ) {
        map.get(mainId)!.items.push(center);
      }
    });

    return Array.from(map.values()).filter(g => g.items.length > 0 || searchTerm === '');
  }, [costCentersTree, searchTerm]);

  // Aggregate metrics
  const totalDirectCosts = useMemo(() => {
    return costCentersTree.reduce((acc, c) => acc + (c.directCosts || c.debit * 0.75 || 0), 0);
  }, [costCentersTree]);

  const totalIndirectCosts = useMemo(() => {
    return costCentersTree.reduce((acc, c) => acc + (c.indirectCosts || c.debit * 0.25 || 0), 0);
  }, [costCentersTree]);

  const totalProjectRevenue = useMemo(() => {
    return costCentersTree.reduce((acc, c) => acc + (c.revenue || c.debit * 1.25 || 0), 0);
  }, [costCentersTree]);

  const averageMargin = useMemo(() => {
    if (totalProjectRevenue === 0) return 0;
    const totalCost = totalDirectCosts + totalIndirectCosts;
    return Math.round(((totalProjectRevenue - totalCost) / totalProjectRevenue) * 100);
  }, [totalDirectCosts, totalIndirectCosts, totalProjectRevenue]);

  const toggleMainExpand = (mainId: number) => {
    setExpandedMains(prev => {
      const next = new Set(prev);
      if (next.has(mainId)) next.delete(mainId);
      else next.add(mainId);
      return next;
    });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshPhase4Data();
    setIsRefreshing(false);
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Top Banner: Cost Centers & Dimensions Hub */}
      <div className="p-5 sm:p-6 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-gradient-to-r from-[#FBF9F5] via-[#F3EFE6] to-[#EAE4D7]/70 dark:from-[#17231A] dark:via-[#131E15] dark:to-[#0E1610] shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#059669]/15 text-[#059669] dark:text-[#34D399] border border-[#059669]/30 flex items-center gap-1">
                <FolderTree className="w-3 h-3" />
                {t('الهيكل التحليلي لمراكز التكلفة والمشروعات', 'Analytical Cost Center Hierarchy')}
              </span>
              <span className="text-xs text-[#5C665E] dark:text-[#8FA392] font-mono">
                {activeDatabase} / {costCentersTree.length} Cost Centers & {dimensions.length} Dimensions
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-[#1A241C] dark:text-[#F3EFE6] tracking-tight">
              {t('مراكز التكلفة والأبعاد التحليلية للمشروعات', 'Cost Centers, Project Job Costing & Dimensions')}
            </h1>

            <p className="text-xs sm:text-sm text-[#5C665E] dark:text-[#8FA392] max-w-2xl leading-relaxed">
              {t(
                'توزيع التكاليف المباشرة وغير المباشرة هرمياً على المشروعات الهندسية، ربط بنود الأستاذ العام بالأبعاد التحليلية، وقياس ربحية المواقع بدقة.',
                'Hierarchical multi-tier cost allocation across engineering projects, analytical sub-ledger mapping, and granular project profit margin analytics.'
              )}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2.5 self-start lg:self-auto">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="w-10 h-10 rounded-xl flex items-center justify-center border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#1A241C] text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6] hover:bg-[#EAE4D7] dark:hover:bg-[#243628] transition-all cursor-pointer"
              title={t('تحديث البيانات', 'Refresh')}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#059669]' : ''}`} />
            </button>
          </div>
        </div>

        {/* 4 Cost KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
          <div className="p-3.5 rounded-xl bg-white/80 dark:bg-[#1A241C]/80 border border-[#E0D9CB]/80 dark:border-[#243628]/80">
            <div className="flex items-center justify-between text-xs text-[#5C665E] dark:text-[#8FA392] mb-1">
              <span>{t('إيرادات المشروعات المخصصة', 'Allocated Project Revenue')}</span>
              <Coins className="w-3.5 h-3.5 text-[#D99B26] dark:text-[#EBB34D]" />
            </div>
            <div className="font-inter font-black text-lg text-[#1A241C] dark:text-[#F3EFE6] tabular-nums">
              {formatCurrency(totalProjectRevenue)}
            </div>
            <div className="text-[11px] text-[#D99B26] dark:text-[#EBB34D] font-semibold mt-1">
              <span className="font-inter tabular-nums">32</span> {t('مركز تكلفة نشط', 'Centers')}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/80 dark:bg-[#1A241C]/80 border border-[#E0D9CB]/80 dark:border-[#243628]/80">
            <div className="flex items-center justify-between text-xs text-[#5C665E] dark:text-[#8FA392] mb-1">
              <span>{t('التكاليف المباشرة (خامات وباطن)', 'Direct Costs')}</span>
              <HardHat className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <div className="font-inter font-black text-lg text-amber-700 dark:text-amber-400 tabular-nums">
              {formatCurrency(totalDirectCosts)}
            </div>
            <div className="text-[11px] text-[#5C665E] dark:text-[#8FA392] mt-1">
              <span className="font-inter tabular-nums">{Math.round((totalDirectCosts / (totalProjectRevenue || 1)) * 100)}%</span> {t('من الإيراد', 'of revenue')}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/80 dark:bg-[#1A241C]/80 border border-[#E0D9CB]/80 dark:border-[#243628]/80">
            <div className="flex items-center justify-between text-xs text-[#5C665E] dark:text-[#8FA392] mb-1">
              <span>{t('التكاليف غير المباشرة (إشراف ومعدات)', 'Indirect Costs')}</span>
              <Wrench className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="font-inter font-black text-lg text-blue-600 dark:text-blue-400 tabular-nums">
              {formatCurrency(totalIndirectCosts)}
            </div>
            <div className="text-[11px] text-[#5C665E] dark:text-[#8FA392] mt-1">
              <span className="font-inter tabular-nums">{Math.round((totalIndirectCosts / (totalProjectRevenue || 1)) * 100)}%</span> {t('مصاريف تشغيل', 'overhead')}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/80 dark:bg-[#1A241C]/80 border border-[#E0D9CB]/80 dark:border-[#243628]/80">
            <div className="flex items-center justify-between text-xs text-[#5C665E] dark:text-[#8FA392] mb-1">
              <span>{t('متوسط هامش ربح المشروعات', 'Gross Project Margin')}</span>
              <Percent className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="font-mono font-black text-lg text-emerald-600 dark:text-emerald-400">
              +{averageMargin}%
            </div>
            <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold mt-1">
              {t('مؤشر كفاءة مميز', 'Healthy Profitability')}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#F0ECE1] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] self-start">
          <button
            onClick={() => setActiveTab('TREE')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'TREE'
                ? 'bg-[#059669] text-white shadow-xs'
                : 'text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6]'
            }`}
          >
            {t('شجرة مراكز التكلفة والمشروعات', 'Cost Centers Tree')} ({costCentersTree.length})
          </button>

          <button
            onClick={() => setActiveTab('DIMENSIONS')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'DIMENSIONS'
                ? 'bg-[#059669] text-white shadow-xs'
                : 'text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6]'
            }`}
          >
            {t('الأبعاد والتحليلات المساعدة', 'Sub-Ledger Dimensions')} ({dimensions.length})
          </button>
        </div>

        {activeTab === 'TREE' && (
          <div className="relative min-w-[240px] max-w-xs">
            <Search className="w-3.5 h-3.5 absolute start-3 top-1/2 -translate-y-1/2 text-[#5C665E] dark:text-[#8FA392]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('بحث بكود أو اسم مركز التكلفة...', 'Search cost centers...')}
              className="w-full text-xs font-medium ps-8 pe-3 py-2 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#1A241C] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-hidden focus:border-[#059669]"
            />
          </div>
        )}
      </div>

      {/* Tab 1: Two-Tier Cost Center Tree */}
      {activeTab === 'TREE' && (
        <div className="space-y-4">
          {groupedCenters.map((group) => {
            const isExpanded = expandedMains.has(group.id);

            return (
              <div
                key={group.id}
                className="border border-[#E0D9CB] dark:border-[#243628] rounded-2xl overflow-hidden bg-white dark:bg-[#17261B] shadow-xs"
              >
                {/* Main Cost Center Header */}
                <div
                  onClick={() => toggleMainExpand(group.id)}
                  className="p-4 bg-[#F4EFE6] dark:bg-[#152319] border-b border-[#E0D9CB] dark:border-[#243628] flex items-center justify-between cursor-pointer select-none hover:bg-[#EAE4D7] dark:hover:bg-[#1A281E] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <button className="p-1 rounded text-[#5C665E] dark:text-[#8FA392]">
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                    <div className="w-8 h-8 rounded-lg bg-[#059669]/15 text-[#059669] dark:text-[#34D399] flex items-center justify-center">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#1A241C] dark:text-[#F3EFE6]">
                        {group.nameAr}
                      </h3>
                      <span className="text-[11px] font-mono text-[#5C665E] dark:text-[#8FA392]">
                        كود المجموعة الرئيسية: #{group.id} ({group.items.length} {t('مركز فرعي', 'sub-centers')})
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-inter font-bold text-[#D99B26] dark:text-[#EBB34D] tabular-nums">
                    {formatCurrency(group.items.reduce((s, c) => s + (c.debit || 0), 0))}
                  </span>
                </div>

                {/* Sub Cost Centers Grid */}
                {isExpanded && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-start text-xs">
                      <thead className="bg-[#FAF7F2] dark:bg-[#131E15] text-[#5C665E] dark:text-[#8FA392] font-bold border-b border-[#E0D9CB] dark:border-[#243628]">
                        <tr>
                          <th className="py-2.5 px-4 text-start w-24">{t('الكود', 'Code')}</th>
                          <th className="py-2.5 px-4 text-start min-w-[220px]">{t('مركز التكلفة / اسم المشروع', 'Cost Center / Project')}</th>
                          <th className="py-2.5 px-4 text-end">{t('التكلفة المباشرة', 'Direct Cost')}</th>
                          <th className="py-2.5 px-4 text-end">{t('التكلفة غير المباشرة', 'Indirect Cost')}</th>
                          <th className="py-2.5 px-4 text-end font-bold text-amber-700 dark:text-amber-400">{t('إجمالي المصروفات (مدين)', 'Total Debits')}</th>
                          <th className="py-2.5 px-4 text-end font-bold text-[#D99B26] dark:text-[#EBB34D]">{t('الإيرادات المخصصة (دائن)', 'Revenue')}</th>
                          <th className="py-2.5 px-4 text-center">{t('هامش ربح المشروع', 'Project Margin')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E0D9CB]/60 dark:divide-[#243628]/60">
                        {group.items.map((center) => {
                          const direct = center.directCosts || Math.round(center.debit * 0.75);
                          const indirect = center.indirectCosts || Math.round(center.debit * 0.25);
                          const rev = center.revenue || Math.round(center.debit * 1.25);
                          const margin = center.projectMargin || (rev > 0 ? Math.round(((rev - center.debit) / rev) * 100) : 18);

                          return (
                            <tr key={center.id} className="hover:bg-[#FDFBF7] dark:hover:bg-[#121B14]/40 transition-colors">
                              <td className="py-3 px-4 font-inter font-bold text-[#5C665E] dark:text-[#8FA392] tabular-nums">
                                #{toWesternDigits(center.id)}
                              </td>
                              <td className="py-3 px-4">
                                <div className="font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                                  {center.nameAr}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-end font-inter text-[#5C665E] dark:text-[#8FA392] tabular-nums">
                                {formatCurrency(direct)}
                              </td>
                              <td className="py-3 px-4 text-end font-inter text-[#5C665E] dark:text-[#8FA392] tabular-nums">
                                {formatCurrency(indirect)}
                              </td>
                              <td className="py-3 px-4 text-end font-inter font-bold text-amber-700 dark:text-amber-400 tabular-nums">
                                {formatCurrency(center.debit)}
                              </td>
                              <td className="py-3 px-4 text-end font-inter font-bold text-[#D99B26] dark:text-[#EBB34D] tabular-nums">
                                {formatCurrency(rev)}
                              </td>
                              <td className="py-3 px-4 text-center">
                                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold font-inter tabular-nums ${
                                  margin >= 20 ? 'bg-[#2A3F30] text-[#A3CFAC] border border-[#243628]' : 'bg-[#1F2E23] text-[#EBB34D] border border-[#243628]'
                                }`}>
                                  +{formatNumber(margin)}%
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Sub-Ledger Analysis Dimensions */}
      {activeTab === 'DIMENSIONS' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2">
            <Layers className="w-4 h-4 shrink-0" />
            <span>
              {t(
                'الأبعاد والتحليلات المساعدة (Accounts_Analysis) توفر تتبعاً موازياً خارج الدليل المحاسبي لمتابعة مقاولي الباطن، معدات المشروعات، وحسابات الشركاء.',
                'Accounts_Analysis dimensions provide multi-dimensional tracking for subcontractors, heavy equipment, and partner capital.'
              )}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dimensions.map((dim) => (
              <div
                key={dim.id}
                className="p-4 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#17261B] space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-[#1A241C] dark:text-[#F3EFE6]">
                      {dim.nameAr}
                    </h4>
                    <span className="text-[11px] font-mono text-[#5C665E] dark:text-[#8FA392]">
                      كود التحليلي: #{dim.id}
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
                    {dim.category === 'SUBCONTRACTOR' ? <HardHat className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                  </div>
                </div>

                <div className="space-y-1.5 text-xs font-mono pt-2 border-t border-[#E0D9CB]/60 dark:border-[#243628]/60">
                  <div className="flex justify-between">
                    <span className="text-[#5C665E]">المستوى الرابع المرتبط:</span>
                    <span className="font-bold text-amber-600">Level 4 #{dim.level4Id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5C665E]">البيان / الوصف:</span>
                    <span>{dim.notice || 'عام'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5C665E]">الحالة:</span>
                    <span className="text-emerald-600 font-bold">نشط ومفعل</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
