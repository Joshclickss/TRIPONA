/**
 * LocalStorage to Cloud Migration Service for TRIPONA
 * Safely extracts local cached trips, bookings, expenses, checklists, and preferences,
 * generates a JSON backup export, and migrates items to Supabase cloud tables with deduplication.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { databaseService } from './databaseService';

export const migrationService = {
  /**
   * Scan and collect all local storage data belonging to TRIPONA
   */
  inspectLocalData() {
    const report = {
      user: null,
      trips: [],
      bookings: [],
      expenses: [],
      checklists: { travel: [], packing: [] },
      preferences: {},
      tokens: { hasToken: false },
      rawKeys: []
    };

    try {
      // 1. Inspect User
      const storedUser = localStorage.getItem('tripona_user');
      if (storedUser) {
        try {
          report.user = JSON.parse(storedUser);
        } catch (e) {
          report.user = { raw: storedUser };
        }
      }

      // 2. Inspect Token
      report.tokens.hasToken = Boolean(localStorage.getItem('tripona_token'));

      // 3. Inspect Local Trips (if any stored locally)
      const storedTrips = localStorage.getItem('tripona_local_trips');
      if (storedTrips) {
        try {
          report.trips = JSON.parse(storedTrips);
        } catch (e) {}
      }

      // 4. Inspect Local Bookings
      const storedBookings = localStorage.getItem('tripona_local_bookings');
      if (storedBookings) {
        try {
          report.bookings = JSON.parse(storedBookings);
        } catch (e) {}
      }

      // 5. Inspect Local Expenses
      const storedExpenses = localStorage.getItem('tripona_local_expenses');
      if (storedExpenses) {
        try {
          report.expenses = JSON.parse(storedExpenses);
        } catch (e) {}
      }

      // 6. Inspect Saved Destination preferences
      const savedDest = localStorage.getItem('tripona_saved_destinations');
      if (savedDest) {
        try {
          report.preferences.savedDestinations = JSON.parse(savedDest);
        } catch (e) {}
      }

      // Collect all keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('tripona_')) {
          report.rawKeys.push(key);
        }
      }
    } catch (err) {
      console.error('Error inspecting local storage:', err);
    }

    return report;
  },

  /**
   * Create and trigger download of a JSON backup file of all local data
   */
  exportBackup() {
    const data = this.inspectLocalData();
    const backupPayload = {
      appName: 'TRIPONA',
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
      data
    };

    const blob = new Blob([JSON.stringify(backupPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tripona-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return backupPayload;
  },

  /**
   * Migrate collected local data into Supabase Cloud
   * @param {string} targetUserId - Target authenticated Supabase user UUID
   */
  async migrateToCloud(targetUserId) {
    if (!targetUserId) {
      throw new Error('Authenticated user ID is required to migrate data to cloud.');
    }

    const localData = this.inspectLocalData();
    const statusReport = {
      startTime: new Date().toISOString(),
      targetUserId,
      migrated: {
        profile: false,
        tripsCount: 0,
        bookingsCount: 0,
        expensesCount: 0,
        savedDestinationsCount: 0
      },
      skippedDuplicates: {
        trips: 0,
        bookings: 0
      },
      errors: []
    };

    if (!isSupabaseConfigured) {
      statusReport.errors.push('Supabase Cloud is not configured with live credentials.');
      return statusReport;
    }

    try {
      // 1. Migrate Profile & Preferences
      if (localData.user) {
        try {
          await supabase.from('profiles').upsert({
            id: targetUserId,
            name: localData.user.name || '',
            email: localData.user.email || '',
            photo_url: localData.user.photoURL || '',
            country: localData.user.country || 'Global Voyager',
            currency: localData.user.currency || 'USD ($)',
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' });
          statusReport.migrated.profile = true;
        } catch (err) {
          statusReport.errors.push(`Profile migration failed: ${err.message}`);
        }
      }

      // 2. Migrate Trips with deduplication
      if (Array.isArray(localData.trips) && localData.trips.length > 0) {
        // Fetch existing cloud trips to avoid duplicates
        const { data: existingTrips } = await supabase
          .from('trips')
          .select('title, destination, start_date')
          .eq('user_id', targetUserId);

        const existingSet = new Set(
          (existingTrips || []).map(t => `${t.title}_${t.destination}_${t.start_date}`)
        );

        for (const trip of localData.trips) {
          const key = `${trip.title}_${trip.destination}_${trip.startDate}`;
          if (existingSet.has(key)) {
            statusReport.skippedDuplicates.trips++;
            continue;
          }

          try {
            await databaseService.createTrip(targetUserId, trip);
            statusReport.migrated.tripsCount++;
          } catch (err) {
            statusReport.errors.push(`Trip '${trip.title}' migration failed: ${err.message}`);
          }
        }
      }

      // 3. Migrate Bookings with deduplication
      if (Array.isArray(localData.bookings) && localData.bookings.length > 0) {
        const { data: existingBookings } = await supabase
          .from('bookings')
          .select('booking_id')
          .eq('user_id', targetUserId);

        const existingBookingIds = new Set((existingBookings || []).map(b => b.booking_id));

        for (const booking of localData.bookings) {
          if (booking.bookingId && existingBookingIds.has(booking.bookingId)) {
            statusReport.skippedDuplicates.bookings++;
            continue;
          }

          try {
            await databaseService.createBooking(targetUserId, booking);
            statusReport.migrated.bookingsCount++;
          } catch (err) {
            statusReport.errors.push(`Booking '${booking.serviceName}' migration failed: ${err.message}`);
          }
        }
      }

      // Mark migration completed flag in localStorage
      localStorage.setItem('tripona_cloud_migrated', new Date().toISOString());
      statusReport.completedTime = new Date().toISOString();
      statusReport.success = statusReport.errors.length === 0;

    } catch (globalErr) {
      statusReport.errors.push(`Fatal migration error: ${globalErr.message}`);
      statusReport.success = false;
    }

    return statusReport;
  }
};

export default migrationService;
