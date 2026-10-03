import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useHR } from '../../../context/HRContext';
import { useTenant } from '../../../context/TenantContext';
import { useLanguage } from '../../../context/LanguageContext';
import { EmployeeProfileDrawer } from './EmployeeProfileDrawer';
import { Modal } from '../../common/Modal';
import {
  Search,
  Building2,
  Filter,
  LayoutGrid,
  Table as TableIcon,
  ChevronRight,
  UserPlus,
  MapPin
} from 'lucide-react';

export const EmployeeDirectoryView: React.FC = () => {
  const { isRtl, t } = useLanguage();
  const { employees, selectedEmployee, setSelectedEmployee, addEmployee } = useHR();
  const { companies } = useTenant();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<string>('all');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Add Employee Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEmpForm, setNewEmpForm] = useState({
    nameAr: '',
    nameEn: '',
    jobTitleAr: '',
    jobTitleEn: '',
    departmentAr: 'المكتب الفني',
    departmentEn: 'Technical Office',
    companyId: companies[0]?.id || 'comp_01',
    branchAr: 'المقر الإداري الرئيسي - الرياض',
    projectCostCenterId: 'PRJ-NEW-CAP',
    projectCostCenterName: 'مشروع الحي الحكومي - العاصمة',
    mobile: '',
    email: '',
    nationalId: '',
    hireDate: '2026-10-01',
    status: 'active' as const,
    salaryBasic: 18000,
    salaryAllowances: 4000,
    salaryDeductions: 1800,
    emergencyName: '',
    emergencyRelation: 'شقيق',
    emergencyPhone: '',
    bloodType: 'O+',
    bankIban: 'EG380002000000000000000000000',
    socialInsuranceNo: '12345678',
  });

  // Filter logic
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch =
      emp.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.jobTitleAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employeeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.mobile.includes(searchQuery) ||
      emp.nationalId.includes(searchQuery);

    const matchesCompany =
      selectedCompanyFilter === 'all' || emp.companyId === selectedCompanyFilter;

    const matchesDept =
      selectedDeptFilter === 'all' || emp.departmentAr.includes(selectedDeptFilter);

    return matchesSearch && matchesCompany && matchesDept;
  });

  // Departments list for filter
  const departments = Array.from(new Set(employees.map(e => e.departmentAr)));

  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpForm.nameAr || !newEmpForm.jobTitleAr) return;

    const targetCompany = companies.find(c => c.id === newEmpForm.companyId);

    addEmployee({
      nameAr: newEmpForm.nameAr,
      nameEn: newEmpForm.nameEn || newEmpForm.nameAr,
      jobTitleAr: newEmpForm.jobTitleAr,
      jobTitleEn: newEmpForm.jobTitleEn || newEmpForm.jobTitleAr,
      departmentAr: newEmpForm.departmentAr,
      departmentEn: newEmpForm.departmentEn,
      companyId: newEmpForm.companyId,
      companyNameAr: targetCompany ? targetCompany.nameAr : 'شركة أركان',
      branchAr: newEmpForm.branchAr,
      projectCostCenterId: newEmpForm.projectCostCenterId,
      projectCostCenterName: newEmpForm.projectCostCenterName,
      mobile: newEmpForm.mobile || '010-0000-0000',
      email: newEmpForm.email || 'employee@arkan-corp.com',
      nationalId: newEmpForm.nationalId || '29000000000000',
      hireDate: newEmpForm.hireDate,
      status: 'active',
      salary: {
        basic: Number(newEmpForm.salaryBasic),
        allowances: Number(newEmpForm.salaryAllowances),
        deductions: Number(newEmpForm.salaryDeductions),
        net: Number(newEmpForm.salaryBasic) + Number(newEmpForm.salaryAllowances) - Number(newEmpForm.salaryDeductions),
      },
      emergencyContact: {
        name: newEmpForm.emergencyName || 'جهة اتصال للطوارئ',
        relation: newEmpForm.emergencyRelation,
        phone: newEmpForm.emergencyPhone || newEmpForm.mobile,
      },
      leaveBalance: {
        annualTotal: 25,
        annualUsed: 0,
        sickTotal: 15,
        sickUsed: 0,
        monthlyAccrual: 1.75,
      },
      avatarColor: '#D99B26',
      roleLevel: 'موظف معتمد',
      bloodType: newEmpForm.bloodType,
      bankIban: newEmpForm.bankIban,
      socialInsuranceNo: newEmpForm.socialInsuranceNo,
    });

    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-4 rounded-2xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 start-3.5 text-[#5C665E] dark:text-[#8FA392]" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t(
              'بحث بالاسم، الكود، المسمى الوظيفي، الرقم القومي أو الهاتف...',
              'Search by name, code, title, national ID or mobile...'
            )}
            className="w-full ps-10 pe-4 py-2 text-xs rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] placeholder-[#5C665E] dark:placeholder-[#8FA392] focus:outline-hidden focus:ring-1 focus:ring-[#D99B26] dark:focus:ring-[#EBB34D]"
          />
        </div>

        {/* Company Dropdown Filter */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-xs">
            <Building2 className="w-3.5 h-3.5 text-[#D99B26] dark:text-[#EBB34D]" />
            <select
              value={selectedCompanyFilter}
              onChange={e => setSelectedCompanyFilter(e.target.value)}
              className="bg-transparent border-none text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] focus:outline-hidden cursor-pointer"
            >
              <option value="all" className="bg-[#FBF9F5] dark:bg-[#0E1610]">{t('جميع الشركات والكيانات', 'All Companies')}</option>
              {companies.map(c => (
                <option key={c.id} value={c.id} className="bg-[#FBF9F5] dark:bg-[#0E1610]">
                  {c.nameAr}
                </option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-xs">
            <Filter className="w-3.5 h-3.5 text-[#8FA392]" />
            <select
              value={selectedDeptFilter}
              onChange={e => setSelectedDeptFilter(e.target.value)}
              className="bg-transparent border-none text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] focus:outline-hidden cursor-pointer"
            >
              <option value="all" className="bg-[#FBF9F5] dark:bg-[#0E1610]">{t('جميع الإدارات', 'All Departments')}</option>
              {departments.map(dept => (
                <option key={dept} value={dept} className="bg-[#FBF9F5] dark:bg-[#0E1610]">
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] rounded-xl p-0.5">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'cards'
                  ? 'bg-[#EAE4D7] dark:bg-[#1F2E23] text-[#1A241C] dark:text-[#F3EFE6]'
                  : 'text-[#5C665E] dark:text-[#8FA392]'
              }`}
              title={t('عرض البطاقات', 'Grid Cards')}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table'
                  ? 'bg-[#EAE4D7] dark:bg-[#1F2E23] text-[#1A241C] dark:text-[#F3EFE6]'
                  : 'text-[#5C665E] dark:text-[#8FA392]'
              }`}
              title={t('عرض الجدول', 'Table View')}
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>

          {/* 1-Click Add Employee Trigger */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1C291E] dark:bg-[#EBB34D] text-[#F3EFE6] dark:text-[#0E1610] text-xs font-bold shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{t('إضافة موظف جديد', 'New Employee')}</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {filteredEmployees.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] space-y-2">
          <p className="text-sm font-bold text-[#1A241C] dark:text-[#F3EFE6]">{t('لا يوجد موظفون مطابقون لبحثك', 'No employees found')}</p>
          <p className="text-xs text-[#5C665E] dark:text-[#8FA392]">{t('جرّب تغيير كلمات البحث أو إعادة ضبط فلاتر الشركات', 'Try adjusting your search criteria')}</p>
        </div>
      ) : viewMode === 'cards' ? (
        /* CARDS GRID */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {filteredEmployees.map(emp => (
            <motion.div
              key={emp.id}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.15 }}
              onClick={() => setSelectedEmployee(emp)}
              className="group p-4 rounded-2xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] hover:border-[#D99B26]/50 dark:hover:border-[#EBB34D]/50 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                {/* Header: Avatar, Name & Code */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-xs shrink-0"
                      style={{ backgroundColor: emp.avatarColor || '#D99B26' }}
                    >
                      {emp.nameAr.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] group-hover:text-[#D99B26] dark:group-hover:text-[#EBB34D] transition-colors truncate">
                        {isRtl ? emp.nameAr : emp.nameEn}
                      </h4>
                      <p className="text-[11px] text-[#5C665E] dark:text-[#8FA392] truncate mt-0.5">
                        {isRtl ? emp.jobTitleAr : emp.jobTitleEn}
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-[9.5px] font-bold px-1.5 py-0.5 rounded-md bg-[#FBF9F5] dark:bg-[#0E1610] text-[#D99B26] dark:text-[#EBB34D] border border-[#E0D9CB] dark:border-[#243628] shrink-0">
                    {emp.employeeCode}
                  </span>
                </div>

                {/* Company & Branch Tag */}
                <div className="space-y-1 text-[11px] text-[#5C665E] dark:text-[#8FA392] pb-3 border-b border-[#E0D9CB]/60 dark:border-[#243628]/60">
                  <div className="flex items-center gap-1.5 truncate">
                    <Building2 className="w-3 h-3 text-[#D99B26] dark:text-[#EBB34D] shrink-0" />
                    <span className="truncate">{emp.companyNameAr}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3 h-3 text-[#8FA392] shrink-0" />
                    <span className="truncate">{emp.branchAr}</span>
                  </div>
                </div>

                {/* Key Metrics / Highlights */}
                <div className="pt-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-[#5C665E] dark:text-[#8FA392] block">{t('الإجازات المتبقية:', 'Leaves:')}</span>
                    <span className="font-mono font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                      {emp.leaveBalance.annualTotal - emp.leaveBalance.annualUsed} {t('يوم', 'days')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#5C665E] dark:text-[#8FA392] block">{t('صافي الراتب:', 'Net:')}</span>
                    <span className="font-mono font-bold text-[#059669]">
                      {emp.salary.net.toLocaleString('en-US')} ج.م
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Card Footer */}
              <div className="mt-3.5 pt-2.5 border-t border-[#E0D9CB]/60 dark:border-[#243628]/60 flex items-center justify-between text-xs">
                <span className={`inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded-full ${
                  emp.status === 'active'
                    ? 'bg-[#2A3F30] text-[#A3CFAC]'
                    : emp.status === 'on_leave'
                    ? 'bg-[#D99B26]/15 text-[#EBB34D]'
                    : 'bg-[#3F2A2A] text-[#EFA3A3]'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  <span>{emp.status === 'active' ? t('على رأس العمل', 'Active') : emp.status === 'on_leave' ? t('في إجازة', 'On Leave') : t('منتهي', 'Terminated')}</span>
                </span>

                <div className="flex items-center gap-1.5 text-xs text-[#D99B26] dark:text-[#EBB34D] font-bold group-hover:underline">
                  <span>{t('ملف الموظف', 'View Profile')}</span>
                  <ChevronRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="overflow-x-auto rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] shadow-xs">
          <table className="w-full text-start text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E0D9CB] dark:border-[#243628] bg-[#EAE4D7]/50 dark:bg-[#121B14] text-[#5C665E] dark:text-[#8FA392]">
                <th className="p-3.5 text-start font-bold">{t('الموظف', 'Employee')}</th>
                <th className="p-3.5 text-start font-bold">{t('الكود', 'Code')}</th>
                <th className="p-3.5 text-start font-bold">{t('المسمى والإدارة', 'Title & Dept')}</th>
                <th className="p-3.5 text-start font-bold">{t('الشركة التابع لها', 'Company')}</th>
                <th className="p-3.5 text-start font-bold">{t('الهاتف', 'Mobile')}</th>
                <th className="p-3.5 text-start font-bold">{t('الحالة', 'Status')}</th>
                <th className="p-3.5 text-start font-bold">{t('صافي الراتب', 'Net Salary')}</th>
                <th className="p-3.5 text-center font-bold">{t('إجراء', 'Action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0D9CB]/60 dark:divide-[#243628]/60">
              {filteredEmployees.map(emp => (
                <tr
                  key={emp.id}
                  onClick={() => setSelectedEmployee(emp)}
                  className="hover:bg-[#EAE4D7]/50 dark:hover:bg-[#1F2E23] transition-colors cursor-pointer"
                >
                  <td className="p-3.5">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-white text-xs shrink-0"
                        style={{ backgroundColor: emp.avatarColor || '#D99B26' }}
                      >
                        {emp.nameAr.charAt(0)}
                      </div>
                      <span className="font-bold text-[#1A241C] dark:text-[#F3EFE6] whitespace-nowrap">
                        {isRtl ? emp.nameAr : emp.nameEn}
                      </span>
                    </div>
                  </td>
                  <td className="p-3.5 font-mono text-[#D99B26] dark:text-[#EBB34D] font-bold">{emp.employeeCode}</td>
                  <td className="p-3.5">
                    <div className="font-medium text-[#1A241C] dark:text-[#F3EFE6]">{emp.jobTitleAr}</div>
                    <div className="text-[11px] text-[#5C665E] dark:text-[#8FA392]">{emp.departmentAr}</div>
                  </td>
                  <td className="p-3.5 text-[#5C665E] dark:text-[#8FA392]">{emp.companyNameAr}</td>
                  <td className="p-3.5 font-mono text-[#5C665E] dark:text-[#8FA392]">{emp.mobile}</td>
                  <td className="p-3.5">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      emp.status === 'active'
                        ? 'bg-[#2A3F30] text-[#A3CFAC]'
                        : emp.status === 'on_leave'
                        ? 'bg-[#D99B26]/15 text-[#EBB34D]'
                        : 'bg-[#3F2A2A] text-[#EFA3A3]'
                    }`}>
                      {emp.status === 'active' ? t('على رأس العمل', 'Active') : t('في إجازة', 'On Leave')}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono font-bold text-[#059669]">
                    {emp.salary.net.toLocaleString('en-US')} ج.م
                  </td>
                  <td className="p-3.5 text-center">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setSelectedEmployee(emp);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#EAE4D7] dark:bg-[#1F2E23] text-[#1A241C] dark:text-[#F3EFE6] font-bold hover:bg-[#D99B26] hover:text-[#0E1610] transition-colors"
                    >
                      {t('عرض', 'View')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Slide-out Dossier Drawer */}
      <EmployeeProfileDrawer
        employee={selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
      />

      {/* 1-Click Add Employee Centralized Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={t('إضافة موظف جديد إلى دليل الموارد البشرية', 'New Employee Enrollment')}
        subtitle={t('تسجيل بيانات الموظف والتعيين وربطه بالشركة ومراكز تكلفة المشروعات', 'Enroll employee, assign to company and project cost center')}
        icon={UserPlus}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreateEmployee} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[#5C665E] dark:text-[#8FA392] font-bold mb-1">
                {t('اسم الموظف (عربي) *', 'Employee Name (Arabic) *')}
              </label>
              <input
                type="text"
                required
                value={newEmpForm.nameAr}
                onChange={e => setNewEmpForm({ ...newEmpForm, nameAr: e.target.value })}
                placeholder="مثال: م. مصطفى الجوهري"
                className="w-full p-2.5 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-hidden focus:border-[#D99B26]"
              />
            </div>
            <div>
              <label className="block text-[#5C665E] dark:text-[#8FA392] font-bold mb-1">
                {t('الاسم بالإنجليزية', 'Employee Name (English)')}
              </label>
              <input
                type="text"
                value={newEmpForm.nameEn}
                onChange={e => setNewEmpForm({ ...newEmpForm, nameEn: e.target.value })}
                placeholder="e.g. Eng. Moustafa El-Gohary"
                className="w-full p-2.5 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-hidden focus:border-[#D99B26]"
              />
            </div>

            <div>
              <label className="block text-[#5C665E] dark:text-[#8FA392] font-bold mb-1">
                {t('المسمى الوظيفي *', 'Job Title *')}
              </label>
              <input
                type="text"
                required
                value={newEmpForm.jobTitleAr}
                onChange={e => setNewEmpForm({ ...newEmpForm, jobTitleAr: e.target.value })}
                placeholder="مثال: مهندس جودة موقع أول"
                className="w-full p-2.5 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-hidden focus:border-[#D99B26]"
              />
            </div>

            <div>
              <label className="block text-[#5C665E] dark:text-[#8FA392] font-bold mb-1">
                {t('الشركة التابع لها *', 'Company *')}
              </label>
              <select
                value={newEmpForm.companyId}
                onChange={e => setNewEmpForm({ ...newEmpForm, companyId: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-hidden focus:border-[#D99B26] font-bold cursor-pointer"
              >
                {companies.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nameAr}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[#5C665E] dark:text-[#8FA392] font-bold mb-1">
                {t('الإدارة / القسم *', 'Department *')}
              </label>
              <input
                type="text"
                required
                value={newEmpForm.departmentAr}
                onChange={e => setNewEmpForm({ ...newEmpForm, departmentAr: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-hidden focus:border-[#D99B26]"
              />
            </div>

            <div>
              <label className="block text-[#5C665E] dark:text-[#8FA392] font-bold mb-1">
                {t('مشروع مركز التكلفة المرتبط', 'Linked Project Cost Center')}
              </label>
              <input
                type="text"
                value={newEmpForm.projectCostCenterName}
                onChange={e => setNewEmpForm({ ...newEmpForm, projectCostCenterName: e.target.value })}
                placeholder="مثال: مشروع أبراج العلمين الشاطئية"
                className="w-full p-2.5 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-hidden focus:border-[#D99B26]"
              />
            </div>

            <div>
              <label className="block text-[#5C665E] dark:text-[#8FA392] font-bold mb-1">
                {t('رقم الهاتف المحمول *', 'Mobile Phone *')}
              </label>
              <input
                type="text"
                required
                value={newEmpForm.mobile}
                onChange={e => setNewEmpForm({ ...newEmpForm, mobile: e.target.value })}
                placeholder="010-1234-5678"
                className="w-full p-2.5 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-hidden focus:border-[#D99B26] font-mono"
              />
            </div>

            <div>
              <label className="block text-[#5C665E] dark:text-[#8FA392] font-bold mb-1">
                {t('الرقم القومي / الإقامة *', 'National ID *')}
              </label>
              <input
                type="text"
                required
                value={newEmpForm.nationalId}
                onChange={e => setNewEmpForm({ ...newEmpForm, nationalId: e.target.value })}
                placeholder="29501010101234"
                className="w-full p-2.5 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-hidden focus:border-[#D99B26] font-mono"
              />
            </div>

            <div>
              <label className="block text-[#5C665E] dark:text-[#8FA392] font-bold mb-1">
                {t('الراتب الأساسي (ج.م) *', 'Basic Salary (EGP) *')}
              </label>
              <input
                type="number"
                required
                value={newEmpForm.salaryBasic}
                onChange={e => setNewEmpForm({ ...newEmpForm, salaryBasic: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-hidden focus:border-[#D99B26] font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-[#5C665E] dark:text-[#8FA392] font-bold mb-1">
                {t('إجمالي البدلات المعتمدة (ج.م)', 'Total Allowances (EGP)')}
              </label>
              <input
                type="number"
                value={newEmpForm.salaryAllowances}
                onChange={e => setNewEmpForm({ ...newEmpForm, salaryAllowances: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-hidden focus:border-[#D99B26] font-mono font-bold text-emerald-600 dark:text-emerald-400"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#E0D9CB] dark:border-[#243628] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-[#EAE4D7] dark:bg-[#1F2E23] text-[#1A241C] dark:text-[#F3EFE6] font-bold text-xs"
            >
              {t('إلغاء', 'Cancel')}
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-[#1C291E] dark:bg-[#EBB34D] text-[#F3EFE6] dark:text-[#0E1610] font-bold text-xs shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              {t('حفظ وتسجيل الموظف', 'Save & Enroll')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
