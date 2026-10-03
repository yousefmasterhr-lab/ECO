import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PenTool,
  Plus,
  FileText,
  ExternalLink,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Landmark,
  Scale,
  FileCheck2,
  Ban
} from 'lucide-react';
import { AuthorizedSignatory, CompanyEntity } from './types';
import { formatCurrency } from '../../../utils/formatters';

interface CompanySignatoriesTabProps {
  signatories: AuthorizedSignatory[];
  companies: CompanyEntity[];
  onAddSignatory: (sig: AuthorizedSignatory) => void;
  onUpdateSignatory: (sig: AuthorizedSignatory) => void;
  onDeleteSignatory: (id: string) => void;
  onToggleRevoke: (id: string) => void;
}

export const CompanySignatoriesTab: React.FC<CompanySignatoriesTabProps> = ({
  signatories,
  companies,
  onAddSignatory,
  onUpdateSignatory,
  onDeleteSignatory,
  onToggleRevoke
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSig, setEditingSig] = useState<AuthorizedSignatory | null>(null);

  // Form State
  const [formNameAr, setFormNameAr] = useState('');
  const [formRoleAr, setFormRoleAr] = useState('');
  const [formCompanyId, setFormCompanyId] = useState('');
  const [formPoaNumber, setFormPoaNumber] = useState('');
  const [formNotaryOfficeAr, setFormNotaryOfficeAr] = useState('');
  const [formIssueDate, setFormIssueDate] = useState('');
  const [formExpiryDate, setFormExpiryDate] = useState('');
  const [formDriveDocUrl, setFormDriveDocUrl] = useState('');

  // Banking limits form
  const [singleLimit, setSingleLimit] = useState<number>(5000000);
  const [jointLimit, setJointLimit] = useState<number>(0);
  const [allowLG, setAllowLG] = useState(true);
  const [allowLC, setAllowLC] = useState(true);
  const [allowOpenAcc, setAllowOpenAcc] = useState(true);
  const [bankingNotes, setBankingNotes] = useState('');

  // Contractual limits form
  const [allowContracts, setAllowContracts] = useState(true);
  const [allowTenders, setAllowTenders] = useState(true);
  const [allowAssetTrade, setAllowAssetTrade] = useState(false);
  const [contractualNotes, setContractualNotes] = useState('');

  // Judicial limits form
  const [allowCourt, setAllowCourt] = useState(true);
  const [allowGov, setAllowGov] = useState(true);
  const [allowDispute, setAllowDispute] = useState(true);
  const [judicialNotes, setJudicialNotes] = useState('');

  const getDaysRemaining = (expiryDateStr: string): number => {
    if (!expiryDateStr) return 0;
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
    setFormRoleAr('نائب رئيس مجلس الإدارة');
    setFormCompanyId(companies[0]?.id || '');
    setFormPoaNumber('');
    setFormNotaryOfficeAr('مكتب توثيق استثمار القاهرة');
    setFormIssueDate(new Date().toISOString().slice(0, 10));
    const nextFiveYears = new Date();
    nextFiveYears.setFullYear(nextFiveYears.getFullYear() + 3);
    setFormExpiryDate(nextFiveYears.toISOString().slice(0, 10));
    setFormDriveDocUrl('');

    setSingleLimit(5000000);
    setJointLimit(20000000);
    setAllowLG(true);
    setAllowLC(true);
    setAllowOpenAcc(true);
    setBankingNotes('صلاحية توقيع معتمدة على الحسابات الجارية وإصدار الكفالات');

    setAllowContracts(true);
    setAllowTenders(true);
    setAllowAssetTrade(false);
    setContractualNotes('توقيع عقود المقاولات العامة والاتفاقيات الفنية');

    setAllowCourt(false);
    setAllowGov(true);
    setAllowDispute(false);
    setJudicialNotes('التمثيل أمام الهيئات والدوائر الحكومية والضرائب');

    setModalOpen(true);
  };

  const handleOpenEdit = (sig: AuthorizedSignatory) => {
    setEditingSig(sig);
    setFormNameAr(sig.nameAr);
    setFormRoleAr(sig.roleAr);
    setFormCompanyId(sig.companyId);
    setFormPoaNumber(sig.poaNumber);
    setFormNotaryOfficeAr(sig.notaryOfficeAr);
    setFormIssueDate(sig.issueDate);
    setFormExpiryDate(sig.expiryDate);
    setFormDriveDocUrl(sig.driveDocUrl);

    setSingleLimit(sig.bankingLimits.singleLimit);
    setJointLimit(sig.bankingLimits.jointLimit);
    setAllowLG(sig.bankingLimits.allowLettersOfGuarantee);
    setAllowLC(sig.bankingLimits.allowLettersOfCredit);
    setAllowOpenAcc(sig.bankingLimits.allowOpenAccounts);
    setBankingNotes(sig.bankingLimits.notesAr);

    setAllowContracts(sig.contractualLimits.allowContracts);
    setAllowTenders(sig.contractualLimits.allowTenders);
    setAllowAssetTrade(sig.contractualLimits.allowAssetTrade);
    setContractualNotes(sig.contractualLimits.notesAr);

    setAllowCourt(sig.judicialLimits.allowCourtRepresentation);
    setAllowGov(sig.judicialLimits.allowGovRepresentation);
    setAllowDispute(sig.judicialLimits.allowDisputeResolution);
    setJudicialNotes(sig.judicialLimits.notesAr);

    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNameAr.trim()) return;

    const parentComp = companies.find(c => c.id === formCompanyId);
    const companyNameAr = parentComp ? parentComp.nameAr : 'شركة أركان للإنشاءات الهندسية (ش.م.م)';

    if (editingSig) {
      const updated: AuthorizedSignatory = {
        ...editingSig,
        nameAr: formNameAr,
        roleAr: formRoleAr,
        companyId: formCompanyId,
        companyNameAr,
        poaNumber: formPoaNumber,
        notaryOfficeAr: formNotaryOfficeAr,
        issueDate: formIssueDate,
        expiryDate: formExpiryDate,
        driveDocUrl: formDriveDocUrl,
        bankingLimits: {
          singleLimit,
          jointLimit,
          allowLettersOfGuarantee: allowLG,
          allowLettersOfCredit: allowLC,
          allowOpenAccounts: allowOpenAcc,
          notesAr: bankingNotes
        },
        contractualLimits: {
          allowContracts,
          allowTenders,
          allowAssetTrade,
          notesAr: contractualNotes
        },
        judicialLimits: {
          allowCourtRepresentation: allowCourt,
          allowGovRepresentation: allowGov,
          allowDisputeResolution: allowDispute,
          notesAr: judicialNotes
        }
      };
      onUpdateSignatory(updated);
    } else {
      const newSig: AuthorizedSignatory = {
        id: `sig_${Date.now()}`,
        nameAr: formNameAr,
        roleAr: formRoleAr,
        companyId: formCompanyId,
        companyNameAr,
        poaNumber: formPoaNumber || `توكيل رسمي رقم ${Date.now().toString().slice(-4)}`,
        notaryOfficeAr: formNotaryOfficeAr || 'مكتب توثيق استثمار القاهرة',
        issueDate: formIssueDate,
        expiryDate: formExpiryDate,
        driveDocUrl: formDriveDocUrl || 'https://drive.google.com/',
        status: 'active',
        bankingLimits: {
          singleLimit,
          jointLimit,
          allowLettersOfGuarantee: allowLG,
          allowLettersOfCredit: allowLC,
          allowOpenAccounts: allowOpenAcc,
          notesAr: bankingNotes
        },
        contractualLimits: {
          allowContracts,
          allowTenders,
          allowAssetTrade,
          notesAr: contractualNotes
        },
        judicialLimits: {
          allowCourtRepresentation: allowCourt,
          allowGovRepresentation: allowGov,
          allowDisputeResolution: allowDispute,
          notesAr: judicialNotes
        }
      };
      onAddSignatory(newSig);
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-black text-[#1A241C] dark:text-[#F3EFE6]">
            سجل المفوضين ومصفوفة الصلاحيات الرسمية
          </h3>
          <p className="text-xs text-[#5C665E] dark:text-[#8FA392]">
            التوكيلات الرسمية الموثقة لدى الشهر العقاري وحدود الصلاحيات البنكية والتعاقدية والقضائية
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="min-h-[44px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#D97706] text-white text-xs font-bold hover:bg-[#B45309] transition-colors shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ إضافة مفوض جديد</span>
        </button>
      </div>

      {/* Profile Cards */}
      <div className="space-y-4">
        {signatories.map(sig => {
          const daysRemaining = getDaysRemaining(sig.expiryDate);
          const isExpired = daysRemaining <= 0;
          const isUrgent = daysRemaining > 0 && daysRemaining <= 45;
          const isRevoked = sig.status === 'revoked';

          return (
            <div
              key={sig.id}
              className={`p-5 rounded-2xl border transition-all bg-[#F3EFE6] dark:bg-[#17231A] shadow-xs ${
                isRevoked
                  ? 'opacity-60 border-dashed border-gray-400'
                  : isExpired
                  ? 'border-red-900/60 bg-red-950/10'
                  : isUrgent
                  ? 'border-amber-900/60 bg-amber-950/10'
                  : 'border-[#E0D9CB] dark:border-[#243628]'
              }`}
            >
              {/* Header: Name, Role, Parent Company & Status */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#D97706]/15 text-[#D97706] dark:text-[#EBB34D] flex items-center justify-center shrink-0">
                    <PenTool className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-base font-black text-[#1A241C] dark:text-[#F3EFE6]">
                        {sig.nameAr}
                      </h4>
                      {isRevoked ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-gray-500/20 text-gray-500 border border-gray-400">
                          تم إلغاء التفويض (ملغي)
                        </span>
                      ) : isExpired ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-black text-red-500 bg-red-950/20 border border-red-900/50 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>التوكيل منتهي الصلاحية</span>
                        </span>
                      ) : isUrgent ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold text-amber-500 bg-amber-950/20 border border-amber-900/50 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>تجديد التوكيل عاجل ({daysRemaining} يوم)</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>توكيل ساري ({daysRemaining} يوم)</span>
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-semibold text-[#D97706] dark:text-[#EBB34D] block mt-0.5">
                      {sig.roleAr} • {sig.companyNameAr}
                    </span>
                  </div>
                </div>

                {/* Expiry Warning Box if Expired */}
                {isExpired && !isRevoked && (
                  <div className="p-2.5 rounded-xl bg-red-950/20 border border-red-900/50 text-xs text-red-500 font-bold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>تنبيه أمني: التوكيل منتهي منذ {Math.abs(daysRemaining)} يوماً. يجب استصدار توكيل جديد فوري.</span>
                  </div>
                )}
              </div>

              {/* Power of Attorney Details */}
              <div className="mb-4 p-3.5 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB]/70 dark:border-[#243628] text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <span className="text-[11px] text-[#5C665E] dark:text-[#8FA392] block">رقم التوكيل الرسمي:</span>
                    <strong className="text-[#1A241C] dark:text-[#F3EFE6] font-bold font-mono">{sig.poaNumber}</strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#5C665E] dark:text-[#8FA392] block">مكتب الشهر العقاري:</span>
                    <strong className="text-[#1A241C] dark:text-[#F3EFE6] font-bold">{sig.notaryOfficeAr}</strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#5C665E] dark:text-[#8FA392] block">تاريخ الإصدار:</span>
                    <strong className="text-[#1A241C] dark:text-[#F3EFE6] font-bold font-mono">{sig.issueDate}</strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#5C665E] dark:text-[#8FA392] block">تاريخ الانتهاء:</span>
                    <strong className={`font-bold font-mono ${isExpired ? 'text-red-500' : 'text-[#1A241C] dark:text-[#F3EFE6]'}`}>
                      {sig.expiryDate}
                    </strong>
                  </div>
                </div>
              </div>

              {/* 3-Tier Authorization Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                {/* 1. Banking Limits */}
                <div className="p-3.5 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB]/70 dark:border-[#243628] space-y-2">
                  <div className="flex items-center gap-2 text-[#D97706] font-bold text-xs pb-1.5 border-b border-[#E0D9CB]/60 dark:border-[#243628]">
                    <Landmark className="w-4 h-4" />
                    <span>الصلاحيات المصرفية والبنكية</span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#5C665E] dark:text-[#8FA392]">التوقيع المنفرد:</span>
                      <strong className="text-[#1A241C] dark:text-[#F3EFE6] font-mono">
                        {sig.bankingLimits.singleLimit > 0
                          ? formatCurrency(sig.bankingLimits.singleLimit)
                          : 'غير مصرح'}
                      </strong>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-[#5C665E] dark:text-[#8FA392]">التوقيع المشترك:</span>
                      <strong className="text-[#1A241C] dark:text-[#F3EFE6] font-mono">
                        {sig.bankingLimits.jointLimit === 0
                          ? 'بدون حد أقصى'
                          : formatCurrency(sig.bankingLimits.jointLimit)}
                      </strong>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {sig.bankingLimits.allowLettersOfGuarantee && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 text-[10px] font-bold">
                          خطابات الضمان (LG)
                        </span>
                      )}
                      {sig.bankingLimits.allowLettersOfCredit && (
                        <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 text-[10px] font-bold">
                          الاعتمادات (LC)
                        </span>
                      )}
                      {sig.bankingLimits.allowOpenAccounts && (
                        <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 text-[10px] font-bold">
                          فتح الحسابات
                        </span>
                      )}
                    </div>

                    <p className="text-[10.5px] text-[#5C665E] dark:text-[#8FA392] pt-1">
                      {sig.bankingLimits.notesAr}
                    </p>
                  </div>
                </div>

                {/* 2. Contractual Limits */}
                <div className="p-3.5 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB]/70 dark:border-[#243628] space-y-2">
                  <div className="flex items-center gap-2 text-[#D97706] font-bold text-xs pb-1.5 border-b border-[#E0D9CB]/60 dark:border-[#243628]">
                    <FileCheck2 className="w-4 h-4" />
                    <span>الصلاحيات التعاقدية والتجارية</span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${sig.contractualLimits.allowContracts ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                      <span className="text-[#1A241C] dark:text-[#F3EFE6] font-medium">توقيع عقود المقاولات والتوريدات</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${sig.contractualLimits.allowTenders ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                      <span className="text-[#1A241C] dark:text-[#F3EFE6] font-medium">دخول المناقصات والمزايدات الحكومية</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${sig.contractualLimits.allowAssetTrade ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                      <span className="text-[#1A241C] dark:text-[#F3EFE6] font-medium">شراء وبيع الأصول العقارية والآليات</span>
                    </div>

                    <p className="text-[10.5px] text-[#5C665E] dark:text-[#8FA392] pt-2">
                      {sig.contractualLimits.notesAr}
                    </p>
                  </div>
                </div>

                {/* 3. Judicial Limits */}
                <div className="p-3.5 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB]/70 dark:border-[#243628] space-y-2">
                  <div className="flex items-center gap-2 text-[#D97706] font-bold text-xs pb-1.5 border-b border-[#E0D9CB]/60 dark:border-[#243628]">
                    <Scale className="w-4 h-4" />
                    <span>الصلاحيات القضائية والتمثيل</span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${sig.judicialLimits.allowCourtRepresentation ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                      <span className="text-[#1A241C] dark:text-[#F3EFE6] font-medium">التمثيل القضائي أمام كافة المحاكم</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${sig.judicialLimits.allowGovRepresentation ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                      <span className="text-[#1A241C] dark:text-[#F3EFE6] font-medium">التمثيل أمام الهيئات والدوائر الحكومية</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${sig.judicialLimits.allowDisputeResolution ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                      <span className="text-[#1A241C] dark:text-[#F3EFE6] font-medium">هيئات التحكيم وتسوية المنازعات</span>
                    </div>

                    <p className="text-[10.5px] text-[#5C665E] dark:text-[#8FA392] pt-2">
                      {sig.judicialLimits.notesAr}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-[#E0D9CB]/70 dark:border-[#243628] flex flex-wrap items-center justify-between gap-2">
                <a
                  href={sig.driveDocUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[44px] flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span>معاينة صورة التوكيل المؤرشف (Drive)</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(sig)}
                    className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#EAE4D7] dark:bg-[#1F2E23] hover:bg-[#D97706]/20 hover:text-[#D97706] text-[#5C665E] dark:text-[#8FA392] text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>تعديل الصلاحيات</span>
                  </button>

                  <button
                    onClick={() => onToggleRevoke(sig.id)}
                    className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                      isRevoked
                        ? 'bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25'
                        : 'bg-amber-500/15 text-amber-600 hover:bg-amber-500/25'
                    }`}
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>{isRevoked ? 'إعادة تفعيل التفويض' : 'إلغاء التفويض (Revoke)'}</span>
                  </button>

                  <button
                    onClick={() => onDeleteSignatory(sig.id)}
                    className="min-h-[44px] p-2.5 rounded-xl bg-[#EAE4D7] dark:bg-[#1F2E23] hover:bg-red-500/20 hover:text-red-500 text-[#5C665E] dark:text-[#8FA392] transition-colors"
                    title="حذف المفوض"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: إضافة / تعديل مفوض */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl max-h-[90vh] flex flex-col bg-[#FBF9F5] dark:bg-[#0E1610] rounded-2xl border border-[#E0D9CB] dark:border-[#243628] shadow-2xl overflow-hidden text-start"
            >
              <div className="flex items-center justify-between p-4 border-b border-[#E0D9CB] dark:border-[#243628] shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#D97706]/15 text-[#D97706] flex items-center justify-center">
                    <PenTool className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                      {editingSig ? 'تعديل بيانات المفوض ومصفوفة الصلاحيات' : 'تسجيل مفوض جديد واعتماد الصلاحيات'}
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto text-xs">
                {/* Basic Signatory Info */}
                <div className="space-y-3">
                  <h4 className="font-bold text-xs text-[#D97706] uppercase tracking-wider">البيانات الشخصية والوظيفية</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                        اسم المفوض (بالكامل) *
                      </label>
                      <input
                        type="text"
                        required
                        value={formNameAr}
                        onChange={e => setFormNameAr(e.target.value)}
                        placeholder="م. أحمد مصطفى إبراهيم"
                        className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none focus:border-[#D97706]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                        المنصب الوظيفي *
                      </label>
                      <input
                        type="text"
                        required
                        value={formRoleAr}
                        onChange={e => setFormRoleAr(e.target.value)}
                        placeholder="الرئيس التنفيذي / المدير المالي"
                        className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none focus:border-[#D97706]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                      الشركة التابع لها التفويض *
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
                </div>

                {/* Notary / POA Details */}
                <div className="pt-3 border-t border-[#E0D9CB] dark:border-[#243628] space-y-3">
                  <h4 className="font-bold text-xs text-[#D97706] uppercase tracking-wider">بيانات التوكيل الرسمي الموثق</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                        رقم التوكيل وسنة التوثيق *
                      </label>
                      <input
                        type="text"
                        required
                        value={formPoaNumber}
                        onChange={e => setFormPoaNumber(e.target.value)}
                        placeholder="توكيل عام رسمي رقم 1422 لسنة 2024"
                        className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none focus:border-[#D97706]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                        مكتب الشهر العقاري والتوثيق *
                      </label>
                      <input
                        type="text"
                        required
                        value={formNotaryOfficeAr}
                        onChange={e => setFormNotaryOfficeAr(e.target.value)}
                        placeholder="مكتب توثيق الأهرام النموذجي"
                        className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none focus:border-[#D97706]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                        تاريخ الإصدار *
                      </label>
                      <input
                        type="date"
                        required
                        value={formIssueDate}
                        onChange={e => setFormIssueDate(e.target.value)}
                        className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none focus:border-[#D97706]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                        تاريخ الانتهاء *
                      </label>
                      <input
                        type="date"
                        required
                        value={formExpiryDate}
                        onChange={e => setFormExpiryDate(e.target.value)}
                        className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none focus:border-[#D97706]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                      رابط صورة التوكيل المؤرشف (Drive)
                    </label>
                    <input
                      type="url"
                      value={formDriveDocUrl}
                      onChange={e => setFormDriveDocUrl(e.target.value)}
                      placeholder="https://drive.google.com/file/d/..."
                      className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6] font-mono text-[11px] focus:outline-none focus:border-[#D97706]"
                    />
                  </div>
                </div>

                {/* Authorization Matrix Form */}
                <div className="pt-3 border-t border-[#E0D9CB] dark:border-[#243628] space-y-3">
                  <h4 className="font-bold text-xs text-[#D97706] uppercase tracking-wider">مصفوفة الصلاحيات المعتمدة</h4>

                  {/* 1. Banking Limits Form */}
                  <div className="p-3 rounded-xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] space-y-2.5">
                    <span className="font-bold text-xs text-[#1A241C] dark:text-[#F3EFE6] flex items-center gap-1.5">
                      <Landmark className="w-3.5 h-3.5 text-[#D97706]" />
                      <span>الصلاحيات البنكية:</span>
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[#5C665E] dark:text-[#8FA392] mb-1">
                          سقف التوقيع المنفرد (ج.م):
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={singleLimit}
                          onChange={e => setSingleLimit(Number(e.target.value) || 0)}
                          className="w-full min-h-[44px] px-3 py-1.5 rounded-lg border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#0E1610] text-[#1A241C] dark:text-[#F3EFE6] font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[#5C665E] dark:text-[#8FA392] mb-1">
                          سقف التوقيع المشترك (0 = بدون حد):
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={jointLimit}
                          onChange={e => setJointLimit(Number(e.target.value) || 0)}
                          className="w-full min-h-[44px] px-3 py-1.5 rounded-lg border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#0E1610] text-[#1A241C] dark:text-[#F3EFE6] font-mono"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 pt-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={allowLG}
                          onChange={e => setAllowLG(e.target.checked)}
                          className="w-4 h-4 rounded text-[#D97706]"
                        />
                        <span>إصدار خطابات الضمان (LG)</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={allowLC}
                          onChange={e => setAllowLC(e.target.checked)}
                          className="w-4 h-4 rounded text-[#D97706]"
                        />
                        <span>فتح الاعتمادات المستندية (LC)</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={allowOpenAcc}
                          onChange={e => setAllowOpenAcc(e.target.checked)}
                          className="w-4 h-4 rounded text-[#D97706]"
                        />
                        <span>فتح وغلق الحسابات</span>
                      </label>
                    </div>

                    <input
                      type="text"
                      value={bankingNotes}
                      onChange={e => setBankingNotes(e.target.value)}
                      placeholder="شروط بنكية إضافية..."
                      className="w-full px-3 py-1.5 rounded-lg border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#0E1610] text-[#1A241C] dark:text-[#F3EFE6]"
                    />
                  </div>

                  {/* 2. Contractual Limits Form */}
                  <div className="p-3 rounded-xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] space-y-2">
                    <span className="font-bold text-xs text-[#1A241C] dark:text-[#F3EFE6] flex items-center gap-1.5">
                      <FileCheck2 className="w-3.5 h-3.5 text-[#D97706]" />
                      <span>الصلاحيات التعاقدية والتجارية:</span>
                    </span>

                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={allowContracts}
                          onChange={e => setAllowContracts(e.target.checked)}
                          className="w-4 h-4 rounded text-[#D97706]"
                        />
                        <span>توقيع عقود المقاولات والتوريدات</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={allowTenders}
                          onChange={e => setAllowTenders(e.target.checked)}
                          className="w-4 h-4 rounded text-[#D97706]"
                        />
                        <span>دخول المناقصات والمزايدات</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={allowAssetTrade}
                          onChange={e => setAllowAssetTrade(e.target.checked)}
                          className="w-4 h-4 rounded text-[#D97706]"
                        />
                        <span>بيع وشراء الأصول الثابتة</span>
                      </label>
                    </div>

                    <input
                      type="text"
                      value={contractualNotes}
                      onChange={e => setContractualNotes(e.target.value)}
                      placeholder="ملاحظات التعاقد..."
                      className="w-full px-3 py-1.5 rounded-lg border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#0E1610] text-[#1A241C] dark:text-[#F3EFE6]"
                    />
                  </div>

                  {/* 3. Judicial Limits Form */}
                  <div className="p-3 rounded-xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] space-y-2">
                    <span className="font-bold text-xs text-[#1A241C] dark:text-[#F3EFE6] flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-[#D97706]" />
                      <span>الصلاحيات القضائية والتمثيل:</span>
                    </span>

                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={allowCourt}
                          onChange={e => setAllowCourt(e.target.checked)}
                          className="w-4 h-4 rounded text-[#D97706]"
                        />
                        <span>المرافعة والتمثيل القضائي أمام المحاكم</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={allowGov}
                          onChange={e => setAllowGov(e.target.checked)}
                          className="w-4 h-4 rounded text-[#D97706]"
                        />
                        <span>التمثيل أمام الهيئات الحكومية والضرائب</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={allowDispute}
                          onChange={e => setAllowDispute(e.target.checked)}
                          className="w-4 h-4 rounded text-[#D97706]"
                        />
                        <span>تسوية المنازعات والتحكيم</span>
                      </label>
                    </div>

                    <input
                      type="text"
                      value={judicialNotes}
                      onChange={e => setJudicialNotes(e.target.value)}
                      placeholder="ملاحظات التمثيل القضائي..."
                      className="w-full px-3 py-1.5 rounded-lg border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#0E1610] text-[#1A241C] dark:text-[#F3EFE6]"
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
                    {editingSig ? 'حفظ الصلاحيات' : 'اعتماد وتفويض'}
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
