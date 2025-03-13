# Calendar Component

A custom calendar component with styled appearance that follows the project's design system. It's designed to be cross-platform compatible with minimal changes required for React Native.

## Features

- Month navigation with previous/next buttons
- Date selection with customizable callbacks
- Support for disabled dates
- Highlighting of today's date
- Responsive design with different size variants
- Styled with the app's emerald and gray color scheme

## Usage

```tsx
import { Calendar } from '@/src/components/ui/calendar';

// Basic usage
<Calendar 
  selected={selectedDate}
  onSelect={setSelectedDate}
/>

// With variant
<Calendar 
  selected={selectedDate}
  onSelect={setSelectedDate}
  variant="compact"
/>

// With date constraints
<Calendar 
  selected={selectedDate}
  onSelect={setSelectedDate}
  minDate={new Date(2023, 0, 1)}
  maxDate={new Date(2023, 11, 31)}
/>

// With disabled dates
<Calendar 
  selected={selectedDate}
  onSelect={setSelectedDate}
  disabledDates={[new Date(2023, 5, 15), new Date(2023, 5, 16)]}
/>

// With custom disabled date function
<Calendar 
  selected={selectedDate}
  onSelect={setSelectedDate}
  isDateDisabled={(date) => date.getDay() === 0 || date.getDay() === 6} // Disable weekends
/>
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `selected` | `Date \| undefined` | The currently selected date |
| `onSelect` | `(date: Date) => void` | Callback function when a date is selected |
| `month` | `Date` | The month to display (defaults to current month) |
| `className` | `string` | Additional CSS classes |
| `variant` | `"default" \| "compact"` | Size variant of the calendar |
| `minDate` | `Date` | Minimum selectable date |
| `maxDate` | `Date` | Maximum selectable date |
| `disabledDates` | `Date[]` | Array of dates to disable |
| `isDateDisabled` | `(date: Date) => boolean` | Function to determine if a date should be disabled |
| `initialFocus` | `boolean` | Whether to focus the calendar initially |

## Styling

The calendar uses the app's design system with emerald and gray colors. Selected dates use a gradient from teal to emerald, matching the app's primary button style. The calendar also includes proper hover states and accessibility features.
