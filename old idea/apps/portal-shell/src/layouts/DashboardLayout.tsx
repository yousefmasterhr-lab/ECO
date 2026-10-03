import React from 'react';
import { Header } from '../components/common/Header';
import { Sidebar } from '../components/common/Sidebar';
import { DriveViewerModal } from '../components/common/DriveViewerModal';
import { ExpirationsDrawer } from '../components/common/ExpirationsDrawer';

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'var(--erp-bg-base)',
      color: 'var(--erp-text-main)'
    }}>
      {/* Top Header */}
      <Header />

      {/* Main Workspace Body */}
      <div style={{
        display: 'flex',
        flex: 1,
        position: 'relative'
      }}>
        {/* Departmental Sidebar */}
        <Sidebar />

        {/* Dynamic Module Content Viewport */}
        <main style={{
          flex: 1,
          padding: 'var(--erp-space-6)',
          overflowY: 'auto',
          maxWidth: '100%'
        }}>
          {children}
        </main>
      </div>

      {/* Embedded Google Drive Preview Modal */}
      <DriveViewerModal />

      {/* Smart Expirations Alerts Drawer */}
      <ExpirationsDrawer />
    </div>
  );
};
