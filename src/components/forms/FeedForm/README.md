# FeedForm Component

A form component for creating and editing feeding records for a baby. This component follows the form-page pattern used throughout the application.

## Features

- Create new feeding records
- Edit existing feeding records
- Support for different feeding types (Breast, Bottle, Solids)
- Automatic fetching of last feeding amount for convenience
- Form validation for required fields
- Responsive design

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isOpen` | boolean | Yes | Controls whether the form is visible |
| `onClose` | () => void | Yes | Function to call when the form should be closed |
| `babyId` | string \| undefined | Yes | ID of the baby for whom the feeding is being recorded |
| `initialTime` | string | Yes | Initial time value for the form (ISO format) |
| `activity` | FeedLogResponse | No | Existing feeding record data (for edit mode) |
| `onSuccess` | () => void | No | Optional callback function called after successful submission |

## Usage

```tsx
import FeedForm from '@/src/components/forms/FeedForm';

function MyComponent() {
  const [showFeedForm, setShowFeedForm] = useState(false);
  const [selectedBaby, setSelectedBaby] = useState<{ id: string }>();
  
  return (
    <>
      <Button onClick={() => setShowFeedForm(true)}>
        Log Feeding
      </Button>
      
      <FeedForm
        isOpen={showFeedForm}
        onClose={() => setShowFeedForm(false)}
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

The component dynamically shows different fields based on the selected feeding type:

### All Feeding Types
- **Time**: Date and time of the feeding (required)
- **Type**: Type of feeding (Breast, Bottle, Solids) (required)

### Breast Feeding
- **Side**: Which breast was used (Left, Right, Both) (required)

### Bottle Feeding
- **Amount**: Amount of milk/formula in ounces (with increment/decrement buttons)

### Solids Feeding
- **Amount**: Amount of food in ounces (with increment/decrement buttons)
- **Food**: Description of the food given

## Implementation Details

- Uses the FormPage component for consistent UI across the application
- Implements useEffect hooks to populate form data when editing
- Automatically fetches the last feeding amount for the selected type
- Provides validation before submission
- Handles API calls for creating and updating feeding records
- Resets form after successful submission
