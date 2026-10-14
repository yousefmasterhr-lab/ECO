import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../../context/LanguageContext';
import { useNavigation } from '../../../context/NavigationContext';
import { CheckCircle2 } from 'lucide-react';

import {
  CompanyEntity,
  SmartDocument,
  BranchLocation,
  DepartmentOrg,
  AuthorizedSignatory
} from './types';
import { companyStorage } from './companyStorage';
import { licenseStorage } from './licenseStorage';
import { branchStorage } from './branchStorage';
import { departmentStorage } from './departmentStorage';
import { signatoryStorage } from './signatoryStorage';
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
  const { selectItem, currentUser } = useNavigation();
  const currentTab = activeSubItemId || 'comp_directory';

  const userName = (currentUser as any)?.displayName || currentUser?.nameAr || currentUser?.nameEn || 'يوسف حجازي';

  // Reactive State for all Sub-Modules
  const [companies, setCompanies] = useState<CompanyEntity[]>(() => companyStorage.getCompaniesSync());
  const [documents, setDocuments] = useState<SmartDocument[]>(() => licenseStorage.getLicensesSync());
  const [branches, setBranches] = useState<BranchLocation[]>(() => branchStorage.getBranchesSync());
  const [departments, setDepartments] = useState<DepartmentOrg[]>(() => departmentStorage.getDepartmentsSync());
  const [signatories, setSignatories] = useState<AuthorizedSignatory[]>(() => signatoryStorage.getSignatoriesSync());

  // Load from persistent storage & API sync on mount
  useEffect(() => {
    companyStorage.getCompanies().then(loaded => {
      setCompanies(loaded);
    });
    licenseStorage.getLicenses().then(loaded => {
      setDocuments(loaded);
    });
    branchStorage.getBranches().then(loaded => {
      setBranches(loaded);
    });
    departmentStorage.getDepartments().then(loaded => {
      setDepartments(loaded);
    });
    signatoryStorage.getSignatories().then(loaded => {
      setSignatories(loaded);
    });
  }, []);

  // Cross-Tab Interaction State
  const [preselectedCompanyIdForDoc, setPreselectedCompanyIdForDoc] = useState<string | null>(null);

  // Toast Notification
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // --- Companies CRUD with Real Persistence (Master Data Only) ---
  const handleAddCompany = async (newComp: CompanyEntity) => {
    await companyStorage.saveCompany(newComp, userName);
    setCompanies(companyStorage.getCompaniesSync());
    showToast(isRtl ? `تم تسجيل "${newComp.nameAr}" وتثبيت هيكل المساهمين بنجاح` : 'Company registered successfully');
  };

  const handleUpdateCompany = async (updated: CompanyEntity) => {
    await companyStorage.saveCompany(updated, userName);
    setCompanies(companyStorage.getCompaniesSync());
    showToast(isRtl ? `تم تحديث بيانات "${updated.nameAr}" وهيكل المساهمين` : 'Company updated successfully');
  };

  const handleDeleteCompany = async (id: string) => {
    const comp = companies.find(c => c.id === id);
    await companyStorage.deleteCompany(id, userName);
    setCompanies(companyStorage.getCompaniesSync());
    showToast(isRtl ? `تم حذف / أرشفة "${comp?.nameAr || 'الشركة'}"` : 'Company archived');
  };

  const handleToggleCompanyStatus = async (id: string) => {
    await companyStorage.toggleCompanyStatus(id, userName);
    setCompanies(companyStorage.getCompaniesSync());
    showToast(isRtl ? 'تم تحديث حالة تفعيل الشركة' : 'Company status updated');
  };

  const handleOpenAddDocumentForCompany = (comp: CompanyEntity) => {
    setPreselectedCompanyIdForDoc(comp.id);
    selectItem('companies', 'comp_licenses');
    showToast(isRtl ? `تم توجيهك إلى شاشة التراخيص لشركة "${comp.nameAr}"` : 'Redirected to licenses');
  };

  // --- Smart Documents CRUD with Real Persistence & Audit Log ---
  const handleAddDocument = async (newDoc: SmartDocument) => {
    await licenseStorage.saveLicense(newDoc, userName);
    setDocuments(licenseStorage.getLicensesSync());
    showToast(isRtl ? `تم تسجيل ترخيص/مستند "${newDoc.titleAr}" بنجاح` : 'Document added successfully');
  };

  const handleUpdateDocument = async (updated: SmartDocument) => {
    await licenseStorage.saveLicense(updated, userName);
    setDocuments(licenseStorage.getLicensesSync());
    showToast(isRtl ? `تم تحديث المستند رقم "${updated.docNumber}"` : 'Document updated successfully');
  };

  const handleDeleteDocument = async (id: string) => {
    const doc = documents.find(d => d.id === id);
    await licenseStorage.deleteLicense(id, userName);
    setDocuments(licenseStorage.getLicensesSync());
    showToast(isRtl ? `تم حذف المستند "${doc?.titleAr || 'الترخيص'}" نهائياً` : 'Document deleted');
  };

  // --- Branches CRUD with Real Persistence & Audit Log ---
  const handleAddBranch = async (newBranch: BranchLocation) => {
    await branchStorage.saveBranch(newBranch, userName);
    setBranches(branchStorage.getBranchesSync());
    showToast(isRtl ? `تمت إضافة المقر/الموقع "${newBranch.nameAr}" بنجاح` : 'Branch added successfully');
  };

  const handleUpdateBranch = async (updated: BranchLocation) => {
    await branchStorage.saveBranch(updated, userName);
    setBranches(branchStorage.getBranchesSync());
    showToast(isRtl ? `تم تحديث بيانات المقر/الموقع "${updated.nameAr}"` : 'Branch updated successfully');
  };

  const handleDeleteBranch = async (id: string) => {
    const branch = branches.find(b => b.id === id);
    await branchStorage.deleteBranch(id, userName);
    setBranches(branchStorage.getBranchesSync());
    showToast(isRtl ? `تم حذف الموقع "${branch?.nameAr || 'المقر'}" نهائياً` : 'Branch deleted');
  };

  // --- Departments CRUD with Real Persistence & Audit Log ---
  const handleAddDepartment = async (newDept: Partial<DepartmentOrg> & { nameAr: string; code: string }) => {
    await departmentStorage.saveDepartment(newDept, userName);
    setDepartments(departmentStorage.getDepartmentsSync());
    showToast(isRtl ? `تمت إضافة الإدارة "${newDept.nameAr}" إلى الهيكل التنظيمي بنجاح` : 'Department added successfully');
  };

  const handleUpdateDepartment = async (updated: Partial<DepartmentOrg> & { nameAr: string; code: string }) => {
    await departmentStorage.saveDepartment(updated, userName);
    setDepartments(departmentStorage.getDepartmentsSync());
    showToast(isRtl ? `تم تحديث بيانات "${updated.nameAr}" وتسجيل التعديلات بالهيكل التنظيمي` : 'Department updated successfully');
  };

  const handleDeleteDepartment = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const dept = departments.find(d => d.id === id);
      await departmentStorage.deleteDepartment(id, userName);
      setDepartments(departmentStorage.getDepartmentsSync());
      showToast(isRtl ? `تم حذف الإدارة "${dept?.nameAr || ''}" نهائياً من الهيكل` : 'Department deleted');
      return { success: true };
    } catch (err: any) {
      const msg = err.message || 'حدث خطأ أثناء حذف الإدارة';
      showToast(msg);
      return { success: false, error: msg };
    }
  };


  // --- Signatories CRUD with Real Persistence & Audit Log ---
  const handleAddSignatory = async (newSig: AuthorizedSignatory) => {
    await signatoryStorage.saveSignatory(newSig, userName);
    setSignatories(signatoryStorage.getSignatoriesSync());
    showToast(isRtl ? `تم اعتماد وتفويض "${newSig.nameAr}" رسمياً` : 'Signatory added');
  };

  const handleUpdateSignatory = async (updated: AuthorizedSignatory) => {
    await signatoryStorage.saveSignatory(updated, userName);
    setSignatories(signatoryStorage.getSignatoriesSync());
    showToast(isRtl ? `تم تحديث بيانات وصلاحيات "${updated.nameAr}"` : 'Signatory permissions updated');
  };

  const handleDeleteSignatory = async (id: string) => {
    const sig = signatories.find(s => s.id === id);
    await signatoryStorage.deleteSignatory(id, userName);
    setSignatories(signatoryStorage.getSignatoriesSync());
    showToast(isRtl ? `تم حذف المفوض "${sig?.nameAr || ''}" من السجل` : 'Signatory removed');
  };

  const handleToggleRevoke = async (id: string) => {
    const updated = await signatoryStorage.toggleRevoke(id, userName);
    setSignatories(signatoryStorage.getSignatoriesSync());
    showToast(isRtl ? (updated.status === 'active' ? 'تمت إعادة تفعيل سريان التفويض' : 'تم إلغاء سريان التفويض رسمياً') : 'Delegation status toggled');
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
          documents={documents}
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

      {/* Sub-Route Tab 4: الهيكل التنظيمي وشجرة الإدارات */}
      {currentTab === 'comp_structure' && (
        <CompanyOrgStructureTab
          departments={departments}
          companies={companies}
          branches={branches}
          onAddDepartment={handleAddDepartment}
          onUpdateDepartment={handleUpdateDepartment}
          onDeleteDepartment={handleDeleteDepartment}
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
