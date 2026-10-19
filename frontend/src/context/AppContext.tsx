import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile, Jurisdiction, Language, SourceCitation, StructuredAIAnswer } from '../types';
import { authService } from '../services/authService';
import { getTranslation } from '../i18n/translations';
import { triggerFullPageTranslation, getLanguageByCode } from '../i18n/languages';

interface AppContextType {
  user: UserProfile | null;
  login: (email: string, pass: string) => Promise<void>;
  loginDemo: () => Promise<void>;
  logout: () => Promise<void>;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
  jurisdiction: Jurisdiction;
  setJurisdiction: (j: Jurisdiction) => void;
  isDemoMode: boolean;
  setIsDemoMode: (val: boolean) => void;
  selectedSource: SourceCitation | null;
  setSelectedSource: (src: SourceCitation | null) => void;
  isEscalationOpen: boolean;
  setIsEscalationOpen: (open: boolean) => void;
  escalationDefaultQuery: string;
  setEscalationDefaultQuery: (q: string) => void;
  activeDemoQuery: string | null;
  setActiveDemoQuery: (q: string | null) => void;
  activeAnswerForEvidence: StructuredAIAnswer | null;
  setActiveAnswerForEvidence: (ans: StructuredAIAnswer | null) => void;
  notification: string | null;
  showNotification: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => authService.getCurrentUser());
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('ayush_lang');
    return (saved as Language) || 'en';
  });
  const [jurisdiction, setJurisdiction] = useState<Jurisdiction>('India');
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [selectedSource, setSelectedSource] = useState<SourceCitation | null>(null);
  const [isEscalationOpen, setIsEscalationOpen] = useState<boolean>(false);
  const [escalationDefaultQuery, setEscalationDefaultQuery] = useState<string>('');
  const [activeDemoQuery, setActiveDemoQuery] = useState<string | null>(null);
  const [activeAnswerForEvidence, setActiveAnswerForEvidence] = useState<StructuredAIAnswer | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Translation function bound to current language
  const t = useCallback(
    (key: string, fallback?: string) => {
      return getTranslation(language, key, fallback);
    },
    [language]
  );

  // Synchronized language setter with full DOM translation hook
  const setLanguage = useCallback((newLang: Language) => {
    setLanguageState(newLang);
    localStorage.setItem('ayush_lang', newLang);
    document.documentElement.lang = newLang;
    triggerFullPageTranslation(newLang);
  }, []);

  useEffect(() => {
    const curr = authService.getCurrentUser();
    if (curr) setUser(curr);

    // Apply saved language on initial boot
    const savedLang = localStorage.getItem('ayush_lang') as Language;
    if (savedLang) {
      document.documentElement.lang = savedLang;
      triggerFullPageTranslation(savedLang);
    }

    // Probe backend RAG status
    fetch('/api/chat/telemetry')
      .then(res => {
        if (res.ok) {
          setIsDemoMode(false);
        } else {
          setIsDemoMode(true);
        }
      })
      .catch(() => {
        setIsDemoMode(true);
      });
  }, []);

  const login = async (email: string, pass: string) => {
    const u = await authService.login(email, pass);
    setUser(u);
    showNotification(`Logged in as ${u.name}`);
  };

  const loginDemo = async () => {
    const u = await authService.loginDemo();
    setUser(u);
    showNotification('Continuing in Demo Mode as Ayush Innovator');
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(prev => (prev === msg ? null : prev));
    }, 4000);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        login,
        loginDemo,
        logout,
        language,
        setLanguage,
        t,
        jurisdiction,
        setJurisdiction,
        isDemoMode,
        setIsDemoMode,
        selectedSource,
        setSelectedSource,
        isEscalationOpen,
        setIsEscalationOpen,
        escalationDefaultQuery,
        setEscalationDefaultQuery,
        activeDemoQuery,
        setActiveDemoQuery,
        activeAnswerForEvidence,
        setActiveAnswerForEvidence,
        notification,
        showNotification
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

export const useTranslation = () => {
  const { t, language, setLanguage } = useApp();
  return { t, language, setLanguage };
};
