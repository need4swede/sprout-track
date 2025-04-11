'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/src/components/ui/button';
import { cn } from '@/src/lib/utils';
import { styles } from './setup-wizard.styles';
import { SetupWizardProps } from './setup-wizard.types';
import FamilySetupStage from './FamilySetupStage';
import SecuritySetupStage from './SecuritySetupStage';
import BabySetupStage from './BabySetupStage';
import { Gender } from '@prisma/client';
import './setup-wizard.css';

/**
 * SetupWizard Component
 * 
 * A multi-stage wizard component that guides users through the initial setup process
 * for the Sprout Track application.
 * 
 * @example
 * ```tsx
 * <SetupWizard onComplete={() => console.log('Setup complete!')} />
 * ```
 */
const SetupWizard: React.FC<SetupWizardProps> = ({ onComplete }) => {
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
  const [feedWarningTime, setFeedWarningTime] = useState('02:00');
  const [diaperWarningTime, setDiaperWarningTime] = useState('03:00');
  
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
        // Save family name to settings (update existing record)
        const response = await fetch('/api/settings', {
          method: 'PUT',
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
    <div className={cn(styles.container, "setup-wizard-container")}>
      <div className={cn(styles.formContainer, "setup-wizard-form-container")}>
        {/* Stage-specific image and Header */}
        <div className={cn(styles.headerContainer, "setup-wizard-header-container")}>
          <Image
            src={
              stage === 1 
                ? "/SetupFamily-1024.png" 
                : stage === 2 
                  ? "/SetupSecurity-1024.png" 
                  : "/SetupBaby-1024.png"
            }
            alt={
              stage === 1 
                ? "Family Setup" 
                : stage === 2 
                  ? "Security Setup" 
                  : "Baby Setup"
            }
            width={128}
            height={128}
            className={cn(styles.stageImage, "setup-wizard-stage-image")}
          />
          <h1 className={cn(styles.title, "setup-wizard-title")}>Sprout Track</h1>
          <div className={cn(styles.progressBar, "setup-wizard-progress-bar")}>
            <div 
              className={cn(styles.progressIndicator, "setup-wizard-progress-indicator")}
              style={{ width: `${(stage / 3) * 100}%` }}
            ></div>
          </div>
          <p className={cn(styles.stepIndicator, "setup-wizard-step-indicator")}>
            Step {stage} of 3
          </p>
        </div>

        {/* Stage 1: Family Setup */}
        {stage === 1 && (
          <FamilySetupStage
            familyName={familyName}
            setFamilyName={setFamilyName}
          />
        )}

        {/* Stage 2: Security Setup */}
        {stage === 2 && (
          <SecuritySetupStage
            useSystemPin={useSystemPin}
            setUseSystemPin={setUseSystemPin}
            systemPin={systemPin}
            setSystemPin={setSystemPin}
            confirmSystemPin={confirmSystemPin}
            setConfirmSystemPin={setConfirmSystemPin}
            caretakers={caretakers}
            setCaretakers={setCaretakers}
            newCaretaker={newCaretaker}
            setNewCaretaker={setNewCaretaker}
            addCaretaker={addCaretaker}
            removeCaretaker={removeCaretaker}
          />
        )}

        {/* Stage 3: Baby Setup */}
        {stage === 3 && (
          <BabySetupStage
            babyFirstName={babyFirstName}
            setBabyFirstName={setBabyFirstName}
            babyLastName={babyLastName}
            setBabyLastName={setBabyLastName}
            babyBirthDate={babyBirthDate}
            setBabyBirthDate={setBabyBirthDate}
            babyGender={babyGender}
            setBabyGender={setBabyGender}
            feedWarningTime={feedWarningTime}
            setFeedWarningTime={setFeedWarningTime}
            diaperWarningTime={diaperWarningTime}
            setDiaperWarningTime={setDiaperWarningTime}
          />
        )}

        {/* Error message */}
        {error && (
          <div className={cn(styles.errorContainer, "setup-wizard-error-container")}>
            {error}
          </div>
        )}

        {/* Navigation buttons */}
        <div className={cn(styles.navigationContainer, "setup-wizard-navigation-container")}>
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={stage === 1 || loading}
            className={cn(styles.previousButton, "setup-wizard-previous-button")}
          >
            {stage === 1 ? 'Cancel' : 'Previous'}
          </Button>
          <Button
            onClick={handleNext}
            disabled={loading}
            className={cn(styles.nextButton, "setup-wizard-next-button")}
          >
            {loading ? 'Processing...' : stage === 3 ? 'Complete Setup' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SetupWizard;
