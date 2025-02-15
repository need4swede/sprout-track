import { NextRequest, NextResponse } from 'next/server';
import prisma from '../db';
import { ApiResponse, NoteCreate, NoteResponse } from '../types';

export async function POST(req: NextRequest) {
  try {
    const body: NoteCreate = await req.json();
    
    const note = await prisma.note.create({
      data: {
        ...body,
        time: new Date(body.time),
      },
    });

    return NextResponse.json<ApiResponse<NoteResponse>>({
      success: true,
      data: note,
    });
  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json<ApiResponse<NoteResponse>>(
      {
        success: false,
        error: 'Failed to create note',
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const body: Partial<NoteCreate> = await req.json();

    if (!id) {
      return NextResponse.json<ApiResponse<NoteResponse>>(
        {
          success: false,
          error: 'Note ID is required',
        },
        { status: 400 }
      );
    }

    const note = await prisma.note.update({
      where: { id },
      data: {
        ...body,
        time: body.time ? new Date(body.time) : undefined,
      },
    });

    return NextResponse.json<ApiResponse<NoteResponse>>({
      success: true,
      data: note,
    });
  } catch (error) {
    console.error('Error updating note:', error);
    return NextResponse.json<ApiResponse<NoteResponse>>(
      {
        success: false,
        error: 'Failed to update note',
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
          error: 'Note ID is required',
        },
        { status: 400 }
      );
    }

    await prisma.note.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
    });
  } catch (error) {
    console.error('Error deleting note:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to delete note',
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
    const category = searchParams.get('category');

    const where = {
      deletedAt: null,
      ...(id && { id }),
      ...(babyId && { babyId }),
      ...(category && { category }),
      ...(startDate && endDate && {
        time: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      }),
    };

    if (id) {
      const note = await prisma.note.findFirst({
        where,
      });

      if (!note) {
        return NextResponse.json<ApiResponse<NoteResponse>>(
          {
            success: false,
            error: 'Note not found',
          },
          { status: 404 }
        );
      }

      return NextResponse.json<ApiResponse<NoteResponse>>({
        success: true,
        data: note,
      });
    }

    const notes = await prisma.note.findMany({
      where,
      orderBy: {
        time: 'desc',
      },
    });

    return NextResponse.json<ApiResponse<NoteResponse[]>>({
      success: true,
      data: notes,
    });
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json<ApiResponse<NoteResponse[]>>(
      {
        success: false,
        error: 'Failed to fetch notes',
      },
      { status: 500 }
    );
  }
}
