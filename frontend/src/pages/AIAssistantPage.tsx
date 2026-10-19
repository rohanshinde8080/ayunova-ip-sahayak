import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  Mic,
  MicOff,
  Database,
  Activity,
  X,
  Zap
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ChatMessageItem, ProcessingStep, StructuredAIAnswer, RAGTelemetry } from '../types';
import { chatService, ChatMessagePayload, ChatPreset } from '../services/chatService';
import { ChatMessage } from '../components/ChatMessage';
import { ProcessingPipeline } from '../components/ProcessingPipeline';
import { DEMO_TRIPHALA_ANSWER } from '../data/demoData';
import { AssistantToolbar } from '../components/assistant/AssistantToolbar';
import { PresetChips } from '../components/assistant/PresetChips';
import { EvidenceDrawer } from '../components/assistant/EvidenceDrawer';
import { getLanguageEnglishName } from '../i18n/languages';

export const AIAssistantPage: React.FC = () => {
  const {
    language,
    jurisdiction,
    t,
    isDemoMode,
    activeDemoQuery,
    setActiveDemoQuery,
    activeAnswerForEvidence,
    setActiveAnswerForEvidence,
    setIsEscalationOpen,
    setEscalationDefaultQuery,
    showNotification
  } = useApp();

  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [productTypeFilter, setProductTypeFilter] = useState('Auto Detect');
  const [telemetry, setTelemetry] = useState<RAGTelemetry | null>(null);
  const [presets, setPresets] = useState<ChatPreset[]>([]);
  const [showTelemetryModal, setShowTelemetryModal] = useState(false);
  const [evidenceTab, setEvidenceTab] = useState<'citations' | 'patents' | 'graph'>('citations');
  const [useDeepAgent, setUseDeepAgent] = useState<boolean>(true);
  const [enableRubric, setEnableRubric] = useState<boolean>(true);
  const [isEvidenceDrawerOpen, setIsEvidenceDrawerOpen] = useState<boolean>(() => {
    return typeof window !== 'undefined' && window.innerWidth >= 1440;
  });

  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const [availableDocuments, setAvailableDocuments] = useState<{ id: string; title: string; filename?: string }[]>([]);

  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, processingSteps]);

  // Load telemetry, presets, and active documents on mount
  useEffect(() => {
    chatService.getTelemetry().then(t => setTelemetry(t));
    chatService.getPresets().then(p => setPresets(p));
    fetch('/api/admin/documents')
      .then(r => r.json())
      .then(docs => {
        if (Array.isArray(docs)) {
          const activeDocs = docs.filter((d: any) => d.status === 'Active');
          setAvailableDocuments(activeDocs);
        }
      })
      .catch(() => { });
  }, []);

  // Handle activeDemoQuery from Dashboard or "Start Demo" button
  useEffect(() => {
    if (activeDemoQuery) {
      handleSendMessage(activeDemoQuery);
      setActiveDemoQuery(null);
    }
  }, [activeDemoQuery]);

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || inputMessage;
    if (!textToSend.trim() || isProcessing) return;

    setInputMessage('');
    const userMsgId = `usr-${Date.now()}`;
    const streamMsgId = `asst-stream-${Date.now()}`;

    // Add user message AND an active streaming assistant placeholder
    setMessages(prev => [
      ...prev,
      {
        id: userMsgId,
        sender: 'user',
        text: textToSend,
        timestamp: 'Just now'
      },
      {
        id: streamMsgId,
        sender: 'assistant',
        text: '',
        timestamp: 'Generating grounded answer...',
        isStreaming: true,
        streamedText: ''
      }
    ]);

    setIsProcessing(true);
    setProcessingSteps([]);

    // Multi-turn conversational history context (last 6 turns)
    const historyPayload: ChatMessagePayload[] = messages
      .filter(m => m.sender === 'user' || m.sender === 'assistant')
      .slice(-6)
      .map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text || m.structuredResponse?.answer || ''
      }));

    try {
      const response: StructuredAIAnswer = await chatService.streamQuery(
        textToSend,
        jurisdiction,
        getLanguageEnglishName(language),
        step => {
          setProcessingSteps(prev => [...prev, step]);
        },
        token => {
          setMessages(prev =>
            prev.map(m =>
              m.id === streamMsgId
                ? { ...m, streamedText: (m.streamedText || '') + token }
                : m
            )
          );
        },
        historyPayload,
        isDemoMode,
        useDeepAgent,
        enableRubric,
        activeDocumentId || undefined
      );

      // Finalize the streaming message with full structured response
      setMessages(prev =>
        prev.map(m =>
          m.id === streamMsgId
            ? {
              ...m,
              isStreaming: false,
              structuredResponse: response,
              isLowConfidence: response.confidence === 'LOW'
            }
            : m
        )
      );
      setActiveAnswerForEvidence(response);

      // Auto-open drawer if wide screen
      if (response.sources && response.sources.length > 0 && window.innerWidth >= 1280) {
        setIsEvidenceDrawerOpen(true);
      }

      // Refresh telemetry
      chatService.getTelemetry().then(t => setTelemetry(t));
    } catch {
      showNotification('Error contacting legal knowledge service');
      setMessages(prev => prev.filter(m => m.id !== streamMsgId));
    } finally {
      setIsProcessing(false);
      setProcessingSteps([]);
    }
  };

  const handleSpeechSimulation = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }
    setIsListening(true);
    showNotification('Listening via Bhashini Speech-to-Text...');
    setTimeout(() => {
      setInputMessage('Can I patent a novel sustained-release Ashwagandha tablet in India?');
      setIsListening(false);
      showNotification('Voice input transcribed successfully');
    }, 2200);
  };

  const handleNewChat = () => {
    setMessages([]);
    setActiveAnswerForEvidence(null);
    showNotification('New inquiry thread initialized');
  };

  const handleLoadDemoShowcase = () => {
    setMessages([
      {
        id: 'welcome-triphala-q',
        sender: 'user',
        text: 'I have developed a Triphala-based Ayurvedic formulation. Can I protect it through IP and what regulatory requirements should I check?',
        timestamp: 'Just now'
      },
      {
        id: 'welcome-triphala-a',
        sender: 'assistant',
        structuredResponse: DEMO_TRIPHALA_ANSWER,
        timestamp: 'Just now'
      }
    ]);
    setActiveAnswerForEvidence(DEMO_TRIPHALA_ANSWER);
    setIsEvidenceDrawerOpen(true);
    showNotification('Loaded Triphala demo showcase with verified citations');
  };

  const handleExportDossier = () => {
    const active = activeAnswerForEvidence || DEMO_TRIPHALA_ANSWER;
    if (!active) return;
    const dateStr = new Date().toISOString().split('T')[0];
    const dossierContent = `# AYUSH LEGAL & PATENT ADVISORY DOSSIER
Generated by IP-SAKTI-SAHAYAK Online RAG Copilot
Date: ${dateStr} | Jurisdiction: ${jurisdiction} | Language: ${language}
Grounding Engine: ${active.generationSource || 'Neon pgvector Grounded Synthesizer'}

---

## 1. EXECUTIVE SUMMARY & PATENTABILITY ASSESSMENT
**Answer:**
${active.answer}

**Statutory Assessment:**
${active.assessment}

---

## 2. STATUTORY CONSIDERATIONS (PATENTS ACT & TKDL)
${(active.considerations || []).map((c, i) => `${i + 1}. ${c}`).join('\n')}

---

## 3. REGULATORY COMPLIANCE & DRUGS & COSMETICS ACT
${(active.regulatory || []).map((r, i) => `${i + 1}. ${r}`).join('\n')}

---

## 4. STATUTORY RISKS & LIMITATIONS
${active.risks || 'No severe risks flagged.'}

---

## 5. RECOMMENDED ACTION PLAN & NEXT STEPS
${(active.nextSteps || []).map((s, i) => `${i + 1}. ${s}`).join('\n')}

---

## 6. GROUNDED CITATIONS & EVIDENCE SOURCES (${active.sources?.length || 0} SOURCES)
${(active.sources || []).map((s, i) => `### [Citation ${i + 1}] ${s.title}
- **Authority:** ${s.authority}
- **Section / Reference:** ${s.section}
- **Relevance Match:** ${s.matchPercentage || 'Verified Statutory Authority'}
- **Official Act:** ${s.officialAct || 'Drugs & Cosmetics Act / Patents Act'}
- **Summary:** ${s.summary}
- **Official Gazette Excerpt:**
> ${s.gazetteExcerpt || 'Standard statutory gazette entry.'}
`).join('\n\n')}

---
*Disclaimer: Generated for informational purposes under Ayush regulatory advisory guidelines. Consult an empannelled patent agent before filing.*
`;

    const blob = new Blob([dossierContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Ayush_IP_Legal_Dossier_${dateStr}.md`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Legal Dossier downloaded successfully as Markdown');
  };

  const activeEvidence = activeAnswerForEvidence;

  return (
    <div className="h-[calc(100vh-6.5rem)] flex overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm relative">
      {/* Center Spacious Conversation Canvas */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Assistant High-Utility Toolbar */}
        <div className="p-3 sm:px-4 bg-slate-50/70 border-b border-slate-200/80 shrink-0">
          <AssistantToolbar
            useDeepAgent={useDeepAgent}
            onToggleDeepAgent={setUseDeepAgent}
            productTypeFilter={productTypeFilter}
            onChangeProductType={setProductTypeFilter}
            telemetry={telemetry}
            onClearHistory={handleNewChat}
            evidenceCount={activeEvidence?.sources?.length || 0}
            isEvidenceDrawerOpen={isEvidenceDrawerOpen}
            onToggleEvidenceDrawer={() => setIsEvidenceDrawerOpen(prev => !prev)}
          />
        </div>

        {/* Scrollable Conversation Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-4 scrollbar-thin scrollbar-thumb-slate-200">
          {/* Welcome Hero State when thread is empty */}
          {messages.length === 0 && !isProcessing && (
            <div className="max-w-2xl mx-auto py-8 text-center space-y-6 animate-fade-in">
              {/* Connection Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-medium shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Neon Cloud pgvector &amp; Neo4j Grounded</span>
                <span className="text-slate-400 font-mono text-[10px]">HNSW Index</span>
              </div>

              <div>
                <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">
                  {t('assistant.heroTitle', 'Ayurveda IP & Regulatory Copilot')}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-lg mx-auto leading-relaxed">
                  {t('assistant.heroDesc', 'Fast statutory assessments for classical formulations, patent bars under Section 3(p)/3(e), TKDL prior art, and Rule 158B manufacturing compliance.')}
                </p>
              </div>

              {/* Categorized Inquiry Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left pt-2">
                <button
                  type="button"
                  onClick={() => handleSendMessage('Can my Ayurvedic formulation be patented under Section 3(p)?')}
                  className="p-4 bg-white/95 backdrop-blur-sm hover:bg-emerald-50/70 border border-emerald-950/10 hover:border-emerald-500/40 rounded-2xl transition-all duration-200 shadow-card-soft hover:shadow-card-hover group cursor-pointer text-left hover:scale-[1.01]"
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 group-hover:text-emerald-950">
                    <span className="text-base">🌿</span>
                    <span>{t('assistant.card1Title', 'Section 3(p) Patent Bar')}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    {t('assistant.card1Desc', 'Evaluate whether polyherbal traditional knowledge is patent-ineligible or eligible for synergism claims.')}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleSendMessage('What are the key claims of US Patent 11992510 regarding Triphala with Bacillus coagulans and probiotics?')}
                  className="p-4 bg-white/95 backdrop-blur-sm hover:bg-emerald-50/70 border border-emerald-950/10 hover:border-emerald-500/40 rounded-2xl transition-all duration-200 shadow-card-soft hover:shadow-card-hover group cursor-pointer text-left hover:scale-[1.01]"
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 group-hover:text-emerald-950">
                    <span className="text-base">🇺🇸</span>
                    <span>{t('assistant.card2Title', 'US Patent 11992510 (Proviva)')}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    {t('assistant.card2Desc', 'Inspect allowed USPTO claims for Triphala botanical extract formulated with probiotic cultures.')}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleSendMessage('What regulatory requirements apply under Rule 158B for proprietary Ayurvedic medicines?')}
                  className="p-4 bg-white/95 backdrop-blur-sm hover:bg-emerald-50/70 border border-emerald-950/10 hover:border-emerald-500/40 rounded-2xl transition-all duration-200 shadow-card-soft hover:shadow-card-hover group cursor-pointer text-left hover:scale-[1.01]"
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 group-hover:text-emerald-950">
                    <span className="text-base">📋</span>
                    <span>{t('assistant.card3Title', 'Rule 158B & Schedule T')}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    {t('assistant.card3Desc', 'Check Form 25D licensing, safety documentation, heavy metal testing, and clinical trial exemptions.')}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleSendMessage('What are the mandatory approvals needed under Biological Diversity Act 2023?')}
                  className="p-4 bg-white/95 backdrop-blur-sm hover:bg-emerald-50/70 border border-emerald-950/10 hover:border-emerald-500/40 rounded-2xl transition-all duration-200 shadow-card-soft hover:shadow-card-hover group cursor-pointer text-left hover:scale-[1.01]"
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 group-hover:text-emerald-950">
                    <span className="text-base">⚖️</span>
                    <span>{t('assistant.card4Title', 'BDA 2023 Compliance')}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    {t('assistant.card4Desc', 'Identify National Biodiversity Authority (NBA) approvals and fair benefit sharing obligations.')}
                  </p>
                </button>
              </div>

              {/* Showcase CTAs */}
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleLoadDemoShowcase}
                  className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-emerald-600/20 active:scale-95 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-white" />
                  <span>{t('assistant.loadShowcase', 'Load Triphala Demo Showcase')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowTelemetryModal(true)}
                  className="px-4 py-2.5 bg-white/90 hover:bg-white text-slate-700 hover:text-emerald-950 border border-emerald-950/10 hover:border-emerald-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Activity className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t('assistant.inspectTelemetry', 'Inspect Pipeline Telemetry')}</span>
                </button>
              </div>
            </div>
          )}

          {/* Chat Messages */}
          {messages.map(msg => (
            <ChatMessage
              key={msg.id}
              message={msg}
              onSelectPrompt={handleSendMessage}
            />
          ))}

          {/* Processing Pipeline Animation */}
          {isProcessing && (
            <div className="max-w-2xl mx-auto py-2">
              <ProcessingPipeline steps={processingSteps} />
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Input Dock Stage */}
        <div className="p-3 sm:p-4 bg-white/80 backdrop-blur-xl border-t border-emerald-950/10 shrink-0 shadow-lg">
          {availableDocuments.length > 0 && (
            <div className="mb-2 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="text-slate-400 font-medium shrink-0 flex items-center gap-1">
                <Database className="w-3 h-3 text-emerald-600" />
                {t('assistant.activeFilter', 'Active Doc Filter:')}
              </span>
              <button
                type="button"
                onClick={() => setActiveDocumentId(null)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all shrink-0 cursor-pointer ${!activeDocumentId
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-2xs font-bold'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
              >
                {t('assistant.allDocs', 'All Documents')}
              </button>
              {availableDocuments.map(d => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setActiveDocumentId(d.id === activeDocumentId ? null : d.id)}
                  title={d.title || d.filename}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all shrink-0 truncate max-w-[180px] cursor-pointer ${activeDocumentId === d.id
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-2xs font-bold'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                >
                  📄 {d.title || d.filename || d.id}
                </button>
              ))}
            </div>
          )}

          <PresetChips
            presets={presets}
            onSelectPreset={handleSendMessage}
            disabled={isProcessing}
          />

          <div className="relative flex items-center bg-white border border-emerald-950/15 rounded-2xl shadow-xs focus-within:border-emerald-600 focus-within:ring-3 focus-within:ring-emerald-500/15 transition-all p-1.5">
            <textarea
              rows={1}
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={t('assistant.inputPlaceholder', 'Ask any Ayurveda IP, Section 3(p) patentability, TKDL prior art, or Rule 158B question...')}
              className="flex-1 p-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none resize-none bg-transparent"
            />

            <div className="flex items-center gap-1.5 shrink-0 px-1">
              <button
                type="button"
                onClick={handleSpeechSimulation}
                title="Voice Input via Bhashini"
                className={`p-2 rounded-xl transition-colors cursor-pointer ${isListening
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'text-slate-400 hover:text-emerald-700 hover:bg-emerald-50'
                  }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isProcessing}
                className="p-2.5 bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white rounded-xl transition-all shadow-md shadow-emerald-600/25 flex items-center justify-center cursor-pointer active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dockable / Slide-over Evidence Drawer */}
      <EvidenceDrawer
        isOpen={isEvidenceDrawerOpen}
        onClose={() => setIsEvidenceDrawerOpen(false)}
        activeEvidence={activeEvidence}
        evidenceTab={evidenceTab}
        onSelectTab={setEvidenceTab}
        telemetry={telemetry}
        onExportDossier={handleExportDossier}
        onEscalate={() => {
          setEscalationDefaultQuery(activeEvidence?.answer || 'Ayurvedic patent review request');
          setIsEscalationOpen(true);
        }}
        onLoadDemoShowcase={handleLoadDemoShowcase}
        onOpenTelemetryModal={() => setShowTelemetryModal(true)}
      />

      {/* RAG Telemetry Modal */}
      {showTelemetryModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-slide-up space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-slate-900">
                    Neon pgvector Pipeline Telemetry
                  </h3>
                  <p className="text-xs text-slate-500">Live vector database grounding metrics</p>
                </div>
              </div>
              <button
                onClick={() => setShowTelemetryModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-slate-400 font-semibold text-[10px] uppercase">Connection Status</div>
                <div className="font-bold text-emerald-700 text-sm mt-0.5 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{telemetry?.status || 'ONLINE'}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-slate-400 font-semibold text-[10px] uppercase">Active Vectors</div>
                <div className="font-bold text-slate-900 text-sm mt-0.5">
                  {telemetry?.activeVectorsCount || 37} Vectors
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-slate-400 font-semibold text-[10px] uppercase">Index Architecture</div>
                <div className="font-bold text-slate-900 text-xs mt-0.5">
                  HNSW (Cosine Distance &lt;=&gt;)
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-slate-400 font-semibold text-[10px] uppercase">Embedding Dimensions</div>
                <div className="font-bold text-slate-900 text-xs mt-0.5">
                  768-dim Vectors
                </div>
              </div>
            </div>

            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs space-y-1">
              <div className="font-semibold text-emerald-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                <span>Synthesis Engine:</span>
              </div>
              <div className="text-emerald-800 text-[11px]">
                {telemetry?.synthesisEngine || 'Hybrid Contextual RAG Synthesizer (Neon pgvector Grounded)'}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowTelemetryModal(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Close Telemetry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
