# Web to Mobile Development Primer
## Building Components for Cross-Platform Compatibility with TypeScript

This document provides guidelines for developing Next.js components in TypeScript that can be easily translated to React Native. Following these patterns will create a more consistent experience across platforms and streamline the development process when building for both web and mobile.

## Table of Contents

1. [Project Structure](#project-structure)
2. [Component Architecture](#component-architecture)
3. [TypeScript Type Definitions](#typescript-type-definitions)
4. [State Management](#state-management)
5. [Styling Approach](#styling-approach)
6. [Navigation](#navigation)
7. [API and Data Fetching](#api-and-data-fetching)
8. [Form Handling](#form-handling)
9. [Platform-Specific Code](#platform-specific-code)
10. [LLM-Assisted Conversion Process](#llm-assisted-conversion-process)

## Project Structure

### Recommended Directory Structure (Web)

```
/src
  /components                 # Shared component library
    /ui                       # Pure UI components 
      /Button
        Button.tsx            # Web (Next.js) implementation
        Button.styles.ts      # Web styles
        types.ts              # Component-specific type definitions
        README.md             # Component documentation
    /features                 # Feature-specific components
      /BabyFeeding
        BabyFeedingForm.tsx   # Web implementation
        BabyFeedingForm.styles.ts
        types.ts              # Feature-specific type definitions
  /hooks                      # Custom hooks
  /services                   # Business logic & API calls
  /utils                      # Utility functions
  /constants                  # Shared constants
  /context                    # Context providers
  /types                      # TypeScript type definitions
  /styles                     # Global styles
```

### Corresponding Mobile Structure

```
/src
  /components                 # Shared component library
    /ui                       # Pure UI components
      /Button
        Button.tsx            # React Native implementation
        Button.styles.ts      # React Native styles
        types.ts              # Component-specific type definitions
    /features                 # Feature-specific components
      /BabyFeeding
        BabyFeedingForm.tsx   # React Native implementation
        BabyFeedingForm.styles.ts
        types.ts              # Feature-specific type definitions
  /hooks                      # Custom hooks (mostly reusable)
  /services                   # Business logic & API calls (mostly reusable)
  /utils                      # Utility functions (mostly reusable)
  /constants                  # Shared constants (mostly reusable)
  /context                    # Context providers (mostly reusable)
  /types                      # TypeScript type definitions (mostly reusable)
  /navigation                 # React Navigation config (mobile-specific)
```

### Key Organizational Principles

1. **Parallel Structure**
   - Maintain similar directory structures between web and mobile projects
   - Components should have the same relative path in both projects
   - Simplifies finding corresponding components across platforms

2. **Separation of Concerns**
   - Separate business logic from UI components
   - Keep API and data services platform-agnostic
   - Isolate platform-specific code in clearly defined locations

3. **TypeScript Throughout**
   - Use TypeScript for all code in both projects
   - Share type definitions between platforms when possible
   - Define clear interfaces for all components and services

4. **Documentation-Driven Development**
   - Create README files for components with clear usage examples
   - Document platform-specific considerations
   - Include conversion notes for complex components

## Component Architecture

### Core Principles

1. **Separation of Concerns**:
   - Separate business logic, UI rendering, and styling
   - Create "dumb" UI components and "smart" container components

2. **Prop-Driven Development**:
   - Components should be highly configurable through props
   - Avoid hard-coded values that might differ between platforms

3. **Component Composition**:
   - Build larger components from smaller ones
   - Use composition over inheritance

### Example: Button Component (Web)

```tsx
// src/components/ui/Button/Button.tsx (Next.js)
import React from 'react';
import { ButtonProps } from './types';
import styles from './Button.styles';

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  fullWidth = false,
  onClick,
  ...props
}) => {
  return (
    <button
      className={`${styles.button} ${styles[variant]} ${styles[size]} ${fullWidth ? styles.fullWidth : ''}`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
```

```tsx
// src/components/ui/Button/types.ts (Next.js)
import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}
```

### Example: Button Component (Mobile)

```tsx
// src/components/ui/Button/Button.tsx (React Native)
import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { ButtonProps } from './types';
import styles from './Button.styles';

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  fullWidth = false,
  onPress,
  style,
  ...props
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
      ]}
      disabled={disabled}
      onPress={disabled ? undefined : onPress}
      {...props}
    >
      <Text style={[styles.text, styles[`${variant}Text`]]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
};

export default Button;
```

```tsx
// src/components/ui/Button/types.ts (React Native)
import { TouchableOpacityProps } from 'react-native';

export type ButtonVariant = 'primary' | 'secondary' | 'outline';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps extends TouchableOpacityProps {
  children: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  onPress?: () => void;
}
```

### Component Documentation Template

For each component, include a README.md with:

```markdown
# Button Component

A customizable button component with various styles and sizes.

## Types

```typescript
type ButtonVariant = 'primary' | 'secondary' | 'outline';
type ButtonSize = 'small' | 'medium' | 'large';

// Web Props
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

// Mobile Props
interface ButtonProps extends TouchableOpacityProps {
  children: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  onPress?: () => void;
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | ButtonVariant | 'primary' | Visual style variant |
| size | ButtonSize | 'medium' | Button size |
| disabled | boolean | false | Whether the button is disabled |
| fullWidth | boolean | false | Whether the button should take full width |
| onClick/onPress | function | - | Function called when button is clicked/pressed |
| children | React.ReactNode (Web) / string (Mobile) | - | Button content |

## Web-Specific Notes
- Uses native HTML button element
- Supports all standard button attributes
- Children can be any React node

## Mobile-Specific Notes
- Uses TouchableOpacity
- Text content must be string (not JSX)
- Uses onPress instead of onClick

### Feature Component Example: BabyFeedingCard

```tsx
// src/components/features/BabyFeeding/BabyFeedingCard.tsx (Next.js)
import React from 'react';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/utils/date';
import { BabyFeedingCardProps } from './types';

export const BabyFeedingCard: React.FC<BabyFeedingCardProps> = ({
  feedingEvent,
  onEdit,
  onDelete,
}) => {
  const { timestamp, data } = feedingEvent;
  const { amount, unit, feedingType, notes } = data;

  return (
    <Card>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <Text variant="heading">{formatDate(timestamp)}</Text>
            <Text>
              {amount} {unit} ({feedingType})
            </Text>
            {notes && <Text variant="secondary">{notes}</Text>}
          </div>
          <div className="flex space-x-2">
            <Button size="small" variant="outline" onClick={onEdit}>
              Edit
            </Button>
            <Button size="small" variant="outline" onClick={onDelete}>
              Delete
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
```

```tsx
// src/components/features/BabyFeeding/types.ts (Next.js)
import { BabyEvent } from '@/types';

export interface BabyFeedingCardProps {
  feedingEvent: BabyEvent;
  onEdit: () => void;
  onDelete: () => void;
}
```

The React Native version:

```tsx
// src/components/features/BabyFeeding/BabyFeedingCard.tsx (React Native)
import React from 'react';
import { View } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/utils/date';
import { BabyFeedingCardProps } from './types';
import styles from './BabyFeedingCard.styles';

export const BabyFeedingCard: React.FC<BabyFeedingCardProps> = ({
  feedingEvent,
  onEdit,
  onDelete,
}) => {
  const { timestamp, data } = feedingEvent;
  const { amount, unit, feedingType, notes } = data;

  return (
    <Card>
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          <View>
            <Text variant="heading">{formatDate(timestamp)}</Text>
            <Text>
              {amount} {unit} ({feedingType})
            </Text>
            {notes ? <Text variant="secondary">{notes}</Text> : null}
          </View>
          <View style={styles.buttonContainer}>
            <Button size="small" variant="outline" onPress={onEdit}>
              Edit
            </Button>
            <View style={styles.buttonSpacer} />
            <Button size="small" variant="outline" onPress={onDelete}>
              Delete
            </Button>
          </View>
        </View>
      </View>
    </Card>
  );
};
```

```tsx
// src/components/features/BabyFeeding/BabyFeedingCard.styles.ts (React Native)
import { StyleSheet } from 'react-native';
import { spacing } from '@/styles/theme';

export default StyleSheet.create({
  container: {
    padding: spacing.md,
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  buttonContainer: {
    flexDirection: 'row',
  },
  buttonSpacer: {
    width: spacing.sm,
  },
});
```

### Best Practices for Component Architecture

1. **Keep Components Small and Focused**
   - Each component should have a single responsibility
   - Break complex UI into smaller, reusable pieces
   - Aim for components under 200 lines of code

2. **Container/Presentational Pattern**
   - Separate data fetching and state management (containers) from rendering (presentational)
   - Containers handle business logic and API calls
   - Presentational components are pure functions that render based on props

3. **Consistent Prop Naming**
   - Use the same prop names across platforms when possible
   - Be explicit with platform differences (onClick vs onPress)
   - Document any platform-specific behavior

4. **Error Handling and Loading States**
   - Include props for error and loading states
   - Provide fallbacks for missing or invalid data
   - Handle edge cases consistently

5. **Accessibility First**
   - Design components with accessibility in mind from the start
   - Include appropriate ARIA attributes on web
   - Use accessibility props in React Native

## TypeScript Type Definitions

### Shared Types

Create a shared types directory to define interfaces and types used across both platforms:

```typescript
// src/types/index.ts
export type EventType = 'feeding' | 'diaper' | 'sleep' | 'milestone' | 'measurement';

export interface Baby {
  id: string;
  name: string;
  birthDate: string;
  gender: 'male' | 'female' | 'other';
  pictureUrl?: string;
}

export interface EventData {
  // Base properties all events share
  notes?: string;
  
  // Feeding specific properties
  amount?: number;
  unit?: 'oz' | 'ml';
  feedingType?: 'breast' | 'bottle' | 'solid';
  
  // Other event-specific properties...
  // For diaper events
  diaperType?: 'wet' | 'dirty' | 'both';
  
  // For sleep events
  duration?: number; // in minutes
}

export interface BabyEvent {
  id: string;
  babyId: string;
  type: EventType;
  timestamp: string;
  data: EventData;
  isSync?: boolean;
  serverId?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

### Type Safety Best Practices

1. **Use TypeScript Generics** for reusable components and functions:

```typescript
// Generic List component
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string;
}

function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  // For Next.js
  return (
    <div>
      {items.map(item => (
        <div key={keyExtractor(item)}>
          {renderItem(item)}
        </div>
      ))}
    </div>
  );
  
  // For React Native
  // return (
  //   <FlatList
  //     data={items}
  //     renderItem={({ item }) => renderItem(item)}
  //     keyExtractor={item => keyExtractor(item)}
  //   />
  // );
}
```

2. **Discriminated Unions** for different event types:

```typescript
// More specific event types using discriminated unions
interface BaseBabyEvent {
  id: string;
  babyId: string;
  timestamp: string;
  isSync?: boolean;
  serverId?: string;
}

interface FeedingEvent extends BaseBabyEvent {
  type: 'feeding';
  data: {
    amount: number;
    unit: 'oz' | 'ml';
    feedingType: 'breast' | 'bottle' | 'solid';
    notes?: string;
  };
}

interface DiaperEvent extends BaseBabyEvent {
  type: 'diaper';
  data: {
    diaperType: 'wet' | 'dirty' | 'both';
    notes?: string;
  };
}

interface SleepEvent extends BaseBabyEvent {
  type: 'sleep';
  data: {
    duration: number; // in minutes
    startTime: string;
    endTime: string;
    notes?: string;
  };
}

interface MilestoneEvent extends BaseBabyEvent {
  type: 'milestone';
  data: {
    title: string;
    description: string;
    notes?: string;
  };
}

// Union type
type BabyEvent = FeedingEvent | DiaperEvent | SleepEvent | MilestoneEvent;
```

3. **Type Guards** for safe type narrowing:

```typescript
// Type guard functions
export function isFeedingEvent(event: BabyEvent): event is FeedingEvent {
  return event.type === 'feeding';
}

export function isDiaperEvent(event: BabyEvent): event is DiaperEvent {
  return event.type === 'diaper';
}

export function isSleepEvent(event: BabyEvent): event is SleepEvent {
  return event.type === 'sleep';
}

export function isMilestoneEvent(event: BabyEvent): event is MilestoneEvent {
  return event.type === 'milestone';
}

// Usage example
function renderEventDetails(event: BabyEvent) {
  if (isFeedingEvent(event)) {
    // TypeScript knows this is a FeedingEvent
    return `${event.data.amount} ${event.data.unit} of ${event.data.feedingType}`;
  } else if (isDiaperEvent(event)) {
    // TypeScript knows this is a DiaperEvent
    return `Diaper type: ${event.data.diaperType}`;
  } else if (isSleepEvent(event)) {
    // TypeScript knows this is a SleepEvent
    return `Slept for ${event.data.duration} minutes`;
  } else {
    // TypeScript knows this is a MilestoneEvent
    return event.data.title;
  }
}
```

4. **Utility Types** for component props:

```typescript
// Utility types for component props
type CommonProps = {
  className?: string;
  testID?: string;
};

// Web-specific props
type WebButtonProps = CommonProps & {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
};

// Mobile-specific props
type MobileButtonProps = CommonProps & {
  onPress: () => void;
  activeOpacity?: number;
};

// Platform detection (could be more sophisticated)
const isWeb = typeof window !== 'undefined' && 'document' in window;

// Platform-agnostic props
type ButtonProps = {
  label: string;
  disabled?: boolean;
} & (WebButtonProps | MobileButtonProps);

// Usage with type assertion
function Button(props: ButtonProps) {
  if (isWeb) {
    const { onClick, type = 'button', disabled, label, className } = props as WebButtonProps;
    return (
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={className}
      >
        {label}
      </button>
    );
  } else {
    const { onPress, disabled, label, testID, activeOpacity } = props as MobileButtonProps;
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={activeOpacity}
        testID={testID}
      >
        <Text>{label}</Text>
      </TouchableOpacity>
    );
  }
}
```

### Platform-Specific Type Definitions

1. **Web-Specific Types**:

```typescript
// src/types/web.ts
import { CSSProperties } from 'react';

export interface WebSpecificProps {
  className?: string;
  style?: CSSProperties;
  tabIndex?: number;
  role?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'data-testid'?: string;
}

export type HTMLElementRef = React.RefObject<HTMLElement>;
export type DivRef = React.RefObject<HTMLDivElement>;
export type ButtonRef = React.RefObject<HTMLButtonElement>;
export type InputRef = React.RefObject<HTMLInputElement>;

export type WebOnClick = (event: React.MouseEvent<HTMLElement>) => void;
export type WebOnChange = (event: React.ChangeEvent<HTMLInputElement>) => void;
```

2. **React Native-Specific Types**:

```typescript
// src/types/mobile.ts
import { StyleProp, ViewStyle, TextStyle, GestureResponderEvent } from 'react-native';

export interface MobileSpecificProps {
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: 'button' | 'link' | 'header' | 'image' | 'text' | 'none';
}

export type ViewRef = React.RefObject<import('react-native').View>;
export type TextRef = React.RefObject<import('react-native').Text>;
export type TouchableRef = React.RefObject<import('react-native').TouchableOpacity>;
export type TextInputRef = React.RefObject<import('react-native').TextInput>;

export type MobileOnPress = (event: GestureResponderEvent) => void;
export type MobileOnChangeText = (text: string) => void;
```

3. **Environment Detection**:

```typescript
// src/utils/platform.ts
export const isWeb = typeof window !== 'undefined' && 'document' in window;
export const isMobile = !isWeb;

export const platformSelect = <T>(options: { web: T; mobile: T }): T => {
  return isWeb ? options.web : options.mobile;
};

// Usage example
const buttonStyles = platformSelect({
  web: { cursor: 'pointer', ':hover': { opacity: 0.8 } },
  mobile: { opacity: 1 }
});
```

### Type-Safe API Models

Create domain models with type safety in mind:

```typescript
// src/models/BabyModel.ts
import { Baby, ApiResponse } from '../types';

export interface BabyCreateInput {
  name: string;
  birthDate: string;
  gender: 'male' | 'female' | 'other';
  pictureUrl?: string;
}

export interface BabyUpdateInput {
  id: string;
  name?: string;
  birthDate?: string;
  gender?: 'male' | 'female' | 'other';
  pictureUrl?: string;
}

export interface BabyQueryParams {
  userId?: string;
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'name' | 'birthDate';
  sortOrder?: 'asc' | 'desc';
}

export type BabyResponse = ApiResponse<Baby>;
export type BabiesResponse = ApiResponse<Baby[]>;
export type BabyCreateResponse = ApiResponse<Baby>;
export type BabyUpdateResponse = ApiResponse<Baby>;
export type BabyDeleteResponse = ApiResponse<{ success: boolean }>;
```

### Tips for TypeScript Excellence

1. **Strict Mode**: Enable TypeScript's strict mode in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true
  }
}
```

2. **Prefer Interfaces** for objects and class types, and **Type Aliases** for unions, primitives, and utility types.

3. **Readonly** for immutable data:

```typescript
export interface Baby {
  readonly id: string;
  name: string;
  birthDate: string;
  gender: 'male' | 'female' | 'other';
  readonly createdAt: string;
  updatedAt: string;
}
```

4. **Define Constants** with type safety:

```typescript
// src/constants/babyEvents.ts
export const EVENT_TYPES = ['feeding', 'diaper', 'sleep', 'milestone', 'measurement'] as const;
export type EventType = typeof EVENT_TYPES[number];

export const FEEDING_TYPES = ['breast', 'bottle', 'solid'] as const;
export type FeedingType = typeof FEEDING_TYPES[number];

export const DIAPER_TYPES = ['wet', 'dirty', 'both'] as const;
export type DiaperType = typeof DIAPER_TYPES[number];
```

5. **Error Types** for better error handling:

```typescript
// src/types/errors.ts
export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AppError';
  }
}

export class ApiError extends AppError {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export class ValidationError extends AppError {
  field?: string;
  
  constructor(message: string, field?: string) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}
```

## State Management

### Approach

1. **Shared Business Logic**:
   - Use React Context or state management libraries (Redux, Zustand, Jotai)
   - Keep core state management identical between platforms

2. **Custom Hooks**:
   - Create hooks for complex state logic
   - Reuse across platforms
   
3. **TypeScript Integration**:
   - Define types for all state objects
   - Use generic types for reusable state patterns

### Example: Baby Tracker State Hook

```typescript
// src/hooks/useBabyEvents.ts (Shared)
import { useState, useEffect } from 'react';
import { babyEventService } from '../services/babyEventService';
import { BabyEvent, EventType, EventData } from '../types';

interface UseBabyEventsResult {
  events: BabyEvent[];
  loading: boolean;
  error: string | null;
  addEvent: (eventType: EventType, eventData: EventData) => Promise<{ success: boolean; error?: string }>;
  updateEvent: (eventId: string, eventData: EventData) => Promise<{ success: boolean; error?: string }>;
  deleteEvent: (eventId: string) => Promise<{ success: boolean; error?: string }>;
  refreshEvents: () => Promise<void>;
}

export function useBabyEvents(babyId: string): UseBabyEventsResult {
  const [events, setEvents] = useState<BabyEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load events
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const result = await babyEventService.getEvents(babyId);
      setEvents(result.events);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    let isMounted = true;
    
    const loadEvents = async () => {
      try {
        setLoading(true);
        const result = await babyEventService.getEvents(babyId);
        if (isMounted) {
          setEvents(result.events);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    loadEvents();
    
    return () => {
      isMounted = false;
    };
  }, [babyId]);

  // Add event function
  const addEvent = async (eventType: EventType, eventData: EventData) => {
    try {
      const result = await babyEventService.addEvent(babyId, eventType, eventData);
      if (result.success) {
        setEvents(prev => [result.event, ...prev]);
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Unknown error' 
      };
    }
  };

  // Update event function
  const updateEvent = async (eventId: string, eventData: EventData) => {
    try {
      const result = await babyEventService.updateEvent(babyId, eventId, eventData);
      if (result.success) {
        setEvents(prev => prev.map(event => 
          event.id === eventId ? { ...event, data: eventData } : event
        ));
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Unknown error' 
      };
    }
  };

  // Delete event function
  const deleteEvent = async (eventId: string) => {
    try {
      const result = await babyEventService.deleteEvent(babyId, eventId);
      if (result.success) {
        setEvents(prev => prev.filter(event => event.id !== eventId));
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Unknown error' 
      };
    }
  };

  // Refresh function
  const refreshEvents = async () => {
    await fetchEvents();
  };

  return {
    events,
    loading,
    error,
    addEvent,
    updateEvent,
    deleteEvent,
    refreshEvents
  };
}
```

### Context-Based State Management

```typescript
// src/context/BabyContext.tsx (Shared)
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Baby } from '../types';
import { babyService } from '../services/babyService';

interface BabyContextType {
  babies: Baby[];
  currentBaby: Baby | null;
  loading: boolean;
  error: string | null;
  fetchBabies: () => Promise<void>;
  selectBaby: (babyId: string) => void;
  addBaby: (babyData: Omit<Baby, 'id'>) => Promise<{ success: boolean; error?: string }>;
  updateBaby: (babyId: string, babyData: Partial<Baby>) => Promise<{ success: boolean; error?: string }>;
  deleteBaby: (babyId: string) => Promise<{ success: boolean; error?: string }>;
}

const BabyContext = createContext<BabyContextType | undefined>(undefined);

export const BabyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [babies, setBabies] = useState<Baby[]>([]);
  const [currentBaby, setCurrentBaby] = useState<Baby | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBabies = async () => {
    try {
      setLoading(true);
      const result = await babyService.getBabies();
      setBabies(result.data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBabies();
  }, []);

  const selectBaby = (babyId: string) => {
    const baby = babies.find(b => b.id === babyId) || null;
    setCurrentBaby(baby);
  };

  const addBaby = async (babyData: Omit<Baby, 'id'>) => {
    try {
      const result = await babyService.createBaby(babyData);
      if (result.success && result.data) {
        setBabies(prev => [...prev, result.data!]);
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Unknown error' 
      };
    }
  };

  const updateBaby = async (babyId: string, babyData: Partial<Baby>) => {
    try {
      const result = await babyService.updateBaby(babyId, babyData);
      if (result.success && result.data) {
        setBabies(prev => prev.map(baby => 
          baby.id === babyId ? { ...baby, ...babyData } : baby
        ));
        
        // Update currentBaby if it's the one being updated
        if (currentBaby && currentBaby.id === babyId) {
          setCurrentBaby({ ...currentBaby, ...babyData });
        }
        
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Unknown error' 
      };
    }
  };

  const deleteBaby = async (babyId: string) => {
    try {
      const result = await babyService.deleteBaby(babyId);
      if (result.success) {
        setBabies(prev => prev.filter(baby => baby.id !== babyId));
        
        // Clear currentBaby if it's the one being deleted
        if (currentBaby && currentBaby.id === babyId) {
          setCurrentBaby(null);
        }
        
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Unknown error' 
      };
    }
  };

  const value = {
    babies,
    currentBaby,
    loading,
    error,
    fetchBabies,
    selectBaby,
    addBaby,
    updateBaby,
    deleteBaby
  };

  return <BabyContext.Provider value={value}>{children}</BabyContext.Provider>;
};

export const useBabyContext = () => {
  const context = useContext(BabyContext);
  if (context === undefined) {
    throw new Error('useBabyContext must be used within a BabyProvider');
  }
  return context;
};
```

### Using React Query for Data Fetching

```typescript
// src/hooks/useQueryBabies.ts (Shared)
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Baby } from '../types';
import { babyService } from '../services/babyService';

// Query keys
export const babyKeys = {
  all: ['babies'] as const,
  details: (id: string) => ['babies', id] as const,
  events: (id: string) => ['babies', id, 'events'] as const,
};

// Get all babies
export function useQueryBabies() {
  return useQuery({
    queryKey: babyKeys.all,
    queryFn: async () => {
      const response = await babyService.getBabies();
      return response.data || [];
    }
  });
}

// Get a single baby
export function useQueryBaby(babyId: string) {
  return useQuery({
    queryKey: babyKeys.details(babyId),
    queryFn: async () => {
      const response = await babyService.getBaby(babyId);
      return response.data;
    },
    enabled: !!babyId
  });
}

// Add a baby
export function useAddBaby() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: babyService.createBaby,
    onSuccess: (response) => {
      if (response.success && response.data) {
        // Update babies list cache
        queryClient.setQueryData<Baby[]>(babyKeys.all, (old = []) => [
          ...old,
          response.data!
        ]);
      }
    }
  });
}

// Update a baby
export function useUpdateBaby() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({
      babyId,
      data
    }: {
      babyId: string;
      data: Partial<Baby>;
    }) => babyService.updateBaby(babyId, data),
    onSuccess: (response, variables) => {
      if (response.success && response.data) {
        // Update the baby in the cache
        queryClient.setQueryData(
          babyKeys.details(variables.babyId),
          response.data
        );
        
        // Update the baby in the list
        queryClient.setQueryData<Baby[]>(babyKeys.all, (old = []) =>
          old.map(baby =>
            baby.id === variables.babyId ? { ...baby, ...variables.data } : baby
          )
        );
      }
    }
  });
}

// Delete a baby
export function useDeleteBaby() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (babyId: string) => babyService.deleteBaby(babyId),
    onSuccess: (_, babyId) => {
      // Remove from cache
      queryClient.removeQueries({
        queryKey: babyKeys.details(babyId)
      });
      
      // Update list
      queryClient.setQueryData<Baby[]>(babyKeys.all, (old = []) =>
        old.filter(baby => baby.id !== babyId)
      );
    }
  });
}
```

### Mobile-Specific State Considerations

For React Native, extend state management with offline capabilities:

```typescript
// src/hooks/useOfflineQueryBabies.ts (React Native only)
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Baby } from '../types';
import { babyService } from '../services/babyService';
import { localDatabase } from '../services/localDatabase';
import { networkManager } from '../utils/NetworkManager';
import { babyKeys } from './useQueryBabies';

// Get all babies with offline support
export function useOfflineQueryBabies() {
  return useQuery({
    queryKey: babyKeys.all,
    queryFn: async () => {
      try {
        // Try to fetch from API first if online
        if (networkManager.isConnected()) {
          const response = await babyService.getBabies();
          
          // Store in local database for offline access
          if (response.data) {
            await localDatabase.storeBabies(response.data);
          }
          
          return response.data || [];
        } else {
          // If offline, get from local database
          const localBabies = await localDatabase.getBabies();
          return localBabies;
        }
      } catch (error) {
        // If API request fails, try local database as fallback
        const localBabies = await localDatabase.getBabies();
        return localBabies;
      }
    }
  });
}

// Add a baby with offline support
export function useOfflineAddBaby() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (babyData: Omit<Baby, 'id'>) => {
      // Generate a temporary ID for offline use
      const tempBaby: Baby = {
        ...babyData,
        id: `local_${Date.now()}`,
        isSync: false
      };
      
      // Always save to local DB first
      await localDatabase.addBaby(tempBaby);
      
      // If online, try to sync with server
      if (networkManager.isConnected()) {
        try {
          const response = await babyService.createBaby(babyData);
          
          if (response.success && response.data) {
            // Update local record with server data
            await localDatabase.updateBaby(tempBaby.id, {
              ...response.data,
              isSync: true
            });
            
            return { success: true, data: response.data };
          }
          
          return { success: false, data: tempBaby, error: response.error };
        } catch (error) {
          // Return the locally saved data with error
          return { 
            success: false, 
            data: tempBaby, 
            error: error instanceof Error ? error.message : 'Failed to sync with server'
          };
        }
      }
      
      // If offline, return the local data
      return { success: true, data: tempBaby, offlineOnly: true };
    },
    onSuccess: (result) => {
      if (result.data) {
        // Update babies list cache
        queryClient.setQueryData<Baby[]>(babyKeys.all, (old = []) => [
          ...old,
          result.data!
        ]);
      }
    }
  });
}
```

### State Management Best Practices

1. **Single Source of Truth**:
   - Define a clear source of truth for all application state
   - Avoid redundant state spread across the application

2. **Immutable Updates**:
   - Always use immutable patterns to update state
   - Avoid direct mutations to state objects

```typescript
// GOOD - Immutable update
const updateBaby = (babyId: string, data: Partial<Baby>) => {
  setBabies(prev => prev.map(baby => 
    baby.id === babyId ? { ...baby, ...data } : baby
  ));
};

// BAD - Mutable update
const updateBabyBad = (babyId: string, data: Partial<Baby>) => {
  const babyIndex = babies.findIndex(baby => baby.id === babyId);
  if (babyIndex >= 0) {
    babies[babyIndex] = { ...babies[babyIndex], ...data }; // Mutation!
    setBabies([...babies]); // Still creates issues
  }
};
```

3. **Optimize Re-Renders**:
   - Use selectors to get only the needed data from state
   - Implement memoization for expensive computations

```typescript
// Using memoization
import { useMemo } from 'react';

function BabyStatsComponent({ babyId }: { babyId: string }) {
  const { events } = useBabyEvents(babyId);
  
  // Memoized computation
  const stats = useMemo(() => {
    return {
      totalFeedings: events.filter(e => e.type === 'feeding').length,
      totalDiapers: events.filter(e => e.type === 'diaper').length,
      avgFeedingAmount: calculateAvgFeedingAmount(events),
    };
  }, [events]);
  
  // Rest of component using stats...
}
```

4. **Error Handling**:
   - Always include error states in your state management
   - Provide recovery mechanisms for failures

5. **Loading States**:
   - Track loading states for all async operations
   - Consider separate loading states for initial load vs. updates

6. **Offline First**:
   - For mobile, design state management with offline support from the start
   - Implement optimistic updates for better user experience

## Styling Approach

### Shared Design System

The foundation of cross-platform styling is a shared design system with consistent variables:

```typescript
// src/styles/theme.ts (Shared constants)
// Common values for both platforms

export const colors = {
  primary: '#0070f3',
  secondary: '#ff4081',
  success: '#2e7d32',
  warning: '#ed6c02',
  error: '#d32f2f',
  info: '#0288d1',
  text: {
    primary: '#333333',
    secondary: '#666666',
    disabled: '#9e9e9e',
    light: '#ffffff'
  },
  background: {
    default: '#ffffff',
    paper: '#f5f5f5',
    light: '#fafafa',
    dark: '#121212'
  },
  border: '#e0e0e0',
  divider: '#e0e0e0'
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48
};

export const borderRadius = {
  small: 4,
  medium: 8,
  large: 12,
  round: 9999
};

export const shadows = {
  none: 'none',
  sm: '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
  md: '0px 3px 3px -2px rgba(0,0,0,0.2),0px 3px 4px 0px rgba(0,0,0,0.14),0px 1px 8px 0px rgba(0,0,0,0.12)',
  lg: '0px 5px 5px -3px rgba(0,0,0,0.2),0px 8px 10px 1px rgba(0,0,0,0.14),0px 3px 14px 2px rgba(0,0,0,0.12)'
};

// Export a default theme object
export default {
  colors,
  spacing,
  borderRadius,
  shadows
};
```

### Web (Next.js)

1. **CSS Modules or Styled Components**:
   - Keep styles modular and component-specific
   - Avoid global styles when possible

2. **Theme Variables**:
   - Define common variables for colors, spacing, etc.
   - Export theme as TypeScript constants

```typescript
// src/styles/theme.web.ts
import { Theme } from './types';
import { colors, spacing, borderRadius, shadows } from './theme';

// Web-specific typography
export const typography = {
  fontFamily: {
    primary: 'Inter, system-ui, sans-serif',
    secondary: 'Georgia, serif'
  },
  fontSize: {
    xs: '12px',
    sm: '14px',
    md: '16px',
    lg: '18px',
    xl: '20px',
    xxl: '24px',
    xxxl: '32px'
  },
  fontWeight: {
    regular: 400,
    medium: 500,
    bold: 700
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    loose: 1.8
  }
};

// Breakpoints for responsive design
export const breakpoints = {
  xs: '0px',
  sm: '600px',
  md: '960px',
  lg: '1280px',
  xl: '1920px'
};

// Web-specific extensions to the theme
const webTheme: Theme = {
  colors,
  spacing,
  borderRadius,
  shadows,
  typography,
  breakpoints
};

export default webTheme;
```

3. **CSS Modules Example**:

```typescript
// src/components/ui/Button/Button.module.css
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease, opacity 0.2s ease;
  font-family: var(--font-primary);
  font-weight: 500;
}

.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.primary {
  background-color: var(--color-primary);
  color: var(--color-text-light);
}

.primary:hover:not(:disabled) {
  background-color: var(--color-primary-dark);
}

.secondary {
  background-color: var(--color-secondary);
  color: var(--color-text-light);
}

.secondary:hover:not(:disabled) {
  background-color: var(--color-secondary-dark);
}

.outline {
  background-color: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
}

.outline:hover:not(:disabled) {
  background-color: rgba(0, 0, 0, 0.05);
}

.small {
  padding: 4px 8px;
  font-size: var(--font-size-sm);
}

.medium {
  padding: 8px 16px;
  font-size: var(--font-size-md);
}

.large {
  padding: 16px 24px;
  font-size: var(--font-size-lg);
}

.fullWidth {
  width: 100%;
}
```

4. **Styled Components Example**:

```typescript
// src/components/ui/Button/Button.styles.ts
import styled, { css } from 'styled-components';
import theme from '@/styles/theme.web';
import { ButtonProps, ButtonVariant, ButtonSize } from './types';

// Type-safe variant styles
const variantStyles = {
  primary: css`
    background-color: ${theme.colors.primary};
    color: ${theme.colors.text.light};
    
    &:hover:not(:disabled) {
      background-color: ${darken(0.1, theme.colors.primary)};
    }
  `,
  
  secondary: css`
    background-color: ${theme.colors.secondary};
    color: ${theme.colors.text.light};
    
    &:hover:not(:disabled) {
      background-color: ${darken(0.1, theme.colors.secondary)};
    }
  `,
  
  outline: css`
    background-color: transparent;
    color: ${theme.colors.primary};
    border: 1px solid ${theme.colors.primary};
    
    &:hover:not(:disabled) {
      background-color: rgba(0, 0, 0, 0.05);
    }
  `
};

// Type-safe size styles
const sizeStyles = {
  small: css`
    padding: ${theme.spacing.xs}px ${theme.spacing.sm}px;
    font-size: ${theme.typography.fontSize.sm};
  `,
  
  medium: css`
    padding: ${theme.spacing.sm}px ${theme.spacing.md}px;
    font-size: ${theme.typography.fontSize.md};
  `,
  
  large: css`
    padding: ${theme.spacing.md}px ${theme.spacing.lg}px;
    font-size: ${theme.typography.fontSize.lg};
  `
};

// Styled button component
export const StyledButton = styled.button<{
  variant: ButtonVariant;
  size: ButtonSize;
  fullWidth: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: ${theme.borderRadius.small}px;
  transition: background-color 0.2s ease, opacity 0.2s ease;
  font-family: ${theme.typography.fontFamily.primary};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  /* Apply variant styles */
  ${props => variantStyles[props.variant]}
  
  /* Apply size styles */
  ${props => sizeStyles[props.size]}
  
  /* Apply fullWidth style */
  ${props => props.fullWidth && css`
    width: 100%;
  `}
`;
```

### Mobile (React Native)

1. **StyleSheet.create**:
   - Use StyleSheet API with TypeScript interfaces
   - Create theme patterns that mirror web theme

```typescript
// src/styles/theme.mobile.ts
import { TextStyle, ViewStyle } from 'react-native';
import { Theme } from './types';
import { colors, spacing, borderRadius } from './theme';

// Mobile-specific typography
export const typography = {
  fontFamily: {
    primary: 'System', // Platform.OS === 'ios' ? 'San Francisco' : 'Roboto'
    secondary: 'Georgia'
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32
  },
  fontWeight: {
    regular: '400' as TextStyle['fontWeight'],
    medium: '500' as TextStyle['fontWeight'],
    bold: '700' as TextStyle['fontWeight']
  },
  lineHeight: {
    tight: 1.2 * 16, // Multiply by base font size for RN
    normal: 1.5 * 16,
    loose: 1.8 * 16
  }
};

// Mobile-specific shadows
export const mobileShadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0
  } as ViewStyle,
  sm: {
    shadowColor: colors.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  } as ViewStyle,
  md: {
    shadowColor: colors.text.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  } as ViewStyle,
  lg: {
    shadowColor: colors.text.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  } as ViewStyle
};

// Mobile theme
const mobileTheme: Theme = {
  colors,
  spacing,
  borderRadius,
  shadows: mobileShadows,
  typography
};

export default mobileTheme;
```

2. **Component Style Patterns**:

```typescript
// src/components/ui/Button/Button.styles.ts (React Native)
import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import theme from '@/styles/theme.mobile';
import { ButtonVariant, ButtonSize } from './types';

// Type for style props
type StyleProps = {
  variant: ButtonVariant;
  size: ButtonSize;
  fullWidth: boolean;
  disabled: boolean;
};

// Helper function for dynamic styles
export const getButtonStyles = ({
  variant,
  size,
  fullWidth,
  disabled
}: StyleProps) => {
  // Base button style
  const button: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.small,
    opacity: disabled ? 0.5 : 1,
  };
  
  // Size variations
  const sizeStyles: Record<ButtonSize, ViewStyle> = {
    small: {
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
    },
    medium: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
    },
    large: {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
    },
  };
  
  // Variant specific styles
  const variantStyles: Record<ButtonVariant, ViewStyle> = {
    primary: {
      backgroundColor: theme.colors.primary,
      borderWidth: 0,
    },
    secondary: {
      backgroundColor: theme.colors.secondary,
      borderWidth: 0,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.colors.primary,
    },
  };
  
  // Text styles based on variant
  const textStyles: Record<ButtonVariant, TextStyle> = {
    primary: {
      color: theme.colors.text.light,
      fontWeight: theme.typography.fontWeight.medium,
    },
    secondary: {
      color: theme.colors.text.light,
      fontWeight: theme.typography.fontWeight.medium,
    },
    outline: {
      color: theme.colors.primary,
      fontWeight: theme.typography.fontWeight.medium,
    },
  };
  
  // Combine all styles
  return {
    button: {
      ...button,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...(fullWidth ? { width: '100%' } : {}),
    },
    text: {
      ...textStyles[variant],
      fontSize: size === 'small' 
        ? theme.typography.fontSize.sm 
        : size === 'medium'
          ? theme.typography.fontSize.md
          : theme.typography.fontSize.lg,
    },
  };
};

// Pre-defined styles for common use cases
export default StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.small,
  },
  // Variant styles
  primary: {
    backgroundColor: theme.colors.primary,
    borderWidth: 0,
  },
  secondary: {
    backgroundColor: theme.colors.secondary,
    borderWidth: 0,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  // Size styles
  small: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
  },
  medium: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  large: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  // Utility styles
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  // Text styles
  text: {
    fontSize: theme.typography.fontSize.md,
  },
  primaryText: {
    color: theme.colors.text.light,
    fontWeight: theme.typography.fontWeight.medium,
  },
  secondaryText: {
    color: theme.colors.text.light,
    fontWeight: theme.typography.fontWeight.medium,
  },
  outlineText: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
});
```

### Responsive Design

1. **Web Approach**:

```typescript
// src/utils/responsive.web.ts
import theme from '@/styles/theme.web';

export const media = {
  xs: `@media (min-width: ${theme.breakpoints.xs})`,
  sm: `@media (min-width: ${theme.breakpoints.sm})`,
  md: `@media (min-width: ${theme.breakpoints.md})`,
  lg: `@media (min-width: ${theme.breakpoints.lg})`,
  xl: `@media (min-width: ${theme.breakpoints.xl})`,
};

// Example usage with styled-components
/*
const Container = styled.div`
  padding: ${theme.spacing.md}px;
  
  ${media.md} {
    padding: ${theme.spacing.lg}px;
  }
  
  ${media.lg} {
    padding: ${theme.spacing.xl}px;
  }
`;
*/
```

2. **Mobile Approach**:

```typescript
// src/utils/responsive.mobile.ts
import { useWindowDimensions } from 'react-native';

// Breakpoints (same values as web for consistency)
const breakpoints = {
  xs: 0,
  sm: 600,
  md: 960,
  lg: 1280,
  xl: 1920
};

export function useResponsive() {
  const { width, height } = useWindowDimensions();
  
  return {
    width,
    height,
    isXs: width >= breakpoints.xs,
    isSm: width >= breakpoints.sm,
    isMd: width >= breakpoints.md,
    isLg: width >= breakpoints.lg,
    isXl: width >= breakpoints.xl,
    // Helper for orientation
    isPortrait: height > width,
    isLandscape: width > height
  };
}

// Example usage in a component
/*
function ResponsiveComponent() {
  const { isMd, isLg } = useResponsive();
  
  const containerStyles = [
    styles.container,
    isMd && styles.containerMd,
    isLg && styles.containerLg
  ];
  
  return (
    <View style={containerStyles}>
      <Text>Responsive content</Text>
    </View>
  );
}
*/
```

### Dark Mode Support

1. **Shared Theme Types**:

```typescript
// src/styles/types.ts
export type ColorMode = 'light' | 'dark';

export interface ColorPalette {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  text: {
    primary: string;
    secondary: string;
    disabled: string;
    light: string;
  };
  background: {
    default: string;
    paper: string;
    light: string;
    dark: string;
  };
  border: string;
  divider: string;
}

export interface ThemeColors {
  light: ColorPalette;
  dark: ColorPalette;
}
```

2. **Theme Provider**:

```typescript
// src/context/ThemeContext.tsx (Shared)
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ColorMode } from '@/styles/types';
import { lightColors, darkColors } from '@/styles/colors';

