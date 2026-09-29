/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ForestPack, PlayerSession, DifficultyType, DurationType, StoryIntro } from './types';
import { SEED_FOREST_PACKS } from './data/seedPacks';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { ForestSelector } from './components/ForestSelector';
import { NewGameModal } from './components/NewGameModal';
import { ResumeGameModal } from './components/ResumeGameModal';
import { GameView } from './components/GameView';
import { CompletionModal } from './components/CompletionModal';
import { AdminPanel } from './components/AdminPanel';
import { CharacterInteractionModal } from './components/CharacterInteractionModal';
import { AdminAuthModal } from './components/AdminAuthModal';
import { BriefingModal } from './components/BriefingModal';
import { PauseOrAbandonModal } from './components/PauseOrAbandonModal';
import { ambientAudio } from './utils/audio';
import { useI18n } from './context/I18nContext';

export default function App() {
  const { currentLanguage, localizeForest, onForestSelected } = useI18n();
  const [forests, setForests] = useState<ForestPack[]>(SEED_FOREST_PACKS);
  const [currentView, setCurrentView] = useState<'home' | 'game' | 'admin'>('home');
  const [selectedForest, setSelectedForest] = useState<ForestPack | null>(SEED_FOREST_PACKS[0] || null);
  const [activeSession, setActiveSession] = useState<PlayerSession | null>(null);

  // Modals
  const [isNewGameOpen, setIsNewGameOpen] = useState(false);
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const [isCompletionOpen, setIsCompletionOpen] = useState(false);
  const [isBriefingOpen, setIsBriefingOpen] = useState(false);
  const [isPauseModalOpen, setIsPauseModalOpen] = useState(false);
  const [isAdminAuthOpen, setIsAdminAuthOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(true);
  const [activeCharacterStory, setActiveCharacterStory] = useState<StoryIntro | null>(null);
  const [isCharacterModalOpen, setIsCharacterModalOpen] = useState(false);

  // GPS Simulation toggle (default true for smooth testability, toggleable to real GPS anytime)
  const [simulatedGps, setSimulatedGps] = useState(true);
  const [loading, setLoading] = useState(false);

  // Load forests & restore previous session from localStorage on startup
  useEffect(() => {
    loadForests();
    restoreSessionFromStorage();

    // Check URL route for direct organizer access (#admin, /admin, ?admin=true)
    const checkAdminRoute = () => {
      const hash = window.location.hash;
      const pathname = window.location.pathname;
      const search = window.location.search;
      if (hash === '#admin' || pathname === '/admin' || search.includes('admin=true')) {
        setCurrentView('admin');
      }
    };
    checkAdminRoute();
    window.addEventListener('hashchange', checkAdminRoute);
    return () => window.removeEventListener('hashchange', checkAdminRoute);
  }, []);

  useEffect(() => {
    if (selectedForest) {
      ambientAudio.updateContext({ forest: selectedForest });
    }
  }, [selectedForest]);

  const loadForests = async () => {
    try {
      const data = await api.getForests();
      if (data && data.length > 0) {
        setForests(data);
        if (!selectedForest) {
          setSelectedForest(data[0]);
        }
      }
    } catch (err) {
      console.warn('Using embedded forests:', err);
    }
  };

  const restoreSessionFromStorage = async () => {
    const savedCode = localStorage.getItem('enigma_active_session');
    if (savedCode) {
      try {
        const { session, forestPack } = await api.getSession(savedCode);
        setActiveSession(session);
        setSelectedForest(forestPack);
        if (session.status === 'completed') {
          setIsCompletionOpen(true);
        }
        setCurrentView('game');
      } catch (e) {
        localStorage.removeItem('enigma_active_session');
      }
    }
  };

  // Start a new session
  const handleStartSession = async (config: {
    forestPackId: string;
    name: string;
    type: 'individual' | 'grupo';
    storyId: string;
    difficulty: DifficultyType;
    duration: DurationType;
    easyMode?: boolean;
  }) => {
    setLoading(true);
    try {
      const { session, forestPack } = await api.createSession(config);
      setActiveSession(session);
      setSelectedForest(forestPack);
      localStorage.setItem('enigma_active_session', session.code);
      setIsNewGameOpen(false);
      setIsBriefingOpen(true);
      setCurrentView('game');
    } catch (e: any) {
      alert(e.message || 'Error al iniciar expedición');
    } finally {
      setLoading(false);
    }
  };

  // Resume game with code
  const handleResumeSession = async (code: string) => {
    setLoading(true);
    try {
      const { session, forestPack } = await api.getSession(code);
      setActiveSession(session);
      setSelectedForest(forestPack);
      localStorage.setItem('enigma_active_session', session.code);
      setIsResumeOpen(false);
      setIsBriefingOpen(false); // Resumed session skips briefing
      setCurrentView('game');
      if (session.status === 'completed') {
        setIsCompletionOpen(true);
      }
    } finally {
      setLoading(false);
    }
  };

  // Submit Answer in Game (Supports 6ter all types & bonus)
  const handleSubmitAnswer = async (answer: string, riddleId?: string) => {
    if (!activeSession) return { isCorrect: false };
    setLoading(true);
    try {
      const res = await api.submitAnswer(activeSession.code, answer, riddleId);
      setActiveSession(res.session);
      return { isCorrect: res.isCorrect, message: res.message };
    } catch (err: any) {
      return { isCorrect: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Arrive at POI (Sección 6bis: desbloqueo GPS 25m/60m o botón «Estoy aquí»)
  const handleArriveAtPoi = async () => {
    if (!activeSession) return;
    try {
      const res = await api.arriveAtPoi(activeSession.code);
      setActiveSession(res.session);
    } catch (e) {
      console.error('Error arriving at POI:', e);
    }
  };

  // Continue Transit to next POI (Sección 6bis: tras pantalla de recompensa)
  const handleContinueTransit = async () => {
    if (!activeSession) return;
    try {
      const res = await api.continueTransit(activeSession.code);
      setActiveSession(res.session);
      if (res.isComplete) {
        setIsCompletionOpen(true);
      }
    } catch (e) {
      console.error('Error continuing transit:', e);
    }
  };

  // Solve Meta-Enigma Final (Sección 6ter)
  const handleSolveMetaEnigma = async (answer: string) => {
    if (!activeSession) return { isCorrect: false, message: 'No hay partida activa' };
    try {
      const res = await api.solveMetaEnigma(activeSession.code, answer);
      setActiveSession(res.session);
      return { isCorrect: res.isCorrect, message: res.message };
    } catch (e: any) {
      return { isCorrect: false, message: e.message || 'Error al resolver el códice' };
    }
  };

  // Request Progressive Hint
  const handleRequestHint = async (level: 1 | 2 | 3) => {
    if (!activeSession) return { hint: '', penalty: 0 };
    const res = await api.requestHint(activeSession.code, level);
    setActiveSession((prev) =>
      prev
        ? {
            ...prev,
            points: res.currentPoints,
            hintHistory: [
              ...prev.hintHistory,
              {
                poiId: prev.routePoiIds[prev.currentPoiIndex],
                level,
                text: res.hint,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ],
          }
        : null
    );
    return { hint: res.hint, penalty: res.pointsPenalty };
  };

  // Send message to guide
  const handleSendMessage = async (text: string) => {
    if (!activeSession) return;
    // Optimistically record player message
    const playerMsg = {
      id: `msg-p-${Date.now()}`,
      sender: 'player' as const,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setActiveSession((prev) =>
      prev ? { ...prev, messages: [...prev.messages, playerMsg] } : null
    );

    try {
      const { reply } = await api.sendChatMessage(activeSession.code, text);
      setActiveSession((prev) =>
        prev ? { ...prev, messages: [...prev.messages, reply] } : null
      );
    } catch (err) {
      console.error('Chat error:', err);
    }
  };

  // Update Location
  const handleUpdateLocation = async (lat: number, lng: number) => {
    if (!activeSession) return;
    await api.updateLocation(activeSession.code, lat, lng);
  };

  // Complete & Rate Game
  const handleFinishGame = async (rating: number, comment: string) => {
    if (!activeSession) return;
    setLoading(true);
    try {
      await api.submitFeedback(activeSession.code, rating, comment);
      localStorage.removeItem('enigma_active_session');
      setTimeout(() => {
        setIsCompletionOpen(false);
        setActiveSession(null);
        setCurrentView('home');
        loadForests();
      }, 1500);
    } catch (e: any) {
      alert(e.message || 'Error al guardar valoración');
    } finally {
      setLoading(false);
    }
  };

  // Pause and save session to resume another day
  const handlePauseAndSave = () => {
    if (activeSession) {
      localStorage.setItem('enigma_active_session', activeSession.code);
    }
    setIsPauseModalOpen(false);
    setCurrentView('home');
  };

  // Abandon session permanently
  const handleAbandonPermanently = async () => {
    if (activeSession) {
      try {
        await api.abandonSession(activeSession.code);
      } catch (e) {
        console.error('Error abandoning session:', e);
      }
      localStorage.removeItem('enigma_active_session');
      setActiveSession(null);
    }
    setIsPauseModalOpen(false);
    setCurrentView('home');
  };

  // Admin Access Gate (Contraseña desactivada por el momento)
  const handleOpenAdmin = () => {
    setIsAdminAuthenticated(true);
    setCurrentView('admin');
  };

  const handleAdminAuthenticated = () => {
    setIsAdminAuthenticated(true);
    setCurrentView('admin');
  };

  const handleAdminLogout = () => {
    if (window.location.hash === '#admin') {
      history.replaceState(null, '', window.location.pathname);
    }
    setCurrentView(activeSession ? 'game' : 'home');
  };

  // Localized data computed reactively based on currentLanguage
  const localizedForests = forests.map((f) => localizeForest(f));
  const localizedSelectedForest = selectedForest ? localizeForest(selectedForest) : null;

  return (
    <div className="min-h-screen bg-[#142016] text-stone-100 flex flex-col font-sans selection:bg-emerald-700 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        sessionCode={activeSession?.code}
        points={activeSession?.points}
        onNavigateHome={() => {
          if (currentView === 'game') {
            setIsPauseModalOpen(true);
          } else {
            setCurrentView(activeSession ? 'game' : 'home');
          }
        }}
        onOpenAdmin={handleOpenAdmin}
        isAdminAuthenticated={isAdminAuthenticated}
        onLogoutAdmin={handleAdminLogout}
        simulatedGps={simulatedGps}
        onToggleSimulatedGps={() => setSimulatedGps(!simulatedGps)}
        onOpenPauseModal={() => setIsPauseModalOpen(true)}
      />

      {/* Main Viewport */}
      <main className="flex-1">
        {currentView === 'home' && (
          <ForestSelector
            forests={localizedForests}
            onSelectForest={(f) => {
              onForestSelected(f);
              setSelectedForest(f);
              setIsNewGameOpen(true);
            }}
            onResumeGame={() => setIsResumeOpen(true)}
            onInteractWithCharacter={(story, forest) => {
              onForestSelected(forest);
              setSelectedForest(forest);
              setActiveCharacterStory(story);
              setIsCharacterModalOpen(true);
            }}
            loading={loading}
            activeSession={activeSession}
            selectedForest={localizedSelectedForest}
            onContinueSavedGame={() => setCurrentView('game')}
            onOpenPauseOrAbandon={() => setIsPauseModalOpen(true)}
          />
        )}

        {currentView === 'game' && activeSession && localizedSelectedForest && (
          <GameView
            session={activeSession}
            forest={localizedSelectedForest}
            onSubmitAnswer={handleSubmitAnswer}
            onRequestHint={handleRequestHint}
            onSendMessage={handleSendMessage}
            onUpdateLocation={handleUpdateLocation}
            onArriveAtPoi={handleArriveAtPoi}
            onContinueTransit={handleContinueTransit}
            onSolveMetaEnigma={handleSolveMetaEnigma}
            simulatedGps={simulatedGps}
            onToggleSimulatedGps={() => setSimulatedGps(!simulatedGps)}
            loading={loading}
            onOpenPauseModal={() => setIsPauseModalOpen(true)}
            onFinishGame={handleFinishGame}
          />
        )}

        {currentView === 'admin' && (
          <AdminPanel
            onBackToGame={() => {
              setCurrentView(activeSession ? 'game' : 'home');
              loadForests();
            }}
            onLogoutAdmin={handleAdminLogout}
          />
        )}
      </main>

      {/* Admin Auth Password Modal */}
      <AdminAuthModal
        isOpen={isAdminAuthOpen}
        onClose={() => setIsAdminAuthOpen(false)}
        onAuthenticated={handleAdminAuthenticated}
      />

      {/* New Game Setup Modal */}
      {localizedSelectedForest && (
        <NewGameModal
          forest={localizedSelectedForest}
          isOpen={isNewGameOpen}
          onClose={() => setIsNewGameOpen(false)}
          onStartSession={handleStartSession}
          loading={loading}
        />
      )}

      {/* Mandatory Safety & Story Briefing Modal */}
      {localizedSelectedForest && activeSession && isBriefingOpen && (
        <BriefingModal
          isOpen={isBriefingOpen}
          forest={localizedSelectedForest}
          session={activeSession}
          onConfirm={() => setIsBriefingOpen(false)}
        />
      )}

      {/* Resume Game Modal */}
      <ResumeGameModal
        isOpen={isResumeOpen}
        onClose={() => setIsResumeOpen(false)}
        onResume={handleResumeSession}
        loading={loading}
      />

      {/* Completion Modal */}
      {activeSession && localizedSelectedForest && isCompletionOpen && (
        <CompletionModal
          session={activeSession}
          forest={localizedSelectedForest}
          onFinish={handleFinishGame}
          loading={loading}
        />
      )}

      {/* Global Character Interaction Modal */}
      {localizedSelectedForest && activeCharacterStory && (
        <CharacterInteractionModal
          isOpen={isCharacterModalOpen}
          onClose={() => setIsCharacterModalOpen(false)}
          story={activeCharacterStory}
          session={activeSession || undefined}
          currentPoi={
            activeSession
              ? localizedSelectedForest.pois.find((p) => p.id === activeSession.routePoiIds[activeSession.currentPoiIndex])
              : localizedSelectedForest.pois[0]
          }
          forest={localizedSelectedForest}
          onSendTextMessage={activeSession ? handleSendMessage : undefined}
          textMessages={activeSession?.messages}
          onSelectOtherCharacter={(other) => setActiveCharacterStory(other)}
        />
      )}

      {/* Pause or Abandon Modal */}
      {selectedForest && activeSession && (
        <PauseOrAbandonModal
          isOpen={isPauseModalOpen}
          onClose={() => setIsPauseModalOpen(false)}
          forest={selectedForest}
          session={activeSession}
          onPauseAndSave={handlePauseAndSave}
          onAbandonPermanently={handleAbandonPermanently}
        />
      )}
      {/* Discreet Footer with subtle copyright & organizer trigger */}
      {currentView !== 'admin' && (
        <footer className="py-6 px-4 text-center text-[11px] text-stone-500 border-t border-emerald-950/80 bg-[#0E150F]">
          <p className="flex items-center justify-center gap-2 flex-wrap">
            <span>Enigma del Bosque</span>
            <span>•</span>
            <span>Rutas y acertijos al aire libre</span>
            <span>•</span>
            <button
              type="button"
              onClick={handleOpenAdmin}
              className="text-stone-600 hover:text-stone-400 underline transition-colors cursor-pointer"
              title="Acceso organizador"
            >
              Acceso organizador
            </button>
          </p>
        </footer>
      )}
    </div>
  );
}
