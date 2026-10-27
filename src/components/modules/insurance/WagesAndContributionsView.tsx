import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import {
  insuranceStorage,
  InsuredEmployeeRecord,
  InsuranceRemittanceRecord,
  InsuranceOperationRecord,
  InsuranceWageConfig,
  calculateEmployeeContributions,
  getEmployeeInsuranceStatus,
  normalizeDigits,
  createBlobUrlFromDataUrl,
} from '../../../services/insuranceStorage';
import { exportWagesAndS2ToExcel } from '../../../services/insuranceExcelUtils';
import {
  Calculator,
  FileSpreadsheet,
  Plus,
  Settings,
  CheckCircle2,
  Eye,
  Trash2,
  AlertCircle,
  Save,
  X,
  Receipt,
} from 'lucide-react';

interface WagesAndContributionsViewProps {
  employees: InsuredEmployeeRecord[];
  operations: InsuranceOperationRecord[];
  remittances: InsuranceRemittanceRecord[];
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

export const WagesAndContributionsView: React.FC<WagesAndContributionsViewProps> = ({
  employees,
  operations,
  remittances,
  companies,
  selectedCompanyId,
  currentUserName,
  canCreate,
  canEdit,
  canDelete,
  canExport,
  onRefreshData,
  onOpenAuditLog,
  onPreviewAttachment,
}) => {
  const { t } = useLanguage();

  const [wageConfig, setWageConfig] = useState<InsuranceWageConfig>(() =>
    insuranceStorage.getWageConfig()
  );
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showRemittanceModal, setShowRemittanceModal] = useState(false);
  const [editingWageEmpId, setEditingWageEmpId] = useState<string | null>(null);
  const [tempSubWage, setTempSubWage] = useState<string>('');
  const [tempCompWage, setTempCompWage] = useState<string>('');
  const [notice, setNotice] = useState<string | null>(null);

  const [remForm, setRemForm] = useState({
    month_year: new Date().toISOString().slice(0, 7),
    company_id: selectedCompanyId !== 'all' ? selectedCompanyId : companies[0]?.id || '',
    receipt_number: '',
    payment_date: new Date().toISOString().slice(0, 10),
    status: 'تم السداد والتوريد' as InsuranceRemittanceRecord['status'],
    notes: '',
    attachment_data: null as string | null,
    attachment_name: null as string | null,
  });

