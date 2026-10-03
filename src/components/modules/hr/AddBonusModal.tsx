import React, { useState } from 'react';
import { Employee, useHR } from '../../../context/HRContext';
import { Modal } from '../../common/Modal';
import { Sparkles } from 'lucide-react';

interface AddBonusModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
}

export const AddBonusModal: React.FC<AddBonusModalProps> = ({ isOpen, onClose, employee }) => {
  const { addBonusToEmployee } = useHR();

  const [titleAr, setTitleAr] = useState('');
  const [amount, setAmount] = useState<number>(3000);
  const [date, setDate] = useState('2026-10-02');
  const [reason, setReason] = useState('');
  const [projectLinked, setProjectLinked] = useState('');

  if (!employee) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addBonusToEmployee(employee.id, {
      titleAr: titleAr || 'حافز تسليم مرحلة إنجاز',
      amount: Number(amount),
      date,
      reason: reason || 'تسليم الأعمال المطلوبة بجودة عالية وقبل الموعد',
      projectLinked: projectLinked || employee.projectCostCenterName,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="صرف مكافأة / حافز إنجاز جديد"
      subtitle={`الموظف: ${employee.nameAr} (${employee.employeeCode})`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-[#5C665E] dark:text-[#8FA392] mb-1">
            عنوان المكافأة *
          </label>
          <input
            type="text"
            value={titleAr}
            onChange={(e) => setTitleAr(e.target.value)}
            placeholder="مثال: حافز تسليم صب خرسانات الدور الأول"
            className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:border-[#EBB34D] outline-none"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-[#5C665E] dark:text-[#8FA392] mb-1">
              القيمة المالية (ج.م) *
            </label>
            <input
              type="number"
              min="500"
              step="250"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:border-[#EBB34D] outline-none font-mono font-bold"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#5C665E] dark:text-[#8FA392] mb-1">
              تاريخ الاعتماد *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:border-[#EBB34D] outline-none"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#5C665E] dark:text-[#8FA392] mb-1">
            المشروع المرتبط
          </label>
          <input
            type="text"
            value={projectLinked}
            onChange={(e) => setProjectLinked(e.target.value)}
            placeholder={employee.projectCostCenterName || 'اسم المشروع أو مركز التكلفة'}
            className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:border-[#EBB34D] outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#5C665E] dark:text-[#8FA392] mb-1">
            سبب وتفاصيل الصرف
          </label>
          <textarea
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="اكتب مذكرة التوصية بصرف المكافأة..."
            className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:border-[#EBB34D] outline-none"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E0D9CB] dark:border-[#243628]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[#E0D9CB] dark:border-[#243628] text-xs font-bold text-[#5C665E] dark:text-[#8FA392] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23] transition-all cursor-pointer"
          >
            إلغاء
          </button>
          <button
            type="submit"
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#1C291E] dark:bg-[#EBB34D] text-[#F3EFE6] dark:text-[#0E1610] text-xs font-bold shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>اعتماد وصرف المكافأة</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
