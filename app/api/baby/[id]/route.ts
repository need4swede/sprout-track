import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../db';
import { ApiResponse } from '../../types';
import { Baby } from '@prisma/client';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const baby = await prisma.baby.findUnique({
      where: { id: params.id },
    });

    if (!baby) {
      return NextResponse.json<ApiResponse<Baby>>(
        {
          success: false,
          error: 'Baby not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<Baby>>({
      success: true,
      data: baby,
    });
  } catch (error) {
    console.error('Error fetching baby:', error);
    return NextResponse.json<ApiResponse<Baby>>(
      {
        success: false,
        error: 'Failed to fetch baby',
      },
      { status: 500 }
    );
  }
}
