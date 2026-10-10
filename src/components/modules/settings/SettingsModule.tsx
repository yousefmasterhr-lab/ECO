import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { RBACView } from './RBACView';
import { UserManagementView } from './UserManagementView';
import { AuditLogsView } from './AuditLogsView';
import { DatabaseFederationHub } from './DatabaseFederationHub';
import {
  ShieldCheck,
  Users,
  ScrollText,
  Database
} from 'lucide-react';

interface SettingsModuleProps {
  activeSubItemId: string | null;
}

export const SettingsModule: React.FC<SettingsModuleProps> = ({ activeSubItemId }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'rbac' | 'users' | 'audit' | 'system'>(() => {
    if (activeSubItemId === 'set_users') return 'users';
    if (activeSubItemId === 'set_audit') return 'audit';
    if (activeSubItemId === 'set_integrations' || activeSubItemId === 'set_databases') return 'system';
    return 'rbac';
  });

  useEffect(() => {
    if (activeSubItemId === 'set_users') {
      setActiveTab('users');
    } else if (activeSubItemId === 'set_audit') {
      setActiveTab('audit');
    } else if (activeSubItemId === 'set_integrations' || activeSubItemId === 'set_databases') {
      setActiveTab('system');
    } else if (activeSubItemId === 'set_rbac') {
      setActiveTab('rbac');
    }
  }, [activeSubItemId]);

  return (
    <div className="w-full space-y-5 animate-in fade-in duration-200">
      {/* Sub Tabs Bar for RBAC / User Accounts / Audit Logs / Database Hub */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[#E0D9CB]/60 dark:border-[#243628]/60">
        <button
          onClick={() => setActiveTab('rbac')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'rbac'
              ? 'bg-[#1C291E] dark:bg-[#EBB34D] text-[#F3EFE6] dark:text-[#0E1610] shadow-xs'
              : 'bg-[#F3EFE6] dark:bg-[#17231A] text-[#5C665E] dark:text-[#8FA392] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23] border border-[#E0D9CB] dark:border-[#243628]'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{t('مصفوفة الصلاحيات (RBAC)', 'Permissions Matrix')}</span>
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
          <span>{t('إدارة المستخدمين', 'User Management')}</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'audit'
              ? 'bg-[#1C291E] dark:bg-[#EBB34D] text-[#F3EFE6] dark:text-[#0E1610] shadow-xs'
              : 'bg-[#F3EFE6] dark:bg-[#17231A] text-[#5C665E] dark:text-[#8FA392] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23] border border-[#E0D9CB] dark:border-[#243628]'
          }`}
        >
          <ScrollText className="w-3.5 h-3.5" />
          <span>{t('سجل العمليات', 'Audit Log')}</span>
        </button>

        <button
          onClick={() => setActiveTab('system')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'system'
              ? 'bg-[#1C291E] dark:bg-[#EBB34D] text-[#F3EFE6] dark:text-[#0E1610] shadow-xs'
              : 'bg-[#F3EFE6] dark:bg-[#17231A] text-[#5C665E] dark:text-[#8FA392] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23] border border-[#E0D9CB] dark:border-[#243628]'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>{t('ربط وتكامل قواعد البيانات', 'Database Federation')}</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'rbac' && <RBACView />}
      {activeTab === 'users' && <UserManagementView />}
      {activeTab === 'audit' && <AuditLogsView />}
      {activeTab === 'system' && <DatabaseFederationHub />}
    </div>
  );
};

