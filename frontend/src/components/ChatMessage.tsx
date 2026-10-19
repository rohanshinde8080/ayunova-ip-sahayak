import React, { useState } from 'react';
import { ChatMessageItem, SourceCitation } from '../types';
import {
  Brain,
  FileCheck2,
  AlertTriangle,
  BookOpen,
  UserCheck,
  Sparkles,
  Bot,
  User,
  ShieldCheck,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  Share2,
  Cpu,
  Layers,
  ArrowRight
} from 'lucide-react';
import { ConfidenceBadge } from './ConfidenceBadge';
import { KnowledgeGraphVisualizer } from './KnowledgeGraphVisualizer';
import { MarkdownRenderer } from './MarkdownRenderer';
import { useApp } from '../context/AppContext';

interface ChatMessageProps {
  message: ChatMessageItem;
  onSelectPrompt?: (query: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onSelectPrompt }) => {
  const { setSelectedSource, setIsEscalationOpen, setEscalationDefaultQuery, setActiveAnswerForEvidence, showNotification, t } = useApp();
  const [activeTab, setActiveTab] = useState<'summary' | 'trace' | 'considerations' | 'regulatory' | 'sources' | 'graph'>('summary');
  const [copied, setCopied] = useState(false);

  // Handle User Message
  if (message.sender === 'user') {
    return (
      <div className="flex justify-end gap-3 my-4 animate-fade-in group">
        <div className="max-w-2xl bg-gradient-to-r from-emerald-800 to-emerald-700 text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm text-xs sm:text-sm leading-relaxed border border-emerald-600/30">
          {message.text}
        </div>
        <div className="w-8 h-8 rounded-full bg-emerald-900 text-emerald-100 flex items-center justify-center text-xs font-bold shrink-0 shadow-sm border border-emerald-700/50">
          <User className="w-4 h-4" />
        </div>
      </div>
    );
  }

  // Handle Streaming State (Live Typing Effect)
  if (message.isStreaming) {
    return (
      <div className="flex gap-3 my-4 animate-fade-in">
        <div className="w-8 h-8 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0 shadow-md border border-emerald-500/30">
          <Bot className="w-4 h-4 animate-pulse" />
        </div>
        <div className="max-w-3xl flex-1 bg-white border border-emerald-300/80 rounded-2xl rounded-tl-sm p-4 text-xs sm:text-sm text-slate-800 shadow-sm leading-relaxed">
          <div className="flex items-center gap-2 mb-2 text-emerald-800 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
            <span>{t('assistant.generating', 'Generating Grounded Statutory Assessment...')}</span>
          </div>
          <div className="text-slate-800 whitespace-pre-wrap font-sans leading-relaxed">
            {message.streamedText || 'Analyzing statutes against Neon pgvector...'}
            <span className="inline-block w-2 h-4 ml-1 bg-emerald-600 animate-pulse align-middle" />
          </div>
        </div>
      </div>
    );
  }

  const ans = message.structuredResponse;

  if (!ans) {
    return (
      <div className="flex gap-3 my-4 animate-fade-in">
        <div className="w-8 h-8 rounded-full bg-slate-900 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0 shadow">
          <Bot className="w-4 h-4" />
        </div>
        <div className="max-w-3xl bg-white border border-slate-200 rounded-2xl rounded-tl-sm p-4 text-xs sm:text-sm text-slate-800 shadow-sm leading-relaxed">
          {message.text}
        </div>
      </div>
    );
  }

  const isLowConf = ans.confidence === 'LOW' || message.isLowConfidence;

  const handleCopy = () => {
    const textToCopy = `IP SHAKTI SAHAYAK Legal Assessment:
${ans.answer}

Statutory Assessment:
${ans.assessment}

Sources:
${ans.sources.map(s => `- ${s.title} (${s.authority}, ${s.section})`).join('\n')}`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    showNotification('Legal analysis copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate dynamic follow-up suggestions (strictly capped at <= 2)
  const getFollowUpPrompts = (): string[] => {
    const combined = (ans.answer + ' ' + ans.assessment + ' ' + (message.text || '')).toLowerCase();

    if (combined.includes('11992510') || combined.includes('proviva') || combined.includes('probiotic')) {
      return [
        'How did Proviva Pharma establish non-obviousness over classical TKDL?',
        'Can this probiotic and herbal composition be patented in India under Section 3(e)?'
      ];
    }
    if (combined.includes('3(p)') || combined.includes('triphala') || combined.includes('traditional knowledge')) {
      return [
        'How do I experimentally prove synergistic bioavailability under Section 3(e)?',
        'What are the Form 25D licensing requirements under Rule 158B?'
      ];
    }
    if (combined.includes('brand') || combined.includes('trademark') || combined.includes('trade mark')) {
      return [
        'What classification under Trade Marks Act, 1999 applies to Ayurvedic herb extracts?',
        'Can classical Sanskrit terms like "Triphala" be protected as trademarks?'
      ];
    }
    if (combined.includes('158b') || combined.includes('schedule t') || combined.includes('manufacturing')) {
      return [
        'What safety and heavy metal standardization data is needed for Form 25D?',
        'What are the clinical trial exemptions for classical vs proprietary formulations?'
      ];
    }
    if (combined.includes('biodiversity') || combined.includes('bda') || combined.includes('nba')) {
      return [
        'What are the penalties under Section 12 for non-compliance with NBA approvals?',
        'Does the Biological Diversity Amendment Act 2023 exempt AYUSH practitioners?'
      ];
    }
    return [
      'What are the main statutory hurdles under Section 3(e) regarding synergy?',
      'How does TKDL defense affect international patent filings?'
    ];
  };

  // Strictly capped at <= 2 follow-up suggestions per prompt specification
  const activeFollowUps: string[] = (ans.followUpSuggestions && ans.followUpSuggestions.length > 0)
    ? ans.followUpSuggestions.slice(0, 2)
    : getFollowUpPrompts().slice(0, 2);

  const researchProcessText =
    ans.researchProcess ||
    ans.deepAgentTrace?.researchProcess ||
    'Search → Retrieve → Verify → Compare → Answer';

  return (
    <div className="flex gap-3 my-5 animate-fade-in group">
      <div className="w-8 h-8 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0 shadow-md border border-emerald-600/30">
        <Bot className="w-4 h-4" />
      </div>

      <div className="max-w-3xl flex-1 bg-white border border-slate-200 rounded-2xl rounded-tl-sm shadow-sm overflow-hidden text-xs sm:text-sm transition-all hover:shadow-md">
        {/* Top Header with Confidence, Generation Source & Detection Tags */}
        <div className="p-3.5 sm:p-4 bg-slate-50/80 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <ConfidenceBadge
              confidence={ans.confidence}
              evidenceCount={ans.evidenceCount}
              confidenceMetrics={ans.confidenceMetrics}
              showDetails={true}
            />

            {ans.intent && (
              <span className="text-[11px] bg-emerald-100/80 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                <span>🎯</span>
                <span>{ans.intent}</span>
              </span>
            )}

            {/* Research Process Pill (Clickable toggle to view trace) */}
            <button
              onClick={() => setActiveTab(activeTab === 'trace' ? 'summary' : 'trace')}
              className={`text-[11px] px-2.5 py-0.5 rounded-full font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'trace'
                  ? 'bg-purple-100 text-purple-950 border border-purple-300 font-bold shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
              }`}
              title="Click to toggle autonomous research trace"
            >
              <Cpu className="w-3 h-3 text-purple-600 shrink-0" />
              <span className="hidden sm:inline">{researchProcessText}</span>
              <span className="sm:hidden">Trace</span>
              {ans.deepAgentTrace?.rubricScore !== undefined && (
                <span className="text-[10px] bg-purple-200 text-purple-900 px-1.5 py-0.2 rounded font-mono font-bold">
                  {ans.deepAgentTrace.rubricScore}/100
                </span>
              )}
            </button>

            {ans.detectedJurisdiction && (
              <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium border border-slate-200">
                {ans.detectedJurisdiction}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors flex items-center gap-1 text-[11px]"
              title="Copy legal analysis"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={() => setActiveAnswerForEvidence(ans)}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
              title="Open Grounded Evidence Drawer"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
              <span>{ans.sources.length} {t('assistant.sources', 'Sources')}</span>
            </button>
          </div>
        </div>

        {/* Dynamic Tab Navigation (Supplementary Views) */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50/50 px-4 gap-2 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('summary')}
            className={`py-2.5 px-3 font-semibold border-b-2 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'summary'
                ? 'border-emerald-700 text-emerald-900 bg-white shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Brain className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t('assistant.tabSummary', 'Direct Answer')}</span>
          </button>

          {ans.deepAgentTrace && (
            <button
              onClick={() => setActiveTab('trace')}
              className={`py-2.5 px-3 font-semibold border-b-2 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'trace'
                  ? 'border-purple-600 text-purple-900 bg-white shadow-2xs'
                  : 'border-transparent text-slate-500 hover:text-purple-800'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-purple-600" />
              <span>Multi-Agent Trace</span>
            </button>
          )}

          {ans.subgraph && ans.subgraph.nodes && ans.subgraph.nodes.length > 0 && (
            <button
              onClick={() => setActiveTab('graph')}
              className={`py-2.5 px-3 font-semibold border-b-2 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'graph'
                  ? 'border-indigo-600 text-indigo-900 bg-white shadow-2xs'
                  : 'border-transparent text-indigo-700 hover:text-indigo-900 bg-indigo-50/50'
              }`}
            >
              <Share2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Knowledge Graph ({ans.subgraph.nodes.length})</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </button>
          )}

          {ans.considerations && ans.considerations.length > 0 && (
            <button
              onClick={() => setActiveTab('considerations')}
              className={`py-2.5 px-3 font-semibold border-b-2 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'considerations'
                  ? 'border-emerald-700 text-emerald-900 bg-white shadow-2xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Checklist ({ans.considerations.length})</span>
            </button>
          )}
        </div>

        {/* Tab Content Areas */}
        <div className="p-4 sm:p-5 space-y-4">
          {/* 1. Direct Answer Tab (User-First Markdown Response) */}
          {activeTab === 'summary' && (
            <div className="space-y-4 animate-fade-in">
              {/* Primary User-First Structured Answer */}
              <div className="bg-slate-50/40 p-4 rounded-xl border border-slate-200/80">
                <MarkdownRenderer content={ans.answer} />
              </div>

              {/* Direct Graph RAG Traversal Grounding Banner */}
              {ans.subgraph && ans.subgraph.nodes && ans.subgraph.nodes.length > 0 && (
                <div
                  onClick={() => setActiveTab('graph')}
                  className="p-3 bg-gradient-to-r from-indigo-50/90 via-emerald-50/70 to-slate-50 rounded-xl border border-indigo-200 hover:border-indigo-400 flex items-center justify-between gap-3 text-xs cursor-pointer transition-all shadow-2xs group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                      <Share2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-indigo-950">
                          Graph RAG Grounding Verified: Multi-Hop Traversal
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded font-bold bg-indigo-200 text-indigo-900">
                          {ans.subgraph.nodes.length} Nodes · {ans.subgraph.edges.length} Edges
                        </span>
                      </div>
                      <p className="text-[11px] text-indigo-900/80">
                        Traversed connections between botanical species, classical treatises, and Patents Act Section 3(p)/3(e). Click to inspect interactive graph!
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-indigo-700 font-bold text-[11px] shrink-0 group-hover:text-indigo-950">
                    <span>View Graph ↗</span>
                  </div>
                </div>
              )}

              {/* Assessment Section (if distinct and non-empty) */}
              {ans.assessment && !ans.answer.includes(ans.assessment.slice(0, 40)) && (
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 uppercase tracking-wider text-[10px]">
                    <Brain className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Statutory Cross-Match Notes</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">
                    {ans.assessment}
                  </p>
                </div>
              )}

              {/* Statutory Risks & Limitations */}
              {ans.risks && (
                <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 flex items-start gap-2.5 text-xs text-amber-950">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Statutory Limitations &amp; Caveats: </span>
                    <span>{ans.risks}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. Autonomous Multi-Agent Trace Tab */}
          {activeTab === 'trace' && ans.deepAgentTrace && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-3.5 bg-gradient-to-r from-purple-50 to-indigo-50/60 rounded-xl border border-purple-200/80 space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-purple-200/60">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center shadow-xs">
                      <Cpu className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-purple-950 uppercase tracking-wide">
                        Autonomous Multi-Agent Execution Trace
                      </h4>
                      <p className="text-[11px] text-purple-700">
                        LangChain DeepAgents Orchestration with Tri-Modal Knowledge Retrieval
                      </p>
                    </div>
                  </div>

                  {ans.deepAgentTrace.rubricScore !== undefined && (
                    <div className="flex items-center gap-1.5 bg-white border border-purple-300 px-2.5 py-1 rounded-lg shadow-2xs">
                      <span className="text-amber-500 text-xs">⭐</span>
                      <span className="text-xs font-bold text-slate-800">
                        Rubric Score: {ans.deepAgentTrace.rubricScore}/100
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${ans.deepAgentTrace.rubricPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                        {ans.deepAgentTrace.rubricPassed ? 'PASSED' : 'REVIEW'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Subagents Section */}
                {ans.deepAgentTrace.subagentsCalled && ans.deepAgentTrace.subagentsCalled.length > 0 && (
                  <div>
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Specialist SubAgents Consulted:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {ans.deepAgentTrace.subagentsCalled.map((sub, i) => (
                        <span
                          key={i}
                          className="text-xs bg-purple-100/90 text-purple-900 border border-purple-300/80 px-2.5 py-1 rounded-lg font-medium flex items-center gap-1.5 shadow-2xs"
                        >
                          <Bot className="w-3.5 h-3.5 text-purple-700" />
                          <span>{sub}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tools Section */}
                {ans.deepAgentTrace.toolsQueried && ans.deepAgentTrace.toolsQueried.length > 0 && (
                  <div>
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Tri-Modal Knowledge Tools Queried:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {ans.deepAgentTrace.toolsQueried.map((tool, i) => (
                        <span
                          key={i}
                          className="text-xs bg-white text-slate-800 border border-slate-200 px-2.5 py-1 rounded-lg font-mono text-[11px] flex items-center gap-1.5 shadow-2xs"
                        >
                          <span>{tool.includes('vector') ? '🔵' : tool.includes('graph') ? '🟣' : tool.includes('web') ? '🌐' : '⚖️'}</span>
                          <span>{tool}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Applied Skills */}
                {ans.deepAgentTrace.skillsApplied && ans.deepAgentTrace.skillsApplied.length > 0 && (
                  <div>
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Statutory Skills Playbooks Loaded:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {ans.deepAgentTrace.skillsApplied.map((skill, i) => (
                        <span
                          key={i}
                          className="text-[11px] bg-emerald-50 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded-md font-mono"
                        >
                          📜 {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Live Web Sources from Tavily */}
                {ans.deepAgentTrace.webSources && ans.deepAgentTrace.webSources.length > 0 && (
                  <div>
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Live Web Evidence (Tavily Real-Time Prior Art):
                    </span>
                    <div className="space-y-1.5">
                      {ans.deepAgentTrace.webSources.map((ws, i) => (
                        <a
                          key={i}
                          href={ws.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-start justify-between gap-2 p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 transition-colors group"
                        >
                          <div className="flex-1">
                            <div className="font-semibold text-emerald-900 group-hover:underline flex items-center gap-1">
                              <span>{ws.title}</span>
                              <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-emerald-700 shrink-0" />
                            </div>
                            {ws.content && (
                              <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">
                                {ws.content}
                              </p>
                            )}
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Persistent Portfolio Memory Status */}
                {ans.deepAgentTrace.memoryUpdated && (
                  <div className="flex items-center gap-2 pt-2 border-t border-purple-200/60 text-[11px] text-purple-900">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Research session persisted to <code>/memory/IP_SHAKTI_PORTFOLIO.md</code></span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. Considerations / Checklist Tab */}
          {activeTab === 'considerations' && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                <FileCheck2 className="w-4 h-4 text-emerald-700" />
                <span>Patents Act &amp; Novelty Considerations</span>
              </div>
              <ul className="space-y-2">
                {ans.considerations?.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 p-2.5 bg-slate-50 hover:bg-emerald-50/40 rounded-xl border border-slate-100 transition-colors text-xs sm:text-sm text-slate-700 leading-relaxed">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 4. Interactive Graph Tab */}
          {activeTab === 'graph' && ans.subgraph && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase tracking-wider">
                  <Share2 className="w-4 h-4 text-indigo-600" />
                  <span>Interactive Statutory &amp; Botanical Graph Traversal</span>
                </div>
                <span className="text-[10px] font-mono bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-bold">
                  {ans.subgraph.nodes.length} Nodes · {ans.subgraph.edges.length} Edges
                </span>
              </div>
              <KnowledgeGraphVisualizer
                graph={ans.subgraph}
                height={350}
                title="Grounded Legal Knowledge Subgraph"
                subtitle="Multi-hop citations supporting this specific assessment"
              />
            </div>
          )}

          {/* Low Confidence Escalation Alert */}
          {isLowConf && (
            <div className="p-3.5 bg-red-50 rounded-xl border border-red-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-red-950">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Human Legal Escalation Recommended: </span>
                  <span>Ambiguous botanical extraction claims or non-Ayush chemical elements detected.</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setEscalationDefaultQuery(message.text || ans.answer);
                  setIsEscalationOpen(true);
                }}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shrink-0 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Submit to Facilitator</span>
              </button>
            </div>
          )}

          {/* User-First Follow-Up Suggestions (Strictly Capped at 2) */}
          {activeFollowUps.length > 0 && (
            <div className="pt-3 border-t border-slate-100">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Recommended Next Steps ({activeFollowUps.length})</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 font-normal">
                  Capped at 2 options
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeFollowUps.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSelectPrompt && onSelectPrompt(prompt)}
                    className="text-xs p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-950 transition-all flex items-center justify-between text-left group cursor-pointer shadow-2xs hover:shadow-xs"
                  >
                    <span className="leading-snug pr-2">{prompt}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
