/**
 * DemoPlaybackController - Audio-Synchronized Demo Timing System
 *
 * Replaces fixed-duration timing with audio completion events.
 * Ensures consistent pacing across all machines regardless of:
 * - TTS API latency
 * - Network speed
 * - Browser performance
 *
 * Key features:
 * - Waits for audio to complete before advancing
 * - Applies character-aware pauses using VoicePacingManager
 * - Ensures minimum step duration
 * - Has safety timeout if audio fails
 */

import type { ScenarioStep } from './scenarios/types';
import { VoicePacingManager } from './VoicePacingManager';

/**
 * Default timing configuration
 */
const DEFAULT_CONFIG = {
  MIN_DURATION: 3000,     // Minimum time to show each step
  MAX_DURATION: 30000,    // Safety timeout if audio fails
  WAIT_FOR_AUDIO: true,   // Whether to wait for audio completion
};

/**
 * Playback state for a single step
 */
interface StepPlaybackState {
  stepId: string;
  startTime: number;
  audioCompleted: boolean;
  atcCommandCompleted: boolean;
  canceled: boolean;
}

/**
 * Callback when step should advance
 */
export type AdvanceCallback = () => void;

/**
 * Demo Playback Controller
 *
 * Manages timing and progression through demo steps with audio synchronization
 */
export class DemoPlaybackController {
  private pacingManager: VoicePacingManager;
  private currentState: StepPlaybackState | null = null;
  private timers: number[] = [];

  constructor(pacingManager?: VoicePacingManager) {
    this.pacingManager = pacingManager || new VoicePacingManager();
  }

  /**
   * Start playing a step with audio-synchronized timing
   *
   * @param step - The demo step to play
   * @param onAdvance - Callback to invoke when step should advance
   * @param onNarrationComplete - Callback to invoke after narrative audio completes
   * @param onATCCommandComplete - Callback to invoke after ATC command audio completes
   */
  async playStep(
    step: ScenarioStep,
    onAdvance: AdvanceCallback,
    onNarrationComplete?: () => void,
    onATCCommandComplete?: () => void
  ): Promise<void> {
    // Clear any existing timers
    this.clearTimers();

    // Initialize state for this step
    this.currentState = {
      stepId: step.id,
      startTime: Date.now(),
      audioCompleted: false,
      atcCommandCompleted: !step.atcCommand, // true if no command
      canceled: false,
    };

    const state = this.currentState;

    // Get timing configuration
    const minDuration = step.minDuration ?? DEFAULT_CONFIG.MIN_DURATION;
    const maxDuration = step.maxDuration ?? DEFAULT_CONFIG.MAX_DURATION;
    const waitForAudio = step.waitForAudio ?? DEFAULT_CONFIG.WAIT_FOR_AUDIO;

    // Calculate pause duration using pacing manager
    const pauseDuration = this.pacingManager.calculatePause(step, !!step.atcCommand);

    // Function to check if we should advance
    const tryAdvance = () => {
      if (!state || state.canceled) return;

      const elapsed = Date.now() - state.startTime;

      // Check if all conditions are met
      const audioReady = !waitForAudio || (state.audioCompleted && state.atcCommandCompleted);
      const minTimeElapsed = elapsed >= minDuration;

      if (audioReady && minTimeElapsed) {
        // All conditions met - advance after pause
        const timer = window.setTimeout(() => {
          if (!state.canceled) {
            onAdvance();
          }
        }, pauseDuration);
        this.timers.push(timer);
      }
    };

    // Set up safety timeout
    const safetyTimer = window.setTimeout(() => {
      if (!state.canceled) {
        console.warn(`[DemoPlaybackController] Safety timeout reached for step: ${step.id}`);
        onAdvance();
      }
    }, maxDuration);
    this.timers.push(safetyTimer);

    // If not waiting for audio, just wait minimum duration + pause
    if (!waitForAudio) {
      const timer = window.setTimeout(() => {
        if (!state.canceled) {
          onAdvance();
        }
      }, minDuration + pauseDuration);
      this.timers.push(timer);
      return;
    }

    // Provide callbacks for audio completion events
    // These should be called by the audio system (e.g., NarratorPanel)
    if (onNarrationComplete) {
      // Wrap the callback to mark narration as complete
      const wrappedCallback = () => {
        if (state && !state.canceled) {
          state.audioCompleted = true;
          onNarrationComplete();
          tryAdvance();
        }
      };
      // Store wrapped callback so external system can call it
      this.onNarrationComplete = wrappedCallback;
    }

    if (onATCCommandComplete) {
      const wrappedCallback = () => {
        if (state && !state.canceled) {
          state.atcCommandCompleted = true;
          onATCCommandComplete();
          tryAdvance();
        }
      };
      this.onATCCommandComplete = wrappedCallback;
    }
  }

  // Callbacks that external systems (NarratorPanel) will invoke
  public onNarrationComplete: (() => void) | null = null;
  public onATCCommandComplete: (() => void) | null = null;

  /**
   * Mark narration as complete (called by audio system)
   */
  markNarrationComplete(): void {
    if (this.onNarrationComplete) {
      this.onNarrationComplete();
    }
  }

  /**
   * Mark ATC command as complete (called by audio system)
   */
  markATCCommandComplete(): void {
    if (this.onATCCommandComplete) {
      this.onATCCommandComplete();
    }
  }

  /**
   * Cancel current step playback
   */
  cancel(): void {
    if (this.currentState) {
      this.currentState.canceled = true;
    }
    this.clearTimers();
    this.onNarrationComplete = null;
    this.onATCCommandComplete = null;
  }

  /**
   * Reset the controller (e.g., when demo restarts)
   */
  reset(): void {
    this.cancel();
    this.pacingManager.reset();
    this.currentState = null;
  }

  /**
   * Clear all active timers
   */
  private clearTimers(): void {
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers = [];
  }

  /**
   * Get current step state (for debugging)
   */
  getCurrentState(): StepPlaybackState | null {
    return this.currentState;
  }

  /**
   * Get pacing manager
   */
  getPacingManager(): VoicePacingManager {
    return this.pacingManager;
  }
}

/**
 * Create a global singleton instance for use across the app
 */
export const globalPlaybackController = new DemoPlaybackController();
