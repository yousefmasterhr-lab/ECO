import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  BarChart3, 
  Scale, 
  HardHat, 
  SendHorizontal, 
  ShieldCheck, 
  Users, 
  Layers,
  ChevronRight,
  ChevronLeft,
  Sparkles
} from 'lucide-react';

interface NavItem {
  id: string;
  nameAr: string;
  nameEn: string;
  badgeAr?: string;
  badgeEn?: string;
  icon: React.ElementType;
  accentColor: string;
  clearanceRequired: number;
}

export const Sidebar: React.FC = () => {
  const { 
    activeModule, 
    setActiveModule, 
    isSidebarCollapsed, 
    language,
    user 
  } = useApp();

  const NAV_ITEMS: NavItem[] = [
    {
      id: 'executive',
      nameAr: 'لوحة الإدارة العليا',
      nameEn: 'C-Suite Executive',
      badgeAr: 'جديد',
      badgeEn: 'NEW',
      icon: BarChart3,
      accentColor: 'var(--erp-dept-executive)',
      clearanceRequired: 4
    },
    {
      id: 'legal',
      nameAr: 'الشؤون القانونية والقضايا',
      nameEn: 'Legal & Litigation',
      badgeAr: 'جديد',
      badgeEn: 'NEW',
      icon: Scale,
      accentColor: 'var(--erp-dept-legal)',
      clearanceRequired: 2
    },
    {
      id: 'engineering',
      nameAr: 'المكتب الفني والمشاريع',
      nameEn: 'Technical Engineering',
      icon: HardHat,
      accentColor: 'var(--erp-dept-engineering)',
      clearanceRequired: 1
    },
    {
      id: 'cts',
      nameAr: 'الصادر والوارد (CTS)',
      nameEn: 'Correspondence (CTS)',
      icon: SendHorizontal,
      accentColor: 'var(--erp-dept-cts)',
      clearanceRequired: 1
    },
    {
      id: 'insurance',
      nameAr: 'التأمينات الاجتماعية',
      nameEn: 'Social Insurance',
      icon: ShieldCheck,
      accentColor: 'var(--erp-dept-insurance)',
      clearanceRequired: 2
    },
    {
      id: 'ats',
      nameAr: 'التوظيف واستقطاب الكفاءات',
      nameEn: 'Recruitment & ATS',
      icon: Users,
      accentColor: 'var(--erp-dept-ats)',
      clearanceRequired: 1
    }
  ];

  return (
    <aside
      className="glass-panel"
      style={{
        width: isSidebarCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
        minWidth: isSidebarCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
        height: 'calc(100vh - var(--header-height))',
        position: 'sticky',
        top: 'var(--header-height)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'width var(--erp-transition-normal), min-width var(--erp-transition-normal)',
        borderInlineEnd: '1px solid var(--erp-border-color)',
        padding: 'var(--erp-space-4)',
        zIndex: 30,
        overflowY: 'auto'
      }}
    >
      {/* Top Section: Brand & Nav Links */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--erp-space-4)' }}>
        {/* Brand Label */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--erp-space-3)',
          padding: '6px 8px',
          borderRadius: 'var(--erp-radius-md)',
          background: 'var(--erp-brand-primary-subtle)',
          color: 'var(--erp-brand-primary)'
        }}>
          <Layers size={22} />
          {!isSidebarCollapsed && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '13.5px', fontWeight: 800, letterSpacing: '-0.3px' }}>
                ENTERPRISE ERP
              </span>
              <span style={{ fontSize: '10px', color: 'var(--erp-text-dim)', fontWeight: 600 }}>
                {language === 'ar' ? 'البوابة الموحدة v1.0' : 'Unified Host Shell v1.0'}
              </span>
            </div>
          )}
        </div>

        {/* Section Title */}
        {!isSidebarCollapsed && (
          <div style={{
            fontSize: '11px',
            fontWeight: 800,
            textTransform: 'uppercase',
            color: 'var(--erp-text-dim)',
            paddingInline: '8px',
            marginTop: '8px'
          }}>
            {language === 'ar' ? 'الموديولات المؤسسية' : 'Enterprise Modules'}
          </div>
        )}

        {/* Navigation List */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveModule(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
                  padding: isSidebarCollapsed ? '12px 0' : '10px 14px',
                  borderRadius: 'var(--erp-radius-lg)',
                  border: isActive ? `1px solid ${item.accentColor}` : '1px solid transparent',
                  background: isActive ? 'var(--erp-bg-surface-hover)' : 'transparent',
                  color: isActive ? 'var(--erp-text-main)' : 'var(--erp-text-muted)',
                  cursor: 'pointer',
                  transition: 'all var(--erp-transition-fast)',
                  position: 'relative'
                }}
                title={language === 'ar' ? item.nameAr : item.nameEn}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--erp-space-3)' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--erp-radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isActive ? `${item.accentColor}25` : 'var(--erp-bg-subtle)',
                    color: isActive ? item.accentColor : 'var(--erp-text-muted)'
                  }}>
                    <Icon size={18} />
                  </div>
                  {!isSidebarCollapsed && (
                    <span style={{ 
                      fontSize: '13.5px', 
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? 'var(--erp-text-main)' : 'var(--erp-text-muted)'
                    }}>
                      {language === 'ar' ? item.nameAr : item.nameEn}
                    </span>
                  )}
                </div>

                {!isSidebarCollapsed && item.badgeAr && (
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    padding: '2px 6px',
                    borderRadius: 'var(--erp-radius-sm)',
                    background: `${item.accentColor}20`,
                    color: item.accentColor,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px'
                  }}>
                    <Sparkles size={10} />
                    {language === 'ar' ? item.badgeAr : item.badgeEn}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer: Edge Architecture status */}
      {!isSidebarCollapsed && (
        <div style={{
          padding: '12px',
          borderRadius: 'var(--erp-radius-lg)',
          background: 'var(--erp-bg-subtle)',
          border: '1px solid var(--erp-border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', color: 'var(--erp-text-dim)', fontWeight: 600 }}>
              Cloudflare D1 + Drive v3
            </span>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--erp-status-success)'
            }} />
          </div>
          <span style={{ fontSize: '11px', color: 'var(--erp-text-main)', fontWeight: 600 }}>
            {language === 'ar' ? 'العزل المشدد: مفعل' : 'Strict Isolation: Active'}
          </span>
        </div>
      )}
    </aside>
  );
};
