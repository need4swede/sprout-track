# Baby Tracker API Authentication

This document describes the authentication system used in the Baby Tracker application and provides guidelines for implementing authentication in API routes.

## Overview

The Baby Tracker application uses a cookie-based authentication system with two levels of access:

1. **User Authentication**: Regular authenticated users who can access most application features
2. **Admin Authentication**: Admin users who have elevated privileges for certain operations

Authentication is managed through HTTP-only cookies and is implemented using middleware functions that wrap API route handlers.

## Authentication Flow

1. Users authenticate through the `/api/auth` endpoint by providing their login ID and security PIN
2. Upon successful authentication, the server:
   - Sets an HTTP-only cookie (`caretakerId`) containing the user's ID
   - Returns user information to the client
3. The client stores the user ID in localStorage for client-side checks
4. All subsequent API requests include the cookie automatically
5. API routes use middleware functions to verify the cookie before processing requests

## Authentication Utilities

The authentication system is centralized in `/app/api/utils/auth.ts` and provides the following utilities:

### Functions

- `verifyAuthentication(req)`: Checks if a request is authenticated
- `getAuthenticatedUser(req)`: Retrieves authenticated user information from a request

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
  const { caretakerId, caretakerType } = authContext;
  
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
