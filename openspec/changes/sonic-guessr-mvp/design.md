## Context

Building "SonicGuessr", a geography guessing game using audio clues. The application requires a seamless frontend experience with complex backend orchestration for AI-generated content (text and audio).

## Goals / Non-Goals

**Goals:**
- Functional single-player game loop with 3 distinct audio stages.
- Integration with Backboard.io (LLM) and ElevenLabs (TTS/Music/SFX).
- Interactive map for guessing and result visualization.
- Scoring system based on accuracy and speed/stage.
- Local leaderboard persistence.

**Non-Goals:**
- Multiplayer functionality.
- User authentication/accounts (simple username entry).
- Database integration (SQL/NoSQL) beyond local JSON.
- persistent audio storage (re-generate or transient for MVP).

## Decisions

- **Framework**: Next.js App Router for integrated frontend and backend API routes.
- **Styling**: Tailwind CSS for rapid UI development and responsiveness.
- **Map Library**: `react-leaflet` for map rendering and interaction. It is lightweight and sufficient for the requirements compared to Mapbox GL JS.
- **State Management**: React Context API to manage game state (current stage, score, location data) without external libraries like Redux.
- **Audio Generation Strategy**:
    - Backend orchestration: `/api/game/generate` handles the sequence.
    - Client-side preloading: While user is on the welcome screen or previous stage, background fetching can occur (if feasible), otherwise robust loading states.
- **Persistence**: `fs.promises` with a local `leaderboard.json` file.
    - *Rationale*: Simple to implement for a hackathon/MVP.
    - *limitation*: Will not persist on serverless platforms (Vercel) but works for local/VPS demos.

## Risks / Trade-offs

- **Audio Generation Latency**: Generating 3 distinct audio files via API calls can be slow.
    - *Mitigation*: Show a "tuning radio" loading animation. Parallelize ElevenLabs calls where possible.
- **API Rate Limits/Costs**: Heavy usage of ElevenLabs.
    - *Mitigation*: Caching is a potential future optimization, but for MVP we accept direct calls.
- **Browser Autoplay Policies**: Browsers blocking audio autoplay.
    - *Mitigation*: Ensure audio playback is triggered by user interaction (e.g., "Start Game" button or "Next Stage" button).
