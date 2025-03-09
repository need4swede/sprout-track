# SleepForm Component

A form component for tracking and managing baby sleep sessions. This component follows the form-page pattern used throughout the application.

## Features

- Start new sleep sessions
- End ongoing sleep sessions
- Edit existing sleep records
- Track sleep type (nap or night sleep)
- Record sleep location
- Rate sleep quality
- Calculate sleep duration automatically
- Form validation for required fields

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isOpen` | boolean | Yes | Controls whether the form is visible |
| `onClose` | () => void | Yes | Function to call when the form should be closed |
| `isSleeping` | boolean | Yes | Indicates if the baby is currently sleeping |
| `onSleepToggle` | () => void | Yes | Function to toggle the sleeping state |
| `babyId` | string \| undefined | Yes | ID of the baby for whom the sleep is being recorded |
| `initialTime` | string | Yes | Initial time value for the form (ISO format) |
| `activity` | SleepLogResponse | No | Existing sleep data (for edit mode) |
| `onSuccess` | () => void | No | Optional callback function called after successful submission |

## Usage

```tsx
import SleepForm from '@/src/components/forms/SleepForm';

function MyComponent() {
  const [showSleepForm, setShowSleepForm] = useState(false);
  const [isSleeping, setIsSleeping] = useState(false);
  const [selectedBaby, setSelectedBaby] = useState<{ id: string }>();
  
  const handleSleepToggle = () => {
    setIsSleeping(prev => !prev);
  };
  
  return (
    <>
      <Button onClick={() => setShowSleepForm(true)}>
        {isSleeping ? 'End Sleep' : 'Start Sleep'}
      </Button>
      
      <SleepForm
        isOpen={showSleepForm}
        onClose={() => setShowSleepForm(false)}
        isSleeping={isSleeping}
        onSleepToggle={handleSleepToggle}
        babyId={selectedBaby?.id}
        initialTime={new Date().toISOString()}
        onSuccess={() => {
          // Refresh data or perform other actions after successful submission
        }}
      />
    </>
  );
}
```

## Form Fields

The component includes the following fields:

- **Start Time**: Date and time when the sleep session started (required)
- **End Time**: Date and time when the sleep session ended (required when ending sleep)
- **Type**: Type of sleep - Nap or Night Sleep (required)
- **Location**: Where the baby is sleeping (optional) - options include Crib, Car Seat, Parents Room, Contact, and Other
- **Sleep Quality**: Rating of how well the baby slept (only shown when ending sleep or editing with end time) - options include Poor, Fair, Good, and Excellent

## Implementation Details

- Uses the FormPage component for consistent UI across the application
- Implements different form states based on whether starting sleep, ending sleep, or editing a sleep record
- Automatically calculates sleep duration based on start and end times
- Fetches current sleep data when ending an ongoing sleep session
- Handles API calls for creating and updating sleep records
- Disables appropriate fields based on the form state
- Provides loading state feedback during form submission
- Resets form after successful submission
