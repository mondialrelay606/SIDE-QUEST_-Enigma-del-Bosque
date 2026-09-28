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
  Footprints,
  Eye,
  Navigation,
  Mic,
  Users,
  Camera,
  RotateCcw,
  ShieldAlert,
  Phone,
  AlertTriangle,
  X,
  PauseCircle,
  Sun,
  Moon,
  Contrast,
  BookOpen,
  Award,
  KeyRound,
} from 'lucide-react';
import { GuideChatDrawer } from './GuideChatDrawer';
import { CharacterInteractionModal } from './CharacterInteractionModal';
import { ForestNavigationMap } from './ForestNavigationMap';
import { GeolocatedARModal } from './GeolocatedARModal';
import { AmbientAudioControl } from './AmbientAudioControl';
import { TransitDisplacementCard } from './TransitDisplacementCard';
import { RewardScreenCard } from './RewardScreenCard';
import { RiddleTypeInteractive } from './RiddleTypeInteractive';
import { MetaEnigmaModal } from './MetaEnigmaModal';

interface GameViewProps {
  session: PlayerSession;
  forest: ForestPack;
  onSubmitAnswer: (answer: string, riddleId?: string) => Promise<{ isCorrect: boolean; message?: string }>;
  onRequestHint: (level: 1 | 2 | 3) => Promise<{ hint: string; penalty: number }>;
  onSendMessage: (text: string) => Promise<void>;
  onUpdateLocation: (lat: number, lng: number) => Promise<void>;
  onArriveAtPoi?: () => Promise<void>;
  onContinueTransit?: () => Promise<void>;
  onSolveMetaEnigma?: (answer: string) => Promise<{ isCorrect: boolean; message: string }>;
  simulatedGps: boolean;
  onToggleSimulatedGps: () => void;
  loading: boolean;
  onOpenPauseModal?: () => void;
  onFinishGame?: (rating: number, comment: string) => void;
}

