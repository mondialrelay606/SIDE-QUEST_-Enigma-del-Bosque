import React from 'react';
import { useI18n } from '../context/I18nContext';
import { SupportedLanguage } from '../utils/i18n';
import { Globe } from 'lucide-react';

interface LanguageSelectorProps {
  className?: string;
  showIcon?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  className = '',
  showIcon = true,
}) => {
  const { currentLanguage, setLanguage } = useI18n();

  const languages: { code: SupportedLanguage; label: string; flag: string }[] = [
    { code: 'fr', label: 'FR', flag: '🇫🇷' },
    { code: 'es', label: 'ES', flag: '🇪🇸' },
    { code: 'en', label: 'EN', flag: '🇬🇧' },
  ];

  return (
    <div
      className={`inline-flex items-center bg-stone-900/90 border border-emerald-800/60 rounded-xl p-0.5 shadow-md shadow-black/40 backdrop-blur-md ${className}`}
      role="group"
      aria-label="Selector de idioma"
    >
      {showIcon && (
        <div className="pl-1.5 pr-1 hidden xs:flex items-center text-emerald-400/80">
          <Globe className="w-3.5 h-3.5" />
        </div>
      )}
      <div className="flex items-center gap-0.5">
        {languages.map((lang) => {
          const isActive = currentLanguage === lang.code;
          return (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold tracking-wider transition-all duration-150 flex items-center gap-1 ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-sm ring-1 ring-emerald-400/40 font-black'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/80'
              }`}
              title={`${lang.flag} ${lang.code.toUpperCase()}`}
            >
              <span>{lang.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
