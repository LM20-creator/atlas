import { useLayoutEffect, useRef } from "react";

/**
 * Image plein écran recadrée « cover ». Les enfants sont positionnés en % de l'image
 * réellement affichée : les points restent au bon endroit quel que soit le format d'écran.
 * Si l'image déborde en largeur (écran portrait), la scène défile horizontalement
 * et se centre au départ sur `focusX` (% de la largeur de l'image).
 */
export default function CoverScene({ image, className = "", style, focusX, children, onClick }) {
  const sceneRef = useRef(null);

  useLayoutEffect(() => {
    const scene = sceneRef.current;
    if (!scene || focusX === undefined) return;
    const coverWidth = scene.firstElementChild.offsetWidth;
    scene.scrollLeft = (coverWidth * focusX) / 100 - scene.clientWidth / 2;
  }, [focusX]);

  return (
    <div ref={sceneRef} className={`scene ${className}`} style={style} onClick={onClick}>
      <div className="scene-cover">
        <img className="scene-image" src={image} alt="" decoding="async" draggable="false" />
        {children}
      </div>
    </div>
  );
}
