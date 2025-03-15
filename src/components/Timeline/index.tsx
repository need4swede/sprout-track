import { Settings } from '@prisma/client';
import { CardHeader } from '@/src/components/ui/card';
import { useState, useEffect, useMemo } from 'react';
import SleepForm from '@/src/components/forms/SleepForm';
import FeedForm from '@/src/components/forms/FeedForm';
import DiaperForm from '@/src/components/forms/DiaperForm';
import NoteForm from '@/src/components/forms/NoteForm';
import BathForm from '@/src/components/forms/BathForm';
import DailyStats from '@/src/components/DailyStats';
import { ActivityType, FilterType, TimelineProps } from './types';
import TimelineFilter from './TimelineFilter';
import TimelineActivityList from './TimelineActivityList';
import TimelineActivityDetails from './TimelineActivityDetails';
import { getActivityEndpoint, getActivityTime } from './utils';

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
    try {
      // Format date for API request - ensure it's in ISO format
      const formattedDate = date.toISOString();
      
      console.log(`Fetching activities for date: ${formattedDate}`);
      
      // Add a timestamp to prevent caching
      const timestamp = new Date().getTime();
      
      // Make the API call with the date parameter
      const url = `/api/timeline?babyId=${babyId}&date=${encodeURIComponent(formattedDate)}&_t=${timestamp}`;
      console.log(`API URL: ${url}`);
      
      const response = await fetch(url, {
        cache: 'no-store',
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
          setDateFilteredActivities(data.data);
          console.log(`Received ${data.data.length} activities for date ${formattedDate}`);
          return data.data;
        } else {
          setDateFilteredActivities([]);
          console.log(`No activities found for date ${formattedDate}`);
          return [];
        }
      } else {
        console.error('Failed to fetch activities:', await response.text());
        setDateFilteredActivities([]);
        return [];
      }
    } catch (error) {
      console.error('Error fetching activities for date:', error);
      setDateFilteredActivities([]);
      return [];
    }
  };
  
  // Handle date selection and fetch data for the selected date
  const handleDateSelection = (newDate: Date) => {
    setSelectedDate(newDate);
    setCurrentPage(1); // Reset to first page when date changes
    
    // Get the baby ID from the first activity if available
    const babyId = activities.length > 0 ? activities[0].babyId : null;
    
    if (babyId) {
      // Fetch data for the selected date
      fetchActivitiesForDate(babyId, newDate);
      setLastFetchedDate(newDate.toDateString());
      
      // Notify parent that date has changed
      if (onActivityDeleted) {
        onActivityDeleted(newDate);
      }
    }
  };
  
  // Function to handle date navigation
  const handleDateChange = (days: number) => {
    // Calculate the new date
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    
    // Update the selected date
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
      setIsLoadingActivities(true);
      fetchActivitiesForDate(babyId, selectedDate)
        .finally(() => setIsLoadingActivities(false));
      setLastFetchedDate(selectedDate.toDateString());
    }
  }, [activities.length, selectedDate, lastFetchedDate]); // Run when these dependencies change
  
  // This effect will run when the activities prop changes (e.g., when a new activity is added)
  useEffect(() => {
    // Only refresh if we have a selected date and activities
    if (selectedDate && activities.length > 0) {
      const babyId = activities[0].babyId;
      if (babyId) {
        // Refresh data for the currently selected date
        setIsLoadingActivities(true);
        fetchActivitiesForDate(babyId, selectedDate)
          .finally(() => setIsLoadingActivities(false));
      }
    }
  }, [activities]); // Run when activities prop changes

  const sortedActivities = useMemo(() => {
    // Only use dateFilteredActivities, never fall back to activities from props
    const filtered = !activeFilter || activeFilter === null
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
    const filtered = !activeFilter || activeFilter === null
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

  const handleEdit = (activity: ActivityType, type: 'sleep' | 'feed' | 'diaper' | 'note' | 'bath') => {
    setEditModalType(type);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-162px)]">
      {/* Header */}
      <CardHeader className="bg-gradient-to-r from-teal-600 to-teal-700 border-0 p-0">
        <TimelineFilter
          selectedDate={selectedDate}
          activeFilter={activeFilter}
          onDateChange={handleDateChange}
          onDateSelection={handleDateSelection}
          onFilterChange={setActiveFilter}
        />
      </CardHeader>

      {/* Daily Stats Banner */}
      <DailyStats 
        activities={dateFilteredActivities} 
        date={selectedDate} 
        isLoading={isLoadingActivities} 
      />

      {/* Activity List */}
      <TimelineActivityList
        activities={sortedActivities}
        settings={settings}
        isLoading={isLoadingActivities}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        totalPages={totalPages}
        onActivitySelect={setSelectedActivity}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={(value) => {
          setItemsPerPage(value);
          setCurrentPage(1);
        }}
        onSwipeLeft={() => handleDateChange(1)} // Next day (swipe left)
        onSwipeRight={() => handleDateChange(-1)} // Previous day (swipe right)
      />

      {/* Activity Details */}
      <TimelineActivityDetails
        activity={selectedActivity}
        settings={settings}
        isOpen={!!selectedActivity}
        onClose={() => setSelectedActivity(null)}
        onDelete={handleDelete}
        onEdit={handleEdit}
      />

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
