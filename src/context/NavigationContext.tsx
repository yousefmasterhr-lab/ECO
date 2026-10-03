import React, { createContext, useContext, useState, useEffect } from 'react';
import { DepartmentNavCategory, UserProfile } from '../types';

export const CURRENT_USER: UserProfile = {
  id: 'usr_csuite_01',
  nameAr: 'م. أحمد مصطفى',
  nameEn: 'Eng. Ahmed Mostafa',
  roleAr: 'الرئيس التنفيذي للعمليات',
  roleEn: 'Chief Operating Officer (COO)',
  clearanceLevel: 4,
  clearanceNameAr: 'المستوى 4 - إدارة عليا',
  clearanceNameEn: 'Level 4 - C-Suite',
};

export const DEPARTMENT_CATEGORIES: DepartmentNavCategory[] = [
  {
    id: 'executive',
    iconName: 'BarChart3',
    titleAr: 'الإدارة العليا والاستراتيجية',
    titleEn: 'Executive Overview & Strategy',
    colorVar: '#D99B26', // Warm Radiant Amber
    badgeAr: 'C-Suite',
    badgeEn: 'C-Suite',
    subItems: [
      { id: 'exec_kpi', titleAr: 'مؤشرات الأداء الموحدة', titleEn: 'Unified KPIs' },
      { id: 'exec_risks', titleAr: 'مصفوفة المخاطر المؤسسية', titleEn: 'Enterprise Risks' },
      { id: 'exec_financial', titleAr: 'التقرير المالي والتشغيلي', titleEn: 'Financial Overview' },
    ],
  },
  {
    id: 'companies',
    iconName: 'Building2',
    titleAr: 'إدارة الشركات',
    titleEn: 'Companies Management',
    colorVar: '#D97706', // Corporate Amber Bronze
    badgeAr: 'الشركات',
    badgeEn: 'Companies',
    subItems: [
      { id: 'comp_directory', titleAr: 'دليل الشركات', titleEn: 'Company Directory' },
      { id: 'comp_licenses', titleAr: 'السجلات والتراخيص', titleEn: 'Records & Licenses' },
      { id: 'comp_branches', titleAr: 'الفروع والمواقع', titleEn: 'Branches & Sites' },
      { id: 'comp_structure', titleAr: 'الهيكل ومراكز التكلفة', titleEn: 'Org & Cost Centers' },
      { id: 'comp_signatories', titleAr: 'المفوضون والصلاحيات', titleEn: 'Signatories & Powers' },
    ],
  },
  {
    id: 'finance',
    iconName: 'Landmark',
    titleAr: 'الشؤون المالية',
    titleEn: 'Financial Affairs',
    colorVar: '#059669', // Royal Emerald
    badgeAr: 'مالية',
    badgeEn: 'Finance',
    subItems: [
      { id: 'fin_chart', titleAr: 'الأستاذ العام والدليل المحاسبي', titleEn: 'Chart of Accounts & GL' },
      { id: 'fin_treasury', titleAr: 'الخزينة والبنوك والسيولة', titleEn: 'Treasury & Cash' },
      { id: 'fin_vouchers', titleAr: 'سندات القبض والصرف', titleEn: 'Receipt & Payment Vouchers' },
      { id: 'fin_cheques', titleAr: 'أوراق القبض والدفع والشيكات', titleEn: 'Commercial Paper & Cheques' },
      { id: 'fin_journals', titleAr: 'قيود اليومية العامة', titleEn: 'General Journal Entries' },
      { id: 'fin_sales', titleAr: 'المبيعات والفوترة الإلكترونية (ZATCA)', titleEn: 'Sales & E-Invoicing' },
      { id: 'fin_procurement', titleAr: 'المشتريات والمخزون المالي', titleEn: 'Procurement & Inventory' },
      { id: 'fin_costcenters', titleAr: 'مراكز التكلفة والأبعاد التحليلية', titleEn: 'Cost Centers & Dimensions' },
      { id: 'fin_contracts', titleAr: 'عقود المشروعات والارتباطات', titleEn: 'Project Contracts' },
      { id: 'fin_projects', titleAr: 'محاسبة المشروعات والمستخلصات', titleEn: 'Contracting & Extracts' },
      { id: 'fin_reports', titleAr: 'التقارير المالية والذكاء التحليلي', titleEn: 'Financial BI & Reports' },
    ],
  },
  {
    id: 'hr',
    iconName: 'Users',
    titleAr: 'إدارة الموارد البشرية (HRMS)',
    titleEn: 'Human Resources (HRMS)',
    colorVar: '#EBB34D', // Radiant Amber
    badgeAr: 'HRMS',
    badgeEn: 'HRMS',
    subItems: [
      { id: 'hr_directory', titleAr: 'دليل الموظفين', titleEn: 'Master Directory' },
      { id: 'hr_payroll', titleAr: 'مسير الرواتب', titleEn: 'Standard Payroll' },
      { id: 'hr_disbursement', titleAr: 'صرف الرواتب', titleEn: 'Disbursement Sheets' },
      { id: 'hr_contracts', titleAr: 'سجل العقود', titleEn: 'Contracts Ledger' },
      { id: 'hr_attendance', titleAr: 'الحضور والدوام', titleEn: 'Attendance Logs' },
      { id: 'hr_leaves', titleAr: 'رصيد الإجازات', titleEn: 'Time-Off Balance' },
      { id: 'hr_advances_requests', titleAr: 'طلبات السلف', titleEn: 'Advance Requests' },
      { id: 'hr_advances_active', titleAr: 'سجل السلف القائمة', titleEn: 'Active Advances' },
      { id: 'hr_recruitment', titleAr: 'طلبات التوظيف', titleEn: 'Recruitment' },
      { id: 'hr_penalties', titleAr: 'الحوافز والجزاءات', titleEn: 'Bonuses & Deductions' },
      { id: 'hr_missing_docs', titleAr: 'نواقص المستندات', titleEn: 'Missing Documents' },
      { id: 'hr_incomplete', titleAr: 'الملفات غير المكتملة', titleEn: 'Incomplete Dossiers' },
      { id: 'hr_approvals', titleAr: 'الطلبات والاعتمادات', titleEn: 'Approvals Hub' },
      { id: 'hr_settings', titleAr: 'إعدادات المنظومة', titleEn: 'HR Configuration' },
      { id: 'hr_audit', titleAr: 'سجل العمليات', titleEn: 'Audit Trail' },
      { id: 'hr_org_tree', titleAr: 'الهيكل التنظيمي العام', titleEn: 'Organization Tree' },
      { id: 'hr_payroll_ex', titleAr: 'Payroll - Ex', titleEn: 'Payroll - Ex' },
    ],
  },
  {
    id: 'engineering',
    iconName: 'HardHat',
    titleAr: 'المكتب الفني',
    titleEn: 'Technical Office',
    colorVar: '#3B7A57', // Forest Olive
    badgeAr: 'مشاريع',
    badgeEn: 'Projects',
    subItems: [
      { id: 'eng_projects', titleAr: 'سجل المشاريع', titleEn: 'Project Registry' },
      { id: 'eng_schedule', titleAr: 'الجدول الزمني', titleEn: 'Schedule & Milestones' },
      { id: 'eng_ipc', titleAr: 'المستخلصات', titleEn: 'Payment Certificates' },
      { id: 'eng_contractors', titleAr: 'المقاولون', titleEn: 'Contractors' },
      { id: 'eng_rfq', titleAr: 'عروض الأسعار', titleEn: 'Price Quotations' },
      { id: 'eng_po', titleAr: 'أوامر الشراء', titleEn: 'Purchase Orders' },
      { id: 'eng_boq', titleAr: 'حصر الكميات', titleEn: 'Bill of Quantities' },
      { id: 'eng_submittals', titleAr: 'الاعتمادات الفنية', titleEn: 'Technical Submittals' },
      { id: 'eng_rfi', titleAr: 'استفسارات الموقع', titleEn: 'Site Inquiries' },
    ],
  },
  {
    id: 'cts',
    iconName: 'Mail',
    titleAr: 'الصادر والوارد (CTS)',
    titleEn: 'Correspondence (CTS)',
    colorVar: '#0D9488', // Mineral Teal
    badgeAr: 'مراسلات',
    badgeEn: 'CTS',
    subItems: [
      { id: 'cts_overview', titleAr: 'لوحة المتابعة والمؤشرات', titleEn: 'Monitoring Dashboard' },
      { id: 'cts_log', titleAr: 'سجل المراسلات العام', titleEn: 'Correspondence Log' },
      { id: 'cts_incoming_new', titleAr: 'تسجيل وارد جديد', titleEn: 'New Incoming' },
      { id: 'cts_outgoing_draft', titleAr: 'مسودات واعتماد الصادر', titleEn: 'Outgoing Approvals' },
    ],
  },
  {
    id: 'legal',
    iconName: 'Scale',
    titleAr: 'الشؤون القانونية',
    titleEn: 'Legal Affairs',
    colorVar: '#B45309', // Amber Bronze
    badgeAr: 'قانونية',
    badgeEn: 'Legal',
    subItems: [
      {
        id: 'leg_contracts',
        titleAr: 'العقود',
        titleEn: 'Contracts Hub',
        children: [
          { id: 'leg_contracts_subcontractors', titleAr: 'عقود المقاولين والموردين', titleEn: 'Subcontractors & Suppliers' },
          { id: 'leg_contracts_employment', titleAr: 'عقود الموظفين والعمل', titleEn: 'Employment Contracts' },
          { id: 'leg_contracts_leases', titleAr: 'عقود الإيجار والخدمات', titleEn: 'Lease & Operational Agreements' },
        ],
      },
      { id: 'leg_cases', titleAr: 'القضايا والنزاعات', titleEn: 'Litigation & Disputes' },
      { id: 'leg_poa', titleAr: 'التوكيلات والتفويضات', titleEn: 'Powers of Attorney & Signatories' },
      { id: 'leg_advisory', titleAr: 'الاستشارات والمذكرات', titleEn: 'Legal Consultations & Memos' },
    ],
  },
  {
    id: 'insurance',
    iconName: 'ShieldCheck',
    titleAr: 'التأمينات الاجتماعية',
    titleEn: 'Social Insurance',
    colorVar: '#15803D', // Deep Emerald Olive
    badgeAr: 'تأمينات',
    badgeEn: 'Insurance',
    subItems: [
      { id: 'ins_forms', titleAr: 'استمارات (س1 / س2 / س6)', titleEn: 'Forms (S1 / S2 / S6)' },
      { id: 'ins_register', titleAr: 'السجل التأميني للعاملين', titleEn: 'Insured Employees' },
      { id: 'ins_wages', titleAr: 'وعاء الأجور والاشتراكات', titleEn: 'Wages & Dues' },
      { id: 'ins_compliance', titleAr: 'الفحص والامتثال الدوري', titleEn: 'Audit & Compliance' },
    ],
  },
  {
    id: 'ats',
    iconName: 'UserCheck',
    titleAr: 'استقطاب الكفاءات (ATS)',
    titleEn: 'Talent Acquisition (ATS)',
    colorVar: '#6366F1', // Indigo Accent
    badgeAr: 'توظيف',
    badgeEn: 'Hiring',
    subItems: [
      { id: 'ats_openings', titleAr: 'الوظائف الشاغرة', titleEn: 'Job Openings' },
      { id: 'ats_pipeline', titleAr: 'مسار المرشحين (Kanban)', titleEn: 'Candidate Pipeline' },
      { id: 'ats_interviews', titleAr: 'مواعيد المقابلات', titleEn: 'Interviews' },
      { id: 'ats_offers', titleAr: 'مسوغات التعيين والعروض', titleEn: 'Offers & Onboarding' },
    ],
  },
  {
    id: 'decrees',
    iconName: 'ScrollText',
    titleAr: 'القرارات والتعميمات',
    titleEn: 'Decrees & Circulars',
    colorVar: '#C2410C', // Terracotta Amber
    badgeAr: 'إداري',
    badgeEn: 'Decrees',
    subItems: [
      { id: 'dec_decrees', titleAr: 'القرارات الإدارية والوزارية', titleEn: 'Executive Decrees' },
      { id: 'dec_circulars', titleAr: 'الأوامر المعممة', titleEn: 'Circular Orders' },
      { id: 'dec_policies', titleAr: 'اللوائح وسياسات العمل', titleEn: 'Internal Regulations' },
      { id: 'dec_bulletins', titleAr: 'نشرات الموظفين العامة', titleEn: 'Staff Bulletins' },
    ],
  },
  {
    id: 'reception',
    iconName: 'ConciergeBell',
    titleAr: 'الاستقبال والزوار',
    titleEn: 'Front Desk & Reception',
    colorVar: '#D99B26', // Warm Radiant Amber
    badgeAr: 'استقبال',
    badgeEn: 'Front Desk',
    subItems: [
      { id: 'rec_visitors', titleAr: 'إدارة الزوار والدخول الرقمي', titleEn: 'Visitors & Check-In' },
      { id: 'rec_rooms', titleAr: 'حجز قاعات الاجتماعات والضيافة', titleEn: 'Meeting Rooms & VIP' },
      { id: 'rec_parcels', titleAr: 'سجل الطرود والشحنات السريعة', titleEn: 'Parcels & Couriers' },
      { id: 'rec_calls', titleAr: 'سجل المكالمات والاستفسارات', titleEn: 'Calls & Directory' },
      { id: 'rec_passes', titleAr: 'تصاريح المقاولين والفنيين المؤقتة', titleEn: 'Contractor & Site Passes' },
    ],
  },
  {
    id: 'settings',
    iconName: 'Settings',
    titleAr: 'الإعدادات والصلاحيات',
    titleEn: 'Settings & Permissions',
    colorVar: '#5C665E', // Charcoal Olive Slate
    badgeAr: 'نظام',
    badgeEn: 'System',
    subItems: [
      { id: 'set_rbac', titleAr: 'إدارة الصلاحيات والأدوار (RBAC)', titleEn: 'Roles & Permissions (RBAC)' },
      { id: 'set_users', titleAr: 'إدارة المستخدمين وحسابات الوصول', titleEn: 'User Management' },
      { id: 'set_audit', titleAr: 'سجل العمليات والأمان', titleEn: 'Audit Logs & Security' },
      { id: 'set_integrations', titleAr: 'مركز إدارة وتكامل قواعد البيانات (SQL Hub)', titleEn: 'Database Federation Hub (SQL)' },
    ],
  },
];

