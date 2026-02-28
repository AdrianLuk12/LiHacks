export interface GameSession {
  id: string;
  location: {
    city: string;
    country: string;
    lat: number;
    lng: number;
  };
  audioUrls: {
    ambient: string;
    music: string;
    language: string;
  };
  languagePhrase?: string;
  languageTranslation?: string;
}

// In-memory session store (fine for a single-process MVP)
const sessions = new Map<string, GameSession>();

export function setSession(session: GameSession) {
  sessions.set(session.id, session);
}

export function getSession(id: string): GameSession | undefined {
  return sessions.get(id);
}

export function deleteSession(id: string) {
  sessions.delete(id);
}
