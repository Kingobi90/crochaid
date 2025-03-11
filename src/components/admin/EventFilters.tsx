import { useState } from 'react';
import type { Event } from '@/lib/firebase/types';

export interface FilterValues {
  searchTerm: string;
  type: string;
  skillLevel: string;
  startDate: string;
  endDate: string;
  sortBy: string;
}

type EventFiltersProps = {
  onFilterChange: (filters: FilterValues) => void;
};

export default function EventFilters({ onFilterChange }: EventFiltersProps) {
  const [filters, setFilters] = useState<FilterValues>({
    searchTerm: '',
    type: 'all',
    skillLevel: 'all',
    startDate: '',
    endDate: '',
    sortBy: 'date',
  });

  const handleChange = (field: keyof FilterValues, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
    onFilterChange({
      ...filters,
      [field]: value,
    });
  };

  const handleSortChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: value,
    }));
    onFilterChange({
      ...filters,
      sortBy: value,
    });
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
              value={filters.searchTerm}
              onChange={(e) => handleChange('searchTerm', e.target.value)}
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
            <div className="flex items-center space-x-2">
              <select
                id="sortBy"
                name="sortBy"
                value={filters.sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
              >
                <option value="date">Date</option>
                <option value="title">Title</option>
                <option value="attendees">Attendees</option>
              </select>
            </div>
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
              value={filters.startDate}
              onChange={(e) => handleChange('startDate', e.target.value)}
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
              value={filters.endDate}
              onChange={(e) => handleChange('endDate', e.target.value)}
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
                  searchTerm: '',
                  type: 'all',
                  skillLevel: 'all',
                  startDate: '',
                  endDate: '',
                  sortBy: 'date',
                };
                setFilters(newFilters);
                onFilterChange(newFilters);
              }}
              className="text-sm text-primary-600 hover:text-primary-500"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 