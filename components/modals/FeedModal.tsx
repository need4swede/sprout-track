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
import { FeedType, BreastSide } from '@prisma/client';

interface FeedModalProps {
  open: boolean;
  onClose: () => void;
  babyId: string | undefined;
}

export default function FeedModal({
  open,
  onClose,
  babyId,
}: FeedModalProps) {
  const [formData, setFormData] = useState({
    time: new Date().toISOString().slice(0, 16), // Format: YYYY-MM-DDThh:mm
    type: '' as FeedType | '',
    amount: '',
    side: '' as BreastSide | '',
    food: '',
  });

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

    const payload = {
      babyId,
      time: new Date(formData.time),
      type: formData.type,
      ...(formData.type === 'BREAST' && { side: formData.side }),
      ...(formData.type !== 'BREAST' && formData.amount && { amount: parseFloat(formData.amount) }),
      ...(formData.type === 'SOLIDS' && formData.food && { food: formData.food })
    };

    try {
      const response = await fetch('/api/feed-log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to save feed log');
      }

      onClose();
      // Reset form data
      setFormData({
        time: new Date().toISOString().slice(0, 16),
        type: '' as FeedType | '',
        amount: '',
        side: '' as BreastSide | '',
        food: '',
      });
    } catch (error) {
      console.error('Error saving feed log:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log Feed</DialogTitle>
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
              onValueChange={(value: FeedType) =>
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BREAST">Breast</SelectItem>
                <SelectItem value="BOTTLE">Bottle</SelectItem>
                <SelectItem value="SOLIDS">Solid Food</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {formData.type === 'BREAST' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Side</label>
              <Select
                value={formData.side}
                onValueChange={(value: BreastSide) =>
                  setFormData({ ...formData, side: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select side" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LEFT">Left</SelectItem>
                  <SelectItem value="RIGHT">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          {formData.type !== 'BREAST' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Amount {formData.type === 'SOLIDS' ? '(g)' : '(ml)'}
              </label>
              <Input
                type="number"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                step="0.1"
                min="0"
              />
            </div>
          )}
          {formData.type === 'SOLIDS' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Food</label>
              <Input
                value={formData.food}
                onChange={(e) =>
                  setFormData({ ...formData, food: e.target.value })
                }
                placeholder="e.g., Banana, Rice Cereal"
              />
            </div>
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
