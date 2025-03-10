import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Croch-Aide - Crochet Learning & Tutoring',
  description: 'Learn crochet, book events, and get help from expert tutors',
  keywords: 'crochet, tutoring, learning, events, crafts',
  authors: [{ name: 'Croch-Aide Team' }],
  openGraph: {
    title: 'Croch-Aide - Crochet Learning & Tutoring',
    description: 'Learn crochet, book events, and get help from expert tutors',
    type: 'website',
    locale: 'en_US',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-gray-50">
      <body className={`${inter.className} h-full`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
