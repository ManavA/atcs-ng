// Hero Mode Theme - SERIOUS LIFE-OR-DEATH TENSION
// Inspired by Hans Zimmer's "Time", Christopher Nolan soundtracks
// Heavy tension, rising anxiety, ticking clock feeling

class HeroModeThemePlayer {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isPlaying = false;
  private scheduledNodes: AudioNode[] = [];
  private tensionInterval: number | null = null;

  // Musical constants (in Hz) - using lower, darker tones
  private notes: Record<string, number> = {
    'C2': 65.41, 'D2': 73.42, 'E2': 82.41, 'F2': 87.31, 'G2': 98.00,
    'A2': 110.00, 'Bb2': 116.54, 'B2': 123.47,
    'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00,
    'A3': 220.00, 'Bb3': 233.08, 'B3': 246.94,
    'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00,
    'A4': 440.00, 'Bb4': 466.16, 'B4': 493.88,
    'C5': 523.25, 'D5': 587.33,
  };

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    return this.audioContext;
  }

  // Create deep, ominous drone (like Zimmer's tension bed)
  private createTensionDrone(
    ctx: AudioContext,
    startTime: number,
    duration: number
  ): void {
    // Low rumble - creates unease
    const bass1 = ctx.createOscillator();
    const bassGain = ctx.createGain();
    bass1.type = 'sine';
    bass1.frequency.value = this.notes['C2'];
    bassGain.gain.setValueAtTime(0, startTime);
    bassGain.gain.linearRampToValueAtTime(0.15, startTime + 2);
    bassGain.gain.setValueAtTime(0.15, startTime + duration - 2);
    bassGain.gain.linearRampToValueAtTime(0, startTime + duration);
    bass1.connect(bassGain);
    bassGain.connect(this.masterGain!);
    bass1.start(startTime);
    bass1.stop(startTime + duration);
    this.scheduledNodes.push(bass1);

    // Second bass layer - slightly detuned for tension
    const bass2 = ctx.createOscillator();
    const bass2Gain = ctx.createGain();
    bass2.type = 'sine';
    bass2.frequency.value = this.notes['C2'] * 0.998; // Slight detune
    bass2Gain.gain.setValueAtTime(0, startTime);
    bass2Gain.gain.linearRampToValueAtTime(0.12, startTime + 2);
    bass2Gain.gain.setValueAtTime(0.12, startTime + duration - 2);
    bass2Gain.gain.linearRampToValueAtTime(0, startTime + duration);
    bass2.connect(bass2Gain);
    bass2Gain.connect(this.masterGain!);
    bass2.start(startTime);
    bass2.stop(startTime + duration);
    this.scheduledNodes.push(bass2);

    // High tension overtone - adds anxiety
    const high = ctx.createOscillator();
    const highGain = ctx.createGain();
    high.type = 'sine';
    high.frequency.value = this.notes['G4'];
    highGain.gain.setValueAtTime(0, startTime);
    highGain.gain.linearRampToValueAtTime(0.08, startTime + 3);
    highGain.gain.setValueAtTime(0.08, startTime + duration - 3);
    highGain.gain.linearRampToValueAtTime(0, startTime + duration);
    high.connect(highGain);
    highGain.connect(this.masterGain!);
    high.start(startTime);
    high.stop(startTime + duration);
    this.scheduledNodes.push(high);
  }

  // Heartbeat pulse (like in Dunkirk)
  private createHeartbeat(
    ctx: AudioContext,
    startTime: number,
    intensity: number = 0.3
  ): void {
    // Lub
    const lub = ctx.createOscillator();
    const lubGain = ctx.createGain();
    lub.type = 'sine';
    lub.frequency.setValueAtTime(80, startTime);
    lub.frequency.exponentialRampToValueAtTime(40, startTime + 0.15);
    lubGain.gain.setValueAtTime(intensity, startTime);
    lubGain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);
    lub.connect(lubGain);
    lubGain.connect(this.masterGain!);
    lub.start(startTime);
    lub.stop(startTime + 0.15);
    this.scheduledNodes.push(lub);

    // Dub
    const dub = ctx.createOscillator();
    const dubGain = ctx.createGain();
    dub.type = 'sine';
    dub.frequency.setValueAtTime(60, startTime + 0.2);
    dub.frequency.exponentialRampToValueAtTime(35, startTime + 0.35);
    dubGain.gain.setValueAtTime(intensity * 0.7, startTime + 0.2);
    dubGain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.35);
    dub.connect(dubGain);
    dubGain.connect(this.masterGain!);
    dub.start(startTime + 0.2);
    dub.stop(startTime + 0.35);
    this.scheduledNodes.push(dub);
  }

  // Ticking clock (creates time pressure)
  private createTick(ctx: AudioContext, startTime: number): void {
    const tick = ctx.createOscillator();
    const tickGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    tick.type = 'square';
    tick.frequency.value = 1200;
    filter.type = 'highpass';
    filter.frequency.value = 800;

    tickGain.gain.setValueAtTime(0.15, startTime);
    tickGain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.05);

    tick.connect(filter);
    filter.connect(tickGain);
    tickGain.connect(this.masterGain!);

    tick.start(startTime);
    tick.stop(startTime + 0.05);
    this.scheduledNodes.push(tick);
  }

  // Rising tension string cluster (dissonant, anxious)
  private createTensionRise(
    ctx: AudioContext,
    startTime: number,
    duration: number
  ): void {
    // Dissonant cluster of notes rising slowly
    const frequencies = [
      this.notes['C3'],
      this.notes['C3'] * 1.06, // Sharp 2nd - tension
      this.notes['E3'],
      this.notes['G3'] * 1.02, // Slightly sharp - unease
    ];

    frequencies.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, startTime);
      // Slow rise in pitch
      osc.frequency.linearRampToValueAtTime(freq * 1.1, startTime + duration);

      filter.type = 'lowpass';
      filter.frequency.value = 2000;
      filter.Q.value = 2;

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.08, startTime + duration * 0.3);
      gain.gain.setValueAtTime(0.08, startTime + duration * 0.7);
      gain.gain.linearRampToValueAtTime(0, startTime + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(startTime);
      osc.stop(startTime + duration);
      this.scheduledNodes.push(osc);
    });
  }

  // Deep brass stab (for critical moments)
  private createBrassStab(
    ctx: AudioContext,
    startTime: number,
    pitch: number = this.notes['C3']
  ): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.value = pitch;
    filter.type = 'lowpass';
    filter.frequency.value = 1500;

    gain.gain.setValueAtTime(0.4, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.8);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain!);

    osc.start(startTime);
    osc.stop(startTime + 0.8);
    this.scheduledNodes.push(osc);
  }

  // White noise swell (like wind/pressure)
  private createNoiseSwell(
    ctx: AudioContext,
    startTime: number,
    duration: number
  ): void {
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.3;
    }

    const noise = ctx.createBufferSource();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    noise.buffer = buffer;
    filter.type = 'lowpass';
    filter.frequency.value = 500; // Low rumble

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.15, startTime + duration * 0.5);
    gain.gain.linearRampToValueAtTime(0, startTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain!);

    noise.start(startTime);
    noise.stop(startTime + duration);
    this.scheduledNodes.push(noise);
  }

  // The SERIOUS hero mode theme - life and death
  public play(): void {
    if (this.isPlaying) return;

    const ctx = this.getContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    this.isPlaying = true;
    this.masterGain = ctx.createGain();
    this.masterGain.gain.value = 0.7; // Louder for impact
    this.masterGain.connect(ctx.destination);

    const now = ctx.currentTime;

    // Main arrangement: Building tension over 30 seconds
    const totalDuration = 30;

    // 1. Deep tension drone throughout (foundation of anxiety)
    this.createTensionDrone(ctx, now, totalDuration);

    // 2. Noise swell at beginning (pressure building)
    this.createNoiseSwell(ctx, now, 8);

    // 3. Heartbeat pattern - accelerating over time (increasing panic)
    let heartbeatTime = now + 2;
    const heartbeatCount = 40;
    for (let i = 0; i < heartbeatCount; i++) {
      // Accelerate heartbeat from 1.2s to 0.6s intervals
      const interval = 1.2 - (i / heartbeatCount) * 0.6;
      // Intensity increases
      const intensity = 0.25 + (i / heartbeatCount) * 0.15;
      this.createHeartbeat(ctx, heartbeatTime, intensity);
      heartbeatTime += interval;
    }

    // 4. Ticking clock every 1.5 seconds (time pressure)
    for (let i = 0; i < 20; i++) {
      this.createTick(ctx, now + i * 1.5);
    }

    // 5. Rising tension strings in waves
    this.createTensionRise(ctx, now + 5, 10);
    this.createTensionRise(ctx, now + 15, 10);
    this.createTensionRise(ctx, now + 20, 8);

    // 6. Brass stabs at key moments (punctuation)
    this.createBrassStab(ctx, now + 8, this.notes['G2']);
    this.createBrassStab(ctx, now + 16, this.notes['A2']);
    this.createBrassStab(ctx, now + 24, this.notes['C3']);

    // 7. Another noise swell toward the end (final push)
    this.createNoiseSwell(ctx, now + 22, 8);

    // Keep track of theme playing
    setTimeout(() => {
      this.isPlaying = false;
    }, totalDuration * 1000);
  }

  public stop(): void {
    if (!this.isPlaying) return;

    this.isPlaying = false;

    // Quick fade out (cut the tension when resolved)
    if (this.masterGain) {
      const ctx = this.getContext();
      this.masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);
    }

    // Clear scheduled nodes
    this.scheduledNodes.forEach(node => {
      try {
        if (node instanceof OscillatorNode || node instanceof AudioBufferSourceNode) {
          node.stop();
        }
      } catch (e) {
        // Node may have already stopped
      }
    });
    this.scheduledNodes = [];

    if (this.tensionInterval) {
      clearInterval(this.tensionInterval);
      this.tensionInterval = null;
    }
  }

  public isActive(): boolean {
    return this.isPlaying;
  }
}

// Singleton instance
export const HeroModeTheme = new HeroModeThemePlayer();
