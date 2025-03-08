# Side Navigation Component

A responsive side navigation menu that slides in from the left side of the screen, providing access to main application routes and settings.

## Features

- Smooth slide-in/out animation with overlay background
- Responsive design that works on both mobile and desktop
- Keyboard accessibility (Escape key closes the menu)
- Focus management for improved accessibility
- Clear visual indication of the active route
- Settings button at the bottom of the navigation
- Touch-friendly targets for mobile users

## Components

The Side Navigation system consists of three main components:

1. `SideNav` - The main navigation panel that slides in from the left
2. `SideNavTrigger` - A button that toggles the side navigation visibility
3. `SideNavItem` - Individual navigation items within the side navigation

## Props

### SideNav Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | Required | Whether the side navigation is open |
| `onClose` | `() => void` | Required | Function to call when the side navigation should be closed |
| `currentPath` | `string` | Required | The current active path |
| `onNavigate` | `(path: string) => void` | Required | Function to call when a navigation item is selected |
| `onSettingsClick` | `() => void` | Required | Function to call when the settings button is clicked |
| `className` | `string` | `undefined` | Additional CSS classes to apply to the side navigation |

### SideNavTrigger Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onClick` | `() => void` | Required | Function to call when the trigger is clicked |
| `isOpen` | `boolean` | Required | Whether the side navigation is open |
| `className` | `string` | `undefined` | Additional CSS classes to apply to the trigger |
| `children` | `ReactNode` | Required | Children elements (typically the trigger icon) |

### SideNavItem Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `path` | `string` | Required | The path this item navigates to |
| `label` | `string` | Required | The label to display for this item |
| `icon` | `ReactNode` | `undefined` | Optional icon to display next to the label |
| `isActive` | `boolean` | Required | Whether this item is currently active |
| `onClick` | `(path: string) => void` | Required | Function to call when this item is clicked |
| `className` | `string` | `undefined` | Additional CSS classes to apply to the item |

## Usage Examples

### Basic Usage

```tsx
import { useState } from 'react';
import { SideNav, SideNavTrigger } from '@/src/components/ui/side-nav';
import Image from 'next/image';

export function Layout({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const currentPath = window.location.pathname;
  
  const handleNavigate = (path) => {
    window.location.href = path;
    setIsOpen(false);
  };
  
  const handleSettingsClick = () => {
    // Open settings modal
    setSettingsOpen(true);
    setIsOpen(false);
  };
  
  return (
    <div>
      <header>
        <SideNavTrigger 
          onClick={() => setIsOpen(true)} 
          isOpen={isOpen}
        >
          <Image
            src="/acorn-128.png"
            alt="Menu"
            width={64}
            height={64}
            className="object-contain"
          />
        </SideNavTrigger>
      </header>
      
      <SideNav
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        currentPath={currentPath}
        onNavigate={handleNavigate}
        onSettingsClick={handleSettingsClick}
      />
      
      <main>{children}</main>
    </div>
  );
}
```

## Implementation Details

The Side Navigation component is built using:

- React's `useEffect` for handling keyboard events and body scroll locking
- Tailwind CSS for styling with smooth transitions
- Lucide React for icons
- Class Variance Authority (CVA) for style variants

The component follows a modular structure:
- `index.tsx` - Main component implementation
- `side-nav.styles.ts` - Style definitions
- `side-nav.types.ts` - TypeScript type definitions

## Accessibility

The Side Navigation component includes:
- Proper ARIA attributes (`role="dialog"`, `aria-modal="true"`, `aria-label`)
- Keyboard navigation support (Escape key closes the menu)
- Focus management
- Sufficient color contrast for text and interactive elements
- Touch-friendly target sizes for mobile users

## Mobile Considerations (React Native)

When adapting this component for React Native, consider the following:

- **Animations**: Replace CSS transitions with React Native's Animated API
- **Overlay**: Use React Native's Modal component with a semi-transparent background
- **Touch Handling**: Implement gesture handling for swipe-to-close functionality
- **Keyboard Events**: Use React Native's specific keyboard event handling
- **Styling**: Convert Tailwind classes to React Native StyleSheet or NativeWind

This component follows the project's cross-platform compatibility guidelines by:
1. Keeping the core logic separate from styling
2. Using a modular structure that can be adapted for different platforms
3. Implementing touch-friendly interactions that work well on mobile
4. Providing clear documentation for platform-specific adaptations