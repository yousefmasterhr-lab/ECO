import React, { useState } from 'react';
import { useHR } from '../../../context/HRContext';
import {
  FileWarning,
  AlertTriangle,
  Upload,
  Send,
  Search
} from 'lucide-react';

export const MissingDocumentsAuditView: React.FC = () => {
  const { employees, updateEmployeeDocumentStatus, showToast } = useHR();

  const [selectedEntity, setSelectedEntity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Collect all missing or expiring documents
  const missingItems = employees.flatMap(emp => {
    const incompleteDocs = emp.documents.filter(doc => doc.status === 'missing' || doc.status === 'expiring');
    return incompleteDocs.map(doc => ({
      ...doc,
      employeeId: emp.id,
      employeeName: emp.nameAr,
      employeeUid: emp.uid,
      jobTitle: emp.jobTitleAr,
      companyName: emp.companyNameAr,
      mobile: emp.mobile,
    }));
  });

  const filteredItems = missingItems.filter(item => {
    if (selectedEntity !== 'all' && item.companyName !== selectedEntity) return false;
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
            <span>تدقيق نواقص ومسوغات التعيين والتراخيص (Missing Documents Audit)</span>
          </h3>
          <p className="text-xs text-[#5C665E] dark:text-[#8FA392] mt-0.5">
            رصد المسوغات الهندسية والإدارية غير المكتملة وتنبيه الموظفين للامتثال التنظيمي
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-amber-950/80 border border-amber-600/40 text-[#EBB34D] text-xs font-bold">
            إجمالي النواقص: {missingItems.length} مستند
          </span>
        </div>
      </div>

      {/* Filter Cockpit */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#F3EFE6] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] overflow-x-auto">
          {['all', 'ترابط للمقاولات', 'ماستر جروب', 'ماستر ترافل', 'إيمبرو للتجارة والتوريدات'].map(ent => (
            <button
              key={ent}
              type="button"
              onClick={() => setSelectedEntity(ent)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedEntity === ent
                  ? 'bg-[#1C291E] dark:bg-[#EBB34D] text-white dark:text-[#0E1610]'
                  : 'text-[#8FA392] hover:text-[#F3EFE6]'
              }`}
            >
              {ent === 'all' ? 'كافة الشركات' : ent}
            </button>
          ))}
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

      {/* Audit Table */}
      <div className="rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#17231A] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-end text-xs">
            <thead className="bg-[#FBF9F5] dark:bg-[#111A13] text-[#5C665E] dark:text-[#8FA392] border-b border-[#E0D9CB] dark:border-[#243628]">
              <tr>
                <th className="py-3 px-4 font-bold text-start">كود الموظف</th>
                <th className="py-3 px-4 font-bold text-start">الموظف المعني</th>
                <th className="py-3 px-4 font-bold">الشركة التابعة</th>
                <th className="py-3 px-4 font-bold">المستند الناقص</th>
                <th className="py-3 px-4 font-bold">الأهمية والنوع</th>
                <th className="py-3 px-4 font-bold">الحالة الحالية</th>
                <th className="py-3 px-4 font-bold text-center">الإجراء الميداني</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0D9CB] dark:divide-[#243628]">
              {filteredItems.map(item => (
                <tr key={`${item.employeeId}-${item.id}`} className="hover:bg-[#F3EFE6]/50 dark:hover:bg-[#1F2E23]/50 transition-colors">
                  <td className="py-3 px-4 text-start font-mono font-bold text-[#D99B26] dark:text-[#EBB34D]">
                    {item.employeeUid}
                  </td>
                  <td className="py-3 px-4 text-start">
                    <div className="font-bold text-[#1A241C] dark:text-[#F3EFE6]">{item.employeeName}</div>
                    <div className="text-[10px] text-[#8FA392]">{item.jobTitle}</div>
                  </td>
                  <td className="py-3 px-4 text-[#1A241C] dark:text-[#F3EFE6] font-medium">
                    {item.companyName}
                  </td>
                  <td className="py-3 px-4 font-bold text-amber-400">
                    {item.titleAr}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#17231A] text-[#8FA392] border border-[#243628]">
                      مسوغ تعيين إلزامي
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-rose-950/80 text-rose-300 border border-rose-600/40">
                      <AlertTriangle className="w-3 h-3" />
                      <span>{item.status === 'missing' ? 'غير مرفق (ناقص)' : 'منتهي الصلاحية'}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleQuickUpload(item.employeeId, item.id)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#EBB34D] text-[#0E1610] text-[11px] font-bold hover:bg-[#d99b26] transition-all cursor-pointer"
                      >
                        <Upload className="w-3 h-3" />
                        <span>رفع واستيفاء</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSendReminder(item.employeeName, item.titleAr)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1F2E23] border border-[#243628] text-[#F3EFE6] text-[11px] font-bold hover:border-[#EBB34D] transition-all cursor-pointer"
                      >
                        <Send className="w-3 h-3" />
                        <span>إرسال تنبيه</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-[#8FA392]">
                    كافة مسوغات التعيين مستوفاة وسارية ولا توجد نواقص حالياً
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
