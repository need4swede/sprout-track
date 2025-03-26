'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useTheme } from '@/src/context/theme';
import './calendar.css'; // Import the CSS file with dark mode overrides

import {
  calendarVariants,
  calendarHeaderVariants,
  calendarNavButtonVariants,
  calendarMonthSelectVariants,
  calendarDayVariants,
  calendarDayNamesVariants,
  calendarDayNameVariants,
} from './calendar.styles';
import { CalendarProps } from './calendar.types';

/**
 * Calendar component
 * 
 * A custom calendar component with styled appearance that follows the project's design system.
 * It's designed to be cross-platform compatible with minimal changes required for React Native.
 *
 * Features:
 * - Month navigation with previous/next buttons
 * - Date selection with customizable callbacks
 * - Support for disabled dates
 * - Highlighting of today's date
 * - Responsive design with different size variants
 *
 * @example
 * ```tsx
 * <Calendar 
 *   selected={selectedDate}
 *   onSelect={setSelectedDate}
 *   variant="default"
 * />
 * ```
 */
const Calendar = React.forwardRef<HTMLDivElement, CalendarProps>(
  ({ 
    className,
    variant = "default",
    selected,
    onSelect,
    month: monthProp,
    minDate,
    maxDate,
    disabledDates = [],
    isDateDisabled,
    initialFocus,
    ...props 
  }, ref) => {
    const { theme } = useTheme();
    // State for the currently displayed month
    const [month, setMonth] = React.useState(() => {
      return monthProp || (selected || new Date());
    });

    // Update month when monthProp changes
    React.useEffect(() => {
      if (monthProp) {
        setMonth(monthProp);
      }
    }, [monthProp]);

    // Get the first day of the month
    const firstDayOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
    
    // Get the last day of the month
    const lastDayOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    
    // Get the day of the week for the first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = firstDayOfMonth.getDay();
    
    // Calculate days from previous month to display
    const daysFromPrevMonth = firstDayOfWeek;
    
    // Calculate total days in the current month
    const daysInMonth = lastDayOfMonth.getDate();
    
    // Calculate how many days to show from the next month to complete the grid
    const daysFromNextMonth = 42 - daysFromPrevMonth - daysInMonth;

    // Function to navigate to the previous month
    const handlePrevMonth = () => {
      setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1));
    };

    // Function to navigate to the next month
    const handleNextMonth = () => {
      setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1));
    };

    // Function to check if a date is disabled
    const isDisabled = (date: Date) => {
      // Check if date is in disabledDates array
      const isInDisabledDates = disabledDates.some(
        disabledDate => 
          disabledDate.getFullYear() === date.getFullYear() &&
          disabledDate.getMonth() === date.getMonth() &&
          disabledDate.getDate() === date.getDate()
      );

      // Check if date is before minDate
      const isBeforeMinDate = minDate ? date < minDate : false;

      // Check if date is after maxDate
      const isAfterMaxDate = maxDate ? date > maxDate : false;

      // Check if date is disabled by custom function
      const isDisabledByFunction = isDateDisabled ? isDateDisabled(date) : false;

      return isInDisabledDates || isBeforeMinDate || isAfterMaxDate || isDisabledByFunction;
    };

    // Function to check if a date is today
    const isToday = (date: Date) => {
      const today = new Date();
      return (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
      );
    };

    // Function to check if a date is selected
    const isSelected = (date: Date) => {
      if (!selected) return false;
      
      return (
        date.getFullYear() === selected.getFullYear() &&
        date.getMonth() === selected.getMonth() &&
        date.getDate() === selected.getDate()
      );
    };

    // Function to handle date selection
    const handleDateSelect = (date: Date) => {
      if (isDisabled(date)) return;
      if (onSelect) onSelect(date);
    };

    // Generate days for the calendar
    const days = React.useMemo(() => {
      const result = [];
      
      // Add days from previous month
      const prevMonth = new Date(month.getFullYear(), month.getMonth() - 1, 1);
      const daysInPrevMonth = new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 0).getDate();
      
      for (let i = daysInPrevMonth - daysFromPrevMonth + 1; i <= daysInPrevMonth; i++) {
        const date = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), i);
        result.push({
          date,
          dayOfMonth: i,
          isOutsideMonth: true,
          isDisabled: isDisabled(date),
          isToday: isToday(date),
          isSelected: isSelected(date),
        });
      }
      
      // Add days from current month
      for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(month.getFullYear(), month.getMonth(), i);
        result.push({
          date,
          dayOfMonth: i,
          isOutsideMonth: false,
          isDisabled: isDisabled(date),
          isToday: isToday(date),
          isSelected: isSelected(date),
        });
      }
      
      // Add days from next month
      const nextMonth = new Date(month.getFullYear(), month.getMonth() + 1, 1);
      
      for (let i = 1; i <= daysFromNextMonth; i++) {
        const date = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), i);
        result.push({
          date,
          dayOfMonth: i,
          isOutsideMonth: true,
          isDisabled: isDisabled(date),
          isToday: isToday(date),
          isSelected: isSelected(date),
        });
      }
      
      return result;
    }, [month, selected, disabledDates, minDate, maxDate, isDateDisabled]);

    // Day names for the calendar header
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div
        ref={ref}
        className={cn(calendarVariants({ variant }), className, "calendar")}
        {...props}
      >
        {/* Calendar Header */}
        <div className={cn(calendarHeaderVariants({ variant }), "calendar-header")}>
          <button
            type="button"
            onClick={handlePrevMonth}
            className={cn(calendarNavButtonVariants({ variant }), "calendar-nav-button")}
            aria-label="Previous month"
            tabIndex={-1} // Prevent default focus
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          <span className={cn(calendarMonthSelectVariants({ variant }), "calendar-month-select")}>
            {month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          
          <button
            type="button"
            onClick={handleNextMonth}
            className={cn(calendarNavButtonVariants({ variant }), "calendar-nav-button")}
            aria-label="Next month"
            tabIndex={-1} // Prevent default focus
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        
        {/* Day Names */}
        <div className={cn(calendarDayNamesVariants({ variant }), "calendar-day-names")}>
          {dayNames.map((day) => (
            <div key={day} className={cn(calendarDayNameVariants({ variant }), "calendar-day-name")}>
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 calendar-grid">
          {days.map((day, index) => (
            <button
              key={`${day.date.toISOString()}-${index}`}
              type="button"
              onClick={() => handleDateSelect(day.date)}
              disabled={day.isDisabled}
              className={cn(
                calendarDayVariants({
                  variant,
                  selected: day.isSelected,
                  today: day.isToday,
                  disabled: day.isDisabled,
                  outside: day.isOutsideMonth,
                }),
                "calendar-day",
                day.isSelected && "calendar-day-selected",
                day.isToday && "calendar-day-today",
                day.isDisabled && "calendar-day-disabled",
                day.isOutsideMonth && "calendar-day-outside"
              )}
              aria-label={day.date.toLocaleDateString()}
              aria-selected={day.isSelected}
              tabIndex={day.isSelected || (initialFocus && index === 0) ? 0 : -1}
            >
              {day.dayOfMonth}
            </button>
          ))}
        </div>
      </div>
    );
  }
);

Calendar.displayName = "Calendar";

export { Calendar };
export type { CalendarProps };
