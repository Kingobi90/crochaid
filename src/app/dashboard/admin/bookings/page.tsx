'use client';

import { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Booking, Event, User } from '@/lib/firebase/types';
import DashboardLayout from '@/components/ui/DashboardLayout';

type BookingWithDetails = Booking & {
  event?: Event;
  user?: User;
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      // Get all bookings
      const bookingsQuery = query(collection(db, 'bookings'));
      const bookingsSnap = await getDocs(bookingsQuery);
      const bookingsData = bookingsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BookingWithDetails[];

      // Get all events and users referenced in bookings
      const eventIds = Array.from(new Set(bookingsData.map(b => b.eventId)));
      const userIds = Array.from(new Set(bookingsData.map(b => b.userId)));

      const [eventsSnap, usersSnap] = await Promise.all([
        getDocs(query(collection(db, 'events'))),
        getDocs(query(collection(db, 'users')))
      ]);

      const events = new Map(
        eventsSnap.docs.map(doc => [doc.id, { id: doc.id, ...doc.data() }])
      );
      const users = new Map(
        usersSnap.docs.map(doc => [doc.id, { id: doc.id, ...doc.data() }])
      );

      // Combine booking data with event and user details
      const bookingsWithDetails = bookingsData.map(booking => ({
        ...booking,
        event: events.get(booking.eventId) as Event,
        user: users.get(booking.userId) as User
      }));

      setBookings(bookingsWithDetails);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (bookingId: string, newStatus: Booking['status']) => {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, {
        status: newStatus,
        updatedAt: new Date()
      });

      // If approved, increment currentAttendees
      if (newStatus === 'confirmed') {
        const booking = bookings.find(b => b.id === bookingId);
        if (booking?.event) {
          const eventRef = doc(db, 'events', booking.event.id);
          await updateDoc(eventRef, {
            currentAttendees: booking.event.currentAttendees + 1
          });
        }
      }

      // Refresh bookings
      fetchBookings();
    } catch (error) {
      console.error('Error updating booking status:', error);
      alert('Failed to update booking status');
    }
  };

  const getStatusBadgeColor = (status: Booking['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-900" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Booking Management</h1>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  All Bookings
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Manage event bookings and registrations
                </p>
              </div>
              <div className="border-t border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Event
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bookings.map((booking) => (
                      <tr key={booking.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {booking.event?.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {booking.event?.type} • {booking.event?.skillLevel}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {booking.user?.photoURL ? (
                              <img
                                className="h-8 w-8 rounded-full"
                                src={booking.user.photoURL}
                                alt=""
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                                <span className="text-primary-600 font-medium">
                                  {booking.user?.displayName?.[0]?.toUpperCase() || '?'}
                                </span>
                              </div>
                            )}
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {booking.user?.displayName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {booking.user?.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(booking.status)}`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {booking.createdAt.toDate().toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {booking.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleStatusChange(booking.id, 'confirmed')}
                                className="text-green-600 hover:text-green-900 mr-4"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleStatusChange(booking.id, 'cancelled')}
                                className="text-red-600 hover:text-red-900"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 