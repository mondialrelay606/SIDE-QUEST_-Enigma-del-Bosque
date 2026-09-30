import React from 'react';
import { ForestPack, StoryIntro, PlayerSession } from '../types';
import { SEED_FOREST_PACKS } from '../data/seedPacks';
import { useI18n } from '../context/I18nContext';
import {
  MapPin,
  BookOpen,
  Compass,
  Sparkles,
  KeyRound,
  ArrowRight,
  Award,
  Mic,
  Users,
  Play,
  LogOut,
  BookmarkCheck,
  Footprints,
  Radio,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { CharactersGallery } from './CharactersGallery';

interface ForestSelectorProps {
  forests: ForestPack[];
  onSelectForest: (forest: ForestPack) => void;
  onResumeGame: () => void;
  onInteractWithCharacter?: (story: StoryIntro, forest: ForestPack) => void;
  onStartRouteWithStory?: (forest: ForestPack, storyId: string) => void;
  loading: boolean;
  activeSession?: PlayerSession | null;
  selectedForest?: ForestPack | null;
  onContinueSavedGame?: () => void;
  onOpenPauseOrAbandon?: () => void;
}

export const ForestSelector: React.FC<ForestSelectorProps> = ({
  forests,
  onSelectForest,
  onResumeGame,
  onInteractWithCharacter,
  onStartRouteWithStory,
  loading,
  activeSession,
  selectedForest,
  onContinueSavedGame,
  onOpenPauseOrAbandon,
}) => {
  const { t } = useI18n();

  // Deduplicate and filter published forests (ensuring single Nalda)
  const displayForests = (forests && forests.length > 0 ? forests : SEED_FOREST_PACKS).filter(
    (f) => f.isPublished !== false && f.id !== 'nalda-fraybotijo'
  );

  const totalStories = displayForests.reduce((acc, f) => acc + (f.stories?.length || 0), 0);
  const totalPois = displayForests.reduce((acc, f) => acc + (f.pois?.length || 0), 0);
  const totalRiddles = displayForests.reduce((acc, f) => acc + (f.riddles?.length || 0), 0);

  const handleStartRoute = (forest: ForestPack, storyId: string) => {
    if (onStartRouteWithStory) {
      onStartRouteWithStory(forest, storyId);
    } else {
      onSelectForest(forest);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-12">
      {/* 1. Active / Paused Expedition Banner */}
      {activeSession && selectedForest && activeSession.status !== 'completed' && (
        <div className="rounded-3xl border border-amber-500/50 bg-gradient-to-r from-[#261E14] via-[#1C2C1F] to-[#122216] p-5 sm:p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5 animate-in fade-in duration-300">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[11px] font-bold border border-amber-500/40">
                <BookmarkCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('home.savedGameBanner') || 'Partida en Curso'}</span>
              </span>
              <span className="font-mono text-xs text-stone-300 font-semibold bg-black/40 px-2 py-0.5 rounded-md border border-white/10">
                Código: <strong className="text-amber-200 tracking-wider">{activeSession.code}</strong>
              </span>
            </div>
            <h3 className="font-adventure text-lg sm:text-xl font-bold text-amber-100">
              {selectedForest.name} — Hito {activeSession.currentPoiIndex + 1} de {activeSession.routePoiIds.length}
            </h3>
            <p className="text-xs text-stone-300 max-w-xl leading-relaxed">
              Tienes una expedición activa con <strong>{activeSession.points} puntos</strong> acumulados. Puedes retomarla exactamente donde la dejaste.
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
            {onContinueSavedGame && (
              <button
                type="button"
                onClick={onContinueSavedGame}
                className="flex-1 md:flex-none px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-adventure text-xs font-bold tracking-wider flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>{t('home.continueExpedition') || 'Continuar Expedición'}</span>
              </button>
            )}

            {onOpenPauseOrAbandon && (
              <button
                type="button"
                onClick={onOpenPauseOrAbandon}
                className="px-4 py-3 rounded-xl bg-stone-900/90 hover:bg-stone-800 border border-stone-700 text-stone-300 hover:text-red-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95"
                title={t('home.manageOrAbandon') || 'Gestionar'}
              >
                <LogOut className="w-3.5 h-3.5 text-stone-400" />
                <span>Abandonar</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 2. Hero Section */}
      <div className="relative rounded-3xl overflow-hidden border border-emerald-800/40 bg-gradient-to-b from-[#1F3323] via-[#17261A] to-[#111A13] p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/90 border border-emerald-500/40 text-xs font-semibold text-emerald-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Side Quest de Rastreo Narrativo al Aire Libre</span>
          </div>

          <h1 className="font-adventure text-3xl sm:text-5xl lg:text-6xl font-extrabold text-amber-100 tracking-tight leading-[1.1]">
            Enigma del Bosque
          </h1>

          <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-2xl font-sans">
            Recorre parajes naturales reales con geolocalización GPS, resuelve enigmas sobre hitos patrimoniales y conversa en tiempo real por voz con personajes históricos y fantásticos impulsados por IA.
          </p>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-stone-300 pt-1">
            <span className="font-medium text-emerald-400">{displayForests.length} Bosques Georreferenciados</span>
            <span aria-hidden="true" className="text-stone-600">·</span>
            <span className="font-medium text-amber-300">{totalStories} Historias Diferentes</span>
            <span aria-hidden="true" className="text-stone-600">·</span>
            <span className="font-medium text-teal-300">{totalPois} Hitos Patrimoniales</span>
            <span aria-hidden="true" className="text-stone-600">·</span>
            <span className="font-medium text-stone-300">Gemini 3.8 Live & Realidad Aumentada</span>
          </div>

          {/* Hero Action Buttons */}
          <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <a
              href="#bosques-list"
              className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-adventure text-sm font-bold tracking-wider shadow-lg shadow-emerald-950/80 active:scale-95 transition-all min-h-[48px]"
            >
              <Compass className="w-5 h-5 text-white" />
              <span>Explorar Bosques Disponibles</span>
            </a>

            <button
              type="button"
              onClick={onResumeGame}
              className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-stone-900/90 hover:bg-stone-800 border border-stone-700 text-amber-200 hover:text-white font-semibold text-sm transition-all shadow-md active:scale-95 min-h-[48px]"
            >
              <KeyRound className="w-5 h-5 text-amber-400" />
              <span>Reanudar con Código</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Forest Selection Grid */}
      <section id="bosques-list" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-emerald-900/60 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-400" />
              <h2 className="font-adventure text-2xl font-bold text-amber-100">
                Bosques y Territorios
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-stone-400">
              Selecciona tu destino para elegir historia, duración (30min - 2h) y dificultad.
            </p>
          </div>
          <span className="text-xs text-stone-400 self-start sm:self-auto font-mono">
            {displayForests.length} territorios listos
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayForests.map((forest) => {
            const poiCount = forest.pois?.length || 0;
            const storyCount = forest.stories?.length || 0;
            const riddleCount = forest.riddles?.length || 0;

            const coordsSnippet = forest.centerLat && forest.centerLng
              ? `${forest.centerLat.toFixed(4)}, ${forest.centerLng.toFixed(4)}`
              : null;

            return (
              <div
                key={forest.id}
                className="rounded-2xl overflow-hidden border border-emerald-900/60 hover:border-emerald-600/70 bg-[#162319] transition-all duration-300 hover:-translate-y-1 shadow-xl hover:shadow-2xl hover:shadow-black/70 flex flex-col justify-between group"
              >
                {/* Photo Banner */}
                <div className="relative h-48 w-full overflow-hidden bg-black">
                  <img
                    src={
                      forest.coverImageUrl ||
                      'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80'
                    }
                    alt={forest.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85 group-hover:opacity-95"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#162319] via-transparent to-black/50" />

                  {/* Location badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-[11px] font-semibold text-emerald-300">
                    <MapPin className="w-3 h-3 text-emerald-400" />
                    <span>{forest.region || forest.country || 'Geolocalizado'}</span>
                  </div>

                  {/* Coordinates label */}
                  {coordsSnippet && (
                    <div className="absolute bottom-2 left-3 text-[10px] font-mono text-stone-300/90 bg-black/60 px-2 py-0.5 rounded">
                      GPS: {coordsSnippet}
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2.5">
                    <h3 className="font-adventure text-xl font-bold text-amber-100 group-hover:text-amber-200 transition-colors leading-snug">
                      {forest.name}
                    </h3>
                    <p className="text-xs text-stone-300 line-clamp-3 leading-relaxed">
                      {forest.description || 'Recorrido de senderismo, historia y acertijos al aire libre.'}
                    </p>
                  </div>

                  {/* Clean unboxed metadata counts */}
                  <div className="py-2.5 border-y border-emerald-900/50 flex items-center justify-between text-center text-xs">
                    <div>
                      <div className="font-adventure font-bold text-emerald-400 text-sm">{poiCount}</div>
                      <div className="text-[10px] text-stone-400 uppercase tracking-wider">Hitos POI</div>
                    </div>
                    <div className="h-6 w-px bg-emerald-900/50" />
                    <div>
                      <div className="font-adventure font-bold text-amber-400 text-sm">{storyCount}</div>
                      <div className="text-[10px] text-stone-400 uppercase tracking-wider">Historias</div>
                    </div>
                    <div className="h-6 w-px bg-emerald-900/50" />
                    <div>
                      <div className="font-adventure font-bold text-teal-400 text-sm">{riddleCount}</div>
                      <div className="text-[10px] text-stone-400 uppercase tracking-wider">Enigmas</div>
                    </div>
                  </div>

                  {/* Stories inside this forest */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      <span>Historias ({storyCount}):</span>
                    </span>
                    <div className="space-y-1">
                      {forest.stories?.map((st) => (
                        <div
                          key={st.id}
                          className="flex items-center justify-between text-xs text-stone-200 bg-[#111A13] px-2.5 py-1.5 rounded-lg border border-emerald-950"
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <span>{st.icon}</span>
                            <span className="truncate">{st.title}</span>
                          </div>
                          <span className="text-[10px] text-stone-400 shrink-0 font-medium ml-2">
                            {st.narratorName?.split(' ')[0] || 'Guía'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA Buttons */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => onSelectForest(forest)}
                      className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-800 to-green-700 hover:from-emerald-700 hover:to-green-600 text-white font-adventure font-bold text-sm tracking-wider flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all min-h-[46px]"
                    >
                      <span>Entrar al Bosque</span>
                      <ArrowRight className="w-4 h-4 text-amber-300" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Personajes Vivos del Bosque (Showcasing all characters associated with stories) */}
      {displayForests.length > 0 && onInteractWithCharacter && (
        <CharactersGallery
          forests={displayForests}
          onInteractWithCharacter={onInteractWithCharacter}
          onStartRouteWithStory={handleStartRoute}
        />
      )}

      {/* 5. How It Works Quick Guide */}
      <section className="rounded-3xl border border-emerald-900/60 bg-[#142017] p-6 sm:p-8 space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h3 className="font-adventure text-xl sm:text-2xl font-bold text-amber-100">
            ¿Cómo se juega a Enigma del Bosque?
          </h3>
          <p className="text-xs text-stone-400">
            Una experiencia pensada para disfrutar al aire libre en familia, con amigos o en solitario.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-[#18261B] border border-emerald-900/50 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-700/50 flex items-center justify-center text-amber-300 font-adventure font-bold">
              1
            </div>
            <h4 className="font-adventure text-sm font-bold text-amber-100">Elige Bosque e Historia</h4>
            <p className="text-xs text-stone-300 leading-relaxed">
              Selecciona tu sendero favorito, la duración del paseo (30min a 2h) y tu nivel de desafío.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#18261B] border border-emerald-900/50 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-700/50 flex items-center justify-center text-amber-300 font-adventure font-bold">
              2
            </div>
            <h4 className="font-adventure text-sm font-bold text-amber-100">Camina con GPS Real</h4>
            <p className="text-xs text-stone-300 leading-relaxed">
              Sigue la brújula y el mapa interactivo. Los hitos se desbloquean al aproximarte físicamente.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#18261B] border border-emerald-900/50 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-700/50 flex items-center justify-center text-amber-300 font-adventure font-bold">
              3
            </div>
            <h4 className="font-adventure text-sm font-bold text-amber-100">Habla con tu Guía IA</h4>
            <p className="text-xs text-stone-300 leading-relaxed">
              Conversa por voz o chat en vivo con tu personaje, pide pistas sensoriales y admira reliquias en RA.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#18261B] border border-emerald-900/50 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-700/50 flex items-center justify-center text-amber-300 font-adventure font-bold">
              4
            </div>
            <h4 className="font-adventure text-sm font-bold text-amber-100">Meta-Enigma Final</h4>
            <p className="text-xs text-stone-300 leading-relaxed">
              Reúne las letras o runas místicas de cada hito para descifrar la clave final y obtener tu diploma.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
