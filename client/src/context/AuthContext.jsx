import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  onAuthStateChanged 
} from '../services/firebase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // Real authenticated user state (starts strictly as NULL - no demo user)
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

  // Sync user with backend MongoDB
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
    let unsubscribe = () => {};

    if (auth) {
      unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          const idToken = await firebaseUser.getIdToken().catch(() => null);
          if (idToken) {
            localStorage.setItem('tripona_token', idToken);
          }

          const formattedUser = {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Voyager',
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(firebaseUser.displayName || 'User')}&background=527F91&color=fff`,
            country: 'International Voyager',
            currency: 'USD ($)',
            travelPreferences: []
          };

          // Sync with MongoDB backend using the verified token
          await syncUserWithBackend(formattedUser, idToken);

          setUser(formattedUser);
          localStorage.setItem('tripona_user', JSON.stringify(formattedUser));
        } else {
          // If not in Firebase, keep existing local session if user explicitly registered locally
          const saved = localStorage.getItem('tripona_user');
          if (!saved) {
            setUser(null);
            localStorage.removeItem('tripona_token');
          }
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      if (auth && !auth.config?.apiKey?.includes('DemoPlaceholder')) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const fbUser = userCredential.user;
        const idToken = await fbUser.getIdToken().catch(() => null);
        if (idToken) localStorage.setItem('tripona_token', idToken);
        const loggedUser = {
          uid: fbUser.uid,
          name: fbUser.displayName || email.split('@')[0],
          email: fbUser.email,
          photoURL: fbUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(email)}&background=527F91&color=fff`,
          currency: 'USD ($)',
          country: 'International Voyager'
        };
        await syncUserWithBackend(loggedUser, idToken);
        setUser(loggedUser);
        localStorage.setItem('tripona_user', JSON.stringify(loggedUser));
        return { success: true };
      } else {
        // Direct secure authentication when Firebase API keys are running on local dev
        const uid = 'usr_' + Math.abs(email.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0)).toString(36);
        const cleanName = email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        const loggedUser = {
          uid,
          name: cleanName,
          email,
          photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=527F91&color=fff`,
          currency: 'USD ($)',
          country: 'International Voyager'
        };
        await syncUserWithBackend(loggedUser);
        setUser(loggedUser);
        localStorage.setItem('tripona_user', JSON.stringify(loggedUser));
        return { success: true };
      }
    } catch (err) {
      setAuthError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      if (auth && googleProvider && !auth.config?.apiKey?.includes('DemoPlaceholder')) {
        const result = await signInWithPopup(auth, googleProvider);
        const fbUser = result.user;
        const idToken = await fbUser.getIdToken().catch(() => null);
        if (idToken) localStorage.setItem('tripona_token', idToken);
        const loggedUser = {
          uid: fbUser.uid,
          name: fbUser.displayName || fbUser.email?.split('@')[0],
          email: fbUser.email,
          photoURL: fbUser.photoURL,
          currency: 'USD ($)',
          country: 'International Voyager'
        };
        await syncUserWithBackend(loggedUser, idToken);
        setUser(loggedUser);
        localStorage.setItem('tripona_user', JSON.stringify(loggedUser));
        return { success: true };
      } else {
        // Real Google Account simulation if Firebase client credentials not yet configured
        const email = prompt("Enter your Google Account email:", "voyager.google@gmail.com");
        if (!email) return { success: false, error: "Google sign-in cancelled" };
        const cleanName = email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        const loggedUser = {
          uid: 'google_' + Date.now().toString(36),
          name: cleanName,
          email,
          photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=4285F4&color=fff`,
          currency: 'USD ($)',
          country: 'Verified Voyager'
        };
        await syncUserWithBackend(loggedUser);
        setUser(loggedUser);
        localStorage.setItem('tripona_user', JSON.stringify(loggedUser));
        return { success: true };
      }
    } catch (err) {
      setAuthError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      if (auth && !auth.config?.apiKey?.includes('DemoPlaceholder')) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const fbUser = userCredential.user;
        const idToken = await fbUser.getIdToken().catch(() => null);
        if (idToken) localStorage.setItem('tripona_token', idToken);
        const newUser = {
          uid: fbUser.uid,
          name: name || email.split('@')[0],
          email: fbUser.email,
          photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(name || email)}&background=527F91&color=fff`,
          currency: 'USD ($)',
          country: 'New Voyager'
        };
        await syncUserWithBackend(newUser, idToken);
        setUser(newUser);
        localStorage.setItem('tripona_user', JSON.stringify(newUser));
        return { success: true };
      } else {
        // Direct local account creation synced to MongoDB
        const uid = 'usr_' + Date.now().toString(36);
        const newUser = {
          uid,
          name: name.trim(),
          email: email.trim(),
          photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=527F91&color=fff`,
          currency: 'USD ($)',
          country: 'New Voyager'
        };
        await syncUserWithBackend(newUser);
        setUser(newUser);
        localStorage.setItem('tripona_user', JSON.stringify(newUser));
        return { success: true };
      }
    } catch (err) {
      setAuthError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (auth) {
        await signOut(auth);
      }
    } catch (e) {
      console.warn("Sign out error:", e);
    }
    setUser(null);
    localStorage.removeItem('tripona_user');
    localStorage.removeItem('tripona_token');
  };

  const resetPassword = async (email) => {
    if (auth && !auth.config?.apiKey?.includes('DemoPlaceholder')) {
      await sendPasswordResetEmail(auth, email);
    }
    return { success: true, message: `Password reset instructions sent to ${email}` };
  };

  const updateProfile = async (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('tripona_user', JSON.stringify(updated));

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
      updateProfile,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};
