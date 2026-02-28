"use client";

import { useState } from "react";
import { useGame } from "@/context/GameContext";
import { MapPin, Trophy, RotateCcw } from "lucide-react";
import dynamic from "next/dynamic";

const GuessMap = dynamic(() => import("@/components/GuessMap"), { ssr: false });

export default function ResultScreen() {
  const { result, goToLeaderboard, playAgain, username, sessionId } = useGame();
  if (!result) return null;

  const { score, distance, actualLocation, guessedLocation, stage } = result;

  return (
    <div className="flex flex-col lg:flex-row h-screen">
      {/* Left panel: results */}
      <div className="lg:w-96 w-full bg-black/40 border-r border-white/10 p-6 flex flex-col gap-5 overflow-y-auto">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <MapPin className="text-amber-500" size={24} /> Results
        </h2>

        <div className="bg-white/5 rounded-xl p-5 space-y-3">
          <div className="text-center">
            <p className="text-5xl font-extrabold text-amber-500">{score}</p>
            <p className="text-sm text-gray-400 mt-1">points</p>
          </div>
          <div className="border-t border-white/10 pt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Location</span>
              <span className="text-white font-medium">
                {actualLocation.city}, {actualLocation.country}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Distance</span>
              <span className="text-white font-medium">
                {distance.toLocaleString()} km
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Guessed at</span>
              <span className="text-white font-medium">Stage {stage}</span>
            </div>
            {result.languagePhrase && (
              <div className="border-t border-white/10 pt-2">
                <p className="text-gray-400">The phrase was:</p>
                <p className="text-white font-medium italic">
                  &quot;{result.languagePhrase}&quot;
                </p>
                <p className="text-gray-500 text-xs">
                  ({result.languageTranslation})
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-auto">
          <SaveScoreButton username={username} score={score} sessionId={sessionId} />
          <button
            onClick={goToLeaderboard}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium transition"
          >
            <Trophy size={16} /> View Leaderboard
          </button>
          <button
            onClick={playAgain}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold transition"
          >
            <RotateCcw size={16} /> Play Again
          </button>
        </div>
      </div>

      {/* Right panel: map with both markers */}
      <div className="flex-1 relative">
        <GuessMap
          onGuess={() => {}}
          disabled
          actualLocation={actualLocation}
          guessedLocation={guessedLocation}
        />
      </div>
    </div>
  );
}

function SaveScoreButton({
  username,
  score,
  sessionId,
}: {
  username: string;
  score: number;
  sessionId: string | null;
}) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (saved || saving) return;
    setSaving(true);
    await fetch("/api/leaderboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, score, sessionId }),
    });
    setSaving(false);
    setSaved(true);
  };

  return (
    <button
      onClick={handleSave}
      disabled={saved || saving}
      className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {saved ? "Score Saved!" : saving ? "Saving…" : "Save Score to Leaderboard"}
    </button>
  );
}
