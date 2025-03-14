/**
 * Dropdown menu styles
 * 
 * Styled to match the calendar component with rounded corners, soft shadows,
 * and consistent styling across the application.
 */
export const dropdownMenuStyles = {
  subTrigger: "flex cursor-default select-none items-center px-4 py-2.5 text-sm font-medium text-gray-700 outline-none transition-colors hover:bg-teal-50 hover:text-teal-700 rounded-md",
  subTriggerInset: "pl-8",
  subContent: "z-[200] min-w-[8rem] overflow-hidden bg-white rounded-lg border border-gray-200 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 p-1.5",
  content: "z-[200] min-w-[8rem] overflow-hidden bg-white rounded-lg border border-gray-200 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 p-1.5",
  item: "relative flex cursor-default select-none items-center rounded-md px-4 py-2.5 text-sm font-medium text-gray-700 outline-none transition-colors hover:bg-teal-50 hover:text-teal-700 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 my-0.5",
  itemInset: "pl-8",
  checkboxItem: "relative flex cursor-default select-none items-center rounded-md px-4 py-2.5 pl-8 text-sm font-medium text-gray-700 outline-none transition-colors hover:bg-teal-50 hover:text-teal-700 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 my-0.5",
  radioItem: "relative flex cursor-default select-none items-center rounded-md px-4 py-2.5 pl-8 text-sm font-medium text-gray-700 outline-none transition-colors hover:bg-teal-50 hover:text-teal-700 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 my-0.5",
  label: "px-4 py-2 text-sm font-semibold text-gray-900",
  labelInset: "pl-8",
  separator: "mx-1 my-1 h-px bg-gray-200",
  shortcut: "ml-auto text-xs tracking-widest text-gray-500",
  iconWrapper: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center",
  chevronIcon: "ml-auto h-4 w-4 text-gray-500",
  checkIcon: "h-4 w-4 text-teal-600",
  circleIcon: "h-2 w-2 fill-teal-600"
} as const;
