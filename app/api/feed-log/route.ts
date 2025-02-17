import { NextRequest, NextResponse } from 'next/server';
import prisma from '../db';
import { ApiResponse, FeedLogCreate, FeedLogResponse } from '../types';
import { FeedType } from '@prisma/client';
export async function POST(req: NextRequest) {
  try {
    const body: FeedLogCreate = await req.json();
    
    // Ensure time is saved as local time
    const localTime = new Date(body.time);
    const feedLog = await prisma.feedLog.create({
      data: {
        ...body,
        time: localTime,
      },
    });

    const response: FeedLogResponse = {
      ...feedLog,
      time: body.time,
      createdAt: feedLog.createdAt.toLocaleString(),
      updatedAt: feedLog.updatedAt.toLocaleString(),
      deletedAt: feedLog.deletedAt?.toLocaleString() || null,
    };

    return NextResponse.json<ApiResponse<FeedLogResponse>>({
      success: true,
      data: response,
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

    // Ensure time is saved as local time if provided
    const data = body.time
      ? { ...body, time: new Date(body.time) }
      : body;

    if (!id) {
      return NextResponse.json<ApiResponse<FeedLogResponse>>(
        {
          success: false,
          error: 'Feed log ID is required',
        },
        { status: 400 }
      );
    }

    const existingFeedLog = await prisma.feedLog.findUnique({
      where: { id },
    });

    if (!existingFeedLog) {
      return NextResponse.json<ApiResponse<FeedLogResponse>>(
        {
          success: false,
          error: 'Feed log not found',
        },
        { status: 404 }
      );
    }

    const feedLog = await prisma.feedLog.update({
      where: { id },
      data,
    });

    const response: FeedLogResponse = {
      ...feedLog,
      time: body.time || existingFeedLog.time.toLocaleString(),
      createdAt: feedLog.createdAt.toLocaleString(),
      updatedAt: feedLog.updatedAt.toLocaleString(),
      deletedAt: feedLog.deletedAt?.toLocaleString() || null,
    };

    return NextResponse.json<ApiResponse<FeedLogResponse>>({
      success: true,
      data: response,
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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const babyId = searchParams.get('babyId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const typeParam = searchParams.get('type');

    const queryParams = {
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
      const feedLog = await prisma.feedLog.findUnique({
        where: { id },
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
    }

    const feedLogs = await prisma.feedLog.findMany({
      where: queryParams,
      orderBy: {
        time: 'desc',
      },
    });

    const response: FeedLogResponse[] = feedLogs.map(feedLog => ({
      ...feedLog,
      time: feedLog.time.toLocaleString(),
      createdAt: feedLog.createdAt.toLocaleString(),
      updatedAt: feedLog.updatedAt.toLocaleString(),
      deletedAt: feedLog.deletedAt?.toLocaleString() || null,
    }));

    return NextResponse.json<ApiResponse<FeedLogResponse[]>>({
      success: true,
      data: response,
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

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json<ApiResponse<void>>(
        {
          success: false,
          error: 'Feed log ID is required',
        },
        { status: 400 }
      );
    }

    await prisma.feedLog.delete({
      where: { id },
    });

    return NextResponse.json<ApiResponse<void>>({
      success: true,
    });
  } catch (error) {
    console.error('Error deleting feed log:', error);
    return NextResponse.json<ApiResponse<void>>(
      {
        success: false,
        error: 'Failed to delete feed log',
      },
      { status: 500 }
    );
  }
}
