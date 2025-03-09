# Security Component Documentation

## Overview

The Security component provides authentication functionality for the Baby Tracker application. It implements a two-factor authentication system requiring users to enter both a login ID and a security PIN to access the application.

## Features

- Two-step authentication with login ID and security PIN
- Automatic session timeout after 30 minutes of inactivity
- Lockout mechanism after 3 failed authentication attempts
- Session persistence using localStorage
- User activity monitoring to reset timeout timer

## Props

| Prop Name | Type | Description |
|-----------|------|-------------|
| onUnlock | `(caretakerId?: string) => void` | Callback function executed when authentication is successful. Returns the authenticated caretaker's ID. |

## Authentication Flow

1. User enters their 2-character login ID
2. Upon valid login ID entry, user is prompted for their security PIN
3. System validates the credentials against the caretaker database
4. If valid, the user is granted access and the caretaker ID is stored in localStorage
5. If invalid, the user is shown an error message and allowed to retry (up to 3 attempts)

## Security Features

### Session Timeout

- Sessions automatically expire after 30 minutes of inactivity
- User activity (mouse movement, clicks, keyboard input) resets the inactivity timer
- When a session expires, the user must re-authenticate

### Lockout Protection

- After 3 failed authentication attempts, the system implements a 5-minute lockout
- During lockout, authentication attempts are disabled
- A countdown timer shows the remaining lockout time

### Data Storage

- Authentication state is stored in localStorage:
  - `unlockTime`: Timestamp of successful authentication
  - `caretakerId`: ID of the authenticated caretaker
  - `attempts`: Number of failed authentication attempts
  - `lockoutTime`: Timestamp when lockout period ends (if applicable)

## API Integration

The Security component interacts with the `/api/auth` endpoint, which validates caretaker credentials against the database. The authentication API:

1. Accepts login ID and security PIN
2. Validates credentials against the caretaker database
3. Returns caretaker information upon successful authentication
4. Returns appropriate error messages on authentication failure

## Usage Example

```tsx
import Security from '@/src/components/Security';

function App() {
  const handleUnlock = (caretakerId?: string) => {
    console.log(`Authenticated as caretaker: ${caretakerId}`);
    // Perform post-authentication actions
  };

  return (
    <div>
      <Security onUnlock={handleUnlock} />
      {/* Rest of your application */}
    </div>
  );
}
```

## Customization

The Security component can be customized by modifying:

- Timeout duration (currently set to 30 minutes)
- Lockout duration (currently set to 5 minutes)
- Number of allowed failed attempts before lockout (currently set to 3)
- Visual appearance of the login and PIN input screens
