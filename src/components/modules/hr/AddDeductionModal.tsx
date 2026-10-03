import React, { useState } from 'react';
import { Employee, useHR } from '../../../context/HRContext';
import { Modal } from '../../common/Modal';
import { AlertTriangle } from 'lucide-react';

interface AddDeductionModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
}

export const AddDeductionModal: React.FC<AddDeductionModalProps> = ({ isOpen, onClose, employee }) => {
  const { addDeductionToEmployee } = useHR();

  const [titleAr, setTitleAr] = useState('');
  const [daysCount, setDaysCount] = useState<number>(1);
  const [amount, setAmount] = useState<number>(850);
  const [date, setDate] = useState('2026-10-02');
  const [reason, setReason] = useState('');

  if (!employee) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addDeductionToEmployee(employee.id, {
      titleAr: titleAr || 'جزاء إداري / مخالفة تعليمات الموقع',
      daysCount: Number(daysCount),
      amount: Number(amount),
      date,
      reason: reason || 'مخالفة تعليمات العمل المعتمدة',
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="تسجيل جزاء إداري / خصم مالي"
      subtitle={`الموظف: ${employee.nameAr} (${employee.employeeCode})`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-[#5C665E] dark:text-[#8FA392] mb-1">
            نوع وموضوع المخالفة *
          </label>
          <input
            type="text"
            value={titleAr}
            onChange={(e) => setTitleAr(e.target.value)}
            placeholder="مثال: مخالفة تعليمات السلامة والصحة المهنية بالموقع"
            className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:border-rose-500 outline-none"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-[#5C665E] dark:text-[#8FA392] mb-1">
              عدد الأيام المخصومة
            </label>
            <input
              type="number"
              min="0.5"
              step="0.5"
              max="15"
              value={daysCount}
              onChange={(e) => {
                const d = Number(e.target.value);
                setDaysCount(d);
                setAmount(Math.round(d * (employee.salary.basic / 30)));
              }}
              className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:border-rose-500 outline-none font-mono font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#5C665E] dark:text-[#8FA392] mb-1">
              القيمة المالية (ج.م) *
            </label>
            <input
              type="number"
              min="100"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628] text-rose-500 focus:border-rose-500 outline-none font-mono font-black"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#5C665E] dark:text-[#8FA392] mb-1">
            تاريخ الواقعة / الجزاء *
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:border-rose-500 outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#5C665E] dark:text-[#8FA392] mb-1">
            مذكرة التحقيق وأسباب الجزاء
          </label>
          <textarea
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="اكتب أسباب الجزاء ورقم إفادة المشرف الميداني..."
            className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:border-rose-500 outline-none"
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
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>تسجيل وتطبيق الجزاء</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
