import React, { useState, useMemo, useRef } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import {
  insuranceStorage,
  InsuredEmployeeRecord,
  OfficialFormRecord,
  calculateEmployeeContributions,
  normalizeDigits,
  createBlobUrlFromDataUrl,
} from '../../../services/insuranceStorage';
import {
  FileText,
  Printer,
  Save,
  Send,
  Sliders,
  RotateCcw,
  Upload,
  Eye,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Building2,
  UserCheck,
  Edit3,
  Layers,
  Paperclip,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

interface OfficialFormsCenterViewProps {
  employees: InsuredEmployeeRecord[];
  hrEmployees: any[];
  forms: OfficialFormRecord[];
  companies: Array<{
    id: string;
    nameAr: string;
    nameEn?: string;
    taxId?: string;
    commercialReg?: string;
    socialInsuranceNo?: string;
    addressAr?: string;
    chairmanAr?: string;
    phone?: string;
  }>;
  selectedCompanyId: string;
  currentUserName: string;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  initialFormType?: 'س1' | 'س2' | 'س6';
  initialEmployeeId?: string;
  onRefreshData: () => Promise<void>;
  onOpenAuditLog: (title: string, logs: any) => void;
  onPreviewAttachment: (title: string, dataUrl: string, fileName: string) => void;
}

interface FieldCoordSpec {
  id: string;
  label: string;
  page: 'front' | 'back';
  top: number;
  right: number;
  width: number;
  height: number;
  maxLength?: number;
  isGrid?: boolean;
  cellStep?: number;
  indent?: number;
  align?: 'center' | 'right' | 'left';
  fontSize?: number;
}

const DEFAULT_S1_SPECS: FieldCoordSpec[] = [
  { id: 'office_name', label: 'مكتب التأمينات', page: 'front', top: 42, right: 70, width: 156, height: 22 },
  { id: 'category_1', label: 'فئة: عاملين لدى الغير', page: 'front', top: 123, right: 250, width: 25, height: 22, align: 'center' },
  { id: 'category_2', label: 'فئة: أصحاب أعمال', page: 'front', top: 120, right: 657, width: 21, height: 21, align: 'center' },
  { id: 'category_3', label: 'فئة: عمال المخابز', page: 'front', top: 154, right: 252, width: 30, height: 22, align: 'center' },
  { id: 'applicant_name', label: 'اسم مقدم الطلب', page: 'front', top: 218, right: 122, width: 243, height: 24 },
  { id: 'applicant_capacity', label: 'صفة مقدم الطلب', page: 'front', top: 219, right: 492, width: 254, height: 25 },
  { id: 'applicant_ins_num', label: 'الرقم التأميني لمقدم الطلب', page: 'front', top: 250, right: 107, width: 236, height: 27, maxLength: 9, isGrid: true, cellStep: 26, indent: 7.5 },
  { id: 'applicant_phone', label: 'رقم هاتف مقدم الطلب', page: 'front', top: 252, right: 461, width: 281, height: 24 },
  { id: 'applicant_nat_id', label: 'الرقم القومي لمقدم الطلب', page: 'front', top: 286, right: 104, width: 365, height: 25, maxLength: 14, isGrid: true, cellStep: 25.85, indent: 7.5 },
  { id: 'emp_ins_num', label: 'الرقم التأميني للمؤمن عليه', page: 'front', top: 363, right: 147, width: 235, height: 24, maxLength: 9, isGrid: true, cellStep: 25, indent: 7 },
  { id: 'emp_name', label: 'اسم المؤمن عليه الرباعي', page: 'front', top: 360, right: 510, width: 247, height: 28 },
  { id: 'emp_nat_id', label: 'الرقم القومي للمؤمن عليه', page: 'front', top: 395, right: 151, width: 365, height: 24, maxLength: 14, isGrid: true, cellStep: 25.78, indent: 7 },
  { id: 'emp_nationality', label: 'الجنسية', page: 'front', top: 394, right: 623, width: 126, height: 24, align: 'center' },
  { id: 'emp_qualification', label: 'المؤهل الدراسي', page: 'front', top: 422, right: 103, width: 238, height: 23 },
  { id: 'emp_profession', label: 'المهنة', page: 'front', top: 421, right: 395, width: 229, height: 23 },
  { id: 'emp_sub_date_day', label: 'تاريخ الاشتراك (يوم)', page: 'front', top: 446, right: 203, width: 46, height: 24, maxLength: 2, isGrid: true, cellStep: 21, indent: 6 },
  { id: 'emp_sub_date_month', label: 'تاريخ الاشتراك (شهر)', page: 'front', top: 447, right: 265, width: 49, height: 24, maxLength: 2, isGrid: true, cellStep: 21.5, indent: 6 },
  { id: 'emp_sub_date_year', label: 'تاريخ الاشتراك (سنة)', page: 'front', top: 447, right: 324, width: 93, height: 24, maxLength: 4, isGrid: true, cellStep: 21.25, indent: 6 },
  { id: 'emp_sector', label: 'القطاع', page: 'front', top: 453, right: 480, width: 145, height: 23, align: 'center' },
  { id: 'emp_sub_code', label: 'كود المهنة', page: 'front', top: 479, right: 125, width: 126, height: 23, align: 'center' },
  { id: 'emp_duration_type', label: 'نوع المدة', page: 'front', top: 479, right: 329, width: 125, height: 24, align: 'center' },
  { id: 'emp_wage_pounds', label: 'أجر الاشتراك (جنيه)', page: 'front', top: 523, right: 196, width: 165, height: 20, align: 'center' },
  { id: 'emp_comp_wage_pounds', label: 'الأجر الشامل (جنيه)', page: 'front', top: 525, right: 480, width: 164, height: 20, align: 'center' },
  { id: 'emp_disability_start_day', label: 'بداية العجز (يوم)', page: 'front', top: 563, right: 325, width: 44, height: 24, align: 'center' },
  { id: 'emp_disability_start_month', label: 'بداية العجز (شهر)', page: 'front', top: 562, right: 384, width: 49, height: 26, align: 'center' },
  { id: 'emp_disability_start_year', label: 'بداية العجز (سنة)', page: 'front', top: 564, right: 444, width: 89, height: 24, align: 'center' },
  { id: 'emp_disability_pct', label: 'نسبة العجز %', page: 'front', top: 563, right: 626, width: 78, height: 22, align: 'center' },
  { id: 'emp_med_exam_yes', label: 'فحص طبي (نعم)', page: 'front', top: 595, right: 284, width: 32, height: 22, align: 'center' },
  { id: 'emp_med_exam_no', label: 'فحص طبي (لا)', page: 'front', top: 591, right: 351, width: 31, height: 27, align: 'center' },
  { id: 'fac_type_1', label: 'كيان: فردي', page: 'front', top: 671, right: 168, width: 31, height: 23, align: 'center' },
  { id: 'fac_type_2', label: 'كيان: أشخاص', page: 'front', top: 674, right: 245, width: 30, height: 23, align: 'center' },
  { id: 'fac_type_3', label: 'كيان: أموال', page: 'front', top: 673, right: 367, width: 30, height: 23, align: 'center' },
  { id: 'fac_type_4', label: 'كيان: أخرى', page: 'front', top: 672, right: 485, width: 35, height: 25, align: 'center' },
  { id: 'fac_name', label: 'اسم المنشأة', page: 'front', top: 707, right: 121, width: 272, height: 23 },
  { id: 'fac_number', label: 'رقم المنشأة التأميني', page: 'front', top: 705, right: 483, width: 230, height: 23, maxLength: 9, isGrid: true, cellStep: 25, indent: 7 },
  { id: 'res_building', label: 'رقم العقار', page: 'front', top: 785, right: 117, width: 56, height: 25, align: 'center' },
  { id: 'res_street', label: 'الشارع', page: 'front', top: 786, right: 248, width: 240, height: 23 },
  { id: 'res_village', label: 'القرية / المنطقة', page: 'front', top: 784, right: 553, width: 120, height: 23 },
  { id: 'res_center', label: 'المركز / القسم', page: 'front', top: 816, right: 113, width: 120, height: 22 },
  { id: 'res_gov', label: 'المحافظة', page: 'front', top: 814, right: 296, width: 152, height: 25 },
  { id: 'sig_phone', label: 'تليفون المؤمن عليه', page: 'front', top: 918, right: 149, width: 200, height: 24, align: 'center' },
  { id: 'sig_date_day', label: 'تاريخ التحرير (يوم)', page: 'front', top: 944, right: 104, width: 32, height: 24, align: 'center' },
  { id: 'sig_date_month', label: 'تاريخ التحرير (شهر)', page: 'front', top: 944, right: 146, width: 32, height: 24, align: 'center' },
  { id: 'sig_date_year', label: 'تاريخ التحرير (سنة)', page: 'front', top: 944, right: 188, width: 48, height: 24, align: 'center' },
  // Back Page
  { id: 'back_fac_name', label: 'اسم المنشأة (ظهر الاستمارة)', page: 'back', top: 454, right: 157, width: 328, height: 25 },
  { id: 'back_fac_ins_num', label: 'رقم المنشأة (ظهر الاستمارة)', page: 'back', top: 454, right: 587, width: 150, height: 25, align: 'center' },
  { id: 'back_fac_address', label: 'عنوان المنشأة (ظهر الاستمارة)', page: 'back', top: 484, right: 149, width: 600, height: 25 },
  { id: 'back_emp_name', label: 'اسم العامل بالإقرار', page: 'back', top: 678, right: 108, width: 220, height: 24 },
];

const DEFAULT_S6_SPECS: FieldCoordSpec[] = [
  { id: 's6_office_name', label: 'مكتب التأمينات', page: 'front', top: 48, right: 96, width: 155, height: 23 },
  { id: 's6_applicant_name', label: 'اسم مقدم الطلب', page: 'front', top: 174, right: 121, width: 247, height: 21 },
  { id: 's6_applicant_capacity', label: 'صفة مقدم الطلب', page: 'front', top: 177, right: 490, width: 240, height: 22 },
  { id: 's6_applicant_ins_num', label: 'الرقم التأميني لمقدم الطلب', page: 'front', top: 208, right: 117, width: 234, height: 24, maxLength: 9, isGrid: true, cellStep: 26, indent: 8 },
  { id: 's6_applicant_phone', label: 'تليفون مقدم الطلب', page: 'front', top: 207, right: 451, width: 260, height: 24 },
  { id: 's6_applicant_nat_id', label: 'الرقم القومي لمقدم الطلب', page: 'front', top: 256, right: 124, width: 360, height: 20, maxLength: 14, isGrid: true, cellStep: 25.71, indent: 7.5 },
  { id: 's6_emp_ins_num', label: 'الرقم التأميني للمؤمن عليه', page: 'front', top: 330, right: 139, width: 208, height: 24, maxLength: 8, isGrid: true, cellStep: 26, indent: 8 },
  { id: 's6_emp_name', label: 'اسم المؤمن عليه', page: 'front', top: 334, right: 462, width: 240, height: 22 },
  { id: 's6_emp_nat_id', label: 'الرقم القومي للمؤمن عليه', page: 'front', top: 361, right: 140, width: 358, height: 18, maxLength: 14, isGrid: true, cellStep: 25.57, indent: 7 },
  { id: 's6_fac_number', label: 'رقم المنشأة التأميني', page: 'front', top: 391, right: 141, width: 228, height: 22, maxLength: 9, isGrid: true, cellStep: 25.33, indent: 7 },
  { id: 's6_fac_name', label: 'اسم المنشأة', page: 'front', top: 392, right: 463, width: 240, height: 22 },
  { id: 's6_exit_date_day', label: 'تاريخ انتهاء الاشتراك (يوم)', page: 'front', top: 422, right: 181, width: 53, height: 25, maxLength: 2, isGrid: true, cellStep: 26.5, indent: 8 },
  { id: 's6_exit_date_month', label: 'تاريخ انتهاء الاشتراك (شهر)', page: 'front', top: 422, right: 259, width: 53, height: 25, maxLength: 2, isGrid: true, cellStep: 26.5, indent: 8 },
  { id: 's6_exit_date_year', label: 'تاريخ انتهاء الاشتراك (سنة)', page: 'front', top: 423, right: 333, width: 104, height: 25, maxLength: 4, isGrid: true, cellStep: 26, indent: 8 },
  { id: 's6_resignation_reason', label: 'سبب انتهاء الاشتراك', page: 'front', top: 420, right: 591, width: 176, height: 28 },
  // Back Page
  { id: 's6_back_fac_name', label: 'اسم المنشأة (ظهر س6)', page: 'back', top: 360, right: 143, width: 250, height: 24 },
  { id: 's6_back_fac_ins_num', label: 'رقم المنشأة (ظهر س6)', page: 'back', top: 358, right: 510, width: 233, height: 24, maxLength: 9, isGrid: true, cellStep: 25.88, indent: 7.5 },
  { id: 's6_back_fac_address', label: 'عنوان المنشأة (ظهر س6)', page: 'back', top: 402, right: 137, width: 605, height: 25 },
  { id: 's6_back_emp_name', label: 'اسم المؤمن عليه (ظهر س6)', page: 'back', top: 435, right: 194, width: 200, height: 25 },
  { id: 's6_back_emp_ins_num', label: 'الرقم التأميني للعامل (ظهر س6)', page: 'back', top: 438, right: 509, width: 234, height: 22, maxLength: 9, isGrid: true, cellStep: 26, indent: 8 },
];

export const OfficialFormsCenterView: React.FC<OfficialFormsCenterViewProps> = ({
  employees,
  hrEmployees,
  forms,
  companies,
  selectedCompanyId,
  currentUserName,
  canCreate,
  canDelete,
  initialFormType = 'س1',
  initialEmployeeId = '',
  onRefreshData,
  onOpenAuditLog,
  onPreviewAttachment,
}) => {
  const { t } = useLanguage();
  const printAreaRef = useRef<HTMLDivElement>(null);

  const [activeSubView, setActiveSubView] = useState<'س1' | 'س2' | 'س6' | 'archive'>(initialFormType);
  const [selectedEmpId, setSelectedEmpId] = useState<string>(initialEmployeeId);
  const [selectedCompId, setSelectedCompId] = useState<string>(
    selectedCompanyId !== 'all' ? selectedCompanyId : companies[0]?.id || ''
  );
  const [incomingNumber, setIncomingNumber] = useState<string>('');
  const [showLiveEditor, setShowLiveEditor] = useState<boolean>(true);
  const [alignMode, setAlignMode] = useState<boolean>(false);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [zoomScale, setZoomScale] = useState<number>(0.9);
  const [signedScanData, setSignedScanData] = useState<string | null>(null);
  const [signedScanName, setSignedScanName] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Custom coordinate overrides from localStorage
  const [s1Overrides, setS1Overrides] = useState<Record<string, { top: number; right: number; width: number; height: number }>>(
    () => insuranceStorage.getCustomFormCoords('s1')
  );
  const [s6Overrides, setS6Overrides] = useState<Record<string, { top: number; right: number; width: number; height: number }>>(
    () => insuranceStorage.getCustomFormCoords('s6')
  );

  // Form field values for S1 and S6
  const todayParts = useMemo(() => {
    const d = new Date();
    return {
      day: String(d.getDate()).padStart(2, '0'),
      month: String(d.getMonth() + 1).padStart(2, '0'),
      year: String(d.getFullYear()),
    };
  }, []);

  const [s1Values, setS1Values] = useState<Record<string, string>>({
    category_1: '✓',
    emp_nationality: 'مصري',
    emp_sector: 'خاص',
    emp_duration_type: 'نمطي',
    emp_med_exam_yes: '✓',
    fac_type_3: '✓',
    sig_date_day: todayParts.day,
    sig_date_month: todayParts.month,
    sig_date_year: todayParts.year,
  });

  const [s6Values, setS6Values] = useState<Record<string, string>>({
    s6_exit_date_day: todayParts.day,
    s6_exit_date_month: todayParts.month,
    s6_exit_date_year: todayParts.year,
    s6_resignation_reason: 'استقالة',
  });

  // Merge employee options (Insured + HR)
  const allSelectableEmployees = useMemo(() => {
    const list: InsuredEmployeeRecord[] = [...employees];
    const existingNats = new Set(list.map((e) => normalizeDigits(e.national_id)));
    hrEmployees.forEach((h) => {
      const nat = normalizeDigits(h.nationalId || h.national_id || '');
      if (nat && existingNats.has(nat)) return;
      const comp = companies.find((c) => c.id === (h.companyId || h.company_id));
      list.push({
        id: h.id,
        code: h.code || h.employeeCode || '',
        name: h.nameAr || h.name || '',
        national_id: nat,
        insurance_number: normalizeDigits(h.insuranceNumber || h.socialInsuranceNo || ''),
        company_id: h.companyId || h.company_id || '',
        company_name: comp?.nameAr || h.companyName || '',
        occupation: h.jobTitle || h.role || '',
        hire_date: h.hireDate || h.joinDate || '',
        sub_start_date: h.hireDate || h.joinDate || '',
        sub_wage: Number(h.basicSalary || h.salary || 0),
        comp_wage: Number(h.totalSalary || h.salary || 0),
        phone: h.phone || '',
      });
    });
    return list;
  }, [employees, hrEmployees, companies]);

  // Auto-fill S1 & S6 when Company or Employee is selected
  const applyAutoFill = (empId: string, compId: string) => {
    const emp = allSelectableEmployees.find((e) => e.id === empId);
    const comp =
      companies.find((c) => c.id === (compId || emp?.company_id)) ||
      companies[0];

    const subDate = emp?.sub_start_date || emp?.hire_date || new Date().toISOString().slice(0, 10);
    const [subY = todayParts.year, subM = todayParts.month, subD = todayParts.day] = subDate.split('-');

    const exitDate = emp?.resignation_date || new Date().toISOString().slice(0, 10);
    const [exY = todayParts.year, exM = todayParts.month, exD = todayParts.day] = exitDate.split('-');

    const facInsNum = normalizeDigits((comp as any)?.socialInsuranceNo || '').slice(0, 9);
    const managerName = (comp as any)?.chairmanAr || '';
    const compPhone = (comp as any)?.phone || '';
    const compAddress = (comp as any)?.addressAr || '';

    setS1Values((prev) => ({
      ...prev,
      office_name: emp?.office_name || prev.office_name || 'مكتب تأمينات المنشأة',
      applicant_name: managerName || prev.applicant_name || '',
      applicant_capacity: 'صاحب العمل / المدير المسؤول',
      applicant_phone: compPhone || prev.applicant_phone || '',
      emp_ins_num: normalizeDigits(emp?.insurance_number || '').slice(0, 9),
      emp_name: emp?.name || '',
      emp_nat_id: normalizeDigits(emp?.national_id || '').slice(0, 14),
      emp_nationality: 'مصري',
      emp_qualification: emp?.qualification || '',
      emp_profession: emp?.occupation || '',
      emp_sub_code: emp?.occupation_code || '',
      emp_sub_date_day: subD,
      emp_sub_date_month: subM,
      emp_sub_date_year: subY,
      emp_sector: 'خاص',
      emp_duration_type: emp?.duration_type || 'نمطي',
      emp_wage_pounds: emp?.sub_wage ? String(emp.sub_wage) : '',
      emp_comp_wage_pounds: emp?.comp_wage ? String(emp.comp_wage) : '',
      fac_name: comp?.nameAr || emp?.company_name || '',
      fac_number: facInsNum,
      res_building: emp?.building_no || '',
      res_street: emp?.street || '',
      res_village: emp?.village || '',
      res_center: emp?.center || '',
      res_gov: emp?.gov || '',
      sig_phone: emp?.phone || '',
      back_fac_name: comp?.nameAr || emp?.company_name || '',
      back_fac_ins_num: facInsNum,
      back_fac_address: compAddress,
      back_emp_name: emp?.name || '',
    }));

    setS6Values((prev) => ({
      ...prev,
      s6_office_name: emp?.office_name || prev.s6_office_name || 'مكتب تأمينات المنشأة',
      s6_applicant_name: managerName || prev.s6_applicant_name || '',
      s6_applicant_capacity: 'صاحب العمل / المدير المسؤول',
      s6_applicant_phone: compPhone || prev.s6_applicant_phone || '',
      s6_emp_ins_num: normalizeDigits(emp?.insurance_number || '').slice(0, 8),
      s6_emp_name: emp?.name || '',
      s6_emp_nat_id: normalizeDigits(emp?.national_id || '').slice(0, 14),
      s6_fac_number: facInsNum,
      s6_fac_name: comp?.nameAr || emp?.company_name || '',
      s6_exit_date_day: exD,
      s6_exit_date_month: exM,
      s6_exit_date_year: exY,
      s6_resignation_reason: emp?.resignation_reason || 'استقالة',
      s6_back_fac_name: comp?.nameAr || emp?.company_name || '',
      s6_back_fac_ins_num: facInsNum,
      s6_back_fac_address: compAddress,
      s6_back_emp_name: emp?.name || '',
      s6_back_emp_ins_num: normalizeDigits(emp?.insurance_number || '').slice(0, 9),
    }));
  };

  // Nudge field coordinates in Alignment Mode
  const nudgeField = (deltaTop: number, deltaRight: number, deltaW = 0) => {
    if (!selectedFieldId) return;
    const isS1 = activeSubView === 'س1';
    const baseSpecs = isS1 ? DEFAULT_S1_SPECS : DEFAULT_S6_SPECS;
    const spec = baseSpecs.find((s) => s.id === selectedFieldId);
    if (!spec) return;

    if (isS1) {
      const curr = s1Overrides[selectedFieldId] || {
        top: spec.top,
        right: spec.right,
        width: spec.width,
        height: spec.height,
      };
      const next = {
        ...s1Overrides,
        [selectedFieldId]: {
          top: curr.top + deltaTop,
          right: curr.right + deltaRight,
          width: Math.max(16, curr.width + deltaW),
          height: curr.height,
        },
      };
      setS1Overrides(next);
      insuranceStorage.saveCustomFormCoords('s1', next);
    } else {
      const curr = s6Overrides[selectedFieldId] || {
        top: spec.top,
        right: spec.right,
        width: spec.width,
        height: spec.height,
      };
      const next = {
        ...s6Overrides,
        [selectedFieldId]: {
          top: curr.top + deltaTop,
          right: curr.right + deltaRight,
          width: Math.max(16, curr.width + deltaW),
          height: curr.height,
        },
      };
      setS6Overrides(next);
      insuranceStorage.saveCustomFormCoords('s6', next);
    }
  };

  const handleResetCoords = () => {
    if (activeSubView === 'س1') {
      setS1Overrides({});
      insuranceStorage.resetCustomFormCoords('s1');
    } else if (activeSubView === 'س6') {
      setS6Overrides({});
      insuranceStorage.resetCustomFormCoords('s6');
    }
    setStatusMessage('تمت استعادة الإحداثيات القياسية المعتمدة للاستمارة');
    setTimeout(() => setStatusMessage(null), 3500);
  };

  // Print Official Form (High Resolution A4)
  const handlePrintOfficialForm = () => {
    if (!printAreaRef.current) return;
    const htmlContent = printAreaRef.current.innerHTML;
    const win = window.open('', '_blank', 'width=900,height=1150');
    if (!win) return;

    win.document.write(`
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8" />
        <title>طباعة استمارة تأمينية رسمية (${activeSubView})</title>
        <style>
          @page { size: A4 portrait; margin: 0; }
          * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          body { margin: 0; padding: 0; font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif; background: #fff; }
          .print-page-sheet {
            position: relative;
            width: 794px;
            height: 1123px;
            page-break-after: always;
            overflow: hidden;
            margin: 0 auto;
          }
          .print-page-sheet img.bg-img {
            position: absolute;
            inset: 0;
            width: 794px;
            height: 1123px;
            object-fit: fill;
            z-index: 1;
          }
          .print-page-sheet input {
            background: transparent !important;
            border: none !important;
            outline: none !important;
            color: #07130E !important;
            font-weight: 800 !important;
            z-index: 2;
          }
        </style>
      </head>
      <body>
        ${htmlContent}
        <script>
          window.onload = () => {
            setTimeout(() => { window.print(); }, 350);
          };
        </script>
      </body>
      </html>
    `);
    win.document.close();
  };

  // Save Form & Optionally Log to Operations Center
  const handleSaveForm = async (alsoLogToOperations: boolean) => {
    if (activeSubView === 'archive') return;
    const comp = companies.find((c) => c.id === selectedCompId);
    const emp = allSelectableEmployees.find((e) => e.id === selectedEmpId);

    const empName =
      activeSubView === 'س1'
        ? s1Values.emp_name || emp?.name || ''
        : activeSubView === 'س6'
        ? s6Values.s6_emp_name || emp?.name || ''
        : emp?.name || `كشف س2 جماعي (${comp?.nameAr || 'المنشأة'})`;

    const natId =
      activeSubView === 'س1'
        ? s1Values.emp_nat_id || emp?.national_id || ''
        : activeSubView === 'س6'
        ? s6Values.s6_emp_nat_id || emp?.national_id || ''
        : emp?.national_id || '';

    const insNum =
      activeSubView === 'س1'
        ? s1Values.emp_ins_num || emp?.insurance_number || ''
        : activeSubView === 'س6'
        ? s6Values.s6_emp_ins_num || emp?.insurance_number || ''
        : emp?.insurance_number || '';

    const payloadData =
      activeSubView === 'س1' ? s1Values : activeSubView === 'س6' ? s6Values : { companyId: selectedCompId };

    await insuranceStorage.saveForm(
      {
        form_type: activeSubView,
        company_id: selectedCompId,
        company_name: comp?.nameAr || '',
        employee_id: selectedEmpId,
        employee_name: empName,
        national_id: natId,
        insurance_number: insNum,
        form_date: new Date().toISOString().slice(0, 10),
        status: alsoLogToOperations ? 'مسجل بمركز العمليات' : 'معتمد',
        payload_json: payloadData,
        attachment_data: signedScanData,
        attachment_name: signedScanName,
      },
      currentUserName
    );

    if (alsoLogToOperations) {
      await insuranceStorage.saveOperation(
        {
          incoming_number: incomingNumber,
          incoming_date: new Date().toISOString().slice(0, 10),
          request_type: activeSubView,
          status: 'قيد المراجعة',
          company_id: selectedCompId,
          company_name: comp?.nameAr || '',
          employee_id: selectedEmpId,
          employee_code: emp?.code || '',
          employee_name: empName,
          national_id: natId,
          insurance_number: insNum,
          notes: `تم إصدار استمارة (${activeSubView}) رسمية من مركز الاستمارات`,
          attachment_data: signedScanData,
          attachment_name: signedScanName,
        },
        currentUserName
      );
    }

    await onRefreshData();
    setStatusMessage(
      alsoLogToOperations
        ? `تم حفظ استمارة (${activeSubView}) وإدراجها تلقائياً في مركز العمليات التأمينية`
        : `تم حفظ استمارة (${activeSubView}) في أرشيف الاستمارات المعتمدة`
    );
    setTimeout(() => setStatusMessage(null), 5000);
  };

  const handleSignedScanUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setSignedScanData(reader.result as string);
      setSignedScanName(file.name);
    };
    reader.readAsDataURL(file);
  };

  // Render an A4 Page (794x1123px) with background and pixel-accurate inputs
  const renderA4CanvasPage = (
    bgSrc: string,
    specs: FieldCoordSpec[],
    values: Record<string, string>,
    setValues: React.Dispatch<React.SetStateAction<Record<string, string>>>,
    overrides: Record<string, { top: number; right: number; width: number; height: number }>
  ) => {
    return (
      <div
        className="print-page-sheet relative bg-white shadow-2xl border border-amber-500/40 mx-auto select-none"
        style={{
          width: '794px',
          height: '1123px',
          direction: 'rtl',
        }}
      >
        <img
          src={bgSrc}
          alt="Official Form Background"
          className="bg-img pointer-events-none absolute inset-0 w-[794px] h-[1123px] object-fill"
        />

        {specs.map((spec) => {
          const coord = overrides[spec.id] || spec;
          const isSelected = alignMode && selectedFieldId === spec.id;
          const val = values[spec.id] || '';

          // Golden Centering Formula from FORMS_GRID_STANDARDS.md
          const gridStyle: React.CSSProperties = spec.isGrid
            ? {
                direction: 'ltr',
                textAlign: 'left',
                fontFamily: "'Courier New', monospace",
                fontSize: '15px',
                fontWeight: 900,
                letterSpacing: `calc(-1ch + ${spec.cellStep || 25.8}px)`,
                textIndent: `${spec.indent || 7.5}px`,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
              }
            : {
                direction: 'rtl',
                textAlign: spec.align || 'right',
                fontFamily: "'Cairo', sans-serif",
                fontSize: `${spec.fontSize || 12}px`,
                fontWeight: 800,
                paddingRight: spec.align === 'center' ? 0 : '4px',
              };

          return (
            <input
              key={spec.id}
              type="text"
              value={val}
              maxLength={spec.maxLength}
              title={spec.label}
              onClick={() => {
                if (alignMode) setSelectedFieldId(spec.id);
              }}
              onChange={(e) => {
                const nextVal = spec.isGrid
                  ? normalizeDigits(e.target.value).slice(0, spec.maxLength || 14)
                  : e.target.value;
                setValues((prev) => ({ ...prev, [spec.id]: nextVal }));
              }}
              style={{
                position: 'absolute',
                top: `${coord.top}px`,
                right: `${coord.right}px`,
                width: `${coord.width}px`,
                height: `${coord.height}px`,
                zIndex: 10,
                color: '#07130E',
                backgroundColor: isSelected
                  ? 'rgba(245, 158, 11, 0.35)'
                  : alignMode
                  ? 'rgba(245, 158, 11, 0.14)'
                  : 'transparent',
                border: isSelected
                  ? '2px solid #d97706'
                  : alignMode
                  ? '1px dashed #d97706'
                  : '1px solid transparent',
                outline: 'none',
                ...gridStyle,
              }}
              className="focus:bg-amber-500/15 focus:border-amber-500/60 transition-colors"
            />
          );
        })}
      </div>
    );
  };

  // Filtered employees for Form S2 (Annual Wage & Subscription Sheet)
  const s2CompanyEmployees = useMemo(() => {
    const wageConfig = insuranceStorage.getWageConfig();
    const list = allSelectableEmployees.filter(
      (e) => !selectedCompId || selectedCompId === 'all' || e.company_id === selectedCompId
    );
    return list.map((e) => ({
      emp: e,
      calc: calculateEmployeeContributions(e.sub_wage, e.comp_wage, wageConfig),
    }));
  }, [allSelectableEmployees, selectedCompId]);

  const currentSpecs = activeSubView === 'س1' ? DEFAULT_S1_SPECS : DEFAULT_S6_SPECS;
  const currentValues = activeSubView === 'س1' ? s1Values : s6Values;
  const setCurrentValues = activeSubView === 'س1' ? setS1Values : setS6Values;

  return (
    <div className="space-y-5">
      {/* Status Banner */}
      {statusMessage && (
        <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-emerald-500/15 text-emerald-900 dark:text-emerald-200 border border-emerald-500/40 text-xs font-bold">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{statusMessage}</span>
          </div>
        </div>
      )}

      {/* Form Type Selector Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#112219] border border-slate-200/80 dark:border-[#22382B] shadow-sm space-y-4">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
          {/* Sub-tabs: S1, S2, S6, Archive */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'س1', label: 'استمارة س1 (التحاق عامل بمنشأة)', badge: 'وجه + ظهر A4' },
              { id: 'س2', label: 'استمارة س2 (تعديل الأجور والاشتراكات السنوية)', badge: 'كشف المنشأة' },
              { id: 'س6', label: 'استمارة س6 (إخطار انتهاء اشتراك / استقالة)', badge: 'وجه + ظهر A4' },
              { id: 'archive', label: 'أرشيف الاستمارات المعتمدة والموقعة', badge: `${forms.length}` },
            ].map((tab) => {
              const active = activeSubView === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveSubView(tab.id as any)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    active
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'bg-slate-100 dark:bg-[#172D21] text-slate-700 dark:text-stone-200 hover:border-amber-500/40 border border-transparent'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${
                      active
                        ? 'bg-black/15 text-slate-950'
                        : 'bg-amber-500/15 text-amber-800 dark:text-amber-300'
                    }`}
                  >
                    {tab.badge}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Action Buttons when in Form View */}
          {activeSubView !== 'archive' && (
            <div className="flex flex-wrap items-center gap-2">
              {(activeSubView === 'س1' || activeSubView === 'س6') && (
                <>
                  <button
                    type="button"
                    onClick={() => setShowLiveEditor((v) => !v)}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border cursor-pointer ${
                      showLiveEditor
                        ? 'bg-amber-500/20 text-amber-900 dark:text-amber-200 border-amber-500/40'
                        : 'bg-slate-100 dark:bg-[#172D21] text-slate-700 dark:text-stone-300 border-slate-200 dark:border-[#243B2D]'
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{t('المدخل والمحرر الحي', 'Live Data Drawer')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAlignMode((v) => !v)}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border cursor-pointer ${
                      alignMode
                        ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-sm'
                        : 'bg-slate-100 dark:bg-[#172D21] text-slate-700 dark:text-stone-300 border-slate-200 dark:border-[#243B2D]'
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>{t('وضع ضبط الإحداثيات', 'Coordinates Mode')}</span>
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={handlePrintOfficialForm}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 dark:text-amber-200 border border-amber-500/35 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{t('طباعة الاستمارة الرسمية', 'Print Official Form')}</span>
              </button>

              {canCreate && (
                <>
                  <button
                    type="button"
                    onClick={() => handleSaveForm(false)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-[#172D21] dark:hover:bg-[#1E3A2B] text-slate-800 dark:text-stone-200 border border-slate-200 dark:border-[#284534] cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>{t('حفظ بالأرشيف', 'Save Form')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSaveForm(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 shadow-md shadow-amber-500/20 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{t('حفظ وإرسال لمركز العمليات', 'Save & Log to Operations')}</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Auto-Fill Selection Bar (Company + Employee + Incoming No + Signed Scan Attachment) */}
        {activeSubView !== 'archive' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-3 border-t border-slate-100 dark:border-[#1E3427]">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-stone-400 mb-1">
                <Building2 className="w-3 h-3 inline me-1 text-amber-500" />
                {t('اختر المنشأة للتعبئة التلقائية', 'Select Company to Auto-Fill')}
              </label>
              <select
                value={selectedCompId}
                onChange={(e) => {
                  setSelectedCompId(e.target.value);
                  applyAutoFill(selectedEmpId, e.target.value);
                }}
                className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-slate-50 dark:bg-[#0B1711] border border-slate-200 dark:border-[#243B2D] text-slate-900 dark:text-white"
              >
                <option value="">{t('-- اختر الشركة --', '-- Select Company --')}</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nameAr}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-stone-400 mb-1">
                <UserCheck className="w-3 h-3 inline me-1 text-amber-500" />
                {t('اختر الموظف للتعبئة التلقائية للاستمارة', 'Select Employee to Auto-Fill')}
              </label>
              <select
                value={selectedEmpId}
                onChange={(e) => {
                  setSelectedEmpId(e.target.value);
                  applyAutoFill(e.target.value, selectedCompId);
                }}
                className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-slate-50 dark:bg-[#0B1711] border border-slate-200 dark:border-[#243B2D] text-slate-900 dark:text-white"
              >
                <option value="">{t('-- اختر موظفاً لتعبئة الاستمارة فوراً --', '-- Pick Employee --')}</option>
                {allSelectableEmployees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} {emp.national_id ? `(${emp.national_id})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-stone-400 mb-1">
                {t('رقم الوارد التأميني (عند الإرسال لمركز العمليات)', 'Incoming No.')}
              </label>
              <input
                type="text"
                value={incomingNumber}
                onChange={(e) => setIncomingNumber(e.target.value)}
                placeholder="مثال: 2026/850"
                className="w-full px-3 py-2 rounded-xl text-xs font-mono font-bold bg-slate-50 dark:bg-[#0B1711] border border-slate-200 dark:border-[#243B2D] text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-stone-400 mb-1">
                {t('إرفاق نسخة الاستمارة الموقعة والمختومة', 'Signed Scanned Copy')}
              </label>
              <div className="flex items-center gap-2">
                <label className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 border border-amber-500/30 cursor-pointer truncate">
                  <Upload className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{signedScanName || t('رفع ملف موقع', 'Upload Scan')}</span>
                  <input type="file" accept="image/*,.pdf" onChange={handleSignedScanUpload} className="hidden" />
                </label>
                {signedScanData && (
                  <button
                    type="button"
                    onClick={() =>
                      onPreviewAttachment(
                        `معاينة الاستمارة الموقعة (${activeSubView})`,
                        createBlobUrlFromDataUrl(signedScanData),
                        signedScanName || 'signed_form'
                      )
                    }
                    className="px-2.5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs cursor-pointer"
                    title={t('معاينة النسخة الموقعة عبر Blob URL', 'Preview via Blob URL')}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Coordinates Alignment Mode Toolbar */}
        {alignMode && (activeSubView === 'س1' || activeSubView === 'س6') && (
          <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/40 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs font-bold text-amber-900 dark:text-amber-200">
              <span>
                {selectedFieldId
                  ? `الحقل المحدد للتحريك: (${
                      currentSpecs.find((s) => s.id === selectedFieldId)?.label || selectedFieldId
                    })`
                  : 'انقر على أي حقل فوق الاستمارة لتحريكه بالمللي وحفظ موضعه'}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => nudgeField(-1, 0)}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white dark:bg-[#0D1F17] border border-amber-500/40 cursor-pointer"
              >
                ▲ أعلى
              </button>
              <button
                type="button"
                onClick={() => nudgeField(1, 0)}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white dark:bg-[#0D1F17] border border-amber-500/40 cursor-pointer"
              >
                ▼ أسفل
              </button>
              <button
                type="button"
                onClick={() => nudgeField(0, -1)}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white dark:bg-[#0D1F17] border border-amber-500/40 cursor-pointer"
              >
                ▶ يمين
              </button>
              <button
                type="button"
                onClick={() => nudgeField(0, 1)}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white dark:bg-[#0D1F17] border border-amber-500/40 cursor-pointer"
              >
                ◀ يسار
              </button>
              <button
                type="button"
                onClick={() => nudgeField(0, 0, 4)}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white dark:bg-[#0D1F17] border border-amber-500/40 cursor-pointer"
              >
                + عرض
              </button>
              <button
                type="button"
                onClick={() => nudgeField(0, 0, -4)}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white dark:bg-[#0D1F17] border border-amber-500/40 cursor-pointer"
              >
                - عرض
              </button>
              <button
                type="button"
                onClick={handleResetCoords}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>استعادة الإحداثيات القياسية</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MAIN BODY: S1 or S6 Form Canvas + Live Editor Drawer */}
      {(activeSubView === 'س1' || activeSubView === 'س6') && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
          {/* Live Manual Data Entry & Editor Drawer (`نموذج إدخال وتعديل البيانات الحي`) */}
          {showLiveEditor && (
            <div className="xl:col-span-4 rounded-2xl bg-white dark:bg-[#112219] border border-amber-500/30 shadow-md overflow-hidden flex flex-col max-h-[1150px]">
              <div className="px-4 py-3.5 border-b border-slate-200 dark:border-[#22382B] bg-gradient-to-r from-amber-500/15 to-transparent flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <h3 className="text-xs font-black text-slate-900 dark:text-white">
                    {t(
                      `نموذج إدخال وتعديل البيانات الحي (${activeSubView})`,
                      `Live Form Data Editor (${activeSubView})`
                    )}
                  </h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300">
                  {t('مزامنة لحظية مع الاستمارة', 'Real-time Canvas Sync')}
                </span>
              </div>

              <div className="p-4 overflow-y-auto space-y-3 flex-1">
                {currentSpecs.map((spec) => (
                  <div key={spec.id}>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-stone-300 mb-1">
                      {spec.label}{' '}
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-normal">
                        ({spec.page === 'front' ? 'الوجه الأمامي' : 'ظهر الاستمارة'})
                      </span>
                    </label>
                    <input
                      type="text"
                      maxLength={spec.maxLength}
                      value={currentValues[spec.id] || ''}
                      onChange={(e) => {
                        const val = spec.isGrid
                          ? normalizeDigits(e.target.value).slice(0, spec.maxLength || 14)
                          : e.target.value;
                        setCurrentValues((prev) => ({ ...prev, [spec.id]: val }));
                      }}
                      className="w-full px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-50 dark:bg-[#0B1711] border border-slate-200 dark:border-[#243B2D] text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Official A4 Visual Preview Area (Front & Back Pages) */}
          <div className={`${showLiveEditor ? 'xl:col-span-8' : 'xl:col-span-12'} space-y-4`}>
            <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-white dark:bg-[#112219] border border-slate-200 dark:border-[#22382B]">
              <span className="text-xs font-bold text-slate-700 dark:text-stone-300">
                {activeSubView === 'س1'
                  ? 'معاينة حية مطابقة للأصل: استمارة س1 (الوجه الأمامي + الظهر) — أبعاد A4 القياسية (794×1123px)'
                  : 'معاينة حية مطابقة للأصل: استمارة س6 (الوجه الأمامي + الظهر) — أبعاد A4 القياسية (794×1123px)'}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setZoomScale((z) => Math.max(0.6, Number((z - 0.1).toFixed(1))))}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-[#172D21] text-slate-700 dark:text-stone-300 cursor-pointer"
                  title="تصغير"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-mono font-bold px-2 text-amber-700 dark:text-amber-400">
                  {Math.round(zoomScale * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoomScale((z) => Math.min(1.1, Number((z + 0.1).toFixed(1))))}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-[#172D21] text-slate-700 dark:text-stone-300 cursor-pointer"
                  title="تكبير"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-3xl bg-slate-200/70 dark:bg-[#08120D] p-4 border border-slate-300/80 dark:border-[#1E3427]">
              <div
                ref={printAreaRef}
                className="space-y-8 origin-top mx-auto"
                style={{
                  transform: `scale(${zoomScale})`,
                  transformOrigin: 'top center',
                }}
              >
                {activeSubView === 'س1' ? (
                  <>
                    {/* S1 Front */}
                    {renderA4CanvasPage(
                      '/insurance/form_bg.png',
                      DEFAULT_S1_SPECS.filter((s) => s.page === 'front'),
                      s1Values,
                      setS1Values,
                      s1Overrides
                    )}
                    {/* S1 Back */}
                    {renderA4CanvasPage(
                      '/insurance/form_bg_back.png',
                      DEFAULT_S1_SPECS.filter((s) => s.page === 'back'),
                      s1Values,
                      setS1Values,
                      s1Overrides
                    )}
                  </>
                ) : (
                  <>
                    {/* S6 Front */}
                    {renderA4CanvasPage(
                      '/insurance/form_s6_bg.jpg',
                      DEFAULT_S6_SPECS.filter((s) => s.page === 'front'),
                      s6Values,
                      setS6Values,
                      s6Overrides
                    )}
                    {/* S6 Back */}
                    {renderA4CanvasPage(
                      '/insurance/form_s6_bg_back.jpg',
                      DEFAULT_S6_SPECS.filter((s) => s.page === 'back'),
                      s6Values,
                      setS6Values,
                      s6Overrides
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FORM S2 VIEW: Official Annual Wage & Contribution Declaration (`استمارة س2`) */}
      {activeSubView === 'س2' && (
        <div
          ref={printAreaRef}
          className="rounded-3xl bg-white dark:bg-[#112219] border-2 border-amber-500/40 p-6 md:p-8 shadow-xl space-y-6"
        >
          {/* Official Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b-2 border-amber-500/40">
            <div>
              <p className="text-xs font-bold text-amber-700 dark:text-amber-400">
                الهيئة القومية للتأمين الاجتماعي — صندوق التأمين الاجتماعي للعاملين بالقطاع الخاص
              </p>
              <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                استمارة رقم (2) — طلب اشتراك منشأة أو إخطار تعديل بيانات المؤمن عليهم وأجورهم
              </h2>
              <p className="text-xs text-slate-500 dark:text-stone-400 mt-1">
                في 1 / 1 / {new Date().getFullYear()} (وفقاً لأحكام قانون التأمينات الاجتماعية والمعاشات رقم 148 لسنة 2019)
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-1 min-w-[240px]">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-stone-400">المنشأة:</span>
                <strong className="text-slate-900 dark:text-white">
                  {companies.find((c) => c.id === selectedCompId)?.nameAr || 'جميع المنشآت'}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-stone-400">إجمالي العاملين بالكشف:</span>
                <strong className="font-mono text-amber-700 dark:text-amber-300">
                  {s2CompanyEmployees.length} مؤمن عليه
                </strong>
              </div>
            </div>
          </div>

          {/* S2 Employees Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-[#0B1711] text-slate-800 dark:text-amber-300 font-bold border-y border-slate-300 dark:border-[#243B2D]">
                  <th className="p-2.5 border border-slate-200 dark:border-[#22382B] text-center">م</th>
                  <th className="p-2.5 border border-slate-200 dark:border-[#22382B] text-start">الرقم التأميني</th>
                  <th className="p-2.5 border border-slate-200 dark:border-[#22382B] text-start">اسم المؤمن عليه</th>
                  <th className="p-2.5 border border-slate-200 dark:border-[#22382B] text-start">الرقم القومي (14 رقم)</th>
                  <th className="p-2.5 border border-slate-200 dark:border-[#22382B] text-center">تاريخ الالتحاق</th>
                  <th className="p-2.5 border border-slate-200 dark:border-[#22382B] text-center">أجر الاشتراك التأميني (ج.م)</th>
                  <th className="p-2.5 border border-slate-200 dark:border-[#22382B] text-center">الأجر الشامل (ج.م)</th>
                  <th className="p-2.5 border border-slate-200 dark:border-[#22382B] text-center">حصة العامل (11%)</th>
                  <th className="p-2.5 border border-slate-200 dark:border-[#22382B] text-center">حصة المنشأة (18.75%)</th>
                  <th className="p-2.5 border border-slate-200 dark:border-[#22382B] text-center">إجمالي الاشتراك (29.75%)</th>
                </tr>
              </thead>
              <tbody>
                {s2CompanyEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-slate-500 dark:text-stone-400">
                      لا يوجد موظفون مسجلون حالياً في هذه المنشأة لإدراجهم في كشف استمارة (س2).
                    </td>
                  </tr>
                ) : (
                  s2CompanyEmployees.map(({ emp, calc }, i) => (
                    <tr key={emp.id} className="border-b border-slate-200 dark:border-[#1E3427]">
                      <td className="p-2.5 border border-slate-200 dark:border-[#22382B] text-center font-mono">
                        {i + 1}
                      </td>
                      <td className="p-2.5 border border-slate-200 dark:border-[#22382B] font-mono font-bold">
                        {emp.insurance_number || '—'}
                      </td>
                      <td className="p-2.5 border border-slate-200 dark:border-[#22382B] font-bold text-slate-900 dark:text-white">
                        {emp.name}
                      </td>
                      <td className="p-2.5 border border-slate-200 dark:border-[#22382B] font-mono">
                        {emp.national_id || '—'}
                      </td>
                      <td className="p-2.5 border border-slate-200 dark:border-[#22382B] text-center font-mono">
                        {emp.sub_start_date || emp.hire_date || '—'}
                      </td>
                      <td className="p-2.5 border border-slate-200 dark:border-[#22382B] text-center font-mono font-bold text-amber-700 dark:text-amber-400">
                        {calc.effectiveSubWage.toLocaleString('en-US')}
                      </td>
                      <td className="p-2.5 border border-slate-200 dark:border-[#22382B] text-center font-mono font-bold">
                        {calc.compWage.toLocaleString('en-US')}
                      </td>
                      <td className="p-2.5 border border-slate-200 dark:border-[#22382B] text-center font-mono">
                        {calc.employeeShare.toLocaleString('en-US')}
                      </td>
                      <td className="p-2.5 border border-slate-200 dark:border-[#22382B] text-center font-mono">
                        {calc.employerShare.toLocaleString('en-US')}
                      </td>
                      <td className="p-2.5 border border-slate-200 dark:border-[#22382B] text-center font-mono font-black text-emerald-700 dark:text-emerald-400">
                        {calc.totalContribution.toLocaleString('en-US')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Official Declaration Footer */}
          <div className="pt-4 border-t border-slate-200 dark:border-[#22382B] flex flex-col sm:flex-row justify-between gap-4 text-xs text-slate-600 dark:text-stone-300">
            <div>
              أقر أنا الموقع أدناه بصفتي (صاحب العمل / المدير المسؤول) بأن جميع البيانات والأجور الواردة بهذه الاستمارة صحيحة ومطابقة لسجلات المنشأة.
            </div>
            <div className="text-end font-bold">
              <div>توقيع صاحب العمل أو المدير المسؤول: ..............................</div>
              <div className="mt-2">خاتم المنشأة</div>
            </div>
          </div>
        </div>
      )}

      {/* ARCHIVE SUB-VIEW: Saved Official Forms (`ins_forms`) */}
      {activeSubView === 'archive' && (
        <div className="rounded-2xl bg-white dark:bg-[#112219] border border-slate-200/80 dark:border-[#22382B] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#0B1711] border-b border-slate-200 dark:border-[#22382B] text-slate-600 dark:text-amber-400 font-bold">
                  <th className="p-3">كود الاستمارة</th>
                  <th className="p-3">نوع الاستمارة</th>
                  <th className="p-3">الشركة / المنشأة</th>
                  <th className="p-3">اسم المؤمن عليه</th>
                  <th className="p-3">الرقم القومي / التأميني</th>
                  <th className="p-3">تاريخ الإصدار</th>
                  <th className="p-3">الحالة</th>
                  <th className="p-3 text-center">النسخة الموقعة</th>
                  <th className="p-3 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#1B3024]">
                {forms.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-10 text-center text-slate-500 dark:text-stone-400">
                      لا توجد استمارات محفوظة في الأرشيف بعد (0 استمارة).
                    </td>
                  </tr>
                ) : (
                  forms.map((frm) => (
                    <tr key={frm.id} className="hover:bg-slate-50/80 dark:hover:bg-[#152B20]/70">
                      <td className="p-3 font-mono font-bold text-amber-700 dark:text-amber-400">
                        {frm.form_code}
                      </td>
                      <td className="p-3">
                        <span className="px-2.5 py-1 rounded-lg font-bold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                          استمارة {frm.form_type}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-slate-800 dark:text-stone-200">
                        {frm.company_name || '—'}
                      </td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">
                        {frm.employee_name || '—'}
                      </td>
                      <td className="p-3 font-mono text-[11px] text-slate-600 dark:text-stone-300">
                        {frm.national_id || frm.insurance_number || '—'}
                      </td>
                      <td className="p-3 font-mono text-slate-600 dark:text-stone-300">
                        {frm.form_date}
                      </td>
                      <td className="p-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                          {frm.status}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        {frm.attachment_data ? (
                          <button
                            type="button"
                            onClick={() =>
                              onPreviewAttachment(
                                `نسخة استمارة ${frm.form_type} الموقعة (${frm.employee_name})`,
                                createBlobUrlFromDataUrl(frm.attachment_data!),
                                frm.attachment_name || 'signed_form'
                              )
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 cursor-pointer"
                          >
                            <Paperclip className="w-3 h-3" />
                            <span>معاينة</span>
                          </button>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              try {
                                const parsed =
                                  typeof frm.payload_json === 'string'
                                    ? JSON.parse(frm.payload_json)
                                    : frm.payload_json;
                                if (frm.form_type === 'س1') setS1Values(parsed);
                                if (frm.form_type === 'س6') setS6Values(parsed);
                                setActiveSubView(frm.form_type);
                              } catch {}
                            }}
                            title="فتح الاستمارة في المحرر والطباعة"
                            className="w-7 h-7 rounded-lg bg-amber-500/10 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/25 flex items-center justify-center cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              onOpenAuditLog(`سجل استمارة ${frm.form_code}`, frm.audit_log_json)
                            }
                            title="سجل التدقيق (!)"
                            className="w-7 h-7 rounded-lg bg-amber-500/15 hover:bg-amber-500/30 text-amber-800 dark:text-amber-300 border border-amber-500/35 flex items-center justify-center cursor-pointer"
                          >
                            <AlertCircle className="w-3.5 h-3.5" />
                          </button>

                          {canDelete && (
                            <button
                              type="button"
                              onClick={async () => {
                                await insuranceStorage.deleteForm(frm.id);
                                await onRefreshData();
                              }}
                              title="حذف الاستمارة"
                              className="w-7 h-7 rounded-lg bg-rose-500/10 hover:bg-rose-500/25 text-rose-600 dark:text-rose-400 border border-rose-500/25 flex items-center justify-center cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
