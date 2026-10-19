import {
  ResearchSearchResponse,
  ResearchPaper,
  ResearchSynthesisResponse,
  AdminResearchStats,
  PaperFilterParams
} from '../types/research';

export const researchService = {
  /**
   * Search for research papers for a medicinal plant/herb.
   * Connects to PubMed, Europe PMC, OpenAlex, and Crossref via FastAPI backend.
   */
  search: async (query: string, refresh = false): Promise<ResearchSearchResponse> => {
    const params = new URLSearchParams({ query });
    if (refresh) params.append('refresh', 'true');
    const res = await fetch(`/api/research/search?${params.toString()}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to search research papers' }));
      throw new Error(err.detail || 'Failed to search research papers');
    }
    return res.json();
  },

  /**
   * Get research summary and analytics for a herb.
   */
  getSummary: async (herb: string): Promise<{
    herb: string;
    scientific_name: string;
    synonyms: string[];
    analytics: any;
    last_synced_at: string;
  }> => {
    const res = await fetch(`/api/research/summary/${encodeURIComponent(herb)}`);
    if (!res.ok) {
      throw new Error(`Failed to load research summary for ${herb}`);
    }
    return res.json();
  },

  /**
   * Get filtered research papers for a herb.
   */
  getPapers: async (herb: string, filters?: PaperFilterParams): Promise<{
    herb: string;
    total_papers: number;
    papers: ResearchPaper[];
  }> => {
    const params = new URLSearchParams();
    if (filters?.year) params.append('year', String(filters.year));
    if (filters?.category && filters.category !== 'All') params.append('type', filters.category);
    if (filters?.source && filters.source !== 'All') params.append('source', filters.source);
    if (filters?.open_access !== undefined && filters.open_access) params.append('open_access', 'true');

    const res = await fetch(`/api/research/papers/${encodeURIComponent(herb)}?${params.toString()}`);
    if (!res.ok) {
      throw new Error(`Failed to load papers for ${herb}`);
    }
    return res.json();
  },

  /**
   * Generate an evidence-grounded AI synthesis summarizing key scientific findings with DOI citations.
   */
  synthesize: async (herb: string, papers?: ResearchPaper[]): Promise<ResearchSynthesisResponse> => {
    const res = await fetch('/api/research/synthesize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        herb_name: herb,
        papers: papers ? papers.slice(0, 15) : undefined
      })
    });
    if (!res.ok) {
      throw new Error(`Failed to synthesize research for ${herb}`);
    }
    return res.json();
  },

  /**
   * Trigger forced live sync from scholarly APIs for a herb (used in Admin panel or user refresh).
   */
  syncHerb: async (herb: string): Promise<{
    success: boolean;
    message: string;
    data: ResearchSearchResponse;
  }> => {
    const res = await fetch(`/api/research/sync/${encodeURIComponent(herb)}`, {
      method: 'POST'
    });
    if (!res.ok) {
      throw new Error(`Failed to sync research for ${herb}`);
    }
    return res.json();
  },

  /**
   * Get administrative metrics regarding indexed scholarly papers, sources, and cache health.
   */
  getStats: async (): Promise<AdminResearchStats> => {
    const res = await fetch('/api/research/stats');
    if (!res.ok) {
      throw new Error('Failed to load research admin stats');
    }
    return res.json();
  },

  /**
   * Get list of indexed medicinal plants.
   */
  getIndexedHerbs: async (): Promise<Array<{
    common_name: string;
    scientific_name: string;
    family: string;
    synonyms: string[];
    paper_count: number;
  }>> => {
    const res = await fetch('/api/research/herbs');
    if (!res.ok) {
      throw new Error('Failed to load indexed herbs');
    }
    return res.json();
  }
};
