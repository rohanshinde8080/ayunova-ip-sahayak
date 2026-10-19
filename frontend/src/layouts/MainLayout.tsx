import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';
import { Disclaimer } from '../components/Disclaimer';
import { SourceDrawerModal } from '../components/SourceDrawerModal';
import { ExpertEscalationModal } from '../components/ExpertEscalationModal';

export const MainLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />

        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        <Disclaimer compact />
      </div>

      {/* Global Modals */}
      <SourceDrawerModal />
      <ExpertEscalationModal />
    </div>
  );
};
