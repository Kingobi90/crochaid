import { auth } from '../lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { createUser, makeUserAdmin } from '../lib/firebase/utils';
import { serverTimestamp } from 'firebase/firestore';

export async function createAdminUser(email: string, password: string) {
  try {
    // Create the Firebase auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const { user: firebaseUser } = userCredential;
    
    // Create initial user data
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
    
    // Update to admin role
    await makeUserAdmin(firebaseUser.uid);
    
    console.log('Admin user created successfully:', {
      uid: firebaseUser.uid,
      email: firebaseUser.email
    });
    
    return firebaseUser.uid;
  } catch (error: any) {
    console.error('Error creating admin user:', error);
    throw error;
  }
} 