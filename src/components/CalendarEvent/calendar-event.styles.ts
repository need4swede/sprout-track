/**
 * Styles for the CalendarEvent component
 * 
 * These styles use Tailwind CSS classes and are designed to be compatible
 * with the project's design system and dark mode support.
 */

export const calendarEventStyles = {
  // Container
  container: "flex flex-col rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 border-l-4",
  
  // Header
  header: "flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700",
  title: "text-lg font-semibold text-gray-900 dark:text-gray-100 truncate",
  type: "px-2 py-1 text-xs font-medium rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300",
  
  // Content
  content: "p-4 space-y-3",
  detail: "flex items-start text-sm",
  icon: "h-4 w-4 mt-0.5 mr-2 text-gray-500 dark:text-gray-400 flex-shrink-0",
  endTime: "text-gray-500 dark:text-gray-400",
  
  // People
  people: "space-y-1",
  peopleGroup: "flex flex-wrap",
  peopleLabel: "font-medium mr-1",
  peopleList: "text-gray-700 dark:text-gray-300",
  
  // Description
  description: "mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line",
  
  // Actions
  actions: "flex justify-end space-x-2 p-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700",
  actionButton: "px-3 py-1 text-xs font-medium rounded-md",
  actionIcon: "h-4 w-4",
} as const;
