import DashboardLayout from '@/components/ui/DashboardLayout';
import Calendar from '@/components/events/Calendar';

export default function EventsPage() {
  return (
    <DashboardLayout>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Crochet Events</h1>
          <div className="flex space-x-4">
            <select className="input-field">
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            <select className="input-field">
              <option value="all">All Types</option>
              <option value="group">Group Sessions</option>
              <option value="one-on-one">One-on-One</option>
            </select>
          </div>
        </div>
        
        <Calendar events={[]} />
      </div>
    </DashboardLayout>
  );
}
