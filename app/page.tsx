'use client';

import { useEffect, useState } from 'react';
import { Baby, SleepLog, FeedLog, DiaperLog, MoodLog, Note } from '@prisma/client';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Baby as BabyIcon, 
  Moon, 
  Droplet,
  Plus,
  Edit,
} from 'lucide-react';
import BabyModal from '@/components/modals/BabyModal';
import SleepModal from '@/components/modals/SleepModal';
import FeedModal from '@/components/modals/FeedModal';
import DiaperModal from '@/components/modals/DiaperModal';
import Timeline from '@/components/Timeline';

type ActivityType = SleepLog | FeedLog | DiaperLog | MoodLog | Note;

export default function Home() {
  // State management
  const [babies, setBabies] = useState<Baby[]>([]);
  const [selectedBabyId, setSelectedBabyId] = useState<string>('');
  const [selectedBaby, setSelectedBaby] = useState<Baby | null>(null);
  const [showBabyModal, setShowBabyModal] = useState(false);
  const [showSleepModal, setShowSleepModal] = useState(false);
  const [showFeedModal, setShowFeedModal] = useState(false);
  const [showDiaperModal, setShowDiaperModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSleeping, setIsSleeping] = useState(false);
  const [activities, setActivities] = useState<ActivityType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch babies
        const babyResponse = await fetch('/api/baby');
        if (!babyResponse.ok) return;
        
        const babyData = await babyResponse.json();
        if (!babyData.success) return;
        
        setBabies(babyData.data);
        
        // If there's only one baby, select it automatically
        if (babyData.data.length === 1) {
          const baby = babyData.data[0];
          setSelectedBabyId(baby.id);
          setSelectedBaby(baby);
          
          // Fetch activities for the selected baby
          const [sleepResponse, feedResponse, diaperResponse] = await Promise.all([
            fetch(`/api/sleep-log?babyId=${baby.id}`),
            fetch(`/api/feed-log?babyId=${baby.id}`),
            fetch(`/api/diaper-log?babyId=${baby.id}`)
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
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleBabySelect = async (babyId: string) => {
    setIsLoading(true);
    setSelectedBabyId(babyId);
    const selected = babies.find(b => b.id === babyId);
    setSelectedBaby(selected || null);
    
    if (selected) {
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
        console.error('Error fetching activities:', error);
      }
    } else {
      setActivities([]);
    }
    setIsLoading(false);
  };

  const handleBabyModalClose = async () => {
    setShowBabyModal(false);
    // Refresh babies list
    try {
      const response = await fetch('/api/baby');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setBabies(data.data);
        }
      }
    } catch (error) {
      console.error('Error refreshing babies:', error);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-indigo-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Baby Tracker
            </h1>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Select value={selectedBabyId} onValueChange={handleBabySelect}>
                <SelectTrigger className="w-full sm:w-[200px] bg-white">
                  <SelectValue placeholder="Select a baby" />
                </SelectTrigger>
                <SelectContent>
                  {babies.map((baby) => (
                    <SelectItem key={baby.id} value={baby.id}>
                      {baby.firstName} {baby.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setIsEditing(true);
                  setShowBabyModal(true);
                }}
                className="bg-white hover:bg-indigo-50"
              >
                <Edit className="h-4 w-4 text-indigo-600" />
              </Button>
              <Button
                size="icon"
                onClick={() => {
                  setIsEditing(false);
                  setShowBabyModal(true);
                }}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:shadow-lg"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {selectedBaby ? (
          <div className="space-y-8">
            {/* Action Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              <Button
                variant="default"
                size="lg"
                className="h-28 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                onClick={() => setShowSleepModal(true)}
              >
                <Moon className="h-8 w-8" />
                <span className="text-sm font-medium">Sleep</span>
              </Button>
              <Button
                variant="default"
                size="lg"
                className="h-28 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                onClick={() => setShowFeedModal(true)}
              >
                <Droplet className="h-8 w-8" />
                <span className="text-sm font-medium">Feed</span>
              </Button>
              <Button
                variant="default"
                size="lg"
                className="h-28 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                onClick={() => setShowDiaperModal(true)}
              >
                <BabyIcon className="h-8 w-8" />
                <span className="text-sm font-medium">Diaper</span>
              </Button>
              <Button
                variant="default"
                size="lg"
                className="h-28 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-pink-500 to-pink-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                onClick={() => setShowDiaperModal(true)}
              >
                <Edit className="h-8 w-8" />
                <span className="text-sm font-medium">Note</span>
              </Button>
            </div>

            {/* Timeline Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-indigo-100 shadow-lg overflow-hidden">
              <div className="p-6 border-b border-indigo-100">
                <h2 className="text-xl font-semibold text-indigo-950">Recent Activity</h2>
              </div>
              <div className="p-6">
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
            </div>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-indigo-100 shadow-lg p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-indigo-100 flex items-center justify-center">
              <BabyIcon className="h-10 w-10 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Welcome to Baby Tracker!</h2>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Track your baby's daily activities including sleep, feeding, and diaper changes. Get started by adding your baby's information.
            </p>
            <Button
              onClick={() => setShowBabyModal(true)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              Add Your Baby
            </Button>
          </div>
        )}
      </div>

      {/* Modals */}
      <BabyModal
        open={showBabyModal}
        onClose={handleBabyModalClose}
        isEditing={isEditing}
        baby={isEditing ? selectedBaby : null}
      />
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
    </main>
  );
}
