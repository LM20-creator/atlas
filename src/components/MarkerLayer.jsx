export default function MarkerLayer({ points, activePointId, onSelectPoint }) {
  return (
    <div className="marker-layer">
      {points.map((point) => (
        <button
          className={`map-marker ${activePointId === point.id ? "is-active" : ""}`}
          type="button"
          key={point.id}
          style={{ left: `${point.x}%`, top: `${point.y}%` }}
          onClick={() => onSelectPoint(point.id)}
          aria-label={point.title}
        >
          <span className="marker-dot" />
          <span className="marker-label">{point.title}</span>
        </button>
      ))}
    </div>
  );
}
