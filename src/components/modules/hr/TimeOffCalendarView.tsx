import React, { useState } from 'react';
import { Employee } from '../../../context/HRContext';
import { Calendar as CalendarIcon, ChevronRight, ChevronLeft } from 'lucide-react';

interface TimeOffCalendarViewProps {
  employee: Employee;
}

export const TimeOffCalendarView: React.FC<TimeOffCalendarViewProps> = ({ employee }) => {
  const [selectedMonth, setSelectedMonth] = useState<number>(9); // 0-indexed (9 = October)
  const currentYear = 2026;

  const monthNamesAr = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  // Specific highlighted days in October 2026 for demonstration
  const getDayStatus = (day: number, month: number) => {
    if (month === 9) { // October
      if (day === 6) return { type: 'holiday', label: 'عيد القوات المسلحة (عطلة رسمية)', bg: 'bg-rose-950/80 border-rose-600/50 text-rose-300' };
      if ([18, 19, 20, 21, 22].includes(day)) return { type: 'pending', label: 'طلب إجازة سنوية (قيد الاعتماد)', bg: 'bg-amber-950/80 border-amber-500/60 text-[#EBB34D]' };
      if ([1, 2, 3].includes(day)) return { type: 'approved', label: 'إجازة سابقة معتمدة', bg: 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300' };
      if ([14, 15].includes(day)) return { type: 'crunch', label: 'يوم ضغط عمل وتسليم مرحلة موقع', bg: 'bg-blue-950/80 border-blue-500/60 text-blue-300' };
      if (day === 29) return { type: 'rejected', label: 'طلب إجازة مرفوض لتعارضه مع الصب', bg: 'bg-red-950/80 border-red-700/60 text-red-300' };
    }
    return null;
  };

  const daysInMonth = new Date(currentYear, selectedMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, selectedMonth, 1).getDay(); // 0 is Sunday, 5 is Friday

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="space-y-4">
      {/* Month Navigation & Summary */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628]">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-[#D99B26] dark:text-[#EBB34D]" />
          <span className="text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6]">
            تقويم الحضور والإجازات المعتمدة ({currentYear}) - {employee.nameAr}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedMonth(prev => Math.max(0, prev - 1))}
            disabled={selectedMonth === 0}
            className="p-1.5 rounded-lg border border-[#E0D9CB] dark:border-[#243628] disabled:opacity-30 hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23] transition-colors cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <span className="font-bold text-xs px-3 py-1 rounded-lg bg-white dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] min-w-[100px] text-center">
            {monthNamesAr[selectedMonth]} {currentYear}
          </span>

          <button
            type="button"
            onClick={() => setSelectedMonth(prev => Math.min(11, prev + 1))}
            disabled={selectedMonth === 11}
            className="p-1.5 rounded-lg border border-[#E0D9CB] dark:border-[#243628] disabled:opacity-30 hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23] transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Color Classification Legend */}
      <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-white dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] text-xs">
        <span className="font-bold text-[11px] text-[#5C665E] dark:text-[#8FA392]">دليل الألوان:</span>
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-[10.5px]">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>معتمدة</span>
        </span>
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-950/70 border border-amber-500/40 text-[#EBB34D] text-[10.5px]">
          <span className="w-2 h-2 rounded-full bg-[#EBB34D]"></span>
          <span>بانتظار الاعتماد</span>
        </span>
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-red-950/70 border border-red-700/40 text-red-300 text-[10.5px]">
          <span className="w-2 h-2 rounded-full bg-red-500"></span>
          <span>مرفوضة</span>
        </span>
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-rose-950/70 border border-rose-600/40 text-rose-300 text-[10.5px]">
          <span className="w-2 h-2 rounded-full bg-rose-400"></span>
          <span>عطلة رسمية</span>
        </span>
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-950/70 border border-blue-500/40 text-blue-300 text-[10.5px]">
          <span className="w-2 h-2 rounded-full bg-blue-400"></span>
          <span>يوم ضغط عمل</span>
        </span>
      </div>

      {/* Calendar Grid */}
      <div className="p-4 rounded-xl bg-white dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628]">
        {/* Days of week */}
        <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-bold text-[#5C665E] dark:text-[#8FA392] mb-2 pb-2 border-b border-[#E0D9CB]/60 dark:border-[#243628]/60">
          <div>الأحد</div>
          <div>الاثنين</div>
          <div>الثلاثاء</div>
          <div>الأربعاء</div>
          <div>الخميس</div>
          <div className="text-[#D99B26] dark:text-[#EBB34D]">الجمعة</div>
          <div className="text-[#D99B26] dark:text-[#EBB34D]">السبت</div>
        </div>

        {/* Days cells */}
        <div className="grid grid-cols-7 gap-1.5 text-center">
          {/* Empty offset days */}
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="h-14 rounded-lg bg-transparent"></div>
          ))}

          {daysArray.map(day => {
            const status = getDayStatus(day, selectedMonth);
            const isWeekend = (firstDayIndex + day - 1) % 7 === 5 || (firstDayIndex + day - 1) % 7 === 6;

            return (
              <div
                key={day}
                title={status ? status.label : undefined}
                className={`h-14 p-1 rounded-lg border text-start flex flex-col justify-between transition-all ${
                  status
                    ? status.bg
                    : isWeekend
                    ? 'bg-[#EAE4D7]/50 dark:bg-[#121B14] border-[#E0D9CB]/60 dark:border-[#243628] text-[#5C665E] dark:text-[#8FA392]'
                    : 'bg-[#FBF9F5] dark:bg-[#111A13] border-[#E0D9CB]/60 dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6]'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-bold font-mono">
                  <span>{day}</span>
                  {status && <span className="w-1.5 h-1.5 rounded-full bg-current"></span>}
                </div>
                {status && (
                  <div className="text-[9px] font-bold truncate leading-tight mt-0.5">
                    {status.type === 'holiday' ? 'عطلة رسمية' : status.type === 'pending' ? 'طلب معلق' : status.type === 'approved' ? 'معتمدة' : status.type === 'crunch' ? 'تسليم صب' : 'مرفوض'}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
