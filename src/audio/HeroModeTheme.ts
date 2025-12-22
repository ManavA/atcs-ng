// Hero Mode Theme - Epic orchestral synth theme
// Inspired by heroic movie scores, synthesized with Web Audio API

class HeroModeThemePlayer {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isPlaying = false;
  private scheduledNodes: AudioNode[] = [];

  // Musical constants (in Hz)
  private notes: Record<string, number> = {
    'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00,
    'A3': 220.00, 'Bb3': 233.08, 'B3': 246.94,
    'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00,
    'A4': 440.00, 'Bb4': 466.16, 'B4': 493.88,
    'C5': 523.25, 'D5': 587.33, 'E5': 659.26, 'F5': 698.46, 'G5': 783.99,
    'A5': 880.00,
  };

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    return this.audioContext;
  }

  // Create a brass-like synth voice
  private createBrass(
    ctx: AudioContext,
    freq: number,
    startTime: number,
    duration: number,
    volume: number = 0.3
  ): OscillatorNode {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    // Sawtooth for brass-like timbre
    osc.type = 'sawtooth';
    osc.frequency.value = freq;

    // Low-pass filter for warmth
    filter.type = 'lowpass';
    filter.frequency.value = 2000;
    filter.Q.value = 1;

    // Brass-like envelope (quick attack, sustained)
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.05);
    gain.gain.setValueAtTime(volume * 0.8, startTime + 0.1);
    gain.gain.linearRampToValueAtTime(0, startTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain!);

    osc.start(startTime);
    osc.stop(startTime + duration);

    this.scheduledNodes.push(osc);
    return osc;
  }

  // Create a string pad voice
  private createStrings(
    ctx: AudioContext,
    freq: number,
    startTime: number,
    duration: number,
    volume: number = 0.15
  ): OscillatorNode[] {
    const oscs: OscillatorNode[] = [];

    // Multiple detuned oscillators for rich strings
    [-5, 0, 5, 7].forEach(detune => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.value = freq;
      osc.detune.value = detune;

      // Slow attack for strings
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(volume / 4, startTime + 0.3);
      gain.gain.setValueAtTime(volume / 4, startTime + duration - 0.3);
      gain.gain.linearRampToValueAtTime(0, startTime + duration);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(startTime);
      osc.stop(startTime + duration);

      this.scheduledNodes.push(osc);
      oscs.push(osc);
    });

    return oscs;
  }

  // Create percussion hit
  private createDrum(
    ctx: AudioContext,
    startTime: number,
    type: 'kick' | 'snare' | 'timpani'
  ) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Snare adds noise layer
    if (type === 'snare') {
      this.createNoise(ctx, startTime, 0.1);
    }

    if (type === 'kick' || type === 'timpani') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(type === 'timpani' ? 80 : 150, startTime);
      osc.frequency.exponentialRampToValueAtTime(type === 'timpani' ? 60 : 50, startTime + 0.1);

      gain.gain.setValueAtTime(0.5, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + (type === 'timpani' ? 0.8 : 0.3));

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(startTime);
      osc.stop(startTime + 0.8);

      this.scheduledNodes.push(osc);
    }
  }

  private createNoise(ctx: AudioContext, startTime: number, duration: number) {
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    noise.buffer = buffer;
    filter.type = 'highpass';
    filter.frequency.value = 1000;

    gain.gain.setValueAtTime(0.3, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain!);

    noise.start(startTime);
    noise.stop(startTime + duration);

    this.scheduledNodes.push(noise);
  }

  // The hero theme melody and arrangement
  public play(): void {
    if (this.isPlaying) return;

    const ctx = this.getContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    this.isPlaying = true;
    this.masterGain = ctx.createGain();
    this.masterGain.gain.value = 0.6;
    this.masterGain.connect(ctx.destination);

    const now = ctx.currentTime;
    const tempo = 100; // BPM
    const beat = 60 / tempo;

    // Epic heroic theme - simplified Avengers-style
    // Main brass melody
    const melody = [
      // Bar 1-2: Opening fanfare (C minor to Eb major feel)
      { note: 'G4', start: 0, dur: beat * 2 },
      { note: 'C5', start: beat * 2, dur: beat },
      { note: 'Eb5', start: beat * 3, dur: beat },
      { note: 'G5', start: beat * 4, dur: beat * 2 },
      { note: 'F5', start: beat * 6, dur: beat },
      { note: 'Eb5', start: beat * 7, dur: beat },

      // Bar 3-4: Heroic rise
      { note: 'C5', start: beat * 8, dur: beat * 1.5 },
      { note: 'D5', start: beat * 9.5, dur: beat * 0.5 },
      { note: 'Eb5', start: beat * 10, dur: beat * 2 },
      { note: 'G5', start: beat * 12, dur: beat * 4 },

      // Bar 5-6: Resolution
      { note: 'F5', start: beat * 16, dur: beat },
      { note: 'Eb5', start: beat * 17, dur: beat },
      { note: 'D5', start: beat * 18, dur: beat },
      { note: 'C5', start: beat * 19, dur: beat * 3 },
    ];

    // Add Eb to notes
    this.notes['Eb4'] = 311.13;
    this.notes['Eb5'] = 622.25;

    // Play melody with brass
    melody.forEach(({ note, start, dur }) => {
      this.createBrass(ctx, this.notes[note], now + start, dur, 0.25);
    });

    // Supporting harmony (strings)
    const harmony = [
      // Bar 1-2
      { notes: ['C4', 'Eb4', 'G4'], start: 0, dur: beat * 4 },
      { notes: ['Bb3', 'D4', 'F4'], start: beat * 4, dur: beat * 4 },
      // Bar 3-4
      { notes: ['C4', 'Eb4', 'G4'], start: beat * 8, dur: beat * 4 },
      { notes: ['C4', 'Eb4', 'G4'], start: beat * 12, dur: beat * 4 },
      // Bar 5-6
      { notes: ['Bb3', 'D4', 'F4'], start: beat * 16, dur: beat * 2 },
      { notes: ['C4', 'Eb4', 'G4'], start: beat * 18, dur: beat * 4 },
    ];

    harmony.forEach(({ notes, start, dur }) => {
      notes.forEach(note => {
        this.createStrings(ctx, this.notes[note], now + start, dur, 0.12);
      });
    });

    // Epic percussion
    const percussion = [
      // Timpani hits on strong beats
      { type: 'timpani' as const, time: 0 },
      { type: 'timpani' as const, time: beat * 4 },
      { type: 'timpani' as const, time: beat * 8 },
      { type: 'timpani' as const, time: beat * 12 },
      { type: 'timpani' as const, time: beat * 16 },
      { type: 'timpani' as const, time: beat * 18 },
      { type: 'timpani' as const, time: beat * 20 },
    ];

    percussion.forEach(({ type, time }) => {
      this.createDrum(ctx, now + time, type);
    });

    // Auto-stop after theme ends
    const duration = beat * 22;
    setTimeout(() => {
      this.isPlaying = false;
    }, duration * 1000);
  }

  public stop(): void {
    if (!this.isPlaying) return;

    this.isPlaying = false;

    // Fade out
    if (this.masterGain) {
      const ctx = this.getContext();
      this.masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
    }

    // Clear scheduled nodes
    this.scheduledNodes = [];
  }

  public isActive(): boolean {
    return this.isPlaying;
  }
}

// Singleton instance
export const HeroModeTheme = new HeroModeThemePlayer();
