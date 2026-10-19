import { ComplianceItem } from '../types';
import { DEMO_COMPLIANCE_ITEMS } from '../data/demoData';

const IS_DEMO_MODE = true;

export const complianceService = {
  getChecklist: async (): Promise<ComplianceItem[]> => {
    if (IS_DEMO_MODE) {
      const stored = localStorage.getItem('ipsakti_compliance');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return DEMO_COMPLIANCE_ITEMS;
        }
      }
      return DEMO_COMPLIANCE_ITEMS;
    }

    const res = await fetch('/api/compliance/check');
    return res.json();
  },

  saveChecklist: async (items: ComplianceItem[]): Promise<void> => {
    localStorage.setItem('ipsakti_compliance', JSON.stringify(items));
  },

  resetChecklist: async (): Promise<ComplianceItem[]> => {
    localStorage.removeItem('ipsakti_compliance');
    return DEMO_COMPLIANCE_ITEMS;
  }
};
