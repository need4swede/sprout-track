'use client';

import React, { useState, useEffect } from 'react';
import { PumpLogResponse } from '@/app/api/types';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Textarea } from '@/src/components/ui/textarea';
import { Label } from '@/src/components/ui/label';
import { DateTimePicker } from '@/src/components/ui/date-time-picker';
import {
  FormPage, 
  FormPageContent, 
  FormPageFooter 
} from '@/src/components/ui/form-page';
import { useTimezone } from '@/app/context/timezone';


interface PumpFormProps {
  isOpen: boolean;
  onClose: () => void;
  babyId: string | undefined;
  initialTime: string;
  activity?: PumpLogResponse;
  onSuccess?: () => void;
}

export default function PumpForm({
  isOpen,
  onClose,
  babyId,
  initialTime,
  activity,
  onSuccess,
}: PumpFormProps) {
  const { formatDate, toUTCString } = useTimezone();
  const [selectedStartDateTime, setSelectedStartDateTime] = useState<Date>(() => {
    try {
      // Try to parse the initialTime
      const date = new Date(initialTime);
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return new Date(); // Fallback to current date if invalid
      }
      return date;
    } catch (error) {
      console.error('Error parsing initialTime:', error);
      return new Date(); // Fallback to current date
    }
  });
  
  const [selectedEndDateTime, setSelectedEndDateTime] = useState<Date>(() => {
    try {
      // Initialize with current time + 15 minutes as default
      const date = new Date(initialTime);
      date.setMinutes(date.getMinutes() + 15);
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        const now = new Date();
        now.setMinutes(now.getMinutes() + 15);
        return now; // Fallback to current date + 15 min if invalid
      }
      return date;
    } catch (error) {
      console.error('Error setting initial end time:', error);
      const now = new Date();
      now.setMinutes(now.getMinutes() + 15);
      return now; // Fallback to current date + 15 min
    }
  });
  
  const [formData, setFormData] = useState({
    startTime: initialTime,
    endTime: '',
    leftAmount: '',
    rightAmount: '',
    totalAmount: '',
    unitAbbr: 'OZ', // Default unit
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Handle start date/time change
  const handleStartDateTimeChange = (date: Date) => {
    setSelectedStartDateTime(date);
    
    // Also update the time in formData for compatibility with existing code
    // Format the date as ISO string for storage in formData
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    const formattedTime = `${year}-${month}-${day}T${hours}:${minutes}`;
    setFormData(prev => ({ ...prev, startTime: formattedTime }));
  };
  
  // Handle end date/time change
  const handleEndDateTimeChange = (date: Date) => {
    setSelectedEndDateTime(date);
    
    // Format the date as ISO string for storage in formData
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    const formattedTime = `${year}-${month}-${day}T${hours}:${minutes}`;
    setFormData(prev => ({ ...prev, endTime: formattedTime }));
  };

  useEffect(() => {
    if (isOpen && !isInitialized) {
      if (activity) {
        // Editing mode - populate with activity data
        try {
          // Set the start date time
          const startDate = new Date(activity.startTime);
          if (!isNaN(startDate.getTime())) {
            setSelectedStartDateTime(startDate);
          }
          
          // Set the end date time if it exists
          if (activity.endTime) {
            const endDate = new Date(activity.endTime);
            if (!isNaN(endDate.getTime())) {
              setSelectedEndDateTime(endDate);
            }
          }
        } catch (error) {
          console.error('Error parsing activity times:', error);
        }
        
        // Format the start date for the time property
        const startDate = new Date(activity.startTime);
        const startYear = startDate.getFullYear();
        const startMonth = String(startDate.getMonth() + 1).padStart(2, '0');
        const startDay = String(startDate.getDate()).padStart(2, '0');
        const startHours = String(startDate.getHours()).padStart(2, '0');
        const startMinutes = String(startDate.getMinutes()).padStart(2, '0');
        const formattedStartTime = `${startYear}-${startMonth}-${startDay}T${startHours}:${startMinutes}`;
        
        // Format the end date for the time property if it exists
        let formattedEndTime = '';
        if (activity.endTime) {
          const endDate = new Date(activity.endTime);
          const endYear = endDate.getFullYear();
          const endMonth = String(endDate.getMonth() + 1).padStart(2, '0');
          const endDay = String(endDate.getDate()).padStart(2, '0');
          const endHours = String(endDate.getHours()).padStart(2, '0');
          const endMinutes = String(endDate.getMinutes()).padStart(2, '0');
          formattedEndTime = `${endYear}-${endMonth}-${endDay}T${endHours}:${endMinutes}`;
        }
        
        setFormData({
          startTime: formattedStartTime,
          endTime: formattedEndTime,
          leftAmount: activity.leftAmount?.toString() || '',
          rightAmount: activity.rightAmount?.toString() || '',
          totalAmount: activity.totalAmount?.toString() || '',
          unitAbbr: activity.unitAbbr || 'OZ',
          notes: activity.notes || '',
        });
      } else {
        // New entry mode - the selectedStartDateTime is already set in the useState initialization
      }
      
      // Mark as initialized
      setIsInitialized(true);
    } else if (!isOpen) {
      // Reset initialization flag when form closes
      setIsInitialized(false);
    }
  }, [isOpen, initialTime, activity, isInitialized]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // For amount fields, only allow numeric values with up to 2 decimal places
    if (['leftAmount', 'rightAmount', 'totalAmount'].includes(name)) {
      // Allow empty string or valid decimal number
      if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Auto-calculate total amount if left or right amount changes
        if (name === 'leftAmount' || name === 'rightAmount') {
          const leftVal = name === 'leftAmount' ? value : formData.leftAmount;
          const rightVal = name === 'rightAmount' ? value : formData.rightAmount;
          
          const leftNum = leftVal ? parseFloat(leftVal) : 0;
          const rightNum = rightVal ? parseFloat(rightVal) : 0;
          
          if (leftVal || rightVal) {
            setFormData(prev => ({ 
              ...prev, 
              [name]: value,
              totalAmount: (leftNum + rightNum).toString()
            }));
          }
        }
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!babyId) {
      console.error('No baby selected');
      return;
    }
    
    setLoading(true);
    
    try {
      // Calculate duration between start and end times
      let duration: number | undefined = undefined;
      duration = Math.round((selectedEndDateTime.getTime() - selectedStartDateTime.getTime()) / 60000); // Convert ms to minutes
      
      // Convert local times to UTC ISO strings using the selectedDateTime objects
      const utcStartTime = toUTCString(selectedStartDateTime);
      
      // Convert end time to UTC
      const utcEndTime = toUTCString(selectedEndDateTime);
      
      console.log('Original start time (local):', selectedStartDateTime.toLocaleString());
      console.log('Converted start time (UTC):', utcStartTime);
      console.log('Original end time (local):', selectedEndDateTime.toLocaleString());
      console.log('Converted end time (UTC):', utcEndTime);
      
      const payload = {
        babyId,
        startTime: utcStartTime, // Send the UTC ISO string instead of local time
        endTime: utcEndTime,
        duration,
        leftAmount: formData.leftAmount ? parseFloat(formData.leftAmount) : undefined,
        rightAmount: formData.rightAmount ? parseFloat(formData.rightAmount) : undefined,
        totalAmount: formData.totalAmount ? parseFloat(formData.totalAmount) : undefined,
        unitAbbr: formData.unitAbbr || 'OZ',
        notes: formData.notes || undefined,
      };
      
      // Determine if we're creating a new record or updating an existing one
      const url = activity ? `/api/pump-log?id=${activity.id}` : '/api/pump-log';
      const method = activity ? 'PUT' : 'POST';
      
      // Get auth token from localStorage
      const authToken = localStorage.getItem('authToken');
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken ? `Bearer ${authToken}` : '',
        },
        body: JSON.stringify(payload),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Close the form and trigger the success callback
        onClose();
        if (onSuccess) onSuccess();
      } else {
        console.error('Error saving pump log:', data.error);
        alert(`Error: ${data.error || 'Failed to save pump log'}`);
      }
    } catch (error) {
      console.error('Error saving pump log:', error);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormPage
      isOpen={isOpen}
      onClose={onClose}
      title={activity ? 'Edit Pump' : 'New Pump'}
    >
      <form onSubmit={handleSubmit}>
        <FormPageContent>
          <div className="space-y-4">
            {/* Start Time Input */}
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <DateTimePicker
                value={selectedStartDateTime}
                onChange={handleStartDateTimeChange}
                disabled={loading}
                placeholder="Select start time..."
              />
            </div>
            
            {/* End Time Input */}
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <DateTimePicker
                value={selectedEndDateTime}
                onChange={handleEndDateTimeChange}
                disabled={loading}
                placeholder="Select end time..."
              />
            </div>
            
            {/* Amount Inputs */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="leftAmount">Left Amount</Label>
                <div className="flex">
                  <Input
                    id="leftAmount"
                    name="leftAmount"
                    type="text"
                    inputMode="decimal"
                    placeholder="0.0"
                    value={formData.leftAmount}
                    onChange={handleInputChange}
                    className="rounded-r-none"
                  />
                  <div className="inline-flex items-center px-3 bg-gray-200 border border-l-0 border-gray-300 rounded-r-md">
                    {formData.unitAbbr}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="rightAmount">Right Amount</Label>
                <div className="flex">
                  <Input
                    id="rightAmount"
                    name="rightAmount"
                    type="text"
                    inputMode="decimal"
                    placeholder="0.0"
                    value={formData.rightAmount}
                    onChange={handleInputChange}
                    className="rounded-r-none"
                  />
                  <div className="inline-flex items-center px-3 bg-gray-200 border border-l-0 border-gray-300 rounded-r-md">
                    {formData.unitAbbr}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Total Amount */}
            <div className="space-y-2">
              <Label htmlFor="totalAmount">Total Amount</Label>
              <div className="flex">
                <Input
                  id="totalAmount"
                  name="totalAmount"
                  type="text"
                  inputMode="decimal"
                  placeholder="0.0"
                  value={formData.totalAmount}
                  onChange={handleInputChange}
                  className="rounded-r-none"
                />
                <div className="inline-flex items-center px-3 bg-gray-200 border border-l-0 border-gray-300 rounded-r-md">
                  {formData.unitAbbr}
                </div>
              </div>
            </div>
            
            {/* Unit Selection */}
            <div className="space-y-2">
              <Label htmlFor="unitAbbr">Unit</Label>
              <select
                id="unitAbbr"
                name="unitAbbr"
                value={formData.unitAbbr}
                onChange={(e) => setFormData(prev => ({ ...prev, unitAbbr: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="OZ">Ounces (oz)</option>
                <option value="ML">Milliliters (ml)</option>
              </select>
            </div>
            
            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Enter any notes about the pumping session"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
          </div>
        </FormPageContent>
        
        <FormPageFooter>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
            >
              {loading ? 'Saving...' : (activity ? 'Update' : 'Save')}
            </Button>
          </div>
        </FormPageFooter>
      </form>
    </FormPage>
  );
}
