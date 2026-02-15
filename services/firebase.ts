import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where, 
  writeBatch 
} from 'firebase/firestore';

// Safely access environment variables.
// In some environments, import.meta.env might be undefined during initialization.
// We default to an empty object to prevent "Cannot read properties of undefined" errors.
const env = (import.meta as any).env || {};

const apiKey = env.VITE_FIREBASE_API_KEY;
const projectId = env.VITE_FIREBASE_PROJECT_ID;

const isConfigured = !!(apiKey && projectId);

const firebaseConfig = {
  apiKey: apiKey,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: projectId,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID
};

let app;
let dbInstance: any = null;

if (isConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    dbInstance = getFirestore(app);
    console.log("✅ Firebase initialized successfully");
  } catch (error) {
    console.error("❌ Firebase initialization error:", error);
  }
} else {
  // If we are missing keys, log helpful debug info to the console
  console.warn("⚠️ Firebase configuration missing. App running in Local Storage Demo Mode.");
  // Only log if we have a partial config to avoid noise in completely unconfigured envs
  if (apiKey || projectId) {
    console.log("Debug Info - Environment Variables Status:", {
        apiKeyFound: !!apiKey,
        projectIdFound: !!projectId,
    });
  }
}

export const db = dbInstance;
export const isFirebaseEnabled = !!dbInstance;

// Export common Firestore functions
export { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where, 
  writeBatch 
};