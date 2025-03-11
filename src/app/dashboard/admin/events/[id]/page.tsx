import DashboardLayout from '@/components/ui/DashboardLayout';
import EventDetails from '@/components/events/EventDetails';

export default function EventDetailsPage({ params }: { params: { id: string } }) {
  return (
    <DashboardLayout>
      <EventDetails id={params.id} />
    </DashboardLayout>
  );
} 