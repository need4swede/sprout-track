'use client';

import { useEffect, useState } from 'react';
import { BabyProvider, useBaby } from './context/baby';
import Security from '@/src/components/Security';
import Image from 'next/image';
import './globals.css';
import SettingsModal from '@/src/components/modals/SettingsModal';
import { Button } from '@/src/components/ui/button';
import { Settings as SettingsIcon, Baby as BabyIcon, ChevronDown, Moon } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Inter as FontSans } from 'next/font/google';
import { cn } from '@/src/lib/utils';
import { Baby } from '@prisma/client';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

function AppContent({ children }: { children: React.ReactNode }) {
  const { selectedBaby, setSelectedBaby, sleepingBabies } = useBaby();
  const [mounted, setMounted] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [familyName, setFamilyName] = useState('');
  const [babies, setBabies] = useState<Baby[]>([]);
  const [isUnlocked, setIsUnlocked] = useState(() => {
    // Only run this on client-side
    if (typeof window !== 'undefined') {
      const unlockTime = localStorage.getItem('unlockTime');
      if (unlockTime && Date.now() - parseInt(unlockTime) <= 60 * 1000) {
        return true;
      }
    }
    return false;
  });

  // Function to calculate baby's age
  const calculateAge = (birthday: Date) => {
    const today = new Date();
    const birthDate = new Date(birthday);
    
    const ageInWeeks = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
    const ageInMonths = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
    const ageInYears = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
    
    if (ageInMonths < 6) {
      return `${ageInWeeks} weeks`;
    } else if (ageInMonths < 24) {
      return `${ageInMonths} months`;
    } else {
      return `${ageInYears} ${ageInYears === 1 ? 'year' : 'years'}`;
    }
  };

  const fetchData = async () => {
    try {
      // Fetch settings
      const settingsResponse = await fetch('/api/settings');
      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json();
        if (settingsData.success && settingsData.data.familyName) {
          setFamilyName(settingsData.data.familyName);
        }
      }

      // Fetch babies
      const babiesResponse = await fetch('/api/baby');
      if (babiesResponse.ok) {
        const babiesData = await babiesResponse.json();
        if (babiesData.success) {
          const activeBabies = babiesData.data.filter((baby: Baby) => !baby.inactive);
          setBabies(activeBabies);
          
          // Get selected baby from URL or select first baby if only one exists
          const urlParams = new URLSearchParams(window.location.search);
          const babyId = urlParams.get('babyId');
          
          // If current selected baby is inactive, clear selection
          const foundBaby = activeBabies.find((b: Baby) => b.id === babyId);
          if (foundBaby) {
            setSelectedBaby(foundBaby);
          } else if (activeBabies.length === 1) {
            setSelectedBaby(activeBabies[0]);
          } else {
            setSelectedBaby(null);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchData();

    // Update unlock timer on any activity
    const handleActivity = () => {
      const unlockTime = localStorage.getItem('unlockTime');
      if (unlockTime) {
        localStorage.setItem('unlockTime', Date.now().toString());
      }
    };

    // Add listeners for user activity
    window.addEventListener('click', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('touchstart', handleActivity);

    return () => {
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
    };
  }, []);

  // Check unlock status periodically
  useEffect(() => {
    const checkUnlockStatus = () => {
      const unlockTime = localStorage.getItem('unlockTime');
      const newUnlockState = !!(unlockTime && Date.now() - parseInt(unlockTime) <= 60 * 1000);
      setIsUnlocked(newUnlockState);
    };

    // Check immediately on mount
    checkUnlockStatus();

    // Then check every second
    const interval = setInterval(checkUnlockStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  return (
    <>
      {!isUnlocked && <Security onUnlock={() => setIsUnlocked(true)} />}
      {(isUnlocked || process.env.NODE_ENV === 'development') && (
        <div className="min-h-screen flex flex-col">
          <header className="w-full bg-gradient-to-r from-teal-600 to-teal-700 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div className="w-16 h-16 flex items-center justify-center cursor-pointer transition-transform duration-200 hover:scale-110">
                        <Image
                          src="/acorn-128.png"
                          alt="Acorn Logo"
                          width={64}
                          height={64}
                          className="object-contain"
                          priority
                        />
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuRadioGroup 
                        value={window.location.pathname}
                        onValueChange={(path) => window.location.href = path}
                      >
                        <DropdownMenuRadioItem value="/log-entry">
                          <div className="flex flex-col">
                            <span>Log Entry</span>
                          </div>
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="/full-log">
                          <div className="flex flex-col">
                            <span>Full Log</span>
                          </div>
                        </DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <span className="text-white text-sm font-medium">
                    {window.location.pathname === '/log-entry' ? 'Log Entry' : 'Full Log'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {babies.length > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-auto py-1 text-white transition-colors duration-200 flex items-center space-x-2 ${
                            selectedBaby?.gender === 'MALE'
                              ? 'bg-blue-500'
                              : selectedBaby?.gender === 'FEMALE'
                              ? 'bg-pink-500'
                              : ''
                          }`}
                        >
                          <div className="flex flex-col items-start">
                            <div className="flex items-center space-x-1">
                              <span className="text-sm font-medium">
                                {selectedBaby ? selectedBaby.firstName : 'Select Baby'}
                              </span>
                              {selectedBaby && sleepingBabies.has(selectedBaby.id) && (
                                <Moon className="h-3 w-3" />
                              )}
                            </div>
                            {selectedBaby && (
                              <span className="text-xs opacity-80">
                                {calculateAge(selectedBaby.birthDate)}
                              </span>
                            )}
                          </div>
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuRadioGroup 
                          value={selectedBaby?.id || ''} 
                          onValueChange={(id) => {
                            const baby = babies.find((b: Baby) => b.id === id);
                            if (baby) {
                              setSelectedBaby(baby);
                            }
                          }}
                        >
                          {babies.map((baby) => (
                            <DropdownMenuRadioItem 
                              key={baby.id} 
                              value={baby.id}
                              className={`${
                                baby.gender === 'MALE'
                                  ? 'bg-blue-500/10 hover:bg-blue-500/20'
                                  : baby.gender === 'FEMALE'
                                  ? 'bg-pink-500/10 hover:bg-pink-500/20'
                                  : ''
                              }`}
                            >
                              <div className="flex flex-col">
                                <span>{baby.firstName}</span>
                                <span className="text-xs opacity-80">{calculateAge(baby.birthDate)}</span>
                              </div>
                            </DropdownMenuRadioItem>
                          ))}
                        </DropdownMenuRadioGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSettingsOpen(true)}
                    className="h-8 w-8 text-white hover:bg-white/20 transition-colors duration-200"
                  >
                    <SettingsIcon className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </header>
          
          <main className="flex-1 w-full relative z-0">
            {children}
          </main>
        </div>
      )}

      <SettingsModal 
        open={settingsOpen} 
        onClose={() => setSettingsOpen(false)}
        onBabySelect={(id) => {
          const baby = babies.find((b: Baby) => b.id === id);
          if (baby) {
            setSelectedBaby(baby);
          }
        }}
        onBabyStatusChange={fetchData}
        selectedBabyId={selectedBaby?.id || ''}
      />
    </>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <BabyProvider>
      <html lang="en" className={cn('h-full', fontSans.variable)} suppressHydrationWarning>
        <body className={cn('min-h-full bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-50 font-sans antialiased')} suppressHydrationWarning>
          <AppContent>{children}</AppContent>
        </body>
      </html>
    </BabyProvider>
  );
}
