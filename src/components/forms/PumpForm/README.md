# PumpForm Component

A form component for recording and editing breast pumping activities in the Baby Tracker application.

## Features

- Records start and end times for pumping sessions
- Tracks left and right breast amounts separately
- Automatically calculates total amount
- Supports different measurement units (oz, ml)
- Allows adding notes for each session
- Handles both creation and editing of pump records
- Follows the application's form design pattern

## Usage

```tsx
import PumpForm from '@/src/components/forms/PumpForm';
import { useState } from 'react';

function ParentComponent() {
  const [showPumpForm, setShowPumpForm] = useState(false);
  const [selectedBaby, setSelectedBaby] = useState({ id: 'baby-id' });
  
  return (
    <>
      <button onClick={() => setShowPumpForm(true)}>
        Record Pumping Session
      </button>
      
      <PumpForm
        isOpen={showPumpForm}
        onClose={() => setShowPumpForm(false)}
        babyId={selectedBaby?.id}
        initialTime={new Date().toISOString()}
        onSuccess={() => {
          // Refresh data or show success message
        }}
      />
    </>
  );
}
```

## Component API

### PumpForm

Main component for recording breast pumping activities.

#### Props

| Prop | Type | Description | Default |
|------|------|-------------|---------|
| `isOpen` | `boolean` | Controls whether the form is visible | Required |
| `onClose` | `() => void` | Function to call when the form should be closed | Required |
| `babyId` | `string \| undefined` | ID of the baby for whom the activity is being recorded | Required |
| `initialTime` | `string` | Initial time value for the form (ISO format) | Required |
| `activity` | `PumpLogResponse` | Existing activity data (for edit mode) | `undefined` |
| `onSuccess` | `() => void` | Optional callback function called after successful submission | `undefined` |

## Form Fields

The form includes the following fields:

1. **Start Time**: When the pumping session began (required)
2. **End Time**: When the pumping session ended (optional)
3. **Left Amount**: Amount pumped from left breast (optional)
4. **Right Amount**: Amount pumped from right breast (optional)
5. **Total Amount**: Total amount pumped (calculated automatically)
6. **Unit**: Measurement unit (oz or ml)
7. **Notes**: Additional notes about the session (optional)

## Behavior

- When both start and end times are provided, the duration is automatically calculated
- When left and/or right amounts are entered, the total amount is automatically calculated
- The form validates that amount fields contain valid numeric values
- The form handles both creation of new records and editing of existing ones

## Implementation Details

The component uses the following UI components from the application's component library:

- `FormPage`, `FormPageContent`, `FormPageFooter` for layout
- `Input` for text and date inputs
- `Textarea` for multiline text input
- `Button` for form actions
- `Label` for form field labels

The component follows the standard form initialization pattern to prevent form resets when the `initialTime` prop changes.

## API Integration

The form submits data to the `/api/pump-log` endpoint, using:
- POST for creating new records
- PUT with an ID parameter for updating existing records

The form includes the authentication token in the request headers for secure API access.

## Cross-Platform Considerations

This component is designed with cross-platform compatibility in mind:
- Uses standard React patterns that can be adapted to React Native
- Avoids web-specific APIs where possible
- Uses relative sizing that can be adapted to different screen sizes
- Implements touch-friendly input controls
