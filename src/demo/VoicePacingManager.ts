/**
 * VoicePacingManager - Character-Aware Voice Pacing System
 *
 * Calculates appropriate pause durations between demo steps based on:
 * - Speaker/character changes (narrator → pilot → ATC)
 * - Content emphasis (MAYDAY, CRITICAL, emergency situations)
 * - Step pacing classification (fast, normal, dramatic)
 *
 * This prevents voice crosstalk and creates natural conversation rhythm.
 */

import type { ScenarioStep } from './scenarios/types';
import type { VoiceCharacter } from '../audio/CloudTTS';

/**
 * Pacing rules defining pause durations for different scenarios
 */
interface PacingRules {
  /** Pause when same speaker continues (default: 800ms) */
  sameSpeakerPause: number;

  /** Pause when character switches (narrator → pilot) (default: 1500ms) */
  characterSwitchPause: number;

  /** Pause after dramatic/critical moments (MAYDAY, crash, etc.) (default: 3000ms) */
  dramaticPause: number;

  /** Pause after ATC command display finishes typing (default: 1000ms) */
  commandTypingPause: number;

  /** Fast pacing multiplier (default: 0.6) */
  fastPacingMultiplier: number;

  /** Dramatic pacing multiplier (default: 1.5) */
  dramaticPacingMultiplier: number;
}

/**
 * Default pacing configuration
 */
const DEFAULT_PACING_RULES: PacingRules = {
  sameSpeakerPause: 800,
  characterSwitchPause: 1500,
  dramaticPause: 3000,
  commandTypingPause: 1000,
  fastPacingMultiplier: 0.6,
  dramaticPacingMultiplier: 1.5,
};

/**
 * Keywords that indicate dramatic or critical moments
 */
const DRAMATIC_KEYWORDS = [
  'MAYDAY',
  'EMERGENCY',
  'CRITICAL',
  'ALERT',
  'HIJACK',
  'CRASH',
  'COLLISION',
  'CONFLICT',
  'WARNING',
  'DANGER',
  'FIRE',
  'EXPLOSION',
];

/**
 * Detects the voice character from narrative text
 * (Duplicated from NarratorPanel for now - could be extracted to shared utility)
 */
function detectCharacterFromNarrative(text: string): VoiceCharacter {
  // Check for specific character dialogue markers
  if (/Captain Sharma:|Air India 302.*Captain/i.test(text)) return 'captain_sharma';
  if (/Flight Attendant Priya:|Priya:/i.test(text)) return 'fa_priya';
  if (/Captain Williams:|Qantas.*Captain/i.test(text)) return 'captain_williams';
  if (/Sarah:/i.test(text)) return 'sarah';
  if (/hijacker.*Norwegian|Norwegian.*hijacker|Jeg krever|Wakanda/i.test(text)) return 'hijacker_norway';
  if (/hijacker.*Swedish|Swedish.*hijacker|Nej\.\.\.|Vakanda för/i.test(text)) return 'hijacker_sweden';
  if (/British Airways.*crew|BAW.*crew/i.test(text)) return 'british_crew';
  if (/Controller E97:|Echo-Niner-Seven/i.test(text)) return 'controller_e97';
  if (/Boston Center|Tower|Approach|Departure|ATC:/i.test(text)) return 'atc';
  return 'narrator';
}

/**
 * Checks if narrative contains dramatic keywords
 */
function isDramatic(narrative: string): boolean {
  const upperText = narrative.toUpperCase();
  return DRAMATIC_KEYWORDS.some(keyword => upperText.includes(keyword));
}

/**
 * Voice Pacing Manager class
 */
export class VoicePacingManager {
  private rules: PacingRules;
  private lastSpeaker: VoiceCharacter | null = null;

  constructor(customRules?: Partial<PacingRules>) {
    this.rules = { ...DEFAULT_PACING_RULES, ...customRules };
  }

  /**
   * Calculate pause duration for a given step
   *
   * @param step - The demo step to calculate pause for
   * @param hasATCCommand - Whether the step has an ATC command following the narrative
   * @returns Pause duration in milliseconds
   */
  calculatePause(step: ScenarioStep, hasATCCommand: boolean = false): number {
    // If step explicitly specifies pause duration, use it
    if (step.pauseAfterNarration !== undefined) {
      return step.pauseAfterNarration;
    }

    // Detect current speaker
    const currentSpeaker = detectCharacterFromNarrative(step.narrative);

    // Start with base pause
    let pause: number;

    // Check if emphasize flag is set or content is dramatic
    const isEmphatic = step.emphasize || isDramatic(step.narrative);

    if (isEmphatic) {
      // Dramatic moment - long pause for impact
      pause = this.rules.dramaticPause;
    } else if (this.lastSpeaker && currentSpeaker !== this.lastSpeaker) {
      // Character switch - medium pause for speaker transition
      pause = this.rules.characterSwitchPause;
    } else {
      // Same speaker continuing - short pause
      pause = this.rules.sameSpeakerPause;
    }

    // Apply pacing multiplier based on step.pacing
    const pacing = step.pacing || 'normal';
    if (pacing === 'fast') {
      pause *= this.rules.fastPacingMultiplier;
    } else if (pacing === 'dramatic') {
      pause *= this.rules.dramaticPacingMultiplier;
    }

    // If there's an ATC command, add additional pause after it
    if (hasATCCommand) {
      pause += this.rules.commandTypingPause;
    }

    // Update last speaker for next calculation
    this.lastSpeaker = currentSpeaker;

    return Math.round(pause);
  }

  /**
   * Reset the pacing state (e.g., when demo restarts)
   */
  reset(): void {
    this.lastSpeaker = null;
  }

  /**
   * Get the current speaker (last detected character)
   */
  getCurrentSpeaker(): VoiceCharacter | null {
    return this.lastSpeaker;
  }

  /**
   * Update pacing rules dynamically
   */
  updateRules(newRules: Partial<PacingRules>): void {
    this.rules = { ...this.rules, ...newRules };
  }

  /**
   * Get current pacing rules
   */
  getRules(): PacingRules {
    return { ...this.rules };
  }
}

/**
 * Singleton instance for global use
 */
export const globalPacingManager = new VoicePacingManager();
