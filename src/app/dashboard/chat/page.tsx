import DashboardLayout from '@/components/ui/DashboardLayout';
import ChatInterface from '@/components/chat/ChatInterface';

export default function ChatPage() {
  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-8rem)]">
        <ChatInterface />
      </div>
    </DashboardLayout>
  );
}
