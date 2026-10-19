import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  BookOpen,
  Search,
  Lock,
  Tag,
  FileText,
  ChevronRight,
  Info
} from 'lucide-react';
import { IPAdvisorInput, IPAdvisorResult } from '../types';
import { ipAdvisorService } from '../services/ipAdvisorService';
import { DEMO_IP_ANALYSIS } from '../data/demoData';
import { ConfidenceBadge } from '../components/ConfidenceBadge';
import { useApp } from '../context/AppContext';

export const IPProtectionAdvisorPage: React.FC = () => {
  const { setSelectedSource, showNotification } = useApp();

  const [step, setStep] = useState<number>(1);
  const [input, setInput] = useState<IPAdvisorInput>({
    innovationName: 'Bio-Enhanced Triphala Phytosome Matrix',
    description: 'A novel phospholipid-complexed extract of Emblica officinalis, Terminalia chebula, and Terminalia bellirica formulated for 3x bio-availability and targeted gut delivery.',
    novelFeature: 'Specific stoichiometric ratio (1:1:1:0.15 with piperine bio-enhancer) combined with super-critical fluid fractioning at <35°C to preserve heat-sensitive tannins.',
    category: 'Composition',
    jurisdiction: 'India'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<IPAdvisorResult | null>(DEMO_IP_ANALYSIS);

  const handleRunAnalysis = async () => {
    setIsLoading(true);
    try {
      const res = await ipAdvisorService.analyzeIP(input);
      setResult(res);
      setStep(3);
      showNotification('IP protection roadmap & similarity analysis generated');
    } catch {
      showNotification('Error processing IP analysis');
    } finally {
      setIsLoading(false);
    }
  };

  const getRouteIcon = (route: string) => {
    if (route.includes('Patent')) return ShieldCheck;
    if (route.includes('Trademark')) return Tag;
    if (route.includes('Secret')) return Lock;
    return BookOpen;
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-900 border border-blue-300">
            3-Step IP Wizard
          </span>
          <span className="text-xs text-slate-500">Patents Act 1970, TM Act 1999 &amp; BDA 2023</span>
        </div>
        <h1 className="font-heading font-bold text-2xl text-slate-900 mt-1">
          IP Protection Advisor &amp; Prior Art Similarity
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Guided evaluation of patentability, trademark protection, trade secrets, and TKDL prior art similarity scoring.
        </p>
      </div>

      {/* Step Progress Bar */}
      <div className="grid grid-cols-3 gap-3 p-3 bg-white border border-slate-200 rounded-2xl shadow-sm text-xs font-semibold">
        <button
          onClick={() => setStep(1)}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-colors ${
            step === 1 ? 'bg-emerald-50 text-emerald-900 border border-emerald-300' : 'text-slate-500'
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px]">1</span>
          <span>Describe Innovation</span>
        </button>

        <button
          onClick={() => setStep(2)}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-colors ${
            step === 2 ? 'bg-emerald-50 text-emerald-900 border border-emerald-300' : 'text-slate-500'
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px]">2</span>
          <span>What is Novel?</span>
        </button>

        <button
          onClick={() => setStep(3)}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-colors ${
            step === 3 ? 'bg-emerald-50 text-emerald-900 border border-emerald-300' : 'text-slate-500'
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px]">3</span>
          <span>IP Routes &amp; Prior Art</span>
        </button>
      </div>

      {/* Step 1: Describe Innovation */}
      {step === 1 && (
        <div className="gov-card p-6 space-y-4 max-w-3xl animate-fade-in">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <FileText className="w-5 h-5 text-emerald-700" />
            <h3 className="font-heading font-bold text-sm text-slate-900">
              Step 1: Innovation Basics &amp; Formulation Scope
            </h3>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Innovation / Formulation Name
            </label>
            <input
              type="text"
              value={input.innovationName}
              onChange={e => setInput({ ...input, innovationName: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              General Description &amp; Traditional Context
            </label>
            <textarea
              rows={3}
              value={input.description}
              onChange={e => setInput({ ...input, description: e.target.value })}
              placeholder="Describe what herbs are used and therapeutic intent..."
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setStep(2)}
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl shadow transition-colors flex items-center gap-2"
            >
              <span>Next: Specify Novel Features</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: What is New? */}
      {step === 2 && (
        <div className="gov-card p-6 space-y-4 max-w-3xl animate-fade-in">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Sparkles className="w-5 h-5 text-amber-600" />
            <h3 className="font-heading font-bold text-sm text-slate-900">
              Step 2: Technical Novelty &amp; Category Claim
            </h3>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              What specific technical feature is novel or non-obvious?
            </label>
            <p className="text-[11px] text-slate-500 mb-1.5">
              (Crucial to overcome Section 3(p) Traditional Knowledge and Section 3(e) Mere Admixture bars)
            </p>
            <textarea
              rows={3}
              value={input.novelFeature}
              onChange={e => setInput({ ...input, novelFeature: e.target.value })}
              placeholder="e.g. Synergistic bioassay ratio, supercritical extraction method, nano-liposome vehicle..."
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Primary Protection Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {(['Composition', 'Process', 'Formulation', 'Brand', 'Traditional Knowledge', 'Other'] as const).map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setInput({ ...input, category: cat })}
                  className={`p-2.5 rounded-xl border text-left font-medium transition-all ${
                    input.category === cat
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-3">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Back
            </button>
            <button
              onClick={handleRunAnalysis}
              disabled={isLoading}
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow transition-colors flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{isLoading ? 'Scanning Prior Art...' : 'Generate IP Roadmap & Similarity'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Results (Routes & Similarity) */}
      {step === 3 && result && (
        <div className="space-y-6 animate-fade-in">
          {/* Executive Strategy Banner */}
          <div className="p-4 bg-gradient-to-r from-slate-900 to-emerald-950 text-white rounded-2xl shadow-md border border-slate-800 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
                Recommended Strategic Approach
              </span>
              <h3 className="font-heading font-bold text-base text-white">
                Dual-Track Strategy: Process Patent + Brand Trademark
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                {result.overallGuidance}
              </p>
            </div>
            <ConfidenceBadge confidence={result.confidence} />
          </div>

          {/* Potential IP Routes Grid */}
          <div className="space-y-3">
            <h3 className="font-heading font-bold text-base text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
              <span>Potential IP Protection Routes</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.routes.map((route, idx) => {
                const Icon = getRouteIcon(route.route);
                return (
                  <div
                    key={idx}
                    className="gov-card p-5 space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-200">
                            <Icon className="w-4 h-4" />
                          </div>
                          <h4 className="font-heading font-bold text-sm text-slate-900">
                            {route.route}
                          </h4>
                        </div>
                        <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          {route.applicableLaw}
                        </span>
                      </div>

                      {/* Why relevant */}
                      <div>
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                          Why Relevant:
                        </span>
                        <p className="text-xs text-slate-700 leading-relaxed mt-0.5">
                          {route.relevance}
                        </p>
                      </div>

                      {/* Potential concern */}
                      <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-950">
                        <span className="font-semibold block text-[11px] text-amber-900 uppercase">
                          Statutory Caution / Bar:
                        </span>
                        <p className="leading-relaxed mt-0.5">{route.potentialConcern}</p>
                      </div>
                    </div>

                    {/* Recommended Next Step */}
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-[11px] font-bold text-emerald-900 block">
                        Recommended Next Step:
                      </span>
                      <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">
                        {route.recommendedNextStep}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Prior Art / Similarity Breakdown */}
          <div className="gov-card p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-emerald-700" />
                <div>
                  <h3 className="font-heading font-bold text-base text-slate-900">
                    Prior Art &amp; Knowledge Base Similarity Screening
                  </h3>
                  <p className="text-xs text-slate-500">
                    Cross-referenced against TKDL, Indian Patent Office Journals, and USPTO/WIPO databases.
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 self-start sm:self-auto">
                3 Potential Precedents Located
              </span>
            </div>

            <div className="space-y-3">
              {result.priorArtSimilarities.map(pa => (
                <div
                  key={pa.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2 hover:border-slate-300 transition-all"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 font-mono">
                        {pa.document}
                      </span>
                      <span className="text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 font-medium">
                        {pa.source}
                      </span>
                    </div>

                    {/* Similarity Indicator */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-700">Similarity:</span>
                      <span
                        className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                          pa.similarityPercentage >= 80
                            ? 'bg-red-100 text-red-900 border border-red-300'
                            : pa.similarityPercentage >= 70
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        }`}
                      >
                        {pa.similarityPercentage}%
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed">
                    <strong>Topic:</strong> {pa.relevantTopic}
                  </p>

                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
                    <Info className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">
                      <strong>AI Analysis:</strong> {pa.similarityNotes}
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-400 font-mono">
                    Citation Context: {pa.publicationDate}
                  </div>
                </div>
              ))}
            </div>

            {/* Crucial AI Safety statement */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Important Legal Caution:</strong> Potential similarity detected — further professional review recommended. This tool flags potential citations for patent attorneys and does not make definitive invalidity or rejection determinations.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
