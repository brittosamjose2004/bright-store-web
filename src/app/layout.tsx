import './globals.css';
import type { Metadata } from 'next';
import ClientLayout from '@/components/ClientLayout';

export const metadata: Metadata = {
  title: 'Bright Store - Premium Quality, Unbeatable Prices',
  description: 'Experience the finest selection with our new weight-based pricing. Shop fresh products at wholesale prices.',
  openGraph: {
    title: 'Bright Store',
    description: 'Premium Quality, Unbeatable Prices',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
