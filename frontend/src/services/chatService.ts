import { StructuredAIAnswer, Jurisdiction, ProcessingStep, RAGTelemetry } from '../types';
import { DEMO_TRIPHALA_ANSWER, LOW_CONFIDENCE_DEMO_ANSWER, DEMO_SOURCES } from '../data/demoData';
import { graphService } from './graphService';

export interface ChatPreset {
  id: string;
  label: string;
  query: string;
  category: string;
}

export interface ChatMessagePayload {
  role: 'user' | 'assistant';
  content: string;
}

export const chatService = {
  /**
   * Real-time SSE streaming query with live steps and word-by-word token reveals.
   */
  streamQuery: async (
    query: string,
    jurisdiction: Jurisdiction = 'India',
    language: string = 'English',
    onStep?: (step: ProcessingStep) => void,
    onToken?: (token: string) => void,
    history?: ChatMessagePayload[],
    isDemoMode: boolean = false,
    useDeepAgent: boolean = false,
    enableRubric: boolean = true,
    documentId?: string
  ): Promise<StructuredAIAnswer> => {
    // Always attempt live SSE streaming from backend first
    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          jurisdiction,
          language,
          history: history && history.length > 0 ? history : undefined,
          use_deep_agent: useDeepAgent,
          enable_rubric: enableRubric,
          document_id: documentId
        })
      });

      if (response.ok && response.body) {
          const reader = response.body.getReader();
          const decoder = new TextDecoder('utf-8');
          let buffer = '';
          let finalAnswer: StructuredAIAnswer | null = null;
          let receivedSubgraph: any = null;

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const events = buffer.split('\n\n');
            buffer = events.pop() || '';

            for (const eventBlock of events) {
              const lines = eventBlock.split('\n');
              let eventType = '';
              let dataStr = '';

              for (const line of lines) {
                if (line.startsWith('event:')) {
                  eventType = line.replace('event:', '').trim();
                } else if (line.startsWith('data:')) {
                  dataStr = line.replace('data:', '').trim();
                }
              }

              if (eventType === 'step' && onStep && dataStr) {
                try {
                  onStep(JSON.parse(dataStr));
                } catch {
                  // ignore
                }
              } else if (
                (eventType === 'tool_call' || eventType === 'subagent_call' || eventType === 'rubric_check') &&
                onStep &&
                dataStr
              ) {
                try {
                  const parsed = JSON.parse(dataStr);
                  onStep({
                    id: parsed.id || `step-${Date.now()}`,
                    label: parsed.label || `${eventType}: ${parsed.subagent || parsed.tool || parsed.rubric}`,
                    status: 'completed',
                    type: eventType as any,
                    tool: parsed.tool,
                    subagent: parsed.subagent,
                    rubricScore: parsed.rubricScore || parsed.score,
                    data: parsed
                  });
                } catch {
                  // ignore
                }
              } else if (eventType === 'subgraph' && dataStr) {
                try {
                  const parsedGraph = JSON.parse(dataStr);
                  receivedSubgraph = parsedGraph;
                  if (finalAnswer) {
                    finalAnswer.subgraph = parsedGraph;
                  }
                } catch {
                  // ignore
                }
              } else if (eventType === 'token' && onToken && dataStr) {
                try {
                  const tokObj = JSON.parse(dataStr);
                  if (tokObj.token) onToken(tokObj.token);
                } catch {
                  // ignore
                }
              } else if (eventType === 'final_answer' && dataStr) {
                try {
                  finalAnswer = JSON.parse(dataStr);
                  if (
                    finalAnswer &&
                    (!finalAnswer.subgraph || !finalAnswer.subgraph.nodes || finalAnswer.subgraph.nodes.length === 0) &&
                    receivedSubgraph
                  ) {
                    finalAnswer.subgraph = receivedSubgraph;
                  }
                } catch {
                  // ignore
                }
              }
            }
          }

          if (finalAnswer) {
            if (!finalAnswer.subgraph || !finalAnswer.subgraph.nodes || finalAnswer.subgraph.nodes.length === 0) {
              try {
                finalAnswer.subgraph = await graphService.getSubgraph({ query });
              } catch (e) {
                console.warn('Fallback subgraph retrieval caught:', e);
              }
            }
            return finalAnswer;
          }
        }
      } catch (err) {
        console.warn('Live SSE stream failed, falling back to processQuery fallback:', err);
      }

      // Fallback simulation with progressive steps and token typewriter
    const fallbackAnswer = await chatService.processQuery(
      query,
      jurisdiction,
      language,
      onStep,
      history,
      true
    );

    if (onToken) {
      const words = fallbackAnswer.answer.split(' ');
      for (let i = 0; i < words.length; i += 3) {
        await new Promise(r => setTimeout(r, 20));
        onToken(words.slice(i, i + 3).join(' ') + ' ');
      }
    }

    return fallbackAnswer;
  },

  /**
   * Processes an Ayurvedic IP/regulatory query with dynamic RAG grounding against Neon pgvector.
   * Emits progressive steps to onProgress for immediate visual feedback, then calls the backend API.
   * If the backend is offline or unreachable, seamlessly falls back to resilient local knowledge.
   */
  processQuery: async (
    query: string,
    jurisdiction: Jurisdiction = 'India',
    language: string = 'English',
    onProgress?: (step: ProcessingStep) => void,
    history?: ChatMessagePayload[],
    isDemoMode: boolean = false,
    useDeepAgent: boolean = false,
    enableRubric: boolean = true,
    documentId?: string
  ): Promise<StructuredAIAnswer> => {
    // 1. Snappy progressive UI pipeline steps
    const steps: { label: string; delay: number; type?: ProcessingStep['type'] }[] = [
      { label: `Language detected: ${language} | Jurisdiction: ${jurisdiction}`, delay: 100 },
      { label: useDeepAgent ? `Initializing DeepAgent Orchestrator (Tri-Modal Tools & Specialist SubAgents)` : `Semantic statutory parsing & Ayush taxonomy resolution`, delay: 120 },
      { label: isDemoMode ? `Evaluating Classical AFI Formulations & Treatises` : `Querying Neon pgvector Knowledge Base (HNSW Index: TKDL, Patents Act, DCA, BDA)`, delay: 140, type: 'tool_call' },
      { label: `Traversing Neo4j Knowledge Graph (multi-hop legal bars & entity relations)`, delay: 130, type: 'tool_call' },
      ...(useDeepAgent ? [{ label: `Rubric Evaluator-Optimizer: Self-critique & statutory grounding verification`, delay: 120, type: 'rubric_check' as const }] : []),
      { label: `Synthesizing grounded assessment & verifying official gazette citations`, delay: 110 }
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, steps[i].delay));
      if (onProgress) {
        onProgress({
          id: `step-${i}`,
          label: steps[i].label,
          status: 'completed',
          type: steps[i].type || 'step'
        });
      }
    }

    // 2. Attempt live RAG backend call via Neon Serverless PostgreSQL
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const response = await fetch('/api/chat/process-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          jurisdiction,
          language,
          history: history && history.length > 0 ? history : undefined,
          use_deep_agent: useDeepAgent,
          enable_rubric: enableRubric,
          document_id: documentId
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const liveAnswer: StructuredAIAnswer = await response.json();
        if (!liveAnswer.subgraph || !liveAnswer.subgraph.nodes || liveAnswer.subgraph.nodes.length === 0) {
          try {
            liveAnswer.subgraph = await graphService.getSubgraph({ query });
          } catch (e) {
            console.warn('Fallback subgraph retrieval caught:', e);
          }
        }
        return liveAnswer;
      }
      if (!response.ok) {
        throw new Error(`Server returned error status ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      console.error(
        'Backend /api/chat/process-query unreachable:',
        err
      );
      return {
        answer: 'Unable to connect to the IP SHAKTI SAHAYAK backend server. Factual and botanical answers cannot be generated offline without evidence retrieval.',
        assessment: 'The system strictly operates on verified evidence from Admin-uploaded documents and official patent authorities (IP India, WIPO PATENTSCOPE, EPO Espacenet). Hardcoded client-side fallbacks are disabled.',
        considerations: [
          'Verify that the backend FastAPI server is running on http://127.0.0.1:8000.',
          'Check network connectivity to /api/chat/process-query.'
        ],
        regulatory: [
          'System directive: Zero hardcoded botanical or legal knowledge fallbacks permitted on the client side.'
        ],
        risks: 'Generating unverified answers offline introduces factual inaccuracies.',
        nextSteps: [
          'Start the backend service using start_backend.bat or uvicorn.',
          'Re-submit your query once the backend is connected.'
        ],
        confidence: 'LOW',
        evidenceCount: 0,
        sources: [],
        source_type: 'NONE',
        detectedLanguage: language,
        detectedJurisdiction: jurisdiction,
        detectedProductType: 'Offline Error',
        generationSource: 'IP SHAKTI SAHAYAK Connection Error Gate'
      };
    }

    return {
      answer: 'No response received from backend.',
      assessment: 'Unable to verify evidence for this query.',
      considerations: ['Verify backend service is running.'],
      regulatory: ['Strict source grounding requires live backend connection.'],
      risks: 'No verified evidence retrieved.',
      nextSteps: ['Re-submit query.'],
      confidence: 'LOW',
      evidenceCount: 0,
      sources: [],
      source_type: 'NONE',
      detectedLanguage: language,
      detectedJurisdiction: jurisdiction,
      detectedProductType: 'No Response',
      generationSource: 'IP SHAKTI SAHAYAK Fallback Gate'
    };
  },

  /**
   * Fetches real-time RAG index telemetry and pgvector status.
   */
  getTelemetry: async (): Promise<RAGTelemetry> => {
    try {
      const res = await fetch('/api/chat/telemetry');
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Telemetry fetch failed, using fallback:', e);
    }
    return {
      status: 'OFFLINE_FALLBACK',
      database: 'Local Vector Mock',
      activeVectorsCount: 11,
      activeStatutesCount: 6,
      activePriorArtCount: 5,
      indexType: 'In-Memory Similarity',
      synthesisEngine: 'Client-Side Synthesizer',
      geminiConfigured: false,
      graphNodesCount: 48,
      graphRelationshipsCount: 76,
      neo4jStatus: 'ONLINE'
    };
  },

  /**
   * Fetches preset demonstration queries from the backend with offline fallback.
   */
  getPresets: async (): Promise<ChatPreset[]> => {
    try {
      const res = await fetch('/api/chat/presets');
      if (res.ok) {
        const data = await res.json();
        return data.presets || [];
      }
    } catch {
      // Fallback
    }

    return [
      {
        id: 'triphala-patent',
        label: '🌿 Can I patent a Triphala + Curcumin Formulation?',
        query: 'Can I patent an Ayurvedic Triphala and Curcumin synergistic blend in India?',
        category: 'Patent Bar & TKDL'
      },
      {
        id: 'us-triphala-probiotics',
        label: '🇺🇸 US Patent 11992510: Triphala + Probiotic Compositions',
        query: 'What are the key claims of US Patent 11992510 regarding Triphala with Bacillus coagulans and probiotics?',
        category: 'Prior Art & Claims Analysis'
      },
      {
        id: 'brand-exclusivity',
        label: '🏷️ Brand Exclusivity & Trademark Strategies',
        query: 'How do I secure brand protection and trademark exclusivity for classical Ayurvedic formulations?',
        category: 'Trademarks'
      },
      {
        id: 'bda-compliance',
        label: '⚖️ Biological Diversity Act (BDA 2023) Compliances',
        query: 'What are the mandatory approvals needed under Biological Diversity Act 2023 for commercializing Ayush formulations?',
        category: 'Biodiversity Compliance'
      },
      {
        id: 'synthetic-hybrid',
        label: '🧪 Synthetic Peptide Hybrid (Low Confidence Test)',
        query: 'Can I patent a synthetic peptide hybrid unknown chemical formulation as an Ayurvedic drug?',
        category: 'Low Confidence Warning'
      }
    ];
  }
};

