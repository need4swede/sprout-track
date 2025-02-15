import { NextRequest, NextResponse } from 'next/server';
import prisma from '../db';
import { ApiResponse, BabyCreate, BabyUpdate, BabyResponse } from '../types';

export async function POST(req: NextRequest) {
  try {
    const body: BabyCreate = await req.json();
    
    const baby = await prisma.baby.create({
      data: {
        ...body,
        birthDate: new Date(body.birthDate),
      },
    });

    return NextResponse.json<ApiResponse<BabyResponse>>({
      success: true,
      data: baby,
    });
  } catch (error) {
    console.error('Error creating baby:', error);
    return NextResponse.json<ApiResponse<BabyResponse>>(
      {
        success: false,
        error: 'Failed to create baby',
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body: BabyUpdate = await req.json();
    const { id, ...updateData } = body;

    const baby = await prisma.baby.update({
      where: { id },
      data: {
        ...updateData,
        birthDate: updateData.birthDate ? new Date(updateData.birthDate) : undefined,
      },
    });

    return NextResponse.json<ApiResponse<BabyResponse>>({
      success: true,
      data: baby,
    });
  } catch (error) {
    console.error('Error updating baby:', error);
    return NextResponse.json<ApiResponse<BabyResponse>>(
      {
        success: false,
        error: 'Failed to update baby',
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
          error: 'Baby ID is required',
        },
        { status: 400 }
      );
    }

    // Soft delete by setting deletedAt
    await prisma.baby.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
    });
  } catch (error) {
    console.error('Error deleting baby:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to delete baby',
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
      const baby = await prisma.baby.findUnique({
        where: { 
          id,
          deletedAt: null,
        },
      });

      if (!baby) {
        return NextResponse.json<ApiResponse<BabyResponse>>(
          {
            success: false,
            error: 'Baby not found',
          },
          { status: 404 }
        );
      }

      return NextResponse.json<ApiResponse<BabyResponse>>({
        success: true,
        data: baby,
      });
    }

    const babies = await prisma.baby.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json<ApiResponse<BabyResponse[]>>({
      success: true,
      data: babies,
    });
  } catch (error) {
    console.error('Error fetching babies:', error);
    return NextResponse.json<ApiResponse<BabyResponse[]>>(
      {
        success: false,
        error: 'Failed to fetch babies',
      },
      { status: 500 }
    );
  }
}
