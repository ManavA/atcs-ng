import type { Scenario } from './types';
import { conflictDetectionScenario } from './conflict-detection';
import { weatherHazardScenario } from './weather-hazard';
import { lossOfSeparationScenario } from './loss-of-separation';
import { routeDeviationScenario } from './route-deviation';
import { sectorHandoffScenario } from './sector-handoff';
import { emergencyDeclarationScenario } from './emergency-declaration';
import { quickDemoScenario } from './quick-demo';
import { featureGuideScenario } from './feature-guide';
import { crashScenario, nmacScenario } from './dramatic-events';
import { showcaseDemoScenario } from './showcase-demo';

// Featured modes - shown prominently at top of demo menu
export const featuredModes: Scenario[] = [
  showcaseDemoScenario, // New dramatic showcase as primary demo
  quickDemoScenario,
  featureGuideScenario,
];

// Individual scenarios - shown in scenario library
export const scenarioLibrary: Scenario[] = [
  conflictDetectionScenario,
  weatherHazardScenario,
  lossOfSeparationScenario,
  routeDeviationScenario,
  sectorHandoffScenario,
  emergencyDeclarationScenario,
  crashScenario,
  nmacScenario,
];

// All scenarios combined
export const allScenarios: Scenario[] = [
  ...featuredModes,
  ...scenarioLibrary,
];

export {
  // Featured modes
  showcaseDemoScenario,
  quickDemoScenario,
  featureGuideScenario,
  // Scenarios
  conflictDetectionScenario,
  weatherHazardScenario,
  lossOfSeparationScenario,
  routeDeviationScenario,
  sectorHandoffScenario,
  emergencyDeclarationScenario,
  crashScenario,
  nmacScenario,
};

export type { Scenario, ScenarioStep, ScenarioEvent, SpotlightTarget } from './types';
