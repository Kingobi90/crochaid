import DashboardLayout from '@/components/ui/DashboardLayout';
import TutorDetails from '@/components/tutors/TutorDetails';

export default function TutorDetailsPage({ params }: { params: { id: string } }) {
  return (
    <DashboardLayout>
      <TutorDetails id={params.id} />
    </DashboardLayout>
  );
} 