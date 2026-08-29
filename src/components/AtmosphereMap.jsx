import MarkerLayer from "./MarkerLayer.jsx";

export default function AtmosphereMap({ city, activePointId, onSelectPoint }) {
  return (
    <div className="atmosphere-wrap">
      <img
        className="atmosphere-image"
        src={city.capsuleImage}
        alt=""
        decoding="async"
        fetchPriority="high"
      />
      <div className="atmosphere-vignette" />
      <MarkerLayer
        points={city.points}
        activePointId={activePointId}
        onSelectPoint={onSelectPoint}
      />
    </div>
  );
}
