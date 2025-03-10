import { NextRequest, NextResponse } from 'next/server';
import prisma from '../db';
import { ApiResponse } from '../types';

// Authentication endpoint for caretakers or system PIN
export async function POST(req: NextRequest) {
  try {
    const { loginId, securityPin } = await req.json();

    if (!securityPin) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Security PIN is required',
        },
        { status: 400 }
      );
    }

    // Count active caretakers
    const caretakerCount = await prisma.caretaker.count({
      where: {
        deletedAt: null,
      },
    });

    // If no caretakers exist, use system PIN from settings
    if (caretakerCount === 0) {
      // Check system PIN
      const settings = await prisma.settings.findFirst();
      
      if (settings && settings.securityPin === securityPin) {
        // Create response with cookie
        const response = NextResponse.json<ApiResponse<{ id: string; name: string; type: string | null; role: string }>>(
          {
            success: true,
            data: {
              id: 'system',
              name: 'System Administrator',
              type: 'admin',
              role: 'ADMIN',
            },
          }
        );
        
        // Set the caretakerId cookie
        response.cookies.set('caretakerId', 'system', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 30 * 60, // 30 minutes
          path: '/',
        });
        
        return response;
      }
    } else if (loginId) {
      // If caretakers exist, require loginId and check caretaker credentials
      const caretaker = await prisma.caretaker.findFirst({
        where: {
          loginId: loginId,
          securityPin: securityPin,
          deletedAt: null,
        } as any, // Type assertion for loginId field
      });

      if (caretaker) {
        // Create response with cookie
        const response = NextResponse.json<ApiResponse<{ id: string; name: string; type: string | null; role: string }>>(
          {
            success: true,
            data: {
              id: caretaker.id,
              name: caretaker.name,
              type: caretaker.type,
              // Use type assertion for role until Prisma types are updated
              role: (caretaker as any).role || 'USER',
            },
          }
        );
        
        // Set the caretakerId cookie
        response.cookies.set('caretakerId', caretaker.id, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 30 * 60, // 30 minutes
          path: '/',
        });
        
        return response;
      }
    }
    
    // If we get here, authentication failed
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: 'Invalid credentials',
      },
      { status: 401 }
    );


  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: 'Authentication failed',
      },
      { status: 500 }
    );
  }
}
