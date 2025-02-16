'use client';

import { useEffect, useState } from 'react';
import './globals.css';
import SettingsModal from '@/components/modals/SettingsModal';
import { Button } from '@/components/ui/button';
import { Inter as FontSans } from 'next/font/google';
import { cn } from '@/lib/utils';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <html lang="en" className={cn('h-full', fontSans.variable)} suppressHydrationWarning>
      <body className={cn('min-h-full bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-50 font-sans antialiased')} suppressHydrationWarning>
        {mounted ? (
          <div className="min-h-screen flex flex-col">
            <header className="w-full bg-white/90 backdrop-blur-sm border-b border-slate-200 shadow-md sticky top-0 z-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex justify-between items-center">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 via-emerald-600 to-sky-600 bg-clip-text text-transparent">
                    Baby Tracker
                  </h1>
                  <Button
                    variant="outline"
                    size="default"
                    onClick={() => setSettingsOpen(true)}
                    className="hover:bg-teal-50 transition-colors duration-200"
                  >
                    Settings
                  </Button>
                </div>
              </div>
            </header>
            
            <main className="flex-1 w-full relative">
              {children}
            </main>
          </div>
        ) : null}
        <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      </body>
    </html>
  )
}
