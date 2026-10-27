import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import {
  insuranceStorage,
  InsuredEmployeeRecord,
  InsuranceOperationRecord,
  InsuranceComplianceRecord,
  getEmployeeInsuranceStatus,
  calculateEmployeeContributions,
  createBlobUrlFromDataUrl,
} from '../../../services/insuranceStorage';
import { exportExecutiveAnalyticsReportToExcel } from '../../../services/insuranceExcelUtils';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  ShieldCheck,
  Building2,
  Users,
  Wallet,
  Activity,
  FileSpreadsheet,
  Plus,
  Eye,
  Trash2,
  AlertCircle,
  Award,
} from 'lucide-react';

interface InsuranceAnalyticsAndComplianceViewProps {
  employees: InsuredEmployeeRecord[];
  operations: InsuranceOperationRecord[];
  complianceChecks: InsuranceComplianceRecord[];
  companies: Array<{ id: string; nameAr: string }>;
  selectedCompanyId: string;
  currentUserName: string;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canExport: boolean;
  onRefreshData: () => Promise<void>;
  onOpenAuditLog: (title: string, logs: any) => void;
  onPreviewAttachment: (title: string, dataUrl: string, fileName: string) => void;
}

export const InsuranceAnalyticsAndComplianceView: React.FC<
  InsuranceAnalyticsAndComplianceViewProps
