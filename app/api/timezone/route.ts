import { NextRequest, NextResponse } from 'next/server';
import { convertToUTC, formatLocalTime, convertUTCToTimezone, getSettings } from '../utils/timezone';
import { ApiResponse } from '../types';

export async function GET(req: NextRequest) {
  try {
    // Get client timezone from query parameter
    const searchParams = req.nextUrl.searchParams;
    const clientTimezone = searchParams.get('timezone') || 'UTC';
    
    const localTime = await formatLocalTime(new Date());
    const settings = await getSettings();
    
    return NextResponse.json<ApiResponse<{ 
      localTime: string,
      serverTimezone: string,
      clientTime: string 
    }>>({
      success: true,
      data: { 
        localTime,
        serverTimezone: settings.timezone,
        clientTime: convertUTCToTimezone(new Date(), clientTimezone)
      },
    });
  } catch (error) {
    console.error('Error getting time information:', error);
    return NextResponse.json<ApiResponse<any>>({
      success: false,
      error: 'Failed to get time information',
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { date, clientTimezone } = await req.json();
    const utcDate = await convertToUTC(date);
    
    // If client timezone is provided, also return the date in client timezone
    let clientDate = null;
    if (clientTimezone) {
      clientDate = convertUTCToTimezone(utcDate, clientTimezone);
    }
    
    return NextResponse.json<ApiResponse<{ utcDate: Date, clientDate?: string }>>({
      success: true,
      data: { 
        utcDate,
        ...(clientDate && { clientDate })
      },
    });
  } catch (error) {
    console.error('Error converting to UTC:', error);
    return NextResponse.json<ApiResponse<{ utcDate: Date }>>({
      success: false,
      error: 'Failed to convert to UTC',
    }, { status: 500 });
  }
}
