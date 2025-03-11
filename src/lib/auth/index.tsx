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
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';

// Cookie helper functions
const setCookie = (name: string, value: string, options: Record<string, any> = {}) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieOptions = {
    path: '/',
    ...options,
    // Only set secure in production
    ...(isProduction && { secure: true }),
    sameSite: isProduction ? 'Strict' : 'Lax'
  };

  const cookieString = Object.entries(cookieOptions).reduce((acc, [key, value]) => {
    if (value === true) return `${acc}; ${key}`;
    if (value === false) return acc;
    return `${acc}; ${key}=${value}`;
  }, `${name}=${value}`);

  document.cookie = cookieString;
  console.log('Setting cookie:', cookieString);
};

const clearCookie = (name: string) => {
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
};

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
  const searchParams = useSearchParams();

  // Set up auth state listener
  useEffect(() => {
    console.log('Setting up auth state listener...');
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user ? 'User authenticated' : 'No user');
      setLoading(true);
      
      if (user) {
        try {
          console.log('Fetching user data for:', user.uid);
          const userDoc = await getUser(user.uid);
          console.log('User data fetched:', userDoc);
          
          if (!userDoc) {
            console.error('No user document found');
            setUser(null);
            setUserData(null);
            setLoading(false);
            clearCookie('__session');
            toast.error('User data not found');
            return;
          }

          // Set auth token in cookie
          const token = await user.getIdToken();
          setCookie('__session', token, {
            maxAge: 3600,
            httpOnly: false // Allow client-side access for development
          });
          
          // Update state
          setUser(user);
          setUserData(userDoc);
          
          // Get the intended destination
          const from = searchParams?.get('from');
          
          // Show success message
          toast.success('Signed in successfully!');
          
          // Navigate based on role and intended destination
          if (userDoc.role === 'admin') {
            console.log('Admin user detected, navigating to admin dashboard');
            router.replace(from || '/dashboard/admin');
          } else {
            console.log('Regular user detected, navigating to dashboard');
            router.replace(from || '/dashboard');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Clear any stale data
          setUser(null);
          setUserData(null);
          clearCookie('__session');
          toast.error('Error fetching user data');
        }
      } else {
        console.log('No user, clearing user data and cookie');
        setUser(null);
        setUserData(null);
        clearCookie('__session');
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, searchParams]);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const result = await signInWithEmailAndPassword(auth, email, password);
      // Force token refresh
      const token = await result.user.getIdToken(true);
      setCookie('__session', token, {
        maxAge: 3600,
        httpOnly: false
      });
    } catch (error: any) {
      setLoading(false);
      toast.error(error.message || 'Failed to sign in');
      throw error;
    }
  };

  const signInWithGoogle = async (): Promise<void> => {
    try {
      setLoading(true);
      console.log('Starting Google sign-in process...');
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      console.log('Initiating Google popup...');
      const result = await signInWithPopup(auth, provider);
      // Force token refresh
      const token = await result.user.getIdToken(true);
      setCookie('__session', token, {
        maxAge: 3600,
        httpOnly: false
      });
    } catch (error: any) {
      setLoading(false);
      toast.error(error.message || 'Failed to sign in with Google');
      throw error;
    }
  };

  const signUp = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
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
      
      // Force token refresh and set cookie
      const token = await firebaseUser.getIdToken(true);
      setCookie('__session', token, {
        maxAge: 3600,
        httpOnly: false
      });
      
      toast.success('Account created successfully!');
    } catch (error: any) {
      console.error('Error signing up:', error);
      // Delete the auth user if Firestore creation fails
      if (auth.currentUser) {
        await auth.currentUser.delete();
      }
      setLoading(false);
      toast.error(error.message || 'Failed to create account');
      throw error;
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setLoading(true);
      await firebaseSignOut(auth);
      // Clear the session cookie immediately
      clearCookie('__session');
      toast.success('Signed out successfully');
      router.replace('/login');
    } catch (error: any) {
      setLoading(false);
      toast.error(error.message || 'Failed to sign out');
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

