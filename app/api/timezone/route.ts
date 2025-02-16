import { NextRequest, NextResponse } from 'next/server';
import { convertToUTC, formatLocalTime } from '../utils/timezone';
import { ApiResponse } from '../types';

export async function GET() {
  try {
    const localTime = await formatLocalTime(new Date());
    return NextResponse.json<ApiResponse<{ localTime: string }>>({
      success: true,
      data: { localTime },
    });
  } catch (error) {
    console.error('Error getting local time:', error);
    return NextResponse.json<ApiResponse<{ localTime: string }>>({
      success: false,
      error: 'Failed to get local time',
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { date } = await req.json();
    const utcDate = await convertToUTC(date);
    
    return NextResponse.json<ApiResponse<{ utcDate: Date }>>({
      success: true,
      data: { utcDate },
    });
  } catch (error) {
    console.error('Error converting to UTC:', error);
    return NextResponse.json<ApiResponse<{ utcDate: Date }>>({
      success: false,
      error: 'Failed to convert to UTC',
    }, { status: 500 });
  }
}
