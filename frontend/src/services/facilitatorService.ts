import { FacilitatorRequest, Jurisdiction } from '../types';
import { DEMO_FACILITATOR_REQUESTS } from '../data/demoData';

const IS_DEMO_MODE = true;

export const facilitatorService = {
  submitRequest: async (params: {
    innovationName: string;
    subject: string;
    jurisdiction: Jurisdiction;
    query: string;
    contactEmail: string;
  }): Promise<FacilitatorRequest> => {
    if (IS_DEMO_MODE) {
      await new Promise(r => setTimeout(r, 600));
      const refNum = `IP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const newReq: FacilitatorRequest = {
        id: `req-${Date.now()}`,
        referenceNumber: refNum,
        innovationName: params.innovationName || 'Ayurvedic Innovation Inquiry',
        subject: params.subject || 'Preliminary Review',
        jurisdiction: params.jurisdiction,
        query: params.query,
        contactEmail: params.contactEmail || 'user@domain.com',
        submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        status: 'Pending Review',
        priority: 'Normal'
      };

      const existing = await facilitatorService.getRequests();
      localStorage.setItem('ipsakti_facilitator_reqs', JSON.stringify([newReq, ...existing]));
      return newReq;
    }

    const res = await fetch('/api/facilitator/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    return res.json();
  },

  getRequests: async (): Promise<FacilitatorRequest[]> => {
    const saved = localStorage.getItem('ipsakti_facilitator_reqs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEMO_FACILITATOR_REQUESTS;
      }
    }
    return DEMO_FACILITATOR_REQUESTS;
  }
};
