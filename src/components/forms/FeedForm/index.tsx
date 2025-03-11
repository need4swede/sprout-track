'use client';

import React, { useState, useEffect, useRef } from 'react';
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
import { Plus, Minus, Play, Pause, Check } from 'lucide-react';

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
          feedDuration: formData.feedDuration // Include feedDuration directly
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
      });
    } catch (error) {
      console.error('Error saving feed log:', error);
    } finally {
      setLoading(false);
    }
  };

  // Timer functionality
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const startTimer = () => {
    if (!isTimerRunning) {
      setIsTimerRunning(true);
      timerRef.current = setInterval(() => {
        setFormData(prev => ({
          ...prev,
          feedDuration: prev.feedDuration + 1
        }));
      }, 1000);
    }
  };
  
  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsTimerRunning(false);
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
              <>
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
                
                <div>
                  <label className="form-label">Duration</label>
                  <div className="flex flex-col space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-3xl font-medium text-center w-full tracking-wider">
                        {formatTime(formData.feedDuration)}
                      </div>
                    </div>
                    
                    {/* Editable time inputs */}
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className="flex flex-col items-center">
                        <label className="text-xs text-gray-500 mb-1">Hours</label>
                        <Input 
                          type="number" 
                          min="0"
                          max="23"
                          value={Math.floor(formData.feedDuration / 3600)}
                          onChange={(e) => {
                            const hours = parseInt(e.target.value) || 0;
                            const minutes = Math.floor((formData.feedDuration % 3600) / 60);
                            const seconds = formData.feedDuration % 60;
                            const newDuration = (hours * 3600) + (minutes * 60) + seconds;
                            setFormData(prev => ({ ...prev, feedDuration: newDuration }));
                          }}
                          className="w-16 text-center"
                          disabled={loading || isTimerRunning}
                        />
                      </div>
                      <div className="text-xl font-medium">:</div>
                      <div className="flex flex-col items-center">
                        <label className="text-xs text-gray-500 mb-1">Minutes</label>
                        <Input 
                          type="number" 
                          min="0"
                          max="59"
                          value={Math.floor((formData.feedDuration % 3600) / 60)}
                          onChange={(e) => {
                            const hours = Math.floor(formData.feedDuration / 3600);
                            const minutes = parseInt(e.target.value) || 0;
                            const seconds = formData.feedDuration % 60;
                            const newDuration = (hours * 3600) + (minutes * 60) + seconds;
                            setFormData(prev => ({ ...prev, feedDuration: newDuration }));
                          }}
                          className="w-16 text-center"
                          disabled={loading || isTimerRunning}
                        />
                      </div>
                      <div className="text-xl font-medium">:</div>
                      <div className="flex flex-col items-center">
                        <label className="text-xs text-gray-500 mb-1">Seconds</label>
                        <Input 
                          type="number" 
                          min="0"
                          max="59"
                          value={formData.feedDuration % 60}
                          onChange={(e) => {
                            const hours = Math.floor(formData.feedDuration / 3600);
                            const minutes = Math.floor((formData.feedDuration % 3600) / 60);
                            const seconds = parseInt(e.target.value) || 0;
                            const newDuration = (hours * 3600) + (minutes * 60) + seconds;
                            setFormData(prev => ({ ...prev, feedDuration: newDuration }));
                          }}
                          className="w-16 text-center"
                          disabled={loading || isTimerRunning}
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-center space-x-4">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={isTimerRunning ? stopTimer : startTimer}
                        disabled={loading}
                        className="bg-gradient-to-r from-teal-600 to-emerald-600 border-0 rounded-full h-14 w-14 flex items-center justify-center shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                      >
                        {isTimerRunning ? 
                          <Pause className="h-5 w-5 text-white" /> : 
                          <Play className="h-5 w-5 text-white" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
            
            {formData.type === 'BOTTLE' && (
              <div>
                <label className="form-label mb-6">Amount ({formData.unit === 'ML' ? 'ml' : 'oz'})</label>
                <div className="flex items-center justify-center mb-6">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={decrementAmount}
                    disabled={loading}
                    className="bg-gradient-to-r from-teal-600 to-emerald-600 border-0 rounded-full h-14 w-14 flex items-center justify-center shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                  >
                    <Minus className="h-5 w-5 text-white" />
                  </Button>
                  <Input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    className="w-24 mx-3 text-center"
                    placeholder="Amount"
                    min="0"
                    step={formData.unit === 'ML' ? '5' : '0.5'}
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={incrementAmount}
                    disabled={loading}
                    className="bg-gradient-to-r from-teal-600 to-emerald-600 border-0 rounded-full h-14 w-14 flex items-center justify-center shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                  >
                    <Plus className="h-5 w-5 text-white" />
                  </Button>
                </div>
                <div className="mt-2 flex space-x-2">
                  <Button
                    type="button"
                    variant={formData.unit === 'OZ' ? 'default' : 'outline'}
                    className="w-full"
                    onClick={() => setFormData(prev => ({ ...prev, unit: 'OZ' }))}
                    disabled={loading}
                  >
                    oz
                  </Button>
                  <Button
                    type="button"
                    variant={formData.unit === 'ML' ? 'default' : 'outline'}
                    className="w-full"
                    onClick={() => setFormData(prev => ({ ...prev, unit: 'ML' }))}
                    disabled={loading}
                  >
                    ml
                  </Button>
                </div>
              </div>
            )}
            
            {formData.type === 'SOLIDS' && (
              <>
                <div>
                  <label className="form-label mb-6">Amount ({formData.unit})</label>
                  <div className="flex items-center justify-center mb-6">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={decrementAmount}
                      disabled={loading}
                      className="bg-gradient-to-r from-teal-600 to-emerald-600 border-0 rounded-full h-14 w-14 flex items-center justify-center shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                    >
                      <Minus className="h-5 w-5 text-white" />
                    </Button>
                    <Input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      className="w-24 mx-3 text-center"
                      placeholder="Amount"
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
                      className="bg-gradient-to-r from-teal-600 to-emerald-600 border-0 rounded-full h-14 w-14 flex items-center justify-center shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                    >
                      <Plus className="h-5 w-5 text-white" />
                    </Button>
                  </div>
                  <div className="mt-2 flex space-x-2">
                    <Button
                      type="button"
                      variant={formData.unit === 'TBSP' ? 'default' : 'outline'}
                      className="w-full"
                      onClick={() => setFormData(prev => ({ ...prev, unit: 'TBSP' }))}
                      disabled={loading}
                    >
                      tbsp
                    </Button>
                    <Button
                      type="button"
                      variant={formData.unit === 'G' ? 'default' : 'outline'}
                      className="w-full"
                      onClick={() => setFormData(prev => ({ ...prev, unit: 'G' }))}
                      disabled={loading}
                    >
                      g
                    </Button>
                  </div>
                </div>
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
              </>
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
