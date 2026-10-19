import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  BookOpen,
  Search,
  Sparkles,
  ExternalLink,
  FileText,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  Leaf,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Bot,
  Database,
  ArrowRight,
  FlaskConical,
  Award
} from 'lucide-react';
import { researchService } from '../services/researchService';
import {
  ResearchPaper,
  ResearchSearchResponse,
  ResearchSynthesisResponse
} from '../types/research';
import { useApp } from '../context/AppContext';

// Curated popular Ayurvedic medicinal plants for quick selection
const POPULAR_HERBS = [
  { name: 'Ashwagandha', botanical: 'Withania somnifera' },
  { name: 'Tulsi', botanical: 'Ocimum sanctum' },
  { name: 'Neem', botanical: 'Azadirachta indica' },
  { name: 'Turmeric', botanical: 'Curcuma longa' },
  { name: 'Brahmi', botanical: 'Bacopa monnieri' },
  { name: 'Shatavari', botanical: 'Asparagus racemosus' },
  { name: 'Giloy', botanical: 'Tinospora cordifolia' },
  { name: 'Guggulu', botanical: 'Commiphora mukul' }
];

export const ResearchIntelligencePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || 'Ashwagandha';
  const { setActiveDemoQuery } = useApp();
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState(initialQuery);
  const [activeQuery, setActiveQuery] = useState(initialQuery);
  const [data, setData] = useState<ResearchSearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters & Sorting state
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSource, setSelectedSource] = useState<string>('All');
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [onlyOpenAccess, setOnlyOpenAccess] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'relevance' | 'newest' | 'oldest' | 'citations'>('relevance');
  const [filterText, setFilterText] = useState<string>('');

  // Expandable abstracts
  const [expandedPaperIds, setExpandedPaperIds] = useState<Set<string>>(new Set());

  // AI Synthesis state
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthesis, setSynthesis] = useState<ResearchSynthesisResponse | null>(null);
  const [showSynthesis, setShowSynthesis] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Fetch research data
  const fetchResearch = async (query: string, refresh = false) => {
    if (!query.trim()) return;
    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);
    setSynthesis(null);
    setShowSynthesis(false);
    try {
      const response = await researchService.search(query.trim(), refresh);
      setData(response);
      setActiveQuery(query.trim());
      setSearchParams({ q: query.trim() });
      setCurrentPage(1);
      // Reset filter on new herb search
      setSelectedCategory('All');
      setSelectedSource('All');
      setSelectedYear('All');
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve research literature. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchResearch(initialQuery);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      fetchResearch(searchInput.trim());
    }
  };

  const handleHerbPillClick = (herbName: string) => {
    setSearchInput(herbName);
    fetchResearch(herbName);
  };

  const toggleAbstract = (id: string) => {
    setExpandedPaperIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // AI Synthesis Handler
  const handleGenerateSynthesis = async () => {
    if (!activeQuery) return;
    setIsSynthesizing(true);
    setShowSynthesis(true);
    try {
      const result = await researchService.synthesize(activeQuery, data?.papers);
      setSynthesis(result);
    } catch (err: any) {
      setError(err.message || 'Failed to synthesize research.');
    } finally {
      setIsSynthesizing(false);
    }
  };

  // Ask AI Assistant pre-fill
  const handleAskAIAssistant = () => {
    if (!data) return;
    const prompt = `Provide an IP & regulatory analysis for ${data.herb_profile.common_name} (${data.herb_profile.scientific_name}). Consider its active markers (${data.herb_profile.phytochemical_markers.join(', ')}) and whether its clinical research supports novelty or falls under Section 3(p) Traditional Knowledge.`;
    setActiveDemoQuery(prompt);
    navigate('/assistant');
  };

  // Filtered & Sorted Papers
  const filteredPapers = useMemo(() => {
    if (!data?.papers) return [];

    let list = [...data.papers];

    if (selectedCategory !== 'All') {
      list = list.filter(p => p.research_type === selectedCategory);
    }

    if (selectedSource !== 'All') {
      list = list.filter(p => p.source === selectedSource);
    }

    if (selectedYear !== 'All') {
      list = list.filter(p => String(p.publication_year) === selectedYear);
    }

    if (onlyOpenAccess) {
      list = list.filter(p => p.open_access);
    }

    if (filterText.trim()) {
      const ft = filterText.toLowerCase();
      list = list.filter(
        p =>
          p.title.toLowerCase().includes(ft) ||
          (p.abstract && p.abstract.toLowerCase().includes(ft)) ||
          p.authors.some(a => a.toLowerCase().includes(ft)) ||
          (p.journal && p.journal.toLowerCase().includes(ft))
      );
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'newest') {
        return (b.publication_year || 0) - (a.publication_year || 0);
      }
      if (sortBy === 'oldest') {
        return (a.publication_year || 9999) - (b.publication_year || 9999);
      }
      if (sortBy === 'citations') {
        return (b.citation_count || 0) - (a.citation_count || 0);
      }
      // default: relevance
      return (b.relevance_score || 0) - (a.relevance_score || 0);
    });

    return list;
  }, [data, selectedCategory, selectedSource, selectedYear, onlyOpenAccess, sortBy, filterText]);

  // Paginated papers
  const totalPages = Math.ceil(filteredPapers.length / pageSize) || 1;
  const paginatedPapers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPapers.slice(start, start + pageSize);
  }, [filteredPapers, currentPage, pageSize]);

  // Year series for chart
  const yearEntries = useMemo(() => {
    if (!data?.analytics?.by_year) return [];
    return Object.entries(data.analytics.by_year)
      .map(([yr, count]) => ({ year: yr, count }))
      .sort((a, b) => a.year.localeCompare(b.year));
  }, [data]);

  const maxYearCount = useMemo(() => {
    if (yearEntries.length === 0) return 1;
    return Math.max(...yearEntries.map(e => e.count), 1);
  }, [yearEntries]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#103829] via-[#144834] to-[#0a2319] text-white p-6 sm:p-8 shadow-xl border border-emerald-800/40">
        {/* Ambient Glow & Botanical Watermark */}
        <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-0 w-72 h-72 bg-teal-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold backdrop-blur-md border border-emerald-400/30">
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span>Multi-Source Scholarly Retrieval Engine</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-emerald-200/80">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Connected: PubMed · Europe PMC · OpenAlex · Crossref</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-4xl font-heading font-black tracking-tight text-white mb-2">
            Research Paper Intelligence
          </h1>
          <p className="text-sm sm:text-base text-emerald-100/90 max-w-3xl leading-relaxed">
            Discover peer-reviewed scholarly publications, clinical trials, phytochemical studies, and publication
            trajectories for medicinal plants across global biomedical databases with deduplication and verified DOIs.
          </p>

          {/* Search Input Bar */}
          <form onSubmit={handleSearchSubmit} className="mt-6">
            <div className="relative flex items-center shadow-2xl rounded-2xl overflow-hidden bg-white/95 p-1.5 border border-white/20">
              <Search className="w-5 h-5 text-emerald-800 ml-3 shrink-0" />
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Search medicinal plant (e.g., Ashwagandha, Tulsi, Neem, Curcuma longa, Brahmi)..."
                className="w-full px-3 py-3 text-sm text-slate-900 placeholder-slate-400 bg-transparent focus:outline-none font-medium"
              />
              <button
                type="submit"
                disabled={isLoading || isRefreshing}
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-200 shrink-0 flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Find Papers</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Select Herb Pills */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs text-emerald-200/80 font-semibold mr-1">Quick Select:</span>
            {POPULAR_HERBS.map(herb => {
              const isSelected = activeQuery.toLowerCase() === herb.name.toLowerCase();
              return (
                <button
                  key={herb.name}
                  onClick={() => handleHerbPillClick(herb.name)}
                  className={`text-xs px-3 py-1 rounded-full transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-emerald-400 text-emerald-950 font-bold shadow-md shadow-emerald-900/30'
                      : 'bg-white/10 hover:bg-white/20 text-emerald-100 border border-emerald-400/20'
                  }`}
                >
                  <Leaf className="w-3 h-3" />
                  <span>{herb.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-sm">
            <p className="font-bold">Error retrieving scholarly data</p>
            <p className="text-xs mt-0.5">{error}</p>
          </div>
          <button
            onClick={() => fetchResearch(activeQuery, true)}
            className="text-xs font-bold text-red-700 underline cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-6 animate-pulse">
          <div className="h-32 bg-slate-200 rounded-3xl" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="h-24 bg-slate-200 rounded-2xl" />
            <div className="h-24 bg-slate-200 rounded-2xl" />
            <div className="h-24 bg-slate-200 rounded-2xl" />
            <div className="h-24 bg-slate-200 rounded-2xl" />
          </div>
          <div className="h-64 bg-slate-200 rounded-3xl" />
          <div className="h-96 bg-slate-200 rounded-3xl" />
        </div>
      )}

      {/* Main Results View */}
      {!isLoading && data && (
        <>
          {/* Phase 2: Botanical Identity & Query Understanding Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xs uppercase tracking-wider font-mono font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                    Botanical Registry Match
                  </span>
                  <span className="text-xs text-slate-500">
                    Family: <strong className="text-slate-800">{data.herb_profile.family}</strong>
                  </span>
                  {data.cached && (
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1 font-medium">
                      <Database className="w-3 h-3" />
                      Cached (Synced: {new Date(data.last_synced_at).toLocaleDateString()})
                    </span>
                  )}
                </div>

                <div>
                  <h2 className="text-2xl sm:text-3xl font-heading font-black text-slate-900">
                    {data.herb_profile.common_name}
                  </h2>
                  <p className="text-base sm:text-lg text-emerald-800 italic font-serif mt-0.5">
                    {data.herb_profile.scientific_name}
                  </p>
                </div>

                {/* Synonyms & Search Variations */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-xs text-slate-400 font-medium">Synonyms / Variations:</span>
                  {data.herb_profile.synonyms.map(syn => (
                    <span
                      key={syn}
                      className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium border border-slate-200"
                    >
                      {syn}
                    </span>
                  ))}
                </div>

                {/* Active Phytochemical Markers */}
                {data.herb_profile.phytochemical_markers && data.herb_profile.phytochemical_markers.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-xs text-slate-400 font-medium">Phytochemical Markers:</span>
                    {data.herb_profile.phytochemical_markers.map(m => (
                      <span
                        key={m}
                        className="text-xs px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 font-mono text-[11px] border border-amber-200"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
                <button
                  onClick={() => fetchResearch(activeQuery, true)}
                  disabled={isRefreshing}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 hover:border-emerald-600 bg-white hover:bg-emerald-50/50 text-slate-700 hover:text-emerald-900 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  title="Force live refresh from connected APIs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
                  <span>{isRefreshing ? 'Syncing...' : 'Force Live API Sync'}</span>
                </button>

                <button
                  onClick={handleGenerateSynthesis}
                  disabled={isSynthesizing}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                  <span>{isSynthesizing ? 'Synthesizing...' : 'AI Research Synthesis'}</span>
                </button>

                <button
                  onClick={handleAskAIAssistant}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Bot className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Ask AI Copilot</span>
                </button>
              </div>
            </div>
          </div>

          {/* Phase 6 & Phase 9: Research Summary Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900 font-heading">
                  {data.analytics.total_papers.toLocaleString()}
                </div>
                <div className="text-xs text-slate-500 font-medium">Total Unique Papers</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900 font-heading">
                  {data.analytics.clinical_studies_count.toLocaleString()}
                </div>
                <div className="text-xs text-slate-500 font-medium">Clinical Studies</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900 font-heading">
                  {data.analytics.open_access_count.toLocaleString()}
                </div>
                <div className="text-xs text-slate-500 font-medium">Open Access Full-Text</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center shrink-0">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900 font-heading">
                  {data.analytics.recent_papers_count.toLocaleString()}
                </div>
                <div className="text-xs text-slate-500 font-medium">Recent (2020–2026)</div>
              </div>
            </div>
          </div>

          {/* Phase 6 Notice: Dynamic Paper Count Exact Compliance */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
              <p className="text-xs sm:text-sm font-semibold text-emerald-950">
                <strong>{data.analytics.total_papers.toLocaleString()}</strong> unique research records found across connected scholarly databases.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-800">
              <span>Source breakdown:</span>
              {Object.entries(data.analytics.by_source).map(([src, cnt]) => (
                <span key={src} className="px-2 py-0.5 rounded-md bg-white border border-emerald-300 font-mono text-[11px] font-bold">
                  {src}: {cnt}
                </span>
              ))}
            </div>
          </div>

          {/* AI Research Synthesis Collapsible Panel */}
          {showSynthesis && (
            <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-7 border border-emerald-600/40 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-400/30">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-black text-base sm:text-lg text-white">
                      Evidence-Grounded AI Research Synthesis
                    </h3>
                    <p className="text-xs text-emerald-200/80">
                      Grounded on {synthesis ? synthesis.papers_analyzed : 'retrieved'} peer-reviewed scholarly records
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowSynthesis(false)}
                  className="text-xs text-slate-400 hover:text-white px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                  Hide
                </button>
              </div>

              {isSynthesizing ? (
                <div className="py-8 flex flex-col items-center justify-center gap-3 text-emerald-200">
                  <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
                  <p className="text-sm font-medium">Synthesizing scientific literature across clinical & pharmacological databases...</p>
                </div>
              ) : synthesis ? (
                <div className="space-y-4">
                  <div className="text-xs sm:text-sm text-slate-200 leading-relaxed space-y-3 whitespace-pre-line bg-white/5 p-4 sm:p-5 rounded-2xl border border-white/10">
                    {synthesis.synthesis}
                  </div>

                  {synthesis.citations && synthesis.citations.length > 0 && (
                    <div className="pt-2">
                      <h4 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider mb-2">
                        Primary Grounding Citations:
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {synthesis.citations.map((c, i) => (
                          <div
                            key={i}
                            className="text-xs bg-white/5 hover:bg-white/10 p-2.5 rounded-xl border border-white/10 flex items-start justify-between gap-2"
                          >
                            <div className="min-w-0">
                              <p className="font-medium text-slate-200 truncate">{c.title}</p>
                              <p className="text-[11px] text-slate-400 truncate">
                                {c.journal || 'Peer-Reviewed Journal'} {c.year ? `(${c.year})` : ''}
                              </p>
                            </div>
                            {c.doi && (
                              <a
                                href={`https://doi.org/${c.doi}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-400 hover:text-emerald-300 shrink-0 p-1"
                                title="Open DOI"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}

          {/* Phase 9: Research Analytics Grid (Publications by Year & Categories) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Publications by Year Chart */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-black text-base text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-700" />
                    <span>Publication Trend by Year</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Annual publication trajectory from connected repositories
                  </p>
                </div>
                {selectedYear !== 'All' && (
                  <button
                    onClick={() => setSelectedYear('All')}
                    className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg hover:bg-emerald-100 transition-colors"
                  >
                    Clear Filter ({selectedYear})
                  </button>
                )}
              </div>

              {/* Responsive SVG Bar Chart */}
              {yearEntries.length > 0 ? (
                <div className="pt-4">
                  <div className="flex items-end gap-1.5 sm:gap-2 h-48 w-full border-b border-slate-200 pb-2 px-1 overflow-x-auto">
                    {yearEntries.map(entry => {
                      const heightPercent = Math.max(8, (entry.count / maxYearCount) * 100);
                      const isSelected = selectedYear === entry.year;
                      return (
                        <div
                          key={entry.year}
                          onClick={() => setSelectedYear(selectedYear === entry.year ? 'All' : entry.year)}
                          className="flex-1 min-w-[28px] max-w-[48px] flex flex-col items-center gap-1.5 cursor-pointer group"
                        >
                          <div className="relative w-full flex items-end justify-center h-40">
                            {/* Tooltip */}
                            <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-mono px-1.5 py-0.5 rounded shadow pointer-events-none whitespace-nowrap z-20">
                              {entry.year}: {entry.count} papers
                            </div>
                            <div
                              style={{ height: `${heightPercent}%` }}
                              className={`w-full rounded-t-lg transition-all duration-300 ${
                                isSelected
                                  ? 'bg-emerald-600 ring-2 ring-emerald-400'
                                  : 'bg-emerald-500/70 group-hover:bg-emerald-600'
                              }`}
                            />
                          </div>
                          <span className={`text-[10px] font-mono transition-colors ${
                            isSelected ? 'font-bold text-emerald-900' : 'text-slate-500 group-hover:text-slate-900'
                          }`}>
                            {entry.year.slice(2)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-slate-400 pt-2 px-1">
                    <span>Click on any bar to filter papers by year</span>
                    <span>Range: {yearEntries[0]?.year} – {yearEntries[yearEntries.length - 1]?.year}</span>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-slate-400">
                  No publication year metadata available.
                </div>
              )}
            </div>

            {/* Phase 8: Research Category Distribution */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div>
                <h3 className="font-heading font-black text-base text-slate-900 flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-emerald-700" />
                  <span>Research Categories</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Automated scientific classification of papers
                </p>
              </div>

              <div className="space-y-2.5 pt-1">
                {Object.entries(data.analytics.by_category)
                  .sort((a, b) => b[1] - a[1])
                  .map(([cat, count]) => {
                    const pct = Math.round((count / (data.analytics.total_papers || 1)) * 100);
                    const isSelected = selectedCategory === cat;
                    return (
                      <div
                        key={cat}
                        onClick={() => setSelectedCategory(selectedCategory === cat ? 'All' : cat)}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-500/20'
                            : 'bg-white hover:bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-bold text-slate-800 truncate">{cat}</span>
                            <span className="font-mono text-slate-500 font-semibold">{count} ({pct}%)</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${pct}%` }}
                              className={`h-full rounded-full transition-all duration-300 ${
                                isSelected ? 'bg-emerald-600' : 'bg-emerald-500'
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Phase 10: Interactive Filters & Sorting Toolbar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <SlidersHorizontal className="w-4 h-4 text-emerald-700" />
                <span>Filters &amp; Refinements:</span>
                <span className="text-slate-400 font-normal">
                  Showing {filteredPapers.length} of {data.papers.length} papers
                </span>
              </div>

              {/* Text search within current results */}
              <div className="relative w-full md:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={filterText}
                  onChange={e => {
                    setFilterText(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Filter by keyword / author..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5 pt-1">
              {/* Category Filter */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={e => {
                    setSelectedCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full text-xs py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-emerald-600"
                >
                  <option value="All">All Categories</option>
                  {Object.keys(data.analytics.by_category).map(cat => (
                    <option key={cat} value={cat}>
                      {cat} ({data.analytics.by_category[cat]})
                    </option>
                  ))}
                </select>
              </div>

              {/* Source Filter */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Database Source
                </label>
                <select
                  value={selectedSource}
                  onChange={e => {
                    setSelectedSource(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full text-xs py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-emerald-600"
                >
                  <option value="All">All Sources</option>
                  {Object.keys(data.analytics.by_source).map(src => (
                    <option key={src} value={src}>
                      {src} ({data.analytics.by_source[src]})
                    </option>
                  ))}
                </select>
              </div>

              {/* Year Filter */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Publication Year
                </label>
                <select
                  value={selectedYear}
                  onChange={e => {
                    setSelectedYear(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full text-xs py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-emerald-600"
                >
                  <option value="All">All Years</option>
                  {yearEntries.map(e => (
                    <option key={e.year} value={e.year}>
                      {e.year} ({e.count})
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Sort Order
                </label>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="w-full text-xs py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-emerald-600"
                >
                  <option value="relevance">Most Relevant</option>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="citations">Most Cited</option>
                </select>
              </div>

              {/* Open Access Toggle */}
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => {
                    setOnlyOpenAccess(!onlyOpenAccess);
                    setCurrentPage(1);
                  }}
                  className={`w-full py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    onlyOpenAccess
                      ? 'bg-teal-50 border-teal-400 text-teal-900 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Award className="w-3.5 h-3.5 text-teal-600" />
                  <span>Open Access Only</span>
                </button>
              </div>
            </div>
          </div>

          {/* Phase 7: Research Paper List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-black text-lg text-slate-900">
                Scholarly Papers ({filteredPapers.length})
              </h3>
              <span className="text-xs text-slate-500">
                Page {currentPage} of {totalPages}
              </span>
            </div>

            {paginatedPapers.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {paginatedPapers.map(paper => {
                  const isExpanded = expandedPaperIds.has(paper.id);
                  return (
                    <div
                      key={paper.id}
                      className="bg-white rounded-2xl p-5 border border-slate-200/90 hover:border-emerald-500/40 shadow-xs hover:shadow-md transition-all space-y-3 group"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          {/* Badges Row */}
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            {/* Source Badge */}
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-300">
                              {paper.source}
                            </span>

                            {/* Category Badge */}
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200">
                              {paper.research_type}
                            </span>

                            {/* Open Access Badge */}
                            {paper.open_access && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 flex items-center gap-1">
                                <Award className="w-3 h-3 text-teal-600" />
                                Open Access
                              </span>
                            )}

                            {/* Publication Year */}
                            {paper.publication_year && (
                              <span className="text-[10px] font-mono text-slate-500 font-bold">
                                {paper.publication_year}
                              </span>
                            )}

                            {/* Citations Count */}
                            {paper.citation_count > 0 && (
                              <span className="text-[10px] font-mono text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                {paper.citation_count} Citations
                              </span>
                            )}
                          </div>

                          {/* Paper Title */}
                          <h4 className="font-heading font-black text-base text-slate-900 group-hover:text-emerald-950 transition-colors leading-snug">
                            {paper.title}
                          </h4>

                          {/* Authors & Journal */}
                          <p className="text-xs text-slate-600 mt-1">
                            <span className="font-medium text-slate-800">
                              {paper.authors && paper.authors.length > 0
                                ? paper.authors.join(', ')
                                : 'Authors not available'}
                            </span>
                            {paper.journal && (
                              <>
                                <span className="mx-1.5 text-slate-300">·</span>
                                <span className="italic text-slate-700 font-medium">{paper.journal}</span>
                              </>
                            )}
                          </p>
                        </div>

                        {/* View Links */}
                        <div className="flex sm:flex-col gap-2 shrink-0">
                          {paper.doi ? (
                            <a
                              href={`https://doi.org/${paper.doi}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-300 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                            >
                              <span>View Paper</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          ) : paper.source_url ? (
                            <a
                              href={paper.source_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-300 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                            >
                              <span>View Source</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          ) : null}

                          {paper.pdf_url && (
                            <a
                              href={paper.pdf_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-900 text-xs font-bold border border-teal-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                              <span>Free PDF</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Abstract */}
                      {paper.abstract ? (
                        <div className="pt-2 border-t border-slate-100">
                          <p className={`text-xs text-slate-600 leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
                            {paper.abstract}
                          </p>
                          {paper.abstract.length > 160 && (
                            <button
                              onClick={() => toggleAbstract(paper.id)}
                              className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 mt-1 flex items-center gap-1 cursor-pointer"
                            >
                              <span>{isExpanded ? 'Show less' : 'Read full abstract'}</span>
                              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                          )}
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-100">
                          Abstract not provided by repository.
                        </p>
                      )}

                      {/* Identifiers Footer */}
                      <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-1 font-mono">
                        <div className="flex items-center gap-3">
                          {paper.doi && (
                            <span>
                              DOI: <strong className="text-slate-600">{paper.doi}</strong>
                            </span>
                          )}
                          {paper.pmid && (
                            <span>
                              PMID: <strong className="text-slate-600">{paper.pmid}</strong>
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Relevance Score: {paper.relevance_score || 100}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-2">
                <FileText className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="font-heading font-bold text-base text-slate-800">No matching papers found</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Try adjusting your filter criteria or clear the year and category selections to see all retrieved publications.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setSelectedSource('All');
                    setSelectedYear('All');
                    setOnlyOpenAccess(false);
                    setFilterText('');
                  }}
                  className="mt-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl hover:bg-emerald-100"
                >
                  Reset All Filters
                </button>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                >
                  Previous
                </button>
                <span className="text-xs font-mono font-bold text-slate-600 px-3">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
