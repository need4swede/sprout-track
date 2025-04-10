'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import { Calendar } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Calendar as CalendarComponent } from '@/src/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/src/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select';
import { Gender } from '@prisma/client';

interface SetupWizardProps {
  onComplete: () => void;
}

export default function SetupWizard({ onComplete }: SetupWizardProps) {
  const [stage, setStage] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Stage 1: Family setup
  const [familyName, setFamilyName] = useState('');
  
  // Stage 2: Security setup
  const [useSystemPin, setUseSystemPin] = useState(true);
  const [systemPin, setSystemPin] = useState('');
  const [confirmSystemPin, setConfirmSystemPin] = useState('');
  const [caretakers, setCaretakers] = useState<Array<{
    loginId: string;
    name: string;
    type: string;
    role: 'ADMIN' | 'USER';
    securityPin: string;
  }>>([]);
  const [newCaretaker, setNewCaretaker] = useState({
    loginId: '',
    name: '',
    type: '',
    role: 'ADMIN' as 'ADMIN' | 'USER', // Default to ADMIN for first caretaker
    securityPin: '',
  });
  
  // Stage 3: Baby setup
  const [babyFirstName, setBabyFirstName] = useState('');
  const [babyLastName, setBabyLastName] = useState('');
  const [babyBirthDate, setBabyBirthDate] = useState<Date | null>(null);
  const [babyGender, setBabyGender] = useState<Gender | ''>('');
  const [feedWarningTime, setFeedWarningTime] = useState('03:00');
  const [diaperWarningTime, setDiaperWarningTime] = useState('02:00');
  
  // Error handling
  const [error, setError] = useState('');

  const handleNext = async () => {
    setError('');
    
    if (stage === 1) {
      // Validate family name
      if (!familyName.trim()) {
        setError('Please enter a family name');
        return;
      }
      
      try {
        setLoading(true);
        // Save family name to settings
        const response = await fetch('/api/settings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            familyName,
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to save family name');
        }
        
        setStage(2);
      } catch (error) {
        console.error('Error saving family name:', error);
        setError('Failed to save family name. Please try again.');
      } finally {
        setLoading(false);
      }
    } else if (stage === 2) {
      // Validate security setup
      if (useSystemPin) {
        if (systemPin.length < 6 || systemPin.length > 10) {
          setError('PIN must be between 6 and 10 digits');
          return;
        }
        
        if (systemPin !== confirmSystemPin) {
          setError('PINs do not match');
          return;
        }
        
        try {
          setLoading(true);
          // Save system PIN to settings
          const response = await fetch('/api/settings', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              securityPin: systemPin,
            }),
          });
          
          if (!response.ok) {
            throw new Error('Failed to save security PIN');
          }
          
          setStage(3);
        } catch (error) {
          console.error('Error saving security PIN:', error);
          setError('Failed to save security PIN. Please try again.');
        } finally {
          setLoading(false);
        }
      } else {
        // Validate caretakers
        if (caretakers.length === 0) {
          setError('Please add at least one caretaker');
          return;
        }
        
        try {
          setLoading(true);
          // Save caretakers
          for (const caretaker of caretakers) {
            const response = await fetch('/api/caretaker', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(caretaker),
            });
            
            if (!response.ok) {
              throw new Error(`Failed to save caretaker: ${caretaker.name}`);
            }
          }
          
          setStage(3);
        } catch (error) {
          console.error('Error saving caretakers:', error);
          setError('Failed to save caretakers. Please try again.');
        } finally {
          setLoading(false);
        }
      }
    } else if (stage === 3) {
      // Validate baby information
      if (!babyFirstName.trim()) {
        setError('Please enter baby\'s first name');
        return;
      }
      
      if (!babyLastName.trim()) {
        setError('Please enter baby\'s last name');
        return;
      }
      
      if (!babyBirthDate) {
        setError('Please enter baby\'s birth date');
        return;
      }
      
      if (!babyGender) {
        setError('Please select baby\'s gender');
        return;
      }
      
      try {
        setLoading(true);
        // Save baby information
        const response = await fetch('/api/baby', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firstName: babyFirstName,
            lastName: babyLastName,
            birthDate: new Date(babyBirthDate),
            gender: babyGender,
            feedWarningTime,
            diaperWarningTime,
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to save baby information');
        }
        
        // Setup complete
        onComplete();
      } catch (error) {
        console.error('Error saving baby information:', error);
        setError('Failed to save baby information. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePrevious = () => {
    if (stage > 1) {
      setStage(stage - 1);
      setError('');
    }
  };

  const addCaretaker = () => {
    // Validate caretaker
    if (newCaretaker.loginId.length !== 2) {
      setError('Login ID must be exactly 2 characters');
      return;
    }
    
    if (!newCaretaker.name.trim()) {
      setError('Please enter caretaker name');
      return;
    }
    
    if (newCaretaker.securityPin.length < 6 || newCaretaker.securityPin.length > 10) {
      setError('PIN must be between 6 and 10 digits');
      return;
    }
    
    // Add caretaker to list
    setCaretakers([...caretakers, { ...newCaretaker }]);
    
    // Reset form
    setNewCaretaker({
      loginId: '',
      name: '',
      type: '',
      role: 'USER',
      securityPin: '',
    });
    
    setError('');
  };

  const removeCaretaker = (index: number) => {
    const updatedCaretakers = [...caretakers];
    updatedCaretakers.splice(index, 1);
    setCaretakers(updatedCaretakers);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-teal-50 to-white">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 mb-8">
        {/* Logo and Header */}
        <div className="flex flex-col items-center mb-6">
          <Image
            src="/sprout-1024.png"
            alt="Sprout Track Logo"
            width={100}
            height={100}
            className="mb-4"
          />
          <h1 className="text-2xl font-bold text-teal-700">Sprout Track</h1>
          <div className="w-full bg-gray-200 h-1 my-4 rounded-full">
            <div 
              className="bg-teal-500 h-1 rounded-full transition-all duration-300"
              style={{ width: `${(stage / 3) * 100}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500">Step {stage} of 3</p>
        </div>

        {/* Stage 1: Family Setup */}
        {stage === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">Welcome to Sprout Track!</h2>
            <p className="text-gray-600">
              Since this is a brand new setup, let's get started with some basic information.
            </p>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                What is your family name?
              </label>
              <Input
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                placeholder="Enter family name"
                className="w-full"
              />
            </div>
          </div>
        )}

        {/* Stage 2: Security Setup */}
        {stage === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">Security Setup</h2>
            
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="systemPin"
                checked={useSystemPin}
                onChange={() => setUseSystemPin(true)}
                className="h-4 w-4 text-teal-600 focus:ring-teal-500"
              />
              <label htmlFor="systemPin" className="text-sm font-medium text-gray-700">
                Use system-wide PIN
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="caretakers"
                checked={!useSystemPin}
                onChange={() => setUseSystemPin(false)}
                className="h-4 w-4 text-teal-600 focus:ring-teal-500"
              />
              <label htmlFor="caretakers" className="text-sm font-medium text-gray-700">
                Add caretakers with individual PINs
              </label>
            </div>
            
            {useSystemPin ? (
              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    System PIN (6-10 digits)
                  </label>
                  <Input
                    type="password"
                    value={systemPin}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 10) {
                        setSystemPin(value);
                      }
                    }}
                    placeholder="Enter PIN"
                    className="w-full"
                    minLength={6}
                    maxLength={10}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm PIN
                  </label>
                  <Input
                    type="password"
                    value={confirmSystemPin}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 10) {
                        setConfirmSystemPin(value);
                      }
                    }}
                    placeholder="Confirm PIN"
                    className="w-full"
                    minLength={6}
                    maxLength={10}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-md font-medium text-gray-800 mb-2">Add Caretaker</h3>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Login ID (2 chars)
                      </label>
                      <Input
                        value={newCaretaker.loginId}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value.length <= 2) {
                            setNewCaretaker({ ...newCaretaker, loginId: value });
                          }
                        }}
                        placeholder="ID"
                        className="w-full"
                        maxLength={2}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Role
                      </label>
                      <Select
                        value={newCaretaker.role}
                        onValueChange={(value) => 
                          setNewCaretaker({ 
                            ...newCaretaker, 
                            role: value as 'ADMIN' | 'USER' 
                          })
                        }
                        disabled={caretakers.length === 0} // Disable for first caretaker
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                          <SelectItem value="USER">User</SelectItem>
                        </SelectContent>
                      </Select>
                      {caretakers.length === 0 && (
                        <p className="text-xs text-amber-600 mt-1">
                          First caretaker must be an admin
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <Input
                      value={newCaretaker.name}
                      onChange={(e) => 
                        setNewCaretaker({ ...newCaretaker, name: e.target.value })
                      }
                      placeholder="Full name"
                      className="w-full"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Type (Optional)
                      </label>
                      <Input
                        value={newCaretaker.type}
                        onChange={(e) => 
                          setNewCaretaker({ ...newCaretaker, type: e.target.value })
                        }
                        placeholder="Parent, Nanny, etc."
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        PIN (6-10 digits)
                      </label>
                      <Input
                        type="password"
                        value={newCaretaker.securityPin}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          if (value.length <= 10) {
                            setNewCaretaker({ ...newCaretaker, securityPin: value });
                          }
                        }}
                        placeholder="PIN"
                        className="w-full"
                        minLength={6}
                        maxLength={10}
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={addCaretaker}
                    className="w-full"
                  >
                    Add Caretaker
                  </Button>
                </div>
                
                {caretakers.length > 0 && (
                  <div>
                    <h3 className="text-md font-medium text-gray-800 mb-2">Caretakers</h3>
                    <ul className="space-y-2">
                      {caretakers.map((caretaker, index) => (
                        <li key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                          <div>
                            <span className="font-medium">{caretaker.name}</span>
                            <span className="text-xs text-gray-500 ml-2">
                              ({caretaker.loginId}) - {caretaker.role}
                            </span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => removeCaretaker(index)}
                          >
                            Remove
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Stage 3: Baby Setup */}
        {stage === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">Add Your Baby</h2>
            <p className="text-gray-600">
              Now let's add information about your little one.
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <Input
                  value={babyFirstName}
                  onChange={(e) => setBabyFirstName(e.target.value)}
                  placeholder="First name"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <Input
                  value={babyLastName}
                  onChange={(e) => setBabyLastName(e.target.value)}
                  placeholder="Last name"
                  className="w-full"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Birth Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${!babyBirthDate && "text-gray-400"}`}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {babyBirthDate ? format(babyBirthDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={babyBirthDate}
                    onSelect={setBabyBirthDate}
                    maxDate={new Date()} // Can't select future dates
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <Select
                value={babyGender}
                onValueChange={(value) => setBabyGender(value as Gender)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Feed Warning Time
                </label>
                <Input
                  type="text"
                  pattern="[0-9]{2}:[0-9]{2}"
                  value={feedWarningTime}
                  onChange={(e) => setFeedWarningTime(e.target.value)}
                  placeholder="03:00"
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">Format: hh:mm</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Diaper Warning Time
                </label>
                <Input
                  type="text"
                  pattern="[0-9]{2}:[0-9]{2}"
                  value={diaperWarningTime}
                  onChange={(e) => setDiaperWarningTime(e.target.value)}
                  placeholder="02:00"
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">Format: hh:mm</p>
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mt-4 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={stage === 1 || loading}
          >
            {stage === 1 ? 'Cancel' : 'Previous'}
          </Button>
          <Button
            onClick={handleNext}
            disabled={loading}
          >
            {loading ? 'Processing...' : stage === 3 ? 'Complete Setup' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
}
