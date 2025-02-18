'use client';

import { useEffect, useState } from 'react';
import Security from '@/components/Security';
import Image from 'next/image';
import './globals.css';
import SettingsModal from '@/components/modals/SettingsModal';
import { Button } from '@/components/ui/button';
import { Settings as SettingsIcon, Baby as BabyIcon, ChevronDown, Moon } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Inter as FontSans } from 'next/font/google';
import { cn } from '@/lib/utils';
import { Baby } from '@prisma/client';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

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
  const [familyName, setFamilyName] = useState('');
  const [babies, setBabies] = useState<Baby[]>([]);
  const [selectedBaby, setSelectedBaby] = useState<string>('');
  const [sleepingBabies, setSleepingBabies] = useState<Set<string>>(new Set());
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Listen for sleep status updates
  useEffect(() => {
    const handleSleepUpdate = (event: CustomEvent<{ babyId: string; isSleeping: boolean }>) => {
      setSleepingBabies(prev => {
        const newSet = new Set(prev);
        if (event.detail.isSleeping) {
          newSet.add(event.detail.babyId);
        } else {
          newSet.delete(event.detail.babyId);
        }
        return newSet;
      });
    };

    window.addEventListener('sleepStatusChanged', handleSleepUpdate as EventListener);
    
    // Initial sleep status check for selected baby
    const checkInitialSleepStatus = async () => {
      if (!selectedBaby) return;
      
      try {
        const response = await fetch(`/api/sleep-log?babyId=${selectedBaby}`);
        if (!response.ok) return;
        
        const data = await response.json();
        if (!data.success) return;
        
        const hasOngoingSleep = data.data.some((log: any) => !log.endTime);
        setSleepingBabies(prev => {
          const newSet = new Set(prev);
          if (hasOngoingSleep) {
            newSet.add(selectedBaby);
          } else {
            newSet.delete(selectedBaby);
          }
          return newSet;
        });
      } catch (error) {
        console.error('Error checking initial sleep status:', error);
      }
    };

    checkInitialSleepStatus();

    return () => {
      window.removeEventListener('sleepStatusChanged', handleSleepUpdate as EventListener);
    };
  }, [selectedBaby]);

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
          if (selectedBaby && !activeBabies.some((b: Baby) => b.id === selectedBaby)) {
            setSelectedBaby('');
          }
          // Set selected baby from URL or first active baby
          else if (babyId && activeBabies.some((b: Baby) => b.id === babyId)) {
            setSelectedBaby(babyId);
          } else if (activeBabies.length === 1) {
            setSelectedBaby(activeBabies[0].id);
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
  }, []);

  const router = useRouter();

  // Update URL when selected baby changes
  useEffect(() => {
    if (selectedBaby) {
      const current = new URLSearchParams(Array.from(searchParams.entries()));
      current.set('babyId', selectedBaby);
      const search = current.toString();
      const query = search ? `?${search}` : "";
      router.push(`${pathname}${query}`);
    }
  }, [selectedBaby, router, pathname, searchParams]);

  // Share selected baby and sleep status with children
  useEffect(() => {
    const event = new CustomEvent('babySelected', { 
      detail: { 
        babyId: selectedBaby,
        sleepingBabies: Array.from(sleepingBabies)
      }
    });
    window.dispatchEvent(event);
  }, [selectedBaby, sleepingBabies]);

  const [isUnlocked, setIsUnlocked] = useState(false);

  return (
    <html lang="en" className={cn('h-full', fontSans.variable)} suppressHydrationWarning>
      <body className={cn('min-h-full bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-50 font-sans antialiased')} suppressHydrationWarning>
        {mounted ? (
          <>
            {!isUnlocked && <Security onUnlock={() => setIsUnlocked(true)} />}
            {(isUnlocked || process.env.NODE_ENV === 'development') && (
          <div className="min-h-screen flex flex-col">
            <header className="w-full bg-gradient-to-r from-teal-600 to-teal-700 sticky top-0 z-50">
              <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-16 h-16 rounded-lg bg-white/20 backdrop-blur-sm p-2 flex items-center justify-center">
                      <Image
                        src="/Sprout-256.png"
                        alt="Sprout Logo"
                        width={48}
                        height={48}
                        className="object-contain"
                        priority
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {babies.length > 0 && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`h-auto py-1 text-white transition-colors duration-200 flex items-center space-x-2 ${
                              selectedBaby && babies.find((b: Baby) => b.id === selectedBaby)?.gender === 'MALE'
                                ? 'bg-blue-500'
                                : selectedBaby && babies.find((b: Baby) => b.id === selectedBaby)?.gender === 'FEMALE'
                                ? 'bg-pink-500'
                                : ''
                            }`}
                          >
                            <div className="flex flex-col items-start">
                              <div className="flex items-center space-x-1">
                                <span className="text-sm font-medium">
                                  {selectedBaby ? babies.find((b: Baby) => b.id === selectedBaby)?.firstName : 'Select Baby'}
                                </span>
                                {selectedBaby && sleepingBabies.has(selectedBaby) && (
                                  <Moon className="h-3 w-3" />
                                )}
                              </div>
                              {selectedBaby && (
                                <span className="text-xs opacity-80">
                                  {calculateAge(babies.find((b: Baby) => b.id === selectedBaby)?.birthDate || new Date())}
                                </span>
                              )}
                            </div>
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuRadioGroup value={selectedBaby} onValueChange={setSelectedBaby}>
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
            
            <main className="flex-1 w-full relative">
              {children}
            </main>
          </div>
            )}
          </>
        ) : null}
        <SettingsModal 
          open={settingsOpen} 
          onClose={() => setSettingsOpen(false)}
          onBabySelect={setSelectedBaby}
          onBabyStatusChange={fetchData}
          selectedBabyId={selectedBaby}
        />
      </body>
    </html>
  )
}
