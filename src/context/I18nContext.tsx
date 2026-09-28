import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { SupportedLanguage, t as translateKey, getLocalizedForest } from '../utils/i18n';
import { ForestPack } from '../types';

interface I18nContextType {
  currentLanguage: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  localizeForest: (forest: ForestPack) => ForestPack;
  onForestSelected: (forest: ForestPack) => void;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initial state: defaults to 'fr' (or saved lang if user already interacted)
  const [currentLanguage, setCurrentLanguageState] = useState<SupportedLanguage>(() => {
    try {
      const saved = localStorage.getItem('enigma_lang');
      if (saved === 'fr' || saved === 'es' || saved === 'en') {
        return saved;
      }
    } catch (e) {}
    return 'fr'; // Canéjan-Cestas default
  });

  const setLanguage = (lang: SupportedLanguage) => {
    setCurrentLanguageState(lang);
    try {
      localStorage.setItem('enigma_lang', lang);
    } catch (e) {}
  };

  /**
   * "Al abrir un bosque por primera vez, se usa el idioma propio de ese bosque, no el del navegador."
   */
  const onForestSelected = (forest: ForestPack) => {
    if (!forest) return;
    const forestDefLang = (forest.defaultLanguage as SupportedLanguage) || 'es';
    if (forestDefLang === 'fr' || forestDefLang === 'es' || forestDefLang === 'en') {
      setLanguage(forestDefLang);
    }
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    return translateKey(key, currentLanguage, params);
  };

  const localizeForest = (forest: ForestPack): ForestPack => {
    return getLocalizedForest(forest, currentLanguage);
  };

  const value = useMemo(
    () => ({
      currentLanguage,
      setLanguage,
      t,
      localizeForest,
      onForestSelected,
    }),
    [currentLanguage]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
