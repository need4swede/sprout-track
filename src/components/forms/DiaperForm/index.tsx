'use client';

import React, { useState, useEffect } from 'react';
import { DiaperType } from '@prisma/client';
import { DiaperLogResponse } from '@/app/api/types';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select';
import { 
  FormPage, 
  FormPageContent, 
  FormPageFooter 
} from '@/src/components/ui/form-page';
import { useTimezone } from '@/app/context/timezone';

interface DiaperFormProps {
  isOpen: boolean;
  onClose: () => void;
  babyId: string | undefined;
  initialTime: string;
  activity?: DiaperLogResponse;
  onSuccess?: () => void;
}

export default function DiaperForm({
  isOpen,
  onClose,
  babyId,
  initialTime,
  activity,
  onSuccess,
}: DiaperFormProps) {
  const { formatDate } = useTimezone();
  const [formData, setFormData] = useState({
    time: initialTime,
    type: '' as DiaperType | '',
    condition: '',
    color: '',
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
          type: activity.type,
          condition: activity.condition || '',
          color: activity.color || '',
        });
      } else {
        // New entry mode
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!babyId) return;

    // Validate required fields
    if (!formData.type || !formData.time) {
      console.error('Required fields missing');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        babyId,
        time: formData.time, // Send the ISO string directly
        type: formData.type,
        condition: formData.condition || null,
        color: formData.color || null,
      };

      // Get auth token from localStorage
      const authToken = localStorage.getItem('authToken');

      const response = await fetch(`/api/diaper-log${activity ? `?id=${activity.id}` : ''}`, {
        method: activity ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken ? `Bearer ${authToken}` : '',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to save diaper log');
      }

      onClose();
      onSuccess?.();
      
      // Reset form data
      setFormData({
        time: initialTime,
        type: '' as DiaperType | '',
        condition: '',
        color: '',
      });
    } catch (error) {
      console.error('Error saving diaper log:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormPage
      isOpen={isOpen}
      onClose={onClose}
      title={activity ? 'Edit Diaper Change' : 'Log Diaper Change'}
      description={activity ? 'Update details about your baby\'s diaper change' : 'Record details about your baby\'s diaper change'}
    >
      <form onSubmit={handleSubmit}>
        <FormPageContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="form-label">Time</label>
                <Input
                  type="datetime-local"
                  value={formData.time}
                  onChange={(e) =>
                    setFormData({ ...formData, time: e.target.value })
                  }
                  className="w-full"
                  required
                  tabIndex={-1}
                  disabled={loading}
                />
              </div>
              <div>
                <label className="form-label">Type</label>
                <Select
                  value={formData.type || ''}
                  onValueChange={(value: DiaperType) =>
                    setFormData({ ...formData, type: value })
                  }
                  disabled={loading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WET">Wet</SelectItem>
                    <SelectItem value="DIRTY">Dirty</SelectItem>
                    <SelectItem value="BOTH">Wet and Dirty</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {formData.type && formData.type !== 'WET' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Condition</label>
                  <Select
                    value={formData.condition}
                    onValueChange={(value: string) =>
                      setFormData({ ...formData, condition: value })
                    }
                    disabled={loading}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NORMAL">Normal</SelectItem>
                      <SelectItem value="LOOSE">Loose</SelectItem>
                      <SelectItem value="FIRM">Firm</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="form-label">Color</label>
                  <Select
                    value={formData.color}
                    onValueChange={(value: string) =>
                      setFormData({ ...formData, color: value })
                    }
                    disabled={loading}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select color" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="YELLOW">Yellow</SelectItem>
                      <SelectItem value="BROWN">Brown</SelectItem>
                      <SelectItem value="GREEN">Green</SelectItem>
                      <SelectItem value="BLACK">Black</SelectItem>
                      <SelectItem value="RED">Red</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
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
            <Button type="submit" disabled={loading}>
              {activity ? 'Update' : 'Save'}
            </Button>
          </div>
        </FormPageFooter>
      </form>
    </FormPage>
  );
}
