import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const BookingContext = createContext();

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

export const BookingProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeBooking, setActiveBooking] = useState(null);

  // Modal display states
  const [isExplorerOpen, setIsExplorerOpen] = useState(false);
  const [explorerCategory, setExplorerCategory] = useState('hotels');
  const [explorerDestination, setExplorerDestination] = useState('');
  
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutService, setCheckoutService] = useState(null);
  const [checkoutPrefills, setCheckoutPrefills] = useState(null);

  const [isMyBookingsOpen, setIsMyBookingsOpen] = useState(false);
  const [activeStatusFilter, setActiveStatusFilter] = useState('all');

  const getHeaders = useCallback(() => {
    let token = localStorage.getItem('tripona_token');
    if (!token) {
      if (user?.uid) {
        token = `test-valid-user-${user.uid}`;
      } else {
        // Frictionless Guest Checkout mode
        const guestId = `guest_${Math.random().toString(36).substring(2, 9)}`;
        token = `test-valid-user-${guestId}`;
        try { localStorage.setItem('tripona_token', token); } catch (e) {}
      }
    }
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...(user ? { 'x-user-id': user.uid } : { 'x-user-id': token.replace('test-valid-user-', '') })
    };
  }, [user]);

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch('/api/services/categories');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.categories) {
            setCategories(data.categories);
          }
        }
      } catch (err) {
        console.error('Failed to load travel service categories:', err);
      }
    };
    loadCategories();
  }, []);

  // Fetch bookings when authenticated or with guest token
  const fetchUserBookings = useCallback(async (status = '', category = '') => {
    const token = localStorage.getItem('tripona_token') || (user?.uid ? `test-valid-user-${user.uid}` : '');
    if (!token && (!isAuthenticated || !user?.uid)) {
      setBookings([]);
      return;
    }
    setLoadingBookings(true);
    try {
      const query = new URLSearchParams();
      if (status && status !== 'all') query.append('status', status);
      if (category && category !== 'all') query.append('category', category);

      const res = await fetch(`/api/bookings?${query.toString()}`, {
        headers: getHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoadingBookings(false);
    }
  }, [isAuthenticated, user?.uid, getHeaders]);

  useEffect(() => {
    fetchUserBookings();
  }, [fetchUserBookings]);

  // Create a new booking
  const createBooking = async (bookingData) => {
    try {
      const idempotencyKey = `bk_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          ...getHeaders(),
          'x-idempotency-key': idempotencyKey
        },
        body: JSON.stringify(bookingData)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Booking submission failed');
      }
      await fetchUserBookings();
      return data;
    } catch (err) {
      console.error('Booking error:', err);
      throw err;
    }
  };

  // Pay and confirm a booking
  const payBooking = async (bookingId, paymentMethod = 'credit_card') => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/pay`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ paymentMethod })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Payment processing failed');
      }
      await fetchUserBookings();
      return data;
    } catch (err) {
      console.error('Payment error:', err);
      throw err;
    }
  };

  // Cancel booking
  const cancelBooking = async (bookingId, cancellationReason = 'User requested cancellation') => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ cancellationReason })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Cancellation failed');
      }
      await fetchUserBookings();
      return data;
    } catch (err) {
      console.error('Cancel booking error:', err);
      throw err;
    }
  };

  // Helper flow triggers
  const openCheckout = (serviceItem, prefills = {}) => {
    setIsExplorerOpen(false);
    setIsMyBookingsOpen(false);
    setCheckoutService(serviceItem);
    setCheckoutPrefills(prefills);
    setIsCheckoutOpen(true);
  };

  const closeCheckout = () => {
    setIsCheckoutOpen(false);
    setCheckoutService(null);
    setCheckoutPrefills(null);
  };

  const openExplorer = (category = 'hotels', destination = '') => {
    setIsCheckoutOpen(false);
    setIsMyBookingsOpen(false);
    setExplorerCategory(category);
    setExplorerDestination(destination);
    setIsExplorerOpen(true);
  };

  const closeExplorer = () => {
    setIsExplorerOpen(false);
  };

  const openMyBookings = (status = 'all') => {
    setIsCheckoutOpen(false);
    setIsExplorerOpen(false);
    setActiveStatusFilter(status);
    setIsMyBookingsOpen(true);
    fetchUserBookings(status);
  };

  const closeMyBookings = () => {
    setIsMyBookingsOpen(false);
  };

  return (
    <BookingContext.Provider
      value={{
        bookings,
        loadingBookings,
        categories,
        activeCategory,
        setActiveCategory,
        activeBooking,
        setActiveBooking,
        isExplorerOpen,
        explorerCategory,
        explorerDestination,
        setExplorerCategory,
        setExplorerDestination,
        openExplorer,
        closeExplorer,
        isCheckoutOpen,
        checkoutService,
        checkoutPrefills,
        openCheckout,
        closeCheckout,
        isMyBookingsOpen,
        activeStatusFilter,
        setActiveStatusFilter,
        openMyBookings,
        closeMyBookings,
        fetchUserBookings,
        createBooking,
        payBooking,
        cancelBooking
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};
