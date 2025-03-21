'use client';

import React, { useState, useEffect } from 'react';
import { BathLogResponse } from '@/app/api/types';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Textarea } from '@/src/components/ui/textarea';
import { Checkbox } from '@/src/components/ui/checkbox';
import { Label } from '@/src/components/ui/label';
import {
  FormPage, 
  FormPageContent, 
  FormPageFooter 
} from '@/src/components/ui/form-page';
import { useTimezone } from '@/app/context/timezone';

interface BathFormProps {
  isOpen: boolean;
  onClose: () => void;
  babyId: string | undefined;
  initialTime: string;
  activity?: BathLogResponse;
  onSuccess?: () => void;
}

export default function BathForm({
  isOpen,
  onClose,
  babyId,
  initialTime,
  activity,
  onSuccess,
}: BathFormProps) {
  const { formatDate } = useTimezone();
  const [formData, setFormData] = useState({
    time: initialTime,
    soapUsed: false,
    shampooUsed: false,
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
          time: formatDateForInput(activity.time),
          soapUsed: activity.soapUsed || false,
          shampooUsed: activity.shampooUsed || false,
          notes: activity.notes || '',
        });
      } else {
        // New entry mode - set the time
        setFormData(prev => ({
          ...prev,
          time: formatDateForInput(initialTime)
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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!babyId) {
      console.error('No baby selected');
      return;
    }
    
    setLoading(true);
    
    try {
      const payload = {
        babyId,
        time: formData.time, // Send the ISO string directly
        soapUsed: formData.soapUsed,
        shampooUsed: formData.shampooUsed,
        notes: formData.notes || null,
      };
      
      // Determine if we're creating a new record or updating an existing one
      const url = activity ? `/api/bath-log?id=${activity.id}` : '/api/bath-log';
      const method = activity ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Close the form and trigger the success callback
        onClose();
        if (onSuccess) onSuccess();
      } else {
        console.error('Error saving bath log:', data.error);
        alert(`Error: ${data.error || 'Failed to save bath log'}`);
      }
    } catch (error) {
      console.error('Error saving bath log:', error);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormPage
      isOpen={isOpen}
      onClose={onClose}
      title={activity ? 'Edit Bath' : 'New Bath'}
    >
      <form onSubmit={handleSubmit}>
        <FormPageContent>
          <div className="space-y-4">
            {/* Time Input */}
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                name="time"
                type="datetime-local"
                value={formData.time}
                onChange={handleInputChange}
                required
              />
            </div>
            
            {/* Bath Options */}
            <div className="space-y-2">
              <Label>Bath Options</Label>
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="soapUsed"
                    checked={formData.soapUsed}
                    onCheckedChange={(checked) => 
                      handleCheckboxChange('soapUsed', checked as boolean)
                    }
                    variant="success"
                  />
                  <Label htmlFor="soapUsed" className="cursor-pointer">Soap Used</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="shampooUsed"
                    checked={formData.shampooUsed}
                    onCheckedChange={(checked) => 
                      handleCheckboxChange('shampooUsed', checked as boolean)
                    }
                    variant="success"
                  />
                  <Label htmlFor="shampooUsed" className="cursor-pointer">Shampoo Used</Label>
                </div>
              </div>
            </div>
            

            
            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Enter any notes about the bath"
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
              {loading ? 'Saving...' : activity ? 'Update' : 'Save'}
            </Button>
          </div>
        </FormPageFooter>
      </form>
    </FormPage>
  );
}
