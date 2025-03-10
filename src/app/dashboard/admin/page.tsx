'use client';

import AdminDashboard from '@/components/admin/Dashboard';
import DashboardLayout from '@/components/ui/DashboardLayout';

export default function AdminDashboardPage() {
  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
            <AdminDashboard />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
