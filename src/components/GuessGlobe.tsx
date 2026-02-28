"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Globe, { GlobeMethods } from "react-globe.gl";

export interface GuessMapProps {
  onGuess: (lat: number, lng: number) => void;
  disabled?: boolean;
  actualLocation?: { lat: number; lng: number } | null;
  guessedLocation?: { lat: number; lng: number } | null;
  externalGuess?: { lat: number; lng: number } | null;
}

interface PointData {
  lat: number;
  lng: number;
  color: string;
  label: string;
  size: number;
}

interface ArcData {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
}

interface CountryLabel {
  lat: number;
  lng: number;
  name: string;
  size: number;
}

function geoCentroidAndSize(geometry: { type: string; coordinates: number[][][] | number[][][][] }): [number, number, number] {
  let coords: number[][] = [];
  if (geometry.type === "Polygon") {
    coords = (geometry.coordinates as number[][][])[0];
  } else if (geometry.type === "MultiPolygon") {
    const polys = geometry.coordinates as number[][][][];
    let largest = polys[0][0];
    for (const poly of polys) {
      if (poly[0].length > largest.length) largest = poly[0];
    }
    coords = largest;
  }
  if (coords.length === 0) return [0, 0, 0];
  let lngSum = 0, latSum = 0;
  let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
  for (const c of coords) {
    lngSum += c[0]; latSum += c[1];
    if (c[1] < minLat) minLat = c[1]; if (c[1] > maxLat) maxLat = c[1];
    if (c[0] < minLng) minLng = c[0]; if (c[0] > maxLng) maxLng = c[0];
  }
  const area = (maxLat - minLat) * (maxLng - minLng);
  return [latSum / coords.length, lngSum / coords.length, area];
}

const DAY_IMAGE = "//unpkg.com/three-globe/example/img/earth-day.jpg";
const NIGHT_SKY = "//unpkg.com/three-globe/example/img/night-sky.png";
const COUNTRIES_URL =
  "//raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson";

