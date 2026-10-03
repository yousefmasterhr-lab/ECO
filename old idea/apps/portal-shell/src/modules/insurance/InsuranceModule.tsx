import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, 
  FileSpreadsheet, 
  Plus, 
  Search, 
  Download, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  FileText,
  Printer,
  Eye,
  UserMinus,
  UserPlus
} from 'lucide-react';
import { EmbeddedAppContainer } from '../../components/common/EmbeddedAppContainer';

interface InsuredEmployeeRecord {
  id: string;
  nationalId: string;
  insuranceNo: string;
  facilityNumber: string;
  name: string;
  jobTitle: string;
  basicWage: number;
  variableWage: number;
  totalInsuranceWage: number;
  companyShare: number;
  employeeShare: number;
  hireDate: string;
  formStatus: 'S1_APPROVED' | 'S2_UPDATED' | 'S6_PENDING';
  formStatusAr: string;
  exitReason?: string;
}

const MOCK_INSURED: InsuredEmployeeRecord[] = [
  {
    id: 'emp_01',
    nationalId: '28804150102931',
    insuranceNo: '548910245',
    facilityNumber: '109283741',
    name: 'م. أحمد مصطفى الشناوي',
    jobTitle: 'مهندس موقع أول مدني',
    basicWage: 7500,
    variableWage: 3500,
    totalInsuranceWage: 11000,
    companyShare: 2062.5,
    employeeShare: 1210.0,
    hireDate: '2021-03-01',
    formStatus: 'S1_APPROVED',
    formStatusAr: 'س1 معتمدة ومسددة'
  },
  {
    id: 'emp_02',
    nationalId: '29211041205844',
    insuranceNo: '612049182',
    facilityNumber: '109283741',
    name: 'أ/ كريم حسام الدين فهمي',
    jobTitle: 'أخصائي شؤون قانونية وعقود',
    basicWage: 6000,
    variableWage: 2500,
    totalInsuranceWage: 8500,
    companyShare: 1593.75,
    employeeShare: 935.0,
    hireDate: '2023-08-15',
    formStatus: 'S2_UPDATED',
    formStatusAr: 'س2 محدثة سنوياً'
  },
  {
    id: 'emp_03',
    nationalId: '28409121403912',
    insuranceNo: '491028716',
    facilityNumber: '109283741',
    name: 'أ/ سامح عبد الرحمن إبراهيم',
    jobTitle: 'مشرف حسابات ومشتريات فنية',
    basicWage: 5500,
    variableWage: 2000,
    totalInsuranceWage: 7500,
    companyShare: 1406.25,
    employeeShare: 825.0,
    hireDate: '2019-11-01',
    formStatus: 'S6_PENDING',
    formStatusAr: 'قيد استمارة 6 خروج',
    exitReason: 'استقالة مسببة برغبة العامل'
  }
];

