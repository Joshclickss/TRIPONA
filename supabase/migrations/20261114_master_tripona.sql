-- ============================================================================
-- TRIPONA MASTER CLOUD DATABASE SCHEMA (COMPLETE PRODUCTION SUITE)
-- Free Cloud Infrastructure: Supabase PostgreSQL + Auth + Storage + RLS
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 3. PROFILES TABLE (Extends auth.users)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT DEFAULT '',
  photo_url TEXT DEFAULT '',
  country TEXT DEFAULT 'Global Voyager',
  currency TEXT DEFAULT 'USD ($)',
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  travel_preferences JSONB DEFAULT '[]'::jsonb,
  saved_destinations JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- ============================================================================
-- 4. DESTINATIONS TABLE (Worldwide curated destinations)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  continent TEXT NOT NULL,
  tagline TEXT,
  image TEXT NOT NULL,
  secondary_image TEXT,
  estimated_budget JSONB DEFAULT '{}'::jsonb,
  currency TEXT DEFAULT 'USD',
  best_season TEXT,
  weather TEXT,
  rating NUMERIC(3,2) DEFAULT 4.80,
  reviews_count INTEGER DEFAULT 0,
  travel_style JSONB DEFAULT '[]'::jsonb,
  is_top_international BOOLEAN DEFAULT false,
  is_popular BOOLEAN DEFAULT false,
  is_trending BOOLEAN DEFAULT false,
  is_hidden_gem BOOLEAN DEFAULT false,
  overview TEXT NOT NULL,
  attractions JSONB DEFAULT '[]'::jsonb,
  local_culture TEXT,
  food_recommendations JSONB DEFAULT '[]'::jsonb,
  travel_tips JSONB DEFAULT '[]'::jsonb,
  coordinates JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_destinations_slug ON public.destinations(slug);
CREATE INDEX IF NOT EXISTS idx_destinations_continent ON public.destinations(continent);
CREATE INDEX IF NOT EXISTS idx_destinations_country ON public.destinations(country);
CREATE INDEX IF NOT EXISTS idx_destinations_popular ON public.destinations(is_popular);

-- ============================================================================
-- 5. WORLD CITIES TABLE (50,000+ SimpleMaps dataset)
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

CREATE INDEX IF NOT EXISTS idx_world_cities_ascii ON public.world_cities(city_ascii);
CREATE INDEX IF NOT EXISTS idx_world_cities_country ON public.world_cities(country);
CREATE INDEX IF NOT EXISTS idx_world_cities_pop ON public.world_cities(population DESC);

-- ============================================================================
-- 6. SAVED DESTINATIONS (User Wishlists)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.saved_destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  destination_id TEXT NOT NULL,
  destination_slug TEXT,
  destination_name TEXT,
  saved_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT uq_master_user_dest UNIQUE (user_id, destination_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_dest_user ON public.saved_destinations(user_id);

-- ============================================================================
-- 7. TRIPS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  destination TEXT NOT NULL,
  destination_id TEXT,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'completed', 'draft')),
  travel_style TEXT DEFAULT 'smart-ai',
  travellers INTEGER DEFAULT 2,
  total_budget NUMERIC DEFAULT 3500,
  spent_budget NUMERIC DEFAULT 0,
  cover_image TEXT,
  days_count INTEGER DEFAULT 7,
  is_public BOOLEAN DEFAULT true,
  share_token TEXT UNIQUE,
  days JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_trips_user ON public.trips(user_id);
CREATE INDEX IF NOT EXISTS idx_trips_share_token ON public.trips(share_token);

-- ============================================================================
-- 8. BOOKINGS TABLE (9 Travel Service Categories)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trip_id UUID REFERENCES public.trips(id) ON DELETE SET NULL,
  category TEXT NOT NULL CHECK (category IN (
    'hotels', 'flights', 'dining', 'experiences', 'transportation',
    'cruises', 'adventures', 'wellness', 'essentials'
  )),
  category_label TEXT DEFAULT 'TRAVEL SERVICE',
  service_id TEXT NOT NULL,
  service_name TEXT NOT NULL,
  service_provider TEXT,
  image_url TEXT,
  destination TEXT NOT NULL,
  dates JSONB DEFAULT '{}'::jsonb,
  travellers JSONB DEFAULT '[]'::jsonb,
  primary_contact JSONB DEFAULT '{}'::jsonb,
  pricing JSONB DEFAULT '{}'::jsonb,
  booking_status TEXT DEFAULT 'confirmed' CHECK (booking_status IN (
    'pending', 'confirmed', 'cancelled', 'completed', 'failed', 'refunded'
  )),
  payment_status TEXT DEFAULT 'completed' CHECK (payment_status IN (
    'pending', 'authorized', 'completed', 'failed', 'refunded', 'refund_pending'
  )),
  payment_method TEXT DEFAULT 'card',
  ticket_number TEXT,
  voucher_code TEXT,
  cancellation_reason TEXT,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_bookings_user ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_id ON public.bookings(booking_id);
CREATE INDEX IF NOT EXISTS idx_bookings_category ON public.bookings(category);

-- ============================================================================
-- 9. EXPENSES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trip_id TEXT NOT NULL,
  category TEXT DEFAULT 'Food' CHECK (category IN (
    'Accommodation', 'Flights', 'Local Transport', 'Food', 'Activities', 'Shopping', 'Other'
  )),
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  date TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_expenses_user ON public.expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_trip ON public.expenses(trip_id);

