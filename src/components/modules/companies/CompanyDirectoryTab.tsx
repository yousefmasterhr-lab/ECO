import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import {
  Building2,
  Building,
  Plus,
  Eye,
  Pencil,
  Trash2,
  FileText,
  Power,
  Users,
  PieChart,
  ShieldCheck,
  X,
  AlertCircle,
  Clock,
  User,
  History,
  Download,
  Image as ImageIcon
} from 'lucide-react';
import {
  CompanyEntity,
  Shareholder,
  SmartDocument,
  CompanyDocumentAttachment
} from './types';
import { formatCurrency, formatNumber } from '../../../utils/formatters';

interface CompanyDirectoryTabProps {
  companies: CompanyEntity[];
  documents: SmartDocument[];
  onAddCompany: (comp: CompanyEntity) => void;
  onUpdateCompany: (comp: CompanyEntity) => void;
  onDeleteCompany: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onOpenAddDocumentForCompany: (comp: CompanyEntity) => void;
}

function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// -------------------------------------------------------------
// 1. Company Card Component (3D Spotlight, Icon-Only Actions, Audit Icon)
// -------------------------------------------------------------
const SpotlightCompanyCard: React.FC<{
  company: CompanyEntity;
  index: number;
  docsCount: number;
  onView: (comp: CompanyEntity) => void;
  onEdit: (comp: CompanyEntity) => void;
  onOpenDocs: (comp: CompanyEntity) => void;
  onDelete: (comp: CompanyEntity) => void;
  onToggleStatus: (id: string) => void;
  onOpenAudit: (comp: CompanyEntity) => void;
}> = ({ company, index, docsCount, onView, onEdit, onOpenDocs, onDelete, onToggleStatus, onOpenAudit }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [isHovered, setIsHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-120, 120], [3, -3]), { damping: 25, stiffness: 300 });
  const rotateY = useSpring(useTransform(x, [-120, 120], [-3, 3]), { damping: 25, stiffness: 300 });
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
  const auditCount = company.auditLogs?.length || 0;

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.4) }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePos({ x: -1000, y: -1000 });
        x.set(0);
        y.set(0);
      }}
      style={{ rotateX, rotateY, scale, transformStyle: 'preserve-3d' }}
      className={`group relative p-5 rounded-2xl border transition-all duration-300 bg-white dark:bg-[#17231A] flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 ${
        company.status === 'inactive'
          ? 'opacity-70 border-dashed border-slate-300 dark:border-gray-600'
          : 'border-slate-200 dark:border-[#243628] hover:border-amber-500/60 dark:hover:border-amber-500/50'
      }`}
    >
      {/* Dynamic Cursor Spotlight Effect */}
      <div
        className="pointer-events-none absolute -inset-px rounded-2xl transition-opacity duration-300 opacity-0 group-hover:opacity-100"
        style={{
          background: `radial-gradient(350px circle at ${mousePos.x}px ${mousePos.y}px, rgba(217, 119, 6, 0.12), transparent 70%)`
        }}
      />

      {/* Header Info */}
      <div className="relative z-10">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-[#F3EFE6] leading-snug">
                {company.nameAr}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800/40">
                  {company.legalType}
                </span>
                {company.establishedYear && (
                  <span className="text-[11px] text-slate-500 dark:text-[#8FA392]">
                    تأسست عام {company.establishedYear}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Interactive Change Audit Log ("!" Exclamation Icon) */}
          <div className="relative shrink-0">
            <button
              onClick={() => onOpenAudit(company)}
              title="سجل تعديلات الكيان (Audit Trail)"
              className="group/audit relative p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-white transition-all shadow-xs"
            >
              <AlertCircle className="w-4 h-4 transition-transform group-hover/audit:scale-110" />
              {auditCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-white dark:ring-[#17231A] animate-pulse" />
              )}
            </button>
          </div>
        </div>

        {/* Vital Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 my-3 p-3 rounded-xl bg-slate-50 dark:bg-[#0E1610] text-xs border border-slate-200/80 dark:border-[#243628]">
          <div>
            <span className="text-[11px] text-slate-500 dark:text-[#8FA392] block">رأس المال المصدر:</span>
            <strong className="text-slate-900 dark:text-[#F3EFE6] font-bold text-xs">{formattedCapital}</strong>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 dark:text-[#8FA392] block">السجل التجاري:</span>
            <strong className="text-slate-900 dark:text-[#F3EFE6] font-bold text-xs font-mono">{company.crNumber || '—'}</strong>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 dark:text-[#8FA392] block">المدير المسؤول:</span>
            <strong className="text-slate-900 dark:text-[#F3EFE6] font-bold text-xs truncate block">{company.ceoAr || '—'}</strong>
          </div>
        </div>

        {/* Stats Row: Tax Card, Shareholders, and Document Count */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-[#8FA392] pb-3 gap-2">
          <span>البطاقة الضريبية: <strong className="font-mono text-slate-800 dark:text-[#F3EFE6]">{company.taxNumber || '—'}</strong></span>
          <div className="flex items-center gap-2.5 font-semibold text-[11px]">
            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
              <Users className="w-3.5 h-3.5" />
              <span>{company.shareholders?.length || 0} مساهمين</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
              <FileText className="w-3.5 h-3.5" />
              <span>{docsCount} وثائق</span>
            </span>
          </div>
        </div>
      </div>

      {/* Icon-Only Action Buttons Row with Accessible Tooltips */}
      <div className="pt-3 border-t border-slate-100 dark:border-[#243628] flex items-center justify-between gap-1.5 relative z-10">
        <div className="flex items-center gap-1.5">
          {/* 1. عرض التفاصيل */}
          <button
            onClick={() => onView(company)}
            title="عرض التفاصيل الكاملة"
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-[#1F2E23] hover:bg-amber-500/20 hover:text-amber-600 dark:hover:text-amber-400 text-slate-700 dark:text-[#E0D9CB] transition-all border border-slate-200/60 dark:border-transparent"
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* 2. تعديل البيانات */}
          <button
            onClick={() => onEdit(company)}
            title="تعديل بيانات الشركة وهيكل المساهمين"
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-[#1F2E23] hover:bg-amber-500/20 hover:text-amber-600 dark:hover:text-amber-400 text-slate-700 dark:text-[#E0D9CB] transition-all border border-slate-200/60 dark:border-transparent"
          >
            <Pencil className="w-4 h-4" />
          </button>

          {/* 3. المستندات والملفات */}
          <button
            onClick={() => onOpenDocs(company)}
            title="المستندات والملفات المرفقة"
            className="relative p-2.5 rounded-xl bg-slate-100 dark:bg-[#1F2E23] hover:bg-blue-500/20 hover:text-blue-600 dark:hover:text-blue-400 text-slate-700 dark:text-[#E0D9CB] transition-all border border-slate-200/60 dark:border-transparent"
          >
            <FileText className="w-4 h-4" />
            {docsCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full text-[9px] font-black bg-blue-600 text-white">
                {docsCount}
              </span>
            )}
          </button>

          {/* 4. تفعيل / تعطيل الكيان */}
          <button
            onClick={() => onToggleStatus(company.id)}
            title={company.status === 'active' ? 'تعطيل الكيان مؤقتاً' : 'تفعيل الكيان رسمياً'}
            className={`p-2.5 rounded-xl transition-all border ${
              company.status === 'active'
                ? 'bg-slate-100 dark:bg-[#1F2E23] text-emerald-600 hover:bg-emerald-500/20 border-slate-200/60 dark:border-transparent'
                : 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 border-rose-200 dark:border-rose-900/50'
            }`}
          >
            <Power className="w-4 h-4" />
          </button>
        </div>

        {/* 5. حذف الكيان */}
        <button
          onClick={() => onDelete(company)}
          title="حذف الكيان نهائياً"
          className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-500 hover:text-white text-rose-600 dark:text-rose-400 transition-all border border-rose-200/60 dark:border-rose-900/40"
        >
          <Trash2 className="w-4 h-4 text-rose-500 hover:text-white" />
        </button>
      </div>
    </motion.div>
  );
};

// -------------------------------------------------------------
// Main Directory Tab Component
// -------------------------------------------------------------
export const CompanyDirectoryTab: React.FC<CompanyDirectoryTabProps> = ({
  companies,
  documents,
  onAddCompany,
  onUpdateCompany,
  onDeleteCompany,
  onToggleStatus,
  onOpenAddDocumentForCompany
}) => {
  // Modal Visibility States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<CompanyEntity | null>(null);
  const [viewDetailsCompany, setViewDetailsCompany] = useState<CompanyEntity | null>(null);
  const [docsModalCompany, setDocsModalCompany] = useState<CompanyEntity | null>(null);
  const [auditLogCompany, setAuditLogCompany] = useState<CompanyEntity | null>(null);
  const [companyToDelete, setCompanyToDelete] = useState<CompanyEntity | null>(null);
  const [previewDocument, setPreviewDocument] = useState<CompanyDocumentAttachment | null>(null);

  // Form State
  const [nameAr, setNameAr] = useState('');
  const [legalType, setLegalType] = useState<CompanyEntity['legalType']>('ش.م.م');
  const [totalShares, setTotalShares] = useState<number>(1000000);
  const [nominalShareValue, setNominalShareValue] = useState<number>(100);
  const [crNumber, setCrNumber] = useState('');
  const [crOffice, setCrOffice] = useState('');
  const [taxNumber, setTaxNumber] = useState('');
  const [ceoAr, setCeoAr] = useState('');
  const [establishedYear, setEstablishedYear] = useState(String(new Date().getFullYear()));

  // Shareholders Repeater State
  const [shareholders, setShareholders] = useState<Shareholder[]>([
    {
      id: 'sh_temp_1',
      name: '',
      entityType: 'فرد',
      sharesCount: 1000000,
      ownershipPercent: 100,
      nationality: 'مصري'
    }
  ]);

  // Derived Capital Calculations
  const calculatedCapital = totalShares * nominalShareValue;
  const totalAllocatedShares = shareholders.reduce((acc, sh) => acc + (Number(sh.sharesCount) || 0), 0);
  const totalOwnershipPercent = shareholders.reduce((acc, sh) => acc + (Number(sh.ownershipPercent) || 0), 0);
  const remainingShares = totalShares - totalAllocatedShares;

  // Open Create Modal
  const handleOpenAddModal = () => {
    setEditingCompany(null);
    setNameAr('');
    setLegalType('ش.م.م');
    setTotalShares(1000000);
    setNominalShareValue(100);
    setCrNumber('');
    setCrOffice('');
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

  // Open Edit Modal
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
    setShareholders(
      comp.shareholders && comp.shareholders.length > 0
        ? comp.shareholders.map(s => ({ ...s }))
        : [
            {
              id: `sh_${Date.now()}_1`,
              name: '',
              entityType: 'فرد',
              sharesCount: comp.totalShares || 1000000,
              ownershipPercent: 100,
              nationality: 'مصري'
            }
          ]
    );
    setModalOpen(true);
  };

  // Shareholders Repeater Handlers
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
    if (newTotal > 0) {
      setShareholders(prev =>
        prev.map(sh => ({
          ...sh,
          ownershipPercent: Number(((sh.sharesCount / newTotal) * 100).toFixed(2))
        }))
      );
    }
  };

  // Submit Company (Create or Update)
  const handleSubmitCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameAr.trim()) return;

    if (editingCompany) {
      const updated: CompanyEntity = {
        ...editingCompany,
        nameAr: nameAr.trim(),
        legalType,
        totalShares,
        nominalShareValue,
        issuedCapital: calculatedCapital,
        paidCapital: calculatedCapital,
        crNumber: crNumber.trim(),
        crOffice: crOffice.trim(),
        taxNumber: taxNumber.trim(),
        ceoAr: ceoAr.trim(),
        establishedYear,
        shareholders,
        documents: editingCompany.documents || []
      };
      onUpdateCompany(updated);
    } else {
      const newComp: CompanyEntity = {
        id: `comp_${Date.now()}`,
        nameAr: nameAr.trim(),
        legalType,
        totalShares,
        nominalShareValue,
        issuedCapital: calculatedCapital,
        paidCapital: calculatedCapital,
        crNumber: crNumber.trim(),
        crOffice: crOffice.trim(),
        taxNumber: taxNumber.trim(),
        establishedYear: establishedYear || String(new Date().getFullYear()),
        ceoAr: ceoAr.trim(),
        branchesCount: 1,
        projectsCount: 0,
        status: 'active',
        shareholders,
        documents: []
      };
      onAddCompany(newComp);
    }
    setModalOpen(false);
  };

  // Delete Confirmation Handler
  const handleConfirmDelete = () => {
    if (!companyToDelete) return;
    onDeleteCompany(companyToDelete.id);
    setCompanyToDelete(null);
  };

  return (
    <div className="space-y-4">
      {/* Top Header & CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-black text-slate-900 dark:text-[#F3EFE6]">
            دليل الشركات المسجلة والمساهمات
          </h3>
          <p className="text-xs text-slate-500 dark:text-[#8FA392]">
            إدارة الكيانات المؤسسية، وحصص المساهمين ورؤوس الأموال والمستندات القانونية
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="min-h-[44px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-sm hover:shadow-md shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ إضافة شركة جديدة</span>
        </button>
      </div>

      {/* Empty State when no companies exist */}
      {companies.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="py-16 px-6 text-center rounded-3xl border border-slate-200 dark:border-[#243628] bg-white dark:bg-[#17231A] shadow-xs flex flex-col items-center justify-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-amber-500/15 border border-amber-500/25 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
            <Building2 className="w-10 h-10 stroke-[1.5]" />
          </div>
          <h4 className="text-base font-black text-slate-900 dark:text-[#F3EFE6] mb-1">
            لا توجد شركات مسجلة حالياً
          </h4>
          <p className="text-xs text-slate-500 dark:text-[#8FA392] max-w-md mb-6 leading-relaxed">
            ابدأ بتسجيل شركتك الأولى لتوثيق الهيكل القانوني ورأس المال وتوزيع الحصص ورفع الوثائق الرسمية
          </p>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل أول شركة الآن</span>
          </button>
        </motion.div>
      ) : (
        /* Grid of Company Cards (Fluid Responsive) */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 w-full">
          {companies.map((comp, idx) => (
            <SpotlightCompanyCard
              key={comp.id}
              company={comp}
              index={idx}
              docsCount={documents.filter(d => d.companyId === comp.id).length}
              onView={setViewDetailsCompany}
              onEdit={handleOpenEditModal}
              onOpenDocs={(comp) => setDocsModalCompany(comp)}
              onDelete={setCompanyToDelete}
              onToggleStatus={onToggleStatus}
              onOpenAudit={setAuditLogCompany}
            />
          ))}
        </div>
      )}

      {/* ============================================================= */}
      {/* Modal 1: تسجيل / تعديل شركة مع المرفقات وهيكل المساهمين       */}
      {/* ============================================================= */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl max-h-[92vh] flex flex-col bg-white dark:bg-[#0E1610] rounded-2xl border border-slate-200 dark:border-[#243628] shadow-2xl overflow-hidden text-start"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-[#243628] shrink-0 bg-slate-50/70 dark:bg-[#121B14]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-[#F3EFE6]">
                      {editingCompany ? 'تعديل بيانات الشركة وهيكل المساهمين' : 'تسجيل شركة جديدة'}
                    </h3>
                    <span className="text-[11px] text-slate-500 dark:text-[#8FA392]">
                      البيانات الرسمية، رأس المال، الوثائق، وتوزيع الحصص
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body (Scrollable) */}
              <form onSubmit={handleSubmitCompany} className="p-4 sm:p-5 space-y-5 overflow-y-auto text-xs">
                {/* 1. Core Corporate Info */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase text-amber-600 dark:text-amber-400 tracking-wider flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5" />
                    <span>البيانات الأساسية والقانونية</span>
                  </h4>

                  <div>
                    <label className="block font-bold text-slate-800 dark:text-[#F3EFE6] mb-1">
                      اسم الشركة الرسمي *
                    </label>
                    <input
                      type="text"
                      required
                      value={nameAr}
                      onChange={e => setNameAr(e.target.value)}
                      placeholder="أدخل الاسم التجاري الرسمي المسجل في السجل التجاري"
                      className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-[#243628] bg-slate-50/70 dark:bg-[#17231A] text-slate-900 dark:text-[#F3EFE6] focus:outline-none focus:border-amber-500 focus:bg-white dark:focus:bg-[#17231A] transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-800 dark:text-[#F3EFE6] mb-1">
                        الشكل القانوني *
                      </label>
                      <select
                        value={legalType}
                        onChange={e => setLegalType(e.target.value as CompanyEntity['legalType'])}
                        className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-300 dark:border-[#243628] bg-slate-50/70 dark:bg-[#17231A] text-slate-900 dark:text-[#F3EFE6] focus:outline-none focus:border-amber-500"
                      >
                        <option value="ش.م.م">ش.م.م (شركة مساهمة مصرية)</option>
                        <option value="ذ.م.م">ذ.م.م (شركة ذات مسؤولية محدودة)</option>
                        <option value="شركة تضامن">شركة تضامن</option>
                        <option value="فرع أجنبي">فرع شركة أجنبية</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 dark:text-[#F3EFE6] mb-1">
                        المدير المسؤول *
                      </label>
                      <input
                        type="text"
                        required
                        value={ceoAr}
                        onChange={e => setCeoAr(e.target.value)}
                        placeholder="الاسم الرباعي للمدير التنفيذي أو المفوض قانونياً"
                        className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-[#243628] bg-slate-50/70 dark:bg-[#17231A] text-slate-900 dark:text-[#F3EFE6] focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-slate-800 dark:text-[#F3EFE6] mb-1">
                        رقم السجل التجاري *
                      </label>
                      <input
                        type="text"
                        required
                        value={crNumber}
                        onChange={e => setCrNumber(e.target.value)}
                        placeholder="رقم القيد بالسجل التجاري وتاريخه"
                        className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-[#243628] bg-slate-50/70 dark:bg-[#17231A] text-slate-900 dark:text-[#F3EFE6] focus:outline-none focus:border-amber-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 dark:text-[#F3EFE6] mb-1">
                        مكتب السجل التجاري
                      </label>
                      <input
                        type="text"
                        value={crOffice}
                        onChange={e => setCrOffice(e.target.value)}
                        placeholder="اسم مكتب السجل التجاري التابع له الكيان"
                        className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-[#243628] bg-slate-50/70 dark:bg-[#17231A] text-slate-900 dark:text-[#F3EFE6] focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 dark:text-[#F3EFE6] mb-1">
                        البطاقة الضريبية *
                      </label>
                      <input
                        type="text"
                        required
                        value={taxNumber}
                        onChange={e => setTaxNumber(e.target.value)}
                        placeholder="رقم التسجيل الضريبي المكون من 9 أرقام"
                        className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-[#243628] bg-slate-50/70 dark:bg-[#17231A] text-slate-900 dark:text-[#F3EFE6] focus:outline-none focus:border-amber-500 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Shareholders & Equity Engine */}
                <div className="pt-3 border-t border-slate-200 dark:border-[#243628] space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h4 className="text-xs font-black uppercase text-amber-600 dark:text-amber-400 tracking-wider flex items-center gap-1.5">
                      <PieChart className="w-3.5 h-3.5" />
                      <span>هيكل الملكية والمساهمين ورأس المال</span>
                    </h4>

                    <div className="flex items-center gap-2 text-[11px] font-bold">
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-400">
                        {shareholders.length} مساهمين مسجلين
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#17231A] border border-slate-200 dark:border-[#243628]">
                    <div>
                      <label className="block font-semibold text-slate-600 dark:text-[#8FA392] mb-1">
                        إجمالي عدد الأسهم:
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={totalShares}
                        onChange={e => handleTotalSharesChange(Number(e.target.value) || 0)}
                        className="w-full min-h-[40px] px-3 py-1.5 rounded-lg border border-slate-300 dark:border-[#243628] bg-white dark:bg-[#0E1610] text-slate-900 dark:text-[#F3EFE6] font-bold font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-600 dark:text-[#8FA392] mb-1">
                        القيمة الاسمية للسهم (ج.م):
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={nominalShareValue}
                        onChange={e => setNominalShareValue(Number(e.target.value) || 0)}
                        className="w-full min-h-[40px] px-3 py-1.5 rounded-lg border border-slate-300 dark:border-[#243628] bg-white dark:bg-[#0E1610] text-slate-900 dark:text-[#F3EFE6] font-bold font-mono"
                      />
                    </div>

                    <div>
                      <span className="block font-semibold text-slate-600 dark:text-[#8FA392] mb-1">
                        رأس المال المصدر (محسوب):
                      </span>
                      <div className="min-h-[40px] px-3 py-2 rounded-lg bg-slate-200/80 dark:bg-[#1F2E23] flex items-center font-black text-sm text-slate-900 dark:text-[#F3EFE6]">
                        {formatCurrency(calculatedCapital)}
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Shareholders Repeater */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 dark:text-[#F3EFE6]">جدول توزيع الحصص والمساهمين:</span>
                      <button
                        type="button"
                        onClick={handleAddShareholderRow}
                        className="min-h-[36px] px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-400 font-bold text-xs flex items-center gap-1 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ إضافة مساهم</span>
                      </button>
                    </div>

                    <div className="border border-slate-200 dark:border-[#243628] rounded-xl overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead className="bg-slate-100 dark:bg-[#1F2E23] text-slate-800 dark:text-[#F3EFE6] border-b border-slate-200 dark:border-[#243628]">
                            <tr>
                              <th className="p-2.5 text-start whitespace-nowrap">اسم المساهم</th>
                              <th className="p-2.5 text-start whitespace-nowrap">الصفة / الكيان</th>
                              <th className="p-2.5 text-start whitespace-nowrap">عدد الأسهم</th>
                              <th className="p-2.5 text-start whitespace-nowrap">نسبة المساهمة (%)</th>
                              <th className="p-2.5 text-center whitespace-nowrap">حذف</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 dark:divide-[#243628]">
                            {shareholders.map(sh => (
                              <tr key={sh.id} className="bg-white dark:bg-[#0E1610]">
                                <td className="p-2">
                                  <input
                                    type="text"
                                    required
                                    value={sh.name}
                                    onChange={e => handleShareholderChange(sh.id, 'name', e.target.value)}
                                    placeholder="اسم الشريك أو المؤسسة"
                                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-[#243628] bg-slate-50 dark:bg-[#17231A] text-slate-900 dark:text-[#F3EFE6] text-xs font-bold"
                                  />
                                </td>
                                <td className="p-2">
                                  <select
                                    value={sh.entityType}
                                    onChange={e => handleShareholderChange(sh.id, 'entityType', e.target.value)}
                                    className="w-full px-2 py-1.5 rounded-lg border border-slate-300 dark:border-[#243628] bg-slate-50 dark:bg-[#17231A] text-slate-900 dark:text-[#F3EFE6] text-xs"
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
                                    className="w-28 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-[#243628] bg-slate-50 dark:bg-[#17231A] text-slate-900 dark:text-[#F3EFE6] text-xs font-mono font-bold"
                                  />
                                </td>
                                <td className="p-2 font-mono font-bold text-xs text-amber-600 whitespace-nowrap">
                                  {sh.ownershipPercent}%
                                </td>
                                <td className="p-2 text-center">
                                  <button
                                    type="button"
                                    disabled={shareholders.length === 1}
                                    onClick={() => handleRemoveShareholderRow(sh.id)}
                                    className="p-1.5 text-slate-400 hover:text-rose-500 disabled:opacity-30 disabled:hover:text-slate-400 rounded-lg"
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

                    {/* Ownership Summary Alert */}
                    <div className="flex flex-wrap items-center justify-between p-2.5 rounded-xl bg-slate-100 dark:bg-[#1F2E23]/70 text-[11px] font-semibold">
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
                <div className="pt-3 border-t border-slate-200 dark:border-[#243628] flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-300 dark:border-[#243628] text-slate-600 dark:text-[#8FA392] hover:bg-slate-100 dark:hover:bg-white/5 font-semibold"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="min-h-[44px] px-6 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition-colors shadow-sm"
                  >
                    {editingCompany ? 'حفظ التعديلات' : 'تسجيل الشركة رسمياً'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================= */}
      {/* Modal 2: عرض ملف الشركة الكامل وهيكل المساهمين                */}
      {/* ============================================================= */}
      <AnimatePresence>
        {viewDetailsCompany && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-white dark:bg-[#0E1610] rounded-2xl border border-slate-200 dark:border-[#243628] shadow-2xl overflow-hidden p-5 text-start"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#243628] mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-[#F3EFE6]">
                      {viewDetailsCompany.nameAr}
                    </h3>
                    <span className="text-xs text-slate-500 dark:text-[#8FA392]">
                      {viewDetailsCompany.legalType} • السجل التجاري: {viewDetailsCompany.crNumber || '—'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setViewDetailsCompany(null)}
                  className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                {/* Highlights Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-[#17231A] border border-slate-200 dark:border-[#243628]">
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-[#8FA392] block">رأس المال المصدر:</span>
                    <strong className="text-xs font-bold text-slate-900 dark:text-[#F3EFE6]">
                      {formatCurrency(viewDetailsCompany.issuedCapital)}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-[#8FA392] block">عدد الأسهم:</span>
                    <strong className="text-xs font-bold text-slate-900 dark:text-[#F3EFE6] font-mono">
                      {formatNumber(viewDetailsCompany.totalShares)}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-[#8FA392] block">القيمة الاسمية:</span>
                    <strong className="text-xs font-bold text-slate-900 dark:text-[#F3EFE6]">
                      {formatCurrency(viewDetailsCompany.nominalShareValue, false)} ج.م / سهم
                    </strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-[#8FA392] block">المدير المسؤول:</span>
                    <strong className="text-xs font-bold text-slate-900 dark:text-[#F3EFE6]">
                      {viewDetailsCompany.ceoAr || '—'}
                    </strong>
                  </div>
                </div>

                {/* Shareholders Breakdown */}
                <div className="space-y-2">
                  <h4 className="font-bold text-xs text-slate-800 dark:text-[#F3EFE6] flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-amber-600" />
                    <span>هيكل المساهمين والملكية ({formatNumber(viewDetailsCompany.shareholders?.length || 0)} مساهمين):</span>
                  </h4>

                  <div className="border border-slate-200 dark:border-[#243628] rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead className="bg-slate-100 dark:bg-[#1F2E23] text-slate-800 dark:text-[#F3EFE6]">
                          <tr>
                            <th className="p-2.5 text-start whitespace-nowrap">المساهم</th>
                            <th className="p-2.5 text-start whitespace-nowrap">الصفة</th>
                            <th className="p-2.5 text-start whitespace-nowrap">الأسهم المملوكة</th>
                            <th className="p-2.5 text-start whitespace-nowrap">نسبة المساهمة</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-[#243628]">
                          {viewDetailsCompany.shareholders?.map(sh => (
                            <tr key={sh.id} className="bg-white dark:bg-[#0E1610]">
                              <td className="p-2.5 font-bold text-slate-900 dark:text-[#F3EFE6]">
                                {sh.name}
                              </td>
                              <td className="p-2.5 text-slate-500 dark:text-[#8FA392]">
                                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#1F2E23] text-[10.5px] font-semibold">
                                  {sh.entityType}
                                </span>
                              </td>
                              <td className="p-2.5 font-mono font-bold text-slate-900 dark:text-[#F3EFE6]">
                                {formatNumber(sh.sharesCount)}
                              </td>
                              <td className="p-2.5">
                                <div className="flex items-center gap-2">
                                  <div className="w-20 bg-slate-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                                    <div
                                      className="bg-amber-500 h-full rounded-full"
                                      style={{ width: `${Math.min(100, sh.ownershipPercent)}%` }}
                                    />
                                  </div>
                                  <span className="font-mono font-bold text-amber-600 text-xs">
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

                {/* Attached Documents Quick Preview */}
                {viewDetailsCompany.documents && viewDetailsCompany.documents.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-[#243628]">
                    <h4 className="font-bold text-xs text-slate-800 dark:text-[#F3EFE6] flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span>المستندات الرسمية المرفقة ({viewDetailsCompany.documents.length}):</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {viewDetailsCompany.documents.map(doc => (
                        <div
                          key={doc.id}
                          className="p-2.5 rounded-xl border border-slate-200 dark:border-[#243628] bg-slate-50 dark:bg-[#17231A] flex items-center justify-between"
                        >
                          <div className="truncate min-w-0">
                            <span className="font-bold text-slate-800 dark:text-[#F3EFE6] block truncate">{doc.name}</span>
                            <span className="text-[10px] text-amber-600 font-semibold">{doc.docType}</span>
                          </div>
                          {doc.dataUrl && (
                            <button
                              onClick={() => setPreviewDocument(doc)}
                              className="p-1.5 rounded-lg bg-slate-200 dark:bg-[#1F2E23] text-slate-700 hover:text-amber-600 shrink-0"
                              title="معاينة"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2">
                  <button
                    onClick={() => {
                      const comp = viewDetailsCompany;
                      setViewDetailsCompany(null);
                      setAuditLogCompany(comp);
                    }}
                    className="flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700"
                  >
                    <History className="w-4 h-4" />
                    <span>عرض سجل التعديلات (Audit Trail)</span>
                  </button>

                  <button
                    onClick={() => setViewDetailsCompany(null)}
                    className="min-h-[40px] px-5 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700"
                  >
                    إغلاق الملف
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================= */}
      {/* Modal 3: عارض المستندات والتراخيص الرسمية المعتمدة (Read-Only) */}
      {/* ============================================================= */}
      <AnimatePresence>
        {docsModalCompany && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-white dark:bg-[#0E1610] rounded-2xl border border-slate-200 dark:border-[#243628] shadow-2xl overflow-hidden p-5 sm:p-6 text-start flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 dark:border-[#243628] mb-4 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-600 flex items-center justify-center border border-blue-500/20">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-[#F3EFE6]">
                      السجلات والتراخيص المعتمدة: {docsModalCompany.nameAr}
                    </h3>
                    <span className="text-xs text-slate-500 dark:text-[#8FA392]">
                      عرض المستندات والوثائق الرسمية المستمدة من سجل التراخيص الموحد
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const target = docsModalCompany;
                      setDocsModalCompany(null);
                      onOpenAddDocumentForCompany(target);
                    }}
                    className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ إضافة مستند جديد للشركة</span>
                  </button>
                  <button
                    onClick={() => setDocsModalCompany(null)}
                    className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-white/10"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Verified Documents List from licenses store */}
              <div className="space-y-2.5 overflow-y-auto flex-1 pr-1">
                {(() => {
                  const companyDocs = documents.filter(d => d.companyId === docsModalCompany.id);
                  if (companyDocs.length === 0) {
                    return (
                      <div className="py-12 text-center text-slate-400">
                        <FileText className="w-10 h-10 mx-auto mb-3 opacity-40 text-amber-500" />
                        <h4 className="text-sm font-bold text-slate-800 dark:text-[#F3EFE6] mb-1">
                          لا توجد مستندات أو تراخيص مسجلة لهذه الشركة بعد
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-[#8FA392] max-w-sm mx-auto mb-4">
                          جميع السجلات التجارية والبطاقات الضريبية والتراخيص تُدار حصرياً من خلال وحدة &quot;السجلات والتراخيص&quot;.
                        </p>
                        <button
                          onClick={() => {
                            const target = docsModalCompany;
                            setDocsModalCompany(null);
                            onOpenAddDocumentForCompany(target);
                          }}
                          className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm"
                        >
                          <Plus className="w-4 h-4" />
                          <span>تسجيل أول مستند للشركة الآن</span>
                        </button>
                      </div>
                    );
                  }

                  return companyDocs.map(doc => {
                    const isExpired = doc.expiryDate && new Date(doc.expiryDate) < new Date();
                    const daysRemaining = doc.expiryDate
                      ? Math.ceil((new Date(doc.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                      : 999;
                    const isExpiringSoon = daysRemaining > 0 && daysRemaining <= 30;

                    return (
                      <div
                        key={doc.id}
                        className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-[#121B14] border border-slate-200 dark:border-[#243628] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-slate-200/70 dark:bg-[#1F2E23] flex items-center justify-center shrink-0 text-slate-700 dark:text-[#E0D9CB]">
                            {doc.fileAttachment?.mimeType?.includes('pdf') ? (
                              <FileText className="w-5 h-5 text-rose-500" />
                            ) : (
                              <ImageIcon className="w-5 h-5 text-blue-500" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-0.5">
                              <span className="font-bold text-slate-900 dark:text-[#F3EFE6] text-xs">
                                {doc.titleAr}
                              </span>
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40">
                                {doc.docType}
                              </span>
                              {isExpired ? (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                  منتهي الصلاحية
                                </span>
                              ) : isExpiringSoon ? (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                  ينتهي خلال {daysRemaining} يوم
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  ساري ومعتمد
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-[#8FA392] flex-wrap">
                              <span>رقم المستند: <strong className="font-mono text-slate-700 dark:text-slate-300">{doc.docNumber}</strong></span>
                              <span>•</span>
                              <span>الجهة: {doc.issuerAr}</span>
                              {doc.expiryDate && (
                                <>
                                  <span>•</span>
                                  <span>الانتهاء: {doc.expiryDate}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions: Preview & Download */}
                        <div className="flex items-center gap-1.5 shrink-0 justify-end">
                          {doc.fileAttachment?.dataUrl && (
                            <button
                              type="button"
                              onClick={() => setPreviewDocument(doc.fileAttachment!)}
                              className="min-h-[34px] px-2.5 py-1 rounded-lg bg-slate-200/80 dark:bg-[#1F2E23] text-slate-700 dark:text-[#E0D9CB] hover:text-amber-600 transition-colors flex items-center gap-1 text-[11px] font-bold"
                              title="معاينة المستند"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>معاينة</span>
                            </button>
                          )}
                          {doc.fileAttachment?.dataUrl && (
                            <a
                              href={doc.fileAttachment.dataUrl}
                              download={doc.fileAttachment.name}
                              className="min-h-[34px] px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 transition-colors flex items-center gap-1 text-[11px] font-bold border border-emerald-200 dark:border-emerald-800/40"
                              title="تحميل الملف"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>تحميل</span>
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>

              <div className="flex justify-end pt-3.5 border-t border-slate-200 dark:border-[#243628] mt-4 shrink-0">
                <button
                  onClick={() => setDocsModalCompany(null)}
                  className="min-h-[40px] px-5 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-900"
                >
                  إغلاق
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================= */}
      {/* Modal 4: سجل تعديلات الكيان (Audit Trail)                      */}
      {/* ============================================================= */}
      <AnimatePresence>
        {auditLogCompany && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl max-h-[85vh] flex flex-col bg-white dark:bg-[#0E1610] rounded-2xl border border-slate-200 dark:border-[#243628] shadow-2xl overflow-hidden p-5 text-start"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#243628] mb-4 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/25">
                    <History className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-[#F3EFE6]">
                      سجل تعديلات الكيان (Audit Trail)
                    </h3>
                    <span className="text-xs text-amber-600 dark:text-amber-400 font-bold">
                      {auditLogCompany.nameAr}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setAuditLogCompany(null)}
                  className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Audit Trail Timeline */}
              <div className="space-y-3 overflow-y-auto flex-1 pr-1">
                {!auditLogCompany.auditLogs || auditLogCompany.auditLogs.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 dark:text-[#8FA392]">
                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-50 text-amber-500" />
                    <p className="text-xs font-bold">
                      لم يتم تسجيل أي تعديلات على بيانات هذه الشركة منذ إنشائها
                    </p>
                  </div>
                ) : (
                  auditLogCompany.auditLogs.map((entry, idx) => (
                    <div
                      key={entry.id || idx}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-[#243628] bg-slate-50/70 dark:bg-[#17231A] text-xs space-y-2"
                    >
                      {/* Meta header: User, Date, Action */}
                      <div className="flex items-center justify-between gap-2 border-b border-slate-200/80 dark:border-[#243628] pb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-[#1F2E23] flex items-center justify-center text-slate-700 dark:text-[#E0D9CB] font-bold text-[10px]">
                            <User className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-bold text-slate-900 dark:text-[#F3EFE6]">
                            {entry.userName || 'يوسف حجازي'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500">
                          <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-bold border border-amber-200 dark:border-amber-800/40">
                            {entry.actionLabelAr || entry.action}
                          </span>
                          <span className="font-mono">{entry.timestamp}</span>
                        </div>
                      </div>

                      {/* Field Diff List */}
                      {entry.changes && entry.changes.length > 0 ? (
                        <div className="space-y-1.5 pt-1">
                          {entry.changes.map((ch, cIdx) => (
                            <div
                              key={cIdx}
                              className="p-2 rounded-lg bg-white dark:bg-[#0E1610] border border-slate-200/60 dark:border-[#243628] text-[11px] leading-relaxed"
                            >
                              <strong className="text-slate-800 dark:text-[#F3EFE6]">
                                [{ch.fieldLabel || ch.field}]:
                              </strong>{' '}
                              <span>تم التغيير من </span>
                              <span className="line-through text-rose-600 font-mono px-1 bg-rose-50 dark:bg-rose-950/30 rounded">
                                "{ch.oldValue}"
                              </span>{' '}
                              <span>إلى </span>
                              <span className="text-emerald-700 dark:text-emerald-400 font-bold font-mono px-1 bg-emerald-50 dark:bg-emerald-950/30 rounded">
                                "{ch.newValue}"
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-500 italic">
                          {entry.notes || 'تم تحديث السجل المؤسسي'}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-[#243628] mt-4 shrink-0">
                <button
                  onClick={() => setAuditLogCompany(null)}
                  className="min-h-[40px] px-5 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-900"
                >
                  إغلاق السجل
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================= */}
      {/* Modal 5: تأكيد الحذف النهائي مع الرسوم المتحركة                */}
      {/* ============================================================= */}
      <AnimatePresence>
        {companyToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="w-full max-w-md bg-white dark:bg-[#0E1610] rounded-2xl border border-slate-200 dark:border-[#243628] shadow-2xl p-6 text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-600 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-[#F3EFE6] mb-2">
                تأكيد حذف الكيان نهائياً
              </h3>
              <p className="text-xs text-slate-600 dark:text-[#8FA392] leading-relaxed mb-6">
                هل أنت متأكد من رغبتك في حذف شركة{' '}
                <strong className="text-slate-900 dark:text-white font-black">
                  "{companyToDelete.nameAr}"
                </strong>{' '}
                بشكل نهائي؟ سيتم حذف جميع البيانات والوثائق المرتبطة بها ولا يمكن التراجع عن هذا الإجراء.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setCompanyToDelete(null)}
                  className="min-h-[44px] px-5 py-2.5 rounded-xl border border-slate-300 dark:border-[#243628] text-slate-700 dark:text-[#E0D9CB] font-bold text-xs hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="min-h-[44px] px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all"
                >
                  تأكيد الحذف النهائي
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================= */}
      {/* Modal 6: عارض ومعاينة المستندات المرفقة (Lightbox / PDF)      */}
      {/* ============================================================= */}
      <AnimatePresence>
        {previewDocument && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-3xl max-h-[90vh] bg-white dark:bg-[#0E1610] rounded-2xl border border-slate-200 dark:border-[#243628] shadow-2xl flex flex-col overflow-hidden text-start"
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-[#243628] bg-slate-50 dark:bg-[#121B14] shrink-0">
                <div className="truncate min-w-0 pr-2">
                  <h3 className="text-sm font-black text-slate-900 dark:text-[#F3EFE6] truncate">
                    {previewDocument.name}
                  </h3>
                  <span className="text-[11px] text-amber-600 font-bold">
                    {previewDocument.docType} • {formatBytes(previewDocument.sizeBytes)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {previewDocument.dataUrl && (
                    <a
                      href={previewDocument.dataUrl}
                      download={previewDocument.name}
                      className="min-h-[38px] px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-400 font-bold text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>تحميل</span>
                    </a>
                  )}
                  <button
                    onClick={() => setPreviewDocument(null)}
                    className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-white/10"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 p-4 overflow-auto flex items-center justify-center bg-slate-100/50 dark:bg-[#070B08]">
                {previewDocument.mimeType?.includes('pdf') ? (
                  <iframe
                    src={previewDocument.dataUrl}
                    className="w-full h-[65vh] rounded-xl border border-slate-300 dark:border-[#243628]"
                    title={previewDocument.name}
                  />
                ) : (
                  <img
                    src={previewDocument.dataUrl}
                    alt={previewDocument.name}
                    className="max-h-[65vh] max-w-full object-contain rounded-xl shadow-md"
                  />
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
