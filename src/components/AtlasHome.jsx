import { ArrowUpRight, Medal } from "lucide-react";
import { useState } from "react";
import atlasMapUrl from "../assets/atlas-europe-light.webp";
import homeLogoUrl from "../assets/home-logo.webp";
import { cities, isVisited, origin } from "../data/cities.js";

// Dimensions du repère SVG et emprise géographique de l'image atlas-europe-light
// (projection équirectangulaire simple : longitude → x, latitude → y).
const MAP_WIDTH = 1000;
const MAP_HEIGHT = 562.5;
const MAP_BOUNDS = { west: -12, east: 55, north: 67, south: 27 };

function project({ lat, lng }) {
  return {
    x: ((lng - MAP_BOUNDS.west) / (MAP_BOUNDS.east - MAP_BOUNDS.west)) * MAP_WIDTH,
    y: ((MAP_BOUNDS.north - lat) / (MAP_BOUNDS.north - MAP_BOUNDS.south)) * MAP_HEIGHT
  };
}

/** Courbe légèrement bombée entre deux points. */
function arcPath(from, to) {
  const controlX = (from.x + to.x) / 2;
  const controlY = Math.min(from.y, to.y) - 21;
  return `M ${from.x} ${from.y} Q ${controlX} ${controlY} ${to.x} ${to.y}`;
}

/** Position en % pour les boutons HTML superposés au SVG. */
function percentPosition({ x, y }) {
  return { "--city-x": `${(x / MAP_WIDTH) * 100}%`, "--city-y": `${(y / MAP_HEIGHT) * 100}%` };
}

const originPoint = project(origin.coordinates);
const routePoints = cities.map((city) => ({ city, ...project(city.coordinates) }));
const visitedPoints = routePoints.filter(({ city }) => isVisited(city));

export default function AtlasHome({ onSelectCity, onOpenBadges }) {
  const [activeCityId, setActiveCityId] = useState("istanbul");
  const activeCity = cities.find((city) => city.id === activeCityId) ?? cities[0];
  const canOpen = isVisited(activeCity);

  return (
    <main className="atlas-home">
      <div className="atlas-home-tools">
        <button className="badges-button" type="button" onClick={onOpenBadges}>
          <Medal size={16} strokeWidth={1.7} />
          <span>Mes badges</span>
        </button>
        <img className="atlas-home-logo" src={homeLogoUrl} alt="" aria-hidden="true" decoding="async" />
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
          <span>{String(cities.length).padStart(2, "0")} étapes</span>
        </div>

        <svg
          className="atlas-map"
          viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
          preserveAspectRatio="none"
          role="img"
          aria-label={`Carte des parcours au départ de ${origin.name}`}
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
                <circle className="atlas-reveal-hole" key={city.id} cx={x} cy={y} r="70" fill="url(#revealGradient)" />
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
          <rect className="atlas-fog" width={MAP_WIDTH} height={MAP_HEIGHT} mask="url(#visitedRevealMask)" />

          {routePoints.map((point) => (
            <g key={point.city.id}>
              <path className="atlas-route-glow" d={arcPath(originPoint, point)} filter="url(#routeGlow)" />
              <path className="atlas-route" d={arcPath(originPoint, point)} pathLength="1" />
            </g>
          ))}

          {routePoints.map(({ city, x, y }) => (
            <g className="atlas-node-group" key={city.id} transform={`translate(${x} ${y})`}>
              <circle className="atlas-node-pulse" r="7.5" fill="url(#nodeGlow)" />
              <circle className={city.id === activeCity.id ? "atlas-node is-active" : "atlas-node"} r="2.8" />
            </g>
          ))}
        </svg>

        <div className="atlas-node-buttons">
          <div className="atlas-origin" style={percentPosition(originPoint)} aria-label={`Départ : ${origin.name}`}>
            <span>{origin.name}</span>
          </div>

          {routePoints.map((point, index) => (
            <button
              className={`atlas-city atlas-city-${point.city.id}${point.city.id === activeCity.id ? " is-active" : ""}`}
              key={point.city.id}
              type="button"
              style={percentPosition(point)}
              onClick={() => setActiveCityId(point.city.id)}
              aria-pressed={point.city.id === activeCity.id}
              aria-label={`Sélectionner ${point.city.name}`}
            >
              <span className="atlas-city-index">{String(index + 1).padStart(2, "0")}</span>
              <span className="atlas-city-name">{point.city.name}</span>
            </button>
          ))}
        </div>

        <aside className="atlas-card" key={activeCity.id} aria-live="polite">
          {activeCity.capsuleImage && (
            <img className="atlas-card-image" src={activeCity.capsuleImage} alt="" loading="lazy" decoding="async" />
          )}
          <div className="atlas-card-copy">
            <span className="atlas-card-kicker">{activeCity.country}</span>
            <h2>{activeCity.name}</h2>
            <p>{activeCity.subtitle}</p>
          </div>
          <button
            className="atlas-enter"
            type="button"
            disabled={!canOpen}
            onClick={() => onSelectCity(activeCity.id)}
          >
            <span>{canOpen ? "Entrer" : "Bientôt"}</span>
            <ArrowUpRight size={17} strokeWidth={1.7} />
          </button>
        </aside>
      </section>
    </main>
  );
}
