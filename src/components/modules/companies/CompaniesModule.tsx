import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../../context/LanguageContext';
import { useNavigation } from '../../../context/NavigationContext';
import { CheckCircle2 } from 'lucide-react';
import {
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
import { companyStorage } from './companyStorage';
import { licenseStorage } from './licenseStorage';
import { branchStorage } from './branchStorage';
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
  const [departments] = useState(INITIAL_DEPARTMENTS);
  const [costCenters, setCostCenters] = useState<CostCenter[]>(INITIAL_COST_CENTERS);
  const [signatories, setSignatories] = useState<AuthorizedSignatory[]>(INITIAL_SIGNATORIES);

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
  }, []);

  // Cross-Tab Interaction State
  const [preselectedCompanyIdForDoc, setPreselectedCompanyIdForDoc] = useState<string | null>(null);

  // Toast Notification
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // --- Bi-directional Sync: Auto-sync Company CR, Tax Card, and uploaded docs to Licenses ---
  const syncCompanyToLicenses = async (comp: CompanyEntity, uName: string) => {
    const existingLicenses = licenseStorage.getLicensesSync();

    // 1. Sync Commercial Register (السجل التجاري)
    if (comp.crNumber && comp.crNumber.trim()) {
      const existingCR = existingLicenses.find(
        l => l.companyId === comp.id && l.docType === 'سجل تجاري'
      );
      const attachedCRDoc = comp.documents?.find(d => d.docType === 'السجل التجاري');

      if (existingCR) {
        await licenseStorage.saveLicense(
          {
            ...existingCR,
            companyNameAr: comp.nameAr,
            docNumber: comp.crNumber.trim(),
            issuerAr: comp.crOffice?.trim() || existingCR.issuerAr || 'مصلحة السجل التجاري',
            fileAttachment: attachedCRDoc || existingCR.fileAttachment
          },
          uName
        );
      } else {
        await licenseStorage.saveLicense(
          {
            companyId: comp.id,
            companyNameAr: comp.nameAr,
            docType: 'سجل تجاري',
            titleAr: `السجل التجاري الرسمي - ${comp.nameAr}`,
            docNumber: comp.crNumber.trim(),
            issuerAr: comp.crOffice?.trim() || 'مصلحة السجل التجاري',
            issueDate: comp.establishedYear ? `${comp.establishedYear}-01-01` : new Date().toISOString().slice(0, 10),
            expiryDate: '', // Draft awaiting expiry date entry
            notesAr: 'تمت المزامنة آلياً من دليل الشركات - بانتظار استكمال تاريخ الانتهاء',
            fileAttachment: attachedCRDoc
          },
          uName
        );
      }
    }

    // 2. Sync Tax Card (البطاقة الضريبية)
    if (comp.taxNumber && comp.taxNumber.trim()) {
      const existingTax = existingLicenses.find(
        l => l.companyId === comp.id && l.docType === 'بطاقة ضريبية'
      );
      const attachedTaxDoc = comp.documents?.find(d => d.docType === 'البطاقة الضريبية');

      if (existingTax) {
        await licenseStorage.saveLicense(
          {
            ...existingTax,
            companyNameAr: comp.nameAr,
            docNumber: comp.taxNumber.trim(),
            issuerAr: existingTax.issuerAr || 'مصلحة الضرائب المصرية',
            fileAttachment: attachedTaxDoc || existingTax.fileAttachment
          },
          uName
        );
      } else {
        await licenseStorage.saveLicense(
          {
            companyId: comp.id,
            companyNameAr: comp.nameAr,
            docType: 'بطاقة ضريبية',
            titleAr: `البطاقة الضريبية - ${comp.nameAr}`,
            docNumber: comp.taxNumber.trim(),
            issuerAr: 'مصلحة الضرائب المصرية',
            issueDate: comp.establishedYear ? `${comp.establishedYear}-01-01` : new Date().toISOString().slice(0, 10),
            expiryDate: '', // Draft awaiting expiry date entry
            notesAr: 'تمت المزامنة آلياً من دليل الشركات - بانتظار استكمال تاريخ الانتهاء',
            fileAttachment: attachedTaxDoc
          },
          uName
        );
      }
    }

    // 3. Sync other uploaded files (عقد التأسيس، تراخيص مزاولة النشاط، القيمة المضافة)
    if (comp.documents && comp.documents.length > 0) {
      for (const doc of comp.documents) {
        if (doc.docType === 'السجل التجاري' || doc.docType === 'البطاقة الضريبية') continue;
        const existingOther = existingLicenses.find(
          l => l.companyId === comp.id && (l.fileAttachment?.id === doc.id || l.titleAr.includes(doc.name))
        );
        if (!existingOther) {
          await licenseStorage.saveLicense(
            {
              companyId: comp.id,
              companyNameAr: comp.nameAr,
              docType: doc.docType || 'وثيقة رسمية',
              titleAr: `${doc.docType || 'مستند'} - ${doc.name}`,
              docNumber: `DOC-${Date.now().toString().slice(-5)}`,
              issuerAr: 'الجهة المصدرة للوثيقة',
              issueDate: new Date().toISOString().slice(0, 10),
              expiryDate: '',
              notesAr: 'تمت أرشفته ومزامنته آلياً من مرفقات دليل الشركات',
              fileAttachment: doc
            },
            uName
          );
        }
      }
    }
  };

  // --- Companies CRUD with Real Persistence & Bi-directional Sync ---
  const handleAddCompany = async (newComp: CompanyEntity) => {
    await companyStorage.saveCompany(newComp, userName);
    setCompanies(companyStorage.getCompaniesSync());
    await syncCompanyToLicenses(newComp, userName);
    setDocuments(licenseStorage.getLicensesSync());
    showToast(isRtl ? `تم تسجيل "${newComp.nameAr}" وتثبيت هيكل المساهمين والمستندات بنجاح` : 'Company registered successfully');
  };

  const handleUpdateCompany = async (updated: CompanyEntity) => {
    await companyStorage.saveCompany(updated, userName);
    setCompanies(companyStorage.getCompaniesSync());
    await syncCompanyToLicenses(updated, userName);
    setDocuments(licenseStorage.getLicensesSync());
    showToast(isRtl ? `تم تحديث بيانات "${updated.nameAr}" وهيكل الملكية والمستندات` : 'Company updated successfully');
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
