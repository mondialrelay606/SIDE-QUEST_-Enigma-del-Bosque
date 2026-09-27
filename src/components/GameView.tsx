import React, { useState, useEffect } from 'react';
import { PlayerSession, ForestPack, Riddle, WindmillPOI, StoryIntro } from '../types';
import { calculateHaversineDistance, formatDistance, calculateBearing } from '../utils/geo';
import { sounds, ambientAudio } from '../utils/audio';
import {
  MapPin,
  Volume2,
  VolumeX,
  Lightbulb,
  MessageCircle,
  Compass,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  Sparkles,
  Info,
  Footprints,
  Eye,
  Send,
  Navigation,
  Mic,
  Users,
  Camera,
  Lock,
  RotateCcw,
  ShieldAlert,
  Phone,
  AlertTriangle,
  X,
  PauseCircle
} from 'lucide-react';
import { GuideChatDrawer } from './GuideChatDrawer';
import { CharacterInteractionModal } from './CharacterInteractionModal';
import { ForestNavigationMap } from './ForestNavigationMap';
import { GeolocatedARModal } from './GeolocatedARModal';
import { AmbientAudioControl } from './AmbientAudioControl';

interface GameViewProps {
  session: PlayerSession;
  forest: ForestPack;
  onSubmitAnswer: (answer: string) => Promise<{ isCorrect: boolean; message?: string }>;
  onRequestHint: (level: 1 | 2 | 3) => Promise<{ hint: string; penalty: number }>;
  onSendMessage: (text: string) => Promise<void>;
  onUpdateLocation: (lat: number, lng: number) => Promise<void>;
  simulatedGps: boolean;
  onToggleSimulatedGps: () => void;
  loading: boolean;
  onOpenPauseModal?: () => void;
}

