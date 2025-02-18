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
  const [showDialog, setShowDialog] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState<number | null>(null);

  // Reset unlock timer on activity
  useEffect(() => {
    const handleActivity = () => {
      const unlockTime = localStorage.getItem('unlockTime');
      if (unlockTime) {
        localStorage.setItem('unlockTime', Date.now().toString());
      }
    };

    // Add listeners for user activity
    window.addEventListener('click', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('touchstart', handleActivity);

    return () => {
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
    };
  }, []);

  // Check if the app is unlocked or locked out on mount
  useEffect(() => {
    const unlockTime = localStorage.getItem('unlockTime');
    const storedLockoutTime = localStorage.getItem('lockoutTime');
    const storedAttempts = localStorage.getItem('attempts');

    if (storedLockoutTime) {
      const lockoutEnd = parseInt(storedLockoutTime);
      if (Date.now() < lockoutEnd) {
        setLockoutTime(lockoutEnd);
        setShowDialog(true);
      } else {
        localStorage.removeItem('lockoutTime');
        localStorage.removeItem('attempts');
        setAttempts(0);
      }
    }

    if (storedAttempts) {
      setAttempts(parseInt(storedAttempts));
    }

    if (!unlockTime || Date.now() - parseInt(unlockTime) > 60 * 1000) {
      setShowDialog(true);
      localStorage.removeItem('unlockTime');
    }
  }, []);

  // Update lockout timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (lockoutTime) {
      timer = setInterval(() => {
        if (Date.now() >= lockoutTime) {
          setLockoutTime(null);
          setAttempts(0);
          localStorage.removeItem('lockoutTime');
          localStorage.removeItem('attempts');
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [lockoutTime]);

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
    if (lockoutTime) return; // Prevent input during lockout

    const newPin = pin + number;
    if (newPin.length <= 10) {
      setPin(newPin);
      setError('');

      // Check if the entered PIN matches at any point
      if (newPin === correctPin) {
        // Store unlock time and hide dialog
        localStorage.setItem('unlockTime', Date.now().toString());
        localStorage.removeItem('attempts');
        setAttempts(0);
        onUnlock();
        setShowDialog(false);
      } else if (newPin.length >= 6 && newPin.length >= correctPin.length) {
        // Only count as an attempt if they've entered at least 6 digits
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        localStorage.setItem('attempts', newAttempts.toString());

        // After 3 failed attempts, lock out for 5 minutes
        if (newAttempts >= 3) {
          const lockoutEnd = Date.now() + 5 * 60 * 1000; // 5 minutes
          setLockoutTime(lockoutEnd);
          localStorage.setItem('lockoutTime', lockoutEnd.toString());
          setError('Too many attempts. Try again in 5 minutes.');
        } else {
          setError(`Incorrect PIN (${3 - newAttempts} attempts remaining)`);
        }
        setPin('');
      }
    }
  };

  const handleDelete = () => {
    if (!lockoutTime) {
      setPin(pin.slice(0, -1));
      setError('');
    }
  };

  const formatTimeRemaining = (lockoutTime: number) => {
    const remaining = Math.ceil((lockoutTime - Date.now()) / 1000);
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={showDialog} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" aria-describedby="pin-description" hideClose>
        <DialogHeader className="text-center">
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
            {pin.length === 0 ? (
              // Show 5 placeholder dots when no input
              Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-full bg-gray-200/50"
                />
              ))
            ) : (
              // Show actual number of dots for entered digits
              Array.from({ length: pin.length }).map((_, i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-full bg-teal-600"
                />
              ))
            )}
          </div>
          
          {error && (
            <p className="text-red-500 text-sm">
              {error}
              {lockoutTime && ` (${formatTimeRemaining(lockoutTime)})`}
            </p>
          )}

          {/* Number Pad */}
          <div className="grid grid-cols-3 gap-4 w-full max-w-[240px]">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((number) => (
              <Button
                key={number}
                variant="outline"
                className="w-14 h-14 text-xl font-semibold rounded-xl hover:bg-teal-50 disabled:opacity-50"
                onClick={() => handleNumberClick(number.toString())}
                disabled={!!lockoutTime}
              >
                {number}
              </Button>
            ))}
            <Button
              variant="outline"
              className="w-14 h-14 text-xl font-semibold rounded-xl hover:bg-red-50 disabled:opacity-50"
              onClick={handleDelete}
              disabled={!!lockoutTime}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
