import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../db';
import { ApiResponse, FeedLogResponse } from '../../types';
import { FeedType } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const babyId = searchParams.get('babyId');
    const type = searchParams.get('type') as FeedType;

    if (!babyId || !type) {
      return NextResponse.json<ApiResponse<FeedLogResponse>>(
        {
          success: false,
          error: 'Baby ID and type are required',
        },
        { status: 400 }
      );
    }

    const feedLog = await prisma.feedLog.findFirst({
      where: {
        babyId,
        type,
      },
      orderBy: {
        time: 'desc',
      },
    });

    if (!feedLog) {
    return NextResponse.json<ApiResponse<FeedLogResponse | undefined>>({
      success: true,
      data: undefined,
      });
    }

    const response: FeedLogResponse = {
      ...feedLog,
      time: feedLog.time.toLocaleString(),
      createdAt: feedLog.createdAt.toLocaleString(),
      updatedAt: feedLog.updatedAt.toLocaleString(),
      deletedAt: feedLog.deletedAt?.toLocaleString() || null,
    };

    return NextResponse.json<ApiResponse<FeedLogResponse>>({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Error fetching last feed log:', error);
    return NextResponse.json<ApiResponse<FeedLogResponse | undefined>>(
      {
        success: false,
        error: 'Failed to fetch last feed log',
      },
      { status: 500 }
    );
  }
}
