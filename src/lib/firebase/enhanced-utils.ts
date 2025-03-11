import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  QuerySnapshot,
  DocumentData,
  getDocs,
  Timestamp,
  QueryConstraint,
  doc,
  DocumentSnapshot
} from 'firebase/firestore';
import { db } from './index';
import type { Event, Booking, ChatMessage, User } from './types';

// Enhanced pagination utilities
interface PaginationResult<T> {
  items: T[];
  lastDoc: DocumentData | null;
  hasMore: boolean;
}

// Enhanced Events Queries
export const getEventsWithPagination = async (
  filters: {
    skillLevel?: Event['skillLevel'];
    type?: Event['type'];
    startDate?: Date;
    endDate?: Date;
  },
  pageSize: number = 10,
  lastDoc?: DocumentData
): Promise<PaginationResult<Event>> => {
  const constraints: QueryConstraint[] = [];
  
  if (filters.skillLevel) {
    constraints.push(where('skillLevel', '==', filters.skillLevel));
  }
  if (filters.type) {
    constraints.push(where('type', '==', filters.type));
  }
  if (filters.startDate) {
    constraints.push(where('date', '>=', Timestamp.fromDate(filters.startDate)));
  }
  if (filters.endDate) {
    constraints.push(where('date', '<=', Timestamp.fromDate(filters.endDate)));
  }
  
  constraints.push(orderBy('date', 'asc'));
  constraints.push(limit(pageSize + 1)); // Get one extra to check if there are more

  if (lastDoc) {
    constraints.push(startAfter(lastDoc));
  }

  const eventsQuery = query(collection(db, 'events'), ...constraints);
  const snapshot = await getDocs(eventsQuery);
  const events = snapshot.docs.slice(0, pageSize).map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Event));

  return {
    items: events,
    lastDoc: snapshot.docs[pageSize - 1] || null,
    hasMore: snapshot.docs.length > pageSize
  };
};

// Real-time event updates
export const subscribeToEventUpdates = (
  eventId: string,
  callback: (event: Event) => void
) => {
  const eventRef = doc(db, 'events', eventId);
  return onSnapshot(eventRef, (docSnapshot: DocumentSnapshot) => {
    if (docSnapshot.exists()) {
      callback({ id: docSnapshot.id, ...docSnapshot.data() } as Event);
    }
  });
};

// Enhanced Chat Queries
export const getChatMessagesWithPagination = async (
  roomId: string,
  pageSize: number = 20,
  lastDoc?: DocumentData
): Promise<PaginationResult<ChatMessage>> => {
  const constraints = [
    orderBy('createdAt', 'desc'),
    limit(pageSize + 1)
  ];

  const baseQuery = query(
    collection(db, `chatRooms/${roomId}/messages`),
    orderBy('createdAt', 'desc')
  );

  const finalConstraints = [
    ...constraints,
    ...(lastDoc ? [startAfter(lastDoc)] : [])
  ];

  const messagesQuery = query(baseQuery, ...finalConstraints);

  const snapshot = await getDocs(messagesQuery);
  const maxMessages = Math.min(pageSize, snapshot.docs.length);
  const messages = snapshot.docs.slice(0, maxMessages).map(doc => ({
    id: doc.id,
    ...doc.data()
  } as ChatMessage));

  return {
    items: messages.reverse(), // Reverse to show oldest first
    lastDoc: snapshot.docs[pageSize - 1] || null,
    hasMore: snapshot.docs.length > pageSize
  };
};

// Real-time chat subscription
export const subscribeToMessages = (roomId: string, messageLimit: number, callback: (messages: ChatMessage[]) => void) => {
  const messagesQuery = query(
    collection(db, `chatRooms/${roomId}/messages`),
    orderBy('createdAt', 'desc'),
    limit(messageLimit)
  );

  return onSnapshot(messagesQuery, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ChatMessage)).reverse();
    callback(messages);
  });
};

// Enhanced Booking Queries
export const getUserBookingsWithPagination = async (
  userId: string,
  status?: Booking['status'],
  pageSize: number = 10,
  lastDoc?: DocumentData
): Promise<PaginationResult<Booking>> => {
  const constraints: QueryConstraint[] = [
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(pageSize + 1)
  ];

  if (status) {
    constraints.push(where('status', '==', status));
  }

  if (lastDoc) {
    constraints.push(startAfter(lastDoc));
  }

  const bookingsQuery = query(collection(db, 'bookings'), ...constraints);
  const snapshot = await getDocs(bookingsQuery);
  const bookings = snapshot.docs.slice(0, pageSize).map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Booking));

  return {
    items: bookings,
    lastDoc: snapshot.docs[pageSize - 1] || null,
    hasMore: snapshot.docs.length > pageSize
  };
};

// Analytics Utilities
export interface EventAnalytics {
  totalEvents: number;
  upcomingEvents: number;
  totalBookings: number;
  popularSkillLevels: Record<string, number>;
}

export const getEventAnalytics = async (): Promise<EventAnalytics> => {
  const eventsQuery = query(collection(db, 'events'));
  const bookingsQuery = query(collection(db, 'bookings'));
  
  const [eventsSnapshot, bookingsSnapshot] = await Promise.all([
    getDocs(eventsQuery),
    getDocs(bookingsQuery)
  ]);

  const now = new Date();
  const popularSkillLevels: Record<string, number> = {};
  let upcomingEvents = 0;

  eventsSnapshot.docs.forEach(doc => {
    const event = doc.data();
    const eventDate = event.date.toDate();
    if (eventDate > now) {
      upcomingEvents++;
    }
    
    const skillLevel = event.skillLevel;
    popularSkillLevels[skillLevel] = (popularSkillLevels[skillLevel] || 0) + 1;
  });

  return {
    totalEvents: eventsSnapshot.size,
    upcomingEvents,
    totalBookings: bookingsSnapshot.size,
    popularSkillLevels
  };
};

// User Management Utilities
export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  usersByRole: Record<string, number>;
}

export const getUserStats = async (): Promise<UserStats> => {
  const usersQuery = query(collection(db, 'users'));
  const snapshot = await getDocs(usersQuery);
  
  const usersByRole: Record<string, number> = {};
  let activeUsers = 0;

  snapshot.docs.forEach(doc => {
    const user = doc.data() as User;
    usersByRole[user.role] = (usersByRole[user.role] || 0) + 1;
    
    // Consider a user active if they have logged in within the last 30 days
    const lastLoginAt = (user as any).lastLoginAt;
  const lastLogin = lastLoginAt?.toDate?.() || new Date(0);
    const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
    if (Date.now() - lastLogin.getTime() < thirtyDaysInMs) {
      activeUsers++;
    }
  });

  return {
    totalUsers: snapshot.size,
    activeUsers,
    usersByRole
  };
};
