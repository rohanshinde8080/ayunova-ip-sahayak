import { DocumentAnalysisResult } from '../types';
import { DEMO_DOCUMENT_ANALYSIS } from '../data/demoData';

const IS_DEMO_MODE = true;

export const documentService = {
  analyzeDocument: async (_file: File | null): Promise<DocumentAnalysisResult> => {
    if (IS_DEMO_MODE) {
      await new Promise(r => setTimeout(r, 900));
      return DEMO_DOCUMENT_ANALYSIS;
    }

    const formData = new FormData();
    if (_file) formData.append('file', _file);

    const res = await fetch('/api/document/analyze', {
      method: 'POST',
      body: formData
    });
    return res.json();
  },

  getSampleAnalysis: async (): Promise<DocumentAnalysisResult> => {
    await new Promise(r => setTimeout(r, 500));
    return DEMO_DOCUMENT_ANALYSIS;
  }
};
