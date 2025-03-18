'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { formatInTimeZone } from 'date-fns-tz';

interface TimezoneContextType {
  userTimezone: string;
  serverTimezone: string;
  convertToUserTimezone: (dateString: string) => Date;
  formatInUserTimezone: (dateString: string, formatOptions?: Intl.DateTimeFormatOptions) => string;
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

  return (
    <TimezoneContext.Provider value={{
      userTimezone,
      serverTimezone,
      convertToUserTimezone,
      formatInUserTimezone
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
