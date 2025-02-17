'use client';

import { useEffect, useState } from 'react';
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
  const [babies, setBabies] = useState<Baby[]>([]);
  const [selectedBabyId, setSelectedBabyId] = useState<string>('');
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

  // Check sleep status when baby is selected
  useEffect(() => {
    const checkSleepStatus = async () => {
      if (!selectedBabyId) return;
      
      try {
        const response = await fetch(`/api/sleep-log?babyId=${selectedBabyId}`);
        if (!response.ok) return;
        
        const data = await response.json();
        if (!data.success) return;
        
        // Check if there's any ongoing sleep (no endTime)
        const hasOngoingSleep = data.data.some((log: SleepLogResponse) => !log.endTime);
        
        setSleepingBabies(prev => {
          const newSet = new Set(prev);
          if (hasOngoingSleep) {
            newSet.add(selectedBabyId);
          } else {
            newSet.delete(selectedBabyId);
          }
          return newSet;
        });
      } catch (error) {
        console.error('Error checking sleep status:', error);
      }
    };

    checkSleepStatus();
  }, [selectedBabyId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch babies
        const babyResponse = await fetch('/api/baby');
        if (!babyResponse.ok) return;
        
        const babyData = await babyResponse.json();
        if (!babyData.success) return;
        
        // Filter out inactive babies
        const activeBabies = babyData.data.filter((baby: Baby) => !baby.inactive);
        setBabies(activeBabies);
        
        // If there's only one active baby, select it automatically
        if (activeBabies.length === 1) {
          const baby = activeBabies[0];
          setSelectedBabyId(baby.id);
          setSelectedBaby(baby);
          
          // Fetch activities for the selected baby
          await refreshActivities(baby.id);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const refreshBabies = async () => {
    try {
      const babyResponse = await fetch('/api/baby');
      if (!babyResponse.ok) return;
      
      const babyData = await babyResponse.json();
      if (!babyData.success) return;
      
      // Filter out inactive babies
      const activeBabies = babyData.data.filter((baby: Baby) => !baby.inactive);
      setBabies(activeBabies);
    } catch (error) {
      console.error('Error fetching babies:', error);
    }
  };

  const refreshActivities = async (babyId: string = selectedBabyId, preserveSelectedBaby: boolean = true) => {
    try {
      if (!preserveSelectedBaby) {
        setSelectedBabyId('');
        setSelectedBaby(null);
      }

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

  const handleBabySelect = async (babyId: string) => {
    setIsLoading(true);
    try {
      const baby = babies.find(b => b.id === babyId);
      if (!baby) throw new Error('Baby not found');
      
      setSelectedBabyId(babyId);
      setSelectedBaby(baby);
      await refreshActivities(babyId);
    } catch (error) {
      console.error('Error selecting baby:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 mx-4 my-4">
      {/* Baby Selector */}
      {!isLoading && babies.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {babies.map((baby) => (
            <Card 
              key={baby.id}
              className={`cursor-pointer transition-all duration-200 rounded-full text-white p-1 ${
                baby.gender === 'MALE' 
                  ? 'bg-gradient-to-br from-blue-400 to-blue-600'
                  : baby.gender === 'FEMALE'
                  ? 'bg-gradient-to-br from-pink-400 to-pink-600'
                  : 'bg-gradient-to-br from-gray-400 to-gray-600'
              } ${
                selectedBabyId === baby.id 
                  ? 'ring-2 ring-white shadow-lg transform scale-[1.02]'
                  : 'hover:shadow-md hover:scale-[1.01] px-1 py-1'
              }`}
              onClick={() => handleBabySelect(baby.id)}
            >
              <CardHeader className="p-2">
                <CardTitle className="flex text-sm items-center space-x-2 text-lg text-white">
                  <div className="flex items-center">
                    <BabyIcon className="h-5 w-5 text-lg text-white" />
                    {sleepingBabies.has(baby.id) && (
                      <Moon className="h-4 w-4 text-white ml-1" />
                    )}
                  </div>
                  <span>{baby.firstName}</span>
                </CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      {selectedBaby && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <Button
            variant="default"
            size="lg"
            className="h-36 sm:h-40 flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200 rounded-2xl"
            onClick={() => setShowSleepModal(true)}
          >
            <div className="w-16 h-16 rounded-xl bg-gray-400/20 flex items-center justify-center">
              <Moon className="h-10 w-10" />
            </div>
            <span className="text-base font-medium">
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
            className="h-36 sm:h-40 flex flex-col items-center justify-center gap-4 bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200 rounded-2xl"
            onClick={() => setShowDiaperModal(true)}
          >
            <div className="w-16 h-16 rounded-xl bg-teal-500/20 flex items-center justify-center">
              <Icon iconNode={diaper} className="h-10 w-10" />
            </div>
            <span className="text-base font-medium">Diaper</span>
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
              onActivityDeleted={() => refreshActivities(selectedBaby?.id)}
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
            // Re-check sleep status after activities refresh
            const response = await fetch(`/api/sleep-log?babyId=${selectedBaby.id}`);
            if (response.ok) {
              const data = await response.json();
              if (data.success) {
                const hasOngoingSleep = data.data.some((log: SleepLogResponse) => !log.endTime);
                setSleepingBabies(prev => {
                  const newSet = new Set(prev);
                  if (hasOngoingSleep) {
                    newSet.add(selectedBaby.id);
                  } else {
                    newSet.delete(selectedBaby.id);
                  }
                  return newSet;
                });
              }
            }
          }
        }}
        isSleeping={sleepingBabies.has(selectedBaby?.id || '')}
        onSleepToggle={() => {
          const newSleepingBabies = new Set(sleepingBabies);
          if (selectedBaby) {
            if (sleepingBabies.has(selectedBaby.id)) {
              newSleepingBabies.delete(selectedBaby.id);
            } else {
              newSleepingBabies.add(selectedBaby.id);
            }
            setSleepingBabies(newSleepingBabies);
          }
        }}
        babyId={selectedBaby?.id}
        initialTime={localTime}
      />
      <FeedModal
        open={showFeedModal}
        onClose={() => {
          setShowFeedModal(false);
          refreshActivities(selectedBaby?.id);
        }}
        babyId={selectedBaby?.id}
        initialTime={localTime}
      />
      <DiaperModal
        open={showDiaperModal}
        onClose={() => {
          setShowDiaperModal(false);
          refreshActivities(selectedBaby?.id);
        }}
        babyId={selectedBaby?.id}
        initialTime={localTime}
      />
      <NoteModal
        open={showNoteModal}
        onClose={() => {
          setShowNoteModal(false);
          refreshActivities(selectedBaby?.id);
        }}
        babyId={selectedBaby?.id}
        initialTime={localTime}
      />
      <SettingsModal
        open={showSettingsModal}
        onClose={() => {
          setShowSettingsModal(false);
          refreshBabies();
          refreshActivities(selectedBaby?.id);
        }}
        onBabySelect={handleBabySelect}
        onBabyStatusChange={refreshBabies}
      />
    </div>
  );
}
