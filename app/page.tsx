'use client';

import { useState } from 'react';
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
  const [selectedBaby, setSelectedBaby] = useState<Baby | null>(null);
  const [showBabyModal, setShowBabyModal] = useState(false);
  const [showSleepModal, setShowSleepModal] = useState(false);
  const [showFeedModal, setShowFeedModal] = useState(false);
  const [showDiaperModal, setShowDiaperModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSleeping, setIsSleeping] = useState(false);
  const [activities, setActivities] = useState<ActivityType[]>([]);

  // Quick action buttons configuration
  const quickActions = [
    {
      icon: <Moon className="h-6 w-6" />,
      label: isSleeping ? 'Stop Sleep' : 'Start Sleep',
      onClick: () => setShowSleepModal(true),
      active: isSleeping,
    },
    {
      icon: <Droplet className="h-6 w-6" />,
      label: 'Feed',
      onClick: () => setShowFeedModal(true),
    },
    {
      icon: <BabyIcon className="h-6 w-6" />,
      label: 'Diaper',
      onClick: () => setShowDiaperModal(true),
    },
  ];

  return (
    <main className="min-h-screen w-full max-w-4xl mx-auto p-4 space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-4 p-4 bg-white rounded-lg shadow">
        <div className="flex-1">
          <Select onValueChange={(value) => console.log(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select a baby" />
            </SelectTrigger>
            <SelectContent>
              {/* Will be populated from API */}
              <SelectItem value="placeholder">Select a baby</SelectItem>
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
            }`}
            onClick={action.onClick}
          >
            <div className="flex flex-col items-center justify-center space-y-2">
              {action.icon}
              <span className="text-sm font-medium">{action.label}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Timeline */}
      <Timeline activities={activities} />

      {/* Modals */}
      <BabyModal
        open={showBabyModal}
        onClose={() => setShowBabyModal(false)}
        isEditing={isEditing}
        baby={isEditing ? selectedBaby : null}
      />
      <SleepModal
        open={showSleepModal}
        onClose={() => setShowSleepModal(false)}
        isSleeping={isSleeping}
        onSleepToggle={() => setIsSleeping(!isSleeping)}
      />
      <FeedModal
        open={showFeedModal}
        onClose={() => setShowFeedModal(false)}
      />
      <DiaperModal
        open={showDiaperModal}
        onClose={() => setShowDiaperModal(false)}
      />
    </main>
  );
}
