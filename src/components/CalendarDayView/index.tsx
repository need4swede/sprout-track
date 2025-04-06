import React, { useMemo } from 'react';
import { cn } from '@/src/lib/utils';
import { CalendarDayViewProps, EventGroups } from './calendar-day-view.types';
import { calendarDayViewStyles as styles } from './calendar-day-view.styles';
import { CalendarEventItem } from '../CalendarEventItem';
import { Loader2, Calendar, Sun, Coffee, Moon, PlusCircle, CalendarClock } from 'lucide-react';
import './calendar-day-view.css';

/**
 * CalendarDayView Component
 * 
 * Displays events for a selected day, grouped by time of day (morning, afternoon, evening).
 * Includes an "Add Event" button and handles loading and empty states.
 * 
 * @param date - The selected date to display events for
 * @param events - Array of events for the selected date
 * @param onEventClick - Optional handler for when an event is clicked
 * @param onAddEvent - Optional handler for when the add event button is clicked
 * @param isLoading - Whether the component is in a loading state
 * @param className - Additional CSS classes
 */
export const CalendarDayView: React.FC<CalendarDayViewProps> = ({
  date,
  events,
  onEventClick,
  onAddEvent,
  isLoading = false,
  className,
}) => {
  // Format date for display
  const formattedDate = useMemo(() => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }, [date]);
  
  // Group events by time of day
  const groupedEvents = useMemo(() => {
    const groups: EventGroups = {
      morning: [],
      afternoon: [],
      evening: []
    };
    
    if (events && events.length > 0) {
      events.forEach(event => {
        // Make sure we have a valid date
        if (!event.startTime) {
          console.warn('Event missing startTime:', event);
          return;
        }
        
        const eventDate = new Date(event.startTime);
        if (isNaN(eventDate.getTime())) {
          console.warn('Invalid event date:', event.startTime);
          return;
        }
        
        const hour = eventDate.getHours();
        
        if (hour < 12) {
          groups.morning.push(event);
        } else if (hour < 17) {
          groups.afternoon.push(event);
        } else {
          groups.evening.push(event);
        }
      });
      
      // Sort events within each group by start time
      const sortByTime = (a: any, b: any) => {
        return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
      };
      
      groups.morning.sort(sortByTime);
      groups.afternoon.sort(sortByTime);
      groups.evening.sort(sortByTime);
    }
    
    return groups;
  }, [events]);
  
  // Handle add event button click
  const handleAddEvent = () => {
    if (onAddEvent) {
      onAddEvent(date);
    }
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <div className={cn(
        styles.container,
        'calendar-day-view-container',
        className
      )}>
        <div className={cn(
          styles.header,
          'calendar-day-view-header'
        )}>
          <h2 className={styles.headerTitle}>{formattedDate}</h2>
        </div>
        
        <div className={cn(
          styles.loadingContainer,
          'calendar-day-view'
        )}>
          <Loader2 className={cn(
            styles.loadingSpinner,
            'calendar-day-view-spinner'
          )} />
        </div>
      </div>
    );
  }
  
  // Render empty state
  if (events.length === 0) {
    return (
      <div className={cn(
        styles.container,
        'calendar-day-view-container',
        className
      )}>
        <div className={cn(
          styles.header,
          'calendar-day-view-header'
        )}>
          <h2 className={styles.headerTitle}>{formattedDate}</h2>
        </div>
        
        <div className={cn(
          styles.content,
          'calendar-day-view-content'
        )}>
          <div className={cn(
            styles.emptyContainer,
            'calendar-day-view'
          )}>
            <CalendarClock className={styles.emptyIcon} />
            <p className={cn(
              styles.emptyText,
              'calendar-day-view-empty-text'
            )}>
              No events scheduled for this day
            </p>
          </div>
        </div>
        
        {onAddEvent && (
          <div className={cn(
            styles.addButtonContainer,
            'calendar-day-view-add-button-container'
          )}>
            <button
              className={styles.addButton}
              onClick={handleAddEvent}
              aria-label="Add event"
            >
              <PlusCircle className={styles.addButtonIcon} />
              Add Event
            </button>
          </div>
        )}
      </div>
    );
  }
  
  // Render events grouped by time of day
  return (
    <div className={cn(
      styles.container,
      'calendar-day-view-container',
      className
    )}>
      <div className={cn(
        styles.header,
        'calendar-day-view-header'
      )}>
        <h2 className={styles.headerTitle}>{formattedDate}</h2>
      </div>
      
      <div className={cn(
        styles.content,
        'calendar-day-view-content h-full overflow-y-auto'
      )}>
        <div className="calendar-day-view">
          {/* Morning events */}
          {groupedEvents.morning.length > 0 && (
            <div className={styles.eventGroup}>
              <div className={styles.eventGroupHeader}>
                <Sun className={styles.eventGroupIcon} />
                <h3 className={cn(
                  styles.eventGroupTitle,
                  'calendar-day-view-group-title'
                )}>
                  Morning
                </h3>
              </div>
              
              <div className={styles.eventsList}>
                {groupedEvents.morning.map(event => (
                  <CalendarEventItem
                    key={event.id}
                    event={event}
                    onClick={onEventClick}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Afternoon events */}
          {groupedEvents.afternoon.length > 0 && (
            <div className={styles.eventGroup}>
              <div className={styles.eventGroupHeader}>
                <Coffee className={styles.eventGroupIcon} />
                <h3 className={cn(
                  styles.eventGroupTitle,
                  'calendar-day-view-group-title'
                )}>
                  Afternoon
                </h3>
              </div>
              
              <div className={styles.eventsList}>
                {groupedEvents.afternoon.map(event => (
                  <CalendarEventItem
                    key={event.id}
                    event={event}
                    onClick={onEventClick}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Evening events */}
          {groupedEvents.evening.length > 0 && (
            <div className={styles.eventGroup}>
              <div className={styles.eventGroupHeader}>
                <Moon className={styles.eventGroupIcon} />
                <h3 className={cn(
                  styles.eventGroupTitle,
                  'calendar-day-view-group-title'
                )}>
                  Evening
                </h3>
              </div>
              
              <div className={styles.eventsList}>
                {groupedEvents.evening.map(event => (
                  <CalendarEventItem
                    key={event.id}
                    event={event}
                    onClick={onEventClick}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {onAddEvent && (
        <div className={cn(
          styles.addButtonContainer,
          'calendar-day-view-add-button-container'
        )}>
          <button
            className={styles.addButton}
            onClick={handleAddEvent}
            aria-label="Add event"
          >
            <PlusCircle className={styles.addButtonIcon} />
            Add Event
          </button>
        </div>
      )}
    </div>
  );
};

export default CalendarDayView;
