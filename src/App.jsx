import { lazy, Suspense, useState } from "react";
import { getCity } from "./data/cities.js";
import AtlasHome from "./components/AtlasHome.jsx";
import BadgeGallery from "./components/BadgeGallery.jsx";
import CityCapsule from "./components/CityCapsule.jsx";

// Outil de cadrage caméra, disponible uniquement en local (npm run dev) sur /istanbul-camera-lab.
const IstanbulCameraLab = import.meta.env.DEV
  ? lazy(() => import("./components/IstanbulCameraLab.jsx"))
  : null;

export default function App() {
  const [selectedCityId, setSelectedCityId] = useState(null);
  const [activePage, setActivePage] = useState("atlas");
  const selectedCity = getCity(selectedCityId);

  if (IstanbulCameraLab && window.location.pathname === "/istanbul-camera-lab") {
    return (
      <Suspense fallback={null}>
        <IstanbulCameraLab />
      </Suspense>
    );
  }

  return (
    <div className="app-shell">
      {selectedCity ? (
        <CityCapsule city={selectedCity} onBack={() => setSelectedCityId(null)} />
      ) : activePage === "badges" ? (
        <BadgeGallery onBack={() => setActivePage("atlas")} />
      ) : (
        <AtlasHome onSelectCity={setSelectedCityId} onOpenBadges={() => setActivePage("badges")} />
      )}
    </div>
  );
}
