import { ExternalLink, X } from "lucide-react";

export default function InfoPanel({ point, onClose }) {
  return (
    <aside className="info-panel">
      <button className="panel-close" type="button" onClick={onClose} aria-label="Fermer le panneau">
        <X size={17} />
      </button>

      <p className="panel-kicker">{point.type}</p>
      <h2>{point.title}</h2>
      {point.image && (
        <img className="panel-image" src={point.image} alt="" aria-hidden="true" decoding="async" />
      )}
      <p>{point.text}</p>
      {point.url && (
        <a className="panel-link" href={point.url} target="_blank" rel="noreferrer">
          <span>Découvrir le lieu</span>
          <ExternalLink size={14} />
        </a>
      )}
    </aside>
  );
}
