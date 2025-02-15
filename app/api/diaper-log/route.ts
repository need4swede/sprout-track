import { NextRequest, NextResponse } from 'next/server';
import prisma from '../db';
import { ApiResponse, DiaperLogCreate, DiaperLogResponse } from '../types';
import { DiaperType } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const body: DiaperLogCreate = await req.json();
    
    const diaperLog = await prisma.diaperLog.create({
      data: {
        ...body,
        time: new Date(body.time),
      },
    });

    return NextResponse.json<ApiResponse<DiaperLogResponse>>({
      success: true,
      data: diaperLog,
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

    const diaperLog = await prisma.diaperLog.update({
      where: { id },
      data: {
        ...body,
        time: body.time ? new Date(body.time) : undefined,
      },
    });

    return NextResponse.json<ApiResponse<DiaperLogResponse>>({
      success: true,
      data: diaperLog,
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

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Diaper log ID is required',
        },
        { status: 400 }
      );
    }

    await prisma.diaperLog.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
    });
  } catch (error) {
    console.error('Error deleting diaper log:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to delete diaper log',
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
      ...(typeParam && { type: typeParam as DiaperType }),
      ...(startDate && endDate && {
        time: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      }),
    };

    if (id) {
      const diaperLog = await prisma.diaperLog.findFirst({
        where,
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

      return NextResponse.json<ApiResponse<DiaperLogResponse>>({
        success: true,
        data: diaperLog,
      });
    }

    const diaperLogs = await prisma.diaperLog.findMany({
      where,
      orderBy: {
        time: 'desc',
      },
    });

    return NextResponse.json<ApiResponse<DiaperLogResponse[]>>({
      success: true,
      data: diaperLogs,
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
