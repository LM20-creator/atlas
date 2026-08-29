import florenceBadge from "../assets/badge-florence.webp";
import istanbulBadge from "../assets/badge-istanbul.webp";

export const badges = [
  {
    id: "istanbul",
    city: "Istanbul",
    country: "Turquie",
    image: istanbulBadge,
    unlocked: true
  },
  {
    id: "florence",
    city: "Florence",
    country: "Italie",
    image: florenceBadge,
    unlocked: true
  },
  { id: "rome", city: "Rome", country: "Italie", unlocked: false },
  { id: "dublin", city: "Dublin", country: "Irlande", unlocked: false },
  { id: "barcelona", city: "Barcelone", country: "Espagne", unlocked: false },
  { id: "zagreb", city: "Zagreb", country: "Croatie", unlocked: false }
];
