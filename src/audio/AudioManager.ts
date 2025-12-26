// Web Audio API-based sound effects generator
// No external audio files needed - generates sounds programmatically

type SoundEffect =
  | 'alert' | 'warning' | 'critical' | 'click' | 'sweep' | 'message' | 'radar' | 'emergency'
  // Military & dramatic sounds
  | 'militaryHorn'      // Deep brass horn for hostile/hijack
  | 'klaxon'            // Repeating alarm for emergencies
  | 'transponderLost'   // Eerie fade when signal dies
  | 'commandAck'        // Command accepted beep
  | 'commandReject'     // Command failed tone
  | 'heroSuccess'       // Triumphant landing fanfare
  | 'staticBurst'       // Radio static for lost contact
  // Serious hero mode sounds
  | 'altitudeWarning'   // Urgent altitude warning beep (GPWS-style)
  | 'pullUp'            // PULL UP terrain warning
  | 'breathingPanic'    // Hyperventilating breathing sound
  | 'tensionDrone'      // Low anxiety-inducing drone
  | 'heartbeat';        // Accelerating heartbeat

class AudioManagerClass {
  private audioContext: AudioContext | null = null;
  private muted = false;
  private volume = 0.5;

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  private createOscillator(frequency: number, type: OscillatorType, duration: number, gain: number = 1) {
    if (this.muted) return;

    const ctx = this.getContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    gainNode.gain.setValueAtTime(gain * this.volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start();
    oscillator.stop(ctx.currentTime + duration);
  }

  play(name: SoundEffect) {
    if (this.muted) return;

    try {
      switch (name) {
        case 'click':
          this.createOscillator(800, 'sine', 0.05, 0.3);
          break;

        case 'message':
          this.createOscillator(600, 'sine', 0.1, 0.4);
          setTimeout(() => this.createOscillator(800, 'sine', 0.1, 0.4), 100);
          break;

        case 'alert':
          // Double beep for info alerts
          this.createOscillator(880, 'sine', 0.15, 0.5);
          setTimeout(() => this.createOscillator(880, 'sine', 0.15, 0.5), 200);
          break;

        case 'warning':
          // Rising tone for warnings
          const ctx1 = this.getContext();
          const osc1 = ctx1.createOscillator();
          const gain1 = ctx1.createGain();
          osc1.type = 'sawtooth';
          osc1.frequency.setValueAtTime(400, ctx1.currentTime);
          osc1.frequency.linearRampToValueAtTime(800, ctx1.currentTime + 0.3);
          gain1.gain.setValueAtTime(0.3 * this.volume, ctx1.currentTime);
          gain1.gain.exponentialRampToValueAtTime(0.001, ctx1.currentTime + 0.4);
          osc1.connect(gain1);
          gain1.connect(ctx1.destination);
          osc1.start();
          osc1.stop(ctx1.currentTime + 0.4);
          break;

        case 'critical':
          // Urgent alarm for critical alerts
          const playAlarm = (delay: number) => {
            setTimeout(() => {
              this.createOscillator(1000, 'square', 0.15, 0.4);
              setTimeout(() => this.createOscillator(800, 'square', 0.15, 0.4), 150);
            }, delay);
          };
          playAlarm(0);
          playAlarm(400);
          playAlarm(800);
          break;

        case 'emergency':
          // Long siren-like sound for emergencies
          const ctx2 = this.getContext();
          const osc2 = ctx2.createOscillator();
          const gain2 = ctx2.createGain();
          osc2.type = 'sawtooth';
          osc2.frequency.setValueAtTime(600, ctx2.currentTime);
          osc2.frequency.linearRampToValueAtTime(1200, ctx2.currentTime + 0.5);
          osc2.frequency.linearRampToValueAtTime(600, ctx2.currentTime + 1);
          gain2.gain.setValueAtTime(0.4 * this.volume, ctx2.currentTime);
          gain2.gain.exponentialRampToValueAtTime(0.001, ctx2.currentTime + 1.2);
          osc2.connect(gain2);
          gain2.connect(ctx2.destination);
          osc2.start();
          osc2.stop(ctx2.currentTime + 1.2);
          break;

        case 'sweep':
          // Radar sweep sound
          const ctx3 = this.getContext();
          const osc3 = ctx3.createOscillator();
          const gain3 = ctx3.createGain();
          osc3.type = 'sine';
          osc3.frequency.setValueAtTime(200, ctx3.currentTime);
          osc3.frequency.exponentialRampToValueAtTime(100, ctx3.currentTime + 0.3);
          gain3.gain.setValueAtTime(0.1 * this.volume, ctx3.currentTime);
          gain3.gain.exponentialRampToValueAtTime(0.001, ctx3.currentTime + 0.3);
          osc3.connect(gain3);
          gain3.connect(ctx3.destination);
          osc3.start();
          osc3.stop(ctx3.currentTime + 0.3);
          break;

        case 'radar':
          // Blip sound
          this.createOscillator(1200, 'sine', 0.03, 0.2);
          break;

        case 'militaryHorn':
          // Deep, ominous brass horn for hostile aircraft / hijacking
          this.playMilitaryHorn();
          break;

        case 'klaxon':
          // Repeating alarm klaxon
          this.playKlaxon();
          break;

        case 'transponderLost':
          // Eerie descending tone when signal dies
          this.playTransponderLost();
          break;

        case 'commandAck':
          // Quick ascending confirmation beep
          this.createOscillator(600, 'sine', 0.08, 0.4);
          setTimeout(() => this.createOscillator(900, 'sine', 0.08, 0.4), 80);
          break;

        case 'commandReject':
          // Descending rejection tone
          this.createOscillator(400, 'square', 0.15, 0.3);
          setTimeout(() => this.createOscillator(250, 'square', 0.2, 0.3), 150);
          break;

        case 'heroSuccess':
          // Triumphant fanfare for successful landing
          this.playHeroSuccess();
          break;

        case 'staticBurst':
          // Radio static noise burst
          this.playStaticBurst();
          break;

        case 'altitudeWarning':
          // Urgent altitude warning beep (like GPWS)
          this.playAltitudeWarning();
          break;

        case 'pullUp':
          // PULL UP terrain warning
          this.playPullUp();
          break;

        case 'breathingPanic':
          // Panicked breathing sound
          this.playBreathingPanic();
          break;

        case 'tensionDrone':
          // Low anxiety drone
          this.playTensionDrone();
          break;

        case 'heartbeat':
          // Single heartbeat thump
          this.playHeartbeat();
          break;
      }
    } catch {
      // Silently fail if audio context not available
    }
  }

  private playMilitaryHorn() {
    const ctx = this.getContext();
    const duration = 2.0;

    // Layer 1: Deep bass horn (fundamental)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(110, ctx.currentTime); // Low A
    osc1.frequency.linearRampToValueAtTime(98, ctx.currentTime + duration); // Slight drop
    gain1.gain.setValueAtTime(0.35 * this.volume, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start();
    osc1.stop(ctx.currentTime + duration);

    // Layer 2: Harmonic overtone
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(220, ctx.currentTime);
    osc2.frequency.linearRampToValueAtTime(196, ctx.currentTime + duration);
    gain2.gain.setValueAtTime(0.2 * this.volume, ctx.currentTime);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start();
    osc2.stop(ctx.currentTime + duration);

    // Layer 3: High harmonic for brass character
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = 'triangle';
    osc3.frequency.setValueAtTime(330, ctx.currentTime);
    gain3.gain.setValueAtTime(0.1 * this.volume, ctx.currentTime);
    gain3.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration * 0.8);
    osc3.connect(gain3);
    gain3.connect(ctx.destination);
    osc3.start();
    osc3.stop(ctx.currentTime + duration);
  }

  private playKlaxon() {
    const playBurst = (delay: number) => {
      setTimeout(() => {
        const ctx = this.getContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.3 * this.volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      }, delay);
    };
    // Three rapid bursts
    playBurst(0);
    playBurst(250);
    playBurst(500);
  }

  private playTransponderLost() {
    const ctx = this.getContext();
    const duration = 1.5;

    // Descending eerie tone
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + duration);
    gain.gain.setValueAtTime(0.3 * this.volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  }

  private playHeroSuccess() {
    // Triumphant ascending fanfare
    const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.createOscillator(freq, 'sine', 0.3, 0.5);
        this.createOscillator(freq * 1.5, 'triangle', 0.25, 0.2); // Harmonic
      }, i * 150);
    });
  }

  private playStaticBurst() {
    const ctx = this.getContext();
    const duration = 0.3;
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Generate white noise
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    const gain = ctx.createGain();
    noise.buffer = buffer;
    gain.gain.setValueAtTime(0.15 * this.volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    noise.connect(gain);
    gain.connect(ctx.destination);
    noise.start();
  }

  private playAltitudeWarning() {
    // GPWS-style altitude warning (urgent beeping)
    const playBeep = (delay: number) => {
      setTimeout(() => {
        const ctx = this.getContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.value = 1000;
        gain.gain.setValueAtTime(0.4 * this.volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      }, delay);
    };
    // Rapid beeping pattern - creates urgency
    playBeep(0);
    playBeep(120);
    playBeep(240);
    playBeep(360);
  }

  private playPullUp() {
    // Loud PULL UP warning (like GPWS terrain alert)
    const ctx = this.getContext();

    // Low frequency pulse for urgency
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'square';
    osc1.frequency.setValueAtTime(300, ctx.currentTime);
    osc1.frequency.linearRampToValueAtTime(500, ctx.currentTime + 0.3);
    gain1.gain.setValueAtTime(0.5 * this.volume, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start();
    osc1.stop(ctx.currentTime + 0.4);

    // Higher harmonic for attention-grabbing
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(900, ctx.currentTime);
    gain2.gain.setValueAtTime(0.3 * this.volume, ctx.currentTime);
    gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start();
    osc2.stop(ctx.currentTime + 0.3);
  }

  private playBreathingPanic() {
    // Simulated panicked breathing (rapid inhale/exhale)
    const ctx = this.getContext();
    const duration = 1.2;
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Create breathing pattern with noise
    for (let i = 0; i < bufferSize; i++) {
      const t = i / ctx.sampleRate;
      // Breathing cycle: rapid in/out
      const breath = Math.sin(t * Math.PI * 4); // 2 breaths per second
      const noise = (Math.random() * 2 - 1) * 0.3;
      data[i] = breath * noise;
    }

    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    source.buffer = buffer;
    filter.type = 'bandpass';
    filter.frequency.value = 400;
    filter.Q.value = 5;

    gain.gain.setValueAtTime(0.2 * this.volume, ctx.currentTime);
    gain.gain.setValueAtTime(0.2 * this.volume, ctx.currentTime + duration - 0.3);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start();
  }

  private playTensionDrone() {
    // Low, ominous drone for background tension
    const ctx = this.getContext();
    const duration = 3;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 55; // Very low A

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.2 * this.volume, ctx.currentTime + 0.5);
    gain.gain.setValueAtTime(0.2 * this.volume, ctx.currentTime + duration - 0.5);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  }

  private playHeartbeat() {
    // Single heartbeat thump
    const ctx = this.getContext();

    // Lub
    const lub = ctx.createOscillator();
    const lubGain = ctx.createGain();
    lub.type = 'sine';
    lub.frequency.setValueAtTime(80, ctx.currentTime);
    lub.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.12);
    lubGain.gain.setValueAtTime(0.3 * this.volume, ctx.currentTime);
    lubGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
    lub.connect(lubGain);
    lubGain.connect(ctx.destination);
    lub.start();
    lub.stop(ctx.currentTime + 0.12);

    // Dub
    setTimeout(() => {
      const dub = ctx.createOscillator();
      const dubGain = ctx.createGain();
      dub.type = 'sine';
      dub.frequency.setValueAtTime(60, ctx.currentTime);
      dub.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 0.12);
      dubGain.gain.setValueAtTime(0.25 * this.volume, ctx.currentTime);
      dubGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      dub.connect(dubGain);
      dubGain.connect(ctx.destination);
      dub.start();
      dub.stop(ctx.currentTime + 0.12);
    }, 150);
  }

  setMuted(muted: boolean) {
    this.muted = muted;
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  isMuted() {
    return this.muted;
  }

  getVolume() {
    return this.volume;
  }
}

export const AudioManager = new AudioManagerClass();
