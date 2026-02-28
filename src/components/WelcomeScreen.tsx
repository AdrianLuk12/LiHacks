"use client";

import { useState } from "react";
import { Headphones, ArrowRight, Volume2, Music, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

interface WelcomeScreenProps {
  onStart: (username: string) => void;
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const stages = [
  { icon: Volume2, label: "Stage 1 — Ambient sounds", multiplier: "3.0×" },
  { icon: Music, label: "Stage 2 — Regional music", multiplier: "1.8×" },
  { icon: MessageCircle, label: "Stage 3 — Spoken language", multiplier: "1.0×" },
];

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const [username, setUsername] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) onStart(username.trim());
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-screen px-4 text-center"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      transition={{ staggerChildren: 0.12 }}
    >
      <motion.div className="mb-6 flex items-center gap-3" variants={itemVariants} transition={{ duration: 0.5, ease: "easeOut" }}>
        <Headphones size={48} className="text-amber-500" />
        <h1 className="text-5xl font-extrabold tracking-tight">
          Sonic<span className="text-amber-500">Guessr</span>
        </h1>
      </motion.div>

      <motion.p className="text-gray-400 max-w-md mb-8 leading-relaxed" variants={itemVariants} transition={{ duration: 0.5, ease: "easeOut" }}>
        Listen to <strong className="text-white">three audio clues</strong> —
        ambient sounds, regional music, and a spoken phrase — and guess the
        location on the map. The earlier you guess, the more points you score!
      </motion.p>

      <motion.div
        className="bg-white/5 border border-white/10 rounded-2xl p-6 w-full max-w-sm"
        variants={itemVariants}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <h2 className="text-lg font-semibold mb-3">How It Works</h2>
        <ol className="text-sm text-gray-400 text-left space-y-2 mb-6">
          {stages.map(({ icon: Icon, label, multiplier }, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="text-gray-500 font-medium w-4 shrink-0">{i + 1}.</span>
              <Icon size={14} className="text-amber-500 shrink-0" />
              <span>{label}</span>
              <span className="ml-auto text-amber-500 font-medium">{multiplier}</span>
            </li>
          ))}
        </ol>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            maxLength={20}
            className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
          />
          <motion.button
            type="submit"
            disabled={!username.trim()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-semibold transition"
          >
            Start Game <ArrowRight size={16} />
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
}
