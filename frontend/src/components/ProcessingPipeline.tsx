import React, { useState, useEffect } from 'react';
import { CheckCircle2, Loader2, Sparkles, Database, Cpu } from 'lucide-react';
import { ProcessingStep } from '../types';

interface ProcessingPipelineProps {
  steps: ProcessingStep[];
}

export const ProcessingPipeline: React.FC<ProcessingPipelineProps> = ({ steps }) => {
  const [elapsed, setElapsed] = useState(0.1);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(prev => +(prev + 0.1).toFixed(1));
    }, 100);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="p-4 bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-2xl shadow-xl border border-emerald-500/20 my-3 animate-fade-in relative overflow-hidden">
      {/* Top glowing ambient accent */}
      <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse" />

      <div className="flex items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
          </div>
          <span className="text-xs font-bold text-emerald-300 tracking-wide flex items-center gap-1.5">
            <span>RAG Grounding Pipeline</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono bg-slate-800/80 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
            <Cpu className="w-3 h-3" />
            <span>{elapsed}s</span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">pgvector + Neo4j Graph</span>
        </div>
      </div>

      <div className="space-y-2 text-xs">
        {steps.map((step, idx) => {
          const isLatest = idx === steps.length - 1;
          const isSubagent = step.type === 'subagent_call' || !!step.subagent;
          const isTool = step.type === 'tool_call' || !!step.tool;
          const isRubric = step.type === 'rubric_check' || step.rubricScore !== undefined;

          return (
            <div
              key={step.id || idx}
              className={`flex items-center gap-2.5 py-1 px-2 rounded-lg transition-all ${
                isLatest
                  ? 'bg-emerald-950/40 text-emerald-200 border border-emerald-500/20 animate-fade-in'
                  : 'text-slate-300'
              }`}
            >
              {isLatest ? (
                <Loader2 className="w-4 h-4 text-emerald-400 animate-spin shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
              
              {/* Specialized visual chips */}
              {isSubagent && (
                <span className="text-[10px] bg-purple-900/60 text-purple-300 border border-purple-500/40 px-1.5 py-0.5 rounded font-mono shrink-0">
                  🤖 {step.subagent || 'SubAgent'}
                </span>
              )}

              {isTool && (
                <span className="text-[10px] bg-cyan-900/60 text-cyan-300 border border-cyan-500/40 px-1.5 py-0.5 rounded font-mono shrink-0">
                  {step.tool === 'vector' ? '🔵 pgvector' : step.tool === 'graph' ? '🟣 Neo4j' : step.tool === 'web' ? '🌐 Tavily' : '⚖️ Statute'}
                </span>
              )}

              {isRubric && (
                <span className="text-[10px] bg-amber-900/60 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded font-mono shrink-0">
                  ⭐ Rubric {step.rubricScore ? `${step.rubricScore}/100` : 'Check'}
                </span>
              )}

              <span className="text-xs font-medium tracking-tight flex-1">{step.label}</span>
              {isLatest && (
                <span className="text-[10px] font-mono text-emerald-400/80 uppercase tracking-widest animate-pulse hidden sm:inline">
                  LIVE
                </span>
              )}
            </div>
          );
        })}

        {steps.length === 0 && (
          <div className="flex items-center gap-2.5 py-1 px-2 text-slate-400 animate-pulse">
            <Database className="w-4 h-4 text-emerald-400 animate-bounce" />
            <span>Initializing semantic vector search over statutory corpus...</span>
          </div>
        )}
      </div>
    </div>
  );
};
