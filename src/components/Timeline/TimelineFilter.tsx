import { Button } from '@/src/components/ui/button';
import {
  Moon,
  Icon,
  Edit,
  ChevronLeft,
  ChevronRight,
  Bath,
} from 'lucide-react';
import { diaper, bottleBaby } from '@lucide/lab';
import { FilterType, TimelineFilterProps } from './types';

const TimelineFilter = ({
  selectedDate,
  activeFilter,
  onDateChange,
  onDateSelection,
  onFilterChange,
}: TimelineFilterProps) => {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onDateChange(-1)}
          className="h-7 w-7 bg-gray-100 hover:bg-gray-200"
          aria-label="Previous day"
        >
          <ChevronLeft className="h-3 w-3 text-teal-700" />
        </Button>
        
        <input
          type="date"
          className="h-7 px-2 rounded-md border border-gray-200 text-xs bg-gray-100 hover:bg-gray-200 text-teal-700"
          value={new Date(selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000).toISOString().split('T')[0]}
          onChange={(e) => {
            // Create date in local timezone
            const localDate = new Date(e.target.value);
            // Adjust for timezone offset to keep the date consistent
            const newDate = new Date(localDate.getTime() + localDate.getTimezoneOffset() * 60000);
            newDate.setHours(0, 0, 0, 0);
            onDateSelection(newDate);
          }}
        />
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => onDateChange(1)}
          className="h-7 w-7 bg-gray-100 hover:bg-gray-200"
          aria-label="Next day"
        >
          <ChevronRight className="h-3 w-3 text-teal-700" />
        </Button>
      </div>
      
      <div className="flex gap-1">
        <FilterButton 
          type="sleep" 
          activeFilter={activeFilter} 
          onFilterChange={onFilterChange}
          icon={<Moon className="h-4 w-4" />}
        />
        <FilterButton 
          type="feed" 
          activeFilter={activeFilter} 
          onFilterChange={onFilterChange}
          icon={<Icon iconNode={bottleBaby} className="h-4 w-4" />}
        />
        <FilterButton 
          type="diaper" 
          activeFilter={activeFilter} 
          onFilterChange={onFilterChange}
          icon={<Icon iconNode={diaper} className="h-4 w-4" />}
        />
        <FilterButton 
          type="bath" 
          activeFilter={activeFilter} 
          onFilterChange={onFilterChange}
          icon={<Bath className="h-4 w-4" />}
        />
        <FilterButton 
          type="note" 
          activeFilter={activeFilter} 
          onFilterChange={onFilterChange}
          icon={<Edit className="h-4 w-4" />}
        />
      </div>
    </div>
  );
};

interface FilterButtonProps {
  type: FilterType;
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  icon: React.ReactNode;
}

const FilterButton = ({ type, activeFilter, onFilterChange, icon }: FilterButtonProps) => {
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => onFilterChange(activeFilter === type ? null : type)}
      className={`h-8 w-8 ${
        activeFilter === type
          ? 'border-2 border-blue-500 bg-white'
          : 'bg-gray-100 hover:bg-gray-200'
      }`}
    >
      {icon}
    </Button>
  );
};

export default TimelineFilter;
