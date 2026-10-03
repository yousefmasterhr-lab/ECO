import React from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { TenantProvider } from './context/TenantContext';
import { DatabaseProvider } from './services/federation/DatabaseContext';
import { NavigationProvider } from './context/NavigationContext';
import { FinancialProvider } from './context/FinancialContext';
import { ContractorProvider } from './context/ContractorContext';
import { ReceptionProvider } from './context/ReceptionContext';
import { HRProvider } from './context/HRContext';
import { PWAProvider } from './context/PWAContext';
import { ToastProvider } from './components/common/Toast';
import { ShellLayout } from './components/layout/ShellLayout';

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <TenantProvider>
        <DatabaseProvider>
          <NavigationProvider>
            <FinancialProvider>
              <ContractorProvider>
                <ReceptionProvider>
                  <HRProvider>
                    <PWAProvider>
                      <ToastProvider>
                        <ShellLayout />
                      </ToastProvider>
                    </PWAProvider>
                  </HRProvider>
                </ReceptionProvider>
              </ContractorProvider>
            </FinancialProvider>
          </NavigationProvider>
        </DatabaseProvider>
      </TenantProvider>
    </LanguageProvider>
  );
};

export default App;
