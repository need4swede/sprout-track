import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState, useEffect } from 'react';
import { SleepType, SleepQuality, SleepLog } from '@prisma/client';

interface SleepModalProps {
  open: boolean;
  onClose: () => void;
  isSleeping: boolean;
  onSleepToggle: () => void;
  babyId: string | undefined;
  initialTime: string;
  activity?: SleepLog;
}

export default function SleepModal({
  open,
  onClose,
  isSleeping,
  onSleepToggle,
  babyId,
  initialTime,
  activity,
}: SleepModalProps) {
  const [formData, setFormData] = useState({
    startTime: new Date().toISOString().slice(0, 16),
    endTime: '',
    type: '' as SleepType | '',
    location: '',
    quality: '' as SleepQuality | '',
  });

  useEffect(() => {
    if (open) {
      if (activity) {
        // Editing mode - populate with activity data
        setFormData({
          startTime: new Date(activity.startTime).toISOString().slice(0, 16),
          endTime: activity.endTime ? new Date(activity.endTime).toISOString().slice(0, 16) : '',
          type: activity.type,
          location: activity.location || '',
          quality: activity.quality || '',
        });
      } else if (isSleeping && babyId) {
        // Ending sleep mode - fetch current sleep
        const fetchCurrentSleep = async () => {
          try {
            const response = await fetch(`/api/sleep-log?babyId=${babyId}`);
            if (!response.ok) return;
            
            const data = await response.json();
            if (!data.success) return;
            
            // Find the most recent sleep record without an end time
            const currentSleep = data.data.find((log: any) => !log.endTime);
            if (currentSleep) {
              setFormData(prev => ({
                ...prev,
                startTime: currentSleep.startTime.slice(0, 16),
                endTime: initialTime,
                type: currentSleep.type,
                location: currentSleep.location || '',
                quality: 'GOOD', // Default to GOOD when ending sleep
              }));
              return;
            }
          } catch (error) {
            console.error('Error fetching current sleep:', error);
          }
        };
        fetchCurrentSleep();
      } else {
        // Starting new sleep
        setFormData(prev => ({
          ...prev,
          startTime: initialTime,
          endTime: isSleeping ? initialTime : '',
          type: prev.type || 'NAP', // Default to NAP if not set
          location: prev.location,
          quality: isSleeping ? 'GOOD' : prev.quality,
        }));
      }
    } else {
      // Reset form when modal closes
      setFormData({
        startTime: initialTime,
        endTime: '',
        type: '' as SleepType | '',
        location: '',
        quality: '' as SleepQuality | '',
      });
    }
  }, [open, initialTime, isSleeping, babyId, activity?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!babyId) return;

    // Validate required fields
    if (!formData.type || !formData.startTime || (isSleeping && !formData.endTime)) {
      console.error('Required fields missing');
      return;
    }

    try {
      // Convert times to UTC
      const startTimeResponse = await fetch('/api/timezone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date: formData.startTime }),
      });

      if (!startTimeResponse.ok) throw new Error('Failed to convert start time');
      const startTimeData = await startTimeResponse.json();
      if (!startTimeData.success) throw new Error('Failed to convert start time');

      let endTimeUtc = null;
      if (formData.endTime) {
        const endTimeResponse = await fetch('/api/timezone', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ date: formData.endTime }),
        });

        if (!endTimeResponse.ok) throw new Error('Failed to convert end time');
        const endTimeData = await endTimeResponse.json();
        if (!endTimeData.success) throw new Error('Failed to convert end time');
        endTimeUtc = endTimeData.data.utcDate;
      }

      let response;
      
      if (activity) {
        // Editing mode - update existing record
        const payload = {
          startTime: startTimeData.data.utcDate,
          endTime: endTimeUtc,
          type: formData.type,
          location: formData.location || null,
          quality: formData.quality || null,
          duration: endTimeUtc ? Math.round(
            (new Date(endTimeUtc).getTime() - new Date(startTimeData.data.utcDate).getTime()) / (1000 * 60)
          ) : null,
        };

        response = await fetch(`/api/sleep-log?id=${activity.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      } else if (isSleeping) {
        // Ending sleep - update existing record
        const sleepResponse = await fetch(`/api/sleep-log?babyId=${babyId}`);
        if (!sleepResponse.ok) throw new Error('Failed to fetch sleep logs');
        const sleepData = await sleepResponse.json();
        if (!sleepData.success) throw new Error('Failed to fetch sleep logs');
        
        const currentSleep = sleepData.data.find((log: any) => !log.endTime);
        if (!currentSleep) throw new Error('No ongoing sleep record found');

        const startTimeUtc = new Date(currentSleep.startTime);
        const sleepDuration = Math.round(
          (new Date(endTimeUtc).getTime() - startTimeUtc.getTime()) / (1000 * 60)
        );

        response = await fetch(`/api/sleep-log?id=${currentSleep.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            endTime: endTimeUtc,
            duration: sleepDuration,
            quality: formData.quality || null,
          }),
        });
      } else {
        // Starting new sleep
        const payload = {
          babyId,
          startTime: startTimeData.data.utcDate,
          endTime: null,
          duration: null,
          type: formData.type,
          location: formData.location || null,
          quality: null,
        };

        response = await fetch('/api/sleep-log', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        throw new Error('Failed to save sleep log');
      }

      onClose();
      if (!activity) onSleepToggle(); // Only toggle sleep state when not editing
      
      // Reset form data with current local time
      const newTimeResponse = await fetch('/api/timezone');
      if (!newTimeResponse.ok) throw new Error('Failed to get local time');
      const newTimeData = await newTimeResponse.json();
      
      setFormData({
        startTime: newTimeData.data.localTime.slice(0, 16),
        endTime: '',
        type: '' as SleepType | '',
        location: '',
        quality: '' as SleepQuality | '',
      });
    } catch (error) {
      console.error('Error saving sleep log:', error);
    }
  };

  const isEditMode = !!activity;
  const title = isEditMode ? 'Edit Sleep Record' : (isSleeping ? 'End Sleep Session' : 'Start Sleep Session');
  const description = isEditMode 
    ? 'Update sleep record details'
    : (isSleeping ? 'Record when your baby woke up and how well they slept' : 'Record when your baby is going to sleep');

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="dialog-content">
        <DialogHeader className="dialog-header">
          <DialogTitle className="dialog-title">{title}</DialogTitle>
          <DialogDescription className="dialog-description">{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Start Time</label>
              <Input
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) =>
                  setFormData({ ...formData, startTime: e.target.value })
                }
                className="w-full"
                required
                tabIndex={-1}
                disabled={isSleeping && !isEditMode} // Only disabled when ending sleep and not editing
              />
            </div>
            {(isSleeping || isEditMode) && (
              <div>
                <label className="form-label">End Time</label>
                <Input
                  type="datetime-local"
                  value={formData.endTime || initialTime}
                  onChange={(e) =>
                    setFormData({ ...formData, endTime: e.target.value })
                  }
                  className="w-full"
                  required={isSleeping}
                  tabIndex={-1}
                />
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Type</label>
              <Select
                value={formData.type}
                onValueChange={(value: SleepType) =>
                  setFormData({ ...formData, type: value })
                }
                disabled={isSleeping && !isEditMode} // Only disabled when ending sleep and not editing
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NAP">Nap</SelectItem>
                  <SelectItem value="NIGHT_SLEEP">Night Sleep</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="form-label">Location</label>
              <Select
                value={formData.location}
                onValueChange={(value: string) =>
                  setFormData({ ...formData, location: value })
                }
                disabled={isSleeping && !isEditMode} // Only disabled when ending sleep and not editing
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CRIB">Crib</SelectItem>
                  <SelectItem value="CAR_SEAT">Car Seat</SelectItem>
                  <SelectItem value="PARENTS_BEDROOM">Parent's Bedroom</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {(isSleeping || (isEditMode && formData.endTime)) && (
            <div>
              <label className="form-label">Sleep Quality</label>
              <Select
                value={formData.quality}
                onValueChange={(value: SleepQuality) =>
                  setFormData({ ...formData, quality: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="How well did they sleep?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="POOR">Poor</SelectItem>
                  <SelectItem value="FAIR">Fair</SelectItem>
                  <SelectItem value="GOOD">Good</SelectItem>
                  <SelectItem value="EXCELLENT">Excellent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="flex justify-end gap-3 mt-8">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white hover:from-teal-700 hover:to-emerald-700"
            >
              {isEditMode ? 'Update Sleep' : (isSleeping ? 'End Sleep' : 'Start Sleep')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
