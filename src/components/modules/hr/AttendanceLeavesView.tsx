import React, { useState } from 'react';
import { useHR, AttendanceStatus, LeaveType } from '../../../context/HRContext';
import { useLanguage } from '../../../context/LanguageContext';
import { Modal } from '../../common/Modal';
import {
  Clock,
  Calendar,
  Plus,
  FileCheck2,
  Check,
  X,
  Search
} from 'lucide-react';

export const AttendanceLeavesView: React.FC = () => {
  const { t } = useLanguage();
  const {
    employees,
    attendanceRecords,
    punchAttendance,
    leaveRequests,
    submitLeaveRequest,
    updateLeaveStatus,
    stats,
  } = useHR();

  // Search & Filters
  const [attendanceSearch, setAttendanceSearch] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | AttendanceStatus>('all');

  // Request Leave Modal
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    employeeId: employees[0]?.id || '',
    type: 'annual' as LeaveType,
    startDate: '2026-10-05',
    endDate: '2026-10-08',
    daysCount: 4,
    reason: '',
  });

  // Filtered today's attendance
  const filteredRecords = attendanceRecords.filter(att => {
    const matchesSearch = att.employeeName.toLowerCase().includes(attendanceSearch.toLowerCase());
    const matchesStatus = selectedStatusFilter === 'all' || att.status === selectedStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find(e => e.id === leaveForm.employeeId);
    if (!emp) return;

    submitLeaveRequest({
      employeeId: emp.id,
      employeeName: emp.nameAr,
      jobTitleAr: emp.jobTitleAr,
      type: leaveForm.type,
      startDate: leaveForm.startDate,
      endDate: leaveForm.endDate,
      daysCount: Number(leaveForm.daysCount),
      reason: leaveForm.reason || 'إجازة اعتيادية مصرحة',
    });

    setIsLeaveModalOpen(false);
  };

  const getStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return { label: 'حاضر', bg: 'bg-[#2A3F30] text-[#A3CFAC] border-[#3B5440]' };
      case 'mission':
        return { label: 'مأمورية عمل', bg: 'bg-[#D99B26]/15 text-[#EBB34D] border-[#D99B26]/30' };
      case 'leave':
        return { label: 'إجازة معتمدة', bg: 'bg-[#EAE4D7] dark:bg-[#1F2E23] text-[#8FA392] border-[#243628]' };
      case 'absent':
        return { label: 'غائب', bg: 'bg-[#3F2A2A] text-[#EFA3A3] border-[#5A3535]' };
    }
  };

  const getLeaveTypeLabel = (type: LeaveType) => {
    switch (type) {
      case 'annual': return 'إجازة سنوية';
      case 'sick': return 'إجازة مرضية';
      case 'casual': return 'إجازة عارضة';
      case 'mission': return 'مأمورية عمل رسمية';
      default: return 'إجازة بدون راتب';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Punch Overview & Summary Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Attendance Rate Tile */}
        <div className="p-4 rounded-2xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#5C665E] dark:text-[#8FA392] mb-1 font-bold">
            <span>{t('نسبة الحضور اليومي', 'Today Attendance Rate')}</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400">{stats.attendanceTodayRate}%</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#1A241C] dark:text-[#F3EFE6]">
            {attendanceRecords.filter(a => a.status === 'present').length} / {stats.totalEmployees}
          </div>
          <div className="w-full h-1.5 rounded-full bg-[#E0D9CB] dark:bg-[#243628] mt-2 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#059669]"
              style={{ width: `${stats.attendanceTodayRate}%` }}
            />
          </div>
        </div>

        {/* Missions Tile */}
        <div className="p-4 rounded-2xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] shadow-xs">
          <div className="text-xs text-[#5C665E] dark:text-[#8FA392] mb-1 font-bold">
            {t('المأموريات الميدانية للمواقع', 'Site Field Missions')}
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#D99B26] dark:text-[#EBB34D]">
            {attendanceRecords.filter(a => a.status === 'mission').length} {t('مهندس ومشرف', 'Staff')}
          </div>
          <p className="text-[11px] text-[#5C665E] dark:text-[#8FA392] mt-1">
            {t('موزعون على مشاريع العاصمة والعلمين', 'Assigned to New Capital & Alamein')}
          </p>
        </div>

        {/* Leaves Today Tile */}
        <div className="p-4 rounded-2xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] shadow-xs">
          <div className="text-xs text-[#5C665E] dark:text-[#8FA392] mb-1 font-bold">
            {t('إجازات معتمدة سارية', 'Approved Leaves Today')}
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#8FA392]">
            {stats.onLeaveCount} {t('موظف', 'Employees')}
          </div>
          <p className="text-[11px] text-[#5C665E] dark:text-[#8FA392] mt-1">
            {t('رصيد اعتيادي ومرضي مخصوم رسمياً', 'Deducted from standard balances')}
          </p>
        </div>

        {/* 1-Click Request Leave Action Tile */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#1C291E] to-[#121B14] dark:from-[#17231A] dark:to-[#1F2E23] border border-[#D99B26]/30 shadow-xs flex flex-col justify-between text-white">
          <div>
            <div className="text-xs font-bold text-[#EBB34D] flex items-center gap-1.5 mb-1">
              <Calendar className="w-4 h-4" />
              <span>{t('إدارة طلبات الإجازات', 'Leave Management')}</span>
            </div>
            <p className="text-[11px] text-[#F3EFE6]/80 leading-snug">
              {t('تقديم ومراجعة طلبات الإجازات السنوية والمرضية بنقرة واحدة.', 'Submit and verify annual & sick leaves in 1-click.')}
            </p>
          </div>
          <button
            onClick={() => setIsLeaveModalOpen(true)}
            className="mt-3 w-full py-2 rounded-xl bg-[#EBB34D] text-[#0E1610] text-xs font-black shadow-xs hover:bg-[#F5C76D] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('تقديم طلب إجازة جديد', 'Request Leave')}</span>
          </button>
        </div>
      </div>

      {/* Attendance Punch Card & Live Registry */}
      <div className="p-5 rounded-2xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-[#1A241C] dark:text-[#F3EFE6] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#D99B26] dark:text-[#EBB34D]" />
              <span>{t('سجل الحضور والبصمة اليومي (الخميس 02 أكتوبر 2026)', 'Daily Punch & Attendance Register')}</span>
            </h3>
            <p className="text-xs text-[#5C665E] dark:text-[#8FA392] mt-0.5">
              {t('تسجيل فوري لحالات الحضور والانصراف والمأموريات الميدانية', 'Instant real-time check-in, check-out and site missions')}
            </p>
          </div>

          {/* Quick Search & Status Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute top-1/2 -translate-y-1/2 start-3 text-[#5C665E] dark:text-[#8FA392]" />
              <input
                type="text"
                value={attendanceSearch}
                onChange={e => setAttendanceSearch(e.target.value)}
                placeholder={t('بحث بالاسم...', 'Search name...')}
                className="ps-8 pe-3 py-1.5 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-xs text-[#1A241C] dark:text-[#F3EFE6] placeholder-[#5C665E] dark:placeholder-[#8FA392] focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-1 text-xs">
              {(['all', 'present', 'mission', 'leave', 'absent'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setSelectedStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                    selectedStatusFilter === st
                      ? 'bg-[#1C291E] dark:bg-[#EBB34D] text-[#F3EFE6] dark:text-[#0E1610]'
                      : 'bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-[#5C665E] dark:text-[#8FA392]'
                  }`}
                >
                  {st === 'all' ? 'الكل' : st === 'present' ? 'حاضر' : st === 'mission' ? 'مأمورية' : st === 'leave' ? 'إجازة' : 'غائب'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Punch Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {filteredRecords.map(att => {
            const badge = getStatusBadge(att.status);
            return (
              <div
                key={att.id}
                className="p-3.5 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] space-y-2.5 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-bold text-[#1A241C] dark:text-[#F3EFE6] truncate">
                      {att.employeeName}
                    </div>
                    <div className="text-[11px] text-[#5C665E] dark:text-[#8FA392] truncate mt-0.5">
                      {att.workLocation}
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border shrink-0 ${badge.bg}`}>
                    {badge.label}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-[#5C665E] dark:text-[#8FA392] pt-1 border-t border-[#E0D9CB]/50 dark:border-[#243628]/50">
                  <span>{t('دخول:', 'In:')} <strong className="text-[#1A241C] dark:text-[#F3EFE6]">{att.checkIn}</strong></span>
                  <span>{t('خروج:', 'Out:')} <strong className="text-[#1A241C] dark:text-[#F3EFE6]">{att.checkOut || '-'}</strong></span>
                </div>

                {/* Instant Quick Punch Controls */}
                <div className="grid grid-cols-4 gap-1 pt-1">
                  <button
                    onClick={() => punchAttendance(att.employeeId, 'present')}
                    className={`py-1 text-[10px] font-bold rounded-md transition-colors ${
                      att.status === 'present'
                        ? 'bg-[#2A3F30] text-[#A3CFAC] font-black'
                        : 'bg-[#EAE4D7] dark:bg-[#1F2E23] text-[#5C665E] dark:text-[#8FA392] hover:bg-[#2A3F30]'
                    }`}
                  >
                    حاضر
                  </button>
                  <button
                    onClick={() => punchAttendance(att.employeeId, 'mission')}
                    className={`py-1 text-[10px] font-bold rounded-md transition-colors ${
                      att.status === 'mission'
                        ? 'bg-[#D99B26]/30 text-[#EBB34D] font-black'
                        : 'bg-[#EAE4D7] dark:bg-[#1F2E23] text-[#5C665E] dark:text-[#8FA392] hover:bg-[#D99B26]/20'
                    }`}
                  >
                    مأمورية
                  </button>
                  <button
                    onClick={() => punchAttendance(att.employeeId, 'leave')}
                    className={`py-1 text-[10px] font-bold rounded-md transition-colors ${
                      att.status === 'leave'
                        ? 'bg-[#8FA392]/30 text-[#F3EFE6] font-black'
                        : 'bg-[#EAE4D7] dark:bg-[#1F2E23] text-[#5C665E] dark:text-[#8FA392]'
                    }`}
                  >
                    إجازة
                  </button>
                  <button
                    onClick={() => punchAttendance(att.employeeId, 'absent')}
                    className={`py-1 text-[10px] font-bold rounded-md transition-colors ${
                      att.status === 'absent'
                        ? 'bg-[#3F2A2A] text-[#EFA3A3] font-black'
                        : 'bg-[#EAE4D7] dark:bg-[#1F2E23] text-[#5C665E] dark:text-[#8FA392] hover:bg-[#3F2A2A]'
                    }`}
                  >
                    غائب
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Leave Requests & Approval Workflow */}
      <div className="p-5 rounded-2xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#1A241C] dark:text-[#F3EFE6] flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-[#D99B26] dark:text-[#EBB34D]" />
              <span>{t('طلبات الإجازات والمأموريات المعلقة والمعتمدة', 'Leave Requests & Approvals')}</span>
            </h3>
            <p className="text-xs text-[#5C665E] dark:text-[#8FA392]">
              {t('متابعة واعتماد الإجازات السنوية والمرضية للموظفين', 'Approve and verify employee leaves')}
            </p>
          </div>
          <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-[#D99B26]/15 text-[#D99B26] dark:text-[#EBB34D] border border-[#D99B26]/30">
            {leaveRequests.filter(l => l.status === 'pending').length} {t('طلبات قيد المراجعة', 'Pending Requests')}
          </span>
        </div>

        <div className="divide-y divide-[#E0D9CB]/60 dark:divide-[#243628]/60">
          {leaveRequests.map(req => (
            <div key={req.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#1A241C] dark:text-[#F3EFE6]">{req.employeeName}</span>
                  <span className="text-[#5C665E] dark:text-[#8FA392]">({req.jobTitleAr})</span>
                  <span className="px-2 py-0.5 rounded-md bg-[#EAE4D7] dark:bg-[#1F2E23] text-[10.5px] font-bold text-[#D99B26] dark:text-[#EBB34D]">
                    {getLeaveTypeLabel(req.type)}
                  </span>
                </div>
                <div className="text-[11px] text-[#5C665E] dark:text-[#8FA392] flex items-center gap-3">
                  <span>من: <strong className="font-mono">{req.startDate}</strong> إلى: <strong className="font-mono">{req.endDate}</strong> ({req.daysCount} أيام)</span>
                  <span>•</span>
                  <span>السبب: {req.reason}</span>
                </div>
              </div>

              {/* Status and Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {req.status === 'pending' ? (
                  <>
                    <button
                      onClick={() => updateLeaveStatus(req.id, 'approved')}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#2A3F30] text-[#A3CFAC] font-bold text-xs hover:bg-[#3B5440] transition-colors cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{t('موافقة واعتماد', 'Approve')}</span>
                    </button>
                    <button
                      onClick={() => updateLeaveStatus(req.id, 'rejected')}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#3F2A2A] text-[#EFA3A3] font-bold text-xs hover:bg-[#5A3535] transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>{t('رفض', 'Reject')}</span>
                    </button>
                  </>
                ) : (
                  <span className={`px-2.5 py-1 rounded-lg font-bold text-xs ${
                    req.status === 'approved' ? 'bg-[#2A3F30] text-[#A3CFAC]' : 'bg-[#3F2A2A] text-[#EFA3A3]'
                  }`}>
                    {req.status === 'approved' ? `معتمدة (${req.approvedBy || 'الإدارة'})` : 'مرفوضة'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leave Request Centralized Modal */}
      <Modal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        title={t('تقديم طلب إجازة أو مأمورية جديدة', 'Submit Leave or Mission Request')}
        subtitle={t('تسجيل طلب إجازة رسمي مع حساب الأيام وخصم الرصيد تلقائياً', 'Register official leave with automatic balance calculation')}
        icon={Calendar}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleLeaveSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[#5C665E] dark:text-[#8FA392] font-bold mb-1">
              {t('الموظف صاحب الطلب *', 'Employee *')}
            </label>
            <select
              value={leaveForm.employeeId}
              onChange={e => setLeaveForm({ ...leaveForm, employeeId: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-hidden focus:border-[#D99B26] font-bold cursor-pointer"
            >
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.nameAr} - {emp.jobTitleAr} ({emp.leaveBalance.annualTotal - emp.leaveBalance.annualUsed} يوم رصيد)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#5C665E] dark:text-[#8FA392] font-bold mb-1">
                {t('نوع الإجازة *', 'Leave Type *')}
              </label>
              <select
                value={leaveForm.type}
                onChange={e => setLeaveForm({ ...leaveForm, type: e.target.value as LeaveType })}
                className="w-full p-2.5 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-hidden focus:border-[#D99B26] font-bold cursor-pointer"
              >
                <option value="annual">إجازة اعتيادية سنوية</option>
                <option value="sick">إجازة مرضية</option>
                <option value="casual">إجازة عارضة طارئة</option>
                <option value="mission">مأمورية عمل ميدانية</option>
                <option value="unpaid">إجازة بدون راتب</option>
              </select>
            </div>

            <div>
              <label className="block text-[#5C665E] dark:text-[#8FA392] font-bold mb-1">
                {t('عدد الأيام المطلوبة *', 'Number of Days *')}
              </label>
              <input
                type="number"
                min="1"
                max="30"
                required
                value={leaveForm.daysCount}
                onChange={e => setLeaveForm({ ...leaveForm, daysCount: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-hidden focus:border-[#D99B26] font-mono font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#5C665E] dark:text-[#8FA392] font-bold mb-1">
                {t('تاريخ البداية *', 'Start Date *')}
              </label>
              <input
                type="date"
                required
                value={leaveForm.startDate}
                onChange={e => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-hidden focus:border-[#D99B26] font-mono"
              />
            </div>

            <div>
              <label className="block text-[#5C665E] dark:text-[#8FA392] font-bold mb-1">
                {t('تاريخ العودة والانتهاء *', 'End Date *')}
              </label>
              <input
                type="date"
                required
                value={leaveForm.endDate}
                onChange={e => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-hidden focus:border-[#D99B26] font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#5C665E] dark:text-[#8FA392] font-bold mb-1">
              {t('ملاحظات وأسباب الإجازة *', 'Reason / Notes *')}
            </label>
            <textarea
              required
              rows={2}
              value={leaveForm.reason}
              onChange={e => setLeaveForm({ ...leaveForm, reason: e.target.value })}
              placeholder="اكتب سبب طلب الإجازة أو تفاصيل المأمورية..."
              className="w-full p-2.5 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-hidden focus:border-[#D99B26]"
            />
          </div>

          <div className="pt-4 border-t border-[#E0D9CB] dark:border-[#243628] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsLeaveModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-[#EAE4D7] dark:bg-[#1F2E23] text-[#1A241C] dark:text-[#F3EFE6] font-bold text-xs"
            >
              {t('إلغاء', 'Cancel')}
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-[#1C291E] dark:bg-[#EBB34D] text-[#F3EFE6] dark:text-[#0E1610] font-bold text-xs shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              {t('تقديم الطلب للاعتماد', 'Submit Request')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
