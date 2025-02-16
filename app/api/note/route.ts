import { NextRequest, NextResponse } from 'next/server';
import prisma from '../db';
import { ApiResponse, NoteCreate, NoteResponse } from '../types';
import { convertToUTC, formatLocalTime } from '../utils/timezone';

export async function POST(req: NextRequest) {
  try {
    const body: NoteCreate = await req.json();
    
    const note = await prisma.note.create({
      data: {
        ...body,
        time: await convertToUTC(body.time),
      },
    });

    // Format response with local timezone
    const response: NoteResponse = {
      ...note,
      time: await formatLocalTime(note.time),
      createdAt: await formatLocalTime(note.createdAt),
      updatedAt: await formatLocalTime(note.updatedAt),
      deletedAt: note.deletedAt ? await formatLocalTime(note.deletedAt) : null,
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

    const note = await prisma.note.update({
      where: { id },
      data: {
        ...body,
        time: body.time ? await convertToUTC(body.time) : existingNote.time,
      },
    });

    // Format response with local timezone
    const response: NoteResponse = {
      ...note,
      time: await formatLocalTime(note.time),
      createdAt: await formatLocalTime(note.createdAt),
      updatedAt: await formatLocalTime(note.updatedAt),
      deletedAt: note.deletedAt ? await formatLocalTime(note.deletedAt) : null,
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
    const category = searchParams.get('category');

    const queryParams = {
      ...(babyId && { babyId }),
      ...(category && { category }),
      ...(startDate && endDate && {
        time: {
          gte: await convertToUTC(startDate),
          lte: await convertToUTC(endDate),
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

      // Format response with local timezone
      const response: NoteResponse = {
        ...note,
        time: await formatLocalTime(note.time),
        createdAt: await formatLocalTime(note.createdAt),
        updatedAt: await formatLocalTime(note.updatedAt),
        deletedAt: note.deletedAt ? await formatLocalTime(note.deletedAt) : null,
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

    // Format response with local timezone
    const response: NoteResponse[] = await Promise.all(
      notes.map(async (note) => ({
        ...note,
        time: await formatLocalTime(note.time),
        createdAt: await formatLocalTime(note.createdAt),
        updatedAt: await formatLocalTime(note.updatedAt),
        deletedAt: note.deletedAt ? await formatLocalTime(note.deletedAt) : null,
      }))
    );

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
