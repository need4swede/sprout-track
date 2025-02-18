import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../db';
import { ApiResponse } from '../../types';
import { Baby } from '@prisma/client';

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  req: NextRequest,
  context: RouteContext
) {
  const { id } = await context.params;
  try {
    const baby = await prisma.baby.findUnique({
      where: { id },
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
