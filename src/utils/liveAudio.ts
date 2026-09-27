// Real-time audio streaming utility for Gemini 3.8 Live API
// Handles 16kHz PCM mic capture, 24kHz PCM gapless playback, and audio meters.

export interface LiveAudioCallbacks {
  onAudioData: (base64Pcm16k: string) => void;
  onInputVolume?: (level: number) => void;
  onOutputVolume?: (level: number) => void;
  onError?: (err: Error) => void;
}

export class LiveAudioSession {
  private inputAudioCtx: AudioContext | null = null;
  private outputAudioCtx: AudioContext | null = null;
  private micStream: MediaStream | null = null;
  private processorNode: ScriptProcessorNode | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private outputGainNode: GainNode | null = null;
  private activeSources: AudioBufferSourceNode[] = [];
  private nextStartTime: number = 0;
  private isCapturing: boolean = false;
  private callbacks: LiveAudioCallbacks;

  constructor(callbacks: LiveAudioCallbacks) {
    this.callbacks = callbacks;
  }

  public async startMicrophone(): Promise<void> {
    if (this.isCapturing) return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      // 16kHz input context for Gemini Live API
      this.inputAudioCtx = new AudioCtx({ sampleRate: 16000 });
      if (this.inputAudioCtx.state === 'suspended') {
        await this.inputAudioCtx.resume();
      }

      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      this.sourceNode = this.inputAudioCtx.createMediaStreamSource(this.micStream);
      this.processorNode = this.inputAudioCtx.createScriptProcessor(4096, 1, 1);

      this.processorNode.onaudioprocess = (e) => {
        if (!this.isCapturing) return;
        const channelData = e.inputBuffer.getChannelData(0);

        // Calculate input volume level (RMS) for visualizer
        if (this.callbacks.onInputVolume) {
          let sum = 0;
          for (let i = 0; i < channelData.length; i++) {
            sum += channelData[i] * channelData[i];
          }
          const rms = Math.sqrt(sum / channelData.length);
          const level = Math.min(1, rms * 4.5);
          this.callbacks.onInputVolume(level);
        }

        // Convert Float32Array to 16-bit PCM little-endian
        const pcmBuffer = this.float32To16BitPCM(channelData);
        const base64 = this.arrayBufferToBase64(pcmBuffer);
        this.callbacks.onAudioData(base64);
      };

      this.sourceNode.connect(this.processorNode);
      this.processorNode.connect(this.inputAudioCtx.destination);
      this.isCapturing = true;

      // Initialize 24kHz output context
      this.initOutputContext();
    } catch (err: any) {
      this.callbacks.onError?.(err);
      throw err;
    }
  }

  private initOutputContext() {
    if (!this.outputAudioCtx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.outputAudioCtx = new AudioCtx({ sampleRate: 24000 });
      this.outputGainNode = this.outputAudioCtx.createGain();
      this.outputGainNode.gain.setValueAtTime(1.0, this.outputAudioCtx.currentTime);
      this.outputGainNode.connect(this.outputAudioCtx.destination);
      this.nextStartTime = this.outputAudioCtx.currentTime;
    }
    if (this.outputAudioCtx.state === 'suspended') {
      this.outputAudioCtx.resume();
    }
  }

  // Play incoming 24kHz 16-bit PCM chunk gaplessly
  public playChunk(base64: string): void {
    try {
      this.initOutputContext();
      if (!this.outputAudioCtx || !this.outputGainNode) return;

      const float32 = this.base64ToFloat32Pcm(base64);
      if (float32.length === 0) return;

      // Calculate output volume level (RMS) for character animation
      if (this.callbacks.onOutputVolume) {
        let sum = 0;
        for (let i = 0; i < float32.length; i++) {
          sum += float32[i] * float32[i];
        }
        const rms = Math.sqrt(sum / float32.length);
        const level = Math.min(1, rms * 5);
        this.callbacks.onOutputVolume(level);
      }

      const audioBuffer = this.outputAudioCtx.createBuffer(1, float32.length, 24000);
      audioBuffer.getChannelData(0).set(float32);

      const source = this.outputAudioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.outputGainNode);

      const now = this.outputAudioCtx.currentTime;
      if (this.nextStartTime < now) {
        this.nextStartTime = now;
      }

      source.start(this.nextStartTime);
      this.nextStartTime += audioBuffer.duration;

      this.activeSources.push(source);
      source.onended = () => {
        const idx = this.activeSources.indexOf(source);
        if (idx !== -1) {
          this.activeSources.splice(idx, 1);
        }
        if (this.activeSources.length === 0 && this.callbacks.onOutputVolume) {
          this.callbacks.onOutputVolume(0);
        }
      };
    } catch (e) {
      console.warn('Playback error:', e);
    }
  }

  // Handle interruption from Gemini model
  public interrupt(): void {
    for (const src of this.activeSources) {
      try {
        src.stop();
      } catch (e) {}
    }
    this.activeSources = [];
    if (this.outputAudioCtx) {
      this.nextStartTime = this.outputAudioCtx.currentTime;
    }
    if (this.callbacks.onOutputVolume) {
      this.callbacks.onOutputVolume(0);
    }
  }

  public stopMicrophone(): void {
    this.isCapturing = false;
    if (this.sourceNode && this.processorNode) {
      this.sourceNode.disconnect();
      this.processorNode.disconnect();
    }
    if (this.micStream) {
      this.micStream.getTracks().forEach((track) => track.stop());
      this.micStream = null;
    }
    if (this.callbacks.onInputVolume) {
      this.callbacks.onInputVolume(0);
    }
  }

  public close(): void {
    this.stopMicrophone();
    this.interrupt();
    if (this.inputAudioCtx) {
      this.inputAudioCtx.close().catch(() => {});
      this.inputAudioCtx = null;
    }
    if (this.outputAudioCtx) {
      this.outputAudioCtx.close().catch(() => {});
      this.outputAudioCtx = null;
    }
  }

  // Helper converters
  private float32To16BitPCM(input: Float32Array): ArrayBuffer {
    const output = new DataView(new ArrayBuffer(input.length * 2));
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      output.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    return output.buffer;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  private base64ToFloat32Pcm(base64: string): Float32Array {
    const binary = window.atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const dataView = new DataView(bytes.buffer);
    const numSamples = Math.floor(len / 2);
    const float32 = new Float32Array(numSamples);
    for (let i = 0; i < numSamples; i++) {
      const int16 = dataView.getInt16(i * 2, true);
      float32[i] = int16 < 0 ? int16 / 32768 : int16 / 32767;
    }
    return float32;
  }
}