const InsuranceQuickDashboard: React.FC = () => {
  const { language, previewDriveFile, activeCompany } = useApp();
  const [activeTab, setActiveTab] = useState<'REGISTER' | 'FORM_S1_VIEWER' | 'FORM_S6_VIEWER'>('REGISTER');
  const [selectedEmp, setSelectedEmp] = useState<InsuredEmployeeRecord>(MOCK_INSURED[0]!);
  const [searchTerm, setSearchTerm] = useState('');

  const isAr = language === 'ar';

  const totalMonthlyLiability = MOCK_INSURED.reduce((sum, e) => sum + e.companyShare + e.employeeShare, 0);

  // Helper to render box-by-box government numbers (National ID 14 boxes, Insurance 9 boxes)
  const renderNumberBoxes = (value: string, totalBoxes: number, boxWidth: number = 24) => {
    const chars = value.padStart(totalBoxes, ' ').split('');
    return (
      <div style={{ display: 'inline-flex', direction: 'ltr', border: '1px solid var(--erp-border-color)', borderRadius: '4px', overflow: 'hidden' }}>
        {chars.map((ch, idx) => (
          <div
            key={idx}
            style={{
              width: `${boxWidth}px`,
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRight: idx < totalBoxes - 1 ? '1px solid var(--erp-border-color)' : 'none',
              background: 'var(--erp-bg-surface)',
              fontWeight: 800,
              fontFamily: 'monospace',
              fontSize: '14px',
              color: 'var(--erp-text-main)'
            }}
          >
            {ch === ' ' ? '' : ch}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--erp-space-6)' }}>
      {/* Header */}
      <div className="glass-card" style={{
        padding: '24px 28px',
        borderInlineStart: '4px solid var(--erp-dept-insurance)',
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
            background: 'hsla(160, 84%, 39%, 0.15)',
            color: 'var(--erp-dept-insurance)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--erp-text-main)' }}>
                {isAr ? 'نظام إدارة التأمينات الاجتماعية والقياسات الشبكية (س1، س2، س6)' : 'Social Insurance & Statutory Forms (S1, S2, S6)'}
              </h1>
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                background: 'hsla(160, 84%, 39%, 0.15)',
                color: 'var(--erp-dept-insurance)',
                padding: '2px 8px',
                borderRadius: 'var(--erp-radius-sm)'
              }}>
                EGYPTIAN STATUTORY STANDARDS
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--erp-text-muted)', marginTop: '2px' }}>
              {isAr ? `إدارة ملفات التأمين الاجتماعي، حسابات حصص المنشأة والعامل، وطباعة الاستمارات لـ: ${activeCompany.nameAr}` : `Social insurance registry, wage splitting (18.75% / 11%), and pixel-perfect form generator for ${activeCompany.nameEn}`}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 'var(--erp-space-2)' }}>
          <button
            onClick={() => alert(isAr ? 'فتح نافذة تسجيل عامل جديد وإصدار استمارة 1...' : 'Opening Form 1 enrollment wizard...')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--erp-dept-insurance)',
              color: '#fff',
              border: 'none',
              padding: '10px 16px',
              borderRadius: 'var(--erp-radius-lg)',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <UserPlus size={15} />
            <span>{isAr ? 'إلحاق عامل (س1)' : 'New Joinee (S1)'}</span>
          </button>
          <button
            onClick={() => alert(isAr ? 'فتح نافذة إنهاء خدمة وإصدار استمارة 6...' : 'Opening Form 6 termination wizard...')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--erp-bg-subtle)',
              border: '1px solid var(--erp-border-color)',
              color: 'var(--erp-status-danger)',
              padding: '10px 16px',
              borderRadius: 'var(--erp-radius-lg)',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <UserMinus size={15} />
            <span>{isAr ? 'إنهاء اشتراك (س6)' : 'Exit Employee (S6)'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 'var(--erp-space-2)' }}>
        <button
          onClick={() => setActiveTab('REGISTER')}
          style={{
            padding: '10px 18px',
            borderRadius: 'var(--erp-radius-lg)',
            border: activeTab === 'REGISTER' ? '1px solid var(--erp-dept-insurance)' : '1px solid var(--erp-border-color)',
            background: activeTab === 'REGISTER' ? 'hsla(160, 84%, 39%, 0.15)' : 'var(--erp-bg-surface)',
            color: activeTab === 'REGISTER' ? 'var(--erp-dept-insurance)' : 'var(--erp-text-main)',
            fontSize: '13.5px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          {isAr ? 'سجل المؤمن عليهم النشطين' : 'Insured Staff Register'} ({MOCK_INSURED.length})
        </button>
        <button
          onClick={() => setActiveTab('FORM_S1_VIEWER')}
          style={{
            padding: '10px 18px',
            borderRadius: 'var(--erp-radius-lg)',
            border: activeTab === 'FORM_S1_VIEWER' ? '1px solid var(--erp-dept-insurance)' : '1px solid var(--erp-border-color)',
            background: activeTab === 'FORM_S1_VIEWER' ? 'hsla(160, 84%, 39%, 0.15)' : 'var(--erp-bg-surface)',
            color: activeTab === 'FORM_S1_VIEWER' ? 'var(--erp-dept-insurance)' : 'var(--erp-text-main)',
            fontSize: '13.5px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <FileText size={15} />
          <span>{isAr ? 'معاينة استمارة (س1) الشبكية' : 'Form S1 Grid Viewer'}</span>
        </button>
        <button
          onClick={() => setActiveTab('FORM_S6_VIEWER')}
          style={{
            padding: '10px 18px',
            borderRadius: 'var(--erp-radius-lg)',
            border: activeTab === 'FORM_S6_VIEWER' ? '1px solid var(--erp-dept-insurance)' : '1px solid var(--erp-border-color)',
            background: activeTab === 'FORM_S6_VIEWER' ? 'hsla(160, 84%, 39%, 0.15)' : 'var(--erp-bg-surface)',
            color: activeTab === 'FORM_S6_VIEWER' ? 'var(--erp-dept-insurance)' : 'var(--erp-text-main)',
            fontSize: '13.5px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <FileText size={15} />
          <span>{isAr ? 'معاينة استمارة (س6) المخالصة' : 'Form S6 Grid Viewer'}</span>
        </button>
      </div>

      {/* Main Content Area */}
      {activeTab === 'REGISTER' && (
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isAr ? 'right' : 'left' }}>
              <thead>
                <tr style={{ background: 'var(--erp-bg-subtle)', borderBottom: '1px solid var(--erp-border-color)', color: 'var(--erp-text-dim)', fontSize: '12px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '14px 16px' }}>{isAr ? 'اسم الموظف والوظيفة' : 'Employee & Job'}</th>
                  <th style={{ padding: '14px 16px' }}>{isAr ? 'الرقم القومي (14 خانة)' : 'National ID'}</th>
                  <th style={{ padding: '14px 16px' }}>{isAr ? 'الرقم التأميني (9 خانات)' : 'Insurance ID'}</th>
                  <th style={{ padding: '14px 16px' }}>{isAr ? 'الأجر التأميني' : 'Insurance Wage'}</th>
                  <th style={{ padding: '14px 16px' }}>{isAr ? 'حصة المنشأة (18.75%)' : 'Company Share'}</th>
                  <th style={{ padding: '14px 16px' }}>{isAr ? 'حصة العامل (11%)' : 'Employee Share'}</th>
                  <th style={{ padding: '14px 16px' }}>{isAr ? 'الحالة والاستمارة' : 'Status'}</th>
                  <th style={{ padding: '14px 16px' }}>{isAr ? 'الإجراء' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_INSURED.map(emp => (
                  <tr key={emp.id} style={{ borderBottom: '1px solid var(--erp-border-color)', fontSize: '13.5px' }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: 800, color: 'var(--erp-text-main)' }}>{emp.name}</div>
                      <div style={{ fontSize: '11.5px', color: 'var(--erp-text-dim)', marginTop: '2px' }}>
                        {emp.jobTitle}
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '12.5px' }}>
                        {emp.nationalId}
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--erp-dept-insurance)', fontSize: '12.5px' }}>
                        {emp.insuranceNo}
                      </div>
                    </td>
                    <td style={{ padding: '16px', fontWeight: 800 }}>
                      {emp.totalInsuranceWage.toLocaleString()} {activeCompany.currency}
                    </td>
                    <td style={{ padding: '16px', fontWeight: 700, color: 'var(--erp-brand-primary)' }}>
                      {emp.companyShare.toLocaleString()} {activeCompany.currency}
                    </td>
                    <td style={{ padding: '16px', fontWeight: 600 }}>
                      {emp.employeeShare.toLocaleString()} {activeCompany.currency}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        fontSize: '11.5px',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: 'var(--erp-radius-sm)',
                        background: emp.formStatus === 'S6_PENDING' ? 'hsla(38, 92%, 50%, 0.15)' : 'hsla(160, 84%, 39%, 0.15)',
                        color: emp.formStatus === 'S6_PENDING' ? 'var(--erp-status-warning)' : 'var(--erp-status-success)'
                      }}>
                        {emp.formStatusAr}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <button
                        onClick={() => {
                          setSelectedEmp(emp);
                          setActiveTab('FORM_S1_VIEWER');
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          borderRadius: 'var(--erp-radius-md)',
                          background: 'var(--erp-bg-subtle)',
                          border: '1px solid var(--erp-border-color)',
                          color: 'var(--erp-dept-insurance)',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        <Eye size={14} />
                        <span>{isAr ? 'عرض س1' : 'View S1'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Form S1 Standard Grid Viewer */}
      {activeTab === 'FORM_S1_VIEWER' && (
        <div className="glass-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--erp-border-color)', paddingBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--erp-text-main)' }}>
                {isAr ? 'استمارة رقم (1) س / ت - بدء اشتراك مؤمن عليه' : 'Official Form S1 - Social Insurance Enrollment'}
              </h2>
              <p style={{ fontSize: '12.5px', color: 'var(--erp-text-muted)', marginTop: '2px' }}>
                {isAr ? 'مطابقة للقياسات الشبكية الرسمية المعتمدة من الهيئة القومية للتأمين الاجتماعي (FORMS_GRID_STANDARDS)' : 'Pixel-perfect alignment standard with official Egyptian Social Insurance Authority grid'}
              </p>
            </div>
            <button
              onClick={() => window.print()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: 'var(--erp-radius-lg)',
                background: 'var(--erp-dept-insurance)',
                color: '#fff',
                border: 'none',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <Printer size={16} />
              <span>{isAr ? 'طباعة الاستمارة الرسمية' : 'Print Form'}</span>
            </button>
          </div>

          {/* Form Grid Simulation Card */}
          <div style={{
            border: '2px dashed var(--erp-border-color)',
            borderRadius: 'var(--erp-radius-lg)',
            padding: '28px',
            background: 'var(--erp-bg-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}>
            {/* Row 1: Facility Number */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--erp-text-dim)', display: 'block', marginBottom: '6px' }}>
                  {isAr ? 'رقم المنشأة التأميني (9 خانات):' : 'Facility Number (9 digits):'}
                </label>
                {renderNumberBoxes(selectedEmp.facilityNumber, 9)}
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--erp-text-dim)', display: 'block', marginBottom: '6px' }}>
                  {isAr ? 'اسم المنشأة / صاحب العمل:' : 'Facility Name:'}
                </label>
                <div style={{ fontSize: '14.5px', fontWeight: 800, color: 'var(--erp-text-main)' }}>
                  {isAr ? activeCompany.nameAr : activeCompany.nameEn}
                </div>
              </div>
            </div>

            {/* Row 2: Insured ID & National ID */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', borderTop: '1px solid var(--erp-border-color)', paddingTop: '18px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--erp-text-dim)', display: 'block', marginBottom: '6px' }}>
                  {isAr ? 'الرقم التأميني للعامل (9 خانات):' : 'Employee Insurance # (9 digits):'}
                </label>
                {renderNumberBoxes(selectedEmp.insuranceNo, 9)}
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--erp-text-dim)', display: 'block', marginBottom: '6px' }}>
                  {isAr ? 'الرقم القومي للعامل (14 خانة):' : 'Employee National ID (14 digits):'}
                </label>
                {renderNumberBoxes(selectedEmp.nationalId, 14)}
              </div>
            </div>

            {/* Row 3: Employee Details */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', borderTop: '1px solid var(--erp-border-color)', paddingTop: '18px' }}>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--erp-text-dim)', fontWeight: 600 }}>{isAr ? 'اسم المؤمن عليه:' : 'Name:'}</span>
                <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--erp-text-main)', marginTop: '2px' }}>{selectedEmp.name}</div>
              </div>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--erp-text-dim)', fontWeight: 600 }}>{isAr ? 'المهنة / المسمى الوظيفي:' : 'Occupation:'}</span>
                <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--erp-text-main)', marginTop: '2px' }}>{selectedEmp.jobTitle}</div>
              </div>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--erp-text-dim)', fontWeight: 600 }}>{isAr ? 'تاريخ بدء الاشتراك:' : 'Hire Date:'}</span>
                <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--erp-text-main)', marginTop: '2px' }}>{selectedEmp.hireDate}</div>
              </div>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--erp-text-dim)', fontWeight: 600 }}>{isAr ? 'الأجر التأميني الشامل:' : 'Total Wage:'}</span>
                <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--erp-dept-insurance)', marginTop: '2px' }}>
                  {selectedEmp.totalInsuranceWage.toLocaleString()} {activeCompany.currency}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form S6 Termination Viewer */}
      {activeTab === 'FORM_S6_VIEWER' && (
        <div className="glass-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--erp-border-color)', paddingBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--erp-text-main)' }}>
                {isAr ? 'استمارة رقم (6) س / ت - إخطار انتهاء اشتراك مؤمن عليه' : 'Official Form S6 - Social Insurance Termination'}
              </h2>
              <p style={{ fontSize: '12.5px', color: 'var(--erp-text-muted)', marginTop: '2px' }}>
                {isAr ? 'إجراءات إنهاء الخدمة والمخالصة التأمينية وفق القانون رقم 148 لسنة 2019' : 'Statutory exit clearance pursuant to Egyptian Social Insurance Law 148 / 2019'}
              </p>
            </div>
            <button
              onClick={() => window.print()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: 'var(--erp-radius-lg)',
                background: 'var(--erp-status-danger)',
                color: '#fff',
                border: 'none',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <Printer size={16} />
              <span>{isAr ? 'طباعة استمارة 6' : 'Print Form S6'}</span>
            </button>
          </div>

          <div style={{
            border: '2px dashed var(--erp-border-color)',
            borderRadius: 'var(--erp-radius-lg)',
            padding: '28px',
            background: 'var(--erp-bg-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <AlertTriangle size={24} color="var(--erp-status-warning)" />
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--erp-text-main)' }}>
                  {isAr ? 'بيانات العامل المنهي خدمته:' : 'Terminated Employee Record:'} {MOCK_INSURED[2]?.name}
                </h4>
                <p style={{ fontSize: '12px', color: 'var(--erp-text-muted)' }}>
                  {isAr ? `سبب انتهاء الاشتراك: ${MOCK_INSURED[2]?.exitReason}` : `Termination reason: ${MOCK_INSURED[2]?.exitReason}`}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--erp-text-dim)', fontWeight: 600 }}>{isAr ? 'الرقم التأميني:' : 'Insurance #:'}</span>
                <div style={{ marginTop: '4px' }}>{renderNumberBoxes(MOCK_INSURED[2]?.insuranceNo || '', 9)}</div>
              </div>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--erp-text-dim)', fontWeight: 600 }}>{isAr ? 'الرقم القومي:' : 'National ID:'}</span>
                <div style={{ marginTop: '4px' }}>{renderNumberBoxes(MOCK_INSURED[2]?.nationalId || '', 14)}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const InsuranceModule: React.FC = () => {
  return (
    <EmbeddedAppContainer
      appUrl="/apps/insurance/"
      appTitleAr="نظام إدارة التأمينات الاجتماعية (المنظومة الفعلية الرسمية)"
      appTitleEn="Social Insurance Management Platform (Full Official System)"
      departmentCode="03_Insurance"
      accentColor="var(--erp-dept-insurance)"
      badgeAr="المنظومة الأصلية كاملة v7.2"
      badgeEn="FULL PRODUCTION APP v7.2"
      fallbackDashboard={<InsuranceQuickDashboard />}
    />
  );
};

