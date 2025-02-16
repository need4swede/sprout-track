import { NextRequest, NextResponse } from 'next/server';
import prisma from '../db';
import { ApiResponse, BabyCreate, BabyUpdate, BabyResponse } from '../types';
import { Gender } from '@prisma/client';
import { convertToUTC, formatLocalTime } from '../utils/timezone';

export async function POST(req: NextRequest) {
  try {
    const body: BabyCreate = await req.json();

    const baby = await prisma.baby.create({
      data: {
        ...body,
        birthDate: await convertToUTC(body.birthDate),
      },
    });

    // Format response with local timezone
    const response: BabyResponse = {
      ...baby,
      birthDate: await formatLocalTime(baby.birthDate),
      createdAt: await formatLocalTime(baby.createdAt),
      updatedAt: await formatLocalTime(baby.updatedAt),
      deletedAt: baby.deletedAt ? await formatLocalTime(baby.deletedAt) : null,
    };

    return NextResponse.json<ApiResponse<BabyResponse>>({
      success: true,
      data: response,
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

    const existingBaby = await prisma.baby.findUnique({
      where: { id },
    });

    if (!existingBaby) {
      return NextResponse.json<ApiResponse<BabyResponse>>(
        {
          success: false,
          error: 'Baby not found',
        },
        { status: 404 }
      );
    }

    const baby = await prisma.baby.update({
      where: { id },
      data: {
        ...updateData,
        birthDate: updateData.birthDate ? await convertToUTC(updateData.birthDate) : existingBaby.birthDate,
      },
    });

    // Format response with local timezone
    const response: BabyResponse = {
      ...baby,
      birthDate: await formatLocalTime(baby.birthDate),
      createdAt: await formatLocalTime(baby.createdAt),
      updatedAt: await formatLocalTime(baby.updatedAt),
      deletedAt: baby.deletedAt ? await formatLocalTime(baby.deletedAt) : null,
    };

    return NextResponse.json<ApiResponse<BabyResponse>>({
      success: true,
      data: response,
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

      // Format response with local timezone
      const response: BabyResponse = {
        ...baby,
        birthDate: await formatLocalTime(baby.birthDate),
        createdAt: await formatLocalTime(baby.createdAt),
        updatedAt: await formatLocalTime(baby.updatedAt),
        deletedAt: baby.deletedAt ? await formatLocalTime(baby.deletedAt) : null,
      };

      return NextResponse.json<ApiResponse<BabyResponse>>({
        success: true,
        data: response,
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

    // Format response with local timezone
    const response: BabyResponse[] = await Promise.all(
      babies.map(async (baby) => ({
        ...baby,
        birthDate: await formatLocalTime(baby.birthDate),
        createdAt: await formatLocalTime(baby.createdAt),
        updatedAt: await formatLocalTime(baby.updatedAt),
        deletedAt: baby.deletedAt ? await formatLocalTime(baby.deletedAt) : null,
      }))
    );

    return NextResponse.json<ApiResponse<BabyResponse[]>>({
      success: true,
      data: response,
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
