import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  SendHorizontal, 
  Inbox, 
  FileText, 
  Plus, 
  Search, 
  Clock, 
  Building2,
  FileCheck,
  HelpCircle,
  Receipt,
  Users,
  AlertTriangle,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { EmbeddedAppContainer } from '../../components/common/EmbeddedAppContainer';

export type DocClassification = 'ALL' | 'LTR' | 'SUB' | 'RFI' | 'IPC' | 'TRANS';

interface PCMSCorrespondence {
  id: string;
  serialNumber: string;
  barcode: string;
  direction: 'Incoming' | 'Outgoing';
  classification: 'LTR' | 'SUB' | 'RFI' | 'IPC' | 'TRANS';
  classificationAr: string;
  projectRef: string;
  projectName: string;
  subject: string;
  senderEntity: string;
  senderCode: string;
  receiverEntity: string;
  receiverCode: string;
  priority: 'Normal' | 'Urgent' | 'Immediate';
  issueDate: string;
  dueDate: string;
  status: 'Pending' | 'Approved' | 'Replied' | 'Closed';
  statusAr: string;
  driveScanId: string;
  workflowAction?: {
    actionRequired: string;
    assignedTo: string;
    status: 'Pending' | 'Completed' | 'Overdue';
  };
}

const MOCK_PCMS_DATA: PCMSCorrespondence[] = [
  {
    id: 'pcms_01',
    serialNumber: 'PRJ-TOW-CON-CTR-LTR-26-0045',
    barcode: '||| | |||| ||| ||||',
    direction: 'Incoming',
    classification: 'LTR',
    classificationAr: 'خطاب رسمي (LTR)',
    projectRef: 'PRJ-TOW-01',
    projectName: 'مشروع البرج الإداري والتجاري (ألفا)',
    subject: 'إشعار ربط ضريبة القيمة المضافة واعتماد الدفعة الاستشارية رقم 4',
    senderEntity: 'مكتب دار الهندسة للاستشارات',
    senderCode: 'CON',
    receiverEntity: 'أركان للإنشاءات الهندسية (المقاول العام)',
    receiverCode: 'CTR',
    priority: 'Urgent',
    issueDate: '2026-09-18',
    dueDate: '2026-09-25',
    status: 'Pending',
    statusAr: 'قيد مراجعة مدير المشروع',
    driveScanId: 'drive_cts_in_0045',
    workflowAction: {
      actionRequired: 'إعداد الرد الفني والمالي خلال 7 أيام عمل',
      assignedTo: 'م. أحمد شكري',
      status: 'Pending'
    }
  },
  {
    id: 'pcms_02',
    serialNumber: 'PRJ-TOW-CTR-CON-SUB-26-0112',
    barcode: '|||| || ||| |||| |',
    direction: 'Outgoing',
    classification: 'SUB',
    classificationAr: 'اعتماد فني / شوب دروينج (SUB)',
    projectRef: 'PRJ-TOW-01',
    projectName: 'مشروع البرج الإداري والتجاري (ألفا)',
    subject: 'اعتماد مخططات ورشة تسليح بلاطات الدور الخامس والسادس (Rev 01)',
    senderEntity: 'أركان للإنشاءات الهندسية (المكتب الفني)',
    senderCode: 'CTR',
    receiverEntity: 'مكتب دار الهندسة للاستشارات',
    receiverCode: 'CON',
    priority: 'Normal',
    issueDate: '2026-09-16',
    dueDate: '2026-09-30',
    status: 'Approved',
    statusAr: 'معتمد برمجياً صادر رسمي',
    driveScanId: 'drive_cts_sub_0112'
  },
  {
    id: 'pcms_03',
    serialNumber: 'PRJ-MED-CTR-CON-RFI-26-0028',
    barcode: '|| |||| | ||| ||||',
    direction: 'Outgoing',
    classification: 'RFI',
    classificationAr: 'استفسار فني تعاقدي (RFI)',
    projectRef: 'PRJ-MED-04',
    projectName: 'مجمع المراكز الطبية التخصصية المتكامل',
    subject: 'طلب توضيح تداخل مسارات مسالك التكييف مع العوارض الإنشائية المقلوبة',
    senderEntity: 'أركان للإنشاءات الهندسية (فريق الكهروميكانيك)',
    senderCode: 'CTR',
    receiverEntity: 'المكتب العربي للاستشارات الهندسية (ACE)',
    receiverCode: 'CON',
    priority: 'Immediate',
    issueDate: '2026-09-17',
    dueDate: '2026-09-22',
    status: 'Pending',
    statusAr: 'بانتظار رد الاستشاري',
    driveScanId: 'drive_cts_rfi_0028',
    workflowAction: {
      actionRequired: 'مطلوب إفادة موقعية عاجلة لاستمرار أعمال الصب',
      assignedTo: 'استشاري الأعمال الكهروميكانيكية',
      status: 'Pending'
    }
  },
  {
    id: 'pcms_04',
    serialNumber: 'PRJ-MED-CTR-OWN-IPC-26-0007',
    barcode: '||||| || | |||| ||',
    direction: 'Outgoing',
    classification: 'IPC',
    classificationAr: 'مستخلص جاري (IPC)',
    projectRef: 'PRJ-MED-04',
    projectName: 'مجمع المراكز الطبية التخصصية المتكامل',
    subject: 'تقديم المستخلص الجاري رقم (7) عن الأعمال المنفذة حتى تاريخه',
    senderEntity: 'أركان للإنشاءات الهندسية',
    senderCode: 'CTR',
    receiverEntity: 'وزارة الصحة والسكان (الجهة المالكة)',
    receiverCode: 'OWN',
    priority: 'Normal',
    issueDate: '2026-09-15',
    dueDate: '2026-10-15',
    status: 'Approved',
    statusAr: 'معتمد للمراجعة المالية',
    driveScanId: 'drive_cts_ipc_0007'
  }
];

