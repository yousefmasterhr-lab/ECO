import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../../context/LanguageContext';
import { useNavigation } from '../../../context/NavigationContext';
import { CheckCircle2 } from 'lucide-react';
import {
  INITIAL_COMPANIES,
  INITIAL_DOCUMENTS,
  INITIAL_BRANCHES,
  INITIAL_DEPARTMENTS,
  INITIAL_COST_CENTERS,
  INITIAL_SIGNATORIES
} from './mockData';
import {
  CompanyEntity,
  SmartDocument,
  BranchLocation,
  CostCenter,
  AuthorizedSignatory
} from './types';
import { CompanyDirectoryTab } from './CompanyDirectoryTab';
import { CompanyLicensesTab } from './CompanyLicensesTab';
import { CompanyBranchesTab } from './CompanyBranchesTab';
import { CompanyOrgStructureTab } from './CompanyOrgStructureTab';
import { CompanySignatoriesTab } from './CompanySignatoriesTab';

interface CompaniesModuleProps {
  activeSubItemId: string | null;
}

export const CompaniesModule: React.FC<CompaniesModuleProps> = ({ activeSubItemId }) => {
  const { isRtl } = useLanguage();
  const { selectItem } = useNavigation();
  const currentTab = activeSubItemId || 'comp_directory';

  // Reactive State for all Sub-Modules
  const [companies, setCompanies] = useState<CompanyEntity[]>(INITIAL_COMPANIES);
  const [documents, setDocuments] = useState<SmartDocument[]>(INITIAL_DOCUMENTS);
  const [branches, setBranches] = useState<BranchLocation[]>(INITIAL_BRANCHES);
  const [departments] = useState(INITIAL_DEPARTMENTS);
  const [costCenters, setCostCenters] = useState<CostCenter[]>(INITIAL_COST_CENTERS);
  const [signatories, setSignatories] = useState<AuthorizedSignatory[]>(INITIAL_SIGNATORIES);

  // Cross-Tab Interaction State
  const [preselectedCompanyIdForDoc, setPreselectedCompanyIdForDoc] = useState<string | null>(null);

  // Toast Notification
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // --- Companies CRUD ---
  const handleAddCompany = (newComp: CompanyEntity) => {
    setCompanies(prev => [newComp, ...prev]);
    showToast(isRtl ? `تم تسجيل "${newComp.nameAr}" وتثبيت هيكل المساهمين بنجاح` : 'Company registered successfully');
  };

  const handleUpdateCompany = (updated: CompanyEntity) => {
    setCompanies(prev => prev.map(c => (c.id === updated.id ? updated : c)));
    showToast(isRtl ? `تم تحديث بيانات "${updated.nameAr}" وهيكل الملكية` : 'Company updated successfully');
  };

  const handleDeleteCompany = (id: string) => {
    const comp = companies.find(c => c.id === id);
    setCompanies(prev => prev.filter(c => c.id !== id));
    showToast(isRtl ? `تم حذف / أرشفة "${comp?.nameAr || 'الشركة'}"` : 'Company archived');
  };

  const handleToggleCompanyStatus = (id: string) => {
    setCompanies(prev =>
      prev.map(c =>
        c.id === id ? { ...c, status: c.status === 'active' ? 'inactive' : 'active' } : c
      )
    );
    showToast(isRtl ? 'تم تحديث حالة تفعيل الشركة' : 'Company status updated');
  };

  const handleOpenAddDocumentForCompany = (comp: CompanyEntity) => {
    setPreselectedCompanyIdForDoc(comp.id);
    selectItem('companies', 'comp_licenses');
    showToast(isRtl ? `تم توجيهك إلى شاشة التراخيص لشركة "${comp.nameAr}"` : 'Redirected to licenses');
  };

  // --- Smart Documents CRUD ---
  const handleAddDocument = (newDoc: SmartDocument) => {
    setDocuments(prev => [newDoc, ...prev]);
    showToast(isRtl ? `تمت إضافة ترخيص/مستند "${newDoc.titleAr}" بنجاح` : 'Document added successfully');
  };

  const handleUpdateDocument = (updated: SmartDocument) => {
    setDocuments(prev => prev.map(d => (d.id === updated.id ? updated : d)));
    showToast(isRtl ? `تم تحديث المستند رقم "${updated.docNumber}"` : 'Document updated successfully');
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
    showToast(isRtl ? 'تم حذف المستند من السجل' : 'Document deleted');
  };

  // --- Branches CRUD ---
  const handleAddBranch = (newBranch: BranchLocation) => {
    setBranches(prev => [newBranch, ...prev]);
    showToast(isRtl ? `تمت إضافة "${newBranch.nameAr}" بنجاح` : 'Branch added successfully');
  };

  const handleUpdateBranch = (updated: BranchLocation) => {
    setBranches(prev => prev.map(b => (b.id === updated.id ? updated : b)));
    showToast(isRtl ? `تم تحديث بيانات "${updated.nameAr}"` : 'Branch updated successfully');
  };

  const handleDeleteBranch = (id: string) => {
    setBranches(prev => prev.filter(b => b.id !== id));
    showToast(isRtl ? 'تم حذف الفرع من القائمة' : 'Branch deleted');
  };

  // --- Cost Centers CRUD ---
  const handleAddCostCenter = (newCC: CostCenter) => {
    setCostCenters(prev => [newCC, ...prev]);
    showToast(isRtl ? `تم تسجيل مركز التكلفة "${newCC.code} - ${newCC.nameAr}"` : 'Cost center added');
  };

  const handleUpdateCostCenter = (updated: CostCenter) => {
    setCostCenters(prev => prev.map(cc => (cc.id === updated.id ? updated : cc)));
    showToast(isRtl ? `تم تحديث ميزانية المركز "${updated.code}"` : 'Cost center updated');
  };

  const handleDeleteCostCenter = (id: string) => {
    setCostCenters(prev => prev.filter(cc => cc.id !== id));
    showToast(isRtl ? 'تم حذف مركز التكلفة' : 'Cost center deleted');
  };

  // --- Signatories CRUD ---
  const handleAddSignatory = (newSig: AuthorizedSignatory) => {
    setSignatories(prev => [newSig, ...prev]);
    showToast(isRtl ? `تم اعتماد وتفويض "${newSig.nameAr}" رسمياً` : 'Signatory added');
  };

  const handleUpdateSignatory = (updated: AuthorizedSignatory) => {
    setSignatories(prev => prev.map(s => (s.id === updated.id ? updated : s)));
    showToast(isRtl ? `تم تحديث مصفوفة صلاحيات "${updated.nameAr}"` : 'Signatory permissions updated');
  };

  const handleDeleteSignatory = (id: string) => {
    setSignatories(prev => prev.filter(s => s.id !== id));
    showToast(isRtl ? 'تم حذف المفوض من السجل' : 'Signatory removed');
  };

  const handleToggleRevoke = (id: string) => {
    setSignatories(prev =>
      prev.map(s =>
        s.id === id ? { ...s, status: s.status === 'active' ? 'revoked' : 'active' } : s
      )
    );
    showToast(isRtl ? 'تم تعديل حالة سريان التفويض' : 'Delegation status toggled');
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="fixed top-20 z-50 left-1/2 -translate-x-1/2 bg-[#1C291E] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-2xl border border-[#D97706]/50 flex items-center gap-2.5 backdrop-blur-md"
          >
            <CheckCircle2 className="w-4 h-4 text-[#D97706]" />
            <span>{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sub-Route Tab 1: دليل الشركات وهيكل المساهمين */}
      {currentTab === 'comp_directory' && (
        <CompanyDirectoryTab
          companies={companies}
          onAddCompany={handleAddCompany}
          onUpdateCompany={handleUpdateCompany}
          onDeleteCompany={handleDeleteCompany}
          onToggleStatus={handleToggleCompanyStatus}
          onOpenAddDocumentForCompany={handleOpenAddDocumentForCompany}
        />
      )}

      {/* Sub-Route Tab 2: السجلات والتراخيص الذكية */}
      {currentTab === 'comp_licenses' && (
        <CompanyLicensesTab
          documents={documents}
          companies={companies}
          onAddDocument={handleAddDocument}
          onUpdateDocument={handleUpdateDocument}
          onDeleteDocument={handleDeleteDocument}
          preselectedCompanyId={preselectedCompanyIdForDoc}
        />
      )}

      {/* Sub-Route Tab 3: الفروع والمواقع الميدانية */}
      {currentTab === 'comp_branches' && (
        <CompanyBranchesTab
          branches={branches}
          companies={companies}
          onAddBranch={handleAddBranch}
          onUpdateBranch={handleUpdateBranch}
          onDeleteBranch={handleDeleteBranch}
        />
      )}

      {/* Sub-Route Tab 4: الهيكل التنظيمي ومراكز التكلفة */}
      {currentTab === 'comp_structure' && (
        <CompanyOrgStructureTab
          departments={departments}
          costCenters={costCenters}
          companies={companies}
          onAddCostCenter={handleAddCostCenter}
          onUpdateCostCenter={handleUpdateCostCenter}
          onDeleteCostCenter={handleDeleteCostCenter}
        />
      )}

      {/* Sub-Route Tab 5: المفوضون ومصفوفة الصلاحيات */}
      {currentTab === 'comp_signatories' && (
        <CompanySignatoriesTab
          signatories={signatories}
          companies={companies}
          onAddSignatory={handleAddSignatory}
          onUpdateSignatory={handleUpdateSignatory}
          onDeleteSignatory={handleDeleteSignatory}
          onToggleRevoke={handleToggleRevoke}
        />
      )}
    </div>
  );
};
