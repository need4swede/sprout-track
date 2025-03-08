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
    // Get the full URL to debug
    const fullUrl = req.url;
    console.log(`Full request URL: ${fullUrl}`);
    
    const url = new URL(req.url);
    const { searchParams } = url;
    
    // Log all search parameters for debugging
    console.log("All search parameters:");
    Array.from(searchParams.entries()).forEach(([key, value]) => {
      console.log(`${key}: ${value}`);
    });
    
    const babyId = searchParams.get('babyId');
    const limit = Number(searchParams.get('limit')) || 200;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const date = searchParams.get('date');

    console.log(`API Request - babyId: ${babyId}, date: ${date}, startDate: ${startDate}, endDate: ${endDate}`);

    // If a single date is provided, create start and end dates for that day
    let effectiveStartDate = startDate;
    let effectiveEndDate = endDate;
    let useLimit = true;
    
    if (date) {
      console.log(`Processing date parameter: ${date}`);
      try {
        // Parse the date string to ensure it's valid
        const selectedDate = new Date(date);
        
        if (!isNaN(selectedDate.getTime())) {
          // Set start date to beginning of the day in local time
          const dayStart = new Date(selectedDate);
          dayStart.setHours(0, 0, 0, 0);
          effectiveStartDate = dayStart.toISOString();
          
          // Set end date to end of the day in local time
          const dayEnd = new Date(selectedDate);
          dayEnd.setHours(23, 59, 59, 999);
          effectiveEndDate = dayEnd.toISOString();
          
          // Don't use limit when filtering by date
          useLimit = false;
          
          console.log(`Date range created: ${effectiveStartDate} to ${effectiveEndDate}`);
        } else {
          console.log(`Invalid date format: ${date}`);
        }
      } catch (error) {
        console.error(`Error processing date parameter: ${error}`);
      }
    } else if (startDate && endDate) {
      // Don't use limit when filtering by date range
      useLimit = false;
      console.log(`Using date range: ${startDate} to ${endDate}`);
    } else {
      console.log(`No date parameters provided, using limit: ${limit}`);
    }

    if (!babyId) {
      return NextResponse.json<ApiResponse<ActivityType[]>>(
        {
          success: false,
          error: 'Baby ID is required',
        },
        { status: 400 }
      );
    }

    // Log query parameters
    console.log(`Query parameters - useLimit: ${useLimit}, limit: ${limit}`);
    console.log(`Date filtering: ${effectiveStartDate ? 'Yes' : 'No'}`);
    console.log(`Effective start date: ${effectiveStartDate}`);
    console.log(`Effective end date: ${effectiveEndDate}`);
    
    // Get recent activities from each type
    const [sleepLogs, feedLogs, diaperLogs, noteLogs] = await Promise.all([
      prisma.sleepLog.findMany({
        where: {
          babyId,
          ...(effectiveStartDate && effectiveEndDate ? {
            OR: [
              // Sleep logs that start within the date range
              {
                startTime: {
                  gte: new Date(effectiveStartDate),
                  lte: new Date(effectiveEndDate)
                }
              },
              // Sleep logs that end within the date range
              {
                endTime: {
                  gte: new Date(effectiveStartDate),
                  lte: new Date(effectiveEndDate)
                }
              },
              // Sleep logs that span the date range
              {
                startTime: { lte: new Date(effectiveStartDate) },
                endTime: { gte: new Date(effectiveEndDate) }
              }
            ]
          } : {})
        },
        orderBy: { startTime: 'desc' },
        ...(useLimit && limit ? { take: limit } : {})
      }),
      prisma.feedLog.findMany({
        where: {
          babyId,
          ...(effectiveStartDate && effectiveEndDate ? {
            time: {
              gte: new Date(effectiveStartDate),
              lte: new Date(effectiveEndDate)
            }
          } : {})
        },
        orderBy: { time: 'desc' },
        ...(useLimit && limit ? { take: limit } : {})
      }),
      prisma.diaperLog.findMany({
        where: {
          babyId,
          ...(effectiveStartDate && effectiveEndDate ? {
            time: {
              gte: new Date(effectiveStartDate),
              lte: new Date(effectiveEndDate)
            }
          } : {})
        },
        orderBy: { time: 'desc' },
        ...(useLimit && limit ? { take: limit } : {})
      }),
      prisma.note.findMany({
        where: {
          babyId,
          ...(effectiveStartDate && effectiveEndDate ? {
            time: {
              gte: new Date(effectiveStartDate),
              lte: new Date(effectiveEndDate)
            }
          } : {})
        },
        orderBy: { time: 'desc' },
        ...(useLimit && limit ? { take: limit } : {})
      })
    ]);
    
    console.log(`Results - sleepLogs: ${sleepLogs.length}, feedLogs: ${feedLogs.length}, diaperLogs: ${diaperLogs.length}, noteLogs: ${noteLogs.length}`);

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
    .sort((a, b) => getActivityTime(b) - getActivityTime(a));
    
    // Only apply the limit if we're not filtering by date
    const finalActivities = useLimit ? allActivities.slice(0, limit) : allActivities;
    
    console.log(`Final activities count: ${finalActivities.length}`);

    return NextResponse.json<ApiResponse<ActivityType[]>>({
      success: true,
      data: finalActivities
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
