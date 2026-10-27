import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import {
  insuranceStorage,
  InsuredEmployeeRecord,
  OfficialFormRecord,
  calculateEmployeeContributions,
  normalizeDigits,
  createBlobUrlFromDataUrl,
} from '../../../services/insuranceStorage';
import { companyStorage } from '../companies/companyStorage';
import { signatoryStorage } from '../companies/signatoryStorage';
import { branchStorage } from '../companies/branchStorage';
import {
  FileText,
  Printer,
  Save,
  Send,
  Sliders,
  RotateCcw,
  Upload,
  Eye,
  EyeOff,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Building2,
  Paperclip,
  ZoomIn,
  ZoomOut,
  Search,
  ChevronDown,
  Shield,
  Briefcase,
  User,
  Sparkles,
  Check,
  X,
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
  isCheckbox?: boolean;
  checkboxGroup?: 'category' | 'med_exam' | 'fac_type';
  cellStep?: number;
  indent?: number;
  align?: 'center' | 'right' | 'left';
  fontSize?: number;
  placeholder?: string;
}

const DEFAULT_S1_SPECS: FieldCoordSpec[] = [
  { id: 'office_name', label: 'مكتب التأمينات', page: 'front', top: 42, right: 70, width: 156, height: 22, placeholder: 'مكتب التأمينات...' },
  { id: 'category_1', label: 'فئة (1): عاملين لدى الغير', page: 'front', top: 123, right: 250, width: 25, height: 22, align: 'center', isCheckbox: true, checkboxGroup: 'category' },
  { id: 'category_2', label: 'فئة (2): أصحاب أعمال لهم منشآت', page: 'front', top: 120, right: 657, width: 21, height: 21, align: 'center', isCheckbox: true, checkboxGroup: 'category' },
  { id: 'category_3', label: 'فئة (3): العاملين بالمخابز', page: 'front', top: 154, right: 252, width: 30, height: 22, align: 'center', isCheckbox: true, checkboxGroup: 'category' },
  { id: 'applicant_name', label: 'اسم مقدم الطلب', page: 'front', top: 218, right: 122, width: 243, height: 24, placeholder: 'اسم مقدم الطلب...' },
  { id: 'applicant_capacity', label: 'صفة مقدم الطلب', page: 'front', top: 219, right: 492, width: 254, height: 25, placeholder: 'صفة مقدم الطلب...' },
  { id: 'applicant_ins_num', label: 'الرقم التأميني لمقدم الطلب', page: 'front', top: 250, right: 107, width: 236, height: 27, maxLength: 9, isGrid: true, cellStep: 26, indent: 7.5 },
  { id: 'applicant_phone', label: 'رقم هاتف مقدم الطلب', page: 'front', top: 252, right: 461, width: 281, height: 24, placeholder: 'رقم الهاتف...' },
  { id: 'applicant_nat_id', label: 'الرقم القومي لمقدم الطلب (14 رقم)', page: 'front', top: 286, right: 104, width: 365, height: 25, maxLength: 14, isGrid: true, cellStep: 25.85, indent: 7.5 },
  { id: 'emp_ins_num', label: 'الرقم التأميني للمؤمن عليه', page: 'front', top: 363, right: 147, width: 235, height: 24, maxLength: 9, isGrid: true, cellStep: 25, indent: 7 },
  { id: 'emp_name', label: 'اسم المؤمن عليه الرباعي', page: 'front', top: 360, right: 510, width: 247, height: 28, placeholder: 'الاسم الرباعي للمؤمن عليه...' },
  { id: 'emp_nat_id', label: 'الرقم القومي للمؤمن عليه (14 رقم)', page: 'front', top: 395, right: 151, width: 365, height: 24, maxLength: 14, isGrid: true, cellStep: 25.78, indent: 7 },
  { id: 'emp_nationality', label: 'الجنسية', page: 'front', top: 394, right: 623, width: 126, height: 24, align: 'center', placeholder: 'الجنسية' },
  { id: 'emp_qualification', label: 'المؤهل الدراسي', page: 'front', top: 422, right: 103, width: 238, height: 23, placeholder: 'المؤهل الدراسي...' },
  { id: 'emp_profession', label: 'المهنة', page: 'front', top: 421, right: 395, width: 229, height: 23, placeholder: 'المهنة...' },
  { id: 'emp_sub_date_day', label: 'تاريخ بدء الاشتراك (يوم)', page: 'front', top: 446, right: 203, width: 46, height: 24, maxLength: 2, isGrid: true, cellStep: 21, indent: 6 },
  { id: 'emp_sub_date_month', label: 'تاريخ بدء الاشتراك (شهر)', page: 'front', top: 447, right: 265, width: 49, height: 24, maxLength: 2, isGrid: true, cellStep: 21.5, indent: 6 },
  { id: 'emp_sub_date_year', label: 'تاريخ بدء الاشتراك (سنة)', page: 'front', top: 447, right: 324, width: 93, height: 24, maxLength: 4, isGrid: true, cellStep: 21.25, indent: 6 },
  { id: 'emp_sector', label: 'القطاع', page: 'front', top: 453, right: 480, width: 145, height: 23, align: 'center', placeholder: 'القطاع' },
  { id: 'emp_sub_code', label: 'كود المهنة', page: 'front', top: 479, right: 125, width: 126, height: 23, align: 'center', placeholder: 'كود المهنة' },
  { id: 'emp_duration_type', label: 'نوع المدة', page: 'front', top: 479, right: 329, width: 125, height: 24, align: 'center', placeholder: 'نوع المدة' },
  { id: 'emp_wage_piasters', label: 'أجر الاشتراك (قرش)', page: 'front', top: 524, right: 147, width: 45, height: 21, align: 'center', maxLength: 2, placeholder: '00' },
  { id: 'emp_wage_pounds', label: 'أجر الاشتراك (جنيه)', page: 'front', top: 523, right: 196, width: 165, height: 20, align: 'center', placeholder: 'أجر الاشتراك' },
  { id: 'emp_comp_wage_piasters', label: 'الأجر الشامل (قرش)', page: 'front', top: 525, right: 432, width: 42, height: 20, align: 'center', maxLength: 2, placeholder: '00' },
  { id: 'emp_comp_wage_pounds', label: 'الأجر الشامل (جنيه)', page: 'front', top: 525, right: 480, width: 164, height: 20, align: 'center', placeholder: 'الأجر الشامل' },
  { id: 'emp_disability_start_day', label: 'بداية العجز (يوم)', page: 'front', top: 563, right: 325, width: 44, height: 24, maxLength: 2, isGrid: true, cellStep: 21, indent: 5 },
  { id: 'emp_disability_start_month', label: 'بداية العجز (شهر)', page: 'front', top: 562, right: 384, width: 49, height: 26, maxLength: 2, isGrid: true, cellStep: 22, indent: 5 },
  { id: 'emp_disability_start_year', label: 'بداية العجز (سنة)', page: 'front', top: 564, right: 444, width: 89, height: 24, maxLength: 4, isGrid: true, cellStep: 21, indent: 5 },
  { id: 'emp_disability_pct', label: 'نسبة العجز %', page: 'front', top: 563, right: 626, width: 78, height: 22, align: 'center' },
  { id: 'emp_med_exam_yes', label: 'استيفاء الكشف الطبي (نعم)', page: 'front', top: 595, right: 284, width: 32, height: 22, align: 'center', isCheckbox: true, checkboxGroup: 'med_exam' },
  { id: 'emp_med_exam_no', label: 'استيفاء الكشف الطبي (لا)', page: 'front', top: 591, right: 351, width: 31, height: 27, align: 'center', isCheckbox: true, checkboxGroup: 'med_exam' },
  { id: 'fac_type_1', label: 'كيان قانوني: فردي (1)', page: 'front', top: 671, right: 168, width: 31, height: 23, align: 'center', isCheckbox: true, checkboxGroup: 'fac_type' },
  { id: 'fac_type_2', label: 'كيان قانوني: أشخاص (2)', page: 'front', top: 674, right: 245, width: 30, height: 23, align: 'center', isCheckbox: true, checkboxGroup: 'fac_type' },
  { id: 'fac_type_3', label: 'كيان قانوني: أموال (3)', page: 'front', top: 673, right: 367, width: 30, height: 23, align: 'center', isCheckbox: true, checkboxGroup: 'fac_type' },
  { id: 'fac_type_4', label: 'كيان قانوني: أخرى (4)', page: 'front', top: 672, right: 485, width: 35, height: 25, align: 'center', isCheckbox: true, checkboxGroup: 'fac_type' },
  { id: 'fac_name', label: 'اسم المنشأة', page: 'front', top: 707, right: 121, width: 272, height: 23, placeholder: 'اسم المنشأة...' },
  { id: 'fac_number', label: 'رقم المنشأة التأميني', page: 'front', top: 705, right: 483, width: 230, height: 23, maxLength: 9, isGrid: true, cellStep: 25, indent: 7 },
  { id: 'res_building', label: 'رقم العقار', page: 'front', top: 785, right: 117, width: 56, height: 25, align: 'center' },
  { id: 'res_street', label: 'الشارع', page: 'front', top: 786, right: 248, width: 240, height: 23 },
  { id: 'res_village', label: 'القرية / المنطقة', page: 'front', top: 784, right: 553, width: 120, height: 23 },
  { id: 'res_center', label: 'المركز / القسم', page: 'front', top: 816, right: 113, width: 120, height: 22 },
  { id: 'res_gov', label: 'المحافظة', page: 'front', top: 814, right: 296, width: 152, height: 25 },
  { id: 'sig_phone', label: 'تليفون المؤمن عليه', page: 'front', top: 918, right: 149, width: 200, height: 24, align: 'center' },
  { id: 'sig_date_day', label: 'تاريخ التحرير (يوم)', page: 'front', top: 944, right: 104, width: 32, height: 24, maxLength: 2, align: 'center' },
  { id: 'sig_date_month', label: 'تاريخ التحرير (شهر)', page: 'front', top: 944, right: 146, width: 32, height: 24, maxLength: 2, align: 'center' },
  { id: 'sig_date_year', label: 'تاريخ التحرير (سنة)', page: 'front', top: 944, right: 188, width: 48, height: 24, maxLength: 4, align: 'center' },
  // Back Page
  { id: 'back_fac_name', label: 'اسم المنشأة (ظهر الاستمارة)', page: 'back', top: 454, right: 157, width: 328, height: 25 },
  { id: 'back_fac_ins_num', label: 'رقم المنشأة (ظهر الاستمارة)', page: 'back', top: 454, right: 587, width: 150, height: 25, align: 'center' },
  { id: 'back_fac_address', label: 'عنوان المنشأة (ظهر الاستمارة)', page: 'back', top: 484, right: 149, width: 600, height: 25 },
  { id: 'back_emp_name', label: 'اسم العامل بالإقرار', page: 'back', top: 678, right: 108, width: 220, height: 24 },
  { id: 'back_emp_job', label: 'وظيفة العامل بالإقرار', page: 'back', top: 678, right: 380, width: 148, height: 24 },
  { id: 'back_emp_hire_day', label: 'تاريخ استلام العمل (يوم)', page: 'back', top: 678, right: 595, width: 38, height: 24, align: 'center', maxLength: 2 },
  { id: 'back_emp_hire_month', label: 'تاريخ استلام العمل (شهر)', page: 'back', top: 678, right: 643, width: 38, height: 24, align: 'center', maxLength: 2 },
  { id: 'back_emp_hire_year', label: 'تاريخ استلام العمل (سنة)', page: 'back', top: 678, right: 690, width: 58, height: 24, align: 'center', maxLength: 4 },
  { id: 'back_emp_res_address', label: 'محل إقامة العامل بالإقرار', page: 'back', top: 707, right: 157, width: 400, height: 24 },
  { id: 'back_emp_phone', label: 'تليفون العامل بالإقرار', page: 'back', top: 707, right: 618, width: 130, height: 24, align: 'center' },
];

