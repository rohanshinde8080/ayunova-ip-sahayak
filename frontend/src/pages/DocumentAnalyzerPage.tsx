import React, { useState } from 'react';
import {
  FileText,
  UploadCloud,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  FileCheck,
  Download,
  Info
} from 'lucide-react';
import { DocumentAnalysisResult } from '../types';
import { documentService } from '../services/documentService';
import { DEMO_DOCUMENT_ANALYSIS } from '../data/demoData';
import { UploadBox } from '../components/UploadBox';
import { ConfidenceBadge } from '../components/ConfidenceBadge';
import { useApp } from '../context/AppContext';

export const DocumentAnalyzerPage: React.FC = () => {
  const { setSelectedSource, showNotification } = useApp();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<DocumentAnalysisResult | null>(DEMO_DOCUMENT_ANALYSIS);

  const handleFileSelect = async (file: File) => {
    setIsAnalyzing(true);
    showNotification(`Extracting & parsing ${file.name}...`);
    try {
      const res = await documentService.analyzeDocument(file);
      setAnalysisResult({ ...res, fileName: file.name });
      showNotification('Document analysis complete');
    } catch {
      showNotification('Unable to process document');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUseSample = async () => {
    setIsAnalyzing(true);
    showNotification('Loading Sample Ayurvedic Formulation Dossier...');
    try {
      const res = await documentService.getSampleAnalysis();
      setAnalysisResult(res);
      showNotification('Sample dossier analyzed successfully');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-900 border border-blue-300">
              Automated Dossier Audit
            </span>
            <span className="text-xs text-slate-500">PDF / DOCX Optical Legal Parser</span>
          </div>
          <h1 className="font-heading font-bold text-2xl text-slate-900 mt-1">
            Ayurveda Formulation &amp; Patent Document Analyzer
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Upload research papers, patent specifications, or formulation master records for automated Section 3(p) prior art and compliance audit.
          </p>
        </div>
      </div>

      {/* Upload Box */}
      <UploadBox
        onFileSelect={handleFileSelect}
        onUseSample={handleUseSample}
        isLoading={isAnalyzing}
      />

      {/* Analysis Result Container */}
      {analysisResult && (
        <div className="space-y-6 animate-fade-in">
          {/* Metadata Card */}
          <div className="gov-card p-5 bg-gradient-to-r from-slate-900 to-emerald-950 text-white border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/30 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 font-mono">
                  Parsed Document
                </span>
                <h3 className="font-heading font-bold text-base text-white">
                  {analysisResult.fileName}
                </h3>
                <div className="flex items-center gap-3 text-xs text-slate-300 font-mono mt-0.5">
                  <span>Size: {analysisResult.fileSize}</span>
                  <span>•</span>
                  <span>Pages: {analysisResult.pageCount}</span>
                  <span>•</span>
                  <span>Language: {analysisResult.detectedLanguage}</span>
                </div>
              </div>
            </div>

            <ConfidenceBadge confidence={analysisResult.confidence} />
          </div>

          {/* Grid of Findings */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Extracted Formulation Matrix */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <FileCheck className="w-5 h-5 text-emerald-700" />
                <h3 className="font-heading font-bold text-base text-slate-900">
                  Extracted Chemical &amp; Botanical Matrix
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase block">Product Name / Title</span>
                  <div className="font-semibold text-slate-900 text-sm mt-0.5">
                    {analysisResult.keyInformation.productName}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase block">Herbal Ingredients Identified</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {analysisResult.keyInformation.herbsIdentified.map((h, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 font-medium"
                      >
                        🌿 {h}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase block">Extraction Solvents &amp; Method</span>
                  <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 font-mono mt-0.5">
                    {analysisResult.keyInformation.extractionSolvents}
                  </p>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase block">Intended Therapeutic Use</span>
                  <p className="text-slate-700 mt-0.5 leading-relaxed">
                    {analysisResult.keyInformation.intendedUse}
                  </p>
                </div>
              </div>
            </div>

            {/* Right: IP & Patentability Evaluation */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                <h3 className="font-heading font-bold text-base text-slate-900">
                  IP Considerations &amp; Section 3(p) Analysis
                </h3>
              </div>

              <div className="space-y-2 text-xs">
                <ul className="space-y-2">
                  {analysisResult.ipConsiderations.map((ip, idx) => (
                    <li key={idx} className="p-3 bg-emerald-50/40 rounded-xl border border-emerald-200 text-slate-800 leading-relaxed flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                      <span>{ip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1">
                  Regulatory Licensing Pathway
                </span>
                <ul className="space-y-1 text-xs text-slate-700">
                  {analysisResult.regulatoryConsiderations.map((rc, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                      <span>{rc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Missing Information & Gaps Audit */}
          <div className="gov-card p-6 space-y-3 bg-amber-50/40 border-amber-200">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-700" />
              <h3 className="font-heading font-bold text-base text-amber-950">
                Potential Missing Statutory Information / Gaps Detected
              </h3>
            </div>
            <p className="text-xs text-slate-600">
              The AI auditor flagged the following documentation gaps required prior to submission to the Indian Patent Office or State Ayush Authority:
            </p>
            <div className="space-y-2">
              {analysisResult.potentialMissingInformation.map((gap, idx) => (
                <div key={idx} className="p-3 bg-white rounded-xl border border-amber-200 text-xs text-amber-950 flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{gap}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cited Statutory Authorities */}
          <div className="gov-card p-5 space-y-3">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Directly Grounded Statutory Citations (Click to view official gazette text):
            </span>
            <div className="flex flex-wrap gap-2">
              {analysisResult.relevantSources.map(src => (
                <button
                  key={src.id}
                  onClick={() => setSelectedSource(src)}
                  className="badge-source"
                >
                  <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{src.section} ({src.authority})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
