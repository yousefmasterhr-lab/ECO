import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { motion } from 'framer-motion';
import { 
  HardHat, 
  Layers, 
  FileCheck2, 
  HelpCircle, 
  ScrollText, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  FileText,
  Building,
  TrendingUp,
  ShieldAlert,
  ChevronRight,
  Eye,
  Calendar,
  Calculator
} from 'lucide-react';

interface EngineeringProject {
  id: string;
  code: string;
  name: string;
  clientName: string;
  consultantName: string;
  contractorName: string;
  contractValue: number;
  startDate: string;
  plannedEndDate: string;
  status: 'Active' | 'Suspended' | 'Handed_Over';
  statusAr: string;
  progressPercent: number;
  driveFolderId: string;
}

interface EngineeringSubmittal {
  id: string;
  submittalNo: string;
  projectCode: string;
  title: string;
  type: 'SHOP_DRAWING' | 'MATERIAL_SAMPLE' | 'METHOD_STATEMENT';
  typeAr: string;
  revision: number;
  status: 'APPROVED_A' | 'APPROVED_COMMENTS_B' | 'PENDING_REVIEW' | 'REJECTED_C';
  statusAr: string;
  submissionDate: string;
  consultantReviewer: string;
  driveCadId: string;
}

interface EngineeringRFI {
  id: string;
  rfiNumber: string;
  projectCode: string;
  subject: string;
  question: string;
  answer?: string;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'BLOCKING';
  status: 'OPEN' | 'ANSWERED' | 'CLOSED';
  submittedDate: string;
  requiredByDate: string;
}

interface SiteLicense {
  id: string;
  projectCode: string;
  licenseType: string;
  licenseNumber: string;
  issuingAuthority: string;
  issueDate: string;
  expiryDate: string;
  daysRemaining: number;
  status: 'ACTIVE' | 'RENEWAL_REQUIRED' | 'EXPIRED';
  driveScanId: string;
}

const MOCK_PROJECTS: EngineeringProject[] = [
  {
    id: 'prj_01',
    code: 'PRJ-TOW-01',
    name: 'مشروع إنشاء البرج الإداري والتجاري (ألفا)',
    clientName: 'جهاز تنمية وتعمير مدينة القاهرة الجديدة',
    consultantName: 'مكتب دار الهندسة للاستشارات',
    contractorName: 'أركان للإنشاءات الهندسية',
    contractValue: 68500000,
    startDate: '2024-01-15',
    plannedEndDate: '2026-12-30',
    status: 'Active',
    statusAr: 'قيد التنفيذ النشط',
    progressPercent: 68,
    driveFolderId: 'eng_drive_prj_tow_01'
  },
  {
    id: 'prj_02',
    code: 'PRJ-MED-04',
    name: 'مجمع المراكز الطبية التخصصية المتكامل',
    clientName: 'وزارة الصحة والسكان',
    consultantName: 'المكتب العربي للاستشارات الهندسية (ACE)',
    contractorName: 'أركان للإنشاءات الهندسية',
    contractValue: 42000000,
    startDate: '2024-06-01',
    plannedEndDate: '2027-02-28',
    status: 'Active',
    statusAr: 'قيد التشطيبات الإنشائية',
    progressPercent: 84,
    driveFolderId: 'eng_drive_prj_med_04'
  },
  {
    id: 'prj_03',
    code: 'PRJ-RES-08',
    name: 'كمبوند فلل الياسمين السكني الفاخر',
    clientName: 'أركان للتطوير العقاري والاستثمار',
    consultantName: 'مكتب صبور للاستشارات الهندسية',
    contractorName: 'أركان للإنشاءات الهندسية',
    contractValue: 95000000,
    startDate: '2025-02-10',
    plannedEndDate: '2027-11-15',
    status: 'Active',
    statusAr: 'أعمال الهيكل الخرساني والأساسات',
    progressPercent: 32,
    driveFolderId: 'eng_drive_prj_res_08'
  }
];

