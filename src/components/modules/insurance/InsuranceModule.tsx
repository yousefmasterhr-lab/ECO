import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useTenant } from '../../../context/TenantContext';
import { useAuth } from '../../../context/AuthContext';
import { useNavigation } from '../../../context/NavigationContext';
import { isSuperAdminUser, SUBMODULE_VIEW_PERMISSION_MAP } from '../../../types/rbac';

SUBMODULE_VIEW_PERMISSION_MAP['ins_analytics'] = 'ins.sites.view';
import {
  insuranceStorage,
  InsuranceOperationRecord,
  InsuredEmployeeRecord,
  OfficialFormRecord,
  InsuranceRemittanceRecord,
  InsuranceComplianceRecord,
  getEmployeeInsuranceStatus,
} from '../../../services/insuranceStorage';
import { hrStorage } from '../../../services/hrStorage';
import { InsuranceHeroHeader } from './InsuranceHeroHeader';
import { OperationsCenterView } from './OperationsCenterView';
import { OfficialFormsCenterView } from './OfficialFormsCenterView';
import { InsuredEmployeesRegistryView } from './InsuredEmployeesRegistryView';
import { WagesAndContributionsView } from './WagesAndContributionsView';
import { InsuranceAnalyticsAndComplianceView } from './InsuranceAnalyticsAndComplianceView';
import { AuditLogDrawer } from '../reception/AuditLogDrawer';
import { DocumentPreviewModal } from '../../common/DocumentPreviewModal';
import {
  FileSpreadsheet,
  FileText,
  Users,
  Calculator,
  BarChart3,
} from 'lucide-react';

interface InsuranceModuleProps {
  activeSubItemId: string | null;
}

