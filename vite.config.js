import { defineConfig } from "vite";
import { sites } from "@openai/sites-vite-plugin";

export default defineConfig({
  base: "./",
  cacheDir: ".vite-cache",
  plugins: [sites()]
});
