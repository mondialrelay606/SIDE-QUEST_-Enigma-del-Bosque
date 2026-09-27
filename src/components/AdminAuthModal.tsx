import React, { useState } from 'react';
import { Shield, Lock, Key, AlertCircle, Eye, EyeOff, Check, X } from 'lucide-react';
import { api } from '../services/api';
import { sounds } from '../utils/audio';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: () => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onAuthenticated,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setLoading(true);
    setError(null);

    const success = await api.verifyAdminPassword(password.trim());
    setLoading(false);

    if (success) {
      sounds.playSuccess();
      onAuthenticated();
      onClose();
    } else {
      sounds.playError();
      setError('Contraseña incorrecta. Solo el administrador puede editar contenidos.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#1C2A1E] to-[#142016] border border-amber-600/50 rounded-2xl shadow-2xl overflow-hidden p-6 text-stone-100">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-3 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <h2 className="font-adventure text-xl font-bold text-amber-100">
              Acceso Exclusivo de Administrador
            </h2>
            <p className="text-xs text-stone-300 mt-1 max-w-sm">
              La edición de rutas, puntos geolocalizados, historias y acertijos está restringida únicamente al administrador del juego.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>Contraseña Maestra de Edición</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                placeholder="Ingresa la clave de administrador..."
                autoFocus
                className="w-full px-4 py-3 rounded-xl bg-black/50 border border-emerald-800 focus:border-amber-400 text-stone-100 text-sm placeholder-stone-500 focus:outline-none pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-stone-400 flex items-center gap-1 mt-1">
              <Key className="w-3 h-3 text-amber-400/80" />
              <span>Clave por defecto: <code className="bg-black/40 px-1 py-0.5 rounded text-amber-300 font-mono">bosque2026</code></span>
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/70 text-red-200 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-stone-700 bg-stone-900/60 hover:bg-stone-800 text-stone-300 text-xs font-bold transition-colors"
            >
              Volver al juego
            </button>
            <button
              type="submit"
              disabled={loading || !password.trim()}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 disabled:opacity-40 text-stone-950 font-adventure text-xs font-bold tracking-wider shadow-lg shadow-amber-950/40 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Verificando...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Desbloquear Edición</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
