import React, { useState } from 'react';
import { ForestPack, PlayerSession, StoryIntro } from '../types';
import { sounds } from '../utils/audio';
import { useI18n } from '../context/I18nContext';
import {
  ShieldAlert,
  Footprints,
  Droplets,
  AlertTriangle,
  CheckCircle,
  Eye,
  HeartHandshake,
  Compass,
  Sparkles,
  TreePine,
  ArrowRight,
  UserCheck
} from 'lucide-react';

interface BriefingModalProps {
  isOpen: boolean;
  forest: ForestPack;
  session: PlayerSession;
  onConfirm: () => void;
}

export const BriefingModal: React.FC<BriefingModalProps> = ({
  isOpen,
  forest,
  session,
  onConfirm,
}) => {
  const { t } = useI18n();
  const [acknowledgedSafety, setAcknowledgedSafety] = useState(false);

  if (!isOpen) return null;

  const story: StoryIntro | undefined = forest.stories.find((s) => s.id === session.storyId) || forest.stories[0];

  const handleStartAdventure = () => {
    sounds.playClick();
    sounds.playSuccess();
    onConfirm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-gradient-to-b from-[#18261B] via-[#142016] to-[#0F1710] border border-amber-600/50 rounded-3xl shadow-2xl text-stone-100 overflow-hidden my-6 flex flex-col">
        {/* Atmospheric Header */}
        <div className="relative bg-gradient-to-r from-emerald-950 via-[#1C2F21] to-emerald-950 px-5 sm:px-6 py-4 border-b border-emerald-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-xl shadow-inner shrink-0">
              {story?.icon || '📜'}
            </div>
            <div>
              <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider font-mono flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>{t('briefing.title')} · {forest.name}</span>
              </span>
              <h2 className="font-adventure text-lg sm:text-xl font-bold text-amber-100 leading-tight">
                {story?.title || t('briefing.title')}
              </h2>
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold text-emerald-400 bg-black/40 px-2.5 py-1 rounded-xl border border-emerald-900/60">
            {session.code}
          </span>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs leading-relaxed">
          {/* Adult Content Warning Callout */}
          {(story?.contentRating === 'adult' || forest?.contentRating === 'adult') && (
            <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/70 text-xs text-red-200 space-y-1 shadow-md">
              <div className="font-bold text-red-300 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                <span>Aviso de Contenido Adulto (+18)</span>
              </div>
              <p className="text-stone-200 font-medium leading-snug">
                "{story?.contentWarning || forest?.contentWarning || t('game.contentRatingAdultWarning')}"
              </p>
            </div>
          )}

          {/* Welcome narrative in character's voice */}
          <div className="p-4 rounded-2xl bg-black/40 border border-emerald-800/50 space-y-2">
            <div className="flex items-center gap-2 text-amber-300 font-adventure text-xs font-bold">
              <span>{story?.narrator?.avatarEmoji || '🧙'}</span>
              <span>{story?.narrator?.name || 'Guía'}</span>
            </div>
            <p className="font-serif italic text-amber-50/90 text-sm leading-relaxed">
              "{story?.narrative || story?.summary || 'Bienvenido a la senda.'}"
            </p>
            {story?.mission && (
              <div className="pt-2 border-t border-emerald-950/80 text-[11px] text-emerald-300 font-semibold">
                🎯 {story.mission}
              </div>
            )}
          </div>

          {/* Mandatory Forest Safety Briefing Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-adventure text-xs font-bold uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{t('briefing.safetyTitle')}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px]">
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-black/30 border border-emerald-900/50">
                <Droplets className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-stone-300">{t('briefing.safety.1')}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-black/30 border border-emerald-900/50">
                <HeartHandshake className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-stone-300">{t('briefing.safety.2')}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-black/30 border border-emerald-900/50">
                <Footprints className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-stone-300">{t('briefing.safety.3')}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-black/30 border border-emerald-900/50">
                <Eye className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-stone-300">{t('briefing.safety.4')}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-black/30 border border-emerald-900/50">
                <TreePine className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-stone-300">{t('briefing.safety.5')}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-black/30 border border-emerald-900/50">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-stone-300">{t('briefing.safety.6')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Acknowledgement Checkbox */}
          <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-700/60">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={acknowledgedSafety}
                onChange={(e) => setAcknowledgedSafety(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-amber-500 rounded cursor-pointer shrink-0"
              />
              <span className="text-[11px] text-stone-200">
                {t('briefing.safety.6')}
              </span>
            </label>
          </div>
        </div>

        {/* Confirmation Footer */}
        <div className="p-4 sm:p-5 bg-[#121c13] border-t border-emerald-900/60 flex items-center justify-between gap-3">
          <div className="text-[11px] text-stone-400 font-mono hidden sm:block">
            {forest.pois.length} {t('briefing.poisCount')}
          </div>

          <button
            type="button"
            disabled={!acknowledgedSafety}
            onClick={handleStartAdventure}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-stone-950 font-adventure text-xs font-bold tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-amber-950/60 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all"
          >
            <span>{t('briefing.confirm')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
