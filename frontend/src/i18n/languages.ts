import { Language } from '../types';

export interface LanguageOption {
  code: Language;
  label: string;
  native: string;
  englishName: string;
  flag?: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', native: 'English', englishName: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी', englishName: 'Hindi', flag: '🇮🇳' },
  { code: 'mr', label: 'Marathi', native: 'मराठी', englishName: 'Marathi', flag: '🇮🇳' },
  { code: 'sa', label: 'Sanskrit', native: 'संस्कृतम्', englishName: 'Sanskrit', flag: '🕉️' },
  { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી', englishName: 'Gujarati', flag: '🇮🇳' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা', englishName: 'Bengali', flag: '🇮🇳' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்', englishName: 'Tamil', flag: '🇮🇳' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు', englishName: 'Telugu', flag: '🇮🇳' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ', englishName: 'Kannada', flag: '🇮🇳' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം', englishName: 'Malayalam', flag: '🇮🇳' },
  { code: 'pa', label: 'Punjabi', native: 'ਪੰਜਾਬੀ', englishName: 'Punjabi', flag: '🇮🇳' },
  { code: 'or', label: 'Odia', native: 'ଓଡ଼ିଆ', englishName: 'Odia', flag: '🇮🇳' }
];

export const getLanguageByCode = (code: string): LanguageOption => {
  return LANGUAGES.find(l => l.code === code) || LANGUAGES[0];
};

export const getLanguageEnglishName = (code: string): string => {
  const lang = LANGUAGES.find(l => l.code === code);
  return lang ? lang.englishName : 'English';
};

/**
 * Triggers Google Translate in the DOM for full-page dynamic translation of arbitrary content
 */
export const triggerFullPageTranslation = (langCode: Language) => {
  try {
    const cookieVal = langCode === 'en' ? '/en/en' : `/en/${langCode}`;
    document.cookie = `googtrans=${cookieVal}; path=/;`;
    if (window.location.hostname !== 'localhost') {
      document.cookie = `googtrans=${cookieVal}; domain=.${window.location.hostname}; path=/;`;
    }

    const select = document.querySelector<HTMLSelectElement>('.goog-te-combo');
    if (select) {
      select.value = langCode;
      select.dispatchEvent(new Event('change'));
    }
  } catch (err) {
    console.debug('Full page translation trigger info:', err);
  }
};
