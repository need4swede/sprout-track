'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Position, DebugSessionTimerProps } from './debug-session-timer.types';
import {
  debugTimerContainer,
  debugTimerHeader,
  debugTimerCloseButton,
  debugTimerContent,
  debugTimerRow,
  debugTimerLabel,
  debugTimerValue
} from './debug-session-timer.styles';

/**
 * DebugSessionTimer Component
 * 
 * A draggable debug timer that displays JWT token expiration and user idle time.
 * This component is only visible in development mode and helps developers
 * monitor authentication state and user activity.
 * 
 * @example
 * ```tsx
 * <DebugSessionTimer />
 * ```
 */
const DebugSessionTimer: React.FC<DebugSessionTimerProps> = () => {
  // State for visibility and settings
  const [isVisible, setIsVisible] = useState(true);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // State for token expiration and idle time
  const [tokenExpiration, setTokenExpiration] = useState<Date | null>(null);
  const [idleTime, setIdleTime] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState<Position>({ x: 20, y: 20 });
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  
  // Refs
  const timerRef = useRef<HTMLDivElement>(null);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  /**
   * Formats the time remaining until token expiration
   * 
   * @param date - The expiration date of the token
   * @returns A formatted string in HH:MM:SS format
   */
  const formatTimeRemaining = (date: Date | null): string => {
    if (!date) return 'Unknown';
    
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  /**
   * Formats the idle time
   * 
   * @param seconds - The number of seconds of idle time
   * @returns A formatted string in MM:SS format
   */
  const formatIdleTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  /**
   * Extracts the token expiration date from the JWT token in localStorage
   * 
   * @returns The expiration date or null if not found
   */
  const getTokenExpiration = (): Date | null => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return null;
      
      // JWT tokens are in format: header.payload.signature
      // We need the payload part (index 1)
      const payload = token.split('.')[1];
      // The payload is base64 encoded, so we need to decode it
      const decodedPayload = JSON.parse(atob(payload));
      
      // exp is in seconds since epoch
      if (decodedPayload.exp) {
        return new Date(decodedPayload.exp * 1000);
      }
      
      return null;
    } catch (error) {
      console.error('Error parsing JWT token:', error);
      return null;
    }
  };

  /**
   * Resets the idle time counter
   */
  const resetIdleTime = () => {
    lastActivityRef.current = Date.now();
    setIdleTime(0);
  };

  /**
   * Handles mouse down events for dragging
   * 
   * @param e - The mouse event
   */
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('drag-handle')) {
      setIsDragging(true);
      
      // Calculate the offset from the mouse position to the top-left corner of the element
      if (timerRef.current) {
        const rect = timerRef.current.getBoundingClientRect();
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    }
  };

  /**
   * Handles mouse move events for dragging
   * 
   * @param e - The mouse event
   */
  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && timerRef.current) {
      // Calculate new position based on mouse position and drag offset
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // Ensure the element stays within the viewport
      const rect = timerRef.current.getBoundingClientRect();
      const maxX = window.innerWidth - rect.width;
      const maxY = window.innerHeight - rect.height;
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    }
  };

  /**
   * Handles mouse up events to stop dragging
   */
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  // Fetch settings to check if debug timer is enabled
  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          // Only enable if explicitly enabled in settings
          setIsEnabled(!!data.data.enableDebugTimer);
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      // Default to disabled if there's an error
      setIsEnabled(false);
    }
    setIsInitialized(true);
  };
  
  // Effect for fetching settings
  useEffect(() => {
    fetchSettings();
  }, []);
  
  // Initialize and set up event listeners
  useEffect(() => {
    // If not initialized yet or not enabled, don't set up listeners
    if (!isInitialized || !isEnabled) {
      return;
    }

    // Get initial token expiration
    setTokenExpiration(getTokenExpiration());

    // Set up interval to update token expiration and idle time
    const tokenInterval = setInterval(() => {
      setTokenExpiration(getTokenExpiration());
      
      // Update idle time
      const now = Date.now();
      const idleSeconds = Math.floor((now - lastActivityRef.current) / 1000);
      setIdleTime(idleSeconds);
    }, 1000);

    // Set up event listeners for user activity
    const activityEvents = ['mousedown', 'keydown', 'mousemove', 'touchstart'];
    
    const handleUserActivity = () => {
      resetIdleTime();
    };
    
    activityEvents.forEach(event => {
      window.addEventListener(event, handleUserActivity);
    });

    // Set up event listeners for dragging
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // Position the timer in the bottom right corner initially
    if (typeof window !== 'undefined') {
      setPosition({
        x: window.innerWidth - 220,
        y: window.innerHeight - 120
      });
    }

    // Clean up
    return () => {
      clearInterval(tokenInterval);
      
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleUserActivity);
      });
      
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      
      if (idleTimerRef.current) {
        clearInterval(idleTimerRef.current);
      }
    };
  }, [isInitialized, isEnabled]);

  // Don't render anything if not visible, not initialized, or not enabled
  if (!isVisible || !isInitialized || !isEnabled) {
    return null;
  }

  return (
    <div 
      ref={timerRef}
      className={debugTimerContainer(isDragging, position.x, position.y)}
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`
      }}
      onMouseDown={handleMouseDown}
    >
      <div className={debugTimerHeader()}>
        <div className="drag-handle">Debug Session Timer</div>
        <button 
          className={debugTimerCloseButton()} 
          onClick={() => setIsVisible(false)}
          aria-label="Close debug timer"
        >
          <X size={16} />
        </button>
      </div>
      <div className={debugTimerContent()}>
        <div className={debugTimerRow()}>
          <span className={debugTimerLabel()}>JWT Expires:</span>
          <span className={debugTimerValue()}>{formatTimeRemaining(tokenExpiration)}</span>
        </div>
        <div className={debugTimerRow(true)}>
          <span className={debugTimerLabel()}>Idle Time:</span>
          <span className={debugTimerValue()}>{formatIdleTime(idleTime)}</span>
        </div>
      </div>
    </div>
  );
};

export { DebugSessionTimer };
