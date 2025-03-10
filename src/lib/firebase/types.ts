import { Timestamp } from 'firebase/firestore';

export interface User {
  id: string;
  email: string;
  displayName?: string;
  role: 'user' | 'admin' | 'tutor';
  createdAt: any;
  lastLoginAt: any;
  photoURL?: string;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: any;
  location: string;
  type: string;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  price: number;
  currentAttendees: number;
  maxAttendees: number;
  tutorId?: string;
}

export interface Booking {
  id: string;
  eventId: string;
  userId: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  paymentId: string;
  amount: number;
  createdAt: any;
}

export type ChatRoom = {
  id: string;
  participants: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type ChatMessage = {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  createdAt: Timestamp;
  readAt?: Timestamp;
};
