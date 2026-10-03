import React, { createContext, useContext, useState } from 'react';
import { useNavigation } from './NavigationContext';

export type LegalContractStatus = 'valid' | 'draft' | 'expired';

export type PaymentCertificateStatus =
  | 'draft'
  | 'under_consultant_review'
  | 'approved_with_notes'
  | 'consultant_approved'
  | 'pushed_to_finance';

export interface ConsultantInfo {
  id: string;
  firmNameAr: string;
  firmNameEn: string;
  leadEngineerAr: string;
  leadEngineerEn: string;
  licenseNo: string;
}

export interface ScheduleMilestone {
  id: string;
  code: string;
  titleAr: string;
  titleEn: string;
  projectId: string;
  projectNameAr: string;
  contractorId: string;
  contractorNameAr: string;
  plannedProgress: number;
  actualProgress: number;
  status: 'ahead' | 'on_track' | 'delayed';
  statusLabelAr: string;
  weightPercentage: number;
  targetDate: string;
  milestoneReleaseConditionAr: string;
  isPaymentReleased: boolean;
  linkedIpcId?: string;
}

export interface PaymentCertificateIPC {
  id: string;
  ipcNumber: string;
  type: 'subcontractor' | 'owner';
  typeLabelAr: string;
  projectId: string;
  projectNameAr: string;
  contractorId: string;
  contractorNameAr: string;
  consultant: ConsultantInfo;
  periodStart: string;
  periodEnd: string;
  previousWorkValue: number;
  currentWorkValue: number;
  totalExecutedValue: number;
  retentionPercentage: number;
  retentionAmount: number;
  advanceDeductionAmount: number;
  penaltyDeductionAmount: number;
  netPayableAmount: number;
  currency: string;
  status: PaymentCertificateStatus;
  statusLabelAr: string;
  consultantNotesAr?: string;
  inspectionReportAttached: boolean;
  approvalDate?: string;
  linkedMilestoneId?: string;
  linkedMilestoneNameAr?: string;
}

export interface ContractorLegalContract {
  id: string;
  contractNumber: string;
  contractorId: string;
  contractorNameAr: string;
  contractorNameEn: string;
  titleAr: string;
  titleEn: string;
  status: LegalContractStatus;
  statusLabelAr: string;
  statusLabelEn: string;
  startDate: string;
  endDate: string;
  totalValue: number;
  currency: string;
  scopeOfWorkAr: string;
  scopeOfWorkEn: string;
  penaltiesClauseAr: string;
  performanceBondPercentage: number;
  signedDate?: string;
  attachmentName?: string;
}

export interface Contractor {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  specialtyAr: string;
  specialtyEn: string;
  categoryAr: string;
  commercialReg: string;
  taxNumber: string;
  contactPerson: string;
  phone: string;
  email: string;
  activeProjectsCount: number;
  totalContractsValue: number;
  legalContractId: string;
  legalStatus: LegalContractStatus;
  legalStatusLabelAr: string;
  consultantId?: string;
}

export interface RFQItem {
  id: string;
  rfqNumber: string;
  titleAr: string;
  titleEn: string;
  projectNameAr: string;
  contractorId: string;
  contractorNameAr: string;
  submissionDeadline: string;
  status: 'submitted' | 'under_review' | 'awarded' | 'rejected';
  statusLabelAr: string;
  submittedBidAmount: number;
  budgetCap: number;
  currency: string;
}

export interface PurchaseOrderItem {
  id: string;
  poNumber: string;
  titleAr: string;
  titleEn: string;
  projectNameAr: string;
  contractorId: string;
  contractorNameAr: string;
  issueDate: string;
  deliveryDate: string;
  status: 'issued' | 'in_progress' | 'fulfilled' | 'cancelled';
  statusLabelAr: string;
  totalAmount: number;
  currency: string;
}

