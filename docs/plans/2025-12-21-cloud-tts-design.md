# Cloud TTS Integration Design

## Overview

Replace Web Speech API with Google Cloud Text-to-Speech (Chirp 3 HD voices) for high-quality multi-accent voice synthesis in demo scenarios.

## Architecture

```
┌─────────────────┐     ┌──────────────────────┐
│  CloudTTS       │────▶│ Google Cloud TTS API │
│  Service        │     │  texttospeech.v1     │
└─────────────────┘     └──────────────────────┘
         │
         ▼
┌─────────────────┐
│  Audio Playback │
│  (HTMLAudioElement) │
└─────────────────┘
```

## Voice Mapping

| Character | Flight | Language | Voice ID |
|-----------|--------|----------|----------|
| Narrator | — | en-US | en-US-Chirp3-HD-Achernar |
| ATC Boston Center | — | en-US | en-US-Chirp3-HD-Fenrir |
| Captain Sharma | AIC302 | en-IN | en-IN-Chirp3-HD-Charon |
| FA Priya | AIC302 | en-IN | en-IN-Chirp3-HD-Leda |
| Hijacker (Wakanda) | AIC302 | no-NO | no-NO-Chirp3-HD-Kore |
| Captain Williams | QFA8 | en-AU | en-AU-Chirp3-HD-Puck |
| Sarah (hero) | QFA8 | en-AU | en-AU-Chirp3-HD-Aoede |
| Hijacker (incapacitated) | QFA8 | sv-SE | sv-SE-Chirp3-HD-Kore |
| British Airways crew | BAW | en-GB | en-GB-Chirp3-HD-Zephyr |

## Demo Scenario Flow

1. **Intro** (30s) - System overview, narrator introduces
2. **Normal ops** (30s) - Show flights, data blocks, 3D toggle
3. **Air India Hijack** (90s) - Norwegian hijacker, captain/FA respond, translation demo
4. **Crash sequence** (45s) - Emirates A380 crash
5. **Qantas Hero Mode** (120s) - Sarah fights Swedish hijacker, Captain Williams incapacitated, interactive landing
6. **Resolution** (30s) - Wrap up

## Airlines Added

| Code | Airline | Country | Flag | Accent |
|------|---------|---------|------|--------|
| AIC | Air India | India | 🇮🇳 | en-IN |
| QFA | Qantas | Australia | 🇦🇺 | en-AU |
| BAW | British Airways | UK | 🇬🇧 | en-GB (existing) |

## Audio Controls (Header)

Horizontal row with icon + label + toggle:
- 🔊 Narration [ON|OFF]
- 🎙️ ATC [ON|OFF]
- 🚨 Alerts [ON|OFF]
- 🌐 Auto-Translate [ON|OFF] (default: ON)
- 🔉 Volume [slider]

## Translation UI

When auto-translate ON (default):
```
┌──────────────────────────────────────┐
│ 🇳🇴 "Jeg krever at flyet lander     │
│     i Wakanda umiddelbart!"          │
│                                      │
│ 🇬🇧 "I demand that the plane lands  │
│     in Wakanda immediately!"         │
└──────────────────────────────────────┘
```

When auto-translate OFF:
```
┌──────────────────────────────────────┐
│ 🇳🇴 "Jeg krever at flyet..."        │
│              [🔊 TRANSLATE]          │
└──────────────────────────────────────┘
```

## UI Labels Added

| Element | Label |
|---------|-------|
| Data blocks toggle | "📊 Data Blocks" |
| Trails toggle | "〰️ Trails" |
| Weather toggle | "🌧️ Weather" |
| Time slider | "⏱️ Time +0m" |
| Skip button | "SKIP ▶▶" |
| Pause button | "PAUSE ⏸" |

## API Configuration

- Endpoint: `https://texttospeech.googleapis.com/v1/text:synthesize`
- Auth: API key via `VITE_GOOGLE_TTS_API_KEY`
- Audio format: MP3 (audioEncoding: MP3)
- Fallback: Web Speech API if API fails

## Files to Create/Modify

### New Files
- `src/audio/CloudTTS.ts` - Google Cloud TTS service
- `src/components/AudioControls/AudioControls.tsx` - Header audio controls
- `src/components/TranslationSubtitle/TranslationSubtitle.tsx` - Dual-language subtitle

### Modified Files
- `src/assets/airlines.ts` - Add AIC, QFA
- `src/store/uiStore.ts` - Add audio settings state
- `src/components/Header/Header.tsx` - Include AudioControls
- `src/demo/scenarios/showcase-demo.ts` - New scenario flow
- `src/demo/components/NarratorPanel.tsx` - Use CloudTTS
- `src/components/HeroMode/HeroModePanel.tsx` - Use CloudTTS, Qantas A380
- `.env` - Add VITE_GOOGLE_TTS_API_KEY
