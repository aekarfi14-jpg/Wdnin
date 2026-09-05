import { isAndroidNative, requestAndroidMicPermission } from './nativePermission';

/**
 * WDNIN Audio Engine
 * Real Offline Audio Recording & Temporal PCM Reversal
 * Studio Web Audio API implementation
 */

// Helper to encode Float32Array PCM samples into standard 16-bit PCM WAV Blob
export function bufferToWaveBlob(audioBuffer: AudioBuffer): Blob {
  const numOfChan = audioBuffer.numberOfChannels;
  const length = audioBuffer.length * numOfChan * 2 + 44;
  const out = new DataView(new ArrayBuffer(length));
  const channels: Float32Array[] = [];
  let sampleRate = audioBuffer.sampleRate;
  let offset = 0;
  let pos = 0;

  // RIFF chunk descriptor
  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8); // file length - 8
  setUint32(0x45564157); // "WAVE"

  // FMT sub-chunk
  setUint32(0x20746d66); // "fmt "
  setUint32(16); // subchunk1size (16 for PCM)
  setUint16(1); // audio format (1 = PCM)
  setUint16(numOfChan);
  setUint32(sampleRate);
  setUint32(sampleRate * 2 * numOfChan); // byte rate
  setUint16(numOfChan * 2); // block align
  setUint16(16); // 16-bit

  // Data sub-chunk
  setUint32(0x61746164); // "data"
  setUint32(length - pos - 4); // chunk length

  for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
    channels.push(audioBuffer.getChannelData(i));
  }

  while (offset < audioBuffer.length) {
    for (let i = 0; i < numOfChan; i++) {
      let sample = Math.max(-1, Math.min(1, channels[i][offset]));
      // scale to 16-bit signed int
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
      out.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  function setUint16(data: number) {
    out.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data: number) {
    out.setUint32(pos, data, true);
    pos += 4;
  }

  return new Blob([out.buffer], { type: 'audio/wav' });
}

export interface LiveAudioData {
  volume: number;
  timeDomain: number[]; // normalized -1 to 1 values representing waveform oscilloscope
  frequencies: number[]; // normalized 0 to 1 values representing frequency spectrum bars
}

export class AudioEngine {
  private static instance: AudioEngine;
  private audioCtx: AudioContext | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private mediaStream: MediaStream | null = null;
  private analyser: AnalyserNode | null = null;
  private bgMusicAudio: HTMLAudioElement | null = null;
  private currentActivePlayback: HTMLAudioElement | AudioBufferSourceNode | null = null;

  private isMusicMuted: boolean = false;
  private isSfxMuted: boolean = false;
  private musicVolume: number = 0.4;
  private sfxVolume: number = 0.8;
  private demoMode: boolean = false;
  private demoStartTime: number = 0;
  private demoTimer: NodeJS.Timeout | null = null;
  private animationFrameId: number | null = null;

  private constructor() {}

  public static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine();
    }
    return AudioEngine.instance;
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public setDemoMode(enabled: boolean) {
    this.demoMode = enabled;
  }

  public getDemoMode(): boolean {
    return this.demoMode;
  }

  public async requestMicrophonePermission(): Promise<boolean> {
    try {
      if (isAndroidNative()) {
        const res = await requestAndroidMicPermission();
        if (res.permission !== 'granted') {
          return false;
        }
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaStream = stream;
      return true;
    } catch (err) {
      return false;
    }
  }

  public getAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public updateSettings(bgMusic: boolean, memeSfx: boolean, musicVol: number, sfxVol: number) {
    this.isMusicMuted = !bgMusic;
    this.isSfxMuted = !memeSfx;
    this.musicVolume = musicVol;
    this.sfxVolume = sfxVol;

    if (this.bgMusicAudio) {
      this.bgMusicAudio.muted = this.isMusicMuted;
      this.bgMusicAudio.volume = this.musicVolume;
    }
  }

  // --- Background Music ---
  public playMusic(trackName: 'Msic02.mp3' | 'Msico1.mp3' | 'Misic00.mp3') {
    try {
      const src = `/assets/music/${trackName}`;
      if (!this.bgMusicAudio) {
        this.bgMusicAudio = new Audio(src);
        this.bgMusicAudio.loop = true;
      } else if (!this.bgMusicAudio.src.endsWith(trackName)) {
        this.bgMusicAudio.src = src;
      }

      this.bgMusicAudio.muted = this.isMusicMuted;
      this.bgMusicAudio.volume = this.musicVolume;
      this.bgMusicAudio.play().catch(() => {
        // user interaction might be pending
      });
    } catch {
      // Audio playback suppressed or blocked
    }
  }

  public duckMusic(duck: boolean) {
    if (!this.bgMusicAudio) return;
    if (duck) {
      this.bgMusicAudio.volume = Math.max(0, this.musicVolume * 0.15);
    } else {
      this.bgMusicAudio.volume = this.musicVolume;
    }
  }

  public stopMusic() {
    if (this.bgMusicAudio) {
      this.bgMusicAudio.pause();
    }
  }

  // --- Named Meme Sound Effects ---
  public playSfx(
    sfx:
      | 'quack_5.mp3'
      | 'suuuui.mp3'
      | 'yyy_ahqVbsA.mp3'
      | 'booyah-free-fire.mp3'
      | 'plankton-augh.mp3'
      | 'skyviewray-lets-go.mp3'
      | 'mrhb-byk.mp3'
  ): Promise<void> {
    if (this.isSfxMuted) return Promise.resolve();

    return new Promise((resolve) => {
      try {
        const audio = new Audio(`/assets/sounds/${sfx}`);
        audio.volume = this.sfxVolume;
        audio.onended = () => resolve();
        audio.onerror = () => resolve();
        audio.play().catch(() => resolve());
      } catch {
        resolve();
      }
    });
  }

  // --- Synthetic Studio AI Sound Effects ---
  // End of recording / timer
  public playEndTimerSound() {
    if (this.isSfxMuted) return;
    try {
      const ctx = this.getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(this.sfxVolume * 0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {}
  }

  // Reverse audio transition sound effect
  public playReverseSound() {
    if (this.isSfxMuted) return;
    try {
      const ctx = this.getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.45);
      gain.gain.setValueAtTime(this.sfxVolume * 0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } catch {}
  }

  // Start listening sound
  public playStartListeningSound() {
    if (this.isSfxMuted) return;
    try {
      const ctx = this.getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(this.sfxVolume * 0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {}
  }

  // End listening sound
  public playEndListeningSound() {
    if (this.isSfxMuted) return;
    try {
      const ctx = this.getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, ctx.currentTime);
      osc.frequency.setValueAtTime(523.25, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(this.sfxVolume * 0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {}
  }

  // --- Real Microphone Recording & Audio Analysis ---
  public async startRecording(
    onVolumeChange?: (vol: number) => void,
    onLiveData?: (data: LiveAudioData) => void
  ): Promise<void> {
    this.stopPlayback();
    this.duckMusic(true);

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.demoMode) {
      this.demoStartTime = Date.now();
      if (this.demoTimer) clearInterval(this.demoTimer);

      let phase = 0;
      this.demoTimer = setInterval(() => {
        phase += 0.2;
        const vol = 0.3 + Math.sin(phase * 2) * 0.25 + Math.random() * 0.2;
        if (onVolumeChange) onVolumeChange(vol);

        if (onLiveData) {
          const timePoints: number[] = [];
          for (let i = 0; i < 48; i++) {
            const angle = (i / 48) * Math.PI * 4 + phase;
            const amp = vol * (Math.sin(angle) * 0.7 + Math.sin(angle * 2.3) * 0.3);
            timePoints.push(amp);
          }
          const freqBars: number[] = [];
          for (let i = 0; i < 24; i++) {
            const bar = Math.max(0.1, Math.sin((i / 24) * Math.PI + phase) * vol * 0.9 + Math.random() * 0.15);
            freqBars.push(Math.min(1, bar));
          }
          onLiveData({ volume: vol, timeDomain: timePoints, frequencies: freqBars });
        }
      }, 50);
      return;
    }

    if (isAndroidNative()) {
      const res = await requestAndroidMicPermission();
      if (res.permission !== 'granted') {
        const err = new Error('MICROPHONE_PERMISSION_DENIED') as Error & { isPermanentlyDenied?: boolean };
        err.isPermanentlyDenied = res.isPermanentlyDenied;
        throw err;
      }
    }

    const ctx = this.getAudioContext();
    if (!this.mediaStream) {
      try {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: true
          }
        });
      } catch {
        // Fallback standard constraints
        this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }
    }

    const source = ctx.createMediaStreamSource(this.mediaStream);
    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = 256;
    source.connect(this.analyser);

    const freqData = new Uint8Array(this.analyser.frequencyBinCount);
    const timeData = new Uint8Array(this.analyser.fftSize);

    const processAudioFrame = () => {
      if (!this.analyser || !this.mediaRecorder || this.mediaRecorder.state !== 'recording') return;

      this.analyser.getByteFrequencyData(freqData);
      this.analyser.getByteTimeDomainData(timeData);

      let sum = 0;
      for (let i = 0; i < freqData.length; i++) {
        sum += freqData[i];
      }
      const avg = sum / freqData.length;
      const normalizedVol = Math.min(1, avg / 128);

      if (onVolumeChange) {
        onVolumeChange(normalizedVol);
      }

      if (onLiveData) {
        const timePoints: number[] = [];
        const timeStep = Math.floor(timeData.length / 48);
        for (let i = 0; i < 48; i++) {
          const val = (timeData[i * timeStep] - 128) / 128;
          timePoints.push(val);
        }

        const freqBars: number[] = [];
        const freqStep = Math.max(1, Math.floor(freqData.length / 24));
        for (let i = 0; i < 24; i++) {
          let barSum = 0;
          for (let j = 0; j < freqStep; j++) {
            barSum += freqData[i * freqStep + j] || 0;
          }
          freqBars.push(Math.min(1, (barSum / freqStep) / 255));
        }

        onLiveData({
          volume: normalizedVol,
          timeDomain: timePoints,
          frequencies: freqBars
        });
      }

      this.animationFrameId = requestAnimationFrame(processAudioFrame);
    };

    this.recordedChunks = [];
    // Prefer audio/webm, fallback to standard supported mimeType
    let mimeType = 'audio/webm;codecs=opus';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = ''; // let browser pick default
    }

    this.mediaRecorder = mimeType ? new MediaRecorder(this.mediaStream, { mimeType }) : new MediaRecorder(this.mediaStream);
    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        this.recordedChunks.push(e.data);
      }
    };
    this.mediaRecorder.start(100);
    this.animationFrameId = requestAnimationFrame(processAudioFrame);
  }

  public async stopRecording(): Promise<{ blob: Blob; url: string; audioBuffer: AudioBuffer; waveform: number[] }> {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.demoMode) {
      if (this.demoTimer) {
        clearInterval(this.demoTimer);
        this.demoTimer = null;
      }
      this.duckMusic(false);

      const ctx = this.getAudioContext();
      const duration = Math.max(1.5, Math.min(20, (Date.now() - this.demoStartTime) / 1000));
      const sampleRate = 44100;
      const numSamples = Math.floor(sampleRate * duration);
      const audioBuffer = ctx.createBuffer(1, numSamples, sampleRate);
      const channelData = audioBuffer.getChannelData(0);

      // Synthesize realistic speech-like modulated phoneme sequence
      for (let i = 0; i < numSamples; i++) {
        const t = i / sampleRate;
        const sylIndex = Math.floor(t * 3.5);
        const sylT = t % (1 / 3.5);
        const pitch = 140 + Math.sin(t * 5) * 30 + (sylIndex % 2 === 0 ? 25 : -15);
        const env = Math.sin(Math.PI * sylT * 3.5);
        // Formant combination mimicking human vowels
        const s1 = Math.sin(2 * Math.PI * pitch * t);
        const s2 = 0.5 * Math.sin(2 * Math.PI * pitch * 2.8 * t);
        const s3 = 0.25 * Math.sin(2 * Math.PI * pitch * 5.2 * t);
        channelData[i] = (s1 + s2 + s3) * env * 0.45;
      }

      const blob = bufferToWaveBlob(audioBuffer);
      const url = URL.createObjectURL(blob);
      const waveform = this.extractWaveform(audioBuffer, 40);
      return { blob, url, audioBuffer, waveform };
    }

    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        this.duckMusic(false);
        return reject(new Error('MediaRecorder not initialized'));
      }

      this.mediaRecorder.onstop = async () => {
        try {
          const blob = new Blob(this.recordedChunks, { type: this.mediaRecorder?.mimeType || 'audio/webm' });
          const url = URL.createObjectURL(blob);
          const arrayBuffer = await blob.arrayBuffer();
          const ctx = this.getAudioContext();
          const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
          const waveform = this.extractWaveform(audioBuffer, 40);

          this.duckMusic(false);
          resolve({ blob, url, audioBuffer, waveform });
        } catch (err) {
          this.duckMusic(false);
          reject(err);
        }
      };

      this.mediaRecorder.stop();
    });
  }

  // Release microphone hardware completely
  public cleanupMicrophone() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
    this.analyser = null;
    this.mediaRecorder = null;
  }

  // --- Real Temporal PCM Sample Reversal ---
  public async reverseAudioBuffer(audioBuffer: AudioBuffer): Promise<{ reversedBlob: Blob; reversedUrl: string; reversedBuffer: AudioBuffer; waveform: number[] }> {
    const ctx = this.getAudioContext();
    const numberOfChannels = audioBuffer.numberOfChannels;
    const length = audioBuffer.length;
    const sampleRate = audioBuffer.sampleRate;

    // Create a new AudioBuffer of exact same structure
    const reversedBuffer = ctx.createBuffer(numberOfChannels, length, sampleRate);

    // Strictly reverse raw audio samples in temporal order
    for (let c = 0; c < numberOfChannels; c++) {
      const srcData = audioBuffer.getChannelData(c);
      const dstData = reversedBuffer.getChannelData(c);
      for (let i = 0; i < length; i++) {
        dstData[i] = srcData[length - 1 - i];
      }
    }

    // Convert reversed buffer into a standard 16-bit PCM WAV Blob
    const reversedBlob = bufferToWaveBlob(reversedBuffer);
    const reversedUrl = URL.createObjectURL(reversedBlob);
    const waveform = this.extractWaveform(reversedBuffer, 40);

    return { reversedBlob, reversedUrl, reversedBuffer, waveform };
  }

  // Extract normalized waveform points for visualizer
  public extractWaveform(buffer: AudioBuffer, numPoints: number = 40): number[] {
    const data = buffer.getChannelData(0);
    const blockSize = Math.floor(data.length / numPoints);
    const waveform: number[] = [];

    for (let i = 0; i < numPoints; i++) {
      let sum = 0;
      const start = i * blockSize;
      for (let j = 0; j < blockSize; j++) {
        sum += Math.abs(data[start + j] || 0);
      }
      const avg = sum / blockSize;
      waveform.push(Math.min(1, Math.max(0.08, avg * 3.5)));
    }
    return waveform;
  }

  // --- Playback ---
  public isPlaying(): boolean {
    return this.currentActivePlayback !== null;
  }

  public playAudioUrl(url: string, onProgress?: (progress: number) => void): Promise<void> {
    this.stopPlayback();
    this.duckMusic(true);

    return new Promise((resolve) => {
      const audio = new Audio(url);
      this.currentActivePlayback = audio;

      let interval: NodeJS.Timeout | null = null;
      if (onProgress) {
        interval = setInterval(() => {
          if (audio.duration && audio.duration > 0) {
            onProgress(audio.currentTime / audio.duration);
          }
        }, 50);
      }

      const cleanup = () => {
        if (interval) clearInterval(interval);
        this.duckMusic(false);
        this.currentActivePlayback = null;
        resolve();
      };

      audio.onended = cleanup;
      audio.onerror = cleanup;
      audio.play().catch(cleanup);
    });
  }

  public stopPlayback() {
    if (this.currentActivePlayback) {
      if (this.currentActivePlayback instanceof HTMLAudioElement) {
        try {
          this.currentActivePlayback.pause();
          this.currentActivePlayback.currentTime = 0;
        } catch {}
      } else {
        try {
          this.currentActivePlayback.stop();
        } catch {}
      }
      this.currentActivePlayback = null;
      this.duckMusic(false);
    }
  }
}
