import React, { useState } from 'react';
import { useHR } from '../../../context/HRContext';
import {
  FolderX,
  ArrowRight,
  Search
} from 'lucide-react';

export const IncompleteDossiersAuditView: React.FC = () => {
  const { employees, setSelectedEmployee, showToast } = useHR();
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate completeness score for each employee
  const dossiersAnalysis = employees.map(emp => {
    const missingFields: string[] = [];
    if (!emp.nationalId || emp.nationalId.length < 14) missingFields.push('الرقم القومي (14 رقم)');
    if (!emp.emergencyContact.phone || emp.emergencyContact.name.includes('للطوارئ')) missingFields.push('جهة اتصال الطوارئ');
    if (!emp.bankAccount) missingFields.push('الحساب البنكي / الآيبان');
    if (!emp.socialInsuranceNo) missingFields.push('الرقم التأميني');
    const missingDocsCount = emp.documents.filter(d => d.status === 'missing').length;
    if (missingDocsCount > 0) missingFields.push(`${missingDocsCount} مسوغات تعيين`);

    const totalChecks = 6;
    const completedChecks = totalChecks - missingFields.length;
    const completenessScore = Math.round((completedChecks / totalChecks) * 100);

    return {
      employee: emp,
      missingFields,
      completenessScore,
      isIncomplete: missingFields.length > 0,
    };
  });

  const incompleteList = dossiersAnalysis.filter(d => d.isIncomplete);

  const filteredList = incompleteList.filter(item => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        item.employee.nameAr.toLowerCase().includes(q) ||
        item.employee.employeeCode.toLowerCase().includes(q) ||
        item.employee.uid.includes(q)
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
            <FolderX className="w-4 h-4 text-rose-500" />
            <span>تدقيق الملفات الوظيفية غير المكتملة (Incomplete Dossiers Audit)</span>
          </h3>
          <p className="text-xs text-[#5C665E] dark:text-[#8FA392] mt-0.5">
            حصر الموظفين الذين تنقص ملفاتهم بيانات الطوارئ، أرقام الحسابات، أو بطاقات الرقم القومي
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-rose-950/80 border border-rose-600/40 text-rose-300 text-xs font-bold">
            الملفات غير المستوفاة: {incompleteList.length} ملف
          </span>
        </div>
      </div>

      {/* Audit Table */}
      <div className="rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#17231A] overflow-hidden shadow-xs">
        <div className="p-4 border-b border-[#E0D9CB] dark:border-[#243628] flex items-center justify-between">
          <div className="text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6]">
            قائمة الموظفين المطلوب استكمال بياناتهم
          </div>
          <div className="relative w-72">
            <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-[#8FA392]" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="بحث بالاسم، الكود، أو UID..."
              className="w-full ps-9 pe-3 py-1.5 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-xs text-[#1A241C] dark:text-[#F3EFE6] focus:border-[#EBB34D] outline-hidden"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-end text-xs">
            <thead className="bg-[#FBF9F5] dark:bg-[#111A13] text-[#5C665E] dark:text-[#8FA392] border-b border-[#E0D9CB] dark:border-[#243628]">
              <tr>
                <th className="py-3 px-4 font-bold text-start">UID</th>
                <th className="py-3 px-4 font-bold text-start">الموظف المعني</th>
                <th className="py-3 px-4 font-bold">الشركة والمشروع</th>
                <th className="py-3 px-4 font-bold">نسبة اكتمال الملف</th>
                <th className="py-3 px-4 font-bold text-start">البيانات الناقصة المطلوبة</th>
                <th className="py-3 px-4 font-bold text-center">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0D9CB] dark:divide-[#243628]">
              {filteredList.map(item => (
                <tr key={item.employee.id} className="hover:bg-[#F3EFE6]/50 dark:hover:bg-[#1F2E23]/50 transition-colors">
                  <td className="py-3 px-4 text-start font-mono font-bold text-[#D99B26] dark:text-[#EBB34D]">
                    {item.employee.uid}
                  </td>
                  <td className="py-3 px-4 text-start">
                    <div className="font-bold text-[#1A241C] dark:text-[#F3EFE6]">{item.employee.nameAr}</div>
                    <div className="text-[10px] text-[#8FA392]">{item.employee.jobTitleAr}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-[#1A241C] dark:text-[#F3EFE6]">{item.employee.companyNameAr}</div>
                    <div className="text-[10px] text-[#8FA392]">{item.employee.workLocation}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-[#243628] rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            item.completenessScore >= 80 ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${item.completenessScore}%` }}
                        />
                      </div>
                      <span className="font-mono font-bold text-xs">{item.completenessScore}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-start">
                    <div className="flex flex-wrap gap-1.5">
                      {item.missingFields.map((field, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-rose-950/70 border border-rose-600/40 text-rose-300 text-[10px] font-bold"
                        >
                          {field}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedEmployee(item.employee);
                        showToast(`تم فتح الملف الوظيفي للموظف (${item.employee.nameAr}) للاستكمال`);
                      }}
                      className="px-3 py-1 rounded-lg bg-[#EBB34D] text-[#0E1610] text-[11px] font-bold hover:bg-[#d99b26] transition-all cursor-pointer inline-flex items-center gap-1"
                    >
                      <span>استكمال الآن</span>
                      <ArrowRight className="w-3 h-3 rotate-180" />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredList.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-[#8FA392]">
                    كافة الملفات الوظيفية مكتملة بنسبة 100% ولا توجد أي نواقص
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
