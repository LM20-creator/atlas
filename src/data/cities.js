/**
 * Source unique des villes de l'atlas.
 *
 * - status "visited" : capsule disponible (vue générale de la ville → quartiers `districts`, éventuellement vide) ;
 *   badge débloqué s'il y a une `badgeImage`.
 * - status "planned" : étape future, affichée sur la carte et dans les badges à débloquer.
 *
 * L'ordre du tableau = l'ordre des étapes sur la carte d'accueil et dans la galerie de badges.
 *
 * `atlas` : position de la ville en % de l'image d'accueil (src/assets/atlas/europe.webp).
 *   Ville visitée : point lumineux + éclaircie dans les nuages ; ville prévue : simple lueur.
 *   À recaler si l'image d'accueil change.
 */
import istanbulOverview from "../assets/istanbul/overview.webp";
import istanbulGalata from "../assets/istanbul/galata.webp";
import istanbulSultanahmet from "../assets/istanbul/sultanahmet.webp";
import istanbulBesiktas from "../assets/istanbul/besiktas.webp";
import istanbulGalataBridge from "../assets/istanbul/galata-bridge.webp";
import istanbulUskudar from "../assets/istanbul/uskudar.webp";
import istanbulBosphorus from "../assets/istanbul/bosphorus.webp";
import istanbulBadge from "../assets/badge-istanbul.webp";
import florenceOverview from "../assets/florence/overview.webp";
import florenceUffizi from "../assets/florence/uffizi.webp";
import florenceBadge from "../assets/badge-florence.webp";
import dublinOverview from "../assets/dublin/overview.webp";
import dublinBadge from "../assets/badge-dublin.webp";
import dublinHowth from "../assets/dublin/howth.webp";

const MAPBOX_STYLE_URL = "https://api.mapbox.com/styles/v1/leomass/cmtcy1ssl002901s1c2vi29ab.html";

