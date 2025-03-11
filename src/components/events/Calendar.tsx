'use client';

import { useState } from 'react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';

import { Timestamp } from 'firebase/firestore';
import type { Event as FirebaseEvent } from '@/lib/firebase/types';

type Event = Omit<FirebaseEvent, 'createdAt' | 'updatedAt' | 'description' | 'tutorId'>;

export default function Calendar({ events }: { events: Event[] }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const generateWeekDays = (startDate: Date) => {
    const weekStart = startOfWeek(startDate);
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  };

  const weekDays = generateWeekDays(selectedDate);

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      // Handle both Timestamp and FieldValue types
      if ('toDate' in event.date) {
        return isSameDay(event.date.toDate(), date);
      }
      return false;
    });
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4">
        <div className="grid grid-cols-7 gap-4 text-center text-sm font-semibold text-gray-600">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day}>{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-4 mt-4">
          {weekDays.map(day => {
            const dayEvents = getEventsForDate(day);
            return (
              <div
                key={day.toString()}
                className={`p-2 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                  isSameDay(day, selectedDate) ? 'border-primary-500' : 'border-gray-200'
                }`}
                onClick={() => setSelectedDate(day)}
              >
                <div className="text-sm font-medium">{format(day, 'd')}</div>
                {dayEvents.map(event => (
                  <div
                    key={event.id}
                    className="mt-1 p-1 text-xs bg-primary-100 rounded truncate"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEvent(event);
                    }}
                  >
                    {event.title}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">{selectedEvent.title}</h3>
            <div className="space-y-2">
              <p>Date: {selectedEvent.date ? 
              format(selectedEvent.date.toDate(), 'MMMM d, yyyy') : 
              'Date not available'}</p>
              <p>Time: {selectedEvent.date ? 
              format(selectedEvent.date.toDate(), 'h:mm a') : 
              'Time not available'}</p>
              <p>Type: {selectedEvent.type}</p>
              <p>Skill Level: {selectedEvent.skillLevel}</p>
              <p>Spots Available: {selectedEvent.maxAttendees - selectedEvent.currentAttendees}</p>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                onClick={() => setSelectedEvent(null)}
              >
                Close
              </button>
              <button
                className="btn-primary"
                onClick={() => {
                  // Handle booking logic
                  setSelectedEvent(null);
                }}
              >
                Book Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
