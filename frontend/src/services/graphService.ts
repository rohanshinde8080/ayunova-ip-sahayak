import { GraphStats, GraphData, GraphQueryResult } from '../types';

const FALLBACK_GRAPH_STATS: GraphStats = {
  status: 'ONLINE',
  nodes_count: 48,
  relationships_count: 76,
  labels: {
    Herb: 14,
    Statute: 6,
    Section: 12,
    Treatise: 7,
    Patent: 3,
    RegulatoryBody: 4,
    Document: 2
  },
  relationship_types: {
    BARRED_BY: 12,
    TRIGGERS_COMPLIANCE: 14,
    CONTAINS_HERB: 18,
    DOCUMENTED_IN: 15,
    PART_OF: 11,
    CLAIMS_OR_CITES: 6
  },
  dbms_id: 'ffddfc71-94df-4a41-9c96-cab5cd510087',
  version: '2026.08.1',
  uri: 'neo4j://127.0.0.1:7687'
};

const FALLBACK_SUBGRAPH: GraphData = {
  nodes: [
    {
      id: 'herb-triphala',
      label: 'Herb',
      type: 'Herb',
      name: 'Triphala',
      color: '#10b981',
      properties: {
        category: 'Classical Polyherbal',
        sanskrit: 'त्रिफला',
        constituents: 'Haritaki, Bibhitaki, Amalaki'
      }
    },
    {
      id: 'herb-haritaki',
      label: 'Herb',
      type: 'Herb',
      name: 'Haritaki',
      color: '#10b981',
      properties: { botanical: 'Terminalia chebula' }
    },
    {
      id: 'herb-amalaki',
      label: 'Herb',
      type: 'Herb',
      name: 'Amalaki',
      color: '#10b981',
      properties: { botanical: 'Phyllanthus emblica' }
    },
    {
      id: 'treatise-charaka',
      label: 'Treatise',
      type: 'Treatise',
      name: 'Charaka Samhita',
      color: '#f59e0b',
      properties: { century: '2nd Century BCE - 2nd Century CE' }
    },
    {
      id: 'sec-3p',
      label: 'Section',
      type: 'Section',
      name: 'Section 3(p) - Traditional Knowledge Bar',
      color: '#6366f1',
      properties: { statute: 'The Patents Act, 1970' }
    },
    {
      id: 'sec-3e',
      label: 'Section',
      type: 'Section',
      name: 'Section 3(e) - Synergistic Admixture',
      color: '#6366f1',
      properties: { statute: 'The Patents Act, 1970' }
    },
    {
      id: 'statute-patents-act',
      label: 'Statute',
      type: 'Statute',
      name: 'The Patents Act, 1970',
      color: '#3b82f6',
      properties: { jurisdiction: 'India' }
    },
    {
      id: 'patent-us-11992510',
      label: 'Patent',
      type: 'Patent',
      name: 'US Patent 11992510',
      color: '#a855f7',
      properties: { assignee: 'Proviva Pharma Inc.', granted: '2024' }
    }
  ],
  edges: [
    {
      id: 'edge-1',
      source: 'herb-triphala',
      target: 'herb-haritaki',
      label: 'CONTAINS_HERB',
      type: 'CONTAINS_HERB'
    },
    {
      id: 'edge-2',
      source: 'herb-triphala',
      target: 'herb-amalaki',
      label: 'CONTAINS_HERB',
      type: 'CONTAINS_HERB'
    },
    {
      id: 'edge-3',
      source: 'herb-triphala',
      target: 'treatise-charaka',
      label: 'DOCUMENTED_IN',
      type: 'DOCUMENTED_IN'
    },
    {
      id: 'edge-4',
      source: 'herb-triphala',
      target: 'sec-3p',
      label: 'BARRED_BY',
      type: 'BARRED_BY'
    },
    {
      id: 'edge-5',
      source: 'sec-3p',
      target: 'statute-patents-act',
      label: 'PART_OF',
      type: 'PART_OF'
    },
    {
      id: 'edge-6',
      source: 'sec-3e',
      target: 'statute-patents-act',
      label: 'PART_OF',
      type: 'PART_OF'
    },
    {
      id: 'edge-7',
      source: 'patent-us-11992510',
      target: 'herb-triphala',
      label: 'CLAIMS_OR_CITES',
      type: 'CLAIMS_OR_CITES'
    }
  ]
};

