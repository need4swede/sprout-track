'use client';

import React, { useState, useEffect } from 'react';
import './date-time-picker.css';
import { Calendar } from '@/src/components/ui/calendar';
import { TimeEntry } from '@/src/components/ui/time-entry';
import { Input } from '@/src/components/ui/input';
import { cn } from '@/src/lib/utils';
import { format, isValid } from 'date-fns';
import { CalendarIcon, Clock } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from '@/src/components/ui/dialog';

// Import types and styles
import { DateTimePickerProps } from './date-time-picker.types';
import {
  dateTimePickerDialogStyles,
  dateTimePickerContentContainerStyles,
  dateTimePickerContentStyles,
  dateTimePickerToggleContainerStyles,
  dateTimePickerViewContainerStyles,
  dateTimePickerCalendarContainerStyles,
  dateTimePickerTimeContainerStyles,
  dateTimePickerFooterStyles,
  dateTimePickerDoneButtonStyles,
  dateTimePickerInputContainerStyles,
  dateTimePickerCalendarIconStyles,
  getToggleButtonStyles
} from './date-time-picker.styles';

/**
 * DateTimePicker Component
 * 
 * A component that combines the Calendar for date selection and TimeEntry for time selection,
 * triggered from an Input component.
 * 
 * Features:
 * - Input field with formatted date/time display
 * - Dialog with tabbed interface for date and time selection
 * - Calendar component for date selection
 * - TimeEntry component for time selection with touch controls
 * - Mobile responsive design with horizontal scrolling
 */
export function DateTimePicker({
  value,
  onChange,
  className,
  disabled = false,
  placeholder = "Select date and time...",
}: DateTimePickerProps) {
  // Ensure we have a valid date
  const [date, setDate] = useState<Date>(() => {
    // Check if value is a valid Date
    if (value instanceof Date && isValid(value)) {
      return value;
    }
    // Fallback to current date
    return new Date();
  });
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<'date' | 'time'>('date');
  
  // Update the date when the value prop changes
  useEffect(() => {
    if (value instanceof Date && isValid(value)) {
      setDate(value);
    }
  }, [value]);
  
  // Handle date selection from Calendar
  const handleDateSelect = (newDate: Date | undefined) => {
    if (!newDate) return;
    
    // Create a new date with the selected date but keep the time from the current value
    const updatedDate = new Date(newDate);
    updatedDate.setHours(date.getHours());
    updatedDate.setMinutes(date.getMinutes());
    updatedDate.setSeconds(0);
    updatedDate.setMilliseconds(0);
    
    setDate(updatedDate);
    onChange(updatedDate);
    
    // Switch to time view after selecting a date
    setView('time');
  };
  
  // Handle time change from TimeEntry
  const handleTimeChange = (newDate: Date) => {
    setDate(newDate);
    onChange(newDate);
  };
  
  // Format the date for display in the input
  const formatDate = (date: Date | null): string => {
    if (!date || !isValid(date)) return '';
    try {
      return format(date, 'PPp'); // e.g., "Apr 7, 2025, 1:55 PM"
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };
  
  // Toggle between date and time views
  const toggleView = () => {
    setView(view === 'date' ? 'time' : 'date');
  };
  

  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className={dateTimePickerInputContainerStyles}>
          <Input
            value={date ? formatDate(date) : ''}
            placeholder={placeholder}
            className={cn("pr-10", className)}
            disabled={disabled}
            readOnly
            onClick={() => setOpen(true)}
          />
          <CalendarIcon className={cn(dateTimePickerCalendarIconStyles, "date-time-picker-calendar-icon")} />
        </div>
      </DialogTrigger>
      <DialogContent 
        className={cn(dateTimePickerDialogStyles, "date-time-picker-dialog")}
        hideClose={true}>
        {/* Hidden title for accessibility */}
        <DialogTitle className="sr-only">Date and Time Picker</DialogTitle>
        <div className={dateTimePickerContentContainerStyles}>
          <div className={dateTimePickerContentStyles}>
            {/* View toggle */}
            <div className={cn(dateTimePickerToggleContainerStyles, "date-time-picker-toggle-container")}>
              <Button
                variant="ghost"
                className={cn(
                  getToggleButtonStyles(view === 'date'),
                  view === 'date' ? "date-time-picker-toggle-button-active" : "date-time-picker-toggle-button-inactive"
                )}
                onClick={() => setView('date')}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {isValid(date) ? format(date, 'MMM d, yyyy') : 'Date'}
              </Button>
              <Button
                variant="ghost"
                className={cn(
                  getToggleButtonStyles(view === 'time'),
                  view === 'time' ? "date-time-picker-toggle-button-active" : "date-time-picker-toggle-button-inactive"
                )}
                onClick={() => setView('time')}
              >
                <Clock className="mr-2 h-4 w-4" />
                {isValid(date) ? format(date, 'h:mm a') : 'Time'}
              </Button>
            </div>
            
            {/* Date view */}
            {view === 'date' && (
              <div className={dateTimePickerViewContainerStyles}>
                <div className={dateTimePickerCalendarContainerStyles}>
                  <Calendar
                    selected={date}
                    onSelect={handleDateSelect}
                    isDateDisabled={disabled ? () => true : undefined}
                    initialFocus
                    variant="date-time-picker"
                    className="mx-auto"
                  />
                </div>
              </div>
            )}
            
            {/* Time view */}
            {view === 'time' && (
              <div className={dateTimePickerViewContainerStyles}>
                <div className={dateTimePickerTimeContainerStyles}>
                  <TimeEntry
                    value={date}
                    onChange={handleTimeChange}
                    disabled={disabled}
                    className="mx-auto w-full"
                  />
                </div>
              </div>
            )}
            
            {/* Footer with done button */}
            <div className={cn(dateTimePickerFooterStyles, "date-time-picker-footer")}>
              <Button
                variant="default"
                size="sm"
                onClick={() => setOpen(false)}
                className={cn(dateTimePickerDoneButtonStyles, "date-time-picker-done-button")}
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default DateTimePicker;
