/**
 * Source unique des villes de l'atlas.
 *
 * - status "visited" : capsule disponible (image, points, badge débloqué).
 * - status "planned" : étape future, affichée sur la carte et dans les badges à débloquer.
 *
 * L'ordre du tableau = l'ordre des étapes sur la carte d'accueil et dans la galerie de badges.
 */
import istanbulCapsule from "../assets/istanbul-capsule.webp";
import istanbulBadge from "../assets/badge-istanbul.webp";
import bosphorusGhostFleet from "../assets/bosphorus-russian-ghost-fleet.webp";
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
    capsuleImage: istanbulCapsule,
    badgeImage: istanbulBadge,
    albumUrl: "https://photos.app.goo.gl/RLJxDxjaEi1JhCFHA",
    mapStyleUrl: MAPBOX_STYLE_URL,
    mapZoom: 10.6,
    // Caméra de référence (Camera Lab) ayant servi à produire la vue de la capsule.
    referenceCamera: {
      center: [28.98192, 41.01297],
      zoom: 13.95,
      bearing: 33,
      pitch: 60,
      aspectRatio: "16:9"
    },
    theme: {
      ink: "#f6ead4",
      muted: "#adc3bf",
      deep: "#09253a",
      water: "#0e5672",
      gold: "#c69a45",
      stone: "#d8b886",
      red: "#6f2024"
    },
    intro:
      "Une capsule visuelle orientée par la Corne d'Or et le Bosphore, entre péninsule historique, rive de Galata et seuil asiatique.",
    // x / y : position du repère en % de l'image de capsule.
    // lngLat : position géographique réelle (utilisée par le Camera Lab).
    points: [
      {
        id: "blue-mosque",
        title: "Mosquée Bleue",
        type: "Monument",
        x: 48,
        y: 78,
        lngLat: [28.9768, 41.0054],
        text:
          "Placeholder : premier repère de la péninsule historique dans cette vue depuis le sud, avec ses minarets et ses coupoles."
      },
      {
        id: "hagia-sophia",
        title: "Sainte-Sophie",
        type: "Monument",
        x: 46,
        y: 58,
        lngLat: [28.98, 41.0086],
        text:
          "Placeholder : masse de pierre chaude entre Mosquée Bleue et Topkapi, mémoire byzantine puis ottomane."
      },
      {
        id: "grand-bazaar",
        title: "Grand Bazar",
        type: "Marché",
        x: 25,
        y: 70,
        lngLat: [28.9681, 41.0107],
        text:
          "Placeholder : trame dense de toits, passages couverts, or patiné et rouge sombre au sud-ouest de Sultanahmet."
      },
      {
        id: "topkapi",
        title: "Topkapi",
        type: "Palais",
        x: 66,
        y: 61,
        lngLat: [28.984, 41.0115],
        text:
          "Placeholder : jardins, murs et pavillons en promontoire, posé entre la Corne d'Or, la mer de Marmara et le Bosphore."
      },
      {
        id: "galata",
        title: "Tour de Galata",
        type: "Repère",
        x: 43,
        y: 24,
        lngLat: [28.9741, 41.0256],
        text:
          "Placeholder : repère vertical de l'autre côté de la Corne d'Or, au-dessus de Karaköy et des quartiers denses."
      },
      {
        id: "galata-bridge",
        title: "Pont de Galata",
        type: "Passage",
        x: 34,
        y: 43,
        lngLat: [28.9738, 41.0201],
        text:
          "Placeholder : liaison visuelle entre Galata et la péninsule historique, au-dessus de la Corne d'Or."
      },
      {
        id: "bosphorus",
        title: "Bosphore",
        type: "Eau",
        x: 65,
        y: 34,
        image: bosphorusGhostFleet,
        text: "La flotte fantôme russe"
      },
      {
        id: "asian-side",
        title: "Rive asiatique",
        type: "Rive",
        x: 86,
        y: 33,
        text:
          "Placeholder : bord opposé du Bosphore, contrepoint asiatique de la péninsule et de Galata."
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
