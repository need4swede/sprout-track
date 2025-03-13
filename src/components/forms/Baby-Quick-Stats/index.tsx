'use client';

import React from 'react';
import { BabyQuickStatsProps } from './baby-quick-stats.types';
import {
  quickStatsContainer,
  babyInfoHeader,
  babyNameHeading,
  babyAgeText,
  placeholderText,
  closeButtonContainer
} from './baby-quick-stats.styles';
import FormPage, { FormPageContent, FormPageFooter } from '@/src/components/ui/form-page';
import { Button } from '@/src/components/ui/button';

/**
 * BabyQuickStats Component
 * 
 * A form that displays quick stats and information about the selected baby.
 * This is a placeholder component that will be expanded with more functionality.
 * 
 * @example
 * ```tsx
 * <BabyQuickStats
 *   isOpen={quickStatsOpen}
 *   onClose={() => setQuickStatsOpen(false)}
 *   selectedBaby={selectedBaby}
 *   calculateAge={calculateAge}
 * />
 * ```
 */
export const BabyQuickStats: React.FC<BabyQuickStatsProps> = ({
  isOpen,
  onClose,
  selectedBaby,
  calculateAge
}) => {
  return (
    <FormPage
      isOpen={isOpen}
      onClose={onClose}
      title="Baby Quick Stats"
      description="View and manage baby information"
    >
      <FormPageContent>
        <div className={quickStatsContainer()}>
          {selectedBaby ? (
            <>
              <div className={babyInfoHeader(selectedBaby.gender)}>
                <div>
                  <h2 className={babyNameHeading()}>
                    {selectedBaby.firstName} {selectedBaby.lastName}
                  </h2>
                  {calculateAge && (
                    <p className={babyAgeText()}>
                      {calculateAge(selectedBaby.birthDate)}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Placeholder for future quick stats content */}
              <div className="space-y-4">
                <p className="text-gray-600 text-center">
                  Quick stats and information will be displayed here in future updates.
                </p>
              </div>
            </>
          ) : (
            <p className={placeholderText()}>
              No baby selected. Please select a baby to view their stats.
            </p>
          )}
        </div>
      </FormPageContent>
      
      <FormPageFooter>
        <div className={closeButtonContainer()}>
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </FormPageFooter>
    </FormPage>
  );
};

export default BabyQuickStats;
