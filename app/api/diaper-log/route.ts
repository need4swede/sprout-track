import { NextRequest, NextResponse } from 'next/server';
import prisma from '../db';
import { ApiResponse, DiaperLogCreate, DiaperLogResponse } from '../types';
import { withAuth } from '../utils/auth';

async function handlePost(req: NextRequest) {
  try {
    const body: DiaperLogCreate = await req.json();
    
    // Ensure time is saved as local time
    const localTime = new Date(body.time);
    const diaperLog = await prisma.diaperLog.create({
      data: {
        ...body,
        time: localTime,
      },
    });

    const response: DiaperLogResponse = {
      ...diaperLog,
      time: body.time,
      createdAt: diaperLog.createdAt.toLocaleString(),
      updatedAt: diaperLog.updatedAt.toLocaleString(),
      deletedAt: diaperLog.deletedAt?.toLocaleString() || null,
    };

    return NextResponse.json<ApiResponse<DiaperLogResponse>>({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Error creating diaper log:', error);
    return NextResponse.json<ApiResponse<DiaperLogResponse>>(
      {
        success: false,
        error: 'Failed to create diaper log',
      },
      { status: 500 }
    );
  }
}

async function handlePut(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const body: Partial<DiaperLogCreate> = await req.json();

    if (!id) {
      return NextResponse.json<ApiResponse<DiaperLogResponse>>(
        {
          success: false,
          error: 'Diaper log ID is required',
        },
        { status: 400 }
      );
    }

    const existingDiaperLog = await prisma.diaperLog.findUnique({
      where: { id },
    });

    if (!existingDiaperLog) {
      return NextResponse.json<ApiResponse<DiaperLogResponse>>(
        {
          success: false,
          error: 'Diaper log not found',
        },
        { status: 404 }
      );
    }

    // Ensure time is saved as local time if provided
    const data = body.time
      ? { ...body, time: new Date(body.time) }
      : body;

    const diaperLog = await prisma.diaperLog.update({
      where: { id },
      data,
    });

    const response: DiaperLogResponse = {
      ...diaperLog,
      time: body.time || existingDiaperLog.time.toLocaleString(),
      createdAt: diaperLog.createdAt.toLocaleString(),
      updatedAt: diaperLog.updatedAt.toLocaleString(),
      deletedAt: diaperLog.deletedAt?.toLocaleString() || null,
    };

    return NextResponse.json<ApiResponse<DiaperLogResponse>>({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Error updating diaper log:', error);
    return NextResponse.json<ApiResponse<DiaperLogResponse>>(
      {
        success: false,
        error: 'Failed to update diaper log',
      },
      { status: 500 }
    );
  }
}

async function handleGet(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const babyId = searchParams.get('babyId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const queryParams = {
      ...(babyId && { babyId }),
      ...(startDate && endDate && {
        time: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      }),
    };

    if (id) {
      const diaperLog = await prisma.diaperLog.findUnique({
        where: { id },
      });

      if (!diaperLog) {
        return NextResponse.json<ApiResponse<DiaperLogResponse>>(
          {
            success: false,
            error: 'Diaper log not found',
          },
          { status: 404 }
        );
      }

      const response: DiaperLogResponse = {
        ...diaperLog,
        time: diaperLog.time.toLocaleString(),
        createdAt: diaperLog.createdAt.toLocaleString(),
        updatedAt: diaperLog.updatedAt.toLocaleString(),
        deletedAt: diaperLog.deletedAt?.toLocaleString() || null,
      };

      return NextResponse.json<ApiResponse<DiaperLogResponse>>({
        success: true,
        data: response,
      });
    }

    const diaperLogs = await prisma.diaperLog.findMany({
      where: queryParams,
      orderBy: {
        time: 'desc',
      },
    });

    const response: DiaperLogResponse[] = diaperLogs.map(diaperLog => ({
      ...diaperLog,
      time: diaperLog.time.toLocaleString(),
      createdAt: diaperLog.createdAt.toLocaleString(),
      updatedAt: diaperLog.updatedAt.toLocaleString(),
      deletedAt: diaperLog.deletedAt?.toLocaleString() || null,
    }));

    return NextResponse.json<ApiResponse<DiaperLogResponse[]>>({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Error fetching diaper logs:', error);
    return NextResponse.json<ApiResponse<DiaperLogResponse[]>>(
      {
        success: false,
        error: 'Failed to fetch diaper logs',
      },
      { status: 500 }
    );
  }
}

async function handleDelete(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json<ApiResponse<void>>(
        {
          success: false,
          error: 'Diaper log ID is required',
        },
        { status: 400 }
      );
    }

    await prisma.diaperLog.delete({
      where: { id },
    });

    return NextResponse.json<ApiResponse<void>>({
      success: true,
    });
  } catch (error) {
    console.error('Error deleting diaper log:', error);
    return NextResponse.json<ApiResponse<void>>(
      {
        success: false,
        error: 'Failed to delete diaper log',
      },
      { status: 500 }
    );
  }
}

// Apply authentication middleware to all handlers
// Use type assertions to handle the multiple return types
export const GET = withAuth(handleGet as (req: NextRequest) => Promise<NextResponse<ApiResponse<any>>>);
export const POST = withAuth(handlePost as (req: NextRequest) => Promise<NextResponse<ApiResponse<any>>>);
export const PUT = withAuth(handlePut as (req: NextRequest) => Promise<NextResponse<ApiResponse<any>>>);
export const DELETE = withAuth(handleDelete as (req: NextRequest) => Promise<NextResponse<ApiResponse<any>>>);