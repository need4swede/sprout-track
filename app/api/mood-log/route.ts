import { NextRequest, NextResponse } from 'next/server';
import prisma from '../db';
import { ApiResponse, MoodLogCreate, MoodLogResponse } from '../types';
import { Mood } from '@prisma/client';
import { convertToUTC, formatLocalTime } from '../utils/timezone';

export async function POST(req: NextRequest) {
  try {
    const body: MoodLogCreate = await req.json();
    
    const moodLog = await prisma.moodLog.create({
      data: {
        ...body,
        time: await convertToUTC(body.time),
      },
    });

    // Format response with local timezone
    const response: MoodLogResponse = {
      ...moodLog,
      time: await formatLocalTime(moodLog.time),
      createdAt: await formatLocalTime(moodLog.createdAt),
      updatedAt: await formatLocalTime(moodLog.updatedAt),
      deletedAt: moodLog.deletedAt ? await formatLocalTime(moodLog.deletedAt) : null,
    };

    return NextResponse.json<ApiResponse<MoodLogResponse>>({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Error creating mood log:', error);
    return NextResponse.json<ApiResponse<MoodLogResponse>>(
      {
        success: false,
        error: 'Failed to create mood log',
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const body: Partial<MoodLogCreate> = await req.json();

    if (!id) {
      return NextResponse.json<ApiResponse<MoodLogResponse>>(
        {
          success: false,
          error: 'Mood log ID is required',
        },
        { status: 400 }
      );
    }

    const existingMoodLog = await prisma.moodLog.findUnique({
      where: { id },
    });

    if (!existingMoodLog) {
      return NextResponse.json<ApiResponse<MoodLogResponse>>(
        {
          success: false,
          error: 'Mood log not found',
        },
        { status: 404 }
      );
    }

    const moodLog = await prisma.moodLog.update({
      where: { id },
      data: {
        ...body,
        time: body.time ? await convertToUTC(body.time) : existingMoodLog.time,
      },
    });

    // Format response with local timezone
    const response: MoodLogResponse = {
      ...moodLog,
      time: await formatLocalTime(moodLog.time),
      createdAt: await formatLocalTime(moodLog.createdAt),
      updatedAt: await formatLocalTime(moodLog.updatedAt),
      deletedAt: moodLog.deletedAt ? await formatLocalTime(moodLog.deletedAt) : null,
    };

    return NextResponse.json<ApiResponse<MoodLogResponse>>({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Error updating mood log:', error);
    return NextResponse.json<ApiResponse<MoodLogResponse>>(
      {
        success: false,
        error: 'Failed to update mood log',
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
          error: 'Mood log ID is required',
        },
        { status: 400 }
      );
    }

    await prisma.moodLog.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json<ApiResponse<void>>({
      success: true,
    });
  } catch (error) {
    console.error('Error deleting mood log:', error);
    return NextResponse.json<ApiResponse<void>>(
      {
        success: false,
        error: 'Failed to delete mood log',
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
    const moodParam = searchParams.get('mood');

    const queryParams = {
      deletedAt: null,
      ...(babyId && { babyId }),
      ...(moodParam && { mood: moodParam as Mood }),
      ...(startDate && endDate && {
        time: {
          gte: await convertToUTC(startDate),
          lte: await convertToUTC(endDate),
        },
      }),
    };

    if (id) {
      const moodLog = await prisma.moodLog.findFirst({
        where: { ...queryParams, id },
      });

      if (!moodLog) {
        return NextResponse.json<ApiResponse<MoodLogResponse>>(
          {
            success: false,
            error: 'Mood log not found',
          },
          { status: 404 }
        );
      }

      // Format response with local timezone
      const response: MoodLogResponse = {
        ...moodLog,
        time: await formatLocalTime(moodLog.time),
        createdAt: await formatLocalTime(moodLog.createdAt),
        updatedAt: await formatLocalTime(moodLog.updatedAt),
        deletedAt: moodLog.deletedAt ? await formatLocalTime(moodLog.deletedAt) : null,
      };

      return NextResponse.json<ApiResponse<MoodLogResponse>>({
        success: true,
        data: response,
      });
    }

    const moodLogs = await prisma.moodLog.findMany({
      where: queryParams,
      orderBy: {
        time: 'desc',
      },
    });

    // Format response with local timezone
    const response: MoodLogResponse[] = await Promise.all(
      moodLogs.map(async (moodLog) => ({
        ...moodLog,
        time: await formatLocalTime(moodLog.time),
        createdAt: await formatLocalTime(moodLog.createdAt),
        updatedAt: await formatLocalTime(moodLog.updatedAt),
        deletedAt: moodLog.deletedAt ? await formatLocalTime(moodLog.deletedAt) : null,
      }))
    );

    return NextResponse.json<ApiResponse<MoodLogResponse[]>>({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Error fetching mood logs:', error);
    return NextResponse.json<ApiResponse<MoodLogResponse[]>>(
      {
        success: false,
        error: 'Failed to fetch mood logs',
      },
      { status: 500 }
    );
  }
}
