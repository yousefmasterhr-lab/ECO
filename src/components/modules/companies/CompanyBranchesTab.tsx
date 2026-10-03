import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Plus,
  Building,
  Warehouse,
  HardHat,
  Eye,
  Pencil,
  Trash2,
  X,
  Phone,
  User,
  Users,
  Briefcase
} from 'lucide-react';
import { BranchLocation, CompanyEntity } from './types';

interface CompanyBranchesTabProps {
  branches: BranchLocation[];
  companies: CompanyEntity[];
  onAddBranch: (branch: BranchLocation) => void;
  onUpdateBranch: (branch: BranchLocation) => void;
  onDeleteBranch: (id: string) => void;
}

export const CompanyBranchesTab: React.FC<CompanyBranchesTabProps> = ({
  branches,
  companies,
  onAddBranch,
  onUpdateBranch,
  onDeleteBranch
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<BranchLocation | null>(null);
  const [viewBranch, setViewBranch] = useState<BranchLocation | null>(null);

  // Form State
  const [formCompanyId, setFormCompanyId] = useState('');
  const [formNameAr, setFormNameAr] = useState('');
  const [formTypeAr, setFormTypeAr] = useState<BranchLocation['typeAr']>('مقر رئيسي');
  const [formCityAr, setFormCityAr] = useState('');
  const [formAddressAr, setFormAddressAr] = useState('');
  const [formManagerAr, setFormManagerAr] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formStaffCount, setFormStaffCount] = useState<number>(25);
  const [formActiveProjects, setFormActiveProjects] = useState<number>(2);

  const handleOpenAdd = () => {
    setEditingBranch(null);
    setFormCompanyId(companies[0]?.id || '');
    setFormNameAr('');
    setFormTypeAr('فرع إقليمي');
    setFormCityAr('القاهرة');
    setFormAddressAr('');
    setFormManagerAr('');
    setFormPhone('');
    setFormStaffCount(20);
    setFormActiveProjects(1);
    setModalOpen(true);
  };

  const handleOpenEdit = (branch: BranchLocation) => {
    setEditingBranch(branch);
    setFormCompanyId(branch.companyId);
    setFormNameAr(branch.nameAr);
    setFormTypeAr(branch.typeAr);
    setFormCityAr(branch.cityAr);
    setFormAddressAr(branch.addressAr);
    setFormManagerAr(branch.managerAr);
    setFormPhone(branch.phone);
    setFormStaffCount(branch.staffCount);
    setFormActiveProjects(branch.activeProjects);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNameAr.trim()) return;

    const parentComp = companies.find(c => c.id === formCompanyId);
    const companyNameAr = parentComp ? parentComp.nameAr : 'شركة أركان للإنشاءات الهندسية (ش.م.م)';

    if (editingBranch) {
      const updated: BranchLocation = {
        ...editingBranch,
        companyId: formCompanyId,
        companyNameAr,
        nameAr: formNameAr,
        typeAr: formTypeAr,
        cityAr: formCityAr,
        addressAr: formAddressAr,
        managerAr: formManagerAr,
        phone: formPhone,
        staffCount: Number(formStaffCount) || 0,
        activeProjects: Number(formActiveProjects) || 0
      };
      onUpdateBranch(updated);
    } else {
      const newBranch: BranchLocation = {
        id: `branch_${Date.now()}`,
        companyId: formCompanyId,
        companyNameAr,
        nameAr: formNameAr,
        typeAr: formTypeAr,
        cityAr: formCityAr,
        addressAr: formAddressAr,
        managerAr: formManagerAr,
        phone: formPhone || '+20 2 0000 0000',
        staffCount: Number(formStaffCount) || 0,
        activeProjects: Number(formActiveProjects) || 0
      };
      onAddBranch(newBranch);
    }
    setModalOpen(false);
  };

  const getBranchIcon = (type: string) => {
    if (type.includes('مستودع')) return <Warehouse className="w-5 h-5" />;
    if (type.includes('موقع')) return <HardHat className="w-5 h-5" />;
    return <Building className="w-5 h-5" />;
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-black text-[#1A241C] dark:text-[#F3EFE6]">
            الفروع والمواقع الإدارية والميدانية
          </h3>
          <p className="text-xs text-[#5C665E] dark:text-[#8FA392]">
            إدارة المقرات الرئيسية والفروع الإقليمية ومستودعات التشوين ومكاتب المشروعات
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="min-h-[44px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#D97706] text-white text-xs font-bold hover:bg-[#B45309] transition-colors shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ إضافة فرع جديد</span>
        </button>
      </div>

      {/* Branches Grid (Fluid Responsive) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 w-full">
        {branches.map(branch => (
          <div
            key={branch.id}
            className="p-4 sm:p-5 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#D97706]/15 text-[#D97706] flex items-center justify-center shrink-0">
                    {getBranchIcon(branch.typeAr)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#1A241C] dark:text-[#F3EFE6] leading-tight">
                      {branch.nameAr}
                    </h4>
                    <span className="text-[11px] font-bold text-[#D97706] dark:text-[#EBB34D] block mt-0.5">
                      {branch.typeAr} • {branch.cityAr}
                    </span>
                  </div>
                </div>

                <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-[#EAE4D7] dark:bg-[#1F2E23] text-[#5C665E] dark:text-[#8FA392] shrink-0 border border-[#E0D9CB] dark:border-[#243628]">
                  {branch.cityAr}
                </span>
              </div>

              {/* Explicit Parent Company Display */}
              <div className="mb-3 px-3 py-1.5 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB]/70 dark:border-[#243628] text-xs">
                <span className="text-[#5C665E] dark:text-[#8FA392] text-[11px] block">الشركة التابعة:</span>
                <strong className="text-[#1A241C] dark:text-[#F3EFE6] font-bold block">{branch.companyNameAr}</strong>
              </div>

              {/* Vital Details */}
              <div className="p-3 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] text-xs text-[#5C665E] dark:text-[#8FA392] space-y-1.5 border border-[#E0D9CB]/60 dark:border-[#243628] mb-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#D97706]" />
                    <span>المدير المسؤول:</span>
                  </span>
                  <strong className="text-[#1A241C] dark:text-[#F3EFE6]">{branch.managerAr}</strong>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#D97706]" />
                    <span>الهاتف:</span>
                  </span>
                  <strong className="text-[#1A241C] dark:text-[#F3EFE6] font-mono">{branch.phone}</strong>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#D97706]" />
                    <span>العنوان:</span>
                  </span>
                  <span className="text-[#1A241C] dark:text-[#F3EFE6] truncate max-w-[200px]" title={branch.addressAr}>
                    {branch.addressAr}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold text-[#5C665E] dark:text-[#8FA392] mb-3">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  <span>{branch.staffCount} موظف</span>
                </span>
                <span className="flex items-center gap-1.5 text-[#D97706] dark:text-[#EBB34D]">
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>{branch.activeProjects} مشاريع جارية</span>
                </span>
              </div>
            </div>

            {/* Actions Row */}
            <div className="pt-3 border-t border-[#E0D9CB]/70 dark:border-[#243628] flex items-center justify-end gap-2">
              <button
                onClick={() => setViewBranch(branch)}
                className="min-h-[44px] flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#EAE4D7] dark:bg-[#1F2E23] hover:bg-[#D97706]/20 hover:text-[#D97706] text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] transition-colors"
              >
                <Eye className="w-4 h-4 text-[#D97706]" />
                <span>عرض التفاصيل</span>
              </button>

              <button
                onClick={() => handleOpenEdit(branch)}
                className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#EAE4D7] dark:bg-[#1F2E23] hover:bg-[#D97706]/20 hover:text-[#D97706] text-[#5C665E] dark:text-[#8FA392] text-xs font-bold transition-colors flex items-center gap-1"
                title="تعديل بيانات الفرع"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>تعديل</span>
              </button>

              <button
                onClick={() => onDeleteBranch(branch.id)}
                className="min-h-[44px] p-2.5 rounded-xl bg-[#EAE4D7] dark:bg-[#1F2E23] hover:bg-red-500/20 hover:text-red-500 text-[#5C665E] dark:text-[#8FA392] transition-colors"
                title="حذف الفرع"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: إضافة / تعديل فرع */}
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
                    <MapPin className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                    {editingBranch ? 'تعديل بيانات الفرع أو الموقع' : 'إضافة فرع / موقع جديد'}
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
                {/* Parent Company Dropdown (Arabic Names Only) */}
                <div>
                  <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                    الشركة التابع لها الفرع *
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

                <div>
                  <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                    مسمى الفرع / الموقع *
                  </label>
                  <input
                    type="text"
                    required
                    value={formNameAr}
                    onChange={e => setFormNameAr(e.target.value)}
                    placeholder="مثال: فرع الإسكندرية والساحل الشمالي"
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none focus:border-[#D97706]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                      نوع المقر *
                    </label>
                    <select
                      value={formTypeAr}
                      onChange={e => setFormTypeAr(e.target.value as BranchLocation['typeAr'])}
                      className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none focus:border-[#D97706]"
                    >
                      <option value="مقر رئيسي">مقر إداري رئيسي</option>
                      <option value="فرع إقليمي">فرع إقليمي</option>
                      <option value="مستودع تشوين وورش">مستودع تشوين وورش</option>
                      <option value="مكتب موقع">مكتب موقع مشروع</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                      المدينة / المحافظة *
                    </label>
                    <input
                      type="text"
                      required
                      value={formCityAr}
                      onChange={e => setFormCityAr(e.target.value)}
                      placeholder="القاهرة الجديدة / الإسكندرية..."
                      className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none focus:border-[#D97706]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                    العنوان التفصيلي
                  </label>
                  <input
                    type="text"
                    value={formAddressAr}
                    onChange={e => setFormAddressAr(e.target.value)}
                    placeholder="شارع، مبنى، رقم الطابق..."
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none focus:border-[#D97706]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                      المدير المسؤول *
                    </label>
                    <input
                      type="text"
                      required
                      value={formManagerAr}
                      onChange={e => setFormManagerAr(e.target.value)}
                      placeholder="م. إسلام الجندي"
                      className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none focus:border-[#D97706]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                      رقم الهاتف *
                    </label>
                    <input
                      type="text"
                      required
                      value={formPhone}
                      onChange={e => setFormPhone(e.target.value)}
                      placeholder="+20 2 2810 5000"
                      className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6] font-mono focus:outline-none focus:border-[#D97706]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                      عدد الموظفين
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formStaffCount}
                      onChange={e => setFormStaffCount(Number(e.target.value) || 0)}
                      className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6] font-mono focus:outline-none focus:border-[#D97706]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                      المشاريع المربوطة
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formActiveProjects}
                      onChange={e => setFormActiveProjects(Number(e.target.value) || 0)}
                      className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6] font-mono focus:outline-none focus:border-[#D97706]"
                    />
                  </div>
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
                    {editingBranch ? 'حفظ التعديلات' : 'إضافة الفرع'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: عرض تفاصيل الفرع */}
      <AnimatePresence>
        {viewBranch && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#FBF9F5] dark:bg-[#0E1610] rounded-2xl border border-[#E0D9CB] dark:border-[#243628] shadow-2xl overflow-hidden p-5 text-start"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#E0D9CB] dark:border-[#243628] mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#D97706]/15 text-[#D97706] flex items-center justify-center">
                    {getBranchIcon(viewBranch.typeAr)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                      {viewBranch.nameAr}
                    </h3>
                    <span className="text-[11px] text-[#5C665E] dark:text-[#8FA392]">
                      {viewBranch.typeAr}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setViewBranch(null)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-[#F3EFE6] dark:bg-[#17231A] space-y-1.5 border border-[#E0D9CB]/70 dark:border-[#243628]">
                  <div className="flex justify-between">
                    <span className="text-[#5C665E] dark:text-[#8FA392]">الشركة التابعة:</span>
                    <strong className="text-[#1A241C] dark:text-[#F3EFE6]">{viewBranch.companyNameAr}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5C665E] dark:text-[#8FA392]">المدينة:</span>
                    <strong className="text-[#1A241C] dark:text-[#F3EFE6]">{viewBranch.cityAr}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5C665E] dark:text-[#8FA392]">العنوان:</span>
                    <strong className="text-[#1A241C] dark:text-[#F3EFE6]">{viewBranch.addressAr}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5C665E] dark:text-[#8FA392]">المدير المسؤول:</span>
                    <strong className="text-[#1A241C] dark:text-[#F3EFE6]">{viewBranch.managerAr}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5C665E] dark:text-[#8FA392]">الهاتف:</span>
                    <strong className="text-[#1A241C] dark:text-[#F3EFE6] font-mono">{viewBranch.phone}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5C665E] dark:text-[#8FA392]">الموظفون بالمقر:</span>
                    <strong className="text-[#1A241C] dark:text-[#F3EFE6]">{viewBranch.staffCount} موظف</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5C665E] dark:text-[#8FA392]">المشاريع المربوطة:</span>
                    <strong className="text-[#D97706] font-bold">{viewBranch.activeProjects} مشاريع</strong>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setViewBranch(null)}
                    className="min-h-[44px] px-5 py-2 rounded-xl bg-[#D97706] text-white font-bold text-xs hover:bg-[#B45309]"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
