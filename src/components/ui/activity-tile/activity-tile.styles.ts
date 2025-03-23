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
    base: "h-24 relative cursor-pointer rounded-lg overflow-hidden hover:shadow-md transition-all duration-200",
    variants: {
      sleep: "bg-gray-100/75",
      feed: "bg-gray-100/75",
      diaper: "bg-gray-100/75",
      note: "bg-gray-100/75",
      bath: "bg-gray-100/75",
      pump: "bg-gray-100/75",
      default: "bg-gray-100/75"
    }
  },
  
  iconContainer: {
    base: "flex-shrink-0 p-2 items-center justify-center transition-transform duration-200 overflow-hidden",
    variants: {
      sleep: "[filter:drop-shadow(0_0_7px_rgba(107,114,128,1))]",
      feed: "[filter:drop-shadow(0_0_7px_rgba(184,230,254,1))]",
      diaper: "[filter:drop-shadow(0_0_7px_rgba(13,148,136,1))]",
      note: "[filter:drop-shadow(0_0_7px_rgba(225,255,153,1))]",
      bath: "[filter:drop-shadow(0_0_7px_rgba(234,88,12,1))]",
      pump: "[filter:drop-shadow(0_0_7px_rgba(147,51,234,1))]",
      default: "[filter:drop-shadow(0_0_7px_rgba(107,114,128,1))]"
    }
  },
  
  icon: {
    base: "h-10 w-10",
    variants: {
      sleep: "text-gray-700",
      feed: "text-blue-600",
      diaper: "text-teal-600",
      note: "text-yellow-600",
      bath: "text-orange-600",
      pump: "text-purple-600",
      default: "text-gray-600"
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
