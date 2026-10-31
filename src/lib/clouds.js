/**
 * Nuages « vus du ciel » générés dans le navigateur (bruit fractal), sans fichier image.
 * Les textures sont calculées une seule fois puis gardées en mémoire.
 */

function hash(x, y, seed) {
  let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(seed, 982451653)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967295;
}

function noise(x, y, seed) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi, seed);
  const b = hash(xi + 1, yi, seed);
  const c = hash(xi, yi + 1, seed);
  const d = hash(xi + 1, yi + 1, seed);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

function fbm(x, y, seed) {
  let sum = 0;
  let amplitude = 0.5;
  let frequency = 1;
  let norm = 0;
  for (let octave = 0; octave < 5; octave += 1) {
    sum += amplitude * noise(x * frequency, y * frequency, seed + octave * 17);
    norm += amplitude;
    amplitude *= 0.5;
    frequency *= 2.03;
  }
  return sum / norm;
}

const smoothstep = (lo, hi, value) => {
  const t = Math.min(1, Math.max(0, (value - lo) / (hi - lo)));
  return t * t * (3 - 2 * t);
};

/**
 * Une couche de nuages.
 *   scale       : taille des nuages (plus grand = nuages plus petits)
 *   lo / hi     : seuils de densité (plus resserrés = bords plus nets)
 *   floor       : opacité minimale partout (voile de fond)
 */
function renderLayer({ width, height, seed, scale, lo, hi, floor }) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  const image = context.createImageData(width, height);
  const aspect = width / height;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const nx = (x / width) * scale * aspect;
      const ny = (y / height) * scale;
      const density = fbm(nx, ny, seed);
      // Relief : on compare avec un point décalé vers la lumière (haut gauche).
      const lit = fbm(nx - 0.06, ny - 0.09, seed);
      const light = Math.min(1, Math.max(0.74, 0.9 + (density - lit) * 2.2));
      const alpha = floor + (1 - floor) * smoothstep(lo, hi, density);
      const index = (y * width + x) * 4;
      image.data[index] = 236 * light + 16;
      image.data[index + 1] = 239 * light + 14;
      image.data[index + 2] = 244 * light + 11;
      image.data[index + 3] = alpha * 255;
    }
  }

  context.putImageData(image, 0, 0);
  return canvas.toDataURL("image/png");
}

let cachedLayers = null;

export function getCloudLayers() {
  if (!cachedLayers) {
    cachedLayers = {
      base: renderLayer({ width: 480, height: 270, seed: 3, scale: 3.1, lo: 0.4, hi: 0.62, floor: 0.8 }),
      puffs: renderLayer({ width: 640, height: 360, seed: 11, scale: 5.4, lo: 0.5, hi: 0.68, floor: 0 })
    };
  }
  return cachedLayers;
}

/**
 * Masque des éclaircies : opaque partout, troué en douceur autour de chaque position (x / y en %).
 * `radius` en fraction de la largeur de l'image.
 */
export function renderClearingsMask(holes, radius) {
  const width = 320;
  const height = 180;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  context.fillStyle = "#000";
  context.fillRect(0, 0, width, height);
  context.globalCompositeOperation = "destination-out";

  for (const hole of holes) {
    const cx = (hole.x / 100) * width;
    const cy = (hole.y / 100) * height;
    const r = (hole.radius ?? radius) * width;
    const gradient = context.createRadialGradient(cx, cy, 0, cx, cy, r);
    gradient.addColorStop(0, "rgba(0,0,0,1)");
    gradient.addColorStop(0.45, "rgba(0,0,0,0.95)");
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    context.fillStyle = gradient;
    context.fillRect(cx - r, cy - r, r * 2, r * 2);
  }

  return canvas.toDataURL("image/png");
}
