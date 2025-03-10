import { NextRequest, NextResponse } from 'next/server';
import prisma from '../db';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Authentication result with caretaker information
 */
export interface AuthResult {
  authenticated: boolean;
  caretakerId?: string;
  caretakerType?: string | null;
  error?: string;
}

/**
 * Verifies if the request is from an authenticated user by checking cookies
 * @param req The Next.js request object
 * @returns A boolean indicating if the user is authenticated
 */
export async function verifyAuthentication(req: NextRequest): Promise<boolean> {
  const authResult = await getAuthenticatedUser(req);
  return authResult.authenticated;
}

/**
 * Gets the authenticated user information from the request
 * @param req The Next.js request object
 * @returns Authentication result with caretaker information
 */
export async function getAuthenticatedUser(req: NextRequest): Promise<AuthResult> {
  try {
    // Extract caretakerId from cookies
    const caretakerId = req.cookies.get('caretakerId')?.value;
    
    // Debug: Log all cookies to see what's available
    console.log('All cookies:', req.cookies.getAll());
    console.log('CaretakerId from cookie:', caretakerId);
    
    if (!caretakerId) {
      console.log('No caretakerId found in cookies');
      return { authenticated: false, error: 'No authentication token found' };
    }
    
    // Check if caretakerId is 'system' (system admin)
    if (caretakerId === 'system') {
      return { 
        authenticated: true, 
        caretakerId: 'system',
        caretakerType: 'admin'
      };
    }
    
    // Verify caretaker exists in database
    const caretaker = await prisma.caretaker.findFirst({
      where: {
        id: caretakerId,
        deletedAt: null,
      },
    });
    
    if (caretaker) {
      return { 
        authenticated: true, 
        caretakerId: caretaker.id,
        caretakerType: caretaker.type 
      };
    }
    
    return { authenticated: false, error: 'Invalid authentication token' };
  } catch (error) {
    console.error('Authentication verification error:', error);
    return { authenticated: false, error: 'Authentication verification failed' };
  }
}

/**
 * Middleware function to require authentication for API routes
 * @param handler The API route handler function
 * @returns A wrapped handler that checks authentication before proceeding
 */
export function withAuth<T>(
  handler: (req: NextRequest) => Promise<NextResponse<ApiResponse<T>>>
) {
  return async (req: NextRequest): Promise<NextResponse<ApiResponse<T | null>>> => {
    const authResult = await getAuthenticatedUser(req);
    
    if (!authResult.authenticated) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Authentication required',
        },
        { status: 401 }
      );
    }
    
    return handler(req);
  };
}

/**
 * Middleware function to require admin authentication for API routes
 * @param handler The API route handler function
 * @returns A wrapped handler that checks admin authentication before proceeding
 */
export function withAdminAuth<T>(
  handler: (req: NextRequest) => Promise<NextResponse<ApiResponse<T>>>
) {
  return async (req: NextRequest): Promise<NextResponse<ApiResponse<T | null>>> => {
    const authResult = await getAuthenticatedUser(req);
    
    if (!authResult.authenticated) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Authentication required',
        },
        { status: 401 }
      );
    }
    
    // Check if user is an admin
    if (authResult.caretakerType !== 'admin' && authResult.caretakerId !== 'system') {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Admin access required',
        },
        { status: 403 }
      );
    }
    
    return handler(req);
  };
}

/**
 * Middleware function to attach authenticated user info to the request context
 * This allows handlers to access the authenticated user's information
 * @param handler The API route handler function that receives auth context
 * @returns A wrapped handler with authentication check
 */
export function withAuthContext<T>(
  handler: (req: NextRequest, authContext: AuthResult) => Promise<NextResponse<ApiResponse<T>>>
) {
  return async (req: NextRequest): Promise<NextResponse<ApiResponse<T | null>>> => {
    const authResult = await getAuthenticatedUser(req);
    
    if (!authResult.authenticated) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Authentication required',
        },
        { status: 401 }
      );
    }
    
    return handler(req, authResult);
  };
}
