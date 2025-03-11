'use client';

import { useState, useEffect } from 'react';
import { getEvents } from '@/lib/firebase/utils';
import type { Event } from '@/lib/firebase/types';
import EventFilters from '@/components/admin/EventFilters';
import type { FilterValues } from '@/components/admin/EventFilters';

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const allEvents = await getEvents();
      setEvents(allEvents);
      setFilteredEvents(allEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filters: FilterValues) => {
    let filtered = [...events];

    // Apply search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        event =>
          event.title.toLowerCase().includes(searchLower) ||
          event.location.toLowerCase().includes(searchLower)
      );
    }

    // Apply type filter
    if (filters.type && filters.type !== 'all') {
      filtered = filtered.filter(event => event.type === filters.type);
    }

    // Apply skill level filter
    if (filters.skillLevel && filters.skillLevel !== 'all') {
      filtered = filtered.filter(event => event.skillLevel === filters.skillLevel);
    }

    // Apply date range filter
    if (filters.startDate) {
      filtered = filtered.filter(event => event.date >= filters.startDate);
    }
    if (filters.endDate) {
      filtered = filtered.filter(event => event.date <= filters.endDate);
    }

    // Apply sorting
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        switch (filters.sortBy) {
          case 'date':
            return a.date.localeCompare(b.date);
          case 'title':
            return a.title.localeCompare(b.title);
          case 'attendees':
            return (b.currentAttendees || 0) - (a.currentAttendees || 0);
          default:
            return 0;
        }
      });
    }

    setFilteredEvents(filtered);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900">Upcoming Events</h1>
          <p className="mt-2 text-sm text-gray-600">
            Browse and register for upcoming crochet classes and workshops
          </p>
        </div>

        <div className="mt-6">
          <EventFilters onFilterChange={handleFilterChange} />
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300"
            >
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">{event.title}</h3>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    event.currentAttendees >= event.maxAttendees
                      ? 'bg-red-100 text-red-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {event.currentAttendees >= event.maxAttendees ? 'Full' : 'Available'}
                  </span>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-500 line-clamp-2">{event.description}</p>
                </div>
                <div className="mt-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {event.date.toDate().toLocaleDateString()}
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {event.location}
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    {event.skillLevel}
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-900">
                    ${event.price}
                  </span>
                  <button
                    onClick={() => window.location.href = `/events/${event.id}`}
                    disabled={event.currentAttendees >= event.maxAttendees}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white 
                      ${event.currentAttendees >= event.maxAttendees
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
                      }`}
                  >
                    {event.currentAttendees >= event.maxAttendees ? 'Sold Out' : 'Register Now'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <h3 className="mt-2 text-sm font-medium text-gray-900">No events found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your filters to find more events.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 