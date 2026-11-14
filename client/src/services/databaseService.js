/**
 * Database Service for TRIPONA
 * Manages all PostgreSQL database interactions with Supabase:
 * - Trips & Itineraries
 * - Bookings & Services
 * - Destinations & Saved Destinations
 * - Expenses & Budgets
 * - Checklists (Travel & Packing)
 * - AI Conversations
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const databaseService = {
  // ==========================================================================
  // 1. DESTINATIONS
  // ==========================================================================
  async getDestinations() {
    if (!isSupabaseConfigured) {
      const res = await fetch('/api/destinations');
      return res.ok ? await res.json() : [];
    }

    const { data, error } = await supabase
      .from('destinations')
      .select('*')
      .order('rating', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getDestinationBySlug(slug) {
    if (!isSupabaseConfigured) {
      const res = await fetch(`/api/destinations/${slug}`);
      return res.ok ? await res.json() : null;
    }

    const { data, error } = await supabase
      .from('destinations')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) throw error;
    return data;
  },

  // ==========================================================================
  // 2. SAVED DESTINATIONS
  // ==========================================================================
  async getSavedDestinations(userId) {
    if (!userId) return [];
    if (!isSupabaseConfigured) {
      const res = await fetch('/api/saved-destinations', {
        headers: { 'x-user-id': userId }
      });
      return res.ok ? await res.json() : [];
    }

    const { data, error } = await supabase
      .from('saved_destinations')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.warn('getSavedDestinations warning:', error.message);
      return [];
    }
    return data || [];
  },

  async saveDestination(userId, destination) {
    if (!userId || !destination) return null;
    if (!isSupabaseConfigured) {
      const res = await fetch('/api/saved-destinations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
        body: JSON.stringify({
          destinationId: destination.id || destination.slug,
          destinationSlug: destination.slug,
          destinationName: destination.name
        })
      });
      return res.ok ? await res.json() : null;
    }

    const { data, error } = await supabase
      .from('saved_destinations')
      .upsert({
        user_id: userId,
        destination_id: String(destination.id || destination.slug),
        destination_slug: destination.slug,
        destination_name: destination.name,
        saved_at: new Date().toISOString()
      }, { onConflict: 'user_id,destination_id' })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async removeSavedDestination(userId, destinationId) {
    if (!userId) return false;
    if (!isSupabaseConfigured) {
      await fetch(`/api/saved-destinations/${destinationId}`, {
        method: 'DELETE',
        headers: { 'x-user-id': userId }
      });
      return true;
    }

    const { error } = await supabase
      .from('saved_destinations')
      .delete()
      .eq('user_id', userId)
      .eq('destination_id', String(destinationId));

    if (error) throw error;
    return true;
  },

  // ==========================================================================
  // 3. TRIPS
  // ==========================================================================
  async getTrips(userId) {
    if (!userId) return [];
    if (!isSupabaseConfigured) {
      const res = await fetch('/api/trips', {
        headers: { 'x-user-id': userId }
      });
      return res.ok ? await res.json() : [];
    }

    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    // Normalize properties for client components
    return (data || []).map(t => ({
      _id: t.id,
      id: t.id,
      userId: t.user_id,
      title: t.title,
      destination: t.destination,
      destinationId: t.destination_id,
      startDate: t.start_date,
      endDate: t.end_date,
      status: t.status,
      travelStyle: t.travel_style,
      travellers: t.travellers,
      totalBudget: t.total_budget,
      spentBudget: t.spent_budget,
      coverImage: t.cover_image,
      daysCount: t.days_count,
      isPublic: t.is_public,
      shareToken: t.share_token,
      days: t.days || [],
      createdAt: t.created_at,
      updatedAt: t.updated_at
    }));
  },

  async createTrip(userId, tripData) {
    if (!userId) throw new Error('User authentication required to save trip');
    if (!isSupabaseConfigured) {
      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
        body: JSON.stringify(tripData)
      });
      if (!res.ok) throw new Error('Failed to create trip via API');
      return await res.json();
    }

    const record = {
      user_id: userId,
      title: tripData.title || `${tripData.destination} Adventure`,
      destination: tripData.destination || 'Global Itinerary',
      destination_id: tripData.destinationId || null,
      start_date: tripData.startDate || new Date().toISOString().split('T')[0],
      end_date: tripData.endDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      status: tripData.status || 'upcoming',
      travel_style: tripData.travelStyle || 'smart-ai',
      travellers: Number(tripData.travellers) || 2,
      total_budget: Number(tripData.totalBudget) || 3500,
      spent_budget: Number(tripData.spentBudget) || 0,
      cover_image: tripData.coverImage || null,
      days_count: Number(tripData.daysCount) || tripData.days?.length || 7,
      is_public: tripData.isPublic !== undefined ? tripData.isPublic : true,
      share_token: tripData.shareToken || 'trp_' + Math.random().toString(36).substring(2, 10),
      days: tripData.days || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('trips')
      .insert(record)
      .select()
      .single();

    if (error) throw error;
    return {
      _id: data.id,
      id: data.id,
      ...tripData,
      createdAt: data.created_at
    };
  },

  async updateTrip(tripId, updates) {
    if (!tripId) return null;
    if (!isSupabaseConfigured) {
      const res = await fetch(`/api/trips/${tripId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      return res.ok ? await res.json() : null;
    }

    const payload = {};
    if (updates.title) payload.title = updates.title;
    if (updates.status) payload.status = updates.status;
    if (updates.totalBudget !== undefined) payload.total_budget = updates.totalBudget;
    if (updates.spentBudget !== undefined) payload.spent_budget = updates.spentBudget;
    if (updates.days) payload.days = updates.days;
    payload.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('trips')
      .update(payload)
      .eq('id', tripId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteTrip(tripId) {
    if (!tripId) return false;
    if (!isSupabaseConfigured) {
      await fetch(`/api/trips/${tripId}`, { method: 'DELETE' });
      return true;
    }

    const { error } = await supabase
      .from('trips')
      .delete()
      .eq('id', tripId);

    if (error) throw error;
    return true;
  },

  // ==========================================================================
  // 4. BOOKINGS
  // ==========================================================================
  async getBookings(userId, category = null) {
    if (!userId) return [];
    if (!isSupabaseConfigured) {
      const url = category && category !== 'all'
        ? `/api/bookings?category=${category}`
        : '/api/bookings';
      const res = await fetch(url, { headers: { 'x-user-id': userId } });
      return res.ok ? await res.json() : [];
    }

    let query = supabase
      .from('bookings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map(b => ({
      _id: b.id,
      id: b.id,
      bookingId: b.booking_id,
      userId: b.user_id,
      tripId: b.trip_id,
      category: b.category,
      categoryLabel: b.category_label,
      serviceId: b.service_id,
      serviceName: b.service_name,
      serviceProvider: b.service_provider,
      imageUrl: b.image_url,
      destination: b.destination,
      dates: b.dates || {},
      travellers: b.travellers || [],
      primaryContact: b.primary_contact || {},
      pricing: b.pricing || {},
      bookingStatus: b.booking_status,
      paymentStatus: b.payment_status,
      paymentMethod: b.payment_method,
      ticketNumber: b.ticket_number,
      voucherCode: b.voucher_code,
      cancellationReason: b.cancellation_reason,
      cancelledAt: b.cancelled_at,
      createdAt: b.created_at,
      updatedAt: b.updated_at
    }));
  },

  async createBooking(userId, bookingData) {
    if (!userId) throw new Error('User ID required for booking');
    if (!isSupabaseConfigured) {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
        body: JSON.stringify(bookingData)
      });
      if (!res.ok) throw new Error('Failed to create booking');
      return await res.json();
    }

    const bookingId = bookingData.bookingId || `TRP-${(bookingData.category || 'SRV').substring(0, 3).toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const record = {
      booking_id: bookingId,
      user_id: userId,
      trip_id: bookingData.tripId || null,
      category: bookingData.category,
      category_label: bookingData.categoryLabel || 'TRAVEL SERVICE',
      service_id: String(bookingData.serviceId || 'srv-gen'),
      service_name: bookingData.serviceName || 'Custom Booking',
      service_provider: bookingData.serviceProvider || 'TRIPONA Direct',
      image_url: bookingData.imageUrl || null,
      destination: bookingData.destination || 'Global',
      dates: bookingData.dates || {},
      travellers: bookingData.travellers || [],
      primary_contact: bookingData.primaryContact || {},
      pricing: bookingData.pricing || {},
      booking_status: bookingData.bookingStatus || 'confirmed',
      payment_status: bookingData.paymentStatus || 'completed',
      payment_method: bookingData.paymentMethod || 'card',
      ticket_number: bookingData.ticketNumber || `TKT-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      voucher_code: bookingData.voucherCode || `VCH-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('bookings')
      .insert(record)
      .select()
      .single();

    if (error) throw error;
    return {
      _id: data.id,
      id: data.id,
      ...bookingData,
      bookingId: data.booking_id,
      ticketNumber: data.ticket_number,
      voucherCode: data.voucher_code
    };
  },

  async cancelBooking(bookingId, reason = 'Customer request') {
    if (!bookingId) return null;
    if (!isSupabaseConfigured) {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      return res.ok ? await res.json() : null;
    }

    const { data, error } = await supabase
      .from('bookings')
      .update({
        booking_status: 'cancelled',
        payment_status: 'refund_pending',
        cancellation_reason: reason,
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('booking_id', bookingId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // ==========================================================================
  // 5. EXPENSES
  // ==========================================================================
  async getExpenses(userId, tripId) {
    if (!userId || !tripId) return [];
    if (!isSupabaseConfigured) {
      const res = await fetch(`/api/expenses?tripId=${tripId}`, {
        headers: { 'x-user-id': userId }
      });
      return res.ok ? await res.json() : [];
    }

    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .eq('trip_id', String(tripId))
      .order('date', { ascending: false });

    if (error) throw error;
    return (data || []).map(e => ({
      _id: e.id,
      id: e.id,
      userId: e.user_id,
      tripId: e.trip_id,
      category: e.category,
      description: e.description,
      amount: e.amount,
      currency: e.currency,
      date: e.date,
      createdAt: e.created_at
    }));
  },

  async addExpense(userId, expenseData) {
    if (!userId) throw new Error('User authentication required');
    if (!isSupabaseConfigured) {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
        body: JSON.stringify(expenseData)
      });
      return res.ok ? await res.json() : null;
    }

    const { data, error } = await supabase
      .from('expenses')
      .insert({
        user_id: userId,
        trip_id: String(expenseData.tripId),
        category: expenseData.category || 'Food',
        description: expenseData.description,
        amount: Number(expenseData.amount) || 0,
        currency: expenseData.currency || 'USD',
        date: expenseData.date || new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // ==========================================================================
  // 6. CHECKLISTS
  // ==========================================================================
  async getChecklists(userId, tripId) {
    if (!userId) return { travel: [], packing: [] };
    if (!isSupabaseConfigured) {
      const url = tripId ? `/api/checklists?tripId=${tripId}` : '/api/checklists';
      const res = await fetch(url, { headers: { 'x-user-id': userId } });
      if (!res.ok) return { travel: [], packing: [] };
      const items = await res.json();
      return {
        travel: items.filter(i => i.type === 'travel'),
        packing: items.filter(i => i.type === 'packing')
      };
    }

    let query = supabase
      .from('checklists')
      .select('*')
      .eq('user_id', userId);

    if (tripId) {
      query = query.eq('trip_id', String(tripId));
    }

    const { data, error } = await query;
    if (error) throw error;

    const list = data || [];
    return {
      travel: list.filter(i => i.type === 'travel'),
      packing: list.filter(i => i.type === 'packing')
    };
  },

  async toggleChecklist(itemId, completed) {
    if (!itemId) return;
    if (!isSupabaseConfigured) {
      await fetch(`/api/checklists/${itemId}/toggle`, { method: 'PATCH' });
      return;
    }

    const { error } = await supabase
      .from('checklists')
      .update({ completed })
      .eq('id', itemId);

    if (error) throw error;
  }
};

export default databaseService;
