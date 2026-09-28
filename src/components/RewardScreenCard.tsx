import React from 'react';
import { WindmillPOI, StoryIntro, ForestPack, PlayerSession } from '../types';
import { Award, ArrowRight, Sparkles, CheckCircle, KeyRound, BookmarkCheck } from 'lucide-react';

interface RewardScreenCardProps {
  session: PlayerSession;
  currentPoi: WindmillPOI;
  nextPoi?: WindmillPOI;
  forest: ForestPack;
  story?: StoryIntro;
  onContinue: () => void;
  highContrast?: boolean;
}

export const RewardScreenCard: React.FC<RewardScreenCardProps> = ({
  session,
  currentPoi,
  nextPoi,
  forest,
  story,
  onContinue,
  highContrast,
}) => {
  const currentRune = session.collectedRunes?.find((r) => r.poiId === currentPoi.id);
  const totalPois = session.routePoiIds.length;
  const isFinalPoi = session.currentPoiIndex + 1 >= totalPois;

  return (
    <div
      className={`rounded-3xl border transition-all duration-300 overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6 text-center ${
        highContrast
          ? 'bg-black border-yellow-400 text-white'
          : 'bg-gradient-to-b from-[#1E2E20] via-[#162518] to-[#111C13] border-amber-500/60 text-stone-100'
      }`}
    >
      {/* Triumphal Icon */}
      <div className="relative inline-flex items-center justify-center">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-600 to-yellow-400 text-stone-950 flex items-center justify-center text-4xl shadow-xl shadow-amber-950/80 animate-bounce">
          <Award className="w-10 h-10" />
        </div>
        <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow">
          <CheckCircle className="w-4 h-4" />
        </div>
      </div>

      <div className="space-y-2">
        <span className="text-xs uppercase font-adventure font-bold tracking-widest text-amber-300">
          ¡Hito Superado con Éxito!
        </span>
        <h2 className="font-adventure text-2xl sm:text-3xl font-extrabold text-amber-100">
          Has Descifrado el Enigma de {currentPoi.name}
        </h2>
        <p className="text-sm text-stone-300 max-w-lg mx-auto leading-relaxed">
          Tus observaciones agudas y deducciones han abierto el sendero. Tus puntos se han sumado al registro de la expedición.
        </p>
      </div>

      {/* Meta-Enigma Rune Reveal Box */}
      {currentRune && (
        <div className="p-5 rounded-2xl bg-black/50 border border-amber-500/50 max-w-md mx-auto space-y-3">
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Runa Revelada para el Códice</span>
          </div>

          <div className="flex items-center justify-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-stone-950 flex items-center justify-center text-3xl font-mono font-black border-2 border-amber-300 shadow-lg">
              {currentRune.letter}
            </div>
            <div className="text-left">
              <div className="font-adventure font-bold text-amber-100 text-base">
                Letra «{currentRune.letter}»
              </div>
              <div className="text-xs text-stone-300">
                Guardada en tu mochila para el Meta-Enigma final.
              </div>
              <div className="text-[11px] text-emerald-400 font-mono mt-0.5">
                Progreso del códice: {session.collectedRunes?.length || 1} / {totalPois} letras
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Points & Stats Banner */}
      <div className="flex items-center justify-center gap-4 text-xs font-mono font-bold">
        <div className="px-4 py-2 rounded-xl bg-black/40 border border-emerald-800 text-emerald-300">
          Puntos totales: <span className="text-amber-300 text-sm">{session.points}</span>
        </div>
        <div className="px-4 py-2 rounded-xl bg-black/40 border border-emerald-800 text-stone-300">
          Hito {session.currentPoiIndex + 1} de {totalPois}
        </div>
      </div>

      {/* Next Step Action Button */}
      <div className="pt-2 max-w-md mx-auto">
        <button
          type="button"
          onClick={onContinue}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-adventure font-bold text-sm sm:text-base tracking-wide shadow-xl shadow-emerald-950/80 active:scale-95 transition-all flex items-center justify-center gap-2.5"
        >
          {isFinalPoi ? (
            <>
              <KeyRound className="w-5 h-5 text-amber-300" />
              <span>Abrir el Meta-Enigma Final del Bosque</span>
            </>
          ) : (
            <>
              <span>Iniciar marcha hacia: {nextPoi?.name || 'Siguiente Hito'}</span>
              <ArrowRight className="w-5 h-5 text-amber-300" />
            </>
          )}
        </button>

        {!isFinalPoi && nextPoi && (
          <p className="text-[11px] text-stone-400 mt-2">
            La siguiente prueba permanecerá oculta hasta que alcances físicamente {nextPoi.name}.
          </p>
        )}
      </div>
    </div>
  );
};