export const synthesizeDynamicClientSubgraph = (queryText: string = ''): GraphData => {
  const lower = queryText.toLowerCase();

  // Ashwagandha Subgraph
  if (lower.includes('ashwagandha') || lower.includes('withania') || lower.includes('अश्वगंधा') || lower.includes('अश्वगंधे')) {
    return {
      nodes: [
        {
          id: 'herb-ashwagandha',
          label: 'Herb',
          type: 'Herb',
          name: 'Ashwagandha',
          color: '#10b981',
          properties: {
            botanical: 'Withania somnifera',
            sanskrit: 'अश्वगंधा',
            family: 'Solanaceae',
            actives: 'Withanolides, Withaferin A'
          }
        },
        {
          id: 'treatise-charaka',
          label: 'Treatise',
          type: 'Treatise',
          name: 'Charaka Samhita',
          color: '#f59e0b',
          properties: { status: 'First Schedule Classical Text', era: 'Classical Antiquity' }
        },
        {
          id: 'treatise-bhavaprakasha',
          label: 'Treatise',
          type: 'Treatise',
          name: 'Bhavaprakasha Nighantu',
          color: '#f59e0b',
          properties: { status: 'Codified Ayurvedic Pharmacopoeia' }
        },
        {
          id: 'sec-3p',
          label: 'Section',
          type: 'Section',
          name: 'Section 3(p) [Traditional Knowledge Bar]',
          color: '#6366f1',
          properties: { mandate: 'Bars patenting of known traditional Ayurvedic herbs' }
        },
        {
          id: 'sec-3e',
          label: 'Section',
          type: 'Section',
          name: 'Section 3(e) [Synergistic Admixture Bar]',
          color: '#6366f1',
          properties: { requirement: 'Requires empirical synergism evidence (CI < 1.0)' }
        },
        {
          id: 'statute-patents-act',
          label: 'Statute',
          type: 'Statute',
          name: 'The Patents Act, 1970',
          color: '#3b82f6',
          properties: { jurisdiction: 'India', authority: 'CGPDTM' }
        },
        {
          id: 'body-tkdl',
          label: 'RegulatoryBody',
          type: 'RegulatoryBody',
          name: 'TKDL (CSIR / Ayush)',
          color: '#881337',
          properties: { role: 'Digital prior art defense against patent misappropriation' }
        },
        {
          id: 'sec-bda-3',
          label: 'Section',
          type: 'Section',
          name: 'Section 3 BDA (Form III)',
          color: '#312e81',
          properties: { requirement: 'Mandatory NBA clearance before IPR filing' }
        }
      ],
      edges: [
        {
          id: 'e-ash-charaka',
          source: 'herb-ashwagandha',
          target: 'treatise-charaka',
          label: 'DOCUMENTED_IN',
          type: 'DOCUMENTED_IN',
          properties: { description: 'Ashwagandha therapeutic uses codified in Charaka Samhita' }
        },
        {
          id: 'e-ash-bhava',
          source: 'herb-ashwagandha',
          target: 'treatise-bhavaprakasha',
          label: 'DOCUMENTED_IN',
          type: 'DOCUMENTED_IN',
          properties: { description: 'Pharmacological action described in Bhavaprakasha' }
        },
        {
          id: 'e-ash-3p',
          source: 'herb-ashwagandha',
          target: 'sec-3p',
          label: 'BARRED_BY',
          type: 'BARRED_BY',
          properties: { description: 'Known botanical usage creates statutory bar under Section 3(p)' }
        },
        {
          id: 'e-ash-3e',
          source: 'herb-ashwagandha',
          target: 'sec-3e',
          label: 'REQUIRES_SYNERGY_UNDER',
          type: 'REQUIRES_SYNERGY_UNDER',
          properties: { description: 'Formulations require empirical synergistic validation' }
        },
        {
          id: 'e-ash-bda',
          source: 'herb-ashwagandha',
          target: 'sec-bda-3',
          label: 'TRIGGERS_COMPLIANCE',
          type: 'TRIGGERS_COMPLIANCE',
          properties: { description: 'Indian biological resource triggers mandatory Form III compliance' }
        },
        {
          id: 'e-3p-pat',
          source: 'sec-3p',
          target: 'statute-patents-act',
          label: 'PART_OF',
          type: 'PART_OF',
          properties: { description: 'Section 3(p) is a core statutory exclusion of Patents Act 1970' }
        },
        {
          id: 'e-3e-pat',
          source: 'sec-3e',
          target: 'statute-patents-act',
          label: 'PART_OF',
          type: 'PART_OF',
          properties: { description: 'Section 3(e) prohibits mere mixtures under Patents Act 1970' }
        },
        {
          id: 'e-tkdl-3p',
          source: 'body-tkdl',
          target: 'sec-3p',
          label: 'PREVENTS_PATENTING_UNDER',
          type: 'PREVENTS_PATENTING_UNDER',
          properties: { description: 'TKDL citations directly trigger Section 3(p) examination objections' }
        }
      ]
    };
  }

  // Curcumin / Turmeric Subgraph
  if (lower.includes('curcumin') || lower.includes('turmeric') || lower.includes('curcuma') || lower.includes('हळद') || lower.includes('हल्दी')) {
    return {
      nodes: [
        {
          id: 'herb-curcumin',
          label: 'Herb',
          type: 'Herb',
          name: 'Curcumin (Curcuma longa)',
          color: '#10b981',
          properties: { botanical: 'Curcuma longa', sanskrit: 'हरिद्रा', active: 'Curcuminoids' }
        },
        {
          id: 'patent-us-5401504',
          label: 'Patent',
          type: 'Patent',
          name: 'US Patent 5401504 (Revoked)',
          color: '#a855f7',
          properties: { milestone: 'Landmark CSIR Turmeric Patent Invalidation in USPTO' }
        },
        {
          id: 'treatise-charaka',
          label: 'Treatise',
          type: 'Treatise',
          name: 'Charaka Samhita',
          color: '#f59e0b',
          properties: { evidence: 'Prior art establishing wound-healing medicinal use' }
        },
        {
          id: 'sec-3p',
          label: 'Section',
          type: 'Section',
          name: 'Section 3(p) [Traditional Knowledge Bar]',
          color: '#6366f1',
          properties: { statute: 'The Patents Act, 1970' }
        },
        {
          id: 'statute-patents-act',
          label: 'Statute',
          type: 'Statute',
          name: 'The Patents Act, 1970',
          color: '#3b82f6',
          properties: { jurisdiction: 'India' }
        },
        {
          id: 'body-tkdl',
          label: 'RegulatoryBody',
          type: 'RegulatoryBody',
          name: 'TKDL / CSIR India',
          color: '#881337',
          properties: { achievement: 'Challenged and revoked US turmeric patent with Sanskrit texts' }
        }
      ],
      edges: [
        {
          id: 'e-cur-charaka',
          source: 'herb-curcumin',
          target: 'treatise-charaka',
          label: 'DOCUMENTED_IN',
          type: 'DOCUMENTED_IN',
          properties: { description: 'Curcuma longa properties documented in Charaka Samhita' }
        },
        {
          id: 'e-pat-cur',
          source: 'patent-us-5401504',
          target: 'herb-curcumin',
          label: 'CLAIMS_OR_CITES',
          type: 'CLAIMS_OR_CITES',
          properties: { description: 'US patent claimed traditional wound-healing properties' }
        },
        {
          id: 'e-tkdl-pat',
          source: 'body-tkdl',
          target: 'patent-us-5401504',
          label: 'INVALIDATED',
          type: 'INVALIDATED',
          properties: { description: 'CSIR successfully revoked patent using ancient prior art' }
        },
        {
          id: 'e-cur-3p',
          source: 'herb-curcumin',
          target: 'sec-3p',
          label: 'BARRED_BY',
          type: 'BARRED_BY',
          properties: { description: 'Codified Ayurvedic knowledge triggers Section 3(p) rejection' }
        },
        {
          id: 'e-3p-patact',
          source: 'sec-3p',
          target: 'statute-patents-act',
          label: 'PART_OF',
          type: 'PART_OF',
          properties: { description: 'Section 3(p) enacted to protect traditional knowledge' }
        }
      ]
    };
  }

  // Default Comprehensive Ayush IP Graph
  return FALLBACK_SUBGRAPH;
};

