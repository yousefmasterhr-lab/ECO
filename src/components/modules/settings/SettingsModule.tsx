import React, { useState, useEffect } from 'react';
import { RBACView } from './RBACView';
import { UserManagementView } from './UserManagementView';
import { ConfigurationView } from './ConfigurationView';
import { AuditLogsView } from './AuditLogsView';
import { DatabaseFederationHub } from './DatabaseFederationHub';
import { CloudUpgradesView } from './CloudUpgradesView';

interface SettingsModuleProps {
  activeSubItemId: string | null;
}

export const SettingsModule: React.FC<SettingsModuleProps> = ({ activeSubItemId }) => {
  const [overrideTab, setOverrideTab] = useState<'rbac' | null>(null);

  // Listen to cross-module trigger to open RBAC matrix for a specific user
  useEffect(() => {
    const handleOpenRbac = () => {
      setOverrideTab('rbac');
    };
    window.addEventListener('eco-open-rbac', handleOpenRbac as any);
    return () => window.removeEventListener('eco-open-rbac', handleOpenRbac as any);
  }, []);

  // Reset override whenever user explicitly navigates to another sub-item
  useEffect(() => {
    setOverrideTab(null);
  }, [activeSubItemId]);

  const activeTab = (() => {
    if (overrideTab) return overrideTab;
    if (activeSubItemId === 'set_users') return 'users';
    if (activeSubItemId === 'set_configurations') return 'configurations';
    if (activeSubItemId === 'set_audit') return 'audit';
    if (activeSubItemId === 'set_integrations' || activeSubItemId === 'set_databases') return 'system';
    if (activeSubItemId === 'set_upgrades') return 'upgrades';
    return 'rbac';
  })();

  return (
    <div className="w-full animate-in fade-in duration-200">
      {/* Tab Content rendered directly according to sidebar navigation */}
      {activeTab === 'rbac' && <RBACView />}
      {activeTab === 'users' && <UserManagementView />}
      {activeTab === 'configurations' && <ConfigurationView />}
      {activeTab === 'audit' && <AuditLogsView />}
      {activeTab === 'system' && <DatabaseFederationHub />}
      {activeTab === 'upgrades' && <CloudUpgradesView />}
    </div>
  );
};

export default SettingsModule;


