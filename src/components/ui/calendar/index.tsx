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
 * - Date range selection support
 *
 * @example
 * ```tsx
 * // Single date selection
 * <Calendar 
 *   selected={selectedDate}
 *   onSelect={setSelectedDate}
 *   variant="default"
 * />
 * 
 * // Date range selection
 * <Calendar 
 *   mode="range"
 *   rangeFrom={fromDate}
 *   rangeTo={toDate}
 *   onRangeChange={(from, to) => {
 *     setFromDate(from);
 *     setToDate(to);
 *   }}
 * />
 * ```
 */
const Calendar = React.forwardRef<HTMLDivElement, CalendarProps>(
  ({ 
    className,
    variant = "default",
    selected,
    onSelect,
    rangeFrom,
    rangeTo,
    onRangeChange,
    mode = "single",
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
      return monthProp || (selected || rangeFrom || new Date());
    });
    
    // State for range selection
    const [rangeSelectionState, setRangeSelectionState] = React.useState<'start' | 'end'>(
      rangeFrom && !rangeTo ? 'end' : 'start'
    );

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

    // Function to check if a date is selected (for single date mode)
    const isSelected = (date: Date) => {
      if (mode === "range" || !selected) return false;
      
      return (
        date.getFullYear() === selected.getFullYear() &&
        date.getMonth() === selected.getMonth() &&
        date.getDate() === selected.getDate()
      );
    };
    
    // Function to check if a date is the range start
    const isRangeStart = (date: Date) => {
      if (mode !== "range" || !rangeFrom) return false;
      
      return (
        date.getFullYear() === rangeFrom.getFullYear() &&
        date.getMonth() === rangeFrom.getMonth() &&
        date.getDate() === rangeFrom.getDate()
      );
    };
    
    // Function to check if a date is the range end
    const isRangeEnd = (date: Date) => {
      if (mode !== "range" || !rangeTo) return false;
      
      return (
        date.getFullYear() === rangeTo.getFullYear() &&
        date.getMonth() === rangeTo.getMonth() &&
        date.getDate() === rangeTo.getDate()
      );
    };
    
    // Function to check if a date is in the middle of the range
    const isInRange = (date: Date) => {
      if (mode !== "range" || !rangeFrom || !rangeTo) return false;
      
      const normalizedDate = new Date(date);
      normalizedDate.setHours(0, 0, 0, 0);
      
      const normalizedFrom = new Date(rangeFrom);
      normalizedFrom.setHours(0, 0, 0, 0);
      
      const normalizedTo = new Date(rangeTo);
      normalizedTo.setHours(0, 0, 0, 0);
      
      return normalizedDate > normalizedFrom && normalizedDate < normalizedTo;
    };

    // Function to format date for display
    const formatDate = (date: Date | null | undefined) => {
      if (!date) return '';
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    // Function to handle date selection
    const handleDateSelect = (date: Date) => {
      if (isDisabled(date)) return;
      
      if (mode === "single") {
        if (onSelect) onSelect(date);
      } else if (mode === "range" && onRangeChange) {
        if (rangeSelectionState === 'start') {
          // Start a new range - clear any existing selection
          onRangeChange(date, null);
          setRangeSelectionState('end');
        } else {
          // Complete the range
          if (rangeFrom) {
            // Ensure end date is after start date
            if (date < rangeFrom) {
              // If user selects a date before the start date, swap them
              onRangeChange(date, rangeFrom);
            } else {
              onRangeChange(rangeFrom, date);
            }
          } else {
            // If somehow we don't have a start date, set both to the same
            onRangeChange(date, date);
          }
          setRangeSelectionState('start');
        }
      }
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
          isRangeStart: isRangeStart(date),
          isRangeEnd: isRangeEnd(date),
          isInRange: isInRange(date),
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
          isRangeStart: isRangeStart(date),
          isRangeEnd: isRangeEnd(date),
          isInRange: isInRange(date),
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
          isRangeStart: isRangeStart(date),
          isRangeEnd: isRangeEnd(date),
          isInRange: isInRange(date),
        });
      }
      
      return result;
    }, [month, selected, rangeFrom, rangeTo, disabledDates, minDate, maxDate, isDateDisabled, mode]);

    // Day names for the calendar header
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div
        ref={ref}
        className={cn(calendarVariants({ variant }), className, "calendar")}
        {...props}
      >
        {/* Date Range Display */}
        {mode === "range" && (
          <div className="px-3 pt-2 pb-4 text-sm text-gray-700 flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 font-medium">From</span>
              <span className="font-semibold">{formatDate(rangeFrom) || '—'}</span>
            </div>
            <div className="h-px w-4 bg-gray-300 mx-2"></div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 font-medium">To</span>
              <span className="font-semibold">{formatDate(rangeTo) || '—'}</span>
            </div>
          </div>
        )}
        
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
        <div className="grid grid-cols-7 gap-0 calendar-grid">
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
                  rangeStart: day.isRangeStart,
                  rangeEnd: day.isRangeEnd,
                  rangeMiddle: day.isInRange,
                  today: day.isToday,
                  disabled: day.isDisabled,
                  outside: day.isOutsideMonth,
                }),
                "calendar-day",
                day.isSelected && "calendar-day-selected",
                day.isRangeStart && "calendar-day-range-start",
                day.isRangeEnd && "calendar-day-range-end",
                day.isInRange && "calendar-day-range-middle",
                day.isToday && "calendar-day-today",
                day.isDisabled && "calendar-day-disabled",
                day.isOutsideMonth && "calendar-day-outside"
              )}
              aria-label={day.date.toLocaleDateString()}
              aria-selected={day.isSelected || day.isRangeStart || day.isRangeEnd}
              tabIndex={day.isSelected || day.isRangeStart || day.isRangeEnd || (initialFocus && index === 0) ? 0 : -1}
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
