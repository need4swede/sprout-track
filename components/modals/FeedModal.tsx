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
    time: new Date().toISOString().slice(0, 16),
    type: '' as FeedType | '',
    amount: '',
    side: '' as BreastSide | '',
    food: '',
  });

  useEffect(() => {
    // Update time with local timezone when modal opens
    const updateLocalTime = async () => {
      try {
        const response = await fetch('/api/timezone');
        if (!response.ok) throw new Error('Failed to get local time');
        const data = await response.json();
        
        if (data.success) {
          setFormData(prev => ({
            ...prev,
            time: data.data.localTime.slice(0, 16)
          }));
        }
      } catch (error) {
        console.error('Error updating local time:', error);
      }
    };

    if (open) {
      updateLocalTime();
    }
  }, [open]);

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

    try {
      // Convert time to UTC
      const timeResponse = await fetch('/api/timezone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date: formData.time }),
      });

      if (!timeResponse.ok) throw new Error('Failed to convert time');
      const timeData = await timeResponse.json();
      if (!timeData.success) throw new Error('Failed to convert time');

      const payload = {
        babyId,
        time: timeData.data.utcDate,
        type: formData.type,
        ...(formData.type === 'BREAST' && { side: formData.side }),
        ...(formData.type !== 'BREAST' && formData.amount && { amount: parseFloat(formData.amount) }),
        ...(formData.type === 'SOLIDS' && formData.food && { food: formData.food })
      };

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
      
      // Reset form data with current local time
      const newTimeResponse = await fetch('/api/timezone');
      if (!newTimeResponse.ok) throw new Error('Failed to get local time');
      const newTimeData = await newTimeResponse.json();
      
      setFormData({
        time: newTimeData.data.localTime.slice(0, 16),
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
      <DialogContent className="dialog-content">
        <DialogHeader className="dialog-header">
          <DialogTitle className="dialog-title">Log Feeding</DialogTitle>
          <DialogDescription className="dialog-description">
            Record what and when your baby ate
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              />
            </div>
            <div>
              <label className="form-label">Type</label>
              <Select
                value={formData.type}
                onValueChange={(value: FeedType) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BREAST">Breast</SelectItem>
                  <SelectItem value="BOTTLE">Bottle</SelectItem>
                  <SelectItem value="SOLIDS">Solid Food</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.type === 'BREAST' && (
            <div>
              <label className="form-label">Side</label>
              <Select
                value={formData.side}
                onValueChange={(value: BreastSide) =>
                  setFormData({ ...formData, side: value })
                }
              >
                <SelectTrigger className="w-full">
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
            <div>
              <label className="form-label">
                Amount {formData.type === 'SOLIDS' ? '(g)' : '(oz)'}
              </label>
              <Input
                type="number"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                className="w-full"
                step="0.1"
                min="0"
                placeholder={formData.type === 'SOLIDS' ? 'Enter grams' : 'Enter ounces'}
              />
            </div>
          )}

          {formData.type === 'SOLIDS' && (
            <div>
              <label className="form-label">Food</label>
              <Input
                value={formData.food}
                onChange={(e) =>
                  setFormData({ ...formData, food: e.target.value })
                }
                className="w-full"
                placeholder="e.g., Banana, Rice Cereal"
              />
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
              Save Feed
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
