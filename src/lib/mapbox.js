/**
 * Outils Mapbox partagés (plan de ville + Camera Lab).
 * Mapbox GL JS est chargé depuis le CDN uniquement quand un plan est ouvert.
 */
const MAPBOX_GL_VERSION = "3.28.1";
const MAPBOX_CDN = `https://api.mapbox.com/mapbox-gl-js/v${MAPBOX_GL_VERSION}`;

let mapboxPromise = null;

export function loadMapbox() {
  if (window.mapboxgl) return Promise.resolve(window.mapboxgl);
  if (mapboxPromise) return mapboxPromise;

  mapboxPromise = new Promise((resolve, reject) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `${MAPBOX_CDN}/mapbox-gl.css`;
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = `${MAPBOX_CDN}/mapbox-gl.js`;
    script.async = true;
    script.addEventListener("load", () => resolve(window.mapboxgl), { once: true });
    script.addEventListener(
      "error",
      (error) => {
        mapboxPromise = null;
        reject(error);
      },
      { once: true }
    );
    document.head.appendChild(script);
  });

  return mapboxPromise;
}

/**
 * Jeton Mapbox public :
 * 1. VITE_MAPBOX_TOKEN (fichier .env.local en local, ou variable d'environnement au build) ;
 * 2. sinon, demandé au serveur via /api/map-config (hébergement actuel).
 */
export async function getMapboxToken() {
  const buildToken = import.meta.env.VITE_MAPBOX_TOKEN;
  if (buildToken) return buildToken;

  const response = await fetch("/api/map-config");
  if (!response.ok) throw new Error("map-config-unavailable");
  const config = await response.json();
  if (!config.mapboxToken) throw new Error("map-config-unavailable");
  return config.mapboxToken;
}

/** Extrait { owner, styleId } d'une URL Mapbox Studio (…/styles/v1/<owner>/<id>.html). */
export function parseStyleUrl(styleUrl) {
  const match = styleUrl.match(/styles\/v1\/([^/]+)\/([^/.]+)/);
  return match ? { owner: match[1], styleId: match[2] } : null;
}

/** URL Mapbox Studio → URL utilisable par Mapbox GL JS (mapbox://styles/…). */
export function toMapboxStyleUrl(styleUrl) {
  const parsed = parseStyleUrl(styleUrl);
  return parsed ? `mapbox://styles/${parsed.owner}/${parsed.styleId}` : styleUrl;
}
