import { ArrowLeft, LockKeyhole } from "lucide-react";
import { cities, isVisited } from "../data/cities.js";

export default function BadgeGallery({ onBack }) {
  const unlockedCount = cities.filter(isVisited).length;

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
        {cities.map((city, index) => {
          const unlocked = isVisited(city) && city.badgeImage;

          return (
            <article className={unlocked ? "badge-card is-unlocked" : "badge-card is-locked"} key={city.id}>
              <div className="badge-visual">
                {unlocked ? (
                  <img src={city.badgeImage} alt={`Badge de ${city.name}`} loading="lazy" decoding="async" />
                ) : (
                  <div className="badge-placeholder" aria-hidden="true">
                    <LockKeyhole size={24} strokeWidth={1.4} />
                    <span>{String(index + 1).padStart(2, "0")}</span>
                  </div>
                )}
              </div>

              <div className="badge-meta">
                <span>{city.country}</span>
                <h2>{city.name}</h2>
                <p>{unlocked ? "Débloqué" : "À débloquer"}</p>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
