'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getUser, createUser } from '../firebase/utils';
import type { User } from '../firebase/types';
import { useRouter } from 'next/navigation';

export type AuthContextType = {
  user: FirebaseUser | null;
  userData: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const defaultContext = {
  user: null,
  userData: null,
  loading: true,
  signIn: async () => {},
  signInWithGoogle: async () => {},
  signUp: async () => {},
  signOut: async () => {},
} as const;

export const AuthContext = createContext<AuthContextType>(defaultContext);

export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    console.log('Setting up auth state listener...');
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user ? 'User authenticated' : 'No user');
      setUser(user);
      
      if (user) {
        try {
          console.log('Fetching user data for:', user.uid);
          const userDoc = await getUser(user.uid);
          console.log('User data fetched:', userDoc);
          setUserData(userDoc);
          
          // Navigate based on role
          if (userDoc?.role === 'admin') {
            console.log('Admin user detected, navigating to admin dashboard');
            router.push('/dashboard/admin');
          } else {
            console.log('Regular user detected, navigating to dashboard');
            router.push('/dashboard');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        console.log('No user, clearing user data');
        setUserData(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('Sign in successful:', {
        uid: result.user.uid,
        email: result.user.email
      });
      
      // Fetch user data immediately after sign in
      const userDoc = await getUser(result.user.uid);
      setUserData(userDoc);
      
      // Navigation will be handled by the auth state change listener
    } catch (error: any) {
      console.error('Error signing in:', error);
      if (error.code === 'auth/wrong-password') {
        throw new Error('Incorrect password');
      } else if (error.code === 'auth/user-not-found') {
        throw new Error('No account found with this email');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address');
      } else {
        throw new Error('Failed to sign in. Please try again.');
      }
    }
  };

  const signInWithGoogle = async (): Promise<void> => {
    try {
      console.log('Starting Google sign-in process...');
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      console.log('Initiating Google popup...');
      const result = await signInWithPopup(auth, provider);
      const { user: firebaseUser } = result;
      
      console.log('Google Sign-in successful:', {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        isNewUser: result.additionalUserInfo?.isNewUser
      });
      
      // Check if user exists in Firestore
      console.log('Checking if user exists in Firestore...');
      let userDoc = await getUser(firebaseUser.uid);
      
      // If user doesn't exist, create a new record
      if (!userDoc) {
        console.log('Creating new user record in Firestore...');
        const newUserData = {
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '',
          role: 'user' as const,
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
          photoURL: firebaseUser.photoURL || undefined,
          skillLevel: 'beginner' as const
        };
        await createUser(firebaseUser.uid, newUserData);
        console.log('New user record created successfully');
        userDoc = await getUser(firebaseUser.uid);
      } else {
        console.log('Existing user found:', userDoc);
      }
      
      // Set user data in state
      if (userDoc) {
        console.log('Setting user data in state:', userDoc);
        setUserData(userDoc);
        // Navigation will be handled by the auth state change listener
      }
    } catch (error: any) {
      console.error('Error signing in with Google:', {
        code: error.code,
        message: error.message,
        fullError: error
      });
      if (error.code === 'auth/popup-blocked') {
        throw new Error('Please enable popups for this website to use Google Sign-in');
      } else if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Google Sign-in was cancelled. Please try again.');
      } else if (error.code === 'auth/unauthorized-domain') {
        throw new Error('This domain is not authorized for Google Sign-in. Please contact support.');
      } else {
        throw new Error('Failed to sign in with Google. Please try again.');
      }
    }
  };

  const signUp = async (email: string, password: string): Promise<void> => {
    try {
      // First create the Firebase auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { user: firebaseUser } = userCredential;
      
      // Create the initial user data
      const userData = {
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || email.split('@')[0],
        role: 'user' as const,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        photoURL: firebaseUser.photoURL || undefined,
        skillLevel: 'beginner' as const
      };
      
      // Create user document in Firestore
      await createUser(firebaseUser.uid, userData);
      
      // Fetch the created user to ensure we have the correct data
      const createdUser = await getUser(firebaseUser.uid);
      if (createdUser) {
        setUserData(createdUser);
        // Navigation will be handled by the auth state change listener
      }
    } catch (error: any) {
      console.error('Error signing up:', error);
      // Delete the auth user if Firestore creation fails
      if (auth.currentUser) {
        await auth.currentUser.delete();
      }
      if (error.code === 'auth/weak-password') {
        throw new Error('Password should be at least 6 characters');
      } else if (error.code === 'auth/email-already-in-use') {
        throw new Error('Email already in use');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address');
      } else {
        throw new Error(error.message || 'Failed to sign up. Please try again.');
      }
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const contextValue: AuthContextType = {
    user,
    userData,
    loading,
    signIn,
    signInWithGoogle,
    signUp,
    signOut
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

