'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/ui/DashboardLayout';
import Calendar from '@/components/events/Calendar';
import { useAuth } from '@/lib/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Event, User } from '@/lib/firebase/types';

type Auth = {
  user: any;
  userData: User | null;
  loading: boolean;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, userData, loading } = useAuth() as unknown as Auth;
  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  // Handle authentication and role-based routing
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login');
      } else if (userData?.role === 'admin') {
        router.replace('/dashboard/admin');
      }
    }
  }, [loading, user, userData, router]);

  // Fetch events
  useEffect(() => {
    async function fetchEvents() {
      if (!user || !userData) return;
      
      try {
        setLoadingEvents(true);
        const eventsRef = collection(db, 'events');
        const eventsQuery = query(
          eventsRef,
          where('skillLevel', '==', userData.skillLevel || 'beginner')
        );
        
        const querySnapshot = await getDocs(eventsQuery);
        const eventsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Event[];
        
        setEvents(eventsList);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoadingEvents(false);
      }
    }
    
    fetchEvents();
  }, [user, userData]);

  // Show loading state
  if (loading || !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-900" />
      </div>
    );
  }

  // Show role-specific message
  console.log('Current user role:', userData.role);

  return (
    <DashboardLayout>
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Welcome, {userData.displayName || 'Crocheter'}!
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Your Upcoming Events</h2>
            {loadingEvents ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-900" />
              </div>
            ) : (
              <Calendar events={events} />
            )}
          </div>
          
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => router.push('/dashboard/events')}
                className="block p-6 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
              >
                <h3 className="font-medium text-primary-900">Book Event</h3>
                <p className="text-sm text-primary-700 mt-1">
                  Schedule a new crochet session
                </p>
              </button>
              <button
                onClick={() => router.push('/dashboard/chat')}
                className="block p-6 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
              >
                <h3 className="font-medium text-primary-900">Chat with Tutor</h3>
                <p className="text-sm text-primary-700 mt-1">
                  Get help with your project
                </p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
