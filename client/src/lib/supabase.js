/**
 * Centralized Supabase Client for TRIPONA
 * Connects to Supabase Cloud PostgreSQL, Authentication, and Storage.
 * Provides fallback mock/offline mode when credentials are pending initial configuration.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://txletwjkudauhxuenwkx.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_b3BXOkrk62T3Z1nc6KLU5A_GU8auTwB';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('placeholder') &&
  !supabaseAnonKey.includes('placeholder') &&
  supabaseUrl.startsWith('https://')
);

// Fallback dummy URL and anon key to prevent createClient from throwing during initialization
const validUrl = isSupabaseConfigured ? supabaseUrl : 'https://tripona-placeholder.supabase.co';
const validKey = isSupabaseConfigured ? supabaseAnonKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder';

export const supabase = createClient(validUrl, validKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage
  }
});

export default supabase;
