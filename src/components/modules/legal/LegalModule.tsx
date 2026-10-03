import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../../context/LanguageContext';
import { useContractors, LegalContractStatus } from '../../../context/ContractorContext';
import { formatCurrency, formatNumber } from '../../../utils/formatters';
import {
  Scale,
  FileCheck2,
  FileClock,
  FileX2,
  Filter,
  AlertTriangle,
  HardHat,
  Gavel,
  ExternalLink,
} from 'lucide-react';

interface LegalModuleProps {
  activeSubItemId: string | null;
}

export const LegalModule: React.FC<LegalModuleProps> = ({ activeSubItemId }) => {
  const { isRtl, t } = useLanguage();
  const {
    contracts,
    contractors,
    selectedContractorIdForLegal,
    setSelectedContractorIdForLegal,
    navigateToTechnicalContractor,
    updateContractLegalStatus,
  } = useContractors();

  // Selected contractor if filtered via deep-link
  const activeContractor = contractors.find(c => c.id === selectedContractorIdForLegal);

  // Filtered contracts
  const displayedContracts = selectedContractorIdForLegal
    ? contracts.filter(c => c.contractorId === selectedContractorIdForLegal)
    : contracts;

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

  // Subcontractor Contracts View (Default & Cross-linked)
  const renderSubcontractorContracts = () => {
    return (
      <div className="space-y-4">
        {/* Deep link indicator & quick jump back */}
        {selectedContractorIdForLegal && activeContractor && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2.5">
              <Filter className="w-4 h-4 text-[#D99B26] dark:text-[#EBB34D] shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                  {isRtl ? 'تمت التصفية المباشرة بناءً على المقاول المختار:' : 'Filtered by selected contractor:'}{' '}
                  <span className="text-[#D99B26] dark:text-[#EBB34D]">{isRtl ? activeContractor.nameAr : activeContractor.nameEn}</span>
                </h4>
                <p className="text-[11px] text-[#5C665E] dark:text-[#8FA392]">
                  {t('أي تعديل على الحالة القانونية للعقد سيحدث فورياً في المكتب الفني', 'Status modifications sync instantaneously to Technical Office')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setSelectedContractorIdForLegal(null)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#F3EFE6] dark:bg-[#17231A] text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6] border border-[#E0D9CB] dark:border-[#243628]"
              >
                {isRtl ? 'عرض جميع العقود' : 'Show All Contracts'}
              </button>
              <button
                onClick={() => navigateToTechnicalContractor(activeContractor.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#3B7A57] hover:bg-[#2D5F43] text-white shadow-xs"
              >
                <HardHat className="w-3.5 h-3.5" />
                <span>{isRtl ? 'العودة للمكتب الفني' : 'Return to Tech Office'}</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F3EFE6] dark:bg-[#17231A] p-4 rounded-2xl border border-[#E0D9CB] dark:border-[#243628]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#B45309]/20 text-[#B45309] dark:text-[#F59E0B] flex items-center justify-center font-bold">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                {t('سجل عقود المقاولين والموردين المعتمدة', 'Subcontractor & Supplier Contracts')}
              </h3>
              <p className="text-xs text-[#5C665E] dark:text-[#8FA392]">
                {t('الصياغة التعاقدية، شروط الضمانات البنكية، والامتثال القانوني', 'Legal drafting, bank guarantees, and compliance')}
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-[#EAE4D7] dark:bg-[#1F2E23] text-[#5C665E] dark:text-[#8FA392]">
            {displayedContracts.length} {isRtl ? 'عقود' : 'Contracts'}
          </span>
        </div>

        {/* Contracts Cards List */}
        <div className="space-y-4">
          {displayedContracts.map(contract => (
            <motion.div
              key={contract.id}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.15 }}
              className="p-5 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] hover:border-[#B45309]/50 transition-all space-y-4 shadow-2xs"
            >
              {/* Top Row: Number, Title, Contractor & Legal Badge */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#EAE4D7] dark:bg-[#1F2E23] text-[#5C665E] dark:text-[#8FA392]">
                      {contract.contractNumber}
                    </span>
                    <span className="text-xs font-bold text-[#D99B26] dark:text-[#EBB34D]">
                      {contract.contractorNameAr}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                    {isRtl ? contract.titleAr : contract.titleEn}
                  </h3>
                </div>

                <div className="shrink-0">
                  {renderLegalBadge(contract.status)}
                </div>
              </div>

              {/* Scope of Work */}
              <p className="text-xs text-[#5C665E] dark:text-[#8FA392] leading-relaxed">
                <strong className="text-[#1A241C] dark:text-[#F3EFE6]">{t('نطاق الأعمال التعاقدي:', 'Scope of Work:')}</strong>{' '}
                {isRtl ? contract.scopeOfWorkAr : contract.scopeOfWorkEn}
              </p>

              {/* Meta Grid: Value, Validity Dates, Performance Bond, Penalties */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs bg-[#EAE4D7]/60 dark:bg-[#1F2E23]/60 p-3 rounded-xl border border-[#E0D9CB]/60 dark:border-[#243628]">
                <div>
                  <span className="text-[11px] text-[#5C665E] dark:text-[#8FA392] block">{t('قيمة العقد الإجمالية', 'Contract Value')}</span>
                  <span className="text-sm font-black text-[#1A241C] dark:text-[#F3EFE6]">
                    {formatCurrency(contract.totalValue, true, contract.currency)}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-[#5C665E] dark:text-[#8FA392] block">{t('مدة العقد وسريانه', 'Validity Period')}</span>
                  <span className="font-mono font-semibold text-[#1A241C] dark:text-[#F3EFE6]">
                    {contract.startDate} → {contract.endDate}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-[#5C665E] dark:text-[#8FA392] block">{t('خطاب ضمان حسن التنفيذ', 'Performance Bond')}</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {formatNumber(contract.performanceBondPercentage)}% ({formatCurrency((contract.totalValue * contract.performanceBondPercentage) / 100, true, contract.currency)})
                  </span>
                </div>
              </div>

              {/* Penalty Clause Warning */}
              <div className="text-[11px] flex items-center gap-2 text-[#5C665E] dark:text-[#8FA392] bg-[#FBF9F5] dark:bg-[#0E1610] p-2.5 rounded-xl border border-[#E0D9CB]/60 dark:border-[#243628]">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span><strong className="text-[#1A241C] dark:text-[#F3EFE6]">{t('بند الغرامات:', 'Penalty Clause:')}</strong> {contract.penaltiesClauseAr}</span>
              </div>

              {/* Action Footer: Status Changer & Return to Technical Office */}
              <div className="pt-2 border-t border-[#E0D9CB]/60 dark:border-[#243628] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#5C665E] dark:text-[#8FA392]">
                    {t('تغيير الحالة القانونية (مزامنة فورية):', 'Sync Legal Status:')}
                  </span>
                  <select
                    value={contract.status}
                    onChange={(e) => updateContractLegalStatus(contract.id, e.target.value as LegalContractStatus)}
                    className="text-xs py-1 px-2.5 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-hidden font-bold"
                  >
                    <option value="valid">{isRtl ? 'عقد ساري (Active)' : 'Active Contract'}</option>
                    <option value="draft">{isRtl ? 'مسودة عقد (Draft)' : 'Draft Contract'}</option>
                    <option value="expired">{isRtl ? 'مستندات منتهية (Expired)' : 'Expired Documents'}</option>
                  </select>
                </div>

                <button
                  onClick={() => navigateToTechnicalContractor(contract.contractorId)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#3B7A57] dark:text-[#4ADE80] bg-[#3B7A57]/10 hover:bg-[#3B7A57]/20 border border-[#3B7A57]/30 transition-all self-end sm:self-auto"
                >
                  <HardHat className="w-3.5 h-3.5" />
                  <span>{isRtl ? 'فتح ملف المقاول بالمكتب الفني' : 'View in Tech Office'}</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  // Other legal sub-sections (cases, poa, advisory)
  const renderOtherLegalView = (title: string, desc: string) => {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-[#F3EFE6] dark:bg-[#17231A] p-4 rounded-2xl border border-[#E0D9CB] dark:border-[#243628]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#B45309]/20 text-[#B45309] dark:text-[#F59E0B] flex items-center justify-center font-bold">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1A241C] dark:text-[#F3EFE6]">{title}</h3>
              <p className="text-xs text-[#5C665E] dark:text-[#8FA392]">{desc}</p>
            </div>
          </div>
        </div>

        <div className="p-8 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] text-center space-y-2">
          <Gavel className="w-8 h-8 text-[#B45309] mx-auto opacity-70" />
          <h4 className="text-sm font-bold text-[#1A241C] dark:text-[#F3EFE6]">{title}</h4>
          <p className="text-xs text-[#5C665E] dark:text-[#8FA392]">
            {isRtl ? 'السجل محدث ومتصل بالمنظومة المركزية للشؤون القانونية.' : 'Records updated and connected to Legal Affairs.'}
          </p>
        </div>
      </div>
    );
  };

  switch (activeSubItemId) {
    case 'leg_cases':
      return renderOtherLegalView(
        isRtl ? 'القضايا والنزاعات القضائية' : 'Litigation & Disputes',
        isRtl ? 'متابعة الدعاوي والنزاعات والتحكيم مع المحاكم المختصة' : 'Court litigations and arbitration'
      );
    case 'leg_poa':
      return renderOtherLegalView(
        isRtl ? 'التوكيلات والتفويضات الرسمية' : 'Powers of Attorney & Signatories',
        isRtl ? 'سجل التوكيلات العدلية والتفويضات البنكية والإدارية' : 'Official notarized powers of attorney'
      );
    case 'leg_advisory':
      return renderOtherLegalView(
        isRtl ? 'الاستشارات والمذكرات القانونية' : 'Legal Consultations & Memos',
        isRtl ? 'الأرشفة القانونية وفتاوى العقود واللوائح التنظيمية' : 'Legal opinions and regulatory memos'
      );
    case 'leg_contracts_employment':
      return renderOtherLegalView(
        isRtl ? 'عقود الموظفين والعمل' : 'Employment Contracts',
        isRtl ? 'نماذج عقود العمل المعتمدة ولوائح الموارد البشرية' : 'Labor contracts and HR policies'
      );
    case 'leg_contracts_leases':
      return renderOtherLegalView(
        isRtl ? 'عقود الإيجار والخدمات التشغيلية' : 'Lease & Service Agreements',
        isRtl ? 'عقود المقار والفروع والمستودعات والخدمات المساندة' : 'Office leases and support services'
      );
    case 'leg_contracts_subcontractors':
    case 'leg_contracts':
    default:
      return renderSubcontractorContracts();
  }
};
