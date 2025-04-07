import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/src/lib/utils';
import { formPageStyles } from './form-page.styles';
import { useTheme } from '@/src/context/theme';
import './form-page.css';
import { 
  FormPageProps, 
  FormPageHeaderProps, 
  FormPageContentProps, 
  FormPageFooterProps 
} from './form-page.types';

/**
 * FormPageHeader component
 * 
 * The header section of the form page with title, description, and close button
 */
export function FormPageHeader({
  title,
  description,
  onClose,
  className
}: FormPageHeaderProps) {
  const { theme } = useTheme();
  return (
    <div className={cn(formPageStyles.header, className, "form-page-header")}>
      <div className={formPageStyles.titleContainer}>
        <h2 className={cn(formPageStyles.title, "form-page-title")}>{title}</h2>
        {description && (
          <p className={cn(formPageStyles.description, "form-page-description")}>{description}</p>
        )}
      </div>
    </div>
  );
}

/**
 * FormPageContent component
 * 
 * The main content area of the form page
 */
export function FormPageContent({ 
  children, 
  className 
}: FormPageContentProps) {
  const { theme } = useTheme();
  return (
    <div className={cn(formPageStyles.content, className, "form-page-content")}>
      <div className={formPageStyles.formContent}>
        {children}
      </div>
    </div>
  );
}

/**
 * FormPageFooter component
 * 
 * The footer section of the form page, typically containing action buttons
 */
export function FormPageFooter({ 
  children, 
  className 
}: FormPageFooterProps) {
  const { theme } = useTheme();
  return (
    <div className={cn(formPageStyles.footer, className, "form-page-footer")}>
      {children}
    </div>
  );
}

/**
 * FormPage component
 * 
 * A full-screen form page that slides in from the right side of the screen.
 * It contains a header, scrollable content area, and a footer for action buttons.
 * 
 * On mobile, the form content is centered, while on larger screens (>600px),
 * the form content is left-aligned.
 */
export function FormPage({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
}: FormPageProps) {
  const { theme } = useTheme();
  // State to track if we're in a browser environment
  const [mounted, setMounted] = useState(false);

  // Set mounted state to true after component mounts
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Close the form page when pressing Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    // Prevent scrolling when form page is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Content to be rendered
  const content = (
    <>
      {/* Overlay */}
      <div 
        className={cn(
          formPageStyles.overlay,
          isOpen ? formPageStyles.overlayOpen : formPageStyles.overlayClosed,
          "form-page-overlay"
        )}
        onClick={onClose}
        aria-hidden="true"
        style={{ isolation: 'isolate' }} // Create a new stacking context
      />

      {/* Form Page Panel */}
      <div
        className={cn(
          formPageStyles.container,
          isOpen ? formPageStyles.containerOpen : formPageStyles.containerClosed,
          className,
          "form-page-container"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Form page"
        style={{ isolation: 'isolate' }} // Create a new stacking context
      >
        <FormPageHeader 
          title={title} 
          description={description} 
          onClose={onClose} 
        />
        
        {/* Removed the relative positioning wrapper that was causing issues */}
        {children}
      </div>
    </>
  );

  // Use createPortal to render at the root level when in browser environment
  return mounted && typeof document !== 'undefined'
    ? createPortal(content, document.body)
    : null;
}

export default FormPage;
