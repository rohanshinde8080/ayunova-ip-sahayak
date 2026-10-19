import React, { useState } from 'react';
import {
  Leaf,
  ShieldCheck,
  Scale,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Calculator,
  Info,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DEMO_SOURCES } from '../data/demoData';

interface HerbData {
  id: string;
  name: string;
  botanical: string;
  isNTACExempt: boolean; // Section 40 NTAC list
  partsUsed: string;
  classicalTexts: string[];
  tkdlStatus: string;
  citesStatus: string;
}

const HERB_DATABASE: HerbData[] = [
  {
    id: 'ashwagandha',
    name: 'Ashwagandha',
    botanical: 'Withania somnifera (L.) Dunal',
    isNTACExempt: true,
    partsUsed: 'Roots, Leaves',
    classicalTexts: ['Charaka Samhita', 'Sushruta Samhita', 'Bhavaprakasha'],
    tkdlStatus: 'Indexed across 1,240 formulations (Rasayana, Balya)',
    citesStatus: 'Not restricted'
  },
  {
    id: 'turmeric',
    name: 'Haridra (Turmeric)',
    botanical: 'Curcuma longa L.',
    isNTACExempt: true,
    partsUsed: 'Rhizome',
    classicalTexts: ['Charaka Samhita', 'Ashtanga Hridaya', 'Dhanvantari Nighantu'],
    tkdlStatus: 'Landmark TKDL anti-biopiracy case (US Patent 5,401,504 revoked)',
    citesStatus: 'Not restricted'
  },
  {
    id: 'triphala',
    name: 'Triphala Components',
    botanical: 'Emblica officinalis, Terminalia chebula, Terminalia bellirica',
    isNTACExempt: true,
    partsUsed: 'Dried fruit pericarps',
    classicalTexts: ['Charaka Samhita Cikitsasthana', 'Ayurvedic Formulary of India Vol I'],
    tkdlStatus: 'Over 2,800 classical references in TKDL database',
    citesStatus: 'Not restricted'
  },
  {
    id: 'sarpgandha',
    name: 'Sarpagandha',
    botanical: 'Rauvolfia serpentina (L.) Benth. ex Kurz',
    isNTACExempt: false,
    partsUsed: 'Roots',
    classicalTexts: ['Charaka Samhita', 'Sushruta Samhita'],
    tkdlStatus: 'High conservation scrutiny; Reserpine source',
    citesStatus: 'CITES Appendix II restricted (Special SBB & DGFT export permit needed)'
  },
  {
    id: 'brahmi',
    name: 'Brahmi / Mandukaparni',
    botanical: 'Bacopa monnieri / Centella asiatica',
    isNTACExempt: true,
    partsUsed: 'Whole plant',
    classicalTexts: ['Charaka Samhita', 'Ayurvedic Pharmacopoeia of India'],
    tkdlStatus: 'Medhya Rasayana formulations documented',
    citesStatus: 'Not restricted'
  }
];

