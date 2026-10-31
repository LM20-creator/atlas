/**
 * API des adresses partagées du plan — hébergée sur Cloudflare Workers (base D1 « DB »).
 * Le site lui-même reste sur GitHub Pages ; seul l'enregistrement des adresses passe ici.
 *
 *   GET    /places?city=florence           → adresses d'une ville (lecture publique)
 *   POST   /places                         → ajout (code d'accès des proches OU code administrateur)
 *   DELETE /places/<id>                    → suppression (code administrateur uniquement)
 *   POST   /check                          → vérifie un code, répond { role: "member" | "admin" }
 *
 * Les codes sont des « secrets » Cloudflare (ACCESS_CODE, ADMIN_CODE), jamais dans le code du site.
 * Le code est envoyé dans l'en-tête « X-Atlas-Code ».
 */

const ALLOWED_ORIGINS = new Set([
  "https://lm20-creator.github.io",
  "http://127.0.0.1:5173",
  "http://localhost:5173"
]);

const CATEGORIES = new Set(["restaurant", "bar", "museum", "hotel", "shopping", "other"]);
const recentSubmissions = new Map();

function corsHeaders(request) {
  const origin = request.headers.get("origin");
  return ALLOWED_ORIGINS.has(origin)
    ? {
        "access-control-allow-origin": origin,
        "access-control-allow-methods": "GET, POST, DELETE, OPTIONS",
        "access-control-allow-headers": "content-type, x-atlas-code",
        "access-control-max-age": "86400",
        vary: "origin"
      }
    : {};
}

const json = (request, data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...corsHeaders(request) }
  });

/** Comparaison à temps constant (évite de deviner le code caractère par caractère). */
function sameCode(given, expected) {
  if (!given || !expected) return false;
  const a = new TextEncoder().encode(given);
  const b = new TextEncoder().encode(expected);
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) diff |= (a[i] ?? 0) ^ (b[i] ?? 0);
  return diff === 0;
}

function roleFor(request, env) {
  const code = (request.headers.get("x-atlas-code") || "").trim();
  if (sameCode(code, env.ADMIN_CODE)) return "admin";
  if (sameCode(code, env.ACCESS_CODE)) return "member";
  return null;
}

const isCityId = (value) => typeof value === "string" && /^[a-z][a-z-]{1,40}$/.test(value);

function validatePlace(input) {
  const name = typeof input.name === "string" ? input.name.trim().slice(0, 90) : "";
  const address = typeof input.address === "string" ? input.address.trim().slice(0, 160) : "";
  const category = CATEGORIES.has(input.category) ? input.category : "other";
  const lng = Number(input.lng);
  const lat = Number(input.lat);
  if (!name || !isCityId(input.city)) return null;
  if (!Number.isFinite(lng) || !Number.isFinite(lat) || Math.abs(lng) > 180 || Math.abs(lat) > 90) return null;
  return { city: input.city, name, address, category, lng, lat };
}

/** Limite simple : un ajout toutes les 5 s par adresse IP, et ralentit les essais de code. */
function tooSoon(request, ms) {
  const client = request.headers.get("cf-connecting-ip") || "anonymous";
  const last = recentSubmissions.get(client) || 0;
  if (Date.now() - last < ms) return true;
  recentSubmissions.set(client, Date.now());
  return false;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(request) });
    if (!env.DB) return json(request, { error: "Base indisponible." }, 503);

    // Lecture publique
    if (url.pathname === "/places" && request.method === "GET") {
      const city = url.searchParams.get("city");
      if (!isCityId(city)) return json(request, { places: [] });
      const result = await env.DB.prepare(
        "SELECT id, name, address, category, lng, lat FROM places WHERE city = ? ORDER BY created_at ASC"
      )
        .bind(city)
        .all();
      return json(request, { places: result.results ?? [] });
    }

    // Vérification d'un code saisi
    if (url.pathname === "/check" && request.method === "POST") {
      const role = roleFor(request, env);
      if (!role) {
        if (tooSoon(request, 1500)) return json(request, { error: "Patientez un instant." }, 429);
        return json(request, { error: "Code incorrect." }, 401);
      }
      return json(request, { role });
    }

    // Ajout
    if (url.pathname === "/places" && request.method === "POST") {
      const role = roleFor(request, env);
      if (!role) return json(request, { error: "Code d’accès requis." }, 401);
      if (role !== "admin" && tooSoon(request, 5000)) {
        return json(request, { error: "Patientez quelques secondes avant un nouvel ajout." }, 429);
      }
      const input = await request.json().catch(() => null);
      const place = input && validatePlace(input);
      if (!place) return json(request, { error: "Données invalides." }, 400);
      const id = crypto.randomUUID();
      await env.DB.prepare(
        "INSERT INTO places (id, city, name, address, category, lng, lat) VALUES (?, ?, ?, ?, ?, ?, ?)"
      )
        .bind(id, place.city, place.name, place.address, place.category, place.lng, place.lat)
        .run();
      const { city, ...rest } = place;
      return json(request, { place: { id, ...rest } }, 201);
    }

    // Suppression (administrateur)
    const match = url.pathname.match(/^\/places\/([0-9a-f-]{36})$/);
    if (match && request.method === "DELETE") {
      if (roleFor(request, env) !== "admin") return json(request, { error: "Réservé à l’administrateur." }, 403);
      await env.DB.prepare("DELETE FROM places WHERE id = ?").bind(match[1]).run();
      return json(request, { ok: true });
    }

    return json(request, { error: "Introuvable." }, 404);
  }
};
