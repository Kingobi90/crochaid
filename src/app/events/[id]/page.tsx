import EventPage from '@/components/events/EventPage';

export default function EventDetailsPage({ params }: { params: { id: string } }) {
  return <EventPage id={params.id} />;
} 