const CtsQuickDashboard: React.FC = () => {
  const { language, previewDriveFile, activeCompany } = useApp();
  const [directionFilter, setDirectionFilter] = useState<'ALL' | 'Incoming' | 'Outgoing'>('ALL');
  const [classificationFilter, setClassificationFilter] = useState<DocClassification>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const isAr = language === 'ar';

  const CLASSIFICATION_BUTTONS: { id: DocClassification; labelAr: string; labelEn: string; icon: React.ElementType }[] = [
    { id: 'ALL', labelAr: 'كافة التصنيفات', labelEn: 'All Classifications', icon: FileText },
    { id: 'LTR', labelAr: 'خطابات رسمية (LTR)', labelEn: 'Letters (LTR)', icon: SendHorizontal },
    { id: 'SUB', labelAr: 'اعتمادات فنية (SUB)', labelEn: 'Submittals (SUB)', icon: FileCheck },
    { id: 'RFI', labelAr: 'استفسارات (RFI)', labelEn: 'RFIs', icon: HelpCircle },
    { id: 'IPC', labelAr: 'مستخلصات (IPC)', labelEn: 'Certificates (IPC)', icon: Receipt }
  ];

  const filteredItems = MOCK_PCMS_DATA.filter(item => {
    const matchesDirection = directionFilter === 'ALL' || item.direction === directionFilter;
    const matchesClassification = classificationFilter === 'ALL' || item.classification === classificationFilter;
    const matchesSearch = 
      item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.senderEntity.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDirection && matchesClassification && matchesSearch;
  });

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--erp-space-6)' }}>
      {/* Header */}
      <div className="glass-card" style={{
        padding: '24px 28px',
        borderInlineStart: '4px solid var(--erp-dept-cts)',
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
            background: 'hsla(215, 90%, 54%, 0.15)',
            color: 'var(--erp-dept-cts)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <SendHorizontal size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--erp-text-main)' }}>
                {isAr ? 'نظام الصادر والوارد وإدارة مراسلات المشاريع (PCMS / CTS)' : 'Project Correspondence Management (PCMS / CTS)'}
              </h1>
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                background: 'hsla(215, 90%, 54%, 0.15)',
                color: 'var(--erp-dept-cts)',
                padding: '2px 8px',
                borderRadius: 'var(--erp-radius-sm)'
              }}>
                ATOMIC SERIAL NUMBERING
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--erp-text-muted)', marginTop: '2px' }}>
              {isAr ? `تتبع المكاتبات، اعتمادات الشوب دروينج، الـ RFI، والمستخلصات لـ: ${activeCompany.nameAr}` : `Official correspondence, submittals, RFIs, and payment certificates for ${activeCompany.nameEn}`}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 'var(--erp-space-2)' }}>
          <button
            onClick={() => alert(isAr ? 'فتح نافذة تسجيل صادر / وارد جديد بالترقيم الذري القياسي...' : 'Opening new atomic correspondence form...')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'var(--erp-dept-cts)',
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
            <span>{isAr ? 'مكاتبة جديدة (ترقيم قياسي)' : 'New Correspondence'}</span>
          </button>
        </div>
      </div>

      {/* Direction Tabs (All / Inbound / Outbound) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 'var(--erp-space-4)'
      }}>
        <div style={{ display: 'flex', gap: 'var(--erp-space-2)' }}>
          <button
            onClick={() => setDirectionFilter('ALL')}
            style={{
              padding: '10px 18px',
              borderRadius: 'var(--erp-radius-lg)',
              border: directionFilter === 'ALL' ? '1px solid var(--erp-dept-cts)' : '1px solid var(--erp-border-color)',
              background: directionFilter === 'ALL' ? 'hsla(215, 90%, 54%, 0.15)' : 'var(--erp-bg-surface)',
              color: directionFilter === 'ALL' ? 'var(--erp-dept-cts)' : 'var(--erp-text-main)',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {isAr ? 'كافة المعاملات' : 'All Transactions'} ({MOCK_PCMS_DATA.length})
          </button>
          <button
            onClick={() => setDirectionFilter('Incoming')}
            style={{
              padding: '10px 18px',
              borderRadius: 'var(--erp-radius-lg)',
              border: directionFilter === 'Incoming' ? '1px solid var(--erp-dept-cts)' : '1px solid var(--erp-border-color)',
              background: directionFilter === 'Incoming' ? 'hsla(215, 90%, 54%, 0.15)' : 'var(--erp-bg-surface)',
              color: directionFilter === 'Incoming' ? 'var(--erp-dept-cts)' : 'var(--erp-text-main)',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Inbox size={15} />
            <span>{isAr ? 'سجل الوارد (Incoming)' : 'Inbound'}</span>
          </button>
          <button
            onClick={() => setDirectionFilter('Outgoing')}
            style={{
              padding: '10px 18px',
              borderRadius: 'var(--erp-radius-lg)',
              border: directionFilter === 'Outgoing' ? '1px solid var(--erp-dept-cts)' : '1px solid var(--erp-border-color)',
              background: directionFilter === 'Outgoing' ? 'hsla(215, 90%, 54%, 0.15)' : 'var(--erp-bg-surface)',
              color: directionFilter === 'Outgoing' ? 'var(--erp-dept-cts)' : 'var(--erp-text-main)',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <SendHorizontal size={15} />
            <span>{isAr ? 'سجل الصادر (Outgoing)' : 'Outbound'}</span>
          </button>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={16} style={{ position: 'absolute', top: '12px', insetInlineStart: '12px', color: 'var(--erp-text-dim)' }} />
          <input
            type="text"
            placeholder={isAr ? 'بحث بالرقم المسلسل أو المشروع أو الموضوع...' : 'Search by serial, project, or subject...'}
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

      {/* Classification Pills Bar */}
      <div style={{ display: 'flex', gap: 'var(--erp-space-2)', flexWrap: 'wrap' }}>
        {CLASSIFICATION_BUTTONS.map(btn => {
          const Icon = btn.icon;
          const isSelected = classificationFilter === btn.id;
          return (
            <button
              key={btn.id}
              onClick={() => setClassificationFilter(btn.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: 'var(--erp-radius-full)',
                border: isSelected ? '1px solid var(--erp-dept-cts)' : '1px solid var(--erp-border-color)',
                background: isSelected ? 'var(--erp-dept-cts)' : 'var(--erp-bg-subtle)',
                color: isSelected ? '#fff' : 'var(--erp-text-muted)',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <Icon size={14} />
              <span>{isAr ? btn.labelAr : btn.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* Correspondence Table */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isAr ? 'right' : 'left' }}>
            <thead>
              <tr style={{ background: 'var(--erp-bg-subtle)', borderBottom: '1px solid var(--erp-border-color)', color: 'var(--erp-text-dim)', fontSize: '12px', textTransform: 'uppercase' }}>
                <th style={{ padding: '14px 16px' }}>{isAr ? 'الرقم المسلسل والباركود' : 'Serial & Barcode'}</th>
                <th style={{ padding: '14px 16px' }}>{isAr ? 'التصنيف والمشروع' : 'Classification & Project'}</th>
                <th style={{ padding: '14px 16px' }}>{isAr ? 'الموضوع وملخص المعاملة' : 'Subject'}</th>
                <th style={{ padding: '14px 16px' }}>{isAr ? 'أطراف المكاتبة' : 'Stakeholders'}</th>
                <th style={{ padding: '14px 16px' }}>{isAr ? 'الأسبقية والاستحقاق' : 'Priority & SLA'}</th>
                <th style={{ padding: '14px 16px' }}>{isAr ? 'الموقف الإجرائي' : 'Status'}</th>
                <th style={{ padding: '14px 16px' }}>{isAr ? 'الأرشيف السحابي (Drive)' : 'Drive Vault'}</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--erp-border-color)', fontSize: '13.5px' }}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontWeight: 800, color: 'var(--erp-text-main)', fontFamily: 'monospace', fontSize: '13px' }}>
                      {item.serialNumber}
                    </div>
                    <div style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--erp-text-dim)', letterSpacing: '2px', marginTop: '2px' }}>
                      {item.barcode}
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{
                      display: 'inline-block',
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 'var(--erp-radius-sm)',
                      background: 'var(--erp-brand-primary-subtle)',
                      color: 'var(--erp-brand-primary)'
                    }}>
                      {item.classificationAr}
                    </span>
                    <div style={{ fontSize: '11.5px', color: 'var(--erp-text-dim)', marginTop: '4px', fontWeight: 600 }}>
                      {item.projectRef}
                    </div>
                  </td>
                  <td style={{ padding: '16px', maxWidth: '320px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--erp-text-main)', lineHeight: 1.4 }}>
                      {item.subject}
                    </div>
                    {item.workflowAction && (
                      <div style={{ fontSize: '11.5px', color: 'var(--erp-status-warning)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <AlertTriangle size={12} />
                        <span>{item.workflowAction.actionRequired}</span>
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontSize: '12.5px', fontWeight: 600 }}>
                      <span style={{ color: 'var(--erp-text-dim)' }}>{isAr ? 'من:' : 'From:'} </span>
                      {item.senderEntity} <strong style={{ color: 'var(--erp-brand-primary)' }}>({item.senderCode})</strong>
                    </div>
                    <div style={{ fontSize: '12.5px', color: 'var(--erp-text-muted)', marginTop: '2px' }}>
                      <span style={{ color: 'var(--erp-text-dim)' }}>{isAr ? 'إلى:' : 'To:'} </span>
                      {item.receiverEntity} <strong style={{ color: 'var(--erp-dept-cts)' }}>({item.receiverCode})</strong>
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{
                      display: 'inline-block',
                      fontSize: '10.5px',
                      fontWeight: 800,
                      padding: '2px 6px',
                      borderRadius: 'var(--erp-radius-sm)',
                      background: item.priority === 'Immediate' ? 'hsla(0, 84%, 60%, 0.15)' : item.priority === 'Urgent' ? 'hsla(38, 92%, 50%, 0.15)' : 'hsla(215, 90%, 54%, 0.15)',
                      color: item.priority === 'Immediate' ? 'var(--erp-status-danger)' : item.priority === 'Urgent' ? 'var(--erp-status-warning)' : 'var(--erp-brand-primary)'
                    }}>
                      {item.priority}
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--erp-text-dim)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} />
                      <span>{item.dueDate}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{
                      fontSize: '11.5px',
                      fontWeight: 700,
                      color: item.status === 'Approved' ? 'var(--erp-status-success)' : 'var(--erp-status-warning)'
                    }}>
                      {item.statusAr}
                    </span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <button
                      onClick={() => previewDriveFile(item.driveScanId, `${item.serialNumber}.pdf`)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: 'var(--erp-radius-md)',
                        background: 'var(--erp-bg-subtle)',
                        border: '1px solid var(--erp-border-color)',
                        color: 'var(--erp-dept-cts)',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      <FileText size={14} />
                      <span>{isAr ? 'معاينة المكاتبة' : 'View File'}</span>
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

export const CtsModule: React.FC = () => {
  return (
    <EmbeddedAppContainer
      appUrl="/apps/cts/"
      appTitleAr="نظام الصادر والوارد وإدارة مراسلات المشاريع (PCMS / CTS)"
      appTitleEn="Project Correspondence Management System (PCMS / CTS)"
      departmentCode="05_CTS"
      accentColor="var(--erp-dept-cts)"
      badgeAr="المنظومة الأصلية كاملة"
      badgeEn="FULL PRODUCTION APP"
      fallbackDashboard={<CtsQuickDashboard />}
    />
  );
};
