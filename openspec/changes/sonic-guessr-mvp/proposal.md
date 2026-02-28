## Why

To create "SonicGuessr", a single-player web-based guessing game where players deduce geographic locations based on audio clues (ambient, music, language). This project aims to provide an engaging, educational, and interactive experience leveraging generative AI for dynamic content creation.

## What Changes

- **New Next.js Project**: Initialize a Next.js App Router project with TypeScript and Tailwind CSS.
- **Game Engine**: Implement the core game loop (Welcome -> Init -> Stage 1-3 -> Result -> Leaderboard).
- **Audio Pipeline**: Backend integration with Backboard.io (LLM) for prompts and ElevenLabs for audio generation (Ambient, Music, Speech).
- **Map Interface**: Interactive map component using Leaflet or Mapbox for location guessing.
- **Scoring System**: Distance-based scoring algorithm with decay based on game stage.
- **Leaderboard**: Simple file-based (JSON) persistence for tracking top scores.

## Capabilities

### New Capabilities
- `game-engine`: Core game loop, state management, and user flow (stages, scoring).
- `audio-pipeline`: Backend services for generating audio clues via Backboard.io and ElevenLabs.
- `map-interface`: Interactive map component for user guesses and location reveal.
- `leaderboard-system`: Storage and retrieval of high scores using local JSON file.

### Modified Capabilities
<!-- No existing capabilities to modify as this is a new project. -->

## Impact

- **New Codebase**: Entirely new project structure.
- **External APIs**: Heavy reliance on Backboard.io and ElevenLabs APIs.
- **Storage**: Local filesystem usage for leaderboard (deployment consideration).
