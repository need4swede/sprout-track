import { NextRequest, NextResponse } from 'next/server';
import prisma from '../db';
import { ApiResponse, SleepLogCreate, SleepLogResponse } from '../types';
import { withAuthContext, AuthResult } from '../utils/auth';

async function handlePost(req: NextRequest, authContext: AuthResult) {
  try {
    const body: SleepLogCreate = await req.json();
    
    // Ensure times are saved as local time
    const startTime = new Date(body.startTime);
    const endTime = body.endTime ? new Date(body.endTime) : null;
    
    // Calculate duration if both start and end times are present
    const duration = endTime ? Math.round((endTime.getTime() - startTime.getTime()) / 60000) : undefined;

    const sleepLog = await prisma.sleepLog.create({
      data: {
        ...body,
        startTime,
        ...(endTime && { endTime }),
        duration,
        caretakerId: authContext.caretakerId,
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

async function handlePut(req: NextRequest, authContext: AuthResult) {
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

    // Ensure times are saved as local time
    const startTime = body.startTime ? new Date(body.startTime) : undefined;
    const endTime = body.endTime ? new Date(body.endTime) : undefined;
    
    // Calculate duration if both start and end times are present
    const duration = endTime ? Math.round((endTime.getTime() - (startTime || existingSleepLog.startTime).getTime()) / 60000) : undefined;

    const sleepLog = await prisma.sleepLog.update({
      where: { id },
      data: {
        ...body,
        ...(startTime && { startTime }),
        ...(endTime && { endTime }),
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

async function handleGet(req: NextRequest, authContext: AuthResult) {
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

async function handleDelete(req: NextRequest, authContext: AuthResult) {
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

// Apply authentication middleware to all handlers
// Use type assertions to handle the multiple return types
export const GET = withAuthContext(handleGet as (req: NextRequest, authContext: AuthResult) => Promise<NextResponse<ApiResponse<any>>>);
export const POST = withAuthContext(handlePost as (req: NextRequest, authContext: AuthResult) => Promise<NextResponse<ApiResponse<any>>>);
export const PUT = withAuthContext(handlePut as (req: NextRequest, authContext: AuthResult) => Promise<NextResponse<ApiResponse<any>>>);
export const DELETE = withAuthContext(handleDelete as (req: NextRequest, authContext: AuthResult) => Promise<NextResponse<ApiResponse<any>>>);