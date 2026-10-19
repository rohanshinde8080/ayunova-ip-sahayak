export interface ResearchPaper {
  id: string;
  herb_name: string;
  scientific_name: string;
  title: string;
  abstract: string | null;
  authors: string[];
  journal: string | null;
  publication_year: number | null;
  doi: string | null;
  pmid: string | null;
  source: 'PubMed' | 'Europe PMC' | 'OpenAlex' | 'Crossref' | string;
  source_id: string | null;
  source_url: string;
  pdf_url: string | null;
  research_type: string;
  keywords: string[];
  open_access: boolean;
  citation_count: number;
  relevance_score: number;
  created_at: string;
  updated_at: string;
}

export interface HerbProfile {
  common_name: string;
  scientific_name: string;
  family: string;
  synonyms: string[];
  phytochemical_markers: string[];
  search_variations: string[];
}

export interface ResearchAnalytics {
  total_papers: number;
  open_access_count: number;
  clinical_studies_count: number;
  recent_papers_count: number;
  by_year: Record<string, number>;
  by_category: Record<string, number>;
  by_source: Record<string, number>;
}

export interface ResearchSearchResponse {
  query: string;
  herb_profile: HerbProfile;
  analytics: ResearchAnalytics;
  papers: ResearchPaper[];
  cached: boolean;
  last_synced_at: string;
}

export interface ResearchSynthesisResponse {
  herb: string;
  scientific_name: string;
  synthesis: string;
  citations: Array<{
    title: string;
    doi: string | null;
    journal: string | null;
    year: number | null;
  }>;
  papers_analyzed: number;
  timestamp: string;
}

export interface AdminResearchStats {
  total_herbs_indexed: number;
  total_papers_indexed: number;
  total_research_papers?: number;
  recent_additions: number;
  duplicates_prevented: number;
  failed_api_requests: number;
  source_breakdown: Record<string, number>;
  sources_breakdown?: Record<string, number>;
  category_breakdown: Record<string, number>;
  categories_breakdown?: Record<string, number>;
  last_sync: string;
  connected_databases?: Array<{
    name: string;
    status: string;
    type: string;
  }>;
  herbs: Array<{
    herb_id?: string;
    herb_name: string;
    scientific_name: string;
    total_papers: number;
    clinical_count?: number;
    open_access_count?: number;
    last_synced_at: string;
  }>;
}

export interface PaperFilterParams {
  year?: number | string;
  category?: string;
  source?: string;
  open_access?: boolean;
  search?: string;
  sort?: 'relevance' | 'newest' | 'oldest' | 'citations';
}
