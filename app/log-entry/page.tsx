'use client';

import React, { useEffect, useState, useRef, Suspense, useCallback } from 'react';
import { SleepLogResponse, FeedLogResponse, DiaperLogResponse, NoteResponse, BathLogResponse } from '@/app/api/types';
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { StatusBubble } from "@/src/components/ui/status-bubble";
import { Baby as BabyIcon } from 'lucide-react';
import Timeline from '@/src/components/Timeline';
import SettingsModal from '@/src/components/modals/SettingsModal';
import { useBaby } from '../context/baby';
import { ActivityType } from '@/src/components/ui/activity-tile';
import { ActivityTileGroup } from '@/src/components/features/ActivityTileGroup';
import SleepForm from '@/src/components/forms/SleepForm';
import FeedForm from '@/src/components/forms/FeedForm';
import DiaperForm from '@/src/components/forms/DiaperForm';
import NoteForm from '@/src/components/forms/NoteForm';
import BathForm from '@/src/components/forms/bathForm';

function HomeContent(): React.ReactElement {
  const { selectedBaby, sleepingBabies, setSleepingBabies } = useBaby();
  const [showSleepModal, setShowSleepModal] = useState(false);
  const [showFeedModal, setShowFeedModal] = useState(false);
  const [showDiaperModal, setShowDiaperModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showBathModal, setShowBathModal] = useState(false);
  const [activities, setActivities] = useState<ActivityType[]>([]);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [localTime, setLocalTime] = useState<string>('');
  const lastSleepCheck = useRef<string>('');
  const [sleepStartTime, setSleepStartTime] = useState<Record<string, Date>>({});
  const [lastSleepEndTime, setLastSleepEndTime] = useState<Record<string, Date>>({});
  const [lastFeedTime, setLastFeedTime] = useState<Record<string, Date>>({});
  const [lastDiaperTime, setLastDiaperTime] = useState<Record<string, Date>>({});

  // Track the currently selected date in the Timeline component
  const [selectedTimelineDate, setSelectedTimelineDate] = useState<Date | null>(null);

  const refreshActivities = useCallback(async (babyId: string | undefined, dateFilter?: Date) => {
    if (!babyId) return;
    
    try {
      // Add a timestamp to prevent caching
      const timestamp = new Date().getTime();
      
      // If a date filter is provided, use it in the API call
      let url = `/api/timeline?babyId=${babyId}&limit=200&_t=${timestamp}`;
      if (dateFilter) {
        // Update the selected date
        setSelectedTimelineDate(dateFilter);
        url = `/api/timeline?babyId=${babyId}&date=${encodeURIComponent(dateFilter.toISOString())}&_t=${timestamp}`;
        console.log(`Refreshing activities with date filter: ${dateFilter.toISOString()}`);
      } else if (selectedTimelineDate) {
        // If we have a previously selected date, use it
        url = `/api/timeline?babyId=${babyId}&date=${encodeURIComponent(selectedTimelineDate.toISOString())}&_t=${timestamp}`;
        console.log(`Refreshing activities with previous date filter: ${selectedTimelineDate.toISOString()}`);
      } else {
        console.log(`Refreshing activities without date filter`);
      }
      
      // Fetch timeline data
      const timelineResponse = await fetch(url, {
        cache: 'no-store',
        headers: {
          'Pragma': 'no-cache',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Expires': '0'
        }
      });
      const timelineData = await timelineResponse.json();
      
      if (timelineData.success) {
        setActivities(timelineData.data);

        // Update last feed time
        const lastFeed = timelineData.data
          .filter((activity: ActivityType) => 'amount' in activity)
          .sort((a: FeedLogResponse, b: FeedLogResponse) => 
            new Date(b.time).getTime() - new Date(a.time).getTime()
          )[0];
        if (lastFeed) {
          setLastFeedTime(prev => ({
            ...prev,
            [babyId]: new Date(lastFeed.time)
          }));
        }

        // Update last diaper time
        const lastDiaper = timelineData.data
          .filter((activity: ActivityType) => 'condition' in activity)
          .sort((a: DiaperLogResponse, b: DiaperLogResponse) => 
            new Date(b.time).getTime() - new Date(a.time).getTime()
          )[0];
        if (lastDiaper) {
          setLastDiaperTime(prev => ({
            ...prev,
            [babyId]: new Date(lastDiaper.time)
          }));
        }
      }
    } catch (error) {
      console.error('Error refreshing activities:', error);
    }
  }, []);

  // Update unlock timer on any activity
  const updateUnlockTimer = () => {
    const unlockTime = localStorage.getItem('unlockTime');
    if (unlockTime) {
      localStorage.setItem('unlockTime', Date.now().toString());
    }
  };

  useEffect(() => {
    // Set initial time
    const now = new Date();
    setLocalTime(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);

    // Update time every minute
    const interval = setInterval(() => {
      const now = new Date();
      setLocalTime(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
    }, 60000);

    // Add listeners for user activity
    window.addEventListener('click', updateUnlockTimer);
    window.addEventListener('keydown', updateUnlockTimer);
    window.addEventListener('mousemove', updateUnlockTimer);
    window.addEventListener('touchstart', updateUnlockTimer);

    return () => {
      clearInterval(interval);
      window.removeEventListener('click', updateUnlockTimer);
      window.removeEventListener('keydown', updateUnlockTimer);
      window.removeEventListener('mousemove', updateUnlockTimer);
      window.removeEventListener('touchstart', updateUnlockTimer);
    };
  }, []);

  useEffect(() => {
    const initializeData = async () => {
      if (selectedBaby?.id) {
        await refreshActivities(selectedBaby.id);
        await checkSleepStatus(selectedBaby.id);
      }
    };
    
    initializeData();
  }, [selectedBaby, refreshActivities]);

  const [sleepData, setSleepData] = useState<{
    ongoingSleep?: SleepLogResponse;
    lastEndedSleep?: SleepLogResponse & { endTime: string };
  }>({});

  const checkSleepStatus = async (babyId: string) => {
    // Prevent duplicate checks
    const checkId = `${babyId}-${Date.now()}`;
    if (lastSleepCheck.current === checkId) return;
    lastSleepCheck.current = checkId;

    try {
      // Add a timestamp to prevent caching
      const timestamp = new Date().getTime();
      
      const response = await fetch(`/api/timeline?babyId=${babyId}&limit=200&_t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Pragma': 'no-cache',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Expires': '0'
        }
      });
      if (!response.ok) return;
      
      const data = await response.json();
      if (!data.success) return;
      
      // Filter for sleep logs only
      const sleepLogs = data.data
        .filter((activity: ActivityType): activity is SleepLogResponse => 
          'duration' in activity && 'startTime' in activity
        );
      
      // Find ongoing sleep
      const ongoingSleep = sleepLogs.find((log: SleepLogResponse) => !log.endTime);
      
      // Find last ended sleep
      const completedSleeps = sleepLogs
        .filter((log: SleepLogResponse): log is SleepLogResponse & { endTime: string } => 
          log.endTime !== null && typeof log.endTime === 'string'
        )
        .sort((a: SleepLogResponse & { endTime: string }, b: SleepLogResponse & { endTime: string }) => 
          new Date(b.endTime).getTime() - new Date(a.endTime).getTime()
        );
      
      setSleepData({
        ongoingSleep,
        lastEndedSleep: completedSleeps[0]
      });
    } catch (error) {
      console.error('Error checking sleep status:', error);
    }
  };

  // Handle sleep status changes
  useEffect(() => {
    if (!selectedBaby?.id) return;

    const { ongoingSleep, lastEndedSleep } = sleepData;
    
    if (ongoingSleep) {
      setSleepingBabies(prev => {
        const newSet = new Set(prev);
        newSet.add(selectedBaby.id);
        return newSet;
      });
      setSleepStartTime(prev => ({
        ...prev,
        [selectedBaby.id]: new Date(ongoingSleep.startTime)
      }));
    } else {
      setSleepingBabies(prev => {
        const newSet = new Set(prev);
        newSet.delete(selectedBaby.id);
        return newSet;
      });
      setSleepStartTime(prev => {
        const newState = { ...prev };
        delete newState[selectedBaby.id];
        return newState;
      });
      
      if (lastEndedSleep) {
        setLastSleepEndTime(prev => ({
          ...prev,
          [selectedBaby.id]: new Date(lastEndedSleep.endTime)
        }));
      }
    }
  }, [sleepData, selectedBaby]);

  return (
    <div className="relative isolate">
      {/* Activity Tile Group */}
      {selectedBaby?.id && (
        <ActivityTileGroup
          selectedBaby={selectedBaby}
          sleepingBabies={sleepingBabies}
          sleepStartTime={sleepStartTime}
          lastSleepEndTime={lastSleepEndTime}
          lastFeedTime={lastFeedTime}
          lastDiaperTime={lastDiaperTime}
          updateUnlockTimer={updateUnlockTimer}
          onSleepClick={() => setShowSleepModal(true)}
          onFeedClick={() => setShowFeedModal(true)}
          onDiaperClick={() => setShowDiaperModal(true)}
          onNoteClick={() => setShowNoteModal(true)}
          onBathClick={() => setShowBathModal(true)}
        />
      )}

      {/* Timeline Section */}
      {selectedBaby && (
        <Card className="overflow-hidden border-t-[1px] border-b-0 border-l-0 border-r-0 border-white relative z-0">
          {activities.length > 0 ? (
            <Timeline 
              activities={activities} 
              onActivityDeleted={(dateFilter?: Date) => {
                if (selectedBaby?.id) {
                  // If a date filter is provided, use it when refreshing activities
                  if (dateFilter) {
                    console.log(`Refreshing with date filter: ${dateFilter.toISOString()}`);
                    // Don't call refreshActivities here, let the Timeline component handle it
                  } else {
                    refreshActivities(selectedBaby.id);
                  }
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
      {!selectedBaby && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200 shadow-lg p-12 text-center relative z-0">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-teal-100 flex items-center justify-center">
            <BabyIcon className="h-10 w-10 text-teal-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">Welcome to Baby Tracker!</h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Track your baby's daily activities including sleep, feeding, and diaper changes. Get started by adding your baby's information in the settings.
          </p>
          <Button
            onClick={() => {
              updateUnlockTimer();
              setShowSettingsModal(true);
            }}
            className="bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            Open Settings
          </Button>
        </div>
      )}

      {/* Forms */}
      {/* Sleep Form */}
      <SleepForm
        isOpen={showSleepModal}
        onClose={async () => {
          setShowSleepModal(false);
        }}
        isSleeping={selectedBaby?.id ? sleepingBabies.has(selectedBaby.id) : false}
        onSleepToggle={() => {
          if (selectedBaby?.id) {
            setSleepingBabies((prev: Set<string>) => {
              const newSet = new Set(prev);
              if (newSet.has(selectedBaby.id)) {
                newSet.delete(selectedBaby.id);
              } else {
                newSet.add(selectedBaby.id);
              }
              return newSet;
            });
          }
        }}
        babyId={selectedBaby?.id || ''}
        initialTime={localTime}
        onSuccess={async () => {
          if (selectedBaby?.id) {
            await refreshActivities(selectedBaby.id);
            await checkSleepStatus(selectedBaby.id);
          }
        }}
      />
      
      {/* Feed Form */}
      <FeedForm
        isOpen={showFeedModal}
        onClose={() => {
          setShowFeedModal(false);
        }}
        babyId={selectedBaby?.id || ''}
        initialTime={localTime}
        onSuccess={() => {
          if (selectedBaby?.id) {
            refreshActivities(selectedBaby.id);
          }
        }}
      />
      
      {/* Diaper Form */}
      <DiaperForm
        isOpen={showDiaperModal}
        onClose={() => {
          setShowDiaperModal(false);
        }}
        babyId={selectedBaby?.id || ''}
        initialTime={localTime}
        onSuccess={() => {
          if (selectedBaby?.id) {
            refreshActivities(selectedBaby.id);
          }
        }}
      />
      
      {/* Note Form */}
      <NoteForm
        isOpen={showNoteModal}
        onClose={() => {
          setShowNoteModal(false);
        }}
        babyId={selectedBaby?.id || ''}
        initialTime={localTime}
        onSuccess={() => {
          if (selectedBaby?.id) {
            refreshActivities(selectedBaby.id);
          }
        }}
      />
      
      {/* Bath Form */}
      <BathForm
        isOpen={showBathModal}
        onClose={() => {
          setShowBathModal(false);
        }}
        babyId={selectedBaby?.id || ''}
        initialTime={localTime}
        onSuccess={() => {
          if (selectedBaby?.id) {
            refreshActivities(selectedBaby.id);
          }
        }}
      />
      
      {/* Settings Modal */}
      <SettingsModal
        open={showSettingsModal}
        onClose={() => {
          setShowSettingsModal(false);
          if (selectedBaby?.id) {
            refreshActivities(selectedBaby.id);
          }
        }}
        variant="settings"
      />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
