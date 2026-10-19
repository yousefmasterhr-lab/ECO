import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { Company } from '../types';
import { TaxJurisdiction, TaxJurisdictionConfig, TAX_JURISDICTIONS } from '../utils/taxEngine';
import { companyStorage } from '../components/modules/companies/companyStorage';
import { CompanyEntity } from '../components/modules/companies/types';

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

function mapEntitiesToCompanies(entities: CompanyEntity[]): Company[] {
  if (!entities || entities.length === 0) return COMPANIES_LIST;
  return entities.map((c, idx) => ({
    id: c.id,
    code: c.crNumber || `COMP-${idx + 1}`,
    nameAr: c.nameAr,
    nameEn: c.nameAr,
    badgeAr: c.legalType || 'شركة مسجلة',
    badgeEn: c.legalType || 'Registered Company',
    logoColor: idx % 4 === 0 ? '#3B7A57' : idx % 4 === 1 ? '#0D9488' : idx % 4 === 2 ? '#B45309' : '#D99B26',
    jurisdiction: 'EGYPT',
    taxNo: c.taxNumber,
    commercialReg: c.crNumber ? `س.ت: ${c.crNumber} ${c.crOffice || ''}`.trim() : undefined,
    currency: 'EGP',
    currencySymbol: 'ج.م',
  }));
}

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

import { useAuth } from './AuthContext';

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [rawCompanies, setRawCompanies] = useState<Company[]>(() => {
    try {
      const cached = companyStorage.getCompaniesSync();
      return cached.length > 0 ? mapEntitiesToCompanies(cached) : COMPANIES_LIST;
    } catch {
      return COMPANIES_LIST;
    }
  });

  const isSuperAdmin = useMemo(() => {
    if (!user) return false;
    return (
      user.id === 'usr_root_csuite_01' ||
      user.id === 'usr_root_csuite' ||
      user.username === 'admin' ||
      user.email === 'admin@hrsup.com'
    );
  }, [user]);

  // Strictly filter authorized companies against user.allowedCompanyIds
  const companies: Company[] = useMemo(() => {
    if (!user) return rawCompanies;
    if (isSuperAdmin) return rawCompanies;

    const allowed = user.allowedCompanyIds;
    if (!allowed || allowed.length === 0 || allowed.includes('all')) {
      return [rawCompanies[0] || COMPANIES_LIST[0]!];
    }

    const filtered = rawCompanies.filter(c =>
      allowed.includes(c.id) ||
      allowed.includes(c.code) ||
      allowed.some(aId => {
        const cleanA = aId.trim().toLowerCase();
        const cleanId = c.id.trim().toLowerCase();
        const cleanCode = (c.code || '').trim().toLowerCase();
        const cleanName = (c.nameAr || '').trim().toLowerCase();
        return cleanId === cleanA || cleanCode === cleanA || cleanName.includes(cleanA) || cleanA.includes(cleanName);
      })
    );

    return filtered.length > 0 ? filtered : [rawCompanies[0] || COMPANIES_LIST[0]!];
  }, [rawCompanies, user, isSuperAdmin]);

  // Default to selecting all authorized companies
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<string[]>(() =>
    companies.map(c => c.id)
  );

  // Sync selected companies when authorized companies list changes
  useEffect(() => {
    setSelectedCompanyIds(prev => {
      const valid = prev.filter(id => companies.some(c => c.id === id));
      return valid.length > 0 ? valid : companies.map(c => c.id);
    });
  }, [companies]);

  // Sync with live Cloudflare D1 companies count and updates
  useEffect(() => {
    let isMounted = true;

    const syncLiveCompanies = async () => {
      try {
        const liveEntities = await companyStorage.getCompanies();
        if (isMounted && liveEntities && liveEntities.length > 0) {
          const mapped = mapEntitiesToCompanies(liveEntities);
          setRawCompanies(mapped);
        }
      } catch (err) {
        console.warn('[TenantContext] Error fetching live D1 companies:', err);
      }
    };

    syncLiveCompanies();

    const handleUpdate = () => {
      const cached = companyStorage.getCompaniesSync();
      if (cached && cached.length > 0) {
        const mapped = mapEntitiesToCompanies(cached);
        setRawCompanies(mapped);
      }
    };

    window.addEventListener('eco-companies-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('eco-companies-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const isAllSelected = selectedCompanyIds.length === companies.length;

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
    setSelectedCompanyIds(companies.map(c => c.id));
  };

  const deselectAllCompanies = () => {
    // Keep at least the primary company
    setSelectedCompanyIds([companies[0]?.id || COMPANIES_LIST[0]!.id]);
  };

  const toggleSelectAll = () => {
    if (isAllSelected) {
      deselectAllCompanies();
    } else {
      selectAllCompanies();
    }
  };

  const selectedCompanies = companies.filter(c => selectedCompanyIds.includes(c.id));
  const activeCompany = selectedCompanies[0] || companies[0] || COMPANIES_LIST[0]!;

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

  if (companies.length === 1) {
    selectionSummaryAr = companies[0].nameAr;
    selectionSummaryEn = companies[0].nameEn;
  } else if (selectedCompanyIds.length === companies.length) {
    selectionSummaryAr = `جميع الشركات (${companies.length})`;
    selectionSummaryEn = `All Companies (${companies.length})`;
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
        companies,
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
