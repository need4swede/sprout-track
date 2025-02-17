import { SleepLog, FeedLog, DiaperLog, MoodLog, Note, Settings } from '@prisma/client';
import { Card } from '@/components/ui/card';
import {
  Moon,
  Baby as BabyIcon,
  Trash2,
  Icon,
  Edit,
} from 'lucide-react';
import { diaper, bottleBaby } from '@lucide/lab';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

type ActivityType = SleepLog | FeedLog | DiaperLog | MoodLog | Note;

interface TimelineProps {
  activities: ActivityType[];
  onActivityDeleted?: () => void;
}

const getActivityIcon = (activity: ActivityType) => {
  if ('type' in activity) {
    if ('duration' in activity) {
      return <Moon className="h-4 w-4 text-white" />; // Sleep activity
    }
    if ('amount' in activity) {
      return <Icon iconNode={bottleBaby} className="h-4 w-4 text-gray-700" />; // Feed activity
    }
    if ('condition' in activity) {
      return <Icon iconNode={diaper} className="h-4 w-4 text-white" />; // Diaper activity
    }
  }
  if ('content' in activity) {
    return <Edit className="h-4 w-4 text-gray-700" />; // Note activity
  }
  return null;
};

const getActivityTime = (activity: ActivityType): Date => {
  if ('time' in activity && activity.time) {
    return new Date(activity.time);
  }
  if ('startTime' in activity && activity.startTime) {
    if ('duration' in activity && activity.endTime) {
      return new Date(activity.endTime);
    }
    return new Date(activity.startTime);
  }
  return new Date();
};

const formatTime = (date: Date | string, settings: Settings | null, includeDate: boolean = true) => {
  if (!date) return 'Invalid Date';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return 'Invalid Date';

    const timeStr = dateObj.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: settings?.timezone || 'America/Chicago',
    });

    if (!includeDate) return timeStr;

    const localDate = new Date(dateObj.toLocaleString('en-US', {
      timeZone: settings?.timezone || 'America/Chicago'
    }));
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isToday = localDate.toDateString() === today.toDateString();
    const isYesterday = localDate.toDateString() === yesterday.toDateString();

    if (isToday) return `Today`;
    if (isYesterday) return `Yesterday`;
    return localDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
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
          { label: 'Amount', value: `${activity.amount || 'unknown'}${activity.type === 'BREAST' ? ' minutes' : activity.type === 'BOTTLE' ? ' oz' : ' g'}` },
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
  return { title: 'Activity', details: [] };
};

const getActivityDescription = (activity: ActivityType, settings: Settings | null) => {
  if ('type' in activity) {
    if ('duration' in activity) {
      const startTime = activity.startTime ? formatTime(new Date(activity.startTime), settings, false) : 'unknown';
      const endTime = activity.endTime ? formatTime(new Date(activity.endTime), settings, false) : 'ongoing';
      return `${activity.type === 'NAP' ? 'Nap' : 'Night Sleep'}: ${startTime} - ${endTime}`;
    }
    if ('amount' in activity) {
      return `Fed ${activity.amount || 'unknown'}${activity.type === 'BREAST' ? ' minutes' : activity.type === 'BOTTLE' ? ' oz' : ' g'}`;
    }
    if ('condition' in activity) {
      return `${activity.type.toLowerCase()} diaper change`;
    }
  }
  if ('content' in activity) {
    return activity.content;
  }
  return 'Activity logged';
};

const getActivityEndpoint = (activity: ActivityType): string => {
  if ('duration' in activity) return 'sleep-log';
  if ('amount' in activity) return 'feed-log';
  if ('condition' in activity) return 'diaper-log';
  if ('content' in activity) return 'note';
  return '';
};

const getActivityStyle = (activity: ActivityType): { bg: string, textColor: string } => {
  if ('type' in activity) {
    if ('duration' in activity) {
      return {
        bg: 'bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600',
        textColor: 'text-white',
      };
    }
    if ('amount' in activity) {
      return {
        bg: 'bg-sky-200',
        textColor: 'text-gray-700',
      };
    }
    if ('condition' in activity) {
      return {
        bg: 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700',
        textColor: 'text-white',
      };
    }
  }
  if ('content' in activity) {
    return {
      bg: 'bg-[#FFFF99]',
      textColor: 'text-gray-700',
    };
  }
  return {
    bg: 'bg-gray-100',
    textColor: 'text-gray-700',
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
    .slice(0, 5);

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
          const style = getActivityStyle(activity);
          return (
            <div
              key={activity.id}
              className="group hover:bg-gray-50/50 transition-colors duration-200 cursor-pointer"
              onClick={() => setSelectedActivity(activity)}
            >
              <div className="flex items-center px-6 py-4">
                <div className={`flex-shrink-0 ${style.bg} p-3 rounded-xl mr-4`}>
                  {getActivityIcon(activity)}
                </div>
                <div className="min-w-0 flex-1 flex items-center justify-between">
                  <p className="timeline-text">
                    {getActivityDescription(activity, settings)}
                  </p>
                  <div className="flex items-center gap-4">
                    <span className="timeline-time px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100">
                      {'duration' in activity && 'endTime' in activity
                        ? activity.endTime
                          ? `${formatTime(getActivityTime(activity), settings, true)} (${activity.duration} min)`
                          : `${formatTime(getActivityTime(activity), settings, true)} (ongoing)`
                        : formatTime(getActivityTime(activity), settings, true) + ' ' + 
                          getActivityTime(activity).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true,
                            timeZone: settings?.timezone || 'America/Chicago',
                          })
                      }
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
