import React, { useState } from 'react';
import { PlayerSession, ForestPack } from '../types';
import { Trophy, Star, Sparkles, CheckCircle2, MessageSquare, ArrowRight, Share2 } from 'lucide-react';
import { sounds } from '../utils/audio';

interface CompletionModalProps {
  session: PlayerSession;
  forest: ForestPack;
  onFinish: (rating: number, comment: string) => Promise<void>;
  loading: boolean;
}

export const CompletionModal: React.FC<CompletionModalProps> = ({
  session,
  forest,
  onFinish,
  loading,
}) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const story = forest.stories.find((s) => s.id === session.storyId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onFinish(rating, comment);
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#1F2E22] via-[#1A261D] to-[#141E16] border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-stone-100 text-center space-y-6 my-6">
        {/* Triumph Trophy Emblem */}
        <div className="relative mx-auto w-20 h-20 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-300 p-0.5 shadow-xl shadow-amber-950 flex items-center justify-center">
          <div className="w-full h-full bg-[#18261A] rounded-full flex items-center justify-center">
            <Trophy className="w-10 h-10 text-amber-300 animate-bounce" />
          </div>
          <Sparkles className="absolute -top-1 -right-1 w-6 h-6 text-amber-200 animate-spin-slow" />
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-xs font-semibold text-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>¡Expedición Completada con Éxito!</span>
          </div>

          <h2 className="font-adventure text-2xl sm:text-3xl font-extrabold text-amber-100">
            Honor al Gran Explorador
          </h2>

          <p className="text-xs sm:text-sm text-stone-300 max-w-sm mx-auto">
            {session.name}, has recorrido todos los hitos de <strong>{forest.name}</strong> y desentrañado la senda de <em>"{story?.title}"</em>.
          </p>
        </div>

        {/* Score Card */}
        <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-black/40 border border-emerald-900/60 text-center">
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-300 font-mono">
              {session.points}
            </div>
            <div className="text-[11px] text-stone-400 uppercase tracking-wider">
              Puntos Obtenidos
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
              {session.routePoiIds.length}/{session.routePoiIds.length}
            </div>
            <div className="text-[11px] text-stone-400 uppercase tracking-wider">
              Puntos Resueltos
            </div>
          </div>
        </div>

        {/* Rating and Feedback Form */}
        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4 text-left pt-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-emerald-300 text-center mb-2">
                ¿Qué te ha parecido la experiencia por el bosque?
              </label>
              {/* Star Rating Buttons */}
              <div className="flex justify-center items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 transition-transform hover:scale-125 focus:outline-none"
                  >
                    <Star
                      className={`w-7 h-7 sm:w-8 sm:h-8 ${
                        star <= rating
                          ? 'fill-amber-400 text-amber-400 drop-shadow'
                          : 'text-stone-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-400 mb-1">
                Comentario para el cuaderno de bitácora (opcional):
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="¿Qué acertijo te ha gustado más? ¿Qué tal la senda a pie?"
                rows={2}
                maxLength={240}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-emerald-800/60 text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-stone-950 font-adventure font-bold text-sm tracking-wide shadow-lg shadow-amber-950/60 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Enviar Valoración y Finalizar</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="p-4 bg-emerald-950/70 border border-emerald-700/60 rounded-xl text-center space-y-2">
            <p className="text-emerald-300 font-bold text-sm">
              ¡Muchas gracias por tu opinión!
            </p>
            <p className="text-xs text-stone-400">
              Tu valoración ha quedado registrada en el cuaderno del bosque.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
