export const dropdownMenuStyles = {
  subTrigger: "flex cursor-default select-none items-center px-6 py-4 text-sm outline-none transition-colors hover:bg-gray-50/50",
  subTriggerInset: "pl-8",
  subContent: "z-[200] min-w-[8rem] overflow-hidden bg-white divide-y divide-gray-100 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
  content: "z-[200] min-w-[8rem] overflow-hidden bg-white divide-y divide-gray-100 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
  item: "relative flex cursor-default select-none items-center px-6 py-4 text-sm outline-none transition-colors hover:bg-gray-50/50 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
  itemInset: "pl-8",
  checkboxItem: "relative flex cursor-default select-none items-center px-6 py-4 pl-8 text-sm outline-none transition-colors hover:bg-gray-50/50 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
  radioItem: "relative flex cursor-default select-none items-center px-6 py-4 pl-8 text-sm outline-none transition-colors hover:bg-gray-50/50 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
  label: "px-6 py-4 text-sm font-semibold",
  labelInset: "pl-8",
  separator: "h-px bg-gray-100",
  shortcut: "ml-auto text-xs tracking-widest opacity-60",
  iconWrapper: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center",
  chevronIcon: "ml-auto h-4 w-4",
  checkIcon: "h-4 w-4",
  circleIcon: "h-2 w-2 fill-current"
} as const;
