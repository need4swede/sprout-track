/**
 * Types for the BabyQuickStats component
 */
import { Baby } from '@prisma/client';

/**
 * Props for the BabyQuickStats component
 */
export interface BabyQuickStatsProps {
  /**
   * Whether the form is open
   */
  isOpen: boolean;
  
  /**
   * Function to call when the form should be closed
   */
  onClose: () => void;
  
  /**
   * The currently selected baby
   */
  selectedBaby: Baby | null;
  
  /**
   * Function to calculate the age of a baby
   */
  calculateAge?: (birthDate: Date) => string;
}
