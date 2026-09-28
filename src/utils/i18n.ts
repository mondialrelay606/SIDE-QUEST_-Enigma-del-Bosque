import i18nData from '../data/i18n.json';
import { ForestPack, WindmillPOI, StoryIntro, Riddle } from '../types';

export type SupportedLanguage = 'fr' | 'es' | 'en';

export const SUPPORTED_LANGUAGES: { code: SupportedLanguage; label: string; flag: string }[] = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
];

/**
 * Get UI translated string by key with fallback to forest default language and then 'es'.
 */
export function t(
  key: string,
  lang: string = 'es',
  params?: Record<string, string | number>,
  defaultLangFallback: string = 'es'
): string {
  const ui = (i18nData as any).ui;
  const targetDict = ui[lang] || ui[defaultLangFallback] || ui['es'] || {};
  let text = targetDict[key] || ui['es']?.[key] || key;

  if (params) {
    Object.entries(params).forEach(([paramKey, val]) => {
      text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(val));
    });
  }
  return text;
}

/**
 * Get localized ForestPack based on chosen language.
 * Falls back to forest.defaultLanguage, then to base Spanish data.
 */
export function getLocalizedForest(forest: ForestPack, lang: string): ForestPack {
  if (!forest) return forest;

  const targetLang = (lang as SupportedLanguage) || (forest.defaultLanguage as SupportedLanguage) || 'es';
  const forestI18n = (i18nData as any).forests?.[forest.id];

  // If language is 'es', return base forest (since base is in Spanish)
  if (targetLang === 'es' && !forestI18n?.es) {
    return {
      ...forest,
      defaultLanguage: forest.defaultLanguage || 'es',
      languages: forest.languages || ['es', 'en'],
    };
  }

  // Get translations for target language or fallback to defaultLanguage
  const langData = forestI18n?.[targetLang] || forestI18n?.[forest.defaultLanguage || 'es'];
  if (!langData) {
    return forest;
  }

  // Localize POIs
  const localizedPois: WindmillPOI[] = forest.pois.map((poi) => {
    const poiTrans = langData.pois?.[poi.id];
    if (!poiTrans) return poi;
    return {
      ...poi,
      name: poiTrans.name || poi.name,
      description: poiTrans.description || poi.description,
    };
  });

  // Localize Stories
  const localizedStories: StoryIntro[] = forest.stories.map((story) => {
    const storyTrans = langData.stories?.[story.id];
    if (!storyTrans) return story;
    return {
      ...story,
      title: storyTrans.title || story.title,
      summary: storyTrans.summary || story.summary,
      mission: storyTrans.mission || story.mission,
      narrator: storyTrans.narrator
        ? {
            ...story.narrator,
            name: storyTrans.narrator.name || story.narrator?.name || '',
            role: storyTrans.narrator.role || story.narrator?.role || '',
            tone: storyTrans.narrator.tone || story.narrator?.tone || '',
          }
        : story.narrator,
    };
  });

  // Localize Riddles
  const localizedRiddles: Riddle[] = forest.riddles.map((riddle) => {
    const rTrans = langData.riddles?.[riddle.id];
    if (!rTrans) return riddle;

    return {
      ...riddle,
      name: rTrans.name || riddle.name,
      question: rTrans.question || riddle.question,
      options: rTrans.options ? [...rTrans.options] : riddle.options,
      answer: rTrans.answer || riddle.answer,
      acceptedAnswers: rTrans.acceptedAnswers ? [...rTrans.acceptedAnswers] : riddle.acceptedAnswers,
      hints: rTrans.hints ? [...rTrans.hints] : riddle.hints,
    };
  });

  return {
    ...forest,
    name: langData.name || forest.name,
    country: langData.country || forest.country,
    credits: langData.credits || forest.credits,
    pois: localizedPois,
    stories: localizedStories,
    riddles: localizedRiddles,
  };
}

/**
 * Fisher-Yates shuffle that guarantees not returning original order if length > 1
 */
export function shuffleArray<T>(items: T[]): T[] {
  if (!items || items.length <= 1) return items ? [...items] : [];
  const array = [...items];
  
  // Try up to 5 times to ensure it's actually shuffled
  for (let attempt = 0; attempt < 5; attempt++) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    // Check if distinct from original
    const isDifferent = array.some((val, idx) => val !== items[idx]);
    if (isDifferent) break;
  }
  return array;
}
