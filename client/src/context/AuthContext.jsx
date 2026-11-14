import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile
} from '../services/firebase';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // Real authenticated user state (starts as null or previously stored session)
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('tripona_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Sync user with backend & cloud
  const syncUserWithBackend = async (userData, tokenOverride) => {
    try {
      const token = tokenOverride || localStorage.getItem('tripona_token') || `test-valid-user-${userData.uid}`;
      const response = await fetch('/api/users/sync', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          uid: userData.uid,
          email: userData.email,
          name: userData.name || userData.displayName,
          photoURL: userData.photoURL
        })
      });
      if (response.ok) {
        const synced = await response.json();
        return synced;
      }
    } catch (e) {
      console.warn('Backend user sync warning:', e.message);
    }
    return userData;
  };

  useEffect(() => {
    let isMounted = true;

    // Listen to real Firebase authentication state changes
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (!isMounted) return;
        if (firebaseUser) {
          const idToken = await firebaseUser.getIdToken().catch(() => null);
          if (idToken) {
            localStorage.setItem('tripona_token', idToken);
          }

          const formattedUser = {
            uid: firebaseUser.uid,
            id: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Voyager',
            displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Voyager',
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(firebaseUser.displayName || 'User')}&background=527F91&color=fff`,
            country: 'International Voyager',
            currency: 'USD ($)',
            travelPreferences: []
          };

          await syncUserWithBackend(formattedUser, idToken);
          setUser(formattedUser);
          setAuthError(null); // clear any residual errors on successful auth
          localStorage.setItem('tripona_user', JSON.stringify(formattedUser));
        } else {
          const saved = localStorage.getItem('tripona_user');
          if (!saved) {
            setUser(null);
            localStorage.removeItem('tripona_token');
          }
        }
        setLoading(false);
      });

      return () => {
        isMounted = false;
        unsubscribe && unsubscribe();
      };
    } else {
      setLoading(false);
    }
  }, []);

  /**
   * Real Email & Password Login
   */
  const login = async (email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      if (!email || !password) {
        throw new Error('Please enter both email and password.');
      }

      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const fbUser = userCredential.user;
      const idToken = await fbUser.getIdToken();
      if (idToken) localStorage.setItem('tripona_token', idToken);

      const loggedName = fbUser.displayName || email.split('@')[0];
      const loggedUser = {
        uid: fbUser.uid,
        id: fbUser.uid,
        name: loggedName,
        displayName: loggedName,
        email: fbUser.email,
        photoURL: fbUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(loggedName)}&background=527F91&color=fff`,
        currency: 'USD ($)',
        country: 'International Voyager',
        role: 'user'
      };

      await syncUserWithBackend(loggedUser, idToken);
      setUser(loggedUser);
      localStorage.setItem('tripona_user', JSON.stringify(loggedUser));
      return { success: true, user: loggedUser };
    } catch (err) {
      let friendlyError = err.message || 'Login failed.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        friendlyError = 'Incorrect email or password. Please verify your details or click "Sign Up" if you are new.';
      } else if (err.code === 'auth/invalid-email') {
        friendlyError = 'Please enter a valid email address.';
      } else if (err.code === 'auth/too-many-requests') {
        friendlyError = 'Too many attempts. Please try again later or reset your password.';
      }
      setAuthError(friendlyError);
      return { success: false, error: friendlyError };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Real Email & Password Registration
   */
  const register = async (name, email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      if (!email || !password) {
        throw new Error('Please enter both email and password.');
      }
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long.');
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const fbUser = userCredential.user;

      const trimmedName = name?.trim() || email.split('@')[0];
      if (trimmedName) {
        await updateProfile(fbUser, {
          displayName: trimmedName,
          photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(trimmedName)}&background=527F91&color=fff`
        }).catch(err => console.warn('Could not update profile name:', err));
      }

      const idToken = await fbUser.getIdToken();
      if (idToken) localStorage.setItem('tripona_token', idToken);

      const newUser = {
        uid: fbUser.uid,
        id: fbUser.uid,
        name: trimmedName,
        displayName: trimmedName,
        email: fbUser.email,
        photoURL: fbUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(trimmedName)}&background=527F91&color=fff`,
        currency: 'USD ($)',
        country: 'Global Voyager',
        role: 'user'
      };

      // Also sync into Supabase PostgreSQL profiles table
      if (isSupabaseConfigured) {
        (async () => { try { await supabase.from('profiles').upsert({ id: fbUser.uid, email: fbUser.email, name: trimmedName, photo_url: newUser.photoURL, role: 'user', updated_at: new Date().toISOString() }, { onConflict: 'id' }); } catch(e) { console.warn('Supabase sync notice:', e); } })();
      }

      await syncUserWithBackend(newUser, idToken);
      setUser(newUser);
      localStorage.setItem('tripona_user', JSON.stringify(newUser));
      return { success: true, user: newUser };
    } catch (err) {
      let friendlyError = err.message || 'Registration failed.';
      if (err.code === 'auth/email-already-in-use' || err.message?.includes('email-already-in-use')) {
        friendlyError = 'This email is already registered. Please click "Log In" instead.';
      } else if (err.code === 'auth/invalid-email' || err.message?.includes('invalid-email')) {
        friendlyError = 'Please provide a valid email address.';
      } else if (err.code === 'auth/weak-password' || err.message?.includes('weak-password')) {
        friendlyError = 'Password should be at least 6 characters.';
      }
      setAuthError(friendlyError);
      return { success: false, error: friendlyError };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Real Google Authentication
   */
  const loginWithGoogle = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const idToken = await fbUser.getIdToken().catch(() => null);
      if (idToken) localStorage.setItem('tripona_token', idToken);

      const loggedName = fbUser.displayName || fbUser.email?.split('@')[0] || 'Google Voyager';
      const loggedUser = {
        uid: fbUser.uid,
        id: fbUser.uid,
        name: loggedName,
        displayName: loggedName,
        email: fbUser.email,
        photoURL: fbUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(loggedName)}&background=4285F4&color=fff`,
        currency: 'USD ($)',
        country: 'Verified Voyager',
        role: 'user'
      };

      if (isSupabaseConfigured) {
        (async () => { try { await supabase.from('profiles').upsert({ id: fbUser.uid, email: fbUser.email, name: loggedName, photo_url: loggedUser.photoURL, role: 'user', updated_at: new Date().toISOString() }, { onConflict: 'id' }); } catch(e) { console.warn('Supabase sync notice:', e); } })();
      }

      await syncUserWithBackend(loggedUser, idToken);
      setUser(loggedUser);
      localStorage.setItem('tripona_user', JSON.stringify(loggedUser));
      return { success: true, user: loggedUser };
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user') {
        return { success: false, error: 'Google sign-in popup was cancelled.' };
      }
      if (err.code === 'auth/unauthorized-domain' || err.message?.includes('unauthorized-domain')) {
        const domainMsg = 'Domain authorization pending in Firebase. Please sign up or log in using Email & Password below!';
        setAuthError(domainMsg);
        return { success: false, error: domainMsg, isUnauthorizedDomain: true };
      }
      const friendlyError = err.message || 'Google sign-in error.';
      setAuthError(friendlyError);
      return { success: false, error: friendlyError };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Real Password Reset
   */
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email.trim());
      return { success: true, message: `Password reset link sent to ${email.trim()}!` };
    } catch (err) {
      let msg = err.message || 'Failed to send reset email.';
      if (err.code === 'auth/user-not-found') {
        msg = 'No account found with this email.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Please enter a valid email address.';
      }
      return { success: false, error: msg };
    }
  };

  /**
   * Real Logout
   */
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Sign out warning:', e);
    }
    setUser(null);
    localStorage.removeItem('tripona_user');
    localStorage.removeItem('tripona_token');
  };

  /**
   * Update Profile
   */
  const updateProfileData = async (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('tripona_user', JSON.stringify(updated));

    if (auth.currentUser && updates.name) {
      await updateProfile(auth.currentUser, { displayName: updates.name }).catch(() => {});
    }

    if (isSupabaseConfigured && user?.uid) {
      (async () => { try { await supabase.from('profiles').update({ name: updates.name, country: updates.country, currency: updates.currency, updated_at: new Date().toISOString() }).eq('id', user.uid); } catch(e) {} })();
    }

    try {
      const token = localStorage.getItem('tripona_token') || `test-valid-user-${user?.uid}`;
      await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-user-id': user?.uid || ''
        },
        body: JSON.stringify(updates)
      });
    } catch (err) {
      console.error('Failed to sync profile update to server:', err);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      authError,
      login,
      loginWithGoogle,
      register,
      logout,
      resetPassword,
      updateProfile: updateProfileData,
      isAuthenticated: !!user,
      isCloudActive: true
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
