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

// Explicitly access keys from import.meta.env to ensure Vite performs static replacement.
// Use optional chaining to prevent runtime errors if import.meta.env is undefined.
// We cast import.meta to any to avoid TypeScript errors when vite/client types are missing.
const env = (import.meta as any).env;

const apiKey = env?.VITE_FIREBASE_API_KEY;
const projectId = env?.VITE_FIREBASE_PROJECT_ID;
const authDomain = env?.VITE_FIREBASE_AUTH_DOMAIN;
const storageBucket = env?.VITE_FIREBASE_STORAGE_BUCKET;
const messagingSenderId = env?.VITE_FIREBASE_MESSAGING_SENDER_ID;
const appId = env?.VITE_FIREBASE_APP_ID;

const isConfigured = !!(apiKey && projectId && appId);

const firebaseConfig = {
  apiKey,
  authDomain,
  projectId,
  storageBucket,
  messagingSenderId,
  appId
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
  console.warn("⚠️ Firebase configuration missing or incomplete. App running in Local Storage Demo Mode.");
  console.log("Debug Info - Environment Variables Status:", {
      apiKeyFound: !!apiKey,
      projectIdFound: !!projectId,
      appIdFound: !!appId,
      // Log masked values for verification
      apiKeyMasked: apiKey ? `${apiKey.substring(0, 5)}...` : 'missing',
      projectId: projectId || 'missing'
  });
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