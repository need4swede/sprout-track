import React, { useState, useEffect } from 'react';
import { useTheme } from '@/src/context/theme';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Card } from '@/src/components/ui/card';
import { cn } from '@/src/lib/utils';
import CalendarDayView from '@/src/components/CalendarDayView';
import CalendarEventForm from '@/src/components/forms/CalendarEventForm';
import { CalendarProps, CalendarState } from './calendar.types';
import { calendarStyles as styles } from './calendar.styles';
import { CalendarEventFormData } from '@/src/components/forms/CalendarEventForm/calendar-event-form.types';
import './calendar.css';

/**
 * Calendar Component
 * 
 * A responsive calendar component that displays a monthly view with activity indicators
 * and allows users to view and manage calendar events.
 * 
 * @param selectedBabyId - The ID of the currently selected baby
 * @param userTimezone - The user's timezone for date calculations
 */
export function Calendar({ selectedBabyId, userTimezone }: CalendarProps) {
  const { theme } = useTheme();
  
  // Component state
  const [state, setState] = useState<CalendarState>({
    // Set initial date to April 2025 to match the event in the database
    currentDate: new Date(2025, 3, 1), // April 1, 2025 (months are 0-indexed)
    selectedDate: null,
    calendarDays: [],
    events: [],
    // isLoadingEvents removed
    showEventForm: false,
    selectedEvent: undefined,
    babies: [],
    caretakers: [],
    contacts: []
  });
  
  // Destructure state for easier access
  const {
    currentDate,
    selectedDate,
    calendarDays,
    events,
    // isLoadingEvents removed
    showEventForm,
    selectedEvent,
    babies,
    caretakers,
    contacts
  } = state;
  
  // State update helpers
  const updateState = (updates: Partial<CalendarState>) => {
    setState(prevState => ({ ...prevState, ...updates }));
  };

  /**
   * Fetch babies, caretakers, and contacts for the event form
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch babies
        const babiesResponse = await fetch('/api/baby');
        const babiesData = await babiesResponse.json();
        
        // Fetch caretakers
        const caretakersResponse = await fetch('/api/caretaker');
        const caretakersData = await caretakersResponse.json();
        
        // Fetch contacts
        const contactsResponse = await fetch('/api/contact');
        const contactsData = await contactsResponse.json();
        
        // Update state with fetched data
        updateState({
          babies: babiesData.success 
            ? babiesData.data.map((baby: any) => ({
                id: baby.id,
                firstName: baby.firstName,
                lastName: baby.lastName
              }))
            : [],
          caretakers: caretakersData.success 
            ? caretakersData.data.map((caretaker: any) => ({
                id: caretaker.id,
                name: caretaker.name,
                type: caretaker.type
              }))
            : [],
          contacts: contactsData.success ? contactsData.data : []
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  /**
   * Function to get all days in a month for the calendar
   */
  const getDaysInMonth = (year: number, month: number): Date[] => {
    const date = new Date(year, month, 1);
    const days: Date[] = [];
    
    // Get the day of the week for the first day of the month (0 = Sunday, 6 = Saturday)
    const firstDayOfMonth = date.getDay();
    
    // Add days from the previous month to fill the first row
    const lastDayOfPrevMonth = new Date(year, month, 0).getDate();
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      days.push(new Date(year, month - 1, lastDayOfPrevMonth - i));
    }
    
    // Add all days in the current month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    // Add days from the next month to complete the last row
    const lastDayOfMonth = new Date(year, month, daysInMonth).getDay();
    const daysToAdd = 6 - lastDayOfMonth;
    for (let i = 1; i <= daysToAdd; i++) {
      days.push(new Date(year, month + 1, i));
    }
    
    return days;
  };

  /**
   * Update calendar days when the current date changes
   */
  useEffect(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const days = getDaysInMonth(year, month);
    updateState({ calendarDays: days });
  }, [currentDate]);

  /**
   * Fetch events for the selected month
   */
  const fetchEvents = async () => {
    if (!selectedBabyId) return;

    try {
      // Create start date (first day of month) and end date (last day of month)
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);
      
      // Set to beginning and end of day
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      
      console.log(`Fetching events for date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);
      console.log(`Baby ID: ${selectedBabyId}, Timezone: ${userTimezone}`);
      
      // Fetch calendar events
      const eventsResponse = await fetch(
        `/api/calendar-event?babyId=${selectedBabyId}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&timezone=${encodeURIComponent(userTimezone)}`
      );
      const eventsData = await eventsResponse.json();
      
      console.log("API Response:", eventsResponse.status, eventsResponse.statusText);
      console.log("Fetched events data:", eventsData);
      
      if (eventsData.success && eventsData.data && eventsData.data.length > 0) {
        console.log(`Found ${eventsData.data.length} events for the month`);
        eventsData.data.forEach((event: any, index: number) => {
          console.log(`Event ${index + 1}:`, {
            id: event.id,
            title: event.title,
            startTime: event.startTime,
            date: new Date(event.startTime).toLocaleString(),
            day: new Date(event.startTime).getDate(),
            month: new Date(event.startTime).getMonth(),
            year: new Date(event.startTime).getFullYear()
          });
        });
      } else {
        console.log("No events found for the month or API returned an error");
      }
      
      // Update state with fetched data
      updateState({
        events: eventsData.success ? eventsData.data : []
      });
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  /**
   * Fetch events when the baby or month changes
   */
  useEffect(() => {
    fetchEvents();
  }, [selectedBabyId, currentDate, userTimezone]);

  // Removed fetchEventsForSelectedDay and its useEffect hook

  /**
   * Navigation handlers
   */
  const goToPreviousMonth = () => {
    updateState({
      currentDate: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    });
  };

  const goToNextMonth = () => {
    updateState({
      currentDate: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    });
  };

  const goToCurrentMonth = () => {
    updateState({
      currentDate: new Date()
    });
  };

  /**
   * Date formatting and checking helpers
   */
  const formatMonthYear = (date: Date): string => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const isCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === currentDate.getMonth();
  };
  
  /**
   * Check if an event's UTC date string matches a given local calendar date.
   * Compares the YYYY-MM-DD part of the UTC string with the local date.
   */
  const isSameUTCDay = (eventDateStr: string | Date, localDate: Date): boolean => {
    try {
      // Ensure localDate is a valid Date object
      if (!(localDate instanceof Date) || isNaN(localDate.getTime())) {
        console.error('Invalid localDate provided to isSameUTCDay:', localDate);
        return false;
      }
      
      // Get the YYYY-MM-DD string for the local calendar date
      const localYear = localDate.getFullYear();
      const localMonth = (localDate.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed
      const localDay = localDate.getDate().toString().padStart(2, '0');
      const localDateString = `${localYear}-${localMonth}-${localDay}`;
      
      // Get the YYYY-MM-DD string from the event's UTC date string
      let eventDateUTCString: string;
      if (eventDateStr instanceof Date) {
        eventDateUTCString = eventDateStr.toISOString().split('T')[0];
      } else if (typeof eventDateStr === 'string') {
        // Attempt to parse the string and extract the date part
        const parsedDate = new Date(eventDateStr);
        if (isNaN(parsedDate.getTime())) {
          console.warn(`Invalid date string in isSameUTCDay: ${eventDateStr}`);
          return false;
        }
        eventDateUTCString = parsedDate.toISOString().split('T')[0];
      } else {
        console.warn(`Invalid eventDateStr type in isSameUTCDay: ${typeof eventDateStr}`);
        return false;
      }
      
      // Compare the date strings
      const result = eventDateUTCString === localDateString;
      
      // Optional: Log for debugging
      // console.log(`Comparing UTC event date ${eventDateUTCString} with local calendar date ${localDateString}. Result: ${result}`);
      
      return result;
    } catch (error) {
      console.error('Error in isSameUTCDay:', error, { eventDateStr, localDate });
      return false;
    }
  };

  /**
   * Get events for a specific day
   */
  const getEventsForDay = (date: Date): any[] => {
    if (!events || events.length === 0) {
      return [];
    }
    
    if (!events || events.length === 0) {
      return [];
    }
    
    // Filter events whose UTC start time falls on the given local calendar date
    return events.filter((event: any) => {
      if (!event.startTime) {
        console.warn(`Event missing startTime: ${event.id}`);
        return false;
      }
      return isSameUTCDay(event.startTime, date);
    });
  };

  /**
   * Event handlers
   */
  const handleDayClick = (date: Date) => {
    updateState({ selectedDate: date });
  };

  const handleEventClick = (event: any) => {
    // Convert event to form data format
    const formData: CalendarEventFormData = {
      id: event.id,
      title: event.title,
      description: event.description || '',
      startTime: new Date(event.startTime),
      endTime: event.endTime ? new Date(event.endTime) : undefined,
      allDay: event.allDay,
      type: event.type,
      location: event.location || '',
      color: event.color || '',
      recurring: event.recurring,
      recurrencePattern: event.recurrencePattern,
      recurrenceEnd: event.recurrenceEnd ? new Date(event.recurrenceEnd) : undefined,
      customRecurrence: event.customRecurrence,
      reminderTime: event.reminderTime,
      babyIds: event.babies.map((baby: any) => baby.id),
      caretakerIds: event.caretakers.map((caretaker: any) => caretaker.id),
      contactIds: event.contacts.map((contact: any) => contact.id),
    };
    
    updateState({
      selectedEvent: formData,
      showEventForm: true
    });
  };

  const handleAddEvent = (date: Date) => {
    updateState({
      selectedEvent: undefined,
      showEventForm: true,
      // Ensure the selected date is updated to match the date passed from CalendarDayView
      selectedDate: date
    });
  };

  const handleSaveEvent = async (eventData: CalendarEventFormData) => {
    try {
      const method = eventData.id ? 'PUT' : 'POST';
      const url = eventData.id ? `/api/calendar-event?id=${eventData.id}` : '/api/calendar-event';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...eventData,
          startTime: eventData.startTime.toISOString(),
          endTime: eventData.endTime?.toISOString(),
          recurrenceEnd: eventData.recurrenceEnd?.toISOString(),
          timezone: userTimezone,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Close form and refresh events
        updateState({ showEventForm: false });
        
        // Refresh all events for the month (this is sufficient)
        fetchEvents();
      } else {
        console.error('Error saving event:', data.error);
      }
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };
  
  const handleCloseEventForm = () => {
    updateState({ showEventForm: false });
  };

  /**
   * Get day cell class based on date
   */
  const getDayClass = (date: Date): string => {
    const baseClass = "flex flex-col h-full min-h-[60px] p-1 border border-gray-200 dark:border-gray-700 cursor-pointer";
    let className = baseClass;
    
    if (isToday(date)) {
      className = cn(className, "bg-teal-50 dark:bg-teal-900/20 border-teal-300 dark:border-teal-700");
    } else if (!isCurrentMonth(date)) {
      className = cn(className, "bg-gray-50 dark:bg-gray-900/50 text-gray-400 dark:text-gray-600");
    } else {
      className = cn(className, "dark:bg-gray-800/30");
    }
    
    // Add selected state (compare using local date components)
    if (selectedDate && 
        date.getDate() === selectedDate.getDate() &&
        date.getMonth() === selectedDate.getMonth() &&
        date.getFullYear() === selectedDate.getFullYear()) {
      className = cn(className, "ring-2 ring-teal-500 dark:ring-teal-400 ring-inset");
    }
    
    return className;
  };

  /**
   * Render calendar event indicators
   */
  const renderActivityIndicators = (date: Date) => {
    // Get events for this day
    const dayEvents = getEventsForDay(date);
    
    // Only show indicators if there are calendar events for this day
    if (dayEvents.length === 0) {
      return null;
    }
    
    return (
      <div className="flex flex-wrap gap-1 mt-auto">
        {dayEvents.map((event, index) => {
          // If the event has a custom color, use it
          if (event.color) {
            return (
              <div 
                key={index} 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: event.color }}
                title={event.title}
              />
            );
          }
          
          // Otherwise use default colors based on event type
          let bgColor = '';
          switch (event.type) {
            case 'APPOINTMENT':
              bgColor = 'bg-blue-500 dark:bg-blue-400';
              break;
            case 'CARETAKER_SCHEDULE':
              bgColor = 'bg-green-500 dark:bg-green-400';
              break;
            case 'REMINDER':
              bgColor = 'bg-yellow-500 dark:bg-yellow-400';
              break;
            case 'CUSTOM':
              bgColor = 'bg-purple-500 dark:bg-purple-400';
              break;
            default:
              bgColor = 'bg-gray-500 dark:bg-gray-400';
          }
          
          return (
            <div 
              key={index} 
              className={`w-2 h-2 rounded-full ${bgColor}`} 
              title={event.title}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="relative z-0 flex flex-col h-full calendar-container">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-2 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-t-md calendar-header">
        <Button
          variant="ghost"
          size="icon"
          onClick={goToPreviousMonth}
          className="text-white hover:bg-teal-500/20"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        <div className="flex flex-col items-center">
          <h2 className="text-lg font-semibold">{formatMonthYear(currentDate)}</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={goToCurrentMonth}
            className="text-xs text-white/80 hover:text-white hover:bg-teal-500/20 py-0 h-6"
          >
            Today
          </Button>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={goToNextMonth}
          className="text-white hover:bg-teal-500/20"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Calendar Grid */}
        <Card className={`flex-1 overflow-hidden border-0 rounded-t-none calendar-grid ${selectedDate ? 'hidden md:flex' : 'flex'} md:flex-col`}>
          <div className="h-full overflow-y-auto flex flex-col">
            {/* Day names header */}
            <div className="grid grid-cols-7 text-center bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 calendar-weekdays">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                <div key={index} className="py-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar days */}
            <div className="grid grid-cols-7 h-[calc(100%-32px)] calendar-days">
              {calendarDays.map((date, index) => (
                <div 
                  key={index} 
                  className={`${getDayClass(date)} cursor-pointer`}
                  onClick={() => handleDayClick(date)}
                >
                  <span className={`text-xs ${isToday(date) ? 'font-bold text-teal-700 dark:text-teal-300' : ''}`}>
                    {date.getDate()}
                  </span>
                  {renderActivityIndicators(date)}
                </div>
              ))}
            </div>
          </div>
        </Card>
        
        {/* Day view (only shown when a date is selected) */}
        {/* Day view (only shown when a date is selected) */}
        {selectedDate && (
          <div className={`flex-1 ml-0 md:ml-4 ${selectedDate ? 'flex' : 'hidden md:flex'} flex-col`}>
            <CalendarDayView
              date={selectedDate}
              // Pass only events for the selected day
              events={getEventsForDay(selectedDate)} 
              onEventClick={handleEventClick}
              onAddEvent={handleAddEvent}
              // isLoading removed as it's no longer needed
            />
          </div>
        )}
      </div>
      
      {/* Add event button (only shown on mobile when no date is selected) */}
      {!selectedDate && (
        <div className="md:hidden fixed bottom-4 right-4">
          <Button
            onClick={() => handleAddEvent(new Date())}
            className="rounded-full w-12 h-12 shadow-lg"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      )}
      
      {/* Event form */}
      <CalendarEventForm
        isOpen={showEventForm}
        onClose={handleCloseEventForm}
        event={selectedEvent}
        onSave={handleSaveEvent}
        initialDate={selectedDate || undefined}
        babies={babies}
        caretakers={caretakers}
        contacts={contacts}
      />
    </div>
  );
}