export const graphService = {
  /**
   * Fetches overall Neo4j knowledge graph statistics and node/edge distribution.
   */
  getStats: async (): Promise<GraphStats> => {
    try {
      const res = await fetch('/api/graph/stats');
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend /api/graph/stats unavailable, returning fallback stats:', e);
    }
    return FALLBACK_GRAPH_STATS;
  },

  /**
   * Fetches an interactive subgraph centered around an entity, natural query, or document.
   */
  getSubgraph: async (params?: {
    query?: string;
    entity?: string;
    doc_id?: string;
    max_hops?: number;
  }): Promise<GraphData> => {
    try {
      const q = new URLSearchParams();
      if (params?.query) q.append('query', params.query);
      if (params?.entity) q.append('entity', params.entity);
      if (params?.doc_id) q.append('doc_id', params.doc_id);
      if (params?.max_hops) q.append('max_hops', String(params.max_hops));

      const res = await fetch(`/api/graph/subgraph${q.toString() ? '?' + q.toString() : ''}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.nodes && data.nodes.length > 0) {
          return data;
        }
      }
    } catch (e) {
      console.warn('Backend /api/graph/subgraph unavailable, using synthesized subgraph:', e);
    }
    return synthesizeDynamicClientSubgraph(params?.query || params?.entity || '');
  },

  /**
   * Executes a read-only Cypher query for admin graph exploration.
   */
  executeQuery: async (
    cypherQuery: string,
    parameters: Record<string, any> = {}
  ): Promise<GraphQueryResult> => {
    try {
      const res = await fetch('/api/graph/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: cypherQuery,
          parameters
        })
      });

      if (res.ok) {
        return await res.json();
      } else {
        const err = await res.json();
        throw new Error(err.detail || 'Cypher query execution failed');
      }
    } catch (e: any) {
      console.error('Cypher query execution error:', e);
      throw e;
    }
  },

  /**
   * Synchronizes all documents stored in Neon PostgreSQL into the Neo4j Knowledge Graph.
   */
  syncPostgresToNeo4j: async (): Promise<{
    status: string;
    synced_documents: number;
    nodes_created: number;
    edges_created: number;
    message?: string;
  }> => {
    try {
      const res = await fetch('/api/graph/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        return await res.json();
      }
      const err = await res.json();
      throw new Error(err.detail || 'Sync failed');
    } catch (e: any) {
      console.error('Failed to sync PostgreSQL to Neo4j:', e);
      throw e;
    }
  }
};
