import { MapPin, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getMapboxToken, loadMapbox, toMapboxStyleUrl } from "../lib/mapbox.js";

const CATEGORIES = [
  { id: "restaurant", label: "Restaurant", icon: "✦", color: "#c85b4b" },
  { id: "bar", label: "Bar", icon: "●", color: "#7956b8" },
  { id: "museum", label: "Musée", icon: "◆", color: "#3974a7" },
  { id: "hotel", label: "Hôtel", icon: "■", color: "#b77a39" },
  { id: "shopping", label: "Boutique", icon: "▲", color: "#3c8b68" },
  { id: "other", label: "Autre", icon: "•", color: "#6f7479" }
];

const EMPTY_DRAFT = { name: "", address: "", category: "restaurant", lng: null, lat: null };

function findCategory(id) {
  return CATEGORIES.find((item) => item.id === id) ?? CATEGORIES.at(-1);
}

function markerElement(place) {
  const category = findCategory(place.category);
  const element = document.createElement("button");
  element.type = "button";
  element.className = "place-marker";
  element.style.setProperty("--place-color", category.color);
  element.setAttribute("aria-label", `${place.name} — ${category.label}`);
  // TODO sécurité (chantier suivant) : place.name vient des visiteurs, ne pas l'injecter en HTML.
  element.innerHTML = `<span>${category.icon}</span><b>${place.name}</b>`;
  return element;
}

