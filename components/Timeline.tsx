import { SleepLog, FeedLog, DiaperLog, MoodLog, Note, Settings } from '@prisma/client';
import { Card } from '@/components/ui/card';
import {
  MoreVertical,
  Moon,
  Droplet,
  Baby as BabyIcon,
  Trash2,
  X,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

type ActivityType = SleepLog | FeedLog | DiaperLog | MoodLog | Note;

interface TimelineProps {
  activities: ActivityType[];
  onActivityDeleted?: () => void;
}

const getActivityIcon = (activity: ActivityType) => {
  if ('type' in activity) {
    if ('duration' in activity) {
      return <Moon className="h-4 w-4" />; // Sleep activity
    }
    if ('amount' in activity) {
      return <Droplet className="h-4 w-4" />; // Feed activity
    }
    if ('condition' in activity) {
      return <BabyIcon className="h-4 w-4" />; // Diaper activity
    }
  }
  return null;
};

const getActivityTime = (activity: ActivityType): Date => {
  if ('time' in activity) {
    return new Date(activity.time);
  }
  if ('startTime' in activity) {
    const date = new Date(activity.startTime);
    // Check if the date is valid
    return isNaN(date.getTime()) ? new Date() : date;
  }
  return new Date();
};

const formatTime = (date: Date, settings: Settings | null) => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return 'Invalid Date';
  }

  try {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: settings?.timezone || 'America/Chicago',
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'Invalid Date';
  }
};

const getActivityDetails = (activity: ActivityType, settings: Settings | null) => {
  if ('type' in activity) {
    if ('duration' in activity) {
      const startTime = formatTime(new Date(activity.startTime), settings);
      const endTime = activity.endTime ? formatTime(new Date(activity.endTime), settings) : 'ongoing';
      return {
        title: 'Sleep Record',
        details: [
          { label: 'Type', value: activity.type },
          { label: 'Start Time', value: startTime },
          { label: 'End Time', value: endTime },
          { label: 'Duration', value: `${activity.duration || 'unknown'} minutes` },
          { label: 'Quality', value: activity.quality || 'Not specified' },
          { label: 'Location', value: activity.location || 'Not specified' },
        ],
      };
    }
    if ('amount' in activity) {
      return {
        title: 'Feed Record',
        details: [
          { label: 'Type', value: activity.type },
          { label: 'Amount', value: `${activity.amount || 'unknown'}${activity.type === 'BREAST' ? ' minutes' : 'ml'}` },
          { label: 'Side', value: activity.side || 'Not specified' },
          { label: 'Food', value: activity.food || 'Not specified' },
        ],
      };
    }
    if ('condition' in activity) {
      return {
        title: 'Diaper Record',
        details: [
          { label: 'Type', value: activity.type },
          { label: 'Condition', value: activity.condition || 'Not specified' },
          { label: 'Color', value: activity.color || 'Not specified' },
        ],
      };
    }
  }
  if ('content' in activity) {
    return {
      title: 'Note',
      details: [
        { label: 'Content', value: activity.content },
        { label: 'Category', value: activity.category || 'Not specified' },
      ],
    };
  }
  if ('mood' in activity) {
    return {
      title: 'Mood Record',
      details: [
        { label: 'Mood', value: activity.mood },
        { label: 'Intensity', value: activity.intensity?.toString() || 'Not specified' },
        { label: 'Duration', value: activity.duration ? `${activity.duration} minutes` : 'Not specified' },
      ],
    };
  }
  return { title: 'Activity', details: [] };
};

const getActivityDescription = (activity: ActivityType, settings: Settings | null) => {
  if ('type' in activity) {
    if ('duration' in activity) {
      const startTime = formatTime(new Date(activity.startTime), settings);
      const endTime = activity.endTime ? formatTime(new Date(activity.endTime), settings) : 'ongoing';
      return `Slept for ${activity.duration || 'unknown'} minutes (${startTime} - ${endTime})`;
    }
    if ('amount' in activity) {
      return `Fed ${activity.amount || 'unknown'}${activity.type === 'BREAST' ? ' minutes' : 'ml'}`;
    }
    if ('condition' in activity) {
      return `${activity.type.toLowerCase()} diaper change`;
    }
  }
  if ('content' in activity) {
    return activity.content;
  }
  if ('mood' in activity) {
    return `Mood: ${activity.mood.toLowerCase()}`;
  }
  return 'Activity logged';
};

