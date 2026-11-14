/**
 * Supabase Authentication Service for TRIPONA
 * Manages user registration, login, logout, password resets, session persistence,
 * and user profile synchronization with PostgreSQL public.profiles.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const authService = {
  /**
   * Check if Supabase Auth is active
   */
  isConfigured() {
    return isSupabaseConfigured;
  },

  /**
   * Get current active session
   */
  async getSession() {
    if (!isSupabaseConfigured) return null;
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.warn('Supabase getSession error:', error.message);
      return null;
    }
    return session;
  },

  /**
   * Get current authenticated user
   */
  async getCurrentUser() {
    if (!isSupabaseConfigured) return null;
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) return null;
    return user;
  },

  /**
   * Register a new user with Email and Password
   */
  async register(name, email, password) {
    if (!isSupabaseConfigured) {
      // Local fallback account
      const uid = 'usr_' + Date.now().toString(36);
      return {
        user: {
          uid,
          id: uid,
          name: name.trim(),
          email: email.trim(),
          photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=527F91&color=fff`,
          currency: 'USD ($)',
          country: 'New Voyager'
        },
        session: null
      };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name.trim(),
          full_name: name.trim(),
          avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=527F91&color=fff`
        }
      }
    });

    if (error) throw error;

    const user = data.user;
    if (user) {
      // Ensure profile exists in public.profiles
      await supabase.from('profiles').upsert({
        id: user.id,
        email: user.email,
        name: name.trim(),
        photo_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=527F91&color=fff`,
        role: 'user',
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });
    }

    return {
      user: user ? {
        uid: user.id,
        id: user.id,
        email: user.email,
        name: name.trim(),
        photoURL: user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=527F91&color=fff`,
        currency: 'USD ($)',
        country: 'New Voyager'
      } : null,
      session: data.session
    };
  },

  /**
   * Log in with Email and Password
   */
  async login(email, password) {
    if (!isSupabaseConfigured) {
      const uid = 'usr_' + Math.abs(email.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0)).toString(36);
      const cleanName = email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      return {
        user: {
          uid,
          id: uid,
          name: cleanName,
          email,
          photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=527F91&color=fff`,
          currency: 'USD ($)',
          country: 'International Voyager'
        },
        session: null
      };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    // Fetch user profile from public.profiles
    let profile = null;
    if (data.user) {
      const { data: profData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      profile = profData;
    }

    const u = data.user;
    const formattedUser = {
      uid: u.id,
      id: u.id,
      email: u.email,
      name: profile?.name || u.user_metadata?.name || u.email.split('@')[0],
      photoURL: profile?.photo_url || u.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.email.split('@')[0])}&background=527F91&color=fff`,
      currency: profile?.currency || 'USD ($)',
      country: profile?.country || 'International Voyager',
      role: profile?.role || 'user'
    };

    return { user: formattedUser, session: data.session };
  },

  /**
   * Log in with Google OAuth (Supabase Auth)
   */
  async loginWithGoogle() {
    if (!isSupabaseConfigured) {
      const cleanName = 'Google Voyager';
      return {
        user: {
          uid: 'google_' + Date.now().toString(36),
          id: 'google_' + Date.now().toString(36),
          name: cleanName,
          email: 'voyager.google@gmail.com',
          photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=4285F4&color=fff`,
          currency: 'USD ($)',
          country: 'Verified Voyager'
        },
        session: null
      };
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });

    if (error) throw error;
    return data;
  },

  /**
   * Log out
   */
  async logout() {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.signOut();
      if (error) console.warn('Supabase sign out error:', error.message);
    }
    return true;
  },

  /**
   * Send Password Reset Email
   */
  async resetPassword(email) {
    if (!isSupabaseConfigured) {
      return { success: true, message: `Password reset instructions sent to ${email}` };
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });

    if (error) throw error;
    return { success: true, message: `Password reset link sent to ${email}` };
  },

  /**
   * Update Profile in Supabase public.profiles
   */
  async updateProfile(userId, updates) {
    if (!isSupabaseConfigured || !userId) return updates;

    const payload = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.photoURL !== undefined) payload.photo_url = updates.photoURL;
    if (updates.country !== undefined) payload.country = updates.country;
    if (updates.currency !== undefined) payload.currency = updates.currency;
    if (updates.travelPreferences !== undefined) payload.travel_preferences = updates.travelPreferences;
    payload.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.warn('Update profile error in Supabase:', error.message);
    }
    return data;
  },

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange(callback) {
    if (!isSupabaseConfigured) {
      return { unsubscribe: () => {} };
    }
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
    return subscription;
  }
};

export default authService;
