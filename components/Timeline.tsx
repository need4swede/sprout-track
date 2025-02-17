import { SleepType, FeedType, DiaperType, Settings } from '@prisma/client';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Moon,
  Baby as BabyIcon,
  Trash2,
  Icon,
  Edit,
  Pencil,
} from 'lucide-react';
import { diaper, bottleBaby } from '@lucide/lab';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useMemo } from 'react';
import SleepModal from '@/components/modals/SleepModal';
import FeedModal from '@/components/modals/FeedModal';
import DiaperModal from '@/components/modals/DiaperModal';
import NoteModal from '@/components/modals/NoteModal';
import { SleepLogResponse, FeedLogResponse, DiaperLogResponse, MoodLogResponse, NoteResponse } from '@/app/api/types';

type ActivityType = SleepLogResponse | FeedLogResponse | DiaperLogResponse | MoodLogResponse | NoteResponse;
type FilterType = 'sleep' | 'feed' | 'diaper' | 'note' | null;

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

const getActivityTime = (activity: ActivityType): string => {
  if ('time' in activity && activity.time) {
    return activity.time;
  }
  if ('startTime' in activity && activity.startTime) {
    if ('duration' in activity && activity.endTime) {
      return activity.endTime;
    }
    return activity.startTime;
  }
  return new Date().toLocaleString();
};

const formatTime = (date: string, settings: Settings | null, includeDate: boolean = true) => {
  if (!date) return 'Invalid Date';

  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return 'Invalid Date';

    const timeStr = dateObj.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    if (!includeDate) return timeStr;

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isToday = dateObj.toDateString() === today.toDateString();
    const isYesterday = dateObj.toDateString() === yesterday.toDateString();

    const dateStr = isToday 
      ? 'Today'
      : isYesterday 
      ? 'Yesterday'
      : dateObj.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
    return `${dateStr} ${timeStr}`;
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'Invalid Date';
  }
};

