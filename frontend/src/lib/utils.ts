export function getRandomVibrantColor() {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 70%, 50%)`; // vibrant color
}
