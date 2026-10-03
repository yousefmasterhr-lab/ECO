import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, Clock, AlertTriangle, AlertCircle, Info, ChevronRight, ChevronLeft } from 'lucide-react';

export const ExpirationsDrawer: React.FC = () => {
  const { isExpirationsOpen, setIsExpirationsOpen, expirations, language, setActiveModule } = useApp();

  if (!isExpirationsOpen) return null;

  const getSeverityStyle = (severity: 'CRITICAL' | 'WARNING' | 'INFO') => {
    switch (severity) {
      case 'CRITICAL':
        return {
          border: '1px solid var(--erp-status-danger)',
          bg: 'hsla(0, 84%, 60%, 0.1)',
          badgeColor: 'var(--erp-status-danger)',
          icon: AlertCircle
        };
      case 'WARNING':
        return {
          border: '1px solid var(--erp-status-warning)',
          bg: 'hsla(38, 92%, 50%, 0.1)',
          badgeColor: 'var(--erp-status-warning)',
          icon: AlertTriangle
        };
      default:
        return {
          border: '1px solid var(--erp-status-info)',
          bg: 'hsla(217, 91%, 60%, 0.1)',
          badgeColor: 'var(--erp-status-info)',
          icon: Info
        };
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(4px)',
      zIndex: 90,
      display: 'flex',
      justifyContent: language === 'ar' ? 'flex-start' : 'flex-end'
    }}>
      <div 
        className="glass-panel animate-fade-in"
        style={{
          width: '420px',
          maxWidth: '100vw',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--erp-bg-surface)',
          borderInlineStart: '1px solid var(--erp-border-color)'
        }}
      >
        {/* Drawer Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: '1px solid var(--erp-border-color)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--erp-space-2)' }}>
            <Clock size={20} color="var(--erp-brand-primary)" />
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--erp-text-main)' }}>
              {language === 'ar' ? 'مركز التنبيهات وتواريخ الانتهاء' : 'Smart Expiration Monitor'}
            </h3>
          </div>
          <button
            onClick={() => setIsExpirationsOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--erp-text-muted)',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Info Banner */}
        <div style={{
          padding: '12px 20px',
          background: 'var(--erp-bg-subtle)',
          fontSize: '12px',
          color: 'var(--erp-text-muted)',
          borderBottom: '1px solid var(--erp-border-color)'
        }}>
          {language === 'ar'
            ? 'يتم الفحص التلقائي دورياً عبر Cron Job للتنبيه المسبق (60، 30، 15، 7، 1 أيام) لجميع عقود وتراخيص وجلسات المجموعة.'
            : 'Automated 24h cron engine auditing records across 60, 30, 15, 7, and 1-day alert thresholds.'}
        </div>

        {/* Expiration List */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: 'var(--erp-space-4)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--erp-space-3)'
        }}>
          {expirations.map(exp => {
            const style = getSeverityStyle(exp.severity);
            const Icon = style.icon;
            return (
              <div
                key={exp.id}
                style={{
                  padding: '14px',
                  borderRadius: 'var(--erp-radius-lg)',
                  background: style.bg,
                  border: style.border,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    color: style.badgeColor,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Icon size={14} />
                    {language === 'ar' ? exp.moduleAr : exp.module}
                  </span>

                  <span style={{
                    fontSize: '12px',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: 'var(--erp-radius-full)',
                    background: style.badgeColor,
                    color: '#fff'
                  }}>
                    {language === 'ar' ? `متبقي ${exp.daysRemaining} يوم` : `${exp.daysRemaining}d left`}
                  </span>
                </div>

                <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--erp-text-main)', lineHeight: 1.4 }}>
                  {language === 'ar' ? exp.titleAr : exp.title}
                </h4>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                  <span style={{ fontSize: '11.5px', color: 'var(--erp-text-dim)' }}>
                    {language === 'ar' ? `تاريخ الاستحقاق: ${exp.expiryDate}` : `Due: ${exp.expiryDate}`}
                  </span>
                  <button
                    onClick={() => {
                      setIsExpirationsOpen(false);
                      setActiveModule(exp.module.toLowerCase());
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: style.badgeColor,
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px'
                    }}
                  >
                    <span>{language === 'ar' ? 'عرض السجل' : 'View Record'}</span>
                    {language === 'ar' ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
