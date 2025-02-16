import { NextRequest, NextResponse } from 'next/server';
import prisma from '../db';
import { ApiResponse } from '../types';
import { Settings } from '@prisma/client';

export async function GET() {
  try {
    // Get the first settings record or create default
    let settings = await prisma.settings.findFirst();
    
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          familyName: 'My Family', // Default family name
          timezone: 'America/Chicago', // Default timezone
        },
      });
    }

    return NextResponse.json<ApiResponse<Settings>>({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json<ApiResponse<Settings>>(
      {
        success: false,
        error: 'Failed to fetch settings',
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const settings = await prisma.settings.create({
      data: {
        familyName: body.familyName,
        timezone: body.timezone,
      },
    });

    return NextResponse.json<ApiResponse<Settings>>({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('Error creating settings:', error);
    return NextResponse.json<ApiResponse<Settings>>(
      {
        success: false,
        error: 'Failed to create settings',
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Get the first settings record
    const existingSettings = await prisma.settings.findFirst();
    
    if (!existingSettings) {
      return NextResponse.json<ApiResponse<Settings>>(
        {
          success: false,
          error: 'Settings not found',
        },
        { status: 404 }
      );
    }

    const settings = await prisma.settings.update({
      where: { id: existingSettings.id },
      data: {
        familyName: body.familyName,
        timezone: body.timezone,
      },
    });

    return NextResponse.json<ApiResponse<Settings>>({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json<ApiResponse<Settings>>(
      {
        success: false,
        error: 'Failed to update settings',
      },
      { status: 500 }
    );
  }
}
