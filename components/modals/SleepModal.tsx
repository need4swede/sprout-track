import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { useState } from 'react';
import { SleepType, SleepQuality } from '@prisma/client';

interface SleepModalProps {
  open: boolean;
  onClose: () => void;
  isSleeping: boolean;
  onSleepToggle: () => void;
  babyId: string | undefined;
}

export default function SleepModal({
  open,
  onClose,
  isSleeping,
  onSleepToggle,
  babyId,
}: SleepModalProps) {
  const [formData, setFormData] = useState({
    startTime: new Date().toISOString().slice(0, 16), // Format: YYYY-MM-DDThh:mm
    endTime: '',
    type: 'NAP' as SleepType,
    location: '',
    quality: 'GOOD' as SleepQuality,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!babyId) return;

    // Validate quality is a valid SleepQuality value
    if (!Object.values(SleepQuality).includes(formData.quality)) {
      console.error('Invalid sleep quality value');
      return;
    }

    try {
      const response = await fetch('/api/sleep-log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          babyId,
          startTime: new Date(formData.startTime),
          endTime: formData.endTime ? new Date(formData.endTime) : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save sleep log');
      }

      onClose();
      if (isSleeping) {
        onSleepToggle();
      }
    } catch (error) {
      console.error('Error saving sleep log:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isSleeping ? 'End Sleep' : 'Start Sleep'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Start Time</label>
            <Input
              type="datetime-local"
              value={formData.startTime}
              onChange={(e) =>
                setFormData({ ...formData, startTime: e.target.value })
              }
              required
            />
          </div>
          {isSleeping && (
            <div className="space-y-2">
              <label className="text-sm font-medium">End Time</label>
              <Input
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) =>
                  setFormData({ ...formData, endTime: e.target.value })
                }
                required
              />
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium">Type</label>
            <Select
              value={formData.type}
              onValueChange={(value: SleepType) =>
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NAP">Nap</SelectItem>
                <SelectItem value="NIGHT_SLEEP">Night Sleep</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Location</label>
            <Input
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              placeholder="e.g., Crib, Car Seat"
            />
          </div>
          {isSleeping && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Quality</label>
              <Select
                value={formData.quality}
                onValueChange={(value: SleepQuality) =>
                  setFormData({ ...formData, quality: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select quality" />
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
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {isSleeping ? 'End Sleep' : 'Start Sleep'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
