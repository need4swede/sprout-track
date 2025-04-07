'use client';

import React, { useState, useEffect } from 'react';
import { Calendar } from '@/src/components/ui/calendar';
import { TimeEntry } from '@/src/components/ui/time-entry';
import { Input } from '@/src/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/src/components/ui/popover';
import { cn } from '@/src/lib/utils';
import { format, isValid } from 'date-fns';
import { CalendarIcon, Clock } from 'lucide-react';
import { Button } from '@/src/components/ui/button';

export interface DateTimePickerProps {
  /**
   * The currently selected date and time
   */
  value: Date;
  
  /**
   * Callback function when date/time changes
   */
  onChange: (date: Date) => void;
  
  /**
   * Optional class name for additional styling
   */
  className?: string;
  
  /**
   * Whether the component is disabled
   */
  disabled?: boolean;
  
  /**
   * Optional placeholder text for the input
   */
  placeholder?: string;
}

/**
 * DateTimePicker Component
 * 
 * A component that combines the Calendar for date selection and TimeEntry for time selection,
 * triggered from an Input component.
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
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Input
            value={date ? formatDate(date) : ''}
            placeholder={placeholder}
            className={cn("pr-10", className)}
            disabled={disabled}
            readOnly
          />
          <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 z-[100] border-gray-200 shadow-lg" align="start">
        <div className="flex flex-col">
          {/* View toggle */}
          <div className="flex border-b border-gray-200">
            <Button
              variant="ghost"
              className={`flex-1 rounded-none transition-all duration-300 ${
                view === 'date' 
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                  : 'hover:bg-gray-100'
              }`}
              onClick={() => setView('date')}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              Date
            </Button>
            <Button
              variant="ghost"
              className={`flex-1 rounded-none transition-all duration-300 ${
                view === 'time' 
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                  : 'hover:bg-gray-100'
              }`}
              onClick={() => setView('time')}
            >
              <Clock className="mr-2 h-4 w-4" />
              Time
            </Button>
          </div>
          
          {/* Date view */}
          {view === 'date' && (
            <div className="p-3">
              <Calendar
                selected={date}
                onSelect={handleDateSelect}
                isDateDisabled={disabled ? () => true : undefined}
                initialFocus
              />
            </div>
          )}
          
          {/* Time view */}
          {view === 'time' && (
            <div className="p-3">
              <TimeEntry
                value={date}
                onChange={handleTimeChange}
                disabled={disabled}
              />
            </div>
          )}
          
          {/* Footer with done button */}
          <div className="flex justify-end p-3 border-t border-gray-200">
            <Button
              variant="default"
              size="sm"
              onClick={() => setOpen(false)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white transition-colors duration-300"
            >
              Done
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default DateTimePicker;
