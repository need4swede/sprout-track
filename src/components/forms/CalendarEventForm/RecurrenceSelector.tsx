import React from 'react';
import { cn } from '@/src/lib/utils';
import { RecurrencePattern } from '@prisma/client';
import { calendarEventFormStyles as styles } from './calendar-event-form.styles';
import { Calendar, Repeat, AlertCircle } from 'lucide-react';

interface RecurrenceSelectorProps {
  recurring: boolean;
  recurrencePattern?: RecurrencePattern;
  recurrenceEnd?: Date;
  onRecurringChange: (recurring: boolean) => void;
  onRecurrencePatternChange: (pattern: RecurrencePattern) => void;
  onRecurrenceEndChange: (date: Date | undefined) => void;
  error?: {
    recurrencePattern?: string;
    recurrenceEnd?: string;
  };
}

/**
 * RecurrenceSelector Component
 * 
 * A subcomponent of CalendarEventForm that handles the selection of recurrence patterns
 * for recurring events.
 */
const RecurrenceSelector: React.FC<RecurrenceSelectorProps> = ({
  recurring,
  recurrencePattern,
  recurrenceEnd,
  onRecurringChange,
  onRecurrencePatternChange,
  onRecurrenceEndChange,
  error,
}) => {
  // Format date for input
  const formatDateForInput = (date?: Date) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  // Handle recurrence end date change
  const handleRecurrenceEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) {
      onRecurrenceEndChange(new Date(value));
    } else {
      onRecurrenceEndChange(undefined);
    }
  };

  return (
    <div className={styles.recurrenceContainer}>
      {/* Recurring checkbox */}
      <div className={styles.checkboxContainer}>
        <input
          type="checkbox"
          id="recurring"
          checked={recurring}
          onChange={(e) => onRecurringChange(e.target.checked)}
          className={cn(
            styles.checkbox,
            'calendar-event-form-checkbox'
          )}
        />
        <label htmlFor="recurring" className={styles.checkboxLabel}>
          <span className="flex items-center">
            <Repeat className="h-4 w-4 mr-1.5 text-gray-500 dark:text-gray-400" />
            Recurring event
          </span>
        </label>
      </div>

      {/* Recurrence options (only shown if recurring is checked) */}
      {recurring && (
        <>
          {/* Recurrence pattern */}
          <div className={styles.fieldGroup}>
            <label className={cn(
              styles.fieldLabel,
              'calendar-event-form-label'
            )}>
              Recurrence Pattern
              <span className={styles.fieldRequired}>*</span>
            </label>
            <div className={cn(
              styles.recurrencePatternContainer,
              'calendar-event-form-recurrence-pattern-container'
            )}>
              {Object.values(RecurrencePattern).map((pattern) => (
                <button
                  key={pattern}
                  type="button"
                  onClick={() => onRecurrencePatternChange(pattern)}
                  className={cn(
                    styles.recurrencePatternButton,
                    recurrencePattern === pattern && styles.recurrencePatternButtonSelected
                  )}
                >
                  {pattern.charAt(0) + pattern.slice(1).toLowerCase().replace('_', ' ')}
                </button>
              ))}
            </div>
            {error?.recurrencePattern && (
              <div className={styles.fieldError}>
                <AlertCircle className="h-3 w-3 inline mr-1" />
                {error.recurrencePattern}
              </div>
            )}
          </div>

          {/* Recurrence end date */}
          <div className={styles.fieldGroup}>
            <label 
              htmlFor="recurrenceEnd" 
              className={cn(
                styles.fieldLabel,
                'calendar-event-form-label'
              )}
            >
              Ends On
            </label>
            <div className={styles.datePickerContainer}>
              <input
                type="date"
                id="recurrenceEnd"
                value={formatDateForInput(recurrenceEnd)}
                onChange={handleRecurrenceEndChange}
                className={cn(
                  styles.datePicker,
                  'calendar-event-form-date-picker',
                  'calendar-event-form-input'
                )}
              />
              <Calendar className={styles.datePickerIcon} />
            </div>
            <div className={cn(
              styles.fieldHint,
              'calendar-event-form-hint'
            )}>
              Leave blank for an indefinite recurrence
            </div>
            {error?.recurrenceEnd && (
              <div className={styles.fieldError}>
                <AlertCircle className="h-3 w-3 inline mr-1" />
                {error.recurrenceEnd}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default RecurrenceSelector;
