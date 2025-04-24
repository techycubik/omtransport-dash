import './globals.css';
import { ReactNode } from 'react';
import { Providers } from '@/components/Providers';
import { Toaster } from 'react-hot-toast';
import { Roboto, Open_Sans } from 'next/font/google';

// Load Roboto font (primary)
const roboto = Roboto({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto',
});

// Load Open Sans font (secondary)
const openSans = Open_Sans({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-open-sans',
});

export const metadata = {
  title: 'OM Transport Dashboard',
  description: 'Transportation management dashboard for OM Transport operations',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${roboto.variable} ${openSans.variable}`}>
      <body className="min-h-screen antialiased">
        <Providers>
          {children}
          <Toaster 
            position="top-right" 
            toastOptions={{
              style: {
                border: '1px solid rgb(var(--border))',
                borderRadius: 'var(--radius)',
                backgroundColor: 'rgb(var(--card))',
                color: 'rgb(var(--card-foreground))',
                fontSize: 'var(--font-size-sm)',
                fontFamily: 'var(--font-primary)',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
