import { NextRequest, NextResponse } from 'next/server';
import prisma from '../db';
import { ApiResponse, SleepLogCreate, SleepLogResponse } from '../types';
import { convertToUTC, formatLocalTime } from '../utils/timezone';

export async function POST(req: NextRequest) {
  try {
    const body: SleepLogCreate = await req.json();
    
    // Convert times to UTC before storing
    const startTime = await convertToUTC(body.startTime);
    const endTime = body.endTime ? await convertToUTC(body.endTime) : undefined;
    
    // Calculate duration if both start and end times are present
    const duration = endTime ? Math.round((endTime.getTime() - startTime.getTime()) / 60000) : undefined;

    const sleepLog = await prisma.sleepLog.create({
      data: {
        ...body,
        startTime,
        endTime,
        duration,
      },
    });

    // Format response with local timezone
    const response: SleepLogResponse = {
      ...sleepLog,
      startTime: await formatLocalTime(sleepLog.startTime),
      endTime: sleepLog.endTime ? await formatLocalTime(sleepLog.endTime) : null,
      createdAt: await formatLocalTime(sleepLog.createdAt),
      updatedAt: await formatLocalTime(sleepLog.updatedAt),
      deletedAt: sleepLog.deletedAt ? await formatLocalTime(sleepLog.deletedAt) : null,
    };

    return NextResponse.json<ApiResponse<SleepLogResponse>>({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Error creating sleep log:', error);
    return NextResponse.json<ApiResponse<SleepLogResponse>>(
      {
        success: false,
        error: 'Failed to create sleep log',
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const body: Partial<SleepLogCreate> = await req.json();

    if (!id) {
      return NextResponse.json<ApiResponse<SleepLogResponse>>(
        {
          success: false,
          error: 'Sleep log ID is required',
        },
        { status: 400 }
      );
    }

    const existingSleepLog = await prisma.sleepLog.findUnique({
      where: { id },
    });

    if (!existingSleepLog) {
      return NextResponse.json<ApiResponse<SleepLogResponse>>(
        {
          success: false,
          error: 'Sleep log not found',
        },
        { status: 404 }
      );
    }

    // Convert times to UTC before storing
    const startTime = body.startTime ? await convertToUTC(body.startTime) : existingSleepLog.startTime;
    const endTime = body.endTime ? await convertToUTC(body.endTime) : existingSleepLog.endTime;
    
    // Calculate duration if both start and end times are present
    const duration = endTime ? Math.round((endTime.getTime() - startTime.getTime()) / 60000) : undefined;

    const sleepLog = await prisma.sleepLog.update({
      where: { id },
      data: {
        ...body,
        startTime,
        endTime,
        duration,
      },
    });

    // Format response with local timezone
    const response: SleepLogResponse = {
      ...sleepLog,
      startTime: await formatLocalTime(sleepLog.startTime),
      endTime: sleepLog.endTime ? await formatLocalTime(sleepLog.endTime) : null,
      createdAt: await formatLocalTime(sleepLog.createdAt),
      updatedAt: await formatLocalTime(sleepLog.updatedAt),
      deletedAt: sleepLog.deletedAt ? await formatLocalTime(sleepLog.deletedAt) : null,
    };

    return NextResponse.json<ApiResponse<SleepLogResponse>>({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Error updating sleep log:', error);
    return NextResponse.json<ApiResponse<SleepLogResponse>>(
      {
        success: false,
        error: 'Failed to update sleep log',
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

    const queryParams = {
      ...(babyId && { babyId }),
      ...(startDate && endDate && {
        startTime: {
          gte: await convertToUTC(startDate),
          lte: await convertToUTC(endDate),
        },
      }),
    };

    if (id) {
      const sleepLog = await prisma.sleepLog.findUnique({
        where: { id },
      });

      if (!sleepLog) {
        return NextResponse.json<ApiResponse<SleepLogResponse>>(
          {
            success: false,
            error: 'Sleep log not found',
          },
          { status: 404 }
        );
      }

      // Format response with local timezone
      const response: SleepLogResponse = {
        ...sleepLog,
        startTime: await formatLocalTime(sleepLog.startTime),
        endTime: sleepLog.endTime ? await formatLocalTime(sleepLog.endTime) : null,
        createdAt: await formatLocalTime(sleepLog.createdAt),
        updatedAt: await formatLocalTime(sleepLog.updatedAt),
        deletedAt: sleepLog.deletedAt ? await formatLocalTime(sleepLog.deletedAt) : null,
      };

      return NextResponse.json<ApiResponse<SleepLogResponse>>({
        success: true,
        data: response,
      });
    }

    const sleepLogs = await prisma.sleepLog.findMany({
      where: queryParams,
      orderBy: {
        startTime: 'desc',
      },
    });

    // Format response with local timezone
    const response: SleepLogResponse[] = await Promise.all(
      sleepLogs.map(async (sleepLog) => ({
        ...sleepLog,
        startTime: await formatLocalTime(sleepLog.startTime),
        endTime: sleepLog.endTime ? await formatLocalTime(sleepLog.endTime) : null,
        createdAt: await formatLocalTime(sleepLog.createdAt),
        updatedAt: await formatLocalTime(sleepLog.updatedAt),
        deletedAt: sleepLog.deletedAt ? await formatLocalTime(sleepLog.deletedAt) : null,
      }))
    );

    return NextResponse.json<ApiResponse<SleepLogResponse[]>>({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Error fetching sleep logs:', error);
    return NextResponse.json<ApiResponse<SleepLogResponse[]>>(
      {
        success: false,
        error: 'Failed to fetch sleep logs',
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
          error: 'Sleep log ID is required',
        },
        { status: 400 }
      );
    }

    await prisma.sleepLog.delete({
      where: { id },
    });

    return NextResponse.json<ApiResponse<void>>({
      success: true,
    });
  } catch (error) {
    console.error('Error deleting sleep log:', error);
    return NextResponse.json<ApiResponse<void>>(
      {
        success: false,
        error: 'Failed to delete sleep log',
      },
      { status: 500 }
    );
  }
}
