import { cva } from "class-variance-authority"

export const labelVariants = cva(
  "text-sm font-medium leading-none text-gray-900 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);
