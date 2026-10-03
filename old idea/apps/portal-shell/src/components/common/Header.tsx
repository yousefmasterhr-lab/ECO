import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Building2, 
  Bell, 
  Moon, 
  Sun, 
  Globe, 
  ShieldCheck, 
  Menu, 
  ChevronDown,
  CheckCircle2
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    activeCompany, 
    setActiveCompany, 
    availableCompanies, 
    language, 
    setLanguage, 
    theme, 
    toggleTheme, 
    user, 
    toggleSidebar,
    expirations,
    setIsExpirationsOpen 
  } = useApp();

  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);

  const criticalCount = expirations.filter(e => e.severity === 'CRITICAL' || e.daysRemaining <= 7).length;

  return (
    <header className="glass-panel" style={{
      height: 'var(--header-height)',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingInline: 'var(--erp-space-6)',
      borderBottom: '1px solid var(--erp-border-color)'
    }}>
      {/* Left / Start: Sidebar Toggle & Company Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--erp-space-4)' }}>
        <button 
          onClick={toggleSidebar}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--erp-text-main)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            borderRadius: 'var(--erp-radius-md)',
            transition: 'background var(--erp-transition-fast)'
          }}
          title={language === 'ar' ? 'تبديل القائمة' : 'Toggle Sidebar'}
        >
          <Menu size={22} />
        </button>

        {/* Multi-Company Live Switcher */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setIsCompanyDropdownOpen(!isCompanyDropdownOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--erp-space-2)',
              background: 'var(--erp-bg-subtle)',
              border: '1px solid var(--erp-border-color)',
              padding: '8px 14px',
              borderRadius: 'var(--erp-radius-lg)',
              cursor: 'pointer',
              color: 'var(--erp-text-main)',
              fontSize: '13.5px',
              fontWeight: 600
            }}
          >
            <Building2 size={16} color="var(--erp-brand-primary)" />
            <span>{language === 'ar' ? activeCompany.nameAr : activeCompany.nameEn}</span>
            <span style={{ 
              fontSize: '11px', 
              background: 'var(--erp-brand-primary-subtle)', 
              color: 'var(--erp-brand-primary)', 
              padding: '2px 6px', 
              borderRadius: 'var(--erp-radius-sm)',
              fontWeight: 700 
            }}>
              {activeCompany.code}
            </span>
            <ChevronDown size={14} style={{ opacity: 0.7 }} />
          </button>

          {isCompanyDropdownOpen && (
            <div 
              className="glass-panel animate-fade-in"
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                insetInlineStart: 0,
                width: '320px',
                borderRadius: 'var(--erp-radius-lg)',
                padding: 'var(--erp-space-2)',
                boxShadow: 'var(--erp-shadow-lg)',
                zIndex: 50
              }}
            >
              <div style={{ 
                padding: '6px 10px', 
                fontSize: '11px', 
                fontWeight: 700, 
                color: 'var(--erp-text-dim)',
                textTransform: 'uppercase',
                borderBottom: '1px solid var(--erp-border-color)',
                marginBottom: '4px'
              }}>
                {language === 'ar' ? 'الشركات والكيانات التابعة' : 'Subsidiary Companies'}
              </div>
              {availableCompanies.map(comp => (
                <div
                  key={comp.id}
                  onClick={() => {
                    setActiveCompany(comp);
                    setIsCompanyDropdownOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: 'var(--erp-radius-md)',
                    cursor: 'pointer',
                    background: comp.id === activeCompany.id ? 'var(--erp-brand-primary-subtle)' : 'transparent',
                    color: comp.id === activeCompany.id ? 'var(--erp-brand-primary)' : 'var(--erp-text-main)',
                    fontSize: '13px',
                    fontWeight: comp.id === activeCompany.id ? 700 : 500,
                    transition: 'background var(--erp-transition-fast)'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span>{language === 'ar' ? comp.nameAr : comp.nameEn}</span>
                    <span style={{ fontSize: '11px', color: 'var(--erp-text-dim)' }}>
                      {comp.code} • {comp.currency}
                    </span>
                  </div>
                  {comp.id === activeCompany.id && <CheckCircle2 size={16} />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right / End: Actions & Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--erp-space-3)' }}>
        {/* Smart Expirations / Notifications Button */}
        <button
          onClick={() => setIsExpirationsOpen(true)}
          style={{
            position: 'relative',
            background: 'var(--erp-bg-subtle)',
            border: '1px solid var(--erp-border-color)',
            color: 'var(--erp-text-main)',
            width: '42px',
            height: '42px',
            borderRadius: 'var(--erp-radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
          title={language === 'ar' ? 'سجل التنبيهات وتواريخ الانتهاء' : 'Expirations & Alerts'}
        >
          <Bell size={18} />
          {criticalCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '6px',
              insetInlineEnd: '6px',
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              backgroundColor: 'var(--erp-status-danger)',
              color: '#fff',
              fontSize: '10px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {criticalCount}
            </span>
          )}
        </button>

        {/* Language Switcher (AR / EN) */}
        <button
          onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--erp-bg-subtle)',
            border: '1px solid var(--erp-border-color)',
            color: 'var(--erp-text-main)',
            height: '42px',
            paddingInline: '12px',
            borderRadius: 'var(--erp-radius-md)',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 700
          }}
          title={language === 'ar' ? 'Switch to English' : 'التحويل للغة العربية'}
        >
          <Globe size={16} />
          <span>{language === 'ar' ? 'English' : 'العربية'}</span>
        </button>

        {/* Theme Switcher (Dark / Light) */}
        <button
          onClick={toggleTheme}
          style={{
            background: 'var(--erp-bg-subtle)',
            border: '1px solid var(--erp-border-color)',
            color: 'var(--erp-text-main)',
            width: '42px',
            height: '42px',
            borderRadius: 'var(--erp-radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
          title={language === 'ar' ? 'تبديل المظهر' : 'Toggle Theme'}
        >
          {theme === 'dark' ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="#6366f1" />}
        </button>

        {/* User Profile & Clearance Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--erp-space-3)',
          paddingInlineStart: 'var(--erp-space-2)',
          borderInlineStart: '1px solid var(--erp-border-color)'
        }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: 'var(--erp-radius-md)',
            background: 'linear-gradient(135deg, hsl(221, 83%, 53%), hsl(262, 83%, 58%))',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '14px'
          }}>
            ط
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--erp-text-main)' }}>
              {user.name}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={12} color="var(--erp-dept-executive)" />
              <span style={{ fontSize: '11px', color: 'var(--erp-dept-executive)', fontWeight: 700 }}>
                {language === 'ar' ? 'مستوى الأمان 4 (C-Suite)' : 'Clearance Level 4'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
