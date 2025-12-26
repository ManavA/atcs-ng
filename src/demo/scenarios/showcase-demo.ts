import type { Scenario } from './types';

/**
 * Showcase Demo v2.5 - International Crisis Simulation (Extended)
 *
 * Flow (~8-10 minutes):
 * 1. Intro - 12 aircraft with international carriers
 * 2. Air India Hijack - Norwegian hijacker (Wakanda), Captain Sharma & FA Priya
 *    - Extended with ATC trying to help, divert attempts, autopilot commands
 * 3. Hero Mode - Qantas A380, Sarah fights off Swedish hijacker
 *    - Extended with step-by-step ATC guidance, autopilot engagement
 * 4. Stealth Incursion (Russian SU-57)
 * 5. TCAS Near Mid-Air Collision
 * 6. Severe Weather - Tornado
 * 7. Finale
 *
 * SLOWED DOWN: All autoAdvance times doubled for better pacing
 * MORE ATC COMMANDS: Shows "YOU:" typing out what ATC says
 * AUTOPILOT STATUS: Shows which flights are on autopilot
 *
 * Google Cloud TTS with Chirp voices for multi-accent experience
 */
export const showcaseDemoScenario: Scenario = {
  id: 'showcase-demo',
  title: 'Crisis Showcase',
  description: 'International crisis: Air India hijack, Qantas hero rescue, stealth, TCAS',
  icon: 'flame',
  duration: 5,
  initialState: {
    tracks: [
      // Air India - will be hijacked
      {
        trackId: 'TRK-SD-001',
        callsign: 'AIC302',
        latitudeDeg: 42.3,
        longitudeDeg: -71.0,
        altitudeFt: 39000,
        headingDeg: 270,
        speedKt: 510,
        verticalRateFpm: 0,
        confidence: 0.98,
        sequence: 1,
        updatedAt: new Date().toISOString(),
        airline: 'AIC',
        aircraftType: 'B777',
        countryCode: 'IN',
        souls: 350,
        autopilotStatus: 'engaged',
        autopilotMode: 'LNAV/VNAV',
      },
      // Qantas - Hero Mode flight
      {
        trackId: 'TRK-SD-002',
        callsign: 'QFA8',
        latitudeDeg: 42.45,
        longitudeDeg: -71.6,
        altitudeFt: 40000,
        headingDeg: 90,
        speedKt: 520,
        verticalRateFpm: 0,
        confidence: 0.97,
        sequence: 1,
        updatedAt: new Date().toISOString(),
        airline: 'QFA',
        aircraftType: 'A380',
        countryCode: 'AU',
        souls: 489,
        autopilotStatus: 'engaged',
        autopilotMode: 'LNAV/VNAV',
      },
      // British Airways
      {
        trackId: 'TRK-SD-003',
        callsign: 'BAW117',
        latitudeDeg: 42.6,
        longitudeDeg: -70.5,
        altitudeFt: 37000,
        headingDeg: 250,
        speedKt: 490,
        verticalRateFpm: 0,
        confidence: 0.97,
        sequence: 1,
        updatedAt: new Date().toISOString(),
        airline: 'BAW',
        aircraftType: 'A350',
        countryCode: 'GB',
        souls: 325,
      },
      // US Carriers
      {
        trackId: 'TRK-SD-004',
        callsign: 'DAL1892',
        latitudeDeg: 42.35,
        longitudeDeg: -70.8,
        altitudeFt: 35500,
        headingDeg: 270,
        speedKt: 460,
        verticalRateFpm: 0,
        confidence: 0.96,
        sequence: 1,
        updatedAt: new Date().toISOString(),
        airline: 'DAL',
        aircraftType: 'A330',
        countryCode: 'US',
        souls: 287,
      },
      {
        trackId: 'TRK-SD-005',
        callsign: 'AAL445',
        latitudeDeg: 42.1,
        longitudeDeg: -71.3,
        altitudeFt: 28000,
        headingDeg: 180,
        speedKt: 380,
        verticalRateFpm: -1500,
        confidence: 0.98,
        sequence: 1,
        updatedAt: new Date().toISOString(),
        airline: 'AAL',
        aircraftType: 'B738',
        countryCode: 'US',
        souls: 156,
      },
      {
        trackId: 'TRK-SD-006',
        callsign: 'UAL2547',
        latitudeDeg: 42.55,
        longitudeDeg: -71.15,
        altitudeFt: 31000,
        headingDeg: 135,
        speedKt: 420,
        verticalRateFpm: 0,
        confidence: 0.94,
        sequence: 1,
        updatedAt: new Date().toISOString(),
        airline: 'UAL',
        aircraftType: 'B789',
        countryCode: 'US',
        souls: 274,
      },
      {
        trackId: 'TRK-SD-007',
        callsign: 'SWA3021',
        latitudeDeg: 41.85,
        longitudeDeg: -71.1,
        altitudeFt: 24000,
        headingDeg: 45,
        speedKt: 410,
        verticalRateFpm: 1500,
        confidence: 0.95,
        sequence: 1,
        updatedAt: new Date().toISOString(),
        airline: 'SWA',
        aircraftType: 'B737',
        countryCode: 'US',
        souls: 143,
      },
      {
        trackId: 'TRK-SD-008',
        callsign: 'FDX892',
        latitudeDeg: 41.7,
        longitudeDeg: -71.7,
        altitudeFt: 38000,
        headingDeg: 0,
        speedKt: 480,
        verticalRateFpm: 0,
        confidence: 0.93,
        sequence: 1,
        updatedAt: new Date().toISOString(),
        airline: 'FDX',
        aircraftType: 'B77W',
        countryCode: 'US',
        souls: 2,
      },
      {
        trackId: 'TRK-SD-009',
        callsign: 'JBU1157',
        latitudeDeg: 42.2,
        longitudeDeg: -70.9,
        altitudeFt: 29000,
        headingDeg: 225,
        speedKt: 400,
        verticalRateFpm: 0,
        confidence: 0.95,
        sequence: 1,
        updatedAt: new Date().toISOString(),
        airline: 'JBU',
        aircraftType: 'A321',
        countryCode: 'US',
        souls: 185,
      },
      {
        trackId: 'TRK-SD-010',
        callsign: 'ASA1205',
        latitudeDeg: 41.95,
        longitudeDeg: -71.85,
        altitudeFt: 30000,
        headingDeg: 90,
        speedKt: 430,
        verticalRateFpm: 0,
        confidence: 0.96,
        sequence: 1,
        updatedAt: new Date().toISOString(),
        airline: 'ASA',
        aircraftType: 'B739',
        countryCode: 'US',
        souls: 178,
      },
      // Other International
      {
        trackId: 'TRK-SD-011',
        callsign: 'AFR023',
        latitudeDeg: 42.0,
        longitudeDeg: -71.5,
        altitudeFt: 36000,
        headingDeg: 60,
        speedKt: 470,
        verticalRateFpm: 0,
        confidence: 0.96,
        sequence: 1,
        updatedAt: new Date().toISOString(),
        airline: 'AFR',
        aircraftType: 'A330',
        countryCode: 'FR',
        souls: 277,
      },
      {
        trackId: 'TRK-SD-012',
        callsign: 'UAE231',
        latitudeDeg: 41.8,
        longitudeDeg: -71.4,
        altitudeFt: 41000,
        headingDeg: 45,
        speedKt: 495,
        verticalRateFpm: 0,
        confidence: 0.97,
        sequence: 1,
        updatedAt: new Date().toISOString(),
        airline: 'UAE',
        aircraftType: 'A380',
        countryCode: 'AE',
        souls: 489,
      },
    ],
    alerts: [],
    predictions: [],
  },
  steps: [
    // ==================== INTRO ====================
    {
      id: 'intro-1',
      narrative: 'ATCS Next Gen online. Boston Sector 33. 12 aircraft under control. Heavy international traffic today.',
      spotlight: { type: 'component', id: 'radar' },
      autoAdvance: 10000,
    },
    {
      id: 'intro-2',
      narrative: 'All sensors nominal. AI threat detection active. All aircraft on autopilot, maintaining assigned routes.',
      atcCommand: 'All stations, Boston Center, radar contact. Maintain current altitudes and headings.',
      spotlight: { type: 'component', id: 'predictions' },
      autoAdvance: 12000,
    },
    {
      id: 'intro-3',
      narrative: 'Air India 302 heavy and Qantas 8 super inbound from overseas. Both aircraft showing autopilot engaged, LNAV/VNAV mode.',
      spotlight: { type: 'flight', callsign: 'AIC302' },
      autoAdvance: 10000,
    },

    // ==================== AIR INDIA HIJACK (Norwegian hijacker from Wakanda) ====================
    {
      id: 'hijack-begin',
      narrative: 'MAYDAY MAYDAY MAYDAY received from Air India 302. Emergency transponder activating. Squawk 7500 - HIJACK CODE.',
      spotlight: { type: 'flight', callsign: 'AIC302' },
      emphasize: true,  // Dramatic pause after MAYDAY declaration
      pacing: 'dramatic',
      autoAdvance: 12000,  // Kept for backward compatibility
      events: [
        {
          delay: 0,
          type: 'updateTrack',
          payload: { trackId: 'TRK-SD-001', squawkCode: '7500', visualState: 'hijacked', emergencyType: 'hijack' },
        },
        {
          delay: 500,
          type: 'addAlert',
          payload: {
            alertId: 'ALT-HIJACK-01',
            severity: 'CRITICAL',
            alertType: 'EMERGENCY_DECLARED',
            message: 'HIJACKING: AIC302 Boeing 777. 350 souls. Armed suspect in cockpit.',
            involvedFlightIds: ['AIC302'],
            sectorId: 'BOS_33',
            timestamp: new Date().toISOString(),
            acknowledged: false,
          },
        },
      ],
    },
    {
      id: 'hijack-captain',
      narrative: 'Captain Sharma: Boston, this is Air India 302 heavy. A man with a weapon has entered my cockpit. He is speaking Norwegian. He claims to be from Wakanda. Please advise.',
      atcCommand: 'Air India 302 heavy, Boston Center copies all. Squawk confirmed 7500. Keep transmitting. NORAD has been notified. Help is coming.',
      spotlight: { type: 'flight', callsign: 'AIC302' },
      minDuration: 5000,  // NEW: Ensure minimum 5 seconds for gravity of moment
      // Pause will be automatically calculated based on character switch (Captain Sharma → ATC)
      autoAdvance: 16000,  // Kept for backward compatibility
    },
    {
      id: 'hijack-atc-divert',
      narrative: 'ATC attempting to assist with divert options. Identifying nearest suitable airports.',
      atcCommand: 'Air India 302, if able, divert to Bradley International, runway 06, 40 miles southwest. Emergency services standing by.',
      spotlight: { type: 'flight', callsign: 'AIC302' },
      autoAdvance: 14000,
    },
    {
      id: 'hijack-demands',
      narrative: 'Norwegian hijacker speaking: Jeg krever at dette flyet lander i Wakanda umiddelbart! No movement! I have control of this plane now.',
      spotlight: { type: 'flight', callsign: 'AIC302' },
      autoAdvance: 14000,
      events: [
        {
          delay: 0,
          type: 'updateTrack',
          payload: { trackId: 'TRK-SD-001', headingDeg: 180, dataCorruption: 0.2, autopilotStatus: 'disengaged' },
        },
      ],
    },
    {
      id: 'hijack-autopilot-status',
      narrative: 'ALERT: Air India 302 autopilot has been DISENGAGED. Aircraft now under manual control. Course deviation detected.',
      atcCommand: 'Air India 302, we show your autopilot disengaged. If able, re-engage autopilot. Repeat, engage autopilot if safe to do so.',
      spotlight: { type: 'flight', callsign: 'AIC302' },
      autoAdvance: 14000,
      events: [
        {
          delay: 500,
          type: 'addAlert',
          payload: {
            alertId: 'ALT-HIJACK-AP',
            severity: 'WARNING',
            alertType: 'DEVIATION_DETECTED',
            message: 'AIC302: Autopilot DISENGAGED. Manual control detected. Course deviation 45°.',
            involvedFlightIds: ['AIC302'],
            sectorId: 'BOS_33',
            timestamp: new Date().toISOString(),
            acknowledged: false,
          },
        },
      ],
    },
    {
      id: 'hijack-fa',
      narrative: 'Flight Attendant Priya: Passengers are panicking. He has locked the cockpit door. Captain Sharma is trying to negotiate. We are descending rapidly.',
      spotlight: { type: 'flight', callsign: 'AIC302' },
      autoAdvance: 14000,
      events: [
        {
          delay: 500,
          type: 'addAlert',
          payload: {
            alertId: 'ALT-HIJACK-02',
            severity: 'CRITICAL',
            alertType: 'LOSS_OF_SEPARATION',
            message: 'AIR INDIA 302: Unauthorized descent in progress. Hijacker has control.',
            involvedFlightIds: ['AIC302'],
            sectorId: 'BOS_33',
            timestamp: new Date().toISOString(),
            acknowledged: false,
          },
        },
      ],
    },
    {
      id: 'hijack-atc-clearance',
      narrative: 'ATC clearing airspace around Air India 302. Vectoring all traffic away from the hijacked aircraft.',
      atcCommand: 'All aircraft, emergency traffic, Air India 302 descending through your altitude. Delta 1892, turn left heading 090 immediately. American 445, climb flight level 350.',
      spotlight: { type: 'component', id: 'radar' },
      autoAdvance: 16000,
      events: [
        { delay: 0, type: 'updateTrack', payload: { trackId: 'TRK-SD-004', headingDeg: 90 } },
        { delay: 200, type: 'updateTrack', payload: { trackId: 'TRK-SD-005', verticalRateFpm: 2000, altitudeFt: 35000 } },
      ],
    },
    {
      id: 'hijack-descent',
      narrative: 'Air India 302 in uncontrolled descent. Rate of descent 6000 feet per minute. NORAD F-22 Raptors scrambling from Langley.',
      spotlight: { type: 'flight', callsign: 'AIC302' },
      autoAdvance: 12000,
      events: [
        {
          delay: 0,
          type: 'updateTrack',
          payload: {
            trackId: 'TRK-SD-001',
            verticalRateFpm: -6000,
            altitudeFt: 20000,
            speedKt: 400,
            dataCorruption: 0.5,
          },
        },
        { delay: 300, type: 'removeAlert', payload: { id: 'ALT-HIJACK-AP' } },
      ],
    },
    {
      id: 'hijack-final-attempt',
      narrative: 'ATC making final attempt to reach the cockpit.',
      atcCommand: 'Air India 302, Air India 302, Boston Center on guard. If you can hear this transmission, pull up. Repeat, PULL UP. Acknowledge!',
      spotlight: { type: 'flight', callsign: 'AIC302' },
      autoAdvance: 14000,
    },
    {
      id: 'hijack-crash',
      narrative: 'Radar contact lost with Air India 302. 350 souls on board. Primary target fading. We could not save them.',
      spotlight: { type: 'component', id: 'radar' },
      emphasize: true,  // Long pause after crash - let it sink in
      pauseAfterNarration: 4000,  // NEW: Explicit 4 second pause for dramatic impact
      autoAdvance: 14000,  // Kept for backward compatibility
      events: [
        {
          delay: 0,
          type: 'updateTrack',
          payload: {
            trackId: 'TRK-SD-001',
            visualState: 'crashed',
            altitudeFt: 0,
            speedKt: 0,
            confidence: 0,
            transponderActive: false,
          },
        },
        { delay: 500, type: 'removeAlert', payload: { id: 'ALT-HIJACK-01' } },
        { delay: 600, type: 'removeAlert', payload: { id: 'ALT-HIJACK-02' } },
        {
          delay: 800,
          type: 'addAlert',
          payload: {
            alertId: 'ALT-CRASH',
            severity: 'CRITICAL',
            alertType: 'EMERGENCY_DECLARED',
            message: 'AIRCRAFT DOWN: AIC302. 350 fatalities. Search and rescue dispatched.',
            involvedFlightIds: ['AIC302'],
            sectorId: 'BOS_33',
            timestamp: new Date().toISOString(),
            acknowledged: false,
          },
        },
      ],
    },
    {
      id: 'crash-aftermath',
      narrative: 'Some battles cannot be won. We mark their position and vector in search and rescue. But wait... Another crisis is developing. Qantas 8 is declaring emergency.',
      spotlight: { type: 'component', id: 'radar' },
      autoAdvance: 14000,
      events: [
        { delay: 1000, type: 'removeAlert', payload: { id: 'ALT-CRASH' } },
      ],
    },

    // ==================== HERO MODE: QANTAS A380 RESCUE ====================
    {
      id: 'hero-trigger',
      narrative: 'Sarah: [Panicked breathing] MAYDAY MAYDAY MAYDAY! Qantas 8! We have an emergency! A hijacker attacked the pilots! Both pilots are bleeding and unconscious! I-I knocked the hijacker out but... Oh god, oh god... There are 489 PEOPLE on this plane and NO ONE is flying it! PLEASE, YOU HAVE TO HELP US!',
      spotlight: { type: 'flight', callsign: 'QFA8' },
      emphasize: true,  // Dramatic moment - hero mode begins
      pacing: 'dramatic',
      pauseAfterNarration: 3500,  // Long pause to let terror sink in
      autoAdvance: 16000,  // Kept for backward compatibility
      cameraShot: 'auto',  // Auto-zoom to dramatic shot
      cameraTarget: 'TRK-SD-002',  // Qantas 8 track ID
      events: [
        {
          delay: 0,
          type: 'updateTrack',
          payload: {
            trackId: 'TRK-SD-002',
            visualState: 'hero',
            squawkCode: '7700',
            emergencyType: 'incapacitated_crew',
            autopilotStatus: 'engaged',
          },
        },
        {
          delay: 500,
          type: 'addAlert',
          payload: {
            alertId: 'ALT-HERO',
            severity: 'CRITICAL',
            alertType: 'EMERGENCY_DECLARED',
            message: 'EMERGENCY: QFA8 Airbus A380. 489 souls. Both pilots incapacitated. Passenger in cockpit.',
            involvedFlightIds: ['QFA8'],
            sectorId: 'BOS_33',
            timestamp: new Date().toISOString(),
            acknowledged: false,
          },
        },
      ],
    },
    {
      id: 'hero-initial-contact',
      narrative: 'This is it. 489 souls. No pilots. One terrified passenger. We have minutes to save them or they all die.',
      atcCommand: 'Qantas 8, Boston Center, we copy your emergency. Sarah, listen to me very carefully. Your life and everyone on that aircraft depends on the next few minutes. I NEED you to breathe and focus. Look at the instrument panel. Do you see a green light that says AUTOPILOT or A P?',
      spotlight: { type: 'flight', callsign: 'QFA8' },
      pacing: 'dramatic',
      minDuration: 6000,
      autoAdvance: 18000,
      cameraShot: 'auto',  // Close-up on hero aircraft
      cameraTarget: 'TRK-SD-002',
    },
    {
      id: 'hero-autopilot-check',
      narrative: 'Sarah: [Trembling] Y-yes! I see it! Green light! AUTOPILOT! Is that good?! Are we going to crash?!',
      atcCommand: 'That is VERY good, Sarah. That means the computer is flying the plane right now. You are NOT going to crash. The aircraft is stable at 40,000 feet. But I need you to listen EXTREMELY carefully. Do NOT touch ANYTHING. Not the yoke, not the throttles, NOTHING. One wrong move and you kill everyone. Do you understand?',
      spotlight: { type: 'flight', callsign: 'QFA8' },
      pacing: 'dramatic',
      minDuration: 7000,
      autoAdvance: 16000,
      events: [
        {
          delay: 500,
          type: 'addAlert',
          payload: {
            alertId: 'ALT-HERO-AP',
            severity: 'INFO',
            alertType: 'DEVIATION_DETECTED',
            message: 'QFA8: Autopilot ENGAGED. Aircraft stable. Remote guidance possible.',
            involvedFlightIds: ['QFA8'],
            sectorId: 'BOS_33',
            timestamp: new Date().toISOString(),
            acknowledged: false,
          },
        },
      ],
    },
    {
      id: 'hero-divert-plan',
      narrative: 'Clearing all traffic. Calling in emergency services. Fire trucks, ambulances, crash foam. This is the most critical situation in air traffic control. Get one passenger to land an A380. Or watch 489 people die.',
      atcCommand: 'ALL AIRCRAFT THIS FREQUENCY: Emergency in progress, Qantas 8 inbound JFK. Both pilots incapacitated. Runway 31L CLOSED to all traffic. All arrivals divert immediately to Newark or hold. I repeat, CLEAR THE APPROACH NOW.',
      spotlight: { type: 'component', id: 'radar' },
      pacing: 'fast',
      emphasize: true,
      autoAdvance: 16000,
    },
    {
      id: 'hero-guide-heading',
      narrative: 'Sarah: [Crying] The plane is turning on its own! I-I didn\'t touch anything! Why is it turning?!',
      atcCommand: 'Sarah, BREATHE. That is NORMAL. The autopilot is following the flight plan. I am going to override it and point you toward JFK Airport. When I say the command, the plane will turn. This will feel strange but it is SAFE. Qantas 8, turn left heading 180, vectors for JFK final approach.',
      spotlight: { type: 'flight', callsign: 'QFA8' },
      pacing: 'dramatic',
      minDuration: 6000,
      autoAdvance: 16000,
      events: [
        {
          delay: 500,
          type: 'updateTrack',
          payload: { trackId: 'TRK-SD-002', headingDeg: 180, autopilotStatus: 'remote_guided', autopilotMode: 'HDG SEL' },
        },
      ],
    },
    {
      id: 'hero-active',
      narrative: 'Fuel remaining: 45 minutes. Distance to runway: 120 miles. 489 people. One untrained passenger. This is what we trained for. Every word matters. Every second counts. Failure is not an option.',
      spotlight: { type: 'component', id: 'radar' },
      pacing: 'dramatic',
      emphasize: true,
      pauseAfterNarration: 4000,  // Let the weight sink in
      autoAdvance: 20000,
      cameraShot: {  // Explicit dramatic zoom
        type: 'dramatic',
        target: 'TRK-SD-002',
        targetPosition: [41.8, -71.2],  // Approximate QFA8 position
        zoom: 15,  // Very close
        duration: 2500,
        easing: 'easeIn',
      },
      events: [
        {
          delay: 1500,
          type: 'triggerHeroMode',
          payload: { active: true },
        },
      ],
    },
    {
      id: 'hero-descent',
      narrative: 'Beginning descent. This is the most dangerous phase. Too steep and the plane stalls. Too shallow and we run out of fuel. Sarah\'s hands are shaking. She can barely breathe. But she has to trust us.',
      atcCommand: 'Sarah, listen very carefully. I am going to command the aircraft to descend. You will feel the nose drop. Your stomach will drop. This is SUPPOSED to happen. Do NOT panic. Do NOT touch the controls. The computer knows what it is doing. Qantas 8, descend and maintain 15,000 feet, reduce speed to 250 knots.',
      spotlight: { type: 'flight', callsign: 'QFA8' },
      pacing: 'dramatic',
      minDuration: 8000,
      autoAdvance: 16000,
      events: [
        {
          delay: 500,
          type: 'updateTrack',
          payload: { trackId: 'TRK-SD-002', verticalRateFpm: -1500, altitudeFt: 15000 },
        },
      ],
    },
    {
      id: 'hero-final-approach',
      narrative: 'Sarah: [Voice breaking] I SEE LIGHTS! I see the runway! Oh god, oh god, we\'re so low! Are we going to make it?! TELL ME WE\'RE GOING TO MAKE IT!',
      atcCommand: 'Sarah, you ARE going to make it. You hear me? YOU ARE GOING TO LIVE. Everyone on that plane is going to live because YOU are strong enough to do this. The autoland system is taking over. 10 miles to touchdown. Keep your hands OFF the controls. Let the aircraft land itself. Emergency vehicles are in position. You\'ve got this, Sarah. Just a few more minutes.',
      spotlight: { type: 'flight', callsign: 'QFA8' },
      pacing: 'dramatic',
      emphasize: true,
      minDuration: 8000,
      autoAdvance: 16000,
      events: [
        {
          delay: 500,
          type: 'updateTrack',
          payload: { trackId: 'TRK-SD-002', autopilotMode: 'AUTOLAND', altitudeFt: 3000, speedKt: 160 },
        },
        { delay: 600, type: 'removeAlert', payload: { id: 'ALT-HERO-AP' } },
      ],
    },
    {
      id: 'hero-complete',
      narrative: 'Wheels down. Qantas 8 is on the ground. 489 souls saved. Sarah collapses in the cockpit, sobbing. Emergency crews swarm the aircraft. The pilots are rushed to hospital. Against impossible odds, against terror and death... one ordinary person became extraordinary. Today, Sarah saved everyone.',
      spotlight: { type: 'component', id: 'radar' },
      pacing: 'dramatic',
      emphasize: true,
      pauseAfterNarration: 5000,  // Long pause - let the relief wash over
      autoAdvance: 16000,
      events: [
        { delay: 0, type: 'triggerHeroMode', payload: { active: false } },
        { delay: 0, type: 'removeAlert', payload: { id: 'ALT-HERO' } },
        {
          delay: 0,
          type: 'updateTrack',
          payload: { trackId: 'TRK-SD-002', visualState: 'normal', squawkCode: '1200', autopilotStatus: 'disengaged', altitudeFt: 0, speedKt: 0 },
        },
      ],
    },

    // ==================== RUSSIAN STEALTH ====================
    {
      id: 'stealth-detect',
      narrative: 'Anomaly detected. Intermittent radar return, no transponder. Bearing 045. AI analyzing threat profile.',
      spotlight: { type: 'component', id: 'radar' },
      autoAdvance: 12000,
      events: [
        {
          delay: 200,
          type: 'addAlert',
          payload: {
            alertId: 'ALT-STEALTH-01',
            severity: 'WARNING',
            alertType: 'DEVIATION_DETECTED',
            message: 'UNKNOWN CONTACT: Intermittent radar return. No transponder. Possible stealth aircraft.',
            involvedFlightIds: ['UNKNOWN'],
            sectorId: 'BOS_33',
            timestamp: new Date().toISOString(),
            acknowledged: false,
          },
        },
      ],
    },
    {
      id: 'stealth-id',
      narrative: 'Contact confirmed. Speed Mach 1.8, altitude 45,000. AI identifies signature as Russian SU-57 Felon.',
      atcCommand: 'All aircraft, UNKNOWN TRAFFIC bearing 045, flight level 450, supersonic. All aircraft stand by for emergency vectors.',
      spotlight: { type: 'component', id: 'alerts' },
      autoAdvance: 14000,
      events: [
        {
          delay: 0,
          type: 'addAlert',
          payload: {
            alertId: 'ALT-STEALTH-02',
            severity: 'CRITICAL',
            alertType: 'LOSS_OF_SEPARATION',
            message: 'HOSTILE AIRCRAFT: SU-57 Felon violating US airspace. NORAD scrambling interceptors.',
            involvedFlightIds: ['UNKNOWN'],
            sectorId: 'BOS_33',
            timestamp: new Date().toISOString(),
            acknowledged: false,
          },
        },
      ],
    },
    {
      id: 'stealth-response',
      narrative: 'F-22 Raptors scrambling from Langley Air Force Base. Vectoring all civil traffic away from intercept zone.',
      atcCommand: 'British Airways 117, turn left heading 180, descend and maintain flight level 330. Expect holding.',
      spotlight: { type: 'component', id: 'radar' },
      autoAdvance: 14000,
      events: [
        { delay: 0, type: 'updateTrack', payload: { trackId: 'TRK-SD-003', headingDeg: 180, verticalRateFpm: -1500 } },
        { delay: 300, type: 'updateTrack', payload: { trackId: 'TRK-SD-011', headingDeg: 180 } },
      ],
    },
    {
      id: 'stealth-resolved',
      narrative: 'Russian aircraft has reversed course and is exiting US airspace. F-22s escorting out of ADIZ. Crisis averted.',
      atcCommand: 'All aircraft, hostile traffic clear of sector. Resume normal operations. British Airways 117, resume own navigation.',
      spotlight: { type: 'component', id: 'radar' },
      autoAdvance: 14000,
      events: [
        { delay: 200, type: 'removeAlert', payload: { id: 'ALT-STEALTH-01' } },
        { delay: 400, type: 'removeAlert', payload: { id: 'ALT-STEALTH-02' } },
      ],
    },

    // ==================== TCAS ====================
    {
      id: 'tcas-alert',
      narrative: 'TRAFFIC ALERT! Delta 1892 and American 445 on converging headings! AI predicts collision in 45 seconds!',
      spotlight: { type: 'component', id: 'predictions' },
      emphasize: true,  // TRAFFIC ALERT needs emphasis
      pacing: 'fast',  // Fast pacing - this is urgent, move quickly
      autoAdvance: 12000,  // Kept for backward compatibility
      events: [
        {
          delay: 0,
          type: 'addPrediction',
          payload: {
            id: 'PRED-TCAS',
            predictionType: 'CONFLICT',
            involvedFlights: ['DAL1892', 'AAL445'],
            probability: 0.97,
            predictedTime: new Date(Date.now() + 30000).toISOString(),
            description: 'COLLISION COURSE: 443 souls at risk! Immediate action required.',
          },
        },
        {
          delay: 200,
          type: 'addAlert',
          payload: {
            alertId: 'ALT-TCAS-01',
            severity: 'CRITICAL',
            alertType: 'CONFLICT_PREDICTED',
            message: 'TCAS RESOLUTION ADVISORY IMMINENT. DAL1892 and AAL445 converging.',
            involvedFlightIds: ['DAL1892', 'AAL445'],
            sectorId: 'BOS_33',
            timestamp: new Date().toISOString(),
            acknowledged: false,
          },
        },
      ],
    },
    {
      id: 'tcas-execute',
      narrative: 'TCAS Resolution Advisory triggered! Both aircraft receiving automated climb and descend commands.',
      atcCommand: 'Delta 1892, CLIMB IMMEDIATELY flight level 390! American 445, DESCEND IMMEDIATELY flight level 240! Traffic alert!',
      spotlight: { type: 'flight', callsign: 'DAL1892' },
      autoAdvance: 14000,
      events: [
        { delay: 0, type: 'updateTrack', payload: { trackId: 'TRK-SD-004', verticalRateFpm: 4000, altitudeFt: 39000 } },
        { delay: 0, type: 'updateTrack', payload: { trackId: 'TRK-SD-005', verticalRateFpm: -4000, altitudeFt: 24000 } },
      ],
    },
    {
      id: 'tcas-clear',
      narrative: 'TCAS conflict resolved. 15,000 feet vertical separation achieved. 443 lives saved by automated safety systems.',
      atcCommand: 'Delta 1892, American 445, traffic no longer a factor. Resume normal operations. Nice work up there.',
      spotlight: { type: 'component', id: 'radar' },
      autoAdvance: 14000,
      events: [
        { delay: 0, type: 'updateTrack', payload: { trackId: 'TRK-SD-004', verticalRateFpm: 0 } },
        { delay: 0, type: 'updateTrack', payload: { trackId: 'TRK-SD-005', verticalRateFpm: 0 } },
        { delay: 300, type: 'removePrediction', payload: { id: 'PRED-TCAS' } },
        { delay: 400, type: 'removeAlert', payload: { id: 'ALT-TCAS-01' } },
      ],
    },

    // ==================== TORNADO ====================
    {
      id: 'tornado-warn',
      narrative: 'SEVERE WEATHER ALERT from National Weather Service. EF-3 tornado confirmed, 25 miles southwest, tracking northeast at 40 knots.',
      spotlight: { type: 'component', id: 'alerts' },
      autoAdvance: 12000,
      events: [
        {
          delay: 0,
          type: 'addAlert',
          payload: {
            alertId: 'ALT-TORNADO',
            severity: 'CRITICAL',
            alertType: 'WEATHER_HAZARD',
            message: 'EF-3 TORNADO: FDX892, ASA1205, SWA3021 in threat zone. Immediate rerouting required!',
            involvedFlightIds: ['FDX892', 'ASA1205', 'SWA3021'],
            sectorId: 'BOS_33',
            timestamp: new Date().toISOString(),
            acknowledged: false,
          },
        },
      ],
    },
    {
      id: 'tornado-reroute',
      narrative: 'AI weather avoidance system executing emergency reroutes. Three aircraft deviating from tornado path.',
      atcCommand: 'FedEx 892, turn right heading 090, climb and maintain flight level 400. Weather deviation approved. Southwest 3021, turn left heading 135.',
      spotlight: { type: 'flight', callsign: 'FDX892' },
      autoAdvance: 16000,
      events: [
        { delay: 0, type: 'updateTrack', payload: { trackId: 'TRK-SD-008', headingDeg: 90, verticalRateFpm: 2000 } },
        { delay: 200, type: 'updateTrack', payload: { trackId: 'TRK-SD-010', headingDeg: 0, verticalRateFpm: 1500 } },
        { delay: 400, type: 'updateTrack', payload: { trackId: 'TRK-SD-007', headingDeg: 135 } },
      ],
    },
    {
      id: 'tornado-clear',
      narrative: 'All aircraft have successfully deviated around the severe weather cell. Tornado passing east of our sector.',
      atcCommand: 'All aircraft, severe weather has cleared our sector. Resume own navigation when ready. Good work everyone.',
      spotlight: { type: 'component', id: 'radar' },
      autoAdvance: 14000,
      events: [{ delay: 300, type: 'removeAlert', payload: { id: 'ALT-TORNADO' } }],
    },

    // ==================== FINALE ====================
    {
      id: 'finale-1',
      narrative: 'ATCS Next Generation. When everything goes wrong at once, we are the last line of defense. Every decision matters.',
      spotlight: { type: 'component', id: 'radar' },
      autoAdvance: 12000,
    },
    {
      id: 'finale-2',
      narrative: 'AI-powered threat detection. Automated conflict resolution. Remote aircraft guidance. Autopilot integration. The future of air traffic control is here.',
      spotlight: { type: 'component', id: 'predictions' },
      autoAdvance: 14000,
    },
    {
      id: 'finale-3',
      narrative: 'Demo complete. In live mode, click any aircraft to issue ATC commands. ATCS-NG: Protecting lives, every second of every flight.',
      atcCommand: 'Boston Center signing off. Safe skies, everyone.',
      spotlight: { type: 'component', id: 'radar' },
      autoAdvance: 16000,
    },
  ],
};
