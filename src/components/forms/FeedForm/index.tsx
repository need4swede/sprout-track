'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FeedType, BreastSide } from '@prisma/client';
import { FeedLogResponse } from '@/app/api/types';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import {
  FormPage, 
  FormPageContent, 
  FormPageFooter 
} from '@/src/components/ui/form-page';
import { Check } from 'lucide-react';

// Import subcomponents
import BreastFeedForm from './BreastFeedForm';
import BottleFeedForm from './BottleFeedForm';
import SolidsFeedForm from './SolidsFeedForm';

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
    unit: 'OZ', // Default unit
    side: '' as BreastSide | '',
    food: '',
    feedDuration: 0, // Duration in seconds for breastfeeding timer
    leftDuration: 0, // Duration in seconds for left breast
    rightDuration: 0, // Duration in seconds for right breast
    activeBreast: '' as 'LEFT' | 'RIGHT' | '', // Currently active breast for timer
  });
  const [loading, setLoading] = useState(false);
  const [defaultSettings, setDefaultSettings] = useState({
    defaultBottleUnit: 'OZ',
    defaultSolidsUnit: 'TBSP',
  });

  const fetchLastAmount = async (type: FeedType) => {
    if (!babyId) return;
    
    try {
      const response = await fetch(`/api/feed-log/last?babyId=${babyId}&type=${type}`);
      if (!response.ok) return;
      
      const data = await response.json();
      if (data.success && data.data?.amount) {
        setFormData(prev => ({
          ...prev,
          amount: data.data.amount.toString(),
          unit: data.data.unitAbbr || prev.unit
        }));
      }
    } catch (error) {
      console.error('Error fetching last amount:', error);
    }
  };

  // Fetch the last feed record to determine the last feed type
  const fetchLastFeedType = async () => {
    if (!babyId) return;
    
    try {
      const response = await fetch(`/api/feed-log/last?babyId=${babyId}`);
      if (!response.ok) return;
      
      const data = await response.json();
      if (data.success && data.data?.type) {
        // Set the last feed type
        setFormData(prev => ({
          ...prev,
          type: data.data.type,
          // For breast feeding, also set the side
          ...(data.data.type === 'BREAST' && { side: data.data.side || '' }),
          // For solids, also set the food
          ...(data.data.type === 'SOLIDS' && { food: data.data.food || '' })
        }));
        
        // If it's bottle feeding, also fetch the last amount
        if (data.data.type === 'BOTTLE') {
          // We'll fetch the amount in the useEffect when type changes
        }
      }
    } catch (error) {
      console.error('Error fetching last feed type:', error);
    }
  };

  const fetchDefaultSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (!response.ok) return;
      
      const data = await response.json();
      if (data.success && data.data) {
        setDefaultSettings({
          defaultBottleUnit: data.data.defaultBottleUnit || 'OZ',
          defaultSolidsUnit: data.data.defaultSolidsUnit || 'TBSP',
        });
        
        // Set the default unit from settings
        setFormData(prev => ({
          ...prev,
          unit: data.data.defaultBottleUnit || 'OZ'
        }));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
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
      // Fetch default settings when form opens
      fetchDefaultSettings();
      
      if (activity) {
        // Editing mode - populate with activity data
        // Calculate feedDuration from startTime and endTime if available for breastfeeding
        let feedDuration = 0;
        if (activity.type === 'BREAST' && activity.startTime && activity.endTime) {
          const start = new Date(activity.startTime);
          const end = new Date(activity.endTime);
          feedDuration = Math.floor((end.getTime() - start.getTime()) / 1000);
        }
        
        setFormData({
          time: formatDateForInput(initialTime),
          type: activity.type,
          amount: activity.amount?.toString() || '',
          unit: activity.unitAbbr || 
            (activity.type === 'BOTTLE' ? defaultSettings.defaultBottleUnit : 
             activity.type === 'SOLIDS' ? defaultSettings.defaultSolidsUnit : ''),
          side: activity.side || '',
          food: activity.food || '',
          feedDuration: feedDuration,
          leftDuration: activity.side === 'LEFT' ? feedDuration : 0,
          rightDuration: activity.side === 'RIGHT' ? feedDuration : 0,
          activeBreast: ''
        });
      } else {
        // New entry mode - set the time and fetch the last feed type
        setFormData(prev => ({
          ...prev,
          time: formatDateForInput(initialTime)
        }));
        
        // Fetch the last feed type to pre-populate the form
        fetchLastFeedType();
      }
    }
  }, [isOpen, initialTime, activity]);

  useEffect(() => {
    if (formData.type === 'BOTTLE' || formData.type === 'SOLIDS') {
      fetchLastAmount(formData.type);
      
      // Set the appropriate default unit based on feed type
      if (formData.type === 'BOTTLE') {
        setFormData(prev => ({ ...prev, unit: defaultSettings.defaultBottleUnit }));
      } else if (formData.type === 'SOLIDS') {
        setFormData(prev => ({ ...prev, unit: defaultSettings.defaultSolidsUnit }));
      }
    }
  }, [formData.type, babyId, defaultSettings.defaultBottleUnit, defaultSettings.defaultSolidsUnit]);

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
    const step = formData.unit === 'ML' ? 5 : 0.5;
    const newAmount = currentAmount + step;
    setFormData(prev => ({
      ...prev,
      amount: newAmount.toString()
    }));
  };

  const decrementAmount = () => {
    const currentAmount = parseFloat(formData.amount || '0');
    const step = formData.unit === 'ML' ? 5 : 0.5;
    if (currentAmount >= step) {
      const newAmount = currentAmount - step;
      setFormData(prev => ({
        ...prev,
        amount: newAmount.toString()
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
    
    // Stop timer if it's running
    if (isTimerRunning) {
      stopTimer();
    }

    setLoading(true);

    try {
      // Create a single entry for the selected breast side
      await createSingleFeedEntry();

      onClose();
      onSuccess?.();
      
      // Reset form data
      setFormData({
        time: initialTime,
        type: '' as FeedType | '',
        amount: '',
        unit: defaultSettings.defaultBottleUnit,
        side: '' as BreastSide | '',
        food: '',
        feedDuration: 0,
        leftDuration: 0,
        rightDuration: 0,
        activeBreast: ''
      });
    } catch (error) {
      console.error('Error saving feed log:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to create a single feed entry
  const createSingleFeedEntry = async () => {
    // Calculate start and end times for breastfeeding based on feedDuration
    let startTime, endTime;
    if (formData.type === 'BREAST' && formData.feedDuration > 0) {
      const timeDate = new Date(formData.time);
      endTime = new Date(timeDate);
      startTime = new Date(timeDate.getTime() - formData.feedDuration * 1000);
    }
    
    const payload = {
      babyId,
      time: formData.time, // Send the local time directly
      type: formData.type,
      ...(formData.type === 'BREAST' && { 
        side: formData.side,
        ...(startTime && { startTime: startTime.toISOString() }),
        ...(endTime && { endTime: endTime.toISOString() }),
        feedDuration: formData.type === 'BREAST' && formData.side === 'LEFT' ? formData.leftDuration : 
                      formData.type === 'BREAST' && formData.side === 'RIGHT' ? formData.rightDuration : 
                      formData.feedDuration // Use the appropriate duration
      }),
      ...((formData.type === 'BOTTLE' || formData.type === 'SOLIDS') && formData.amount && { 
        amount: parseFloat(formData.amount),
        unitAbbr: formData.unit
      }),
      ...(formData.type === 'SOLIDS' && formData.food && { food: formData.food })
    };

    // Get auth token from localStorage
    const authToken = localStorage.getItem('authToken');

    const response = await fetch(`/api/feed-log${activity ? `?id=${activity.id}` : ''}`, {
      method: activity ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authToken ? `Bearer ${authToken}` : '',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to save feed log');
    }

    return response;
  };

  // We've simplified the implementation to only use createSingleFeedEntry

  // This section is now handled in the createSingleFeedEntry and createBreastFeedingEntries functions

  // Timer functionality
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const startTimer = (breast: 'LEFT' | 'RIGHT') => {
    if (!isTimerRunning) {
      setIsTimerRunning(true);
      
      // Set the active breast if provided
      if (breast) {
        setFormData(prev => ({
          ...prev,
          activeBreast: breast
        }));
      }
      
      timerRef.current = setInterval(() => {
        setFormData(prev => {
          // Update the appropriate duration based on active breast
          if (prev.activeBreast === 'LEFT') {
            return {
              ...prev,
              leftDuration: prev.leftDuration + 1
            };
          } else if (prev.activeBreast === 'RIGHT') {
            return {
              ...prev,
              rightDuration: prev.rightDuration + 1
            };
          } else {
            // This case shouldn't happen with the simplified UI
            return prev;
          }
        });
      }, 1000);
    }
  };
  
  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsTimerRunning(false);
    
    // Reset active breast when stopping timer
    setFormData(prev => ({
      ...prev,
      activeBreast: ''
    }));
  };
  
  // Format time as hh:mm:ss
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].join(':');
  };
  
  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  return (
    <FormPage
      isOpen={isOpen}
      onClose={onClose}
      title={activity ? 'Edit Feeding' : 'Log Feeding'}
      description={activity ? 'Update what and when your baby ate' : 'Record what and when your baby ate'}
    >
      <form onSubmit={handleSubmit} className="h-full flex flex-col">
        <FormPageContent className="overflow-y-auto">
          <div className="space-y-4 pb-20">
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
                <div className="flex justify-between items-center gap-3 mt-2">
                  {/* Breast Feed Button */}
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'BREAST' })}
                    disabled={loading}
                    className={`relative flex flex-col items-center justify-center p-2 rounded-full w-24 h-24 transition-all ${formData.type === 'BREAST' 
                      ? 'bg-blue-100 ring-2 ring-blue-500 shadow-md' 
                      : 'bg-gray-50 hover:bg-gray-100'}`}
                  >
                    <img 
                      src="/breastfeed-128.png" 
                      alt="Breast Feed" 
                      className="w-16 h-16 object-contain" 
                    />
                    <span className="text-xs font-medium mt-1">Breast</span>
                    {formData.type === 'BREAST' && (
                      <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-1">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </button>
                  
                  {/* Bottle Feed Button */}
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'BOTTLE' })}
                    disabled={loading}
                    className={`relative flex flex-col items-center justify-center p-2 rounded-full w-24 h-24 transition-all ${formData.type === 'BOTTLE' 
                      ? 'bg-blue-100 ring-2 ring-blue-500 shadow-md' 
                      : 'bg-gray-50 hover:bg-gray-100'}`}
                  >
                    <img 
                      src="/bottlefeed-128.png" 
                      alt="Bottle Feed" 
                      className="w-16 h-16 object-contain" 
                    />
                    <span className="text-xs font-medium mt-1">Bottle</span>
                    {formData.type === 'BOTTLE' && (
                      <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-1">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </button>
                  
                  {/* Solids Button */}
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'SOLIDS' })}
                    disabled={loading}
                    className={`relative flex flex-col items-center justify-center p-2 rounded-full w-24 h-24 transition-all ${formData.type === 'SOLIDS' 
                      ? 'bg-blue-100 ring-2 ring-blue-500 shadow-md' 
                      : 'bg-gray-50 hover:bg-gray-100'}`}
                  >
                    <img 
                      src="/solids-128.png" 
                      alt="Solids" 
                      className="w-16 h-16 object-contain" 
                    />
                    <span className="text-xs font-medium mt-1">Solids</span>
                    {formData.type === 'SOLIDS' && (
                      <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-1">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </div>
            
            {formData.type === 'BREAST' && (
              <BreastFeedForm
                side={formData.side}
                leftDuration={formData.leftDuration}
                rightDuration={formData.rightDuration}
                activeBreast={formData.activeBreast}
                isTimerRunning={isTimerRunning}
                loading={loading}
                onSideChange={(side) => setFormData({ ...formData, side })}
                onTimerStart={startTimer}
                onTimerStop={stopTimer}
                onDurationChange={(breast, seconds) => {
                  if (breast === 'LEFT') {
                    setFormData(prev => ({ ...prev, leftDuration: seconds }));
                  } else if (breast === 'RIGHT') {
                    setFormData(prev => ({ ...prev, rightDuration: seconds }));
                  }
                }}
              />
            )}
            
            {formData.type === 'BOTTLE' && (
              <BottleFeedForm
                amount={formData.amount}
                unit={formData.unit}
                loading={loading}
                onAmountChange={handleAmountChange}
                onUnitChange={(unit) => setFormData(prev => ({ ...prev, unit }))}
                onIncrement={incrementAmount}
                onDecrement={decrementAmount}
              />
            )}
            
            {formData.type === 'SOLIDS' && (
              <SolidsFeedForm
                amount={formData.amount}
                unit={formData.unit}
                food={formData.food}
                loading={loading}
                onAmountChange={handleAmountChange}
                onUnitChange={(unit) => setFormData(prev => ({ ...prev, unit }))}
                onFoodChange={(food) => setFormData({ ...formData, food })}
                onIncrement={incrementAmount}
                onDecrement={decrementAmount}
              />
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