const getActivityDetails = (activity: ActivityType, settings: Settings | null) => {
  if ('type' in activity) {
    if ('duration' in activity) {
      const startTime = formatTime(activity.startTime, settings);
      const endTime = activity.endTime ? formatTime(activity.endTime, settings) : 'ongoing';
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
          { label: 'Time', value: formatTime(activity.time, settings) },
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
          { label: 'Time', value: formatTime(activity.time, settings) },
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
        { label: 'Time', value: formatTime(activity.time, settings) },
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
      const startTime = activity.startTime ? formatTime(activity.startTime, settings, false) : 'unknown';
      const endTime = activity.endTime ? formatTime(activity.endTime, settings, false) : 'ongoing';
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
        bg: 'bg-gradient-to-r from-teal-600 to-teal-700',
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
  const [activeFilter, setActiveFilter] = useState<FilterType>(null);
  const [editModalType, setEditModalType] = useState<'sleep' | 'feed' | 'diaper' | 'note' | null>(null);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

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

  const sortedActivities = useMemo(() => {
    const filtered = !activeFilter 
      ? activities 
      : activities.filter(activity => {
          switch (activeFilter) {
            case 'sleep':
              return 'duration' in activity;
            case 'feed':
              return 'amount' in activity;
            case 'diaper':
              return 'condition' in activity;
            case 'note':
              return 'content' in activity;
            default:
              return true;
          }
        });

    const sorted = [...filtered].sort((a, b) => {
      const timeA = new Date(getActivityTime(a));
      const timeB = new Date(getActivityTime(b));
      return timeB.getTime() - timeA.getTime();
    });

    const startIndex = (currentPage - 1) * itemsPerPage;
    return sorted.slice(startIndex, startIndex + itemsPerPage);
  }, [activities, activeFilter, currentPage, itemsPerPage]);

  const totalPages = useMemo(() => {
    const filtered = !activeFilter 
      ? activities 
      : activities.filter(activity => {
          switch (activeFilter) {
            case 'sleep':
              return 'duration' in activity;
            case 'feed':
              return 'amount' in activity;
            case 'diaper':
              return 'condition' in activity;
            case 'note':
              return 'content' in activity;
            default:
              return true;
          }
        });
    return Math.ceil(filtered.length / itemsPerPage);
  }, [activities, activeFilter, itemsPerPage]);

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
      {/* Header */}
      <CardHeader className="py-4 bg-gradient-to-r from-teal-600 to-teal-700">
        <div className="flex justify-between items-center">
          <CardTitle className="text-white">Recent Activity</CardTitle>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setActiveFilter(activeFilter === 'sleep' ? null : 'sleep')}
              className={`h-8 w-8 ${
                activeFilter === 'sleep'
                  ? 'border-2 border-blue-500 bg-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <Moon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setActiveFilter(activeFilter === 'feed' ? null : 'feed')}
              className={`h-8 w-8 ${
                activeFilter === 'feed'
                  ? 'border-2 border-blue-500 bg-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <Icon iconNode={bottleBaby} className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setActiveFilter(activeFilter === 'diaper' ? null : 'diaper')}
              className={`h-8 w-8 ${
                activeFilter === 'diaper'
                  ? 'border-2 border-blue-500 bg-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <Icon iconNode={diaper} className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setActiveFilter(activeFilter === 'note' ? null : 'note')}
              className={`h-8 w-8 ${
                activeFilter === 'note'
                  ? 'border-2 border-blue-500 bg-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <div className="min-h-[200px]">
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
                        : formatTime(getActivityTime(activity), settings, true)
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
      </div>

      {/* Pagination Controls */}
      {activities.length > 0 && (
        <div className="flex justify-between items-center px-6 py-4 border-t border-gray-100">
        <select
          className="h-8 px-2 rounded-md border border-gray-200 text-sm"
          value={itemsPerPage}
          onChange={(e) => {
            setItemsPerPage(Number(e.target.value));
            setCurrentPage(1);
          }}
        >
          <option value="5">5 per page</option>
          <option value="10">10 per page</option>
          <option value="20">20 per page</option>
          <option value="50">50 per page</option>
        </select>
        
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              {'<'}
            </Button>
            <span className="px-4 py-2 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              {'>'}
            </Button>
          </div>
        )}
      </div>

      )}

      {/* Activity Details Dialog */}
      <Dialog open={!!selectedActivity} onOpenChange={() => setSelectedActivity(null)}>
        <DialogContent className="overflow-hidden p-4 w-[95%] max-w-[400px] rounded-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleDelete(selectedActivity!)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (selectedActivity) {
                      if ('duration' in selectedActivity) setEditModalType('sleep');
                      else if ('amount' in selectedActivity) setEditModalType('feed');
                      else if ('condition' in selectedActivity) setEditModalType('diaper');
                      else if ('content' in selectedActivity) setEditModalType('note');
                    }
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
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

      {/* Edit Modals */}
      {selectedActivity && (
        <>
          <SleepModal
            open={editModalType === 'sleep'}
            onClose={() => {
              setEditModalType(null);
              setSelectedActivity(null);
              onActivityDeleted?.();
            }}
            isSleeping={false}
            onSleepToggle={() => {}}
            babyId={selectedActivity.babyId}
            initialTime={'startTime' in selectedActivity ? selectedActivity.startTime : getActivityTime(selectedActivity)}
            activity={'duration' in selectedActivity && 'type' in selectedActivity ? selectedActivity : undefined}
          />
          <FeedModal
            open={editModalType === 'feed'}
            onClose={() => {
              setEditModalType(null);
              setSelectedActivity(null);
              onActivityDeleted?.();
            }}
            babyId={selectedActivity.babyId}
            initialTime={'time' in selectedActivity ? selectedActivity.time : getActivityTime(selectedActivity)}
            activity={'amount' in selectedActivity && 'type' in selectedActivity ? selectedActivity : undefined}
          />
          <DiaperModal
            open={editModalType === 'diaper'}
            onClose={() => {
              setEditModalType(null);
              setSelectedActivity(null);
              onActivityDeleted?.();
            }}
            babyId={selectedActivity.babyId}
            initialTime={'time' in selectedActivity ? selectedActivity.time : getActivityTime(selectedActivity)}
            activity={'condition' in selectedActivity && 'type' in selectedActivity ? selectedActivity : undefined}
          />
          <NoteModal
            open={editModalType === 'note'}
            onClose={() => {
              setEditModalType(null);
              setSelectedActivity(null);
              onActivityDeleted?.();
            }}
            babyId={selectedActivity.babyId}
            initialTime={'time' in selectedActivity ? selectedActivity.time : getActivityTime(selectedActivity)}
            activity={'content' in selectedActivity && 'time' in selectedActivity ? selectedActivity : undefined}
          />
        </>
      )}
    </div>
  );
};

export default Timeline;
