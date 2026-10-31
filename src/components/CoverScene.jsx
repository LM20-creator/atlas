import { useLayoutEffect, useRef } from "react";

// Marge à garder entre un point et le bord haut / bas de l'écran (barre du haut, nom du point).
const POINT_MARGIN_PX = 72;

/**
 * Image plein écran recadrée « cover ». Les enfants sont positionnés en % de l'image
 * réellement affichée : les points restent au bon endroit quel que soit le format d'écran.
 * - Image plus large que l'écran (portrait) : la scène défile horizontalement et se centre
 *   au départ sur `focusX` (% de la largeur de l'image).
 * - Image plus haute que l'écran (fenêtre très large) : le cadrage vertical glisse pour garder
 *   tous les points `pointsY` (% de la hauteur de l'image) visibles, au lieu de couper au centre.
 */
export default function CoverScene({ image, className = "", style, focusX, pointsY, children, onClick }) {
  const sceneRef = useRef(null);
  const pointsKey = pointsY?.join(",") ?? "";

  useLayoutEffect(() => {
    const scene = sceneRef.current;
    if (!scene || focusX === undefined) return;
    const coverWidth = scene.firstElementChild.offsetWidth;
    scene.scrollLeft = (coverWidth * focusX) / 100 - scene.clientWidth / 2;
  }, [focusX]);

  useLayoutEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return undefined;
    const cover = scene.firstElementChild;

    function placeVertically() {
      const ys = pointsKey ? pointsKey.split(",").map(Number) : [];
      const coverHeight = cover.offsetHeight;
      const overflow = coverHeight - scene.clientHeight;
      let shift = 0;
      if (overflow > 1 && ys.length) {
        // Haut de la partie visible : centré par défaut, puis ajusté pour inclure les points.
        let top = overflow / 2;
        const highest = (Math.min(...ys) / 100) * coverHeight;
        const lowest = (Math.max(...ys) / 100) * coverHeight;
        top = Math.max(top, lowest - scene.clientHeight + POINT_MARGIN_PX);
        top = Math.min(top, highest - POINT_MARGIN_PX);
        top = Math.min(Math.max(top, 0), overflow);
        shift = overflow / 2 - top;
      }
      cover.style.setProperty("--cover-shift", `${shift}px`);
    }

    placeVertically();
    const observer = new ResizeObserver(placeVertically);
    observer.observe(scene);
    return () => observer.disconnect();
  }, [pointsKey]);

  return (
    <div ref={sceneRef} className={`scene ${className}`} style={style} onClick={onClick}>
      <div className="scene-cover">
        <img className="scene-image" src={image} alt="" decoding="async" draggable="false" />
        {children}
      </div>
    </div>
  );
}
