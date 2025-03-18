# Timezone Context

A React Context provider for handling timezone-related functionality in the Baby Tracker application. This context provides timezone information and utility functions to components throughout the application, ensuring consistent timezone handling, especially during Daylight Saving Time (DST) changes.

## Features

- Automatically detects the user's local timezone
- Fetches the server's timezone from settings
- Provides timezone conversion utilities to all components
- Handles DST changes correctly in duration calculations
- Formats dates in the user's timezone

## Usage

### Provider Setup

The TimezoneProvider is already set up in the application's root layout:

```tsx
// app/layout.tsx
import { TimezoneProvider } from './context/timezone';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <BabyProvider>
      <TimezoneProvider>
        <html lang="en">
          <body>
            {children}
          </body>
        </html>
      </TimezoneProvider>
    </BabyProvider>
  );
}
```

### Using the Context

```tsx
import { useTimezone } from '@/app/context/timezone';

function MyComponent() {
  const { 
    userTimezone, 
    serverTimezone, 
    convertToUserTimezone, 
    formatInUserTimezone,
    getMinutesBetweenDates
  } = useTimezone();
  
  // Display the user's timezone
  console.log(`User timezone: ${userTimezone}`);
  
  // Convert a date string to the user's timezone
  const localDate = convertToUserTimezone('2025-03-10T14:30:00Z');
  
  // Format a date in the user's timezone
  const formattedDate = formatInUserTimezone('2025-03-10T14:30:00Z', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
  
  // Calculate duration between dates, accounting for DST changes
  const startDate = new Date('2025-03-10T01:30:00');
  const endDate = new Date('2025-03-10T03:30:00');
  const minutes = getMinutesBetweenDates(startDate, endDate);
  
  return (
    <div>
      <p>Your timezone: {userTimezone}</p>
      <p>Server timezone: {serverTimezone}</p>
      <p>Formatted date: {formattedDate}</p>
      <p>Duration: {minutes} minutes</p>
    </div>
  );
}
```

## API Reference

### Context Values

| Property | Type | Description |
|----------|------|-------------|
| `userTimezone` | `string` | The user's detected timezone (e.g., 'America/Denver') |
| `serverTimezone` | `string` | The server's configured timezone (e.g., 'America/Chicago') |
| `convertToUserTimezone` | `(dateString: string) => Date` | Converts a date string to a Date object in the user's timezone |
| `formatInUserTimezone` | `(dateString: string, formatOptions?: Intl.DateTimeFormatOptions) => string` | Formats a date string in the user's timezone with the specified format options |
| `getMinutesBetweenDates` | `(startDate: Date \| string, endDate: Date \| string) => number` | Calculates the minutes between two dates, accounting for DST changes |

### `convertToUserTimezone(dateString: string)`

Converts a date string to a Date object in the user's timezone.

**Parameters:**
- `dateString`: A date string in any format that JavaScript's Date constructor can parse

**Returns:** A Date object representing the date in the user's timezone.

```typescript
const localDate = convertToUserTimezone('2025-03-10T14:30:00Z');
```

### `formatInUserTimezone(dateString: string, formatOptions?: Intl.DateTimeFormatOptions)`

Formats a date string in the user's timezone with the specified format options.

**Parameters:**
- `dateString`: A date string in any format that JavaScript's Date constructor can parse
- `formatOptions`: Optional Intl.DateTimeFormatOptions object for customizing the format

**Returns:** A formatted date string in the user's timezone.

```typescript
const formattedDate = formatInUserTimezone('2025-03-10T14:30:00Z', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit'
});
// "Monday, March 10, 2025, 8:30 AM"
```

### `getMinutesBetweenDates(startDate: Date | string, endDate: Date | string)`

Calculates the number of minutes between two dates, accounting for DST changes.

**Parameters:**
- `startDate`: The start date (as a Date object or date string)
- `endDate`: The end date (as a Date object or date string)

**Returns:** The number of minutes between the two dates, adjusted for DST changes.

```typescript
// During a DST change (spring forward)
const minutes = getMinutesBetweenDates(
  '2025-03-10T01:30:00',
  '2025-03-10T03:30:00'
);
// Returns 120 minutes (accounting for the 1-hour DST shift)
```

## DST Handling

The timezone context is designed to handle Daylight Saving Time (DST) changes correctly. When calculating time differences that span a DST change, the context accounts for the timezone offset difference to ensure accurate duration calculations.

The `getMinutesBetweenDates` function is particularly useful for this purpose, as it:

1. Compares the timezone offsets at the start and end times
2. Calculates the offset difference (typically 60 minutes during a DST change)
3. Adjusts the duration calculation accordingly

This ensures that durations are calculated correctly even when they span a DST change, which is crucial for accurate tracking of baby activities like sleep, feeding, and diaper changes.

## Implementation Details

The context uses:
- Browser's `Intl.DateTimeFormat().resolvedOptions().timeZone` to detect the user's timezone
- API call to `/api/settings` to fetch the server's timezone
- JavaScript's Date object and `getTimezoneOffset()` method to handle DST changes
- `toLocaleString()` for formatting dates in the user's timezone

## Cross-Platform Considerations

This context is designed to work in both web and mobile environments:

- Uses standard JavaScript Date APIs that are available in React Native
- Avoids browser-specific APIs except for timezone detection
- For React Native, the timezone detection would need to be adapted to use the device's timezone

When converting to React Native, you would need to:
1. Replace `Intl.DateTimeFormat().resolvedOptions().timeZone` with a React Native equivalent
2. Keep the rest of the implementation largely the same
