import { mkdir, writeFile } from "node:fs/promises";

const serverDirectory = new URL("../dist/server/", import.meta.url);
const workerPath = new URL("index.js", serverDirectory);

const workerSource = `
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8" } });
const categories = new Set(["restaurant", "bar", "museum", "hotel", "shopping", "other"]);
const recentSubmissions = new Map();

function validatePlace(input) {
  const name = typeof input.name === "string" ? input.name.trim().slice(0, 90) : "";
  const address = typeof input.address === "string" ? input.address.trim().slice(0, 160) : "";
  const category = categories.has(input.category) ? input.category : "other";
  const lng = Number(input.lng);
  const lat = Number(input.lat);
  if (!name || !Number.isFinite(lng) || !Number.isFinite(lat) || lng < 28.5 || lng > 29.5 || lat < 40.6 || lat > 41.5) return null;
  return { name, address, category, lng, lat };
}

async function placesApi(request, env) {
  if (!env.DB) return json({ error: "La base d’adresses est indisponible." }, 503);
  const url = new URL(request.url);
  if (request.method === "GET") {
    const city = url.searchParams.get("city");
    if (city !== "istanbul") return json({ places: [] });
    const result = await env.DB.prepare("SELECT id, name, address, category, lng, lat FROM places WHERE city = ? ORDER BY created_at ASC").bind(city).all();
    return json({ places: result.results ?? [] });
  }
  if (request.method === "POST") {
    const clientId = request.headers.get("cf-connecting-ip") || "anonymous";
    const lastSubmission = recentSubmissions.get(clientId) || 0;
    if (Date.now() - lastSubmission < 12_000) return json({ error: "Veuillez patienter quelques secondes avant un nouvel ajout." }, 429);
    const input = await request.json().catch(() => null);
    if (!input || input.city !== "istanbul") return json({ error: "Données invalides." }, 400);
    const place = validatePlace(input);
    if (!place) return json({ error: "Données invalides." }, 400);
    const id = crypto.randomUUID();
    await env.DB.prepare("INSERT INTO places (id, city, name, address, category, lng, lat) VALUES (?, ?, ?, ?, ?, ?, ?)").bind(id, "istanbul", place.name, place.address, place.category, place.lng, place.lat).run();
    recentSubmissions.set(clientId, Date.now());
    return json({ place: { id, ...place } }, 201);
  }
  return json({ error: "Méthode non autorisée." }, 405);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/places") return placesApi(request, env);
    if (!env.ASSETS || typeof env.ASSETS.fetch !== "function") return new Response("Site assets are unavailable.", { status: 503 });
    const response = await env.ASSETS.fetch(request);
    if (response.status !== 404) return response;
    url.pathname = "/";
    return env.ASSETS.fetch(new Request(url, request));
  }
};
`;

await mkdir(serverDirectory, { recursive: true });
await writeFile(workerPath, workerSource.trimStart(), "utf8");
