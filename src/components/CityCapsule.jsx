import { ArrowLeft, Images, Map } from "lucide-react";
import { lazy, Suspense, useState } from "react";
import AtmosphereMap from "./AtmosphereMap.jsx";
import InfoPanel from "./InfoPanel.jsx";

const CityMapPanel = lazy(() => import("./CityMapPanel.jsx"));

/** Palette de la ville exposée en variables CSS (--theme-ink, --theme-gold, …). */
function themeVariables(theme = {}) {
  return Object.fromEntries(Object.entries(theme).map(([name, value]) => [`--theme-${name}`, value]));
}

export default function CityCapsule({ city, onBack }) {
  const [activePointId, setActivePointId] = useState(null);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const activePoint = city.points.find((point) => point.id === activePointId);

  function selectPoint(pointId) {
    setActivePointId(pointId);
    setIsMapOpen(false);
  }

  function openMap() {
    setActivePointId(null);
    setIsMapOpen(true);
  }

  return (
    <section className="capsule-view" style={themeVariables(city.theme)}>
      <div className="capsule-stage">
        <AtmosphereMap city={city} activePointId={activePointId} onSelectPoint={selectPoint} />

        <div className="capsule-topbar" aria-label="Navigation de la capsule">
          <div className="capsule-brand">
            <button
              className="floating-button back-button"
              type="button"
              onClick={onBack}
              aria-label="Retour à l’atlas"
            >
              <ArrowLeft size={17} />
              <span>Atlas</span>
            </button>

            {city.badgeImage && (
              <img className="capsule-logo" src={city.badgeImage} alt="" aria-hidden="true" decoding="async" />
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
            <button className="floating-action" type="button" onClick={openMap} aria-label="Ouvrir le plan">
              <Map size={17} />
              <span>Plan</span>
            </button>
          </div>
        </div>

        <div className="capsule-heading">
          <p>{city.country}</p>
          <h1>{city.name}</h1>
          <span>{city.subtitle}</span>
        </div>

        {activePoint && <InfoPanel point={activePoint} onClose={() => setActivePointId(null)} />}

        {isMapOpen && (
          <Suspense fallback={<div className="city-map-loading">Chargement du plan…</div>}>
            <CityMapPanel city={city} onClose={() => setIsMapOpen(false)} />
          </Suspense>
        )}
      </div>
    </section>
  );
}
