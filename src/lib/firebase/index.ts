import { initializeApp, getApps, FirebaseApp, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, Auth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

// Function to check if Firebase is already initialized
const isFirebaseInitialized = () => {
  try {
    getApp();
    return true;
  } catch {
    return false;
  }
};

// Validate Firebase config
const validateConfig = () => {
  if (!firebaseConfig.apiKey) throw new Error('Missing Firebase API Key');
  if (!firebaseConfig.authDomain) throw new Error('Missing Firebase Auth Domain');
  if (!firebaseConfig.projectId) throw new Error('Missing Firebase Project ID');
  if (!firebaseConfig.storageBucket) throw new Error('Missing Firebase Storage Bucket');
  if (!firebaseConfig.messagingSenderId) throw new Error('Missing Firebase Messaging Sender ID');
  if (!firebaseConfig.appId) throw new Error('Missing Firebase App ID');
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

try {
  // Validate Firebase configuration
  validateConfig();

  // Initialize Firebase only if it hasn't been initialized
  if (!isFirebaseInitialized()) {
    console.log('Initializing Firebase with config:', {
      authDomain: firebaseConfig.authDomain,
      projectId: firebaseConfig.projectId
    });
    app = initializeApp(firebaseConfig);
  } else {
    console.log('Firebase already initialized, retrieving existing app');
    app = getApp();
  }
  
  // Initialize Auth
  auth = getAuth(app);
  
  // Initialize Firestore
  db = getFirestore(app);
  
  // Log successful initialization
  console.log('Firebase Config:', {
    apiKey: firebaseConfig.apiKey ? '[SET]' : '[NOT SET]',
    authDomain: firebaseConfig.authDomain ? '[SET]' : '[NOT SET]',
    projectId: firebaseConfig.projectId ? '[SET]' : '[NOT SET]',
    storageBucket: firebaseConfig.storageBucket ? '[SET]' : '[NOT SET]',
    messagingSenderId: firebaseConfig.messagingSenderId ? '[SET]' : '[NOT SET]',
    appId: firebaseConfig.appId ? '[SET]' : '[NOT SET]'
  });
  console.log('Firebase services initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase:', error);
  throw new Error('Failed to initialize Firebase. Please check your configuration and environment variables.');
}

export { app, auth, db };
