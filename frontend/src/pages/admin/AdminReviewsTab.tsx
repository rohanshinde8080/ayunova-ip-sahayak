import React from 'react';
import { UserCheck, Clock, Mail } from 'lucide-react';
import { FacilitatorRequest } from '../../types';

interface AdminReviewsTabProps {
  reviews: FacilitatorRequest[];
}

export const AdminReviewsTab: React.FC<AdminReviewsTabProps> = ({ reviews }) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4 animate-fade-in text-slate-800">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-amber-600" />
          <h2 className="font-heading font-bold text-base text-slate-900">
            Human IP Facilitator Review Queue (Smart Escalation Log)
          </h2>
        </div>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-mono">
          {reviews.length} Active Dossiers
        </span>
      </div>

      <div className="space-y-3">
        {reviews.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs">
            No pending facilitator escalation reviews in the queue.
          </div>
        ) : (
          reviews.map(req => (
            <div
              key={req.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2 hover:border-slate-300 transition-all"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs font-mono text-emerald-700">
                    Ref #{req.referenceNumber}
                  </span>
                  <span className="font-bold text-xs text-slate-900">
                    {req.innovationName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium border border-slate-200">
                    {req.jurisdiction}
                  </span>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-amber-50 text-amber-800 border border-amber-300">
                    {req.status}
                  </span>
                </div>
              </div>

              <div className="text-xs font-semibold text-slate-700">
                Subject: {req.subject}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                {req.query}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/80 text-[11px] text-slate-500 font-mono">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {req.submittedAt ? new Date(req.submittedAt).toLocaleString() : 'Recent'}
                </span>
                <span className="flex items-center gap-1 font-sans">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {req.contactEmail}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
