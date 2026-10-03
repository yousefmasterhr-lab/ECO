import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CompanyOption {
  id: string;
  nameAr: string;
  nameEn: string;
  code: string;
  currency: string;
}

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  roleAr: string;
  clearanceLevel: 1 | 2 | 3 | 4;
  department: string;
}

export interface ExpirationAlert {
  id: string;
  module: 'LEGAL' | 'ENGINEERING' | 'INSURANCE' | 'CTS';
  moduleAr: string;
  title: string;
  titleAr: string;
  expiryDate: string;
  daysRemaining: number;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  assignedTo: string;
}

interface AppContextType {
  activeCompany: CompanyOption;
  setActiveCompany: (company: CompanyOption) => void;
  availableCompanies: CompanyOption[];
  language: 'ar' | 'en';
  setLanguage: (lang: 'ar' | 'en') => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  user: UserProfile;
  activeModule: string;
  setActiveModule: (module: string) => void;
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  expirations: ExpirationAlert[];
  isExpirationsOpen: boolean;
  setIsExpirationsOpen: (open: boolean) => void;
  previewDriveFile: (fileId: string, fileName: string) => void;
  drivePreview: { isOpen: boolean; fileId: string; fileName: string } | null;
  closeDrivePreview: () => void;
}

const COMPANIES: CompanyOption[] = [
  { id: 'cmp_holding_01', nameAr: 'مجموعة أركان القابضة (الشركة الأم)', nameEn: 'Arkan Holdings Group (Parent)', code: 'ARK-HOLD', currency: 'EGP' },
  { id: 'cmp_construction_02', nameAr: 'أركان للإنشاءات الهندسية والمقاولات', nameEn: 'Arkan Engineering & Construction', code: 'ARK-ENG', currency: 'EGP' },
  { id: 'cmp_realestate_03', nameAr: 'أركان للتطوير العقاري والاستثمار', nameEn: 'Arkan Real Estate Development', code: 'ARK-DEV', currency: 'EGP' }
];

const INITIAL_EXPIRATIONS: ExpirationAlert[] = [
  {
    id: 'exp_01',
    module: 'LEGAL',
    moduleAr: 'الشؤون القانونية',
    title: 'Court Appeal Deadline - Lawsuit 412/2026 (Commercial Circuit)',
    titleAr: 'الميعاد القانوني للطعن بالاستئناف - الدعوى 412/2026 (تجاري كلي)',
    expiryDate: '2026-09-26',
    daysRemaining: 7,
    severity: 'CRITICAL',
    assignedTo: 'المستشار القانوني: طارق منصور'
  },
  {
    id: 'exp_02',
    module: 'ENGINEERING',
    moduleAr: 'المكتب الفني',
    title: 'Civil Defense & Building License Renewal - Tower Project Alpha',
    titleAr: 'تجديد تصريح الدفاع المدني ورخصة البناء - مشروع البرج الإداري أ',
    expiryDate: '2026-10-04',
    daysRemaining: 15,
    severity: 'WARNING',
    assignedTo: 'م. أحمد شكري (مدير المشروع)'
  },
  {
    id: 'exp_03',
    module: 'INSURANCE',
    moduleAr: 'التأمينات الاجتماعية',
    title: 'Annual Wage Adjustment (Form 2) Filing Deadline',
    titleAr: 'سداد واعتماد استمارة (2) تأمينات للأجور السنوية المحدثة',
    expiryDate: '2026-10-18',
    daysRemaining: 29,
    severity: 'WARNING',
    assignedTo: 'أ/ محمود عزمي (مسؤول التأمينات)'
  },
  {
    id: 'exp_04',
    module: 'LEGAL',
    moduleAr: 'الشؤون القانونية',
    title: 'General Contracting Agreement Renewal - Subcontractor Steel Supply',
    titleAr: 'انتهاء سريان عقد توريد حديد التسليح - شركة الدلتا للصلب',
    expiryDate: '2026-11-15',
    daysRemaining: 57,
    severity: 'INFO',
    assignedTo: 'إدارة العقود المركزية'
  }
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeCompany, setActiveCompany] = useState<CompanyOption>(COMPANIES[0]!);
  const [language, setLanguageState] = useState<'ar' | 'en'>('ar');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [activeModule, setActiveModule] = useState<string>('executive');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isExpirationsOpen, setIsExpirationsOpen] = useState<boolean>(false);
  const [expirations] = useState<ExpirationAlert[]>(INITIAL_EXPIRATIONS);
  const [drivePreview, setDrivePreview] = useState<{ isOpen: boolean; fileId: string; fileName: string } | null>(null);

  const [user] = useState<UserProfile>({
    name: 'م. طارق منصور الشناوي',
    email: 't.mansour@arkan-group.com',
    role: 'C_SUITE_EXECUTIVE',
    roleAr: 'الرئيس التنفيذي / صلاحية المستوى 4',
    clearanceLevel: 4,
    department: 'EXECUTIVE'
  });

  const setLanguage = (lang: 'ar' | 'en') => {
    setLanguageState(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => !prev);
  };

  const previewDriveFile = (fileId: string, fileName: string) => {
    setDrivePreview({ isOpen: true, fileId, fileName });
  };

  const closeDrivePreview = () => {
    setDrivePreview(null);
  };

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('data-theme', theme);
  }, []);

  return (
    <AppContext.Provider
      value={{
        activeCompany,
        setActiveCompany,
        availableCompanies: COMPANIES,
        language,
        setLanguage,
        theme,
        toggleTheme,
        user,
        activeModule,
        setActiveModule,
        isSidebarCollapsed,
        toggleSidebar,
        expirations,
        isExpirationsOpen,
        setIsExpirationsOpen,
        previewDriveFile,
        drivePreview,
        closeDrivePreview
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
