/**
 * Activity tile styles using TailwindCSS classes
 * Defines all visual variations of the activity tile component
 *
 * This follows the project's design system and is consistent with other UI components
 */
export const activityTileStyles = {
  base: "group hover:bg-gray-50/50 transition-colors duration-200 cursor-pointer",
  container: "flex items-center px-6 py-3",
  
  // Button styles for each variant when used as a button
  button: {
    base: "h-20 relative overflow-visible cursor-pointer transition-transform duration-200 hover:scale-110",
    variants: {
      sleep: "bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600 text-white border-r border-white",
      feed: "bg-[#B8E6FE] text-gray-700",
      diaper: "bg-gradient-to-r from-teal-600 to-teal-700 text-white border-l border-white",
      note: "bg-[#FFFF99] text-gray-700 border-l border-white",
      default: "bg-gray-100 text-gray-700"
    }
  },
  
  iconContainer: {
    base: "flex-shrink-0 p-2 rounded-xl mr-4",
    variants: {
      sleep: "bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600",
      feed: "bg-sky-200",
      diaper: "bg-gradient-to-r from-teal-600 to-teal-700",
      note: "bg-[#FFFF99]",
      default: "bg-gray-100"
    }
  },
  
  icon: {
    base: "h-4 w-4",
    variants: {
      sleep: "text-white",
      feed: "text-gray-700",
      diaper: "text-white",
      note: "text-gray-700",
      default: "text-gray-700"
    },
    // Default icon paths for each variant
    defaultIcons: {
      sleep: "/crib-256.png",
      feed: "/bottle-256.png",
      diaper: "/diaper-256.png",
      note: "/notepad-256.png",
      default: ""
    }
  },
  
  content: {
    base: "min-w-0 flex-1",
    typeContainer: "flex items-center gap-2 text-xs",
    typeLabel: "inline-flex items-center rounded-md bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10",
    description: "text-gray-900"
  }
} as const;
