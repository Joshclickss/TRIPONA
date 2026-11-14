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
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBUuMfSbCFlKM4yLc3G0ogjpHh5YyNWUD4",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "triponaai.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "triponaai",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "triponaai.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "245608173688",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:245608173688:web:27ac957a1aada1f4bb1d8d",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-CYTYKVL0SS"
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
