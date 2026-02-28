# 🎧 SonicGuessr

An audio-based geography guessing game where players identify real-world locations by listening to AI-generated sound clues. Built for LiHacks.

## How It Works

1. **Enter your username** on the welcome screen
2. **Listen to up to 3 progressive audio clues** for a randomly generated location:
   - 🔊 **Stage 1 — Ambient Sounds** (1.5× score multiplier)
   - 🎵 **Stage 2 — Regional Music** (1.2× multiplier)
   - 🗣️ **Stage 3 — Spoken Phrase** in the local language (1.0× multiplier)
3. **Place a pin** on the interactive map to submit your guess
4. **View your score** — the closer and earlier you guess, the higher you score
5. **Compete on the leaderboard** against other players

## Scoring

**Formula:** `max(0, (5000 - distance_km) × stage_multiplier)`

Guessing accurately at an earlier stage rewards a higher score. Maximum possible score is 7,500 (perfect guess at Stage 1).

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| UI | React 19 + Tailwind CSS v4 |
| Maps | Leaflet + React-Leaflet (OpenStreetMap) |
| Icons | Lucide React |
| State | React Context API |
| AI Location Generation | Backboard AI (Claude-powered) |
| AI Audio Generation | ElevenLabs (sound effects, music, text-to-speech) |

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── game/
│   │   │   ├── generate/   # POST — generate location + audio clues
│   │   │   └── guess/      # POST — submit guess, get score
│   │   └── leaderboard/    # GET/POST — fetch & save scores
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── AudioPlayer.tsx      # Play/pause, seek, progress bar
│   ├── GameScreen.tsx       # Main gameplay (audio panel + map)
│   ├── GuessMap.tsx         # Interactive Leaflet map
│   ├── LeaderboardScreen.tsx
│   ├── LoadingScreen.tsx
│   ├── ResultScreen.tsx
│   └── WelcomeScreen.tsx
├── context/
│   └── GameContext.tsx       # Global game state management
└── lib/
    ├── backboard.ts         # Backboard AI integration
    ├── elevenlabs.ts        # ElevenLabs audio generation
    ├── leaderboard.ts       # File-based leaderboard storage
    ├── scoring.ts           # Haversine distance + scoring logic
    └── sessions.ts          # Server-side session management
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
```

Add your API keys to `.env.local`:

```env
BACKBOARD_API_KEY=your_backboard_api_key
BACKBOARD_API_URL=https://app.backboard.io/api
ELEVENLABS_API_KEY=your_elevenlabs_api_key
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

## API Routes

| Route | Method | Description |
|---|---|---|
| `/api/game/generate` | POST | Generate a random location with 3 audio clues |
| `/api/game/guess` | POST | Submit map coordinates, receive score and actual location |
| `/api/leaderboard` | GET | Fetch top 100 scores |
| `/api/leaderboard` | POST | Save a score to the leaderboard |