const DEFAULT_S6_SPECS: FieldCoordSpec[] = [
  { id: 's6_office_name', label: 'مكتب التأمينات', page: 'front', top: 48, right: 96, width: 155, height: 23, placeholder: 'مكتب التأمينات...' },
  { id: 's6_applicant_name', label: 'اسم مقدم الطلب', page: 'front', top: 174, right: 121, width: 247, height: 21, placeholder: 'اسم مقدم الطلب...' },
  { id: 's6_applicant_capacity', label: 'صفة مقدم الطلب', page: 'front', top: 177, right: 490, width: 240, height: 22, placeholder: 'صفة مقدم الطلب...' },
  { id: 's6_applicant_ins_num', label: 'الرقم التأميني لمقدم الطلب', page: 'front', top: 208, right: 117, width: 234, height: 24, maxLength: 9, isGrid: true, cellStep: 26, indent: 8 },
  { id: 's6_applicant_phone', label: 'تليفون مقدم الطلب', page: 'front', top: 207, right: 451, width: 260, height: 24, placeholder: 'رقم التليفون...' },
  { id: 's6_applicant_nat_id', label: 'الرقم القومي لمقدم الطلب (14 رقم)', page: 'front', top: 256, right: 124, width: 360, height: 20, maxLength: 14, isGrid: true, cellStep: 25.71, indent: 7.5 },
  { id: 's6_emp_ins_num', label: 'الرقم التأميني للمؤمن عليه', page: 'front', top: 330, right: 139, width: 208, height: 24, maxLength: 8, isGrid: true, cellStep: 26, indent: 8 },
  { id: 's6_emp_name', label: 'اسم المؤمن عليه', page: 'front', top: 334, right: 462, width: 240, height: 22, placeholder: 'اسم المؤمن عليه...' },
  { id: 's6_emp_nat_id', label: 'الرقم القومي للمؤمن عليه (14 رقم)', page: 'front', top: 361, right: 140, width: 358, height: 18, maxLength: 14, isGrid: true, cellStep: 25.57, indent: 7 },
  { id: 's6_fac_number', label: 'رقم المنشأة التأميني', page: 'front', top: 391, right: 141, width: 228, height: 22, maxLength: 9, isGrid: true, cellStep: 25.33, indent: 7 },
  { id: 's6_fac_name', label: 'اسم المنشأة', page: 'front', top: 392, right: 463, width: 240, height: 22, placeholder: 'اسم المنشأة...' },
  { id: 's6_exit_date_day', label: 'تاريخ انتهاء الاشتراك (يوم)', page: 'front', top: 422, right: 181, width: 53, height: 25, maxLength: 2, isGrid: true, cellStep: 26.5, indent: 8 },
  { id: 's6_exit_date_month', label: 'تاريخ انتهاء الاشتراك (شهر)', page: 'front', top: 422, right: 259, width: 53, height: 25, maxLength: 2, isGrid: true, cellStep: 26.5, indent: 8 },
  { id: 's6_exit_date_year', label: 'تاريخ انتهاء الاشتراك (سنة)', page: 'front', top: 423, right: 333, width: 104, height: 25, maxLength: 4, isGrid: true, cellStep: 26, indent: 8 },
  { id: 's6_resignation_reason', label: 'سبب انتهاء الاشتراك', page: 'front', top: 420, right: 591, width: 176, height: 28, placeholder: 'سبب انتهاء الاشتراك...' },
  // Back Page
  { id: 's6_back_fac_name', label: 'اسم المنشأة (ظهر س6)', page: 'back', top: 360, right: 143, width: 250, height: 24 },
  { id: 's6_back_fac_ins_num', label: 'رقم المنشأة (ظهر س6)', page: 'back', top: 358, right: 510, width: 233, height: 24, maxLength: 9, isGrid: true, cellStep: 25.88, indent: 7.5 },
  { id: 's6_back_fac_address', label: 'عنوان المنشأة (ظهر س6)', page: 'back', top: 402, right: 137, width: 605, height: 25 },
  { id: 's6_back_emp_name', label: 'اسم المؤمن عليه (ظهر س6)', page: 'back', top: 435, right: 194, width: 200, height: 25 },
  { id: 's6_back_emp_ins_num', label: 'الرقم التأميني للعامل (ظهر س6)', page: 'back', top: 438, right: 509, width: 234, height: 22, maxLength: 9, isGrid: true, cellStep: 26, indent: 8 },
];

type ApplicantRoleType = 'employer' | 'agent' | 'insured';
type S1CategoryType = '1' | '2' | '3';

/**
 * Interactive Segmented Digit Boxes (`CaroBoxes`)
 * Renders individual clickable digit cells directly over the official paper form's grid boxes
 * with automatic focus advance, Backspace navigation, and full-string paste support.
 */
