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
import { findBestRiddle } from './src/utils/difficultyFallback';

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
  // Contraseña de admin desactivada temporalmente a petición del usuario
  return next();
}

// -------------------------------------------------------------
// REST API Endpoints
// -------------------------------------------------------------

// Admin Password Verification (Sin contraseña requerida por el momento)
app.post('/api/admin/verify', (req: Request, res: Response) => {
  return res.json({ success: true, token: 'open-admin' });
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
    phase: 'in_transit',
    hasArrivedAtPoi: false,
    collectedRunes: [],
    bonusCompleted: [],
    metaEnigmaSolved: false,
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

// 7bis. Arrive at POI (Sección 6bis: Desbloqueo por GPS 25m/60m o botón "Estoy aquí")
app.post('/api/sessions/:code/arrive', (req: Request, res: Response) => {
  const code = req.params.code.toUpperCase();
  const session = sessions[code];
  if (!session) {
    return res.status(404).json({ error: 'Partida no encontrada' });
  }

  session.hasArrivedAtPoi = true;
  session.phase = 'at_poi';
  session.lastActive = new Date().toISOString();
  saveSessions(sessions);

  res.json({ session, unlocked: true });
});

// 7ter. Continue Transit (Sección 6bis: Salto al siguiente hito tras recompensa)
app.post('/api/sessions/:code/continue-transit', (req: Request, res: Response) => {
  const code = req.params.code.toUpperCase();
  const session = sessions[code];
  if (!session) {
    return res.status(404).json({ error: 'Partida no encontrada' });
  }

  if (session.currentPoiIndex + 1 < session.routePoiIds.length) {
    session.currentPoiIndex++;
    session.hasArrivedAtPoi = false;
    session.phase = 'in_transit';
  } else {
    session.status = 'completed';
  }

  session.lastActive = new Date().toISOString();
  saveSessions(sessions);

  res.json({ session, isComplete: session.status === 'completed' });
});

// 8. Submit Answer to Current Riddle (Soporte 6ter para todos los tipos)
app.post('/api/sessions/:code/answer', (req: Request, res: Response) => {
  const code = req.params.code.toUpperCase();
  const session = sessions[code];
  if (!session) {
    return res.status(404).json({ error: 'Partida no encontrada' });
  }

  if (session.status === 'completed' && !session.metaEnigmaSolved) {
    // Permitir continuar si queda meta-enigma
  }

  const pack = forestPacks.find(p => p.id === session.forestPackId);
  if (!pack) {
    return res.status(404).json({ error: 'Bosque no encontrado' });
  }

  const currentPoiId = session.routePoiIds[session.currentPoiIndex];
  const { userAnswer, riddleId } = req.body;
  if (!userAnswer || typeof userAnswer !== 'string') {
    return res.status(400).json({ error: 'Respuesta vacía' });
  }

  // Find riddle (by riddleId if provided for bonus, or with difficulty fallback rule)
  let riddle = riddleId ? pack.riddles.find(r => r.id === riddleId) : null;
  if (!riddle) {
    riddle = findBestRiddle(pack.riddles, currentPoiId, session.storyId, session.difficulty);
  }

  if (!riddle) {
    // Si no hay enigma, avanzar a recompensa
    if (!session.completedPois.includes(currentPoiId)) {
      session.completedPois.push(currentPoiId);
    }
    session.phase = 'reward';
    saveSessions(sessions);
    return res.json({
      session,
      isCorrect: true,
      pointsEarned: 100,
      phase: 'reward',
      isComplete: session.currentPoiIndex + 1 >= session.routePoiIds.length,
    });
  }

  // Comprobar respuesta según tipo de enigma
  let isCorrect = false;
  const normUser = normalizeAnswer(userAnswer);
  const normExpected = normalizeAnswer(riddle.answer || '');
  const acceptedNorm = (riddle.acceptedAnswers || []).map(normalizeAnswer);

  if (riddle.type === 'photo' || riddle.type === 'audio_record' || riddle.type === 'video' || riddle.type === 'mimic') {
    // Retos interactivos de foto, audio, vídeo o mímica
    isCorrect = true;
  } else if (riddle.type === 'compass') {
    // Brújula alineada
    isCorrect = normUser.includes('alinead') || normUser === '0' || normUser === 'norte' || normUser === normExpected;
  } else if (riddle.type === 'count') {
    const numUser = parseInt(userAnswer, 10);
    const target = riddle.targetCount || parseInt(riddle.answer || '0', 10) || 0;
    const tolerance = riddle.countTolerance ?? 1;
    isCorrect = !isNaN(numUser) && Math.abs(numUser - target) <= tolerance;
  } else if (riddle.type === 'order') {
    const correctItems = riddle.options || riddle.orderItems || [];
    const expectedStr = correctItems.map(normalizeAnswer).join(', ');
    const expectedArrowStr = correctItems.map(normalizeAnswer).join(' -> ');
    isCorrect =
      normUser === expectedStr ||
      normUser === expectedArrowStr ||
      normUser === normExpected ||
      acceptedNorm.includes(normUser);
  } else {
    // Multiple choice, test, text, open_text, cipher, etc.
    const isIndexMatch =
      riddle.correctIndex !== undefined &&
      riddle.options &&
      riddle.options[riddle.correctIndex] &&
      normalizeAnswer(riddle.options[riddle.correctIndex]) === normUser;

    isCorrect = Boolean(
      normUser === normExpected ||
      acceptedNorm.includes(normUser) ||
      isIndexMatch ||
      (riddle.options && riddle.correctIndex !== undefined && (userAnswer === String(riddle.correctIndex) || userAnswer === String.fromCharCode(65 + riddle.correctIndex)))
    );
  }

  if (isCorrect) {
    const isBonus = Boolean(riddle.isBonus);
    const pointsAwarded = isBonus
      ? (riddle.bonusPoints || 50)
      : (riddle.points || 100);

    session.points += pointsAwarded;
    session.lastActive = new Date().toISOString();

    if (isBonus) {
      session.bonusCompleted = session.bonusCompleted || [];
      if (!session.bonusCompleted.includes(riddle.id)) {
        session.bonusCompleted.push(riddle.id);
      }
      saveSessions(sessions);
      return res.json({
        session,
        isCorrect: true,
        isBonus: true,
        pointsEarned: pointsAwarded,
        message: '¡Reto extra completado! Has ganado puntos de bonificación.',
      });
    }

    if (!session.completedPois.includes(currentPoiId)) {
      session.completedPois.push(currentPoiId);
    }

    // Agregar runa mística para el meta-enigma final
    let revealedRune: string | undefined = riddle.metaRune;
    if (!revealedRune) {
      // Asignar letra basada en el índice para garantizar meta-enigma
      const keyword = pack.metaEnigma?.keyword || 'ROBLE';
      revealedRune = keyword[session.currentPoiIndex % keyword.length];
    }

    session.collectedRunes = session.collectedRunes || [];
    if (revealedRune && !session.collectedRunes.some(r => r.poiId === currentPoiId)) {
      session.collectedRunes.push({
        letter: revealedRune,
        poiId: currentPoiId,
        riddleName: riddle.name,
        revealedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    }

    session.phase = 'reward';
    saveSessions(sessions);

    const isLastPoi = session.currentPoiIndex + 1 >= session.routePoiIds.length;

    return res.json({
      session,
      isCorrect: true,
      pointsEarned: pointsAwarded,
      phase: 'reward',
      metaRune: revealedRune,
      isComplete: isLastPoi,
      message: '¡Excelente deducción! Has resuelto el enigma del lugar.',
    });
  } else {
    return res.json({
      session,
      isCorrect: false,
      message: 'No es la respuesta correcta. Observa con más calma tu entorno o pide una pista al guía.',
    });
  }
});

// 8bis. Resolver Meta-Enigma Final
app.post('/api/sessions/:code/meta-enigma', (req: Request, res: Response) => {
  const code = req.params.code.toUpperCase();
  const session = sessions[code];
  if (!session) {
    return res.status(404).json({ error: 'Partida no encontrada' });
  }

  const pack = forestPacks.find(p => p.id === session.forestPackId);
  const targetWord = pack?.metaEnigma?.keyword || 'ROBLE';
  const { answer } = req.body;

  if (normalizeAnswer(answer) === normalizeAnswer(targetWord)) {
    session.metaEnigmaSolved = true;
    session.points += 200;
    session.status = 'completed';
    session.lastActive = new Date().toISOString();
    saveSessions(sessions);

    return res.json({
      session,
      isCorrect: true,
      pointsEarned: 200,
      message: pack?.metaEnigma?.successNarrative || '¡Has descifrado la palabra sagrada del bosque!',
    });
  }

  res.json({
    session,
    isCorrect: false,
    message: 'Esa no es la palabra sagrada. Revisa las letras que has reunido en tu códice.',
  });
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

  const isFrayBotijo = story?.id === 'fraile-botijo' || story?.narratorName?.toLowerCase().includes('botijo');
  const isCronicon = story?.id === 'guardian-iregua' || story?.narratorName?.toLowerCase().includes('cronicón') || story?.narratorName?.toLowerCase().includes('cronicon');
  const isChucho = story?.id === 'banda-palomar' || story?.narratorName?.toLowerCase().includes('chucho') || story?.narratorName?.toLowerCase().includes('palomo');
  const isZorbo = story?.id === 'expediente-zorbo' || story?.narratorName?.toLowerCase().includes('zorbo');
  const isAnselmo = story?.narratorName?.toLowerCase().includes('anselmo');
  const isJean = story?.narratorName?.toLowerCase().includes('jean') || story?.narratorName?.toLowerCase().includes('silence');
  const isPierre = story?.narratorName?.toLowerCase().includes('pierre');
  const isSylvaine = story?.narratorName?.toLowerCase().includes('sylvaine');
  const isDuendecillo = story?.narratorName?.toLowerCase().includes('duende') || story?.narratorName?.toLowerCase().includes('roble');
  const isOffenseReport = /ofendido|reportar|chiste|ofensa|disculpa|perd[oó]n/i.test(message);

  if (isFrayBotijo && isOffenseReport) {
    replyText = `¡Ostras, chaval! ¡Mil perdones de rodillas ante la Virgen de Villavieja! *eructo* ¡Eso ha sido el Espíritu Santo pidiendo clemencia! No era mi intención molestar, tronco, que a veces a este monje de 1387 se le calienta la boca con el orujo... ¡Venga, borrón y cuenta nueva! Tómate un trago virtual de este buen vino de Rioja a mi salud 🍷, que las penas con pan y vino son menos penas. ¡Salud y seguimos la senda!`;
  } else if (ai && story) {
    try {
      let prompt = '';
      if (isFrayBotijo) {
        prompt = `Eres Fray Botijo, el fantasma de un monje borracho que murió ahogado en un barril de vino en 1387 en el Monasterio de San Millán y ahora vaga por Nalda (La Rioja).
REGLAS OBLIGATORIAS:
- Hablas como un tabernero medieval cachondo.
- Usas muletillas: "chaval", "compi", "tronco", "¡ay, perdón, se me escapó!", "*eructo*", "¡eso ha sido el Espíritu Santo!".
- Cuentas chistes verdes pero SIN ser explícito: picante, no obsceno. Humor de taberna medieval, elegante y nunca vulgar ni pornográfico.
- Te ríes de curas, obispos, santos y del Papa, pero SIN ofender a la gente corriente ni a colectivos.
- Te quejas de que no has ido a misa en 600 años.
- SIEMPRE das el dato histórico correcto sobre Nalda al final de cada chiste, como si fuera una revelación divina (pero con resaca).
- Solo hablas de Nalda, su patrimonio, historia y el juego. Si te preguntan otra cosa fuera de contexto, respondes: "eso es cosa del obispo, y yo con el obispo no hablo".
- LÍNEAS ROJAS: nada de sexo explícito, nada de insultos a colectivos, nada de violencia real.
- Si el usuario parece ofendido, pide disculpas de inmediato y ofrécele un trago virtual de vino de Rioja.

Lugar actual: "${poi?.name || 'el sendero de Nalda'}".
Descripción: "${poi?.description || ''}".
El jugador dice: "${message}".
Responde en 1 a 3 oraciones en español auténtico metido al 100% en tu personaje.`;
      } else if (isCronicon) {
        prompt = `Eres El Cronicón, un sabio monje copista del siglo XIV del Monasterio de San Millán de la Cogolla que custodia la memoria histórica de Nalda y el valle del Iregua.
REGLAS OBLIGATORIAS:
- Hablas con respeto, templanza, cortesía medieval y citas refranes antiguos.
- Tratas al jugador como a un "aprendiz" o "viajero de la memoria".
- Solo respondes sobre Nalda, su historia, naturaleza y el juego. Si te preguntan algo fuera de tema, rediriges con cortesía y serenidad hacia la aventura en el bosque.
- Eres solemne, bondadoso y gran conocedor del río Iregua, el Castillo de Nalda, el Arco de la Villa, las Cuevas de Los Palomares y la Ermita de Villavieja.

Lugar actual: "${poi?.name || 'el sendero de Nalda'}".
Descripción: "${poi?.description || ''}".
El jugador dice: "${message}".
Responde en 1 o 2 oraciones en español noble y medieval, metido al 100% en tu personaje.`;
      } else if (isChucho) {
        prompt = `Eres Chucho el Palomo, el líder gamberro de la bandada de palomas que anida en las Cuevas de Los Palomares de Nalda (La Rioja).
REGLAS OBLIGATORIAS:
- Hablas como una paloma callejera, pícaro, canalla pero de buen corazón.
- Usas muletillas: "¡oye, plumas!", "¡al loro!", "¡vuelo rasante!", "a vista de pájaro", "¡menudo pichón!".
- Todo lo ves desde las alturas: tejados del castillo, el Arco de la Villa y el agua del río Iregua donde os refrescáis.
- Sabes secretos y detalles históricos reales de Nalda porque llevas generaciones sobrevolándola.
- Odias que te espanten y siempre buscas migas o que el jugador observe bien el entorno.

Lugar actual: "${poi?.name || 'las cornisas de Nalda'}".
Descripción: "${poi?.description || ''}".
El jugador dice: "${message}".
Responde en 1 o 2 oraciones en español coloquial y divertido, metido al 100% en tu personaje.`;
      } else if (isZorbo) {
        prompt = `Eres Zorbo el Marciano, un científico alienígena del cuadrante ZX-4 extraviado en el Valle del Iregua, Nalda (La Rioja).
REGLAS OBLIGATORIAS:
- Tono: Absurdo, cósmico, perplejo y analítico ante las costumbres terrícolas.
- Usas muletillas: "¡Bip-bop!", "¡Por los anillos de Rigel!", "¡Rayos cósmicos!", "humano terrícola".
- Confundes todo con tecnología espacial alienígena: los viñedos son "paneles solares fotosintéticos", las Cuevas de Los Palomares son "cápsulas de hibernación", el Castillo es "rampa de despegue medieval", y el vino es "combustible iónico fermentado".
- Siempre integras datos reales de Nalda pasados por el filtro de tu desternillante teoría alienígena.

Lugar actual: "${poi?.name || 'sector de exploración Nalda'}".
Descripción: "${poi?.description || ''}".
El jugador dice: "${message}".
Responde en 1 o 2 oraciones en español marciano y absurdo, metido al 100% en tu personaje.`;
      } else {
        prompt = `Eres ${story.narratorName}, ${story.narratorRole} en la aventura "${story.title}". Tono: ${story.narratorTone || 'Evocador y protector'}.
El jugador está explorando el bosque y actualmente se encuentra en "${poi?.name || 'un claro del bosque'}".
Descripción del lugar: "${poi?.description || ''}".
El jugador te dice: "${message}".
Responde en 1 o 2 oraciones en español, metido en tu personaje. Ofrece sabiduría, ánimo o una metáfora sobre el bosque. No rompas la cuarta pared.`;
      }

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
    if (isFrayBotijo) {
      const frayFallbacks = [
        `¡Ehhhh, compi! ¿Sabías que en el Castillo de Nalda en 1299 encerraron a Juan Alonso de Haro? Un noble un poco plasta, ¡pero seguro que no tenía tanto aguante con el vino como yo! *eructo* ¡Ay, perdón, se me escapó! ¡Eso ha sido el Espíritu Santo!`,
        `¡Tronco, en estas Cuevas de Los Palomares los monjes vivían como ermitaños en sus hornacinas excavadas antes de que se llenara de palomas! Yo intenté confesar allí a uno, pero se me cayó la bota de vino por el barranco... ¡Hala, sigue el sendero y abre bien los ojos!`,
        `¿Sabes por qué no voy a misa desde 1387, chaval? ¡Porque el obispo me pilló vaciando el tonel de vino bendito! Pero ojo al dato histórico: el Arco de la Villa era la puerta defensiva medieval que guardaba la entrada al pueblo. ¡Venga, otro trago y adelante!`,
        `¡Qué calor hace en el valle del Iregua, tronco! Dice el cura que el agua purifica, pero yo digo que el vino alegra el alma y quita las penas. ¡Ánimo con la prueba de ${poi?.name || 'este rincón'}!`
      ];
      replyText = frayFallbacks[Math.floor(Math.random() * frayFallbacks.length)];
    } else if (isCronicon) {
      const croniconFallbacks = [
        `Bien hallado, aprendiz. "Quien guarda memoria, labra buen camino". En este rincón de ${poi?.name || 'Nalda'}, las piedras del siglo XIII guardan secretos que solo la paciencia revela.`,
        `El cauce del Iregua fluye sin prisa, como debe ser la mirada del buen observador. Atiende a las señales de la piedra, el viento y el agua.`,
        `Dicen las crónicas de San Millán que todo enigma tiene su tiempo de madurar, igual que la uva en la viña riojana. No temas errar, pues el aprendizaje es virtud.`,
        `Bajo el cielo de Cameros, la historia no duerme: espera a quien sepa descifrarla con respeto y perseverancia. Continúa con paso firme.`
      ];
      replyText = croniconFallbacks[Math.floor(Math.random() * croniconFallbacks.length)];
    } else if (isChucho) {
      const chuchoFallbacks = [
        `¡Al loro, plumas! A vista de pájaro se ve clarito: en el siglo XIII el señor de Cameros vigilaba todo el paso del Iregua desde aquí arriba. ¡No te despistes y abre bien los ojos!`,
        `¿Sabías que en Los Palomares antes vivían monjes ermitaños en la roca pelada? Luego llegamos las palomas y montamos el mejor club aéreo de toda La Rioja. ¡Cuida esas migas de pan!`,
        `¡Vuelo rasante por ${poi?.name || 'Nalda'}! Por el Arco de la Villa no pasaba ni un forastero sin que la muralla le pidiera credenciales. ¡Sigue la senda que vas como un rayo!`
      ];
      replyText = chuchoFallbacks[Math.floor(Math.random() * chuchoFallbacks.length)];
    } else if (isZorbo) {
      const zorboFallbacks = [
        `¡Bip-bop! Mis sensores cuánticos calibran que la elevación de ${poi?.name || 'este punto'} en Nalda es perfecta para transmitir ondas al cinturón de asteroides. ¡Prosigue la exploración, terrícola!`,
        `¡Rayos cósmicos! Los nativos de Nalda fermentan uva para crear ese brebaje aromático que llaman vino... ¡Sospecho que es combustible de curvatura de clase 4!`,
        `Registrando coordenadas: Valle del Iregua, 42.3351 latitud. Una base magnífica construida en piedra caliza terrícola. ¡No desistas en descifrar el enigma!`
      ];
      replyText = zorboFallbacks[Math.floor(Math.random() * zorboFallbacks.length)];
    } else if (isAnselmo) {
      const anselmoFallbacks = [
        `¡Qué tal, caminante! En este rincón del pinar las resinas y las jaras cuentan historias de hace décadas. Mira las marcas en la corteza.`,
        `Cuarenta años patrullando estas sendas me enseñaron que la prisa es enemiga del buen rastreador. Fíjate en el suelo y en la dirección del viento.`,
        `Las fuentes de piedra de este monte nunca mienten. Sigue la vereda con paso tranquilo.`
      ];
      replyText = anselmoFallbacks[Math.floor(Math.random() * anselmoFallbacks.length)];
    } else if (isJean) {
      const jeanFallbacks = [
        `Silencio, camarada... En 1944 cada sombra entre los robles del Eau Bourde podía ser un enlace de la Resistencia. Observa la clave tallada en la madera.`,
        `El mensaje está donde convergen los dos caminos. No llames la atención y prosigue tu misión.`,
        `Un buen enlace nunca deja huellas evidentes. Afina la mirada.`
      ];
      replyText = jeanFallbacks[Math.floor(Math.random() * jeanFallbacks.length)];
    } else if (isPierre) {
      const pierreFallbacks = [
        `¡Ah, joven aprendiz! El sonido del agua contra las paletas del molino siempre marcaba el ritmo de la molienda. ¿Has visto el canal de piedra?`,
        `El grano limpio requiere paciencia, igual que este enigma. Revisa las medidas y la madera tallada.`,
        `La corriente del Eau Bourde guarda la memoria de generaciones de molineros. Abre bien los ojos.`
      ];
      replyText = pierreFallbacks[Math.floor(Math.random() * pierreFallbacks.length)];
    } else if (isSylvaine) {
      const sylvaineFallbacks = [
        `Las hojas susurran canciones antiguas si sabes guardar quietud... Este claro del bosque respira vida milenaria.`,
        `El agua clara refleja la verdad de quien busca con nobleza. Atiende al reflejo y a los helechos.`,
        `No busques con la fuerza, sino con la sensibilidad de los sentidos. El bosque te guiará.`
      ];
      replyText = sylvaineFallbacks[Math.floor(Math.random() * sylvaineFallbacks.length)];
    } else if (isDuendecillo) {
      const duendeFallbacks = [
        `¡Je, je, je! ¿Has visto qué bellota tan brillante tengo aquí? ¡El roble más viejo de Canéjan me contó el acertijo esta mañana!`,
        `¡Salta la raíz y busca la señal que pintaron los niños de la escuela! ¡Vas muy bien, explorador!`,
        `¡Una rimilla para el camino: quien busca con alegría, encuentra la pista al mediodía!`
      ];
      replyText = duendeFallbacks[Math.floor(Math.random() * duendeFallbacks.length)];
    } else {
      const fallbacks = [
        `Escucha con atención el crujido de las hojas bajo tus pies en ${poi?.name || 'este rincón'}. El bosque siempre recompensa a quien sabe esperar.`,
        `El sendero guarda secretos que sólo los ojos pacientes pueden advertir. Sigue adelante con valor.`,
        `Las señales están en la piedra, en la madera y en el agua. Abre bien los sentidos.`,
      ];
      replyText = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }
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
      const isFrayBotijo = story?.id === 'fraile-botijo' || story?.narratorName?.toLowerCase().includes('botijo');
      const isCronicon = story?.id === 'guardian-iregua' || story?.narratorName?.toLowerCase().includes('cronicón') || story?.narratorName?.toLowerCase().includes('cronicon');
      const isChucho = story?.id === 'banda-palomar' || story?.narratorName?.toLowerCase().includes('chucho') || story?.narratorName?.toLowerCase().includes('palomo');
      const isZorbo = story?.id === 'expediente-zorbo' || story?.narratorName?.toLowerCase().includes('zorbo');

      let dynamicVoiceName = voiceName;
      if (isFrayBotijo) dynamicVoiceName = 'Charon';
      else if (isCronicon) dynamicVoiceName = 'Fenrir';
      else if (isChucho) dynamicVoiceName = 'Puck';
      else if (isZorbo) dynamicVoiceName = 'Zephyr';

      let systemInstruction = '';
      if (isFrayBotijo) {
        systemInstruction = `Actúa SIEMPRE como Fray Botijo, el fantasma de un monje borracho ahogado en un barril de vino en 1387 en el Monasterio de San Millán, ahora en Nalda.
Personalidad: Tabernero medieval cachondo, irreverente y sabio.
Muletillas a usar: "chaval", "compi", "tronco", "¡ay, perdón, se me escapó!", "*eructo*", "¡eso ha sido el Espíritu Santo!".
El explorador se llama "${session?.name || 'Aventurero'}" y está en "${poi?.name || 'el sendero de Nalda'}".
REGLAS ESENCIALES:
1. Habla como un tabernero medieval chistoso y socarrón, con chistes picantes pero nunca obscenos (humor de taberna, no de prostíbulo).
2. Ríete con cariño de curas, obispos y del Papa, sin ofender a nadie común.
3. Quéjate de que llevas 600 años sin ir a misa.
4. SIEMPRE da el dato histórico real de Nalda al final de cada chiste como una revelación divina con resaca.
5. Si preguntan otra cosa fuera de Nalda: "eso es cosa del obispo, y yo con el obispo no hablo".
6. Si alguien se ofende, pide perdón de rodillas ante la Virgen de Villavieja y ofrécele un trago virtual de vino de Rioja.
7. Habla en 1 o 2 oraciones breves y orales en español.`;
      } else if (isChucho) {
        systemInstruction = `Actúa SIEMPRE como Chucho el Palomo, una paloma gamberra y canalla, líder de la bandada de las Cuevas de Los Palomares de Nalda.
Personalidad: Pícaro callejero, ágil, gamberro y protector de su bandada.
Muletillas: "¡oye, plumas!", "¡al loro!", "¡vuelo rasante!", "a vista de pájaro", "¡menudo pichón!".
El explorador se llama "${session?.name || 'Aventurero'}" y está en "${poi?.name || 'las calles de Nalda'}".
REGLAS:
1. Habla rápido y divertido como un pájaro callejero con experiencia.
2. Comenta los hitos de Nalda desde las alturas (el tejado del castillo, las almenas, las cuevas en la roca).
3. Pide migas de pan y anima a observar las pistas del bosque.
4. Habla en 1 o 2 oraciones orales en español.`;
      } else if (isZorbo) {
        systemInstruction = `Actúa SIEMPRE como Zorbo el Marciano, un científico alienígena del cuadrante ZX-4 cuya nave se estrelló en el Valle del Iregua, Nalda.
Personalidad: Absurdo, cósmico, perplejo y analítico con las costumbres terrícolas.
Muletillas: "¡Bip-bop!", "¡Por las lunas de Rigel!", "¡Rayos cósmicos!", "espécimen humano".
El explorador se llama "${session?.name || 'Aventurero'}" y está en "${poi?.name || 'sector de exploración Nalda'}".
REGLAS:
1. Confunde con humor cósmico los viñedos, cuevas y castillos de Nalda con tecnología espacial.
2. Da el dato histórico de Nalda pero interpretado bajo tu teoría marciana.
3. Habla en 1 o 2 oraciones orales en español.`;
      } else {
        systemInstruction = `Actúa SIEMPRE como ${story?.narratorName || 'Guía del Bosque'} (${story?.narratorRole || 'Personaje de la historia'}), un personaje inmersivo del bosque de "${pack?.name}".
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
      }

      const liveSession = await ai.live.connect({
        model: 'gemini-3.8-live',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: dynamicVoiceName },
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
