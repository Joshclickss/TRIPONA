import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
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

    const initAuth = async () => {
      // 1. Check Supabase session first if configured
      if (authService.isConfigured()) {
        const session = await authService.getSession();
        if (session?.user && isMounted) {
          const u = session.user;
          const formatted = {
            uid: u.id,
            id: u.id,
            email: u.email,
            name: u.user_metadata?.name || u.user_metadata?.full_name || u.email?.split('@')[0] || 'Voyager',
            photoURL: u.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.email?.split('@')[0] || 'User')}&background=527F91&color=fff`,
            country: 'International Voyager',
            currency: 'USD ($)',
            travelPreferences: []
          };
          setUser(formatted);
          localStorage.setItem('tripona_user', JSON.stringify(formatted));
          localStorage.setItem('tripona_token', session.access_token);
          setLoading(false);
          return;
        }

        // Listen for Supabase auth state changes
        authService.onAuthStateChange(async (event, session) => {
          if (session?.user && isMounted) {
            const u = session.user;
            const formatted = {
              uid: u.id,
              id: u.id,
              email: u.email,
              name: u.user_metadata?.name || u.user_metadata?.full_name || u.email?.split('@')[0] || 'Voyager',
              photoURL: u.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.email?.split('@')[0] || 'User')}&background=527F91&color=fff`,
              country: 'International Voyager',
              currency: 'USD ($)',
              travelPreferences: []
            };
            setUser(formatted);
            localStorage.setItem('tripona_user', JSON.stringify(formatted));
            localStorage.setItem('tripona_token', session.access_token);
          } else if (event === 'SIGNED_OUT' && isMounted) {
            setUser(null);
            localStorage.removeItem('tripona_user');
            localStorage.removeItem('tripona_token');
          }
        });
      }

      // 2. Firebase / Local fallback listener
      if (auth) {
        onAuthStateChanged(auth, async (firebaseUser) => {
          if (!isMounted) return;
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

            await syncUserWithBackend(formattedUser, idToken);
            setUser(formattedUser);
            localStorage.setItem('tripona_user', JSON.stringify(formattedUser));
          } else if (!authService.isConfigured()) {
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
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      if (authService.isConfigured()) {
        const { user: supUser, session } = await authService.login(email, password);
        if (session?.access_token) {
          localStorage.setItem('tripona_token', session.access_token);
        }
        setUser(supUser);
        localStorage.setItem('tripona_user', JSON.stringify(supUser));
        await syncUserWithBackend(supUser, session?.access_token);
        return { success: true };
      }

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
      if (authService.isConfigured()) {
        await authService.loginWithGoogle();
        return { success: true };
      }

      if (auth && !auth.config?.apiKey?.includes('DemoPlaceholder')) {
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
      if (authService.isConfigured()) {
        const { user: supUser, session } = await authService.register(name, email, password);
        if (session?.access_token) {
          localStorage.setItem('tripona_token', session.access_token);
        }
        if (supUser) {
          setUser(supUser);
          localStorage.setItem('tripona_user', JSON.stringify(supUser));
          await syncUserWithBackend(supUser, session?.access_token);
        }
        return { success: true };
      }

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
      if (authService.isConfigured()) {
        await authService.logout();
      }
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
    if (authService.isConfigured()) {
      return await authService.resetPassword(email);
    }
    if (auth && !auth.config?.apiKey?.includes('DemoPlaceholder')) {
      await sendPasswordResetEmail(auth, email);
    }
    return { success: true, message: `Password reset instructions sent to ${email}` };
  };

  const updateProfile = async (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('tripona_user', JSON.stringify(updated));

    if (authService.isConfigured() && user?.uid) {
      await authService.updateProfile(user.uid, updates);
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
      updateProfile,
      isAuthenticated: !!user,
      isCloudActive: authService.isConfigured()
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
