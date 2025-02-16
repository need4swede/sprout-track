'use client';

import { useEffect, useState } from 'react';
import './globals.css';
import SettingsModal from '@/components/modals/SettingsModal';
import { Button } from '@/components/ui/button';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

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
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className={`${inter.className} min-h-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50`} suppressHydrationWarning>
        {mounted ? (
          <div className="min-h-screen flex flex-col">
            <header className="w-full bg-white/80 backdrop-blur-sm border-b border-indigo-100 shadow-sm">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Baby Tracker
                  </h1>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSettingsOpen(true)}
                    className="hover:bg-indigo-50"
                  >
                    Settings
                  </Button>
                </div>
              </div>
            </header>
            
            <main className="flex-1 w-full">
              {children}
            </main>
          </div>
        ) : null}
        <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      </body>
    </html>
  )
}
