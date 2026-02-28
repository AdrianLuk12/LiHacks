"use client";

import { Headphones } from "lucide-react";
import { motion } from "framer-motion";

const BAR_COUNT = 5;

export default function LoadingScreen() {
  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-screen px-4 gap-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Pulsing ring + icon */}
      <div className="relative flex items-center justify-center">
        <motion.div
          className="absolute w-24 h-24 rounded-full border-2 border-amber-500/30"
          animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-16 h-16 rounded-full border border-amber-500/50"
          animate={{ scale: [1, 1.2, 1], opacity: [0.8, 0.2, 0.8] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
        />
        <Headphones size={48} className="text-amber-500 relative z-10" />
      </div>

      <div className="text-center">
        <h2 className="text-xl font-bold mb-2">Tuning the radio…</h2>
        <p className="text-gray-400 text-sm max-w-xs">
          Generating your audio clues. This may take a moment while we craft
          ambient sounds, music, and speech for your mystery location.
        </p>
      </div>

      {/* Animated wave bars */}
      <div className="flex gap-1.5 items-end h-10">
        {Array.from({ length: BAR_COUNT }).map((_, i) => (
          <motion.div
            key={i}
            className="w-2 rounded-full bg-amber-500/70"
            animate={{ height: ["12px", "32px", "12px"] }}
            transition={{
              duration: 0.9,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.13,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
