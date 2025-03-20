# Timezone Context

A React Context provider for handling timezone-related functionality in the Baby Tracker application. This context provides timezone information and utility functions to components throughout the application, ensuring consistent timezone handling, especially during Daylight Saving Time (DST) changes.

## Features

- Automatically detects the user's local timezone
- Provides comprehensive date formatting utilities
- Handles DST changes correctly in duration calculations
- Formats dates in the user's timezone
- Provides helper functions for common date operations

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
    formatDate,
    formatTime,
    formatDateOnly,
    formatDateTime,
    calculateDurationMinutes,
    formatDuration,
    isToday,
    isYesterday
  } = useTimezone();
  
  // Display the user's timezone
  console.log(`User timezone: ${userTimezone}`);
  
  // Format a date in the user's timezone
  const formattedDate = formatDateTime('2025-03-10T14:30:00Z');
  
  // Format just the time portion
  const formattedTime = formatTime('2025-03-10T14:30:00Z');
  
  // Format just the date portion
  const formattedDateOnly = formatDateOnly('2025-03-10T14:30:00Z');
  
  // Calculate duration between dates
  const startDate = '2025-03-10T01:30:00Z';
  const endDate = '2025-03-10T03:30:00Z';
  const minutes = calculateDurationMinutes(startDate, endDate);
  
  // Format a duration
  const formattedDuration = formatDuration(90); // Returns "1:30"
  
  // Check if a date is today or yesterday
  const isDateToday = isToday('2025-03-10T14:30:00Z');
  const isDateYesterday = isYesterday('2025-03-10T14:30:00Z');
  
  return (
    <div>
      <p>Your timezone: {userTimezone}</p>
      <p>Formatted date and time: {formattedDate}</p>
      <p>Formatted time: {formattedTime}</p>
      <p>Formatted date: {formattedDateOnly}</p>
      <p>Duration: {minutes} minutes ({formattedDuration})</p>
      <p>Is today: {isDateToday ? 'Yes' : 'No'}</p>
      <p>Is yesterday: {isDateYesterday ? 'Yes' : 'No'}</p>
    </div>
  );
}
```

## API Reference

### Context Values

| Property | Type | Description |
|----------|------|-------------|
| `userTimezone` | `string` | The user's detected timezone (e.g., 'America/Denver') |
| `formatDate` | `(isoString: string \| null \| undefined, formatOptions?: Intl.DateTimeFormatOptions) => string` | Format an ISO date string in the user's timezone with specified format options |
| `formatTime` | `(isoString: string \| null \| undefined) => string` | Format a time-only representation of an ISO date string |
| `formatDateOnly` | `(isoString: string \| null \| undefined) => string` | Format a date-only representation of an ISO date string |
| `formatDateTime` | `(isoString: string \| null \| undefined) => string` | Format a date and time representation of an ISO date string |
| `calculateDurationMinutes` | `(startIsoString: string \| null \| undefined, endIsoString: string \| null \| undefined) => number` | Calculate the duration between two ISO date strings in minutes |
| `formatDuration` | `(minutes: number) => string` | Format a duration in minutes to a human-readable string (HH:MM) |
| `isToday` | `(isoString: string \| null \| undefined) => boolean` | Check if a date is today in the user's timezone |
| `isYesterday` | `(isoString: string \| null \| undefined) => boolean` | Check if a date is yesterday in the user's timezone |

### `formatDate(isoString, formatOptions?)`

Formats an ISO date string in the user's timezone with specified format options.

**Parameters:**
- `isoString`: An ISO date string, or null/undefined
- `formatOptions`: Optional Intl.DateTimeFormatOptions object for customizing the format

**Returns:** A formatted date string in the user's timezone.

```typescript
const formattedDate = formatDate('2025-03-10T14:30:00Z', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit'
});
// "Monday, March 10, 2025, 8:30 AM"
```

### `formatTime(isoString)`

Formats a time-only representation of an ISO date string in the user's timezone.

**Parameters:**
- `isoString`: An ISO date string, or null/undefined

**Returns:** A formatted time string in the user's timezone.

```typescript
const formattedTime = formatTime('2025-03-10T14:30:00Z');
// "8:30 AM"
```

### `formatDateOnly(isoString)`

Formats a date-only representation of an ISO date string in the user's timezone.

**Parameters:**
- `isoString`: An ISO date string, or null/undefined

**Returns:** A formatted date string in the user's timezone.

```typescript
const formattedDate = formatDateOnly('2025-03-10T14:30:00Z');
// "Mar 10, 2025"
```

### `formatDateTime(isoString)`

Formats a date and time representation of an ISO date string in the user's timezone.

**Parameters:**
- `isoString`: An ISO date string, or null/undefined

**Returns:** A formatted date and time string in the user's timezone.

```typescript
const formattedDateTime = formatDateTime('2025-03-10T14:30:00Z');
// "Mar 10, 2025, 8:30 AM"
```

### `calculateDurationMinutes(startIsoString, endIsoString)`

Calculates the duration between two ISO date strings in minutes.

**Parameters:**
- `startIsoString`: The start date as an ISO string, or null/undefined
- `endIsoString`: The end date as an ISO string, or null/undefined

**Returns:** The number of minutes between the two dates.

```typescript
const minutes = calculateDurationMinutes(
  '2025-03-10T01:30:00Z',
  '2025-03-10T03:30:00Z'
);
// Returns 120 minutes
```

### `formatDuration(minutes)`

Formats a duration in minutes to a human-readable string (HH:MM).

**Parameters:**
- `minutes`: The duration in minutes

**Returns:** A formatted duration string in HH:MM format.

```typescript
const formattedDuration = formatDuration(90);
// "1:30"
```

### `isToday(isoString)`

Checks if a date is today in the user's timezone.

**Parameters:**
- `isoString`: An ISO date string, or null/undefined

**Returns:** A boolean indicating whether the date is today.

```typescript
const isDateToday = isToday('2025-03-10T14:30:00Z');
// true or false depending on the current date
```

### `isYesterday(isoString)`

Checks if a date is yesterday in the user's timezone.

**Parameters:**
- `isoString`: An ISO date string, or null/undefined

**Returns:** A boolean indicating whether the date is yesterday.

```typescript
const isDateYesterday = isYesterday('2025-03-10T14:30:00Z');
// true or false depending on the current date
```

## DST Handling

The timezone context is designed to handle Daylight Saving Time (DST) changes correctly. When calculating time differences that span a DST change, the context accounts for the timezone offset difference to ensure accurate duration calculations.

The `calculateDurationMinutes` function is particularly useful for this purpose, as it properly handles DST changes by using the JavaScript Date object's built-in timezone handling.

## Implementation Details

The context uses:
- Browser's `Intl.DateTimeFormat().resolvedOptions().timeZone` to detect the user's timezone
- JavaScript's Date object and `toLocaleString()` method for formatting dates in the user's timezone
- Simple time difference calculation for duration calculations, which correctly handles DST changes

## Cross-Platform Considerations

This context is designed to work in both web and mobile environments:

- Uses standard JavaScript Date APIs that are available in React Native
- Avoids browser-specific APIs except for timezone detection
- For React Native, the timezone detection would need to be adapted to use the device's timezone

When converting to React Native, you would need to:
1. Replace `Intl.DateTimeFormat().resolvedOptions().timeZone` with a React Native equivalent
2. Keep the rest of the implementation largely the same
