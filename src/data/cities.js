/**
 * Source unique des villes de l'atlas.
 *
 * - status "visited" : capsule disponible, badge débloqué.
 *     · avec `districts` : vue générale de la ville → quartiers (nouveau modèle) ;
 *     · avec `points`    : une image + repères cliquables (ancien modèle, Florence en attendant).
 * - status "planned" : étape future, affichée sur la carte et dans les badges à débloquer.
 *
 * L'ordre du tableau = l'ordre des étapes sur la carte d'accueil et dans la galerie de badges.
 */
import istanbulOverview from "../assets/istanbul/overview.webp";
import istanbulGalata from "../assets/istanbul/galata.webp";
import istanbulSultanahmet from "../assets/istanbul/sultanahmet.webp";
import istanbulBesiktas from "../assets/istanbul/besiktas.webp";
import istanbulGalataBridge from "../assets/istanbul/galata-bridge.webp";
import istanbulUskudar from "../assets/istanbul/uskudar.webp";
import istanbulBosphorus from "../assets/istanbul/bosphorus.webp";
import istanbulBadge from "../assets/badge-istanbul.webp";
import florenceCapsule from "../assets/florence-capsule.webp";
import florenceBadge from "../assets/badge-florence.webp";

/** Point de départ de tous les trajets sur la carte d'accueil. */
export const origin = {
  id: "paris",
  name: "Paris",
  coordinates: { lat: 48.8566, lng: 2.3522 }
};

const MAPBOX_STYLE_URL = "https://api.mapbox.com/styles/v1/leomass/cmtcy1ssl002901s1c2vi29ab.html";

export const cities = [
  {
    id: "florence",
    status: "visited",
    name: "Florence",
    country: "Italie",
    subtitle: "Renaissance, pierre blonde et collines",
    coordinates: { lat: 43.7696, lng: 11.2558 },
    capsuleImage: florenceCapsule,
    badgeImage: florenceBadge,
    mapStyleUrl: MAPBOX_STYLE_URL,
    mapZoom: 12.4,
    theme: {
      ink: "#fff0d5",
      muted: "#bdc2a9",
      deep: "#2a211b",
      water: "#587b80",
      gold: "#c89550",
      stone: "#d4b27f",
      red: "#7b3028"
    },
    intro:
      "Une capsule florentine guidée par l'Arno, les toits de terre cuite et les grands repères de la Renaissance.",
    // x / y : position du repère en % de l'image de capsule.
    points: [
      {
        id: "duomo",
        title: "Cathédrale Santa Maria del Fiore",
        type: "Cathédrale",
        x: 61,
        y: 39,
        text:
          "Le Duomo domine Florence par l'immense coupole rouge conçue par Filippo Brunelleschi et ses façades de marbre polychrome."
      },
      {
        id: "palazzo-vecchio",
        title: "Palazzo Vecchio",
        type: "Palais",
        x: 37,
        y: 42,
        url: "https://cultura.comune.fi.it/pagina/musei-civici-fiorentini/museo-di-palazzo-vecchio",
        text:
          "Ce palais-forteresse du XIVe siècle domine la Piazza della Signoria. Il abrite le Salone dei Cinquecento et la tour d'Arnolfo."
      },
      {
        id: "ponte-vecchio",
        title: "Ponte Vecchio",
        type: "Pont",
        x: 31,
        y: 60,
        text:
          "Le plus ancien et célèbre pont en pierre de la ville, reconnaissable à ses échoppes de joailliers construites à flanc d'arche."
      },
      {
        id: "santa-croce",
        title: "Basilique Santa Croce",
        type: "Basilique",
        x: 82,
        y: 51,
        url: "https://www.santacroceopera.it/",
        text:
          "La plus grande église franciscaine au monde est surnommée le Panthéon des gloires italiennes : Michel-Ange, Galilée et Machiavel y reposent."
      },
      {
        id: "piazzale-michelangelo",
        title: "Piazzale Michelangelo",
        type: "Belvédère",
        x: 75,
        y: 79,
        text:
          "Sur une colline au sud de l'Arno, cette place offre le panorama le plus spectaculaire et emblématique sur toute la ville."
      }
    ]
  },
  {
    id: "istanbul",
    status: "visited",
    name: "Istanbul",
    country: "Turquie",
    subtitle: "Bosphore, empires et passages",
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
    districts: [
      {
        id: "galata",
        name: "Galata",
        x: 38.3,
        y: 25.5,
        lngLat: [28.9741, 41.0256],
        mapZoom: 15.2,
        image: istanbulGalata,
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
    coordinates: { lat: 41.9028, lng: 12.4964 }
  },
  {
    id: "dublin",
    status: "planned",
    name: "Dublin",
    country: "Irlande",
    subtitle: "Briques, pubs et horizons atlantiques",
    coordinates: { lat: 53.3498, lng: -6.2603 }
  },
  {
    id: "barcelona",
    status: "planned",
    name: "Barcelone",
    country: "Espagne",
    subtitle: "Modernisme, Méditerranée et quartiers vivants",
    coordinates: { lat: 41.3874, lng: 2.1686 }
  },
  {
    id: "zagreb",
    status: "planned",
    name: "Zagreb",
    country: "Croatie",
    subtitle: "Façades, passages et douceur continentale",
    coordinates: { lat: 45.815, lng: 15.9819 }
  }
];

export function isVisited(city) {
  return city?.status === "visited";
}

export function getCity(id) {
  return cities.find((city) => city.id === id);
}