const getActivityEndpoint = (activity: ActivityType): string => {
  if ('duration' in activity) {
    return 'sleep-log';
  }
  if ('amount' in activity) {
    return 'feed-log';
  }
  if ('condition' in activity) {
    return 'diaper-log';
  }
  if ('mood' in activity) {
    return 'mood-log';
  }
  if ('content' in activity) {
    return 'note';
  }
  return '';
};

const getActivityColor = (activity: ActivityType): { bg: string, text: string, icon: string } => {
  if ('duration' in activity) {
    return {
      bg: 'bg-indigo-100',
      text: 'text-indigo-700',
      icon: 'text-indigo-500',
    };
  }
  if ('amount' in activity) {
    return {
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      icon: 'text-blue-500',
    };
  }
  if ('condition' in activity) {
    return {
      bg: 'bg-green-100',
      text: 'text-green-700',
      icon: 'text-green-500',
    };
  }
  if ('mood' in activity) {
    return {
      bg: 'bg-yellow-100',
      text: 'text-yellow-700',
      icon: 'text-yellow-500',
    };
  }
  return {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    icon: 'text-gray-500',
  };
};

const Timeline = ({ activities, onActivityDeleted }: TimelineProps) => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<ActivityType | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSettings(data.data);
        }
      }
    };
    fetchSettings();
  }, []);

  const sortedActivities = [...activities]
    .sort((a, b) => {
      const timeA = getActivityTime(a);
      const timeB = getActivityTime(b);
      return timeB.getTime() - timeA.getTime();
    })
    .slice(0, 5); // Only show the 5 most recent activities

  const handleDelete = async (activity: ActivityType) => {
    if (!confirm('Are you sure you want to delete this activity?')) return;

    const endpoint = getActivityEndpoint(activity);
    try {
      const response = await fetch(`/api/${endpoint}?id=${activity.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSelectedActivity(null);
        onActivityDeleted?.();
      }
    } catch (error) {
      console.error('Error deleting activity:', error);
    }
  };

  return (
    <div>
      <div className="divide-y divide-gray-100">
        {sortedActivities.map((activity) => {
          const colors = getActivityColor(activity);
          return (
            <div
              key={activity.id}
              className="group hover:bg-gray-50/50 transition-colors duration-200 cursor-pointer"
              onClick={() => setSelectedActivity(activity)}
            >
              <div className="flex items-center px-6 py-4">
                {/* Icon */}
                <div className={`flex-shrink-0 ${colors.bg} p-3 rounded-xl mr-4`}>
                  {getActivityIcon(activity)}
                </div>
                
                {/* Content */}
                <div className="min-w-0 flex-1 flex items-center justify-between">
                  <p className="timeline-text">
                    {getActivityDescription(activity, settings)}
                  </p>
                  <div className="flex items-center gap-4">
                    <span className="timeline-time px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100">
                      {formatTime(getActivityTime(activity), settings)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Empty State */}
      {sortedActivities.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-100 flex items-center justify-center">
            <BabyIcon className="h-8 w-8 text-indigo-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No activities recorded</h3>
          <p className="text-sm text-gray-500">
            Activities will appear here once you start tracking
          </p>
        </div>
      )}

      {/* Activity Details Dialog */}
      <Dialog open={!!selectedActivity} onOpenChange={() => setSelectedActivity(null)}>
        <DialogContent className="overflow-hidden p-4 w-[95%] max-w-[400px] rounded-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Button
                variant="destructive"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleDelete(selectedActivity!)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <span>{selectedActivity ? getActivityDetails(selectedActivity, settings).title : ''}</span>
            </DialogTitle>
          </DialogHeader>
          {selectedActivity && (
            <div className="mt-4 space-y-4">
              {getActivityDetails(selectedActivity, settings).details.map((detail, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">{detail.label}:</span>
                  <span className="text-sm text-gray-900">{detail.value}</span>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Timeline;
