'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { formatInTimeZone } from 'date-fns-tz';

interface TimezoneContextType {
  userTimezone: string;
  serverTimezone: string;
  convertToUserTimezone: (dateString: string) => Date;
  formatInUserTimezone: (dateString: string, formatOptions?: Intl.DateTimeFormatOptions) => string;
  getMinutesBetweenDates: (startDate: Date | string, endDate: Date | string) => number;
  getTimezoneInfo: () => { 
    userTimezone: string; 
    serverTimezone: string; 
    currentTime: string;
    currentOffset: number;
    isMobile: boolean;
  };
}

const TimezoneContext = createContext<TimezoneContextType | undefined>(undefined);

export function TimezoneProvider({ children }: { children: ReactNode }) {
  const [userTimezone, setUserTimezone] = useState<string>('UTC');
  const [serverTimezone, setServerTimezone] = useState<string>('America/Chicago');

  useEffect(() => {
    // Detect user's timezone from browser
    const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setUserTimezone(detectedTimezone);
    
    // Fetch server timezone from settings
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data.timezone) {
          setServerTimezone(data.data.timezone);
        }
      })
      .catch(err => console.error('Error fetching timezone settings:', err));
  }, []);

  // Convert a date string to user's timezone
  const convertToUserTimezone = (dateString: string): Date => {
    if (!dateString) return new Date();
    
    try {
      const date = new Date(dateString);
      return date;
    } catch (error) {
      console.error('Error converting date to user timezone:', error);
      return new Date();
    }
  };

  // Format a date in user's timezone with specified format
  const formatInUserTimezone = (
    dateString: string, 
    formatOptions: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }
  ): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      
      return date.toLocaleString('en-US', {
        ...formatOptions,
        timeZone: userTimezone
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  // Calculate the difference in minutes between two dates, accounting for DST changes
  const getMinutesBetweenDates = (startDateInput: Date | string, endDateInput: Date | string): number => {
    try {
      // Convert inputs to Date objects if they're strings
      const startDate = typeof startDateInput === 'string' ? new Date(startDateInput) : startDateInput;
      const endDate = typeof endDateInput === 'string' ? new Date(endDateInput) : endDateInput;
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error('Invalid date input');
      }
      
      // Check if we're on a mobile device
      const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      // For mobile browsers, use a simpler calculation that might be more reliable
      if (isMobile) {
        console.log('Using mobile-friendly time calculation');
        const diffMs = endDate.getTime() - startDate.getTime();
        return Math.floor(diffMs / 60000);
      }
      
      // For desktop browsers, use the DST-aware calculation
      // Get the timezone offset at the start time and end time
      const startOffset = startDate.getTimezoneOffset();
      const endOffset = endDate.getTimezoneOffset();
      
      // Calculate the offset difference in milliseconds
      // If DST has changed, this will be non-zero (typically 3600000 ms or 1 hour)
      const offsetDiff = (startOffset - endOffset) * 60 * 1000;
      
      // Calculate duration in minutes, accounting for DST changes
      const diffMs = endDate.getTime() - startDate.getTime() - offsetDiff;
      return Math.floor(diffMs / 60000);
    } catch (error) {
      console.error('Error calculating minutes between dates:', error);
      // Fallback to simple calculation if the DST-aware calculation fails
      const start = typeof startDateInput === 'string' ? new Date(startDateInput) : startDateInput;
      const end = typeof endDateInput === 'string' ? new Date(endDateInput) : endDateInput;
      const diffMs = end.getTime() - start.getTime();
      return Math.floor(diffMs / 60000);
    }
  };

  // Get timezone information for debugging
  const getTimezoneInfo = () => {
    const now = new Date();
    const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    return {
      userTimezone,
      serverTimezone,
      currentTime: now.toISOString(),
      currentOffset: now.getTimezoneOffset(),
      isMobile
    };
  };

  return (
    <TimezoneContext.Provider value={{
      userTimezone,
      serverTimezone,
      convertToUserTimezone,
      formatInUserTimezone,
      getMinutesBetweenDates,
      getTimezoneInfo
    }}>
      {children}
    </TimezoneContext.Provider>
  );
}

export function useTimezone() {
  const context = useContext(TimezoneContext);
  if (context === undefined) {
    throw new Error('useTimezone must be used within a TimezoneProvider');
  }
  return context;
}
