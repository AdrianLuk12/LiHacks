"use client";

import { useState, useEffect, useRef } from "react";
import { useGame } from "@/context/GameContext";
import { MapPin, Trophy, RotateCcw } from "lucide-react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";

const GuessMap = dynamic(() => import("@/components/GuessMap"), { ssr: false });

const DISTANCE_COMPARISONS = [
  { km: 50, text: "you could walk there" },
  { km: 150, text: "a short drive away" },
  { km: 350, text: "roughly London to Paris" },           // 340 km
  { km: 700, text: "roughly Berlin to Paris" },            // 880 km
  { km: 1200, text: "roughly London to Berlin" },          // 930 km
  { km: 2000, text: "roughly London to Rome" },            // 1,430 km
  { km: 3000, text: "roughly London to Moscow" },          // 2,500 km
  { km: 6000, text: "roughly New York to London" },        // 5,570 km
  { km: 10000, text: "roughly London to Tokyo" },          // 9,560 km
  { km: 15000, text: "nearly halfway around the world" },
];

function distanceContext(km: number): string {
  if (km < 10) return "almost a perfect guess!";
  for (const c of DISTANCE_COMPARISONS) {
    if (km <= c.km) return c.text;
  }
  return "more than halfway around the world";
}

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.3 } },
};

const rowVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

function AnimatedScore({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const duration = 900;
    const animate = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(eased * value));
      if (t < 1) raf.current = requestAnimationFrame(animate);
    };
    raf.current = requestAnimationFrame(animate);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [value]);

  return <>{display.toLocaleString()}</>;
}

export default function ResultScreen() {
  const { result, goToLeaderboard, playAgain, username, sessionId } = useGame();
  if (!result) return null;

  const { score, distance, actualLocation, guessedLocation, stage } = result;

  useEffect(() => {
    if (score >= 3000) {
      const duration = score >= 8000 ? 3000 : 1500;
      const end = Date.now() + duration;
      const frame = () => {
        confetti({ particleCount: score >= 8000 ? 4 : 2, angle: 60, spread: 55, origin: { x: 0, y: 0.7 } });
        confetti({ particleCount: score >= 8000 ? 4 : 2, angle: 120, spread: 55, origin: { x: 1, y: 0.7 } });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    }
  }, [score]);

  return (
    <div className="flex flex-col lg:flex-row h-screen">
      {/* Left panel: results */}
      <motion.div
        className="lg:w-96 w-full bg-black/40 border-r border-white/10 p-6 flex flex-col gap-5 overflow-y-auto"
        initial={{ opacity: 0, x: -32 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <MapPin className="text-amber-500" size={24} /> Results
        </h2>

        <div className="bg-white/5 rounded-xl p-5 space-y-3">
          <div className="text-center">
            <motion.p
              className="text-5xl font-extrabold text-amber-500"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4, type: "spring", stiffness: 200 }}
            >
              <AnimatedScore value={score} />
            </motion.p>
            <p className="text-sm text-gray-400 mt-1">points</p>
          </div>
          <motion.div
            className="border-t border-white/10 pt-3 space-y-2 text-sm"
            variants={listVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={rowVariants} transition={{ duration: 0.35 }} className="flex justify-between">
              <span className="text-gray-400">Location</span>
              <span className="text-white font-medium">
                {actualLocation.city}, {actualLocation.country}
              </span>
            </motion.div>
            <motion.div variants={rowVariants} transition={{ duration: 0.35 }}>
              <div className="flex justify-between">
                <span className="text-gray-400">Distance</span>
                <span className="text-white font-medium">
                  {distance.toLocaleString()} km
                </span>
              </div>
              <p className="text-gray-500 text-xs mt-0.5 text-right italic">
                {distanceContext(distance)}
              </p>
            </motion.div>
            <motion.div variants={rowVariants} transition={{ duration: 0.35 }} className="flex justify-between">
              <span className="text-gray-400">Guessed at</span>
              <span className="text-white font-medium">Stage {stage}</span>
            </motion.div>
            {result.languagePhrase && (
              <motion.div variants={rowVariants} transition={{ duration: 0.35 }} className="border-t border-white/10 pt-2">
                <p className="text-gray-400">The phrase was:</p>
                <p className="text-white font-medium italic">
                  &quot;{result.languagePhrase}&quot;
                </p>
                <p className="text-gray-500 text-xs">
                  ({result.languageTranslation})
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>

        <div className="flex flex-col gap-2 mt-auto">
          <SaveScoreButton username={username} score={score} sessionId={sessionId} />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={goToLeaderboard}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium transition"
          >
            <Trophy size={16} /> View Leaderboard
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={playAgain}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold transition"
          >
            <RotateCcw size={16} /> Play Again
          </motion.button>
        </div>
      </motion.div>

      {/* Right panel: map with both markers */}
      <motion.div
        className="flex-1 relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.25 }}
      >
        <GuessMap
          onGuess={() => {}}
          disabled
          actualLocation={actualLocation}
          guessedLocation={guessedLocation}
        />
      </motion.div>
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
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={handleSave}
      disabled={saved || saving}
      className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {saved ? "Score Saved!" : saving ? "Saving…" : "Save Score to Leaderboard"}
    </motion.button>
  );
}