interface ContractorContextType {
  contractors: Contractor[];
  contracts: ContractorLegalContract[];
  rfqs: RFQItem[];
  purchaseOrders: PurchaseOrderItem[];
  milestones: ScheduleMilestone[];
  ipcs: PaymentCertificateIPC[];
  consultants: ConsultantInfo[];
  selectedContractorIdForLegal: string | null;
  setSelectedContractorIdForLegal: (id: string | null) => void;
  navigateToLegalContract: (contractorId: string) => void;
  navigateToTechnicalContractor: (contractorId?: string) => void;
  updateContractLegalStatus: (contractId: string, newStatus: LegalContractStatus) => void;
  addContractor: (newContractor: Omit<Contractor, 'id' | 'code' | 'legalContractId' | 'legalStatusLabelAr'>) => void;
  updateIPCStatus: (ipcId: string, newStatus: PaymentCertificateStatus, consultantNotes?: string) => void;
  addPaymentCertificate: (newIpc: Omit<PaymentCertificateIPC, 'id' | 'ipcNumber'>) => void;
  updateMilestoneProgress: (milestoneId: string, actualProgress: number) => void;
}

const INITIAL_CONSULTANTS: ConsultantInfo[] = [
  {
    id: 'csl_01',
    firmNameAr: 'دار الهندسة للتصميم والاستشارات الفنية',
    firmNameEn: 'Dar Al-Handasah Consultants',
    leadEngineerAr: 'د.م. عبد الله الشهري',
    leadEngineerEn: 'Dr. Eng. Abdullah Al-Shehri',
    licenseNo: 'ENG-CSL-1082',
  },
  {
    id: 'csl_02',
    firmNameAr: 'خطيب وعلمي للاستشارات الهندسية',
    firmNameEn: 'Khatib & Alami Engineering',
    leadEngineerAr: 'م. سامي الخضير',
    leadEngineerEn: 'Eng. Sami Al-Khodair',
    licenseNo: 'ENG-CSL-2041',
  },
  {
    id: 'csl_03',
    firmNameAr: 'مجموعة زهير فايز ومشاركوه للاستشارات',
    firmNameEn: 'Zuhair Fayez Partnership',
    leadEngineerAr: 'م. حازم القاسم',
    leadEngineerEn: 'Eng. Hazem Al-Qasim',
    licenseNo: 'ENG-CSL-1590',
  },
];

const INITIAL_MILESTONES: ScheduleMilestone[] = [
  {
    id: 'ms_01',
    code: 'MS-2026-01',
    titleAr: 'صب خرسانات أعمدة وسقف الدور الخامس',
    titleEn: 'Casting 5th Floor Columns & Slab',
    projectId: 'prj_01',
    projectNameAr: 'برج النخبة الإداري والمالي',
    contractorId: 'cnt_01',
    contractorNameAr: 'شركة المقاولات الحديثة للإنشاءات',
    plannedProgress: 80,
    actualProgress: 85,
    status: 'ahead',
    statusLabelAr: 'متقدم عن الجدول',
    weightPercentage: 15,
    targetDate: '2026-10-01',
    milestoneReleaseConditionAr: 'اختبار كسر مكعبات الخرسانة عمر 28 يوماً واجتياز الفحص الهندسي الميداني',
    isPaymentReleased: true,
    linkedIpcId: 'ipc_01',
  },
  {
    id: 'ms_02',
    code: 'MS-2026-02',
    titleAr: 'تمديد مسارات التكييف ومضخات الحريق بالقبو الثاني',
    titleEn: 'Basement-2 HVAC Ducts & Fire Pumps Piping',
    projectId: 'prj_02',
    projectNameAr: 'مجمع الواحة السكني المتكامل',
    contractorId: 'cnt_02',
    contractorNameAr: 'مؤسسة أفق الكهروميكانيك للتجارة والمقاولات',
    plannedProgress: 60,
    actualProgress: 60,
    status: 'on_track',
    statusLabelAr: 'منتظم',
    weightPercentage: 12,
    targetDate: '2026-10-20',
    milestoneReleaseConditionAr: 'اختبار ضغط شبكة مكافحة الحريق بالهيدروستاتيك واعتماد مهندس السلامة',
    isPaymentReleased: false,
    linkedIpcId: 'ipc_02',
  },
  {
    id: 'ms_03',
    code: 'MS-2026-03',
    titleAr: 'توريد وتركيب قطاعات الألومنيوم والزجاج المزدوج للواجهة الجنوبية',
    titleEn: 'South Façade Double-Glazing & Cladding Installation',
    projectId: 'prj_03',
    projectNameAr: 'المقر الرئيسي للشركة والمستودعات المركزية',
    contractorId: 'cnt_04',
    contractorNameAr: 'رواد العمارة للمقاولات العامة والتشطيبات',
    plannedProgress: 50,
    actualProgress: 35,
    status: 'delayed',
    statusLabelAr: 'متأخر',
    weightPercentage: 18,
    targetDate: '2026-09-30',
    milestoneReleaseConditionAr: 'فحص اختبار نفاذية الهواء والماء لعينات الواجهة المعتمدة من الاستشاري',
    isPaymentReleased: false,
  },
];

