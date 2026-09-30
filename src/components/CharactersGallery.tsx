import React, { useState } from 'react';
import { ForestPack, StoryIntro } from '../types';
import { useI18n } from '../context/I18nContext';
import { Users, Mic, Volume2, ArrowRight, BookOpen, Compass, ShieldAlert } from 'lucide-react';
import { sounds } from '../utils/audio';

export interface CharacterCardData {
  story: StoryIntro;
  forest: ForestPack;
  narratorName: string;
  narratorRole: string;
  narratorAvatar: string;
  voiceName: string;
  characterBio: string;
  characterGreeting: string;
  storyTitle: string;
  storyIcon: string;
  forestName: string;
  forestRegion: string;
  contentRating?: string;
}

interface CharactersGalleryProps {
  forests: ForestPack[];
  onInteractWithCharacter: (story: StoryIntro, forest: ForestPack) => void;
  onStartRouteWithStory: (forest: ForestPack, storyId: string) => void;
}

export const CharactersGallery: React.FC<CharactersGalleryProps> = ({
  forests,
  onInteractWithCharacter,
  onStartRouteWithStory,
}) => {
  const { t } = useI18n();
  const [playingGreetingId, setPlayingGreetingId] = useState<string | null>(null);
  const [filterForestId, setFilterForestId] = useState<string>('all');

  // Build complete list of characters across all forests and stories
  const allCharacters: CharacterCardData[] = forests.flatMap((forest) =>
    forest.stories.map((story) => ({
      story,
      forest,
      narratorName: story.narratorName || story.narrator?.name || 'Guía del Bosque',
      narratorRole: story.narratorRole || story.narrator?.role || 'Acompañante de ruta',
      narratorAvatar: story.narratorAvatar || story.narrator?.avatarEmoji || story.icon || '🧙‍♂️',
      voiceName: story.voiceName || story.narrator?.ttsVoice || 'Zephyr',
      characterBio: story.characterBio || story.narrative || story.summary || '',
      characterGreeting: story.characterGreeting || '',
      storyTitle: story.title,
      storyIcon: story.icon || '📜',
      forestName: forest.name,
      forestRegion: forest.region || forest.country || '',
      contentRating: story.contentRating || forest.contentRating,
    }))
  );

  const filteredCharacters = filterForestId === 'all'
    ? allCharacters
    : allCharacters.filter((item) => item.forest.id === filterForestId);

  const handlePlayGreeting = (char: CharacterCardData) => {
    if (playingGreetingId === char.story.id) {
      sounds.stopSpeaking();
      setPlayingGreetingId(null);
    } else {
      setPlayingGreetingId(char.story.id);
      const text =
        char.characterGreeting ||
        `Saludos, soy ${char.narratorName}. ${char.characterBio}`;
      sounds.speakText(text, () => {
        setPlayingGreetingId(null);
      });
    }
  };

  return (
    <section className="space-y-6 pt-6">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-emerald-900/60 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            <h3 className="font-adventure text-2xl font-bold text-amber-100">
              {t('characters.title') || 'Personajes Vivos del Bosque'}
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-stone-400 max-w-2xl leading-relaxed">
            {t('characters.subtitle') || 'Habla por voz o chat con los espíritus, cronistas, monjes y guardianes de cada historia. Cada uno conoce los secretos reales de su sendero.'}
          </p>
        </div>

        {/* Segmented Filter Control */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#121C14] rounded-xl border border-emerald-900/50 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setFilterForestId('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterForestId === 'all'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Todos ({allCharacters.length})
          </button>
          {forests.map((f) => {
            const count = f.stories.length;
            const isSelected = filterForestId === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilterForestId(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                {f.name.split('—')[0].trim()} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Characters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCharacters.map((char) => {
          const isPlaying = playingGreetingId === char.story.id;
          const isAdult = char.contentRating === 'adult';

          return (
            <div
              key={`${char.forest.id}-${char.story.id}`}
              className="rounded-2xl bg-[#17241A] border border-emerald-900/60 hover:border-emerald-600/70 p-5 flex flex-col justify-between space-y-4 shadow-lg hover:shadow-2xl hover:shadow-black/70 transition-all duration-200 group"
            >
              {/* Header Info */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-13 h-13 rounded-2xl flex items-center justify-center text-3xl shadow-md border transition-transform duration-300 ${
                        isPlaying
                          ? 'border-amber-400 bg-amber-950/60 scale-105 animate-pulse'
                          : 'border-emerald-700/50 bg-[#121E14] group-hover:scale-105'
                      }`}
                    >
                      <span>{char.narratorAvatar}</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-adventure text-base font-bold text-amber-100 group-hover:text-amber-200 leading-tight">
                          {char.narratorName}
                        </h4>
                        {isAdult && (
                          <span
                            className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-950 text-red-200 border border-red-500/70"
                            title="Contenido para adultos (+18)"
                          >
                            🔞 +18
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-emerald-400 font-medium line-clamp-1">
                        {char.narratorRole}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 text-stone-300 border border-white/10 shrink-0">
                    {char.voiceName}
                  </span>
                </div>

                {/* Association: Story and Forest */}
                <div className="space-y-1 pt-1 text-xs">
                  <div className="flex items-center gap-1.5 text-stone-200 font-medium">
                    <BookOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="text-stone-400 text-[11px]">Historia:</span>
                    <span className="truncate text-amber-200">{char.storyTitle}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-stone-400 text-[11px]">
                    <Compass className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{char.forestName}</span>
                    <span aria-hidden="true">·</span>
                    <span>{char.forestRegion}</span>
                  </div>
                </div>

                {/* Character Bio */}
                <p className="text-xs sm:text-sm text-stone-300 line-clamp-3 leading-relaxed">
                  {char.characterBio}
                </p>

                {/* Quoted Greeting */}
                {char.characterGreeting && (
                  <div className="p-3 rounded-xl bg-black/35 border border-emerald-900/40 text-xs text-amber-100/90 italic font-serif leading-relaxed">
                    "{char.characterGreeting}"
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-3 border-t border-emerald-900/50">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onInteractWithCharacter(char.story, char.forest)}
                    className="flex-1 py-3 px-3 rounded-xl bg-gradient-to-r from-emerald-700 to-green-600 hover:from-emerald-600 hover:to-green-500 text-white font-adventure text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all min-h-[46px]"
                  >
                    <Mic className="w-4 h-4 text-amber-300" />
                    <span>Hablar por Voz / Chat</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePlayGreeting(char)}
                    title={isPlaying ? 'Detener voz' : 'Escuchar saludo con voz'}
                    className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center transition-colors min-h-[46px] min-w-[46px] ${
                      isPlaying
                        ? 'bg-amber-900/80 border-amber-400 text-amber-200'
                        : 'bg-stone-800 hover:bg-stone-700 border-stone-700 text-stone-300'
                    }`}
                  >
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => onStartRouteWithStory(char.forest, char.story.id)}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#121F14] hover:bg-emerald-950 border border-emerald-800/60 hover:border-emerald-500 text-emerald-300 hover:text-white text-xs sm:text-sm font-medium flex items-center justify-center gap-1.5 transition-all active:scale-95 min-h-[42px]"
                >
                  <span>Jugar con este personaje en su historia</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
