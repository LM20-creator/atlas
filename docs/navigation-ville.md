# Navigation dans une ville — méthode arrêtée

## Niveaux
Atlas › Ville (vue stylisée générale) › Quartier (vue détaillée)

## Vue ville
- Image stylisée générale, plein écran, monuments non mis en avant.
- Uniquement les quartiers visités sont cliquables (pas de « à venir »).
- Repère de quartier = point lumineux qui « respire », sans nom permanent.
- Survol / sélection : le point grandit, le nom apparaît, halo dans la couleur du quartier, curseur main.
- Mobile : 1er toucher = sélection (nom visible), 2e toucher = entrer.
- Indication unique au premier passage (« Touchez un quartier pour y entrer »), puis plus jamais.
- Boutons Plan et Photos : à ce niveau.

## Transition ville → quartier
Zoom vers le point du quartier → fondu vers un voile de la couleur du quartier (sert d'écran de chargement) → apparition de l'image du quartier. Durée ~1 s.
Les cadrages ville / quartier ne concordent pas : c'est le voile qui assure la continuité.

## Vue quartier
- Image quasi plein écran, navigation discrète.
- Fil d'Ariane discret : Atlas › Ville › Quartier.
- Passage discret au quartier suivant / précédent (les quartiers ne se touchent pas).
- Palette du quartier appliquée à l'interface (variables --theme-*), chaque quartier a sa lumière.
- Bouton « En savoir plus » → panneau d'informations historiques, ouvert à la demande uniquement. Contenu vide pour l'instant.
- Petite icône Plan → même plan Mapbox, centré sur le quartier.

## Données par quartier
id, nom, position du point sur la vue ville (% x/y), image, palette, centre/zoom du plan, texte historique (vide).

- Écran portrait : la vue ville défile horizontalement, centrée au départ sur les quartiers.

## Décisions
- Pas de repères dans un quartier : uniquement l'image.
- Retour à la vue ville : uniquement par le fil d'Ariane (et la touche Échap).

## Implémentation
- `src/components/CityExplorer.jsx` (+ section « Ville & quartiers » de `global.css`).
- Données : `districts` dans `src/data/cities.js` (x, y, lngLat, mapZoom, image, veil, theme, history).
- Ajouter un quartier = une entrée dans `districts` + son image dans `src/assets/<ville>/`.

## Plus tard
- URL par vue (/istanbul/galata).
