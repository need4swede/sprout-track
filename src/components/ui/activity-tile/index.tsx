import React from 'react';
import { Moon, Edit, Icon } from 'lucide-react';
import { diaper, bottleBaby } from '@lucide/lab';
import { cn } from "@/src/lib/utils";
import { activityTileStyles as styles } from './activity-tile.styles';
import {
  ActivityTileProps,
  ActivityTileIconProps,
  ActivityTileContentProps,
  ActivityType,
  ActivityTileVariant
} from './activity-tile.types';

/**
 * Formats time based on the provided date string and settings
 */
const formatTime = (date: string, includeDate: boolean = true) => {
  if (!date) return 'Invalid Date';

  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return 'Invalid Date';

    const timeStr = dateObj.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    if (!includeDate) return timeStr;

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isToday = dateObj.toDateString() === today.toDateString();
    const isYesterday = dateObj.toDateString() === yesterday.toDateString();

    const dateStr = isToday 
      ? 'Today'
      : isYesterday 
      ? 'Yesterday'
      : dateObj.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }).replace(/(\d+)$/, '$1,');
    return `${dateStr} ${timeStr}`;
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'Invalid Date';
  }
};

/**
 * Formats duration in minutes to HH:MM format
 */
const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `(${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')})`;
};

/**
 * Gets the activity time from different activity types
 */
const getActivityTime = (activity: ActivityType): string => {
  if ('time' in activity && activity.time) {
    return activity.time;
  }
  if ('startTime' in activity && activity.startTime) {
    if ('duration' in activity && activity.endTime) {
      return String(activity.endTime);
    }
    return String(activity.startTime);
  }
  return new Date().toLocaleString();
};

/**
 * Determines the variant based on the activity type
 */
const getActivityVariant = (activity: ActivityType): 'sleep' | 'feed' | 'diaper' | 'note' | 'default' => {
  if ('type' in activity) {
    if ('duration' in activity) return 'sleep';
    if ('amount' in activity) return 'feed';
    if ('condition' in activity) return 'diaper';
  }
  if ('content' in activity) return 'note';
  return 'default';
};

/**
 * Generates a description for the activity
 */
const getActivityDescription = (activity: ActivityType) => {
  if ('type' in activity) {
    if ('duration' in activity) {
      const startTimeFormatted = activity.startTime ? formatTime(activity.startTime, true) : 'unknown';
      const endTimeFormatted = activity.endTime ? formatTime(activity.endTime, true) : 'ongoing';
      const duration = activity.duration ? ` ${formatDuration(activity.duration)}` : '';
      const location = activity.location === 'OTHER' ? 'Other' : activity.location?.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ');
      return {
        type: `${activity.type === 'NAP' ? 'Nap' : 'Night Sleep'}${location ? ` - ${location}` : ''}`,
        details: `${startTimeFormatted} - ${endTimeFormatted.split(' ').slice(-2).join(' ')}${duration}`
      };
    }
    if ('amount' in activity) {
      const formatFeedType = (type: string) => {
        switch (type) {
          case 'BREAST': return 'Breast';
          case 'BOTTLE': return 'Bottle';
          case 'SOLIDS': return 'Solid Food';
          default: return type.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          ).join(' ');
        }
      };
      const formatBreastSide = (side: string) => {
        switch (side) {
          case 'LEFT': return 'Left';
          case 'RIGHT': return 'Right';
          default: return side.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          ).join(' ');
        }
      };
      
      let details = '';
      if (activity.type === 'BREAST') {
        const side = activity.side ? `Side: ${formatBreastSide(activity.side)}` : '';
        const duration = activity.amount ? `${activity.amount} min` : '';
        details = [side, duration].filter(Boolean).join(', ');
      } else if (activity.type === 'BOTTLE') {
        details = `${activity.amount || 'unknown'} oz`;
      } else if (activity.type === 'SOLIDS') {
        details = `${activity.amount || 'unknown'} g`;
        if (activity.food) {
          details += ` of ${activity.food}`;
        }
      }
      
      const time = formatTime(activity.time, true);
      return {
        type: formatFeedType(activity.type),
        details: `${details} - ${time}`
      };
    }
    if ('condition' in activity) {
      const formatDiaperType = (type: string) => {
        switch (type) {
          case 'WET': return 'Wet';
          case 'DIRTY': return 'Dirty';
          case 'BOTH': return 'Wet and Dirty';
          default: return type.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          ).join(' ');
        }
      };
      const formatDiaperCondition = (condition: string) => {
        switch (condition) {
          case 'NORMAL': return 'Normal';
          case 'LOOSE': return 'Loose';
          case 'FIRM': return 'Firm';
          case 'OTHER': return 'Other';
          default: return condition.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          ).join(' ');
        }
      };
      const formatDiaperColor = (color: string) => {
        switch (color) {
          case 'YELLOW': return 'Yellow';
          case 'BROWN': return 'Brown';
          case 'GREEN': return 'Green';
          case 'OTHER': return 'Other';
          default: return color.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          ).join(' ');
        }
      };
      
      let details = '';
      if (activity.type !== 'WET') {
        const conditions = [];
        if (activity.condition) conditions.push(formatDiaperCondition(activity.condition));
        if (activity.color) conditions.push(formatDiaperColor(activity.color));
        if (conditions.length > 0) {
          details = ` (${conditions.join(', ')}) - `;
        }
      }
      
      const time = formatTime(activity.time, true);
      return {
        type: formatDiaperType(activity.type),
        details: `${details}${time}`
      };
    }
  }
  if ('content' in activity) {
    const time = formatTime(activity.time, true);
    const truncatedContent = activity.content.length > 50 ? activity.content.substring(0, 50) + '...' : activity.content;
    return {
      type: activity.category || 'Note',
      details: `${time} - ${truncatedContent}`
    };
  }
  return {
    type: 'Activity',
    details: 'logged'
  };
};

