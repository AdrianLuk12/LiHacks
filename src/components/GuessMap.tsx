"use client";

import { useState, useCallback } from "react";
import { Globe as GlobeIcon, Map as MapIcon } from "lucide-react";
import dynamic from "next/dynamic";

const GuessGlobe = dynamic(() => import("@/components/GuessGlobe"), { ssr: false });
const GuessGoogleMap = dynamic(() => import("@/components/GuessGoogleMap"), { ssr: false });

type ViewMode = "globe" | "map";

interface GuessMapProps {
  onGuess: (lat: number, lng: number) => void;
  disabled?: boolean;
  actualLocation?: { lat: number; lng: number } | null;
  guessedLocation?: { lat: number; lng: number } | null;
}

export default function GuessMap({
  onGuess,
  disabled = false,
  actualLocation,
  guessedLocation,
}: GuessMapProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("globe");
  const [guess, setGuess] = useState<{ lat: number; lng: number } | null>(null);

  const handleGuess = useCallback(
    (lat: number, lng: number) => {
      setGuess({ lat, lng });
      onGuess(lat, lng);
    },
    [onGuess]
  );

  const sharedProps = {
    onGuess: handleGuess,
    disabled,
    actualLocation,
    guessedLocation,
    externalGuess: guess,
  };

  const hintText = viewMode === "globe"
    ? "Double click the globe to place your guess"
    : "Click the map to place your guess";

  return (
    <div className="relative w-full h-full overflow-hidden">
      {viewMode === "globe" ? (
        <GuessGlobe {...sharedProps} />
      ) : (
        <GuessGoogleMap {...sharedProps} />
      )}

      {/* Hint text */}
      {!guess && !disabled && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-black/70 text-white text-sm px-3 py-1.5 rounded-full pointer-events-none z-1000">
          {hintText}
        </div>
      )}

      {/* View mode toggle */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-1000 flex items-center bg-black/70 backdrop-blur-sm rounded-full border border-white/15 p-1 gap-1">
        <button
          onClick={() => setViewMode("globe")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            viewMode === "globe"
              ? "bg-amber-500 text-black"
              : "text-white/70 hover:text-white hover:bg-white/10"
          }`}
        >
          <GlobeIcon size={14} />
          Globe
        </button>
        <button
          onClick={() => setViewMode("map")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            viewMode === "map"
              ? "bg-amber-500 text-black"
              : "text-white/70 hover:text-white hover:bg-white/10"
          }`}
        >
          <MapIcon size={14} />
          Map
        </button>
      </div>
    </div>
  );
}
