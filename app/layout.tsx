'use client';

import { useEffect, useState } from 'react';
import { BabyProvider, useBaby } from './context/baby';
import Security from '@/src/components/Security';
import Image from 'next/image';
import './globals.css';
import SettingsForm from '@/src/components/forms/SettingsForm';
import { Button } from '@/src/components/ui/button';
import { Moon } from 'lucide-react';
import { DebugSessionTimer } from '@/src/components/debugSessionTimer';
import { SideNav, SideNavTrigger } from '@/src/components/ui/side-nav';
import { Inter as FontSans } from 'next/font/google';
import { cn } from '@/src/lib/utils';
import { Baby } from '@prisma/client';
import BabySelector from '@/src/components/BabySelector';
import BabyQuickStats from '@/src/components/forms/BabyQuickStats';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

function AppContent({ children }: { children: React.ReactNode }) {
  const { selectedBaby, setSelectedBaby, sleepingBabies } = useBaby();
  const [mounted, setMounted] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [quickStatsOpen, setQuickStatsOpen] = useState(false);
  const [sideNavOpen, setSideNavOpen] = useState(false);
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
  
  const [caretakerName, setCaretakerName] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

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
      
      // Fetch caretaker information if authenticated
      const caretakerId = localStorage.getItem('caretakerId');
      if (caretakerId) {
        const caretakerResponse = await fetch(`/api/caretaker?id=${caretakerId}`);
        if (caretakerResponse.ok) {
          const caretakerData = await caretakerResponse.json();
          if (caretakerData.success && caretakerData.data) {
            setCaretakerName(caretakerData.data.name);
          }
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

  // Update unlock timer on any activity
  const updateUnlockTimer = () => {
    const unlockTime = localStorage.getItem('unlockTime');
    if (unlockTime) {
      localStorage.setItem('unlockTime', Date.now().toString());
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchData();

    // Add listeners for user activity
    window.addEventListener('click', updateUnlockTimer);
    window.addEventListener('keydown', updateUnlockTimer);
    window.addEventListener('mousemove', updateUnlockTimer);
    window.addEventListener('touchstart', updateUnlockTimer);

    return () => {
      // Clean up event listeners
      window.removeEventListener('click', updateUnlockTimer);
      window.removeEventListener('keydown', updateUnlockTimer);
      window.removeEventListener('mousemove', updateUnlockTimer);
      window.removeEventListener('touchstart', updateUnlockTimer);
    };
  }, []);

  // Check unlock status based on JWT token and extract user info
  useEffect(() => {
    const checkUnlockStatus = () => {
      const authToken = localStorage.getItem('authToken');
      const unlockTime = localStorage.getItem('unlockTime');
      
      // Consider unlocked if we have both a token and an unlock time
      const newUnlockState = !!(authToken && unlockTime);
      setIsUnlocked(newUnlockState);
      
      // Extract user information from JWT token
      if (authToken) {
        try {
          // JWT tokens are in format: header.payload.signature
          // We need the payload part (index 1)
          const payload = authToken.split('.')[1];
          // The payload is base64 encoded, so we need to decode it
          const decodedPayload = JSON.parse(atob(payload));
          
          // Set caretaker name and admin status from token
          if (decodedPayload.name) {
            setCaretakerName(decodedPayload.name);
            setIsAdmin(decodedPayload.role === 'ADMIN');
          }
        } catch (error) {
          console.error('Error parsing JWT token:', error);
        }
      }
    };

    // Check immediately on mount
    checkUnlockStatus();

    // Then check every second
    const interval = setInterval(checkUnlockStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  const handleUnlock = (caretakerId?: string) => {
    setIsUnlocked(true);
    fetchData();
    
    // The caretaker name and role will be extracted from the JWT token
    // in the checkUnlockStatus effect
  };
  
  const handleLogout = async () => {
    // Get the token to invalidate it server-side
    const token = localStorage.getItem('authToken');
    
    // Call the logout API to clear server-side cookies and invalidate the token
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
    } catch (error) {
      console.error('Error during logout:', error);
    }
    
    // Clear all client-side authentication data including JWT token
    localStorage.removeItem('unlockTime');
    localStorage.removeItem('caretakerId');
    localStorage.removeItem('authToken');
    localStorage.removeItem('attempts');
    localStorage.removeItem('lockoutTime');
    
    // Reset state
    setIsUnlocked(false);
    setCaretakerName('');
    setIsAdmin(false);
    setSideNavOpen(false);
  };

  return (
    <>
      <Security onUnlock={handleUnlock} />
      {(isUnlocked || process.env.NODE_ENV === 'development') && (
        <div className="min-h-screen flex flex-col">
          <header className="w-full bg-gradient-to-r from-teal-600 to-teal-700 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <SideNavTrigger
                    onClick={() => setSideNavOpen(true)}
                    isOpen={sideNavOpen}
                    className="w-16 h-16 flex items-center justify-center cursor-pointer transition-transform duration-200 hover:scale-110"
                  >
                    <Image
                      src="/acorn-128.png"
                      alt="Acorn Logo"
                      width={64}
                      height={64}
                      className="object-contain"
                      priority
                    />
                  </SideNavTrigger>
                  <div className="flex flex-col">
                    {caretakerName && caretakerName !== 'System Administrator' && (
                      <span className="text-white text-xs opacity-80">
                        Hi, {caretakerName}
                      </span>
                    )}
                    <span className="text-white text-sm font-medium">
                      {window.location.pathname === '/log-entry' ? 'Log Entry' : 'Full Log'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {babies.length > 0 && (
                    <BabySelector
                      selectedBaby={selectedBaby}
                      onBabySelect={(baby) => setSelectedBaby(baby)}
                      babies={babies}
                      sleepingBabies={sleepingBabies}
                      calculateAge={calculateAge}
                      onOpenQuickStats={() => setQuickStatsOpen(true)}
                    />
                  )}
                </div>
              </div>
            </div>
          </header>
          
          <main className="flex-1 w-full relative z-0">
            {children}
          </main>

          {/* Side Navigation */}
          <SideNav
            isOpen={sideNavOpen}
            onClose={() => setSideNavOpen(false)}
            currentPath={window.location.pathname}
            onNavigate={(path) => {
              window.location.href = path;
              setSideNavOpen(false);
            }}
            onSettingsClick={() => {
              setSettingsOpen(true);
              setSideNavOpen(false);
            }}
            onLogout={handleLogout}
            isAdmin={isAdmin}
          />
        </div>
      )}

      <SettingsForm
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onBabySelect={(id: string) => {
          const baby = babies.find((b: Baby) => b.id === id);
          if (baby) {
            setSelectedBaby(baby);
          }
        }}
        onBabyStatusChange={fetchData}
        selectedBabyId={selectedBaby?.id || ''}
      />
      
      {/* Baby Quick Stats Form */}
      <BabyQuickStats
        isOpen={quickStatsOpen}
        onClose={() => setQuickStatsOpen(false)}
        selectedBaby={selectedBaby}
        calculateAge={calculateAge}
      />
      
      {/* Debug Session Timer - only visible in development mode */}
      <DebugSessionTimer />
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