export const TraditionalKnowledgePage: React.FC = () => {
  const { setSelectedSource } = useApp();

  const [selectedHerbId, setSelectedHerbId] = useState<string>('ashwagandha');
  const [entityType, setEntityType] = useState<'Indian' | 'Foreign'>('Indian');
  const [activity, setActivity] = useState<'Commercial' | 'Research' | 'PatentFiling' | 'Export'>('PatentFiling');

  const selectedHerb = HERB_DATABASE.find(h => h.id === selectedHerbId) || HERB_DATABASE[0];

  // Compute BDA Compliance Rule
  const calculateCompliance = () => {
    const isPatent = activity === 'PatentFiling';
    const isForeign = entityType === 'Foreign';
    const isExport = activity === 'Export';
    const isCommercial = activity === 'Commercial';

    if (isPatent) {
      return {
        provision: 'Section 6, Biological Diversity Act 2002 / Form III Approval',
        requirement: 'Mandatory Prior Approval from National Biodiversity Authority (NBA)',
        details: 'No person shall apply for any intellectual property right in or outside India for any invention based on any research or information on a biological resource obtained from India without obtaining prior approval of NBA.',
        formName: 'Form III (Application for applying for Intellectual Property Rights)',
        statutoryRisk: 'Patent is liable for revocation under Section 64(1)(p) of Patents Act if NBA approval is not secured prior to grant.',
        statusColor: 'amber' as const
      };
    }

    if (isForeign) {
      return {
        provision: 'Section 3, Biological Diversity Act 2002 / Form I Approval',
        requirement: 'Mandatory Prior Approval from National Biodiversity Authority (NBA)',
        details: 'Certain persons (non-Indian citizens, foreign companies, or Indian companies with non-Indian participation/control) cannot access biological resources or traditional knowledge for research or commercial utilization without NBA approval.',
        formName: 'Form I (Access to biological resources and associated knowledge)',
        statutoryRisk: 'Cognizable offence under Section 55 punishable with imprisonment or fine.',
        statusColor: 'red' as const
      };
    }

    if (isCommercial && selectedHerb.isNTACExempt) {
      return {
        provision: 'Section 40 NTAC Exemption (Normally Traded as Commodities)',
        requirement: 'Exempted from State Biodiversity Board intimation if traded strictly as commodity',
        details: `${selectedHerb.name} is listed under Central Government Section 40 Notification as an NTAC item. If purchased from standard agricultural/market commodity channels for conventional manufacturing without proprietary genetic research, SBB prior approval is relaxed under BDA Amendment Act 2023.`,
        formName: 'Standard Trade Invoicing & Traceability Record',
        statutoryRisk: 'Exemption ceases if accessed directly from forests or if patent application is filed.',
        statusColor: 'emerald' as const
      };
    }

    if (isCommercial) {
      return {
        provision: 'Section 7, Biological Diversity Act 2002 / State Biodiversity Board (SBB) Intimation',
        requirement: 'Mandatory Prior Intimation to State Biodiversity Board',
        details: 'Indian citizens or commercial entities must give prior intimation to the concerned State Biodiversity Board before accessing biological resources for commercial utilization.',
        formName: 'Form I (State Biodiversity Board specific format) & Benefit Sharing Agreement',
        statutoryRisk: 'Failure to intimate invites penalty under Section 56.',
        statusColor: 'blue' as const
      };
    }

    if (isExport) {
      return {
        provision: 'Section 40 / DGFT Export Policy & CITES Regulations',
        requirement: 'Phytosanitary Certificate & NBA / DGFT Export clearance',
        details: selectedHerb.citesStatus.includes('CITES')
          ? 'CITES Appendix II item: Requires Wildlife Crime Control Bureau (WCCB) and NBA export permit.'
          : 'Standard biological material export requires Section 40 verification and Form II (Transfer of Research Results) if biological material is transferred for foreign R&D.',
        formName: 'Form II (NBA) & Phytosanitary Certificate',
        statutoryRisk: 'Customs seizure under Customs Act 1962 and Wildlife Protection Act.',
        statusColor: 'amber' as const
      };
    }

    return {
      provision: 'General BDA Research Exemption / Collaborative Research',
      requirement: 'Exempt if under Central Government approved collaborative research projects',
      details: 'Research strictly for academic evaluation by Indian institutions without commercial utilization is exempt from prior SBB approval.',
      formName: 'Institutional Ethics & Research Logbook',
      statutoryRisk: 'Must apply for SBB/NBA approval before commercial transfer.',
      statusColor: 'emerald' as const
    };
  };

  const complianceResult = calculateCompliance();

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300">
            Traditional Knowledge &amp; ABS Framework
          </span>
          <span className="text-xs text-slate-500">Biological Diversity Act 2002 &amp; BDA 2023</span>
        </div>
        <h1 className="font-heading font-bold text-2xl text-slate-900 mt-1">
          Traditional Knowledge Digital Library &amp; Biodiversity Compliance
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Screen formulations against TKDL anti-biopiracy registries and verify Access &amp; Benefit Sharing (ABS) mandates.
        </p>
      </div>

      {/* Safety Notice Banner */}
      <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-950 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Statutory Disclaimer:</strong> AI screening tool only — not a formal legal determination by the National Biodiversity Authority (NBA) or State Biodiversity Board (SBB). All commercialization should undergo formal review.
        </p>
      </div>

      {/* Grid: ABS Calculator (Left) & Knowledge Base Details (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: ABS & Biodiversity Compliance Calculator */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Calculator className="w-5 h-5 text-emerald-700" />
            <div>
              <h3 className="font-heading font-bold text-base text-slate-900">
                Interactive ABS &amp; Biodiversity Compliance Calculator
              </h3>
              <p className="text-xs text-slate-500">
                Select biological resource, entity type, and activity to determine legal requirements.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* 1. Biological Resource Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                1. Select Biological Resource / Herb:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {HERB_DATABASE.map(herb => (
                  <button
                    key={herb.id}
                    type="button"
                    onClick={() => setSelectedHerbId(herb.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedHerbId === herb.id
                        ? 'bg-emerald-50 border-emerald-500 shadow-xs'
                        : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{herb.name}</span>
                      {herb.isNTACExempt && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-semibold">
                          NTAC Sec 40
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 italic mt-0.5">{herb.botanical}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Entity Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                2. Innovator / Entity Legal Status:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setEntityType('Indian')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    entityType === 'Indian'
                      ? 'bg-emerald-50 border-emerald-500 shadow-xs font-bold text-emerald-950'
                      : 'bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="text-xs">🇮🇳 Indian Citizen / Domestic Company</div>
                  <div className="text-[10px] text-slate-500 font-normal mt-0.5">Section 7 SBB Intimation Pathway</div>
                </button>

                <button
                  type="button"
                  onClick={() => setEntityType('Foreign')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    entityType === 'Foreign'
                      ? 'bg-emerald-50 border-emerald-500 shadow-xs font-bold text-emerald-950'
                      : 'bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="text-xs">🌐 Foreign Entity / NRI / MNC</div>
                  <div className="text-[10px] text-slate-500 font-normal mt-0.5">Section 3 Mandatory NBA Clearance</div>
                </button>
              </div>
            </div>

            {/* 3. Proposed Activity */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                3. Proposed Commercial or R&amp;D Activity:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {[
                  { key: 'PatentFiling', label: 'Patent / IP Filing' },
                  { key: 'Commercial', label: 'Commercial Manufacturing' },
                  { key: 'Export', label: 'Raw Herb Export' },
                  { key: 'Research', label: 'Academic R&D' }
                ].map(act => (
                  <button
                    key={act.key}
                    type="button"
                    onClick={() => setActivity(act.key as any)}
                    className={`p-2.5 rounded-xl border text-center font-medium transition-all ${
                      activity === act.key
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {act.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Calculator Output Card */}
          <div className="p-5 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-3 animate-slide-up">
            <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  Statutory Determination
                </span>
                <h4 className="font-heading font-bold text-sm text-white mt-0.5">
                  {complianceResult.provision}
                </h4>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                {complianceResult.formName}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-300">Mandatory Action:</span>
              <p className="text-xs text-emerald-200 leading-relaxed">
                {complianceResult.requirement}
              </p>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {complianceResult.details}
            </p>

            <div className="p-2.5 bg-red-950/40 rounded-xl border border-red-800/40 text-xs text-red-200 flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
              <span>
                <strong>Non-compliance Risk:</strong> {complianceResult.statutoryRisk}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Selected Herb TKDL Dossier */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Leaf className="w-5 h-5 text-emerald-700" />
              <div>
                <h3 className="font-heading font-bold text-base text-slate-900">
                  {selectedHerb.name} Botanical &amp; TK Dossier
                </h3>
                <span className="text-xs text-slate-500 italic">{selectedHerb.botanical}</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Authoritative Classical Texts Cited
                </span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {selectedHerb.classicalTexts.map((txt, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 font-medium"
                    >
                      📜 {txt}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  TKDL Registry Status
                </span>
                <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 leading-relaxed mt-1">
                  {selectedHerb.tkdlStatus}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Conservation &amp; CITES Status
                </span>
                <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 leading-relaxed mt-1">
                  {selectedHerb.citesStatus}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-slate-500 font-medium">Statutory Section:</span>
                <button
                  onClick={() => setSelectedSource(DEMO_SOURCES['bda-sec40-2024'])}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Inspect BDA 2024 Gazette</span>
                </button>
              </div>
            </div>
          </div>

          {/* TKDL Info Card */}
          <div className="p-5 bg-gradient-to-br from-emerald-900 to-slate-900 text-white rounded-2xl shadow-sm border border-emerald-800/40 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-emerald-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Why TKDL Matters in SIH 2026</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              TKDL bridges the gap between ancient Sanskrit/Ayurvedic texts and modern patent examiners worldwide (USPTO, EPO, JPO, UKIPO). If an invention duplicates known properties, Section 3(p) bars patentability.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
