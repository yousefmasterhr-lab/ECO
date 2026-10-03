import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../../context/LanguageContext';
import { useNavigation } from '../../../context/NavigationContext';
import { useHR } from '../../../context/HRContext';
import { HRAmbientBackground } from './HRAmbientBackground';
import { MasterDirectoryView } from './MasterDirectoryView';
import { StandardPayrollView } from './StandardPayrollView';
import { DisbursementSheetsView } from './DisbursementSheetsView';
import { ContractsDocumentsView } from './ContractsDocumentsView';
import { AttendanceLeavesView } from './AttendanceLeavesView';
import { LeavesManagementView } from './LeavesManagementView';
import { AdvancesCustodyView } from './AdvancesCustodyView';
import { RecruitmentPipelineView } from './RecruitmentPipelineView';
import { BonusesDeductionsLedgerView } from './BonusesDeductionsLedgerView';
import { MissingDocumentsAuditView } from './MissingDocumentsAuditView';
import { IncompleteDossiersAuditView } from './IncompleteDossiersAuditView';
import { HRApprovalsHubView } from './HRApprovalsHubView';
import { HRSettingsView } from './HRSettingsView';
import { HRAuditTrailView } from './HRAuditTrailView';
import { EnterpriseOrgTreeView } from './EnterpriseOrgTreeView';
import { PayrollExView } from './PayrollExView';
import {
  Users,
  Coins,
  CreditCard,
  FileText,
  Clock,
  Calendar,
  DollarSign,
  TrendingUp,
  UserPlus,
  Sparkles,
  FileWarning,
  FolderX,
  CheckCircle2,
  Sliders,
  History,
  Network
} from 'lucide-react';

interface HRModuleProps {
  activeSubItemId: string | null;
}

