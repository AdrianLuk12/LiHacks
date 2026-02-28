"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { APIProvider, Map, AdvancedMarker, useMap } from "@vis.gl/react-google-maps";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

interface GuessMapProps {
  onGuess: (lat: number, lng: number) => void;
  disabled?: boolean;
  actualLocation?: { lat: number; lng: number } | null;
  guessedLocation?: { lat: number; lng: number } | null;
}

function ResultLine({
  from,
  to,
}: {
  from: { lat: number; lng: number };
  to: { lat: number; lng: number };
}) {
  const map = useMap();
  const polyRef = useRef<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!map) return;

    polyRef.current = new google.maps.Polyline({
      path: [from, to],
      strokeColor: "#facc15",
      strokeWeight: 2,
      strokeOpacity: 0.9,
      geodesic: true,
      map,
    });

    const bounds = new google.maps.LatLngBounds();
    bounds.extend(from);
    bounds.extend(to);
    map.fitBounds(bounds, 60);

    return () => {
      polyRef.current?.setMap(null);
    };
  }, [map, from, to]);

  return null;
}

function MapClickHandler({
  onGuess,
  disabled,
  setGuess,
}: {
  onGuess: (lat: number, lng: number) => void;
  disabled: boolean;
  setGuess: (pos: { lat: number; lng: number }) => void;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map || disabled) return;
    const listener = map.addListener("click", (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setGuess({ lat, lng });
      onGuess(lat, lng);
    });
    return () => listener.remove();
  }, [map, disabled, onGuess, setGuess]);

  return null;
}

export default function GuessMap({
  onGuess,
  disabled = false,
  actualLocation,
  guessedLocation,
}: GuessMapProps) {
  const [guess, setGuess] = useState<{ lat: number; lng: number } | null>(null);

  const stableSetGuess = useCallback(
    (pos: { lat: number; lng: number }) => setGuess(pos),
    []
  );

  return (
    <div className="relative w-full h-full">
      <APIProvider apiKey={API_KEY}>
        <Map
          defaultCenter={{ lat: 20, lng: 0 }}
          defaultZoom={2}
          minZoom={2}
          gestureHandling="greedy"
          disableDefaultUI
          zoomControl
          mapTypeControl={false}
          streetViewControl={false}
          fullscreenControl={false}
          mapId="sonicguessr"
          className="w-full h-full"
          colorScheme="LIGHT"
        >
          <MapClickHandler
            onGuess={onGuess}
            disabled={disabled}
            setGuess={stableSetGuess}
          />

          {(guess || guessedLocation) && (
            <AdvancedMarker position={(guess || guessedLocation)!}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                {guessedLocation && (
                  <div style={{ background: "#f97316", color: "white", fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 4, marginBottom: 4, whiteSpace: "nowrap" }}>
                    Your Guess
                  </div>
                )}
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: "#f97316",
                    border: "3px solid white",
                    boxShadow: "0 0 0 1px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.3)",
                  }}
                />
              </div>
            </AdvancedMarker>
          )}

          {actualLocation && (
            <AdvancedMarker position={actualLocation}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ background: "#22c55e", color: "white", fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 4, marginBottom: 4, whiteSpace: "nowrap" }}>
                  Actual
                </div>
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: "#22c55e",
                    border: "3px solid white",
                    boxShadow: "0 0 0 1px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.3)",
                  }}
                />
              </div>
            </AdvancedMarker>
          )}

          {actualLocation && guessedLocation && (
            <ResultLine from={guessedLocation} to={actualLocation} />
          )}
        </Map>
      </APIProvider>

      {!guess && !disabled && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-sm px-3 py-1.5 rounded-full pointer-events-none z-[1000]">
          Click to place your guess
        </div>
      )}
    </div>
  );
}
