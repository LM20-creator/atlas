import { ArrowUpRight, Medal } from "lucide-react";
import { useMemo, useState } from "react";
import atlasMapUrl from "../assets/atlas-europe-light.webp";
import homeLogoUrl from "../assets/home-logo.webp";

const MAP_WIDTH = 1000;
const MAP_HEIGHT = 562.5;
const MAP_VIEW = {
  minLng: -12,
  maxLng: 55,
  minLat: 67,
  maxLat: 27
};

function projectCoordinates({ lat, lng }) {
  return {
    x: ((lng - MAP_VIEW.minLng) / (MAP_VIEW.maxLng - MAP_VIEW.minLng)) * MAP_WIDTH,
    y: ((MAP_VIEW.minLat - lat) / (MAP_VIEW.minLat - MAP_VIEW.maxLat)) * MAP_HEIGHT
  };
}

function buildRoutePath(points) {
  if (points.length < 2) {
    return "";
  }

  return points.slice(1).reduce((path, point, index) => {
    const previous = points[index];
    const controlX = (previous.x + point.x) / 2;
    const controlY = Math.min(previous.y, point.y) - 21;

    return `${path} Q ${controlX} ${controlY} ${point.x} ${point.y}`;
  }, `M ${points[0].x} ${points[0].y}`);
}

