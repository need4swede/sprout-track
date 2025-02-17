import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useState, useEffect } from 'react';

interface NoteModalProps {
  open: boolean;
  onClose: () => void;
  babyId: string | undefined;
  initialTime: string;
}

export default function NoteModal({
  open,
  onClose,
  babyId,
  initialTime,
}: NoteModalProps) {
  const [formData, setFormData] = useState({
    time: new Date().toISOString().slice(0, 16),
    content: '',
    category: '',
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
    if (!formData.content || !formData.time) {
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
        content: formData.content,
        category: formData.category || null,
      };

      const response = await fetch('/api/note', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to save note');
      }

      onClose();
      
      // Reset form data with current local time
      const newTimeResponse = await fetch('/api/timezone');
      if (!newTimeResponse.ok) throw new Error('Failed to get local time');
      const newTimeData = await newTimeResponse.json();
      
      setFormData({
        time: newTimeData.data.localTime.slice(0, 16),
        content: '',
        category: '',
      });
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="dialog-content">
        <DialogHeader className="dialog-header">
          <DialogTitle className="dialog-title">Add Note</DialogTitle>
          <DialogDescription className="dialog-description">
            Record a note about your baby
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
              <label className="form-label">Category</label>
              <Input
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full"
                placeholder="e.g., Milestone, Health, General"
              />
            </div>
          </div>

          <div>
            <label className="form-label">Note Content</label>
            <Textarea
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              className="w-full min-h-[100px]"
              placeholder="Enter your note here..."
              required
            />
          </div>

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
              Save Note
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
