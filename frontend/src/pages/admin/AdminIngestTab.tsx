import React from 'react';
import {
  UploadCloud,
  FileUp,
  Plus,
  Layers,
  RefreshCw,
  Download
} from 'lucide-react';
import { ManualIngestFormData } from '../../types';

interface AdminIngestTabProps {
  ingestMode: 'upload' | 'manual' | 'bulk';
  onSelectIngestMode: (mode: 'upload' | 'manual' | 'bulk') => void;
  // File Upload
  uploadFile: File | null;
  onSelectUploadFile: (file: File | null) => void;
  uploadCategory: string;
  onChangeUploadCategory: (val: string) => void;
  uploadAuthority: string;
  onChangeUploadAuthority: (val: string) => void;
  uploadAct: string;
  onChangeUploadAct: (val: string) => void;
  uploadJurisdiction: string;
  onChangeUploadJurisdiction: (val: string) => void;
  isUploading: boolean;
  uploadStage: string | null;
  onFileUpload: (e: React.FormEvent) => void;
  // Manual Form
  manualForm: ManualIngestFormData;
  onChangeManualForm: (val: ManualIngestFormData) => void;
  isSubmittingManual: boolean;
  onManualSubmit: (e: React.FormEvent) => void;
  // Bulk JSON
  bulkFile: File | null;
  onSelectBulkFile: (file: File | null) => void;
  isBulkImporting: boolean;
  onBulkImport: (e: React.FormEvent) => void;
  onDownloadSampleJson: () => void;
}

