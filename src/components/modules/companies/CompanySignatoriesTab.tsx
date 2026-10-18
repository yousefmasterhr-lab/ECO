import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PenTool,
  Plus,
  FileText,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Landmark,
  Scale,
  FileCheck2,
  Ban,
  AlertCircle,
  UploadCloud,
  ShieldCheck,
  Building2,
  UserCheck,
  Search,
  User,
  History
} from 'lucide-react';
import {
  AuthorizedSignatory,
  CompanyEntity,
  CompanyDocumentAttachment
} from './types';
import { formatCurrency } from '../../../utils/formatters';
import { useAuth } from '../../../context/AuthContext';
import { CreatableSelect } from '../../common/CreatableSelect';
import { DocumentPreviewModal } from '../../common/DocumentPreviewModal';

const formatAttachmentSize = (bytes?: number) => {
  if (!bytes) return '—';
  return bytes > 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${(bytes / 1024).toFixed(1)} KB`;
};

interface CompanySignatoriesTabProps {
  signatories: AuthorizedSignatory[];
  companies: CompanyEntity[];
  onAddSignatory: (sig: AuthorizedSignatory) => Promise<void> | void;
  onUpdateSignatory: (sig: AuthorizedSignatory) => Promise<void> | void;
  onDeleteSignatory: (id: string) => Promise<void> | void;
  onToggleRevoke: (id: string) => Promise<void> | void;
}

export const CompanySignatoriesTab: React.FC<CompanySignatoriesTabProps> = ({
  signatories,
  companies,
  onAddSignatory,
  onUpdateSignatory,
  onDeleteSignatory,
  onToggleRevoke
}) => {
  const { hasPermission } = useAuth();

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'active' | 'expiring' | 'expired' | 'revoked'>('all');

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSig, setEditingSig] = useState<AuthorizedSignatory | null>(null);

  // Audit Log Modal
  const [auditModalSig, setAuditModalSig] = useState<AuthorizedSignatory | null>(null);

  // Document Viewer Modal
  const [docPreviewSig, setDocPreviewSig] = useState<AuthorizedSignatory | null>(null);

  // Delete / Revoke Confirmation Modal
  const [deleteConfirmSig, setDeleteConfirmSig] = useState<AuthorizedSignatory | null>(null);

  // Form State
  const [formNameAr, setFormNameAr] = useState('');
  const [formRoleAr, setFormRoleAr] = useState('');
  const [formNationalId, setFormNationalId] = useState('');
  const [formCompanyId, setFormCompanyId] = useState('');
  const [formPoaNumber, setFormPoaNumber] = useState('');
  const [formNotaryOfficeAr, setFormNotaryOfficeAr] = useState('');
  const [formIssueDate, setFormIssueDate] = useState('');
  const [formExpiryDate, setFormExpiryDate] = useState('');
  const [formIsOpenEnded, setFormIsOpenEnded] = useState(false);
  const [formDriveDocUrl, setFormDriveDocUrl] = useState('');
  const [formAttachment, setFormAttachment] = useState<CompanyDocumentAttachment | undefined>(undefined);

  // Banking limits form
  const [singleLimit, setSingleLimit] = useState<string | number>('');
  const [jointLimit, setJointLimit] = useState<string | number>('');
  const [allowLG, setAllowLG] = useState(false);
  const [allowLC, setAllowLC] = useState(false);
  const [allowOpenAcc, setAllowOpenAcc] = useState(false);
  const [bankingNotes, setBankingNotes] = useState('');

  // Contractual limits form
  const [allowContracts, setAllowContracts] = useState(false);
  const [allowTenders, setAllowTenders] = useState(false);
  const [allowAssetTrade, setAllowAssetTrade] = useState(false);
  const [contractualNotes, setContractualNotes] = useState('');

  // Judicial limits form
  const [allowCourt, setAllowCourt] = useState(false);
  const [allowGov, setAllowGov] = useState(false);
  const [allowDispute, setAllowDispute] = useState(false);
  const [judicialNotes, setJudicialNotes] = useState('');

  const getDaysRemaining = (expiryDateStr: string, isOpenEnded?: boolean): number => {
    if (isOpenEnded || !expiryDateStr) return 9999;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const exp = new Date(expiryDateStr);
    const expDay = new Date(exp.getFullYear(), exp.getMonth(), exp.getDate());
    const diffTime = expDay.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleOpenAdd = () => {
    setEditingSig(null);
    setFormNameAr('');
    setFormRoleAr('');
    setFormNationalId('');
    setFormCompanyId(companies[0]?.id || '');
    setFormPoaNumber('');
    setFormNotaryOfficeAr('');
    setFormIssueDate(new Date().toISOString().slice(0, 10));
    setFormExpiryDate('');
    setFormIsOpenEnded(true);
    setFormDriveDocUrl('');
    setFormAttachment(undefined);

    setSingleLimit('');
    setJointLimit('');
    setAllowLG(false);
    setAllowLC(false);
    setAllowOpenAcc(false);
    setBankingNotes('');

    setAllowContracts(false);
    setAllowTenders(false);
    setAllowAssetTrade(false);
    setContractualNotes('');

    setAllowCourt(false);
    setAllowGov(false);
    setAllowDispute(false);
    setJudicialNotes('');

    setModalOpen(true);
  };

  const handleOpenEdit = (sig: AuthorizedSignatory) => {
    setEditingSig(sig);
    setFormNameAr(sig.nameAr);
    setFormRoleAr(sig.roleAr);
    setFormNationalId(sig.nationalId || '');
    setFormCompanyId(sig.companyId);
    setFormPoaNumber(sig.poaNumber);
    setFormNotaryOfficeAr(sig.notaryOfficeAr);
    setFormIssueDate(sig.issueDate);
    setFormExpiryDate(sig.expiryDate || '');
    setFormIsOpenEnded(Boolean(sig.isOpenEnded));
    setFormDriveDocUrl(sig.driveDocUrl || '');
    setFormAttachment(sig.poaAttachment);

    setSingleLimit(sig.bankingLimits.singleLimit ? sig.bankingLimits.singleLimit : '');
    setJointLimit(sig.bankingLimits.jointLimit ? sig.bankingLimits.jointLimit : '');
    setAllowLG(sig.bankingLimits.allowLettersOfGuarantee);
    setAllowLC(sig.bankingLimits.allowLettersOfCredit);
    setAllowOpenAcc(sig.bankingLimits.allowOpenAccounts);
    setBankingNotes(sig.bankingLimits.notesAr || '');

    setAllowContracts(sig.contractualLimits.allowContracts);
    setAllowTenders(sig.contractualLimits.allowTenders);
    setAllowAssetTrade(sig.contractualLimits.allowAssetTrade);
    setContractualNotes(sig.contractualLimits.notesAr || '');

    setAllowCourt(sig.judicialLimits.allowCourtRepresentation);
    setAllowGov(sig.judicialLimits.allowGovRepresentation);
    setAllowDispute(sig.judicialLimits.allowDisputeResolution);
    setJudicialNotes(sig.judicialLimits.notesAr || '');

    setModalOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setFormAttachment({
        id: `att_${Date.now()}`,
        name: file.name,
        docType: 'توكيل رسمي',
        sizeBytes: file.size,
        mimeType: file.type || 'application/octet-stream',
        uploadedAt: new Date().toISOString().slice(0, 10),
        dataUrl: result
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNameAr.trim()) return;

    const parentComp = companies.find(c => c.id === formCompanyId);
    const companyNameAr = parentComp ? parentComp.nameAr : (companies[0]?.nameAr || 'الشركة الموكلة');

    if (editingSig) {
      const updated: AuthorizedSignatory = {
        ...editingSig,
        nameAr: formNameAr.trim(),
        roleAr: formRoleAr.trim(),
        nationalId: formNationalId.trim(),
        companyId: formCompanyId,
        companyNameAr,
        poaNumber: formPoaNumber.trim(),
        notaryOfficeAr: formNotaryOfficeAr.trim(),
        issueDate: formIssueDate,
        expiryDate: formIsOpenEnded ? '' : formExpiryDate,
        isOpenEnded: formIsOpenEnded,
        driveDocUrl: formDriveDocUrl.trim(),
        poaAttachment: formAttachment,
        bankingLimits: {
          singleLimit: Number(singleLimit) || 0,
          jointLimit: Number(jointLimit) || 0,
          allowLettersOfGuarantee: allowLG,
          allowLettersOfCredit: allowLC,
          allowOpenAccounts: allowOpenAcc,
          notesAr: bankingNotes.trim()
        },
        contractualLimits: {
          allowContracts,
          allowTenders,
          allowAssetTrade,
          notesAr: contractualNotes.trim()
        },
        judicialLimits: {
          allowCourtRepresentation: allowCourt,
          allowGovRepresentation: allowGov,
          allowDisputeResolution: allowDispute,
          notesAr: judicialNotes.trim()
        }
      };
      onUpdateSignatory(updated);
    } else {
      const newSig: AuthorizedSignatory = {
        id: `sig_${Date.now()}`,
        nameAr: formNameAr.trim(),
        roleAr: formRoleAr.trim(),
        nationalId: formNationalId.trim(),
        companyId: formCompanyId,
        companyNameAr,
        poaNumber: formPoaNumber.trim(),
        notaryOfficeAr: formNotaryOfficeAr.trim(),
        issueDate: formIssueDate,
        expiryDate: formIsOpenEnded ? '' : formExpiryDate,
        isOpenEnded: formIsOpenEnded,
        driveDocUrl: formDriveDocUrl.trim(),
        poaAttachment: formAttachment,
        status: 'active',
        bankingLimits: {
          singleLimit: Number(singleLimit) || 0,
          jointLimit: Number(jointLimit) || 0,
          allowLettersOfGuarantee: allowLG,
          allowLettersOfCredit: allowLC,
          allowOpenAccounts: allowOpenAcc,
          notesAr: bankingNotes.trim()
        },
        contractualLimits: {
          allowContracts,
          allowTenders,
          allowAssetTrade,
          notesAr: contractualNotes.trim()
        },
        judicialLimits: {
          allowCourtRepresentation: allowCourt,
          allowGovRepresentation: allowGov,
          allowDisputeResolution: allowDispute,
          notesAr: judicialNotes.trim()
        }
      };
      onAddSignatory(newSig);
    }
    setModalOpen(false);
  };

  // Filtered Signatories
  const filteredSignatories = useMemo(() => {
    return signatories.filter(sig => {
      // Company match
      if (selectedCompanyId !== 'all' && sig.companyId !== selectedCompanyId) {
        return false;
      }

      // Search match
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchName = sig.nameAr.toLowerCase().includes(query);
        const matchRole = sig.roleAr.toLowerCase().includes(query);
        const matchPoa = sig.poaNumber.toLowerCase().includes(query);
        const matchOffice = sig.notaryOfficeAr.toLowerCase().includes(query);
        const matchCompany = sig.companyNameAr.toLowerCase().includes(query);
        const matchNationalId = sig.nationalId ? sig.nationalId.includes(query) : false;
        if (!matchName && !matchRole && !matchPoa && !matchOffice && !matchCompany && !matchNationalId) {
          return false;
        }
      }

      // Status match
      const days = getDaysRemaining(sig.expiryDate, sig.isOpenEnded);
      const isExpired = !sig.isOpenEnded && days <= 0;
      const isExpiring = !sig.isOpenEnded && days > 0 && days <= 45;
      const isRevoked = sig.status === 'revoked';

      if (selectedStatusFilter === 'revoked') return isRevoked;
      if (selectedStatusFilter === 'expired') return isExpired && !isRevoked;
      if (selectedStatusFilter === 'expiring') return isExpiring && !isRevoked;
      if (selectedStatusFilter === 'active') return !isRevoked && !isExpired;

      return true;
    });
  }, [signatories, selectedCompanyId, searchQuery, selectedStatusFilter]);

  // KPIs
  const kpiStats = useMemo(() => {
    let active = 0;
    let expiring = 0;
    let expired = 0;
    let revoked = 0;

    signatories.forEach(s => {
      if (s.status === 'revoked') {
        revoked++;
      } else {
        const days = getDaysRemaining(s.expiryDate, s.isOpenEnded);
        if (!s.isOpenEnded && days <= 0) {
          expired++;
        } else if (!s.isOpenEnded && days <= 45) {
          expiring++;
          active++;
        } else {
          active++;
        }
      }
    });

    return { total: signatories.length, active, expiring, expired, revoked };
  }, [signatories]);

  return (
    <div className="space-y-6">
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-[#243628]">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <PenTool className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-[#F3EFE6]">
              سجل المفوضين والتوكيلات الرسمية ومصفوفة الصلاحيات
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-[#8FA392]">
            التوكيلات الرسمية الموثقة بالشهر العقاري ومصفوفة الصلاحيات البنكية والتعاقدية والقضائية المعتمدة
          </p>
        </div>

        {hasPermission('companies.signatories.create') && (
          <button
            onClick={handleOpenAdd}
            className="min-h-[44px] flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-sm hover:shadow active:scale-98 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ إضافة مفوض جديد</span>
          </button>
        )}
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-white dark:bg-[#17231A] border border-slate-200 dark:border-[#243628] shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-[#8FA392] text-xs mb-1">
            <span>إجمالي المفوضين</span>
            <UserCheck className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-[#F3EFE6] font-mono">
            {kpiStats.total}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-[#17231A] border border-slate-200 dark:border-[#243628] shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-[#8FA392] text-xs mb-1">
            <span>توكيلات سارية</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {kpiStats.active}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-[#17231A] border border-slate-200 dark:border-[#243628] shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-[#8FA392] text-xs mb-1">
            <span>تنتهي قريباً / منتهية</span>
            {(kpiStats.expiring > 0 || kpiStats.expired > 0) ? (
              <AlertTriangle className="w-4 h-4 text-rose-500 animate-pulse" />
            ) : (
              <Clock className="w-4 h-4 text-slate-400" />
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono">
              {kpiStats.expiring}
            </span>
            {kpiStats.expired > 0 && (
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                ({kpiStats.expired} منتهي)
              </span>
            )}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-[#17231A] border border-slate-200 dark:border-[#243628] shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-[#8FA392] text-xs mb-1">
            <span>توكيلات ملغاة</span>
            <Ban className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl font-black text-slate-500 dark:text-slate-400 font-mono">
            {kpiStats.revoked}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#111A13] border border-slate-200/80 dark:border-[#243628]">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="بحث باسم المفوض، المنصب، رقم التوكيل، الرقم القومي..."
            className="w-full min-h-[40px] pr-9 pl-4 rounded-lg bg-white dark:bg-[#17231A] border border-slate-200 dark:border-[#243628] text-xs text-slate-900 dark:text-[#F3EFE6] placeholder:text-slate-400 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Company Filter Dropdown */}
          <div className="relative min-w-[170px]">
            <select
              value={selectedCompanyId}
              onChange={e => setSelectedCompanyId(e.target.value)}
              className="w-full min-h-[40px] px-3 rounded-lg bg-white dark:bg-[#17231A] border border-slate-200 dark:border-[#243628] text-xs font-bold text-slate-800 dark:text-[#F3EFE6] focus:outline-none focus:border-amber-500"
            >
              <option value="all">كافة الشركات التابعة</option>
              {companies.map(comp => (
                <option key={comp.id} value={comp.id}>
                  {comp.nameAr}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 bg-white dark:bg-[#17231A] p-1 rounded-lg border border-slate-200 dark:border-[#243628] text-[11px] font-bold">
            <button
              onClick={() => setSelectedStatusFilter('all')}
              className={`px-2.5 py-1.5 rounded-md transition-colors ${
                selectedStatusFilter === 'all'
                  ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 font-black'
                  : 'text-slate-600 dark:text-[#8FA392] hover:text-slate-900'
              }`}
            >
              الكل ({signatories.length})
            </button>
            <button
              onClick={() => setSelectedStatusFilter('active')}
              className={`px-2.5 py-1.5 rounded-md transition-colors ${
                selectedStatusFilter === 'active'
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-black'
                  : 'text-slate-600 dark:text-[#8FA392] hover:text-slate-900'
              }`}
            >
              ساري
            </button>
            <button
              onClick={() => setSelectedStatusFilter('expiring')}
              className={`px-2.5 py-1.5 rounded-md transition-colors ${
                selectedStatusFilter === 'expiring'
                  ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 font-black'
                  : 'text-slate-600 dark:text-[#8FA392] hover:text-slate-900'
              }`}
            >
              ينتهي قريباً
            </button>
            <button
              onClick={() => setSelectedStatusFilter('expired')}
              className={`px-2.5 py-1.5 rounded-md transition-colors ${
                selectedStatusFilter === 'expired'
                  ? 'bg-rose-500/15 text-rose-700 dark:text-rose-400 font-black'
                  : 'text-slate-600 dark:text-[#8FA392] hover:text-slate-900'
              }`}
            >
              منتهي
            </button>
            <button
              onClick={() => setSelectedStatusFilter('revoked')}
              className={`px-2.5 py-1.5 rounded-md transition-colors ${
                selectedStatusFilter === 'revoked'
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-black'
                  : 'text-slate-600 dark:text-[#8FA392] hover:text-slate-900'
              }`}
            >
              ملغى
            </button>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredSignatories.length === 0 && (
        <div className="py-16 px-6 text-center rounded-2xl bg-white dark:bg-[#17231A] border border-dashed border-slate-300 dark:border-[#243628]">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center mb-4">
            <PenTool className="w-8 h-8" />
          </div>
          <h4 className="text-base font-black text-slate-900 dark:text-[#F3EFE6] mb-1">
            لا يوجد مفوضون أو توكيلات مسجلة حالياً
          </h4>
          <p className="text-xs text-slate-500 dark:text-[#8FA392] max-w-md mx-auto mb-5">
            ابدأ بإضافة المفوض الأول واعتماد الصلاحيات المصرفية والتعاقدية والقضائية الموثقة بالشهر العقاري.
          </p>
          {hasPermission('companies.signatories.create') && (
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>تسجيل المفوض الأول</span>
            </button>
          )}
        </div>
      )}

      {/* Delegate Cards */}
      <div className="space-y-4">
        {filteredSignatories.map((sig, idx) => {
          const daysRemaining = getDaysRemaining(sig.expiryDate, sig.isOpenEnded);
          const isExpired = !sig.isOpenEnded && daysRemaining <= 0;
          const isUrgent = !sig.isOpenEnded && daysRemaining > 0 && daysRemaining <= 45;
          const isRevoked = sig.status === 'revoked';

          return (
            <motion.div
              key={sig.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.04 }}
              className={`p-5 rounded-2xl border transition-all bg-white dark:bg-[#17231A] shadow-xs hover:shadow-md ${
                isRevoked
                  ? 'opacity-70 border-dashed border-slate-300 dark:border-stone-700'
                  : isExpired
                  ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/10'
                  : isUrgent
                  ? 'border-amber-300 dark:border-amber-900/60 bg-amber-50/20 dark:bg-amber-950/10'
                  : 'border-slate-200 dark:border-[#243628]'
              }`}
            >
              {/* Header: Name, National ID, Role, Company & Status */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-base font-black text-slate-900 dark:text-[#F3EFE6]">
                        {sig.nameAr}
                      </h4>

                      {/* Status Badges */}
                      {isRevoked ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-slate-100 text-slate-700 border border-slate-300 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700 flex items-center gap-1">
                          <Ban className="w-3 h-3 text-slate-500" />
                          <span>تم إلغاء التفويض رسمياً</span>
                        </span>
                      ) : sig.isOpenEnded ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-300 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-indigo-500" />
                          <span>ساري حتى الإلغاء (غير محدد المدة)</span>
                        </span>
                      ) : isExpired ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-black text-rose-700 bg-rose-50 border border-rose-300 dark:text-rose-400 dark:bg-rose-950/40 dark:border-rose-800 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                          <span>التوكيل منتهي الصلاحية</span>
                        </span>
                      ) : isUrgent ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold text-amber-700 bg-amber-50 border border-amber-300 dark:text-amber-400 dark:bg-amber-950/40 dark:border-amber-800 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                          <span>تجديد التوكيل عاجل ({daysRemaining} يوم)</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 dark:text-emerald-400 dark:bg-emerald-950/40 dark:border-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>توكيل ساري ({daysRemaining} يوم)</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-600 dark:text-[#8FA392] flex-wrap">
                      <span className="font-bold text-amber-700 dark:text-amber-400">
                        {sig.roleAr}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-[#D1DDD3]">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{sig.companyNameAr}</span>
                      </span>
                      {sig.nationalId && (
                        <>
                          <span>•</span>
                          <span className="font-mono text-[11px] text-slate-500">
                            الرقم القومي: {sig.nationalId}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expiry Warning Box if Expired */}
                {isExpired && !isRevoked && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-300 dark:bg-rose-950/30 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-400 font-bold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 animate-pulse" />
                    <span>تنبيه أمني: التوكيل منتهي منذ {Math.abs(daysRemaining)} يوماً. يتطلب استصدار توكيل رسمي جديد أو إلغاء القيد.</span>
                  </div>
                )}
              </div>

              {/* Power of Attorney Legal Metadata Block */}
              <div className="mb-4 p-3.5 rounded-xl bg-slate-50 dark:bg-[#0E1610] border border-slate-200/80 dark:border-[#243628] text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-[#8FA392] block mb-0.5">رقم التوكيل الرسمي:</span>
                    <strong className="text-slate-900 dark:text-[#F3EFE6] font-bold font-mono text-[12px]">{sig.poaNumber || '—'}</strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-[#8FA392] block mb-0.5">مكتب الشهر العقاري:</span>
                    <strong className="text-slate-900 dark:text-[#F3EFE6] font-bold text-[12px]">{sig.notaryOfficeAr || '—'}</strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-[#8FA392] block mb-0.5">تاريخ الإصدار:</span>
                    <strong className="text-slate-900 dark:text-[#F3EFE6] font-bold font-mono text-[12px]">{sig.issueDate || '—'}</strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-[#8FA392] block mb-0.5">تاريخ الانتهاء:</span>
                    <strong className={`font-bold font-mono text-[12px] ${
                      sig.isOpenEnded
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : isExpired
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-slate-900 dark:text-[#F3EFE6]'
                    }`}>
                      {sig.isOpenEnded ? 'ساري حتى الإلغاء (غير محدد)' : (sig.expiryDate || '—')}
                    </strong>
                  </div>
                </div>
              </div>

              {/* 3-Tier Symmetrical Authority Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                {/* 1. Banking Limits */}
                <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-[#0E1610] border border-slate-200/80 dark:border-[#243628] flex flex-col justify-between space-y-2.5">
                  <div>
                    <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-xs pb-2 border-b border-slate-200 dark:border-[#243628]">
                      <Landmark className="w-4 h-4" />
                      <span>الصلاحيات المصرفية والبنكية</span>
                    </div>

                    <div className="space-y-1.5 text-xs pt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 dark:text-[#8FA392]">التوقيع المنفرد:</span>
                        <strong className="text-slate-900 dark:text-[#F3EFE6] font-mono">
                          {sig.bankingLimits.singleLimit > 0
                            ? formatCurrency(sig.bankingLimits.singleLimit)
                            : 'غير مصرح'}
                        </strong>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 dark:text-[#8FA392]">التوقيع المشترك:</span>
                        <strong className="text-slate-900 dark:text-[#F3EFE6] font-mono">
                          {sig.bankingLimits.jointLimit === 0
                            ? 'بدون حد أقصى'
                            : formatCurrency(sig.bankingLimits.jointLimit)}
                        </strong>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-1.5">
                        {sig.bankingLimits.allowLettersOfGuarantee && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[10px] font-bold border border-amber-500/20">
                            خطابات الضمان (LG)
                          </span>
                        )}
                        {sig.bankingLimits.allowLettersOfCredit && (
                          <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-700 dark:text-blue-400 text-[10px] font-bold border border-blue-500/20">
                            الاعتمادات المستندية (LC)
                          </span>
                        )}
                        {sig.bankingLimits.allowOpenAccounts && (
                          <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-700 dark:text-purple-400 text-[10px] font-bold border border-purple-500/20">
                            فتح الحسابات
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {sig.bankingLimits.notesAr && (
                    <p className="text-[10.5px] text-slate-500 dark:text-[#8FA392] pt-1 border-t border-slate-200/50 dark:border-stone-800">
                      {sig.bankingLimits.notesAr}
                    </p>
                  )}
                </div>

                {/* 2. Contractual Limits */}
                <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-[#0E1610] border border-slate-200/80 dark:border-[#243628] flex flex-col justify-between space-y-2.5">
                  <div>
                    <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-xs pb-2 border-b border-slate-200 dark:border-[#243628]">
                      <FileCheck2 className="w-4 h-4" />
                      <span>الصلاحيات التعاقدية والتجارية</span>
                    </div>

                    <div className="space-y-2 text-xs pt-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${sig.contractualLimits.allowContracts ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-stone-600'}`} />
                        <span className={`font-medium ${sig.contractualLimits.allowContracts ? 'text-slate-900 dark:text-[#F3EFE6]' : 'text-slate-400 dark:text-stone-500'}`}>
                          توقيع عقود المقاولات والتوريدات
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${sig.contractualLimits.allowTenders ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-stone-600'}`} />
                        <span className={`font-medium ${sig.contractualLimits.allowTenders ? 'text-slate-900 dark:text-[#F3EFE6]' : 'text-slate-400 dark:text-stone-500'}`}>
                          دخول المناقصات والمزايدات الحكومية
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${sig.contractualLimits.allowAssetTrade ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-stone-600'}`} />
                        <span className={`font-medium ${sig.contractualLimits.allowAssetTrade ? 'text-slate-900 dark:text-[#F3EFE6]' : 'text-slate-400 dark:text-stone-500'}`}>
                          شراء وبيع الأصول العقارية والآليات
                        </span>
                      </div>
                    </div>
                  </div>

                  {sig.contractualLimits.notesAr && (
                    <p className="text-[10.5px] text-slate-500 dark:text-[#8FA392] pt-1 border-t border-slate-200/50 dark:border-stone-800">
                      {sig.contractualLimits.notesAr}
                    </p>
                  )}
                </div>

                {/* 3. Judicial Limits */}
                <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-[#0E1610] border border-slate-200/80 dark:border-[#243628] flex flex-col justify-between space-y-2.5">
                  <div>
                    <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-xs pb-2 border-b border-slate-200 dark:border-[#243628]">
                      <Scale className="w-4 h-4" />
                      <span>الصلاحيات القضائية والتمثيل</span>
                    </div>

                    <div className="space-y-2 text-xs pt-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${sig.judicialLimits.allowCourtRepresentation ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-stone-600'}`} />
                        <span className={`font-medium ${sig.judicialLimits.allowCourtRepresentation ? 'text-slate-900 dark:text-[#F3EFE6]' : 'text-slate-400 dark:text-stone-500'}`}>
                          التمثيل القضائي أمام كافة المحاكم
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${sig.judicialLimits.allowGovRepresentation ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-stone-600'}`} />
                        <span className={`font-medium ${sig.judicialLimits.allowGovRepresentation ? 'text-slate-900 dark:text-[#F3EFE6]' : 'text-slate-400 dark:text-stone-500'}`}>
                          التمثيل أمام الهيئات والدوائر الحكومية
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${sig.judicialLimits.allowDisputeResolution ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-stone-600'}`} />
                        <span className={`font-medium ${sig.judicialLimits.allowDisputeResolution ? 'text-slate-900 dark:text-[#F3EFE6]' : 'text-slate-400 dark:text-stone-500'}`}>
                          هيئات التحكيم وتسوية المنازعات
                        </span>
                      </div>
                    </div>
                  </div>

                  {sig.judicialLimits.notesAr && (
                    <p className="text-[10.5px] text-slate-500 dark:text-[#8FA392] pt-1 border-t border-slate-200/50 dark:border-stone-800">
                      {sig.judicialLimits.notesAr}
                    </p>
                  )}
                </div>
              </div>

              {/* Card Footer: Strictly Icon-Only Action Buttons with Rich Tooltips */}
              <div className="pt-3 border-t border-slate-200/80 dark:border-[#243628] flex items-center justify-between">
                <div className="text-xs text-slate-500 dark:text-[#8FA392] flex items-center gap-2">
                  {sig.poaAttachment && (
                    <span className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[10px] font-bold border border-amber-200 dark:border-amber-500/30">
                      مرفق موثق ({sig.poaAttachment.name})
                    </span>
                  )}
                </div>

                {/* Sleek Icon-Only Buttons */}
                <div className="flex items-center gap-1.5">
                  {/* 1. معاينة / تحميل صورة التوكيل */}
                  {hasPermission('companies.signatories.download_poa') && (
                    <button
                      onClick={() => setDocPreviewSig(sig)}
                      title="معاينة / تحميل صورة التوكيل الموثق"
                      className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl bg-slate-100 hover:bg-amber-50 text-amber-600 hover:text-amber-700 dark:bg-[#111A13] dark:hover:bg-amber-950/40 dark:text-amber-400 dark:hover:text-amber-300 border border-slate-200/70 dark:border-[#243628] transition-all cursor-pointer shadow-2xs"
                    >
                      <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    </button>
                  )}

                  {/* 2. تعديل بيانات وصلاحيات المفوض */}
                  {hasPermission('companies.signatories.edit') && (
                    <button
                      onClick={() => handleOpenEdit(sig)}
                      title="تعديل بيانات وصلاحيات المفوض"
                      className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl bg-slate-100 hover:bg-amber-50 text-amber-600 hover:text-amber-700 dark:bg-[#111A13] dark:hover:bg-amber-950/40 dark:text-amber-400 dark:hover:text-amber-300 border border-slate-200/70 dark:border-[#243628] transition-all cursor-pointer shadow-2xs"
                    >
                      <Pencil className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    </button>
                  )}

                  {/* 3. سجل التعديلات (Audit Log) */}
                  {hasPermission('companies.signatories.view_audit') && (
                    <button
                      onClick={() => setAuditModalSig(sig)}
                      title="سجل تعديلات التفويض والصلاحيات"
                      className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl bg-slate-100 hover:bg-blue-50 text-blue-600 hover:text-blue-700 dark:bg-[#111A13] dark:hover:bg-blue-950/40 dark:text-blue-400 dark:hover:text-blue-300 border border-slate-200/70 dark:border-[#243628] transition-all cursor-pointer shadow-2xs"
                    >
                      <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </button>
                  )}

                  {/* 4. إلغاء التفويض / حذف */}
                  {hasPermission('companies.signatories.delete') && (
                    <button
                      onClick={() => setDeleteConfirmSig(sig)}
                      title="إلغاء التفويض أو حذف السجل"
                      className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl bg-slate-100 hover:bg-rose-50 text-rose-600 hover:text-rose-700 dark:bg-[#111A13] dark:hover:bg-rose-950/40 dark:text-rose-400 dark:hover:text-rose-300 border border-slate-200/70 dark:border-[#243628] transition-all cursor-pointer shadow-2xs"
                    >
                      <Trash2 className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Modal 1: إضافة / تعديل مفوض (Add/Edit Delegate Modal) */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 !m-0 !top-0 !left-0 !right-0 !bottom-0 w-screen h-screen z-[999] flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-3xl max-h-[92vh] flex flex-col bg-white dark:bg-[#0E1610] rounded-2xl border border-slate-200 dark:border-[#243628] shadow-2xl overflow-hidden text-start"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-[#243628] shrink-0 bg-slate-50/50 dark:bg-[#111A13]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                    <PenTool className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-[#F3EFE6]">
                      {editingSig ? 'تعديل بيانات المفوض ومصفوفة الصلاحيات' : 'تسجيل مفوض جديد واعتماد الصلاحيات الرسمية'}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-[#8FA392]">
                      سند التوكيل الرسمي الموثق بالشهر العقاري ومصفوفة الصلاحيات
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6 overflow-y-auto text-xs">
                {/* Section 1: البيانات الشخصية والوظيفية */}
                <div className="space-y-3">
                  <h4 className="font-black text-xs text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>البيانات الشخصية والصفة الرسمية</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-800 dark:text-[#F3EFE6] mb-1">
                        اسم المفوض (الرباعي كما ببطاقة الرقم القومي) *
                      </label>
                      <input
                        type="text"
                        required
                        value={formNameAr}
                        onChange={e => setFormNameAr(e.target.value)}
                        placeholder="الاسم الرباعي للمفوض رسمياً كما هو مدون ببطاقة الرقم القومي"
                        className="w-full min-h-[42px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-[#243628] bg-slate-50/50 dark:bg-[#17231A] text-slate-900 dark:text-[#F3EFE6] placeholder:text-slate-400 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <CreatableSelect
                        category="signatory_titles"
                        label="الصفة / المسمى الوظيفي والتفويض *"
                        value={formRoleAr}
                        onChange={val => setFormRoleAr(val)}
                        placeholder="اختر أو أضف صفة التفويض..."
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-800 dark:text-[#F3EFE6] mb-1">
                        الرقم القومي (14 رقماً)
                      </label>
                      <input
                        type="text"
                        maxLength={14}
                        value={formNationalId}
                        onChange={e => setFormNationalId(e.target.value)}
                        placeholder="الرقم القومي المكون من 14 رقماً"
                        className="w-full min-h-[42px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-[#243628] bg-slate-50/50 dark:bg-[#17231A] text-slate-900 dark:text-[#F3EFE6] font-mono placeholder:text-slate-400 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 dark:text-[#F3EFE6] mb-1">
                        الشركة الموكلة التابع لها التفويض *
                      </label>
                      <select
                        required
                        value={formCompanyId}
                        onChange={e => setFormCompanyId(e.target.value)}
                        className="w-full min-h-[42px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-[#243628] bg-slate-50/50 dark:bg-[#17231A] text-slate-900 dark:text-[#F3EFE6] font-bold focus:outline-none focus:border-amber-500"
                      >
                        {companies.map(comp => (
                          <option key={comp.id} value={comp.id}>
                            {comp.nameAr}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 2: بيانات التوكيل والشهر العقاري */}
                <div className="pt-4 border-t border-slate-200 dark:border-[#243628] space-y-3">
                  <h4 className="font-black text-xs text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>بيانات التوكيل الرسمي وسند التفويض</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-800 dark:text-[#F3EFE6] mb-1">
                        رقم التوكيل الرسمي وسنته *
                      </label>
                      <input
                        type="text"
                        required
                        value={formPoaNumber}
                        onChange={e => setFormPoaNumber(e.target.value)}
                        placeholder="رقم التوكيل الرسمي وسنته (مثال: توكيل عام رسمي رقم ... لسنة ...)"
                        className="w-full min-h-[42px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-[#243628] bg-slate-50/50 dark:bg-[#17231A] text-slate-900 dark:text-[#F3EFE6] placeholder:text-slate-400 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 dark:text-[#F3EFE6] mb-1">
                        مكتب الشهر العقاري والتوثيق *
                      </label>
                      <input
                        type="text"
                        required
                        value={formNotaryOfficeAr}
                        onChange={e => setFormNotaryOfficeAr(e.target.value)}
                        placeholder="مكتب التوثيق والشهر العقاري الصادر منه التوكيل"
                        className="w-full min-h-[42px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-[#243628] bg-slate-50/50 dark:bg-[#17231A] text-slate-900 dark:text-[#F3EFE6] placeholder:text-slate-400 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-800 dark:text-[#F3EFE6] mb-1">
                        تاريخ الإصدار *
                      </label>
                      <input
                        type="date"
                        required
                        value={formIssueDate}
                        onChange={e => setFormIssueDate(e.target.value)}
                        className="w-full min-h-[42px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-[#243628] bg-slate-50/50 dark:bg-[#17231A] text-slate-900 dark:text-[#F3EFE6] focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-bold text-slate-800 dark:text-[#F3EFE6]">
                          تاريخ الانتهاء
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-amber-700 dark:text-amber-400 font-bold">
                          <input
                            type="checkbox"
                            checked={formIsOpenEnded}
                            onChange={e => setFormIsOpenEnded(e.target.checked)}
                            className="w-4 h-4 rounded bg-white dark:bg-stone-800 border-2 border-slate-300 dark:border-stone-600 text-amber-600 focus:ring-amber-500 cursor-pointer"
                          />
                          <span>توكيل غير محدد المدة / ساري حتى الإلغاء</span>
                        </label>
                      </div>

                      <input
                        type="date"
                        disabled={formIsOpenEnded}
                        required={!formIsOpenEnded}
                        value={formIsOpenEnded ? '' : formExpiryDate}
                        onChange={e => setFormExpiryDate(e.target.value)}
                        className={`w-full min-h-[42px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-[#243628] bg-slate-50/50 dark:bg-[#17231A] text-slate-900 dark:text-[#F3EFE6] cursor-text caret-slate-900 dark:caret-amber-400 focus:outline-none focus:border-amber-500 ${
                          formIsOpenEnded ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-stone-900' : ''
                        }`}
                      />
                    </div>
                  </div>

                  {/* Attachment Upload (Direct File Upload Active) */}
                  <div className="pt-1">
                    <label className="block font-bold text-slate-800 dark:text-[#F3EFE6] mb-1">
                      إرفاق صورة التوكيل الموثق (PDF أو صور عالية الجودة)
                    </label>
                    <div className="relative border-2 border-dashed border-slate-200 dark:border-[#243628] hover:border-amber-500 rounded-xl p-4 bg-slate-50/50 dark:bg-[#17231A] text-center transition-colors">
                      <input
                        type="file"
                        accept=".pdf,image/*"
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="flex flex-col items-center gap-1.5">
                        <UploadCloud className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                        <span className="text-xs font-bold text-slate-700 dark:text-[#D1DDD3]">
                          {formAttachment ? formAttachment.name : 'انقر أو اسحب الملف هنا للرفع المباشر'}
                        </span>
                        {formAttachment && (
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                            الحجم: {formatAttachmentSize(formAttachment.sizeBytes)} • تم التحميل بنجاح
                          </span>
                        )}
                      </div>
                    </div>
                    {formAttachment && (
                      <button
                        type="button"
                        onClick={() => setFormAttachment(undefined)}
                        className="mt-1 text-[11px] text-rose-500 hover:underline flex items-center gap-1"
                      >
                        <X className="w-3 h-3" />
                        <span>إلغاء المرفق</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Section 3: مصفوفة الصلاحيات المرنة (Authority Matrix) */}
                <div className="pt-4 border-t border-slate-200 dark:border-[#243628] space-y-4">
                  <h4 className="font-black text-xs text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    <span>مصفوفة الصلاحيات المعتمدة (Authority Matrix)</span>
                  </h4>

                  {/* 1. Banking Limits Form */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#111A13] border border-slate-200 dark:border-[#243628] space-y-3">
                    <span className="font-bold text-xs text-slate-900 dark:text-[#F3EFE6] flex items-center gap-2">
                      <Landmark className="w-4 h-4 text-amber-600" />
                      <span>الصلاحيات المصرفية والبنكية:</span>
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-600 dark:text-[#8FA392] mb-1 font-bold">
                          سقف التوقيع المنفرد (ج.م):
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={singleLimit}
                          onChange={e => setSingleLimit(e.target.value === '' ? '' : Number(e.target.value))}
                          placeholder="أدخل الحد الأقصى بالجنيه أو اتركه فارغاً لغير المصرح"
                          className="w-full min-h-[42px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-[#243628] bg-white dark:bg-[#0E1610] text-slate-900 dark:text-[#F3EFE6] font-mono cursor-text caret-slate-900 dark:caret-amber-400 focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-600 dark:text-[#8FA392] mb-1 font-bold">
                          سقف التوقيع المشترك (ج.م):
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={jointLimit}
                          onChange={e => setJointLimit(e.target.value === '' ? '' : Number(e.target.value))}
                          placeholder="أدخل الحد الأقصى بالجنيه أو اتركه فارغاً لبدون حد أقصى"
                          className="w-full min-h-[42px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-[#243628] bg-white dark:bg-[#0E1610] text-slate-900 dark:text-[#F3EFE6] font-mono cursor-text caret-slate-900 dark:caret-amber-400 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 pt-1">
                      <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800 dark:text-[#F3EFE6]">
                        <input
                          type="checkbox"
                          checked={allowLG}
                          onChange={e => setAllowLG(e.target.checked)}
                          className="w-4 h-4 rounded bg-white dark:bg-stone-800 border-2 border-slate-300 dark:border-stone-600 text-amber-600 focus:ring-amber-500 cursor-pointer"
                        />
                        <span>إصدار خطابات الضمان (LG)</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800 dark:text-[#F3EFE6]">
                        <input
                          type="checkbox"
                          checked={allowLC}
                          onChange={e => setAllowLC(e.target.checked)}
                          className="w-4 h-4 rounded bg-white dark:bg-stone-800 border-2 border-slate-300 dark:border-stone-600 text-amber-600 focus:ring-amber-500 cursor-pointer"
                        />
                        <span>فتح الاعتمادات المستندية (LC)</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800 dark:text-[#F3EFE6]">
                        <input
                          type="checkbox"
                          checked={allowOpenAcc}
                          onChange={e => setAllowOpenAcc(e.target.checked)}
                          className="w-4 h-4 rounded bg-white dark:bg-stone-800 border-2 border-slate-300 dark:border-stone-600 text-amber-600 focus:ring-amber-500 cursor-pointer"
                        />
                        <span>فتح وغلق الحسابات البنكية</span>
                      </label>
                    </div>

                    <input
                      type="text"
                      value={bankingNotes}
                      onChange={e => setBankingNotes(e.target.value)}
                      placeholder="شروط بنكية إضافية أو بنوك محددة..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-[#243628] bg-white dark:bg-[#0E1610] text-slate-900 dark:text-[#F3EFE6] cursor-text caret-slate-900 dark:caret-amber-400 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* 2. Contractual Limits Form */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#111A13] border border-slate-200 dark:border-[#243628] space-y-3">
                    <span className="font-bold text-xs text-slate-900 dark:text-[#F3EFE6] flex items-center gap-2">
                      <FileCheck2 className="w-4 h-4 text-amber-600" />
                      <span>الصلاحيات التعاقدية والتجارية:</span>
                    </span>

                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800 dark:text-[#F3EFE6]">
                        <input
                          type="checkbox"
                          checked={allowContracts}
                          onChange={e => setAllowContracts(e.target.checked)}
                          className="w-4 h-4 rounded bg-white dark:bg-stone-800 border-2 border-slate-300 dark:border-stone-600 text-amber-600 focus:ring-amber-500 cursor-pointer"
                        />
                        <span>توقيع عقود المقاولات والتوريدات</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800 dark:text-[#F3EFE6]">
                        <input
                          type="checkbox"
                          checked={allowTenders}
                          onChange={e => setAllowTenders(e.target.checked)}
                          className="w-4 h-4 rounded bg-white dark:bg-stone-800 border-2 border-slate-300 dark:border-stone-600 text-amber-600 focus:ring-amber-500 cursor-pointer"
                        />
                        <span>دخول المناقصات والمزايدات الحكومية</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800 dark:text-[#F3EFE6]">
                        <input
                          type="checkbox"
                          checked={allowAssetTrade}
                          onChange={e => setAllowAssetTrade(e.target.checked)}
                          className="w-4 h-4 rounded bg-white dark:bg-stone-800 border-2 border-slate-300 dark:border-stone-600 text-amber-600 focus:ring-amber-500 cursor-pointer"
                        />
                        <span>بيع وشراء الأصول الثابتة والمعدات</span>
                      </label>
                    </div>

                    <input
                      type="text"
                      value={contractualNotes}
                      onChange={e => setContractualNotes(e.target.value)}
                      placeholder="شروط تعاقدية إضافية..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-[#243628] bg-white dark:bg-[#0E1610] text-slate-900 dark:text-[#F3EFE6] cursor-text caret-slate-900 dark:caret-amber-400 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* 3. Judicial Limits Form */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#111A13] border border-slate-200 dark:border-[#243628] space-y-3">
                    <span className="font-bold text-xs text-slate-900 dark:text-[#F3EFE6] flex items-center gap-2">
                      <Scale className="w-4 h-4 text-amber-600" />
                      <span>الصلاحيات القضائية والتمثيل:</span>
                    </span>

                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800 dark:text-[#F3EFE6]">
                        <input
                          type="checkbox"
                          checked={allowCourt}
                          onChange={e => setAllowCourt(e.target.checked)}
                          className="w-4 h-4 rounded bg-white dark:bg-stone-800 border-2 border-slate-300 dark:border-stone-600 text-amber-600 focus:ring-amber-500 cursor-pointer"
                        />
                        <span>المرافعة والتمثيل القضائي أمام كافة المحاكم</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800 dark:text-[#F3EFE6]">
                        <input
                          type="checkbox"
                          checked={allowGov}
                          onChange={e => setAllowGov(e.target.checked)}
                          className="w-4 h-4 rounded bg-white dark:bg-stone-800 border-2 border-slate-300 dark:border-stone-600 text-amber-600 focus:ring-amber-500 cursor-pointer"
                        />
                        <span>التمثيل أمام الهيئات والدوائر الحكومية والضرائب</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800 dark:text-[#F3EFE6]">
                        <input
                          type="checkbox"
                          checked={allowDispute}
                          onChange={e => setAllowDispute(e.target.checked)}
                          className="w-4 h-4 rounded bg-white dark:bg-stone-800 border-2 border-slate-300 dark:border-stone-600 text-amber-600 focus:ring-amber-500 cursor-pointer"
                        />
                        <span>تسوية المنازعات ومجالس التحكيم</span>
                      </label>
                    </div>

                    <input
                      type="text"
                      value={judicialNotes}
                      onChange={e => setJudicialNotes(e.target.value)}
                      placeholder="شروط وملاحظات التمثيل القضائي..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-[#243628] bg-white dark:bg-[#0E1610] text-slate-900 dark:text-[#F3EFE6] cursor-text caret-slate-900 dark:caret-amber-400 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Submit Actions */}
                <div className="pt-4 border-t border-slate-200 dark:border-[#243628] flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="min-h-[42px] px-5 py-2 rounded-xl border border-slate-200 dark:border-[#243628] text-slate-600 dark:text-[#8FA392] hover:bg-slate-100 dark:hover:bg-white/5 font-semibold transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="min-h-[42px] px-6 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition-all shadow-sm active:scale-98 cursor-pointer"
                  >
                    {editingSig ? 'حفظ التعديلات واعتماد الصلاحيات' : 'تسجيل وتفويض رسمي'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal 2: سجل تعديلات التفويض والصلاحيات (Interactive Change Audit Log) */}
      <AnimatePresence>
        {auditModalSig && (
          <div className="fixed inset-0 !m-0 !top-0 !left-0 !right-0 !bottom-0 w-screen h-screen z-[999] flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl max-h-[85vh] flex flex-col bg-white dark:bg-[#0E1610] rounded-2xl border border-slate-200 dark:border-[#243628] shadow-2xl overflow-hidden text-start"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-[#243628] bg-slate-50/50 dark:bg-[#111A13] shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                    <History className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-[#F3EFE6]">
                      سجل تعديلات التفويض والصلاحيات
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-[#8FA392]">
                      {auditModalSig.nameAr} • {auditModalSig.companyNameAr} ({auditModalSig.poaNumber})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setAuditModalSig(null)}
                  className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 sm:p-6 space-y-4 overflow-y-auto text-xs">
                {(!auditModalSig.auditLogs || auditModalSig.auditLogs.length === 0 || (auditModalSig.auditLogs.length === 1 && auditModalSig.auditLogs[0].action === 'create')) ? (
                  <div className="py-10 text-center">
                    <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 flex items-center justify-center mx-auto mb-3">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-[#F3EFE6] mb-1">
                      تم إصدار التفويض ولم تجر عليه أي تعديلات بعد
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-[#8FA392]">
                      تاريخ القيد المعتمد: {auditModalSig.createdAt || auditModalSig.issueDate} بواسطة يوسف حجازي
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {auditModalSig.auditLogs.slice().reverse().map((entry, index) => (
                      <div
                        key={entry.id || index}
                        className="p-4 rounded-xl bg-slate-50 dark:bg-[#17231A] border border-slate-200 dark:border-[#243628] space-y-2.5"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200/80 dark:border-stone-800">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                            <strong className="text-slate-900 dark:text-[#F3EFE6] font-bold">
                              المستخدم القائم بالتعديل: {entry.userName || 'يوسف حجازي'}
                            </strong>
                          </div>
                          <span className="font-mono text-[11px] text-slate-500 dark:text-[#8FA392]">
                            {entry.timestamp}
                          </span>
                        </div>

                        {entry.changes && entry.changes.length > 0 ? (
                          <div className="space-y-1.5 pt-1">
                            {entry.changes.map((ch, cIdx) => (
                              <div
                                key={cIdx}
                                className="p-2 rounded-lg bg-white dark:bg-[#0E1610] border border-slate-200/70 dark:border-stone-800 text-[11px] flex flex-col sm:flex-row sm:items-center justify-between gap-1.5"
                              >
                                <span className="font-bold text-slate-700 dark:text-[#D1DDD3]">
                                  [{ch.fieldLabel || ch.field}]:
                                </span>
                                <div className="flex items-center gap-1.5 font-mono">
                                  <span className="text-rose-600 dark:text-rose-400 line-through px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-950/30">
                                    {ch.oldValue || '—'}
                                  </span>
                                  <span className="text-slate-400">←</span>
                                  <span className="text-emerald-600 dark:text-emerald-400 font-bold px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/30">
                                    {ch.newValue || '—'}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-slate-500 text-[11px]">
                            {entry.action === 'create'
                              ? 'تم إنشاء وقيد التفويض الموثق'
                              : 'تم تحديث بيانات التوكيل'}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-200 dark:border-[#243628] flex justify-end">
                <button
                  onClick={() => setAuditModalSig(null)}
                  className="min-h-[38px] px-5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-stone-800 text-slate-700 dark:text-slate-200 font-bold text-xs"
                >
                  إغلاق
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal 3: معاينة صورة التوكيل المؤرشف (Document Lightbox / Viewer with Live Blob URL) */}
      <DocumentPreviewModal
        isOpen={Boolean(docPreviewSig)}
        onClose={() => setDocPreviewSig(null)}
        title="صورة التوكيل الرسمي الموثق"
        subtitle={
          docPreviewSig
            ? `${docPreviewSig.poaNumber} • ${docPreviewSig.nameAr} (${docPreviewSig.companyNameAr})`
            : undefined
        }
        fileName={docPreviewSig?.poaAttachment?.name}
        fileData={docPreviewSig?.poaAttachment?.dataUrl}
        mimeType={docPreviewSig?.poaAttachment?.mimeType}
        sizeBytes={docPreviewSig?.poaAttachment?.sizeBytes}
        driveUrl={docPreviewSig?.driveDocUrl}
        onEditAndAttach={
          docPreviewSig
            ? () => {
                const target = docPreviewSig;
                setDocPreviewSig(null);
                handleOpenEdit(target);
              }
            : undefined
        }
      />

      {/* Modal 4: تأكيد إلغاء أو حذف التفويض (Delete / Revoke Confirmation) */}
      <AnimatePresence>
        {deleteConfirmSig && (
          <div className="fixed inset-0 !m-0 !top-0 !left-0 !right-0 !bottom-0 w-screen h-screen z-[999] flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-[#0E1610] rounded-2xl border border-slate-200 dark:border-[#243628] shadow-2xl p-5 text-start space-y-4"
            >
              <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
                <div className="w-10 h-10 rounded-xl bg-rose-500/15 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-[#F3EFE6]">
                    إلغاء التفويض أو حذف السجل
                  </h4>
                  <p className="text-xs text-slate-500">
                    {deleteConfirmSig.nameAr} • {deleteConfirmSig.companyNameAr}
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-[#8FA392] leading-relaxed">
                هل ترغب في <strong>إلغاء التفويض رسمياً (Revoke)</strong> مع بقاء كافة بيانات وسجلات التعديل التاريخية، أم <strong>الحذف النهائي للسجل</strong>؟
              </p>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#17231A] border border-slate-200/80 dark:border-[#243628] space-y-2">
                <button
                  onClick={() => {
                    onToggleRevoke(deleteConfirmSig.id);
                    setDeleteConfirmSig(null);
                  }}
                  className="w-full py-2.5 px-3 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-400 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Ban className="w-4 h-4" />
                  <span>
                    {deleteConfirmSig.status === 'revoked'
                      ? 'إعادة تفعيل التفويض الرسمي'
                      : 'إلغاء التفويض رسمياً (تعطيل السريان)'}
                  </span>
                </button>

                <button
                  onClick={() => {
                    onDeleteSignatory(deleteConfirmSig.id);
                    setDeleteConfirmSig(null);
                  }}
                  className="w-full py-2.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>حذف السجل نهائياً من النظام</span>
                </button>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={() => setDeleteConfirmSig(null)}
                  className="min-h-[38px] px-4 rounded-xl border border-slate-200 dark:border-stone-800 text-slate-600 dark:text-[#8FA392] text-xs font-semibold hover:bg-slate-100"
                >
                  إلغاء والتراجع
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
