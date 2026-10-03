import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Scale, 
  FileText, 
  Calendar, 
  Plus, 
  Search, 
  ExternalLink, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

interface LegalCaseRecord {
  id: string;
  caseNumber: string;
  court: string;
  circuit: string;
  caseType: string;
  caseTypeAr: string;
  capacity: 'PLAINTIFF' | 'DEFENDANT';
  capacityAr: string;
  opponent: string;
  disputedAmount: number;
  stage: string;
  stageAr: string;
  status: 'PENDING' | 'WON' | 'LOST' | 'SETTLED';
  statusAr: string;
  nextHearing: string;
  leadAttorney: string;
  driveFileId: string;
  clearanceLevel: number;
}

const MOCK_CASES: LegalCaseRecord[] = [
  {
    id: 'case_01',
    caseNumber: '412 / 2026',
    court: 'محكمة شمال القاهرة الابتدائية',
    circuit: 'الدائرة 7 تجاري كلي',
    caseType: 'COMMERCIAL',
    caseTypeAr: 'منازعة تجارية ومقاولات',
    capacity: 'DEFENDANT',
    capacityAr: 'مدعى عليه',
    opponent: 'شركة النيل للخرسانة الجاهزة',
    disputedAmount: 4250000,
    stage: 'APPEAL',
    stageAr: 'استئناف عالي',
    status: 'PENDING',
    statusAr: 'متداولة بالجلسات',
    nextHearing: '2026-09-26',
    leadAttorney: 'المستشار: طارق منصور',
    driveFileId: 'legal_doc_case_412_appeal',
    clearanceLevel: 3
  },
  {
    id: 'case_02',
    caseNumber: '1088 / 2025',
    court: 'محكمة الجيزة الاقتصادية',
    circuit: 'الدائرة 2 استئناف اقتصادي',
    caseType: 'COMMERCIAL',
    caseTypeAr: 'تحكيم ومطالبة مالية',
    capacity: 'PLAINTIFF',
    capacityAr: 'مدعي',
    opponent: 'المجموعة الهندسية المتحدة للتوريدات',
    disputedAmount: 8150000,
    stage: 'EXECUTION',
    stageAr: 'تنفيذ حكم تحكيم',
    status: 'WON',
    statusAr: 'حكم لصالح الشركة',
    nextHearing: '2026-10-12',
    leadAttorney: 'المستشار: وليد الفقي',
    driveFileId: 'legal_doc_case_1088_verdict',
    clearanceLevel: 4
  },
  {
    id: 'case_03',
    caseNumber: '320 / 2026',
    court: 'محكمة عمال 6 أكتوبر',
    circuit: 'الدائرة 3 عمالي جزئي',
    caseType: 'LABOR',
    caseTypeAr: 'دعوى عمالية ومستحقات',
    capacity: 'DEFENDANT',
    capacityAr: 'مدعى عليه',
    opponent: 'مدير موقع سابق',
    disputedAmount: 180000,
    stage: 'FIRST_INSTANCE',
    stageAr: 'أول درجة',
    status: 'PENDING',
    statusAr: 'قيد تقرير الخبير',
    nextHearing: '2026-10-02',
    leadAttorney: 'أ/ سامح راشد',
    driveFileId: 'legal_doc_case_320_labor',
    clearanceLevel: 2
  }
];

