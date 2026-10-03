import React, { useState } from 'react';
import { useHR } from '../../../context/HRContext';
import {
  Network,
  Building2
} from 'lucide-react';

export const EnterpriseOrgTreeView: React.FC = () => {
  const { employees, setSelectedEmployee, showToast } = useHR();
  const [selectedEntity, setSelectedEntity] = useState<string>('ترابط للمقاولات');

  const entityEmployees = employees.filter(e => e.companyNameAr === selectedEntity);

  const entitiesList = [
    'ترابط للمقاولات',
    'ماستر جروب',
    'ماستر ترافل',
    'إيمبرو للتجارة والتوريدات',
    'جدارة للخدمات',
    'توينتي توينتي للتطوير'
  ];

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
            خريطة التبعية الإدارية وخطوط الإشراف الهندسي والإداري لشركات المجموعة
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-[#17231A] border border-[#243628] text-[#EBB34D] text-xs font-bold">
            إجمالي الكوادر: {entityEmployees.length} موظف
          </span>
        </div>
      </div>

      {/* Entity Selector Pills */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] overflow-x-auto">
        {entitiesList.map(ent => (
          <button
            key={ent}
            type="button"
            onClick={() => setSelectedEntity(ent)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              selectedEntity === ent
                ? 'bg-[#1C291E] dark:bg-[#EBB34D] text-[#F3EFE6] dark:text-[#0E1610] shadow-sm'
                : 'text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6]'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>{ent}</span>
          </button>
        ))}
      </div>

      {/* Visual Organizational Hierarchy Tree */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] overflow-x-auto space-y-8">
        {/* Tier 1: Board & Managing Director */}
        <div className="flex flex-col items-center">
          <div className="p-4 rounded-2xl border-2 border-[#EBB34D] bg-[#FBF9F5] dark:bg-[#1F2E23] text-center w-80 shadow-lg">
            <span className="px-2.5 py-0.5 rounded-full bg-[#EBB34D] text-[#0E1610] text-[10px] font-black uppercase">
              القيادة التنفيذية العليا
            </span>
            <div className="text-sm font-black text-[#1A241C] dark:text-[#F3EFE6] mt-2">
              م. عادل محمود الدسوقي
            </div>
            <div className="text-xs font-bold text-[#D99B26] dark:text-[#EBB34D] mt-0.5">
              العضو المنتدب والرئيس التنفيذي للمجموعة
            </div>
            <div className="text-[10.5px] text-[#5C665E] dark:text-[#8FA392] mt-1">
              {selectedEntity}
            </div>
          </div>
          <div className="w-0.5 h-8 bg-[#EBB34D]"></div>
        </div>

        {/* Tier 2: Sector VPs */}
        <div className="flex flex-col items-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
            {/* Sector 1: Projects */}
            <div className="p-4 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#0E1610] text-center shadow-xs">
              <span className="text-[10px] font-bold text-[#EBB34D] block uppercase">
                قطاع المشروعات والتنفيذ
              </span>
              <div className="text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] mt-1">
                م. حسام الدين غانم
              </div>
              <div className="text-[10.5px] text-[#8FA392]">مدير عام قطاع المقاولات</div>
            </div>

            {/* Sector 2: Technical Office */}
            <div className="p-4 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#0E1610] text-center shadow-xs">
              <span className="text-[10px] font-bold text-blue-400 block uppercase">
                قطاع المكتب الفني والمناقصات
              </span>
              <div className="text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] mt-1">
                م. أحمد نبيل الشربيني
              </div>
              <div className="text-[10.5px] text-[#8FA392]">رئيس قسم التسعير والمستخلصات</div>
            </div>

            {/* Sector 3: Finance & Corporate */}
            <div className="p-4 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#0E1610] text-center shadow-xs">
              <span className="text-[10px] font-bold text-emerald-400 block uppercase">
                القطاع المالي والإداري
              </span>
              <div className="text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] mt-1">
                أ. محمود عبد الرحمن منصور
              </div>
              <div className="text-[10.5px] text-[#8FA392]">مدير الإدارة المالية والحسابات</div>
            </div>
          </div>
          <div className="w-0.5 h-8 bg-[#E0D9CB] dark:bg-[#243628]"></div>
        </div>

        {/* Tier 3: Operational Site Staff & Project Teams */}
        <div className="space-y-4">
          <div className="text-center">
            <span className="text-xs font-bold text-[#8FA392] px-3 py-1 rounded-full bg-[#0E1610] border border-[#243628]">
              الكوادر الهندسية والفرق التنفيذية المسجلة ({entityEmployees.length})
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {entityEmployees.map(emp => (
              <div
                key={emp.id}
                onClick={() => {
                  setSelectedEmployee(emp);
                  showToast(`تم تحديد الملف الوظيفي للموظف (${emp.nameAr})`);
                }}
                className="p-3.5 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#1F2E23] hover:border-[#EBB34D] transition-all cursor-pointer shadow-xs flex items-center gap-3"
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-sm"
                  style={{ backgroundColor: emp.avatarColor }}
                >
                  {emp.nameAr.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] truncate">
                    {emp.nameAr}
                  </div>
                  <div className="text-[10.5px] text-[#D99B26] dark:text-[#EBB34D] truncate">
                    {emp.jobTitleAr}
                  </div>
                  <div className="text-[9.5px] text-[#8FA392] truncate mt-0.5">
                    المدير: {emp.directManager}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
