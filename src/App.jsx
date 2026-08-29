import { useState } from "react";
import { cities } from "./data/cities.js";
import BadgeGallery from "./components/BadgeGallery.jsx";
import CityCapsule from "./components/CityCapsule.jsx";
import GlobeView from "./components/GlobeView.jsx";

export default function App() {
  const [selectedCityId, setSelectedCityId] = useState(null);
  const [activePage, setActivePage] = useState("atlas");
  const selectedCity = cities.find((city) => city.id === selectedCityId);

  return (
    <main className="app-shell">
      {selectedCity ? (
        <CityCapsule city={selectedCity} onBack={() => setSelectedCityId(null)} />
      ) : activePage === "badges" ? (
        <BadgeGallery onBack={() => setActivePage("atlas")} />
      ) : (
        <GlobeView
          cities={cities}
          onSelectCity={setSelectedCityId}
          onOpenBadges={() => setActivePage("badges")}
        />
      )}
    </main>
  );
}
