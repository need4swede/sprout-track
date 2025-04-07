import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '../../types';

/**
 * API endpoint to get the IDLE_TIME value from environment variables
 */
export async function GET(req: NextRequest) {
  // Get the IDLE_TIME value from environment variables, default to 30 minutes (1800 seconds)
  const idleTime = parseInt(process.env.IDLE_TIME || '1800', 10);
  
  return NextResponse.json<ApiResponse<number>>(
    {
      success: true,
      data: idleTime
    }
  );
}