export const AdminIngestTab: React.FC<AdminIngestTabProps> = ({
  ingestMode,
  onSelectIngestMode,
  uploadFile,
  onSelectUploadFile,
  uploadCategory,
  onChangeUploadCategory,
  uploadAuthority,
  onChangeUploadAuthority,
  uploadAct,
  onChangeUploadAct,
  uploadJurisdiction,
  onChangeUploadJurisdiction,
  isUploading,
  uploadStage,
  onFileUpload,
  manualForm,
  onChangeManualForm,
  isSubmittingManual,
  onManualSubmit,
  bulkFile,
  onSelectBulkFile,
  isBulkImporting,
  onBulkImport,
  onDownloadSampleJson
}) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-6 animate-fade-in text-slate-800">
      {/* Tab Header & Pathway Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="font-heading font-bold text-lg text-slate-900 flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-emerald-600" />
            Multi-Modal Knowledge Ingestion Studio
          </h2>
          <p className="text-xs text-slate-500">
            Choose an ingestion pathway to add legal acts, pharmacopoeial monographs, gazette orders, or prior art to Neon pgvector.
          </p>
        </div>

        {/* Pathway Buttons */}
        <div className="flex bg-slate-100 p-1 rounded-xl gap-1 shrink-0 border border-slate-200">
          <button
            type="button"
            onClick={() => onSelectIngestMode('upload')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              ingestMode === 'upload'
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <FileUp className="w-3.5 h-3.5" />
            <span>Document Upload (PDF/DOCX)</span>
          </button>
          <button
            type="button"
            onClick={() => onSelectIngestMode('manual')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              ingestMode === 'manual'
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Structured Manual Form</span>
          </button>
          <button
            type="button"
            onClick={() => onSelectIngestMode('bulk')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              ingestMode === 'bulk'
                ? 'bg-purple-700 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Bulk Batch Import (JSON)</span>
          </button>
        </div>
      </div>

      {/* Pathway A: Document File Upload */}
      {ingestMode === 'upload' && (
        <form onSubmit={onFileUpload} className="space-y-6">
          <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50/70 hover:bg-emerald-50/20 rounded-2xl p-8 text-center transition-all">
            <input
              type="file"
              id="admin-file-input"
              accept=".pdf,.docx,.doc,.txt,.json,.csv"
              onChange={e => {
                if (e.target.files && e.target.files[0]) {
                  onSelectUploadFile(e.target.files[0]);
                }
              }}
              className="hidden"
            />
            <label
              htmlFor="admin-file-input"
              className="cursor-pointer flex flex-col items-center justify-center space-y-3"
            >
              <div className="w-14 h-14 rounded-2xl bg-white text-emerald-700 flex items-center justify-center shadow-xs border border-slate-200">
                <UploadCloud className="w-7 h-7" />
              </div>
              <div>
                <span className="font-heading font-bold text-sm text-slate-900 block">
                  {uploadFile ? uploadFile.name : 'Click to select legal document or drag & drop'}
                </span>
                <span className="text-xs text-slate-500 mt-1 block">
                  Supports PDF (with page extraction), Word (.docx), Plain Text (.txt), JSON, or CSV
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="px-2.5 py-0.5 rounded-full bg-white text-slate-600 text-[10px] font-mono border border-slate-200">
                  PDF
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-white text-slate-600 text-[10px] font-mono border border-slate-200">
                  DOCX
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-white text-slate-600 text-[10px] font-mono border border-slate-200">
                  TXT
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-white text-slate-600 text-[10px] font-mono border border-slate-200">
                  JSON
                </span>
              </div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Corpus Category
              </label>
              <select
                value={uploadCategory}
                onChange={e => onChangeUploadCategory(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-hidden cursor-pointer"
              >
                <option value="Patents Act">Patents Act (Sec 3p/3e)</option>
                <option value="Biodiversity (BDA)">Biodiversity (BDA 2002/2023)</option>
                <option value="Ayush / Drugs & Cosmetics">Ayush / Drugs &amp; Cosmetics (Rule 158B)</option>
                <option value="International (WIPO/Nagoya/FDA)">International (WIPO / FDA / EMA)</option>
                <option value="Pharmacopoeia">Pharmacopoeial Monographs</option>
                <option value="TKDL Prior Art">TKDL Classical Prior Art</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Issuing Authority
              </label>
              <input
                type="text"
                value={uploadAuthority}
                onChange={e => onChangeUploadAuthority(e.target.value)}
                placeholder="e.g. Indian Patent Office (IPO)"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Governing Act / Directive
              </label>
              <input
                type="text"
                value={uploadAct}
                onChange={e => onChangeUploadAct(e.target.value)}
                placeholder="e.g. The Patents Act, 1970"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Applicable Jurisdiction
              </label>
              <select
                value={uploadJurisdiction}
                onChange={e => onChangeUploadJurisdiction(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-hidden cursor-pointer"
              >
                <option value="India">India (IPO / Ayush)</option>
                <option value="International">International (WIPO / PCT)</option>
                <option value="USA">USA (US FDA Botanical)</option>
                <option value="EU">EU (EMA HMPC / THMPD)</option>
                <option value="Japan">Japan (PMDA)</option>
              </select>
            </div>
          </div>

          {isUploading && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 space-y-2 animate-fade-in">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-emerald-700 animate-spin" />
                <span className="font-heading font-bold text-xs text-emerald-950">
                  Processing Ingestion Pipeline:
                </span>
              </div>
              <div className="text-xs text-emerald-800 font-mono">
                {uploadStage}
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!uploadFile || isUploading}
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <UploadCloud className="w-4 h-4" />
              <span>{isUploading ? 'Executing Ingestion Pipeline...' : 'Parse, Chunk & Ingest to Neon pgvector'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Pathway B: Structured Manual Entry */}
      {ingestMode === 'manual' && (
        <form onSubmit={onManualSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Statutory Rule or Provision Title *
              </label>
              <input
                type="text"
                required
                value={manualForm.title}
                onChange={e => onChangeManualForm({ ...manualForm, title: e.target.value })}
                placeholder="e.g. Biological Diversity Act - Form III Prior Approval Requirement"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Section or Rule Citation *
              </label>
              <input
                type="text"
                required
                value={manualForm.section}
                onChange={e => onChangeManualForm({ ...manualForm, section: e.target.value })}
                placeholder="e.g. Section 6(1)"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Authority *
              </label>
              <input
                type="text"
                required
                value={manualForm.authority}
                onChange={e => onChangeManualForm({ ...manualForm, authority: e.target.value })}
                placeholder="e.g. National Biodiversity Authority (NBA)"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Governing Act *
              </label>
              <input
                type="text"
                required
                value={manualForm.officialAct}
                onChange={e => onChangeManualForm({ ...manualForm, officialAct: e.target.value })}
                placeholder="e.g. Biological Diversity Act, 2002"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Category
              </label>
              <select
                value={manualForm.category}
                onChange={e => onChangeManualForm({ ...manualForm, category: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-hidden cursor-pointer"
              >
                <option value="Patents Act">Patents Act</option>
                <option value="Biodiversity (BDA)">Biodiversity (BDA)</option>
                <option value="Ayush / Drugs & Cosmetics">Ayush / Drugs &amp; Cosmetics</option>
                <option value="International (WIPO/Nagoya/FDA)">International (WIPO/Nagoya/FDA)</option>
                <option value="Pharmacopoeia">Pharmacopoeia</option>
                <option value="TKDL Prior Art">TKDL Prior Art</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Jurisdiction
              </label>
              <select
                value={manualForm.jurisdiction}
                onChange={e => onChangeManualForm({ ...manualForm, jurisdiction: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-hidden cursor-pointer"
              >
                <option value="India">India</option>
                <option value="International">International</option>
                <option value="USA">USA</option>
                <option value="EU">EU</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Gazette Excerpt / Statutory Summary
            </label>
            <input
              type="text"
              value={manualForm.gazetteExcerpt || ''}
              onChange={e => onChangeManualForm({ ...manualForm, gazetteExcerpt: e.target.value })}
              placeholder="Short authoritative quotation from the official gazette or guidelines"
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Full Legal Text &amp; Statutory Guidance *
            </label>
            <textarea
              rows={4}
              required
              value={manualForm.contentText}
              onChange={e => onChangeManualForm({ ...manualForm, contentText: e.target.value })}
              placeholder="Paste the complete text of the legal provision, rule guidelines, or examination criterion..."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-hidden"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmittingManual}
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmittingManual ? 'Injecting & Embedding...' : 'Inject & Generate Vector Embedding'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Pathway C: Bulk Batch JSON */}
      {ingestMode === 'bulk' && (
        <form onSubmit={onBulkImport} className="space-y-6">
          <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h4 className="font-heading font-bold text-xs text-purple-950">
                Bulk Dataset JSON Ingestion
              </h4>
              <p className="text-[11px] text-purple-800/80">
                Upload an array of legal acts, monographs, or prior art formulations to perform batch vector embedding into Neon Postgres.
              </p>
            </div>
            <button
              type="button"
              onClick={onDownloadSampleJson}
              className="px-3 py-1.5 bg-white border border-purple-200 hover:bg-purple-100/60 text-purple-900 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-purple-700" />
              <span>Download Sample JSON Template</span>
            </button>
          </div>

          <div className="border-2 border-dashed border-purple-200 hover:border-purple-500 bg-purple-50/30 rounded-2xl p-6 text-center transition-all">
            <input
              type="file"
              id="bulk-file-input"
              accept=".json"
              onChange={e => {
                if (e.target.files && e.target.files[0]) {
                  onSelectBulkFile(e.target.files[0]);
                }
              }}
              className="hidden"
            />
            <label htmlFor="bulk-file-input" className="cursor-pointer space-y-2 block">
              <div className="w-12 h-12 rounded-xl bg-white text-purple-700 flex items-center justify-center mx-auto border border-purple-200 shadow-2xs">
                <Layers className="w-6 h-6" />
              </div>
              <span className="font-heading font-bold text-xs text-purple-950 block">
                {bulkFile ? bulkFile.name : 'Select JSON file for batch ingestion'}
              </span>
            </label>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!bulkFile || isBulkImporting}
              className="px-6 py-2.5 bg-purple-700 hover:bg-purple-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <Layers className="w-4 h-4" />
              <span>{isBulkImporting ? 'Processing Batch...' : 'Execute Batch Vector Ingestion'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
