import { ForestPack, PlayerSession, PlayerFeedback } from '../types';

export const api = {
  // Admin Authentication State
  getAdminKey(): string | null {
    return localStorage.getItem('enigma_admin_key');
  },

  setAdminKey(key: string): void {
    localStorage.setItem('enigma_admin_key', key);
  },

  clearAdminKey(): void {
    localStorage.removeItem('enigma_admin_key');
  },

  isAdminAuthenticated(): boolean {
    return !!localStorage.getItem('enigma_admin_key');
  },

  async verifyAdminPassword(password: string): Promise<boolean> {
    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        const data = await res.json();
        this.setAdminKey(data.token || password);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  getAdminHeaders(): Record<string, string> {
    const key = this.getAdminKey();
    return key ? { 'x-admin-key': key } : {};
  },

  // Forests
  async getForests(admin: boolean = false): Promise<ForestPack[]> {
    const headers = admin ? this.getAdminHeaders() : {};
    const res = await fetch(`/api/forests${admin ? '?admin=true' : ''}`, { headers });
    if (!res.ok) throw new Error('Error al cargar los bosques');
    return res.json();
  },

  async getForest(id: string): Promise<ForestPack> {
    const res = await fetch(`/api/forests/${id}`);
    if (!res.ok) throw new Error('Bosque no encontrado');
    return res.json();
  },

  async saveForest(pack: ForestPack): Promise<ForestPack> {
    const res = await fetch('/api/forests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAdminHeaders(),
      },
      body: JSON.stringify(pack),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Error al guardar el bosque. Requiere permisos de administrador.');
    }
    return res.json();
  },

  async duplicateForest(id: string): Promise<ForestPack> {
    const res = await fetch(`/api/forests/${id}/duplicate`, {
      method: 'POST',
      headers: this.getAdminHeaders(),
    });
    if (!res.ok) throw new Error('Error al duplicar el bosque. Requiere permisos de administrador.');
    return res.json();
  },

  async deleteForest(id: string): Promise<void> {
    const res = await fetch(`/api/forests/${id}`, {
      method: 'DELETE',
      headers: this.getAdminHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Error al eliminar el bosque. Requiere permisos de administrador.');
    }
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
    const res = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Error al crear la partida');
    return res.json();
  },

  async getSession(code: string): Promise<{ session: PlayerSession; forestPack: ForestPack }> {
    const res = await fetch(`/api/sessions/${code}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Código no encontrado');
    }
    return res.json();
  },

  async submitAnswer(code: string, userAnswer: string): Promise<{
    session: PlayerSession;
    isCorrect: boolean;
    pointsEarned?: number;
    isComplete?: boolean;
    message?: string;
  }> {
    const res = await fetch(`/api/sessions/${code}/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userAnswer }),
    });
    if (!res.ok) throw new Error('Error al enviar respuesta');
    return res.json();
  },

  async requestHint(code: string, level: 1 | 2 | 3): Promise<{
    hint: string;
    level: 1 | 2 | 3;
    pointsPenalty: number;
    currentPoints: number;
    narratorName: string;
  }> {
    const res = await fetch(`/api/sessions/${code}/hint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ level }),
    });
    if (!res.ok) throw new Error('Error al solicitar pista');
    return res.json();
  },

  async sendChatMessage(code: string, message: string): Promise<{
    reply: { id: string; sender: 'narrator'; text: string; timestamp: string };
  }> {
    const res = await fetch(`/api/sessions/${code}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    if (!res.ok) throw new Error('Error al enviar mensaje');
    return res.json();
  },

  async updateLocation(code: string, lat: number, lng: number): Promise<void> {
    try {
      await fetch(`/api/sessions/${code}/location`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lng }),
      });
    } catch (e) {}
  },

  async abandonSession(code: string): Promise<void> {
    const res = await fetch(`/api/sessions/${code}/abandon`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Error al abandonar la partida');
  },

  async submitFeedback(code: string, rating: number, comment: string): Promise<void> {
    const res = await fetch(`/api/sessions/${code}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating, comment }),
    });
    if (!res.ok) throw new Error('Error al enviar valoración');
  },

  // Admin
  async getAdminSessions(): Promise<PlayerSession[]> {
    const res = await fetch('/api/admin/sessions', {
      headers: this.getAdminHeaders(),
    });
    if (!res.ok) throw new Error('Error al cargar sesiones. Requiere acceso de administrador.');
    return res.json();
  },

  async sendAdminMessage(code: string, text: string): Promise<void> {
    const res = await fetch(`/api/admin/sessions/${code}/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAdminHeaders(),
      },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) throw new Error('Error al enviar aviso. Requiere acceso de administrador.');
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
    const res = await fetch('/api/admin/stats', {
      headers: this.getAdminHeaders(),
    });
    if (!res.ok) throw new Error('Error al cargar estadísticas. Requiere acceso de administrador.');
    return res.json();
  },

  async aiDraftForest(promptText: string, baseLat?: number, baseLng?: number): Promise<ForestPack> {
    const res = await fetch('/api/ai/generate-forest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAdminHeaders(),
      },
      body: JSON.stringify({ promptText, baseLat, baseLng }),
    });
    if (!res.ok) throw new Error('Error al generar borrador con IA. Requiere acceso de administrador.');
    return res.json();
  },
};
