import { NextRequest, NextResponse } from 'next/server';
import prisma from '../db';
import { ApiResponse, ActivitySettings } from '../types';
import { withAuth } from '../utils/auth';

/**
 * GET /api/activity-settings
 * 
 * Retrieves activity settings for the current user
 * If caretakerId is provided, retrieves settings for that caretaker
 * Otherwise, retrieves global settings
 */
async function getActivitySettings(req: NextRequest): Promise<NextResponse<ApiResponse<ActivitySettings>>> {
  try {
    // Get caretakerId from query params if provided
    const url = new URL(req.url);
    const caretakerId = url.searchParams.get('caretakerId');
    
    // Get settings from database
    const settings = await prisma.settings.findFirst({
      where: { id: { not: '' } }, // Get any settings record
      orderBy: { updatedAt: 'desc' },
    });

    // Use type assertion to access activitySettings
    const settingsWithActivity = settings as unknown as (typeof settings & { activitySettings?: string });
    
    if (!settingsWithActivity || !settingsWithActivity.activitySettings) {
      // Return default settings if none found
      const defaultSettings: ActivitySettings = {
        order: ['sleep', 'feed', 'diaper', 'note', 'bath', 'pump'],
        visible: ['sleep', 'feed', 'diaper', 'note', 'bath', 'pump'],
        caretakerId: caretakerId || null,
      };
      return NextResponse.json({ success: true, data: defaultSettings });
    }

    // Parse stored settings
    const allSettings = JSON.parse(settingsWithActivity.activitySettings!);
    
    // If caretakerId is provided, try to get caretaker-specific settings
    if (caretakerId) {
      // If caretaker-specific settings exist, return them
      if (allSettings[caretakerId]) {
        return NextResponse.json({ 
          success: true, 
          data: {
            ...allSettings[caretakerId],
            caretakerId
          }
        });
      }
      
      // If no caretaker-specific settings exist but global settings do, return global settings
      // This ensures caretakers get default settings until they customize them
      if (allSettings.global) {
        return NextResponse.json({ 
          success: true, 
          data: {
            ...allSettings.global,
            caretakerId // Still include the caretakerId so it's saved with their settings
          }
        });
      }
    }
    
    // Return global settings or default if no settings exist
    return NextResponse.json({ 
      success: true, 
      data: {
        ...(allSettings.global || {
          order: ['sleep', 'feed', 'diaper', 'note', 'bath', 'pump'],
          visible: ['sleep', 'feed', 'diaper', 'note', 'bath', 'pump']
        }),
        caretakerId: null
      }
    });
  } catch (error) {
    console.error('Error retrieving activity settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve activity settings' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/activity-settings
 * 
 * Saves activity settings for the current user
 * If caretakerId is provided in the body, saves settings for that caretaker
 * Otherwise, saves global settings
 */
async function saveActivitySettings(req: NextRequest): Promise<NextResponse<ApiResponse<ActivitySettings>>> {
  try {
    const body = await req.json();
    const { order, visible, caretakerId } = body as ActivitySettings;

    // Validate input
    if (!order || !Array.isArray(order) || !visible || !Array.isArray(visible)) {
      return NextResponse.json(
        { success: false, error: 'Invalid activity settings format' },
        { status: 400 }
      );
    }

    // Get current settings
    const currentSettings = await prisma.settings.findFirst({
      where: { id: { not: '' } },
      orderBy: { updatedAt: 'desc' },
    });

    // Use type assertion to access activitySettings
    const currentSettingsWithActivity = currentSettings as unknown as (typeof currentSettings & { activitySettings?: string });
    
    // Parse existing activity settings or create new object
    let allSettings = {};
    if (currentSettingsWithActivity?.activitySettings) {
      try {
        allSettings = JSON.parse(currentSettingsWithActivity.activitySettings);
      } catch (e) {
        console.error('Error parsing existing activity settings:', e);
      }
    }

    // Update settings for the specific caretaker or global settings
    const settingsKey = caretakerId || 'global';
    allSettings = {
      ...allSettings,
      [settingsKey]: {
        order,
        visible
      }
    };

    // Save to database using type assertion for the data object
    const updatedSettings = await prisma.settings.update({
      where: { id: currentSettings?.id || '' },
      data: {
        // Use type assertion to allow activitySettings property
        ...(({ activitySettings: JSON.stringify(allSettings) }) as any)
      }
    });

    return NextResponse.json({ 
      success: true, 
      data: {
        order,
        visible,
        caretakerId: caretakerId || null
      }
    });
  } catch (error) {
    console.error('Error saving activity settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save activity settings' },
      { status: 500 }
    );
  }
}

// Export handlers with authentication
export const GET = withAuth(getActivitySettings);
export const POST = withAuth(saveActivitySettings);
