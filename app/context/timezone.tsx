'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

/**
 * Interface for the timezone context
 */
interface TimezoneContextType {
  /**
   * The user's detected timezone (e.g., 'America/Denver')
   */
  userTimezone: string;
  
  /**
   * Format an ISO date string in the user's timezone with specified format options
   */
  formatDate: (isoString: string | null | undefined, formatOptions?: Intl.DateTimeFormatOptions) => string;
  
  /**
   * Format a time-only representation of an ISO date string in the user's timezone
   */
  formatTime: (isoString: string | null | undefined) => string;
  
  /**
   * Format a date-only representation of an ISO date string in the user's timezone
   */
  formatDateOnly: (isoString: string | null | undefined) => string;
  
  /**
   * Format a date and time representation of an ISO date string in the user's timezone
   */
  formatDateTime: (isoString: string | null | undefined) => string;
  
  /**
   * Calculate the duration between two ISO date strings in minutes
   */
  calculateDurationMinutes: (startIsoString: string | null | undefined, endIsoString: string | null | undefined) => number;
  
  /**
   * Format a duration in minutes to a human-readable string (HH:MM)
   */
  formatDuration: (minutes: number) => string;
  
  /**
   * Check if a date is today in the user's timezone
   */
  isToday: (isoString: string | null | undefined) => boolean;
  
  /**
   * Check if a date is yesterday in the user's timezone
   */
  isYesterday: (isoString: string | null | undefined) => boolean;
  
  /**
   * Get timezone information for debugging
   */
  getTimezoneInfo: () => { 
    userTimezone: string;
    currentTime: string;
    currentOffset: number;
    isMobile: boolean;
  };
}

const TimezoneContext = createContext<TimezoneContextType | undefined>(undefined);

/**
 * Provider component for timezone context
 */
