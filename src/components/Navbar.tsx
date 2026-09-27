import React from 'react';
import { Trees, Compass, ShieldCheck, ArrowLeft, Lock, PauseCircle } from 'lucide-react';
import { AmbientAudioControl } from './AmbientAudioControl';

interface NavbarProps {
  currentView: 'home' | 'game' | 'admin';
  sessionCode?: string;
  points?: number;
  onNavigateHome: () => void;
  onOpenAdmin: () => void;
  isAdminAuthenticated?: boolean;
  onLogoutAdmin?: () => void;
  simulatedGps: boolean;
  onToggleSimulatedGps: () => void;
  onOpenPauseModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  sessionCode,
  points,
  onNavigateHome,
  onOpenAdmin,
  isAdminAuthenticated = false,
  onLogoutAdmin,
  simulatedGps,
  onToggleSimulatedGps,
  onOpenPauseModal,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#162218]/95 backdrop-blur-md border-b border-[#2D4530] text-stone-200">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={onNavigateHome}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-700 to-green-900 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-950/50">
            <Trees className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <h1 className="font-adventure text-lg md:text-xl font-bold tracking-wide text-amber-100 flex items-center gap-1.5">
              Enigma del Bosque
            </h1>
            <p className="text-[11px] text-emerald-400/80 hidden sm:block tracking-wider font-medium uppercase">
              Rutas y acertijos al aire libre
            </p>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {currentView === 'game' && sessionCode && (
            <div className="flex items-center space-x-2 bg-emerald-950/60 border border-emerald-800/40 rounded-lg px-2.5 py-1">
              <span className="text-[11px] text-emerald-400 font-mono font-semibold">
                COD: {sessionCode}
              </span>
              {typeof points === 'number' && (
                <span className="text-xs bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.5 rounded border border-amber-500/30">
                  {points} pts
                </span>
              )}
            </div>
          )}

          {/* GPS Simulation Toggle for outdoor test */}
          {currentView === 'game' && (
            <button
              onClick={onToggleSimulatedGps}
              title={simulatedGps ? "Modo GPS Simulado (en el lugar)" : "GPS Real del dispositivo"}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg border font-medium transition-all ${
                simulatedGps
                  ? 'bg-amber-950/50 border-amber-600/40 text-amber-300 hover:bg-amber-900/60'
                  : 'bg-emerald-950/50 border-emerald-600/40 text-emerald-300 hover:bg-emerald-900/60'
              }`}
            >
              <Compass className={`w-3.5 h-3.5 ${simulatedGps ? 'text-amber-400' : 'text-emerald-400 animate-spin-slow'}`} />
              <span className="hidden md:inline">{simulatedGps ? 'GPS Simulado' : 'GPS Real'}</span>
            </button>
          )}

          {/* Pause / Leave Game button */}
          {currentView === 'game' && onOpenPauseModal && (
            <button
              onClick={onOpenPauseModal}
              title="Pausar para continuar otro día o abandonar"
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg border border-amber-600/50 bg-amber-950/40 hover:bg-amber-900/60 text-amber-200 hover:text-white font-semibold transition-all shadow-sm active:scale-95"
            >
              <PauseCircle className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Pausar / Salir</span>
            </button>
          )}

          {/* Audio toggle & Ambient Soundscape Control */}
          <AmbientAudioControl variant="compact" />

          {/* Admin link */}
          {currentView !== 'admin' ? (
            <button
              onClick={onOpenAdmin}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all shadow-sm ${
                isAdminAuthenticated
                  ? 'bg-amber-950/60 border-amber-600/50 hover:bg-amber-900/60 text-amber-200'
                  : 'bg-stone-800/80 border-stone-600/50 hover:bg-stone-700 text-stone-200 hover:text-white'
              }`}
            >
              {isAdminAuthenticated ? (
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-stone-400" />
              )}
              <span className="hidden sm:inline">
                {isAdminAuthenticated ? 'Admin Activo' : 'Administrador'}
              </span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              {onLogoutAdmin && (
                <button
                  onClick={onLogoutAdmin}
                  title="Cerrar sesión de administrador"
                  className="px-2.5 py-1.5 rounded-lg bg-stone-900/80 hover:bg-stone-800 border border-stone-700 text-xs text-stone-300 hover:text-red-300 transition-colors"
                >
                  Salir Admin
                </button>
              )}
              <button
                onClick={onNavigateHome}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-xs font-semibold text-white transition-all shadow-sm"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver a jugar</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