interface NavigationContextType {
  categories: DepartmentNavCategory[];
  currentUser: UserProfile;
  isCollapsed: boolean;
  toggleSidebar: () => void;
  isMobileOpen: boolean;
  toggleMobileDrawer: () => void;
  closeMobileDrawer: () => void;
  activeCategoryId: string | null;
  activeSubItemId: string | null;
  expandedCategories: string[];
  toggleCategoryExpand: (catId: string) => void;
  selectItem: (catId: string, subId?: string) => void;
  searchModalOpen: boolean;
  setSearchModalOpen: (open: boolean) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('erp_portal_sidebar_collapsed') === 'true';
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [activeSubItemId, setActiveSubItemId] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['executive']);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('erp_portal_sidebar_collapsed', String(isCollapsed));
  }, [isCollapsed]);

  // Global Ctrl + K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchModalOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed(prev => !prev);
  };

  const toggleMobileDrawer = () => {
    setIsMobileOpen(prev => !prev);
  };

  const closeMobileDrawer = () => {
    setIsMobileOpen(false);
  };

  const toggleCategoryExpand = (catId: string) => {
    setExpandedCategories(prev =>
      prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
    );
  };

  const selectItem = (catId: string, subId?: string) => {
    setActiveCategoryId(catId);
    setActiveSubItemId(subId || null);
    if (catId && !expandedCategories.includes(catId)) {
      setExpandedCategories(prev => [...prev, catId]);
    }
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  return (
    <NavigationContext.Provider
      value={{
        categories: DEPARTMENT_CATEGORIES,
        currentUser: CURRENT_USER,
        isCollapsed,
        toggleSidebar,
        isMobileOpen,
        toggleMobileDrawer,
        closeMobileDrawer,
        activeCategoryId,
        activeSubItemId,
        expandedCategories,
        toggleCategoryExpand,
        selectItem,
        searchModalOpen,
        setSearchModalOpen,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
