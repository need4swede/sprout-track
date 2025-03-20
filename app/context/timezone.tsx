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
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return '';
      
      return date.toLocaleString('en-US', {
        ...formatOptions,
        timeZone: userTimezone
      });
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
      
      // Calculate duration in minutes
      const diffMs = endDate.getTime() - startDate.getTime();
      return Math.floor(diffMs / 60000);
    } catch (error) {
      console.error('Error calculating duration:', error);
      return 0;
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
      
      // Compare year, month, and day in the user's timezone
      return (
        formatDate(isoString, { year: 'numeric', month: 'numeric', day: 'numeric' }) ===
        formatDate(today.toISOString(), { year: 'numeric', month: 'numeric', day: 'numeric' })
      );
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
      
      // Compare year, month, and day in the user's timezone
      return (
        formatDate(isoString, { year: 'numeric', month: 'numeric', day: 'numeric' }) ===
        formatDate(yesterday.toISOString(), { year: 'numeric', month: 'numeric', day: 'numeric' })
      );
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
