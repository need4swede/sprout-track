# Theme Toggle Component

A toggle button component that allows users to switch between light and dark themes in the application.

## Features

- Toggles between light and dark themes
- Displays appropriate icon based on current theme (Sun for dark mode, Moon for light mode)
- Fully accessible with proper ARIA attributes
- Responsive design
- Consistent styling with the application's design system

## Usage

```tsx
import { ThemeToggle } from '@/src/components/ui/theme-toggle';

export default function MyComponent() {
  return (
    <div>
      <ThemeToggle />
    </div>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | `undefined` | Additional CSS class names to apply to the theme toggle |
| `...props` | `ButtonHTMLAttributes<HTMLButtonElement>` | - | All standard button HTML attributes |

## Implementation Details

The ThemeToggle component uses the application's theme context to determine the current theme and toggle between light and dark modes. It displays a Moon icon when in light mode (to switch to dark mode) and a Sun icon when in dark mode (to switch to light mode).

The component is styled using TailwindCSS and follows the project's design system. Dark mode styles are handled through CSS classes rather than Tailwind's dark mode variants for better cross-platform compatibility.

## Accessibility

- Uses proper button semantics
- Includes appropriate ARIA labels that change based on the current theme
- Maintains sufficient color contrast in both light and dark modes
- Provides visual feedback on hover and focus states

## Mobile Considerations

- Uses larger touch targets suitable for mobile interaction
- Maintains consistent styling across platforms
- Designed to work well in responsive layouts
