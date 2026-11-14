import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';

// Real Firebase configuration for TRIPONA
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCyaPykGl46m-QKIkYZ8_BVNQUhso_WaQM",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "tripona-cf1c6.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "tripona-cf1c6",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "tripona-cf1c6.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "65805959142",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:65805959142:web:a78cd58a54017bb52e2027",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-HFLBR8F7RB"
};

let app;
let auth;
let googleProvider;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({ prompt: 'select_account' });
} catch (err) {
  console.warn("Firebase initialization warning:", err.message);
}

export { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
  firebaseConfig
};
