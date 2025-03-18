import React, { useEffect, useState } from 'react';
import { Moon, Sun, Icon } from 'lucide-react';
import { diaper, bottleBaby } from '@lucide/lab';
import { cn } from "@/src/lib/utils";
import { statusBubbleStyles as styles } from './status-bubble.styles';
import { StatusBubbleProps, StatusStyle } from './status-bubble.types';
import { useTimezone } from '@/app/context/timezone';

/**
 * Formats minutes into HH:MM format
 */
const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}:${mins.toString().padStart(2, '0')}`;
};

/**
 * Converts warning time (hh:mm) to minutes
 */
const getWarningMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * A component that displays the current status and duration in a stylized bubble
 */
export function StatusBubble({ 
  status, 
  durationInMinutes, 
  warningTime, 
  className,
  startTime // Add startTime prop
}: StatusBubbleProps & { startTime?: string }) {
  const { userTimezone } = useTimezone();
  const [calculatedDuration, setCalculatedDuration] = useState(durationInMinutes);
  
  // If startTime is provided, calculate duration based on current time in user's timezone
  useEffect(() => {
    if (startTime) {
      const updateDuration = () => {
        const start = new Date(startTime);
        const now = new Date();
        
        // Calculate duration in minutes
        const diffMs = now.getTime() - start.getTime();
        const diffMinutes = Math.floor(diffMs / 60000);
        
        setCalculatedDuration(diffMinutes);
      };
      
      // Update immediately
      updateDuration();
      
      // Then update every minute
      const interval = setInterval(updateDuration, 60000);
      return () => clearInterval(interval);
    }
  }, [startTime, userTimezone]);
  
  // Use calculated duration if available, otherwise use prop
  const displayDuration = startTime ? calculatedDuration : durationInMinutes;
  
  // Check if duration exceeds warning time
  const isWarning = warningTime && displayDuration >= getWarningMinutes(warningTime);

  // Get status-specific styles and icon
  const getStatusStyles = (): StatusStyle => {
    switch (status) {
      case 'sleeping':
        return {
          bgColor: styles.statusStyles.sleeping.bgColor,
          icon: <Moon className={styles.icon} />
        };
      case 'awake':
        return {
          bgColor: styles.statusStyles.awake.bgColor,
          icon: <Sun className={cn(styles.icon, styles.statusStyles.awake.iconColor)} />
        };
      case 'feed':
        return {
          bgColor: isWarning ? styles.statusStyles.feed.warning : styles.statusStyles.feed.normal,
          icon: <Icon iconNode={bottleBaby} className={styles.icon} />
        };
      case 'diaper':
        return {
          bgColor: isWarning ? styles.statusStyles.diaper.warning : styles.statusStyles.diaper.normal,
          icon: <Icon iconNode={diaper} className={styles.icon} />
        };
      default:
        return {
          bgColor: styles.statusStyles.default.bgColor,
          icon: null
        };
    }
  };

  const { bgColor, icon } = getStatusStyles();

  return (
    <div
      className={cn(
        styles.base,
        bgColor,
        className
      )}
    >
      {icon}
      <span>{formatDuration(displayDuration)}</span>
    </div>
  );
}
