# React Native Development Rules for Porting from Next.js

These rules outline the key patterns for developing a React Native application that maintains consistency with an existing Next.js web app, following the cross-platform development primer.

## Project Structure

- Mirror the web app's `/src` directory structure with identical folders for components, hooks, services, utils, constants, context, and types
- Add a platform-specific `/navigation` directory for React Navigation configuration
- Maintain parallel file organization between web and mobile projects
- Use the same naming conventions for corresponding components across platforms
- Keep component files, styles, types in the same folder structure as the web version

## Component Architecture

- Port UI components while maintaining the same props API when possible
- Keep the container/presentational pattern consistent with the web app
- Replace HTML elements with their React Native equivalents (div → View, span/p → Text)
- Adapt event handlers appropriately (onClick → onPress)
- Preserve the same component composition patterns used in the web app
- Include the same error and loading states as the web components
- Implement accessibility features using React Native's accessibility props

## TypeScript Implementation

- Reuse shared types from the web app's `/types` directory
- Adapt web-specific types to their React Native equivalents
- Maintain the same discriminated unions and type guards
- Update DOM event types to React Native event types
- Keep the same type-safe constants
- Reuse error type hierarchies from the web app
- Implement the same generic patterns for consistent type safety

## State Management

- Reuse the same custom hooks with platform-specific adaptations when needed
- Extend React Query implementation with offline support
- Implement local database for offline data persistence
- Add synchronization logic for offline-to-online transitions
- Handle network status monitoring and connectivity changes
- Maintain the same immutable update patterns
- Preserve error and loading states from the web implementation

## Styling Approach

- Convert CSS styles to React Native's StyleSheet
- Maintain the same theme constants (colors, spacing, typography)
- Adapt web-specific styles to React Native equivalents (px units → numbers)
- Remove unsupported CSS properties (transitions, hover effects)
- Implement platform-specific shadow styles
- Use the same naming convention for style properties
- Adapt responsive design using the Dimensions API or useWindowDimensions

## Navigation

- Implement React Navigation to mirror the web app's routing structure
- Create type-safe navigation stacks that correspond to web routes
- Define strongly typed navigation parameters
- Implement deep linking that matches web URL structure
- Create navigation utilities with the same API as the web version
- Preserve the same authentication and route protection logic
- Handle navigation transitions and loading states consistently

## API and Data Fetching

- Reuse the same API service layer from the web app
- Extend data fetching with offline support
- Implement local data caching with WatermelonDB or similar
- Add background synchronization for pending operations
- Handle conflict resolution between local and server data
- Implement retry logic with exponential backoff
- Preserve the same optimistic update patterns from the web

## Form Handling

- Adapt React Hook Form implementation for React Native
- Use the Controller component pattern for form inputs
- Reuse the same validation rules from the web app
- Implement consistent error message styling
- Adapt the form builder pattern if used in the web app
- Handle keyboard behavior appropriately for mobile
- Manage form submission states consistently with the web version

## Platform-Specific Features

- Implement abstractions for platform-specific functionality (camera, geolocation)
- Create consistent APIs for features that differ between platforms
- Use feature detection rather than platform detection when possible
- Implement graceful degradation for unavailable features
- Document any behavior differences between platforms
- Create appropriate fallbacks for web-specific features

## Testing and Quality

- Port tests with the appropriate testing libraries for React Native
- Maintain the same coverage standards as the web app
- Test on multiple device sizes and orientations
- Verify offline functionality works as expected
- Implement end-to-end tests for critical user flows
- Test synchronization edge cases thoroughly

## Performance Considerations

- Optimize list rendering with FlatList and virtualization
- Implement proper image loading and caching strategies
- Monitor and optimize memory usage
- Handle background/foreground app transitions
- Implement efficient form input handling to prevent lag
- Test performance on lower-end devices

Following these guidelines will help maintain consistency between your Next.js web app and React Native mobile app, making ongoing development and maintenance more efficient while providing users with a familiar experience across platforms.