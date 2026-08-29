import { mkdir, writeFile } from "node:fs/promises";

const serverDirectory = new URL("../dist/server/", import.meta.url);
const workerPath = new URL("index.js", serverDirectory);

const workerSource = `export default {
  async fetch(request, env) {
    if (!env.ASSETS || typeof env.ASSETS.fetch !== "function") {
      return new Response("Site assets are unavailable.", { status: 503 });
    }

    const response = await env.ASSETS.fetch(request);
    if (response.status !== 404) {
      return response;
    }

    const fallbackUrl = new URL(request.url);
    fallbackUrl.pathname = "/";
    return env.ASSETS.fetch(new Request(fallbackUrl, request));
  }
};
`;

await mkdir(serverDirectory, { recursive: true });
await writeFile(workerPath, workerSource, "utf8");
