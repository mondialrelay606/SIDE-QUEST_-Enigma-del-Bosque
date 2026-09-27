import React, { useState } from 'react';
import { ForestPack, StoryIntro } from '../types';
import { Users, Sparkles, Mic, Volume2, ArrowRight, Shield, Heart } from 'lucide-react';
import { sounds } from '../utils/audio';

interface CharactersGalleryProps {
  forest: ForestPack;
  onInteractWithCharacter: (story: StoryIntro) => void;
  onStartRouteWithStory: (storyId: string) => void;
}

export const CharactersGallery: React.FC<CharactersGalleryProps> = ({
  forest,
  onInteractWithCharacter,
  onStartRouteWithStory,
}) => {
  const [playingGreetingId, setPlayingGreetingId] = useState<string | null>(null);

  const handlePlayGreeting = (story: StoryIntro) => {
    if (playingGreetingId === story.id) {
      sounds.stopSpeaking();
      setPlayingGreetingId(null);
    } else {
      setPlayingGreetingId(story.id);
      const text = story.characterGreeting || `Saludos, soy ${story.narratorName || story.narrator?.name}. ${story.characterBio || story.narrative || story.summary}`;
      sounds.speakText(text, () => {
        setPlayingGreetingId(null);
      });
    }
  };

  return (
    <div className="space-y-4 pt-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-adventure text-xl font-bold text-amber-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <span>Personajes Vivos del Bosque</span>
          </h3>
          <p className="text-xs text-stone-400">
            Conversa por voz en tiempo real con los guías y guardianes que habitan estos senderos.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {forest.stories.map((story) => {
          return (
            <div
              key={story.id}
              className="p-4 sm:p-5 rounded-2xl bg-[#18241A] border border-emerald-900/60 hover:border-emerald-600/70 transition-all shadow-lg flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-2xl shadow group-hover:scale-105 transition-transform">
                      {story.narratorAvatar || story.narrator?.avatarEmoji || '🧙‍♂️'}
                    </div>
                    <div>
                      <h4 className="font-adventure text-base font-bold text-amber-100 group-hover:text-amber-200">
                        {story.narratorName || story.narrator?.name}
                      </h4>
                      <p className="text-[11px] text-emerald-400 font-medium">
                        {story.narratorRole || story.narrator?.role}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                    Voz: {story.voiceName || story.narrator?.ttsVoice || 'Zephyr'}
                  </span>
                </div>

                <p className="text-xs text-stone-300 line-clamp-3 leading-relaxed">
                  {story.characterBio || story.narrative || story.summary}
                </p>

                {story.characterGreeting && (
                  <div className="p-2.5 rounded-xl bg-black/30 border border-emerald-900/50 text-[11px] text-amber-200/90 italic font-serif">
                    "{story.characterGreeting}"
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-emerald-900/50">
                <button
                  type="button"
                  onClick={() => onInteractWithCharacter(story)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-700 to-green-600 hover:from-emerald-600 hover:to-green-500 text-white font-adventure text-xs font-bold flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
                >
                  <Mic className="w-3.5 h-3.5 text-amber-300" />
                  <span>Hablar por Voz</span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePlayGreeting(story)}
                  title="Escuchar saludo"
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center transition-colors ${
                    playingGreetingId === story.id
                      ? 'bg-amber-900/70 border-amber-500 text-amber-200'
                      : 'bg-stone-800 hover:bg-stone-700 border-stone-700 text-stone-300'
                  }`}
                >
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                </button>

                <button
                  type="button"
                  onClick={() => onStartRouteWithStory(story.id)}
                  title="Iniciar ruta con este personaje"
                  className="py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 hover:text-white text-xs font-semibold flex items-center gap-1 transition-all"
                >
                  <span>Elegir</span>
                  <ArrowRight className="w-3 h-3 text-emerald-400" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
