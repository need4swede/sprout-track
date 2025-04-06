import React, { useMemo } from 'react';
import { cn } from '@/src/lib/utils';
import { CalendarDayViewProps, EventGroups } from './calendar-day-view.types';
import { calendarDayViewStyles as styles } from './calendar-day-view.styles';
import { CalendarEventItem } from '../CalendarEventItem';
import { Loader2, Calendar, Sun, Coffee, Moon, PlusCircle, CalendarClock, X } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { 
  FormPage, 
  FormPageContent, 
  FormPageHeader, 
  FormPageFooter 
} from '@/src/components/ui/form-page';
import './calendar-day-view.css';

/**
 * CalendarDayView Component
 * 
 * Displays events for a selected day, grouped by time of day (morning, afternoon, evening).
 * Includes an "Add Event" button and handles loading and empty states.
 * Uses FormPage component for consistent layout with the rest of the app.
 * 
 * @param date - The selected date to display events for
 * @param events - Array of events for the selected date
 * @param onEventClick - Optional handler for when an event is clicked
 * @param onAddEvent - Optional handler for when the add event button is clicked
 * @param isLoading - Whether the component is in a loading state
 * @param className - Additional CSS classes
 * @param onClose - Optional handler for when the form page is closed
 */
export const CalendarDayView: React.FC<CalendarDayViewProps> = ({
  date,
  events,
  onEventClick,
  onAddEvent,
  isLoading = false,
  className,
  onClose,
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
  
  // Handle close button click
  const handleClose = () => {
    // Call the onClose prop if provided
    if (onClose) {
      onClose();
    }
  };
  
  // Render content based on loading and events state
  const renderContent = () => {
    // Loading state
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 text-teal-500 dark:text-teal-400 animate-spin" />
        </div>
      );
    }
    
    // Empty state
    if (events.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-6">
          <CalendarClock className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-2" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No events scheduled for this day
          </p>
        </div>
      );
    }
    
    // Events state - grouped by time of day
    return (
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
    );
  };
  
  // Use FormPage component to render the calendar day view
  return (
    <FormPage
      isOpen={true}
      onClose={handleClose}
      title={formattedDate}
      className={cn('calendar-day-view-slide-in', className)}
    >
      <FormPageContent className="calendar-day-view-content">
        {renderContent()}
      </FormPageContent>
      
      <FormPageFooter>
        <Button variant="outline" onClick={handleClose}>
          Close
        </Button>
        
        {onAddEvent && (
          <Button onClick={handleAddEvent}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        )}
      </FormPageFooter>
    </FormPage>
  );
};

export default CalendarDayView;
