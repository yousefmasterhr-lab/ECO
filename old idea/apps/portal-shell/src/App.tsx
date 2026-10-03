import React from 'react';
import { useApp } from './context/AppContext';
import { DashboardLayout } from './layouts/DashboardLayout';
import { ExecutiveModule } from './modules/executive/ExecutiveModule';
import { LegalModule } from './modules/legal/LegalModule';
import { EngineeringModule } from './modules/engineering/EngineeringModule';
import { CtsModule } from './modules/cts/CtsModule';
import { InsuranceModule } from './modules/insurance/InsuranceModule';
import { AtsModule } from './modules/ats/AtsModule';

export const App: React.FC = () => {
  const { activeModule } = useApp();

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'executive':
        return <ExecutiveModule />;
      case 'legal':
        return <LegalModule />;
      case 'engineering':
        return <EngineeringModule />;
      case 'cts':
        return <CtsModule />;
      case 'insurance':
        return <InsuranceModule />;
      case 'ats':
        return <AtsModule />;
      default:
        return <ExecutiveModule />;
    }
  };

  return (
    <DashboardLayout>
      {renderActiveModule()}
    </DashboardLayout>
  );
};
