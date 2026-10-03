import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useDatabase } from '../../../services/federation/DatabaseContext';
import { FinancialRbacMatrix } from './FinancialRbacMatrix';
import { DatabaseFederationHub } from './DatabaseFederationHub';
import {
  ShieldCheck,
  Users
} from 'lucide-react';

interface SettingsModuleProps {
  activeSubItemId: string | null;
}

export const SettingsModule: React.FC<SettingsModuleProps> = ({ activeSubItemId }) => {
  const { t } = useLanguage();
  const { activeDatabase } = useDatabase();
  const [activeTab, setActiveTab] = useState<'rbac_finance' | 'users' | 'system'>(() => {
    if (activeSubItemId === 'set_users') return 'users';
    if (activeSubItemId === 'set_integrations' || activeSubItemId === 'set_databases') return 'system';
    return 'rbac_finance';
  });

  useEffect(() => {
    if (activeSubItemId === 'set_users') {
      setActiveTab('users');
    } else if (activeSubItemId === 'set_integrations' || activeSubItemId === 'set_databases') {
      setActiveTab('system');
    }
  }, [activeSubItemId]);

  // If directly opened to Database Federation Hub, do not render duplicate top tab strip
  if (activeTab === 'system') {
    return (
      <div className="w-full space-y-4 animate-in fade-in duration-200">
        <DatabaseFederationHub />
      </div>
    );
  }

  return (
    <div className="w-full space-y-5 animate-in fade-in duration-200">
      {/* Sub Tabs Bar for RBAC / User Accounts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[#E0D9CB]/60 dark:border-[#243628]/60">
        <button
          onClick={() => setActiveTab('rbac_finance')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'rbac_finance'
              ? 'bg-[#1C291E] dark:bg-[#EBB34D] text-[#F3EFE6] dark:text-[#0E1610] shadow-xs'
              : 'bg-[#F3EFE6] dark:bg-[#17231A] text-[#5C665E] dark:text-[#8FA392] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23] border border-[#E0D9CB] dark:border-[#243628]'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{t('صلاحيات الإدارة المالية (RBAC)', 'Financial RBAC Matrix')}</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'users'
              ? 'bg-[#1C291E] dark:bg-[#EBB34D] text-[#F3EFE6] dark:text-[#0E1610] shadow-xs'
              : 'bg-[#F3EFE6] dark:bg-[#17231A] text-[#5C665E] dark:text-[#8FA392] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23] border border-[#E0D9CB] dark:border-[#243628]'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>{t('إدارة المستخدمين', 'User Accounts')}</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'rbac_finance' ? (
        <FinancialRbacMatrix />
      ) : (
        <div className="p-8 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#141E16] text-center space-y-2">
          <Users className="w-8 h-8 text-[#D99B26] dark:text-[#EBB34D] mx-auto" />
          <h3 className="text-sm font-bold text-[#1A241C] dark:text-[#F3EFE6]">
            {t('إدارة حسابات المستخدمين النشطة', 'User Management')}
          </h3>
          <p className="text-xs text-[#5C665E] dark:text-[#8FA392] max-w-md mx-auto">
            {t(
              `مرتبطة بجدول dbo.Users في قاعدة ${activeDatabase}. يتم تعيين الأدوار المالية لكل مستخدم عبر مصفوفة الصلاحيات.`,
              `Linked to dbo.Users in ${activeDatabase}. Financial roles are governed via the RBAC Matrix.`
            )}
          </p>
        </div>
      )}
    </div>
  );
};
