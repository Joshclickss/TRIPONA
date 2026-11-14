-- ============================================================================
-- TRIPONA WORLD CITIES DATABASE TABLE (50,000+ GLOBAL DESTINATIONS)
-- Powered by SimpleMaps WorldCities Dataset
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.world_cities (
  id TEXT PRIMARY KEY,
  city TEXT NOT NULL,
  city_ascii TEXT NOT NULL,
  lat NUMERIC(9,6) NOT NULL,
  lng NUMERIC(9,6) NOT NULL,
  country TEXT NOT NULL,
  iso2 TEXT,
  iso3 TEXT,
  admin_name TEXT,
  capital TEXT,
  population BIGINT DEFAULT 0
);

-- Fast search indexes for autocompletion, fuzzy matching, and population-ranked suggestions
CREATE INDEX IF NOT EXISTS idx_world_cities_ascii ON public.world_cities(city_ascii);
CREATE INDEX IF NOT EXISTS idx_world_cities_country ON public.world_cities(country);
CREATE INDEX IF NOT EXISTS idx_world_cities_pop ON public.world_cities(population DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.world_cities ENABLE ROW LEVEL SECURITY;

-- Worldwide public read access policy
CREATE POLICY "Anyone can search world cities" ON public.world_cities
  FOR SELECT USING (true);
