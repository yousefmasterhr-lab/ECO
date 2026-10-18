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
import { AnimatePresence } from 'framer-motion';
import { ShellLayout } from './components/layout/ShellLayout';
import { LuxuryLoginPage } from './components/auth/LuxuryLoginPage';
import { CinematicWelcomeSplash } from './components/auth/CinematicWelcomeSplash';
import { CinematicUpdateOverlay } from './components/common/CinematicUpdateOverlay';

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
  const {
    isAuthenticated,
    isLoading,
    currentPath,
    user,
    showWelcomeSplash,
    completeWelcomeSplash,
    navigate,
  } = useAuth();

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

  // LOCK 1: Exclusive 3D Cinematic Welcome Splash Screen Gate
  // When active, render ONLY the full-screen 3D Welcome Splash.
  // Neither the login page nor the dashboard/ShellLayout exists in the DOM.
  if (showWelcomeSplash) {
    return (
      <AnimatePresence mode="wait">
        <CinematicWelcomeSplash
          key="welcome-splash"
          user={user}
          durationMs={4000}
          onComplete={() => {
            completeWelcomeSplash();
            navigate('/');
          }}
        />
      </AnimatePresence>
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
              <CinematicUpdateOverlay />
            </ToastProvider>
          </PWAProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
