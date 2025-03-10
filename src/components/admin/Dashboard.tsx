import { useState, useEffect } from 'react';
import { getAllUsers, getEvents } from '@/lib/firebase/utils';
import type { User, Event } from '@/lib/firebase/types';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    activeEvents: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [users, events] = await Promise.all([
          getAllUsers(),
          getEvents()
        ]);

        const now = new Date();
        const activeEvents = events.filter(event => 
          new Date(event.date.toDate()) >= now
        );

        setStats({
          totalUsers: users.length,
          totalEvents: events.length,
          activeEvents: activeEvents.length
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-900" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Total Users
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {stats.totalUsers}
            </dd>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Total Events
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {stats.totalEvents}
            </dd>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Active Events
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {stats.activeEvents}
            </dd>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => window.location.href = '/dashboard/admin/users'}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            Manage Users
          </button>
          <button
            onClick={() => window.location.href = '/dashboard/admin/events'}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            Manage Events
          </button>
        </div>
      </div>
    </div>
  );
} 