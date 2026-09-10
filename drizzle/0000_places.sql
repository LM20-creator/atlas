CREATE TABLE places (
  id TEXT PRIMARY KEY NOT NULL,
  city TEXT NOT NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL,
  lng REAL NOT NULL,
  lat REAL NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_places_city_created_at ON places (city, created_at);
