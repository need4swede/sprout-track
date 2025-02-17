import { NextResponse } from 'next/server';
import prisma from '@/app/api/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const babyId = searchParams.get('babyId');
  const type = searchParams.get('type');

  if (!babyId || !type) {
    return NextResponse.json(
      { success: false, error: 'Missing required parameters' },
      { status: 400 }
    );
  }

  try {
    const lastFeed = await prisma.feedLog.findFirst({
      where: {
        babyId,
        type: type as any,
        amount: { not: null }
      },
      orderBy: {
        time: 'desc'
      },
      select: {
        amount: true
      }
    });

    return NextResponse.json({
      success: true,
      data: lastFeed
    });
  } catch (error) {
    console.error('Error fetching last feed:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch last feed' },
      { status: 500 }
    );
  }
}
