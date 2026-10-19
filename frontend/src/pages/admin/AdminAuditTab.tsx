import React from 'react';
import { Activity, Download } from 'lucide-react';
import { AuditLogEntry } from '../../types';

interface AdminAuditTabProps {
  auditLogs: AuditLogEntry[];
}

export const AdminAuditTab: React.FC<AdminAuditTabProps> = ({ auditLogs }) => {
  const handleExportAuditLogs = () => {
    const jsonStr = JSON.stringify(auditLogs, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ip_shakti_sahayak_audit_logs_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4 animate-fade-in text-slate-800">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-600" />
          <h2 className="font-heading font-bold text-base text-slate-900">
            Administrative Governance &amp; Data Ingestion Audit Trail
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-mono">
            {auditLogs.length} Total Audit Events
          </span>
          <button
            onClick={handleExportAuditLogs}
            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs rounded-xl font-medium flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-emerald-700" />
            <span>Export Log</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px] font-mono">
              <th className="pb-3">Event ID</th>
              <th className="pb-3">Action</th>
              <th className="pb-3">Target</th>
              <th className="pb-3">Admin Email</th>
              <th className="pb-3">Timestamp</th>
              <th className="pb-3">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {auditLogs.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  No governance audit log entries recorded yet.
                </td>
              </tr>
            ) : (
              auditLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 pr-4 font-mono text-[11px] text-slate-500">
                    #{log.id}
                  </td>
                  <td className="py-3 pr-4 font-semibold text-emerald-800">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-slate-900 font-medium">
                    {log.targetId || log.targetType}
                  </td>
                  <td className="py-3 pr-4 text-slate-600 font-mono text-[11px]">
                    {log.adminEmail}
                  </td>
                  <td className="py-3 pr-4 text-slate-500 font-mono text-[11px]">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3 text-slate-600">
                    <span className="font-mono text-[11px] bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                      {JSON.stringify(log.details)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
