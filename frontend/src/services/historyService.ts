import { DEMO_RECENT_QUERIES } from '../data/demoData';

export interface HistoryEntry {
  id: string;
  query: string;
  date: string;
  jurisdiction: 'India' | 'International' | 'USA' | 'EU' | 'Japan';
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  category: string;
  responseSnippet?: string;
}

export const historyService = {
  getHistory: async (): Promise<HistoryEntry[]> => {
    const saved = localStorage.getItem('ipsakti_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEMO_RECENT_QUERIES;
      }
    }
    return DEMO_RECENT_QUERIES;
  },

  addEntry: async (entry: Omit<HistoryEntry, 'id' | 'date'>): Promise<HistoryEntry[]> => {
    const history = await historyService.getHistory();
    const newEntry: HistoryEntry = {
      ...entry,
      id: `q-${Date.now()}`,
      date: 'Just now'
    };
    const updated = [newEntry, ...history];
    localStorage.setItem('ipsakti_history', JSON.stringify(updated));
    return updated;
  },

  clearHistory: async (): Promise<void> => {
    localStorage.removeItem('ipsakti_history');
  }
};
