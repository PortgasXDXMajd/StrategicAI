'use client';

import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { SessionProvider } from '@/context/SessionContext';
import { ThemeProvider } from 'next-themes';
import { Inter } from 'next/font/google';

import { Provider } from 'react-redux';
import store from '@/redux/store';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/logos/red_logo.svg" />
      </head>
      <body className={inter.className}>
        <div className="font-mono">
          <SessionProvider>
            <Provider store={store}>
              <ThemeProvider>
                {children}
                <Toaster />
              </ThemeProvider>
            </Provider>
          </SessionProvider>
        </div>
      </body>
    </html>
  );
}
