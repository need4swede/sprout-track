/**
 * Activity tile styles using TailwindCSS classes
 * Defines all visual variations of the activity tile component
 *
 * This follows the project's design system and is consistent with other UI components
 */
export const activityTileStyles = {
  base: "group transition-colors duration-200 cursor-pointer",
  container: "flex items-center justify-center px-6 py-3 overflow-hidden",
  
  // Button styles for each variant when used as a button
  button: {
    base: "h-20 relative cursor-pointer",
    variants: {
      sleep: "bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600 text-white border-r border-white",
      feed: "bg-[#B8E6FE] text-white",
      diaper: "bg-gradient-to-r from-teal-600 to-teal-700 text-white border-l border-white",
      note: "bg-[#FFFF99] text-white border-l border-white",
      bath: "bg-gradient-to-r from-orange-400 to-orange-500 text-white border-l border-white",
      pump: "bg-gradient-to-r from-purple-200 to-purple-300 text-white border-l border-white",
      default: "bg-gray-100 text-white"
    }
  },
  
  iconContainer: {
    base: "flex-shrink-0 p-2 rounded-xl items-center justify-center transition-transform duration-200 group-hover:scale-110 overflow-hidden",
    variants: {
      sleep: "bg-transparent",
      feed: "bg-transparent",
      diaper: "bg-transparent",
      note: "bg-transparent",
      bath: "bg-transparent",
      pump: "bg-transparent",
      default: "bg-transparent"
    }
  },
  
  icon: {
    base: "h-4 w-4",
    variants: {
      sleep: "text-white",
      feed: "text-white",
      diaper: "text-white",
      note: "text-white",
      bath: "text-white",
      pump: "text-white",
      default: "text-white"
    },
    // Default icon paths for each variant
    defaultIcons: {
      sleep: "/crib-256.png",
      feed: "/bottle-256.png",
      diaper: "/diaper-256.png",
      note: "/notepad-256.png",
      bath: "/bath-128.png",
      pump: "/pump-128.png",
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
