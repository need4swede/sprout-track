import { cva } from "class-variance-authority";
import { cn } from "@/src/lib/utils";

/**
 * Card visual container styles
 */
export const cardVisualContainer = cva(
  "rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col h-full",
  {
    variants: {
      trend: {
        positive: "border-l-4 border-l-emerald-500 dark:border-l-emerald-500",
        negative: "border-l-4 border-l-red-500 dark:border-l-red-500",
        neutral: "",
      },
    },
    defaultVariants: {
      trend: "neutral",
    },
  }
);

/**
 * Card visual title styles
 */
export const cardVisualTitle = () => {
  return cn(
    "text-sm font-medium text-gray-600 dark:text-gray-400 mb-2"
  );
};

/**
 * Card visual main value styles
 */
export const cardVisualMainValue = () => {
  return cn(
    "text-2xl font-bold text-gray-900 dark:text-gray-200"
  );
};

/**
 * Card visual comparative value styles
 */
export const cardVisualComparativeValue = () => {
  return cn(
    "text-sm font-medium text-emerald-500 dark:text-teal-300 mt-1"
  );
};

/**
 * Card visual description styles
 */
export const cardVisualDescription = () => {
  return cn(
    "text-xs text-gray-500 dark:text-gray-500 mt-2"
  );
};

/**
 * Card visual icon container styles
 */
export const cardVisualIconContainer = () => {
  return cn(
    "absolute top-3 right-3 text-gray-400 dark:text-gray-500"
  );
};