> = ({
  employees,
  operations,
  complianceChecks,
  companies,
  selectedCompanyId,
  currentUserName,
  canCreate,
  canDelete,
  canExport,
  onRefreshData,
  onOpenAuditLog,
  onPreviewAttachment,
}) => {
  const { t } = useLanguage();

  const [periodFilter, setPeriodFilter] = useState<'all' | 'month' | 'quarter' | 'year'>('all');
  const [showCheckModal, setShowCheckModal] = useState(false);

  const [checkForm, setCheckForm] = useState({
    title: '',
    category: 'فحص دوري س1 / س6',
    company_id: selectedCompanyId !== 'all' ? selectedCompanyId : companies[0]?.id || '',
    inspector_name: currentUserName,
    due_date: new Date().toISOString().slice(0, 10),
    status: 'مكتمل ومطابق' as InsuranceComplianceRecord['status'],
    score: 100,
    findings: '',
    attachment_data: null as string | null,
    attachment_name: null as string | null,
  });

  // Filter operations by time period
  const filteredOps = useMemo(() => {
    if (periodFilter === 'all') return operations;
    const now = new Date();
    const cutoff = new Date();
    if (periodFilter === 'month') cutoff.setMonth(now.getMonth() - 1);
    else if (periodFilter === 'quarter') cutoff.setMonth(now.getMonth() - 3);
    else if (periodFilter === 'year') cutoff.setFullYear(now.getFullYear() - 1);
    const cutoffIso = cutoff.toISOString().slice(0, 10);
    return operations.filter((op) => (op.incoming_date || op.created_at || '') >= cutoffIso);
  }, [operations, periodFilter]);

  // Compute Executive KPIs (Ported from `Insurance/dashboard.js`)
  const analytics = useMemo(() => {
    const wageConfig = insuranceStorage.getWageConfig();
    const enriched = employees.map((e) => ({
      emp: e,
      status: getEmployeeInsuranceStatus(e, operations),
      calc: calculateEmployeeContributions(e.sub_wage, e.comp_wage, wageConfig),
    }));

    const activeList = enriched.filter((x) => x.status.type !== 'exited');
    const exitedList = enriched.filter((x) => x.status.type === 'exited');

    const totalSubWage = activeList.reduce((s, x) => s + x.calc.effectiveSubWage, 0);
    const totalMonthlyDue = activeList.reduce((s, x) => s + x.calc.totalContribution, 0);

    const turnoverRate =
      enriched.length > 0 ? Number(((exitedList.length / enriched.length) * 100).toFixed(1)) : 0;

    // Data Completeness & Compliance Score
    let validFields = 0;
    let totalFieldChecks = 0;
    employees.forEach((emp) => {
      totalFieldChecks += 5;
      if (emp.name) validFields++;
      if (emp.national_id && emp.national_id.length === 14) validFields++;
      if (emp.insurance_number) validFields++;
      if (emp.sub_wage > 0) validFields++;
      if (emp.occupation) validFields++;
    });
    const complianceScore =
      totalFieldChecks > 0 ? Math.round((validFields / totalFieldChecks) * 100) : 100;

    // 1. Wage Brackets Distribution
    const wageBrackets = [
      {
        label: 'أقل من 3,500 ج.م',
        count: activeList.filter((x) => x.calc.effectiveSubWage < 3500).length,
      },
      {
        label: '3,500 - 6,000 ج.م',
        count: activeList.filter(
          (x) => x.calc.effectiveSubWage >= 3500 && x.calc.effectiveSubWage < 6000
        ).length,
      },
      {
        label: '6,000 - 10,000 ج.م',
        count: activeList.filter(
          (x) => x.calc.effectiveSubWage >= 6000 && x.calc.effectiveSubWage < 10000
        ).length,
      },
      {
        label: 'أكثر من 10,000 ج.م',
        count: activeList.filter((x) => x.calc.effectiveSubWage >= 10000).length,
      },
    ];

    // 2. Operations Status Breakdown
    const statusDist = [
      { label: 'مكتمل', count: filteredOps.filter((o) => o.status === 'مكتمل').length, color: 'bg-emerald-500' },
      { label: 'قيد المراجعة', count: filteredOps.filter((o) => o.status === 'قيد المراجعة').length, color: 'bg-amber-500' },
      { label: 'انتظار', count: filteredOps.filter((o) => o.status === 'انتظار').length, color: 'bg-amber-400' },
      { label: 'مرفوض', count: filteredOps.filter((o) => o.status === 'مرفوض').length, color: 'bg-rose-500' },
      { label: 'مكرر', count: filteredOps.filter((o) => o.status === 'مكرر').length, color: 'bg-purple-500' },
    ];

    // 3. Companies Summary
    const companiesSummary = companies.map((c) => {
      const compEmps = enriched.filter((x) => x.emp.company_id === c.id || x.emp.company_name === c.nameAr);
      const compActive = compEmps.filter((x) => x.status.type !== 'exited');
      const compExited = compEmps.filter((x) => x.status.type === 'exited');
      const compOps = filteredOps.filter((o) => o.company_id === c.id || o.company_name === c.nameAr);
      return {
        companyName: c.nameAr,
        activeCount: compActive.length,
        exitedCount: compExited.length,
        totalSubWage: compActive.reduce((s, x) => s + x.calc.effectiveSubWage, 0),
        totalMonthlyDue: compActive.reduce((s, x) => s + x.calc.totalContribution, 0),
        operationsCount: compOps.length,
      };
    });

    // 4. Qualifications Breakdown
    const qualMap = new Map<string, number>();
    employees.forEach((e) => {
      const q = (e.qualification || 'غير محدد').trim();
      qualMap.set(q, (qualMap.get(q) || 0) + 1);
    });
    const qualifications = Array.from(qualMap.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // 5. Monthly S1 vs S6 Turnover Trend
    const s1Count = filteredOps.filter((o) => o.request_type?.includes('س1')).length;
    const s6Count = filteredOps.filter((o) => o.request_type?.includes('س6')).length;
    const s2Count = filteredOps.filter((o) => o.request_type?.includes('س2')).length;

    return {
      totalCompanies: companies.length,
      totalEmployees: employees.length,
      activeCount: activeList.length,
      exitedCount: exitedList.length,
      totalSubWage,
      totalMonthlyDue,
      turnoverRate,
      complianceScore,
      wageBrackets,
      statusDist,
      companiesSummary,
      qualifications,
      s1Count,
      s6Count,
      s2Count,
    };
  }, [employees, operations, filteredOps, companies]);

  const handleExportReport = () => {
    exportExecutiveAnalyticsReportToExcel({
      kpis: [
        {
          label: 'إجمالي الشركات المسجلة',
          value: analytics.totalCompanies,
          subtitle: 'عدد الشركات والمنشآت الخاضعة للمنظومة',
        },
        {
          label: 'إجمالي القوى العاملة المؤمن عليها',
          value: analytics.activeCount,
          subtitle: `من إجمالي (${analytics.totalEmployees}) سجل تأميني`,
        },
        {
          label: 'كتلة أجور الاشتراك الشهرية (ج.م)',
          value: analytics.totalSubWage,
          subtitle: `إجمالي المطالبة الشهرية للهيئة: ${analytics.totalMonthlyDue} ج.م`,
        },
        {
          label: 'إجمالي العمليات والطلبات المسجلة',
          value: filteredOps.length,
          subtitle: `س1: ${analytics.s1Count} | س2: ${analytics.s2Count} | س6: ${analytics.s6Count}`,
        },
        {
          label: 'معدل دوران العمالة (Turnover %)',
          value: `${analytics.turnoverRate}%`,
          subtitle: `عدد المستقيلين (س6): ${analytics.exitedCount}`,
        },
        {
          label: 'مؤشر اكتمال وصحة البيانات (Compliance Score)',
          value: `${analytics.complianceScore}%`,
          subtitle: 'نسبة استيفاء الأرقام القومية والتأمينية والمهن والأجور',
        },
      ],
      companiesSummary: analytics.companiesSummary,
      operations: filteredOps,
      employees,
    });
  };

  const handleSaveComplianceCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    const comp = companies.find((c) => c.id === checkForm.company_id);
    await insuranceStorage.saveComplianceCheck(
      {
        ...checkForm,
        company_name: comp?.nameAr || 'جميع المنشآت',
      },
      currentUserName
    );
    setShowCheckModal(false);
    await onRefreshData();
  };

  return (
    <div className="space-y-5">
      {/* Period Filter & Export Report Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#112219] border border-slate-200/80 dark:border-[#22382B] shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-600 dark:text-stone-300">
            {t('النطاق الزمني للتحليلات:', 'Analytics Period:')}
          </span>
          {[
            { id: 'all', label: 'كل الفترات' },
            { id: 'month', label: 'آخر شهر' },
            { id: 'quarter', label: 'آخر ربع سنة' },
            { id: 'year', label: 'آخر عام' },
          ].map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPeriodFilter(p.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                periodFilter === p.id
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-100 dark:bg-[#172D21] text-slate-700 dark:text-stone-300'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canExport && (
            <button
              type="button"
              onClick={handleExportReport}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 dark:text-amber-200 border border-amber-500/35 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>تصدير التقرير التحليلي الشامل (4 أوراق Excel)</span>
            </button>
          )}

          {canCreate && (
            <button
              type="button"
              onClick={() => setShowCheckModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>+ إضافة بند فحص وامتثال</span>
            </button>
          )}
        </div>
      </div>

      {/* 6 Executive KPIs (Ported from `Insurance/dashboard.js`) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#112219] border border-slate-200/80 dark:border-[#22382B] shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-stone-400">
              الشركات المسجلة
            </span>
            <Building2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-xl font-black font-mono text-slate-900 dark:text-white">
            {analytics.totalCompanies}
          </div>
          <div className="text-[10px] text-slate-400">منشأة نشطة بالمنظومة</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#112219] border border-slate-200/80 dark:border-[#22382B] shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-stone-400">
              القوى العاملة النشطة
            </span>
            <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-xl font-black font-mono text-emerald-700 dark:text-emerald-400">
            {analytics.activeCount}
          </div>
          <div className="text-[10px] text-slate-400">
            من إجمالي ({analytics.totalEmployees}) سجل
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#112219] border border-slate-200/80 dark:border-[#22382B] shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-stone-400">
              كتلة الأجور التأمينية
            </span>
            <Wallet className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-xl font-black font-mono text-slate-900 dark:text-white">
            {analytics.totalSubWage.toLocaleString('en-US')}
          </div>
          <div className="text-[10px] text-amber-700 dark:text-amber-300 font-mono">
            اشتراك: {analytics.totalMonthlyDue.toLocaleString('en-US')} ج.م
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#112219] border border-slate-200/80 dark:border-[#22382B] shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-stone-400">
              إجمالي المعاملات
            </span>
            <Activity className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-xl font-black font-mono text-slate-900 dark:text-white">
            {filteredOps.length}
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            س1: {analytics.s1Count} | س6: {analytics.s6Count}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#112219] border border-slate-200/80 dark:border-[#22382B] shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-stone-400">
              دوران العمالة (Turnover)
            </span>
            <TrendingUp className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-xl font-black font-mono text-slate-900 dark:text-white">
            {analytics.turnoverRate}%
          </div>
          <div className="text-[10px] text-slate-400">
            مستقيلين (س6): {analytics.exitedCount}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/15 to-transparent border border-amber-500/40 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-900 dark:text-amber-200">
              مؤشر الامتثال وجودة البيانات
            </span>
            <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-xl font-black font-mono text-amber-700 dark:text-amber-300">
            {analytics.complianceScore}%
          </div>
          <div className="text-[10px] text-amber-800/80 dark:text-amber-300/80">
            استيفاء السجلات التأمينية
          </div>
        </div>
      </div>

      {/* 4 Interactive Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart 1: Operations Status Breakdown */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#112219] border border-slate-200/80 dark:border-[#22382B] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <h4 className="text-xs font-black text-slate-900 dark:text-white">
                توزيع حالات العمليات والطلبات التأمينية
              </h4>
            </div>
            <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400">
              {filteredOps.length} عملية
            </span>
          </div>

          <div className="space-y-3">
            {analytics.statusDist.map((st) => {
              const pct =
                filteredOps.length > 0 ? Math.round((st.count / filteredOps.length) * 100) : 0;
              return (
                <div key={st.label} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700 dark:text-stone-200">{st.label}</span>
                    <span className="font-mono text-slate-900 dark:text-white">
                      {st.count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-[#0B1711] overflow-hidden">
                    <div
                      className={`h-full rounded-full ${st.color} transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Insurance Wage Brackets Distribution */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#112219] border border-slate-200/80 dark:border-[#22382B] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <h4 className="text-xs font-black text-slate-900 dark:text-white">
                توزيع شرائح أجور الاشتراك التأميني
              </h4>
            </div>
            <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400">
              {analytics.activeCount} مؤمن عليه
            </span>
          </div>

          <div className="space-y-3">
            {analytics.wageBrackets.map((wb) => {
              const pct =
                analytics.activeCount > 0
                  ? Math.round((wb.count / analytics.activeCount) * 100)
                  : 0;
              return (
                <div key={wb.label} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700 dark:text-stone-200">{wb.label}</span>
                    <span className="font-mono text-amber-700 dark:text-amber-400">
                      {wb.count} موظف ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-[#0B1711] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 3: Top Companies by Workforce & Contributions */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#112219] border border-slate-200/80 dark:border-[#22382B] shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <h4 className="text-xs font-black text-slate-900 dark:text-white">
              توزيع العمالة المؤمن عليها والاشتراكات حسب الشركة
            </h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-500 dark:text-amber-400/90 border-b border-slate-100 dark:border-[#1E3427]">
                  <th className="py-2 text-start">الشركة</th>
                  <th className="py-2 text-center">مؤمن عليه</th>
                  <th className="py-2 text-center">س6</th>
                  <th className="py-2 text-end">الاشتراك الشهري (29.75%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#1B3024]">
                {analytics.companiesSummary.map((c) => (
                  <tr key={c.companyName}>
                    <td className="py-2 font-bold text-slate-900 dark:text-white">
                      {c.companyName}
                    </td>
                    <td className="py-2 text-center font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      {c.activeCount}
                    </td>
                    <td className="py-2 text-center font-mono text-slate-500">{c.exitedCount}</td>
                    <td className="py-2 text-end font-mono font-bold text-amber-700 dark:text-amber-400">
                      {c.totalMonthlyDue.toLocaleString('en-US')} ج.م
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Chart 4: Qualifications & S1 vs S6 Turnover */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#112219] border border-slate-200/80 dark:border-[#22382B] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-slate-900 dark:text-white">
              حركة الاستمارات (س1 التحاق مقابل س6 خروج) وتوزيع المؤهلات
            </h4>
          </div>

          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
              <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 block">
                استمارات س1 (التحاق)
              </span>
              <span className="text-lg font-black font-mono text-emerald-700 dark:text-emerald-400">
                {analytics.s1Count}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25">
              <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 block">
                استمارات س2 (تعديل أجور)
              </span>
              <span className="text-lg font-black font-mono text-amber-700 dark:text-amber-400">
                {analytics.s2Count}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25">
              <span className="text-[11px] font-bold text-rose-800 dark:text-rose-300 block">
                استمارات س6 (انتهاء)
              </span>
              <span className="text-lg font-black font-mono text-rose-700 dark:text-rose-400">
                {analytics.s6Count}
              </span>
            </div>
          </div>

          <div className="space-y-1.5 pt-2">
            <span className="text-[11px] font-bold text-slate-500 dark:text-stone-400 block">
              توزيع المؤهلات الدراسية:
            </span>
            <div className="flex flex-wrap gap-2">
              {analytics.qualifications.length === 0 ? (
                <span className="text-xs text-slate-400">لا توجد بيانات مؤهلات مسجلة بعد</span>
              ) : (
                analytics.qualifications.map((q) => (
                  <span
                    key={q.label}
                    className="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-100 dark:bg-[#172D21] text-slate-800 dark:text-stone-200 border border-slate-200 dark:border-[#243B2D]"
                  >
                    {q.label}: <strong className="text-amber-600 dark:text-amber-400">{q.count}</strong>
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Periodic Compliance & Inspection Checklists (`ins_compliance`) */}
      <div className="rounded-2xl bg-white dark:bg-[#112219] border border-slate-200/80 dark:border-[#22382B] shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-[#22382B] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <h4 className="text-xs font-black text-slate-900 dark:text-white">
              سجل الفحص والامتثال التأميني الدوري ({complianceChecks.length})
            </h4>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#0B1711] border-b border-slate-200 dark:border-[#22382B] text-slate-600 dark:text-amber-400 font-bold">
                <th className="p-3">كود الفحص</th>
                <th className="p-3">عنوان الفحص / المراجعة</th>
                <th className="p-3">التصنيف</th>
                <th className="p-3">الشركة</th>
                <th className="p-3">تاريخ الاستحقاق</th>
                <th className="p-3">نسبة المطابقة</th>
                <th className="p-3">الحالة</th>
                <th className="p-3">الملاحظات والتوصيات</th>
                <th className="p-3 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1B3024]">
              {complianceChecks.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500">
                    لا توجد بنود فحص وامتثال مسجلة حالياً (0 بند).
                  </td>
                </tr>
              ) : (
                complianceChecks.map((chk) => (
                  <tr key={chk.id} className="hover:bg-slate-50/80 dark:hover:bg-[#152B20]/70">
                    <td className="p-3 font-mono font-bold text-amber-700 dark:text-amber-400">
                      {chk.check_code}
                    </td>
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{chk.title}</td>
                    <td className="p-3">{chk.category}</td>
                    <td className="p-3 font-bold">{chk.company_name}</td>
                    <td className="p-3 font-mono">{chk.due_date}</td>
                    <td className="p-3 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      {chk.score}%
                    </td>
                    <td className="p-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                        {chk.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 dark:text-stone-300 max-w-[200px] truncate">
                      {chk.findings || '—'}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-1">
                        {chk.attachment_data && (
                          <button
                            type="button"
                            onClick={() =>
                              onPreviewAttachment(
                                `مرفق الفحص (${chk.check_code})`,
                                createBlobUrlFromDataUrl(chk.attachment_data!),
                                chk.attachment_name || 'compliance_report'
                              )
                            }
                            className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 flex items-center justify-center cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            onOpenAuditLog(`سجل الفحص (${chk.check_code})`, chk.audit_log_json)
                          }
                          className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-800 dark:text-amber-300 flex items-center justify-center cursor-pointer"
                        >
                          <AlertCircle className="w-3.5 h-3.5" />
                        </button>
                        {canDelete && (
                          <button
                            type="button"
                            onClick={async () => {
                              await insuranceStorage.deleteComplianceCheck(chk.id);
                              await onRefreshData();
                            }}
                            className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Compliance Check Modal */}
      {showCheckModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#0D1F17] border border-amber-500/30 shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              إضافة بند فحص وامتثال تأميني دوري
            </h3>
            <form onSubmit={handleSaveComplianceCheck} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 mb-1">
                  عنوان الفحص / المراجعة *
                </label>
                <input
                  type="text"
                  required
                  value={checkForm.title}
                  onChange={(e) => setCheckForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="مثال: مراجعة مطابقة استمارات س1 للربع الأول"
                  className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-slate-50 dark:bg-[#08140E] border border-slate-200 dark:border-[#243B2D] text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 mb-1">
                    الشركة
                  </label>
                  <select
                    value={checkForm.company_id}
                    onChange={(e) => setCheckForm((p) => ({ ...p, company_id: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-slate-50 dark:bg-[#08140E] border border-slate-200 dark:border-[#243B2D] text-slate-900 dark:text-white"
                  >
                    <option value="">جميع الشركات</option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nameAr}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 mb-1">
                    تاريخ الفحص
                  </label>
                  <input
                    type="date"
                    value={checkForm.due_date}
                    onChange={(e) => setCheckForm((p) => ({ ...p, due_date: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-slate-50 dark:bg-[#08140E] border border-slate-200 dark:border-[#243B2D] text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 mb-1">
                  نتائج الفحص والتوصيات
                </label>
                <textarea
                  rows={2}
                  value={checkForm.findings}
                  onChange={(e) => setCheckForm((p) => ({ ...p, findings: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#08140E] border border-slate-200 dark:border-[#243B2D] text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCheckModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-[#172D21] cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 cursor-pointer"
                >
                  حفظ سجل الفحص
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
