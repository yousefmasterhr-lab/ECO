import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
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
import { LuxuryLoginPage } from './components/auth/LuxuryLoginPage';

const AuthenticatedApp: React.FC = () => {
  return (
    <TenantProvider>
      <DatabaseProvider>
        <NavigationProvider>
          <FinancialProvider>
            <ContractorProvider>
              <ReceptionProvider>
                <HRProvider>
                  <ShellLayout />
                </HRProvider>
              </ReceptionProvider>
            </ContractorProvider>
          </FinancialProvider>
        </NavigationProvider>
      </DatabaseProvider>
    </TenantProvider>
  );
};

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading, currentPath } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#080E0A] text-[#F3EFE6]">
        <div className="flex flex-col items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl border-2 border-amber-500 border-t-transparent animate-spin" />
          <span className="text-xs font-bold text-amber-400 tracking-wider font-mono">
            ECO ENTERPRISE SECURITY GATEWAY...
          </span>
        </div>
      </div>
    );
  }

  // If user is not authenticated or explicitly navigates to /login
  if (!isAuthenticated || currentPath === '/login') {
    return <LuxuryLoginPage />;
  }

  return <AuthenticatedApp />;
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <PWAProvider>
            <ToastProvider>
              <AppContent />
            </ToastProvider>
          </PWAProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