const MOCK_SUBMITTALS: EngineeringSubmittal[] = [
  {
    id: 'sub_01',
    submittalNo: 'PRJ-TOW-SUB-STR-0042',
    projectCode: 'PRJ-TOW-01',
    title: 'مخططات ورشة تسليح بلاطات الدور الخامس والسادس (Solid Slab & Beams)',
    type: 'SHOP_DRAWING',
    typeAr: 'مخطط شوب دروينج إشائي',
    revision: 1,
    status: 'APPROVED_A',
    statusAr: 'معتمد بدون ملاحظات (Code A)',
    submissionDate: '2026-09-12',
    consultantReviewer: 'م. حسام البحيري (دار الهندسة)',
    driveCadId: 'drive_sub_str_0042'
  },
  {
    id: 'sub_02',
    submittalNo: 'PRJ-TOW-SUB-MAT-0018',
    projectCode: 'PRJ-TOW-01',
    title: 'اعتماد عينات وتوريد رخام الواجهات والكسوات الخارجية (كرارة إيطالي 3 سم)',
    type: 'MATERIAL_SAMPLE',
    typeAr: 'اعتماد عينة مواد',
    revision: 0,
    status: 'APPROVED_COMMENTS_B',
    statusAr: 'معتمد بملاحظات (Code B)',
    submissionDate: '2026-09-14',
    consultantReviewer: 'م. أحمد شكري (دار الهندسة)',
    driveCadId: 'drive_sub_mat_0018'
  },
  {
    id: 'sub_03',
    submittalNo: 'PRJ-MED-SUB-MEP-0009',
    projectCode: 'PRJ-MED-04',
    title: 'مخططات مسارات مجاري التكييف المركزي ووحدات مناولة الهواء AHU',
    type: 'SHOP_DRAWING',
    typeAr: 'مخطط كهروميكانيك MEP',
    revision: 2,
    status: 'PENDING_REVIEW',
    statusAr: 'قيد مراجعة الاستشاري',
    submissionDate: '2026-09-17',
    consultantReviewer: 'م. وليد كمال (ACE)',
    driveCadId: 'drive_sub_mep_0009'
  },
  {
    id: 'sub_04',
    submittalNo: 'PRJ-RES-SUB-STR-0005',
    projectCode: 'PRJ-RES-08',
    title: 'مخططات أوتوكاد لشبكة تصريف مياه الأمطار والري السطحي',
    type: 'SHOP_DRAWING',
    typeAr: 'مخطط بنية تحتية',
    revision: 0,
    status: 'REJECTED_C',
    statusAr: 'مرفوض ومطلوب إعادة التقديم (Code C)',
    submissionDate: '2026-09-10',
    consultantReviewer: 'م. تامر الجيار (صبور)',
    driveCadId: 'drive_sub_str_0005'
  }
];

const MOCK_RFIS: EngineeringRFI[] = [
  {
    id: 'rfi_01',
    rfiNumber: 'PRJ-MED-RFI-0028',
    projectCode: 'PRJ-MED-04',
    subject: 'تداخل مسارات مسالك التكييف مع العوارض الإنشائية المقلوبة في الدور الثاني',
    question: 'يرجى الإفادة بالمنسوب الصافي المسموح لتفادي تعارض مجاري الهواء مع كمرات السقف الخرسانية.',
    answer: 'تم اعتماد عمل فتحات تهوية قياسية (Sleeves) وفق التفصيلة المعمارية المرفقة رقم AR-D-12.',
    urgency: 'BLOCKING',
    status: 'ANSWERED',
    submittedDate: '2026-09-15',
    requiredByDate: '2026-09-18'
  },
  {
    id: 'rfi_02',
    rfiNumber: 'PRJ-TOW-RFI-0034',
    projectCode: 'PRJ-TOW-01',
    subject: 'اعتماد نوع مانع الرطوبة وعوازل الأساسات للبدروم السفلي',
    question: 'مطلوب تأكيد سمك طبقة الممبرين البيتوميني المعدل (SBS 4mm) ونوعية حماية الألواح.',
    urgency: 'HIGH',
    status: 'OPEN',
    submittedDate: '2026-09-17',
    requiredByDate: '2026-09-22'
  }
];

