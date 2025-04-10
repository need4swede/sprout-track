import React, { useState } from 'react';
import { Button } from '@/src/components/ui/button';
import {
  Moon,
  Icon,
  Edit,
  ChevronLeft,
  ChevronRight,
  Bath,
  ChevronDown,
  Calendar as CalendarIcon,
  LampWallDown,
  Trophy,
  Ruler,
} from 'lucide-react';
import { diaper, bottleBaby } from '@lucide/lab';
import { FilterType, FullLogFilterProps } from './full-log-timeline.types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/src/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/src/components/ui/popover';
import { Calendar } from '@/src/components/ui/calendar';
import { cn } from '@/src/lib/utils';

/**
 * FullLogFilter Component
 * 
 * Displays filter controls for the full log timeline, including:
 * - Date range selection
 * - Quick date range filters
 * - Activity type filtering
 */
const FullLogFilter: React.FC<FullLogFilterProps> = ({
  activeFilter,
  onFilterChange,
  startDate,
  endDate,
  onDateRangeChange,
  onQuickFilter,
}) => {
  // State for popover open/close
  const [calendarOpen, setCalendarOpen] = useState(false);
  
  // Define filter types and their icons
  const filterOptions = [
    { type: 'sleep', icon: <Moon className="h-4 w-4" />, label: 'Sleep' },
    { type: 'feed', icon: <Icon iconNode={bottleBaby} className="h-4 w-4" />, label: 'Feed' },
    { type: 'diaper', icon: <Icon iconNode={diaper} className="h-4 w-4" />, label: 'Diaper' },
    { type: 'bath', icon: <Bath className="h-4 w-4" />, label: 'Bath' },
    { type: 'note', icon: <Edit className="h-4 w-4" />, label: 'Note' },
    { type: 'pump', icon: <LampWallDown className="h-4 w-4" />, label: 'Pump' },
    { type: 'milestone', icon: <Trophy className="h-4 w-4" />, label: 'Milestone' },
    { type: 'measurement', icon: <Ruler className="h-4 w-4" />, label: 'Measurement' },
  ] as const;

  // Format date range for display
  const formatDateRange = () => {
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', { 
        month: '2-digit', 
        day: '2-digit',
        year: 'numeric'
      });
    };
    
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  return (
    <div className="flex justify-between px-6 py-3 items-center text-sm font-medium">
      <div className="flex items-center">
        {/* Date Range Selector */}
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm"
              className="h-7 px-2 text-sm font-medium text-white hover:bg-transparent hover:text-white/90 mr-4"
            >
              {formatDateRange()}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-auto" align="start">
            <Calendar
              mode="range"
              rangeFrom={startDate}
              rangeTo={endDate}
              onRangeChange={(from, to) => {
                if (from && to) {
                  // Set start date to beginning of day
                  const newStartDate = new Date(from);
                  newStartDate.setHours(0, 0, 0, 0);
                  
                  // Set end date to end of day
                  const newEndDate = new Date(to);
                  newEndDate.setHours(23, 59, 59, 999);
                  
                  onDateRangeChange(newStartDate, newEndDate);
                  // Close the popover after selection with a delay
                  setTimeout(() => {
                    setCalendarOpen(false);
                  }, 500);
                }
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        
        {/* Quick Filter Buttons */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onQuickFilter(2)}
          className="h-7 px-2 text-white hover:bg-transparent hover:text-white/90 mr-2"
        >
          2 Days
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onQuickFilter(7)}
          className="h-7 px-2 text-white hover:bg-transparent hover:text-white/90 mr-2"
        >
          7 Days
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onQuickFilter(30)}
          className="h-7 px-2 text-white hover:bg-transparent hover:text-white/90"
        >
          30 Days
        </Button>
      </div>
      
      {/* Filters Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-1 h-7 text-sm font-medium text-white hover:bg-transparent hover:text-white/90 p-0"
          >
            Filters <ChevronDown className="h-4 w-4 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {filterOptions.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.type}
              checked={activeFilter === option.type}
              onCheckedChange={() => onFilterChange(activeFilter === option.type ? null : option.type as FilterType)}
              className="flex items-center gap-2"
            >
              <span className="flex items-center justify-center w-6">{option.icon}</span>
              <span>{option.label}</span>
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default FullLogFilter;
