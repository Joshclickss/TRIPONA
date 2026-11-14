-- ============================================================================
-- TRIPONA UNIVERSAL CLOUD DATABASE SCHEMA
-- Supabase PostgreSQL with Row Level Security (RLS) & Triggers
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. HELPER FUNCTION: is_admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. HELPER FUNCTION: trigger_set_timestamp
CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 4. TABLE: profiles (Extends auth.users)
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
-- 5. TABLE: destinations
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
-- 6. TABLE: saved_destinations
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.saved_destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  destination_id TEXT NOT NULL,
  destination_slug TEXT,
  destination_name TEXT,
  saved_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT uq_user_destination UNIQUE (user_id, destination_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_dest_user ON public.saved_destinations(user_id);

-- ============================================================================
-- 7. TABLE: trips
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
-- 8. TABLE: bookings
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
-- 9. TABLE: expenses
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
-- 10. TABLE: checklists
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
CREATE INDEX IF NOT EXISTS idx_checklists_trip ON public.checklists(trip_id);

-- ============================================================================
-- 11. TABLE: conversations (AI Travel Assistant History)
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

CREATE INDEX IF NOT EXISTS idx_conversations_user ON public.conversations(user_id);

-- ============================================================================
-- 12. TRIGGERS: auto-update updated_at timestamps
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

DROP TRIGGER IF EXISTS set_conversations_updated_at ON public.conversations;
CREATE TRIGGER set_conversations_updated_at
BEFORE UPDATE ON public.conversations
FOR EACH ROW EXECUTE PROCEDURE public.trigger_set_timestamp();

-- ============================================================================
-- 13. TRIGGER: on_auth_user_created -> auto create public.profiles
-- ============================================================================
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
-- 14. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- 14.1 PROFILES POLICIES
CREATE POLICY "Public profile read" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 14.2 DESTINATIONS POLICIES (Worldwide public catalog)
CREATE POLICY "Anyone can view destinations" ON public.destinations
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage destinations" ON public.destinations
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 14.3 SAVED DESTINATIONS POLICIES
CREATE POLICY "Users can view own saved destinations" ON public.saved_destinations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved destinations" ON public.saved_destinations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved destinations" ON public.saved_destinations
  FOR DELETE USING (auth.uid() = user_id);

-- 14.4 TRIPS POLICIES
CREATE POLICY "Users can view own or public trips" ON public.trips
  FOR SELECT USING (auth.uid() = user_id OR is_public = true OR public.is_admin());

CREATE POLICY "Users can insert own trips" ON public.trips
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trips" ON public.trips
  FOR UPDATE USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can delete own trips" ON public.trips
  FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

-- 14.5 BOOKINGS POLICIES
CREATE POLICY "Users can view own bookings or admin" ON public.bookings
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can create own bookings" ON public.bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings" ON public.bookings
  FOR UPDATE USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- 14.6 EXPENSES POLICIES
CREATE POLICY "Users can view own expenses" ON public.expenses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own expenses" ON public.expenses
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 14.7 CHECKLISTS POLICIES
CREATE POLICY "Users can view own checklists" ON public.checklists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own checklists" ON public.checklists
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 14.8 CONVERSATIONS POLICIES
CREATE POLICY "Users can view own conversations" ON public.conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own conversations" ON public.conversations
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 15. STORAGE BUCKETS CONFIGURATION (insert into storage.buckets)
-- ============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('tripona-media', 'tripona-media', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('tripona-vouchers', 'tripona-vouchers', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
CREATE POLICY "Public media files are accessible by all"
ON storage.objects FOR SELECT
USING (bucket_id = 'tripona-media');

CREATE POLICY "Authenticated users can upload media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'tripona-media');

CREATE POLICY "Users can update their own media"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'tripona-media' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'tripona-media' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own vouchers"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'tripona-vouchers' AND (auth.uid())::text = (storage.foldername(name))[1]);
