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
    const january = new Date(new Date().getFullYear(), 0, 1);
    const july = new Date(new Date().getFullYear(), 6, 1);
    
    const januaryOffset = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'short'
    }).format(january).split(' ')[1];
    
    const julyOffset = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'short'
    }).format(july).split(' ')[1];
    
    // If the offsets are different, then the timezone has DST
    // Check if current offset matches the July offset (summer)
    if (januaryOffset !== julyOffset) {
      const now = new Date();
      const currentOffset = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        timeZoneName: 'short'
      }).format(now).split(' ')[1];
      
      return currentOffset === julyOffset;
    }
    
    return false;
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
