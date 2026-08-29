# Atlas privé

Application statique Vite/React de capsules visuelles de voyage.

## Lancer en local

Prérequis : Node.js 20 ou une version plus récente.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Renseigner `VITE_MAPBOX_TOKEN` dans `.env.local` pour activer les plans Mapbox. Le bouton Plan affiche un message explicite lorsque la variable est absente.

Les variables préfixées par `VITE_` sont intégrées au code côté navigateur. Utiliser uniquement un jeton public Mapbox et lui appliquer des restrictions d’URL depuis le compte Mapbox avant une mise en ligne publique.

## Build statique

```bash
npm run build
npm run preview
```

Le site généré se trouve dans `dist/`. La configuration Vite utilise des chemins relatifs afin que le build fonctionne à la racine d’un domaine comme dans un sous-dossier.

## Déploiement

### Vercel

1. Importer le dossier ou le dépôt.
2. Ajouter `VITE_MAPBOX_TOKEN` dans les variables d’environnement du projet.
3. Déployer. Les commandes et le dossier de sortie sont définis dans `vercel.json`.

### Netlify

1. Importer le dossier ou le dépôt.
2. Ajouter `VITE_MAPBOX_TOKEN` dans les variables d’environnement du site.
3. Déployer. La commande et le dossier de publication sont définis dans `netlify.toml`.

Pour tout autre hébergeur statique, exécuter `npm run build` et publier le contenu de `dist/`.

## Données du MVP

Les villes et leurs points d’intérêt restent dans `src/data/`. Les albums Google Photos sont des liens externes. Aucun backend ni système d’authentification n’est nécessaire pour cette version.
