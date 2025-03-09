import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Sun, Icon, Moon } from 'lucide-react';
import { diaper, bottleBaby } from '@lucide/lab';
import { ActivityType } from '../ui/activity-tile/activity-tile.types';
import { Card } from '@/src/components/ui/card';

interface DailyStatsProps {
  activities: ActivityType[];
  date: Date;
}

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const StatItem: React.FC<StatItemProps> = ({ icon, label, value }) => (
  <div className="flex items-center gap-2">
    <div className="flex-shrink-0 p-2 rounded-xl bg-gray-100">
      {icon}
    </div>
    <div>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  </div>
);

export const DailyStats: React.FC<DailyStatsProps> = ({ activities, date }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Helper function to format minutes into hours and minutes
  const formatMinutes = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Calculate time awake and asleep
  const { awakeTime, sleepTime, totalConsumed, diaperChanges, poopCount } = useMemo(() => {
    // Set start and end of the selected day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    // For calculating sleep time
    let totalSleepMinutes = 0;
    
    // For calculating consumed amounts
    const consumedAmounts: Record<string, number> = {};
    
    // For counting diapers and poops
    let diaperCount = 0;
    let poopCount = 0;

    // Process each activity
    activities.forEach(activity => {
      // Sleep activities
      if ('duration' in activity && 'startTime' in activity) {
        const startTime = new Date(activity.startTime);
        const endTime = 'endTime' in activity && activity.endTime ? new Date(activity.endTime) : null;
        
        if (endTime) {
          // Calculate overlap with the current day
          const overlapStart = Math.max(startTime.getTime(), startOfDay.getTime());
          const overlapEnd = Math.min(endTime.getTime(), endOfDay.getTime());
          
          // If there is an overlap, add to sleep time
          if (overlapEnd > overlapStart) {
            const overlapMinutes = Math.floor((overlapEnd - overlapStart) / (1000 * 60));
            totalSleepMinutes += overlapMinutes;
          }
        }
      }
      
      // Feed activities
      if ('amount' in activity && activity.amount) {
        const time = new Date(activity.time);
        
        // Only count feeds that occurred on the selected day
        if (time >= startOfDay && time <= endOfDay) {
          const unit = activity.unitAbbr || 'oz';
          if (!consumedAmounts[unit]) {
            consumedAmounts[unit] = 0;
          }
          consumedAmounts[unit] += activity.amount;
        }
      }
      
      // Diaper activities
      if ('condition' in activity) {
        const time = new Date(activity.time);
        
        // Only count diapers that occurred on the selected day
        if (time >= startOfDay && time <= endOfDay) {
          diaperCount++;
          
          // Count poops (dirty or wet+dirty)
          if (activity.type === 'DIRTY' || activity.type === 'BOTH') {
            poopCount++;
          }
        }
      }
    });

    // Calculate awake time (total day minutes minus sleep minutes)
    const totalDayMinutes = 24 * 60; // 24 hours in minutes
    const awakeMinutes = totalDayMinutes - totalSleepMinutes;
    
    // Format consumed amounts
    const formattedConsumed = Object.entries(consumedAmounts)
      .map(([unit, amount]) => `${amount} ${unit}`)
      .join(', ');
    
    return {
      awakeTime: formatMinutes(awakeMinutes),
      sleepTime: formatMinutes(totalSleepMinutes),
      totalConsumed: formattedConsumed || 'None',
      diaperChanges: diaperCount.toString(),
      poopCount: poopCount.toString()
    };
  }, [activities, date]);

  return (
    <Card className="mb-2 overflow-hidden">
      <div 
        className="flex items-center justify-between px-6 py-3 bg-gray-50 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-sm font-medium">Daily Stats</h3>
        <button className="text-gray-500 hover:text-gray-700">
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>
      
      {isExpanded && (
        <div className="grid grid-cols-2 gap-4 p-4 md:grid-cols-5">
          <StatItem 
            icon={<Sun className="h-4 w-4 text-amber-500" />} 
            label="Awake Time" 
            value={awakeTime} 
          />
          <StatItem 
            icon={<Moon className="h-4 w-4 text-gray-700" />} 
            label="Sleep Time" 
            value={sleepTime} 
          />
          <StatItem 
            icon={<Icon iconNode={bottleBaby} className="h-4 w-4 text-sky-600" />} 
            label="Consumed" 
            value={totalConsumed} 
          />
          <StatItem 
            icon={<Icon iconNode={diaper} className="h-4 w-4 text-teal-600" />} 
            label="Diaper Changes" 
            value={diaperChanges} 
          />
          <StatItem 
            icon={<Icon iconNode={diaper} className="h-4 w-4 text-amber-700" />} 
            label="Poops" 
            value={poopCount} 
          />
        </div>
      )}
    </Card>
  );
};

export default DailyStats;
