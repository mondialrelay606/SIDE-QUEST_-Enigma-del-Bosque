import React, { useState, useEffect, useRef } from 'react';
import { StoryIntro, PlayerSession, WindmillPOI, ForestPack, LiveMessage } from '../types';
import { LiveAudioSession } from '../utils/liveAudio';
import { sounds } from '../utils/audio';
import {
  X,
  Mic,
  MicOff,
  Sparkles,
  Volume2,
  VolumeX,
  MessageSquare,
  Radio,
  Send,
  AlertCircle,
  HelpCircle,
  Compass,
  Footprints,
  RotateCcw
} from 'lucide-react';

interface CharacterInteractionModalProps {
  isOpen: boolean;
  onClose: () => void;
  story: StoryIntro;
  session?: PlayerSession;
  currentPoi?: WindmillPOI;
  forest: ForestPack;
  onSendTextMessage?: (text: string) => Promise<void>;
  textMessages?: LiveMessage[];
  onSelectOtherCharacter?: (otherStory: StoryIntro) => void;
}

export const CharacterInteractionModal: React.FC<CharacterInteractionModalProps> = ({
  isOpen,
  onClose,
  story,
  session,
  currentPoi,
  forest,
  onSendTextMessage,
  textMessages = [],
  onSelectOtherCharacter,
}) => {
  const [mode, setMode] = useState<'voice' | 'chat'>('voice');
  const [isMicActive, setIsMicActive] = useState(false);
  const [liveWsStatus, setLiveWsStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error' | 'simulated'>('disconnected');
  const [characterSpeaking, setCharacterSpeaking] = useState(false);
  const [inputVolume, setInputVolume] = useState(0);
  const [outputVolume, setOutputVolume] = useState(0);
  const [characterSubtitles, setCharacterSubtitles] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [chatInput, setChatInput] = useState('');
  const [isSendingText, setIsSendingText] = useState(false);

  // WebSocket and LiveAudioSession references
  const wsRef = useRef<WebSocket | null>(null);
  const liveAudioRef = useRef<LiveAudioSession | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCharacterSubtitles(
        story.characterGreeting ||
          `¡Hola, explorador! Soy ${story.narratorName}. Te escucho en ${currentPoi?.name || 'el sendero'}.`
      );
      connectWebSocket();
    } else {
      cleanup();
    }

    return () => {
      cleanup();
    };
  }, [isOpen, story.id, currentPoi?.id]);

  const cleanup = () => {
    if (liveAudioRef.current) {
      liveAudioRef.current.close();
      liveAudioRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsMicActive(false);
    setCharacterSpeaking(false);
    setInputVolume(0);
    setOutputVolume(0);
    setLiveWsStatus('disconnected');
  };

  const connectWebSocket = () => {
    try {
      setLiveWsStatus('connecting');
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/live?sessionCode=${session?.code || ''}&storyId=${story.id}&poiId=${currentPoi?.id || ''}&forestPackId=${forest.id}`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setLiveWsStatus('connected');
        setStatusMessage('Canal de audio en directo con Gemini 3.8 Live establecido.');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'connected') {
            if (data.greeting) {
              setCharacterSubtitles(data.greeting);
            }
          } else if (data.type === 'audio' && data.audio) {
            // Stream audio chunk to output
            setCharacterSpeaking(true);
            liveAudioRef.current?.playChunk(data.audio);
          } else if (data.type === 'transcript') {
            setCharacterSubtitles((prev) => prev ? `${prev} ${data.text}` : data.text);
          } else if (data.type === 'interrupted') {
            liveAudioRef.current?.interrupt();
            setCharacterSpeaking(false);
            setOutputVolume(0);
          } else if (data.type === 'status' && data.status === 'simulated') {
            setLiveWsStatus('simulated');
            setStatusMessage(data.message || 'Emulación local de voz activa.');
          } else if (data.type === 'error') {
            setStatusMessage(data.message || 'Error en canal de voz.');
            setLiveWsStatus('error');
          }
        } catch (e) {
          console.warn('Error reading WS message:', e);
        }
      };

      ws.onerror = () => {
        setLiveWsStatus('error');
        setStatusMessage('No se pudo establecer WebSocket con el servidor de voz.');
      };

      ws.onclose = () => {
        setLiveWsStatus('disconnected');
      };

      // Prepare LiveAudioSession
      liveAudioRef.current = new LiveAudioSession({
        onAudioData: (base64) => {
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'audio', audio: base64 }));
          }
        },
        onInputVolume: (vol) => {
          setInputVolume(vol);
        },
        onOutputVolume: (vol) => {
          setOutputVolume(vol);
          setCharacterSpeaking(vol > 0.05);
        },
        onError: (err) => {
          console.error('Audio capture error:', err);
          setStatusMessage('Permiso de micrófono no concedido o error de audio.');
          setIsMicActive(false);
        },
      });
    } catch (err: any) {
      console.error('Error starting live session:', err);
      setLiveWsStatus('error');
    }
  };

  const toggleMicrophone = async () => {
    if (isMicActive) {
      liveAudioRef.current?.stopMicrophone();
      setIsMicActive(false);
      setInputVolume(0);
    } else {
      try {
        await liveAudioRef.current?.startMicrophone();
        setIsMicActive(true);
        sounds.playHintChime();
      } catch (e) {
        setIsMicActive(false);
      }
    }
  };

  const handleSendPrompt = (promptText: string) => {
    // Send either via live WS or through text message API
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'text', text: promptText }));
    }
    if (onSendTextMessage) {
      onSendTextMessage(promptText);
    }
  };

  const handleSendCustomText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isSendingText) return;
    const txt = chatInput.trim();
    setChatInput('');
    setIsSendingText(true);
    try {
      handleSendPrompt(txt);
    } finally {
      setIsSendingText(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#1C2C1F] via-[#162319] to-[#111A12] border border-emerald-600/50 rounded-3xl shadow-2xl text-stone-100 overflow-hidden my-6 flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-950 via-[#1F3323] to-emerald-950 border-b border-emerald-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className={`w-12 h-12 rounded-2xl bg-emerald-900 border-2 flex items-center justify-center text-2xl shadow-lg transition-all ${
                characterSpeaking
                  ? 'border-amber-400 ring-4 ring-amber-400/40 scale-105'
                  : 'border-emerald-500/50'
              }`}>
                {story.narratorAvatar || story.narrator?.avatarEmoji || '🧙‍♂️'}
              </div>
              {characterSpeaking && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 rounded-full animate-ping" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-adventure text-lg sm:text-xl font-bold text-amber-100">
                  {story.narratorName || story.narrator?.name || 'Guía del Bosque'}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/60 font-semibold flex items-center gap-1">
                  <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                  <span>Gemini 3.8 Live</span>
                </span>
              </div>
              <p className="text-xs text-stone-400">
                {story.narratorRole || story.narrator?.role} • {forest.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-black/40 hover:bg-black/60 text-stone-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Current Location & POI Context */}
        {currentPoi && (
          <div className="px-5 py-2.5 bg-emerald-950/40 border-b border-emerald-900/40 flex items-center justify-between text-xs text-emerald-300">
            <div className="flex items-center gap-2 truncate">
              <Compass className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Punto actual: <strong>{currentPoi.name}</strong> ({currentPoi.emoji})</span>
            </div>
            <span className="text-[11px] text-stone-400 shrink-0 hidden sm:inline">
              Voz: {story.voiceName || 'Zephyr'}
            </span>
          </div>
        )}

        {/* Mode Selector Tabs */}
        <div className="flex border-b border-emerald-900/50 bg-[#131D14] text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMode('voice')}
            className={`flex-1 py-3 flex items-center justify-center gap-2 border-b-2 transition-all ${
              mode === 'voice'
                ? 'border-amber-400 text-amber-200 bg-emerald-950/50'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Mic className="w-4 h-4 text-emerald-400" />
            <span>Voz en Vivo (Gemini 3.8 Live)</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('chat')}
            className={`flex-1 py-3 flex items-center justify-center gap-2 border-b-2 transition-all ${
              mode === 'chat'
                ? 'border-amber-400 text-amber-200 bg-emerald-950/50'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span>Chat de Texto y Preguntas</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-6 flex-1 overflow-y-auto max-h-[60vh]">
          {/* Character Bio card */}
          <div className="p-3.5 rounded-2xl bg-black/30 border border-emerald-900/60 text-xs text-stone-300 space-y-1.5">
            <div className="flex items-center gap-1.5 text-emerald-300 font-semibold text-[11px] uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Personalidad del Personaje</span>
            </div>
            <p className="leading-relaxed">
              {story.characterBio || story.narrative}
            </p>
          </div>

          {/* MODE 1: LIVE VOICE API */}
          {mode === 'voice' && (
            <div className="flex flex-col items-center justify-center space-y-6 py-4">
              {/* Central Glowing Character Orb */}
              <div className="relative">
                {/* Ripple rings */}
                <div
                  className={`absolute inset-0 rounded-full transition-transform duration-150 ${
                    characterSpeaking
                      ? 'bg-amber-500/20 scale-150 animate-pulse'
                      : isMicActive
                      ? 'bg-emerald-500/20 scale-125'
                      : 'bg-emerald-950/30'
                  }`}
                />

                <div
                  className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 flex items-center justify-center text-5xl shadow-2xl transition-all duration-300 ${
                    characterSpeaking
                      ? 'border-amber-400 bg-gradient-to-tr from-amber-950 to-stone-900 shadow-amber-500/40 scale-105'
                      : isMicActive
                      ? 'border-emerald-400 bg-gradient-to-tr from-emerald-950 to-stone-900 shadow-emerald-500/30'
                      : 'border-emerald-800 bg-[#152217]'
                  }`}
                  style={{
                    boxShadow: characterSpeaking
                      ? `0 0 ${20 + outputVolume * 40}px rgba(245, 158, 11, 0.5)`
                      : isMicActive
                      ? `0 0 ${15 + inputVolume * 30}px rgba(16, 185, 129, 0.4)`
                      : 'none',
                  }}
                >
                  <span>{story.narratorAvatar || '🧙‍♂️'}</span>
                </div>
              </div>

              {/* Status & Subtitle Card */}
              <div className="w-full text-center space-y-2 max-w-lg">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-black/40 border border-emerald-800/60">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      characterSpeaking
                        ? 'bg-amber-400 animate-ping'
                        : isMicActive
                        ? 'bg-emerald-400 animate-pulse'
                        : 'bg-stone-500'
                    }`}
                  />
                  <span className="text-stone-300">
                    {characterSpeaking
                      ? `${story.narratorName} está hablando...`
                      : isMicActive
                      ? 'Te escucha atentamente... ¡habla!'
                      : 'Pulsa el micrófono para hablar con el personaje'}
                  </span>
                </div>

                {/* Live Speech Subtitle Bubble */}
                {characterSubtitles && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-[#1C2C1F] to-emerald-950/90 border border-amber-600/40 text-stone-100 text-sm font-serif italic shadow-lg leading-relaxed animate-in fade-in">
                    "{characterSubtitles}"
                  </div>
                )}
              </div>

              {/* Mic Action Control Button */}
              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={toggleMicrophone}
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl active:scale-95 ${
                    isMicActive
                      ? 'bg-red-600 hover:bg-red-500 text-white ring-4 ring-red-400/50 shadow-red-900/60 scale-105'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white ring-4 ring-emerald-400/30 shadow-emerald-950/70 hover:scale-105'
                  }`}
                >
                  {isMicActive ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                </button>
                <span className="text-xs font-semibold text-stone-300">
                  {isMicActive ? 'Toca para silenciar micrófono' : 'Toca para hablar con tu voz'}
                </span>
              </div>
            </div>
          )}

          {/* MODE 2: TEXT CHAT & QUICK QUESTION CARDS */}
          {mode === 'chat' && (
            <div className="space-y-4">
              {/* Quick Questions for this Character */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">
                  Preguntas sugeridas al personaje:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    `¿Qué secreto esconde ${currentPoi?.name || 'este punto'}?`,
                    `Dame una pista poética sobre el enigma actual`,
                    `Cuéntame una leyenda antigua sobre este bosque`,
                    `¿Hacia dónde me recomiendas caminar ahora?`,
                  ].map((q, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendPrompt(q)}
                      className="p-3 rounded-xl bg-[#141F16] hover:bg-emerald-900/60 border border-emerald-900/70 hover:border-emerald-500 text-left text-xs text-stone-200 transition-all active:scale-[0.98]"
                    >
                      <span className="text-amber-400 font-bold mr-1">✦</span>
                      <span>{q}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Message History */}
              <div className="p-3 rounded-2xl bg-black/40 border border-emerald-900/60 space-y-2.5 max-h-48 overflow-y-auto">
                {textMessages.length === 0 ? (
                  <p className="text-xs text-stone-400 italic text-center py-4">
                    Inicia la conversación preguntándole cualquier curiosidad a {story.narratorName}.
                  </p>
                ) : (
                  textMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        msg.sender === 'player' ? 'items-end' : 'items-start'
                      }`}
                    >
                      <span className="text-[10px] text-stone-400 mb-0.5">
                        {msg.sender === 'player' ? 'Tú' : story.narratorName}
                      </span>
                      <div
                        className={`p-2.5 rounded-xl text-xs leading-relaxed max-w-[85%] ${
                          msg.sender === 'player'
                            ? 'bg-emerald-700 text-white rounded-br-none'
                            : 'bg-[#1E2E21] border border-emerald-900 text-stone-200 rounded-bl-none'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Custom Input */}
              <form onSubmit={handleSendCustomText} className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={`Escribe a ${story.narratorName}...`}
                  maxLength={160}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-black/40 border border-emerald-800 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isSendingText}
                  className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Preguntar</span>
                </button>
              </form>
            </div>
          )}

          {/* Switch to other Forest Characters Gallery */}
          {forest.stories.length > 1 && onSelectOtherCharacter && (
            <div className="pt-3 border-t border-emerald-900/50 space-y-2">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                Otros Personajes de este Bosque:
              </span>
              <div className="flex flex-wrap gap-2">
                {forest.stories
                  .filter((s) => s.id !== story.id)
                  .map((other) => (
                    <button
                      key={other.id}
                      type="button"
                      onClick={() => onSelectOtherCharacter(other)}
                      className="px-3 py-1.5 rounded-xl bg-[#141E15] hover:bg-emerald-950 border border-emerald-800/60 text-xs text-stone-200 hover:text-white flex items-center gap-2 transition-all active:scale-95"
                    >
                      <span>{other.narratorAvatar || '🦉'}</span>
                      <span className="font-semibold">{other.narratorName}</span>
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
