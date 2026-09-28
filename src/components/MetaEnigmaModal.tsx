import React, { useState } from 'react';
import { ForestPack, PlayerSession } from '../types';
import { X, Sparkles, KeyRound, CheckCircle2, Award, BookOpen } from 'lucide-react';
import { sounds } from '../utils/audio';

interface MetaEnigmaModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: PlayerSession;
  forest: ForestPack;
  onSolveMetaEnigma: (answer: string) => Promise<{ isCorrect: boolean; message: string }>;
  onFinishGame: (rating: number, comment: string) => void;
  highContrast?: boolean;
}

export const MetaEnigmaModal: React.FC<MetaEnigmaModalProps> = ({
  isOpen,
  onClose,
  session,
  forest,
  onSolveMetaEnigma,
  onFinishGame,
  highContrast,
}) => {
  const [wordInput, setWordInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ isCorrect?: boolean; message: string } | null>(null);
  const [solved, setSolved] = useState(session.metaEnigmaSolved || false);

  if (!isOpen) return null;

  const metaConfig = forest.metaEnigma || {
    keyword: 'ROBLE',
    title: 'El Códice del Bosque Sagrado',
    description: 'Reúne las runas que has encontrado en cada hito y descubre la palabra secreta que abre el pacto antiguo.',
    hint: 'El árbol protector del monte (5 letras).',
    successNarrative: '¡Has descifrado la palabra sagrada del bosque!',
  };

  const runes = session.collectedRunes || [];

  const handleValidate = async () => {
    if (!wordInput.trim() || loading) return;
    setLoading(true);
    setFeedback(null);

    const res = await onSolveMetaEnigma(wordInput.trim());
    setLoading(false);

    if (res.isCorrect) {
      setSolved(true);
      sounds.playSuccess();
      setFeedback({ isCorrect: true, message: res.message });
    } else {
      sounds.playError();
      setFeedback({ isCorrect: false, message: res.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-lg rounded-3xl border-2 shadow-2xl p-6 sm:p-8 space-y-6 text-stone-100 max-h-[90vh] overflow-y-auto ${
          highContrast
            ? 'bg-black border-yellow-400 text-white'
            : 'bg-gradient-to-b from-[#1C2C1E] via-[#142316] to-[#0D180F] border-amber-500/70'
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-stone-400 hover:text-white bg-black/40 hover:bg-black/60 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-13 h-13 rounded-2xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-300 shadow-inner shrink-0">
            <KeyRound className="w-7 h-7" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-300 font-mono flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Desafío Culminante</span>
            </div>
            <h3 className="font-adventure text-xl font-bold text-amber-100">
              {metaConfig.title}
            </h3>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
          {metaConfig.description}
        </p>

        {/* Collected Runes Codex Display */}
        <div className="p-4 sm:p-5 rounded-2xl bg-black/50 border border-emerald-900/80 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-400">
            <span className="flex items-center gap-1.5 text-amber-200">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>Runas halladas en la ruta ({runes.length}):</span>
            </span>
            <span className="text-[11px] font-mono text-emerald-400">
              {runes.length >= metaConfig.keyword.length ? 'Colección completa' : 'Sigue explorando'}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 py-2">
            {runes.map((r, i) => (
              <div
                key={i}
                className="w-12 h-14 rounded-xl bg-gradient-to-b from-amber-600 to-amber-800 text-stone-950 font-mono font-black text-2xl flex flex-col items-center justify-center border-2 border-amber-300 shadow-lg"
                title={`Hallada en hito: ${r.riddleName}`}
              >
                <span>{r.letter}</span>
                <span className="text-[8px] -mt-1 font-normal opacity-80">#{i + 1}</span>
              </div>
            ))}
            {Array.from({ length: Math.max(0, metaConfig.keyword.length - runes.length) }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="w-12 h-14 rounded-xl bg-stone-900/60 border border-dashed border-stone-700 text-stone-600 font-mono text-sm flex items-center justify-center"
              >
                ?
              </div>
            ))}
          </div>

          <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-[11px] text-amber-200 italic font-serif text-center">
            Pista del códice: "{metaConfig.hint}"
          </div>
        </div>

        {/* Solved state vs Input state */}
        {solved ? (
          <div className="p-5 rounded-2xl bg-emerald-950/80 border-2 border-emerald-500 space-y-4 text-center animate-in fade-in duration-300">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500 text-stone-950 text-2xl font-bold">
              ✓
            </div>
            <h4 className="font-adventure text-lg font-bold text-amber-100">
              ¡Pacto Sellado: {metaConfig.keyword}!
            </h4>
            <p className="text-xs text-stone-200 leading-relaxed font-serif italic">
              "{metaConfig.successNarrative}"
            </p>
            <div className="text-xs font-mono font-bold text-amber-300">
              +200 Puntos de Bonificación Otorgados
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 text-white font-adventure font-bold text-xs tracking-wider shadow"
            >
              Cerrar Códice
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {feedback && (
              <div
                className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2 ${
                  feedback.isCorrect
                    ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200'
                    : 'bg-red-950/90 border-red-500 text-red-200'
                }`}
              >
                {feedback.isCorrect ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <X className="w-4 h-4 text-red-400 shrink-0" />
                )}
                <span>{feedback.message}</span>
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                value={wordInput}
                onChange={(e) => setWordInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleValidate()}
                placeholder="Escribe la palabra secreta..."
                className="flex-1 px-4 py-3 rounded-xl bg-black/60 border border-amber-600/70 text-stone-100 font-mono font-bold tracking-widest uppercase focus:outline-none focus:border-amber-400 text-sm"
              />
              <button
                type="button"
                onClick={handleValidate}
                disabled={loading || !wordInput.trim()}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-stone-950 font-adventure font-bold text-xs tracking-wider shadow-lg active:scale-95 transition-all"
              >
                Descifrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
