import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { HRApprovalsHubView } from './HRApprovalsHubView';
import { HRSettingsView } from './HRSettingsView';
import { HRAuditTrailView } from './HRAuditTrailView';
import { EnterpriseOrgTreeView } from './EnterpriseOrgTreeView';
import { CheckCircle2 } from 'lucide-react';

interface HRModuleProps {
  activeSubItemId: string | null;
}

export const HRModule: React.FC<HRModuleProps> = ({ activeSubItemId }) => {
  const { toastMessage } = useHR();

  // Selected sub-tab fallback to hr_directory (controlled purely via main right-hand Sidebar)
  const currentSubId = activeSubItemId || 'hr_directory';

  return (
    <div className="relative w-full max-w-none space-y-6">
      {/* Living Ambient Luminescence Background Canvas */}
      <HRAmbientBackground />

      {/* Dynamic Sub-View Dispatcher: 100% screen width & height to active HR workspace */}
      <div className="relative z-10 w-full min-h-[calc(100vh-140px)]">
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
        {(currentSubId === 'hr_missing_docs' || currentSubId === 'hr_incomplete') && <MissingDocumentsAuditView />}
        {currentSubId === 'hr_approvals' && <HRApprovalsHubView />}
        {currentSubId === 'hr_settings' && <HRSettingsView />}
        {currentSubId === 'hr_audit' && <HRAuditTrailView />}
        {currentSubId === 'hr_org_tree' && <EnterpriseOrgTreeView />}
        
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
