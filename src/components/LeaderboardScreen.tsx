"use client";

import { useEffect, useState } from "react";
import { useGame } from "@/context/GameContext";
import { Trophy, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";

interface Entry {
  username: string;
  score: number;
  date: string;
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.2 } },
};

const rowVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

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
    <motion.div
      className="flex flex-col items-center justify-center min-h-screen px-4 py-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <div className="w-full max-w-lg">
        <motion.h1
          className="text-3xl font-bold flex items-center gap-2 mb-6"
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Trophy className="text-amber-500" size={28} /> Leaderboard
        </motion.h1>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-12 bg-white/5 rounded-lg animate-pulse"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <p className="text-gray-400">No scores yet. Be the first!</p>
        ) : (
          <motion.div
            className="space-y-1"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {entries.map((entry, i) => (
              <motion.div
                key={i}
                variants={rowVariants}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
                  i < 3
                    ? "bg-amber-500/10 border border-amber-500/30"
                    : "bg-white/5"
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
              </motion.div>
            ))}
          </motion.div>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={playAgain}
          className="mt-8 flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold transition"
        >
          <RotateCcw size={16} /> Play Again
        </motion.button>
      </div>
    </motion.div>
  );
}