const INITIAL_IPCS: PaymentCertificateIPC[] = [
  {
    id: 'ipc_01',
    ipcNumber: 'IPC-SUB-2026-004',
    type: 'subcontractor',
    typeLabelAr: 'مستخلص مقاول باطن',
    projectId: 'prj_01',
    projectNameAr: 'برج النخبة الإداري والمالي',
    contractorId: 'cnt_01',
    contractorNameAr: 'شركة المقاولات الحديثة للإنشاءات',
    consultant: INITIAL_CONSULTANTS[0],
    periodStart: '2026-08-01',
    periodEnd: '2026-08-31',
    previousWorkValue: 12400000,
    currentWorkValue: 2800000,
    totalExecutedValue: 15200000,
    retentionPercentage: 10,
    retentionAmount: 280000,
    advanceDeductionAmount: 200000,
    penaltyDeductionAmount: 0,
    netPayableAmount: 2320000,
    currency: 'SAR',
    status: 'consultant_approved',
    statusLabelAr: 'معتمد نهائي من الاستشاري',
    consultantNotesAr: 'تمت مطابقة حصر الكميات الميداني مع المخططات التنفيذية واجتياز اختبارات الجودة المعتمدة.',
    inspectionReportAttached: true,
    approvalDate: '2026-09-10',
    linkedMilestoneId: 'ms_01',
    linkedMilestoneNameAr: 'صب خرسانات أعمدة وسقف الدور الخامس',
  },
  {
    id: 'ipc_02',
    ipcNumber: 'IPC-SUB-2026-005',
    type: 'subcontractor',
    typeLabelAr: 'مستخلص مقاول باطن',
    projectId: 'prj_02',
    projectNameAr: 'مجمع الواحة السكني المتكامل',
    contractorId: 'cnt_02',
    contractorNameAr: 'مؤسسة أفق الكهروميكانيك للتجارة والمقاولات',
    consultant: INITIAL_CONSULTANTS[1],
    periodStart: '2026-09-01',
    periodEnd: '2026-09-20',
    previousWorkValue: 4200000,
    currentWorkValue: 1650000,
    totalExecutedValue: 5850000,
    retentionPercentage: 10,
    retentionAmount: 165000,
    advanceDeductionAmount: 150000,
    penaltyDeductionAmount: 25000,
    netPayableAmount: 1310000,
    currency: 'SAR',
    status: 'under_consultant_review',
    statusLabelAr: 'قيد مراجعة الاستشاري',
    consultantNotesAr: 'جاري مراجعة محاضر فحص اختبار الضغط لشبكة الأنابيب بالموقع مع الاستشاري المشرف.',
    inspectionReportAttached: true,
    linkedMilestoneId: 'ms_02',
    linkedMilestoneNameAr: 'تمديد مسارات التكييف ومضخات الحريق بالقبو الثاني',
  },
  {
    id: 'ipc_03',
    ipcNumber: 'IPC-OWN-2026-002',
    type: 'owner',
    typeLabelAr: 'مستخلص المالك / الرئيسي',
    projectId: 'prj_01',
    projectNameAr: 'برج النخبة الإداري والمالي',
    contractorId: 'cnt_01',
    contractorNameAr: 'شركة المقاولات الحديثة للإنشاءات',
    consultant: INITIAL_CONSULTANTS[0],
    periodStart: '2026-07-01',
    periodEnd: '2026-08-31',
    previousWorkValue: 38000000,
    currentWorkValue: 9500000,
    totalExecutedValue: 47500000,
    retentionPercentage: 5,
    retentionAmount: 475000,
    advanceDeductionAmount: 950000,
    penaltyDeductionAmount: 0,
    netPayableAmount: 8075000,
    currency: 'SAR',
    status: 'pushed_to_finance',
    statusLabelAr: 'مرحل للمالية للصرف',
    consultantNotesAr: 'تم اعتماد المستخلص الختامي للمرحلة الإنشائية وتصديقه رسمياً من رئيس جهاز الإشراف.',
    inspectionReportAttached: true,
    approvalDate: '2026-09-15',
  },
];

