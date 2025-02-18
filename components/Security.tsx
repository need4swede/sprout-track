'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { X } from 'lucide-react';

interface SecurityProps {
  onUnlock: () => void;
}

export default function Security({ onUnlock }: SecurityProps) {
  const [pin, setPin] = useState<string>('');
  const [correctPin, setCorrectPin] = useState<string>('111222');
  const [error, setError] = useState<string>('');
  const [showDialog, setShowDialog] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data.securityPin) {
            setCorrectPin(data.data.securityPin);
          }
        }
      } catch (error) {
        console.error('Error fetching security pin:', error);
      }
    };
    fetchSettings();
  }, []);

  const handleNumberClick = (number: string) => {
    if (pin.length < 10) {
      const newPin = pin + number;
      setPin(newPin);
      setError('');

      if (newPin.length >= 6) {
        if (newPin === correctPin) {
          onUnlock();
          setShowDialog(false);
        } else if (newPin.length === correctPin.length) {
          setError('Incorrect PIN');
          setPin('');
        }
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
    setError('');
  };

  return (
    <Dialog open={showDialog} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" aria-describedby="pin-description">
        <DialogHeader>
          <DialogTitle>Security Check</DialogTitle>
          <DialogDescription id="pin-description">
            Please enter your PIN to access the app
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4 p-6">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-r from-teal-600 to-teal-700 p-4 flex items-center justify-center">
            <Image
              src="/Sprout-256.png"
              alt="Sprout Logo"
              width={64}
              height={64}
              className="object-contain"
              priority
            />
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900">Enter PIN</h2>
          
          {/* PIN Display */}
          <div className="flex gap-2 my-4">
            {Array.from({ length: correctPin.length }).map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${
                  i < pin.length ? 'bg-teal-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          {/* Number Pad */}
          <div className="grid grid-cols-3 gap-4 w-full max-w-[240px]">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((number) => (
              <Button
                key={number}
                variant="outline"
                className="w-14 h-14 text-xl font-semibold rounded-xl hover:bg-teal-50"
                onClick={() => handleNumberClick(number.toString())}
              >
                {number}
              </Button>
            ))}
            <Button
              variant="outline"
              className="w-14 h-14 text-xl font-semibold rounded-xl hover:bg-red-50"
              onClick={handleDelete}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
