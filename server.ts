import express, { Request, Response } from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { ForestPack, PlayerSession, Riddle, PlayerFeedback } from './src/types';
import { SEED_FOREST_PACKS } from './src/data/seedPacks';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json());

// Initialize GoogleGenAI SDK if key is present
const geminiApiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (geminiApiKey && geminiApiKey !== 'MY_GEMINI_API_KEY') {
  ai = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// -------------------------------------------------------------
// Data Persistence Layer (File-backed JSON storage in /data)
// -------------------------------------------------------------
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const FORESTS_FILE = path.join(DATA_DIR, 'forests.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');
const FEEDBACK_FILE = path.join(DATA_DIR, 'feedback.json');

function loadForests(): ForestPack[] {
  try {
    if (fs.existsSync(FORESTS_FILE)) {
      const data = fs.readFileSync(FORESTS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading forests.json, using seed packs:', err);
  }
  // Initialize with seed packs
  saveForests(SEED_FOREST_PACKS);
  return SEED_FOREST_PACKS;
}

function saveForests(forests: ForestPack[]): void {
  try {
    fs.writeFileSync(FORESTS_FILE, JSON.stringify(forests, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving forests.json:', err);
  }
}

function loadSessions(): Record<string, PlayerSession> {
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const data = fs.readFileSync(SESSIONS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error loading sessions.json:', err);
  }
  return {};
}

function saveSessions(sessions: Record<string, PlayerSession>): void {
  try {
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving sessions.json:', err);
  }
}

function loadFeedback(): PlayerFeedback[] {
  try {
    if (fs.existsSync(FEEDBACK_FILE)) {
      const data = fs.readFileSync(FEEDBACK_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error loading feedback.json:', err);
  }
  return [];
}

function saveFeedback(feedbackList: PlayerFeedback[]): void {
  try {
    fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(feedbackList, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving feedback.json:', err);
  }
}

// In-memory cache loaded from disk
let forestPacks: ForestPack[] = loadForests();
let sessions: Record<string, PlayerSession> = loadSessions();
let feedbackList: PlayerFeedback[] = loadFeedback();

function generateSessionCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function normalizeAnswer(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'«»]/g, '')
    .trim();
}

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'bosque2026';

function requireAdmin(req: Request, res: Response, next: Function) {
  const authHeader = req.headers['x-admin-key'] || req.query.adminKey;
  if (authHeader === ADMIN_PASSWORD) {
    return next();
  }
  return res.status(401).json({ error: 'Acceso no autorizado. Se requiere contraseña de administrador.' });
}

// -------------------------------------------------------------
// REST API Endpoints
// -------------------------------------------------------------

// Admin Password Verification
app.post('/api/admin/verify', (req: Request, res: Response) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    return res.json({ success: true, token: ADMIN_PASSWORD });
  }
  return res.status(401).json({ success: false, error: 'Contraseña de administrador incorrecta' });
});

// 1. Get Forests
app.get('/api/forests', (req: Request, res: Response) => {
  const isAdmin = req.query.admin === 'true';
  const list = isAdmin ? forestPacks : forestPacks.filter(p => p.isPublished !== false);
  res.json(list);
});

// 2. Get Single Forest
app.get('/api/forests/:id', (req: Request, res: Response) => {
  const pack = forestPacks.find(p => p.id === req.params.id);
  if (!pack) {
    return res.status(404).json({ error: 'Bosque no encontrado' });
  }
  res.json(pack);
});

// 3. Create or Update Forest Pack (Admin Only)
app.post('/api/forests', requireAdmin, (req: Request, res: Response) => {
  const packData: ForestPack = req.body;
  if (!packData.name || !packData.centerLat || !packData.centerLng) {
    return res.status(400).json({ error: 'Nombre y coordenadas son requeridos' });
  }

  if (!packData.id) {
    packData.id = packData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') + '-' + Math.floor(Math.random() * 1000);
  }

  const existingIdx = forestPacks.findIndex(p => p.id === packData.id);
  if (existingIdx >= 0) {
    forestPacks[existingIdx] = { ...forestPacks[existingIdx], ...packData };
  } else {
    forestPacks.push(packData);
  }

  saveForests(forestPacks);
  res.json(packData);
});

// 4. Duplicate Forest Pack (Admin Only)
app.post('/api/forests/:id/duplicate', requireAdmin, (req: Request, res: Response) => {
  const source = forestPacks.find(p => p.id === req.params.id);
  if (!source) {
    return res.status(404).json({ error: 'Bosque origen no encontrado' });
  }

  const newId = `${source.id}-copia-${Date.now().toString().slice(-4)}`;
  const duplicate: ForestPack = {
    ...JSON.parse(JSON.stringify(source)),
    id: newId,
    name: `${source.name} (Copia)`,
    isPublished: true,
  };

  forestPacks.push(duplicate);
  saveForests(forestPacks);
  res.json(duplicate);
});

// 5. Delete Forest Pack (Admin Only)
app.delete('/api/forests/:id', requireAdmin, (req: Request, res: Response) => {
  if (forestPacks.length <= 1) {
    return res.status(400).json({ error: 'No se puede eliminar el único bosque disponible.' });
  }
  forestPacks = forestPacks.filter(p => p.id !== req.params.id);
  saveForests(forestPacks);
  res.json({ success: true });
});

// 6. Start / Create Player Session
app.post('/api/sessions', (req: Request, res: Response) => {
  const { forestPackId, name, type, storyId, difficulty, duration, easyMode } = req.body;

  const pack = forestPacks.find(p => p.id === forestPackId);
  if (!pack) {
    return res.status(404).json({ error: 'Bosque no encontrado' });
  }

  const story = pack.stories.find(s => s.id === storyId);
  if (!story) {
    return res.status(404).json({ error: 'Historia no encontrada' });
  }

  // Determine route of POIs based on presets
  let routePoiIds: string[] = [];
  if (pack.routePresets && pack.routePresets[storyId] && pack.routePresets[storyId][duration]) {
    routePoiIds = pack.routePresets[storyId][duration];
  } else if (pack.routePresets && Array.isArray(pack.routePresets[storyId])) {
    routePoiIds = pack.routePresets[storyId];
  } else if (pack.routePresets && Array.isArray(pack.routePresets[duration])) {
    routePoiIds = pack.routePresets[duration];
  } else {
    // Only POIs that have riddles for this story
    const storyPois = pack.pois
      .filter(p => pack.riddles.some(r => r.poiId === p.id && r.storyId === storyId))
      .map(p => p.id);
    routePoiIds = storyPois.length > 0 ? storyPois : pack.pois.map(p => p.id);
  }

  // Ensure all POIs in route actually exist
  routePoiIds = routePoiIds.filter(id => pack.pois.some(p => p.id === id));
  if (routePoiIds.length === 0) {
    routePoiIds = pack.pois.map(p => p.id);
  }

  let code = generateSessionCode();
  while (sessions[code]) {
    code = generateSessionCode();
  }

  const narratorDisplayName = story.narratorName || story.narrator?.name || 'el guía del bosque';
  const welcomeMsg = `¡Saludos, ${name || 'explorador'}! Soy ${narratorDisplayName}. He preparado la senda para tu expedición. Dirígete al primer punto marcado en tu mapa y prepárate a desentrañar los enigmas del bosque.`;

  const newSession: PlayerSession = {
    code,
    forestPackId,
    name: name || 'Aventurero',
    type: type || 'individual',
    storyId,
    difficulty: difficulty || 'novato',
    duration: duration || '1h',
    easyMode: Boolean(easyMode),
    currentPoiIndex: 0,
    routePoiIds,
    points: 0,
    status: 'active',
    dateStarted: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    lat: pack.centerLat,
    lng: pack.centerLng,
    messages: [
      {
        id: 'msg-welcome',
        sender: 'narrator',
        text: welcomeMsg,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ],
    completedPois: [],
    hintHistory: [],
  };

  sessions[code] = newSession;
  saveSessions(sessions);

  res.json({ session: newSession, forestPack: pack });
});

// 7. Get Session
app.get('/api/sessions/:code', (req: Request, res: Response) => {
  const code = req.params.code.toUpperCase();
  const session = sessions[code];
  if (!session) {
    return res.status(404).json({ error: 'Código de partida no encontrado' });
  }

  const pack = forestPacks.find(p => p.id === session.forestPackId) || forestPacks[0];
  res.json({ session, forestPack: pack });
});

// 8. Submit Answer to Current Riddle
app.post('/api/sessions/:code/answer', (req: Request, res: Response) => {
  const code = req.params.code.toUpperCase();
  const session = sessions[code];
  if (!session) {
    return res.status(404).json({ error: 'Partida no encontrada' });
  }

  if (session.status === 'completed') {
    return res.json({ session, isCorrect: true, isComplete: true, message: '¡Partida ya completada!' });
  }

  const pack = forestPacks.find(p => p.id === session.forestPackId);
  if (!pack) {
    return res.status(404).json({ error: 'Bosque no encontrado' });
  }

  const currentPoiId = session.routePoiIds[session.currentPoiIndex];
  const { userAnswer } = req.body;
  if (!userAnswer || typeof userAnswer !== 'string') {
    return res.status(400).json({ error: 'Respuesta vacía' });
  }

  // Find riddle matching current POI, story and difficulty (or fallback)
  let riddle = pack.riddles.find(
    r => r.poiId === currentPoiId && r.storyId === session.storyId && r.difficulty === session.difficulty
  );
  if (!riddle) {
    riddle = pack.riddles.find(r => r.poiId === currentPoiId && r.storyId === session.storyId);
  }
  if (!riddle) {
    riddle = pack.riddles.find(r => r.poiId === currentPoiId);
  }

  if (!riddle) {
    // If no riddle exists for this POI, advance automatically
    session.completedPois.push(currentPoiId);
    session.currentPoiIndex++;
    if (session.currentPoiIndex >= session.routePoiIds.length) {
      session.status = 'completed';
    }
    saveSessions(sessions);
    return res.json({
      session,
      isCorrect: true,
      pointsEarned: 100,
      isComplete: session.status === 'completed',
    });
  }

  const normUser = normalizeAnswer(userAnswer);
  const normExpected = normalizeAnswer(riddle.answer);
  const acceptedNorm = (riddle.acceptedAnswers || []).map(normalizeAnswer);

  const isCorrect = normUser === normExpected || acceptedNorm.includes(normUser);

  if (isCorrect) {
    const pointsAwarded = riddle.points || 100;
    session.points += pointsAwarded;
    if (!session.completedPois.includes(currentPoiId)) {
      session.completedPois.push(currentPoiId);
    }
    session.currentPoiIndex++;
    session.lastActive = new Date().toISOString();

    if (session.currentPoiIndex >= session.routePoiIds.length) {
      session.status = 'completed';
    }

    saveSessions(sessions);

    return res.json({
      session,
      isCorrect: true,
      pointsEarned: pointsAwarded,
      isComplete: session.status === 'completed',
      message: '¡Excelente deducción! Has resuelto el enigma.',
    });
  } else {
    return res.json({
      session,
      isCorrect: false,
      message: 'No es la respuesta correcta. Observa con más calma tu entorno o pide una pista al guía.',
    });
  }
});

// 9. Request Progressive Hint (Level 1, 2, or 3)
app.post('/api/sessions/:code/hint', async (req: Request, res: Response) => {
  const code = req.params.code.toUpperCase();
  const session = sessions[code];
  if (!session) {
    return res.status(404).json({ error: 'Partida no encontrada' });
  }

  const pack = forestPacks.find(p => p.id === session.forestPackId);
  if (!pack) {
    return res.status(404).json({ error: 'Bosque no encontrado' });
  }

  const { level } = req.body; // 1, 2, or 3
  const targetLevel: 1 | 2 | 3 = level === 3 ? 3 : level === 2 ? 2 : 1;

  const currentPoiId = session.routePoiIds[session.currentPoiIndex];
  const poi = pack.pois.find(p => p.id === currentPoiId);
  const story = pack.stories.find(s => s.id === session.storyId);

  let riddle = pack.riddles.find(
    r => r.poiId === currentPoiId && r.storyId === session.storyId && r.difficulty === session.difficulty
  );
  if (!riddle) {
    riddle = pack.riddles.find(r => r.poiId === currentPoiId);
  }

  let hintText = '';

  // Check if static hint is available
  const staticHintIndex = targetLevel - 1;
  const staticFallback = riddle?.hints?.[staticHintIndex] || riddle?.staticHints?.[staticHintIndex] || poi?.clueSnippet || 'Mira atentamente a tu alrededor.';

  // If Gemini is available, generate immersive hint in narrator's voice!
  if (ai && riddle && story) {
    try {
      const guidanceByLevel = {
        1: 'Orientación general (35% de pista). Da una referencia sutil sobre la naturaleza del objeto o concepto, sin rozar la respuesta.',
        2: 'Pista del método o contexto (70% de pista). Explica cómo razonar el enigma o dónde fijar la vista exactamente.',
        3: 'Pista decisiva (100% de pista). Muy clara y directa, casi reveladora pero con encanto literario.',
      }[targetLevel];

      const prompt = `Actúa como ${story.narratorName} (${story.narratorRole}), narrador de la historia "${story.title}". Tono: ${story.narratorTone || 'Inmersivo'}.
Estás guiando al jugador en el punto "${poi?.name || 'el sendero'}".
El acertijo actual es: "${riddle.question}".
La respuesta secreta es: "${riddle.answer}".
El jugador solicita una pista de Nivel ${targetLevel}: ${guidanceByLevel}.
Genera una pista breve (1 a 2 oraciones máximo) hablando en primera persona como el personaje.
NUNCA digas directamente la palabra de la respuesta exacta en el nivel 1 o 2.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      if (response && response.text) {
        hintText = response.text.trim();
      }
    } catch (err) {
      console.error('Gemini hint generation error, using fallback:', err);
    }
  }

  if (!hintText) {
    hintText = staticFallback;
  }

  // Deduct small points penalty for hints (Level 1: -5, Level 2: -15, Level 3: -30)
  const penalty = targetLevel === 1 ? 5 : targetLevel === 2 ? 15 : 30;
  session.points = Math.max(0, session.points - penalty);

  const hintItem = {
    poiId: currentPoiId,
    level: targetLevel,
    text: hintText,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  session.hintHistory.push(hintItem);
  session.lastActive = new Date().toISOString();
  saveSessions(sessions);

  res.json({
    hint: hintText,
    level: targetLevel,
    pointsPenalty: penalty,
    currentPoints: session.points,
    narratorName: story?.narratorName || 'Guía del Bosque',
  });
});

// 10. Chat with Guide / Narrator
app.post('/api/sessions/:code/chat', async (req: Request, res: Response) => {
  const code = req.params.code.toUpperCase();
  const session = sessions[code];
  if (!session) {
    return res.status(404).json({ error: 'Partida no encontrada' });
  }

  const pack = forestPacks.find(p => p.id === session.forestPackId);
  const story = pack?.stories.find(s => s.id === session.storyId);
  const currentPoiId = session.routePoiIds[session.currentPoiIndex];
  const poi = pack?.pois.find(p => p.id === currentPoiId);

  const { message } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Mensaje vacío' });
  }

  // Record player message
  session.messages.push({
    id: `msg-p-${Date.now()}`,
    sender: 'player',
    text: message,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  });

  let replyText = '';

  if (ai && story) {
    try {
      const prompt = `Eres ${story.narratorName}, ${story.narratorRole} en la aventura "${story.title}". Tono: ${story.narratorTone || 'Evocador y protector'}.
El jugador está explorando el bosque y actualmente se encuentra en "${poi?.name || 'un claro del bosque'}".
Descripción del lugar: "${poi?.description || ''}".
El jugador te dice: "${message}".
Responde en 1 o 2 oraciones en español, metido en tu personaje. Ofrece sabiduría, ánimo o una metáfora sobre el bosque. No rompas la cuarta pared.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      if (response && response.text) {
        replyText = response.text.trim();
      }
    } catch (err) {
      console.error('Gemini chat error:', err);
    }
  }

  if (!replyText) {
    const fallbacks = [
      `Escucha con atención el crujido de las hojas bajo tus pies en ${poi?.name || 'este rincón'}. El bosque siempre recompensa a quien sabe esperar.`,
      `El sendero guarda secretos que sólo los ojos pacientes pueden advertir. Sigue adelante con valor.`,
      `Las señales están en la piedra, en la madera y en el agua. Abre bien los sentidos.`,
    ];
    replyText = fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }

  const guideMsg = {
    id: `msg-n-${Date.now()}`,
    sender: 'narrator' as const,
    text: replyText,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  session.messages.push(guideMsg);
  session.lastActive = new Date().toISOString();
  saveSessions(sessions);

  res.json({ reply: guideMsg });
});

// 11. Update Player Location
app.post('/api/sessions/:code/location', (req: Request, res: Response) => {
  const code = req.params.code.toUpperCase();
  const session = sessions[code];
  if (!session) {
    return res.status(404).json({ error: 'Partida no encontrada' });
  }

  const { lat, lng } = req.body;
  if (typeof lat === 'number' && typeof lng === 'number') {
    session.lat = lat;
    session.lng = lng;
    session.lastActive = new Date().toISOString();
    saveSessions(sessions);
  }

  res.json({ success: true });
});

// 11b. Abandon Session (Mark as abandoned)
app.post('/api/sessions/:code/abandon', (req: Request, res: Response) => {
  const code = req.params.code.toUpperCase();
  const session = sessions[code];
  if (!session) {
    return res.status(404).json({ error: 'Partida no encontrada' });
  }

  session.status = 'abandoned';
  session.lastActive = new Date().toISOString();
  saveSessions(sessions);

  res.json({ success: true, session });
});

// 12. Submit Rating & Feedback
app.post('/api/sessions/:code/feedback', (req: Request, res: Response) => {
  const code = req.params.code.toUpperCase();
  const session = sessions[code];
  if (!session) {
    return res.status(404).json({ error: 'Partida no encontrada' });
  }

  const { rating, comment } = req.body;
  session.rating = typeof rating === 'number' ? rating : 5;
  session.feedback = comment || '';

  const pack = forestPacks.find(p => p.id === session.forestPackId);
  const story = pack?.stories.find(s => s.id === session.storyId);

  const fbItem: PlayerFeedback = {
    id: `fb-${Date.now()}`,
    sessionCode: code,
    forestPackId: session.forestPackId,
    playerName: session.name,
    storyTitle: story?.title || 'Aventura en el bosque',
    rating: session.rating,
    comment: session.feedback || '',
    date: new Date().toLocaleDateString('es-ES'),
  };

  feedbackList.unshift(fbItem);
  saveFeedback(feedbackList);
  saveSessions(sessions);

  res.json({ success: true });
});

// 13. Admin: Live Sessions (Admin Only)
app.get('/api/admin/sessions', requireAdmin, (_req: Request, res: Response) => {
  const list = Object.values(sessions).sort(
    (a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()
  );
  res.json(list);
});

// 14. Admin: Broadcast / Send Message to Session (Admin Only)
app.post('/api/admin/sessions/:code/message', requireAdmin, (req: Request, res: Response) => {
  const code = req.params.code.toUpperCase();
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Texto requerido' });
  }

  if (code === 'ALL') {
    Object.values(sessions).forEach(sess => {
      sess.messages.push({
        id: `msg-adm-${Date.now()}-${Math.random()}`,
        sender: 'admin',
        text: `[Aviso del Director del Bosque]: ${text}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    });
    saveSessions(sessions);
    return res.json({ success: true, count: Object.keys(sessions).length });
  }

  const session = sessions[code];
  if (!session) {
    return res.status(404).json({ error: 'Partida no encontrada' });
  }

  session.messages.push({
    id: `msg-adm-${Date.now()}`,
    sender: 'admin',
    text: `[Mensaje de Organización]: ${text}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  });

  saveSessions(sessions);
  res.json({ success: true });
});

// 15. Admin: Stats & Feedback (Admin Only)
app.get('/api/admin/stats', requireAdmin, (_req: Request, res: Response) => {
  const allSessions = Object.values(sessions);
  const totalSessions = allSessions.length;
  const completedSessions = allSessions.filter(s => s.status === 'completed').length;
  const activeSessions = allSessions.filter(s => s.status === 'active').length;

  const totalRating = feedbackList.reduce((acc, f) => acc + (f.rating || 5), 0);
  const avgRating = feedbackList.length > 0 ? (totalRating / feedbackList.length).toFixed(1) : '5.0';

  const storyCount: Record<string, number> = {};
  allSessions.forEach(s => {
    storyCount[s.storyId] = (storyCount[s.storyId] || 0) + 1;
  });

  res.json({
    totalSessions,
    completedSessions,
    activeSessions,
    avgRating,
    totalFeedback: feedbackList.length,
    recentFeedback: feedbackList.slice(0, 20),
    storyDistribution: storyCount,
  });
});

// 16. AI Assistant: Draft new Forest Pack from brief description (Admin Only)
app.post('/api/ai/generate-forest', requireAdmin, async (req: Request, res: Response) => {
  const { promptText, baseLat, baseLng } = req.body;
  if (!promptText) {
    return res.status(400).json({ error: 'Se requiere una descripción del bosque' });
  }

  const centerLat = typeof baseLat === 'number' ? baseLat : 40.4168;
  const centerLng = typeof baseLng === 'number' ? baseLng : -3.7038;

  if (ai) {
    try {
      const systemInstruction = `Eres un diseñador de side quests de misterio y naturaleza al aire libre en España y Europa.
Genera un paquete de bosque completo en formato JSON con:
- name: nombre evocador del bosque
- description: breve descripción mágica o histórica
- pois: array de 4 puntos de interés geolocalizados cerca de las coordenadas centrales lat=${centerLat}, lng=${centerLng} (desviaciones de +-0.003). Cada uno con id, name, description, lat, lng, emoji, clueSnippet.
- stories: array con 1 historia envolvente (id, title, icon, summary, narrative, mission, narratorName, narratorRole, narratorTone).
- riddles: array con 4 acertijos (1 por POI) adecuados para la historia y de dificultad novato o explorador. Cada acertijo debe tener id, poiId, storyId, name, difficulty, question, options (array de 3-4 opciones), answer, points (100-150), staticHints (array de 3 strings con pistas progresivas).
- sceneNarratives: objeto mapa donde las claves son \`\${storyId}_\${poiId}\` y los valores son textos de ambientación.

Devuelve EXCLUSIVAMENTE el objeto JSON válido.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Crea un paquete de bosque basado en esta idea: "${promptText}". Coordenadas centrales: lat ${centerLat}, lng ${centerLng}.`,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
        },
      });

      if (response && response.text) {
        const generated = JSON.parse(response.text);
        const packId = (generated.name || 'nuevo-bosque')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '') + '-' + Date.now().toString().slice(-4);

        const fullPack: ForestPack = {
          id: packId,
          name: generated.name || 'Bosque Misterioso',
          country: 'Local',
          description: generated.description || promptText,
          centerLat,
          centerLng,
          coverImageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80',
          isPublished: true,
          pois: generated.pois || [],
          routePresets: {
            '30min': (generated.pois || []).slice(0, 2).map((p: any) => p.id),
            '1h': (generated.pois || []).slice(0, 3).map((p: any) => p.id),
            '1.5h': (generated.pois || []).map((p: any) => p.id),
            '2h': (generated.pois || []).map((p: any) => p.id),
          },
          stories: generated.stories || [],
          riddles: generated.riddles || [],
          sceneNarratives: generated.sceneNarratives || {},
        };

        return res.json(fullPack);
      }
    } catch (err) {
      console.error('AI draft generation error:', err);
    }
  }

  // Fallback programmatic generation if no Gemini key or offline
  const fallbackId = 'bosque-local-' + Date.now().toString().slice(-4);
  const fallbackPack: ForestPack = {
    id: fallbackId,
    name: 'Ruta Natural: ' + promptText.slice(0, 25),
    country: 'Local',
    description: promptText,
    centerLat,
    centerLng,
    coverImageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80',
    isPublished: true,
    pois: [
      {
        id: 'poi-1',
        name: 'El Árbol Centenario',
        description: 'Punto de partida del sendero arbolado.',
        lat: centerLat + 0.001,
        lng: centerLng - 0.001,
        emoji: '🌳',
        clueSnippet: 'Observa la corteza expuesta al sol matutino.',
      },
      {
        id: 'poi-2',
        name: 'El Manantial Oculto',
        description: 'Piedras cubiertas de musgo donde brota agua.',
        lat: centerLat + 0.002,
        lng: centerLng + 0.001,
        emoji: '💧',
        clueSnippet: 'El sonido del agua te guiará entre las ramas.',
      },
      {
        id: 'poi-3',
        name: 'El Mirador del Risco',
        description: 'Vistas panorámicas hacia el horizonte.',
        lat: centerLat - 0.0015,
        lng: centerLng + 0.002,
        emoji: '🔭',
        clueSnippet: 'Busca el horizonte más despejado hacia el poniente.',
      },
    ],
    routePresets: {
      '30min': ['poi-1', 'poi-2'],
      '1h': ['poi-1', 'poi-2', 'poi-3'],
      '1.5h': ['poi-1', 'poi-2', 'poi-3'],
      '2h': ['poi-1', 'poi-2', 'poi-3'],
    },
    stories: [
      {
        id: 'exploracion-local',
        title: 'Los Secretos del Sendero',
        icon: '🧭',
        summary: 'Una aventura de orientación y observación natural.',
        narrative: 'El sendero oculta detalles que pasan desapercibidos a los caminantes apresurados.',
        mission: 'Encuentra los elementos señalados y supera las pruebas de observación.',
        narratorName: 'Guarda Forestal',
        narratorRole: 'Protector de la flora y fauna local',
        narratorTone: 'Práctico y pedagógico',
      },
    ],
    riddles: [
      {
        id: 'rid-1',
        poiId: 'poi-1',
        storyId: 'exploracion-local',
        name: 'La Prueba del Árbol',
        difficulty: 'novato',
        question: '¿Qué ser vivo produce la mayor parte del oxígeno y madera en este claro?',
        options: ['Los árboles y plantas', 'Las rocas calcáreas', 'La brisa del viento'],
        answer: 'Los árboles y plantas',
        points: 100,
        staticHints: ['Son organismos vegetales con clorofila.', 'Realizan la fotosíntesis.', 'Son los árboles y plantas.'],
      },
      {
        id: 'rid-2',
        poiId: 'poi-2',
        storyId: 'exploracion-local',
        name: 'El Ciclo del Agua',
        difficulty: 'novato',
        question: '¿De dónde proviene principalmente el agua subterránea que alimenta este manantial?',
        options: ['De las lluvias filtradas en la montaña', 'Del deshielo de otro planeta', 'De tuberías de plástico'],
        answer: 'De las lluvias filtradas en la montaña',
        points: 100,
        staticHints: ['Cae de las nubes sobre el monte.', 'Se filtra por la tierra y la roca caliza.', 'De las lluvias filtradas en la montaña.'],
      },
      {
        id: 'rid-3',
        poiId: 'poi-3',
        storyId: 'exploracion-local',
        name: 'Orientación Solar',
        difficulty: 'novato',
        question: '¿Por qué punto cardinal se oculta el sol al atardecer en el mirador?',
        options: ['Oeste', 'Norte', 'Este'],
        answer: 'Oeste',
        points: 100,
        staticHints: ['Es el lado opuesto al amanecer.', 'El sol nace por el Este y se pone por...', 'Oeste.'],
      },
    ],
    sceneNarratives: {
      'exploracion-local_poi-1': 'Llegas bajo la frondosa copa del árbol centenario. La sombra invita a respirar hondo.',
      'exploracion-local_poi-2': 'El rumor fresco del manantial te recibe entre las piedras húmedas.',
      'exploracion-local_poi-3': 'El mirador abre el paisaje ante tus ojos, donde el bosque abraza el valle.',
    },
  };

  res.json(fallbackPack);
});

// 17. Get all characters across forest packs
app.get('/api/characters', (_req: Request, res: Response) => {
  const characters: Array<{
    id: string;
    forestPackId: string;
    forestName: string;
    title: string;
    narratorName: string;
    narratorRole: string;
    narratorTone?: string;
    narratorAvatar?: string;
    voiceName?: string;
    characterBio?: string;
    characterGreeting?: string;
  }> = [];

  forestPacks.forEach((pack) => {
    pack.stories.forEach((story) => {
      characters.push({
        id: story.id,
        forestPackId: pack.id,
        forestName: pack.name,
        title: story.title,
        narratorName: story.narratorName || story.narrator?.name || 'Guía del Bosque',
        narratorRole: story.narratorRole || story.narrator?.role || 'Compañero de ruta',
        narratorTone: story.narratorTone || story.narrator?.tone,
        narratorAvatar: story.narratorAvatar || story.narrator?.avatarEmoji || '🧙‍♂️',
        voiceName: story.voiceName || (story.narrator?.ttsVoice as any) || 'Zephyr',
        characterBio: story.characterBio,
        characterGreeting: story.characterGreeting,
      });
    });
  });

  res.json(characters);
});

// -------------------------------------------------------------
// Vite Middleware / Static Production Serving & WebSocket Server
// -------------------------------------------------------------
async function startServer() {
  const server = http.createServer(app);

  // Setup WebSocket server for Gemini 3.8 Live API
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    const url = new URL(request.url || '', `http://${request.headers.host || 'localhost'}`);
    if (url.pathname === '/live' || url.pathname === '/api/live') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  });

  wss.on('connection', async (clientWs: WebSocket, request: http.IncomingMessage) => {
    const url = new URL(request.url || '', `http://${request.headers.host || 'localhost'}`);
    const sessionCode = url.searchParams.get('sessionCode')?.toUpperCase() || '';
    const storyIdParam = url.searchParams.get('storyId') || '';
    const poiIdParam = url.searchParams.get('poiId') || '';
    const forestPackIdParam = url.searchParams.get('forestPackId') || '';

    const session = sessions[sessionCode];
    const forestPackId = session?.forestPackId || forestPackIdParam || forestPacks[0]?.id;
    const pack = forestPacks.find((p) => p.id === forestPackId) || forestPacks[0];

    const targetStoryId = session?.storyId || storyIdParam || pack?.stories[0]?.id;
    const story = pack?.stories.find((s) => s.id === targetStoryId) || pack?.stories[0];

    const currentPoiId = session?.routePoiIds[session?.currentPoiIndex || 0] || poiIdParam || pack?.pois[0]?.id;
    const poi = pack?.pois.find((p) => p.id === currentPoiId) || pack?.pois[0];

    const riddle = pack?.riddles.find(
      (r) => r.poiId === currentPoiId && r.storyId === targetStoryId
    ) || pack?.riddles.find((r) => r.poiId === currentPoiId);

    const voiceName = (story?.voiceName || 'Zephyr') as 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';

    if (!ai) {
      clientWs.send(
        JSON.stringify({
          type: 'status',
          status: 'simulated',
          message: 'Modo audio en tiempo real activo en emulación (sin API key de Gemini Live).',
        })
      );
      return;
    }

    try {
      const systemInstruction = `Actúa SIEMPRE como ${story?.narratorName || 'Guía del Bosque'} (${story?.narratorRole || 'Personaje de la historia'}), un personaje inmersivo del bosque de "${pack?.name}".
Personalidad y tono: ${story?.narratorTone || 'Cálido, aventurero y sugerente'}.
Biografía del personaje: ${story?.characterBio || 'Un ser que conoce cada sendero y misterio del lugar.'}.
El explorador se llama "${session?.name || 'Aventurero'}" y está en una ruta a pie por el bosque.
Actualmente se encuentra físicamente en el punto de interés: "${poi?.name || 'el sendero'}".
Descripción del punto: "${poi?.description || ''}".
Enigma de este punto: "${riddle?.question || 'Observar la naturaleza'}".
Solución secreta: "${riddle?.answer || ''}".
Pistas contextuales: "${poi?.clueSnippet || ''}".

REGLAS DE ORO PARA LA CONVERSACIÓN POR VOZ:
1. Habla en español de manera oral, conversacional y espontánea, en 1 a 2 oraciones por turno (máximo 3).
2. NUNCA rompas el personaje. Eres el personaje de carne y hueso (o espíritu) en el bosque, NO una IA ni un programa de ordenador.
3. Si el jugador te pide ayuda con el enigma, dale pistas sensoriales de lo que tiene a su alrededor (la corteza, el río, las piedras, el viento), pero NO le reveles la respuesta directamente.
4. Si el jugador acierta o menciona la solución correcta, felicítale efusivamente como el personaje.
5. Responde con calidez y pasión por este bosque.`;

      const liveSession = await ai.live.connect({
        model: 'gemini-3.8-live',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName },
            },
          },
          systemInstruction,
          outputAudioTranscription: {},
        },
        callbacks: {
          onmessage: (message: LiveServerMessage) => {
            const parts = message.serverContent?.modelTurn?.parts || [];
            for (const part of parts) {
              if (part.inlineData?.data) {
                if (clientWs.readyState === WebSocket.OPEN) {
                  clientWs.send(
                    JSON.stringify({
                      type: 'audio',
                      audio: part.inlineData.data,
                    })
                  );
                }
              }
              if (part.text) {
                if (clientWs.readyState === WebSocket.OPEN) {
                  clientWs.send(
                    JSON.stringify({
                      type: 'transcript',
                      text: part.text,
                      sender: 'character',
                    })
                  );
                }
              }
            }

            if (message.serverContent?.interrupted) {
              if (clientWs.readyState === WebSocket.OPEN) {
                clientWs.send(JSON.stringify({ type: 'interrupted', interrupted: true }));
              }
            }
          },
          onclose: () => {
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ type: 'status', status: 'closed' }));
            }
          },
          onerror: (err) => {
            console.error('Gemini Live session error:', err);
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ type: 'error', message: String(err) }));
            }
          },
        },
      });

      clientWs.send(
        JSON.stringify({
          type: 'connected',
          characterName: story?.narratorName,
          characterRole: story?.narratorRole,
          characterAvatar: story?.narratorAvatar,
          voiceName,
          greeting: story?.characterGreeting || `¡Bienvenido a ${poi?.name}!`,
        })
      );

      clientWs.on('message', (data) => {
        try {
          const parsed = JSON.parse(data.toString());
          if (parsed.type === 'audio' && parsed.audio) {
            liveSession.sendRealtimeInput({
              audio: { data: parsed.audio, mimeType: 'audio/pcm;rate=16000' },
            });
          } else if (parsed.type === 'text' && parsed.text) {
            liveSession.sendRealtimeInput({
              text: parsed.text,
            });
          }
        } catch (err) {
          console.error('Error sending input to Gemini Live:', err);
        }
      });

      clientWs.on('close', () => {
        try {
          liveSession.close();
        } catch (e) {}
      });
    } catch (err: any) {
      console.error('Failed to connect to Gemini 3.8 Live API:', err);
      clientWs.send(
        JSON.stringify({
          type: 'error',
          message: 'Error al iniciar sesión de voz en directo con el personaje: ' + err.message,
        })
      );
    }
  });

  if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    // Mount Vite middlewares in development
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Enigma del Bosque server + Gemini Live WebSocket running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
