'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/src/lib/utils';
import { TimeEntryProps } from './time-entry.types';
import { timeEntryStyles as styles } from './time-entry.styles';
import './time-entry.css';

/**
 * TimeEntry Component
 * 
 * A clock wheel interface for time selection with an intuitive UI.
 * 
 * @param value - The currently selected time
 * @param onChange - Callback function when time changes
 * @param className - Optional class name for additional styling
 * @param disabled - Whether the component is disabled
 * @param minTime - Optional minimum time allowed
 * @param maxTime - Optional maximum time allowed
 */
export function TimeEntry({
  value,
  onChange,
  className,
  disabled = false,
  minTime,
  maxTime,
}: TimeEntryProps) {
  // Extract initial time values
  const getInitialValues = () => {
    // Ensure value is a valid Date object
    const date = value instanceof Date && !isNaN(value.getTime()) 
      ? value 
      : new Date();
    
    const hours = date.getHours();
    const minutes = date.getMinutes();
    
    return {
      hours: hours > 12 ? hours - 12 : hours === 0 ? 12 : hours,
      minutes,
      isPM: hours >= 12,
      mode: 'hours' as 'hours' | 'minutes',
    };
  };
  
  const [state, setState] = useState(getInitialValues);
  const clockFaceRef = useRef<HTMLDivElement>(null);
  
  // Update state when value prop changes
  useEffect(() => {
    setState(getInitialValues());
   }, [value]);
   
   // Check if a time is valid based on min/max constraints
  const isTimeValid = useCallback((date: Date): boolean => {
    if (minTime && date < minTime) return false;
    if (maxTime && date > maxTime) return false;
    return true;
  }, [minTime, maxTime]);
  
   // Handle hour selection
   const handleHourSelect = (hour: number) => {
     if (disabled) return;
 
     const newState = {
       ...state,
       hours: hour,
       mode: 'minutes' as 'hours' | 'minutes',
     };
 
     // Calculate new date based on the *intended* state
     const baseDate = value instanceof Date && !isNaN(value.getTime()) ? new Date(value) : new Date();
     const newHours24 = newState.isPM
       ? (newState.hours === 12 ? 12 : newState.hours + 12)
       : (newState.hours === 12 ? 0 : newState.hours);
     baseDate.setHours(newHours24);
     baseDate.setMinutes(newState.minutes); // Use existing minutes from newState
     baseDate.setSeconds(0);
     baseDate.setMilliseconds(0);
 
     // Update state *after* calculating the date
     setState(newState);
 
     if (isTimeValid(baseDate)) {
       onChange(baseDate);
     }
   };
 
   // Handle minute selection
   const handleMinuteSelect = (minute: number) => {
     if (disabled) return;
 
     const newState = {
       ...state,
       minutes: minute,
     };
 
     // Calculate new date based on the *intended* state
     const baseDate = value instanceof Date && !isNaN(value.getTime()) ? new Date(value) : new Date();
     const newHours24 = newState.isPM
       ? (newState.hours === 12 ? 12 : newState.hours + 12)
       : (newState.hours === 12 ? 0 : newState.hours); // Use existing hours from newState
     baseDate.setHours(newHours24);
     baseDate.setMinutes(newState.minutes);
     baseDate.setSeconds(0);
     baseDate.setMilliseconds(0);
 
     // Update state *after* calculating the date
     setState(newState);
 
     if (isTimeValid(baseDate)) {
       onChange(baseDate);
     }
   };
 
   // Handle AM/PM toggle
   const handlePeriodToggle = (isPM: boolean) => {
     if (disabled) return;
 
     const newState = {
       ...state,
       isPM: isPM,
     };
 
     // Calculate new date based on the *intended* state
     const baseDate = value instanceof Date && !isNaN(value.getTime()) ? new Date(value) : new Date();
     const newHours24 = newState.isPM
       ? (newState.hours === 12 ? 12 : newState.hours + 12)
       : (newState.hours === 12 ? 0 : newState.hours);
     baseDate.setHours(newHours24);
     baseDate.setMinutes(newState.minutes); // Use existing minutes from newState
     baseDate.setSeconds(0);
     baseDate.setMilliseconds(0);
 
     // Update state *after* calculating the date
     setState(newState);
 
     if (isTimeValid(baseDate)) {
       onChange(baseDate);
     }
   };
 
   // Handle click on the clock face
   const handleClockClick = (e: React.MouseEvent<HTMLDivElement>) => {
     if (disabled || !clockFaceRef.current) return;
 
     const rect = clockFaceRef.current.getBoundingClientRect();
     const centerX = rect.left + rect.width / 2;
     const centerY = rect.top + rect.height / 2;
     const x = e.clientX - centerX;
     const y = e.clientY - centerY;
     let angle = Math.atan2(y, x) * (180 / Math.PI) + 90;
     if (angle < 0) angle += 360;
 
     const baseDate = value instanceof Date && !isNaN(value.getTime()) ? new Date(value) : new Date();
     let newState = { ...state };
     let newHours24 = 0;
 
     if (state.mode === 'hours') {
       let hour = Math.round(angle / 30);
       if (hour === 0 || hour > 12) hour = 12;
       newState = { ...state, hours: hour, mode: 'minutes' };
       newHours24 = newState.isPM ? (hour === 12 ? 12 : hour + 12) : (hour === 12 ? 0 : hour);
       baseDate.setHours(newHours24);
       baseDate.setMinutes(newState.minutes); // Use existing minutes from newState
     } else {
       const minute = Math.round(angle / 6) % 60;
       newState = { ...state, minutes: minute };
       newHours24 = newState.isPM ? (newState.hours === 12 ? 12 : newState.hours + 12) : (newState.hours === 12 ? 0 : newState.hours); // Use existing hours from newState
       baseDate.setHours(newHours24);
       baseDate.setMinutes(minute);
     }
 
     baseDate.setSeconds(0);
     baseDate.setMilliseconds(0);
 
     // Update state *after* calculating the date
     setState(newState);
 
     if (isTimeValid(baseDate)) {
       onChange(baseDate); // Call onChange with the calculated date
     }
   };
 
   // Calculate hand angle for CSS rotation (0deg = 3 o'clock)
   const getHandAngle = () => {
     let clockAngle = 0;
     // Use hour value directly, treating 12 as 0 for angle calculation
     const hourValue = state.hours === 12 ? 0 : state.hours; 
     
     if (state.mode === 'hours') {
       // Angle relative to 12 o'clock (0 degrees up)
       clockAngle = hourValue * 30; 
     } else {
       // Angle relative to 12 o'clock (0 degrees up)
       clockAngle = state.minutes * 6;
     }
     // CSS rotation starts with 0 degrees pointing right (3 o'clock).
     // Our clockAngle starts with 0 degrees pointing up (12 o'clock).
     // To align, we need to subtract 90 degrees from the clockAngle.
     const cssAngle = clockAngle - 90; 
     return cssAngle;
   };
  
  // Calculate hand length
  const getHandLength = () => {
    return state.mode === 'hours' ? 80 : 100;
  };
  
  // Generate clock markers based on mode (hours or minutes)
  const renderClockMarkers = () => {
    if (state.mode === 'hours') {
      // Generate hour markers (1-12)
      const hours = Array.from({ length: 12 }, (_, i) => i + 1);
      return hours.map(hour => {
        const angle = ((hour % 12) * 30) - 90;
        const isSelected = hour === state.hours;
        
        // Calculate position on the clock face
        const radius = 100; // Distance from center (in pixels)
        const x = Math.cos(angle * (Math.PI / 180)) * radius;
        const y = Math.sin(angle * (Math.PI / 180)) * radius;
        
        return (
          <div
            key={hour}
            className={cn(
              styles.hourMarker,
              isSelected && styles.hourMarkerSelected,
              'time-entry-hour-marker',
              isSelected && 'time-entry-hour-marker-selected'
            )}
            style={{
              transform: `translate(${x}px, ${y}px)`,
            }}
            onClick={(e) => { e.stopPropagation(); handleHourSelect(hour); }}
          >
            {hour}
          </div>
        );
      });
    } else {
      // Generate minute markers (in 5-minute increments)
      const minuteMarkers = [];
      
      // Add major markers (0, 5, 10, ..., 55)
      for (let i = 0; i < 12; i++) {
        const minute = i * 5;
        const angle = (minute * 6) - 90; // 6 degrees per minute
        // Select if the current minute is the closest 5-minute interval
        const isSelected = Math.round(state.minutes / 5) * 5 % 60 === minute; 
        
        // Calculate position on the clock face
        const radius = 100; // Distance from center (in pixels)
        const x = Math.cos(angle * (Math.PI / 180)) * radius;
        const y = Math.sin(angle * (Math.PI / 180)) * radius;
        
        minuteMarkers.push(
          <div
            key={minute}
            className={cn(
              styles.minuteMarker,
              isSelected && styles.minuteMarkerSelected,
              'time-entry-minute-marker',
              isSelected && 'time-entry-minute-marker-selected'
            )}
            style={{
              transform: `translate(${x}px, ${y}px)`,
            }}
            onClick={(e) => { e.stopPropagation(); handleMinuteSelect(minute); }}
          >
            {/* Display '00' for the 0 minute marker */}
            {minute === 0 ? '00' : minute} 
          </div>
        );
      }
      
      // Removed minor tick markers as per requirement
      
      return minuteMarkers;
    }
  };
  
  return (
    <div 
      className={cn(
        styles.container,
        'time-entry-container',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {/* Time display header */}
      <div className={cn(styles.header, 'time-entry-header')}>
        <div className={cn(styles.timeDisplay, 'time-entry-time-display')}>
          {/* Clickable Hour */}
          <span 
            className={cn(
              "cursor-pointer px-1 rounded", 
              state.mode === 'hours' ? "bg-white/20 font-semibold" : "hover:bg-white/10"
            )}
            onClick={() => setState(prev => ({ ...prev, mode: 'hours' }))}
          >
            {state.hours}
          </span>
          :
          {/* Clickable Minute */}
          <span 
            className={cn(
              "cursor-pointer px-1 rounded", 
              state.mode === 'minutes' ? "bg-white/20 font-semibold" : "hover:bg-white/10"
            )}
            onClick={() => setState(prev => ({ ...prev, mode: 'minutes' }))}
          >
            {state.minutes.toString().padStart(2, '0')}
          </span>
        </div>
        <div className={cn(styles.amPmDisplay, 'time-entry-ampm-display')}>
          <div 
            className={cn(
              styles.amPmButton, 
              !state.isPM && styles.amPmButtonSelected,
              'time-entry-ampm-button',
              !state.isPM && 'time-entry-ampm-button-selected'
            )}
            onClick={() => handlePeriodToggle(false)}
          >
            AM
          </div>
          <div 
            className={cn(
              styles.amPmButton, 
              state.isPM && styles.amPmButtonSelected,
              'time-entry-ampm-button',
              state.isPM && 'time-entry-ampm-button-selected'
            )}
            onClick={() => handlePeriodToggle(true)}
          >
            PM
          </div>
        </div>
      </div>
      
      {/* Clock face */}
      <div className={cn(styles.clockContainer, 'time-entry-clock-container')}>
        <div 
          ref={clockFaceRef}
          className={cn(styles.clockFace, 'time-entry-clock-face')}
          onClick={handleClockClick}
        >
          {/* Clock markers (hours or minutes) */}
          {renderClockMarkers()}
          
          {/* Clock hand */}
          <div 
             className={cn(styles.clockHand, 'time-entry-clock-hand')}
             style={{
               height: `${getHandLength()}px`, // Dynamic height based on mode
               transform: `translateX(-50%) rotate(${getHandAngle()}deg)`, // Use corrected angle calculation
               transformOrigin: 'top center', // Rotate around the top center
               position: 'absolute',
               top: '50%', // Position top edge at vertical center
               left: '50%', // Position left edge at horizontal center
               width: '2px', // Make hand slightly thicker for visibility
               // Use the background color defined in styles directly if possible, else fallback
               backgroundColor: styles.clockHand.includes('bg-emerald-600') ? '#059669' : '#10b981', // Example fallback logic, adjust as needed based on actual styles
             }}
           />
          
          {/* Center dot */}
          <div className={cn(styles.clockCenter, 'time-entry-clock-center')} />
        </div>
      </div>
      
      {/* No footer buttons as requested */}
    </div>
  );
}

export default TimeEntry;
