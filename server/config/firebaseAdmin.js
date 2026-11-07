import admin from 'firebase-admin';
import dotenv from 'dotenv';
dotenv.config();

let isFirebaseAdminInitialized = false;

try {
  const apps = admin.apps || [];
  if (apps.length === 0) {
    const projectId = process.env.FIREBASE_PROJECT_ID || 'tripona-travel';

    if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      // Full service account credential mode
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        })
      });
    } else {
      // Project-ID only mode — public key token verification still works
      admin.initializeApp({ projectId });
    }
    isFirebaseAdminInitialized = true;
  } else {
    isFirebaseAdminInitialized = true;
  }
} catch (error) {
  console.warn('⚠️ Firebase Admin initialization notice:', error.message);
}

export { admin, isFirebaseAdminInitialized };
export default admin;
