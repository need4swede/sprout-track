import { cva } from "class-variance-authority";

/**
 * Theme toggle styles using class-variance-authority
 * Defines all visual variations of the theme toggle component
 *
 * This uses TailwindCSS classes for styling and follows the project's design system
 */
export const themeToggleStyles = {
  // Main button
  button: "flex items-center px-3 py-2 text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors duration-200 rounded-lg",
  
  // Icon container
  iconContainer: "mr-2 h-4 w-4",
  
  // Text label
  label: "text-xs font-medium"
};

/**
 * Theme toggle button variants using class-variance-authority
 */
export const themeToggleVariants = cva(
  "flex items-center justify-center cursor-pointer transition-all duration-300 ease-in-out",
  {
    variants: {
      theme: {
        light: "",
        dark: "",
      },
    },
    defaultVariants: {
      theme: "light",
    },
  }
);
