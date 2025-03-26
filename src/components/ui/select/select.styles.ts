export const selectStyles = {
  trigger: "flex h-10 w-full items-center justify-between rounded-xl border-2 border-indigo-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm ring-offset-background transition-all duration-200 placeholder:text-gray-400 hover:border-indigo-300 dark:hover:border-teal-300 hover:bg-indigo-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-teal-800 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
  scrollButton: "flex cursor-default items-center justify-center py-1",
  content: "relative z-50 max-h-96 w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border border-indigo-100 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
  contentPopper: "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
  viewport: "p-2",
  viewportPopper: "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]",
  label: "px-2 py-1.5 text-sm font-semibold dark:text-gray-400",
  item: "relative flex w-full cursor-default select-none items-center rounded-lg py-2.5 pl-3 pr-8 text-sm outline-none transition-colors hover:bg-indigo-50 dark:hover:bg-gray-700 focus:bg-indigo-100 dark:focus:bg-gray-700 focus:text-indigo-900 dark:focus:text-teal-300 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
  itemIndicatorWrapper: "absolute right-2 flex h-3.5 w-3.5 items-center justify-center",
  checkIcon: "h-4 w-4 text-indigo-600 dark:text-teal-300",
  chevronIcon: "h-4 w-4 text-indigo-600 dark:text-gray-400 opacity-70",
  separator: "-mx-1 my-1 h-px bg-muted dark:bg-gray-600"
} as const;
