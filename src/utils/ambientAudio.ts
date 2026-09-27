// Procedural Ambient Forest Audio Engine using Web Audio API
// Generates realistic, location-aware looping forest soundscapes:
// - Wind through trees (modulated pink/brown noise with resonant gusts)
// - Bird calls (procedural frequency-modulated woodland songbirds with stereo panning)
// - Flowing stream / water (resonant filtered bubbling noise that swells near water POIs)
// - Thematic soundscapes reacting to active forest pack and story ambient tone

import { WindmillPOI, ForestPack, StoryIntro } from '../types';

export interface AmbientAudioState {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number; // 0 to 1
  activeThemeName: string;
  waterIntensity: number; // 0 to 1
  windIntensity: number;  // 0 to 1
  birdsIntensity: number; // 0 to 1
  poiName?: string;
}

type StateListener = (state: AmbientAudioState) => void;

class AmbientAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isInitialized = false;

  // Layer Gain Nodes
  private windGain: GainNode | null = null;
  private windFilter: BiquadFilterNode | null = null;
  private windNoiseSource: AudioBufferSourceNode | null = null;
  private windLfo: OscillatorNode | null = null;
  private windLfoGain: GainNode | null = null;

  private streamGain: GainNode | null = null;
  private streamFilter: BiquadFilterNode | null = null;
  private streamNoiseSource: AudioBufferSourceNode | null = null;
  private streamFlutterOsc: OscillatorNode | null = null;

  private birdsGain: GainNode | null = null;
  private birdsIntervalId: any = null;

  private themeGain: GainNode | null = null;
  private themeIntervalId: any = null;

  // Settings & State
  private volume: number = 0.6;
  private isMuted: boolean = false;
  private isDucked: boolean = false;
  private isPlaying: boolean = false;
  private listeners: Set<StateListener> = new Set();

  // Active Context Cache
  private currentForest: ForestPack | null = null;
  private currentStory: StoryIntro | null = null;
  private currentPoi: WindmillPOI | null = null;
  private currentDistance: number = 100;
  private currentThemeName: string = 'Bosque Natural';

  constructor() {
    if (typeof window !== 'undefined') {
      const savedMuted = localStorage.getItem('enigma_ambient_muted');
      if (savedMuted !== null) {
        this.isMuted = savedMuted === 'true';
      }
      const savedVolume = localStorage.getItem('enigma_ambient_volume');
      if (savedVolume !== null) {
        const v = parseFloat(savedVolume);
        if (!isNaN(v) && v >= 0 && v <= 1) {
          this.volume = v;
        }
      }

      // Resume or unlock context on first document touch/click
      const unlockHandler = () => {
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume();
        }
      };
      window.addEventListener('pointerdown', unlockHandler, { passive: true });
      window.addEventListener('touchstart', unlockHandler, { passive: true });
      window.addEventListener('keydown', unlockHandler, { passive: true });
    }
  }

  public subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const st = this.getState();
    this.listeners.forEach((l) => l(st));
  }

  public getState(): AmbientAudioState {
    const isWaterNear = this.detectWaterNear(this.currentPoi);
    const isHighNear = this.detectHighLookout(this.currentPoi);
    return {
      isPlaying: this.isPlaying,
      isMuted: this.isMuted,
      volume: this.volume,
      activeThemeName: this.currentThemeName,
      waterIntensity: isWaterNear ? 0.8 : 0.15,
      windIntensity: isHighNear ? 0.85 : 0.5,
      birdsIntensity: 0.7,
      poiName: this.currentPoi?.name,
    };
  }

  private getEffectiveVolume(): number {
    if (this.isMuted) return 0;
    const base = this.volume;
    return this.isDucked ? base * 0.35 : base;
  }

  public setDucked(ducked: boolean) {
    this.isDucked = ducked;
    this.applyMasterGain();
  }

  private initAudio() {
    if (this.isInitialized && this.ctx) return;
    if (typeof window === 'undefined') return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.getEffectiveVolume(), this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.setupWindLayer();
      this.setupStreamLayer();
      this.setupBirdsLayer();
      this.setupThemeLayer();

      this.isInitialized = true;
    } catch (e) {
      console.warn('Web Audio API not supported or blocked:', e);
    }
  }

  // --- Noise Buffer Helpers ---
  private createPinkNoiseBuffer(durationSeconds = 4): AudioBuffer {
    const sampleRate = this.ctx!.sampleRate;
    const bufferSize = sampleRate * durationSeconds;
    const buffer = this.ctx!.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);

    // Paul Kellet's filtered pink noise algorithm
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  private createBrownNoiseBuffer(durationSeconds = 4): AudioBuffer {
    const sampleRate = this.ctx!.sampleRate;
    const bufferSize = sampleRate * durationSeconds;
    const buffer = this.ctx!.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5; // Gain compensation
    }
    return buffer;
  }

  // --- Layer 1: Wind through Trees ---
  private setupWindLayer() {
    if (!this.ctx || !this.masterGain) return;

    const noiseBuffer = this.createPinkNoiseBuffer(5);
    this.windNoiseSource = this.ctx.createBufferSource();
    this.windNoiseSource.buffer = noiseBuffer;
    this.windNoiseSource.loop = true;

    // Filter to simulate tree foliage & gusts
    this.windFilter = this.ctx.createBiquadFilter();
    this.windFilter.type = 'lowpass';
    this.windFilter.frequency.setValueAtTime(480, this.ctx.currentTime);
    this.windFilter.Q.setValueAtTime(1.8, this.ctx.currentTime);

    this.windGain = this.ctx.createGain();
    this.windGain.gain.setValueAtTime(0.25, this.ctx.currentTime);

    // LFO for slow, natural wind gusts (0.07 Hz)
    this.windLfo = this.ctx.createOscillator();
    this.windLfo.frequency.setValueAtTime(0.07, this.ctx.currentTime);
    this.windLfoGain = this.ctx.createGain();
    this.windLfoGain.gain.setValueAtTime(120, this.ctx.currentTime); // Filter frequency modulation

    this.windLfo.connect(this.windLfoGain);
    this.windLfoGain.connect(this.windFilter.frequency);

    this.windNoiseSource.connect(this.windFilter);
    this.windFilter.connect(this.windGain);
    this.windGain.connect(this.masterGain);

    this.windNoiseSource.start();
    this.windLfo.start();
  }

  // --- Layer 2: Stream / Water Soundscape ---
  private setupStreamLayer() {
    if (!this.ctx || !this.masterGain) return;

    const streamBuffer = this.createPinkNoiseBuffer(4);
    this.streamNoiseSource = this.ctx.createBufferSource();
    this.streamNoiseSource.buffer = streamBuffer;
    this.streamNoiseSource.loop = true;

    // Resonant bandpass filter around gurgling water frequencies (700-1100 Hz)
    this.streamFilter = this.ctx.createBiquadFilter();
    this.streamFilter.type = 'bandpass';
    this.streamFilter.frequency.setValueAtTime(850, this.ctx.currentTime);
    this.streamFilter.Q.setValueAtTime(2.4, this.ctx.currentTime);

    // Secondary subtle peak filter for water ripples
    const streamPeak = this.ctx.createBiquadFilter();
    streamPeak.type = 'peaking';
    streamPeak.frequency.setValueAtTime(1400, this.ctx.currentTime);
    streamPeak.gain.setValueAtTime(4, this.ctx.currentTime);
    streamPeak.Q.setValueAtTime(3.0, this.ctx.currentTime);

    this.streamGain = this.ctx.createGain();
    // Default low subtle stream, will swell when near water POIs
    this.streamGain.gain.setValueAtTime(0.04, this.ctx.currentTime);

    // Flutter oscillator to simulate flowing ripples
    this.streamFlutterOsc = this.ctx.createOscillator();
    this.streamFlutterOsc.type = 'sine';
    this.streamFlutterOsc.frequency.setValueAtTime(2.2, this.ctx.currentTime);

    const flutterGain = this.ctx.createGain();
    flutterGain.gain.setValueAtTime(80, this.ctx.currentTime);
    this.streamFlutterOsc.connect(flutterGain);
    flutterGain.connect(this.streamFilter.frequency);

    this.streamNoiseSource.connect(this.streamFilter);
    this.streamFilter.connect(streamPeak);
    streamPeak.connect(this.streamGain);
    this.streamGain.connect(this.masterGain);

    this.streamNoiseSource.start();
    this.streamFlutterOsc.start();
  }

  // --- Layer 3: Procedural Bird Calls ---
  private setupBirdsLayer() {
    if (!this.ctx || !this.masterGain) return;

    this.birdsGain = this.ctx.createGain();
    this.birdsGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
    this.birdsGain.connect(this.masterGain);

    this.scheduleNextBirdChirp();
  }

  private scheduleNextBirdChirp() {
    if (!this.isPlaying) return;

    // Random interval between 2.2 and 5.5 seconds
    const delayMs = 2200 + Math.random() * 3300;
    this.birdsIntervalId = setTimeout(() => {
      if (this.isPlaying && !this.isMuted) {
        this.playSingleBirdSong();
      }
      this.scheduleNextBirdChirp();
    }, delayMs);
  }

  private playSingleBirdSong() {
    if (!this.ctx || !this.birdsGain || this.ctx.state === 'suspended') return;

    try {
      const now = this.ctx.currentTime;
      const songType = Math.floor(Math.random() * 4);

      // Stereo panning so birds appear in different directions in the canopy
      let pannerNode: StereoPannerNode | null = null;
      if (this.ctx.createStereoPanner) {
        pannerNode = this.ctx.createStereoPanner();
        pannerNode.pan.setValueAtTime((Math.random() * 1.6) - 0.8, now);
      }

      if (songType === 0) {
        // High upward double chirp (warbler)
        this.synthChirp(now, 2600, 3600, 0.08, pannerNode);
        this.synthChirp(now + 0.12, 2800, 3900, 0.11, pannerNode);
      } else if (songType === 1) {
        // Melodic descending whistle (thrush/woodland finch)
        this.synthChirp(now, 3800, 2400, 0.18, pannerNode);
      } else if (songType === 2) {
        // Staccato triple trill
        this.synthChirp(now, 3100, 3300, 0.05, pannerNode);
        this.synthChirp(now + 0.08, 3200, 3500, 0.05, pannerNode);
        this.synthChirp(now + 0.16, 3000, 2700, 0.09, pannerNode);
      } else {
        // Sweet bell-like single call
        this.synthChirp(now, 2400, 3100, 0.14, pannerNode);
      }
    } catch {}
  }

  private synthChirp(
    startTime: number,
    startFreq: number,
    endFreq: number,
    duration: number,
    panner: StereoPannerNode | null
  ) {
    if (!this.ctx || !this.birdsGain) return;

    const osc = this.ctx.createOscillator();
    const chirpGain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(startFreq, startTime);
    osc.frequency.exponentialRampToValueAtTime(endFreq, startTime + duration);

    // Natural bell envelope
    chirpGain.gain.setValueAtTime(0, startTime);
    chirpGain.gain.linearRampToValueAtTime(0.12, startTime + 0.015);
    chirpGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(chirpGain);
    if (panner) {
      chirpGain.connect(panner);
      panner.connect(this.birdsGain);
    } else {
      chirpGain.connect(this.birdsGain);
    }

    osc.start(startTime);
    osc.stop(startTime + duration + 0.02);
  }

  // --- Layer 4: Thematic & Story Harmony Resonance ---
  private setupThemeLayer() {
    if (!this.ctx || !this.masterGain) return;

    this.themeGain = this.ctx.createGain();
    this.themeGain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    this.themeGain.connect(this.masterGain);

    this.scheduleThematicChime();
  }

  private scheduleThematicChime() {
    if (!this.isPlaying) return;

    // Trigger subtle harmonic atmosphere every 8 - 14 seconds
    const interval = 8000 + Math.random() * 6000;
    this.themeIntervalId = setTimeout(() => {
      if (this.isPlaying && !this.isMuted) {
        this.playThemeResonance();
      }
      this.scheduleThematicChime();
    }, interval);
  }

  private playThemeResonance() {
    if (!this.ctx || !this.themeGain || this.ctx.state === 'suspended') return;

    const now = this.ctx.currentTime;
    const storyId = (this.currentStory?.id || '').toLowerCase();
    const storyTitle = (this.currentStory?.title || '').toLowerCase();

    // 1. Fantasy / Hadas / Roble Sagrado -> Mystical crystalline woodland pad
    if (
      storyId.includes('hechizo') ||
      storyId.includes('roble') ||
      storyId.includes('encant') ||
      storyTitle.includes('hadas') ||
      storyTitle.includes('hechizo')
    ) {
      const pentatonic = [587.33, 659.25, 880.0, 1046.5, 1174.66]; // D5, E5, A5, C6, D6
      const note = pentatonic[Math.floor(Math.random() * pentatonic.length)];

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(note, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.06, now + 1.2);
      gain.gain.exponentialRampToValueAtTime(0.0005, now + 3.8);

      osc.connect(gain);
      gain.connect(this.themeGain);

      osc.start(now);
      osc.stop(now + 4.0);
    }
    // 2. Historical / War / Ruins -> Low atmospheric pine wind resonance
    else if (
      storyId.includes('guerra') ||
      storyId.includes('sombras') ||
      storyTitle.includes('guerra') ||
      storyTitle.includes('silence')
    ) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(110, now); // Low A2
      osc.frequency.linearRampToValueAtTime(105, now + 3.0);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.05, now + 1.0);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 4.5);

      osc.connect(gain);
      gain.connect(this.themeGain);

      osc.start(now);
      osc.stop(now + 4.6);
    }
    // 3. Mystery / Water Mill / Pierre -> Wooden gear / subtle creek bell
    else if (
      storyId.includes('molino') ||
      storyTitle.includes('molino') ||
      storyId.includes('misterio')
    ) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 1.2);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.04, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

      osc.connect(gain);
      gain.connect(this.themeGain);

      osc.start(now);
      osc.stop(now + 2.0);
    }
  }

  // --- Location Awareness Detection ---
  private detectWaterNear(poi?: WindmillPOI | null): boolean {
    if (!poi) return false;
    const txt = `${poi.name} ${poi.description} ${poi.id}`.toLowerCase();
    return /moulin|ruisseau|molino|arroyo|puente|pont|r[ií]o|fuente|pozo|water|brook|stream|agua/i.test(txt);
  }

  private detectHighLookout(poi?: WindmillPOI | null): boolean {
    if (!poi) return false;
    const txt = `${poi.name} ${poi.description} ${poi.id}`.toLowerCase();
    return /belv[eé]d[eè]re|mirador|cima|colina|viento|vista|panor[aá]mic|lookout/i.test(txt);
  }

  private detectDenseForest(poi?: WindmillPOI | null): boolean {
    if (!poi) return false;
    const txt = `${poi.name} ${poi.description} ${poi.id}`.toLowerCase();
    return /ch[eê]ne|roble|bosque|árbol|arbol|pinar|selva|cabane|cabaña/i.test(txt);
  }

  // --- Public API for Updating Location & Theme ---
  public updateContext(params: {
    forest?: ForestPack | null;
    story?: StoryIntro | null;
    currentPoi?: WindmillPOI | null;
    distanceMeters?: number;
    isNearPoi?: boolean;
  }) {
    if (params.forest) this.currentForest = params.forest;
    if (params.story) this.currentStory = params.story;
    if (params.currentPoi !== undefined) this.currentPoi = params.currentPoi;
    if (params.distanceMeters !== undefined) this.currentDistance = params.distanceMeters;

    this.computeThemeName();
    this.applyLocationAcoustics();
    this.notify();
  }

  private computeThemeName() {
    const isWater = this.detectWaterNear(this.currentPoi);
    const isHigh = this.detectHighLookout(this.currentPoi);
    const storyTitle = this.currentStory?.title || '';

    if (isWater) {
      this.currentThemeName = `Arroyo y Ribera • ${this.currentPoi?.name || 'Río'}`;
    } else if (isHigh) {
      this.currentThemeName = `Viento en las Alturas • ${this.currentPoi?.name || 'Mirador'}`;
    } else if (storyTitle.toLowerCase().includes('roble') || storyTitle.toLowerCase().includes('hechizo')) {
      this.currentThemeName = `Dosel Místico • Susurro de Robles`;
    } else if (storyTitle.toLowerCase().includes('guerra') || storyTitle.toLowerCase().includes('sombras')) {
      this.currentThemeName = `Ecos del Bosque Profundo`;
    } else {
      this.currentThemeName = `Atmósfera Natural • ${this.currentForest?.name || 'Bosque'}`;
    }
  }

  private applyLocationAcoustics() {
    if (!this.ctx || !this.isInitialized) return;
    const now = this.ctx.currentTime;
    const rampTime = 1.8;

    const isWater = this.detectWaterNear(this.currentPoi);
    const isHigh = this.detectHighLookout(this.currentPoi);
    const isForest = this.detectDenseForest(this.currentPoi);

    // 1. Water Stream Layer
    if (this.streamGain && this.streamFilter) {
      // Swell up to 0.6 if within 40m of water POI
      const waterTarget = isWater ? (this.currentDistance < 40 ? 0.65 : 0.45) : 0.04;
      this.streamGain.gain.linearRampToValueAtTime(waterTarget, now + rampTime);
      const filterFreq = isWater ? 1000 : 750;
      this.streamFilter.frequency.linearRampToValueAtTime(filterFreq, now + rampTime);
    }

    // 2. Wind Layer
    if (this.windGain && this.windFilter) {
      const windTarget = isHigh ? 0.45 : isForest ? 0.28 : 0.22;
      const windCutoff = isHigh ? 820 : 480;
      this.windGain.gain.linearRampToValueAtTime(windTarget, now + rampTime);
      this.windFilter.frequency.linearRampToValueAtTime(windCutoff, now + rampTime);
    }

    // 3. Birds Layer
    if (this.birdsGain) {
      const birdsTarget = isHigh ? 0.22 : 0.38;
      this.birdsGain.gain.linearRampToValueAtTime(birdsTarget, now + rampTime);
    }
  }

  // --- Playback Controls ---
  public start() {
    this.initAudio();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.isPlaying = true;
    this.scheduleNextBirdChirp();
    this.scheduleThematicChime();
    this.applyMasterGain();
    this.notify();
  }

  public stop() {
    this.isPlaying = false;
    if (this.birdsIntervalId) clearTimeout(this.birdsIntervalId);
    if (this.themeIntervalId) clearTimeout(this.themeIntervalId);
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.5);
    }
    this.notify();
  }

  public togglePlay() {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.start();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('enigma_ambient_muted', String(muted));
    }
    // If unmuting and wasn't running, start it
    if (!muted && !this.isPlaying) {
      this.start();
    } else {
      this.applyMasterGain();
    }
    this.notify();
  }

  public toggleMute() {
    this.setMuted(!this.isMuted);
  }

  public setVolume(vol: number) {
    const clamped = Math.max(0, Math.min(1, vol));
    this.volume = clamped;
    if (typeof window !== 'undefined') {
      localStorage.setItem('enigma_ambient_volume', String(clamped));
    }
    if (this.isMuted && clamped > 0) {
      this.isMuted = false;
      localStorage.setItem('enigma_ambient_muted', 'false');
    }
    if (!this.isPlaying && clamped > 0) {
      this.start();
    } else {
      this.applyMasterGain();
    }
    this.notify();
  }

  private applyMasterGain() {
    if (!this.masterGain || !this.ctx) return;
    const target = this.getEffectiveVolume();
    this.masterGain.gain.linearRampToValueAtTime(target, this.ctx.currentTime + 0.3);
  }

  // Test sound generator
  public previewSoundscape(layer: 'wind' | 'stream' | 'birds' | 'theme') {
    this.initAudio();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (layer === 'birds') {
      this.playSingleBirdSong();
    } else if (layer === 'theme') {
      this.playThemeResonance();
    }
  }
}

export const ambientAudio = new AmbientAudioEngine();
