'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/src/lib/utils';
import { Calendar } from '@/src/components/Calendar';
import { TimeEntry } from '@/src/components/ui/time-entry';
import { useTimezone } from '@/app/context/timezone';

export interface DateTimeEntryProps {
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
   * The ID of the currently selected baby (required for Calendar)
   */
  selectedBabyId: string | undefined;
}

/**
 * DateTimeEntry Component
 * 
 * A component that combines the Calendar for date selection and TimeEntry for time selection.
 * 
 * @param value - The currently selected date and time
 * @param onChange - Callback function when date/time changes
 * @param className - Optional class name for additional styling
 * @param disabled - Whether the component is disabled
 * @param selectedBabyId - The ID of the currently selected baby (required for Calendar)
 */
export function DateTimeEntry({
  value,
  onChange,
  className,
  disabled = false,
  selectedBabyId,
}: DateTimeEntryProps) {
  const { userTimezone } = useTimezone();
  const [selectedDate, setSelectedDate] = useState<Date>(value);
  
  // Update the selected date when the value prop changes
  useEffect(() => {
    setSelectedDate(value);
  }, [value]);
  
  // Handle date selection from Calendar
  const handleDateSelection = (date: Date | null) => {
    if (!date) return;
    
    // Create a new date with the selected date but keep the time from the current value
    const newDate = new Date(date);
    newDate.setHours(selectedDate.getHours());
    newDate.setMinutes(selectedDate.getMinutes());
    newDate.setSeconds(0);
    newDate.setMilliseconds(0);
    
    setSelectedDate(newDate);
    onChange(newDate);
  };
  
  // Handle time change from TimeEntry
  const handleTimeChange = (date: Date) => {
    setSelectedDate(date);
    onChange(date);
  };
  
  return (
    <div className={cn("flex flex-col space-y-4", className)}>
      {/* Calendar for date selection */}
      <div className="h-[350px] border rounded-md overflow-hidden">
        <Calendar 
          selectedBabyId={selectedBabyId}
          userTimezone={userTimezone}
          onDateSelect={handleDateSelection}
        />
      </div>
      
      {/* TimeEntry for time selection */}
      <TimeEntry
        value={selectedDate}
        onChange={handleTimeChange}
        disabled={disabled}
      />
    </div>
  );
}

export default DateTimeEntry;