export function TimezoneProvider({ children }: { children: ReactNode }) {
  const [userTimezone, setUserTimezone] = useState<string>('UTC');

  useEffect(() => {
    // Detect user's timezone from browser
    try {
      const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setUserTimezone(detectedTimezone);
    } catch (error) {
      console.error('Error detecting timezone:', error);
      // Fallback to UTC
      setUserTimezone('UTC');
    }
  }, []);

  /**
   * Format an ISO date string in the user's timezone with specified format options
   */
  const formatDate = (
    isoString: string | null | undefined, 
    formatOptions: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }
  ): string => {
    if (!isoString) return '';
    
    try {
      // Ensure we're working with a proper ISO string
      // This helps with dates that might not be properly stored in UTC
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return '';
      
      // Use the Intl.DateTimeFormat API which properly handles DST
      const formatter = new Intl.DateTimeFormat('en-US', {
        ...formatOptions,
        timeZone: userTimezone
      });
      
      return formatter.format(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  /**
   * Format a time-only representation of an ISO date string in the user's timezone
   */
  const formatTime = (isoString: string | null | undefined): string => {
    return formatDate(isoString, {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  /**
   * Format a date-only representation of an ISO date string in the user's timezone
   */
  const formatDateOnly = (isoString: string | null | undefined): string => {
    return formatDate(isoString, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  /**
   * Format a date and time representation of an ISO date string in the user's timezone
   */
  const formatDateTime = (isoString: string | null | undefined): string => {
    return formatDate(isoString, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  /**
   * Calculate the duration between two ISO date strings in minutes
   * This version properly handles DST transitions
   */
  const calculateDurationMinutes = (
    startIsoString: string | null | undefined, 
    endIsoString: string | null | undefined
  ): number => {
    if (!startIsoString || !endIsoString) return 0;
    
    try {
      const startDate = new Date(startIsoString);
      const endDate = new Date(endIsoString);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return 0;
      }
      
      // Calculate duration in minutes using UTC timestamps
      // This approach correctly handles DST transitions
      const diffMs = endDate.getTime() - startDate.getTime();
      
      // Check if the duration spans a DST transition
      const startOffset = getTimezoneOffsetForDate(startDate, userTimezone);
      const endOffset = getTimezoneOffsetForDate(endDate, userTimezone);
      
      // If the timezone offsets are different, adjust for DST change
      const dstAdjustmentMs = (endOffset - startOffset) * 60 * 1000;
      
      // Calculate final duration with DST adjustment
      return Math.floor((diffMs - dstAdjustmentMs) / 60000);
    } catch (error) {
      console.error('Error calculating duration:', error);
      return 0;
    }
  };
  
  /**
   * Get timezone offset in minutes for a specific date and timezone
   * Positive values mean behind UTC, negative values mean ahead of UTC
   */
  const getTimezoneOffsetForDate = (date: Date, timezone: string): number => {
    try {
      // Create a date string in the target timezone
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false
      });
      
      // Get the parts of the formatted date
      const parts = formatter.formatToParts(date);
      
      // Extract the components
      const year = parseInt(parts.find(p => p.type === 'year')?.value || '0', 10);
      const month = parseInt(parts.find(p => p.type === 'month')?.value || '0', 10) - 1;
      const day = parseInt(parts.find(p => p.type === 'day')?.value || '0', 10);
      const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0', 10);
      const minute = parseInt(parts.find(p => p.type === 'minute')?.value || '0', 10);
      const second = parseInt(parts.find(p => p.type === 'second')?.value || '0', 10);
      
      // Create a date object with these components in local time
      const localDate = new Date(year, month, day, hour, minute, second);
      
      // Calculate the offset between this local time and the UTC time
      const utcDate = new Date(Date.UTC(year, month, day, hour, minute, second));
      
      // The offset is the difference in minutes
      return (localDate.getTime() - utcDate.getTime()) / 60000;
    } catch (error) {
      console.error('Error getting timezone offset:', error);
      
      // Hardcoded fallback for America/Denver
      if (timezone === 'America/Denver') {
        const month = date.getMonth(); // 0-11
        return month >= 2 && month <= 10 ? -360 : -420; // -360 during DST (UTC-6), -420 otherwise (UTC-7)
      }
      
      return date.getTimezoneOffset();
    }
  };
  
  /**
   * Check if a date is in DST for a specific timezone
   */
  const isDaylightSavingTime = (date: Date, timezone: string): boolean => {
    try {
      // Format the date with the timezone name
      const formatted = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        timeZoneName: 'long'
      }).format(date);
      
      // Check if the timezone name includes "Daylight" or "Summer"
      const isDST = formatted.includes('Daylight') || formatted.includes('Summer');
      
      // If that doesn't work, use the offset comparison method
      if (!isDST) {
        // Create a date in January of the same year
        const jan = new Date(date);
        jan.setMonth(0); // January
        
        // Get the timezone offsets
        const janOffset = getTimezoneOffsetForDate(jan, timezone);
        const dateOffset = getTimezoneOffsetForDate(date, timezone);
        
        // If the offsets are different, we can determine if it's DST
        if (janOffset !== dateOffset) {
          // In northern hemisphere, DST has a smaller absolute offset
          return Math.abs(dateOffset) < Math.abs(janOffset);
        }
      }
      
      return isDST;
    } catch (error) {
      console.error('Error checking DST:', error);
      
      // Hardcoded fallback for America/Denver
      if (timezone === 'America/Denver') {
        const month = date.getMonth(); // 0-11
        return month >= 2 && month <= 10; // March to November
      }
      
      return false;
    }
  };

  /**
   * Format a duration in minutes to a human-readable string (HH:MM)
   */
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}:${mins.toString().padStart(2, '0')}`;
  };

  /**
   * Check if a date is today in the user's timezone
   */
  const isToday = (isoString: string | null | undefined): boolean => {
    if (!isoString) return false;
    
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return false;
      
      const today = new Date();
      
      // Create a formatter that only includes date components (not time)
      const formatter = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        timeZone: userTimezone
      });
      
      // Compare the formatted dates
      return formatter.format(date) === formatter.format(today);
    } catch (error) {
      console.error('Error checking if date is today:', error);
      return false;
    }
  };

  /**
   * Check if a date is yesterday in the user's timezone
   */
  const isYesterday = (isoString: string | null | undefined): boolean => {
    if (!isoString) return false;
    
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return false;
      
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      // Create a formatter that only includes date components (not time)
      const formatter = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        timeZone: userTimezone
      });
      
      // Compare the formatted dates
      return formatter.format(date) === formatter.format(yesterday);
    } catch (error) {
      console.error('Error checking if date is yesterday:', error);
      return false;
    }
  };

  /**
   * Get timezone information for debugging
   */
  const getTimezoneInfo = () => {
    const now = new Date();
    const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    return {
      userTimezone,
      currentTime: now.toISOString(),
      currentOffset: now.getTimezoneOffset(),
      isMobile
    };
  };

  return (
    <TimezoneContext.Provider value={{
      userTimezone,
      formatDate,
      formatTime,
      formatDateOnly,
      formatDateTime,
      calculateDurationMinutes,
      formatDuration,
      isToday,
      isYesterday,
      getTimezoneInfo
    }}>
      {children}
    </TimezoneContext.Provider>
  );
}

/**
 * Hook to use the timezone context
 */
export function useTimezone() {
  const context = useContext(TimezoneContext);
  if (context === undefined) {
    throw new Error('useTimezone must be used within a TimezoneProvider');
  }
  return context;
}
