import { SleepLog, FeedLog, DiaperLog, MoodLog, Note, Settings } from '@prisma/client';
import { Card } from '@/components/ui/card';
import {
  MoreVertical,
  Moon,
  Droplet,
  Baby,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState, useEffect } from 'react';

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
      return <Baby className="h-4 w-4" />; // Diaper activity
    }
  }
  return null;
};

const getActivityTime = (activity: ActivityType): Date => {
  if ('time' in activity) {
    return new Date(activity.time);
  }
  if ('startTime' in activity) {
    return new Date(activity.startTime);
  }
  return new Date(); // This should never happen as all activities should have a timestamp
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

export default function Timeline({ activities, onActivityDeleted }: TimelineProps) {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const data = await response.json();
          setSettings(data.data);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };

    fetchSettings();
  }, []);

  // Sort activities by time, most recent first
  const sortedActivities = [...activities].sort((a, b) => 
    getActivityTime(b).getTime() - getActivityTime(a).getTime()
  );

  const handleDelete = async (activity: ActivityType) => {
    try {
      const endpoint = getActivityEndpoint(activity);
      if (!endpoint) {
        console.error('Unknown activity type');
        return;
      }

      const response = await fetch(`/api/${endpoint}?id=${activity.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Notify parent component to refresh data
        onActivityDeleted?.();
      } else {
        console.error('Failed to delete activity');
      }
    } catch (error) {
      console.error('Error deleting activity:', error);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Recent Activity</h2>
      <div className="space-y-2">
        {sortedActivities.length === 0 ? (
          <Card className="p-4 text-center text-gray-500">
            No activities logged yet
          </Card>
        ) : (
          sortedActivities.map((activity) => {
            const activityTime = getActivityTime(activity);
            return (
              <Card key={activity.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-gray-100 rounded-full">
                      {getActivityIcon(activity)}
                    </div>
                    <div>
                      <p className="font-medium">{getActivityDescription(activity, settings)}</p>
                      <p className="text-sm text-gray-500">
                        {formatTime(activityTime, settings)}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-2 hover:bg-gray-100 rounded-full">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => handleDelete(activity)}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
