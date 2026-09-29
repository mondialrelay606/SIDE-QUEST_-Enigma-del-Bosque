import React, { useState } from 'react';
import { ForestPack, PlayerSession } from '../types';
import { useI18n } from '../context/I18nContext';
import { sounds } from '../utils/audio';
import {
  PauseCircle,
  BookmarkCheck,
  LogOut,
  Copy,
  Check,
  X,
  Sparkles,
  Compass,
  ArrowRight,
  AlertTriangle
} from 'lucide-react';

interface PauseOrAbandonModalProps {
  isOpen: boolean;
  onClose: () => void;
  forest: ForestPack;
  session: PlayerSession;
  onPauseAndSave: () => void;
  onAbandonPermanently: () => Promise<void>;
}

export const PauseOrAbandonModal: React.FC<PauseOrAbandonModalProps> = ({
  isOpen,
  onClose,
  forest,
  session,
  onPauseAndSave,
  onAbandonPermanently,
}) => {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const [confirmAbandon, setConfirmAbandon] = useState(false);
  const [loadingAbandon, setLoadingAbandon] = useState(false);

  if (!isOpen) return null;

  const currentPoi = forest.pois.find(
    (p) => p.id === session.routePoiIds[session.currentPoiIndex]
  );
  const story = forest.stories.find((s) => s.id === session.storyId);

  const handleCopyCode = () => {
    sounds.playClick();
    navigator.clipboard.writeText(session.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePause = () => {
    sounds.playClick();
    onPauseAndSave();
  };

  const handleAbandon = async () => {
    sounds.playClick();
    setLoadingAbandon(true);
    try {
      await onAbandonPermanently();
    } finally {
      setLoadingAbandon(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#18261B] via-[#142016] to-[#0F1710] border border-emerald-700/60 rounded-3xl shadow-2xl text-stone-100 overflow-hidden my-6 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-[#1C2F21] to-emerald-950 px-5 sm:px-6 py-4 border-b border-emerald-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-xl shadow-inner shrink-0">
              <PauseCircle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider font-mono flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>{t('pause.badge')}</span>
              </span>
              <h2 className="font-adventure text-lg sm:text-xl font-bold text-amber-100 leading-tight">
                {t('pause.title')}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-black/40 hover:bg-black/60 text-stone-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-5 text-xs">
          {/* Active Expedition Summary Card */}
          <div className="p-4 rounded-2xl bg-black/40 border border-emerald-800/60 space-y-3">
            <div className="flex items-center justify-between gap-2 border-b border-emerald-950 pb-2.5">
              <div>
                <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider block font-mono">
                  {t('resume.codeLabel')}
                </span>
                <span className="text-2xl font-mono font-bold tracking-widest text-amber-300">
                  {session.code}
                </span>
              </div>

              <button
                type="button"
                onClick={handleCopyCode}
                className="px-3 py-1.5 rounded-xl bg-emerald-900/80 hover:bg-emerald-800 border border-emerald-600/60 text-emerald-200 text-xs font-semibold flex items-center gap-1.5 shadow transition-all active:scale-95"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? t('pause.codeCopied') : t('pause.copyCode')}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-stone-400 block">{t('home.chooseForest')}:</span>
                <strong className="text-stone-100 truncate block">{forest.name}</strong>
              </div>
              <div>
                <span className="text-stone-400 block">{t('setup.story')}:</span>
                <strong className="text-stone-100 truncate block">{story?.title || 'Personalizada'}</strong>
              </div>
              <div>
                <span className="text-stone-400 block">{t('reward.poiStep', { current: session.currentPoiIndex + 1, total: session.routePoiIds.length })}</span>
                <span className="text-stone-400 block text-[10px] truncate">({currentPoi?.name})</span>
              </div>
              <div>
                <span className="text-stone-400 block">{t('reward.totalPoints')}</span>
                <strong className="text-amber-300 font-mono text-sm">{session.points} pts</strong>
              </div>
            </div>
          </div>

          {!confirmAbandon ? (
            <div className="space-y-3">
              {/* Option 1: Pause and resume another day */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/70 to-[#142618]/70 border border-emerald-600/70 space-y-2">
                <div className="flex items-center gap-2 text-emerald-300 font-adventure text-sm font-bold">
                  <BookmarkCheck className="w-4 h-4 text-emerald-400" />
                  <span>{t('pause.buttonPause')}</span>
                </div>
                <p className="text-stone-300 leading-relaxed">
                  {t('pause.helpNote')}
                </p>
                <button
                  type="button"
                  onClick={handlePause}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-white font-adventure text-xs font-bold tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 active:scale-95 transition-all"
                >
                  <BookmarkCheck className="w-4 h-4" />
                  <span>{t('pause.buttonPause')}</span>
                </button>
              </div>

              {/* Option 2: Abandon permanently trigger */}
              <div className="pt-2 flex items-center justify-between border-t border-emerald-950">
                <span className="text-stone-400 text-[11px]">
                  {t('home.manageOrAbandon')}
                </span>
                <button
                  type="button"
                  onClick={() => setConfirmAbandon(true)}
                  className="text-red-400 hover:text-red-300 font-semibold underline text-[11px] transition-colors"
                >
                  {t('pause.buttonAbandon')}
                </button>
              </div>
            </div>
          ) : (
            /* Confirm Permanent Abandon */
            <div className="p-4 rounded-2xl bg-red-950/40 border border-red-800/60 space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center gap-2 text-red-300 font-adventure text-sm font-bold">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span>{t('pause.abandonConfirm')}</span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setConfirmAbandon(false)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition-all"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="button"
                  disabled={loadingAbandon}
                  onClick={handleAbandon}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white font-adventure text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{loadingAbandon ? '...' : t('pause.buttonAbandon')}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#111c13] border-t border-emerald-900/60 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition-all active:scale-95"
          >
            {t('common.continue')}
          </button>
        </div>
      </div>
    </div>
  );
};
