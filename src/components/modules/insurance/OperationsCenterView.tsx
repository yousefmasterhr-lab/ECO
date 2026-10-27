import React, { useState, useMemo, useRef } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import {
  insuranceStorage,
  InsuranceOperationRecord,
  InsuredEmployeeRecord,
  OperationStatusType,
  DEFAULT_INSURANCE_REQUEST_TYPES,
  normalizeDigits,
  createBlobUrlFromDataUrl,
} from '../../../services/insuranceStorage';
import {
  exportOperationsToExcel,
  downloadOperationsTemplateExcel,
  parseOperationsExcelFile,
} from '../../../services/insuranceExcelUtils';
import { CreatableSelect } from '../../common/CreatableSelect';
import {
  Plus,
  Search,
  FileSpreadsheet,
  Upload,
  Download,
  Trash2,
  CheckCircle2,
  Clock,
  RefreshCw,
  AlertTriangle,
  Copy,
  Eye,
  Printer,
  Pencil,
  AlertCircle,
  Paperclip,
  X,
  CheckSquare,
  Square,
  Link2,
  Building2,
  UserCheck,
} from 'lucide-react';

interface OperationsCenterViewProps {
  operations: InsuranceOperationRecord[];
  employees: InsuredEmployeeRecord[];
  hrEmployees: any[];
  companies: Array<{ id: string; nameAr: string; nameEn?: string }>;
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

export const OperationsCenterView: React.FC<OperationsCenterViewProps> = ({
  operations,
  employees,
  hrEmployees,
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [bannerNotice, setBannerNotice] = useState<{ type: 'success' | 'warning'; text: string } | null>(null);

  // Add/Edit Operation Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOp, setEditingOp] = useState<InsuranceOperationRecord | null>(null);
  const [empSuggestionsOpen, setEmpSuggestionsOpen] = useState(false);

  const [formState, setFormState] = useState({
    seq_num: 1,
    request_code: '',
    incoming_number: '',
    incoming_date: new Date().toISOString().slice(0, 10),
    request_type: 'س1',
    status: 'انتظار' as OperationStatusType,
    company_id: selectedCompanyId !== 'all' ? selectedCompanyId : companies[0]?.id || '',
    company_name: '',
    employee_id: '',
    employee_code: '',
    employee_name: '',
    national_id: '',
    insurance_number: '',
    notes: '',
    attachment_data: null as string | null,
    attachment_name: null as string | null,
  });

  // Live Status KPI Counts
  const kpiCounts = useMemo(() => {
    const total = operations.length;
    const pending = operations.filter((o) => o.status === 'انتظار').length;
    const review = operations.filter((o) => o.status === 'قيد المراجعة').length;
    const completed = operations.filter((o) => o.status === 'مكتمل').length;
    const rejected = operations.filter((o) => o.status === 'مرفوض').length;
    const duplicate = operations.filter((o) => o.status === 'مكرر').length;
    return { total, pending, review, completed, rejected, duplicate };
  }, [operations]);

  // Filtered Operations
  const filteredOperations = useMemo(() => {
    return operations.filter((op) => {
      if (statusFilter !== 'all' && op.status !== statusFilter) return false;
      if (typeFilter !== 'all' && op.request_type !== typeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const match =
          (op.request_code || '').toLowerCase().includes(q) ||
          (op.incoming_number || '').toLowerCase().includes(q) ||
          (op.employee_name || '').toLowerCase().includes(q) ||
          (op.company_name || '').toLowerCase().includes(q) ||
          (op.national_id || '').includes(q) ||
          (op.insurance_number || '').includes(q) ||
          (op.request_type || '').toLowerCase().includes(q) ||
          (op.notes || '').toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [operations, statusFilter, typeFilter, searchQuery]);

  // Combined employee pool (Insured Registry + HR Employees) for smart autocomplete
  const unifiedEmployeePool = useMemo(() => {
    const map = new Map<
      string,
      {
        id: string;
        code: string;
        name: string;
        nationalId: string;
        insuranceNumber: string;
        companyId: string;
        companyName: string;
        source: 'insured' | 'hr';
      }
    >();

    employees.forEach((e) => {
      const key = normalizeDigits(e.national_id) || e.id;
      map.set(key, {
        id: e.id,
        code: e.code || '',
        name: e.name,
        nationalId: e.national_id || '',
        insuranceNumber: e.insurance_number || '',
        companyId: e.company_id || '',
        companyName: e.company_name || '',
        source: 'insured',
      });
    });

    hrEmployees.forEach((h) => {
      const nat = normalizeDigits(h.nationalId || h.national_id || '');
      const key = nat || h.id;
      if (!map.has(key)) {
        const comp = companies.find((c) => c.id === (h.companyId || h.company_id));
        map.set(key, {
          id: h.id,
          code: h.code || h.employeeCode || '',
          name: h.nameAr || h.name || '',
          nationalId: nat,
          insuranceNumber: normalizeDigits(h.insuranceNumber || h.socialInsuranceNo || ''),
          companyId: h.companyId || h.company_id || '',
          companyName: comp?.nameAr || h.companyName || '',
          source: 'hr',
        });
      }
    });

    return Array.from(map.values());
  }, [employees, hrEmployees, companies]);

  const matchingSuggestions = useMemo(() => {
    const q = formState.employee_name.trim().toLowerCase();
    if (!q) return unifiedEmployeePool.slice(0, 8);
    return unifiedEmployeePool
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.nationalId.includes(q) ||
          p.insuranceNumber.includes(q) ||
          p.code.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [formState.employee_name, unifiedEmployeePool]);

  const openAddModal = () => {
    const maxSeq = operations.reduce((max, o) => Math.max(max, Number(o.seq_num) || 0), 0);
    const nextSeq = maxSeq + 1;
    const defaultCompId = selectedCompanyId !== 'all' ? selectedCompanyId : companies[0]?.id || '';
    const defaultComp = companies.find((c) => c.id === defaultCompId);

    setEditingOp(null);
    setFormState({
      seq_num: nextSeq,
      request_code: `OP-${String(nextSeq).padStart(4, '0')}`,
      incoming_number: '',
      incoming_date: new Date().toISOString().slice(0, 10),
      request_type: 'س1',
      status: 'انتظار',
      company_id: defaultCompId,
      company_name: defaultComp?.nameAr || '',
      employee_id: '',
      employee_code: '',
      employee_name: '',
      national_id: '',
      insurance_number: '',
      notes: '',
      attachment_data: null,
      attachment_name: null,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (op: InsuranceOperationRecord) => {
    setEditingOp(op);
    setFormState({
      seq_num: op.seq_num,
      request_code: op.request_code,
      incoming_number: op.incoming_number || '',
      incoming_date: op.incoming_date || new Date().toISOString().slice(0, 10),
      request_type: op.request_type || 'س1',
      status: op.status || 'انتظار',
      company_id: op.company_id || '',
      company_name: op.company_name || '',
      employee_id: op.employee_id || '',
      employee_code: op.employee_code || '',
      employee_name: op.employee_name || '',
      national_id: op.national_id || '',
      insurance_number: op.insurance_number || '',
      notes: op.notes || '',
      attachment_data: op.attachment_data || null,
      attachment_name: op.attachment_name || null,
    });
    setIsModalOpen(true);
  };

  const handleSaveOperation = async (e: React.FormEvent) => {
    e.preventDefault();
    const comp = companies.find((c) => c.id === formState.company_id);
    const payload: Partial<InsuranceOperationRecord> = {
      ...(editingOp ? { id: editingOp.id } : {}),
      ...formState,
      company_name: comp?.nameAr || formState.company_name,
    };

    const { duplicateCheck } = await insuranceStorage.saveOperation(payload, currentUserName);
    setIsModalOpen(false);
    await onRefreshData();

    if (duplicateCheck.isDuplicate) {
      setBannerNotice({
        type: 'warning',
        text: `تنبيه رصد تكرار تلقائي: تم تصنيف العملية كـ (مكرر) — ${duplicateCheck.reason}`,
      });
    } else {
      setBannerNotice({
        type: 'success',
        text: editingOp ? 'تم تحديث بيانات العملية التأمينية بنجاح' : 'تم تسجيل العملية التأمينية بنجاح',
      });
    }
    setTimeout(() => setBannerNotice(null), 5000);
  };

  const handleCycleStatus = async (op: InsuranceOperationRecord) => {
    if (!canEdit) return;
    const cycle: OperationStatusType[] = ['انتظار', 'قيد المراجعة', 'مكتمل', 'مرفوض', 'مكرر'];
    const nextStatus = cycle[(cycle.indexOf(op.status) + 1) % cycle.length];
    await insuranceStorage.saveOperation({ ...op, status: nextStatus }, currentUserName);
    await onRefreshData();
  };

  const handleDeleteSingle = async (op: InsuranceOperationRecord) => {
    if (!canDelete) return;
    await insuranceStorage.deleteOperations([op.id]);
    setSelectedIds((prev) => prev.filter((id) => id !== op.id));
    await onRefreshData();
  };

  const handleBulkStatusChange = async (newStatus: OperationStatusType) => {
    if (!canEdit || selectedIds.length === 0) return;
    await insuranceStorage.bulkUpdateOperationStatus(selectedIds, newStatus, currentUserName);
    setSelectedIds([]);
    await onRefreshData();
    setBannerNotice({
      type: 'success',
      text: `تم تحديث حالة (${selectedIds.length}) عملية إلى "${newStatus}" بنجاح`,
    });
    setTimeout(() => setBannerNotice(null), 4000);
  };

  const handleBulkDelete = async () => {
    if (!canDelete || selectedIds.length === 0) return;
    await insuranceStorage.deleteOperations(selectedIds);
    const count = selectedIds.length;
    setSelectedIds([]);
    await onRefreshData();
    setBannerNotice({
      type: 'warning',
      text: `تم حذف (${count}) عملية تأمينية محددة`,
    });
    setTimeout(() => setBannerNotice(null), 4000);
  };

  const handleImportExcelChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImporting(true);
    try {
      const parsed = await parseOperationsExcelFile(file, companies, employees);
      if (parsed.length > 0) {
        const { imported, duplicates } = await insuranceStorage.bulkSaveOperations(parsed, currentUserName);
        await onRefreshData();
        setBannerNotice({
          type: duplicates > 0 ? 'warning' : 'success',
          text: `تم استيراد (${imported}) عملية من ملف Excel بنجاح${
            duplicates > 0 ? ` — تم رصد (${duplicates}) طلب مكرر تلقائياً` : ''
          }`,
        });
        setTimeout(() => setBannerNotice(null), 6000);
      }
    } catch (err) {
      console.error('[Operations Excel Import Error]:', err);
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setFormState((prev) => ({
        ...prev,
        attachment_data: reader.result as string,
        attachment_name: file.name,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handlePrintOperationSlip = (op: InsuranceOperationRecord) => {
    const printWin = window.open('', '_blank', 'width=850,height=700');
    if (!printWin) return;
    printWin.document.write(`
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8" />
        <title>إيصال عملية تأمينية - ${op.request_code}</title>
        <style>
          body { font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif; padding: 32px; color: #0f172a; }
          .card { border: 2px solid #d97706; border-radius: 16px; padding: 28px; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f59e0b; padding-bottom: 16px; margin-bottom: 20px; }
          .title { font-size: 20px; font-weight: 800; color: #07130E; }
          .badge { background: #fef3c7; color: #92400e; padding: 6px 14px; border-radius: 999px; font-weight: 700; font-size: 13px; border: 1px solid #f59e0b; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          th, td { border: 1px solid #cbd5e1; padding: 10px 14px; text-align: right; font-size: 14px; }
          th { background: #f8fafc; width: 32%; font-weight: 700; color: #334155; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <div>
              <div class="title">بيان عملية تأمينية مسجلة - مركز العمليات</div>
              <div style="font-size:13px;color:#64748b;margin-top:4px;">الشركة / المنشأة: ${op.company_name || '—'}</div>
            </div>
            <div class="badge">${op.request_code} | ${op.status}</div>
          </div>
          <table>
            <tr><th>رقم الوارد التأميني</th><td>${op.incoming_number || '—'}</td></tr>
            <tr><th>تاريخ الوارد</th><td>${op.incoming_date || '—'}</td></tr>
            <tr><th>نوع الطلب / الاستمارة</th><td>${op.request_type || '—'}</td></tr>
            <tr><th>اسم المؤمن عليه</th><td>${op.employee_name || '—'}</td></tr>
            <tr><th>كود الموظف</th><td>${op.employee_code || '—'}</td></tr>
            <tr><th>الرقم القومي</th><td>${op.national_id || '—'}</td></tr>
            <tr><th>الرقم التأميني</th><td>${op.insurance_number || '—'}</td></tr>
            <tr><th>الملاحظات والبيان</th><td>${op.notes || '—'}</td></tr>
          </table>
        </div>
        <script>window.onload = () => { window.print(); }</script>
      </body>
      </html>
    `);
    printWin.document.close();
  };

  const getStatusBadgeClasses = (status: OperationStatusType) => {
    switch (status) {
      case 'مكتمل':
        return 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30';
      case 'قيد المراجعة':
        return 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30';
      case 'مرفوض':
        return 'bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-500/30';
      case 'مكرر':
        return 'bg-purple-500/15 text-purple-800 dark:text-purple-300 border-purple-500/30';
      default:
        return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25';
    }
  };

  const allSelected =
    filteredOperations.length > 0 &&
    filteredOperations.every((op) => selectedIds.includes(op.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredOperations.map((o) => o.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-5">
      {/* Notification Banner */}
      {bannerNotice && (
        <div
          className={`flex items-center justify-between px-4 py-3 rounded-2xl border text-xs font-bold shadow-sm ${
            bannerNotice.type === 'warning'
              ? 'bg-amber-500/15 text-amber-900 dark:text-amber-200 border-amber-500/40'
              : 'bg-emerald-500/15 text-emerald-900 dark:text-emerald-200 border-emerald-500/40'
          }`}
        >
          <div className="flex items-center gap-2">
            {bannerNotice.type === 'warning' ? (
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            )}
            <span>{bannerNotice.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setBannerNotice(null)}
            className="p-1 rounded-lg hover:bg-black/10 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Interactive Status Filter Cards (`الإجمالي`, `انتظار`, `قيد المراجعة`, `مكتمل`, `مرفوض`, `مكرر`) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {[
          { key: 'all', label: 'الإجمالي', count: kpiCounts.total, icon: FileSpreadsheet, tone: 'amber' },
          { key: 'انتظار', label: 'انتظار', count: kpiCounts.pending, icon: Clock, tone: 'amber' },
          { key: 'قيد المراجعة', label: 'قيد المراجعة', count: kpiCounts.review, icon: RefreshCw, tone: 'amber' },
          { key: 'مكتمل', label: 'مكتمل', count: kpiCounts.completed, icon: CheckCircle2, tone: 'emerald' },
          { key: 'مرفوض', label: 'مرفوض', count: kpiCounts.rejected, icon: AlertTriangle, tone: 'rose' },
          { key: 'مكرر', label: 'مكرر', count: kpiCounts.duplicate, icon: Copy, tone: 'purple' },
        ].map((card) => {
          const Icon = card.icon;
          const isActive = statusFilter === card.key;
          return (
            <button
              key={card.key}
              type="button"
              onClick={() => setStatusFilter(card.key)}
              className={`p-3.5 rounded-2xl border text-start transition-all cursor-pointer flex items-center justify-between ${
                isActive
                  ? 'bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-amber-500 shadow-md ring-1 ring-amber-500/30'
                  : 'bg-white dark:bg-[#112219] border-slate-200/80 dark:border-[#22382B] hover:border-amber-500/40'
              }`}
            >
              <div>
                <span className="text-xs font-bold text-slate-600 dark:text-stone-300 block">
                  {card.label}
                </span>
                <span className="text-xl font-black font-mono text-slate-900 dark:text-white mt-0.5 block">
                  {card.count}
                </span>
              </div>
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  isActive
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Action & Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#112219] border border-slate-200/80 dark:border-[#22382B] shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          {/* Search & Type Filter */}
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            <div className="relative flex-1 min-w-[230px]">
              <Search className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t(
                  'بحث برقم الوارد، كود الطلب، اسم الموظف، الرقم القومي أو التأميني، الشركة...',
                  'Search by incoming no, request code, employee, national ID...'
                )}
                className="w-full ps-9 pe-4 py-2 rounded-xl text-xs font-medium bg-slate-50 dark:bg-[#0B1711] border border-slate-200 dark:border-[#243B2D] text-slate-900 dark:text-stone-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-50 dark:bg-[#0B1711] border border-slate-200 dark:border-[#243B2D] text-slate-800 dark:text-stone-200 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="all">{t('جميع أنواع الطلبات', 'All Request Types')}</option>
              {DEFAULT_INSURANCE_REQUEST_TYPES.map((rt) => (
                <option key={rt.id} value={rt.value}>
                  {rt.value}
                </option>
              ))}
            </select>
          </div>

          {/* Excel & Add Operation Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleImportExcelChange}
              className="hidden"
            />

            {canCreate && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{isImporting ? t('جاري الاستيراد...', 'Importing...') : t('استيراد من Excel', 'Import Excel')}</span>
              </button>
            )}

            <button
              type="button"
              onClick={downloadOperationsTemplateExcel}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200/80 dark:bg-[#172D21] dark:hover:bg-[#1E3A2B] text-slate-700 dark:text-stone-200 border border-slate-200 dark:border-[#2A4535] transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>{t('تحميل نموذج فارغ', 'Empty Template')}</span>
            </button>

            {canExport && (
              <button
                type="button"
                onClick={() =>
                  exportOperationsToExcel(
                    selectedIds.length > 0
                      ? filteredOperations.filter((o) => selectedIds.includes(o.id))
                      : filteredOperations
                  )
                }
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 dark:text-amber-300 border border-amber-500/30 transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>{t('تصدير Excel', 'Export Excel')}</span>
              </button>
            )}

            {canCreate && (
              <button
                type="button"
                onClick={openAddModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>{t('+ إضافة عملية', '+ Add Operation')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Bulk Selection Action Bar */}
        {selectedIds.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-amber-500/20">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300">
              <CheckSquare className="w-4 h-4" />
              <span>
                {t(`تم تحديد (${selectedIds.length}) عملية تأمينية`, `${selectedIds.length} operations selected`)}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {canEdit && (
                <>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-stone-400">
                    {t('تغيير الحالة جماعياً:', 'Bulk Status:')}
                  </span>
                  {(['انتظار', 'قيد المراجعة', 'مكتمل', 'مرفوض'] as OperationStatusType[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleBulkStatusChange(st)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 dark:text-amber-200 border border-amber-500/30 cursor-pointer"
                    >
                      {st}
                    </button>
                  ))}
                </>
              )}
              {canDelete && (
                <button
                  type="button"
                  onClick={handleBulkDelete}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-bold bg-rose-500/15 hover:bg-rose-500/25 text-rose-700 dark:text-rose-300 border border-rose-500/30 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t('حذف المحدد', 'Delete Selected')}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Operations Center Table */}
      <div className="rounded-2xl bg-white dark:bg-[#112219] border border-slate-200/80 dark:border-[#22382B] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#0B1711] border-b border-slate-200 dark:border-[#22382B] text-slate-600 dark:text-amber-400/90 font-bold">
                <th className="p-3 w-10 text-center">
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="text-amber-600 dark:text-amber-400 cursor-pointer"
                    title={t('تحديد الكل', 'Select All')}
                  >
                    {allSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                  </button>
                </th>
                <th className="p-3 text-center">{t('م', '#')}</th>
                <th className="p-3 text-start">{t('كود الطلب', 'Request Code')}</th>
                <th className="p-3 text-start">{t('رقم الوارد', 'Incoming No.')}</th>
                <th className="p-3 text-start">{t('تاريخ الوارد', 'Date')}</th>
                <th className="p-3 text-start">{t('نوع الطلب', 'Type')}</th>
                <th className="p-3 text-start">{t('حالة الطلب', 'Status')}</th>
                <th className="p-3 text-start">{t('الشركة', 'Company')}</th>
                <th className="p-3 text-start">{t('الاسم', 'Employee Name')}</th>
                <th className="p-3 text-start">{t('الرقم التأميني / القومي', 'Ins / Nat ID')}</th>
                <th className="p-3 text-start">{t('الملاحظات', 'Notes')}</th>
                <th className="p-3 text-center">{t('المرفقات', 'Files')}</th>
                <th className="p-3 text-center">{t('الإجراءات', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1B3024]">
              {filteredOperations.length === 0 ? (
                <tr>
                  <td colSpan={13} className="p-12 text-center">
                    <div className="max-w-sm mx-auto space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto">
                        <FileSpreadsheet className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-bold text-slate-800 dark:text-stone-200">
                        {t('لا توجد عمليات تأمينية مسجلة حالياً (0 عملية)', 'No insurance operations recorded yet (0)')}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-stone-400">
                        {t(
                          'اضغط على "+ إضافة عملية" أو قم باستيراد ملف Excel لبدء تسجيل حركات س1 وس2 وس6 والطلبات التأمينية.',
                          'Click "+ Add Operation" or import an Excel sheet to start tracking S1, S2, S6 and insurance requests.'
                        )}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOperations.map((op, idx) => {
                  const isSelected = selectedIds.includes(op.id);
                  return (
                    <tr
                      key={op.id}
                      className={`transition-colors ${
                        isSelected
                          ? 'bg-amber-500/10 dark:bg-amber-500/10'
                          : 'hover:bg-slate-50/80 dark:hover:bg-[#152B20]/70'
                      }`}
                    >
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => toggleSelectOne(op.id)}
                          className="text-amber-600 dark:text-amber-400 cursor-pointer"
                        >
                          {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                        </button>
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-slate-500 dark:text-stone-400">
                        {op.seq_num || idx + 1}
                      </td>
                      <td className="p-3 font-mono font-bold text-amber-700 dark:text-amber-400">
                        {op.request_code}
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-900 dark:text-stone-100">
                        {op.incoming_number || '—'}
                      </td>
                      <td className="p-3 font-mono text-slate-600 dark:text-stone-300">
                        {op.incoming_date || '—'}
                      </td>
                      <td className="p-3">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/25">
                          {op.request_type}
                        </span>
                      </td>
                      <td className="p-3">
                        <button
                          type="button"
                          onClick={() => handleCycleStatus(op)}
                          title={t('انقر لتغيير الحالة سريعاً', 'Click to cycle status')}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border cursor-pointer ${getStatusBadgeClasses(
                            op.status
                          )}`}
                        >
                          <span>{op.status}</span>
                        </button>
                      </td>
                      <td className="p-3 font-bold text-slate-800 dark:text-stone-200">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                          <span>{op.company_name || '—'}</span>
                        </div>
                      </td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-1.5">
                          <span>{op.employee_name || '—'}</span>
                          {op.employee_id && (
                            <span
                              title={t('مرتبط بالسجل التأميني / الموارد البشرية', 'Linked to Employee Record')}
                              className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30"
                            >
                              <Link2 className="w-2.5 h-2.5" />
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 font-mono text-[11px] text-slate-700 dark:text-stone-300">
                        <div>{op.national_id ? `قومي: ${op.national_id}` : ''}</div>
                        <div>{op.insurance_number ? `تأميني: ${op.insurance_number}` : ''}</div>
                        {!op.national_id && !op.insurance_number && '—'}
                      </td>
                      <td className="p-3 text-slate-600 dark:text-stone-300 max-w-[200px] truncate">
                        {op.notes || '—'}
                      </td>
                      <td className="p-3 text-center">
                        {op.attachment_data ? (
                          <button
                            type="button"
                            onClick={() =>
                              onPreviewAttachment(
                                `مرفق العملية ${op.request_code}`,
                                createBlobUrlFromDataUrl(op.attachment_data!),
                                op.attachment_name || 'operation_attachment'
                              )
                            }
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 cursor-pointer"
                            title={op.attachment_name || 'معاينة المرفق'}
                          >
                            <Paperclip className="w-3 h-3" />
                            <span>{t('عرض', 'View')}</span>
                          </button>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="p-3">
                        {/* Golden Icon-Only Action Bar */}
                        <div className="flex items-center justify-center gap-1">
                          {op.attachment_data && (
                            <button
                              type="button"
                              onClick={() =>
                                onPreviewAttachment(
                                  `مرفق العملية ${op.request_code}`,
                                  createBlobUrlFromDataUrl(op.attachment_data!),
                                  op.attachment_name || 'document'
                                )
                              }
                              title={t('معاينة المستند المرفق', 'Preview Attachment')}
                              className="w-7 h-7 rounded-lg bg-amber-500/10 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/25 flex items-center justify-center transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handlePrintOperationSlip(op)}
                            title={t('طباعة بيان العملية', 'Print Operation Slip')}
                            className="w-7 h-7 rounded-lg bg-amber-500/10 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/25 flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {canEdit && (
                            <button
                              type="button"
                              onClick={() => openEditModal(op)}
                              title={t('تعديل العملية', 'Edit Operation')}
                              className="w-7 h-7 rounded-lg bg-amber-500/10 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/25 flex items-center justify-center transition-colors cursor-pointer"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              onOpenAuditLog(
                                `سجل تعديلات العملية (${op.request_code} - ${op.employee_name || op.request_type})`,
                                op.audit_log_json
                              )
                            }
                            title={t('سجل التدقيق والتعديلات (!)', 'Audit Trail (!)')}
                            className="w-7 h-7 rounded-lg bg-amber-500/15 hover:bg-amber-500/30 text-amber-800 dark:text-amber-300 border border-amber-500/35 flex items-center justify-center font-black transition-colors cursor-pointer"
                          >
                            <AlertCircle className="w-3.5 h-3.5" />
                          </button>

                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => handleDeleteSingle(op)}
                              title={t('حذف العملية', 'Delete Operation')}
                              className="w-7 h-7 rounded-lg bg-rose-500/10 hover:bg-rose-500/25 text-rose-600 dark:text-rose-400 border border-rose-500/25 flex items-center justify-center transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Operation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-[#0D1F17] border border-amber-500/30 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-[#22382B] bg-gradient-to-r from-amber-500/10 via-transparent to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {editingOp
                      ? t(`تعديل العملية التأمينية (${editingOp.request_code})`, 'Edit Insurance Operation')
                      : t('إضافة عملية تأمينية جديدة (مركز العمليات)', 'New Insurance Operation')}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-stone-400">
                    {t(
                      'يتم فحص التكرار تلقائياً وربط العملية بالسجل التأميني والشركة المختارة',
                      'Automatic duplicate detection & live company/employee linking'
                    )}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#172D21] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveOperation} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 mb-1">
                    {t('م (مسلسل)', 'Seq #')}
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formState.seq_num}
                    onChange={(e) =>
                      setFormState((p) => ({ ...p, seq_num: Number(normalizeDigits(e.target.value)) || 1 }))
                    }
                    className="w-full px-3 py-2 rounded-xl text-xs font-mono font-bold bg-slate-50 dark:bg-[#08140E] border border-slate-200 dark:border-[#243B2D] text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 mb-1">
                    {t('كود الطلب', 'Request Code')}
                  </label>
                  <input
                    type="text"
                    value={formState.request_code}
                    onChange={(e) => setFormState((p) => ({ ...p, request_code: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl text-xs font-mono font-bold bg-slate-50 dark:bg-[#08140E] border border-slate-200 dark:border-[#243B2D] text-amber-700 dark:text-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 mb-1">
                    {t('رقم الوارد التأميني', 'Incoming Number')}
                  </label>
                  <input
                    type="text"
                    value={formState.incoming_number}
                    onChange={(e) => setFormState((p) => ({ ...p, incoming_number: e.target.value }))}
                    placeholder="مثال: 2026/415"
                    className="w-full px-3 py-2 rounded-xl text-xs font-mono font-bold bg-slate-50 dark:bg-[#08140E] border border-slate-200 dark:border-[#243B2D] text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 mb-1">
                    {t('تاريخ الوارد', 'Incoming Date')}
                  </label>
                  <input
                    type="date"
                    value={formState.incoming_date}
                    onChange={(e) => setFormState((p) => ({ ...p, incoming_date: e.target.value }))}
                    required
                    className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-slate-50 dark:bg-[#08140E] border border-slate-200 dark:border-[#243B2D] text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <CreatableSelect
                    category="insurance_request_types"
                    label={t('نوع الطلب التأميني', 'Request Type')}
                    value={formState.request_type}
                    options={DEFAULT_INSURANCE_REQUEST_TYPES}
                    onChange={(val) => setFormState((p) => ({ ...p, request_type: val }))}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 mb-1">
                    {t('حالة الطلب', 'Status')}
                  </label>
                  <select
                    value={formState.status}
                    onChange={(e) =>
                      setFormState((p) => ({ ...p, status: e.target.value as OperationStatusType }))
                    }
                    className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-slate-50 dark:bg-[#08140E] border border-slate-200 dark:border-[#243B2D] text-slate-900 dark:text-white"
                  >
                    <option value="انتظار">انتظار</option>
                    <option value="قيد المراجعة">قيد المراجعة</option>
                    <option value="مكتمل">مكتمل</option>
                    <option value="مرفوض">مرفوض</option>
                    <option value="مكرر">مكرر</option>
                  </select>
                </div>
              </div>

              {/* Company & Employee Smart Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 mb-1">
                    {t('الشركة / المنشأة', 'Company')}
                  </label>
                  <select
                    value={formState.company_id}
                    onChange={(e) => {
                      const c = companies.find((comp) => comp.id === e.target.value);
                      setFormState((p) => ({
                        ...p,
                        company_id: e.target.value,
                        company_name: c?.nameAr || p.company_name,
                      }));
                    }}
                    className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-slate-50 dark:bg-[#08140E] border border-slate-200 dark:border-[#243B2D] text-slate-900 dark:text-white"
                  >
                    <option value="">{t('-- اختر الشركة --', '-- Select Company --')}</option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nameAr}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 mb-1">
                    {t('اسم الموظف / المؤمن عليه (بحث ذكي أو إدخال مباشر)', 'Employee Name')}
                  </label>
                  <input
                    type="text"
                    value={formState.employee_name}
                    onFocus={() => setEmpSuggestionsOpen(true)}
                    onBlur={() => setTimeout(() => setEmpSuggestionsOpen(false), 180)}
                    onChange={(e) =>
                      setFormState((p) => ({
                        ...p,
                        employee_name: e.target.value,
                      }))
                    }
                    placeholder={t('اكتب اسم الموظف أو اختر من القائمة...', 'Type or pick employee...')}
                    required
                    className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-slate-50 dark:bg-[#08140E] border border-slate-200 dark:border-[#243B2D] text-slate-900 dark:text-white"
                  />
                  {empSuggestionsOpen && matchingSuggestions.length > 0 && (
                    <div className="absolute z-30 mt-1 w-full rounded-2xl bg-white dark:bg-[#11261B] border border-amber-500/30 shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-[#1D3528]">
                      {matchingSuggestions.map((item) => (
                        <button
                          key={`${item.source}_${item.id}`}
                          type="button"
                          onMouseDown={() => {
                            setFormState((p) => ({
                              ...p,
                              employee_id: item.id,
                              employee_code: item.code || p.employee_code,
                              employee_name: item.name,
                              national_id: item.nationalId || p.national_id,
                              insurance_number: item.insuranceNumber || p.insurance_number,
                              company_id: item.companyId || p.company_id,
                              company_name: item.companyName || p.company_name,
                            }));
                            setEmpSuggestionsOpen(false);
                          }}
                          className="w-full px-3 py-2 text-start text-xs hover:bg-amber-500/10 flex items-center justify-between cursor-pointer"
                        >
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <UserCheck className="w-3.5 h-3.5 text-amber-500" />
                              <span>{item.name}</span>
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-stone-400 font-mono">
                              {item.nationalId ? `قومي: ${item.nationalId}` : ''}{' '}
                              {item.insuranceNumber ? `| تأميني: ${item.insuranceNumber}` : ''}
                            </div>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 font-bold">
                            {item.source === 'insured' ? 'سجل التأمينات' : 'الموارد البشرية'}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 mb-1">
                    {t('كود الموظف', 'Employee Code')}
                  </label>
                  <input
                    type="text"
                    value={formState.employee_code}
                    onChange={(e) => setFormState((p) => ({ ...p, employee_code: e.target.value }))}
                    placeholder="INS-0001"
                    className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-slate-50 dark:bg-[#08140E] border border-slate-200 dark:border-[#243B2D] text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 mb-1">
                    {t('الرقم القومي (14 رقم)', 'National ID (14 digits)')}
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={14}
                    value={formState.national_id}
                    onChange={(e) =>
                      setFormState((p) => ({
                        ...p,
                        national_id: normalizeDigits(e.target.value).slice(0, 14),
                      }))
                    }
                    placeholder="29501011234567"
                    className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-slate-50 dark:bg-[#08140E] border border-slate-200 dark:border-[#243B2D] text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 mb-1">
                    {t('الرقم التأميني (9 أرقام)', 'Insurance No.')}
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={9}
                    value={formState.insurance_number}
                    onChange={(e) =>
                      setFormState((p) => ({
                        ...p,
                        insurance_number: normalizeDigits(e.target.value).slice(0, 9),
                      }))
                    }
                    placeholder="123456789"
                    className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-slate-50 dark:bg-[#08140E] border border-slate-200 dark:border-[#243B2D] text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 mb-1">
                  {t('الملاحظات والبيان التفصيلي', 'Notes')}
                </label>
                <textarea
                  rows={2}
                  value={formState.notes}
                  onChange={(e) => setFormState((p) => ({ ...p, notes: e.target.value }))}
                  placeholder={t('أدخل أي ملاحظات حول الاستمارة أو مكتب التأمينات...', 'Enter notes...')}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#08140E] border border-slate-200 dark:border-[#243B2D] text-slate-900 dark:text-white"
                />
              </div>

              {/* Attachment Upload */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#08140E] border border-dashed border-amber-500/40 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Paperclip className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-stone-200">
                      {formState.attachment_name || t('إرفاق صورة الاستمارة أو الإيصال (PDF / صورة)', 'Attach Scanned Form or Receipt')}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-stone-400">
                      {t('يدعم المعاينة الفورية عبر Blob URL', 'Supports instant Blob URL preview')}
                    </p>
                  </div>
                </div>
                <label className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 border border-amber-500/30 cursor-pointer">
                  <span>{t('اختيار ملف', 'Choose File')}</span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleAttachmentUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-[#22382B]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-[#172D21] text-slate-700 dark:text-stone-300 cursor-pointer"
                >
                  {t('إلغاء', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  {editingOp ? t('حفظ التعديلات', 'Save Changes') : t('تسجيل العملية', 'Save Operation')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
