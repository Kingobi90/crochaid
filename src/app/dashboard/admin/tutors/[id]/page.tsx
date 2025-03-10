'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, getEvents } from '@/lib/firebase/utils';
import type { User, Event } from '@/lib/firebase/types';
import DashboardLayout from '@/components/ui/DashboardLayout';

export default function TutorSchedulePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [tutor, setTutor] = useState<User | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [tutorData, allEvents] = await Promise.all([
          getUser(params.id),
          getEvents({ tutorId: params.id })
        ]);

        if (!tutorData || tutorData.role !== 'tutor') {
          alert('Tutor not found');
          router.push('/dashboard/admin/tutors');
          return;
        }

        setTutor(tutorData);
        setEvents(allEvents);
      } catch (error) {
        console.error('Error fetching tutor data:', error);
        alert('Failed to fetch tutor details');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [params.id, router]);

  const groupEventsByMonth = () => {
    const grouped = events.reduce((acc, event) => {
      const date = event.date.toDate();
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      if (!acc[monthKey]) {
        acc[monthKey] = [];
      }
      acc[monthKey].push(event);
      return acc;
    }, {} as Record<string, Event[]>);

    // Sort events within each month
    Object.keys(grouped).forEach(key => {
      grouped[key].sort((a, b) => a.date.toMillis() - b.date.toMillis());
    });

    return grouped;
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

  if (!tutor) {
    return null;
  }

  const groupedEvents = groupEventsByMonth();

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">Tutor Schedule</h1>
            <button
              onClick={() => router.back()}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Back to Tutors
            </button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <div className="flex items-center">
                  {tutor.photoURL ? (
                    <img
                      className="h-12 w-12 rounded-full"
                      src={tutor.photoURL}
                      alt=""
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-primary-600 font-medium text-lg">
                        {tutor.displayName[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="ml-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {tutor.displayName}
                    </h3>
                    <p className="text-sm text-gray-500">{tutor.email}</p>
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <div className="space-y-8">
                  {Object.entries(groupedEvents).length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No scheduled events</p>
                  ) : (
                    Object.entries(groupedEvents).map(([monthKey, monthEvents]) => {
                      const [year, month] = monthKey.split('-');
                      const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'long' });
                      return (
                        <div key={monthKey}>
                          <h4 className="text-lg font-medium text-gray-900 mb-4">
                            {monthName} {year}
                          </h4>
                          <div className="bg-gray-50 rounded-lg overflow-hidden">
                            <ul className="divide-y divide-gray-200">
                              {monthEvents.map((event) => (
                                <li key={event.id} className="px-4 py-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <h5 className="text-sm font-medium text-gray-900">
                                        {event.title}
                                      </h5>
                                      <div className="mt-1">
                                        <p className="text-sm text-gray-500">
                                          {event.date.toDate().toLocaleString()} • {event.type} • {event.skillLevel}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                          Location: {event.location}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="ml-4">
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        {event.currentAttendees}/{event.maxAttendees} Attendees
                                      </span>
                                    </div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 