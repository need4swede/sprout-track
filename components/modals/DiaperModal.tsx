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
    time: new Date().toISOString().slice(0, 16),
    type: '' as DiaperType | '',
    condition: '',
    color: '',
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
        condition: formData.condition || null,
        color: formData.color || null,
      };

      const response = await fetch('/api/diaper-log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to save diaper log');
      }

      onClose();
      
      // Reset form data with current local time
      const newTimeResponse = await fetch('/api/timezone');
      if (!newTimeResponse.ok) throw new Error('Failed to get local time');
      const newTimeData = await newTimeResponse.json();
      
      setFormData({
        time: newTimeData.data.localTime.slice(0, 16),
        type: '' as DiaperType | '',
        condition: '',
        color: '',
      });
    } catch (error) {
      console.error('Error saving diaper log:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="dialog-content">
        <DialogHeader className="dialog-header">
          <DialogTitle className="dialog-title">Log Diaper Change</DialogTitle>
          <DialogDescription className="dialog-description">
            Record details about your baby's diaper change
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
                value={formData.type || ''}
                onValueChange={(value: DiaperType) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WET">Wet</SelectItem>
                  <SelectItem value="DIRTY">Dirty</SelectItem>
                  <SelectItem value="BOTH">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {formData.type && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Condition</label>
                <Input
                  value={formData.condition}
                  onChange={(e) =>
                    setFormData({ ...formData, condition: e.target.value })
                  }
                  className="w-full"
                  placeholder="e.g., Normal, Loose"
                />
              </div>
              <div>
                <label className="form-label">Color</label>
                <Input
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  className="w-full"
                  placeholder="e.g., Yellow, Brown"
                />
              </div>
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
              Save Change
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
