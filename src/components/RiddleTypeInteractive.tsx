import React, { useState, useEffect } from 'react';
import { Riddle } from '../types';
import { useI18n } from '../context/I18nContext';
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
  CheckSquare,
  Square,
  Clock,
  Shuffle,
  Mic,
  Video,
  Play,
  Award,
} from 'lucide-react';
import { sounds } from '../utils/audio';

interface RiddleTypeInteractiveProps {
  riddle: Riddle;
  onSubmit: (answer: string, riddleId?: string) => Promise<{ isCorrect: boolean; message?: string }>;
  loading: boolean;
  highContrast?: boolean;
}

function shuffleGuaranteed(items: string[]): string[] {
  if (items.length <= 1) return [...items];
  let shuffled = [...items];
  let attempts = 0;
  while (attempts < 100) {
    shuffled = [...items].sort(() => Math.random() - 0.5);
    if (shuffled.some((item, idx) => item !== items[idx])) {
      break;
    }
    attempts++;
  }
  if (!shuffled.some((item, idx) => item !== items[idx]) && shuffled.length >= 2) {
    const tmp = shuffled[0];
    shuffled[0] = shuffled[1];
    shuffled[1] = tmp;
  }
  return shuffled;
}

export const RiddleTypeInteractive: React.FC<RiddleTypeInteractiveProps> = ({
  riddle,
  onSubmit,
  loading,
  highContrast,
}) => {
  const { t } = useI18n();
  const [textAnswer, setTextAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);

  // Photo state
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoTaken, setPhotoTaken] = useState(false);

  // Count state
  const [counterVal, setCounterVal] = useState<number>(riddle.targetCount ? Math.max(1, riddle.targetCount - 2) : 5);

  // Compass state
  const [compassHeading, setCompassHeading] = useState<number>(180);
  const targetBearing = riddle.targetBearing ?? riddle.config?.targetBearing ?? 0;
  const tolerance = riddle.compassTolerance ?? riddle.config?.toleranceDeg ?? 25;
  const diffBearing = Math.abs((compassHeading - targetBearing + 180) % 360 - 180);
  const isCompassAligned = diffBearing <= tolerance;

  // Audio & Listen state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [listenTimer, setListenTimer] = useState<number>(0);
  const [selectedListenOptions, setSelectedListenOptions] = useState<string[]>([]);

  // Order state: Barajar garantizando que nunca salgan ya ordenadas
  const correctOrderList = riddle.options || riddle.orderItems || [];
  const [orderedItems, setOrderedItems] = useState<string[]>([]);
  const [selectedToSwap, setSelectedToSwap] = useState<number | null>(null);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  // Extra Test States: audio_record, video, mimic
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [audioRecorded, setAudioRecorded] = useState(false);
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [videoRecorded, setVideoRecorded] = useState(false);
  const [mimicTimer, setMimicTimer] = useState<number>(0);
  const [mimicDone, setMimicDone] = useState(false);

  // Feedback state
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ isCorrect?: boolean; message: string } | null>(null);

  useEffect(() => {
    setTextAnswer('');
    setSelectedOption(null);
    setPhotoPreview(null);
    setPhotoTaken(false);
    setFeedback(null);
    setSelectedListenOptions([]);
    setListenTimer(0);
    setSelectedToSwap(null);
    setIsRecordingAudio(false);
    setAudioRecorded(false);
    setIsRecordingVideo(false);
    setVideoRecorded(false);
    setMimicTimer(0);
    setMimicDone(false);

    // Initial shuffle for multiple-choice options (rule: never show in fixed default order)
    if (riddle.options && riddle.options.length > 0) {
      setShuffledOptions(shuffleGuaranteed(riddle.options));
    } else {
      setShuffledOptions([]);
    }

    // Initial shuffle for 'order'
    if (riddle.type === 'order' && correctOrderList.length > 0) {
      setOrderedItems(shuffleGuaranteed(correctOrderList));
    }
  }, [riddle.id, riddle.options]);

  // Compass device orientation
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

  // Listen timer countdown
  useEffect(() => {
    let interval: any = null;
    if (listenTimer > 0) {
      interval = setInterval(() => {
        setListenTimer((t) => (t <= 1 ? 0 : t - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [listenTimer]);

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

  const handleTapToSwap = (index: number) => {
    if (selectedToSwap === null) {
      setSelectedToSwap(index);
    } else if (selectedToSwap === index) {
      setSelectedToSwap(null);
    } else {
      const newItems = [...orderedItems];
      const temp = newItems[selectedToSwap];
      newItems[selectedToSwap] = newItems[index];
      newItems[index] = temp;
      setOrderedItems(newItems);
      setSelectedToSwap(null);
      sounds.playClick();
    }
  };

  // Order checking logic with progressive feedback
  const handleCheckOrder = () => {
    if (correctOrderList.length === 0) return;

    let correctCount = 0;
    for (let i = 0; i < orderedItems.length; i++) {
      if (orderedItems[i] === correctOrderList[i]) {
        correctCount++;
      }
    }

    if (correctCount === correctOrderList.length) {
      // 100% correct!
      handleSend(orderedItems.join(', '));
    } else {
      sounds.playError();
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([80]);
      }
      setFeedback({
        isCorrect: false,
        message: t('order.result', { n: correctCount, total: correctOrderList.length }),
      });
    }
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
              : 'bg-amber-950/90 border-amber-500 text-amber-200'
          }`}
        >
          {feedback.isCorrect ? (
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <HelpCircle className="w-5 h-5 text-amber-400 shrink-0" />
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
            {riddle.question || 'Fotografía el elemento indicado sin arrancar ni dañar nada del bosque.'}
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
            </div>
          )}
        </div>
      )}

      {/* 1b. TYPE: AUDIO_RECORD */}
      {riddle.type === 'audio_record' && (
        <div className="p-5 rounded-2xl bg-black/40 border border-emerald-800/80 space-y-4 text-center">
          <div className="flex items-center justify-center gap-2 text-amber-300 font-adventure font-bold text-xs uppercase tracking-wider">
            <Mic className="w-4 h-4 text-amber-400" />
            <span>{riddle.name || 'Grabación Sonora del Bosque'}</span>
          </div>

          <p className="text-xs text-stone-300 max-w-md mx-auto">
            {riddle.question || 'Graba tu sonido, eructo o brindis tabernero en este punto.'}
          </p>

          {audioRecorded ? (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-500/60 flex items-center justify-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs text-emerald-200 font-mono font-bold">
                  Audio registrado con éxito (0:03) ✓
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleSend('audio_grabado')}
                disabled={submitting}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 text-white font-adventure font-bold text-xs tracking-wider shadow-lg active:scale-95 transition-all"
              >
                Validar Grabación Sonora
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {isRecordingAudio ? (
                <div className="p-4 rounded-xl bg-red-950/80 border border-red-500/80 space-y-3 animate-pulse">
                  <div className="flex items-center justify-center gap-2 text-red-300 text-xs font-mono font-bold">
                    <div className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                    <span>GRABANDO SONIDO AMBIENTE...</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsRecordingAudio(false);
                      setAudioRecorded(true);
                      sounds.playSuccess();
                    }}
                    className="px-6 py-2.5 rounded-xl bg-red-700 hover:bg-red-600 text-white font-bold text-xs"
                  >
                    Detener y Guardar Grabación
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsRecordingAudio(true);
                    sounds.playClick();
                    setTimeout(() => {
                      setIsRecordingAudio(false);
                      setAudioRecorded(true);
                    }, 3500);
                  }}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 text-stone-950 font-adventure font-bold text-xs tracking-wider shadow-lg flex items-center justify-center gap-2 mx-auto active:scale-95 transition-all"
                >
                  <Mic className="w-4 h-4 text-stone-950" />
                  <span>Iniciar Grabación de Audio</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* 1c. TYPE: VIDEO */}
      {riddle.type === 'video' && (
        <div className="p-5 rounded-2xl bg-black/40 border border-emerald-800/80 space-y-4 text-center">
          <div className="flex items-center justify-center gap-2 text-amber-300 font-adventure font-bold text-xs uppercase tracking-wider">
            <Video className="w-4 h-4 text-amber-400" />
            <span>{riddle.name || 'Captura de Vídeo Corto'}</span>
          </div>

          <p className="text-xs text-stone-300 max-w-md mx-auto">
            {riddle.question || 'Graba un breve clip de vídeo de 3 segundos cumpliendo el reto.'}
          </p>

          {videoRecorded ? (
            <div className="space-y-3">
              <div className="relative w-full max-w-xs mx-auto h-44 rounded-xl overflow-hidden border-2 border-emerald-500 bg-emerald-950/80 flex items-center justify-center">
                <Play className="w-8 h-8 text-emerald-400 opacity-80" />
                <span className="absolute bottom-2 left-2 text-[10px] text-emerald-300 font-mono font-bold bg-black/70 px-2 py-0.5 rounded">
                  Clip de 3s registrado ✓
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleSend('video_confirmado')}
                disabled={submitting}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 text-white font-adventure font-bold text-xs tracking-wider shadow-lg active:scale-95 transition-all"
              >
                Validar Vídeo
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {isRecordingVideo ? (
                <div className="p-4 rounded-xl bg-red-950/80 border border-red-500/80 space-y-2 animate-pulse">
                  <span className="text-xs text-red-200 font-mono font-bold">
                    GRABANDO VÍDEO... (3s)
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsRecordingVideo(true);
                    sounds.playClick();
                    setTimeout(() => {
                      setIsRecordingVideo(false);
                      setVideoRecorded(true);
                      sounds.playSuccess();
                    }, 3000);
                  }}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 text-stone-950 font-adventure font-bold text-xs tracking-wider shadow-lg flex items-center justify-center gap-2 mx-auto active:scale-95 transition-all"
                >
                  <Video className="w-4 h-4 text-stone-950" />
                  <span>Grabar Clip de 3 Segundos</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* 1d. TYPE: MIMIC */}
      {riddle.type === 'mimic' && (
        <div className="p-5 rounded-2xl bg-black/40 border border-emerald-800/80 space-y-4 text-center">
          <div className="flex items-center justify-center gap-2 text-amber-300 font-adventure font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{riddle.name || 'Reto de Mímica y Actuación'}</span>
          </div>

          <p className="text-xs text-stone-300 max-w-md mx-auto">
            {riddle.question || 'Imita la pose o el baile indicado por Fray Botijo durante 3 segundos.'}
          </p>

          {mimicDone ? (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-500/60 text-xs text-emerald-200 font-bold">
                ¡Mímica completada con elegancia tabernera! 💃🕺 ✓
              </div>
              <button
                type="button"
                onClick={() => handleSend('mimica_completada')}
                disabled={submitting}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 text-white font-adventure font-bold text-xs tracking-wider shadow-lg active:scale-95 transition-all"
              >
                Confirmar Desafío de Mímica
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setMimicTimer(3);
                sounds.playClick();
                setTimeout(() => {
                  setMimicDone(true);
                  sounds.playSuccess();
                }, 3000);
              }}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 text-stone-950 font-adventure font-bold text-xs tracking-wider shadow-lg flex items-center justify-center gap-2 mx-auto active:scale-95 transition-all"
            >
              <Award className="w-4 h-4 text-stone-950" />
              <span>Realizar Mímica (3s)</span>
            </button>
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
            Sostén el móvil en horizontal y gira sobre tus pies hasta alinear la flecha brújula con el Norte exacto (0°).
          </p>

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
              Rumbo: <span className="text-amber-300 text-sm">{compassHeading}°</span>
            </div>
            <div className="text-[11px]">
              {isCompassAligned ? (
                <span className="text-emerald-400 font-bold">¡Alineado con el Norte! Listo para validar.</span>
              ) : (
                <span className="text-stone-400">Gira lentamente hasta orientarte al Norte (0° ±{tolerance}°).</span>
              )}
            </div>
          </div>

          {/* Slider for gyro fallback */}
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

      {/* 4. TYPE: LISTEN / AUDIO */}
      {(riddle.type === 'audio' || riddle.type === 'listen') && (
        <div className="p-5 rounded-2xl bg-black/40 border border-emerald-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-300 font-adventure font-bold text-xs uppercase tracking-wider">
              <Volume2 className="w-4 h-4" />
              <span>Escucha Atenta del Bosque</span>
            </div>

            {riddle.config?.holdSeconds && (
              <span className="text-[11px] font-mono font-bold text-stone-300 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>{riddle.config.holdSeconds}s requeridos</span>
              </span>
            )}
          </div>

          {riddle.config?.holdSeconds ? (
            <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 space-y-3 text-center">
              <p className="text-xs text-stone-200">
                Quédate quieto durante {riddle.config.holdSeconds} segundos con el móvil bajado y marca los sonidos que oigas:
              </p>

              {listenTimer > 0 ? (
                <div className="py-3 flex flex-col items-center gap-1">
                  <div className="w-14 h-14 rounded-full border-4 border-amber-400 border-t-transparent animate-spin flex items-center justify-center font-mono font-bold text-amber-300 text-lg">
                    {listenTimer}
                  </div>
                  <span className="text-[11px] text-amber-300 font-serif italic">Escuchando la espesura...</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setListenTimer(riddle.config?.holdSeconds || 30);
                    sounds.playClick();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs tracking-wider shadow"
                >
                  Iniciar 30 Segundos de Silencio
                </button>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 flex items-center justify-between gap-3">
              <div className="text-xs text-stone-200">
                {riddle.audioDescription || 'Sonido ambiental de agua fluyendo y aves ribereñas.'}
              </div>
              <button
                type="button"
                onClick={() => {
                  if (isPlayingAudio) {
                    sounds.stopSpeaking();
                    setIsPlayingAudio(false);
                  } else {
                    setIsPlayingAudio(true);
                    sounds.speakText('Escuchando el murmullo del agua y el canto de las aves ribereñas...', () => {
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
          )}

          {/* Options for audio identity / multiselect for listen */}
          {riddle.options && riddle.type === 'listen' ? (
            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider block">
                Marca los sonidos identificados:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {riddle.options.map((opt, idx) => {
                  const isChecked = selectedListenOptions.includes(opt);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSelectedListenOptions((prev) =>
                          prev.includes(opt) ? prev.filter((o) => o !== opt) : [...prev, opt]
                        );
                      }}
                      className={`p-3 rounded-xl text-left text-xs font-semibold border flex items-center gap-2.5 transition-all ${
                        isChecked
                          ? 'bg-emerald-900 border-emerald-400 text-white shadow'
                          : 'bg-[#152017] border-emerald-900/80 text-stone-300'
                      }`}
                    >
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-amber-300 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-stone-500 shrink-0" />
                      )}
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => handleSend(selectedListenOptions.join(', '))}
                disabled={submitting || selectedListenOptions.length === 0}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-adventure font-bold text-xs tracking-wider shadow"
              >
                Confirmar Sonidos ({selectedListenOptions.length} marcados)
              </button>
            </div>
          ) : (
            riddle.options && (
              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider block">
                  ¿Qué elemento has identificado?
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
            )
          )}
        </div>
      )}

      {/* 5. TYPE: ORDER (Reordenar arrastrando o tocando; comprobación dice X de N en su sitio) */}
      {riddle.type === 'order' && (
        <div className="p-5 rounded-2xl bg-black/40 border border-emerald-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-300 font-adventure font-bold uppercase tracking-wider block">
              Reordena la Secuencia Correcta:
            </span>
            <button
              type="button"
              onClick={() => setOrderedItems(shuffleGuaranteed(correctOrderList))}
              className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-[10px] font-semibold flex items-center gap-1"
              title="Volver a barajar"
            >
              <Shuffle className="w-3 h-3 text-stone-400" />
              <span>Barajar</span>
            </button>
          </div>

          <p className="text-[11px] text-stone-300">
            Toca una pieza y luego otra para intercambiarlas, o utiliza las flechas para desplazar cada elemento.
          </p>

          <div className="space-y-2">
            {orderedItems.map((item, idx) => {
              const isSelected = selectedToSwap === idx;
              return (
                <div
                  key={idx}
                  draggable
                  onDragStart={() => setDraggedIdx(idx)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (draggedIdx !== null && draggedIdx !== idx) {
                      const newItems = [...orderedItems];
                      const tmp = newItems[draggedIdx];
                      newItems[draggedIdx] = newItems[idx];
                      newItems[idx] = tmp;
                      setOrderedItems(newItems);
                      setDraggedIdx(null);
                      sounds.playClick();
                    }
                  }}
                  onClick={() => handleTapToSwap(idx)}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs transition-all cursor-pointer select-none active:scale-[0.99] ${
                    isSelected
                      ? 'bg-amber-950/80 border-amber-400 ring-2 ring-amber-300 shadow-lg text-amber-100'
                      : 'bg-[#142016] border-emerald-800/80 hover:border-emerald-500 text-stone-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-6 h-6 rounded-md bg-emerald-950 text-amber-300 font-mono font-bold flex items-center justify-center border border-emerald-700 shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-medium text-xs leading-snug">{item}</span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => moveItem(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1.5 rounded bg-stone-800 hover:bg-stone-700 disabled:opacity-20 text-stone-200"
                      title="Subir"
                    >
                      <MoveUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveItem(idx, 'down')}
                      disabled={idx === orderedItems.length - 1}
                      className="p-1.5 rounded bg-stone-800 hover:bg-stone-700 disabled:opacity-20 text-stone-200"
                      title="Bajar"
                    >
                      <MoveDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleCheckOrder}
            disabled={submitting}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-adventure font-bold text-xs tracking-wider shadow-md active:scale-95 transition-all"
          >
            Comprobar Secuencia
          </button>
        </div>
      )}

      {/* 6. TYPE: CIPHER */}
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

      {/* 7. TYPE: MULTIPLE CHOICE & TEST */}
      {(!riddle.type || riddle.type === 'multiple_choice' || riddle.type === 'test') && riddle.options && riddle.options.length > 0 && (
        <div className="space-y-2.5">
          <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider block">
            Elige tu deducción:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {(shuffledOptions.length > 0 ? shuffledOptions : riddle.options).map((option, idx) => (
              <button
                key={`${idx}-${option}`}
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

      {/* 8. TYPE: OPEN TEXT / TEXT / PHYSICAL CLUE */}
      {((!riddle.type && (!riddle.options || riddle.options.length === 0)) ||
        riddle.type === 'open_text' ||
        riddle.type === 'text' ||
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
