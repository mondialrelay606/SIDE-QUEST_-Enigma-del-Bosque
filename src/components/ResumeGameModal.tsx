import React, { useState } from 'react';
import { X, KeyRound, ArrowRight, AlertCircle } from 'lucide-react';

interface ResumeGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResume: (code: string) => Promise<void>;
  loading: boolean;
}

export const ResumeGameModal: React.FC<ResumeGameModalProps> = ({
  isOpen,
  onClose,
  onResume,
  loading,
}) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      setError('Por favor introduce tu código de 6 caracteres');
      return;
    }
    setError('');
    try {
      await onResume(cleanCode);
    } catch (err: any) {
      setError(err.message || 'Código de partida no encontrado');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-[#1C281F] border border-emerald-700/50 rounded-2xl shadow-2xl text-stone-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-[#1D3022] to-emerald-950 px-5 py-4 border-b border-emerald-800/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-amber-400" />
            <h3 className="font-adventure text-lg font-bold text-amber-100">
              Retomar Partida
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-black/40 hover:bg-black/60 text-stone-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          <p className="text-xs text-stone-300 leading-relaxed">
            Introduce el código de 6 caracteres que recibiste al comenzar tu expedición para continuar exactamente donde lo dejaste.
          </p>

          {error && (
            <div className="p-3 rounded-xl bg-red-950/70 border border-red-800/60 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-emerald-300 mb-1.5">
              Código de Acceso
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Ej: BOSQ42"
              maxLength={8}
              className="w-full text-center text-2xl font-mono tracking-widest font-bold px-4 py-3 rounded-xl bg-black/50 border border-emerald-800 text-amber-300 focus:outline-none focus:border-amber-400"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white font-adventure font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2 shadow-md active:scale-95"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Acceder a la Partida</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
