'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, getEvents } from '@/lib/firebase/utils';
import type { User, Event } from '@/lib/firebase/types';

export default function TutorDetails({ id }: { id: string }) {
  const router = useRouter();
  const [tutor, setTutor] = useState<User | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTutorData = async () => {
      try {
        const tutorData = await getUser(id);
        if (tutorData) {
          setTutor(tutorData);
          const tutorEvents = await getEvents({ tutorId: id });
          setEvents(tutorEvents);
        }
      } catch (error) {
        console.error('Error fetching tutor data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTutorData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-900" />
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">Tutor not found</h2>
        <button
          onClick={() => router.back()}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
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
                    {tutor.displayName?.[0]?.toUpperCase() || '?'}
                  </span>
                </div>
              )}
              <div className="ml-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {tutor.displayName}
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  {tutor.email}
                </p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Role</dt>
                <dd className="mt-1 text-sm text-gray-900">{tutor.role}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Skill Level</dt>
                <dd className="mt-1 text-sm text-gray-900">{tutor.skillLevel}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Upcoming Events</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {events.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                      {events.map((event) => (
                        <li key={event.id} className="py-4">
                          <div className="flex space-x-3">
                            <div className="flex-1 space-y-1">
                              <h3 className="text-sm font-medium">{event.title}</h3>
                              <p className="text-sm text-gray-500">
                                {event.date?.toDate().toLocaleDateString()} at {event.location}
                              </p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No upcoming events</p>
                  )}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
} 