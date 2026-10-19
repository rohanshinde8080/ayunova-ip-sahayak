import React from 'react';
import { Outlet, useSearchParams } from 'react-router-dom';
import { AdminSidebar } from '../components/navigation/AdminSidebar';
import { AdminTopbar } from '../components/navigation/AdminTopbar';

export const AdminLayout: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'corpus';

  const handleSelectTab = (tab: 'corpus' | 'ingest' | 'graph' | 'reindex' | 'audit' | 'reviews') => {
    setSearchParams({ tab });
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans antialiased text-slate-900 selection:bg-emerald-500/30 selection:text-emerald-900 relative">
      {/* Console Command Sidebar */}
      <AdminSidebar activeTab={currentTab} onSelectTab={handleSelectTab} />

      {/* Main Administrative Stage */}
      <div className="flex-1 flex flex-col min-w-0 bg-transparent">
        <AdminTopbar />

        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto animate-fade-in">
          <Outlet />
        </main>

        <footer className="py-4 px-6 border-t border-slate-200 bg-white/80 backdrop-blur-sm text-center text-xs text-slate-500 font-mono">
          IP SHAKTI SAHAYAK IPR &amp; Regulatory Command Console &bull; Ministry of Ayush &amp; AIIA &bull; SIH 2026 PS SIH26045
        </footer>
      </div>
    </div>
  );
};
