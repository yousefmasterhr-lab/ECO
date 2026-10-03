import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Employee, useHR } from '../../../context/HRContext';
import { useReception } from '../../../context/ReceptionContext';
import { useLanguage } from '../../../context/LanguageContext';
import {
  X,
  Building2,
  Phone,
  Mail,
  CreditCard,
  Shield,
  Clock,
  Laptop,
  Car,
  FileText,
  HeartHandshake,
  ConciergeBell,
  MapPin,
  HardHat
} from 'lucide-react';

interface EmployeeProfileDrawerProps {
  employee: Employee | null;
  onClose: () => void;
}

export const EmployeeProfileDrawer: React.FC<EmployeeProfileDrawerProps> = ({ employee, onClose }) => {
  const { isRtl, t } = useLanguage();
  const { custodyItems, advances, contracts, attendanceRecords } = useHR();
  const { visitors } = useReception();
  const [activeTab, setActiveTab] = useState<'info' | 'attendance' | 'salary' | 'custody' | 'reception'>('info');

  if (!employee) return null;

  // Cross-module data queries
  const empCustody = custodyItems.filter(c => c.employeeId === employee.id && c.status === 'in_custody');
  const empAdvance = advances.find(a => a.employeeId === employee.id && a.status === 'active');
  const empContract = contracts.find(c => c.employeeId === employee.id);
  const empAttendance = attendanceRecords.filter(a => a.employeeId === employee.id);

  // Cross-module link to Front Desk (Reception): check if any visitors came to visit this employee
  const empVisitors = visitors.filter(v =>
    v.hostEmployeeAr.includes(employee.nameAr) ||
    employee.nameAr.includes(v.hostEmployeeAr)
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
        />

        {/* Drawer Panel */}
        <motion.div
          initial={{ x: isRtl ? -450 : 450, opacity: 0.8 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: isRtl ? -450 : 450, opacity: 0 }}
          transition={{ type: 'spring', damping: 30, stiffness: 350 }}
          className="relative z-10 w-full max-w-lg bg-[#FBF9F5] dark:bg-[#0E1610] border-s border-[#E0D9CB] dark:border-[#243628] h-full shadow-2xl flex flex-col overflow-hidden text-start"
        >
          {/* Header Profile Hero */}
          <div className="p-6 border-b border-[#E0D9CB] dark:border-[#243628] bg-gradient-to-b from-[#F3EFE6] to-[#FBF9F5] dark:from-[#17231A] dark:to-[#0E1610] shrink-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black text-white shadow-md shrink-0"
                  style={{ backgroundColor: employee.avatarColor || '#EBB34D' }}
                >
                  {employee.nameAr.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base sm:text-lg font-black text-[#1A241C] dark:text-[#F3EFE6] truncate">
                      {isRtl ? employee.nameAr : employee.nameEn}
                    </h2>
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#D99B26]/15 text-[#D99B26] dark:text-[#EBB34D] border border-[#D99B26]/30">
                      {employee.employeeCode}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-[#5C665E] dark:text-[#8FA392] truncate mt-0.5">
                    {isRtl ? employee.jobTitleAr : employee.jobTitleEn}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-[#5C665E] dark:text-[#8FA392] mt-1.5 flex-wrap">
                    <span className="flex items-center gap-1 font-medium">
                      <Building2 className="w-3 h-3 text-[#D99B26] dark:text-[#EBB34D]" />
                      <span>{employee.companyNameAr}</span>
                    </span>
                    <span className="text-[#E0D9CB] dark:text-[#243628]">•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#8FA392]" />
                      <span>{employee.branchAr}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23] transition-colors"
                aria-label={t('إغلاق', 'Close')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Actions (Call / Email / Project Tag) */}
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[#E0D9CB]/60 dark:border-[#243628]/60 flex-wrap">
              <a
                href={`tel:${employee.mobile}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EAE4D7] dark:bg-[#1F2E23] text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] hover:bg-[#D99B26]/20 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-[#D99B26] dark:text-[#EBB34D]" />
                <span className="font-mono">{employee.mobile}</span>
              </a>
              <a
                href={`mailto:${employee.email}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EAE4D7] dark:bg-[#1F2E23] text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] hover:bg-[#D99B26]/20 transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-[#D99B26] dark:text-[#EBB34D]" />
                <span className="truncate max-w-[130px] font-mono">{employee.email}</span>
              </a>
              {employee.projectCostCenterName && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#3B7A57]/15 text-xs font-bold text-[#3B7A57] dark:text-[#8FA392] border border-[#3B7A57]/30 ms-auto">
                  <HardHat className="w-3.5 h-3.5 text-[#EBB34D]" />
                  <span>{employee.projectCostCenterName}</span>
                </span>
              )}
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-1 mt-4 overflow-x-auto pb-1 text-xs font-bold">
              {[
                { id: 'info', label: t('البيانات الأساسية', 'Profile Info') },
                { id: 'attendance', label: t('الحضور والإجازات', 'Attendance') },
                { id: 'salary', label: t('الراتب والمالية', 'Payroll & Dues') },
                { id: 'custody', label: `${t('العهد', 'Custody')} (${empCustody.length})` },
                { id: 'reception', label: `${t('الزوار والاستقبال', 'Visitors')} (${empVisitors.length})` },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'bg-[#1C291E] dark:bg-[#EBB34D] text-[#F3EFE6] dark:text-[#0E1610] shadow-xs'
                      : 'text-[#5C665E] dark:text-[#8FA392] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Drawer Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* TAB 1: Profile Info */}
            {activeTab === 'info' && (
              <div className="space-y-4">
                {/* Official IDs & Status */}
                <div className="p-4 rounded-xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] space-y-3">
                  <div className="text-xs font-bold text-[#D99B26] dark:text-[#EBB34D] flex items-center gap-1.5">
                    <Shield className="w-4 h-4" />
                    <span>{t('الهوية والبيانات الرسمية', 'Official Identity & Registry')}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[#5C665E] dark:text-[#8FA392] block">{t('الرقم القومي / الإقامة:', 'National ID:')}</span>
                      <span className="font-mono font-bold text-[#1A241C] dark:text-[#F3EFE6]">{employee.nationalId}</span>
                    </div>
                    <div>
                      <span className="text-[#5C665E] dark:text-[#8FA392] block">{t('الرقم التأميني:', 'Social Insurance:')}</span>
                      <span className="font-mono font-bold text-[#1A241C] dark:text-[#F3EFE6]">{employee.socialInsuranceNo}</span>
                    </div>
                    <div>
                      <span className="text-[#5C665E] dark:text-[#8FA392] block">{t('تاريخ التعيين:', 'Hire Date:')}</span>
                      <span className="font-mono font-semibold text-[#1A241C] dark:text-[#F3EFE6]">{employee.hireDate}</span>
                    </div>
                    <div>
                      <span className="text-[#5C665E] dark:text-[#8FA392] block">{t('فصيلة الدم:', 'Blood Type:')}</span>
                      <span className="font-bold text-[#1A241C] dark:text-[#F3EFE6]">{employee.bloodType}</span>
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="p-4 rounded-xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] space-y-2">
                  <div className="text-xs font-bold text-[#D99B26] dark:text-[#EBB34D] flex items-center gap-1.5">
                    <HeartHandshake className="w-4 h-4" />
                    <span>{t('جهة الاتصال في حالات الطوارئ', 'Emergency Contact')}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1">
                    <div>
                      <div className="font-bold text-[#1A241C] dark:text-[#F3EFE6]">{employee.emergencyContact.name}</div>
                      <div className="text-[11px] text-[#5C665E] dark:text-[#8FA392]">{t('صلة القرابة:', 'Relation:')} {employee.emergencyContact.relation}</div>
                    </div>
                    <a
                      href={`tel:${employee.emergencyContact.phone}`}
                      className="px-3 py-1.5 rounded-lg bg-[#D99B26]/15 hover:bg-[#D99B26]/25 text-[#D99B26] dark:text-[#EBB34D] font-mono font-bold text-xs"
                    >
                      {employee.emergencyContact.phone}
                    </a>
                  </div>
                </div>

                {/* Contract Status Overview */}
                {empContract && (
                  <div className="p-4 rounded-xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#1A241C] dark:text-[#F3EFE6] flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-[#D99B26] dark:text-[#EBB34D]" />
                        <span>{t('العقد والوثائق القانونية', 'Employment Contract')}</span>
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        empContract.status === 'valid'
                          ? 'bg-[#2A3F30] text-[#A3CFAC]'
                          : empContract.status === 'expiring_soon'
                          ? 'bg-[#D99B26]/15 text-[#EBB34D]'
                          : 'bg-[#3F2A2A] text-[#EFA3A3]'
                      }`}>
                        {empContract.status === 'valid' ? t('ساري', 'Valid') : empContract.status === 'expiring_soon' ? t('يقترب من الانتهاء', 'Expiring Soon') : t('منتهي', 'Expired')}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div>
                        <span className="text-[#5C665E] dark:text-[#8FA392] text-[11px] block">{t('نهاية العقد:', 'Contract End:')}</span>
                        <span className="font-mono font-semibold">{empContract.endDate}</span>
                      </div>
                      <div>
                        <span className="text-[#5C665E] dark:text-[#8FA392] text-[11px] block">{t('التأمين الطبي:', 'Medical Insurance:')}</span>
                        <span className="font-semibold truncate block">{empContract.medicalGrade}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Attendance & Leaves */}
            {activeTab === 'attendance' && (
              <div className="space-y-4">
                {/* Leave Balances Progress Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628]">
                    <div className="flex items-center justify-between text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1.5">
                      <span>{t('الإجازات السنوية', 'Annual Leaves')}</span>
                      <span className="text-[#D99B26] dark:text-[#EBB34D]">
                        {employee.leaveBalance.annualTotal - employee.leaveBalance.annualUsed} {t('يوم متبقي', 'days left')}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#E0D9CB] dark:bg-[#243628] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#D99B26] dark:bg-[#EBB34D]"
                        style={{ width: `${(employee.leaveBalance.annualUsed / employee.leaveBalance.annualTotal) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-[#5C665E] dark:text-[#8FA392] mt-1.5 font-medium">
                      <span>{t('مستهلك:', 'Used:')} {employee.leaveBalance.annualUsed}</span>
                      <span>{t('الإجمالي:', 'Total:')} {employee.leaveBalance.annualTotal}</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628]">
                    <div className="flex items-center justify-between text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1.5">
                      <span>{t('الإجازات المرضية', 'Sick Leaves')}</span>
                      <span className="text-[#059669]">
                        {employee.leaveBalance.sickTotal - employee.leaveBalance.sickUsed} {t('يوم', 'days')}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#E0D9CB] dark:bg-[#243628] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#059669]"
                        style={{ width: `${(employee.leaveBalance.sickUsed / employee.leaveBalance.sickTotal) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-[#5C665E] dark:text-[#8FA392] mt-1.5 font-medium">
                      <span>{t('مستهلك:', 'Used:')} {employee.leaveBalance.sickUsed}</span>
                      <span>{t('الإجمالي:', 'Total:')} {employee.leaveBalance.sickTotal}</span>
                    </div>
                  </div>
                </div>

                {/* Recent Punch Log */}
                <div className="p-4 rounded-xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] space-y-2.5">
                  <h4 className="text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#D99B26] dark:text-[#EBB34D]" />
                    <span>{t('سجل البصمة والحضور الأخير', 'Recent Punch Log')}</span>
                  </h4>
                  {empAttendance.length === 0 ? (
                    <div className="text-xs text-[#5C665E] dark:text-[#8FA392] py-2">{t('لا توجد سجلات مسجلة اليوم', 'No attendance records today')}</div>
                  ) : (
                    empAttendance.map(att => (
                      <div key={att.id} className="flex items-center justify-between p-2 rounded-lg bg-[#FBF9F5] dark:bg-[#0E1610] text-xs">
                        <div>
                          <div className="font-semibold text-[#1A241C] dark:text-[#F3EFE6]">{att.workLocation}</div>
                          <div className="text-[10px] text-[#5C665E] dark:text-[#8FA392] font-mono">{att.date}</div>
                        </div>
                        <div className="text-end">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            att.status === 'present'
                              ? 'bg-[#2A3F30] text-[#A3CFAC]'
                              : att.status === 'mission'
                              ? 'bg-[#D99B26]/15 text-[#EBB34D]'
                              : 'bg-[#3F2A2A] text-[#EFA3A3]'
                          }`}>
                            {att.status === 'present' ? 'حاضر' : att.status === 'mission' ? 'مأمورية' : 'إجازة'}
                          </span>
                          <div className="text-[10.5px] font-mono text-[#5C665E] dark:text-[#8FA392] mt-0.5">
                            {att.checkIn} {att.checkOut && `- ${att.checkOut}`}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: Salary & Dues */}
            {activeTab === 'salary' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] space-y-3">
                  <div className="text-xs font-bold text-[#D99B26] dark:text-[#EBB34D] flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4" />
                    <span>{t('هيكل الراتب الشهري المعتمد', 'Monthly Salary Structure')}</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-[#E0D9CB]/40 dark:border-[#243628]/40">
                      <span className="text-[#5C665E] dark:text-[#8FA392]">{t('الراتب الأساسي:', 'Basic Salary:')}</span>
                      <span className="font-mono font-bold text-[#1A241C] dark:text-[#F3EFE6]">{employee.salary.basic.toLocaleString('en-US')} ج.م</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#E0D9CB]/40 dark:border-[#243628]/40">
                      <span className="text-[#5C665E] dark:text-[#8FA392]">{t('إجمالي البدلات والمزايا:', 'Allowances:')}</span>
                      <span className="font-mono font-bold text-[#059669]">+{employee.salary.allowances.toLocaleString('en-US')} ج.م</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#E0D9CB]/40 dark:border-[#243628]/40">
                      <span className="text-[#5C665E] dark:text-[#8FA392]">{t('الاستقطاعات (تأمينات وضريبة):', 'Deductions:')}</span>
                      <span className="font-mono font-bold text-rose-500">-{employee.salary.deductions.toLocaleString('en-US')} ج.م</span>
                    </div>
                    <div className="flex justify-between py-2 bg-[#EAE4D7] dark:bg-[#1F2E23] px-3 rounded-xl font-bold">
                      <span className="text-[#1A241C] dark:text-[#F3EFE6]">{t('صافي الراتب المستحق:', 'Net Payable Salary:')}</span>
                      <span className="font-mono text-sm text-[#D99B26] dark:text-[#EBB34D]">{employee.salary.net.toLocaleString('en-US')} ج.م</span>
                    </div>
                  </div>
                </div>

                {/* Bank Account */}
                <div className="p-4 rounded-xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] space-y-1.5 text-xs">
                  <div className="font-bold text-[#1A241C] dark:text-[#F3EFE6]">{t('البيانات المصرفية للتحويل:', 'Bank Transfer Account:')}</div>
                  <div className="font-mono text-[11px] text-[#5C665E] dark:text-[#8FA392] bg-[#FBF9F5] dark:bg-[#0E1610] p-2.5 rounded-lg border border-[#E0D9CB] dark:border-[#243628] break-all">
                    {employee.bankIban}
                  </div>
                </div>

                {/* Active Advance Warning if any */}
                {empAdvance && (
                  <div className="p-3.5 rounded-xl bg-[#D99B26]/10 border border-[#D99B26]/30 text-xs flex items-center justify-between">
                    <div>
                      <div className="font-bold text-[#D99B26] dark:text-[#EBB34D]">{t('سلفة مالية نشطة', 'Active Employee Loan')}</div>
                      <div className="text-[11px] text-[#5C665E] dark:text-[#8FA392] mt-0.5">{empAdvance.reason}</div>
                    </div>
                    <div className="text-end font-mono">
                      <span className="text-rose-500 font-bold block">{empAdvance.remainingAmount.toLocaleString('en-US')} ج.م</span>
                      <span className="text-[10px] text-[#8FA392]">{empAdvance.installmentsRemaining} أقساط متبقية</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: Custody Items */}
            {activeTab === 'custody' && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] flex items-center justify-between">
                  <span>{t('العهد العينية والأصول المسلمة للموظف', 'Physical Assets in Custody')}</span>
                  <span className="text-[11px] font-mono text-[#D99B26] dark:text-[#EBB34D]">{empCustody.length} عهد</span>
                </div>
                {empCustody.length === 0 ? (
                  <div className="p-6 rounded-xl text-center bg-[#F3EFE6] dark:bg-[#17231A] text-xs text-[#5C665E] dark:text-[#8FA392]">
                    {t('لا توجد عهد عينية مسجلة في ذمة الموظف حالياً', 'No assets in custody for this employee')}
                  </div>
                ) : (
                  empCustody.map(item => (
                    <div key={item.id} className="p-3.5 rounded-xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {item.assetType === 'laptop' ? (
                            <Laptop className="w-4 h-4 text-[#D99B26] dark:text-[#EBB34D]" />
                          ) : item.assetType === 'vehicle' ? (
                            <Car className="w-4 h-4 text-[#059669]" />
                          ) : (
                            <Shield className="w-4 h-4 text-[#0D9488]" />
                          )}
                          <span className="font-bold text-[#1A241C] dark:text-[#F3EFE6]">{item.assetNameAr}</span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#2A3F30] text-[#A3CFAC]">
                          {t('في العهدة', 'In Custody')}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#5C665E] dark:text-[#8FA392] grid grid-cols-2 gap-1 pt-1">
                        <div>{t('الرقم التسلسلي:', 'Serial:')} <span className="font-mono text-[#1A241C] dark:text-[#F3EFE6]">{item.serialNumber}</span></div>
                        <div>{t('تاريخ التسليم:', 'Issued:')} <span className="font-mono text-[#1A241C] dark:text-[#F3EFE6]">{item.issueDate}</span></div>
                      </div>
                      {item.notes && (
                        <div className="text-[10.5px] text-[#8FA392] italic pt-1 border-t border-[#E0D9CB]/40 dark:border-[#243628]/40">
                          {item.notes}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 5: Reception & Front Desk Linkage */}
            {activeTab === 'reception' && (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-[#D99B26]/10 border border-[#D99B26]/30 text-xs">
                  <div className="font-bold text-[#D99B26] dark:text-[#EBB34D] flex items-center gap-1.5 mb-1">
                    <ConciergeBell className="w-4 h-4" />
                    <span>{t('الربط المباشر مع مكتب الاستقبال والزوار', 'Direct Front Desk & Visitor Linkage')}</span>
                  </div>
                  <p className="text-[11px] text-[#5C665E] dark:text-[#8FA392] leading-relaxed">
                    {t(
                      'يتم ربط أي زائر يقوم بالتسجيل في مكتب الاستقبال باسم هذا الموظف مباشرة في هذا السجل تلقائياً.',
                      'Any visitors registered at the front desk requesting this employee appear in this dossier automatically.'
                    )}
                  </p>
                </div>

                <div className="space-y-2">
                  {empVisitors.length === 0 ? (
                    <div className="p-6 rounded-xl text-center bg-[#F3EFE6] dark:bg-[#17231A] text-xs text-[#5C665E] dark:text-[#8FA392]">
                      {t('لم يتم تسجيل أي زيارات واردة لهذا الموظف خلال الفترة الحالية', 'No incoming visits recorded for this employee recently')}
                    </div>
                  ) : (
                    empVisitors.map(v => (
                      <div key={v.id} className="p-3.5 rounded-xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#1A241C] dark:text-[#F3EFE6]">{v.nameAr}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            v.status === 'checked_in'
                              ? 'bg-[#2A3F30] text-[#A3CFAC]'
                              : 'bg-[#EAE4D7] dark:bg-[#1F2E23] text-[#5C665E] dark:text-[#8FA392]'
                          }`}>
                            {v.status === 'checked_in' ? 'متواجد بالمنشأة' : 'اكتملت الزيارة'}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#5C665E] dark:text-[#8FA392]">
                          <span>{t('الجهة:', 'Company:')} {v.company}</span> • <span>{t('الغرض:', 'Purpose:')} {v.purposeAr}</span>
                        </div>
                        <div className="text-[10.5px] font-mono text-[#8FA392] pt-1 flex justify-between">
                          <span>{t('وقت الدخول:', 'Entry:')} {v.entryTime}</span>
                          <span>{t('شارة رقم:', 'Badge #')} {v.badgeNumber}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] flex items-center justify-between text-xs">
            <span className="text-[#5C665E] dark:text-[#8FA392] font-mono text-[11px]">
              ID: {employee.id} • {employee.companyNameAr.split(' ')[0]}
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#1C291E] dark:bg-[#EBB34D] text-[#F3EFE6] dark:text-[#0E1610] font-bold text-xs shadow-xs"
            >
              {t('إغلاق الملف', 'Close Dossier')}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
