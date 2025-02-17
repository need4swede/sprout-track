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
  initialTime: string;
}

export default function FeedModal({
  open,
  onClose,
  babyId,
  initialTime,
}: FeedModalProps) {
  const [formData, setFormData] = useState({
    time: new Date().toISOString().slice(0, 16),
    type: '' as FeedType | '',
    amount: '',
    side: '' as BreastSide | '',
    food: '',
  });

  useEffect(() => {
    if (open) {
      setFormData(prev => ({
        ...prev,
        time: initialTime
      }));
    }
  }, [open, initialTime]);

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
              <Select
                value={formData.amount}
                onValueChange={(value: string) =>
                  setFormData({ ...formData, amount: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={formData.type === 'SOLIDS' ? 'Select grams' : 'Select ounces'} />
                </SelectTrigger>
                <SelectContent>
                  {formData.type === 'SOLIDS' ? (
                    <>
                      <SelectItem value="30">30g</SelectItem>
                      <SelectItem value="60">60g</SelectItem>
                      <SelectItem value="90">90g</SelectItem>
                      <SelectItem value="120">120g</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="2">2 oz</SelectItem>
                      <SelectItem value="4">4 oz</SelectItem>
                      <SelectItem value="6">6 oz</SelectItem>
                      <SelectItem value="8">8 oz</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          {formData.type === 'SOLIDS' && (
            <div>
              <label className="form-label">Food</label>
              <Select
                value={formData.food}
                onValueChange={(value: string) =>
                  setFormData({ ...formData, food: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select food" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BANANA">Banana</SelectItem>
                  <SelectItem value="RICE_CEREAL">Rice Cereal</SelectItem>
                  <SelectItem value="PUREE">Puree</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
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
              Save Feed
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
