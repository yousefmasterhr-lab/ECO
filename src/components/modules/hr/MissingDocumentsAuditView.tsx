import React, { useState, useEffect, useMemo } from 'react';
import { useHR } from '../../../context/HRContext';
import { companyStorage } from '../companies/companyStorage';
import { CompanyEntity } from '../companies/types';
import {
  FileWarning,
  Upload,
  Send,
  Search,
  CheckCircle2
} from 'lucide-react';

export const MissingDocumentsAuditView: React.FC = () => {
  const { employees, updateEmployeeDocumentStatus, showToast } = useHR();

  const [companies, setCompanies] = useState<CompanyEntity[]>(() => companyStorage.getCompaniesSync());

  useEffect(() => {
    companyStorage.getCompanies().then(list => {
      if (Array.isArray(list) && list.length > 0) setCompanies(list);
    });
    const handleUpdate = () => setCompanies(companyStorage.getCompaniesSync());
    window.addEventListener('eco-companies-updated', handleUpdate);
    return () => window.removeEventListener('eco-companies-updated', handleUpdate);
  }, []);

  const [selectedEntityId, setSelectedEntityId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Collect all missing or expiring documents from real employees
  const missingItems = useMemo(() => {
    return employees.flatMap(emp => {
      const incompleteDocs = (emp.documents || []).filter(doc => doc.status === 'missing' || doc.status === 'expiring');
      return incompleteDocs.map(doc => ({
        ...doc,
        employeeId: emp.id,
        employeeName: emp.nameAr,
        employeeUid: emp.uid,
        jobTitle: emp.jobTitleAr,
        companyId: emp.companyId,
        companyName: emp.companyNameAr,
        mobile: emp.mobile,
      }));
    });
  }, [employees]);

  const filteredItems = useMemo(() => {
    return missingItems.filter(item => {
      if (selectedEntityId !== 'all' && item.companyId !== selectedEntityId) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          item.employeeName.toLowerCase().includes(q) ||
          item.titleAr.toLowerCase().includes(q) ||
          item.employeeUid.includes(q)
        );
      }
      return true;
    });
  }, [missingItems, selectedEntityId, searchQuery]);

  const handleQuickUpload = (employeeId: string, docId: string) => {
    updateEmployeeDocumentStatus(employeeId, docId, 'valid');
    showToast('تم استلام ورفع المستند وتحديث حالة الملف الوظيفي بنجاح');
  };

  const handleSendReminder = (employeeName: string, docName: string) => {
    showToast(`تم إرسال إشعار تذكير فوري إلى الموظف (${employeeName}) لتقديم (${docName})`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] shadow-xs">
        <div>
          <h3 className="text-sm font-bold text-[#1A241C] dark:text-[#F3EFE6] flex items-center gap-2">
            <FileWarning className="w-4 h-4 text-amber-500" />
            <span>مسوغات التعيين ونواقص الملفات (Hiring Documents & Dossiers Audit)</span>
          </h3>
          <p className="text-xs text-[#5C665E] dark:text-[#8FA392] mt-0.5">
            رصد ومتابعة مسوغات التعيين والشهادات المهنية والتراخيص غير المكتملة وتنبيه الموظفين للامتثال التنظيمي
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-[#EBB34D] text-xs font-bold">
            إجمالي النواقص: {missingItems.length} مستند
          </span>
        </div>
      </div>

      {/* Filter Cockpit */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#F3EFE6] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] overflow-x-auto select-none no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedEntityId('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedEntityId === 'all'
                ? 'bg-gradient-to-l from-amber-600 to-amber-500 text-white shadow-sm font-black'
                : 'text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6]'
            }`}
          >
            كافة الشركات ({missingItems.length})
          </button>
          {companies.map(c => {
            const count = missingItems.filter(m => m.companyId === c.id).length;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedEntityId(c.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                  selectedEntityId === c.id
                    ? 'bg-gradient-to-l from-amber-600 to-amber-500 text-white shadow-sm font-black'
                    : 'text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6]'
                }`}
              >
                <span>{c.nameAr}</span>
                <span className="opacity-80 font-mono text-[10px]">({count})</span>
              </button>
            );
          })}
        </div>

        <div className="relative w-72">
          <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-[#8FA392]" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="بحث بالموظف، المستند، أو UID..."
            className="w-full ps-9 pe-3 py-2 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-xs text-[#1A241C] dark:text-[#F3EFE6] focus:border-[#EBB34D] outline-hidden"
          />
        </div>
      </div>

      {/* Audit Table or Empty State */}
      {filteredItems.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h4 className="text-sm font-bold text-[#1A241C] dark:text-[#F3EFE6]">
            لا توجد نواقص مستندات مسجلة حالياً
          </h4>
          <p className="text-xs text-[#5C665E] dark:text-[#8FA392] max-w-md mx-auto">
            كافة ملفات الموظفين ومسوغات التعيين مكتملة ومستوفية للشروط واللوائح القانونية المعتمدة
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#17231A] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-end text-xs">
              <thead className="bg-[#FBF9F5] dark:bg-[#111A13] text-[#5C665E] dark:text-[#8FA392] border-b border-[#E0D9CB] dark:border-[#243628]">
                <tr>
                  <th className="py-3 px-4 font-bold text-start">كود الموظف</th>
                  <th className="py-3 px-4 font-bold text-start">الموظف المعني</th>
                  <th className="py-3 px-4 font-bold">الشركة التابعة</th>
                  <th className="py-3 px-4 font-bold">المستند الناقص</th>
                  <th className="py-3 px-4 font-bold">الحالة</th>
                  <th className="py-3 px-4 font-bold text-center">الإجراء الميداني</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0D9CB] dark:divide-[#243628]">
                {filteredItems.map(item => (
                  <tr key={`${item.employeeId}_${item.id}`} className="hover:bg-[#FBF9F5] dark:hover:bg-[#1F2E23]/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-start text-[#D99B26] dark:text-[#EBB34D]">
                      {item.employeeUid}
                    </td>
                    <td className="py-3 px-4 text-start">
                      <div className="font-bold text-[#1A241C] dark:text-[#F3EFE6]">{item.employeeName}</div>
                      <div className="text-[11px] text-[#5C665E] dark:text-[#8FA392]">{item.jobTitle}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-[#1A241C] dark:text-[#F3EFE6]">
                      {item.companyName}
                    </td>
                    <td className="py-3 px-4 font-bold text-amber-700 dark:text-[#EBB34D]">
                      {item.titleAr}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border ${
                        item.status === 'missing'
                          ? 'bg-rose-500/15 text-rose-500 border-rose-500/30'
                          : 'bg-amber-500/15 text-amber-600 dark:text-[#EBB34D] border-amber-500/30'
                      }`}>
                        {item.status === 'missing' ? 'مستند ناقص' : 'ينتهي قريباً'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleQuickUpload(item.employeeId, item.id)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30 text-xs font-bold transition-all cursor-pointer"
                          title="اعتماد وتأكيد الاستلام"
                        >
                          <Upload className="w-3 h-3" />
                          <span>استلام</span>
                        </button>
                        <button
                          onClick={() => handleSendReminder(item.employeeName, item.titleAr)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-700 dark:text-[#EBB34D] hover:bg-amber-500/25 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer"
                          title="إرسال إشعار تذكير"
                        >
                          <Send className="w-3 h-3" />
                          <span>تذكير</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
