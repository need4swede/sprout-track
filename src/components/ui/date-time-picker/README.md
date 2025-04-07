# DateTimePicker Component

A modern, accessible date and time picker component for the Baby Tracker application that combines a calendar for date selection and a touch-friendly time picker with swipe controls.

## Features

- Input field with formatted date/time display
- Popover with tabbed interface for date and time selection
- Calendar component for date selection
- iOS-style time picker with touch/swipe controls
- Keyboard accessibility
- Dark mode support
- Responsive design for mobile and desktop
- Follows the project's design system

## Usage

```tsx
import { DateTimePicker } from '@/src/components/ui/date-time-picker';
import { useState } from 'react';

function DateTimePickerExample() {
  const [selectedDateTime, setSelectedDateTime] = useState(new Date());
  
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-2">Select Date and Time</h2>
      <DateTimePicker 
        value={selectedDateTime} 
        onChange={setSelectedDateTime}
        placeholder="Select appointment time..."
      />
    </div>
  );
}
```

## Component API

### DateTimePicker

Main component for selecting both date and time with a user-friendly interface.

#### Props

| Prop | Type | Description | Default |
|------|------|-------------|---------|
| `value` | `Date` | The currently selected date and time | Required |
| `onChange` | `(date: Date) => void` | Callback function when date/time changes | Required |
| `className` | `string \| undefined` | Optional class name for additional styling | `undefined` |
| `disabled` | `boolean` | Whether the component is disabled | `false` |
| `placeholder` | `string` | Placeholder text for the input | `"Select date and time..."` |

## Visual Behavior

- Displays an input field with the formatted date and time
- Clicking the input opens a popover with tabs for date and time selection
- Date tab shows a calendar for selecting the date
- Time tab shows an iOS-style time picker with hours, minutes, and AM/PM columns
- Selecting a date automatically switches to the time tab
- "Done" button closes the popover and confirms the selection

## Implementation Details

The component combines several UI components:
1. Input component for displaying the selected date/time
2. Popover component for the dropdown interface
3. Calendar component for date selection
4. TimeEntry component for time selection with touch controls
5. Button component for tab switching and confirmation

The component handles:
- Maintaining internal state for the selected date/time
- Formatting the date for display in the input
- Switching between date and time views
- Preserving time when changing date and vice versa
- Proper focus management for accessibility

## Cross-Platform Considerations

This component is designed with cross-platform compatibility in mind:

- Uses standard React patterns that can be adapted to React Native
- Implements touch interactions that work on both mobile and desktop
- Uses relative sizing that can be adapted to different screen sizes
- Handles time in a platform-agnostic way

When converting to React Native, the Calendar and TimeEntry components would need to be implemented using React Native's components and gesture system, but the overall structure and logic would remain similar.
