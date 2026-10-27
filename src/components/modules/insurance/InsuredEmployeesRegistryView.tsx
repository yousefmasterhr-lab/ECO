import React, { useState, useMemo, useRef } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import {
  insuranceStorage,
  InsuredEmployeeRecord,
  InsuranceOperationRecord,
  COMMON_INSURANCE_OCCUPATIONS,
  getEmployeeInsuranceStatus,
  parseEmployeeAttachments,
  normalizeDigits,
  createBlobUrlFromDataUrl,
  EmployeeAttachment,
} from '../../../services/insuranceStorage';
import {
  exportEmployeesToExcel,
  downloadEmployeesTemplateExcel,
  parseEmployeesExcelFile,
} from '../../../services/insuranceExcelUtils';
import { CreatableSelect } from '../../common/CreatableSelect';
import {
  Users,
  Plus,
  Search,
  Upload,
  Download,
  FileSpreadsheet,
  LayoutGrid,
  List,
  Pencil,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Building2,
  Paperclip,
  X,
  UserCheck,
  UserMinus,
  History,
  Sparkles,
} from 'lucide-react';

interface InsuredEmployeesRegistryViewProps {
  employees: InsuredEmployeeRecord[];
  operations: InsuranceOperationRecord[];
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
  onOpenFormForEmployee: (formType: 'س1' | 'س2' | 'س6', employeeId: string) => void;
}

