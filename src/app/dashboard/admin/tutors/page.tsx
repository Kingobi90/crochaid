'use client';

import { useState, useEffect } from 'react';
import { getAllUsers, getEvents } from '@/lib/firebase/utils';
import type { User, Event } from '@/lib/firebase/types';
import DashboardLayout from '@/components/ui/DashboardLayout';

export default function TutorManagementPage() {
  const [tutors, setTutors] = useState<User[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [allUsers, allEvents] = await Promise.all([
          getAllUsers(),
          getEvents()
        ]);
        
        setTutors(allUsers.filter(user => user.role === 'tutor'));
        setEvents(allEvents);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const getTutorEvents = (tutorId: string) => {
    return events.filter(event => event.tutorId === tutorId);
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
          <h1 className="text-2xl font-semibold text-gray-900">Tutor Management</h1>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Active Tutors
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  View and manage tutor assignments
                </p>
              </div>
              <div className="border-t border-gray-200">
                {tutors.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-gray-500">No tutors found</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {tutors.map((tutor) => {
                      const tutorEvents = getTutorEvents(tutor.id);
                      return (
                        <li key={tutor.id} className="p-4">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              {tutor.photoURL ? (
                                <img
                                  className="h-12 w-12 rounded-full"
                                  src={tutor.photoURL}
                                  alt=""
                                />
                              ) : (
                                <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                                  <span className="text-primary-600 font-medium text-lg">
                                    {tutor.displayName?.[0]?.toUpperCase() || '?'}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {tutor.displayName}
                              </p>
                              <p className="text-sm text-gray-500 truncate">
                                {tutor.email}
                              </p>
                              <p className="text-sm text-gray-500">
                                Skill Level: {tutor.skillLevel}
                              </p>
                            </div>
                            <div className="flex-shrink-0">
                              <button
                                onClick={() => window.location.href = `/dashboard/admin/tutors/${tutor.id}`}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                              >
                                View Schedule
                              </button>
                            </div>
                          </div>
                          {tutorEvents.length > 0 && (
                            <div className="mt-4">
                              <h4 className="text-sm font-medium text-gray-900">Assigned Events</h4>
                              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                {tutorEvents.map((event) => (
                                  <div
                                    key={event.id}
                                    className="relative rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm hover:border-gray-400"
                                  >
                                    <div className="text-sm font-medium text-gray-900">
                                      {event.title}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {event.date.toDate().toLocaleDateString()}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 