/** Plan partagé de la ville. `focus` (optionnel) : quartier sur lequel centrer la carte. */
export default function CityMapPanel({ city, focus, onClose }) {
  const mapNode = useRef(null);
  const mapRef = useRef(null);
  const modeRef = useRef("browse");
  const draftMarkerRef = useRef(null);
  const savedMarkersRef = useRef([]);
  const [token, setToken] = useState("");
  const [mode, setMode] = useState("browse");
  const [mapError, setMapError] = useState("");
  const [places, setPlaces] = useState([]);
  const [mapReady, setMapReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [draft, setDraft] = useState(EMPTY_DRAFT);

  // 1. Jeton Mapbox
  useEffect(() => {
    let mounted = true;
    getMapboxToken()
      .then((value) => mounted && setToken(value))
      .catch(() => mounted && setMapError("La configuration Mapbox est indisponible."));
    return () => {
      mounted = false;
    };
  }, []);

  // 2. Création de la carte
  useEffect(() => {
    if (!token || !mapNode.current || mapRef.current) return undefined;
    let mounted = true;

    loadMapbox()
      .then((mapboxgl) => {
        if (!mounted || !mapNode.current) return;
        mapboxgl.accessToken = token;
        const map = new mapboxgl.Map({
          container: mapNode.current,
          style: toMapboxStyleUrl(city.mapStyleUrl),
          center: focus?.lngLat ?? [city.coordinates.lng, city.coordinates.lat],
          zoom: focus?.mapZoom ?? city.mapZoom ?? 11
        });
        map.addControl(new mapboxgl.NavigationControl(), "bottom-right");
        map.on("error", (event) => event?.error?.message && setMapError(`Erreur Mapbox : ${event.error.message}`));
        map.on("click", (event) => {
          if (modeRef.current === "adding") {
            setDraft((current) => ({ ...current, lng: event.lngLat.lng, lat: event.lngLat.lat }));
          }
        });
        map.on("load", () => setMapReady(true));
        mapRef.current = map;
      })
      .catch(() => setMapError("La carte Mapbox n’a pas pu être chargée."));

    return () => {
      mounted = false;
      savedMarkersRef.current.forEach((marker) => marker.remove());
      draftMarkerRef.current?.remove();
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [city, token]);

  // 3. Adresses enregistrées
  useEffect(() => {
    fetch(`/api/places?city=${encodeURIComponent(city.id)}`)
      .then((response) => {
        if (!response.ok) throw new Error();
        return response.json();
      })
      .then((result) => setPlaces(result.places ?? []))
      .catch(() => {
        if (!import.meta.env.DEV) setNotice("Les adresses enregistrées seront disponibles après la mise en ligne.");
      });
  }, [city.id]);

  // 4. Marqueurs des adresses enregistrées
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !window.mapboxgl) return;
    savedMarkersRef.current.forEach((marker) => marker.remove());
    savedMarkersRef.current = places.map((place) =>
      new window.mapboxgl.Marker({ element: markerElement(place), anchor: "bottom" })
        .setLngLat([place.lng, place.lat])
        .addTo(map)
    );
  }, [places, mapReady]);

  // 5. Marqueur du lieu en cours d'ajout
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !window.mapboxgl || draft.lng === null || draft.lat === null) return;

    if (!draftMarkerRef.current) {
      const element = document.createElement("div");
      element.className = "place-marker place-marker-draft";
      element.innerHTML = "<span>+</span>";
      draftMarkerRef.current = new window.mapboxgl.Marker({ element, draggable: true, anchor: "bottom" }).addTo(map);
      draftMarkerRef.current.on("dragend", () => {
        const position = draftMarkerRef.current.getLngLat();
        setDraft((current) => ({ ...current, lng: position.lng, lat: position.lat }));
      });
    }

    draftMarkerRef.current.getElement().style.setProperty("--place-color", findCategory(draft.category).color);
    draftMarkerRef.current.setLngLat([draft.lng, draft.lat]);
  }, [draft.lng, draft.lat, draft.category]);

  function updateDraft(field) {
    return (event) => setDraft((current) => ({ ...current, [field]: event.target.value }));
  }

  function startAdding() {
    modeRef.current = "adding";
    setMode("adding");
    setNotice("");
    setDraft(EMPTY_DRAFT);
  }

  function cancelAdding() {
    draftMarkerRef.current?.remove();
    draftMarkerRef.current = null;
    modeRef.current = "browse";
    setMode("browse");
  }

  async function geocode(address) {
    // TODO (chantier ajout d'adresses) : la ville est encore fixée à Istanbul.
    const query = new URLSearchParams({
      q: `${address}, Istanbul, Türkiye`,
      proximity: `${city.coordinates.lng},${city.coordinates.lat}`,
      limit: "1",
      language: "fr",
      access_token: token
    });
    const response = await fetch(`https://api.mapbox.com/search/geocode/v6/forward?${query}`);
    const result = await response.json();
    const coordinates = result.features?.[0]?.geometry?.coordinates;
    if (!response.ok || !Array.isArray(coordinates)) throw new Error("address-not-found");
    return { lng: coordinates[0], lat: coordinates[1] };
  }

  async function submit(event) {
    event.preventDefault();
    if (!draft.name.trim()) {
      setNotice("Ajoutez le nom du lieu.");
      return;
    }

    setIsSaving(true);
    setNotice("");

    try {
      let placeDraft = { ...draft, name: draft.name.trim(), address: draft.address.trim() };

      if (placeDraft.lng === null) {
        if (!placeDraft.address) throw new Error("missing-location");
        placeDraft = { ...placeDraft, ...(await geocode(placeDraft.address)) };
        setDraft(placeDraft);
      }

      const response = await fetch("/api/places", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...placeDraft, city: city.id })
      });
      if (!response.ok) throw new Error();
      const { place } = await response.json();
      setPlaces((current) => [...current, place]);
      cancelAdding();
      setNotice("Adresse ajoutée à la carte.");
    } catch (error) {
      // TODO (chantier ajout d'adresses) : en local, toute erreur ajoute un lieu temporaire.
      if (import.meta.env.DEV) {
        setPlaces((current) => [
          ...current,
          { id: `preview-${Date.now()}`, ...draft, name: draft.name.trim(), address: draft.address.trim() }
        ]);
        cancelAdding();
        setNotice("Adresse ajoutée pour cet aperçu. Elle ne sera pas conservée après actualisation.");
      } else if (error.message === "missing-location") {
        setNotice("Saisissez une adresse ou placez le marqueur directement sur la carte.");
      } else if (error.message === "address-not-found") {
        setNotice("Adresse introuvable. Essayez une adresse plus complète ou placez le marqueur sur la carte.");
      } else {
        setNotice("Impossible d’ajouter l’adresse pour le moment. Réessayez dans un instant.");
      }
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="city-map-panel" role="dialog" aria-modal="true" aria-label={`Plan de ${city.name}`}>
      <div className="city-map-canvas" ref={mapNode} />

      <header className="city-map-header">
        <div>
          <span>Plan partagé</span>
          <h2>{focus ? `${city.name} · ${focus.name}` : city.name}</h2>
        </div>
        <div className="city-map-toolbar">
          {mode === "browse" && (
            <button className="map-add-button" type="button" onClick={startAdding}>
              <MapPin size={17} /> Ajouter une adresse
            </button>
          )}
          <button className="city-map-close" type="button" onClick={onClose} aria-label="Fermer le plan">
            <X size={19} />
          </button>
        </div>
      </header>

      {mode === "adding" && (
        <form className="place-form" onSubmit={submit}>
          <div className="place-form-heading">
            <div>
              <span>Nouvelle adresse</span>
              <h3>Placez le repère</h3>
            </div>
            <button type="button" onClick={cancelAdding}>
              Annuler
            </button>
          </div>
          <p>
            Saisissez une adresse pour placer le repère automatiquement, ou cliquez sur la carte pour le déposer
            vous-même.
          </p>
          <label>
            Nom du lieu
            <input
              value={draft.name}
              onChange={updateDraft("name")}
              placeholder="Ex. Café du Bosphore"
              maxLength="90"
              required
            />
          </label>
          <label>
            Adresse <span>facultatif</span>
            <div className="place-input-icon">
              <Search size={16} />
              <input
                value={draft.address}
                onChange={updateDraft("address")}
                placeholder="Rue, quartier…"
                maxLength="160"
              />
            </div>
          </label>
          <label>
            Catégorie
            <select value={draft.category} onChange={updateDraft("category")}>
              {CATEGORIES.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
          </label>
          <button className="place-submit" type="submit" disabled={isSaving}>
            {isSaving ? "Ajout…" : "Ajouter à la carte"}
          </button>
        </form>
      )}

      {!token && !mapError && (
        <div className="city-map-message">
          <strong>Chargement du plan…</strong>
        </div>
      )}
      {notice && (
        <p className="city-map-notice" role="status">
          {notice}
        </p>
      )}
      {mapError && <p className="city-map-error">{mapError}</p>}
    </section>
  );
}
