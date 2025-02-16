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

  // Fetch babies on mount
  useEffect(() => {
    const fetchBabies = async () => {
      try {
        const response = await fetch('/api/baby');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setBabies(data.data);
            // If there's only one baby, select it automatically
            if (data.data.length === 1) {
              setSelectedBabyId(data.data[0].id);
              setSelectedBaby(data.data[0]);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching babies:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBabies();
  }, []);

  // Fetch activities when selected baby changes
  useEffect(() => {
    const fetchActivities = async () => {
      if (!selectedBaby) return;
      
      try {
        // Fetch sleep logs
        const sleepResponse = await fetch(`/api/sleep-log?babyId=${selectedBaby.id}`);
        const sleepData = await sleepResponse.json();
        const sleepLogs = sleepData.success ? sleepData.data : [];

        // Fetch feed logs
        const feedResponse = await fetch(`/api/feed-log?babyId=${selectedBaby.id}`);
        const feedData = await feedResponse.json();
        const feedLogs = feedData.success ? feedData.data : [];

        // Fetch diaper logs
        const diaperResponse = await fetch(`/api/diaper-log?babyId=${selectedBaby.id}`);
        const diaperData = await diaperResponse.json();
        const diaperLogs = diaperData.success ? diaperData.data : [];

        // Combine all activities
        const allActivities = [
          ...sleepLogs,
          ...feedLogs,
          ...diaperLogs,
        ];

        setActivities(allActivities);
      } catch (error) {
        console.error('Error fetching activities:', error);
      }
    };

    fetchActivities();
  }, [selectedBaby]);

  // Quick action buttons configuration
  const quickActions = [
    {
      icon: <Moon className="h-6 w-6" />,
      label: isSleeping ? 'Stop Sleep' : 'Start Sleep',
      onClick: () => selectedBaby && setShowSleepModal(true),
      active: isSleeping,
      disabled: !selectedBaby,
    },
    {
      icon: <Droplet className="h-6 w-6" />,
      label: 'Feed',
      onClick: () => selectedBaby && setShowFeedModal(true),
      disabled: !selectedBaby,
    },
    {
      icon: <BabyIcon className="h-6 w-6" />,
      label: 'Diaper',
      onClick: () => selectedBaby && setShowDiaperModal(true),
      disabled: !selectedBaby,
    },
  ];

  const handleBabySelect = (babyId: string) => {
    setSelectedBabyId(babyId);
    const baby = babies.find(b => b.id === babyId);
    setSelectedBaby(baby || null);
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
    <main className="min-h-screen w-full max-w-4xl mx-auto p-4 space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-4 p-4 bg-white rounded-lg shadow">
        <div className="flex-1">
          <Select 
            value={selectedBabyId}
            onValueChange={handleBabySelect}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder={isLoading ? "Loading..." : "Select a baby"} />
            </SelectTrigger>
            <SelectContent>
              {babies.map((baby) => (
                <SelectItem key={baby.id} value={baby.id}>
                  {baby.firstName} {baby.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            setIsEditing(true);
            setShowBabyModal(true);
          }}
          disabled={!selectedBaby}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          onClick={() => {
            setIsEditing(false);
            setShowBabyModal(true);
          }}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickActions.map((action, index) => (
          <Card
            key={index}
            className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
              action.active ? 'bg-primary text-primary-foreground' : ''
            } ${action.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={action.disabled ? undefined : action.onClick}
          >
            <div className="flex flex-col items-center justify-center space-y-2">
              {action.icon}
              <span className="text-sm font-medium">{action.label}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Timeline */}
      {selectedBaby && <Timeline activities={activities} />}

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
