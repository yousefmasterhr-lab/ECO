import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Network,
  Calculator,
  Plus,
  Pencil,
  Trash2,
  X,
  User,
  FolderTree
} from 'lucide-react';
import { DepartmentOrg, CostCenter, CompanyEntity } from './types';
import { formatCurrency } from '../../../utils/formatters';

interface CompanyOrgStructureTabProps {
  departments: DepartmentOrg[];
  costCenters: CostCenter[];
  companies: CompanyEntity[];
  onAddCostCenter: (cc: CostCenter) => void;
  onUpdateCostCenter: (cc: CostCenter) => void;
  onDeleteCostCenter: (id: string) => void;
}

export const CompanyOrgStructureTab: React.FC<CompanyOrgStructureTabProps> = ({
  departments,
  costCenters,
  companies,
  onAddCostCenter,
  onUpdateCostCenter,
  onDeleteCostCenter
}) => {
  // Sub-segmented toggle: 'org' vs 'cost_centers'
  const [activeSegment, setActiveSegment] = useState<'org' | 'cost_centers'>('org');

  // Modal State for Cost Centers
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCC, setEditingCC] = useState<CostCenter | null>(null);

  // Form State
  const [formCode, setFormCode] = useState('');
  const [formNameAr, setFormNameAr] = useState('');
  const [formCompanyId, setFormCompanyId] = useState('');
  const [formTypeAr, setFormTypeAr] = useState<CostCenter['typeAr']>('مشروع إنشائي');
  const [formBudget, setFormBudget] = useState<number>(10000000);
  const [formSpent, setFormSpent] = useState<number>(0);
  const [formFinancialOfficerAr, setFormFinancialOfficerAr] = useState('');

  const handleOpenAdd = () => {
    setEditingCC(null);
    setFormCode(`CC-${Date.now().toString().slice(-3)}`);
    setFormNameAr('');
    setFormCompanyId(companies[0]?.id || '');
    setFormTypeAr('مشروع إنشائي');
    setFormBudget(25000000);
    setFormSpent(0);
    setFormFinancialOfficerAr('أ. كمال إبراهيم الشناوي');
    setModalOpen(true);
  };

  const handleOpenEdit = (cc: CostCenter) => {
    setEditingCC(cc);
    setFormCode(cc.code);
    setFormNameAr(cc.nameAr);
    setFormCompanyId(cc.companyId);
    setFormTypeAr(cc.typeAr);
    setFormBudget(cc.budget);
    setFormSpent(cc.spent);
    setFormFinancialOfficerAr(cc.financialOfficerAr);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNameAr.trim()) return;

    const parentComp = companies.find(c => c.id === formCompanyId);
    const companyNameAr = parentComp ? parentComp.nameAr : 'شركة أركان للإنشاءات الهندسية (ش.م.م)';

    if (editingCC) {
      const updated: CostCenter = {
        ...editingCC,
        code: formCode,
        nameAr: formNameAr,
        companyId: formCompanyId,
        companyNameAr,
        typeAr: formTypeAr,
        budget: Number(formBudget) || 0,
        spent: Number(formSpent) || 0,
        financialOfficerAr: formFinancialOfficerAr
      };
      onUpdateCostCenter(updated);
    } else {
      const newCC: CostCenter = {
        id: `cc_${Date.now()}`,
        code: formCode || `CC-${Date.now().toString().slice(-3)}`,
        nameAr: formNameAr,
        companyId: formCompanyId,
        companyNameAr,
        typeAr: formTypeAr,
        budget: Number(formBudget) || 0,
        spent: Number(formSpent) || 0,
        financialOfficerAr: formFinancialOfficerAr || 'المسؤول المالي'
      };
      onAddCostCenter(newCC);
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Segmented Controller Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-1.5 rounded-2xl bg-[#EAE4D7] dark:bg-[#1F2E23] border border-[#E0D9CB] dark:border-[#243628]">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveSegment('org')}
            className={`min-h-[44px] flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSegment === 'org'
                ? 'bg-[#D97706] text-white shadow-xs'
                : 'text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6]'
            }`}
          >
            <Network className="w-4 h-4" />
            <span>الهيكل التنظيمي والإدارات العامة</span>
          </button>

          <button
            onClick={() => setActiveSegment('cost_centers')}
            className={`min-h-[44px] flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSegment === 'cost_centers'
                ? 'bg-[#D97706] text-white shadow-xs'
                : 'text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6]'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>مراكز التكلفة والميزانيات المالية</span>
          </button>
        </div>

        {activeSegment === 'cost_centers' && (
          <button
            onClick={handleOpenAdd}
            className="min-h-[44px] flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#D97706] text-white text-xs font-bold hover:bg-[#B45309] transition-colors shrink-0 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>+ إضافة مركز تكلفة</span>
          </button>
        )}
      </div>

      {/* 1. Administrative Org Structure View */}
      {activeSegment === 'org' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-[#1A241C] dark:text-[#F3EFE6]">
                الهيكل التنظيمي والإدارات المركزية
              </h3>
              <p className="text-xs text-[#5C665E] dark:text-[#8FA392]">
                التسلسل الإداري للإدارات العامة والأقسام التابعة والمسؤوليات المعتمدة
              </p>
            </div>
            <span className="text-xs font-bold text-[#D97706] dark:text-[#EBB34D] px-2.5 py-1 rounded-lg bg-[#D97706]/10">
              {departments.length} إدارات رئيسية
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 w-full">
            {departments.map(dept => (
              <div
                key={dept.id}
                className="p-5 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#D97706]/15 text-[#D97706] flex items-center justify-center shrink-0">
                        <FolderTree className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#1A241C] dark:text-[#F3EFE6] leading-tight">
                          {dept.nameAr}
                        </h4>
                        <span className="text-[11px] font-mono font-bold text-[#D97706]">
                          {dept.code}
                        </span>
                      </div>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-[#EAE4D7] dark:bg-[#1F2E23] text-[#5C665E] dark:text-[#8FA392]">
                      {dept.staffCount} موظف
                    </span>
                  </div>

                  {/* Manager info */}
                  <div className="mb-3 p-3 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB]/70 dark:border-[#243628] text-xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[#5C665E] dark:text-[#8FA392] flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#D97706]" />
                        <span>المدير المسؤول:</span>
                      </span>
                      <strong className="text-[#1A241C] dark:text-[#F3EFE6]">{dept.headAr}</strong>
                    </div>

                    <p className="text-[11px] text-[#5C665E] dark:text-[#8FA392] border-t border-[#E0D9CB]/50 dark:border-[#243628] pt-1.5 leading-relaxed">
                      {dept.responsibilities}
                    </p>
                  </div>

                  {/* Sub-units list */}
                  <div>
                    <span className="text-[11px] font-bold text-[#1A241C] dark:text-[#F3EFE6] block mb-1.5">
                      الأقسام والوحدات التابعة:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {dept.subUnits.map((sub, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-[#EAE4D7] dark:bg-[#1F2E23] text-[11px] font-semibold text-[#1A241C] dark:text-[#F3EFE6] border border-[#E0D9CB]/50 dark:border-[#243628]"
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Cost Centers Management View */}
      {activeSegment === 'cost_centers' && (
        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-black text-[#1A241C] dark:text-[#F3EFE6]">
              سجل مراكز التكلفة والميزانيات المعتمدة
            </h3>
            <p className="text-xs text-[#5C665E] dark:text-[#8FA392]">
              متابعة الميزانيات التقديرية ونسب المنصرف الفعلي لكل مشروع أو قطاع تشغيلي
            </p>
          </div>

          <div className="rounded-2xl border border-[#E0D9CB] dark:border-[#243628] overflow-hidden bg-[#F3EFE6] dark:bg-[#17231A] shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start">
                <thead className="bg-[#EAE4D7] dark:bg-[#1F2E23] text-[#1A241C] dark:text-[#F3EFE6] border-b border-[#E0D9CB] dark:border-[#243628]">
                  <tr>
                    <th className="p-3.5 text-start sticky right-0 bg-[#EAE4D7] dark:bg-[#1F2E23] z-10 shadow-xs whitespace-nowrap">
                      كود المركز
                    </th>
                    <th className="p-3.5 text-start whitespace-nowrap">مسمى مركز التكلفة</th>
                    <th className="p-3.5 text-start whitespace-nowrap">الشركة التابعة</th>
                    <th className="p-3.5 text-start whitespace-nowrap">تصنيف المركز</th>
                    <th className="p-3.5 text-start whitespace-nowrap">الميزانية التقديرية</th>
                    <th className="p-3.5 text-start whitespace-nowrap">المنصرف الفعلي</th>
                    <th className="p-3.5 text-center whitespace-nowrap">نسبة الصرف</th>
                    <th className="p-3.5 text-start whitespace-nowrap">المسؤول المالي</th>
                    <th className="p-3.5 text-center whitespace-nowrap">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E0D9CB]/60 dark:divide-[#243628]">
                  {costCenters.map(cc => {
                    const percent = cc.budget > 0 ? (cc.spent / cc.budget) * 100 : 0;
                    return (
                      <tr key={cc.id} className="hover:bg-[#EAE4D7]/50 dark:hover:bg-[#1F2E23]/50 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-[#D97706] sticky right-0 bg-[#F3EFE6] dark:bg-[#17231A] z-10 shadow-xs whitespace-nowrap">
                          {cc.code}
                        </td>
                        <td className="p-3.5 font-bold text-[#1A241C] dark:text-[#F3EFE6] whitespace-nowrap">
                          {cc.nameAr}
                        </td>
                        <td className="p-3.5 text-[#1A241C] dark:text-[#F3EFE6] whitespace-nowrap">
                          {cc.companyNameAr}
                        </td>
                        <td className="p-3.5 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-[#EAE4D7] dark:bg-[#1F2E23] text-[#5C665E] dark:text-[#8FA392]">
                            {cc.typeAr}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono font-bold text-[#1A241C] dark:text-[#F3EFE6] whitespace-nowrap">
                          {formatCurrency(cc.budget)}
                        </td>
                        <td className="p-3.5 font-mono font-bold text-[#5C665E] dark:text-[#8FA392] whitespace-nowrap">
                          {formatCurrency(cc.spent)}
                        </td>
                        <td className="p-3.5 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  percent > 90 ? 'bg-red-500' : percent > 75 ? 'bg-amber-500' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${Math.min(100, percent)}%` }}
                              />
                            </div>
                            <span className="font-mono font-bold text-xs">
                              {percent.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className="p-3.5 text-[#1A241C] dark:text-[#F3EFE6] whitespace-nowrap">
                          {cc.financialOfficerAr}
                        </td>
                        <td className="p-3.5 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleOpenEdit(cc)}
                              className="min-h-[44px] min-w-[44px] p-2 rounded-xl text-[#5C665E] dark:text-[#8FA392] hover:text-[#D97706] hover:bg-[#D97706]/10 transition-colors"
                              title="تعديل مركز التكلفة"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteCostCenter(cc.id)}
                              className="min-h-[44px] min-w-[44px] p-2 rounded-xl text-[#5C665E] dark:text-[#8FA392] hover:text-red-500 hover:bg-red-500/10 transition-colors"
                              title="حذف مركز التكلفة"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal: إضافة / تعديل مركز تكلفة */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[#FBF9F5] dark:bg-[#0E1610] rounded-2xl border border-[#E0D9CB] dark:border-[#243628] shadow-2xl overflow-hidden p-5 text-start"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#E0D9CB] dark:border-[#243628] mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#D97706]/15 text-[#D97706] flex items-center justify-center">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                    {editingCC ? 'تعديل بيانات مركز التكلفة' : 'إضافة مركز تكلفة جديد'}
                  </h3>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                {/* Parent Company Selection */}
                <div>
                  <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                    الشركة التابع لها المركز *
                  </label>
                  <select
                    required
                    value={formCompanyId}
                    onChange={e => setFormCompanyId(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6] font-bold focus:outline-none focus:border-[#D97706]"
                  >
                    {companies.map(comp => (
                      <option key={comp.id} value={comp.id}>
                        {comp.nameAr}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                      كود مركز التكلفة *
                    </label>
                    <input
                      type="text"
                      required
                      value={formCode}
                      onChange={e => setFormCode(e.target.value)}
                      placeholder="CC-101"
                      className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6] font-mono font-bold focus:outline-none focus:border-[#D97706]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                      نوع المركز *
                    </label>
                    <select
                      value={formTypeAr}
                      onChange={e => setFormTypeAr(e.target.value as CostCenter['typeAr'])}
                      className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none focus:border-[#D97706]"
                    >
                      <option value="مشروع إنشائي">مشروع إنشائي</option>
                      <option value="تشغيلي">تشغيلي</option>
                      <option value="إداري">إداري</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                    اسم مركز التكلفة *
                  </label>
                  <input
                    type="text"
                    required
                    value={formNameAr}
                    onChange={e => setFormNameAr(e.target.value)}
                    placeholder="مثال: مشروع مونوريل العاصمة الإدارية (قطاع 4)"
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none focus:border-[#D97706]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                      الميزانية التقديرية (ج.م) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={formBudget}
                      onChange={e => setFormBudget(Number(e.target.value) || 0)}
                      className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6] font-mono focus:outline-none focus:border-[#D97706]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                      المنصرف الفعلي حتى تاريخه (ج.م)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formSpent}
                      onChange={e => setFormSpent(Number(e.target.value) || 0)}
                      className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6] font-mono focus:outline-none focus:border-[#D97706]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                    المسؤول المالي المعتمد *
                  </label>
                  <input
                    type="text"
                    required
                    value={formFinancialOfficerAr}
                    onChange={e => setFormFinancialOfficerAr(e.target.value)}
                    placeholder="أ. كمال إبراهيم الشناوي"
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none focus:border-[#D97706]"
                  />
                </div>

                <div className="pt-3 border-t border-[#E0D9CB] dark:border-[#243628] flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="min-h-[44px] px-4 py-2 rounded-xl border border-[#E0D9CB] dark:border-[#243628] text-[#5C665E] dark:text-[#8FA392] hover:bg-gray-100 dark:hover:bg-white/5 font-semibold"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="min-h-[44px] px-6 py-2 rounded-xl bg-[#D97706] text-white font-bold hover:bg-[#B45309] transition-colors shadow-xs"
                  >
                    {editingCC ? 'حفظ التعديلات' : 'إضافة مركز التكلفة'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
