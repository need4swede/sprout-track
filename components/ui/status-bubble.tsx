import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { cn } from "@/lib/utils";

interface StatusBubbleProps {
  status: 'sleeping' | 'awake';
  durationInMinutes: number;
  className?: string;
}

export function StatusBubble({ status, durationInMinutes, className }: StatusBubbleProps) {
  // Convert minutes to HH:MM format
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}:${mins.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className={cn(
        "absolute -top-2 -right-2 px-3 py-1 rounded-full flex items-center gap-1.5 text-sm font-medium z-50",
        status === 'sleeping' 
          ? "bg-gray-700/90 text-white" 
          : "bg-sky-100 text-sky-900",
        className
      )}
    >
      {status === 'sleeping' ? (
        <Moon className="h-3.5 w-3.5" />
      ) : (
        <Sun className="h-3.5 w-3.5 text-amber-500" />
      )}
      <span>{formatDuration(durationInMinutes)}</span>
    </div>
  );
}
