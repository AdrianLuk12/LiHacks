// Haversine formula: returns distance in kilometers
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const STAGE_MULTIPLIERS: Record<number, number> = { 1: 3.0, 2: 1.8, 3: 1.0 };
const MAX_POINTS = 5000;

export function calculateScore(distanceKm: number, stage: number): number {
  const multiplier = STAGE_MULTIPLIERS[stage] ?? 1.0;
  const base = MAX_POINTS * Math.exp(-distanceKm / 2000);
  return Math.min(MAX_POINTS * 3, Math.max(0, Math.round(base * multiplier)));
}
