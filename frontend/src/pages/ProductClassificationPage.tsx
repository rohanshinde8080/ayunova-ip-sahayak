import React, { useState } from 'react';
import {
  FlaskConical,
  ShieldCheck,
  FileCheck,
  Download,
  Sparkles,
  BookOpen,
  ArrowRight,
  Info,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { ProductClassificationInput, ProductClassificationResult, Jurisdiction } from '../types';
import { classificationService } from '../services/classificationService';
import { DEMO_CLASSIFICATION_SAMPLE } from '../data/demoData';
import { ConfidenceBadge } from '../components/ConfidenceBadge';
import { useApp } from '../context/AppContext';

export const ProductClassificationPage: React.FC = () => {
  const { setSelectedSource, showNotification } = useApp();

  const [form, setForm] = useState<ProductClassificationInput>({
    name: 'Triphala Herbal Formulation',
    ingredients: 'Amalaki (Emblica officinalis), Haritaki (Terminalia chebula), Bibhitaki (Terminalia bellirica)',
    purpose: 'Digestive wellness and metabolic oxidative balance',
    dosageForm: 'Modified Release Tablet',
    manufacturingMethod: 'Hydro-ethanolic extraction standardized to 40% tannins',
    targetMarket: 'Domestic OTC & Health Supplement',
    country: 'India'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ProductClassificationResult | null>(DEMO_CLASSIFICATION_SAMPLE);

  const handleClassify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await classificationService.classifyProduct(form);
      setResult(res);
      showNotification('Product classified successfully');
    } catch {
      showNotification('Classification service error');
    } finally {
      setIsLoading(false);
    }
  };

  const setPreset = (preset: 'triphala' | 'curcumin' | 'cosmetic' | 'aahar') => {
    if (preset === 'triphala') {
      setForm({
        name: 'Triphala Synergistic Tablet',
        ingredients: 'Amalaki, Haritaki, Bibhitaki (1:1:1 ratio)',
        purpose: 'Digestive wellness & mild laxative',
        dosageForm: 'Modified Release Tablet',
        manufacturingMethod: 'Standardized aqueous-ethanolic extraction',
        targetMarket: 'Domestic OTC',
        country: 'India'
      });
    } else if (preset === 'curcumin') {
      setForm({
        name: 'Curcumin Nano-Phytosome Matrix',
        ingredients: 'Curcuma longa rhizome extract (95% curcuminoids) + Piperine',
        purpose: 'Joint inflammation support & enhanced bioavailability',
        dosageForm: 'Softgel Capsule',
        manufacturingMethod: 'Supercritical fluid extraction + phospholipid complexation',
        targetMarket: 'Phytopharmaceutical Prescription',
        country: 'India'
      });
    } else if (preset === 'cosmetic') {
      setForm({
        name: 'Kumkumadi Radiance Face Elixir',
        ingredients: 'Saffron (Keshara), Sandalwood (Chandana), Manjistha, Sesame oil base',
        purpose: 'Skin brightening, complexation toning and anti-pigmentation',
        dosageForm: 'Facial Oil / Serum',
        manufacturingMethod: 'Classical Taila Paka Vidhi with modern cold filtering',
        targetMarket: 'Premium Ayurvedic Cosmetics',
        country: 'India'
      });
    } else if (preset === 'aahar') {
      setForm({
        name: 'Ayur-Immuno Green Kadha Infusion',
        ingredients: 'Tulsi, Shunthi, Dalchini, Maricha, Jaggery',
        purpose: 'Daily immunity wellness drink',
        dosageForm: 'Instant Soluble Granules',
        manufacturingMethod: 'Spray-dried herbal decoction',
        targetMarket: 'Ayurveda Aahar Health Drink',
        country: 'India'
      });
    }
  };

  const handleDownload = () => {
    showNotification('Exporting Preliminary Classification Dossier (PDF/Text)...');
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300">
              Formulation Decision Engine
            </span>
            <span className="text-xs text-slate-500">Drugs &amp; Cosmetics Rules Rule 158B</span>
          </div>
          <h1 className="font-heading font-bold text-2xl text-slate-900 mt-1">
            Product Classification &amp; Regulatory Pathway
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Determine whether your formulation is Classical, Patent &amp; Proprietary (P&amp;P), Phytopharmaceutical, or Ayurveda-Aahar.
          </p>
        </div>

        {result && (
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Download Classification Dossier</span>
          </button>
        )}
      </div>

      {/* Preset Quick Selectors */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-500 font-semibold uppercase">Presets:</span>
        <button
          onClick={() => setPreset('triphala')}
          className="text-xs px-3 py-1.5 rounded-lg bg-white hover:bg-emerald-50 border border-slate-200 text-slate-700 font-medium transition-colors"
        >
          🌿 Triphala Tablet (P&amp;P)
        </button>
        <button
          onClick={() => setPreset('curcumin')}
          className="text-xs px-3 py-1.5 rounded-lg bg-white hover:bg-emerald-50 border border-slate-200 text-slate-700 font-medium transition-colors"
        >
          🔬 Curcumin Phytosome (Phytopharm)
        </button>
        <button
          onClick={() => setPreset('cosmetic')}
          className="text-xs px-3 py-1.5 rounded-lg bg-white hover:bg-emerald-50 border border-slate-200 text-slate-700 font-medium transition-colors"
        >
          ✨ Kumkumadi Oil (Ayurvedic Cosmetic)
        </button>
        <button
          onClick={() => setPreset('aahar')}
          className="text-xs px-3 py-1.5 rounded-lg bg-white hover:bg-emerald-50 border border-slate-200 text-slate-700 font-medium transition-colors"
        >
          🍵 Immuno Kadha (Ayurveda Aahar)
        </button>
      </div>

      {/* Grid: Form (Left) & Result (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Container */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <FlaskConical className="w-5 h-5 text-emerald-700" />
            <h3 className="font-heading font-bold text-sm text-slate-900">
              Formulation Specifications
            </h3>
          </div>

          <form onSubmit={handleClassify} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Product / Formulation Name
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ingredients &amp; Botanical Species
              </label>
              <textarea
                rows={2}
                required
                value={form.ingredients}
                onChange={e => setForm({ ...form, ingredients: e.target.value })}
                placeholder="List herbs, parts used, and botanical names..."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Intended Purpose / Claim
                </label>
                <input
                  type="text"
                  required
                  value={form.purpose}
                  onChange={e => setForm({ ...form, purpose: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Dosage Form
                </label>
                <input
                  type="text"
                  required
                  value={form.dosageForm}
                  onChange={e => setForm({ ...form, dosageForm: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Manufacturing Method &amp; Extraction
              </label>
              <input
                type="text"
                required
                value={form.manufacturingMethod}
                onChange={e => setForm({ ...form, manufacturingMethod: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Market
                </label>
                <input
                  type="text"
                  value={form.targetMarket}
                  onChange={e => setForm({ ...form, targetMarket: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jurisdiction
                </label>
                <select
                  value={form.country}
                  onChange={e => setForm({ ...form, country: e.target.value as Jurisdiction })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="India">India (Drugs &amp; Cosmetics Act)</option>
                  <option value="USA">USA (FDA DSHEA / CDER)</option>
                  <option value="EU">EU (EMA THMPD)</option>
                  <option value="Japan">Japan (PMDA Kampo)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{isLoading ? 'Evaluating Decision Tree...' : 'Classify Product & Generate Roadmap'}</span>
            </button>
          </form>
        </div>

        {/* Classification Output Container */}
        <div className="lg:col-span-6 space-y-4">
          {result ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5 animate-fade-in">
              {/* Header Badge */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    AI Preliminary Classification
                  </span>
                  <h3 className="font-heading font-bold text-lg text-emerald-900 mt-0.5">
                    {result.category}
                  </h3>
                </div>
                <ConfidenceBadge confidence={result.confidence} />
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-700 bg-emerald-50/40 p-3.5 rounded-xl border border-emerald-100 leading-relaxed">
                {result.description}
              </p>

              {/* IP Considerations */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  IP &amp; Patentability Considerations:
                </span>
                <ul className="space-y-1 text-xs text-slate-700">
                  {result.ipConsiderations.map((ip, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                      <span>{ip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Regulatory Pathway */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Statutory Regulatory Pathway:
                </span>
                <ul className="space-y-1 text-xs text-slate-700">
                  {result.regulatoryPathway.map((rp, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                      <span>{rp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Traditional Knowledge Screening */}
              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 text-xs text-amber-950 space-y-1">
                <span className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                  <span>Traditional Knowledge &amp; TKDL Status</span>
                </span>
                <p className="text-slate-700 leading-relaxed">
                  {result.traditionalKnowledgeScreening}
                </p>
              </div>

              {/* Applicable Schedules & Forms Grid */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Applicable Schedules</span>
                  <div className="font-semibold text-slate-800 font-mono text-[11px] mt-0.5">
                    {result.applicableSchedules.join(' • ')}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Recommended Licensing Forms</span>
                  <div className="font-semibold text-emerald-800 font-mono text-[11px] mt-0.5">
                    {result.recommendedForms.join(' • ')}
                  </div>
                </div>
              </div>

              {/* Grounding Source Badges */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">
                  Statutory Grounds (Click to inspect Gazette):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {result.sources.map(src => (
                    <button
                      key={src.id}
                      onClick={() => setSelectedSource(src)}
                      className="badge-source text-[11px]"
                    >
                      <BookOpen className="w-3 h-3 text-emerald-600" />
                      <span>{src.section}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 space-y-2">
              <FlaskConical className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-xs">Fill the formulation specifications and click Classify Product</p>
            </div>
          )}

          {/* Safety disclaimer */}
          <div className="p-3 bg-slate-100 rounded-xl text-[11px] text-slate-500 flex items-start gap-2 border border-slate-200">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span>
              Preliminary AI categorization. Official licensing is subject to State Ayush Licensing Authority (SLA) review and Pharmacopoeial laboratory analysis.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
