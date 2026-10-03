import React, { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import {
  Building2,
  Building,
  Plus,
  Eye,
  Pencil,
  Trash2,
  FilePlus,
  Power,
  Users,
  PieChart,
  ShieldCheck,
  X,
  AlertCircle
} from 'lucide-react';
import { CompanyEntity, Shareholder } from './types';
import { formatCurrency, formatNumber } from '../../../utils/formatters';

interface CompanyDirectoryTabProps {
  companies: CompanyEntity[];
  onAddCompany: (comp: CompanyEntity) => void;
  onUpdateCompany: (comp: CompanyEntity) => void;
  onDeleteCompany: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onOpenAddDocumentForCompany: (comp: CompanyEntity) => void;
}

// 3D Spotlight Interactive Card
const SpotlightCompanyCard: React.FC<{
  company: CompanyEntity;
  onView: (comp: CompanyEntity) => void;
  onEdit: (comp: CompanyEntity) => void;
  onAddDoc: (comp: CompanyEntity) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
}> = ({ company, onView, onEdit, onAddDoc, onDelete, onToggleStatus }) => {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [isHovered, setIsHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-120, 120], [4, -4]), { damping: 25, stiffness: 300 });
  const rotateY = useSpring(useTransform(x, [-120, 120], [-4, 4]), { damping: 25, stiffness: 300 });
  const scale = useSpring(isHovered ? 1.01 : 1, { damping: 25, stiffness: 300 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const posX = e.clientX - rect.left;
    const posY = e.clientY - rect.top;
    setMousePos({ x: posX, y: posY });
    x.set(posX - rect.width / 2);
    y.set(posY - rect.height / 2);
  };

  const formattedCapital = formatCurrency(company.issuedCapital);

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePos({ x: -1000, y: -1000 });
        x.set(0);
        y.set(0);
      }}
      style={{ rotateX, rotateY, scale, transformStyle: 'preserve-3d' }}
      className={`relative p-5 rounded-2xl border transition-all duration-200 bg-[#F3EFE6] dark:bg-[#17231A] flex flex-col justify-between overflow-hidden shadow-xs ${
        company.status === 'inactive'
          ? 'opacity-65 border-dashed border-gray-400'
          : 'border-[#E0D9CB] dark:border-[#243628] hover:border-[#D97706]/50'
      }`}
    >
      {/* Spotlight Effect */}
      <div
        className="pointer-events-none absolute -inset-px rounded-2xl transition-opacity duration-300 opacity-0 group-hover:opacity-100"
        style={{
          background: `radial-gradient(350px circle at ${mousePos.x}px ${mousePos.y}px, rgba(217, 155, 38, 0.15), transparent 70%)`
        }}
      />

      {/* Header Info */}
      <div className="relative z-10">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#D97706]/15 text-[#D97706] dark:text-[#EBB34D] flex items-center justify-center shrink-0">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#1A241C] dark:text-[#F3EFE6] leading-snug">
                {company.nameAr}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] font-bold text-[#D97706] dark:text-[#EBB34D]">
                  {company.legalType}
                </span>
                <span className="text-[11px] text-[#5C665E] dark:text-[#8FA392]">
                  تأسست عام {company.establishedYear}
                </span>
              </div>
            </div>
          </div>

          <span
            className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold shrink-0 ${
              company.status === 'active'
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                : 'bg-gray-400/20 text-gray-500'
            }`}
          >
            {company.status === 'active' ? 'نشطة رسمياً' : 'معطلة مؤقتاً'}
          </span>
        </div>

        {/* Vital Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 my-3 p-3 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] text-xs border border-[#E0D9CB]/70 dark:border-[#243628]">
          <div>
            <span className="text-[11px] text-[#5C665E] dark:text-[#8FA392] block">رأس المال المصدر:</span>
            <strong className="text-[#1A241C] dark:text-[#F3EFE6] font-bold text-xs">{formattedCapital} ج.م</strong>
          </div>
          <div>
            <span className="text-[11px] text-[#5C665E] dark:text-[#8FA392] block">السجل التجاري:</span>
            <strong className="text-[#1A241C] dark:text-[#F3EFE6] font-bold text-xs font-mono">{company.crNumber}</strong>
          </div>
          <div>
            <span className="text-[11px] text-[#5C665E] dark:text-[#8FA392] block">المدير المسؤول:</span>
            <strong className="text-[#1A241C] dark:text-[#F3EFE6] font-bold text-xs">{company.ceoAr}</strong>
          </div>
        </div>

        {/* Additional Stats & Shareholders count */}
        <div className="flex flex-wrap items-center justify-between text-xs text-[#5C665E] dark:text-[#8FA392] pb-3 gap-2">
          <span>البطاقة الضريبية: <strong className="font-mono text-[#1A241C] dark:text-[#F3EFE6]">{company.taxNumber}</strong></span>
          <div className="flex items-center gap-3 font-semibold text-[11px]">
            <span className="flex items-center gap-1 text-[#D97706] dark:text-[#EBB34D]">
              <Users className="w-3.5 h-3.5" />
              <span>{company.shareholders.length} مساهمين</span>
            </span>
            <span>•</span>
            <span>{company.branchesCount} فروع</span>
            <span>•</span>
            <span>{company.projectsCount} مشاريع</span>
          </div>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="pt-3 border-t border-[#E0D9CB]/70 dark:border-[#243628] flex flex-wrap items-center justify-between gap-1.5 relative z-10">
        <button
          onClick={() => onView(company)}
          className="flex-1 min-h-[44px] flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#EAE4D7] dark:bg-[#1F2E23] hover:bg-[#D97706]/20 hover:text-[#D97706] dark:hover:text-[#EBB34D] text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] transition-all"
        >
          <Eye className="w-4 h-4 text-[#D97706]" />
          <span>عرض التفاصيل</span>
        </button>

        <button
          onClick={() => onEdit(company)}
          className="min-h-[44px] px-3 py-2 rounded-xl bg-[#EAE4D7] dark:bg-[#1F2E23] hover:bg-[#D97706]/20 hover:text-[#D97706] text-[#5C665E] dark:text-[#8FA392] text-xs font-bold transition-colors flex items-center gap-1"
          title="تعديل بيانات الشركة وهيكل المساهمين"
        >
          <Pencil className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">تعديل</span>
        </button>

        <button
          onClick={() => onAddDoc(company)}
          className="min-h-[44px] px-3 py-2 rounded-xl bg-[#EAE4D7] dark:bg-[#1F2E23] hover:bg-[#D97706]/20 hover:text-[#D97706] text-[#5C665E] dark:text-[#8FA392] text-xs font-bold transition-colors flex items-center gap-1"
          title="إضافة مستند أو ترخيص لهذه الشركة"
        >
          <FilePlus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span className="hidden sm:inline">مستند</span>
        </button>

        <button
          onClick={() => onToggleStatus(company.id)}
          className="min-h-[44px] p-2.5 rounded-xl bg-[#EAE4D7] dark:bg-[#1F2E23] hover:bg-amber-500/20 text-[#5C665E] dark:text-[#8FA392] transition-colors"
          title={company.status === 'active' ? 'تعطيل مؤقت' : 'تفعيل'}
        >
          <Power className="w-4 h-4" />
        </button>

        <button
          onClick={() => onDelete(company.id)}
          className="min-h-[44px] p-2.5 rounded-xl bg-[#EAE4D7] dark:bg-[#1F2E23] hover:bg-red-500/20 hover:text-red-500 text-[#5C665E] dark:text-[#8FA392] transition-colors"
          title="حذف / أرشفة الشركة"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

export const CompanyDirectoryTab: React.FC<CompanyDirectoryTabProps> = ({
  companies,
  onAddCompany,
  onUpdateCompany,
  onDeleteCompany,
  onToggleStatus,
  onOpenAddDocumentForCompany
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<CompanyEntity | null>(null);
  const [viewDetailsCompany, setViewDetailsCompany] = useState<CompanyEntity | null>(null);

  // Form State
  const [nameAr, setNameAr] = useState('');
  const [legalType, setLegalType] = useState<CompanyEntity['legalType']>('ش.م.م');
  const [totalShares, setTotalShares] = useState<number>(5000000);
  const [nominalShareValue, setNominalShareValue] = useState<number>(100);
  const [crNumber, setCrNumber] = useState('');
  const [crOffice, setCrOffice] = useState('');
  const [taxNumber, setTaxNumber] = useState('');
  const [ceoAr, setCeoAr] = useState('');
  const [establishedYear, setEstablishedYear] = useState('2024');

  // Shareholders Repeater State
  const [shareholders, setShareholders] = useState<Shareholder[]>([
    {
      id: 'sh_temp_1',
      name: '',
      entityType: 'فرد',
      sharesCount: 0,
      ownershipPercent: 0,
      nationality: 'مصري'
    }
  ]);

  // Derived Capital calculation
  const calculatedCapital = totalShares * nominalShareValue;
  const totalAllocatedShares = shareholders.reduce((acc, sh) => acc + (Number(sh.sharesCount) || 0), 0);
  const totalOwnershipPercent = shareholders.reduce((acc, sh) => acc + (Number(sh.ownershipPercent) || 0), 0);
  const remainingShares = totalShares - totalAllocatedShares;

  const handleOpenAddModal = () => {
    setEditingCompany(null);
    setNameAr('');
    setLegalType('ش.م.م');
    setTotalShares(1000000);
    setNominalShareValue(100);
    setCrNumber('');
    setCrOffice('مكتب سجل تجاري القاهرة');
    setTaxNumber('');
    setCeoAr('');
    setEstablishedYear(String(new Date().getFullYear()));
    setShareholders([
      {
        id: `sh_${Date.now()}_1`,
        name: '',
        entityType: 'فرد',
        sharesCount: 1000000,
        ownershipPercent: 100,
        nationality: 'مصري'
      }
    ]);
    setModalOpen(true);
  };

  const handleOpenEditModal = (comp: CompanyEntity) => {
    setEditingCompany(comp);
    setNameAr(comp.nameAr);
    setLegalType(comp.legalType);
    setTotalShares(comp.totalShares || 1000000);
    setNominalShareValue(comp.nominalShareValue || 100);
    setCrNumber(comp.crNumber);
    setCrOffice(comp.crOffice);
    setTaxNumber(comp.taxNumber);
    setCeoAr(comp.ceoAr);
    setEstablishedYear(comp.establishedYear);
    setShareholders(comp.shareholders.map(s => ({ ...s })));
    setModalOpen(true);
  };

  // Shareholders Repeater actions
  const handleAddShareholderRow = () => {
    const unallocated = Math.max(0, totalShares - totalAllocatedShares);
    const percent = totalShares > 0 ? (unallocated / totalShares) * 100 : 0;
    setShareholders(prev => [
      ...prev,
      {
        id: `sh_${Date.now()}_${prev.length + 1}`,
        name: '',
        entityType: 'فرد',
        sharesCount: unallocated,
        ownershipPercent: Number(percent.toFixed(2)),
        nationality: 'مصري'
      }
    ]);
  };

  const handleRemoveShareholderRow = (id: string) => {
    if (shareholders.length === 1) return;
    setShareholders(prev => prev.filter(s => s.id !== id));
  };

  const handleShareholderChange = (id: string, field: keyof Shareholder, val: string | number) => {
    setShareholders(prev =>
      prev.map(sh => {
        if (sh.id !== id) return sh;
        const updated = { ...sh, [field]: val };
        if (field === 'sharesCount') {
          const numShares = Number(val) || 0;
          updated.sharesCount = numShares;
          updated.ownershipPercent = totalShares > 0 ? Number(((numShares / totalShares) * 100).toFixed(2)) : 0;
        }
        return updated;
      })
    );
  };

  const handleTotalSharesChange = (newTotal: number) => {
    setTotalShares(newTotal);
    // Recalculate all percentages
    if (newTotal > 0) {
      setShareholders(prev =>
        prev.map(sh => ({
          ...sh,
          ownershipPercent: Number(((sh.sharesCount / newTotal) * 100).toFixed(2))
        }))
      );
    }
  };

  const handleSubmitCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameAr.trim()) return;

    if (editingCompany) {
      const updated: CompanyEntity = {
        ...editingCompany,
        nameAr,
        legalType,
        totalShares,
        nominalShareValue,
        issuedCapital: calculatedCapital,
        paidCapital: calculatedCapital,
        crNumber,
        crOffice,
        taxNumber,
        ceoAr,
        establishedYear,
        shareholders
      };
      onUpdateCompany(updated);
    } else {
      const newComp: CompanyEntity = {
        id: `comp_${Date.now()}`,
        nameAr,
        legalType,
        totalShares,
        nominalShareValue,
        issuedCapital: calculatedCapital,
        paidCapital: calculatedCapital,
        crNumber: crNumber || '10293 / استثمار القاهرة',
        crOffice: crOffice || 'مكتب سجل تجاري القاهرة',
        taxNumber: taxNumber || '100-200-300',
        establishedYear: establishedYear || String(new Date().getFullYear()),
        ceoAr: ceoAr || 'المدير التنفيذي',
        branchesCount: 1,
        projectsCount: 0,
        status: 'active',
        shareholders
      };
      onAddCompany(newComp);
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Header & CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-black text-[#1A241C] dark:text-[#F3EFE6]">
            دليل الشركات المسجلة والمساهمات
          </h3>
          <p className="text-xs text-[#5C665E] dark:text-[#8FA392]">
            إدارة الكيانات والشركات التابعة، وحصص المساهمين ورؤوس الأموال المعتمدة
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="min-h-[44px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#D97706] text-white text-xs font-bold hover:bg-[#B45309] transition-colors shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ إضافة شركة جديدة</span>
        </button>
      </div>

      {/* Grid of Company Cards (Fluid Responsive) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 w-full">
        {companies.map(comp => (
          <SpotlightCompanyCard
            key={comp.id}
            company={comp}
            onView={setViewDetailsCompany}
            onEdit={handleOpenEditModal}
            onAddDoc={onOpenAddDocumentForCompany}
            onDelete={onDeleteCompany}
            onToggleStatus={onToggleStatus}
          />
        ))}
      </div>

      {/* Modal 1: إضافة / تعديل شركة مع هيكل المساهمين */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl max-h-[90vh] flex flex-col bg-[#FBF9F5] dark:bg-[#0E1610] rounded-2xl border border-[#E0D9CB] dark:border-[#243628] shadow-2xl overflow-hidden text-start"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-[#E0D9CB] dark:border-[#243628] shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#D97706]/15 text-[#D97706] flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                      {editingCompany ? 'تعديل بيانات الشركة وهيكل المساهمين' : 'تسجيل شركة جديدة'}
                    </h3>
                    <span className="text-[11px] text-[#5C665E] dark:text-[#8FA392]">
                      البيانات القانونية ورأس المال وتوزيع الحصص
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body (Scrollable) */}
              <form onSubmit={handleSubmitCompany} className="p-4 sm:p-5 space-y-4 overflow-y-auto text-xs">
                {/* 1. Core Corporate Info */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase text-[#D97706] tracking-wider flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5" />
                    <span>البيانات الأساسية والقانونية</span>
                  </h4>

                  <div>
                    <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                      اسم الشركة بالكامل (بالعربية) *
                    </label>
                    <input
                      type="text"
                      required
                      value={nameAr}
                      onChange={e => setNameAr(e.target.value)}
                      placeholder="مثال: شركة أركان للإنشاءات الهندسية (ش.م.م)"
                      className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none focus:border-[#D97706]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                        الشكل القانوني *
                      </label>
                      <select
                        value={legalType}
                        onChange={e => setLegalType(e.target.value as CompanyEntity['legalType'])}
                        className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none focus:border-[#D97706]"
                      >
                        <option value="ش.م.م">ش.م.م (شركة مساهمة مصرية)</option>
                        <option value="ذ.م.م">ذ.م.م (شركة ذات مسؤولية محدودة)</option>
                        <option value="شركة تضامن">شركة تضامن</option>
                        <option value="فرع أجنبي">فرع شركة أجنبية</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                        المدير التنفيذي المسؤول *
                      </label>
                      <input
                        type="text"
                        required
                        value={ceoAr}
                        onChange={e => setCeoAr(e.target.value)}
                        placeholder="م. أحمد مصطفى"
                        className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none focus:border-[#D97706]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                        رقم السجل التجاري *
                      </label>
                      <input
                        type="text"
                        required
                        value={crNumber}
                        onChange={e => setCrNumber(e.target.value)}
                        placeholder="44912 / جنوب القاهرة"
                        className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none focus:border-[#D97706] font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                        مكتب السجل التجاري
                      </label>
                      <input
                        type="text"
                        value={crOffice}
                        onChange={e => setCrOffice(e.target.value)}
                        placeholder="مكتب استثمار القاهرة"
                        className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none focus:border-[#D97706]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                        البطاقة الضريبية *
                      </label>
                      <input
                        type="text"
                        required
                        value={taxNumber}
                        onChange={e => setTaxNumber(e.target.value)}
                        placeholder="210-948-112"
                        className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none focus:border-[#D97706] font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Shareholders & Equity Engine */}
                <div className="pt-3 border-t border-[#E0D9CB] dark:border-[#243628] space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h4 className="text-xs font-black uppercase text-[#D97706] tracking-wider flex items-center gap-1.5">
                      <PieChart className="w-3.5 h-3.5" />
                      <span>هيكل الملكية والمساهمين ورأس المال</span>
                    </h4>

                    <div className="flex items-center gap-2 text-[11px] font-bold">
                      <span className="px-2 py-0.5 rounded-md bg-[#D97706]/15 text-[#D97706]">
                        {shareholders.length} مساهمين مسجلين
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628]">
                    <div>
                      <label className="block font-semibold text-[#5C665E] dark:text-[#8FA392] mb-1">
                        إجمالي عدد الأسهم:
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={totalShares}
                        onChange={e => handleTotalSharesChange(Number(e.target.value) || 0)}
                        className="w-full min-h-[44px] px-3 py-1.5 rounded-lg border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#0E1610] text-[#1A241C] dark:text-[#F3EFE6] font-bold font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-[#5C665E] dark:text-[#8FA392] mb-1">
                        القيمة الاسمية للسهم (ج.م):
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={nominalShareValue}
                        onChange={e => setNominalShareValue(Number(e.target.value) || 0)}
                        className="w-full min-h-[44px] px-3 py-1.5 rounded-lg border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#0E1610] text-[#1A241C] dark:text-[#F3EFE6] font-bold font-mono"
                      />
                    </div>

                    <div>
                      <span className="block font-semibold text-[#5C665E] dark:text-[#8FA392] mb-1">
                        رأس المال المصدر (محسوب):
                      </span>
                      <div className="min-h-[44px] px-3 py-2 rounded-lg bg-[#EAE4D7] dark:bg-[#1F2E23] flex items-center font-black text-sm text-[#1A241C] dark:text-[#F3EFE6]">
                        {formatCurrency(calculatedCapital)}
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Shareholders Repeater */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#1A241C] dark:text-[#F3EFE6]">جدول توزيع الحصص والمساهمين:</span>
                      <button
                        type="button"
                        onClick={handleAddShareholderRow}
                        className="min-h-[38px] px-3 py-1.5 rounded-xl bg-[#D97706]/15 hover:bg-[#D97706]/25 text-[#D97706] font-bold text-xs flex items-center gap-1 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ إضافة مساهم</span>
                      </button>
                    </div>

                    <div className="border border-[#E0D9CB] dark:border-[#243628] rounded-xl overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead className="bg-[#EAE4D7] dark:bg-[#1F2E23] text-[#1A241C] dark:text-[#F3EFE6] border-b border-[#E0D9CB] dark:border-[#243628]">
                            <tr>
                              <th className="p-2.5 text-start whitespace-nowrap">اسم المساهم</th>
                              <th className="p-2.5 text-start whitespace-nowrap">الصفة / الكيان</th>
                              <th className="p-2.5 text-start whitespace-nowrap">عدد الأسهم</th>
                              <th className="p-2.5 text-start whitespace-nowrap">نسبة المساهمة (%)</th>
                              <th className="p-2.5 text-center whitespace-nowrap">حذف</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#E0D9CB]/60 dark:divide-[#243628]">
                            {shareholders.map(sh => (
                              <tr key={sh.id} className="bg-[#FBF9F5] dark:bg-[#0E1610]">
                                <td className="p-2">
                                  <input
                                    type="text"
                                    required
                                    value={sh.name}
                                    onChange={e => handleShareholderChange(sh.id, 'name', e.target.value)}
                                    placeholder="اسم الشريك أو المؤسسة"
                                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6] text-xs font-bold"
                                  />
                                </td>
                                <td className="p-2">
                                  <select
                                    value={sh.entityType}
                                    onChange={e => handleShareholderChange(sh.id, 'entityType', e.target.value)}
                                    className="w-full px-2 py-1.5 rounded-lg border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6] text-xs"
                                  >
                                    <option value="فرد">فرد</option>
                                    <option value="مؤسسة">مؤسسة / شركة</option>
                                    <option value="شريك متضامن">شريك متضامن</option>
                                    <option value="شريك موصي">شريك موصي</option>
                                    <option value="صندوق استثماري">صندوق استثماري</option>
                                  </select>
                                </td>
                                <td className="p-2">
                                  <input
                                    type="number"
                                    min="0"
                                    required
                                    value={sh.sharesCount}
                                    onChange={e => handleShareholderChange(sh.id, 'sharesCount', Number(e.target.value) || 0)}
                                    className="w-28 px-2.5 py-1.5 rounded-lg border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6] text-xs font-mono font-bold"
                                  />
                                </td>
                                <td className="p-2 font-mono font-bold text-xs text-[#D97706] whitespace-nowrap">
                                  {sh.ownershipPercent}%
                                </td>
                                <td className="p-2 text-center">
                                  <button
                                    type="button"
                                    disabled={shareholders.length === 1}
                                    onClick={() => handleRemoveShareholderRow(sh.id)}
                                    className="p-1.5 text-gray-400 hover:text-red-500 disabled:opacity-30 disabled:hover:text-gray-400 rounded-lg"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Ownership summary alert */}
                    <div className="flex flex-wrap items-center justify-between p-2.5 rounded-xl bg-[#EAE4D7]/70 dark:bg-[#1F2E23]/70 text-[11px] font-semibold">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>إجمالي الأسهم الموزعة: <strong>{formatNumber(totalAllocatedShares)}</strong> من أصل <strong>{formatNumber(totalShares)}</strong></span>
                      </span>

                      <span className={Math.abs(totalOwnershipPercent - 100) < 0.1 ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold flex items-center gap-1'}>
                        {Math.abs(totalOwnershipPercent - 100) < 0.1 ? (
                          'مكتمل التوزيع بنسبة 100%'
                        ) : (
                          <>
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>المتبقي: {remainingShares > 0 ? `${formatNumber(remainingShares)} سهم` : 'تجاوز في التوزيع!'}</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Modal Footer Actions */}
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
                    {editingCompany ? 'حفظ التعديلات' : 'تسجيل الشركة رسمياً'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal 2: عرض ملف الشركة الكامل وهيكل المساهمين */}
      <AnimatePresence>
        {viewDetailsCompany && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-[#FBF9F5] dark:bg-[#0E1610] rounded-2xl border border-[#E0D9CB] dark:border-[#243628] shadow-2xl overflow-hidden p-5 text-start"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#E0D9CB] dark:border-[#243628] mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#D97706]/15 text-[#D97706] flex items-center justify-center">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#1A241C] dark:text-[#F3EFE6]">
                      {viewDetailsCompany.nameAr}
                    </h3>
                    <span className="text-xs text-[#5C665E] dark:text-[#8FA392]">
                      {viewDetailsCompany.legalType} • السجل التجاري: {viewDetailsCompany.crNumber}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setViewDetailsCompany(null)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                {/* Highlights Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB]/70 dark:border-[#243628]">
                  <div>
                    <span className="text-[11px] text-[#5C665E] dark:text-[#8FA392] block">رأس المال المصدر:</span>
                    <strong className="text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                      {formatCurrency(viewDetailsCompany.issuedCapital)}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#5C665E] dark:text-[#8FA392] block">عدد الأسهم:</span>
                    <strong className="text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] font-mono">
                      {formatNumber(viewDetailsCompany.totalShares)}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#5C665E] dark:text-[#8FA392] block">القيمة الاسمية:</span>
                    <strong className="text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                      {formatCurrency(viewDetailsCompany.nominalShareValue, false)} ج.م / سهم
                    </strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#5C665E] dark:text-[#8FA392] block">المدير المسؤول:</span>
                    <strong className="text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                      {viewDetailsCompany.ceoAr}
                    </strong>
                  </div>
                </div>

                {/* Shareholders Breakdown Table */}
                <div className="space-y-2">
                  <h4 className="font-bold text-xs text-[#1A241C] dark:text-[#F3EFE6] flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#D97706]" />
                    <span>هيكل المساهمين والملكية ({formatNumber(viewDetailsCompany.shareholders.length)} مساهمين):</span>
                  </h4>

                  <div className="border border-[#E0D9CB] dark:border-[#243628] rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead className="bg-[#EAE4D7] dark:bg-[#1F2E23] text-[#1A241C] dark:text-[#F3EFE6]">
                          <tr>
                            <th className="p-2.5 text-start whitespace-nowrap">المساهم</th>
                            <th className="p-2.5 text-start whitespace-nowrap">الصفة</th>
                            <th className="p-2.5 text-start whitespace-nowrap">الأسهم المملوكة</th>
                            <th className="p-2.5 text-start whitespace-nowrap">نسبة المساهمة</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E0D9CB]/60 dark:divide-[#243628]">
                          {viewDetailsCompany.shareholders.map(sh => (
                            <tr key={sh.id} className="bg-[#FBF9F5] dark:bg-[#0E1610]">
                              <td className="p-2.5 font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                                {sh.name}
                              </td>
                              <td className="p-2.5 text-[#5C665E] dark:text-[#8FA392]">
                                <span className="px-2 py-0.5 rounded-md bg-[#EAE4D7] dark:bg-[#1F2E23] text-[10.5px] font-semibold">
                                  {sh.entityType}
                                </span>
                              </td>
                              <td className="p-2.5 font-mono font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                                {formatNumber(sh.sharesCount)}
                              </td>
                              <td className="p-2.5">
                                <div className="flex items-center gap-2">
                                  <div className="w-20 bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                                    <div
                                      className="bg-[#D97706] h-full rounded-full"
                                      style={{ width: `${Math.min(100, sh.ownershipPercent)}%` }}
                                    />
                                  </div>
                                  <span className="font-mono font-bold text-[#D97706] text-xs">
                                    {sh.ownershipPercent}%
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setViewDetailsCompany(null)}
                    className="min-h-[44px] px-5 py-2 rounded-xl bg-[#D97706] text-white font-bold text-xs hover:bg-[#B45309]"
                  >
                    إغلاق الملف
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
