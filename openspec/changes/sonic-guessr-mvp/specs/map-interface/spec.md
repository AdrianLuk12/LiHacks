## ADDED Requirements

### Requirement: Interactive Map
The user interface MUST display an interactive map for guessing.

#### Scenario: Display world map
- **WHEN** the game stage loads
- **THEN** an interactive world map (using Leaflet or Mapbox) is visible
- **AND** the map allows zooming and panning

### Requirement: User Guessing
The user MUST be able to click on the map to place a guess marker.

#### Scenario: Place guess marker
- **WHEN** user clicks on a location on the map
- **THEN** a marker is placed at the clicked coordinates
- **AND** the marker can be moved or replaced by clicking elsewhere
- **AND** a "Submit Guess" button becomes active

### Requirement: Result Visualization
The map MUST display the actual location and the user's guess after a round.

#### Scenario: Show results
- **WHEN** user submits a guess
- **THEN** the map displays the actual location with a distinct marker (e.g., green)
- **AND** the map displays the user's guess marker (e.g., red)
- **AND** a line connects the two points
- **AND** the map centers or bounds to show both points
