export function calculateElevationDensity(
  elevationGainM: number,
  distanceKm: number
): number {
  if (distanceKm <= 0) return 0;
  return Math.round((elevationGainM / distanceKm) * 10) / 10;
}

export function formatDistance(km: number): string {
  return `${km} km`;
}

export function formatElevation(m: number): string {
  return `${m} m`;
}
