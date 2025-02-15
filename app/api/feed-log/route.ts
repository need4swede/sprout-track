import { NextRequest, NextResponse } from 'next/server';
import prisma from '../db';
import { ApiResponse, FeedLogCreate, FeedLogResponse } from '../types';
import { FeedType } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const body: FeedLogCreate = await req.json();
    
    const feedLog = await prisma.feedLog.create({
      data: {
        ...body,
        time: new Date(body.time),
      },
    });

    return NextResponse.json<ApiResponse<FeedLogResponse>>({
      success: true,
      data: feedLog,
    });
  } catch (error) {
    console.error('Error creating feed log:', error);
    return NextResponse.json<ApiResponse<FeedLogResponse>>(
      {
        success: false,
        error: 'Failed to create feed log',
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const body: Partial<FeedLogCreate> = await req.json();

    if (!id) {
      return NextResponse.json<ApiResponse<FeedLogResponse>>(
        {
          success: false,
          error: 'Feed log ID is required',
        },
        { status: 400 }
      );
    }

    const feedLog = await prisma.feedLog.update({
      where: { id },
      data: {
        ...body,
        time: body.time ? new Date(body.time) : undefined,
      },
    });

    return NextResponse.json<ApiResponse<FeedLogResponse>>({
      success: true,
      data: feedLog,
    });
  } catch (error) {
    console.error('Error updating feed log:', error);
    return NextResponse.json<ApiResponse<FeedLogResponse>>(
      {
        success: false,
        error: 'Failed to update feed log',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Feed log ID is required',
        },
        { status: 400 }
      );
    }

    await prisma.feedLog.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
    });
  } catch (error) {
    console.error('Error deleting feed log:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to delete feed log',
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const babyId = searchParams.get('babyId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const typeParam = searchParams.get('type');

    const where = {
      deletedAt: null,
      ...(id && { id }),
      ...(babyId && { babyId }),
      ...(typeParam && { type: typeParam as FeedType }),
      ...(startDate && endDate && {
        time: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      }),
    };

    if (id) {
      const feedLog = await prisma.feedLog.findFirst({
        where,
      });

      if (!feedLog) {
        return NextResponse.json<ApiResponse<FeedLogResponse>>(
          {
            success: false,
            error: 'Feed log not found',
          },
          { status: 404 }
        );
      }

      return NextResponse.json<ApiResponse<FeedLogResponse>>({
        success: true,
        data: feedLog,
      });
    }

    const feedLogs = await prisma.feedLog.findMany({
      where,
      orderBy: {
        time: 'desc',
      },
    });

    return NextResponse.json<ApiResponse<FeedLogResponse[]>>({
      success: true,
      data: feedLogs,
    });
  } catch (error) {
    console.error('Error fetching feed logs:', error);
    return NextResponse.json<ApiResponse<FeedLogResponse[]>>(
      {
        success: false,
        error: 'Failed to fetch feed logs',
      },
      { status: 500 }
    );
  }
}
