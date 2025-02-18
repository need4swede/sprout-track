'use client';

import { useEffect, useState, useRef } from 'react';
import { Baby } from '@prisma/client';
import { SleepLogResponse, FeedLogResponse, DiaperLogResponse, MoodLogResponse, NoteResponse } from '@/app/api/types';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Baby as BabyIcon, 
  Moon, 
  Droplet,
  Edit,
  Icon,
  Star,
} from 'lucide-react';
import { diaper, bottleBaby } from '@lucide/lab';
import SleepModal from '@/components/modals/SleepModal';
import FeedModal from '@/components/modals/FeedModal';
import DiaperModal from '@/components/modals/DiaperModal';
import NoteModal from '@/components/modals/NoteModal';
import Timeline from '@/components/Timeline';
import SettingsModal from '@/components/modals/SettingsModal';

type ActivityType = SleepLogResponse | FeedLogResponse | DiaperLogResponse | MoodLogResponse | NoteResponse;

export default function Home() {
  // State management
  const [selectedBaby, setSelectedBaby] = useState<Baby | null>(null);
  const [showSleepModal, setShowSleepModal] = useState(false);
  const [showFeedModal, setShowFeedModal] = useState(false);
  const [showDiaperModal, setShowDiaperModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [sleepingBabies, setSleepingBabies] = useState<Set<string>>(new Set());
  const [activities, setActivities] = useState<ActivityType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [localTime, setLocalTime] = useState<string>('');
  const lastSleepCheck = useRef<string>('');

  useEffect(() => {
    // Set initial time
    const now = new Date();
    setLocalTime(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);

    // Update time every minute
    const interval = setInterval(() => {
      const now = new Date();
      setLocalTime(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Listen for baby selection changes
  useEffect(() => {
    const handleBabySelected = (event: CustomEvent<{ babyId: string; sleepingBabies: string[] }>) => {
      if (event.detail.babyId) {
        fetchSelectedBaby(event.detail.babyId);
        setSleepingBabies(new Set(event.detail.sleepingBabies));
      } else {
        setSelectedBaby(null);
        setActivities([]);
        setSleepingBabies(new Set());
      }
    };

    window.addEventListener('babySelected', handleBabySelected as EventListener);
    
    // Initial check from URL
    const urlParams = new URLSearchParams(window.location.search);
    const babyId = urlParams.get('babyId');
    if (babyId) {
      fetchSelectedBaby(babyId);
    }

    return () => {
      window.removeEventListener('babySelected', handleBabySelected as EventListener);
    };
  }, []);

  const fetchSelectedBaby = async (babyId: string) => {
    try {
      const babyResponse = await fetch('/api/baby');
      if (!babyResponse.ok) return;
      
      const babyData = await babyResponse.json();
      if (!babyData.success) return;
      
      const baby = babyData.data.find((b: Baby) => b.id === babyId && !b.inactive);
      if (baby) {
        setSelectedBaby(baby);
        await refreshActivities(baby.id);
      }
    } catch (error) {
      console.error('Error fetching selected baby:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkSleepStatus = async (babyId: string) => {
    // Prevent duplicate checks
    const checkId = `${babyId}-${Date.now()}`;
    if (lastSleepCheck.current === checkId) return;
    lastSleepCheck.current = checkId;

    try {
      const response = await fetch(`/api/sleep-log?babyId=${babyId}`);
      if (!response.ok) return;
      
      const data = await response.json();
      if (!data.success) return;
      
      const hasOngoingSleep = data.data.some((log: SleepLogResponse) => !log.endTime);
      window.dispatchEvent(new CustomEvent('sleepStatusChanged', {
        detail: { babyId, isSleeping: hasOngoingSleep }
      }));
    } catch (error) {
      console.error('Error checking sleep status:', error);
    }
  };

  const refreshActivities = async (babyId: string | undefined) => {
    if (!babyId) return;
    
    try {
      const [sleepResponse, feedResponse, diaperResponse, noteResponse] = await Promise.all([
        fetch(`/api/sleep-log?babyId=${babyId}`),
        fetch(`/api/feed-log?babyId=${babyId}`),
        fetch(`/api/diaper-log?babyId=${babyId}`),
        fetch(`/api/note?babyId=${babyId}`)
      ]);
      
      const [sleepData, feedData, diaperData, noteData] = await Promise.all([
        sleepResponse.json(),
        feedResponse.json(),
        diaperResponse.json(),
        noteResponse.json()
      ]);
      
      const allActivities = [
        ...(sleepData.success ? sleepData.data : []),
        ...(feedData.success ? feedData.data : []),
        ...(diaperData.success ? diaperData.data : []),
        ...(noteData.success ? noteData.data : [])
      ];
      
      setActivities(allActivities);
    } catch (error) {
      console.error('Error refreshing activities:', error);
    }
  };

  // Function to generate random position and size
  const getRandomPosition = () => {
    return {
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
    };
  };

  // Function to get random animation timing
  const getRandomTiming = () => {
    return {
      '--delay': `${Math.random() * 2}s`,
      '--duration': `${3 + Math.random() * 3}s`,
      '--spin-duration': `${6 + Math.random() * 4}s`,
      fontSize: `${1 + Math.random() * 1}rem`,
    } as React.CSSProperties;
  };

  // Function to create star elements
  const renderStars = (count: number) => {
    return Array(count).fill(0).map((_, i) => (
      <Star
        key={i}
        className={`star ${Math.random() > 0.7 ? 'twinkle' : ''}`}
        style={getRandomPosition()}
        size={16}
      />
    ));
  };

  // Function to create poop emojis
  const renderPoopEmojis = (count: number) => {
    return Array(count).fill(0).map((_, i) => (
      <span
        key={i}
        className="poop-emoji animate"
        style={{
          ...getRandomPosition(),
          ...getRandomTiming(),
          color: '#8B4513',
        }}
      >
        💩
      </span>
    ));
  };

  return (
    <div className="space-y-6 mx-4 my-4">
      {/* Action Buttons */}
      {selectedBaby?.id && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <Button
            variant="default"
            size="lg"
            className="h-36 sm:h-40 flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200 rounded-2xl sleep-button relative overflow-hidden"
            onClick={() => setShowSleepModal(true)}
          >
            {renderStars(8)}
            <div className="w-16 h-16 rounded-xl bg-gray-400/20 flex items-center justify-center z-10">
              <Moon className="h-10 w-10" />
            </div>
            <span className="text-base font-medium z-10">
              {sleepingBabies.has(selectedBaby?.id || '') ? 'End Sleep' : 'Start Sleep'}
            </span>
          </Button>
          <Button
            variant="default"
            size="lg"
            className="h-36 sm:h-40 flex flex-col items-center justify-center gap-4 relative overflow-hidden text-gray-700 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200 rounded-2xl bg-white before:absolute before:inset-0 before:bg-gradient-to-b before:from-sky-200 before:to-sky-200 before:h-[40%] after:absolute after:inset-0 after:bg-[#F5F5DC] after:top-[35%] after:animate-[formulaRipple_3s_ease-in-out_infinite] [&>div]:hover:scale-110 [&>div]:transition-transform"
            onClick={() => setShowFeedModal(true)}
          >
            <div className="w-16 h-16 rounded-xl bg-sky-200/30 flex items-center justify-center z-10">
              <Icon iconNode={bottleBaby} className="h-10 w-10" />
            </div>
            <span className="text-base font-medium z-10">Feed</span>
          </Button>
          <Button
            variant="default"
            size="lg"
            className="h-36 sm:h-40 flex flex-col items-center justify-center gap-4 bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200 rounded-2xl relative overflow-hidden"
            onClick={() => setShowDiaperModal(true)}
          >
            {renderPoopEmojis(4)}
            <div className="w-16 h-16 rounded-xl bg-teal-500/20 flex items-center justify-center z-10">
              <Icon iconNode={diaper} className="h-10 w-10" />
            </div>
            <span className="text-base font-medium z-10">Diaper</span>
          </Button>
          <Button
            variant="default"
            size="lg"
            className="h-36 sm:h-40 flex flex-col items-center justify-center gap-4 bg-[#FFFF99] text-gray-700 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200 rounded-2xl bg-[repeating-linear-gradient(transparent,transparent_19px,#ADD8E6_19px,#ADD8E6_20px)]"
            onClick={() => setShowNoteModal(true)}
          >
            <div className="w-16 h-16 rounded-xl bg-[#FFFF99]/30 flex items-center justify-center">
              <Edit className="h-10 w-10" />
            </div>
            <div className="space-y-1 text-center">
              <h3 className="font-semibold">Add Note</h3>
            </div>
          </Button>
        </div>
      )}

      {/* Timeline Section */}
      {selectedBaby && (
        <Card className="overflow-hidden border-0">
          {activities.length > 0 ? (
            <Timeline 
              activities={activities} 
              onActivityDeleted={() => {
                if (selectedBaby?.id) {
                  refreshActivities(selectedBaby.id);
                }
              }}
            />
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-100 flex items-center justify-center">
                <BabyIcon className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No activities yet</h3>
              <p className="text-sm text-gray-500">
                Start tracking your baby's activities using the buttons above
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Welcome Screen */}
      {!isLoading && !selectedBaby ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200 shadow-lg p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-teal-100 flex items-center justify-center">
            <BabyIcon className="h-10 w-10 text-teal-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">Welcome to Baby Tracker!</h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Track your baby's daily activities including sleep, feeding, and diaper changes. Get started by adding your baby's information in the settings.
          </p>
          <Button
            onClick={() => setShowSettingsModal(true)}
            className="bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            Open Settings
          </Button>
        </div>
      ) : null}

      {/* Modals */}
      <SleepModal
        open={showSleepModal}
        onClose={async () => {
          setShowSleepModal(false);
          if (selectedBaby?.id) {
            await refreshActivities(selectedBaby.id);
            await checkSleepStatus(selectedBaby.id);
          }
        }}
        isSleeping={sleepingBabies.has(selectedBaby?.id || '')}
        onSleepToggle={() => {
          if (selectedBaby?.id) {
            const isSleeping = !sleepingBabies.has(selectedBaby.id);
            window.dispatchEvent(new CustomEvent('sleepStatusChanged', {
              detail: { babyId: selectedBaby.id, isSleeping }
            }));
          }
        }}
        babyId={selectedBaby?.id || ''}
        initialTime={localTime}
      />
      <FeedModal
        open={showFeedModal}
        onClose={() => {
          setShowFeedModal(false);
          refreshActivities(selectedBaby?.id);
        }}
        babyId={selectedBaby?.id || ''}
        initialTime={localTime}
      />
      <DiaperModal
        open={showDiaperModal}
        onClose={() => {
          setShowDiaperModal(false);
          refreshActivities(selectedBaby?.id);
        }}
        babyId={selectedBaby?.id || ''}
        initialTime={localTime}
      />
      <NoteModal
        open={showNoteModal}
        onClose={() => {
          setShowNoteModal(false);
          refreshActivities(selectedBaby?.id);
        }}
        babyId={selectedBaby?.id || ''}
        initialTime={localTime}
      />
      <SettingsModal
        open={showSettingsModal}
        onClose={() => {
          setShowSettingsModal(false);
          refreshActivities(selectedBaby?.id);
        }}
      />
    </div>
  );
}
