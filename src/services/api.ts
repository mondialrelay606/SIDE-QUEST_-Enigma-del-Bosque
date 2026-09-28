import { ForestPack, PlayerSession, PlayerFeedback } from '../types';
import { SEED_FOREST_PACKS } from '../data/seedPacks';

function normalizeAnswer(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'«»]/g, '')
    .trim();
}

function generateSessionCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Local storage keys
const LOCAL_FORESTS_KEY = 'enigma_custom_forests';
const LOCAL_SESSIONS_KEY = 'enigma_local_sessions';
const LOCAL_FEEDBACK_KEY = 'enigma_local_feedback';

function getLocalCustomForests(): ForestPack[] {
  try {
    const raw = localStorage.getItem(LOCAL_FORESTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Error reading custom forests from localStorage:', e);
  }
  return [];
}

function saveLocalCustomForests(packs: ForestPack[]): void {
  try {
    localStorage.setItem(LOCAL_FORESTS_KEY, JSON.stringify(packs));
  } catch (e) {
    console.error('Error saving custom forests to localStorage:', e);
  }
}

function getAllLocalForests(): ForestPack[] {
  const customs = getLocalCustomForests();
  const merged: ForestPack[] = [...SEED_FOREST_PACKS];

  // Overwrite or append customs
  for (const c of customs) {
    const idx = merged.findIndex((f) => f.id === c.id);
    if (idx >= 0) {
      merged[idx] = c;
    } else {
      merged.push(c);
    }
  }
  return merged;
}

function getLocalSession(code: string): PlayerSession | null {
  try {
    const raw = localStorage.getItem(`${LOCAL_SESSIONS_KEY}_${code.toUpperCase()}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}

function saveLocalSession(session: PlayerSession): void {
  try {
    localStorage.setItem(`${LOCAL_SESSIONS_KEY}_${session.code.toUpperCase()}`, JSON.stringify(session));
    // Also track in index
    const indexRaw = localStorage.getItem(LOCAL_SESSIONS_KEY);
    const codes: string[] = indexRaw ? JSON.parse(indexRaw) : [];
    if (!codes.includes(session.code.toUpperCase())) {
      codes.push(session.code.toUpperCase());
      localStorage.setItem(LOCAL_SESSIONS_KEY, JSON.stringify(codes));
    }
  } catch (e) {}
}

export const api = {
  // Admin Authentication State: Contraseña desactivada temporalmente a petición del usuario
  getAdminKey(): string | null {
    return 'open-admin';
  },

  setAdminKey(_key: string): void {
    localStorage.setItem('enigma_admin_key', 'open-admin');
  },

  clearAdminKey(): void {
    // No-op para mantener acceso libre por el momento
  },

  isAdminAuthenticated(): boolean {
    // Acceso directo a administración sin contraseña por el momento
    return true;
  },

  async verifyAdminPassword(_password: string): Promise<boolean> {
    // Acceso siempre concedido
    this.setAdminKey('open-admin');
    return true;
  },

  getAdminHeaders(): Record<string, string> {
    return { 'x-admin-key': 'open-admin' };
  },

  // Forests
  async getForests(admin: boolean = false): Promise<ForestPack[]> {
    try {
      const headers = admin ? this.getAdminHeaders() : {};
      const res = await fetch(`/api/forests${admin ? '?admin=true' : ''}`, { credentials: 'omit', headers });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          // Merge with any custom forests created locally
          const customs = getLocalCustomForests();
          const combined = [...data];
          for (const c of customs) {
            if (!combined.some(f => f.id === c.id)) {
              combined.push(c);
            }
          }
          return admin ? combined : combined.filter(f => f.isPublished !== false);
        }
      }
    } catch (e) {
      console.warn('Backend /api/forests unreachable, using embedded/local forest packs:', e);
    }

    // Fallback: return embedded seed packs + local customs
    const all = getAllLocalForests();
    return admin ? all : all.filter(f => f.isPublished !== false);
  },

  async getForest(id: string): Promise<ForestPack> {
    try {
      const res = await fetch(`/api/forests/${id}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {}

    const all = getAllLocalForests();
    const found = all.find(f => f.id === id);
    if (found) return found;
    throw new Error('Bosque no encontrado');
  },

  async saveForest(pack: ForestPack): Promise<ForestPack> {
    // Always persist locally
    const customs = getLocalCustomForests();
    const idx = customs.findIndex(f => f.id === pack.id);
    if (idx >= 0) {
      customs[idx] = pack;
    } else {
      customs.push(pack);
    }
    saveLocalCustomForests(customs);

    try {
      const res = await fetch('/api/forests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAdminHeaders(),
        },
        body: JSON.stringify(pack),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend saveForest offline, saved in browser localStorage:', e);
    }
    return pack;
  },

  async duplicateForest(id: string): Promise<ForestPack> {
    try {
      const res = await fetch(`/api/forests/${id}/duplicate`, {
        method: 'POST',
        headers: this.getAdminHeaders(),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {}

    const all = getAllLocalForests();
    const original = all.find(f => f.id === id);
    if (!original) throw new Error('Bosque no encontrado para duplicar');

    const duplicateId = `${original.id}-copia-${Date.now().toString(36).substring(4)}`;
    const duplicate: ForestPack = {
      ...JSON.parse(JSON.stringify(original)),
      id: duplicateId,
      name: `${original.name} (Copia)`,
      isPublished: false,
    };

    const customs = getLocalCustomForests();
    customs.push(duplicate);
    saveLocalCustomForests(customs);
    return duplicate;
  },

  async deleteForest(id: string): Promise<void> {
    const customs = getLocalCustomForests().filter(f => f.id !== id);
    saveLocalCustomForests(customs);

    try {
      await fetch(`/api/forests/${id}`, {
        method: 'DELETE',
        headers: this.getAdminHeaders(),
      });
    } catch (e) {}
  },

  // Sessions
  async createSession(payload: {
    forestPackId: string;
    name: string;
    type: 'individual' | 'grupo';
    storyId: string;
    difficulty: string;
    duration: string;
    easyMode?: boolean;
  }): Promise<{ session: PlayerSession; forestPack: ForestPack }> {
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        saveLocalSession(data.session);
        return data;
      }
    } catch (e) {
      console.warn('Backend createSession offline, creating local session:', e);
    }

    // Local fallback session generator
    const pack = await this.getForest(payload.forestPackId);
    const code = generateSessionCode();

    let routePoiIds: string[] = [];
    if (payload.storyId === 'cuentos_encantados' && pack.routePresets?.['cuentos_encantados']) {
      routePoiIds = [...pack.routePresets['cuentos_encantados']];
    } else if (pack.routePresets && pack.routePresets[payload.duration]) {
      routePoiIds = [...pack.routePresets[payload.duration]];
    } else {
      routePoiIds = pack.pois.slice(0, 4).map(p => p.id);
    }

    const story = pack.stories.find(s => s.id === payload.storyId) || pack.stories[0];
    const narratorName = story?.narratorName || 'el guía del bosque';
    const welcomeMsg = `¡Saludos, ${payload.name || 'explorador'}! Soy ${narratorName}. He preparado la senda para tu expedición. Dirígete al primer punto marcado en tu mapa y prepárate a desentrañar los enigmas del bosque.`;

    const session: PlayerSession = {
      code,
      forestPackId: pack.id,
      name: payload.name || 'Aventurero',
      type: payload.type || 'individual',
      storyId: payload.storyId,
      difficulty: (payload.difficulty as any) || 'novato',
      duration: (payload.duration as any) || '1h',
      easyMode: Boolean(payload.easyMode),
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

    saveLocalSession(session);
    return { session, forestPack: pack };
  },

  async getSession(code: string): Promise<{ session: PlayerSession; forestPack: ForestPack }> {
    const normCode = code.toUpperCase();
    try {
      const res = await fetch(`/api/sessions/${normCode}`);
      if (res.ok) {
        const data = await res.json();
        saveLocalSession(data.session);
        return data;
      }
    } catch (e) {}

    const localSess = getLocalSession(normCode);
    if (localSess) {
      const pack = await this.getForest(localSess.forestPackId);
      return { session: localSess, forestPack: pack };
    }
    throw new Error('Código de partida no encontrado');
  },

  async arriveAtPoi(code: string): Promise<{ session: PlayerSession; unlocked: boolean }> {
    const normCode = code.toUpperCase();
    try {
      const res = await fetch(`/api/sessions/${normCode}/arrive`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        saveLocalSession(data.session);
        return data;
      }
    } catch (e) {}

    const session = getLocalSession(normCode);
    if (!session) throw new Error('Partida no encontrada');
    session.hasArrivedAtPoi = true;
    session.phase = 'at_poi';
    session.lastActive = new Date().toISOString();
    saveLocalSession(session);
    return { session, unlocked: true };
  },

  async continueTransit(code: string): Promise<{ session: PlayerSession; isComplete: boolean }> {
    const normCode = code.toUpperCase();
    try {
      const res = await fetch(`/api/sessions/${normCode}/continue-transit`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        saveLocalSession(data.session);
        return data;
      }
    } catch (e) {}

    const session = getLocalSession(normCode);
    if (!session) throw new Error('Partida no encontrada');
    if (session.currentPoiIndex + 1 < session.routePoiIds.length) {
      session.currentPoiIndex++;
      session.hasArrivedAtPoi = false;
      session.phase = 'in_transit';
    } else {
      session.status = 'completed';
    }
    session.lastActive = new Date().toISOString();
    saveLocalSession(session);
    return { session, isComplete: session.status === 'completed' };
  },

  async submitAnswer(code: string, userAnswer: string, riddleId?: string): Promise<{
    session: PlayerSession;
    isCorrect: boolean;
    pointsEarned?: number;
    isComplete?: boolean;
    message?: string;
    phase?: string;
    metaRune?: string;
    isBonus?: boolean;
  }> {
    const normCode = code.toUpperCase();
    try {
      const res = await fetch(`/api/sessions/${normCode}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userAnswer, riddleId }),
      });
      if (res.ok) {
        const data = await res.json();
        saveLocalSession(data.session);
        return data;
      }
    } catch (e) {}

    // Fallback: evaluate locally
    const session = getLocalSession(normCode);
    if (!session) throw new Error('Partida no encontrada');

    const currentPoiId = session.routePoiIds[session.currentPoiIndex];
    const pack = await this.getForest(session.forestPackId);

    let riddle = riddleId ? pack.riddles.find(r => r.id === riddleId) : null;
    if (!riddle) {
      riddle = pack.riddles.find(
        r => r.poiId === currentPoiId && r.storyId === session.storyId && r.difficulty === session.difficulty
      );
    }
    if (!riddle) riddle = pack.riddles.find(r => r.poiId === currentPoiId && r.storyId === session.storyId);
    if (!riddle) riddle = pack.riddles.find(r => r.poiId === currentPoiId);

    if (!riddle) {
      if (!session.completedPois.includes(currentPoiId)) {
        session.completedPois.push(currentPoiId);
      }
      session.phase = 'reward';
      saveLocalSession(session);
      return {
        session,
        isCorrect: true,
        pointsEarned: 100,
        phase: 'reward',
        isComplete: session.currentPoiIndex + 1 >= session.routePoiIds.length
      };
    }

    const normUser = normalizeAnswer(userAnswer);
    const normExpected = normalizeAnswer(riddle.answer);
    const acceptedNorm = (riddle.acceptedAnswers || []).map(normalizeAnswer);

    let isCorrect = false;
    if (riddle.type === 'photo') {
      isCorrect = true;
    } else if (riddle.type === 'compass') {
      isCorrect = normUser.includes('alinead') || normUser === '0' || normUser === 'norte' || normUser === normExpected;
    } else if (riddle.type === 'count') {
      const numUser = parseInt(userAnswer, 10);
      const target = riddle.targetCount || parseInt(riddle.answer, 10) || 0;
      const tolerance = riddle.countTolerance ?? 1;
      isCorrect = !isNaN(numUser) && Math.abs(numUser - target) <= tolerance;
    } else if (riddle.type === 'order') {
      isCorrect = normUser === normExpected || acceptedNorm.includes(normUser);
    } else {
      isCorrect = normUser === normExpected || acceptedNorm.includes(normUser);
    }

    if (isCorrect) {
      const isBonus = Boolean(riddle.isBonus);
      const points = isBonus ? (riddle.bonusPoints || 50) : (riddle.points || 100);
      session.points += points;
      session.lastActive = new Date().toISOString();

      if (isBonus) {
        session.bonusCompleted = session.bonusCompleted || [];
        if (!session.bonusCompleted.includes(riddle.id)) {
          session.bonusCompleted.push(riddle.id);
        }
        saveLocalSession(session);
        return {
          session,
          isCorrect: true,
          isBonus: true,
          pointsEarned: points,
          message: '¡Reto extra completado! Has ganado puntos de bonificación.',
        };
      }

      if (!session.completedPois.includes(currentPoiId)) {
        session.completedPois.push(currentPoiId);
      }

      let revealedRune = riddle.metaRune;
      if (!revealedRune) {
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
      saveLocalSession(session);

      const isLastPoi = session.currentPoiIndex + 1 >= session.routePoiIds.length;

      return {
        session,
        isCorrect: true,
        pointsEarned: points,
        phase: 'reward',
        metaRune: revealedRune,
        isComplete: isLastPoi,
        message: '¡Excelente deducción! Has resuelto el enigma del lugar.',
      };
    } else {
      return {
        session,
        isCorrect: false,
        message: 'No es la respuesta correcta. Observa con calma tu entorno o pide una pista al guía.',
      };
    }
  },

  async solveMetaEnigma(code: string, answer: string): Promise<{
    session: PlayerSession;
    isCorrect: boolean;
    pointsEarned?: number;
    message: string;
  }> {
    const normCode = code.toUpperCase();
    try {
      const res = await fetch(`/api/sessions/${normCode}/meta-enigma`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer }),
      });
      if (res.ok) {
        const data = await res.json();
        saveLocalSession(data.session);
        return data;
      }
    } catch (e) {}

    const session = getLocalSession(normCode);
    if (!session) throw new Error('Partida no encontrada');

    const pack = await this.getForest(session.forestPackId);
    const targetWord = pack.metaEnigma?.keyword || 'ROBLE';

    if (normalizeAnswer(answer) === normalizeAnswer(targetWord)) {
      session.metaEnigmaSolved = true;
      session.points += 200;
      session.status = 'completed';
      session.lastActive = new Date().toISOString();
      saveLocalSession(session);
      return {
        session,
        isCorrect: true,
        pointsEarned: 200,
        message: pack.metaEnigma?.successNarrative || '¡Has descifrado la palabra sagrada del bosque!',
      };
    }

    return {
      session,
      isCorrect: false,
      message: 'Esa no es la palabra sagrada. Revisa las letras que has reunido en tu códice.',
    };
  },

  async requestHint(code: string, level: 1 | 2 | 3): Promise<{
    hint: string;
    level: 1 | 2 | 3;
    pointsPenalty: number;
    currentPoints: number;
    narratorName: string;
  }> {
    const normCode = code.toUpperCase();
    try {
      const res = await fetch(`/api/sessions/${normCode}/hint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level }),
      });
      if (res.ok) {
        const data = await res.json();
        const s = getLocalSession(normCode);
        if (s) {
          s.points = data.currentPoints;
          saveLocalSession(s);
        }
        return data;
      }
    } catch (e) {}

    // Fallback: provide local static hint
    const session = getLocalSession(normCode);
    if (!session) throw new Error('Partida no encontrada');

    const pack = await this.getForest(session.forestPackId);
    const currentPoiId = session.routePoiIds[session.currentPoiIndex];
    const poi = pack.pois.find(p => p.id === currentPoiId);
    const story = pack.stories.find(s => s.id === session.storyId);

    let riddle = pack.riddles.find(
      r => r.poiId === currentPoiId && r.storyId === session.storyId && r.difficulty === session.difficulty
    );
    if (!riddle) riddle = pack.riddles.find(r => r.poiId === currentPoiId);

    const staticHintIndex = level - 1;
    const hintText = riddle?.hints?.[staticHintIndex] || riddle?.staticHints?.[staticHintIndex] || poi?.clueSnippet || 'Mira atentamente a tu alrededor.';
    const penalty = level === 1 ? 5 : level === 2 ? 15 : 30;
    session.points = Math.max(0, session.points - penalty);

    session.hintHistory.push({
      poiId: currentPoiId,
      level,
      text: hintText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
    session.lastActive = new Date().toISOString();
    saveLocalSession(session);

    return {
      hint: hintText,
      level,
      pointsPenalty: penalty,
      currentPoints: session.points,
      narratorName: story?.narratorName || 'Guía del Bosque',
    };
  },

  async sendChatMessage(code: string, message: string): Promise<{
    reply: { id: string; sender: 'narrator'; text: string; timestamp: string };
  }> {
    const normCode = code.toUpperCase();
    try {
      const res = await fetch(`/api/sessions/${normCode}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {}

    const session = getLocalSession(normCode);
    const pack = session ? await this.getForest(session.forestPackId) : null;
    const currentPoiId = session ? session.routePoiIds[session.currentPoiIndex] : null;
    const poi = pack?.pois.find(p => p.id === currentPoiId);

    const fallbacks = [
      `Escucha con atención el crujido de las hojas bajo tus pies en ${poi?.name || 'este rincón'}. El bosque siempre recompensa a quien sabe esperar.`,
      `Observa los detalles ocultos en ${poi?.name || 'tu alrededor'}. Las respuestas están talladas en la naturaleza.`,
      `No te precipites, explorador. La calma es la mejor aliada en los senderos del bosque.`,
      `El viento susurra entre las copas de los árboles... busca lo que otros pasan por alto.`,
    ];
    const replyText = fallbacks[Math.floor(Math.random() * fallbacks.length)];

    const reply = {
      id: `msg-rep-${Date.now()}`,
      sender: 'narrator' as const,
      text: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    if (session) {
      session.messages.push({
        id: `msg-p-${Date.now()}`,
        sender: 'player',
        text: message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
      session.messages.push(reply);
      session.lastActive = new Date().toISOString();
      saveLocalSession(session);
    }

    return { reply };
  },

  async updateLocation(code: string, lat: number, lng: number): Promise<void> {
    const normCode = code.toUpperCase();
    try {
      await fetch(`/api/sessions/${normCode}/location`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lng }),
      });
    } catch (e) {}

    const session = getLocalSession(normCode);
    if (session) {
      session.lat = lat;
      session.lng = lng;
      saveLocalSession(session);
    }
  },

  async abandonSession(code: string): Promise<void> {
    const normCode = code.toUpperCase();
    try {
      await fetch(`/api/sessions/${normCode}/abandon`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (e) {}

    const session = getLocalSession(normCode);
    if (session) {
      session.status = 'abandoned';
      saveLocalSession(session);
    }
  },

  async submitFeedback(code: string, rating: number, comment: string): Promise<void> {
    const normCode = code.toUpperCase();
    try {
      await fetch(`/api/sessions/${normCode}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment }),
      });
    } catch (e) {}

    try {
      const raw = localStorage.getItem(LOCAL_FEEDBACK_KEY);
      const list: PlayerFeedback[] = raw ? JSON.parse(raw) : [];
      list.push({
        id: `fb-${Date.now()}`,
        sessionCode: normCode,
        forestPackId: 'bosque-local',
        playerName: 'Explorador',
        storyTitle: 'Ruta',
        rating,
        comment,
        date: new Date().toISOString(),
      });
      localStorage.setItem(LOCAL_FEEDBACK_KEY, JSON.stringify(list));
    } catch (e) {}
  },

  // Admin Data
  async getAdminSessions(): Promise<PlayerSession[]> {
    try {
      const res = await fetch('/api/admin/sessions', {
        headers: this.getAdminHeaders(),
      });
      if (res.ok) return await res.json();
    } catch (e) {}

    const indexRaw = localStorage.getItem(LOCAL_SESSIONS_KEY);
    const codes: string[] = indexRaw ? JSON.parse(indexRaw) : [];
    const list: PlayerSession[] = [];
    for (const c of codes) {
      const s = getLocalSession(c);
      if (s) list.push(s);
    }
    return list;
  },

  async sendAdminMessage(code: string, text: string): Promise<void> {
    const normCode = code.toUpperCase();
    try {
      await fetch(`/api/admin/sessions/${normCode}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAdminHeaders(),
        },
        body: JSON.stringify({ text }),
      });
    } catch (e) {}

    const session = getLocalSession(normCode);
    if (session) {
      session.messages.push({
        id: `msg-admin-${Date.now()}`,
        sender: 'admin',
        text: `[Mensaje del Organizador]: ${text}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
      saveLocalSession(session);
    }
  },

  async getAdminStats(): Promise<{
    totalSessions: number;
    completedSessions: number;
    activeSessions: number;
    avgRating: string;
    totalFeedback: number;
    recentFeedback: PlayerFeedback[];
    storyDistribution: Record<string, number>;
  }> {
    try {
      const res = await fetch('/api/admin/stats', {
        headers: this.getAdminHeaders(),
      });
      if (res.ok) return await res.json();
    } catch (e) {}

    const sessions = await this.getAdminSessions();
    const completed = sessions.filter(s => s.status === 'completed').length;
    const active = sessions.filter(s => s.status === 'active').length;

    let feedbacks: PlayerFeedback[] = [];
    try {
      const raw = localStorage.getItem(LOCAL_FEEDBACK_KEY);
      if (raw) feedbacks = JSON.parse(raw);
    } catch (e) {}

    const dist: Record<string, number> = {};
    for (const s of sessions) {
      dist[s.storyId] = (dist[s.storyId] || 0) + 1;
    }

    return {
      totalSessions: sessions.length,
      completedSessions: completed,
      activeSessions: active,
      avgRating: feedbacks.length ? (feedbacks.reduce((a, b) => a + b.rating, 0) / feedbacks.length).toFixed(1) : '5.0',
      totalFeedback: feedbacks.length,
      recentFeedback: feedbacks.slice(-10),
      storyDistribution: dist,
    };
  },

  async aiDraftForest(promptText: string, baseLat?: number, baseLng?: number): Promise<ForestPack> {
    try {
      const res = await fetch('/api/ai/generate-forest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAdminHeaders(),
        },
        body: JSON.stringify({ promptText, baseLat, baseLng }),
      });
      if (res.ok) return await res.json();
    } catch (e) {}

    // Fallback template
    const id = `bosque-local-${Date.now().toString(36)}`;
    const lat = baseLat || 44.7645;
    const lng = baseLng || -0.6358;
    return {
      id,
      name: `Ruta: ${promptText.slice(0, 30)}`,
      country: 'España / Local',
      description: `Aventura al aire libre basada en: ${promptText}`,
      centerLat: lat,
      centerLng: lng,
      isPublished: true,
      pois: [
        {
          id: `${id}_poi_1`,
          name: 'Comienzo del Sendero',
          description: 'Punto de reunión inicial para la expedición.',
          lat,
          lng,
          emoji: '🧭',
          clueSnippet: 'Busca el panel informativo o el mojón de inicio.',
        },
        {
          id: `${id}_poi_2`,
          name: 'El Gran Árbol Centenario',
          description: 'Un ejemplar singular que domina el claro.',
          lat: lat + 0.0015,
          lng: lng + 0.001,
          emoji: '🌳',
          clueSnippet: 'Fíjate en las raíces extendidas hacia el este.',
        },
      ],
      routePresets: {
        '30min': [`${id}_poi_1`, `${id}_poi_2`],
        '1h': [`${id}_poi_1`, `${id}_poi_2`],
        '1.5h': [`${id}_poi_1`, `${id}_poi_2`],
        '2h': [`${id}_poi_1`, `${id}_poi_2`],
      },
      stories: [
        {
          id: `${id}_historia_1`,
          title: 'El Misterio del Monte',
          icon: 'Compass',
          summary: 'Una misión de observación y leyendas por el bosque.',
          mission: 'Resuelve los acertijos para encontrar el secreto oculto.',
          narrative: 'Los viejos senderos guardan secretos esperando ser descubiertos.',
          narratorName: 'El Guardabosques',
          narratorRole: 'Protector de las sendas',
          narratorTone: 'Sabio y entusiasta',
        },
      ],
      riddles: [
        {
          id: `${id}_riddle_1`,
          poiId: `${id}_poi_1`,
          storyId: `${id}_historia_1`,
          name: 'El Primer Paso',
          difficulty: 'novato',
          question: '¿Cuántos caminos principales se bifurcan en este cruce de salida?',
          answer: 'dos',
          acceptedAnswers: ['2', 'dos caminos'],
          points: 100,
          hints: ['Observa las señales de madera', 'Cuenta los ramales principales', 'Son dos senderos'],
        },
      ],
      sceneNarratives: {
        [`${id}_historia_1_${id}_poi_1`]: 'Te encuentras al inicio de la senda. Respira el aire fresco.',
        [`${id}_historia_1_${id}_poi_2`]: 'Las ramas del gran árbol forman un dosel protector.',
      },
      waypointImages: {},
    };
  },
};
