import React, { useState } from 'react';
import { ForestPack, DifficultyType, DurationType, StoryIntro } from '../types';
import { useI18n } from '../context/I18nContext';
import { X, Sparkles, Clock, Compass, Users, User, ArrowRight, ShieldAlert, Award, Footprints } from 'lucide-react';

interface NewGameModalProps {
  forest: ForestPack;
  isOpen: boolean;
  onClose: () => void;
  onStartSession: (config: {
    forestPackId: string;
    name: string;
    type: 'individual' | 'grupo';
    storyId: string;
    difficulty: DifficultyType;
    duration: DurationType;
    easyMode?: boolean;
  }) => Promise<void>;
  loading: boolean;
}

export const NewGameModal: React.FC<NewGameModalProps> = ({
  forest,
  isOpen,
  onClose,
  onStartSession,
  loading,
}) => {
  const { t } = useI18n();
  const [selectedStoryId, setSelectedStoryId] = useState<string>(
    forest.stories[0]?.id || ''
  );
  const [difficulty, setDifficulty] = useState<DifficultyType>('novato');
  const [duration, setDuration] = useState<DurationType>('1h');
  const [playerName, setPlayerName] = useState<string>('');
  const [playerType, setPlayerType] = useState<'individual' | 'grupo'>('individual');
  const [easyMode, setEasyMode] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const currentStory: StoryIntro | undefined = forest.stories.find(
    (s) => s.id === selectedStoryId
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStoryId) {
      setErrorMsg('Por favor, selecciona una historia para comenzar.');
      return;
    }
    setErrorMsg('');
    await onStartSession({
      forestPackId: forest.id,
      name: playerName.trim() || (playerType === 'grupo' ? 'Equipo Forestal' : 'Explorador Solitario'),
      type: playerType,
      storyId: selectedStoryId,
      difficulty,
      duration,
      easyMode,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#1C281F] border border-emerald-700/50 rounded-2xl sm:rounded-3xl shadow-2xl text-stone-100 overflow-hidden my-6">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-emerald-950 via-[#1D3022] to-emerald-950 px-5 sm:px-6 py-4 border-b border-emerald-800/50 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
              {forest.name}
            </span>
            <h3 className="font-adventure text-lg sm:text-2xl font-bold text-amber-100">
              {t('game.setup')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-black/40 hover:bg-black/60 text-stone-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-red-950/70 border border-red-800/60 rounded-xl text-red-200 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. Select Story */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-emerald-300">
              {t('setup.stepStory')}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {forest.stories.map((story) => {
                const isSelected = story.id === selectedStoryId;
                return (
                  <button
                    key={story.id}
                    type="button"
                    onClick={() => setSelectedStoryId(story.id)}
                    className={`text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'bg-emerald-900/60 border-emerald-400 text-white shadow-md shadow-emerald-950'
                        : 'bg-[#152017] border-emerald-900/60 text-stone-300 hover:border-emerald-700/70'
                    }`}
                  >
                    <span className="text-2xl p-1 bg-black/30 rounded-lg">{story.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-adventure text-sm font-bold text-amber-100 truncate">
                          {story.title}
                        </span>
                        {(story.contentRating === 'adult' || forest.contentRating === 'adult') && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-900/90 text-red-200 border border-red-500 shrink-0">
                            🔞 +18
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-stone-400 line-clamp-2 mt-0.5">
                        {story.summary}
                      </div>
                      <div className="text-[10px] text-emerald-400/90 font-medium mt-1">
                        {t('nav.guide')}: {story.narratorName || story.narrator?.name}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Adult Content Warning Callout */}
            {currentStory && (currentStory.contentRating === 'adult' || forest.contentRating === 'adult') && (
              <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/70 text-xs text-red-200 space-y-1.5 shadow-md">
                <div className="font-bold text-red-300 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                  <span>Aviso de Contenido Adulto (+18)</span>
                </div>
                <p className="text-stone-200 font-medium leading-snug">
                  "{currentStory.contentWarning || forest.contentWarning || t('game.contentRatingAdultWarning')}"
                </p>
              </div>
            )}

            {/* Story Briefing Callout */}
            {currentStory && (
              <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-600/30 text-xs text-amber-200/90 space-y-1">
                <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{currentStory.narratorRole || currentStory.narrator?.role}</span>
                </div>
                <p className="text-stone-300 italic">"{currentStory.narrative || currentStory.summary}"</p>
                <div className="text-[11px] text-emerald-300 pt-1 font-medium">
                  🎯 {currentStory.mission}
                </div>
              </div>
            )}
          </div>

          {/* 2. Select Difficulty */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-emerald-300">
              {t('setup.stepDifficulty')}
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                {
                  id: 'novato',
                  name: t('difficulty.novato'),
                  color: 'border-emerald-600',
                },
                {
                  id: 'explorador',
                  name: t('difficulty.explorador'),
                  color: 'border-amber-600',
                },
                {
                  id: 'maestro',
                  name: t('difficulty.maestro'),
                  color: 'border-purple-600',
                },
              ].map((lvl) => {
                const isSelected = difficulty === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => setDifficulty(lvl.id as DifficultyType)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      isSelected
                        ? `bg-emerald-900/60 ${lvl.color} text-white font-bold ring-1 ring-emerald-400`
                        : 'bg-[#152017] border-emerald-900/60 text-stone-300 hover:border-emerald-700'
                    }`}
                  >
                    <div className="font-adventure text-xs sm:text-sm font-bold text-amber-100">
                      {lvl.name}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Duration & POI subset */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-emerald-300">
              {t('setup.stepDuration')}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: '30min', label: t('duration.30min') },
                { id: '1h', label: t('duration.1h') },
                { id: '1.5h', label: t('duration.1.5h') },
                { id: '2h', label: t('duration.2h') },
              ].map((dur) => {
                const isSelected = duration === dur.id;
                return (
                  <button
                    key={dur.id}
                    type="button"
                    onClick={() => setDuration(dur.id as DurationType)}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
                      isSelected
                        ? 'bg-emerald-900/60 border-emerald-400 text-white font-bold'
                        : 'bg-[#152017] border-emerald-900/60 text-stone-300 hover:border-emerald-700'
                    }`}
                  >
                    <div className="flex items-center gap-1 font-adventure text-xs sm:text-sm text-amber-100">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{dur.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Player Name and Mode */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-emerald-300">
              {t('setup.stepParticipants')}
            </label>
            <div className="grid grid-cols-2 gap-2 pb-2">
              <button
                type="button"
                onClick={() => setPlayerType('individual')}
                className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold ${
                  playerType === 'individual'
                    ? 'bg-emerald-900/70 border-emerald-400 text-white'
                    : 'bg-[#152017] border-emerald-900/60 text-stone-400'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>{t('setup.individual')}</span>
              </button>
              <button
                type="button"
                onClick={() => setPlayerType('grupo')}
                className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold ${
                  playerType === 'grupo'
                    ? 'bg-emerald-900/70 border-emerald-400 text-white'
                    : 'bg-[#152017] border-emerald-900/60 text-stone-400'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>{t('setup.group')}</span>
              </button>
            </div>

            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder={playerType === 'grupo' ? t('setup.namePlaceholderGroup') : t('setup.namePlaceholderSingle')}
              maxLength={30}
              className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-emerald-800/60 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* 5. Accessible / Easy Mode (Expanded 60m Geofence) */}
          <div className="p-3.5 rounded-2xl bg-black/40 border border-emerald-900/60 hover:border-emerald-700/60 transition-colors">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={easyMode}
                onChange={(e) => setEasyMode(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-emerald-600 bg-black/50 border-emerald-700 focus:ring-0 cursor-pointer"
              />
              <div className="flex-1 text-xs">
                <div className="font-adventure font-bold text-amber-200 flex items-center gap-1.5">
                  <Footprints className="w-4 h-4 text-emerald-400" />
                  <span>{t('setup.easyModeTitle')}</span>
                </div>
                <p className="text-[11px] text-stone-400 mt-0.5 leading-relaxed">
                  {t('setup.easyModeDesc')}
                </p>
              </div>
            </label>
          </div>

          {/* Footer Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 hover:from-emerald-500 hover:to-green-500 text-white font-adventure font-bold text-base tracking-wider transition-all shadow-xl shadow-emerald-950 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{t('setup.submitLoading')}</span>
                </>
              ) : (
                <>
                  <Compass className="w-5 h-5 text-amber-300" />
                  <span>{t('setup.submit')}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            <p className="text-[11px] text-center text-stone-400 mt-2">
              {t('setup.codeHelp')}
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
