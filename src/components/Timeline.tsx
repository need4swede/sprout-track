import { Settings } from '@prisma/client';
import { Card, CardHeader, CardTitle } from '@/src/components/ui/card';
import {
  Moon,
  Baby as BabyIcon,
  Trash2,
  Icon,
  Edit,
  Pencil,
  ChevronLeft,
  ChevronRight,
  Bath,
} from 'lucide-react';
import { diaper, bottleBaby } from '@lucide/lab';
import {
  FormPage,
  FormPageContent,
  FormPageFooter
} from '@/src/components/ui/form-page';
import { Button } from '@/src/components/ui/button';
import { useState, useEffect, useMemo } from 'react';
import SleepForm from '@/src/components/forms/SleepForm';
import FeedForm from '@/src/components/forms/FeedForm';
import DiaperForm from '@/src/components/forms/DiaperForm';
import NoteForm from '@/src/components/forms/NoteForm';
import BathForm from '@/src/components/forms/bathForm';
import DailyStats from '@/src/components/DailyStats';
import { SleepLogResponse, FeedLogResponse, DiaperLogResponse, NoteResponse, MoodLogResponse, BathLogResponse } from '@/app/api/types';
import { ActivityType as ImportedActivityType } from '@/src/components/ui/activity-tile/activity-tile.types';

// Define the extended ActivityType that includes caretaker information
type TimelineActivityType = ImportedActivityType & {
  caretakerId?: string | null;
  caretakerName?: string;
};

// Use TimelineActivityType for internal component logic
type ActivityType = TimelineActivityType;

type FilterType = 'sleep' | 'feed' | 'diaper' | 'note' | 'bath' | null;

interface TimelineProps {
  activities: ImportedActivityType[];
  onActivityDeleted?: (dateFilter?: Date) => void;
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
  if ('soapUsed' in activity) {
    return <Bath className="h-4 w-4 text-white" />; // Bath activity
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
  // Common details that should be added to all activity types if caretaker name exists
  const caretakerDetail = activity.caretakerName ? [
    { label: 'Caretaker', value: activity.caretakerName }
  ] : [];
  
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
        details: [...details, ...caretakerDetail],
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
        
        // Show duration from feedDuration (in seconds) or fall back to amount (in minutes)
        if (activity.feedDuration) {
          const minutes = Math.floor(activity.feedDuration / 60);
          const seconds = activity.feedDuration % 60;
          details.push({ 
            label: 'Duration', 
            value: seconds > 0 ? 
              `${minutes} min ${seconds} sec` : 
              `${minutes} minutes` 
          });
        } else if (activity.amount) {
          details.push({ label: 'Duration', value: `${activity.amount} minutes` });
        }
      }

      // Show food for solids
      if (activity.type === 'SOLIDS' && activity.food) {
        details.push({ label: 'Food', value: activity.food });
      }

