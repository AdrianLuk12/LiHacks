"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { APIProvider, Map, AdvancedMarker, useMap } from "@vis.gl/react-google-maps";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

const DARK_MAP_ID = "sonicguessr-dark";

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
      strokeColor: "#f59e0b",
      strokeWeight: 2,
      strokeOpacity: 0.8,
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
          mapId={DARK_MAP_ID}
          className="w-full h-full rounded-lg"
          colorScheme="LIGHT"
        >
          <MapClickHandler
            onGuess={onGuess}
            disabled={disabled}
            setGuess={stableSetGuess}
          />

          {guess && (
            <AdvancedMarker position={guess}>
              <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow-lg" />
            </AdvancedMarker>
          )}

          {actualLocation && (
            <AdvancedMarker position={actualLocation}>
              <div className="flex flex-col items-center">
                <div className="bg-black/80 text-white text-xs px-2 py-0.5 rounded mb-1 whitespace-nowrap">
                  Actual Location
                </div>
                <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow-lg" />
              </div>
            </AdvancedMarker>
          )}

          {actualLocation && guessedLocation && (
            <ResultLine from={guessedLocation} to={actualLocation} />
          )}
        </Map>
      </APIProvider>

      {!guess && !disabled && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-black/70 text-white text-sm px-3 py-1.5 rounded-full pointer-events-none z-[1000]">
          Click the map to place your guess
        </div>
      )}
    </div>
  );
}
