import DashboardLayout from '@/components/ui/DashboardLayout';
import UserDetails from '@/components/users/UserDetails';

export default function UserDetailsPage({ params }: { params: { id: string } }) {
  return (
    <DashboardLayout>
      <UserDetails id={params.id} />
    </DashboardLayout>
  );
} 