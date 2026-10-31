import { ArrowLeft, BookOpen, ChevronLeft, ChevronRight, Images, Map, X } from "lucide-react";
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
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
import CoverScene from "./CoverScene.jsx";

const CityMapPanel = lazy(() => import("./CityMapPanel.jsx"));

const HINT_STORAGE_KEY = "atlas-prive:district-hint-seen";

/**
 * `arriving` : on vient de l'atlas → la ville apparaît derrière le voile de la ville.
 * `onBack`   : appelé une fois le voile de l'atlas monté.
 */
export default function CityExplorer({ city, onBack, arriving = false }) {
  const districts = city.districts;
  const [districtId, setDistrictId] = useState(null);
  const [phase, setPhase] = useState(arriving ? "veil" : "idle"); // idle | zoom | veil | reveal | unzoom
  const [veil, setVeil] = useState({ color: city.theme.deep, label: arriving ? city.name : "" });
  const [zoomOrigin, setZoomOrigin] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [showHint, setShowHint] = useState(() => !readFlag(HINT_STORAGE_KEY));
  const busy = useRef(arriving);

  // Arrivée depuis l'atlas : le voile de la ville s'efface.
  useEffect(() => {
    if (!arriving) return undefined;
    let cancelled = false;
    (async () => {
      await wait(40);
      if (cancelled) return;
      setPhase("reveal");
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

  const district = districts.find((item) => item.id === districtId) ?? null;
  const theme = district?.theme ?? city.theme;

  const runTransition = useCallback(async (steps) => {
    if (busy.current) return;
    busy.current = true;
    setIsHistoryOpen(false);
    setIsMapOpen(false);
    setSelectedId(null);
    try {
      await steps(prefersReducedMotion());
    } finally {
      setPhase("idle");
      busy.current = false;
    }
  }, []);

  /** Ville → quartier : zoom vers le point, voile, chargement, apparition. */
  function enterDistrict(target) {
    if (showHint) {
      setShowHint(false);
      setFlag(HINT_STORAGE_KEY);
    }

    runTransition(async (reduced) => {
      setVeil({ color: target.veil, label: target.name });
      setZoomOrigin({ x: target.x, y: target.y });
      setPhase(reduced ? "veil" : "zoom");
      await Promise.all([wait(reduced ? VEIL_MS : ZOOM_MS), preload(target.image)]);
      setDistrictId(target.id);
      setPhase("reveal");
      await wait(REVEAL_MS);
    });
  }

  /** Quartier → quartier : voile seul. */
  function switchDistrict(target) {
    if (target.id === districtId) return;
    runTransition(async () => {
      setVeil({ color: target.veil, label: target.name });
      setPhase("veil");
      await Promise.all([wait(VEIL_MS), preload(target.image)]);
      setDistrictId(target.id);
      setPhase("reveal");
      await wait(REVEAL_MS);
    });
  }

  /** Quartier → ville : voile, puis la vue générale se dézoome depuis le quartier. */
  function backToCity() {
    const from = district;
    runTransition(async (reduced) => {
      setVeil({ color: city.theme.deep, label: "" });
      setPhase("veil");
      await wait(VEIL_MS);
      setDistrictId(null);
      setZoomOrigin(from ? { x: from.x, y: from.y } : null);
      setPhase(reduced ? "reveal" : "unzoom");
      await wait(REVEAL_MS);
    });
  }

  /** Ville ou quartier → atlas : voile de l'atlas, puis l'accueil se dézoome depuis la ville. */
  function leaveToAtlas() {
    runTransition(async () => {
      setVeil({ color: ATLAS_VEIL, label: "" });
      setPhase("veil");
      await wait(VEIL_MS);
      onBack();
    });
  }

  function handlePointClick(event, target) {
    event.stopPropagation();
    if (busy.current) return;
    // Mobile : 1er toucher = sélection (le nom apparaît), 2e toucher = entrée.
    if (isTouchDevice() && selectedId !== target.id) {
      setSelectedId(target.id);
      return;
    }
    enterDistrict(target);
  }

  // Échap : ferme le panneau ouvert, sinon remonte d'un niveau.
  useEffect(() => {
    function onKeyDown(event) {
      if (event.key !== "Escape" || busy.current) return;
      if (isMapOpen) setIsMapOpen(false);
      else if (isHistoryOpen) setIsHistoryOpen(false);
      else if (districtId) backToCity();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const districtIndex = district ? districts.indexOf(district) : -1;
  const previous = district ? districts[(districtIndex - 1 + districts.length) % districts.length] : null;
  const next = district ? districts[(districtIndex + 1) % districts.length] : null;
  // Sans quartier (ville tout juste ajoutée) : cadrage au centre.
  const districtsCenterX = districts.length
    ? districts.reduce((sum, item) => sum + item.x, 0) / districts.length
    : 50;
  const zoomStyle = zoomOrigin ? { "--zoom-x": `${zoomOrigin.x}%`, "--zoom-y": `${zoomOrigin.y}%` } : undefined;

  return (
    <section className={`city-explorer phase-${phase}`} style={themeVariables(theme)}>
      {district ? (
        <CoverScene
          key={district.id}
          image={district.image}
          className="scene-district"
          focusX={district.focusX ?? 50}
        />
      ) : (
        <CoverScene
          image={city.capsuleImage}
          className="scene-city"
          style={zoomStyle}
          focusX={zoomOrigin?.x ?? districtsCenterX}
          onClick={() => setSelectedId(null)}
        >
          {districts.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`district-point${item.x > 80 ? " is-label-left" : ""}${selectedId === item.id ? " is-selected" : ""}`}
              style={{ left: `${item.x}%`, top: `${item.y}%`, "--point-color": item.theme.gold }}
              onClick={(event) => handlePointClick(event, item)}
              aria-label={`Entrer dans le quartier ${item.name}`}
            >
              <span className="district-point-dot" aria-hidden="true" />
              <span className="district-point-label">{item.name}</span>
            </button>
          ))}
        </CoverScene>
      )}

      <div className="scene-vignette" aria-hidden="true" />

      {/* Barre du haut */}
      {district ? (
        <div className="capsule-topbar">
          <nav className="breadcrumb" aria-label="Fil d’Ariane">
            <button type="button" onClick={leaveToAtlas}>
              Atlas
            </button>
            <span aria-hidden="true">›</span>
            <button type="button" onClick={backToCity}>
              {city.name}
            </button>
            <span aria-hidden="true">›</span>
            <strong aria-current="page">{district.name}</strong>
          </nav>

          <div className="floating-actions">
            <button
              className="floating-action"
              type="button"
              onClick={() => {
                setIsHistoryOpen(false);
                setIsMapOpen(true);
              }}
              aria-label={`Plan de ${district.name}`}
            >
              <Map size={17} />
            </button>
            <button
              className={`floating-action${isHistoryOpen ? " is-active" : ""}`}
              type="button"
              onClick={() => setIsHistoryOpen((open) => !open)}
              aria-expanded={isHistoryOpen}
              aria-label="En savoir plus"
            >
              <BookOpen size={17} />
              <span>En savoir plus</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="capsule-topbar">
          <div className="capsule-brand">
            <button className="floating-button" type="button" onClick={leaveToAtlas} aria-label="Retour à l’atlas">
              <ArrowLeft size={17} />
              <span>Atlas</span>
            </button>
            {city.badgeImage && (
              <img className="capsule-logo" src={city.badgeImage} alt="" aria-hidden="true" decoding="async" />
            )}
          </div>

          <div className="floating-actions">
            {city.albumUrl && (
              <a
                className="floating-action"
                href={city.albumUrl}
                target="_blank"
                rel="noreferrer"
                aria-label={`Ouvrir les photos de ${city.name}`}
              >
                <Images size={17} />
                <span>Photos</span>
              </a>
            )}
            <button className="floating-action" type="button" onClick={() => setIsMapOpen(true)} aria-label="Ouvrir le plan">
              <Map size={17} />
              <span>Plan</span>
            </button>
          </div>
        </div>
      )}

      {/* Bas de l'écran */}
      {district ? (
        districts.length > 1 &&
        !isHistoryOpen && (
          <nav className="district-switcher" aria-label="Autres quartiers">
            <button type="button" onClick={() => switchDistrict(previous)} aria-label={`Quartier précédent : ${previous.name}`}>
              <ChevronLeft size={16} />
            </button>
            {districts.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`district-switcher-dot${item.id === district.id ? " is-current" : ""}`}
                onClick={() => switchDistrict(item)}
                aria-label={item.name}
                aria-current={item.id === district.id ? "true" : undefined}
              />
            ))}
            <button type="button" onClick={() => switchDistrict(next)} aria-label={`Quartier suivant : ${next.name}`}>
              <ChevronRight size={16} />
            </button>
          </nav>
        )
      ) : (
        <>
          <div className="capsule-heading city-heading">
            <p>{city.country}</p>
            <h1>{city.name}</h1>
          </div>
          {showHint && districts.length > 0 && (
            <p className="district-hint" role="status">
              {isTouchDevice() ? "Touchez un quartier pour y entrer" : "Cliquez sur un quartier pour y entrer"}
            </p>
          )}
        </>
      )}

      {district && isHistoryOpen && (
        <aside className="info-panel history-panel" aria-label={`Histoire de ${district.name}`}>
          <button className="panel-close" type="button" onClick={() => setIsHistoryOpen(false)} aria-label="Fermer">
            <X size={17} />
          </button>
          <p className="panel-kicker">Histoire</p>
          <h2>{district.name}</h2>
          {district.history && <p>{district.history}</p>}
        </aside>
      )}

      {isMapOpen && (
        <Suspense fallback={<div className="city-map-loading">Chargement du plan…</div>}>
          <CityMapPanel city={city} focus={district} onClose={() => setIsMapOpen(false)} />
        </Suspense>
      )}

      {/* Voile de transition (sert aussi d'écran de chargement) */}
      <div className="scene-veil" style={{ "--veil-color": veil.color }} aria-hidden="true">
        {veil.label && <span>{veil.label}</span>}
      </div>
    </section>
  );
}
