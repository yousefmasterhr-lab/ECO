import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { RBACView } from './RBACView';
import { UserManagementView } from './UserManagementView';
import { ConfigurationView } from './ConfigurationView';
import { AuditLogsView } from './AuditLogsView';
import { DatabaseFederationHub } from './DatabaseFederationHub';
import { CloudUpgradesView } from './CloudUpgradesView';
import {
  ShieldCheck,
  Users,
  Sliders,
  ScrollText,
  Database,
  CloudUpload
} from 'lucide-react';

interface SettingsModuleProps {
  activeSubItemId: string | null;
}

export const SettingsModule: React.FC<SettingsModuleProps> = ({ activeSubItemId }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'rbac' | 'users' | 'configurations' | 'audit' | 'system' | 'upgrades'>(() => {
    if (activeSubItemId === 'set_users') return 'users';
    if (activeSubItemId === 'set_configurations') return 'configurations';
    if (activeSubItemId === 'set_audit') return 'audit';
    if (activeSubItemId === 'set_integrations' || activeSubItemId === 'set_databases') return 'system';
    if (activeSubItemId === 'set_upgrades') return 'upgrades';
    return 'rbac';
  });

  useEffect(() => {
    if (activeSubItemId === 'set_users') {
      setActiveTab('users');
    } else if (activeSubItemId === 'set_configurations') {
      setActiveTab('configurations');
    } else if (activeSubItemId === 'set_audit') {
      setActiveTab('audit');
    } else if (activeSubItemId === 'set_integrations' || activeSubItemId === 'set_databases') {
      setActiveTab('system');
    } else if (activeSubItemId === 'set_rbac') {
      setActiveTab('rbac');
    }
  }, [activeSubItemId]);

  // Listen to cross-module trigger to open RBAC matrix for a specific user
  useEffect(() => {
    const handleOpenRbac = () => {
      setActiveTab('rbac');
    };
    window.addEventListener('eco-open-rbac', handleOpenRbac as any);
    return () => window.removeEventListener('eco-open-rbac', handleOpenRbac as any);
  }, []);

  return (
    <div className="w-full space-y-5 animate-in fade-in duration-200">
      {/* Sub Tabs Bar for RBAC / User Accounts / Dynamic Config / Audit Logs / Database Hub */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200/80 dark:border-[#243628]/60">
        <button
          onClick={() => setActiveTab('rbac')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'rbac'
              ? 'bg-gradient-to-l from-amber-600 to-amber-500 text-white shadow-md shadow-amber-500/20 border-transparent font-bold dark:from-amber-500 dark:to-amber-600 dark:text-slate-950'
              : 'bg-white text-slate-700 border border-slate-200/80 hover:bg-amber-50/60 hover:text-amber-800 hover:border-amber-300 dark:bg-[#17231A] dark:text-[#8FA392] dark:border-[#243628] dark:hover:bg-[#1F2E23]'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{t('مصفوفة الصلاحيات (RBAC)', 'Permissions Matrix')}</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'users'
              ? 'bg-gradient-to-l from-amber-600 to-amber-500 text-white shadow-md shadow-amber-500/20 border-transparent font-bold dark:from-amber-500 dark:to-amber-600 dark:text-slate-950'
              : 'bg-white text-slate-700 border border-slate-200/80 hover:bg-amber-50/60 hover:text-amber-800 hover:border-amber-300 dark:bg-[#17231A] dark:text-[#8FA392] dark:border-[#243628] dark:hover:bg-[#1F2E23]'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>{t('إدارة المستخدمين', 'User Management')}</span>
        </button>

        <button
          onClick={() => setActiveTab('configurations')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'configurations'
              ? 'bg-gradient-to-l from-amber-600 to-amber-500 text-white shadow-md shadow-amber-500/20 border-transparent font-bold dark:from-amber-500 dark:to-amber-600 dark:text-slate-950'
              : 'bg-white text-slate-700 border border-slate-200/80 hover:bg-amber-50/60 hover:text-amber-800 hover:border-amber-300 dark:bg-[#17231A] dark:text-[#8FA392] dark:border-[#243628] dark:hover:bg-[#1F2E23]'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-amber-500" />
          <span>{t('التعريفات والقوائم المرنة', 'Configurations')}</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'audit'
              ? 'bg-gradient-to-l from-amber-600 to-amber-500 text-white shadow-md shadow-amber-500/20 border-transparent font-bold dark:from-amber-500 dark:to-amber-600 dark:text-slate-950'
              : 'bg-white text-slate-700 border border-slate-200/80 hover:bg-amber-50/60 hover:text-amber-800 hover:border-amber-300 dark:bg-[#17231A] dark:text-[#8FA392] dark:border-[#243628] dark:hover:bg-[#1F2E23]'
          }`}
        >
          <ScrollText className="w-3.5 h-3.5" />
          <span>{t('سجل العمليات', 'Audit Log')}</span>
        </button>

        <button
          onClick={() => setActiveTab('system')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'system'
              ? 'bg-gradient-to-l from-amber-600 to-amber-500 text-white shadow-md shadow-amber-500/20 border-transparent font-bold dark:from-amber-500 dark:to-amber-600 dark:text-slate-950'
              : 'bg-white text-slate-700 border border-slate-200/80 hover:bg-amber-50/60 hover:text-amber-800 hover:border-amber-300 dark:bg-[#17231A] dark:text-[#8FA392] dark:border-[#243628] dark:hover:bg-[#1F2E23]'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>{t('ربط وتكامل قواعد البيانات', 'Database Federation')}</span>
        </button>

        <button
          onClick={() => setActiveTab('upgrades')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'upgrades'
              ? 'bg-gradient-to-l from-amber-600 to-amber-500 text-white shadow-md shadow-amber-500/20 border-transparent font-bold dark:from-amber-500 dark:to-amber-600 dark:text-slate-950'
              : 'bg-white text-slate-700 border border-slate-200/80 hover:bg-amber-50/60 hover:text-amber-800 hover:border-amber-300 dark:bg-[#17231A] dark:text-[#8FA392] dark:border-[#243628] dark:hover:bg-[#1F2E23]'
          }`}
        >
          <CloudUpload className="w-3.5 h-3.5 text-emerald-400" />
          <span>{t('الترقيات والصيانة السحابية', 'Cloud Upgrades & Maintenance')}</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'rbac' && <RBACView />}
      {activeTab === 'users' && <UserManagementView />}
      {activeTab === 'configurations' && <ConfigurationView />}
      {activeTab === 'audit' && <AuditLogsView />}
      {activeTab === 'system' && <DatabaseFederationHub />}
      {activeTab === 'upgrades' && <CloudUpgradesView />}
    </div>
  );
};

