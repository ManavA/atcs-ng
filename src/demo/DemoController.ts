import type { DemoState, DemoAction, ScenarioStep } from './scenarios/types';
import { allScenarios } from './scenarios';

export const initialDemoState: DemoState = {
  isActive: false,
  mode: 'menu',
  presenterMode: false,
  currentScenario: null,
  currentStepIndex: 0,
  isTourMode: false,
  tourScenarioIndex: 0,
  tracks: [],
  alerts: [],
  predictions: [],
  pendingInteraction: null,
  interactionCompleted: false,
};

export function demoReducer(state: DemoState, action: DemoAction): DemoState {
  switch (action.type) {
    case 'OPEN_MENU':
      return {
        ...state,
        isActive: true,
        mode: 'menu',
      };

    case 'CLOSE_DEMO':
      return {
        ...initialDemoState,
      };

    case 'START_SCENARIO': {
      const scenario = action.scenario;
      const firstStep = scenario.steps[0];
      return {
        ...state,
        mode: 'playing',
        currentScenario: scenario,
        currentStepIndex: 0,
        isTourMode: false,
        tracks: scenario.initialState.tracks,
        alerts: scenario.initialState.alerts,
        predictions: scenario.initialState.predictions,
        pendingInteraction: firstStep?.interaction || null,
        interactionCompleted: false,
      };
    }

    case 'START_TOUR': {
      const firstScenario = allScenarios[0];
      const firstStep = firstScenario.steps[0];
      return {
        ...state,
        mode: 'playing',
        currentScenario: firstScenario,
        currentStepIndex: 0,
        isTourMode: true,
        tourScenarioIndex: 0,
        tracks: firstScenario.initialState.tracks,
        alerts: firstScenario.initialState.alerts,
        predictions: firstScenario.initialState.predictions,
        pendingInteraction: firstStep?.interaction || null,
        interactionCompleted: false,
      };
    }

    case 'NEXT_STEP': {
      if (!state.currentScenario) return state;

      const nextIndex = state.currentStepIndex + 1;
      const steps = state.currentScenario.steps;

      // If there are more steps in current scenario
      if (nextIndex < steps.length) {
        const nextStep = steps[nextIndex];
        return {
          ...state,
          currentStepIndex: nextIndex,
          pendingInteraction: nextStep.interaction || null,
          interactionCompleted: false,
        };
      }

      // Scenario complete
      if (state.isTourMode) {
        const nextScenarioIndex = state.tourScenarioIndex + 1;
        if (nextScenarioIndex < allScenarios.length) {
          // Move to next scenario in tour
          const nextScenario = allScenarios[nextScenarioIndex];
          const firstStep = nextScenario.steps[0];
          return {
            ...state,
            currentScenario: nextScenario,
            currentStepIndex: 0,
            tourScenarioIndex: nextScenarioIndex,
            tracks: nextScenario.initialState.tracks,
            alerts: nextScenario.initialState.alerts,
            predictions: nextScenario.initialState.predictions,
            pendingInteraction: firstStep?.interaction || null,
            interactionCompleted: false,
          };
        }
      }

      // Tour complete or single scenario complete
      return {
        ...state,
        mode: 'completed',
        pendingInteraction: null,
      };
    }

    case 'PREV_STEP': {
      if (!state.currentScenario || state.currentStepIndex === 0) return state;

      const prevIndex = state.currentStepIndex - 1;
      const prevStep = state.currentScenario.steps[prevIndex];
      return {
        ...state,
        currentStepIndex: prevIndex,
        pendingInteraction: prevStep.interaction || null,
        interactionCompleted: false,
      };
    }

    case 'PAUSE':
      return {
        ...state,
        mode: 'paused',
      };

    case 'RESUME':
      return {
        ...state,
        mode: 'playing',
      };

    case 'TOGGLE_PRESENTER_MODE':
      return {
        ...state,
        presenterMode: !state.presenterMode,
      };

    case 'SET_STATE':
      return {
        ...state,
        tracks: action.state.tracks ?? state.tracks,
        alerts: action.state.alerts ?? state.alerts,
        predictions: action.state.predictions ?? state.predictions,
      };

    case 'UPDATE_TRACKS':
      return {
        ...state,
        tracks: action.tracks,
      };

    case 'UPDATE_ALERTS':
      return {
        ...state,
        alerts: action.alerts,
      };

    case 'UPDATE_PREDICTIONS':
      return {
        ...state,
        predictions: action.predictions,
      };

    case 'COMPLETE_INTERACTION':
      return {
        ...state,
        interactionCompleted: true,
        pendingInteraction: null,
      };

    case 'SCENARIO_COMPLETE':
      return {
        ...state,
        mode: 'completed',
      };

    case 'TOUR_NEXT_SCENARIO': {
      const nextIndex = state.tourScenarioIndex + 1;
      if (nextIndex >= allScenarios.length) {
        return { ...state, mode: 'completed' };
      }
      const nextScenario = allScenarios[nextIndex];
      const firstStep = nextScenario.steps[0];
      return {
        ...state,
        currentScenario: nextScenario,
        currentStepIndex: 0,
        tourScenarioIndex: nextIndex,
        tracks: nextScenario.initialState.tracks,
        alerts: nextScenario.initialState.alerts,
        predictions: nextScenario.initialState.predictions,
        pendingInteraction: firstStep?.interaction || null,
        interactionCompleted: false,
      };
    }

    default:
      return state;
  }
}

export function getCurrentStep(state: DemoState): ScenarioStep | null {
  if (!state.currentScenario) return null;
  return state.currentScenario.steps[state.currentStepIndex] || null;
}

export function getTotalSteps(state: DemoState): number {
  if (!state.currentScenario) return 0;
  return state.currentScenario.steps.length;
}

export function getProgress(state: DemoState): number {
  const total = getTotalSteps(state);
  if (total === 0) return 0;
  return ((state.currentStepIndex + 1) / total) * 100;
}
