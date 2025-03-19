'use client';

import React, { useState, useEffect } from 'react';
import { useTimezone } from '@/app/context/timezone';

export function TimezoneDebug() {
  const { getTimezoneInfo } = useTimezone();
  const [showDebug, setShowDebug] = useState(false);
  const [info, setInfo] = useState(getTimezoneInfo());
  const [isVisible, setIsVisible] = useState(true);
  
  // Initialize and check if we're in development mode
  useEffect(() => {
    // Only show in development mode
    if (process.env.NODE_ENV !== 'development') {
      setIsVisible(false);
    }
  }, []);
  
  const refreshInfo = () => {
    setInfo(getTimezoneInfo());
  };
  
  // Don't render anything if not visible or not in development mode
  if (!isVisible || process.env.NODE_ENV !== 'development') {
    return null;
  }
  
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
          <span className="font-semibold">Current Time:</span> {info.currentTime}
        </div>
        <div>
          <span className="font-semibold">Timezone Offset:</span> {info.currentOffset} minutes
        </div>
        <div>
          <span className="font-semibold">Is Mobile:</span> {info.isMobile ? 'Yes' : 'No'}
        </div>
        <div>
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