export const GameView: React.FC<GameViewProps> = ({
  session,
  forest,
  onSubmitAnswer,
  onRequestHint,
  onSendMessage,
  onUpdateLocation,
  simulatedGps,
  onToggleSimulatedGps,
  loading,
  onOpenPauseModal,
}) => {
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<{ isCorrect?: boolean; message: string } | null>(null);
  const [hintDrawerOpen, setHintDrawerOpen] = useState(false);
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
  const [characterModalOpen, setCharacterModalOpen] = useState(false);
  const [hintLoading, setHintLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [gameDisplayMode, setGameDisplayMode] = useState<'all' | 'map' | 'riddle'>('all');
  const [isArModalOpen, setIsArModalOpen] = useState(false);
  const [manualArrivalConfirmed, setManualArrivalConfirmed] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showVisualConfirmModal, setShowVisualConfirmModal] = useState(false);

  // Player GPS coords
  const [playerLat, setPlayerLat] = useState(session.lat || forest.centerLat);
  const [playerLng, setPlayerLng] = useState(session.lng || forest.centerLng);

  // Current POI and Story
  const currentPoiId = session.routePoiIds[session.currentPoiIndex] || session.routePoiIds[0];
  const currentPoi = forest.pois.find((p) => p.id === currentPoiId) || forest.pois[0];
  const story = forest.stories.find((s) => s.id === session.storyId);

  // Starting point for return / emergency guidance
  const startPoiId = session.routePoiIds[0];
  const startPoi = forest.pois.find((p) => p.id === startPoiId) || forest.pois[0];
  const returnDistanceMeters = startPoi
    ? calculateHaversineDistance(playerLat, playerLng, startPoi.lat, startPoi.lng)
    : 0;
  const returnBearing = startPoi
    ? calculateBearing(playerLat, playerLng, startPoi.lat, startPoi.lng)
    : 0;

  // Reset manual arrival confirmation on next POI
  useEffect(() => {
    setManualArrivalConfirmed(false);
  }, [currentPoiId]);

  // Find Riddle for this POI
  let riddle = forest.riddles.find(
    (r) => r.poiId === currentPoiId && r.storyId === session.storyId && r.difficulty === session.difficulty
  );
  if (!riddle) {
    riddle = forest.riddles.find((r) => r.poiId === currentPoiId && r.storyId === session.storyId);
  }
  if (!riddle) {
    riddle = forest.riddles.find((r) => r.poiId === currentPoiId);
  }

  // Scene narrative
  const sceneNarrativeKey = `${session.storyId}_${currentPoiId}`;
  const sceneText =
    forest.sceneNarratives[sceneNarrativeKey] ||
    currentPoi?.description ||
    'Observa detenidamente lo que te rodea en este rincón del bosque.';

  // Real or Simulated Geolocation Hook
  useEffect(() => {
    if (simulatedGps) {
      // In simulated GPS mode, place player very close to target POI
      if (currentPoi) {
        setPlayerLat(currentPoi.lat + 0.00015);
        setPlayerLng(currentPoi.lng - 0.0001);
        onUpdateLocation(currentPoi.lat + 0.00015, currentPoi.lng - 0.0001);
      }
      return;
    }

    if ('geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setPlayerLat(pos.coords.latitude);
          setPlayerLng(pos.coords.longitude);
          onUpdateLocation(pos.coords.latitude, pos.coords.longitude);
        },
        (err) => {
          console.warn('Geolocation warning, switching to fallback:', err.message);
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [simulatedGps, currentPoi?.id]);

  // Compute distance and bearing
  const distanceMeters = currentPoi
    ? calculateHaversineDistance(playerLat, playerLng, currentPoi.lat, currentPoi.lng)
    : 0;
  const bearing = currentPoi
    ? calculateBearing(playerLat, playerLng, currentPoi.lat, currentPoi.lng)
    : 0;

  // Arrival threshold: 60m in easyMode (kids/mobility), 25m standard
  const arrivalRadiusMeters = session.easyMode ? 60 : 25;
  const isNearPoi = distanceMeters <= arrivalRadiusMeters || manualArrivalConfirmed;

  // Ambient Audio Engine: Synchronize real-time location, POI acoustics & story theme
  useEffect(() => {
    ambientAudio.updateContext({
      forest,
      story,
      currentPoi,
      distanceMeters,
      isNearPoi,
    });
  }, [forest, story, currentPoi, distanceMeters, isNearPoi]);

  useEffect(() => {
    // Automatically start ambient audio soundscape in game view
    ambientAudio.start();
  }, []);

  const getBearingCardinal = (deg: number): string => {
    const directions = ['Norte', 'Noreste', 'Este', 'Sureste', 'Sur', 'Suroeste', 'Oeste', 'Noroeste'];
    const idx = Math.round(((deg %= 360) < 0 ? deg + 360 : deg) / 45) % 8;
    return directions[idx];
  };

  // Handle audio narration playback
  const toggleSpeech = () => {
    if (speaking) {
      sounds.stopSpeaking();
      setSpeaking(false);
    } else {
      setSpeaking(true);
      sounds.speakText(`${currentPoi?.name}. ${sceneText}. Acertijo: ${riddle?.question || ''}`, () => {
        setSpeaking(false);
      });
    }
  };

  // Submit Answer
  const handleAnswerSubmit = async (answerVal?: string) => {
    const val = (answerVal !== undefined ? answerVal : userAnswer).trim();
    if (!val || loading) return;

    setFeedback(null);
    const result = await onSubmitAnswer(val);

    if (result.isCorrect) {
      sounds.playSuccess();
      setFeedback({
        isCorrect: true,
        message: result.message || '¡Correcto! Has desbloqueado el siguiente punto.',
      });
      setUserAnswer('');
    } else {
      sounds.playError();
      setFeedback({
        isCorrect: false,
        message: result.message || 'No es la respuesta correcta. Vuelve a intentarlo.',
      });
    }
  };

  // Request Hint
  const handleRequestHint = async (level: 1 | 2 | 3) => {
    setHintLoading(true);
    try {
      await onRequestHint(level);
      sounds.playHintChime();
    } finally {
      setHintLoading(false);
    }
  };

  // Filter hints for this POI
  const currentPoiHints = session.hintHistory.filter((h) => h.poiId === currentPoiId);

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 space-y-5 pb-28">
      {/* Permanent Return to Trailhead & Safety Bar (Visible Reference) */}
      <div className="bg-gradient-to-r from-emerald-950 via-[#152418] to-emerald-950 border border-emerald-800/80 rounded-2xl px-4 py-2.5 flex items-center justify-between gap-3 text-xs shadow-md">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-900/60 border border-emerald-600/40 flex items-center justify-center text-emerald-300 shrink-0">
            <RotateCcw className="w-4 h-4" />
          </div>
          <div className="truncate">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold">Punto de partida</span>
              <span className="font-bold text-amber-200 truncate">{startPoi?.name}</span>
            </div>
            <div className="text-[11px] text-emerald-300 font-mono font-bold flex items-center gap-1">
              <span>{formatDistance(returnDistanceMeters)}</span>
              <span>• Rumbo {getBearingCardinal(returnBearing)} ({Math.round(returnBearing)}°)</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenPauseModal && (
            <button
              type="button"
              onClick={onOpenPauseModal}
              className="shrink-0 px-3 py-1.5 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-600/70 text-amber-200 font-adventure text-[11px] font-bold flex items-center gap-1.5 shadow-md transition-all active:scale-95"
              title="Pausar partida para continuar otro día o abandonar"
            >
              <PauseCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Pausar / Salir</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowEmergencyModal(true)}
            className="shrink-0 px-3 py-1.5 rounded-xl bg-red-950/90 hover:bg-red-900 border border-red-700 text-red-200 font-adventure text-[11px] font-bold flex items-center gap-1.5 shadow-md transition-all active:scale-95"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden xs:inline">Volver al inicio / SOS</span>
            <span className="xs:hidden">SOS</span>
          </button>
        </div>
      </div>

      {/* Route Progress Header */}
      <div className="bg-[#19271C] border border-emerald-900/60 rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-900/70 border border-emerald-500/40 flex items-center justify-center text-2xl shadow">
            {currentPoi?.emoji || '📍'}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                Punto {session.currentPoiIndex + 1} de {session.routePoiIds.length}
              </span>
              <span className="text-[10px] px-1.5 py-0.2 bg-emerald-950 text-emerald-400 rounded border border-emerald-800/40 font-semibold">
                {session.difficulty}
              </span>
              {session.easyMode && (
                <span className="text-[10px] px-2 py-0.5 bg-amber-950/80 text-amber-300 rounded border border-amber-600/40 font-semibold flex items-center gap-1">
                  <Footprints className="w-3 h-3 text-amber-400" />
                  <span>Radio 60m</span>
                </span>
              )}
            </div>
            <h2 className="font-adventure text-lg sm:text-xl font-bold text-amber-100">
              {currentPoi?.name}
            </h2>
          </div>
        </div>

        {/* Trail progress steps & Ambient Audio Controller in Header */}
        <div className="flex items-center gap-3 self-start sm:self-center flex-wrap sm:flex-nowrap justify-between w-full sm:w-auto">
          {/* Ambient Sound Engine Control */}
          <AmbientAudioControl variant="header" />

          {/* Progress dots */}
          <div className="flex items-center gap-1.5">
            {session.routePoiIds.map((poiId, idx) => {
              const isCompleted = session.completedPois.includes(poiId);
              const isCurrent = idx === session.currentPoiIndex;
              return (
                <div
                  key={poiId}
                  className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center transition-all ${
                    isCompleted
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-amber-500 text-stone-950 ring-2 ring-amber-300 ring-offset-2 ring-offset-[#19271C]'
                      : 'bg-stone-800 text-stone-400'
                  }`}
                  title={`Punto ${idx + 1}`}
                >
                  {isCompleted ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex items-center justify-center p-1 bg-black/40 border border-emerald-900/60 rounded-xl max-w-md mx-auto">
        <button
          type="button"
          onClick={() => setGameDisplayMode('all')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
            gameDisplayMode === 'all'
              ? 'bg-emerald-700 text-white shadow'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          Vista Completa
        </button>
        <button
          type="button"
          onClick={() => setGameDisplayMode('map')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            gameDisplayMode === 'map'
              ? 'bg-amber-600 text-stone-950 font-adventure shadow'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Mapa y Coordenadas</span>
        </button>
        <button
          type="button"
          onClick={() => setGameDisplayMode('riddle')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            gameDisplayMode === 'riddle'
              ? 'bg-emerald-700 text-white shadow'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Enigma</span>
        </button>
      </div>

      {/* Interactive Forest Navigation Map with Coordinates */}
      {gameDisplayMode !== 'riddle' && (
        <ForestNavigationMap
          session={session}
          forest={forest}
          playerLat={playerLat}
          playerLng={playerLng}
          currentPoi={currentPoi}
          onUpdateLocation={(lat, lng) => {
            setPlayerLat(lat);
            setPlayerLng(lng);
            onUpdateLocation(lat, lng);
          }}
          simulatedGps={simulatedGps}
          onToggleSimulatedGps={onToggleSimulatedGps}
          isNearPoi={isNearPoi}
          onOpenAR={() => {
            sounds.playClick();
            setIsArModalOpen(true);
          }}
        />
      )}

      {gameDisplayMode !== 'map' && (
        <>
          {/* Augmented Reality Geolocated Action Banner */}
          <div className="bg-gradient-to-r from-[#1D2E20] via-[#243A27] to-[#18271A] border border-amber-500/40 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 shadow-inner shrink-0">
                <Camera className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 font-mono flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Realidad Aumentada GPS</span>
                  </span>
                  {currentPoi?.arAsset?.revealTrigger === 'onRiddleSolved' && !session.completedPois.includes(currentPoiId) ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-900/90 text-stone-400 border border-stone-700 font-medium flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" />
                      <span>Tras resolver enigma</span>
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700 font-semibold">
                      Visible en cámara
                    </span>
                  )}
                </div>
                <h3 className="font-adventure text-base font-bold text-amber-100">
                  {currentPoi?.arAsset?.title || `Proyección Mística de ${currentPoi?.name}`}
                </h3>
                <p className="text-xs text-stone-300 line-clamp-1 mt-0.5">
                  {currentPoi?.arAsset?.description || 'Apunta con la cámara de tu móvil para ver el objeto 3D anclado a este punto.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setIsArModalOpen(true);
              }}
              className="w-full sm:w-auto px-4 py-3 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-stone-950 font-adventure text-xs font-bold tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-950/60 active:scale-95 transition-all shrink-0"
            >
              <Camera className="w-4 h-4 text-stone-950" />
              <span>Ver en Realidad Aumentada</span>
            </button>
          </div>

          {/* Scene Narrative (Atmospheric Card) */}
          <div className="relative rounded-2xl bg-gradient-to-br from-[#203023] via-[#1B291D] to-[#152017] border border-amber-600/30 p-5 sm:p-6 shadow-xl text-stone-200 space-y-4">
        <div className="flex items-center justify-between border-b border-emerald-900/50 pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
              Ambientación: {story?.title}
            </span>
          </div>

          <button
            onClick={toggleSpeech}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
              speaking
                ? 'bg-amber-900/60 border-amber-500 text-amber-200'
                : 'bg-black/30 border-emerald-900/80 text-stone-300 hover:text-white'
            }`}
          >
            {speaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
            <span className="hidden sm:inline">{speaking ? 'Detener voz' : 'Escuchar escena'}</span>
          </button>
        </div>

        <p className="text-sm sm:text-base leading-relaxed text-amber-50 font-serif italic selection:bg-amber-900">
          "{sceneText}"
        </p>

        {currentPoi?.clueSnippet && (
          <div className="p-3 rounded-xl bg-black/30 border border-emerald-900/60 text-xs text-stone-300 flex items-start gap-2">
            <Eye className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-emerald-300">Pistas del entorno: </span>
              <span>{currentPoi.clueSnippet}</span>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Character Presence Banner */}
      {story && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#17271B] via-[#1E3222] to-[#152319] border border-amber-600/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <div className="w-13 h-13 rounded-2xl bg-emerald-950 border-2 border-amber-400/60 flex items-center justify-center text-3xl shadow-lg shadow-black/60">
                {story.narratorAvatar || '🧙‍♂️'}
              </div>
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#17271B] animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-adventure text-base font-bold text-amber-100">
                  {story.narratorName}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700 font-semibold flex items-center gap-1">
                  <Mic className="w-3 h-3 text-amber-400" />
                  <span>Gemini 3.8 Live</span>
                </span>
              </div>
              <p className="text-xs text-stone-300 italic line-clamp-1 mt-0.5">
                "{story.characterGreeting || '¿Quieres hablar conmigo sobre este misterio?'}"
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setCharacterModalOpen(true)}
              className="flex-1 sm:flex-none py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-stone-950 font-adventure font-bold text-xs tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-950/60 active:scale-95 transition-all"
            >
              <Mic className="w-4 h-4" />
              <span>Hablar en Vivo por Voz</span>
            </button>
          </div>
        </div>
      )}

      {/* Proximity / Double Fallback Confirmation Banner */}
      {!isNearPoi ? (
        <div className="rounded-2xl bg-gradient-to-r from-amber-950/40 via-[#261E14] to-amber-950/40 border border-amber-600/50 p-4 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="font-adventure font-bold text-amber-200 text-sm">
                Aproximándote a {currentPoi.name}
              </div>
              <p className="text-[11px] text-stone-300 mt-0.5 leading-relaxed">
                Estás a <strong>{formatDistance(distanceMeters)}</strong> (radio requerido: {arrivalRadiusMeters} m). Si estás en el lugar y el dosel de árboles desvía la señal GPS, puedes confirmar tu llegada por foto de referencia.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowVisualConfirmModal(true)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-adventure font-bold text-xs tracking-wider flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-all shrink-0"
          >
            <Eye className="w-4 h-4 text-stone-950" />
            <span>Confirmación Visual</span>
          </button>
        </div>
      ) : (
        <div className="rounded-xl bg-emerald-950/50 border border-emerald-600/40 px-3.5 py-2 flex items-center justify-between gap-2 text-xs text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {manualArrivalConfirmed
                ? '¡Llegada confirmada por reconocimiento visual! Enigma desbloqueado.'
                : '¡Dentro del radio del punto de interés! Puedes resolver el enigma y observar el entorno.'}
            </span>
          </div>
          {manualArrivalConfirmed && (
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-900/60 font-mono text-emerald-200 border border-emerald-700/50">
              Visual OK
            </span>
          )}
        </div>
      )}

      {/* Riddle Section */}
      <div className="rounded-2xl bg-[#19271C] border border-emerald-800/60 p-5 sm:p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-amber-400" />
            <h3 className="font-adventure text-base sm:text-lg font-bold text-amber-100">
              {riddle?.name || 'Enigma del Lugar'}
            </h3>
          </div>
          <span className="text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded">
            +{riddle?.points || 100} pts
          </span>
        </div>

        {/* Question Text */}
        <div className="p-4 rounded-xl bg-black/40 border border-emerald-900/70 text-stone-100 text-sm sm:text-base font-medium leading-relaxed">
          {riddle?.question || 'Observa a tu alrededor y responde la pregunta del guía.'}
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-3.5 rounded-xl border text-xs sm:text-sm font-medium flex items-center gap-2.5 animate-in fade-in duration-200 ${
              feedback.isCorrect
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                : 'bg-red-950/80 border-red-500 text-red-200'
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

        {/* Answer Options or Input */}
        {riddle?.options && riddle.options.length > 0 ? (
          <div className="space-y-2.5">
            <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider block">
              Elige tu respuesta:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {riddle.options.map((option, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAnswerSubmit(option)}
                  disabled={loading}
                  className="p-3.5 rounded-xl text-left text-xs sm:text-sm font-medium border bg-[#152017] hover:bg-emerald-900/60 border-emerald-900/80 hover:border-emerald-500 text-stone-200 hover:text-white transition-all shadow-sm active:scale-[0.98] disabled:opacity-50"
                >
                  <span className="font-mono text-amber-400 mr-2 font-bold">{String.fromCharCode(65 + idx)}.</span>
                  <span>{option}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider block">
              Escribe tu deducción:
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAnswerSubmit()}
                placeholder="Escribe la palabra, número o nombre clave..."
                className="flex-1 px-4 py-3 rounded-xl bg-black/40 border border-emerald-800 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400"
              />
              <button
                type="button"
                onClick={() => handleAnswerSubmit()}
                disabled={loading || !userAnswer.trim()}
                className="px-5 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 text-white font-adventure font-bold text-xs sm:text-sm tracking-wide transition-all shadow-md active:scale-95 flex items-center gap-1.5"
              >
                <span>Responder</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Hints action bar */}
        <div className="pt-3 border-t border-emerald-900/50 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-stone-400 flex items-center gap-1.5">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span>¿Bloqueado con este acertijo?</span>
          </div>

          <button
            type="button"
            onClick={() => setHintDrawerOpen(!hintDrawerOpen)}
            className="px-3.5 py-2 rounded-xl bg-amber-950/60 hover:bg-amber-900/70 border border-amber-600/50 text-amber-200 text-xs font-semibold transition-all flex items-center gap-2 shadow-sm active:scale-95"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span>Pedir Pista Progresiva ({currentPoiHints.length}/3)</span>
          </button>
        </div>

        {/* Progressive Hint Drawer / Accordion */}
        {hintDrawerOpen && (
          <div className="p-4 rounded-xl bg-[#141F16] border border-amber-600/40 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                Pistas Progresivas del Guía
              </span>
              <span className="text-[11px] text-stone-400">
                Puntos actuales: <strong>{session.points}</strong>
              </span>
            </div>

            {/* Revealed hints so far */}
            {currentPoiHints.length > 0 ? (
              <div className="space-y-2">
                {currentPoiHints.map((h, i) => (
                  <div key={i} className="p-3 rounded-lg bg-black/40 border border-emerald-800/50 text-xs space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-amber-400 font-bold uppercase">
                      <span>Nivel {h.level}: {h.level === 1 ? 'Orientación' : h.level === 2 ? 'Método' : 'Decisiva'}</span>
                      <span className="text-stone-500 font-normal">{h.timestamp}</span>
                    </div>
                    <p className="text-stone-200 italic">"{h.text}"</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-stone-400 italic">
                Aún no has solicitado ninguna pista para este enigma.
              </p>
            )}

            {/* Hint Request Buttons */}
            {currentPoiHints.length < 3 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                {[
                  { lvl: 1, label: 'Nivel 1: Sutil (35%)', cost: '-5 pts' },
                  { lvl: 2, label: 'Nivel 2: Método (70%)', cost: '-15 pts' },
                  { lvl: 3, label: 'Nivel 3: Decisiva (100%)', cost: '-30 pts' },
                ].map((item) => {
                  const alreadyUnlocked = currentPoiHints.some((h) => h.level === item.lvl);
                  return (
                    <button
                      key={item.lvl}
                      type="button"
                      disabled={hintLoading || alreadyUnlocked}
                      onClick={() => handleRequestHint(item.lvl as 1 | 2 | 3)}
                      className={`p-2.5 rounded-xl border text-xs font-medium text-left transition-all flex flex-col justify-between ${
                        alreadyUnlocked
                          ? 'bg-black/30 border-stone-800 text-stone-500 opacity-60 cursor-not-allowed'
                          : 'bg-emerald-950/70 hover:bg-emerald-900 border-emerald-700/60 text-emerald-200 active:scale-95'
                      }`}
                    >
                      <span className="font-semibold">{item.label}</span>
                      <span className="text-[10px] text-amber-400 mt-1 font-mono">{item.cost}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
      </>
      )}

      {/* Floating Narrator Voice & Chat Trigger */}
      <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2">
        <button
          onClick={() => setCharacterModalOpen(true)}
          className="relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 text-stone-950 font-adventure text-xs sm:text-sm font-bold shadow-2xl shadow-black/80 border border-amber-300 transition-all hover:scale-105 active:scale-95"
        >
          <span className="text-xl animate-bounce">{story?.narratorAvatar || '🦉'}</span>
          <span className="flex items-center gap-1.5">
            <Mic className="w-3.5 h-3.5 text-stone-900" />
            <span>Hablar con {story?.narratorName?.split(' ')[0] || 'el Guía'}</span>
          </span>
          {session.messages.length > 1 && (
            <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-200 text-[10px] font-bold flex items-center justify-center">
              {session.messages.length}
            </span>
          )}
        </button>
      </div>

      {/* Character Voice & Chat Interactive Modal */}
      {story && (
        <CharacterInteractionModal
          isOpen={characterModalOpen}
          onClose={() => setCharacterModalOpen(false)}
          story={story}
          session={session}
          currentPoi={currentPoi}
          forest={forest}
          onSendTextMessage={onSendMessage}
          textMessages={session.messages}
        />
      )}

      {/* Chat Drawer */}
      <GuideChatDrawer
        isOpen={chatDrawerOpen}
        onClose={() => setChatDrawerOpen(false)}
        story={story}
        messages={session.messages}
        onSendMessage={onSendMessage}
        loading={loading}
        currentPoiName={currentPoi?.name}
      />

      {/* Geolocated Augmented Reality View Modal */}
      {currentPoi && (
        <GeolocatedARModal
          isOpen={isArModalOpen}
          onClose={() => setIsArModalOpen(false)}
          poi={currentPoi}
          playerLat={playerLat}
          playerLng={playerLng}
          isRiddleSolved={session.completedPois.includes(currentPoiId)}
          simulatedGps={simulatedGps}
        />
      )}

      {/* EMERGENCY & RETURN TO TRAILHEAD MODAL */}
      {showEmergencyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-gradient-to-b from-[#1C201A] to-[#121612] border-2 border-red-700/80 rounded-3xl shadow-2xl p-6 text-stone-100 space-y-5">
            <button
              onClick={() => setShowEmergencyModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-stone-400 hover:text-white bg-black/40 hover:bg-black/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-950 border border-red-600/60 flex items-center justify-center text-red-400 text-2xl shadow-inner shrink-0">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 font-mono">
                  Seguridad Forestal
                </span>
                <h3 className="font-adventure text-lg font-bold text-amber-100">
                  Regreso Seguro al Inicio
                </h3>
              </div>
            </div>

            {/* Direction Compass Indicator */}
            <div className="p-4 rounded-2xl bg-black/50 border border-emerald-900/60 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-14 h-14 rounded-full bg-emerald-950 border-2 border-amber-400 flex items-center justify-center text-amber-300 shadow-md transition-transform"
                  style={{ transform: `rotate(${returnBearing}deg)` }}
                >
                  <Navigation className="w-7 h-7" />
                </div>
                <div>
                  <div className="text-[11px] text-stone-400">Rumbo directo hacia:</div>
                  <div className="font-adventure text-sm font-bold text-amber-200">
                    {startPoi?.name} ({startPoi?.emoji})
                  </div>
                  <div className="text-xs text-emerald-400 font-mono font-bold mt-0.5">
                    {formatDistance(returnDistanceMeters)} al {getBearingCardinal(returnBearing)} ({Math.round(returnBearing)}°)
                  </div>
                </div>
              </div>
            </div>

            {/* GPS Coordinates to tell rangers or emergency */}
            <div className="p-3.5 rounded-xl bg-black/40 border border-stone-800 text-xs space-y-1">
              <div className="text-[11px] text-stone-400 font-semibold">Tus Coordenadas GPS actuales:</div>
              <div className="font-mono text-amber-300 select-all font-bold text-sm">
                {playerLat.toFixed(6)}, {playerLng.toFixed(6)}
              </div>
              <div className="text-[10px] text-stone-500">
                (Puedes dictar estos números a los servicios de rescate o guardia forestal)
              </div>
            </div>

            {/* Forest Safety & SOS Advice */}
            <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-600/30 text-xs text-amber-200/90 space-y-2">
              <div className="font-bold text-amber-300 flex items-center gap-1.5 text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Protocolo si te desorientas en el bosque:</span>
              </div>
              <ul className="list-disc pl-4 space-y-1 text-[11px] text-stone-300">
                <li>Mantén la calma y <strong>no te salgas de senderos marcados</strong>.</li>
                <li><strong>Protocolo de silbato SOS</strong>: 3 pitidos cortos de 3 segundos, espera 1 minuto, repite.</li>
                <li>Sigue la flecha brújula superior para regresar en línea directa a la entrada.</li>
              </ul>
            </div>

            {/* Emergency Phone Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <a
                href="tel:112"
                className="py-3 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-all text-center"
              >
                <Phone className="w-4 h-4" />
                <span>Llamar al 112</span>
              </a>
              <button
                type="button"
                onClick={() => setShowEmergencyModal(false)}
                className="py-3 px-3 rounded-xl bg-[#1C2C1F] hover:bg-emerald-900 border border-emerald-700/60 text-stone-200 text-xs font-semibold active:scale-95 transition-all"
              >
                Volver a la Ruta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DOUBLE FALLBACK: VISUAL ARRIVAL CONFIRMATION MODAL */}
      {showVisualConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-gradient-to-b from-[#1C2C1E] to-[#121E14] border border-amber-600/60 rounded-3xl shadow-2xl p-6 text-stone-100 space-y-5">
            <button
              onClick={() => setShowVisualConfirmModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-stone-400 hover:text-white bg-black/40 hover:bg-black/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-3xl shadow-inner shrink-0">
                {currentPoi?.emoji || '📍'}
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 font-mono">
                  Doble Respaldo de Llegada
                </span>
                <h3 className="font-adventure text-lg font-bold text-amber-100">
                  {currentPoi?.name}
                </h3>
              </div>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              En bosques densos la señal GPS puede rebotar con las copas de los árboles. Comprueba los elementos visuales característicos de este punto:
            </p>

            {/* Reference Clue Details */}
            <div className="p-4 rounded-2xl bg-black/40 border border-emerald-900/60 space-y-2.5 text-xs">
              <div>
                <span className="text-emerald-400 font-semibold">Descripción del lugar: </span>
                <span className="text-stone-200">{currentPoi?.description}</span>
              </div>
              {currentPoi?.clueSnippet && (
                <div className="pt-1.5 border-t border-emerald-950">
                  <span className="text-amber-300 font-semibold">Marcas visuales: </span>
                  <span className="text-amber-100 italic font-serif">"{currentPoi.clueSnippet}"</span>
                </div>
              )}
            </div>

            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-[11px] text-amber-200/90">
              ¿Estás físicamente frente a este hito o senda? Al confirmar se desbloqueará el enigma y el visor de Realidad Aumentada sin depender de la señal GPS.
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowVisualConfirmModal(false)}
                className="py-3 px-3 rounded-xl bg-black/40 hover:bg-black/60 border border-stone-800 text-stone-300 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  setManualArrivalConfirmed(true);
                  setShowVisualConfirmModal(false);
                  sounds.playSuccess();
                }}
                className="py-3 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-adventure text-xs font-bold shadow-lg shadow-emerald-950/60 active:scale-95 transition-all"
              >
                ¡Sí, estoy aquí!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
