import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useDatabase } from '../../services/federation/DatabaseContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNavigation } from '../../context/NavigationContext';
import { DatabaseCategory, DatabaseFleetItem } from '../../services/federation/types';
import {
  Database,
  ChevronDown,
  Activity,
  Archive,
  Users,
  HardHat,
  Building2,
  FlaskConical,
  Check,
  ExternalLink,
  Server
} from 'lucide-react';

interface CategoryGroup {
  id: DatabaseCategory;
  titleAr: string;
  titleEn: string;
  icon: React.ElementType;
  badgeAr: string;
  badgeEn: string;
}

const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    id: 'primary',
    titleAr: 'المنظومة المالية النشطة',
    titleEn: 'Active Financial System',
    icon: Activity,
    badgeAr: 'نشط 2026',
    badgeEn: 'Active 2026'
  },
  {
    id: 'archives',
    titleAr: 'السنوات المالية السابقة',
    titleEn: 'Prior Fiscal Archives',
    icon: Archive,
    badgeAr: 'أرشيف',
    badgeEn: 'Archive'
  },
  {
    id: 'specialized_payroll',
    titleAr: 'الرواتب والأجور والكادر',
    titleEn: 'Specialized Payroll',
    icon: Users,
    badgeAr: 'رواتب',
    badgeEn: 'Payroll'
  },
  {
    id: 'engineering_archive',
    titleAr: 'الأرشيف الهندسي والمشاريع',
    titleEn: 'Engineering Archive',
    icon: HardHat,
    badgeAr: 'مشاريع',
    badgeEn: 'Projects'
  },
  {
    id: 'partners',
    titleAr: 'شركات الشركاء والفروع',
    titleEn: 'Partners & Affiliates',
    icon: Building2,
    badgeAr: 'شركاء',
    badgeEn: 'Partners'
  },
  {
    id: 'sandbox',
    titleAr: 'بيئات الاختبار والمحاكاة',
    titleEn: 'Sandbox & Simulation',
    icon: FlaskConical,
    badgeAr: 'تجريبي',
    badgeEn: 'Sandbox'
  }
];

