## ADDED Requirements

### Requirement: Location Selection
The system MUST generate a random geographic location suitable for audio guessing.

#### Scenario: Generate random location
- **WHEN** user starts a new game
- **THEN** system calls Backboard.io LLM to generate a random location (City, Country, Coordinates)
- **AND** system generates 3 distinct prompts for audio generation (Ambient description, Music style, Language phrase)

### Requirement: Audio Generation
The system MUST generate three audio files corresponding to the selected location using ElevenLabs API.

#### Scenario: Generate Ambient Audio (Stage 1)
- **WHEN** location is selected
- **THEN** system calls ElevenLabs Sound Effects API with the "Ambient description" prompt
- **AND** system returns a URL or buffer for the ambient sound

#### Scenario: Generate Music Audio (Stage 2)
- **WHEN** location is selected
- **THEN** system calls ElevenLabs Audio Generation API with the "Music style" prompt
- **AND** system returns a URL or buffer for the music clip

#### Scenario: Generate Language Audio (Stage 3)
- **WHEN** location is selected
- **THEN** system calls ElevenLabs Text-to-Speech API with the "Language phrase" prompt and appropriate voice model
- **AND** system returns a URL or buffer for the spoken phrase
