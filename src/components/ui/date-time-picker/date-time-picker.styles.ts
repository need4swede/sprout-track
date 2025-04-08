import { cn } from "@/src/lib/utils";

/**
 * DateTimePicker component styles
 * 
 * These styles define the appearance of the DateTimePicker component
 * and its various sub-components.
 */

// Dialog styles
export const dateTimePickerDialogStyles = cn(
  "w-auto p-0 z-[100] border-gray-200 shadow-lg",
  "max-h-[90vh] overflow-y-auto",
  "rounded-none", // Ensure no rounded corners
  "w-[350px]" // Fixed width for all devices
);

// Content container styles - removed scrolling to fix the horizontal scroll issue
export const dateTimePickerContentContainerStyles = cn(
  "date-time-picker-scroll-container",
  "overflow-hidden" // Prevent any scrolling
);

// Content styles
export const dateTimePickerContentStyles = cn(
  "flex flex-col",
  "w-[350px]", // Fixed width to maintain calendar size
  "min-h-[375px]", // Taller container to fit both views
  "text-rendering-optimizeLegibility antialiased", // Fix text rendering
  "transition-all duration-300" // Smooth transition when switching views
);

// Toggle container styles
export const dateTimePickerToggleContainerStyles = cn(
  "flex border-b border-gray-200"
);

// Toggle button base styles
export const dateTimePickerToggleButtonBaseStyles = cn(
  "flex-1 rounded-none transition-all duration-300"
);

// Toggle button active styles
export const dateTimePickerToggleButtonActiveStyles = cn(
  dateTimePickerToggleButtonBaseStyles,
  "bg-gradient-to-r from-teal-700 to-emerald-600 text-white"
);

// Toggle button inactive styles
export const dateTimePickerToggleButtonInactiveStyles = cn(
  dateTimePickerToggleButtonBaseStyles,
  "hover:bg-gray-100"
);

// View container styles
export const dateTimePickerViewContainerStyles = cn(
  "h-[328px]" // Fixed height without padding
);

// Calendar container styles
export const dateTimePickerCalendarContainerStyles = cn(
  "h-full" // Stretch the component vertically to fill the entire space
);

// Time entry container styles
export const dateTimePickerTimeContainerStyles = cn(
  "h-[328px]" // Make the container take full width
);

// Footer styles
export const dateTimePickerFooterStyles = cn(
  "flex justify-end p-3 border-t border-gray-200"
);

// Done button styles
export const dateTimePickerDoneButtonStyles = cn(
  "text-white transition-colors duration-300",
  "bg-gradient-to-r from-teal-700 to-emerald-600",
  "hover:bg-gradient-to-r hover:from-teal-800 hover:to-emerald-700"
);

// Input container styles
export const dateTimePickerInputContainerStyles = cn(
  "relative cursor-pointer"
);

// Calendar icon styles
export const dateTimePickerCalendarIconStyles = cn(
  "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none"
);

/**
 * Helper function to get toggle button styles based on active state
 * 
 * @param isActive Whether the toggle button is active
 * @returns The appropriate class names for the toggle button
 */
export function getToggleButtonStyles(isActive: boolean): string {
  return isActive 
    ? dateTimePickerToggleButtonActiveStyles
    : dateTimePickerToggleButtonInactiveStyles;
}
