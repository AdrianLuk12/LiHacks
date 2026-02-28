## ADDED Requirements

### Requirement: Game Initialization
The system MUST initialize a new game session with a unique ID and reset state.

#### Scenario: Start new game
- **WHEN** user enters username and clicks "Start Game"
- **THEN** system generates a new session ID
- **AND** system transitions to "Loading" state while fetching game data
- **AND** system transitions to "Stage 1" once data is ready

### Requirement: Stage Progression
The game MUST proceed through 3 distinct stages (Ambient, Music, Language) before revealing the result.

#### Scenario: Advance to next stage
- **WHEN** user is in Stage 1 or Stage 2 and clicks "Next Clue"
- **THEN** system transitions to the next stage (Ambient -> Music -> Language)
- **AND** system plays the corresponding audio clue

#### Scenario: Make a guess
- **WHEN** user places a pin and clicks "Guess" in any stage
- **THEN** system captures the coordinates and current stage
- **AND** system ends the game round and shows results

### Requirement: Scoring Calculation
The system MUST calculate the score based on distance accuracy and the stage at which the guess was made.

#### Scenario: Calculate score
- **WHEN** user makes a guess at coordinates (lat_guess, lng_guess)
- **AND** the actual location is (lat_target, lng_target)
- **THEN** system calculates distance D in kilometers
- **AND** system applies formula: Score = max(0, 5000 - D) * StageMultiplier
- **AND** StageMultiplier is 1.5 for Stage 1, 1.2 for Stage 2, 1.0 for Stage 3
