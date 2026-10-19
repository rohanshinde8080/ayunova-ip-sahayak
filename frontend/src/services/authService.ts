import { UserProfile } from '../types';

const IS_DEMO_MODE = true; // In production this reads import.meta.env.VITE_API_URL

export const DEMO_USER: UserProfile = {
  name: 'Ayush Innovator (Demo)',
  email: 'demo@ipsakti.ai',
  role: 'Innovator',
  organization: 'AyurTech Innovation Labs',
  isDemoMode: true
};

export const ADMIN_USER: UserProfile = {
  name: 'Ayush Regulatory Officer',
  email: 'admin@ipsakti.ai',
  role: 'Admin',
  organization: 'Ministry of Ayush / AIIA IPR Cell',
  isDemoMode: true
};

export const authService = {
  login: async (email: string, pass: string): Promise<UserProfile> => {
    if (IS_DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 400));
      if (email.toLowerCase().includes('admin')) {
        localStorage.setItem('ipsakti_user', JSON.stringify(ADMIN_USER));
        return ADMIN_USER;
      }
      localStorage.setItem('ipsakti_user', JSON.stringify(DEMO_USER));
      return DEMO_USER;
    }

    // Future Real API call:
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass })
    });
    if (!response.ok) throw new Error('Login failed');
    return response.json();
  },

  loginDemo: async (): Promise<UserProfile> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    localStorage.setItem('ipsakti_user', JSON.stringify(DEMO_USER));
    return DEMO_USER;
  },

  getCurrentUser: (): UserProfile | null => {
    const saved = localStorage.getItem('ipsakti_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEMO_USER;
      }
    }
    return DEMO_USER; // Default to demo user for seamless judge experience
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem('ipsakti_user');
  }
};
