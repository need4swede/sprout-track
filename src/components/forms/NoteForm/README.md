# NoteForm Component

A form component for creating and editing notes about a baby. This component follows the form-page pattern used throughout the application.

## Features

- Create new notes
- Edit existing notes
- Category auto-suggestion with dropdown
- Form validation for required fields
- Responsive design

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isOpen` | boolean | Yes | Controls whether the form is visible |
| `onClose` | () => void | Yes | Function to call when the form should be closed |
| `babyId` | string \| undefined | Yes | ID of the baby for whom the note is being recorded |
| `initialTime` | string | Yes | Initial time value for the form (ISO format) |
| `activity` | NoteResponse | No | Existing note data (for edit mode) |
| `onSuccess` | () => void | No | Optional callback function called after successful submission |

## Usage

```tsx
import NoteForm from '@/src/components/forms/NoteForm';

function MyComponent() {
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [selectedBaby, setSelectedBaby] = useState<{ id: string }>();
  
  return (
    <>
      <Button onClick={() => setShowNoteForm(true)}>
        Add Note
      </Button>
      
      <NoteForm
        isOpen={showNoteForm}
        onClose={() => setShowNoteForm(false)}
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

- **Time**: Date and time of the note (required)
- **Category**: Optional category for organizing notes, with auto-suggestion dropdown
- **Note**: The content of the note (required)

## Implementation Details

- Uses the FormPage component for consistent UI across the application
- Implements useEffect hooks to populate form data when editing
- Uses an initialization flag to prevent form reset when initialTime prop changes
- Fetches existing categories from the API for auto-suggestion
- Provides an interactive dropdown for category selection with keyboard navigation
- Handles API calls for creating and updating notes
- Resets form after successful submission
- Implements proper accessibility features for keyboard navigation
- Uses refs to handle click-outside behavior for the dropdown
