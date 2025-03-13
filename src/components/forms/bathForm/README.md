# BathForm Component

A modular form component for creating and editing bath records for a baby. This component follows the form-page pattern used throughout the application.

## Component Structure

- `index.tsx` - Main component that:
  - Manages form state and logic
  - Handles API calls and form submission
  - Provides a user-friendly interface for recording bath activities

## Features

- Create new bath records
- Edit existing bath records
- Track bath details including:
  - Whether soap and/or shampoo was used
  - Water temperature
  - Bath duration
  - Additional notes
- Form validation for required fields
- Responsive design

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isOpen` | boolean | Yes | Controls whether the form is visible |
| `onClose` | () => void | Yes | Function to call when the form should be closed |
| `babyId` | string \| undefined | Yes | ID of the baby for whom the bath is being recorded |
| `initialTime` | string | Yes | Initial time value for the form (ISO format) |
| `activity` | BathLogResponse | No | Existing bath record data (for edit mode) |
| `onSuccess` | () => void | No | Optional callback function called after successful submission |

## Usage

```tsx
import BathForm from '@/src/components/forms/bathForm';

function MyComponent() {
  const [showBathForm, setShowBathForm] = useState(false);
  const [selectedBaby, setSelectedBaby] = useState<{ id: string }>();
  
  return (
    <>
      <Button onClick={() => setShowBathForm(true)}>
        Log Bath
      </Button>
      
      <BathForm
        isOpen={showBathForm}
        onClose={() => setShowBathForm(false)}
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

- **Time**: Date and time of the bath (required)
- **Bath Options**:
  - **Soap Used**: Checkbox to indicate if soap was used
  - **Shampoo Used**: Checkbox to indicate if shampoo was used
- **Water Temperature**: Optional field to record the bath water temperature in degrees Fahrenheit
- **Duration**: Optional field to record the bath duration in minutes
- **Notes**: Text area for any additional notes about the bath

## Implementation Details

- Uses the FormPage component for consistent UI across the application
- Implements useEffect hooks to populate form data when editing
- Uses an initialization flag to prevent form reset when initialTime prop changes
- Provides validation before submission
- Handles API calls for creating and updating bath records
- Resets form after successful submission
- Styled with a consistent orange theme to match the bath activity tile
