import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Sun, Icon, Moon, Droplet, StickyNote, Utensils } from 'lucide-react';
import { diaper, bottleBaby } from '@lucide/lab';
import { ActivityType } from '../ui/activity-tile/activity-tile.types';
import { Card } from '@/src/components/ui/card';

interface DailyStatsProps {
  activities: ActivityType[];
  date: Date;
  isLoading?: boolean;
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

export const DailyStats: React.FC<DailyStatsProps> = ({ activities, date, isLoading = false }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Helper function to format minutes into hours and minutes
  const formatMinutes = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Calculate time awake and asleep
  const { awakeTime, sleepTime, totalConsumed, diaperChanges, poopCount, leftBreastTime, rightBreastTime, noteCount, solidsConsumed } = useMemo(() => {
    // Set start and end of the selected day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    // For calculating sleep time
    let totalSleepMinutes = 0;
    
    // For calculating consumed amounts
    const consumedAmounts: Record<string, number> = {};
    
    // For calculating solids consumed amounts
    const solidsAmounts: Record<string, number> = {};
    
    // For counting diapers and poops
    let diaperCount = 0;
    let poopCount = 0;
    
    // For tracking breast feeding per side
    let leftBreastSeconds = 0;
    let rightBreastSeconds = 0;
    
    // For counting notes
    let noteCount = 0;

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
          
          // Separate tracking for solids vs bottle feeds
          if ('type' in activity && activity.type === 'SOLIDS') {
            if (!solidsAmounts[unit]) {
              solidsAmounts[unit] = 0;
            }
            solidsAmounts[unit] += activity.amount;
          } else {
            if (!consumedAmounts[unit]) {
              consumedAmounts[unit] = 0;
            }
            consumedAmounts[unit] += activity.amount;
          }
        }
      }
      
      // Breast feed activities with duration
      if ('type' in activity && activity.type === 'BREAST' && 'feedDuration' in activity && activity.feedDuration) {
        const time = new Date(activity.time);
        
        // Only count feeds that occurred on the selected day
        if (time >= startOfDay && time <= endOfDay) {
          // Track duration per side
          if ('side' in activity && activity.side) {
            if (activity.side === 'LEFT') {
              leftBreastSeconds += activity.feedDuration;
            } else if (activity.side === 'RIGHT') {
              rightBreastSeconds += activity.feedDuration;
            }
          }
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
      
      // Note activities
      if ('content' in activity) {
        const time = new Date(activity.time);
        
        // Only count notes that occurred on the selected day
        if (time >= startOfDay && time <= endOfDay) {
          noteCount++;
        }
      }
    });

    // Calculate awake time (elapsed time today minus sleep minutes)
    let totalElapsedMinutes = 24 * 60; // Default to full day (24 hours in minutes)
    
    // If the selected date is today, only count elapsed time
    const now = new Date();
    const isToday = date.getDate() === now.getDate() && 
                    date.getMonth() === now.getMonth() && 
                    date.getFullYear() === now.getFullYear();
    
    if (isToday) {
      // Calculate minutes elapsed so far today
      const elapsedMs = now.getTime() - startOfDay.getTime();
      totalElapsedMinutes = Math.floor(elapsedMs / (1000 * 60));
    }
    
    const awakeMinutes = totalElapsedMinutes - totalSleepMinutes;
    
    // Format consumed amounts
    const formattedConsumed = Object.entries(consumedAmounts)
      .map(([unit, amount]) => `${amount} ${unit.toLowerCase()}`)
      .join(', ');
      
    // Format solids consumed amounts
    const formattedSolidsConsumed = Object.entries(solidsAmounts)
      .map(([unit, amount]) => `${amount} ${unit.toLowerCase()}`)
      .join(', ');
    
    return {
      awakeTime: formatMinutes(awakeMinutes),
      sleepTime: formatMinutes(totalSleepMinutes),
      totalConsumed: formattedConsumed || 'None',
      diaperChanges: diaperCount.toString(),
      poopCount: poopCount.toString(),
      leftBreastTime: formatMinutes(Math.floor(leftBreastSeconds / 60)),
      rightBreastTime: formatMinutes(Math.floor(rightBreastSeconds / 60)),
      noteCount: noteCount.toString(),
      solidsConsumed: formattedSolidsConsumed || 'None'
    };
  }, [activities, date]);

  return (
    <Card className="overflow-hidden">
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
          {isLoading ? (
            <div className="col-span-2 md:col-span-5 py-4 text-center text-gray-500">
              Loading daily statistics...
            </div>
          ) : activities.length === 0 ? (
            <div className="col-span-2 md:col-span-5 py-4 text-center text-gray-500">
              No activities recorded for this day
            </div>
          ) : (
            <>
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
              {totalConsumed !== 'None' && (
                <StatItem 
                  icon={<Icon iconNode={bottleBaby} className="h-4 w-4 text-sky-600" />} 
                  label="Consumed" 
                  value={totalConsumed} 
                />
              )}
              {diaperChanges !== '0' && (
                <StatItem 
                  icon={<Icon iconNode={diaper} className="h-4 w-4 text-teal-600" />} 
                  label="Diaper Changes" 
                  value={diaperChanges} 
                />
              )}
              {poopCount !== '0' && (
                <StatItem 
                  icon={<Icon iconNode={diaper} className="h-4 w-4 text-amber-700" />} 
                  label="Poops" 
                  value={poopCount} 
                />
              )}
              {solidsConsumed !== 'None' && (
                <StatItem 
                  icon={<Utensils className="h-4 w-4 text-green-600" />} 
                  label="Solids" 
                  value={solidsConsumed} 
                />
              )}
              {leftBreastTime !== '0h 0m' && (
                <StatItem 
                  icon={<Droplet className="h-4 w-4 text-blue-500" />} 
                  label="Left Breast" 
                  value={leftBreastTime} 
                />
              )}
              {rightBreastTime !== '0h 0m' && (
                <StatItem 
                  icon={<Droplet className="h-4 w-4 text-red-500" />} 
                  label="Right Breast" 
                  value={rightBreastTime} 
                />
              )}
              {noteCount !== '0' && (
                <StatItem 
                  icon={<StickyNote className="h-4 w-4 text-yellow-500" />} 
                  label="Notes" 
                  value={noteCount} 
                />
              )}
            </>
          )}
        </div>
      )}
    </Card>
  );
};

export default DailyStats;
