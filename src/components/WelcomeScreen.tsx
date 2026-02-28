"use client";

import { useState } from "react";
import { Headphones, ArrowRight } from "lucide-react";

interface WelcomeScreenProps {
  onStart: (username: string) => void;
}

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const [username, setUsername] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) onStart(username.trim());
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <div className="mb-6 flex items-center gap-3">
        <Headphones size={48} className="text-amber-500" />
        <h1 className="text-5xl font-extrabold tracking-tight">
          Sonic<span className="text-amber-500">Guessr</span>
        </h1>
      </div>

      <p className="text-gray-400 max-w-md mb-8 leading-relaxed">
        Listen to <strong className="text-white">three audio clues</strong> —
        ambient sounds, regional music, and a spoken phrase — and guess the
        location on the map. The earlier you guess, the more points you score!
      </p>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 w-full max-w-sm">
        <h2 className="text-lg font-semibold mb-1">How It Works</h2>
        <ol className="text-sm text-gray-400 text-left list-decimal list-inside space-y-1 mb-6">
          <li>🔊 Stage 1 — Ambient sounds (1.5× multiplier)</li>
          <li>🎵 Stage 2 — Regional music (1.2× multiplier)</li>
          <li>🗣️ Stage 3 — Spoken language (1.0× multiplier)</li>
        </ol>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            maxLength={20}
            className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button
            type="submit"
            disabled={!username.trim()}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-semibold transition"
          >
            Start Game <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
