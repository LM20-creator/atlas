import { Check, Copy, Eye, EyeOff, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { getCity } from "../data/cities.js";
import { loadMapbox, parseStyleUrl } from "../lib/mapbox.js";
import "../styles/camera-lab.css";

const istanbul = getCity("istanbul");
const reference = istanbul.referenceCamera;

const INITIAL_CAMERA = {
  lng: reference.center[0],
  lat: reference.center[1],
  zoom: reference.zoom,
  bearing: reference.bearing,
  pitch: reference.pitch
};

// Repères géolocalisés : les quartiers d'Istanbul (lngLat dans cities.js).
const ISTANBUL_MARKERS = istanbul.districts.map((district) => ({
  id: district.id,
  label: district.name,
  coordinates: district.lngLat
}));

const NEUTRAL_3D_STYLE = {
  version: 8,
  sources: {
    streets: {
      type: "vector",
      url: "mapbox://mapbox.mapbox-streets-v8"
    },
    terrain: {
      type: "raster-dem",
      url: "mapbox://mapbox.mapbox-terrain-dem-v1",
      tileSize: 512,
      maxzoom: 14
    }
  },
  terrain: {
    source: "terrain",
    exaggeration: 1
  },
  fog: {
    color: "rgb(238, 242, 239)",
    "horizon-blend": 0.08,
    "high-color": "rgb(222, 232, 229)",
    "space-color": "rgb(238, 242, 239)",
    "star-intensity": 0
  },
  layers: [
    {
      id: "background",
      type: "background",
      paint: {
        "background-color": "#eef2ef"
      }
    },
    {
      id: "landuse",
      source: "streets",
      "source-layer": "landuse",
      type: "fill",
      paint: {
        "fill-color": [
          "match",
          ["get", "class"],
          "park",
          "#cfe9cf",
          "cemetery",
          "#cfe3d0",
          "wood",
          "#c7e2c7",
          "grass",
          "#d6ecd4",
          "#f0eee8"
        ],
        "fill-opacity": 0.78
      }
    },
    {
      id: "buildings",
      source: "streets",
      "source-layer": "building",
      type: "fill-extrusion",
      filter: ["==", ["get", "extrude"], "true"],
      minzoom: 12,
      paint: {
        "fill-extrusion-color": "#d7c9b1",
        "fill-extrusion-height": ["coalesce", ["get", "height"], 16],
        "fill-extrusion-base": ["coalesce", ["get", "min_height"], 0],
        "fill-extrusion-opacity": 0.82
      }
    },
    {
      id: "water",
      source: "streets",
      "source-layer": "water",
      type: "fill",
      paint: {
        "fill-color": "#b9ddeb"
      }
    }
  ]
};

const CONTROL_FIELDS = [
  { key: "lng", label: "Longitude", min: 28.86, max: 29.12, step: 0.0005 },
  { key: "lat", label: "Latitude", min: 40.94, max: 41.08, step: 0.0005 },
  { key: "zoom", label: "Zoom", min: 9, max: 16, step: 0.05 },
  { key: "bearing", label: "Bearing", min: -180, max: 180, step: 1 },
  { key: "pitch", label: "Pitch", min: 0, max: 85, step: 1 }
];

function getStyleApiUrl(mapStyleUrl, token) {
  const parsed = parseStyleUrl(mapStyleUrl);
  if (!parsed) {
    return "";
  }

  return `https://api.mapbox.com/styles/v1/${parsed.owner}/${parsed.styleId}?access_token=${encodeURIComponent(token)}`;
}

async function loadExistingStyle(mapStyleUrl, token) {
  const styleApiUrl = getStyleApiUrl(mapStyleUrl, token);

  if (!styleApiUrl) {
    throw new Error("L’URL Mapbox Studio existante ne peut pas être convertie en URL de style Mapbox GL JS.");
  }

  const response = await fetch(styleApiUrl);

  if (!response.ok) {
    throw new Error(`Le style Mapbox existant n’a pas pu être chargé (${response.status}).`);
  }

  const style = await response.json();

  delete style.terrain;
  style.imports?.forEach((styleImport) => {
    if (styleImport.data?.terrain) {
      delete styleImport.data.terrain;
    }
  });

  return style;
}

function formatValue(value, digits = 4) {
  return Number(value).toFixed(digits).replace(/\.?0+$/, "");
}

function buildConfig(camera) {
  return `{
  center: [${formatValue(camera.lng, 5)}, ${formatValue(camera.lat, 5)}],
  zoom: ${formatValue(camera.zoom, 2)},
  bearing: ${formatValue(camera.bearing, 1)},
  pitch: ${formatValue(camera.pitch, 1)}
}`;
}

export default function IstanbulCameraLab() {
  const token = import.meta.env.VITE_MAPBOX_TOKEN;
  const exportMode = new URLSearchParams(window.location.search).get("export");
  const isExportMode = exportMode === "annotated" || exportMode === "clean" || exportMode === "geo3d";
  const isCleanExport = exportMode === "clean" || exportMode === "geo3d";
  const isGeo3dExport = exportMode === "geo3d";
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const ignoreMoveRef = useRef(false);
  const [camera, setCamera] = useState(INITIAL_CAMERA);
  const [isClean, setIsClean] = useState(false);
  const [copyState, setCopyState] = useState("idle");
  const [mapError, setMapError] = useState("");
  const configText = useMemo(() => buildConfig(camera), [camera]);

  useEffect(() => {
    if (!token || !istanbul || !mapContainerRef.current || mapRef.current) {
      return undefined;
    }

    let isMounted = true;

    Promise.all([loadMapbox(), loadExistingStyle(istanbul.mapStyleUrl, token)])
      .then(([mapboxgl, style]) => {
        if (!isMounted || !mapContainerRef.current) {
          return;
        }

        mapboxgl.accessToken = token;
        const map = new mapboxgl.Map({
          container: mapContainerRef.current,
          accessToken: token,
          style: isGeo3dExport ? NEUTRAL_3D_STYLE : style,
          config: isCleanExport
            ? {
                basemap: {
                  showPlaceLabels: false,
                  showPointOfInterestLabels: false,
                  showRoadLabels: false,
                  showTransitLabels: false
                }
              }
            : undefined,
          center: [INITIAL_CAMERA.lng, INITIAL_CAMERA.lat],
          zoom: INITIAL_CAMERA.zoom,
          bearing: INITIAL_CAMERA.bearing,
          pitch: INITIAL_CAMERA.pitch,
          preserveDrawingBuffer: true,
          antialias: true
        });

        map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), "bottom-right");
        mapRef.current = map;
        window.__istanbulCameraLabMap = map;

        requestAnimationFrame(() => map.resize());

        map.on("error", (event) => {
          const message = event?.error?.message;

          if (message) {
            setMapError(`Erreur Mapbox : ${message}`);
          }
        });

        map.on("load", () => {
          map.resize();
          if (isGeo3dExport) {
            return;
          }

          const style = map.getStyle();
          const labelLayer = style.layers?.find((layer) => layer.type === "symbol" && layer.layout?.["text-field"]);

          if (!map.getSource("camera-lab-streets")) {
            map.addSource("camera-lab-streets", {
              type: "vector",
              url: "mapbox://mapbox.mapbox-streets-v8"
            });
          }

          if (!map.getLayer("camera-lab-buildings")) {
            map.addLayer(
              {
                id: "camera-lab-buildings",
                source: "camera-lab-streets",
                "source-layer": "building",
                filter: ["==", ["get", "extrude"], "true"],
                type: "fill-extrusion",
                minzoom: 12,
                paint: {
                  "fill-extrusion-color": "#d8b886",
                  "fill-extrusion-height": [
                    "interpolate",
                    ["linear"],
                    ["zoom"],
                    12,
                    0,
                    14,
                    ["coalesce", ["get", "height"], 14]
                  ],
                  "fill-extrusion-base": ["coalesce", ["get", "min_height"], 0],
                  "fill-extrusion-opacity": 0.72
                }
              },
              labelLayer?.id
            );
          }
        });

        markersRef.current = isCleanExport
          ? []
          : ISTANBUL_MARKERS.map((marker) => {
              const markerElement = document.createElement("div");
              markerElement.className = "camera-lab-marker";
              markerElement.innerHTML = `<span></span><strong>${marker.label}</strong>`;

              return new mapboxgl.Marker({ element: markerElement, anchor: "bottom" })
                .setLngLat(marker.coordinates)
                .addTo(map);
            });

        map.on("move", () => {
          if (ignoreMoveRef.current) {
            return;
          }

          const center = map.getCenter();
          setCamera({
            lng: center.lng,
            lat: center.lat,
            zoom: map.getZoom(),
            bearing: map.getBearing(),
            pitch: map.getPitch()
          });
        });
      })
      .catch((error) => setMapError(error.message || "La vue Mapbox n’a pas pu être chargée."));

    return () => {
      isMounted = false;
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
      delete window.__istanbulCameraLabMap;
    };
  }, [isCleanExport, isGeo3dExport, token]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    ignoreMoveRef.current = true;
    map.easeTo({
      center: [camera.lng, camera.lat],
      zoom: camera.zoom,
      bearing: camera.bearing,
      pitch: camera.pitch,
      duration: 120
    });

    const timeout = window.setTimeout(() => {
      ignoreMoveRef.current = false;
    }, 160);

    return () => window.clearTimeout(timeout);
  }, [camera]);

  useEffect(() => {
    markersRef.current.forEach((marker) => {
      marker.getElement().classList.toggle("is-hidden", isClean || isCleanExport);
    });
  }, [isClean, isCleanExport]);

  function updateCamera(key, value) {
    setCamera((current) => ({
      ...current,
      [key]: Number(value)
    }));
  }

  function copyConfig() {
    navigator.clipboard
      .writeText(configText)
      .then(() => {
        setCopyState("copied");
        window.setTimeout(() => setCopyState("idle"), 1400);
      })
      .catch(() => setCopyState("error"));
  }

  return (
    <main className={`camera-lab${isClean ? " is-clean" : ""}${isExportMode ? ` is-export is-export-${exportMode}` : ""}`}>
      <section className="camera-lab-stage" aria-label="Istanbul Camera Lab">
        {!token ? (
          <div className="camera-lab-message">
            <strong>Token Mapbox manquant</strong>
            <p>Ajoutez VITE_MAPBOX_TOKEN à l’environnement local pour afficher la vue.</p>
          </div>
        ) : (
          <div className="camera-lab-map" ref={mapContainerRef} />
        )}

        {mapError && <p className="camera-lab-error">{mapError}</p>}

        <div className="camera-lab-readout" aria-live="polite">
          <span>center: [{formatValue(camera.lng, 5)}, {formatValue(camera.lat, 5)}]</span>
          <span>zoom: {formatValue(camera.zoom, 2)}</span>
          <span>bearing: {formatValue(camera.bearing, 1)}</span>
          <span>pitch: {formatValue(camera.pitch, 1)}</span>
        </div>

        {!isClean && !isExportMode && (
          <aside className="camera-lab-panel" aria-label="Contrôles de caméra">
            <header>
              <span><SlidersHorizontal size={15} /> Istanbul Camera Lab</span>
              <button type="button" onClick={() => setIsClean(true)}>
                <EyeOff size={16} />
                <span>Vue propre</span>
              </button>
            </header>

            <div className="camera-lab-controls">
              {CONTROL_FIELDS.map((field) => (
                <label key={field.key} className="camera-lab-control">
                  <span>{field.label}</span>
                  <input
                    type="range"
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    value={camera[field.key]}
                    onChange={(event) => updateCamera(field.key, event.target.value)}
                  />
                  <input
                    type="number"
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    value={formatValue(camera[field.key], field.step < 1 ? 5 : 1)}
                    onChange={(event) => updateCamera(field.key, event.target.value)}
                  />
                </label>
              ))}
            </div>

            <div className="camera-lab-config">
              <pre>{configText}</pre>
              <button type="button" onClick={copyConfig}>
                {copyState === "copied" ? <Check size={16} /> : <Copy size={16} />}
                <span>{copyState === "copied" ? "Copié" : "Copier l’objet JS"}</span>
              </button>
              {copyState === "error" && <p>Copie impossible depuis ce navigateur.</p>}
            </div>
          </aside>
        )}

        {isClean && !isExportMode && (
          <button className="camera-lab-restore" type="button" onClick={() => setIsClean(false)}>
            <Eye size={16} />
            <span>Réafficher</span>
          </button>
        )}
      </section>
    </main>
  );
}
