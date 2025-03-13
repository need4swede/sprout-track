'use client';

import React from 'react';
import { 
  cardVisualContainer, 
  cardVisualTitle, 
  cardVisualMainValue, 
  cardVisualComparativeValue,
  cardVisualDescription,
  cardVisualIconContainer
} from './card-visual.styles';
import { CardVisualProps } from './card-visual.types';
import { cn } from '@/src/lib/utils';

/**
 * CardVisual Component
 * 
 * A square reporting visual similar to Power BI's card visual that displays
 * a title, main number, and optional comparative number.
 *
 * @example
 * ```tsx
 * <CardVisual
 *   title="Average Wake Window"
 *   mainValue="1h 45m"
 *   comparativeValue="1h 30m (prev)"
 *   trend="positive"
 * />
 * ```
 */
const CardVisual: React.FC<CardVisualProps> = ({
  title,
  mainValue,
  comparativeValue,
  icon,
  className,
  description,
  trend
}) => {
  return (
    <div className={cn(cardVisualContainer({ trend }), className)}>
      <div className="relative">
        <h3 className={cardVisualTitle()}>
          {title}
        </h3>
        
        {icon && (
          <div className={cardVisualIconContainer()}>
            {icon}
          </div>
        )}
      </div>
      
      <div className="mt-auto">
        <div className={cardVisualMainValue()}>
          {mainValue}
        </div>
        
        {comparativeValue && (
          <div className={cardVisualComparativeValue()}>
            {comparativeValue}
          </div>
        )}
        
        {description && (
          <div className={cardVisualDescription()}>
            {description}
          </div>
        )}
      </div>
    </div>
  );
};

export default CardVisual;
