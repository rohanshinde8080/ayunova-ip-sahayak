import { IPAdvisorInput, IPAdvisorResult } from '../types';
import { DEMO_IP_ANALYSIS } from '../data/demoData';

const IS_DEMO_MODE = true;

export const ipAdvisorService = {
  analyzeIP: async (_input: IPAdvisorInput): Promise<IPAdvisorResult> => {
    if (IS_DEMO_MODE) {
      await new Promise(r => setTimeout(r, 700));
      return DEMO_IP_ANALYSIS;
    }

    const res = await fetch('/api/ip/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(_input)
    });
    return res.json();
  }
};
