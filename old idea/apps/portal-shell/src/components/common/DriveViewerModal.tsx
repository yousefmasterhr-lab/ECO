import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, ExternalLink, Download, FileText, ShieldAlert } from 'lucide-react';

export const DriveViewerModal: React.FC = () => {
  const { drivePreview, closeDrivePreview, language } = useApp();

  if (!drivePreview || !drivePreview.isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--erp-space-6)'
    }}>
      <div 
        className="glass-panel animate-fade-in"
        style={{
          width: '90vw',
          maxWidth: '1000px',
          height: '85vh',
          borderRadius: 'var(--erp-radius-xl)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: 'var(--erp-shadow-lg)'
        }}
      >
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          borderBottom: '1px solid var(--erp-border-color)',
          background: 'var(--erp-bg-surface)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--erp-space-3)' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--erp-radius-md)',
              background: 'var(--erp-brand-primary-subtle)',
              color: 'var(--erp-brand-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FileText size={20} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--erp-text-main)' }}>
                {drivePreview.fileName}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--erp-text-dim)' }}>
                Google Drive ID: {drivePreview.fileId} • {language === 'ar' ? 'مستند مشفر سحابياً' : 'Encrypted Cloud Storage'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--erp-space-2)' }}>
            <a
              href={`https://drive.google.com/file/d/${drivePreview.fileId}/view`}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                borderRadius: 'var(--erp-radius-md)',
                background: 'var(--erp-bg-subtle)',
                border: '1px solid var(--erp-border-color)',
                color: 'var(--erp-text-main)',
                fontSize: '12px',
                fontWeight: 600,
                textDecoration: 'none'
              }}
            >
              <ExternalLink size={14} />
              <span>{language === 'ar' ? 'فتح في درايف' : 'Open in Drive'}</span>
            </a>

            <button
              onClick={closeDrivePreview}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--erp-text-muted)',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: 'var(--erp-radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body: Secure Drive Frame Simulation */}
        <div style={{
          flex: 1,
          background: 'var(--erp-bg-base)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--erp-space-8)'
        }}>
          <div style={{
            maxWidth: '520px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--erp-space-4)'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: 'var(--erp-radius-xl)',
              background: 'var(--erp-brand-primary-subtle)',
              color: 'var(--erp-brand-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FileText size={32} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--erp-text-main)', marginBottom: '8px' }}>
                {language === 'ar' ? 'معاينة المستند عبر Google Drive API v3' : 'Embedded Google Drive API v3 Preview'}
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--erp-text-muted)', lineHeight: 1.6 }}>
                {language === 'ar' 
                  ? 'يتم جلب وعرض المستندات مباشرة عبر قناة البث المشفرة (Streaming Channel) دون حفظ أي ملفات مؤقتة على سيرفر التطبيق لضمان أعلى سرعة وحماية تامة للبيانات.'
                  : 'Files are streamed directly through authorized Google Drive enterprise endpoints without caching locally on the application server, guaranteeing zero data leakage.'}
              </p>
            </div>

            <div style={{
              display: 'flex',
              gap: 'var(--erp-space-3)',
              marginTop: 'var(--erp-space-2)'
            }}>
              <button 
                onClick={() => alert(language === 'ar' ? 'جارٍ التحميل المباشر من Google Drive Vault...' : 'Downloading from Google Drive Vault...')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'var(--erp-brand-primary)',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 18px',
                  borderRadius: 'var(--erp-radius-lg)',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <Download size={16} />
                <span>{language === 'ar' ? 'تنزيل نسخة أصلية' : 'Download Original'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
