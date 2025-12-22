# ATCS-NG UI Client

**Air Traffic Control System - Next Generation**

A modern, React-based air traffic control workstation interface featuring real-time radar display, alert management, and an immersive demo mode with high-quality voice synthesis.

[![Deploy to Cloud Run](https://github.com/ManavA/atcs-ng/actions/workflows/deploy.yml/badge.svg)](https://github.com/ManavA/atcs-ng/actions/workflows/deploy.yml)

**Live Demo:** https://ui-client-595822882252.us-central1.run.app

---

## Features

- **Real-Time Radar Display** - 2D Leaflet map with aircraft positions, trails, and data blocks
- **3D Radar View** - Optional Three.js 3D visualization
- **Alert System** - CRITICAL, WARNING, INFO alerts with audio notifications
- **Demo Mode** - Scripted 5-minute showcase with voice narration
- **Multi-Accent Voices** - Google Cloud TTS with Indian, Australian, British, and Norwegian accents
- **Hero Mode** - Interactive segment where users guide a distressed aircraft
- **Command System** - Send ATC commands with voice synthesis

---

## Quick Start

### Prerequisites

- Node.js 20+
- npm 10+

### Local Development

```bash
# Clone repository
git clone https://github.com/ManavA/atcs-ng.git
cd atcs-ng

# Install dependencies
npm install

# Start development server
npm run dev
```

Open http://localhost:5173 in your browser.

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Project Structure

```
atcs-ng/
├── src/
│   ├── components/          # UI Components
│   │   ├── Header/          # Top navigation
│   │   ├── RadarMap/        # 2D radar display
│   │   ├── RadarMap3D/      # 3D radar view
│   │   ├── Alerts/          # Alert panel
│   │   ├── FlightStrips/    # Flight list
│   │   ├── FlightDetail/    # Selected flight info
│   │   ├── CommandModal/    # ATC commands
│   │   ├── StatusBar/       # Bottom status bar
│   │   └── HeroMode/        # Interactive mode
│   ├── demo/                # Demo mode system
│   │   ├── DemoProvider.tsx # Context provider
│   │   ├── components/      # Demo UI
│   │   └── scenarios/       # Scripted scenarios
│   ├── audio/               # Audio system
│   │   ├── CloudTTS.ts      # Google Cloud TTS
│   │   ├── AudioManager.ts  # Sound effects
│   │   └── VoiceNotification.ts # Browser TTS fallback
│   ├── store/               # Zustand state
│   ├── types/               # TypeScript types
│   └── assets/              # Static assets
├── docs/                    # Documentation
│   ├── templates/           # META document templates
│   ├── architecture/        # Design documents
│   ├── testing/             # Test plans
│   └── operations/          # Runbooks
├── .github/workflows/       # CI/CD
└── package.json
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [META Templates](docs/templates/META-DOCUMENT-TEMPLATES.md) | Document templates for PRD, Spec, Test, GRTM |
| [PRD](docs/ATCS-NG-PRD-20251222-ui-client.md) | Product Requirements Document |
| [Design Document](docs/architecture/ATCS-NG-DESIGN-DOCUMENT.md) | Architecture and design |
| [Test Plan](docs/testing/ATCS-NG-TEST-PLAN.md) | Comprehensive test coverage |
| [Launch Readiness](docs/ATCS-NG-GRTM-20251222-v2.5.0.md) | v2.5.0 launch checklist |
| [Runbook](docs/operations/ATCS-NG-RUNBOOK.md) | Operations guide |

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| React 19 | UI framework |
| Vite 7 | Build tool |
| TypeScript 5 | Type safety |
| Zustand | State management |
| Leaflet | 2D mapping |
| Three.js | 3D rendering |
| Framer Motion | Animations |
| Google Cloud TTS | Voice synthesis |
| Howler.js | Audio playback |

---

## Deployment

### CI/CD (Automatic)

Pushes to `main` branch automatically trigger deployment via GitHub Actions.

### Manual Deployment

```bash
# Build Docker image
gcloud builds submit \
  --tag us-central1-docker.pkg.dev/gen-lang-client-0827795477/atcs-ng-repo/ui-client:latest

# Deploy to Cloud Run
gcloud run deploy ui-client \
  --image us-central1-docker.pkg.dev/gen-lang-client-0827795477/atcs-ng-repo/ui-client:latest \
  --region us-central1 \
  --allow-unauthenticated
```

---

## Demo Mode

The application includes an immersive demo mode with:

1. **System Introduction** - Overview of the interface
2. **Normal Operations** - Traffic flow demonstration
3. **Air India Hijack** - Emergency scenario with international voices
4. **Emirates Crash** - Collision detection demonstration
5. **Hero Mode (Qantas)** - Interactive user-guided landing
6. **Resolution** - System recovery

### Starting Demo

1. Click the **DEMO** button in the header
2. Select **Play Demo** for the full experience
3. Or select **Live Mode** for continuous simulation

---

## Version

Current version: **v2.5.0**

The version is displayed in the status bar at the bottom-right of the screen.

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

MIT License - See LICENSE file for details.

---

## Acknowledgments

- Built with React and modern web technologies
- Voice synthesis powered by Google Cloud Text-to-Speech
- Map tiles from OpenStreetMap
- Icons from Lucide React