export const InsuredEmployeesRegistryView: React.FC<InsuredEmployeesRegistryViewProps> = ({
  employees,
  operations,
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
  onOpenFormForEmployee,
}) => {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [archiveTab, setArchiveTab] = useState<'active' | 'exited' | 'all'>('active');
  const [companyFilter, setCompanyFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [notice, setNotice] = useState<string | null>(null);

  // Add/Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<InsuredEmployeeRecord | null>(null);

  // Lifecycle & Details Modal State
  const [lifecycleEmp, setLifecycleEmp] = useState<InsuredEmployeeRecord | null>(null);

  const [formState, setFormState] = useState({
    code: '',
    name: '',
    national_id: '',
    insurance_number: '',
    company_id: selectedCompanyId !== 'all' ? selectedCompanyId : companies[0]?.id || '',
    company_name: '',
    office_name: '',
    mother_name: '',
    qualification: '',
    occupation: '',
    occupation_code: '',
    hire_date: '',
    sub_start_date: '',
    ins_date: '',
    resignation_date: '',
    resignation_reason: '',
    duration_type: 'نمطي',
    sub_wage: 0,
    comp_wage: 0,
    status: 'مؤمن عليه س1',
    s1_incoming_number: '',
    has_disability: 'لا',
    disability_date: '',
    disability_percent: '',
    gov: '',
    center: '',
    village: '',
    street: '',
    building_no: '',
    phone: '',
    attachments: [] as EmployeeAttachment[],
  });

  const occupationSelectOptions = useMemo(
    () =>
      COMMON_INSURANCE_OCCUPATIONS.map((occ) => ({
        id: `occ_${occ.code}`,
        value: occ.name,
        labelAr: `${occ.name} (${occ.code})`,
        descriptionAr: `كود المهنة التأميني: ${occ.code}`,
      })),
    []
  );

  // Enrich employees with real-time computed status from Operations Center
  const enrichedEmployees = useMemo(() => {
    return employees.map((emp) => ({
      emp,
      computed: getEmployeeInsuranceStatus(emp, operations),
    }));
  }, [employees, operations]);

  // Archive counts
  const archiveCounts = useMemo(() => {
    const active = enrichedEmployees.filter((x) => x.computed.type !== 'exited').length;
    const exited = enrichedEmployees.filter((x) => x.computed.type === 'exited').length;
    return { active, exited, all: enrichedEmployees.length };
  }, [enrichedEmployees]);

  // Company breakdown stat cards
  const companyBreakdown = useMemo(() => {
    return companies.map((c) => {
      const compEmps = enrichedEmployees.filter(
        (x) => x.emp.company_id === c.id || x.emp.company_name === c.nameAr
      );
      const activeCount = compEmps.filter((x) => x.computed.type !== 'exited').length;
      const exitedCount = compEmps.filter((x) => x.computed.type === 'exited').length;
      return {
        id: c.id,
        nameAr: c.nameAr,
        total: compEmps.length,
        activeCount,
        exitedCount,
      };
    });
  }, [companies, enrichedEmployees]);

  // Filtered Employees
  const filteredEmployees = useMemo(() => {
    return enrichedEmployees.filter(({ emp, computed }) => {
      if (archiveTab === 'active' && computed.type === 'exited') return false;
      if (archiveTab === 'exited' && computed.type !== 'exited') return false;

      if (companyFilter !== 'all' && emp.company_id !== companyFilter) return false;
      if (statusFilter !== 'all' && computed.label !== statusFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const match =
          (emp.name || '').toLowerCase().includes(q) ||
          (emp.code || '').toLowerCase().includes(q) ||
          (emp.national_id || '').includes(q) ||
          (emp.insurance_number || '').includes(q) ||
          (emp.occupation || '').toLowerCase().includes(q) ||
          (emp.company_name || '').toLowerCase().includes(q) ||
          (computed.s1IncomingNumber || '').toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [enrichedEmployees, archiveTab, companyFilter, statusFilter, searchQuery]);

  // 1-Click Sync from ECO HR Module (`إدارة الموارد البشرية`)
  const handleSyncFromHR = async () => {
    if (!canCreate) return;
    if (!hrEmployees || hrEmployees.length === 0) {
      setNotice('لا توجد سجلات موظفين حالية في إدارة الموارد البشرية للمزامنة');
      setTimeout(() => setNotice(null), 4000);
      return;
    }

    const mappedFromHr: Partial<InsuredEmployeeRecord>[] = hrEmployees.map((h, i) => {
      const comp = companies.find((c) => c.id === (h.companyId || h.company_id));
      const occMatch = COMMON_INSURANCE_OCCUPATIONS.find((o) =>
        (h.jobTitle || h.role || '').includes(o.name)
      );
      return {
        code: h.code || h.employeeCode || `INS-${String(i + 1).padStart(4, '0')}`,
        name: h.nameAr || h.name || '',
        national_id: normalizeDigits(h.nationalId || h.national_id || ''),
        insurance_number: normalizeDigits(h.insuranceNumber || h.socialInsuranceNo || ''),
        company_id: h.companyId || h.company_id || comp?.id || '',
        company_name: comp?.nameAr || h.companyName || '',
        occupation: h.jobTitle || h.role || '',
        occupation_code: occMatch?.code || '',
        hire_date: h.hireDate || h.joinDate || '',
        sub_start_date: h.hireDate || h.joinDate || '',
        sub_wage: Number(h.basicSalary || h.salary || 0),
        comp_wage: Number(h.totalSalary || h.salary || 0),
        phone: h.phone || '',
        status: 'مؤمن عليه س1',
      };
    });

    const { imported, updated } = await insuranceStorage.bulkSaveEmployees(
      mappedFromHr,
      currentUserName
    );
    await onRefreshData();
    setNotice(
      `تمت المزامنة الفورية مع إدارة الموارد البشرية: إضافة (${imported}) موظف جديد وتحديث (${updated}) سجل تأميني`
    );
    setTimeout(() => setNotice(null), 5000);
  };

  // Excel Import Handler
  const handleExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const parsed = await parseEmployeesExcelFile(file, companies);
      if (parsed.length > 0) {
        const { imported, updated } = await insuranceStorage.bulkSaveEmployees(
          parsed,
          currentUserName
        );
        await onRefreshData();
        setNotice(
          `تم استيراد ملف Excel بنجاح: إضافة (${imported}) موظف وتحديث (${updated}) سجل تأميني`
        );
        setTimeout(() => setNotice(null), 5000);
      }
    } catch (err) {
      console.error('[Employees Excel Import Error]:', err);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const openAddEmployeeModal = () => {
    const nextCode = `INS-${String(employees.length + 1).padStart(4, '0')}`;
    const defaultCompId = selectedCompanyId !== 'all' ? selectedCompanyId : companies[0]?.id || '';
    const defaultComp = companies.find((c) => c.id === defaultCompId);

    setEditingEmp(null);
    setFormState({
      code: nextCode,
      name: '',
      national_id: '',
      insurance_number: '',
      company_id: defaultCompId,
      company_name: defaultComp?.nameAr || '',
      office_name: '',
      mother_name: '',
      qualification: '',
      occupation: '',
      occupation_code: '',
      hire_date: new Date().toISOString().slice(0, 10),
      sub_start_date: new Date().toISOString().slice(0, 10),
      ins_date: '',
      resignation_date: '',
      resignation_reason: '',
      duration_type: 'نمطي',
      sub_wage: 2300,
      comp_wage: 3500,
      status: 'مؤمن عليه س1',
      s1_incoming_number: '',
      has_disability: 'لا',
      disability_date: '',
      disability_percent: '',
      gov: '',
      center: '',
      village: '',
      street: '',
      building_no: '',
      phone: '',
      attachments: [],
    });
    setIsModalOpen(true);
  };

  const openEditEmployeeModal = (emp: InsuredEmployeeRecord) => {
    setEditingEmp(emp);
    setFormState({
      code: emp.code || '',
      name: emp.name || '',
      national_id: emp.national_id || '',
      insurance_number: emp.insurance_number || '',
      company_id: emp.company_id || '',
      company_name: emp.company_name || '',
      office_name: emp.office_name || '',
      mother_name: emp.mother_name || '',
      qualification: emp.qualification || '',
      occupation: emp.occupation || '',
      occupation_code: emp.occupation_code || '',
      hire_date: emp.hire_date || '',
      sub_start_date: emp.sub_start_date || '',
      ins_date: emp.ins_date || '',
      resignation_date: emp.resignation_date || '',
      resignation_reason: emp.resignation_reason || '',
      duration_type: emp.duration_type || 'نمطي',
      sub_wage: Number(emp.sub_wage || 0),
      comp_wage: Number(emp.comp_wage || 0),
      status: emp.status || 'مؤمن عليه س1',
      s1_incoming_number: emp.s1_incoming_number || '',
      has_disability: emp.has_disability || 'لا',
      disability_date: emp.disability_date || '',
      disability_percent: emp.disability_percent || '',
      gov: emp.gov || '',
      center: emp.center || '',
      village: emp.village || '',
      street: emp.street || '',
      building_no: emp.building_no || '',
      phone: emp.phone || '',
      attachments: parseEmployeeAttachments(emp.attachments_json),
    });
    setIsModalOpen(true);
  };

  const handleSaveEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    const comp = companies.find((c) => c.id === formState.company_id);
    await insuranceStorage.saveEmployee(
      {
        ...(editingEmp ? { id: editingEmp.id } : {}),
        ...formState,
        company_name: comp?.nameAr || formState.company_name,
        attachments_json: JSON.stringify(formState.attachments),
      },
      currentUserName
    );
    setIsModalOpen(false);
    await onRefreshData();
    setNotice(editingEmp ? 'تم تحديث السجل التأميني للموظف بنجاح' : 'تم تسجيل الموظف بالسجل التأميني بنجاح');
    setTimeout(() => setNotice(null), 4000);
  };

  const handleUploadEmpDocument = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const newAtt: EmployeeAttachment = {
          id: `att_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          name: file.name,
          type: file.type,
          size: file.size,
          data: reader.result as string,
          uploadDate: new Date().toISOString().slice(0, 10),
        };
        setFormState((prev) => ({
          ...prev,
          attachments: [...prev.attachments, newAtt],
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="space-y-5">
      {/* Notification Banner */}
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

      {/* Archive Filter Pills + Company Breakdown Cards */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {[
            {
              id: 'active',
              label: 'الموظفون على رأس العمل',
              count: archiveCounts.active,
              icon: UserCheck,
            },
            {
              id: 'exited',
              label: 'أرشيف المستقيلين ومنتهيي الخدمة (س6)',
              count: archiveCounts.exited,
              icon: UserMinus,
            },
            {
              id: 'all',
              label: 'جميع السجلات التأمينية',
              count: archiveCounts.all,
              icon: Users,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = archiveTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setArchiveTab(tab.id as any)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  active
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-white dark:bg-[#112219] text-slate-700 dark:text-stone-200 border border-slate-200 dark:border-[#22382B]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                <span
                  className={`px-2 py-0.5 rounded-full font-mono text-[11px] ${
                    active
                      ? 'bg-black/15 text-slate-950'
                      : 'bg-amber-500/15 text-amber-800 dark:text-amber-300'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* View Toggle (Table vs Cards) */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-white dark:bg-[#112219] border border-slate-200 dark:border-[#22382B]">
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer ${
              viewMode === 'table'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-600 dark:text-stone-300'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>جدول</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('cards')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer ${
              viewMode === 'cards'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-600 dark:text-stone-300'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>بطاقات</span>
          </button>
        </div>
      </div>

      {/* Company Breakdown Stat Cards */}
      {companyBreakdown.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {companyBreakdown.map((comp) => {
            const isSelected = companyFilter === comp.id;
            return (
              <button
                key={comp.id}
                type="button"
                onClick={() => setCompanyFilter(isSelected ? 'all' : comp.id)}
                className={`p-3.5 rounded-2xl border text-start transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500 shadow-md'
                    : 'bg-white dark:bg-[#112219] border-slate-200/80 dark:border-[#22382B] hover:border-amber-500/40'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {comp.nameAr}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 text-[11px] font-mono">
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                      نشط: {comp.activeCount}
                    </span>
                    <span className="text-slate-500 dark:text-stone-400">
                      س6: {comp.exitedCount}
                    </span>
                  </div>
                </div>
                <span className="text-lg font-black font-mono text-amber-700 dark:text-amber-400">
                  {comp.total}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Search, 1-Click HR Sync & Excel Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#112219] border border-slate-200/80 dark:border-[#22382B] shadow-sm flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <div className="relative flex-1 min-w-[230px]">
            <Search className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t(
                'بحث بالاسم الرباعي، الرقم القومي (14 رقم)، الرقم التأميني، المهنة، الكود...',
                'Search by name, 14-digit National ID, Insurance No, Occupation...'
              )}
              className="w-full ps-9 pe-4 py-2 rounded-xl text-xs font-medium bg-slate-50 dark:bg-[#0B1711] border border-slate-200 dark:border-[#243B2D] text-slate-900 dark:text-stone-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-50 dark:bg-[#0B1711] border border-slate-200 dark:border-[#243B2D] text-slate-800 dark:text-stone-200 cursor-pointer"
          >
            <option value="all">جميع الحالات التأمينية</option>
            <option value="مؤمن عليه (س1)">مؤمن عليه (س1)</option>
            <option value="قيد المراجعة">قيد المراجعة</option>
            <option value="انتظار الاعتماد">انتظار الاعتماد</option>
            <option value="منتهي (س6)">منتهي (س6)</option>
            <option value="غير مؤمن عليه">غير مؤمن عليه</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleExcelImport}
            className="hidden"
          />

          {canCreate && (
            <button
              type="button"
              onClick={handleSyncFromHR}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 dark:text-amber-200 border border-amber-500/35 transition-colors cursor-pointer"
              title="استيراد ومزامنة الموظفين المسجلين في وحدة الموارد البشرية تلقائياً"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>{t('مزامنة من الموارد البشرية', '1-Click HR Sync')}</span>
            </button>
          )}

          {canCreate && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-[#172D21] text-slate-800 dark:text-stone-200 border border-slate-200 dark:border-[#243B2D] cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>{t('استيراد Excel', 'Import Excel')}</span>
            </button>
          )}

          <button
            type="button"
            onClick={downloadEmployeesTemplateExcel}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-[#172D21] text-slate-700 dark:text-stone-300 border border-slate-200 dark:border-[#243B2D] cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>{t('نموذج فارغ', 'Template')}</span>
          </button>

          {canExport && (
            <button
              type="button"
              onClick={() =>
                exportEmployeesToExcel(
                  filteredEmployees.map((x) => x.emp),
                  operations
                )
              }
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 dark:text-amber-300 border border-amber-500/30 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>{t('تصدير Excel', 'Export Excel')}</span>
            </button>
          )}

          {canCreate && (
            <button
              type="button"
              onClick={openAddEmployeeModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 shadow-md shadow-amber-500/20 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>{t('+ إضافة موظف مؤمن عليه', '+ Add Insured Employee')}</span>
            </button>
          )}
        </div>
      </div>

      {/* TABLE VIEW */}
      {viewMode === 'table' ? (
        <div className="rounded-2xl bg-white dark:bg-[#112219] border border-slate-200/80 dark:border-[#22382B] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#0B1711] border-b border-slate-200 dark:border-[#22382B] text-slate-600 dark:text-amber-400 font-bold">
                  <th className="p-3">كود الموظف</th>
                  <th className="p-3">الاسم الرباعي</th>
                  <th className="p-3">الشركة / المنشأة</th>
                  <th className="p-3">الرقم القومي / التأميني</th>
                  <th className="p-3">المهنة والكود</th>
                  <th className="p-3">أجر الاشتراك / الشامل</th>
                  <th className="p-3">تاريخ الاشتراك / س1</th>
                  <th className="p-3">الحالة التأمينية</th>
                  <th className="p-3 text-center">إصدار استمارة</th>
                  <th className="p-3 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#1B3024]">
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-12 text-center">
                      <div className="max-w-sm mx-auto space-y-2">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto">
                          <Users className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-bold text-slate-800 dark:text-stone-200">
                          {t('لا توجد سجلات موظفين في هذا التصنيف حالياً (0 موظف)', 'No insured employee records yet (0)')}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-stone-400">
                          {t(
                            'اضغط على "مزامنة من الموارد البشرية" أو "+ إضافة موظف مؤمن عليه" أو استورد ملف Excel.',
                            'Click "1-Click HR Sync", "+ Add Insured Employee", or import from Excel.'
                          )}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map(({ emp, computed }) => {
                    const atts = parseEmployeeAttachments(emp.attachments_json);
                    return (
                      <tr
                        key={emp.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-[#152B20]/70 transition-colors"
                      >
                        <td className="p-3 font-mono font-bold text-amber-700 dark:text-amber-400">
                          {emp.code || '—'}
                        </td>
                        <td className="p-3 font-bold text-slate-900 dark:text-white">
                          <button
                            type="button"
                            onClick={() => setLifecycleEmp(emp)}
                            className="hover:text-amber-600 dark:hover:text-amber-400 text-start cursor-pointer"
                          >
                            {emp.name}
                          </button>
                          {emp.office_name && (
                            <span className="block text-[10px] text-slate-400 font-normal">
                              مكتب: {emp.office_name}
                            </span>
                          )}
                        </td>
                        <td className="p-3 font-bold text-slate-700 dark:text-stone-200">
                          {emp.company_name || '—'}
                        </td>
                        <td className="p-3 font-mono text-[11px] text-slate-700 dark:text-stone-300">
                          <div>{emp.national_id ? `قومي: ${emp.national_id}` : '—'}</div>
                          <div className="text-amber-700 dark:text-amber-400">
                            {emp.insurance_number ? `تأميني: ${emp.insurance_number}` : ''}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-slate-800 dark:text-stone-200">
                            {emp.occupation || '—'}
                          </div>
                          {emp.occupation_code && (
                            <span className="text-[10px] font-mono text-amber-700 dark:text-amber-400">
                              كود: {emp.occupation_code}
                            </span>
                          )}
                        </td>
                        <td className="p-3 font-mono">
                          <div className="font-bold text-slate-900 dark:text-white">
                            اشتراك: {Number(emp.sub_wage || 0).toLocaleString('en-US')} ج.م
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-stone-400">
                            شامل: {Number(emp.comp_wage || 0).toLocaleString('en-US')} ج.م
                          </div>
                        </td>
                        <td className="p-3 font-mono text-[11px]">
                          <div>{computed.effectiveInsDate || emp.hire_date || '—'}</div>
                          {computed.s1IncomingNumber && (
                            <span className="text-amber-700 dark:text-amber-400 font-bold">
                              وارد س1: {computed.s1IncomingNumber}
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${computed.badgeBgClass}`}
                          >
                            {computed.label}
                          </span>
                          {computed.s6ExitDate && (
                            <span className="block text-[10px] font-mono text-rose-600 dark:text-rose-400 mt-0.5">
                              خروج: {computed.s6ExitDate}
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => onOpenFormForEmployee('س1', emp.id)}
                              className="px-2 py-1 rounded-lg text-[10px] font-black bg-amber-500/15 hover:bg-amber-500/30 text-amber-800 dark:text-amber-300 border border-amber-500/30 cursor-pointer"
                              title="فتح وتعبئة استمارة س1 لهذا الموظف"
                            >
                              س1
                            </button>
                            <button
                              type="button"
                              onClick={() => onOpenFormForEmployee('س6', emp.id)}
                              className="px-2 py-1 rounded-lg text-[10px] font-black bg-slate-100 hover:bg-amber-500/20 dark:bg-[#172D21] text-slate-700 dark:text-stone-300 border border-slate-200 dark:border-[#243B2D] cursor-pointer"
                              title="فتح وتعبئة استمارة س6 لهذا الموظف"
                            >
                              س6
                            </button>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => setLifecycleEmp(emp)}
                              title="دورة حياة الموظف والمسار التأميني والمرفقات"
                              className="w-7 h-7 rounded-lg bg-amber-500/10 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/25 flex items-center justify-center cursor-pointer"
                            >
                              <History className="w-3.5 h-3.5" />
                            </button>

                            {atts.length > 0 && (
                              <button
                                type="button"
                                onClick={() =>
                                  onPreviewAttachment(
                                    `مستندات الموظف (${emp.name})`,
                                    createBlobUrlFromDataUrl(atts[0].data),
                                    atts[0].name
                                  )
                                }
                                title={`معاينة المستندات المرفقة (${atts.length})`}
                                className="w-7 h-7 rounded-lg bg-amber-500/10 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/25 flex items-center justify-center cursor-pointer"
                              >
                                <Paperclip className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {canEdit && (
                              <button
                                type="button"
                                onClick={() => openEditEmployeeModal(emp)}
                                title="تعديل بيانات الموظف"
                                className="w-7 h-7 rounded-lg bg-amber-500/10 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/25 flex items-center justify-center cursor-pointer"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() =>
                                onOpenAuditLog(`سجل تعديلات الموظف (${emp.name})`, emp.audit_log_json)
                              }
                              title="سجل التعديلات (!)"
                              className="w-7 h-7 rounded-lg bg-amber-500/15 hover:bg-amber-500/30 text-amber-800 dark:text-amber-300 border border-amber-500/35 flex items-center justify-center cursor-pointer"
                            >
                              <AlertCircle className="w-3.5 h-3.5" />
                            </button>

                            {canDelete && (
                              <button
                                type="button"
                                onClick={async () => {
                                  await insuranceStorage.deleteEmployees([emp.id]);
                                  await onRefreshData();
                                }}
                                title="حذف السجل"
                                className="w-7 h-7 rounded-lg bg-rose-500/10 hover:bg-rose-500/25 text-rose-600 dark:text-rose-400 border border-rose-500/25 flex items-center justify-center cursor-pointer"
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
      ) : (
        /* CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredEmployees.map(({ emp, computed }) => (
            <div
              key={emp.id}
              className="p-4 rounded-2xl bg-white dark:bg-[#112219] border border-slate-200/80 dark:border-[#22382B] shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[11px] font-mono font-bold text-amber-700 dark:text-amber-400">
                    {emp.code}
                  </span>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">{emp.name}</h4>
                  <p className="text-xs text-slate-500 dark:text-stone-400">
                    {emp.occupation || 'بدون مسمى'} — {emp.company_name}
                  </p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${computed.badgeBgClass}`}
                >
                  {computed.label}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-[#0B1711] text-[11px] font-mono">
                <div>
                  <span className="text-slate-400 block">الرقم القومي:</span>
                  <strong className="text-slate-800 dark:text-stone-200">{emp.national_id || '—'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">الرقم التأميني:</span>
                  <strong className="text-amber-700 dark:text-amber-400">
                    {emp.insurance_number || '—'}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block">أجر الاشتراك:</span>
                  <strong className="text-slate-800 dark:text-stone-200">
                    {Number(emp.sub_wage || 0).toLocaleString('en-US')} ج.م
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block">الأجر الشامل:</span>
                  <strong className="text-slate-800 dark:text-stone-200">
                    {Number(emp.comp_wage || 0).toLocaleString('en-US')} ج.م
                  </strong>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-[#1E3427]">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onOpenFormForEmployee('س1', emp.id)}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 cursor-pointer"
                  >
                    استمارة س1
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenFormForEmployee('س6', emp.id)}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-[#172D21] text-slate-700 dark:text-stone-300 cursor-pointer"
                  >
                    استمارة س6
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setLifecycleEmp(emp)}
                    className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 flex items-center justify-center cursor-pointer"
                    title="المسار التأميني"
                  >
                    <History className="w-3.5 h-3.5" />
                  </button>
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => openEditEmployeeModal(emp)}
                      className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 flex items-center justify-center cursor-pointer"
                      title="تعديل"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EMPLOYEE LIFECYCLE & LINKED OPERATIONS TIMELINE MODAL */}
      {lifecycleEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-[#0D1F17] border border-amber-500/30 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-[#22382B] bg-gradient-to-r from-amber-500/15 to-transparent">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  دورة حياة الموظف والمسار التأميني — {lifecycleEmp.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-stone-400 font-mono">
                  قومي: {lifecycleEmp.national_id || '—'} | تأميني: {lifecycleEmp.insurance_number || '—'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setLifecycleEmp(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              {(() => {
                const compStatus = getEmployeeInsuranceStatus(lifecycleEmp, operations);
                const atts = parseEmployeeAttachments(lifecycleEmp.attachments_json);
                return (
                  <>
                    {/* Timeline Milestones */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#13281E] border border-slate-200 dark:border-[#243B2D]">
                        <span className="text-[11px] font-bold text-slate-400 block">
                          1. الالتحاق بالمنشأة
                        </span>
                        <strong className="text-xs font-mono text-slate-900 dark:text-white block mt-1">
                          {lifecycleEmp.hire_date || lifecycleEmp.sub_start_date || 'غير محدد'}
                        </strong>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                        <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 block">
                          2. التسجيل التأميني (س1)
                        </span>
                        <strong className="text-xs font-mono text-emerald-900 dark:text-emerald-200 block mt-1">
                          {compStatus.effectiveInsDate || 'قيد التسجيل'}
                        </strong>
                        {compStatus.s1IncomingNumber && (
                          <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-300">
                            رقم الوارد: {compStatus.s1IncomingNumber}
                          </span>
                        )}
                      </div>

                      <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                        <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 block">
                          3. نهاية الاشتراك (س6)
                        </span>
                        <strong className="text-xs font-mono text-slate-900 dark:text-white block mt-1">
                          {compStatus.s6ExitDate || 'ما زال على رأس العمل'}
                        </strong>
                        {compStatus.s6Reason && (
                          <span className="text-[10px] text-slate-500 dark:text-stone-400">
                            السبب: {compStatus.s6Reason}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Linked Operations Table */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-black text-slate-800 dark:text-stone-200">
                        العمليات التأمينية المرتبطة بالموظف ({compStatus.linkedOperations.length})
                      </h4>
                      {compStatus.linkedOperations.length === 0 ? (
                        <p className="text-xs text-slate-500 p-4 rounded-xl bg-slate-50 dark:bg-[#0B1711]">
                          لا توجد عمليات مسجلة في مركز العمليات لهذا الموظف بعد.
                        </p>
                      ) : (
                        <div className="rounded-xl border border-slate-200 dark:border-[#22382B] overflow-hidden">
                          <table className="w-full text-xs">
                            <thead className="bg-slate-50 dark:bg-[#0B1711] text-slate-600 dark:text-amber-400">
                              <tr>
                                <th className="p-2 text-start">كود الطلب</th>
                                <th className="p-2 text-start">نوع الطلب</th>
                                <th className="p-2 text-start">رقم الوارد</th>
                                <th className="p-2 text-start">التاريخ</th>
                                <th className="p-2 text-start">الحالة</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-[#1B3024]">
                              {compStatus.linkedOperations.map((op) => (
                                <tr key={op.id}>
                                  <td className="p-2 font-mono font-bold text-amber-700 dark:text-amber-400">
                                    {op.request_code}
                                  </td>
                                  <td className="p-2 font-bold">{op.request_type}</td>
                                  <td className="p-2 font-mono">{op.incoming_number || '—'}</td>
                                  <td className="p-2 font-mono">{op.incoming_date}</td>
                                  <td className="p-2 font-bold">{op.status}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {/* Employee Scanned Attachments */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-black text-slate-800 dark:text-stone-200">
                        المستندات والمسوغات التأمينية المرفقة ({atts.length})
                      </h4>
                      {atts.length === 0 ? (
                        <p className="text-xs text-slate-500">لا توجد مرفقات محفوظة لهذا الموظف.</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {atts.map((att) => (
                            <button
                              key={att.id}
                              type="button"
                              onClick={() =>
                                onPreviewAttachment(
                                  `مرفق: ${att.name}`,
                                  createBlobUrlFromDataUrl(att.data),
                                  att.name
                                )
                              }
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 cursor-pointer"
                            >
                              <Paperclip className="w-3.5 h-3.5" />
                              <span>{att.name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT INSURED EMPLOYEE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-4xl rounded-3xl bg-white dark:bg-[#0D1F17] border border-amber-500/30 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-[#22382B] bg-gradient-to-r from-amber-500/10 to-transparent">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {editingEmp
                    ? `تعديل السجل التأميني للموظف (${editingEmp.name})`
                    : 'تسجيل موظف جديد بالسجل التأميني للعاملين'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-stone-400">
                  جميع الحقول متوافقة مع متطلبات استمارات (س1، س2، س6) بالهيئة القومية للتأمين الاجتماعي
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEmployee} className="p-6 overflow-y-auto space-y-5">
              {/* Row 1: Basic Identity */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 mb-1">
                    كود الموظف
                  </label>
                  <input
                    type="text"
                    value={formState.code}
                    onChange={(e) => setFormState((p) => ({ ...p, code: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl text-xs font-mono font-bold bg-slate-50 dark:bg-[#08140E] border border-slate-200 dark:border-[#243B2D] text-amber-700 dark:text-amber-400"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 mb-1">
                    الاسم الرباعي للمؤمن عليه (مطابق للبطاقة) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formState.name}
                    onChange={(e) => setFormState((p) => ({ ...p, name: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-slate-50 dark:bg-[#08140E] border border-slate-200 dark:border-[#243B2D] text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 mb-1">
                    اسم الأم
                  </label>
                  <input
                    type="text"
                    value={formState.mother_name}
                    onChange={(e) => setFormState((p) => ({ ...p, mother_name: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#08140E] border border-slate-200 dark:border-[#243B2D] text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Row 2: National ID, Insurance No, Company, Office */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 mb-1">
                    الرقم القومي (14 رقم بدون أسهم) *
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={14}
                    required
                    value={formState.national_id}
                    onChange={(e) =>
                      setFormState((p) => ({
                        ...p,
                        national_id: normalizeDigits(e.target.value).slice(0, 14),
                      }))
                    }
                    placeholder="29501011234567"
                    className="w-full px-3 py-2 rounded-xl text-xs font-mono font-bold bg-slate-50 dark:bg-[#08140E] border border-slate-200 dark:border-[#243B2D] text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 mb-1">
                    الرقم التأميني (9 أرقام)
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
                    className="w-full px-3 py-2 rounded-xl text-xs font-mono font-bold bg-slate-50 dark:bg-[#08140E] border border-slate-200 dark:border-[#243B2D] text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 mb-1">
                    الشركة / المنشأة *
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
                    <option value="">-- اختر الشركة --</option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nameAr}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 mb-1">
                    مكتب التأمينات المختص
                  </label>
                  <input
                    type="text"
                    value={formState.office_name}
                    onChange={(e) => setFormState((p) => ({ ...p, office_name: e.target.value }))}
                    placeholder="مثال: مكتب تأمينات مدينة نصر"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#08140E] border border-slate-200 dark:border-[#243B2D] text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Row 3: Qualification, Occupation, Occupation Code, Duration Type */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 mb-1">
                    المؤهل الدراسي
                  </label>
                  <input
                    type="text"
                    value={formState.qualification}
                    onChange={(e) => setFormState((p) => ({ ...p, qualification: e.target.value }))}
                    placeholder="مثال: بكالوريوس تجارة / هندسة"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#08140E] border border-slate-200 dark:border-[#243B2D] text-slate-900 dark:text-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <CreatableSelect
                    category="insurance_occupations"
                    label="المهنة التأمينية المعتمدة"
                    value={formState.occupation}
                    options={occupationSelectOptions}
                    onChange={(val) => {
                      const matched = COMMON_INSURANCE_OCCUPATIONS.find((o) => o.name === val);
                      setFormState((p) => ({
                        ...p,
                        occupation: val,
                        occupation_code: matched?.code || p.occupation_code,
                      }));
                    }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 mb-1">
                    كود المهنة التأميني
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formState.occupation_code}
                    onChange={(e) =>
                      setFormState((p) => ({ ...p, occupation_code: normalizeDigits(e.target.value) }))
                    }
                    placeholder="241101"
                    className="w-full px-3 py-2 rounded-xl text-xs font-mono font-bold bg-slate-50 dark:bg-[#08140E] border border-slate-200 dark:border-[#243B2D] text-amber-700 dark:text-amber-400"
                  />
                </div>
              </div>

              {/* Row 4: Dates & Wages */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 mb-1">
                    تاريخ الالتحاق
                  </label>
                  <input
                    type="date"
                    value={formState.hire_date}
                    onChange={(e) => setFormState((p) => ({ ...p, hire_date: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-slate-50 dark:bg-[#08140E] border border-slate-200 dark:border-[#243B2D] text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 mb-1">
                    تاريخ بدء الاشتراك
                  </label>
                  <input
                    type="date"
                    value={formState.sub_start_date}
                    onChange={(e) => setFormState((p) => ({ ...p, sub_start_date: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-slate-50 dark:bg-[#08140E] border border-slate-200 dark:border-[#243B2D] text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 mb-1">
                    أجر الاشتراك التأميني (ج.م)
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={formState.sub_wage}
                    onChange={(e) =>
                      setFormState((p) => ({
                        ...p,
                        sub_wage: Number(normalizeDigits(e.target.value)) || 0,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl text-xs font-mono font-bold bg-slate-50 dark:bg-[#08140E] border border-slate-200 dark:border-[#243B2D] text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 mb-1">
                    الأجر الشامل (ج.م)
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={formState.comp_wage}
                    onChange={(e) =>
                      setFormState((p) => ({
                        ...p,
                        comp_wage: Number(normalizeDigits(e.target.value)) || 0,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl text-xs font-mono font-bold bg-slate-50 dark:bg-[#08140E] border border-slate-200 dark:border-[#243B2D] text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 mb-1">
                    رقم وارد س1
                  </label>
                  <input
                    type="text"
                    value={formState.s1_incoming_number}
                    onChange={(e) => setFormState((p) => ({ ...p, s1_incoming_number: e.target.value }))}
                    placeholder="2026/105"
                    className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-slate-50 dark:bg-[#08140E] border border-slate-200 dark:border-[#243B2D] text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Row 5: Address & Contact Details */}
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-stone-400 mb-1">
                    رقم العقار
                  </label>
                  <input
                    type="text"
                    value={formState.building_no}
                    onChange={(e) => setFormState((p) => ({ ...p, building_no: e.target.value }))}
                    className="w-full px-2.5 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-[#08140E] border border-slate-200 dark:border-[#243B2D] text-slate-900 dark:text-white"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-stone-400 mb-1">
                    الشارع
                  </label>
                  <input
                    type="text"
                    value={formState.street}
                    onChange={(e) => setFormState((p) => ({ ...p, street: e.target.value }))}
                    className="w-full px-2.5 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-[#08140E] border border-slate-200 dark:border-[#243B2D] text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-stone-400 mb-1">
                    المركز / القسم
                  </label>
                  <input
                    type="text"
                    value={formState.center}
                    onChange={(e) => setFormState((p) => ({ ...p, center: e.target.value }))}
                    className="w-full px-2.5 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-[#08140E] border border-slate-200 dark:border-[#243B2D] text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-stone-400 mb-1">
                    المحافظة
                  </label>
                  <input
                    type="text"
                    value={formState.gov}
                    onChange={(e) => setFormState((p) => ({ ...p, gov: e.target.value }))}
                    className="w-full px-2.5 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-[#08140E] border border-slate-200 dark:border-[#243B2D] text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-stone-400 mb-1">
                    رقم التليفون
                  </label>
                  <input
                    type="text"
                    value={formState.phone}
                    onChange={(e) => setFormState((p) => ({ ...p, phone: e.target.value }))}
                    className="w-full px-2.5 py-1.5 rounded-xl text-xs font-mono bg-slate-50 dark:bg-[#08140E] border border-slate-200 dark:border-[#243B2D] text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Row 6: Status & Exit Info (S6) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2 border-t border-slate-100 dark:border-[#1E3427]">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 mb-1">
                    الحالة التأمينية
                  </label>
                  <select
                    value={formState.status}
                    onChange={(e) => setFormState((p) => ({ ...p, status: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-slate-50 dark:bg-[#08140E] border border-slate-200 dark:border-[#243B2D] text-slate-900 dark:text-white"
                  >
                    <option value="مؤمن عليه س1">مؤمن عليه س1</option>
                    <option value="قيد المراجعة">قيد المراجعة</option>
                    <option value="انتظار الاعتماد">انتظار الاعتماد</option>
                    <option value="منتهي س6">منتهي س6</option>
                    <option value="معفى / منتدب">معفى / منتدب</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 mb-1">
                    تاريخ الاستقالة / انتهاء الخدمة (س6)
                  </label>
                  <input
                    type="date"
                    value={formState.resignation_date}
                    onChange={(e) => setFormState((p) => ({ ...p, resignation_date: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-slate-50 dark:bg-[#08140E] border border-slate-200 dark:border-[#243B2D] text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 mb-1">
                    سبب انتهاء الاشتراك (س6)
                  </label>
                  <input
                    type="text"
                    value={formState.resignation_reason}
                    onChange={(e) => setFormState((p) => ({ ...p, resignation_reason: e.target.value }))}
                    placeholder="استقالة / انتهاء عقد / بلوغ السن"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#08140E] border border-slate-200 dark:border-[#243B2D] text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Scanned Documents Upload */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#08140E] border border-dashed border-amber-500/40 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs">
                  <strong className="text-slate-800 dark:text-stone-200 block">
                    المرفقات والمسوغات التأمينية ({formState.attachments.length})
                  </strong>
                  <span className="text-[11px] text-slate-500">
                    بطاقة الرقم القومي، شهادة الميلاد، المؤهل، كعب العمل، استمارة س1 أو س6 الموقعة
                  </span>
                </div>
                <label className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 cursor-pointer">
                  <span>+ إرفاق مستندات</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf"
                    onChange={handleUploadEmpDocument}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-[#22382B]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-[#172D21] text-slate-700 dark:text-stone-300 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  {editingEmp ? 'حفظ التعديلات' : 'تسجيل الموظف بالسجل التأميني'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
