export type DifficultyType = 'novato' | 'explorador' | 'maestro';
export type DurationType = '30min' | '1h' | '1.5h' | '1h30' | '2h';
export type SessionStatus = 'active' | 'completed' | 'abandoned';
export type SessionPhase = 'in_transit' | 'at_poi' | 'reward';

export type RiddleType =
  | 'multiple_choice'
  | 'open_text'
  | 'photo'
  | 'count'
  | 'compass'
  | 'audio'
  | 'listen'
  | 'cipher'
  | 'order'
  | 'physical_clue'
  | 'test'
  | 'text'
  | 'audio_record'
  | 'video'
  | 'mimic';

export interface Riddle {
  id: string;
  poiId: string;
  storyId: string;
  name: string;
  difficulty: DifficultyType | '*';
  question: string;
  type?: RiddleType;
  options?: string[]; // If present, rendered as multiple choice buttons or ordered items
  answer?: string;    // Main answer or correct option text (optional in 'order')
  acceptedAnswers?: string[]; // Alternative spellings/synonyms
  points: number;
  imageUrl?: string;
  hints?: string[];
  staticHints?: [string, string, string]; // [Level 1: 35%, Level 2: 70%, Level 3: 100%]
  _fix?: string;

  // 6ter additions
  optional?: boolean;       // Prueba extra opcional
  isBonus?: boolean;        // Prueba extra opcional con puntos de bonus
  bonusPoints?: number;
  config?: Record<string, any>; // Configuración extra (ej. holdSeconds, targetBearing, etc.)
  metaRune?: string;        // Letra o glifo para el meta-enigma final (ej. 'R', 'O', 'B', 'L', 'E')
  metaRuneClue?: string;    // Descripción de la letra (ej. "Primera letra del pacto antiguo")
  
  // Specific riddle mechanics
  targetCount?: number;     // Para tipo 'count': número exacto a contar en el sitio
  countTolerance?: number;  // Margen permitido (ej. +/- 1)
  targetBearing?: number;   // Para tipo 'compass': rumbo en grados (0=Norte, 90=Este, etc.)
  compassTolerance?: number;// Margen de tolerancia en grados (ej. 25°)
  audioClipUrl?: string;    // Para tipo 'audio': clip de sonido ambiente
  audioDescription?: string;
  cipherHint?: string;      // Para tipo 'cipher': clave del código rúnico
  orderItems?: string[];    // Para tipo 'order': elementos desordenados
  correctOrder?: string[];  // Secuencia correcta
  physicalClueCode?: string;// Para tipo 'physical_clue': código en relieve o madera
  correctIndex?: number;
  questionKey?: string;
  optionsKeys?: string[];
  hintsKeys?: string[];
  answersKeys?: string[];
  titleKey?: string;
  descriptionKey?: string;
}

export interface ArAssetConfig {
  preset?: string;
  type?: string;
  label?: string;
  modelUrl?: string;     // glTF/.glb del objeto 3D, o
  model?: string;
  spriteUrl?: string;    // imagen/sprite 2D como alternativa más ligera
  scale?: number;
  heightOffsetMeters?: number; // para que "flote" un poco sobre el suelo
  revealTrigger?: 'onArrival' | 'onRiddleSolved' | string; // cuándo se activa
  trigger?: string;
  title?: string;
  description?: string;
  descriptionKey?: string;
  pose?: 'borracho' | 'eructo' | 'confesion' | 'meando' | 'dormido' | string;
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
  nameKey?: string;
  descriptionKey?: string;
  stories?: string[];
  coords?: { lat: number; lng: number };
  ar?: any;
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
  titleKey?: string;
  guide?: any;
  durations?: Record<string, any>;
  difficulties?: Record<string, any>;
  contentRating?: 'family' | 'teen' | 'adult' | string;
  contentWarning?: string;
}

export interface MetaEnigmaConfig {
  keyword: string;         // Palabra sagrada que forman las runas (ej. "ROBLE" o "SILVA")
  title: string;           // "El Códice del Bosque"
  description: string;     // Descripción del misterio final
  hint: string;            // Pista sobre el significado
  successNarrative: string;// Narrativa final de consagración
  titleKey?: string;
  descriptionKey?: string;
  fragments?: string[];
}

export interface ForestPack {
  id: string;                 // slug único, ej. "bosque-canejan-cestas"
  name: string;                // "Bosque de Canéjan-Cestas"
  country?: string;
  region?: string;
  description?: string;
  centerLat: number;           // para centrar el mapa/instrucciones
  centerLng: number;
  coverImageUrl?: string;
  attribution?: string;        // créditos como Divercités «FOR[Ê]VEUR», 2026
  credits?: string;
  defaultLanguage?: 'fr' | 'es' | 'en' | string;
  languages?: string[];
  isPublished: boolean;
  contentRating?: 'family' | 'teen' | 'adult' | string;
  contentWarning?: string;
  nameKey?: string;
  descriptionKey?: string;
  pois: WindmillPOI[];
  routePresets: {
    "30min"?: string[];
    "1h"?: string[];
    "1.5h"?: string[];
    "1h30"?: string[];
    "2h"?: string[];
    [key: string]: any;
  };
  stories: StoryIntro[];
  riddles: Riddle[];
  sceneNarratives: Record<string, string>; // clave `${storyId}_${poiId}`
  waypointImages?: Record<string, string>; // clave `${storyId}_${poiId}` -> url imagen
  bridgePhrases?: Record<string, string>;  // Frases puente entre hitos `${fromPoiId}_to_${toPoiId}`
  metaEnigma?: MetaEnigmaConfig;          // Meta-enigma final de la senda
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

export interface CollectedRune {
  letter: string;
  poiId: string;
  riddleName: string;
  revealedAt: string;
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
  language?: string;

  // 6bis & 6ter state
  phase?: SessionPhase;           // 'in_transit' (desplazamiento) | 'at_poi' (enigma) | 'reward' (recompensa)
  hasArrivedAtPoi?: boolean;       // Desbloqueado por GPS <=25m (o 60m fácil) o botón "Estoy aquí"
  collectedRunes?: CollectedRune[];// Letras recolectadas para el meta-enigma final
  bonusCompleted?: string[];       // IDs de pruebas opcionales completadas
  metaEnigmaSolved?: boolean;      // Si se resolvió el meta-enigma final
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
