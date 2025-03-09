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
        return NextResponse.json<ApiResponse<{ id: string; name: string; type: string | null }>>(
          {
            success: true,
            data: {
              id: 'system',
              name: 'System Administrator',
              type: 'admin',
            },
          }
        );
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
        return NextResponse.json<ApiResponse<{ id: string; name: string; type: string | null }>>(
          {
            success: true,
            data: {
              id: caretaker.id,
              name: caretaker.name,
              type: caretaker.type,
            },
          }
        );
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
