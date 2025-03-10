'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth';
import type { Event } from '@/lib/firebase/types';
import { loadStripe } from '@stripe/stripe-js';
import { STRIPE_PUBLIC_KEY } from '@/lib/stripe/config';

// Initialize Stripe
const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

export default function EventDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingInProgress, setBookingInProgress] = useState(false);

  useEffect(() => {
    fetchEvent();
  }, []);

  const fetchEvent = async () => {
    try {
      const eventRef = doc(db, 'events', params.id);
      const eventSnap = await getDoc(eventRef);
      
      if (!eventSnap.exists()) {
        alert('Event not found');
        router.push('/events');
        return;
      }

      setEvent({ id: eventSnap.id, ...eventSnap.data() } as Event);
    } catch (error) {
      console.error('Error fetching event:', error);
      alert('Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!event) return;

    setBookingInProgress(true);

    try {
      // Create a checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: event.id,
          userId: user.uid,
          eventTitle: event.title,
          price: event.price,
        }),
      });

      const { sessionId } = await response.json();

      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({ sessionId });
        if (error) {
          throw error;
        }
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Failed to process booking. Please try again.');
    } finally {
      setBookingInProgress(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-900" />
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
                  <p className="mt-2 text-sm text-gray-600">
                    {event.type} • {event.skillLevel}
                  </p>
                </div>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                  event.currentAttendees >= event.maxAttendees
                    ? 'bg-red-100 text-red-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {event.currentAttendees >= event.maxAttendees ? 'Sold Out' : `${event.maxAttendees - event.currentAttendees} spots left`}
                </span>
              </div>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <h2 className="text-lg font-medium text-gray-900">Description</h2>
                  <p className="mt-1 text-sm text-gray-600">{event.description}</p>
                </div>

                <div>
                  <h2 className="text-lg font-medium text-gray-900">Event Details</h2>
                  <div className="mt-3 space-y-3">
                    <div className="flex items-center text-sm text-gray-500">
                      <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {event.date.toDate().toLocaleString()}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {event.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      {event.currentAttendees}/{event.maxAttendees} Attendees
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-medium text-gray-900">Prerequisites</h2>
                  <div className="mt-3">
                    <div className="flex items-center text-sm text-gray-500">
                      <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Skill Level: {event.skillLevel}
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      {event.skillLevel === 'beginner'
                        ? 'No prior experience needed'
                        : event.skillLevel === 'intermediate'
                        ? 'Basic crochet knowledge required'
                        : 'Advanced techniques knowledge required'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:px-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Price</p>
                  <p className="text-3xl font-bold text-gray-900">${event.price}</p>
                </div>
                <button
                  onClick={handleBooking}
                  disabled={event.currentAttendees >= event.maxAttendees || bookingInProgress}
                  className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white 
                    ${event.currentAttendees >= event.maxAttendees
                      ? 'bg-gray-400 cursor-not-allowed'
                      : bookingInProgress
                      ? 'bg-primary-400 cursor-wait'
                      : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
                    }`}
                >
                  {event.currentAttendees >= event.maxAttendees
                    ? 'Sold Out'
                    : bookingInProgress
                    ? 'Processing...'
                    : 'Book Now'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 