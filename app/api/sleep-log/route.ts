import { NextRequest, NextResponse } from 'next/server';
import prisma from '../db';
import { ApiResponse, SleepLogCreate, SleepLogResponse } from '../types';
export async function POST(req: NextRequest) {
  try {
    const body: SleepLogCreate = await req.json();
    
    // Calculate duration if both start and end times are present
    const duration = body.endTime ? Math.round((new Date(body.endTime).getTime() - new Date(body.startTime).getTime()) / 60000) : undefined;

    const sleepLog = await prisma.sleepLog.create({
      data: {
        ...body,
        duration,
      },
    });

    const response: SleepLogResponse = {
      ...sleepLog,
      startTime: body.startTime,
      endTime: body.endTime || null,
      createdAt: sleepLog.createdAt.toLocaleString(),
      updatedAt: sleepLog.updatedAt.toLocaleString(),
      deletedAt: sleepLog.deletedAt?.toLocaleString() || null,
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

    // Calculate duration if both start and end times are present
    const duration = body.endTime ? Math.round((new Date(body.endTime).getTime() - new Date(body.startTime || existingSleepLog.startTime).getTime()) / 60000) : undefined;

    const sleepLog = await prisma.sleepLog.update({
      where: { id },
      data: {
        ...body,
        duration,
      },
    });

    const response: SleepLogResponse = {
      ...sleepLog,
      startTime: body.startTime || existingSleepLog.startTime.toLocaleString(),
      endTime: body.endTime || existingSleepLog.endTime?.toLocaleString() || null,
      createdAt: sleepLog.createdAt.toLocaleString(),
      updatedAt: sleepLog.updatedAt.toLocaleString(),
      deletedAt: sleepLog.deletedAt?.toLocaleString() || null,
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
          gte: new Date(startDate),
          lte: new Date(endDate),
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

      const response: SleepLogResponse = {
        ...sleepLog,
        startTime: sleepLog.startTime.toLocaleString(),
        endTime: sleepLog.endTime?.toLocaleString() || null,
        createdAt: sleepLog.createdAt.toLocaleString(),
        updatedAt: sleepLog.updatedAt.toLocaleString(),
        deletedAt: sleepLog.deletedAt?.toLocaleString() || null,
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

    const response: SleepLogResponse[] = sleepLogs.map(sleepLog => ({
      ...sleepLog,
      startTime: sleepLog.startTime.toLocaleString(),
      endTime: sleepLog.endTime?.toLocaleString() || null,
      createdAt: sleepLog.createdAt.toLocaleString(),
      updatedAt: sleepLog.updatedAt.toLocaleString(),
      deletedAt: sleepLog.deletedAt?.toLocaleString() || null,
    }));

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
