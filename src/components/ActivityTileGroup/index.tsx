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
  
  // Get caretaker ID from localStorage and listen for changes
  useEffect(() => {
    // Initialize caretaker ID from localStorage
    const storedCaretakerId = localStorage.getItem('caretakerId');
    setCaretakerId(storedCaretakerId);
    
    // Listen for changes to caretakerId in localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'caretakerId' && e.newValue !== caretakerId) {
        console.log(`Caretaker ID changed in localStorage: ${caretakerId} -> ${e.newValue}`);
        setCaretakerId(e.newValue);
        setSettingsLoaded(false);
        setSettingsModified(false); // Reset modified flag when caretaker changes
      }
    };
    
    // Listen for custom caretaker change event
    const handleCaretakerChange = (e: CustomEvent) => {
      const newCaretakerId = e.detail?.caretakerId;
      if (newCaretakerId !== caretakerId) {
        console.log(`Caretaker ID changed via event: ${caretakerId} -> ${newCaretakerId}`);
        setCaretakerId(newCaretakerId);
        setSettingsLoaded(false);
        setSettingsModified(false); // Reset modified flag when caretaker changes
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('caretakerChanged', handleCaretakerChange as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('caretakerChanged', handleCaretakerChange as EventListener);
    };
  }, [caretakerId]);
  
  // Load activity settings from the server when caretakerId changes or settings need to be reloaded
  useEffect(() => {
    const loadActivitySettings = async () => {
      // Don't try to load settings if there's no caretakerId (user is logged out)
      if (!caretakerId) {
        console.log('No caretakerId, using default settings');
        setDefaultSettings();
        return;
      }
      
      try {
        console.log(`Loading activity settings for caretakerId: ${caretakerId}`);
        
        // Fetch activity settings from the API with the current caretakerId
        const response = await fetch(`/api/activity-settings?caretakerId=${caretakerId}`);
        
        // Handle 401 Unauthorized specifically (expected when logged out)
        if (response.status === 401) {
          console.log('Not authenticated, using default settings');
          setDefaultSettings();
          return;
        }
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.success && data.data) {
            console.log(`Successfully loaded settings:`, data.data);
            
            // Store the original loaded settings for comparison
            const originalOrder = [...data.data.order] as ActivityType[];
            const originalVisible = new Set(data.data.visible as ActivityType[]);
            
            // Update state with loaded settings
            setActivityOrder(data.data.order as ActivityType[]);
            setVisibleActivities(new Set(data.data.visible as ActivityType[]));
            
            // Mark settings as loaded AFTER state has been updated
            setTimeout(() => {
              setSettingsLoaded(true);
              
              // Store the original settings in a ref for comparison
              // This helps us determine if settings were modified by the user
              originalOrderRef.current = originalOrder;
              originalVisibleRef.current = Array.from(originalVisible) as ActivityType[];
              
              // Reset the modified flag since we just loaded settings
              setSettingsModified(false);
            }, 0);
          } else {
            console.error('Failed to load settings:', data.error || 'Unknown error');
            // Set default settings if loading fails
            setDefaultSettings();
          }
        } else {
          console.error('Failed to load settings, server returned:', response.status);
          // Set default settings if loading fails
          setDefaultSettings();
        }
      } catch (error) {
        console.error('Error loading activity settings:', error);
        // Set default settings if loading fails
        setDefaultSettings();
      }
    };
    
    // Load settings when caretakerId changes or settingsLoaded is false
    if (!settingsLoaded) {
      loadActivitySettings();
    }
  }, [caretakerId, settingsLoaded]);
  
  // Function to set default settings
  const setDefaultSettings = () => {
    const defaultOrder: ActivityType[] = ['sleep', 'feed', 'diaper', 'note', 'bath', 'pump'];
    setActivityOrder(defaultOrder);
    setVisibleActivities(new Set(defaultOrder));
    
    // Mark settings as loaded but not modified
    setTimeout(() => {
      setSettingsLoaded(true);
      setSettingsModified(false);
      
      // Store the default settings in the ref
      originalOrderRef.current = [...defaultOrder];
      originalVisibleRef.current = [...defaultOrder];
    }, 0);
  };
  
  // Refs to store the original settings for comparison
  const originalOrderRef = React.useRef<ActivityType[]>(['sleep', 'feed', 'diaper', 'note', 'bath', 'pump']);
  const originalVisibleRef = React.useRef<string[]>(['sleep', 'feed', 'diaper', 'note', 'bath', 'pump']);
  
  // Track if settings have been modified since loading
  const [settingsModified, setSettingsModified] = useState(false);
  
  // Update settingsModified when order or visibility changes
  useEffect(() => {
    if (settingsLoaded) {
      // Compare current settings with original settings to determine if they've been modified
      const currentOrder = [...activityOrder];
      const currentVisible = Array.from(visibleActivities);
      
      const orderChanged = currentOrder.length !== originalOrderRef.current.length || 
        currentOrder.some((activity, index) => activity !== originalOrderRef.current[index]);
      
      const visibleChanged = currentVisible.length !== originalVisibleRef.current.length ||
        !currentVisible.every(activity => originalVisibleRef.current.includes(activity));
      
      if (orderChanged || visibleChanged) {
        console.log('Settings modified by user action');
        setSettingsModified(true);
      }
    }
  }, [activityOrder, visibleActivities, settingsLoaded]);
  
  // Save activity settings when they change
  useEffect(() => {
    // Don't save until initial settings are loaded AND modified
    if (!settingsLoaded || !settingsModified) {
      return;
    }
    
    // Don't save if caretakerId is null (global settings should only be set explicitly)
    if (caretakerId === null) {
      console.log('Not saving settings: caretakerId is null');
      return;
    }
    
    console.log(`Saving activity settings for caretakerId: ${caretakerId}`);
    
    const saveActivitySettings = async () => {
      try {
        // Prepare settings data with the current caretakerId state
        const settings: ActivitySettings = {
          order: [...activityOrder],
          visible: Array.from(visibleActivities),
          caretakerId: caretakerId
        };
        
        console.log(`Saving settings:`, settings);
        
        // Save settings to the API
        const response = await fetch('/api/activity-settings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(settings)
        });
        
        if (!response.ok) {
          console.error('Failed to save activity settings:', await response.text());
        } else {
          console.log('Successfully saved activity settings');
          
          // Update the original settings refs after successful save
          originalOrderRef.current = [...activityOrder];
          originalVisibleRef.current = Array.from(visibleActivities);
        }
      } catch (error) {
        console.error('Error saving activity settings:', error);
      }
    };
    
    // Debounce saving to avoid too many requests
    const timeoutId = setTimeout(saveActivitySettings, 500);
    
    return () => clearTimeout(timeoutId);
  }, [activityOrder, visibleActivities, settingsLoaded, settingsModified, caretakerId]);
  
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
          <div key="sleep" className="relative w-[82px] h-24 flex-shrink-0 snap-center">
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
              title={selectedBaby?.id && sleepingBabies.has(selectedBaby.id) ? 'End Sleep' : 'Sleep'}
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
                  durationInMinutes={0} // Fallback value
                  startTime={sleepStartTime[selectedBaby.id]?.toISOString()}
                />
              ) : (
                !sleepStartTime[selectedBaby.id] && lastSleepEndTime[selectedBaby.id] && (
                  <StatusBubble
                    status="awake"
                    className="overflow-visible z-40"
                    durationInMinutes={0} // Fallback value
                    startTime={lastSleepEndTime[selectedBaby.id].toISOString()}
                  />
                )
              )
            )}
          </div>
        );
      case 'feed':
        return (
          <div key="feed" className="relative w-[82px] h-24 flex-shrink-0 snap-center">
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
                durationInMinutes={0} // Fallback value
                startTime={lastFeedTime[selectedBaby.id].toISOString()}
                warningTime={selectedBaby.feedWarningTime as string}
              />
            )}
          </div>
        );
      case 'diaper':
        return (
          <div key="diaper" className="relative w-[82px] h-24 flex-shrink-0 snap-center">
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
                durationInMinutes={0} // Fallback value
                startTime={lastDiaperTime[selectedBaby.id].toISOString()}
                warningTime={selectedBaby.diaperWarningTime as string}
              />
            )}
          </div>
        );
      case 'note':
        return (
          <div key="note" className="relative w-[82px] h-24 flex-shrink-0 snap-center">
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
          <div key="bath" className="relative w-[82px] h-24 flex-shrink-0 snap-center">
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
          <div key="pump" className="relative w-[82px] h-24 flex-shrink-0 snap-center">
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
    <div className="flex overflow-x-auto border-0 no-scrollbar snap-x snap-mandatory relative bg-gray-50 p-2 gap-2">
      {/* Render activity tiles based on order and visibility */}
      {activityOrder.map(activity => renderActivityTile(activity))}

      {/* Menu Button for customizing activity tiles */}
      <div className="relative w-[82px] h-24 flex-shrink-0 snap-center flex items-center justify-center">
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
                className={`flex items-center px-2 py-2 hover:bg-gray-50 rounded-md my-1 ${draggedActivity === activity ? 'opacity-50 bg-gray-100' : ''} ${draggedActivity && draggedActivity !== activity ? 'hover:bg-emerald-50' : ''}`}
                draggable="true"
                onDragStart={(e) => {
                  e.dataTransfer.effectAllowed = 'move';
                  e.dataTransfer.setData('text/plain', activity);
                  setDraggedActivity(activity);
                  
                  // Capture a reference to the element before setTimeout
                  const element = e.currentTarget;
                  // Add a delay to make sure the drag effect is visible
                  setTimeout(() => {
                    if (element) {
                      element.classList.add('opacity-50', 'bg-gray-100');
                    }
                  }, 0);
                }}
                onDragEnd={(e) => {
                  setDraggedActivity(null);
                  // Remove all highlights
                  document.querySelectorAll('[draggable="true"]').forEach(el => {
                    el.classList.remove('bg-emerald-50', 'opacity-50', 'bg-gray-100');
                  });
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.dataTransfer.dropEffect = 'move';
                  if (draggedActivity && draggedActivity !== activity) {
                    e.currentTarget.classList.add('bg-emerald-50');
                  }
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove('bg-emerald-50');
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.currentTarget.classList.remove('bg-emerald-50');
                  
                  const droppedActivity = e.dataTransfer.getData('text/plain') as ActivityType;
                  
                  if (droppedActivity && droppedActivity !== activity) {
                    const newOrder = [...activityOrder];
                    const draggedIndex = newOrder.indexOf(droppedActivity);
                    const targetIndex = newOrder.indexOf(activity);
                    
                    // Remove the dragged item
                    newOrder.splice(draggedIndex, 1);
                    // Insert it at the new position
                    newOrder.splice(targetIndex, 0, droppedActivity);
                    
                    setActivityOrder(newOrder);
                  }
                }}
                // Touch event handlers for mobile support
                onTouchStart={(e) => {
                  // Store the initial touch position
                  const touch = e.touches[0];
                  e.currentTarget.setAttribute('data-touch-start-x', touch.clientX.toString());
                  e.currentTarget.setAttribute('data-touch-start-y', touch.clientY.toString());
                  
                  // Set a timeout to trigger drag mode if touch is held
                  const touchTimeout = setTimeout(() => {
                    setDraggedActivity(activity);
                    e.currentTarget.classList.add('opacity-50', 'bg-gray-100');
                  }, 200);
                  
                  e.currentTarget.setAttribute('data-touch-timeout', touchTimeout.toString());
                }}
                onTouchMove={(e) => {
                  if (!draggedActivity) return;
                  
                  e.preventDefault(); // Prevent scrolling while dragging
                  
                  // Find the element under the touch point
                  const touch = e.touches[0];
                  const elementsAtTouch = document.elementsFromPoint(touch.clientX, touch.clientY);
                  
                  // Find the first draggable element in the elements under the touch
                  const touchedElement = elementsAtTouch.find(el => 
                    el.getAttribute('draggable') === 'true' && 
                    el.getAttribute('data-key') && 
                    el.getAttribute('data-key') !== `order-${draggedActivity}`
                  ) as HTMLElement | undefined;
                  
                  // Remove highlight from all items
                  document.querySelectorAll('[draggable="true"]').forEach(el => {
                    if (el !== e.currentTarget) {
                      el.classList.remove('bg-emerald-50');
                    }
                  });
                  
                  // Add highlight to the element under touch
                  if (touchedElement) {
                    touchedElement.classList.add('bg-emerald-50');
                  }
                }}
                onTouchEnd={(e) => {
                  // Clear the touch timeout if it exists
                  const timeoutId = e.currentTarget.getAttribute('data-touch-timeout');
                  if (timeoutId) {
                    clearTimeout(parseInt(timeoutId));
                    e.currentTarget.removeAttribute('data-touch-timeout');
                  }
                  
                  if (!draggedActivity) return;
                  
                  // Find the element under the touch point
                  const touch = e.changedTouches[0];
                  const elementsAtTouch = document.elementsFromPoint(touch.clientX, touch.clientY);
                  
                  // Find the first draggable element in the elements under the touch
                  const touchedElement = elementsAtTouch.find(el => 
                    el.getAttribute('draggable') === 'true' && 
                    el.getAttribute('data-key') && 
                    el.getAttribute('data-key') !== `order-${draggedActivity}`
                  ) as HTMLElement | undefined;
                  
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
                    el.classList.remove('bg-emerald-50', 'opacity-50', 'bg-gray-100');
                  });
                  
                  setDraggedActivity(null);
                }}
                onTouchCancel={(e) => {
                  // Clear the touch timeout if it exists
                  const timeoutId = e.currentTarget.getAttribute('data-touch-timeout');
                  if (timeoutId) {
                    clearTimeout(parseInt(timeoutId));
                    e.currentTarget.removeAttribute('data-touch-timeout');
                  }
                  
                  // Remove all highlights
                  document.querySelectorAll('[draggable="true"]').forEach(el => {
                    el.classList.remove('bg-emerald-50', 'opacity-50', 'bg-gray-100');
                  });
                  
                  setDraggedActivity(null);
                }}
                data-key={`order-${activity}`}
              >
                <button 
                  className="p-1 rounded-full hover:bg-gray-100 cursor-grab active:cursor-grabbing mr-2"
                  onMouseDown={(e) => {
                    // Prevent dropdown from closing when starting drag
                    e.stopPropagation();
                  }}
                  aria-label={`Drag to reorder ${activityDisplayNames[activity]}`}
                  title="Drag to reorder"
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
