import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../../context/LanguageContext';
import {
  useContractors,
  LegalContractStatus,
  PaymentCertificateStatus,
  PaymentCertificateIPC,
} from '../../../context/ContractorContext';
import { formatCurrency, formatNumber } from '../../../utils/formatters';
import {
  HardHat,
  Search,
  Plus,
  FileCheck2,
  FileClock,
  FileX2,
  Phone,
  Mail,
  Receipt,
  FileText,
  Layers,
  AlertTriangle,
  ExternalLink,
  X,
  Clock,
  CheckCircle2,
  Calculator,
  Calendar,
  Coins,
  TrendingUp,
  BadgeCheck,
  Send,
  LayoutGrid,
  Table as TableIcon,
} from 'lucide-react';

interface EngineeringModuleProps {
  activeSubItemId: string | null;
}

export const EngineeringModule: React.FC<EngineeringModuleProps> = ({ activeSubItemId }) => {
  const { isRtl, t } = useLanguage();
  const {
    contractors,
    rfqs,
    purchaseOrders,
    milestones,
    ipcs,
    consultants,
    navigateToLegalContract,
    updateContractLegalStatus,
    addContractor,
    updateIPCStatus,
    addPaymentCertificate,
    updateMilestoneProgress,
  } = useContractors();

  // Contractor search & filter state
  const [contractorSearch, setContractorSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | LegalContractStatus>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // BOQ View Mode (Responsive Table vs Summary Cards)
  const [boqViewMode, setBoqViewMode] = useState<'table' | 'cards'>('table');

  // IPC Filter & Modal State
  const [ipcTypeFilter, setIpcTypeFilter] = useState<'all' | 'subcontractor' | 'owner'>('all');
  const [ipcStatusFilter, setIpcStatusFilter] = useState<'all' | PaymentCertificateStatus>('all');
  const [isAddIPCModalOpen, setIsAddIPCModalOpen] = useState(false);
  const [selectedIpcForReview, setSelectedIpcForReview] = useState<PaymentCertificateIPC | null>(null);
  const [consultantReviewNote, setConsultantReviewNote] = useState('');

  // New Contractor Form State
  const [newNameAr, setNewNameAr] = useState('');
  const [newNameEn, setNewNameEn] = useState('');
  const [newSpecialtyAr, setNewSpecialtyAr] = useState('');
  const [newCommercialReg, setNewCommercialReg] = useState('');
  const [newTaxNumber, setNewTaxNumber] = useState('');
  const [newContactPerson, setNewContactPerson] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newContractsValue, setNewContractsValue] = useState('15000000');
  const [newLegalStatus, setNewLegalStatus] = useState<LegalContractStatus>('valid');

  // New IPC Form State
  const [newIpcType, setNewIpcType] = useState<'subcontractor' | 'owner'>('subcontractor');
  const [newIpcContractorId, setNewIpcContractorId] = useState(contractors[0]?.id || '');
  const [newIpcPrevWork, setNewIpcPrevWork] = useState(5000000);
  const [newIpcCurrWork, setNewIpcCurrWork] = useState(1200000);
  const [newIpcRetentionPct, setNewIpcRetentionPct] = useState(10);
  const [newIpcAdvanceDeduction, setNewIpcAdvanceDeduction] = useState(100000);
  const [newIpcPenaltyDeduction, setNewIpcPenaltyDeduction] = useState(0);

  // Filter contractors
  const filteredContractors = contractors.filter(c => {
    const matchesSearch =
      c.nameAr.toLowerCase().includes(contractorSearch.toLowerCase()) ||
      c.nameEn.toLowerCase().includes(contractorSearch.toLowerCase()) ||
      c.specialtyAr.toLowerCase().includes(contractorSearch.toLowerCase()) ||
      c.code.toLowerCase().includes(contractorSearch.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.legalStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filter IPCs
  const filteredIpcs = ipcs.filter(ipc => {
    const matchesType = ipcTypeFilter === 'all' || ipc.type === ipcTypeFilter;
    const matchesStatus = ipcStatusFilter === 'all' || ipc.status === ipcStatusFilter;
    return matchesType && matchesStatus;
  });

  const handleAddContractorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNameAr.trim()) return;

    addContractor({
      nameAr: newNameAr,
      nameEn: newNameEn || newNameAr,
      specialtyAr: newSpecialtyAr || 'أعمال مقاولات عامة وتوريدات',
      specialtyEn: 'General Contracting & Procurement',
      categoryAr: 'فئة معتمدة',
      commercialReg: newCommercialReg || '1010' + Math.floor(100000 + Math.random() * 900000),
      taxNumber: newTaxNumber || '300' + Math.floor(100000000000 + Math.random() * 900000000000) + '3',
      contactPerson: newContactPerson || 'الممثل القانوني',
      phone: newPhone || '+966 50 000 0000',
      email: newEmail || 'info@contractor.com',
      activeProjectsCount: 1,
      totalContractsValue: Number(newContractsValue) || 10000000,
      legalStatus: newLegalStatus,
    });

    setIsAddModalOpen(false);
    setNewNameAr('');
    setNewNameEn('');
    setNewSpecialtyAr('');
    setNewCommercialReg('');
    setNewTaxNumber('');
  };

  const handleAddIPCSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selContractor = contractors.find(c => c.id === newIpcContractorId) || contractors[0];
    const selConsultant = consultants[0];
    const totalExec = newIpcPrevWork + newIpcCurrWork;
    const retentionAmt = (newIpcCurrWork * newIpcRetentionPct) / 100;
    const netPayable = Math.max(0, newIpcCurrWork - retentionAmt - newIpcAdvanceDeduction - newIpcPenaltyDeduction);

    addPaymentCertificate({
      type: newIpcType,
      typeLabelAr: newIpcType === 'subcontractor' ? 'مستخلص مقاول باطن' : 'مستخلص المالك / الرئيسي',
      projectId: 'prj_01',
      projectNameAr: 'مشروع برج النخبة الإداري والمالي',
      contractorId: selContractor.id,
      contractorNameAr: selContractor.nameAr,
      consultant: selConsultant,
      periodStart: '2026-09-01',
      periodEnd: '2026-09-30',
      previousWorkValue: newIpcPrevWork,
      currentWorkValue: newIpcCurrWork,
      totalExecutedValue: totalExec,
      retentionPercentage: newIpcRetentionPct,
      retentionAmount: retentionAmt,
      advanceDeductionAmount: newIpcAdvanceDeduction,
      penaltyDeductionAmount: newIpcPenaltyDeduction,
      netPayableAmount: netPayable,
      currency: 'SAR',
      status: 'under_consultant_review',
      statusLabelAr: 'قيد مراجعة الاستشاري',
      inspectionReportAttached: true,
      consultantNotesAr: 'تم إدراج المستخلص وإرساله لجهاز الإشراف والاستشاري للفحص الفني.',
    });

    setIsAddIPCModalOpen(false);
  };

  // Helper for rendering legal status badge
  const renderLegalBadge = (status: LegalContractStatus) => {
    switch (status) {
      case 'valid':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
            <FileCheck2 className="w-3.5 h-3.5 shrink-0" />
            <span>{isRtl ? 'عقد ساري' : 'Active Contract'}</span>
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
            <FileClock className="w-3.5 h-3.5 shrink-0" />
            <span>{isRtl ? 'مسودة عقد' : 'Draft Contract'}</span>
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30">
            <FileX2 className="w-3.5 h-3.5 shrink-0" />
            <span>{isRtl ? 'مستندات قانونية منتهية' : 'Expired Docs'}</span>
          </span>
        );
    }
  };

  // Helper for rendering IPC Consultant Approval Status Badge
  const renderIPCStatusBadge = (status: PaymentCertificateStatus) => {
    switch (status) {
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-gray-500/15 text-gray-700 dark:text-gray-300 border border-gray-500/30">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span>{isRtl ? 'مسودة' : 'Draft'}</span>
          </span>
        );
      case 'under_consultant_review':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
            <FileClock className="w-3.5 h-3.5 shrink-0" />
            <span>{isRtl ? 'قيد مراجعة الاستشاري' : 'Under Consultant Review'}</span>
          </span>
        );
      case 'approved_with_notes':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-teal-500/15 text-teal-700 dark:text-teal-400 border border-teal-500/30">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>{isRtl ? 'معتمد بملاحظات' : 'Approved w/ Notes'}</span>
          </span>
        );
      case 'consultant_approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
            <BadgeCheck className="w-3.5 h-3.5 shrink-0" />
            <span>{isRtl ? 'معتمد نهائي من الاستشاري' : 'Consultant Approved'}</span>
          </span>
        );
      case 'pushed_to_finance':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30">
            <Coins className="w-3.5 h-3.5 shrink-0" />
            <span>{isRtl ? 'مرحل للمالية للصرف' : 'Pushed to Finance'}</span>
          </span>
        );
    }
  };

  // Helper for rendering Milestone progress status badge
  const renderMilestoneStatusBadge = (status: 'ahead' | 'on_track' | 'delayed') => {
    switch (status) {
      case 'ahead':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <TrendingUp className="w-3 h-3" />
            <span>{isRtl ? 'متقدم عن الجدول' : 'Ahead'}</span>
          </span>
        );
      case 'on_track':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <CheckCircle2 className="w-3 h-3" />
            <span>{isRtl ? 'منتظم' : 'On Track'}</span>
          </span>
        );
      case 'delayed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <AlertTriangle className="w-3 h-3" />
            <span>{isRtl ? 'متأخر' : 'Delayed'}</span>
          </span>
        );
    }
  };

  // --- Sub-View: سجل المشاريع (Project Registry) ---
  const renderProjectsView = () => {
    const projects = [
      {
        id: 'prj_01',
        code: 'PRJ-2026-A1',
        nameAr: 'برج النخبة الإداري والمالي',
        locationAr: 'الرياض - حي الملقا',
        contractorsCount: 4,
        completion: 72,
        budget: 185000000,
        statusAr: 'جاري التنفيذ',
      },
      {
        id: 'prj_02',
        code: 'PRJ-2026-B3',
        nameAr: 'مجمع الواحة السكني المتكامل',
        locationAr: 'جدة - أبحر الشمالية',
        contractorsCount: 3,
        completion: 45,
        budget: 120000000,
        statusAr: 'جاري التنفيذ',
      },
      {
        id: 'prj_03',
        code: 'PRJ-2025-C8',
        nameAr: 'المقر الرئيسي للشركة والمستودعات المركزية',
        locationAr: 'الدمام - المدينة الصناعية الثانية',
        contractorsCount: 2,
        completion: 91,
        budget: 64000000,
        statusAr: 'مرحلة التسليم المبدئي',
      },
    ];

    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F3EFE6] dark:bg-[#17231A] p-4 rounded-2xl border border-[#E0D9CB] dark:border-[#243628]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#3B7A57]/20 text-[#3B7A57] dark:text-[#4ADE80] flex items-center justify-center font-bold">
              <HardHat className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                {t('سجل المشاريع الإنشائية المباشرة', 'Active Construction Projects Registry')}
              </h3>
              <p className="text-xs text-[#5C665E] dark:text-[#8FA392]">
                {t('متابعة نسب الإنجاز والمقاولين الميدانيين والميزانيات المرصودة', 'Track completion, site contractors, and budgets')}
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-[#EAE4D7] dark:bg-[#1F2E23] text-[#5C665E] dark:text-[#8FA392]">
            {projects.length} {isRtl ? 'مشاريع نشطة' : 'Active Projects'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {projects.map(prj => (
            <div
              key={prj.id}
              className="p-4 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] hover:border-[#D99B26]/40 transition-all space-y-3.5 shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#EAE4D7] dark:bg-[#1F2E23] text-[#5C665E] dark:text-[#8FA392]">
                  {prj.code}
                </span>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#3B7A57]/15 text-[#3B7A57] dark:text-[#4ADE80]">
                  {prj.statusAr}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-[#1A241C] dark:text-[#F3EFE6]">{prj.nameAr}</h4>
                <p className="text-xs text-[#5C665E] dark:text-[#8FA392] mt-0.5">{prj.locationAr}</p>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[#5C665E] dark:text-[#8FA392]">{t('نسبة الإنجاز', 'Progress')}</span>
                  <span className="text-[#D99B26] dark:text-[#EBB34D]">{prj.completion}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#EAE4D7] dark:bg-[#1F2E23] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${prj.completion}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-[#D99B26] to-[#EBB34D] rounded-full"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-[#E0D9CB]/60 dark:border-[#243628] flex items-center justify-between text-xs text-[#5C665E] dark:text-[#8FA392]">
                <span>{prj.contractorsCount} {isRtl ? 'مقاولين بالموقع' : 'Contractors'}</span>
                <span className="font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                  {(prj.budget / 1000000).toFixed(0)} {isRtl ? 'مليون ر.س' : 'M SAR'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // --- Sub-View: الجدول الزمني (Schedule & Milestones) [NEW] ---
  const renderScheduleView = () => {
    return (
      <div className="space-y-5">
        {/* Top Header Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F3EFE6] dark:bg-[#17231A] p-4 rounded-2xl border border-[#E0D9CB] dark:border-[#243628]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D99B26]/20 text-[#D99B26] dark:text-[#EBB34D] flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                {t('الجدول الزمني ومحطات الصرف المعتمدة', 'Project Schedule & Gated Milestones')}
              </h3>
              <p className="text-xs text-[#5C665E] dark:text-[#8FA392]">
                {t('مقارنة الإنجاز المخطط مقابل الفعلي وربطه بالإفراج المالي للمستخلصات', 'Track planned vs actual progress and milestone-gated payment releases')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-[#EAE4D7] dark:bg-[#1F2E23] text-[#5C665E] dark:text-[#8FA392]">
              {milestones.length} {isRtl ? 'محطات رئيسية' : 'Milestones'}
            </span>
          </div>
        </div>

        {/* Milestones Gated Progression Cards */}
        <div className="space-y-3.5">
          {milestones.map(ms => {
            return (
              <motion.div
                key={ms.id}
                whileHover={{ y: -1 }}
                className="p-5 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] space-y-4 shadow-2xs"
              >
                {/* Title Row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#EAE4D7] dark:bg-[#1F2E23] text-[#5C665E] dark:text-[#8FA392]">
                        {ms.code}
                      </span>
                      <span className="text-xs text-[#5C665E] dark:text-[#8FA392]">
                        {ms.projectNameAr}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                      {ms.titleAr}
                    </h4>
                    <p className="text-xs text-[#5C665E] dark:text-[#8FA392]">
                      {t('المقاول المنفذ:', 'Contractor:')} <strong className="text-[#1A241C] dark:text-[#F3EFE6]">{ms.contractorNameAr}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {renderMilestoneStatusBadge(ms.status)}
                    <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-lg bg-[#EAE4D7] dark:bg-[#1F2E23] text-[#1A241C] dark:text-[#F3EFE6]">
                      {t('الوزن:', 'Weight:')} {ms.weightPercentage}%
                    </span>
                  </div>
                </div>

                {/* Progress Comparison Bars */}
                <div className="space-y-2 bg-[#EAE4D7]/50 dark:bg-[#1F2E23]/50 p-3.5 rounded-xl border border-[#E0D9CB]/60 dark:border-[#243628]">
                  {/* Planned vs Actual Metrics */}
                  <div className="grid grid-cols-2 gap-4 text-xs font-bold">
                    <div className="flex items-center justify-between">
                      <span className="text-[#5C665E] dark:text-[#8FA392]">{t('الإنجاز المخطط (Baseline):', 'Planned:')}</span>
                      <span className="font-mono text-[#5C665E] dark:text-[#8FA392]">{ms.plannedProgress}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#1A241C] dark:text-[#F3EFE6]">{t('الإنجاز الفعلي المنفذ (Actual):', 'Actual:')}</span>
                      <span className="font-mono text-[#D99B26] dark:text-[#EBB34D] text-sm">{ms.actualProgress}%</span>
                    </div>
                  </div>

                  {/* Visual Dual Bars */}
                  <div className="space-y-1.5 pt-1">
                    {/* Planned Track */}
                    <div className="w-full h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-blue-500/60 rounded-full"
                        style={{ width: `${ms.plannedProgress}%` }}
                      />
                    </div>
                    {/* Actual Track */}
                    <div className="w-full h-2.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${ms.actualProgress}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-[#D99B26] to-[#EBB34D] rounded-full"
                      />
                    </div>
                  </div>

                  {/* Interactive Quick Updater */}
                  <div className="flex items-center justify-between pt-2 text-xs">
                    <span className="text-[11px] text-[#5C665E] dark:text-[#8FA392]">
                      {t('تحديث نسبة الإنجاز الفعلي الميداني:', 'Update Actual Progress:')}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateMilestoneProgress(ms.id, Math.max(0, ms.actualProgress - 5))}
                        className="px-2 py-0.5 rounded-lg bg-[#FBF9F5] dark:bg-[#0E1610] text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] font-bold border border-[#E0D9CB] dark:border-[#243628]"
                      >
                        -5%
                      </button>
                      <button
                        onClick={() => updateMilestoneProgress(ms.id, Math.min(100, ms.actualProgress + 5))}
                        className="px-2 py-0.5 rounded-lg bg-[#FBF9F5] dark:bg-[#0E1610] text-[#D99B26] dark:text-[#EBB34D] hover:text-[#1A241C] font-bold border border-[#D99B26]/30"
                      >
                        +5%
                      </button>
                    </div>
                  </div>
                </div>

                {/* Milestone Payment Gating Condition */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs">
                  <div className="flex items-center gap-2 text-[#5C665E] dark:text-[#8FA392]">
                    <BadgeCheck className="w-4 h-4 text-[#D99B26] shrink-0" />
                    <span>
                      <strong className="text-[#1A241C] dark:text-[#F3EFE6]">{t('شرط الإفراج المالي للمستخلص:', 'Financial Release Gating:')}</strong>{' '}
                      {ms.milestoneReleaseConditionAr}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    {ms.isPaymentReleased ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isRtl ? 'متاح ومفرج عنه بالصرف' : 'Payment Released'}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{isRtl ? 'معلق لحين اعتماد الاستشاري' : 'Gated / Pending Approval'}</span>
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  };

  // --- Sub-View: المستخلصات (Payment Certificates / IPCs) [NEW] ---
  const renderIPCsView = () => {
    const totalApprovedVal = ipcs
      .filter(i => i.status === 'consultant_approved' || i.status === 'pushed_to_finance')
      .reduce((acc, curr) => acc + curr.netPayableAmount, 0);
    const totalRetentionVal = ipcs.reduce((acc, curr) => acc + curr.retentionAmount, 0);

    return (
      <div className="space-y-5">
        {/* KPI Financial Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A]">
            <span className="text-[11px] font-bold text-[#5C665E] dark:text-[#8FA392] block">{t('إجمالي المستخلصات', 'Total Certificates')}</span>
            <span className="text-xl font-black text-[#1A241C] dark:text-[#F3EFE6] mt-1 block font-mono">
              {ipcs.length} <span className="text-xs font-normal">{isRtl ? 'مستخلص' : 'IPCs'}</span>
            </span>
          </div>
          <div className="p-4 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A]">
            <span className="text-[11px] font-bold text-[#5C665E] dark:text-[#8FA392] block">{t('صافي الصرف المعتمد', 'Approved Net Payable')}</span>
            <span className="text-xl font-black text-[#D99B26] dark:text-[#EBB34D] mt-1 block font-mono">
              {(totalApprovedVal / 1000000).toFixed(2)} <span className="text-xs font-normal">{isRtl ? 'مليون ر.س' : 'M SAR'}</span>
            </span>
          </div>
          <div className="p-4 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A]">
            <span className="text-[11px] font-bold text-[#5C665E] dark:text-[#8FA392] block">{t('تأمين الأعمال المحتجز (Retention)', 'Total Retention')}</span>
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block font-mono">
              {(totalRetentionVal / 1000).toFixed(0)} <span className="text-xs font-normal">{isRtl ? 'ألف ر.س' : 'K SAR'}</span>
            </span>
          </div>
          <div className="p-4 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A]">
            <span className="text-[11px] font-bold text-[#5C665E] dark:text-[#8FA392] block">{t('قيد مراجعة الاستشاري', 'Under Review')}</span>
            <span className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1 block font-mono">
              {ipcs.filter(i => i.status === 'under_consultant_review').length} <span className="text-xs font-normal">{isRtl ? 'مستخلص' : 'pending'}</span>
            </span>
          </div>
        </div>

        {/* Filter Controls & Add Certificate Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setIpcTypeFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                ipcTypeFilter === 'all'
                  ? 'bg-[#1A241C] dark:bg-[#F3EFE6] text-white dark:text-[#1A241C]'
                  : 'bg-[#F3EFE6] dark:bg-[#17231A] text-[#5C665E] dark:text-[#8FA392] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23]'
              }`}
            >
              {isRtl ? 'كافة المستخلصات' : 'All IPCs'}
            </button>
            <button
              onClick={() => setIpcTypeFilter('subcontractor')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                ipcTypeFilter === 'subcontractor'
                  ? 'bg-[#D99B26] text-[#1C291E]'
                  : 'bg-[#F3EFE6] dark:bg-[#17231A] text-[#5C665E] dark:text-[#8FA392] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23]'
              }`}
            >
              {isRtl ? 'مقاولي الباطن' : 'Subcontractors'}
            </button>
            <button
              onClick={() => setIpcTypeFilter('owner')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                ipcTypeFilter === 'owner'
                  ? 'bg-[#D99B26] text-[#1C291E]'
                  : 'bg-[#F3EFE6] dark:bg-[#17231A] text-[#5C665E] dark:text-[#8FA392] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23]'
              }`}
            >
              {isRtl ? 'مستخلص المالك' : 'Owner IPC'}
            </button>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-[11px]">
            <button
              onClick={() => setIpcStatusFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                ipcStatusFilter === 'all'
                  ? 'bg-[#1A241C] dark:bg-[#F3EFE6] text-white dark:text-[#1A241C]'
                  : 'bg-[#F3EFE6] dark:bg-[#17231A] text-[#5C665E] dark:text-[#8FA392] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23]'
              }`}
            >
              {isRtl ? 'كافة الحالات' : 'All Statuses'}
            </button>
            <button
              onClick={() => setIpcStatusFilter('under_consultant_review')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                ipcStatusFilter === 'under_consultant_review'
                  ? 'bg-amber-600 text-white'
                  : 'bg-[#F3EFE6] dark:bg-[#17231A] text-[#5C665E] dark:text-[#8FA392] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23]'
              }`}
            >
              {isRtl ? 'قيد مراجعة الاستشاري' : 'Under Review'}
            </button>
            <button
              onClick={() => setIpcStatusFilter('consultant_approved')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                ipcStatusFilter === 'consultant_approved'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#F3EFE6] dark:bg-[#17231A] text-[#5C665E] dark:text-[#8FA392] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23]'
              }`}
            >
              {isRtl ? 'معتمد نهائي' : 'Approved'}
            </button>
            <button
              onClick={() => setIpcStatusFilter('pushed_to_finance')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                ipcStatusFilter === 'pushed_to_finance'
                  ? 'bg-purple-600 text-white'
                  : 'bg-[#F3EFE6] dark:bg-[#17231A] text-[#5C665E] dark:text-[#8FA392] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23]'
              }`}
            >
              {isRtl ? 'مرحل للمالية' : 'Finance'}
            </button>
          </div>

          <button
            onClick={() => setIsAddIPCModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#D99B26] hover:bg-[#C28519] dark:bg-[#EBB34D] dark:hover:bg-[#D99B26] text-[#1C291E] dark:text-[#0E1610] shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{isRtl ? 'إعداد مستخلص جديد' : 'New Certificate'}</span>
          </button>
        </div>

        {/* Payment Certificate Cards List */}
        <div className="space-y-4">
          {filteredIpcs.map(ipc => (
            <motion.div
              key={ipc.id}
              whileHover={{ y: -1 }}
              className="p-5 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] space-y-4 shadow-2xs"
            >
              {/* Top Meta Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#EAE4D7] dark:bg-[#1F2E23] text-[#5C665E] dark:text-[#8FA392]">
                      {ipc.ipcNumber}
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#3B7A57]/15 text-[#3B7A57] dark:text-[#4ADE80]">
                      {ipc.typeLabelAr}
                    </span>
                    <span className="text-xs text-[#5C665E] dark:text-[#8FA392]">
                      {ipc.projectNameAr}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                    {ipc.contractorNameAr}
                  </h4>
                  <p className="text-xs text-[#5C665E] dark:text-[#8FA392]">
                    {t('الفترة المحاسبية:', 'Period:')} <span className="font-mono">{ipc.periodStart} → {ipc.periodEnd}</span>
                  </p>
                </div>

                <div className="shrink-0 self-start sm:self-auto">
                  {renderIPCStatusBadge(ipc.status)}
                </div>
              </div>

              {/* Supervising Consultant Signature Stamp Box */}
              <div className="p-3.5 rounded-xl bg-[#EAE4D7]/50 dark:bg-[#1F2E23]/50 border border-[#E0D9CB]/60 dark:border-[#243628] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#D99B26]/15 text-[#D99B26] dark:text-[#EBB34D] flex items-center justify-center font-bold shrink-0">
                    <BadgeCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-[#5C665E] dark:text-[#8FA392] block">{t('اعتماد الاستشاري المشرف', 'Supervising Consultant')}</span>
                    <strong className="text-[#1A241C] dark:text-[#F3EFE6]">{ipc.consultant.firmNameAr}</strong>
                    <span className="text-[11px] text-[#5C665E] dark:text-[#8FA392] block mt-0.5">
                      {ipc.consultant.leadEngineerAr} • {ipc.consultant.licenseNo}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto text-[11px]">
                  {ipc.inspectionReportAttached && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <FileCheck2 className="w-3 h-3" />
                      {isRtl ? 'محضر الفحص مرفق' : 'Report Attached'}
                    </span>
                  )}
                  {ipc.approvalDate && (
                    <span className="font-mono text-[#5C665E] dark:text-[#8FA392]">
                      {isRtl ? 'اعتمد في:' : 'Approved:'} {ipc.approvalDate}
                    </span>
                  )}
                </div>
              </div>

              {/* Automated Financial Calculation Breakdown Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs bg-[#FBF9F5] dark:bg-[#0E1610] p-3 rounded-xl border border-[#E0D9CB]/60 dark:border-[#243628]">
                <div>
                  <span className="text-[10.5px] text-[#5C665E] dark:text-[#8FA392] block">{t('أعمال الفترة الحالية', 'Current Work')}</span>
                  <span className="font-mono font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                    {formatCurrency(ipc.currentWorkValue, true, ipc.currency)}
                  </span>
                </div>
                <div>
                  <span className="text-[10.5px] text-[#5C665E] dark:text-[#8FA392] block">{t('إجمالي المنفذ التراكمي', 'Total Cumulative')}</span>
                  <span className="font-mono font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                    {formatCurrency(ipc.totalExecutedValue, true, ipc.currency)}
                  </span>
                </div>
                <div>
                  <span className="text-[10.5px] text-[#5C665E] dark:text-[#8FA392] block">{t('تأمين أعمال (10%)', 'Retention')}</span>
                  <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                    -{formatCurrency(ipc.retentionAmount, true, ipc.currency)}
                  </span>
                </div>
                <div>
                  <span className="text-[10.5px] text-[#5C665E] dark:text-[#8FA392] block">{t('استرداد دفعة مقدمة', 'Advance Recovery')}</span>
                  <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                    -{formatCurrency(ipc.advanceDeductionAmount, true, ipc.currency)}
                  </span>
                </div>
                <div className="col-span-2 sm:col-span-1 bg-[#D99B26]/10 dark:bg-[#EBB34D]/10 p-2 rounded-lg border border-[#D99B26]/20">
                  <span className="text-[10.5px] text-[#D99B26] dark:text-[#EBB34D] font-bold block">{t('صافي الصرف', 'Net Payable')}</span>
                  <span className="font-mono font-black text-sm text-[#D99B26] dark:text-[#EBB34D]">
                    {formatCurrency(ipc.netPayableAmount, true, ipc.currency)}
                  </span>
                </div>
              </div>

              {/* Consultant Notes snippet */}
              {ipc.consultantNotesAr && (
                <p className="text-[11px] text-[#5C665E] dark:text-[#8FA392] bg-[#EAE4D7]/30 dark:bg-[#1F2E23]/30 p-2 rounded-lg">
                  <strong className="text-[#1A241C] dark:text-[#F3EFE6]">{t('ملاحظات الاستشاري:', 'Consultant Notes:')}</strong> {ipc.consultantNotesAr}
                </p>
              )}

              {/* Action Footer: Sequential Review State Machine */}
              <div className="pt-2 border-t border-[#E0D9CB]/60 dark:border-[#243628] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-[#5C665E] dark:text-[#8FA392]">
                    {t('دورة الاعتماد:', 'Sign-off Flow:')}
                  </span>
                  <select
                    value={ipc.status}
                    onChange={(e) => updateIPCStatus(ipc.id, e.target.value as PaymentCertificateStatus)}
                    className="text-xs py-1 px-2.5 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-hidden font-bold"
                  >
                    <option value="draft">{isRtl ? 'مسودة (Draft)' : 'Draft'}</option>
                    <option value="under_consultant_review">{isRtl ? 'قيد مراجعة الاستشاري' : 'Under Review'}</option>
                    <option value="approved_with_notes">{isRtl ? 'معتمد بملاحظات' : 'Approved w/ Notes'}</option>
                    <option value="consultant_approved">{isRtl ? 'معتمد نهائي من الاستشاري' : 'Consultant Approved'}</option>
                    <option value="pushed_to_finance">{isRtl ? 'مرحل للمالية للصرف' : 'Pushed to Finance'}</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {ipc.status === 'under_consultant_review' && (
                    <button
                      onClick={() => {
                        setSelectedIpcForReview(ipc);
                        setConsultantReviewNote(ipc.consultantNotesAr || '');
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#D99B26] hover:bg-[#C28519] dark:bg-[#EBB34D] text-[#1C291E] dark:text-[#0E1610] shadow-xs"
                    >
                      <BadgeCheck className="w-3.5 h-3.5" />
                      <span>{isRtl ? 'اعتماد الاستشاري' : 'Consultant Sign-off'}</span>
                    </button>
                  )}

                  {ipc.status === 'consultant_approved' && (
                    <button
                      onClick={() => updateIPCStatus(ipc.id, 'pushed_to_finance')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isRtl ? 'ترحيل للمالية للصرف' : 'Push to Finance'}</span>
                    </button>
                  )}

                  {ipc.status === 'pushed_to_finance' && (
                    <span className="px-3 py-1 rounded-xl text-xs font-bold bg-purple-500/15 text-purple-700 dark:text-purple-300">
                      {isRtl ? 'جاهز بأمر الصرف المالي' : 'Ready for Payment'}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  // --- Sub-View: المقاولون (Contractors) ---
  const renderContractorsView = () => {
    return (
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1 max-w-xl">
            <div className="relative flex-1">
              <Search className={`w-4 h-4 absolute top-1/2 -translate-y-1/2 text-[#5C665E] dark:text-[#8FA392] ${isRtl ? 'right-3' : 'left-3'}`} />
              <input
                type="text"
                value={contractorSearch}
                onChange={e => setContractorSearch(e.target.value)}
                placeholder={t('بحث باسم المقاول، التخصص، أو الكود...', 'Search contractor, specialty, or code...')}
                className={`w-full py-2 text-xs rounded-xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] placeholder-[#5C665E]/60 dark:placeholder-[#8FA392]/60 focus:outline-hidden focus:border-[#D99B26] ${isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'}`}
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto shrink-0">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-[#1A241C] dark:bg-[#F3EFE6] text-white dark:text-[#1A241C]'
                    : 'bg-[#F3EFE6] dark:bg-[#17231A] text-[#5C665E] dark:text-[#8FA392] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23]'
                }`}
              >
                {isRtl ? 'الكل' : 'All'}
              </button>
              <button
                onClick={() => setStatusFilter('valid')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  statusFilter === 'valid'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#F3EFE6] dark:bg-[#17231A] text-[#5C665E] dark:text-[#8FA392] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23]'
                }`}
              >
                {isRtl ? 'ساري' : 'Active'}
              </button>
              <button
                onClick={() => setStatusFilter('draft')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  statusFilter === 'draft'
                    ? 'bg-amber-600 text-white'
                    : 'bg-[#F3EFE6] dark:bg-[#17231A] text-[#5C665E] dark:text-[#8FA392] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23]'
                }`}
              >
                {isRtl ? 'مسودة' : 'Draft'}
              </button>
              <button
                onClick={() => setStatusFilter('expired')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  statusFilter === 'expired'
                    ? 'bg-rose-600 text-white'
                    : 'bg-[#F3EFE6] dark:bg-[#17231A] text-[#5C665E] dark:text-[#8FA392] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23]'
                }`}
              >
                {isRtl ? 'منتهي' : 'Expired'}
              </button>
            </div>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#D99B26] hover:bg-[#C28519] dark:bg-[#EBB34D] dark:hover:bg-[#D99B26] text-[#1C291E] dark:text-[#0E1610] shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{isRtl ? 'إضافة مقاول جديد' : 'Add Contractor'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredContractors.map(contractor => (
            <motion.div
              key={contractor.id}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.15 }}
              className="p-5 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] hover:border-[#D99B26]/50 transition-all flex flex-col justify-between shadow-2xs gap-4"
            >
              <div>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#EAE4D7] dark:bg-[#1F2E23] text-[#5C665E] dark:text-[#8FA392]">
                        {contractor.code}
                      </span>
                      <span className="text-[11px] font-semibold text-[#5C665E] dark:text-[#8FA392]">
                        {contractor.categoryAr}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                      {isRtl ? contractor.nameAr : contractor.nameEn}
                    </h3>
                  </div>

                  <div className="self-start sm:self-auto shrink-0">
                    {renderLegalBadge(contractor.legalStatus)}
                  </div>
                </div>

                <p className="text-xs text-[#5C665E] dark:text-[#8FA392] mt-2.5 line-clamp-2">
                  <span className="font-bold text-[#1A241C] dark:text-[#F3EFE6]">{t('التخصص:', 'Specialty:')}</span>{' '}
                  {isRtl ? contractor.specialtyAr : contractor.specialtyEn}
                </p>

                <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] bg-[#EAE4D7]/60 dark:bg-[#1F2E23]/60 p-2.5 rounded-xl border border-[#E0D9CB]/60 dark:border-[#243628]">
                  <div>
                    <span className="text-[#5C665E] dark:text-[#8FA392] block">{t('السجل التجاري', 'CR Number')}</span>
                    <span className="font-mono font-bold text-[#1A241C] dark:text-[#F3EFE6]">{contractor.commercialReg}</span>
                  </div>
                  <div>
                    <span className="text-[#5C665E] dark:text-[#8FA392] block">{t('الرقم الضريبي', 'Tax ID')}</span>
                    <span className="font-mono font-bold text-[#1A241C] dark:text-[#F3EFE6]">{contractor.taxNumber}</span>
                  </div>
                </div>

                <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs text-[#5C665E] dark:text-[#8FA392]">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-[#D99B26]" />
                    <span className="font-mono">{contractor.phone}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-[#D99B26]" />
                    <span>{contractor.email}</span>
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E0D9CB]/80 dark:border-[#243628] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                    {(contractor.totalContractsValue / 1000000).toFixed(1)} {isRtl ? 'مليون ر.س' : 'M SAR'}
                  </span>
                  <span className="text-[#5C665E] dark:text-[#8FA392]">
                    ({contractor.activeProjectsCount} {isRtl ? 'مشاريع جارية' : 'projects'})
                  </span>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <select
                    value={contractor.legalStatus}
                    onChange={(e) => updateContractLegalStatus(contractor.legalContractId, e.target.value as LegalContractStatus)}
                    className="text-[11px] py-1.5 px-2 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-hidden font-bold"
                  >
                    <option value="valid">{isRtl ? 'عقد ساري' : 'Active'}</option>
                    <option value="draft">{isRtl ? 'مسودة عقد' : 'Draft'}</option>
                    <option value="expired">{isRtl ? 'منتهي' : 'Expired'}</option>
                  </select>

                  <button
                    onClick={() => navigateToLegalContract(contractor.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#D99B26]/15 hover:bg-[#D99B26]/25 dark:bg-[#EBB34D]/20 dark:hover:bg-[#EBB34D]/30 text-[#D99B26] dark:text-[#EBB34D] border border-[#D99B26]/40 transition-all active:scale-95"
                  >
                    <span>{isRtl ? 'عرض العقد القانوني' : 'View Legal Contract'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  // --- Sub-View: عروض الأسعار (RFQs) ---
  const renderRFQsView = () => {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-[#F3EFE6] dark:bg-[#17231A] p-4 rounded-2xl border border-[#E0D9CB] dark:border-[#243628]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D99B26]/20 text-[#D99B26] dark:text-[#EBB34D] flex items-center justify-center font-bold">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                {t('سجل عروض الأسعار والمناقصات', 'Price Quotations & Bids Ledger')}
              </h3>
              <p className="text-xs text-[#5C665E] dark:text-[#8FA392]">
                {t('مقارنة عطاءات المقاولين والموردين والترسية الفنية والمالية', 'Compare contractor bids and awarding')}
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-[#EAE4D7] dark:bg-[#1F2E23] text-[#5C665E] dark:text-[#8FA392]">
            {rfqs.length} {isRtl ? 'عروض مسجلة' : 'Quotations'}
          </span>
        </div>

        <div className="space-y-3">
          {rfqs.map(rfq => (
            <div
              key={rfq.id}
              className="p-4 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#EAE4D7] dark:bg-[#1F2E23] text-[#5C665E] dark:text-[#8FA392]">
                    {rfq.rfqNumber}
                  </span>
                  <span className="text-[11px] font-semibold text-[#5C665E] dark:text-[#8FA392]">
                    {rfq.projectNameAr}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-[#1A241C] dark:text-[#F3EFE6] truncate">
                  {rfq.titleAr}
                </h4>
                <p className="text-xs text-[#5C665E] dark:text-[#8FA392]">
                  {t('المقاول مقدم العطاء:', 'Bidder:')} <span className="font-bold text-[#1A241C] dark:text-[#F3EFE6]">{rfq.contractorNameAr}</span>
                </p>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#E0D9CB]/60 dark:border-[#243628]">
                <div className="text-start md:text-end">
                  <span className="text-[11px] text-[#5C665E] dark:text-[#8FA392] block">{t('قيمة العطاء المقدم', 'Bid Amount')}</span>
                  <span className="text-sm font-black text-[#D99B26] dark:text-[#EBB34D]">
                    {formatCurrency(rfq.submittedBidAmount, true, rfq.currency)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                    rfq.status === 'awarded'
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                      : 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                  }`}>
                    {rfq.statusLabelAr}
                  </span>

                  <button
                    onClick={() => navigateToLegalContract(rfq.contractorId)}
                    className="p-2 rounded-xl bg-[#EAE4D7] dark:bg-[#1F2E23] text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6]"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // --- Sub-View: أوامر الشراء (POs) ---
  const renderPOsView = () => {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-[#F3EFE6] dark:bg-[#17231A] p-4 rounded-2xl border border-[#E0D9CB] dark:border-[#243628]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0D9488]/20 text-[#0D9488] dark:text-[#2DD4BF] flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                {t('سجل أوامر الشراء المعتمدة', 'Purchase Orders Registry')}
              </h3>
              <p className="text-xs text-[#5C665E] dark:text-[#8FA392]">
                {t('متابعة التوريدات وجداول التسليم بالموقع والاعتمادات المالية', 'Track site deliveries and payments')}
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-[#EAE4D7] dark:bg-[#1F2E23] text-[#5C665E] dark:text-[#8FA392]">
            {purchaseOrders.length} {isRtl ? 'أوامر صادرة' : 'Purchase Orders'}
          </span>
        </div>

        <div className="space-y-3">
          {purchaseOrders.map(po => (
            <div
              key={po.id}
              className="p-4 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#EAE4D7] dark:bg-[#1F2E23] text-[#5C665E] dark:text-[#8FA392]">
                    {po.poNumber}
                  </span>
                  <span className="text-[11px] font-semibold text-[#5C665E] dark:text-[#8FA392]">
                    {po.projectNameAr}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-[#1A241C] dark:text-[#F3EFE6] truncate">
                  {po.titleAr}
                </h4>
                <div className="flex items-center gap-3 text-xs text-[#5C665E] dark:text-[#8FA392]">
                  <span>{t('المورد:', 'Supplier:')} <strong className="text-[#1A241C] dark:text-[#F3EFE6]">{po.contractorNameAr}</strong></span>
                  <span>•</span>
                  <span>{t('تاريخ التوريد المتوقع:', 'Delivery:')} <span className="font-mono font-semibold">{po.deliveryDate}</span></span>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#E0D9CB]/60 dark:border-[#243628]">
                <div className="text-start md:text-end">
                  <span className="text-[11px] text-[#5C665E] dark:text-[#8FA392] block">{t('إجمالي القيمة', 'Total Value')}</span>
                  <span className="text-sm font-black text-[#1A241C] dark:text-[#F3EFE6]">
                    {formatCurrency(po.totalAmount, true, po.currency)}
                  </span>
                </div>

                <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                  po.status === 'fulfilled'
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                    : 'bg-teal-500/15 text-teal-700 dark:text-teal-400'
                }`}>
                  {po.statusLabelAr}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // --- Sub-View: حصر الكميات (BOQ) ---
  const renderBOQView = () => {
    const boqItems = [
      {
        code: '01.02',
        descAr: 'خرسانة مسلحة للأساسات واللبشة C40',
        descEn: 'Reinforced concrete for foundations & raft C40',
        unit: 'م³',
        contractedQty: 14500,
        executedQty: 14500,
        progress: 100,
        statusColor: 'emerald',
      },
      {
        code: '01.05',
        descAr: 'أعمدة وحوائط خرسانية مسلحة للأدوار المتكررة',
        descEn: 'Reinforced concrete columns & shear walls',
        unit: 'م³',
        contractedQty: 8200,
        executedQty: 5800,
        progress: 70.7,
        statusColor: 'amber',
      },
      {
        code: '02.10',
        descAr: 'تكسيات الواجهات الزجاجية المعمارية (Curtain Walls)',
        descEn: 'Architectural curtain wall glazing',
        unit: 'م²',
        contractedQty: 12000,
        executedQty: 4200,
        progress: 35.0,
        statusColor: 'blue',
      },
    ];

    return (
      <div className="space-y-4">
        {/* Header with View Mode Switch */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F3EFE6] dark:bg-[#17231A] p-4 rounded-2xl border border-[#E0D9CB] dark:border-[#243628]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#3B7A57]/20 text-[#3B7A57] dark:text-[#4ADE80] flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                {t('جداول حصر الكميات والمقايسات (BOQ)', 'Bill of Quantities (BOQ)')}
              </h3>
              <p className="text-xs text-[#5C665E] dark:text-[#8FA392]">
                {t('حساب الكميات التعاقدية والمنفذة ومطابقتها مع المستخلصات الجارية', 'Contracted vs executed quantities')}
              </p>
            </div>
          </div>

          {/* Toggle View Mode: Cards vs Table */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#EAE4D7] dark:bg-[#1F2E23] self-start sm:self-auto border border-[#E0D9CB]/60 dark:border-[#243628]">
            <button
              onClick={() => setBoqViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all touch-target ${
                boqViewMode === 'table'
                  ? 'bg-[#1C291E] dark:bg-[#F3EFE6] text-[#F3EFE6] dark:text-[#0E1610] shadow-xs'
                  : 'text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6]'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>{t('عرض جدول', 'Table')}</span>
            </button>
            <button
              onClick={() => setBoqViewMode('cards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all touch-target ${
                boqViewMode === 'cards'
                  ? 'bg-[#1C291E] dark:bg-[#F3EFE6] text-[#F3EFE6] dark:text-[#0E1610] shadow-xs'
                  : 'text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6]'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>{t('عرض كروت ملخصة', 'Cards')}</span>
            </button>
          </div>
        </div>

        {/* View Mode: Summary Cards (Optimized for Mobile/Touch) */}
        {boqViewMode === 'cards' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {boqItems.map(item => (
              <div
                key={item.code}
                className="p-4 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] space-y-3 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-[#EAE4D7] dark:bg-[#1F2E23] text-[#D99B26] dark:text-[#EBB34D]">
                    {item.code}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      item.progress >= 100
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                        : item.progress >= 50
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                        : 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                    }`}
                  >
                    {item.progress}%
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-[#1A241C] dark:text-[#F3EFE6] leading-snug">
                    {isRtl ? item.descAr : item.descEn}
                  </h4>
                  <span className="text-[11px] text-[#5C665E] dark:text-[#8FA392] mt-0.5 block">
                    {t('وحدة القياس:', 'Unit:')} {item.unit}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] text-xs border border-[#E0D9CB]/60 dark:border-[#243628]">
                  <div>
                    <span className="text-[10.5px] text-[#5C665E] dark:text-[#8FA392] block">
                      {t('الكمية التعاقدية', 'Contracted')}
                    </span>
                    <strong className="font-mono text-[#1A241C] dark:text-[#F3EFE6]">
                      {formatNumber(item.contractedQty)} {item.unit}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10.5px] text-[#5C665E] dark:text-[#8FA392] block">
                      {t('المنفذ الفعلي', 'Executed')}
                    </span>
                    <strong className="font-mono text-emerald-600 dark:text-emerald-400">
                      {formatNumber(item.executedQty)} {item.unit}
                    </strong>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="w-full h-2 rounded-full bg-[#EAE4D7] dark:bg-[#1F2E23] overflow-hidden">
                    <div
                      style={{ width: `${Math.min(item.progress, 100)}%` }}
                      className={`h-full rounded-full ${
                        item.progress >= 100
                          ? 'bg-emerald-500'
                          : item.progress >= 50
                          ? 'bg-amber-500'
                          : 'bg-blue-500'
                      }`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* View Mode: Responsive Table with Sticky First Column */
          <div className="overflow-x-auto rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] shadow-2xs">
            <table className="w-full text-xs text-start">
              <thead className="bg-[#EAE4D7] dark:bg-[#1F2E23] text-[#5C665E] dark:text-[#8FA392] font-bold border-b border-[#E0D9CB] dark:border-[#243628]">
                <tr>
                  <th className="p-3 text-start sticky right-0 bg-[#EAE4D7] dark:bg-[#1F2E23] z-10 shadow-xs">
                    {isRtl ? 'البند' : 'Item'}
                  </th>
                  <th className="p-3 text-start whitespace-nowrap">{isRtl ? 'الوصف الهندسي' : 'Description'}</th>
                  <th className="p-3 text-start">{isRtl ? 'الوحدة' : 'Unit'}</th>
                  <th className="p-3 text-start whitespace-nowrap">{isRtl ? 'الكمية التعاقدية' : 'Contracted Qty'}</th>
                  <th className="p-3 text-start whitespace-nowrap">{isRtl ? 'المنفذ بالموقع' : 'Executed Qty'}</th>
                  <th className="p-3 text-start">{isRtl ? 'نسبة الإنجاز' : 'Progress'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0D9CB]/60 dark:divide-[#243628]">
                {boqItems.map(item => (
                  <tr key={item.code} className="hover:bg-[#EAE4D7]/40 dark:hover:bg-[#1F2E23]/40 transition-colors">
                    <td className="p-3 font-mono font-bold text-[#D99B26] dark:text-[#EBB34D] sticky right-0 bg-[#F3EFE6] dark:bg-[#17231A] z-10 shadow-xs">
                      {item.code}
                    </td>
                    <td className="p-3 font-bold text-[#1A241C] dark:text-[#F3EFE6] whitespace-nowrap">
                      {isRtl ? item.descAr : item.descEn}
                    </td>
                    <td className="p-3 text-[#5C665E] dark:text-[#8FA392]">{item.unit}</td>
                    <td className="p-3 font-mono">{formatNumber(item.contractedQty)}</td>
                    <td className="p-3 font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      {formatNumber(item.executedQty)}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                          item.progress >= 100
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                            : item.progress >= 50
                            ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                            : 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                        }`}
                      >
                        {item.progress}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  // --- Sub-View: الاعتمادات الفنية & استفسارات الموقع ---
  const renderTechnicalOfficeLogs = (type: 'submittals' | 'rfi') => {
    const isSubmittal = type === 'submittals';
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-[#F3EFE6] dark:bg-[#17231A] p-4 rounded-2xl border border-[#E0D9CB] dark:border-[#243628]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D99B26]/20 text-[#D99B26] dark:text-[#EBB34D] flex items-center justify-center font-bold">
              {isSubmittal ? <FileCheck2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                {isSubmittal
                  ? t('سجل الاعتمادات الفنية', 'Technical Submittals Registry')
                  : t('استفسارات وتوضيحات الموقع', 'Site Requests for Information (RFI)')}
              </h3>
              <p className="text-xs text-[#5C665E] dark:text-[#8FA392]">
                {isSubmittal
                  ? t('اعتماد المخططات التنفيذية واعتمادات المواد من الاستشاري المشرف', 'Shop drawings and material approvals')
                  : t('متابعة استفسارات المقاولين الميدانية والردود الهندسية', 'Contractor site queries and replies')}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {isSubmittal ? (
            <>
              <div className="p-4 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-mono text-[#D99B26] font-bold">SUB-2026-088</span>
                  <h4 className="text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] mt-0.5">اعتماد عينات رخام الواجهات الإيطالي (Carrara White)</h4>
                  <p className="text-[11px] text-[#5C665E] dark:text-[#8FA392]">مقدم من: رواد العمارة للمقاولات • استشاري المشروع: دار الهندسة</p>
                </div>
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-500/15 text-emerald-600">معتمد بدون ملاحظات</span>
              </div>
              <div className="p-4 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-mono text-[#D99B26] font-bold">SUB-2026-092</span>
                  <h4 className="text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] mt-0.5">مخططات الورشة التنفيذية لتمديدات مكافحة الحريق بالقبو</h4>
                  <p className="text-[11px] text-[#5C665E] dark:text-[#8FA392]">مقدم من: أفق الكهروميكانيك • استشاري المشروع: خطيب وعلمي</p>
                </div>
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500/15 text-amber-600">معتمد مع ملاحظات</span>
              </div>
            </>
          ) : (
            <>
              <div className="p-4 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-mono text-[#D99B26] font-bold">RFI-2026-041</span>
                  <h4 className="text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] mt-0.5">تعارض مسار مجاري الهواء (Ducts) مع الجسور الخرسانية الساقطة بالدور الأول</h4>
                  <p className="text-[11px] text-[#5C665E] dark:text-[#8FA392]">تاريخ الإرسال: 2026-09-18 • بانتظار رد الاستشاري الإنشائي</p>
                </div>
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500/15 text-amber-600">قيد المراجعة</span>
              </div>
              <div className="p-4 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-mono text-[#D99B26] font-bold">RFI-2026-039</span>
                  <h4 className="text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] mt-0.5">تحديد نوع مانع التسرب الرغوي حول فواصل التمدد بالواجهات</h4>
                  <p className="text-[11px] text-[#5C665E] dark:text-[#8FA392]">تم الرد والموافقة على اعتماد المواصفة البديلة المقترحة</p>
                </div>
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-500/15 text-emerald-600">مغلق ومجاب</span>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  // Determine current active sub-view
  const renderCurrentSubView = () => {
    switch (activeSubItemId) {
      case 'eng_schedule':
        return renderScheduleView();
      case 'eng_ipc':
        return renderIPCsView();
      case 'eng_contractors':
        return renderContractorsView();
      case 'eng_rfq':
        return renderRFQsView();
      case 'eng_po':
        return renderPOsView();
      case 'eng_boq':
        return renderBOQView();
      case 'eng_submittals':
        return renderTechnicalOfficeLogs('submittals');
      case 'eng_rfi':
        return renderTechnicalOfficeLogs('rfi');
      case 'eng_projects':
      default:
        return renderProjectsView();
    }
  };

  return (
    <div className="space-y-6">
      {renderCurrentSubView()}

      {/* Modal: Add New Contractor */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative z-10 w-full max-w-lg bg-[#FBF9F5] dark:bg-[#0E1610] rounded-2xl border border-[#E0D9CB] dark:border-[#243628] shadow-2xl p-6"
            >
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E0D9CB] dark:border-[#243628]">
                <h3 className="text-sm font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                  {t('تسجيل مقاول جديد وربطه بالعقود', 'Register New Contractor')}
                </h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#5C665E] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddContractorSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                    {t('اسم المقاول أو الشركة (عربي) *', 'Contractor Name (Arabic) *')}
                  </label>
                  <input
                    type="text"
                    required
                    value={newNameAr}
                    onChange={e => setNewNameAr(e.target.value)}
                    placeholder="مثال: شركة الإنشاءات الهندسية المتقدمة"
                    className="w-full p-2.5 rounded-xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-hidden focus:border-[#D99B26]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                      {t('التخصص الرئيسي', 'Specialty')}
                    </label>
                    <input
                      type="text"
                      value={newSpecialtyAr}
                      onChange={e => setNewSpecialtyAr(e.target.value)}
                      placeholder="أعمال خرسانات، كهروميكانيك..."
                      className="w-full p-2.5 rounded-xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-hidden focus:border-[#D99B26]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                      {t('الحالة القانونية الأولية', 'Legal Status')}
                    </label>
                    <select
                      value={newLegalStatus}
                      onChange={e => setNewLegalStatus(e.target.value as LegalContractStatus)}
                      className="w-full p-2.5 rounded-xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-hidden focus:border-[#D99B26] font-bold"
                    >
                      <option value="valid">عقد ساري (Active)</option>
                      <option value="draft">مسودة عقد (Draft)</option>
                      <option value="expired">مستندات منتهية (Expired)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                      {t('السجل التجاري', 'Commercial Reg.')}
                    </label>
                    <input
                      type="text"
                      value={newCommercialReg}
                      onChange={e => setNewCommercialReg(e.target.value)}
                      placeholder="1010xxxxxx"
                      className="w-full p-2.5 rounded-xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-hidden focus:border-[#D99B26]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                      {t('الرقم الضريبي', 'Tax ID')}
                    </label>
                    <input
                      type="text"
                      value={newTaxNumber}
                      onChange={e => setNewTaxNumber(e.target.value)}
                      placeholder="300xxxxxxxxx003"
                      className="w-full p-2.5 rounded-xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-hidden focus:border-[#D99B26]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                      {t('المسؤول / المهندس المشرف', 'Contact Person')}
                    </label>
                    <input
                      type="text"
                      value={newContactPerson}
                      onChange={e => setNewContactPerson(e.target.value)}
                      placeholder="م. أحمد الشريف"
                      className="w-full p-2.5 rounded-xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-hidden focus:border-[#D99B26]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                      {t('رقم الهاتف للتواصل', 'Phone')}
                    </label>
                    <input
                      type="text"
                      value={newPhone}
                      onChange={e => setNewPhone(e.target.value)}
                      placeholder="+966 50 xxx xxxx"
                      className="w-full p-2.5 rounded-xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-hidden focus:border-[#D99B26]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                      {t('البريد الإلكتروني الرسمي', 'Official Email')}
                    </label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={e => setNewEmail(e.target.value)}
                      placeholder="info@company.com"
                      className="w-full p-2.5 rounded-xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-hidden focus:border-[#D99B26]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                      {t('قيمة التعاقد التقديرية (ر.س)', 'Contract Value')}
                    </label>
                    <input
                      type="number"
                      value={newContractsValue}
                      onChange={e => setNewContractsValue(e.target.value)}
                      placeholder="15000000"
                      className="w-full p-2.5 rounded-xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-hidden focus:border-[#D99B26]"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E0D9CB] dark:border-[#243628] flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-[#5C665E] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23]"
                  >
                    {t('إلغاء', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#D99B26] hover:bg-[#C28519] dark:bg-[#EBB34D] text-[#1C291E] dark:text-[#0E1610]"
                  >
                    {t('حفظ وتسجيل المقاول', 'Save Contractor')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Add New Payment Certificate (IPC) */}
      <AnimatePresence>
        {isAddIPCModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddIPCModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative z-10 w-full max-w-xl bg-[#FBF9F5] dark:bg-[#0E1610] rounded-2xl border border-[#E0D9CB] dark:border-[#243628] shadow-2xl p-6"
            >
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E0D9CB] dark:border-[#243628]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#D99B26]/15 text-[#D99B26] dark:text-[#EBB34D] flex items-center justify-center">
                    <Calculator className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                    {t('إعداد مستخلص دوري جديد وحساب صافي الصرف', 'Prepare New Payment Certificate')}
                  </h3>
                </div>
                <button
                  onClick={() => setIsAddIPCModalOpen(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#5C665E] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddIPCSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                      {t('نوع المستخلص', 'Certificate Type')}
                    </label>
                    <select
                      value={newIpcType}
                      onChange={e => setNewIpcType(e.target.value as 'subcontractor' | 'owner')}
                      className="w-full p-2.5 rounded-xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] font-bold"
                    >
                      <option value="subcontractor">{isRtl ? 'مستخلص مقاول باطن (Subcontractor)' : 'Subcontractor IPC'}</option>
                      <option value="owner">{isRtl ? 'مستخلص المالك (Owner)' : 'Owner IPC'}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                      {t('المقاول المعني', 'Contractor')}
                    </label>
                    <select
                      value={newIpcContractorId}
                      onChange={e => setNewIpcContractorId(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] font-bold"
                    >
                      {contractors.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.nameAr}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                      {t('أعمال الفترة السابقة (ر.س)', 'Previous Work')}
                    </label>
                    <input
                      type="number"
                      value={newIpcPrevWork}
                      onChange={e => setNewIpcPrevWork(Number(e.target.value) || 0)}
                      className="w-full p-2.5 rounded-xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                      {t('أعمال الفترة الحالية (ر.س) *', 'Current Work *')}
                    </label>
                    <input
                      type="number"
                      required
                      value={newIpcCurrWork}
                      onChange={e => setNewIpcCurrWork(Number(e.target.value) || 0)}
                      className="w-full p-2.5 rounded-xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#D99B26] text-[#1A241C] dark:text-[#F3EFE6] font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                      {t('نسبة التأمين (%)', 'Retention %')}
                    </label>
                    <input
                      type="number"
                      value={newIpcRetentionPct}
                      onChange={e => setNewIpcRetentionPct(Number(e.target.value) || 0)}
                      className="w-full p-2.5 rounded-xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                      {t('خصم الدفعة المقدمة', 'Advance Deduct')}
                    </label>
                    <input
                      type="number"
                      value={newIpcAdvanceDeduction}
                      onChange={e => setNewIpcAdvanceDeduction(Number(e.target.value) || 0)}
                      className="w-full p-2.5 rounded-xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                      {t('غرامات وخصومات', 'Penalties')}
                    </label>
                    <input
                      type="number"
                      value={newIpcPenaltyDeduction}
                      onChange={e => setNewIpcPenaltyDeduction(Number(e.target.value) || 0)}
                      className="w-full p-2.5 rounded-xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] font-mono font-bold"
                    />
                  </div>
                </div>

                {/* Instant Calculation Preview Card */}
                <div className="p-3.5 rounded-xl bg-[#D99B26]/10 dark:bg-[#EBB34D]/10 border border-[#D99B26]/30 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-[#5C665E] dark:text-[#8FA392]">
                    <span>{t('إجمالي الأعمال المنفذة التراكمية:', 'Total Executed Work:')}</span>
                    <span className="font-mono font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                      {formatCurrency(newIpcPrevWork + newIpcCurrWork, true, 'SAR')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[#5C665E] dark:text-[#8FA392]">
                    <span>{t('إجمالي الاستقطاعات (تأمين + دفعة + غرامات):', 'Total Deductions:')}</span>
                    <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                      -{formatCurrency(((newIpcCurrWork * newIpcRetentionPct) / 100) + newIpcAdvanceDeduction + newIpcPenaltyDeduction, true, 'SAR')}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-[#D99B26]/30 flex items-center justify-between font-bold text-sm">
                    <span className="text-[#1A241C] dark:text-[#F3EFE6]">{t('صافي الصرف المستحق للمقاول:', 'Net Payable Amount:')}</span>
                    <span className="font-mono text-base font-black text-[#D99B26] dark:text-[#EBB34D]">
                      {formatCurrency(
                        Math.max(
                          0,
                          newIpcCurrWork -
                            ((newIpcCurrWork * newIpcRetentionPct) / 100) -
                            newIpcAdvanceDeduction -
                            newIpcPenaltyDeduction
                        ),
                        true,
                        'SAR'
                      )}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E0D9CB] dark:border-[#243628] flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddIPCModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-[#5C665E] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23]"
                  >
                    {t('إلغاء', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#D99B26] hover:bg-[#C28519] dark:bg-[#EBB34D] text-[#1C291E] dark:text-[#0E1610]"
                  >
                    {t('حفظ وإرسال للاستشاري', 'Submit to Consultant')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Consultant Sign-off Dialog */}
      <AnimatePresence>
        {selectedIpcForReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedIpcForReview(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative z-10 w-full max-w-md bg-[#FBF9F5] dark:bg-[#0E1610] rounded-2xl border border-[#E0D9CB] dark:border-[#243628] shadow-2xl p-6"
            >
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E0D9CB] dark:border-[#243628]">
                <div className="flex items-center gap-2">
                  <BadgeCheck className="w-5 h-5 text-[#D99B26] dark:text-[#EBB34D]" />
                  <h3 className="text-sm font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                    {t('اعتماد الاستشاري والتصديق الفني', 'Consultant Sign-off Approval')}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedIpcForReview(null)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#5C665E] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="p-3 rounded-xl bg-[#EAE4D7]/60 dark:bg-[#1F2E23]/60 border border-[#E0D9CB]/60 dark:border-[#243628]">
                  <span className="text-[11px] font-bold text-[#5C665E] dark:text-[#8FA392] block">{selectedIpcForReview.ipcNumber}</span>
                  <h4 className="font-bold text-[#1A241C] dark:text-[#F3EFE6] mt-0.5">{selectedIpcForReview.contractorNameAr}</h4>
                  <p className="text-[11px] text-[#D99B26] dark:text-[#EBB34D] font-bold mt-1">
                    {t('صافي الصرف:', 'Net Payable:')} {formatCurrency(selectedIpcForReview.netPayableAmount, true, selectedIpcForReview.currency)}
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                    {t('ملاحظات وتوصيات المهندس الاستشاري المشرف', 'Consultant Notes & Recommendations')}
                  </label>
                  <textarea
                    rows={3}
                    value={consultantReviewNote}
                    onChange={e => setConsultantReviewNote(e.target.value)}
                    placeholder="تمت المعاينة ومطابقة القياسات الميدانية واجتياز اختبارات الجودة..."
                    className="w-full p-2.5 rounded-xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-hidden focus:border-[#D99B26]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      updateIPCStatus(selectedIpcForReview.id, 'approved_with_notes', consultantReviewNote);
                      setSelectedIpcForReview(null);
                    }}
                    className="px-3 py-2 rounded-xl text-xs font-bold text-teal-700 dark:text-teal-400 bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/30"
                  >
                    {t('اعتماد بملاحظات', 'Approve w/ Notes')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      updateIPCStatus(selectedIpcForReview.id, 'consultant_approved', consultantReviewNote);
                      setSelectedIpcForReview(null);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                  >
                    {t('اعتماد وتوقيع نهائي', 'Final Sign-off')}
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
