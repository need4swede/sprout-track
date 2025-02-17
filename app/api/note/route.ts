import { NextRequest, NextResponse } from 'next/server';
import prisma from '../db';
import { ApiResponse, NoteCreate, NoteResponse } from '../types';

export async function POST(req: NextRequest) {
  try {
    const body: NoteCreate = await req.json();
    
    // Ensure time is saved as local time
    const localTime = new Date(body.time);
    const note = await prisma.note.create({
      data: {
        ...body,
        time: localTime,
      },
    });

    const response: NoteResponse = {
      ...note,
      time: body.time,
      createdAt: note.createdAt.toLocaleString(),
      updatedAt: note.updatedAt.toLocaleString(),
      deletedAt: note.deletedAt?.toLocaleString() || null,
    };

    return NextResponse.json<ApiResponse<NoteResponse>>({
      success: true,
      data: response,
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

    const existingNote = await prisma.note.findUnique({
      where: { id },
    });

    if (!existingNote) {
      return NextResponse.json<ApiResponse<NoteResponse>>(
        {
          success: false,
          error: 'Note not found',
        },
        { status: 404 }
      );
    }

    // Ensure time is saved as local time if provided
    const data = body.time
      ? { ...body, time: new Date(body.time) }
      : body;

    const note = await prisma.note.update({
      where: { id },
      data,
    });

    const response: NoteResponse = {
      ...note,
      time: body.time || existingNote.time.toLocaleString(),
      createdAt: note.createdAt.toLocaleString(),
      updatedAt: note.updatedAt.toLocaleString(),
      deletedAt: note.deletedAt?.toLocaleString() || null,
    };

    return NextResponse.json<ApiResponse<NoteResponse>>({
      success: true,
      data: response,
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

export async function GET(req: NextRequest) {
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
      const note = await prisma.note.findUnique({
        where: { id },
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

      const response: NoteResponse = {
        ...note,
        time: note.time.toLocaleString(),
        createdAt: note.createdAt.toLocaleString(),
        updatedAt: note.updatedAt.toLocaleString(),
        deletedAt: note.deletedAt?.toLocaleString() || null,
      };

      return NextResponse.json<ApiResponse<NoteResponse>>({
        success: true,
        data: response,
      });
    }

    const notes = await prisma.note.findMany({
      where: queryParams,
      orderBy: {
        time: 'desc',
      },
    });

    const response: NoteResponse[] = notes.map(note => ({
      ...note,
      time: note.time.toLocaleString(),
      createdAt: note.createdAt.toLocaleString(),
      updatedAt: note.updatedAt.toLocaleString(),
      deletedAt: note.deletedAt?.toLocaleString() || null,
    }));

    return NextResponse.json<ApiResponse<NoteResponse[]>>({
      success: true,
      data: response,
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

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json<ApiResponse<void>>(
        {
          success: false,
          error: 'Note ID is required',
        },
        { status: 400 }
      );
    }

    await prisma.note.delete({
      where: { id },
    });

    return NextResponse.json<ApiResponse<void>>({
      success: true,
    });
  } catch (error) {
    console.error('Error deleting note:', error);
    return NextResponse.json<ApiResponse<void>>(
      {
        success: false,
        error: 'Failed to delete note',
      },
      { status: 500 }
    );
  }
}
