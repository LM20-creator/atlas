import { X } from "lucide-react";
import { useState } from "react";

export default function CityMapPanel({ city, onClose }) {
  const [mapError, setMapError] = useState("");
  const token = import.meta.env.VITE_MAPBOX_TOKEN;
  const mapUrl = token
    ? `${city.mapStyleUrl}?title=false&access_token=${encodeURIComponent(token)}&zoomwheel=true#${city.mapZoom ?? 10.5}/${city.coordinates.lat}/${city.coordinates.lng}`
    : "";

  return (
    <section className="city-map-panel" role="dialog" aria-modal="true" aria-label={`Plan de ${city.name}`}>
      <header className="city-map-header">
        <div>
          <span>Plan</span>
          <h2>{city.name}</h2>
        </div>
        <button className="city-map-close" type="button" onClick={onClose} aria-label="Fermer le plan">
          <X size={19} />
        </button>
      </header>

      {!token ? (
        <div className="city-map-message">
          <strong>Plan Mapbox indisponible</strong>
          <p>
            La variable VITE_MAPBOX_TOKEN est absente. Ajoutez-la à l’environnement du site,
            puis relancez le déploiement.
          </p>
        </div>
      ) : (
        <iframe
          className="city-map-canvas"
          src={mapUrl}
          title={`Carte Mapbox de ${city.name}`}
          onError={() => setMapError("La carte Mapbox n’a pas pu être chargée.")}
        />
      )}

      {mapError && <p className="city-map-error">{mapError}</p>}
    </section>
  );
}
