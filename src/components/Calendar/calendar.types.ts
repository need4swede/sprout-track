import { CalendarEventData } from '@/src/components/CalendarEvent/calendar-event.types';
import { Baby, Caretaker, Contact } from '@/src/components/CalendarEvent/calendar-event.types';
import { CalendarEventFormData } from '@/src/components/forms/CalendarEventForm/calendar-event-form.types';

/**
 * Type definitions for the Calendar component
 */

/**
 * Props for the Calendar component
 */
export interface CalendarProps {
  /**
   * The ID of the currently selected baby
   */
  selectedBabyId: string | undefined;
  
  /**
   * The user's timezone for date calculations
   */
  userTimezone: string;
}

/**
 * Calendar day item with associated data
 */
export interface CalendarDayItem {
  /**
   * The date for this calendar day
   */
  date: Date;
  
  /**
   * Whether this day is in the current month
   */
  isCurrentMonth: boolean;
  
  /**
   * Whether this day is today
   */
  isToday: boolean;
  
  /**
   * Whether this day is selected
   */
  isSelected: boolean;
  
  /**
   * Activities and events for this day
   */
  items: any[];
}

/**
 * Calendar state interface
 */
export interface CalendarState {
  /**
   * The current date being viewed (month/year)
   */
  currentDate: Date;
  
  /**
   * The currently selected date
   */
  selectedDate: Date | null;
  
  /**
   * All days to display in the calendar grid
   */
  calendarDays: Date[];
  
  /**
   * Calendar events from the calendar-event API
   */
  events: CalendarEventData[];
  
  /**
   * Whether events are currently loading (Optional)
   */
  isLoadingEvents?: boolean;
  
  /**
   * Whether the event form is visible
   */
  showEventForm: boolean;
  
  /**
   * The currently selected event for editing
   */
  selectedEvent: CalendarEventFormData | undefined;
  
  /**
   * Available babies for event assignment
   */
  babies: Baby[];
  
  /**
   * Available caretakers for event assignment
   */
  caretakers: Caretaker[];
  
  /**
   * Available contacts for event assignment
   */
  contacts: Contact[];
}
