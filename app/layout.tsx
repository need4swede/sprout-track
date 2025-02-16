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
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        {mounted ? (
          <div className="container mx-auto p-4">
            <header className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold">Baby Tracker</h1>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSettingsOpen(true)}
              >
                Settings
              </Button>
            </header>
            {children}
          </div>
        ) : null}
        <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      </body>
    </html>
  )
}
