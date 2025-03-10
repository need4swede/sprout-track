import { NextRequest, NextResponse } from 'next/server';
import prisma from '../db';
import { ApiResponse } from '../types';
import jwt from 'jsonwebtoken';

// Secret key for JWT signing - in production, use environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'baby-tracker-jwt-secret';

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
        // Create JWT token for system admin
        const token = jwt.sign(
          {
            id: 'system',
            name: 'System Administrator',
            type: 'admin',
            role: 'ADMIN',
          },
          JWT_SECRET,
          { expiresIn: '30m' } // Token expires in 30 minutes
        );
        
        // Create response with token
        const response = NextResponse.json<ApiResponse<{ 
          id: string; 
          name: string; 
          type: string | null; 
          role: string;
          token: string;
        }>>(
          {
            success: true,
            data: {
              id: 'system',
              name: 'System Administrator',
              type: 'admin',
              role: 'ADMIN',
              token: token,
            },
          }
        );
        
        // Also set the caretakerId cookie for backward compatibility
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
        // Create JWT token for caretaker
        const token = jwt.sign(
          {
            id: caretaker.id,
            name: caretaker.name,
            type: caretaker.type,
            role: (caretaker as any).role || 'USER',
          },
          JWT_SECRET,
          { expiresIn: '30m' } // Token expires in 30 minutes
        );
        
        // Create response with token
        const response = NextResponse.json<ApiResponse<{ 
          id: string; 
          name: string; 
          type: string | null; 
          role: string;
          token: string;
        }>>(
          {
            success: true,
            data: {
              id: caretaker.id,
              name: caretaker.name,
              type: caretaker.type,
              // Use type assertion for role until Prisma types are updated
              role: (caretaker as any).role || 'USER',
              token: token,
            },
          }
        );
        
        // Also set the caretakerId cookie for backward compatibility
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
