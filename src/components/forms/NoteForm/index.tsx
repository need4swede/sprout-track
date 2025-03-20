'use client';

import React, { useState, useEffect, useRef } from 'react';
import { NoteResponse } from '@/app/api/types';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Textarea } from '@/src/components/ui/textarea';
import { 
  FormPage, 
  FormPageContent, 
  FormPageFooter 
} from '@/src/components/ui/form-page';
import { useTimezone } from '@/app/context/timezone';

interface NoteFormProps {
  isOpen: boolean;
  onClose: () => void;
  babyId: string | undefined;
  initialTime: string;
  activity?: NoteResponse;
  onSuccess?: () => void;
}

export default function NoteForm({
  isOpen,
  onClose,
  babyId,
  initialTime,
  activity,
  onSuccess,
}: NoteFormProps) {
  const { formatDate } = useTimezone();
  const [formData, setFormData] = useState({
    time: initialTime,
    content: '',
    category: '',
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter categories based on input
  const filteredCategories = categories.filter(category =>
    category.toLowerCase().includes(formData.category.toLowerCase())
  );

  useEffect(() => {
    // Fetch existing categories
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/note?categories=true');
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        if (data.success) {
          setCategories(data.data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Reset selected index when input changes
  useEffect(() => {
    setSelectedIndex(-1);
  }, [formData.category]);

  // Format date string to be compatible with datetime-local input
  const formatDateForInput = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    
    // Format as YYYY-MM-DDThh:mm in local time
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  useEffect(() => {
    if (isOpen && !isInitialized) {
      if (activity) {
        // Editing mode - populate with activity data
        setFormData({
          time: formatDateForInput(activity.time),
          content: activity.content,
          category: activity.category || '',
        });
      } else {
        // New entry mode
        setFormData(prev => ({
          ...prev,
          time: formatDateForInput(initialTime)
        }));
      }
      
      // Mark as initialized
      setIsInitialized(true);
    } else if (!isOpen) {
      // Reset initialization flag when form closes
      setIsInitialized(false);
    }
  }, [isOpen, initialTime, activity, isInitialized]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!babyId) return;

    // Validate required fields
    if (!formData.content || !formData.time) {
      console.error('Required fields missing');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        babyId,
        time: formData.time, // Send the ISO string directly
        content: formData.content,
        category: formData.category || null,
      };

      // Get auth token from localStorage
      const authToken = localStorage.getItem('authToken');

      const response = await fetch(`/api/note${activity ? `?id=${activity.id}` : ''}`, {
        method: activity ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken ? `Bearer ${authToken}` : '',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to save note');
      }

      onClose();
      onSuccess?.();
      
      // Reset form data
      setFormData({
        time: initialTime,
        content: '',
        category: '',
      });
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (category: string) => {
    setFormData(prev => ({ ...prev, category }));
    setShowDropdown(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || filteredCategories.length === 0) return;

    // Handle arrow keys for navigation
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < filteredCategories.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleCategorySelect(filteredCategories[selectedIndex]);
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  return (
    <FormPage
      isOpen={isOpen}
      onClose={onClose}
      title={activity ? 'Edit Note' : 'Add Note'}
      description={activity ? 'Update your note about your baby' : 'Record a note about your baby'}
    >
      <form onSubmit={handleSubmit}>
        <FormPageContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  disabled={loading}
                />
              </div>
              <div>
                <label className="form-label">Category</label>
                <div className="relative">
                  <Input
                    ref={inputRef}
                    value={formData.category}
                    onChange={(e) => {
                      setFormData({ ...formData, category: e.target.value });
                      setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    onKeyDown={handleKeyDown}
                    className="w-full"
                    placeholder="Enter category"
                    disabled={loading}
                  />
                  {showDropdown && filteredCategories.length > 0 && (
                    <div 
                      ref={dropdownRef}
                      className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
                    >
                      {filteredCategories.map((category, index) => (
                        <div
                          key={category}
                          className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                            index === selectedIndex ? 'bg-gray-100' : ''
                          }`}
                          onClick={() => handleCategorySelect(category)}
                        >
                          {category}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div>
              <label className="form-label">Note</label>
              <Textarea
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                className="w-full min-h-[150px]"
                placeholder="Enter your note"
                required
                disabled={loading}
              />
            </div>
          </div>
        </FormPageContent>
        <FormPageFooter>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {activity ? 'Update' : 'Save'}
            </Button>
          </div>
        </FormPageFooter>
      </form>
    </FormPage>
  );
}
