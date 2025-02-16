import { NextRequest, NextResponse } from 'next/server';
import prisma from '../db';
import { ApiResponse, DiaperLogCreate, DiaperLogResponse } from '../types';
import { DiaperType } from '@prisma/client';
import { convertToUTC, formatLocalTime } from '../utils/timezone';

export async function POST(req: NextRequest) {
  try {
    const body: DiaperLogCreate = await req.json();
    
    const diaperLog = await prisma.diaperLog.create({
      data: {
        ...body,
        time: await convertToUTC(body.time),
      },
    });

    // Format response with local timezone
    const response: DiaperLogResponse = {
      ...diaperLog,
      time: await formatLocalTime(diaperLog.time),
      createdAt: await formatLocalTime(diaperLog.createdAt),
      updatedAt: await formatLocalTime(diaperLog.updatedAt),
      deletedAt: diaperLog.deletedAt ? await formatLocalTime(diaperLog.deletedAt) : null,
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

export async function PUT(req: NextRequest) {
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

    const diaperLog = await prisma.diaperLog.update({
      where: { id },
      data: {
        ...body,
        time: body.time ? await convertToUTC(body.time) : existingDiaperLog.time,
      },
    });

    // Format response with local timezone
    const response: DiaperLogResponse = {
      ...diaperLog,
      time: await formatLocalTime(diaperLog.time),
      createdAt: await formatLocalTime(diaperLog.createdAt),
      updatedAt: await formatLocalTime(diaperLog.updatedAt),
      deletedAt: diaperLog.deletedAt ? await formatLocalTime(diaperLog.deletedAt) : null,
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
      ...(typeParam && { type: typeParam as DiaperType }),
      ...(startDate && endDate && {
        time: {
          gte: await convertToUTC(startDate),
          lte: await convertToUTC(endDate),
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

      // Format response with local timezone
      const response: DiaperLogResponse = {
        ...diaperLog,
        time: await formatLocalTime(diaperLog.time),
        createdAt: await formatLocalTime(diaperLog.createdAt),
        updatedAt: await formatLocalTime(diaperLog.updatedAt),
        deletedAt: diaperLog.deletedAt ? await formatLocalTime(diaperLog.deletedAt) : null,
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

    // Format response with local timezone
    const response: DiaperLogResponse[] = await Promise.all(
      diaperLogs.map(async (diaperLog) => ({
        ...diaperLog,
        time: await formatLocalTime(diaperLog.time),
        createdAt: await formatLocalTime(diaperLog.createdAt),
        updatedAt: await formatLocalTime(diaperLog.updatedAt),
        deletedAt: diaperLog.deletedAt ? await formatLocalTime(diaperLog.deletedAt) : null,
      }))
    );

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

export async function DELETE(req: NextRequest) {
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
