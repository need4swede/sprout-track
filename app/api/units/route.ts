import { NextResponse } from 'next/server';
import prisma from '../db';
import { ApiResponse } from '../types';
import { Unit } from '@prisma/client';

export async function GET() {
  try {
    const units = await prisma.unit.findMany({
      orderBy: {
        unitName: 'asc',
      },
    });

    return NextResponse.json<ApiResponse<Unit[]>>({
      success: true,
      data: units,
    });
  } catch (error) {
    console.error('Error fetching units:', error);
    return NextResponse.json<ApiResponse<Unit[]>>(
      {
        success: false,
        error: 'Failed to fetch units',
      },
      { status: 500 }
    );
  }
}