export const GameView: React.FC<GameViewProps> = ({
  session,
  forest,
  onSubmitAnswer,
  onRequestHint,
  onSendMessage,
  onUpdateLocation,
  onArriveAtPoi,
  onContinueTransit,
  onSolveMetaEnigma,
  simulatedGps,
  onToggleSimulatedGps,
  loading,
  onOpenPauseModal,
  onFinishGame,
}) => {
  // Navigation tabs (10bis: pestañas inferiores)
  const [activeTab, setActiveTab] = useState<'route' | 'map' | 'hints' | 'codex' | 'chat'>('route');

  // Accessibility modes (10bis: Alto Contraste & Modo Atardecer)
  const [highContrast, setHighContrast] = useState(false);
  const [sunsetMode, setSunsetMode] = useState(false);

  // Modals and drawers
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
  const [characterModalOpen, setCharacterModalOpen] = useState(false);
  const [hintDrawerOpen, setHintDrawerOpen] = useState(false);
  const [isArModalOpen, setIsArModalOpen] = useState(false);
  const [isCodexModalOpen, setIsCodexModalOpen] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showVisualConfirmModal, setShowVisualConfirmModal] = useState(false);
  const [hintLoading, setHintLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  // Player GPS coords
  const [playerLat, setPlayerLat] = useState(session.lat || forest.centerLat);
  const [playerLng, setPlayerLng] = useState(session.lng || forest.centerLng);

  // Current & Previous POIs
  const currentPoiId = session.routePoiIds[session.currentPoiIndex] || session.routePoiIds[0];
  const currentPoi = forest.pois.find((p) => p.id === currentPoiId) || forest.pois[0];
  const previousPoiId = session.currentPoiIndex > 0 ? session.routePoiIds[session.currentPoiIndex - 1] : undefined;
  const previousPoi = previousPoiId ? forest.pois.find((p) => p.id === previousPoiId) : undefined;
  const nextPoiId =
    session.currentPoiIndex + 1 < session.routePoiIds.length
      ? session.routePoiIds[session.currentPoiIndex + 1]
      : undefined;
  const nextPoi = nextPoiId ? forest.pois.find((p) => p.id === nextPoiId) : undefined;
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

  // Real or Simulated Geolocation Hook
  useEffect(() => {
    if (simulatedGps) {
      if (currentPoi) {
        // In simulated GPS mode, place close enough
        setPlayerLat(currentPoi.lat + 0.00012);
        setPlayerLng(currentPoi.lng - 0.0001);
        onUpdateLocation(currentPoi.lat + 0.00012, currentPoi.lng - 0.0001);
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
          console.warn('Geolocation fallback:', err.message);
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

  // Arrival threshold: 60m in easyMode (kids/mobility), 25m standard (Sección 6bis)
  const arrivalRadiusMeters = session.easyMode ? 60 : 25;
  const isNearPoi = distanceMeters <= arrivalRadiusMeters;

  // Phase determination (Sección 6bis: separar "resolver" de "llegar")
  // Default to 'in_transit' if not arrived yet
  const effectivePhase = session.phase || (session.hasArrivedAtPoi ? 'at_poi' : 'in_transit');

  // Automatic GPS Arrival Trigger (with tactile vibration)
  useEffect(() => {
    if (isNearPoi && effectivePhase === 'in_transit' && onArriveAtPoi) {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
      sounds.playSuccess();
      onArriveAtPoi();
    }
  }, [isNearPoi, effectivePhase]);

  // Ambient Audio Sync
  useEffect(() => {
    ambientAudio.updateContext({
      forest,
      story,
      currentPoi,
      distanceMeters,
      isNearPoi: Boolean(session.hasArrivedAtPoi || isNearPoi),
    });
  }, [forest, story, currentPoi, distanceMeters, session.hasArrivedAtPoi, isNearPoi]);

  useEffect(() => {
    ambientAudio.start();
  }, []);

  // Find Main Riddle for this POI
  let riddle = forest.riddles.find(
    (r) =>
      r.poiId === currentPoiId &&
      r.storyId === session.storyId &&
      r.difficulty === session.difficulty &&
      !r.isBonus
  );
  if (!riddle) {
    riddle = forest.riddles.find(
      (r) => r.poiId === currentPoiId && r.storyId === session.storyId && !r.isBonus
    );
  }
  if (!riddle) {
    riddle = forest.riddles.find((r) => r.poiId === currentPoiId && !r.isBonus);
  }

  // Find Optional Bonus Riddles for this POI (Sección 6ter)
  const bonusRiddles = forest.riddles.filter(
    (r) => r.poiId === currentPoiId && r.isBonus
  );

  // Scene narrative
  const sceneNarrativeKey = `${session.storyId}_${currentPoiId}`;
  const sceneText =
    forest.sceneNarratives[sceneNarrativeKey] ||
    currentPoi?.description ||
    'Observa detenidamente lo que te rodea en este rincón del bosque.';

  // Speech narration
  const toggleSpeech = () => {
    if (speaking) {
      sounds.stopSpeaking();
      setSpeaking(false);
    } else {
      setSpeaking(true);
      sounds.speakText(`${currentPoi?.name}. ${sceneText}.`, () => {
        setSpeaking(false);
      });
    }
  };

  // Arrival confirmation handlers (Sección 6bis: sin penalización)
  const handleConfirmArrivalManual = async () => {
    if (onArriveAtPoi) {
      await onArriveAtPoi();
      sounds.playSuccess();
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([150, 80, 150]);
      }
    }
  };

  // Continue transit handler
  const handleContinueTransitNext = async () => {
    if (onContinueTransit) {
      await onContinueTransit();
      sounds.playClick();
    }
  };

  // Hints
  const currentPoiHints = session.hintHistory.filter((h) => h.poiId === currentPoiId);

  const handleRequestHintProgressive = async (level: 1 | 2 | 3) => {
    setHintLoading(true);
    try {
      await onRequestHint(level);
      sounds.playHintChime();
    } finally {
      setHintLoading(false);
    }
  };

  const getBearingCardinal = (deg: number): string => {
    const directions = ['Norte', 'Noreste', 'Este', 'Sureste', 'Sur', 'Suroeste', 'Oeste', 'Noroeste'];
    const idx = Math.round(((deg %= 360) < 0 ? deg + 360 : deg) / 45) % 8;
    return directions[idx];
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        highContrast
          ? 'bg-black text-white font-sans'
          : sunsetMode
          ? 'bg-[#1F1712] text-amber-50 font-sans'
          : 'bg-[#142016] text-stone-100 font-sans'
      }`}
    >
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-5 space-y-5 pb-36">
        {/* Top Control Bar: Partida, SOS, Alto Contraste & Atardecer */}
        <div className="bg-black/40 border border-emerald-900/60 rounded-2xl px-4 py-2.5 flex items-center justify-between gap-2.5 text-xs shadow-md">
          {/* Partida & Rumbo a casa */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-700/50 flex items-center justify-center text-emerald-300 shrink-0">
              <RotateCcw className="w-3.5 h-3.5" />
            </div>
            <div className="truncate">
              <span className="font-bold text-amber-200 truncate block sm:inline">{startPoi?.name}</span>
              <span className="text-[11px] text-emerald-300 font-mono sm:ml-2">
                {formatDistance(returnDistanceMeters)} ({Math.round(returnBearing)}°)
              </span>
            </div>
          </div>

          {/* Quick Action Toggles */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* High Contrast Toggle (10bis) */}
            <button
              type="button"
              onClick={() => setHighContrast(!highContrast)}
              className={`p-2 rounded-xl border transition-all ${
                highContrast
                  ? 'bg-yellow-400 text-black border-yellow-300 font-bold'
                  : 'bg-stone-900/80 border-stone-700 text-stone-300 hover:text-white'
              }`}
              title="Modo Alto Contraste (ideal bajo sol directo)"
            >
              <Contrast className="w-4 h-4" />
            </button>

            {/* Sunset Mode Toggle (10bis) */}
            <button
              type="button"
              onClick={() => setSunsetMode(!sunsetMode)}
              className={`p-2 rounded-xl border transition-all ${
                sunsetMode
                  ? 'bg-amber-600 text-stone-950 border-amber-400 font-bold'
                  : 'bg-stone-900/80 border-stone-700 text-stone-300 hover:text-white'
              }`}
              title="Modo Atardecer / Crepúsculo"
            >
              {sunsetMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Pause Expedition Button */}
            {onOpenPauseModal && (
              <button
                type="button"
                onClick={onOpenPauseModal}
                className="px-2.5 py-1.5 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-600/70 text-amber-200 font-adventure text-[11px] font-bold flex items-center gap-1"
                title="Pausar para continuar otro día o abandonar"
              >
                <PauseCircle className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Pausar</span>
              </button>
            )}

            {/* SOS Emergency */}
            <button
              type="button"
              onClick={() => setShowEmergencyModal(true)}
              className="px-2.5 py-1.5 rounded-xl bg-red-950/90 hover:bg-red-900 border border-red-700 text-red-200 font-adventure text-[11px] font-bold flex items-center gap-1"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
              <span>SOS</span>
            </button>
          </div>
        </div>

        {/* Trail Progress Header */}
        <div className="bg-[#19271C] border border-emerald-900/60 rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-900/70 border border-emerald-500/40 flex items-center justify-center text-2xl shadow">
              {currentPoi?.emoji || '📍'}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider font-adventure">
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

          {/* Progress dots & Ambient Sound Control */}
          <div className="flex items-center gap-3 self-start sm:self-center justify-between w-full sm:w-auto">
            <AmbientAudioControl variant="header" />
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

        {/* ========================================================================= */}
        {/* MAIN GAME VIEW: 3-PHASE RHYTHM (SECCIÓN 6bis)                             */}
        {/* ========================================================================= */}

        {/* FASE 1: DESPLAZAMIENTO / EN TRÁNSITO AL SIGUIENTE PUNTO */}
        {activeTab === 'route' && effectivePhase === 'in_transit' && (
          <TransitDisplacementCard
            currentPoi={currentPoi}
            previousPoi={previousPoi}
            forest={forest}
            story={story}
            playerLat={playerLat}
            playerLng={playerLng}
            distanceMeters={distanceMeters}
            bearing={bearing}
            arrivalRadiusMeters={arrivalRadiusMeters}
            isNearPoi={isNearPoi}
            onConfirmArrival={handleConfirmArrivalManual}
            onOpenVisualConfirm={() => setShowVisualConfirmModal(true)}
            highContrast={highContrast}
          />
        )}

        {/* FASE 2: EN EL HITO (ENIGMA & RESOLUCIÓN) */}
        {activeTab === 'route' && effectivePhase === 'at_poi' && (
          <div className="space-y-5 animate-in fade-in duration-300">
            {/* Arrival Badge */}
            <div className="rounded-xl bg-emerald-950/70 border border-emerald-500/50 px-4 py-2.5 flex items-center justify-between gap-2 text-xs text-emerald-300 shadow">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-semibold">
                  ¡Llegada confirmada! Estás en {currentPoi.name}. Enigma desbloqueado.
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-900/60 font-mono text-emerald-200 border border-emerald-700/50">
                Punto activo
              </span>
            </div>

            {/* Geolocated Augmented Reality Banner */}
            <div className="bg-gradient-to-r from-[#1D2E20] via-[#243A27] to-[#18271A] border border-amber-500/40 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 shadow-inner shrink-0">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-amber-300 font-mono flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Realidad Aumentada GPS</span>
                  </div>
                  <h3 className="font-adventure text-sm sm:text-base font-bold text-amber-100">
                    {currentPoi?.arAsset?.title || `Proyección Mística de ${currentPoi?.name}`}
                  </h3>
                  <p className="text-xs text-stone-300 line-clamp-1 mt-0.5">
                    {currentPoi?.arAsset?.description || 'Apunta con la cámara de tu móvil para ver el objeto 3D.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setIsArModalOpen(true);
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-500 text-stone-950 font-adventure text-xs font-bold tracking-wider flex items-center justify-center gap-1.5 shadow active:scale-95 transition-all shrink-0"
              >
                <Camera className="w-4 h-4 text-stone-950" />
                <span>Ver en AR</span>
              </button>
            </div>

            {/* Scene Narrative Atmospheric Card */}
            <div className="relative rounded-2xl bg-gradient-to-br from-[#203023] via-[#1B291D] to-[#152017] border border-amber-600/30 p-5 sm:p-6 shadow-xl text-stone-200 space-y-4">
              <div className="flex items-center justify-between border-b border-emerald-900/50 pb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-300 font-adventure">
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
                  <span className="hidden sm:inline">{speaking ? 'Detener' : 'Escuchar'}</span>
                </button>
              </div>

              <p className="text-sm sm:text-base leading-relaxed text-amber-50 font-serif italic">
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

            {/* Main Riddle Box */}
            {riddle && (
              <div className="rounded-2xl bg-[#19271C] border border-emerald-800/60 p-5 sm:p-6 shadow-xl space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-amber-400" />
                    <h3 className="font-adventure text-base sm:text-lg font-bold text-amber-100">
                      {riddle.name}
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded">
                    +{riddle.points} pts
                  </span>
                </div>

                {/* Question */}
                <div className="p-4 rounded-xl bg-black/40 border border-emerald-900/70 text-stone-100 text-sm sm:text-base font-medium leading-relaxed">
                  {riddle.question}
                </div>

                {/* Interactive Answer Input / Mechanic (6ter: foto, contar, brújula, escucha, etc.) */}
                <RiddleTypeInteractive
                  riddle={riddle}
                  onSubmit={(ans, rId) => onSubmitAnswer(ans, rId)}
                  loading={loading}
                  highContrast={highContrast}
                />

                {/* Progressive Hints Accordion */}
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

                {hintDrawerOpen && (
                  <div className="p-4 rounded-xl bg-[#141F16] border border-amber-600/40 space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-300 uppercase tracking-wider font-adventure">
                        Pistas Progresivas del Guía
                      </span>
                      <span className="text-[11px] text-stone-400">
                        Puntos actuales: <strong>{session.points}</strong>
                      </span>
                    </div>

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
                              onClick={() => handleRequestHintProgressive(item.lvl as 1 | 2 | 3)}
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
            )}

            {/* Optional Bonus Challenges (Sección 6ter: pruebas extra opcionales) */}
            {bonusRiddles.map((b) => (
              <div
                key={b.id}
                className="p-5 rounded-2xl bg-gradient-to-r from-[#20291E] to-[#182317] border border-amber-500/40 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-adventure font-bold text-amber-200 uppercase tracking-wider">
                      Reto Extra Opcional: {b.name}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    +{b.bonusPoints || 50} pts bonus
                  </span>
                </div>

                <p className="text-xs text-stone-300">{b.question}</p>

                <RiddleTypeInteractive
                  riddle={b}
                  onSubmit={(ans, rId) => onSubmitAnswer(ans, rId)}
                  loading={loading}
                  highContrast={highContrast}
                />
              </div>
            ))}
          </div>
        )}

        {/* FASE 3: RECOMPENSA TRAS ACERTAR (SECCIÓN 6bis) */}
        {activeTab === 'route' && effectivePhase === 'reward' && (
          <RewardScreenCard
            session={session}
            currentPoi={currentPoi}
            nextPoi={nextPoi}
            forest={forest}
            story={story}
            onContinue={handleContinueTransitNext}
            highContrast={highContrast}
          />
        )}

        {/* TAB: MAPA Y NAVEGACIÓN */}
        {activeTab === 'map' && (
          <div className="space-y-4 animate-in fade-in duration-200">
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
              isNearPoi={Boolean(session.hasArrivedAtPoi || isNearPoi)}
              onOpenAR={() => {
                sounds.playClick();
                setIsArModalOpen(true);
              }}
            />
          </div>
        )}

        {/* TAB: PISTAS Y BITÁCORA */}
        {activeTab === 'hints' && (
          <div className="p-6 rounded-2xl bg-[#19271C] border border-emerald-900/60 space-y-4 animate-in fade-in duration-200">
            <h3 className="font-adventure text-lg font-bold text-amber-100 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-400" />
              <span>Historial de Pistas y Cuaderno de Campo</span>
            </h3>

            {session.hintHistory.length > 0 ? (
              <div className="space-y-3">
                {session.hintHistory.map((h, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-black/40 border border-emerald-800/60 text-xs space-y-1">
                    <div className="flex items-center justify-between text-amber-400 font-bold uppercase text-[10px]">
                      <span>Nivel {h.level}</span>
                      <span className="text-stone-500 font-normal">{h.timestamp}</span>
                    </div>
                    <p className="text-stone-200 italic">"{h.text}"</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-stone-400 italic">
                Aún no has solicitado pistas. ¡Tu instinto de explorador va impecable!
              </p>
            )}
          </div>
        )}
      </div>

      {/* FIXED BOTTOM NAVIGATION BAR (10bis: pestañas inferiores) */}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-[#0E1610]/95 backdrop-blur-md border-t border-emerald-900/80 px-2 py-2 shadow-2xl">
        <div className="max-w-md mx-auto flex items-center justify-around">
          {/* Ruta / Prueba */}
          <button
            type="button"
            onClick={() => setActiveTab('route')}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[10px] font-bold transition-all ${
              activeTab === 'route'
                ? 'text-amber-300 bg-emerald-950/80 border border-emerald-700/60 shadow'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Compass className="w-5 h-5" />
            <span>Ruta</span>
          </button>

          {/* Mapa */}
          <button
            type="button"
            onClick={() => setActiveTab('map')}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[10px] font-bold transition-all ${
              activeTab === 'map'
                ? 'text-amber-300 bg-emerald-950/80 border border-emerald-700/60 shadow'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <MapPin className="w-5 h-5" />
            <span>Mapa</span>
          </button>

          {/* Códice / Mochila (Meta-Enigma) */}
          <button
            type="button"
            onClick={() => setIsCodexModalOpen(true)}
            className="relative flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[10px] font-bold text-amber-200 hover:text-white transition-all"
          >
            <KeyRound className="w-5 h-5 text-amber-400" />
            <span>Códice</span>
            {(session.collectedRunes?.length || 0) > 0 && (
              <span className="absolute top-0 right-1 w-4 h-4 rounded-full bg-amber-500 text-stone-950 text-[9px] font-bold flex items-center justify-center font-mono">
                {session.collectedRunes?.length}
              </span>
            )}
          </button>

          {/* Pistas */}
          <button
            type="button"
            onClick={() => setActiveTab('hints')}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[10px] font-bold transition-all ${
              activeTab === 'hints'
                ? 'text-amber-300 bg-emerald-950/80 border border-emerald-700/60 shadow'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Lightbulb className="w-5 h-5" />
            <span>Pistas</span>
          </button>

          {/* Guía / Voz */}
          <button
            type="button"
            onClick={() => setCharacterModalOpen(true)}
            className="flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[10px] font-bold text-stone-300 hover:text-amber-200 transition-all"
          >
            <Mic className="w-5 h-5 text-emerald-400" />
            <span>Guía</span>
          </button>
        </div>
      </nav>

      {/* MODALS */}
      {/* 1. Character Voice Modal */}
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

      {/* 2. AR Modal */}
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

      {/* 3. Codex & Meta-Enigma Final Modal */}
      <MetaEnigmaModal
        isOpen={isCodexModalOpen}
        onClose={() => setIsCodexModalOpen(false)}
        session={session}
        forest={forest}
        onSolveMetaEnigma={onSolveMetaEnigma || (async (ans) => ({ isCorrect: true, message: '¡Pacto sellado!' }))}
        onFinishGame={onFinishGame || (() => {})}
        highContrast={highContrast}
      />

      {/* 4. Visual Arrival Confirm Modal */}
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
              En bosques densos la señal GPS puede rebotar con las copas de los árboles. Comprueba los elementos visuales de este hito:
            </p>

            <div className="p-4 rounded-2xl bg-black/40 border border-emerald-900/60 space-y-2 text-xs">
              <div>
                <span className="text-emerald-400 font-semibold">Descripción del hito: </span>
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
              ¿Estás físicamente frente a este hito? Al confirmar se desbloqueará el enigma sin penalización.
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
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
                  setShowVisualConfirmModal(false);
                  handleConfirmArrivalManual();
                }}
                className="py-3 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white font-adventure text-xs font-bold shadow-lg active:scale-95 transition-all"
              >
                ¡Sí, estoy aquí!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Emergency SOS Modal */}
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

            <div className="p-4 rounded-2xl bg-black/50 border border-emerald-900/60 flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full bg-emerald-950 border-2 border-amber-400 flex items-center justify-center text-amber-300 shadow-md shrink-0"
                style={{ transform: `rotate(${returnBearing}deg)` }}
              >
                <Navigation className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] text-stone-400">Rumbo hacia la entrada:</div>
                <div className="font-adventure text-sm font-bold text-amber-200">
                  {startPoi?.name} ({startPoi?.emoji})
                </div>
                <div className="text-xs text-emerald-400 font-mono font-bold mt-0.5">
                  {formatDistance(returnDistanceMeters)} al {getBearingCardinal(returnBearing)} ({Math.round(returnBearing)}°)
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-stone-800 text-xs space-y-1">
              <div className="text-[11px] text-stone-400 font-semibold">Tus Coordenadas GPS actuales:</div>
              <div className="font-mono text-amber-300 select-all font-bold text-sm">
                {playerLat.toFixed(6)}, {playerLng.toFixed(6)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <a
                href="tel:112"
                className="py-3 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow active:scale-95 transition-all text-center"
              >
                <Phone className="w-4 h-4" />
                <span>Llamar al 112</span>
              </a>
              <button
                type="button"
                onClick={() => setShowEmergencyModal(false)}
                className="py-3 px-3 rounded-xl bg-[#1C2C1F] hover:bg-emerald-900 border border-emerald-700/60 text-stone-200 text-xs font-semibold"
              >
                Volver a la Ruta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
