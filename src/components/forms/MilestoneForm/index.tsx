'use client';

import React, { useState, useEffect } from 'react';
import { MilestoneCategory } from '@prisma/client';
import { MilestoneResponse } from '@/app/api/types';
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

interface MilestoneFormProps {
  isOpen: boolean;
  onClose: () => void;
  babyId: string | undefined;
  initialTime: string;
  activity?: MilestoneResponse;
  onSuccess?: () => void;
}

export default function MilestoneForm({
  isOpen,
  onClose,
  babyId,
  initialTime,
  activity,
  onSuccess,
}: MilestoneFormProps) {
  const { formatDate, toUTCString } = useTimezone();
  const [formData, setFormData] = useState({
    date: initialTime,
    title: '',
    description: '',
    category: '' as MilestoneCategory | '',
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
          title: activity.title,
          description: activity.description || '',
          category: activity.category,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!babyId) return;

    // Validate required fields
    if (!formData.title || !formData.date || !formData.category) {
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
        title: formData.title,
        description: formData.description || null,
        category: formData.category,
      };

      // Get auth token from localStorage
      const authToken = localStorage.getItem('authToken');

      const response = await fetch(`/api/milestone-log${activity ? `?id=${activity.id}` : ''}`, {
        method: activity ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken ? `Bearer ${authToken}` : '',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to save milestone');
      }

      onClose();
      onSuccess?.();
      
      // Reset form data
      setFormData({
        date: initialTime,
        title: '',
        description: '',
        category: '' as MilestoneCategory | '',
      });
    } catch (error) {
      console.error('Error saving milestone:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get the appropriate label for the milestone category
  const getMilestoneCategoryLabel = (category: MilestoneCategory): string => {
    switch (category) {
      case 'MOTOR':
        return 'Motor Skills';
      case 'COGNITIVE':
        return 'Cognitive Development';
      case 'SOCIAL':
        return 'Social & Emotional';
      case 'LANGUAGE':
        return 'Language & Communication';
      case 'CUSTOM':
        return 'Custom';
      default:
        return category;
    }
  };

  return (
    <FormPage
      isOpen={isOpen}
      onClose={onClose}
      title={activity ? 'Edit Milestone' : 'Log Milestone'}
      description={activity ? 'Update details about your baby\'s milestone' : 'Record a new milestone for your baby'}
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
                <label className="form-label">Category</label>
                <Select
                  value={formData.category || ''}
                  onValueChange={(value: MilestoneCategory) =>
                    setFormData({ ...formData, category: value })
                  }
                  disabled={loading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MOTOR">Motor Skills</SelectItem>
                    <SelectItem value="COGNITIVE">Cognitive Development</SelectItem>
                    <SelectItem value="SOCIAL">Social & Emotional</SelectItem>
                    <SelectItem value="LANGUAGE">Language & Communication</SelectItem>
                    <SelectItem value="CUSTOM">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <label className="form-label">Title</label>
              <Input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full"
                placeholder="Enter milestone title (e.g., First Steps, First Word)"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="form-label">Description (Optional)</label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full"
                placeholder="Add any additional details about this milestone"
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
