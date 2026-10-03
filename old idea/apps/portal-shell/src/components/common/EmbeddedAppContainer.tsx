import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ExternalLink, 
  RotateCw, 
  Maximize2, 
  Minimize2, 
  ShieldCheck, 
  Layers, 
  Sparkles,
  ArrowUpRight
} from 'lucide-react';

interface EmbeddedAppContainerProps {
  appUrl: string;
  appTitleAr: string;
  appTitleEn: string;
  departmentCode: string;
  accentColor: string;
  badgeAr: string;
  badgeEn: string;
  fallbackDashboard?: React.ReactNode;
}

export const EmbeddedAppContainer: React.FC<EmbeddedAppContainerProps> = ({
  appUrl,
  appTitleAr,
  appTitleEn,
  departmentCode,
  accentColor,
  badgeAr,
  badgeEn,
  fallbackDashboard
}) => {
  const { language, activeCompany } = useApp();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewMode, setViewMode] = useState<'APP' | 'DASHBOARD'>('APP');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const isAr = language === 'ar';

  const handleReload = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  const handleOpenNewTab = () => {
    window.open(appUrl, '_blank');
  };

  return (
    <div className="animate-fade-in" style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--erp-space-3)',
      height: isFullscreen ? '100vh' : 'calc(100vh - 100px)',
      position: isFullscreen ? 'fixed' : 'relative',
      inset: isFullscreen ? 0 : 'auto',
      zIndex: isFullscreen ? 100 : 'auto',
      background: 'var(--erp-bg-base)',
      padding: isFullscreen ? 'var(--erp-space-4)' : 0
    }}>
      {/* Top Application Header / Control Bar */}
      <div className="glass-card" style={{
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 'var(--erp-space-3)',
        borderInlineStart: `4px solid ${accentColor}`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--erp-space-3)' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: 'var(--erp-radius-md)',
            background: `${accentColor}20`,
            color: accentColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Layers size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--erp-text-main)' }}>
                {isAr ? appTitleAr : appTitleEn}
              </h2>
              <span style={{
                fontSize: '10px',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: 'var(--erp-radius-full)',
                background: `${accentColor}20`,
                color: accentColor
              }}>
                {isAr ? badgeAr : badgeEn}
              </span>
              <span style={{
                fontSize: '11px',
                color: 'var(--erp-status-success)',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--erp-status-success)' }} />
                {isAr ? 'المنظومة الفعلية متصلة' : 'Live Connected'}
              </span>
            </div>
            <span style={{ fontSize: '11.5px', color: 'var(--erp-text-dim)' }}>
              {isAr ? `الشركة الحالية: ${activeCompany.nameAr}` : `Active Company: ${activeCompany.nameEn}`}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--erp-space-2)' }}>
          {fallbackDashboard && (
            <div style={{
              display: 'flex',
              background: 'var(--erp-bg-subtle)',
              padding: '2px',
              borderRadius: 'var(--erp-radius-lg)',
              border: '1px solid var(--erp-border-color)'
            }}>
              <button
                onClick={() => setViewMode('APP')}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--erp-radius-md)',
                  border: 'none',
                  background: viewMode === 'APP' ? accentColor : 'transparent',
                  color: viewMode === 'APP' ? '#fff' : 'var(--erp-text-muted)',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {isAr ? 'الموقع الكامل الأصلي' : 'Full Standalone App'}
              </button>
              <button
                onClick={() => setViewMode('DASHBOARD')}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--erp-radius-md)',
                  border: 'none',
                  background: viewMode === 'DASHBOARD' ? accentColor : 'transparent',
                  color: viewMode === 'DASHBOARD' ? '#fff' : 'var(--erp-text-muted)',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {isAr ? 'لوحة المؤشرات السريعة' : 'Quick Dashboard'}
              </button>
            </div>
          )}

          <button
            onClick={handleReload}
            style={{
              padding: '8px',
              borderRadius: 'var(--erp-radius-md)',
              background: 'var(--erp-bg-subtle)',
              border: '1px solid var(--erp-border-color)',
              color: 'var(--erp-text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title={isAr ? 'إعادة تحميل إطار التطبيق' : 'Reload App Frame'}
          >
            <RotateCw size={15} />
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            style={{
              padding: '8px',
              borderRadius: 'var(--erp-radius-md)',
              background: 'var(--erp-bg-subtle)',
              border: '1px solid var(--erp-border-color)',
              color: 'var(--erp-text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title={isAr ? (isFullscreen ? 'إنهاء ملء الشاشة' : 'وضع ملء الشاشة') : 'Toggle Fullscreen'}
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>

          <button
            onClick={handleOpenNewTab}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: 'var(--erp-radius-md)',
              background: accentColor,
              color: '#fff',
              border: 'none',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <ExternalLink size={14} />
            <span>{isAr ? 'فتح في نافذة كاملة مستقلة' : 'Open in New Window'}</span>
          </button>
        </div>
      </div>

      {/* Main Frame Viewport */}
      {viewMode === 'APP' ? (
        <div style={{
          flex: 1,
          width: '100%',
          borderRadius: 'var(--erp-radius-xl)',
          overflow: 'hidden',
          border: '1px solid var(--erp-border-color)',
          background: 'var(--erp-bg-surface)',
          boxShadow: 'var(--erp-shadow-md)',
          position: 'relative'
        }}>
          <iframe
            ref={iframeRef}
            src={appUrl}
            title={appTitleEn}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              display: 'block'
            }}
            allow="fullscreen; clipboard-read; clipboard-write"
          />
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {fallbackDashboard}
        </div>
      )}
    </div>
  );
};
