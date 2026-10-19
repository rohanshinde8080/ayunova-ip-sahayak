import React, { useRef } from 'react';
import { UploadCloud, FileText, Sparkles, CheckCircle2 } from 'lucide-react';

interface UploadBoxProps {
  onFileSelect: (file: File) => void;
  onUseSample: () => void;
  isLoading?: boolean;
}

export const UploadBox: React.FC<UploadBoxProps> = ({
  onFileSelect,
  onUseSample,
  isLoading = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div
      onDragOver={e => e.preventDefault()}
      onDrop={handleDrop}
      className="p-8 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl bg-slate-50/50 hover:bg-emerald-50/20 text-center transition-all flex flex-col items-center justify-center space-y-4"
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleChange}
        accept=".pdf,.docx,.txt"
        className="hidden"
      />

      <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-xs">
        <UploadCloud className="w-7 h-7" />
      </div>

      <div className="space-y-1 max-w-sm">
        <h4 className="text-sm font-bold text-slate-900">
          Upload Ayurvedic Formulation / Patent Dossier
        </h4>
        <p className="text-xs text-slate-500">
          Drag &amp; drop PDF or DOCX file (up to 15MB). Automated extraction identifies botanical ingredients, extraction solvents, and Section 3(p) prior art matches.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow transition-colors"
        >
          Select Local File
        </button>

        <button
          type="button"
          onClick={onUseSample}
          disabled={isLoading}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl shadow transition-colors flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Use Sample Document (Triphala_v2.pdf)</span>
        </button>
      </div>
    </div>
  );
};
