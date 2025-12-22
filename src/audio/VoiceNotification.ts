// Voice Notification using Web Speech API
// With robust initialization and fallback handling

// Callback type for speech completion
type SpeechCompleteCallback = () => void;

class VoiceNotificationClass {
  private synth: SpeechSynthesis | null = null;
  private enabled = true;
  private initialized = false;
  private voicesLoaded = false;
  private speakQueue: Array<{
    text: string;
    priority: 'normal' | 'high' | 'critical';
    onComplete?: SpeechCompleteCallback;
    voiceType?: 'narrator' | 'atc' | 'sarah';
  }> = [];
  private isSpeaking = false;
  private currentOnComplete: SpeechCompleteCallback | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;

      // Try to load voices immediately
      this.loadVoices();

      // Chrome/Edge load voices async - listen for the event
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => {
          this.loadVoices();
        };
      }

      // Also try loading after a short delay (some browsers need this)
      setTimeout(() => this.loadVoices(), 100);
      setTimeout(() => this.loadVoices(), 500);
      setTimeout(() => this.loadVoices(), 1000);

      console.log('[Voice] Speech synthesis available');
    } else {
      console.warn('[Voice] Speech synthesis NOT available in this browser');
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    this.voicesLoaded = voices.length > 0;
    if (this.voicesLoaded) {
      console.log('[Voice] Loaded', voices.length, 'voices');
      // Log first few English voices for debugging
      const englishVoices = voices.filter(v => v.lang.startsWith('en'));
      console.log('[Voice] English voices:', englishVoices.slice(0, 3).map(v => `${v.name} (${v.lang})`));
    }
  }

  private getBestVoice(): SpeechSynthesisVoice | null {
    if (!this.synth) return null;
    const voices = this.synth.getVoices();
    if (voices.length === 0) return null;

    // Priority order for English voices
    const preferred = [
      // Google voices (Chrome)
      'Google US English',
      'Google UK English Female',
      'Google UK English Male',
      // Microsoft voices (Edge)
      'Microsoft David',
      'Microsoft Zira',
      'Microsoft Mark',
      // macOS voices
      'Alex',
      'Samantha',
      'Daniel',
      // Any US English
      'en-US',
      'en_US',
      // Any UK English
      'en-GB',
      'en_GB',
      // Any English
      'en-',
      'en_',
    ];

    for (const pref of preferred) {
      const voice = voices.find(v =>
        v.name.includes(pref) || v.lang.startsWith(pref)
      );
      if (voice) {
        console.log('[Voice] Selected voice:', voice.name, voice.lang);
        return voice;
      }
    }

    // Fallback to first voice
    console.log('[Voice] Using fallback voice:', voices[0]?.name);
    return voices[0] || null;
  }

  speak(
    text: string,
    priority: 'normal' | 'high' | 'critical' = 'normal',
    options?: {
      onComplete?: SpeechCompleteCallback;
      voiceType?: 'narrator' | 'atc' | 'sarah';
    }
  ) {
    if (!this.synth || !this.enabled) {
      console.log('[Voice] Skipping - synth:', !!this.synth, 'enabled:', this.enabled);
      // Still call onComplete if provided (for auto-advance)
      options?.onComplete?.();
      return;
    }

    // Add to queue
    if (priority === 'critical') {
      // Critical messages go to front and cancel current speech
      this.speakQueue.unshift({
        text,
        priority,
        onComplete: options?.onComplete,
        voiceType: options?.voiceType,
      });
      this.synth.cancel();
      this.isSpeaking = false;
    } else {
      this.speakQueue.push({
        text,
        priority,
        onComplete: options?.onComplete,
        voiceType: options?.voiceType,
      });
    }

    this.processQueue();
  }

  private processQueue() {
    if (this.isSpeaking || this.speakQueue.length === 0) return;
    if (!this.synth) return;

    const item = this.speakQueue.shift();
    if (!item) return;

    this.isSpeaking = true;
    this.currentOnComplete = item.onComplete || null;

    const utterance = new SpeechSynthesisUtterance(item.text);

    // Force English - this is critical
    utterance.lang = 'en-US';

    // Try to set a good voice
    const voice = this.getBestVoice();
    if (voice) {
      utterance.voice = voice;
    }

    // Speech settings based on voice type
    switch (item.voiceType) {
      case 'atc':
        // ATC voice: faster, slightly higher pitch, more urgent
        utterance.rate = 1.2;
        utterance.pitch = 1.1;
        break;
      case 'sarah':
        // Sarah voice: nervous, slightly higher pitch, slower
        utterance.rate = 0.9;
        utterance.pitch = 1.3;
        break;
      default:
        // Narrator voice: calm, normal pace
        utterance.rate = item.priority === 'critical' ? 1.1 : 1.0;
        utterance.pitch = 1.0;
    }
    utterance.volume = 1.0;

    utterance.onstart = () => {
      console.log('[Voice] Speaking:', item.text.substring(0, 40) + '...');
    };

    utterance.onend = () => {
      console.log('[Voice] Finished');
      const callback = this.currentOnComplete;
      this.isSpeaking = false;
      this.currentOnComplete = null;
      // Call completion callback
      if (callback) {
        setTimeout(() => callback(), 100);
      }
      // Small delay before next utterance
      setTimeout(() => this.processQueue(), 200);
    };

    utterance.onerror = (event) => {
      console.error('[Voice] Error:', event.error);
      const callback = this.currentOnComplete;
      this.isSpeaking = false;
      this.currentOnComplete = null;
      // Still call completion callback on error
      if (callback) {
        setTimeout(() => callback(), 100);
      }
      // Try next item in queue
      setTimeout(() => this.processQueue(), 100);
    };

    // Chrome bug workaround: cancel any pending speech first
    this.synth.cancel();

    // Small delay to let cancel take effect (Chrome needs this)
    setTimeout(() => {
      if (this.synth) {
        try {
          this.synth.speak(utterance);
        } catch (e) {
          console.error('[Voice] Speak error:', e);
          this.isSpeaking = false;
        }
      }
    }, 50);
  }

  speakAlert(severity: 'CRITICAL' | 'WARNING' | 'INFO', message: string) {
    if (!this.enabled) return;

    let prefix = '';
    let priority: 'normal' | 'high' | 'critical' = 'normal';

    switch (severity) {
      case 'CRITICAL':
        prefix = 'Critical Alert. ';
        priority = 'critical';
        break;
      case 'WARNING':
        prefix = 'Warning. ';
        priority = 'high';
        break;
      default:
        prefix = '';
        priority = 'normal';
    }

    const cleanMessage = this.cleanForSpeech(message);
    this.speak(prefix + cleanMessage, priority);
  }

  speakInstruction(instruction: string) {
    this.speak(instruction, 'normal');
  }

  // ATC controller voice (crisp, fast, professional)
  speakATC(command: string, onComplete?: SpeechCompleteCallback) {
    this.speak(this.cleanForSpeech(command), 'high', {
      voiceType: 'atc',
      onComplete,
    });
  }

  // Sarah voice (nervous flight attendant in Hero Mode)
  speakSarah(message: string, onComplete?: SpeechCompleteCallback) {
    this.speak(message, 'normal', {
      voiceType: 'sarah',
      onComplete,
    });
  }

  // Narrator with completion callback (for auto-advance)
  speakNarrative(text: string, onComplete?: SpeechCompleteCallback) {
    this.speak(this.cleanForSpeech(text), 'normal', {
      voiceType: 'narrator',
      onComplete,
    });
  }

  private cleanForSpeech(text: string): string {
    return text
      // Flight levels and measurements
      .replace(/FL(\d+)/g, 'flight level $1')
      .replace(/(\d+)kt/gi, '$1 knots')
      .replace(/(\d+)nm/gi, '$1 nautical miles')
      .replace(/(\d+)ft/gi, '$1 feet')
      .replace(/(\d+)fpm/gi, '$1 feet per minute')
      // Aviation terms
      .replace(/TCAS/g, 'T-CAS')
      .replace(/\bRA\b/g, 'resolution advisory')
      .replace(/NMAC/g, 'near mid-air collision')
      .replace(/ADS-B/g, 'ADS-B')
      .replace(/ETA/g, 'estimated time of arrival')
      // Agencies
      .replace(/NORAD/g, 'NORAD')
      .replace(/\bFBI\b/g, 'F-B-I')
      .replace(/\bTSA\b/g, 'T-S-A')
      .replace(/\bFAA\b/g, 'F-A-A')
      // Aircraft types
      .replace(/SU-35/g, 'S-U 35')
      .replace(/F-22/g, 'F-22')
      .replace(/F-15/g, 'F-15')
      .replace(/EF-3/g, 'E-F 3')
      .replace(/Boeing 737/g, 'Boeing 737')
      // Airlines
      .replace(/AAL(\d+)/g, 'American $1')
      .replace(/UAL(\d+)/g, 'United $1')
      .replace(/DAL(\d+)/g, 'Delta $1')
      .replace(/SWA(\d+)/g, 'Southwest $1')
      .replace(/BAW(\d+)/g, 'British Airways $1')
      .replace(/AFR(\d+)/g, 'Air France $1')
      .replace(/FDX(\d+)/g, 'FedEx $1')
      .replace(/JBU(\d+)/g, 'JetBlue $1')
      .replace(/NKS(\d+)/g, 'Spirit $1')
      .replace(/ASA(\d+)/g, 'Alaska $1')
      .replace(/AIC(\d+)/g, 'Air India $1')
      .replace(/QFA(\d+)/g, 'Qantas $1')
      .replace(/UAE(\d+)/g, 'Emirates $1')
      // Punctuation cleanup
      .replace(/[—–-]/g, ', ')
      .replace(/[!]+/g, '.')
      .replace(/\s+/g, ' ')
      .trim();
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled && this.synth) {
      this.synth.cancel();
      this.speakQueue = [];
      this.isSpeaking = false;
    }
    console.log('[Voice] Enabled:', enabled);
  }

  isEnabled() {
    return this.enabled;
  }

  cancel() {
    this.synth?.cancel();
    this.speakQueue = [];
    this.isSpeaking = false;
  }

  // Call this on first user interaction to unlock audio
  forceInit() {
    if (this.synth && !this.initialized) {
      this.initialized = true;
      // Speak empty string to unlock audio on mobile
      const utterance = new SpeechSynthesisUtterance('');
      utterance.volume = 0;
      this.synth.speak(utterance);
      this.loadVoices();
      console.log('[Voice] Force initialized on user interaction');
    }
  }

  // Test function
  test() {
    console.log('[Voice] Testing...');
    this.speak('Voice notification system online. Testing one two three.', 'normal');
  }

  // Get status for debugging
  getStatus() {
    return {
      available: !!this.synth,
      enabled: this.enabled,
      initialized: this.initialized,
      voicesLoaded: this.voicesLoaded,
      voiceCount: this.synth?.getVoices().length || 0,
      queueLength: this.speakQueue.length,
      isSpeaking: this.isSpeaking,
    };
  }
}

export const VoiceNotification = new VoiceNotificationClass();

// Auto-init on any user interaction
if (typeof window !== 'undefined') {
  const initOnInteraction = () => {
    VoiceNotification.forceInit();
    window.removeEventListener('click', initOnInteraction);
    window.removeEventListener('keydown', initOnInteraction);
    window.removeEventListener('touchstart', initOnInteraction);
  };

  window.addEventListener('click', initOnInteraction, { once: true });
  window.addEventListener('keydown', initOnInteraction, { once: true });
  window.addEventListener('touchstart', initOnInteraction, { once: true });

  // Expose to window for debugging
  (window as any).VoiceNotification = VoiceNotification;
}
