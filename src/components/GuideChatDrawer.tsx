import React, { useState, useRef, useEffect } from 'react';
import { LiveMessage, StoryIntro } from '../types';
import { X, Send, Sparkles, MessageSquare, Bot, AlertTriangle } from 'lucide-react';

interface GuideChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  story?: StoryIntro;
  messages: LiveMessage[];
  onSendMessage: (text: string) => Promise<void>;
  loading: boolean;
  currentPoiName?: string;
}

export const GuideChatDrawer: React.FC<GuideChatDrawerProps> = ({
  isOpen,
  onClose,
  story,
  messages,
  onSendMessage,
  loading,
  currentPoiName,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = inputText.trim();
    if (!text || loading) return;
    setInputText('');
    await onSendMessage(text);
  };

  const sendQuickPrompt = (prompt: string) => {
    if (loading) return;
    onSendMessage(prompt);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-xs">
      <div className="w-full max-w-md bg-[#18241A] border-l border-emerald-800/60 shadow-2xl flex flex-col h-full text-stone-100 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-950 via-[#1C2C1F] to-emerald-950 border-b border-emerald-800/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-900 border border-emerald-500/40 flex items-center justify-center text-xl shadow">
              {story?.narratorAvatar || story?.narrator?.avatarEmoji || '🦉'}
            </div>
            <div>
              <div className="font-adventure text-sm font-bold text-amber-100 flex items-center gap-1.5">
                <span>{story?.narratorName || story?.narrator?.name || 'Guía del Bosque'}</span>
                <span className="text-[10px] text-emerald-400 font-mono px-1.5 py-0.2 bg-emerald-950/80 rounded border border-emerald-800/60">
                  En directo
                </span>
              </div>
              <p className="text-[11px] text-stone-400">
                {story?.narratorRole || story?.narrator?.role || 'Compañero de viaje'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-black/40 hover:bg-black/60 text-stone-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* POI location banner */}
        {currentPoiName && (
          <div className="px-4 py-2 bg-emerald-950/40 border-b border-emerald-900/30 text-[11px] text-emerald-300/80 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Hablando en: <strong>{currentPoiName}</strong></span>
          </div>
        )}

        {/* Messages List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {messages.map((msg) => {
            const isPlayer = msg.sender === 'player';
            const isAdmin = msg.sender === 'admin';

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  isPlayer ? 'items-end' : 'items-start'
                }`}
              >
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-[10px] font-bold text-stone-400 uppercase">
                    {isAdmin ? '🚨 Aviso de Organización' : isPlayer ? 'Tú' : story?.narratorName || 'Guía'}
                  </span>
                  <span className="text-[9px] text-stone-500">{msg.timestamp}</span>
                </div>

                <div
                  className={`p-3 rounded-2xl text-xs sm:text-sm leading-relaxed max-w-[85%] ${
                    isAdmin
                      ? 'bg-amber-950/90 border border-amber-600/70 text-amber-200 shadow-md'
                      : isPlayer
                      ? 'bg-emerald-700 text-white rounded-br-none shadow'
                      : 'bg-[#203123] border border-emerald-900/70 text-stone-200 rounded-bl-none shadow'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-stone-400 italic py-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{story?.narratorName || 'El guía'} está meditando su respuesta...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 bg-[#141F16] border-t border-emerald-900/40 flex items-center gap-1.5 overflow-x-auto text-[11px]">
          <span className="text-stone-400 shrink-0 font-medium">Sugerir:</span>
          {[
            '¿Hacia dónde miro?',
            '¿Qué detalle del entorno busco?',
            'Dime una frase de aliento',
          ].map((prompt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => sendQuickPrompt(prompt)}
              disabled={loading}
              className="shrink-0 px-2.5 py-1 rounded-full bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800/60 text-emerald-300 text-[11px] whitespace-nowrap active:scale-95 transition-all"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input bar */}
        <form onSubmit={handleSend} className="p-3 bg-[#111A12] border-t border-emerald-900/60 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Habla con ${story?.narratorName || 'el guía'}...`}
            maxLength={180}
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-black/40 border border-emerald-800/60 text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || loading}
            className="p-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 text-white transition-all shadow-md active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
