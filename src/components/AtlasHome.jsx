import { Medal } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import atlasImage from "../assets/atlas/europe.webp";
import homeLogoUrl from "../assets/home-logo.webp";
import { cities, isVisited } from "../data/cities.js";
import { themeVariables } from "../lib/theme.js";
import {
  ATLAS_VEIL,
  REVEAL_MS,
  VEIL_MS,
  ZOOM_MS,
  isTouchDevice,
  preload,
  prefersReducedMotion,
  readFlag,
  setFlag,
  wait
} from "../lib/transitions.js";
import CloudCover from "./CloudCover.jsx";
import CoverScene from "./CoverScene.jsx";

const HINT_STORAGE_KEY = "atlas-prive:city-hint-seen";

const ATLAS_THEME = {
  ink: "#fff6e6",
  muted: "#d6d2c6",
  deep: ATLAS_VEIL,
  gold: "#e0ad5a"
};

const mappedCities = cities.filter((city) => city.atlas);
const visitedCities = mappedCities.filter(isVisited);
const plannedCities = mappedCities.filter((city) => !isVisited(city));
// Écran portrait : cadrage de départ sur la dernière ville visitée (les villes sont trop éloignées pour tenir ensemble).
const startFocusX = visitedCities.at(-1)?.atlas.x ?? 50;

/**
 * Accueil : l'Europe sous les nuages. Les villes visitées sont des éclaircies avec un point lumineux ;
 * un clic zoome vers la ville, puis le voile de la ville fait la transition (comme ville → quartier).
 * `returningFrom` : id de la ville qu'on vient de quitter → l'atlas se dézoome depuis elle.
 */
export default function AtlasHome({ onSelectCity, onOpenBadges, returningFrom }) {
  const returning = mappedCities.find((city) => city.id === returningFrom) ?? null;
  const [phase, setPhase] = useState(returning ? "veil" : "idle"); // idle | zoom | veil | reveal | unzoom
  const [veil, setVeil] = useState({ color: ATLAS_VEIL, label: "" });
  const [zoomOrigin, setZoomOrigin] = useState(returning ? returning.atlas : null);
  const [selectedId, setSelectedId] = useState(null);
  const [showHint, setShowHint] = useState(() => !readFlag(HINT_STORAGE_KEY));
  const busy = useRef(Boolean(returning));

  // Retour depuis une ville : le voile s'efface pendant que l'Europe se dézoome.
  useEffect(() => {
    if (!returning) return undefined;
    let cancelled = false;
    (async () => {
      await wait(40);
      if (cancelled) return;
      setPhase(prefersReducedMotion() ? "reveal" : "unzoom");
      await wait(REVEAL_MS);
      if (cancelled) return;
      setPhase("idle");
      busy.current = false;
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function enterCity(city) {
    if (busy.current) return;
    busy.current = true;
    setSelectedId(null);
    if (showHint) {
      setShowHint(false);
      setFlag(HINT_STORAGE_KEY);
    }

    (async () => {
      const reduced = prefersReducedMotion();
      setVeil({ color: city.theme.deep, label: city.name });
      setZoomOrigin(city.atlas);
      setPhase(reduced ? "veil" : "zoom");
      await Promise.all([wait(reduced ? VEIL_MS : ZOOM_MS), preload(city.capsuleImage)]);
      onSelectCity(city.id);
    })();
  }

  function handlePointClick(event, city) {
    event.stopPropagation();
    if (busy.current) return;
    // Mobile : 1er toucher = sélection (le nom apparaît), 2e toucher = entrée.
    if (isTouchDevice() && selectedId !== city.id) {
      setSelectedId(city.id);
      return;
    }
    enterCity(city);
  }

  const zoomStyle = zoomOrigin ? { "--zoom-x": `${zoomOrigin.x}%`, "--zoom-y": `${zoomOrigin.y}%` } : undefined;

  return (
    <main className={`city-explorer atlas-explorer phase-${phase}`} style={themeVariables(ATLAS_THEME)}>
      <CoverScene
        image={atlasImage}
        className="scene-city scene-atlas"
        style={zoomStyle}
        focusX={zoomOrigin?.x ?? startFocusX}
        pointsY={visitedCities.map((city) => city.atlas.y)}
        onClick={() => setSelectedId(null)}
      >
        <CloudCover clearings={visitedCities.map((city) => city.atlas)} shape={atlasImage} />

        {plannedCities.map((city) => (
          <span
            key={city.id}
            className="atlas-glow"
            style={{ left: `${city.atlas.x}%`, top: `${city.atlas.y}%` }}
            aria-hidden="true"
          />
        ))}

        {visitedCities.map((city) => (
          <button
            key={city.id}
            type="button"
            className={`district-point${city.atlas.x > 80 ? " is-label-left" : ""}${
              selectedId === city.id ? " is-selected" : ""
            }`}
            style={{ left: `${city.atlas.x}%`, top: `${city.atlas.y}%`, "--point-color": city.theme.gold }}
            onClick={(event) => handlePointClick(event, city)}
            aria-label={`Entrer dans ${city.name}`}
          >
            <span className="district-point-dot" aria-hidden="true" />
            <span className="district-point-label">{city.name}</span>
          </button>
        ))}
      </CoverScene>

      <div className="scene-vignette" aria-hidden="true" />

      <div className="capsule-topbar">
        <div className="capsule-brand">
          <img className="capsule-logo" src={homeLogoUrl} alt="" aria-hidden="true" decoding="async" />
        </div>
        <div className="floating-actions">
          <button className="floating-action" type="button" onClick={onOpenBadges}>
            <Medal size={16} strokeWidth={1.7} />
            <span>Mes badges</span>
          </button>
        </div>
      </div>

      <div className="capsule-heading city-heading">
        <p>Carnet d’atmosphères</p>
        <h1>Atlas privé</h1>
      </div>

      {showHint && (
        <p className="district-hint" role="status">
          {isTouchDevice() ? "Touchez une ville pour y entrer" : "Cliquez sur une ville pour y entrer"}
        </p>
      )}

      {/* Voile de transition (sert aussi d'écran de chargement) */}
      <div className="scene-veil" style={{ "--veil-color": veil.color }} aria-hidden="true">
        {veil.label && <span>{veil.label}</span>}
      </div>
    </main>
  );
}
