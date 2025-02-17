'use client';

import { useEffect, useState } from 'react';
import { Baby, SleepLog, FeedLog, DiaperLog, MoodLog, Note } from '@prisma/client';
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

type ActivityType = SleepLog | FeedLog | DiaperLog | MoodLog | Note;

export default function Home() {
  // State management
  const [babies, setBabies] = useState<Baby[]>([]);
  const [selectedBabyId, setSelectedBabyId] = useState<string>('');
  const [selectedBaby, setSelectedBaby] = useState<Baby | null>(null);
  const [showSleepModal, setShowSleepModal] = useState(false);
  const [showFeedModal, setShowFeedModal] = useState(false);
  const [showDiaperModal, setShowDiaperModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [isSleeping, setIsSleeping] = useState(false);
  const [activities, setActivities] = useState<ActivityType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

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

  const refreshActivities = async (babyId: string = selectedBabyId) => {
    try {
      const [sleepResponse, feedResponse, diaperResponse] = await Promise.all([
        fetch(`/api/sleep-log?babyId=${babyId}`),
        fetch(`/api/feed-log?babyId=${babyId}`),
        fetch(`/api/diaper-log?babyId=${babyId}`)
      ]);
      
      const [sleepData, feedData, diaperData] = await Promise.all([
        sleepResponse.json(),
        feedResponse.json(),
        diaperResponse.json()
      ]);
      
      const allActivities = [
        ...(sleepData.success ? sleepData.data : []),
        ...(feedData.success ? feedData.data : []),
        ...(diaperData.success ? diaperData.data : [])
      ].map(activity => ({
        ...activity,
        time: activity.time ? new Date(activity.time).toISOString() : undefined,
        startTime: activity.startTime ? new Date(activity.startTime).toISOString() : undefined,
        endTime: activity.endTime ? new Date(activity.endTime).toISOString() : undefined,
      }));
      
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
        <div className="flex flex-wrap gap-4">
          {babies.map((baby) => (
            <Card 
              key={baby.id}
              className={`cursor-pointer transition-all duration-200 flex-1 min-w-[200px] text-white ${
                baby.gender === 'MALE' 
                  ? 'bg-gradient-to-br from-blue-400 to-blue-600'
                  : baby.gender === 'FEMALE'
                  ? 'bg-gradient-to-br from-pink-400 to-pink-600'
                  : 'bg-gradient-to-br from-gray-400 to-gray-600'
              } ${
                selectedBabyId === baby.id 
                  ? 'ring-2 ring-white shadow-lg transform scale-[1.02]'
                  : 'hover:shadow-md hover:scale-[1.01]'
              }`}
              onClick={() => handleBabySelect(baby.id)}
            >
              <CardHeader>
                <CardTitle className="flex text-lg items-center space-x-2 text-white">
                  <BabyIcon 
                    className="h-5 w-5 text-white" 
                  />
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
            className="h-36 sm:h-40 flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-teal-500 via-teal-600 to-teal-700 text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200 rounded-2xl"
            onClick={() => setShowSleepModal(true)}
          >
            <div className="w-16 h-16 rounded-xl bg-teal-400/20 flex items-center justify-center">
              <Moon className="h-10 w-10" />
            </div>
            <span className="text-base font-medium">Sleep</span>
          </Button>
          <Button
            variant="default"
            size="lg"
            className="h-36 sm:h-40 flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-sky-500 via-sky-600 to-sky-700 text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200 rounded-2xl"
            onClick={() => setShowFeedModal(true)}
          >
            <div className="w-16 h-16 rounded-xl bg-blue-400/20 flex items-center justify-center">
              <Icon iconNode={bottleBaby} className="h-10 w-10" />
            </div>
            <span className="text-base font-medium">Feed</span>
          </Button>
          <Button
            variant="default"
            size="lg"
            className="h-36 sm:h-40 flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200 rounded-2xl"
            onClick={() => setShowDiaperModal(true)}
          >
            <div className="w-16 h-16 rounded-xl bg-emerald-400/20 flex items-center justify-center">
              <Icon iconNode={diaper} className="h-10 w-10" />
            </div>
            <span className="text-base font-medium">Diaper</span>
          </Button>
          <Button
            variant="default"
            size="lg"
            className="h-36 sm:h-40 flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-700 text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200 rounded-2xl"
            onClick={() => setShowNoteModal(true)}
          >
            <div className="w-16 h-16 rounded-xl bg-teal-400/20 flex items-center justify-center">
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
        <Card className="overflow-hidden">
          <CardHeader className="py-4">
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <div className="divide-y divide-gray-100">
            {activities.length > 0 ? (
              <Timeline activities={activities} />
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
          </div>
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
        onClose={() => setShowSleepModal(false)}
        isSleeping={isSleeping}
        onSleepToggle={() => setIsSleeping(!isSleeping)}
        babyId={selectedBaby?.id}
      />
      <FeedModal
        open={showFeedModal}
        onClose={() => setShowFeedModal(false)}
        babyId={selectedBaby?.id}
      />
      <DiaperModal
        open={showDiaperModal}
        onClose={() => setShowDiaperModal(false)}
        babyId={selectedBaby?.id}
      />
      <NoteModal
        open={showNoteModal}
        onClose={() => {
          setShowNoteModal(false);
          refreshActivities();
        }}
        babyId={selectedBaby?.id}
      />
      <SettingsModal
        open={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onBabySelect={handleBabySelect}
      />
    </div>
  );
}
