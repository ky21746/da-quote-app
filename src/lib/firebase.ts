import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Determine environment prefix based on build tool
// Vite uses VITE_, Create React App uses REACT_APP_
const getEnvVar = (name: string): string => {
  // Check for CRA prefix first (since this is a CRA project)
  // In CRA, process.env is available at build time and injected into the bundle
  const envKey = `REACT_APP_${name}`;
  const craValue = process.env[envKey];
  if (craValue) return craValue;
  
  // Fallback to Vite prefix (for Vite projects)
  // Note: This code path won't execute in CRA, but kept for compatibility
  // @ts-ignore - import.meta.env is available in Vite but not in CRA
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const viteEnv = (globalThis as any).import?.meta?.env;
    if (viteEnv) {
      const viteValue = viteEnv[`VITE_${name}`];
      if (viteValue) return viteValue;
    }
  } catch {
    // Ignore - we're in CRA, not Vite
  }
  
  throw new Error(
    `Missing required environment variable: ${name}. ` +
    `Please set REACT_APP_${name} (for CRA) or VITE_${name} (for Vite) in your .env.local file.`
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

// Firestore collections
export const COLLECTIONS = {
  PRICING_CATALOG: 'pricingCatalog',
} as const;