export const HRModule: React.FC<HRModuleProps> = ({ activeSubItemId }) => {
  const { isRtl } = useLanguage();
  const { selectItem } = useNavigation();
  const { toastMessage } = useHR();

  // Selected sub-tab fallback to hr_directory
  const currentSubId = activeSubItemId || 'hr_directory';

  // 17 Clean Arabic Top Navigation Items
  const HR_NAV_ITEMS = [
    { id: 'hr_directory', titleAr: 'دليل الموظفين', titleEn: 'Master Directory', icon: Users },
    { id: 'hr_payroll', titleAr: 'مسير الرواتب', titleEn: 'Standard Payroll', icon: Coins },
    { id: 'hr_disbursement', titleAr: 'صرف الرواتب', titleEn: 'Disbursement Sheets', icon: CreditCard },
    { id: 'hr_contracts', titleAr: 'سجل العقود', titleEn: 'Contracts Ledger', icon: FileText },
    { id: 'hr_attendance', titleAr: 'الحضور والدوام', titleEn: 'Attendance Logs', icon: Clock },
    { id: 'hr_leaves', titleAr: 'رصيد الإجازات', titleEn: 'Time-Off Balance', icon: Calendar, badge: '12' },
    { id: 'hr_advances_requests', titleAr: 'طلبات السلف', titleEn: 'Advance Requests', icon: DollarSign },
    { id: 'hr_advances_active', titleAr: 'سجل السلف القائمة', titleEn: 'Active Advances', icon: TrendingUp },
    { id: 'hr_recruitment', titleAr: 'طلبات التوظيف', titleEn: 'Recruitment', icon: UserPlus },
    { id: 'hr_penalties', titleAr: 'الحوافز والجزاءات', titleEn: 'Bonuses & Deductions', icon: Sparkles },
    { id: 'hr_missing_docs', titleAr: 'نواقص المستندات', titleEn: 'Missing Documents', icon: FileWarning },
    { id: 'hr_incomplete', titleAr: 'الملفات غير المكتملة', titleEn: 'Incomplete Dossiers', icon: FolderX },
    { id: 'hr_approvals', titleAr: 'الطلبات والاعتمادات', titleEn: 'Approvals Hub', icon: CheckCircle2 },
    { id: 'hr_settings', titleAr: 'إعدادات المنظومة', titleEn: 'HR Configuration', icon: Sliders },
    { id: 'hr_audit', titleAr: 'سجل العمليات', titleEn: 'Audit Trail', icon: History },
    { id: 'hr_org_tree', titleAr: 'الهيكل التنظيمي العام', titleEn: 'Organization Tree', icon: Network },
    { id: 'hr_payroll_ex', titleAr: 'Payroll - Ex', titleEn: 'Payroll - Ex', icon: Sparkles, starBadge: true },
  ];

  return (
    <div className="relative w-full max-w-none space-y-6">
      {/* Living Ambient Luminescence Background Canvas */}
      <HRAmbientBackground />

      {/* Top Navigation Bar: 17 Arabic Items with Smooth Horizontal Scroll */}
      <div className="relative z-10 w-full rounded-2xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] shadow-xs p-1.5 overflow-hidden">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-0.5 px-0.5 select-none">
          {HR_NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = currentSubId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => selectItem('hr', item.id)}
                className={`relative flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-[#1C291E] dark:bg-[#EBB34D] text-[#F3EFE6] dark:text-[#0E1610] shadow-md ring-1 ring-[#EBB34D]/50 font-black'
                    : 'text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23]'
                }`}
              >
                {item.starBadge && <span className="text-[#EBB34D] dark:text-[#0E1610]">⭐</span>}
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#EBB34D] dark:text-[#0E1610]' : 'text-[#8FA392]'}`} />
                <span>{isRtl ? item.titleAr : item.titleEn}</span>
                {item.badge && (
                  <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full font-black ${
                    isActive
                      ? 'bg-[#0E1610] text-[#EBB34D]'
                      : 'bg-amber-500/20 text-[#D99B26] dark:text-[#EBB34D]'
                  }`}>
                    {item.badge}
                  </span>
                )}
                {item.starBadge && !isActive && (
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-md bg-[#EBB34D]/20 text-[#D99B26] dark:text-[#EBB34D]">
                    Pro
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Sub-View Dispatcher */}
      <div className="relative z-10 w-full">
        {currentSubId === 'hr_directory' && <MasterDirectoryView />}
        {currentSubId === 'hr_payroll' && <StandardPayrollView />}
        {currentSubId === 'hr_disbursement' && <DisbursementSheetsView />}
        {currentSubId === 'hr_contracts' && <ContractsDocumentsView />}
        {currentSubId === 'hr_attendance' && <AttendanceLeavesView />}
        {currentSubId === 'hr_leaves' && <LeavesManagementView />}
        {currentSubId === 'hr_advances_requests' && <AdvancesCustodyView defaultSection="advances" />}
        {currentSubId === 'hr_advances_active' && <AdvancesCustodyView defaultSection="advances" />}
        {currentSubId === 'hr_recruitment' && <RecruitmentPipelineView />}
        {currentSubId === 'hr_penalties' && <BonusesDeductionsLedgerView />}
        {currentSubId === 'hr_missing_docs' && <MissingDocumentsAuditView />}
        {currentSubId === 'hr_incomplete' && <IncompleteDossiersAuditView />}
        {currentSubId === 'hr_approvals' && <HRApprovalsHubView />}
        {currentSubId === 'hr_settings' && <HRSettingsView />}
        {currentSubId === 'hr_audit' && <HRAuditTrailView />}
        {currentSubId === 'hr_org_tree' && <EnterpriseOrgTreeView />}
        {currentSubId === 'hr_payroll_ex' && <PayrollExView />}
        
        {/* Fallbacks for older routes if accessed */}
        {currentSubId === 'hr_advances' && <AdvancesCustodyView defaultSection="advances" />}
        {currentSubId === 'hr_custody' && <AdvancesCustodyView defaultSection="custody" />}
      </div>

      {/* Floating System Toast Notice */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 start-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-[#17231A] border border-[#EBB34D]/40 text-[#F3EFE6] shadow-2xl text-xs font-bold"
          >
            <CheckCircle2 className="w-4 h-4 text-[#EBB34D] shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
