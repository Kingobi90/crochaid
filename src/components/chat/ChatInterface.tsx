'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import { io, Socket } from 'socket.io-client';
import Image from 'next/image';

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image';
  imageUrl?: string;
}

interface ChatProps {
  tutorId?: string;
}

export default function ChatInterface({ tutorId }: ChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [imageUpload, setImageUpload] = useState<File | null>(null);
  const socketRef = useRef<Socket>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
      auth: {
        token: user?.uid
      }
    });

    // Listen for messages
    socketRef.current.on('message', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() && !imageUpload) return;

    if (imageUpload) {
      // Handle image upload to Cloudinary
      const formData = new FormData();
      formData.append('file', imageUpload);
      formData.append('upload_preset', 'croch-aide');

      try {
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: 'POST',
            body: formData
          }
        );
        const data = await response.json();

        socketRef.current?.emit('message', {
          type: 'image',
          content: '',
          imageUrl: data.secure_url,
          senderId: user?.uid,
          timestamp: new Date()
        });

        setImageUpload(null);
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }

    if (newMessage.trim()) {
      socketRef.current?.emit('message', {
        type: 'text',
        content: newMessage,
        senderId: user?.uid,
        timestamp: new Date()
      });

      setNewMessage('');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-white rounded-lg shadow">
      {/* Chat Header */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Chat with Tutor</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.senderId === user?.uid
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {message.type === 'text' ? (
                <p>{message.content}</p>
              ) : (
                <Image
                  src={message.imageUrl || ''}
                  alt="Shared image"
                  width={200}
                  height={200}
                  className="rounded-lg"
                />
              )}
              <p className="text-xs mt-1 opacity-70">
                {new Date(message.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 input-field"
          />
          <label className="btn-primary p-2 cursor-pointer">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setImageUpload(e.target.files?.[0] || null)}
            />
          </label>
          <button type="submit" className="btn-primary">
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