export default function GuessGlobe({
  onGuess,
  disabled = false,
  actualLocation,
  guessedLocation,
  externalGuess,
}: GuessMapProps) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const [guess, setGuess] = useState<{ lat: number; lng: number } | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [countries, setCountries] = useState<{ features: object[] }>({ features: [] });
  const [countryLabels, setCountryLabels] = useState<CountryLabel[]>([]);
  const [arcStroke, setArcStroke] = useState(1.5);
  const hasFlown = useRef(false);

  // Sync external guess from parent (e.g. when switching views)
  useEffect(() => {
    if (externalGuess) setGuess(externalGuess);
  }, [externalGuess]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setDimensions({ width, height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    fetch(COUNTRIES_URL)
      .then((r) => r.json())
      .then((geo) => {
        setCountries(geo);
        const labels: CountryLabel[] = [];
        for (const f of geo.features) {
          const feat = f as { properties?: { NAME?: string }; geometry?: { type: string; coordinates: number[][][] | number[][][][] } };
          const name = feat.properties?.NAME;
          if (!name || !feat.geometry) continue;
          const [lat, lng, area] = geoCentroidAndSize(feat.geometry);
          const size = Math.max(0.15, Math.min(0.5, Math.sqrt(area) / 40));
          labels.push({ lat, lng, name, size });
        }
        setCountryLabels(labels);
      });
  }, []);

  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;
    globe.pointOfView({ lat: 20, lng: 0, altitude: 2.5 });

    const controls = globe.controls() as { autoRotate: boolean; autoRotateSpeed: number; addEventListener: (e: string, fn: () => void) => void; removeEventListener: (e: string, fn: () => void) => void };
    if (controls) {
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.4;

      const onZoom = () => {
        const alt = globe.pointOfView().altitude;
        setArcStroke(Math.max(0.3, Math.min(1.5, alt * 0.6)));
      };
      controls.addEventListener("change", onZoom);
      return () => controls.removeEventListener("change", onZoom);
    }
  }, []);

  useEffect(() => {
    const globe = globeRef.current;
    if (!globe || !actualLocation || !guessedLocation || hasFlown.current) return;
    hasFlown.current = true;

    const controls = globe.controls() as { autoRotate: boolean };
    if (controls) controls.autoRotate = false;

    const midLat = (actualLocation.lat + guessedLocation.lat) / 2;
    const midLng = (actualLocation.lng + guessedLocation.lng) / 2;

    const dLat = Math.abs(actualLocation.lat - guessedLocation.lat);
    const dLng = Math.abs(actualLocation.lng - guessedLocation.lng);
    const spread = Math.max(dLat, dLng);
    const altitude = Math.min(2.5, Math.max(0.5, spread / 40));

    globe.pointOfView({ lat: midLat, lng: midLng, altitude }, 1200);
  }, [actualLocation, guessedLocation]);

  const handleGlobeClick = useCallback(
    (coords: { lat: number; lng: number }) => {
      if (disabled) return;

      const globe = globeRef.current;
      if (globe) {
        const controls = globe.controls() as { autoRotate: boolean };
        if (controls) controls.autoRotate = false;
      }

      setGuess({ lat: coords.lat, lng: coords.lng });
      onGuess(coords.lat, coords.lng);
    },
    [disabled, onGuess]
  );

  const pointsData = useMemo<PointData[]>(() => {
    const points: PointData[] = [];
    const markerPos = guess || guessedLocation;
    if (markerPos) {
      points.push({
        lat: markerPos.lat,
        lng: markerPos.lng,
        color: "#f97316",
        label: guessedLocation ? "Your Guess" : "",
        size: 0.8,
      });
    }
    if (actualLocation) {
      points.push({
        lat: actualLocation.lat,
        lng: actualLocation.lng,
        color: "#22c55e",
        label: "Actual",
        size: 0.8,
      });
    }
    return points;
  }, [guess, guessedLocation, actualLocation]);

  const arcsData = useMemo<ArcData[]>(() => {
    if (!actualLocation || !guessedLocation) return [];
    return [
      {
        startLat: guessedLocation.lat,
        startLng: guessedLocation.lng,
        endLat: actualLocation.lat,
        endLng: actualLocation.lng,
      },
    ];
  }, [actualLocation, guessedLocation]);

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden">
      {dimensions.width > 0 && (
        <Globe
          ref={globeRef}
          width={dimensions.width}
          height={dimensions.height}
          backgroundColor="#0a0a0a"
          backgroundImageUrl={NIGHT_SKY}
          globeImageUrl={DAY_IMAGE}
          showAtmosphere={true}
          atmosphereColor="#1a2a4a"
          atmosphereAltitude={0.2}
          polygonsData={countries.features}
          polygonCapColor={() => "rgba(255, 255, 255, 0.04)"}
          polygonSideColor={() => "rgba(60, 80, 140, 0.15)"}
          polygonStrokeColor={() => "rgba(255, 255, 255, 0.9)"}
          polygonAltitude={0.012}
          labelsData={countryLabels}
          labelLat="lat"
          labelLng="lng"
          labelText="name"
          labelSize="size"
          labelColor={() => "rgba(255, 255, 255, 0.9)"}
          labelAltitude={0.025}
          labelDotRadius={0}
          labelIncludeDot={false}
          labelResolution={3}
          pointsData={pointsData}
          pointLat="lat"
          pointLng="lng"
          pointColor="color"
          pointRadius="size"
          pointAltitude={0.01}
          pointLabel="label"
          pointsMerge={false}
          pointsTransitionDuration={300}
          arcsData={arcsData}
          arcStartLat="startLat"
          arcStartLng="startLng"
          arcEndLat="endLat"
          arcEndLng="endLng"
          arcColor={() => ["#f97316", "#facc15", "#22c55e"]}
          arcStroke={arcStroke}
          arcDashLength={0.4}
          arcDashGap={0.2}
          arcDashAnimateTime={1500}
          arcAltitudeAutoScale={0.3}
          onGlobeClick={handleGlobeClick}
          onPolygonClick={(_, __, coords) => handleGlobeClick(coords as { lat: number; lng: number })}
        />
      )}
    </div>
  );
}
