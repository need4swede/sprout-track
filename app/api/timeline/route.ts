import { NextRequest, NextResponse } from 'next/server';
import prisma from '../db';
import { ApiResponse, SleepLogResponse, FeedLogResponse, DiaperLogResponse, NoteResponse } from '../types';

type ActivityType = SleepLogResponse | FeedLogResponse | DiaperLogResponse | NoteResponse;

const getActivityTime = (activity: any): number => {
  if ('time' in activity && activity.time) {
    return new Date(activity.time).getTime();
  }
  if ('startTime' in activity && activity.startTime) {
    if ('duration' in activity && activity.endTime) {
      return new Date(activity.endTime).getTime();
    }
    return new Date(activity.startTime).getTime();
  }
  return new Date().getTime();
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const babyId = searchParams.get('babyId');
    const limit = Number(searchParams.get('limit')) || 200;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!babyId) {
      return NextResponse.json<ApiResponse<ActivityType[]>>(
        {
          success: false,
          error: 'Baby ID is required',
        },
        { status: 400 }
      );
    }

    // Get recent activities from each type
    const [sleepLogs, feedLogs, diaperLogs, noteLogs] = await Promise.all([
      prisma.sleepLog.findMany({
        where: { 
          babyId,
          ...(startDate && endDate ? {
            startTime: {
              gte: startDate,
              lte: endDate
            }
          } : {})
        },
        orderBy: { startTime: 'desc' },
        ...(limit && !startDate ? { take: limit } : {})
      }),
      prisma.feedLog.findMany({
        where: { 
          babyId,
          ...(startDate && endDate ? {
            time: {
              gte: startDate,
              lte: endDate
            }
          } : {})
        },
        orderBy: { time: 'desc' },
        ...(limit && !startDate ? { take: limit } : {})
      }),
      prisma.diaperLog.findMany({
        where: { 
          babyId,
          ...(startDate && endDate ? {
            time: {
              gte: startDate,
              lte: endDate
            }
          } : {})
        },
        orderBy: { time: 'desc' },
        ...(limit && !startDate ? { take: limit } : {})
      }),
      prisma.note.findMany({
        where: { 
          babyId,
          ...(startDate && endDate ? {
            time: {
              gte: startDate,
              lte: endDate
            }
          } : {})
        },
        orderBy: { time: 'desc' },
        ...(limit && !startDate ? { take: limit } : {})
      })
    ]);

    // Format the responses
    const formattedSleepLogs: SleepLogResponse[] = sleepLogs.map(log => ({
      ...log,
      startTime: log.startTime.toLocaleString(),
      endTime: log.endTime?.toLocaleString() || null,
      createdAt: log.createdAt.toLocaleString(),
      updatedAt: log.updatedAt.toLocaleString(),
      deletedAt: log.deletedAt?.toLocaleString() || null,
    }));

    const formattedFeedLogs: FeedLogResponse[] = feedLogs.map(log => ({
      ...log,
      time: log.time.toLocaleString(),
      createdAt: log.createdAt.toLocaleString(),
      updatedAt: log.updatedAt.toLocaleString(),
      deletedAt: log.deletedAt?.toLocaleString() || null,
    }));

    const formattedDiaperLogs: DiaperLogResponse[] = diaperLogs.map(log => ({
      ...log,
      time: log.time.toLocaleString(),
      createdAt: log.createdAt.toLocaleString(),
      updatedAt: log.updatedAt.toLocaleString(),
      deletedAt: log.deletedAt?.toLocaleString() || null,
    }));

    const formattedNoteLogs: NoteResponse[] = noteLogs.map(log => ({
      ...log,
      time: log.time.toLocaleString(),
      createdAt: log.createdAt.toLocaleString(),
      updatedAt: log.updatedAt.toLocaleString(),
      deletedAt: log.deletedAt?.toLocaleString() || null,
    }));

    // Combine and sort all activities
    const allActivities = [
      ...formattedSleepLogs,
      ...formattedFeedLogs,
      ...formattedDiaperLogs,
      ...formattedNoteLogs
    ]
    .sort((a, b) => getActivityTime(b) - getActivityTime(a))
    .slice(0, limit);

    return NextResponse.json<ApiResponse<ActivityType[]>>({
      success: true,
      data: allActivities
    });
  } catch (error) {
    console.error('Error fetching timeline:', error);
    return NextResponse.json<ApiResponse<ActivityType[]>>(
      {
        success: false,
        error: 'Failed to fetch timeline',
      },
      { status: 500 }
    );
  }
}
