// Google Cloud Text-to-Speech service with radio effect for aircraft communications
// Uses Web Audio API to apply bandpass filter and subtle noise for authentic radio sound

export type VoiceCharacter =
  | 'narrator'
  | 'atc'
  | 'controller_e97'    // Controller E97 Trainee - hero mode automation (en-US male)
  | 'captain_sharma'    // Air India captain (en-IN)
  | 'fa_priya'          // Air India flight attendant (en-IN)
  | 'hijacker_norway'   // Norwegian hijacker (no-NO)
  | 'captain_williams'  // Qantas captain (en-AU)
  | 'sarah'             // Qantas hero passenger (en-AU)
  | 'hijacker_sweden'   // Swedish hijacker (sv-SE)
  | 'british_crew'      // British Airways (en-GB)
  | 'pilot_american'    // Generic US pilot (Delta, United, American, etc)
  | 'pilot_french'      // Air France pilot (French accent)
  | 'pilot_german'      // Lufthansa pilot (German accent)
  | 'pilot_emirates';   // Emirates pilot (Middle Eastern)

interface VoiceConfig {
  languageCode: string;
  name: string;
  pitch: number;
  speakingRate: number;
}

// Voice configurations for each character
const VOICE_CONFIGS: Record<VoiceCharacter, VoiceConfig> = {
  narrator: {
    languageCode: 'en-US',
    name: 'en-US-Neural2-D',
    pitch: 0,
    speakingRate: 1.0,
  },
  atc: {
    languageCode: 'en-US',
    name: 'en-US-Neural2-J',
    pitch: 0,
    speakingRate: 1.15,
  },
  controller_e97: {
    languageCode: 'en-US',
    name: 'en-US-Neural2-A', // Distinct male voice for trainee controller
    pitch: 1,
    speakingRate: 1.1,
  },
  captain_sharma: {
    languageCode: 'en-IN',
    name: 'en-IN-Neural2-B',
    pitch: -2,
    speakingRate: 0.95,
  },
  fa_priya: {
    languageCode: 'en-IN',
    name: 'en-IN-Neural2-A',
    pitch: 2,
    speakingRate: 1.0,
  },
  hijacker_norway: {
    languageCode: 'nb-NO',
    name: 'nb-NO-Wavenet-B',
    pitch: -1,
    speakingRate: 0.9,
  },
  captain_williams: {
    languageCode: 'en-AU',
    name: 'en-AU-Neural2-B',
    pitch: -2,
    speakingRate: 0.95,
  },
  sarah: {
    languageCode: 'en-AU',
    name: 'en-AU-Neural2-A',
    pitch: 3,
    speakingRate: 1.1,
  },
  hijacker_sweden: {
    languageCode: 'sv-SE',
    name: 'sv-SE-Wavenet-A',
    pitch: 0,
    speakingRate: 0.85,
  },
  british_crew: {
    languageCode: 'en-GB',
    name: 'en-GB-Neural2-B',
    pitch: 0,
    speakingRate: 1.0,
  },
  pilot_american: {
    languageCode: 'en-US',
    name: 'en-US-Neural2-I', // Different from ATC to distinguish
    pitch: -1,
    speakingRate: 1.05,
  },
  pilot_french: {
    languageCode: 'fr-FR',
    name: 'fr-FR-Neural2-B', // French male voice
    pitch: 0,
    speakingRate: 0.95,
  },
  pilot_german: {
    languageCode: 'de-DE',
    name: 'de-DE-Neural2-B', // German male voice
    pitch: -1,
    speakingRate: 1.0,
  },
  pilot_emirates: {
    languageCode: 'ar-XA',
    name: 'ar-XA-Wavenet-B', // Arabic/Middle Eastern accent
    pitch: 0,
    speakingRate: 0.9,
  },
};

// Map airline codes to pilot voice types
export const AIRLINE_VOICES: Record<string, VoiceCharacter> = {
  // US airlines
  AAL: 'pilot_american',
  UAL: 'pilot_american',
  DAL: 'pilot_american',
  SWA: 'pilot_american',
  JBU: 'pilot_american',
  ASA: 'pilot_american',
  FDX: 'pilot_american',
  // Indian
  AIC: 'captain_sharma',
  // Australian
  QFA: 'captain_williams',
  // British
  BAW: 'british_crew',
  // French
  AFR: 'pilot_french',
  // German
  DLH: 'pilot_german',
  // Emirates
  UAE: 'pilot_emirates',
};

// Norwegian to English translations for hijacker dialogue
export const TRANSLATIONS: Record<string, string> = {
  'Jeg krever at dette flyet lander i Wakanda umiddelbart!':
    'I demand that this plane lands in Wakanda immediately!',
  'Ingen bevegelse! Jeg har kontroll over dette flyet nå.':
    'No movement! I have control of this plane now.',
  'Wakanda vil høre om dette. Dere vil alle betale.':
    'Wakanda will hear about this. You will all pay.',
  'Still! Eller det blir konsekvenser.':
    'Quiet! Or there will be consequences.',
};

