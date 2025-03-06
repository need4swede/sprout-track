import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { cn } from "@/src/lib/utils";

import { Icon } from 'lucide-react';
import { diaper, bottleBaby } from '@lucide/lab';

interface StatusBubbleProps {
  status: 'sleeping' | 'awake' | 'feed' | 'diaper';
  durationInMinutes: number;
  warningTime?: string; // Format: "hh:mm"
  className?: string;
}

export function StatusBubble({ status, durationInMinutes, warningTime, className }: StatusBubbleProps) {
  // Convert minutes to HH:MM format
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}:${mins.toString().padStart(2, '0')}`;
  };

  // Convert warning time (hh:mm) to minutes
  const getWarningMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Check if duration exceeds warning time
  const isWarning = warningTime && durationInMinutes >= getWarningMinutes(warningTime);

  // Get status-specific styles and icon
  const getStatusStyles = () => {
    switch (status) {
      case 'sleeping':
        return {
          bgColor: "bg-gray-700/90 text-white",
          icon: <Moon className="h-3.5 w-3.5" />
        };
      case 'awake':
        return {
          bgColor: "bg-sky-100 text-sky-900",
          icon: <Sun className="h-3.5 w-3.5 text-amber-500" />
        };
      case 'feed':
        return {
          bgColor: isWarning ? "bg-red-500/90 text-white" : "bg-green-500/90 text-white",
          icon: <Icon iconNode={bottleBaby} className="h-3.5 w-3.5" />
        };
      case 'diaper':
        return {
          bgColor: isWarning ? "bg-red-500/90 text-white" : "bg-green-500/90 text-white",
          icon: <Icon iconNode={diaper} className="h-3.5 w-3.5" />
        };
      default:
        return {
          bgColor: "bg-gray-500/90 text-white",
          icon: null
        };
    }
  };

  const { bgColor, icon } = getStatusStyles();

  return (
    <div
      className={cn(
        "absolute top-0 right-0 px-3 py-1 rounded-bl-2xl flex items-center gap-1.5 text-sm font-medium z-50",
        bgColor,
        className
      )}
    >
      {icon}
      <span>{formatDuration(durationInMinutes)}</span>
    </div>
  );
}
