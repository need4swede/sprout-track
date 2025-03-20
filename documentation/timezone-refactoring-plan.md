# Timezone Handling Refactoring Plan

## Current Issues

The baby tracker application currently has several issues with timezone handling:

1. **Redundant Functionality**:
   - `app/context/timezone.tsx` provides client-side timezone utilities
   - `app/api/timezone/route.ts` offers API endpoints for timezone operations
   - `app/api/utils/timezone.ts` contains server-side timezone utilities
   - Components like `activity-tile-utils.ts` implement their own time formatting

2. **Inconsistent Usage**:
   - Some components use the timezone context directly
   - Others pass timezone as props
   - Some implement their own formatting logic
   - This creates inconsistency in how times are displayed

3. **Inconsistent Date Storage**:
   - In `feed-log/route.ts`, dates are stored as local time with `const localTime = new Date(body.time)`
   - Similarly in `sleep-log/route.ts`, dates are stored as local time with `const startTime = new Date(body.startTime)`
   - This is problematic because it doesn't properly account for timezone differences

4. **Incorrect Date Serialization**:
   - APIs use `toLocaleString()` when returning dates in responses
   - This converts dates to strings using the server's locale, not the client's
   - This creates inconsistency when clients are in different timezones

5. **Manual Duration Calculations**:
   - Sleep duration is calculated with `Math.round((endTime.getTime() - startTime.getTime()) / 60000)`
   - This doesn't account for DST changes that might occur between start and end times

## Proposed Solution

We will implement a standardized approach to timezone handling with a clear separation of concerns:

1. **Single Source of Truth**:
   - One timezone context provider that handles all client-side timezone needs
   - One server-side utility for API operations

2. **Clear Separation of Concerns**:
   - Server: Always store dates in UTC
   - Client: Convert to local timezone for display

3. **Simplified API**:
   - Provide a small set of well-named utility functions that handle common operations
   - Make these functions available through the context

## Implementation Checklist

### Phase 1: Server-Side Standardization

- [ ] **1.1 Update Server-Side Timezone Utilities**
  - [ ] Refactor `app/api/utils/timezone.ts` to focus on core UTC conversion functions
  - [ ] Add comprehensive JSDoc comments for all functions
  - [ ] Implement proper error handling for all functions
  - [ ] Add unit tests for timezone utilities

- [ ] **1.2 Standardize API Date Handling**
  - [ ] Update `feed-log/route.ts` to store dates in UTC
  - [ ] Update `sleep-log/route.ts` to store dates in UTC
  - [ ] Update all other API routes that handle dates
  - [ ] Standardize response format to use ISO strings for dates

- [ ] **1.3 Simplify API Endpoints**
  - [ ] Modify `app/api/timezone/route.ts` to only provide timezone information
  - [ ] Remove redundant conversion endpoints

### Phase 2: Client-Side Enhancement

- [ ] **2.1 Enhance Timezone Context**
  - [ ] Update `app/context/timezone.tsx` with comprehensive formatting functions
  - [ ] Implement proper DST handling
  - [ ] Add functions for common operations (format date, calculate duration, etc.)
  - [ ] Add unit tests for timezone context

- [ ] **2.2 Update Component Utilities**
  - [ ] Refactor `src/components/ui/activity-tile/activity-tile-utils.ts` to use timezone context
  - [ ] Remove redundant timezone handling in components
  - [ ] Ensure consistent time display across the app

### Phase 3: Component Updates

- [ ] **3.1 Update UI Components**
  - [ ] Update `src/components/ui/status-bubble/index.tsx` to use timezone context
  - [ ] Update `src/components/ActivityTileGroup/index.tsx` to use timezone context
  - [ ] Update `src/components/ui/activity-tile/index.tsx` to use timezone context
  - [ ] Update `src/components/ui/activity-tile/activity-tile-content.tsx` to use timezone context

- [ ] **3.2 Update Form Components**
  - [ ] Update `src/components/forms/FeedForm/` components to use timezone context
  - [ ] Update `src/components/forms/SleepForm/` components to use timezone context
  - [ ] Update other form components that handle dates

### Phase 4: Testing and Documentation

- [ ] **4.1 Testing**
  - [ ] Test timezone handling with users in different timezones
  - [ ] Test DST edge cases
  - [ ] Test date calculations across timezone boundaries

- [ ] **4.2 Documentation**
  - [ ] Update `app/api/utils/timezone.README.md` with new architecture
  - [ ] Update `app/context/timezone.README.md` with usage examples
  - [ ] Add inline documentation for all timezone-related functions

### Phase 5: Migration and Cleanup

- [ ] **5.1 Data Migration**
  - [ ] Create a migration script to convert existing dates to UTC
  - [ ] Test migration script with sample data
  - [ ] Run migration script on production data

- [ ] **5.2 Cleanup**
  - [ ] Remove `app/api/timezone/route.ts` if no longer needed
  - [ ] Remove redundant timezone functions from components
  - [ ] Remove any unused imports or variables

## Expected Outcomes

After implementing this plan, we expect:

1. **Consistent Date Storage**: All dates will be stored in UTC format in the database
2. **Standardized API Responses**: All API responses will include dates in ISO format
3. **Simplified Component Code**: Components will use the timezone context for all date operations
4. **Improved User Experience**: Times will be correctly displayed in the user's timezone
5. **Better Maintainability**: Timezone logic will be centralized and easier to update
6. **Proper DST Handling**: The application will correctly handle Daylight Saving Time changes

## Success Criteria

The refactoring will be considered successful when:

1. All dates are stored in UTC in the database
2. All components use the timezone context for date formatting
3. Users in different timezones see correct times
4. DST changes are handled correctly
5. No redundant timezone code exists in components
6. All tests pass, including timezone-specific tests
