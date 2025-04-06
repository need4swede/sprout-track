/**
 * Styles for the CalendarDayView component
 * 
 * These styles use Tailwind CSS classes and are designed to be compatible
 * with the project's design system and dark mode support.
 */

export const calendarDayViewStyles = {
  // Container styles
  container: "flex flex-col h-full overflow-hidden bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm",
  
  // Header styles
  header: "flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-teal-600 to-teal-700 text-white",
  headerTitle: "text-lg font-semibold",
  
  // Content container
  content: "flex-1 overflow-y-auto p-4",
  
  // Loading state
  loadingContainer: "flex items-center justify-center h-full",
  loadingSpinner: "h-8 w-8 text-teal-500 dark:text-teal-400 animate-spin",
  
  // Empty state
  emptyContainer: "flex flex-col items-center justify-center h-full text-center p-6",
  emptyIcon: "h-12 w-12 text-gray-400 dark:text-gray-500 mb-2",
  emptyText: "text-gray-500 dark:text-gray-400 text-sm",
  
  // Event groups
  eventGroup: "mb-6 last:mb-0",
  eventGroupHeader: "flex items-center mb-2",
  eventGroupIcon: "h-5 w-5 mr-2 text-gray-500 dark:text-gray-400",
  eventGroupTitle: "text-sm font-medium text-gray-700 dark:text-gray-300",
  eventsList: "space-y-3",
  
  // Add event button
  addButtonContainer: "sticky bottom-0 p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700",
  addButton: "w-full flex items-center justify-center py-2 px-4 rounded-lg bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-medium shadow-sm hover:shadow-md transition-shadow duration-200",
  addButtonIcon: "h-5 w-5 mr-2",
} as const;
