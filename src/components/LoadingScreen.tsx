"use client";

import { Headphones, Loader2 } from "lucide-react";

export default function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 gap-6">
      <div className="relative">
        <Headphones size={64} className="text-amber-500 animate-pulse" />
        <Loader2
          size={24}
          className="absolute -bottom-1 -right-1 text-amber-400 animate-spin"
        />
      </div>
      <div className="text-center">
        <h2 className="text-xl font-bold mb-2">Tuning the radio…</h2>
        <p className="text-gray-400 text-sm max-w-xs">
          Generating your audio clues. This may take a moment while we craft
          ambient sounds, music, and speech for your mystery location.
        </p>
      </div>
      <div className="flex gap-1.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="w-2 h-8 bg-amber-500/60 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}
