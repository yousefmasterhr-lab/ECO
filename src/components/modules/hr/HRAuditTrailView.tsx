import React, { useState } from 'react';
import { useHR } from '../../../context/HRContext';
import {
  History,
  Search,
  Download,
  UserCheck
} from 'lucide-react';

export const HRAuditTrailView: React.FC = () => {
  const { employees, showToast } = useHR();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedActionType, setSelectedActionType] = useState<string>('all');

  // Flatten all employee audit logs
  const allLogs = employees.flatMap(emp =>
    emp.auditLogs.map(log => ({
      ...log,
      employeeName: emp.nameAr,
      employeeUid: emp.uid,
      companyName: emp.companyNameAr,
    }))
  );

  // Sort newest first
  allLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const filteredLogs = allLogs.filter(log => {
    if (selectedActionType !== 'all' && log.actionType !== selectedActionType) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        log.employeeName.toLowerCase().includes(q) ||
        log.employeeUid.includes(q) ||
        log.actionType.toLowerCase().includes(q) ||
        log.fieldChanged.toLowerCase().includes(q) ||
        log.userName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] shadow-xs">
        <div>
          <h3 className="text-sm font-bold text-[#1A241C] dark:text-[#F3EFE6] flex items-center gap-2">
            <History className="w-4 h-4 text-[#D99B26] dark:text-[#EBB34D]" />
            <span>سجل العمليات والتعديلات الرقابي الشامل (HR Master Audit Trail)</span>
          </h3>
          <p className="text-xs text-[#5C665E] dark:text-[#8FA392] mt-0.5">
            تتبع غير قابل للتعديل لكافة حركات تعديل العقود، الرواتب، العهد، والجزاءات لمطابقة الحوكمة
          </p>
        </div>

        <button
          type="button"
          onClick={() => showToast('جاري تصدير سجل العمليات بصيغة Excel المعتمدة للرقابة الداخلية')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#17231A] border border-[#243628] text-[#F3EFE6] text-xs font-bold hover:border-[#EBB34D] transition-all cursor-pointer"
        >
          <Download className="w-4 h-4 text-[#EBB34D]" />
          <span>تصدير سجل العمليات</span>
        </button>
      </div>

      {/* Filter Cockpit */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#F3EFE6] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] overflow-x-auto">
          {['all', 'تعديل بنود العقد', 'تسجيل مكافأة', 'تسجيل جزاء', 'تسليم عهدة'].map(act => (
            <button
              key={act}
              type="button"
              onClick={() => setSelectedActionType(act)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedActionType === act
                  ? 'bg-[#1C291E] dark:bg-[#EBB34D] text-white dark:text-[#0E1610]'
                  : 'text-[#8FA392] hover:text-[#F3EFE6]'
              }`}
            >
              {act === 'all' ? 'كافة العمليات' : act}
            </button>
          ))}
        </div>

        <div className="relative w-72">
          <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-[#8FA392]" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="بحث بالموظف، الإجراء، أو المستخدم..."
            className="w-full ps-9 pe-3 py-2 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-xs text-[#1A241C] dark:text-[#F3EFE6] focus:border-[#EBB34D] outline-hidden"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#17231A] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-end text-xs">
            <thead className="bg-[#FBF9F5] dark:bg-[#111A13] text-[#5C665E] dark:text-[#8FA392] border-b border-[#E0D9CB] dark:border-[#243628]">
              <tr>
                <th className="py-3 px-4 font-bold text-start">الوقت والتاريخ</th>
                <th className="py-3 px-4 font-bold text-start">الموظف المعني</th>
                <th className="py-3 px-4 font-bold">الشركة التابعة</th>
                <th className="py-3 px-4 font-bold">نوع العملية</th>
                <th className="py-3 px-4 font-bold">الحقل المعدل</th>
                <th className="py-3 px-4 font-bold text-rose-400">القيمة السابقة</th>
                <th className="py-3 px-4 font-bold text-emerald-400">القيمة الجديدة</th>
                <th className="py-3 px-4 font-bold">المستخدم المسؤول</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0D9CB] dark:divide-[#243628]">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-[#F3EFE6]/50 dark:hover:bg-[#1F2E23]/50 transition-colors">
                  <td className="py-3 px-4 text-start font-mono text-[11px] text-[#8FA392]">
                    {log.timestamp}
                  </td>
                  <td className="py-3 px-4 text-start font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                    <div className="flex items-center gap-1.5">
                      <span>{log.employeeName}</span>
                      <span className="font-mono text-[10px] text-[#EBB34D]">({log.employeeUid})</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium text-[#1A241C] dark:text-[#F3EFE6]">
                    {log.companyName}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#17231A] text-[#EBB34D] border border-[#243628]">
                      {log.actionType}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-medium text-[#1A241C] dark:text-[#F3EFE6]">
                    {log.fieldChanged}
                  </td>
                  <td className="py-3 px-4 font-mono text-rose-400 line-through">
                    {log.oldValue || '—'}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                    {log.newValue}
                  </td>
                  <td className="py-3 px-4 font-medium text-[#8FA392]">
                    <span className="flex items-center gap-1">
                      <UserCheck className="w-3 h-3 text-[#EBB34D]" />
                      <span>{log.userName}</span>
                    </span>
                  </td>
                </tr>
              ))}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-xs text-[#8FA392]">
                    لا توجد عمليات مسجلة مطابقة للبحث
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
