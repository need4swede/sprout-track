# DateTimeEntry Component

A combined date and time picker component for the Baby Tracker application that integrates the Calendar component for date selection and the TimeEntry component for time selection with touch controls.

## Features

- Unified interface for selecting both date and time
- Uses the Calendar component for date selection
- Uses the TimeEntry component for time selection with touch/swipe controls
- Maintains consistent styling with the application
- Supports dark mode
- Responsive design for mobile and desktop
- Handles timezone differences correctly

## Usage

### Basic Usage

```tsx
import { DateTimeEntry } from '@/src/components/ui/date-time-entry';
import { useState } from 'react';

function DateTimePickerExample() {
  const [selectedDateTime, setSelectedDateTime] = useState(new Date());
  const { selectedBaby } = useBaby();
  
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-2">Select Date and Time</h2>
      {selectedBaby && (
        <DateTimeEntry 
          value={selectedDateTime} 
          onChange={setSelectedDateTime}
          selectedBabyId={selectedBaby.id}
        />
      )}
    </div>
  );
}
```

## Component API

### DateTimeEntry

Main component for displaying a combined date and time picker.

#### Props

| Prop | Type | Description | Default |
|------|------|-------------|---------|
| `value` | `Date` | The currently selected date and time | Required |
| `onChange` | `(date: Date) => void` | Callback function when date/time changes | Required |
| `className` | `string \| undefined` | Optional class name for additional styling | `undefined` |
| `disabled` | `boolean` | Whether the component is disabled | `false` |
| `selectedBabyId` | `string \| undefined` | The ID of the currently selected baby (required for Calendar) | Required |

## Visual Behavior

- Displays a Calendar component for date selection
- Displays a TimeEntry component for time selection
- Changes to either component update the combined date and time value
- The Calendar shows activity indicators for the selected baby
- The TimeEntry component allows for touch/swipe interaction to adjust time

## Implementation Details

The component is responsible for:
1. Coordinating between the Calendar and TimeEntry components
2. Maintaining a single date/time value that combines selections from both components
3. Providing a unified interface for forms that need date and time input
4. Handling timezone differences correctly

## Cross-Platform Considerations

This component is designed with cross-platform compatibility in mind:

- Uses standard React patterns that can be adapted to React Native
- Implements touch interactions that work on both mobile and desktop
- Uses relative sizing that can be adapted to different screen sizes
- Handles time in a platform-agnostic way

When converting to React Native, the Calendar component would need to be implemented using React Native's `View` and `FlatList` components instead of CSS grid, and the TimeEntry component would need to use React Native's `PanResponder` or gesture system instead of browser events.
