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
import { DiaperType } from '@prisma/client';

interface DiaperModalProps {
  open: boolean;
  onClose: () => void;
  babyId: string | undefined;
}

export default function DiaperModal({
  open,
  onClose,
  babyId,
}: DiaperModalProps) {
  const [formData, setFormData] = useState({
    time: new Date().toISOString().slice(0, 16), // Format: YYYY-MM-DDThh:mm
    type: '' as DiaperType | '',
    condition: '',
    color: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!babyId) return;

    try {
      const response = await fetch('/api/diaper-log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          babyId,
          time: new Date(formData.time),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save diaper log');
      }

      onClose();
    } catch (error) {
      console.error('Error saving diaper log:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log Diaper Change</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Time</label>
            <Input
              type="datetime-local"
              value={formData.time}
              onChange={(e) =>
                setFormData({ ...formData, time: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Type</label>
            <Select
              value={formData.type}
              onValueChange={(value: DiaperType) =>
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="WET">Wet</SelectItem>
                <SelectItem value="DIRTY">Dirty</SelectItem>
                <SelectItem value="MIXED">Mixed</SelectItem>
                <SelectItem value="DRY">Dry</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {formData.type !== 'DRY' && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Condition</label>
                <Input
                  value={formData.condition}
                  onChange={(e) =>
                    setFormData({ ...formData, condition: e.target.value })
                  }
                  placeholder="e.g., Normal, Loose"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Color</label>
                <Input
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  placeholder="e.g., Yellow, Brown"
                />
              </div>
            </>
          )}
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
