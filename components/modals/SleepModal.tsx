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
import { SleepType, SleepQuality } from '@prisma/client';

interface SleepModalProps {
  open: boolean;
  onClose: () => void;
  isSleeping: boolean;
  onSleepToggle: () => void;
  babyId: string | undefined;
  initialTime: string;
}

export default function SleepModal({
  open,
  onClose,
  isSleeping,
  onSleepToggle,
  babyId,
  initialTime,
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
      const fetchCurrentSleep = async () => {
        if (isSleeping && babyId) {
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
        }

        // If not sleeping or no current sleep found, set defaults
        setFormData(prev => ({
          ...prev,
          startTime: initialTime,
          endTime: isSleeping ? initialTime : '',
          type: prev.type || 'NAP', // Default to NAP if not set
          location: prev.location,
          quality: isSleeping ? 'GOOD' : prev.quality,
        }));
      };

      fetchCurrentSleep();
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
  }, [open, initialTime, isSleeping, babyId]);

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
      
      // When ending sleep, update the existing record instead of creating a new one
      if (isSleeping) {
        // Find the current sleep record to update
        const sleepResponse = await fetch(`/api/sleep-log?babyId=${babyId}`);
        if (!sleepResponse.ok) throw new Error('Failed to fetch sleep logs');
        const sleepData = await sleepResponse.json();
        if (!sleepData.success) throw new Error('Failed to fetch sleep logs');
        
        // Find the most recent sleep record without an end time
        const currentSleep = sleepData.data.find((log: any) => !log.endTime);
        if (!currentSleep) throw new Error('No ongoing sleep record found');

        // Calculate duration using the original start time
        const startTimeUtc = new Date(currentSleep.startTime);
        const sleepDuration = Math.round(
          (new Date(endTimeUtc).getTime() - startTimeUtc.getTime()) / (1000 * 60)
        );

        // Update the existing record
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
        // Create a new sleep record when starting sleep
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
      onSleepToggle(); // Toggle sleep state for both start and end
      
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="dialog-content">
        <DialogHeader className="dialog-header">
          <DialogTitle className="dialog-title">
            {isSleeping ? 'End Sleep Session' : 'Start Sleep Session'}
          </DialogTitle>
          <DialogDescription className="dialog-description">
            {isSleeping 
              ? "Record when your baby woke up and how well they slept" 
              : "Record when your baby is going to sleep"
            }
          </DialogDescription>
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
                disabled={isSleeping} // Can't change start time when ending sleep
              />
            </div>
            {isSleeping ? (
              <div>
                <label className="form-label">End Time</label>
                <Input
                  type="datetime-local"
                  value={formData.endTime || initialTime}
                  onChange={(e) =>
                    setFormData({ ...formData, endTime: e.target.value })
                  }
                  className="w-full"
                  required
                  tabIndex={-1}
                />
              </div>
            ) : null}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Type</label>
              <Select
                value={formData.type}
                onValueChange={(value: SleepType) =>
                  setFormData({ ...formData, type: value })
                }
                disabled={isSleeping} // Can't change type when ending sleep
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
                disabled={isSleeping}
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
          {isSleeping && (
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
              {isSleeping ? 'End Sleep' : 'Start Sleep'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
