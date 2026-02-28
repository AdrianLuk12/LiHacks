"use client";

import { useEffect, useState } from "react";
import { useGame } from "@/context/GameContext";
import { Trophy, RotateCcw } from "lucide-react";

interface Entry {
  username: string;
  score: number;
  date: string;
}

export default function LeaderboardScreen() {
  const { playAgain } = useGame();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((data) => setEntries(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-10">
      <div className="w-full max-w-lg">
        <h1 className="text-3xl font-bold flex items-center gap-2 mb-6">
          <Trophy className="text-amber-500" size={28} /> Leaderboard
        </h1>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-12 bg-white/5 rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <p className="text-gray-400">No scores yet. Be the first!</p>
        ) : (
          <div className="space-y-1">
            {entries.map((entry, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
                  i < 3 ? "bg-amber-500/10 border border-amber-500/30" : "bg-white/5"
                }`}
              >
                <span
                  className={`w-8 text-center font-bold text-lg ${
                    i === 0
                      ? "text-amber-400"
                      : i === 1
                      ? "text-gray-300"
                      : i === 2
                      ? "text-amber-700"
                      : "text-gray-500"
                  }`}
                >
                  {i + 1}
                </span>
                <span className="flex-1 font-medium">{entry.username}</span>
                <span className="text-amber-500 font-bold">
                  {entry.score.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={playAgain}
          className="mt-8 flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold transition"
        >
          <RotateCcw size={16} /> Play Again
        </button>
      </div>
    </div>
  );
}
