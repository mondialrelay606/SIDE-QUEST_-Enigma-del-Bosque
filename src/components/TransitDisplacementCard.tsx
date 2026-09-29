import React from 'react';
import { WindmillPOI, StoryIntro, ForestPack } from '../types';
import { formatDistance, calculateHaversineDistance, calculateBearing } from '../utils/geo';
import { useI18n } from '../context/I18nContext';
import { Compass, Footprints, Clock, CheckCircle2, MapPin, Eye, Sparkles, AlertCircle } from 'lucide-react';

interface TransitDisplacementCardProps {
  currentPoi: WindmillPOI;
  previousPoi?: WindmillPOI;
  forest: ForestPack;
  story?: StoryIntro;
  playerLat: number;
  playerLng: number;
  distanceMeters: number;
  bearing: number;
  arrivalRadiusMeters: number;
  isNearPoi: boolean;
  onConfirmArrival: () => void;
  onOpenVisualConfirm: () => void;
  highContrast?: boolean;
}

export const TransitDisplacementCard: React.FC<TransitDisplacementCardProps> = ({
  currentPoi,
  previousPoi,
  forest,
  story,
  distanceMeters,
  bearing,
  arrivalRadiusMeters,
  isNearPoi,
  onConfirmArrival,
  onOpenVisualConfirm,
  highContrast,
}) => {
  const { t } = useI18n();

  // Estimated walking time at ~4.5 km/h (~75 m/min)
  const walkingMinutes = Math.max(1, Math.round(distanceMeters / 75));

  // Determine bridge phrase
  const bridgeKey = previousPoi ? `${previousPoi.id}_to_${currentPoi.id}` : '';
  const bridgePhrase =
    forest.bridgePhrases?.[bridgeKey] ||
    `¡Buen trabajo! Ahora sigue el sendero marcado hacia ${currentPoi.name}. Presta atención a las señales del bosque y camina con calma.`;

  const getCardinal = (deg: number): string => {
    const directions = [
      'cardinal.north',
      'cardinal.northeast',
      'cardinal.east',
      'cardinal.southeast',
      'cardinal.south',
      'cardinal.southwest',
      'cardinal.west',
      'cardinal.northwest',
    ];
    const idx = Math.round(((deg %= 360) < 0 ? deg + 360 : deg) / 45) % 8;
    return t(directions[idx]);
  };

  return (
    <div
      className={`rounded-3xl border transition-all duration-300 overflow-hidden shadow-2xl ${
        highContrast
          ? 'bg-black border-yellow-400 text-white'
          : 'bg-gradient-to-b from-[#1C2C1F] via-[#162419] to-[#0F1B12] border-emerald-700/60 text-stone-100'
      }`}
    >
      {/* Displacement Header Banner */}
      <div className="p-5 sm:p-6 border-b border-emerald-900/60 bg-emerald-950/40 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-adventure text-xs font-bold border border-amber-500/40 flex items-center gap-1.5 animate-pulse">
              <Footprints className="w-3.5 h-3.5" />
              <span>{t('transit.headingTo')} {currentPoi.name}</span>
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/40 border border-emerald-800/40 text-emerald-300 font-mono font-bold">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('transit.eta', { minutes: walkingMinutes })}</span>
            </div>
          </div>
        </div>

        <h3 className="font-adventure text-xl sm:text-2xl font-extrabold text-amber-100 flex items-center gap-2.5">
          <span>{currentPoi.emoji}</span>
          <span>{t('transit.headingTo')}: {currentPoi.name}</span>
        </h3>
      </div>

      {/* Guide Bridge Phrase */}
      <div className="p-5 sm:p-6 space-y-5">
        <div className="p-4 rounded-2xl bg-black/35 border border-amber-600/30 text-amber-100/90 text-sm sm:text-base leading-relaxed font-serif italic flex items-start gap-3">
          <span className="text-2xl shrink-0 not-italic select-none">{story?.narratorAvatar || '🦉'}</span>
          <div>
            <div className="not-italic text-[11px] font-sans font-bold uppercase tracking-wider text-amber-400 mb-1">
              {t('transit.guideMessage')} ({story?.narratorName || 'Guardián'}):
            </div>
            <span>"{bridgePhrase}"</span>
          </div>
        </div>

        {/* Big Interactive Compass & Distance Display */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          {/* Visual Compass Dial */}
          <div className="p-6 rounded-2xl bg-black/40 border border-emerald-900/80 flex flex-col items-center justify-center space-y-3 text-center">
            <div className="relative w-36 h-36 flex items-center justify-center">
              {/* Outer compass ring */}
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-emerald-600/50 animate-spin-slow" />
              <div className="absolute inset-2 rounded-full border border-amber-400/30 bg-emerald-950/60 shadow-inner" />

              {/* Cardinal marks */}
              <span className="absolute top-1 text-[10px] font-mono font-bold text-amber-300">N</span>
              <span className="absolute bottom-1 text-[10px] font-mono font-bold text-stone-400">S</span>
              <span className="absolute right-1 text-[10px] font-mono font-bold text-stone-400">E</span>
              <span className="absolute left-1 text-[10px] font-mono font-bold text-stone-400">O</span>

              {/* Rotating pointer needle */}
              <div
                className="w-24 h-24 flex items-center justify-center transition-transform duration-700 ease-out"
                style={{ transform: `rotate(${bearing}deg)` }}
              >
                <div className="flex flex-col items-center justify-center">
                  <div className="w-0 h-0 border-x-8 border-x-transparent border-b-[36px] border-b-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-stone-900 border-2 border-white -my-1 z-10" />
                  <div className="w-0 h-0 border-x-8 border-x-transparent border-t-[36px] border-t-red-600 drop-shadow" />
                </div>
              </div>
            </div>

            <div className="space-y-0.5">
              <div className="text-xs uppercase tracking-wider text-stone-400 font-semibold">
                {t('transit.navHeading')}
              </div>
              <div className="font-adventure font-bold text-amber-200 text-sm">
                {t('transit.towards', { cardinal: getCardinal(bearing), degrees: Math.round(bearing) })}
              </div>
            </div>
          </div>

          {/* Distance and ETA Card */}
          <div className="space-y-3">
            <div className="p-5 rounded-2xl bg-black/40 border border-emerald-900/80 space-y-2">
              <div className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                {t('transit.poiDistance')}
              </div>
              <div className="font-mono text-3xl sm:text-4xl font-black text-emerald-300">
                {formatDistance(distanceMeters)}
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">
                {t('transit.unlockRadius', { meters: arrivalRadiusMeters })}
              </p>
            </div>

            {/* Anti-cheat & Arrival Notification */}
            <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200/90 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p>
                {t('transit.sealedWarning')}
              </p>
            </div>
          </div>
        </div>

        {/* Arrival Status & Fallback Action */}
        <div className="pt-2">
          {isNearPoi ? (
            <div className="p-4 rounded-2xl bg-emerald-950/80 border-2 border-emerald-500 text-emerald-200 space-y-3 animate-in fade-in duration-300">
              <div className="flex items-center gap-2.5 font-adventure font-bold text-base text-emerald-100">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>{t('transit.arrived')}</span>
              </div>
              <p className="text-xs text-stone-300">
                {t('transit.gpsDetectedDesc')}
              </p>
              <button
                type="button"
                onClick={onConfirmArrival}
                className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-adventure font-bold text-sm tracking-wide shadow-lg shadow-emerald-950/80 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{t('transit.unlockChallenge')}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                {/* Fallback "Estoy aquí" Button without penalty */}
                <button
                  type="button"
                  onClick={onConfirmArrival}
                  className="flex-1 w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-800 to-green-700 hover:from-emerald-700 hover:to-green-600 text-amber-100 hover:text-white font-adventure font-bold text-xs sm:text-sm tracking-wider flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
                  title={t('transit.imHereConfirm')}
                >
                  <MapPin className="w-4 h-4 text-amber-300" />
                  <span>{t('transit.imHere')}</span>
                </button>

                {/* Double verification by image */}
                <button
                  type="button"
                  onClick={onOpenVisualConfirm}
                  className="w-full sm:w-auto py-3.5 px-4 rounded-xl bg-stone-900/90 hover:bg-stone-800 border border-stone-700 text-stone-200 text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                >
                  <Eye className="w-4 h-4 text-emerald-400" />
                  <span>{t('transit.viewLandmarks')}</span>
                </button>
              </div>

              <p className="text-[11px] text-center text-stone-400">
                {t('transit.weakGps')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
