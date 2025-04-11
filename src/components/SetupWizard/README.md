# SetupWizard Component

A multi-stage wizard component that guides users through the initial setup process for the Sprout Track application.

## Features

- Three-stage setup process:
  - **Family Setup**: Collects the family name
  - **Security Setup**: Configures security options (system-wide PIN or individual caretaker PINs)
  - **Baby Setup**: Collects information about the baby (name, birth date, gender, warning times)
- Progress indicator showing current stage
- Form validation for each stage
- Error handling for API requests
- Responsive design for mobile and desktop
- Dark mode support

## Usage

Import and use the component in your page component:

```tsx
import { SetupWizard } from "@/src/components/SetupWizard";

export function MyComponent() {
  const handleSetupComplete = () => {
    // Handle setup completion, e.g., redirect to dashboard
    console.log('Setup complete!');
  };

  return (
    <SetupWizard onComplete={handleSetupComplete} />
  );
}
```

## Implementation Details

The SetupWizard component is built using:

- React functional components with TypeScript
- React hooks for state management
- TailwindCSS for styling via utility functions
- Shadcn UI components for form elements
- Lucide React for icons
- Date-fns for date formatting

The component follows a modular structure:
- `index.tsx` - Main component implementation
- `FamilySetupStage.tsx` - Family setup stage implementation
- `SecuritySetupStage.tsx` - Security setup stage implementation
- `BabySetupStage.tsx` - Baby setup stage implementation
- `setup-wizard.styles.ts` - Style definitions using TailwindCSS
- `setup-wizard.css` - Dark mode style overrides
- `setup-wizard.types.ts` - TypeScript type definitions
- `README.md` - Documentation

## Props

| Prop | Type | Description |
|------|------|-------------|
| `onComplete` | `() => void` | Function to call when the setup is complete |

## API Dependencies

The component relies on several API endpoints:

- `/api/settings` - For saving family name and security PIN
- `/api/caretaker` - For saving caretaker information
- `/api/baby` - For saving baby information

## Workflow

1. **Stage 1: Family Setup**
   - User enters the family name
   - Validates that the family name is not empty
   - Saves the family name to settings

2. **Stage 2: Security Setup**
   - User chooses between system-wide PIN or individual caretaker PINs
   - For system-wide PIN:
     - User enters and confirms a PIN (6-10 digits)
     - Validates PIN length and matching
     - Saves the PIN to settings
   - For individual caretaker PINs:
     - User adds one or more caretakers with login IDs, names, types, roles, and PINs
     - Validates that at least one caretaker is added
     - Saves caretakers to the database

3. **Stage 3: Baby Setup**
   - User enters baby's first name, last name, birth date, and gender
   - User sets feed warning time and diaper warning time
   - Validates that all required fields are filled
   - Saves baby information to the database

4. **Completion**
   - Calls the `onComplete` callback function

## Mobile Considerations (React Native)

When adapting this component for React Native, consider the following:

- **Styling**: The TailwindCSS classes will need to be replaced with React Native's StyleSheet
- **Form Elements**: Replace HTML form elements with React Native equivalents
- **Date Picker**: Use React Native's DatePickerIOS or DatePickerAndroid
- **Navigation**: Implement a custom navigation system for moving between stages
- **Layout**: Ensure the layout is optimized for various mobile screen sizes
- **Keyboard Handling**: Add keyboard avoidance behavior for form inputs