interface ThemeContextType {
  colorMode: ColorMode;
  toggleColorMode: () => void;
  colors: typeof lightColors | typeof darkColors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Platform detection
const isWeb = typeof window !== 'undefined' && 'document' in window;

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize from system preference or stored preference
  const [colorMode, setColorMode] = useState<ColorMode>('light');

  // Effect to detect system preference
  useEffect(() => {
    if (isWeb) {
      // Check for stored preference
      const storedMode = localStorage.getItem('colorMode') as ColorMode | null;
      
      if (storedMode) {
        setColorMode(storedMode);
      } else {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setColorMode(prefersDark ? 'dark' : 'light');
      }
      
      // Listen for changes in system preference
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        if (!localStorage.getItem('colorMode')) {
          setColorMode(e.matches ? 'dark' : 'light');
        }
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // React Native would use Appearance API instead
      // This would be implemented in the platform-specific file
    }
  }, []);

  const toggleColorMode = () => {
    setColorMode(prev => {
      const newMode = prev === 'light' ? 'dark' : 'light';
      
      // Save preference
      if (isWeb) {
        localStorage.setItem('colorMode', newMode);
      }
      
      return newMode;
    });
  };

  // Get current colors based on mode
  const colors = colorMode === 'light' ? lightColors : darkColors;

