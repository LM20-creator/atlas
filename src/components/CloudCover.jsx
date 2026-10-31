import { useMemo } from "react";
import { getCloudLayers, renderClearingsMask } from "../lib/clouds.js";

/**
 * Couverture nuageuse posée sur l'image de l'atlas, avec une éclaircie autour de chaque ville visitée.
 * Placée dans .scene-cover : elle suit le zoom et reste alignée sur l'image.
 */
export default function CloudCover({ clearings, radius = 0.1 }) {
  const layers = getCloudLayers();
  const key = clearings.map(({ x, y }) => `${x},${y}`).join("|");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const mask = useMemo(() => renderClearingsMask(clearings, radius), [key, radius]);
  const maskStyle = { WebkitMaskImage: `url(${mask})`, maskImage: `url(${mask})` };

  return (
    <div className="cloud-cover" style={maskStyle} aria-hidden="true">
      <div className="cloud-layer cloud-layer-base" style={{ backgroundImage: `url(${layers.base})` }} />
      <div className="cloud-layer cloud-layer-puffs" style={{ backgroundImage: `url(${layers.puffs})` }} />
    </div>
  );
}
