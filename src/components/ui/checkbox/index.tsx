'use client';

import * as React from 'react';
import { cn } from '@/src/lib/utils';
import { Check } from 'lucide-react';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * The checked state of the checkbox
   */
  checked?: boolean;
  /**
   * Callback function called when the checked state changes
   */
  onCheckedChange?: (checked: boolean) => void;
}

/**
 * Checkbox component
 * 
 * A custom checkbox component with a styled appearance
 */
export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (onCheckedChange) {
        onCheckedChange(event.target.checked);
      }
    };

    return (
      <div className="relative inline-flex items-center">
        <input
          type="checkbox"
          className="sr-only"
          ref={ref}
          checked={checked}
          onChange={handleChange}
          {...props}
        />
        <div
          className={cn(
            "h-5 w-5 rounded border border-gray-300 flex items-center justify-center",
            "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
            checked ? "bg-orange-500 border-orange-500" : "bg-white",
            className
          )}
          onClick={() => onCheckedChange?.(!checked)}
        >
          {checked && <Check className="h-3.5 w-3.5 text-white" />}
        </div>
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
