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
import { FeedType, BreastSide, FeedLog } from '@prisma/client';

interface FeedModalProps {
  open: boolean;
  onClose: () => void;
  babyId: string | undefined;
  initialTime: string;
  activity?: FeedLog;
}

export default function FeedModal({
  open,
  onClose,
  babyId,
  initialTime,
  activity,
}: FeedModalProps) {
  const [formData, setFormData] = useState({
    time: new Date().toISOString().slice(0, 16),
    type: '' as FeedType | '',
    amount: '',
    side: '' as BreastSide | '',
    food: '',
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
          amount: data.data.amount.toString()
        }));
      }
    } catch (error) {
      console.error('Error fetching last amount:', error);
    }
  };

  useEffect(() => {
    if (open) {
      if (activity) {
        // Editing mode - populate with activity data
        setFormData({
          time: new Date(activity.time).toISOString().slice(0, 16),
          type: activity.type,
          amount: activity.amount?.toString() || '',
          side: activity.side || '',
          food: activity.food || '',
        });
      } else {
        // New entry mode
        setFormData(prev => ({
          ...prev,
          time: initialTime
        }));
      }
    }
  }, [open, initialTime, activity]);

  useEffect(() => {
    if (formData.type === 'BOTTLE' || formData.type === 'SOLIDS') {
      fetchLastAmount(formData.type);
    }
  }, [formData.type, babyId]);

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
    setFormData(prev => ({
      ...prev,
      amount: (currentAmount + 1).toString()
    }));
  };

  const decrementAmount = () => {
    const currentAmount = parseFloat(formData.amount || '0');
    if (currentAmount > 0) {
      setFormData(prev => ({
        ...prev,
        amount: (currentAmount - 1).toString()
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

    try {
      const payload = {
        babyId,
        time: new Date(formData.time),
        type: formData.type,
        ...(formData.type === 'BREAST' && { side: formData.side }),
        ...((formData.type === 'BOTTLE' || formData.type === 'SOLIDS') && formData.amount && { amount: parseFloat(formData.amount) }),
        ...(formData.type === 'SOLIDS' && formData.food && { food: formData.food })
      };

      const response = await fetch(`/api/feed-log${activity ? `?id=${activity.id}` : ''}`, {
        method: activity ? 'PUT' : 'POST',
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
      <DialogContent className="dialog-content">
        <DialogHeader className="dialog-header">
          <DialogTitle className="dialog-title">
            {activity ? 'Edit Feeding' : 'Log Feeding'}
          </DialogTitle>
          <DialogDescription className="dialog-description">
            {activity ? 'Update what and when your baby ate' : 'Record what and when your baby ate'}
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

          {(formData.type === 'BOTTLE' || formData.type === 'SOLIDS') && (
            <div>
              <label className="form-label">
                Amount {formData.type === 'SOLIDS' ? '(g)' : '(oz)'}
              </label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={decrementAmount}
                  className="px-3"
                >
                  -
                </Button>
                <Input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className="w-full"
                  step="0.1"
                  min="0"
                  placeholder={formData.type === 'SOLIDS' ? 'Enter grams' : 'Enter ounces'}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={incrementAmount}
                  className="px-3"
                >
                  +
                </Button>
              </div>
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
              {activity ? 'Update Feed' : 'Save Feed'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
