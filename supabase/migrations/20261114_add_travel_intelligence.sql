-- ============================================================================
-- TRIPONA REAL-TIME GLOBAL TRAVEL INTELLIGENCE DATABASE SCHEMA
-- Verified Source Tracking, Price Validity & Multi-Provider Caching
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.travel_intelligence_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT UNIQUE NOT NULL,
  destination_query TEXT NOT NULL,
  city TEXT,
  country TEXT,
  coordinates JSONB DEFAULT '{}'::jsonb,
  places_data JSONB DEFAULT '[]'::jsonb,
  weather_data JSONB DEFAULT '{}'::jsonb,
  exchange_rates JSONB DEFAULT '{}'::jsonb,
  budget_breakdown JSONB DEFAULT '{}'::jsonb,
  sources JSONB DEFAULT '[]'::jsonb,
  verification_status TEXT DEFAULT 'VERIFIED_LIVE' CHECK (verification_status IN (
    'VERIFIED_OFFICIAL', 'VERIFIED_LIVE', 'ESTIMATED_STATISTICAL', 'UNAVAILABLE'
  )),
  last_checked TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for lightning-fast cache hits and geographic lookups
CREATE INDEX IF NOT EXISTS idx_intelligence_cache_key ON public.travel_intelligence_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_intelligence_dest_query ON public.travel_intelligence_cache(destination_query);
CREATE INDEX IF NOT EXISTS idx_intelligence_expires ON public.travel_intelligence_cache(expires_at);

-- Enable Row Level Security (RLS)
ALTER TABLE public.travel_intelligence_cache ENABLE ROW LEVEL SECURITY;

-- Public read-only policy for live verified travel intelligence
CREATE POLICY "Public read verified travel intelligence" ON public.travel_intelligence_cache
  FOR SELECT USING (true);

-- Authenticated/Admin write policy
CREATE POLICY "Server and authenticated users can insert intelligence cache" ON public.travel_intelligence_cache
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);
