import { ArrowLeft, LockKeyhole } from "lucide-react";
import { badges } from "../data/badges.js";

export default function BadgeGallery({ onBack }) {
  const unlockedCount = badges.filter((badge) => badge.unlocked).length;

  return (
    <main className="badges-page">
      <header className="badges-header">
        <button className="badges-back" type="button" onClick={onBack}>
          <ArrowLeft size={17} />
          <span>Retour à l’atlas</span>
        </button>

        <div className="badges-heading">
          <p className="eyebrow">Collection personnelle</p>
          <h1>Mes badges</h1>
          <p>Les atmosphères rapportées de chaque voyage.</p>
        </div>

        <p className="badges-count">
          <strong>{String(unlockedCount).padStart(2, "0")}</strong>
          <span>débloqués</span>
        </p>
      </header>

      <section className="badges-grid" aria-label="Collection de badges de villes">
        {badges.map((badge, index) => (
          <article className={badge.unlocked ? "badge-card is-unlocked" : "badge-card is-locked"} key={badge.id}>
            <div className="badge-visual">
              {badge.unlocked ? (
                <img
                  src={badge.image}
                  alt={`Badge de ${badge.city}`}
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div className="badge-placeholder" aria-hidden="true">
                  <LockKeyhole size={24} strokeWidth={1.4} />
                  <span>{String(index + 1).padStart(2, "0")}</span>
                </div>
              )}
            </div>

            <div className="badge-meta">
              <span>{badge.country}</span>
              <h2>{badge.city}</h2>
              <p>{badge.unlocked ? "Débloqué" : "À débloquer"}</p>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