export const InsuranceModule: React.FC<InsuranceModuleProps> = ({ activeSubItemId }) => {
  const { t } = useLanguage();
  const { companies, selectedCompanyIds } = useTenant();
  const { user, hasPermission } = useAuth();
  const { selectItem } = useNavigation();
  const currentUserName = user?.nameAr || 'مدير النظام';

  // Active tab state synced with Sidebar activeSubItemId (default landing tab: ins_analytics)
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (activeSubItemId === 'ins_forms') return 'ins_forms';
    if (activeSubItemId === 'ins_operations') return 'ins_operations';
    if (activeSubItemId === 'ins_register') return 'ins_register';
    if (activeSubItemId === 'ins_wages') return 'ins_wages';
    if (activeSubItemId === 'ins_analytics' || activeSubItemId === 'ins_compliance') return 'ins_analytics';
    return 'ins_analytics';
  });

  useEffect(() => {
    if (activeSubItemId === 'ins_forms') setActiveTab('ins_forms');
    else if (activeSubItemId === 'ins_operations') setActiveTab('ins_operations');
    else if (activeSubItemId === 'ins_register') setActiveTab('ins_register');
    else if (activeSubItemId === 'ins_wages') setActiveTab('ins_wages');
    else if (activeSubItemId === 'ins_analytics' || activeSubItemId === 'ins_compliance') {
      setActiveTab('ins_analytics');
    } else if (!activeSubItemId) {
      setActiveTab('ins_analytics');
    }
  }, [activeSubItemId]);

  // Quick-jump state when clicking "س1" or "س6" next to an employee in the Registry
  const [targetFormType, setTargetFormType] = useState<'س1' | 'س2' | 'س6'>('س1');
  const [targetEmployeeId, setTargetEmployeeId] = useState<string>('');

  // Company filter state (respecting user allowedCompanyIds)
  const accessibleCompanies = useMemo(() => {
    const isSuperAdmin = isSuperAdminUser(user);
    if (isSuperAdmin || !user?.allowedCompanyIds || user.allowedCompanyIds.length === 0) {
      return companies;
    }
    return companies.filter((c) => user.allowedCompanyIds?.includes(c.id));
  }, [companies, user]);

  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(() => {
    if (selectedCompanyIds.length === 1) return selectedCompanyIds[0];
    return 'all';
  });

  // Live D1 Data State
  const [operations, setOperations] = useState<InsuranceOperationRecord[]>([]);
  const [employees, setEmployees] = useState<InsuredEmployeeRecord[]>([]);
  const [forms, setForms] = useState<OfficialFormRecord[]>([]);
  const [remittances, setRemittances] = useState<InsuranceRemittanceRecord[]>([]);
  const [complianceChecks, setComplianceChecks] = useState<InsuranceComplianceRecord[]>([]);
  const [hrEmployees, setHrEmployees] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Shared Audit Drawer & Document Preview Modal State
  const [auditModal, setAuditModal] = useState<{ open: boolean; title: string; logs: any }>({
    open: false,
    title: '',
    logs: [],
  });
  const [previewModal, setPreviewModal] = useState<{
    open: boolean;
    title: string;
    url: string;
    fileName: string;
  }>({
    open: false,
    title: '',
    url: '',
    fileName: '',
  });

  const loadAllData = useCallback(async () => {
    setIsSyncing(true);
    try {
      const [ops, emps, frms, rems, chks, hrEmps] = await Promise.all([
        insuranceStorage.getOperations(selectedCompanyId),
        insuranceStorage.getEmployees(selectedCompanyId),
        insuranceStorage.getForms(selectedCompanyId),
        insuranceStorage.getRemittances(selectedCompanyId),
        insuranceStorage.getComplianceChecks(selectedCompanyId),
        Promise.resolve(hrStorage.getEmployees()),
      ]);
      setOperations(ops);
      setEmployees(emps);
      setForms(frms);
      setRemittances(rems);
      setComplianceChecks(chks);
      setHrEmployees(Array.isArray(hrEmps) ? hrEmps : []);
    } catch (e) {
      console.warn('[InsuranceModule] Load notice:', e);
    } finally {
      setIsSyncing(false);
    }
  }, [selectedCompanyId]);

  useEffect(() => {
    loadAllData();
    const handleSyncEvent = () => {
      loadAllData();
    };
    window.addEventListener('eco-insurance-updated', handleSyncEvent);
    return () => window.removeEventListener('eco-insurance-updated', handleSyncEvent);
  }, [loadAllData]);

  // Compute Hero KPI Stats
  const heroStats = useMemo(() => {
    const activeEmployees = employees.filter(
      (e) => getEmployeeInsuranceStatus(e, operations).type !== 'exited'
    ).length;
    return {
      totalOps: operations.length,
      pendingOps: operations.filter((o) => o.status === 'انتظار').length,
      reviewOps: operations.filter((o) => o.status === 'قيد المراجعة').length,
      completedOps: operations.filter((o) => o.status === 'مكتمل').length,
      rejectedOps: operations.filter((o) => o.status === 'مرفوض').length,
      duplicateOps: operations.filter((o) => o.status === 'مكرر').length,
      activeEmployees,
    };
  }, [operations, employees]);

  // Granular RBAC permissions for current active sub-module
  const isSuperAdmin = isSuperAdminUser(user);
  const rbacSubKey = activeTab === 'ins_analytics' ? 'ins_sites' : activeTab;
  const canCreate = isSuperAdmin || hasPermission(rbacSubKey, 'create') || hasPermission(activeTab, 'create');
  const canEdit = isSuperAdmin || hasPermission(rbacSubKey, 'edit') || hasPermission(activeTab, 'edit');
  const canDelete = isSuperAdmin || hasPermission(rbacSubKey, 'delete') || hasPermission(activeTab, 'delete');
  const canExport = isSuperAdmin || hasPermission(rbacSubKey, 'export') || hasPermission(activeTab, 'export');

  const navTabs = [
    {
      id: 'ins_analytics',
      label: t('لوحة التحليلات والامتثال', 'Analytics & Compliance'),
      icon: BarChart3,
      count: complianceChecks.length,
    },
    {
      id: 'ins_forms',
      label: t('مركز الاستمارات (س1 / س2 / س6)', 'Forms Center (S1 / S2 / S6)'),
      icon: FileText,
      count: forms.length,
    },
    {
      id: 'ins_operations',
      label: t('مركز العمليات التأمينية', 'Operations Center'),
      icon: FileSpreadsheet,
      count: operations.length,
    },
    {
      id: 'ins_register',
      label: t('جداول الموظفين (السجل التأميني)', 'Insured Employees Registry'),
      icon: Users,
      count: employees.length,
    },
    {
      id: 'ins_wages',
      label: t('وعاء الأجور والاشتراكات', 'Wages & Contributions'),
      icon: Calculator,
      count: remittances.length,
    },
  ];

  const handleTabSelect = (tabId: string) => {
    setActiveTab(tabId);
    selectItem('insurance', tabId);
  };

  const handleOpenFormForEmployee = (formType: 'س1' | 'س2' | 'س6', employeeId: string) => {
    setTargetFormType(formType);
    setTargetEmployeeId(employeeId);
    setActiveTab('ins_forms');
    selectItem('insurance', 'ins_forms');
  };

  return (
    <div className="space-y-6 pb-10">
      {/* 3D Luxury Brand Amber & Royal Olive Hero Banner */}
      <InsuranceHeroHeader
        stats={heroStats}
        companies={accessibleCompanies}
        selectedCompanyId={selectedCompanyId}
        onSelectCompany={setSelectedCompanyId}
        onRefresh={loadAllData}
        isSyncing={isSyncing}
      />

      {/* Module Internal Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-2 rounded-2xl bg-white dark:bg-[#112219] border border-slate-200/80 dark:border-[#22382B] shadow-sm">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabSelect(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-700 dark:text-stone-200 hover:bg-amber-500/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span
                className={`px-2 py-0.5 rounded-full font-mono text-[11px] ${
                  isActive
                    ? 'bg-black/15 text-slate-950'
                    : 'bg-amber-500/15 text-amber-800 dark:text-amber-300'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Sub-Module Workspace */}
      {activeTab === 'ins_operations' && (
        <OperationsCenterView
          operations={operations}
          employees={employees}
          hrEmployees={hrEmployees}
          companies={accessibleCompanies}
          selectedCompanyId={selectedCompanyId}
          currentUserName={currentUserName}
          canCreate={canCreate}
          canEdit={canEdit}
          canDelete={canDelete}
          canExport={canExport}
          onRefreshData={loadAllData}
          onOpenAuditLog={(title, logs) => setAuditModal({ open: true, title, logs })}
          onPreviewAttachment={(title, url, fileName) =>
            setPreviewModal({ open: true, title, url, fileName })
          }
        />
      )}

      {activeTab === 'ins_forms' && (
        <OfficialFormsCenterView
          employees={employees}
          hrEmployees={hrEmployees}
          forms={forms}
          companies={accessibleCompanies}
          selectedCompanyId={selectedCompanyId}
          currentUserName={currentUserName}
          canCreate={canCreate}
          canEdit={canEdit}
          canDelete={canDelete}
          initialFormType={targetFormType}
          initialEmployeeId={targetEmployeeId}
          onRefreshData={loadAllData}
          onOpenAuditLog={(title, logs) => setAuditModal({ open: true, title, logs })}
          onPreviewAttachment={(title, url, fileName) =>
            setPreviewModal({ open: true, title, url, fileName })
          }
        />
      )}

      {activeTab === 'ins_register' && (
        <InsuredEmployeesRegistryView
          employees={employees}
          operations={operations}
          hrEmployees={hrEmployees}
          companies={accessibleCompanies}
          selectedCompanyId={selectedCompanyId}
          currentUserName={currentUserName}
          canCreate={canCreate}
          canEdit={canEdit}
          canDelete={canDelete}
          canExport={canExport}
          onRefreshData={loadAllData}
          onOpenAuditLog={(title, logs) => setAuditModal({ open: true, title, logs })}
          onPreviewAttachment={(title, url, fileName) =>
            setPreviewModal({ open: true, title, url, fileName })
          }
          onOpenFormForEmployee={handleOpenFormForEmployee}
        />
      )}

      {activeTab === 'ins_wages' && (
        <WagesAndContributionsView
          employees={employees}
          operations={operations}
          remittances={remittances}
          companies={accessibleCompanies}
          selectedCompanyId={selectedCompanyId}
          currentUserName={currentUserName}
          canCreate={canCreate}
          canEdit={canEdit}
          canDelete={canDelete}
          canExport={canExport}
          onRefreshData={loadAllData}
          onOpenAuditLog={(title, logs) => setAuditModal({ open: true, title, logs })}
          onPreviewAttachment={(title, url, fileName) =>
            setPreviewModal({ open: true, title, url, fileName })
          }
        />
      )}

      {(activeTab === 'ins_analytics' || activeTab === 'ins_compliance') && (
        <InsuranceAnalyticsAndComplianceView
          employees={employees}
          operations={operations}
          complianceChecks={complianceChecks}
          companies={accessibleCompanies}
          selectedCompanyId={selectedCompanyId}
          currentUserName={currentUserName}
          canCreate={canCreate}
          canEdit={canEdit}
          canDelete={canDelete}
          canExport={canExport}
          onRefreshData={loadAllData}
          onOpenAuditLog={(title, logs) => setAuditModal({ open: true, title, logs })}
          onPreviewAttachment={(title, url, fileName) =>
            setPreviewModal({ open: true, title, url, fileName })
          }
        />
      )}

      {/* Shared Audit Trail Drawer (`!`) */}
      <AuditLogDrawer
        isOpen={auditModal.open}
        onClose={() => setAuditModal({ open: false, title: '', logs: [] })}
        title={auditModal.title}
        auditLogs={auditModal.logs}
      />

      {/* Shared Document Preview Modal (`Blob URL`) */}
      <DocumentPreviewModal
        isOpen={previewModal.open}
        onClose={() => setPreviewModal({ open: false, title: '', url: '', fileName: '' })}
        fileData={previewModal.url}
        title={previewModal.title}
        fileName={previewModal.fileName}
      />
    </div>
  );
};
