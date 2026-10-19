import React, { useState, useEffect } from 'react';
import { X, Send, CheckCircle2, ShieldAlert, FileText, UserCheck, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { facilitatorService } from '../services/facilitatorService';
import { Jurisdiction } from '../types';

export const ExpertEscalationModal: React.FC = () => {
  const { isEscalationOpen, setIsEscalationOpen, escalationDefaultQuery, jurisdiction, user, showNotification } = useApp();

  const [innovationName, setInnovationName] = useState('Triphala Novel Synergistic Extract');
  const [subject, setSubject] = useState('Section 3(p) & NBA Form III Review Request');
  const [selectedJuris, setSelectedJuris] = useState<Jurisdiction>(jurisdiction);
  const [query, setQuery] = useState('');
  const [contactEmail, setContactEmail] = useState(user?.email || 'innovator@ayushbiotech.in');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<{ ref: string; timestamp: string } | null>(null);

  useEffect(() => {
    if (escalationDefaultQuery) {
      setQuery(escalationDefaultQuery);
    }
    setSelectedJuris(jurisdiction);
  }, [escalationDefaultQuery, jurisdiction, isEscalationOpen]);

  if (!isEscalationOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await facilitatorService.submitRequest({
        innovationName,
        subject,
        jurisdiction: selectedJuris,
        query,
        contactEmail
      });
      setSubmissionSuccess({
        ref: res.referenceNumber,
        timestamp: res.submittedAt
      });
      showNotification(`Facilitator review requested! Reference: ${res.referenceNumber}`);
    } catch {
      showNotification('Error submitting request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsEscalationOpen(false);
    setSubmissionSuccess(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 to-emerald-950 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">
                Human-in-the-Loop Escalation
              </span>
              <h3 className="font-heading font-bold text-sm text-white">
                Request Ayush IP Facilitator Review
              </h3>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {submissionSuccess ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-lg text-slate-900">Review Request Submitted</h4>
              <p className="text-xs text-slate-600 max-w-md mx-auto mt-1">
                Your dossier has been routed to an empanelled Ministry of Ayush IP Facilitator / Patent Attorney.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl max-w-md mx-auto space-y-2 text-left text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Reference:</span>
                <span className="font-bold text-emerald-800">{submissionSuccess.ref}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">Pending Review</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Target Response:</span>
                <span className="text-slate-700">Within 2 business days</span>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow transition-colors"
            >
              Back to Assistant
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Smart Escalation is used when automated RAG identifies statutory ambiguity or insufficient authoritative evidence.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Innovation / Formulation Name
                </label>
                <input
                  type="text"
                  required
                  value={innovationName}
                  onChange={e => setInnovationName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jurisdiction
                </label>
                <select
                  value={selectedJuris}
                  onChange={e => setSelectedJuris(e.target.value as Jurisdiction)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="India">India (Patents Act &amp; BDA)</option>
                  <option value="USA">USA (FDA &amp; USPTO)</option>
                  <option value="EU">EU (EMA &amp; THMPD)</option>
                  <option value="Japan">Japan (PMDA &amp; Kampo)</option>
                  <option value="International">Global (WIPO GRATK)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Subject / Core Challenge
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Specific Legal / Regulatory Query
              </label>
              <textarea
                required
                rows={3}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Describe your formulation, bioassay questions, or why human expert guidance is required..."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Innovator Contact Email
              </label>
              <input
                type="email"
                required
                value={contactEmail}
                onChange={e => setContactEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Submitting...' : 'Submit Review Request'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
