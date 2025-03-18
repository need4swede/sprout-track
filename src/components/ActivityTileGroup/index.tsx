import React, { useState, useEffect } from 'react';
import { ActivityTile } from '@/src/components/ui/activity-tile';
import { StatusBubble } from "@/src/components/ui/status-bubble";
import { SleepLogResponse, FeedLogResponse, DiaperLogResponse, NoteResponse, BathLogResponse, PumpLogResponse, ActivitySettings } from '@/app/api/types';
import { MoreVertical, ArrowDownUp } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from '@/src/components/ui/dropdown-menu';
import { dropdownMenuStyles as styles } from '@/src/components/ui/dropdown-menu/dropdown-menu.styles';

interface ActivityTileGroupProps {
  selectedBaby: {
    id: string;
    feedWarningTime?: string | number;
    diaperWarningTime?: string | number;
  } | null;
  sleepingBabies: Set<string>;
  sleepStartTime: Record<string, Date>;
  lastSleepEndTime: Record<string, Date>;
  lastFeedTime: Record<string, Date>;
  lastDiaperTime: Record<string, Date>;
  updateUnlockTimer: () => void;
  onSleepClick: () => void;
  onFeedClick: () => void;
  onDiaperClick: () => void;
  onNoteClick: () => void;
  onBathClick: () => void;
  onPumpClick: () => void;
}

/**
 * ActivityTileGroup component displays a group of activity tiles for tracking baby activities
 * 
 * This component is responsible for rendering the activity buttons in the log entry page
 * and displaying status bubbles with timing information.
 */
// Activity type definition
type ActivityType = 'sleep' | 'feed' | 'diaper' | 'note' | 'bath' | 'pump';

