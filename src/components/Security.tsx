'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { X } from 'lucide-react';

interface SecurityProps {
  onUnlock: (caretakerId?: string) => void;
}

export default function Security({ onUnlock }: SecurityProps) {
  const [loginId, setLoginId] = useState<string>('');
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [showDialog, setShowDialog] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState<number | null>(null);
  const [authenticatedCaretakerId, setAuthenticatedCaretakerId] = useState<string | null>(null);
  const [showPinInput, setShowPinInput] = useState(false);
  const [hasCaretakers, setHasCaretakers] = useState(false);

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

  // Reset form when security screen appears
  useEffect(() => {
    if (showDialog) {
      setPin('');
      setLoginId('');
      setShowPinInput(false);
      setError('');
    }
  }, [showDialog]);

  // Check for inactivity and handle security state
  useEffect(() => {
    let inactivityTimer: NodeJS.Timeout;

    const checkSecurityState = () => {
      const unlockTime = localStorage.getItem('unlockTime');
      const storedLockoutTime = localStorage.getItem('lockoutTime');
      const storedAttempts = localStorage.getItem('attempts');

      // Handle lockout state
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

      // Check for inactivity
      if (!unlockTime) {
        setShowDialog(true);
      } else {
        const timeSinceUnlock = Date.now() - parseInt(unlockTime);
        if (timeSinceUnlock > 30 * 60 * 1000) { // 30 minutes inactivity
          setShowDialog(true);
          localStorage.removeItem('unlockTime');
          localStorage.removeItem('caretakerId');
          setAuthenticatedCaretakerId(null);
        }
      }
    };

    // Initial check
    checkSecurityState();

    // Set up continuous checking every second
    inactivityTimer = setInterval(checkSecurityState, 1000);

    return () => {
      clearInterval(inactivityTimer);
    };
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

  // Load authenticated caretaker from localStorage if available
  // and check if any caretakers exist
  useEffect(() => {
    const storedCaretakerId = localStorage.getItem('caretakerId');
    if (storedCaretakerId) {
      setAuthenticatedCaretakerId(storedCaretakerId);
    }

    // Check if any caretakers exist
    const checkCaretakers = async () => {
      try {
        const response = await fetch('/api/caretaker');
        if (response.ok) {
          const data = await response.json();
          setHasCaretakers(data.success && Array.isArray(data.data) && data.data.length > 0);
        }
      } catch (error) {
        console.error('Error checking caretakers:', error);
      }
    };
    
    checkCaretakers();
  }, []);

  const handleLoginIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 2) {
      setLoginId(value);
      setError('');
    }
  };

  const handleLoginIdSubmit = () => {
    if (loginId.length !== 2) {
      setError('Login ID must be exactly 2 characters');
      return;
    }
    
    setShowPinInput(true);
    setError('');
  };

  // Handle direct PIN entry (for system PIN when no caretakers exist)
  const handleDirectPinEntry = (number: string) => {
    if (lockoutTime) return; // Prevent input during lockout

    const newPin = pin + number;
    if (newPin.length <= 10) {
      setPin(newPin);
      setError('');

      // Check PIN length for automatic submission
      if (newPin.length >= 6) {
        handleAuthenticate(newPin);
      }
    }
  };

  const handleNumberClick = (number: string) => {
    if (lockoutTime) return; // Prevent input during lockout

    const newPin = pin + number;
    if (newPin.length <= 10) {
      setPin(newPin);
      setError('');

      // Check PIN length for automatic submission
      if (newPin.length >= 6) {
        handleAuthenticate(newPin);
      }
    }
  };

  const handleAuthenticate = async (currentPin: string) => {
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          loginId: hasCaretakers ? loginId : undefined,
          securityPin: currentPin,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Store unlock time and hide dialog
        localStorage.setItem('unlockTime', Date.now().toString());
        localStorage.setItem('caretakerId', data.data.id);
        localStorage.removeItem('attempts');
        setAttempts(0);
        setAuthenticatedCaretakerId(data.data.id);
        onUnlock(data.data.id);
        setShowDialog(false);
      } else {
        // Failed authentication attempt
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
          setError(`Invalid credentials (${3 - newAttempts} attempts remaining)`);
        }
        setPin('');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setError('Authentication failed. Please try again.');
      setPin('');
    }
  };

  const handleDelete = () => {
    if (!lockoutTime) {
      if (showPinInput) {
        setPin(pin.slice(0, -1));
      } else {
        setLoginId(loginId.slice(0, -1));
      }
      setError('');
    }
  };

  const handleBack = () => {
    setShowPinInput(false);
    setPin('');
    setError('');
  };

  const formatTimeRemaining = (lockoutTime: number) => {
    const remaining = Math.ceil((lockoutTime - Date.now()) / 1000);
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-white ${showDialog ? 'block' : 'hidden'}`}
      aria-describedby="pin-description"
    >
      <div className="w-full max-w-md mx-auto p-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold">Security Check</h2>
          <p id="pin-description" className="text-sm text-gray-500">
            {!hasCaretakers
              ? 'Please enter your system security PIN'
              : showPinInput 
                ? `Enter your security PIN for login ID: ${loginId}` 
                : 'Please enter your 2-character login ID'}
          </p>
        </div>
        <div className="flex flex-col items-center space-y-4 p-6">
          <div className="w-24 h-24 p-1 flex items-center justify-center">
            <Image
                      src="/acorn-128.png"
                      alt="Acorn Logo"
                      width={128}
                      height={128}
                      className="object-contain"
                      priority
                    />
          </div>
          
          {hasCaretakers && !showPinInput ? (
            // Login ID input (only show if caretakers exist)
            <div className="w-full max-w-[240px] mb-4">
              <Input
                value={loginId}
                onChange={handleLoginIdChange}
                className="text-center text-xl font-semibold"
                placeholder="ID"
                maxLength={2}
                autoFocus
                disabled={!!lockoutTime}
              />
              <Button 
                onClick={handleLoginIdSubmit}
                className="w-full mt-4"
                disabled={loginId.length !== 2 || !!lockoutTime}
              >
                Continue
              </Button>
            </div>
          ) : (
            // PIN input section
            <>
              <h2 className="text-xl font-semibold text-gray-900">Enter PIN</h2>
              
              {/* PIN Display */}
              <div className="flex gap-2 my-4">
                {pin.length === 0 ? (
                  // Show 6 placeholder dots when no input
                  Array.from({ length: 6 }).map((_, i) => (
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
              <Button 
                variant="ghost" 
                className="text-sm text-gray-500 mb-2"
                onClick={handleBack}
                disabled={!!lockoutTime}
              >
                Back to Login ID
              </Button>
            </>
          )}
          
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
                onClick={() => {
                  if (hasCaretakers && showPinInput) {
                    handleNumberClick(number.toString());
                  } else if (!hasCaretakers) {
                    handleDirectPinEntry(number.toString());
                  }
                }}
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
      </div>
    </div>
  );
}
