import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { databaseService } from '../services/databaseService';
import { isSupabaseConfigured } from '../lib/supabase';

const TripContext = createContext();

export const useTrip = () => {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error('useTrip must be used within a TripProvider');
  }
  return context;
};

export const TripProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  const [trips, setTrips] = useState([]);
  const [activeTrip, setActiveTrip] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [checklists, setChecklists] = useState({ travel: [], packing: [] });
  const [savedDestinationIds, setSavedDestinationIds] = useState([]);
  const [currentCurrency, setCurrentCurrency] = useState('USD ($)');
  const [loadingTrips, setLoadingTrips] = useState(false);

  // Headers helper with Authorization token & legacy x-user-id
  const getHeaders = () => {
    const token = localStorage.getItem('tripona_token') || (user?.uid ? `test-valid-user-${user.uid}` : '');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(user ? { 'x-user-id': user.uid } : {})
    };
  };

  // Fetch real trips whenever user auth changes
  useEffect(() => {
    if (!isAuthenticated || !user?.uid) {
      setTrips([]);
      setActiveTrip(null);
      setExpenses([]);
      setChecklists({ travel: [], packing: [] });
      setSavedDestinationIds([]);
      return;
    }

    const fetchUserData = async () => {
      setLoadingTrips(true);
      try {
        if (isSupabaseConfigured) {
          // Cloud PostgreSQL mode via Supabase
          const cloudTrips = await databaseService.getTrips(user.uid);
          setTrips(cloudTrips);
          if (cloudTrips.length > 0) setActiveTrip(cloudTrips[0]);

          const cloudSaved = await databaseService.getSavedDestinations(user.uid);
          setSavedDestinationIds(cloudSaved.map(d => d.destination_slug || d.destination_id));

          const cloudChecklists = await databaseService.getChecklists(user.uid);
          setChecklists(cloudChecklists);
        } else {
          // 1. Fetch user's trips from REST backend
          const tripRes = await fetch('/api/trips', { headers: getHeaders() });
          if (tripRes.ok) {
            const tripData = await tripRes.json();
            setTrips(tripData);
            if (tripData.length > 0) {
              setActiveTrip(tripData[0]);
            } else {
              setActiveTrip(null);
            }
          }

          // 2. Fetch user's expenses
          const expRes = await fetch('/api/expenses', { headers: getHeaders() });
          if (expRes.ok) {
            const expData = await expRes.json();
            setExpenses(expData);
          }

          // 3. Fetch user's checklists
          const chkRes = await fetch('/api/checklists', { headers: getHeaders() });
          if (chkRes.ok) {
            const chkData = await chkRes.json();
            setChecklists(chkData || { travel: [], packing: [] });
          }

          // 4. Fetch user's saved destinations
          const savedRes = await fetch('/api/saved-destinations', { headers: getHeaders() });
          if (savedRes.ok) {
            const savedData = await savedRes.json();
            setSavedDestinationIds(savedData.map(d => d.slug || d._id));
          }
        }
      } catch (err) {
        console.error('Error fetching user travel data:', err);
      } finally {
        setLoadingTrips(false);
      }
    };

    fetchUserData();
  }, [isAuthenticated, user?.uid]);

  // Toggle Save Destination
  const toggleSaveDestination = async (id, destinationName = '') => {
    if (!isAuthenticated) {
      alert('Please sign in to save destinations to your personal wishlist.');
      return false;
    }

    try {
      if (isSupabaseConfigured) {
        const isCurrentlySaved = savedDestinationIds.includes(id);
        if (isCurrentlySaved) {
          await databaseService.removeSavedDestination(user.uid, id);
          setSavedDestinationIds(prev => prev.filter(item => item !== id));
          return false;
        } else {
          await databaseService.saveDestination(user.uid, { slug: id, id, name: destinationName || id });
          setSavedDestinationIds(prev => [...prev, id]);
          return true;
        }
      }

      const response = await fetch('/api/saved-destinations/toggle', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ destinationId: id, destinationName })
      });

      if (response.ok) {
        const data = await response.json();
        setSavedDestinationIds(prev => 
          data.saved ? [...prev, id] : prev.filter(item => item !== id)
        );
        return data.saved;
      }
    } catch (err) {
      console.error('Error toggling destination:', err);
    }
    return false;
  };

  const isDestinationSaved = (id) => savedDestinationIds.includes(id);

  // Save New Trip
  const saveNewTrip = async (tripData) => {
    try {
      if (isSupabaseConfigured && user?.uid) {
        const createdTrip = await databaseService.createTrip(user.uid, tripData);
        setTrips(prev => [createdTrip, ...prev]);
        setActiveTrip(createdTrip);
        return createdTrip;
      }

      const response = await fetch('/api/trips', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(tripData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save itinerary');
      }

      const createdTrip = await response.json();
      setTrips(prev => [createdTrip, ...prev]);
      setActiveTrip(createdTrip);
      return createdTrip;
    } catch (err) {
      console.error('Save Trip Error:', err);
      throw err;
    }
  };

  // Update Trip
  const updateTrip = async (id, updates) => {
    try {
      if (isSupabaseConfigured) {
        const updated = await databaseService.updateTrip(id, updates);
        setTrips(prev => prev.map(t => t.id === id || t._id === id ? { ...t, ...updates } : t));
        if (activeTrip && (activeTrip.id === id || activeTrip._id === id)) {
          setActiveTrip(prev => ({ ...prev, ...updates }));
        }
        return updated;
      }

      const response = await fetch(`/api/trips/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        const updated = await response.json();
        setTrips(prev => prev.map(t => t.id === id || t._id === id ? updated : t));
        if (activeTrip && (activeTrip.id === id || activeTrip._id === id)) {
          setActiveTrip(updated);
        }
        return updated;
      }
    } catch (err) {
      console.error('Update Trip Error:', err);
    }
  };

  // Delete Trip
  const deleteTrip = async (id) => {
    try {
      if (isSupabaseConfigured) {
        await databaseService.deleteTrip(id);
        setTrips(prev => prev.filter(t => t.id !== id && t._id !== id));
        if (activeTrip && (activeTrip.id === id || activeTrip._id === id)) {
          const remaining = trips.filter(t => t.id !== id && t._id !== id);
          setActiveTrip(remaining[0] || null);
        }
        return;
      }

      const response = await fetch(`/api/trips/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });

      if (response.ok) {
        setTrips(prev => prev.filter(t => t.id !== id && t._id !== id));
        if (activeTrip && (activeTrip.id === id || activeTrip._id === id)) {
          const remaining = trips.filter(t => t.id !== id && t._id !== id);
          setActiveTrip(remaining[0] || null);
        }
      }
    } catch (err) {
      console.error('Delete Trip Error:', err);
    }
  };

  // Add Expense
  const addExpense = async (expenseData) => {
    try {
      if (isSupabaseConfigured && user?.uid) {
        const createdExp = await databaseService.addExpense(user.uid, expenseData);
        setExpenses(prev => [createdExp, ...prev]);
        return createdExp;
      }

      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(expenseData)
      });

      if (response.ok) {
        const createdExp = await response.json();
        setExpenses(prev => [createdExp, ...prev]);

        if (expenseData.tripId) {
          setTrips(prev => prev.map(t => {
            if (t._id === expenseData.tripId || t.id === expenseData.tripId) {
              return { ...t, spentBudget: (t.spentBudget || 0) + Number(expenseData.amount) };
            }
            return t;
          }));
        }
        return createdExp;
      }
    } catch (err) {
      console.error('Add Expense Error:', err);
      throw err;
    }
  };

  // Delete Expense
  const deleteExpense = async (id) => {
    try {
      const target = expenses.find(e => e._id === id || e.id === id);
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });

      if (response.ok) {
        setExpenses(prev => prev.filter(e => e._id !== id && e.id !== id));
        if (target && target.tripId) {
          setTrips(prev => prev.map(t => {
            if (t._id === target.tripId || t.id === target.tripId) {
              return { ...t, spentBudget: Math.max(0, (t.spentBudget || 0) - Number(target.amount)) };
            }
            return t;
          }));
        }
      }
    } catch (err) {
      console.error('Delete Expense Error:', err);
    }
  };

  // Toggle Checklist item
  const toggleChecklist = async (type, id) => {
    try {
      if (isSupabaseConfigured) {
        const item = checklists[type]?.find(i => i.id === id || i._id === id);
        const newStatus = !item?.completed;
        await databaseService.toggleChecklist(id, newStatus);
        setChecklists(prev => ({
          ...prev,
          [type]: prev[type].map(i => (i._id === id || i.id === id) ? { ...i, completed: newStatus } : i)
        }));
        return;
      }

      const response = await fetch(`/api/checklists/${id}/toggle`, {
        method: 'PATCH',
        headers: getHeaders()
      });

      if (response.ok) {
        const updated = await response.json();
        setChecklists(prev => ({
          ...prev,
          [type]: prev[type].map(i => (i._id === id || i.id === id) ? updated : i)
        }));
      }
    } catch (err) {
      console.error('Toggle Checklist Error:', err);
    }
  };

  // Add Checklist item
  const addChecklistItem = async (type, text, category = 'General') => {
    try {
      const response = await fetch('/api/checklists', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ type, text, category })
      });

      if (response.ok) {
        const created = await response.json();
        setChecklists(prev => ({
          ...prev,
          [type]: [...prev[type], created]
        }));
      }
    } catch (err) {
      console.error('Add Checklist Error:', err);
    }
  };

  return (
    <TripContext.Provider value={{
      trips,
      activeTrip,
      setActiveTrip,
      saveNewTrip,
      updateTrip,
      deleteTrip,
      expenses,
      addExpense,
      deleteExpense,
      checklists,
      toggleChecklist,
      addChecklistItem,
      savedDestinationIds,
      toggleSaveDestination,
      isDestinationSaved,
      currentCurrency,
      setCurrentCurrency,
      loadingTrips
    }}>
      {children}
    </TripContext.Provider>
  );
};

export default TripContext;