const INITIAL_CONTRACTS: ContractorLegalContract[] = [
  {
    id: 'leg_cnt_01',
    contractNumber: 'LGL-CON-2026-042',
    contractorId: 'cnt_01',
    contractorNameAr: 'شركة المقاولات الحديثة للإنشاءات',
    contractorNameEn: 'Modern Construction & Contracting Co.',
    titleAr: 'عقد مقاولة الباطن للأعمال الإنشائية والخرسانية',
    titleEn: 'Subcontract Agreement for Structural Concrete',
    status: 'valid',
    statusLabelAr: 'عقد ساري',
    statusLabelEn: 'Active Contract',
    startDate: '2026-01-15',
    endDate: '2027-01-14',
    totalValue: 24500000,
    currency: 'SAR',
    scopeOfWorkAr: 'تنفيذ كافة أعمال الهياكل الخرسانية المسلحة للأبراج السكنية والتجارية بالمشروع الرئيسي',
    scopeOfWorkEn: 'Full execution of reinforced concrete structures for residential and commercial towers',
    penaltiesClauseAr: 'غرامة تأخير 0.5% أسبوعياً بحد أقصى 10% من إجمالي قيمة العقد التقديرية',
    performanceBondPercentage: 10,
    signedDate: '2026-01-10',
    attachmentName: 'Modern_Contract_Signed_LGL042.pdf',
  },
  {
    id: 'leg_cnt_02',
    contractNumber: 'LGL-CON-2026-088',
    contractorId: 'cnt_02',
    contractorNameAr: 'مؤسسة أفق الكهروميكانيك للتجارة والمقاولات',
    contractorNameEn: 'Horizons Electromechanical Est.',
    titleAr: 'عقد توريد وتركيب أنظمة التكييف المركزي ومكافحة الحريق',
    titleEn: 'HVAC & Firefighting Procurement and Installation Agreement',
    status: 'draft',
    statusLabelAr: 'مسودة عقد',
    statusLabelEn: 'Draft Contract',
    startDate: '2026-04-01',
    endDate: '2026-12-31',
    totalValue: 12800000,
    currency: 'SAR',
    scopeOfWorkAr: 'توريد وتركيب أنظمة التهوية والتكييف ومضخات الحريق وشبكات الرشاشات التلقائية',
    scopeOfWorkEn: 'Procurement and testing of ventilation, HVAC systems, and automated fire sprinklers',
    penaltiesClauseAr: 'غرامة تأخير 1% أسبوعياً بحد أقصى 10% مع حجز دفعة الضمان النهائي',
    performanceBondPercentage: 5,
    attachmentName: 'Draft_MEP_Agreement_Rev3.pdf',
  },
  {
    id: 'leg_cnt_03',
    contractNumber: 'LGL-CON-2025-119',
    contractorId: 'cnt_03',
    contractorNameAr: 'الشركة الدولية لتوريدات الصلب والمعادن',
    contractorNameEn: 'Global Steel & Metal Supplies Ltd.',
    titleAr: 'اتفاقية توريد حديد التسليح والقطاعات الفولاذية',
    titleEn: 'Supply Agreement for Rebar and Structural Steel',
    status: 'expired',
    statusLabelAr: 'مستندات قانونية منتهية',
    statusLabelEn: 'Expired Legal Documents',
    startDate: '2025-02-01',
    endDate: '2026-01-31',
    totalValue: 18400000,
    currency: 'SAR',
    scopeOfWorkAr: 'توريد 3,500 طن حديد تسليح عالي المقاومة طبقا للمواصفات القياسية المعتمدة',
    scopeOfWorkEn: 'Supply of 3,500 tons high-tensile rebar conforming to project specifications',
    penaltiesClauseAr: 'تحميل المورد فروق الأسعار الناتجة عن التأخير في الجداول الزمنية المحددة للتوريد',
    performanceBondPercentage: 10,
    signedDate: '2025-01-20',
    attachmentName: 'Global_Steel_Contract_Expired.pdf',
  },
  {
    id: 'leg_cnt_04',
    contractNumber: 'LGL-CON-2026-015',
    contractorId: 'cnt_04',
    contractorNameAr: 'رواد العمارة للمقاولات العامة والتشطيبات',
    contractorNameEn: 'Architecture Pioneers General Contracting',
    titleAr: 'عقد تنفيذ أعمال الواجهات والتشطيبات المعمارية الدقيقة',
    titleEn: 'Façade and Architectural Finishing Agreement',
    status: 'valid',
    statusLabelAr: 'عقد ساري',
    statusLabelEn: 'Active Contract',
    startDate: '2026-02-01',
    endDate: '2026-11-30',
    totalValue: 15600000,
    currency: 'SAR',
    scopeOfWorkAr: 'تنفيذ أعمال تكسيات الواجهات الزجاجية والألومنيوم والرخام الطبيعي',
    scopeOfWorkEn: 'Execution of curtain wall glazing, aluminum cladding, and natural stone finishes',
    penaltiesClauseAr: 'غرامة تأخير 0.75% أسبوعياً بحد أقصى 10% من قيمة الأعمال المتبقية',
    performanceBondPercentage: 10,
    signedDate: '2026-01-28',
    attachmentName: 'Façade_Contract_Approved.pdf',
  },
];

