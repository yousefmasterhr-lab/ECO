import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  TrendingUp, 
  Scale, 
  HardHat, 
  Users, 
  AlertTriangle, 
  ArrowUpRight, 
  Download, 
  Sparkles,
  ShieldCheck,
  Building2
} from 'lucide-react';

export const ExecutiveModule: React.FC = () => {
  const { language, activeCompany, previewDriveFile } = useApp();

  const isAr = language === 'ar';

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--erp-space-6)' }}>
      {/* Top Banner & Strategy Context */}
      <div className="glass-card" style={{
        padding: '24px 28px',
        background: 'linear-gradient(135deg, hsla(38, 92%, 50%, 0.1), var(--erp-bg-surface))',
        border: '1px solid var(--erp-border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 'var(--erp-space-4)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--erp-space-4)' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: 'var(--erp-radius-xl)',
            background: 'var(--erp-dept-executive)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 20px -4px hsla(38, 92%, 50%, 0.4)'
          }}>
            <Sparkles size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--erp-text-main)' }}>
                {isAr ? 'لوحة القيادة والمؤشرات التنفيذية (C-Suite 360°)' : 'C-Suite Executive Overview & Analytics'}
              </h1>
              <span style={{
                fontSize: '11px',
                fontWeight: 800,
                background: 'hsla(38, 92%, 50%, 0.2)',
                color: 'var(--erp-dept-executive)',
                padding: '3px 8px',
                borderRadius: 'var(--erp-radius-full)'
              }}>
                LEVEL 4 CLEARANCE
              </span>
            </div>
            <p style={{ fontSize: '13.5px', color: 'var(--erp-text-muted)', marginTop: '4px' }}>
              {isAr
                ? `رؤية تحليلية موحدة ولحظية لمؤشرات الأداء التشغيلي، المخاطر القانونية، وموقف المشاريع التابعة لـ: ${activeCompany.nameAr}`
                : `Real-time consolidated analytics across operations, legal risk exposures, and project pipelines for: ${activeCompany.nameEn}`}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 'var(--erp-space-3)' }}>
          <button
            onClick={() => previewDriveFile('exec_report_q3_2026', 'Consolidated_Group_Executive_Audit_Q3.pdf')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: 'var(--erp-radius-lg)',
              background: 'var(--erp-brand-primary)',
              color: '#fff',
              border: 'none',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Download size={16} />
            <span>{isAr ? 'تحميل التقرير التنفيذي الموحد' : 'Export Group Audit'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 'var(--erp-space-4)'
      }}>
        {/* Engineering Value */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', color: 'var(--erp-text-dim)', fontWeight: 600 }}>
              {isAr ? 'حجم التعاقدات الهندسية' : 'Engineering Contracts'}
            </span>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--erp-radius-md)',
              background: 'hsla(199, 89%, 48%, 0.15)',
              color: 'var(--erp-dept-engineering)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <HardHat size={18} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--erp-text-main)' }}>
            148,500,000 <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--erp-text-dim)' }}>{activeCompany.currency}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '12px', color: 'var(--erp-status-success)', fontWeight: 700 }}>
            <TrendingUp size={14} />
            <span>+18.4% {isAr ? 'مقارنة بالربع السابق' : 'vs previous quarter'}</span>
          </div>
        </div>

        {/* Legal Exposure */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', color: 'var(--erp-text-dim)', fontWeight: 600 }}>
              {isAr ? 'المخاطر القضائية المتداولة' : 'Litigation Exposure'}
            </span>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--erp-radius-md)',
              background: 'hsla(346, 87%, 55%, 0.15)',
              color: 'var(--erp-dept-legal)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Scale size={18} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--erp-text-main)' }}>
            12,400,000 <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--erp-text-dim)' }}>{activeCompany.currency}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '12px', color: 'var(--erp-status-warning)', fontWeight: 700 }}>
            <AlertTriangle size={14} />
            <span>4 {isAr ? 'دعاوى قيد التداول القضائي' : 'active court cases'}</span>
          </div>
        </div>

        {/* Insured Employees */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', color: 'var(--erp-text-dim)', fontWeight: 600 }}>
              {isAr ? 'القوى العاملة المؤمن عليها' : 'Insured Workforce'}
            </span>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--erp-radius-md)',
              background: 'hsla(160, 84%, 39%, 0.15)',
              color: 'var(--erp-dept-insurance)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShieldCheck size={18} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--erp-text-main)' }}>
            482 <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--erp-text-dim)' }}>{isAr ? 'موظف' : 'employees'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '12px', color: 'var(--erp-status-success)', fontWeight: 700 }}>
            <span>98.6% {isAr ? 'نسبة الامتثال التأميني' : 'statutory compliance'}</span>
          </div>
        </div>

        {/* Talent Pipeline */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', color: 'var(--erp-text-dim)', fontWeight: 600 }}>
              {isAr ? 'الشواغر الوظيفية المفتوحة' : 'Open Requisitions'}
            </span>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--erp-radius-md)',
              background: 'hsla(262, 83%, 58%, 0.15)',
              color: 'var(--erp-dept-ats)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Users size={18} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--erp-text-main)' }}>
            14 <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--erp-text-dim)' }}>{isAr ? 'شاغر نشط' : 'open roles'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '12px', color: 'var(--erp-brand-primary)', fontWeight: 700 }}>
            <span>128 {isAr ? 'مرشح قيد المقابلات' : 'in interview pipeline'}</span>
          </div>
        </div>
      </div>

      {/* Cross-Company Operational Breakdown Table */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--erp-text-main)' }}>
              {isAr ? 'المقارنة التحليلية عبر شركات المجموعة' : 'Cross-Company Consolidated Matrix'}
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--erp-text-muted)', marginTop: '2px' }}>
              {isAr ? 'توزيع المشاريع، القضايا، والسيولة عبر الكيانات التابعة' : 'Entity distribution of projects, litigation, and labor indices'}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--erp-text-dim)' }}>
            <Building2 size={16} />
            <span>{isAr ? '3 كيانات تابعة' : '3 Entities Active'}</span>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isAr ? 'right' : 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--erp-border-color)', color: 'var(--erp-text-dim)', fontSize: '12px', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px 16px' }}>{isAr ? 'الشركة / الكيان' : 'Company'}</th>
                <th style={{ padding: '12px 16px' }}>{isAr ? 'المشاريع الهندسية' : 'Projects'}</th>
                <th style={{ padding: '12px 16px' }}>{isAr ? 'قيمة التعاقدات' : 'Contract Value'}</th>
                <th style={{ padding: '12px 16px' }}>{isAr ? 'القضايا النشطة' : 'Active Cases'}</th>
                <th style={{ padding: '12px 16px' }}>{isAr ? 'الموظفون المؤمن عليهم' : 'Insured Staff'}</th>
                <th style={{ padding: '12px 16px' }}>{isAr ? 'مؤشر الامتثال' : 'Compliance Index'}</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--erp-border-color)', fontSize: '13.5px' }}>
                <td style={{ padding: '14px 16px', fontWeight: 700 }}>
                  {isAr ? 'مجموعة أركان القابضة (الشركة الأم)' : 'Arkan Holdings Group'}
                </td>
                <td style={{ padding: '14px 16px' }}>2 {isAr ? 'مشروعات' : 'Projects'}</td>
                <td style={{ padding: '14px 16px', fontWeight: 700 }}>45,000,000 EGP</td>
                <td style={{ padding: '14px 16px', color: 'var(--erp-status-success)' }}>1 {isAr ? 'دعوى' : 'Case'}</td>
                <td style={{ padding: '14px 16px' }}>64</td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{ color: 'var(--erp-status-success)', fontWeight: 800 }}>99.2%</span>
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--erp-border-color)', fontSize: '13.5px' }}>
                <td style={{ padding: '14px 16px', fontWeight: 700 }}>
                  {isAr ? 'أركان للإنشاءات الهندسية والمقاولات' : 'Arkan Engineering & Construction'}
                </td>
                <td style={{ padding: '14px 16px' }}>7 {isAr ? 'مشروعات' : 'Projects'}</td>
                <td style={{ padding: '14px 16px', fontWeight: 700 }}>92,500,000 EGP</td>
                <td style={{ padding: '14px 16px', color: 'var(--erp-status-warning)' }}>3 {isAr ? 'دعاوى' : 'Cases'}</td>
                <td style={{ padding: '14px 16px' }}>328</td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{ color: 'var(--erp-status-success)', fontWeight: 800 }}>97.8%</span>
                </td>
              </tr>
              <tr style={{ fontSize: '13.5px' }}>
                <td style={{ padding: '14px 16px', fontWeight: 700 }}>
                  {isAr ? 'أركان للتطوير العقاري والاستثمار' : 'Arkan Real Estate Development'}
                </td>
                <td style={{ padding: '14px 16px' }}>1 {isAr ? 'مشروع' : 'Project'}</td>
                <td style={{ padding: '14px 16px', fontWeight: 700 }}>11,000,000 EGP</td>
                <td style={{ padding: '14px 16px', color: 'var(--erp-text-dim)' }}>0 {isAr ? 'دعاوى' : 'Cases'}</td>
                <td style={{ padding: '14px 16px' }}>90</td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{ color: 'var(--erp-status-success)', fontWeight: 800 }}>100%</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
