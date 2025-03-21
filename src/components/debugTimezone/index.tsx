'use client';

import React, { useState, useEffect } from 'react';
import { useTimezone } from '@/app/context/timezone';

export function TimezoneDebug() {
  // Only render in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  const { userTimezone } = useTimezone();
  const [showDebug, setShowDebug] = useState(false);
  const [info, setInfo] = useState({
    userTimezone,
    serverTimezone: 'Loading...',
    currentTime: new Date().toISOString(),
    currentOffset: new Date().getTimezoneOffset(),
    isDST: false,
    formattedCurrentTime: '',
    isMobile: typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  });
  
  const fetchServerTimezone = async () => {
    try {
      // Use the new system-timezone endpoint that directly gets the system timezone
      const response = await fetch('/api/system-timezone');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.systemTimezone) {
          setInfo(prev => ({
            ...prev,
            serverTimezone: data.data.systemTimezone
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching server timezone:', error);
      setInfo(prev => ({
        ...prev,
        serverTimezone: 'Error fetching'
      }));
    }
  };
  
  // Check if the current date is in DST
  const isDaylightSavingTime = (timezone: string): boolean => {
    try {
      // Most reliable method: directly check if the timezone string includes "Daylight" or "Summer"
      const now = new Date();
      
      // Format the date with the timezone name
      const formatted = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        timeZoneName: 'long'
      }).format(now);
      
      // Check if the timezone name includes "Daylight" or "Summer"
      const isDST = formatted.includes('Daylight') || formatted.includes('Summer');
      
      // If that doesn't work, use the offset comparison method
      if (!isDST) {
        // Create dates in January and July
        const jan = new Date(now.getFullYear(), 0, 1);
        const jul = new Date(now.getFullYear(), 6, 1);
        
        // Get the timezone offsets
        const janOffset = getTimezoneOffset(jan, timezone);
        const julOffset = getTimezoneOffset(jul, timezone);
        
        // If the offsets are different, check which one matches the current offset
        if (janOffset !== julOffset) {
          const currentOffset = getTimezoneOffset(now, timezone);
          // In northern hemisphere, July is DST (smaller offset)
          // In southern hemisphere, January is DST
          const isDstOffset = currentOffset === Math.min(janOffset, julOffset);
          
          // For America/Denver specifically, we know DST is active from March to November
          if (timezone === 'America/Denver') {
            const month = now.getMonth(); // 0-11
            return month >= 2 && month <= 10; // March to November
          }
          
          return isDstOffset;
        }
      }
      
      return isDST;
    } catch (error) {
      console.error('Error checking DST:', error);
      
      // Hardcoded fallback for America/Denver
      if (timezone === 'America/Denver') {
        const now = new Date();
        const month = now.getMonth(); // 0-11
        return month >= 2 && month <= 10; // March to November
      }
      
      return false;
    }
  };
  
  // Get timezone offset in minutes for a specific date and timezone
  const getTimezoneOffset = (date: Date, timezone: string): number => {
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
        const now = new Date();
        const month = now.getMonth(); // 0-11
        return month >= 2 && month <= 10 ? -360 : -420; // -360 during DST (UTC-6), -420 otherwise (UTC-7)
      }
      
      return date.getTimezoneOffset();
    }
  };
  
  const formatDateInTimezone = (date: Date, timezone: string): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZone: timezone,
      timeZoneName: 'short'
    }).format(date);
  };
  
  const refreshInfo = () => {
    const now = new Date();
    const isDST = isDaylightSavingTime(userTimezone);
    const formattedTime = formatDateInTimezone(now, userTimezone);
    
    setInfo(prev => ({
      ...prev,
      userTimezone,
      currentTime: now.toISOString(),
      currentOffset: now.getTimezoneOffset(),
      isDST,
      formattedCurrentTime: formattedTime,
      isMobile: typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    }));
    fetchServerTimezone();
  };
  
  // Fetch server timezone when component mounts or when debug panel is opened
  useEffect(() => {
    if (showDebug) {
      fetchServerTimezone();
    }
  }, [showDebug]);
  
  if (!showDebug) {
    return (
      <button 
        onClick={() => setShowDebug(true)}
        className="fixed bottom-4 right-4 bg-gray-800 text-white p-2 rounded-full z-50 opacity-50 hover:opacity-100"
      >
        TZ
      </button>
    );
  }
  
  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg z-50 max-w-xs w-full text-xs">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Timezone Debug</h3>
        <button 
          onClick={() => setShowDebug(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          Close
        </button>
      </div>
      
      <div className="space-y-2">
        <div>
          <span className="font-semibold">User Timezone:</span> {info.userTimezone}
        </div>
        <div>
          <span className="font-semibold">Server Timezone:</span> {info.serverTimezone}
        </div>
        <div>
          <span className="font-semibold">Current Time (ISO):</span> {info.currentTime}
        </div>
        <div>
          <span className="font-semibold">Current Time (Formatted):</span> {info.formattedCurrentTime}
        </div>
        <div>
          <span className="font-semibold">Timezone Offset:</span> {info.currentOffset} minutes (UTC{info.currentOffset > 0 ? '-' : '+'}{Math.abs(info.currentOffset / 60)})
        </div>
        <div>
          <span className="font-semibold">Is DST Active:</span> {info.isDST ? 'Yes' : 'No'}
        </div>
        <div>
          <span className="font-semibold">Is Mobile:</span> {info.isMobile ? 'Yes' : 'No'}
        </div>
        <div className="text-xs overflow-hidden text-ellipsis">
          <span className="font-semibold">Browser Info:</span> {navigator.userAgent}
        </div>
        
        <div className="pt-2">
          <button 
            onClick={refreshInfo}
            className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
          >
            Refresh Info
          </button>
        </div>
      </div>
    </div>
  );
}