-- ============================================================================
-- 10. CHECKLISTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trip_id TEXT,
  type TEXT DEFAULT 'travel' CHECK (type IN ('travel', 'packing')),
  text TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  category TEXT DEFAULT 'General',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_checklists_user ON public.checklists(user_id);

-- ============================================================================
-- 11. CONVERSATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trip_id TEXT,
  title TEXT DEFAULT 'Travel Planning Session',
  messages JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- 12. TRAVEL INTELLIGENCE CACHE TABLE
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
  verification_status TEXT DEFAULT 'VERIFIED_LIVE',
  last_checked TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_master_cache_key ON public.travel_intelligence_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_master_cache_expires ON public.travel_intelligence_cache(expires_at);

-- ============================================================================
-- 13. API CACHE TABLE (General purpose edge cache)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.api_cache (
  key TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_api_cache_expires ON public.api_cache(expires_at);

-- ============================================================================
-- 14. TRIGGERS
-- ============================================================================
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE PROCEDURE public.trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_destinations_updated_at ON public.destinations;
CREATE TRIGGER set_destinations_updated_at
BEFORE UPDATE ON public.destinations
FOR EACH ROW EXECUTE PROCEDURE public.trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_trips_updated_at ON public.trips;
CREATE TRIGGER set_trips_updated_at
BEFORE UPDATE ON public.trips
FOR EACH ROW EXECUTE PROCEDURE public.trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_bookings_updated_at ON public.bookings;
CREATE TRIGGER set_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW EXECUTE PROCEDURE public.trigger_set_timestamp();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, photo_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'photo_url', NEW.raw_user_meta_data->>'avatar_url', 'https://ui-avatars.com/api/?name=' || split_part(NEW.email, '@', 1) || '&background=527F91&color=fff'),
    'user'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================================
-- 15. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.world_cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_intelligence_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_cache ENABLE ROW LEVEL SECURITY;

-- Profiles: Own profile or admin
DROP POLICY IF EXISTS "Profiles read" ON public.profiles;
CREATE POLICY "Profiles read" ON public.profiles FOR SELECT USING (auth.uid() = id OR public.is_admin());
DROP POLICY IF EXISTS "Profiles update" ON public.profiles;
CREATE POLICY "Profiles update" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "Profiles insert" ON public.profiles;
CREATE POLICY "Profiles insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Destinations & World Cities: Public read, admin write
DROP POLICY IF EXISTS "Public read destinations" ON public.destinations;
CREATE POLICY "Public read destinations" ON public.destinations FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin write destinations" ON public.destinations;
CREATE POLICY "Admin write destinations" ON public.destinations FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Public read world_cities" ON public.world_cities;
CREATE POLICY "Public read world_cities" ON public.world_cities FOR SELECT USING (true);

-- Saved Destinations: Own only
DROP POLICY IF EXISTS "Users read saved destinations" ON public.saved_destinations;
CREATE POLICY "Users read saved destinations" ON public.saved_destinations FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users write saved destinations" ON public.saved_destinations;
CREATE POLICY "Users write saved destinations" ON public.saved_destinations FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Trips: Own or public
DROP POLICY IF EXISTS "Trips read" ON public.trips;
CREATE POLICY "Trips read" ON public.trips FOR SELECT USING (auth.uid() = user_id OR is_public = true OR public.is_admin());
DROP POLICY IF EXISTS "Trips write" ON public.trips;
CREATE POLICY "Trips write" ON public.trips FOR ALL USING (auth.uid() = user_id OR public.is_admin()) WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- Bookings: Own or admin
DROP POLICY IF EXISTS "Bookings read" ON public.bookings;
CREATE POLICY "Bookings read" ON public.bookings FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
DROP POLICY IF EXISTS "Bookings write" ON public.bookings;
CREATE POLICY "Bookings write" ON public.bookings FOR ALL USING (auth.uid() = user_id OR public.is_admin()) WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- Expenses: Own only
DROP POLICY IF EXISTS "Expenses read" ON public.expenses;
CREATE POLICY "Expenses read" ON public.expenses FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Expenses write" ON public.expenses;
CREATE POLICY "Expenses write" ON public.expenses FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Checklists: Own only
DROP POLICY IF EXISTS "Checklists read" ON public.checklists;
CREATE POLICY "Checklists read" ON public.checklists FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Checklists write" ON public.checklists;
CREATE POLICY "Checklists write" ON public.checklists FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Intelligence & API Cache: Public read, authenticated/server write
DROP POLICY IF EXISTS "Cache read" ON public.travel_intelligence_cache;
CREATE POLICY "Cache read" ON public.travel_intelligence_cache FOR SELECT USING (true);
DROP POLICY IF EXISTS "Cache write" ON public.travel_intelligence_cache;
CREATE POLICY "Cache write" ON public.travel_intelligence_cache FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Api cache read" ON public.api_cache;
CREATE POLICY "Api cache read" ON public.api_cache FOR SELECT USING (true);
DROP POLICY IF EXISTS "Api cache write" ON public.api_cache;
CREATE POLICY "Api cache write" ON public.api_cache FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================================
-- 16. STORAGE BUCKETS
-- ============================================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('tripona-media', 'tripona-media', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('tripona-vouchers', 'tripona-vouchers', false) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public media files accessible by all" ON storage.objects;
CREATE POLICY "Public media files accessible by all" ON storage.objects FOR SELECT USING (bucket_id = 'tripona-media');
DROP POLICY IF EXISTS "Authenticated users upload media" ON storage.objects;
CREATE POLICY "Authenticated users upload media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'tripona-media');
