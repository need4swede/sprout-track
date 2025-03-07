import { Settings } from '@prisma/client';
import { Card, CardHeader, CardTitle } from '@/src/components/ui/card';
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
} from '@/src/components/ui/dialog';
import { Button } from '@/src/components/ui/button';
import { useState, useEffect, useMemo } from 'react';
import SleepModal from '@/src/components/modals/SleepModal';
import FeedModal from '@/src/components/modals/FeedModal';
import DiaperModal from '@/src/components/modals/DiaperModal';
import NoteModal from '@/src/components/modals/NoteModal';
import { ActivityTile, ActivityType } from '@/src/components/ui/activity-tile';
import { SleepLogResponse, FeedLogResponse, DiaperLogResponse, MoodLogResponse, NoteResponse } from '@/app/api/types';

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
      return String(activity.endTime);
    }
    return String(activity.startTime);
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
        }).replace(/(\d+)$/, '$1,');
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

const getActivityDetails = (activity: ActivityType, settings: Settings | null) => {
  if ('type' in activity) {
    if ('duration' in activity) {
      const startTime = activity.startTime ? formatTime(activity.startTime, settings, false) : 'unknown';
      const endTime = activity.endTime ? formatTime(activity.endTime, settings, false) : 'ongoing';
      const day = formatTime(activity.startTime, settings, true).split(' ')[0];
      const duration = activity.duration ? ` ${formatDuration(activity.duration)}` : '';
      const formatSleepQuality = (quality: string) => {
        switch (quality) {
          case 'POOR': return 'Poor';
          case 'FAIR': return 'Fair';
          case 'GOOD': return 'Good';
          case 'EXCELLENT': return 'Excellent';
          default: return quality;
        }
      };
      const formatLocation = (location: string) => {
        if (location === 'OTHER') return 'Other';
        
        return location;
      };
      const details = [
        { label: 'Type', value: activity.type === 'NAP' ? 'Nap' : 'Night Sleep' },
        { label: 'Start Time', value: startTime },
      ];
      
      // Only show end time and duration if sleep has ended
      if (activity.endTime) {
        details.push(
          { label: 'End Time', value: endTime },
          { label: 'Duration', value: `${activity.duration || 'unknown'} minutes` }
        );
        // Only show quality if sleep has ended
        if (activity.quality) {
          details.push({ label: 'Quality', value: formatSleepQuality(activity.quality) });
        }
      }
      
      // Always show location if specified
      if (activity.location) {
        details.push({ label: 'Location', value: formatLocation(activity.location) });
      }

      return {
        title: 'Sleep Record',
        details,
      };
    }
    if ('amount' in activity) {
      const formatFeedType = (type: string) => {
        switch (type) {
          case 'BREAST': return 'Breast';
          case 'BOTTLE': return 'Bottle';
          case 'SOLIDS': return 'Solid Food';
          default: return type;
        }
      };
      const formatBreastSide = (side: string) => {
        switch (side) {
          case 'LEFT': return 'Left';
          case 'RIGHT': return 'Right';
          default: return side;
        }
      };
      const details = [
        { label: 'Time', value: formatTime(activity.time, settings) },
        { label: 'Type', value: formatFeedType(activity.type) },
      ];

      // Show amount for bottle and solids
      if (activity.amount && (activity.type === 'BOTTLE' || activity.type === 'SOLIDS')) {
        details.push({ 
          label: 'Amount', 
          value: `${activity.amount}${activity.type === 'BOTTLE' ? ' oz' : ' g'}`
        });
      }

      // Show side for breast feeds
      if (activity.type === 'BREAST') {
        if (activity.side) {
          details.push({ label: 'Side', value: formatBreastSide(activity.side) });
        }
        if (activity.amount) {
          details.push({ label: 'Duration', value: `${activity.amount} minutes` });
        }
      }

      // Show food for solids
      if (activity.type === 'SOLIDS' && activity.food) {
        details.push({ label: 'Food', value: activity.food });
      }

      return {
        title: 'Feed Record',
        details,
      };
    }
    if ('condition' in activity) {
      const formatDiaperType = (type: string) => {
        switch (type) {
          case 'WET': return 'Wet';
          case 'DIRTY': return 'Dirty';
          case 'BOTH': return 'Wet and Dirty';
          default: return type;
        }
      };
      const formatDiaperCondition = (condition: string) => {
        switch (condition) {
          case 'NORMAL': return 'Normal';
          case 'LOOSE': return 'Loose';
          case 'FIRM': return 'Firm';
          case 'OTHER': return 'Other';
          default: return condition;
        }
      };
      const formatDiaperColor = (color: string) => {
        switch (color) {
          case 'YELLOW': return 'Yellow';
          case 'BROWN': return 'Brown';
          case 'GREEN': return 'Green';
          case 'OTHER': return 'Other';
          default: return color;
        }
      };
      const details = [
        { label: 'Time', value: formatTime(activity.time, settings) },
        { label: 'Type', value: formatDiaperType(activity.type) },
      ];

      // Only show condition and color for DIRTY or BOTH types
      if (activity.type !== 'WET') {
        if (activity.condition) {
          details.push({ label: 'Condition', value: formatDiaperCondition(activity.condition) });
        }
        if (activity.color) {
          details.push({ label: 'Color', value: formatDiaperColor(activity.color) });
        }
      }

      return {
        title: 'Diaper Record',
        details,
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
    <div className="flex flex-col h-[calc(100vh-162px)]">
      {/* Header */}
      <CardHeader className="py-2 bg-gradient-to-r from-teal-600 to-teal-700 border-0">
        <div className="flex justify-between items-center">
          <CardTitle className="text-white text-xl">Recent Activity</CardTitle>
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

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="divide-y divide-gray-100 bg-white">
          {sortedActivities.map((activity) => (
            <ActivityTile
              key={activity.id}
              activity={activity}
              onClick={() => setSelectedActivity(activity)}
            />
          ))}
        </div>
        
        {/* Empty State */}
        {sortedActivities.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
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
            initialTime={'startTime' in selectedActivity && selectedActivity.startTime ? String(selectedActivity.startTime) : getActivityTime(selectedActivity)}
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
            initialTime={'time' in selectedActivity && selectedActivity.time ? String(selectedActivity.time) : getActivityTime(selectedActivity)}
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
            initialTime={'time' in selectedActivity && selectedActivity.time ? String(selectedActivity.time) : getActivityTime(selectedActivity)}
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
            initialTime={'time' in selectedActivity && selectedActivity.time ? String(selectedActivity.time) : getActivityTime(selectedActivity)}
            activity={'content' in selectedActivity && 'time' in selectedActivity ? selectedActivity : undefined}
          />
        </>
      )}
    </div>
  );
};

export default Timeline;