/**
 * ActivityTileIcon component displays the appropriate icon based on activity type
 */
export function ActivityTileIcon({
  activity,
  className,
  variant: variantProp,
  isButton = false
}: ActivityTileIconProps & { variant?: ActivityTileVariant; isButton?: boolean }) {
  const variant = variantProp || getActivityVariant(activity);
  
  let icon = null;
  
  // For buttons, always use the image icons
  if (isButton && styles.icon.defaultIcons[variant]) {
    icon = <img
      src={styles.icon.defaultIcons[variant]}
      alt={variant}
      className="h-full w-full object-contain"
    />;
  }
  // For timeline view, use Lucide icons (smaller icons)
  else if (!isButton) {
    if ('type' in activity) {
      if ('duration' in activity) {
        icon = <Moon className={cn(styles.icon.base, styles.icon.variants[variant])} />;
      } else if ('amount' in activity) {
        icon = <Icon iconNode={bottleBaby} className={cn(styles.icon.base, styles.icon.variants[variant])} />;
      } else if ('condition' in activity) {
        icon = <Icon iconNode={diaper} className={cn(styles.icon.base, styles.icon.variants[variant])} />;
      }
    } else if ('content' in activity) {
      icon = <Edit className={cn(styles.icon.base, styles.icon.variants[variant])} />;
    }
  }
  
  // If no icon is determined and we have a default icon for this variant, use it
  if (!icon && styles.icon.defaultIcons[variant]) {
    icon = <img
      src={styles.icon.defaultIcons[variant]}
      alt={variant}
      className="h-full w-full object-contain"
    />;
  }
  
  return (
    <div className={cn(
      styles.iconContainer.base,
      styles.iconContainer.variants[variant],
      className
    )}>
      {icon}
    </div>
  );
}

/**
 * ActivityTileContent component displays the title and description of an activity
 */
export function ActivityTileContent({ 
  activity, 
  title, 
  description, 
  className 
}: ActivityTileContentProps) {
  const activityDesc = getActivityDescription(activity);
  const displayTitle = title || activityDesc.type;
  const displayDescription = description || activityDesc.details;
  
  return (
    <div className={cn(styles.content.base, className)}>
      <div className={styles.content.typeContainer}>
        <span className={styles.content.typeLabel}>
          {displayTitle}
        </span>
        <span className={styles.content.description}>
          {displayDescription}
        </span>
      </div>
    </div>
  );
}

/**
 * ActivityTile component displays an activity in a consistent, styled manner
 *
 * This component is designed to be used in lists of activities, such as in the Timeline component.
 * It follows the project's UI component patterns and is highly configurable through props.
 *
 * @example
 * ```tsx
 * <ActivityTile
 *   activity={sleepActivity}
 *   onClick={() => handleActivityClick(sleepActivity)}
 * />
 * ```
 */
export function ActivityTile({
  activity,
  onClick,
  icon,
  title,
  description,
  variant: variantProp,
  className,
  isButton = false
}: ActivityTileProps) {
  const variant = variantProp || getActivityVariant(activity);
  
  return (
    <div
      className={cn(
        styles.base,
        isButton && styles.button.base,
        isButton && styles.button.variants[variant],
        className
      )}
      onClick={onClick}
    >
      <div className={isButton ? "h-full w-full flex items-center justify-center" : styles.container}>
        {icon || <ActivityTileIcon activity={activity} variant={variant} isButton={isButton} />}
        {!isButton && (
          <ActivityTileContent
            activity={activity}
            title={title}
            description={description}
          />
        )}
      </div>
      {isButton && title && (
        <span className="absolute bottom-1 text-sm font-medium z-20 bg-black/50 px-2 py-0.5 rounded-sm">
          {title}
        </span>
      )}
    </div>
  );
}

export type { ActivityTileProps, ActivityType };
