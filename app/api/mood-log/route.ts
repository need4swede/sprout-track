import { NextRequest, NextResponse } from 'next/server';
import prisma from '../db';
import { ApiResponse, MoodLogCreate, MoodLogResponse } from '../types';
import { Mood } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const body: MoodLogCreate = await req.json();
    
    const moodLog = await prisma.moodLog.create({
      data: {
        ...body,
        time: new Date(body.time),
      },
    });

    return NextResponse.json<ApiResponse<MoodLogResponse>>({
      success: true,
      data: moodLog,
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

    const moodLog = await prisma.moodLog.update({
      where: { id },
      data: {
        ...body,
        time: body.time ? new Date(body.time) : undefined,
      },
    });

    return NextResponse.json<ApiResponse<MoodLogResponse>>({
      success: true,
      data: moodLog,
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
      return NextResponse.json<ApiResponse>(
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

    return NextResponse.json<ApiResponse>({
      success: true,
    });
  } catch (error) {
    console.error('Error deleting mood log:', error);
    return NextResponse.json<ApiResponse>(
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

    const where = {
      deletedAt: null,
      ...(id && { id }),
      ...(babyId && { babyId }),
      ...(moodParam && { mood: moodParam as Mood }),
      ...(startDate && endDate && {
        time: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      }),
    };

    if (id) {
      const moodLog = await prisma.moodLog.findFirst({
        where,
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

      return NextResponse.json<ApiResponse<MoodLogResponse>>({
        success: true,
        data: moodLog,
      });
    }

    const moodLogs = await prisma.moodLog.findMany({
      where,
      orderBy: {
        time: 'desc',
      },
    });

    return NextResponse.json<ApiResponse<MoodLogResponse[]>>({
      success: true,
      data: moodLogs,
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