const MOCK_LICENSES: SiteLicense[] = [
  {
    id: 'lic_01',
    projectCode: 'PRJ-TOW-01',
    licenseType: 'رخصة البناء الإنشائية المعتمدة',
    licenseNumber: 'LIC-CAI-2024-8819',
    issuingAuthority: 'حي التجمع الأول - جهاز القاهرة الجديدة',
    issueDate: '2024-01-10',
    expiryDate: '2026-10-04',
    daysRemaining: 15,
    status: 'RENEWAL_REQUIRED',
    driveScanId: 'drive_lic_tow_01'
  },
  {
    id: 'lic_02',
    projectCode: 'PRJ-TOW-01',
    licenseType: 'تصريح الحماية المدنية والإطفاء',
    licenseNumber: 'CD-2025-4192',
    issuingAuthority: 'الإدارة العامة للحماية المدنية',
    issueDate: '2025-03-12',
    expiryDate: '2027-03-11',
    daysRemaining: 173,
    status: 'ACTIVE',
    driveScanId: 'drive_lic_cd_01'
  },
  {
    id: 'lic_03',
    projectCode: 'PRJ-MED-04',
    licenseType: 'الموافقة البيئية وجهاز شؤون البيئة',
    licenseNumber: 'ENV-MED-2024-019',
    issuingAuthority: 'وزارة البيئة المصرية',
    issueDate: '2024-05-20',
    expiryDate: '2026-11-20',
    daysRemaining: 62,
    status: 'ACTIVE',
    driveScanId: 'drive_lic_env_04'
  }
];