      return {
        title: 'Feed Record',
        details: [...details, ...caretakerDetail],
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
        details: [...details, ...caretakerDetail],
      };
    }
  }
  if ('content' in activity) {
    const noteDetails = [
      { label: 'Time', value: formatTime(activity.time, settings) },
      { label: 'Content', value: activity.content },
      { label: 'Category', value: activity.category || 'Not specified' },
    ];
    
    return {
      title: 'Note',
      details: [...noteDetails, ...caretakerDetail],
    };
  }
  return { title: 'Activity', details: [...caretakerDetail] };
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
        
        // Get duration from feedDuration (in seconds) or fall back to amount (in minutes)
        let duration = '';
        if (activity.feedDuration) {
          const minutes = Math.floor(activity.feedDuration / 60);
          const seconds = activity.feedDuration % 60;
          duration = seconds > 0 ? 
            `${minutes}m ${seconds}s` : 
            `${minutes} min`;
        } else if (activity.amount) {
          duration = `${activity.amount} min`;
        }
        
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
  if ('soapUsed' in activity) {
    const time = formatTime(activity.time, settings, true);
    let bathDetails = '';
    
    // Determine bath details based on soap and shampoo usage
    if (!activity.soapUsed && !activity.shampooUsed) {
      bathDetails = 'water only';
    } else if (activity.soapUsed && activity.shampooUsed) {
      bathDetails = 'with soap and shampoo';
    } else if (activity.soapUsed) {
      bathDetails = 'with soap';
    } else if (activity.shampooUsed) {
      bathDetails = 'with shampoo';
    }
    
    // Add notes if available, truncate if needed
    let notesText = '';
    if (activity.notes) {
      const truncatedNotes = activity.notes.length > 30 ? activity.notes.substring(0, 30) + '...' : activity.notes;
      notesText = ` - ${truncatedNotes}`;
    }
    
    return {
      type: 'Bath',
      details: `${time} - ${bathDetails}${notesText}`
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
  if ('soapUsed' in activity) {
    return {
      bg: 'bg-gradient-to-r from-orange-400 to-orange-500',
      textColor: 'text-white',
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
  const [editModalType, setEditModalType] = useState<'sleep' | 'feed' | 'diaper' | 'note' | 'bath' | null>(null);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Keep track of the last fetched date to prevent duplicate fetches
  const [lastFetchedDate, setLastFetchedDate] = useState<string>('');
  
  // State to store the activities fetched for the selected date
  const [dateFilteredActivities, setDateFilteredActivities] = useState<ActivityType[]>([]);
  
  // Loading state for fetching activities
  const [isLoadingActivities, setIsLoadingActivities] = useState<boolean>(false);
  
  // Function to fetch activities for a specific date
  const fetchActivitiesForDate = async (babyId: string, date: Date) => {
    setIsLoadingActivities(true);
    try {
      // Format date for API request - ensure it's in ISO format
      const formattedDate = date.toISOString();
      
      // Always update the selected date
      setSelectedDate(date);
      
      // Update last fetched date
      setLastFetchedDate(date.toDateString());
      
      console.log(`Fetching activities for date: ${formattedDate}`);
      
      // Add a timestamp to prevent caching
      const timestamp = new Date().getTime();
      
      // Make the API call with the date parameter
      // Explicitly include the date parameter in the URL
      const url = `/api/timeline?babyId=${babyId}&date=${encodeURIComponent(formattedDate)}&_t=${timestamp}`;
      console.log(`API URL: ${url}`);
      
      const response = await fetch(url, {
        // Add cache: 'no-store' to prevent caching
        cache: 'no-store',
        // Add headers to prevent caching
        headers: {
          'Pragma': 'no-cache',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Expires': '0'
        }
      });
      
      if (response.ok) {
        console.log('Successfully fetched activities for date');
        const data = await response.json();
        if (data.success) {
          // Always set the date-filtered activities, even if empty
          setDateFilteredActivities(data.data);
          console.log(`Received ${data.data.length} activities for date ${formattedDate}`);
        } else {
          // If the API call was not successful, clear the date-filtered activities
          setDateFilteredActivities([]);
          console.log(`No activities found for date ${formattedDate}`);
        }
        
        // Notify parent that date has changed (but don't update parent's activities)
        if (onActivityDeleted) {
          onActivityDeleted(date);
        }
      } else {
        console.error('Failed to fetch activities:', await response.text());
        // Clear the date-filtered activities on error
        setDateFilteredActivities([]);
      }
      
      // Set loading to false after data is processed
      setIsLoadingActivities(false);
    } catch (error) {
      console.error('Error fetching activities for date:', error);
      setIsLoadingActivities(false);
    }
  };
  
  // Handle date change and fetch data for the selected date
  const handleDateSelection = (newDate: Date) => {
    setSelectedDate(newDate);
    setCurrentPage(1); // Reset to first page when date changes
    
    // Get the baby ID from the first activity if available
    const babyId = activities.length > 0 ? activities[0].babyId : null;
    
    if (babyId) {
      // Directly fetch data for the selected date
      fetchActivitiesForDate(babyId, newDate);
      
      // Notify parent component about the date change
      if (onActivityDeleted) {
        onActivityDeleted(newDate);
      }
    }
  };
  
  // Function to handle date navigation
  const handleDateChange = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    handleDateSelection(newDate);
  };
  
  // Fetch settings on component mount
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
  
  // Initialize with the current date and fetch data when needed
  useEffect(() => {
    // Get the baby ID from the first activity if available
    const babyId = activities.length > 0 ? activities[0].babyId : null;
    
    if (babyId && lastFetchedDate !== selectedDate.toDateString()) {
      // Fetch data for the selected date if we haven't already
      fetchActivitiesForDate(babyId, selectedDate);
    }
  }, [activities.length, selectedDate, lastFetchedDate]); // Run when these dependencies change
  
  // This effect will run when the activities prop changes (e.g., when a new activity is added)
  // It ensures the Timeline refreshes while maintaining the current date filter
  useEffect(() => {
    // Only refresh if we have a selected date and activities
    if (selectedDate && activities.length > 0) {
      const babyId = activities[0].babyId;
      if (babyId) {
        // Refresh data for the currently selected date
        fetchActivitiesForDate(babyId, selectedDate);
      }
    }
  }, [activities]); // Run when activities prop changes

  const sortedActivities = useMemo(() => {
    // Only use dateFilteredActivities, never fall back to activities from props
    const filtered = !activeFilter
      ? dateFilteredActivities
      : dateFilteredActivities.filter(activity => {
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
  }, [dateFilteredActivities, activeFilter, currentPage, itemsPerPage]);

  const totalPages = useMemo(() => {
    // Only use dateFilteredActivities, never fall back to activities from props
    const filtered = !activeFilter 
      ? dateFilteredActivities 
      : dateFilteredActivities.filter(activity => {
          switch (activeFilter) {
            case 'sleep':
              return 'duration' in activity;
            case 'feed':
              return 'amount' in activity;
            case 'diaper':
              return 'condition' in activity;
            case 'note':
              return 'content' in activity;
            case 'bath':
              return 'soapUsed' in activity;
            default:
              return true;
          }
        });
    return Math.ceil(filtered.length / itemsPerPage);
  }, [dateFilteredActivities, activeFilter, itemsPerPage]);

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
      <CardHeader className="py-1 px-2 bg-gradient-to-r from-teal-600 to-teal-700 border-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleDateChange(-1)}
              className="h-7 w-7 bg-gray-100 hover:bg-gray-200"
              aria-label="Previous day"
            >
              <ChevronLeft className="h-3 w-3 text-teal-700" />
            </Button>
            
            <input
              type="date"
              className="h-7 px-2 rounded-md border border-gray-200 text-xs bg-gray-100 hover:bg-gray-200 text-teal-700"
              value={new Date(selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000).toISOString().split('T')[0]}
              onChange={(e) => {
                // Create date in local timezone
                const localDate = new Date(e.target.value);
                // Adjust for timezone offset to keep the date consistent
                const newDate = new Date(localDate.getTime() + localDate.getTimezoneOffset() * 60000);
                newDate.setHours(0, 0, 0, 0);
                handleDateSelection(newDate);
              }}
            />
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleDateChange(1)}
              className="h-7 w-7 bg-gray-100 hover:bg-gray-200"
              aria-label="Next day"
            >
              <ChevronRight className="h-3 w-3 text-teal-700" />
            </Button>
          </div>
          
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
              onClick={() => setActiveFilter(activeFilter === 'bath' ? null : 'bath')}
              className={`h-8 w-8 ${
                activeFilter === 'bath'
                  ? 'border-2 border-blue-500 bg-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <Bath className="h-4 w-4" />
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

      {/* Daily Stats Banner */}
      <DailyStats 
        activities={dateFilteredActivities} 
        date={selectedDate} 
        isLoading={isLoadingActivities} 
      />

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="divide-y divide-gray-100 bg-white">
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
      {dateFilteredActivities.length > 0 && (
        <div className="flex justify-between items-center px-6 py-2 border-t border-gray-100">
          <select
            className="h-6 px-1 rounded-md border border-gray-200 text-xs"
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
              <span className="px-4 py-2 text-xs">
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

      {/* Activity Details FormPage */}
      <FormPage 
        isOpen={!!selectedActivity} 
        onClose={() => setSelectedActivity(null)}
        title={selectedActivity ? getActivityDetails(selectedActivity, settings).title : ''}
      >
        <FormPageContent>
          {selectedActivity && (
            <div className="space-y-4 p-4">
              {getActivityDetails(selectedActivity, settings).details.map((detail, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">{detail.label}:</span>
                  <span className="text-sm text-gray-900">{detail.value}</span>
                </div>
              ))}
            </div>
          )}
        </FormPageContent>
        <FormPageFooter>
          <div className="flex justify-between w-full px-4 py-2">
            <div className="flex gap-2">
              <Button
                variant="destructive"
                onClick={() => handleDelete(selectedActivity!)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  if (selectedActivity) {
                    if ('duration' in selectedActivity) setEditModalType('sleep');
                    else if ('amount' in selectedActivity) setEditModalType('feed');
                    else if ('condition' in selectedActivity) setEditModalType('diaper');
                    else if ('content' in selectedActivity) setEditModalType('note');
                    else if ('soapUsed' in selectedActivity) setEditModalType('bath');
                  }
                }}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
            <Button
              variant="outline"
              onClick={() => setSelectedActivity(null)}
            >
              Close
            </Button>
          </div>
        </FormPageFooter>
      </FormPage>

      {/* Edit Forms */}
      {selectedActivity && (
        <>
          <SleepForm
            isOpen={editModalType === 'sleep'}
            onClose={() => {
              setEditModalType(null);
              setSelectedActivity(null);
            }}
            isSleeping={false}
            onSleepToggle={() => {}}
            babyId={selectedActivity.babyId}
            initialTime={'startTime' in selectedActivity && selectedActivity.startTime ? String(selectedActivity.startTime) : getActivityTime(selectedActivity)}
            activity={'duration' in selectedActivity && 'type' in selectedActivity ? selectedActivity : undefined}
            onSuccess={() => {
              setEditModalType(null);
              setSelectedActivity(null);
              onActivityDeleted?.();
            }}
          />
          <FeedForm
            isOpen={editModalType === 'feed'}
            onClose={() => {
              setEditModalType(null);
              setSelectedActivity(null);
            }}
            babyId={selectedActivity.babyId}
            initialTime={'time' in selectedActivity && selectedActivity.time ? String(selectedActivity.time) : getActivityTime(selectedActivity)}
            activity={'amount' in selectedActivity && 'type' in selectedActivity ? selectedActivity : undefined}
            onSuccess={() => {
              setEditModalType(null);
              setSelectedActivity(null);
              onActivityDeleted?.();
            }}
          />
          <DiaperForm
            isOpen={editModalType === 'diaper'}
            onClose={() => {
              setEditModalType(null);
              setSelectedActivity(null);
            }}
            babyId={selectedActivity.babyId}
            initialTime={'time' in selectedActivity && selectedActivity.time ? String(selectedActivity.time) : getActivityTime(selectedActivity)}
            activity={'condition' in selectedActivity && 'type' in selectedActivity ? selectedActivity : undefined}
            onSuccess={() => {
              setEditModalType(null);
              setSelectedActivity(null);
              onActivityDeleted?.();
            }}
          />
          <NoteForm
            isOpen={editModalType === 'note'}
            onClose={() => {
              setEditModalType(null);
              setSelectedActivity(null);
            }}
            babyId={selectedActivity.babyId}
            initialTime={'time' in selectedActivity && selectedActivity.time ? String(selectedActivity.time) : getActivityTime(selectedActivity)}
            activity={'content' in selectedActivity && 'time' in selectedActivity ? selectedActivity : undefined}
            onSuccess={() => {
              setEditModalType(null);
              setSelectedActivity(null);
              onActivityDeleted?.();
            }}
          />
          <BathForm
            isOpen={editModalType === 'bath'}
            onClose={() => {
              setEditModalType(null);
              setSelectedActivity(null);
            }}
            babyId={selectedActivity.babyId}
            initialTime={'time' in selectedActivity && selectedActivity.time ? String(selectedActivity.time) : getActivityTime(selectedActivity)}
            activity={'soapUsed' in selectedActivity ? selectedActivity : undefined}
            onSuccess={() => {
              setEditModalType(null);
              setSelectedActivity(null);
              onActivityDeleted?.();
            }}
          />
        </>
      )}
    </div>
  );
};

export default Timeline;
