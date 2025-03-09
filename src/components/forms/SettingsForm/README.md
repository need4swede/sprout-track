# Form Components

This directory contains form implementations that use the FormPage component.

## SettingsForm

The SettingsForm component is a full-screen form that allows users to configure application settings. It includes:

- Family name configuration
- Security PIN management
- Database backup and restore functionality
- Baby management (add, edit, select)

### Usage

```tsx
import SettingsForm from '@/src/components/forms/SettingsForm';

export function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Open Settings
      </Button>
      
      <SettingsForm
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onBabySelect={(id: string) => {
          // Handle baby selection
        }}
        onBabyStatusChange={() => {
          // Refresh babies list
        }}
        selectedBabyId={selectedBabyId}
      />
    </>
  );
}
```

## Implementation Details

The form components in this directory follow these patterns:

1. They use the FormPage component from `@/src/components/ui/form-page` for consistent layout and behavior
2. They include FormPageContent for the scrollable form area
3. They include FormPageFooter for action buttons
4. They handle their own data fetching and state management
5. They follow the container/presentational pattern where appropriate

## Mobile Considerations

These form components are designed with mobile-first principles:
- On mobile screens, form content is centered
- On screens above 600px, form content is left-aligned
- All interactive elements have appropriate touch targets
- Forms slide in from the right side of the screen with smooth animations