// Swedish translations
export const SWEDISH_TRANSLATIONS: Record<string, string> = {
  'Nej... du kan inte...':
    'No... you cannot...',
  'Vakanda för alltid...':
    'Wakanda forever...',
};

type SpeechCompleteCallback = () => void;

class CloudTTSService {
  private apiKey: string;
  private audioQueue: Array<{
    text: string;
    character: VoiceCharacter;
    onComplete?: SpeechCompleteCallback;
    applyRadioEffect?: boolean;
  }> = [];
  private isPlaying = false;
  private currentAudio: HTMLAudioElement | null = null;
  private audioContext: AudioContext | null = null;
  private enabled = true;
  private volume = 1.0;
  private audioCache = new Map<string, string>(); // text+voice -> base64 audio
  private radioEffectEnabled = true; // Enable radio effect for non-narrator voices
  private useBrowserFallback = false; // When true, use browser TTS instead of Cloud TTS

  constructor() {
    // Google Cloud TTS API key (restricted to texttospeech.googleapis.com)
    // Hardcoded for reliable production deployment
    this.apiKey = 'AIzaSyAQDFQpCgJ0t_RdYJZjLGVp7AUQ9T_qMNY';
  }

  private getAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    return this.audioContext;
  }

  // Create radio effect chain: bandpass filter + subtle distortion
  private createRadioEffectChain(ctx: AudioContext, source: AudioBufferSourceNode): GainNode {
    // Bandpass filter to simulate radio frequency range (300Hz - 3400Hz)
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 3400;
    lowpass.Q.value = 1;

    const highpass = ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 300;
    highpass.Q.value = 1;

    // Add slight boost to mid frequencies for radio character
    const midBoost = ctx.createBiquadFilter();
    midBoost.type = 'peaking';
    midBoost.frequency.value = 1500;
    midBoost.gain.value = 3;
    midBoost.Q.value = 0.8;

    // Slight compression/saturation effect using waveshaper
    const waveshaper = ctx.createWaveShaper();
    // @ts-expect-error - Float32Array type mismatch between lib.dom and ArrayBuffer
    waveshaper.curve = this.makeDistortionCurve(5);
    waveshaper.oversample = '2x';

    // Output gain
    const outputGain = ctx.createGain();
    outputGain.gain.value = this.volume * 1.2; // Boost slightly to compensate for filtering

    // Connect the chain
    source.connect(highpass);
    highpass.connect(lowpass);
    lowpass.connect(midBoost);
    midBoost.connect(waveshaper);
    waveshaper.connect(outputGain);

    return outputGain;
  }

  // Create a subtle distortion curve for radio character
  private makeDistortionCurve(amount: number): Float32Array {
    const samples = 256;
    const buffer = new ArrayBuffer(samples * 4); // 4 bytes per float
    const curve = new Float32Array(buffer);
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      // Soft clipping curve
      curve[i] = (Math.PI + amount) * x / (Math.PI + amount * Math.abs(x));
    }
    return curve;
  }

  // Add radio click sound at start and end
  private addRadioClick(ctx: AudioContext, destination: AudioNode, time: number): void {
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();

    clickOsc.frequency.value = 1200;
    clickOsc.type = 'square';

    clickGain.gain.setValueAtTime(0, time);
    clickGain.gain.linearRampToValueAtTime(0.1 * this.volume, time + 0.005);
    clickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);

    clickOsc.connect(clickGain);
    clickGain.connect(destination);

    clickOsc.start(time);
    clickOsc.stop(time + 0.03);
  }

  private async synthesize(text: string, character: VoiceCharacter): Promise<string> {
    const cacheKey = `${character}:${text}`;
    if (this.audioCache.has(cacheKey)) {
      return this.audioCache.get(cacheKey)!;
    }

    const config = VOICE_CONFIGS[character];

    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode: config.languageCode,
            name: config.name,
          },
          audioConfig: {
            audioEncoding: 'MP3',
            pitch: config.pitch,
            speakingRate: config.speakingRate,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('[CloudTTS] API error:', error);
      throw new Error(`TTS API error: ${response.status}`);
    }

    const data = await response.json();
    const audioContent = data.audioContent;

    this.audioCache.set(cacheKey, audioContent);
    return audioContent;
  }

  private async playAudio(base64Audio: string, applyRadioEffect: boolean = false): Promise<void> {
    // Convert base64 to array buffer
    const binaryString = atob(base64Audio);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    if (applyRadioEffect && this.radioEffectEnabled) {
      // Use Web Audio API for radio effect
      return this.playWithRadioEffect(bytes.buffer);
    } else {
      // Standard playback for narrator
      return this.playStandard(base64Audio);
    }
  }

  private async playStandard(base64Audio: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);
      audio.volume = this.volume;
      this.currentAudio = audio;

      audio.onended = () => {
        this.currentAudio = null;
        resolve();
      };

      audio.onerror = (e) => {
        this.currentAudio = null;
        reject(e);
      };

      audio.play().catch(reject);
    });
  }

  // Browser SpeechSynthesis fallback when Cloud TTS fails
  private async speakWithBrowserFallback(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('SpeechSynthesis not supported'));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = this.volume;

      // Try to use a good English voice
      const voices = speechSynthesis.getVoices();
      const englishVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google')) ||
        voices.find(v => v.lang.startsWith('en-US')) ||
        voices.find(v => v.lang.startsWith('en'));
      if (englishVoice) {
        utterance.voice = englishVoice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = (e) => reject(e);

      speechSynthesis.speak(utterance);
    });
  }

  private async playWithRadioEffect(audioBuffer: ArrayBuffer): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        const ctx = this.getAudioContext();

        // Resume context if suspended (browser autoplay policy)
        if (ctx.state === 'suspended') {
          await ctx.resume();
        }

        // Decode the audio
        const decodedBuffer = await ctx.decodeAudioData(audioBuffer.slice(0));

        // Create source
        const source = ctx.createBufferSource();
        source.buffer = decodedBuffer;

        // Create radio effect chain
        const outputGain = this.createRadioEffectChain(ctx, source);
        outputGain.connect(ctx.destination);

        // Add radio click at start
        this.addRadioClick(ctx, ctx.destination, ctx.currentTime);

        // Add radio click at end
        const duration = decodedBuffer.duration;
        this.addRadioClick(ctx, ctx.destination, ctx.currentTime + duration - 0.02);

        source.onended = () => {
          resolve();
        };

        source.start(0);
      } catch (e) {
        console.error('[CloudTTS] Radio effect error, falling back to standard:', e);
        reject(e);
      }
    });
  }

  private async processQueue(): Promise<void> {
    if (this.isPlaying || this.audioQueue.length === 0) return;

    this.isPlaying = true;
    const item = this.audioQueue.shift()!;

    try {
      if (!this.enabled) {
        // TTS disabled - DON'T call onComplete, let fallback timer handle it
        console.log('[CloudTTS] Disabled, skipping:', item.text.substring(0, 50));
        this.isPlaying = false;
        this.processQueue();
        return;
      }

      // If browser fallback mode is enabled, use browser TTS directly
      if (this.useBrowserFallback) {
        console.log('[CloudTTS] Using browser fallback mode');
        await this.speakWithBrowserFallback(item.text);
        item.onComplete?.();
        this.isPlaying = false;
        setTimeout(() => this.processQueue(), 100);
        return;
      }

      const audioContent = await this.synthesize(item.text, item.character);
      await this.playAudio(audioContent, item.applyRadioEffect ?? false);

      // Only call onComplete on SUCCESS - fallback timer handles failures
      item.onComplete?.();
    } catch (error) {
      // Cloud TTS failed - DON'T automatically fall back to browser TTS
      // This prevents dual audio. User can manually enable fallback via UI button.
      console.error('[CloudTTS] Cloud TTS failed:', error);
      // DON'T call onComplete - let fallback timer handle advancement
    }

    this.isPlaying = false;
    setTimeout(() => this.processQueue(), 100);
  }

  // Determine if radio effect should be applied based on character type
  private shouldApplyRadioEffect(character: VoiceCharacter): boolean {
    // Narrator speaks clearly without radio effect
    // All other characters (pilots, ATC, passengers on comms) get radio effect
    return character !== 'narrator';
  }

  speak(text: string, character: VoiceCharacter, onComplete?: SpeechCompleteCallback): void {
    if (!this.apiKey) {
      console.warn('[CloudTTS] No API key, skipping');
      onComplete?.();
      return;
    }

    const applyRadioEffect = this.shouldApplyRadioEffect(character);
    this.audioQueue.push({ text, character, onComplete, applyRadioEffect });
    this.processQueue();
  }

  // Convenience methods for each character type
  speakNarrator(text: string, onComplete?: SpeechCompleteCallback): void {
    this.speak(text, 'narrator', onComplete);
  }

  speakATC(text: string, onComplete?: SpeechCompleteCallback): void {
    this.speak(text, 'atc', onComplete);
  }

  speakCaptainSharma(text: string, onComplete?: SpeechCompleteCallback): void {
    this.speak(text, 'captain_sharma', onComplete);
  }

  speakPriya(text: string, onComplete?: SpeechCompleteCallback): void {
    this.speak(text, 'fa_priya', onComplete);
  }

  speakHijackerNorway(text: string, onComplete?: SpeechCompleteCallback): void {
    this.speak(text, 'hijacker_norway', onComplete);
  }

  speakCaptainWilliams(text: string, onComplete?: SpeechCompleteCallback): void {
    this.speak(text, 'captain_williams', onComplete);
  }

  speakSarah(text: string, onComplete?: SpeechCompleteCallback): void {
    this.speak(text, 'sarah', onComplete);
  }

  speakHijackerSweden(text: string, onComplete?: SpeechCompleteCallback): void {
    this.speak(text, 'hijacker_sweden', onComplete);
  }

  speakBritishCrew(text: string, onComplete?: SpeechCompleteCallback): void {
    this.speak(text, 'british_crew', onComplete);
  }

  speakControllerE97(text: string, onComplete?: SpeechCompleteCallback): void {
    this.speak(text, 'controller_e97', onComplete);
  }

  // Speak as a pilot from a specific airline with appropriate accent/lingo
  speakPilot(airlineCode: string, text: string, onComplete?: SpeechCompleteCallback): void {
    const voice = AIRLINE_VOICES[airlineCode] || 'pilot_american';
    const styledText = this.addPilotPersonality(text, airlineCode);
    this.speak(styledText, voice, onComplete);
  }

  // Add personality and lingo based on airline nationality
  private addPilotPersonality(text: string, airlineCode: string): string {
    // US airlines - casual lingo, occasional humor
    if (['AAL', 'UAL', 'DAL', 'SWA', 'JBU', 'ASA', 'FDX'].includes(airlineCode)) {
      const usAcks = [
        text,
        `Roger that, ${text}`,
        `Copy, ${text}`,
        `Wilco, ${text}`,
        `You got it, ${text}`,
      ];
      const casualAdditions = [
        '',
        ' Appreciate it.',
        ' Thanks for the vectors.',
        ' Have a good one.',
        '',
      ];
      return usAcks[Math.floor(Math.random() * usAcks.length)] +
        casualAdditions[Math.floor(Math.random() * casualAdditions.length)];
    }

    // Australian - casual with Aussie flair
    if (['QFA'].includes(airlineCode)) {
      const aussieAcks = [
        text,
        `Roger, ${text}`,
        `Copy that, ${text}`,
        `No worries, ${text}`,
        `Cheers, ${text}`,
      ];
      const aussieFlair = [
        '',
        ' She\'ll be right.',
        ' Good on ya, mate.',
        '',
        '',
      ];
      return aussieAcks[Math.floor(Math.random() * aussieAcks.length)] +
        aussieFlair[Math.floor(Math.random() * aussieFlair.length)];
    }

    // British - formal but polite, with terrible dad jokes
    if (['BAW'].includes(airlineCode)) {
      const terribleBritishJokes = [
        'Lovely weather for flying, what?',
        'I\'d tell you a joke about turbulence, but it\'s too bumpy.',
        'Why do pilots make good comedians? They always land their jokes.',
        'Bit of a queue at Heathrow, I expect.',
        '',
        '',
        '',
      ];
      const joke = terribleBritishJokes[Math.floor(Math.random() * terribleBritishJokes.length)];
      return `Right-o, ${text}.${joke ? ' ' + joke : ' Cheers.'}`;
    }

    // French - formal
    if (['AFR'].includes(airlineCode)) {
      return `Affirm, ${text}`;
    }

    // German - very precise
    if (['DLH'].includes(airlineCode)) {
      return `Jawohl, ${text}`;
    }

    // Indian - formal and polite
    if (['AIC'].includes(airlineCode)) {
      return Math.random() > 0.5 ? `Roger, ${text}` : `Affirm, ${text}. Thank you.`;
    }

    // Emirates - formal
    if (['UAE'].includes(airlineCode)) {
      return `Roger, ${text}`;
    }

    // Default - standard readback
    return `Roger, ${text}`;
  }

  cancel(): void {
    this.audioQueue = [];
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    this.isPlaying = false;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.cancel();
    }
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.currentAudio) {
      this.currentAudio.volume = this.volume;
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  getVolume(): number {
    return this.volume;
  }

  // Get translation for foreign text
  getTranslation(text: string, language: 'norwegian' | 'swedish'): string | null {
    const translations = language === 'norwegian' ? TRANSLATIONS : SWEDISH_TRANSLATIONS;
    return translations[text] || null;
  }

  // Enable/disable browser fallback mode (for when Cloud TTS doesn't work)
  setBrowserFallback(enabled: boolean): void {
    this.useBrowserFallback = enabled;
    console.log('[CloudTTS] Browser fallback mode:', enabled ? 'ENABLED' : 'DISABLED');
  }

  isBrowserFallback(): boolean {
    return this.useBrowserFallback;
  }
}

export const CloudTTS = new CloudTTSService();
