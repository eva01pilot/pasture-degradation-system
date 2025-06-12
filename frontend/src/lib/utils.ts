export function getRandomVibrantColor() {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 70%, 50%)`; // vibrant color
}

export function normalizeCoordinatesToCanvas(
  coordinates: number[][][],
  canvasWidth: number,
  canvasHeight: number,
  padding: number = 10,
): number[][][] {
  if (canvasWidth <= 0 || canvasHeight <= 0) return [];

  const allCoords = coordinates.flat(1);
  const lons = allCoords.map((coord) => coord[0]);
  const lats = allCoords.map((coord) => coord[1]);

  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);

  const mapWidth = maxLon - minLon;
  const mapHeight = maxLat - minLat;

  const scale = Math.min(
    (canvasWidth - padding * 2) / (mapWidth || 1),
    (canvasHeight - padding * 2) / (mapHeight || 1),
  );

  return coordinates.map((ring) =>
    ring.map(([lon, lat]) => {
      const x = padding + (lon - minLon) * scale;
      const y = canvasHeight - padding - (lat - minLat) * scale;
      return [x, y];
    }),
  );
}
