import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/src/components/ui/input';
import { cn } from '@/src/lib/utils';
import styles from './full-log-timeline.styles';

interface FullLogSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

/**
 * FullLogSearchBar Component
 * 
 * Displays a search bar for filtering activities in the full log timeline
 */
const FullLogSearchBar: React.FC<FullLogSearchBarProps> = ({
  searchQuery,
  onSearchChange,
}) => {
  return (
    <div className="border-t border-gray-200 bg-gray-100 px-6 py-3 full-log-timeline-search-bar">
      <div className="w-full flex items-center bg-white rounded-xl px-3 py-2 full-log-timeline-search-container">
        <Search className="h-4 w-4 text-gray-500 mr-2" />
        <Input 
          type="text"
          placeholder="Search activities..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="border-0 bg-transparent focus:ring-0 focus:border-0 h-8 px-0 py-1 full-log-timeline-search-input"
        />
      </div>
    </div>
  );
};

export default FullLogSearchBar;
