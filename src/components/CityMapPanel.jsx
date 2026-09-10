import { MapPin, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const MAPBOX_GL_VERSION = "3.28.1";
const CATEGORIES = [
  { id: "restaurant", label: "Restaurant", icon: "✦", color: "#c85b4b" },
  { id: "bar", label: "Bar", icon: "●", color: "#7956b8" },
  { id: "museum", label: "Musée", icon: "◆", color: "#3974a7" },
  { id: "hotel", label: "Hôtel", icon: "■", color: "#b77a39" },
  { id: "shopping", label: "Boutique", icon: "▲", color: "#3c8b68" },
  { id: "other", label: "Autre", icon: "•", color: "#6f7479" }
];

function loadMapbox() {
  if (window.mapboxgl) return Promise.resolve(window.mapboxgl);
  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector("script[data-mapbox-gl]");
    if (!document.querySelector("link[data-mapbox-gl]")) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = `https://api.mapbox.com/mapbox-gl-js/v${MAPBOX_GL_VERSION}/mapbox-gl.css`;
      link.dataset.mapboxGl = "true";
      document.head.appendChild(link);
    }
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(window.mapboxgl), { once: true });
      existingScript.addEventListener("error", reject, { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = `https://api.mapbox.com/mapbox-gl-js/v${MAPBOX_GL_VERSION}/mapbox-gl.js`;
    script.async = true;
    script.dataset.mapboxGl = "true";
    script.addEventListener("load", () => resolve(window.mapboxgl), { once: true });
    script.addEventListener("error", reject, { once: true });
    document.head.appendChild(script);
  });
}

function mapboxStyleUrl(styleUrl) {
  const match = styleUrl.match(/styles\/v1\/([^/]+)\/([^/.]+)/);
  return match ? `mapbox://styles/${match[1]}/${match[2]}` : styleUrl;
}

function markerElement(place) {
  const category = CATEGORIES.find((item) => item.id === place.category) ?? CATEGORIES.at(-1);
  const element = document.createElement("button");
  element.type = "button";
  element.className = "place-marker";
  element.style.setProperty("--place-color", category.color);
  element.setAttribute("aria-label", `${place.name} — ${category.label}`);
  element.innerHTML = `<span>${category.icon}</span><b>${place.name}</b>`;
  return element;
}

