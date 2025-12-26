export type HeroPhase = 'intro' | 'contact' | 'vectors' | 'approach' | 'landing' | 'success' | 'failure';

export interface HeroCommand {
  id: string;
  label: string;
  command: string;
  correct: boolean;
  phase: HeroPhase;
}

export const HERO_PHASES: HeroPhase[] = ['intro', 'contact', 'vectors', 'approach', 'landing', 'success', 'failure'];

export const HERO_DIALOGUE = {
  intro: "Mayday mayday! This is Qantas 8. We've regained control. I fought him off! I'm Sarah, a passenger. The pilots are unconscious. I have 489 people on this A380. Please, you have to help us!",
  contact: {
    success: "Copy that! I'm looking at the instruments... there's so many buttons...",
    failure: "Wait, what? I don't understand! Please, you have to be more clear!"
  },
  vectors: {
    success: "Turning now. I found the autopilot heading dial. Is this right?",
  },
  approach: {
    success: "Descending... the runway lights! I can see them! I can see JFK!",
  },
  landing: {
    success: "We made it! We're on the ground! Thank you! Oh god, thank you so much!",
  }
};

export const HERO_COMMANDS: Record<HeroPhase, HeroCommand[]> = {
  intro: [],
  contact: [
    { id: 'c1', label: 'Stay Calm', command: 'remain calm, help is on the way', correct: true, phase: 'contact' },
    { id: 'c2', label: 'Squawk 7500', command: 'squawk 7500', correct: false, phase: 'contact' },
    { id: 'c3', label: 'Identify Location', command: 'say position and altitude', correct: false, phase: 'contact' },
  ],
  vectors: [
    { id: 'v1', label: 'Turn to JFK', command: 'turn left heading 250, direct JFK', correct: true, phase: 'vectors' },
    { id: 'v2', label: 'Hold Position', command: 'maintain present heading', correct: false, phase: 'vectors' },
    { id: 'v3', label: 'Turn Away', command: 'turn right heading 090', correct: false, phase: 'vectors' },
  ],
  approach: [
    { id: 'a1', label: 'Begin Descent', command: 'descend to 10,000, expect ILS approach runway 31L', correct: true, phase: 'approach' },
    { id: 'a2', label: 'Maintain Altitude', command: 'maintain flight level 350', correct: false, phase: 'approach' },
    { id: 'a3', label: 'Speed Up', command: 'increase speed to 400 knots', correct: false, phase: 'approach' },
  ],
  landing: [
    { id: 'l1', label: 'Final Approach', command: 'cleared ILS runway 31L, gear down, flaps full', correct: true, phase: 'landing' },
    { id: 'l2', label: 'Go Around', command: 'go around, climb to 3000', correct: false, phase: 'landing' },
    { id: 'l3', label: 'Hold Short', command: 'hold short of runway', correct: false, phase: 'landing' },
  ],
  success: [],
  failure: []
};
