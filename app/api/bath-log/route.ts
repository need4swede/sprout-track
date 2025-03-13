import { NextRequest, NextResponse } from 'next/server';
import prisma from '../db';
import { ApiResponse, BathLogCreate, BathLogResponse } from '../types';
import { withAuthContext, AuthResult } from '../utils/auth';

async function handlePost(req: NextRequest, authContext: AuthResult) {
  try {
    const body: BathLogCreate = await req.json();
    
    // Ensure time is saved as local time
    const localTime = new Date(body.time);
    
    const bathLog = await prisma.bathLog.create({
      data: {
        ...body,
        time: localTime,
        caretakerId: authContext.caretakerId,
        soapUsed: body.soapUsed ?? true, // Default to true if not provided
        shampooUsed: body.shampooUsed ?? true, // Default to true if not provided
      },
    });

    const response: BathLogResponse = {
      ...bathLog,
      time: body.time,
      createdAt: bathLog.createdAt.toLocaleString(),
      updatedAt: bathLog.updatedAt.toLocaleString(),
      deletedAt: bathLog.deletedAt?.toLocaleString() || null,
    };

    return NextResponse.json<ApiResponse<BathLogResponse>>({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Error creating bath log:', error);
    return NextResponse.json<ApiResponse<BathLogResponse>>(
      {
        success: false,
        error: 'Failed to create bath log',
      },
      { status: 500 }
    );
  }
}

async function handlePut(req: NextRequest, authContext: AuthResult) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const body: Partial<BathLogCreate> = await req.json();

    if (!id) {
      return NextResponse.json<ApiResponse<BathLogResponse>>(
        {
          success: false,
          error: 'Bath log ID is required',
        },
        { status: 400 }
      );
    }

    const existingBathLog = await prisma.bathLog.findUnique({
      where: { id },
    });

    if (!existingBathLog) {
      return NextResponse.json<ApiResponse<BathLogResponse>>(
        {
          success: false,
          error: 'Bath log not found',
        },
        { status: 404 }
      );
    }

    // Process date fields
    const data = {
      ...(body.time ? { time: new Date(body.time) } : {}),
      ...Object.entries(body)
        .filter(([key]) => !['time'].includes(key))
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
    };

    const bathLog = await prisma.bathLog.update({
      where: { id },
      data,
    });

    const response: BathLogResponse = {
      ...bathLog,
      time: body.time || existingBathLog.time.toLocaleString(),
      createdAt: bathLog.createdAt.toLocaleString(),
      updatedAt: bathLog.updatedAt.toLocaleString(),
      deletedAt: bathLog.deletedAt?.toLocaleString() || null,
    };

    return NextResponse.json<ApiResponse<BathLogResponse>>({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Error updating bath log:', error);
    return NextResponse.json<ApiResponse<BathLogResponse>>(
      {
        success: false,
        error: 'Failed to update bath log',
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
        time: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      }),
    };

    if (id) {
      const bathLog = await prisma.bathLog.findUnique({
        where: { id },
      });

      if (!bathLog) {
        return NextResponse.json<ApiResponse<BathLogResponse>>(
          {
            success: false,
            error: 'Bath log not found',
          },
          { status: 404 }
        );
      }

      const response: BathLogResponse = {
        ...bathLog,
        time: bathLog.time.toLocaleString(),
        createdAt: bathLog.createdAt.toLocaleString(),
        updatedAt: bathLog.updatedAt.toLocaleString(),
        deletedAt: bathLog.deletedAt?.toLocaleString() || null,
      };

      return NextResponse.json<ApiResponse<BathLogResponse>>({
        success: true,
        data: response,
      });
    }

    const bathLogs = await prisma.bathLog.findMany({
      where: queryParams,
      orderBy: {
        time: 'desc',
      },
    });

    const response: BathLogResponse[] = bathLogs.map(bathLog => ({
      ...bathLog,
      time: bathLog.time.toLocaleString(),
      createdAt: bathLog.createdAt.toLocaleString(),
      updatedAt: bathLog.updatedAt.toLocaleString(),
      deletedAt: bathLog.deletedAt?.toLocaleString() || null,
    }));

    return NextResponse.json<ApiResponse<BathLogResponse[]>>({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Error fetching bath logs:', error);
    return NextResponse.json<ApiResponse<BathLogResponse[]>>(
      {
        success: false,
        error: 'Failed to fetch bath logs',
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
          error: 'Bath log ID is required',
        },
        { status: 400 }
      );
    }

    const existingBathLog = await prisma.bathLog.findUnique({
      where: { id },
    });

    if (!existingBathLog) {
      return NextResponse.json<ApiResponse<void>>(
        {
          success: false,
          error: 'Bath log not found',
        },
        { status: 404 }
      );
    }

    await prisma.bathLog.delete({
      where: { id },
    });

    return NextResponse.json<ApiResponse<void>>({
      success: true,
    });
  } catch (error) {
    console.error('Error deleting bath log:', error);
    return NextResponse.json<ApiResponse<void>>(
      {
        success: false,
        error: 'Failed to delete bath log',
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
