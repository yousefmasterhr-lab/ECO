import React from 'react';
import { Employee, useHR } from '../../../context/HRContext';
import { Modal } from '../../common/Modal';
import { Building2 } from 'lucide-react';

interface OrgChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
}

export const OrgChartModal: React.FC<OrgChartModalProps> = ({ isOpen, onClose, employee }) => {
  const { employees, setSelectedEmployee } = useHR();

  if (!employee) return null;

  // Find manager
  const manager = employees.find(e => e.nameAr.includes(employee.directManager) || employee.directManager.includes(e.nameAr));
  // Find subordinates / team members in the same department or project
  const subordinates = employees.filter(e => e.id !== employee.id && e.directManager === employee.nameAr);
  const peers = employees.filter(e => e.id !== employee.id && e.directManager === employee.directManager);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="الهيكل التنظيمي وخط التبعية الإدارية (Organization Tree)"
      subtitle={`التسلسل الإداري للموظف: ${employee.nameAr} - ${employee.companyNameAr}`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6 py-2">
        {/* Top: Corporate Entity */}
        <div className="flex flex-col items-center">
          <div className="px-4 py-2 rounded-xl bg-[#1C291E] dark:bg-[#EBB34D] text-[#F3EFE6] dark:text-[#0E1610] text-xs font-bold shadow-md flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            <span>{employee.companyNameAr}</span>
          </div>
          <div className="w-0.5 h-6 bg-[#E0D9CB] dark:bg-[#243628]"></div>
        </div>

        {/* Level 1: Direct Manager */}
        <div className="flex flex-col items-center">
          <div className="p-3 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#17231A] text-center w-64 shadow-xs">
            <span className="text-[10px] font-bold text-[#D99B26] dark:text-[#EBB34D] block uppercase">
              المدير المباشر
            </span>
            <div className="text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] mt-0.5">
              {manager ? manager.nameAr : employee.directManager}
            </div>
            <div className="text-[10.5px] text-[#5C665E] dark:text-[#8FA392]">
              {manager ? manager.jobTitleAr : 'مدير قطاع المشاريع'}
            </div>
          </div>
          <div className="w-0.5 h-6 bg-[#EBB34D]"></div>
        </div>

        {/* Level 2: Active Employee Node (Highlighted) */}
        <div className="flex flex-col items-center">
          <div className="p-4 rounded-2xl border-2 border-[#EBB34D] bg-[#FBF9F5] dark:bg-[#1F2E23] text-center w-72 shadow-lg relative">
            <span className="absolute -top-2.5 start-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-[#EBB34D] text-[#0E1610] text-[9.5px] font-black">
              الملف الحالي النشط
            </span>
            <div className="flex items-center justify-center gap-2 mb-1 mt-1">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs text-white"
                style={{ backgroundColor: employee.avatarColor }}
              >
                {employee.nameAr.charAt(0)}
              </div>
              <div className="text-sm font-black text-[#1A241C] dark:text-[#F3EFE6]">
                {employee.nameAr}
              </div>
            </div>
            <div className="text-xs font-bold text-[#D99B26] dark:text-[#EBB34D]">
              {employee.jobTitleAr}
            </div>
            <div className="text-[10.5px] text-[#5C665E] dark:text-[#8FA392] mt-0.5">
              UID: {employee.uid} | {employee.workLocation}
            </div>
          </div>
        </div>

        {/* Level 3: Subordinates or Team Peers */}
        <div className="space-y-2 pt-2 border-t border-[#E0D9CB] dark:border-[#243628]">
          <span className="text-xs font-bold text-[#5C665E] dark:text-[#8FA392] block text-center">
            {subordinates.length > 0 ? 'فريق العمل التابع مباشرة:' : 'الزملاء في نفس خط الإدارة:'}
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {(subordinates.length > 0 ? subordinates : peers).slice(0, 4).map(teamMember => (
              <div
                key={teamMember.id}
                onClick={() => {
                  setSelectedEmployee(teamMember);
                  onClose();
                }}
                className="p-2.5 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#17231A] hover:border-[#EBB34D] transition-all cursor-pointer flex items-center gap-2.5"
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0"
                  style={{ backgroundColor: teamMember.avatarColor }}
                >
                  {teamMember.nameAr.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] truncate">
                    {teamMember.nameAr}
                  </div>
                  <div className="text-[10px] text-[#5C665E] dark:text-[#8FA392] truncate">
                    {teamMember.jobTitleAr}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};
