'use client';

import { useEffect, useState } from 'react';
import { Settings, Baby } from '@prisma/client';
import { Settings as SettingsIcon, Plus, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import BabyModal from '@/components/modals/BabyModal';


interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  onBabySelect?: (babyId: string) => void;
  onBabyStatusChange?: () => void;
  selectedBabyId?: string;
}

export default function SettingsModal({ 
  open, 
  onClose,
  onBabySelect,
  onBabyStatusChange,
  selectedBabyId 
}: SettingsModalProps) {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [babies, setBabies] = useState<Baby[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBabyModal, setShowBabyModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedBaby, setSelectedBaby] = useState<Baby | null>(null);
  const [localSelectedBabyId, setLocalSelectedBabyId] = useState<string | undefined>(selectedBabyId);

  useEffect(() => {
    setLocalSelectedBabyId(selectedBabyId);
  }, [selectedBabyId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [settingsResponse, babiesResponse] = await Promise.all([
        fetch('/api/settings'),
        fetch('/api/baby')
      ]);

      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json();
        setSettings(settingsData.data);
      }

      if (babiesResponse.ok) {
        const babiesData = await babiesResponse.json();
        setBabies(babiesData.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when modal opens
  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  const handleSettingsChange = async (updates: Partial<Settings>) => {
    try {
      const response = await fetch('/api/settings', {
        method: settings ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...settings, ...updates }),
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data.data);
      }
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  const handleBabyModalClose = async () => {
    setShowBabyModal(false);
    await fetchData(); // Refresh local babies list
    onBabyStatusChange?.(); // Refresh parent's babies list
  };

  return (
    <>
      <Dialog 
        open={open} 
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            onBabyStatusChange?.(); // Refresh parent's babies list when settings modal closes
          }
          onClose();
        }}
      >
        <DialogContent className="dialog-content max-w-2xl">
          <DialogHeader className="dialog-header">
            <DialogTitle className="dialog-title text-slate-800">Settings</DialogTitle>
            <DialogDescription className="dialog-description">
              Configure your preferences for the Baby Tracker app
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <label className="form-label">Family Name</label>
              <Input
                disabled={loading}
                value={settings?.familyName || ''}
                onChange={(e) => handleSettingsChange({ familyName: e.target.value })}
                placeholder="Enter family name"
                className="w-full"
              />
            </div>
            <div className="border-t border-slate-200 pt-6">
              <h3 className="form-label mb-4">Manage Babies</h3>
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="w-[200px]">
                    <Select 
                      value={localSelectedBabyId} 
                      onValueChange={(babyId) => {
                        setLocalSelectedBabyId(babyId);
                        onBabySelect?.(babyId);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a baby" />
                      </SelectTrigger>
                      <SelectContent>
                        {babies.map((baby) => (
                          <SelectItem key={baby.id} value={baby.id}>
                            {baby.firstName} {baby.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    variant="outline"
                    disabled={!localSelectedBabyId}
                    onClick={() => {
                      const baby = babies.find(b => b.id === localSelectedBabyId);
                      setSelectedBaby(baby || null);
                      setIsEditing(true);
                      setShowBabyModal(true);
                    }}
                  >
                    <Edit className="h-4 w-3 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setIsEditing(false);
                    setSelectedBaby(null);
                    setShowBabyModal(true);
                  }}>
                    <Plus className="h-4 w-3 mr-2" />
                    Add
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <BabyModal
        open={showBabyModal}
        onClose={handleBabyModalClose}
        isEditing={isEditing}
        baby={selectedBaby}
      />
    </>
  );
}
