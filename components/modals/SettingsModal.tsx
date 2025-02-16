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

// List of common timezones
const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Anchorage',
  'America/Honolulu',
  'America/Puerto_Rico',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
  'Pacific/Auckland',
].sort();

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  onBabySelect?: (babyId: string) => void;
  selectedBabyId?: string;
}

export default function SettingsModal({ 
  open, 
  onClose,
  onBabySelect,
  selectedBabyId 
}: SettingsModalProps) {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [babies, setBabies] = useState<Baby[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBabyModal, setShowBabyModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedBaby, setSelectedBaby] = useState<Baby | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
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
    const response = await fetch('/api/baby');
    if (response.ok) {
      const data = await response.json();
      setBabies(data.data);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="dialog-content max-w-2xl">
          <DialogHeader className="dialog-header">
            <DialogTitle className="dialog-title">Settings</DialogTitle>
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
            <div>
              <label className="form-label">Timezone</label>
              <Select
                disabled={loading}
                value={settings?.timezone || 'America/Chicago'}
                onValueChange={(timezone) => handleSettingsChange({ timezone })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((timezone) => (
                    <SelectItem key={timezone} value={timezone}>
                      {timezone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-4">Manage Babies</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Select 
                    value={selectedBabyId} 
                    onValueChange={(babyId) => onBabySelect?.(babyId)}
                  >
                    <SelectTrigger className="w-[200px]">
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
                  <Button variant="outline" onClick={() => {
                    setIsEditing(false);
                    setSelectedBaby(null);
                    setShowBabyModal(true);
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Baby
                  </Button>
                  {selectedBabyId && (
                    <Button variant="outline" onClick={() => {
                      const baby = babies.find(b => b.id === selectedBabyId);
                      setSelectedBaby(baby || null);
                      setIsEditing(true);
                      setShowBabyModal(true);
                    }}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Baby
                    </Button>
                  )}
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