export default function GlobeView({ cities, onSelectCity, onOpenBadges }) {
  const originCity = {
    id: "paris",
    name: "Paris",
    coordinates: { lat: 48.8566, lng: 2.3522 }
  };
  const routeCities = useMemo(() => {
    const istanbul = cities.find((city) => city.id === "istanbul");
    const florence = cities.find((city) => city.id === "florence") ?? {
      id: "florence",
      name: "Florence",
      country: "Italie",
      subtitle: "Renaissance, pierre blonde et collines",
      coordinates: { lat: 43.7696, lng: 11.2558 },
      capsuleReady: false
    };
    const futureCities = [
      {
        id: "rome",
        name: "Rome",
        country: "Italie",
        subtitle: "Ruines, places et lumière romaine",
        coordinates: { lat: 41.9028, lng: 12.4964 },
        capsuleReady: false
      },
      {
        id: "dublin",
        name: "Dublin",
        country: "Irlande",
        subtitle: "Briques, pubs et horizons atlantiques",
        coordinates: { lat: 53.3498, lng: -6.2603 },
        capsuleReady: false
      },
      {
        id: "barcelona",
        name: "Barcelone",
        country: "Espagne",
        subtitle: "Modernisme, Méditerranée et quartiers vivants",
        coordinates: { lat: 41.3874, lng: 2.1686 },
        capsuleReady: false
      },
      {
        id: "zagreb",
        name: "Zagreb",
        country: "Croatie",
        subtitle: "Façades, passages et douceur continentale",
        coordinates: { lat: 45.815, lng: 15.9819 },
        capsuleReady: false
      }
    ];

    return [florence, istanbul, ...futureCities].filter(Boolean);
  }, [cities]);

  const [activeCityId, setActiveCityId] = useState("istanbul");
  const activeCity = routeCities.find((city) => city.id === activeCityId) ?? routeCities[0];
  const originPoint = {
    ...projectCoordinates(originCity.coordinates),
    city: originCity
  };
  const routePoints = routeCities.map((city) => ({
    ...projectCoordinates(city.coordinates),
    city
  }));
  const routePaths = routePoints.map((destination) =>
    buildRoutePath([originPoint, destination])
  );
  const visitedPoints = routePoints.filter(({ city }) =>
    ["florence", "istanbul"].includes(city.id)
  );
  const viewBoxValues = [0, 0, MAP_WIDTH, MAP_HEIGHT];
  const viewBox = viewBoxValues.join(" ");

  function canOpen(city) {
    return city.capsuleReady !== false && cities.some((availableCity) => availableCity.id === city.id);
  }

  return (
    <main className="atlas-home">
      <div className="atlas-home-tools">
        <button className="badges-button" type="button" onClick={onOpenBadges}>
          <Medal size={16} strokeWidth={1.7} />
          <span>Mes badges</span>
        </button>
        <img
          className="atlas-home-logo"
          src={homeLogoUrl}
          alt=""
          aria-hidden="true"
          decoding="async"
        />
      </div>

      <header className="atlas-copy">
        <div>
          <p className="eyebrow">Carnet d’atmosphères</p>
          <h1>Atlas privé</h1>
        </div>
        <p className="atlas-intro">Un fil de voyage entre capsules visuelles.</p>
      </header>

      <section className="atlas-stage" aria-label="Parcours de voyage">
        <div className="atlas-caption" aria-hidden="true">
          <span>Europe &amp; Méditerranée</span>
          <span>{routeCities.length.toString().padStart(2, "0")} étapes</span>
        </div>

        <svg
          className="atlas-map"
          viewBox={viewBox}
          preserveAspectRatio="none"
          role="img"
          aria-label="Carte des parcours au départ de Paris"
        >
          <defs>
            <filter id="routeGlow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="3.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fffaf0" stopOpacity="1" />
              <stop offset="38%" stopColor="#c58a39" stopOpacity="0.62" />
              <stop offset="100%" stopColor="#c58a39" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="revealGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="black" />
              <stop offset="55%" stopColor="black" stopOpacity="0.96" />
              <stop offset="100%" stopColor="white" />
            </radialGradient>
            <mask id="visitedRevealMask" maskUnits="userSpaceOnUse" x="0" y="0" width={MAP_WIDTH} height={MAP_HEIGHT}>
              <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="white" />
              {visitedPoints.map(({ city, x, y }) => (
                <circle
                  className="atlas-reveal-hole"
                  key={city.id}
                  cx={x}
                  cy={y}
                  r="70"
                  fill="url(#revealGradient)"
                />
              ))}
            </mask>
          </defs>

          <rect className="atlas-paper" width={MAP_WIDTH} height={MAP_HEIGHT} />
          <image
            className="atlas-earth"
            href={atlasMapUrl}
            width={MAP_WIDTH}
            height={MAP_HEIGHT}
            preserveAspectRatio="none"
          />
          <rect className="atlas-wash" width={MAP_WIDTH} height={MAP_HEIGHT} />
          <rect
            className="atlas-fog"
            width={MAP_WIDTH}
            height={MAP_HEIGHT}
            mask="url(#visitedRevealMask)"
          />
          {routePaths.map((path, index) => (
            <g key={routeCities[index].id}>
              <path className="atlas-route-glow" d={path} filter="url(#routeGlow)" />
              <path className="atlas-route" d={path} pathLength="1" />
            </g>
          ))}

          {routePoints.map(({ city, x, y }) => (
            <g className="atlas-node-group" key={city.id} transform={`translate(${x} ${y})`}>
              <circle className="atlas-node-pulse" r="7.5" fill="url(#nodeGlow)" />
              <circle className={city.id === activeCity?.id ? "atlas-node is-active" : "atlas-node"} r="2.8" />
            </g>
          ))}
        </svg>

        <div className="atlas-node-buttons">
          <div
            className="atlas-origin"
            style={{
              "--city-x": `${((originPoint.x - viewBoxValues[0]) / viewBoxValues[2]) * 100}%`,
              "--city-y": `${((originPoint.y - viewBoxValues[1]) / viewBoxValues[3]) * 100}%`
            }}
            aria-label="Départ : Paris"
          >
            <span>Paris</span>
          </div>

          {routePoints.map(({ city, x, y }, index) => (
            <button
              className={`atlas-city atlas-city-${city.id}${city.id === activeCity?.id ? " is-active" : ""}`}
              key={city.id}
              type="button"
              style={{
                "--city-x": `${((x - viewBoxValues[0]) / viewBoxValues[2]) * 100}%`,
                "--city-y": `${((y - viewBoxValues[1]) / viewBoxValues[3]) * 100}%`
              }}
              onClick={() => setActiveCityId(city.id)}
              aria-pressed={city.id === activeCity?.id}
              aria-label={`Sélectionner ${city.name}`}
            >
              <span className="atlas-city-index">{String(index + 1).padStart(2, "0")}</span>
              <span className="atlas-city-name">{city.name}</span>
            </button>
          ))}
        </div>

        {activeCity && (
          <aside className="atlas-card" key={activeCity.id} aria-live="polite">
            {activeCity.capsuleImage && (
              <img
                className="atlas-card-image"
                src={activeCity.capsuleImage}
                alt=""
                loading="lazy"
                decoding="async"
              />
            )}
            <div className="atlas-card-copy">
              <span className="atlas-card-kicker">{activeCity.country}</span>
              <h2>{activeCity.name}</h2>
              <p>{activeCity.subtitle}</p>
            </div>
            <button
              className="atlas-enter"
              type="button"
              disabled={!canOpen(activeCity)}
              onClick={() => onSelectCity(activeCity.id)}
            >
              <span>{canOpen(activeCity) ? "Entrer" : "Bientôt"}</span>
              <ArrowUpRight size={17} strokeWidth={1.7} />
            </button>
          </aside>
        )}
      </section>
    </main>
  );
}