const INITIAL_CONTRACTORS: Contractor[] = [
  {
    id: 'cnt_01',
    code: 'CNT-2026-081',
    nameAr: 'شركة المقاولات الحديثة للإنشاءات',
    nameEn: 'Modern Construction & Contracting Co.',
    specialtyAr: 'أعمال الهياكل الخرسانية والإنشاءات الكبرى',
    specialtyEn: 'Concrete Structures & Major Construction',
    categoryAr: 'فئة أولى معتمدة',
    commercialReg: '1010489201',
    taxNumber: '300489201200003',
    contactPerson: 'م. حسام الدين عبد الله',
    phone: '+966 50 123 4567',
    email: 'hossam@modern-contracting.com',
    activeProjectsCount: 3,
    totalContractsValue: 24500000,
    legalContractId: 'leg_cnt_01',
    legalStatus: 'valid',
    legalStatusLabelAr: 'عقد ساري',
    consultantId: 'csl_01',
  },
  {
    id: 'cnt_02',
    code: 'CNT-2026-114',
    nameAr: 'مؤسسة أفق الكهروميكانيك للتجارة والمقاولات',
    nameEn: 'Horizons Electromechanical Est.',
    specialtyAr: 'أنظمة التكييف والكهرباء ومكافحة الحريق (MEP)',
    specialtyEn: 'HVAC, Electrical & Firefighting (MEP)',
    categoryAr: 'فئة متخصصة',
    commercialReg: '1010672190',
    taxNumber: '300987412000003',
    contactPerson: 'م. طارق عبد الرحمن',
    phone: '+966 55 987 6543',
    email: 'tarek@horizons-mep.com',
    activeProjectsCount: 2,
    totalContractsValue: 12800000,
    legalContractId: 'leg_cnt_02',
    legalStatus: 'draft',
    legalStatusLabelAr: 'مسودة عقد',
    consultantId: 'csl_02',
  },
  {
    id: 'cnt_03',
    code: 'CNT-2025-045',
    nameAr: 'الشركة الدولية لتوريدات الصلب والمعادن',
    nameEn: 'Global Steel & Metal Supplies Ltd.',
    specialtyAr: 'توريد حديد التسليح والقطاعات المعدنية الثقيلة',
    specialtyEn: 'Rebar & Heavy Structural Steel Supplies',
    categoryAr: 'مورد معتمد',
    commercialReg: '1010342981',
    taxNumber: '300124890000003',
    contactPerson: 'أ. ماجد العتيبي',
    phone: '+966 54 443 2211',
    email: 'sales@globalsteel-supplies.com',
    activeProjectsCount: 1,
    totalContractsValue: 18400000,
    legalContractId: 'leg_cnt_03',
    legalStatus: 'expired',
    legalStatusLabelAr: 'مستندات قانونية منتهية',
    consultantId: 'csl_01',
  },
  {
    id: 'cnt_04',
    code: 'CNT-2026-092',
    nameAr: 'رواد العمارة للمقاولات العامة والتشطيبات',
    nameEn: 'Architecture Pioneers General Contracting',
    specialtyAr: 'الواجهات المعمارية والتشطيبات الدقيقة',
    specialtyEn: 'Architectural Façades & Fine Finishes',
    categoryAr: 'فئة أولى معتمدة',
    commercialReg: '1010554312',
    taxNumber: '300765432100003',
    contactPerson: 'م. فراس السعيد',
    phone: '+966 56 789 0123',
    email: 'firas@rawad-facades.com',
    activeProjectsCount: 2,
    totalContractsValue: 15600000,
    legalContractId: 'leg_cnt_04',
    legalStatus: 'valid',
    legalStatusLabelAr: 'عقد ساري',
    consultantId: 'csl_03',
  },
];

