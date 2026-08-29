import { ArrowLeft, Images, Map } from "lucide-react";
import { lazy, Suspense, useState } from "react";
import AtmosphereMap from "./AtmosphereMap.jsx";
import InfoPanel from "./InfoPanel.jsx";

const CityMapPanel = lazy(() => import("./CityMapPanel.jsx"));

export default function CityCapsule({ city, onBack }) {
  const [activePointId, setActivePointId] = useState(null);
  const [panelMode, setPanelMode] = useState(null);
  const activePoint = city.points.find((point) => point.id === activePointId);
  const showInfoPanel = Boolean(activePoint);
  const showMap = panelMode === "map";

  function selectPoint(pointId) {
    setActivePointId(pointId);
    setPanelMode(null);
  }

  function showMapPanel(event) {
    event.preventDefault();
    setActivePointId(null);
    setPanelMode("map");
  }

  return (
    <section
      className="capsule-view"
      style={{
        "--theme-ink": city.theme.ink,
        "--theme-muted": city.theme.muted,
        "--theme-deep": city.theme.deep,
        "--theme-water": city.theme.water,
        "--theme-gold": city.theme.gold,
        "--theme-stone": city.theme.stone,
        "--theme-red": city.theme.red
      }}
    >
      <div className="capsule-stage">
        <AtmosphereMap
          city={city}
          activePointId={activePointId}
          onSelectPoint={selectPoint}
        />

        <div className="capsule-topbar" aria-label="Navigation de la capsule">
          <div className="capsule-brand">
            <button
              className="floating-button back-button"
              type="button"
              onClick={onBack}
              aria-label="Retour à l’atlas"
            >
              <ArrowLeft size={17} />
              <span>Globe</span>
            </button>

            {city.logoImage && (
              <img
                className="capsule-logo"
                src={city.logoImage}
                alt=""
                aria-hidden="true"
                decoding="async"
              />
            )}
          </div>

          <div className="floating-actions" aria-label="Actions secondaires">
            {city.albumUrl ? (
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
            ) : (
              <button
                className="floating-action"
                type="button"
                disabled
                aria-label={`Photos de ${city.name} bientôt disponibles`}
              >
                <Images size={17} />
                <span>Photos</span>
              </button>
            )}
            <a className="floating-action" href={city.mapUrl} onClick={showMapPanel} aria-label="Ouvrir le plan">
              <Map size={17} />
              <span>Plan</span>
            </a>
          </div>
        </div>

        <div className="capsule-heading">
          <p>{city.country}</p>
          <h1>{city.name}</h1>
          <span>{city.subtitle}</span>
        </div>

        {showInfoPanel && (
          <InfoPanel
            city={city}
            point={activePoint}
            onClose={() => {
              setActivePointId(null);
              setPanelMode(null);
            }}
          />
        )}

        {showMap && (
          <Suspense fallback={<div className="city-map-loading">Chargement du plan…</div>}>
            <CityMapPanel city={city} onClose={() => setPanelMode(null)} />
          </Suspense>
        )}
      </div>
    </section>
  );
}