export const DatabaseSwitcher: React.FC = () => {
  const { isRtl, t } = useLanguage();
  const { selectItem } = useNavigation();
  const {
    activeDatabase,
    setActiveDatabase,
    activeDatabaseMeta,
    databases,
    health,
    activeMode
  } = useDatabase();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const groupedDatabases = useMemo(() => {
    const map = new Map<DatabaseCategory, DatabaseFleetItem[]>();
    for (const group of CATEGORY_GROUPS) {
      map.set(group.id, []);
    }
    for (const db of databases) {
      const list = map.get(db.category) || [];
      list.push(db);
      map.set(db.category, list);
    }
    return map;
  }, [databases]);

  const handleOpenHub = () => {
    setIsOpen(false);
    selectItem('settings', 'set_integrations');
  };

  const isRemote = activeMode === 'REMOTE';

  return (
    <div className="relative min-w-0" ref={dropdownRef}>
      {/* Trigger Button in Header */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23] text-start transition-all cursor-pointer group shadow-2xs"
        title={isRemote ? '🟢 متصل بالسيرفر (Tailscale)' : '🟡 متصل محلياً (وضع عدم الاتصال / طوارئ)'}
      >
        {/* Database Icon with Ambient Status Indicator */}
        <div className="relative w-6 h-6 rounded-lg bg-[#1F2E23] text-[#EBB34D] border border-[#243628] flex items-center justify-center shrink-0">
          <Database className="w-3.5 h-3.5" />
          <span
            className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ring-2 ring-[#17231A] ${
              isRemote
                ? 'bg-emerald-400 animate-pulse'
                : 'bg-amber-500'
            }`}
          />
        </div>

        {/* Database Name & Micro Metadata */}
        <div className="hidden md:flex flex-col min-w-0 leading-tight">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black text-[#1A241C] dark:text-[#F3EFE6] truncate max-w-[130px] lg:max-w-[160px]">
              {activeDatabase}
            </span>
            <span
              className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-md ${
                isRemote
                  ? 'bg-[#2A3F30] text-[#A3CFAC] border border-[#3E5C46]'
                  : 'bg-amber-950/40 text-amber-400 border border-amber-800/50'
              }`}
            >
              {isRemote ? `${health?.latencyMs || 24}ms` : t('محلي', 'Local')}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-[#5C665E] dark:text-[#8FA392]">
            <span className="truncate max-w-[110px]">
              {isRtl ? (activeDatabaseMeta?.categoryNameAr || t('المنظومة المالية', 'Financial System')) : (activeDatabaseMeta?.categoryNameEn || 'Financial System')}
            </span>
            <span className="text-[9px] font-semibold opacity-80">
              {isRemote ? '• 🟢 Tailscale' : '• 🟡 محلي (طوارئ)'}
            </span>
          </div>
        </div>

        {/* Full Status Badge for larger screens */}
        <div className="hidden 2xl:flex items-center ps-1">
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 ${
              isRemote
                ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/50'
                : 'bg-amber-950/40 text-amber-300 border border-amber-800/50'
            }`}
          >
            {isRemote ? '🟢 متصل بالسيرفر (Tailscale)' : '🟡 متصل محلياً (وضع عدم الاتصال / طوارئ)'}
          </span>
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 text-[#5C665E] dark:text-[#8FA392] shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Grouped Context Switcher Dropdown */}
      {isOpen && (
        <div
          className={`absolute top-full mt-2 w-80 sm:w-96 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6] shadow-2xl z-50 p-2 animate-in fade-in-50 zoom-in-95 duration-150 ${
            isRtl ? 'right-0 origin-top-right' : 'left-0 origin-top-left'
          }`}
        >
          {/* Top Status Header */}
          <div className="px-3 py-2.5 mb-1.5 rounded-xl border border-[#243628] bg-[#121B14] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-[#EBB34D]" />
              <div className="leading-tight">
                <span className="font-bold text-[#F3EFE6] block">
                  {isRemote ? 'Accounts-Server\\sqlexpress' : 'localhost\\SQLEXPRESS (طوارئ)'}
                </span>
                <span className="text-[10px] font-mono text-[#8FA392]">
                  {isRemote ? `${health?.host || '100.76.198.119'}:1433` : 'Local IPC / Named Pipes'}
                </span>
              </div>
            </div>

            <div className="text-end">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono text-[10px] font-bold ${
                  isRemote
                    ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40'
                    : 'bg-amber-950/40 text-amber-400 border border-amber-800/40'
                }`}
              >
                <span>{isRemote ? '🟢 متصل بالسيرفر (Tailscale)' : '🟡 متصل محلياً (وضع عدم الاتصال / طوارئ)'}</span>
              </span>
            </div>
          </div>

          {/* Categorized Databases Scrollable Area */}
          <div className="max-h-[360px] overflow-y-auto space-y-2.5 p-1 pr-1.5">
            {databases.length === 0 && (
              <div className="text-center py-6 px-3 space-y-1 text-xs text-[#8FA392]">
                <p className="font-bold text-[#F3EFE6]">{t('لا توجد قواعد بيانات مكتشفة', 'No Databases Found')}</p>
                <p className="text-[11px]">{t('افتح مركز التكامل لمزامنة القواعد الحية', 'Open Hub to sync live databases')}</p>
              </div>
            )}
            {CATEGORY_GROUPS.map(group => {
              const dbs = groupedDatabases.get(group.id) || [];
              if (dbs.length === 0) return null;

              const GroupIcon = group.icon;

              return (
                <div key={group.id} className="space-y-1">
                  <div className="flex items-center justify-between px-2 text-[11px] font-bold text-[#8FA392]">
                    <div className="flex items-center gap-1.5">
                      <GroupIcon className="w-3.5 h-3.5 text-[#EBB34D]" />
                      <span>{isRtl ? group.titleAr : group.titleEn}</span>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-[#1F2E23] text-[#8FA392]">
                      {dbs.length}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    {dbs.map(db => {
                      const isSelected = db.name === activeDatabase;

                      return (
                        <button
                          key={db.name}
                          type="button"
                          onClick={() => {
                            try {
                              localStorage.setItem('selected_database', db.name);
                            } catch {}
                            setActiveDatabase(db.name);
                            setIsOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-start transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#1F2E23] text-[#F3EFE6] border border-[#EBB34D]/60 shadow-xs'
                              : 'hover:bg-[#1F2E23]/50 text-[#8FA392] hover:text-[#F3EFE6] border border-transparent'
                          }`}
                        >
                          <div className="min-w-0 flex-1 pe-2">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-[#F3EFE6] truncate">
                                {db.name}
                              </span>
                              {db.isPrimary && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-sm bg-[#3D2D14] text-[#EBB34D] border border-[#5C431D]">
                                  {t('الرئيسية', 'Primary')}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-[#8FA392] truncate block mt-0.5">
                              {isRtl ? db.displayNameAr : db.displayNameEn}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 font-mono text-[10px]">
                            <span className="text-[#8FA392] tabular-nums">
                              {db.sizeMb} MB
                            </span>
                            {isSelected ? (
                              <Check className="w-4 h-4 text-[#EBB34D]" />
                            ) : (
                              <span className="w-4 h-4" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dropdown Footer: Shortcut to Full Federation Hub */}
          <div className="pt-2 mt-1.5 border-t border-[#E0D9CB] dark:border-[#243628] flex items-center justify-between px-2 text-xs">
            <span className="text-[11px] text-[#8FA392]">
              {databases.length} {t('قواعد بيانات مرتبطة', 'Federated Databases')}
            </span>

            <button
              type="button"
              onClick={handleOpenHub}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs bg-[#1F2E23] hover:bg-[#3D2D14] text-[#EBB34D] border border-[#243628] hover:border-[#EBB34D]/50 transition-colors cursor-pointer"
            >
              <span>{t('مركز إدارة وقواعد البيانات (Hub)', 'Open Federation Hub')}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
