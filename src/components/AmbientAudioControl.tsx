import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  Volume1,
  VolumeX,
  Wind,
  Bird,
  Waves,
  Sparkles,
  Sliders,
  ChevronDown
} from 'lucide-react';
import { ambientAudio, AmbientAudioState } from '../utils/ambientAudio';
import { sounds } from '../utils/audio';

interface AmbientAudioControlProps {
  variant?: 'compact' | 'full' | 'header';
  className?: string;
}

export const AmbientAudioControl: React.FC<AmbientAudioControlProps> = ({
  variant = 'header',
  className = '',
}) => {
  const [state, setState] = useState<AmbientAudioState>(ambientAudio.getState());
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = ambientAudio.subscribe((newState) => {
      setState(newState);
    });
    return () => unsubscribe();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextMuted = !state.isMuted;
    ambientAudio.setMuted(nextMuted);
    sounds.setSoundEnabled(!nextMuted);
    if (nextMuted) {
      sounds.stopSpeaking();
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    ambientAudio.setVolume(val);
    sounds.setSoundEnabled(val > 0 && !state.isMuted);
  };

  const isSilenced = state.isMuted || state.volume === 0;
  const isPlayingNow = state.isPlaying && !isSilenced;

  // Header variant: sleek, ambient, integrated in Game / Nav Header
  return (
    <div ref={containerRef} className={`relative inline-flex items-center ${className}`}>
      <div className="flex items-center bg-[#152317]/90 border border-emerald-800/60 hover:border-emerald-600/60 rounded-xl p-1 shadow-sm transition-all">
        {/* Main Mute/Unmute Toggle */}
        <button
          type="button"
          onClick={handleToggleMute}
          title={isSilenced ? 'Activar sonido del bosque' : 'Silenciar sonido del bosque'}
          className={`p-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
            isSilenced
              ? 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
              : 'text-emerald-300 hover:text-emerald-100 hover:bg-emerald-900/50'
          }`}
        >
          {isSilenced ? (
            <VolumeX className="w-4 h-4 text-stone-400" />
          ) : state.volume < 0.4 ? (
            <Volume1 className="w-4 h-4 text-emerald-400" />
          ) : (
            <Volume2 className="w-4 h-4 text-emerald-400" />
          )}

          {/* Equalizer animation when playing */}
          {isPlayingNow && (
            <div className="flex items-end gap-0.5 h-3.5 px-0.5">
              <span className="w-0.5 bg-emerald-400 rounded-full animate-pulse h-2" style={{ animationDuration: '0.8s' }} />
              <span className="w-0.5 bg-emerald-300 rounded-full animate-pulse h-3.5" style={{ animationDuration: '0.5s' }} />
              <span className="w-0.5 bg-emerald-400 rounded-full animate-pulse h-2.5" style={{ animationDuration: '0.9s' }} />
            </div>
          )}
        </button>

        {/* Ambient Theme Name & Dropdown trigger */}
        {variant !== 'compact' && (
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1.5 px-2 py-0.5 text-xs text-stone-300 hover:text-amber-200 transition-colors border-l border-emerald-900/40"
            title="Ajustar volumen y ambiente"
          >
            <span className="text-[11px] font-medium max-w-[130px] sm:max-w-[180px] truncate hidden md:inline text-emerald-200/90">
              {state.activeThemeName || 'Sonido Bosque'}
            </span>
            <span className="text-[10px] font-mono text-emerald-400 font-semibold">
              {isSilenced ? 'MUDO' : `${Math.round(state.volume * 100)}%`}
            </span>
            <ChevronDown className={`w-3 h-3 text-stone-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      {/* Popover Settings Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-[#162418] border border-emerald-700/60 rounded-2xl shadow-2xl p-4 z-50 text-stone-200 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2.5 border-b border-emerald-800/40">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-900/60 border border-emerald-600/40 flex items-center justify-center text-emerald-300">
                <Sliders className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-amber-100 font-adventure">Paisaje Sonoro</h4>
                <p className="text-[10px] text-emerald-400/80">Audio reactivo a la ubicación</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleToggleMute}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                isSilenced
                  ? 'bg-emerald-950/80 border-emerald-600/60 text-emerald-300 hover:bg-emerald-900'
                  : 'bg-stone-800 border-stone-600 text-stone-300 hover:bg-stone-700'
              }`}
            >
              {isSilenced ? 'Desilenciar' : 'Silenciar'}
            </button>
          </div>

          {/* Current Active Soundscape */}
          <div className="mt-3 p-2.5 bg-black/40 border border-emerald-900/50 rounded-xl">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-stone-400 font-medium">Ambiente activo:</span>
              <span className="font-semibold text-amber-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                {state.poiName ? 'Punto cercano' : 'Bosque'}
              </span>
            </div>
            <div className="text-xs font-bold text-emerald-300 truncate">
              {state.activeThemeName}
            </div>
          </div>

          {/* Volume Slider */}
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-stone-300 font-medium flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                Volumen ambiental
              </span>
              <span className="font-mono text-emerald-300 font-bold text-xs">
                {isSilenced ? '0%' : `${Math.round(state.volume * 100)}%`}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.02"
              value={state.isMuted ? 0 : state.volume}
              onChange={handleVolumeChange}
              className="w-full accent-emerald-500 cursor-pointer h-2 bg-emerald-950 rounded-lg"
            />
            <div className="flex justify-between text-[9px] text-stone-500 font-mono">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Active Sound Layers Status */}
          <div className="mt-3 pt-2.5 border-t border-emerald-900/40">
            <span className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold block mb-2">
              Capas sonoras del entorno
            </span>
            <div className="grid grid-cols-3 gap-1.5 text-center">
              <div
                className={`p-1.5 rounded-lg border text-[10px] flex flex-col items-center gap-1 ${
                  state.windIntensity > 0.6
                    ? 'bg-emerald-950/70 border-emerald-600/50 text-emerald-200'
                    : 'bg-black/30 border-stone-800 text-stone-400'
                }`}
              >
                <Wind className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-medium">Viento</span>
              </div>

              <div
                onClick={() => ambientAudio.previewSoundscape('birds')}
                className="p-1.5 rounded-lg border bg-emerald-950/70 border-emerald-600/50 text-emerald-200 text-[10px] flex flex-col items-center gap-1 cursor-pointer hover:bg-emerald-900/60 transition-colors"
                title="Tocar para escuchar canto de ave"
              >
                <Bird className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-medium">Aves ♫</span>
              </div>

              <div
                className={`p-1.5 rounded-lg border text-[10px] flex flex-col items-center gap-1 ${
                  state.waterIntensity > 0.4
                    ? 'bg-cyan-950/70 border-cyan-600/50 text-cyan-200'
                    : 'bg-black/30 border-stone-800 text-stone-400'
                }`}
              >
                <Waves className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-medium">Arroyo</span>
              </div>
            </div>
          </div>

          {/* Helper notice */}
          <p className="mt-3 text-[10px] text-stone-400 leading-relaxed text-center">
            El sonido cambia suavemente al acercarte a arroyos, miradores o robles milenarios.
          </p>
        </div>
      )}
    </div>
  );
};
