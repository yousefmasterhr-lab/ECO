import React, { useState } from 'react';
import { useHR, LeaveType, LeaveStatus } from '../../../context/HRContext';
import { useLanguage } from '../../../context/LanguageContext';
import { Modal } from '../../common/Modal';
import {
  Calendar,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  FileCheck2,
  Filter,
  Check,
  X,
  Sparkles,
  Plane,
  HeartPulse,
  Briefcase
} from 'lucide-react';

export const LeavesManagementView: React.FC = () => {
  const { t } = useLanguage();
  const {
    employees,
    leaveRequests,
    submitLeaveRequest,
    updateLeaveStatus,
    showToast,
  } = useHR();

  // Filters
  const [statusFilter, setStatusFilter] = useState<'all' | LeaveStatus>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | LeaveType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isNewLeaveModalOpen, setIsNewLeaveModalOpen] = useState(false);
  const [newLeaveForm, setNewLeaveForm] = useState({
    employeeId: employees[0]?.id || '',
    leaveType: 'annual' as LeaveType,
    startDate: '2026-10-15',
    endDate: '2026-10-18',
    reason: '',
  });

  // Calculate days
  const calculateDays = (start: string, end: string) => {
    const d1 = new Date(start);
    const d2 = new Date(end);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return isNaN(diffDays) ? 1 : diffDays;
  };

  // Submit Leave Request
  const handleSubmitNewLeave = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find(e => e.id === newLeaveForm.employeeId);
    if (!emp) return;

    const days = calculateDays(newLeaveForm.startDate, newLeaveForm.endDate);
    submitLeaveRequest({
      employeeId: emp.id,
      employeeName: emp.nameAr,
      jobTitleAr: emp.jobTitleAr,
      type: newLeaveForm.leaveType,
      startDate: newLeaveForm.startDate,
      endDate: newLeaveForm.endDate,
      daysCount: days,
      reason: newLeaveForm.reason || 'إجازة دورية مجدولة',
    });
    setIsNewLeaveModalOpen(false);
    showToast('تم رفع طلب الإجازة بنجاح وهو قيد الاعتماد الإداري');
  };

  // Filtered requests
  const filteredRequests = leaveRequests.filter(req => {
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    const matchesType = typeFilter === 'all' || req.type === typeFilter;
    const matchesSearch =
      req.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.jobTitleAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.reason.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesType && matchesSearch;
  });

  // Stats
  const pendingCount = leaveRequests.filter(r => r.status === 'pending').length;
  const approvedCount = leaveRequests.filter(r => r.status === 'approved').length;
  const totalDaysApproved = leaveRequests
    .filter(r => r.status === 'approved')
    .reduce((acc, curr) => acc + curr.daysCount, 0);

  const getLeaveTypeBadge = (type: LeaveType) => {
    switch (type) {
      case 'annual':
        return { label: 'سنوية اعتيادية', color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30', icon: Plane };
      case 'sick':
        return { label: 'مرضية معتمدة', color: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30', icon: HeartPulse };
      case 'casual':
        return { label: 'عارضة طارئة', color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30', icon: Sparkles };
      case 'mission':
        return { label: 'مأمورية موقع خارجية', color: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30', icon: Briefcase };
      default:
        return { label: 'بدون أجر', color: 'bg-stone-500/15 text-stone-600 dark:text-stone-400 border-stone-500/30', icon: Clock };
    }
  };

  const getStatusBadge = (status: LeaveStatus) => {
    switch (status) {
      case 'approved':
        return { label: 'معتمدة ومقيدة', color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30', icon: CheckCircle2 };
      case 'pending':
        return { label: 'قيد المراجعة', color: 'bg-amber-500/15 text-[#D99B26] dark:text-[#EBB34D] border-amber-500/30', icon: Clock };
      case 'rejected':
        return { label: 'مرفوضة إدارياً', color: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30', icon: XCircle };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#5C665E] dark:text-[#8FA392]">
              {t('الطلبات المعلقة للاعتماد', 'Pending Leave Requests')}
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-[#D99B26] dark:text-[#EBB34D] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#1A241C] dark:text-[#F3EFE6] font-mono">
            {pendingCount}
          </div>
          <p className="text-[11px] text-[#5C665E] dark:text-[#8FA392] mt-1">
            {t('تتطلب توقيع مدير الإدارة المباشر', 'Awaiting direct supervisor sign-off')}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#5C665E] dark:text-[#8FA392]">
              {t('الإجازات المعتمدة للشهر', 'Approved Leaves This Month')}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {approvedCount}
          </div>
          <p className="text-[11px] text-[#5C665E] dark:text-[#8FA392] mt-1">
            {t('مسجلة ومخصومة من الرصيد الدوري', 'Deducted from annual balance')}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#5C665E] dark:text-[#8FA392]">
              {t('إجمالي أيام الغياب المأذون', 'Total Authorized Leave Days')}
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#0D9488]/15 text-[#0D9488] dark:text-[#2DD4BF] flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#1A241C] dark:text-[#F3EFE6] font-mono">
            {totalDaysApproved} <span className="text-xs font-sans font-bold">يوم عمل</span>
          </div>
          <p className="text-[11px] text-[#5C665E] dark:text-[#8FA392] mt-1">
            {t('مغطاة بالكامل بالبدلاء في المواقع', 'Covered by active site deputies')}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#5C665E] dark:text-[#8FA392]">
              {t('رصيد الإجازات السنوية القياسي', 'Standard Annual Entitlement')}
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#EBB34D]/15 text-[#D99B26] dark:text-[#EBB34D] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#D99B26] dark:text-[#EBB34D] font-mono">
            21 / 30 <span className="text-xs font-sans font-bold">يوم/سنة</span>
          </div>
          <p className="text-[11px] text-[#5C665E] dark:text-[#8FA392] mt-1">
            {t('وفقاً للمادة 47 من قانون العمل المصري', 'Egyptian Labor Law Art. 47')}
          </p>
        </div>
      </div>

      {/* Control Bar: Filters & Action Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628]">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search Input */}
          <div className="relative min-w-[200px] flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 absolute start-3 top-1/2 -translate-y-1/2 text-[#5C665E] dark:text-[#8FA392]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('بحث بالموظف أو السبب...', 'Search employee or reason...')}
              className="w-full ps-9 pe-3 py-1.5 rounded-xl text-xs bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none focus:border-[#D99B26] dark:focus:border-[#EBB34D]"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-[#5C665E] dark:text-[#8FA392]" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-xl text-xs bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none focus:border-[#D99B26] dark:focus:border-[#EBB34D]"
            >
              <option value="all">كل حالات الاعتماد</option>
              <option value="pending">قيد المراجعة ({pendingCount})</option>
              <option value="approved">معتمدة ({approvedCount})</option>
              <option value="rejected">مرفوضة</option>
            </select>
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-xl text-xs bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none focus:border-[#D99B26] dark:focus:border-[#EBB34D]"
          >
            <option value="all">كل أنواع الإجازات</option>
            <option value="annual">إجازة اعتيادية سنوية</option>
            <option value="sick">إجازة مرضية معتمدة</option>
            <option value="casual">إجازة عارضة طارئة</option>
            <option value="mission">مأمورية عمل خارجية</option>
          </select>
        </div>

        {/* Action Button */}
        <button
          onClick={() => setIsNewLeaveModalOpen(true)}
          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#1C291E] dark:bg-[#EBB34D] text-[#F3EFE6] dark:text-[#0E1610] text-xs font-bold shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t('تقديم طلب إجازة جديد', 'New Leave Request')}</span>
        </button>
      </div>

      {/* Leave Requests Table */}
      <div className="rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start border-collapse">
            <thead>
              <tr className="border-b border-[#E0D9CB] dark:border-[#243628] bg-[#EAE4D7]/70 dark:bg-[#1F2E23]/70 text-[#5C665E] dark:text-[#8FA392]">
                <th className="p-3.5 text-start font-bold">{t('الموظف', 'Employee')}</th>
                <th className="p-3.5 text-start font-bold">{t('نوع الإجازة', 'Type')}</th>
                <th className="p-3.5 text-start font-bold">{t('من تاريخ', 'Start Date')}</th>
                <th className="p-3.5 text-start font-bold">{t('إلى تاريخ', 'End Date')}</th>
                <th className="p-3.5 text-center font-bold">{t('المدة', 'Days')}</th>
                <th className="p-3.5 text-start font-bold">{t('السبب وملاحظات العمل', 'Reason / Notes')}</th>
                <th className="p-3.5 text-center font-bold">{t('الحالة', 'Status')}</th>
                <th className="p-3.5 text-center font-bold">{t('الإجراء الإداري', 'Action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0D9CB]/60 dark:divide-[#243628]/60">
              {filteredRequests.map(req => {
                const typeBadge = getLeaveTypeBadge(req.type);
                const statusBadge = getStatusBadge(req.status);
                const TypeIcon = typeBadge.icon;
                const StatusIcon = statusBadge.icon;

                return (
                  <tr
                    key={req.id}
                    className="hover:bg-[#EAE4D7]/40 dark:hover:bg-[#1F2E23]/40 transition-colors"
                  >
                    <td className="p-3.5">
                      <div className="font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                        {req.employeeName}
                      </div>
                      <div className="text-[11px] text-[#5C665E] dark:text-[#8FA392]">
                        {req.jobTitleAr}
                      </div>
                    </td>

                    <td className="p-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${typeBadge.color}`}>
                        <TypeIcon className="w-3 h-3" />
                        <span>{typeBadge.label}</span>
                      </span>
                    </td>

                    <td className="p-3.5 font-mono text-[#1A241C] dark:text-[#F3EFE6]">
                      {req.startDate}
                    </td>

                    <td className="p-3.5 font-mono text-[#1A241C] dark:text-[#F3EFE6]">
                      {req.endDate}
                    </td>

                    <td className="p-3.5 text-center">
                      <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-lg bg-[#EAE4D7] dark:bg-[#0E1610] text-[#1A241C] dark:text-[#F3EFE6]">
                        {req.daysCount} {req.daysCount === 1 ? 'يوم' : 'أيام'}
                      </span>
                    </td>

                    <td className="p-3.5 max-w-xs text-[#5C665E] dark:text-[#8FA392]">
                      <div className="truncate font-medium">{req.reason}</div>
                      <div className="text-[10.5px] text-[#8FA392] dark:text-[#5C665E]">
                        مقدم في: {req.requestDate}
                      </div>
                    </td>

                    <td className="p-3.5 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusBadge.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        <span>{statusBadge.label}</span>
                      </span>
                    </td>

                    <td className="p-3.5 text-center">
                      {req.status === 'pending' ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              updateLeaveStatus(req.id, 'approved');
                              showToast(`تم اعتماد إجازة الموظف ${req.employeeName} بنجاح`);
                            }}
                            title="اعتماد الإجازة"
                            className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/30 transition-all cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              updateLeaveStatus(req.id, 'rejected');
                              showToast(`تم رفض طلب إجازة الموظف ${req.employeeName}`);
                            }}
                            title="رفض الإجازة"
                            className="p-1.5 rounded-lg bg-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-500/30 transition-all cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-[#5C665E] dark:text-[#8FA392] italic">
                          {req.status === 'approved' ? 'معتمد رسمياً' : 'مرفوض'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Leave Request Modal via Central Portal */}
      <Modal
        isOpen={isNewLeaveModalOpen}
        onClose={() => setIsNewLeaveModalOpen(false)}
        title={t('تقديم طلب إجازة أو مأمورية جديدة', 'New Leave / Mission Application')}
        subtitle={t('تسجيل طلب رسمي وربطه برصيد الإجازات السنوي المعتمد', 'Submit leave request with annual entitlement linkage')}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmitNewLeave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#5C665E] dark:text-[#8FA392] mb-1.5">
              {t('اختر الموظف مقدم الطلب', 'Select Employee')} *
            </label>
            <select
              value={newLeaveForm.employeeId}
              onChange={(e) => setNewLeaveForm({ ...newLeaveForm, employeeId: e.target.value })}
              className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none focus:border-[#D99B26] dark:focus:border-[#EBB34D]"
              required
            >
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.nameAr} ({emp.employeeCode} - {emp.jobTitleAr})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#5C665E] dark:text-[#8FA392] mb-1.5">
              {t('نوع الإجازة المطلوبة', 'Leave Category')} *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'annual', label: 'إجازة سنوية اعتيادية' },
                { id: 'sick', label: 'إجازة مرضية بتقرير' },
                { id: 'casual', label: 'إجازة عارضة طارئة' },
                { id: 'mission', label: 'مأمورية موقع خارجية' },
              ].map(item => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setNewLeaveForm({ ...newLeaveForm, leaveType: item.id as LeaveType })}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-start transition-all cursor-pointer ${
                    newLeaveForm.leaveType === item.id
                      ? 'border-[#D99B26] dark:border-[#EBB34D] bg-[#D99B26]/10 dark:bg-[#EBB34D]/10 text-[#D99B26] dark:text-[#EBB34D]'
                      : 'border-[#E0D9CB] dark:border-[#243628] text-[#5C665E] dark:text-[#8FA392] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#5C665E] dark:text-[#8FA392] mb-1.5">
                {t('تاريخ البداية', 'Start Date')} *
              </label>
              <input
                type="date"
                value={newLeaveForm.startDate}
                onChange={(e) => setNewLeaveForm({ ...newLeaveForm, startDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none focus:border-[#D99B26] dark:focus:border-[#EBB34D]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#5C665E] dark:text-[#8FA392] mb-1.5">
                {t('تاريخ النهاية', 'End Date')} *
              </label>
              <input
                type="date"
                value={newLeaveForm.endDate}
                onChange={(e) => setNewLeaveForm({ ...newLeaveForm, endDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none focus:border-[#D99B26] dark:focus:border-[#EBB34D]"
                required
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB]/60 dark:border-[#243628]/60 flex items-center justify-between text-xs">
            <span className="text-[#5C665E] dark:text-[#8FA392]">
              {t('إجمالي مدة الإجازة المحتسبة:', 'Calculated Duration:')}
            </span>
            <span className="font-mono font-bold text-[#D99B26] dark:text-[#EBB34D] text-sm">
              {calculateDays(newLeaveForm.startDate, newLeaveForm.endDate)} أيام عمل
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#5C665E] dark:text-[#8FA392] mb-1.5">
              {t('سبب الإجازة وملاحظات التغطية', 'Reason & Coverage Notes')}
            </label>
            <textarea
              rows={2}
              value={newLeaveForm.reason}
              onChange={(e) => setNewLeaveForm({ ...newLeaveForm, reason: e.target.value })}
              placeholder={t('اكتب سبباً مختصراً أو اسم الزميل البديل في الموقع...', 'Brief reason or substitute colleague...')}
              className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none focus:border-[#D99B26] dark:focus:border-[#EBB34D]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E0D9CB] dark:border-[#243628]">
            <button
              type="button"
              onClick={() => setIsNewLeaveModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-[#E0D9CB] dark:border-[#243628] text-xs font-bold text-[#5C665E] dark:text-[#8FA392] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23] transition-all cursor-pointer"
            >
              {t('إلغاء', 'Cancel')}
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#1C291E] dark:bg-[#EBB34D] text-[#F3EFE6] dark:text-[#0E1610] text-xs font-bold shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>{t('إرسال الطلب للاعتماد', 'Submit Request')}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
