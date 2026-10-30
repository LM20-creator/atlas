/**
 * Build complet pour l'hébergement actuel (OpenAI Sites) :
 *   dist/client/         → site statique (Vite)
 *   dist/server/index.js → worker (copie de server/worker.js)
 */
import { copyFile, mkdir, rm } from "node:fs/promises";
import { build } from "vite";

const root = new URL("../", import.meta.url);
const dist = new URL("dist/", root);

await rm(dist, { recursive: true, force: true });
await build({ build: { outDir: "dist/client" } });
await mkdir(new URL("server/", dist), { recursive: true });
await copyFile(new URL("server/worker.js", root), new URL("server/index.js", dist));

console.log("Build terminé : dist/client + dist/server/index.js");
