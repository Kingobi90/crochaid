import { useState } from 'react';
import type { Event } from '@/lib/firebase/types';

type FilterValues = {
  search: string;
  type: Event['type'] | 'all';
  skillLevel: Event['skillLevel'] | 'all';
  dateRange: {
    start: string;
    end: string;
  };
  sortBy: 'date' | 'title' | 'attendees';
  sortOrder: 'asc' | 'desc';
};

type EventFiltersProps = {
  onFilterChange: (filters: FilterValues) => void;
};

export default function EventFilters({ onFilterChange }: EventFiltersProps) {
  const [filters, setFilters] = useState<FilterValues>({
    search: '',
    type: 'all',
    skillLevel: 'all',
    dateRange: {
      start: '',
      end: '',
    },
    sortBy: 'date',
    sortOrder: 'asc',
  });

  const handleChange = (name: string, value: string) => {
    let newFilters: FilterValues;

    if (name === 'start' || name === 'end') {
      newFilters = {
        ...filters,
        dateRange: {
          ...filters.dateRange,
          [name]: value,
        },
      };
    } else {
      newFilters = {
        ...filters,
        [name]: value,
      };
    }

    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
        <div className="sm:col-span-6">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700">
            Search
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="search"
              id="search"
              value={filters.search}
              onChange={(e) => handleChange('search', e.target.value)}
              placeholder="Search by title or location"
              className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
            Type
          </label>
          <div className="mt-1">
            <select
              id="type"
              name="type"
              value={filters.type}
              onChange={(e) => handleChange('type', e.target.value)}
              className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
            >
              <option value="all">All Types</option>
              <option value="workshop">Workshop</option>
              <option value="class">Class</option>
              <option value="seminar">Seminar</option>
            </select>
          </div>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="skillLevel" className="block text-sm font-medium text-gray-700">
            Skill Level
          </label>
          <div className="mt-1">
            <select
              id="skillLevel"
              name="skillLevel"
              value={filters.skillLevel}
              onChange={(e) => handleChange('skillLevel', e.target.value)}
              className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700">
            Sort By
          </label>
          <div className="mt-1">
            <select
              id="sortBy"
              name="sortBy"
              value={filters.sortBy}
              onChange={(e) => handleChange('sortBy', e.target.value)}
              className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
            >
              <option value="date">Date</option>
              <option value="title">Title</option>
              <option value="attendees">Attendees</option>
            </select>
          </div>
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
            Start Date
          </label>
          <div className="mt-1">
            <input
              type="date"
              name="startDate"
              id="startDate"
              value={filters.dateRange.start}
              onChange={(e) => handleChange('start', e.target.value)}
              className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
            End Date
          </label>
          <div className="mt-1">
            <input
              type="date"
              name="endDate"
              id="endDate"
              value={filters.dateRange.end}
              onChange={(e) => handleChange('end', e.target.value)}
              className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
        </div>

        <div className="sm:col-span-6">
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => {
                const newFilters: FilterValues = {
                  search: '',
                  type: 'all',
                  skillLevel: 'all',
                  dateRange: {
                    start: '',
                    end: '',
                  },
                  sortBy: 'date',
                  sortOrder: 'asc',
                };
                setFilters(newFilters);
                onFilterChange(newFilters);
              }}
              className="text-sm text-primary-600 hover:text-primary-500"
            >
              Clear Filters
            </button>
            <button
              type="button"
              onClick={() => handleChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
              className="ml-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              {filters.sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 