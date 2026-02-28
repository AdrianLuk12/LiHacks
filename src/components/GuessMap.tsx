"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [hasGuess, setHasGuess] = useState(false);

  const handleClick = useCallback(
    (e: L.LeafletMouseEvent) => {
      if (disabled) return;
      const { lat, lng } = e.latlng;

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else if (mapRef.current) {
        const redIcon = L.divIcon({
          className: "guess-marker",
          html: '<div style="width:14px;height:14px;border-radius:50%;background:#ef4444;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4)"></div>',
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });
        markerRef.current = L.marker([lat, lng], { icon: redIcon }).addTo(
          mapRef.current
        );
      }
      setHasGuess(true);
      onGuess(lat, lng);
    },
    [disabled, onGuess]
  );

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      center: [20, 0],
      zoom: 2,
      minZoom: 2,
      worldCopyJump: true,
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.on("click", handleClick);
    return () => {
      map.off("click", handleClick);
    };
  }, [handleClick]);

  // Show results: actual location marker + line
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !actualLocation || !guessedLocation) return;

    const greenIcon = L.divIcon({
      className: "actual-marker",
      html: '<div style="width:14px;height:14px;border-radius:50%;background:#22c55e;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4)"></div>',
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    });

    const actualMarker = L.marker(
      [actualLocation.lat, actualLocation.lng],
      { icon: greenIcon }
    ).addTo(map);
    actualMarker.bindPopup("Actual Location").openPopup();

    const line = L.polyline(
      [
        [guessedLocation.lat, guessedLocation.lng],
        [actualLocation.lat, actualLocation.lng],
      ],
      { color: "#f59e0b", weight: 2, dashArray: "6 4" }
    ).addTo(map);

    const bounds = L.latLngBounds(
      [guessedLocation.lat, guessedLocation.lng],
      [actualLocation.lat, actualLocation.lng]
    );
    map.fitBounds(bounds, { padding: [50, 50] });

    return () => {
      actualMarker.remove();
      line.remove();
    };
  }, [actualLocation, guessedLocation]);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full rounded-lg" />
      {!hasGuess && !disabled && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-black/70 text-white text-sm px-3 py-1.5 rounded-full pointer-events-none z-[1000]">
          Click the map to place your guess
        </div>
      )}
    </div>
  );
}
