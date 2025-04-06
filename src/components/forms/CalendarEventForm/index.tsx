import React, { useState, useEffect } from 'react';
import { cn } from '@/src/lib/utils';
import { CalendarEventFormProps, CalendarEventFormData, CalendarEventFormErrors } from './calendar-event-form.types';
import { calendarEventFormStyles as styles } from './calendar-event-form.styles';
import { CalendarEventType, RecurrencePattern } from '@prisma/client';
import { format } from 'date-fns'; // Import date-fns for formatting
import RecurrenceSelector from './RecurrenceSelector';
import ContactSelector from './ContactSelector';
import { X, Calendar, Clock, MapPin, Palette, AlertCircle, Bell, Loader2, Trash2 } from 'lucide-react';
import './calendar-event-form.css';

/**
 * CalendarEventForm Component
 * 
 * A form for creating and editing calendar events.
 * Includes fields for event details, recurrence, and associated entities.
 */
const CalendarEventForm: React.FC<CalendarEventFormProps> = ({
  isOpen,
  onClose,
  event,
  onSave,
  initialDate,
  babies,
  caretakers,
  contacts,
  isLoading = false,
}) => {
  // Initialize form data
  const [formData, setFormData] = useState<CalendarEventFormData>(() => {
    if (event) {
      return { ...event };
    }
    
    // Default values for new event
    const date = initialDate || new Date();
    
    // Set default start time to nearest half hour
    const startTime = new Date(date);
    startTime.setMinutes(Math.ceil(startTime.getMinutes() / 30) * 30);
    startTime.setSeconds(0);
    startTime.setMilliseconds(0);
    
    // Set default end time to 1 hour after start time
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + 1);
    
    return {
      title: '',
      startTime,
      endTime,
      allDay: false,
      type: CalendarEventType.APPOINTMENT,
      recurring: false,
      babyIds: [],
      caretakerIds: [],
      contactIds: [],
    };
  });
  
  // Update form data when initialDate changes and we're creating a new event
  useEffect(() => {
    if (!event && initialDate) {
      // Set default start time to nearest half hour
      const startTime = new Date(initialDate);
      startTime.setMinutes(Math.ceil(startTime.getMinutes() / 30) * 30);
      startTime.setSeconds(0);
      startTime.setMilliseconds(0);
      
      // Set default end time to 1 hour after start time
      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + 1);
      
      setFormData(prev => ({
        ...prev,
        startTime,
        endTime
      }));
    }
  }, [initialDate, event]);
  
  // Form validation errors
  const [errors, setErrors] = useState<CalendarEventFormErrors>({});
  
  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for the field
    if (errors[name as keyof CalendarEventFormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };
  
  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  }; // <-- Added missing closing brace

  // Handle datetime-local input changes
  const handleDateTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // The value from datetime-local is like "YYYY-MM-DDTHH:MM"
    // Directly create a Date object from this value
    const newDate = value ? new Date(value) : undefined;
    
    setFormData(prev => ({ ...prev, [name]: newDate }));
    
    // Clear error for the field
    if (errors[name as keyof CalendarEventFormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };
  
  // Handle color change
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, color: e.target.value }));
  };
  
  // Handle recurring change
  const handleRecurringChange = (recurring: boolean) => {
    setFormData(prev => ({ 
      ...prev, 
      recurring,
      // If turning on recurring, set default pattern
      ...(recurring && !prev.recurrencePattern ? { recurrencePattern: RecurrencePattern.WEEKLY } : {})
    }));
  };
  
  // Handle recurrence pattern change
  const handleRecurrencePatternChange = (pattern: RecurrencePattern) => {
    setFormData(prev => ({ ...prev, recurrencePattern: pattern }));
    
    // Clear error for the field
    if (errors.recurrencePattern) {
      setErrors(prev => ({ ...prev, recurrencePattern: undefined }));
    }
  };
  
  // Handle recurrence end change
  const handleRecurrenceEndChange = (date: Date | undefined) => {
    setFormData(prev => ({ ...prev, recurrenceEnd: date }));
    
    // Clear error for the field
    if (errors.recurrenceEnd) {
      setErrors(prev => ({ ...prev, recurrenceEnd: undefined }));
    }
  };
  
  // Handle reminder time change
  const handleReminderTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ 
      ...prev, 
      reminderTime: value ? parseInt(value, 10) : undefined 
    }));
  };
  
  // Handle baby selection change
  const handleBabyChange = (babyId: string) => {
    setFormData(prev => {
      const newBabyIds = prev.babyIds.includes(babyId)
        ? prev.babyIds.filter(id => id !== babyId)
        : [...prev.babyIds, babyId];
      
      return { ...prev, babyIds: newBabyIds };
    });
  };
  
  // Handle caretaker selection change
  const handleCaretakerChange = (caretakerId: string) => {
    setFormData(prev => {
      const newCaretakerIds = prev.caretakerIds.includes(caretakerId)
        ? prev.caretakerIds.filter(id => id !== caretakerId)
        : [...prev.caretakerIds, caretakerId];
      
      return { ...prev, caretakerIds: newCaretakerIds };
    });
  };
  
  // Handle contact selection change
  const handleContactsChange = (contactIds: string[]) => {
    setFormData(prev => ({ ...prev, contactIds }));
  };
  
  // Format Date object into "yyyy-MM-dd'T'HH:mm" for datetime-local input
  const formatDateTimeForInput = (date?: Date): string => {
    if (!date) return '';
    try {
      // Use date-fns for reliable formatting
      return format(date, "yyyy-MM-dd'T'HH:mm");
    } catch (error) {
      console.error("Error formatting date for input:", error);
      // Fallback or handle error appropriately
      // Attempt manual format as fallback
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    }
  };
  
  // Validate form before submission
  const validateForm = (): boolean => {
    const newErrors: CalendarEventFormErrors = {};
    
    // Required fields
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }
    
    if (!formData.type) {
      newErrors.type = 'Event type is required';
    }
    
    // Validate end time is after start time
    if (formData.startTime && formData.endTime && formData.endTime < formData.startTime) {
      newErrors.endTime = 'End time must be after start time';
    }
    
    // Validate recurrence pattern if recurring
    if (formData.recurring && !formData.recurrencePattern) {
      newErrors.recurrencePattern = 'Recurrence pattern is required for recurring events';
    }
    
    // Validate recurrence end date is in the future
    if (formData.recurring && formData.recurrenceEnd) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (formData.recurrenceEnd < today) {
        newErrors.recurrenceEnd = 'Recurrence end date must be in the future';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
    }
  };
  
  // Handle form close
  const handleClose = () => {
    onClose();
  };
  
  // If the form is not open, don't render anything
  if (!isOpen) {
    return null;
  }
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow-xl calendar-event-form-container">
        {/* Form header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className={cn(
            "text-xl font-semibold text-gray-900",
            "calendar-event-form-title"
          )}>
            {event ? 'Edit Event' : 'Add Event'}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Form content */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)] calendar-event-form">
          <form onSubmit={handleSubmit} className={styles.formContainer}>
            {/* Event details section */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Event Details</h3>
              
              {/* Title */}
              <div className={styles.fieldGroup}>
                <label 
                  htmlFor="title" 
                  className={cn(
                    styles.fieldLabel,
                    'calendar-event-form-label'
                  )}
                >
                  Title
                  <span className={styles.fieldRequired}>*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={cn(
                    styles.input,
                    'calendar-event-form-input'
                  )}
                  placeholder="Enter event title"
                />
                {errors.title && (
                  <div className={styles.fieldError}>
                    <AlertCircle className="h-3 w-3 inline mr-1" />
                    {errors.title}
                  </div>
                )}
              </div>
              
              {/* Event type */}
              <div className={styles.fieldGroup}>
                <label 
                  htmlFor="type" 
                  className={cn(
                    styles.fieldLabel,
                    'calendar-event-form-label'
                  )}
                >
                  Event Type
                  <span className={styles.fieldRequired}>*</span>
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className={cn(
                    styles.select,
                    'calendar-event-form-select'
                  )}
                >
                  {Object.values(CalendarEventType).map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0) + type.slice(1).toLowerCase().replace('_', ' ')}
                    </option>
                  ))}
                </select>
                {errors.type && (
                  <div className={styles.fieldError}>
                    <AlertCircle className="h-3 w-3 inline mr-1" />
                    {errors.type}
                  </div>
                )}
              </div>
              
              {/* All day checkbox */}
              <div className={styles.checkboxContainer}>
                <input
                  type="checkbox"
                  id="allDay"
                  name="allDay"
                  checked={formData.allDay}
                  onChange={handleCheckboxChange}
                  className={cn(
                    styles.checkbox,
                    'calendar-event-form-checkbox'
                  )}
                />
                <label htmlFor="allDay" className={styles.checkboxLabel}>
                  All day event
                </label>
              </div>
              
              {/* Date and time */}
              <div className={cn(
                styles.dateTimeContainer,
                'calendar-event-form-date-time-container'
              )}>
                {/* Start Date/Time */}
                <div className={styles.fieldGroup}>
                  <label 
                    htmlFor="startTime" 
                    className={cn(
                      styles.fieldLabel,
                      'calendar-event-form-label'
                    )}
                  >
                    Start Time
                    <span className={styles.fieldRequired}>*</span>
                  </label>
                  <div className={styles.datePickerContainer}>
                    <input
                      type="datetime-local"
                      id="startTime"
                      name="startTime"
                      value={formatDateTimeForInput(formData.startTime)}
                      onChange={handleDateTimeChange}
                      className={cn(
                        styles.datePicker,
                        'calendar-event-form-input'
                      )}
                      disabled={formData.allDay} // Disable if allDay is checked
                    />
                    <Calendar className={styles.datePickerIcon} />
                  </div>
                  {errors.startTime && (
                    <div className={styles.fieldError}>
                      <AlertCircle className="h-3 w-3 inline mr-1" />
                      {errors.startTime}
                    </div>
                  )}
                </div>
                
                {/* End Date/Time */}
                <div className={styles.fieldGroup}>
                  <label 
                    htmlFor="endTime" 
                    className={cn(
                      styles.fieldLabel,
                      'calendar-event-form-label'
                    )}
                  >
                    End Time
                  </label>
                  <div className={styles.datePickerContainer}>
                    <input
                      type="datetime-local"
                      id="endTime"
                      name="endTime"
                      value={formatDateTimeForInput(formData.endTime)}
                      onChange={handleDateTimeChange}
                      className={cn(
                        styles.datePicker,
                        'calendar-event-form-input'
                      )}
                      disabled={formData.allDay} // Disable if allDay is checked
                      min={formatDateTimeForInput(formData.startTime)} // Ensure end time is after start time
                    />
                    <Calendar className={styles.datePickerIcon} />
                  </div>
                  {errors.endTime && (
                    <div className={styles.fieldError}>
                      <AlertCircle className="h-3 w-3 inline mr-1" />
                      {errors.endTime}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Location */}
              <div className={styles.fieldGroup}>
                <label 
                  htmlFor="location" 
                  className={cn(
                    styles.fieldLabel,
                    'calendar-event-form-label'
                  )}
                >
                  Location
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location || ''}
                    onChange={handleChange}
                    className={cn(
                      styles.input,
                      'calendar-event-form-input',
                      'pl-8'
                    )}
                    placeholder="Enter location (optional)"
                  />
                  <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                </div>
              </div>
              
              {/* Description */}
              <div className={styles.fieldGroup}>
                <label 
                  htmlFor="description" 
                  className={cn(
                    styles.fieldLabel,
                    'calendar-event-form-label'
                  )}
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description || ''}
                  onChange={handleChange}
                  className={cn(
                    styles.textarea,
                    'calendar-event-form-textarea'
                  )}
                  placeholder="Enter event description (optional)"
                />
              </div>
              
              {/* Color */}
              <div className={styles.fieldGroup}>
                <label 
                  htmlFor="color" 
                  className={cn(
                    styles.fieldLabel,
                    'calendar-event-form-label'
                  )}
                >
                  Color
                </label>
                <div className={styles.colorPickerContainer}>
                  <div 
                    className={styles.colorPickerPreview}
                    style={{ backgroundColor: formData.color || '#14b8a6' }}
                  />
                  <div className={styles.colorPicker}>
                    <input
                      type="color"
                      id="color"
                      name="color"
                      value={formData.color || '#14b8a6'}
                      onChange={handleColorChange}
                      className={styles.colorPickerInput}
                    />
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                    Custom color for this event
                  </span>
                </div>
              </div>
            </div>
            
            {/* Recurrence section */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Recurrence</h3>
              
              <RecurrenceSelector
                recurring={formData.recurring}
                recurrencePattern={formData.recurrencePattern}
                recurrenceEnd={formData.recurrenceEnd}
                onRecurringChange={handleRecurringChange}
                onRecurrencePatternChange={handleRecurrencePatternChange}
                onRecurrenceEndChange={handleRecurrenceEndChange}
                error={{
                  recurrencePattern: errors.recurrencePattern,
                  recurrenceEnd: errors.recurrenceEnd,
                }}
              />
            </div>
            
            {/* Reminder section */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Reminder</h3>
              
              <div className={styles.reminderContainer}>
                <label 
                  htmlFor="reminderTime" 
                  className={cn(
                    styles.fieldLabel,
                    'calendar-event-form-label'
                  )}
                >
                  <Bell className="h-4 w-4 inline mr-1.5 text-gray-500 dark:text-gray-400" />
                  Remind me
                </label>
                <select
                  id="reminderTime"
                  name="reminderTime"
                  value={formData.reminderTime?.toString() || ''}
                  onChange={handleReminderTimeChange}
                  className={cn(
                    styles.reminderSelect,
                    'calendar-event-form-select'
                  )}
                >
                  <option value="">No reminder</option>
                  <option value="0">At time of event</option>
                  <option value="5">5 minutes before</option>
                  <option value="10">10 minutes before</option>
                  <option value="15">15 minutes before</option>
                  <option value="30">30 minutes before</option>
                  <option value="60">1 hour before</option>
                  <option value="120">2 hours before</option>
                  <option value="1440">1 day before</option>
                </select>
              </div>
            </div>
            
            {/* People section */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>People</h3>
              
              {/* Babies */}
              <div className={styles.fieldGroup}>
                <label className={cn(
                  styles.fieldLabel,
                  'calendar-event-form-label'
                )}>
                  Babies
                </label>
                <div className={styles.multiSelectContainer}>
                  {babies.map(baby => (
                    <div key={baby.id} className={styles.checkboxContainer}>
                      <input
                        type="checkbox"
                        id={`baby-${baby.id}`}
                        checked={formData.babyIds.includes(baby.id)}
                        onChange={() => handleBabyChange(baby.id)}
                        className={cn(
                          styles.checkbox,
                          'calendar-event-form-checkbox'
                        )}
                      />
                      <label htmlFor={`baby-${baby.id}`} className={styles.checkboxLabel}>
                        {baby.firstName} {baby.lastName}
                      </label>
                    </div>
                  ))}
                  
                  {babies.length === 0 && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      No babies available
                    </div>
                  )}
                </div>
              </div>
              
              {/* Caretakers */}
              <div className={styles.fieldGroup}>
                <label className={cn(
                  styles.fieldLabel,
                  'calendar-event-form-label'
                )}>
                  Caretakers
                </label>
                <div className={styles.multiSelectContainer}>
                  {caretakers.map(caretaker => (
                    <div key={caretaker.id} className={styles.checkboxContainer}>
                      <input
                        type="checkbox"
                        id={`caretaker-${caretaker.id}`}
                        checked={formData.caretakerIds.includes(caretaker.id)}
                        onChange={() => handleCaretakerChange(caretaker.id)}
                        className={cn(
                          styles.checkbox,
                          'calendar-event-form-checkbox'
                        )}
                      />
                      <label htmlFor={`caretaker-${caretaker.id}`} className={styles.checkboxLabel}>
                        {caretaker.name} {caretaker.type ? `(${caretaker.type})` : ''}
                      </label>
                    </div>
                  ))}
                  
                  {caretakers.length === 0 && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      No caretakers available
                    </div>
                  )}
                </div>
              </div>
              
              {/* Contacts */}
              <div className={styles.fieldGroup}>
                <label className={cn(
                  styles.fieldLabel,
                  'calendar-event-form-label'
                )}>
                  Contacts
                </label>
                <ContactSelector
                  contacts={contacts}
                  selectedContactIds={formData.contactIds}
                  onContactsChange={handleContactsChange}
                  onAddNewContact={() => {
                    // This would be implemented to open a contact form
                    // For now, we'll just log to console
                    console.log('Add new contact');
                  }}
                />
              </div>
            </div>
            
            {/* Form actions */}
            <div className={styles.actionsContainer}>
              <button
                type="button"
                onClick={handleClose}
                className={styles.cancelButton}
              >
                Cancel
              </button>
              
              {event && (
                <button
                  type="button"
                  className={styles.deleteButton}
                  onClick={() => {
                    // This would be implemented to delete the event
                    // For now, we'll just log to console
                    console.log('Delete event', event.id);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-1.5" />
                  Delete
                </button>
              )}
              
              <button
                type="submit"
                className={styles.saveButton}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Event'
                )}
              </button>
            </div>
          </form>
        </div>
        
        {/* Loading overlay */}
        {isLoading && (
          <div className={styles.loadingOverlay}>
            <Loader2 className={cn(
              styles.loadingSpinner,
              'calendar-event-form-spinner'
            )} />
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarEventForm;
