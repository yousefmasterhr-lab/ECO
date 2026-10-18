import React, { useState, useEffect, useMemo } from 'react';
import { useHR } from '../../../context/HRContext';
import { companyStorage } from '../companies/companyStorage';
import { branchStorage } from '../companies/branchStorage';
import { CompanyEntity, BranchLocation } from '../companies/types';
import { CreatableSelect } from '../../common/CreatableSelect';
import { DocumentPreviewModal } from '../../common/DocumentPreviewModal';
import { EditContractModal } from './EditContractModal';
import { OrgChartModal } from './OrgChartModal';
import { AddBonusModal } from './AddBonusModal';
import { AddDeductionModal } from './AddDeductionModal';
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
  History,
  Users,
  Eye,
  AlertCircle
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
    updateEmployeeDocumentStatus,
    showToast,
  } = useHR();

  // Dynamic Companies & Branches from Cloudflare D1
  const [companies, setCompanies] = useState<CompanyEntity[]>(() => companyStorage.getCompaniesSync());
  const [branches, setBranches] = useState<BranchLocation[]>(() => branchStorage.getBranchesSync());

  useEffect(() => {
    companyStorage.getCompanies().then(list => {
      if (Array.isArray(list) && list.length > 0) setCompanies(list);
    });
    branchStorage.getBranches().then(list => {
      if (Array.isArray(list) && list.length > 0) setBranches(list);
    });
    const handleCompUpdate = () => setCompanies(companyStorage.getCompaniesSync());
    const handleBranchUpdate = () => setBranches(branchStorage.getBranchesSync());
    window.addEventListener('eco-companies-updated', handleCompUpdate);
    window.addEventListener('eco-branches-updated', handleBranchUpdate);
    return () => {
      window.removeEventListener('eco-companies-updated', handleCompUpdate);
      window.removeEventListener('eco-branches-updated', handleBranchUpdate);
    };
  }, []);

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

  // Document Preview Modal State
  const [previewDoc, setPreviewDoc] = useState<{ url: string; title: string; type?: string } | null>(null);

  // New Employee Form
  const [newEmpForm, setNewEmpForm] = useState({
    nameAr: '',
    nameEn: '',
    jobTitleAr: '',
    departmentAr: '',
    companyId: '',
    companyNameAr: '',
    branchAr: '',
    workLocation: '',
    mobile: '',
    email: '',
    nationalId: '',
    basicSalary: '',
    directManager: '',
  });

  // Update newEmpForm default company when companies load
  useEffect(() => {
    if (companies.length > 0 && !newEmpForm.companyId) {
      setNewEmpForm(prev => ({
        ...prev,
        companyId: companies[0].id,
        companyNameAr: companies[0].nameAr,
        branchAr: 'المقر الرئيسي',
      }));
    }
  }, [companies, newEmpForm.companyId]);

  // Dynamic Company Pills with real live counts
  const entityPills = useMemo(() => {
    const totalCount = employees.length;
    const pills = [
      { id: 'all', label: 'الكل', count: totalCount },
      ...companies.map(c => ({
        id: c.id,
        label: c.nameAr,
        count: employees.filter(e => e.companyId === c.id).length,
      }))
    ];
    return pills;
  }, [companies, employees]);

  // Lifecycle counters
  const lifecycleCounts = useMemo(() => {
    return {
      active: employees.filter(e => e.lifecycleStatus === 'active').length,
      resigned: employees.filter(e => e.lifecycleStatus === 'resigned').length,
      archived: employees.filter(e => e.lifecycleStatus === 'archived').length,
    };
  }, [employees]);

  // Filter employees
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
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
  }, [employees, selectedEntity, selectedLifecycle, filters]);

  const activeEmp = selectedEmployee || filteredEmployees[0] || employees[0] || null;

  const handleExportExcel = () => {
    showToast('تم تصدير ملف إكسل بسجلات الموظفين المفلترة بنجاح');
  };

  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpForm.nameAr.trim()) {
      showToast('يرجى إدخال اسم الموظف رباعياً بالعربية');
      return;
    }

    const basic = Number(newEmpForm.basicSalary) || 0;
    const allowances = 0;
    const deductions = 0;

    const created = addEmployee({
      nameAr: newEmpForm.nameAr.trim(),
      nameEn: newEmpForm.nameEn.trim(),
      jobTitleAr: newEmpForm.jobTitleAr.trim() || 'موظف',
      departmentAr: newEmpForm.departmentAr.trim() || 'الإدارة العامة',
      companyId: newEmpForm.companyId || (companies[0]?.id || 'comp_default'),
      companyNameAr: newEmpForm.companyNameAr || (companies[0]?.nameAr || 'الشركة الرئيسية'),
      branchAr: newEmpForm.branchAr || 'المقر الرئيسي',
      workLocation: newEmpForm.workLocation.trim() || 'المقر الرئيسي',
      mobile: newEmpForm.mobile.trim(),
      email: newEmpForm.email.trim(),
      nationalId: newEmpForm.nationalId.trim(),
      directManager: newEmpForm.directManager.trim() || '—',
      salary: {
        basic,
        allowances,
        deductions,
        net: basic + allowances - deductions,
      },
    });

    setSelectedEmployee(created);
    setIsAddEmployeeOpen(false);
    setNewEmpForm({
      nameAr: '',
      nameEn: '',
      jobTitleAr: '',
      departmentAr: '',
      companyId: companies[0]?.id || '',
      companyNameAr: companies[0]?.nameAr || '',
      branchAr: '',
      workLocation: '',
      mobile: '',
      email: '',
      nationalId: '',
      basicSalary: '',
      directManager: '',
    });
  };

  // Filter branches for selected company
  const companyBranches = useMemo(() => {
    return branches.filter(b => b.companyId === newEmpForm.companyId);
  }, [branches, newEmpForm.companyId]);

  return (
    <div className="space-y-4">
      {/* 1. Dynamic Company Pills with Real Live Counts */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 select-none no-scrollbar">
        {entityPills.map(p => {
          const isSelected = selectedEntity === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setSelectedEntity(p.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-l from-amber-600 to-amber-500 text-white shadow-md shadow-amber-500/20 font-black'
                  : 'bg-[#F3EFE6] dark:bg-[#17231A] text-[#5C665E] dark:text-[#8FA392] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23] border border-[#E0D9CB] dark:border-[#243628]'
              }`}
            >
              <span>{p.label}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                isSelected
                  ? 'bg-black/20 text-white font-black'
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
            { id: 'active', label: 'موظفون حاليون', count: lifecycleCounts.active },
            { id: 'resigned', label: 'مستقيلون', count: lifecycleCounts.resigned },
            { id: 'archived', label: 'أرشيف', count: lifecycleCounts.archived },
          ].map(tab => {
            const isCurrent = selectedLifecycle === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedLifecycle(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-gradient-to-l from-amber-600 to-amber-500 text-white shadow-sm font-black'
                    : 'text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6]'
                }`}
              >
                <span>{tab.label}</span>
                <span className="text-[10px] font-mono opacity-90">({tab.count})</span>
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
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-l from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white text-xs font-bold shadow-md shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shrink-0"
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
                placeholder="مثال: 0001"
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
              <label className="block text-[10.5px] font-bold text-[#5C665E] dark:text-[#8FA392] mb-1">البريد الإلكتروني</label>
              <input
                type="text"
                value={filters.email}
                onChange={(e) => setFilters({ ...filters, email: e.target.value })}
                placeholder="بحث بالبريد..."
                className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628]"
              />
            </div>
          </div>
        </div>
      )}

      {/* 4. EXECUTIVE ZERO DATA EMPTY STATE */}
      {employees.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[460px] p-8 text-center rounded-3xl bg-[#F3EFE6]/70 dark:bg-[#17231A]/70 border border-[#E0D9CB] dark:border-[#243628] shadow-sm backdrop-blur-sm">
          <div className="w-20 h-20 mb-5 rounded-3xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-inner">
            <Users className="w-10 h-10" />
          </div>
          <h3 className="text-base sm:text-lg font-black text-[#1A241C] dark:text-[#F3EFE6] mb-2">
            لا توجد بيانات موظفين مسجلة حالياً
          </h3>
          <p className="max-w-md text-xs font-medium text-[#5C665E] dark:text-[#8FA392] mb-6 leading-relaxed">
            ابدأ بإضافة أول موظف وربطه بشركته وموقعه الفعلي في الهيكل التنظيمي المعتمد
          </p>
          <button
            onClick={() => setIsAddEmployeeOpen(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-l from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-bold text-xs shadow-lg shadow-amber-500/25 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ إضافة موظف جديد</span>
          </button>
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center rounded-3xl bg-[#F3EFE6]/50 dark:bg-[#17231A]/50 border border-[#E0D9CB] dark:border-[#243628]">
          <AlertCircle className="w-10 h-10 text-amber-500/70 mb-3" />
          <h4 className="text-sm font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
            لا توجد نتائج مطابقة لشروط البحث والفلاتر
          </h4>
          <p className="text-xs text-[#5C665E] dark:text-[#8FA392]">
            جرّب تغيير معايير البحث أو اختيار شركة أو تصنيف وظيفي مختلف
          </p>
        </div>
      ) : (
        /* 5. MASTER-DETAIL SPLIT WORKSPACE */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* RIGHT PANEL: Compact Employee Roster (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-[#5C665E] dark:text-[#8FA392] px-1">
              <span>سجل الكوادر المفلترة ({filteredEmployees.length})</span>
              <span className="font-mono text-[11px] text-[#D99B26] dark:text-[#EBB34D]">
                {selectedEntity === 'all' ? 'جميع الكيانات' : companies.find(c => c.id === selectedEntity)?.nameAr}
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
                        ? 'bg-amber-50/90 dark:bg-amber-950/20 border-2 border-amber-500 shadow-md text-amber-950 dark:text-amber-100'
                        : 'bg-[#F3EFE6] dark:bg-[#17231A] border-[#E0D9CB] dark:border-[#243628] hover:bg-[#EAE4D7] dark:hover:bg-[#1A261D]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white shrink-0 shadow-xs"
                          style={{ backgroundColor: emp.avatarColor || '#D99B26' }}
                        >
                          {emp.nameAr ? emp.nameAr.charAt(0) : 'م'}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-black text-[#1A241C] dark:text-[#F3EFE6] truncate">
                              {emp.nameAr}
                            </h4>
                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-500/30">
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
                      <span className="text-[10.5px] font-mono text-[#8FA392] truncate">{emp.email || emp.mobile}</span>
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

          {/* LEFT PANEL: Detailed Employee 360° Dossier (8 cols) */}
          {activeEmp && (
            <div className="lg:col-span-8 space-y-4">
              {/* Dossier Header */}
              <div className="p-5 rounded-2xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl text-white shadow-md shrink-0"
                      style={{ backgroundColor: activeEmp.avatarColor || '#D99B26' }}
                    >
                      {activeEmp.nameAr ? activeEmp.nameAr.charAt(0) : 'م'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base sm:text-lg font-black text-[#1A241C] dark:text-[#F3EFE6]">
                          {activeEmp.nameAr}
                        </h2>
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-500/30">
                          UID: {activeEmp.uid}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-[#D99B26] dark:text-[#EBB34D] mt-0.5">
                        {activeEmp.jobTitleAr} • {activeEmp.companyNameAr}
                      </div>
                      <div className="text-[11px] text-[#5C665E] dark:text-[#8FA392] mt-0.5 flex items-center gap-2">
                        <span>{activeEmp.workLocation}</span>
                        <span>•</span>
                        <span>المدير المباشر: {activeEmp.directManager || '—'}</span>
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
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-l from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white text-xs font-bold shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>تعديل البيانات والعقد</span>
                    </button>
                  </div>
                </div>

                {/* Sub-Tabs strip inside Dossier */}
                <div className="mt-5 pt-3 border-t border-[#E0D9CB] dark:border-[#243628] flex items-center gap-1 overflow-x-auto no-scrollbar">
                  {[
                    { id: 'contact', label: 'البيانات والاتصال' },
                    { id: 'contract', label: 'بنود العقد والعمل' },
                    { id: 'documents', label: 'مسوغات التعيين (13)' },
                    { id: 'assets', label: 'العُهد والأجهزة' },
                    { id: 'allowances', label: 'البدلات والراتب' },
                    { id: 'bonuses', label: 'الحوافز' },
                    { id: 'deductions', label: 'الجزاءات والخصومات' },
                    { id: 'hours', label: 'ساعات العمل والدوام' },
                    { id: 'payslips', label: 'قسائم الرواتب' },
                    { id: 'calendar', label: 'أجندة الإجازات' },
                    { id: 'audit', label: 'سجل العمليات !' },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveDossierTab(tab.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        activeDossierTab === tab.id
                          ? 'bg-gradient-to-l from-amber-600 to-amber-500 text-white shadow-sm font-black'
                          : 'text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* TAB 1: CONTACT & PERSONAL DATA */}
              {activeDossierTab === 'contact' && (
                <div className="p-5 rounded-2xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] space-y-4 animate-in fade-in duration-150">
                  <div>
                    <h3 className="text-xs font-black text-[#1A241C] dark:text-[#F3EFE6] uppercase tracking-wider mb-3">
                      بيانات التواصل والهوية
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628]">
                        <span className="text-[10.5px] text-[#5C665E] dark:text-[#8FA392] block mb-0.5">الهاتف المحمول</span>
                        <span className="font-mono font-bold text-[#1A241C] dark:text-[#F3EFE6]">{activeEmp.mobile || '—'}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628]">
                        <span className="text-[10.5px] text-[#5C665E] dark:text-[#8FA392] block mb-0.5">الرقم القومي</span>
                        <span className="font-mono font-bold text-[#1A241C] dark:text-[#F3EFE6]">{activeEmp.nationalId || '—'}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628]">
                        <span className="text-[10.5px] text-[#5C665E] dark:text-[#8FA392] block mb-0.5">البريد الإلكتروني</span>
                        <span className="font-mono font-bold text-[#1A241C] dark:text-[#F3EFE6] truncate block">{activeEmp.email || '—'}</span>
                      </div>
                    </div>
                    <div className="mt-3 p-3 rounded-xl bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628] text-xs">
                      <span className="text-[10.5px] text-[#5C665E] dark:text-[#8FA392] block mb-0.5">محل الإقامة الفعلي</span>
                      <span className="font-medium text-[#1A241C] dark:text-[#F3EFE6]">{activeEmp.address || '—'}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-black text-[#1A241C] dark:text-[#F3EFE6] uppercase tracking-wider mb-3">
                      بيانات التعيين والبنك
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628]">
                        <span className="text-[10.5px] text-[#5C665E] dark:text-[#8FA392] block mb-0.5">الشركة التابعة</span>
                        <span className="font-bold text-[#1A241C] dark:text-[#F3EFE6]">{activeEmp.companyNameAr || '—'}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628]">
                        <span className="text-[10.5px] text-[#5C665E] dark:text-[#8FA392] block mb-0.5">الفرع والموقع</span>
                        <span className="font-bold text-[#1A241C] dark:text-[#F3EFE6]">{activeEmp.branchAr || activeEmp.workLocation || '—'}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628]">
                        <span className="text-[10.5px] text-[#5C665E] dark:text-[#8FA392] block mb-0.5">طريقة الصرف والبنك</span>
                        <span className="font-bold text-[#1A241C] dark:text-[#F3EFE6]">{activeEmp.bankName || 'تحويل بنكي'}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628] sm:col-span-2">
                        <span className="text-[10.5px] text-[#5C665E] dark:text-[#8FA392] block mb-0.5">رقم الحساب / الآيبان البنكي (IBAN)</span>
                        <span className="font-mono font-bold text-[#1A241C] dark:text-[#F3EFE6]">{activeEmp.bankAccount || '—'}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628]">
                        <span className="text-[10.5px] text-[#5C665E] dark:text-[#8FA392] block mb-0.5">جهة اتصال الطوارئ</span>
                        <span className="font-bold text-[#1A241C] dark:text-[#F3EFE6]">{activeEmp.emergencyContact?.name || '—'} {activeEmp.emergencyContact?.phone ? `(${activeEmp.emergencyContact.phone})` : ''}</span>
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
                        ساعات العمل: {activeEmp.workSchedule?.hoursPerDay || 8} س/يوم ({activeEmp.workSchedule?.daysPerWeek || 5} أيام/أسبوع)
                      </p>
                    </div>

                    <button
                      onClick={() => setIsEditContractOpen(true)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-l from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white text-xs font-bold shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>تعديل بنود العقد</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628]">
                      <span className="text-[10.5px] text-[#5C665E] dark:text-[#8FA392] block mb-1">الراتب الأساسي</span>
                      <div className="text-base font-black font-mono text-[#1A241C] dark:text-[#F3EFE6]">
                        {(activeEmp.salary?.basic || 0).toLocaleString('en-US')} <span className="text-xs font-sans font-bold">ج.م</span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628]">
                      <span className="text-[10.5px] text-[#5C665E] dark:text-[#8FA392] block mb-1">ساعات العمل الأسبوعية</span>
                      <div className="text-base font-black font-mono text-[#D99B26] dark:text-[#EBB34D]">
                        {activeEmp.workSchedule?.weeklyHours || 40} <span className="text-xs font-sans font-bold">ساعة/أسبوع</span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628]">
                      <span className="text-[10.5px] text-[#5C665E] dark:text-[#8FA392] block mb-1">رصيد الإجازات المتبقي</span>
                      <div className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400">
                        {activeEmp.workSchedule?.remainingDays || 21} <span className="text-xs font-sans font-bold">يوماً</span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628]">
                      <span className="text-[10.5px] text-[#5C665E] dark:text-[#8FA392] block mb-1">حالة العقد</span>
                      <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>سارٍ ومعتمد</span>
                      </div>
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
                      <p className="text-[11px] text-[#5C665E] dark:text-[#8FA392] mt-0.5">
                        استعراض الملفات الأصلية مع معاينة حية Live PDF/Image Blob Preview
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
                          <th className="p-3 text-start font-bold">تاريخ التحديث</th>
                          <th className="p-3 text-start font-bold">اسم الملف المرفوع</th>
                          <th className="p-3 text-center font-bold">الإجراءات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E0D9CB]/60 dark:divide-[#243628]/60 bg-white dark:bg-[#17231A]">
                        {(activeEmp.documents || []).map((doc) => {
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
                                {doc.updatedAt || '—'}
                              </td>
                              <td className="p-3 font-mono text-[11px] text-[#1A241C] dark:text-[#F3EFE6] truncate max-w-[140px]">
                                {doc.fileName || 'لم يُرفع بعد'}
                              </td>
                              <td className="p-3 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  {doc.fileData || doc.fileName ? (
                                    <button
                                      onClick={() => setPreviewDoc({
                                        url: doc.fileData || `/api/hr/documents/${doc.id}`,
                                        title: doc.titleAr,
                                        type: doc.fileName?.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'
                                      })}
                                      className="p-1 rounded-md text-[#5C665E] dark:text-[#8FA392] hover:text-[#EBB34D] hover:bg-[#EAE4D7] dark:hover:bg-[#111A13]"
                                      title="معاينة المستند"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                    </button>
                                  ) : null}
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

              {/* TAB 4: AUDIT LOG */}
              {activeDossierTab === 'audit' && (
                <div className="p-5 rounded-2xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E0D9CB] dark:border-[#243628]">
                    <h3 className="text-xs font-black text-[#1A241C] dark:text-[#F3EFE6] flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5 text-[#D99B26] dark:text-[#EBB34D]" />
                      <span>سجل حركات وتعديلات الملف الوظيفي (!)</span>
                    </h3>
                  </div>

                  {(activeEmp.auditLogs || []).length === 0 ? (
                    <div className="text-center py-6 text-xs text-[#5C665E] dark:text-[#8FA392]">
                      لا توجد سجلات تعديل مدونة حتى الآن
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {activeEmp.auditLogs.map(log => (
                        <div key={log.id} className="p-3 rounded-xl bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628] text-xs">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-[#1A241C] dark:text-[#F3EFE6]">{log.actionType}</span>
                            <span className="font-mono text-[10px] text-[#8FA392]">{log.timestamp}</span>
                          </div>
                          <div className="text-[11px] text-[#5C665E] dark:text-[#8FA392]">
                            الحقل المعدل: <span className="font-bold text-[#D99B26] dark:text-[#EBB34D]">{log.fieldChanged}</span>
                          </div>
                          <div className="mt-1 flex items-center gap-2 text-[10.5px]">
                            <span className="text-stone-400 line-through">{log.oldValue}</span>
                            <span>←</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">{log.newValue}</span>
                          </div>
                          <div className="mt-1 text-[10px] text-[#8FA392]">
                            المستخدم: {log.userName}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Universal Modals */}
      {activeEmp && (
        <>
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
        </>
      )}

      {/* Add New Employee Modal with Live D1 Integration & CreatableSelect */}
      <Modal
        isOpen={isAddEmployeeOpen}
        onClose={() => setIsAddEmployeeOpen(false)}
        title="إضافة ملف موظف جديد للمنظومة"
        subtitle="تسجيل البيانات الأساسية وتعيين مركز تكلفة المشروع والشركة التابعة"
        maxWidth="max-w-xl"
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
              placeholder="أدخل الاسم الرباعي بالعربية كما هو مدون في بطاقة الرقم القومي..."
              className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:border-[#EBB34D] outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#5C665E] dark:text-[#8FA392] mb-1">
                الشركة التابعة *
              </label>
              <select
                value={newEmpForm.companyId}
                onChange={(e) => {
                  const sel = companies.find(c => c.id === e.target.value);
                  setNewEmpForm(prev => ({
                    ...prev,
                    companyId: e.target.value,
                    companyNameAr: sel ? sel.nameAr : '',
                    branchAr: 'المقر الرئيسي',
                  }));
                }}
                className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:border-[#EBB34D] outline-none"
                required
              >
                {companies.map(c => (
                  <option key={c.id} value={c.id}>{c.nameAr}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#5C665E] dark:text-[#8FA392] mb-1">
                الفرع / الموقع / المشروع
              </label>
              <select
                value={newEmpForm.branchAr}
                onChange={(e) => setNewEmpForm(prev => ({ ...prev, branchAr: e.target.value, workLocation: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:border-[#EBB34D] outline-none"
              >
                <option value="المقر الرئيسي">المقر الرئيسي</option>
                {companyBranches.map((b) => (
                  <option key={b.id} value={b.nameAr}>{b.nameAr} ({b.typeAr})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#5C665E] dark:text-[#8FA392] mb-1">
                الإدارة / القسم *
              </label>
              <CreatableSelect
                category="departments"
                value={newEmpForm.departmentAr}
                onChange={(val) => setNewEmpForm(prev => ({ ...prev, departmentAr: val }))}
                placeholder="اختر أو أضف إدارة جديدة..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#5C665E] dark:text-[#8FA392] mb-1">
                المسمى الوظيفي / التخصص *
              </label>
              <CreatableSelect
                category="roles"
                value={newEmpForm.jobTitleAr}
                onChange={(val) => setNewEmpForm(prev => ({ ...prev, jobTitleAr: val }))}
                placeholder="اختر أو أضف مسمى وظيفي..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#5C665E] dark:text-[#8FA392] mb-1">
                المدير المباشر
              </label>
              <select
                value={newEmpForm.directManager}
                onChange={(e) => setNewEmpForm(prev => ({ ...prev, directManager: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:border-[#EBB34D] outline-none"
              >
                <option value="">اختر المدير المباشر إن وجد...</option>
                {employees.map(e => (
                  <option key={e.id} value={e.nameAr}>{e.nameAr} - {e.jobTitleAr}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#5C665E] dark:text-[#8FA392] mb-1">
                الراتب الأساسي (ج.م)
              </label>
              <input
                type="number"
                value={newEmpForm.basicSalary}
                onChange={(e) => setNewEmpForm({ ...newEmpForm, basicSalary: e.target.value })}
                placeholder="أدخل قيمة الراتب الأساسي الشهري..."
                className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:border-[#EBB34D] outline-none font-mono font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                placeholder="01xxxxxxxxx"
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
                placeholder="أدخل الـ 14 رقماً القومية..."
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
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-l from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white text-xs font-bold shadow-md shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>تسجيل الموظف والملف</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Live Blob PDF & Image Preview Modal */}
      {previewDoc && (
        <DocumentPreviewModal
          isOpen={true}
          onClose={() => setPreviewDoc(null)}
          title={previewDoc.title}
          fileName={previewDoc.title}
          fileData={previewDoc.url}
          mimeType={previewDoc.type}
        />
      )}
    </div>
  );
};
