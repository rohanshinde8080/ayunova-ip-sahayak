import React, { useState } from 'react';
import {
  Globe2,
  ShieldCheck,
  FileText,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  ArrowRightLeft,
  Info
} from 'lucide-react';
import { Jurisdiction } from '../types';
import { DEMO_COMPARISONS } from '../data/demoData';
import { useApp } from '../context/AppContext';

export const IndiaVsInternationalPage: React.FC = () => {
  const [countryA, setCountryA] = useState<Jurisdiction>('India');
  const [countryB, setCountryB] = useState<Jurisdiction>('USA');
  const { setSelectedSource } = useApp();

  const dataA = DEMO_COMPARISONS[countryA] || DEMO_COMPARISONS['India'];
  const dataB = DEMO_COMPARISONS[countryB] || DEMO_COMPARISONS['USA'];

  const allCountries: { code: Jurisdiction; label: string; flag: string }[] = [
    { code: 'India', label: 'India (Patents Act & Ayush)', flag: '🇮🇳' },
    { code: 'USA', label: 'USA (FDA & USPTO)', flag: '🇺🇸' },
    { code: 'EU', label: 'EU (EMA & THMPD)', flag: '🇪🇺' },
    { code: 'Japan', label: 'Japan (PMDA & Kampo)', flag: '🇯🇵' },
    { code: 'International', label: 'Global (WIPO GRATK)', flag: '🌐' }
  ];

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300">
            Cross-Border Regulatory Intelligence
          </span>
          <span className="text-xs text-slate-500">WIPO GRATK Treaty 2024 &amp; FDA Botanical Guidance</span>
        </div>
        <h1 className="font-heading font-bold text-2xl text-slate-900 mt-1">
          India vs International IP &amp; Regulatory Comparison
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Compare patent bars, dietary supplement pathways, botanical drug requirements, and ABS disclosure rules across key export markets.
        </p>
      </div>

      {/* Statutory Banner */}
      <div className="p-3.5 bg-slate-100 rounded-2xl border border-slate-200 text-xs text-slate-700 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Prototype Comparison Notice:</strong> Verify current statutory requirements from official authorities (CGPDTM, US FDA, EMA, PMDA, WIPO) before making legal or regulatory commercialization decisions.
        </p>
      </div>

      {/* Country Selectors Bar */}
      <div className="gov-card p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Primary Jurisdiction:
            </label>
            <select
              value={countryA}
              onChange={e => setCountryA(e.target.value as Jurisdiction)}
              className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              {allCountries.map(c => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-4 text-slate-400">
            <ArrowRightLeft className="w-4 h-4" />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Comparison Target:
            </label>
            <select
              value={countryB}
              onChange={e => setCountryB(e.target.value as Jurisdiction)}
              className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              {allCountries.map(c => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => {
              setCountryA('India');
              setCountryB('USA');
            }}
            className="px-2.5 py-1 rounded bg-slate-100 hover:bg-emerald-50 text-slate-700 font-medium"
          >
            🇮🇳 India vs 🇺🇸 USA
          </button>
          <button
            onClick={() => {
              setCountryA('India');
              setCountryB('EU');
            }}
            className="px-2.5 py-1 rounded bg-slate-100 hover:bg-emerald-50 text-slate-700 font-medium"
          >
            🇮🇳 India vs 🇪🇺 EU
          </button>
          <button
            onClick={() => {
              setCountryA('USA');
              setCountryB('International');
            }}
            className="px-2.5 py-1 rounded bg-slate-100 hover:bg-emerald-50 text-slate-700 font-medium"
          >
            🇺🇸 USA vs 🌐 WIPO
          </button>
        </div>
      </div>

      {/* Side-by-Side Comparison Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Country A Column */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{dataA.flag}</span>
              <div>
                <h3 className="font-heading font-bold text-base text-slate-900">
                  {dataA.country} Framework
                </h3>
                <span className="text-[11px] text-slate-500 font-medium">Domestic / Export Regulatory System</span>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              Active Focus
            </span>
          </div>

          {/* Section 1: IP Considerations */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>IP &amp; Patentability Architecture</span>
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {dataA.ipConsiderations.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Section 2: Regulatory Pathway */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-700" />
              <span>Commercial Regulatory Pathways</span>
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {dataA.regulatoryPathway.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Section 3: Documentation Required */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Typical Quality &amp; CMC Documentation
            </h4>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
              {dataA.typicalDocumentation.map((doc, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{doc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Traditional Knowledge & ABS Rules */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Traditional Knowledge / ABS Disclosure Rules
            </h4>
            <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 text-xs text-amber-950">
              {dataA.traditionalKnowledgeRequirements.join(' • ')}
            </div>
          </div>

          <div className="p-3 bg-slate-100 rounded-xl text-xs text-slate-600 font-medium">
            <strong>Key Note:</strong> {dataA.importantNotes}
          </div>
        </div>

        {/* Country B Column */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{dataB.flag}</span>
              <div>
                <h3 className="font-heading font-bold text-base text-slate-900">
                  {dataB.country} Framework
                </h3>
                <span className="text-[11px] text-slate-500 font-medium">Target Export Regulatory System</span>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
              Comparative Benchmark
            </span>
          </div>

          {/* Section 1: IP Considerations */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>IP &amp; Patentability Architecture</span>
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {dataB.ipConsiderations.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Section 2: Regulatory Pathway */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-700" />
              <span>Commercial Regulatory Pathways</span>
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {dataB.regulatoryPathway.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Section 3: Documentation Required */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Typical Quality &amp; CMC Documentation
            </h4>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
              {dataB.typicalDocumentation.map((doc, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>{doc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Traditional Knowledge & ABS Rules */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Traditional Knowledge / ABS Disclosure Rules
            </h4>
            <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 text-xs text-amber-950">
              {dataB.traditionalKnowledgeRequirements.join(' • ')}
            </div>
          </div>

          <div className="p-3 bg-slate-100 rounded-xl text-xs text-slate-600 font-medium">
            <strong>Key Note:</strong> {dataB.importantNotes}
          </div>
        </div>
      </div>
    </div>
  );
};
