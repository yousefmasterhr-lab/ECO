import React, { useState } from 'react';
import { useHR } from '../../../context/HRContext';
import { EditContractModal } from './EditContractModal';
import { OrgChartModal } from './OrgChartModal';
import { AddBonusModal } from './AddBonusModal';
import { AddDeductionModal } from './AddDeductionModal';
import { TimeOffCalendarView } from './TimeOffCalendarView';
import { Modal } from '../../common/Modal';
import {
  Filter,
  ChevronDown,
  ChevronUp,
  Download,
  Plus,
  Edit2,
  Archive,
  LogOut,
  Fingerprint,
  Network,
  CheckCircle2,
  FileCheck2,
  Upload,
  Printer,
  History
} from 'lucide-react';

export const MasterDirectoryView: React.FC = () => {
  const {
    employees,
    selectedEmployee,
    setSelectedEmployee,
    addEmployee,
    archiveEmployee,
    resignEmployee,
    resetEmployeeBiometrics,
    toggleEmployeeAssetStatus,
    updateEmployeeDocumentStatus,
    showToast,
  } = useHR();

  // Company Filter Pills
  const [selectedEntity, setSelectedEntity] = useState<string>('all');

  // Lifecycle status
  const [selectedLifecycle, setSelectedLifecycle] = useState<'active' | 'resigned' | 'archived'>('active');

  // Collapsible Filter Cockpit (13 fields)
  const [isFilterCockpitOpen, setIsFilterCockpitOpen] = useState(false);
  const [filters, setFilters] = useState({
    name: '',
    nationalId: '',
    department: 'all',
    jobTitle: '',
    directManager: '',
    workLocation: '',
    projectCostCenter: '',
    email: '',
    uid: '',
    disbursementMethod: 'all',
    hasOvertime: 'all',
    hireDateFrom: '',
    hireDateTo: '',
  });

  // Active Dossier Sub-Tab (11 sub-tabs)
  const [activeDossierTab, setActiveDossierTab] = useState<
    'contact' | 'contract' | 'documents' | 'assets' | 'allowances' |
    'bonuses' | 'deductions' | 'hours' | 'payslips' | 'calendar' | 'audit'
  >('contact');

  // Modals state
  const [isEditContractOpen, setIsEditContractOpen] = useState(false);
  const [isOrgChartOpen, setIsOrgChartOpen] = useState(false);
  const [isAddBonusOpen, setIsAddBonusOpen] = useState(false);
  const [isAddDeductionOpen, setIsAddDeductionOpen] = useState(false);
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);

  // New Employee Form
  const [newEmpForm, setNewEmpForm] = useState({
    nameAr: '',
    jobTitleAr: '',
    departmentAr: 'المكتب الفني وإدارة المشاريع',
    companyNameAr: 'ترابط للمقاولات العامة',
    companyId: 'comp_tarabot',
    workLocation: 'موقع شبرا النخل والعزيزية',
    mobile: '',
    email: '',
    nationalId: '',
    basicSalary: 24000,
  });

  // Company pills data with live counters from user prompt
  const ENTITY_PILLS = [
    { id: 'all', label: 'الكل', count: '1,343' },
    { id: 'comp_tarabot', label: 'ترابط للمقاولات', count: '753' },
    { id: 'comp_master_group', label: 'ماستر جروب', count: '104' },
    { id: 'comp_master_travel', label: 'ماستر ترافل', count: '91' },
    { id: 'comp_jadara', label: 'جدارة', count: '70' },
    { id: 'comp_twenty', label: 'توينتي توينتي', count: '35' },
    { id: 'comp_cogni', label: 'كوجني', count: '27' },
    { id: 'comp_impro', label: 'إيمبرو', count: '18' },
    { id: 'comp_arkan', label: 'أركان', count: '20' },
  ];

  // Filter employees
  const filteredEmployees = employees.filter(emp => {
    // Entity filter
    if (selectedEntity !== 'all' && emp.companyId !== selectedEntity) return false;

    // Lifecycle filter
    if (emp.lifecycleStatus !== selectedLifecycle) return false;

    // Cockpit filters
    if (filters.name && !emp.nameAr.toLowerCase().includes(filters.name.toLowerCase())) return false;
    if (filters.nationalId && !emp.nationalId.includes(filters.nationalId)) return false;
    if (filters.uid && !emp.uid.includes(filters.uid)) return false;
    if (filters.department !== 'all' && emp.departmentAr !== filters.department) return false;
    if (filters.jobTitle && !emp.jobTitleAr.toLowerCase().includes(filters.jobTitle.toLowerCase())) return false;
    if (filters.directManager && !emp.directManager.toLowerCase().includes(filters.directManager.toLowerCase())) return false;
    if (filters.workLocation && !emp.workLocation.toLowerCase().includes(filters.workLocation.toLowerCase())) return false;
    if (filters.projectCostCenter && !emp.projectCostCenterName?.toLowerCase().includes(filters.projectCostCenter.toLowerCase())) return false;
    if (filters.email && !emp.email.toLowerCase().includes(filters.email.toLowerCase())) return false;
    if (filters.disbursementMethod !== 'all' && emp.disbursementMethod !== filters.disbursementMethod) return false;
    if (filters.hasOvertime !== 'all') {
      const isOt = filters.hasOvertime === 'yes';
      if (emp.hasOvertime !== isOt) return false;
    }

    return true;
  });

  const activeEmp = selectedEmployee || filteredEmployees[0] || employees[0];

  const handleExportExcel = () => {
    showToast('تم تصدير ملف إكسل بسجلات الموظفين المفلترة بنجاح');
  };

  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    const created = addEmployee({
      nameAr: newEmpForm.nameAr,
      jobTitleAr: newEmpForm.jobTitleAr,
      departmentAr: newEmpForm.departmentAr,
      companyId: newEmpForm.companyId,
      companyNameAr: newEmpForm.companyNameAr,
      workLocation: newEmpForm.workLocation,
      mobile: newEmpForm.mobile || '010-0000-0000',
      email: newEmpForm.email || 'emp@tarabot-eg.com',
      nationalId: newEmpForm.nationalId || '29000000000000',
      salary: {
        basic: Number(newEmpForm.basicSalary),
        allowances: 6000,
        deductions: 1500,
        net: Number(newEmpForm.basicSalary) + 6000 - 1500,
      },
    });
    setSelectedEmployee(created);
    setIsAddEmployeeOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* 1. Smart Company Pills with Live Counters */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 select-none no-scrollbar">
        {ENTITY_PILLS.map(p => {
          const isSelected = selectedEntity === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setSelectedEntity(p.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isSelected
                  ? 'bg-[#1C291E] dark:bg-[#EBB34D] text-[#F3EFE6] dark:text-[#0E1610] shadow-sm'
                  : 'bg-[#F3EFE6] dark:bg-[#17231A] text-[#5C665E] dark:text-[#8FA392] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23] border border-[#E0D9CB] dark:border-[#243628]'
              }`}
            >
              <span>{p.label}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                isSelected
                  ? 'bg-[#0E1610] text-[#EBB34D]'
                  : 'bg-[#EAE4D7] dark:bg-[#0E1610] text-[#5C665E] dark:text-[#8FA392]'
              }`}>
                {p.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 2. Lifecycle Status Bar & Cockpit Toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628]">
        {/* Lifecycle Segmented Toggle */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628]">
          {[
            { id: 'active', label: 'موظفون حاليون', count: '1,343' },
            { id: 'resigned', label: 'مستقيلون', count: '83' },
            { id: 'archived', label: 'أرشيف', count: '286' },
          ].map(tab => {
            const isCurrent = selectedLifecycle === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedLifecycle(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-[#1C291E] dark:bg-[#EBB34D] text-[#F3EFE6] dark:text-[#0E1610] shadow-xs'
                    : 'text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6]'
                }`}
              >
                <span>{tab.label}</span>
                <span className="text-[10px] font-mono opacity-80">({tab.count})</span>
              </button>
            );
          })}
        </div>

        {/* Action Controls & Cockpit Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFilterCockpitOpen(!isFilterCockpitOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#111A13] text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23] transition-all cursor-pointer"
          >
            <Filter className="w-3.5 h-3.5 text-[#D99B26] dark:text-[#EBB34D]" />
            <span>{isFilterCockpitOpen ? 'إخفاء الفلاتر' : 'إظهار الفلاتر (13 حقلاً)'}</span>
            {isFilterCockpitOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#111A13] text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23] transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تصدير Excel</span>
          </button>

          <button
            onClick={() => setIsAddEmployeeOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1C291E] dark:bg-[#EBB34D] text-[#F3EFE6] dark:text-[#0E1610] text-xs font-bold shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ إضافة موظف جديد</span>
          </button>
        </div>
      </div>

      {/* 3. Collapsible 13-Field Filter Cockpit */}
      {isFilterCockpitOpen && (
        <div className="p-4 rounded-2xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] space-y-3 animate-in fade-in duration-200">
          <div className="text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] flex items-center justify-between">
            <span>لوحة فلاتر البحث والفرز المتقدمة (13 معيار تصفية)</span>
            <button
              onClick={() =>
                setFilters({
                  name: '',
                  nationalId: '',
                  department: 'all',
                  jobTitle: '',
                  directManager: '',
                  workLocation: '',
                  projectCostCenter: '',
                  email: '',
                  uid: '',
                  disbursementMethod: 'all',
                  hasOvertime: 'all',
                  hireDateFrom: '',
                  hireDateTo: '',
                })
              }
              className="text-[11px] text-[#D99B26] dark:text-[#EBB34D] hover:underline"
            >
              إعادة ضبط الفلاتر
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5 text-xs">
            <div>
              <label className="block text-[10.5px] font-bold text-[#5C665E] dark:text-[#8FA392] mb-1">الاسم</label>
              <input
                type="text"
                value={filters.name}
                onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                placeholder="بحث بالاسم..."
                className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628]"
              />
            </div>

            <div>
              <label className="block text-[10.5px] font-bold text-[#5C665E] dark:text-[#8FA392] mb-1">كود الموظف (UID)</label>
              <input
                type="text"
                value={filters.uid}
                onChange={(e) => setFilters({ ...filters, uid: e.target.value })}
                placeholder="مثال: 0335"
                className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628] font-mono"
              />
            </div>

            <div>
              <label className="block text-[10.5px] font-bold text-[#5C665E] dark:text-[#8FA392] mb-1">الرقم القومي</label>
              <input
                type="text"
                value={filters.nationalId}
                onChange={(e) => setFilters({ ...filters, nationalId: e.target.value })}
                placeholder="14 رقماً..."
                className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628] font-mono"
              />
            </div>

            <div>
              <label className="block text-[10.5px] font-bold text-[#5C665E] dark:text-[#8FA392] mb-1">الإدارة / القطاع</label>
              <select
                value={filters.department}
                onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628]"
              >
                <option value="all">كل الإدارات</option>
                <option value="المكتب الفني وإدارة المشاريع">المكتب الفني والمشاريع</option>
                <option value="الشؤون المالية ومحاسبة التكاليف">الشؤون المالية</option>
                <option value="الموارد البشرية والشؤون الإدارية">الموارد البشرية</option>
                <option value="التنفيذ الميداني وإدارة العمالة">التنفيذ الميداني</option>
                <option value="الخدمات اللوجستية والنقل">اللوجستيات والأسطول</option>
              </select>
            </div>

            <div>
              <label className="block text-[10.5px] font-bold text-[#5C665E] dark:text-[#8FA392] mb-1">المسمى الوظيفي</label>
              <input
                type="text"
                value={filters.jobTitle}
                onChange={(e) => setFilters({ ...filters, jobTitle: e.target.value })}
                placeholder="مهندس، محاسب..."
                className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628]"
              />
            </div>

            <div>
              <label className="block text-[10.5px] font-bold text-[#5C665E] dark:text-[#8FA392] mb-1">المدير المباشر</label>
              <input
                type="text"
                value={filters.directManager}
                onChange={(e) => setFilters({ ...filters, directManager: e.target.value })}
                placeholder="اسم المدير..."
                className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628]"
              />
            </div>

            <div>
              <label className="block text-[10.5px] font-bold text-[#5C665E] dark:text-[#8FA392] mb-1">موقع العمل</label>
              <input
                type="text"
                value={filters.workLocation}
                onChange={(e) => setFilters({ ...filters, workLocation: e.target.value })}
                placeholder="موقع المشروع..."
                className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628]"
              />
            </div>

            <div>
              <label className="block text-[10.5px] font-bold text-[#5C665E] dark:text-[#8FA392] mb-1">المشروع المرتبط</label>
              <input
                type="text"
                value={filters.projectCostCenter}
                onChange={(e) => setFilters({ ...filters, projectCostCenter: e.target.value })}
                placeholder="شبرا النخل، برج الرياض..."
                className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628]"
              />
            </div>

            <div>
              <label className="block text-[10.5px] font-bold text-[#5C665E] dark:text-[#8FA392] mb-1">البريد الإلكتروني</label>
              <input
                type="text"
                value={filters.email}
                onChange={(e) => setFilters({ ...filters, email: e.target.value })}
                placeholder="بحث بالبريد..."
                className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628]"
              />
            </div>

            <div>
              <label className="block text-[10.5px] font-bold text-[#5C665E] dark:text-[#8FA392] mb-1">طريقة الصرف</label>
              <select
                value={filters.disbursementMethod}
                onChange={(e) => setFilters({ ...filters, disbursementMethod: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628]"
              >
                <option value="all">الكل</option>
                <option value="bank_transfer">تحويل بنكي</option>
                <option value="cash">نقدي (خزينة الموقع)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10.5px] font-bold text-[#5C665E] dark:text-[#8FA392] mb-1">احتساب الإضافي</label>
              <select
                value={filters.hasOvertime}
                onChange={(e) => setFilters({ ...filters, hasOvertime: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628]"
              >
                <option value="all">الكل</option>
                <option value="yes">مُفعّل</option>
                <option value="no">غير مُفعّل</option>
              </select>
            </div>

            <div>
              <label className="block text-[10.5px] font-bold text-[#5C665E] dark:text-[#8FA392] mb-1">تاريخ التعيين (من)</label>
              <input
                type="date"
                value={filters.hireDateFrom}
                onChange={(e) => setFilters({ ...filters, hireDateFrom: e.target.value })}
                className="w-full px-2.5 py-1 rounded-lg text-xs bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628]"
              />
            </div>
          </div>
        </div>
      )}

      {/* 4. MASTER-DETAIL SPLIT WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* RIGHT PANEL: Compact Employee Roster (القائمة السريعة) - 4 cols */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-[#5C665E] dark:text-[#8FA392] px-1">
            <span>سجل الكوادر المفلترة ({filteredEmployees.length})</span>
            <span className="font-mono text-[11px] text-[#D99B26] dark:text-[#EBB34D]">
              {selectedEntity === 'all' ? 'جميع الكيانات' : ENTITY_PILLS.find(p => p.id === selectedEntity)?.label}
            </span>
          </div>

          <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pe-1">
            {filteredEmployees.map(emp => {
              const isSelected = activeEmp?.id === emp.id;
              const isContractExpiring = emp.contractStatus === 'expiring_soon';

              return (
                <div
                  key={emp.id}
                  onClick={() => setSelectedEmployee(emp)}
                  className={`group relative p-3.5 rounded-2xl border transition-all cursor-pointer text-start ${
                    isSelected
                      ? 'bg-[#FBF9F5] dark:bg-[#1F2E23] border-2 border-[#EBB34D] shadow-md'
                      : 'bg-[#F3EFE6] dark:bg-[#17231A] border-[#E0D9CB] dark:border-[#243628] hover:bg-[#EAE4D7] dark:hover:bg-[#1A261D]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white shrink-0 shadow-xs"
                        style={{ backgroundColor: emp.avatarColor }}
                      >
                        {emp.nameAr.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-black text-[#1A241C] dark:text-[#F3EFE6] truncate">
                            {emp.nameAr}
                          </h4>
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md bg-[#E0D9CB]/60 dark:bg-[#0E1610] text-[#5C665E] dark:text-[#8FA392]">
                            {emp.uid}
                          </span>
                        </div>
                        <div className="text-[11px] font-bold text-[#D99B26] dark:text-[#EBB34D] truncate mt-0.5">
                          {emp.jobTitleAr}
                        </div>
                      </div>
                    </div>

                    {/* Contract Status Tag */}
                    <span
                      className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                        isContractExpiring
                          ? 'bg-amber-500/15 text-amber-500 border-amber-500/30'
                          : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                      }`}
                    >
                      {isContractExpiring ? 'قريب الانتهاء' : 'ساري'}
                    </span>
                  </div>

                  {/* Company & Project Badges */}
                  <div className="mt-2.5 pt-2 border-t border-[#E0D9CB]/50 dark:border-[#243628]/50 flex items-center justify-between text-[10.5px] text-[#5C665E] dark:text-[#8FA392]">
                    <span className="truncate">{emp.companyNameAr}</span>
                    <span className="truncate font-medium">{emp.projectCostCenterName || emp.workLocation}</span>
                  </div>

                  {/* Hover / Quick Actions Bar */}
                  <div className="mt-2 flex items-center justify-between gap-1 text-[10px] pt-1">
                    <span className="text-[10.5px] font-mono text-[#8FA392] truncate">{emp.email}</span>
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEmployee(emp);
                          setIsEditContractOpen(true);
                        }}
                        className="p-1 rounded-md hover:bg-white dark:hover:bg-[#111A13] text-[#5C665E] dark:text-[#8FA392] hover:text-[#EBB34D]"
                        title="تعديل العقد"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          archiveEmployee(emp.id);
                        }}
                        className="p-1 rounded-md hover:bg-white dark:hover:bg-[#111A13] text-[#5C665E] dark:text-[#8FA392] hover:text-[#EBB34D]"
                        title="أرشفة"
                      >
                        <Archive className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          resignEmployee(emp.id);
                        }}
                        className="p-1 rounded-md hover:bg-white dark:hover:bg-[#111A13] text-[#5C665E] dark:text-[#8FA392] hover:text-rose-500"
                        title="تسجيل استقالة"
                      >
                        <LogOut className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* LEFT PANEL: Detailed Employee 360° Dossier (الملف الوظيفي الشامل) - 8 cols */}
        <div className="lg:col-span-8 space-y-4">
          {/* Dossier Header */}
          <div className="p-5 rounded-2xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl text-white shadow-md shrink-0"
                  style={{ backgroundColor: activeEmp.avatarColor }}
                >
                  {activeEmp.nameAr.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-black text-[#1A241C] dark:text-[#F3EFE6]">
                      {activeEmp.nameAr}
                    </h2>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-[#1C291E] dark:bg-[#EBB34D] text-[#F3EFE6] dark:text-[#0E1610]">
                      UID: {activeEmp.uid}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-[#D99B26] dark:text-[#EBB34D] mt-0.5">
                    {activeEmp.jobTitleAr} • {activeEmp.companyNameAr}
                  </div>
                  <div className="text-[11px] text-[#5C665E] dark:text-[#8FA392] mt-0.5 flex items-center gap-2">
                    <span>{activeEmp.projectCostCenterName}</span>
                    <span>•</span>
                    <span>المدير المباشر: {activeEmp.directManager}</span>
                  </div>
                </div>
              </div>

              {/* Primary Action Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
                <button
                  onClick={() => setIsOrgChartOpen(true)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#111A13] text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23] transition-all cursor-pointer"
                >
                  <Network className="w-3.5 h-3.5 text-[#D99B26] dark:text-[#EBB34D]" />
                  <span>الهيكل التنظيمي</span>
                </button>

                <button
                  onClick={() => resetEmployeeBiometrics(activeEmp.id)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#111A13] text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23] transition-all cursor-pointer"
                >
                  <Fingerprint className="w-3.5 h-3.5 text-blue-500" />
                  <span>إعادة تعيين البصمة</span>
                </button>

                <button
                  onClick={() => setIsEditContractOpen(true)}
                  className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-[#1C291E] dark:bg-[#EBB34D] text-[#F3EFE6] dark:text-[#0E1610] text-xs font-bold shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>تعديل البيانات والعقد</span>
                </button>
              </div>
            </div>
          </div>

          {/* The 11 Interactive Dossier Sub-Tabs Bar */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] overflow-x-auto no-scrollbar select-none">
            {[
              { id: 'contact', label: 'البيانات والاتصال' },
              { id: 'contract', label: 'العقد ونظام العمل' },
              { id: 'documents', label: 'المستندات والمسوغات (13)' },
              { id: 'assets', label: 'العُهد والأجهزة (7)' },
              { id: 'allowances', label: 'البدلات' },
              { id: 'bonuses', label: 'المكافآت' },
              { id: 'deductions', label: 'الجزاءات والخصومات' },
              { id: 'hours', label: 'ساعات العمل والحضور' },
              { id: 'payslips', label: 'مفردات المرتب' },
              { id: 'calendar', label: 'تقويم الإجازات' },
              { id: 'audit', label: 'سجل العمليات' },
            ].map(tab => {
              const isActive = activeDossierTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveDossierTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-[#1C291E] dark:bg-[#EBB34D] text-[#F3EFE6] dark:text-[#0E1610] shadow-sm'
                      : 'text-[#5C665E] dark:text-[#8FA392] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* TAB 1: CONTACT & PERSONAL */}
          {activeDossierTab === 'contact' && (
            <div className="p-5 rounded-2xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] space-y-5 animate-in fade-in duration-150">
              <div>
                <h3 className="text-xs font-black text-[#1A241C] dark:text-[#F3EFE6] uppercase tracking-wider mb-3">
                  البيانات الشخصية وجهات الاتصال
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628]">
                    <span className="text-[10.5px] text-[#5C665E] dark:text-[#8FA392] block mb-0.5">الهاتف المحمول</span>
                    <span className="font-mono font-bold text-[#1A241C] dark:text-[#F3EFE6]">{activeEmp.mobile}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628]">
                    <span className="text-[10.5px] text-[#5C665E] dark:text-[#8FA392] block mb-0.5">هاتف العمل الداخلي</span>
                    <span className="font-mono font-bold text-[#1A241C] dark:text-[#F3EFE6]">{activeEmp.workPhone || '02-2810-4401'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628]">
                    <span className="text-[10.5px] text-[#5C665E] dark:text-[#8FA392] block mb-0.5">البريد الإلكتروني</span>
                    <span className="font-mono font-bold text-[#1A241C] dark:text-[#F3EFE6] truncate block">{activeEmp.email}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628]">
                    <span className="text-[10.5px] text-[#5C665E] dark:text-[#8FA392] block mb-0.5">الرقم القومي</span>
                    <span className="font-mono font-bold text-[#1A241C] dark:text-[#F3EFE6]">{activeEmp.nationalId}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628]">
                    <span className="text-[10.5px] text-[#5C665E] dark:text-[#8FA392] block mb-0.5">رقم التأمين الاجتماعي</span>
                    <span className="font-mono font-bold text-[#1A241C] dark:text-[#F3EFE6]">{activeEmp.socialInsuranceNo}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628]">
                    <span className="text-[10.5px] text-[#5C665E] dark:text-[#8FA392] block mb-0.5">فصيلة الدم / الديانة</span>
                    <span className="font-bold text-[#1A241C] dark:text-[#F3EFE6]">{activeEmp.bloodType} • {activeEmp.religion}</span>
                  </div>
                </div>

                <div className="mt-3 p-3 rounded-xl bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628] text-xs">
                  <span className="text-[10.5px] text-[#5C665E] dark:text-[#8FA392] block mb-0.5">محل الإقامة الفعلي</span>
                  <span className="font-medium text-[#1A241C] dark:text-[#F3EFE6]">{activeEmp.address}</span>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-black text-[#1A241C] dark:text-[#F3EFE6] uppercase tracking-wider mb-3">
                  بيانات التعيين والبنك
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628]">
                    <span className="text-[10.5px] text-[#5C665E] dark:text-[#8FA392] block mb-0.5">الشركة التابعة</span>
                    <span className="font-bold text-[#1A241C] dark:text-[#F3EFE6]">{activeEmp.companyNameAr}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628]">
                    <span className="text-[10.5px] text-[#5C665E] dark:text-[#8FA392] block mb-0.5">المشروع المرتبط</span>
                    <span className="font-bold text-[#1A241C] dark:text-[#F3EFE6]">{activeEmp.projectCostCenterName}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628]">
                    <span className="text-[10.5px] text-[#5C665E] dark:text-[#8FA392] block mb-0.5">طريقة الصرف والبنك</span>
                    <span className="font-bold text-[#1A241C] dark:text-[#F3EFE6]">{activeEmp.bankName}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628] sm:col-span-2">
                    <span className="text-[10.5px] text-[#5C665E] dark:text-[#8FA392] block mb-0.5">رقم الحساب / الآيبان البنكي (IBAN)</span>
                    <span className="font-mono font-bold text-[#1A241C] dark:text-[#F3EFE6]">{activeEmp.bankAccount}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628]">
                    <span className="text-[10.5px] text-[#5C665E] dark:text-[#8FA392] block mb-0.5">جهة اتصال الطوارئ</span>
                    <span className="font-bold text-[#1A241C] dark:text-[#F3EFE6]">{activeEmp.emergencyContact.name} ({activeEmp.emergencyContact.phone})</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CONTRACT & SCHEDULE */}
          {activeDossierTab === 'contract' && (
            <div className="p-5 rounded-2xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black text-[#1A241C] dark:text-[#F3EFE6] uppercase tracking-wider">
                    بنود العقد ونظام العمل المعتمد
                  </h3>
                  <p className="text-[11px] text-[#5C665E] dark:text-[#8FA392] mt-0.5">
                    المدة: {activeEmp.workSchedule.contractDurationYears} سنوات • ينتهي في {activeEmp.workSchedule.endDate}
                  </p>
                </div>

                <button
                  onClick={() => setIsEditContractOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1C291E] dark:bg-[#EBB34D] text-[#F3EFE6] dark:text-[#0E1610] text-xs font-bold shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>+ تعديل بنود العقد</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628]">
                  <span className="text-[10.5px] text-[#5C665E] dark:text-[#8FA392] block mb-1">الراتب الأساسي</span>
                  <div className="text-base font-black font-mono text-[#1A241C] dark:text-[#F3EFE6]">
                    {activeEmp.salary.basic.toLocaleString('en-US')} <span className="text-xs font-sans font-bold">ج.م</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628]">
                  <span className="text-[10.5px] text-[#5C665E] dark:text-[#8FA392] block mb-1">ساعات العمل الأسبوعية</span>
                  <div className="text-base font-black font-mono text-[#D99B26] dark:text-[#EBB34D]">
                    {activeEmp.workSchedule.weeklyHours} <span className="text-xs font-sans font-bold">ساعة/أسبوع</span>
                  </div>
                  <span className="text-[10px] text-[#8FA392]">{activeEmp.workSchedule.hoursPerDay} س/يوم ({activeEmp.workSchedule.daysPerWeek} أيام)</span>
                </div>

                <div className="p-3.5 rounded-xl bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628]">
                  <span className="text-[10.5px] text-[#5C665E] dark:text-[#8FA392] block mb-1">رصيد الإجازات المتبقي</span>
                  <div className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400">
                    {activeEmp.workSchedule.remainingDays} <span className="text-xs font-sans font-bold">يوماً</span>
                  </div>
                  <span className="text-[10px] text-[#8FA392]">من أصل {activeEmp.workSchedule.annualTotalDays} يوماً سنوياً</span>
                </div>

                <div className="p-3.5 rounded-xl bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628]">
                  <span className="text-[10.5px] text-[#5C665E] dark:text-[#8FA392] block mb-1">حالة العقد والمرفق</span>
                  <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>سارٍ وموقع رسمي</span>
                  </div>
                  <span className="text-[10px] text-[#8FA392] truncate block mt-0.5">{activeEmp.workSchedule.officialContractPdf}</span>
                </div>
              </div>

              {/* Work Characteristics Badges */}
              <div className="p-3.5 rounded-xl bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628]">
                <span className="text-[11px] font-bold text-[#5C665E] dark:text-[#8FA392] block mb-2">
                  طبيعة العمل المعتمدة بالعقد:
                </span>
                <div className="flex flex-wrap gap-2 text-xs">
                  {activeEmp.workSchedule.isRemote && (
                    <span className="px-2.5 py-1 rounded-lg bg-blue-500/15 text-blue-500 font-bold border border-blue-500/30">
                      ✓ عمل عن بُعد / أونلاين
                    </span>
                  )}
                  {activeEmp.workSchedule.isFixedHours && (
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30">
                      ✓ ساعات دوام ثابتة
                    </span>
                  )}
                  {activeEmp.workSchedule.isDriver && (
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-500 font-bold border border-amber-500/30">
                      ✓ سائق معدات ونقل
                    </span>
                  )}
                  {activeEmp.workSchedule.hasSocialInsurance && (
                    <span className="px-2.5 py-1 rounded-lg bg-[#EBB34D]/15 text-[#D99B26] dark:text-[#EBB34D] font-bold border border-[#EBB34D]/30">
                      ✓ تأمين اجتماعي نمطي
                    </span>
                  )}
                  {activeEmp.workSchedule.hasMedicalInsurance && (
                    <span className="px-2.5 py-1 rounded-lg bg-teal-500/15 text-teal-600 dark:text-teal-400 font-bold border border-teal-500/30">
                      ✓ تأمين طبي (خصم شهري {activeEmp.workSchedule.medicalInsuranceMonthlyDeduction} ج.م)
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 13 DOCUMENTS & DOSSIER */}
          {activeDossierTab === 'documents' && (
            <div className="p-5 rounded-2xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black text-[#1A241C] dark:text-[#F3EFE6] uppercase tracking-wider">
                    سجل مسوغات التعيين والمستندات الرسمية (13 مستنداً)
                  </h3>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>كافة المسوغات المطلوبة مكتملة وسارية</span>
                  </p>
                </div>
                <button
                  onClick={() => showToast('جاري التحقق من أختام وصحة الوثائق')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#111A13] text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23] cursor-pointer"
                >
                  <FileCheck2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>فحص الأرشيف الرقمي</span>
                </button>
              </div>

              <div className="rounded-xl border border-[#E0D9CB] dark:border-[#243628] overflow-hidden">
                <table className="w-full text-xs text-start border-collapse">
                  <thead>
                    <tr className="bg-[#EAE4D7]/70 dark:bg-[#1F2E23]/70 border-b border-[#E0D9CB] dark:border-[#243628] text-[#5C665E] dark:text-[#8FA392]">
                      <th className="p-3 text-start font-bold">نوع ومسمى المستند</th>
                      <th className="p-3 text-center font-bold">الحالة</th>
                      <th className="p-3 text-start font-bold">تاريخ الانتهاء</th>
                      <th className="p-3 text-start font-bold">اسم الملف المرفوع</th>
                      <th className="p-3 text-center font-bold">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E0D9CB]/60 dark:divide-[#243628]/60 bg-white dark:bg-[#17231A]">
                    {activeEmp.documents.map((doc) => {
                      const isExpiring = doc.status === 'expiring';
                      const isMissing = doc.status === 'missing';

                      return (
                        <tr key={doc.id} className="hover:bg-[#FBF9F5] dark:hover:bg-[#1F2E23]/40 transition-colors">
                          <td className="p-3 font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                            {doc.titleAr}
                          </td>
                          <td className="p-3 text-center">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                isMissing
                                  ? 'bg-rose-500/15 text-rose-500 border-rose-500/30'
                                  : isExpiring
                                  ? 'bg-amber-500/15 text-[#D99B26] dark:text-[#EBB34D] border-amber-500/30'
                                  : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                              }`}
                            >
                              {isMissing ? 'ناقص' : isExpiring ? 'ينتهي قريباً' : 'سارٍ ومكتمل'}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-[11px] text-[#5C665E] dark:text-[#8FA392]">
                            {doc.expiryDate || 'سارٍ بصفة دائمة'}
                          </td>
                          <td className="p-3 font-mono text-[11px] text-[#1A241C] dark:text-[#F3EFE6] truncate max-w-[140px]">
                            {doc.fileName || '-'}
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => showToast(`جاري تحميل ملف: ${doc.titleAr}`)}
                                className="p-1 rounded-md text-[#5C665E] dark:text-[#8FA392] hover:text-[#EBB34D] hover:bg-[#EAE4D7] dark:hover:bg-[#111A13]"
                                title="تحميل الملف"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  updateEmployeeDocumentStatus(activeEmp.id, doc.id, 'valid');
                                }}
                                className="p-1 rounded-md text-[#5C665E] dark:text-[#8FA392] hover:text-emerald-500 hover:bg-[#EAE4D7] dark:hover:bg-[#111A13]"
                                title="تحديث وتأكيد الصلاحية"
                              >
                                <Upload className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: 7 CUSTODY ASSETS */}
          {activeDossierTab === 'assets' && (
            <div className="p-5 rounded-2xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black text-[#1A241C] dark:text-[#F3EFE6] uppercase tracking-wider">
                    سجل العُهد والأجهزة الميدانية والمكتبية (7 عُهد)
                  </h3>
                  <p className="text-[11px] text-[#5C665E] dark:text-[#8FA392] mt-0.5">
                    العهد المسلمة تحت مسؤولية الموظف بالمشاريع والمواقع
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-[#E0D9CB] dark:border-[#243628] overflow-hidden">
                <table className="w-full text-xs text-start border-collapse">
                  <thead>
                    <tr className="bg-[#EAE4D7]/70 dark:bg-[#1F2E23]/70 border-b border-[#E0D9CB] dark:border-[#243628] text-[#5C665E] dark:text-[#8FA392]">
                      <th className="p-3 text-start font-bold">نوع الأصل / العهدة</th>
                      <th className="p-3 text-center font-bold">حالة التسليم</th>
                      <th className="p-3 text-start font-bold">الرقم التسلسلي / اللوحة</th>
                      <th className="p-3 text-start font-bold">تاريخ الاستلام</th>
                      <th className="p-3 text-center font-bold">إخلاء طرف / تسليم</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E0D9CB]/60 dark:divide-[#243628]/60 bg-white dark:bg-[#17231A]">
                    {activeEmp.assets.map((asset) => {
                      const isDelivered = asset.status === 'delivered';
                      return (
                        <tr key={asset.id} className="hover:bg-[#FBF9F5] dark:hover:bg-[#1F2E23]/40 transition-colors">
                          <td className="p-3 font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                            <div>{asset.nameAr}</div>
                            {asset.notes && <div className="text-[10px] text-[#8FA392] font-normal">{asset.notes}</div>}
                          </td>
                          <td className="p-3 text-center">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                isDelivered
                                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                                  : 'bg-stone-500/15 text-stone-500 border-stone-500/30'
                              }`}
                            >
                              {isDelivered ? 'مُسلّم وسارٍ' : 'غير مُسلّم'}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-[11px] text-[#5C665E] dark:text-[#8FA392]">
                            {asset.serialNumber || '-'}
                          </td>
                          <td className="p-3 font-mono text-[11px] text-[#5C665E] dark:text-[#8FA392]">
                            {asset.issueDate || '-'}
                          </td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => toggleEmployeeAssetStatus(activeEmp.id, asset.id)}
                              className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer ${
                                isDelivered
                                  ? 'bg-rose-500/15 text-rose-500 hover:bg-rose-500/25'
                                  : 'bg-[#1C291E] dark:bg-[#EBB34D] text-[#F3EFE6] dark:text-[#0E1610]'
                              }`}
                            >
                              {isDelivered ? 'استرداد العهدة' : 'تسليم للموظف'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: ALLOWANCES */}
          {activeDossierTab === 'allowances' && (
            <div className="p-5 rounded-2xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black text-[#1A241C] dark:text-[#F3EFE6] uppercase tracking-wider">
                    جدول البدلات الشهرية المعتمدة
                  </h3>
                  <p className="text-[11px] text-[#5C665E] dark:text-[#8FA392] mt-0.5">
                    إجمالي البدلات: {activeEmp.salary.allowances.toLocaleString('en-US')} ج.م / شهر
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeEmp.allowancesList.map(alw => (
                  <div key={alw.id} className="p-3.5 rounded-xl bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628] flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6]">{alw.titleAr}</div>
                      <div className="text-[10px] text-[#5C665E] dark:text-[#8FA392]">تصرف بصفة دورية مع الراتب</div>
                    </div>
                    <div className="text-sm font-black font-mono text-[#D99B26] dark:text-[#EBB34D]">
                      {alw.amount.toLocaleString('en-US')} <span className="text-[10px] font-sans font-bold">ج.م</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: BONUSES */}
          {activeDossierTab === 'bonuses' && (
            <div className="p-5 rounded-2xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black text-[#1A241C] dark:text-[#F3EFE6] uppercase tracking-wider">
                    سجل المكافآت وحوافز الإنجاز الميداني
                  </h3>
                  <p className="text-[11px] text-[#5C665E] dark:text-[#8FA392] mt-0.5">
                    المكافآت المصروفة عن تسليم مراحل المشاريع
                  </p>
                </div>

                <button
                  onClick={() => setIsAddBonusOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1C291E] dark:bg-[#EBB34D] text-[#F3EFE6] dark:text-[#0E1610] text-xs font-bold shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ صرف مكافأة جديدة</span>
                </button>
              </div>

              {activeEmp.bonuses.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#5C665E] dark:text-[#8FA392]">
                  لا توجد مكافآت مسجلة في رصيد الموظف حالياً
                </div>
              ) : (
                <div className="space-y-2.5">
                  {activeEmp.bonuses.map(b => (
                    <div key={b.id} className="p-3.5 rounded-xl bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628] flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6]">{b.titleAr}</div>
                        <div className="text-[11px] text-[#5C665E] dark:text-[#8FA392] mt-0.5">{b.reason}</div>
                        {b.projectLinked && (
                          <div className="text-[10px] text-[#D99B26] dark:text-[#EBB34D] mt-0.5">
                            المشروع: {b.projectLinked}
                          </div>
                        )}
                      </div>
                      <div className="text-end">
                        <div className="text-sm font-black font-mono text-emerald-600 dark:text-emerald-400">
                          +{b.amount.toLocaleString('en-US')} ج.م
                        </div>
                        <div className="text-[10px] font-mono text-[#8FA392]">{b.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 7: DEDUCTIONS */}
          {activeDossierTab === 'deductions' && (
            <div className="p-5 rounded-2xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black text-[#1A241C] dark:text-[#F3EFE6] uppercase tracking-wider">
                    سجل الجزاءات والخصومات الإدارية
                  </h3>
                  <p className="text-[11px] text-[#5C665E] dark:text-[#8FA392] mt-0.5">
                    الاستقطاعات المطبقة لمخالفة تعليمات العمل والسلامة
                  </p>
                </div>

                <button
                  onClick={() => setIsAddDeductionOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ تسجيل جزاء</span>
                </button>
              </div>

              {activeEmp.deductions.length === 0 ? (
                <div className="p-8 text-center text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                  السجل نظيف تماماً • لا توجد أي جزاءات أو خصومات مسجلة بحق الموظف
                </div>
              ) : (
                <div className="space-y-2.5">
                  {activeEmp.deductions.map(d => (
                    <div key={d.id} className="p-3.5 rounded-xl bg-white dark:bg-[#111A13] border border-rose-500/20 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-rose-500">{d.titleAr}</div>
                        <div className="text-[11px] text-[#5C665E] dark:text-[#8FA392] mt-0.5">{d.reason}</div>
                        {d.daysCount && (
                          <div className="text-[10px] text-[#8FA392] mt-0.5">
                            خصم: {d.daysCount} يوم عمل
                          </div>
                        )}
                      </div>
                      <div className="text-end">
                        <div className="text-sm font-black font-mono text-rose-500">
                          -{d.amount.toLocaleString('en-US')} ج.م
                        </div>
                        <div className="text-[10px] font-mono text-[#8FA392]">{d.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 8: WORKED HOURS & ATTENDANCE */}
          {activeDossierTab === 'hours' && (
            <div className="p-5 rounded-2xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black text-[#1A241C] dark:text-[#F3EFE6] uppercase tracking-wider">
                    ساعات العمل الفعلية والحضور والانصراف
                  </h3>
                  <p className="text-[11px] text-[#5C665E] dark:text-[#8FA392] mt-0.5">
                    متابعة سجل البصمة اليومية لشهر أكتوبر 2026
                  </p>
                </div>
              </div>

              {/* 4 Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628]">
                  <span className="text-[10.5px] text-[#5C665E] dark:text-[#8FA392] block mb-0.5">ساعات العمل الفعلية</span>
                  <div className="text-lg font-black font-mono text-[#1A241C] dark:text-[#F3EFE6]">
                    {activeEmp.workedHours.actualHours} <span className="text-xs font-sans font-bold">ساعة</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628]">
                  <span className="text-[10.5px] text-[#5C665E] dark:text-[#8FA392] block mb-0.5">الساعات المطلوبة</span>
                  <div className="text-lg font-black font-mono text-[#D99B26] dark:text-[#EBB34D]">
                    {activeEmp.workedHours.requiredHours} <span className="text-xs font-sans font-bold">ساعة</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628]">
                  <span className="text-[10.5px] text-[#5C665E] dark:text-[#8FA392] block mb-0.5">الأيام المكتملة</span>
                  <div className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
                    {activeEmp.workedHours.completedDays} <span className="text-xs font-sans font-bold">يوم</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628]">
                  <span className="text-[10.5px] text-[#5C665E] dark:text-[#8FA392] block mb-0.5">الأيام غير المكتملة</span>
                  <div className="text-lg font-black font-mono text-stone-500">
                    {activeEmp.workedHours.incompleteDays} <span className="text-xs font-sans font-bold">يوم</span>
                  </div>
                </div>
              </div>

              {/* Punch Logs Table */}
              <div className="rounded-xl border border-[#E0D9CB] dark:border-[#243628] overflow-hidden">
                <table className="w-full text-xs text-start border-collapse">
                  <thead>
                    <tr className="bg-[#EAE4D7]/70 dark:bg-[#1F2E23]/70 border-b border-[#E0D9CB] dark:border-[#243628] text-[#5C665E] dark:text-[#8FA392]">
                      <th className="p-2.5 text-start font-bold">التاريخ</th>
                      <th className="p-2.5 text-start font-bold">وقت الحضور</th>
                      <th className="p-2.5 text-start font-bold">وقت الانصراف</th>
                      <th className="p-2.5 text-center font-bold">الساعات المنجزة</th>
                      <th className="p-2.5 text-center font-bold">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E0D9CB]/60 dark:divide-[#243628]/60 bg-white dark:bg-[#17231A]">
                    {activeEmp.workedHours.dailyLogs.map((log, i) => (
                      <tr key={i} className="hover:bg-[#FBF9F5] dark:hover:bg-[#1F2E23]/40">
                        <td className="p-2.5 font-mono text-[#1A241C] dark:text-[#F3EFE6]">{log.date}</td>
                        <td className="p-2.5 font-mono text-emerald-600 dark:text-emerald-400">{log.checkIn}</td>
                        <td className="p-2.5 font-mono text-[#D99B26] dark:text-[#EBB34D]">{log.checkOut}</td>
                        <td className="p-2.5 text-center font-mono font-bold">{log.hoursWorked} س</td>
                        <td className="p-2.5 text-center">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                            مكتمل
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 9: PAYSLIPS ARCHIVE */}
          {activeDossierTab === 'payslips' && (
            <div className="p-5 rounded-2xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black text-[#1A241C] dark:text-[#F3EFE6] uppercase tracking-wider">
                    أرشيف قسائم الرواتب الشهرية (Payslips)
                  </h3>
                  <p className="text-[11px] text-[#5C665E] dark:text-[#8FA392] mt-0.5">
                    كشوف المرتب الصادرة والمعتمدة بنكياً
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {[
                  { period: '2026-09', basic: activeEmp.salary.basic, allowances: activeEmp.salary.allowances, net: activeEmp.salary.net, date: '2026-09-30' },
                  { period: '2026-08', basic: activeEmp.salary.basic, allowances: activeEmp.salary.allowances, net: activeEmp.salary.net, date: '2026-08-31' },
                  { period: '2026-07', basic: activeEmp.salary.basic, allowances: activeEmp.salary.allowances, net: activeEmp.salary.net, date: '2026-07-31' },
                ].map((slip, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628] flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                        مسير راتب شهر {slip.period}
                      </div>
                      <div className="text-[10.5px] text-[#5C665E] dark:text-[#8FA392]">
                        الأساسي: {slip.basic.toLocaleString('en-US')} ج.م • البدلات: {slip.allowances.toLocaleString('en-US')} ج.م
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-end">
                        <div className="text-sm font-black font-mono text-[#D99B26] dark:text-[#EBB34D]">
                          {slip.net.toLocaleString('en-US')} ج.م
                        </div>
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">تم التحويل البنكي</div>
                      </div>
                      <button
                        onClick={() => setIsPayslipModalOpen(true)}
                        className="p-2 rounded-lg bg-[#EAE4D7] dark:bg-[#1F2E23] text-[#1A241C] dark:text-[#F3EFE6] hover:bg-[#E0D9CB] dark:hover:bg-[#243628] transition-colors"
                        title="عرض وطباعة القسيمة"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 10: TIME-OFF CALENDAR */}
          {activeDossierTab === 'calendar' && (
            <div className="p-5 rounded-2xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] space-y-4 animate-in fade-in duration-150">
              <TimeOffCalendarView employee={activeEmp} />
            </div>
          )}

          {/* TAB 11: AUDIT LOGS */}
          {activeDossierTab === 'audit' && (
            <div className="p-5 rounded-2xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black text-[#1A241C] dark:text-[#F3EFE6] uppercase tracking-wider">
                    سجل العمليات والتدقيق الإداري (Audit Trail)
                  </h3>
                  <p className="text-[11px] text-[#5C665E] dark:text-[#8FA392] mt-0.5">
                    تتبع تفصيلي لكافة التعديلات والإجراءات الصادرة على ملف الموظف
                  </p>
                </div>
              </div>

              {activeEmp.auditLogs.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#5C665E] dark:text-[#8FA392]">
                  لا توجد سجلات تعديل إدارية سابقة
                </div>
              ) : (
                <div className="space-y-2.5">
                  {activeEmp.auditLogs.map(log => (
                    <div key={log.id} className="p-3.5 rounded-xl bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628] text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-[#1A241C] dark:text-[#F3EFE6] flex items-center gap-1.5">
                          <History className="w-3.5 h-3.5 text-[#D99B26] dark:text-[#EBB34D]" />
                          <span>{log.actionType}: {log.fieldChanged}</span>
                        </span>
                        <span className="font-mono text-[10.5px] text-[#8FA392]">{log.timestamp}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-2 p-2 rounded-lg bg-[#FBF9F5] dark:bg-[#0E1610] text-[11px]">
                        <div>
                          <span className="text-[#8FA392] block text-[10px]">القيمة السابقة:</span>
                          <span className="text-stone-500 line-through font-mono">{log.oldValue}</span>
                        </div>
                        <div>
                          <span className="text-[#8FA392] block text-[10px]">القيمة الجديدة المعتمدة:</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">{log.newValue}</span>
                        </div>
                      </div>
                      <div className="mt-1.5 text-[10px] text-[#5C665E] dark:text-[#8FA392]">
                        المستخدم المسؤول: <span className="font-bold text-[#1A241C] dark:text-[#F3EFE6]">{log.userName}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Universal Modals */}
      <EditContractModal
        isOpen={isEditContractOpen}
        onClose={() => setIsEditContractOpen(false)}
        employee={activeEmp}
      />

      <OrgChartModal
        isOpen={isOrgChartOpen}
        onClose={() => setIsOrgChartOpen(false)}
        employee={activeEmp}
      />

      <AddBonusModal
        isOpen={isAddBonusOpen}
        onClose={() => setIsAddBonusOpen(false)}
        employee={activeEmp}
      />

      <AddDeductionModal
        isOpen={isAddDeductionOpen}
        onClose={() => setIsAddDeductionOpen(false)}
        employee={activeEmp}
      />

      {/* Add New Employee Modal */}
      <Modal
        isOpen={isAddEmployeeOpen}
        onClose={() => setIsAddEmployeeOpen(false)}
        title="إضافة ملف موظف جديد للمنظومة"
        subtitle="تسجيل البيانات الأساسية وتعيين مركز تكلفة المشروع والشركة التابعة"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreateEmployee} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#5C665E] dark:text-[#8FA392] mb-1">
              اسم الموظف رباعي بالعربية *
            </label>
            <input
              type="text"
              value={newEmpForm.nameAr}
              onChange={(e) => setNewEmpForm({ ...newEmpForm, nameAr: e.target.value })}
              placeholder="مثال: م. مصطفى كمال الدين عبد العزيز"
              className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:border-[#EBB34D] outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#5C665E] dark:text-[#8FA392] mb-1">
                المسمى الوظيفي *
              </label>
              <input
                type="text"
                value={newEmpForm.jobTitleAr}
                onChange={(e) => setNewEmpForm({ ...newEmpForm, jobTitleAr: e.target.value })}
                placeholder="مهندس موقع، محاسب..."
                className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:border-[#EBB34D] outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#5C665E] dark:text-[#8FA392] mb-1">
                الشركة التابعة *
              </label>
              <select
                value={newEmpForm.companyId}
                onChange={(e) => {
                  const sel = ENTITY_PILLS.find(p => p.id === e.target.value);
                  setNewEmpForm({
                    ...newEmpForm,
                    companyId: e.target.value,
                    companyNameAr: sel ? sel.label : 'ترابط للمقاولات العامة',
                  });
                }}
                className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:border-[#EBB34D] outline-none"
              >
                <option value="comp_tarabot">ترابط للمقاولات العامة</option>
                <option value="comp_master_group">ماستر جروب القابضة</option>
                <option value="comp_master_travel">ماستر ترافل والنقل</option>
                <option value="comp_jadara">جدارة للاستشارات</option>
                <option value="comp_impro">إيمبرو للحلول الهندسية</option>
                <option value="comp_arkan">أركان للإنشاءات</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#5C665E] dark:text-[#8FA392] mb-1">
                موقع العمل / المشروع
              </label>
              <input
                type="text"
                value={newEmpForm.workLocation}
                onChange={(e) => setNewEmpForm({ ...newEmpForm, workLocation: e.target.value })}
                placeholder="مشروع شبرا النخل، المقر الرئيسي..."
                className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:border-[#EBB34D] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#5C665E] dark:text-[#8FA392] mb-1">
                الراتب الأساسي (ج.م) *
              </label>
              <input
                type="number"
                min="5000"
                step="500"
                value={newEmpForm.basicSalary}
                onChange={(e) => setNewEmpForm({ ...newEmpForm, basicSalary: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:border-[#EBB34D] outline-none font-mono font-bold"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#5C665E] dark:text-[#8FA392] mb-1">
                الهاتف المحمول
              </label>
              <input
                type="text"
                value={newEmpForm.mobile}
                onChange={(e) => setNewEmpForm({ ...newEmpForm, mobile: e.target.value })}
                placeholder="010-xxxx-xxxx"
                className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:border-[#EBB34D] outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#5C665E] dark:text-[#8FA392] mb-1">
                الرقم القومي (14 رقماً)
              </label>
              <input
                type="text"
                value={newEmpForm.nationalId}
                onChange={(e) => setNewEmpForm({ ...newEmpForm, nationalId: e.target.value })}
                placeholder="29xxxxxxxxxxxx"
                className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:border-[#EBB34D] outline-none font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E0D9CB] dark:border-[#243628]">
            <button
              type="button"
              onClick={() => setIsAddEmployeeOpen(false)}
              className="px-4 py-2 rounded-xl border border-[#E0D9CB] dark:border-[#243628] text-xs font-bold text-[#5C665E] dark:text-[#8FA392] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23] transition-all cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#1C291E] dark:bg-[#EBB34D] text-[#F3EFE6] dark:text-[#0E1610] text-xs font-bold shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>تسجيل الموظف والملف</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Payslip View Modal */}
      <Modal
        isOpen={isPayslipModalOpen}
        onClose={() => setIsPayslipModalOpen(false)}
        title="قسيمة الراتب الرسمية المعتمدة (Salary Slip)"
        subtitle={`${activeEmp.nameAr} - مسير راتب شهر سبتمبر 2026`}
        maxWidth="max-w-lg"
      >
        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#111A13] space-y-3">
            <div className="flex justify-between border-b pb-2 border-[#E0D9CB]/60 dark:border-[#243628]/60">
              <span className="text-[#5C665E] dark:text-[#8FA392]">الموظف:</span>
              <span className="font-bold">{activeEmp.nameAr} (UID: {activeEmp.uid})</span>
            </div>
            <div className="flex justify-between border-b pb-2 border-[#E0D9CB]/60 dark:border-[#243628]/60">
              <span className="text-[#5C665E] dark:text-[#8FA392]">المسمى والشركة:</span>
              <span className="font-bold">{activeEmp.jobTitleAr} • {activeEmp.companyNameAr}</span>
            </div>
            <div className="flex justify-between border-b pb-2 border-[#E0D9CB]/60 dark:border-[#243628]/60">
              <span className="text-[#5C665E] dark:text-[#8FA392]">الراتب الأساسي:</span>
              <span className="font-mono font-bold">{activeEmp.salary.basic.toLocaleString('en-US')} ج.م</span>
            </div>
            <div className="flex justify-between border-b pb-2 border-[#E0D9CB]/60 dark:border-[#243628]/60">
              <span className="text-[#5C665E] dark:text-[#8FA392]">إجمالي البدلات:</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">+{activeEmp.salary.allowances.toLocaleString('en-US')} ج.م</span>
            </div>
            <div className="flex justify-between border-b pb-2 border-[#E0D9CB]/60 dark:border-[#243628]/60">
              <span className="text-[#5C665E] dark:text-[#8FA392]">الاستقطاعات والتأمينات:</span>
              <span className="font-mono font-bold text-rose-500">-{activeEmp.salary.deductions.toLocaleString('en-US')} ج.م</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="font-black text-sm">الصافي المحول بنكياً:</span>
              <span className="font-mono font-black text-base text-[#D99B26] dark:text-[#EBB34D]">
                {activeEmp.salary.net.toLocaleString('en-US')} ج.م
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1C291E] dark:bg-[#EBB34D] text-[#F3EFE6] dark:text-[#0E1610] text-xs font-bold shadow-md cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة القسيمة</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
