import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { SearchModal } from './SearchModal';
import { EmptyCanvas } from '../common/EmptyCanvas';
import { PWAInstallBanner } from '../common/PWAInstallBanner';

export const ShellLayout: React.FC = () => {
  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col dark bg-[#0E1610] text-[#F3EFE6] transition-colors duration-200">
      {/* Top Executive Navigation Bar (Fixed) */}
      <Header />

      {/* Fixed Body Container */}
      <div className="flex flex-1 overflow-hidden w-full relative">
        {/* Independent Vertical Collapsible Sidebar */}
        <Sidebar />

        {/* Independent Main Content Workspace Canvas */}
        <main className="flex-1 h-full overflow-y-auto w-full pt-6 sm:pt-8 pb-12 px-4 sm:px-6 lg:px-8 bg-canvas text-primary max-w-none pb-safe">
          <EmptyCanvas />
        </main>
      </div>

      {/* Global Command Palette / Search Modal (Ctrl + K) */}
      <SearchModal />

      {/* Unobtrusive PWA Installation Prompt Banner */}
      <PWAInstallBanner />
    </div>
  );
};