const INITIAL_RFQS: RFQItem[] = [
  {
    id: 'rfq_01',
    rfqNumber: 'RFQ-2026-009',
    titleAr: 'عرض أسعار أعمال العزل المائي والحراري للأسطح',
    titleEn: 'Roof Waterproofing & Thermal Insulation Bids',
    projectNameAr: 'مشروع برج النخبة الإداري',
    contractorId: 'cnt_01',
    contractorNameAr: 'شركة المقاولات الحديثة للإنشاءات',
    submissionDeadline: '2026-10-15',
    status: 'under_review',
    statusLabelAr: 'قيد الدراسة الفنية',
    submittedBidAmount: 3450000,
    budgetCap: 3800000,
    currency: 'SAR',
  },
  {
    id: 'rfq_02',
    rfqNumber: 'RFQ-2026-012',
    titleAr: 'عرض أسعار توريد لوحات التوزيع الكهربائية والمحولات',
    titleEn: 'Electrical Switchgear & Transformers Procurement',
    projectNameAr: 'مشروع مجمع الواحة السكني',
    contractorId: 'cnt_02',
    contractorNameAr: 'مؤسسة أفق الكهروميكانيك للتجارة والمقاولات',
    submissionDeadline: '2026-09-30',
    status: 'awarded',
    statusLabelAr: 'تمت الترسية المبدئية',
    submittedBidAmount: 5200000,
    budgetCap: 5500000,
    currency: 'SAR',
  },
  {
    id: 'rfq_03',
    rfqNumber: 'RFQ-2026-015',
    titleAr: 'عرض أسعار أعمال التكسيات الزجاجية المزدوجة (Curtain Wall)',
    titleEn: 'Double Glazed Curtain Wall Façade Bids',
    projectNameAr: 'مشروع المقر الرئيسي للشركة',
    contractorId: 'cnt_04',
    contractorNameAr: 'رواد العمارة للمقاولات العامة والتشطيبات',
    submissionDeadline: '2026-10-25',
    status: 'submitted',
    statusLabelAr: 'مستلم ومسجل',
    submittedBidAmount: 7800000,
    budgetCap: 8000000,
    currency: 'SAR',
  },
];

const INITIAL_POS: PurchaseOrderItem[] = [
  {
    id: 'po_01',
    poNumber: 'PO-2026-0034',
    titleAr: 'أمر شراء حديد تسليح عالي المقاومة (قطر 16 - 25 مم)',
    titleEn: 'Rebar High-Strength Purchase Order (16-25mm)',
    projectNameAr: 'مشروع برج النخبة الإداري',
    contractorId: 'cnt_03',
    contractorNameAr: 'الشركة الدولية لتوريدات الصلب والمعادن',
    issueDate: '2026-09-05',
    deliveryDate: '2026-10-10',
    status: 'in_progress',
    statusLabelAr: 'جاري التوريد بالموقع',
    totalAmount: 2150000,
    currency: 'SAR',
  },
  {
    id: 'po_02',
    poNumber: 'PO-2026-0041',
    titleAr: 'أمر شراء وحدات مناولة الهواء والتكييف المركزي (Chillers)',
    titleEn: 'Central HVAC Chillers & Air Handling Units',
    projectNameAr: 'مشروع مجمع الواحة السكني',
    contractorId: 'cnt_02',
    contractorNameAr: 'مؤسسة أفق الكهروميكانيك للتجارة والمقاولات',
    issueDate: '2026-09-12',
    deliveryDate: '2026-11-01',
    status: 'issued',
    statusLabelAr: 'صادر وبانتظار الاعتماد المالي',
    totalAmount: 4300000,
    currency: 'SAR',
  },
  {
    id: 'po_03',
    poNumber: 'PO-2026-0028',
    titleAr: 'أمر شراء وتوريد خرسانة جاهزة رتبة C40 مع إضافات مقاومة',
    titleEn: 'Ready-Mix Concrete Grade C40 Supply Order',
    projectNameAr: 'مشروع المقر الرئيسي للشركة',
    contractorId: 'cnt_01',
    contractorNameAr: 'شركة المقاولات الحديثة للإنشاءات',
    issueDate: '2026-08-20',
    deliveryDate: '2026-09-25',
    status: 'fulfilled',
    statusLabelAr: 'مكتمل ومستلم هندسياً',
    totalAmount: 1850000,
    currency: 'SAR',
  },
];