export const LegalModule: React.FC = () => {
  const { language, previewDriveFile, activeCompany } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState<'CASES' | 'HEARINGS' | 'CONTRACTS'>('CASES');

  const isAr = language === 'ar';

  const filteredCases = MOCK_CASES.filter(c => 
    c.caseNumber.includes(searchTerm) || 
    c.opponent.includes(searchTerm) || 
    c.court.includes(searchTerm)
  );

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--erp-space-6)' }}>
      {/* Module Header */}
      <div className="glass-card" style={{
        padding: '24px 28px',
        borderInlineStart: '4px solid var(--erp-dept-legal)',
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
            background: 'hsla(346, 87%, 55%, 0.15)',
            color: 'var(--erp-dept-legal)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Scale size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--erp-text-main)' }}>
                {isAr ? 'بوابة الشؤون القانونية والقضايا والتحكيم' : 'Legal Affairs & Litigation Portal'}
              </h1>
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                background: 'hsla(346, 87%, 55%, 0.15)',
                color: 'var(--erp-dept-legal)',
                padding: '2px 8px',
                borderRadius: 'var(--erp-radius-sm)'
              }}>
                LEVEL 2 - 4 STRICT CLEARANCE
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--erp-text-muted)', marginTop: '2px' }}>
              {isAr ? `إدارة الدعاوى، جلسات المحاكم، والعقود الرسمية التابعة لـ: ${activeCompany.nameAr}` : `Court docket, hearings, and contracts vault for ${activeCompany.nameEn}`}
            </p>
          </div>
        </div>

        <button
          onClick={() => alert(isAr ? 'فتح نافذة تسجيل دعوى قضائية جديدة ومزامنة درايف...' : 'Opening new lawsuit registration modal...')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--erp-dept-legal)',
            color: '#fff',
            border: 'none',
            padding: '10px 18px',
            borderRadius: 'var(--erp-radius-lg)',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          <Plus size={16} />
          <span>{isAr ? 'قيد دعوى قضائية جديدة' : 'Register New Case'}</span>
        </button>
      </div>

      {/* Navigation Tabs & Search Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 'var(--erp-space-4)'
      }}>
        <div style={{ display: 'flex', gap: 'var(--erp-space-2)' }}>
          <button
            onClick={() => setSelectedTab('CASES')}
            style={{
              padding: '10px 18px',
              borderRadius: 'var(--erp-radius-lg)',
              border: selectedTab === 'CASES' ? '1px solid var(--erp-dept-legal)' : '1px solid var(--erp-border-color)',
              background: selectedTab === 'CASES' ? 'hsla(346, 87%, 55%, 0.15)' : 'var(--erp-bg-surface)',
              color: selectedTab === 'CASES' ? 'var(--erp-dept-legal)' : 'var(--erp-text-main)',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {isAr ? 'جدول القضايا والدعاوى' : 'Litigation Docket'} (3)
          </button>
          <button
            onClick={() => setSelectedTab('HEARINGS')}
            style={{
              padding: '10px 18px',
              borderRadius: 'var(--erp-radius-lg)',
              border: selectedTab === 'HEARINGS' ? '1px solid var(--erp-dept-legal)' : '1px solid var(--erp-border-color)',
              background: selectedTab === 'HEARINGS' ? 'hsla(346, 87%, 55%, 0.15)' : 'var(--erp-bg-surface)',
              color: selectedTab === 'HEARINGS' ? 'var(--erp-dept-legal)' : 'var(--erp-text-main)',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {isAr ? 'أجندة جلسات المحاكم' : 'Upcoming Hearings'}
          </button>
          <button
            onClick={() => setSelectedTab('CONTRACTS')}
            style={{
              padding: '10px 18px',
              borderRadius: 'var(--erp-radius-lg)',
              border: selectedTab === 'CONTRACTS' ? '1px solid var(--erp-dept-legal)' : '1px solid var(--erp-border-color)',
              background: selectedTab === 'CONTRACTS' ? 'hsla(346, 87%, 55%, 0.15)' : 'var(--erp-bg-surface)',
              color: selectedTab === 'CONTRACTS' ? 'var(--erp-dept-legal)' : 'var(--erp-text-main)',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {isAr ? 'مستودع العقود والاتفاقيات' : 'Contracts Vault'}
          </button>
        </div>

        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={16} style={{ position: 'absolute', top: '12px', insetInlineStart: '12px', color: 'var(--erp-text-dim)' }} />
          <input
            type="text"
            placeholder={isAr ? 'بحث برقم القضية أو الخصم...' : 'Search by case # or opponent...'}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
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

      {/* Cases Docket Table */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isAr ? 'right' : 'left' }}>
            <thead>
              <tr style={{ background: 'var(--erp-bg-subtle)', borderBottom: '1px solid var(--erp-border-color)', color: 'var(--erp-text-dim)', fontSize: '12px', textTransform: 'uppercase' }}>
                <th style={{ padding: '14px 16px' }}>{isAr ? 'رقم الدعوى والمحكمة' : 'Case # & Court'}</th>
                <th style={{ padding: '14px 16px' }}>{isAr ? 'نوع الدعوى والصفة' : 'Type & Capacity'}</th>
                <th style={{ padding: '14px 16px' }}>{isAr ? 'الطرف الخصم' : 'Opponent'}</th>
                <th style={{ padding: '14px 16px' }}>{isAr ? 'قيمة المطالبة' : 'Claimed Amount'}</th>
                <th style={{ padding: '14px 16px' }}>{isAr ? 'الجلسة القادمة' : 'Next Hearing'}</th>
                <th style={{ padding: '14px 16px' }}>{isAr ? 'الحالة والمرحلة' : 'Status & Stage'}</th>
                <th style={{ padding: '14px 16px' }}>{isAr ? 'المحامي ومستوى الأمان' : 'Counsel & Clearance'}</th>
                <th style={{ padding: '14px 16px' }}>{isAr ? 'المرفقات (Drive)' : 'Drive Vault'}</th>
              </tr>
            </thead>
            <tbody>
              {filteredCases.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid var(--erp-border-color)', fontSize: '13.5px' }}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontWeight: 800, color: 'var(--erp-text-main)' }}>{c.caseNumber}</div>
                    <div style={{ fontSize: '11.5px', color: 'var(--erp-text-dim)', marginTop: '2px' }}>
                      {c.court} • {c.circuit}
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontWeight: 600 }}>{isAr ? c.caseTypeAr : c.caseType}</div>
                    <span style={{
                      display: 'inline-block',
                      fontSize: '10.5px',
                      fontWeight: 700,
                      marginTop: '4px',
                      padding: '2px 6px',
                      borderRadius: 'var(--erp-radius-sm)',
                      background: c.capacity === 'PLAINTIFF' ? 'hsla(142, 71%, 45%, 0.15)' : 'hsla(0, 84%, 60%, 0.15)',
                      color: c.capacity === 'PLAINTIFF' ? 'var(--erp-status-success)' : 'var(--erp-status-danger)'
                    }}>
                      {isAr ? c.capacityAr : c.capacity}
                    </span>
                  </td>
                  <td style={{ padding: '16px', fontWeight: 600 }}>{c.opponent}</td>
                  <td style={{ padding: '16px', fontWeight: 800 }}>
                    {c.disputedAmount.toLocaleString()} {activeCompany.currency}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--erp-status-danger)', fontWeight: 700 }}>
                      <Clock size={14} />
                      <span>{c.nextHearing}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontWeight: 700, color: c.status === 'WON' ? 'var(--erp-status-success)' : 'var(--erp-status-warning)' }}>
                      {isAr ? c.statusAr : c.status}
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--erp-text-dim)' }}>
                      {isAr ? c.stageAr : c.stage}
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontWeight: 600 }}>{c.leadAttorney}</div>
                    <div style={{ fontSize: '11px', color: 'var(--erp-dept-legal)', fontWeight: 700, marginTop: '2px' }}>
                      Clearance Level {c.clearanceLevel}
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <button
                      onClick={() => previewDriveFile(c.driveFileId, `Dossier_Case_${c.caseNumber.replace(/\s+/g, '_')}.pdf`)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: 'var(--erp-radius-md)',
                        background: 'var(--erp-bg-subtle)',
                        border: '1px solid var(--erp-border-color)',
                        color: 'var(--erp-brand-primary)',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      <FileText size={14} />
                      <span>{isAr ? 'معاينة الملف' : 'View File'}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
