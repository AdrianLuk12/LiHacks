"use client";

import { useState, useCallback, useEffect } from "react";
import { useGame } from "@/context/GameContext";
import AudioPlayer, { toggleActivePlayer } from "@/components/AudioPlayer";
import { MapPin, ArrowRight, Lock, Unlock, Volume2, Music, MessageCircle } from "lucide-react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";

const GuessMap = dynamic(() => import("@/components/GuessMap"), { ssr: false });

const STAGE_LABELS = ["Ambient", "Music", "Language"];
const STAGE_ICONS = [Volume2, Music, MessageCircle];
const STAGE_KEYS: Array<"ambient" | "music" | "language"> = [
  "ambient",
  "music",
  "language",
];
const STAGE_MULTIPLIERS = ["3.0×", "1.8×", "1.0×"];

export default function GameScreen() {
  const {
    stage,
    audio,
    guessCoords,
    isLoading,
    setGuessCoords,
    submitGuess,
    nextStage,
  } = useGame();

  const [playedStages, setPlayedStages] = useState<Set<number>>(() => new Set());

  const markPlayed = useCallback((stageNum: number) => {
    setPlayedStages((prev) => {
      const next = new Set(prev);
      next.add(stageNum);
      return next;
    });
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === "Space") { e.preventDefault(); toggleActivePlayer(); }
      if (e.code === "KeyN" && stage < 3 && playedStages.has(stage)) nextStage();
      if (e.code === "Enter" && guessCoords && !isLoading) submitGuess();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [stage, playedStages, guessCoords, isLoading, nextStage, submitGuess]);

  if (!audio) return null;

  const canAdvance = stage < 3;
  const hasPlayedCurrent = playedStages.has(stage);

  return (
    <motion.div
      className="flex flex-col lg:flex-row h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Left panel: clues & controls */}
      <div className="lg:w-96 w-full bg-black/40 border-r border-white/10 p-6 flex flex-col gap-5 overflow-y-auto">
        <motion.h2
          className="text-xl font-bold"
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          Stage {stage} of 3
        </motion.h2>

        {/* Stage indicators */}
        <div className="flex gap-2">
          {STAGE_LABELS.map((label, i) => {
            const stageNum = i + 1;
            const isCurrent = stageNum === stage;
            const isUnlocked = stageNum <= stage;
            const Icon = STAGE_ICONS[i];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.15 + i * 0.07 }}
                title={`${label} — ${STAGE_MULTIPLIERS[i]} score multiplier`}
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium border transition cursor-default ${
                  isCurrent
                    ? "bg-amber-500/20 border-amber-500 text-amber-400"
                    : isUnlocked
                    ? "bg-white/5 border-white/20 text-gray-300"
                    : "bg-white/5 border-white/10 text-gray-600"
                }`}
              >
                {isUnlocked ? <Unlock size={10} /> : <Lock size={10} />}
                {label}
                <span className="text-[9px] opacity-60">{STAGE_MULTIPLIERS[i]}</span>
              </motion.div>
            );
          })}
        </div>

        {/* Audio players for all unlocked stages */}
        <div className="flex flex-col gap-3">
          <AnimatePresence initial={false}>
            {STAGE_KEYS.map((key, i) => {
              const stageNum = i + 1;
              const isUnlocked = stageNum <= stage;
              if (!isUnlocked) return null;
              const isCurrent = stageNum === stage;
              const Icon = STAGE_ICONS[i];
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className={`rounded-lg transition ${
                    isCurrent
                      ? "ring-1 ring-amber-500/50"
                      : "opacity-75 hover:opacity-100"
                  }`}
                >
                  <AudioPlayer
                    src={audio[key]}
                    label={`${STAGE_LABELS[i]}`}
                    icon={Icon}
                    autoPlay={isCurrent}
                    onPlayed={() => markPlayed(stageNum)}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 mt-auto">
          <AnimatePresence>
            {canAdvance && (
              <motion.button
                key="next"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                whileHover={hasPlayedCurrent ? { scale: 1.02 } : undefined}
                whileTap={hasPlayedCurrent ? { scale: 0.97 } : undefined}
                transition={{ duration: 0.25 }}
                onClick={nextStage}
                disabled={!hasPlayedCurrent}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium transition disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white/10"
              >
                {hasPlayedCurrent ? (
                  <>Next Clue <ArrowRight size={16} /></>
                ) : (
                  <>Listen first <ArrowRight size={16} /></>
                )}
              </motion.button>
            )}
          </AnimatePresence>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={submitGuess}
            disabled={!guessCoords || isLoading}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-semibold transition"
          >
            <MapPin size={16} />
            {guessCoords ? "Submit Guess" : "Place a pin to guess"}
          </motion.button>
        </div>
      </div>

      {/* Right panel: map */}
      <motion.div
        className="flex-1 relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <GuessMap onGuess={(lat, lng) => setGuessCoords(lat, lng)} />
      </motion.div>
    </motion.div>
  );
}
