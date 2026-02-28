## ADDED Requirements

### Requirement: Store High Scores
The system MUST persist high scores using a simple local file-based approach.

#### Scenario: Save a score
- **WHEN** a game session ends with a valid score
- **AND** user confirms submission
- **THEN** system reads the existing `leaderboard.json` file
- **AND** system appends the new entry {username, score, date}
- **AND** system sorts the list descending by score
- **AND** system truncates to the top 100 entries
- **AND** system writes the updated list back to the file

### Requirement: Display Leaderboard
The system MUST display the top high scores to users.

#### Scenario: View leaderboard
- **WHEN** user navigates to the leaderboard page or finishes a game
- **THEN** system reads `leaderboard.json`
- **AND** system returns the list of top 100 scores
- **AND** UI displays the username, score, and rank in a table format
