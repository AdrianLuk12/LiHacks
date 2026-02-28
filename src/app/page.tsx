"use client";

import { GameProvider, useGame } from "@/context/GameContext";
import WelcomeScreen from "@/components/WelcomeScreen";
import LoadingScreen from "@/components/LoadingScreen";
import GameScreen from "@/components/GameScreen";
import ResultScreen from "@/components/ResultScreen";
import LeaderboardScreen from "@/components/LeaderboardScreen";

function GameRouter() {
  const { phase, startGame, error } = useGame();

  return (
    <>
      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-900/90 text-red-200 px-4 py-2 rounded-lg text-sm z-[9999]">
          {error}
        </div>
      )}
      {phase === "welcome" && <WelcomeScreen onStart={startGame} />}
      {phase === "loading" && <LoadingScreen />}
      {phase === "playing" && <GameScreen />}
      {phase === "result" && <ResultScreen />}
      {phase === "leaderboard" && <LeaderboardScreen />}
    </>
  );
}

export default function Home() {
  return (
    <GameProvider>
      <GameRouter />
    </GameProvider>
  );
}
