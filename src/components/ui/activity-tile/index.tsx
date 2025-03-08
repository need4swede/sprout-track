import React from 'react';
import { cn } from "@/src/lib/utils";
import { activityTileStyles as styles } from './activity-tile.styles';
import { ActivityTileProps, ActivityType } from './activity-tile.types';
import { getActivityVariant } from './activity-tile-utils';
import { ActivityTileIcon } from './activity-tile-icon';
import { ActivityTileContent } from './activity-tile-content';

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
      <div className={isButton ? "h-full w-full flex items-center justify-center p-2" : styles.container}>
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
        <span className="absolute bottom-1 text-sm font-medium z-20 bg-black/50 px-2 py-0.5 rounded-sm left-0 right-0 mx-auto text-center w-max">
          {title}
        </span>
      )}
    </div>
  );
}

export type { ActivityTileProps, ActivityType };
