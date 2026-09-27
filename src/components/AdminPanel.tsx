import React, { useState, useEffect } from 'react';
import { ForestPack, WindmillPOI, StoryIntro, Riddle, PlayerSession, PlayerFeedback } from '../types';
import { api } from '../services/api';
import {
  Trees,
  PlusCircle,
  Copy,
  Trash2,
  Edit,
  Sparkles,
  Users,
  BarChart3,
  Star,
  Send,
  MapPin,
  Check,
  AlertCircle,
  Radio,
  BookOpen,
  HelpCircle,
  Eye,
  RefreshCw,
  Compass,
  Shield,
  Lock,
  Camera,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { GeolocatedARModal } from './GeolocatedARModal';

interface AdminPanelProps {
  onBackToGame: () => void;
  onLogoutAdmin?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onBackToGame, onLogoutAdmin }) => {
  const [activeTab, setActiveTab] = useState<'forests' | 'sessions' | 'stats'>('forests');
  const [forests, setForests] = useState<ForestPack[]>([]);
  const [liveSessions, setLiveSessions] = useState<PlayerSession[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [messageNotice, setMessageNotice] = useState<string | null>(null);

  // Wizard state for creating/editing forest
  const [editingPack, setEditingPack] = useState<ForestPack | null>(null);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4>(1);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [previewArPoi, setPreviewArPoi] = useState<WindmillPOI | null>(null);

  // Broadcast message input
  const [broadcastText, setBroadcastText] = useState('');
  const [targetSessionCode, setTargetSessionCode] = useState('ALL');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [fData, sData, stData] = await Promise.all([
        api.getForests(true),
        api.getAdminSessions(),
        api.getAdminStats(),
      ]);
      setForests(fData);
      setLiveSessions(sData);
      setStats(stData);
    } catch (e: any) {
      console.error('Error loading admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      setLoading(true);
      await api.duplicateForest(id);
      await loadData();
      setMessageNotice('Bosque duplicado correctamente como nueva plantilla.');
    } catch (e: any) {
      setMessageNotice('Error al duplicar bosque: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteForest = async (id: string) => {
    if (!window.confirm('¿Seguro que deseas eliminar este bosque? Esta acción no se puede deshacer.')) return;
    try {
      setLoading(true);
      await api.deleteForest(id);
      await loadData();
      setMessageNotice('Bosque eliminado.');
    } catch (e: any) {
      setMessageNotice(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Open Blank Wizard
  const handleOpenNewForestWizard = () => {
    const blankPack: ForestPack = {
      id: '',
      name: '',
      country: 'España / Local',
      description: '',
      centerLat: 40.4168,
      centerLng: -3.7038,
      coverImageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80',
      isPublished: true,
      pois: [
        {
          id: 'poi-1',
          name: 'Punto de Inicio',
          description: 'Lugar donde se reúnen los exploradores.',
          lat: 40.4168,
          lng: -3.7038,
          emoji: '🌲',
          clueSnippet: 'Fíjate en las señales de madera.',
        },
      ],
      routePresets: {
        '30min': ['poi-1'],
        '1h': ['poi-1'],
        '1.5h': ['poi-1'],
        '2h': ['poi-1'],
      },
      stories: [
        {
          id: 'historia-1',
          title: 'El Enigma del Sendero',
          icon: '🧭',
          summary: 'Aventura botánica de exploración.',
          narrative: 'El sendero guarda recuerdos de viejos leñadores.',
          mission: 'Encuentra las marcas en el camino y descifra el mensaje.',
          narratorName: 'Viejo Guardián',
          narratorRole: 'Cuidador del bosque',
          narratorTone: 'Sabio y pausado',
        },
      ],
      riddles: [
        {
          id: 'rid-1',
          poiId: 'poi-1',
          storyId: 'historia-1',
          name: 'La Primera Señal',
          difficulty: 'novato',
          question: '¿Qué elemento natural protege a los árboles del frío y los insectos?',
          options: ['La corteza', 'El cristal', 'El plástico'],
          answer: 'La corteza',
          points: 100,
          staticHints: ['Cubre el tronco exteriormente.', 'Es rugosa y de madera.', 'La corteza.'],
        },
      ],
      sceneNarratives: {
        'historia-1_poi-1': 'Comienza tu viaje en este claro del bosque.',
      },
    };
    setEditingPack(blankPack);
    setWizardStep(1);
    setIsWizardOpen(true);
  };

  const handleEditForest = (pack: ForestPack) => {
    setEditingPack(JSON.parse(JSON.stringify(pack)));
    setWizardStep(1);
    setIsWizardOpen(true);
  };

  const handleUseCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (editingPack) {
            setEditingPack({
              ...editingPack,
              centerLat: parseFloat(pos.coords.latitude.toFixed(5)),
              centerLng: parseFloat(pos.coords.longitude.toFixed(5)),
            });
            setMessageNotice('Coordenadas actualizadas con tu GPS actual.');
          }
        },
        (err) => {
          setMessageNotice('No se pudo obtener el GPS: ' + err.message);
        }
      );
    }
  };

  // AI draft assistant
  const handleGenerateAiForest = async () => {
    if (!aiPrompt.trim()) return;
    setAiGenerating(true);
    try {
      const generated = await api.aiDraftForest(
        aiPrompt,
        editingPack?.centerLat || 40.4168,
        editingPack?.centerLng || -3.7038
      );
      setEditingPack(generated);
      setMessageNotice('¡Borrador generado con IA! Revisa y edita los campos antes de guardar.');
    } catch (e: any) {
      setMessageNotice('Error en generación: ' + e.message);
    } finally {
      setAiGenerating(false);
    }
  };

  // Save Wizard
  const handleSaveForest = async () => {
    if (!editingPack || !editingPack.name.trim()) {
      alert('El nombre del bosque es obligatorio.');
      return;
    }
    try {
      setLoading(true);
      await api.saveForest(editingPack);
      setIsWizardOpen(false);
      setEditingPack(null);
      await loadData();
      setMessageNotice('¡Bosque guardado y publicado con éxito!');
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Send Admin message
  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastText.trim()) return;
    try {
      await api.sendAdminMessage(targetSessionCode, broadcastText.trim());
      setBroadcastText('');
      setMessageNotice(
        targetSessionCode === 'ALL'
          ? 'Mensaje global enviado a todas las partidas activas.'
          : `Mensaje enviado a la partida ${targetSessionCode}.`
      );
      loadData();
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-emerald-900/60 pb-5">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-adventure text-xs uppercase tracking-wider">
            <Radio className="w-4 h-4 text-emerald-400" />
            <span>Centro de Control</span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <h2 className="font-adventure text-2xl sm:text-3xl font-extrabold text-amber-100">
              Administración de Bosques
            </h2>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-semibold">
              <Shield className="w-3.5 h-3.5" />
              <span>Modo Administrador</span>
            </span>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-[#131E15] border border-emerald-900/60 rounded-xl">
          {[
            { id: 'forests', label: 'Bosques y Rutas', icon: Trees },
            { id: 'sessions', label: 'Partidas en Vivo', icon: Users },
            { id: 'stats', label: 'Estadísticas & Feedback', icon: BarChart3 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {messageNotice && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-600/70 rounded-xl text-emerald-200 text-xs flex items-center justify-between">
          <span>{messageNotice}</span>
          <button onClick={() => setMessageNotice(null)} className="text-emerald-400 font-bold ml-2">
            ✕
          </button>
        </div>
      )}

      {/* TAB 1: FORESTS MANAGEMENT */}
      {activeTab === 'forests' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-adventure text-lg font-bold text-amber-100">
                Packs de Bosque Configurables
              </h3>
              <p className="text-xs text-stone-400">
                Añade tu propio bosque cercano o duplica uno existente sin tocar código.
              </p>
            </div>

            <button
              onClick={handleOpenNewForestWizard}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-adventure font-bold text-xs tracking-wider flex items-center gap-2 shadow-md active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Crear Nuevo Bosque</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {forests.map((f) => (
              <div
                key={f.id}
                className="p-5 rounded-2xl bg-[#19261C] border border-emerald-900/60 shadow-lg flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-semibold text-emerald-400">
                      ID: {f.id}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        f.isPublished
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                          : 'bg-stone-800 text-stone-400'
                      }`}
                    >
                      {f.isPublished ? 'Publicado' : 'Borrador'}
                    </span>
                  </div>

                  <h4 className="font-adventure text-lg font-bold text-amber-100">{f.name}</h4>
                  <p className="text-xs text-stone-300 line-clamp-2">{f.description}</p>

                  <div className="text-[11px] text-stone-400 flex items-center gap-3 pt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-400" />
                      {f.centerLat.toFixed(3)}, {f.centerLng.toFixed(3)}
                    </span>
                    <span>• {f.pois?.length || 0} POIs</span>
                    <span>• {f.stories?.length || 0} Historias</span>
                    <span>• {f.riddles?.length || 0} Acertijos</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-emerald-900/40">
                  <button
                    onClick={() => handleEditForest(f)}
                    className="flex-1 py-2 px-3 rounded-lg bg-emerald-900/70 hover:bg-emerald-800/80 border border-emerald-700/50 text-white text-xs font-semibold flex items-center justify-center gap-1.5"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Editar</span>
                  </button>

                  <button
                    onClick={() => handleDuplicate(f.id)}
                    title="Duplicar como plantilla"
                    className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-300 hover:text-white text-xs font-semibold flex items-center justify-center"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  {forests.length > 1 && (
                    <button
                      onClick={() => handleDeleteForest(f.id)}
                      title="Eliminar bosque"
                      className="p-2 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-800/50 text-red-300 text-xs font-semibold flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: LIVE SESSIONS & BROADCAST */}
      {activeTab === 'sessions' && (
        <div className="space-y-6">
          {/* Broadcast banner */}
          <form
            onSubmit={handleSendBroadcast}
            className="p-4 rounded-2xl bg-[#1B2B1E] border border-amber-600/40 shadow-lg space-y-3"
          >
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-amber-400" />
              <h4 className="font-adventure text-sm font-bold text-amber-100">
                Enviar Aviso en Directo a los Jugadores
              </h4>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={targetSessionCode}
                onChange={(e) => setTargetSessionCode(e.target.value)}
                className="px-3 py-2 rounded-xl bg-black/40 border border-emerald-800 text-xs text-stone-200"
              >
                <option value="ALL">📢 Todas las partidas activas</option>
                {liveSessions.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.code} - {s.name} ({s.forestPackId})
                  </option>
                ))}
              </select>

              <input
                type="text"
                value={broadcastText}
                onChange={(e) => setBroadcastText(e.target.value)}
                placeholder="Escribe el mensaje (ej: 'Atención: sendero embarrado junto al molino')..."
                className="flex-1 px-4 py-2 rounded-xl bg-black/40 border border-emerald-800 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-400"
              />

              <button
                type="submit"
                disabled={!broadcastText.trim()}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Emitir</span>
              </button>
            </div>
          </form>

          {/* Sessions List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-adventure text-base font-bold text-amber-100">
                Partidas Registradas ({liveSessions.length})
              </h4>
              <button
                onClick={loadData}
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Actualizar</span>
              </button>
            </div>

            {liveSessions.length === 0 ? (
              <p className="text-xs text-stone-400 py-6 text-center">No hay partidas iniciadas aún.</p>
            ) : (
              <div className="space-y-2">
                {liveSessions.map((sess) => (
                  <div
                    key={sess.code}
                    className="p-3.5 rounded-xl bg-[#162218] border border-emerald-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-amber-300 text-sm">
                          {sess.code}
                        </span>
                        <span className="font-bold text-stone-200">{sess.name}</span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] uppercase font-bold ${
                            sess.status === 'completed'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}
                        >
                          {sess.status === 'completed' ? 'Completada' : 'En camino'}
                        </span>
                      </div>
                      <div className="text-stone-400 flex items-center gap-3">
                        <span>Bosque: {sess.forestPackId}</span>
                        <span>
                          Progreso: {sess.currentPoiIndex}/{sess.routePoiIds.length} POIs
                        </span>
                        <span className="text-amber-400 font-bold">{sess.points} pts</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-stone-400 flex sm:flex-col items-end gap-1">
                      <span>Iniciada: {new Date(sess.dateStarted).toLocaleTimeString()}</span>
                      <span className="font-mono text-emerald-400">
                        GPS: {sess.lat?.toFixed(3)}, {sess.lng?.toFixed(3)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: STATS & FEEDBACK */}
      {activeTab === 'stats' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-[#162218] border border-emerald-900/60 text-center">
              <div className="text-2xl font-extrabold text-amber-300 font-mono">
                {stats.totalSessions}
              </div>
              <div className="text-[10px] text-stone-400 uppercase tracking-wider">Total Partidas</div>
            </div>
            <div className="p-4 rounded-xl bg-[#162218] border border-emerald-900/60 text-center">
              <div className="text-2xl font-extrabold text-emerald-400 font-mono">
                {stats.completedSessions}
              </div>
              <div className="text-[10px] text-stone-400 uppercase tracking-wider">Completadas</div>
            </div>
            <div className="p-4 rounded-xl bg-[#162218] border border-emerald-900/60 text-center">
              <div className="text-2xl font-extrabold text-teal-400 font-mono">
                {stats.activeSessions}
              </div>
              <div className="text-[10px] text-stone-400 uppercase tracking-wider">Activas Hoy</div>
            </div>
            <div className="p-4 rounded-xl bg-[#162218] border border-emerald-900/60 text-center">
              <div className="text-2xl font-extrabold text-yellow-400 font-mono flex items-center justify-center gap-1">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span>{stats.avgRating}</span>
              </div>
              <div className="text-[10px] text-stone-400 uppercase tracking-wider">Valoración Media</div>
            </div>
          </div>

          {/* Feedback list */}
          <div className="space-y-3">
            <h4 className="font-adventure text-base font-bold text-amber-100">
              Opiniones de Jugadores ({stats.totalFeedback})
            </h4>

            {stats.recentFeedback && stats.recentFeedback.length > 0 ? (
              <div className="space-y-2.5">
                {stats.recentFeedback.map((fb: PlayerFeedback) => (
                  <div
                    key={fb.id}
                    className="p-3.5 rounded-xl bg-[#162218] border border-emerald-900/60 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-amber-200">{fb.playerName}</span>
                        <span className="text-stone-400">• {fb.storyTitle}</span>
                      </div>
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {Array.from({ length: fb.rating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    {fb.comment && <p className="text-stone-300 italic">"{fb.comment}"</p>}
                    <span className="text-[10px] text-stone-500 block">{fb.date}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-stone-400 italic">No hay valoraciones registradas aún.</p>
            )}
          </div>
        </div>
      )}

      {/* WIZARD MODAL FOR CREATING / EDITING FOREST */}
      {isWizardOpen && editingPack && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-[#19271C] border border-emerald-700/60 rounded-3xl shadow-2xl text-stone-100 overflow-hidden my-6">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-950 via-[#1C2C1F] to-emerald-950 border-b border-emerald-800/60 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  Asistente de Configuración
                </span>
                <h3 className="font-adventure text-lg sm:text-xl font-bold text-amber-100">
                  {editingPack.id ? `Editar: ${editingPack.name}` : 'Crear Nuevo Bosque'}
                </h3>
              </div>
              <button
                onClick={() => setIsWizardOpen(false)}
                className="p-1 rounded-lg bg-black/40 hover:bg-black/60 text-stone-300 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Wizard Steps Navigation */}
            <div className="grid grid-cols-4 border-b border-emerald-900/60 bg-[#141F16] text-center text-xs font-semibold">
              {[
                { step: 1, label: '1. Bosque & GPS' },
                { step: 2, label: '2. Puntos POI' },
                { step: 3, label: '3. Historias' },
                { step: 4, label: '4. Acertijos' },
              ].map((s) => (
                <button
                  key={s.step}
                  type="button"
                  onClick={() => setWizardStep(s.step as any)}
                  className={`py-2.5 transition-colors ${
                    wizardStep === s.step
                      ? 'bg-emerald-800/80 text-amber-200 border-b-2 border-amber-400'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Step Body */}
            <div className="p-5 space-y-5 max-h-[65vh] overflow-y-auto">
              {/* STEP 1: Basic Info & GPS */}
              {wizardStep === 1 && (
                <div className="space-y-4">
                  {/* AI Assistant Banner */}
                  <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-600/40 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Generar borrador rápido con IA (Opcional)</span>
                    </div>
                    <p className="text-[11px] text-stone-300">
                      Describe brevemente el bosque (ej: "Pinar junto a mi casa en Cestas con un viejo pozo, una ermita y un mirador") y la IA creará los POIs, historia y acertijos para que solo tengas que revisarlos.
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="Descripción breve de tu bosque..."
                        className="flex-1 px-3 py-1.5 rounded-lg bg-black/40 border border-amber-800 text-xs text-stone-100 placeholder-stone-500"
                      />
                      <button
                        type="button"
                        onClick={handleGenerateAiForest}
                        disabled={aiGenerating || !aiPrompt.trim()}
                        className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs flex items-center gap-1 disabled:opacity-50"
                      >
                        {aiGenerating ? 'Generando...' : 'Generar'}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-emerald-300 uppercase mb-1">
                        Nombre del Bosque *
                      </label>
                      <input
                        type="text"
                        value={editingPack.name}
                        onChange={(e) => setEditingPack({ ...editingPack, name: e.target.value })}
                        placeholder="Ej: Bosque de Canéjan-Cestas"
                        className="w-full px-3 py-2 rounded-xl bg-black/40 border border-emerald-800 text-xs text-stone-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-emerald-300 uppercase mb-1">
                        Región / Ubicación
                      </label>
                      <input
                        type="text"
                        value={editingPack.country || ''}
                        onChange={(e) => setEditingPack({ ...editingPack, country: e.target.value })}
                        placeholder="Ej: España, Madrid o Francia, Gironde"
                        className="w-full px-3 py-2 rounded-xl bg-black/40 border border-emerald-800 text-xs text-stone-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-emerald-300 uppercase mb-1">
                      Descripción General
                    </label>
                    <textarea
                      value={editingPack.description || ''}
                      onChange={(e) => setEditingPack({ ...editingPack, description: e.target.value })}
                      placeholder="Breve presentación del bosque y su entorno..."
                      rows={2}
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-emerald-800 text-xs text-stone-100"
                    />
                  </div>

                  <div className="p-3.5 rounded-xl bg-black/30 border border-emerald-900/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-300 uppercase">
                        Coordenadas Centrales del Bosque
                      </span>
                      <button
                        type="button"
                        onClick={handleUseCurrentLocation}
                        className="text-[11px] text-amber-300 hover:text-amber-200 flex items-center gap-1 font-semibold"
                      >
                        <Compass className="w-3.5 h-3.5" />
                        <span>Usar mi GPS actual</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-[10px] text-stone-400">Latitud:</span>
                        <input
                          type="number"
                          step="0.0001"
                          value={editingPack.centerLat}
                          onChange={(e) =>
                            setEditingPack({ ...editingPack, centerLat: parseFloat(e.target.value) || 0 })
                          }
                          className="w-full px-3 py-1.5 rounded-lg bg-black/50 border border-emerald-800 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-stone-400">Longitud:</span>
                        <input
                          type="number"
                          step="0.0001"
                          value={editingPack.centerLng}
                          onChange={(e) =>
                            setEditingPack({ ...editingPack, centerLng: parseFloat(e.target.value) || 0 })
                          }
                          className="w-full px-3 py-1.5 rounded-lg bg-black/50 border border-emerald-800 text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-emerald-300 uppercase mb-1">
                      URL de Imagen de Portada
                    </label>
                    <input
                      type="text"
                      value={editingPack.coverImageUrl || ''}
                      onChange={(e) => setEditingPack({ ...editingPack, coverImageUrl: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-emerald-800 text-xs text-stone-100"
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: POIs */}
              {wizardStep === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-300 uppercase">
                      Puntos de Interés ({editingPack.pois.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const newPoi: WindmillPOI = {
                          id: `poi-${Date.now().toString().slice(-4)}`,
                          name: 'Nuevo Punto de Interés',
                          description: 'Descripción del lugar.',
                          lat: editingPack.centerLat + 0.0005 * editingPack.pois.length,
                          lng: editingPack.centerLng + 0.0005 * editingPack.pois.length,
                          emoji: '📍',
                          clueSnippet: 'Pista de observación.',
                        };
                        setEditingPack({ ...editingPack, pois: [...editingPack.pois, newPoi] });
                      }}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Añadir POI</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {editingPack.pois.map((poi, idx) => (
                      <div
                        key={poi.id}
                        className="p-3.5 rounded-xl bg-[#141F16] border border-emerald-900/60 space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-200">
                            POI #{idx + 1}
                          </span>
                          {editingPack.pois.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const nextPois = editingPack.pois.filter((p) => p.id !== poi.id);
                                setEditingPack({ ...editingPack, pois: nextPois });
                              }}
                              className="text-red-400 hover:text-red-300 text-xs"
                            >
                              Eliminar
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-4 gap-2">
                          <div className="col-span-1">
                            <span className="text-[10px] text-stone-400">Emoji:</span>
                            <input
                              type="text"
                              value={poi.emoji}
                              onChange={(e) => {
                                const copy = [...editingPack.pois];
                                copy[idx].emoji = e.target.value;
                                setEditingPack({ ...editingPack, pois: copy });
                              }}
                              className="w-full text-center px-2 py-1.5 rounded-lg bg-black/40 border border-emerald-800 text-xs"
                            />
                          </div>
                          <div className="col-span-3">
                            <span className="text-[10px] text-stone-400">Nombre del Punto:</span>
                            <input
                              type="text"
                              value={poi.name}
                              onChange={(e) => {
                                const copy = [...editingPack.pois];
                                copy[idx].name = e.target.value;
                                setEditingPack({ ...editingPack, pois: copy });
                              }}
                              className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-emerald-800 text-xs text-stone-100"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-[10px] text-stone-400">Latitud:</span>
                            <input
                              type="number"
                              step="0.0001"
                              value={poi.lat}
                              onChange={(e) => {
                                const copy = [...editingPack.pois];
                                copy[idx].lat = parseFloat(e.target.value) || 0;
                                setEditingPack({ ...editingPack, pois: copy });
                              }}
                              className="w-full px-2 py-1.5 rounded-lg bg-black/40 border border-emerald-800 text-xs font-mono"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-stone-400">Longitud:</span>
                            <input
                              type="number"
                              step="0.0001"
                              value={poi.lng}
                              onChange={(e) => {
                                const copy = [...editingPack.pois];
                                copy[idx].lng = parseFloat(e.target.value) || 0;
                                setEditingPack({ ...editingPack, pois: copy });
                              }}
                              className="w-full px-2 py-1.5 rounded-lg bg-black/40 border border-emerald-800 text-xs font-mono"
                            />
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] text-stone-400">Descripción:</span>
                          <input
                            type="text"
                            value={poi.description}
                            onChange={(e) => {
                              const copy = [...editingPack.pois];
                              copy[idx].description = e.target.value;
                              setEditingPack({ ...editingPack, pois: copy });
                            }}
                            className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-emerald-800 text-xs text-stone-100"
                          />
                        </div>

                        {/* Realidad Aumentada (AR) Asset Config for this POI */}
                        <div className="p-3.5 rounded-xl bg-black/50 border border-amber-600/50 space-y-3 mt-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-amber-300 uppercase flex items-center gap-1.5 font-mono">
                              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                              <span>Realidad Aumentada Geolocalizada</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => setPreviewArPoi(poi)}
                              className="text-[10px] px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold flex items-center gap-1.5 shadow transition-colors"
                            >
                              <Camera className="w-3.5 h-3.5" />
                              <span>Previsualizar en Cámara AR</span>
                            </button>
                          </div>

                          {/* Quick Presets for Forest AR Assets */}
                          <div>
                            <span className="text-[10px] text-stone-400 block mb-1">Cargar plantilla de artefacto:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {[
                                { preset: 'rueda_hidraulica', title: 'Rueda Hidráulica 3D', scale: 1.4, h: 1.2, trigger: 'onArrival', emoji: '⚙️' },
                                { preset: 'cofre_sumergido', title: 'Cofre Sumergido 3D', scale: 1.2, h: 0.7, trigger: 'onRiddleSolved', emoji: '📦' },
                                { preset: 'espiritu_guardian', title: 'Espíritu Guardián 3D', scale: 1.5, h: 1.8, trigger: 'onArrival', emoji: '✨' },
                                { preset: 'caldero_vapor', title: 'Caldero Mágico 3D', scale: 1.3, h: 1.0, trigger: 'onRiddleSolved', emoji: '🧪' },
                                { preset: 'farol_cuaderno', title: 'Farol y Cuaderno 3D', scale: 1.2, h: 1.1, trigger: 'onArrival', emoji: '🛖' },
                                { preset: 'catalejo_nautico', title: 'Catalejo Náutico 3D', scale: 1.3, h: 1.3, trigger: 'onRiddleSolved', emoji: '🔭' },
                                { preset: 'cantaro_piedra', title: 'Cántaro de Piedra 3D', scale: 1.2, h: 0.8, trigger: 'onArrival', emoji: '⛲' },
                                { preset: 'corzo_dorado', title: 'Corzo Dorado 3D', scale: 1.4, h: 1.2, trigger: 'onArrival', emoji: '🦌' },
                                { preset: 'brujula_flotante', title: 'Brújula Flotante 3D', scale: 1.3, h: 1.0, trigger: 'onRiddleSolved', emoji: '🧭' },
                                { preset: 'halcon_bronce', title: 'Halcón de Bronce 3D', scale: 1.3, h: 1.5, trigger: 'onRiddleSolved', emoji: '🦅' },
                              ].map((item) => (
                                <button
                                  key={item.preset}
                                  type="button"
                                  onClick={() => {
                                    const copy = [...editingPack.pois];
                                    copy[idx].arAsset = {
                                      preset: item.preset,
                                      label: item.title,
                                      title: item.title,
                                      scale: item.scale,
                                      heightOffsetMeters: item.h,
                                      revealTrigger: item.trigger as 'onArrival' | 'onRiddleSolved',
                                    };
                                    setEditingPack({ ...editingPack, pois: copy });
                                  }}
                                  className="text-[10px] px-2 py-1 rounded bg-[#1C2C1F] hover:bg-emerald-900 border border-emerald-800 text-stone-200 transition-colors flex items-center gap-1"
                                >
                                  <span>{item.emoji}</span>
                                  <span>{item.title}</span>
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <span className="text-[10px] text-stone-400">Nombre del Objeto 3D / Sprite:</span>
                              <input
                                type="text"
                                value={poi.arAsset?.title || ''}
                                onChange={(e) => {
                                  const copy = [...editingPack.pois];
                                  copy[idx].arAsset = {
                                    ...(copy[idx].arAsset || { scale: 1.2, heightOffsetMeters: 1.0, revealTrigger: 'onArrival' }),
                                    title: e.target.value,
                                  };
                                  setEditingPack({ ...editingPack, pois: copy });
                                }}
                                placeholder="Ej. Rueda de Molino Ancestral"
                                className="w-full px-2.5 py-1.5 rounded-lg bg-black/40 border border-emerald-900 text-xs text-stone-100"
                              />
                            </div>

                            <div>
                              <span className="text-[10px] text-stone-400">Desencadenante de Revelación:</span>
                              <select
                                value={poi.arAsset?.revealTrigger || 'onArrival'}
                                onChange={(e) => {
                                  const copy = [...editingPack.pois];
                                  copy[idx].arAsset = {
                                    ...(copy[idx].arAsset || { scale: 1.2, heightOffsetMeters: 1.0, revealTrigger: 'onArrival' }),
                                    revealTrigger: e.target.value as 'onArrival' | 'onRiddleSolved',
                                  };
                                  setEditingPack({ ...editingPack, pois: copy });
                                }}
                                className="w-full px-2.5 py-1.5 rounded-lg bg-black/40 border border-emerald-900 text-xs text-stone-100 font-medium"
                              >
                                <option value="onArrival">Al llegar al POI (onArrival)</option>
                                <option value="onRiddleSolved">Solo tras resolver acertijo (onRiddleSolved)</option>
                              </select>
                            </div>
                          </div>

                          {/* File Upload & URL Inputs */}
                          <div className="space-y-2">
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                              <div className="flex-1">
                                <span className="text-[10px] text-stone-400">Enlace a Modelo (.glb / .gltf) o Sprite 2D:</span>
                                <input
                                  type="text"
                                  value={poi.arAsset?.modelUrl || poi.arAsset?.spriteUrl || ''}
                                  onChange={(e) => {
                                    const copy = [...editingPack.pois];
                                    const val = e.target.value;
                                    copy[idx].arAsset = {
                                      ...(copy[idx].arAsset || { scale: 1.2, heightOffsetMeters: 1.0, revealTrigger: 'onArrival' }),
                                      modelUrl: val.endsWith('.glb') || val.endsWith('.gltf') ? val : undefined,
                                      spriteUrl: !val.endsWith('.glb') && !val.endsWith('.gltf') && val ? val : undefined,
                                    };
                                    setEditingPack({ ...editingPack, pois: copy });
                                  }}
                                  placeholder="https://... (dejar vacío para artefacto 3D procedural)"
                                  className="w-full px-2.5 py-1.5 rounded-lg bg-black/40 border border-emerald-900 text-xs font-mono text-stone-200"
                                />
                              </div>

                              <div className="sm:self-end">
                                <label className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-600 text-stone-200 hover:text-white text-xs font-semibold cursor-pointer shadow transition-colors w-full">
                                  <Upload className="w-3.5 h-3.5 text-amber-400" />
                                  <span>Subir archivo</span>
                                  <input
                                    type="file"
                                    accept=".glb,.gltf,.png,.jpg,.jpeg,.webp,.svg"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (!file) return;
                                      const reader = new FileReader();
                                      reader.onload = (uploadEv) => {
                                        const result = uploadEv.target?.result as string;
                                        if (!result) return;
                                        const is3d = file.name.endsWith('.glb') || file.name.endsWith('.gltf');
                                        const copy = [...editingPack.pois];
                                        copy[idx].arAsset = {
                                          ...(copy[idx].arAsset || { scale: 1.2, heightOffsetMeters: 1.0, revealTrigger: 'onArrival' }),
                                          modelUrl: is3d ? result : undefined,
                                          spriteUrl: !is3d ? result : undefined,
                                          title: copy[idx].arAsset?.title || file.name.replace(/\.[^/.]+$/, ''),
                                        };
                                        setEditingPack({ ...editingPack, pois: copy });
                                      };
                                      reader.readAsDataURL(file);
                                    }}
                                  />
                                </label>
                              </div>
                            </div>
                            {poi.arAsset?.modelUrl?.startsWith('data:') && (
                              <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                <span>Archivo 3D local cargado en memoria</span>
                              </div>
                            )}
                            {poi.arAsset?.spriteUrl?.startsWith('data:') && (
                              <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                <span>Sprite 2D local cargado en memoria</span>
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="text-[10px] text-stone-400">Escala de render:</span>
                              <input
                                type="number"
                                step="0.1"
                                min="0.2"
                                max="10"
                                value={poi.arAsset?.scale || 1.2}
                                onChange={(e) => {
                                  const copy = [...editingPack.pois];
                                  copy[idx].arAsset = {
                                    ...(copy[idx].arAsset || { scale: 1.2, heightOffsetMeters: 1.0, revealTrigger: 'onArrival' }),
                                    scale: parseFloat(e.target.value) || 1.0,
                                  };
                                  setEditingPack({ ...editingPack, pois: copy });
                                }}
                                className="w-full px-2 py-1.5 rounded-lg bg-black/40 border border-emerald-900 text-xs font-mono"
                              />
                            </div>
                            <div>
                              <span className="text-[10px] text-stone-400">Elevación del suelo (m):</span>
                              <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="15"
                                value={poi.arAsset?.heightOffsetMeters || 1.0}
                                onChange={(e) => {
                                  const copy = [...editingPack.pois];
                                  copy[idx].arAsset = {
                                    ...(copy[idx].arAsset || { scale: 1.2, heightOffsetMeters: 1.0, revealTrigger: 'onArrival' }),
                                    heightOffsetMeters: parseFloat(e.target.value) || 1.0,
                                  };
                                  setEditingPack({ ...editingPack, pois: copy });
                                }}
                                className="w-full px-2 py-1.5 rounded-lg bg-black/40 border border-emerald-900 text-xs font-mono"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 3: Stories */}
              {wizardStep === 3 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-300 uppercase">
                      Historias / Ambientaciones ({editingPack.stories.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const newStory: StoryIntro = {
                          id: `historia-${Date.now().toString().slice(-4)}`,
                          title: 'Nueva Leyenda',
                          icon: '🌲',
                          summary: 'Resumen de la historia.',
                          narrative: 'Narrativa de introducción al bosque.',
                          mission: 'Misión del explorador.',
                          narratorName: 'El Guía',
                          narratorRole: 'Voz del bosque',
                        };
                        setEditingPack({ ...editingPack, stories: [...editingPack.stories, newStory] });
                      }}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Añadir Historia</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {editingPack.stories.map((st, idx) => (
                      <div
                        key={st.id}
                        className="p-3.5 rounded-xl bg-[#141F16] border border-emerald-900/60 space-y-2.5"
                      >
                        <div className="grid grid-cols-4 gap-2">
                          <div className="col-span-1">
                            <span className="text-[10px] text-stone-400">Icono:</span>
                            <input
                              type="text"
                              value={st.icon}
                              onChange={(e) => {
                                const copy = [...editingPack.stories];
                                copy[idx].icon = e.target.value;
                                setEditingPack({ ...editingPack, stories: copy });
                              }}
                              className="w-full text-center px-2 py-1.5 rounded-lg bg-black/40 border border-emerald-800 text-xs"
                            />
                          </div>
                          <div className="col-span-3">
                            <span className="text-[10px] text-stone-400">Título de la Historia:</span>
                            <input
                              type="text"
                              value={st.title}
                              onChange={(e) => {
                                const copy = [...editingPack.stories];
                                copy[idx].title = e.target.value;
                                setEditingPack({ ...editingPack, stories: copy });
                              }}
                              className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-emerald-800 text-xs text-stone-100"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-[10px] text-stone-400">Nombre del Narrador:</span>
                            <input
                              type="text"
                              value={st.narratorName}
                              onChange={(e) => {
                                const copy = [...editingPack.stories];
                                copy[idx].narratorName = e.target.value;
                                setEditingPack({ ...editingPack, stories: copy });
                              }}
                              className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-emerald-800 text-xs text-stone-100"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-stone-400">Rol del Narrador:</span>
                            <input
                              type="text"
                              value={st.narratorRole}
                              onChange={(e) => {
                                const copy = [...editingPack.stories];
                                copy[idx].narratorRole = e.target.value;
                                setEditingPack({ ...editingPack, stories: copy });
                              }}
                              className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-emerald-800 text-xs text-stone-100"
                            />
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] text-stone-400">Narrativa inicial:</span>
                          <textarea
                            value={st.narrative}
                            onChange={(e) => {
                              const copy = [...editingPack.stories];
                              copy[idx].narrative = e.target.value;
                              setEditingPack({ ...editingPack, stories: copy });
                            }}
                            rows={2}
                            className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-emerald-800 text-xs text-stone-100"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 4: Riddles */}
              {wizardStep === 4 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-300 uppercase">
                      Acertijos ({editingPack.riddles.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const newRiddle: Riddle = {
                          id: `rid-${Date.now().toString().slice(-4)}`,
                          poiId: editingPack.pois[0]?.id || 'poi-1',
                          storyId: editingPack.stories[0]?.id || 'historia-1',
                          name: 'Nuevo Enigma',
                          difficulty: 'novato',
                          question: 'Pregunta del enigma.',
                          options: ['Opción A', 'Opción B'],
                          answer: 'Opción A',
                          points: 100,
                        };
                        setEditingPack({ ...editingPack, riddles: [...editingPack.riddles, newRiddle] });
                      }}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Añadir Acertijo</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {editingPack.riddles.map((r, idx) => (
                      <div
                        key={r.id}
                        className="p-3.5 rounded-xl bg-[#141F16] border border-emerald-900/60 space-y-2.5 text-xs"
                      >
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <span className="text-[10px] text-stone-400">POI Asociado:</span>
                            <select
                              value={r.poiId}
                              onChange={(e) => {
                                const copy = [...editingPack.riddles];
                                copy[idx].poiId = e.target.value;
                                setEditingPack({ ...editingPack, riddles: copy });
                              }}
                              className="w-full px-2 py-1.5 rounded-lg bg-black/40 border border-emerald-800 text-[11px]"
                            >
                              {editingPack.pois.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <span className="text-[10px] text-stone-400">Historia:</span>
                            <select
                              value={r.storyId}
                              onChange={(e) => {
                                const copy = [...editingPack.riddles];
                                copy[idx].storyId = e.target.value;
                                setEditingPack({ ...editingPack, riddles: copy });
                              }}
                              className="w-full px-2 py-1.5 rounded-lg bg-black/40 border border-emerald-800 text-[11px]"
                            >
                              {editingPack.stories.map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.title}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <span className="text-[10px] text-stone-400">Dificultad:</span>
                            <select
                              value={r.difficulty}
                              onChange={(e) => {
                                const copy = [...editingPack.riddles];
                                copy[idx].difficulty = e.target.value as any;
                                setEditingPack({ ...editingPack, riddles: copy });
                              }}
                              className="w-full px-2 py-1.5 rounded-lg bg-black/40 border border-emerald-800 text-[11px]"
                            >
                              <option value="novato">Novato</option>
                              <option value="explorador">Explorador</option>
                              <option value="maestro">Maestro</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] text-stone-400">Pregunta:</span>
                          <input
                            type="text"
                            value={r.question}
                            onChange={(e) => {
                              const copy = [...editingPack.riddles];
                              copy[idx].question = e.target.value;
                              setEditingPack({ ...editingPack, riddles: copy });
                            }}
                            className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-emerald-800 text-xs text-stone-100"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-[10px] text-stone-400">Respuesta Correcta:</span>
                            <input
                              type="text"
                              value={r.answer}
                              onChange={(e) => {
                                const copy = [...editingPack.riddles];
                                copy[idx].answer = e.target.value;
                                setEditingPack({ ...editingPack, riddles: copy });
                              }}
                              className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-emerald-800 text-xs text-amber-300 font-bold"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-stone-400">Puntos:</span>
                            <input
                              type="number"
                              value={r.points}
                              onChange={(e) => {
                                const copy = [...editingPack.riddles];
                                copy[idx].points = parseInt(e.target.value) || 100;
                                setEditingPack({ ...editingPack, riddles: copy });
                              }}
                              className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-emerald-800 text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#141F16] border-t border-emerald-900/60 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  if (wizardStep > 1) setWizardStep((wizardStep - 1) as any);
                }}
                disabled={wizardStep === 1}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 disabled:opacity-30 text-xs font-semibold"
              >
                Anterior
              </button>

              <div className="flex items-center gap-2">
                {wizardStep < 4 ? (
                  <button
                    type="button"
                    onClick={() => setWizardStep((wizardStep + 1) as any)}
                    className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold"
                  >
                    Siguiente Paso
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSaveForest}
                    className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-adventure font-bold text-xs tracking-wide shadow-md active:scale-95"
                  >
                    Guardar y Publicar Bosque
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin AR Preview Modal */}
      {previewArPoi && (
        <GeolocatedARModal
          isOpen={!!previewArPoi}
          onClose={() => setPreviewArPoi(null)}
          poi={previewArPoi}
          playerLat={previewArPoi.lat + 0.0001}
          playerLng={previewArPoi.lng - 0.0001}
          isRiddleSolved={true}
          simulatedGps={true}
        />
      )}
    </div>
  );
};
