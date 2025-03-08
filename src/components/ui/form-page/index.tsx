import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { formPageStyles } from './form-page.styles';
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
  return (
    <div className={cn(formPageStyles.header, className)}>
      <div className={formPageStyles.titleContainer}>
        <h2 className={formPageStyles.title}>{title}</h2>
        {description && (
          <p className={formPageStyles.description}>{description}</p>
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
  return (
    <div className={cn(formPageStyles.content, className)}>
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
  return (
    <div className={cn(formPageStyles.footer, className)}>
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

  return (
    <>
      {/* Overlay */}
      <div 
        className={cn(
          formPageStyles.overlay,
          isOpen ? formPageStyles.overlayOpen : formPageStyles.overlayClosed
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Form Page Panel */}
      <div
        className={cn(
          formPageStyles.container,
          isOpen ? formPageStyles.containerOpen : formPageStyles.containerClosed,
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Form page"
      >
        <FormPageHeader 
          title={title} 
          description={description} 
          onClose={onClose} 
        />
        
        {children}
      </div>
    </>
  );
}

export default FormPage;