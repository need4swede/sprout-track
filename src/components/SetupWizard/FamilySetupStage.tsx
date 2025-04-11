import React from 'react';
import { Input } from '@/src/components/ui/input';
import { cn } from '@/src/lib/utils';
import { styles } from './setup-wizard.styles';
import { FamilySetupStageProps } from './setup-wizard.types';

/**
 * FamilySetupStage Component
 * 
 * First stage of the setup wizard that collects the family name
 */
const FamilySetupStage: React.FC<FamilySetupStageProps> = ({
  familyName,
  setFamilyName
}) => {
  return (
    <div className={cn(styles.stageContainer, "setup-wizard-stage-container")}>
      <h2 className={cn(styles.stageTitle, "setup-wizard-stage-title")}>
        Welcome to Sprout Track!
      </h2>
      <p className={cn(styles.stageDescription, "setup-wizard-stage-description")}>
        Since this is a brand new setup, let's get started with some basic information.
      </p>
      
      <div className={cn(styles.formGroup, "setup-wizard-form-group")}>
        <label 
          className={cn(styles.formLabel, "setup-wizard-form-label")}
          htmlFor="familyName"
        >
          What is your family name?
        </label>
        <Input
          id="familyName"
          value={familyName}
          onChange={(e) => setFamilyName(e.target.value)}
          placeholder="Enter family name"
          className={cn(styles.formInput, "setup-wizard-form-input")}
        />
      </div>
    </div>
  );
};

export default FamilySetupStage;
