import React, { useState, useEffect, useMemo } from 'react';
import { useHR, Employee } from '../../../context/HRContext';
import { companyStorage } from '../companies/companyStorage';
import { CompanyEntity } from '../companies/types';
import {
  Network,
  Building2,
  FolderTree
} from 'lucide-react';

export const EnterpriseOrgTreeView: React.FC = () => {
  const { employees, setSelectedEmployee, showToast } = useHR();
  const [companies, setCompanies] = useState<CompanyEntity[]>(() => companyStorage.getCompaniesSync());

  useEffect(() => {
    companyStorage.getCompanies().then(list => {
      if (Array.isArray(list) && list.length > 0) setCompanies(list);
    });
    const handleUpdate = () => setCompanies(companyStorage.getCompaniesSync());
    window.addEventListener('eco-companies-updated', handleUpdate);
    return () => window.removeEventListener('eco-companies-updated', handleUpdate);
  }, []);

  const [selectedEntityId, setSelectedEntityId] = useState<string>(() => {
    const cached = companyStorage.getCompaniesSync();
    return cached.length > 0 ? cached[0].id : 'all';
  });

  const selectedCompany = companies.find(c => c.id === selectedEntityId) || companies[0] || null;

  // Real employees of selected entity
  const entityEmployees = useMemo(() => {
    if (!selectedCompany) return [];
    return employees.filter(e => e.companyId === selectedCompany.id || e.companyNameAr === selectedCompany.nameAr);
  }, [employees, selectedCompany]);

  // Group employees by department
  const departmentGroups = useMemo(() => {
    const map = new Map<string, Employee[]>();
    entityEmployees.forEach(emp => {
      const dept = emp.departmentAr || 'الإدارة العامة';
      if (!map.has(dept)) map.set(dept, []);
      map.get(dept)!.push(emp);
    });
    return map;
  }, [entityEmployees]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] shadow-xs">
        <div>
          <h3 className="text-sm font-bold text-[#1A241C] dark:text-[#F3EFE6] flex items-center gap-2">
            <Network className="w-4 h-4 text-[#D99B26] dark:text-[#EBB34D]" />
            <span>الهيكل التنظيمي العام للمجموعة والمشاريع (Enterprise Organization Tree)</span>
          </h3>
          <p className="text-xs text-[#5C665E] dark:text-[#8FA392] mt-0.5">
            مخطط شجري تفاعلي مربوط مباشرة بكيانات وإدارات إدارة الشركات مدعماً بإحصائيات الكوادر الفعلية
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-[#EBB34D] text-xs font-bold">
            إجمالي الكوادر الفعلية: {entityEmployees.length} موظف
          </span>
        </div>
      </div>

      {/* Dynamic Company Selector Pills */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] overflow-x-auto select-none no-scrollbar">
        {companies.map(c => {
          const isSelected = selectedCompany?.id === c.id;
          const count = employees.filter(e => e.companyId === c.id || e.companyNameAr === c.nameAr).length;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedEntityId(c.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                isSelected
                  ? 'bg-gradient-to-l from-amber-600 to-amber-500 text-white shadow-md shadow-amber-500/20 font-black'
                  : 'text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23]'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>{c.nameAr}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                isSelected ? 'bg-black/20 text-white font-black' : 'bg-[#EAE4D7] dark:bg-[#0E1610] text-[#5C665E] dark:text-[#8FA392]'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Visual Organizational Hierarchy Tree */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] overflow-x-auto space-y-8">
        {/* Tier 1: Selected Company Root */}
        <div className="flex flex-col items-center">
          <div className="p-4 rounded-2xl border-2 border-amber-500 bg-amber-50/80 dark:bg-[#1F2E23] text-center w-80 shadow-md">
            <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-l from-amber-600 to-amber-500 text-white text-[10px] font-black uppercase">
              الكيان المؤسسي المعتمد
            </span>
            <div className="text-sm font-black text-[#1A241C] dark:text-[#F3EFE6] mt-2">
              {selectedCompany?.nameAr || 'الشركة الرئيسية'}
            </div>
            <div className="text-xs font-bold text-[#D99B26] dark:text-[#EBB34D] mt-0.5">
              {selectedCompany?.crNumber ? `س.ت: ${selectedCompany.crNumber}` : 'المقر الإداري والمشاريع'}
            </div>
            <div className="text-[10.5px] text-[#5C665E] dark:text-[#8FA392] mt-1">
              إجمالي الكوادر: {entityEmployees.length} موظف
            </div>
          </div>
          <div className="w-0.5 h-8 bg-amber-500"></div>
        </div>

        {/* Tier 2: Real Departments & Branches */}
        {departmentGroups.size === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-[#FBF9F5] dark:bg-[#121B14] border border-[#E0D9CB] dark:border-[#243628]">
            <FolderTree className="w-10 h-10 text-amber-500/60 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
              لا توجد كوادر أو إدارات مرتبطة بهذا الكيان حالياً
            </h4>
            <p className="text-xs text-[#5C665E] dark:text-[#8FA392]">
              يمكنك إضافة موظفين جدد وتعيين الإدارات والأقسام التابعة لهم لتظهر تلقائياً في هذا المخطط
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <span className="text-xs font-bold text-[#5C665E] dark:text-[#8FA392] px-3 py-1 rounded-full bg-[#F3EFE6] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628]">
                الأقسام والإدارات التشغيلية ({departmentGroups.size})
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from(departmentGroups.entries()).map(([deptName, deptEmployees]) => (
                <div
                  key={deptName}
                  className="p-4 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#121B14] shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-[#E0D9CB]/60 dark:border-[#243628]/60">
                    <div className="flex items-center gap-2">
                      <FolderTree className="w-4 h-4 text-[#D99B26] dark:text-[#EBB34D]" />
                      <h4 className="text-xs font-black text-[#1A241C] dark:text-[#F3EFE6]">{deptName}</h4>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-[#EBB34D] border border-amber-500/30">
                      {deptEmployees.length} موظف
                    </span>
                  </div>

                  <div className="space-y-2 max-h-56 overflow-y-auto pe-1">
                    {deptEmployees.map(emp => (
                      <div
                        key={emp.id}
                        onClick={() => {
                          setSelectedEmployee(emp);
                          showToast(`تم تحديد ملف: ${emp.nameAr}`);
                        }}
                        className="p-2.5 rounded-xl border border-[#E0D9CB]/60 dark:border-[#243628]/60 bg-white dark:bg-[#17231A] hover:border-amber-500 transition-all cursor-pointer flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white shrink-0"
                            style={{ backgroundColor: emp.avatarColor || '#D99B26' }}
                          >
                            {emp.nameAr ? emp.nameAr.charAt(0) : 'م'}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] truncate">
                              {emp.nameAr}
                            </div>
                            <div className="text-[10.5px] text-[#5C665E] dark:text-[#8FA392] truncate">
                              {emp.jobTitleAr}
                            </div>
                          </div>
                        </div>

                        <span className="text-[10px] font-mono font-bold text-[#D99B26] dark:text-[#EBB34D] shrink-0">
                          {emp.uid}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
