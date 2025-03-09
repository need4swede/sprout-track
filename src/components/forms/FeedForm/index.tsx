'use client';

import React, { useState, useEffect } from 'react';
import { FeedType, BreastSide } from '@prisma/client';
import { FeedLogResponse } from '@/app/api/types';
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
import { Plus, Minus } from 'lucide-react';

interface FeedFormProps {
  isOpen: boolean;
  onClose: () => void;
  babyId: string | undefined;
  initialTime: string;
  activity?: FeedLogResponse;
  onSuccess?: () => void;
}

export default function FeedForm({
  isOpen,
  onClose,
  babyId,
  initialTime,
  activity,
  onSuccess,
}: FeedFormProps) {
  const [formData, setFormData] = useState({
    time: initialTime,
    type: '' as FeedType | '',
    amount: '',
    side: '' as BreastSide | '',
    food: '',
  });
  const [loading, setLoading] = useState(false);

  const fetchLastAmount = async (type: FeedType) => {
    if (!babyId) return;
    
    try {
      const response = await fetch(`/api/feed-log/last?babyId=${babyId}&type=${type}`);
      if (!response.ok) return;
      
      const data = await response.json();
      if (data.success && data.data?.amount) {
        setFormData(prev => ({
          ...prev,
          amount: data.data.amount.toString()
        }));
      }
    } catch (error) {
      console.error('Error fetching last amount:', error);
    }
  };

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
    if (isOpen) {
      if (activity) {
        // Editing mode - populate with activity data
        setFormData({
          time: formatDateForInput(initialTime),
          type: activity.type,
          amount: activity.amount?.toString() || '',
          side: activity.side || '',
          food: activity.food || '',
        });
      } else {
        // New entry mode
        setFormData(prev => ({
          ...prev,
          time: formatDateForInput(initialTime)
        }));
      }
    }
  }, [isOpen, initialTime, activity]);

  useEffect(() => {
    if (formData.type === 'BOTTLE' || formData.type === 'SOLIDS') {
      fetchLastAmount(formData.type);
    }
  }, [formData.type, babyId]);

  const handleAmountChange = (newAmount: string) => {
    // Ensure it's a valid number and not negative
    const numValue = parseFloat(newAmount);
    if (!isNaN(numValue) && numValue >= 0) {
      setFormData(prev => ({
        ...prev,
        amount: newAmount
      }));
    }
  };

  const incrementAmount = () => {
    const currentAmount = parseFloat(formData.amount || '0');
    setFormData(prev => ({
      ...prev,
      amount: (currentAmount + 1).toString()
    }));
  };

  const decrementAmount = () => {
    const currentAmount = parseFloat(formData.amount || '0');
    if (currentAmount > 0) {
      setFormData(prev => ({
        ...prev,
        amount: (currentAmount - 1).toString()
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!babyId) return;

    // Validate required fields
    if (!formData.type || !formData.time) {
      console.error('Required fields missing');
      return;
    }

    // Validate breast feeding side
    if (formData.type === 'BREAST' && !formData.side) {
      console.error('Side is required for breast feeding');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        babyId,
        time: formData.time, // Send the local time directly
        type: formData.type,
        ...(formData.type === 'BREAST' && { side: formData.side }),
        ...((formData.type === 'BOTTLE' || formData.type === 'SOLIDS') && formData.amount && { amount: parseFloat(formData.amount) }),
        ...(formData.type === 'SOLIDS' && formData.food && { food: formData.food })
      };

      const response = await fetch(`/api/feed-log${activity ? `?id=${activity.id}` : ''}`, {
        method: activity ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save feed log');
      }

      onClose();
      onSuccess?.();
      
      // Reset form data
      setFormData({
        time: initialTime,
        type: '' as FeedType | '',
        amount: '',
        side: '' as BreastSide | '',
        food: '',
      });
    } catch (error) {
      console.error('Error saving feed log:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormPage
      isOpen={isOpen}
      onClose={onClose}
      title={activity ? 'Edit Feeding' : 'Log Feeding'}
      description={activity ? 'Update what and when your baby ate' : 'Record what and when your baby ate'}
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
                  onValueChange={(value: FeedType) =>
                    setFormData({ ...formData, type: value })
                  }
                  disabled={loading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BREAST">Breast</SelectItem>
                    <SelectItem value="BOTTLE">Bottle</SelectItem>
                    <SelectItem value="SOLIDS">Solids</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {formData.type === 'BREAST' && (
              <div>
                <label className="form-label">Side</label>
                <Select
                  value={formData.side || ''}
                  onValueChange={(value: BreastSide) =>
                    setFormData({ ...formData, side: value })
                  }
                  disabled={loading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select side" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LEFT">Left</SelectItem>
                    <SelectItem value="RIGHT">Right</SelectItem>
                    <SelectItem value="BOTH">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {(formData.type === 'BOTTLE' || formData.type === 'SOLIDS') && (
              <div>
                <label className="form-label">Amount (oz)</label>
                <div className="flex items-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={decrementAmount}
                    disabled={loading}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    className="w-full mx-2"
                    placeholder="Enter amount"
                    min="0"
                    step="0.5"
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={incrementAmount}
                    disabled={loading}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            
            {formData.type === 'SOLIDS' && (
              <div>
                <label className="form-label">Food</label>
                <Input
                  value={formData.food}
                  onChange={(e) =>
                    setFormData({ ...formData, food: e.target.value })
                  }
                  className="w-full"
                  placeholder="Enter food"
                  disabled={loading}
                />
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
