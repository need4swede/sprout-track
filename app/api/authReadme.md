# Baby Tracker API Authentication

This document describes the authentication system used in the Baby Tracker application and provides guidelines for implementing authentication in API routes.

## Overview

The Baby Tracker application uses a JWT-based authentication system with two levels of access:

1. **User Authentication**: Regular authenticated users who can access most application features
2. **Admin Authentication**: Admin users who have elevated privileges for certain operations

Authentication is managed through JWT tokens stored in localStorage with fallback support for HTTP-only cookies (for backward compatibility). The system is implemented using middleware functions that wrap API route handlers.

## Authentication Flow

1. Users authenticate through the `/api/auth` endpoint by providing their login ID and security PIN
2. Upon successful authentication, the server:
   - Generates a JWT token containing the user's ID, name, type, and role
   - Returns the token and user information to the client
3. The client stores the JWT token in localStorage as `authToken`
4. All subsequent API requests include the token in the Authorization header (`Bearer <token>`)
5. API routes use middleware functions to verify the token before processing requests
6. When a user logs out, the token is invalidated by adding it to a server-side blacklist

## Authentication Utilities

The authentication system is centralized in `/app/api/utils/auth.ts` and provides the following utilities:

### Functions

- `verifyAuthentication(req)`: Checks if a request is authenticated
- `getAuthenticatedUser(req)`: Retrieves authenticated user information from a request
- `invalidateToken(token)`: Adds a token to the blacklist to invalidate it

### Middleware

- `withAuth(handler)`: Middleware that ensures a request is authenticated
- `withAdminAuth(handler)`: Middleware that ensures a request is from an admin user
- `withAuthContext(handler)`: Middleware that provides auth context to the handler

## Implementing Authentication in API Routes

### Regular User Authentication

For routes that should be accessible to any authenticated user:

```typescript
import { withAuth, ApiResponse } from '../utils/auth';

async function handler(req: NextRequest): Promise<NextResponse<ApiResponse<any>>> {
  // Your handler logic here
  return NextResponse.json({ success: true, data: result });
}

export const GET = withAuth(handler);
export const POST = withAuth(handler);
```

The client should include the JWT token in the Authorization header:

```typescript
const token = localStorage.getItem('authToken');
const response = await fetch('/api/protected-route', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Admin-Only Authentication

For routes that should only be accessible to admin users:

```typescript
import { withAdminAuth, ApiResponse } from '../utils/auth';

async function handler(req: NextRequest): Promise<NextResponse<ApiResponse<any>>> {
  // Your handler logic here
  return NextResponse.json({ success: true, data: result });
}

export const GET = withAdminAuth(handler);
export const POST = withAdminAuth(handler);
```

### Accessing User Information

If you need to access the authenticated user's information in your handler:

```typescript
import { withAuthContext, ApiResponse, AuthResult } from '../utils/auth';

async function handler(req: NextRequest, authContext: AuthResult): Promise<NextResponse<ApiResponse<any>>> {
  // Access user information from authContext
  const { caretakerId, caretakerType, caretakerRole } = authContext;
  
  // Your handler logic here
  return NextResponse.json({ success: true, data: result });
}

export const GET = withAuthContext(handler);
export const POST = withAuthContext(handler);
```

## Authentication Response Format

All API responses follow a consistent format:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

## Logout Process

The logout process involves the following steps:

1. The client calls the `/api/auth/logout` endpoint with the JWT token in the Authorization header
2. The server adds the token to a blacklist to invalidate it immediately
3. The server clears any authentication cookies (for backward compatibility)
4. The client removes the token and other authentication data from localStorage

```typescript
// Client-side logout example
async function logout() {
  const token = localStorage.getItem('authToken');
  
  // Call the logout API
  await fetch('/api/auth/logout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    }
  });
  
  // Clear client-side auth data
  localStorage.removeItem('authToken');
  localStorage.removeItem('unlockTime');
  localStorage.removeItem('caretakerId');
  
  // Reset application state
  // ...
}
```

## Authentication Errors

Authentication errors return appropriate HTTP status codes:

- **401 Unauthorized**: When a user is not authenticated
- **403 Forbidden**: When a user is authenticated but lacks sufficient permissions

## Security Considerations

1. **Cookie Security**:
   - HTTP-only: Prevents JavaScript access to the cookie
   - Secure: Only sent over HTTPS in production
   - SameSite: Strict to prevent CSRF attacks
   - Limited expiration: 30 minutes

2. **Session Management**:
   - Sessions expire after 30 minutes of inactivity
   - Users are automatically logged out after the session expires

3. **Lockout Protection**:
   - Three failed login attempts trigger a 5-minute lockout

## Best Practices

1. **Always use the provided middleware**:
   - Don't implement custom authentication checks
   - Use `withAuth` for regular user access
   - Use `withAdminAuth` for admin-only access

2. **Handle errors gracefully**:
   - Provide clear error messages
   - Don't expose sensitive information in errors

3. **Test authentication thoroughly**:
   - Test with valid credentials
   - Test with invalid credentials
   - Test with expired sessions
   - Test with insufficient permissions

4. **Keep authentication logic centralized**:
   - Add new authentication features to the auth utility
   - Don't duplicate authentication logic across routes
