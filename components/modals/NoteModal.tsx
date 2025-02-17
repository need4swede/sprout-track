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
import { NoteResponse } from '@/app/api/types';

interface NoteModalProps {
  open: boolean;
  onClose: () => void;
  babyId: string | undefined;
  initialTime: string;
  activity?: NoteResponse;
}

export default function NoteModal({
  open,
  onClose,
  babyId,
  initialTime,
  activity,
}: NoteModalProps) {
  const [formData, setFormData] = useState({
    time: initialTime,
    content: '',
    category: '',
  });

  useEffect(() => {
    if (open) {
      if (activity) {
        // Editing mode - populate with activity data
        setFormData({
          time: initialTime,
          content: activity.content,
          category: activity.category || '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!babyId) return;

    // Validate required fields
    if (!formData.content || !formData.time) {
      console.error('Required fields missing');
      return;
    }

    try {
      const payload = {
        babyId,
        time: formData.time,
        content: formData.content,
        category: formData.category || null,
      };

      const response = await fetch(`/api/note${activity ? `?id=${activity.id}` : ''}`, {
        method: activity ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to save note');
      }

      onClose();
      
      // Reset form data
      setFormData({
        time: initialTime,
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
          <DialogTitle className="dialog-title">
            {activity ? 'Edit Note' : 'Add Note'}
          </DialogTitle>
          <DialogDescription className="dialog-description">
            {activity ? 'Update your note about your baby' : 'Record a note about your baby'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
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
                className="w-full min-h-[100px] resize-none"
                placeholder="Enter your note here..."
                required
              />
            </div>
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
              {activity ? 'Update Note' : 'Save Note'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
