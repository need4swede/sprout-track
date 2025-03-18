import { NextRequest, NextResponse } from 'next/server';
import prisma from '../db';
import { ApiResponse, SleepLogResponse, FeedLogResponse, DiaperLogResponse, NoteResponse, BathLogResponse, PumpLogResponse } from '../types';
import { withAuth } from '../utils/auth';
import { convertUTCToTimezone } from '../utils/timezone';

// Extended activity types with caretaker information
type ActivityTypeWithCaretaker = (SleepLogResponse | FeedLogResponse | DiaperLogResponse | NoteResponse | BathLogResponse | PumpLogResponse) & { 
  caretakerId?: string | null;
  caretakerName?: string;
};

type ActivityType = ActivityTypeWithCaretaker;

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

async function handleGet(req: NextRequest) {
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
    // Get client timezone from query parameter
    const clientTimezone = searchParams.get('timezone');

    console.log(`API Request - babyId: ${babyId}, date: ${date}, startDate: ${startDate}, endDate: ${endDate}, timezone: ${clientTimezone}`);

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
    
    // Get recent activities from each type with caretaker information
    const [sleepLogs, feedLogs, diaperLogs, noteLogs, bathLogs, pumpLogs] = await Promise.all([
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
        include: {
          caretaker: true
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
        include: {
          caretaker: true
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
        include: {
          caretaker: true
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
        include: {
          caretaker: true
        },
        orderBy: { time: 'desc' },
        ...(useLimit && limit ? { take: limit } : {})
      }),
      prisma.bathLog.findMany({
        where: {
          babyId,
          ...(effectiveStartDate && effectiveEndDate ? {
            time: {
              gte: new Date(effectiveStartDate),
              lte: new Date(effectiveEndDate)
            }
          } : {})
        },
        include: {
          caretaker: true
        },
        orderBy: { time: 'desc' },
        ...(useLimit && limit ? { take: limit } : {})
      }),
      prisma.pumpLog.findMany({
        where: {
          babyId,
          ...(effectiveStartDate && effectiveEndDate ? {
            startTime: {
              gte: new Date(effectiveStartDate),
              lte: new Date(effectiveEndDate)
            }
          } : {})
        },
        include: {
          caretaker: true
        },
        orderBy: { startTime: 'desc' },
        ...(useLimit && limit ? { take: limit } : {})
      })
    ]);
    
    console.log(`Results - sleepLogs: ${sleepLogs.length}, feedLogs: ${feedLogs.length}, diaperLogs: ${diaperLogs.length}, noteLogs: ${noteLogs.length}, bathLogs: ${bathLogs.length}, pumpLogs: ${pumpLogs.length}`);

    // Format the responses with caretaker information
    const formattedSleepLogs: ActivityTypeWithCaretaker[] = sleepLogs
      .map(log => {
        // Create a new object without the caretaker property
        const { caretaker, ...logWithoutCaretaker } = log;
        
        // Format dates based on client timezone if provided
        let startTimeStr = log.startTime.toLocaleString();
        let endTimeStr = log.endTime?.toLocaleString() || null;
        let createdAtStr = log.createdAt.toLocaleString();
        let updatedAtStr = log.updatedAt.toLocaleString();
        let deletedAtStr = log.deletedAt?.toLocaleString() || null;
        
        if (clientTimezone) {
          startTimeStr = convertUTCToTimezone(log.startTime, clientTimezone);
          if (log.endTime) {
            endTimeStr = convertUTCToTimezone(log.endTime, clientTimezone);
          }
          createdAtStr = convertUTCToTimezone(log.createdAt, clientTimezone);
          updatedAtStr = convertUTCToTimezone(log.updatedAt, clientTimezone);
          if (log.deletedAt) {
            deletedAtStr = convertUTCToTimezone(log.deletedAt, clientTimezone);
          }
        }
        
        return {
          ...logWithoutCaretaker,
          startTime: startTimeStr,
          endTime: endTimeStr,
          createdAt: createdAtStr,
          updatedAt: updatedAtStr,
          deletedAt: deletedAtStr,
          caretakerId: log.caretakerId,
          caretakerName: log.caretaker ? log.caretaker.name : undefined,
        };
      });

    const formattedFeedLogs: ActivityTypeWithCaretaker[] = feedLogs
      .map(log => {
        // Create a new object without the caretaker property
        const { caretaker, ...logWithoutCaretaker } = log;
        
        // Format dates based on client timezone if provided
        let timeStr = log.time.toLocaleString();
        let createdAtStr = log.createdAt.toLocaleString();
        let updatedAtStr = log.updatedAt.toLocaleString();
        let deletedAtStr = log.deletedAt?.toLocaleString() || null;
        
        if (clientTimezone) {
          timeStr = convertUTCToTimezone(log.time, clientTimezone);
          createdAtStr = convertUTCToTimezone(log.createdAt, clientTimezone);
          updatedAtStr = convertUTCToTimezone(log.updatedAt, clientTimezone);
          if (log.deletedAt) {
            deletedAtStr = convertUTCToTimezone(log.deletedAt, clientTimezone);
          }
        }
        
        return {
          ...logWithoutCaretaker,
          time: timeStr,
          createdAt: createdAtStr,
          updatedAt: updatedAtStr,
          deletedAt: deletedAtStr,
          caretakerId: log.caretakerId,
          caretakerName: log.caretaker ? log.caretaker.name : undefined,
        };
      });

    const formattedDiaperLogs: ActivityTypeWithCaretaker[] = diaperLogs
      .map(log => {
        // Create a new object without the caretaker property
        const { caretaker, ...logWithoutCaretaker } = log;
        
        // Format dates based on client timezone if provided
        let timeStr = log.time.toLocaleString();
        let createdAtStr = log.createdAt.toLocaleString();
        let updatedAtStr = log.updatedAt.toLocaleString();
        let deletedAtStr = log.deletedAt?.toLocaleString() || null;
        
        if (clientTimezone) {
          timeStr = convertUTCToTimezone(log.time, clientTimezone);
          createdAtStr = convertUTCToTimezone(log.createdAt, clientTimezone);
          updatedAtStr = convertUTCToTimezone(log.updatedAt, clientTimezone);
          if (log.deletedAt) {
            deletedAtStr = convertUTCToTimezone(log.deletedAt, clientTimezone);
          }
        }
        
        return {
          ...logWithoutCaretaker,
          time: timeStr,
          createdAt: createdAtStr,
          updatedAt: updatedAtStr,
          deletedAt: deletedAtStr,
          caretakerId: log.caretakerId,
          caretakerName: log.caretaker ? log.caretaker.name : undefined,
        };
      });

    const formattedNoteLogs: ActivityTypeWithCaretaker[] = noteLogs
      .map(log => {
        // Create a new object without the caretaker property
        const { caretaker, ...logWithoutCaretaker } = log;
        
        // Format dates based on client timezone if provided
        let timeStr = log.time.toLocaleString();
        let createdAtStr = log.createdAt.toLocaleString();
        let updatedAtStr = log.updatedAt.toLocaleString();
        let deletedAtStr = log.deletedAt?.toLocaleString() || null;
        
        if (clientTimezone) {
          timeStr = convertUTCToTimezone(log.time, clientTimezone);
          createdAtStr = convertUTCToTimezone(log.createdAt, clientTimezone);
          updatedAtStr = convertUTCToTimezone(log.updatedAt, clientTimezone);
          if (log.deletedAt) {
            deletedAtStr = convertUTCToTimezone(log.deletedAt, clientTimezone);
          }
        }
        
        return {
          ...logWithoutCaretaker,
          time: timeStr,
          createdAt: createdAtStr,
          updatedAt: updatedAtStr,
          deletedAt: deletedAtStr,
          caretakerId: log.caretakerId,
          caretakerName: log.caretaker ? log.caretaker.name : undefined,
        };
      });
      
    const formattedBathLogs: ActivityTypeWithCaretaker[] = bathLogs
      .map(log => {
        // Create a new object without the caretaker property
        const { caretaker, ...logWithoutCaretaker } = log;
        
        // Format dates based on client timezone if provided
        let timeStr = log.time.toLocaleString();
        let createdAtStr = log.createdAt.toLocaleString();
        let updatedAtStr = log.updatedAt.toLocaleString();
        let deletedAtStr = log.deletedAt?.toLocaleString() || null;
        
        if (clientTimezone) {
          timeStr = convertUTCToTimezone(log.time, clientTimezone);
          createdAtStr = convertUTCToTimezone(log.createdAt, clientTimezone);
          updatedAtStr = convertUTCToTimezone(log.updatedAt, clientTimezone);
          if (log.deletedAt) {
            deletedAtStr = convertUTCToTimezone(log.deletedAt, clientTimezone);
          }
        }
        
        return {
          ...logWithoutCaretaker,
          time: timeStr,
          createdAt: createdAtStr,
          updatedAt: updatedAtStr,
          deletedAt: deletedAtStr,
          caretakerId: log.caretakerId,
          caretakerName: log.caretaker ? log.caretaker.name : undefined,
        };
      });
      
    const formattedPumpLogs: ActivityTypeWithCaretaker[] = pumpLogs
      .map(log => {
        // Create a new object without the caretaker property
        const { caretaker, ...logWithoutCaretaker } = log;
        
        // Format dates based on client timezone if provided
        let startTimeStr = log.startTime.toLocaleString();
        let endTimeStr = log.endTime?.toLocaleString() || null;
        let createdAtStr = log.createdAt.toLocaleString();
        let updatedAtStr = log.updatedAt.toLocaleString();
        let deletedAtStr = log.deletedAt?.toLocaleString() || null;
        
        if (clientTimezone) {
          startTimeStr = convertUTCToTimezone(log.startTime, clientTimezone);
          if (log.endTime) {
            endTimeStr = convertUTCToTimezone(log.endTime, clientTimezone);
          }
          createdAtStr = convertUTCToTimezone(log.createdAt, clientTimezone);
          updatedAtStr = convertUTCToTimezone(log.updatedAt, clientTimezone);
          if (log.deletedAt) {
            deletedAtStr = convertUTCToTimezone(log.deletedAt, clientTimezone);
          }
        }
        
        return {
          ...logWithoutCaretaker,
          startTime: startTimeStr,
          endTime: endTimeStr,
          createdAt: createdAtStr,
          updatedAt: updatedAtStr,
          deletedAt: deletedAtStr,
          caretakerId: log.caretakerId,
          caretakerName: log.caretaker ? log.caretaker.name : undefined,
        };
      });

    // Combine and sort all activities
    const allActivities = [
      ...formattedSleepLogs,
      ...formattedFeedLogs,
      ...formattedDiaperLogs,
      ...formattedNoteLogs,
      ...formattedBathLogs,
      ...formattedPumpLogs
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

// Apply authentication middleware to all handlers
// Use type assertions to handle the multiple return types
export const GET = withAuth(handleGet as (req: NextRequest) => Promise<NextResponse<ApiResponse<any>>>);
