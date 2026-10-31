# Atlas privé

Application web (Vite + React) de capsules visuelles de voyage : une carte d'accueil des étapes, une capsule illustrée par ville avec ses repères, une galerie de badges et un plan Mapbox partagé.

## Lancer en local

Prérequis : Node.js 20 ou plus récent.

```bash
npm install
cp .env.example .env.local   # puis renseigner VITE_MAPBOX_TOKEN
npm run dev
```

Pages disponibles en local :

- `http://127.0.0.1:5173/` : l'application
- `http://127.0.0.1:5173/istanbul-camera-lab` : **Camera Lab**, l'outil de cadrage des vues 3D Mapbox (dev uniquement, absent du build)

Le jeton Mapbox est public (`pk.…`). Il faut le restreindre aux domaines du site depuis le compte Mapbox avant toute mise en ligne.

## Organisation

```
src/
  data/cities.js        ← SOURCE UNIQUE : villes, statut (visited / planned), position sur l'accueil, images, quartiers, palette
  lib/mapbox.js         ← chargement de Mapbox GL, jeton, conversion des URL de style
  lib/transitions.js    ← durées et outils des transitions zoom + voile
  lib/clouds.js         ← nuages de l'accueil (générés dans le navigateur)
  components/
    AtlasHome.jsx       ← accueil : l'Europe sous les nuages, éclaircies sur les villes visitées
    CityExplorer.jsx    ← ville : vue générale → quartiers (voir docs/navigation-ville.md)
    CoverScene.jsx, CloudCover.jsx
    CityMapPanel.jsx    ← plan Mapbox partagé (adresses)
    BadgeGallery.jsx    ← badges, générés depuis cities.js
    IstanbulCameraLab.jsx ← outil de dev
  styles/global.css     ← styles de l'application
  styles/camera-lab.css ← styles du Camera Lab
server/worker.js        ← API (/api/places, /api/map-config) de l'hébergement actuel
drizzle/                ← schéma SQL de la table des adresses
exports/                ← images de référence produites avec le Camera Lab
```

### Ajouter une ville

Dans `src/data/cities.js`, ajouter une entrée `status: "planned"` (nom, pays, sous-titre, coordonnées). Renseigner aussi `atlas: { x, y }` (position en % sur l'image d'accueil). Elle apparaît comme une lueur sous les nuages et dans les badges à débloquer. Pour l'ouvrir, passer `status: "visited"` et renseigner `capsuleImage` (vue générale 16:9), `theme`, `mapStyleUrl`, `districts` (peut être vide) ; `badgeImage` débloque le badge.

## Build et hébergement

```bash
npm run build     # → dist/client (site) + dist/server/index.js (worker)
npm run preview   # aperçu du site statique (sans l'API)
```

Hébergement actuel, temporaire : **OpenAI Sites** (worker + base D1 `DB`, voir `.openai/hosting.json`). Variable d'environnement côté serveur : `VITE_MAPBOX_TOKEN`.

Version de test partageable : **GitHub Pages**, https://lm20-creator.github.io/atlas/. Elle est republiée automatiquement à chaque envoi sur `main` (`git push github main`, voir `.github/workflows/pages.yml`). Le jeton Mapbox est stocké dans les secrets du dépôt (`VITE_MAPBOX_TOKEN`). Le site est statique : le plan s'affiche, mais les adresses partagées ne sont pas disponibles.

Le site statique fonctionne seul. Le plan partagé (lecture et ajout d'adresses) dépend en revanche de l'API du worker, qu'il faudra porter vers le futur hébergeur.
