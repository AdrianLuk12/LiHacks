"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

type GamePhase = "welcome" | "loading" | "playing" | "result" | "leaderboard";

interface AudioUrls {
  ambient: string;
  music: string;
  language: string;
}

interface ResultData {
  score: number;
  distance: number;
  actualLocation: { lat: number; lng: number; city: string; country: string };
  guessedLocation: { lat: number; lng: number };
  stage: number;
  languagePhrase?: string;
  languageTranslation?: string;
}

interface GameState {
  phase: GamePhase;
  username: string;
  sessionId: string | null;
  stage: number; // 1, 2, or 3
  audio: AudioUrls | null;
  guessCoords: { lat: number; lng: number } | null;
  result: ResultData | null;
  error: string | null;
  isLoading: boolean;
}

interface GameContextType extends GameState {
  startGame: (username: string) => Promise<void>;
  setGuessCoords: (lat: number, lng: number) => void;
  submitGuess: () => Promise<void>;
  nextStage: () => void;
  goToLeaderboard: () => void;
  playAgain: () => void;
}

const GameContext = createContext<GameContextType | null>(null);

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}

const INITIAL_STATE: GameState = {
  phase: "welcome",
  username: "",
  sessionId: null,
  stage: 1,
  audio: null,
  guessCoords: null,
  result: null,
  error: null,
  isLoading: false,
};

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameState>(INITIAL_STATE);

  const startGame = useCallback(async (username: string) => {
    setState((s) => ({
      ...s,
      username,
      phase: "loading",
      isLoading: true,
      error: null,
    }));

    try {
      const res = await fetch("/api/game/generate", { method: "POST" });
      if (!res.ok) throw new Error("Failed to generate game");
      const data = await res.json();

      setState((s) => ({
        ...s,
        sessionId: data.sessionId,
        audio: data.audio,
        phase: "playing",
        stage: 1,
        isLoading: false,
        guessCoords: null,
        result: null,
      }));
    } catch (err) {
      setState((s) => ({
        ...s,
        error: err instanceof Error ? err.message : "Unknown error",
        phase: "welcome",
        isLoading: false,
      }));
    }
  }, []);

  const setGuessCoords = useCallback((lat: number, lng: number) => {
    setState((s) => ({ ...s, guessCoords: { lat, lng } }));
  }, []);

  const submitGuess = useCallback(async () => {
    if (!state.sessionId || !state.guessCoords) return;

    setState((s) => ({ ...s, isLoading: true }));

    try {
      const res = await fetch("/api/game/guess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: state.sessionId,
          guessedCoordinates: [state.guessCoords.lat, state.guessCoords.lng],
          stage: state.stage,
        }),
      });
      if (!res.ok) throw new Error("Failed to submit guess");
      const result: ResultData = await res.json();

      setState((s) => ({
        ...s,
        result,
        phase: "result",
        isLoading: false,
      }));
    } catch (err) {
      setState((s) => ({
        ...s,
        error: err instanceof Error ? err.message : "Unknown error",
        isLoading: false,
      }));
    }
  }, [state.sessionId, state.guessCoords, state.stage]);

  const nextStage = useCallback(() => {
    setState((s) => ({
      ...s,
      stage: Math.min(s.stage + 1, 3) as 1 | 2 | 3,
    }));
  }, []);

  const goToLeaderboard = useCallback(() => {
    setState((s) => ({ ...s, phase: "leaderboard" }));
  }, []);

  const playAgain = useCallback(() => {
    setState({ ...INITIAL_STATE, username: state.username, phase: "welcome" });
  }, [state.username]);

  return (
    <GameContext.Provider
      value={{
        ...state,
        startGame,
        setGuessCoords,
        submitGuess,
        nextStage,
        goToLeaderboard,
        playAgain,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}
