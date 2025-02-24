import { SleepType, FeedType, DiaperType, Settings } from '@prisma/client';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Moon,
  Baby as BabyIcon,
  Trash2,
  Icon,
  Edit,
  Pencil,
  Calendar,
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

interface ActivityDetail {
  label: string;
  value: string;
}

interface ActivityDescription {
  type: string;
  details: ActivityDetail[];
}

interface FullLogTimelineProps {
  activities: ActivityType[];
  onActivityDeleted?: () => void;
  startDate: Date;
  endDate: Date;
  onDateRangeChange: (startDate: Date, endDate: Date) => void;
}

// Reuse functions from Timeline component
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

// Reuse other helper functions from Timeline component
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

const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `(${hours.toString().padStart(2, '0')}:${remainingMinutes.toString().padStart(2, '0')})`;
};

const getActivityDescription = (activity: ActivityType, settings: Settings | null) => {
  if ('type' in activity) {
    if ('duration' in activity) {
      const startTimeFormatted = activity.startTime ? formatTime(activity.startTime, settings, true) : 'unknown';
      const endTimeFormatted = activity.endTime ? formatTime(activity.endTime, settings, true) : 'ongoing';
      const duration = activity.duration ? ` ${formatDuration(activity.duration)}` : '';
      const location = activity.location === 'OTHER' ? 'Other' : activity.location?.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ');
      return {
        type: `${activity.type === 'NAP' ? 'Nap' : 'Night Sleep'}${location ? ` - ${location}` : ''}`,
        details: `${startTimeFormatted} - ${endTimeFormatted.split(' ').slice(-2).join(' ')}${duration}`
      };
    }
    if ('amount' in activity) {
      const formatFeedType = (type: string) => {
        switch (type) {
          case 'BREAST': return 'Breast';
          case 'BOTTLE': return 'Bottle';
          case 'SOLIDS': return 'Solid Food';
          default: return type.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          ).join(' ');
        }
      };
      const formatBreastSide = (side: string) => {
        switch (side) {
          case 'LEFT': return 'Left';
          case 'RIGHT': return 'Right';
          default: return side.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          ).join(' ');
        }
      };
      
      let details = '';
      if (activity.type === 'BREAST') {
        const side = activity.side ? `Side: ${formatBreastSide(activity.side)}` : '';
        const duration = activity.amount ? `${activity.amount} min` : '';
        details = [side, duration].filter(Boolean).join(', ');
      } else if (activity.type === 'BOTTLE') {
        details = `${activity.amount || 'unknown'} oz`;
      } else if (activity.type === 'SOLIDS') {
        details = `${activity.amount || 'unknown'} g`;
        if (activity.food) {
          details += ` of ${activity.food}`;
        }
      }
      
      const time = formatTime(activity.time, settings, true);
      return {
        type: formatFeedType(activity.type),
        details: `${details} - ${time}`
      };
    }
    if ('condition' in activity) {
      const formatDiaperType = (type: string) => {
        switch (type) {
          case 'WET': return 'Wet';
          case 'DIRTY': return 'Dirty';
          case 'BOTH': return 'Wet and Dirty';
          default: return type.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          ).join(' ');
        }
      };
      const formatDiaperCondition = (condition: string) => {
        switch (condition) {
          case 'NORMAL': return 'Normal';
          case 'LOOSE': return 'Loose';
          case 'FIRM': return 'Firm';
          case 'OTHER': return 'Other';
          default: return condition.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          ).join(' ');
        }
      };
      const formatDiaperColor = (color: string) => {
        switch (color) {
          case 'YELLOW': return 'Yellow';
          case 'BROWN': return 'Brown';
          case 'GREEN': return 'Green';
          case 'OTHER': return 'Other';
          default: return color.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          ).join(' ');
        }
      };
      
      let details = '';
      if (activity.type !== 'WET') {
        const conditions = [];
        if (activity.condition) conditions.push(formatDiaperCondition(activity.condition));
        if (activity.color) conditions.push(formatDiaperColor(activity.color));
        if (conditions.length > 0) {
          details = ` (${conditions.join(', ')}) - `;
        }
      }
      
      const time = formatTime(activity.time, settings, true);
      return {
        type: formatDiaperType(activity.type),
        details: `${details}${time}`
      };
    }
  }
  if ('content' in activity) {
    const time = formatTime(activity.time, settings, true);
    const truncatedContent = activity.content.length > 50 ? activity.content.substring(0, 50) + '...' : activity.content;
    return {
      type: activity.category || 'Note',
      details: `${time} - ${truncatedContent}`
    };
  }
  return {
    type: 'Activity',
    details: 'logged'
  };
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

