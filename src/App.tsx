/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ForestPack, PlayerSession, DifficultyType, DurationType, StoryIntro } from './types';
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

export default function App() {
  const [forests, setForests] = useState<ForestPack[]>([]);
  const [currentView, setCurrentView] = useState<'home' | 'game' | 'admin'>('home');
  const [selectedForest, setSelectedForest] = useState<ForestPack | null>(null);
  const [activeSession, setActiveSession] = useState<PlayerSession | null>(null);

  // Modals
  const [isNewGameOpen, setIsNewGameOpen] = useState(false);
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const [isCompletionOpen, setIsCompletionOpen] = useState(false);
  const [isBriefingOpen, setIsBriefingOpen] = useState(false);
  const [isPauseModalOpen, setIsPauseModalOpen] = useState(false);
  const [isAdminAuthOpen, setIsAdminAuthOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(api.isAdminAuthenticated());
  const [activeCharacterStory, setActiveCharacterStory] = useState<StoryIntro | null>(null);
  const [isCharacterModalOpen, setIsCharacterModalOpen] = useState(false);

  // GPS Simulation toggle (default true for smooth testability, toggleable to real GPS anytime)
  const [simulatedGps, setSimulatedGps] = useState(true);
  const [loading, setLoading] = useState(false);

  // Load forests & restore previous session from localStorage on startup
  useEffect(() => {
    loadForests();
    restoreSessionFromStorage();
  }, []);

  useEffect(() => {
    if (selectedForest) {
      ambientAudio.updateContext({ forest: selectedForest });
    }
  }, [selectedForest]);

  const loadForests = async () => {
    setLoading(true);
    try {
      const data = await api.getForests();
      setForests(data);
      if (!selectedForest && data.length > 0) {
        setSelectedForest(data[0]);
      }
    } catch (err) {
      console.error('Error loading forests:', err);
    } finally {
      setLoading(false);
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

  // Submit Answer in Game
  const handleSubmitAnswer = async (answer: string) => {
    if (!activeSession) return { isCorrect: false };
    setLoading(true);
    try {
      const res = await api.submitAnswer(activeSession.code, answer);
      setActiveSession(res.session);
      if (res.isComplete) {
        setIsCompletionOpen(true);
      }
      return { isCorrect: res.isCorrect, message: res.message };
    } catch (err: any) {
      return { isCorrect: false, message: err.message };
    } finally {
      setLoading(false);
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

  // Admin Access Gate
  const handleOpenAdmin = () => {
    if (api.isAdminAuthenticated()) {
      setCurrentView('admin');
    } else {
      setIsAdminAuthOpen(true);
    }
  };

  const handleAdminAuthenticated = () => {
    setIsAdminAuthenticated(true);
    setCurrentView('admin');
  };

  const handleAdminLogout = () => {
    api.clearAdminKey();
    setIsAdminAuthenticated(false);
    setCurrentView(activeSession ? 'game' : 'home');
  };

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
            forests={forests}
            onSelectForest={(f) => {
              setSelectedForest(f);
              setIsNewGameOpen(true);
            }}
            onResumeGame={() => setIsResumeOpen(true)}
            onOpenAdmin={handleOpenAdmin}
            isAdminAuthenticated={isAdminAuthenticated}
            onInteractWithCharacter={(story, forest) => {
              setSelectedForest(forest);
              setActiveCharacterStory(story);
              setIsCharacterModalOpen(true);
            }}
            loading={loading}
          />
        )}

        {currentView === 'game' && activeSession && selectedForest && (
          <GameView
            session={activeSession}
            forest={selectedForest}
            onSubmitAnswer={handleSubmitAnswer}
            onRequestHint={handleRequestHint}
            onSendMessage={handleSendMessage}
            onUpdateLocation={handleUpdateLocation}
            simulatedGps={simulatedGps}
            onToggleSimulatedGps={() => setSimulatedGps(!simulatedGps)}
            loading={loading}
            onOpenPauseModal={() => setIsPauseModalOpen(true)}
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
      {selectedForest && (
        <NewGameModal
          forest={selectedForest}
          isOpen={isNewGameOpen}
          onClose={() => setIsNewGameOpen(false)}
          onStartSession={handleStartSession}
          loading={loading}
        />
      )}

      {/* Mandatory Safety & Story Briefing Modal */}
      {selectedForest && activeSession && isBriefingOpen && (
        <BriefingModal
          isOpen={isBriefingOpen}
          forest={selectedForest}
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
      {activeSession && selectedForest && isCompletionOpen && (
        <CompletionModal
          session={activeSession}
          forest={selectedForest}
          onFinish={handleFinishGame}
          loading={loading}
        />
      )}

      {/* Global Character Interaction Modal */}
      {selectedForest && activeCharacterStory && (
        <CharacterInteractionModal
          isOpen={isCharacterModalOpen}
          onClose={() => setIsCharacterModalOpen(false)}
          story={activeCharacterStory}
          session={activeSession || undefined}
          currentPoi={
            activeSession
              ? selectedForest.pois.find((p) => p.id === activeSession.routePoiIds[activeSession.currentPoiIndex])
              : selectedForest.pois[0]
          }
          forest={selectedForest}
          onSendTextMessage={activeSession ? handleSendMessage : undefined}
          textMessages={activeSession?.messages}
          onSelectOtherCharacter={(other) => setActiveCharacterStory(other)}
        />
      )}
    </div>
  );
}
