import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { sites } from "@openai/sites-vite-plugin";

export default defineConfig({
  // Chemins relatifs : le build fonctionne à la racine d'un domaine comme dans un sous-dossier.
  base: "./",
  plugins: [react(), sites()]
});