export const EngineeringModule: React.FC = () => {
  const { language, previewDriveFile, activeCompany } = useApp();
  const [activeTab, setActiveTab] = useState<'PROJECTS' | 'SUBMITTALS' | 'RFIS' | 'LICENSES'>('PROJECTS');
  const [projectFilter, setProjectFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const isAr = language === 'ar';

  const totalProjectsValue = MOCK_PROJECTS.reduce((sum, p) => sum + p.contractValue, 0);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--erp-space-6)' }}>
      {/* Header Banner */}
      <div className="glass-card" style={{
        padding: '24px 28px',
        borderInlineStart: '4px solid var(--erp-dept-engineering)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 'var(--erp-space-4)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--erp-space-4)' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--erp-radius-lg)',
            background: 'hsla(199, 89%, 48%, 0.15)',
            color: 'var(--erp-dept-engineering)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <HardHat size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--erp-text-main)' }}>
                {isAr ? 'المكتب الفني الهندسي وإدارة المشروعات التعاقدية' : 'Technical Engineering Office & Project Hub'}
              </h1>
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                background: 'hsla(199, 89%, 48%, 0.15)',
                color: 'var(--erp-dept-engineering)',
                padding: '2px 8px',
                borderRadius: 'var(--erp-radius-sm)'
              }}>
                PCMS INTEGRATED
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--erp-text-muted)', marginTop: '2px' }}>
              {isAr ? `إدارة المشروعات، اعتمادات الشوب دروينج، الـ RFI، ورخص البناء لـ: ${activeCompany.nameAr}` : `Project contracts, submittal logs, RFIs, and municipal site licenses for ${activeCompany.nameEn}`}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 'var(--erp-space-2)' }}>
          <button
            onClick={() => alert(isAr ? 'فتح نافذة تسجيل اعتماد فني (Submittal) جديد...' : 'Opening new submittal wizard...')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--erp-dept-engineering)',
              color: '#fff',
              border: 'none',
              padding: '10px 18px',
              borderRadius: 'var(--erp-radius-lg)',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Plus size={15} />
            <span>{isAr ? 'اعتماد فني جديد (Submittal)' : 'New Submittal'}</span>
          </button>
        </div>
      </div>

      {/* Engineering KPI Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--erp-space-4)' }}>
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '13px', color: 'var(--erp-text-dim)', fontWeight: 600 }}>
            {isAr ? 'إجمالي قيمة المشروعات النشطة' : 'Total Contract Value'}
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--erp-text-main)', marginTop: '6px' }}>
            {totalProjectsValue.toLocaleString()} <span style={{ fontSize: '13px', color: 'var(--erp-text-dim)' }}>{activeCompany.currency}</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--erp-dept-engineering)', fontWeight: 700, marginTop: '4px' }}>
            3 {isAr ? 'مشروعات إنشائية متزامنة' : 'Concurrent Projects'}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '13px', color: 'var(--erp-text-dim)', fontWeight: 600 }}>
            {isAr ? 'سجل الاعتمادات الفنية (Submittals)' : 'Total Submittals'}
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--erp-brand-primary)', marginTop: '6px' }}>
            {MOCK_SUBMITTALS.length} <span style={{ fontSize: '13px', color: 'var(--erp-text-dim)' }}>{isAr ? 'اعتماداً' : 'Submittals'}</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--erp-status-success)', fontWeight: 700, marginTop: '4px' }}>
            75% {isAr ? 'نسبة الاعتماد من الاستشاري' : 'Approval Ratio (Code A/B)'}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '13px', color: 'var(--erp-text-dim)', fontWeight: 600 }}>
            {isAr ? 'الاستفسارات التعاقدية المعلقة (RFI)' : 'Pending RFIs'}
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--erp-status-warning)', marginTop: '6px' }}>
            1 <span style={{ fontSize: '13px', color: 'var(--erp-text-dim)' }}>{isAr ? 'قيد الرد' : 'Open'}</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--erp-status-danger)', fontWeight: 700, marginTop: '4px' }}>
            {isAr ? 'مستعجل لإكمال أعمال صب الخرسانة' : 'Blocking Critical Path'}
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 'var(--erp-space-4)'
      }}>
        <div style={{ display: 'flex', gap: 'var(--erp-space-2)', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('PROJECTS')}
            style={{
              padding: '10px 18px',
              borderRadius: 'var(--erp-radius-lg)',
              border: activeTab === 'PROJECTS' ? '1px solid var(--erp-dept-engineering)' : '1px solid var(--erp-border-color)',
              background: activeTab === 'PROJECTS' ? 'hsla(199, 89%, 48%, 0.15)' : 'var(--erp-bg-surface)',
              color: activeTab === 'PROJECTS' ? 'var(--erp-dept-engineering)' : 'var(--erp-text-main)',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {isAr ? 'دليل المشروعات الإنشائية' : 'Projects Hub'} ({MOCK_PROJECTS.length})
          </button>
          <button
            onClick={() => setActiveTab('SUBMITTALS')}
            style={{
              padding: '10px 18px',
              borderRadius: 'var(--erp-radius-lg)',
              border: activeTab === 'SUBMITTALS' ? '1px solid var(--erp-dept-engineering)' : '1px solid var(--erp-border-color)',
              background: activeTab === 'SUBMITTALS' ? 'hsla(199, 89%, 48%, 0.15)' : 'var(--erp-bg-surface)',
              color: activeTab === 'SUBMITTALS' ? 'var(--erp-dept-engineering)' : 'var(--erp-text-main)',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <FileCheck2 size={15} />
            <span>{isAr ? 'سجل الاعتمادات والشوب دروينج' : 'Submittals'} ({MOCK_SUBMITTALS.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('RFIS')}
            style={{
              padding: '10px 18px',
              borderRadius: 'var(--erp-radius-lg)',
              border: activeTab === 'RFIS' ? '1px solid var(--erp-dept-engineering)' : '1px solid var(--erp-border-color)',
              background: activeTab === 'RFIS' ? 'hsla(199, 89%, 48%, 0.15)' : 'var(--erp-bg-surface)',
              color: activeTab === 'RFIS' ? 'var(--erp-dept-engineering)' : 'var(--erp-text-main)',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <HelpCircle size={15} />
            <span>{isAr ? 'استفسارات الاستشاري (RFI)' : 'RFIs'} ({MOCK_RFIS.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('LICENSES')}
            style={{
              padding: '10px 18px',
              borderRadius: 'var(--erp-radius-lg)',
              border: activeTab === 'LICENSES' ? '1px solid var(--erp-dept-engineering)' : '1px solid var(--erp-border-color)',
              background: activeTab === 'LICENSES' ? 'hsla(199, 89%, 48%, 0.15)' : 'var(--erp-bg-surface)',
              color: activeTab === 'LICENSES' ? 'var(--erp-dept-engineering)' : 'var(--erp-text-main)',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <ScrollText size={15} />
            <span>{isAr ? 'رخص وتصاريح المواقع' : 'Site Licenses'} ({MOCK_LICENSES.length})</span>
          </button>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={16} style={{ position: 'absolute', top: '12px', insetInlineStart: '12px', color: 'var(--erp-text-dim)' }} />
          <input
            type="text"
            placeholder={isAr ? 'بحث في سجلات المكتب الفني...' : 'Search engineering records...'}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              paddingInlineStart: '36px',
              background: 'var(--erp-bg-surface)',
              border: '1px solid var(--erp-border-color)',
              borderRadius: 'var(--erp-radius-lg)',
              color: 'var(--erp-text-main)',
              fontSize: '13px'
            }}
          />
        </div>
      </div>

      {/* Active Tab View: Projects Hub */}
      {activeTab === 'PROJECTS' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 'var(--erp-space-4)' }}>
          {MOCK_PROJECTS.map(proj => (
            <div key={proj.id} className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '3px 8px',
                  borderRadius: 'var(--erp-radius-sm)',
                  background: 'var(--erp-brand-primary-subtle)',
                  color: 'var(--erp-brand-primary)'
                }}>
                  {proj.code}
                </span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--erp-status-success)' }}>
                  {isAr ? proj.statusAr : proj.status}
                </span>
              </div>

              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--erp-text-main)', marginBottom: '6px' }}>
                  {proj.name}
                </h3>
                <div style={{ fontSize: '12.5px', color: 'var(--erp-text-muted)' }}>
                  {isAr ? 'الجهة المالكة:' : 'Owner:'} <strong style={{ color: 'var(--erp-text-main)' }}>{proj.clientName}</strong>
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--erp-text-muted)', marginTop: '2px' }}>
                  {isAr ? 'الاستشاري المشرف:' : 'Consultant:'} <strong style={{ color: 'var(--erp-text-main)' }}>{proj.consultantName}</strong>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px', fontWeight: 700 }}>
                  <span>{isAr ? 'نسبة الإنجاز الفعلي للمشروع' : 'Progress'}</span>
                  <span>{proj.progressPercent}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'var(--erp-bg-subtle)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ width: `${proj.progressPercent}%`, height: '100%', background: 'var(--erp-dept-engineering)' }} />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--erp-border-color)', paddingTop: '14px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--erp-text-dim)' }}>{isAr ? 'قيمة التعاقد' : 'Contract Value'}</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--erp-text-main)' }}>
                    {proj.contractValue.toLocaleString()} {activeCompany.currency}
                  </div>
                </div>

                <button
                  onClick={() => previewDriveFile(proj.driveFolderId, `${proj.code}_Drawings_Dossier.pdf`)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: 'var(--erp-radius-md)',
                    background: 'var(--erp-bg-subtle)',
                    border: '1px solid var(--erp-border-color)',
                    color: 'var(--erp-dept-engineering)',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <FileText size={14} />
                  <span>{isAr ? 'مستندات المشروع (Drive)' : 'Drive Vault'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Active Tab View: Submittals */}
      {activeTab === 'SUBMITTALS' && (
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isAr ? 'right' : 'left' }}>
              <thead>
                <tr style={{ background: 'var(--erp-bg-subtle)', borderBottom: '1px solid var(--erp-border-color)', color: 'var(--erp-text-dim)', fontSize: '12px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '14px 16px' }}>{isAr ? 'رقم الاعتماد المسلسل' : 'Submittal Serial'}</th>
                  <th style={{ padding: '14px 16px' }}>{isAr ? 'المشروع' : 'Project'}</th>
                  <th style={{ padding: '14px 16px' }}>{isAr ? 'موضوع الاعتماد والمخطط' : 'Title'}</th>
                  <th style={{ padding: '14px 16px' }}>{isAr ? 'النوع والمراجعة' : 'Type & Rev'}</th>
                  <th style={{ padding: '14px 16px' }}>{isAr ? 'حالة الاعتماد' : 'Status'}</th>
                  <th style={{ padding: '14px 16px' }}>{isAr ? 'مهندس الاستشاري' : 'Consultant'}</th>
                  <th style={{ padding: '14px 16px' }}>{isAr ? 'الملف الهندسي (Drive)' : 'Drive File'}</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_SUBMITTALS.map(sub => (
                  <tr key={sub.id} style={{ borderBottom: '1px solid var(--erp-border-color)', fontSize: '13.5px' }}>
                    <td style={{ padding: '16px', fontWeight: 800, fontFamily: 'monospace' }}>{sub.submittalNo}</td>
                    <td style={{ padding: '16px', fontWeight: 600 }}>{sub.projectCode}</td>
                    <td style={{ padding: '16px', fontWeight: 600, maxWidth: '280px' }}>{sub.title}</td>
                    <td style={{ padding: '16px' }}>
                      <div>{isAr ? sub.typeAr : sub.type}</div>
                      <span style={{ fontSize: '11px', color: 'var(--erp-text-dim)' }}>Rev: {sub.revision}</span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: 'var(--erp-radius-sm)',
                        background: sub.status === 'APPROVED_A' ? 'hsla(142, 71%, 45%, 0.15)' : sub.status === 'APPROVED_COMMENTS_B' ? 'hsla(38, 92%, 50%, 0.15)' : sub.status === 'REJECTED_C' ? 'hsla(0, 84%, 60%, 0.15)' : 'hsla(217, 91%, 60%, 0.15)',
                        color: sub.status === 'APPROVED_A' ? 'var(--erp-status-success)' : sub.status === 'APPROVED_COMMENTS_B' ? 'var(--erp-status-warning)' : sub.status === 'REJECTED_C' ? 'var(--erp-status-danger)' : 'var(--erp-brand-primary)'
                      }}>
                        {isAr ? sub.statusAr : sub.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px', fontSize: '12.5px' }}>{sub.consultantReviewer}</td>
                    <td style={{ padding: '16px' }}>
                      <button
                        onClick={() => previewDriveFile(sub.driveCadId, `${sub.submittalNo}.pdf`)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          borderRadius: 'var(--erp-radius-md)',
                          background: 'var(--erp-bg-subtle)',
                          border: '1px solid var(--erp-border-color)',
                          color: 'var(--erp-dept-engineering)',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        <FileCheck2 size={14} />
                        <span>{isAr ? 'معاينة المخطط' : 'View Drawing'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Active Tab View: RFIs */}
      {activeTab === 'RFIS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {MOCK_RFIS.map(rfi => (
            <div key={rfi.id} className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, fontFamily: 'monospace', color: 'var(--erp-text-main)' }}>
                    {rfi.rfiNumber}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--erp-text-dim)', fontWeight: 600 }}>
                    ({rfi.projectCode})
                  </span>
                  <span style={{
                    fontSize: '10.5px',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: 'var(--erp-radius-sm)',
                    background: rfi.urgency === 'BLOCKING' ? 'hsla(0, 84%, 60%, 0.15)' : 'hsla(38, 92%, 50%, 0.15)',
                    color: rfi.urgency === 'BLOCKING' ? 'var(--erp-status-danger)' : 'var(--erp-status-warning)'
                  }}>
                    {rfi.urgency} PRIORITY
                  </span>
                </div>

                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: rfi.status === 'ANSWERED' ? 'var(--erp-status-success)' : 'var(--erp-status-warning)'
                }}>
                  {rfi.status === 'ANSWERED' ? (isAr ? 'تم الرد من الاستشاري' : 'Answered') : (isAr ? 'بانتظار الإفادة' : 'Open')}
                </span>
              </div>

              <h4 style={{ fontSize: '14.5px', fontWeight: 800, color: 'var(--erp-text-main)' }}>
                {rfi.subject}
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--erp-text-muted)', lineHeight: 1.5 }}>
                {rfi.question}
              </p>

              {rfi.answer && (
                <div style={{
                  padding: '12px 16px',
                  borderRadius: 'var(--erp-radius-md)',
                  background: 'hsla(142, 71%, 45%, 0.08)',
                  border: '1px solid hsla(142, 71%, 45%, 0.2)',
                  fontSize: '12.5px',
                  color: 'var(--erp-text-main)',
                  marginTop: '4px'
                }}>
                  <strong style={{ color: 'var(--erp-status-success)' }}>{isAr ? 'إفادة واعتماد الاستشاري: ' : 'Consultant Response: '}</strong>
                  {rfi.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Active Tab View: Site Licenses */}
      {activeTab === 'LICENSES' && (
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isAr ? 'right' : 'left' }}>
              <thead>
                <tr style={{ background: 'var(--erp-bg-subtle)', borderBottom: '1px solid var(--erp-border-color)', color: 'var(--erp-text-dim)', fontSize: '12px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '14px 16px' }}>{isAr ? 'نوع الترخيص / التصريح' : 'License Type'}</th>
                  <th style={{ padding: '14px 16px' }}>{isAr ? 'رقم الترخيص' : 'License #'}</th>
                  <th style={{ padding: '14px 16px' }}>{isAr ? 'الجهة الحكومية المصدرة' : 'Authority'}</th>
                  <th style={{ padding: '14px 16px' }}>{isAr ? 'المشروع' : 'Project'}</th>
                  <th style={{ padding: '14px 16px' }}>{isAr ? 'تاريخ السريان والانتهاء' : 'Dates'}</th>
                  <th style={{ padding: '14px 16px' }}>{isAr ? 'موقف التجديد' : 'Status'}</th>
                  <th style={{ padding: '14px 16px' }}>{isAr ? 'معاينة الترخيص (Drive)' : 'Drive File'}</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_LICENSES.map(lic => (
                  <tr key={lic.id} style={{ borderBottom: '1px solid var(--erp-border-color)', fontSize: '13.5px' }}>
                    <td style={{ padding: '16px', fontWeight: 800 }}>{lic.licenseType}</td>
                    <td style={{ padding: '16px', fontFamily: 'monospace' }}>{lic.licenseNumber}</td>
                    <td style={{ padding: '16px', fontWeight: 600 }}>{lic.issuingAuthority}</td>
                    <td style={{ padding: '16px', fontWeight: 700, color: 'var(--erp-brand-primary)' }}>{lic.projectCode}</td>
                    <td style={{ padding: '16px' }}>
                      <div>{isAr ? `ينتهي في: ${lic.expiryDate}` : `Expires: ${lic.expiryDate}`}</div>
                      <span style={{ fontSize: '11px', color: lic.daysRemaining <= 30 ? 'var(--erp-status-warning)' : 'var(--erp-text-dim)', fontWeight: 700 }}>
                        {isAr ? `متبقي ${lic.daysRemaining} يوم` : `${lic.daysRemaining} days left`}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: 'var(--erp-radius-sm)',
                        background: lic.status === 'ACTIVE' ? 'hsla(142, 71%, 45%, 0.15)' : 'hsla(38, 92%, 50%, 0.15)',
                        color: lic.status === 'ACTIVE' ? 'var(--erp-status-success)' : 'var(--erp-status-warning)'
                      }}>
                        {lic.status === 'ACTIVE' ? (isAr ? 'ساري وصالح' : 'Active') : (isAr ? 'مطلوب التجديد' : 'Renewal Needed')}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <button
                        onClick={() => previewDriveFile(lic.driveScanId, `${lic.licenseType}.pdf`)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          borderRadius: 'var(--erp-radius-md)',
                          background: 'var(--erp-bg-subtle)',
                          border: '1px solid var(--erp-border-color)',
                          color: 'var(--erp-dept-engineering)',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        <ScrollText size={14} />
                        <span>{isAr ? 'معاينة الترخيص' : 'View License'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