const ContractorContext = createContext<ContractorContextType | undefined>(undefined);

export const ContractorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { selectItem } = useNavigation();
  const [contractors, setContractors] = useState<Contractor[]>(INITIAL_CONTRACTORS);
  const [contracts, setContracts] = useState<ContractorLegalContract[]>(INITIAL_CONTRACTS);
  const [rfqs] = useState<RFQItem[]>(INITIAL_RFQS);
  const [purchaseOrders] = useState<PurchaseOrderItem[]>(INITIAL_POS);
  const [milestones, setMilestones] = useState<ScheduleMilestone[]>(INITIAL_MILESTONES);
  const [ipcs, setIpcs] = useState<PaymentCertificateIPC[]>(INITIAL_IPCS);
  const [consultants] = useState<ConsultantInfo[]>(INITIAL_CONSULTANTS);
  const [selectedContractorIdForLegal, setSelectedContractorIdForLegal] = useState<string | null>(null);

  // Cross-module reactive status updater
  const updateContractLegalStatus = (contractId: string, newStatus: LegalContractStatus) => {
    const statusMap: Record<LegalContractStatus, { ar: string; en: string }> = {
      valid: { ar: 'عقد ساري', en: 'Active Contract' },
      draft: { ar: 'مسودة عقد', en: 'Draft Contract' },
      expired: { ar: 'مستندات قانونية منتهية', en: 'Expired Legal Documents' },
    };

    setContracts(prevContracts =>
      prevContracts.map(c => {
        if (c.id === contractId) {
          return {
            ...c,
            status: newStatus,
            statusLabelAr: statusMap[newStatus].ar,
            statusLabelEn: statusMap[newStatus].en,
          };
        }
        return c;
      })
    );

    // Sync contractor status
    setContractors(prevContractors =>
      prevContractors.map(cnt => {
        if (cnt.legalContractId === contractId) {
          return {
            ...cnt,
            legalStatus: newStatus,
            legalStatusLabelAr: statusMap[newStatus].ar,
          };
        }
        return cnt;
      })
    );
  };

  // State machine transition for Payment Certificates (Consultant Sign-off)
  const updateIPCStatus = (
    ipcId: string,
    newStatus: PaymentCertificateStatus,
    consultantNotes?: string
  ) => {
    const statusMap: Record<PaymentCertificateStatus, string> = {
      draft: 'مسودة',
      under_consultant_review: 'قيد مراجعة الاستشاري',
      approved_with_notes: 'معتمد بملاحظات',
      consultant_approved: 'معتمد نهائي من الاستشاري',
      pushed_to_finance: 'مرحل للمالية للصرف',
    };

    setIpcs(prevIpcs =>
      prevIpcs.map(item => {
        if (item.id === ipcId) {
          const isApproved =
            newStatus === 'consultant_approved' ||
            newStatus === 'approved_with_notes' ||
            newStatus === 'pushed_to_finance';
          return {
            ...item,
            status: newStatus,
            statusLabelAr: statusMap[newStatus],
            consultantNotesAr: consultantNotes || item.consultantNotesAr,
            approvalDate: isApproved ? new Date().toISOString().split('T')[0] : item.approvalDate,
          };
        }
        return item;
      })
    );

    // If approved or pushed to finance, check and mark linked milestone payment released
    if (newStatus === 'consultant_approved' || newStatus === 'pushed_to_finance') {
      const targetIpc = ipcs.find(i => i.id === ipcId);
      if (targetIpc?.linkedMilestoneId) {
        setMilestones(prev =>
          prev.map(m =>
            m.id === targetIpc.linkedMilestoneId ? { ...m, isPaymentReleased: true } : m
          )
        );
      }
    }
  };

  // Add new Payment Certificate
  const addPaymentCertificate = (newIpc: Omit<PaymentCertificateIPC, 'id' | 'ipcNumber'>) => {
    const id = `ipc_${Date.now()}`;
    const prefix = newIpc.type === 'subcontractor' ? 'IPC-SUB' : 'IPC-OWN';
    const ipcNumber = `${prefix}-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    const createdIpc: PaymentCertificateIPC = {
      ...newIpc,
      id,
      ipcNumber,
    };

    setIpcs(prev => [createdIpc, ...prev]);
  };

  // Update schedule milestone progress
  const updateMilestoneProgress = (milestoneId: string, actualProgress: number) => {
    setMilestones(prev =>
      prev.map(m => {
        if (m.id === milestoneId) {
          let status: 'ahead' | 'on_track' | 'delayed' = 'on_track';
          let statusLabelAr = 'منتظم';

          if (actualProgress > m.plannedProgress + 2) {
            status = 'ahead';
            statusLabelAr = 'متقدم عن الجدول';
          } else if (actualProgress < m.plannedProgress - 4) {
            status = 'delayed';
            statusLabelAr = 'متأخر';
          }

          return {
            ...m,
            actualProgress,
            status,
            statusLabelAr,
          };
        }
        return m;
      })
    );
  };

  // Deep link from Technical Office to Legal Affairs Contracts
  const navigateToLegalContract = (contractorId: string) => {
    setSelectedContractorIdForLegal(contractorId);
    selectItem('legal', 'leg_contracts_subcontractors');
  };

  // Deep link from Legal Affairs back to Technical Office Contractors
  const navigateToTechnicalContractor = (contractorId?: string) => {
    if (contractorId) {
      setSelectedContractorIdForLegal(contractorId);
    }
    selectItem('engineering', 'eng_contractors');
  };

  const addContractor = (
    newContractor: Omit<Contractor, 'id' | 'code' | 'legalContractId' | 'legalStatusLabelAr'>
  ) => {
    const newId = `cnt_${Date.now()}`;
    const newContractId = `leg_${newId}`;
    const statusMap: Record<LegalContractStatus, string> = {
      valid: 'عقد ساري',
      draft: 'مسودة عقد',
      expired: 'مستندات قانونية منتهية',
    };

    const contractorRecord: Contractor = {
      ...newContractor,
      id: newId,
      code: `CNT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      legalContractId: newContractId,
      legalStatusLabelAr: statusMap[newContractor.legalStatus],
      consultantId: INITIAL_CONSULTANTS[0].id,
    };

    const legalRecord: ContractorLegalContract = {
      id: newContractId,
      contractNumber: `LGL-CON-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      contractorId: newId,
      contractorNameAr: newContractor.nameAr,
      contractorNameEn: newContractor.nameEn,
      titleAr: `عقد مقاولة وتوريد مع ${newContractor.nameAr}`,
      titleEn: `Subcontract Agreement with ${newContractor.nameEn}`,
      status: newContractor.legalStatus,
      statusLabelAr: statusMap[newContractor.legalStatus],
      statusLabelEn: newContractor.legalStatus === 'valid' ? 'Active' : 'Draft',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      totalValue: newContractor.totalContractsValue,
      currency: 'SAR',
      scopeOfWorkAr: newContractor.specialtyAr,
      scopeOfWorkEn: newContractor.specialtyEn,
      penaltiesClauseAr: 'غرامة تأخير 0.5% أسبوعياً بحد أقصى 10%',
      performanceBondPercentage: 10,
    };

    setContractors(prev => [contractorRecord, ...prev]);
    setContracts(prev => [legalRecord, ...prev]);
  };

  return (
    <ContractorContext.Provider
      value={{
        contractors,
        contracts,
        rfqs,
        purchaseOrders,
        milestones,
        ipcs,
        consultants,
        selectedContractorIdForLegal,
        setSelectedContractorIdForLegal,
        navigateToLegalContract,
        navigateToTechnicalContractor,
        updateContractLegalStatus,
        addContractor,
        updateIPCStatus,
        addPaymentCertificate,
        updateMilestoneProgress,
      }}
    >
      {children}
    </ContractorContext.Provider>
  );
};

export const useContractors = (): ContractorContextType => {
  const context = useContext(ContractorContext);
  if (!context) {
    throw new Error('useContractors must be used within a ContractorProvider');
  }
  return context;
};
