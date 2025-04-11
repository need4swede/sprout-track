import React from 'react';
import { Input } from '@/src/components/ui/input';
import { Button } from '@/src/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select';
import { cn } from '@/src/lib/utils';
import { styles } from './setup-wizard.styles';
import { SecuritySetupStageProps } from './setup-wizard.types';

/**
 * SecuritySetupStage Component
 * 
 * Second stage of the setup wizard that configures security options
 */
const SecuritySetupStage: React.FC<SecuritySetupStageProps> = ({
  useSystemPin,
  setUseSystemPin,
  systemPin,
  setSystemPin,
  confirmSystemPin,
  setConfirmSystemPin,
  caretakers,
  setCaretakers,
  newCaretaker,
  setNewCaretaker,
  addCaretaker,
  removeCaretaker
}) => {
  return (
    <div className={cn(styles.stageContainer, "setup-wizard-stage-container")}>
      <h2 className={cn(styles.stageTitle, "setup-wizard-stage-title")}>
        Security Setup
      </h2>
      
      <div className={cn(styles.securityOptionsContainer, "setup-wizard-security-options-container")}>
        <div className={cn(styles.securityOption, "setup-wizard-security-option")}>
          <input
            type="radio"
            id="systemPin"
            checked={useSystemPin}
            onChange={() => setUseSystemPin(true)}
            className={cn(styles.formRadio, "setup-wizard-form-radio")}
          />
          <label 
            htmlFor="systemPin" 
            className={cn(styles.formRadioLabel, "setup-wizard-form-radio-label")}
          >
            Use system-wide PIN
          </label>
        </div>
        
        <div className={cn(styles.securityOption, "setup-wizard-security-option")}>
          <input
            type="radio"
            id="caretakers"
            checked={!useSystemPin}
            onChange={() => setUseSystemPin(false)}
            className={cn(styles.formRadio, "setup-wizard-form-radio")}
          />
          <label 
            htmlFor="caretakers" 
            className={cn(styles.formRadioLabel, "setup-wizard-form-radio-label")}
          >
            Add caretakers with individual PINs
          </label>
        </div>
        
        <div className={cn(styles.formHelperText, "setup-wizard-form-helper-text", "mt-2")}>
          <strong>Important:</strong> If any caretakers exist in the system, the system-wide PIN option will be disabled.
          We recommend adding caretakers for all users who will be using the app, as this provides better tracking
          of who performed each activity and allows for individual access control.
        </div>
      </div>
      
      {useSystemPin ? (
        <div className={cn(styles.securityPinContainer, "setup-wizard-security-pin-container")}>
          <div className={cn(styles.formGroup, "setup-wizard-form-group")}>
            <label 
              className={cn(styles.formLabel, "setup-wizard-form-label")}
              htmlFor="systemPin"
            >
              System PIN (6-10 digits)
            </label>
            <Input
              id="systemPin"
              type="password"
              value={systemPin}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                if (value.length <= 10) {
                  setSystemPin(value);
                }
              }}
              placeholder="Enter PIN"
              className={cn(styles.formInput, "setup-wizard-form-input")}
              minLength={6}
              maxLength={10}
            />
          </div>
          <div className={cn(styles.formGroup, "setup-wizard-form-group")}>
            <label 
              className={cn(styles.formLabel, "setup-wizard-form-label")}
              htmlFor="confirmSystemPin"
            >
              Confirm PIN
            </label>
            <Input
              id="confirmSystemPin"
              type="password"
              value={confirmSystemPin}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                if (value.length <= 10) {
                  setConfirmSystemPin(value);
                }
              }}
              placeholder="Confirm PIN"
              className={cn(styles.formInput, "setup-wizard-form-input")}
              minLength={6}
              maxLength={10}
            />
          </div>
        </div>
      ) : (
        <div className={cn(styles.securityPinContainer, "setup-wizard-security-pin-container")}>
          <div className={cn(styles.caretakerContainer, "setup-wizard-caretaker-container")}>
            <h3 className={cn(styles.caretakerTitle, "setup-wizard-caretaker-title")}>
              Add Caretaker
            </h3>
            <div className={cn(styles.caretakerGrid, "setup-wizard-caretaker-grid")}>
              <div>
                <label 
                  className={cn(styles.formLabel, "setup-wizard-form-label")}
                  htmlFor="loginId"
                >
                  Login ID (2 chars)
                </label>
                <Input
                  id="loginId"
                  value={newCaretaker.loginId}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 2) {
                      setNewCaretaker({ ...newCaretaker, loginId: value });
                    }
                  }}
                  placeholder="ID"
                  className={cn(styles.formInput, "setup-wizard-form-input")}
                  maxLength={2}
                />
              </div>
              <div>
                <label 
                  className={cn(styles.formLabel, "setup-wizard-form-label")}
                  htmlFor="role"
                >
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
                  <SelectTrigger 
                    id="role"
                    className={cn(styles.formSelect, "setup-wizard-form-select")}
                  >
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="USER">User</SelectItem>
                  </SelectContent>
                </Select>
                {caretakers.length === 0 && (
                  <p className={cn(styles.formWarningText, "setup-wizard-form-warning-text")}>
                    First caretaker must be an admin
                  </p>
                )}
              </div>
            </div>
            <div className={cn(styles.formGroup, "setup-wizard-form-group")}>
              <label 
                className={cn(styles.formLabel, "setup-wizard-form-label")}
                htmlFor="name"
              >
                Name
              </label>
              <Input
                id="name"
                value={newCaretaker.name}
                onChange={(e) => 
                  setNewCaretaker({ ...newCaretaker, name: e.target.value })
                }
                placeholder="Full name"
                className={cn(styles.formInput, "setup-wizard-form-input")}
              />
            </div>
            <div className={cn(styles.caretakerGrid, "setup-wizard-caretaker-grid")}>
              <div>
                <label 
                  className={cn(styles.formLabel, "setup-wizard-form-label")}
                  htmlFor="type"
                >
                  Type (Optional)
                </label>
                <Input
                  id="type"
                  value={newCaretaker.type}
                  onChange={(e) => 
                    setNewCaretaker({ ...newCaretaker, type: e.target.value })
                  }
                  placeholder="Parent, Nanny, etc."
                  className={cn(styles.formInput, "setup-wizard-form-input")}
                />
              </div>
              <div>
                <label 
                  className={cn(styles.formLabel, "setup-wizard-form-label")}
                  htmlFor="securityPin"
                >
                  PIN (6-10 digits)
                </label>
                <Input
                  id="securityPin"
                  type="password"
                  value={newCaretaker.securityPin}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 10) {
                      setNewCaretaker({ ...newCaretaker, securityPin: value });
                    }
                  }}
                  placeholder="PIN"
                  className={cn(styles.formInput, "setup-wizard-form-input")}
                  minLength={6}
                  maxLength={10}
                />
              </div>
            </div>
            <Button 
              onClick={addCaretaker}
              className="w-full mt-4"
            >
              Add Caretaker
            </Button>
          </div>
          
          {caretakers.length > 0 && (
            <div className={cn(styles.formGroup, "setup-wizard-form-group")}>
              <h3 className={cn(styles.caretakerTitle, "setup-wizard-caretaker-title")}>
                Caretakers
              </h3>
              <ul className={cn(styles.caretakerList, "setup-wizard-caretaker-list")}>
                {caretakers.map((caretaker, index) => (
                  <li 
                    key={index} 
                    className={cn(styles.caretakerItem, "setup-wizard-caretaker-item")}
                  >
                    <div>
                      <span className={cn(styles.caretakerName, "setup-wizard-caretaker-name")}>
                        {caretaker.name}
                      </span>
                      <span className={cn(styles.caretakerInfo, "setup-wizard-caretaker-info")}>
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
  );
};

export default SecuritySetupStage;
