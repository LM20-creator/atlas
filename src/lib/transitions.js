/**
 * Outils communs aux transitions Atlas → ville → quartier (zoom + voile).
 * Durées à garder en phase avec global.css (section « Ville & quartiers »).
 */
export const ZOOM_MS = 700; // zoom vers le point, le voile monte pendant la seconde moitié
export const VEIL_MS = 380; // montée du voile seul
export const REVEAL_MS = 750; // disparition du voile

/** Couleur du voile quand on revient à l'atlas (bleu nuit des nuages). */
export const ATLAS_VEIL = "#1b2a33";

export const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

export function preload(src) {
  if (!src) return Promise.resolve();
  const image = new Image();
  image.src = src;
  return image.decode ? image.decode().catch(() => {}) : Promise.resolve();
}

export const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
export const isTouchDevice = () => window.matchMedia("(hover: none)").matches;

/** Indication « une seule fois » mémorisée dans le navigateur. */
export function readFlag(key) {
  try {
    return window.localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

export function setFlag(key) {
  try {
    window.localStorage.setItem(key, "1");
  } catch {
    /* navigation privée : l'indication réapparaîtra, sans gravité */
  }
}