const InteractiveCaroBoxes: React.FC<{
  spec: FieldCoordSpec;
  coord: { top: number; right: number; width: number; height: number };
  value: string;
  onChange: (newVal: string) => void;
  liveEditHighlight: boolean;
  alignMode: boolean;
  isSelected: boolean;
  onSelectForAlign: () => void;
}> = ({
  spec,
  coord,
  value,
  onChange,
  liveEditHighlight,
  alignMode,
  isSelected,
  onSelectForAlign,
}) => {
  const boxCount = spec.maxLength || 8;
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const cleanDigits = normalizeDigits(value || '').slice(0, boxCount);
  const chars = Array.from({ length: boxCount }, (_, i) => cleanDigits[i] || '');

  const updateDigitAt = (index: number, char: string) => {
    const nextChars = [...chars];
    nextChars[index] = char;
    onChange(nextChars.join('').replace(/\s+$/g, ''));
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (alignMode) return;
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (chars[index]) {
        updateDigitAt(index, '');
      } else if (index > 0) {
        updateDigitAt(index - 1, '');
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowRight' && index < boxCount - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (alignMode) return;
    const raw = normalizeDigits(e.target.value).replace(/\D/g, '');
    if (!raw) {
      updateDigitAt(index, '');
      return;
    }
    if (raw.length > 1) {
      // User pasted or typed multiple digits
      const nextChars = [...chars];
      for (let i = 0; i < raw.length && index + i < boxCount; i++) {
        nextChars[index + i] = raw[i];
      }
      onChange(nextChars.join(''));
      const nextFocus = Math.min(boxCount - 1, index + raw.length);
      inputRefs.current[nextFocus]?.focus();
      return;
    }
    updateDigitAt(index, raw[0]);
    if (index < boxCount - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (index: number, e: React.ClipboardEvent<HTMLInputElement>) => {
    if (alignMode) return;
    e.preventDefault();
    const pasted = normalizeDigits(e.clipboardData.getData('text')).replace(/\D/g, '');
    if (!pasted) return;
    const nextChars = [...chars];
    for (let i = 0; i < pasted.length && index + i < boxCount; i++) {
      nextChars[index + i] = pasted[i];
    }
    onChange(nextChars.join(''));
    const nextFocus = Math.min(boxCount - 1, index + pasted.length);
    inputRefs.current[nextFocus]?.focus();
  };

  const cellWidth = spec.cellStep || coord.width / boxCount;

  return (
    <div
      title={spec.label}
      onClick={() => {
        if (alignMode) onSelectForAlign();
      }}
      style={{
        position: 'absolute',
        top: `${coord.top}px`,
        right: `${coord.right}px`,
        width: `${coord.width}px`,
        height: `${coord.height}px`,
        zIndex: 12,
        direction: 'ltr',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: isSelected
          ? 'rgba(245, 158, 11, 0.35)'
          : alignMode
          ? 'rgba(245, 158, 11, 0.16)'
          : 'transparent',
        border: isSelected
          ? '2px solid #d97706'
          : alignMode
          ? '1px dashed #d97706'
          : 'none',
      }}
      className="caro-segmented-row"
    >
      {chars.map((ch, idx) => (
        <input
          key={idx}
          ref={(el) => {
            inputRefs.current[idx] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={2}
          value={ch}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onChange={(e) => handleChange(idx, e)}
          onPaste={(e) => handlePaste(idx, e)}
          style={{
            width: `${cellWidth}px`,
            height: `${coord.height}px`,
            textAlign: 'center',
            fontFamily: "'Courier New', monospace",
            fontSize: '15px',
            fontWeight: 900,
            color: '#07130E',
            padding: 0,
            margin: 0,
            outline: 'none',
            backgroundColor: liveEditHighlight ? 'rgba(245, 158, 11, 0.08)' : 'transparent',
            border: liveEditHighlight
              ? '1px solid rgba(217, 119, 6, 0.42)'
              : '1px solid transparent',
            borderRadius: '2px',
          }}
          className="caro-digit-cell focus:bg-amber-400/30 focus:border-amber-600 transition-colors"
        />
      ))}
    </div>
  );
};

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
  const [selectedEmpId, setSelectedEmpId] = useState<string>(initialEmployeeId || '');
  const [selectedCompId, setSelectedCompId] = useState<string>(
    selectedCompanyId !== 'all' ? selectedCompanyId : ''
  );

  // Smart Right-Hand Panel State
  const [applicantRole, setApplicantRole] = useState<ApplicantRoleType>('employer');
  const [selectedSignatoryId, setSelectedSignatoryId] = useState<string>('');
  const [s1Category, setS1Category] = useState<S1CategoryType>('1');

  // Floating Dock Search Dropdowns State
  const [companySearchText, setCompanySearchText] = useState<string>('');
  const [showCompanyDropdown, setShowCompanyDropdown] = useState<boolean>(false);
  const [employeeSearchText, setEmployeeSearchText] = useState<string>('');
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState<boolean>(false);

  // Interactive Modes
  const [liveEditHighlight, setLiveEditHighlight] = useState<boolean>(true);
  const [alignMode, setAlignMode] = useState<boolean>(false);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [zoomScale, setZoomScale] = useState<number>(0.92);

  // Operations & Attachment State
  const [incomingNumber, setIncomingNumber] = useState<string>('');
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

  // Real Today's Date Parts
  const todayParts = useMemo(() => {
    const d = new Date();
    return {
      day: String(d.getDate()).padStart(2, '0'),
      month: String(d.getMonth() + 1).padStart(2, '0'),
      year: String(d.getFullYear()),
    };
  }, []);

  // Clean Blank Default States (Zero hardcoded fake strings!)
  const createBlankS1Values = (): Record<string, string> => ({
    category_1: '✓',
    category_2: '',
    category_3: '',
    emp_med_exam_yes: '✓',
    emp_med_exam_no: '',
    sig_date_day: todayParts.day,
    sig_date_month: todayParts.month,
    sig_date_year: todayParts.year,
  });

  const createBlankS6Values = (): Record<string, string> => ({
    s6_exit_date_day: todayParts.day,
    s6_exit_date_month: todayParts.month,
    s6_exit_date_year: todayParts.year,
  });

  const [s1Values, setS1Values] = useState<Record<string, string>>(createBlankS1Values);
  const [s6Values, setS6Values] = useState<Record<string, string>>(createBlankS6Values);

  // Purge any legacy test strings from localStorage drafts on mount
  useEffect(() => {
    try {
      const legacyKeys = ['s1_form_draft', 's6_form_draft', 'insurance_form_draft'];
      legacyKeys.forEach((k) => {
        const raw = localStorage.getItem(k);
        if (
          raw &&
          (raw.includes('اختبار') ||
            raw.includes('30006160100454') ||
            raw.includes('555555555') ||
            raw.includes('ليسانس حقوق'))
        ) {
          localStorage.removeItem(k);
        }
      });
    } catch {}
  }, []);

  // Enrich companies with ECO's companyStorage, branchStorage, and signatoryStorage
  const enrichedCompanies = useMemo(() => {
    const storedCompanies = companyStorage.getCompaniesSync();
    const storedBranches = branchStorage.getBranchesSync();
    return companies.map((c) => {
      const fullComp = storedCompanies.find((sc) => sc.id === c.id || sc.nameAr === c.nameAr);
      const compBranch = storedBranches.find((b) => b.companyId === c.id);
      return {
        ...c,
        legalType: fullComp?.legalType || '',
        crNumber: fullComp?.crNumber || c.commercialReg || '',
        crOffice: fullComp?.crOffice || '',
        taxNumber: fullComp?.taxNumber || c.taxId || '',
        ceoAr: fullComp?.ceoAr || c.chairmanAr || compBranch?.managerAr || '',
        addressAr: c.addressAr || compBranch?.addressAr || compBranch?.cityAr || '',
        phone: c.phone || compBranch?.phone || '',
        socialInsuranceNo: c.socialInsuranceNo || '',
      };
    });
  }, [companies]);

  // Authorized Signatories from ECO's `إدارة الشركات -> المفوضون والصلاحيات`
  const companySignatories = useMemo(() => {
    const allSigs = signatoryStorage.getSignatoriesSync();
    if (!selectedCompId) return allSigs.filter((s) => s.status === 'active');
    const compSigs = allSigs.filter((s) => s.companyId === selectedCompId && s.status === 'active');
    return compSigs.length > 0 ? compSigs : allSigs.filter((s) => s.companyId === selectedCompId);
  }, [selectedCompId]);

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
        qualification: h.qualification || h.education || '',
        hire_date: h.hireDate || h.joinDate || '',
        sub_start_date: h.hireDate || h.joinDate || '',
        sub_wage: Number(h.basicSalary || h.salary || 0),
        comp_wage: Number(h.totalSalary || h.salary || 0),
        phone: h.phone || '',
      });
    });
    return list;
  }, [employees, hrEmployees, companies]);

  // Employees filtered by selected company for Floating Bottom Dock
  const companyFilteredEmployees = useMemo(() => {
    const base = selectedCompId
      ? allSelectableEmployees.filter((e) => !e.company_id || e.company_id === selectedCompId)
      : allSelectableEmployees;
    if (!employeeSearchText.trim()) return base;
    const q = employeeSearchText.trim().toLowerCase();
    return base.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        (e.national_id && e.national_id.includes(q)) ||
        (e.insurance_number && e.insurance_number.includes(q)) ||
        (e.code && e.code.toLowerCase().includes(q))
    );
  }, [allSelectableEmployees, selectedCompId, employeeSearchText]);

  const filteredCompaniesForDock = useMemo(() => {
    if (!companySearchText.trim()) return enrichedCompanies;
    const q = companySearchText.trim().toLowerCase();
    return enrichedCompanies.filter(
      (c) =>
        c.nameAr.toLowerCase().includes(q) ||
        (c.nameEn && c.nameEn.toLowerCase().includes(q)) ||
        (c.socialInsuranceNo && c.socialInsuranceNo.includes(q))
    );
  }, [enrichedCompanies, companySearchText]);

  // Helper to resolve Applicant Fields based on `صفة مقدم الطلب` (Employer / Agent / Insured)
  const computeApplicantFields = (
    role: ApplicantRoleType,
    compId: string,
    empId: string,
    signatoryId?: string
  ) => {
    const comp = enrichedCompanies.find((c) => c.id === compId);
    const emp = allSelectableEmployees.find((e) => e.id === empId);
    const allSigs = signatoryStorage.getSignatoriesSync();
    const compSigs = allSigs.filter((s) => !compId || s.companyId === compId);
    const chosenSig =
      compSigs.find((s) => s.id === signatoryId) ||
      compSigs.find((s) => s.status === 'active') ||
      compSigs[0];

    if (role === 'employer') {
      return {
        name: comp?.ceoAr || comp?.chairmanAr || '',
        capacity: comp ? 'صاحب العمل / المدير المسؤول' : '',
        insNum: normalizeDigits(comp?.socialInsuranceNo || '').slice(0, 9),
        natId: '',
        phone: comp?.phone || '',
      };
    }

    if (role === 'agent') {
      return {
        name: chosenSig?.nameAr || '',
        capacity: chosenSig?.roleAr || 'المفوض / الوكيل المعتمد',
        insNum: '',
        natId: normalizeDigits(chosenSig?.nationalId || '').slice(0, 14),
        phone: comp?.phone || '',
      };
    }

    // role === 'insured' (`المؤمن عليه (مستفيد)`)
    return {
      name: emp?.name || '',
      capacity: 'المؤمن عليه',
      insNum: normalizeDigits(emp?.insurance_number || '').slice(0, 9),
      natId: normalizeDigits(emp?.national_id || '').slice(0, 14),
      phone: emp?.phone || '',
    };
  };

  // Apply Auto-Fill when Company, Employee, or Applicant Role changes
  const applyAutoFill = (
    nextEmpId: string,
    nextCompId: string,
    nextRole: ApplicantRoleType = applicantRole,
    nextSigId: string = selectedSignatoryId
  ) => {
    const emp = allSelectableEmployees.find((e) => e.id === nextEmpId);
    const effectiveCompId = nextCompId || emp?.company_id || '';
    const comp = enrichedCompanies.find((c) => c.id === effectiveCompId);

    const applicant = computeApplicantFields(nextRole, effectiveCompId, nextEmpId, nextSigId);

    const rawSubDate = emp?.sub_start_date || emp?.hire_date || '';
    const [subY = '', subM = '', subD = ''] = rawSubDate ? rawSubDate.split('-') : ['', '', ''];

    const rawExitDate = emp?.resignation_date || '';
    const [exY = todayParts.year, exM = todayParts.month, exD = todayParts.day] = rawExitDate
      ? rawExitDate.split('-')
      : [todayParts.year, todayParts.month, todayParts.day];

    const facInsNum = normalizeDigits(comp?.socialInsuranceNo || '').slice(0, 9);
    const compAddress = comp?.addressAr || '';
    const officeName = emp?.office_name || comp?.crOffice || '';

    // Determine Legal Entity Checkbox (`الكيان القانوني للمنشأة`)
    const legalType = comp?.legalType || '';
    const isIndividual = legalType.includes('فردي');
    const isPersons = legalType.includes('أشخاص') || legalType.includes('تضامن') || legalType.includes('توصية');
    const isCapital = !isIndividual && !isPersons && Boolean(comp);

    // Split Wages into Pounds & Piasters
    const subWageNum = emp?.sub_wage ? Number(emp.sub_wage) : 0;
    const subPounds = subWageNum > 0 ? String(Math.floor(subWageNum)) : '';
    const subPiasters =
      subWageNum > 0 ? String(Math.round((subWageNum - Math.floor(subWageNum)) * 100)).padStart(2, '0') : '';

    const compWageNum = emp?.comp_wage ? Number(emp.comp_wage) : 0;
    const compPounds = compWageNum > 0 ? String(Math.floor(compWageNum)) : '';
    const compPiasters =
      compWageNum > 0 ? String(Math.round((compWageNum - Math.floor(compWageNum)) * 100)).padStart(2, '0') : '';

    const fullEmpAddress = [emp?.building_no, emp?.street, emp?.village, emp?.center, emp?.gov]
      .filter(Boolean)
      .join(' - ');

    setS1Values((prev) => ({
      ...prev,
      office_name: officeName || prev.office_name || '',
      applicant_name: applicant.name,
      applicant_capacity: applicant.capacity,
      applicant_ins_num: applicant.insNum,
      applicant_phone: applicant.phone,
      applicant_nat_id: applicant.natId,
      emp_ins_num: emp ? normalizeDigits(emp.insurance_number || '').slice(0, 9) : prev.emp_ins_num || '',
      emp_name: emp ? emp.name : prev.emp_name || '',
      emp_nat_id: emp ? normalizeDigits(emp.national_id || '').slice(0, 14) : prev.emp_nat_id || '',
      emp_nationality: emp ? 'مصري' : prev.emp_nationality || '',
      emp_qualification: emp ? emp.qualification || '' : prev.emp_qualification || '',
      emp_profession: emp ? emp.occupation || '' : prev.emp_profession || '',
      emp_sub_code: emp ? emp.occupation_code || '' : prev.emp_sub_code || '',
      emp_sub_date_day: emp ? subD : prev.emp_sub_date_day || '',
      emp_sub_date_month: emp ? subM : prev.emp_sub_date_month || '',
      emp_sub_date_year: emp ? subY : prev.emp_sub_date_year || '',
      emp_sector: emp || comp ? 'خاص' : prev.emp_sector || '',
      emp_duration_type: emp ? emp.duration_type || 'نمطي' : prev.emp_duration_type || '',
      emp_wage_piasters: emp ? subPiasters : prev.emp_wage_piasters || '',
      emp_wage_pounds: emp ? subPounds : prev.emp_wage_pounds || '',
      emp_comp_wage_piasters: emp ? compPiasters : prev.emp_comp_wage_piasters || '',
      emp_comp_wage_pounds: emp ? compPounds : prev.emp_comp_wage_pounds || '',
      fac_type_1: isIndividual ? '✓' : '',
      fac_type_2: isPersons ? '✓' : '',
      fac_type_3: isCapital ? '✓' : '',
      fac_type_4: '',
      fac_name: comp?.nameAr || emp?.company_name || prev.fac_name || '',
      fac_number: facInsNum || prev.fac_number || '',
      res_building: emp ? emp.building_no || '' : prev.res_building || '',
      res_street: emp ? emp.street || '' : prev.res_street || '',
      res_village: emp ? emp.village || '' : prev.res_village || '',
      res_center: emp ? emp.center || '' : prev.res_center || '',
      res_gov: emp ? emp.gov || '' : prev.res_gov || '',
      sig_phone: emp ? emp.phone || '' : prev.sig_phone || '',
      back_fac_name: comp?.nameAr || emp?.company_name || prev.back_fac_name || '',
      back_fac_ins_num: facInsNum || prev.back_fac_ins_num || '',
      back_fac_address: compAddress || prev.back_fac_address || '',
      back_emp_name: emp ? emp.name : prev.back_emp_name || '',
      back_emp_job: emp ? emp.occupation || '' : prev.back_emp_job || '',
      back_emp_hire_day: emp ? subD : prev.back_emp_hire_day || '',
      back_emp_hire_month: emp ? subM : prev.back_emp_hire_month || '',
      back_emp_hire_year: emp ? subY : prev.back_emp_hire_year || '',
      back_emp_res_address: emp ? fullEmpAddress : prev.back_emp_res_address || '',
      back_emp_phone: emp ? emp.phone || '' : prev.back_emp_phone || '',
    }));

    setS6Values((prev) => ({
      ...prev,
      s6_office_name: officeName || prev.s6_office_name || '',
      s6_applicant_name: applicant.name,
      s6_applicant_capacity: applicant.capacity,
      s6_applicant_ins_num: applicant.insNum,
      s6_applicant_phone: applicant.phone,
      s6_applicant_nat_id: applicant.natId,
      s6_emp_ins_num: emp ? normalizeDigits(emp.insurance_number || '').slice(0, 8) : prev.s6_emp_ins_num || '',
      s6_emp_name: emp ? emp.name : prev.s6_emp_name || '',
      s6_emp_nat_id: emp ? normalizeDigits(emp.national_id || '').slice(0, 14) : prev.s6_emp_nat_id || '',
      s6_fac_number: facInsNum || prev.s6_fac_number || '',
      s6_fac_name: comp?.nameAr || emp?.company_name || prev.s6_fac_name || '',
      s6_exit_date_day: emp ? exD : prev.s6_exit_date_day || todayParts.day,
      s6_exit_date_month: emp ? exM : prev.s6_exit_date_month || todayParts.month,
      s6_exit_date_year: emp ? exY : prev.s6_exit_date_year || todayParts.year,
      s6_resignation_reason: emp?.resignation_reason || prev.s6_resignation_reason || '',
      s6_back_fac_name: comp?.nameAr || emp?.company_name || prev.s6_back_fac_name || '',
      s6_back_fac_ins_num: facInsNum || prev.s6_back_fac_ins_num || '',
      s6_back_fac_address: compAddress || prev.s6_back_fac_address || '',
      s6_back_emp_name: emp ? emp.name : prev.s6_back_emp_name || '',
      s6_back_emp_ins_num: emp ? normalizeDigits(emp.insurance_number || '').slice(0, 9) : prev.s6_back_emp_ins_num || '',
    }));
  };

  // Trigger initial employee/company auto-fill if passed from Registry quick-jump
  useEffect(() => {
    if (initialEmployeeId) {
      setSelectedEmpId(initialEmployeeId);
      const emp = allSelectableEmployees.find((e) => e.id === initialEmployeeId);
      const cId = emp?.company_id || (selectedCompanyId !== 'all' ? selectedCompanyId : '');
      if (cId) setSelectedCompId(cId);
      applyAutoFill(initialEmployeeId, cId, applicantRole, selectedSignatoryId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialEmployeeId, initialFormType]);

  // Handle Applicant Role Toggle (`صاحب العمل` / `المفوض / الوكيل` / `المؤمن عليه (مستفيد)`)
  const handleSelectApplicantRole = (role: ApplicantRoleType, sigId?: string) => {
    setApplicantRole(role);
    const targetSigId = sigId !== undefined ? sigId : selectedSignatoryId || companySignatories[0]?.id || '';
    if (sigId !== undefined) setSelectedSignatoryId(sigId);
    const applicant = computeApplicantFields(role, selectedCompId, selectedEmpId, targetSigId);

    setS1Values((prev) => ({
      ...prev,
      applicant_name: applicant.name,
      applicant_capacity: applicant.capacity,
      applicant_ins_num: applicant.insNum,
      applicant_phone: applicant.phone,
      applicant_nat_id: applicant.natId,
    }));

    setS6Values((prev) => ({
      ...prev,
      s6_applicant_name: applicant.name,
      s6_applicant_capacity: applicant.capacity,
      s6_applicant_ins_num: applicant.insNum,
      s6_applicant_phone: applicant.phone,
      s6_applicant_nat_id: applicant.natId,
    }));
  };

  // Handle S1 Category Toggle (`عاملين لدى الغير` / `أصحاب أعمال لهم منشآت` / `العاملين بالمخابز`)
  const handleSelectS1Category = (cat: S1CategoryType) => {
    setS1Category(cat);
    setS1Values((prev) => ({
      ...prev,
      category_1: cat === '1' ? '✓' : '',
      category_2: cat === '2' ? '✓' : '',
      category_3: cat === '3' ? '✓' : '',
    }));
  };

  // Clear / Reset All Form Fields (`تفريغ الاستمارة`)
  const handleClearFormFields = () => {
    setSelectedEmpId('');
    setSelectedCompId('');
    setCompanySearchText('');
    setEmployeeSearchText('');
    setIncomingNumber('');
    setSignedScanData(null);
    setSignedScanName(null);
    setS1Category('1');
    setS1Values(createBlankS1Values());
    setS6Values(createBlankS6Values());
    setStatusMessage('تم تفريغ جميع حقول الاستمارة بنجاح');
    setTimeout(() => setStatusMessage(null), 3000);
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

  // Print Official Form (High Resolution A4 with zero UI chrome)
  const handlePrintOfficialForm = () => {
    if (!printAreaRef.current) return;
    // Clone DOM and ensure input values are baked into value attributes for printing
    const clone = printAreaRef.current.cloneNode(true) as HTMLElement;
    const origInputs = printAreaRef.current.querySelectorAll('input');
    const cloneInputs = clone.querySelectorAll('input');
    origInputs.forEach((inp, idx) => {
      if (cloneInputs[idx]) {
        cloneInputs[idx].setAttribute('value', inp.value);
      }
    });

    const win = window.open('', '_blank', 'width=900,height=1150');
    if (!win) return;

    win.document.write(`
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8" />
        <title>طباعة استمارة تأمينية رسمية (${activeSubView})</title>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@600;700;800;900&display=swap" rel="stylesheet">
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
            border: none !important;
            box-shadow: none !important;
          }
          .print-page-sheet img.bg-img {
            position: absolute;
            inset: 0;
            width: 794px;
            height: 1123px;
            object-fit: fill;
            z-index: 1;
          }
          .print-page-sheet input,
          .print-page-sheet button.paper-checkbox-btn {
            background: transparent !important;
            border: none !important;
            outline: none !important;
            box-shadow: none !important;
            color: #07130E !important;
            font-weight: 800 !important;
            z-index: 2;
          }
          .print-page-sheet input::placeholder {
            color: transparent !important;
          }
        </style>
      </head>
      <body>
        ${clone.innerHTML}
        <script>
          window.onload = () => {
            setTimeout(() => { window.print(); }, 400);
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
    const comp = enrichedCompanies.find((c) => c.id === selectedCompId);
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
        company_name: comp?.nameAr || s1Values.fac_name || s6Values.s6_fac_name || '',
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
          company_name: comp?.nameAr || s1Values.fac_name || s6Values.s6_fac_name || '',
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
        ? `تم حفظ استمارة (${activeSubView}) وإرسالها مباشرة لمركز العمليات التأمينية`
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

  // Toggle Checkbox directly on the paper form
  const handleTogglePaperCheckbox = (
    spec: FieldCoordSpec,
    setValues: React.Dispatch<React.SetStateAction<Record<string, string>>>
  ) => {
    if (alignMode) {
      setSelectedFieldId(spec.id);
      return;
    }
    if (spec.checkboxGroup === 'category') {
      const catNum = spec.id === 'category_1' ? '1' : spec.id === 'category_2' ? '2' : '3';
      handleSelectS1Category(catNum);
      return;
    }
    if (spec.checkboxGroup === 'med_exam') {
      const isYes = spec.id === 'emp_med_exam_yes';
      setValues((prev) => ({
        ...prev,
        emp_med_exam_yes: isYes ? (prev.emp_med_exam_yes === '✓' ? '' : '✓') : '',
        emp_med_exam_no: !isYes ? (prev.emp_med_exam_no === '✓' ? '' : '✓') : '',
      }));
      return;
    }
    if (spec.checkboxGroup === 'fac_type') {
      setValues((prev) => ({
        ...prev,
        fac_type_1: spec.id === 'fac_type_1' ? (prev.fac_type_1 === '✓' ? '' : '✓') : '',
        fac_type_2: spec.id === 'fac_type_2' ? (prev.fac_type_2 === '✓' ? '' : '✓') : '',
        fac_type_3: spec.id === 'fac_type_3' ? (prev.fac_type_3 === '✓' ? '' : '✓') : '',
        fac_type_4: spec.id === 'fac_type_4' ? (prev.fac_type_4 === '✓' ? '' : '✓') : '',
      }));
      return;
    }
    setValues((prev) => ({
      ...prev,
      [spec.id]: prev[spec.id] === '✓' ? '' : '✓',
    }));
  };

  // Render an Official Interactive A4 Page (794x1123px) where the user types & clicks directly on the paper
  const renderA4CanvasPage = (
    bgSrc: string,
    specs: FieldCoordSpec[],
    values: Record<string, string>,
    setValues: React.Dispatch<React.SetStateAction<Record<string, string>>>,
    overrides: Record<string, { top: number; right: number; width: number; height: number }>
  ) => {
    return (
      <div
        className="print-page-sheet relative bg-white shadow-2xl border-2 border-amber-500/40 mx-auto select-none rounded-sm"
        style={{
          width: '794px',
          height: '1123px',
          direction: 'rtl',
        }}
      >
        <img
          src={bgSrc}
          alt="Official Social Insurance Form"
          className="bg-img pointer-events-none absolute inset-0 w-[794px] h-[1123px] object-fill"
        />

        {specs.map((spec) => {
          const coord = overrides[spec.id] || spec;
          const isSelected = alignMode && selectedFieldId === spec.id;
          const val = values[spec.id] || '';

          // 1. Segmented Digit Boxes (`CaroBoxes`)
          if (spec.isGrid) {
            return (
              <InteractiveCaroBoxes
                key={spec.id}
                spec={spec}
                coord={coord}
                value={val}
                onChange={(nextVal) =>
                  setValues((prev) => ({
                    ...prev,
                    [spec.id]: nextVal,
                  }))
                }
                liveEditHighlight={liveEditHighlight}
                alignMode={alignMode}
                isSelected={isSelected}
                onSelectForAlign={() => setSelectedFieldId(spec.id)}
              />
            );
          }

          // 2. Interactive On-Paper Checkbox (`[✓]`)
          if (spec.isCheckbox) {
            const isChecked = val === '✓';
            return (
              <button
                key={spec.id}
                type="button"
                title={`${spec.label} (انقر للتأشير بـ ✓)`}
                onClick={() => handleTogglePaperCheckbox(spec, setValues)}
                style={{
                  position: 'absolute',
                  top: `${coord.top}px`,
                  right: `${coord.right}px`,
                  width: `${coord.width}px`,
                  height: `${coord.height}px`,
                  zIndex: 14,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: "'Cairo', sans-serif",
                  fontSize: '16px',
                  fontWeight: 900,
                  color: '#07130E',
                  cursor: 'pointer',
                  backgroundColor: isSelected
                    ? 'rgba(245, 158, 11, 0.4)'
                    : alignMode
                    ? 'rgba(245, 158, 11, 0.2)'
                    : liveEditHighlight
                    ? isChecked
                      ? 'rgba(245, 158, 11, 0.22)'
                      : 'rgba(245, 158, 11, 0.08)'
                    : 'transparent',
                  border: isSelected
                    ? '2px solid #d97706'
                    : alignMode
                    ? '1px dashed #d97706'
                    : liveEditHighlight
                    ? '1.5px solid rgba(217, 119, 6, 0.55)'
                    : 'none',
                  borderRadius: '4px',
                }}
                className="paper-checkbox-btn hover:bg-amber-500/25 transition-all"
              >
                {isChecked ? '✓' : ''}
              </button>
            );
          }

          // 3. Direct Inline Paper Input (Auto-scaling font size for long names/addresses)
          const dynamicFontSize =
            val.length > 36 ? 9.5 : val.length > 26 ? 10.5 : spec.fontSize || 12;

          return (
            <input
              key={spec.id}
              type="text"
              value={val}
              maxLength={spec.maxLength}
              placeholder={liveEditHighlight ? spec.placeholder || '' : ''}
              title={spec.label}
              onClick={() => {
                if (alignMode) setSelectedFieldId(spec.id);
              }}
              onChange={(e) => {
                const nextVal = e.target.value;
                setValues((prev) => ({
                  ...prev,
                  [spec.id]: nextVal,
                  // Sync front emp_name with back_emp_name automatically on S1/S6
                  ...(spec.id === 'emp_name' ? { back_emp_name: nextVal } : {}),
                  ...(spec.id === 'fac_name' ? { back_fac_name: nextVal } : {}),
                  ...(spec.id === 's6_emp_name' ? { s6_back_emp_name: nextVal } : {}),
                  ...(spec.id === 's6_fac_name' ? { s6_back_fac_name: nextVal } : {}),
                }));
              }}
              style={{
                position: 'absolute',
                top: `${coord.top}px`,
                right: `${coord.right}px`,
                width: `${coord.width}px`,
                height: `${coord.height}px`,
                zIndex: 10,
                direction: 'rtl',
                textAlign: spec.align || 'right',
                fontFamily: "'Cairo', sans-serif",
                fontSize: `${dynamicFontSize}px`,
                fontWeight: 800,
                paddingRight: spec.align === 'center' ? 0 : '4px',
                color: '#07130E',
                backgroundColor: isSelected
                  ? 'rgba(245, 158, 11, 0.35)'
                  : alignMode
                  ? 'rgba(245, 158, 11, 0.16)'
                  : liveEditHighlight
                  ? 'rgba(245, 158, 11, 0.06)'
                  : 'transparent',
                border: isSelected
                  ? '2px solid #d97706'
                  : alignMode
                  ? '1px dashed #d97706'
                  : liveEditHighlight
                  ? '1px dashed rgba(217, 119, 6, 0.45)'
                  : '1px solid transparent',
                borderRadius: '3px',
                outline: 'none',
              }}
              className="placeholder:text-amber-900/35 placeholder:font-normal focus:bg-amber-400/25 focus:border-amber-600 focus:border-solid transition-colors"
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
  const activeCompanyObj = enrichedCompanies.find((c) => c.id === selectedCompId);
  const activeEmployeeObj = allSelectableEmployees.find((e) => e.id === selectedEmpId);

  return (
    <div className="space-y-5 pb-24 relative">
      {/* Status Toast Banner */}
      {statusMessage && (
        <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-emerald-500/15 text-emerald-900 dark:text-emerald-200 border border-emerald-500/40 text-xs font-bold shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{statusMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="text-emerald-700 dark:text-emerald-300 hover:opacity-75 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Form Sub-Navigation Bar (S1 / S2 / S6 / Archive + Zoom Controls) */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-[#112219] border border-slate-200/80 dark:border-[#22382B] shadow-sm flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'س1', label: 'استمارة س1 (التحاق عامل بمنشأة)', badge: 'نموذج رقم 1' },
            { id: 'س2', label: 'استمارة س2 (تعديل الأجور والاشتراكات السنوية)', badge: 'نموذج رقم 2' },
            { id: 'س6', label: 'استمارة س6 (إخطار انتهاء اشتراك مؤمن عليه)', badge: 'نموذج رقم 6' },
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

        {/* Zoom & Quick Save Controls */}
        {activeSubView !== 'archive' && (
          <div className="flex flex-wrap items-center gap-2">
            {(activeSubView === 'س1' || activeSubView === 'س6') && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-slate-100 dark:bg-[#172D21] border border-slate-200 dark:border-[#243B2D]">
                <button
                  type="button"
                  onClick={() => setZoomScale((z) => Math.max(0.65, Number((z - 0.08).toFixed(2))))}
                  className="p-1 rounded-lg hover:bg-amber-500/20 text-slate-700 dark:text-stone-300 cursor-pointer"
                  title="تصغير الاستمارة"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-mono font-bold px-1.5 text-amber-700 dark:text-amber-400">
                  {Math.round(zoomScale * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoomScale((z) => Math.min(1.15, Number((z + 0.08).toFixed(2))))}
                  className="p-1 rounded-lg hover:bg-amber-500/20 text-slate-700 dark:text-stone-300 cursor-pointer"
                  title="تكبير الاستمارة"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {canCreate && (
              <button
                type="button"
                onClick={() => handleSaveForm(false)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-[#172D21] dark:hover:bg-[#1E3A2B] text-slate-800 dark:text-stone-200 border border-slate-200 dark:border-[#284534] cursor-pointer"
              >
                <Save className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>{t('حفظ بالأرشيف', 'Save to Archive')}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Coordinates Alignment Mode Toolbar (Shown when 🎯 Calibration Mode is active) */}
      {alignMode && (activeSubView === 'س1' || activeSubView === 'س6') && (
        <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>
              {selectedFieldId
                ? `الحقل المحدد للتحريك: (${
                    currentSpecs.find((s) => s.id === selectedFieldId)?.label || selectedFieldId
                  })`
                : 'انقر على أي حقل أو مربع فوق الاستمارة لتحريكه بالمللي وحفظ موضعه للطباعة'}
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

      {/* MAIN WORKSPACE FOR S1 & S6: Right-Hand Smart Control Panel + Interactive On-Paper Form Centerpiece */}
      {(activeSubView === 'س1' || activeSubView === 'س6') && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
          {/* RIGHT-HAND SMART CONTROL PANEL (`لوحة التحكم الذكية على يمين الاستمارة`) */}
          <div className="xl:col-span-3 xl:sticky xl:top-24 space-y-4">
            <div className="rounded-3xl bg-gradient-to-b from-white via-[#FFFDF8] to-[#FEF9EC] dark:from-[#0D1F17] dark:via-[#11251B] dark:to-[#0A1811] border border-amber-500/35 shadow-xl p-4 space-y-4">
              {/* Panel Header */}
              <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 flex items-center justify-center shadow-sm">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-900 dark:text-white">
                      {t('لوحة التحكم الذكية بالاستمارة', 'Smart Form Control Panel')}
                    </h3>
                    <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">
                      {t('تعبئة فورية وتحديد صفة مقدم الطلب', 'Instant Auto-Fill & Capacity')}
                    </span>
                  </div>
                </div>
              </div>

              {/* 1. `صفة مقدم الطلب` (Applicant Capacity Radio/Pill Selector) */}
              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-xs font-black text-slate-800 dark:text-amber-300">
                  <Shield className="w-3.5 h-3.5 text-amber-500" />
                  <span>{t('صفة مقدم الطلب:', 'Applicant Capacity:')}</span>
                </label>

                <div className="space-y-1.5">
                  {[
                    {
                      id: 'employer' as ApplicantRoleType,
                      label: 'صاحب العمل',
                      sub: 'رئيس مجلس الإدارة / المدير المسؤول',
                      icon: Building2,
                    },
                    {
                      id: 'agent' as ApplicantRoleType,
                      label: 'المفوض / الوكيل',
                      sub: 'من سجل المفوضين والتوكيلات بالشركة',
                      icon: Briefcase,
                    },
                    {
                      id: 'insured' as ApplicantRoleType,
                      label: 'المؤمن عليه (مستفيد)',
                      sub: 'بيانات الموظف نفسه كمقدم للطلب',
                      icon: User,
                    },
                  ].map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = applicantRole === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectApplicantRole(opt.id)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-2xl border text-start transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-gradient-to-r from-amber-500/20 to-amber-500/5 border-amber-500 text-slate-900 dark:text-white shadow-xs'
                            : 'bg-white/70 dark:bg-[#09150F]/70 border-slate-200/80 dark:border-[#1E3427] text-slate-700 dark:text-stone-300 hover:border-amber-500/40'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'bg-amber-500 text-slate-950 font-bold'
                                : 'bg-slate-100 dark:bg-[#15291E] text-amber-600 dark:text-amber-400'
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-black truncate">{opt.label}</div>
                            <div className="text-[10px] text-slate-500 dark:text-stone-400 truncate">
                              {opt.sub}
                            </div>
                          </div>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'border-amber-500 bg-amber-500 text-slate-950'
                              : 'border-slate-300 dark:border-stone-600'
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Signatory Selector if `المفوض / الوكيل` is active and signatories exist */}
                {applicantRole === 'agent' && companySignatories.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1.5">
                    <label className="block text-[10px] font-bold text-amber-800 dark:text-amber-300">
                      اختر المفوض المعتمد من الشركة:
                    </label>
                    <select
                      value={selectedSignatoryId || companySignatories[0]?.id || ''}
                      onChange={(e) => handleSelectApplicantRole('agent', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-[#0B1711] border border-amber-500/30 text-slate-900 dark:text-white"
                    >
                      {companySignatories.map((sig) => (
                        <option key={sig.id} value={sig.id}>
                          {sig.nameAr} ({sig.roleAr})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* 2. `الفئة` (Category Radio/Pill Selector for S1) OR `سبب انتهاء الاشتراك` (for S6) */}
              {activeSubView === 'س1' ? (
                <div className="space-y-2 pt-3 border-t border-amber-500/20">
                  <label className="flex items-center gap-1.5 text-xs font-black text-slate-800 dark:text-amber-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                    <span>{t('الفئة (تؤشر تلقائياً على الاستمارة):', 'Insured Category:')}</span>
                  </label>
                  <div className="space-y-1.5">
                    {[
                      { id: '1' as S1CategoryType, label: 'عاملين لدى الغير', box: 'مربع 1' },
                      { id: '2' as S1CategoryType, label: 'أصحاب أعمال لهم منشآت', box: 'مربع 2' },
                      { id: '3' as S1CategoryType, label: 'العاملين بالمخابز', box: 'مربع 3' },
                    ].map((cat) => {
                      const isSelected = s1Category === cat.id || s1Values[`category_${cat.id}`] === '✓';
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => handleSelectS1Category(cat.id)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-amber-500/20 border-amber-500 text-amber-950 dark:text-amber-200'
                              : 'bg-white/70 dark:bg-[#09150F]/70 border-slate-200 dark:border-[#1E3427] text-slate-700 dark:text-stone-300 hover:border-amber-500/40'
                          }`}
                        >
                          <span>{cat.label}</span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-amber-500/15 text-amber-800 dark:text-amber-300">
                            {isSelected ? '✓ ' : ''}
                            {cat.box}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="space-y-2 pt-3 border-t border-amber-500/20">
                  <label className="flex items-center gap-1.5 text-xs font-black text-slate-800 dark:text-amber-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                    <span>{t('سبب انتهاء الاشتراك (س6):', 'Termination Reason (S6):')}</span>
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      'استقالة',
                      'انتهاء مدة العقد',
                      'بلوغ سن المعاش',
                      'الانقطاع عن العمل',
                      'الوفاة',
                      'العجز الكامل',
                      'فسخ العقد',
                      'إلغاء النشاط',
                    ].map((reason) => {
                      const active = s6Values.s6_resignation_reason === reason;
                      return (
                        <button
                          key={reason}
                          type="button"
                          onClick={() =>
                            setS6Values((prev) => ({ ...prev, s6_resignation_reason: reason }))
                          }
                          className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                            active
                              ? 'bg-amber-500 text-slate-950 border-amber-600'
                              : 'bg-white/70 dark:bg-[#09150F]/70 border-slate-200 dark:border-[#1E3427] text-slate-700 dark:text-stone-300 hover:border-amber-500/40'
                          }`}
                        >
                          {reason}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 3. Quick Attachment & Incoming Number Box (`رقم الوارد التأميني` + `إرفاق النسخة الموقعة`) */}
              <div className="space-y-2.5 pt-3 border-t border-amber-500/20">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-stone-300 mb-1">
                    {t('رقم الوارد التأميني (للعمليات):', 'Incoming No. (Operations):')}
                  </label>
                  <input
                    type="text"
                    value={incomingNumber}
                    onChange={(e) => setIncomingNumber(e.target.value)}
                    placeholder="مثال: 2026/850"
                    className="w-full px-3 py-2 rounded-xl text-xs font-mono font-bold bg-white dark:bg-[#09150F] border border-amber-500/30 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-stone-300 mb-1">
                    {t('إرفاق النسخة الموقعة والمختومة:', 'Attach Signed Copy:')}
                  </label>
                  <div className="flex items-center gap-1.5">
                    <label className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 dark:text-amber-300 border border-amber-500/35 cursor-pointer truncate">
                      <Upload className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">
                        {signedScanName || t('رفع PDF / صورة', 'Upload Scan')}
                      </span>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleSignedScanUpload}
                        className="hidden"
                      />
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
                        className="p-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs cursor-pointer"
                        title={t('معاينة النسخة الموقعة عبر Blob URL', 'Preview via Blob URL')}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Direct On-Paper Interactive Guide Pill */}
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-[11px] text-amber-900 dark:text-amber-200 leading-relaxed">
                <strong className="block mb-0.5 text-amber-700 dark:text-amber-400">
                  💡 تفاعل مباشر على الورقة:
                </strong>
                انقر مباشرة داخل أي خانة أو مربع رقمي أو علامة صح (✓) فوق الاستمارة للكتابة أو التعديل الفوري.
              </div>
            </div>
          </div>

          {/* CENTERPIECE: Interactive Official Paper Form (Front & Back A4 Sheets) */}
          <div className="xl:col-span-9 space-y-4">
            <div className="overflow-x-auto rounded-3xl bg-slate-200/75 dark:bg-[#07110C] p-4 md:p-6 border border-amber-500/25 shadow-inner">
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
                    {/* S1 Front Page */}
                    {renderA4CanvasPage(
                      '/insurance/form_bg.png',
                      DEFAULT_S1_SPECS.filter((s) => s.page === 'front'),
                      s1Values,
                      setS1Values,
                      s1Overrides
                    )}
                    {/* S1 Back Page */}
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
                    {/* S6 Front Page */}
                    {renderA4CanvasPage(
                      '/insurance/form_s6_bg.jpg',
                      DEFAULT_S6_SPECS.filter((s) => s.page === 'front'),
                      s6Values,
                      setS6Values,
                      s6Overrides
                    )}
                    {/* S6 Back Page */}
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
                  {activeCompanyObj?.nameAr || 'جميع المنشآت'}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-stone-400">رقم المنشأة التأميني:</span>
                <strong className="font-mono text-amber-700 dark:text-amber-300">
                  {activeCompanyObj?.socialInsuranceNo || '—'}
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
              أقر أنا الموقع أدناه بصفتي ({s1Values.applicant_capacity || 'صاحب العمل / المدير المسؤول'}) بأن جميع البيانات والأجور الواردة بهذه الاستمارة صحيحة ومطابقة لسجلات المنشأة.
            </div>
            <div className="text-end font-bold">
              <div>توقيع صاحب العمل أو المدير المسؤول: {s1Values.applicant_name || '..............................'}</div>
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

      {/* FLOATING BOTTOM GLASS DOCK (`شريط التحكم العائم أسفل الشاشة`) */}
      {activeSubView !== 'archive' && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 max-w-[96vw]">
          <div className="backdrop-blur-xl bg-[#07130E]/92 dark:bg-[#0D1F17]/95 border border-amber-500/40 shadow-2xl shadow-black/40 rounded-full px-4 md:px-6 py-2.5 flex flex-wrap items-center justify-center gap-2.5 md:gap-3">
            {/* 1. Searchable Company Pill (`اختر الشركة`) */}
            <div className="relative">
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-amber-500/35 text-xs text-white transition-all">
                <Building2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <input
                  type="text"
                  value={
                    showCompanyDropdown
                      ? companySearchText
                      : activeCompanyObj?.nameAr || companySearchText
                  }
                  onFocus={() => {
                    setCompanySearchText('');
                    setShowCompanyDropdown(true);
                    setShowEmployeeDropdown(false);
                  }}
                  onChange={(e) => {
                    setCompanySearchText(e.target.value);
                    setShowCompanyDropdown(true);
                  }}
                  placeholder={t('ابحث عن شركة (اسم/رقم)...', 'Search Company...')}
                  className="bg-transparent text-xs font-bold text-amber-100 placeholder:text-stone-400 focus:outline-none w-36 md:w-44"
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowCompanyDropdown((v) => !v);
                    setShowEmployeeDropdown(false);
                  }}
                  className="text-amber-400 hover:text-amber-300 cursor-pointer"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {showCompanyDropdown && (
                <div className="absolute bottom-full mb-2 right-0 w-72 max-h-64 overflow-y-auto rounded-2xl bg-[#0B1B13] border border-amber-500/40 shadow-2xl p-1.5 z-50">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-amber-400 border-b border-amber-500/20 flex items-center justify-between">
                    <span>اختر الشركة للتعبئة التلقائية</span>
                    <button
                      type="button"
                      onClick={() => setShowCompanyDropdown(false)}
                      className="text-stone-400 hover:text-white cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  {filteredCompaniesForDock.length === 0 ? (
                    <div className="p-3 text-center text-xs text-stone-400">
                      لا توجد شركات مطابقة
                    </div>
                  ) : (
                    filteredCompaniesForDock.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setSelectedCompId(c.id);
                          setCompanySearchText(c.nameAr);
                          setShowCompanyDropdown(false);
                          applyAutoFill(selectedEmpId, c.id, applicantRole, selectedSignatoryId);
                        }}
                        className={`w-full text-start px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                          selectedCompId === c.id
                            ? 'bg-amber-500 text-slate-950'
                            : 'text-stone-200 hover:bg-amber-500/15'
                        }`}
                      >
                        <span className="truncate">{c.nameAr}</span>
                        {c.socialInsuranceNo && (
                          <span className="font-mono text-[10px] opacity-80 ms-2">
                            #{c.socialInsuranceNo}
                          </span>
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* 2. Searchable Employee Pill (`اختر الموظف`) */}
            <div className="relative">
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-amber-500/35 text-xs text-white transition-all">
                <Search className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <input
                  type="text"
                  value={
                    showEmployeeDropdown
                      ? employeeSearchText
                      : activeEmployeeObj?.name || employeeSearchText
                  }
                  onFocus={() => {
                    setEmployeeSearchText('');
                    setShowEmployeeDropdown(true);
                    setShowCompanyDropdown(false);
                  }}
                  onChange={(e) => {
                    setEmployeeSearchText(e.target.value);
                    setShowEmployeeDropdown(true);
                  }}
                  placeholder={t('ابحث عن موظف...', 'Search Employee...')}
                  className="bg-transparent text-xs font-bold text-amber-100 placeholder:text-stone-400 focus:outline-none w-36 md:w-44"
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowEmployeeDropdown((v) => !v);
                    setShowCompanyDropdown(false);
                  }}
                  className="text-amber-400 hover:text-amber-300 cursor-pointer"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {showEmployeeDropdown && (
                <div className="absolute bottom-full mb-2 right-0 w-80 max-h-64 overflow-y-auto rounded-2xl bg-[#0B1B13] border border-amber-500/40 shadow-2xl p-1.5 z-50">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-amber-400 border-b border-amber-500/20 flex items-center justify-between">
                    <span>اختر الموظف لتعبئة الاستمارة فوراً</span>
                    <button
                      type="button"
                      onClick={() => setShowEmployeeDropdown(false)}
                      className="text-stone-400 hover:text-white cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  {companyFilteredEmployees.length === 0 ? (
                    <div className="p-3 text-center text-xs text-stone-400">
                      لا يوجد موظفون مطابقون للبحث
                    </div>
                  ) : (
                    companyFilteredEmployees.map((emp) => (
                      <button
                        key={emp.id}
                        type="button"
                        onClick={() => {
                          setSelectedEmpId(emp.id);
                          const targetCompId = emp.company_id || selectedCompId;
                          if (emp.company_id) setSelectedCompId(emp.company_id);
                          setEmployeeSearchText(emp.name);
                          setShowEmployeeDropdown(false);
                          applyAutoFill(emp.id, targetCompId, applicantRole, selectedSignatoryId);
                        }}
                        className={`w-full text-start px-3 py-2 rounded-xl text-xs font-bold flex flex-col gap-0.5 transition-colors cursor-pointer ${
                          selectedEmpId === emp.id
                            ? 'bg-amber-500 text-slate-950'
                            : 'text-stone-200 hover:bg-amber-500/15'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="truncate">{emp.name}</span>
                          {emp.insurance_number && (
                            <span className="font-mono text-[10px] opacity-85">
                              تأميني: {emp.insurance_number}
                            </span>
                          )}
                        </div>
                        {emp.national_id && (
                          <span className="font-mono text-[10px] opacity-75">
                            قومي: {emp.national_id}
                          </span>
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="h-6 w-px bg-amber-500/30 hidden sm:block" />

            {/* 3. Dock Action Icon Buttons (with Tooltips) */}
            <div className="flex items-center gap-2">
              {/* 🗑️ Clear/Reset Form Fields */}
              <button
                type="button"
                onClick={handleClearFormFields}
                title="تفريغ الاستمارة"
                aria-label="تفريغ الاستمارة"
                className="w-9 h-9 rounded-full bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/40 flex items-center justify-center transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {/* 👁️ Live Preview / Direct Edit Highlight Toggle */}
              <button
                type="button"
                onClick={() => setLiveEditHighlight((v) => !v)}
                title="وضع المعاينة الحية / التعديل المباشر"
                aria-label="وضع المعاينة الحية / التعديل المباشر"
                className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                  liveEditHighlight
                    ? 'bg-amber-500/25 border-amber-400 text-amber-300'
                    : 'bg-white/10 border-white/20 text-stone-300 hover:bg-white/20'
                }`}
              >
                {liveEditHighlight ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>

              {/* 🎯 Coordinate Calibration Mode */}
              <button
                type="button"
                onClick={() => setAlignMode((v) => !v)}
                title="وضع ضبط الإحداثيات والطباعة"
                aria-label="وضع ضبط الإحداثيات والطباعة"
                className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                  alignMode
                    ? 'bg-amber-500 border-amber-300 text-slate-950 shadow-md shadow-amber-500/30'
                    : 'bg-white/10 border-white/20 text-stone-300 hover:bg-white/20'
                }`}
              >
                <Sliders className="w-4 h-4" />
              </button>

              {/* 🚀 Save & Send to Operations Center */}
              {canCreate && (
                <button
                  type="button"
                  onClick={() => handleSaveForm(true)}
                  title="حفظ وإرسال لمركز العمليات التأمينية"
                  aria-label="حفظ وإرسال لمركز العمليات التأمينية"
                  className="inline-flex items-center gap-1.5 px-3.5 h-9 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/25 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">إرسال للعمليات</span>
                </button>
              )}

              {/* 🖨️ Print Official Form (A4) */}
              <button
                type="button"
                onClick={handlePrintOfficialForm}
                title="طباعة الاستمارة الرسمية (A4)"
                aria-label="طباعة الاستمارة الرسمية (A4)"
                className="inline-flex items-center gap-1.5 px-4 h-9 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/30 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة A4</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
