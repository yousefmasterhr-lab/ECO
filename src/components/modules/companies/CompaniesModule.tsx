import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../../context/LanguageContext';
import { useNavigation } from '../../../context/NavigationContext';
import { useAuth } from '../../../context/AuthContext';
import { CheckCircle2, AlertTriangle, Loader2, ShieldAlert } from 'lucide-react';

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
  const { hasPermission } = useAuth();

  // Granular Action-Level RBAC: Calculate permitted tabs for current user
  const permittedTabs = React.useMemo(() => [
    { id: 'comp_directory', perm: 'companies.directory.view', titleAr: 'دليل الشركات' },
    { id: 'comp_licenses', perm: 'companies.licenses.view', titleAr: 'السجلات والتراخيص' },
    { id: 'comp_branches', perm: 'companies.branches.view', titleAr: 'الفروع والمواقع' },
    { id: 'comp_structure', perm: 'companies.org.view', titleAr: 'الهيكل ومراكز التكلفة' },
    { id: 'comp_signatories', perm: 'companies.signatories.view', titleAr: 'المفوضون والصلاحيات' },
  ].filter(t => hasPermission(t.perm)), [hasPermission]);

  const requestedTab = activeSubItemId || 'comp_directory';
  const currentTab = permittedTabs.some(t => t.id === requestedTab)
    ? requestedTab
    : permittedTabs[0]?.id || null;

  const userName = (currentUser as any)?.displayName || currentUser?.nameAr || currentUser?.nameEn || 'يوسف حجازي';

  // Reactive State for all Sub-Modules
  const [companies, setCompanies] = useState<CompanyEntity[]>(() => companyStorage.getCompaniesSync());
  const [documents, setDocuments] = useState<SmartDocument[]>(() => licenseStorage.getLicensesSync());
  const [branches, setBranches] = useState<BranchLocation[]>(() => branchStorage.getBranchesSync());
  const [departments, setDepartments] = useState<DepartmentOrg[]>(() => departmentStorage.getDepartmentsSync());
  const [signatories, setSignatories] = useState<AuthorizedSignatory[]>(() => signatoryStorage.getSignatoriesSync());

  // Loading state for remote Cloudflare D1 fetch
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load deterministically from Cloudflare D1 database on mount
  useEffect(() => {
    let isMounted = true;
    const loadRemoteData = async () => {
      setIsLoading(true);
      try {
        const [loadedCompanies, loadedDocs, loadedBranches, loadedDepts, loadedSigs] = await Promise.all([
          companyStorage.getCompanies(),
          licenseStorage.getLicenses(),
          branchStorage.getBranches(),
          departmentStorage.getDepartments(),
          signatoryStorage.getSignatories(),
        ]);

        if (isMounted) {
          setCompanies(loadedCompanies);
          setDocuments(loadedDocs);
          setBranches(loadedBranches);
          setDepartments(loadedDepts);
          setSignatories(loadedSigs);
        }
      } catch (err: any) {
        console.error('[CompaniesModule] Error loading remote data from Cloudflare D1:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadRemoteData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Cross-Tab Interaction State
  const [preselectedCompanyIdForDoc, setPreselectedCompanyIdForDoc] = useState<string | null>(null);

  // Toast Notification
  const [toast, setToast] = useState<{ msg: string; isError?: boolean } | null>(null);
  const showToast = (msg: string, isError = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 4000);
  };

  // --- Companies CRUD with Real Persistence (Master Data Only) ---
  const handleAddCompany = async (newComp: CompanyEntity) => {
    try {
      await companyStorage.saveCompany(newComp, userName);
      const refreshed = await companyStorage.getCompanies();
      setCompanies(refreshed);
      showToast(isRtl ? `تم تسجيل "${newComp.nameAr}" في قاعدة بيانات Cloudflare D1 بنجاح` : 'Company saved to Cloudflare D1');
    } catch (err: any) {
      showToast(err.message || 'فشل حفظ الشركة في قاعدة البيانات السحابية', true);
      throw err;
    }
  };

  const handleUpdateCompany = async (updated: CompanyEntity) => {
    try {
      await companyStorage.saveCompany(updated, userName);
      const refreshed = await companyStorage.getCompanies();
      setCompanies(refreshed);
      showToast(isRtl ? `تم تحديث بيانات "${updated.nameAr}" في Cloudflare D1` : 'Company updated in Cloudflare D1');
    } catch (err: any) {
      showToast(err.message || 'فشل تحديث بيانات الشركة في قاعدة البيانات', true);
      throw err;
    }
  };

  const handleDeleteCompany = async (id: string) => {
    const comp = companies.find(c => c.id === id);
    try {
      await companyStorage.deleteCompany(id, userName);
      const refreshed = await companyStorage.getCompanies();
      setCompanies(refreshed);
      showToast(isRtl ? `تم حذف "${comp?.nameAr || 'الشركة'}" من Cloudflare D1` : 'Company deleted from Cloudflare D1');
    } catch (err: any) {
      showToast(err.message || 'فشل حذف الشركة من قاعدة البيانات', true);
      throw err;
    }
  };

  const handleToggleCompanyStatus = async (id: string) => {
    try {
      await companyStorage.toggleCompanyStatus(id, userName);
      const refreshed = await companyStorage.getCompanies();
      setCompanies(refreshed);
      showToast(isRtl ? 'تم تحديث حالة تفعيل الشركة في Cloudflare D1' : 'Company status updated in Cloudflare D1');
    } catch (err: any) {
      showToast(err.message || 'فشل تحديث حالة الشركة', true);
      throw err;
    }
  };

  const handleOpenAddDocumentForCompany = (comp: CompanyEntity) => {
    setPreselectedCompanyIdForDoc(comp.id);
    selectItem('companies', 'comp_licenses');
    showToast(isRtl ? `تم توجيهك إلى شاشة التراخيص لشركة "${comp.nameAr}"` : 'Redirected to licenses');
  };

  // --- Smart Documents CRUD with Real Persistence & Audit Log ---
  const handleAddDocument = async (newDoc: SmartDocument) => {
    try {
      await licenseStorage.saveLicense(newDoc, userName);
      const refreshed = await licenseStorage.getLicenses();
      setDocuments(refreshed);
      showToast(isRtl ? `تم تسجيل ترخيص/مستند "${newDoc.titleAr}" في Cloudflare D1` : 'Document added to Cloudflare D1');
    } catch (err: any) {
      showToast(err.message || 'فشل حفظ المستند في قاعدة البيانات', true);
      throw err;
    }
  };

  const handleUpdateDocument = async (updated: SmartDocument) => {
    try {
      await licenseStorage.saveLicense(updated, userName);
      const refreshed = await licenseStorage.getLicenses();
      setDocuments(refreshed);
      showToast(isRtl ? `تم تحديث المستند رقم "${updated.docNumber}" في Cloudflare D1` : 'Document updated in Cloudflare D1');
    } catch (err: any) {
      showToast(err.message || 'فشل تحديث المستند في قاعدة البيانات', true);
      throw err;
    }
  };

  const handleDeleteDocument = async (id: string) => {
    const doc = documents.find(d => d.id === id);
    try {
      await licenseStorage.deleteLicense(id, userName);
      const refreshed = await licenseStorage.getLicenses();
      setDocuments(refreshed);
      showToast(isRtl ? `تم حذف المستند "${doc?.titleAr || 'الترخيص'}" نهائياً من Cloudflare D1` : 'Document deleted');
    } catch (err: any) {
      showToast(err.message || 'فشل حذف المستند', true);
      throw err;
    }
  };

  // --- Branches CRUD with Real Persistence & Audit Log ---
  const handleAddBranch = async (newBranch: BranchLocation) => {
    try {
      await branchStorage.saveBranch(newBranch, userName);
      const refreshed = await branchStorage.getBranches();
      setBranches(refreshed);
      showToast(isRtl ? `تمت إضافة المقر/الموقع "${newBranch.nameAr}" في Cloudflare D1` : 'Branch saved to Cloudflare D1');
    } catch (err: any) {
      showToast(err.message || 'فشل حفظ المقر في قاعدة البيانات', true);
      throw err;
    }
  };

  const handleUpdateBranch = async (updated: BranchLocation) => {
    try {
      await branchStorage.saveBranch(updated, userName);
      const refreshed = await branchStorage.getBranches();
      setBranches(refreshed);
      showToast(isRtl ? `تم تحديث بيانات المقر "${updated.nameAr}" في Cloudflare D1` : 'Branch updated in Cloudflare D1');
    } catch (err: any) {
      showToast(err.message || 'فشل تحديث بيانات المقر', true);
      throw err;
    }
  };

  const handleDeleteBranch = async (id: string) => {
    const branch = branches.find(b => b.id === id);
    try {
      await branchStorage.deleteBranch(id, userName);
      const refreshed = await branchStorage.getBranches();
      setBranches(refreshed);
      showToast(isRtl ? `تم حذف المقر "${branch?.nameAr || 'الموقع'}" نهائياً من Cloudflare D1` : 'Branch deleted');
    } catch (err: any) {
      showToast(err.message || 'فشل حذف المقر', true);
      throw err;
    }
  };

  // --- Departments CRUD with Real Persistence & Audit Log ---
  const handleAddDepartment = async (newDept: Partial<DepartmentOrg> & { nameAr: string; code: string }) => {
    try {
      await departmentStorage.saveDepartment(newDept, userName);
      const refreshed = await departmentStorage.getDepartments();
      setDepartments(refreshed);
      showToast(isRtl ? `تمت إضافة الإدارة "${newDept.nameAr}" في Cloudflare D1 بنجاح` : 'Department added to Cloudflare D1');
    } catch (err: any) {
      showToast(err.message || 'فشل حفظ الإدارة في قاعدة البيانات', true);
      throw err;
    }
  };

  const handleUpdateDepartment = async (updated: Partial<DepartmentOrg> & { nameAr: string; code: string }) => {
    try {
      await departmentStorage.saveDepartment(updated, userName);
      const refreshed = await departmentStorage.getDepartments();
      setDepartments(refreshed);
      showToast(isRtl ? `تم تحديث بيانات "${updated.nameAr}" في Cloudflare D1` : 'Department updated in Cloudflare D1');
    } catch (err: any) {
      showToast(err.message || 'فشل تحديث بيانات الإدارة', true);
      throw err;
    }
  };

  const handleDeleteDepartment = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const dept = departments.find(d => d.id === id);
      await departmentStorage.deleteDepartment(id, userName);
      const refreshed = await departmentStorage.getDepartments();
      setDepartments(refreshed);
      showToast(isRtl ? `تم حذف الإدارة "${dept?.nameAr || ''}" نهائياً من Cloudflare D1` : 'Department deleted');
      return { success: true };
    } catch (err: any) {
      const msg = err.message || 'حدث خطأ أثناء حذف الإدارة';
      showToast(msg, true);
      return { success: false, error: msg };
    }
  };

  const handleReloadDepartments = async () => {
    try {
      const refreshed = await departmentStorage.getDepartments();
      setDepartments(refreshed);
    } catch (err) {
      console.warn('[CompaniesModule] Error reloading departments:', err);
    }
  };

  // --- Signatories CRUD with Real Persistence & Audit Log ---
  const handleAddSignatory = async (newSig: AuthorizedSignatory) => {
    try {
      await signatoryStorage.saveSignatory(newSig, userName);
      const refreshed = await signatoryStorage.getSignatories();
      setSignatories(refreshed);
      showToast(isRtl ? `تم اعتماد وتفويض "${newSig.nameAr}" في Cloudflare D1` : 'Signatory saved to Cloudflare D1');
    } catch (err: any) {
      showToast(err.message || 'فشل حفظ بيانات المفوض في قاعدة البيانات', true);
      throw err;
    }
  };

  const handleUpdateSignatory = async (updated: AuthorizedSignatory) => {
    try {
      await signatoryStorage.saveSignatory(updated, userName);
      const refreshed = await signatoryStorage.getSignatories();
      setSignatories(refreshed);
      showToast(isRtl ? `تم تحديث بيانات وصلاحيات "${updated.nameAr}" في Cloudflare D1` : 'Signatory updated in Cloudflare D1');
    } catch (err: any) {
      showToast(err.message || 'فشل تحديث بيانات المفوض', true);
      throw err;
    }
  };

  const handleDeleteSignatory = async (id: string) => {
    const sig = signatories.find(s => s.id === id);
    try {
      await signatoryStorage.deleteSignatory(id, userName);
      const refreshed = await signatoryStorage.getSignatories();
      setSignatories(refreshed);
      showToast(isRtl ? `تم حذف المفوض "${sig?.nameAr || ''}" من Cloudflare D1` : 'Signatory removed');
    } catch (err: any) {
      showToast(err.message || 'فشل حذف المفوض', true);
      throw err;
    }
  };

  const handleToggleRevoke = async (id: string) => {
    try {
      const updated = await signatoryStorage.toggleRevoke(id, userName);
      const refreshed = await signatoryStorage.getSignatories();
      setSignatories(refreshed);
      showToast(isRtl ? (updated.status === 'active' ? 'تمت إعادة تفعيل سريان التفويض' : 'تم إلغاء سريان التفويض رسمياً') : 'Delegation status toggled');
    } catch (err: any) {
      showToast(err.message || 'فشل تحديث حالة التفويض', true);
      throw err;
    }
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
            className={`fixed top-20 z-50 left-1/2 -translate-x-1/2 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-2xl flex items-center gap-2.5 backdrop-blur-md ${
              toast.isError
                ? 'bg-rose-900/90 border border-rose-500/60'
                : 'bg-[#1C291E] border border-[#D97706]/50'
            }`}
          >
            {toast.isError ? (
              <AlertTriangle className="w-4 h-4 text-rose-300" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-[#D97706]" />
            )}
            <span>{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cloudflare D1 Remote Loading Skeleton */}
      {isLoading ? (
        <div className="space-y-4 animate-pulse p-4 sm:p-6 rounded-2xl bg-white/50 dark:bg-stone-900/40 border border-slate-200/60 dark:border-stone-800">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-stone-800">
            <div className="flex items-center gap-2.5">
              <Loader2 className="w-5 h-5 text-amber-600 animate-spin" />
              <div className="h-5 bg-slate-200 dark:bg-stone-800 rounded-md w-48" />
            </div>
            <div className="h-8 bg-slate-200 dark:bg-stone-800 rounded-lg w-28" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="h-20 bg-slate-100 dark:bg-stone-900/60 rounded-xl" />
            <div className="h-20 bg-slate-100 dark:bg-stone-900/60 rounded-xl" />
            <div className="h-20 bg-slate-100 dark:bg-stone-900/60 rounded-xl" />
            <div className="h-20 bg-slate-100 dark:bg-stone-900/60 rounded-xl" />
          </div>
          <div className="space-y-3 pt-3">
            <div className="h-32 bg-slate-100 dark:bg-stone-900/60 rounded-2xl border border-slate-200/60 dark:border-stone-800" />
            <div className="h-32 bg-slate-100 dark:bg-stone-900/60 rounded-2xl border border-slate-200/60 dark:border-stone-800" />
          </div>
        </div>
      ) : permittedTabs.length === 0 ? (
        <div className="p-8 sm:p-12 rounded-2xl bg-white dark:bg-[#121B14] border border-[#E0D9CB] dark:border-[#243628] text-center space-y-3 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-[#D99B26] flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h3 className="text-base font-extrabold text-[#1A241C] dark:text-[#F3EFE6]">
            {isRtl ? 'غير مصرح بعرض موديول إدارة الشركات' : 'Access Restricted'}
          </h3>
          <p className="text-xs text-[#5C665E] dark:text-[#8FA392] max-w-md mx-auto">
            {isRtl
              ? 'حسابك الحالي لا يمتلك أي صلاحيات عرض لأقسام دليل الشركات أو التراخيص أو الفروع أو الهيكل أو المفوضين. يرجى التواصل مع الإدارة العليا أو مدير النظام لتخصيص الصلاحيات.'
              : 'You do not have permission to view any submodules within Company Management. Please contact your system administrator.'}
          </p>
        </div>
      ) : (
        <>
          {/* Sub-Route Tab 1: دليل الشركات وهيكل المساهمين */}
          {currentTab === 'comp_directory' && hasPermission('companies.directory.view') && (
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
          {currentTab === 'comp_licenses' && hasPermission('companies.licenses.view') && (
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
          {currentTab === 'comp_branches' && hasPermission('companies.branches.view') && (
            <CompanyBranchesTab
              branches={branches}
              companies={companies}
              onAddBranch={handleAddBranch}
              onUpdateBranch={handleUpdateBranch}
              onDeleteBranch={handleDeleteBranch}
            />
          )}

          {/* Sub-Route Tab 4: الهيكل التنظيمي وشجرة الإدارات */}
          {currentTab === 'comp_structure' && hasPermission('companies.org.view') && (
            <CompanyOrgStructureTab
              departments={departments}
              companies={companies}
              branches={branches}
              onAddDepartment={handleAddDepartment}
              onUpdateDepartment={handleUpdateDepartment}
              onDeleteDepartment={handleDeleteDepartment}
              onReloadDepartments={handleReloadDepartments}
            />
          )}

          {/* Sub-Route Tab 5: المفوضون ومصفوفة الصلاحيات */}
          {currentTab === 'comp_signatories' && hasPermission('companies.signatories.view') && (
            <CompanySignatoriesTab
              signatories={signatories}
              companies={companies}
              onAddSignatory={handleAddSignatory}
              onUpdateSignatory={handleUpdateSignatory}
              onDeleteSignatory={handleDeleteSignatory}
              onToggleRevoke={handleToggleRevoke}
            />
          )}
        </>
      )}
    </div>
  );
};
