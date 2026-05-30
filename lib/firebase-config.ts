'use client';

import { initializeApp, FirebaseApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, getFirestore, memoryLocalCache, Firestore } from 'firebase/firestore';

// Firestore only needs API_KEY + PROJECT_ID (no DATABASE_URL)
const hasFirebaseConfig = !!(
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
);

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY            || '',
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN        || '',
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID         || '',
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET     || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID             || '',
};

let app: FirebaseApp | null = null;
let firestore: Firestore | null = null;
let isFirebaseInitialized = false;

if (hasFirebaseConfig) {
  try {
    // initializeFirestore(app, settings) throws if called a second time for the
    // same app instance (e.g. Next.js hot-reload re-evaluates this module while
    // the Firebase SDK's global app registry persists in browser memory).
    // Guard: only call initializeFirestore when the app is brand-new; for any
    // subsequent module evaluation use getFirestore which is idempotent.
    const isNewApp = getApps().length === 0;
    app = isNewApp ? initializeApp(firebaseConfig) : getApp();
    firestore = isNewApp
      ? initializeFirestore(app, { localCache: memoryLocalCache() })
      : getFirestore(app);
    isFirebaseInitialized = true;
    console.log('[firebase] Initialized — Firestore ready');
  } catch (error) {
    console.error('[firebase] Initialization error:', error);
    isFirebaseInitialized = false;
  }
}

export { firestore, isFirebaseInitialized };

// Kept for any legacy import — no longer used internally
export const database = null;
