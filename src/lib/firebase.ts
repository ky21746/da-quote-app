import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Firebase configuration from environment variables
// Create React App automatically injects REACT_APP_* variables at build time
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// Validate that all required config values are present
if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
  console.error('❌ Firebase configuration is incomplete:', {
    apiKey: firebaseConfig.apiKey ? 'present' : 'MISSING',
    authDomain: firebaseConfig.authDomain ? 'present' : 'MISSING',
    projectId: firebaseConfig.projectId ? 'present' : 'MISSING',
    storageBucket: firebaseConfig.storageBucket ? 'present' : 'MISSING',
    messagingSenderId: firebaseConfig.messagingSenderId ? 'present' : 'MISSING',
    appId: firebaseConfig.appId ? 'present' : 'MISSING',
  });
  throw new Error('Firebase configuration is incomplete. Check environment variables.');
}

console.log('✅ Firebase config loaded successfully');

// Initialize Firebase app (only if not already initialized)
let firebaseApp: FirebaseApp;
try {
  if (getApps().length === 0) {
    firebaseApp = initializeApp(firebaseConfig);
    console.log('✅ Firebase app initialized');
  } else {
    firebaseApp = getApps()[0];
    console.log('✅ Using existing Firebase app');
  }
} catch (error) {
  console.error('❌ Failed to initialize Firebase:', error);
  throw error;
}

// Initialize Firebase services
export const auth: Auth = getAuth(firebaseApp);
export const db: Firestore = getFirestore(firebaseApp);
export const storage: FirebaseStorage = getStorage(firebaseApp);

// Export the app instance as well
export { firebaseApp };

