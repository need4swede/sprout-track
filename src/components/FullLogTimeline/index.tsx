import React, { useState, useEffect, useMemo } from 'react';
import { Settings } from '@prisma/client';
import { CardHeader } from '@/src/components/ui/card';
import SleepForm from '@/src/components/forms/SleepForm';
import FeedForm from '@/src/components/forms/FeedForm';
import DiaperForm from '@/src/components/forms/DiaperForm';
import NoteForm from '@/src/components/forms/NoteForm';
import BathForm from '@/src/components/forms/BathForm';
import PumpForm from '@/src/components/forms/PumpForm';
import MilestoneForm from '@/src/components/forms/MilestoneForm';
import MeasurementForm from '@/src/components/forms/MeasurementForm';
import { ActivityType, FilterType, FullLogTimelineProps } from './full-log-timeline.types';
import FullLogFilter from './FullLogFilter';
import FullLogActivityList from './FullLogActivityList';
import FullLogActivityDetails from './FullLogActivityDetails';
import { getActivityEndpoint, getActivityTime } from '@/src/components/Timeline/utils';
import { PumpLogResponse } from '@/app/api/types';
import { cn } from '@/src/lib/utils';
import styles from './full-log-timeline.styles';
import './full-log-timeline.css';

/**
 * FullLogTimeline Component
 * 
 * A comprehensive timeline view that displays activities over a date range
 * with filtering and pagination capabilities.
 */
const FullLogTimeline: React.FC<FullLogTimelineProps> = ({
  activities,
  onActivityDeleted,
  startDate,
  endDate,
  onDateRangeChange,
}) => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<ActivityType | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>(null);
  const [editModalType, setEditModalType] = useState<'sleep' | 'feed' | 'diaper' | 'note' | 'bath' | 'pump' | 'milestone' | 'measurement' | null>(null);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

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

  // Handle quick filter for date ranges
  const handleQuickFilter = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    setCurrentPage(1); // Reset to first page
    onDateRangeChange(start, end);
  };

  // Filter and sort activities
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
            case 'bath':
              return 'soapUsed' in activity;
            case 'pump':
              return 'leftAmount' in activity || 'rightAmount' in activity;
            case 'milestone':
              return 'title' in activity && 'category' in activity;
            case 'measurement':
              return 'value' in activity && 'unit' in activity;
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

  // Calculate total pages
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
            case 'bath':
              return 'soapUsed' in activity;
            case 'pump':
              return 'leftAmount' in activity || 'rightAmount' in activity;
            case 'milestone':
              return 'title' in activity && 'category' in activity;
            case 'measurement':
              return 'value' in activity && 'unit' in activity;
            default:
              return true;
          }
        });
    return Math.ceil(filtered.length / itemsPerPage);
  }, [activities, activeFilter, itemsPerPage]);

  // Handle activity deletion
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

  // Handle activity editing
  const handleEdit = (activity: ActivityType, type: 'sleep' | 'feed' | 'diaper' | 'note' | 'bath' | 'pump' | 'milestone' | 'measurement') => {
    setSelectedActivity(activity);
    setEditModalType(type);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (count: number) => {
    setItemsPerPage(count);
    setCurrentPage(1); // Reset to first page
  };

  return (
    <div className={cn(styles.container, "full-log-timeline-container")}>
      {/* Header */}
      <CardHeader className="py-0 bg-gradient-to-r from-teal-600 to-teal-700 border-0 full-log-timeline-header">
        <FullLogFilter
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          startDate={startDate}
          endDate={endDate}
          onDateRangeChange={onDateRangeChange}
          onQuickFilter={handleQuickFilter}
        />
      </CardHeader>

      {/* Activity List */}
      <FullLogActivityList
        activities={sortedActivities}
        settings={settings}
        isLoading={isLoading}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        totalPages={totalPages}
        onActivitySelect={setSelectedActivity}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />

      {/* Activity Details */}
      <FullLogActivityDetails
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
          <PumpForm
            isOpen={editModalType === 'pump'}
            onClose={() => {
              setEditModalType(null);
              setSelectedActivity(null);
            }}
            babyId={selectedActivity.babyId}
            initialTime={'startTime' in selectedActivity && selectedActivity.startTime ? String(selectedActivity.startTime) : getActivityTime(selectedActivity)}
            activity={
              ('leftAmount' in selectedActivity || 'rightAmount' in selectedActivity) ? 
                (selectedActivity as unknown as PumpLogResponse) : 
                undefined
            }
            onSuccess={() => {
              setEditModalType(null);
              setSelectedActivity(null);
              onActivityDeleted?.();
            }}
          />
          <MilestoneForm
            isOpen={editModalType === 'milestone'}
            onClose={() => {
              setEditModalType(null);
              setSelectedActivity(null);
            }}
            babyId={selectedActivity.babyId}
            initialTime={'date' in selectedActivity && selectedActivity.date ? String(selectedActivity.date) : getActivityTime(selectedActivity)}
            activity={'title' in selectedActivity && 'category' in selectedActivity ? selectedActivity : undefined}
            onSuccess={() => {
              setEditModalType(null);
              setSelectedActivity(null);
              onActivityDeleted?.();
            }}
          />
          <MeasurementForm
            isOpen={editModalType === 'measurement'}
            onClose={() => {
              setEditModalType(null);
              setSelectedActivity(null);
            }}
            babyId={selectedActivity.babyId}
            initialTime={'date' in selectedActivity && selectedActivity.date ? String(selectedActivity.date) : getActivityTime(selectedActivity)}
            activity={'value' in selectedActivity && 'unit' in selectedActivity ? selectedActivity : undefined}
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

export default FullLogTimeline;
