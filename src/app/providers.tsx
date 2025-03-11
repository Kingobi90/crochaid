'use client';

import { AuthProvider } from '@/lib/auth';
import { ReactNode, useEffect, useState } from 'react';
import { getApp } from 'firebase/app';
import { Toaster } from 'react-hot-toast';

export function Providers({ children }: { children: ReactNode }) {
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);

  useEffect(() => {
    try {
      // Check if Firebase is initialized
      const app = getApp();
      console.log('Firebase initialized successfully:', {
        projectId: app.options.projectId,
        authDomain: app.options.authDomain
      });
      setIsFirebaseReady(true);
    } catch (error) {
      console.error('Firebase initialization error:', error);
      setIsFirebaseReady(false);
    }
  }, []);

  if (!isFirebaseReady) {
    return <div>Loading...</div>;
  }

  return (
    <AuthProvider>
      <Toaster position="top-right" />
      {children}
    </AuthProvider>
  );
}
