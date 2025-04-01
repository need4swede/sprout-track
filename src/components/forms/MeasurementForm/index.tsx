'use client';

import React, { useState, useEffect } from 'react';
import { MeasurementType } from '@prisma/client';
import { MeasurementResponse } from '@/app/api/types';
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
import { Textarea } from '@/src/components/ui/textarea';

interface MeasurementFormProps {
  isOpen: boolean;
  onClose: () => void;
  babyId: string | undefined;
  initialTime: string;
  activity?: MeasurementResponse;
  onSuccess?: () => void;
}

export default function MeasurementForm({
  isOpen,
  onClose,
  babyId,
  initialTime,
  activity,
  onSuccess,
}: MeasurementFormProps) {
  const { formatDate, toUTCString } = useTimezone();
  const [formData, setFormData] = useState({
    date: initialTime,
    type: '' as MeasurementType | '',
    value: '',
    unit: '',
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
          date: formatDateForInput(activity.date),
          type: activity.type,
          value: String(activity.value),
          unit: activity.unit,
          notes: activity.notes || '',
        });
      } else {
        // New entry mode
        setFormData(prev => ({
          ...prev,
          date: formatDateForInput(initialTime)
        }));
      }
      
      // Mark as initialized
      setIsInitialized(true);
    } else if (!isOpen) {
      // Reset initialization flag when form closes
      setIsInitialized(false);
    }
  }, [isOpen, initialTime, activity, isInitialized]);

  // Get default unit based on measurement type
  const getDefaultUnit = (type: MeasurementType): string => {
    switch (type) {
      case 'HEIGHT':
        return 'in';
      case 'WEIGHT':
        return 'lb';
      case 'HEAD_CIRCUMFERENCE':
        return 'in';
      case 'TEMPERATURE':
        return '°F';
      default:
        return '';
    }
  };

  // Handle measurement type change
  const handleTypeChange = (type: MeasurementType) => {
    setFormData(prev => ({
      ...prev,
      type,
      unit: prev.unit || getDefaultUnit(type)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!babyId) return;

    // Validate required fields
    if (!formData.type || !formData.date || !formData.value || !formData.unit) {
      console.error('Required fields missing');
      return;
    }

    setLoading(true);

    try {
      // Convert local time to UTC ISO string using the timezone context
      // Create a Date object from the local time string (interpreted in user's timezone)
      const localDate = new Date(formData.date);
      
      // Use the timezone context's toUTCString function to convert to UTC
      const utcDateString = toUTCString(localDate);

      const payload = {
        babyId,
        date: utcDateString,
        type: formData.type,
        value: parseFloat(formData.value),
        unit: formData.unit,
        notes: formData.notes || null,
      };

      // Get auth token from localStorage
      const authToken = localStorage.getItem('authToken');

      const response = await fetch(`/api/measurement-log${activity ? `?id=${activity.id}` : ''}`, {
        method: activity ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken ? `Bearer ${authToken}` : '',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to save measurement');
      }

      onClose();
      onSuccess?.();
      
      // Reset form data
      setFormData({
        date: initialTime,
        type: '' as MeasurementType | '',
        value: '',
        unit: '',
        notes: '',
      });
    } catch (error) {
      console.error('Error saving measurement:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get the appropriate label for the measurement type
  const getMeasurementTypeLabel = (type: MeasurementType): string => {
    switch (type) {
      case 'HEIGHT':
        return 'Height';
      case 'WEIGHT':
        return 'Weight';
      case 'HEAD_CIRCUMFERENCE':
        return 'Head Circumference';
      case 'TEMPERATURE':
        return 'Temperature';
      default:
        return type;
    }
  };

  // Get unit options based on measurement type
  const getUnitOptions = (type: MeasurementType): { value: string; label: string }[] => {
    switch (type) {
      case 'HEIGHT':
        return [
          { value: 'in', label: 'inches (in)' },
          { value: 'cm', label: 'centimeters (cm)' }
        ];
      case 'WEIGHT':
        return [
          { value: 'lb', label: 'pounds (lb)' },
          { value: 'kg', label: 'kilograms (kg)' },
          { value: 'oz', label: 'ounces (oz)' }
        ];
      case 'HEAD_CIRCUMFERENCE':
        return [
          { value: 'in', label: 'inches (in)' },
          { value: 'cm', label: 'centimeters (cm)' }
        ];
      case 'TEMPERATURE':
        return [
          { value: '°F', label: 'Fahrenheit (°F)' },
          { value: '°C', label: 'Celsius (°C)' }
        ];
      default:
        return [];
    }
  };

  return (
    <FormPage
      isOpen={isOpen}
      onClose={onClose}
      title={activity ? 'Edit Measurement' : 'Log Measurement'}
      description={activity ? 'Update details about your baby\'s measurement' : 'Record a new measurement for your baby'}
    >
      <form onSubmit={handleSubmit}>
        <FormPageContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="form-label">Date & Time</label>
                <Input
                  type="datetime-local"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full"
                  required
                  tabIndex={-1}
                  disabled={loading}
                />
              </div>
              <div>
                <label className="form-label">Measurement Type</label>
                <Select
                  value={formData.type || ''}
                  onValueChange={(value: MeasurementType) =>
                    handleTypeChange(value)
                  }
                  disabled={loading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HEIGHT">Height</SelectItem>
                    <SelectItem value="WEIGHT">Weight</SelectItem>
                    <SelectItem value="HEAD_CIRCUMFERENCE">Head Circumference</SelectItem>
                    <SelectItem value="TEMPERATURE">Temperature</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {formData.type && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Value</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.value}
                    onChange={(e) =>
                      setFormData({ ...formData, value: e.target.value })
                    }
                    className="w-full"
                    placeholder={`Enter ${getMeasurementTypeLabel(formData.type as MeasurementType).toLowerCase()}`}
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="form-label">Unit</label>
                  <Select
                    value={formData.unit}
                    onValueChange={(value: string) =>
                      setFormData({ ...formData, unit: value })
                    }
                    disabled={loading}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {getUnitOptions(formData.type as MeasurementType).map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div>
              <label className="form-label">Notes (Optional)</label>
              <Textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="w-full"
                placeholder="Add any additional notes about this measurement"
                disabled={loading}
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
            <Button type="submit" disabled={loading}>
              {activity ? 'Update' : 'Save'}
            </Button>
          </div>
        </FormPageFooter>
      </form>
    </FormPage>
  );
}
