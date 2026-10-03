import React, { createContext, useContext, useState, useMemo } from 'react';
import { Company } from '../types';
import { TaxJurisdiction, TaxJurisdictionConfig, TAX_JURISDICTIONS } from '../utils/taxEngine';

export const COMPANIES_LIST: Company[] = [
  {
    id: 'comp_01',
    code: 'ARKAN-CON',
    nameAr: 'شركة أركان للإنشاءات الهندسية (المملكة)',
    nameEn: 'Arkan Engineering Construction (KSA)',
    badgeAr: 'المقاول الرئيسي - السعودية',
    badgeEn: 'Main Contractor - KSA',
    logoColor: '#3B7A57',
    jurisdiction: 'KSA',
    taxNo: '310123456789003',
    commercialReg: 'س.ت: 1010456789 الرياض',
    addressAr: 'طريق الملك فهد - حي العليا - الرياض 12214 - المملكة العربية السعودية',
    currency: 'SAR',
    currencySymbol: 'ر.س',
  },
  {
    id: 'comp_02',
    code: 'DAR-CONSULT',
    nameAr: 'شركة أركان للاستشارات والإنشاءات (مصر)',
    nameEn: 'Arkan Engineering Consultants (Egypt)',
    badgeAr: 'المكتب الاستشاري - مصر',
    badgeEn: 'Consultant - Egypt',
    logoColor: '#0D9488',
    jurisdiction: 'EGYPT',
    taxNo: '300-123-456',
    commercialReg: 'س.ت: 44921 القاهرة',
    addressAr: 'طريق النصر - مبنى أركان الإداري - القاهرة - مصر',
    currency: 'EGP',
    currencySymbol: 'ج.م',
  },
  {
    id: 'comp_03',
    code: 'RE-DEV-GRP',
    nameAr: 'المجموعة العقارية للاستثمار والتطوير (الخليج)',
    nameEn: 'Real Estate Investment Group (Gulf)',
    badgeAr: 'الجهة المالكة - ZATCA',
    badgeEn: 'Client / Owner - KSA',
    logoColor: '#B45309',
    jurisdiction: 'KSA',
    taxNo: '310987654321003',
    commercialReg: 'س.ت: 1010998877 الرياض',
    addressAr: 'طريق الملك عبدالعزيز - الرياض - المملكة العربية السعودية',
    currency: 'SAR',
    currencySymbol: 'ر.س',
  },
  {
    id: 'comp_04',
    code: 'ARKAN-INFRA',
    nameAr: 'أركان لإدارة المشروعات والبنية التحتية (مصر)',
    nameEn: 'Arkan Infrastructure Management (Egypt)',
    badgeAr: 'إدارة المشروعات - ETA',
    badgeEn: 'Project Management - Egypt',
    logoColor: '#D99B26',
    jurisdiction: 'EGYPT',
    taxNo: '100-245-890',
    commercialReg: 'س.ت: 55812 الجيزة',
    addressAr: 'المنطقة الصناعية الثالثة - 6 أكتوبر - الجيزة - مصر',
    currency: 'EGP',
    currencySymbol: 'ج.م',
  },
];

interface TenantContextType {
  companies: Company[];
  selectedCompanyIds: string[];
  selectedCompanies: Company[];
  isAllSelected: boolean;
  toggleCompany: (id: string) => void;
  selectAllCompanies: () => void;
  deselectAllCompanies: () => void;
  toggleSelectAll: () => void;
  activeCompany: Company;
  setActiveCompany: (company: Company) => void;
  selectionSummaryAr: string;
  selectionSummaryEn: string;
  activeJurisdiction: TaxJurisdiction;
  setActiveJurisdiction: (j: TaxJurisdiction) => void;
  taxConfig: TaxJurisdictionConfig;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to selecting all companies
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<string[]>(() =>
    COMPANIES_LIST.map(c => c.id)
  );

  const isAllSelected = selectedCompanyIds.length === COMPANIES_LIST.length;

  const toggleCompany = (id: string) => {
    setSelectedCompanyIds(prev => {
      if (prev.includes(id)) {
        // Prevent deselecting all (keep at least one company selected)
        if (prev.length === 1) return prev;
        return prev.filter(cId => cId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const selectAllCompanies = () => {
    setSelectedCompanyIds(COMPANIES_LIST.map(c => c.id));
  };

  const deselectAllCompanies = () => {
    // Keep at least the primary company
    setSelectedCompanyIds([COMPANIES_LIST[0]!.id]);
  };

  const toggleSelectAll = () => {
    if (isAllSelected) {
      deselectAllCompanies();
    } else {
      selectAllCompanies();
    }
  };

  const selectedCompanies = COMPANIES_LIST.filter(c => selectedCompanyIds.includes(c.id));
  const activeCompany = selectedCompanies[0] || COMPANIES_LIST[0]!;

  // Explicit jurisdiction override or defaulting to active company jurisdiction
  const [overrideJurisdiction, setOverrideJurisdiction] = useState<TaxJurisdiction | null>(null);

  const activeJurisdiction: TaxJurisdiction = overrideJurisdiction || activeCompany.jurisdiction || 'KSA';
  const taxConfig: TaxJurisdictionConfig = useMemo(
    () => TAX_JURISDICTIONS[activeJurisdiction],
    [activeJurisdiction]
  );

  const setActiveCompany = (company: Company) => {
    setSelectedCompanyIds([company.id]);
    if (company.jurisdiction) {
      setOverrideJurisdiction(company.jurisdiction);
    }
  };

  const setActiveJurisdiction = (j: TaxJurisdiction) => {
    setOverrideJurisdiction(j);
  };

  // Summary labels for the selector trigger
  let selectionSummaryAr = '';
  let selectionSummaryEn = '';

  if (selectedCompanyIds.length === COMPANIES_LIST.length) {
    selectionSummaryAr = `جميع الشركات (${COMPANIES_LIST.length})`;
    selectionSummaryEn = `All Companies (${COMPANIES_LIST.length})`;
  } else if (selectedCompanyIds.length === 1) {
    selectionSummaryAr = activeCompany.nameAr;
    selectionSummaryEn = activeCompany.nameEn;
  } else {
    selectionSummaryAr = `تم تحديد (${selectedCompanyIds.length}) شركات`;
    selectionSummaryEn = `${selectedCompanyIds.length} Companies Selected`;
  }

  return (
    <TenantContext.Provider
      value={{
        companies: COMPANIES_LIST,
        selectedCompanyIds,
        selectedCompanies,
        isAllSelected,
        toggleCompany,
        selectAllCompanies,
        deselectAllCompanies,
        toggleSelectAll,
        activeCompany,
        setActiveCompany,
        selectionSummaryAr,
        selectionSummaryEn,
        activeJurisdiction,
        setActiveJurisdiction,
        taxConfig,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = (): TenantContextType => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};