  // Active insured employees (excluding exited S6)
  const activeEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const st = getEmployeeInsuranceStatus(emp, operations);
      return st.type !== 'exited';
    });
  }, [employees, operations]);

  // Per-employee contribution rows
  const calculatedRows = useMemo(() => {
    return activeEmployees.map((emp) => ({
      emp,
      calc: calculateEmployeeContributions(emp.sub_wage, emp.comp_wage, wageConfig),
    }));
  }, [activeEmployees, wageConfig]);

  // Grand Totals
  const totals = useMemo(() => {
    return calculatedRows.reduce(
      (acc, { calc }) => {
        acc.subWage += calc.effectiveSubWage;
        acc.compWage += calc.compWage;
        acc.empShare += calc.employeeShare;
        acc.employerShare += calc.employerShare;
        acc.totalDue += calc.totalContribution;
        return acc;
      },
      { subWage: 0, compWage: 0, empShare: 0, employerShare: 0, totalDue: 0 }
    );
  }, [calculatedRows]);

  const handleSaveWageConfig = (e: React.FormEvent) => {
    e.preventDefault();
    insuranceStorage.saveWageConfig(wageConfig);
    setShowConfigModal(false);
    setNotice('تم تحديث الحدود القانونية لأجر الاشتراك ونسب التأمينات بنجاح');
    setTimeout(() => setNotice(null), 4000);
  };

  const handleQuickSaveEmployeeWage = async (emp: InsuredEmployeeRecord) => {
    if (!canEdit) return;
    await insuranceStorage.saveEmployee(
      {
        ...emp,
        sub_wage: Number(normalizeDigits(tempSubWage)) || 0,
        comp_wage: Number(normalizeDigits(tempCompWage)) || 0,
      },
      currentUserName
    );
    setEditingWageEmpId(null);
    await onRefreshData();
  };

  const handleCreateRemittance = async (e: React.FormEvent) => {
    e.preventDefault();
    const comp = companies.find((c) => c.id === remForm.company_id);
    const compRows = calculatedRows.filter(
      (r) => !remForm.company_id || r.emp.company_id === remForm.company_id
    );
    const compTotals = compRows.reduce(
      (acc, { calc }) => {
        acc.subWage += calc.effectiveSubWage;
        acc.compWage += calc.compWage;
        acc.empShare += calc.employeeShare;
        acc.employerShare += calc.employerShare;
        acc.totalDue += calc.totalContribution;
        return acc;
      },
      { subWage: 0, compWage: 0, empShare: 0, employerShare: 0, totalDue: 0 }
    );

    await insuranceStorage.saveRemittance(
      {
        month_year: remForm.month_year,
        company_id: remForm.company_id,
        company_name: comp?.nameAr || 'جميع الشركات',
        employees_count: compRows.length,
        total_sub_wage: Number(compTotals.subWage.toFixed(2)),
        total_comp_wage: Number(compTotals.compWage.toFixed(2)),
        employee_share_total: Number(compTotals.empShare.toFixed(2)),
        employer_share_total: Number(compTotals.employerShare.toFixed(2)),
        total_due: Number(compTotals.totalDue.toFixed(2)),
        receipt_number: remForm.receipt_number,
        payment_date: remForm.payment_date,
        status: remForm.status,
        notes: remForm.notes,
        attachment_data: remForm.attachment_data,
        attachment_name: remForm.attachment_name,
      },
      currentUserName
    );

    setShowRemittanceModal(false);
    await onRefreshData();
    setNotice('تم إصدار وحفظ حافظة التوريد الشهرية للهيئة بنجاح');
    setTimeout(() => setNotice(null), 4000);
  };

  return (
    <div className="space-y-5">
      {notice && (
        <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-emerald-500/15 text-emerald-900 dark:text-emerald-200 border border-emerald-500/40 text-xs font-bold">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{notice}</span>
          </div>
          <button type="button" onClick={() => setNotice(null)} className="p-1 cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Statutory Wage Caps Banner */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#112219] border border-amber-500/30 shadow-sm flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              {t(
                'معايير حساب الاشتراكات التأمينية المعتمدة (قانون 148 لسنة 2019)',
                'Statutory Insurance Contribution Parameters (Law 148/2019)'
              )}
            </h3>
            <div className="flex flex-wrap items-center gap-3 mt-1 text-xs font-mono text-slate-600 dark:text-stone-300">
              <span>
                الحد الأدنى لأجر الاشتراك:{' '}
                <strong className="text-amber-700 dark:text-amber-400">
                  {wageConfig.minSubWage.toLocaleString('en-US')} ج.م
                </strong>
              </span>
              <span>|</span>
              <span>
                الحد الأقصى لأجر الاشتراك:{' '}
                <strong className="text-amber-700 dark:text-amber-400">
                  {wageConfig.maxSubWage.toLocaleString('en-US')} ج.م
                </strong>
              </span>
              <span>|</span>
              <span>
                حصة العامل: <strong>{wageConfig.employeeShareRate}%</strong>
              </span>
              <span>|</span>
              <span>
                حصة الشركة: <strong>{wageConfig.employerShareRate}%</strong>
              </span>
              <span>|</span>
              <span>
                الإجمالي:{' '}
                <strong className="text-emerald-700 dark:text-emerald-400">
                  {(wageConfig.employeeShareRate + wageConfig.employerShareRate).toFixed(2)}%
                </strong>
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canEdit && (
            <button
              type="button"
              onClick={() => setShowConfigModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-[#172D21] text-slate-800 dark:text-stone-200 border border-slate-200 dark:border-[#243B2D] cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>ضبط الحدود القانونية</span>
            </button>
          )}

          {canExport && (
            <button
              type="button"
              onClick={() =>
                exportWagesAndS2ToExcel(
                  activeEmployees,
                  wageConfig,
                  companies.find((c) => c.id === selectedCompanyId)?.nameAr || 'جميع الشركات'
                )
              }
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 dark:text-amber-300 border border-amber-500/30 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>تصدير كشف الأجور (س2) Excel</span>
            </button>
          )}

          {canCreate && (
            <button
              type="button"
              onClick={() => setShowRemittanceModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>+ إصدار حافظة توريد شهرية</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#112219] border border-slate-200/80 dark:border-[#22382B] shadow-sm">
          <span className="text-xs font-bold text-slate-500 dark:text-stone-400 block">
            إجمالي وعاء أجور الاشتراك الشهري
          </span>
          <span className="text-xl font-black font-mono text-slate-900 dark:text-white mt-1 block">
            {totals.subWage.toLocaleString('en-US', { minimumFractionDigits: 2 })} ج.م
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">
            لعدد ({activeEmployees.length}) موظف على رأس العمل
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#112219] border border-slate-200/80 dark:border-[#22382B] shadow-sm">
          <span className="text-xs font-bold text-slate-500 dark:text-stone-400 block">
            حصة العاملين الشهرية ({wageConfig.employeeShareRate}%)
          </span>
          <span className="text-xl font-black font-mono text-amber-700 dark:text-amber-400 mt-1 block">
            {totals.empShare.toLocaleString('en-US', { minimumFractionDigits: 2 })} ج.م
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">تُستقطع من راتب الموظف</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#112219] border border-slate-200/80 dark:border-[#22382B] shadow-sm">
          <span className="text-xs font-bold text-slate-500 dark:text-stone-400 block">
            حصة الشركة / صاحب العمل ({wageConfig.employerShareRate}%)
          </span>
          <span className="text-xl font-black font-mono text-amber-700 dark:text-amber-300 mt-1 block">
            {totals.employerShare.toLocaleString('en-US', { minimumFractionDigits: 2 })} ج.م
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">تتحملها المنشأة شهرياً</span>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/15 to-amber-600/5 border border-amber-500/40 shadow-sm">
          <span className="text-xs font-bold text-amber-900 dark:text-amber-200 block">
            إجمالي المطالبة الشهرية للهيئة (29.75%)
          </span>
          <span className="text-xl font-black font-mono text-emerald-700 dark:text-emerald-400 mt-1 block">
            {totals.totalDue.toLocaleString('en-US', { minimumFractionDigits: 2 })} ج.م
          </span>
          <span className="text-[11px] text-amber-800/80 dark:text-amber-300/80 mt-1 block">
            واجب التوريد للهيئة القومية للتأمين الاجتماعي
          </span>
        </div>
      </div>

      {/* Per-Employee Wage & Contribution Table */}
      <div className="rounded-2xl bg-white dark:bg-[#112219] border border-slate-200/80 dark:border-[#22382B] shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-[#22382B] flex items-center justify-between">
          <h4 className="text-xs font-black text-slate-900 dark:text-white">
            جدول حساب الأجور والاشتراكات الفردية للمؤمن عليهم ({calculatedRows.length})
          </h4>
          <span className="text-[11px] text-slate-500 dark:text-stone-400">
            انقر على أي أجر لتعديله مباشرة وحساب الفروق تلقائياً
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#0B1711] border-b border-slate-200 dark:border-[#22382B] text-slate-600 dark:text-amber-400 font-bold">
                <th className="p-3">كود</th>
                <th className="p-3">اسم المؤمن عليه</th>
                <th className="p-3">الشركة</th>
                <th className="p-3">الرقم التأميني</th>
                <th className="p-3">أجر الاشتراك المسجل</th>
                <th className="p-3">الأجر الشامل</th>
                <th className="p-3">حصة الموظف ({wageConfig.employeeShareRate}%)</th>
                <th className="p-3">حصة الشركة ({wageConfig.employerShareRate}%)</th>
                <th className="p-3">إجمالي الاشتراك (29.75%)</th>
                <th className="p-3 text-center">تعديل الأجر</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1B3024]">
              {calculatedRows.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-10 text-center text-slate-500">
                    لا توجد سجلات موظفين على رأس العمل حالياً لحساب وعاء الأجور (0 موظف).
                  </td>
                </tr>
              ) : (
                calculatedRows.map(({ emp, calc }) => {
                  const isEditing = editingWageEmpId === emp.id;
                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/80 dark:hover:bg-[#152B20]/70">
                      <td className="p-3 font-mono font-bold text-amber-700 dark:text-amber-400">
                        {emp.code}
                      </td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{emp.name}</td>
                      <td className="p-3 text-slate-700 dark:text-stone-300">{emp.company_name}</td>
                      <td className="p-3 font-mono">{emp.insurance_number || '—'}</td>
                      <td className="p-3 font-mono font-bold">
                        {isEditing ? (
                          <input
                            type="text"
                            inputMode="decimal"
                            value={tempSubWage}
                            onChange={(e) => setTempSubWage(e.target.value)}
                            className="w-24 px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500 text-xs font-mono"
                          />
                        ) : (
                          <div>
                            <span>{calc.effectiveSubWage.toLocaleString('en-US')} ج.م</span>
                            {calc.isBelowMin && (
                              <span className="block text-[10px] text-amber-600">
                                رُفع للحد الأدنى ({wageConfig.minSubWage})
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="p-3 font-mono">
                        {isEditing ? (
                          <input
                            type="text"
                            inputMode="decimal"
                            value={tempCompWage}
                            onChange={(e) => setTempCompWage(e.target.value)}
                            className="w-24 px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500 text-xs font-mono"
                          />
                        ) : (
                          <span>{calc.compWage.toLocaleString('en-US')} ج.م</span>
                        )}
                      </td>
                      <td className="p-3 font-mono text-amber-700 dark:text-amber-400 font-bold">
                        {calc.employeeShare.toLocaleString('en-US')} ج.م
                      </td>
                      <td className="p-3 font-mono text-slate-700 dark:text-stone-300 font-bold">
                        {calc.employerShare.toLocaleString('en-US')} ج.م
                      </td>
                      <td className="p-3 font-mono font-black text-emerald-700 dark:text-emerald-400">
                        {calc.totalContribution.toLocaleString('en-US')} ج.م
                      </td>
                      <td className="p-3 text-center">
                        {isEditing ? (
                          <button
                            type="button"
                            onClick={() => handleQuickSaveEmployeeWage(emp)}
                            className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs cursor-pointer"
                          >
                            <Save className="w-3.5 h-3.5 inline me-1" />
                            حفظ
                          </button>
                        ) : (
                          canEdit && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingWageEmpId(emp.id);
                                setTempSubWage(String(emp.sub_wage || 0));
                                setTempCompWage(String(emp.comp_wage || 0));
                              }}
                              className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 border border-amber-500/25 text-[11px] font-bold cursor-pointer"
                            >
                              تعديل الأجر
                            </button>
                          )
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Monthly Remittance Batches (`ins_remittances`) */}
      <div className="rounded-2xl bg-white dark:bg-[#112219] border border-slate-200/80 dark:border-[#22382B] shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-[#22382B] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <h4 className="text-xs font-black text-slate-900 dark:text-white">
              سجل حوافظ التوريد وإيصالات السداد الشهرية للهيئة ({remittances.length})
            </h4>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#0B1711] border-b border-slate-200 dark:border-[#22382B] text-slate-600 dark:text-amber-400 font-bold">
                <th className="p-3">كود الحافظة</th>
                <th className="p-3">الشهر / السنة</th>
                <th className="p-3">الشركة</th>
                <th className="p-3">عدد العاملين</th>
                <th className="p-3">إجمالي أجر الاشتراك</th>
                <th className="p-3">إجمالي المسدد (29.75%)</th>
                <th className="p-3">رقم الإيصال</th>
                <th className="p-3">الحالة</th>
                <th className="p-3 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1B3024]">
              {remittances.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500">
                    لا توجد حوافظ توريد مسجلة بعد (0 حافظة).
                  </td>
                </tr>
              ) : (
                remittances.map((rem) => (
                  <tr key={rem.id} className="hover:bg-slate-50/80 dark:hover:bg-[#152B20]/70">
                    <td className="p-3 font-mono font-bold text-amber-700 dark:text-amber-400">
                      {rem.batch_code}
                    </td>
                    <td className="p-3 font-mono font-bold">{rem.month_year}</td>
                    <td className="p-3 font-bold text-slate-900 dark:text-white">
                      {rem.company_name}
                    </td>
                    <td className="p-3 font-mono">{rem.employees_count}</td>
                    <td className="p-3 font-mono">
                      {Number(rem.total_sub_wage || 0).toLocaleString('en-US')} ج.م
                    </td>
                    <td className="p-3 font-mono font-black text-emerald-700 dark:text-emerald-400">
                      {Number(rem.total_due || 0).toLocaleString('en-US')} ج.م
                    </td>
                    <td className="p-3 font-mono">{rem.receipt_number || '—'}</td>
                    <td className="p-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                        {rem.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-1">
                        {rem.attachment_data && (
                          <button
                            type="button"
                            onClick={() =>
                              onPreviewAttachment(
                                `إيصال سداد الحافظة (${rem.batch_code})`,
                                createBlobUrlFromDataUrl(rem.attachment_data!),
                                rem.attachment_name || 'receipt'
                              )
                            }
                            className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 flex items-center justify-center cursor-pointer"
                            title="معاينة الإيصال"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            onOpenAuditLog(`سجل حافظة التوريد (${rem.batch_code})`, rem.audit_log_json)
                          }
                          className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-800 dark:text-amber-300 flex items-center justify-center cursor-pointer"
                          title="سجل التدقيق (!)"
                        >
                          <AlertCircle className="w-3.5 h-3.5" />
                        </button>
                        {canDelete && (
                          <button
                            type="button"
                            onClick={async () => {
                              await insuranceStorage.deleteRemittance(rem.id);
                              await onRefreshData();
                            }}
                            className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center cursor-pointer"
                            title="حذف الحافظة"
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

      {/* Statutory Wage Config Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#0D1F17] border border-amber-500/30 shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              ضبط الحدود القانونية لأجر الاشتراك التأميني
            </h3>
            <form onSubmit={handleSaveWageConfig} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 mb-1">
                  الحد الأدنى لأجر الاشتراك التأميني (ج.م)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={wageConfig.minSubWage}
                  onChange={(e) =>
                    setWageConfig((p) => ({
                      ...p,
                      minSubWage: Number(normalizeDigits(e.target.value)) || 0,
                    }))
                  }
                  className="w-full px-3 py-2 rounded-xl text-xs font-mono font-bold bg-slate-50 dark:bg-[#08140E] border border-slate-200 dark:border-[#243B2D] text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 mb-1">
                  الحد الأقصى لأجر الاشتراك التأميني (ج.م)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={wageConfig.maxSubWage}
                  onChange={(e) =>
                    setWageConfig((p) => ({
                      ...p,
                      maxSubWage: Number(normalizeDigits(e.target.value)) || 0,
                    }))
                  }
                  className="w-full px-3 py-2 rounded-xl text-xs font-mono font-bold bg-slate-50 dark:bg-[#08140E] border border-slate-200 dark:border-[#243B2D] text-slate-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 mb-1">
                    نسبة حصة العامل (%)
                  </label>
                  <input
                    type="text"
                    value={wageConfig.employeeShareRate}
                    onChange={(e) =>
                      setWageConfig((p) => ({ ...p, employeeShareRate: Number(e.target.value) || 11 }))
                    }
                    className="w-full px-3 py-2 rounded-xl text-xs font-mono font-bold bg-slate-50 dark:bg-[#08140E] border border-slate-200 dark:border-[#243B2D] text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 mb-1">
                    نسبة حصة المنشأة (%)
                  </label>
                  <input
                    type="text"
                    value={wageConfig.employerShareRate}
                    onChange={(e) =>
                      setWageConfig((p) => ({
                        ...p,
                        employerShareRate: Number(e.target.value) || 18.75,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl text-xs font-mono font-bold bg-slate-50 dark:bg-[#08140E] border border-slate-200 dark:border-[#243B2D] text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-[#172D21] cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 cursor-pointer"
                >
                  حفظ الإعدادات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Remittance Batch Modal */}
      {showRemittanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#0D1F17] border border-amber-500/30 shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              إصدار حافظة توريد اشتراكات شهرية للهيئة
            </h3>
            <form onSubmit={handleCreateRemittance} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 mb-1">
                    شهر الاستحقاق
                  </label>
                  <input
                    type="month"
                    value={remForm.month_year}
                    onChange={(e) => setRemForm((p) => ({ ...p, month_year: e.target.value }))}
                    required
                    className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-slate-50 dark:bg-[#08140E] border border-slate-200 dark:border-[#243B2D] text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 mb-1">
                    الشركة / المنشأة
                  </label>
                  <select
                    value={remForm.company_id}
                    onChange={(e) => setRemForm((p) => ({ ...p, company_id: e.target.value }))}
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
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 mb-1">
                    رقم إيصال السداد / الشيك
                  </label>
                  <input
                    type="text"
                    value={remForm.receipt_number}
                    onChange={(e) => setRemForm((p) => ({ ...p, receipt_number: e.target.value }))}
                    placeholder="REC-2026-991"
                    className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-slate-50 dark:bg-[#08140E] border border-slate-200 dark:border-[#243B2D] text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 mb-1">
                    تاريخ السداد
                  </label>
                  <input
                    type="date"
                    value={remForm.payment_date}
                    onChange={(e) => setRemForm((p) => ({ ...p, payment_date: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-slate-50 dark:bg-[#08140E] border border-slate-200 dark:border-[#243B2D] text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 mb-1">
                  حالة الحافظة
                </label>
                <select
                  value={remForm.status}
                  onChange={(e) =>
                    setRemForm((p) => ({ ...p, status: e.target.value as any }))
                  }
                  className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-slate-50 dark:bg-[#08140E] border border-slate-200 dark:border-[#243B2D] text-slate-900 dark:text-white"
                >
                  <option value="تم السداد والتوريد">تم السداد والتوريد</option>
                  <option value="مجدول للدفع">مجدول للدفع</option>
                  <option value="قيد المراجعة المالية">قيد المراجعة المالية</option>
                  <option value="متأخر">متأخر</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowRemittanceModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-[#172D21] cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 cursor-pointer"
                >
                  اعتماد وحفظ الحافظة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
