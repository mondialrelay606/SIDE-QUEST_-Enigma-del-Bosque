import React, { useState, useEffect } from 'react';
import { Riddle } from '../types';
import {
  Camera,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  Compass,
  Volume2,
  VolumeX,
  Plus,
  Minus,
  MoveUp,
  MoveDown,
  Sparkles,
  KeyRound,
  Eye,
  RotateCcw,
} from 'lucide-react';
import { sounds } from '../utils/audio';

interface RiddleTypeInteractiveProps {
  riddle: Riddle;
  onSubmit: (answer: string, riddleId?: string) => Promise<{ isCorrect: boolean; message?: string }>;
  loading: boolean;
  highContrast?: boolean;
}

export const RiddleTypeInteractive: React.FC<RiddleTypeInteractiveProps> = ({
  riddle,
  onSubmit,
  loading,
  highContrast,
}) => {
  const [textAnswer, setTextAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // Photo state
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoTaken, setPhotoTaken] = useState(false);

  // Count state
  const [counterVal, setCounterVal] = useState<number>(riddle.targetCount ? Math.max(1, riddle.targetCount - 2) : 5);

  // Compass state
  const [compassHeading, setCompassHeading] = useState<number>(180);
  const targetBearing = riddle.targetBearing ?? 0;
  const tolerance = riddle.compassTolerance ?? 25;
  const diffBearing = Math.abs((compassHeading - targetBearing + 180) % 360 - 180);
  const isCompassAligned = diffBearing <= tolerance;

  // Audio state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Order state
  const [orderedItems, setOrderedItems] = useState<string[]>(
    riddle.orderItems ? [...riddle.orderItems] : []
  );

  // Feedback state
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ isCorrect?: boolean; message: string } | null>(null);

  useEffect(() => {
    // Reset answers when riddle changes
    setTextAnswer('');
    setSelectedOption(null);
    setPhotoPreview(null);
    setPhotoTaken(false);
    setFeedback(null);
    if (riddle.orderItems) {
      // Shuffle items for the player to arrange
      setOrderedItems([...riddle.orderItems].sort(() => Math.random() - 0.5));
    }
  }, [riddle.id]);

  const handleDeviceHeading = (e: DeviceOrientationEvent) => {
    if (e.alpha !== null) {
      setCompassHeading(Math.round(e.alpha));
    }
  };

  useEffect(() => {
    if (riddle.type === 'compass' && typeof window !== 'undefined' && 'ondeviceorientation' in window) {
      window.addEventListener('deviceorientation', handleDeviceHeading);
      return () => window.removeEventListener('deviceorientation', handleDeviceHeading);
    }
  }, [riddle.type]);

  const handleSend = async (answerVal: string) => {
    if (!answerVal.trim() || loading || submitting) return;
    setSubmitting(true);
    setFeedback(null);

    const res = await onSubmit(answerVal, riddle.id);
    setSubmitting(false);

    if (res.isCorrect) {
      sounds.playSuccess();
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
      setFeedback({
        isCorrect: true,
        message: res.message || '¡Correcto! Enigma resuelto con éxito.',
      });
    } else {
      sounds.playError();
      setFeedback({
        isCorrect: false,
        message: res.message || 'No es la respuesta correcta. Vuelve a intentarlo.',
      });
    }
  };

  // Reorder helpers for 'order'
  const moveItem = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= orderedItems.length) return;
    const newItems = [...orderedItems];
    const temp = newItems[index];
    newItems[index] = newItems[targetIdx];
    newItems[targetIdx] = temp;
    setOrderedItems(newItems);
  };

  // Simulated photo capture
  const handleSimulatePhoto = () => {
    setPhotoTaken(true);
    setPhotoPreview(
      riddle.imageUrl ||
        'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=600&q=80'
    );
    sounds.playClick();
  };

  return (
    <div className="space-y-4">
      {/* Feedback banner */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs sm:text-sm font-medium flex items-center gap-2.5 animate-in fade-in duration-200 ${
            feedback.isCorrect
              ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200'
              : 'bg-red-950/90 border-red-500 text-red-200'
          }`}
        >
          {feedback.isCorrect ? (
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <HelpCircle className="w-5 h-5 text-red-400 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* 1. TYPE: PHOTO */}
      {riddle.type === 'photo' && (
        <div className="p-5 rounded-2xl bg-black/40 border border-emerald-800/80 space-y-4 text-center">
          <div className="flex items-center justify-center gap-2 text-amber-300 font-adventure font-bold text-xs uppercase tracking-wider">
            <Camera className="w-4 h-4" />
            <span>Verificación Fotográfica en el Bosque</span>
          </div>

          <p className="text-xs text-stone-300 max-w-md mx-auto">
            Apunta la cámara de tu teléfono hacia el elemento señalado. Encuadra la toma para comprobar tu hallazgo sin dañar la flora.
          </p>

          {photoTaken && photoPreview ? (
            <div className="space-y-3">
              <div className="relative w-full max-w-xs mx-auto h-48 rounded-xl overflow-hidden border-2 border-emerald-500 shadow-md">
                <img src={photoPreview} alt="Captura fotográfica" className="w-full h-full object-cover" />
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[10px] text-emerald-300 font-mono font-bold">
                  Foto registrada ✓
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleSend('foto_confirmada')}
                disabled={submitting}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-adventure font-bold text-xs tracking-wider shadow-lg active:scale-95 transition-all"
              >
                Validar Fotografía
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleSimulatePhoto}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-stone-950 font-adventure font-bold text-xs tracking-wider shadow-lg flex items-center justify-center gap-2 mx-auto active:scale-95 transition-all"
              >
                <Camera className="w-4 h-4 text-stone-950" />
                <span>Abrir Cámara / Capturar Foto</span>
              </button>
              <div className="text-[10px] text-stone-400">
                La fotografía se analiza localmente para verificar el elemento del entorno.
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. TYPE: COUNT */}
      {riddle.type === 'count' && (
        <div className="p-5 rounded-2xl bg-black/40 border border-emerald-800/80 space-y-4 text-center">
          <span className="text-xs text-amber-300 font-adventure font-bold uppercase tracking-wider block">
            Contador en el Sitio
          </span>
          <p className="text-xs text-stone-300 max-w-sm mx-auto">
            Examina los elementos físicos que te rodean y ajusta la cifra exacta:
          </p>

          <div className="flex items-center justify-center gap-4 py-2">
            <button
              type="button"
              onClick={() => setCounterVal(Math.max(0, counterVal - 1))}
              className="w-12 h-12 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-600 flex items-center justify-center shadow active:scale-95 transition-all"
            >
              <Minus className="w-5 h-5" />
            </button>

            <div className="w-24 h-16 rounded-2xl bg-emerald-950 border-2 border-emerald-500/60 flex items-center justify-center font-mono text-3xl font-black text-amber-300 shadow-inner">
              {counterVal}
            </div>

            <button
              type="button"
              onClick={() => setCounterVal(counterVal + 1)}
              className="w-12 h-12 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-600 flex items-center justify-center shadow active:scale-95 transition-all"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => handleSend(String(counterVal))}
            disabled={submitting}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-adventure font-bold text-xs tracking-wider shadow-md active:scale-95 transition-all"
          >
            Confirmar Conteo ({counterVal})
          </button>
        </div>
      )}

      {/* 3. TYPE: COMPASS */}
      {riddle.type === 'compass' && (
        <div className="p-5 rounded-2xl bg-black/40 border border-emerald-800/80 space-y-4 text-center">
          <div className="flex items-center justify-center gap-2 text-amber-300 font-adventure font-bold text-xs uppercase tracking-wider">
            <Compass className="w-4 h-4" />
            <span>Reto de Orientación: Brújula al Norte (0°)</span>
          </div>

          <p className="text-xs text-stone-300 max-w-sm mx-auto">
            Sostén el móvil en horizontal y gira tu cuerpo hasta que la aguja se alinee con el Norte magnético.
          </p>

          {/* Interactive dial */}
          <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
            <div
              className={`absolute inset-0 rounded-full border-2 transition-colors duration-300 ${
                isCompassAligned ? 'border-amber-400 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'border-stone-700'
              }`}
            />
            <div
              className="w-24 h-24 flex items-center justify-center transition-transform duration-300 ease-out"
              style={{ transform: `rotate(${compassHeading}deg)` }}
            >
              <div className="flex flex-col items-center">
                <div className="w-0 h-0 border-x-6 border-x-transparent border-b-[30px] border-b-amber-400" />
                <div className="w-2 h-2 rounded-full bg-stone-900 border border-white -my-1 z-10" />
                <div className="w-0 h-0 border-x-6 border-x-transparent border-t-[30px] border-t-red-600" />
              </div>
            </div>
            <span className="absolute top-1 text-[10px] font-mono font-bold text-amber-300">N (0°)</span>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-mono font-bold text-stone-300">
              Rumbo actual: <span className="text-amber-300 text-sm">{compassHeading}°</span>
            </div>
            <div className="text-[11px] text-stone-400">
              {isCompassAligned ? (
                <span className="text-emerald-400 font-bold">¡Alineado con el Norte! Listo para validar.</span>
              ) : (
                <span>Gira lentamente hasta orientarte al Norte (0° ±{tolerance}°).</span>
              )}
            </div>
          </div>

          {/* Manual adjustment sliders for devices without gyro */}
          <div className="max-w-xs mx-auto pt-1 flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="359"
              value={compassHeading}
              onChange={(e) => setCompassHeading(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>

          <button
            type="button"
            onClick={() => handleSend('norte_alineado')}
            disabled={submitting || !isCompassAligned}
            className={`w-full sm:w-auto px-6 py-3 rounded-xl font-adventure font-bold text-xs tracking-wider transition-all shadow-md active:scale-95 ${
              isCompassAligned
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-950 animate-pulse'
                : 'bg-stone-800 text-stone-500 cursor-not-allowed'
            }`}
          >
            Fijar y Validar Rumbo Norte
          </button>
        </div>
      )}

      {/* 4. TYPE: AUDIO */}
      {riddle.type === 'audio' && (
        <div className="p-5 rounded-2xl bg-black/40 border border-emerald-800/80 space-y-4">
          <div className="flex items-center gap-2 text-amber-300 font-adventure font-bold text-xs uppercase tracking-wider">
            <Volume2 className="w-4 h-4" />
            <span>Escucha Atenta de la Naturaleza</span>
          </div>

          <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 flex items-center justify-between gap-3">
            <div className="text-xs text-stone-200">
              {riddle.audioDescription || 'Clip de audio ambiental: agua fluyendo y canto de aves de ribera.'}
            </div>
            <button
              type="button"
              onClick={() => {
                if (isPlayingAudio) {
                  sounds.stopSpeaking();
                  setIsPlayingAudio(false);
                } else {
                  setIsPlayingAudio(true);
                  sounds.speakText('Escuchando el murmullo del arroyo cristalino y el canto del mirlo ribereño...', () => {
                    setIsPlayingAudio(false);
                  });
                }
              }}
              className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs flex items-center gap-1.5 shrink-0 shadow active:scale-95 transition-all"
            >
              {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span>{isPlayingAudio ? 'Pausar' : 'Escuchar Sonido'}</span>
            </button>
          </div>

          {/* Render options for audio identity */}
          {riddle.options && (
            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider block">
                ¿Qué especie o elemento has identificado?
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {riddle.options.map((opt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(opt)}
                    disabled={submitting}
                    className="p-3 rounded-xl text-left text-xs font-semibold border bg-[#152017] hover:bg-emerald-900/60 border-emerald-800 hover:border-emerald-500 text-stone-200 hover:text-white transition-all active:scale-[0.98]"
                  >
                    <span className="font-mono text-amber-400 mr-2">{String.fromCharCode(65 + idx)}.</span>
                    <span>{opt}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. TYPE: CIPHER */}
      {riddle.type === 'cipher' && (
        <div className="p-5 rounded-2xl bg-black/40 border border-emerald-800/80 space-y-4">
          <div className="flex items-center gap-2 text-amber-300 font-adventure font-bold text-xs uppercase tracking-wider">
            <KeyRound className="w-4 h-4" />
            <span>Códice y Descifrado Rúnico</span>
          </div>

          {riddle.cipherHint && (
            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-600/40 font-mono text-xs text-amber-200">
              <span className="font-bold text-amber-400 block mb-1">Clave de equivalencias:</span>
              <span>{riddle.cipherHint}</span>
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleSend(textAnswer)}
              placeholder="Escribe la palabra descifrada..."
              className="flex-1 px-4 py-3 rounded-xl bg-black/50 border border-emerald-800 text-stone-100 font-mono tracking-widest uppercase focus:outline-none focus:border-amber-400 text-sm"
            />
            <button
              type="button"
              onClick={() => handleSend(textAnswer)}
              disabled={submitting || !textAnswer.trim()}
              className="px-5 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-adventure font-bold text-xs tracking-wider shadow active:scale-95 transition-all"
            >
              Comprobar
            </button>
          </div>
        </div>
      )}

      {/* 6. TYPE: ORDER */}
      {riddle.type === 'order' && (
        <div className="p-5 rounded-2xl bg-black/40 border border-emerald-800/80 space-y-4">
          <span className="text-xs text-amber-300 font-adventure font-bold uppercase tracking-wider block">
            Ordena las Fases (utiliza las flechas para subir o bajar):
          </span>

          <div className="space-y-2">
            {orderedItems.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-[#142016] border border-emerald-800/80 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-md bg-emerald-950 text-amber-300 font-mono font-bold flex items-center justify-center border border-emerald-700">
                    {idx + 1}
                  </span>
                  <span className="text-stone-200 font-medium">{item}</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveItem(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1.5 rounded bg-stone-800 hover:bg-stone-700 disabled:opacity-30 text-stone-200"
                    title="Mover arriba"
                  >
                    <MoveUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveItem(idx, 'down')}
                    disabled={idx === orderedItems.length - 1}
                    className="p-1.5 rounded bg-stone-800 hover:bg-stone-700 disabled:opacity-30 text-stone-200"
                    title="Mover abajo"
                  >
                    <MoveDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => handleSend(orderedItems.join(', '))}
            disabled={submitting}
            className="w-full py-3.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-adventure font-bold text-xs tracking-wider shadow active:scale-95 transition-all"
          >
            Confirmar Secuencia
          </button>
        </div>
      )}

      {/* 7. TYPE: MULTIPLE CHOICE (Default if options exist) */}
      {(!riddle.type || riddle.type === 'multiple_choice') && riddle.options && riddle.options.length > 0 && (
        <div className="space-y-2.5">
          <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider block">
            Elige tu deducción:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {riddle.options.map((option, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(option)}
                disabled={submitting}
                className="p-3.5 rounded-xl text-left text-xs sm:text-sm font-medium border bg-[#152017] hover:bg-emerald-900/60 border-emerald-900/80 hover:border-emerald-500 text-stone-200 hover:text-white transition-all shadow-sm active:scale-[0.98] disabled:opacity-50"
              >
                <span className="font-mono text-amber-400 mr-2 font-bold">{String.fromCharCode(65 + idx)}.</span>
                <span>{option}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 8. TYPE: OPEN TEXT / PHYSICAL CLUE */}
      {((!riddle.type && (!riddle.options || riddle.options.length === 0)) ||
        riddle.type === 'open_text' ||
        riddle.type === 'physical_clue') && (
        <div className="space-y-3">
          <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider block">
            {riddle.type === 'physical_clue' ? 'Introduce el código o símbolo hallado:' : 'Escribe tu deducción:'}
          </span>
          <div className="flex gap-2">
            <input
              type="text"
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend(textAnswer)}
              placeholder="Escribe la palabra, número o nombre clave..."
              className="flex-1 px-4 py-3 rounded-xl bg-black/40 border border-emerald-800 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400"
            />
            <button
              type="button"
              onClick={() => handleSend(textAnswer)}
              disabled={submitting || !textAnswer.trim()}
              className="px-5 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 text-white font-adventure font-bold text-xs sm:text-sm tracking-wide transition-all shadow-md active:scale-95 flex items-center gap-1.5"
            >
              <span>Responder</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
