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

// Persist across Next.js dev-mode module reloads via globalThis
const globalSessions = globalThis as typeof globalThis & {
  __sonicGuessrSessions?: Map<string, GameSession>;
};

if (!globalSessions.__sonicGuessrSessions) {
  globalSessions.__sonicGuessrSessions = new Map();
}

const sessions = globalSessions.__sonicGuessrSessions;

export function setSession(session: GameSession) {
  sessions.set(session.id, session);
}

export function getSession(id: string): GameSession | undefined {
  return sessions.get(id);
}

export function deleteSession(id: string) {
  sessions.delete(id);
}
