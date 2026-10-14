import React, { useState, useMemo } from 'react';
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
  Briefcase,
  AlertCircle,
  Clock,
  History,
  Layers,
  Search,
  ExternalLink,
  Wrench
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
  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Modal Visibility States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<BranchLocation | null>(null);
  const [viewBranch, setViewBranch] = useState<BranchLocation | null>(null);
  const [auditBranch, setAuditBranch] = useState<BranchLocation | null>(null);
  const [branchToDelete, setBranchToDelete] = useState<BranchLocation | null>(null);

  // Form State
  const [formCompanyId, setFormCompanyId] = useState('');
  const [formNameAr, setFormNameAr] = useState('');
  const [formTypeAr, setFormTypeAr] = useState<string>('مقر رئيسي');
  const [formCityAr, setFormCityAr] = useState('القاهرة');
  const [formAddressAr, setFormAddressAr] = useState('');
  const [formGoogleMapsUrl, setFormGoogleMapsUrl] = useState('');
  const [formManagerAr, setFormManagerAr] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formStaffCount, setFormStaffCount] = useState<number>(10);
  const [formActiveProjects, setFormActiveProjects] = useState<number>(1);
  const [formCostCenterCode, setFormCostCenterCode] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formExpectedDeliveryDate, setFormExpectedDeliveryDate] = useState('');
  const [formStatus, setFormStatus] = useState<string>('نشط');
  const [formNotesAr, setFormNotesAr] = useState('');

  // Filtered Branches
  const filteredBranches = useMemo(() => {
    return branches.filter(b => {
      const matchSearch =
        !searchQuery.trim() ||
        b.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.cityAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.managerAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.companyNameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.addressAr && b.addressAr.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCompany = selectedCompanyId === 'ALL' || b.companyId === selectedCompanyId;
      const matchType = selectedType === 'ALL' || b.typeAr === selectedType;
      const matchStatus = selectedStatus === 'ALL' || (b.status || 'نشط') === selectedStatus;

      return matchSearch && matchCompany && matchType && matchStatus;
    });
  }, [branches, searchQuery, selectedCompanyId, selectedType, selectedStatus]);

  // Modal Handlers
  const handleOpenAdd = () => {
    setEditingBranch(null);
    setFormCompanyId(companies[0]?.id || '');
    setFormNameAr('');
    setFormTypeAr('فرع إداري');
    setFormCityAr('القاهرة');
    setFormAddressAr('');
    setFormGoogleMapsUrl('');
    setFormManagerAr('');
    setFormPhone('');
    setFormStaffCount(15);
    setFormActiveProjects(1);
    setFormCostCenterCode('');
    setFormStartDate(new Date().toISOString().slice(0, 10));
    setFormExpectedDeliveryDate('');
    setFormStatus('نشط');
    setFormNotesAr('');
    setModalOpen(true);
  };

  const handleOpenEdit = (branch: BranchLocation) => {
    setEditingBranch(branch);
    setFormCompanyId(branch.companyId);
    setFormNameAr(branch.nameAr);
    setFormTypeAr(branch.typeAr);
    setFormCityAr(branch.cityAr);
    setFormAddressAr(branch.addressAr);
    setFormGoogleMapsUrl(branch.googleMapsUrl || '');
    setFormManagerAr(branch.managerAr);
    setFormPhone(branch.phone);
    setFormStaffCount(branch.staffCount);
    setFormActiveProjects(branch.activeProjects);
    setFormCostCenterCode(branch.costCenterCode || '');
    setFormStartDate(branch.startDate || '');
    setFormExpectedDeliveryDate(branch.expectedDeliveryDate || '');
    setFormStatus(branch.status || 'نشط');
    setFormNotesAr(branch.notesAr || '');
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNameAr.trim()) return;

    const parentComp = companies.find(c => c.id === formCompanyId);
    const companyNameAr = parentComp ? parentComp.nameAr : (companies[0]?.nameAr || 'الشركة الرئيسية');

    if (editingBranch) {
      const updated: BranchLocation = {
        ...editingBranch,
        companyId: formCompanyId || companies[0]?.id || 'comp_main',
        companyNameAr,
        nameAr: formNameAr.trim(),
        typeAr: formTypeAr,
        cityAr: formCityAr.trim(),
        addressAr: formAddressAr.trim(),
        googleMapsUrl: formGoogleMapsUrl.trim() || undefined,
        managerAr: formManagerAr.trim(),
        phone: formPhone.trim(),
        staffCount: Number(formStaffCount) || 0,
        activeProjects: Number(formActiveProjects) || 0,
        costCenterCode: formCostCenterCode.trim() || undefined,
        startDate: formStartDate || undefined,
        expectedDeliveryDate: formExpectedDeliveryDate || undefined,
        status: formStatus,
        notesAr: formNotesAr.trim() || undefined
      };
      onUpdateBranch(updated);
    } else {
      const newBranch: BranchLocation = {
        id: `branch_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        companyId: formCompanyId || companies[0]?.id || 'comp_main',
        companyNameAr,
        nameAr: formNameAr.trim(),
        typeAr: formTypeAr,
        cityAr: formCityAr.trim(),
        addressAr: formAddressAr.trim(),
        googleMapsUrl: formGoogleMapsUrl.trim() || undefined,
        managerAr: formManagerAr.trim() || 'غير محدد',
        phone: formPhone.trim() || '+20 2 0000 0000',
        staffCount: Number(formStaffCount) || 0,
        activeProjects: Number(formActiveProjects) || 0,
        costCenterCode: formCostCenterCode.trim() || undefined,
        startDate: formStartDate || undefined,
        expectedDeliveryDate: formExpectedDeliveryDate || undefined,
        status: formStatus,
        notesAr: formNotesAr.trim() || undefined
      };
      onAddBranch(newBranch);
    }
    setModalOpen(false);
  };

  const getBranchIcon = (type: string) => {
    if (type.includes('مستودع') || type.includes('مخزن')) return <Warehouse className="w-5 h-5" />;
    if (type.includes('موقع') || type.includes('مشروع')) return <HardHat className="w-5 h-5" />;
    if (type.includes('ورشة')) return <Wrench className="w-5 h-5" />;
    return <Building className="w-5 h-5" />;
  };

  const getStatusBadge = (status?: string) => {
    const st = status || 'نشط';
    if (st === 'نشط') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60 shadow-2xs">
          نشط
        </span>
      );
    }
    if (st === 'تحت الإنشاء') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60 shadow-2xs">
          تحت الإنشاء
        </span>
      );
    }
    if (st === 'مسلم') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/60 shadow-2xs">
          مسلم
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 shadow-2xs">
        {st}
      </span>
    );
  };

  return (
    <div className="space-y-4 text-start">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-black text-slate-900 dark:text-[#F3EFE6] flex items-center gap-2">
            <MapPin className="w-5 h-5 text-amber-500" />
            <span>الفروع والمواقع الإدارية والميدانية</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-[#8FA392]">
            إدارة المقرات الرئيسية، الفروع الإقليمية، مستودعات التشوين، والورش ومواقع المشروعات الإنشائية
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="min-h-[44px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-md hover:shadow-lg shrink-0 cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة مقر / موقع جديد</span>
        </button>
      </div>

      {/* Advanced Filter Bar */}
      <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-[#243628] bg-white dark:bg-[#17231A] shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Live Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 right-3 text-slate-400 dark:text-[#8FA392]" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="بحث باسم الموقع، المدينة، المدير..."
              className="w-full min-h-[44px] pr-9 pl-3 rounded-xl border border-slate-300 dark:border-[#243628] bg-slate-50 dark:bg-[#0E1610] text-slate-900 dark:text-[#F3EFE6] text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Filter by Company */}
          <div>
            <select
              value={selectedCompanyId}
              onChange={e => setSelectedCompanyId(e.target.value)}
              className="w-full min-h-[44px] px-3 rounded-xl border border-slate-300 dark:border-[#243628] bg-slate-50 dark:bg-[#0E1610] text-slate-900 dark:text-[#F3EFE6] text-xs font-bold focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">كافة الشركات التابعة</option>
              {companies.map(c => (
                <option key={c.id} value={c.id}>
                  {c.nameAr}
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Type */}
          <div>
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="w-full min-h-[44px] px-3 rounded-xl border border-slate-300 dark:border-[#243628] bg-slate-50 dark:bg-[#0E1610] text-slate-900 dark:text-[#F3EFE6] text-xs focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">كافة أنواع المقرات</option>
              <option value="مقر رئيسي">مقر رئيسي</option>
              <option value="فرع إداري">فرع إداري</option>
              <option value="موقع إنشائي/مشروع">موقع إنشائي / مشروع</option>
              <option value="مخزن">مخزن / مستودع تشوين</option>
              <option value="ورشة مركزية">ورشة مركزية</option>
            </select>
          </div>

          {/* Filter by Status */}
          <div>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full min-h-[44px] px-3 rounded-xl border border-slate-300 dark:border-[#243628] bg-slate-50 dark:bg-[#0E1610] text-slate-900 dark:text-[#F3EFE6] text-xs font-bold focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">كافة الحالات</option>
              <option value="نشط">نشط</option>
              <option value="تحت الإنشاء">تحت الإنشاء</option>
              <option value="مسلم">مسلم</option>
              <option value="معلق">معلق</option>
            </select>
          </div>
        </div>

        {/* Clear Filters Button */}
        {(searchQuery || selectedCompanyId !== 'ALL' || selectedType !== 'ALL' || selectedStatus !== 'ALL') && (
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-[#8FA392] pt-1">
            <span>عرض <strong>{filteredBranches.length}</strong> من إجمالي <strong>{branches.length}</strong> موقع</span>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCompanyId('ALL');
                setSelectedType('ALL');
                setSelectedStatus('ALL');
              }}
              className="text-amber-600 dark:text-amber-400 hover:underline font-bold cursor-pointer"
            >
              إعادة تعيين الفلاتر
            </button>
          </div>
        )}
      </div>

      {/* Main Content: Branches Grid OR Clean Empty State */}
      {branches.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-[#17231A] rounded-2xl border border-slate-200 dark:border-[#243628] shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-200 dark:border-amber-800/60">
            <MapPin className="w-8 h-8" />
          </div>
          <h4 className="text-base font-bold text-slate-800 dark:text-[#F3EFE6] mb-1">
            لا توجد فروع أو مواقع مسجلة حالياً
          </h4>
          <p className="text-xs text-slate-500 dark:text-[#8FA392] max-w-md mx-auto mb-6">
            ابدأ بإضافة المقر أو الموقع الأول لربطه بشركتك وتتبع الكوادر ومراكز التكلفة والمشروعات الميدانية.
          </p>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة المقر الأول الآن</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 w-full">
          {filteredBranches.map((branch, idx) => (
            <motion.div
              key={branch.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-[#243628] bg-white dark:bg-[#17231A] shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative group"
            >
              <div>
                {/* Header Row with Icon, Title, and Pulsing Audit Icon */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200 dark:border-amber-800/60">
                      {getBranchIcon(branch.typeAr)}
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-[#F3EFE6] leading-tight truncate">
                        {branch.nameAr}
                      </h4>
                      <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 block mt-0.5">
                        {branch.typeAr} • {branch.cityAr}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Status Badge */}
                    {getStatusBadge(branch.status)}

                    {/* Exclamation Audit Icon */}
                    <button
                      onClick={() => setAuditBranch(branch)}
                      title="سجل تعديلات الموقع (Audit Trail)"
                      className="p-1 rounded-lg text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors cursor-pointer"
                    >
                      <AlertCircle className="w-4 h-4 animate-pulse" />
                    </button>
                  </div>
                </div>

                {/* Parent Company Card */}
                <div className="mb-3 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#0E1610] border border-slate-200/80 dark:border-[#243628] text-xs">
                  <span className="text-slate-500 dark:text-[#8FA392] text-[10.5px] block">الشركة التابعة:</span>
                  <strong className="text-slate-900 dark:text-[#F3EFE6] font-bold block truncate">{branch.companyNameAr}</strong>
                </div>

                {/* Vital Details Strip */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0E1610] text-xs text-slate-600 dark:text-[#8FA392] space-y-2 border border-slate-200/60 dark:border-[#243628] mb-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-amber-500" />
                      <span>المدير المسؤول:</span>
                    </span>
                    <strong className="text-slate-900 dark:text-[#F3EFE6]">{branch.managerAr}</strong>
                  </div>

                  {branch.phone && (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-amber-500" />
                        <span>الهاتف:</span>
                      </span>
                      <strong className="text-slate-900 dark:text-[#F3EFE6] font-mono">{branch.phone}</strong>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-500" />
                      <span>العنوان:</span>
                    </span>
                    <span className="text-slate-800 dark:text-[#F3EFE6] truncate max-w-[190px]" title={branch.addressAr}>
                      {branch.addressAr || '—'}
                    </span>
                  </div>

                  {branch.costCenterCode && (
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/70 dark:border-[#243628]">
                      <span className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-blue-500" />
                        <span>مركز التكلفة:</span>
                      </span>
                      <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                        {branch.costCenterCode}
                      </span>
                    </div>
                  )}
                </div>

                {/* Metrics */}
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-[#8FA392] mb-3 px-1">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{branch.staffCount} موظف</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>{branch.activeProjects} مشاريع جارية</span>
                  </span>
                </div>
              </div>

              {/* Actions Row: Modern Icon-Only Buttons */}
              <div className="pt-3 border-t border-slate-200 dark:border-[#243628] flex items-center justify-end gap-1.5">
                {/* 1. View Details */}
                <button
                  onClick={() => setViewBranch(branch)}
                  title="عرض التفاصيل الكاملة"
                  className="min-h-[36px] min-w-[36px] p-2 rounded-xl text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/50 transition-colors cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                </button>

                {/* 2. Google Maps External Link (if exists) */}
                {branch.googleMapsUrl && (
                  <a
                    href={branch.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="فتح رابط الموقع على Google Maps"
                    className="min-h-[36px] min-w-[36px] p-2 rounded-xl text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/50 transition-colors inline-flex items-center justify-center cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}

                {/* 3. Edit */}
                <button
                  onClick={() => handleOpenEdit(branch)}
                  title="تعديل بيانات الموقع"
                  className="min-h-[36px] min-w-[36px] p-2 rounded-xl text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/50 transition-colors cursor-pointer"
                >
                  <Pencil className="w-4 h-4" />
                </button>

                {/* 4. Audit Log */}
                <button
                  onClick={() => setAuditBranch(branch)}
                  title="سجل التعديلات (Audit Trail)"
                  className="min-h-[36px] min-w-[36px] p-2 rounded-xl text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/50 transition-colors cursor-pointer"
                >
                  <AlertCircle className="w-4 h-4" />
                </button>

                {/* 5. Delete */}
                <button
                  onClick={() => setBranchToDelete(branch)}
                  title="حذف الموقع نهائياً"
                  className="min-h-[36px] min-w-[36px] p-2 rounded-xl text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ============================================================= */}
      {/* Modal 1: إضافة / تعديل مقر أو موقع                          */}
      {/* ============================================================= */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl max-h-[92vh] flex flex-col bg-white dark:bg-[#0E1610] rounded-2xl border border-slate-200 dark:border-[#243628] shadow-2xl overflow-hidden text-start"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-[#243628] bg-slate-50 dark:bg-[#121B14] shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-[#F3EFE6]">
                      {editingBranch ? 'تعديل بيانات المقر أو الموقع الإنشائي' : 'إضافة مقر / موقع إنشائي جديد'}
                    </h3>
                    <span className="text-[11px] text-slate-500 dark:text-[#8FA392]">
                      تسجيل البيانات الرسمية، المدير المسؤول، الإحداثيات، وتوزيع الكوادر
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3.5 overflow-y-auto text-xs">
                {/* 1. Parent Company */}
                <div>
                  <label className="block font-bold text-slate-800 dark:text-[#F3EFE6] mb-1">
                    الشركة التابع لها المقر *
                  </label>
                  <select
                    required
                    value={formCompanyId}
                    onChange={e => setFormCompanyId(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-[#243628] bg-slate-50 dark:bg-[#17231A] text-slate-900 dark:text-[#F3EFE6] font-bold focus:outline-none focus:border-amber-500"
                  >
                    {companies.length === 0 ? (
                      <option value="">لا توجد شركات مسجلة (الشركة الرئيسية)</option>
                    ) : (
                      companies.map(comp => (
                        <option key={comp.id} value={comp.id}>
                          {comp.nameAr}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* 2. Name & Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-800 dark:text-[#F3EFE6] mb-1">
                      اسم المقر / الموقع *
                    </label>
                    <input
                      type="text"
                      required
                      value={formNameAr}
                      onChange={e => setFormNameAr(e.target.value)}
                      placeholder="أدخل اسم الموقع الإنشائي أو المقر الإداري الرسمي"
                      className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-[#243628] bg-slate-50 dark:bg-[#17231A] text-slate-900 dark:text-[#F3EFE6] focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 dark:text-[#F3EFE6] mb-1">
                      نوع المقر / المنشأة *
                    </label>
                    <select
                      value={formTypeAr}
                      onChange={e => setFormTypeAr(e.target.value)}
                      className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-300 dark:border-[#243628] bg-slate-50 dark:bg-[#17231A] text-slate-900 dark:text-[#F3EFE6] focus:outline-none focus:border-amber-500"
                    >
                      <option value="مقر رئيسي">مقر رئيسي</option>
                      <option value="فرع إداري">فرع إداري</option>
                      <option value="موقع إنشائي/مشروع">موقع إنشائي / مشروع</option>
                      <option value="مخزن">مخزن / مستودع تشوين</option>
                      <option value="ورشة مركزية">ورشة مركزية</option>
                    </select>
                  </div>
                </div>

                {/* 3. City & Address */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-800 dark:text-[#F3EFE6] mb-1">
                      المدينة / المحافظة *
                    </label>
                    <input
                      type="text"
                      required
                      value={formCityAr}
                      onChange={e => setFormCityAr(e.target.value)}
                      placeholder="مثال: القاهرة الجديدة، الإسكندرية"
                      className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-[#243628] bg-slate-50 dark:bg-[#17231A] text-slate-900 dark:text-[#F3EFE6] focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-800 dark:text-[#F3EFE6] mb-1">
                      العنوان التفصيلي للمقر *
                    </label>
                    <input
                      type="text"
                      required
                      value={formAddressAr}
                      onChange={e => setFormAddressAr(e.target.value)}
                      placeholder="العنوان التفصيلي، الحي، الشارع، أو علامة مميزة للموقع"
                      className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-[#243628] bg-slate-50 dark:bg-[#17231A] text-slate-900 dark:text-[#F3EFE6] focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* 4. Google Maps Link */}
                <div>
                  <label className="block font-bold text-slate-800 dark:text-[#F3EFE6] mb-1">
                    رابط الموقع الجغرافي (Google Maps) (اختياري)
                  </label>
                  <input
                    type="url"
                    value={formGoogleMapsUrl}
                    onChange={e => setFormGoogleMapsUrl(e.target.value)}
                    placeholder="https://maps.google.com/?q=..."
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-[#243628] bg-slate-50 dark:bg-[#17231A] text-slate-900 dark:text-[#F3EFE6] font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* 5. Manager & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-800 dark:text-[#F3EFE6] mb-1">
                      المدير المسؤول عن المقر/المشروع *
                    </label>
                    <input
                      type="text"
                      required
                      value={formManagerAr}
                      onChange={e => setFormManagerAr(e.target.value)}
                      placeholder="الاسم الرباعي لمدير الموقع أو مهندس المشروع المسؤول"
                      className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-[#243628] bg-slate-50 dark:bg-[#17231A] text-slate-900 dark:text-[#F3EFE6] focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 dark:text-[#F3EFE6] mb-1">
                      رقم هاتف التواصل للمقر
                    </label>
                    <input
                      type="text"
                      value={formPhone}
                      onChange={e => setFormPhone(e.target.value)}
                      placeholder="+20 2 0000 0000"
                      className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-[#243628] bg-slate-50 dark:bg-[#17231A] text-slate-900 dark:text-[#F3EFE6] font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* 6. Staff Count, Active Projects & Cost Center */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-800 dark:text-[#F3EFE6] mb-1">
                      عدد الكادر الوظيفي
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formStaffCount}
                      onChange={e => setFormStaffCount(Number(e.target.value))}
                      className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-[#243628] bg-slate-50 dark:bg-[#17231A] text-slate-900 dark:text-[#F3EFE6] font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 dark:text-[#F3EFE6] mb-1">
                      المشاريع الجارية
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formActiveProjects}
                      onChange={e => setFormActiveProjects(Number(e.target.value))}
                      className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-[#243628] bg-slate-50 dark:bg-[#17231A] text-slate-900 dark:text-[#F3EFE6] font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 dark:text-[#F3EFE6] mb-1">
                      مركز التكلفة المرتبط
                    </label>
                    <input
                      type="text"
                      value={formCostCenterCode}
                      onChange={e => setFormCostCenterCode(e.target.value)}
                      placeholder="e.g. CC-101"
                      className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-[#243628] bg-slate-50 dark:bg-[#17231A] text-slate-900 dark:text-[#F3EFE6] font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* 7. Dates & Status */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-800 dark:text-[#F3EFE6] mb-1">
                      تاريخ بدء الأعمال
                    </label>
                    <input
                      type="date"
                      value={formStartDate}
                      onChange={e => setFormStartDate(e.target.value)}
                      className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-[#243628] bg-slate-50 dark:bg-[#17231A] text-slate-900 dark:text-[#F3EFE6] font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 dark:text-[#F3EFE6] mb-1">
                      تاريخ التسليم المتوقع
                    </label>
                    <input
                      type="date"
                      value={formExpectedDeliveryDate}
                      onChange={e => setFormExpectedDeliveryDate(e.target.value)}
                      className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-[#243628] bg-slate-50 dark:bg-[#17231A] text-slate-900 dark:text-[#F3EFE6] font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 dark:text-[#F3EFE6] mb-1">
                      حالة الموقع / المشروع
                    </label>
                    <select
                      value={formStatus}
                      onChange={e => setFormStatus(e.target.value)}
                      className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-300 dark:border-[#243628] bg-slate-50 dark:bg-[#17231A] text-slate-900 dark:text-[#F3EFE6] font-bold focus:outline-none focus:border-amber-500"
                    >
                      <option value="نشط">نشط</option>
                      <option value="تحت الإنشاء">تحت الإنشاء</option>
                      <option value="مسلم">مسلم</option>
                      <option value="معلق">معلق</option>
                    </select>
                  </div>
                </div>

                {/* 8. Notes */}
                <div>
                  <label className="block font-bold text-slate-800 dark:text-[#F3EFE6] mb-1">
                    ملاحظات الموقع (اختياري)
                  </label>
                  <textarea
                    rows={2}
                    value={formNotesAr}
                    onChange={e => setFormNotesAr(e.target.value)}
                    placeholder="ملاحظات تشغيلية، تفاصيل المعدات، أو عقود الموقع..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-[#243628] bg-slate-50 dark:bg-[#17231A] text-slate-900 dark:text-[#F3EFE6] focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-[#243628]">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-[#243628] text-slate-700 dark:text-[#8FA392] font-bold hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    {editingBranch ? 'حفظ التعديلات' : 'تسجيل المقر'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================= */}
      {/* Modal 2: تفاصيل المقر / الموقع الكاملة (Details View)        */}
      {/* ============================================================= */}
      <AnimatePresence>
        {viewBranch && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white dark:bg-[#0E1610] rounded-2xl border border-slate-200 dark:border-[#243628] shadow-2xl p-5 text-start"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#243628] mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-800/60">
                    {getBranchIcon(viewBranch.typeAr)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-[#F3EFE6]">
                      {viewBranch.nameAr}
                    </h3>
                    <span className="text-[11px] text-amber-600 dark:text-amber-400 font-bold">
                      {viewBranch.typeAr} • {viewBranch.cityAr}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setViewBranch(null)}
                  className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#17231A] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">الشركة المالكة:</span>
                    <strong className="text-slate-900 dark:text-[#F3EFE6]">{viewBranch.companyNameAr}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">حالة الموقع:</span>
                    <span>{getStatusBadge(viewBranch.status)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">المدير المسؤول:</span>
                    <strong className="text-slate-900 dark:text-[#F3EFE6]">{viewBranch.managerAr}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">رقم الهاتف:</span>
                    <strong className="font-mono text-slate-900 dark:text-[#F3EFE6]">{viewBranch.phone || '—'}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">العنوان:</span>
                    <span className="text-slate-800 dark:text-[#F3EFE6] text-end max-w-[220px]">{viewBranch.addressAr || '—'}</span>
                  </div>
                  {viewBranch.costCenterCode && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">مركز التكلفة:</span>
                      <strong className="font-mono text-blue-600 dark:text-blue-400">{viewBranch.costCenterCode}</strong>
                    </div>
                  )}
                  {viewBranch.startDate && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">تاريخ بدء الأعمال:</span>
                      <strong className="font-mono text-slate-800 dark:text-[#F3EFE6]">{viewBranch.startDate}</strong>
                    </div>
                  )}
                  {viewBranch.expectedDeliveryDate && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">التسليم المتوقع:</span>
                      <strong className="font-mono text-slate-800 dark:text-[#F3EFE6]">{viewBranch.expectedDeliveryDate}</strong>
                    </div>
                  )}
                </div>

                {viewBranch.googleMapsUrl && (
                  <a
                    href={viewBranch.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors shadow-xs"
                  >
                    <span>فتح الموقع على Google Maps</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================= */}
      {/* Modal 3: سجل تعديلات المقر / الموقع (Audit Trail Drawer)    */}
      {/* ============================================================= */}
      <AnimatePresence>
        {auditBranch && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl max-h-[85vh] flex flex-col bg-white dark:bg-[#0E1610] rounded-2xl border border-slate-200 dark:border-[#243628] shadow-2xl overflow-hidden text-start"
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-[#243628] bg-slate-50 dark:bg-[#121B14] shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
                    <History className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-[#F3EFE6]">
                      سجل تعديلات الموقع (Audit Trail)
                    </h3>
                    <span className="text-[11px] text-slate-500 dark:text-[#8FA392]">
                      {auditBranch.nameAr} ({auditBranch.companyNameAr})
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setAuditBranch(null)}
                  className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
                {!auditBranch.auditLogs || auditBranch.auditLogs.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 dark:text-[#8FA392]">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-400 opacity-60" />
                    <p>تم تسجيل الموقع ولم تجر عليه أي تعديلات بعد.</p>
                  </div>
                ) : (
                  auditBranch.auditLogs.map((entry, idx) => (
                    <div
                      key={entry.id || idx}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-[#243628] bg-slate-50/70 dark:bg-[#17231A] space-y-2.5"
                    >
                      <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-[#243628] pb-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md font-bold text-[10.5px] bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                            {entry.actionLabelAr || 'تحديث البيانات'}
                          </span>
                          <span className="font-bold text-slate-800 dark:text-[#F3EFE6]">
                            بواسطة: {entry.userName || 'يوسف حجازي'}
                          </span>
                        </div>
                        <span className="font-mono text-[11px] text-slate-500 dark:text-[#8FA392] flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{entry.timestamp}</span>
                        </span>
                      </div>

                      {entry.changes && entry.changes.length > 0 ? (
                        <div className="space-y-1.5 pt-1">
                          {entry.changes.map((ch, chIdx) => (
                            <div
                              key={chIdx}
                              className="text-[11px] p-2 rounded-lg bg-white dark:bg-[#101912] border border-slate-200/80 dark:border-[#243628] leading-relaxed text-slate-800 dark:text-[#F3EFE6]"
                            >
                              <strong className="text-amber-600 dark:text-amber-400 font-bold ml-1">
                                [{ch.fieldLabel || ch.field}]:
                              </strong>
                              <span>تم التغيير من </span>
                              <span className="font-mono px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 line-through mx-1">
                                {ch.oldValue || '—'}
                              </span>
                              <span> إلى </span>
                              <span className="font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 font-bold mx-1">
                                {ch.newValue}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-500 dark:text-[#8FA392]">
                          تم الحفظ وتثبيت البيانات دون تغيير في القيم.
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================= */}
      {/* Modal 4: نافذة تأكيد حذف المقر / الموقع نهائياً             */}
      {/* ============================================================= */}
      <AnimatePresence>
        {branchToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-[#0E1610] rounded-2xl border border-slate-200 dark:border-[#243628] shadow-2xl p-5 text-start"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4 border border-rose-500/20">
                <Trash2 className="w-6 h-6" />
              </div>

              <h3 className="text-sm font-bold text-slate-900 dark:text-[#F3EFE6] mb-1.5">
                تأكيد حذف المقر / الموقع نهائياً
              </h3>
              <p className="text-xs text-slate-600 dark:text-[#8FA392] leading-relaxed mb-5">
                هل أنت متأكد من حذف <strong>&quot;{branchToDelete.nameAr}&quot;</strong> التابع لشركة <strong>&quot;{branchToDelete.companyNameAr}&quot;</strong>؟ سيتم إزالة كافة بيانات الموقع وسجل تدقيقه نهائياً.
              </p>

              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setBranchToDelete(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-[#243628] text-slate-700 dark:text-[#8FA392] font-bold text-xs hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDeleteBranch(branchToDelete.id);
                    setBranchToDelete(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-md active:scale-95"
                >
                  نعم، احذف الموقع
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
