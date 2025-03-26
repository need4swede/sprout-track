import { cva } from "class-variance-authority"

/**
 * Checkbox variant styles using class-variance-authority
 * Defines all visual variations of the checkbox component
 *
 * This uses TailwindCSS classes for styling and follows the project's design system
 * When adapting to React Native, these styles will need to be converted to React Native StyleSheet
 * or a compatible styling solution like NativeWind
 *
 * @see https://cva.style/docs for more information on class-variance-authority
 */
export const checkboxVariants = cva(
  "h-5 w-5 rounded border flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-gray-300 dark:border-gray-600 data-[state=checked]:bg-orange-500 dark:data-[state=checked]:bg-teal-300 data-[state=checked]:border-orange-500 dark:data-[state=checked]:border-teal-300",
        primary: "border-teal-300 dark:border-teal-600 data-[state=checked]:bg-teal-500 dark:data-[state=checked]:bg-teal-300 data-[state=checked]:border-teal-500 dark:data-[state=checked]:border-teal-300",
        secondary: "border-slate-300 dark:border-slate-600 data-[state=checked]:bg-slate-500 dark:data-[state=checked]:bg-slate-400 data-[state=checked]:border-slate-500 dark:data-[state=checked]:border-slate-400",
        success: "border-emerald-300 dark:border-emerald-600 data-[state=checked]:bg-emerald-500 dark:data-[state=checked]:bg-emerald-400 data-[state=checked]:border-emerald-500 dark:data-[state=checked]:border-emerald-400",
        warning: "border-amber-300 dark:border-amber-600 data-[state=checked]:bg-amber-500 dark:data-[state=checked]:bg-amber-400 data-[state=checked]:border-amber-500 dark:data-[state=checked]:border-amber-400",
        danger: "border-red-300 dark:border-red-600 data-[state=checked]:bg-red-500 dark:data-[state=checked]:bg-red-400 data-[state=checked]:border-red-500 dark:data-[state=checked]:border-red-400",
        info: "border-blue-300 dark:border-blue-600 data-[state=checked]:bg-blue-500 dark:data-[state=checked]:bg-blue-400 data-[state=checked]:border-blue-500 dark:data-[state=checked]:border-blue-400",
      },
      size: {
        default: "h-5 w-5",
        sm: "h-4 w-4",
        lg: "h-6 w-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
