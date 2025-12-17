import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Determine environment prefix based on build tool
// Vite uses VITE_, Create React App uses REACT_APP_
const getEnvVar = (name: string): string => {
  // Try Vite prefix first (for Vite projects)
  // @ts-ignore - import.meta.env is available in Vite
  const viteEnv = typeof import.meta !== 'undefined' && import.meta.env;
  if (viteEnv) {
    const viteValue = viteEnv[`VITE_${name}`];
    if (viteValue) return viteValue;
  }
  
  // Fallback to CRA prefix (for Create React App projects)
  const craValue = typeof process !== 'undefined' && process.env?.[`REACT_APP_${name}`];
  if (craValue) return craValue;
  
  throw new Error(
    `Missing required environment variable: ${name}. ` +
    `Please set VITE_${name} (for Vite) or REACT_APP_${name} (for CRA) in your .env.local file.`
  );
};

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: getEnvVar('FIREBASE_API_KEY'),
  authDomain: getEnvVar('FIREBASE_AUTH_DOMAIN'),
  projectId: getEnvVar('FIREBASE_PROJECT_ID'),
  storageBucket: getEnvVar('FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnvVar('FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnvVar('FIREBASE_APP_ID'),
};

// Initialize Firebase app (only if not already initialized)
let firebaseApp: FirebaseApp;
if (getApps().length === 0) {
  firebaseApp = initializeApp(firebaseConfig);
} else {
  firebaseApp = getApps()[0];
}

// Initialize Firebase services
export const auth: Auth = getAuth(firebaseApp);
export const db: Firestore = getFirestore(firebaseApp);
export const storage: FirebaseStorage = getStorage(firebaseApp);

// Export the app instance as well
export { firebaseApp };

