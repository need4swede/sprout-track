import { cva } from "class-variance-authority"

/**
 * Calendar variant styles using class-variance-authority
 * Defines all visual variations of the calendar component
 *
 * This uses TailwindCSS classes for styling and follows the project's design system
 * When adapting to React Native, these styles will need to be converted to React Native StyleSheet
 * or a compatible styling solution like NativeWind
 *
 * @see https://cva.style/docs for more information on class-variance-authority
 */
export const calendarVariants = cva(
  "p-3 bg-white dark:bg-gray-600 rounded-lg shadow-lg border border-gray-200 dark:border-gray-500",
  {
    variants: {
      variant: {
        default: "",
        compact: "p-2 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

/**
 * Calendar header styles
 */
export const calendarHeaderVariants = cva(
  "flex items-center justify-between mb-2",
  {
    variants: {
      variant: {
        default: "px-1",
        compact: "px-0.5",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

/**
 * Calendar navigation button styles
 */
export const calendarNavButtonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "p-2",
        compact: "p-1",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

/**
 * Calendar month select styles
 */
export const calendarMonthSelectVariants = cva(
  "font-semibold text-gray-900 dark:text-gray-200",
  {
    variants: {
      variant: {
        default: "text-base",
        compact: "text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

/**
 * Calendar day styles
 */
export const calendarDayVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "h-9 w-9",
        compact: "h-7 w-7 text-xs",
      },
      selected: {
        true: "bg-gradient-to-r from-teal-600 to-emerald-600 text-white hover:from-teal-700 hover:to-emerald-700 dark:from-teal-600 dark:to-emerald-600 dark:hover:from-teal-700 dark:hover:to-emerald-700",
        false: "hover:bg-teal-50 hover:text-teal-700 dark:hover:bg-gray-700 dark:hover:text-gray-300",
      },
      today: {
        true: "border-2 border-teal-500 dark:border-teal-300 font-bold",
        false: "",
      },
      disabled: {
        true: "text-gray-300 dark:text-gray-600 hover:bg-transparent hover:text-gray-300 dark:hover:text-gray-600 cursor-not-allowed",
        false: "",
      },
      outside: {
        true: "text-gray-400 dark:text-gray-500",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      selected: false,
      today: false,
      disabled: false,
      outside: false,
    },
    compoundVariants: [
      {
        selected: true,
        today: true,
        className: "border-white dark:border-white",
      },
    ],
  }
)

/**
 * Calendar day names styles
 */
export const calendarDayNamesVariants = cva(
  "grid grid-cols-7 gap-1 mb-1",
  {
    variants: {
      variant: {
        default: "text-xs",
        compact: "text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

/**
 * Calendar day name styles
 */
export const calendarDayNameVariants = cva(
  "text-center font-medium text-gray-500 dark:text-gray-400",
  {
    variants: {
      variant: {
        default: "py-1",
        compact: "py-0.5",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)
