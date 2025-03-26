import React, { useState, useEffect } from 'react';
import { useTheme } from '@/src/context/theme';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Card } from '@/src/components/ui/card';
import './calendar.css';

interface CalendarProps {
  selectedBabyId: string | undefined;
  userTimezone: string;
}

export function Calendar({ selectedBabyId, userTimezone }: CalendarProps) {
  const { theme } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activities, setActivities] = useState<any[]>([]);
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);

  // Function to get all days in a month for the calendar
  const getDaysInMonth = (year: number, month: number) => {
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

  // Update calendar days when the current date changes
  useEffect(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const days = getDaysInMonth(year, month);
    setCalendarDays(days);
  }, [currentDate]);

  // Fetch activities for the selected month
  const fetchActivities = async () => {
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

      const response = await fetch(
        `/api/timeline?babyId=${selectedBabyId}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&timezone=${encodeURIComponent(userTimezone)}`
      );
      const data = await response.json();
      if (data.success) {
        setActivities(data.data);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  // Fetch activities when the baby or month changes
  useEffect(() => {
    fetchActivities();
  }, [selectedBabyId, currentDate, userTimezone]);

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  // Navigate to current month
  const goToCurrentMonth = () => {
    setCurrentDate(new Date());
  };

  // Format date for display
  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Check if a date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  // Check if a date is in the current month
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  // Get activities for a specific day
  const getActivitiesForDay = (date: Date) => {
    return activities.filter((activity: any) => {
      const activityDate = new Date(activity.time || activity.startTime);
      return activityDate.getDate() === date.getDate() &&
        activityDate.getMonth() === date.getMonth() &&
        activityDate.getFullYear() === date.getFullYear();
    });
  };

  // Get day cell class based on date
  const getDayClass = (date: Date) => {
    let className = "flex flex-col h-full min-h-[60px] p-1 border border-gray-200 dark:border-gray-700";
    
    if (isToday(date)) {
      className += " bg-teal-50 dark:bg-teal-900/20 today";
    } else if (!isCurrentMonth(date)) {
      className += " bg-gray-50 dark:bg-gray-900/50 text-gray-400 dark:text-gray-600 not-current-month";
    } else {
      // Current month days in dark mode get a subtle background
      className += " dark:bg-gray-800/30";
    }
    
    return className;
  };

  // Render activity indicators
  const renderActivityIndicators = (date: Date) => {
    const dayActivities = getActivitiesForDay(date);
    
    // Group activities by type
    const activityTypes = new Set(dayActivities.map((activity: any) => {
      if ('duration' in activity) return 'sleep';
      if ('amount' in activity) return 'feed';
      if ('condition' in activity) return 'diaper';
      if ('content' in activity) return 'note';
      if ('soapUsed' in activity) return 'bath';
      return 'other';
    }));
    
    return (
      <div className="flex flex-wrap gap-1 mt-auto">
        {Array.from(activityTypes).map((type, index) => {
          let bgColor = '';
          switch (type) {
            case 'sleep':
              bgColor = 'bg-gray-500 dark:bg-gray-400';
              break;
            case 'feed':
              bgColor = 'bg-sky-400 dark:bg-sky-500';
              break;
            case 'diaper':
              bgColor = 'bg-teal-500 dark:bg-teal-400';
              break;
            case 'note':
              bgColor = 'bg-yellow-400 dark:bg-yellow-500';
              break;
            case 'bath':
              bgColor = 'bg-orange-400 dark:bg-orange-500';
              break;
            default:
              bgColor = 'bg-purple-400 dark:bg-purple-500';
          }
          
          return (
            <div 
              key={index} 
              className={`w-2 h-2 rounded-full ${bgColor}`} 
              title={`${type} activity`}
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
      
      {/* Calendar Grid */}
      <Card className="flex-1 overflow-hidden border-0 rounded-t-none calendar-grid">
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
              <div key={index} className={getDayClass(date)}>
                <span className={`text-xs ${isToday(date) ? 'font-bold text-teal-700 dark:text-teal-300' : ''}`}>
                  {date.getDate()}
                </span>
                {renderActivityIndicators(date)}
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
