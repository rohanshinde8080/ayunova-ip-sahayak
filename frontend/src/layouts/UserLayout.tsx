import React from 'react';
import { Outlet } from 'react-router-dom';
import { UserSidebar } from '../components/navigation/UserSidebar';
import { UserTopbar } from '../components/navigation/UserTopbar';
import { Disclaimer } from '../components/Disclaimer';
import { SourceDrawerModal } from '../components/SourceDrawerModal';
import { ExpertEscalationModal } from '../components/ExpertEscalationModal';

export const UserLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen user-mesh-bg font-sans antialiased text-slate-900 selection:bg-emerald-200 selection:text-emerald-950 relative">
      {/* Innovator Modern Navigation Sidebar */}
      <UserSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <UserTopbar />

        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto animate-fade-in">
          <Outlet />
        </main>

        <Disclaimer compact />
      </div>

      {/* Global Grounding and Escalation Modals */}
      <SourceDrawerModal />
      <ExpertEscalationModal />
    </div>
  );
};