  const value = {
    colorMode,
    toggleColorMode,
    colors
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
```

### Styling Best Practices

1. **Consistency Across Platforms**:
   - Use the same variable names for theme properties
   - Maintain similar component styling patterns
   - Adapt implementation details per platform while keeping the API consistent

2. **Component-Specific Styles**:
   - Keep styles with their components
   - Avoid global styles and class name conflicts

3. **Dynamic Styling**:
   - Create helper functions for complex style logic
   - Use composition for style variations

4. **Platform-Specific Adjustments**:
   - Account for platform differences (e.g., shadows work differently)
   - Create platform-specific style utilities when needed

5. **Performance Optimization**:
   - Memoize styles when dynamically generated
   - Use StyleSheet.create in React Native for performance

6. **Theme Extensions**:
   - Allow components to be extended with custom styles
   - Support style overrides through props

## Navigation

Navigation is one of the areas with significant platform differences, but we can implement patterns that use similar concepts across both web and mobile.

### Web (Next.js)

1. **File-System Based Routing**:
   - Use Next.js's built-in file-system based routing
   - Define strongly typed route parameters and query strings

```typescript
// src/app/babies/[babyId]/page.tsx
import { FC } from 'react';
import { BabyProfile } from '@/components/features/BabyProfile';

// Define the props type
interface BabyPageProps {
  params: {
    babyId: string;
  };
}

const BabyPage: FC<BabyPageProps> = ({ params }) => {
  const { babyId } = params;
  
  return (
    <main>
      <BabyProfile babyId={babyId} />
    </main>
  );
};

export default BabyPage;
```

2. **Type-Safe Navigation Utils**:

```typescript
// src/utils/navigation.ts
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

type Routes = {
  home: '/';
  babies: '/babies';
  babyProfile: (babyId: string) => `/babies/${string}`;
  babyEvents: (babyId: string, eventType?: string) => `/babies/${string}/events${string}`;
  addEvent: (babyId: string, eventType: string) => `/babies/${string}/events/add?type=${string}`;
};

export const routes: Routes = {
  home: '/',
  babies: '/babies',
  babyProfile: (babyId) => `/babies/${babyId}`,
  babyEvents: (babyId, eventType) => 
    `/babies/${babyId}/events${eventType ? `?type=${eventType}` : ''}`,
  addEvent: (babyId, eventType) => 
    `/babies/${babyId}/events/add?type=${eventType}`,
};

export const useAppNavigation = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  return {
    navigateToHome: () => router.push(routes.home),
    navigateToBabies: () => router.push(routes.babies),
    navigateToBabyProfile: (babyId: string) => 
      router.push(routes.babyProfile(babyId)),
    navigateToBabyEvents: (babyId: string, eventType?: string) => 
      router.push(routes.babyEvents(babyId, eventType)),
    navigateToAddEvent: (babyId: string, eventType: string) => 
      router.push(routes.addEvent(babyId, eventType)),
    
    // Current route helpers
    getCurrentBabyId: (): string | null => {
      // Extract from path like /babies/123
      const matches = pathname.match(/\/babies\/([^\/]+)/);
      return matches ? matches[1] : null;
    },
    getCurrentEventType: (): string | null => {
      return searchParams.get('type');
    },
    isActivePath: (path: string): boolean => {
      return pathname === path || pathname.startsWith(`${path}/`);
    }
  };
};
```

3. **Navigation Components**:

```typescript
// src/components/navigation/AppNav.tsx
import React from 'react';
import Link from 'next/link';
import { useAppNavigation } from '@/utils/navigation';
import { useBabyContext } from '@/context/BabyContext';

export const AppNav: React.FC = () => {
  const { babies, currentBaby } = useBabyContext();
  const { isActivePath } = useAppNavigation();
  
  return (
    <nav className="app-nav">
      <ul>
        <li className={isActivePath('/') ? 'active' : ''}>
          <Link href="/">Dashboard</Link>
        </li>
        
        <li className={isActivePath('/babies') ? 'active' : ''}>
          <Link href="/babies">Babies</Link>
        </li>
        
        {currentBaby && (
          <>
            <li className={isActivePath(`/babies/${currentBaby.id}`) ? 'active' : ''}>
              <Link href={`/babies/${currentBaby.id}`}>
                {currentBaby.name}'s Profile
              </Link>
            </li>
            
            <li className={isActivePath(`/babies/${currentBaby.id}/events`) ? 'active' : ''}>
              <Link href={`/babies/${currentBaby.id}/events`}>
                Events
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};
```

### Mobile (React Native)

1. **React Navigation Setup**:
   - Define type-safe navigation stack with TypeScript
   - Create navigation constants that mirror web routes

```typescript
// src/navigation/types.ts
import { NavigatorScreenParams } from '@react-navigation/native';

// Define the param list for each stack
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Babies: undefined;
  Settings: undefined;
};

export type BabyStackParamList = {
  BabyList: undefined;
  BabyProfile: { babyId: string };
  BabyEvents: { babyId: string; eventType?: string };
  AddEvent: { babyId: string; eventType: string };
};

// Create a type for useNavigation hook
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
```

2. **Navigation Implementation**:

```typescript
// src/navigation/AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RootStackParamList, MainTabParamList, BabyStackParamList, AuthStackParamList } from './types';
import { useAuth } from '@/hooks/useAuth';

// Import screens
import { LoginScreen, RegisterScreen, ForgotPasswordScreen } from '@/screens/auth';
import { HomeScreen, SettingsScreen } from '@/screens/main';
import { 
  BabyListScreen, 
  BabyProfileScreen, 
  BabyEventsScreen,
  AddEventScreen
} from '@/screens/babies';

// Create navigators
const Stack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();
const BabyStack = createNativeStackNavigator<BabyStackParamList>();

// Auth navigator
const AuthNavigator: React.FC = () => {
  return (
    <AuthStack.Navigator>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </AuthStack.Navigator>
  );
};

// Baby stack navigator
const BabyNavigator: React.FC = () => {
  return (
    <BabyStack.Navigator>
      <BabyStack.Screen name="BabyList" component={BabyListScreen} />
      <BabyStack.Screen 
        name="BabyProfile" 
        component={BabyProfileScreen}
        options={({ route }) => ({ title: `Baby Profile` })}
      />
      <BabyStack.Screen 
        name="BabyEvents" 
        component={BabyEventsScreen}
        options={({ route }) => ({ 
          title: route.params.eventType 
            ? `${route.params.eventType} Events` 
            : 'All Events'
        })}
      />
      <BabyStack.Screen 
        name="AddEvent" 
        component={AddEventScreen}
        options={({ route }) => ({ 
          title: `Add ${route.params.eventType}`
        })}
      />
    </BabyStack.Navigator>
  );
};

// Main tab navigator
const MainNavigator: React.FC = () => {
  return (
    <MainTab.Navigator>
      <MainTab.Screen name="Home" component={HomeScreen} />
      <MainTab.Screen name="Babies" component={BabyNavigator} options={{ headerShown: false }} />
      <MainTab.Screen name="Settings" component={SettingsScreen} />
    </MainTab.Navigator>
  );
};

// Root navigator
const AppNavigator: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <Stack.Screen name="Main" component={MainNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
```

3. **Type-Safe Navigation Hooks**:

```typescript
// src/hooks/useAppNavigation.ts
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BabyStackParamList } from '@/navigation/types';

type BabyNavigationProp = NativeStackNavigationProp<BabyStackParamList>;

export const useAppNavigation = () => {
  const navigation = useNavigation<BabyNavigationProp>();
  
  return {
    navigateToBabyList: () => 
      navigation.navigate('BabyList'),
    navigateToBabyProfile: (babyId: string) => 
      navigation.navigate('BabyProfile', { babyId }),
    navigateToBabyEvents: (babyId: string, eventType?: string) => 
      navigation.navigate('BabyEvents', { babyId, eventType }),
    navigateToAddEvent: (babyId: string, eventType: string) => 
      navigation.navigate('AddEvent', { babyId, eventType }),
  };
};

// Type-safe route params
export function useBabyProfileRoute() {
  return useRoute<RouteProp<BabyStackParamList, 'BabyProfile'>>();
}

export function useBabyEventsRoute() {
  return useRoute<RouteProp<BabyStackParamList, 'BabyEvents'>>();
}

export function useAddEventRoute() {
  return useRoute<RouteProp<BabyStackParamList, 'AddEvent'>>();
}
```

### Cross-Platform Navigation Pattern

For components that need to navigate in both web and mobile contexts, create a platform-agnostic pattern:

```typescript
// src/components/features/BabyItem.tsx (Shared logic)
import React from 'react';
import { Baby } from '@/types';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/utils/date';

// Import platform-specific navigation hook
import { useNavigation } from './useNavigation';

interface BabyItemProps {
  baby: Baby;
}

export const BabyItem: React.FC<BabyItemProps> = ({ baby }) => {
  const { navigateToBabyProfile, navigateToBabyEvents } = useNavigation();
  
  return (
    <Card>
      <Text variant="heading">{baby.name}</Text>
      <Text>Birth Date: {formatDate(baby.birthDate)}</Text>
      
      <Button 
        variant="primary" 
        onPress={() => navigateToBabyProfile(baby.id)}
      >
        View Profile
      </Button>
      
      <Button 
        variant="outline" 
        onPress={() => navigateToBabyEvents(baby.id)}
      >
        View Events
      </Button>
    </Card>
  );
};

// src/components/features/useNavigation.web.ts
import { useAppNavigation } from '@/utils/navigation';

export const useNavigation = () => {
  const {
    navigateToBabyProfile,
    navigateToBabyEvents,
    navigateToAddEvent
  } = useAppNavigation();
  
  return {
    navigateToBabyProfile,
    navigateToBabyEvents,
    navigateToAddEvent
  };
};

// src/components/features/useNavigation.native.ts
import { useAppNavigation } from '@/hooks/useAppNavigation';

export const useNavigation = () => {
  const {
    navigateToBabyProfile,
    navigateToBabyEvents,
    navigateToAddEvent
  } = useAppNavigation();
  
  return {
    navigateToBabyProfile,
    navigateToBabyEvents,
    navigateToAddEvent
  };
};
```

### Deep Linking

1. **Web (Next.js)**:
   - Handled automatically through URL structure
   - Ensure URLs are consistent with mobile deep links

2. **React Native**:
   - Configure deep linking to match web URL structure

```typescript
// src/navigation/linking.ts
export const linking = {
  prefixes: ['babytracker://', 'https://babytracker.app'],
  
  config: {
    screens: {
      Main: {
        screens: {
          Babies: {
            screens: {
              BabyList: 'babies',
              BabyProfile: 'babies/:babyId',
              BabyEvents: 'babies/:babyId/events',
              AddEvent: 'babies/:babyId/events/add',
            },
          },
          Home: '',
          Settings: 'settings',
        },
      },
      Auth: {
        screens: {
          Login: 'login',
          Register: 'register',
          ForgotPassword: 'forgot-password',
        },
      },
    },
  },
};

// In AppNavigator.tsx
import { linking } from './linking';

// ...

return (
  <NavigationContainer linking={linking}>
    {/* ... */}
  </NavigationContainer>
);
```

### Navigation Guards

1. **Web Implementation**:

```typescript
// src/middleware.ts (Next.js)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authToken = request.cookies.get('auth_token')?.value;
  
  // Protected routes need authentication
  const protectedRoutes = ['/babies', '/settings'];
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  // Auth routes are for non-authenticated users
  const authRoutes = ['/login', '/register', '/forgot-password'];
  const isAuthRoute = authRoutes.some(route => pathname === route);
  
  // Redirect logic
  if (isProtectedRoute && !authToken) {
    // Redirect to login if trying to access protected route without auth
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  if (isAuthRoute && authToken) {
    // Redirect to dashboard if authenticated user tries to access auth routes
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

2. **Mobile Implementation**:

```typescript
// src/hooks/useAuth.ts
import { useState, useEffect, useCallback } from 'react';
import { storageService } from '@/services/storage';
import { authService } from '@/services/authService';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any>(null);
  
  // Check auth status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const token = await storageService.getItem('auth_token');
        
        if (token) {
          // Verify token is still valid
          const userData = await authService.validateToken();
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        // Token is invalid
        setIsAuthenticated(false);
        setUser(null);
        await storageService.removeItem('auth_token');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  // Login handler
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { token, user } = await authService.login(email, password);
      await storageService.setItem('auth_token', token);
      setUser(user);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      };
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Logout handler
  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      await storageService.removeItem('auth_token');
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  return { isAuthenticated, isLoading, user, login, logout };
}
```

### Navigation Best Practices

1. **Consistent Route Structure**:
   - Use the same route naming and structure across platforms
   - Web: `/babies/:babyId/events`
   - Mobile: `Babies/BabyEvents` with `{ babyId }` param

2. **Type Safety First**:
   - Define route parameters as TypeScript interfaces
   - Use type guards for validating route parameters

3. **Abstract Navigation Logic**:
   - Create platform-agnostic navigation hooks
   - Components should not know which platform they're running on

4. **Handle Deep Links**:
   - Support the same deep link structure across platforms
   - Test deep linking during development

5. **Loading States**:
   - Handle navigation transition states gracefully
   - Show loading indicators during navigation

6. **Error Boundaries**:
   - Implement error boundaries for navigation failures
   - Provide fallback/recovery navigation options

## API and Data Fetching

A well-designed API layer is crucial for cross-platform development. By creating a platform-agnostic API service with TypeScript, we can ensure consistent data handling while accommodating platform-specific needs like offline support.

### Architecture Overview

1. **Shared API Service Layer**: Platform-agnostic fetch wrapper with TypeScript
2. **Domain-Specific API Services**: Specialized services for each entity (babies, events, etc.)
3. **Platform-Specific Adaptations**: 
   - Web: Server-side rendering considerations 
   - Mobile: Offline capabilities and synchronization

### 1. Shared API Service

```typescript
// src/services/api.ts
import { ApiResponse } from '../types';

// Base configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.yourbabytrackerapp.com';

// Error types
export class ApiError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

// Type-safe fetch wrapper
export async function apiRequest<T>(
  endpoint: string, 
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  try {
    const {
      method = 'GET',
      headers = {},
      body,
      requiresAuth = true
    } = options;

    // Setup headers
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers
    };

    // Add auth token if needed
    if (requiresAuth) {
      const token = await getAuthToken();
      if (token) {
        requestHeaders.Authorization = `Bearer ${token}`;
      }
    }

    // Build request config
    const config: RequestInit = {
      method,
      headers: requestHeaders
    };

    // Add request body if present
    if (body) {
      config.body = JSON.stringify(body);
    }

    // Execute request
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Parse response JSON
    const data = await response.json();
    
    // Handle error responses
    if (!response.ok) {
      throw new ApiError(
        data.message || `API error with status ${response.status}`,
        response.status
      );
    }
    
    return {
      success: true,
      data: data as T
    };
  } catch (error) {
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new NetworkError('Network request failed. Please check your connection.');
    }
    
    // Re-throw API errors
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Handle unexpected errors
    throw new Error(
      error instanceof Error ? error.message : 'An unexpected error occurred'
    );
  }
}
```

### 2. Domain-Specific Services

```typescript
// src/services/babyEventService.ts
import { apiRequest } from './api';
import { BabyEvent, ApiResponse, EventType, EventData } from '../types';

// Get all events for a baby
export async function getEvents(
  babyId: string,
  options: { type?: EventType; limit?: number } = {}
): Promise<ApiResponse<BabyEvent[]>> {
  let endpoint = `/babies/${babyId}/events`;
  
  // Add query parameters
  const params = new URLSearchParams();
  if (options.type) params.append('type', options.type);
  if (options.limit) params.append('limit', options.limit.toString());
  
  if (params.toString()) {
    endpoint += `?${params.toString()}`;
  }
  
  return apiRequest<BabyEvent[]>(endpoint);
}

// Add a new event
export async function addEvent(
  babyId: string,
  eventType: EventType,
  eventData: EventData
): Promise<ApiResponse<BabyEvent>> {
  return apiRequest<BabyEvent>(`/babies/${babyId}/events`, {
    method: 'POST',
    body: {
      type: eventType,
      data: eventData,
      timestamp: new Date().toISOString()
    }
  });
}

// Export as a service object
export const babyEventService = {
  getEvents,
  addEvent,
  // Other methods...
};
```

### 3. Web Implementation (Next.js)

Use React Query with the shared API service:

```typescript
// src/hooks/useQueryBabyEvents.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { babyEventService } from '@/services/babyEventService';
import { BabyEvent, EventType, EventData } from '@/types';

// Query keys
export const eventKeys = {
  byBaby: (babyId: string) => ['events', babyId],
  byBabyAndType: (babyId: string, type?: EventType) => 
    ['events', babyId, type],
};

// Get all events for a baby
export function useQueryBabyEvents(
  babyId: string,
  eventType?: EventType,
  options?: { limit?: number }
) {
  const queryKey = eventType 
    ? eventKeys.byBabyAndType(babyId, eventType)
    : eventKeys.byBaby(babyId);
    
  return useQuery({
    queryKey,
    queryFn: async () => {
      const response = await babyEventService.getEvents(
        babyId, 
        { type: eventType, limit: options?.limit }
      );
      return response.data || [];
    },
    enabled: !!babyId
  });
}

// Add event
export function useAddBabyEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      babyId,
      eventType,
      eventData
    }: {
      babyId: string;
      eventType: EventType;
      eventData: EventData;
    }) => {
      const response = await babyEventService.addEvent(
        babyId,
        eventType,
        eventData
      );
      
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ 
        queryKey: eventKeys.byBaby(variables.babyId)
      });
    }
  });
}
```

### 4. Mobile Implementation (React Native)

Extend the web implementation with offline support:

```typescript
// src/services/localDatabase.ts (React Native only)
import { database } from './databaseSetup';
import { BabyEvent, EventType } from '@/types';

export const localDatabase = {
  // Event operations
  async getEvents(
    babyId: string, 
    eventType?: EventType,
    limit?: number
  ): Promise<BabyEvent[]> {
    const eventCollection = database.get('baby_events');
    let query = eventCollection.query(Q.where('baby_id', babyId));
    
    if (eventType) {
      query = query.extend(Q.where('type', eventType));
    }
    
    // Additional query building...
    
    const events = await query.fetch();
    return events.map(event => ({
      id: event.id,
      babyId: event.babyId,
      type: event.type as EventType,
      timestamp: event.timestamp,
      data: JSON.parse(event.data),
      isSync: event.isSync,
      serverId: event.serverId
    }));
  },
  
  async addEvent(event: BabyEvent): Promise<void> {
    await database.action(async () => {
      const eventCollection = database.get('baby_events');
      await eventCollection.create(record => {
        record.id = event.id;
        record.babyId = event.babyId;
        record.type = event.type;
        record.timestamp = event.timestamp;
        record.data = JSON.stringify(event.data);
        record.isSync = event.isSync || false;
        record.serverId = event.serverId;
      });
    });
  },
  
  // Other methods...
};
```

```typescript
// src/hooks/useOfflineQueryBabyEvents.ts (React Native only)
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { babyEventService } from '@/services/babyEventService';
import { localDatabase } from '@/services/localDatabase';
import { networkManager } from '@/utils/NetworkManager';
import { BabyEvent, EventType, EventData } from '@/types';
import { eventKeys } from './useQueryBabyEvents';

// Get all events for a baby with offline support
export function useOfflineQueryBabyEvents(
  babyId: string,
  eventType?: EventType,
  options?: { limit?: number }
) {
  const queryKey = eventType 
    ? eventKeys.byBabyAndType(babyId, eventType)
    : eventKeys.byBaby(babyId);
    
  return useQuery({
    queryKey,
    queryFn: async () => {
      try {
        // Try to fetch from API first if online
        if (networkManager.isConnected()) {
          const response = await babyEventService.getEvents(
            babyId, 
            { type: eventType, limit: options?.limit }
          );
          
          // Store in local database for offline access
          if (response.data) {
            // Save each event to local DB (implementation omitted)
          }
          
          return response.data || [];
        } else {
          // If offline, get from local database
          return await localDatabase.getEvents(
            babyId,
            eventType,
            options?.limit
          );
        }
      } catch (error) {
        // If API request fails, try local database as fallback
        return await localDatabase.getEvents(
          babyId,
          eventType,
          options?.limit
        );
      }
    },
    enabled: !!babyId
  });
}

// Add event with offline support
export function useOfflineAddBabyEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      babyId,
      eventType,
      eventData
    }: {
      babyId: string;
      eventType: EventType;
      eventData: EventData;
    }) => {
      const timestamp = new Date().toISOString();
      const tempEvent: BabyEvent = {
        // Temporary local ID
        id: `local_${Date.now()}`,
        babyId,
        type: eventType,
        timestamp,
        data: eventData,
        isSync: false
      };
      
      // Always save locally first
      await localDatabase.addEvent(tempEvent);
      
      // If online, try to sync immediately
      if (networkManager.isConnected()) {
        try {
          const response = await babyEventService.addEvent(
            babyId,
            eventType,
            eventData
          );
          
          // Update local record with server data
          if (response.data) {
            await localDatabase.updateEvent(tempEvent.id, {
              ...response.data,
              isSync: true,
              serverId: response.data.id
            });
            
            return response.data;
          }
        } catch (error) {
          // Network request failed, but we already saved locally
          console.log('Failed to sync event, will try later');
        }
      }
      
      // Return the local event if server sync failed or offline
      return tempEvent;
    },
    onSuccess: (data, variables) => {
      // Update queries
      queryClient.invalidateQueries({ 
        queryKey: eventKeys.byBaby(variables.babyId)
      });
    }
  });
}
```

### 5. Network Status Monitoring (React Native)

```typescript
// src/utils/NetworkManager.ts (React Native only)
import NetInfo from '@react-native-community/netinfo';
import { syncUnsynced } from './SyncManager';

class NetworkManager {
  private isOnline: boolean = false;
  private listeners: ((isOnline: boolean) => void)[] = [];
  private unsubscribe: (() => void) | null = null;

  init() {
    // Start listening for network changes
    this.unsubscribe = NetInfo.addEventListener(state => {
      const wasOnline = this.isOnline;
      this.isOnline = state.isConnected && state.isInternetReachable;
      
      // Notify listeners
      this.listeners.forEach(listener => listener(this.isOnline));
      
      // If we just came online, trigger sync
      if (!wasOnline && this.isOnline) {
        syncUnsynced();
      }
    });
  }
  
  isConnected() {
    return this.isOnline;
  }
  
  // Other methods...
}

export const networkManager = new NetworkManager();
```

### 6. Sync Management (React Native)

```typescript
// src/utils/SyncManager.ts (React Native)
import { database } from '@/services/localDatabase';
import { babyEventService } from '@/services/babyEventService';
import { networkManager } from './NetworkManager';

// Sync all unsynced records
export const syncUnsynced = async () => {
  if (!networkManager.isConnected()) {
    return { success: false, reason: 'offline' };
  }
  
  try {
    // Get all unsynced events
    const eventCollection = database.get('baby_events');
    const unsyncedEvents = await eventCollection
      .query(Q.where('is_synced', false))
      .fetch();
    
    // Process each event
    const results = [];
    
    await database.action(async () => {
      for (const event of unsyncedEvents) {
        try {
          // Process event (implementation simplified)
          const eventType = event.type;
          const eventData = JSON.parse(event.data);
          
          const response = await babyEventService.addEvent(
            event.babyId,
            eventType,
            eventData
          );
          
          // Update local record with server data
          await event.update(record => {
            record.serverId = response.data.id;
            record.isSync = true;
          });
          
          results.push({
            id: event.id,
            status: 'success'
          });
        } catch (error) {
          results.push({
            id: event.id,
            status: 'error',
            error: error.message
          });
        }
      }
    });
    
    return {
      success: true,
      total: unsyncedEvents.length,
      results
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};
```

### Key Patterns and Best Practices

1. **Shared API Utilities**
   - Use TypeScript for type-safe API responses
   - Create shared error classes and handling patterns
   - Define domain-specific services that use the core API layer

2. **State Management Integration**
   - Use React Query for both platforms with consistent patterns
   - Keep query keys and fetch functions consistent
   - Adapt React Query's caching to both platforms' needs

3. **Web-Specific Considerations**
   - Implement SSR-compatible data fetching with Next.js
   - Use SWR pattern for optimal UX

4. **Mobile-Specific Patterns**
   - Always save locally first, then sync with server
   - Implement background synchronization when coming online
   - Use optimistic UI updates for immediate feedback
   - Handle conflict resolution between local and server data

5. **Error Handling and Retry Logic**
   - Implement consistent error handling across platforms
   - Use exponential backoff for retries on mobile
   - Provide clear error messages for different failure scenarios

By maintaining a shared core API layer while adapting to platform-specific requirements, you can ensure consistent data handling across both web and mobile platforms while providing an optimal user experience on each.

## Form Handling

Form handling is a crucial aspect of any baby tracking app. By using React Hook Form across both platforms, we can maintain consistent validation logic and state management while adapting to platform-specific UI components.

### Shared Form Logic

#### 1. Common Form Types and Interfaces

```typescript
// src/types/forms.ts
export interface FormFieldValidation {
  required?: boolean | string;
  min?: number | { value: number; message: string };
  max?: number | { value: number; message: string };
  minLength?: number | { value: number; message: string };
  maxLength?: number | { value: number; message: string };
  pattern?: RegExp | { value: RegExp; message: string };
  validate?: (value: any) => boolean | string | Promise<boolean | string>;
}

export interface FormField<T> {
  name: keyof T & string;
  label: string;
  placeholder?: string;
  type?: 'text' | 'number' | 'email' | 'password' | 'date' | 'select' | 'textarea';
  options?: { label: string; value: string }[];
  defaultValue?: any;
  validation?: FormFieldValidation;
  helperText?: string;
}
```

#### 2. Reusable Validation Rules

```typescript
// src/utils/validation.ts
import { FormFieldValidation } from '@/types';

export const validationRules = {
  required: (message = 'This field is required'): FormFieldValidation => ({
    required: message
  }),
  
  email: (): FormFieldValidation => ({
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: 'Invalid email address'
    }
  }),
  
  positiveNumber: (): FormFieldValidation => ({
    validate: (value) => {
      const num = parseFloat(value);
      return !isNaN(num) && num > 0 || 'Value must be a positive number';
    }
  }),
  
  // Other validation rules...
};
```

### Web Implementation (Next.js)

Use React Hook Form with native HTML form elements:

```typescript
// src/components/features/BabyFeeding/BabyFeedingForm.tsx (Next.js)
import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useAddBabyEvent } from '@/hooks/useQueryBabyEvents';
import { validationRules } from '@/utils/validation';
import { EventData } from '@/types';

interface FeedingFormInputs {
  amount: string;
  unit: 'oz' | 'ml';
  feedingType: 'breast' | 'bottle' | 'solid';
  notes?: string;
}

interface BabyFeedingFormProps {
  babyId: string;
  onSuccess?: () => void;
}

const BabyFeedingForm: React.FC<BabyFeedingFormProps> = ({ 
  babyId,
  onSuccess
}) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FeedingFormInputs>({
    defaultValues: {
      amount: '4',
      unit: 'oz',
      feedingType: 'bottle'
    }
  });
  
  const addEvent = useAddBabyEvent();
  
  const onSubmit: SubmitHandler<FeedingFormInputs> = (data) => {
    // Create event data from form inputs
    const eventData: EventData = {
      amount: parseFloat(data.amount),
      unit: data.unit,
      feedingType: data.feedingType,
      notes: data.notes
    };
    
    addEvent.mutate(
      {
        babyId,
        eventType: 'feeding',
        eventData
      },
      {
        onSuccess: () => {
          reset();
          if (onSuccess) onSuccess();
        }
      }
    );
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium">
            Amount
          </label>
          <div className="mt-1 flex rounded-md">
            <Input
              id="amount"
              type="number"
              step="0.1"
              min="0"
              {...register('amount', { 
                ...validationRules.required(),
                ...validationRules.positiveNumber()
              })}
              error={errors.amount?.message}
            />
            <Select
              id="unit"
              {...register('unit')}
              className="ml-2"
            >
              <option value="oz">oz</option>
              <option value="ml">ml</option>
            </Select>
          </div>
        </div>
        
        <div>
          <label htmlFor="feedingType" className="block text-sm font-medium">
            Feeding Type
          </label>
          <Select
            id="feedingType"
            {...register('feedingType')}
            className="mt-1 block w-full"
          >
            <option value="bottle">Bottle</option>
            <option value="breast">Breast</option>
            <option value="solid">Solid Food</option>
          </Select>
        </div>
        
        {/* Notes field */}
        
        <div className="pt-4">
          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={addEvent.isPending}
          >
            {addEvent.isPending ? 'Saving...' : 'Save Feeding'}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default BabyFeedingForm;
```

### Mobile Implementation (React Native)

Adapt React Hook Form with the Controller component:

```typescript
// src/components/features/BabyFeeding/BabyFeedingForm.tsx (React Native)
import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { TextInput } from '@/components/ui/TextInput';
import { Dropdown } from '@/components/ui/Dropdown';
import { useAddBabyEvent } from '@/hooks/useOfflineQueryBabyEvents';
import { validationRules } from '@/utils/validation';
import { EventData } from '@/types';
import { colors, spacing } from '@/styles/theme';

interface FeedingFormInputs {
  amount: string; // Use string for RN TextInput
  unit: 'oz' | 'ml';
  feedingType: 'breast' | 'bottle' | 'solid';
  notes?: string;
}

interface BabyFeedingFormProps {
  babyId: string;
  onSuccess?: () => void;
}

const BabyFeedingForm: React.FC<BabyFeedingFormProps> = ({ 
  babyId,
  onSuccess
}) => {
  const { control, handleSubmit, formState: { errors }, reset } = useForm<FeedingFormInputs>({
    defaultValues: {
      amount: '4',
      unit: 'oz',
      feedingType: 'bottle',
      notes: ''
    }
  });
  
  const addEvent = useAddBabyEvent();
  
  const onSubmit: SubmitHandler<FeedingFormInputs> = (data) => {
    // Create event data from form inputs
    const eventData: EventData = {
      amount: parseFloat(data.amount),
      unit: data.unit,
      feedingType: data.feedingType,
      notes: data.notes
    };
    
    addEvent.mutate(
      {
        babyId,
        eventType: 'feeding',
        eventData
      },
      {
        onSuccess: () => {
          reset();
          if (onSuccess) onSuccess();
        }
      }
    );
  };
  
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.formGroup}>
        <Controller
          control={control}
          rules={{
            ...validationRules.required(),
            ...validationRules.positiveNumber()
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Amount"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder="Enter amount"
              keyboardType="numeric"
              error={errors.amount?.message}
            />
          )}
          name="amount"
        />
        
        <Controller
          control={control}
          render={({ field: { onChange, value } }) => (
            <Dropdown
              label="Unit"
              selectedValue={value}
              onValueChange={onChange}
              items={[
                { label: 'oz', value: 'oz' },
                { label: 'ml', value: 'ml' }
              ]}
            />
          )}
          name="unit"
        />
      </View>
      
      {/* Feeding Type field */}
      {/* Notes field */}
      
      <View style={styles.submitButton}>
        <Button
          onPress={handleSubmit(onSubmit)}
          variant="primary"
          fullWidth
          disabled={addEvent.isPending}
        >
          {addEvent.isPending ? 'Saving...' : 'Save Feeding'}
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md
  },
  formGroup: {
    marginBottom: spacing.md
  },
  submitButton: {
    marginTop: spacing.lg
  }
});

export default BabyFeedingForm;
```

### Creating Reusable Form Components

#### Form Builder Pattern

To further streamline form creation, implement a form builder that works on both platforms:

```typescript
// src/components/common/FormBuilder.tsx (Next.js)
import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { TextArea } from '@/components/ui/TextArea';
import { DatePicker } from '@/components/ui/DatePicker';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/types/forms';

interface FormBuilderProps<T> {
  fields: FormField<T>[];
  defaultValues?: Partial<T>;
  onSubmit: (data: T) => void;
  submitLabel?: string;
  isSubmitting?: boolean;
}

export function FormBuilder<T>({
  fields,
  defaultValues = {},
  onSubmit,
  submitLabel = 'Submit',
  isSubmitting = false
}: FormBuilderProps<T>) {
  const methods = useForm<T>({
    defaultValues: defaultValues as any
  });
  
  const { register, handleSubmit, formState: { errors } } = methods;
  
  const renderField = (field: FormField<T>) => {
    const { name, label, type = 'text', placeholder, options, validation, helperText } = field;
    
    switch (type) {
      case 'select':
        return (
          <div key={name as string} className="form-field">
            <label htmlFor={name as string} className="form-label">{label}</label>
            <Select
              id={name as string}
              {...register(name as any, validation)}
              error={errors[name]?.message as string}
            >
              {options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            {helperText && <p className="helper-text">{helperText}</p>}
            {errors[name] && <p className="error-text">{errors[name]?.message as string}</p>}
          </div>
        );
        
      case 'textarea':
        return (
          <div key={name as string} className="form-field">
            <label htmlFor={name as string} className="form-label">{label}</label>
            <TextArea
              id={name as string}
              placeholder={placeholder}
              {...register(name as any, validation)}
              error={errors[name]?.message as string}
            />
            {helperText && <p className="helper-text">{helperText}</p>}
            {errors[name] && <p className="error-text">{errors[name]?.message as string}</p>}
          </div>
        );
      
      case 'date':
        return (
          <div key={name as string} className="form-field">
            <label htmlFor={name as string} className="form-label">{label}</label>
            <DatePicker
              id={name as string}
              {...register(name as any, validation)}
              error={errors[name]?.message as string}
            />
            {helperText && <p className="helper-text">{helperText}</p>}
            {errors[name] && <p className="error-text">{errors[name]?.message as string}</p>}
          </div>
        );
        
      default:
        return (
          <div key={name as string} className="form-field">
            <label htmlFor={name as string} className="form-label">{label}</label>
            <Input
              id={name as string}
              type={type}
              placeholder={placeholder}
              {...register(name as any, validation)}
              error={errors[name]?.message as string}
            />
            {helperText && <p className="helper-text">{helperText}</p>}
            {errors[name] && <p className="error-text">{errors[name]?.message as string}</p>}
          </div>
        );
    }
  };
  
  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-fields">
          {fields.map(renderField)}
        </div>
        
        <div className="form-actions">
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : submitLabel}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
```

#### Mobile Form Builder

```typescript
// src/components/common/FormBuilder.tsx (React Native)
import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { TextInput } from '@/components/ui/TextInput';
import { Dropdown } from '@/components/ui/Dropdown';
import { DatePicker } from '@/components/ui/DatePicker';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/types/forms';
import { spacing } from '@/styles/theme';

interface FormBuilderProps<T> {
  fields: FormField<T>[];
  defaultValues?: Partial<T>;
  onSubmit: (data: T) => void;
  submitLabel?: string;
  isSubmitting?: boolean;
}

export function FormBuilder<T>({
  fields,
  defaultValues = {},
  onSubmit,
  submitLabel = 'Submit',
  isSubmitting = false
}: FormBuilderProps<T>) {
  const methods = useForm<T>({
    defaultValues: defaultValues as any
  });
  
  const { control, handleSubmit, formState: { errors } } = methods;
  
  const renderField = (field: FormField<T>) => {
    const { name, label, type = 'text', placeholder, options, validation, helperText } = field;
    
    switch (type) {
      case 'select':
        return (
          <View key={name as string} style={styles.formField}>
            <Controller
              control={control}
              name={name as any}
              rules={validation}
              render={({ field: { onChange, value } }) => (
                <Dropdown
                  label={label}
                  selectedValue={value}
                  onValueChange={onChange}
                  items={options || []}
                  error={errors[name]?.message as string}
                  helperText={helperText}
                />
              )}
            />
          </View>
        );
        
      case 'textarea':
        return (
          <View key={name as string} style={styles.formField}>
            <Controller
              control={control}
              name={name as any}
              rules={validation}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label={label}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder={placeholder}
                  multiline
                  numberOfLines={3}
                  error={errors[name]?.message as string}
                  helperText={helperText}
                />
              )}
            />
          </View>
        );
      
      case 'date':
        return (
          <View key={name as string} style={styles.formField}>
            <Controller
              control={control}
              name={name as any}
              rules={validation}
              render={({ field: { onChange, value } }) => (
                <DatePicker
                  label={label}
                  value={value}
                  onChange={onChange}
                  error={errors[name]?.message as string}
                  helperText={helperText}
                />
              )}
            />
          </View>
        );
        
      default:
        return (
          <View key={name as string} style={styles.formField}>
            <Controller
              control={control}
              name={name as any}
              rules={validation}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label={label}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder={placeholder}
                  keyboardType={type === 'number' ? 'numeric' : 'default'}
                  secureTextEntry={type === 'password'}
                  error={errors[name]?.message as string}
                  helperText={helperText}
                />
              )}
            />
          </View>
        );
    }
  };
  
  return (
    <FormProvider {...methods}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.formFields}>
          {fields.map(renderField)}
        </View>
        
        <View style={styles.formActions}>
          <Button
            onPress={handleSubmit(onSubmit)}
            variant="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : submitLabel}
          </Button>
        </View>
      </ScrollView>
    </FormProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md
  },
  formFields: {
    gap: spacing.md
  },
  formField: {
    marginBottom: spacing.md
  },
  formActions: {
    marginTop: spacing.lg
  }
});
```

### Usage with Form Configuration

With the FormBuilder component, you can create forms using configuration objects:

```typescript
// src/components/features/BabyForm/BabyForm.tsx (Shared logic)
import React from 'react';
import { FormBuilder } from '@/components/common/FormBuilder';
import { validationRules } from '@/utils/validation';
import { Baby } from '@/types';

interface BabyFormProps {
  initialData?: Partial<Baby>;
  onSubmit: (data: Partial<Baby>) => Promise<void>;
  isSubmitting?: boolean;
}

// This form configuration can be shared between platforms
const babyFormFields = [
  {
    name: 'name',
    label: 'Baby Name',
    type: 'text',
    placeholder: 'Enter baby name',
    validation: validationRules.required('Baby name is required')
  },
  {
    name: 'birthDate',
    label: 'Birth Date',
    type: 'date',
    validation: validationRules.required('Birth date is required')
  },
  {
    name: 'gender',
    label: 'Gender',
    type: 'select',
    options: [
      { label: 'Male', value: 'male' },
      { label: 'Female', value: 'female' },
      { label: 'Other', value: 'other' }
    ],
    validation: validationRules.required('Gender is required')
  },
  {
    name: 'notes',
    label: 'Notes',
    type: 'textarea',
    placeholder: 'Any additional notes about your baby'
  }
];

export const BabyForm: React.FC<BabyFormProps> = ({
  initialData = {},
  onSubmit,
  isSubmitting = false
}) => {
  return (
    <FormBuilder
      fields={babyFormFields}
      defaultValues={initialData}
      onSubmit={onSubmit}
      submitLabel={initialData.id ? 'Update Baby' : 'Add Baby'}
      isSubmitting={isSubmitting}
    />
  );
};
```

### Form Submission Logic

Handle form submission consistently:

```typescript
// src/hooks/useBabyForm.ts (Shared logic)
import { useState } from 'react';
import { useAddBaby, useUpdateBaby } from '@/hooks/useQueryBabies';
import { Baby } from '@/types';

interface UseBabyFormResult {
  submitBaby: (data: Partial<Baby>) => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
}

export function useBabyForm(
  baby?: Partial<Baby>,
  onSuccess?: () => void
): UseBabyFormResult {
  const [error, setError] = useState<string | null>(null);
  
  const addBaby = useAddBaby();
  const updateBaby = useUpdateBaby();
  
  const isSubmitting = addBaby.isPending || updateBaby.isPending;
  
  const submitBaby = async (data: Partial<Baby>) => {
    try {
      setError(null);
      
      if (baby?.id) {
        // Update existing baby
        await updateBaby.mutateAsync({
          babyId: baby.id,
          data
        });
      } else {
        // Add new baby
        await addBaby.mutateAsync(data);
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };
  
  return {
    submitBaby,
    isSubmitting,
    error
  };
}
```

### Form Best Practices

1. **Single Source of Truth**:
   - Keep form validation logic in one place
   - Share field configuration between platforms

2. **Platform-Specific Input Components**:
   - Create platform-specific input components with consistent APIs
   - Handle keyboard types appropriately on mobile

3. **Error Handling**:
   - Provide clear error messages at field and form levels
   - Maintain consistent error styling across platforms

4. **Accessibility**:
   - Use proper labels and ARIA attributes on web
   - Implement accessibility props on React Native

5. **Form Submission**:
   - Handle loading states during submission
   - Provide clear success/error feedback
   - Implement optimistic updates when appropriate

6. **Mobile-Specific Considerations**:
   - Optimize for touch interaction (larger touch targets)
   - Handle keyboard appearance/dismissal properly
   - Implement proper scrolling when keyboard appears

By maintaining shared validation logic and field configuration while adapting the UI implementation to each platform, you can ensure a consistent user experience while leveraging the native capabilities of each platform.

## Platform-Specific Code

Even with a well-designed cross-platform architecture, you'll inevitably need platform-specific implementations for certain features. This section covers strategies for handling platform-specific code while maintaining a clean and consistent codebase.

### 1. Platform Detection

Create a simple utility for detecting the current platform:

```typescript
// src/utils/platform.ts
export const isWeb = typeof window !== 'undefined' && 'document' in window;
export const isNative = !isWeb;
export const isIOS = isNative && typeof navigator !== 'undefined' && /iphone|ipad|ipod/i.test(navigator.userAgent);
export const isAndroid = isNative && typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent);

export const Platform = {
  isWeb,
  isNative,
  isIOS,
  isAndroid,
  OS: isIOS ? 'ios' : isAndroid ? 'android' : isWeb ? 'web' : 'unknown',
  select: <T>(options: { web?: T; native?: T; ios?: T; android?: T; default?: T }): T | undefined => {
    if (isWeb && options.web !== undefined) return options.web;
    if (isIOS && options.ios !== undefined) return options.ios;
    if (isAndroid && options.android !== undefined) return options.android;
    if (isNative && options.native !== undefined) return options.native;
    return options.default;
  }
};
```

### 2. Abstraction Layers

#### Storage Service

```typescript
// src/services/storage/types.ts
export interface StorageService {
  setItem: (key: string, value: string) => Promise<void>;
  getItem: (key: string) => Promise<string | null>;
  removeItem: (key: string) => Promise<void>;
  clear: () => Promise<void>;
}

// src/services/storage/index.web.ts
import { StorageService } from './types';

class WebStorageService implements StorageService {
  async setItem(key: string, value: string): Promise<void> {
    localStorage.setItem(key, value);
  }

  async getItem(key: string): Promise<string | null> {
    return localStorage.getItem(key);
  }

  async removeItem(key: string): Promise<void> {
    localStorage.removeItem(key);
  }

  async clear(): Promise<void> {
    localStorage.clear();
  }
}

export const storageService: StorageService = new WebStorageService();

// src/services/storage/index.native.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageService } from './types';

class MobileStorageService implements StorageService {
  async setItem(key: string, value: string): Promise<void> {
    await AsyncStorage.setItem(key, value);
  }

  async getItem(key: string): Promise<string | null> {
    return await AsyncStorage.getItem(key);
  }

  async removeItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  }

  async clear(): Promise<void> {
    await AsyncStorage.clear();
  }
}

export const storageService: StorageService = new MobileStorageService();
```

### 3. Platform-Specific UI Components

#### DatePicker Component

```typescript
// src/components/ui/DatePicker/types.ts
export interface DatePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  minDate?: Date;
  maxDate?: Date;
}

// src/components/ui/DatePicker/index.web.tsx
import React from 'react';
import { DatePickerProps } from './types';
import styles from './DatePicker.module.css';

const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  label,
  placeholder = 'Select date',
  error,
  minDate,
  maxDate
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      onChange(new Date(e.target.value));
    } else {
      onChange(null);
    }
  };

  const formatDateForInput = (date: Date | null): string => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  return (
    <div className={styles.container}>
      {label && <label className={styles.label}>{label}</label>}
      <input
        type="date"
        value={formatDateForInput(value)}
        onChange={handleChange}
        placeholder={placeholder}
        min={minDate ? formatDateForInput(minDate) : undefined}
        max={maxDate ? formatDateForInput(maxDate) : undefined}
        className={`${styles.input} ${error ? styles.inputError : ''}`}
      />
      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
};

export default DatePicker;

// src/components/ui/DatePicker/index.native.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { DatePickerProps } from './types';
import { colors, spacing, typography } from '@/styles/theme';

const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  label,
  placeholder = 'Select date',
  error,
  minDate,
  maxDate
}) => {
  const [show, setShow] = useState(false);

  const showDatePicker = () => {
    setShow(true);
  };

  const handleChange = (event: any, selectedDate?: Date) => {
    setShow(Platform.OS === 'ios');
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  const formatDisplayDate = (date: Date | null): string => {
    if (!date) return placeholder;
    return date.toLocaleDateString();
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={[styles.input, error ? styles.inputError : null]}
        onPress={showDatePicker}
      >
        <Text style={!value ? styles.placeholder : styles.dateText}>
          {formatDisplayDate(value)}
        </Text>
      </TouchableOpacity>
      {error && <Text style={styles.error}>{error}</Text>}
      
      {show && (
        <DateTimePicker
          value={value || new Date()}
          mode="date"
          display="default"
          onChange={handleChange}
          minimumDate={minDate}
          maximumDate={maxDate}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.xs,
    color: colors.text.primary,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.text.secondary,
    borderRadius: 4,
    padding: spacing.sm,
    backgroundColor: colors.background.light,
  },
  inputError: {
    borderColor: colors.error,
  },
  placeholder: {
    color: colors.text.secondary,
  },
  dateText: {
    color: colors.text.primary,
  },
  error: {
    color: colors.error,
    fontSize: typography.fontSize.xs,
    marginTop: spacing.xs,
  },
});

export default DatePicker;
```

### 4. Conditional Imports and File Extensions

Next.js and React Native build systems can be configured to automatically select the correct file based on the platform:

#### Next.js Configuration

```js
// next.config.js
module.exports = {
  webpack: (config) => {
    // Make Next.js handle .web.ts(x) and .native.ts(x) files
    config.resolve.extensions = [
      '.web.js', '.web.ts', '.web.tsx',
      '.js', '.jsx', '.ts', '.tsx',
    ];
    return config;
  },
};
```

#### React Native Configuration

```js
// metro.config.js
module.exports = {
  resolver: {
    sourceExts: ['native.ts', 'native.tsx', 'ts', 'tsx', 'js', 'jsx'],
  },
};
```

#### Usage Example

```typescript
// Import will resolve to the appropriate file based on platform
import { DatePicker } from '@/components/ui/DatePicker';
```

### 5. Feature Detection vs. Platform Detection

Prefer feature detection over platform detection when possible:

```typescript
// Avoid this pattern when possible
if (Platform.isIOS) {
  // iOS-specific code
} else if (Platform.isAndroid) {
  // Android-specific code
} else {
  // Web-specific code
}

// Prefer this pattern
if (typeof window.localStorage !== 'undefined') {
  // Environment has localStorage
} else if (typeof AsyncStorage !== 'undefined') {
  // Environment has AsyncStorage
} else {
  // Fallback storage mechanism
}
```

### 6. Platform-Specific Hooks

Create hooks that provide platform-specific functionality with a consistent API:

```typescript
// src/hooks/useDeviceInfo/types.ts
export interface DeviceInfo {
  id: string;
  name: string;
  platform: 'ios' | 'android' | 'web';
  osVersion: string;
  appVersion: string;
}

// src/hooks/useDeviceInfo/index.web.ts
import { useState, useEffect } from 'react';
import { DeviceInfo } from './types';

export function useDeviceInfo(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    id: 'web',
    name: 'Web Browser',
    platform: 'web',
    osVersion: navigator.userAgent,
    appVersion: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  });

  useEffect(() => {
    // For web, we could potentially extract more info from the navigator object
    // But this is a simple example
  }, []);

  return deviceInfo;
}

// src/hooks/useDeviceInfo/index.native.ts
import { useState, useEffect } from 'react';
import DeviceInfo from 'react-native-device-info';
import { Platform } from 'react-native';
import { DeviceInfo as DeviceInfoType } from './types';

export function useDeviceInfo(): DeviceInfoType {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfoType>({
    id: '',
    name: '',
    platform: (Platform.OS as 'ios' | 'android'),
    osVersion: Platform.Version.toString(),
    appVersion: DeviceInfo.getVersion(),
  });

  useEffect(() => {
    const getDeviceInfo = async () => {
      const id = await DeviceInfo.getUniqueId();
      const name = await DeviceInfo.getDeviceName();
      
      setDeviceInfo(prev => ({
        ...prev,
        id,
        name,
      }));
    };

    getDeviceInfo();
  }, []);

  return deviceInfo;
}
```

### 7. Implementing Camera Access

Camera access is a good example of functionality that requires completely different implementations between web and mobile:

```typescript
// src/hooks/useCamera/types.ts
export interface CameraOptions {
  quality?: number; // 0 to 1
  allowEditing?: boolean;
  includeBase64?: boolean;
}

export interface CapturedImage {
  uri: string;
  width: number;
  height: number;
  base64?: string;
}

export interface CameraResult {
  capturePhoto: (options?: CameraOptions) => Promise<CapturedImage | null>;
  selectFromGallery: (options?: CameraOptions) => Promise<CapturedImage | null>;
  isAvailable: boolean;
}

// src/hooks/useCamera/index.web.ts
import { useState, useEffect, useRef } from 'react';
import { CameraOptions, CapturedImage, CameraResult } from './types';

export function useCamera(): CameraResult {
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // Check if camera is available on this device
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(() => setIsAvailable(true))
        .catch(() => setIsAvailable(false));
    }
    
    // Create a hidden file input for gallery selection
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';
    document.body.appendChild(input);
    fileInputRef.current = input;
    
    return () => {
      if (fileInputRef.current) {
        document.body.removeChild(fileInputRef.current);
      }
    };
  }, []);

  const capturePhoto = async (options: CameraOptions = {}): Promise<CapturedImage | null> => {
    if (!isAvailable) return null;
    
    try {
      // This is a simplified implementation - in a real app, you'd create a proper camera UI
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      
      // Create video and canvas elements
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();
      
      // Take snapshot
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);
      
      // Stop camera
      stream.getTracks().forEach(track => track.stop());
      
      // Convert to image data
      const quality = options.quality || 0.8;
      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      const base64 = options.includeBase64 ? dataUrl.split(',')[1] : undefined;
      
      return {
        uri: dataUrl,
        width: canvas.width,
        height: canvas.height,
        base64
      };
    } catch (error) {
      console.error('Error capturing photo:', error);
      return null;
    }
  };

  const selectFromGallery = async (options: CameraOptions = {}): Promise<CapturedImage | null> => {
    if (!fileInputRef.current) return null;
    
    return new Promise((resolve) => {
      if (!fileInputRef.current) {
        resolve(null);
        return;
      }
      
      fileInputRef.current.onchange = async (event) => {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];
        
        if (!file) {
          resolve(null);
          return;
        }
        
        // Read the file
        const reader = new FileReader();
        reader.onload = () => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const quality = options.quality || 0.8;
            
            // Resize if needed (simplified)
            canvas.width = img.width;
            canvas.height = img.height;
            
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0);
            
            const dataUrl = canvas.toDataURL('image/jpeg', quality);
            const base64 = options.includeBase64 ? dataUrl.split(',')[1] : undefined;
            
            resolve({
              uri: dataUrl,
              width: canvas.width,
              height: canvas.height,
              base64
            });
          };
          img.src = reader.result as string;
        };
        reader.readAsDataURL(file);
        
        // Reset the input value so the same file can be selected again
        target.value = '';
      };
      
      fileInputRef.current.click();
    });
  };

  return {
    capturePhoto,
    selectFromGallery,
    isAvailable
  };
}

// src/hooks/useCamera/index.native.ts
import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { CameraOptions, CapturedImage, CameraResult } from './types';

export function useCamera(): CameraResult {
  const [isAvailable, setIsAvailable] = useState<boolean>(false);

  useEffect(() => {
    // Check permissions
    const checkPermissions = async () => {
      const cameraPermission = await Camera.requestCameraPermissionsAsync();
      const galleryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      setIsAvailable(
        cameraPermission.status === 'granted' && 
        galleryPermission.status === 'granted'
      );
    };
    
    checkPermissions();
  }, []);

  const capturePhoto = async (options: CameraOptions = {}): Promise<CapturedImage | null> => {
    if (!isAvailable) return null;
    
    try {
      const result = await ImagePicker.launchCameraAsync({
        quality: options.quality || 0.8,
        allowsEditing: options.allowEditing || false,
        base64: options.includeBase64 || false,
      });
      
      if (result.canceled) {
        return null;
      }
      
      const asset = result.assets[0];
      
      return {
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
        base64: asset.base64
      };
    } catch (error) {
      console.error('Error capturing photo:', error);
      return null;
    }
  };

  const selectFromGallery = async (options: CameraOptions = {}): Promise<CapturedImage | null> => {
    if (!isAvailable) return null;
    
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        quality: options.quality || 0.8,
        allowsEditing: options.allowEditing || false,
        base64: options.includeBase64 || false,
      });
      
      if (result.canceled) {
        return null;
      }
      
      const asset = result.assets[0];
      
      return {
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
        base64: asset.base64
      };
    } catch (error) {
      console.error('Error selecting from gallery:', error);
      return null;
    }
  };

  return {
    capturePhoto,
    selectFromGallery,
    isAvailable
  };
}
```

### 8. Handling Platform-Specific Features Gracefully

Create utility functions to check for feature availability:

```typescript
// src/utils/features.ts
export const features = {
  // Check if camera is available
  hasCamera: async (): Promise<boolean> => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
      return false;
    }
    
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.some(device => device.kind === 'videoinput');
    } catch (error) {
      return false;
    }
  },
  
  // Check if geolocation is available
  hasGeolocation: (): boolean => {
    return typeof navigator !== 'undefined' && 'geolocation' in navigator;
  },
  
  // Check if notifications are available
  hasNotifications: (): boolean => {
    return typeof window !== 'undefined' && 'Notification' in window;
  },
  
  // Check if local storage is available
  hasLocalStorage: (): boolean => {
    try {
      const testKey = 'test';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }
};
```

### Best Practices for Platform-Specific Code

1. **Abstract Platform Differences**:
   - Create clear interfaces for platform-specific implementations
   - Use dependency injection to provide platform-specific implementations

2. **Minimize Platform Checks**:
   - Avoid scattering platform checks throughout your codebase
   - Use platform-specific imports or extensions when possible

3. **Graceful Degradation**:
   - Check for feature availability before using platform-specific APIs
   - Provide fallbacks or graceful error messages when features are unavailable

4. **Consistent API Design**:
   - Ensure platform-specific implementations expose the same API
   - Use TypeScript interfaces to enforce API consistency

5. **Separate Business Logic**:
   - Keep core business logic platform-agnostic
   - Isolate platform-specific code to dedicated modules

6. **Testing**:
   - Test platform-specific implementations separately
   - Use dependency injection to mock platform-specific modules for testing

7. **Maintainability**:
   - Document platform-specific implementations thoroughly
   - Keep platform-specific code organized in a consistent directory structure

By following these practices, you can handle platform-specific requirements while maintaining a clean, maintainable codebase that maximizes code sharing between your web and mobile applications.

## LLM-Assisted Conversion Process

Large Language Models (LLMs) can significantly accelerate the process of converting components from Next.js to React Native. By providing structured prompts and clear instructions, you can leverage LLMs to handle much of the repetitive conversion work, freeing you to focus on more complex platform-specific implementations.

### 1. Conversion Template

When asking an LLM to convert a component, use a consistent template format:

```
I'm converting a Next.js component to React Native. Please help me implement the React Native version.

## Next.js Component:
```tsx
import React from 'react';
import styles from './Button.styles';

export interface ButtonProps {
  // Props definition...
}

const Button: React.FC<ButtonProps> = ({
  // Component implementation...
}) => {
  return (
    // JSX implementation...
  );
};

export default Button;
```

## Component Styles:
```tsx
// Styles implementation...
```

## Component Types:
```tsx
// Any additional type definitions...
```

## Requirements:
- Maintain the same props API
- Convert web-specific elements to React Native equivalents
- Adapt styles for React Native's StyleSheet
- Handle platform-specific behavior differences

## Additional Context:
- This button is used in form submissions
- Touch feedback should be visible on mobile
```

### 2. Component Analysis Checklist

Provide LLMs with a checklist to analyze components before conversion:

1. **Props Interface**:
   - Which props need to be maintained?
   - Do any props need platform-specific adaptations?

2. **Component Elements**:
   - Which HTML elements need React Native equivalents?
   - Are there nested elements that need special handling?

3. **Event Handlers**:
   - Which DOM events need to be converted to Touch events?
   - Are there any keyboard or focus events that need adaptation?

4. **Styling**:
   - Which CSS properties need to be converted?
   - Are there any CSS properties not supported in React Native?

5. **Accessibility**:
   - Which ARIA attributes need React Native accessibility props?
   - How should keyboard navigation be handled?

### 3. Conversion Mapping Reference

Provide a reference mapping of web to mobile elements:

| Web (Next.js) | React Native | Notes |
|---------------|--------------|-------|
| `<div>` | `<View>` | Base container |
| `<span>`, `<p>` | `<Text>` | All text must be inside Text component |
| `<img>` | `<Image>` | Requires width/height, resizeMode |
| `<input type="text">` | `<TextInput>` | Different props (value vs. defaultValue) |
| `<button>` | `<TouchableOpacity>` | Use with nested Text component |
| `<select>` | `<Picker>` | Different API for options |
| `<textarea>` | `<TextInput multiline>` | Set numberOfLines prop |
| `<a>` | `<TouchableOpacity>` | Use Linking API for external URLs |
| `onClick` | `onPress` | Event handler naming differs |
| `onChange` | `onChangeText` | TextInput uses simpler API |
| `onFocus/onBlur` | Same names but different event objects |
| CSS classes | StyleSheet objects | No class composition |
| CSS px units | Numbers | RN uses density-independent pixels |
| Media queries | Dimensions API | Use `useWindowDimensions()` hook |
| CSS Grid/Flexbox | Flexbox only | RN only supports Flexbox (with differences) |
| CSS pseudo-classes | State variables | No :hover, :active, etc. |

### 4. Style Conversion Guidelines

Provide clear guidance on handling styles:

```
When converting CSS to React Native StyleSheet:

1. Remove unsupported properties:
   - No 'cursor', 'transition', or 'animation'
   - No pseudo-selectors (:hover, :active, etc.)
   - No z-index (use View order instead)

2. Units conversion:
   - Remove all unit specifiers (px, rem, em, %)
   - Use numeric values only
   - Percentage widths/heights become strings: width: '50%'

3. Layout changes:
   - 'display: flex' is default in RN
   - No 'display: grid' or inline-block
   - No 'float' property

4. Color format:
   - RGB/RGBA, HEX, and named colors work
   - No 'currentColor' or CSS variables

5. Text styles:
   - Text styles only apply inside <Text> components
   - No inheritance of text styles

6. Shadow conversion:
   - Use shadowColor, shadowOffset, shadowOpacity, shadowRadius
   - For Android, use elevation property
```

### 5. Example Conversion

Here's a complete example of a component conversion:

#### Web Component (Next.js)

```tsx
// src/components/ui/InfoCard/InfoCard.tsx
import React from 'react';
import styles from './InfoCard.module.css';

export interface InfoCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'success' | 'warning' | 'error';
}

const InfoCard: React.FC<InfoCardProps> = ({
  title,
  description,
  icon,
  onPress,
  variant = 'default'
}) => {
  return (
    <div 
      className={`${styles.card} ${styles[variant]}`}
      onClick={onPress}
      role={onPress ? 'button' : undefined}
      tabIndex={onPress ? 0 : undefined}
    >
      {icon && <div className={styles.iconContainer}>{icon}</div>}
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>
      </div>
    </div>
  );
};

export default InfoCard;
```

```css
/* InfoCard.module.css */
.card {
  display: flex;
  padding: 16px;
  border-radius: 8px;
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
  cursor: pointer;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.iconContainer {
  margin-right: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.content {
  flex: 1;
}

.title {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
}

.description {
  margin: 0;
  font-size: 14px;
  color: #666666;
}

.default {
  border-left: 4px solid #3498db;
}

.success {
  border-left: 4px solid #2ecc71;
}

.warning {
  border-left: 4px solid #f39c12;
}

.error {
  border-left: 4px solid #e74c3c;
}
```

#### Converted Component (React Native)

```tsx
// src/components/ui/InfoCard/InfoCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@/styles/theme';

export interface InfoCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'success' | 'warning' | 'error';
}

const InfoCard: React.FC<InfoCardProps> = ({
  title,
  description,
  icon,
  onPress,
  variant = 'default'
}) => {
  const Container = onPress ? TouchableOpacity : View;
  
  return (
    <Container 
      style={[styles.card, styles[variant]]}
      onPress={onPress}
      activeOpacity={0.7}
      accessible={!!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
    >
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 8,
    backgroundColor: colors.background.light,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Shadow for Android
    elevation: 2,
  },
  iconContainer: {
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    marginBottom: 8,
    fontSize: 18,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  default: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  success: {
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  warning: {
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  error: {
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
});

export default InfoCard;
```

### 6. Conversion Workflow

Establish a systematic workflow for component conversion:

1. **Inventory Components**:
   - List all components that need conversion
   - Prioritize based on complexity and dependencies

2. **Start with UI Primitives**:
   - Convert basic UI components first (Button, Input, Card, etc.)
   - These form the foundation for more complex components

3. **Use LLM for Initial Conversion**:
   - Provide the component, styles, and context using the template
   - Review and refine the converted component

4. **Handle Platform-Specific Cases**:
   - Identify components that need significant platform-specific logic
   - Create separate implementations when necessary

5. **Verify and Test**:
   - Test all component props and behaviors
   - Verify accessibility features
   - Check on multiple device sizes

### 7. Handling Limitations and Edge Cases

LLMs may struggle with certain aspects of conversion:

1. **Complex Animations**:
   - Manual implementation often needed
   - Use React Native's Animated API instead of CSS transitions

2. **Third-Party Integrations**:
   - May require different packages for React Native
   - Verify compatibility and alternatives

3. **Web-Specific Features**:
   - Forms with complex validation
   - Drag and drop functionality
   - Canvas-based visualizations

4. **Performance Optimizations**:
   - Image loading strategies
   - List virtualization
   - Memory management

For these cases, provide specific guidance or implement them manually after using the LLM for the base component structure.

### 8. LLM Guidance for Special Components

#### Forms

```
When converting forms from web to React Native:

1. Replace HTML form elements:
   - <form> → <View>
   - <input> → <TextInput>
   - <select> → <Picker> or custom dropdown
   - <textarea> → <TextInput multiline={true}>

2. Handle validation differently:
   - No HTML5 validation attributes
   - Use React Hook Form's validation
   - Implement custom error messages

3. Keyboard behavior:
   - Add returnKeyType prop
   - Implement keyboard dismissal
   - Set appropriate keyboardType

4. Focus management:
   - Use refs and focus() method
   - Implement proper tab order with next/submit buttons
```

#### Lists and FlatList

```
When converting list components:

1. Replace list elements:
   - <ul>, <ol> → <FlatList> or <SectionList>
   - <li> → renderItem function

2. Virtualization is important:
   - FlatList only renders visible items
   - Provide keyExtractor function
   - Set windowSize for performance

3. Pull-to-refresh:
   - Add refreshControl prop
   - Implement onRefresh callback

4. Infinite scrolling:
   - Use onEndReached and onEndReachedThreshold
   - Implement loadMore function with pagination
```

### 9. Review Checklist for Converted Components

After conversion, review components for:

1. **Functionality**:
   - All props work as expected
   - Event handlers are properly implemented
   - Component state works correctly

2. **Styling**:
   - Layout renders correctly on different screen sizes
   - Colors, fonts, and spacing match design system
   - Touch targets are appropriately sized (min 44x44px)

3. **Performance**:
   - No unnecessary re-renders
   - Large lists use virtualization
   - Images are properly sized and cached

4. **Accessibility**:
   - Screen reader support is implemented
   - Focus management works correctly
   - Touch targets are large enough

5. **Platform-Specific Behaviors**:
   - Keyboard handling is appropriate
   - Gestures work naturally
   - Respects platform conventions

### 10. Testing and Refinement

Document tests for the LLM to generate:

```
Please suggest tests for this converted component, including:

1. Snapshot tests
2. Prop validation tests
3. Event handler tests
4. Accessibility tests
5. Platform-specific behavior tests

Provide sample test code using React Native Testing Library.
```

### Summary

The LLM-assisted conversion process can significantly accelerate your development workflow when moving from Next.js to React Native. By providing structured templates, clear mapping guidelines, and systematic review processes, you can leverage LLMs to handle much of the repetitive conversion work while focusing your expertise on platform-specific optimizations and edge cases.

This approach ensures consistency across your codebase and helps maintain the same user experience between web and mobile platforms while respecting the unique characteristics and constraints of each platform.