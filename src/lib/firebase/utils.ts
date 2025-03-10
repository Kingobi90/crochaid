import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  serverTimestamp,
  setDoc,
  Firestore,
} from 'firebase/firestore';
import { Auth } from 'firebase/auth';
import { auth as firebaseAuth, db as firebaseDb } from './index';

// Type-safe references to Firebase services
const auth: Auth = firebaseAuth;
const db: Firestore = firebaseDb;

// Error handling helper
const handleFirebaseError = (error: any, operation: string) => {
  console.error(`Error during ${operation}:`, error);
  if (error.code) {
    switch (error.code) {
      case 'permission-denied':
        throw new Error('You do not have permission to perform this action');
      case 'not-found':
        throw new Error('The requested resource was not found');
      case 'already-exists':
        throw new Error('This resource already exists');
      default:
        throw new Error(`Failed to ${operation}. Please try again.`);
    }
  }
  throw error;
};
import type { User, Event, Booking, ChatMessage, ChatRoom } from './types';

// User Operations
export const createUser = async (userId: string, userData: Omit<User, 'id'>) => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      ...userData,
      createdAt: serverTimestamp(),
      role: 'user',
    });
  } catch (error) {
    console.error('Error creating user in Firestore:', error);
    throw new Error('Failed to create user profile');
  }
};

export const getUser = async (userId: string): Promise<User | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return null;
    
    const data = userSnap.data();
    return {
      id: userSnap.id,
      email: data.email,
      displayName: data.displayName,
      role: data.role,
      createdAt: data.createdAt,
      lastLoginAt: data.lastLoginAt,
      photoURL: data.photoURL,
      skillLevel: data.skillLevel
    } as User;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
};

// Event Operations
export const createEvent = async (eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => {
  const eventsRef = collection(db, 'events');
  return addDoc(eventsRef, {
    ...eventData,
    currentAttendees: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const getEvents = async (filters?: {
  skillLevel?: Event['skillLevel'];
  type?: Event['type'];
  tutorId?: string;
}): Promise<Event[]> => {
  const eventsRef = collection(db, 'events');
  let queryConstraints: any[] = [];
  
  if (filters) {
    if (filters.skillLevel) {
      queryConstraints.push(where('skillLevel', '==', filters.skillLevel));
    }
    if (filters.type) {
      queryConstraints.push(where('type', '==', filters.type));
    }
    if (filters.tutorId) {
      queryConstraints.push(where('tutorId', '==', filters.tutorId));
    }
  }

  const eventsQuery = query(eventsRef, ...queryConstraints);
  const eventsSnap = await getDocs(eventsQuery);
  return eventsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
};

export const deleteEvent = async (eventId: string): Promise<void> => {
  try {
    const eventRef = doc(db, 'events', eventId);
    await deleteDoc(eventRef);
    console.log('Successfully deleted event:', eventId);
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};

// Booking Operations
export const createBooking = async (bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
  const bookingsRef = collection(db, 'bookings');
  return addDoc(bookingsRef, {
    ...bookingData,
    status: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const getUserBookings = async (userId: string): Promise<Booking[]> => {
  const bookingsQuery = query(
    collection(db, 'bookings'),
    where('userId', '==', userId)
  );
  const bookingsSnap = await getDocs(bookingsQuery);
  return bookingsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
};

// Chat Operations
export const createChatRoom = async (participants: string[]): Promise<string> => {
  const chatRoomsRef = collection(db, 'chatRooms');
  const roomDoc = await addDoc(chatRoomsRef, {
    participants,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return roomDoc.id;
};

export const sendMessage = async (
  roomId: string,
  message: Omit<ChatMessage, 'id' | 'createdAt' | 'readAt'>
) => {
  const messagesRef = collection(db, `chatRooms/${roomId}/messages`);
  return addDoc(messagesRef, {
    ...message,
    createdAt: serverTimestamp(),
  });
};

export const getChatMessages = async (roomId: string): Promise<ChatMessage[]> => {
  const messagesRef = collection(db, `chatRooms/${roomId}/messages`);
  const messagesSnap = await getDocs(messagesRef);
  return messagesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage));
};

// Admin Operations
export const getAllUsers = async (): Promise<User[]> => {
  const usersSnap = await getDocs(collection(db, 'users'));
  return usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
};

export const updateUserRole = async (userId: string, role: User['role']) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, { role });
};

export const makeUserAdmin = async (userId: string): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, { 
    role: 'admin'
  });
  console.log('Successfully updated user to admin role');
};

// Helper function to convert Firestore Timestamp to Date
export const timestampToDate = (timestamp: Timestamp): Date => {
  return timestamp.toDate();
};

// Auth helper functions
export const signOutUser = async () => {
  await auth.signOut();
  // Clear any auth-related cookies or local storage here if needed
  document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
};
