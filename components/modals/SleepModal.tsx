import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';

interface SleepModalProps {
  open: boolean;
  onClose: () => void;
  isSleeping: boolean;
  onSleepToggle: () => void;
}

export default function SleepModal({
  open,
  onClose,
  isSleeping,
  onSleepToggle,
}: SleepModalProps) {
  const [formData, setFormData] = useState({
    startTime: '',
    endTime: '',
    mood: '',
    location: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/sleep-log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to save sleep log');
      }

      onClose();
      if (!isSleeping) {
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
          <DialogTitle>{isSleeping ? 'Stop Sleep' : 'Start Sleep'}</DialogTitle>
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
            <label className="text-sm font-medium">Mood</label>
            <Select
              value={formData.mood}
              onValueChange={(value) => setFormData({ ...formData, mood: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select mood" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="happy">Happy</SelectItem>
                <SelectItem value="calm">Calm</SelectItem>
                <SelectItem value="fussy">Fussy</SelectItem>
                <SelectItem value="crying">Crying</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Location</label>
            <Select
              value={formData.location}
              onValueChange={(value) =>
                setFormData({ ...formData, location: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="crib">Crib</SelectItem>
                <SelectItem value="bed">Bed</SelectItem>
                <SelectItem value="stroller">Stroller</SelectItem>
                <SelectItem value="car">Car</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Notes</label>
            <Textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Add any additional notes..."
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {isSleeping ? 'Stop Sleep' : 'Start Sleep'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
