import { SleepLog, FeedLog, DiaperLog, MoodLog, Note, Settings } from '@prisma/client';
import { Card } from '@/components/ui/card';
import {
  MoreVertical,
  Moon,
  Droplet,
  Baby as BabyIcon,
} from 'lucide-react';
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

const getActivityColor = (activity: ActivityType): { bg: string, text: string, icon: string } => {
  if ('type' in activity) {
    if ('duration' in activity) {
      return {
        bg: 'bg-indigo-100',
        text: 'text-indigo-600',
        icon: 'text-indigo-500'
      };
    }
    if ('amount' in activity) {
      return {
        bg: 'bg-blue-100',
        text: 'text-blue-600',
        icon: 'text-blue-500'
      };
    }
    if ('condition' in activity) {
      return {
        bg: 'bg-purple-100',
        text: 'text-purple-600',
        icon: 'text-purple-500'
      };
    }
  }
  if ('content' in activity) {
    return {
      bg: 'bg-pink-100',
      text: 'text-pink-600',
      icon: 'text-pink-500'
    };
  }
  return {
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    icon: 'text-gray-500'
  };
};

const Timeline = ({ activities, onActivityDeleted }: TimelineProps) => {
  const [settings, setSettings] = useState<Settings | null>(null);

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

  const sortedActivities = [...activities].sort((a, b) => {
    const timeA = getActivityTime(a);
    const timeB = getActivityTime(b);
    return timeB.getTime() - timeA.getTime();
  });

  const handleDelete = async (activity: ActivityType) => {
    if (!confirm('Are you sure you want to delete this activity?')) return;

    const endpoint = getActivityEndpoint(activity);
    try {
      const response = await fetch(`/api/${endpoint}/${activity.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onActivityDeleted?.();
      }
    } catch (error) {
      console.error('Error deleting activity:', error);
    }
  };

  return (
    <div className="overflow-hidden">
      <div className="divide-y divide-gray-100">
        {sortedActivities.map((activity) => {
          const colors = getActivityColor(activity);
          return (
            <div
              key={activity.id}
              className="group hover:bg-gray-50/50 transition-colors duration-200"
            >
              <div className="timeline-item">
                {/* Icon */}
                <div className={`timeline-icon ${colors.bg}`}>
                  {getActivityIcon(activity)}
                </div>
                
                {/* Content */}
                <div className="timeline-content">
                  <p className="text-sm font-medium text-gray-900">
                    {getActivityDescription(activity, settings)}
                  </p>
                  <div className="ml-2 flex-shrink-0 flex items-center gap-4">
                    <span className="flex-shrink-0 inline-block px-3 py-1.5 text-sm font-medium text-gray-500 rounded-full bg-gray-50 border border-gray-100">
                      {formatTime(getActivityTime(activity), settings)}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36">
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600 focus:bg-red-50"
                          onClick={() => handleDelete(activity)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
    </div>
  );
};

export default Timeline;
