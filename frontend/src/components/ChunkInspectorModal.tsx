import React, { useState } from 'react';
import {
  X,
  Layers,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  FileText,
  Shield,
  Tag,
  Hash
} from 'lucide-react';
import { KnowledgeDocument, DocumentChunkDetail } from '../types';

interface ChunkInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: KnowledgeDocument | null;
  chunks: DocumentChunkDetail[];
  isLoading: boolean;
}

export const ChunkInspectorModal: React.FC<ChunkInspectorModalProps> = ({
  isOpen,
  onClose,
  document,
  chunks,
  isLoading
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen || !document) return null;

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-up">
        {/* Modal Header */}
        <div className="p-6 bg-slate-900 text-white flex items-start justify-between gap-4 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Vector Knowledge Chunk Inspector
              </span>
              <span className="text-xs text-slate-400 font-mono">
                ID: {document.id}
              </span>
            </div>
            <h2 className="font-heading font-bold text-xl text-white">
              {document.title}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 pt-1">
              <span className="flex items-center gap-1 text-emerald-400">
                <Shield className="w-3.5 h-3.5" />
                {document.authority}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-300">
                <Tag className="w-3.5 h-3.5" />
                {document.category}
              </span>
              <span>•</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-200 border border-slate-700">
                {document.jurisdiction}
              </span>
              <span>•</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                document.status === 'Active'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-700 text-slate-400'
              }`}>
                {document.status}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Chunks List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 bg-slate-50/50">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-700" />
              <h3 className="font-heading font-bold text-sm text-slate-900">
                Constituent Vector Chunks ({chunks.length})
              </h3>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>pgvector 768-dim Embeddings</span>
            </div>
          </div>

          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-500">
              <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-medium">Loading vector chunks from Neon PostgreSQL...</span>
            </div>
          ) : chunks.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No individual chunks found for this document.
            </div>
          ) : (
            <div className="space-y-4">
              {chunks.map((chunk, idx) => (
                <div
                  key={chunk.id || idx}
                  className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-800 font-bold font-mono text-xs flex items-center justify-center">
                        #{chunk.chunk_index}
                      </span>
                      <span className="font-bold text-xs text-slate-900">
                        {chunk.section || 'General Provision'}
                      </span>
                      {chunk.page_reference && (
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          {chunk.page_reference}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">
                        <CheckCircle2 className="w-3 h-3" />
                        768-dim Vector Stored
                      </span>
                      <button
                        onClick={() => handleCopy(chunk.id, chunk.content_text)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        title="Copy chunk text"
                      >
                        {copiedId === chunk.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed font-sans bg-slate-50/70 p-3 rounded-lg border border-slate-100 whitespace-pre-wrap">
                    {chunk.content_text}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[10px] text-slate-400 font-mono">
                    <div className="flex items-center gap-3">
                      <span>Chars: {chunk.content_text.length}</span>
                      <span>Tokens ≈ {Math.max(1, Math.round(chunk.content_text.length / 4))}</span>
                    </div>
                    <span>Chunk ID: {chunk.id}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-100/80 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500 font-mono">
            {chunks.length} total chunks synced with Neon Serverless Postgres
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
