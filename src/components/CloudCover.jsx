import { useEffect, useMemo, useState } from "react";
import { getCloudLayers, renderClearingsMask } from "../lib/clouds.js";

/**
 * Couverture nuageuse posée sur l'image de l'atlas, avec une éclaircie autour de chaque ville visitée.
 * Placée dans .scene-cover : elle suit le zoom et reste alignée sur l'image.
 * `shape` : l'image elle-même → pas de nuages sur les zones transparentes (ciel autour de la Terre).
 */
export default function CloudCover({ clearings, radius = 0.09, shape }) {
  const layers = getCloudLayers();
  const [shapeImage, setShapeImage] = useState(null);
  const key = clearings.map(({ x, y }) => `${x},${y}`).join("|");

  useEffect(() => {
    if (!shape) return undefined;
    let cancelled = false;
    const image = new Image();
    image.src = shape;
    image
      .decode()
      .then(() => !cancelled && setShapeImage(image))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [shape]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const mask = useMemo(() => renderClearingsMask(clearings, radius, shapeImage), [key, radius, shapeImage]);
  const maskStyle = { WebkitMaskImage: `url(${mask})`, maskImage: `url(${mask})` };

  return (
    <div className="cloud-cover" style={maskStyle} aria-hidden="true">
      <div className="cloud-layer cloud-layer-base" style={{ backgroundImage: `url(${layers.base})` }} />
      <div className="cloud-layer cloud-layer-puffs" style={{ backgroundImage: `url(${layers.puffs})` }} />
    </div>
  );
}