export function ActivityTileGroup({
  selectedBaby,
  sleepingBabies,
  sleepStartTime,
  lastSleepEndTime,
  lastFeedTime,
  lastDiaperTime,
  updateUnlockTimer,
  onSleepClick,
  onFeedClick,
  onDiaperClick,
  onNoteClick,
  onBathClick,
  onPumpClick
}: ActivityTileGroupProps) {
  if (!selectedBaby?.id) return null;

  // State for visible activities and their order
  const [visibleActivities, setVisibleActivities] = useState<Set<ActivityType>>(
    () => new Set(['sleep', 'feed', 'diaper', 'note', 'bath', 'pump'] as ActivityType[])
  );
  
  // State for activity order
  const [activityOrder, setActivityOrder] = useState<ActivityType[]>([
    'sleep', 'feed', 'diaper', 'note', 'bath', 'pump'
  ]);
  
  // State for drag and drop
  const [draggedActivity, setDraggedActivity] = useState<ActivityType | null>(null);
  
  // State for tracking if settings have been loaded
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  
  // State for tracking the current caretaker ID
  const [caretakerId, setCaretakerId] = useState<string | null>(null);
  
  // Get caretaker ID from localStorage
  useEffect(() => {
    const storedCaretakerId = localStorage.getItem('caretakerId');
    setCaretakerId(storedCaretakerId);
    
    // Listen for changes to caretakerId in localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'caretakerId') {
        setCaretakerId(e.newValue);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  // Load activity settings from the server when caretakerId changes
  useEffect(() => {
    const loadActivitySettings = async () => {
      try {
        // Fetch activity settings from the API with the current caretakerId
        const response = await fetch(`/api/activity-settings${caretakerId ? `?caretakerId=${caretakerId}` : ''}`);
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.success && data.data) {
            // Update state with loaded settings
            setActivityOrder(data.data.order as ActivityType[]);
            setVisibleActivities(new Set(data.data.visible as ActivityType[]));
            setSettingsLoaded(true);
          }
        }
      } catch (error) {
        console.error('Error loading activity settings:', error);
      }
    };
    
    // Reset settingsLoaded when caretakerId changes
    setSettingsLoaded(false);
    loadActivitySettings();
  }, [caretakerId]);
  
  // Save activity settings when they change
  useEffect(() => {
    // Don't save until initial settings are loaded
    if (!settingsLoaded) return;
    
    const saveActivitySettings = async () => {
      try {
        // Prepare settings data with the current caretakerId state
        const settings: ActivitySettings = {
          order: [...activityOrder],
          visible: Array.from(visibleActivities),
          caretakerId: caretakerId
        };
        
        // Save settings to the API
        await fetch('/api/activity-settings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(settings)
        });
      } catch (error) {
        console.error('Error saving activity settings:', error);
      }
    };
    
    // Debounce saving to avoid too many requests
    const timeoutId = setTimeout(saveActivitySettings, 500);
    
    return () => clearTimeout(timeoutId);
  }, [activityOrder, visibleActivities, settingsLoaded, caretakerId]);

  // Toggle activity visibility
  const toggleActivity = (activity: ActivityType) => {
    const newVisibleActivities = new Set(visibleActivities);
    if (newVisibleActivities.has(activity)) {
      newVisibleActivities.delete(activity);
    } else {
      newVisibleActivities.add(activity);
    }
    setVisibleActivities(newVisibleActivities);
  };

  // Move activity up in order
  const moveActivityUp = (activity: ActivityType) => {
    const index = activityOrder.indexOf(activity);
    if (index > 0) {
      const newOrder = [...activityOrder];
      [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
      setActivityOrder(newOrder);
    }
  };

  // Move activity down in order
  const moveActivityDown = (activity: ActivityType) => {
    const index = activityOrder.indexOf(activity);
    if (index < activityOrder.length - 1) {
      const newOrder = [...activityOrder];
      [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
      setActivityOrder(newOrder);
    }
  };

  // Activity display names for the menu
  const activityDisplayNames: Record<ActivityType, string> = {
    sleep: 'Sleep',
    feed: 'Feed',
    diaper: 'Diaper',
    note: 'Note',
    bath: 'Bath',
    pump: 'Pump'
  };

  // Function to render activity tile based on type
  const renderActivityTile = (activity: ActivityType) => {
    if (!visibleActivities.has(activity)) return null;

    switch (activity) {
      case 'sleep':
        return (
          <div key="sleep" className="relative min-w-[90px] w-[90px] h-20 flex-shrink-0 snap-center">
            <ActivityTile
              activity={{
                type: 'NAP', // Using a valid SleepType enum value
                id: 'sleep-button',
                babyId: selectedBaby.id,
                startTime: sleepStartTime[selectedBaby.id] ? sleepStartTime[selectedBaby.id].toISOString() : new Date().toISOString(),
                endTime: sleepingBabies.has(selectedBaby.id) ? null : new Date().toISOString(),
                duration: sleepingBabies.has(selectedBaby.id) ? null : 0,
                location: null,
                quality: null,
                caretakerId: null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                deletedAt: null
              } as unknown as SleepLogResponse}
              title={selectedBaby?.id && sleepingBabies.has(selectedBaby.id) ? 'End Sleep' : 'Start Sleep'}
              variant="sleep"
              isButton={true}
              onClick={() => {
                updateUnlockTimer();
                onSleepClick();
              }}
            />
            {selectedBaby?.id && (
              sleepingBabies.has(selectedBaby.id) ? (
                <StatusBubble
                  status="sleeping"
                  className="overflow-visible z-40"
                  durationInMinutes={Math.floor(
                    (new Date().getTime() - sleepStartTime[selectedBaby.id]?.getTime() || 0) / 60000
                  )}
                />
              ) : (
                !sleepStartTime[selectedBaby.id] && lastSleepEndTime[selectedBaby.id] && (
                  <StatusBubble
                    status="awake"
                    className="overflow-visible z-40"
                    durationInMinutes={Math.floor(
                      (new Date().getTime() - lastSleepEndTime[selectedBaby.id].getTime()) / 60000
                    )}
                  />
                )
              )
            )}
          </div>
        );
      case 'feed':
        return (
          <div key="feed" className="relative min-w-[90px] w-[90px] h-20 flex-shrink-0 snap-center">
            <ActivityTile
              activity={{
                type: 'BOTTLE',
                id: 'feed-button',
                babyId: selectedBaby.id,
                time: new Date().toISOString(),
                amount: null,
                side: null,
                food: null,
                unitAbbr: null,
                caretakerId: null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                deletedAt: null
              } as unknown as FeedLogResponse}
              title="Feed"
              variant="feed"
              isButton={true}
              onClick={() => {
                updateUnlockTimer();
                onFeedClick();
              }}
            />
            {selectedBaby?.id && lastFeedTime[selectedBaby.id] && (
              <StatusBubble
                status="feed"
                className="overflow-visible z-40"
                durationInMinutes={Math.floor(
                  (new Date().getTime() - lastFeedTime[selectedBaby.id].getTime()) / 60000
                )}
                warningTime={selectedBaby.feedWarningTime as string}
              />
            )}
          </div>
        );
      case 'diaper':
        return (
          <div key="diaper" className="relative min-w-[90px] w-[90px] h-20 flex-shrink-0 snap-center">
            <ActivityTile
              activity={{
                type: 'WET',
                id: 'diaper-button',
                babyId: selectedBaby.id,
                time: new Date().toISOString(),
                condition: null,
                color: null,
                caretakerId: null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                deletedAt: null
              } as unknown as DiaperLogResponse}
              title="Diaper"
              variant="diaper"
              isButton={true}
              onClick={() => {
                updateUnlockTimer();
                onDiaperClick();
              }}
            />
            {selectedBaby?.id && lastDiaperTime[selectedBaby.id] && (
              <StatusBubble
                status="diaper"
                className="overflow-visible z-40"
                durationInMinutes={Math.floor(
                  (new Date().getTime() - lastDiaperTime[selectedBaby.id].getTime()) / 60000
                )}
                warningTime={selectedBaby.diaperWarningTime as string}
              />
            )}
          </div>
        );
      case 'note':
        return (
          <div key="note" className="relative min-w-[90px] w-[90px] h-20 flex-shrink-0 snap-center">
            <ActivityTile
              activity={{
                id: 'note-button',
                babyId: selectedBaby.id,
                time: new Date().toISOString(),
                content: '',
                category: 'Note',
                caretakerId: null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                deletedAt: null
              } as unknown as NoteResponse}
              title="Note"
              variant="note"
              isButton={true}
              onClick={() => {
                updateUnlockTimer();
                onNoteClick();
              }}
            />
          </div>
        );
      case 'bath':
        return (
          <div key="bath" className="relative min-w-[90px] w-[90px] h-20 flex-shrink-0 snap-center">
            <ActivityTile
              activity={{
                id: 'bath-button',
                babyId: selectedBaby.id,
                time: new Date().toISOString(),
                soapUsed: false,
                shampooUsed: false,
                waterTemperature: null,
                duration: null,
                notes: '',
                caretakerId: null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                deletedAt: null
              } as unknown as BathLogResponse}
              title="Bath"
              variant="bath"
              isButton={true}
              onClick={() => {
                updateUnlockTimer();
                onBathClick();
              }}
            />
          </div>
        );
      case 'pump':
        return (
          <div key="pump" className="relative min-w-[90px] w-[90px] h-20 flex-shrink-0 snap-center">
            <ActivityTile
              activity={{
                id: 'pump-button',
                babyId: selectedBaby.id,
                startTime: new Date().toISOString(),
                endTime: null,
                duration: null,
                leftAmount: null,
                rightAmount: null,
                totalAmount: null,
                unitAbbr: null,
                notes: '',
                caretakerId: null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                deletedAt: null
              } as unknown as PumpLogResponse}
              title="Pump"
              variant="pump"
              isButton={true}
              onClick={() => {
                updateUnlockTimer();
                onPumpClick();
              }}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex overflow-x-auto border-t-[1px] border-white no-scrollbar snap-x snap-mandatory relative">
      {/* Render activity tiles based on order and visibility */}
      {activityOrder.map(activity => renderActivityTile(activity))}

      {/* Menu Button for customizing activity tiles */}
      <div className="relative min-w-[50px] w-[50px] h-20 flex-shrink-0 snap-center flex items-center justify-center ml-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={styles.menuButton}>
              <MoreVertical className={styles.menuIcon} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {/* Combined Visibility and Reordering Options */}
            {activityOrder.map((activity, index) => (
              <div 
                key={`order-${activity}`} 
                className={`flex items-center px-2 py-2 hover:bg-gray-50 rounded-md my-1 ${draggedActivity === activity ? 'opacity-50' : ''} ${draggedActivity && draggedActivity !== activity ? 'hover:bg-emerald-50' : ''}`}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', activity);
                  setDraggedActivity(activity);
                }}
                onDragEnd={() => {
                  setDraggedActivity(null);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (draggedActivity && draggedActivity !== activity) {
                    e.currentTarget.classList.add('bg-emerald-50');
                  }
                }}
                onDragLeave={(e) => {
                  e.currentTarget.classList.remove('bg-emerald-50');
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove('bg-emerald-50');
                  
                  if (draggedActivity && draggedActivity !== activity) {
                    const newOrder = [...activityOrder];
                    const draggedIndex = newOrder.indexOf(draggedActivity);
                    const targetIndex = newOrder.indexOf(activity);
                    
                    // Remove the dragged item
                    newOrder.splice(draggedIndex, 1);
                    // Insert it at the new position
                    newOrder.splice(targetIndex, 0, draggedActivity);
                    
                    setActivityOrder(newOrder);
                  }
                }}
                // Touch event handlers for mobile support
                onTouchStart={() => {
                  setDraggedActivity(activity);
                }}
                onTouchMove={(e) => {
                  e.preventDefault(); // Prevent scrolling while dragging
                  
                  // Find the element under the touch point
                  const touch = e.touches[0];
                  const elementsAtTouch = document.elementsFromPoint(touch.clientX, touch.clientY);
                  
                  // Find the first draggable element in the elements under the touch
                  const touchedElement = elementsAtTouch.find(el => 
                    el.getAttribute('draggable') === 'true' && 
                    el !== e.currentTarget
                  );
                  
                  // Remove highlight from all items
                  document.querySelectorAll('[draggable="true"]').forEach(el => {
                    el.classList.remove('bg-emerald-50');
                  });
                  
                  // Add highlight to the element under touch
                  if (touchedElement) {
                    touchedElement.classList.add('bg-emerald-50');
                  }
                }}
                onTouchEnd={(e) => {
                  if (!draggedActivity) return;
                  
                  // Find the element under the touch point
                  const touch = e.changedTouches[0];
                  const elementsAtTouch = document.elementsFromPoint(touch.clientX, touch.clientY);
                  
                  // Find the first draggable element in the elements under the touch
                  const touchedElement = elementsAtTouch.find(el => 
                    el.getAttribute('draggable') === 'true' && 
                    el !== e.currentTarget
                  );
                  
                  if (touchedElement) {
                    // Get the activity from the data-key attribute
                    const key = touchedElement.getAttribute('data-key');
                    if (key && key.startsWith('order-')) {
                      const touchedActivity = key.replace('order-', '') as ActivityType;
                      
                      if (touchedActivity !== draggedActivity) {
                        const newOrder = [...activityOrder];
                        const draggedIndex = newOrder.indexOf(draggedActivity);
                        const targetIndex = newOrder.indexOf(touchedActivity);
                        
                        // Remove the dragged item
                        newOrder.splice(draggedIndex, 1);
                        // Insert it at the new position
                        newOrder.splice(targetIndex, 0, draggedActivity);
                        
                        setActivityOrder(newOrder);
                      }
                    }
                  }
                  
                  // Remove highlight from all items
                  document.querySelectorAll('[draggable="true"]').forEach(el => {
                    el.classList.remove('bg-emerald-50');
                  });
                  
                  setDraggedActivity(null);
                }}
                data-key={`order-${activity}`}
              >
                <button 
                  className="p-1 rounded-full hover:bg-gray-100 cursor-grab active:cursor-grabbing mr-2"
                  onMouseDown={(e) => {
                    // Prevent dropdown from closing when starting drag
                    e.preventDefault();
                  }}
                >
                  <ArrowDownUp className="h-4 w-4 text-gray-500" />
                </button>
                <DropdownMenuCheckboxItem
                  checked={visibleActivities.has(activity)}
                  onCheckedChange={() => toggleActivity(activity)}
                  className="flex-grow"
                >
                  {activityDisplayNames[activity]}
                </DropdownMenuCheckboxItem>
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
