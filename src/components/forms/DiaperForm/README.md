# DiaperForm Component

A form component for creating and editing diaper change records for a baby. This component follows the form-page pattern used throughout the application.

## Features

- Create new diaper change records
- Edit existing diaper change records
- Support for different diaper types (Wet, Dirty, Both)
- Conditional fields based on diaper type
- Form validation for required fields
- Responsive design

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isOpen` | boolean | Yes | Controls whether the form is visible |
| `onClose` | () => void | Yes | Function to call when the form should be closed |
| `babyId` | string \| undefined | Yes | ID of the baby for whom the diaper change is being recorded |
| `initialTime` | string | Yes | Initial time value for the form (ISO format) |
| `activity` | DiaperLogResponse | No | Existing diaper change record data (for edit mode) |
| `onSuccess` | () => void | No | Optional callback function called after successful submission |

## Usage

```tsx
import DiaperForm from '@/src/components/forms/DiaperForm';

function MyComponent() {
  const [showDiaperForm, setShowDiaperForm] = useState(false);
  const [selectedBaby, setSelectedBaby] = useState<{ id: string }>();
  
  return (
    <>
      <Button onClick={() => setShowDiaperForm(true)}>
        Log Diaper Change
      </Button>
      
      <DiaperForm
        isOpen={showDiaperForm}
        onClose={() => setShowDiaperForm(false)}
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

The component dynamically shows different fields based on the selected diaper type:

### All Diaper Types
- **Time**: Date and time of the diaper change (required)
- **Type**: Type of diaper (Wet, Dirty, Both) (required)

### Dirty or Both Types
Additional fields are shown when the type is "Dirty" or "Both":
- **Condition**: The condition of the stool (Normal, Loose, Firm, Other)
- **Color**: The color of the stool (Yellow, Brown, Green, Black, Red, Other)

## Implementation Details

- Uses the FormPage component for consistent UI across the application
- Implements useEffect hooks to populate form data when editing
- Conditionally renders fields based on the selected diaper type
- Provides validation before submission
- Handles API calls for creating and updating diaper change records
- Resets form after successful submission
