/**
 * Styles for the CalendarEventItem component
 * 
 * These styles use Tailwind CSS classes and are designed to be compatible
 * with the project's design system and dark mode support.
 */

export const calendarEventItemStyles = {
  // Container styles
  container: "flex items-center p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer",
  
  // Event type color indicators
  colorIndicator: {
    base: "h-full w-1.5 rounded-full flex-shrink-0 mr-3",
    appointment: "bg-blue-500 dark:bg-blue-600",
    caretakerSchedule: "bg-green-500 dark:bg-green-600",
    reminder: "bg-amber-500 dark:bg-amber-600",
    custom: "bg-purple-500 dark:bg-purple-600",
  },
  
  // Content container
  content: "flex-1 min-w-0", // min-width prevents text overflow issues
  
  // Title styles
  title: "text-sm font-medium text-gray-900 dark:text-gray-100 truncate",
  
  // Time and details
  details: "flex items-center mt-1 text-xs text-gray-600 dark:text-gray-400",
  
  // Icon styles
  icon: {
    base: "h-3.5 w-3.5 mr-1.5",
    time: "text-gray-500 dark:text-gray-500",
    location: "text-gray-500 dark:text-gray-500",
    recurring: "text-amber-600 dark:text-amber-400",
  },
  
  // Location text
  location: "ml-2 truncate",
  
  // Badges container
  badgesContainer: "flex items-center ml-auto pl-2",
  
  // Badge styles
  badge: {
    base: "flex items-center justify-center h-5 w-5 rounded-full text-xs font-medium text-white",
    baby: "bg-teal-500 dark:bg-teal-600",
    caretaker: "bg-indigo-500 dark:bg-indigo-600",
    contact: "bg-rose-500 dark:bg-rose-600",
  },
  
  // Badge with count
  badgeCount: "ml-1 text-xs font-medium text-gray-600 dark:text-gray-400",
} as const;
