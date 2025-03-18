# Timezone Utilities

A collection of utility functions for handling timezone conversions and date formatting in the Baby Tracker application. These utilities ensure consistent timezone handling across the application, particularly when dealing with Daylight Saving Time (DST) changes.

## Features

- Convert dates between UTC and local timezones
- Format dates in specific timezones
- Handle DST changes correctly
- Calculate time differences accounting for timezone shifts
- Retrieve application timezone settings

## Usage

```typescript
import { 
  getSettings, 
  convertToUTC, 
  formatLocalTime, 
  convertUTCToTimezone,
  getMinutesBetweenDates
} from '../utils/timezone';

// Get application timezone settings
const settings = await getSettings();
console.log(`Server timezone: ${settings.timezone}`);

// Convert a local date to UTC
const localDate = new Date('2025-03-10T14:30:00');
const utcDate = await convertToUTC(localDate);

// Format a UTC date in the server's timezone
const formattedDate = await formatLocalTime(utcDate);

// Convert a UTC date to a specific timezone
const clientTimezone = 'America/Denver';
const clientDate = convertUTCToTimezone(utcDate, clientTimezone);

// Calculate minutes between dates, accounting for DST changes
const startDate = new Date('2025-03-10T01:30:00'); // Before DST change
const endDate = new Date('2025-03-10T03:30:00');   // After DST change
const minutes = getMinutesBetweenDates(startDate, endDate, clientTimezone);
// Returns 120 minutes (2 hours) instead of 180 minutes (3 hours)
// because it accounts for the 1-hour DST shift
```

## API Reference

### `getSettings()`

Retrieves the application's timezone settings from the database.

**Returns:** Promise resolving to a settings object with a timezone property.

```typescript
const settings = await getSettings();
// { timezone: 'America/Chicago', ... }
```

### `convertToUTC(dateStr: string | Date)`

Converts a date string or Date object from the application's timezone to UTC.

**Parameters:**
- `dateStr`: A date string or Date object in the application's timezone

**Returns:** Promise resolving to a Date object in UTC.

```typescript
const utcDate = await convertToUTC('2025-03-10T14:30:00');
```

### `formatLocalTime(date: Date)`

Formats a UTC date in the application's timezone.

**Parameters:**
- `date`: A Date object in UTC

**Returns:** Promise resolving to a formatted date string in the application's timezone.

```typescript
const localTime = await formatLocalTime(new Date());
// "2025-03-10T14:30:00.000-05:00"
```

### `convertUTCToTimezone(date: Date, timezone: string)`

Converts a UTC date to a specific timezone.

**Parameters:**
- `date`: A Date object in UTC
- `timezone`: A timezone string (e.g., 'America/Denver')

**Returns:** A formatted date string in the specified timezone.

```typescript
const denverTime = convertUTCToTimezone(new Date(), 'America/Denver');
// "2025-03-10T12:30:00.000-07:00"
```

### `getMinutesBetweenDates(startDate: Date, endDate: Date, timezone: string)`

Calculates the number of minutes between two dates, accounting for DST changes.

**Parameters:**
- `startDate`: The start date
- `endDate`: The end date
- `timezone`: A timezone string (optional)

**Returns:** The number of minutes between the two dates, adjusted for DST changes.

```typescript
// During a DST change (spring forward)
const minutes = getMinutesBetweenDates(
  new Date('2025-03-10T01:30:00'),
  new Date('2025-03-10T03:30:00')
);
// Returns 120 minutes instead of 180 minutes
```

## DST Handling

The timezone utilities are designed to handle Daylight Saving Time (DST) changes correctly. When calculating time differences that span a DST change, the utilities account for the timezone offset difference to ensure accurate duration calculations.

For example, during the "spring forward" DST change:
- 1:30 AM to 3:30 AM would normally be 2 hours (120 minutes)
- But the clock jumps from 1:59 AM to 3:00 AM
- A naive calculation would give 3:30 - 1:30 = 2 hours
- The actual elapsed time is 1 hour and 30 minutes (90 minutes)

The `getMinutesBetweenDates` function handles this by comparing the timezone offsets at the start and end times and adjusting the calculation accordingly.

## Dependencies

- `date-fns`: For date parsing
- `date-fns-tz`: For timezone-aware date formatting
- Prisma: For database access to retrieve settings

## Cross-Platform Considerations

These utilities are designed to work in both server-side and client-side environments. When converting to React Native, the same functions can be used with minimal changes, as they rely on standard JavaScript Date objects and the date-fns library, which is compatible with React Native.
