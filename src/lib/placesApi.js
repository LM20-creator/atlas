/**
 * Accès au serveur des adresses partagées (Cloudflare Workers, dossier api/ du projet).
 * Lecture publique ; ajout avec le code des proches ; suppression avec le code administrateur.
 * Le code saisi est mémorisé dans le navigateur de la personne (jamais dans le code du site).
 */
export const PLACES_API = import.meta.env.VITE_PLACES_API || "https://atlas-prive-api.atlas-prive.workers.dev";

const ACCESS_STORAGE_KEY = "atlas-prive:places-access";

export function readAccess() {
  try {
    const value = JSON.parse(window.localStorage.getItem(ACCESS_STORAGE_KEY) || "null");
    return value?.code && value?.role ? value : null;
  } catch {
    return null;
  }
}

export function forgetAccess() {
  try {
    window.localStorage.removeItem(ACCESS_STORAGE_KEY);
  } catch {
    /* rien à faire */
  }
}

async function request(path, { method = "GET", code, body } = {}) {
  const headers = {};
  if (code) headers["x-atlas-code"] = code;
  if (body) headers["content-type"] = "application/json";
  let response;
  try {
    response = await fetch(`${PLACES_API}${path}`, { method, headers, body: body && JSON.stringify(body) });
  } catch {
    throw Object.assign(new Error("Serveur des adresses injoignable. Réessayez dans un instant."), { status: 0 });
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw Object.assign(new Error(data.error || "Une erreur est survenue."), { status: response.status });
  }
  return data;
}

export async function fetchPlaces(cityId) {
  const data = await request(`/places?city=${encodeURIComponent(cityId)}`);
  return data.places ?? [];
}

/** Vérifie un code ; le mémorise s'il est valide. Renvoie { code, role }. */
export async function checkCode(code) {
  const trimmed = code.trim();
  const { role } = await request("/check", { method: "POST", code: trimmed });
  const access = { code: trimmed, role };
  try {
    window.localStorage.setItem(ACCESS_STORAGE_KEY, JSON.stringify(access));
  } catch {
    /* navigation privée : le code sera redemandé */
  }
  return access;
}

export async function savePlace(place, code) {
  const data = await request("/places", { method: "POST", code, body: place });
  return data.place;
}

export async function deletePlace(id, code) {
  await request(`/places/${encodeURIComponent(id)}`, { method: "DELETE", code });
}
