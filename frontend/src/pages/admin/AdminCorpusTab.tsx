import React from 'react';
import {
  Search,
  FileText,
  Eye,
  Trash2,
  Edit2
} from 'lucide-react';
import { KnowledgeDocument } from '../../types';

interface AdminCorpusTabProps {
  documents: KnowledgeDocument[];
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedCategory: string;
  onCategoryChange: (val: string) => void;
  selectedJurisdiction: string;
  onJurisdictionChange: (val: string) => void;
  selectedStatus: string;
  onStatusChange: (val: string) => void;
  onToggleDoc: (id: string) => void;
  onDeleteDoc: (id: string, title: string) => void;
  onInspectChunks: (doc: KnowledgeDocument) => void;
}

export const AdminCorpusTab: React.FC<AdminCorpusTabProps> = ({
  documents,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedJurisdiction,
  onJurisdictionChange,
  selectedStatus,
  onStatusChange,
  onToggleDoc,
  onDeleteDoc,
  onInspectChunks
}) => {
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch =
      searchQuery === '' ||
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.authority.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCat = selectedCategory === 'All' || doc.category === selectedCategory;
    const matchesJur = selectedJurisdiction === 'All' || doc.jurisdiction === selectedJurisdiction;
    const matchesStat = selectedStatus === 'All' || doc.status === selectedStatus;

    return matchesSearch && matchesCat && matchesJur && matchesStat;
  });

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4 animate-fade-in text-slate-800">
      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search by act title, authority, or ID..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-hidden transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedCategory}
            onChange={e => onCategoryChange(e.target.value)}
            className="text-xs p-2 rounded-xl border border-slate-200 bg-white text-slate-700 cursor-pointer focus:outline-hidden hover:border-slate-300"
          >
            <option value="All">All Categories</option>
            <option value="Patents Act">Patents Act</option>
            <option value="Biodiversity (BDA)">Biodiversity (BDA)</option>
            <option value="Ayush / Drugs & Cosmetics">Drugs &amp; Cosmetics</option>
            <option value="International (WIPO/Nagoya/FDA)">International</option>
            <option value="Pharmacopoeia">Pharmacopoeia</option>
            <option value="TKDL Prior Art">TKDL Prior Art</option>
          </select>

          <select
            value={selectedJurisdiction}
            onChange={e => onJurisdictionChange(e.target.value)}
            className="text-xs p-2 rounded-xl border border-slate-200 bg-white text-slate-700 cursor-pointer focus:outline-hidden hover:border-slate-300"
          >
            <option value="All">All Jurisdictions</option>
            <option value="India">India</option>
            <option value="International">International</option>
            <option value="USA">USA</option>
            <option value="EU">EU</option>
          </select>

          <select
            value={selectedStatus}
            onChange={e => onStatusChange(e.target.value)}
            className="text-xs p-2 rounded-xl border border-slate-200 bg-white text-slate-700 cursor-pointer focus:outline-hidden hover:border-slate-300"
          >
            <option value="All">All Status</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Documents Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px] font-mono">
              <th className="pb-3">Act / Legal Document</th>
              <th className="pb-3">Authority</th>
              <th className="pb-3">Category</th>
              <th className="pb-3">Jurisdiction</th>
              <th className="pb-3">Chunks</th>
              <th className="pb-3">Rag Status</th>
              <th className="pb-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredDocuments.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500 text-xs">
                  <div className="font-semibold text-slate-800 text-sm mb-1">No documents found</div>
                  <div className="text-slate-500 max-w-md mx-auto">
                    Upload a PDF in the <span className="text-emerald-700 font-medium">Multi-Modal Ingest Studio</span> tab to populate the statutory knowledge corpus.
                  </div>
                </td>
              </tr>
            ) : (
              filteredDocuments.map(doc => (
                <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 pr-4 font-semibold text-slate-900 max-w-xs">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="truncate">{doc.title}</span>
                    </div>
                    {doc.filename && (
                      <span className="text-[10px] text-slate-500 font-mono block pl-6 truncate">
                        {doc.filename}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 pr-4 text-slate-600">{doc.authority}</td>
                  <td className="py-3.5 pr-4">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-semibold border border-emerald-200/80">
                      {doc.category}
                    </span>
                  </td>
                  <td className="py-3.5 pr-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                      {doc.jurisdiction}
                    </span>
                  </td>
                  <td className="py-3.5 pr-4 font-mono text-emerald-600 font-bold">
                    {doc.chunksCount.toLocaleString()}
                  </td>
                  <td className="py-3.5 pr-4">
                    <button
                      onClick={() => onToggleDoc(doc.id)}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono transition-all cursor-pointer ${
                        doc.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                      }`}
                      title="Click to toggle Active/Inactive"
                    >
                      {doc.status}
                    </button>
                  </td>
                  <td className="py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onInspectChunks(doc)}
                        className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                        title="Inspect vector chunks"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onInspectChunks(doc)}
                        className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Edit metadata"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteDoc(doc.id, doc.title)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete document and chunks"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
