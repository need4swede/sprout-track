import { NextRequest, NextResponse } from 'next/server';
import prisma from '../db';
import { ApiResponse, PumpLogCreate, PumpLogResponse } from '../types';
import { withAuthContext, AuthResult } from '../utils/auth';

async function handlePost(req: NextRequest, authContext: AuthResult) {
  try {
    const body: PumpLogCreate = await req.json();
    
    // Process start time
    const startTime = new Date(body.startTime);
    
    // Process end time if provided
    const endTime = body.endTime ? new Date(body.endTime) : undefined;
    
    // Calculate duration if not provided but start and end times are available
    let duration = body.duration;
    if (!duration && startTime && endTime) {
      duration = Math.round((endTime.getTime() - startTime.getTime()) / 60000); // Convert ms to minutes
    }
    
    // Calculate total amount if not provided but left and right amounts are
    let totalAmount = body.totalAmount;
    if (!totalAmount && (body.leftAmount || body.rightAmount)) {
      totalAmount = (body.leftAmount || 0) + (body.rightAmount || 0);
    }
    
    const pumpLog = await prisma.pumpLog.create({
      data: {
        babyId: body.babyId,
        startTime,
        endTime,
        duration,
        leftAmount: body.leftAmount,
        rightAmount: body.rightAmount,
        totalAmount,
        unitAbbr: body.unitAbbr,
        notes: body.notes,
        caretakerId: authContext.caretakerId,
      },
    });

    const response: PumpLogResponse = {
      ...pumpLog,
      startTime: pumpLog.startTime.toLocaleString(),
      endTime: pumpLog.endTime?.toLocaleString() || null,
      createdAt: pumpLog.createdAt.toLocaleString(),
      updatedAt: pumpLog.updatedAt.toLocaleString(),
      deletedAt: pumpLog.deletedAt?.toLocaleString() || null,
    };

    return NextResponse.json<ApiResponse<PumpLogResponse>>({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Error creating pump log:', error);
    return NextResponse.json<ApiResponse<PumpLogResponse>>(
      {
        success: false,
        error: 'Failed to create pump log',
      },
      { status: 500 }
    );
  }
}

async function handlePut(req: NextRequest, authContext: AuthResult) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const body: Partial<PumpLogCreate> = await req.json();

    if (!id) {
      return NextResponse.json<ApiResponse<PumpLogResponse>>(
        {
          success: false,
          error: 'Pump log ID is required',
        },
        { status: 400 }
      );
    }

    const existingPumpLog = await prisma.pumpLog.findUnique({
      where: { id },
    });

    if (!existingPumpLog) {
      return NextResponse.json<ApiResponse<PumpLogResponse>>(
        {
          success: false,
          error: 'Pump log not found',
        },
        { status: 404 }
      );
    }

    // Process date fields and prepare data for update
    const data: any = {};
    
    if (body.startTime) {
      data.startTime = new Date(body.startTime);
    }
    
    if (body.endTime) {
      data.endTime = new Date(body.endTime);
    }
    
    // Calculate duration if not provided but start and end times are available
    if (body.duration !== undefined) {
      data.duration = body.duration;
    } else if ((body.startTime || existingPumpLog.startTime) && 
              (body.endTime || existingPumpLog.endTime)) {
      const start = body.startTime ? new Date(body.startTime) : existingPumpLog.startTime;
      const end = body.endTime ? new Date(body.endTime) : existingPumpLog.endTime;
      if (start && end) {
        data.duration = Math.round((end.getTime() - start.getTime()) / 60000); // Convert ms to minutes
      }
    }
    
    // Calculate total amount if left or right amounts are updated
    if (body.totalAmount !== undefined) {
      data.totalAmount = body.totalAmount;
    } else if (body.leftAmount !== undefined || body.rightAmount !== undefined) {
      const leftAmount = body.leftAmount !== undefined ? body.leftAmount : existingPumpLog.leftAmount || 0;
      const rightAmount = body.rightAmount !== undefined ? body.rightAmount : existingPumpLog.rightAmount || 0;
      data.totalAmount = leftAmount + rightAmount;
    }
    
    // Add other fields
    if (body.leftAmount !== undefined) data.leftAmount = body.leftAmount;
    if (body.rightAmount !== undefined) data.rightAmount = body.rightAmount;
    if (body.unitAbbr !== undefined) data.unitAbbr = body.unitAbbr;
    if (body.notes !== undefined) data.notes = body.notes;
    if (body.babyId !== undefined) data.babyId = body.babyId;

    const pumpLog = await prisma.pumpLog.update({
      where: { id },
      data,
    });

    const response: PumpLogResponse = {
      ...pumpLog,
      startTime: pumpLog.startTime.toLocaleString(),
      endTime: pumpLog.endTime?.toLocaleString() || null,
      createdAt: pumpLog.createdAt.toLocaleString(),
      updatedAt: pumpLog.updatedAt.toLocaleString(),
      deletedAt: pumpLog.deletedAt?.toLocaleString() || null,
    };

    return NextResponse.json<ApiResponse<PumpLogResponse>>({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Error updating pump log:', error);
    return NextResponse.json<ApiResponse<PumpLogResponse>>(
      {
        success: false,
        error: 'Failed to update pump log',
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

    const queryParams: any = {
      ...(babyId && { babyId }),
    };
    
    // Add date range filter if both start and end dates are provided
    if (startDate && endDate) {
      queryParams.startTime = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    // If ID is provided, fetch a single pump log
    if (id) {
      const pumpLog = await prisma.pumpLog.findUnique({
        where: { id },
      });

      if (!pumpLog) {
        return NextResponse.json<ApiResponse<PumpLogResponse>>(
          {
            success: false,
            error: 'Pump log not found',
          },
          { status: 404 }
        );
      }

      const response: PumpLogResponse = {
        ...pumpLog,
        startTime: pumpLog.startTime.toLocaleString(),
        endTime: pumpLog.endTime?.toLocaleString() || null,
        createdAt: pumpLog.createdAt.toLocaleString(),
        updatedAt: pumpLog.updatedAt.toLocaleString(),
        deletedAt: pumpLog.deletedAt?.toLocaleString() || null,
      };

      return NextResponse.json<ApiResponse<PumpLogResponse>>({
        success: true,
        data: response,
      });
    }

    // Otherwise, fetch multiple pump logs based on query parameters
    const pumpLogs = await prisma.pumpLog.findMany({
      where: queryParams,
      orderBy: {
        startTime: 'desc',
      },
    });

    const response: PumpLogResponse[] = pumpLogs.map(pumpLog => ({
      ...pumpLog,
      startTime: pumpLog.startTime.toLocaleString(),
      endTime: pumpLog.endTime?.toLocaleString() || null,
      createdAt: pumpLog.createdAt.toLocaleString(),
      updatedAt: pumpLog.updatedAt.toLocaleString(),
      deletedAt: pumpLog.deletedAt?.toLocaleString() || null,
    }));

    return NextResponse.json<ApiResponse<PumpLogResponse[]>>({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Error fetching pump logs:', error);
    return NextResponse.json<ApiResponse<PumpLogResponse[]>>(
      {
        success: false,
        error: 'Failed to fetch pump logs',
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
          error: 'Pump log ID is required',
        },
        { status: 400 }
      );
    }

    const existingPumpLog = await prisma.pumpLog.findUnique({
      where: { id },
    });

    if (!existingPumpLog) {
      return NextResponse.json<ApiResponse<void>>(
        {
          success: false,
          error: 'Pump log not found',
        },
        { status: 404 }
      );
    }

    // Soft delete by setting deletedAt timestamp
    await prisma.pumpLog.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    return NextResponse.json<ApiResponse<void>>({
      success: true,
    });
  } catch (error) {
    console.error('Error deleting pump log:', error);
    return NextResponse.json<ApiResponse<void>>(
      {
        success: false,
        error: 'Failed to delete pump log',
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