export const cities = [
  {
    id: "florence",
    status: "visited",
    name: "Florence",
    country: "Italie",
    subtitle: "Renaissance, pierre blonde et collines",
    atlas: { x: 46.1, y: 62.2 },
    coordinates: { lat: 43.7696, lng: 11.2558 },
    // Vue générale stylisée (depuis le Piazzale Michelangelo, en recul), aussi vignette sur l'accueil.
    // Référence Google Earth : @43.7718,11.2560,50a,2800d,35y,318h,77t,0r
    capsuleImage: florenceOverview,
    badgeImage: florenceBadge,
    mapStyleUrl: MAPBOX_STYLE_URL,
    mapZoom: 13.4,
    // Palette de la vue générale (plein soleil, terre cuite, Arno vert).
    theme: {
      ink: "#fff6e6",
      muted: "#cfc6ae",
      deep: "#2e3324",
      water: "#5e8f8e",
      gold: "#d9a24f",
      stone: "#e0c08f",
      red: "#b5532f"
    },
    // Quartiers visités (mêmes champs qu'Istanbul, voir plus bas).
    districts: [
      {
        id: "uffizi",
        name: "Palais des Offices",
        x: 41.5,
        y: 42.5,
        lngLat: [11.2553, 43.7678],
        mapZoom: 16,
        image: florenceUffizi,
        veil: "#4a3426",
        theme: {
          ink: "#fff1e0",
          muted: "#d2c0a8",
          deep: "#4a3426",
          water: "#5f7a8c",
          gold: "#d9a54a",
          stone: "#c9a882",
          red: "#a3302a"
        },
        history: ""
      }
    ]
  },
  {
    id: "istanbul",
    status: "visited",
    name: "Istanbul",
    country: "Turquie",
    subtitle: "Bosphore, empires et passages",
    atlas: { x: 86.4, y: 73.0 },
    coordinates: { lat: 41.0082, lng: 28.9784 },
    // Vue générale stylisée de la ville (aussi utilisée comme vignette sur l'accueil).
    capsuleImage: istanbulOverview,
    badgeImage: istanbulBadge,
    albumUrl: "https://photos.app.goo.gl/RLJxDxjaEi1JhCFHA",
    mapStyleUrl: MAPBOX_STYLE_URL,
    mapZoom: 12.4,
    // Caméra de référence (Camera Lab).
    referenceCamera: {
      center: [28.98192, 41.01297],
      zoom: 13.95,
      bearing: 33,
      pitch: 60,
      aspectRatio: "16:9"
    },
    // Palette de la vue générale (heure dorée).
    theme: {
      ink: "#fff1dc",
      muted: "#c9b9a2",
      deep: "#13242d",
      water: "#223338",
      gold: "#d9a35a",
      stone: "#d1b28c",
      red: "#7a3b22"
    },
    // Quartiers visités, dans l'ordre de navigation précédent / suivant.
    //   x / y   : position du point lumineux en % de la vue générale
    //   lngLat  : position réelle (centre du plan Mapbox, repères du Camera Lab)
    //   veil    : couleur du voile de transition
    //   history : texte du panneau « En savoir plus » (à rédiger)
    //   focusX  : (optionnel) cadrage initial sur mobile, en % de la largeur de l'image (50 = centre)
    districts: [
      {
        id: "galata",
        name: "Galata",
        x: 38.3,
        y: 25.5,
        lngLat: [28.9741, 41.0256],
        mapZoom: 15.2,
        image: istanbulGalata,
        focusX: 64, // la tour, à droite de l'image
        veil: "#141d36",
        theme: {
          ink: "#fff0d6",
          muted: "#b9b4c8",
          deep: "#141d36",
          water: "#2c4169",
          gold: "#f0a64a",
          stone: "#d9a774",
          red: "#7d4317"
        },
        history: ""
      },
      {
        id: "sultanahmet",
        name: "Sultanahmet",
        x: 33.5,
        y: 60,
        lngLat: [28.977, 41.0068],
        mapZoom: 15.2,
        image: istanbulSultanahmet,
        veil: "#e9e3d6",
        theme: {
          ink: "#fffaf0",
          muted: "#d6dde2",
          deep: "#2c3a44",
          water: "#8fb4cf",
          gold: "#d4a64e",
          stone: "#e2d6c3",
          red: "#b0473a"
        },
        history: ""
      },
      {
        id: "besiktas",
        name: "Beşiktaş",
        x: 61.3,
        y: 21.3,
        lngLat: [29.0045, 41.043],
        mapZoom: 15.2,
        image: istanbulBesiktas,
        veil: "#2a1d1a",
        theme: {
          ink: "#fff1e0",
          muted: "#c9b8b0",
          deep: "#2a1d1a",
          water: "#4a3f52",
          gold: "#f2a54a",
          stone: "#c9a27e",
          red: "#9a2a24"
        },
        history: ""
      },
      {
        id: "galata-bridge",
        name: "Pont de Galata",
        x: 26.5,
        y: 37.5,
        lngLat: [28.9738, 41.0201],
        mapZoom: 15.4,
        image: istanbulGalataBridge,
        veil: "#dfe4ea",
        theme: {
          ink: "#fffaf0",
          muted: "#d3d8de",
          deep: "#3b3f45",
          water: "#4f7fa6",
          gold: "#e0ad3c",
          stone: "#b9b2a8",
          red: "#b5523c"
        },
        history: ""
      },
      {
        id: "uskudar",
        name: "Üsküdar",
        x: 91.5,
        y: 52,
        lngLat: [29.0155, 41.0255],
        mapZoom: 14.8,
        image: istanbulUskudar,
        veil: "#cfe3f7",
        theme: {
          ink: "#fffaf0",
          muted: "#c9d9ea",
          deep: "#24425e",
          water: "#3f6f9e",
          gold: "#e0a94f",
          stone: "#cbb8a6",
          red: "#b0473a"
        },
        history: ""
      },
      {
        id: "bosphorus",
        name: "Bosphore",
        x: 77,
        y: 30,
        lngLat: [29.05, 41.09],
        mapZoom: 11.2,
        image: istanbulBosphorus,
        veil: "#2f8fa0",
        theme: {
          ink: "#fbfdf8",
          muted: "#cfe3ea",
          deep: "#1d4f63",
          water: "#2f8fa0",
          gold: "#e6c45a",
          stone: "#c7d6c0",
          red: "#a0503a"
        },
        history: ""
      }
    ]
  },
  {
    id: "rome",
    status: "planned",
    name: "Rome",
    country: "Italie",
    subtitle: "Ruines, places et lumière romaine",
    atlas: { x: 48.7, y: 70.3 },
    coordinates: { lat: 41.9028, lng: 12.4964 }
  },
  {
    id: "dublin",
    status: "visited",
    name: "Dublin",
    country: "Irlande",
    subtitle: "Briques, pubs et horizons atlantiques",
    atlas: { x: 23.1, y: 26.8 },
    coordinates: { lat: 53.3498, lng: -6.2603 },
    // Vue générale stylisée (nuit, la Liffey vers la baie), aussi vignette sur l'accueil.
    capsuleImage: dublinOverview,
    badgeImage: dublinBadge,
    mapStyleUrl: MAPBOX_STYLE_URL,
    mapZoom: 13.2,
    // Palette de la vue générale (nuit bleue, lumières dorées).
    theme: {
      ink: "#fff1dc",
      muted: "#b9c0cc",
      deep: "#141d2e",
      water: "#2e4a6b",
      gold: "#f2b24c",
      stone: "#a08670",
      red: "#8a3a2a"
    },
    // Quartiers visités (mêmes champs qu'Istanbul).
    districts: [
      {
        id: "howth",
        name: "Howth",
        x: 24,
        y: 6,
        lngLat: [-6.0656, 53.3878],
        mapZoom: 14,
        image: dublinHowth,
        veil: "#8fa9bf",
        theme: {
          ink: "#fffaf0",
          muted: "#d3dbe2",
          deep: "#2f4a5e",
          water: "#2f5f86",
          gold: "#f0c060",
          stone: "#c8c2b4",
          red: "#7d4f78"
        },
        history: ""
      }
    ]
  },
  {
    id: "barcelona",
    status: "planned",
    name: "Barcelone",
    country: "Espagne",
    subtitle: "Modernisme, Méditerranée et quartiers vivants",
    atlas: { x: 25.1, y: 72 },
    coordinates: { lat: 41.3874, lng: 2.1686 }
  },
  {
    id: "zagreb",
    status: "planned",
    name: "Zagreb",
    country: "Croatie",
    subtitle: "Façades, passages et douceur continentale",
    atlas: { x: 56.3, y: 52.9 },
    coordinates: { lat: 45.815, lng: 15.9819 }
  }
];

export function isVisited(city) {
  return city?.status === "visited";
}

export function getCity(id) {
  return cities.find((city) => city.id === id);
}
