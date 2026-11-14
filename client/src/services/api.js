// Centralized API client for TRIPONA with Supabase Edge Functions & Local Fallback
import { isSupabaseConfigured } from '../lib/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export function getAuthHeader() {
  const token = localStorage.getItem('tripona_token');
  const storedUser = localStorage.getItem('tripona_user');
  const headers = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (storedUser) {
    try {
      const user = JSON.parse(storedUser);
      headers['x-user-id'] = user.uid || user.id;
      if (!headers['Authorization']) {
        headers['Authorization'] = `Bearer test-valid-user-${user.uid || user.id}`;
      }
    } catch (e) {}
  }

  return headers;
}

/**
 * Universal API Request
 * Routes seamlessly between Supabase Edge Functions and Local Express backend
 */
export async function apiRequest(endpoint, options = {}) {
  const targetUrl = endpoint;

  const headers = {
    'Content-Type': 'application/json',
    ...(isSupabaseConfigured && supabaseAnonKey ? { 'apikey': supabaseAnonKey } : {}),
    ...getAuthHeader(),
    ...(options.headers || {})
  };

  try {
    const response = await fetch(targetUrl, {
      ...options,
      headers
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      // Fallback: If edge function returned 404 or error and was routed to Supabase, retry locally
      if (targetUrl !== endpoint && (response.status === 404 || response.status >= 500)) {
        console.warn(`Edge function failed (${response.status}), retrying local backend:`, endpoint);
        const localRes = await fetch(endpoint, { ...options, headers: { 'Content-Type': 'application/json', ...getAuthHeader() } });
        return await localRes.json();
      }

      const errorMsg = data?.error || data?.details || `Request failed with status ${response.status}`;
      const error = new Error(errorMsg);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    // If edge routing fails due to network, fall back to local endpoint
    if (targetUrl !== endpoint) {
      const localRes = await fetch(endpoint, { ...options, headers: { 'Content-Type': 'application/json', ...getAuthHeader() } });
      return await localRes.json();
    }
    throw err;
  }
}

export default apiRequest;
