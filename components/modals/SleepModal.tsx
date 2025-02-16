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
              />
            </div>
            {isSleeping && (
              <div>
                <label className="form-label">End Time</label>
                <Input
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData({ ...formData, endTime: e.target.value })
                  }
                  className="w-full"
                  required
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
              <Input
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                className="w-full"
                placeholder="e.g., Crib, Car Seat"
              />
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
              className="hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700"
            >
              {isSleeping ? 'End Sleep' : 'Start Sleep'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
