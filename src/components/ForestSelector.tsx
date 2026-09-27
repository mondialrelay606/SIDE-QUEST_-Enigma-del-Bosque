import React from 'react';
import { ForestPack, StoryIntro } from '../types';
import { MapPin, BookOpen, Compass, Sparkles, KeyRound, PlusCircle, ArrowRight, Award, Mic, Users } from 'lucide-react';
import { CharactersGallery } from './CharactersGallery';

interface ForestSelectorProps {
  forests: ForestPack[];
  onSelectForest: (forest: ForestPack) => void;
  onResumeGame: () => void;
  onOpenAdmin: () => void;
  isAdminAuthenticated?: boolean;
  onInteractWithCharacter?: (story: StoryIntro, forest: ForestPack) => void;
  loading: boolean;
}

export const ForestSelector: React.FC<ForestSelectorProps> = ({
  forests,
  onSelectForest,
  onResumeGame,
  onOpenAdmin,
  isAdminAuthenticated = false,
  onInteractWithCharacter,
  loading,
}) => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      {/* Hero Presentation */}
      <div className="relative rounded-3xl overflow-hidden border border-emerald-800/40 bg-gradient-to-b from-[#223525] via-[#1B291E] to-[#141F16] p-6 sm:p-10 shadow-2xl shadow-black/60">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-500/30 text-xs font-semibold text-emerald-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Aventura interactiva a pie por la naturaleza</span>
          </div>

          <h2 className="font-adventure text-3xl sm:text-5xl font-extrabold text-amber-100 leading-tight">
            Descifra los secretos que esconde el bosque
          </h2>

          <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
            Una búsqueda del tesoro y <em>side quest</em> narrativa para recorrer a pie con tu móvil.
            Elige un bosque, camina hacia cada punto de interés y resuelve los acertijos con la ayuda del guía del monte.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onResumeGame}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-stone-800/90 hover:bg-stone-700/90 border border-stone-600/50 text-amber-200 hover:text-white font-semibold text-sm transition-all shadow-md active:scale-95"
            >
              <KeyRound className="w-4 h-4 text-amber-400" />
              <span>Retomar partida con código</span>
            </button>

            <button
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-950/80 hover:bg-emerald-900/90 border border-emerald-700/50 text-emerald-300 hover:text-emerald-100 font-semibold text-sm transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-amber-400" />
              <span>{isAdminAuthenticated ? 'Panel Administrador (Activo)' : 'Gestionar Bosques (Admin)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Forest Packs Section */}
      <div className="space-y-5">
        <div className="flex items-center justify-between border-b border-emerald-900/60 pb-3">
          <div>
            <h3 className="font-adventure text-xl sm:text-2xl font-bold text-amber-100 flex items-center gap-2">
              <Compass className="w-6 h-6 text-emerald-400" />
              <span>Elige tu Bosque de Aventura</span>
            </h3>
            <p className="text-xs sm:text-sm text-stone-400">
              Selecciona el bosque que vas a recorrer físicamente hoy
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/50">
            {forests.length} disponibles
          </span>
        </div>

        {loading ? (
          <div className="py-20 text-center text-stone-400 space-y-3">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm">Buscando rutas forestales...</p>
          </div>
        ) : forests.length === 0 ? (
          <div className="text-center py-12 bg-stone-900/40 rounded-2xl border border-stone-800 p-8 space-y-4">
            <p className="text-stone-300">No hay bosques publicados actualmente.</p>
            <button
              onClick={onOpenAdmin}
              className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-medium text-sm"
            >
              Crear primer bosque en el Panel de Administración
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {forests.map((forest) => {
              const poiCount = forest.pois?.length || 0;
              const storyCount = forest.stories?.length || 0;
              const riddleCount = forest.riddles?.length || 0;

              return (
                <div
                  key={forest.id}
                  className="group relative rounded-2xl overflow-hidden border border-emerald-900/50 hover:border-emerald-600/70 bg-[#1A261D] transition-all duration-200 hover:-translate-y-1 shadow-lg hover:shadow-2xl hover:shadow-black/70 flex flex-col justify-between"
                >
                  {/* Image banner */}
                  <div className="relative h-44 w-full overflow-hidden bg-stone-950">
                    <img
                      src={forest.coverImageUrl || "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80"}
                      alt={forest.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1A261D] via-transparent to-black/40" />

                    <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-semibold text-emerald-300">
                      <MapPin className="w-3 h-3 text-emerald-400" />
                      <span>{forest.country || "Ubicación Georreferenciada"}</span>
                    </div>

                    {forest.attribution && (
                      <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded bg-amber-950/80 border border-amber-600/40 text-[10px] text-amber-200" title={forest.attribution}>
                        <Award className="w-3 h-3 text-amber-400" />
                        <span className="hidden sm:inline">FOR[Ê]VEUR 2026</span>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-adventure text-xl font-bold text-amber-100 group-hover:text-amber-200 transition-colors">
                        {forest.name}
                      </h4>
                      <p className="text-xs sm:text-sm text-stone-300 line-clamp-3 leading-relaxed">
                        {forest.description || "Recorrido de senderismo y acertijos botánicos e históricos."}
                      </p>
                    </div>

                    {/* Meta stats chips */}
                    <div className="grid grid-cols-3 gap-2 py-2 border-y border-emerald-900/40 text-center">
                      <div className="bg-[#141E16] p-2 rounded-lg">
                        <div className="text-base font-bold text-emerald-400">{poiCount}</div>
                        <div className="text-[10px] text-stone-400 uppercase tracking-wider">Puntos POI</div>
                      </div>
                      <div className="bg-[#141E16] p-2 rounded-lg">
                        <div className="text-base font-bold text-amber-400">{storyCount}</div>
                        <div className="text-[10px] text-stone-400 uppercase tracking-wider">Historias</div>
                      </div>
                      <div className="bg-[#141E16] p-2 rounded-lg">
                        <div className="text-base font-bold text-teal-400">{riddleCount}</div>
                        <div className="text-[10px] text-stone-400 uppercase tracking-wider">Acertijos</div>
                      </div>
                    </div>

                    {/* Stories preview */}
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-semibold text-emerald-400/90 uppercase tracking-wider flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        <span>Ambientaciones disponibles:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {forest.stories?.map((st) => (
                          <span
                            key={st.id}
                            className="inline-flex items-center gap-1 text-[11px] bg-emerald-950/70 border border-emerald-800/40 text-stone-200 px-2 py-0.5 rounded"
                          >
                            <span>{st.icon}</span>
                            <span>{st.title}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Action button */}
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => onSelectForest(forest)}
                        className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-800 to-green-700 hover:from-emerald-700 hover:to-green-600 text-amber-100 hover:text-white font-adventure font-bold text-sm tracking-wide transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2"
                      >
                        <span>Entrar en este Bosque</span>
                        <ArrowRight className="w-4 h-4 text-amber-300" />
                      </button>

                      {onInteractWithCharacter && forest.stories[0] && (
                        <button
                          onClick={() => onInteractWithCharacter(forest.stories[0], forest)}
                          title={`Hablar por voz con ${forest.stories[0].narratorName}`}
                          className="px-3.5 py-3 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600/50 text-amber-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-semibold"
                        >
                          <Mic className="w-4 h-4 text-emerald-400" />
                          <span className="hidden sm:inline">Voz</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Featured Characters Section */}
      {forests.length > 0 && onInteractWithCharacter && (
        <div className="pt-4 border-t border-emerald-900/60">
          <CharactersGallery
            forest={forests[0]}
            onInteractWithCharacter={(story) => onInteractWithCharacter(story, forests[0])}
            onStartRouteWithStory={(storyId) => {
              const target = forests.find((f) => f.stories.some((s) => s.id === storyId)) || forests[0];
              onSelectForest(target);
            }}
          />
        </div>
      )}
    </div>
  );
};
