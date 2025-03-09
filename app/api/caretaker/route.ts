import { NextRequest, NextResponse } from 'next/server';
import prisma from '../db';
import { ApiResponse, CaretakerCreate, CaretakerUpdate, CaretakerResponse } from '../types';
import { formatLocalTime } from '../utils/timezone';

export async function POST(req: NextRequest) {
  try {
    const body: CaretakerCreate = await req.json();

    // Check if loginId is already in use
    const existingCaretaker = await prisma.caretaker.findFirst({
      where: {
        // Using type assertion to handle new field that TypeScript doesn't know about yet
        loginId: body.loginId,
        deletedAt: null,
      } as any,
    });

    if (existingCaretaker) {
      return NextResponse.json<ApiResponse<CaretakerResponse>>(
        {
          success: false,
          error: 'Login ID is already in use. Please choose a different one.',
        },
        { status: 400 }
      );
    }

    const caretaker = await prisma.caretaker.create({
      data: body,
    });

    // Format response with local timezone
    const response: CaretakerResponse = {
      ...caretaker,
      createdAt: await formatLocalTime(caretaker.createdAt),
      updatedAt: await formatLocalTime(caretaker.updatedAt),
      deletedAt: caretaker.deletedAt ? await formatLocalTime(caretaker.deletedAt) : null,
    };

    return NextResponse.json<ApiResponse<CaretakerResponse>>({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Error creating caretaker:', error);
    return NextResponse.json<ApiResponse<CaretakerResponse>>(
      {
        success: false,
        error: 'Failed to create caretaker',
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body: CaretakerUpdate = await req.json();
    const { id, ...updateData } = body;

    const existingCaretaker = await prisma.caretaker.findUnique({
      where: { id },
    });

    if (!existingCaretaker) {
      return NextResponse.json<ApiResponse<CaretakerResponse>>(
        {
          success: false,
          error: 'Caretaker not found',
        },
        { status: 404 }
      );
    }

    // If loginId is being updated, check if it's already in use by another caretaker
    if (updateData.loginId) {
      const duplicateLoginId = await prisma.caretaker.findFirst({
        where: {
          // Using type assertion to handle new field that TypeScript doesn't know about yet
          loginId: updateData.loginId,
          id: { not: id },
          deletedAt: null,
        } as any,
      });

      if (duplicateLoginId) {
        return NextResponse.json<ApiResponse<CaretakerResponse>>(
          {
            success: false,
            error: 'Login ID is already in use. Please choose a different one.',
          },
          { status: 400 }
        );
      }
    }

    const caretaker = await prisma.caretaker.update({
      where: { id },
      data: updateData,
    });

    // Format response with local timezone
    const response: CaretakerResponse = {
      ...caretaker,
      createdAt: await formatLocalTime(caretaker.createdAt),
      updatedAt: await formatLocalTime(caretaker.updatedAt),
      deletedAt: caretaker.deletedAt ? await formatLocalTime(caretaker.deletedAt) : null,
    };

    return NextResponse.json<ApiResponse<CaretakerResponse>>({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Error updating caretaker:', error);
    return NextResponse.json<ApiResponse<CaretakerResponse>>(
      {
        success: false,
        error: 'Failed to update caretaker',
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
          error: 'Caretaker ID is required',
        },
        { status: 400 }
      );
    }

    // Soft delete by setting deletedAt
    await prisma.caretaker.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
    });
  } catch (error) {
    console.error('Error deleting caretaker:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to delete caretaker',
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id) {
      const caretaker = await prisma.caretaker.findUnique({
        where: { 
          id,
          deletedAt: null,
        },
      });

      if (!caretaker) {
        return NextResponse.json<ApiResponse<CaretakerResponse>>(
          {
            success: false,
            error: 'Caretaker not found',
          },
          { status: 404 }
        );
      }

      // Format response with local timezone
      const response: CaretakerResponse = {
        ...caretaker,
        createdAt: await formatLocalTime(caretaker.createdAt),
        updatedAt: await formatLocalTime(caretaker.updatedAt),
        deletedAt: caretaker.deletedAt ? await formatLocalTime(caretaker.deletedAt) : null,
      };

      return NextResponse.json<ApiResponse<CaretakerResponse>>({
        success: true,
        data: response,
      });
    }

    const caretakers = await prisma.caretaker.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Format response with local timezone
    const response: CaretakerResponse[] = await Promise.all(
      caretakers.map(async (caretaker) => ({
        ...caretaker,
        createdAt: await formatLocalTime(caretaker.createdAt),
        updatedAt: await formatLocalTime(caretaker.updatedAt),
        deletedAt: caretaker.deletedAt ? await formatLocalTime(caretaker.deletedAt) : null,
      }))
    );

    return NextResponse.json<ApiResponse<CaretakerResponse[]>>({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Error fetching caretakers:', error);
    return NextResponse.json<ApiResponse<CaretakerResponse[]>>(
      {
        success: false,
        error: 'Failed to fetch caretakers',
      },
      { status: 500 }
    );
  }
}
