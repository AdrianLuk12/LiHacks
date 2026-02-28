"use client";

import { useGame } from "@/context/GameContext";
import AudioPlayer from "@/components/AudioPlayer";
import { MapPin, ArrowRight, Lock, Unlock } from "lucide-react";
import dynamic from "next/dynamic";

const GuessMap = dynamic(() => import("@/components/GuessMap"), { ssr: false });

const STAGE_LABELS = ["🔊 Ambient", "🎵 Music", "🗣️ Language"];
const STAGE_KEYS: Array<"ambient" | "music" | "language"> = [
  "ambient",
  "music",
  "language",
];

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

  if (!audio) return null;

  const canAdvance = stage < 3;

  return (
    <div className="flex flex-col lg:flex-row h-screen">
      {/* Left panel: clues & controls */}
      <div className="lg:w-96 w-full bg-black/40 border-r border-white/10 p-6 flex flex-col gap-5 overflow-y-auto">
        <h2 className="text-xl font-bold">
          Stage {stage} of 3
        </h2>

        {/* Stage indicators */}
        <div className="flex gap-2">
          {STAGE_LABELS.map((label, i) => {
            const stageNum = i + 1;
            const isCurrent = stageNum === stage;
            const isUnlocked = stageNum <= stage;
            return (
              <div
                key={i}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                  isCurrent
                    ? "bg-amber-500/20 border-amber-500 text-amber-400"
                    : isUnlocked
                    ? "bg-white/5 border-white/20 text-gray-300"
                    : "bg-white/5 border-white/10 text-gray-600"
                }`}
              >
                {isUnlocked ? <Unlock size={12} /> : <Lock size={12} />}
                {label}
              </div>
            );
          })}
        </div>

        {/* Audio players for all unlocked stages */}
        <div className="flex flex-col gap-3">
          {STAGE_KEYS.map((key, i) => {
            const stageNum = i + 1;
            const isUnlocked = stageNum <= stage;
            if (!isUnlocked) return null;
            const isCurrent = stageNum === stage;
            return (
              <div
                key={key}
                className={`rounded-lg transition ${
                  isCurrent
                    ? "ring-1 ring-amber-500/50"
                    : "opacity-75 hover:opacity-100"
                }`}
              >
                <AudioPlayer
                  src={audio[key]}
                  label={`${STAGE_LABELS[i]}`}
                />
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 mt-auto">
          {canAdvance && (
            <button
              onClick={nextStage}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium transition"
            >
              Next Clue <ArrowRight size={16} />
            </button>
          )}
          <button
            onClick={submitGuess}
            disabled={!guessCoords || isLoading}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-semibold transition"
          >
            <MapPin size={16} />
            {guessCoords ? "Submit Guess" : "Place a pin to guess"}
          </button>
        </div>
      </div>

      {/* Right panel: map */}
      <div className="flex-1 relative">
        <GuessMap onGuess={(lat, lng) => setGuessCoords(lat, lng)} />
      </div>
    </div>
  );
}
