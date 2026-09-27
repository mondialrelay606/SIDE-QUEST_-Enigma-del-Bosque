export type DifficultyType = 'novato' | 'explorador' | 'maestro';
export type DurationType = '30min' | '1h' | '1.5h' | '2h';
export type SessionStatus = 'active' | 'completed' | 'abandoned';

export interface Riddle {
  id: string;
  poiId: string;
  storyId: string;
  name: string;
  difficulty: DifficultyType;
  question: string;
  type?: 'multiple_choice' | 'open_text';
  options?: string[]; // If present, rendered as multiple choice buttons
  answer: string;    // Main answer or correct option text
  acceptedAnswers?: string[]; // Alternative spellings/synonyms
  points: number;
  imageUrl?: string;
  hints?: string[];
  staticHints?: [string, string, string]; // [Level 1: 35%, Level 2: 70%, Level 3: 100%]
  _fix?: string;
}

export interface ArAssetConfig {
  preset?: string;
  label?: string;
  modelUrl?: string;     // glTF/.glb del objeto 3D, o
  spriteUrl?: string;    // imagen/sprite 2D como alternativa más ligera
  scale?: number;
  heightOffsetMeters?: number; // para que "flote" un poco sobre el suelo
  revealTrigger?: 'onArrival' | 'onRiddleSolved'; // cuándo se activa
  title?: string;
  description?: string;
}

export interface WindmillPOI {
  id: string;
  name: string;
  description: string;
  lat: number;
  lng: number;
  emoji: string;
  imageUrl?: string;
  clueSnippet?: string;
  arAsset?: ArAssetConfig;
  _todo?: string;
}

export interface StoryNarrator {
  name: string;
  role: string;
  avatarEmoji?: string;
  tone?: string;
  ttsVoice?: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr' | string;
}

export interface StoryIntro {
  id: string;
  title: string;
  icon: string; // emoji or Lucide icon key
  summary: string;
  narrative?: string;
  mission: string;
  narratorName?: string;
  narratorRole?: string;
  narratorTone?: string;
  narratorAvatar?: string;
  voiceName?: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';
  characterBio?: string;
  characterGreeting?: string;
  narrator?: StoryNarrator;
}

export interface ForestPack {
  id: string;                 // slug único, ej. "bosque-canejan-cestas"
  name: string;                // "Bosque de Canéjan-Cestas"
  country?: string;
  description?: string;
  centerLat: number;           // para centrar el mapa/instrucciones
  centerLng: number;
  coverImageUrl?: string;
  attribution?: string;        // créditos como Divercités «FOR[Ê]VEUR», 2026
  credits?: string;
  isPublished: boolean;
  pois: WindmillPOI[];
  routePresets: {
    "30min"?: string[];
    "1h"?: string[];
    "1.5h"?: string[];
    "2h"?: string[];
    [key: string]: any;
  };
  stories: StoryIntro[];
  riddles: Riddle[];
  sceneNarratives: Record<string, string>; // clave `${storyId}_${poiId}`
  waypointImages?: Record<string, string>; // clave `${storyId}_${poiId}` -> url imagen
  _todoCoordenadas?: string;
}

export interface LiveMessage {
  id: string;
  sender: 'narrator' | 'player' | 'admin';
  text: string;
  timestamp: string;
}

export interface HintHistoryItem {
  poiId: string;
  level: 1 | 2 | 3;
  text: string;
  timestamp: string;
}

export interface PlayerSession {
  code: string;
  forestPackId: string;
  name: string;
  type: 'individual' | 'grupo';
  storyId: string;
  difficulty: DifficultyType;
  duration: DurationType;
  easyMode?: boolean; // Geocerca ampliada a 60m para familias/movilidad reducida
  currentPoiIndex: number;
  routePoiIds: string[];
  points: number;
  status: SessionStatus;
  dateStarted: string;
  lastActive: string;
  lat: number;
  lng: number;
  messages: LiveMessage[];
  completedPois: string[];
  hintHistory: HintHistoryItem[];
  rating?: number;
  feedback?: string;
}

export interface PlayerFeedback {
  id: string;
  sessionCode: string;
  forestPackId: string;
  playerName: string;
  storyTitle: string;
  rating: number; // 1-5
  comment: string;
  date: string;
}
