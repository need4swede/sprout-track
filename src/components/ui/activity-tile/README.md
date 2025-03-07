# ActivityTile Component

A modular, reusable component for displaying activity entries in the Baby Tracker application.

## Features

- Displays different types of activities (sleep, feed, diaper, note) with appropriate styling
- Customizable through props
- Follows the project's UI component patterns
- Designed for cross-platform compatibility

## Usage

```tsx
import { ActivityTile } from '@/src/components/ui/activity-tile';
import { SleepLogResponse } from '@/app/api/types';

// Example with a sleep activity
const sleepActivity: SleepLogResponse = {
  id: '1',
  babyId: 'baby1',
  startTime: '2025-03-07T14:30:00',
  endTime: '2025-03-07T16:00:00',
  duration: 90,
  type: 'NAP',
  location: 'Crib',
  quality: 'GOOD'
};

// Basic usage
<ActivityTile 
  activity={sleepActivity} 
  onClick={() => handleActivityClick(sleepActivity)} 
/>

// With custom title and description
<ActivityTile 
  activity={sleepActivity}
  title="Custom Title" 
  description="Custom description text" 
  onClick={() => handleActivityClick(sleepActivity)} 
/>
```

## Component API

### ActivityTile

Main component for displaying an activity.

#### Props

| Prop | Type | Description | Default |
|------|------|-------------|---------|
| `activity` | `ActivityType` | The activity data to display | Required |
| `onClick` | `() => void` | Callback when the activity tile is clicked | `undefined` |
| `icon` | `ReactNode` | Custom icon to display | Auto-generated based on activity type |
| `title` | `string` | Custom title to display | Auto-generated based on activity type |
| `description` | `string` | Custom description to display | Auto-generated based on activity type |
| `variant` | `'sleep' \| 'feed' \| 'diaper' \| 'note' \| 'default'` | Override the default styling | Auto-detected from activity |
| `className` | `string` | Additional CSS classes | `undefined` |

### ActivityTileIcon

Sub-component for displaying the activity icon.

#### Props

| Prop | Type | Description | Default |
|------|------|-------------|---------|
| `activity` | `ActivityType` | The activity data to determine the icon | Required |
| `className` | `string` | Additional CSS classes | `undefined` |

### ActivityTileContent

Sub-component for displaying the activity content.

#### Props

| Prop | Type | Description | Default |
|------|------|-------------|---------|
| `activity` | `ActivityType` | The activity data to display | Required |
| `title` | `string` | Custom title to display | Auto-generated based on activity type |
| `description` | `string` | Custom description to display | Auto-generated based on activity type |
| `className` | `string` | Additional CSS classes | `undefined` |

## Types

```typescript
type ActivityType = SleepLogResponse | FeedLogResponse | DiaperLogResponse | MoodLogResponse | NoteResponse;
type ActivityTileVariant = 'sleep' | 'feed' | 'diaper' | 'note' | 'default';
```
