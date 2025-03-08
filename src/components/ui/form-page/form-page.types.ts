import { ReactNode } from 'react';

/**
 * Props for the FormPage component
 */
export interface FormPageProps {
  /**
   * Whether the form page is open
   */
  isOpen: boolean;
  
  /**
   * Function to call when the form page should be closed
   */
  onClose: () => void;
  
  /**
   * Title of the form page
   */
  title: string;
  
  /**
   * Optional description below the title
   */
  description?: string;
  
  /**
   * Content of the form page
   */
  children: ReactNode;
  
  /**
   * Additional CSS classes to apply to the form page
   */
  className?: string;
}

/**
 * Props for the FormPageHeader component
 */
export interface FormPageHeaderProps {
  /**
   * Title of the form page
   */
  title: string;
  
  /**
   * Optional description below the title
   */
  description?: string;
  
  /**
   * Optional function to call when the form page should be closed
   * (Not used in the header anymore as we rely on footer buttons)
   */
  onClose?: () => void;
  
  /**
   * Additional CSS classes for the header
   */
  className?: string;
}

/**
 * Props for the FormPageContent component
 */
export interface FormPageContentProps {
  /**
   * Content of the form page
   */
  children: ReactNode;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Props for the FormPageFooter component
 */
export interface FormPageFooterProps {
  /**
   * Content of the footer
   */
  children: ReactNode;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}