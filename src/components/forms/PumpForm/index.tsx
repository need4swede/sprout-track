'use client';

import React, { useState, useEffect } from 'react';
import { PumpLogResponse } from '@/app/api/types';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Textarea } from '@/src/components/ui/textarea';
import { Label } from '@/src/components/ui/label';
import {
  FormPage, 
  FormPageContent, 
  FormPageFooter 
} from '@/src/components/ui/form-page';
import { LampWallDown } from 'lucide-react';

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

  // Format date string to be compatible with datetime-local input
  const formatDateForInput = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    
    // Format as YYYY-MM-DDThh:mm in local time
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  useEffect(() => {
    if (isOpen && !isInitialized) {
      if (activity) {
        // Editing mode - populate with activity data
        setFormData({
          startTime: formatDateForInput(activity.startTime),
          endTime: activity.endTime ? formatDateForInput(activity.endTime) : '',
          leftAmount: activity.leftAmount?.toString() || '',
          rightAmount: activity.rightAmount?.toString() || '',
          totalAmount: activity.totalAmount?.toString() || '',
          unitAbbr: activity.unitAbbr || 'OZ',
          notes: activity.notes || '',
        });
      } else {
        // New entry mode - set the start time
        setFormData(prev => ({
          ...prev,
          startTime: formatDateForInput(initialTime)
        }));
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
      // Calculate duration if both start and end times are provided
      let duration: number | undefined = undefined;
      if (formData.startTime && formData.endTime) {
        const startDate = new Date(formData.startTime);
        const endDate = new Date(formData.endTime);
        duration = Math.round((endDate.getTime() - startDate.getTime()) / 60000); // Convert ms to minutes
      }
      
      const payload = {
        babyId,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: formData.endTime ? new Date(formData.endTime).toISOString() : undefined,
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
              <Input
                id="startTime"
                name="startTime"
                type="datetime-local"
                value={formData.startTime}
                onChange={handleInputChange}
                required
              />
            </div>
            
            {/* End Time Input */}
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time (Optional)</Label>
              <Input
                id="endTime"
                name="endTime"
                type="datetime-local"
                value={formData.endTime}
                onChange={handleInputChange}
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