export default function CityMapPanel({ city, onClose }) {
  const [token, setToken] = useState(import.meta.env.VITE_MAPBOX_TOKEN || "");
  const mapNode = useRef(null);
  const mapRef = useRef(null);
  const modeRef = useRef("browse");
  const draftMarkerRef = useRef(null);
  const savedMarkersRef = useRef([]);
  const [mode, setMode] = useState("browse");
  const [mapError, setMapError] = useState("");
  const [places, setPlaces] = useState([]);
  const [mapReady, setMapReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [draft, setDraft] = useState({ name: "", address: "", category: "restaurant", lng: null, lat: null });

  useEffect(() => {
    if (token) return undefined;
    let mounted = true;
    fetch("/api/map-config")
      .then(async (response) => {
        if (!response.ok) throw new Error();
        return response.json();
      })
      .then((config) => {
        if (!mounted || !config.mapboxToken) throw new Error();
        setToken(config.mapboxToken);
      })
      .catch(() => mounted && setMapError("La configuration Mapbox est indisponible."));
    return () => { mounted = false; };
  }, [token]);

  useEffect(() => {
    if (!token || !mapNode.current || mapRef.current) return undefined;
    let mounted = true;
    loadMapbox().then((mapboxgl) => {
      if (!mounted || !mapNode.current) return;
      mapboxgl.accessToken = token;
      const map = new mapboxgl.Map({ container: mapNode.current, style: mapboxStyleUrl(city.mapStyleUrl), center: [city.coordinates.lng, city.coordinates.lat], zoom: city.mapZoom ?? 11 });
      map.addControl(new mapboxgl.NavigationControl(), "bottom-right");
      map.on("error", (event) => event?.error?.message && setMapError(`Erreur Mapbox : ${event.error.message}`));
      map.on("click", (event) => { if (modeRef.current === "adding") setDraft((current) => ({ ...current, lng: event.lngLat.lng, lat: event.lngLat.lat })); });
      mapRef.current = map;
      map.on("load", () => setMapReady(true));
    }).catch(() => setMapError("La carte Mapbox n’a pas pu être chargée."));
    return () => { mounted = false; savedMarkersRef.current.forEach((marker) => marker.remove()); draftMarkerRef.current?.remove(); mapRef.current?.remove(); mapRef.current = null; };
  }, [city, token]);

  useEffect(() => { fetch(`/api/places?city=${encodeURIComponent(city.id)}`).then(async (response) => { if (!response.ok) throw new Error(); return response.json(); }).then((result) => setPlaces(result.places ?? [])).catch(() => { if (!import.meta.env.DEV) setNotice("Les adresses enregistrées seront disponibles après la mise en ligne."); }); }, [city.id]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !window.mapboxgl) return;
    savedMarkersRef.current.forEach((marker) => marker.remove());
    savedMarkersRef.current = places.map((place) => new window.mapboxgl.Marker({ element: markerElement(place), anchor: "bottom" }).setLngLat([place.lng, place.lat]).addTo(map));
  }, [places, mapReady]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !window.mapboxgl || draft.lng === null || draft.lat === null) return;
    const category = CATEGORIES.find((item) => item.id === draft.category) ?? CATEGORIES[0];
    if (!draftMarkerRef.current) {
      const element = document.createElement("div"); element.className = "place-marker place-marker-draft"; element.innerHTML = "<span>+</span>";
      draftMarkerRef.current = new window.mapboxgl.Marker({ element, draggable: true, anchor: "bottom" }).addTo(map);
      draftMarkerRef.current.on("dragend", () => { const position = draftMarkerRef.current.getLngLat(); setDraft((current) => ({ ...current, lng: position.lng, lat: position.lat })); });
    }
    draftMarkerRef.current.getElement().style.setProperty("--place-color", category.color);
    draftMarkerRef.current.setLngLat([draft.lng, draft.lat]);
  }, [draft.lng, draft.lat, draft.category]);

  function startAdding() { modeRef.current = "adding"; setMode("adding"); setNotice(""); setDraft({ name: "", address: "", category: "restaurant", lng: null, lat: null }); }
  function cancelAdding() { draftMarkerRef.current?.remove(); draftMarkerRef.current = null; modeRef.current = "browse"; setMode("browse"); }
  async function submit(event) {
    event.preventDefault();
    if (!draft.name.trim() || draft.lng === null) { setNotice("Ajoutez un nom, puis placez le marqueur sur la carte."); return; }
    setIsSaving(true); setNotice("");
    try {
      const response = await fetch("/api/places", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...draft, name: draft.name.trim(), address: draft.address.trim(), city: city.id }) });
      if (!response.ok) throw new Error();
      const { place } = await response.json(); setPlaces((current) => [...current, place]); cancelAdding(); setNotice("Adresse ajoutée à la carte.");
    } catch {
      if (import.meta.env.DEV) {
        setPlaces((current) => [...current, { id: `preview-${Date.now()}`, ...draft, name: draft.name.trim(), address: draft.address.trim() }]);
        cancelAdding();
        setNotice("Adresse ajoutée pour cet aperçu. Elle ne sera pas conservée après actualisation.");
      } else {
        setNotice("Impossible d’ajouter l’adresse pour le moment. Réessayez dans un instant.");
      }
    } finally { setIsSaving(false); }
  }

  return <section className="city-map-panel" role="dialog" aria-modal="true" aria-label={`Plan de ${city.name}`}>
    <div className="city-map-canvas" ref={mapNode} />
    <header className="city-map-header"><div><span>Plan partagé</span><h2>{city.name}</h2></div><div className="city-map-toolbar">{mode === "browse" && <button className="map-add-button" type="button" onClick={startAdding}><MapPin size={17} /> Ajouter une adresse</button>}<button className="city-map-close" type="button" onClick={onClose} aria-label="Fermer le plan"><X size={19} /></button></div></header>
    {mode === "adding" && <form className="place-form" onSubmit={submit}><div className="place-form-heading"><div><span>Nouvelle adresse</span><h3>Placez le repère</h3></div><button type="button" onClick={cancelAdding}>Annuler</button></div><p>Cliquez sur la carte pour déposer le marqueur, puis faites-le glisser si nécessaire.</p><label>Nom du lieu<input value={draft.name} onChange={(event) => setDraft((item) => ({ ...item, name: event.target.value }))} placeholder="Ex. Café du Bosphore" maxLength="90" required /></label><label>Adresse <span>facultatif</span><div className="place-input-icon"><Search size={16} /><input value={draft.address} onChange={(event) => setDraft((item) => ({ ...item, address: event.target.value }))} placeholder="Rue, quartier…" maxLength="160" /></div></label><label>Catégorie<select value={draft.category} onChange={(event) => setDraft((item) => ({ ...item, category: event.target.value }))}>{CATEGORIES.map((category) => <option key={category.id} value={category.id}>{category.label}</option>)}</select></label><button className="place-submit" type="submit" disabled={isSaving}>{isSaving ? "Ajout…" : "Ajouter à la carte"}</button></form>}
    {!token && !mapError && <div className="city-map-message"><strong>Chargement du plan…</strong></div>}
    {notice && <p className="city-map-notice" role="status">{notice}</p>}{mapError && <p className="city-map-error">{mapError}</p>}
  </section>;
}
