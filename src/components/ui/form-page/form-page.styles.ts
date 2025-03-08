import { cva } from "class-variance-authority";

/**
 * Form page styles using class-variance-authority
 * Defines all visual variations of the form page component
 *
 * This uses TailwindCSS classes for styling and follows the project's design system
 */
export const formPageStyles = {
  // Main container
  container: "fixed inset-y-0 right-0 z-50 flex flex-col bg-white/95 backdrop-blur-sm shadow-xl transform transition-transform duration-300 ease-in-out w-full sm:max-w-lg md:max-w-xl border-l border-slate-200",
  
  // Container when open
  containerOpen: "translate-x-0",
  
  // Container when closed
  containerClosed: "translate-x-full",
  
  // Overlay background
  overlay: "fixed inset-0 bg-black/30 z-40 transition-opacity duration-300",
  
  // Overlay when open
  overlayOpen: "opacity-100",
  
  // Overlay when closed
  overlayClosed: "opacity-0 pointer-events-none",
  
  // Header section
  header: "flex items-center justify-between p-4 border-b border-gray-200",
  
  // Title container
  titleContainer: "flex flex-col",
  
  // Title
  title: "text-lg font-semibold text-slate-800",
  
  // Description
  description: "text-sm text-gray-500 mt-1",
  
  // Close button
  closeButton: "text-gray-500 hover:text-gray-700 transition-colors duration-200 p-2 rounded-full hover:bg-slate-100/80",
  
  // Content container (scrollable area)
  content: "flex-1 overflow-y-auto p-4",
  
  // Form content alignment for mobile and desktop
  formContent: "flex flex-col space-y-6 mx-auto max-w-md sm:mx-0",
  
  // Footer section
  footer: "border-t border-gray-200 p-4 flex justify-end gap-2",
};

/**
 * Trigger button styles using class-variance-authority
 */
export const formPageTriggerVariants = cva(
  "flex items-center justify-center cursor-pointer transition-all duration-300 ease-in-out",
  {
    variants: {
      isOpen: {
        true: "-rotate-90",
        false: "rotate-0",
      },
    },
    defaultVariants: {
      isOpen: false,
    },
  }
);