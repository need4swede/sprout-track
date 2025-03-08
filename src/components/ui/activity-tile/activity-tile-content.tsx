import React from 'react';
import { cn } from "@/src/lib/utils";
import { activityTileStyles as styles } from './activity-tile.styles';
import { ActivityTileContentProps } from './activity-tile.types';
import { getActivityDescription } from './activity-tile-utils';

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