const FullLogTimeline = ({ activities, onActivityDeleted, startDate, endDate, onDateRangeChange }: FullLogTimelineProps) => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<ActivityType | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>(null);
  const [editModalType, setEditModalType] = useState<'sleep' | 'feed' | 'diaper' | 'note' | null>(null);
  const [itemsPerPage, setItemsPerPage] = useState(20);
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

  const handleQuickFilter = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    onDateRangeChange(start, end);
  };

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

    const endpoint = 'duration' in activity ? 'sleep-log' :
                    'amount' in activity ? 'feed-log' :
                    'condition' in activity ? 'diaper-log' :
                    'content' in activity ? 'note' : '';

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
    <div className="flex flex-col h-[calc(100vh-80px)] border-t-[1px] border-white">
      {/* Header */}
      <CardHeader className="py-2 bg-gradient-to-r from-teal-600 to-teal-700 border-0">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex justify-center sm:justify-start">
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
            <div className="flex justify-center sm:justify-end">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickFilter(2)}
                  className="bg-gray-100 hover:bg-gray-200 text-teal-700"
                >
                  Last 2 Days
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickFilter(7)}
                  className="bg-gray-100 hover:bg-gray-200 text-teal-700"
                >
                  Last 7 Days
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickFilter(30)}
                  className="bg-gray-100 hover:bg-gray-200 text-teal-700"
                >
                  Last 30 Days
                </Button>
              </div>
            </div>
          </div>

          <div className="flex justify-center items-center">
            <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
              <input
                type="date"
                className="h-8 px-2 rounded-md border border-gray-200 text-sm bg-gray-100 hover:bg-gray-200 text-teal-700"
                value={startDate.toISOString().split('T')[0]}
                onChange={(e) => {
                  const newDate = new Date(e.target.value);
                  onDateRangeChange(newDate, endDate);
                }}
              />
              <span className="text-white">-</span>
              <input
                type="date"
                className="h-8 px-2 rounded-md border border-gray-200 text-sm bg-gray-100 hover:bg-gray-200 text-teal-700"
                value={endDate.toISOString().split('T')[0]}
                onChange={(e) => {
                  const newDate = new Date(e.target.value);
                  onDateRangeChange(startDate, newDate);
                }}
              />
            </div>
          </div>
        </div>
      </CardHeader>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto bg-white">
        <div className="divide-y divide-gray-100 h-full">
          {sortedActivities.map((activity) => {
            const style = getActivityStyle(activity);
            const description = getActivityDescription(activity, settings);
            return (
              <div
                key={activity.id}
                className="group hover:bg-gray-50/50 transition-colors duration-200 cursor-pointer"
                onClick={() => setSelectedActivity(activity)}
              >
                <div className="flex items-center px-6 py-3">
                  <div className={`flex-shrink-0 ${style.bg} p-2 rounded-xl mr-4`}>
                    {getActivityIcon(activity)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className={`inline-flex items-center rounded-md bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10`}>
                        {description.type}
                      </span>
                        <span className="text-gray-900">{description.details}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Empty State */}
        {sortedActivities.length === 0 && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-100 flex items-center justify-center">
                <BabyIcon className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No activities recorded</h3>
              <p className="text-sm text-gray-500">
                Activities will appear here once you start tracking
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {activities.length > 0 && (
        <div className="flex justify-between items-center px-6 py-4 border-t border-gray-100 bg-gray-50">
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
        <DialogContent className="dialog-content !p-4 sm:!p-6">
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
              <span>{selectedActivity ? getActivityDescription(selectedActivity, settings).type : ''}</span>
            </DialogTitle>
          </DialogHeader>
          {selectedActivity && (
            <div className="mt-4 space-y-4">
              <div className="text-sm text-gray-900">
                {getActivityDescription(selectedActivity, settings).details}
              </div>
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

export default FullLogTimeline;
